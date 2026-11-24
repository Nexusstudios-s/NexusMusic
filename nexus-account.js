import { getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

(function () {
  'use strict';

  var status = document.getElementById('nexus-account-status');
  var form = document.getElementById('nexus-account-form');
  var emailInput = document.getElementById('nexus-account-email');
  var passwordInput = document.getElementById('nexus-account-password');
  var signInButton = document.getElementById('nexus-account-sign-in');
  var signUpButton = document.getElementById('nexus-account-sign-up');
  var googleButton = document.getElementById('nexus-account-google');
  var signOutButton = document.getElementById('nexus-account-sign-out');
  var syncButton = document.getElementById('nexus-account-sync');
  var accountName = document.getElementById('nexus-account-name');
  var localLibraryKey = 'nexusmusic.web.library.v1';
  var cloudLibraryKeyPrefix = 'nexusmusic.web.cloud-library.v1.';
  var user = null;
  var authentication = null;
  var database = null;
  var busy = false;

  function showStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  }

  function setBusy(value) {
    busy = value;
    [signInButton, signUpButton, googleButton, signOutButton, syncButton].forEach(function (button) {
      if (button) button.disabled = value;
    });
  }

  function renderAccount() {
    var signedIn = Boolean(user);
    form.hidden = signedIn;
    signOutButton.hidden = !signedIn;
    syncButton.hidden = !signedIn;
    accountName.hidden = !signedIn;
    if (signedIn) {
      accountName.textContent = user.displayName || user.email || 'Sesión iniciada';
      showStatus('Cuenta Nexus conectada. La biblioteca se sincroniza con tus dispositivos.', false);
    }
  }

  function toTrack(songId, data) {
    if (typeof songId !== 'string' || !data || typeof data.title !== 'string' ||
        typeof data.artist !== 'string') return null;
    var duration = Number(data.duration);
    var track = {
      id: songId,
      title: data.title,
      artist: data.artist,
      thumbnail: typeof data.thumbnailUrl === 'string' ? data.thumbnailUrl : '',
      duration: Number.isFinite(duration) && duration > 0
        ? Math.floor(duration / 60) + ':' + String(Math.floor(duration % 60)).padStart(2, '0')
        : ''
    };
    if (/^[A-Za-z0-9_-]{11}$/.test(songId)) {
      track.provider = 'youtube';
      return track;
    }
    if (/^au:[A-Za-z0-9_-]{1,80}$/.test(songId)) {
      track.provider = 'audius';
      track.url = 'https://audius.co';
      return track;
    }
    return null;
  }

  function isCloudTrack(track) {
    return track && typeof track.id === 'string' &&
      (/^[A-Za-z0-9_-]{11}$/.test(track.id) || /^au:[A-Za-z0-9_-]{1,80}$/.test(track.id)) &&
      typeof track.title === 'string' && typeof track.artist === 'string';
  }

  function readLocalTracks() {
    try {
      var value = JSON.parse(localStorage.getItem(localLibraryKey) || '[]');
      return Array.isArray(value) ? value.filter(isCloudTrack) : [];
    } catch (error) {
      console.error('No se pudo leer la biblioteca local para sincronizar.', error);
      throw new Error('No se pudo leer la biblioteca de este navegador.');
    }
  }

  function isCloudSongId(songId) {
    return typeof songId === 'string' &&
      (/^[A-Za-z0-9_-]{11}$/.test(songId) || /^au:[A-Za-z0-9_-]{1,80}$/.test(songId));
  }

  function readKnownCloudTrackIds(uid) {
    var serialized;
    try {
      serialized = localStorage.getItem(cloudLibraryKeyPrefix + uid);
    } catch (error) {
      console.error('No se pudo leer el estado local de sincronización.', error);
      throw new Error('No se pudo leer el estado de sincronización de Biblioteca Nexus.');
    }
    if (!serialized) return new Set();

    try {
      var ids = JSON.parse(serialized);
      if (!Array.isArray(ids) || ids.some(function (id) { return !isCloudSongId(id); })) {
        throw new Error('El estado de sincronización no tiene un formato válido.');
      }
      return new Set(ids);
    } catch (error) {
      console.error('El estado local de sincronización de Biblioteca Nexus está dañado.', error);
      throw new Error('No se pudo leer el estado de sincronización de Biblioteca Nexus.');
    }
  }

  function saveKnownCloudTrackIds(uid, ids) {
    try {
      localStorage.setItem(cloudLibraryKeyPrefix + uid, JSON.stringify(Array.from(ids)));
    } catch (error) {
      console.error('No se pudo guardar el estado local de sincronización.', error);
      throw new Error('La biblioteca se sincronizó, pero no se pudo guardar el estado local.');
    }
  }

  async function syncLibrary() {
    if (!user || busy) return;
    var account = user;
    setBusy(true);
    showStatus('Sincronizando tu Biblioteca Nexus…', false);
    try {
      var knownCloudIds = readKnownCloudTrackIds(account.uid);
      var snapshot = await getDocs(collection(database, 'users', account.uid, 'nexusLibrary'));
      var remoteEntries = snapshot.docs.slice().sort(function (left, right) {
        var leftData = left.data();
        var rightData = right.data();
        var leftOrder = Number(leftData.webSortOrder);
        var rightOrder = Number(rightData.webSortOrder);
        var hasLeftOrder = Number.isFinite(leftOrder) && leftOrder >= 0;
        var hasRightOrder = Number.isFinite(rightOrder) && rightOrder >= 0;
        if (hasLeftOrder && hasRightOrder && leftOrder !== rightOrder) return leftOrder - rightOrder;
        if (hasLeftOrder !== hasRightOrder) return hasLeftOrder ? -1 : 1;
        return (Number(rightData.savedAt) || 0) - (Number(leftData.savedAt) || 0);
      });
      var remote = remoteEntries.map(function (entry) {
        return toTrack(entry.id, entry.data());
      }).filter(Boolean);
      var remoteIds = new Set(remote.map(function (track) { return track.id; }));
      var localTracks = readLocalTracks();
      var merged = new Map(remote.map(function (track) { return [track.id, track]; }));
      localTracks.forEach(function (track) {
        if (!knownCloudIds.has(track.id) && !remoteIds.has(track.id)) merged.set(track.id, track);
      });

      var tracks = Array.from(merged.values()).slice(0, 500);
      var additions = localTracks.filter(function (track) {
        return !knownCloudIds.has(track.id) && !remoteIds.has(track.id);
      });
      var cloudTracks = tracks.filter(isCloudTrack);
      if (cloudTracks.length) {
        var batch = writeBatch(database);
        cloudTracks.forEach(function (track, index) {
          var reference = doc(database, 'users', account.uid, 'nexusLibrary', track.id);
          var fields = {
            songId: track.id,
            title: track.title.slice(0, 200),
            artist: track.artist.slice(0, 160),
            thumbnailUrl: /^https:\/\//i.test(track.thumbnail) ? track.thumbnail : null,
            duration: Math.max(0, Math.floor(durationSeconds(track.duration))),
            webSortOrder: index
          };
          if (remoteIds.has(track.id)) {
            batch.update(reference, { webSortOrder: index });
          } else {
            fields.savedAt = Date.now();
            batch.set(reference, fields, { merge: true });
          }
        });
        await batch.commit();
      }

      var syncedIds = new Set(remoteIds);
      additions.forEach(function (track) { syncedIds.add(track.id); });
      saveKnownCloudTrackIds(account.uid, syncedIds);

      if (!user || user.uid !== account.uid) return;
      window.dispatchEvent(new CustomEvent('nexus:cloud-library-loaded', {
        detail: { tracks: tracks, authoritative: true }
      }));
      showStatus('Biblioteca Nexus sincronizada: ' + tracks.length + ' canciones.', false);
    } catch (error) {
      console.error('No se pudo sincronizar Biblioteca Nexus.', error);
      showStatus(error.message || 'No se pudo sincronizar la Biblioteca Nexus.', true);
    } finally {
      setBusy(false);
    }
  }

  function durationSeconds(value) {
    var parts = String(value || '').split(':').map(Number);
    if (parts.length < 2 || parts.length > 3 || parts.some(function (part) { return !Number.isFinite(part); })) return 0;
    return parts.reduce(function (total, part) { return total * 60 + part; }, 0);
  }

  async function saveTrack(track, sortOrder) {
    if (!user || !isCloudTrack(track)) return;
    var account = user;
    var reference = doc(database, 'users', account.uid, 'nexusLibrary', track.id);
    var saved = await getDoc(reference);
    var previous = saved.exists() ? saved.data() : {};
    var order = Number(sortOrder);
    await setDoc(reference, {
      songId: track.id,
      title: track.title.slice(0, 200),
      artist: track.artist.slice(0, 160),
      thumbnailUrl: /^https:\/\//i.test(track.thumbnail) ? track.thumbnail : null,
      duration: Math.max(0, Math.floor(durationSeconds(track.duration))),
      savedAt: previous.savedAt || Date.now(),
      webSortOrder: Number.isFinite(order) && order >= 0 ? Math.floor(order) : 0
    }, { merge: true });
  }

  async function updateLibraryOrder(tracks) {
    if (!user || !Array.isArray(tracks)) return;
    var account = user;
    var snapshot = await getDocs(collection(database, 'users', account.uid, 'nexusLibrary'));
    var existingIds = new Set(snapshot.docs.map(function (entry) { return entry.id; }));
    var cloudTracks = tracks.filter(function (track) {
      return isCloudTrack(track) && existingIds.has(track.id);
    });
    if (!cloudTracks.length) return;
    var batch = writeBatch(database);
    cloudTracks.forEach(function (track, index) {
      batch.update(doc(database, 'users', account.uid, 'nexusLibrary', track.id), {
        webSortOrder: index
      });
    });
    await batch.commit();
  }

  async function removeTrack(songId) {
    if (!user || !(/^[A-Za-z0-9_-]{11}$/.test(songId) || /^au:[A-Za-z0-9_-]{1,80}$/.test(songId))) return;
    await deleteDoc(doc(database, 'users', user.uid, 'nexusLibrary', songId));
  }

  async function ensureProfile(account, displayName) {
    var reference = doc(database, 'users', account.uid);
    var saved = await getDoc(reference);
    if (saved.exists()) return;
    await setDoc(reference, {
      uid: account.uid,
      displayName: displayName || account.displayName || (account.email || 'Nexus').split('@')[0],
      email: account.email || null,
      photoUrl: account.photoURL || null,
      nexusPlus: false,
      isDeveloper: false,
      updatedAt: serverTimestamp()
    });
  }

  async function authenticate(createAccount) {
    if (busy) return;
    var email = emailInput.value.trim();
    var password = passwordInput.value;
    if (!email || !password) {
      showStatus('Escribe tu correo y contraseña.', true);
      return;
    }
    if (createAccount && password.length < 6) {
      showStatus('La contraseña debe tener al menos 6 caracteres.', true);
      return;
    }
    setBusy(true);
    showStatus(createAccount ? 'Creando tu cuenta Nexus…' : 'Iniciando sesión…', false);
    try {
      var credential = createAccount
        ? await createUserWithEmailAndPassword(authentication, email, password)
        : await signInWithEmailAndPassword(authentication, email, password);
      if (createAccount) {
        var displayName = email.split('@')[0];
        await updateProfile(credential.user, { displayName: displayName });
      }
      await ensureProfile(credential.user, credential.user.displayName || email.split('@')[0]);
      passwordInput.value = '';
      user = credential.user;
      renderAccount();
      setBusy(false);
      await syncLibrary();
    } catch (error) {
      console.error('No se pudo autenticar la cuenta Nexus.', error);
      var messages = {
        'auth/invalid-credential': 'Correo o contraseña incorrectos.',
        'auth/email-already-in-use': 'Ese correo ya tiene una cuenta Nexus.',
        'auth/invalid-email': 'Escribe un correo válido.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento y vuelve a probar.',
        'auth/operation-not-allowed': 'Activa Email/Contraseña en los proveedores de Firebase Authentication.'
      };
      showStatus(messages[error.code] || error.message || 'No se pudo iniciar sesión.', true);
      setBusy(false);
    }
  }

  async function authenticateWithGoogle() {
    if (busy) return;
    setBusy(true);
    showStatus('Conectando con Google…', false);
    var auth = authentication;
    var provider = new GoogleAuthProvider();
    try {
      if (window.matchMedia('(max-width: 700px)').matches) {
        await signInWithRedirect(auth, provider);
        return;
      }
      var credential = await signInWithPopup(auth, provider);
      user = credential.user;
      await ensureProfile(user, user.displayName || (user.email || 'Nexus').split('@')[0]);
      renderAccount();
      setBusy(false);
      await syncLibrary();
    } catch (error) {
      console.error('No se pudo iniciar sesión con Google.', error);
      var messages = {
        'auth/account-exists-with-different-credential': 'Ese correo ya usa otro método de inicio de sesión. Entra con ese método.',
        'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes o inténtalo en otro navegador.',
        'auth/popup-closed-by-user': 'Se cerró la ventana de inicio de sesión.',
        'auth/unauthorized-domain': 'Agrega este dominio en Firebase Authentication → Authorized domains.',
        'auth/operation-not-allowed': 'Activa Google en los proveedores de Firebase Authentication.'
      };
      showStatus(messages[error.code] || error.message || 'No se pudo iniciar sesión con Google.', true);
      setBusy(false);
    }
  }

  function mount() {
    var config = window.NEXUS_FIREBASE_CONFIG;
    if (!config || !config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
      form.hidden = true;
      signOutButton.hidden = true;
      syncButton.hidden = true;
      accountName.hidden = true;
      showStatus('Falta registrar una app web Firebase. Sigue los pasos de configuración de landing/README.md.', true);
      return;
    }

    if (!googleButton) {
      googleButton = document.createElement('button');
      googleButton.id = 'nexus-account-google';
      googleButton.type = 'button';
      googleButton.className = 'button secondary';
      googleButton.textContent = 'Continuar con Google';
      form.querySelector('.nexus-account-form__actions').appendChild(googleButton);
    }

    try {
      var app = getApps().find(function (firebaseApp) {
        return firebaseApp.name === '[DEFAULT]';
      }) || initializeApp(config);
      if (app.options.projectId !== config.projectId || app.options.apiKey !== config.apiKey) {
        throw new Error('Ya existe una app Firebase predeterminada de otro proyecto.');
      }
      database = getFirestore(app);
      authentication = getAuth(app);
      var auth = authentication;
      onAuthStateChanged(auth, function (nextUser) {
        user = nextUser;
        renderAccount();
        if (user) {
          void syncLibrary();
        } else {
          showStatus('Inicia sesión con la misma cuenta de NexusMusic para sincronizar tu biblioteca.', false);
        }
      }, function (error) {
        console.error('No se pudo leer la sesión de Firebase.', error);
        showStatus('No se pudo comprobar la sesión de Firebase.', true);
      });
      getRedirectResult(auth).then(function (credential) {
        if (!credential) return;
        user = credential.user;
        return ensureProfile(user, user.displayName || (user.email || 'Nexus').split('@')[0])
          .then(function () {
            renderAccount();
            return syncLibrary();
          });
      }).catch(function (error) {
        console.error('No se pudo completar el inicio de sesión de Google.', error);
        showStatus(error.message || 'No se pudo completar el inicio de sesión de Google.', true);
      });
    } catch (error) {
      console.error('No se pudo iniciar Firebase para NexusMusic Web.', error);
      form.hidden = true;
      showStatus('La configuración de Firebase Web no es válida.', true);
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      void authenticate(false);
    });
    signUpButton.addEventListener('click', function () { void authenticate(true); });
    googleButton.addEventListener('click', function () { void authenticateWithGoogle(); });
    signOutButton.addEventListener('click', async function () {
      if (busy) return;
      setBusy(true);
      try {
        await signOut(auth);
        showStatus('Sesión cerrada.', false);
      } catch (error) {
        console.error('No se pudo cerrar la sesión Nexus.', error);
        showStatus('No se pudo cerrar la sesión.', true);
      } finally {
        setBusy(false);
      }
    });
    syncButton.addEventListener('click', function () { void syncLibrary(); });
  }

  window.NexusAccount = Object.freeze({
    syncLibrary: syncLibrary,
    isSignedIn: function () { return Boolean(user); },
    saveTrack: saveTrack,
    updateLibraryOrder: updateLibraryOrder,
    removeTrack: removeTrack
  });
  mount();
})();

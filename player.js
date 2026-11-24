
    (function () {
      var params = new URLSearchParams(location.search);
      var videoId = params.get("v") || "";
      if (!/^[A-Za-z0-9_-]{11}$/.test(videoId) || params.get("web") === "1" || !/Android/i.test(navigator.userAgent)) return;
      var fallback = new URL(location.href);
      fallback.searchParams.set("web", "1");
      fallback.searchParams.set("v", videoId);
      location.href = "intent://www.youtube.com/watch?v=" + encodeURIComponent(videoId) +
        "#Intent;scheme=https;package=com.nexusforge.music;S.browser_fallback_url=" +
        encodeURIComponent(fallback.href) + ";end";
    })();
  
(function () {
  "use strict";

  var input = document.getElementById("track-input");
  if (!input) return;

  var form = document.getElementById("track-form");
  var results = document.getElementById("search-results");
  var status = document.getElementById("player-status");
  var resultsTitle = document.getElementById("results-title");
  var resultsEyebrow = document.getElementById("results-eyebrow");
  var host = document.getElementById("player-host");
  var placeholder = document.getElementById("player-placeholder");
  var titleLabel = document.getElementById("now-title");
  var artistLabel = document.getElementById("now-artist");
  var artwork = document.getElementById("now-artwork");
  var artworkPlaceholder = document.getElementById("now-placeholder");
  var playButton = document.getElementById("toggle-play");
  var previousButton = document.getElementById("previous-track");
  var nextButton = document.getElementById("next-track");
  var progress = document.getElementById("playback-progress");
  var currentTimeLabel = document.getElementById("current-time");
  var durationLabel = document.getElementById("duration-time");
  var queueElement = document.getElementById("track-queue");
  var queueCount = document.getElementById("queue-count");
  var sidebarQueueCount = document.getElementById("sidebar-queue-count");
  var clearQueueButton = document.getElementById("clear-queue");
  var clearRecentButton = document.getElementById("clear-recent");
  var incomingButton = document.getElementById("play-incoming");
  var playlistForm = document.getElementById("playlist-form");
  var playlistNameInput = document.getElementById("playlist-name");
  var navButtons = Array.prototype.slice.call(document.querySelectorAll(".web-app__nav"));
  var views = {
    home: document.getElementById("home-view"),
    search: document.getElementById("search-view"),
    library: document.getElementById("library-view"),
    favorites: document.getElementById("favorites-view"),
    playlists: document.getElementById("playlists-view"),
    history: document.getElementById("history-view"),
    queue: document.getElementById("queue-view")
  };
  var viewTitles = {
    home: "Inicio",
    search: "Buscar",
    library: "Biblioteca",
    favorites: "Favoritos",
    playlists: "Playlists",
    history: "Historial",
    queue: "Cola"
  };
  var storageKeys = {
    queue: "nexusmusic.web.queue.v1",
    recent: "nexusmusic.web.recent.v1",
    library: "nexusmusic.web.library.v1",
    favorites: "nexusmusic.web.favorites.v1",
    playlists: "nexusmusic.web.playlists.v1"
  };
  var videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
  var discordHosts = new Set(["cdn.discordapp.com", "media.discordapp.net"]);
  var maxQueueSize = 100;
  var queue = readStoredList(storageKeys.queue, maxQueueSize);
  var recent = readStoredList(storageKeys.recent, 50);
  var library = readStoredList(storageKeys.library, 500);
  var favorites = readStoredList(storageKeys.favorites, 500);
  var playlists = readPlaylists();
  var searchToken = 0;
  var searchController = null;
  var lastSearchTracks = [];
  var player = null;
  var playerReady = false;
  var currentTrackId = "";
  var currentView = "home";
  var activePlaylistId = "";
  var incomingTrack = null;
  var isSeeking = false;
  var params = new URLSearchParams(location.search);
  var incomingId = params.get("v") || "";
  var currentTrack = null, mode = "idle", playbackFailed = false, pendingYouTube = null;
  var audio = new Audio(); audio.preload = "metadata";
  var cover = document.getElementById("audio-cover"), failure = document.getElementById("playback-fallback");
  var sourceLink = document.getElementById("source-link"), panelSource = document.getElementById("panel-source");
  var fallbackOpen = document.getElementById("fallback-open"), fallbackSearch = document.getElementById("fallback-search");
  function directAudio(url) {
    try { var u = new URL(url); return u.protocol === "https:" && !u.username && !u.password && !u.port && discordHosts.has(u.hostname) && /^\/attachments\/\d+\/\d+\/[^/]+\.(mp3|m4a|aac|ogg|opus|wav|flac|webm)$/i.test(u.pathname) ? u.href : ""; } catch (_) { return ""; }
  }
  function isTrack(track) {
    return track && typeof track.title === "string" && typeof track.artist === "string" && (track.provider === "audius" ? /^au:[A-Za-z0-9_-]{1,80}$/.test(track.id || "") : track.provider === "discord" ? /^dc:[a-f0-9]{16}$/.test(track.id || "") && !!directAudio(track.audioUrl) : videoIdPattern.test(track.id || ""));
  }
  function sourceName(track) { return track.provider === "audius" ? "Audius" : track.provider === "discord" ? "Discord · audio" : "YouTube"; }
  function sourceUrl(track) {
    if (track.provider === "discord") return directAudio(track.audioUrl);
    if (track.provider === "audius") { try { var u = new URL(track.url); if (u.origin === "https://audius.co") return u.href; } catch (_) {} return "https://audius.co"; }
    return "https://www.youtube.com/watch?v=" + encodeURIComponent(track.id);
  }
  function streamUrl(track) { return track.provider === "discord" ? directAudio(track.audioUrl) : "https://api.audius.co/v1/tracks/" + encodeURIComponent(track.id.slice(3)) + "/stream?app_name=NexusMusic"; }
  function youtubeId(raw) {
    if (videoIdPattern.test(raw) && raw.length===11) return raw;
    try { var u = new URL(raw); if (u.protocol !== "https:") return ""; var id = u.hostname === "youtu.be" ? u.pathname.split("/")[1] : ["youtube.com","www.youtube.com","m.youtube.com","music.youtube.com"].includes(u.hostname) ? (u.searchParams.get("v") || (/^\/(shorts|embed|live)\//.test(u.pathname) ? u.pathname.split("/")[2] : "")) : ""; return videoIdPattern.test(id || "") ? id : ""; } catch (_) { return ""; }
  }
  function youtubeTrack(id, title, artist) { return {id:id, title:title || "Canción compartida", artist:artist || "YouTube · enlace compartido", thumbnail:"https://i.ytimg.com/vi/" + id + "/hqdefault.jpg", duration:""}; }
  function discordTrack(url, title, artist) { var path = new URL(url).pathname; var a=2166136261,b=0x9e3779b9; for(var i=0;i<path.length;i++){a=Math.imul(a^path.charCodeAt(i),16777619);b=Math.imul(b^path.charCodeAt(i),2246822519);} var id="dc:"+(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0"); var name=path.split("/").pop(); try{name=decodeURIComponent(name);}catch(_){} return {id:id,provider:"discord",audioUrl:url,title:title||name,artist:artist||"Archivo compartido desde Discord",thumbnail:"",duration:""}; }
  function parseShared(raw, title, artist) { var url=directAudio(raw); if(url)return discordTrack(url,title,artist); var id=youtubeId(raw); return id ? youtubeTrack(id,title,artist) : null; }
  function syncButton(playing) { playButton.textContent = playing ? "Ⅱ" : "▶"; playButton.setAttribute("aria-label",playing?"Pausar":"Reproducir"); document.body.classList.toggle("is-playing",playing); }
  function resetProgress(){progress.value="0";currentTimeLabel.textContent="0:00";durationLabel.textContent="0:00";}
  function showFailure(message) { if(!currentTrack)return; playbackFailed=true; pendingYouTube=null; syncButton(false); resetProgress(); if(player&&playerReady&&mode==="youtube")try{player.stopVideo();}catch(_){} if(mode==="audio")audio.pause(); cover.hidden=true; placeholder.hidden=true; var frame=document.getElementById("player-host");if(frame)frame.hidden=true; failure.hidden=false; document.getElementById("fallback-message").textContent=message; fallbackOpen.href=sourceUrl(currentTrack); fallbackOpen.textContent=currentTrack.provider==="discord"?"Abrir archivo ↗":currentTrack.provider==="audius"?"Abrir Audius ↗":"Abrir en YouTube ↗"; fallbackSearch.hidden=currentTrack.title==="Canción compartida"; playButton.disabled=false; setStatus(message,true); }
  function prepareTrack(track, autoplay) {
    pendingYouTube=null; mode="switching"; audio.pause(); audio.removeAttribute("src"); audio.load(); if(player&&playerReady)try{player.stopVideo();}catch(_){} playbackFailed=false; failure.hidden=true; resetProgress(); syncButton(false); setCurrentTrack(track); playButton.disabled=false; placeholder.hidden=true;
    var frame=document.getElementById("player-host");
    if(track.provider==="audius"||track.provider==="discord") {mode="audio"; if(frame)frame.hidden=true; cover.hidden=false; document.getElementById("panel-cover").src=track.thumbnail||"assets/Nexus-logo.png"; audio.src=streamUrl(track); audio.volume=Number(document.getElementById("volume-control").value)/100; if(autoplay)startAudio();}
    else {mode="youtube";cover.hidden=true;if(frame)frame.hidden=false; if(autoplay){pendingYouTube=track.id;if(playerReady&&player){pendingYouTube=null;player.loadVideoById(track.id);}else{setStatus("Cargando reproductor de YouTube…");loadYouTubeApi();}}else{placeholder.hidden=false;if(frame)frame.hidden=true;}}
  }
  function startAudio(){var id=currentTrackId; audio.play().catch(function(error){if(mode!=="audio"||currentTrackId!==id||error.name==="AbortError")return; if(error.name==="NotAllowedError"){syncButton(false);setStatus("Pulsa reproducir para iniciar el audio.");}else showFailure("No se pudo reproducir este audio. Puede no estar disponible o el enlace haber caducado.");});}
  function enrichYouTube(track){if(track.provider||track.title!=="Canción compartida")return;fetch("/api/music-search?v="+encodeURIComponent(track.id)).then(function(r){return r.ok?r.json():null;}).then(function(d){if(!d||!d.title)return;track.title=d.title;track.artist=d.artist||track.artist;if(currentTrackId===track.id&&currentTrack===track){setCurrentTrack(track);if(playbackFailed)fallbackSearch.hidden=false;}if(incomingTrack===track)incomingButton.textContent="▶ Reproducir: "+track.title;}).catch(function(){});}


  function readStoredList(key, limit) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(value)) return [];
      return value.filter(function (track) {
        return isTrack(track);
      }).slice(0, limit);
    } catch (error) {
      console.warn("No se pudo leer la biblioteca local de NexusMusic Web.", error);
      return [];
    }
  }

  function readPlaylists() {
    try {
      var value = JSON.parse(localStorage.getItem(storageKeys.playlists) || "[]");
      if (!Array.isArray(value)) return [];
      return value.filter(function (playlist) {
        return playlist && typeof playlist.id === "string" &&
          typeof playlist.name === "string" && Array.isArray(playlist.tracks);
      }).map(function (playlist) {
        return {
          id: playlist.id,
          name: playlist.name.slice(0, 40),
          tracks: playlist.tracks.filter(function (track) {
            return isTrack(track);
          }).slice(0, 500),
          createdAt: Number(playlist.createdAt) || Date.now()
        };
      });
    } catch (error) {
      console.warn("No se pudieron leer las playlists locales de NexusMusic Web.", error);
      return [];
    }
  }

  function persist(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("No se pudieron guardar los cambios locales de NexusMusic Web.", error);
      setStatus("El navegador no permitió guardar los cambios. Revisa el espacio disponible.", true);
      return false;
    }
  }

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("is-error", Boolean(isError));
  }

  function getApiErrorMessage(error, statusCode) {
    if (typeof error === "string" && error.trim()) return error.trim();
    if (error && typeof error === "object") {
      if (typeof error.message === "string" && error.message.trim()) return error.message.trim();
      if (typeof error.error_description === "string" && error.error_description.trim()) return error.error_description.trim();
      if (typeof error.detail === "string" && error.detail.trim()) return error.detail.trim();
      if (typeof error.error === "string" && error.error.trim()) return error.error.trim();
      if (error.error && typeof error.error === "object") {
        var nestedMessage = getApiErrorMessage(error.error);
        if (nestedMessage !== "No se pudo completar la búsqueda. Inténtalo de nuevo.") return nestedMessage;
      }
      if (Array.isArray(error.errors)) {
        var messages = error.errors.map(function (item) {
          if (typeof item === "string") return item;
          return item && typeof item.message === "string" ? item.message : "";
        }).filter(Boolean);
        if (messages.length) return messages.join(" ");
      }
    }
    if (statusCode === 401 || statusCode === 403) {
      return "El servicio de música rechazó la búsqueda. Revisa la configuración de la API.";
    }
    if (statusCode === 429) return "Hay demasiadas búsquedas por ahora. Espera un momento e inténtalo otra vez.";
    if (statusCode >= 500) return "El servidor de búsqueda tuvo un problema. Inténtalo de nuevo en unos minutos.";
    return "No se pudo completar la búsqueda. Inténtalo de nuevo.";
  }

  function saveList(key, value, limit) {
    if (persist(key, value.slice(0, limit))) return true;
    return false;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    var total = Math.floor(seconds);
    return Math.floor(total / 60) + ":" + String(total % 60).padStart(2, "0");
  }

  function createArtwork(track, className) {
    var image = document.createElement("img");
    image.className = className || "";
    image.alt = "";
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.src = track.thumbnail && /^https:\/\//i.test(track.thumbnail)
      ? track.thumbnail
      : (track.provider ? "assets/Nexus-logo.png" : "https://i.ytimg.com/vi/" + encodeURIComponent(track.id) + "/hqdefault.jpg");
    image.onerror = function () {
      image.onerror = null;
      image.src = "assets/Nexus-logo.png";
    };
    return image;
  }

  function setCurrentTrack(track) {
    currentTrackId = track.id;
    currentTrack=track; panelSource.textContent=sourceName(track); sourceLink.href=sourceUrl(track); sourceLink.hidden=false;
    titleLabel.textContent = track.title;
    artistLabel.textContent = track.artist;
    document.getElementById("panel-track").textContent = track.title;
    document.getElementById("panel-artist").textContent = track.artist;
    if (track.thumbnail && /^https:\/\//i.test(track.thumbnail)) {
      artwork.src = track.thumbnail;
      artwork.hidden = false;
      artworkPlaceholder.hidden = true;
    } else {
      artwork.removeAttribute("src");
      artwork.hidden = true;
      artworkPlaceholder.hidden = false;
    }
    renderQueue();
  }

  function refreshViews() {
    renderTracks(document.getElementById("home-recent-results"), recent.slice(0, 8), { recent: true, compact: true });
    renderTracks(document.getElementById("home-library-results"), library.slice(0, 8), { compact: true });
    renderPlaylistCards(document.getElementById("home-playlists"), playlists.slice(0, 4), true);
    renderTracks(results, lastSearchTracks, {});
    renderSongList(document.getElementById("library-list"), library, "library");
    renderSongList(document.getElementById("favorites-list"), favorites, "favorites");
    renderSongList(document.getElementById("history-list"), recent, "history");
    renderPlaylistCards(document.getElementById("playlist-grid"), playlists, false);
    renderQueue();
    renderActivePlaylist();
  }

  function addToQueue(track, silent) {
    if (queue.some(function (item) { return item.id === track.id; })) {
      if (!silent) setStatus("Esa canción ya está en la cola.");
      return false;
    }
    if (queue.length >= maxQueueSize) {
      if (!silent) setStatus("La cola llegó a su límite de 100 canciones.", true);
      return false;
    }
    queue.push(track);
    if (!saveList(storageKeys.queue, queue, maxQueueSize)) {
      queue.pop();
      return false;
    }
    renderQueue();
    if (!silent) setStatus("Añadida a la cola.");
    return true;
  }

  function addToLibrary(track) {
    if (library.some(function (item) { return item.id === track.id; })) {
      setStatus("Esa canción ya está en tu biblioteca.");
      return;
    }
    library.unshift(track);
    if (!saveList(storageKeys.library, library, 500)) {
      library.shift();
      return;
    }
    refreshViews();
    setStatus("Guardada en tu biblioteca.");
  }

  function toggleFavorite(track) {
    var index = favorites.findIndex(function (item) { return item.id === track.id; });
    if (index >= 0) favorites.splice(index, 1);
    else favorites.unshift(track);
    if (!saveList(storageKeys.favorites, favorites, 500)) {
      if (index >= 0) favorites.splice(index, 0, track);
      else favorites.shift();
      return;
    }
    refreshViews();
    setStatus(index >= 0 ? "Quitada de favoritos." : "Añadida a favoritos.");
  }

  function addToPlaylist(playlistId, track) {
    var playlist = playlists.find(function (item) { return item.id === playlistId; });
    if (!playlist) return;
    if (playlist.tracks.some(function (item) { return item.id === track.id; })) {
      setStatus("Esa canción ya está en “" + playlist.name + "”.");
      return;
    }
    if (playlist.tracks.length >= 500) {
      setStatus("Esta playlist llegó al límite de 500 canciones.", true);
      return;
    }
    playlist.tracks.push(track);
    if (!persist(storageKeys.playlists, playlists)) {
      playlist.tracks.pop();
      return;
    }
    refreshViews();
    setStatus("Añadida a “" + playlist.name + "”.");
  }

  function rememberTrack(track) {
    var previous = recent;
    recent = [track].concat(recent.filter(function (item) { return item.id !== track.id; })).slice(0, 50);
    if (saveList(storageKeys.recent, recent, 50)) refreshViews();
    else recent = previous;
  }

  function playTrack(track) {
    if (!isTrack(track)) return;
    if (!queue.some(function (item) { return item.id === track.id; })) {
      if (queue.length >= maxQueueSize) {
        setStatus("La cola está llena. Quita una canción antes de reproducir otra.", true);
        return;
      }
      queue.push(track);
      if (!saveList(storageKeys.queue, queue, maxQueueSize)) {
        queue.pop();
        return;
      }
    }
    if(track.provider==="discord"){queue=queue.map(function(t){return t.id===track.id?track:t;});saveList(storageKeys.queue,queue,maxQueueSize);}
    setStatus("");
    prepareTrack(track, true);
    rememberTrack(track);
    enrichYouTube(track);
    updateQueueCount();
  }

  function renderTracks(container, tracks, options) {
    if (!container) return;
    options = options || {};
    container.replaceChildren();
    if (!tracks.length) {
      var empty = document.createElement("p");
      empty.className = "web-player__empty";
      empty.textContent = options.recent
        ? "Cuando escuches música aparecerá aquí."
        : options.error
          ? "No se pudieron cargar resultados. Revisa la conexión o vuelve a intentarlo."
        : "Todavía no hay canciones. Busca algo y guárdalo en tu colección.";
      container.appendChild(empty);
      return;
    }

    tracks.forEach(function (track) {
      var card = document.createElement("article");
      card.className = "web-song";
      if (options.compact) card.classList.add("web-song--compact");
      var image = document.createElement("div");
      image.className = "web-song__art";
      image.appendChild(createArtwork(track));
      var title = document.createElement("div");
      title.className = "web-song__title";
      title.textContent = track.title;
      title.title = track.title;
      var artist = document.createElement("div");
      artist.className = "web-song__artist";
      artist.textContent = track.artist + " · " + sourceName(track) + (track.duration ? " · " + track.duration : "");
      artist.title = track.artist;
      var actions = document.createElement("div");
      actions.className = "web-song__actions";
      var play = document.createElement("button");
      play.type = "button";
      play.className = "primary";
      play.textContent = "▶ Escuchar";
      play.addEventListener("click", function () { playTrack(track); });
      var actionBar = document.createElement("div");
      actionBar.className = "web-song__quick-actions";
      actionBar.append(
        createIconButton("＋", "Guardar en biblioteca", function () { addToLibrary(track); }),
        createIconButton(favorites.some(function (item) { return item.id === track.id; }) ? "♥" : "♡",
          favorites.some(function (item) { return item.id === track.id; }) ? "Quitar de favoritos" : "Añadir a favoritos",
          function () { toggleFavorite(track); }),
        createIconButton("≡", "Añadir a la cola", function () { addToQueue(track, false); })
      );
      if (playlists.length && !options.compact) {
        var select = document.createElement("select");
        select.className = "web-song__playlist-select";
        select.setAttribute("aria-label", "Añadir " + track.title + " a una playlist");
        var placeholderOption = document.createElement("option");
        placeholderOption.value = "";
        placeholderOption.textContent = "＋ Lista";
        select.appendChild(placeholderOption);
        playlists.forEach(function (playlist) {
          var option = document.createElement("option");
          option.value = playlist.id;
          option.textContent = playlist.name;
          select.appendChild(option);
        });
        select.addEventListener("change", function () {
          if (select.value) addToPlaylist(select.value, track);
          select.value = "";
        });
        actionBar.appendChild(select);
      }
      actions.append(play, actionBar);
      card.append(image, title, artist, actions);
      container.appendChild(card);
    });
  }

  function createIconButton(label, title, callback) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "web-song__icon-button";
    button.textContent = label;
    button.title = title;
    button.setAttribute("aria-label", title);
    button.addEventListener("click", callback);
    return button;
  }

  function renderSongList(container, tracks, mode) {
    if (!container) return;
    container.replaceChildren();
    if (!tracks.length) {
      var empty = document.createElement("div");
      empty.className = "web-list-empty";
      var symbol = document.createElement("span");
      symbol.textContent = "♫";
      var heading = document.createElement("strong");
      heading.textContent = "Tu espacio musical está esperando";
      var message = document.createElement("p");
      message.textContent = "Busca música y guarda las canciones que quieras tener a mano.";
      empty.append(symbol, heading, message);
      var go = document.createElement("button");
      go.type = "button";
      go.className = "primary";
      go.textContent = "Explorar música";
      go.addEventListener("click", function () { setView("search"); });
      empty.appendChild(go);
      container.appendChild(empty);
      return;
    }
    tracks.forEach(function (track, index) {
      var row = document.createElement("article");
      row.className = "web-song-row";
      var number = document.createElement("span");
      number.className = "web-song-row__number";
      number.textContent = String(index + 1).padStart(2, "0");
      var image = createArtwork(track, "web-song-row__art");
      var meta = document.createElement("div");
      meta.className = "web-song-row__meta";
      var title = document.createElement("strong");
      title.textContent = track.title;
      var artist = document.createElement("span");
      artist.textContent = track.artist;
      meta.append(title, artist);
      var play = document.createElement("button");
      play.type = "button";
      play.className = "web-song-row__play";
      play.textContent = "▶";
      play.setAttribute("aria-label", "Reproducir " + track.title);
      play.addEventListener("click", function () { playTrack(track); });
      var actions = document.createElement("div");
      actions.className = "web-song-row__actions";
      if (mode === "library") {
        actions.appendChild(createIconButton("♡", "Añadir a favoritos", function () { toggleFavorite(track); }));
      } else if (mode === "favorites") {
        actions.appendChild(createIconButton("♥", "Quitar de favoritos", function () { toggleFavorite(track); }));
      }
      if (mode !== "history") {
        actions.appendChild(createIconButton("≡", "Añadir a la cola", function () { addToQueue(track, false); }));
      }
      if (mode === "library" || mode === "favorites") {
        actions.appendChild(createIconButton("×", "Quitar de " + (mode === "library" ? "la biblioteca" : "favoritos"), function () {
          var list = mode === "library" ? library : favorites;
          var key = mode === "library" ? storageKeys.library : storageKeys.favorites;
          var old = list.slice();
          list.splice(list.findIndex(function (item) { return item.id === track.id; }), 1);
          if (!persist(key, list)) {
            list.splice.apply(list, [0, list.length].concat(old));
            return;
          }
          refreshViews();
          setStatus(mode === "library" ? "Quitada de tu biblioteca." : "Quitada de favoritos.");
        }));
      }
      var duration = document.createElement("span");
      duration.className = "web-song-row__duration";
      duration.textContent = track.duration || "";
      row.append(number, image, meta, duration, play, actions);
      container.appendChild(row);
    });
  }

  function renderPlaylistCards(container, list, compact) {
    if (!container) return;
    container.replaceChildren();
    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "web-player__empty";
      empty.textContent = "Todavía no tienes playlists. Crea una para organizar tu música.";
      container.appendChild(empty);
      return;
    }
    list.forEach(function (playlist) {
      var card = document.createElement("article");
      card.className = "web-playlist-card" + (compact ? " web-playlist-card--compact" : "");
      var open = document.createElement("button");
      open.type = "button";
      open.className = "web-playlist-card__open";
      var art = document.createElement("span");
      art.className = "web-playlist-card__art";
      if (playlist.tracks[0]) art.appendChild(createArtwork(playlist.tracks[0]));
      else art.textContent = "♫";
      var name = document.createElement("strong");
      name.textContent = playlist.name;
      var count = document.createElement("span");
      count.textContent = playlist.tracks.length + (playlist.tracks.length === 1 ? " canción" : " canciones");
      open.append(art, name, count);
      open.addEventListener("click", function () {
        activePlaylistId = playlist.id;
        setView("playlists");
        renderActivePlaylist();
        document.getElementById("playlist-detail").hidden = false;
        document.getElementById("playlist-detail").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      card.appendChild(open);
      if (!compact) {
        var remove = createIconButton("×", "Eliminar playlist " + playlist.name, function () {
            var previous = playlists;
            playlists = playlists.filter(function (item) { return item.id !== playlist.id; });
            if (!persist(storageKeys.playlists, playlists)) {
              playlists = previous;
              return;
            }
          if (activePlaylistId === playlist.id) activePlaylistId = "";
          refreshViews();
          setStatus("Playlist eliminada.");
        });
        card.appendChild(remove);
      }
      container.appendChild(card);
    });
  }

  function renderActivePlaylist() {
    var detail = document.getElementById("playlist-detail");
    if (!detail) return;
    var playlist = playlists.find(function (item) { return item.id === activePlaylistId; });
    if (!playlist) {
      detail.hidden = true;
      return;
    }
    detail.hidden = false;
    document.getElementById("playlist-detail-title").textContent = playlist.name;
    var container = document.getElementById("playlist-track-list");
    container.replaceChildren();
    if (!playlist.tracks.length) {
      var empty = document.createElement("div");
      empty.className = "web-list-empty web-list-empty--small";
      empty.textContent = "Esta playlist está vacía. Busca canciones y usa “＋ Lista” para añadirlas.";
      container.appendChild(empty);
      return;
    }
    playlist.tracks.forEach(function (track, index) {
      var row = document.createElement("article");
      row.className = "web-song-row";
      var number = document.createElement("span");
      number.className = "web-song-row__number";
      number.textContent = String(index + 1).padStart(2, "0");
      var image = createArtwork(track, "web-song-row__art");
      var meta = document.createElement("div");
      meta.className = "web-song-row__meta";
      var title = document.createElement("strong");
      title.textContent = track.title;
      var artist = document.createElement("span");
      artist.textContent = track.artist;
      meta.append(title, artist);
      var play = document.createElement("button");
      play.type = "button";
      play.className = "web-song-row__play";
      play.textContent = "▶";
      play.setAttribute("aria-label", "Reproducir " + track.title);
      play.addEventListener("click", function () { playTrack(track); });
      var remove = createIconButton("×", "Quitar de " + playlist.name, function () {
        var oldTracks = playlist.tracks.slice();
        playlist.tracks.splice(index, 1);
        if (persist(storageKeys.playlists, playlists)) refreshViews();
        else playlist.tracks = oldTracks;
      });
      var actions = document.createElement("div");
      actions.className = "web-song-row__actions";
      actions.appendChild(remove);
      row.append(number, image, meta, play, actions);
      container.appendChild(row);
    });
  }

  function updateQueueCount() {
    queueCount.textContent = queue.length
      ? queue.length + (queue.length === 1 ? " canción en la cola" : " canciones en la cola")
      : "Cola vacía";
    sidebarQueueCount.textContent = String(queue.length);
  }

  function renderQueue() {
    queueElement.replaceChildren();
    if (!queue.length) {
      var empty = document.createElement("li");
      empty.className = "web-list-empty web-list-empty--small";
      empty.textContent = "Tu cola está vacía. Añade canciones desde Buscar, tu Biblioteca o tus Playlists.";
      queueElement.appendChild(empty);
    }
    queue.forEach(function (track, index) {
      var item = document.createElement("li");
      item.className = "web-player__queue-item" + (track.id === currentTrackId ? " is-current" : "");
      var image = createArtwork(track);
      var meta = document.createElement("div");
      meta.className = "web-player__queue-meta";
      var title = document.createElement("strong");
      title.textContent = track.title;
      var artist = document.createElement("span");
      artist.textContent = track.artist;
      meta.append(title, artist);
      var controls = document.createElement("div");
      controls.className = "web-player__queue-actions";
      var play = document.createElement("button");
      play.type = "button";
      play.textContent = "▶";
      play.setAttribute("aria-label", "Reproducir " + track.title);
      play.addEventListener("click", function () { playTrack(track); });
      var remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", "Quitar " + track.title + " de la cola");
      remove.addEventListener("click", function () {
        queue.splice(index, 1);
        if (!saveList(storageKeys.queue, queue, maxQueueSize)) queue.splice(index, 0, track);
        renderQueue();
      });
      controls.append(play, remove);
      item.append(image, meta, controls);
      queueElement.appendChild(item);
    });
    updateQueueCount();
    var preview = document.getElementById("queue-preview");
    if (preview) { preview.replaceChildren(); if (!queue.length) preview.textContent = "Tu cola aparecerá aquí."; queue.filter(function(t){return t.id !== currentTrackId;}).slice(0,3).forEach(function(t){var b=document.createElement("button");b.type="button";b.className="preview-track";b.append(createArtwork(t),document.createTextNode(t.title));b.addEventListener("click",function(){playTrack(t);});preview.append(b);}); }
    var currentIndex = queue.findIndex(function (track) { return track.id === currentTrackId; });
    previousButton.disabled = currentIndex <= 0;
    nextButton.disabled = currentIndex < 0 || currentIndex >= queue.length - 1;
  }

  function changeTrack(offset) {
    var index = queue.findIndex(function (track) { return track.id === currentTrackId; });
    var target = queue[index + offset];
    if (target) playTrack(target);
  }

  function setView(viewName) {
    if (!views[viewName]) return;
    currentView = viewName;
    Object.keys(views).forEach(function (key) { views[key].hidden = key !== viewName; });
    navButtons.forEach(function (button) {
      var active = button.dataset.view === viewName;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    document.getElementById("view-breadcrumb").textContent = viewTitles[viewName];
    if (viewName === "playlists") renderActivePlaylist();
    document.querySelector(".web-app__views").scrollTop = 0;
  }

  function runSearch(query) {
    var raw = query.trim();
    var shared = /^https:\/\//i.test(raw) ? parseShared(raw) : null;
    if(shared){ if(searchController)searchController.abort(); searchToken++; document.querySelector(".web-player__search-submit").disabled=false; lastSearchTracks=[shared];resultsTitle.textContent="Enlace compartido";resultsEyebrow.textContent=sourceName(shared);renderTracks(results,lastSearchTracks,{});playTrack(shared);return; }
    var cleanQuery = raw.replace(/\s+/g, " ");
    if (cleanQuery.length < 2 || cleanQuery.length > 100) {
      if (searchController) {
        searchController.abort();
        searchController = null;
        searchToken += 1;
      }
      document.querySelector(".web-player__search-submit").disabled = false;
      setStatus(cleanQuery.length < 2
        ? "Escribe al menos 2 caracteres para buscar."
        : "La búsqueda puede tener hasta 100 caracteres.", true);
      return;
    }

    var requestId = ++searchToken;
    if (searchController) searchController.abort();
    var controller = new AbortController();
    searchController = controller;
    var searchTimeout = window.setTimeout(function () { controller.abort(); }, 25_000);
    resultsTitle.textContent = "Buscando “" + cleanQuery + "”…";
    resultsEyebrow.textContent = "BUSCANDO";
    setStatus("");
    document.querySelector(".web-player__search-submit").disabled = true;
    results.replaceChildren();
    var loading = document.createElement("p");
    loading.className = "web-player__empty";
    loading.textContent = "Buscando canciones…";
    results.appendChild(loading);

    var endpoint = new URL("/api/music-search", location.origin);
    endpoint.searchParams.set("q", cleanQuery);
    fetch(endpoint, { headers: { Accept: "application/json" }, cache: "no-store", signal: controller.signal })
      .then(function (response) {
        return response.text().then(function (body) {
          var payload;
          try {
            payload = JSON.parse(body);
          } catch (error) {
            if (response.status === 404) {
              throw new Error("El servidor todavía no tiene activa la búsqueda de música. Publica el cambio de la API en Vercel y vuelve a intentarlo.");
            }
            throw new Error("El servidor de búsqueda respondió con un formato inesperado. Inténtalo más tarde.");
          }
          if (!response.ok) throw new Error(getApiErrorMessage(payload && payload.error, response.status));
          if (!payload || !Array.isArray(payload.items)) throw new Error("El servidor devolvió una respuesta de búsqueda incompleta.");
          return payload.items.filter(isTrack);
        });
      })
      .then(function (tracks) {
        if (requestId !== searchToken) return;
        resultsTitle.textContent = "Resultados para “" + cleanQuery + "”";
        resultsEyebrow.textContent = "RESULTADOS";
        if (!tracks.length) {
          lastSearchTracks = [];
          renderTracks(results, [], {});
          setStatus("No encontramos canciones con esa búsqueda. Prueba otro término.", false);
          return;
        }
        lastSearchTracks = tracks;
        renderTracks(results, tracks, {});
        setStatus(tracks.length+" canciones disponibles en Audius.");
      })
      .catch(function (error) {
        if (requestId !== searchToken) return;
        resultsTitle.textContent = "La búsqueda no está disponible";
        resultsEyebrow.textContent = "AVISO";
        lastSearchTracks = [];
        renderTracks(results, [], { error: true });
        var message = error.name === "AbortError"
          ? "La búsqueda tardó demasiado. Comprueba tu conexión e inténtalo otra vez."
          : error instanceof TypeError || /networkerror|failed to fetch/i.test(error.message || "")
            ? "No pudimos conectar con el servicio de búsqueda. Comprueba tu conexión e inténtalo otra vez."
            : typeof error.message === "string" && error.message !== "[object Object]"
              ? error.message
              : getApiErrorMessage(null);
        setStatus(message, true);
      })
      .finally(function () {
        window.clearTimeout(searchTimeout);
        if (requestId === searchToken) {
          document.querySelector(".web-player__search-submit").disabled = false;
          searchController = null;
        }
      });
  }

  function onPlayerStateChange(event) {
    if(mode!=="youtube"||playbackFailed||!window.YT||!window.YT.PlayerState)return;
    if(event.data===YT.PlayerState.PLAYING){syncButton(true);placeholder.hidden=true;setStatus("");}
    if(event.data===YT.PlayerState.PAUSED||event.data===YT.PlayerState.ENDED)syncButton(false);
    if(event.data===YT.PlayerState.ENDED)changeTrack(1);
  }
  var ytRequested=false, ytTimer;
  function createPlayer(){
    if(player||!window.YT||!YT.Player)return;
    player=new YT.Player(host,{width:"100%",height:"100%",playerVars:{autoplay:0,controls:1,playsinline:1,rel:0,origin:location.origin},events:{onReady:function(e){clearTimeout(ytTimer);playerReady=true;player.setVolume(Number(document.getElementById("volume-control").value));if(mode==="youtube"&&pendingYouTube&&pendingYouTube===currentTrackId){var id=pendingYouTube;pendingYouTube=null;player.loadVideoById(id);}else if(mode!=="youtube"||playbackFailed){var frame=document.getElementById("player-host");if(frame)frame.hidden=true;}},onStateChange:onPlayerStateChange,onError:function(e){if(mode!=="youtube"||playbackFailed)return;showFailure([101,150,152].includes(e.data)?"El titular no permite reproducir este video fuera de YouTube. Abre el original o busca una versión disponible en Audius.":"YouTube no pudo reproducir este video. Abre el original o busca otra versión.");},onAutoplayBlocked:function(){if(mode==="youtube"&&!playbackFailed){syncButton(false);setStatus("Pulsa reproducir para iniciar el video.");}}}});
  }
  function loadYouTubeApi(){
    if(window.YT&&YT.Player){createPlayer();clearTimeout(ytTimer);ytTimer=setTimeout(function(){if(!playerReady&&mode==="youtube"&&pendingYouTube)showFailure("YouTube no respondió. Abre el original o vuelve a intentar.");},15000);return;}
    if(ytRequested)return;ytRequested=true;
    var script=document.createElement("script");script.src="https://www.youtube.com/iframe_api";script.async=true;
    function failed(){ytRequested=false;script.remove();if(mode==="youtube"&&pendingYouTube)showFailure("No se pudo cargar YouTube. Abre el original o prueba de nuevo.");}
    window.onYouTubeIframeAPIReady=createPlayer;script.onerror=function(){clearTimeout(ytTimer);failed();};ytTimer=setTimeout(function(){if(!playerReady)failed();},15000);document.head.appendChild(script);
  }
  audio.addEventListener("playing",function(){if(mode==="audio"&&!playbackFailed){syncButton(true);setStatus("");}});
  audio.addEventListener("pause",function(){if(mode==="audio")syncButton(false);});
  audio.addEventListener("ended",function(){if(mode==="audio"){syncButton(false);changeTrack(1);}});
  audio.addEventListener("error",function(){if(mode==="audio"&&audio.getAttribute("src")&&!playbackFailed)showFailure("El audio no está disponible. Si viene de Discord, solicita un enlace actualizado.");});
  fallbackSearch.addEventListener("click",function(){if(!currentTrack)return; input.value=(currentTrack.title+" "+(currentTrack.artist.startsWith("YouTube")?"":currentTrack.artist)).slice(0,100);setView("search");runSearch(input.value);});
  document.getElementById("paste-link").addEventListener("click",function(){input.focus();input.placeholder="Pega el enlace de YouTube o del audio de Discord";setStatus("Pega una URL compartida en el buscador y pulsa Buscar.");});

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setView("search");
    runSearch(input.value);
  });
  document.querySelectorAll("[data-query]").forEach(function (button) {
    button.addEventListener("click", function () {
      input.value = button.dataset.query || "";
      setView("search");
      runSearch(input.value);
    });
  });
  navButtons.forEach(function (button) {
    button.addEventListener("click", function () { setView(button.dataset.view); });
  });
  document.querySelectorAll("[data-go]").forEach(function (button) {
    button.addEventListener("click", function () { setView(button.dataset.go); });
  });
  clearQueueButton.addEventListener("click", function () {
    var previous = queue;
    queue = [];
    if (!persist(storageKeys.queue, queue)) queue = previous;
    renderQueue();
    setStatus("Cola vaciada.");
  });
  clearRecentButton.addEventListener("click", function () {
    var previous = recent;
    recent = [];
    if (!persist(storageKeys.recent, recent)) recent = previous;
    refreshViews();
    setStatus("Historial local borrado.");
  });
  document.getElementById("close-playlist").addEventListener("click", function () {
    activePlaylistId = "";
    document.getElementById("playlist-detail").hidden = true;
  });
  playlistForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = playlistNameInput.value.trim();
    if (!name) return;
    if (playlists.some(function (playlist) { return playlist.name.toLowerCase() === name.toLowerCase(); })) {
      setStatus("Ya tienes una playlist con ese nombre.", true);
      return;
    }
    if (playlists.length >= 100) {
      setStatus("Llegaste al límite de 100 playlists.", true);
      return;
    }
    var playlist = { id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2), name: name, tracks: [], createdAt: Date.now() };
    playlists.unshift(playlist);
    if (!persist(storageKeys.playlists, playlists)) {
      playlists.shift();
      return;
    }
    playlistNameInput.value = "";
    activePlaylistId = playlist.id;
    refreshViews();
    setView("playlists");
    setStatus("Playlist creada.");
  });
  previousButton.addEventListener("click", function () { changeTrack(-1); });
  nextButton.addEventListener("click", function () { changeTrack(1); });
  playButton.addEventListener("click",function(){if(!currentTrack)return;if(playbackFailed){prepareTrack(currentTrack,true);return;}if(mode==="audio"){if(audio.paused)startAudio();else audio.pause();}else if(mode==="youtube"){if(!playerReady||placeholder.hidden===false){prepareTrack(currentTrack,true);return;}if(player.getPlayerState()===YT.PlayerState.PLAYING)player.pauseVideo();else player.playVideo();}});
  incomingButton.addEventListener("click",function(){if(incomingTrack)playTrack(incomingTrack);});
  progress.addEventListener("input",function(){isSeeking=true;});
  progress.addEventListener("change",function(){var duration=mode==="audio"?audio.duration:mode==="youtube"&&playerReady&&player&&!playbackFailed?player.getDuration():0;if(Number.isFinite(duration)&&duration>0){var t=Number(progress.value)/1000*duration;if(mode==="audio")audio.currentTime=t;else player.seekTo(t,true);}isSeeking=false;});
  window.setInterval(function(){if(isSeeking||playbackFailed)return;var duration,current;if(mode==="audio"){duration=audio.duration;current=audio.currentTime;}else if(mode==="youtube"&&playerReady&&player&&placeholder.hidden){duration=player.getDuration();current=player.getCurrentTime();}if(Number.isFinite(duration)&&duration>0&&Number.isFinite(current)){progress.value=String(Math.round(current/duration*1000));currentTimeLabel.textContent=formatTime(current);durationLabel.textContent=formatTime(duration);}},500);
  document.getElementById("volume-control").addEventListener("input",function(){audio.volume=Number(this.value)/100;if(playerReady&&player)player.setVolume(Number(this.value));});
  refreshViews();
  setView("home");
  var initialQuery=params.get("q"); if(initialQuery && initialQuery.trim().length>=2 && initialQuery.length<=100){input.value=initialQuery;setView("search");runSearch(initialQuery);}

  var sharedRaw=params.get("audio")||params.get("url")||params.get("v")||params.get("videoId")||"";
  incomingTrack=parseShared(sharedRaw,(params.get("title")||"").slice(0,160),(params.get("artist")||"").slice(0,120));
  if(incomingTrack){setView("search");prepareTrack(incomingTrack,false);incomingButton.hidden=false;incomingButton.textContent="▶ Reproducir canción compartida";setStatus("Enlace recibido. Pulsa reproducir para empezar.");enrichYouTube(incomingTrack);}else if(queue.length){prepareTrack(queue[0],false);}

  var versionUrl = new URL("version.json", document.baseURI);
  fetch(versionUrl, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("No se pudo consultar la versión publicada.");
      return response.json();
    })
    .then(function (version) {
      if (typeof version.apkUrl === "string" && /^https:\/\//i.test(version.apkUrl)) {
        document.querySelectorAll("#download-app, .web-now-playing__download").forEach(function (link) {
          link.href = version.apkUrl;
        });
      }
    })
    .catch(function (error) {
      console.warn("Se usará el enlace de descarga de NexusMusic como alternativa.", error);
    });
})();

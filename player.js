
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

  if (document.body.classList.contains("music-app")) {
    var backgroundVideo = document.createElement("video");
    backgroundVideo.className = "music-app__background-video";
    backgroundVideo.src = "https://cdn.discordapp.com/attachments/1550670038594363527/1574988106354917516/112722-695433093.mp4?ex=6b07a57a&is=6b0653fa&hm=209fb80b02422c72259c8846b44bcb1ffcbf527461b1a3eaf330f8cf3142dafd&";
    backgroundVideo.autoplay = true;
    backgroundVideo.muted = true;
    backgroundVideo.loop = true;
    backgroundVideo.playsInline = true;
    backgroundVideo.preload = "auto";
    backgroundVideo.setAttribute("aria-hidden", "true");
    backgroundVideo.tabIndex = -1;
    document.body.prepend(backgroundVideo);
  }

  var chatWidgetScript = document.createElement("script");
  chatWidgetScript.src = "chat-widget.js?v=nexus-forma-chat3-html";
  chatWidgetScript.async = true;
  document.head.appendChild(chatWidgetScript);

  var accountStyles = document.createElement("link");
  accountStyles.rel = "stylesheet";
  accountStyles.href = "nexus-account.css?v=nexus-account2";
  document.head.appendChild(accountStyles);

  var firebaseConfigScript = document.createElement("script");
  firebaseConfigScript.src = "firebase-web-config.js?v=nexus-account2";
  firebaseConfigScript.onload = function () {
    import("./nexus-account.js?v=nexus-account2").catch(function (error) {
      console.error("No se pudo cargar el inicio de sesión de NexusMusic.", error);
      setStatus("No se pudo cargar el inicio de sesión. Comprueba tu conexión e inténtalo de nuevo.", true);
    });
  };
  firebaseConfigScript.onerror = function (error) {
    console.error("No se pudo cargar firebase-web-config.js.", error);
    setStatus("No se pudo cargar la configuración de Firebase Web.", true);
  };
  document.head.appendChild(firebaseConfigScript);

  var serviceWorkerReady = null;
  if ("serviceWorker" in navigator &&
      (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    serviceWorkerReady = navigator.serviceWorker.register(new URL("sw.js", location.href))
      .then(function () {
        return Promise.race([
          navigator.serviceWorker.ready.then(function () { return true; }),
          new Promise(function (resolve) { window.setTimeout(function () { resolve(false); }, 10000); })
        ]);
      })
      .catch(function (error) {
        console.error("No se pudo activar el modo sin conexión de NexusMusic.", error);
        setStatus("No se pudo preparar el modo sin conexión en este navegador.", true);
        return false;
      });
  }

  var input = document.getElementById("track-input");
  if (!input) return;

  var settingsDialog = document.getElementById("settings-dialog");
  var appViews = document.querySelector(".web-app__views");
  var sidebarNavigation = document.querySelector(".app-sidebar nav");
  if (settingsDialog && appViews && sidebarNavigation) {
    var settingsShortcut = document.getElementById("settings-open");
    if (settingsShortcut) settingsShortcut.remove();
    var settingsView = document.createElement("section");
    settingsView.className = "web-view settings-page";
    settingsView.id = "settings-view";
    settingsView.hidden = true;
    settingsView.setAttribute("aria-labelledby", "settings-page-title");
    settingsView.innerHTML = '<header class="settings-hero"><div><p class="web-player__eyebrow">NEXUS / PERSONALIZACIÓN</p><h1 id="settings-page-title">Ajustes</h1><p>Tu espacio, tu sonido. Personaliza la experiencia y la reproducción.</p></div><div class="settings-hero__badge" aria-hidden="true"><span>NM</span><small>WEB PLAYER</small></div></header><div class="settings-dashboard" id="settings-dashboard"></div>';
    var settingsContent = document.createElement("div");
    settingsContent.className = "settings-content";
    var settingsClose = settingsDialog.querySelector('[data-close="settings-dialog"]');
    if (settingsClose) settingsClose.remove();
    while (settingsDialog.firstChild) settingsContent.appendChild(settingsDialog.firstChild);
    settingsDialog.remove();
    settingsView.querySelector("#settings-dashboard").appendChild(settingsContent);
    appViews.appendChild(settingsView);

    var settingsNavigationButton = document.createElement("button");
    settingsNavigationButton.type = "button";
    settingsNavigationButton.className = "web-app__nav";
    settingsNavigationButton.dataset.view = "settings";
    settingsNavigationButton.setAttribute("aria-label", "Ajustes");
    settingsNavigationButton.innerHTML = '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z"></path></svg><span>Ajustes</span>';
    sidebarNavigation.appendChild(settingsNavigationButton);
  }

  var videoView;
  var videoSearchForm;
  var roomView;
  var roomSearchForm;
  var roomSearchResults;
  if (appViews && sidebarNavigation) {
    videoView = document.createElement("section");
    videoView.className = "web-view videos-page";
    videoView.id = "videos-view";
    videoView.hidden = true;
    videoView.setAttribute("aria-labelledby", "videos-page-title");
    videoView.innerHTML = '<header class="video-hero"><div><p class="web-player__eyebrow">NEXUS / VIDEO</p><h1 id="videos-page-title">Videos para ver.</h1><p>Busca canciones en video, canales y creadores de YouTube. Abre un resultado y míralo aquí mismo.</p><form class="video-search-form" id="video-search-form" role="search"><label class="sr-only" for="video-search-input">Buscar videos y canales</label><input id="video-search-input" type="search" maxlength="100" placeholder="Busca un video o canal…" autocomplete="off" required><button class="primary" id="video-search-submit" type="submit">Buscar videos</button></form><p id="video-provider-status" role="status"></p></div><div class="video-hero__art" aria-hidden="true"><span>▶</span><small>WATCH / DISCOVER</small></div></header><div class="video-discovery"><span class="web-player__eyebrow">IDEAS PARA EMPEZAR</span><div class="video-query-chips"><button type="button" data-video-query="Tiny Desk Concert">Tiny Desk</button><button type="button" data-video-query="KEXP live session">KEXP Sessions</button><button type="button" data-video-query="Vevo live performances">Vevo</button><button type="button" data-video-query="music video">Videos musicales</button></div></div><section class="web-section video-results-section" aria-labelledby="video-results-title"><div class="web-section__head"><div><p class="web-player__eyebrow" id="video-results-eyebrow">YOUTUBE / VIDEOS</p><h2 id="video-results-title">Encuentra algo para ver</h2></div><a class="web-player__text-button" id="video-search-external" href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">Abrir YouTube ↗</a></div><div class="web-player__results video-results" id="video-results" aria-live="polite"></div></section>';
    videoSearchForm = videoView.querySelector("#video-search-form");
    appViews.appendChild(videoView);

    var videoNavigationButton = document.createElement("button");
    videoNavigationButton.type = "button";
    videoNavigationButton.className = "web-app__nav";
    videoNavigationButton.dataset.view = "videos";
    videoNavigationButton.setAttribute("aria-label", "Videos");
    videoNavigationButton.innerHTML = '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewBox="0 0 24 24"><rect x="3" y="5" width="13" height="14" rx="2"></rect><path d="m16 10 5-3v10l-5-3z"></path></svg><span>Videos</span>';
    var settingsNavigationButton = sidebarNavigation.querySelector('[data-view="settings"]');
    sidebarNavigation.insertBefore(videoNavigationButton, settingsNavigationButton || null);
  }

  if (appViews && sidebarNavigation) {
    roomView = document.createElement("section");
    roomView.className = "web-view rooms-page";
    roomView.id = "rooms-view";
    roomView.hidden = true;
    roomView.setAttribute("aria-labelledby", "rooms-page-title");
    roomView.innerHTML = '<header class="rooms-hero"><div><p class="web-player__eyebrow">NEXUS / LISTEN TOGETHER</p><h1 id="rooms-page-title">Escuchen juntos.</h1><p>Crea una sala o entra con un código. Cada persona reproduce el video en su propio dispositivo; la sala sincroniza canción y controles.</p></div><div class="rooms-hero__art" aria-hidden="true">♫</div></header><section class="rooms-lobby"><div class="rooms-lobby__forms"><form id="room-join-form"><label for="room-code-input">Tengo un código</label><div><input id="room-code-input" maxlength="6" minlength="6" autocomplete="off" placeholder="ABC234" required><button class="primary" type="submit">Entrar</button></div></form><form id="room-create-form"><label for="room-name-input">Tu nombre en la sala</label><input id="room-name-input" maxlength="24" autocomplete="nickname" placeholder="Tu apodo"><div class="room-create-actions"><button class="primary" type="button" data-room-create="private">Crear sala privada</button><button type="button" data-room-create="public">Crear sala pública</button></div></form></div><div class="rooms-public"><div class="web-section__head"><div><p class="web-player__eyebrow">SALAS ABIERTAS</p><h2>Únete a alguien</h2></div><button class="web-player__text-button" id="rooms-refresh" type="button">Actualizar</button></div><div class="rooms-public__list" id="rooms-public-list" aria-live="polite"></div></div></section><p class="rooms-status" id="rooms-status" role="status" aria-live="polite">Conectando con el servidor de salas…</p><section class="room-live" id="room-live" hidden aria-labelledby="room-live-title"><header class="room-live__header"><div><p class="web-player__eyebrow" id="room-live-visibility">SALA PRIVADA</p><h2 id="room-live-title">Sala de escucha</h2><p>Código <strong id="room-live-code"></strong> · <span id="room-live-count"></span></p></div><div class="room-live__actions"><button type="button" id="room-copy-code">Copiar código</button><button type="button" id="room-leave" class="room-leave">Salir</button></div></header><div class="room-live__grid"><section class="room-members"><div class="web-section__head"><h3>Escuchando</h3></div><ul id="room-members-list"></ul><div class="room-now-track" id="room-now-track">Todavía no hay música en la sala.</div><div class="room-reactions" aria-label="Reacciones"><button type="button" data-room-reaction="❤️" aria-label="Reaccionar con corazón">❤️</button><button type="button" data-room-reaction="🔥" aria-label="Reaccionar con fuego">🔥</button><button type="button" data-room-reaction="👏" aria-label="Reaccionar con aplausos">👏</button><button type="button" data-room-reaction="🎵" aria-label="Reaccionar con música">🎵</button></div></section><section class="room-music"><h3>Elige la próxima canción</h3><p>Busca videos de YouTube para que funcionen en NexusMusic y en la app Android.</p><form class="video-search-form room-search-form" id="room-search-form"><label class="sr-only" for="room-search-input">Buscar videos para la sala</label><input id="room-search-input" type="search" maxlength="100" placeholder="Buscar canción o artista…" required><button class="primary" type="submit">Buscar</button></form><div class="room-search-results" id="room-search-results" aria-live="polite"></div></section><section class="room-chat"><div class="web-section__head"><h3>Chat de la sala</h3><span>Efímero · no se guarda</span></div><div class="room-chat__messages" id="room-chat-messages" aria-live="polite"></div><form id="room-chat-form"><label class="sr-only" for="room-chat-input">Escribe en el chat de la sala</label><input id="room-chat-input" maxlength="500" autocomplete="off" placeholder="Escribe un mensaje…"><button class="primary" type="submit">Enviar</button></form></section></div></section>';
    appViews.appendChild(roomView);
    roomSearchForm = roomView.querySelector("#room-search-form");
    roomSearchResults = roomView.querySelector("#room-search-results");
    var roomCreateForm = roomView.querySelector("#room-create-form");
    var roomProfileEditor = document.createElement("div");
    roomProfileEditor.className = "room-profile-editor";
    roomProfileEditor.innerHTML = '<div class="room-profile-editor__avatar" id="room-avatar-preview" aria-hidden="true">♫</div><div class="room-profile-editor__content"><strong>Tu foto de perfil</strong><small>Se guarda en este navegador y se comparte solo en la sala.</small><div class="room-profile-editor__actions"><button type="button" class="room-avatar-pick" data-room-avatar-pick>Elegir foto</button><button type="button" class="room-avatar-remove" id="room-avatar-remove">Quitar</button></div></div><input class="sr-only" type="file" id="room-avatar-input" accept="image/jpeg,image/png,image/webp">';
    roomCreateForm.insertBefore(roomProfileEditor, roomCreateForm.querySelector(".room-create-actions"));
    var roomMembersPanel = roomView.querySelector(".room-members");
    var roomLiveProfile = document.createElement("div");
    roomLiveProfile.className = "room-profile-live";
    roomLiveProfile.innerHTML = '<div class="room-profile-editor__avatar" id="room-avatar-preview-live" aria-hidden="true">♫</div><div class="room-profile-live__details"><label for="room-live-name">Tu perfil</label><input id="room-live-name" data-room-name maxlength="24" autocomplete="nickname" aria-label="Tu nombre en la sala"><button type="button" class="room-avatar-pick" data-room-avatar-pick>Cambiar foto</button></div>';
    roomMembersPanel.insertBefore(roomLiveProfile, roomMembersPanel.querySelector("#room-members-list"));
    byId("room-name-input").setAttribute("data-room-name", "");

    var roomNavigationButton = document.createElement("button");
    roomNavigationButton.type = "button";
    roomNavigationButton.className = "web-app__nav";
    roomNavigationButton.dataset.view = "rooms";
    roomNavigationButton.setAttribute("aria-label", "Salas");
    roomNavigationButton.innerHTML = '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.5"></circle><path d="M3 19c0-3.1 2.4-5.3 6-5.3s6 2.2 6 5.3m0-4c3.1-.1 5 1.5 5 4"></path></svg><span>Salas</span>';
    var roomsSettingsButton = sidebarNavigation.querySelector('[data-view="settings"]');
    sidebarNavigation.insertBefore(roomNavigationButton, roomsSettingsButton || null);
  }

  var brand = document.querySelector(".app-sidebar .brand");
  if (brand) {
    var betaBadge = document.createElement("span");
    betaBadge.className = "beta-badge";
    betaBadge.textContent = "BETA";
    betaBadge.setAttribute("aria-label", "Versión beta");
    brand.appendChild(betaBadge);
  }
  document.title = "NexusMusic Beta — Escuchar";
  var breadcrumbBrand = document.querySelector(".crumb > span");
  if (breadcrumbBrand) breadcrumbBrand.textContent = "NexusMusic Beta";

  var homeView = document.getElementById("home-view");
  var homeRecommendationsList = null;
  var homeRecommendationArtists = null;
  var homeRecommendationsRefresh = null;
  if (homeView) {
    var mobileAppPromo = document.createElement("section");
    mobileAppPromo.className = "mobile-app-promo";
    mobileAppPromo.innerHTML = '<div class="mobile-app-promo__icon" aria-hidden="true">N</div><div class="mobile-app-promo__copy"><p class="web-player__eyebrow">NEXUSMUSIC PARA ANDROID</p><h2>Va mejor en la app móvil.</h2><p>Lleva tu música contigo: reproducción en segundo plano, descargas y una experiencia hecha para tu teléfono.</p></div><a class="primary web-now-playing__download" id="mobile-app-download" href="https://github.com/santhiagocaro05-debug/Nexus-Update/releases/download/v0.6.61/NexusMusic.apk">Instalar app <span aria-hidden="true">↗</span></a>';
    var homeFeature = homeView.querySelector(".app-feature");
    homeView.insertBefore(mobileAppPromo, homeFeature ? homeFeature.nextSibling : homeView.firstChild);

    var dashboardStats = document.createElement("section");
    dashboardStats.className = "home-dashboard-stats";
    dashboardStats.setAttribute("aria-label", "Resumen de tu música");
    dashboardStats.innerHTML = '<button type="button" data-go="library"><span class="home-dashboard-stats__value" id="home-stat-library">0</span><span>Biblioteca</span></button><button type="button" data-go="favorites"><span class="home-dashboard-stats__value" id="home-stat-favorites">0</span><span>Favoritos</span></button><button type="button" data-go="playlists"><span class="home-dashboard-stats__value" id="home-stat-playlists">0</span><span>Playlists</span></button><button type="button" data-go="history"><span class="home-dashboard-stats__value" id="home-stat-history">0</span><span>Recientes</span></button>';
    homeView.insertBefore(dashboardStats, homeView.firstChild.nextSibling);

    var recentSection = homeView.querySelector("#home-recent-results");
    var recentHeading = recentSection && recentSection.closest(".web-section");
    if (recentHeading) {
      var continueHeading = recentHeading.querySelector(".web-section__head h2");
      if (continueHeading) continueHeading.textContent = "Continúa escuchando";
    }

    var recommendations = document.createElement("section");
    recommendations.className = "web-section home-recommendations";
    recommendations.setAttribute("aria-labelledby", "home-recommendations-title");
    recommendations.innerHTML = '<div class="web-section__head"><div><p class="web-player__eyebrow">BASADO EN TUS ESCUCHAS</p><h2 id="home-recommendations-title">Recomendado para ti</h2></div><button class="web-player__text-button" id="home-recommendations-refresh" type="button">Actualizar</button></div><div class="home-recommendation-artists" id="home-recommendation-artists" aria-label="Artistas que escuchas"></div><div class="web-player__results" id="home-recommendation-results" aria-live="polite"></div>';
    homeRecommendationsList = recommendations.querySelector("#home-recommendation-results");
    homeRecommendationArtists = recommendations.querySelector("#home-recommendation-artists");
    homeRecommendationsRefresh = recommendations.querySelector("#home-recommendations-refresh");
    homeRecommendationsRefresh.addEventListener("click", function () {
      refreshHomeRecommendations(true);
    });
    if (recentHeading) homeView.insertBefore(recommendations, recentHeading);
    else homeView.appendChild(recommendations);
  }

  [
    ["library-view", "library-list", "library", "Canciones guardadas", "Sigue descubriendo música y guarda lo que quieras escuchar después."],
    ["favorites-view", "favorites-list", "favorites", "Favoritos", "Tus canciones favoritas, reunidas en un solo lugar."],
    ["playlists-view", "playlist-grid", "playlists", "Playlists creadas", "Organiza tu música en listas para cada momento."],
    ["history-view", "history-list", "history", "Escuchas recientes", "Tu actividad se guarda únicamente en este navegador."],
    ["queue-view", "track-queue", "queue", "En la cola", "Ordena lo que quieres escuchar a continuación."]
  ].forEach(function (item) {
    var view = document.getElementById(item[0]);
    var content = document.getElementById(item[1]);
    if (!view || !content) return;
    view.classList.add("collection-page", "collection-page--" + item[2]);
    var summary = document.createElement("div");
    summary.className = "collection-summary";
    summary.innerHTML = '<div><p class="web-player__eyebrow">TU ESPACIO PERSONAL</p><p class="collection-summary__description"></p></div><div class="collection-summary__metric"><strong class="collection-summary__count" data-collection-count="' + item[2] + '">0</strong><span></span></div>';
    summary.querySelector(".collection-summary__description").textContent = item[4];
    summary.querySelector(".collection-summary__metric span").textContent = item[3];
    view.insertBefore(summary, content);
  });

  var settingsDashboard = document.getElementById("settings-dashboard");
  if (settingsDashboard) {
    var webExperienceGroup = document.createElement("section");
    webExperienceGroup.className = "settings-group";
    webExperienceGroup.innerHTML = '<h3>Experiencia web</h3>';
    [
      ["dataSaver", "Ahorro de datos", "No carga portadas remotas ni fondos dinámicos."],
      ["persistentQueue", "Recordar cola", "Conserva tu cola en este navegador."],
      ["stopAfterCurrent", "Detener al terminar", "No inicia otra pista al finalizar la actual."],
      ["autoSavePlayed", "Guardar al reproducir", "Añade las canciones a tu biblioteca; no descarga audio de terceros."],
      ["autoLyrics", "Mostrar letras automáticamente", "Busca letras verificadas al cambiar de canción."]
    ].forEach(function (setting) {
      var label = document.createElement("label");
      label.className = "setting-row";
      var copy = document.createElement("span");
      var title = document.createElement("strong");
      var description = document.createElement("small");
      var control = document.createElement("input");
      title.textContent = setting[1];
      description.textContent = setting[2];
      control.type = "checkbox";
      control.id = "pref-" + setting[0];
      control.setAttribute("role", "switch");
      copy.append(title, description);
      label.append(copy, control);
      webExperienceGroup.appendChild(label);
    });
    settingsDashboard.querySelector(".settings-content").insertBefore(
      webExperienceGroup,
      settingsDashboard.querySelector(".about-nexus")
    );

    var volumeGroup = document.createElement("section");
    volumeGroup.className = "settings-group";
    volumeGroup.innerHTML = '<h3>Audio</h3><label class="setting-row setting-row--volume" for="pref-volume"><span><strong>Volumen predeterminado</strong><small>Se guarda en este navegador y se sincroniza con el reproductor.</small></span><span class="setting-volume-control"><input type="range" id="pref-volume" min="0" max="100" step="1" aria-label="Volumen predeterminado"><output id="pref-volume-value" for="pref-volume">70%</output></span></label>';
    settingsDashboard.querySelector(".settings-content").insertBefore(
      volumeGroup,
      settingsDashboard.querySelector(".about-nexus")
    );

    var exportGroup = document.createElement("section");
    exportGroup.className = "settings-group settings-export";
    exportGroup.innerHTML = '<h3>Tu colección</h3><p>Descarga una copia local de tu biblioteca, favoritos, playlists e historial.</p><button class="button secondary" id="export-library" type="button">Exportar mi colección</button>';
    settingsDashboard.querySelector(".settings-content").insertBefore(
      exportGroup,
      settingsDashboard.querySelector(".about-nexus")
    );

    var playerDesignGroup = document.createElement("section");
    playerDesignGroup.className = "settings-group settings-player-design";
    playerDesignGroup.innerHTML = '<h3>Diseño del reproductor</h3><p>Elige el estilo de tu panel y barra de reproducción.</p><div class="player-design-options" role="group" aria-label="Diseño del reproductor"><button type="button" class="player-design-option" data-player-design="aurora"><span class="player-design-preview player-design-preview--aurora"><i></i><b></b><small></small></span><strong>Aurora</strong></button><button type="button" class="player-design-option" data-player-design="velvet"><span class="player-design-preview player-design-preview--velvet"><i></i><b></b><small></small></span><strong>Velvet</strong></button><button type="button" class="player-design-option" data-player-design="prism"><span class="player-design-preview player-design-preview--prism"><i></i><b></b><small></small></span><strong>Prisma</strong></button><button type="button" class="player-design-option" data-player-design="studio"><span class="player-design-preview player-design-preview--studio"><i></i><b></b><small></small></span><strong>Studio</strong></button></div>';
    settingsDashboard.querySelector(".settings-content").insertBefore(
      playerDesignGroup,
      settingsDashboard.querySelector(".about-nexus")
    );
  }

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
    queue: document.getElementById("queue-view"),
    videos: document.getElementById("videos-view"),
    rooms: document.getElementById("rooms-view"),
    settings: document.getElementById("settings-view")
  };
  var viewTitles = {
    home: "Inicio",
    search: "Buscar",
    library: "Biblioteca",
    favorites: "Favoritos",
    playlists: "Playlists",
    history: "Historial",
    queue: "Cola",
    videos: "Videos",
    rooms: "Salas",
    settings: "Ajustes"
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
  var prefDefaults={color:'aurora',playerDesign:'aurora',dynamic:true,glass:true,blur:true,motion:true,autoplay:true,repeat:false,shuffle:false,speed:'1',volume:70,dataSaver:false,persistentQueue:true,stopAfterCurrent:false,autoSavePlayed:false,autoLyrics:false};
  var prefs=Object.assign({},prefDefaults);try{var savedPrefs=JSON.parse(localStorage.getItem('nexus.player.settings.v1')||'{}');Object.keys(prefDefaults).forEach(function(k){if(typeof savedPrefs[k]===typeof prefDefaults[k])prefs[k]=savedPrefs[k];});}catch(_){}
  var maxQueueSize = 100;
  var queue = prefs.persistentQueue ? readStoredList(storageKeys.queue, maxQueueSize) : [];
  var recent = readStoredList(storageKeys.recent, 50);
  var library = readStoredList(storageKeys.library, 500);
  var favorites = readStoredList(storageKeys.favorites, 500);
  var playlists = readPlaylists();
  var homeRecommendations = [];
  var homeRecommendationSeeds = [];
  var homeRecommendationSignature = "";
  var homeRecommendationRequestId = 0;
  var homeRecommendationState = "idle";
  var searchToken = 0;
  var searchController = null;
  var lastSearchTracks = [];
  var lastVideoTracks = [];
  var player = null;
  var playerReady = false;
  var roomSocket = null;
  var roomConnectionWanted = false;
  var roomReconnectTimer = null;
  var roomPingTimer = null;
  var roomSyncTimer = null;
  var roomRetryCount = 0;
  var roomMe = null;
  var roomMembers = [];
  var roomVisibility = "private";
  var roomServerOffsetMs = 0;
  var roomRttMs = 0;
  var roomPingSentAt = 0;
  var roomPreparing = null;
  var roomTrackId = "";
  var roomStartAfterCue = null;
  var roomSuppressedUntil = 0;
  var roomLastAction = "";
  var roomChat = [];
  var roomNameKey = "nexusmusic.web.room-name.v1";
  var roomAvatarKey = "nexusmusic.web.room-avatar.v1";
  var roomInstallKey = "nexusmusic.web.room-install.v1";
  var currentTrackId = "";
  var currentView = "home";
  var activePlaylistId = "";
  var incomingTrack = null;
  var isSeeking = false;
  var localAudioDatabasePromise = null;
  var activeLocalAudioUrl = "";
  var params = new URLSearchParams(location.search);
  var incomingId = params.get("v") || "";
  var relatedBusy=false, playbackGeneration=0, endHandled=false, playContext=[];
  var currentTrack = null, mode = "idle", playbackFailed = false, pendingYouTube = null;
  var audio = new Audio(); audio.preload = "metadata";
  var cover = document.getElementById("audio-cover"), failure = document.getElementById("playback-fallback");
  var sourceLink = document.getElementById("source-link"), panelSource = document.getElementById("panel-source");
  var fallbackOpen = document.getElementById("fallback-open"), fallbackSearch = document.getElementById("fallback-search");
  function openLocalAudioDatabase() {
    if (!window.indexedDB) return Promise.reject(new Error("Este navegador no permite guardar audio sin conexión."));
    if (!localAudioDatabasePromise) {
      localAudioDatabasePromise = new Promise(function (resolve, reject) {
        var request = window.indexedDB.open("nexusmusic.offline-audio.v1", 1);
        request.onupgradeneeded = function () {
          var database = request.result;
          if (!database.objectStoreNames.contains("tracks")) {
            database.createObjectStore("tracks", { keyPath: "id" });
          }
        };
        request.onsuccess = function () {
          request.result.onversionchange = function () { request.result.close(); };
          resolve(request.result);
        };
        request.onerror = function () {
          reject(request.error || new Error("No se pudo abrir el almacenamiento de audio."));
        };
        request.onblocked = function () {
          reject(new Error("Cierra otras pestañas de NexusMusic y vuelve a intentarlo."));
        };
      }).catch(function (error) {
        localAudioDatabasePromise = null;
        throw error;
      });
    }
    return localAudioDatabasePromise;
  }
  function storeLocalAudio(id, file) {
    return openLocalAudioDatabase().then(function (database) {
      return new Promise(function (resolve, reject) {
        var transaction = database.transaction("tracks", "readwrite");
        transaction.objectStore("tracks").put({ id: id, blob: file, name: file.name, type: file.type });
        transaction.oncomplete = function () { resolve(); };
        transaction.onerror = function () {
          reject(transaction.error || new Error("No se pudo guardar el archivo de audio."));
        };
        transaction.onabort = function () {
          reject(transaction.error || new Error("Se canceló el guardado del archivo de audio."));
        };
      });
    });
  }
  function readLocalAudio(id) {
    return openLocalAudioDatabase().then(function (database) {
      return new Promise(function (resolve, reject) {
        var request = database.transaction("tracks", "readonly").objectStore("tracks").get(id);
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { reject(request.error || new Error("No se pudo leer el archivo de audio.")); };
      });
    });
  }
  function deleteLocalAudio(id) {
    return openLocalAudioDatabase().then(function (database) {
      return new Promise(function (resolve, reject) {
        var transaction = database.transaction("tracks", "readwrite");
        transaction.objectStore("tracks").delete(id);
        transaction.oncomplete = function () { resolve(); };
        transaction.onerror = function () {
          reject(transaction.error || new Error("No se pudo eliminar el archivo de audio."));
        };
        transaction.onabort = function () {
          reject(transaction.error || new Error("Se canceló la eliminación del archivo de audio."));
        };
      });
    });
  }
  function releaseActiveLocalAudioUrl() {
    if (!activeLocalAudioUrl) return;
    URL.revokeObjectURL(activeLocalAudioUrl);
    activeLocalAudioUrl = "";
  }
  function directAudio(url) {
    try { var u = new URL(url); return u.protocol === "https:" && !u.username && !u.password && !u.port && discordHosts.has(u.hostname) && /^\/attachments\/\d+\/\d+\/[^/]+\.(mp3|m4a|aac|ogg|opus|wav|flac|webm)$/i.test(u.pathname) ? u.href : ""; } catch (_) { return ""; }
  }
  function isTrack(track) {
    return track && typeof track.title === "string" && typeof track.artist === "string" && (track.provider === "local" ? /^local:[A-Za-z0-9_-]{1,80}$/.test(track.id || "") : track.provider === "audius" ? /^au:[A-Za-z0-9_-]{1,80}$/.test(track.id || "") : track.provider === "discord" ? /^dc:[a-f0-9]{16}$/.test(track.id || "") && !!directAudio(track.audioUrl) : videoIdPattern.test(track.id || ""));
  }
  function sourceName(track) { return track.provider === "local" ? "Archivo local · sin conexión" : track.provider === "catalog" ? "Catálogo comercial" : track.provider === "audius" ? "Audius" : track.provider === "discord" ? "Discord · audio" : track.kind === "video" ? "YouTube · video" : track.provider === "youtube" ? "YouTube Music" : "YouTube"; }
  function sourceUrl(track) {
    if (track.provider === "local") return "";
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
  function showFailure(message) { if(!currentTrack)return; playbackFailed=true; pendingYouTube=null; syncButton(false); resetProgress(); if(player&&playerReady&&mode==="youtube")try{player.stopVideo();}catch(_){} if(mode==="audio")audio.pause(); cover.hidden=true; placeholder.hidden=true; var frame=document.getElementById("player-host");if(frame)frame.hidden=true; failure.hidden=false; document.getElementById("fallback-message").textContent=message; fallbackOpen.href=sourceUrl(currentTrack)||"#"; fallbackOpen.hidden=currentTrack.provider==="local"; fallbackOpen.textContent=currentTrack.provider==="discord"?"Abrir archivo ↗":currentTrack.provider==="audius"?"Abrir Audius ↗":"Abrir en YouTube ↗"; fallbackSearch.hidden=currentTrack.provider==="local"||currentTrack.title==="Canción compartida"; playButton.disabled=false; setStatus(message,true); }
  function prepareTrack(track, autoplay) {
    var generation = ++playbackGeneration;
    endHandled=false;relatedBusy=false;pendingYouTube=null; mode="switching"; audio.pause(); audio.removeAttribute("src"); audio.load(); releaseActiveLocalAudioUrl(); if(player&&playerReady)try{player.stopVideo();}catch(_){} playbackFailed=false; failure.hidden=true; resetProgress(); syncButton(false); setCurrentTrack(track); playButton.disabled=false; placeholder.hidden=true;
    var frame=document.getElementById("player-host");
    if(track.provider==="local") {
      mode="audio";
      playButton.disabled=true;
      if(frame)frame.hidden=true;
      cover.hidden=false;
      document.getElementById("panel-cover").src=track.thumbnail||"assets/Nexus-logo.png";
      audio.volume=Number(document.getElementById("volume-control").value)/100;
      audio.playbackRate=Number(prefs.speed)||1;
      readLocalAudio(track.id).then(function (record) {
        if (generation !== playbackGeneration || currentTrackId !== track.id) return;
        if (!record || !(record.blob instanceof Blob)) {
          showFailure("No se encontró el archivo offline de esta canción. Impórtalo de nuevo desde tu biblioteca.");
          return;
        }
        activeLocalAudioUrl=URL.createObjectURL(record.blob);
        audio.src=activeLocalAudioUrl;
        audio.load();
        playButton.disabled=false;
        if(autoplay)startAudio();
      }).catch(function (error) {
        if (generation !== playbackGeneration || currentTrackId !== track.id) return;
        console.error("No se pudo abrir el audio local.", error);
        showFailure(error.message || "No se pudo acceder al archivo de audio guardado.");
      });
    }
    else if(track.provider==="audius"||track.provider==="discord") {mode="audio"; if(frame)frame.hidden=true; cover.hidden=false; document.getElementById("panel-cover").src=track.thumbnail||"assets/Nexus-logo.png"; audio.src=streamUrl(track); audio.volume=Number(document.getElementById("volume-control").value)/100;audio.playbackRate=Number(prefs.speed)||1; if(autoplay)startAudio();}
    else {mode="youtube";cover.hidden=true;if(frame)frame.hidden=false; if(autoplay){pendingYouTube=track.id;if(playerReady&&player){pendingYouTube=null;player.loadVideoById(track.id);}else{setStatus("Cargando reproductor de YouTube…");loadYouTubeApi();}}else{placeholder.hidden=false;if(frame)frame.hidden=true;}}
  }
  function startAudio(){var id=currentTrackId; audio.play().catch(function(error){if(mode!=="audio"||currentTrackId!==id||error.name==="AbortError")return; if(error.name==="NotAllowedError"){syncButton(false);setStatus("Pulsa reproducir para iniciar el audio.");}else showFailure(currentTrack&&currentTrack.provider==="local"?"El navegador no pudo reproducir este archivo de audio. Prueba con otro formato compatible.":"No se pudo reproducir este audio. Puede no estar disponible o el enlace haber caducado.");});}
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
    if (key === storageKeys.queue && !prefs.persistentQueue) return true;
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
    image.src = !prefs.dataSaver && track.thumbnail && /^https:\/\//i.test(track.thumbnail)
      ? track.thumbnail
      : (prefs.dataSaver || track.provider ? "assets/Nexus-logo.png" : "https://i.ytimg.com/vi/" + encodeURIComponent(track.id) + "/hqdefault.jpg");
    image.onerror = function () {
      image.onerror = null;
      image.src = "assets/studio-mark.svg";
    };
    return image;
  }

  function setCurrentTrack(track) {
    currentTrackId = track.id;
    currentTrack=track; panelSource.textContent=sourceName(track); sourceLink.href=sourceUrl(track); sourceLink.hidden=track.provider==="local";
    titleLabel.textContent = track.title;
    artistLabel.textContent = track.artist;
    document.getElementById("panel-track").textContent = track.title;
    document.getElementById("panel-artist").textContent = track.artist;
    if (!prefs.dataSaver && track.thumbnail && /^https:\/\//i.test(track.thumbnail)) {
      artwork.src = track.thumbnail;
      artwork.hidden = false;
      artworkPlaceholder.hidden = true;
    } else {
      artwork.removeAttribute("src");
      artwork.hidden = true;
      artworkPlaceholder.hidden = false;
    }
    updateTheme();
    renderQueue();
    updateShortcuts();
    if(prefs.autoLyrics&&!lyricsEnabled){lyricsEnabled=true;updateLyricsVisibility();}
    if(lyricsEnabled) requestLyrics();
  }

  function refreshViews() {
    renderTracks(document.getElementById("home-recent-results"), recent.slice(0, 8), { recent: true, compact: true });
    renderTracks(document.getElementById("home-library-results"), library.slice(0, 8), { compact: true });
    renderPlaylistCards(document.getElementById("home-playlists"), playlists.slice(0, 4), true);
    refreshHomeRecommendations(false);
    renderTracks(results, lastSearchTracks, {});
    renderTracks(byId("video-results"), lastVideoTracks, { videos: true });
    renderSongList(document.getElementById("library-list"), library, "library");
    renderSongList(document.getElementById("favorites-list"), favorites, "favorites");
    renderSongList(document.getElementById("history-list"), recent, "history");
    renderPlaylistCards(document.getElementById("playlist-grid"), playlists, false);
    renderQueue();
    renderActivePlaylist();
    updateShortcuts();
    updateDashboardStats();
  }

  function updateDashboardStats() {
    var counts = {
      library: library.length,
      favorites: favorites.length,
      playlists: playlists.length,
      history: recent.length,
      queue: queue.length
    };
    Object.keys(counts).forEach(function (key) {
      var homeCount = byId("home-stat-" + key);
      if (homeCount) homeCount.textContent = String(counts[key]);
      var collectionCount = document.querySelector('[data-collection-count="' + key + '"]');
      if (collectionCount) collectionCount.textContent = String(counts[key]);
    });
    var libraryCount = byId("library-count");
    if (libraryCount) libraryCount.textContent = counts.library + (counts.library === 1 ? " canción" : " canciones");
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

  function addToLibrary(track, silent) {
    if (library.some(function (item) { return item.id === track.id; })) {
      if (!silent) setStatus("Esa canción ya está en tu biblioteca.");
      return false;
    }
    library.unshift(track);
    if (!saveList(storageKeys.library, library, 500)) {
      library.shift();
      return false;
    }
    refreshViews();
    if (!silent) setStatus("Guardada en tu biblioteca.");
    if (window.NexusAccount && window.NexusAccount.isSignedIn() && window.NexusAccount.saveTrack) {
      window.NexusAccount.saveTrack(track, 0).then(function () {
        return window.NexusAccount.updateLibraryOrder(library);
      }).catch(function (error) {
        console.error("No se pudo sincronizar la canción guardada con Biblioteca Nexus.", error);
        setStatus("Guardada en este dispositivo, pero no se pudo sincronizar con Biblioteca Nexus.", true);
      });
    }
    return true;
  }

  function moveLibraryTrack(songId, direction) {
    var index = library.findIndex(function (item) { return item.id === songId; });
    var nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= library.length) return;
    var previous = library.slice();
    var moved = library.splice(index, 1)[0];
    library.splice(nextIndex, 0, moved);
    if (!saveList(storageKeys.library, library, 500)) {
      library = previous;
      return;
    }
    refreshViews();
    setStatus("Orden actualizado en este dispositivo.");
    if (window.NexusAccount && window.NexusAccount.isSignedIn() && window.NexusAccount.updateLibraryOrder) {
      window.NexusAccount.updateLibraryOrder(library).then(function () {
        setStatus("Orden sincronizado con Biblioteca Nexus.");
      }).catch(function (error) {
        console.error("No se pudo sincronizar el orden de Biblioteca Nexus.", error);
        setStatus("El orden quedó guardado aquí, pero no se pudo sincronizar con Nexus.", true);
      });
    }
  }

  function removeFromLibrary(track) {
    var previous = library.slice();
    library = library.filter(function (item) { return item.id !== track.id; });
    if (!saveList(storageKeys.library, library, 500)) {
      library = previous;
      return;
    }

    var canRemoveFromCloud = track.provider !== "local" &&
      (/^[A-Za-z0-9_-]{11}$/.test(track.id) || /^au:[A-Za-z0-9_-]{1,80}$/.test(track.id)) &&
      window.NexusAccount && window.NexusAccount.isSignedIn();
    if (canRemoveFromCloud) {
      setStatus("Quitando la canción de tu Biblioteca Nexus…");
      window.NexusAccount.removeTrack(track.id).then(function () {
        refreshViews();
        setStatus("Quitada de tu Biblioteca Nexus.");
      }).catch(function (error) {
        console.error("No se pudo quitar la canción de Biblioteca Nexus.", error);
        library = previous;
        if (!saveList(storageKeys.library, library, 500)) {
          setStatus("No se pudo sincronizar la eliminación. Actualiza la página e inténtalo de nuevo.", true);
          return;
        }
        refreshViews();
        setStatus("No se pudo quitar de Biblioteca Nexus; la canción sigue en tu biblioteca.", true);
      });
      return;
    }

    refreshViews();
    setStatus(track.provider === "local"
      ? "Quitada de tu biblioteca. El archivo offline permanece almacenado en este navegador."
      : "Quitada de este navegador. Inicia sesión para quitarla también de Biblioteca Nexus.");
  }

  async function importLocalAudioFiles(files) {
    var imported = 0;
    var errors = [];
    for (var index = 0; index < files.length; index++) {
      var file = files[index];
      var hasAudioType = /^audio\//i.test(file.type);
      var hasAudioExtension = /\.(mp3|m4a|aac|ogg|opus|wav|flac|webm)$/i.test(file.name);
      if ((!hasAudioType && !hasAudioExtension) || file.size === 0 || file.size > 100 * 1024 * 1024) {
        errors.push(file.name + ": formato no compatible o supera el límite de 100 MB.");
        continue;
      }

      var fileName = file.name.replace(/\.[^.]+$/, "");
      var nameParts = fileName.split(/\s+-\s+/);
      var title = nameParts.length > 1 ? nameParts.slice(1).join(" - ") : fileName;
      var artist = nameParts.length > 1 ? nameParts[0] : "Archivo local";
      var id = "local:" + ((window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Date.now()) + "-" + Math.random().toString(36).slice(2));
      var track = { id: id, provider: "local", title: title || file.name, artist: artist, thumbnail: "", duration: "" };

      try {
        await storeLocalAudio(id, file);
        library.unshift(track);
        if (!saveList(storageKeys.library, library, 500)) {
          library.shift();
          await deleteLocalAudio(id);
          errors.push(file.name + ": el navegador no pudo guardar la biblioteca.");
          continue;
        }
        imported++;
      } catch (error) {
        console.error("No se pudo importar el archivo de audio.", error);
        errors.push(file.name + ": " + (error.message || "no se pudo guardar."));
      }
    }

    refreshViews();
    var offlineShellAvailable = serviceWorkerReady ? await serviceWorkerReady : false;
    var offlineShellWarning = offlineShellAvailable
      ? ""
      : " Abre la web en HTTPS para que el reproductor también funcione al volver a abrirla sin conexión.";
    if (imported && !errors.length) {
      setStatus(imported + (imported === 1 ? " archivo guardado para escuchar sin conexión." : " archivos guardados para escuchar sin conexión.") + offlineShellWarning, !offlineShellAvailable);
    } else if (imported) {
      setStatus(imported + " archivo(s) importado(s). " + errors.join(" ") + offlineShellWarning, true);
    } else if (errors.length) {
      setStatus(errors.join(" "), true);
    }
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

  function getRecommendationSeeds() {
    var scores = new Map();
    function addTracks(tracks, weight, limit) {
      tracks.slice(0, limit).forEach(function (track, index) {
        var names = String(track.artist || "")
          .replace(/\s*-\s*Topic$/i, "")
          .split(/\s*,\s*|\s+&\s+|\s+feat\.?\s+|\s+ft\.?\s+/i);
        names.forEach(function (name) {
          var artist = name.trim();
          if (artist.length < 2 || artist.length > 100 ||
              /^(archivo local|youtube(?: music)?(?:\s*[·-].*)?)$/i.test(artist)) return;
          var key = artist.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          var entry = scores.get(key);
          if (entry) entry.score += Math.max(1, weight - index);
          else scores.set(key, { name: artist, score: Math.max(1, weight - index) });
        });
      });
    }
    addTracks(recent, 30, 20);
    addTracks(favorites, 12, 12);
    addTracks(library, 4, 8);
    return Array.from(scores.values())
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 3)
      .map(function (artist) { return artist.name; });
  }

  function showRecommendationMessage(message, isError) {
    if (!homeRecommendationsList) return;
    var note = document.createElement("p");
    note.className = "web-player__empty";
    note.textContent = message;
    if (isError) note.classList.add("is-error");
    homeRecommendationsList.replaceChildren(note);
  }

  function renderRecommendationArtists() {
    if (!homeRecommendationArtists) return;
    homeRecommendationArtists.replaceChildren();
    homeRecommendationSeeds.forEach(function (artist) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "home-artist-chip";
      button.textContent = artist;
      button.setAttribute("aria-label", "Buscar más música de " + artist);
      button.addEventListener("click", function () {
        input.value = artist;
        byId("search-source").value = "youtube";
        setView("search");
        runSearch(artist);
      });
      homeRecommendationArtists.appendChild(button);
    });
  }

  function renderHomeRecommendations() {
    if (!homeRecommendationsList) return;
    var heard = new Set(recent.map(function (track) { return track.id; }));
    var tracks = homeRecommendations.filter(function (track) {
      return isTrack(track) && !heard.has(track.id);
    }).slice(0, 12);
    if (tracks.length) {
      renderTracks(homeRecommendationsList, tracks, { compact: true });
    } else if (homeRecommendationState === "loading") {
      showRecommendationMessage("Buscando canciones según tus artistas…");
    } else if (homeRecommendationState === "error") {
      showRecommendationMessage("No se pudieron cargar las recomendaciones. Pulsa Actualizar para intentarlo otra vez.", true);
    } else if (!homeRecommendationSeeds.length) {
      showRecommendationMessage("Escucha algunas canciones o guarda favoritos y aquí encontrarás recomendaciones para ti.");
    } else {
      showRecommendationMessage("Aún no encontramos canciones nuevas de tus artistas. Pulsa Actualizar para probar de nuevo.");
    }
  }

  function refreshHomeRecommendations(force) {
    if (!homeRecommendationsList) return;
    homeRecommendationSeeds = getRecommendationSeeds();
    renderRecommendationArtists();
    if (!homeRecommendationSeeds.length) {
      homeRecommendationSignature = "";
      homeRecommendations = [];
      homeRecommendationState = "idle";
      homeRecommendationRequestId++;
      renderHomeRecommendations();
      return;
    }

    var signature = homeRecommendationSeeds.map(function (artist) {
      return artist.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }).join("|");
    if (!force && signature === homeRecommendationSignature) {
      renderHomeRecommendations();
      return;
    }

    homeRecommendationSignature = signature;
    homeRecommendationState = "loading";
    homeRecommendations = [];
    var requestId = ++homeRecommendationRequestId;
    renderHomeRecommendations();
    Promise.allSettled(homeRecommendationSeeds.map(function (artist) {
      var endpoint = new URL("/api/music-search", location.origin);
      endpoint.searchParams.set("q", artist);
      endpoint.searchParams.set("source", "youtube");
      return fetch(endpoint, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(25000)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("No se pudo buscar música de " + artist + ".");
          return response.json();
        })
        .then(function (payload) {
          if (!payload || !Array.isArray(payload.items)) throw new Error("La búsqueda devolvió una respuesta incompleta.");
          return payload.items.filter(function (track) {
            return isTrack(track) && track.provider === "youtube" && track.kind !== "video";
          });
        });
    })).then(function (resultsByArtist) {
      if (requestId !== homeRecommendationRequestId) return;
      var seen = new Set();
      homeRecommendations = resultsByArtist
        .filter(function (result) { return result.status === "fulfilled"; })
        .flatMap(function (result) { return result.value; })
        .filter(function (track) {
          if (seen.has(track.id)) return false;
          seen.add(track.id);
          return true;
        });
      homeRecommendationState = homeRecommendations.length ? "ready" : "error";
      renderHomeRecommendations();
    }).catch(function (error) {
      if (requestId !== homeRecommendationRequestId) return;
      console.error("No se pudieron cargar las recomendaciones de Inicio.", error);
      homeRecommendationState = "error";
      renderHomeRecommendations();
    });
  }

  function playTrack(track) {
    if (!isTrack(track)) return;
    if (roomSocket && roomSocket.readyState === WebSocket.OPEN && startRoomTrack(track)) return;
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
    if (prefs.autoSavePlayed) addToLibrary(track, true);
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
        : options.videos
          ? "Busca un título, un canal o un creador para encontrar videos de YouTube."
        : "Todavía no hay canciones. Busca algo y guárdalo en tu colección.";
      container.appendChild(empty);
      return;
    }

    tracks.forEach(function (track) {
      if(isCatalog(track)){renderCatalogCard(container,track);return;}
      var card = document.createElement("article");
      card.className = "web-song";
      if (options.videos || track.kind === "video") card.classList.add("video-result-card");
      if (options.compact) card.classList.add("web-song--compact");
      var image = document.createElement("div");
      image.className = "web-song__art";
      image.appendChild(createArtwork(track));
      var sourceBadge = document.createElement("span");
      sourceBadge.className = "web-song__source-badge";
      sourceBadge.textContent = track.kind === "video" ? "VIDEO" : track.provider === "youtube" ? "YT MUSIC" : sourceName(track);
      image.appendChild(sourceBadge);
      if (track.duration) {
        var durationBadge = document.createElement("span");
        durationBadge.className = "web-song__duration";
        durationBadge.textContent = track.duration;
        image.appendChild(durationBadge);
      }
      var title = document.createElement("div");
      title.className = "web-song__title";
      title.textContent = track.title;
      title.title = track.title;
      var artist = document.createElement("div");
      artist.className = "web-song__artist";
      artist.textContent = track.artist;
      artist.title = track.artist;
      var album = null;
      if (track.album || track.kind === "video") {
        album = document.createElement("div");
        album.className = "web-song__album";
        album.textContent = track.album || "Video de YouTube";
        album.title = track.album || "";
      }
      var actions = document.createElement("div");
      actions.className = "web-song__actions";
      var play = document.createElement("button");
      play.type = "button";
      play.className = "primary";
      play.textContent = track.kind === "video" ? "▶ Ver video" : "▶ Escuchar";
      play.setAttribute("aria-label", (track.kind === "video" ? "Ver " : "Escuchar ") + track.title);
      play.addEventListener("click", function () { playContext=tracks.filter(isTrack);playTrack(track); });
      var actionBar = document.createElement("div");
      actionBar.className = "web-song__quick-actions";
      if (track.kind === "video") {
        var openVideo = document.createElement("a");
        openVideo.className = "web-song__video-link";
        openVideo.href = sourceUrl(track);
        openVideo.target = "_blank";
        openVideo.rel = "noopener noreferrer";
        openVideo.textContent = "Abrir en YouTube ↗";
        actionBar.appendChild(openVideo);
      }
      actionBar.append(
        createIconButton("＋", "Guardar en biblioteca", function () { addToLibrary(track); }),
        createIconButton(favorites.some(function (item) { return item.id === track.id; }) ? "♥" : "♡",
          favorites.some(function (item) { return item.id === track.id; }) ? "Quitar de favoritos" : "Añadir a favoritos",
          function () { toggleFavorite(track); }),
        createIconButton("≡", "Añadir a la cola", function () { addToQueue(track, false); }),
        createIconButton("☷", "Añadir a playlist", function () { openQuickPlaylist(track); })
      );
      actions.append(play, actionBar);
      card.append(image, title, artist);
      if (album) card.appendChild(album);
      card.appendChild(actions);
      card.classList.toggle("is-current", track.id===currentTrackId);
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
      artist.textContent = track.artist + (track.provider === "local" ? " · Guardada sin conexión" : "");
      meta.append(title, artist);
      var play = document.createElement("button");
      play.type = "button";
      play.className = "web-song-row__play";
      play.textContent = "▶";
      play.setAttribute("aria-label", "Reproducir " + track.title);
      play.addEventListener("click", function () { playContext=tracks.filter(isTrack);playTrack(track); });
      var actions = document.createElement("div");
      actions.className = "web-song-row__actions";
      if (mode === "library") {
        var moveUp = createIconButton("↑", "Mover " + track.title + " arriba", function () {
          moveLibraryTrack(track.id, -1);
        });
        moveUp.disabled = index === 0;
        var moveDown = createIconButton("↓", "Mover " + track.title + " abajo", function () {
          moveLibraryTrack(track.id, 1);
        });
        moveDown.disabled = index === tracks.length - 1;
        actions.append(moveUp, moveDown);
        actions.appendChild(createIconButton("♡", "Añadir a favoritos", function () { toggleFavorite(track); }));
      } else if (mode === "favorites") {
        actions.appendChild(createIconButton("♥", "Quitar de favoritos", function () { toggleFavorite(track); }));
      }
      if (mode !== "history") {
        actions.appendChild(createIconButton("≡", "Añadir a la cola", function () { addToQueue(track, false); }));
      }
      if (mode === "library" || mode === "favorites") {
        actions.appendChild(createIconButton("×", "Quitar de " + (mode === "library" ? "la biblioteca" : "favoritos"), function () {
          if (mode === "library") {
            removeFromLibrary(track);
            return;
          }
          var old = favorites.slice();
          favorites = favorites.filter(function (item) { return item.id !== track.id; });
          if (!saveList(storageKeys.favorites, favorites, 500)) {
            favorites = old;
            return;
          }
          refreshViews();
          setStatus("Quitada de favoritos.");
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
        document.getElementById("playlists-view").classList.add("has-active-playlist");
        renderActivePlaylist();
        document.getElementById("playlist-detail").hidden = false;
        document.querySelector(".web-app__views").scrollTo({ top: 0, behavior: "smooth" });
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
      document.getElementById("playlists-view").classList.remove("has-active-playlist");
      return;
    }
    detail.hidden = false;
    document.getElementById("playlist-detail-title").textContent = playlist.name;
    var container = document.getElementById("playlist-track-list");
    container.replaceChildren();
    container.classList.toggle("web-song-list--playlist", playlist.tracks.length > 0);
    var playlistHint = detail.querySelector(".web-playlist-hint");
    if (playlistHint) playlistHint.hidden = true;
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
    var queueHomeCount = byId("home-stat-queue");
    if (queueHomeCount) queueHomeCount.textContent = String(queue.length);
    var queueSummary = document.querySelector('[data-collection-count="queue"]');
    if (queueSummary) queueSummary.textContent = String(queue.length);
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
    nextButton.disabled = !currentTrack || (currentIndex >= queue.length - 1 && !prefs.autoplay && !contextNext());
  }

  function contextNext(){var i=playContext.findIndex(function(t){return t.id===currentTrackId;});return i<0?null:playContext.slice(i+1).find(function(t){return t.id!==currentTrackId&&isTrack(t);})||null;}
  function nextCandidate(list){var candidates=list.filter(function(t){return isTrack(t)&&t.id!==currentTrackId;});return candidates.length?(prefs.shuffle?candidates[Math.floor(Math.random()*candidates.length)]:candidates[0]):null;}
  function playContinuous(t){if(queue.length>=maxQueueSize&&!queue.some(function(x){return x.id===t.id;})){queue.shift();saveList(storageKeys.queue,queue,maxQueueSize);}playTrack(t);}
  async function findRelated(){if(relatedBusy||!currentTrack)return;relatedBusy=true;var generation=playbackGeneration,base=currentTrack;setStatus('Buscando la siguiente canción…');try{var u=new URL('/api/music-search',location.origin);u.searchParams.set('q',(base.artist||base.title).slice(0,100));u.searchParams.set('source',base.provider==='audius'?'audius':'all');var r=await fetch(u,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error();var data=await r.json();if(generation!==playbackGeneration||!prefs.autoplay)return;var played=new Set(recent.map(function(t){return t.id;}));var next=nextCandidate((data.items||[]).filter(function(t){return !played.has(t.id)&&!queue.some(function(x){return x.id===t.id;});}));if(next)playContinuous(next);else setStatus('No encontramos más canciones disponibles. Busca otra canción para continuar.');}catch(_){if(generation===playbackGeneration)setStatus('No se pudo cargar la siguiente canción. Intenta buscar de nuevo.',true);}finally{if(generation===playbackGeneration)relatedBusy=false;}}
  function changeTrack(offset, ended) {if(!currentTrack)return;var i=queue.findIndex(function(t){return t.id===currentTrackId;});if(ended){if(endHandled)return;endHandled=true;if(prefs.repeat){prepareTrack(currentTrack,true);return;}if(prefs.stopAfterCurrent){if(mode==='audio')audio.pause();else if(playerReady&&player)player.pauseVideo();syncButton(false);setStatus('La reproducción se detuvo al terminar la canción.');return;}}if(offset<0){if(queue[i-1])playTrack(queue[i-1]);else if(clock().time>0)seekTo(0);return;}var target=nextCandidate(queue.slice(i+1))||contextNext();if(target&&target.id!==currentTrackId){playContinuous(target);return;}if(prefs.autoplay)void findRelated();else if(ended)setStatus('Terminó la cola de reproducción.');}

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
    if (viewName === "rooms") refreshPublicRooms();
    if(document.body.classList.contains("player-expanded")) setExpanded(false);
    document.querySelector(".web-app__views").scrollTop = 0;
  }

  function roomStatus(message, isError) {
    var status = byId("rooms-status");
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("is-error", Boolean(isError));
  }

  function setRoomLiveMode(inRoom) {
    if (!roomView) return;
    roomView.classList.toggle("is-in-room", inRoom);
    roomView.querySelector(".rooms-hero").hidden = inRoom;
    roomView.querySelector(".rooms-lobby").hidden = inRoom;
  }

  function roomApiError(data, fallback) {
    if (data && typeof data.detail === "string") return data.detail;
    if (data && typeof data.error === "string") return data.error;
    return fallback || "No se pudo completar la solicitud de la sala.";
  }

  function readRoomAvatar() {
    try {
      var avatar = localStorage.getItem(roomAvatarKey) || "";
      return avatar.length <= 12000 && /^[A-Za-z0-9+/]+={0,2}$/.test(avatar) ? avatar : "";
    } catch (error) {
      console.warn("No se pudo leer la foto de perfil de la sala.", error);
      return "";
    }
  }

  function renderRoomAvatarPreview(avatar) {
    [byId("room-avatar-preview"), byId("room-avatar-preview-live")].forEach(function (preview) {
      if (!preview) return;
      preview.replaceChildren();
      if (avatar) {
        var image = document.createElement("img");
        image.alt = "Foto de perfil";
        image.src = "data:image/jpeg;base64," + avatar;
        preview.appendChild(image);
      } else {
        preview.textContent = "♫";
      }
    });
    var removeButton = byId("room-avatar-remove");
    if (removeButton) removeButton.disabled = !avatar;
  }

  function storeRoomAvatar(avatar) {
    try {
      if (avatar) localStorage.setItem(roomAvatarKey, avatar);
      else localStorage.removeItem(roomAvatarKey);
    } catch (error) {
      console.error("No se pudo guardar la foto de perfil de la sala.", error);
      roomStatus("No se pudo guardar la foto en este navegador. Prueba con otra imagen.", true);
      return false;
    }
    renderRoomAvatarPreview(avatar);
    if (roomSocket && roomSocket.readyState === WebSocket.OPEN &&
        !roomSend({ t: "avatar", data: avatar })) {
      roomStatus("No se pudo actualizar la foto en la sala. Comprueba la conexión.", true);
      return false;
    }
    return true;
  }

  function compressRoomAvatar(file) {
    if (!file || !/^image\/(jpeg|png|webp)$/i.test(file.type) || file.size > 10 * 1024 * 1024) {
      roomStatus("Elige una imagen JPG, PNG o WebP de menos de 10 MB.", true);
      return;
    }
    var reader = new FileReader();
    reader.onerror = function () { roomStatus("No se pudo leer la imagen seleccionada.", true); };
    reader.onload = function () {
      var image = new Image();
      image.onerror = function () { roomStatus("El archivo seleccionado no es una imagen válida.", true); };
      image.onload = function () {
        var canvas = document.createElement("canvas");
        var cropSize = Math.min(image.naturalWidth, image.naturalHeight);
        var cropX = (image.naturalWidth - cropSize) / 2;
        var cropY = (image.naturalHeight - cropSize) / 2;
        var encoded = "";
        var contextUnavailable = false;
        [96, 80, 64].some(function (size) {
          canvas.width = size;
          canvas.height = size;
          var context = canvas.getContext("2d");
          if (!context) {
            contextUnavailable = true;
            return true;
          }
          context.clearRect(0, 0, size, size);
          context.drawImage(image, cropX, cropY, cropSize, cropSize, 0, 0, size, size);
          return [0.82, 0.72, 0.62].some(function (quality) {
            encoded = canvas.toDataURL("image/jpeg", quality).split(",")[1] || "";
            return encoded.length <= 11500;
          });
        });
        if (contextUnavailable) {
          roomStatus("No se pudo procesar la imagen seleccionada en este navegador.", true);
          return;
        }
        if (!encoded || encoded.length > 12000) {
          roomStatus("No se pudo reducir la foto a un tamaño compatible. Prueba una imagen más pequeña.", true);
          return;
        }
        if (storeRoomAvatar(encoded)) roomStatus("Foto de perfil guardada.");
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  }

  function persistRoomName(value, notifyRoom) {
    var rawName = String(value || "").slice(0, 24);
    var name = rawName.trim();
    var displayName = notifyRoom ? name : rawName;
    [byId("room-name-input"), byId("room-live-name")].forEach(function (input) {
      if (input && input.value !== displayName) input.value = displayName;
    });
    try { localStorage.setItem(roomNameKey, name); }
    catch (error) {
      console.warn("No se pudo guardar el apodo de la sala.", error);
      roomStatus("No se pudo guardar el apodo en este navegador.", true);
    }
    if (notifyRoom && name && roomSocket && roomSocket.readyState === WebSocket.OPEN) {
      if (!roomSend({ t: "rename", name: name })) roomStatus("No se pudo actualizar el apodo en la sala.", true);
    }
  }

  function drawRoomAvatar(target, member) {
    if (member.avatar && member.avatar.length <= 12000 && /^[A-Za-z0-9+/]+={0,2}$/.test(member.avatar)) {
      var image = document.createElement("img");
      image.alt = "";
      image.src = "data:image/jpeg;base64," + member.avatar;
      target.appendChild(image);
      return;
    }
    target.textContent = member.name.slice(0, 1).toUpperCase();
  }

  async function roomApi(path, options) {
    var response = await fetch("/api/rooms" + (path || ""), Object.assign({
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(60000)
    }, options || {}));
    var payload = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(roomApiError(payload));
    return payload;
  }

  function roomIdentity() {
    var nameInput = byId("room-name-input");
    var name = (nameInput && nameInput.value.trim()) ||
      (function () { try { return localStorage.getItem(roomNameKey) || ""; } catch (_) { return ""; } })() ||
      "Oyente";
    name = name.slice(0, 24);
    if (nameInput) nameInput.value = name;
    try { localStorage.setItem(roomNameKey, name); }
    catch (error) { console.warn("No se pudo guardar el apodo de la sala.", error); }
    var install = "";
    try {
      install = localStorage.getItem(roomInstallKey) || "";
      if (!/^[\w-]{16,64}$/.test(install)) {
        install = window.crypto && crypto.randomUUID
          ? crypto.randomUUID()
          : "web-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(roomInstallKey, install);
      }
    } catch (error) {
      console.warn("No se pudo guardar la identidad temporal de la sala.", error);
      install = "web-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    return { name: name, install: install, avatar: readRoomAvatar() };
  }

  function renderRoomMembers() {
    var list = byId("room-members-list");
    if (!list) return;
    list.replaceChildren();
    roomMembers.forEach(function (member) {
      var item = document.createElement("li");
      var avatar = document.createElement("span");
      avatar.className = "room-member__avatar";
      drawRoomAvatar(avatar, member);
      var name = document.createElement("span");
      name.className = "room-member__name";
      name.textContent = member.name + (member.id === roomMe?.id ? " (tú)" : "");
      item.append(avatar, name);
      list.appendChild(item);
    });
    byId("room-live-count").textContent = roomMembers.length + " de 4 personas";
  }

  function appendRoomMessage(name, text, kind) {
    var messages = byId("room-chat-messages");
    if (!messages) return;
    var item = document.createElement("p");
    item.className = kind === "system" ? "room-chat__system" : "room-chat__message";
    if (kind !== "system") {
      var sender = document.createElement("strong");
      sender.textContent = name || "Oyente";
      item.appendChild(sender);
    }
    var body = document.createElement("span");
    body.textContent = text;
    item.appendChild(body);
    messages.appendChild(item);
    while (messages.children.length > 80) messages.firstElementChild.remove();
    messages.scrollTop = messages.scrollHeight;
  }

  function renderPublicRooms(rooms) {
    var container = byId("rooms-public-list");
    if (!container) return;
    container.replaceChildren();
    if (!rooms.length) {
      var empty = document.createElement("p");
      empty.className = "web-player__empty";
      empty.textContent = "No hay salas públicas activas. Crea una e invita a tus amigos con el código.";
      container.appendChild(empty);
      return;
    }
    rooms.forEach(function (room) {
      var card = document.createElement("article");
      card.className = "room-public-card";
      var cover = document.createElement("img");
      cover.alt = "";
      cover.loading = "lazy";
      cover.src = /^https:\/\//i.test(room.artwork || "") ? room.artwork : "assets/Nexus-logo.png";
      cover.onerror = function () { this.onerror = null; this.src = "assets/Nexus-logo.png"; };
      var copy = document.createElement("div");
      copy.className = "room-public-card__copy";
      var title = document.createElement("strong");
      title.textContent = room.title || "Sala de escucha";
      var details = document.createElement("small");
      details.textContent = (room.track ? room.track + (room.artist ? " · " + room.artist : "") : "Elige una canción") +
        " · " + room.members + "/" + (room.max_members || 4);
      copy.append(title, details);
      var join = document.createElement("button");
      join.type = "button";
      join.className = "primary";
      join.textContent = "Entrar";
      join.disabled = room.members >= room.max_members;
      join.addEventListener("click", function () { connectToRoom(room.code); });
      card.append(cover, copy, join);
      container.appendChild(card);
    });
  }

  async function refreshPublicRooms() {
    var list = byId("rooms-public-list");
    if (!list) return;
    if (!list.children.length) {
      var loading = document.createElement("p");
      loading.className = "web-player__empty";
      loading.textContent = "Cargando salas públicas…";
      list.appendChild(loading);
    }
    try {
      var payload = await roomApi("");
      renderPublicRooms(Array.isArray(payload.rooms) ? payload.rooms : []);
      if (!roomSocket || roomSocket.readyState !== WebSocket.OPEN) {
        roomStatus("Servidor de salas conectado.");
      }
    } catch (error) {
      renderPublicRooms([]);
      var message = list.querySelector(".web-player__empty");
      if (message) message.textContent = error.message || "No se pudo cargar la lista de salas públicas.";
      roomStatus(error.message || "No se pudo cargar la lista de salas.", true);
    }
  }

  function roomSend(message) {
    if (!roomSocket || roomSocket.readyState !== WebSocket.OPEN) return false;
    try {
      roomSocket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.warn("No se pudo enviar el mensaje a la sala.", error);
      return false;
    }
  }

  function roomPublishState(action, playing, positionMs) {
    if (!roomSocket || roomSocket.readyState !== WebSocket.OPEN || roomPreparing ||
        Date.now() < roomSuppressedUntil || !currentTrack || currentTrackId !== roomTrackId) return;
    var sharedTrack = roomTrackData(currentTrack);
    if (!sharedTrack) return;
    if (typeof playing !== "boolean") {
      try { playing = playerReady && player && player.getPlayerState() === YT.PlayerState.PLAYING; }
      catch (_) { playing = false; }
    }
    roomSend({
      t: "state",
      action: action,
      position_ms: Number.isFinite(Number(positionMs)) ? Math.max(0, Math.round(Number(positionMs))) : Math.round(roomPosition()),
      playing: playing,
      track: sharedTrack
    });
  }

  function roomTrackData(track) {
    if (!track || !/^[A-Za-z0-9_-]{11}$/.test(track.id || "")) return null;
    var seconds = track.duration ? durationSeconds(track.duration) : 0;
    return {
      id: track.id,
      title: String(track.title || "Video de YouTube").slice(0, 200),
      artist: String(track.artist || "YouTube").slice(0, 200),
      artwork: String(track.thumbnail || "").slice(0, 600),
      duration_ms: Math.min(24 * 60 * 60 * 1000, Math.max(0, Math.round(seconds * 1000)))
    };
  }

  function roomCanPlayTrack(track) {
    return Boolean(roomTrackData(track) &&
      (!track.provider || track.provider === "youtube" || track.kind === "video"));
  }

  function roomTrackFromMessage(data) {
    if (!data || !/^[A-Za-z0-9_-]{11}$/.test(data.id || "")) return null;
    return {
      id: data.id,
      title: String(data.title || "Video de YouTube"),
      artist: String(data.artist || "YouTube"),
      thumbnail: /^https:\/\//i.test(data.artwork || "") ? data.artwork : "https://i.ytimg.com/vi/" + data.id + "/hqdefault.jpg",
      duration: data.duration_ms > 0 ? formatTime(data.duration_ms / 1000) : "",
      provider: "youtube",
      kind: "video"
    };
  }

  function roomStopUnsupportedTrack() {
    roomTrackId = "";
    roomPreparing = null;
    roomStartAfterCue = null;
    roomSuppressedUntil = Date.now() + 2500;
    if (mode === "audio") audio.pause();
    else if (mode === "youtube" && playerReady && player) player.pauseVideo();
    syncButton(false);
    byId("room-now-track").textContent = "Esta pista no se puede sincronizar en la web.";
    roomStatus("La sala recibió una pista que no es compatible con el reproductor web.", true);
  }

  function addRoomTrackToQueue(track) {
    if (!queue.some(function (item) { return item.id === track.id; })) {
      if (queue.length >= maxQueueSize) queue.shift();
      queue.push(track);
      saveList(storageKeys.queue, queue, maxQueueSize);
    }
    updateQueueCount();
    renderQueue();
  }

  function roomPosition() {
    try {
      if (mode === "youtube" && playerReady && player) return Math.max(0, player.getCurrentTime() * 1000);
    } catch (_) {}
    return 0;
  }

  function roomServerNow() {
    return Date.now() + roomServerOffsetMs;
  }

  function roomProjectedPosition(positionMs, serverMs, playing) {
    var position = Math.max(0, Number(positionMs) || 0);
    if (playing && Number(serverMs) > 0) position += Math.max(0, roomServerNow() - Number(serverMs));
    return Math.min(position, 24 * 60 * 60 * 1000);
  }

  function roomLoadCued(track, prepare) {
    if (!roomCanPlayTrack(track)) {
      roomStatus("Esta sala sincroniza videos de YouTube. Elige un resultado de YouTube para todos.", true);
      return false;
    }
    if (prepare && roomPreparing && roomPreparing.seq === prepare.seq && roomPreparing.id === track.id) return true;
    roomPreparing = prepare ? { seq: prepare.seq, id: track.id, positionMs: prepare.positionMs || 0 } : null;
    roomStartAfterCue = null;
    roomSuppressedUntil = Date.now() + 5000;
    addRoomTrackToQueue(track);
    currentTrack = track;
    currentTrackId = track.id;
    roomTrackId = track.id;
    prepareTrack(track, false);
    rememberTrack(track);
    if (mode !== "youtube") return false;
    placeholder.hidden = true;
    var frame = byId("player-host");
    if (frame) frame.hidden = false;
    if (playerReady && player) {
      player.cueVideoById({ videoId: track.id, startSeconds: prepare ? (prepare.positionMs || 0) / 1000 : 0 });
    } else {
      loadYouTubeApi();
    }
    return true;
  }

  function roomApplyPlayback(positionMs, playing, serverMs, action) {
    if (!currentTrack || currentTrackId !== roomTrackId || mode !== "youtube") return;
    if (!playerReady || !player) {
      if (!roomPreparing) roomLoadCued(currentTrack, { seq: 0, positionMs: positionMs });
      roomStartAfterCue = {
        positionMs: positionMs,
        playing: playing,
        serverMs: serverMs,
        action: action
      };
      return;
    }
    var target = roomProjectedPosition(positionMs, serverMs, playing) / 1000;
    roomSuppressedUntil = Date.now() + 1800;
    try {
      var duration = player.getDuration();
      if (Number.isFinite(duration) && duration > 0) target = Math.min(target, duration);
      var current = player.getCurrentTime();
      if (action === "seek" || Math.abs(current - target) > 0.7) player.seekTo(target, true);
      if (playing) player.playVideo();
      else player.pauseVideo();
    } catch (error) {
      console.warn("No se pudo sincronizar la reproducción de la sala.", error);
    }
  }

  function roomFinishCue() {
    if (!roomPreparing || !playerReady || !player || currentTrackId !== roomPreparing.id) return;
    if (roomPreparing.seq > 0) roomSend({ t: "ready", seq: roomPreparing.seq });
    if (roomStartAfterCue) {
      var start = roomStartAfterCue;
      roomStartAfterCue = null;
      roomPreparing = null;
      roomApplyPlayback(start.positionMs, start.playing, start.serverMs, start.action);
    }
  }

  function roomHandleMessage(message) {
    if (Number(message.server_ms) > 0) {
      var measured = Number(message.server_ms) - Date.now() + roomRttMs / 2;
      roomServerOffsetMs = roomRttMs ? (roomServerOffsetMs * 3 + measured) / 4 : measured;
    }
    if (message.t === "joined") {
      roomMe = message.me || null;
      if (roomMe && roomMe.name) persistRoomName(roomMe.name, false);
      if (roomMe && roomMe.avatar) {
        try { localStorage.setItem(roomAvatarKey, roomMe.avatar); }
        catch (error) { console.warn("No se pudo guardar la foto confirmada por la sala.", error); }
        renderRoomAvatarPreview(roomMe.avatar);
      }
      roomMembers = (message.members || []).map(function (member) {
        return { id: member.id, name: member.name || "Oyente", avatar: member.avatar || "" };
      });
      roomVisibility = message.visibility === "public" ? "public" : "private";
      byId("room-live").hidden = false;
      setRoomLiveMode(true);
      byId("room-live-code").textContent = message.code || "";
      byId("room-live-title").textContent = message.title || "Sala de escucha";
      byId("room-live-visibility").textContent = roomVisibility === "public" ? "SALA PÚBLICA" : "SALA PRIVADA";
      byId("room-chat-messages").replaceChildren();
      renderRoomMembers();
      var state = message.state || {};
      var track = roomTrackFromMessage(state.track);
      var unsupportedRoomTrack = Boolean(state.track && !track);
      if (track) {
        if (state.action === "prepare") {
          roomLoadCued(track, { seq: Number(state.seq) || 0, positionMs: state.position_ms || 0 });
          byId("room-now-track").textContent = "Preparando: " + track.title + " · " + track.artist;
        } else {
          currentTrack = track;
          currentTrackId = track.id;
          roomLoadCued(track, { seq: 0, positionMs: state.position_ms || 0 });
          roomStartAfterCue = {
            positionMs: state.position_ms || 0,
            playing: Boolean(state.playing),
            serverMs: 0,
            action: "seek"
          };
          byId("room-now-track").textContent = "Sincronizando: " + track.title + " · " + track.artist;
        }
      } else {
        if (state.track) roomStopUnsupportedTrack();
        else {
          roomTrackId = "";
          byId("room-now-track").textContent = "Todavía no hay música en la sala.";
          roomSuppressedUntil = Date.now() + 2500;
          if (mode === "audio") audio.pause();
          else if (mode === "youtube" && playerReady && player) player.pauseVideo();
        }
      }
      roomStatus(unsupportedRoomTrack
        ? "Conectado a la sala, pero su pista actual no es compatible con el reproductor web."
        : "Conectado a la sala " + (message.code || "") + ".",
      unsupportedRoomTrack);
      roomRetryCount = 0;
      clearInterval(roomPingTimer);
      clearInterval(roomSyncTimer);
      roomPingTimer = window.setInterval(function () {
        roomPingSentAt = Date.now();
        roomSend({ t: "ping", at: roomPingSentAt });
      }, 20000);
      roomSyncTimer = window.setInterval(function () {
        if (roomSocket && roomSocket.readyState === WebSocket.OPEN && roomTrackId && roomTrackId === currentTrackId && mode === "youtube" && playerReady && window.YT) {
          roomSend({ t: "sync", position_ms: Math.round(roomPosition()), playing: playerReady && player.getPlayerState() === YT.PlayerState.PLAYING });
        }
      }, 6000);
      return;
    }
    if (message.t === "presence") {
      roomMembers = (message.members || []).map(function (member) {
        return { id: member.id, name: member.name || "Oyente", avatar: member.avatar || "" };
      });
      if (roomMe) {
        var currentMember = roomMembers.find(function (member) { return member.id === roomMe.id; });
        if (currentMember) {
          roomMe.name = currentMember.name;
          roomMe.avatar = currentMember.avatar;
          if (currentMember.avatar) {
            try { localStorage.setItem(roomAvatarKey, currentMember.avatar); }
            catch (error) { console.warn("No se pudo guardar la foto confirmada por la sala.", error); }
          }
          renderRoomAvatarPreview(currentMember.avatar || readRoomAvatar());
          persistRoomName(currentMember.name, false);
        }
      }
      renderRoomMembers();
      return;
    }
    if (message.t === "renamed") {
      if (roomMe) roomMe.name = message.name || roomMe.name;
      if (roomMe) {
        roomMembers = roomMembers.map(function (member) {
          return member.id === roomMe.id ? Object.assign({}, member, { name: roomMe.name }) : member;
        });
        persistRoomName(roomMe.name, false);
        renderRoomMembers();
      }
      return;
    }
    if (message.t === "prepare") {
      var prepared = roomTrackFromMessage(message.track);
      if (!prepared) {
        roomStopUnsupportedTrack();
        return;
      }
      roomLoadCued(prepared, { seq: Number(message.seq) || 0, positionMs: Number(message.position_ms) || 0 });
      byId("room-now-track").textContent = "Preparando: " + prepared.title + " · " + prepared.artist;
      roomStatus((message.name || "Alguien") + " está preparando una canción…");
      return;
    }
    if (message.t === "go") {
      var goTrack = roomTrackFromMessage(message.track);
      if (message.track && !goTrack) {
        roomStopUnsupportedTrack();
        return;
      }
      if (goTrack && goTrack.id !== currentTrackId) {
        roomLoadCued(goTrack, { seq: 0, positionMs: Number(message.position_ms) || 0 });
        roomStartAfterCue = {
          positionMs: Number(message.position_ms) || 0,
          playing: Boolean(message.playing),
          serverMs: Number(message.server_ms) || 0,
          action: "seek"
        };
        byId("room-now-track").textContent = goTrack.title + " · " + goTrack.artist;
      } else {
        if (goTrack) roomTrackId = goTrack.id;
        roomPreparing = null;
        roomApplyPlayback(message.position_ms, Boolean(message.playing), message.server_ms, "seek");
      }
      roomStatus("Reproduciendo en sincronía.");
      return;
    }
    if (message.t === "state") {
      var stateTrack = roomTrackFromMessage(message.track);
      if (message.track && !stateTrack) {
        roomStopUnsupportedTrack();
        return;
      }
      if (stateTrack && stateTrack.id !== currentTrackId) {
        roomLoadCued(stateTrack, { seq: 0, positionMs: Number(message.position_ms) || 0 });
        roomStartAfterCue = {
          positionMs: Number(message.position_ms) || 0,
          playing: Boolean(message.playing),
          serverMs: Number(message.server_ms) || 0,
          action: message.action || "seek"
        };
        byId("room-now-track").textContent = stateTrack.title + " · " + stateTrack.artist;
      } else {
        if (stateTrack) roomTrackId = stateTrack.id;
        if (stateTrack) byId("room-now-track").textContent = stateTrack.title + " · " + stateTrack.artist;
        roomApplyPlayback(message.position_ms, Boolean(message.playing), message.server_ms, message.action || "play");
      }
      return;
    }
    if (message.t === "sync") {
      if (roomTrackId && roomTrackId === currentTrackId && currentTrack && mode === "youtube" && playerReady && player) {
        var target = roomProjectedPosition(message.position_ms, message.server_ms, Boolean(message.playing)) / 1000;
        var current = player.getCurrentTime();
        if (Math.abs(current - target) > 0.75) roomApplyPlayback(target * 1000, Boolean(message.playing), 0, "seek");
      }
      return;
    }
    if (message.t === "chat") {
      appendRoomMessage(message.name, message.text || "", "chat");
      return;
    }
    if (message.t === "typing") {
      roomStatus((message.name || "Alguien") + " está escribiendo…");
      window.setTimeout(function () {
        if (roomSocket && roomSocket.readyState === WebSocket.OPEN) roomStatus("Conectado a la sala " + byId("room-live-code").textContent + ".");
      }, 2500);
      return;
    }
    if (message.t === "reaction") {
      appendRoomMessage(message.name || "Alguien", "reaccionó " + (message.emoji || "♫"), "chat");
      return;
    }
    if (message.t === "left") {
      roomMembers = (message.members || []).map(function (member) {
        return { id: member.id, name: member.name || "Oyente", avatar: member.avatar || "" };
      });
      renderRoomMembers();
      appendRoomMessage("", (message.name || "Alguien") + " salió de la sala.", "system");
      return;
    }
    if (message.t === "room_meta") {
      byId("room-live-title").textContent = message.title || "Sala de escucha";
      return;
    }
    if (message.t === "pong" && roomPingSentAt) {
      roomRttMs = Math.max(0, Date.now() - roomPingSentAt);
      roomServerOffsetMs = Number(message.server_ms) - Date.now() + roomRttMs / 2;
      return;
    }
    if (message.t === "closed" || message.t === "kicked" || message.t === "error") {
      roomStatus(message.reason || message.msg || "La conexión a la sala se cerró.", true);
      leaveRoom(false);
    }
  }

  function connectToRoom(rawCode, reconnecting) {
    var code = String(rawCode || "").trim().toUpperCase();
    if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) {
      roomStatus("Escribe un código de sala válido de 6 caracteres.", true);
      return;
    }
    if (!reconnecting) leaveRoom(false, true);
    roomConnectionWanted = true;
    if (!reconnecting) roomRetryCount = 0;
    roomStatus("Conectando a la sala " + code + "…");
    var identity = roomIdentity();
    var url = "wss://openytmusic-analytics-keau.onrender.com/v1/room/" + encodeURIComponent(code) + "/ws";
    var socket;
    try { socket = new WebSocket(url); }
    catch (error) { roomConnectionWanted = false; roomStatus("No se pudo abrir la conexión de salas.", true); return; }
    roomSocket = socket;
    socket.addEventListener("open", function () {
      if (roomSocket !== socket) return;
      socket.send(JSON.stringify({ t: "hello", name: identity.name, install: identity.install, avatar: identity.avatar }));
    });
    socket.addEventListener("message", function (event) {
      if (roomSocket !== socket) return;
      try { roomHandleMessage(JSON.parse(event.data)); }
      catch (error) { console.error("Mensaje de sala inválido.", error); }
    });
    socket.addEventListener("error", function () {
      if (roomSocket === socket) roomStatus("No se pudo conectar con la sala. El servidor podría estar despertando.", true);
    });
    socket.addEventListener("close", function () {
      if (roomSocket !== socket) return;
      roomSocket = null;
      clearInterval(roomPingTimer);
      clearInterval(roomSyncTimer);
      if (roomConnectionWanted && roomRetryCount < 5) {
        roomRetryCount += 1;
        roomStatus("Conexión interrumpida. Reintentando…");
        roomReconnectTimer = window.setTimeout(function () { connectToRoom(code, true); }, Math.min(10000, 1000 * roomRetryCount));
      } else if (roomConnectionWanted) {
        leaveRoom(false);
        roomStatus("No se pudo mantener la conexión. Comprueba el servidor e inténtalo de nuevo.", true);
      }
    });
  }

  function leaveRoom(showMessage, replacing) {
    roomConnectionWanted = false;
    clearTimeout(roomReconnectTimer);
    clearInterval(roomPingTimer);
    clearInterval(roomSyncTimer);
    var socket = roomSocket;
    roomSocket = null;
    roomPreparing = null;
    roomTrackId = "";
    roomStartAfterCue = null;
    roomMe = null;
    roomMembers = [];
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ t: "bye" }));
      socket.close(1000, "left room");
    }
    if (byId("room-live")) byId("room-live").hidden = true;
    setRoomLiveMode(false);
    if (byId("room-members-list")) byId("room-members-list").replaceChildren();
    if (byId("room-chat-messages")) byId("room-chat-messages").replaceChildren();
    if (showMessage) roomStatus("Saliste de la sala.");
  }

  function createListeningRoom(visibility) {
    var identity = roomIdentity();
    roomStatus("Creando sala…");
    roomApi("", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        visibility: visibility,
        title: "Sala de " + identity.name,
        artwork: ""
      })
    }).then(function (payload) {
      if (!payload.code) throw new Error("El servidor no devolvió un código de sala.");
      connectToRoom(payload.code);
    }).catch(function (error) {
      roomStatus(error.message || "No se pudo crear la sala.", true);
    });
  }

  function startRoomTrack(track) {
    if (!roomSocket || roomSocket.readyState !== WebSocket.OPEN) return false;
    var data = roomTrackData(track);
    if (!data || !roomCanPlayTrack(track)) {
      roomStatus("Las salas compartidas reproducen videos de YouTube. Elige un resultado de YouTube.", true);
      return true;
    }
    var seq = Math.max(Date.now(), Number(roomPreparing && roomPreparing.seq || 0) + 1);
    roomTrackId = track.id;
    var position = 0;
    if (!roomSend({
      t: "prepare",
      seq: seq,
      position_ms: position,
      playing: true,
      track: data
    })) {
      roomStatus("Se perdió la conexión con la sala. Espera a que se reconecte.", true);
      return true;
    }
    roomLoadCued(track, { seq: seq, positionMs: position });
    byId("room-now-track").textContent = "Preparando: " + track.title + " · " + track.artist;
    roomStatus("Esperando que todos estén listos…");
    return true;
  }

  function roomSearch(query) {
    var clean = String(query || "").trim().replace(/\s+/g, " ");
    roomSearchResults.replaceChildren();
    if (clean.length < 2 || clean.length > 100) {
      roomStatus("Escribe entre 2 y 100 caracteres para buscar.", true);
      return;
    }
    var loading = document.createElement("p");
    loading.className = "web-player__empty";
    loading.textContent = "Buscando videos compatibles…";
    roomSearchResults.appendChild(loading);
    var endpoint = new URL("/api/music-search", location.origin);
    endpoint.searchParams.set("q", clean);
    endpoint.searchParams.set("source", "videos");
    fetch(endpoint, { headers: { Accept: "application/json" }, cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("La búsqueda de videos no está disponible.");
        return response.json();
      })
      .then(function (payload) {
        var tracks = Array.isArray(payload.items) ? payload.items.filter(roomCanPlayTrack) : [];
        roomSearchResults.replaceChildren();
        if (!tracks.length) {
          var empty = document.createElement("p");
          empty.className = "web-player__empty";
          empty.textContent = "No encontramos videos compatibles. Prueba otra búsqueda.";
          roomSearchResults.appendChild(empty);
          return;
        }
        tracks.slice(0, 12).forEach(function (track) {
          var item = document.createElement("article");
          item.className = "room-search-result";
          item.appendChild(createArtwork(track, "room-search-result__art"));
          var copy = document.createElement("span");
          copy.className = "room-search-result__copy";
          var title = document.createElement("strong");
          title.textContent = track.title;
          var artist = document.createElement("small");
          artist.textContent = track.artist;
          copy.append(title, artist);
          var play = document.createElement("button");
          play.type = "button";
          play.className = "primary";
          play.textContent = "▶ Poner";
          play.addEventListener("click", function () { playTrack(track); });
          item.appendChild(createArtwork(track, "room-search-result__art"));
          item.append(copy, play);
          roomSearchResults.appendChild(item);
        });
      })
      .catch(function (error) {
        roomSearchResults.replaceChildren();
        var message = document.createElement("p");
        message.className = "web-player__empty";
        message.textContent = error.message || "No se pudo buscar videos.";
        roomSearchResults.appendChild(message);
      });
  }

  var alternativeExcludedId = "";
  function runSearch(query, target) {
    var isVideoSearch = target === "videos";
    var targetResults = isVideoSearch ? byId("video-results") : results;
    var targetTitle = isVideoSearch ? byId("video-results-title") : resultsTitle;
    var targetEyebrow = isVideoSearch ? byId("video-results-eyebrow") : resultsEyebrow;
    var providerLabel = byId(isVideoSearch ? "video-provider-status" : "search-provider-status");
    var submitButton = isVideoSearch ? byId("video-search-submit") : document.querySelector(".web-player__search-submit");
    var excluded = alternativeExcludedId; alternativeExcludedId = "";
    if (providerLabel) providerLabel.textContent = "";
    var raw = query.trim();
    var shared = /^https:\/\//i.test(raw) ? parseShared(raw) : null;
    if(shared){ if(searchController)searchController.abort(); searchToken++; submitButton.disabled=false;if(isVideoSearch){shared.provider="youtube";shared.kind="video";lastVideoTracks=[shared];}else{lastSearchTracks=[shared];}targetTitle.textContent="Enlace compartido";targetEyebrow.textContent=sourceName(shared);renderTracks(targetResults,[shared],{videos:isVideoSearch});playTrack(shared);return; }
    var cleanQuery = raw.replace(/\s+/g, " ");
    if (isVideoSearch) {
      byId("video-search-external").href="https://www.youtube.com/results?search_query="+encodeURIComponent(cleanQuery);
    } else {
      byId("search-external").hidden=cleanQuery.length<2||cleanQuery.length>100;
      byId("external-youtube").href="https://www.youtube.com/results?search_query="+encodeURIComponent(cleanQuery);
    }
    if (cleanQuery.length < 2 || cleanQuery.length > 100) {
      if (searchController) {
        searchController.abort();
        searchController = null;
        searchToken += 1;
      }
      submitButton.disabled = false;
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
    targetTitle.textContent = "Buscando “" + cleanQuery + "”…";
    targetEyebrow.textContent = "BUSCANDO";
    setStatus("");
    submitButton.disabled = true;
    targetResults.replaceChildren();
    var loading = document.createElement("p");
    loading.className = "web-player__empty";
    loading.textContent = isVideoSearch ? "Buscando videos y canales…" : "Buscando canciones…";
    targetResults.appendChild(loading);

    var endpoint = new URL("/api/music-search", location.origin);
    endpoint.searchParams.set("q", cleanQuery);
    endpoint.searchParams.set("source",isVideoSearch ? "videos" : byId("search-source").value);
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
          return {tracks:payload.items.filter(function(t){return (isTrack(t)||isCatalog(t))&&t.id!==excluded;}),providers:payload.providers||{}};
        });
      })
      .then(function (data) {
        if (requestId !== searchToken) return;
        var tracks=data.tracks;
        var failed=Object.keys(data.providers).filter(function(k){return data.providers[k]!=="ok";});
        var names={youtube:"YouTube Music",videos:"YouTube Music (videos)",audius:"Audius",catalog:"Apple"};
        if (providerLabel) providerLabel.textContent=failed.length?"Temporalmente sin respuesta: "+failed.map(function(k){return names[k]||k;}).join(", "):"";
        targetTitle.textContent = "Resultados para “" + cleanQuery + "”";
        targetEyebrow.textContent = "RESULTADOS";
        if (!tracks.length) {
          if (isVideoSearch) lastVideoTracks = [];
          else lastSearchTracks = [];
          renderTracks(targetResults, [], { videos: isVideoSearch });
          setStatus(isVideoSearch ? "No encontramos videos. Prueba con el nombre del canal, creador o video." : "No encontramos canciones con esa búsqueda. Prueba otro término.", false);
          return;
        }
        if (isVideoSearch) lastVideoTracks = tracks;
        else lastSearchTracks = tracks;
        renderTracks(targetResults, tracks, { videos: isVideoSearch });
        setStatus(isVideoSearch ? tracks.length + " videos encontrados · algunas reproducciones pueden depender de las restricciones del canal." : tracks.length+" resultados · "+tracks.filter(function(t){return t.provider==="youtube";}).length+" de YouTube Music (según permisos de reproducción) · "+tracks.filter(function(t){return t.provider==="audius";}).length+" de Audius · "+tracks.filter(isCatalog).length+" externos.");
      })
      .catch(function (error) {
        if (requestId !== searchToken) return;
        targetTitle.textContent = "La búsqueda no está disponible";
        targetEyebrow.textContent = "AVISO";
        if (isVideoSearch) lastVideoTracks = [];
        else lastSearchTracks = [];
        renderTracks(targetResults, [], { error: true, videos: isVideoSearch });
        var message = error.name === "AbortError"
          ? "La búsqueda tardó demasiado. Comprueba tu conexión e inténtalo otra vez."
          : error instanceof TypeError || /networkerror|failed to fetch/i.test(error.message || "")
            ? "No pudimos conectar con el servicio de búsqueda. Comprueba tu conexión e inténtalo otra vez."
            : typeof error.message === "string" && error.message !== "[object Object]"
              ? error.message
              : getApiErrorMessage(null);
        if(providerLabel)providerLabel.textContent=message;
        setStatus(message, true);
      })
      .finally(function () {
        window.clearTimeout(searchTimeout);
        if (requestId === searchToken) {
          submitButton.disabled = false;
          searchController = null;
        }
      });
  }

  function onPlayerStateChange(event) {
    if(mode!=="youtube"||playbackFailed||!window.YT||!window.YT.PlayerState)return;
    if(event.data===YT.PlayerState.CUED){roomFinishCue();return;}
    if(roomSocket&&roomSocket.readyState===WebSocket.OPEN&&!roomPreparing&&Date.now()>=roomSuppressedUntil&&currentTrack){
      var action=event.data===YT.PlayerState.PLAYING?"play":event.data===YT.PlayerState.PAUSED?"pause":"";
      if(action)roomPublishState(action, action === "play");
    }
    if(event.data===YT.PlayerState.PLAYING){try{player.setPlaybackRate(Number(prefs.speed)||1);}catch(_){}syncButton(true);placeholder.hidden=true;setStatus("");}
    if(event.data===YT.PlayerState.PAUSED||event.data===YT.PlayerState.ENDED)syncButton(false);
    if(event.data===YT.PlayerState.ENDED)changeTrack(1,true);
  }
  var ytRequested=false, ytTimer;
  function createPlayer(){
    if(player||!window.YT||!YT.Player)return;
    player=new YT.Player(host,{width:"100%",height:"100%",playerVars:{autoplay:0,controls:1,playsinline:1,rel:0,origin:location.origin},events:{onReady:function(e){clearTimeout(ytTimer);playerReady=true;player.setVolume(Number(document.getElementById("volume-control").value));if(roomPreparing&&roomPreparing.id===currentTrackId){player.cueVideoById({videoId:roomPreparing.id,startSeconds:roomPreparing.positionMs/1000});}else if(mode==="youtube"&&pendingYouTube&&pendingYouTube===currentTrackId){var id=pendingYouTube;pendingYouTube=null;player.loadVideoById(id);}else if(mode!=="youtube"||playbackFailed){var frame=document.getElementById("player-host");if(frame)frame.hidden=true;}},onStateChange:onPlayerStateChange,onError:function(e){if(mode!=="youtube"||playbackFailed)return;showFailure([101,150,152].includes(e.data)?"El titular no permite reproducir este video fuera de YouTube. Abre el original o busca otra versión.":"YouTube no pudo reproducir este video. Abre el original o busca otra versión.");},onAutoplayBlocked:function(){if(mode==="youtube"&&!playbackFailed){syncButton(false);setStatus("Pulsa reproducir para iniciar el video.");}}}});
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
  audio.addEventListener("ended",function(){if(mode==="audio"){syncButton(false);changeTrack(1,true);}});
  audio.addEventListener("error",function(){if(mode==="audio"&&audio.getAttribute("src")&&!playbackFailed)showFailure(currentTrack&&currentTrack.provider==="local"?"El navegador no pudo leer este archivo de audio. Prueba con otro formato compatible.":"El audio no está disponible. Si viene de Discord, solicita un enlace actualizado.");});
  var searchSource = byId("search-source");
  searchSource.value = "youtube";
  searchSource.addEventListener("change",function(){if(input.value.trim().length>=2&&input.value.trim().length<=100)runSearch(input.value);});
  fallbackSearch.addEventListener("click",function(){if(!currentTrack)return; alternativeExcludedId=currentTrack.id; byId("search-source").value=mode==="youtube"?"videos":"all"; input.value=(currentTrack.title+" "+(currentTrack.artist.startsWith("YouTube")?"":currentTrack.artist)).slice(0,100);setView("search");runSearch(input.value);});
  document.getElementById("paste-link").addEventListener("click",function(){input.focus();input.placeholder="Pega el enlace de YouTube o del audio de Discord";setStatus("Pega una URL compartida en el buscador y pulsa Buscar.");});

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setView("search");
    runSearch(input.value);
  });
  if (videoSearchForm) {
    videoSearchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var videoInput = byId("video-search-input");
      setView("videos");
      runSearch(videoInput.value, "videos");
    });
  }
  var roomJoinForm = byId("room-join-form");
  if (roomJoinForm) {
    roomJoinForm.addEventListener("submit", function (event) {
      event.preventDefault();
      connectToRoom(byId("room-code-input").value);
    });
  }
  var roomStoredName = "";
  try { roomStoredName = localStorage.getItem(roomNameKey) || ""; } catch (error) { console.warn("No se pudo leer el apodo guardado de la sala.", error); }
  if (roomStoredName) persistRoomName(roomStoredName, false);
  renderRoomAvatarPreview(readRoomAvatar());
  document.querySelectorAll("[data-room-name]").forEach(function (nameInput) {
    nameInput.addEventListener("input", function () { persistRoomName(nameInput.value, false); });
    nameInput.addEventListener("change", function () { persistRoomName(nameInput.value, true); });
  });
  document.querySelectorAll("[data-room-avatar-pick]").forEach(function (button) {
    button.addEventListener("click", function () { byId("room-avatar-input").click(); });
  });
  byId("room-avatar-input").addEventListener("change", function () {
    var file = this.files && this.files[0];
    this.value = "";
    if (file) compressRoomAvatar(file);
  });
  byId("room-avatar-remove").addEventListener("click", function () {
    if (storeRoomAvatar("")) roomStatus("Foto de perfil quitada.");
  });
  document.querySelectorAll("[data-room-create]").forEach(function (button) {
    button.addEventListener("click", function () { createListeningRoom(button.dataset.roomCreate); });
  });
  byId("rooms-refresh").addEventListener("click", refreshPublicRooms);
  byId("room-leave").addEventListener("click", function () { leaveRoom(true); });
  byId("room-copy-code").addEventListener("click", async function () {
    var code = byId("room-live-code").textContent;
    try {
      await navigator.clipboard.writeText(code);
      roomStatus("Código " + code + " copiado. Compártelo con quien quieras invitar.");
    } catch (error) {
      console.warn("El navegador no permitió copiar el código de sala.", error);
      roomStatus("Copia este código para invitar: " + code);
    }
  });
  document.querySelectorAll("[data-room-reaction]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!roomSend({ t: "reaction", emoji: button.dataset.roomReaction })) roomStatus("Conéctate a una sala para reaccionar.", true);
    });
  });
  byId("room-chat-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var input = byId("room-chat-input");
    var text = input.value.trim().slice(0, 500);
    if (!text) return;
    if (!roomSend({ t: "chat", text: text })) {
      roomStatus("Conéctate a una sala antes de enviar mensajes.", true);
      return;
    }
    input.value = "";
  });
  byId("room-chat-input").addEventListener("input", function () {
    if (roomSocket && roomSocket.readyState === WebSocket.OPEN) roomSend({ t: "typing" });
  });
  if (roomSearchForm) {
    roomSearchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      roomSearch(byId("room-search-input").value);
    });
  }
  byId("room-code-input").addEventListener("input", function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  });
  document.querySelectorAll("[data-video-query]").forEach(function (button) {
    button.addEventListener("click", function () {
      var videoInput = byId("video-search-input");
      videoInput.value = button.dataset.videoQuery || "";
      setView("videos");
      runSearch(videoInput.value, "videos");
    });
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
  var localFilesButton = document.getElementById("local-audio-import");
  var localFilesInput = document.getElementById("local-audio-files");
  if (localFilesButton && localFilesInput) {
    localFilesButton.addEventListener("click", function () { localFilesInput.click(); });
    localFilesInput.addEventListener("change", function () {
      var files = Array.prototype.slice.call(localFilesInput.files || []);
      localFilesInput.value = "";
      if (files.length) void importLocalAudioFiles(files);
    });
  }
  window.addEventListener("nexus:cloud-library-loaded", function (event) {
    var cloudTracks = event.detail && Array.isArray(event.detail.tracks) ? event.detail.tracks.filter(isTrack) : [];
    var authoritative = event.detail && event.detail.authoritative === true;
    var preserved = authoritative
      ? library.filter(function (track) {
        return !videoIdPattern.test(track.id || "") && !/^au:[A-Za-z0-9_-]{1,80}$/.test(track.id || "");
      })
      : library;
    var merged = new Map(preserved.map(function (track) { return [track.id, track]; }));
    cloudTracks.forEach(function (track) {
      if (!merged.has(track.id)) merged.set(track.id, track);
    });
    var previous = library;
    library = Array.from(merged.values()).slice(0, 500);
    if (!saveList(storageKeys.library, library, 500)) {
      library = previous;
      return;
    }
    refreshViews();
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
    document.getElementById("playlists-view").classList.remove("has-active-playlist");
    document.querySelector(".web-app__views").scrollTo({ top: 0, behavior: "smooth" });
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
  playButton.addEventListener("click",function(){if(!currentTrack)return;if(relatedBusy){playbackGeneration++;relatedBusy=false;endHandled=false;}if(playbackFailed){prepareTrack(currentTrack,true);return;}if(mode==="audio"){if(audio.paused)startAudio();else audio.pause();}else if(mode==="youtube"){if(!playerReady||placeholder.hidden===false){prepareTrack(currentTrack,true);return;}if(player.getPlayerState()===YT.PlayerState.PLAYING)player.pauseVideo();else player.playVideo();}});
  incomingButton.addEventListener("click",function(){if(incomingTrack)playTrack(incomingTrack);});
  progress.addEventListener("input",function(){isSeeking=true;});
  progress.addEventListener("change",function(){var duration=mode==="audio"?audio.duration:mode==="youtube"&&playerReady&&player&&!playbackFailed?player.getDuration():0;if(Number.isFinite(duration)&&duration>0){var t=Number(progress.value)/1000*duration;if(mode==="audio")audio.currentTime=t;else{player.seekTo(t,true);roomPublishState("seek",undefined,t*1000);}}isSeeking=false;});
  window.setInterval(function(){if(isSeeking||playbackFailed)return;var duration,current;if(mode==="audio"){duration=audio.duration;current=audio.currentTime;}else if(mode==="youtube"&&playerReady&&player&&placeholder.hidden){duration=player.getDuration();current=player.getCurrentTime();}if(Number.isFinite(duration)&&duration>0&&Number.isFinite(current)){progress.value=String(Math.round(current/duration*1000));currentTimeLabel.textContent=formatTime(current);durationLabel.textContent=formatTime(duration);}},500);
  document.getElementById("volume-control").addEventListener("input",function(){audio.volume=Number(this.value)/100;if(playerReady&&player)player.setVolume(Number(this.value));});

  // Atmosphere controls use the same playback and collection state, never a second player.
  function byId(id){return document.getElementById(id);}
  function isCatalog(t){return t&&t.provider==='catalog'&&/^cat:\d+$/.test(t.id||'')&&typeof t.title==='string'&&typeof t.artist==='string'&&safeApple(t.url);}
  function safeApple(url){try{var u=new URL(url);return u.protocol==='https:'&&['music.apple.com','itunes.apple.com'].includes(u.hostname)&&!u.username&&!u.password?u.href:'';}catch(_){return '';}}
  function renderCatalogCard(container,track){
    var card=document.createElement('article');card.className='web-song catalog-card';
    var art=document.createElement('div');art.className='web-song__art catalog-art';art.append(createArtwork(track));
    var title=document.createElement('div');title.className='web-song__title';title.textContent=track.title;
    var artist=document.createElement('div');artist.className='web-song__artist';artist.textContent=track.artist+(track.duration?' · '+track.duration:'');
    var tag=document.createElement('span');tag.className='catalog-tag';tag.textContent='CATÁLOGO · REPRODUCCIÓN EXTERNA';
    var actions=document.createElement('div');actions.className='catalog-actions';
    var yt=document.createElement('a');yt.className='primary';yt.textContent='Buscar en YouTube ↗';yt.href='https://www.youtube.com/results?search_query='+encodeURIComponent(track.title+' '+track.artist+' official audio');yt.target='_blank';yt.rel='noopener noreferrer';
    var apple=document.createElement('a');apple.className='catalog-link';apple.textContent='Abrir en Apple Music ↗';apple.href=safeApple(track.url);apple.target='_blank';apple.rel='noopener noreferrer';
    var note=document.createElement('small');note.textContent='Si encuentras un video compatible, pega su enlace aquí.';actions.append(yt,apple,note);card.append(art,title,artist,tag,actions);container.append(card);
  }
  function setPlaybackPanelVisible(visible){
    document.body.classList.toggle('player-panel-hidden',!visible);
    panelHideButton.hidden=!visible;
    panelShowButton.hidden=visible;
    panelHideButton.setAttribute('aria-expanded',String(visible));
    panelShowButton.setAttribute('aria-expanded',String(visible));
  }
  var playbackPanel=document.querySelector('.now-panel');
  var panelActions=document.querySelector('.np-head-actions');
  var appTop=document.querySelector('.app-top');
  var panelHideButton=document.createElement('button');
  panelHideButton.type='button';
  panelHideButton.className='glass-icon playback-panel-toggle playback-panel-toggle--hide';
  panelHideButton.textContent='×';
  panelHideButton.title='Ocultar panel En reproducción';
  panelHideButton.setAttribute('aria-label','Ocultar panel En reproducción');
  panelHideButton.setAttribute('aria-controls','now-panel');
  var panelShowButton=document.createElement('button');
  panelShowButton.type='button';
  panelShowButton.className='glass-icon playback-panel-toggle playback-panel-toggle--show';
  panelShowButton.textContent='♫ En reproducción';
  panelShowButton.title='Mostrar panel En reproducción';
  panelShowButton.setAttribute('aria-label','Mostrar panel En reproducción');
  panelShowButton.setAttribute('aria-controls','now-panel');
  panelShowButton.hidden=true;
  if(playbackPanel&&panelActions&&appTop){
    playbackPanel.id='now-panel';
    panelActions.insertBefore(panelHideButton,byId('expand-player'));
    appTop.insertBefore(panelShowButton,byId('settings-open'));
    panelHideButton.addEventListener('click',function(){setPlaybackPanelVisible(false);});
    panelShowButton.addEventListener('click',function(){setPlaybackPanelVisible(true);});
    setPlaybackPanelVisible(true);
  }
  function setExpanded(value){document.body.classList.toggle('player-expanded',value);byId('expand-player').setAttribute('aria-expanded',String(value));byId('expand-player').setAttribute('aria-label',value?'Reducir reproductor':'Ampliar reproductor');byId('expand-player').textContent=value?'⤡':'⤢';if(value&&!lyricsEnabled){lyricsEnabled=true;updateLyricsVisibility();requestLyrics();}}
  function updateShortcuts(){var track=currentTrack;['np-save','np-like','np-playlist','np-share'].forEach(function(id){byId(id).disabled=!track;});var saved=!!track&&library.some(function(t){return t.id===track.id;});var liked=!!track&&favorites.some(function(t){return t.id===track.id;});byId('np-save').classList.toggle('is-saved',saved);byId('np-save').textContent=saved?'✓ Guardada':'＋ Guardar';byId('np-like').setAttribute('aria-pressed',String(liked));byId('np-like').textContent=liked?'♥ Me gusta':'♡ Me gusta';}
  byId("panel-cover").addEventListener("error",function(){if(!this.src.endsWith("/assets/studio-mark.svg"))this.src="assets/studio-mark.svg";});
  var quickTrack=null;
  function openQuickPlaylist(track){quickTrack=track;byId('quick-track-name').textContent=track.title+' · '+track.artist;var select=byId('quick-playlist-select');select.replaceChildren(new Option('Elige una playlist',''));playlists.forEach(function(p){select.add(new Option(p.name,p.id));});byId('quick-new-name').value='';byId('quick-playlist-status').textContent='';byId('playlist-dialog').showModal();}
  byId('np-save').addEventListener('click',function(){if(currentTrack)addToLibrary(currentTrack);});
  byId('np-like').addEventListener('click',function(){if(currentTrack)toggleFavorite(currentTrack);});
  byId('np-playlist').addEventListener('click',function(){if(currentTrack)openQuickPlaylist(currentTrack);});
  byId('quick-add-existing').addEventListener('click',function(){var id=byId('quick-playlist-select').value;if(!id||!quickTrack){byId('quick-playlist-status').textContent='Elige una playlist.';return;}addToPlaylist(id,quickTrack);byId('quick-playlist-status').textContent=status.textContent;});
  byId('quick-playlist-form').addEventListener('submit',function(e){e.preventDefault();var name=byId('quick-new-name').value.trim();if(!name||!quickTrack)return;var existing=playlists.find(function(p){return p.name.toLowerCase()===name.toLowerCase();});if(existing){addToPlaylist(existing.id,quickTrack);byId('quick-playlist-status').textContent=status.textContent;return;}if(playlists.length>=100){byId('quick-playlist-status').textContent='Límite de playlists alcanzado.';return;}var p={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:name,tracks:[quickTrack],createdAt:Date.now()};playlists.unshift(p);if(!persist(storageKeys.playlists,playlists)){playlists.shift();byId('quick-playlist-status').textContent=status.textContent;return;}refreshViews();byId('quick-playlist-status').textContent='Playlist creada y canción guardada.';byId('quick-new-name').value='';byId('quick-playlist-select').add(new Option(p.name,p.id));});
  function shareUrl(t){var u=new URL('https://nexusmusicx.vercel.app/listen');u.searchParams.set('web','1');if(t.provider==='audius')u.searchParams.set('audius',t.id.slice(3));else if(t.provider==='discord')u.searchParams.set('audio',t.audioUrl);else u.searchParams.set('v',t.id);u.searchParams.set('title',t.title);u.searchParams.set('artist',t.artist);return u.href;}
  byId('np-share').addEventListener('click',async function(){if(!currentTrack)return;var url=shareUrl(currentTrack);try{if(navigator.share)await navigator.share({title:currentTrack.title,url:url});else{await navigator.clipboard.writeText(url);setStatus('Enlace copiado.');}}catch(e){if(e.name!=='AbortError')setStatus('No se pudo compartir. Abre la fuente original.',true);}});
  [byId('expand-player'),byId('expand-bottom'),byId('expand-mobile')].forEach(function(b){b.addEventListener('click',function(){setExpanded(!document.body.classList.contains('player-expanded'));});});
  document.querySelector('.web-now-playing__track').addEventListener('dblclick',function(){setExpanded(!document.body.classList.contains('player-expanded'));});
  document.querySelectorAll('[data-close]').forEach(function(b){b.addEventListener('click',function(){byId(b.dataset.close).close();});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!document.querySelector('dialog[open]'))setExpanded(false);});
  // Lyrics: exact recording match, line timestamps, real player clock, no artificial timing.
  var lyricsEnabled=false,lyricsKey='',lyricsController=null,lyricRows=[],activeLine=-1,lyricsPending=false,lyricsAvailable=false;
  function clock(){try{if(mode==='audio')return {time:audio.currentTime,duration:audio.duration};if(mode==='youtube'&&playerReady&&player)return {time:player.getCurrentTime(),duration:player.getDuration()};}catch(_){}return {time:0,duration:0};}
  function durationSeconds(text){var parts=String(text||'').split(':');return parts.length>=2&&parts.length<=3?parts.reduce(function(total,part){return total*60+Number(part);},0):0;}
  function updateLyricsVisibility(){byId('lyrics-toggle').setAttribute('aria-expanded',String(lyricsEnabled));byId('lyrics-lines').hidden=!lyricsEnabled;byId('lyrics-credit').hidden=!lyricsEnabled||!lyricsAvailable;if(!lyricsEnabled)byId('lyrics-status').textContent='Letra oculta. Pulsa ♪ para mostrarla.';}
  function parseLrc(lrc){var rows=[],offset=0,m=String(lrc||'').match(/\[offset:([+-]?\d+)\]/i);if(m)offset=Number(m[1])/1000;String(lrc||'').split(/\r?\n/).forEach(function(line){var tags=Array.from(line.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g));var text=line.replace(/\[[^\]]*\]/g,'').trim();if(!text)return;tags.forEach(function(t){rows.push({time:Math.max(0,Number(t[1])*60+Number(t[2])+Number('0.'+(t[3]||'0'))+offset),text:text});});});return rows.sort(function(a,b){return a.time-b.time;});}
  function seekTo(t){var c=clock();if(!Number.isFinite(c.duration)||c.duration<=0||playbackFailed)return;if(mode==='audio')audio.currentTime=Math.min(t,c.duration);else if(mode==='youtube'&&playerReady){var target=Math.min(t,c.duration);player.seekTo(target,true);roomPublishState("seek",undefined,target*1000);}}
  function requestLyrics(){
    if(!lyricsEnabled)return;
    var track=currentTrack,lines=byId('lyrics-lines'),label=byId('lyrics-status');
    if(!track){label.textContent='Elige una canción para ver su letra.';return;}
    var duration=clock().duration;
    if(!Number.isFinite(duration)||duration<=0)duration=durationSeconds(track.duration);
    if(!Number.isFinite(duration)||duration<1)duration=0;
    var key=[track.id,track.title,track.artist,Math.round(duration)].join('|');
    if(key===lyricsKey)return;
    lyricsKey=key;
    if(lyricsController)lyricsController.abort();
    lyricsController=new AbortController();
    var signal=lyricsController.signal;
    lyricRows=[];activeLine=-1;lyricsAvailable=false;lines.replaceChildren();byId('lyrics-credit').hidden=true;
    lyricsPending=true;label.textContent='Buscando la letra de esta grabación…';
    var endpoint=new URL('/api/lyrics',location.origin);
    endpoint.searchParams.set('title',track.title);
    endpoint.searchParams.set('artist',track.artist);
    if(duration>0)endpoint.searchParams.set('duration',String(Math.round(duration)));
    fetch(endpoint,{signal:signal}).then(async function(response){
      if(!response.ok&&response.status!==404)throw new Error('Servicio de letras no disponible');
      return response.json();
    }).then(function(data){
      if(signal.aborted||lyricsKey!==key)return;
      lyricsPending=false;
      if(data.instrumental){label.textContent='Esta pista es instrumental.';return;}
      lyricRows=parseLrc(data.syncedLyrics);
      if(lyricRows.length){
        label.textContent='Sincronizada por líneas · pulsa una línea para saltar.';
        lyricRows.forEach(function(row){
          var button=document.createElement('button');
          button.type='button';button.textContent=row.text;
          button.addEventListener('click',function(){seekTo(row.time);});
          lines.append(button);
        });
      }else if(typeof data.plainLyrics==='string'&&data.plainLyrics.trim()){
        label.textContent='Letra disponible sin tiempos sincronizados.';
        var text=document.createElement('div');
        text.className='lyric-line';text.textContent=data.plainLyrics;
        lines.append(text);
      }else{
        label.textContent='No hay una letra verificada para esta versión.';
        return;
      }
      lyricsAvailable=true;
      byId('lyrics-credit').hidden=!lyricsEnabled;
      lines.hidden=!lyricsEnabled;
    }).catch(function(error){
      if(signal.aborted)return;
      lyricsPending=false;
      console.error('No se pudo consultar la letra.',error);
      label.textContent='No se pudo consultar la letra. Oculta y vuelve a abrir para reintentar.';
    });
  }
  byId('lyrics-toggle').addEventListener('click',function(){lyricsEnabled=!lyricsEnabled;updateLyricsVisibility();if(lyricsEnabled){lyricsKey='';requestLyrics();}});
  setInterval(function(){if(!lyricsEnabled)return;if(currentTrack)requestLyrics();if(!lyricRows.length||playbackFailed)return;var time=clock().time;if(!Number.isFinite(time))return;var index=-1;for(var i=0;i<lyricRows.length;i++){if(lyricRows[i].time>time+.08)break;index=i;}if(index===activeLine)return;var list=byId('lyrics-lines');if(activeLine>=0&&list.children[activeLine])list.children[activeLine].classList.remove('active');activeLine=index;if(index>=0&&list.children[index]){var line=list.children[index];line.classList.add('active');list.scrollTo({top:Math.max(0,line.offsetTop-list.offsetTop-list.clientHeight*.3),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}},250);
  window.NexusPlayback={snapshot:function(){if(!currentTrack||!document.body.classList.contains('is-playing')||playbackFailed)return null;var c=clock();return {title:currentTrack.title,artist:currentTrack.artist,artwork:currentTrack.thumbnail||"",position:Number.isFinite(c.time)?c.time:0,duration:Number.isFinite(c.duration)?c.duration:0,url:currentTrack.provider==='discord'?'https://nexusmusicx.vercel.app/listen?web=1':shareUrl(currentTrack)};}};

  // Appearance and player preferences share the original playback state.
  var palettes={aurora:'#e5e6e8',violet:'#c7a8ff',rose:'#ffc0d7',ocean:'#9ddcf9',emerald:'#a4e4c8',mono:'#d2d5df'};
  var coverColorCache=new Map(), themeImageKey='', themeRequest=0;
  function updateTheme(){
    var body=document.body,color=palettes[prefs.color]||palettes.aurora;
    body.style.setProperty('--user-accent',color);body.dataset.theme=prefs.color;
    body.dataset.playerDesign=prefs.playerDesign;
    body.classList.toggle('no-glass',!prefs.glass);body.classList.toggle('no-blur',!prefs.blur);
    body.classList.toggle('no-motion',!prefs.motion);body.classList.toggle('dynamic-theme',prefs.dynamic&&!prefs.dataSaver);
    var ambient=byId('cover-ambient'),url=currentTrack&&currentTrack.thumbnail;
    var valid=prefs.dynamic&&!prefs.dataSaver&&url&&/^https:\/\//i.test(url);
    ambient.style.backgroundImage=valid?'url('+JSON.stringify(url)+')':'';
    if(!valid){themeImageKey='';themeRequest++;return;}
    var cacheKey=url+'|'+color;
    if(coverColorCache.has(cacheKey)){themeImageKey=cacheKey;themeRequest++;body.style.setProperty('--user-accent',coverColorCache.get(cacheKey));return;}
    if(themeImageKey===cacheKey)return;
    themeImageKey=cacheKey;
    var generation=++themeRequest,img=new Image();
    img.crossOrigin='anonymous';
    img.onload=function(){
      if(generation!==themeRequest||!prefs.dynamic||prefs.dataSaver||(palettes[prefs.color]||palettes.aurora)!==color||currentTrack?.thumbnail!==url)return;
      try{
        var canvas=document.createElement('canvas');canvas.width=canvas.height=24;
        var ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,24,24);
        var data=ctx.getImageData(0,0,24,24).data,r=0,g=0,b=0,n=0;
        for(var i=0;i<data.length;i+=4){
          var hi=Math.max(data[i],data[i+1],data[i+2]),lo=Math.min(data[i],data[i+1],data[i+2]);
          if(data[i+3]<200||hi<40||lo>225)continue;
          var w=1+(hi-lo)/80;r+=data[i]*w;g+=data[i+1]*w;b+=data[i+2]*w;n+=w;
        }
        if(n){
          var tint='rgb('+[r,g,b].map(function(x){return Math.round(x/n*.57+255*.43);}).join(',')+')';
          if(coverColorCache.size>80)coverColorCache.clear();
          coverColorCache.set(cacheKey,tint);body.style.setProperty('--user-accent',tint);
        }
      }catch(_){/* The cover background still works if CORS prevents reading pixels. */}
    };
    img.src=url;
  }
  function savePrefs(){
    var saved=true;
    try{localStorage.setItem('nexus.player.settings.v1',JSON.stringify(prefs));}
    catch(error){saved=false;console.error('No se pudieron guardar los ajustes web.',error);setStatus('No se pudieron guardar los ajustes en este navegador.',true);}
    updateTheme();renderQueue();
    return saved;
  }
  function paintPrefs(){
    Object.keys(prefDefaults).forEach(function(k){var el=byId('pref-'+k);if(el){if(el.type==='checkbox')el.checked=!!prefs[k];else el.value=prefs[k];}});
    var volume=Math.max(0,Math.min(100,Number(prefs.volume)||0));
    byId('volume-control').value=volume;
    byId('pref-volume-value').value=volume+'%';
    byId('pref-volume-value').textContent=volume+'%';
  }
  var playbackSpeedButton=document.createElement('button');
  playbackSpeedButton.type='button';
  playbackSpeedButton.className='playback-speed-button';
  playbackSpeedButton.id='playback-speed';
  playbackSpeedButton.title='Cambiar velocidad de reproducción';
  byId('next-track').insertAdjacentElement('afterend',playbackSpeedButton);
  function applySpeed(){
    var speed=Number(prefs.speed)||1;
    audio.playbackRate=speed;
    if(playerReady&&player)try{player.setPlaybackRate(speed);}catch(_){}
    playbackSpeedButton.textContent=speed+'×';
    playbackSpeedButton.setAttribute('aria-label','Velocidad de reproducción: '+speed+'×');
  }
  playbackSpeedButton.addEventListener('click',function(){
    var speeds=['0.75','1','1.25','1.5','2'];
    var current=speeds.indexOf(String(prefs.speed));
    prefs.speed=speeds[(current+1)%speeds.length];
    applySpeed();savePrefs();
  });
  if(!palettes[prefs.color])prefs.color='aurora';if(!['aurora','velvet','prism','studio'].includes(prefs.playerDesign))prefs.playerDesign='aurora';if(!['0.75','1','1.25','1.5','2'].includes(prefs.speed))prefs.speed='1';
  paintPrefs();updateTheme();applySpeed();
  function paintPlayerDesignOptions(){
    settingsDashboard.querySelectorAll("[data-player-design]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.playerDesign === prefs.playerDesign));
    });
  }
  paintPlayerDesignOptions();
  Object.keys(prefDefaults).forEach(function(k){
    var el=byId('pref-'+k);if(!el)return;
    el.addEventListener('change',function(){
      prefs[k]=el.type==='checkbox'?el.checked:el.value;
      if(k==='volume'){
        prefs.volume=Math.max(0,Math.min(100,Number(el.value)||0));
        el.value=String(prefs.volume);
        byId('volume-control').value=prefs.volume;
        byId('pref-volume-value').value=prefs.volume+'%';
        byId('pref-volume-value').textContent=prefs.volume+'%';
        audio.volume=prefs.volume/100;
        if(playerReady&&player)player.setVolume(prefs.volume);
      }
      if(k==='persistentQueue'){
        try{
          if(prefs.persistentQueue)persist(storageKeys.queue,queue);
          else localStorage.removeItem(storageKeys.queue);
        }catch(error){console.error('No se pudo actualizar la cola guardada.',error);setStatus('No se pudo actualizar la cola guardada.',true);}
      }
      savePrefs();applySpeed();
      if(k==='dataSaver'){if(currentTrack)setCurrentTrack(currentTrack);refreshViews();}
      if(k==='persistentQueue')updateDashboardStats();
    });
  });
  settingsDashboard.querySelectorAll("[data-player-design]").forEach(function (button) {
    button.addEventListener("click", function () {
      prefs.playerDesign = button.dataset.playerDesign;
      paintPlayerDesignOptions();
      savePrefs();
      byId("settings-status").textContent = "Diseño del reproductor actualizado.";
    });
  });
  byId('pref-volume').addEventListener('input',function(){
    var volume=Math.max(0,Math.min(100,Number(this.value)||0));
    byId('pref-volume-value').value=volume+'%';
    byId('pref-volume-value').textContent=volume+'%';
    audio.volume=volume/100;
    if(playerReady&&player)player.setVolume(volume);
    byId('volume-control').value=volume;
  });
  byId('volume-control').addEventListener('change',function(){prefs.volume=Number(this.value);paintPrefs();savePrefs();});
  byId('settings-discord').addEventListener('click',function(){byId('discord-settings').click();});
  byId('pref-reset').addEventListener('click',function(){prefs=Object.assign({},prefDefaults);paintPrefs();paintPlayerDesignOptions();var saved=savePrefs();applySpeed();audio.volume=prefs.volume/100;if(playerReady&&player)try{player.setVolume(prefs.volume);}catch(_){}if(prefs.persistentQueue)persist(storageKeys.queue,queue);refreshViews();byId('settings-status').textContent=saved?'Ajustes restablecidos.':'Ajustes restablecidos, pero el navegador no pudo guardarlos.';});
  byId('export-library').addEventListener('click',function(){
    var backup={format:'nexusmusic-web-library',version:1,exportedAt:new Date().toISOString(),library:library,favorites:favorites,playlists:playlists,history:recent,queue:queue};
    var blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='nexusmusic-beta-coleccion.json';link.click();
    window.setTimeout(function(){URL.revokeObjectURL(url);},1000);
    setStatus('Copia de tu colección descargada.');
  });
  byId('copy-donation').addEventListener('click',async function(){try{await navigator.clipboard.writeText('3018951690');byId('settings-status').textContent='Número copiado.';}catch(_){byId('settings-status').textContent='Número de donación: 3018951690';}});

  refreshViews();
  setView("home");
  var initialQuery=params.get("q"); if(initialQuery && initialQuery.trim().length>=2 && initialQuery.length<=100){input.value=initialQuery;setView("search");runSearch(initialQuery);}

  var sharedRaw=params.get("audio")||params.get("url")||params.get("v")||params.get("videoId")||"";
  incomingTrack=parseShared(sharedRaw,(params.get("title")||"").slice(0,160),(params.get("artist")||"").slice(0,120));
  var incomingAudius=params.get("audius");if(!incomingTrack&&/^[A-Za-z0-9_-]{1,80}$/.test(incomingAudius||"")){incomingTrack={id:"au:"+incomingAudius,provider:"audius",title:(params.get("title")||"Canción de Audius").slice(0,160),artist:(params.get("artist")||"Audius").slice(0,120),url:"https://audius.co",thumbnail:"",duration:""};}
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

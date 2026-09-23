/* ═══════════════════════════════════════════════════════════════════
   NexusMusic — lógica del sitio (33dr.js)
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  var loader = document.getElementById("site-loader");
  var loaderPct = document.getElementById("loader-pct");
  var loaderStatus = document.getElementById("loader-status");
  var STATUS_PHRASES = {
    es: ["Afinando el receptor", "Cargando la biblioteca", "Encendiendo las válvulas", "Sintonizando"],
    en: ["Tuning the receiver", "Loading the library", "Warming up the tubes", "Dialing in"],
    pt: ["Afinando o receptor", "Carregando a biblioteca", "Aquecendo as válvulas", "Sintonizando"]
  };

  if (loader) {
    document.body.classList.add("is-loading");
    var loaderStartedAt = Date.now();
    var pageLoaded = document.readyState === "complete";
    var minimumLoaderTime = 2000;
    var loaderHidden = false;

    // Progreso falso pero suave, ligado al tiempo mínimo del loader.
    var pctInterval = null;
    if (loaderPct) {
      pctInterval = setInterval(function () {
        var elapsed = Date.now() - loaderStartedAt;
        var pct = Math.min(99, Math.round((elapsed / minimumLoaderTime) * 100));
        loaderPct.textContent = pct + "%";
      }, 60);
    }

    // Rota la frase de estado mientras carga.
    var statusLang = (localStorage.getItem("oym.lang") || (navigator.language || "es").slice(0, 2).toLowerCase());
    if (!STATUS_PHRASES[statusLang]) statusLang = "es";
    var statusIdx = 0;
    var statusInterval = null;
    if (loaderStatus) {
      var dotsMarkup = '<span class="loader__dots" aria-hidden="true"><span></span><span></span><span></span></span>';
      var setStatus = function () {
        loaderStatus.innerHTML = STATUS_PHRASES[statusLang][statusIdx % STATUS_PHRASES[statusLang].length] + dotsMarkup;
        statusIdx++;
      };
      setStatus();
      statusInterval = setInterval(setStatus, 900);
    }

    var hideLoader = function () {
      if (loaderHidden || !pageLoaded || Date.now() - loaderStartedAt < minimumLoaderTime) return;
      loaderHidden = true;
      if (pctInterval) { clearInterval(pctInterval); }
      if (statusInterval) { clearInterval(statusInterval); }
      if (loaderPct) { loaderPct.textContent = "100%"; }
      loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      setTimeout(function () { loader.remove(); }, 650);
    };
    if (!pageLoaded) {
      window.addEventListener("load", function () {
        pageLoaded = true;
        hideLoader();
      }, { once: true });
    }
    setTimeout(hideLoader, minimumLoaderTime);
  }

  /* ── Textos en los tres idiomas (el HTML ya trae el español) ─────── */
  var I18N = {
    en: {
      "nav.github": "versions",
      "nav.download": "Download",
      "hero.eyebrow": "available now",
      "hero.title": "Every bit of YouTube Music, minus what it didn't need",
      "hero.lead": "Real background playback, downloads to listen without data, and a shared room with someone else in real time. No ads.",
      "hero.cta": "Download the APK",
      "hero.repo": "See the versions",
      "hero.meta": "· requires Android 7.0 or newer, free and no in-app purchases.",
      "chip.glass": "Glass effect",
      "chip.rooms": "Listen together",
      "chip.offline": "Offline",
      "chip.m3": "Material 3",
      "chip.noAds": "No ads",
      "chip.noTrackers": "No trackers",
      "ticker.calm": "Calm",
      "ticker.focus": "Focus",
      "ticker.sleep": "Sleep",
      "ticker.workout": "Workout",
      "ticker.energy": "Energy",
      "ticker.radio": "Live stations",
      "ticker.lyrics": "Synced lyrics",
      "ticker.noAds": "No ads, ever",
      "ticker.rooms": "Rooms in real time",
      "hash.label": "SHA-256 fingerprint of this APK",
      "hash.copy": "Copy",
      "hash.note": "It changes with every new release, so don't worry if it doesn't match an older one — only compare it against the version you just downloaded.",
      "nexus.badge": "Project owner",
      "nexus.role": "Nexus Studios, AI Suite line",
      "nexus.body": "NexusMusic is part of the Nexus Forge project showcase. They gave us developer membership and a place on their platform, which is why the app stays free, ad-free and free of anything shady.",
      "nexus.stat.users": "in their community",
      "nexus.stat.uptime": "uptime",
      "nexus.stat.rating": "rating",
      "nexus.stat.support": "Discord support",
      "nexus.cta": "Discover Nexus Forge",
      "nexus.note": "Thanks for the backing.",
      "what.eyebrow": "Spec sheet",
      "what.title": "Built to be used every single day",
      "what.body": "It uses the same music you already have in your account, with its own interface. No ads, no screens you didn't ask for.",
      "feat.1.t": "Real background playback",
      "feat.1.d": "Keeps playing when you lock the phone, switch apps or drive, with controls on the lock screen.",
      "feat.2.t": "Rooms to listen together",
      "feat.2.d": "Create a room, share the code, and you both hear the same thing at the same time: pause, change songs or search without leaving. With chat and profile photo.",
      "feat.3.t": "Offline",
      "feat.3.d": "Download whatever you want and play it without data or wifi, at the same quality and with no cuts.",
      "feat.4.t": "Your whole library",
      "feat.4.d": "Songs, albums, artists, playlists, moods and genres: what you already have in YouTube Music, now with its own search.",
      "feat.5.t": "Lyrics, downloadable",
      "feat.5.d": "Synced lyrics when available, with several providers and the option to save them for later.",
      "feat.6.t": "Private by design",
      "feat.6.d": "No accounts, no emails and no trackers. Stats are anonymous and can be turned off in the app whenever you want.",
      "feat.7.t": "Live radio and mood modes",
      "feat.7.d": "Live stations plus modes like Calm, Focus or Energy, for when you don't feel like building the playlist yourself.",
      "news.eyebrow": "Changelog",
      "news.title": "What's new in this version",
      "news.body": "What changed, told by the person who made it.",
      "news.1.t": "Glass effect across the app",
      "news.1.d": "Title bars, the bottom pill, notices and sheets are translucent: content shows faintly underneath, with a light edge and a glow in the artwork's colour at top and bottom. Turn it off in Settings → Appearance if you prefer flat black.",
      "news.2.t": "Profile photos in rooms",
      "news.2.d": "Tap your chip, pick a photo from your phone, and the other person sees your face in the room circle. It's cropped and shrunk before it leaves, never stored on a server, and removable whenever you want.",
      "news.3.t": "NexusMusic joins Nexus Forge",
      "news.3.d": "Nexus Studios gave us developer membership and a place on their platform. I added their section inside the app, with logo and link. Thanks to that backing the app stays free and ad-free.",
      "news.3b.t": "Log in with your Nexus Forge account",
      "news.3b.d": "Platform login is now available in the app, with cloud song saving, comments on tracks and the option to follow artists.",
      "news.4.t": "From OpenYTMusic to NexusMusic",
      "news.4.d": "The app's name and identity changed to reflect its new home at Nexus Forge.",
      "news.4b.t": "Import from SoundCloud and Spotify",
      "news.4b.d": "Import your SoundCloud tracks by URL, and your Spotify library by signing in with your account.",
      "shot.eyebrow": "Interface",
      "shot.title": "It paints itself with whatever you're hearing",
      "shot.body": "A Material 3 interface in dark theme, with an accent colour taken from the song's artwork: the app colours itself around whatever you're listening to.",
      "shot.main": "Home screen",
      "shot.rooms": "Rooms",
      "shot.player": "Player",
      "trust.title": "Scanned and verified",
      "trust.note": "This APK was scanned and contains no viruses, malware or ads. It's the same file you can check against the SHA-256 above, which changes with every update.",
      "faq.eyebrow": "Questions",
      "faq.title": "What people usually ask",
      "faq.1.q": "Is it free?",
      "faq.1.a": "Yes, no ads and no in-app purchases. It's a personal project: if it's useful to you, sharing it is enough.",
      "faq.2.q": "Do I need a YouTube Music account?",
      "faq.2.a": "You can use it without signing in, and if you do, your playlists, likes and history show up, just like in the official app.",
      "faq.3.q": "What is \"listen together\"?",
      "faq.3.a": "A room with a code: whoever creates it shares it and you both hear exactly the same thing at the same time. If one pauses, changes song or skips ahead, the other follows. It has chat, profile photos, and search works inside the room.",
      "faq.4.q": "Who's behind it?",
      "faq.4.a": "A developer who loves music. Nexus Forge (Nexus Studios) supports the project: it gave it a place on its platform and developer membership. NexusMusic is not affiliated with or endorsed by YouTube or Google LLC.",
      "end.title": "Take it with you",
      "end.body": "Download the APK, install it, and that's it. No accounts and no permissions it doesn't use.",
      "footer.repo": "Code on GitHub",
      "footer.nexus": "Nexus Forge",
      "footer.disclaimer": "NexusMusic is an independent client, built by a music fan. It is not affiliated with or endorsed by YouTube or Google LLC. \"YouTube\" and \"YouTube Music\" are trademarks of Google LLC.",
      "footer.license": "Source-available (read-only): you may read it, study it and build it for personal use. Copying, modifying or redistributing it is not allowed.",
      "footer.rights": "all rights reserved."
    },
    pt: {
      "nav.github": "versiones",
      "nav.download": "Baixar",
      "hero.eyebrow": "já disponível",
      "hero.title": "Todo o seu YouTube Music, sem o que sobrava",
      "hero.lead": "Reprodução em segundo plano de verdade, downloads para ouvir sem dados, e uma sala compartilhada com outra pessoa em tempo real. Sem anúncios.",
      "hero.cta": "Baixar o APK",
      "hero.repo": "Ver o versiones",
      "hero.meta": "· requer Android 7.0 ou superior, grátis e sem compras dentro do app.",
      "chip.glass": "Efeito vidro",
      "chip.rooms": "Ouvir juntos",
      "chip.offline": "Offline",
      "chip.m3": "Material 3",
      "chip.noAds": "Sem anúncios",
      "chip.noTrackers": "Sem rastreadores",
      "ticker.calm": "Calma",
      "ticker.focus": "Concentração",
      "ticker.sleep": "Dormir",
      "ticker.workout": "Exercício",
      "ticker.energy": "Energia",
      "ticker.radio": "Rádios ao vivo",
      "ticker.lyrics": "Letras sincronizadas",
      "ticker.noAds": "Sem anúncios, nunca",
      "ticker.rooms": "Salas em tempo real",
      "hash.label": "Impressão SHA-256 deste APK",
      "hash.copy": "Copiar",
      "hash.note": "Muda a cada nova versão: não se preocupe se não bater com uma anterior, compare apenas com a que você acabou de baixar.",
      "nexus.badge": "Proprietário do projeto",
      "nexus.role": "Nexus Studios, linha AI Suite",
      "nexus.body": "O NexusMusic faz parte da vitrine de projetos da Nexus Forge. Eles nos deram assinatura de desenvolvedor e um lugar na plataforma, por isso o app continua grátis, sem anúncios e sem nada estranho.",
      "nexus.stat.users": "na comunidade",
      "nexus.stat.uptime": "de disponibilidade",
      "nexus.stat.rating": "de avaliação",
      "nexus.stat.support": "suporte no Discord",
      "nexus.cta": "Conhecer a Nexus Forge",
      "nexus.note": "Obrigado pelo apoio.",
      "what.eyebrow": "Ficha técnica",
      "what.title": "Feita para usar todos os dias",
      "what.body": "Usa a mesma música que você já tem na conta, com interface própria. Sem anúncios, sem telas que você não pediu.",
      "feat.1.t": "Segundo plano de verdade",
      "feat.1.d": "Continua tocando ao bloquear o celular, trocar de app ou dirigir, com controles na tela de bloqueio.",
      "feat.2.t": "Salas para ouvir juntos",
      "feat.2.d": "Você cria uma sala, passa o código e os dois ouvem a mesma coisa ao mesmo tempo: pausa, troca de música ou busca sem sair. Com chat e foto de perfil.",
      "feat.3.t": "Offline",
      "feat.3.d": "Baixe o que quiser e ouça sem dados nem wi-fi, na mesma qualidade e sem cortes.",
      "feat.4.t": "Sua biblioteca inteira",
      "feat.4.d": "Músicas, álbuns, artistas, playlists, humor e gêneros: o que você já tem no YouTube Music, agora com busca própria.",
      "feat.5.t": "Letras, com download",
      "feat.5.d": "Letra sincronizada quando existe, com vários provedores e a opção de baixar para ver depois.",
      "feat.6.t": "Privada por princípio",
      "feat.6.d": "Sem contas, sem e-mails e sem rastreadores. As estatísticas são anônimas e podem ser desligadas no app quando você quiser.",
      "feat.7.t": "Rádio e modos de humor",
      "feat.7.d": "Emissoras ao vivo e modos como Calma, Concentração ou Energia, para quando você não quer montar a playlist sozinho.",
      "news.eyebrow": "Registro de mudanças",
      "news.title": "O que há de novo nesta versão",
      "news.body": "O que mudou, contado por quem fez.",
      "news.1.t": "Efeito vidro em todo o app",
      "news.1.d": "As barras de título, a pílula de baixo, os avisos e as folhas são translúcidos: o conteúdo aparece de leve por baixo, com canto de luz e um brilho da cor da capa em cima e embaixo. Desligue em Ajustes → Aparência se preferir o preto liso.",
      "news.2.t": "Foto de perfil nas salas",
      "news.2.d": "Ao tocar no seu cartão você escolhe uma foto do celular e a outra pessoa vê seu rosto no círculo da sala. É recortada e reduzida antes de sair, nunca fica em servidor algum e pode ser removida quando quiser.",
      "news.3.t": "NexusMusic entra na Nexus Forge",
      "news.3.d": "A Nexus Studios nos deu assinatura de desenvolvedor e um lugar na plataforma. Adicionei a seção deles dentro do app, com logo e link. Graças a esse apoio o app continua grátis e sem anúncios.",
      "news.3b.t": "Login com sua conta da Nexus Forge",
      "news.3b.d": "Agora dá pra entrar com a conta da plataforma no app, com salvamento de músicas na nuvem, comentários nas faixas e a opção de seguir artistas.",
      "news.4.t": "De OpenYTMusic para NexusMusic",
      "news.4.d": "O nome e a identidade do app mudaram para refletir seu novo lar na Nexus Forge.",
      "news.4b.t": "Importação do SoundCloud e Spotify",
      "news.4b.d": "Importe suas faixas do SoundCloud por URL, e sua biblioteca do Spotify entrando com sua conta.",
      "shot.eyebrow": "Interface",
      "shot.title": "Se pinta com o que você está ouvindo",
      "shot.body": "Interface em Material 3 com tema escuro e cor de destaque tirada da capa da música: o app se pinta sozinho com o que você está ouvindo.",
      "shot.main": "Tela principal",
      "shot.rooms": "Salas",
      "shot.player": "Reprodutor",
      "trust.title": "Analisado e verificado",
      "trust.note": "Este APK foi analisado e não contém vírus, malware nem anúncios. É o mesmo arquivo que você pode conferir com o SHA-256 acima, que muda a cada atualização.",
      "faq.eyebrow": "Perguntas",
      "faq.title": "O que costumam perguntar",
      "faq.1.q": "É grátis?",
      "faq.1.a": "Sim, sem anúncios e sem compras dentro do app. É um projeto pessoal: se te serve, compartilhar já basta.",
      "faq.2.q": "Preciso de conta do YouTube Music?",
      "faq.2.a": "Você pode usar sem entrar, e se entrar aparecem suas playlists, curtidas e histórico, igual ao app oficial.",
      "faq.3.q": "O que é \"ouvir juntos\"?",
      "faq.3.a": "Uma sala com código: quem cria compartilha e os dois ouvem exatamente a mesma coisa ao mesmo tempo. Se um pausa, troca de música ou adianta, o outro acompanha. Tem chat, foto de perfil e a busca funciona dentro da sala.",
      "faq.4.q": "Quem está por trás?",
      "faq.4.a": "Um desenvolvedor que gosta de música. A Nexus Forge (Nexus Studios) apoia o projeto: deu um lugar na plataforma e assinatura de desenvolvedor. O NexusMusic não é afiliado nem endossado pelo YouTube ou pela Google LLC.",
      "end.title": "Leve com você",
      "end.body": "Baixe o APK, instale e pronto. Não pede contas nem permissões que não usa.",
      "footer.repo": "Código no GitHub",
      "footer.nexus": "Nexus Forge",
      "footer.disclaimer": "O NexusMusic é um cliente independente, feito por um fã de música. Não é afiliado nem endossado pelo YouTube ou pela Google LLC. \"YouTube\" e \"YouTube Music\" são marcas da Google LLC.",
      "footer.license": "Código visível (somente leitura): você pode ler, estudar e compilar para uso pessoal. Não é permitido copiar, modificar nem redistribuir.",
      "footer.rights": "todos os direitos reservados."
    }
  };

  var nodes = document.querySelectorAll("[data-i18n]");
  var glitchNodes = document.querySelectorAll(".glitch[data-i18n]");
  var buttons = document.querySelectorAll(".lang button");
  var COPIED = { es: "Copiado", en: "Copied", pt: "Copiado" };

  function applyLang(lang) {
    var dict = I18N[lang];
    Array.prototype.forEach.call(nodes, function (el) {
      var key = el.getAttribute("data-i18n");
      if (!el.hasAttribute("data-es")) el.setAttribute("data-es", el.innerHTML);
      el.innerHTML = dict && dict[key] ? dict[key] : el.getAttribute("data-es");
    });
    // El glitch usa attr(data-text) en CSS, así que hay que refrescarlo con el texto del idioma activo.
    Array.prototype.forEach.call(glitchNodes, function (el) {
      el.setAttribute("data-text", el.textContent);
    });
    Array.prototype.forEach.call(buttons, function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    document.documentElement.lang = lang;
    try { localStorage.setItem("oym.lang", lang); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem("oym.lang"); } catch (e) {}
  var initial = saved || ((navigator.language || "es").slice(0, 2).toLowerCase());
  if (initial !== "es" && !I18N[initial]) initial = "es";
  applyLang(initial);

  Array.prototype.forEach.call(buttons, function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  /* ── Versión, hash y APK reales, siempre desde version.json ──────── *
   * Los botones de descarga arrancan deshabilitados (href="#") y solo
   * apuntan al APK una vez que version.json responde: así nunca queda
   * un link directo "a mano" en el HTML, y basta con editar ese JSON
   * en cada release para que todo el sitio (versión, hash y descarga)
   * se actualice solo.                                                */
  fetch("version.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (v) {
      if (!v || !v.version) return;
      var label = "v" + v.version;
      ["hero-version", "apk-version", "footer-version"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = label;
      });
      Array.prototype.forEach.call(document.querySelectorAll("#news-version"), function (el) {
        el.textContent = v.version;
      });
      if (v.apkUrl) {
        Array.prototype.forEach.call(document.querySelectorAll(".apk-dl"), function (a) {
          a.setAttribute("href", v.apkUrl);
          a.setAttribute("download", "");
          a.removeAttribute("aria-disabled");
        });
      }
      var hash = document.getElementById("hash-value");
      if (hash && v.sha256) hash.textContent = v.sha256;
    })
    .catch(function () {});

  /* ── Copiar el hash ──────────────────────────────────────────────── */
  var copyBtn = document.getElementById("copy-hash");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = (document.getElementById("hash-value") || {}).textContent || "";
      var done = function () {
        var old = copyBtn.textContent;
        copyBtn.textContent = COPIED[document.documentElement.lang] || "OK";
        setTimeout(function () { copyBtn.textContent = old; }, 1400);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done).catch(done);
    });
  }

        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
                (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j'))) {
                e.preventDefault();
                return false;
            }
        });
        console.log('%c🛡️ Rules· Protección activa', 'color:#4fd8ff;font-size:14px;font-weight:bold;');

})();
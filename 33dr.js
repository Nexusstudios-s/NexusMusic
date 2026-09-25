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

    var pctInterval = null;
    if (loaderPct) {
      pctInterval = setInterval(function () {
        var elapsed = Date.now() - loaderStartedAt;
        var pct = Math.min(99, Math.round((elapsed / minimumLoaderTime) * 100));
        loaderPct.textContent = pct + "%";
      }, 60);
    }

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
      "nexus.body": "NexusMusic is part of the Nexus Forge project showcase. They are the owners and developers, so the app stays free, ad-free and without memberships.",
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
      "why.1.t": "Why does it exist?",
      "why.1.d": "It was born as an alternative client to listen to the same music as always without the interruptions and extra screens the official free app brings.",
      "why.2.t": "Updates",
      "why.2.d": "Every new version brings its own SHA-256 hash and, when applicable, its VirusTotal report so you can verify it yourself before installing.",
      "why.3.t": "Compatibility",
      "why.3.d": "Android 7.0 and up. It doesn't require Play Services for the basics, and the APK installs like any app outside the store (enabling \"unknown sources\" just once).",
      "plus.eyebrow": "Customization",
      "plus.title": "Make it more yours",
      "plus.lead": "The app and the website are deeply customizable. With Nexus+ or Nexus Coins — you choose the path.",
      "plus.badge.premium": "Premium",
      "plus.badge.coins": "Alternative",
      "plus.p1.title": "Nexus+",
      "plus.p1.body": "Advanced customization in the app and on the Nexus Forge website: exclusive themes, icons, player covers and settings that aren't available any other way. It doesn't remove any ads — there never were any here — it's pure customization.",
      "plus.p1.li1": "Exclusive themes and colors",
      "plus.p1.li2": "Custom icons and player covers",
      "plus.p1.li3": "Settings you won't find anywhere else",
      "plus.p1.cta": "Discover Nexus+",
      "plus.p2.title": "Nexus Coins",
      "plus.p2.body": "Prefer not to subscribe? With Nexus Coins you unlock that same customization little by little, earning or getting them inside the Nexus Forge ecosystem. Same result, another path.",
      "plus.p2.li1": "The same customization, no subscription",
      "plus.p2.li2": "Earned using the Nexus Forge ecosystem",
      "plus.p2.li3": "You build your progress at your own pace",
      "plus.p2.cta": "See Nexus Coins",
      "cmp.eyebrow": "Comparison",
      "cmp.title": "How it's different from what you already know",
      "cmp.lead": "A quick snapshot against the official apps, in their free version. They are not brands affiliated with NexusMusic — it's just a feature comparison.",
      "cmp.feature": "Feature",
      "cmp.app": "App",
      "cmp.noAds": "No ads",
      "cmp.bg": "Background playback",
      "cmp.offline": "Offline downloads",
      "cmp.rooms": "Listen together in real time",
      "cmp.lyrics": "Synced lyrics",
      "cmp.account": "Mandatory account",
      "cmp.cost": "Cost",
      "cmp.yes": "Yes",
      "cmp.no": "No",
      "cmp.limited": "Limited",
      "cmp.premium": "Requires Premium",
      "cmp.adsFree": "Free with ads",
      "cmp.free": "Free",
      "cmp.indie.title": "Against other independent clients",
      "cmp.indie.lead": "OpenYTMusic and Metrolist are other unofficial YouTube Music clients. Feature comparison, category by category — not brands affiliated with NexusMusic.",
      "cmp.group.player": "Player core",
      "cmp.group.account": "Account and cloud",
      "cmp.group.social": "Community and social",
      "cmp.group.rooms": "Rooms and shared listening",
      "cmp.group.theme": "Visual customization",
      "cmp.group.audio": "Audio engine",
      "cmp.group.extras": "Extras",
      "cmp.group.import": "Cross-platform import",
      "cmp.group.premium": "Premium",
      "cmp.group.transparency": "Transparency",
      "cmp.group.project": "The project",
      "cmp.android": "Android",
      "cmp.ytmClient": "YouTube Music client",
      "cmp.queue": "Queue / library",
      "cmp.ownLogin": "Own login",
      "cmp.ytmLogin": "YouTube Music login",
      "cmp.ownCloud": "Own cloud library",
      "cmp.sync": "Cross-device sync",
      "cmp.sync.nexus": "Yes, with Nexus",
      "cmp.sync.ytm": "Yes, with YTM",
      "cmp.partial": "Partial",
      "cmp.comments": "Comments on songs",
      "cmp.replies": "Reply to comments",
      "cmp.profile": "Social profile",
      "cmp.follow": "Follow artists inside Nexus",
      "cmp.chat": "Chat in rooms",
      "cmp.chat.warn": "Not highlighted in their docs",
      "cmp.avatar": "Profile photo in room",
      "cmp.search": "Search inside the room",
      "cmp.customTheme": "Custom themes",
      "cmp.customBg": "Custom background",
      "cmp.dynamic": "Dynamic color",
      "cmp.dynamic.palettes": "Yes, +19 palettes",
      "cmp.eq": "Equalizer",
      "cmp.speed": "Speed / tempo control",
      "cmp.pitch": "Pitch control",
      "cmp.skipSilence": "Skip silences",
      "cmp.normalize": "Audio normalization",
      "cmp.crossfade": "Crossfade",
      "cmp.sleep": "Sleep timer",
      "cmp.widget": "Home widget",
      "cmp.importPlaylists": "Import playlists",
      "cmp.importLink": "Import by link",
      "cmp.radio": "Radio / mood modes",
      "cmp.spotify": "Spotify → Nexus",
      "cmp.ytm2": "YouTube Music → Nexus",
      "cmp.ytm2.native": "Native",
      "cmp.soundcloud": "SoundCloud → Nexus",
      "cmp.saveToYtm": "Save from NexusMusic to YT Music",
      "cmp.plus": "Nexus+ / Nexus Coins",
      "cmp.noTrackers": "No trackers",
      "cmp.declared": "Declared",
      "cmp.opensource": "Open source",
      "cmp.biz": "Business project",
      "cmp.biz.noData": "No clear data",
      "cmp.biz.community": "Community / open source",
      "cmp.ecosystem": "Own ecosystem",
      "cmp.socialNet": "Own social network",
      "cmp.dev": "Development",
      "cmp.dev.activeNexus": "Active, according to Nexus",
      "cmp.dev.activeWeb": "Active, according to their site",
      "cmp.dev.maint": "In maintenance",
      "news.eyebrow": "Changelog",
      "news.title": "What's new in this version",
      "news.body": "What changed, told by the person who made it.",
      "news.1.t": "Glass effect across the app",
      "news.1.d": "Title bars, the bottom pill, notices and sheets are translucent: content shows faintly underneath, with a light edge and a glow in the artwork's colour at top and bottom. Turn it off in Settings → Appearance if you prefer flat black.",
      "news.2.t": "Profile photos in rooms",
      "news.2.d": "Tap your chip, pick a photo from your phone, and the other person sees your face in the room circle. It's cropped and shrunk before it leaves, never stored on a server, and removable whenever you want.",
      "news.3.t": "NexusMusic joins Nexus Forge",
      "news.3.d": "Nexus Studios. Owner. Thanks to all of you for trusting us and using NexusMusic.",
      "news.3b.t": "Log in with your Nexus Forge account",
      "news.3b.d": "Nexus Studios. Owner. Platform login is now available in the app, with cloud song saving, comments on tracks and the option to follow artists.",
      "news.4.t": "From NexusMusicYT to NexusMusic",
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
      "faq.4.a": "A studio that loves music. Nexus Forge (Nexus Studios) made the project: it gave it a place on its platform and built this secondary site. NexusMusic is not affiliated with or endorsed by YouTube or Google LLC.",
      "faq.5.q": "How do I know the APK is safe?",
      "faq.5.a": "Every version is uploaded to VirusTotal before publishing; the link to the full report is in the interface section above, next to the SHA-256 hash so you can compare the file you downloaded.",
      "faq.6.q": "What's the difference between Nexus+ and Nexus Coins?",
      "faq.6.a": "Same destination, two paths: Nexus+ is a membership that unlocks advanced customization at once, and Nexus Coins unlocks it little by little without a subscription. Neither removes ads, because there never were any here.",
      "end.title": "Take it with you",
      "end.body": "Download the APK, install it, and that's it. No accounts and no permissions it doesn't use.",
      "footer.repo": "Code on GitHub",
      "footer.nexus": "Nexus Forge",
      "footer.privacy": "Privacy policy",
      "footer.disclaimer": "NexusMusic is an independent client, built by a music fan. It is not affiliated with or endorsed by YouTube or Google LLC. \"YouTube\" and \"YouTube Music\" are trademarks of Google LLC. \"Spotify\" is a trademark of Spotify AB. The icons used in the comparison are generic and do not represent those brands.",
      "footer.license": "Source-available (read-only): you may read it, study it and build it for personal use. Copying, modifying or redistributing it is not allowed.",
      "footer.rights": "all rights reserved."
    },
    pt: {
      "nav.github": "versões",
      "nav.download": "Baixar",
      "hero.eyebrow": "já disponível",
      "hero.title": "Todo o seu YouTube Music, sem o que sobrava",
      "hero.lead": "Reprodução em segundo plano de verdade, downloads para ouvir sem dados, e uma sala compartilhada com outra pessoa em tempo real. Sem anúncios.",
      "hero.cta": "Baixar o APK",
      "hero.repo": "Ver as versões",
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
      "nexus.body": "O NexusMusic faz parte da vitrine de projetos da Nexus Forge. Eles são os donos e desenvolvedores, por isso o app continua grátis, sem anúncios e sem mensalidades.",
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
      "why.1.t": "Por que existe?",
      "why.1.d": "Nasceu como um cliente alternativo para ouvir a mesma música de sempre sem as interrupções e telas extras que o app oficial gratuito traz.",
      "why.2.t": "Atualizações",
      "why.2.d": "Cada nova versão traz seu próprio hash SHA-256 e, quando aplicável, seu relatório do VirusTotal para você conferir antes de instalar.",
      "why.3.t": "Compatibilidade",
      "why.3.d": "Android 7.0 ou superior. Não requer Play Services para o básico, e o APK instala como qualquer app fora da loja (ativando \"fontes desconhecidas\" uma única vez).",
      "plus.eyebrow": "Personalização",
      "plus.title": "Deixe do seu jeito",
      "plus.lead": "O app e o site são personalizáveis a fundo. Com Nexus+ ou Nexus Coins — você escolhe o caminho.",
      "plus.badge.premium": "Premium",
      "plus.badge.coins": "Alternativa",
      "plus.p1.title": "Nexus+",
      "plus.p1.body": "Personalização avançada no app e no site da Nexus Forge: temas exclusivos, ícones, capas de reprodutor e ajustes que não estão disponíveis de outra forma. Não remove nenhum anúncio — aqui nunca teve — é pura personalização.",
      "plus.p1.li1": "Temas e cores exclusivos",
      "plus.p1.li2": "Ícones e capas de reprodutor sob medida",
      "plus.p1.li3": "Ajustes que não estão em nenhum outro lugar",
      "plus.p1.cta": "Conhecer o Nexus+",
      "plus.p2.title": "Nexus Coins",
      "plus.p2.body": "Prefere não assinar? Com o Nexus Coins você desbloqueia a mesma personalização aos poucos, ganhando ou conseguindo dentro do ecossistema da Nexus Forge. Mesmo resultado, outro caminho.",
      "plus.p2.li1": "A mesma personalização, sem assinatura",
      "plus.p2.li2": "Conseguidas usando o ecossistema Nexus Forge",
      "plus.p2.li3": "Você constrói seu progresso no seu ritmo",
      "plus.p2.cta": "Ver Nexus Coins",
      "cmp.eyebrow": "Comparação",
      "cmp.title": "Em que se diferencia do que você já conhece",
      "cmp.lead": "Uma foto rápida frente aos apps oficiais, na versão gratuita. Não são marcas afiliadas ao NexusMusic — é só uma comparação de funções.",
      "cmp.feature": "Função",
      "cmp.app": "App",
      "cmp.noAds": "Sem anúncios",
      "cmp.bg": "Reprodução em segundo plano",
      "cmp.offline": "Downloads offline",
      "cmp.rooms": "Ouvir juntos em tempo real",
      "cmp.lyrics": "Letras sincronizadas",
      "cmp.account": "Conta obrigatória",
      "cmp.cost": "Custo",
      "cmp.yes": "Sim",
      "cmp.no": "Não",
      "cmp.limited": "Limitada",
      "cmp.premium": "Requer Premium",
      "cmp.adsFree": "Grátis com anúncios",
      "cmp.free": "Grátis",
      "cmp.indie.title": "Frente a outros clientes independentes",
      "cmp.indie.lead": "OpenYTMusic e Metrolist são outros clientes não oficiais do YouTube Music. Comparação de funções, categoria por categoria — não são marcas afiliadas ao NexusMusic.",
      "cmp.group.player": "Núcleo do reprodutor",
      "cmp.group.account": "Conta e nuvem",
      "cmp.group.social": "Comunidade e social",
      "cmp.group.rooms": "Salas e escuta compartilhada",
      "cmp.group.theme": "Personalização visual",
      "cmp.group.audio": "Motor de áudio",
      "cmp.group.extras": "Extras",
      "cmp.group.import": "Importação entre plataformas",
      "cmp.group.premium": "Premium",
      "cmp.group.transparency": "Transparência",
      "cmp.group.project": "O projeto",
      "cmp.android": "Android",
      "cmp.ytmClient": "Cliente do YouTube Music",
      "cmp.queue": "Fila / biblioteca",
      "cmp.ownLogin": "Login próprio",
      "cmp.ytmLogin": "Login com YouTube Music",
      "cmp.ownCloud": "Biblioteca na nuvem própria",
      "cmp.sync": "Sincronização entre dispositivos",
      "cmp.sync.nexus": "Sim, com Nexus",
      "cmp.sync.ytm": "Sim, com YTM",
      "cmp.partial": "Parcial",
      "cmp.comments": "Comentários nas músicas",
      "cmp.replies": "Responder comentários",
      "cmp.profile": "Perfil social",
      "cmp.follow": "Seguir artistas dentro do Nexus",
      "cmp.chat": "Chat nas salas",
      "cmp.chat.warn": "Não destacado na documentação deles",
      "cmp.avatar": "Foto de perfil na sala",
      "cmp.search": "Busca dentro da sala",
      "cmp.customTheme": "Temas personalizados",
      "cmp.customBg": "Fundo personalizado",
      "cmp.dynamic": "Cor dinâmica",
      "cmp.dynamic.palettes": "Sim, +19 paletas",
      "cmp.eq": "Equalizador",
      "cmp.speed": "Controle de velocidade / tempo",
      "cmp.pitch": "Controle de tom / pitch",
      "cmp.skipSilence": "Pular silêncios",
      "cmp.normalize": "Normalização de áudio",
      "cmp.crossfade": "Crossfade",
      "cmp.sleep": "Sleep timer",
      "cmp.widget": "Widget da tela inicial",
      "cmp.importPlaylists": "Importar playlists",
      "cmp.importLink": "Importar por link",
      "cmp.radio": "Rádio / modos de humor",
      "cmp.spotify": "Spotify → Nexus",
      "cmp.ytm2": "YouTube Music → Nexus",
      "cmp.ytm2.native": "Nativo",
      "cmp.soundcloud": "SoundCloud → Nexus",
      "cmp.saveToYtm": "Salvar do NexusMusic para o YT Music",
      "cmp.plus": "Nexus+ / Nexus Coins",
      "cmp.noTrackers": "Sem rastreadores",
      "cmp.declared": "Declarado",
      "cmp.opensource": "Código aberto",
      "cmp.biz": "Projeto empresarial",
      "cmp.biz.noData": "Sem dados claros",
      "cmp.biz.community": "Comunidade / código aberto",
      "cmp.ecosystem": "Ecossistema próprio",
      "cmp.socialNet": "Rede social própria",
      "cmp.dev": "Desenvolvimento",
      "cmp.dev.activeNexus": "Ativo, segundo a Nexus",
      "cmp.dev.activeWeb": "Ativo, segundo o site deles",
      "cmp.dev.maint": "Em manutenção",
      "news.eyebrow": "Registro de mudanças",
      "news.title": "O que há de novo nesta versão",
      "news.body": "O que mudou, contado por quem fez.",
      "news.1.t": "Efeito vidro em todo o app",
      "news.1.d": "As barras de título, a pílula de baixo, os avisos e as folhas são translúcidos: o conteúdo aparece de leve por baixo, com canto de luz e um brilho da cor da capa em cima e embaixo. Desligue em Ajustes → Aparência se preferir o preto liso.",
      "news.2.t": "Foto de perfil nas salas",
      "news.2.d": "Ao tocar no seu cartão você escolhe uma foto do celular e a outra pessoa vê seu rosto no círculo da sala. É recortada e reduzida antes de sair, nunca fica em servidor algum e pode ser removida quando quiser.",
      "news.3.t": "NexusMusic entra na Nexus Forge",
      "news.3.d": "Nexus Studios. Proprietário. Obrigado a todos vocês por confiar em nós e usar o NexusMusic.",
      "news.3b.t": "Login com sua conta da Nexus Forge",
      "news.3b.d": "Nexus Studios. Proprietário. Agora dá pra entrar com a conta da plataforma no app, com salvamento de músicas na nuvem, comentários nas faixas e a opção de seguir artistas.",
      "news.4.t": "De NexusMusicYT para NexusMusic",
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
      "faq.4.a": "Um estúdio que gosta de música. A Nexus Forge (Nexus Studios) fez o projeto: deu um lugar na plataforma e criou este site secundário. O NexusMusic não é afiliado nem endossado pelo YouTube ou pela Google LLC.",
      "faq.5.q": "Como sei que o APK é seguro?",
      "faq.5.a": "Cada versão é enviada ao VirusTotal antes de publicar; o link para o relatório completo está na seção de interface, acima, junto ao hash SHA-256 para você comparar o arquivo que baixou.",
      "faq.6.q": "Qual a diferença entre Nexus+ e Nexus Coins?",
      "faq.6.a": "Mesmo destino, dois caminhos: Nexus+ é uma assinatura que desbloqueia a personalização avançada de uma vez, e o Nexus Coins desbloqueia aos poucos sem assinatura. Nenhum dos dois tira anúncios, porque aqui nunca teve.",
      "end.title": "Leve com você",
      "end.body": "Baixe o APK, instale e pronto. Não pede contas nem permissões que não usa.",
      "footer.repo": "Código no GitHub",
      "footer.nexus": "Nexus Forge",
      "footer.privacy": "Política de privacidade",
      "footer.disclaimer": "O NexusMusic é um cliente independente, feito por um fã de música. Não é afiliado nem endossado pelo YouTube ou pela Google LLC. \"YouTube\" e \"YouTube Music\" são marcas da Google LLC. \"Spotify\" é marca da Spotify AB. Os ícones usados na comparação são genéricos e não representam essas marcas.",
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

  /* ── Versión, hash y APK reales desde version.json ──────────────── */
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

  /* ── Visor de capturas ──────────────────────────────────────────── */
  (function () {
    var shots = document.querySelectorAll(".phone__screen img");
    if (!shots.length) return;

    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML =
      '<div class="lightbox__frame">' +
        '<span class="lightbox__corner tl" aria-hidden="true"></span>' +
        '<span class="lightbox__corner tr" aria-hidden="true"></span>' +
        '<span class="lightbox__corner bl" aria-hidden="true"></span>' +
        '<span class="lightbox__corner br" aria-hidden="true"></span>' +
        '<button type="button" class="lightbox__close" aria-label="Cerrar">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
        '<div class="lightbox__screen"><img alt=""></div>' +
        '<div class="lightbox__caption"></div>' +
      '</div>';
    document.body.appendChild(lightbox);

    var frameImg = lightbox.querySelector(".lightbox__screen img");
    var caption = lightbox.querySelector(".lightbox__caption");
    var closeBtn = lightbox.querySelector(".lightbox__close");
    var lastFocused = null;

    function openLightbox(img) {
      var card = img.closest(".phone-card");
      var figcap = card ? card.querySelector("figcaption") : null;
      frameImg.src = img.currentSrc || img.src;
      frameImg.alt = img.alt || "";
      caption.textContent = figcap ? figcap.textContent : "";
      lastFocused = document.activeElement;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    Array.prototype.forEach.call(shots, function (img) {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.addEventListener("click", function () { openLightbox(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(img); }
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  })();

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
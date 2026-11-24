/* ═══════════════════════════════════════════════════════════════════
   NexusMusic — Política de privacidad (p.js)
   Sistema de idiomas independiente del resto del sitio.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var I18N = {
    en: {
      "page.title": "Privacy Policy — NexusMusic",
      "page.desc": "NexusMusic privacy policy: what data is used, what isn't stored, and how anonymous stats work.",
      "bar.back": "← Back to home",

      "hero.eyebrow": "Legal · NexusMusic",
      "hero.title": "Your music, with nobody looking over your shoulder",
      "hero.lead": "We don't ask for an account to listen, there are no ad trackers, and the stats we collect are anonymous and can be turned off. Here's everything, in plain language.",
      "hero.updated": "Last updated: September 2026",
      "hero.scope": "Applies to the app and this website",

      "toc.label": "On this page",
      "toc.1": "Quick summary",
      "toc.2": "What data is collected",
      "toc.3": "Account and YTM login",
      "toc.4": "Listen-together rooms",
      "toc.5": "Local downloads",
      "toc.6": "Third-party services",
      "toc.7": "Imports",
      "toc.8": "Minors",
      "toc.9": "Your rights",
      "toc.10": "Future changes",
      "toc.11": "Contact",
      "toc.updated": "NexusMusic is a project by Nexus Forge (Nexus Studios).",

      "intro": "NexusMusic is built to work <strong>without asking you for almost anything</strong>. This policy clearly separates what stays on your phone from what actually leaves for a server, and why.",

      "res.h": "Quick summary",
      "res.p": "If you don't want to read the whole document, this is the essentials:",
      "res.c1.b": "No mandatory account",
      "res.c1.s": "The Nexus Forge account and the YouTube Music login are optional.",
      "res.c2.b": "No advertising",
      "res.c2.s": "There are no ads or ad networks: there's nobody to share your data with for that.",
      "res.c3.b": "Anonymous, switchable stats",
      "res.c3.s": "They're turned off from Settings whenever you want, without stopping using the app.",
      "res.c4.b": "Profile photos in rooms",
      "res.c4.s": "Only visible between the two people in the room; they're never uploaded to a server.",

      "dat.h": "What data is collected",
      "dat.p": "NexusMusic separates what happens <strong>on your phone</strong> from what is sent to a server:",
      "dat.li1": "<strong>Local use, never leaves your device:</strong> your library, downloads, playback history, saved lyrics and app preferences.",
      "dat.li2": "<strong>Anonymous, optional stats:</strong> general feature-usage counts, without identifying you, to know which parts of the app are used most. They're turned off from Settings → Privacy.",
      "dat.li3": "<strong>Account data, only if you sign in:</strong> see the next section.",
      "dat.li4": "<strong>Minimal technical data:</strong> app and OS version, only to show you compatible updates.",
      "dat.p2": "We don't collect precise location, contacts, or access files beyond what's needed for downloads.",

      "acc.h": "Nexus Forge account and YouTube Music login",
      "acc.p": "Signing in is optional and only activates if you choose it from the app:",
      "acc.li1": "<strong>With your Nexus Forge account:</strong> your library is saved in the Nexus Forge cloud, along with comments you leave on songs and artists you follow. It's managed by Nexus Forge (Nexus Studios), the project owner.",
      "acc.li2": "<strong>With your YouTube Music account:</strong> used only to show your existing playlists, likes and history, just like the official app. We don't access your email or Google data beyond your music library.",
      "acc.p2": "You can log out or delete your Nexus Forge account at any time from the app or the Nexus Forge website.",

      "sal.h": "Listen-together rooms",
      "sal.p": "When you create or join a room, the code and playback events (pause, song change, search) are transmitted in real time between participants to keep them in sync.",
      "sal.li1": "<strong>Room profile photo:</strong> taken from your phone, cropped and shown only to the other connected person. It's not stored on any server and is deleted when you leave the room.",
      "sal.li2": "<strong>Room chat:</strong> messages live while the room is active, without becoming permanent history.",
      "sal.li3": "Nobody outside the room can see what's shared inside it.",

      "dls.h": "Downloads and local storage",
      "dls.p": "Songs downloaded for offline listening are stored encrypted on your own device's storage. They're not uploaded to any NexusMusic server or shared with third parties. If you uninstall the app or clear its data, the downloads are deleted along with everything else stored locally.",

      "ter.h": "Third-party services",
      "ter.p": "NexusMusic depends on some external services to work. Here's how it relates to each:",
      "ter.th1": "Service",
      "ter.th2": "What it's used for",
      "ter.th3": "What it receives",
      "ter.r1c1": "YouTube Music",
      "ter.r1c2": "Music catalog and, if you sign in, your library",
      "ter.r1c3": "Your playback requests and, if you log in, your session",
      "ter.r2c1": "Lyrics providers",
      "ter.r2c2": "Show synced lyrics",
      "ter.r2c3": "Title and artist of the song being played",
      "ter.r3c1": "APK distribution",
      "ter.r3c2": "Publish each new version",
      "ter.r3c3": "Nothing personal; it's a public download",
      "ter.r4c1": "Nexus Forge",
      "ter.r4c2": "Account, cloud, comments, Nexus+ / Nexus Coins",
      "ter.r4c3": "Only if you sign in with that account",
      "ter.p2": "We don't sell or share your data with advertising networks, because we simply don't use them.",

      "imp.h": "Import from other platforms",
      "imp.p": "If you use the import from Spotify (with login) or SoundCloud (by URL), that connection is used only to read the list of songs you want to bring to NexusMusic. We don't publish anything on those accounts or access data beyond your playlists.",

      "men.h": "Use by minors",
      "men.p": "NexusMusic doesn't ask for your age or identifying data to be used without an account. The features that do require an account (comments, social profile, rooms) are intended for responsible use; if you're a parent or guardian and believe a minor in your care used these features inappropriately, you can write to us using the contact below.",

      "der.h": "Your rights and the control you have",
      "der.li1": "<strong>Turn off stats:</strong> from Settings → Privacy, at any time.",
      "der.li2": "<strong>Delete your Nexus Forge account:</strong> removes your cloud library, comments and associated data.",
      "der.li3": "<strong>Delete local data:</strong> by uninstalling the app or clearing its storage from your system settings.",
      "der.li4": "<strong>Use the app without leaving any account trace:</strong> it's the default mode; nothing forces you to log in.",

      "cam.h": "Changes to this policy",
      "cam.p": "If this policy changes in a relevant way, it will be reflected in the \"last updated\" date above and, when the change is significant, it will be announced inside the app or in the website changelog.",

      "con.h": "Questions about this policy?",
      "con.p": "Write to us on Discord or through the Nexus Forge website and we'll get back to you.",
      "con.cta": "Go to Nexus Forge",

      "foot.brand": "NexusMusic — a project by",
      "foot.back": "Back to home"
    },

    pt: {
      "page.title": "Política de privacidade — NexusMusic",
      "page.desc": "Política de privacidade do NexusMusic: quais dados são usados, o que não é guardado e como funcionam as estatísticas anônimas.",
      "bar.back": "← Voltar ao início",

      "hero.eyebrow": "Legal · NexusMusic",
      "hero.title": "Sua música, sem ninguém olhando por cima do ombro",
      "hero.lead": "Não pedimos conta para ouvir, não há rastreadores de publicidade e as estatísticas coletadas são anônimas e podem ser desligadas. Aqui está tudo, em linguagem simples.",
      "hero.updated": "Última atualização: setembro de 2026",
      "hero.scope": "Aplica-se ao app e a este site",

      "toc.label": "Nesta página",
      "toc.1": "Resumo rápido",
      "toc.2": "Quais dados são coletados",
      "toc.3": "Conta e login do YTM",
      "toc.4": "Salas de ouvir juntos",
      "toc.5": "Downloads locais",
      "toc.6": "Serviços de terceiros",
      "toc.7": "Importações",
      "toc.8": "Menores de idade",
      "toc.9": "Seus direitos",
      "toc.10": "Mudanças futuras",
      "toc.11": "Contato",
      "toc.updated": "O NexusMusic é um projeto da Nexus Forge (Nexus Studios).",

      "intro": "O NexusMusic foi feito para funcionar <strong>sem pedir quase nada</strong>. Esta política separa claramente o que fica no seu celular do que efetivamente sai para algum servidor, e por quê.",

      "res.h": "Resumo rápido",
      "res.p": "Se você não quer ler o documento inteiro, isto é o essencial:",
      "res.c1.b": "Sem conta obrigatória",
      "res.c1.s": "A conta da Nexus Forge e o login do YouTube Music são opcionais.",
      "res.c2.b": "Sem publicidade",
      "res.c2.s": "Não há anúncios nem redes publicitárias: não há com quem compartilhar seus dados para isso.",
      "res.c3.b": "Estatísticas anônimas e desligáveis",
      "res.c3.s": "Desativam-se em Ajustes quando quiser, sem deixar de usar o app.",
      "res.c4.b": "Fotos de perfil nas salas",
      "res.c4.s": "Aparecem só entre os dois da sala; nunca são enviadas a um servidor.",

      "dat.h": "Quais dados são coletados",
      "dat.p": "O NexusMusic separa o que acontece <strong>no seu celular</strong> do que é enviado a um servidor:",
      "dat.li1": "<strong>Uso local, nunca sai do seu dispositivo:</strong> sua biblioteca, downloads, histórico de reprodução, letras salvas e preferências do app.",
      "dat.li2": "<strong>Estatísticas anônimas, opcionais:</strong> contagens gerais de uso de funções, sem te identificar, para saber quais partes do app são mais usadas. Desligam-se em Ajustes → Privacidade.",
      "dat.li3": "<strong>Dados de conta, só se você entrar:</strong> ver a próxima seção.",
      "dat.li4": "<strong>Dados técnicos mínimos:</strong> versão do app e do sistema operacional, apenas para mostrar atualizações compatíveis.",
      "dat.p2": "Não coletamos localização precisa, contatos, nem acesso a arquivos além do necessário para os downloads.",

      "acc.h": "Conta da Nexus Forge e login do YouTube Music",
      "acc.p": "Entrar é opcional e só se ativa se você escolher no app:",
      "acc.li1": "<strong>Com sua conta da Nexus Forge:</strong> sua biblioteca é salva na nuvem do ecossistema Nexus Forge, junto com comentários que você deixa nas músicas e os artistas que segue. É administrado pela Nexus Forge (Nexus Studios), proprietária do projeto.",
      "acc.li2": "<strong>Com sua conta do YouTube Music:</strong> é usada só para mostrar suas playlists, curtidas e histórico existentes, igual ao app oficial. Não acessamos seu e-mail nem dados do Google além da sua biblioteca musical.",
      "acc.p2": "Você pode sair ou apagar sua conta da Nexus Forge a qualquer momento pelo app ou pelo site da Nexus Forge.",

      "sal.h": "Salas de \"ouvir juntos\"",
      "sal.p": "Ao criar ou entrar numa sala, o código e os eventos de reprodução (pausa, troca de música, busca) são transmitidos em tempo real entre os participantes para mantê-los sincronizados.",
      "sal.li1": "<strong>Foto de perfil da sala:</strong> é tirada do seu celular, recortada e mostrada só para a outra pessoa conectada. Não é guardada em servidor algum e é apagada ao sair da sala.",
      "sal.li2": "<strong>Chat da sala:</strong> as mensagens vivem enquanto a sala está ativa, sem virar histórico permanente.",
      "sal.li3": "Ninguém fora da sala pode ver o que é compartilhado dentro dela.",

      "dls.h": "Downloads e armazenamento local",
      "dls.p": "As músicas baixadas para ouvir offline são guardadas criptografadas no armazenamento do seu próprio dispositivo. Não são enviadas a nenhum servidor do NexusMusic nem compartilhadas com terceiros. Se você desinstalar o app ou apagar seus dados, os downloads são eliminados junto com todo o resto guardado localmente.",

      "ter.h": "Serviços de terceiros",
      "ter.p": "O NexusMusic depende de alguns serviços externos para funcionar. Veja como se relaciona com cada um:",
      "ter.th1": "Serviço",
      "ter.th2": "Para que é usado",
      "ter.th3": "O que recebe",
      "ter.r1c1": "YouTube Music",
      "ter.r1c2": "Catálogo musical e, se você entrar, sua biblioteca",
      "ter.r1c3": "Suas solicitações de reprodução e, se você entrar, sua sessão",
      "ter.r2c1": "Provedores de letras",
      "ter.r2c2": "Mostrar letras sincronizadas",
      "ter.r2c3": "Título e artista da música em reprodução",
      "ter.r3c1": "Distribuição do APK",
      "ter.r3c2": "Publicar cada nova versão",
      "ter.r3c3": "Nada pessoal; é um download público",
      "ter.r4c1": "Nexus Forge",
      "ter.r4c2": "Conta, nuvem, comentários, Nexus+ / Nexus Coins",
      "ter.r4c3": "Só se você entrar com essa conta",
      "ter.p2": "Não vendemos nem compartilhamos seus dados com redes de publicidade, porque simplesmente não as usamos.",

      "imp.h": "Importação de outras plataformas",
      "imp.p": "Se você usa a importação do Spotify (com login) ou do SoundCloud (por URL), essa conexão é usada apenas para ler a lista de músicas que você quer trazer para o NexusMusic. Não publicamos nada nessas contas nem acessamos dados além das suas playlists.",

      "men.h": "Uso por menores de idade",
      "men.p": "O NexusMusic não pede idade nem dados de identificação para ser usado sem conta. As funções que exigem conta (comentários, perfil social, salas) são pensadas para um uso responsável; se você é pai, mãe ou responsável e acha que um menor sob seus cuidados usou essas funções de forma inadequada, pode nos escrever pelo contato abaixo.",

      "der.h": "Seus direitos e o controle que você tem",
      "der.li1": "<strong>Desligar estatísticas:</strong> em Ajustes → Privacidade, a qualquer momento.",
      "der.li2": "<strong>Apagar sua conta da Nexus Forge:</strong> elimina sua biblioteca na nuvem, comentários e dados associados.",
      "der.li3": "<strong>Apagar dados locais:</strong> desinstalando o app ou limpando seu armazenamento nos ajustes do sistema.",
      "der.li4": "<strong>Usar o app sem deixar rastro de conta:</strong> é o modo padrão; nada te obriga a entrar.",

      "cam.h": "Mudanças nesta política",
      "cam.p": "Se esta política mudar de forma relevante, isso vai aparecer na data de \"última atualização\" acima e, quando a mudança for significativa, será avisado dentro do app ou no registro de mudanças do site.",

      "con.h": "Dúvidas sobre esta política?",
      "con.p": "Escreva para nós pelo Discord ou pelo site da Nexus Forge e respondemos.",
      "con.cta": "Ir para a Nexus Forge",

      "foot.brand": "NexusMusic — um projeto da",
      "foot.back": "Voltar ao início"
    }
  };

  var nodes = document.querySelectorAll("[data-i18n]");
  var buttons = document.querySelectorAll(".lang button");

  function applyLang(lang) {
    var dict = I18N[lang];
    Array.prototype.forEach.call(nodes, function (el) {
      var key = el.getAttribute("data-i18n");
      if (!el.hasAttribute("data-es")) el.setAttribute("data-es", el.innerHTML);
      el.innerHTML = dict && dict[key] ? dict[key] : el.getAttribute("data-es");
    });
    // atributos especiales (title, meta description)
    var titleKey = document.querySelector("title[data-i18n]");
    if (titleKey) {
      if (!titleKey.hasAttribute("data-es")) titleKey.setAttribute("data-es", titleKey.textContent);
      document.title = (dict && dict[titleKey.getAttribute("data-i18n")]) || titleKey.getAttribute("data-es");
    }
    var metaDesc = document.querySelector('meta[name="description"][data-i18n]');
    if (metaDesc) {
      if (!metaDesc.hasAttribute("data-es")) metaDesc.setAttribute("data-es", metaDesc.getAttribute("content"));
      metaDesc.setAttribute("content", (dict && dict[metaDesc.getAttribute("data-i18n")]) || metaDesc.getAttribute("data-es"));
    }
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

  /* ── TOC activo según scroll ─────────────────────────────────────── */
  (function(){
    var links = Array.prototype.slice.call(document.querySelectorAll('#toc-list a'));
    var sections = links.map(function(a){ return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    if (!('IntersectionObserver' in window) || !sections.length) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var id = '#' + entry.target.id;
        var link = links.find(function(a){ return a.getAttribute('href') === id; });
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function(a){ a.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    sections.forEach(function(s){ io.observe(s); });
  })();

  /* ── Protección ──────────────────────────────────────────────────── */
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j'))) {
      e.preventDefault();
      return false;
    }
  });

})();
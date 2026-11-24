'use strict';

(function () {
  function mountChat() {
    var discordButton = document.getElementById('discord-settings');
    if (!discordButton || document.getElementById('forma-chat-trigger')) return;

    var launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.id = 'forma-chat-trigger';
    launcher.className = 'forma-chat-trigger';
    launcher.setAttribute('aria-label', 'Abrir chat de ayuda');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'forma-chat-panel');
    launcher.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-9.5A7.5 7.5 0 0 1 10.5 4h2A7.5 7.5 0 0 1 20 11.5Z"></path><path d="M8 11h8M8 14h5"></path></svg><span>Chat</span>';
    var actions = document.createElement('div');
    actions.className = 'app-top-actions';
    discordButton.parentNode.insertBefore(actions, discordButton);
    actions.append(discordButton, launcher);

    var panel = document.createElement('section');
    panel.id = 'forma-chat-panel';
    panel.className = 'forma-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat de ayuda Nexus Forma');
    panel.setAttribute('aria-modal', 'false');
    panel.hidden = true;
    panel.innerHTML = '<header class="forma-chat-header"><div class="forma-chat-brand"><span class="forma-chat-mark" aria-hidden="true">✦</span><div><strong>Nexus Forma</strong><small>NEXUS FORMA · SOPORTE</small></div></div><button class="forma-chat-close" type="button" aria-label="Cerrar chat">×</button><h2>¡Hola! 👋<br>¿Cómo podemos ayudarte?</h2><p class="forma-chat-online"><i></i> Chat con Nexus Forma</p></header><main class="forma-chat-body"><section class="forma-chat-home" data-chat-view="home"><p class="forma-chat-section-title">¿Qué necesitas?</p><button class="forma-chat-card forma-chat-recent" type="button" data-chat-action="messages"><span class="forma-chat-card-icon">✦</span><span><strong>Hacer una pregunta</strong><small>Conversa con Nexus Forma</small></span><b>›</b></button><button class="forma-chat-card forma-chat-action" type="button" data-chat-prompt="Dame ayuda rápida para empezar a usar NexusMusic."><span class="forma-chat-card-icon">✧</span><span><strong>Ayuda rápida con Nexus IA</strong><small>Recibe una respuesta al instante</small></span><b>↗</b></button><button class="forma-chat-card" type="button" data-chat-action="help"><span class="forma-chat-card-icon">⌕</span><span><strong>Guías y preguntas frecuentes</strong><small>Explora ayuda sobre NexusMusic</small></span><b>↗</b></button><p class="forma-chat-privacy">Tus mensajes se envían a Nexus Forma para generar respuestas. No incluyas contraseñas ni datos sensibles.</p></section><section class="forma-chat-messages-view" data-chat-view="messages" hidden><div class="forma-chat-thread" id="forma-chat-thread" aria-live="polite" aria-relevant="additions text"><div class="forma-chat-message forma-chat-message--assistant"><span class="forma-chat-message-mark">✦</span><p>¡Hola! Soy Nexus Forma. Pregúntame sobre NexusMusic y te ayudaré.</p></div></div><p class="forma-chat-status" id="forma-chat-status" role="status"></p><form class="forma-chat-compose" id="forma-chat-form"><label class="sr-only" for="forma-chat-input">Escribe tu mensaje</label><input id="forma-chat-input" maxlength="2000" autocomplete="off" placeholder="Escribe tu mensaje…" required><button type="submit" aria-label="Enviar mensaje"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg></button></form></section><section class="forma-chat-help" data-chat-view="help" hidden><p class="forma-chat-section-title">Preguntas frecuentes</p><p class="forma-chat-help-intro">Elige un tema y Nexus Forma te orientará.</p><button type="button" data-chat-prompt="¿Cómo busco canciones y videos en NexusMusic Web?">Buscar música y videos <span>↗</span></button><button type="button" data-chat-prompt="¿Cómo creo una playlist y guardo canciones en NexusMusic?">Biblioteca y playlists <span>↗</span></button><button type="button" data-chat-prompt="¿Cómo funcionan las salas para escuchar juntos en NexusMusic?">Salas para escuchar juntos <span>↗</span></button><button type="button" data-chat-prompt="¿Cómo instalo NexusMusic en Android?">Instalar en Android <span>↗</span></button></section></main><nav class="forma-chat-tabs" aria-label="Secciones del chat"><button type="button" data-chat-action="home" aria-current="page"><span>⌂</span>Inicio</button><button type="button" data-chat-action="messages"><span>▤</span>Mensajes</button><button type="button" data-chat-action="help"><span>ⓘ</span>Ayuda</button></nav>';
    document.body.appendChild(panel);

    var history = [];
    var trigger = launcher;
    var closeButton = panel.querySelector('.forma-chat-close');
    var input = panel.querySelector('#forma-chat-input');
    var form = panel.querySelector('#forma-chat-form');
    var thread = panel.querySelector('#forma-chat-thread');
    var status = panel.querySelector('#forma-chat-status');
    var sendButton = form.querySelector('button');
    var busy = false;

    function setView(view) {
      panel.querySelectorAll('[data-chat-view]').forEach(function (section) {
        section.hidden = section.dataset.chatView !== view;
      });
      panel.querySelectorAll('.forma-chat-tabs [data-chat-action]').forEach(function (button) {
        if (button.dataset.chatAction === view) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
      if (view === 'messages') window.setTimeout(function () { input.focus(); }, 0);
    }

    function showPanel(show) {
      panel.hidden = !show;
      trigger.setAttribute('aria-expanded', String(show));
      if (show) {
        setView('home');
        closeButton.focus();
      } else trigger.focus();
    }

    function appendMessage(role, text) {
      var article = document.createElement('article');
      article.className = 'forma-chat-message forma-chat-message--' + role;
      if (role === 'assistant') {
        var mark = document.createElement('span');
        mark.className = 'forma-chat-message-mark';
        mark.textContent = '✦';
        article.appendChild(mark);
      }
      var content = document.createElement('p');
      content.textContent = text;
      article.appendChild(content);
      thread.appendChild(article);
      while (thread.children.length > 42) thread.removeChild(thread.firstElementChild);
      thread.scrollTop = thread.scrollHeight;
      return article;
    }

    async function sendMessage(text) {
      var content = String(text || '').trim();
      if (!content || busy) return;
      setView('messages');
      appendMessage('user', content);
      var pending = appendMessage('assistant', 'Nexus Forma está respondiendo…');
      pending.classList.add('is-pending');
      status.textContent = '';
      busy = true;
      input.disabled = true;
      sendButton.disabled = true;
      var outgoing = history.slice(-11);
      outgoing.push({ role: 'user', content: content });
      try {
        var apiKey = String(window.NEXUS_CHAT_API_KEY || '').trim();
        if (!apiKey) throw new Error('Falta configurar la clave del chat en el HTML.');
        var response = await fetch('/api/nexus-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + apiKey },
          cache: 'no-store',
          body: JSON.stringify({ messages: outgoing }),
          signal: AbortSignal.timeout(30_000)
        });
        var payload = await response.json().catch(function () { return {}; });
        if (!response.ok) throw new Error(payload.error || 'No se pudo enviar el mensaje.');
        if (typeof payload.answer !== 'string' || !payload.answer.trim()) {
          throw new Error('Nexus Forma no devolvió una respuesta válida.');
        }
        history = outgoing.concat([{ role: 'assistant', content: payload.answer.trim() }]);
        pending.classList.remove('is-pending');
        pending.querySelector('p').textContent = payload.answer.trim();
      } catch (error) {
        pending.remove();
        status.textContent = error.name === 'TimeoutError'
          ? 'El chat tardó demasiado. Inténtalo otra vez.'
          : error instanceof TypeError
            ? 'No pudimos conectar con Nexus Forma. Comprueba tu conexión.'
            : error.message || 'No se pudo enviar el mensaje.';
      } finally {
        busy = false;
        input.disabled = false;
        sendButton.disabled = false;
        input.value = '';
        input.focus();
      }
    }

    trigger.addEventListener('click', function () { showPanel(panel.hidden); });
    closeButton.addEventListener('click', function () { showPanel(false); });
    panel.querySelectorAll('[data-chat-action]').forEach(function (button) {
      button.addEventListener('click', function () {
        var action = button.dataset.chatAction;
        setView(action);
      });
    });
    panel.querySelectorAll('[data-chat-prompt]').forEach(function (button) {
      button.addEventListener('click', function () {
        showPanel(true);
        sendMessage(button.dataset.chatPrompt);
      });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      sendMessage(input.value);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) showPanel(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountChat, { once: true });
  } else mountChat();
})();

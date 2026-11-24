'use strict';

const MODEL = 'Nexus-Nova';
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2_000;
const requestCounts = new Map();

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function isSameOrigin(req) {
  const origin = req.headers && req.headers.origin;
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const host = req.headers.host;
    return Boolean(host && originUrl.host === host);
  } catch {
    return false;
  }
}

function isRateLimited(req) {
  const forwarded = req.headers && req.headers['x-forwarded-for'];
  const address = typeof forwarded === 'string' ? forwarded.split(',').pop().trim() : '';
  const key = address || 'unknown';
  const now = Date.now();
  if (requestCounts.size > 1_000) {
    for (const [ip, entry] of requestCounts) {
      if (now - entry.startedAt >= WINDOW_MS) requestCounts.delete(ip);
    }
  }
  const current = requestCounts.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    if (!current && requestCounts.size >= 1_000) return true;
    requestCounts.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

module.exports = async function nexusChat(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Método no permitido.');
  }
  if (!isSameOrigin(req)) return sendError(res, 403, 'Origen no permitido.');
  if (isRateLimited(req)) return sendError(res, 429, 'Has enviado muchas consultas. Espera un minuto e inténtalo otra vez.');

  const authorization = req.headers && req.headers.authorization;
  const match = typeof authorization === 'string' && /^Bearer ([^\s]{1,512})$/i.exec(authorization);
  if (!match) return sendError(res, 401, 'Falta la clave del chat configurada en el HTML.');
  const apiKey = match[1];

  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      !Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > MAX_MESSAGES) {
    return sendError(res, 400, 'La conversación no tiene un formato válido.');
  }

  const messages = [];
  for (const message of body.messages) {
    if (!message || typeof message !== 'object' ||
        !['user', 'assistant'].includes(message.role) ||
        typeof message.content !== 'string' ||
        !message.content.trim() ||
        message.content.length > MAX_MESSAGE_LENGTH) {
      return sendError(res, 400, 'Cada mensaje debe tener texto y un rol válido.');
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }
  if (messages[messages.length - 1].role !== 'user') {
    return sendError(res, 400, 'Envía una pregunta para continuar.');
  }

  try {
    const response = await fetch('https://www.nexusforms.lat/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Eres el asistente de ayuda de NexusMusic. Responde en español, con claridad y brevedad. Ayuda con las funciones de NexusMusic web y Android; no afirmes que puedes modificar cuentas, realizar pagos ni ver datos privados. Si no conoces una respuesta, dilo y recomienda contactar al equipo de Nexus Studios.'
          },
          ...messages
        ],
        max_tokens: 350
      }),
      signal: AbortSignal.timeout(25_000)
    });

    if (!response.ok) {
      console.error('Nexus Forma chat returned HTTP', response.status);
      if (response.status === 401 || response.status === 403) {
        return sendError(res, 502, 'La clave o el modelo de Nexus Forma no son válidos. Revisa la clave del chat en el HTML.');
      }
      if (response.status === 429) return sendError(res, 429, 'Nexus Forma alcanzó su límite temporal. Inténtalo más tarde.');
      return sendError(res, 502, 'Nexus Forma no está disponible en este momento. Inténtalo de nuevo.');
    }

    const payload = await response.json();
    const answer = payload && payload.choices && payload.choices[0] &&
      payload.choices[0].message && payload.choices[0].message.content;
    if (typeof answer !== 'string' || !answer.trim()) {
      console.error('Nexus Forma chat returned an unexpected response shape.');
      return sendError(res, 502, 'Nexus Forma devolvió una respuesta inesperada.');
    }
    return res.status(200).json({ answer: answer.trim() });
  } catch (error) {
    const timedOut = error && error.name === 'TimeoutError';
    console.error('Nexus Forma chat request failed:', timedOut ? 'timeout' : String(error && error.message || error).slice(0, 180));
    return sendError(res, timedOut ? 504 : 502, timedOut
      ? 'El chat tardó demasiado en responder. Inténtalo de nuevo.'
      : 'No se pudo conectar con Nexus Forma. Inténtalo de nuevo.');
  }
};

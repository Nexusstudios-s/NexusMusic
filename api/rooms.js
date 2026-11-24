'use strict';

const BACKEND = 'https://openytmusic-analytics-keau.onrender.com';
const ROOM_CODE = /^[A-HJ-NP-Z2-9]{6}$/;

module.exports = async function rooms(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  let url;
  let method = req.method;
  let body;

  if (method === 'POST') {
    const payload = req.body;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({ error: 'Datos de sala no válidos.' });
    }
    if (!['public', 'private'].includes(payload.visibility)) {
      return res.status(400).json({ error: 'Elige una sala pública o privada.' });
    }
    url = `${BACKEND}/v1/room`;
    body = JSON.stringify({
      visibility: payload.visibility,
      title: typeof payload.title === 'string' ? payload.title.slice(0, 48) : '',
      artwork: typeof payload.artwork === 'string' ? payload.artwork.slice(0, 600) : ''
    });
  } else if (method === 'GET') {
    const code = typeof req.query.code === 'string' ? req.query.code.trim().toUpperCase() : '';
    if (code) {
      if (!ROOM_CODE.test(code)) return res.status(400).json({ error: 'El código debe tener 6 caracteres.' });
      url = `${BACKEND}/v1/room/${code}`;
    } else {
      url = `${BACKEND}/v1/rooms/public`;
    }
  } else {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  try {
    const response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(55000)
    });
    const text = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8');
    return res.send(text);
  } catch (error) {
    const timedOut = error && error.name === 'TimeoutError';
    console.error('Listening rooms proxy:', error);
    return res.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? 'El servidor de salas está despertando. Inténtalo de nuevo en un momento.'
        : 'No se pudo conectar con el servidor de salas.'
    });
  }
};

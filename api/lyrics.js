'use strict';

const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

function cleanTitle(value) {
  return String(value || '')
    .replace(/\s*[\[(](?:official\s+)?(?:audio|video|lyrics?|lyric\s+video|visualizer|hd)[^\]\)]*[\]\)]/gi, ' ')
    .replace(/\s*[-|–]\s*(?:official\s+)?(?:audio|video|lyrics?|lyric\s+video|visualizer|hd)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanArtist(value) {
  return String(value || '')
    .replace(/\s*-\s*(?:Topic|VEVO)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = async function (req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const rawTitle = typeof req.query.title === 'string' ? req.query.title.trim() : '';
  const rawArtist = typeof req.query.artist === 'string' ? req.query.artist.trim() : '';
  const title = cleanTitle(rawTitle);
  const artist = cleanArtist(rawArtist);
  const hasDuration = req.query.duration !== undefined;
  const duration = hasDuration ? Number(req.query.duration) : 0;
  if (!title || !artist || title.length > 200 || artist.length > 160 ||
      (hasDuration && (!Number.isFinite(duration) || duration < 0 || duration > 36000))) {
    return res.status(400).json({ error: 'Metadatos inválidos' });
  }

  const endpoint = new URL('https://lrclib.net/api/search');
  endpoint.searchParams.set('track_name', title);
  endpoint.searchParams.set('artist_name', artist);
  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'NexusMusic Web/3 (https://nexusmusicx.vercel.app)'
      },
      signal: AbortSignal.timeout(9000)
    });
    if (!response.ok) throw new Error('LRCLIB respondió con HTTP ' + response.status);

    const data = await response.json();
    const rows = Array.isArray(data) ? data.filter(function (track) {
      return normalize(track.trackName) === normalize(title) &&
        normalize(cleanArtist(track.artistName)) === normalize(artist);
    }) : [];
    const tolerance = duration > 0 ? Math.min(15, Math.max(8, duration * 0.04)) : 0;
    const closeRows = duration > 0
      ? rows.filter(function (track) {
        return Number.isFinite(track.duration) && Math.abs(track.duration - duration) <= tolerance;
      }).sort(function (left, right) {
        return Math.abs(left.duration - duration) - Math.abs(right.duration - duration);
      })
      : rows;
    const item = closeRows.find(function (track) {
      return typeof track.syncedLyrics === 'string' && track.syncedLyrics.trim();
    }) || closeRows.find(function (track) {
      return typeof track.plainLyrics === 'string' && track.plainLyrics.trim();
    }) || rows.find(function (track) {
      return track.instrumental === true;
    }) || (duration > 0 ? rows.find(function (track) {
      return typeof track.plainLyrics === 'string' && track.plainLyrics.trim();
    }) : rows[0]);

    if (!item) return res.status(404).json({});
    const syncedLyrics = typeof item.syncedLyrics === 'string' &&
      (duration === 0 || closeRows.includes(item)) ? item.syncedLyrics : '';
    res.setHeader('Cache-Control', 'public, s-maxage=120');
    return res.status(200).json({
      instrumental: item.instrumental === true,
      plainLyrics: typeof item.plainLyrics === 'string' ? item.plainLyrics : '',
      syncedLyrics: syncedLyrics
    });
  } catch (error) {
    console.error('lyrics: LRCLIB request failed:', error.message || error);
    return res.status(502).json({ error: 'Letras temporalmente no disponibles' });
  }
};

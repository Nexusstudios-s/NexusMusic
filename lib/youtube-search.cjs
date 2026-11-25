'use strict';
// Read-only search metadata. Playback is delegated to YouTube's official IFrame.
let session;
const safeId = /^[A-Za-z0-9_-]{11}$/;
const text = value => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  if (typeof value.text === 'string') return value.text.trim();
  if (typeof value.simpleText === 'string') return value.simpleText.trim();
  if (Array.isArray(value.runs)) return value.runs.map(run => text(run?.text)).join('').trim();
  return '';
};
function normalize(row, kind) {
  if (!row || !['song','video'].includes(kind)) return null;
  const id = row.id || row.videoId || row.playlistItemData?.videoId ||
    row.navigationEndpoint?.watchEndpoint?.videoId;
  if (typeof id !== 'string' || !safeId.test(id)) return null;
  if (['album','artist','playlist','channel'].includes(String(row.item_type || '').toLowerCase())) return null;
  const rendererTitle = row.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text;
  const title = text(row.title || row.titleText || rendererTitle);
  if (!title) return null;
  const contributors = Array.isArray(row.artists) ? row.artists : Array.isArray(row.authors) ? row.authors : [];
  const artist = text(contributors.map(value => text(value?.name || value)).filter(Boolean).join(', ')) ||
    text(row.author?.name || row.ownerText || row.longBylineText || row.subtitle || row.secondaryText) ||
    (kind === 'song' ? 'YouTube Music' : 'YouTube');
  const rendererRuns = row.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text;
  const byline = artist === 'YouTube Music' || artist === 'YouTube'
    ? text(rendererRuns)
    : artist;
  const thumbnails = [
    ...(Array.isArray(row.thumbnails) ? row.thumbnails : []),
    ...(Array.isArray(row.thumbnail?.thumbnails) ? row.thumbnail.thumbnails : []),
    ...(Array.isArray(row.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails)
      ? row.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails
      : []),
  ];
  const best = thumbnails
    .filter(item => typeof item?.url === 'string' && /^https:\/\//i.test(item.url))
    .sort((a, b) => (b.width || 0) - (a.width || 0))[0];
  const durationValue = row.duration?.text || row.duration || row.lengthText;
  const seconds = Number(row.duration?.seconds);
  const duration = text(durationValue) ||
    (Number.isFinite(seconds) && seconds >= 0
      ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
      : '');
  const album = text(row.album?.name || row.album);
  return {
    id,
    provider: 'youtube',
    kind: row.item_type === 'video' ? 'video' : kind,
    title: title.slice(0, 200),
    artist: (byline || artist).slice(0, 160),
    thumbnail: best?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    duration: duration.slice(0, 20),
    url: `https://www.youtube.com/watch?v=${id}`,
    album: album.slice(0, 160),
  };
}
function extract(result, kind) {
  const rows = [];
  const seenNodes = new WeakSet();
  const seenIds = new Set();
  let visited = 0;
  function collect(value, depth) {
    if (depth > 12 || value == null || visited >= 5000) return;
    if (Array.isArray(value)) {
      value.forEach(item => collect(item, depth + 1));
      return;
    }
    if (typeof value !== 'object' || seenNodes.has(value)) return;
    seenNodes.add(value);
    visited += 1;
    const item = normalize(value, kind);
    if (item && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      rows.push(item);
    }
    Object.values(value).forEach(child => collect(child, depth + 1));
  }
  collect(result?.contents ?? result?.results ?? result?.songs ?? result?.videos ?? result, 0);
  return rows.slice(0, 40);
}
function extractHtml(html, kind) {
  if (typeof html !== 'string' || !html.includes('ytInitialData')) return [];
  const match = html.match(/(?:var\s+|window\.)?ytInitialData\s*=\s*({.+?});/s);
  if (!match) return [];
  let data;
  try { data = JSON.parse(match[1]); } catch { return []; }
  const items = [];
  const seen = new Set();
  function collect(value, depth) {
    if (depth > 9 || value == null) return;
    if (Array.isArray(value)) { value.forEach(item => collect(item, depth + 1)); return; }
    if (typeof value !== 'object') return;
    if (typeof value.videoId === 'string' && typeof value.title === 'object') {
      const title = text(value.title?.simpleText || value.title?.runs?.map(run => run.text).join('')).slice(0, 200);
      if (safeId.test(value.videoId) && title && !seen.has(value.videoId)) {
        seen.add(value.videoId);
        const owner = value.ownerText?.runs?.[0]?.text || value.longBylineText?.runs?.[0]?.text || 'YouTube';
        const thumb = value.thumbnail?.thumbnails?.slice().sort((a,b)=>(b.width||0)-(a.width||0))[0]?.url;
        items.push({
          id:value.videoId,
          provider:'youtube',
          kind,
          title,
          artist:text(owner).slice(0, 160) || 'YouTube',
          thumbnail:thumb || `https://i.ytimg.com/vi/${value.videoId}/hqdefault.jpg`,
          duration:text(value.lengthText?.simpleText || value.lengthText?.text).slice(0, 20),
          url:`https://www.youtube.com/watch?v=${value.videoId}`
        });
      }
    }
    Object.keys(value).forEach(key => collect(value[key], depth + 1));
  }
  collect(data,0);
  return items.slice(0,40);
}
async function searchHtml(q, kind) {
  const u = new URL('https://www.youtube.com/results');
  u.searchParams.set('search_query', q);
  u.searchParams.set('hl','es');
  u.searchParams.set('gl','co');
  const r = await fetch(u,{headers:{'Accept':'text/html','User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(9000)});
  if (!r.ok) throw Error('YouTube: búsqueda no disponible');
  return extractHtml(await r.text(),kind);
}
function deadline(p,ms){let timer;return Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('YouTube Music: tiempo agotado')),ms);})]).finally(()=>clearTimeout(timer));}
async function getSession() {
  if (!session) {
    const pending = import('youtubei.js').then(({Innertube})=>Innertube.create({lang:'en',location:'CO',retrieve_player:false,retrieve_innertube_config:false,fast_fail:true,fetch:(input,init={})=>fetch(input,{...init,signal:AbortSignal.any([AbortSignal.timeout(7000),...(init.signal?[init.signal]:[])])})}));
    session = pending;
    pending.catch(()=>{if(session===pending)session=undefined;});
  }
  return session;
}
async function search(q,kind='song') {
  try {
    return await deadline((async()=>{
      let items=[];
      try {
        const yt=await getSession();
        const result=kind==='video'?await yt.search(q,{type:'video'}):await yt.music.search(q,{type:kind});
        items=extract(result,kind);
      } catch {}
      if(items.length)return items;
      return searchHtml(q,kind);
    })(),13000);
  } catch(e){session=undefined;throw e;}
}
module.exports={search,normalize,extract,extractHtml,searchHtml};

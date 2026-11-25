'use strict';
// Read-only search metadata. Playback is delegated to YouTube's official IFrame.
let session;
const safeId = /^[A-Za-z0-9_-]{11}$/;
const text = (value, max) => {
  const raw = typeof value === 'string' ? value : typeof value?.text === 'string' ? value.text : '';
  return raw.trim().slice(0, max);
};
function normalize(row, kind) {
  if (!row || !['song','video'].includes(row.item_type || kind) || !safeId.test(row.id || '')) return null;
  if (kind === 'video' && typeof row.type === 'string' && !/video/i.test(row.type) && !row.item_type) return null;
  const title = text(row.title,200);
  const contributors = Array.isArray(row.artists) ? row.artists : Array.isArray(row.authors) ? row.authors : [];
  const artist = text(contributors.map(a=>text(a?.name,160)).filter(Boolean).join(', ') || row.author?.name,160);
  if (!title || !artist) return null;
  const thumbs = Array.isArray(row.thumbnails) ? row.thumbnails : [];
  const best = thumbs.filter(t=>typeof t?.url==='string' && /^https:\/\//i.test(t.url)).sort((a,b)=>(b.width||0)-(a.width||0))[0];
  const seconds = Number(row.duration?.seconds);
  const duration = text(row.duration?.text || row.duration,20) ||
    (Number.isFinite(seconds) && seconds >= 0 ? `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}` : '');
  return {id:row.id,provider:'youtube',kind:row.item_type || kind,title,artist,thumbnail:best?.url || `https://i.ytimg.com/vi/${row.id}/hqdefault.jpg`,duration,url:`https://www.youtube.com/watch?v=${row.id}`,album:text(row.album?.name,160)};
}
function extract(result, kind) {
  const rows = [];
  function collect(value, depth) {
    if (depth > 5 || value == null) return;
    if (Array.isArray(value)) {
      value.forEach(item => collect(item, depth + 1));
      return;
    }
    if (typeof value !== 'object') return;
    const children = Array.isArray(value.contents) ? value.contents
      : Array.isArray(value.items) ? value.items
        : Array.isArray(value.results) ? value.results : null;
    if (children) children.forEach(item => collect(item, depth + 1));
    else rows.push(value);
  }
  collect(result?.contents ?? result?.results ?? [], 0);
  return rows.map(r=>normalize(r,kind)).filter(Boolean).slice(0,40);
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
      const title = text(value.title?.simpleText || value.title?.runs?.map(run => run.text).join(''), 200);
      if (safeId.test(value.videoId) && title && !seen.has(value.videoId)) {
        seen.add(value.videoId);
        const owner = value.ownerText?.runs?.[0]?.text || value.longBylineText?.runs?.[0]?.text || 'YouTube';
        const thumb = value.thumbnail?.thumbnails?.slice().sort((a,b)=>(b.width||0)-(a.width||0))[0]?.url;
        items.push({
          id:value.videoId,
          provider:'youtube',
          kind,
          title,
          artist:text(owner,160) || 'YouTube',
          thumbnail:thumb || `https://i.ytimg.com/vi/${value.videoId}/hqdefault.jpg`,
          duration:text(value.lengthText?.simpleText || value.lengthText?.text,20),
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

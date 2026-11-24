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
  try {return await deadline((async()=>{const yt=await getSession();const result=kind==='video'?await yt.search(q,{type:'video'}):await yt.music.search(q,{type:kind});return extract(result,kind);})(),13000);}
  catch(e){session=undefined;throw e;}
}
module.exports={search,normalize,extract};

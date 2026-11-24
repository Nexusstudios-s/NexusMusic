'use strict';
// Read-only search metadata. Playback is delegated to YouTube's official IFrame.
let session;
const safeId = /^[A-Za-z0-9_-]{11}$/;
const text = (v, max) => typeof v === 'string' ? v.trim().slice(0,max) : '';
function normalize(row, kind) {
  if (!row || !['song','video'].includes(row.item_type || kind) || !safeId.test(row.id || '')) return null;
  const title = text(row.title,200);
  const artist = text((row.artists || row.authors || []).map(a=>a?.name).filter(Boolean).join(', ') || row.author?.name,160);
  if (!title || !artist) return null;
  const thumbs = Array.isArray(row.thumbnails) ? row.thumbnails : [];
  const best = thumbs.filter(t=>typeof t?.url==='string' && /^https:\/\//i.test(t.url)).sort((a,b)=>(b.width||0)-(a.width||0))[0];
  const duration = text(row.duration?.text,20);
  return {id:row.id,provider:'youtube',kind:row.item_type || kind,title,artist,thumbnail:best?.url || `https://i.ytimg.com/vi/${row.id}/hqdefault.jpg`,duration,url:`https://www.youtube.com/watch?v=${row.id}`,album:text(row.album?.name,160)};
}
function extract(result, kind) {
  const shelves = Array.isArray(result?.contents) ? result.contents : [];
  const rows = shelves.flatMap(s => Array.isArray(s?.contents) ? s.contents : []);
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
  try {return await deadline((async()=>{const yt=await getSession();return extract(await yt.music.search(q,{type:kind}),kind);})(),13000);}
  catch(e){session=undefined;throw e;}
}
module.exports={search,normalize,extract};

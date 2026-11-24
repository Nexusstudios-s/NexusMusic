const cache = new Map();
const decode = s => String(s || '').replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (m,k) => { const named={amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'}; if(k in named)return named[k]; const n=k[1]?.toLowerCase()==='x'?parseInt(k.slice(2),16):Number(k.slice(1)); return n>=0&&n<=0x10ffff?String.fromCodePoint(n):m; });
function duration(s) { const m=/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(s||''); if(!m)return ''; const h=Number(m[1]||0), min=Number(m[2]||0), sec=Number(m[3]||0); return h?`${h}:${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${min}:${String(sec).padStart(2,'0')}`; }
async function youtube(path, params, key) {
  const url=new URL('https://www.googleapis.com/youtube/v3/'+path);
  url.search=new URLSearchParams({...params,key});
  const r=await fetch(url,{signal:AbortSignal.timeout(8000)});
  const data=await r.json();
  if(!r.ok){ const reason=data.error?.errors?.[0]?.reason; const e=new Error(['quotaExceeded','dailyLimitExceeded','rateLimitExceeded'].includes(reason)?'Se agotó la cuota de búsqueda de YouTube. Intenta más tarde.':r.status===403||r.status===400?'YouTube rechazó la solicitud. Revisa la API key y que YouTube Data API v3 esté habilitada.':'YouTube no está disponible temporalmente.'); e.status=reason==='quotaExceeded'||reason==='dailyLimitExceeded'||reason==='rateLimitExceeded'?429:502; throw e; }
  return data;
}
module.exports=async function(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Método no permitido.'});}
  const q=typeof req.query.q==='string'?req.query.q.trim().replace(/\s+/g,' '):'';
  if(q.length<2||q.length>100)return res.status(400).json({error:'Escribe entre 2 y 100 caracteres.'});
  const key=process.env.YOUTUBE_API_KEY;
  if(!key)return res.status(503).json({error:'Falta configurar YOUTUBE_API_KEY en Vercel.'});
  const region=/^[A-Z]{2}$/.test(process.env.YOUTUBE_REGION||'')?process.env.YOUTUBE_REGION:'CO';
  const ck=region+':'+q.toLowerCase(); const hit=cache.get(ck);
  if(hit&&hit.expires>Date.now())return res.status(200).json(hit.body);
  try {
    const search=await youtube('search',{part:'snippet',q,type:'video',videoCategoryId:'10',videoEmbeddable:'true',videoSyndicated:'true',maxResults:'20',regionCode:region},key);
    const ids=(search.items||[]).map(x=>x.id?.videoId).filter(x=>/^[A-Za-z0-9_-]{11}$/.test(x||''));
    const details=ids.length?await youtube('videos',{part:'snippet,contentDetails,status',id:ids.join(',')},key):{items:[]};
    const byId=new Map((details.items||[]).map(v=>[v.id,v]));
    const items=ids.map(id=>byId.get(id)).filter(v=>v&&v.status?.embeddable&&v.snippet?.liveBroadcastContent==='none').map(v=>({id:v.id,title:decode(v.snippet.title),artist:decode(v.snippet.channelTitle),thumbnail:v.snippet.thumbnails?.high?.url||v.snippet.thumbnails?.medium?.url||'',duration:duration(v.contentDetails?.duration)}));
    const body={items,provider:'YouTube'};
    if(cache.size>=200)cache.delete(cache.keys().next().value);
    cache.set(ck,{body,expires:Date.now()+600000});
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=600');
    return res.status(200).json(body);
  }catch(e){return res.status(e.status||502).json({error:e.status?e.message:'No se pudo conectar con YouTube. Intenta nuevamente.'});}
};

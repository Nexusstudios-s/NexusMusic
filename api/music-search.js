'use strict';
// Public, read-only music catalog. No tokens or audio proxy.
const ROOT = 'https://api.audius.co/v1/';
const ID = /^[A-Za-z0-9_-]{1,80}$/;
const cache = new Map();
function https(value) { try { const u=new URL(value); return u.protocol==='https:' ? u.href : ''; } catch { return ''; } }
function duration(n) { return Number.isFinite(n)&&n>=0 ? `${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}` : ''; }
function normalize(t) {
  if (!t || typeof t.id!=='string'||!ID.test(t.id)||typeof t.title!=='string'||!t.title.trim() || t.is_streamable!==true || t.is_stream_gated===true || t.is_unlisted===true || t.is_delete===true || t.is_available===false || t.is_scheduled_release===true) return null;
  const path=typeof t.permalink==='string'&&/^\/[\w.-]+\/[\w./-]+$/.test(t.permalink)?t.permalink:'';
  return {id:'au:'+t.id,provider:'audius',title:t.title.slice(0,200),artist:String(t.user?.name||t.user?.handle||'Audius').slice(0,160),thumbnail:https(t.artwork?.['480x480']||t.artwork?.['150x150']||t.artwork?.['1000x1000']),duration:duration(t.duration),url:'https://audius.co'+path};
}
async function json(url) {const r=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(9000)});if(!r.ok){const e=new Error('Servicio temporalmente no disponible');e.status=r.status;throw e;}return r.json();}
module.exports=async function(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Método no permitido'});}
  const v=typeof req.query.v==='string'?req.query.v:'';
  if(v){if(!/^[\w-]{11}$/.test(v))return res.status(400).json({error:'ID no válido'});try {const u=new URL('https://www.youtube.com/oembed');u.searchParams.set('url','https://www.youtube.com/watch?v='+v);u.searchParams.set('format','json');const d=await json(u);return res.status(200).json({title:String(d.title||'').slice(0,200),artist:String(d.author_name||'').slice(0,160)});}catch{return res.status(404).json({error:'Metadatos no disponibles'});}}
  const q=typeof req.query.q==='string'?req.query.q.trim().replace(/\s+/g,' '):'';
  if(q.length<2||q.length>100)return res.status(400).json({error:'Escribe entre 2 y 100 caracteres.'});
  const key=q.toLowerCase();const hit=cache.get(key);if(hit&&hit.expires>Date.now())return res.status(200).json(hit.payload);
  try {
    const u=new URL('tracks/search',ROOT);u.searchParams.set('query',q);u.searchParams.set('app_name','NexusMusic');u.searchParams.set('limit','36');
    const data=await json(u);if(!Array.isArray(data.data))throw new Error('Formato inesperado');
    const seen=new Set();const items=data.data.map(normalize).filter(t=>t&&!seen.has(t.id)&&seen.add(t.id)).slice(0,24);
    const payload={items,provider:'audius'};if(cache.size>=120)cache.delete(cache.keys().next().value);cache.set(key,{expires:Date.now()+120000,payload});res.setHeader('Cache-Control','public, s-maxage=60, stale-while-revalidate=120');return res.status(200).json(payload);
  } catch(e){return res.status(e.status===429?429:502).json({error:e.status===429?'Audius limitó temporalmente las búsquedas. Intenta más tarde.':'No pudimos conectar con Audius. Intenta más tarde o pega un enlace musical compatible.'});}
};

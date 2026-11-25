'use strict';
// Public, read-only music catalog. No tokens or audio proxy.
const ROOT = 'https://api.audius.co/v1/';
const ID = /^[A-Za-z0-9_-]{1,80}$/;
const cache = new Map();
const yt = require('../lib/youtube-search.cjs');
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
  const source=typeof req.query.source==='string'?req.query.source:'all';
  if(!['all','youtube','videos','audius','catalog'].includes(source))return res.status(400).json({error:'Fuente no válida'});
  const key=source+'|'+q.toLowerCase();const hit=cache.get(key);if(hit&&hit.expires>Date.now())return res.status(200).json(hit.payload);
  const audius=async()=>{const u=new URL('tracks/search',ROOT);u.searchParams.set('query',q);u.searchParams.set('app_name','NexusMusic');u.searchParams.set('limit','36');const data=await json(u);if(!Array.isArray(data.data))throw Error('Formato inesperado');return data.data.map(normalize).filter(Boolean);};
  const commercial=async()=>{const u=new URL('https://itunes.apple.com/search');u.searchParams.set('term',q);u.searchParams.set('media','music');u.searchParams.set('entity','song');u.searchParams.set('country','CO');u.searchParams.set('limit','30');const data=await json(u);if(!Array.isArray(data.results))throw Error('Formato inesperado');return data.results.filter(t=>t.kind==='song'&&Number.isSafeInteger(t.trackId)&&t.trackName&&t.artistName&&/^https:\/\/(music|itunes)\.apple\.com\//i.test(t.trackViewUrl||'')).map(t=>({id:'cat:'+t.trackId,provider:'catalog',title:String(t.trackName).slice(0,200),artist:String(t.artistName).slice(0,160),duration:duration(t.trackTimeMillis/1000),thumbnail:https(t.artworkUrl100||''),url:t.trackViewUrl}));};
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const query=norm(q);const tokens=query.split(' ').filter(Boolean);
  const score=t=>{const name=norm(t.title),artist=norm(t.artist),combined=name+' '+artist;const words=new Set(combined.split(' '));const coverage=tokens.filter(x=>words.has(x)).length/Math.max(tokens.length,1);return (name===query?100:0)+(artist===query?85:0)+(combined===query||artist+' '+name===query?120:0)+(combined.includes(query)?35:0)+coverage*60+(t.provider==='youtube'?18:t.provider==='audius'?5:0);};
  const jobs=source==='all'?[['youtube',()=>yt.search(q,'song')],['audius',audius],['catalog',commercial]]:source==='youtube'?[['youtube',()=>yt.search(q,'song')]]:source==='videos'?[['videos',()=>yt.search(q,'video')]]:source==='audius'?[['audius',audius]]:[['catalog',commercial]];
  const sources=await Promise.allSettled(jobs.map(([,run])=>Promise.resolve().then(run)));
  const providers=Object.fromEntries(sources.map((r,i)=>[jobs[i][0],r.status==='fulfilled'?'ok':'unavailable']));
  sources.forEach((r,i)=>{if(r.status==='rejected')console.warn('music-search:',jobs[i][0],String(r.reason?.message||'error').slice(0,180));});
  if(sources.every(r=>r.status==='rejected'))return res.status(502).json({error:'La fuente seleccionada no respondió. Prueba otra fuente o pega un enlace compatible.',providers});
  const seen=new Set();const items=sources.flatMap(r=>r.status==='fulfilled'?r.value:[]).filter(t=>{const k=t.provider+'|'+t.id;if(seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>score(b)-score(a)).slice(0,48);
  const payload={items,provider:source,providers,partial:sources.some(r=>r.status==='rejected')};
  if(!payload.partial&&payload.items.length){if(cache.size>=120)cache.delete(cache.keys().next().value);cache.set(key,{expires:Date.now()+60000,payload});res.setHeader('Cache-Control','public, s-maxage=45, stale-while-revalidate=60');}else res.setHeader('Cache-Control','no-store');
  return res.status(200).json(payload);
};

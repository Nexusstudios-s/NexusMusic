'use strict';
// Public, read-only music catalog. No tokens or audio proxy.
const ROOT = 'https://api.audius.co/v1/';
const ID = /^[A-Za-z0-9_-]{1,80}$/;
const YOUTUBE_KEY = 'AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30';
const cache = new Map();
function https(value) { try { const u=new URL(value); return u.protocol==='https:' ? u.href : ''; } catch { return ''; } }
function duration(n) { return Number.isFinite(n)&&n>=0 ? `${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}` : ''; }
function textRuns(runs) { return Array.isArray(runs) ? runs.map(run => String(run.text || '')).join('').trim() : ''; }
function firstText(renderer) {
  if (!renderer) return '';
  return textRuns(renderer.runs) ||
    textRuns(renderer.title?.runs) ||
    textRuns(renderer.text?.runs) ||
    String(renderer.simpleText || renderer.text || '').trim();
}
function normalizeYouTube(renderer) {
  if (!renderer || typeof renderer !== 'object') return null;
  const endpoint = renderer.navigationEndpoint || renderer.overlay?.addToPlaylistButton?.navigationEndpoint;
  const videoId = endpoint?.watchEndpoint?.videoId ||
    renderer.videoId ||
    renderer.playlistId ||
    '';
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;
  const title = firstText(renderer.title);
  if (!title) return null;
  let artist = '';
  if (Array.isArray(renderer.flexColumns)) {
    for (const column of renderer.flexColumns) {
      const text = firstText(column?.musicResponsiveListItemFlexColumnRenderer?.text);
      if (text && !artist) artist = text;
    }
  }
  if (!artist) artist = firstText(renderer.longBylineText) || firstText(renderer.shortBylineText) || 'YouTube';
  const length = renderer.lengthText?.simpleText ||
    renderer.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.simpleText ||
    '';
  const thumbnails = renderer.thumbnail?.thumbnails || renderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails;
  const thumbnail = Array.isArray(thumbnails) && thumbnails.length
    ? https(thumbnails.at(-1)?.url || '')
    : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return {
    id: videoId,
    provider: 'youtube',
    title: title.slice(0, 200),
    artist: artist.slice(0, 160),
    duration: String(length).slice(0, 12),
    thumbnail,
    url: `https://www.youtube.com/watch?v=${videoId}`
  };
}
function collectYouTube(value, found, seen) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach(item => collectYouTube(item, found, seen));
    return;
  }
  const renderer = value.musicResponsiveListItemRenderer ||
    value.videoRenderer ||
    value.playlistVideoRenderer;
  if (renderer) {
    const track = normalizeYouTube(renderer);
    if (track && !seen.has(track.id)) {
      seen.add(track.id);
      found.push(track);
    }
  }
  Object.values(value).forEach(item => collectYouTube(item, found, seen));
}
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
  const audius=async()=>{const u=new URL('tracks/search',ROOT);u.searchParams.set('query',q);u.searchParams.set('app_name','NexusMusic');u.searchParams.set('limit','36');const data=await json(u);if(!Array.isArray(data.data))throw Error('Formato inesperado');return data.data.map(normalize).filter(Boolean);};
  const youtube=async()=>{const u=new URL('https://music.youtube.com/youtubei/v1/search');u.searchParams.set('key',YOUTUBE_KEY);u.searchParams.set('prettyPrint','false');const r=await fetch(u,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json','Origin':'https://music.youtube.com','Referer':'https://music.youtube.com/','User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/74.0.3729.157 Safari/537.36'},body:JSON.stringify({context:{client:{clientName:'WEB_REMIX',clientVersion:'1.20220606.03.00',hl:'es',gl:'CO'}},query:q}),signal:AbortSignal.timeout(9000)});if(!r.ok){const e=new Error('YouTube Music no respondió');e.status=r.status;throw e;}const data=await r.json();const found=[];collectYouTube(data,found,new Set());return found.slice(0,24);};
  const commercial=async()=>{const u=new URL('https://itunes.apple.com/search');u.searchParams.set('term',q);u.searchParams.set('media','music');u.searchParams.set('entity','song');u.searchParams.set('country','CO');u.searchParams.set('limit','30');const data=await json(u);if(!Array.isArray(data.results))throw Error('Formato inesperado');return data.results.filter(t=>t.kind==='song'&&Number.isSafeInteger(t.trackId)&&t.trackName&&t.artistName&&/^https:\/\/(music|itunes)\.apple\.com\//i.test(t.trackViewUrl||'')).map(t=>({id:'cat:'+t.trackId,provider:'catalog',title:String(t.trackName).slice(0,200),artist:String(t.artistName).slice(0,160),duration:duration(t.trackTimeMillis/1000),thumbnail:https(t.artworkUrl100||''),url:t.trackViewUrl}));};
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const score=t=>{const name=norm(t.title),artist=norm(t.artist),query=norm(q),combined=name+' '+artist;const tokens=query.split(' ').filter(Boolean);return (name===query?100:0)+(artist===query?80:0)+(combined===query||artist+' '+name===query?110:0)+(combined.includes(query)?35:0)+tokens.filter(x=>combined.includes(x)).length/Math.max(tokens.length,1)*30+(t.provider==='youtube'?8:0)+(t.provider==='audius'?3:0);};
  const sources=await Promise.allSettled([youtube(),audius(),commercial()]);if(sources.every(r=>r.status==='rejected'))return res.status(502).json({error:'Los catálogos no respondieron. Puedes pegar un enlace de YouTube o Discord.'});
  const seen=new Set();const items=sources.flatMap(r=>r.status==='fulfilled'?r.value:[]).filter(t=>{const k=t.provider+'|'+norm(t.title)+'|'+norm(t.artist);if(seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>score(b)-score(a)).slice(0,36);
  const payload={items,provider:'multi',partial:sources.some(r=>r.status==='rejected')};if(cache.size>=120)cache.delete(cache.keys().next().value);cache.set(key,{expires:Date.now()+60000,payload});res.setHeader('Cache-Control','public, s-maxage=45, stale-while-revalidate=60');return res.status(200).json(payload);
};

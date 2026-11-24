'use strict';
const http=require('node:http');
const RPC=require('discord-rpc');
const APP_ID='1574721846249525328', SITE='https://nexusmusicx.vercel.app', VISIT=SITE+'/listen?web=1';
const PORT=17845, HOST='127.0.0.1';
let rpc=null,ready=false,connecting=false,retry=null,closing=false,active=false,owner='',lastSeen=0,last=0,lastKey='',work=Promise.resolve();
function connect(){if(closing||connecting||ready)return;connecting=true;const client=new RPC.Client({transport:'ipc'});rpc=client;
 const lost=()=>{if(rpc!==client)return;rpc=null;ready=false;connecting=false;active=false;owner='';lastKey='';Promise.resolve().then(()=>client.destroy()).catch(()=>{});if(!closing){clearTimeout(retry);retry=setTimeout(connect,5000);}};
 client.on('ready',()=>{if(rpc!==client)return;ready=true;connecting=false;console.log('Discord conectado · listo para NexusMusic (sin código).');});
 client.on('disconnected',lost);client.on('error',lost);
 client.login({clientId:APP_ID}).catch(lost);
}
function safeUrl(value){try{const u=new URL(value);return u.origin===SITE&&u.pathname==='/listen'&&u.href.length<=512&&!u.searchParams.has('audio')&&!u.searchParams.has('url')?u.href:VISIT;}catch{return VISIT;}}
function safeCover(value){try{const u=new URL(value);const host=u.hostname.toLowerCase();const trustedHost=/^(i\.ytimg\.com|yt3\.ggpht\.com|lh[0-9]+\.googleusercontent\.com|is[0-9]+-ssl\.mzstatic\.com)$/.test(host)||host==='audius.co'||host.endsWith('.audius.co');return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&trustedHost&&u.href.length<=512?u.href:'';}catch{return '';}}
async function clear(tab){if(tab&&owner!==tab)return;if(active&&ready&&rpc)await rpc.clearActivity();active=false;owner='';lastKey='';}
async function apply(d){if(!ready||!rpc)return [503,{error:'Discord de escritorio no está conectado'}];if(typeof d.tab!=='string'||!/^[\w-]{8,100}$/.test(d.tab))return [400,{error:'Sesión inválida'}];if(d.clear===true){await clear(d.tab);return [200,{ok:true}];}
 if(typeof d.title!=='string'||typeof d.artist!=='string'||!d.title.trim())return [400,{error:'Datos de canción inválidos'}];
 const now=Date.now(),key=d.title+'|'+d.artist+'|'+safeUrl(d.url);lastSeen=now;
 if(active&&owner===d.tab&&key===lastKey&&now-last<20000)return [200,{ok:true}];
 const pos=Math.max(0,Number(d.position)||0),dur=Math.max(0,Number(d.duration)||0);
 const cover=safeCover(d.artwork);
 const activity={type:2,details:d.title.trim().slice(0,128),state:(d.artist.trim()||'NexusMusic Web').slice(0,128),instance:false,assets:{large_image:cover||SITE+'/assets/Nexus-logo.png',large_text:d.title.trim().slice(0,128)},buttons:[{label:'Visitar NexusMusic',url:VISIT},{label:'Escuchar en NexusMusic',url:safeUrl(d.url)}]};
 if(dur>pos&&dur<36000)activity.timestamps={start:Math.floor((now-pos*1000)/1000),end:Math.floor((now+(dur-pos)*1000)/1000)};
 try{await rpc.request('SET_ACTIVITY',{pid:process.pid,activity});}catch(e){if(!ready)throw e;delete activity.assets;await rpc.request('SET_ACTIVITY',{pid:process.pid,activity});}
 owner=d.tab;last=now;lastKey=key;active=true;return [200,{ok:true}];
}
const server=http.createServer((req,res)=>{
 const reply=(status,data)=>{if(!res.destroyed&&!res.writableEnded){res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));}};
 // Loopback only, exact origin and Host, no generic RPC proxy, no shared secret in public JS.
 if(req.headers.host!==HOST+':'+PORT||req.headers.origin!==SITE)return reply(403,{error:'Origen no autorizado'});
 res.setHeader('Access-Control-Allow-Origin',SITE);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Nexus-Client');res.setHeader('Access-Control-Allow-Private-Network','true');res.setHeader('Cache-Control','no-store');
 if(req.url!=='/presence')return reply(404,{});if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
 if(req.method!=='POST'||req.headers['x-nexus-client']!=='web-v2'||!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))return reply(403,{error:'Cliente no autorizado; actualiza el asistente'});
 let body='',size=0;req.on('data',c=>{size+=c.length;if(size>5000){req.destroy();return;}body+=c;});req.on('end',()=>{let d;try{d=JSON.parse(body);if(!d||typeof d!=='object'||Array.isArray(d))throw Error();}catch{return reply(400,{error:'JSON inválido'});}work=work.then(async()=>{try{const [status,data]=await apply(d);reply(status,data);}catch{reply(502,{error:'Discord no aceptó la presencia'});}}).catch(()=>{});});
});
server.on('error',e=>{console.error('No se pudo iniciar el asistente:',e.message);process.exit(1);});
server.listen(PORT,HOST,()=>{console.log('NexusMusic · asistente local activo. Abre '+VISIT+' y pulsa Activar presencia.');connect();});
const expiry=setInterval(()=>{if(active&&Date.now()-lastSeen>45000)work=work.then(()=>clear()).catch(()=>{});},5000);
async function shutdown(){if(closing)return;closing=true;clearTimeout(retry);clearInterval(expiry);try{await clear();}catch{}process.exit(0);}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);

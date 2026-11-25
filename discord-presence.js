(()=>{
'use strict';
const $=id=>document.getElementById(id),dialog=$('discord-dialog');if(!dialog)return;
const KEY='nexus.discord.enabled.v2', endpoint='http://127.0.0.1:17845/presence';
const tab=globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now();
let enabled=false,busy=false,timer=null,epoch=0,lastState='off';
try{enabled=localStorage.getItem(KEY)==='1';}catch{}
function paint(state,message){lastState=state;$('discord-settings').dataset.state=state;$('discord-settings').setAttribute('aria-label','Discord: '+message);$('discord-status').textContent=message;$('discord-connect').disabled=enabled;$('discord-disconnect').disabled=!enabled;$('discord-connect').textContent=enabled?'Activación guardada':'Activar presencia';}
function remember(value){enabled=value;try{localStorage.setItem(KEY,value?'1':'0');}catch{}}
async function send(payload,keepalive=false){
 const controller=new AbortController();
 const timer=keepalive?null:setTimeout(()=>controller.abort(),4500);
 try{
  const r=await fetch(endpoint,{
   method:'POST',
   headers:{'Content-Type':'application/json','X-Nexus-Client':'web-v2'},
   body:JSON.stringify({...payload,tab}),
   signal:keepalive?undefined:controller.signal,
   keepalive,
   mode:'cors',
   credentials:'omit',
   cache:'no-store'
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok||!data.ok)throw Error(data.error||'Asistente incompatible o no disponible');
  return data;
 }finally{
  if(timer)clearTimeout(timer);
 }
}
async function update(){if(!enabled||busy)return;const generation=epoch;busy=true;try{const snap=window.NexusPlayback?.snapshot();await send(snap||{clear:true});if(enabled&&generation===epoch)paint('on',snap?'Conectado · '+snap.title:'Conectado · esperando música');}catch(e){if(enabled&&generation===epoch)paint('waiting','Esperando asistente local. Abre Discord y el asistente actualizado; permite acceso local si se solicita.');}finally{busy=false;if(generation!==epoch){if(enabled)void update();else void send({clear:true}).catch(()=>{});}}}
function start(){clearInterval(timer);paint('waiting','Buscando el asistente local…');void update();timer=setInterval(update,10000);}
function stop(){epoch++;clearInterval(timer);paint('off','Desactivado · no se comparte tu actividad');void send({clear:true}).catch(()=>{});}
$('discord-settings').onclick=()=>{dialog.showModal();if(enabled)void update();};
$('discord-connect').onclick=()=>{epoch++;remember(true);start();};
$('discord-disconnect').onclick=()=>{remember(false);stop();};
window.addEventListener('storage',e=>{if(e.key!==KEY)return;epoch++;enabled=e.newValue==='1';if(enabled)start();else stop();});
window.addEventListener('online',()=>{if(enabled)void update();});
window.addEventListener('pageshow',()=>{if(enabled)start();});
window.addEventListener('pagehide',()=>{clearInterval(timer);if(enabled&&lastState==='on')void send({clear:true},true).catch(()=>{});});
if(enabled)start();else paint('off','Desactivado · activa una sola vez');
})();

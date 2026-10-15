/* Velora offline shell. v12: modular build — precaches css/ and every js/ module. */
const C='velora-v12';
const A=['./','./index.html','./css/app.css','./manifest.webmanifest','./icon-192.png','./icon-512.png','./js/config.js','./js/core/state.js','./js/core/utils.js','./js/nlp/language.js','./js/ui/chat.js','./js/intents/intents.js','./js/services/notify.js','./js/services/automations.js','./js/features/session.js','./js/features/edit.js','./js/features/focus.js','./js/features/media.js','./js/features/backup.js','./js/voice/voice.js','./js/ui/render.js','./js/ui/connection.js','./js/vault/vault.js','./js/boot.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{if('navigationPreload' in self.registration){try{await self.registration.navigationPreload.enable()}catch(e){}}const k=await caches.keys();await Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)));await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 if(r.mode==='navigate'){
  e.respondWith((async()=>{
   try{
    const pre=await e.preloadResponse;
    if(pre)return pre;
    const net=await fetch(r);
    if(net&&net.ok){const cp=net.clone();caches.open(C).then(c=>c.put('./index.html',cp))}
    return net;
   }catch(err){
    const hit=await caches.match('./index.html',{ignoreSearch:true});
    return hit||caches.match('./',{ignoreSearch:true});
   }
  })());
  return;
 }
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
  const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
  return hit||net;
 }));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():self.clients.openWindow('./index.html')))});
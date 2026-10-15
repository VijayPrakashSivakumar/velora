e/* Velora offline shell. v9 ships the premium UI polish. */
const C='velora-v9';
const A=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
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
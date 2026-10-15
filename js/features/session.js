/* Velora · features/session — install UX, service-worker registration, catch-up, share-in, quick-add, week view. */

/* ---------- Edit, focus timer, photos, backup, week view ---------- */
const pad=n=>String(n).padStart(2,'0');
const dstr=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
let focusLog=load('vl.focus.v1',[]),editId=null,fx=null;
const focusMin=since=>focusLog.filter(f=>f.t>=+new Date(since)).reduce((a,f)=>a+f.m,0);
if(set.theme)document.documentElement.dataset.theme=set.theme;
let deferredInstall=null;
function installUI(){
 try{
  if(NATIVE)return;
  if(matchMedia('(display-mode: standalone)').matches||navigator.standalone)return;
  if(localStorage.getItem('vl.install.hide'))return;
  if(deferredInstall){$('install').hidden=false}
 }catch(e){}
}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;installUI()});
$('installBtn').onclick=async()=>{
 if(!deferredInstall){try{localStorage.setItem('vl.install.hide','1')}catch(e){}$('install').hidden=true;toast('Use the browser menu > Install app (or Add to Home screen).');return}
 deferredInstall.prompt();
 try{await deferredInstall.userChoice}catch(e){}
 try{localStorage.setItem('vl.install.hide','1')}catch(e){}
 deferredInstall=null;$('install').hidden=true;
};
if('serviceWorker' in navigator&&location.protocol==='https:'&&!NATIVE){try{navigator.serviceWorker.register('sw.js').then(r=>{try{r.update()}catch(e){}if(r)r.onupdatefound=()=>{const n=r.installing;if(n)n.onstatechange=()=>{if(n.state==='installed'&&navigator.serviceWorker.controller)toast('Velora updated. Reload to use the new version.')}}}).catch(()=>{})}catch(e){}}
addEventListener('appinstalled',()=>{try{localStorage.setItem('vl.install.hide','1')}catch(e){}const b=$('install');if(b)b.hidden=true;toast('Velora installed. Find it on your home screen.')});
installUI();
function webNotify(title,body){
 try{
  const r=navigator.serviceWorker&&navigator.serviceWorker.getRegistration?navigator.serviceWorker.getRegistration():Promise.resolve(null);
  r.then(g=>{if(g)g.showNotification(title,{body,icon:'icon-192.png',vibrate:[120,60,120]});else new Notification(title,{body})}).catch(()=>{});
 }catch(e){}
}
function catchUp(){
 if(NATIVE)return;
 const seen=+localStorage.getItem('vl.seen')||0,now=Date.now();
 const m=seen?items.filter(i=>!i.done&&i.due&&!i.allDay&&new Date(i.due)>seen&&new Date(i.due)<=now):[];
 if(m.length)toast('While you were away: '+m.slice(0,2).map(i=>i.text).join(', ')+(m.length>2?' +'+(m.length-2)+' more':''));
 try{localStorage.setItem('vl.seen',String(now))}catch(e){}
}
function shareIn(){
 const q=new URLSearchParams(location.search),s=[q.get('title'),q.get('text'),q.get('url')].filter(Boolean).join(' ').trim();
 const act=q.get('a');
 if(act){try{history.replaceState(null,'',location.pathname)}catch(e){}
  if(act==='add'||act==='quickadd')openQuickAdd();
  else if(act==='week'){view='week';setTabs();render()}
  else if(act==='focus'){const t=open().sort(rank)[0];if(t)startFocus(t.id);else toast('No open task to focus on')}}
 if(q.get('voice')||s){try{history.replaceState(null,'',location.pathname)}catch(e){}openAI();if(s)setTimeout(()=>handle(s),250)}
}
/* Widget + shortcut quick-add: focus the dock input so one tap starts typing. */
function openQuickAdd(){try{$('in').focus({preventScroll:false})}catch(e){try{$('in').focus()}catch(e2){}}$('in').scrollIntoView({block:'center',behavior:'smooth'});toast('Type it — Enter saves instantly.')}
/* Mirror shareIn for NATIVE quick-add intents delivered after first render. */
addEventListener('velora-quickadd',openQuickAdd);
function weekHTML(){
 const t0=dayStart(new Date()).getTime(),o=open().sort(rank);let h='';
 for(let k=0;k<7;k++){
  const a=t0+k*864e5,b=a+864e5,d=new Date(a);
  const r=o.filter(i=>i.due&&(k===0?new Date(i.due)<b:new Date(i.due)>=a&&new Date(i.due)<b));
  h+=`<div class="dh">${k===0?'Today & overdue':k===1?'Tomorrow':d.toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'})}</div>`+(r.length?r.map(row).join(''):'<div class="empty" style="padding:6px 14px 10px">Free</div>');
 }
 const nd=o.filter(i=>!i.due);
 return h+(nd.length?'<div class="dh">No date</div>'+nd.map(row).join(''):'');
}

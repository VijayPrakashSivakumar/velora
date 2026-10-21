/* Velora · boot.js — final startup: first paint of the app (runs after every module has loaded). */
(function(){
  window.addEventListener('error',e=>console.error('global error:',e.message,e.filename+':'+e.lineno));
  window.addEventListener('unhandledrejection',e=>console.error('unhandled rejection:',e.reason));
  const safe=(fn,name)=>{try{fn()}catch(e){console.error('boot:',name,e)}};
  safe(net,'net');safe(speed,'speed');safe(render,'render');
  try{Notify.init()}catch(e){console.error('boot:Notify',e)}
  safe(renderAuto,'renderAuto');safe(runDue,'runDue');safe(catchUp,'catchUp');safe(shareIn,'shareIn');safe(hideSplash,'hideSplash');
  try{setInterval(runDue,3e4)}catch(e){}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){try{localStorage.setItem('vl.seen',String(Date.now()))}catch(e){}}else{try{catchUp();runDue()}catch(e){console.error('boot:visibility',e)}}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();const i=document.getElementById('in');if(i){i.focus();i.select()}}});
})();

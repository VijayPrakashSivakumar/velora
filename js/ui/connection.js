/* Velora · ui/connection — online/speed indicators, listeners, branded splash fade. */

/* ---------- Connection ---------- */
const cn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
function net(){const on=navigator.onLine;$('sync').classList.toggle('off',!on);$('synct').textContent=on?'Online · saved on device':'Offline · saved on device'}
function speed(){
 if(!navigator.onLine){$('speed').textContent='No connection';return}
 if(cn&&cn.downlink)$('speed').textContent='≈ '+cn.downlink+' Mbps · '+(cn.effectiveType||'').toUpperCase()+' · '+cn.rtt+' ms';
 else $('speed').textContent='Tap to test speed';
}
$('speed').onclick=async()=>{
 if(!navigator.onLine)return;$('speed').textContent='Testing…';
 try{const t=performance.now(),r=await fetch(location.href.split('#')[0]+(location.search?'&':'?')+'t='+Date.now(),{cache:'no-store'}),b=await r.blob(),s=(performance.now()-t)/1000;
  $('speed').textContent='Test: ≈ '+Math.max(0.1,b.size*8/s/1e6).toFixed(1)+' Mbps (rough)';setTimeout(speed,6000)}
 catch(e){$('speed').textContent='Test failed. Tap to retry'}
};
const netAll=()=>{net();speed()};
addEventListener('online',netAll);addEventListener('offline',netAll);if(cn&&cn.addEventListener)cn.addEventListener('change',speed);
/* Branded splash: show at least ~900ms so the logo reads, then fade. */
function hideSplash(){const done=()=>{try{document.documentElement.classList.add('velora-ready')}catch(e){}const s=$('splash');if(!s)return;s.classList.add('hide');setTimeout(()=>{try{s.remove()}catch(e){}},600)};
 try{const t0=+sessionStorage.getItem('vl.splash.t0')||Date.now();const wait=Math.max(0,900-(Date.now()-t0));setTimeout(done,wait)}catch(e){setTimeout(done,900)}}

/* Velora · features/focus — focus timer. */

/* focus timer */
const curLeft=()=>fx.run?Math.max(0,Math.round((fx.end-Date.now())/1000)):fx.left;
function drawFocus(){
 const l=curLeft();$('fc').textContent=pad(Math.floor(l/60))+':'+pad(l%60);
 $('fgo').textContent=fx.run?'Pause':fx.left<fx.total?'Resume':'Start';
 document.querySelectorAll('[data-len]').forEach(b=>b.classList.toggle('go',+b.dataset.len*60===fx.total));
}
function startFocus(id){
 if(fx&&fx.run){toast('A focus session is already running');$('fs').classList.add('show');return}
 const i=items.find(x=>x.id===id);if(!i)return;
 fx={id,total:1500,left:1500,run:false,end:0,t:null,wl:null};$('fn').textContent=i.text;$('fs').classList.add('show');drawFocus();
}
function finishFocus(full){
 if(!fx)return;clearInterval(fx.t);if(fx.wl){try{fx.wl.release()}catch(e){}}
 const left=full?0:curLeft(),m=Math.round((fx.total-left)/60),i=items.find(x=>x.id===fx.id);
 if(m>=1&&i){i.spent=(i.spent||0)+m;focusLog.push({t:Date.now(),id:i.id,m});try{localStorage.setItem('vl.focus.v1',JSON.stringify(focusLog.slice(-500)))}catch(e){}persist();render()}
 $('fs').classList.remove('show');
 if(full){notifyNow('Focus complete',(i?i.text:'Session')+' · '+m+' min');try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}
 else if(m>=1)toast('Saved '+m+' min of focus');
 fx=null;
}
$('fgo').onclick=()=>{
 if(!fx)return;
 if(fx.run){fx.left=curLeft();fx.run=false;clearInterval(fx.t);if(fx.wl){try{fx.wl.release()}catch(e){}}}
 else{fx.run=true;fx.end=Date.now()+fx.left*1000;fx.t=setInterval(()=>{if(curLeft()<=0)finishFocus(true);else drawFocus()},500);
  try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(w=>{if(fx)fx.wl=w}).catch(()=>{})}catch(e){}}
 drawFocus();
};
$('fstop').onclick=()=>{if(fx)finishFocus(false);else $('fs').classList.remove('show')};
$('fs').addEventListener('click',e=>{const b=e.target.closest('[data-len]');if(b&&fx&&!fx.run){fx.total=fx.left=+b.dataset.len*60;drawFocus()}});

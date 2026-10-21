/* Velora · voice — speech recognition + TTS, language picking, script detection. */

/* ---------- Voice ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const NSR=NATIVE?Capacitor.Plugins.SpeechRecognition:null;

// Upfront availability checks so the user gets a clear message instead of a silent failure.
const hasWebSR=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
const hasNativeSR=!!(NATIVE&&NSR);
const hasMediaDevices=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);

// If nothing works at all, tell the user plainly and skip the whole capture path.
if(!hasWebSR&&!hasNativeSR){
 st('Voice is not supported in this browser or on this phone without the native plugin. Type your capture below instead.');
}

async function listenNative(){
 if(rec){try{await NSR.stop()}catch(e){}return}
 try{
  const a=await NSR.available();if(!a.available){st('Speech recognition is not available on this phone. Type below.');return}
  let p=await NSR.checkPermissions();if(p.speechRecognition!=='granted')p=await NSR.requestPermissions();
  if(p.speechRecognition!=='granted'){st('Microphone is off. Turn it on in phone settings or type below.');return}
 }catch(e){st('Voice setup failed. Type below.');return}
 let got='',finished=false;rec=true;errMsg='';orb('listen');st('Listening… tap to finish');
 const fin=async()=>{
  if(finished)return;finished=true;rec=null;orb('');$('tr').textContent='';
  try{await NSR.removeAllListeners()}catch(e){}
  if(got.trim()){st('Thinking…');orb('think');setTimeout(()=>{orb('');st('Tap to speak');handle(got)},350)}
  else if(!errMsg)st('Didn’t catch that. Tap to retry');
 };
 try{
  await NSR.removeAllListeners();
  NSR.addListener('partialResults',d=>{got=(d.matches&&d.matches[0])||got;$('tr').textContent=got});
  NSR.addListener('listeningState',d=>{if(d.status==='stopped')fin()});
  await NSR.start({language:voiceLang(),maxResults:1,partialResults:true,popup:false});
 }catch(e){errMsg='x';st('Voice failed. Type below.');fin()}
}
function listen(){
 if(NATIVE&&NSR)return listenNative();
 if(!SR&&!hasNativeSR){
  st('Voice is not supported in this browser. Use the native app or type your capture below instead.');
  return;
 }
 if(rec){rec.stop();return}
 let got='';errMsg='';try{rec=new SR();rec.lang=voiceLang();rec.interimResults=true;}catch(e){rec=null;st('Could not start the microphone.');return}
 rec.onstart=()=>{orb('listen');st('Listening… tap to finish')};
 rec.onresult=e=>{got=[...e.results].map(r=>r[0].transcript).join(' ');$('tr').textContent=got};
 rec.onerror=e=>{
  const isNotAllowed=e.error==='not-allowed'||e.error==='service-not-allowed';
  const isNoSpeech=e.error==='no-speech';
  const isNetwork=e.error==='network';
  let msg;
  if(isNotAllowed){
   msg=hasNativeSR
    ?'Microphone blocked by phone. Enable it in Settings → Apps → velora → Microphone, or type below.'
    :'Microphone blocked. Allow microphone access in browser settings, or type your capture below.';
  }else if(isNoSpeech){
   msg=hasNativeSR
    ?'I didn’t catch that. Tap again or type below.'
    :'I didn’t hear anything. Tap the mic to try, or type below.';
  }else if(isNetwork){
   msg='Speech needs internet in this browser. Type below while offline.';
  }else{
   msg='Voice failed. Type below.';
  }
  st(msg);
 };
 rec.onend=()=>{rec=null;orb('');$('tr').textContent='';if(got.trim()){st('Thinking…');orb('think');setTimeout(()=>{orb('');st('Tap to speak');handle(got)},350)}else if(!errMsg)st('Didn’t catch that. Tap to retry')};
 try{rec.start()}catch(e){rec=null;st('Could not start the microphone.')}
}
function openAI(){
 $('ov').classList.add('show');
 if(!$('chat').children.length)say('What can I do for you? Try “Remind me to call Sam tomorrow morning”.',chips(['Plan my day','What can you handle automatically?','Find everything related to my project']));
}
$('mic').onclick=()=>{openAI();listen()};
$('omic').onclick=listen;
$('close').onclick=()=>{if(rec)rec.stop();$('ov').classList.remove('show')};
$('in').addEventListener('keydown',e=>{if(e.key==='Enter'&&$('in').value.trim()){const v=$('in').value;$('in').value='';openAI();handle(v)}});
$('tin').addEventListener('keydown',e=>{if(e.key==='Enter'&&$('tin').value.trim()){const v=$('tin').value;$('tin').value='';handle(v)}});
$('lang').value=VOICE_LANGS.includes(set.lang)?set.lang:'';
function lh(){$('lh').hidden=!set.lang||set.lang.startsWith('en')}
$('lang').onchange=()=>{const v=$('lang').value;set.lang=VOICE_LANGS.includes(v)?v:'';persist();lh()};lh();
/* If the user types Tamil/Malayalam directly, remember it for next voice run. */
function learnScriptLang(s){const d=detectScriptLang(s);if(d&&set.lang!==d){set.lang=d;try{$('lang').value=d}catch(e){}persist();lh()}}
$('tin').addEventListener('input',e=>learnScriptLang(e.target.value));
$('in').addEventListener('input',e=>learnScriptLang(e.target.value));
$('chat').addEventListener('click',e=>{
 const s=e.target.closest('[data-say]'),a=e.target.closest('[data-act]'),u=e.target.closest('[data-undo]'),cl=e.target.closest('[data-cal]');
 if(cl)addToCal(cl.dataset.cal);
 if(s)handle(s.dataset.say);
 if(a){if(a.dataset.act==='yes'&&pending&&pending.t==='confirm'){const p=pending;pending=null;p.run()}else{pending=null;say('Okay, cancelled.')}}
 if(u){const un=items.find(x=>x.id===u.dataset.undo);if(un)Notify.cancel(un);items=items.filter(x=>x.id!==u.dataset.undo);persist();render();u.disabled=true;u.textContent='Undone'}
});


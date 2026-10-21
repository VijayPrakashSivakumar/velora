/* Velora · services/automations — ACT library, scheduled workflows, approvals, automation panel. */

/* ---------- Automations (Phase 4) ---------- */
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const hh=s=>{const d=new Date(),p=String(s).split(':');d.setHours(+p[0],+p[1]||0,0,0);return tm(d)};
let auto=load('vl.auto.v1',{paused:false,ws:'09:00',we:'18:00'}),pend=load('vl.pend.v1',[]);if(!auto||typeof auto!=='object')auto={paused:false,ws:'09:00',we:'18:00'};if(!Array.isArray(pend))pend=[];const showHist={};
const hrs=()=>[...auto.ws.split(':').map(Number),...auto.we.split(':').map(Number)];
const persistWF=()=>{try{localStorage.setItem('vl.wf.v1',JSON.stringify(wfs));localStorage.setItem('vl.auto.v1',JSON.stringify(auto));localStorage.setItem('vl.pend.v1',JSON.stringify(pend))}catch(e){}};
function moveTo(list){list.forEach(i=>{const n=new Date(i.due),t=new Date();n.setFullYear(t.getFullYear(),t.getMonth(),t.getDate()+1);i.due=n.toISOString();Notify.schedule(i)});persist();render()}
const ACT={
 briefing:{desc:'Reads out your open and due tasks, renewals and your top three.',build(){
  const o=open().sort(rank),due=o.filter(i=>i.due&&new Date(i.due)<tomorrow()).length;
  const soon=new Date(Date.now()+3*864e5);
  const ren=vaultItems().filter(i=>!i.done&&i.due&&new Date(i.due)<=soon&&i.vcat!=='bill').slice(0,3);
  const rt=ren.length?' Renewing soon: '+ren.map(i=>i.text).join('; ')+'.':'';
  return{msg:o.length?`${o.length} open, ${due} due today. Top: ${o.slice(0,3).map(i=>i.text).join('; ')}.`+rt:'Nothing open today. A clear day.'+rt}}},
 eod:{desc:'Summarises today and offers to move unfinished tasks to tomorrow.',build(){
  const t0=dayStart(new Date()),dn=items.filter(i=>i.done&&i.doneAt&&new Date(i.doneAt)>=t0).length,un=open().filter(i=>i.due&&new Date(i.due)<tomorrow());
  const top=open().filter(i=>!un.includes(i)).sort(rank).slice(0,3);
  return{msg:`Done today: ${dn}. Focus: ${focusMin(t0)} min. Unfinished: ${un.length}.`+(top.length?` Next up: ${top.map(i=>i.text).join('; ')}.`:''),label:`Move ${un.length} to tomorrow`,apply:un.length?()=>moveTo(un):null}}},
 rollover:{desc:'Moves overdue tasks to tomorrow, keeping their time.',build(){
  const od=open().filter(isLate);if(!od.length)return null;
  return{msg:`${od.length} overdue: ${od.slice(0,3).map(i=>i.text).join('; ')}.`,label:`Move ${od.length} to tomorrow`,apply:()=>moveTo(od)}}},
 review:{desc:'Summarises the last 7 days and flags overdue tasks.',build(){
  const w0=Date.now()-7*864e5,dn=items.filter(i=>i.done&&i.doneAt>w0).length,o=open();
  return{msg:`This week: ${dn} done, ${o.length} open, ${o.filter(isLate).length} overdue.`}}},
 cleanup:{desc:'Deletes completed tasks older than 7 days. Always asks first.',build(){
  const old=items.filter(i=>i.done&&i.doneAt&&Date.now()-i.doneAt>7*864e5);if(!old.length)return null;
  return{msg:`${old.length} completed ${old.length>1?'items':'item'} older than 7 days.`,label:`Delete ${old.length}`,apply:()=>{items=items.filter(x=>!old.includes(x));persist();render()}}}}
};
let wfs=load('vl.wf.v1',null)||DEF.map((d,i)=>({...d,id:'w'+i,history:[],last:null,err:null}));
wfs.forEach(w=>{if(!w.nid)w.nid=newNid();if(w.enabled&&!w.next)w.next=nextAt(w)});
function nextAt(w,from=new Date()){
 const p=w.time.split(':').map(Number),d=new Date(from);d.setHours(p[0],p[1],0,0);
 if(w.type==='weekly'){d.setDate(d.getDate()+((w.day-d.getDay()+7)%7));if(d<=from)d.setDate(d.getDate()+7)}
 else if(d<=from)d.setDate(d.getDate()+1);
 return d.getTime();
}
const trigText=w=>(w.type==='weekly'?'Every '+DAYN[w.day]:'Every day')+' at '+hh(w.time);
function log(w,s,m){
 if(s!=='test')w.last=Date.now();
 if(s==='ok')w.err=null;
 w.lastMsg=m;w.history.unshift({t:Date.now(),s,m});w.history.length=Math.min(w.history.length,20);
}
function execute(w,o={}){
 try{
  const p=ACT[w.act].build();
  if(!p){log(w,o.test?'test':'ok','Nothing to do right now.');return null}
  if(o.test){log(w,'test','Test, nothing changed. Would say: '+p.msg+(p.apply?' (and offer: '+p.label+')':''));return p.msg}
  const mode=Math.min(w.mode,w.max||3);
  if(mode===3){
   if(p.apply)p.apply();
   if(o.late)toast(w.name+': '+p.msg);else notifyNow(w.name,p.msg);
   log(w,'ok',(o.late?'Caught up: ':'Ran automatically: ')+p.msg);
  }else{
   if(pend.some(x=>x.wf===w.id)){log(w,'ok','Still waiting for you.');return null}
   pend.unshift({id:uid(),wf:w.id,msg:p.msg,label:p.apply?(p.label||'Do it'):'Got it',kind:mode===2?'ask':'suggest',at:Date.now()});
   if(mode===2)notifyNow('Needs your OK · '+w.name,p.msg);
   log(w,'waiting',(mode===2?'Asked: ':'Suggested: ')+p.msg);
  }
 }catch(e){w.err=String(e&&e.message||e);log(w,'error',w.err)}
 return null;
}
function runDue(){
 if(auto.paused)return;
 const now=Date.now();let ch=false;
 wfs.forEach(w=>{if(w.enabled&&w.next&&w.next<=now){const late=now-w.next>9e5;w.next=nextAt(w);execute(w,{late});wfSchedule(w);ch=true}});
 if(ch){persistWF();renderPend();renderAuto()}
}
function approve(id){
 const p=pend.find(x=>x.id===id);if(!p)return;
 const w=wfs.find(x=>x.id===p.wf);pend=pend.filter(x=>x!==p);
 try{
  const b=w&&ACT[w.act].build();
  if(b&&b.apply){b.apply();log(w,'ok','Approved: '+p.msg);toast('Done')}
  else{if(w)log(w,'ok','Acknowledged.');toast(p.label==='Got it'?'Noted':'Nothing left to do')}
 }catch(e){if(w){w.err=String(e.message||e);log(w,'error',w.err)}toast('Something went wrong')}
 persistWF();render();renderPend();renderAuto();
}
async function notifyNow(title,body){
 try{
  if(NATIVE&&LN&&Notify.state==='on')await LN.schedule({notifications:[{id:newNid(),title,body,channelId:'reminders',schedule:{at:new Date(Date.now()+1500),allowWhileIdle:true}}]});
  else if(Notify.state==='web')webNotify(title,body);
  else toast(title+': '+body);
 }catch(e){toast(title)}
}
async function wfSchedule(w){
 if(!(NATIVE&&LN&&Notify.state==='on'))return;
 try{
  if(!w.enabled||auto.paused||!w.next){await LN.cancel({notifications:[{id:w.nid}]});return}
  await LN.schedule({notifications:[{id:w.nid,title:w.name,body:'Tap to see it in Velora',channelId:'reminders',extra:{wf:w.id},schedule:{at:new Date(w.next),allowWhileIdle:true}}]});
 }catch(e){}
}
function wfSyncAll(){wfs.forEach(wfSchedule)}
function pauseAll(v){
 auto.paused=v;if(!v)wfs.forEach(w=>{if(w.enabled)w.next=nextAt(w)});
 persistWF();wfSyncAll();renderAuto();renderPend();toast(v?'All automations paused':'Automations resumed');
}
function matchWf(q){const t=toks(q);let b=null,bs=0;wfs.forEach(w=>{const s=score({text:w.name},t);if(s>bs){bs=s;b=w}});return b}
function renderPend(){
 $('pend').innerHTML=pend.length?'<h2>Needs your OK</h2><div class="card">'+pend.map(p=>{const w=wfs.find(x=>x.id===p.wf);
  return `<div class="wf"><div class="kv"><b>${esc(w?w.name:'Automation')}</b> · ${p.kind==='ask'?'asking permission':'suggestion'}</div><div style="font-weight:600;margin:4px 0 10px">${esc(p.msg)}</div><div class="acts" style="margin:0"><button class="q go" data-ok="${p.id}">${esc(p.label)}</button><button class="q" data-skip="${p.id}">Skip</button></div></div>`}).join('')+'</div>':'';
 $('autoBtn').textContent=auto.paused?'⏸ Automations paused':'⚙ Automations · '+wfs.filter(w=>w.enabled).length+' on';
}
function renderAuto(){
 const pb=$('pauseAll');pb.textContent=auto.paused?'Resume all automations':'⏸ Pause all automations';pb.classList.toggle('on',!!auto.paused);
 $('pz').textContent=auto.paused?'Everything is paused. Nothing runs and scheduled alerts are cancelled until you resume.':'';
 $('ws').value=auto.ws;$('we').value=auto.we;
 $('wl').innerHTML=wfs.map(w=>{
  const waiting=pend.some(p=>p.wf===w.id),mode=Math.min(w.mode,w.max||3);
  const status=!w.enabled?'Off':auto.paused?'Paused':waiting?'Waiting for you':'Active';
  return `<div class="wf"><div class="wfh"><div><div class="wfn">${esc(w.name)}</div><div class="kv">${status}</div></div>
  <button class="tog" data-tog="${w.id}" aria-pressed="${w.enabled}" aria-label="${esc(w.name)} on or off"></button></div>
  <div class="kv"><b>Trigger</b> ${esc(trigText(w))}</div><div class="kv"><b>Does</b> ${esc(ACT[w.act].desc)}</div>
  <div class="kv"><b>Last run</b> ${w.last?esc(stamp(w.last))+' · '+esc((w.lastMsg||'').slice(0,90)):'Never'}</div>
  <div class="kv"><b>Next run</b> ${w.enabled&&!auto.paused&&w.next?esc(stamp(w.next)):'Not scheduled'}</div>
  <div class="kv ${w.err?'st-err':'st-ok'}"><b>Errors</b> ${w.err?esc(w.err):'None'}</div>
  <div class="seg" role="group" aria-label="Permission level">${MODES.map(([n,l])=>`<button class="${mode===n?'on':''}" data-mode="${w.id}:${n}" ${n===3&&w.max===2?'disabled':''}>${l}</button>`).join('')}</div>
  ${w.max===2?'<div class="kv">Deleting is irreversible, so this one always asks first.</div>':''}
  <div class="acts" style="align-items:center">Time <input type="time" value="${w.time}" data-time="${w.id}" aria-label="Time">${w.type==='weekly'?`<select data-day="${w.id}" aria-label="Day">${DAYN.map((d,i)=>`<option value="${i}" ${w.day===i?'selected':''}>${d}</option>`).join('')}</select>`:''}</div>
  <div class="acts"><button class="sm" data-test="${w.id}">Test</button><button class="sm" data-hist="${w.id}">${showHist[w.id]?'Hide history':'History'}</button><button class="sm" data-dup="${w.id}">Duplicate</button></div>
  ${showHist[w.id]?'<div style="margin-top:8px">'+(w.history.length?w.history.slice(0,8).map(h=>`<div class="kv"><b>${esc(stamp(h.t))}</b> · ${h.s} · ${esc(h.m.slice(0,110))}</div>`).join(''):'<div class="kv">No runs yet.</div>')+'</div>':''}</div>`}).join('');
}
$('autoBtn').onclick=()=>{renderAuto();$('aov').classList.add('show')};
$('aclose').onclick=()=>$('aov').classList.remove('show');
$('pauseAll').onclick=()=>pauseAll(!auto.paused);
$('aov').addEventListener('click',e=>{
 const g=a=>{const el=e.target.closest('['+a+']');return el&&el.getAttribute(a)};let id;
 if(id=g('data-tog')){const w=wfs.find(x=>x.id===id);w.enabled=!w.enabled;w.next=w.enabled?nextAt(w):null;wfSchedule(w)}
 else if(id=g('data-mode')){const [wid,m]=id.split(':'),w=wfs.find(x=>x.id===wid);w.mode=+m}
 else if(id=g('data-test')){const r=execute(wfs.find(x=>x.id===id),{test:true});toast(r||'Nothing to do right now')}
 else if(id=g('data-hist')){showHist[id]=!showHist[id]}
 else if(id=g('data-dup')){const w=wfs.find(x=>x.id===id);wfs.splice(wfs.indexOf(w)+1,0,{...w,id:uid(),nid:newNid(),name:w.name+' (copy)',history:[],last:null,err:null,enabled:false,next:null})}
 else return;
 persistWF();renderAuto();renderPend();
});
$('aov').addEventListener('change',e=>{
 const t=e.target;
 if(t.id==='ws'||t.id==='we'){if(t.value)auto[t.id]=t.value}
 else if(t.dataset.time){const w=wfs.find(x=>x.id===t.dataset.time);if(t.value){w.time=t.value;if(w.enabled)w.next=nextAt(w);wfSchedule(w)}}
 else if(t.dataset.day){const w=wfs.find(x=>x.id===t.dataset.day);w.day=+t.value;if(w.enabled)w.next=nextAt(w);wfSchedule(w)}
 persistWF();renderAuto();
});
$('pend').addEventListener('click',e=>{
 const o=e.target.closest('[data-ok]'),s=e.target.closest('[data-skip]');
 if(o)approve(o.dataset.ok);
 if(s){const p=pend.find(x=>x.id===s.dataset.skip);if(p){const w=wfs.find(x=>x.id===p.wf);if(w)log(w,'skipped','Skipped: '+p.msg);pend=pend.filter(x=>x!==p);persistWF();renderPend();renderAuto()}}
});


/* Velora · services/notify — toasts, completion/repeat logic, native/web notification scheduling. */

/* ---------- Completion, recurring tasks, notifications ---------- */
const LN=NATIVE?Capacitor.Plugins.LocalNotifications:null,timers={};
let tt;function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),3500)}
function advance(i){
 const d=new Date(i.due);let n=0;
 const late=()=>i.allDay?dayStart(d)<dayStart(new Date()):d<new Date();
 do{
  if(i.rep==='daily')d.setDate(d.getDate()+1);
  else if(i.rep==='weekly')d.setDate(d.getDate()+7);
  else if(i.rep==='monthly')d.setMonth(d.getMonth()+1);
  else{do d.setDate(d.getDate()+1);while([0,6].includes(d.getDay()))}
 }while(late()&&++n<400);
 return d.toISOString();
}
function setDone(i,v){
 i.done=v;i.doneAt=v?Date.now():null;
 if(v){
  Notify.cancel(i);
  if(i.rep&&i.due){const nx={...i,id:Date.now()+Math.random().toString(36).slice(2,5),nid:newNid(),done:false,doneAt:null,due:advance(i),created:Date.now()};items.unshift(nx);Notify.schedule(nx);toast('Next '+REPL[i.rep].toLowerCase()+' task: '+fmt(nx.due,nx.allDay))}
 }else Notify.schedule(i);
 persist();render();
}
function flash(id){const e=$('r-'+id);if(e){e.scrollIntoView({block:'center'});e.style.outline='2px solid var(--acc)';setTimeout(()=>{e.style.outline=''},2500)}}
function onAction(ev){
 const x=ev.notification&&ev.notification.extra,i=x&&items.find(t=>t.id===x.id);if(!i)return;
 if(ev.actionId==='done'){setDone(i,true);toast('Done: '+i.text)}
 else if(ev.actionId==='snooze'){i.due=new Date(Date.now()+6e5).toISOString();i.allDay=false;persist();render();Notify.schedule(i);toast('Snoozed 10 minutes')}
 else{view='upcoming';setTabs();render();flash(i.id)}
}
function badge(){const s=Notify.state;$('alerts').textContent=s==='on'?'🔔 Alerts on · work when the app is closed':s==='web'?'🔔 Alerts on while this page is open':s==='none'?'Alerts not supported in this browser':'🔕 Enable alerts'}
const Notify={
 state:'off',
 async init(){
  try{
   if(NATIVE&&LN){
    const p=await LN.checkPermissions();this.state=p.display==='granted'?'on':'off';
    await LN.createChannel({id:'reminders',name:'Reminders',description:'Task and reminder alerts',importance:5,visibility:1,vibration:true});
    await LN.registerActionTypes({types:[{id:'TASK',actions:[{id:'done',title:'Done'},{id:'snooze',title:'Snooze 10 min'}]}]});
    LN.addListener('localNotificationActionPerformed',onAction);
   }else if('Notification' in window)this.state=Notification.permission==='granted'?'web':'off';
   else this.state='none';
  }catch(e){this.state='off'}
  badge();this.syncAll();
 },
 async enable(){
  try{
   if(NATIVE&&LN){
    const p=await LN.requestPermissions();this.state=p.display==='granted'?'on':'off';
    if(this.state==='on'&&LN.checkExactNotificationSetting){
     const x=await LN.checkExactNotificationSetting();
     if(x.exact_alarm==='denied'){toast('Allow “Alarms & reminders” so alerts arrive on time.');await LN.changeExactNotificationSetting()}
    }
    if(this.state==='off')toast('Notifications are blocked. Turn them on in phone settings.');
   }else if('Notification' in window){const r=await Notification.requestPermission();this.state=r==='granted'?'web':'off'}
  }catch(e){toast('Could not turn on alerts.')}
  badge();this.syncAll();
 },
 at(i){const d=new Date(i.due);if(i.allDay)d.setHours(9,0,0,0);return d},
 async schedule(i){
  if(!i||i.done||!i.due||this.state==='off'||this.state==='none')return;
  const at=this.at(i);if(at<=new Date())return;
  try{
   if(NATIVE&&LN)await LN.schedule({notifications:[{id:i.nid,title:i.rem?'Reminder':'Task due',body:i.text,channelId:'reminders',actionTypeId:'TASK',extra:{id:i.id},schedule:{at,allowWhileIdle:true}}]});
   else{clearTimeout(timers[i.id]);const ms=at-new Date();if(ms<2e9)timers[i.id]=setTimeout(()=>{webNotify(i.rem?'Reminder':'Task due',i.text);toast(i.text)},ms)}
  }catch(e){toast('Could not schedule an alert for “'+i.text+'”.')}
 },
 async cancel(i){try{if(NATIVE&&LN)await LN.cancel({notifications:[{id:i.nid}]});else clearTimeout(timers[i.id])}catch(e){}},
 syncAll(){open().forEach(i=>this.schedule(i));wfSyncAll()}
};
$('alerts').onclick=()=>{if(Notify.state==='off')Notify.enable()};


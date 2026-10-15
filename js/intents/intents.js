/* Velora · intents — command routing, intent handlers, commit/planDay/find/summary and friends. */

/* ---------- Intents ---------- */
function handle(raw){
 raw=raw.trim();if(!raw)return;me(raw);const l=raw.toLowerCase();
 if(pending){
  if(/^(cancel|never ?mind|forget it|stop|no|nope)\b/.test(l)){pending=null;say('Okay, cancelled.');return}
  if(pending.t==='confirm'){if(/^(yes|yeah|yep|confirm|do it|ok|okay|sure|go ahead)\b/.test(l)){const p=pending;pending=null;p.run();return}pending=null}
  else if(pending.t==='when'){return answerWhen(l)}
 }
 route(raw,l);
}
function route(raw,l){
 let m;
 if(/இன்றைய நாளை திட்டமிடு|என் நாளை திட்டமிடு|நாளை திட்டமிடு|என்னுடைய நாளை|എന്നെ ഇന്ന് പ്ലാൻ|എന്റെ ദിവസം പ്ലാൻ|ഇന്ന് പ്ലാൻ|ദിവസം ആസൂത്രണം/.test(raw))return planDay();
 if(/சுருக்கம்|இன்று நான் என்ன செய்தேன்|സംഗ്രഹം|ഇന്ന് ഞാൻ എന്തു ചെയ്തു/.test(raw))return summary();
 if(/\bplan (my )?(entire |whole )?day\b|\bplan today\b/.test(l))return planDay();
 if(/^add (morning routine|trip pack|study sprint)( list| template)?$/.test(l)){const k=l.match(/^add (morning routine|trip pack|study sprint)/)[1];const name=Object.keys(TEMPLATES).find(x=>x.toLowerCase()===k);if(name){addTemplate(name);return say(`Added <b>${esc(name)}</b> checklist.`)}}
 if(/what can you (handle|do)|what.*automatically/.test(l))return caps();
 if(/summary|what did i (do|finish|complete)|wrap up my day/.test(l))return summary();
 if(/\b(organi[sz]e|sort|prioriti[sz]e|rank)\b.*\b(tasks?|priority|priorities)\b/.test(l))return prioritize();
 if(/\b(move|reschedule)\b.*\b(unfinished|overdue|incomplete|pending)\b/.test(l))return moveUnfinished();
 if(/\b(clear|delete|remove)\b.*\b(completed|done|finished)\b/.test(l))return clearDone();
 if(m=l.match(/^(?:delete|remove)\s+(?:the |my )?(?:task |note |idea )?(.+)$/))return delOne(m[1]);
 if(m=l.match(/^mark (.+?)(?: as)? (?:done|complete|completed|finished)$/)||l.match(/^i (?:have )?(?:finished|completed|done) (.+)$/))return markDone(m[1]);
 if(m=l.match(/^(?:start|begin) (?:a )?(?:focus|pomodoro|timer)(?: (?:on|for))? ?(.*)$/)||l.match(/^focus on (.+)$/)){
  const it=(m[1]&&matchOne(m[1],open()))||open().sort(rank)[0];if(!it)return say('You have no open task to focus on.');
  startFocus(it.id);return say(`Focus timer ready for <b>${esc(it.text)}</b>. Tap Start.`);
 }
 if(/\b(pause|stop|halt)\b.*\bautomations?\b|emergency stop/.test(l)){pauseAll(true);return say('All automations are paused. Say “resume automations” when you are ready.')}
 if(/\b(resume|restart|unpause)\b.*\bautomations?\b/.test(l)){pauseAll(false);return say('Automations resumed.')}
 if(/\b(list|which|what)\b.*\bautomations?\b|\bautomations? (running|active)\b/.test(l))return say('<b>Automations'+(auto.paused?' (all paused)':'')+'</b>'+wfs.map(w=>li(w.enabled?'On':'Off',w.name+' · '+trigText(w))).join(''),chips(['Pause all automations']));
 if(m=l.match(/^(?:turn|switch) (on|off) (?:my |the )?(.+?)(?: automation)?$/)){
  const w=matchWf(m[2]);if(!w)return say(`I couldn't find an automation like “${esc(m[2])}”.`);
  w.enabled=m[1]==='on';w.next=w.enabled?nextAt(w):null;wfSchedule(w);persistWF();renderPend();renderAuto();return say(`${esc(w.name)} is now <b>${m[1]}</b>.`);
 }
 if(/^(find|search|show me|look for)\b/.test(l)||/^(தேடு|தேடிக் கொடு|തിരയൂ|തിരഞ്ഞു തരൂ)\b/.test(raw.trim())){if(vaultAnswer(raw))return;return find(raw)}
 if(/bill|vault|warrant|subscri|\bsub\b|renew|expir|pnr|prescription|\bticket\b|passport|aadhaar|pan card|licen[sc]e|medical|appointment|\bmy .*(date|amount|expiry|pnr|report|plan)\b/i.test(l)){if(vaultAnswer(raw))return}
 startCreate(raw);
}
function startCreate(raw){
 const v=detectVault(raw);
 if(v&&(v.cat!=='doc'||/bill|warranty|prescription|ticket|aadhaar|pan|passport|certificate|marksheet/i.test(raw))){
  const it=saveVault(raw);
  if(it){say(`Filed in your <b>Vault</b> as <b>${esc(it.text)}</b><div class="meta">${esc(it.meta||VCATS[it.vcat])}.</div>`,chips(['Show my vault','Show my bills']));view='vault';vaultFilter=it.vcat;setTabs();render();return}
 }
 const l=raw.toLowerCase(),isRem=/^(please )?(remind|set a reminder|reminder)/.test(l)||/ஞாபகப்படுத்து|நினைவூட்டு|ஞாபகம்|ഓർമ്മിപ്പിക്കൂ|ഓർമ്മപ്പെടുത്തൂ|ഓർമ്മ/.test(raw),w=when(l),r=rep(l);if(r&&!w.day&&!w.rel&&!w.time)w.day=dayStart(new Date());const c=compose(w);
 let type='note';
 if(/\b(idea|what if|brainstorm)\b/.test(l))type='idea';
 else if(isRem||c||/^(call|email|text|buy|pay|book|send|schedule|finish|submit|review|prepare|fix|clean|pick up|follow up|ask)\b/.test(l)||/\b(need to|have to|must|todo|to do)\b/.test(l)||/^(சேர்|சேரு|சேர்த்து|ചേർക്കൂ|ചേർക്കു|ചേർക്കണ)/.test(raw.trim()))type='task';
 let text=raw.replace(/^(please\s+)?(remind me to|remind me|set a reminder to|reminder to|add (a )?task( to)?|create (a )?(task|note|idea)( (from|about|for) (this|that))?( to)?|note( that)?|task:?)\s*/i,'').replace(/^(ஞாபகப்படுத்து|நினைவூட்டு|சேர்|சேரு|சேர்த்துக்கோ|ഓർമ്മിപ്പിക്കൂ|ഓർമ്മപ്പെടുത്തൂ|ചേർക്കൂ|ചേർക്കണ)\s+/,'');
 if(c)text=strip(text);
 const d={text:cap(text||raw),type,rem:isRem,w,rep:c?r:null,due:c?c.due:null,allDay:c?c.allDay:false};
 if(isRem&&!w.rel&&!w.day&&!w.time){pending={t:'when',d};return say(`When should I remind you to <b>${esc(d.text)}</b>?`,chips(['Tonight','Tomorrow morning','Tomorrow at 9 AM','In 1 hour']))}
 if(isRem&&w.day&&!w.time&&!w.rel){pending={t:'when',d};return say(`What time ${fmtDay(w.day).toLowerCase()}?`,chips(['9 AM','12 PM','6 PM']))}
 commit(d);
}
function answerWhen(l){
 const d=pending.d,w2=when(l);
 if(!w2.rel&&!w2.day&&!w2.time)return say('I need a time, like “tomorrow at 9” or “in 2 hours”. Or say cancel.');
 const c=compose({day:w2.day||d.w.day,time:w2.time||d.w.time,rel:w2.rel});
 d.due=c.due;d.allDay=c.allDay;pending=null;commit(d);
}
function commit(d){
 const it={id:Date.now()+Math.random().toString(36).slice(2,5),type:d.type,text:d.text,rem:d.rem,rep:d.type==='task'?d.rep||null:null,nid:newNid(),due:d.type==='task'?d.due:null,allDay:d.type==='task'?d.allDay:false,done:false,created:Date.now()};
 items.unshift(it);persist();render();Notify.schedule(it);
 const lbl=d.rem?'reminder':it.type;
 say(`Added ${lbl}: <b>${esc(it.text)}</b>${it.due?`<div class="meta">${d.rem?'🔔 ':''}${esc(fmt(it.due,it.allDay))}${it.rep?' · ↻ '+REPL[it.rep]:''}</div>`:''}${it.due&&(Notify.state==='off'||Notify.state==='none')?'<div class="meta">Alerts are off. Tap “Enable alerts” on the home screen.</div>':''}`,`<div class="qs"><button class="q" data-undo="${it.id}">Undo</button>${it.due?`<button class="q" data-cal="${it.id}">📅 Add to calendar</button>`:''}</div>`);
}
function planDay(){
 const o=open().filter(i=>!i.due||new Date(i.due)<tomorrow()).sort(rank).slice(0,8);
 if(!o.length)return say('Nothing is due today. Tell me what to add, or enjoy the space.');
 let t=new Date();t.setMinutes(t.getMinutes()<30?30:60,0,0);{const [sh,sm]=hrs();if(t.getHours()*60+t.getMinutes()<sh*60+sm)t.setHours(sh,sm,0,0)}
 const end=new Date();end.setHours(...hrs().slice(2),0,0);const rows=[];let left=0;
 for(const i of o){
  if(i.due&&!i.allDay&&new Date(i.due)>=new Date()){rows.push([new Date(i.due),i]);continue}
  if(t>=end){left++;continue}
  rows.push([new Date(t),i]);t=new Date(t.getTime()+45*6e4);
 }
 rows.sort((a,b)=>a[0]-b[0]);
 say('<b>Here is a realistic day</b> ('+hh(auto.ws)+' to '+hh(auto.we)+', 45 minutes each)'+rows.map(([a,i])=>li(tm(a),i.text)).join('')+(left?`<div class="meta">${left} more won't fit today. Say “move my unfinished tasks” to push them.</div>`:'')+'<div class="meta">This is a suggestion. Nothing was changed.</div>');
}
function prioritize(){
 const o=open().sort(rank).slice(0,6);
 if(!o.length)return say('No open tasks to organise.');
 say('<b>Your order, most urgent first</b>'+o.map(i=>li(isLate(i)?'Overdue':i.due?fmtDay(i.due):'No date',i.text)).join('')+'<div class="meta">I sort by due date automatically, so nothing needs changing.</div>');
}
function find(l){
 const q=String(l).replace(/^(find|search( for)?|show me|look for)\s+/i,'').replace(/^(தேடு|தேடிக் கொடு|തിരയൂ|തിരഞ്ഞു തരൂ)\s+/,'').replace(/^(everything|all)\s+/,'').replace(/^(related to|about|for|on)\s+/,'').replace(/^(my|the)\s+/,'');
 const t=toks(q);if(!t.length&&!/[஀-௿ഀ-ൿ]/.test(q))return say('What should I look for?');
 const t2=t.length?t:[q.trim()].filter(Boolean);
 const r=items.map(i=>[score(i,t2.length?t2:[q.toLowerCase()]),i]).filter(x=>x[0]).sort((a,b)=>b[0]-a[0]).slice(0,6);
 say(r.length?`<b>${r.length} found for “${esc(q)}”</b>`+r.map(([,i])=>li(i.type==='task'?(i.done?'Done':i.due?fmtDay(i.due):'Task'):cap(i.type),i.text)).join(''):`Nothing saved matches “${esc(q)}”.`);
}
function summary(){
 const t0=dayStart(new Date()),dn=items.filter(i=>i.done&&i.doneAt&&new Date(i.doneAt)>=t0),o=open().sort(rank),late=o.filter(isLate).length;
 say(`<b>Today so far</b><div class="li"><b>${dn.length}</b><span>completed${dn.length?': '+esc(dn.slice(0,3).map(i=>i.text).join(', ')):''}</span></div><div class="li"><b>${o.length}</b><span>still open, ${late} overdue</span></div><div class="li"><b>${focusMin(t0)}m</b><span>focused today</span></div>`+(o.length?'<div class="meta" style="margin-top:8px">Tomorrow’s top tasks</div>'+o.slice(0,3).map(i=>li(i.due?fmtDay(i.due):'Anytime',i.text)).join(''):''));
}
function caps(){
 say('<b>What I can handle now</b><div class="li"><span>Add tasks, reminders, notes and ideas from your voice or typing</span></div><div class="li"><span>File bills, warranties, subscriptions, IDs, prescriptions, tickets, links and study notes into your Vault — auto-detected and titled</span></div><div class="li"><span>Answer “what is my EB bill date”, “show my subscriptions”, “my PNR” from your Vault</span></div><div class="li"><span>Plan your day, sort by priority, find saved items, write your summary</span></div><div class="li"><span>Delete with a 6-second Undo, and bulk-select many items at once</span></div><div class="li"><span>Run automations: morning briefing (with renewals), end-of-day review, overdue rollover. You choose how much each can do alone</span></div><div class="meta">Not yet: sending messages, calendar sync, cloud AI. Those need the online phases.</div>',chips(['Plan my day','Show my vault','Add morning routine list','Move my unfinished tasks']));
}
function moveUnfinished(){
 const od=open().filter(isLate);
 if(!od.length)return say('No overdue tasks, so nothing to move.');
 pending={t:'confirm',run(){od.forEach(i=>{const n=new Date(i.due);const t=new Date();n.setFullYear(t.getFullYear(),t.getMonth(),t.getDate()+1);i.due=n.toISOString();Notify.schedule(i)});persist();render();say(`Moved ${od.length} ${od.length>1?'tasks':'task'} to tomorrow.`)}};
 say(`<b>Move ${od.length} overdue ${od.length>1?'tasks':'task'} to tomorrow?</b>`+od.slice(0,5).map(i=>li(fmtDay(i.due),i.text)).join(''),yesno('Move them'));
}
function clearDone(){
 const dn=items.filter(i=>i.done);if(!dn.length)return say('Nothing completed to clear.');
 pending={t:'confirm',run(){const s=snapshot();items=items.filter(i=>!i.done);persist();render();showUndo(`Cleared ${dn.length} completed ${dn.length>1?'items':'item'}.`,s);say(`Cleared ${dn.length}. Undo available below.`)}};
 say(`<b>Permanently delete ${dn.length} completed ${dn.length>1?'items':'item'}?</b>`,yesno('Delete'));
}
function delOne(q){
 const it=matchOne(q,items);if(!it)return say(`I couldn't find “${esc(q)}”.`);
 pending={t:'confirm',run(){const s=snapshot();Notify.cancel(it);items=items.filter(x=>x.id!==it.id);persist();render();showUndo(`Deleted “${it.text.slice(0,40)}”.`,s);say('Deleted. Undo available below.')}};
 say(`<b>Delete “${esc(it.text)}”?</b>`,yesno('Delete'));
}
function markDone(q){
 const it=matchOne(q,open());if(!it)return say(`I couldn't find an open task like “${esc(q)}”.`);
 setDone(it,true);say(`Marked done: <b>${esc(it.text)}</b>`);
}


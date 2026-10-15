/* Velora · features/backup — export/import, ICS/copy-all, widget push, theme. */

/* backup */
$('exp').onclick=async()=>{
 const name='velora-backup-'+new Date().toISOString().slice(0,10)+'.json',blob=new Blob([JSON.stringify({v:1,items,wfs,auto,pend,focus:focusLog,set})],{type:'application/json'});
 try{const file=new File([blob],name,{type:'application/json'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Velora backup'});return}catch(e){if(e&&e.name==='AbortError')return}}}catch(e){}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();toast('Backup saved');
};
$('imp').onclick=()=>$('impf').click();
$('impf').onchange=async()=>{
 const f=$('impf').files[0];$('impf').value='';if(!f)return;
 try{const d=JSON.parse(await f.text());if(!Array.isArray(d.items))throw 0;
  const have=new Set(items.map(i=>i.id));let n=0;
  d.items.forEach(i=>{if(i&&i.id&&!have.has(i.id)){i.nid=newNid();items.push(i);n++}});
  persist();render();Notify.syncAll();toast('Imported '+n+' new '+(n===1?'item':'items'));
 }catch(e){toast('That file is not a Velora backup')}
};
const upc=()=>open().filter(i=>i.due&&(i.allDay?dayStart(i.due)>=dayStart(new Date()):new Date(i.due)>=new Date())).sort(rank);
const icsEsc=s=>String(s).replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');
$('icsAll').onclick=async()=>{
 const L=upc();if(!L.length){toast('No upcoming tasks with a date');return}
 const f=d=>new Date(d).toISOString().replace(/[-:]|\.\d{3}/g,''),ymd=x=>x.getFullYear()+pad(x.getMonth()+1)+pad(x.getDate());
 const R={daily:'FREQ=DAILY',weekdays:'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',weekly:'FREQ=WEEKLY',monthly:'FREQ=MONTHLY'};
 const out=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Velora//EN'];
 L.forEach(i=>{
  const d0=new Date(i.due),n=new Date(d0);n.setDate(n.getDate()+1);
  out.push('BEGIN:VEVENT','UID:'+i.id+'@velora','DTSTAMP:'+f(Date.now()),
   i.allDay?'DTSTART;VALUE=DATE:'+ymd(d0):'DTSTART:'+f(d0),
   i.allDay?'DTEND;VALUE=DATE:'+ymd(n):'DTEND:'+f(d0.getTime()+18e5),'SUMMARY:'+icsEsc(i.text));
  if(i.rep)out.push('RRULE:'+R[i.rep]);
  out.push('BEGIN:VALARM','TRIGGER:-PT10M','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(i.text),'END:VALARM','END:VEVENT');
 });
 out.push('END:VCALENDAR');
 const blob=new Blob([out.join('\r\n')],{type:'text/calendar'}),name='velora-reminders.ics';
 try{const file=new File([blob],name,{type:'text/calendar'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Velora reminders'});return}catch(e){if(e&&e.name==='AbortError')return}}}catch(e){}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();toast('Saved. Open the file to add the events.');
};
$('cpAll').onclick=async()=>{
 const L=upc();if(!L.length){toast('No upcoming tasks with a date');return}
 const t='Please add these to my phone calendar with a 10 minute alert:\n'+L.map(i=>{const d=new Date(i.due);return '- '+i.text+' | '+(i.allDay?dstr(d)+' all day':dstr(d)+' '+pad(d.getHours())+':'+pad(d.getMinutes()))+' | '+(i.rep||'one-time')}).join('\n');
 try{await navigator.clipboard.writeText(t);toast('Copied. Paste it into Claude and it adds them all.')}catch(e){toast('Could not copy on this browser')}
};
function pushWidget(){
 if(!NATIVE||!Capacitor.Plugins||!Capacitor.Plugins.WidgetBridge)return;
 const o=open().sort(rank),due=o.filter(i=>i.due&&new Date(i.due)<tomorrow()).length;
 const text=o.length?o.slice(0,4).map(i=>(i.star?'★ ':'• ')+i.text+(i.due?'  '+fmt(i.due,i.allDay):'')).join('\n'):'Nothing open. Tap to add.';
 try{Capacitor.Plugins.WidgetBridge.update({count:o.length?o.length+' open · '+due+' due today':'All clear',text})}catch(e){}
}
$('theme').value=set.theme||'';
$('theme').onchange=()=>{set.theme=$('theme').value;if(set.theme)document.documentElement.dataset.theme=set.theme;else delete document.documentElement.dataset.theme;persist()};


/* Velora · features/edit — edit sheet, add-to-calendar. */

/* edit sheet */
function openEdit(id){
 const i=items.find(x=>x.id===id);if(!i)return;editId=id;
 $('et').value=i.text;$('ety').value=i.type;$('estar').checked=!!i.star;
 $('eimg').innerHTML=i.img?`<img class="th big" src="${i.img}" alt="Attached photo">`:'';
 const d=i.due?new Date(i.due):null;
 $('ed').value=d?dstr(d):'';$('etm').value=d&&!i.allDay?pad(d.getHours())+':'+pad(d.getMinutes()):'';$('er').value=i.rep||'';
 $('etask').hidden=i.type!=='task';$('es').classList.add('show');
}
$('ety').onchange=()=>{$('etask').hidden=$('ety').value!=='task'};
$('ecan').onclick=()=>$('es').classList.remove('show');
function addToCal(id){
 const i=items.find(x=>x.id===id);if(!i||!i.due){toast('Set a date first');return}
 const f=d=>new Date(d).toISOString().replace(/[-:]|\.\d{3}/g,''),d0=new Date(i.due),ymd=x=>x.getFullYear()+pad(x.getMonth()+1)+pad(x.getDate());
 let dates;
 if(i.allDay){const n=new Date(d0);n.setDate(n.getDate()+1);dates=ymd(d0)+'/'+ymd(n)}
 else dates=f(d0)+'/'+f(new Date(d0.getTime()+18e5));
 const R={daily:'FREQ=DAILY',weekdays:'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',weekly:'FREQ=WEEKLY',monthly:'FREQ=MONTHLY'};
 const u='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(i.text)+'&dates='+dates+'&details='+encodeURIComponent('Added from Velora')+(i.rep?'&recur='+encodeURIComponent('RRULE:'+R[i.rep]):'');
 const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();
}
$('ecal').onclick=()=>addToCal(editId);
$('edel').onclick=()=>{const i=items.find(x=>x.id===editId);if(!i)return;const s=snapshot();Notify.cancel(i);items=items.filter(x=>x!==i);persist();render();$('es').classList.remove('show');showUndo(`Deleted “${i.text.slice(0,40)}”.`,s)};
$('esave').onclick=()=>{
 const i=items.find(x=>x.id===editId);if(!i)return;
 Notify.cancel(i);
 const tx=$('et').value.trim();if(tx)i.text=tx;
 i.type=$('ety').value;i.star=$('estar').checked;
 if(i.type==='task'){
  const dv=$('ed').value,tv=$('etm').value;
  if(dv){const d=new Date(dv+'T'+(tv||'00:00'));i.due=d.toISOString();i.allDay=!tv}else{i.due=null;i.allDay=false}
  i.rep=i.due&&$('er').value?$('er').value:null;
 }else if(i.type!=='vault'){i.due=null;i.allDay=false;i.rep=null}
 persist();render();Notify.schedule(i);$('es').classList.remove('show');toast('Saved');
};

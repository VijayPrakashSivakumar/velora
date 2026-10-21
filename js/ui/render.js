/* Velora · ui/render — home rendering, tabs, multi-select/undo wiring, list delegation. */

/* ---------- Home ---------- */
function row(i){
 const selOn=sel.has(i.id);
 return `<div class="row ${i.done?'done':''}" id="r-${i.id}"><button class="${selMode?'selchk':'chk'}${selOn?' on':''}" data-${selMode?'sel':'c'}="${i.id}" aria-label="${selMode?'Select':'Mark done'}">${selMode?(selOn?'✓':''):i.done?'✓':''}</button>
 <div class="t" data-e="${i.id}">${i.star?'★ ':''}${esc(i.text)}${i.img?`<img class="th" src="${i.img}" alt="Attached photo">`:''}${i.spent?`<div class="meta">⏱ ${i.spent} min focused</div>`:''}${i.due?`<div class="meta ${isLate(i)?'late':''}">${i.rem?'🔔 ':''}${esc(fmt(i.due,i.allDay))}${i.rep?' · ↻ '+REPL[i.rep]:''}</div>`:i.type==='idea'?'<div class="meta">Idea</div>':''}</div>${i.type==='task'&&!i.done?`<button class="x" data-f="${i.id}" aria-label="Start focus timer">⏱</button>`:''}<button class="x" data-d="${i.id}" aria-label="Delete">×</button></div>`;
}
function render(){
 const h=new Date().getHours(),o=open().sort(rank);
 $('hi').textContent=h<12?'Good morning':h<18?'Good afternoon':'Good evening';
 document.title=`Velora — ${o.length} open`;
 $('date').textContent=new Date().toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'});
 const due=o.filter(i=>i.due&&new Date(i.due)<tomorrow()).length;
 const doneToday=items.filter(i=>i.done&&i.doneAt&&new Date(i.doneAt)>dayStart(new Date())).length;
$('brief').textContent=o.length?`${o.length} open, ${due} due today or overdue.${doneToday?` ${doneToday} done today.`:''}`:'Nothing open. Tap the orb and tell me what is next.';
 $('top').innerHTML=o.length?o.slice(0,3).map(row).join(''):'<div class="empty">Say “plan my day” or add your first task.</div>';
 let list,title;
 if(view==='upcoming'){list=o.slice(3);title='Everything else'}
 else if(view==='week'){list=null;title='Next 7 days'}
 else if(view==='vault'){list=null;title='Smart vault'}
 else if(view==='notes'){list=items.filter(i=>i.type!=='task'&&i.type!=='vault');title='Notes & ideas'}
 else{list=items.filter(i=>i.done);title='Completed'}
 $('vh').textContent=title;
 const selbar2=(selMode||sel.size)&&view!=='vault'?`<div class="selbar"><span class="selcount">${sel.size} selected</span><button class="sm" data-bulk="done">Done</button><button class="sm" data-bulk="tomorrow">Tomorrow</button><button class="sm" data-bulk="share">Share</button><button class="sm" data-bulk="clear">Clear</button></div>`:'';
 const tpl=view==='upcoming'&&!o.length?`<div class="vaultbar"><span class="vmeta">One-tap starters:</span>${Object.keys(TEMPLATES).map(k=>`<button class="sm" data-tpl="${esc(k)}">${esc(k)}</button>`).join('')}</div>`:'';
 $('list').innerHTML=selbar2+tpl+(list===null?(view==='vault'?vaultHTML():weekHTML()):list.length?list.map(row).join(''):'<div class="empty">Nothing here yet.</div>');renderPend();pushWidget();
}
document.querySelector('main').addEventListener('click',e=>{
 const tp=e.target.closest('[data-tpl]');
 if(tp){addTemplate(tp.dataset.tpl);return}
 const vf=e.target.closest('[data-vf]'),bk=e.target.closest('[data-bulk]');
 if(vf){vaultFilter=vf.dataset.vf;render();return}
 if(bk){const b=bk.dataset.bulk;if(b==='done')bulkDone();else if(b==='tomorrow')bulkTomorrow();else if(b==='share')bulkShare();else bulkClear();return}
 const s=e.target.closest('[data-sel]');
 if(s){const id=s.dataset.sel;if(sel.has(id))sel.delete(id);else sel.add(id);if(sel.size>=1)selMode=true;if(!sel.size)selMode=false;render();return}
 const op=e.target.closest('[data-open]');
 if(op){try{let u=op.dataset.open;if(!/^https?:/i.test(u))u='https://'+u;open(u,'_blank','noopener')}catch(err){}return}
 const c=e.target.closest('[data-c]'),d=e.target.closest('[data-d]'),ed=e.target.closest('[data-e]'),fo=e.target.closest('[data-f]');
 if(fo)return startFocus(fo.dataset.f);if(ed&&!c&&!d)return openEdit(ed.dataset.e);
 if(c){const i=items.find(x=>x.id===c.dataset.c);if(i)setDone(i,!i.done);}
 if(d){const id=d.dataset.d,it=items.find(x=>x.id===id);if(!it)return;const s0=snapshot();Notify.cancel(it);items=items.filter(x=>x.id!==id);sel.delete(id);persist();render();showUndo(`Deleted “${it.text.slice(0,40)}”.`,s0)}
});
$('undobtn').onclick=()=>{if(!undoSnap)return;items=undoSnap;undoSnap=null;$('undo').classList.remove('show');sel.clear();selMode=false;persist();render();Notify.syncAll();toast('Restored.')};
/* Long-press a task row to enter multi-select bulk mode. */
document.querySelector('main').addEventListener('contextmenu',e=>{const r=e.target.closest('.row');if(!r)return;e.preventDefault();const id=(r.id||'').replace(/^r-/,'');if(!id)return;selMode=true;sel.add(id);render();toast('Multi-select on. Tap circles to pick, then use Done / Tomorrow / Share.')});
function setTabs(){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.v===view))}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{view=b.dataset.v;setTabs();render()});


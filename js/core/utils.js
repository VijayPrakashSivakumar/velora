/* Velora · core/utils — formatting, date and item-query helpers. */

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dayStart=d=>{d=new Date(d);d.setHours(0,0,0,0);return d};
const tomorrow=()=>new Date(dayStart(new Date()).getTime()+864e5);
const tm=d=>new Date(d).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
const fmtDay=d=>{d=new Date(d);const n=Math.round((dayStart(d)-dayStart(new Date()))/864e5);return n===0?'Today':n===1?'Tomorrow':n===-1?'Yesterday':n<0?Math.abs(n)+' days ago':d.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'})};
const fmt=(iso,all)=>all?fmtDay(iso):fmtDay(iso)+', '+tm(iso);
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const open=()=>items.filter(i=>i.type==='task'&&!i.done);
const isLate=i=>i.type==='task'&&!i.done&&i.due&&(i.allDay?dayStart(i.due)<dayStart(new Date()):new Date(i.due)<new Date());
const rank=(a,b)=>(!!b.star-!!a.star)||(a.due?new Date(a.due).getTime():9e15)-(b.due?new Date(b.due).getTime():9e15)||b.created-a.created;


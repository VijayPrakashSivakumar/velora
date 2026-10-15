/* Velora · vault — Smart Vault: detection, save, Q&A, list UI, bulk actions, templates. */

/* ============ Vault — smart bill / study / URL organiser (part 1: detect) ============ */
let vaultFilter='all',sel=new Set(),selMode=false;
const extractUrl=s=>{const m=String(s||'').match(URL_RE);return m?m[0]:''};
function cleanUrlTitle(u){try{return new URL(u.startsWith('http')?u:'https://'+u).hostname.replace(/^www\./,'')}catch(e){return u.slice(0,32)}}
function extractAmount(s){const m=String(s||'').replace(/,/g,'').match(/(?:rs\.?|inr|₹)\s?(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s?(?:rs\.?|inr|₹|rupees?)/i);return m?parseFloat(m[1]||m[2]):null}
function extractBillDate(s){
 const t=String(s||'');let m=t.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
 if(m){let d=+m[1],mo=+m[2]-1,y=+m[3];if(y<100)y+=2000;if(mo>=0&&mo<12&&d>=1&&d<=31)return new Date(y,mo,d).toISOString()}
 m=t.match(/(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/i);
 if(m)return new Date(new Date().getFullYear(),MONTHS[m[3].toLowerCase()],+m[1]).toISOString();
 m=t.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i);
 if(m)return new Date(new Date().getFullYear(),MONTHS[m[1].toLowerCase()],+m[2]).toISOString();
 return null;
}
function detectVault(raw){
 const s=String(raw||''),l=s.toLowerCase(),url=extractUrl(s);
 const has=a=>a.some(w=>l.includes(w));
 const billHit=has(BILL_WORDS),studyHit=has(STUDY_WORDS),subHit=has(SUB_WORDS),medHit=has(MED_WORDS),travelHit=has(TRAVEL_WORDS),idHit=has(ID_WORDS),warHit=has(WAR_WORDS);
 const amt=extractAmount(s),dt=extractBillDate(s);
 if(idHit&&!/^(renew|apply|pay|submit|book|finish|send|call|update|check|verify|renewal|deadline)\b/.test(l)){
  let who='ID proof';const m=s.match(/(aadhaar|aadhar|pan card|voter id|driving licen[sc]e|passport|ration card)/i);if(m)who=cap(m[1]);
  return{cat:'id',title:who+' (ID)',meta:'Tap photo to view · keep original safe',due:null,url};
 }
 if(warHit){
  let who='Warranty';const m=s.match(/(tv|fridge|ac|washing machine|mobile|phone|laptop|microwave|fan|cooler)/i);if(m)who=cap(m[1])+' warranty';
  let exp=null;const ym=s.match(/warranty\s*(till|until|upto|up to)\s*(.+)/i);if(ym)exp=extractBillDate(ym[2]);
  return{cat:'warranty',title:who+(exp?' · till '+fmtDay(exp):''),meta:[exp?'Expires '+fmtDay(exp):null,'Keep bill photo'].filter(Boolean).join(' · '),due:exp,url};
 }
 if(subHit){
  let who='Subscription';const m=s.match(/(netflix|prime|hotstar|spotify|youtube premium|icloud|google one|gym|jio|airtel|vi)\s*(subscription|plan|membership|recharge)?/i);if(m)who=cap(m[1])+' '+(m[2]||'plan');
  return{cat:'sub',title:who+(amt?' · ₹'+amt:''),meta:[amt?'₹'+amt:null,dt?'Renews '+fmtDay(dt):null,url?cleanUrlTitle(url):null].filter(Boolean).join(' · '),due:dt,url};
 }
 if(medHit){
  const m=s.match(/(prescription|blood test|x-?ray|scan|report)\s*(for|of)?\s*([^\n,]{0,50})?/i);
  const title=m?cap(m[1]+(m[3]?' — '+m[3].trim():'')):'Medical record';
  const ap=s.match(/(appointment|visit|checkup|review)\s*(on|at)?\s*(.+)/i);const adt=ap?extractBillDate(ap[3]):dt;
  return{cat:'medical',title:title,meta:[adt?'Visit '+fmtDay(adt):null,dt&&!adt?'Dated '+fmtDay(dt):null].filter(Boolean).join(' · '),due:adt,url};
 }
 if(travelHit){
  const pnr=(s.match(/pnr\s*[:\-]?\s*(\d{6,10})/i)||[])[1];
  const m=s.match(/(flight|train|bus|hotel)\s*([A-Z0-9\- ]{0,30})?/i);
  const title=m?cap(m[1])+' booking'+(pnr?' · PNR '+pnr:''):('Travel booking'+(pnr?' · PNR '+pnr:''));
  return{cat:'travel',title:title,meta:[pnr?'PNR '+pnr:null,dt?'On '+fmtDay(dt):null].filter(Boolean).join(' · '),due:dt,url};
 }
 if(billHit||(/bill|due|pay|amount|₹/.test(l)&&dt)){
  let who='Bill';const m=s.match(/(eb|tneb|electricity|water|gas|wifi|broadband|jio|airtel|vi|rent|emi|insurance|property tax|credit card)\s*(bill|payment|due|recharge)?/i);
  if(m)who=cap(m[1])+' '+(m[2]||'bill');
  return{cat:'bill',title:who+(amt?' · ₹'+amt:''),meta:[amt?'Amount ₹'+amt:null,dt?'Due '+fmtDay(dt):null,url?cleanUrlTitle(url):null].filter(Boolean).join(' · '),due:dt,url};
 }
 if(studyHit||/\.pdf\b|coursera|udemy|khan|ncert|class\s?\d+/.test(l)){
  const m=s.match(/(chapter|lesson|unit)\s?(\d+)?\s*[:\-]?\s*([^\n,]{0,60})?/i);
  const title=m?cap((m[1]+(m[2]?' '+m[2]:''))+(m[3]?' — '+m[3].trim():'')):s.split('\n')[0].slice(0,70)||'Study material';
  return{cat:'study',title:title,meta:[url?cleanUrlTitle(url):null,/exam|test/i.test(s)?'Exam prep':null].filter(Boolean).join(' · '),due:dt,url};
 }
 if(url){const host=cleanUrlTitle(url);const before=s.replace(URL_RE,'').trim().split('\n')[0].slice(0,70);
  return{cat:'url',title:(before.length>8?before:host),meta:host,url,due:null}}
 if(/bill|note|doc|file|photo|image|certificate|marksheet|aadhaar|pan card/i.test(s.slice(0,140))){
  return{cat:'doc',title:s.split('\n')[0].slice(0,70)||'Saved file',meta:dt?'Dated '+fmtDay(dt):'',due:dt,url};
 }
 return null;
}
/* Vault part 3: list UI + undo + bulk + templates */
function vaultRow(i){
 const sub=[i.meta,i.due?('🔔 Due '+fmt(i.due,i.allDay)):null,i.url?esc(cleanUrlTitle(i.url)):null].filter(Boolean).join(' · ');
 return `<div class="row" id="r-${i.id}"><button class="selchk${sel.has(i.id)?' on':''}" data-sel="${i.id}" aria-label="Select">${sel.has(i.id)?'✓':''}</button><div class="t" data-e="${i.id}">${esc(i.text)}<span class="vchip ${i.vcat}">${VCATS[i.vcat]||'Saved'}</span>${sub?`<div class="vmeta">${sub}</div>`:''}${i.img?`<img class="th" src="${i.img}" alt="Attached photo">`:''}</div>${i.url?`<button class="x" data-open="${esc(i.url)}" aria-label="Open link">↗</button>`:''}<button class="x" data-d="${i.id}" aria-label="Delete">×</button></div>`;
}
function vaultHTML(){
 const all=vaultItems();
 const list=vaultFilter==='all'?all:all.filter(j=>j.vcat===vaultFilter);
 const cats=['bill','warranty','sub','id','medical','travel','study','url','doc'];
 const counts={all:all.length};cats.forEach(c=>counts[c]=0);all.forEach(j=>{if(counts[j.vcat]!=null)counts[j.vcat]++});
 const bar=`<div class="vaultbar">${['all',...cats].map(c=>`<button class="sm${vaultFilter===c?' on':''}" data-vf="${c}">${c==='all'?'All':VCATS[c]} · ${counts[c]||0}</button>`).join('')}</div>`;
 const selbar=sel.size?`<div class="selbar"><span class="selcount">${sel.size} selected</span><button class="sm" data-bulk="done">Done</button><button class="sm" data-bulk="tomorrow">Tomorrow</button><button class="sm" data-bulk="share">Share</button><button class="sm" data-bulk="clear">Clear</button></div>`:'';
 const body=list.length?list.map(vaultRow).join(''):'<div class="empty">Share a bill, warranty card, prescription, ticket, study PDF, link or ID photo — I will file it with a clear title.<br><br>Try: “My EB bill ₹840 due 12 Jan”.</div>';
 return bar+selbar+body;
}
let undoTimer=null,undoSnap=null;
function showUndo(msg,snap){undoSnap=snap;$('undotx').textContent=msg;$('undo').classList.add('show');clearTimeout(undoTimer);undoTimer=setTimeout(()=>{$('undo').classList.remove('show');undoSnap=null},6000)}
function snapshot(){return JSON.parse(JSON.stringify(items))}
function bulkDone(){if(!sel.size)return;const s=snapshot();let n=0;items.forEach(i=>{if(sel.has(i.id)&&i.type==='task'&&!i.done){setDoneSilent(i,true);n++}});sel.clear();persist();render();if(n)showUndo(`Marked ${n} done.`,s);else toast('Select tasks to mark done.')}
function setDoneSilent(i,v){i.done=v;i.doneAt=v?Date.now():null;if(v){Notify.cancel(i);if(i.rep&&i.due){const nx={...i,id:Date.now()+Math.random().toString(36).slice(2,5),nid:newNid(),done:false,doneAt:null,due:advance(i),created:Date.now()};items.unshift(nx);Notify.schedule(nx)}}else Notify.schedule(i)}
function bulkTomorrow(){if(!sel.size)return;const s=snapshot();const t=new Date();items.forEach(i=>{if(sel.has(i.id)&&i.due){const n=new Date(i.due);n.setFullYear(t.getFullYear(),t.getMonth(),t.getDate()+1);i.due=n.toISOString();Notify.schedule(i)}});sel.clear();persist();render();showUndo('Moved to tomorrow.',s)}
async function bulkShare(){if(!sel.size)return;const list=[...sel].map(id=>items.find(x=>x.id===id)).filter(Boolean);const txt=list.map(i=>`• ${i.text}${i.due?' ('+fmtDay(i.due)+')':''}`).join('\n');const full='Velora list:\n'+txt;try{if(navigator.share){await navigator.share({title:'Velora list',text:full});return}}catch(e){if(e&&e.name==='AbortError')return}try{await navigator.clipboard.writeText(full);toast('Copied '+list.length+' items.')}catch(e){toast('Could not share.')}}
function bulkClear(){if(!sel.size)return;sel.clear();persist();render();toast('Selection cleared.')}
function addTemplate(name){const list=TEMPLATES[name];if(!list)return;const s=snapshot();list.forEach(t=>{items.unshift({id:uid(),type:'task',text:t,due:null,allDay:false,done:false,created:Date.now(),nid:newNid()})});persist();render();showUndo(`Added “${name}” (${list.length} tasks).`,s)}
/* Vault part 2: save + Q&A ("what is my EB bill date") */
function saveVault(raw,img){
 const d=detectVault(raw);if(!d)return null;
 const it={id:uid(),type:'vault',vcat:d.cat,text:d.title,raw:String(raw).slice(0,2000),meta:d.meta||'',due:(d.cat==='bill'||d.cat==='sub'||d.cat==='warranty'||d.cat==='medical'||d.cat==='travel'||d.cat==='study')?d.due:null,allDay:true,done:false,created:Date.now(),nid:newNid(),img:img||null,url:d.url||''};
 items.unshift(it);if(it.due)Notify.schedule(it);persist();render();return it;
}
const vaultItems=()=>items.filter(i=>i.type==='vault'&&!i.done);
function vaultAnswer(raw){
 const t=raw.trim();
 if(/^(?:(?:show|list|open|find|check|get|give|tell)\s+(?:me\s+)?(?:my\s+|the\s+|all\s+)?|(?:my|the|all)\s+)(?:the\s+|all\s+)?(bills?|warrant(y|ies)|subscriptions?|subs?|ids?|id proofs?|medical|prescriptions?|reports?|travel|tickets?|bookings?|pnr|study(\s+material|\s+notes)?|links?|urls?|docs?|documents?|files?|vault)\b/i.test(t)){
  const cat=/bill/i.test(t)?'bill':/warrant/i.test(t)?'warranty':/subscri|subs?\b|netflix|prime |hotstar|spotify|renewal/i.test(t)?'sub':/\bid\b|aadhaar|pan card|passport|licen/i.test(t)?'id':/medical|prescription|report|doctor|hospital/i.test(t)?'medical':/travel|ticket|booking|pnr|flight|train/i.test(t)?'travel':/study|notes?/i.test(t)?'study':/link|url/i.test(t)?'url':/doc|file/i.test(t)?'doc':'all';
  view='vault';vaultFilter=cat;setTabs();render();
  const all=vaultItems(),list=cat==='all'?all:all.filter(i=>i.vcat===cat);
  if(!list.length)return say(`Your vault has no ${cat==='all'?'items yet':VCATS[cat]+'s yet'}. Share one and I will file it.`);
  return say(`<b>${cat==='all'?'Everything in your vault':VCATS[cat]+'s'}</b> (${list.length})`+list.slice(0,6).map(i=>li(VCATS[i.vcat]+(i.due?' · due '+fmtDay(i.due):''),i.text)).join(''));
 }
 const m=t.match(/(?:what(?:'s| is)|when(?:'s| is)|show|tell me|give me)?\s*(?:my\s+|the\s+)?(.+?)\s*(bill|due date|date|amount|expir(y|es|ation)|renewal|renew|renewing|link|url|pnr|prescription|report|note|notes|file|study material|warranty|subscription|ticket)\??$/i);
 if(m){
  const key=(m[1]+' '+m[2]).toLowerCase(),tk=toks(key);
  const cands=vaultItems().map(i=>[score(i,tk.length?tk:[key]),i]).filter(x=>x[0]).sort((a,b)=>b[0]-a[0]);
  if(cands.length){const[,i]=cands[0];view='vault';setTabs();render();flash(i.id);
   return say(`<b>${esc(i.text)}</b><div class="li"><b>${VCATS[i.vcat]}</b><span>${esc((i.raw||i.text).slice(0,160))}</span></div><div class="meta">${i.vcat==='bill'&&i.due?'Due <b>'+esc(fmt(i.due,i.allDay))+'</b>. ':''}${i.meta?esc(i.meta)+'. ':''}Saved ${fmtDay(new Date(i.created))}.${i.url?` <a href="${esc(i.url)}" target="_blank" rel="noopener">Open ↗</a>`:''}</div>`)}
  return say(`I couldn't find that in your vault. Try “show my bills”.`);
 }
 return null;
}

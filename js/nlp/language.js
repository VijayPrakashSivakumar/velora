/* Velora · nlp/language — local language understanding: repetition phrasing, tokenising, fuzzy match. */

/* ---------- Language understanding (local rules; swap for an AI model here) ---------- */
function rep(l){
 if(/\bevery ?weekday\b|\bweekdays\b/.test(l))return'weekdays';
 if(/\bevery ?day\b|\bdaily\b|\beach day\b|\bevery (morning|afternoon|evening)\b/.test(l))return'daily';
 if(/\bevery ?week\b|\bweekly\b|\bevery (sun|mon|tues|wednes|thurs|fri|satur)day\b/.test(l))return'weekly';
 if(/\bevery ?month\b|\bmonthly\b/.test(l))return'monthly';
 return null;
}
function when(l){
 const now=new Date();let day=null,time=null,m=l.match(/\bin (half an?|\d+|an?)\s*(minute|min|hour|hr)s?\b/);
 if(m){const n=m[1].startsWith('half')?.5:m[1][0]==='a'?1:+m[1];return{rel:new Date(now.getTime()+n*(/^h/.test(m[2])?36e5:6e4))}}
 const d=dayStart(now);
 if(/\btomorrow\b|நாளை|നാളെ/.test(l)){d.setDate(d.getDate()+1);day=d}
 else if(/\b(today|tonight|this (morning|afternoon|evening))\b|இன்று|ഇന്ന്/.test(l))day=d;
 else{const i=DAYS.findIndex(x=>new RegExp('\\b'+x+'\\b').test(l));if(i>=0){d.setDate(d.getDate()+((i-now.getDay()+7)%7||7));day=d}}
 m=l.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/)||l.match(/\bat (\d{1,2})(?::(\d{2}))?\b()/);
 if(m){let h=+m[1];if(m[3]==='pm'&&h<12)h+=12;if(m[3]==='am'&&h===12)h=0;if(!m[3]&&h<7)h+=12;if(h<24)time=[h,+(m[2]||0)]}
 else if(/\bnoon\b/.test(l))time=[12,0];
 else if(/\bmorning\b/.test(l))time=[9,0];
 else if(/\bafternoon\b/.test(l))time=[15,0];
 else if(/\b(evening|tonight)\b/.test(l))time=[19,0];
 return{day,time};
}
function compose(w){
 if(w.rel)return{due:w.rel.toISOString(),allDay:false};
 if(!w.day&&!w.time)return null;
 const d=w.day?new Date(w.day):new Date();
 if(w.time){d.setHours(w.time[0],w.time[1],0,0);if(!w.day&&d<new Date())d.setDate(d.getDate()+1);return{due:d.toISOString(),allDay:false}}
 return{due:d.toISOString(),allDay:true};
}
const strip=s=>s.replace(/\bevery ?(?:day|weekday|week|month|morning|afternoon|evening|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/ig,'').replace(/\b(?:daily|weekdays|weekly|monthly|each day)\b/ig,'').replace(/\b(this |in the |tomorrow )?(morning|afternoon|evening)\b/ig,'').replace(/\b(tomorrow|today|tonight|noon)\b/ig,'')
 .replace(/\b(on |by )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/ig,'').replace(/\b(at )?\d{1,2}(:\d{2})?\s*(am|pm)\b/ig,'')
 .replace(/\bat \d{1,2}(:\d{2})?\b/ig,'').replace(/\bin (half an?|\d+|an?)\s*(minute|min|hour|hr)s?\b/ig,'').replace(/\s+(at|on|by|for|in)\s*$/i,'').replace(/\s{2,}/g,' ').trim();
const toks=q=>String(q||'').toLowerCase().split(/[\s,.;:!?()\[\]{}"'“”‘’|/\\\-_]+/u).map(w=>w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'')).filter(w=>w&&(w.length>2||/[஀-௿ഀ-ൿ]/.test(w))&&!STOP.has(w));
const score=(i,t)=>t.reduce((n,w)=>n+(i.text.toLowerCase().includes(w)?1:0),0);
function matchOne(q,pool){const t=toks(q);if(!t.length)return null;let b=null,bs=0;pool.forEach(i=>{const s=score(i,t);if(s>bs){bs=s;b=i}});return b}


/* Velora · config.js — app-wide constants: environment, categories, keyword lists, schedule modes, templates. */

const DAYS=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const REPL={daily:'Daily',weekdays:'Weekdays',weekly:'Weekly',monthly:'Monthly'};
const STOP=new Set(['the','and','for','about','related','everything','all','with','from','that','this','what','have']);
const NATIVE=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
const DAYN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DEF=[
 {name:'Morning briefing',act:'briefing',type:'daily',time:'08:00',mode:3,enabled:true},
 {name:'End-of-day review',act:'eod',type:'daily',time:'18:30',mode:2,enabled:true},
 {name:'Roll over overdue tasks',act:'rollover',type:'daily',time:'07:00',mode:1,enabled:false},
 {name:'Weekly review',act:'review',type:'weekly',day:0,time:'18:00',mode:3,enabled:false},
 {name:'Clean up old completed tasks',act:'cleanup',type:'weekly',day:0,time:'20:00',mode:2,max:2,enabled:false}];
const MODES=[[1,'Suggest'],[2,'Ask first'],[3,'Auto']],stamp=t=>new Date(t).toLocaleString([],{weekday:'short',hour:'numeric',minute:'2-digit'});
const VOICE_LANGS=['en-US','en-IN','en-GB','ta-IN','ml-IN'];
const VCATS={bill:'Bill',warranty:'Warranty',sub:'Subscription',id:'ID',medical:'Medical',travel:'Travel',study:'Study',url:'Link',doc:'Doc',other:'Saved'};
/* Vault gate regex — shared between intents.js route() and vault-test.js.
   Kept here so the test is not coupled to intents.js source-code shape. */
var VAULT_GATE=/bill|vault|warrant|subscri|\bsub\b|renew|expir|pnr|prescription|\bticket\b|passport|aadhaar|pan card|licen[sc]e|medical|appointment|\bmy .*(date|amount|expiry|pnr|report|plan)\b/i;
const URL_RE=/(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/i;
const BILL_WORDS=['eb','electricity','tneb','tangedco','water bill','water can','gas bill','gas cylinder','broadband','wifi bill','mobile bill','recharge','rent','maintenance','emi','loan','credit card','insurance','property tax','bill','invoice','receipt','payment due','due date','amount due','units consumed','consumer no'];
const STUDY_WORDS=['chapter','lesson','syllabus','exam','hall ticket','question paper','assignment','notes','tutorial','course','subject','maths','physics','chemistry','biology','ncert','study'];
const SUB_WORDS=['subscription','netflix','amazon prime','prime video','hotstar','spotify','youtube premium','icloud','google one','gym membership','gym fee','gym renewal','membership','renewal','renews','expires subscription','plan expires','ott'];
const MED_WORDS=['prescription','doctor','hospital','clinic','tablet for','tablets','tablet strip','medicine','dosage','mg ','blood test','x-ray','xray','scan report','sugar level','bp reading','vaccine','dental','appointment with dr','medical'];
const TRAVEL_WORDS=['pnr','boarding pass','flight','train ticket','bus ticket','booking id','hotel booking','check-in','checkin','itinerary','seat no','coach no','platform','terminal','gate no'];
const ID_WORDS=['aadhaar','aadhar','pan card','voter id','driving licence','driving license','passport','ration card','id proof','license no','aadhaar no'];
const WAR_WORDS=['warranty','guarantee','invoice for tv','invoice for fridge','invoice for ac','invoice for washing','invoice for mobile','invoice for laptop','bill for tv','bill for fridge','bill for ac','bill for washing machine','purchased on','serial no','warranty till','warranty until'];
const MONTHS={january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11,jan:0,feb:1,mar:2,apr:3,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11};
const TEMPLATES={'Morning routine':['Brush + water','Make bed','Plan top 3','Healthy breakfast'],'Trip pack':['ID + tickets','Charger + power bank','Medicines','2 sets dress','Toilet kit'],'Study sprint':['Chapter read 25 min','Write key notes','5 practice questions','Revise yesterday']};

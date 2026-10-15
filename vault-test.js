const fs=require('fs');
const read=f=>fs.readFileSync(__dirname+'/'+f,'utf8');
const config=read('js/config.js');            /* VCATS, word lists, MONTHS, TEMPLATES, URL_RE */
let vault=read('js/vault/vault.js');          /* detectVault, saveVault, vaultAnswer, UI */
const intents=read('js/intents/intents.js');  /* route() — used for the Q&A gate assertion */

/* vault.js owns its view state internally; hoist it into this scope so the
   assertions can observe it (mirrors how the app state is stubbed below). */
const decl="let vaultFilter='all',sel=new Set(),selMode=false;";
if(!vault.includes(decl)) { console.error('vault state declaration not found — update vault-test.js'); process.exit(1) }
vault=vault.replace(decl,'/* vault view-state hoisted into test scope */');

/* ---- stubs for the app environment ---- */
var items=[],view='',vaultFilter='all',sel=new Set(),selMode=false,lastSay='',says=[];
global.window={};                              /* config.js probes window.Capacitor */
const cap=s=>String(s||'').charAt(0).toUpperCase()+String(s||'').slice(1);
const fmtDay=d=>new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
const esc=s=>String(s);
const fmt=(d,al)=>fmtDay(d);
const li=(a,b)=>`<div>${a}: ${b}</div>`;
const say=m=>{lastSay=String(m);says.push(lastSay);return 'ok'};
const toks=s=>String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').split(/\s+/).filter(Boolean);
const score=()=>1;
const setTabs=()=>{},render=()=>{},flash=()=>{},persist=()=>{},wfSyncAll=()=>{};
const uid=()=>'t'+Math.random().toString(36).slice(2,9);
const newNid=()=>Math.floor(Math.random()*1e6);
const Notify={schedule(){},cancel(){},syncAll(){},state:'web'};

eval(config+'\n'+vault);   /* exposes detectVault, vaultAnswer, saveVault … */

let pass=0,fail=0;
const eq=(name,got,want)=>{const ok=String(got)===String(want);
  if(ok)pass++;else{fail++;console.log(`FAIL ${name}\n  want: ${want}\n  got : ${got}`)}};

/* ---------- detectVault ---------- */
let d;
d=detectVault('TNEB electricity bill ₹1,250 due 25/10/2026 consumer no 123');
eq('bill cat',d&&d.cat,'bill'); eq('bill amount',d&&d.meta.includes('1250'),true); eq('bill due',!!(d&&d.due),true);

d=detectVault('Samsung TV warranty till 12/03/2027');
eq('warranty cat',d&&d.cat,'warranty'); eq('warranty due',!!(d&&d.due),true);

d=detectVault('Netflix subscription ₹199 renews 05/11/2026');
eq('sub cat',d&&d.cat,'sub'); eq('sub due',!!(d&&d.due),true);

d=detectVault('AADHAAR 1234 5678 9012 address copy');
eq('id cat',d&&d.cat,'id');

d=detectVault('renew passport before travel');
eq('renew passport stays a task',d,null);

d=detectVault('Prescription Dr Kumar 10/11/2026 tablet for 5 days');
eq('medical cat',d&&d.cat,'medical'); eq('medical due',!!(d&&d.due),true);

d=detectVault('Flight to Delhi 15/11/2026 PNR 4567891234');
eq('travel cat',d&&d.cat,'travel'); eq('travel pnr in title',/4567891234/.test(d.title),true);

d=detectVault('Physics notes chapter 5 for exam 20/11/2026');
eq('study cat',d&&d.cat,'study'); eq('study keeps due',!!(d&&d.due),true);

d=detectVault('hall ticket exam 12/11/2026');
eq('hall ticket -> study',d&&d.cat,'study');

d=detectVault('https://github.com/VijayPrakashSivakumar/velora');
eq('url cat',d&&d.cat,'url');

d=detectVault('go to gym in the morning');
eq('go to gym stays a task',d,null);

d=detectVault('buy a tablet');
eq('buy a tablet stays a task',d,null);

d=detectVault('report my progress to manager');
eq('report stays a task',d,null);

d=detectVault('study physics chapter 3');
eq('study text detected',d&&d.cat,'study');

d=detectVault('water can delivery 100');
eq('water can -> bill',d&&d.cat,'bill');

/* ---------- saveVault ---------- */
const saved=saveVault('EB electricity bill ₹870 due 12/11/2026');
eq('save type',saved&&saved.type,'vault'); eq('save vcat',saved&&saved.vcat,'bill'); eq('save due set',!!(saved&&saved.due),true);
const vitems=()=>items.filter(i=>i.type==='vault'&&!i.done);
eq('vault count',vitems().length,1);

/* ---------- vaultAnswer ---------- */
const answers=(q)=>{says=[];const r=vaultAnswer(q);return {r:!!r,said:says.length?lastSay:''}};

let a=answers('show my bills');
eq('show my bills answered',a.r,true); eq('show my bills switches view',view,'vault'); eq('show my bills filter',vaultFilter,'bill');

view='';
a=answers('show my vault');
eq('show my vault answered',a.r,true); eq('vault filter all',vaultFilter,'all');

view='';
a=answers('what is my eb bill date');
eq('bill date question answered',a.r,true);
eq('bill date names amount/due',/Due|due|₹|Nov|2026/.test(a.said),true);

view='';
a=answers('study physics chapter 3');
eq('study text NOT hijacked as query',a.r,false);

a=answers('report my progress to manager');
eq('report text NOT hijacked',a.r,false);

a=answers('show me my tasks');
eq('unrelated show-list falls through',a.r,false);

const sub=saveVault('Netflix subscription ₹199 renews 05/11/2026');
view='';
a=answers('when does my netflix renew');
eq('netflix renew question answered',a.r,true);

a=answers('go to gym in the morning');
eq('go to gym NOT a vault answer',a.r,false);

/* route trigger check: the same gate used before startCreate */
const gate=new RegExp(String(intents.match(/if\(\/(bill\|vault\|warrant[^\n]*?)\/i\.test\(l\)\)\{if\(vaultAnswer\(raw\)\)return\}/)[1]),'i');
eq('gate fires for netflix renew',gate.test('when does my netflix renew'),true);
eq('gate does not fire for study text',gate.test('study physics chapter 3'),false);
eq('gate does not fire for report task',gate.test('report my progress to manager'),false);
eq('gate fires for what is my bill date',gate.test('what is my eb bill date'),true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);

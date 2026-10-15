/* Velora boot smoke test — serves the repo over a loopback HTTP origin, loads
   index.html (and every js module in its real load order) inside jsdom, then
   asserts the app boots cleanly, accepts a typed task, and can switch into the
   Vault view. Complements vault-test.js. */
const fs=require('fs');
const path=require('path');
const http=require('http');
const {JSDOM,VirtualConsole}=require('jsdom');

const root=path.join(__dirname,'..');
const errors=[];
const vc=new VirtualConsole();
vc.on('jsdomError',e=>errors.push(String((e.detail&&e.detail.stack)||e.message||e)));
vc.on('error',(...a)=>errors.push('console.error: '+a.join(' ')));

const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webmanifest':'application/manifest+json','.json':'application/json'};

let pass=0,fail=0;
const t=(name,ok,got)=>{if(ok){pass++;console.log('ok   '+name)}else{fail++;console.log('FAIL '+name+(got!==undefined?'  — got: '+got:''))}};

(async()=>{
  const server=http.createServer((req,res)=>{
    const rel=decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'')||'index.html';
    const p=path.resolve(root,rel);
    if(!p.startsWith(root)){res.writeHead(403);return res.end()}
    fs.readFile(p,(e,buf)=>{
      if(e){res.writeHead(404);return res.end('not found')}
      res.writeHead(200,{'content-type':MIME[path.extname(p).toLowerCase()]||'application/octet-stream'});
      res.end(buf);
    });
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin='http://127.0.0.1:'+server.address().port;

  const dom=await JSDOM.fromURL(origin+'/index.html',{
    runScripts:'dangerously',
    resources:'usable',
    virtualConsole:vc,
    pretendToBeVisual:true
  });
  const w=dom.window;
  await new Promise((res,rej)=>{
    const to=setTimeout(()=>rej(new Error('load timeout. Errors:\n'+errors.join('\n'))),15000);
    w.addEventListener('load',()=>{clearTimeout(to);res()});
  });

  t('boot: no errors during load',errors.length===0,errors.join(' | '));
  t('boot: route() is global',typeof w.route==='function');
  t('boot: chat mounted',!!w.document.getElementById('chat'));
  t('boot: splash element present',!!w.document.getElementById('splash'));
  t('boot: items start empty',w.eval('items.length')===0,w.eval('items.length'));

  /* Typed task via the dock input — full pipeline: openAI → handle → route → commit → render */
  const input=w.document.getElementById('in');
  t('dock input exists',!!input);
  if(input){
    input.value='buy milk tomorrow';
    input.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter'}));
    t('typed task stored',w.eval('items.length')===1,w.eval('items.length'));
    t('typed task gets due date',w.eval('items[0].due!==null'));
    t('reply bubble shown',/Added/i.test(w.document.getElementById('chat').textContent));
    t('task row rendered',w.document.querySelectorAll('.row').length>=1);
  }

  /* Vault Q&A switches views and renders the vault list UI */
  t('vault Q&A answers',!!w.eval('vaultAnswer("show my bills")'));
  t('vault view active',w.eval('view')==='vault',w.eval('view'));
  t('vault filter bar rendered',!!w.document.querySelector('.vaultbar'));

  /* Detection sanity inside the real app scope (real config constants) */
  t('detect bill in app scope',w.eval('detectVault("TNEB bill 1250 due 25/10/2026").cat')==='bill',w.eval('detectVault("TNEB bill 1250 due 25/10/2026")&&detectVault("TNEB bill 1250 due 25/10/2026").cat'));
  t('task text stays a task',w.eval('detectVault("go to gym in the morning")===null'));

  w.close();
  server.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail?1:0);
})().catch(e=>{console.error('smoke test crashed:',e);process.exit(1)});

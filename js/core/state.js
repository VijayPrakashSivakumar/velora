/* Velora · core/state — localStorage keys, item store, settings, quota-safe persistence. */

try{if(!sessionStorage.getItem('vl.splash.t0'))sessionStorage.setItem('vl.splash.t0',String(Date.now()))}catch(e){}
const K='vl.items.v1',S='vl.set.v1',$=id=>document.getElementById(id);
const load=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?f:v}catch(e){return f}};
let items=load(K,null)||load('pa.items.v1',[]),set=load(S,{lang:''}),view='upcoming',pending=null,rec=null,errMsg='';
if(!Array.isArray(items))items=[];if(!set||typeof set!=='object')set={lang:''};
let nidc=0;const newNid=()=>Date.now()%2e9+(nidc++);items.forEach(i=>{if(!i.nid)i.nid=newNid()});
let quotaNoteShown=false;
/* Photo storage guard: images are the #1 quota killer (base64 in localStorage).
   On quota failure: compress old photo notes, then retry, then drop oldest. */
const IMG_BYTES=s=>s&&s.img?Math.round(s.img.length*0.75):0;
const persistRaw=()=>{localStorage.setItem(K,JSON.stringify(items));localStorage.setItem(S,JSON.stringify(set))};
function shrinkDataUrl(url,maxDim,quality){
 return new Promise(res=>{
  try{
   const im=new Image();
   im.onload=()=>{try{const s=Math.min(1,maxDim/Math.max(im.width||1,im.height||1));if(s>=1&&quality>=0.6){res(url);return}const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*s));c.height=Math.max(1,Math.round(im.height*s));c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',quality))}catch(e){res(url)}};
   im.onerror=()=>res(url);im.src=url;
  }catch(e){res(url)}
 });
}
async function autoCleanupPhotos(){
 let freed=0;
 const olds=items.filter(i=>i.img&&!i.done).sort((a,b)=>(a.created||0)-(b.created||0));
 for(const it of olds.slice(0,6)){
  const before=IMG_BYTES(it);
  it.img=await shrinkDataUrl(it.img,480,0.5);
  freed+=Math.max(0,before-IMG_BYTES(it));
  try{persistRaw();return{ok:true,freed,note:'Compressed older photo notes to free space.'}}catch(e){}
 }
 const donePhotos=items.filter(i=>i.img&&i.done).sort((a,b)=>(a.created||0)-(b.created||0));
 for(const it of donePhotos.slice(0,10)){
  freed+=IMG_BYTES(it);it.img=null;
  try{persistRaw();return{ok:true,freed,note:'Removed photos from completed notes to free space.'}}catch(e){}
 }
 return{ok:false,freed};
}
let persistBusy=false,persistQueued=false;
const persist=()=>{
 if(persistBusy){persistQueued=true;return}
 persistBusy=true;
 try{persistRaw()}
 catch(e){
  persistBusy=false;
  autoCleanupPhotos().then(r=>{
   if(r.ok){toast('Storage was full. '+r.note);try{persistRaw()}catch(e2){quotaFullMsg()}render()}
   else quotaFullMsg();
   if(persistQueued){persistQueued=false;persist()}
  });
  return;
 }
 persistBusy=false;
 if(persistQueued){persistQueued=false;persist()}
};
const quotaFullMsg=()=>{if(!quotaNoteShown){quotaNoteShown=true;toast('Storage is full. Export a backup, then delete old photo notes or clear completed items.')}else toast('Storage is still full. Delete an old photo note and try again.')};

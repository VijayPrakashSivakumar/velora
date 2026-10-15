/* Velora · features/media — photo notes (compress/attach). */

/* photo notes */
function shrink(f){return new Promise((res,rej)=>{const im=new Image(),u=URL.createObjectURL(f);
 im.onload=()=>{const s=Math.min(1,720/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.6))};
 im.onerror=rej;im.src=u})}
$('cam').onclick=()=>$('pf').click();
$('pf').onchange=async()=>{
 const f=$('pf').files[0];$('pf').value='';if(!f)return;
 try{const url=await shrink(f);
  const label=prompt('What is this photo? (e.g. EB bill Dec, Physics chapter 5, Aadhaar)');
  if(label&&detectVault(label)){const it=saveVault(label,url);if(it){view='vault';setTabs();render();toast('Filed in Vault: '+it.text);return}}
  const it={id:uid(),type:'note',text:(label||'Photo note').slice(0,120),due:null,allDay:false,done:false,created:Date.now(),nid:newNid(),img:url};
  items.unshift(it);persist();view='notes';setTabs();render();openEdit(it.id)}
 catch(e){toast('Could not read that photo')}
};

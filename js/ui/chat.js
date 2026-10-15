/* Velora · ui/chat — chat bubble builders (say/me/chips/yesno/li/st/orb). */

/* ---------- Chat UI helpers ---------- */
function say(html,qs){const b=document.createElement('div');b.className='b';b.innerHTML=html+(qs||'');$('chat').appendChild(b);$('chat').scrollTop=1e9;return b}
function me(t){const b=document.createElement('div');b.className='b me';b.textContent=t;$('chat').appendChild(b);$('chat').scrollTop=1e9}
const chips=a=>'<div class="qs">'+a.map(x=>`<button class="q" data-say="${esc(x)}">${esc(x)}</button>`).join('')+'</div>';
const yesno=l=>`<div class="qs"><button class="q go" data-act="yes">${l}</button><button class="q" data-act="no">Cancel</button></div>`;
const li=(a,b)=>`<div class="li"><b>${esc(a)}</b><span>${esc(b)}</span></div>`;
function st(m){$('st').textContent=m}
function orb(s){['omic','mic'].forEach(id=>{$(id).classList.remove('listen','think');if(s)$(id).classList.add(s)})}


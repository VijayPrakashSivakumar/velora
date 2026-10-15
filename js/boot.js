/* Velora · boot.js — final startup: first paint of the app (runs after every module has loaded). */

net();speed();render();Notify.init();renderAuto();runDue();catchUp();shareIn();hideSplash();setInterval(runDue,3e4);document.addEventListener('visibilitychange',()=>{if(document.hidden){try{localStorage.setItem('vl.seen',String(Date.now()))}catch(e){}}else{catchUp();runDue()}});

const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('#main-nav');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');}));
function nextApril18(){const now=new Date();let y=now.getFullYear();let d=new Date(y,3,18,0,0,0);if(now>=d)d=new Date(y+1,3,18,0,0,0);return d;}
function updateCountdown(){const el=document.querySelector('#countdown');if(!el)return;const diff=nextApril18()-new Date();const days=Math.ceil(diff/86400000);el.textContent=days===1?'Tomorrow':`${days} days`;}
updateCountdown();setInterval(updateCountdown,3600000);
document.querySelector('#year').textContent=new Date().getFullYear();

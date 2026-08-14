const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('#main-nav');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');}));
function nextApril18(){const now=new Date();let y=now.getFullYear();let d=new Date(y,3,18,0,0,0);if(now>=d)d=new Date(y+1,3,18,0,0,0);return d;}
function updateCountdown(){const el=document.querySelector('#countdown');if(!el)return;const diff=nextApril18()-new Date();const days=Math.ceil(diff/86400000);el.textContent=days===1?'Tomorrow':`${days} days`;}
updateCountdown();setInterval(updateCountdown,3600000);
const yearEl=document.querySelector('#year');if(yearEl)yearEl.textContent=new Date().getFullYear();

const storyForm=document.getElementById('dogtag-story-form');
const storyText=document.getElementById('story-text');
const storyWarning=document.getElementById('story-warning');
const storySubmit=document.getElementById('story-submit');

const blockedTerms=[
  /\bfuck(?:ing|ed|er|ers)?\b/i,
  /\bshit(?:ty|ting|ted)?\b/i,
  /\bbitch(?:es|ing)?\b/i,
  /\basshole(?:s)?\b/i,
  /\bcunt(?:s)?\b/i,
  /\bdick(?:head|heads|s)?\b/i,
  /\bcock(?:s)?\b/i,
  /\bpussy\b/i,
  /\bmotherfucker(?:s)?\b/i,
  /\bfaggot(?:s)?\b/i,
  /\bnigger(?:s)?\b/i,
  /\bslut(?:s)?\b/i,
  /\bwhore(?:s)?\b/i
];
const blockedThreats=[
  /\b(i|we)\s+(will|am going to|gonna)\s+(kill|shoot|stab|hurt|attack)\b/i,
  /\bkill\s+(you|him|her|them|everyone)\b/i
];
function pgCheck(value){
  const text=(value||'').trim();
  if(!text) return {ok:false,msg:'Please enter your story.'};
  if(blockedTerms.some(rx=>rx.test(text))) return {ok:false,msg:'Please remove inappropriate language. Dog Tag Day stories must be respectful and family-friendly.'};
  if(blockedThreats.some(rx=>rx.test(text))) return {ok:false,msg:'This story contains threatening language and cannot be submitted.'};
  return {ok:true,msg:''};
}
function updateStoryStatus(){
  if(!storyText||!storyWarning||!storySubmit) return true;
  const result=pgCheck(storyText.value);
  const hasText=storyText.value.trim().length>0;
  storyWarning.textContent=hasText ? result.msg : '';
  storyWarning.style.fontWeight=result.ok ? 'normal' : '700';
  storySubmit.disabled=hasText && !result.ok;
  storySubmit.setAttribute('aria-disabled', String(hasText && !result.ok));
  return result.ok;
}
storyText?.addEventListener('input', updateStoryStatus);
storyForm?.addEventListener('submit',(event)=>{
  const result=pgCheck(storyText?.value);
  if(!result.ok){
    event.preventDefault();
    if(storyWarning) storyWarning.textContent=result.msg;
    storyText?.focus();
  }
});

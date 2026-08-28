const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('#main-nav');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');}));

function nextApril18(){const now=new Date();let y=now.getFullYear();let d=new Date(y,3,18);if(now>=d)d=new Date(y+1,3,18);return d;}
function updateCountdown(){const el=document.querySelector('#countdown');if(!el)return;const days=Math.ceil((nextApril18()-new Date())/86400000);el.textContent=days===1?'Tomorrow':`${days} days`;}
updateCountdown();setInterval(updateCountdown,3600000);
const yearEl=document.querySelector('#year');if(yearEl)yearEl.textContent=new Date().getFullYear();

const storyForm=document.querySelector('form.form-shell[action*="formspree.io"]');
const storyText=storyForm?.querySelector('textarea[name="message"]');
const storySubmit=storyForm?.querySelector('button[type="submit"]');
const blockedTerms=[/\bfuck(?:ing|ed|er|ers)?\b/i,/\bshit(?:ty|ting|ted)?\b/i,/\bbitch(?:es|ing)?\b/i,/\basshole(?:s)?\b/i,/\bcunt(?:s)?\b/i,/\bdick(?:head|heads|s)?\b/i,/\bcock(?:s)?\b/i,/\bpussy\b/i,/\bmotherfucker(?:s)?\b/i,/\bfaggot(?:s)?\b/i,/\bnigger(?:s)?\b/i,/\bslut(?:s)?\b/i,/\bwhore(?:s)?\b/i];
const blockedThreats=[/\b(i|we)\s+(will|am going to|gonna)\s+(kill|shoot|stab|hurt|attack)\b/i,/\bkill\s+(you|him|her|them|everyone)\b/i];
function pgCheck(value){const text=(value||'').trim();if(!text)return{ok:false,msg:'Please enter your story.'};if(blockedTerms.some(rx=>rx.test(text)))return{ok:false,msg:'Please remove inappropriate language. Dog Tag Day stories must be respectful and family-friendly.'};if(blockedThreats.some(rx=>rx.test(text)))return{ok:false,msg:'This story contains threatening language and cannot be submitted.'};return{ok:true,msg:''};}
function receiptId(){return `DTD-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;}

let storyWarning=null;
if(storyForm){
  storyForm.id='dogtag-story-form';
  if(storyText)storyText.id='story-text';
  if(storySubmit){storySubmit.id='story-submit';storySubmit.textContent='Submit My Story';}
  const emailInput=storyForm.querySelector('input[name="email"]');
  if(emailInput){emailInput.required=true;emailInput.placeholder='Your email — kept private';emailInput.autocomplete='email';}
  const nameInput=storyForm.querySelector('input[name="name"]');if(nameInput)nameInput.autocomplete='name';
  let subject=storyForm.querySelector('input[name="subject"]');
  if(!subject){subject=document.createElement('input');subject.type='hidden';subject.name='subject';subject.value='Dog Tag Day Story';storyForm.appendChild(subject);}
  let gotcha=storyForm.querySelector('input[name="_gotcha"]');
  if(!gotcha){gotcha=document.createElement('input');gotcha.type='text';gotcha.name='_gotcha';gotcha.tabIndex=-1;gotcha.autocomplete='off';gotcha.setAttribute('aria-hidden','true');gotcha.style.position='absolute';gotcha.style.left='-10000px';gotcha.style.width='1px';gotcha.style.height='1px';storyForm.appendChild(gotcha);}
  let source=storyForm.querySelector('input[name="source"]');
  if(!source){source=document.createElement('input');source.type='hidden';source.name='source';source.value='DogTagDay.org — Share Your Story';storyForm.appendChild(source);}
  const permission=storyForm.querySelector('input[name="permission"]');
  if(permission){permission.required=true;const span=permission.parentElement?.querySelector('span');if(span)span.textContent='I give Dog Tag Day permission to publish this story publicly on DogTagDay.org. My email address will remain private.';}
  const fineprint=storyForm.querySelector('.fineprint');
  if(fineprint)fineprint.textContent='Your email is used only to confirm or follow up on your submission and is never displayed on the public story wall. Family-friendly content only.';
  const eyebrow=storyForm.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='Add a Story to the National Wall';
  const heading=storyForm.querySelector('h3');if(heading)heading.textContent='Tell us the story behind the tags.';
  storyWarning=document.createElement('p');storyWarning.id='story-warning';storyWarning.setAttribute('role','status');storyWarning.style.minHeight='1.5em';storyWarning.style.marginTop='12px';storyWarning.style.fontWeight='700';storySubmit?.before(storyWarning);
}

storyText?.addEventListener('input',()=>{if(!storyWarning)return;const r=pgCheck(storyText.value);storyWarning.textContent=storyText.value.trim()?r.msg:'';if(storySubmit)storySubmit.disabled=!r.ok&&!!storyText.value.trim();});

storyForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  const check=pgCheck(storyText?.value);
  if(!check.ok){if(storyWarning)storyWarning.textContent=check.msg;storyText?.focus();return;}
  const fd=new FormData(storyForm);
  const rid=receiptId();
  fd.set('receipt',rid);
  fd.set('submitted_at',new Date().toISOString());
  fd.set('source','DogTagDay.org — Share Your Story');
  fd.set('subject',`Dog Tag Day Story — ${fd.get('name')||'Website visitor'}`);
  const backup={receipt:rid,created:new Date().toISOString(),name:fd.get('name')||'',email:fd.get('email')||'',connection:fd.get('connection')||'',message:fd.get('message')||'',permission:fd.get('permission')||''};
  try{localStorage.setItem(`dogtagday-story-${rid}`,JSON.stringify(backup));}catch(e){}
  if(storySubmit){storySubmit.disabled=true;storySubmit.textContent='Sending…';}
  if(storyWarning)storyWarning.textContent='Sending your story…';
  try{
    const response=await fetch(storyForm.action,{method:'POST',body:fd,headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error(`Submission service returned ${response.status}`);
    if(storyWarning)storyWarning.textContent=`Story received. Save this receipt: ${rid}`;
    storyForm.reset();
    if(storySubmit)storySubmit.textContent='Story Received ✓';
    setTimeout(()=>{if(storySubmit){storySubmit.disabled=false;storySubmit.textContent='Submit My Story';}},5000);
  }catch(err){
    if(storyWarning)storyWarning.textContent=`Your story was NOT confirmed. Nothing was erased. Receipt ${rid} was saved on this device so you can retry.`;
    if(storySubmit){storySubmit.disabled=false;storySubmit.textContent='Retry Submission';}
    console.error('Story submission failed',err);
  }
});

const publishedStories=[
  {title:'In Memory of James Calhoun Houston',body:`Lena Pendleton — Daughter of a Veteran\n\nI would like to honor and remember my Dad. A man who meant so much to so many and whose life left a lasting mark on everyone fortunate enough to know him.\n\nMy Dad proudly served in the United States Air Force. His service was a reflection of the kind of man he was: dedicated, courageous, dependable and willing to put others before himself. He carried that same sense of duty and strength into every part of his life.\n\nHe was the person whose presence helped shape who I am, whose lessons I will carry with me for the rest of my life. I will remember the things he taught me—not only through his words, but through the way he lived his life.\n\nDad, you served your country with honor. You loved your family with all your heart and you will never be forgotten.\n\nContinue to rest peacefully, Dad. Until we meet again. Always, your little girl, Lena Joyce`},
  {title:'A salute to everyone who served',body:`Willie Beard III — Family\n\nI want to salute everyone that has ever served in the Military. The sacrifice every one of you made is priceless. I have family—my nephew—currently active in the Navy, and a brother from another mother who went to Iraq and Afghanistan. They made it home; a lot of people did not. May Jesus bless everyone currently serving our country.`},
  {title:'With gratitude for those who served',body:`Willie Beard III — Family\n\nTo all the men and women who have served in the United States military, thank you for your immeasurable sacrifices. I am deeply proud of my nephew currently serving in the Navy, and a close friend who bravely served in Iraq and Afghanistan. While I am thankful for their safe return, I honor and remember those who made the ultimate sacrifice. May God bless all who are actively serving our nation today.\n\nRespectfully,\nWillie Beard III`}
];

const storySection=document.querySelector('section.stories#story');
if(storySection){
  storySection.querySelectorAll('#published-stories,.story-search-controls,#story-count').forEach(el=>el.remove());
  const legacy=[...storySection.querySelectorAll('.story-grid')];legacy.forEach(grid=>grid.remove());
  const lead=storySection.querySelector('.story-lead');if(lead)lead.textContent='Real stories shared with permission. Every published story remains visible here without relying on a third-party feed.';
  const controls=document.createElement('div');controls.className='story-search-controls';controls.style.margin='28px 0 18px';
  const search=document.createElement('input');search.type='search';search.placeholder='Search stories by name or keyword';search.setAttribute('aria-label','Search community stories');search.style.width='100%';search.style.maxWidth='620px';search.style.padding='14px 16px';search.style.borderRadius='8px';search.style.border='1px solid currentColor';controls.appendChild(search);
  const heading=document.createElement('h3');heading.textContent='Community Stories';heading.style.marginTop='28px';
  const count=document.createElement('p');count.id='story-count';count.style.fontWeight='700';count.textContent=`${publishedStories.length} published stories — shared with permission.`;
  const wall=document.createElement('div');wall.id='published-stories';wall.className='story-grid';
  publishedStories.forEach((s,i)=>{const article=document.createElement('article');article.dataset.search=(s.title+' '+s.body).toLowerCase();const h=document.createElement('h3');h.textContent=s.title;const p=document.createElement('p');p.style.whiteSpace='pre-line';p.textContent=s.body;const honor=document.createElement('button');honor.type='button';honor.className='button secondary';honor.style.marginTop='14px';const key=`dogtagday-honor-static-${i}`;const sync=()=>{const on=localStorage.getItem(key)==='1';honor.textContent=on?'❤️ Honored':'♡ Honor This Story';honor.setAttribute('aria-pressed',String(on));};honor.addEventListener('click',()=>{localStorage.getItem(key)==='1'?localStorage.removeItem(key):localStorage.setItem(key,'1');sync();});sync();article.append(h,p,honor);wall.appendChild(article);});
  search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();wall.querySelectorAll('article').forEach(a=>a.hidden=!!q&&!a.dataset.search.includes(q));});
  const form=storySection.querySelector('form.form-shell');if(form)form.before(controls,heading,count,wall);else storySection.append(controls,heading,count,wall);
}

const heroStoryButton=document.querySelector('.hero-command .cta-row a[href="#story"]');if(heroStoryButton)heroStoryButton.style.display='none';

if(!document.querySelector('#story-quick-invite')){const invite=document.createElement('div');invite.id='story-quick-invite';invite.style.position='fixed';invite.style.left='12px';invite.style.right='12px';invite.style.bottom='12px';invite.style.zIndex='9999';invite.style.maxWidth='760px';invite.style.margin='0 auto';invite.style.padding='14px 16px';invite.style.borderRadius='12px';invite.style.boxShadow='0 8px 28px rgba(0,0,0,.28)';invite.style.background='#111';invite.style.color='#fff';invite.style.display='flex';invite.style.alignItems='center';invite.style.justifyContent='space-between';invite.style.gap='12px';invite.style.flexWrap='wrap';const copy=document.createElement('div');copy.innerHTML='<strong>Help build America’s Dog Tag Day story wall.</strong><br><span style="font-size:.95em">Veteran, family member, or friend — add one real story.</span>';const link=document.createElement('a');link.href='#story';link.className='button primary';link.textContent='Add a Story';const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Close story invitation');close.style.border='0';close.style.background='transparent';close.style.color='#fff';close.style.fontSize='24px';close.addEventListener('click',()=>invite.remove());invite.append(copy,link,close);document.body.appendChild(invite);}

const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('#main-nav');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');}));

function nextApril18(){const now=new Date();let y=now.getFullYear();let d=new Date(y,3,18,0,0,0);if(now>=d)d=new Date(y+1,3,18,0,0,0);return d;}
function updateCountdown(){const el=document.querySelector('#countdown');if(!el)return;const diff=nextApril18()-new Date();const days=Math.ceil(diff/86400000);el.textContent=days===1?'Tomorrow':`${days} days`;}
updateCountdown();setInterval(updateCountdown,3600000);
const yearEl=document.querySelector('#year');if(yearEl)yearEl.textContent=new Date().getFullYear();

const storyForm=document.querySelector('form.form-shell[action*="formspree.io"]');
const storyText=storyForm?.querySelector('textarea[name="message"]');
const storySubmit=storyForm?.querySelector('button[type="submit"]');

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

let storyWarning=null;
if(storyForm){
  storyForm.id='dogtag-story-form';
  if(storyText) storyText.id='story-text';
  if(storySubmit) storySubmit.id='story-submit';

  // Public stories must never expose an email address through the public GitHub issue feed.
  const emailInput=storyForm.querySelector('input[name="email"]');
  emailInput?.closest('div')?.remove();

  let subject=storyForm.querySelector('input[name="subject"]');
  if(!subject){subject=document.createElement('input');subject.type='hidden';subject.name='subject';subject.value='Dog Tag Day Story';storyForm.appendChild(subject);}

  const permission=storyForm.querySelector('input[name="permission"]');
  if(permission){
    permission.required=true;
    const permissionText=permission.parentElement?.querySelector('span');
    if(permissionText) permissionText.textContent='I give Dog Tag Day permission to publish this story publicly on DogTagDay.org. I understand it may be removed later if it violates community standards.';
  }

  const fineprint=storyForm.querySelector('.fineprint');
  if(fineprint) fineprint.textContent='Approved family-friendly submissions are intended for public display on DogTagDay.org. Do not include private contact information, addresses, phone numbers, or sensitive personal information.';

  storyWarning=document.createElement('p');
  storyWarning.id='story-warning';
  storyWarning.setAttribute('role','alert');
  storyWarning.style.minHeight='1.5em';
  storyWarning.style.marginTop='12px';
  storySubmit?.before(storyWarning);
}

function updateStoryStatus(){
  if(!storyText||!storyWarning||!storySubmit) return true;
  const result=pgCheck(storyText.value);
  const hasText=storyText.value.trim().length>0;
  storyWarning.textContent=hasText ? result.msg : '';
  storyWarning.style.fontWeight=result.ok ? 'normal' : '700';
  storySubmit.disabled=hasText && !result.ok;
  storySubmit.setAttribute('aria-disabled',String(hasText && !result.ok));
  return result.ok;
}
storyText?.addEventListener('input',updateStoryStatus);
storyForm?.addEventListener('submit',(event)=>{
  const result=pgCheck(storyText?.value);
  if(!result.ok){
    event.preventDefault();
    if(storyWarning) storyWarning.textContent=result.msg;
    storyText?.focus();
  }
});

// Public Story Wall: Formspree's GitHub workflow creates public issues in this repository.
// The site reads those issues and displays them without publishing email addresses or private fields.
const storySection=document.querySelector('section.stories#story');
let storyWall=null;
let loadMore=null;
let storiesPage=1;
const storiesPerPage=30;

if(storySection){
  const lead=storySection.querySelector('.story-lead');
  if(lead) lead.textContent='Stories shared with permission appear here publicly. Family-friendly submissions may be removed if they violate community standards.';

  const wallHeading=document.createElement('h3');
  wallHeading.textContent='Community Stories';
  wallHeading.style.marginTop='48px';

  storyWall=document.createElement('div');
  storyWall.id='published-stories';
  storyWall.className='story-grid';
  storyWall.setAttribute('aria-live','polite');

  loadMore=document.createElement('button');
  loadMore.type='button';
  loadMore.className='button secondary';
  loadMore.textContent='Load More Stories';
  loadMore.style.marginTop='20px';
  loadMore.hidden=true;

  const form=storySection.querySelector('form.form-shell');
  if(form){form.before(wallHeading,storyWall,loadMore);}else{storySection.append(wallHeading,storyWall,loadMore);}
}

function cleanIssueBody(body){
  return (body||'')
    .split(/\r?\n/)
    .filter(line=>!/(^|\||\*\*)\s*(email|e-mail|permission|subject|tags)\s*(:|\||\*\*)/i.test(line))
    .filter(line=>!/formspree/i.test(line))
    .join('\n')
    .replace(/^#+\s*/gm,'')
    .replace(/\*\*/g,'')
    .replace(/`/g,'')
    .trim();
}

function renderStory(issue){
  if(!storyWall||!issue||issue.pull_request) return;
  const article=document.createElement('article');
  const title=document.createElement('h3');
  title.textContent=(issue.title||'Dog Tag Day Story').replace(/^Dog Tag Day Story\s*[-—:]?\s*/i,'')||'Dog Tag Day Story';
  const text=document.createElement('p');
  text.style.whiteSpace='pre-line';
  text.textContent=cleanIssueBody(issue.body)||'A Dog Tag Day community story.';
  article.append(title,text);
  storyWall.appendChild(article);
}

async function loadStories(reset=false){
  if(!storyWall) return;
  if(reset){storiesPage=1;storyWall.innerHTML='';}
  if(loadMore){loadMore.disabled=true;loadMore.textContent='Loading…';}
  try{
    const url=`https://api.github.com/repos/rshure001/DogTagDay/issues?state=open&labels=formspree&sort=created&direction=desc&per_page=${storiesPerPage}&page=${storiesPage}`;
    const response=await fetch(url,{headers:{Accept:'application/vnd.github+json'}});
    if(!response.ok) throw new Error(`GitHub ${response.status}`);
    const issues=await response.json();
    const stories=issues.filter(issue=>!issue.pull_request);
    stories.forEach(renderStory);
    if(reset&&stories.length===0){
      const empty=document.createElement('p');
      empty.textContent='The first community stories will appear here as they are submitted.';
      storyWall.appendChild(empty);
    }
    if(loadMore){
      loadMore.hidden=issues.length<storiesPerPage;
      loadMore.disabled=false;
      loadMore.textContent='Load More Stories';
    }
    if(issues.length===storiesPerPage) storiesPage+=1;
  }catch(error){
    if(reset){
      const note=document.createElement('p');
      note.textContent='Community stories are temporarily unavailable. Please check back shortly.';
      storyWall.appendChild(note);
    }
    if(loadMore){loadMore.hidden=true;loadMore.disabled=false;loadMore.textContent='Load More Stories';}
    console.error('Story wall load failed',error);
  }
}
loadMore?.addEventListener('click',()=>loadStories(false));
loadStories(true);

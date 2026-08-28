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
const blockedTerms=[/\bfuck(?:ing|ed|er|ers)?\b/i,/\bshit(?:ty|ting|ted)?\b/i,/\bbitch(?:es|ing)?\b/i,/\basshole(?:s)?\b/i,/\bcunt(?:s)?\b/i,/\bdick(?:head|heads|s)?\b/i,/\bcock(?:s)?\b/i,/\bpussy\b/i,/\bmotherfucker(?:s)?\b/i,/\bfaggot(?:s)?\b/i,/\bnigger(?:s)?\b/i,/\bslut(?:s)?\b/i,/\bwhore(?:s)?\b/i];
const blockedThreats=[/\b(i|we)\s+(will|am going to|gonna)\s+(kill|shoot|stab|hurt|attack)\b/i,/\bkill\s+(you|him|her|them|everyone)\b/i];
function pgCheck(value){const text=(value||'').trim();if(!text)return{ok:false,msg:'Please enter your story.'};if(blockedTerms.some(rx=>rx.test(text)))return{ok:false,msg:'Please remove inappropriate language. Dog Tag Day stories must be respectful and family-friendly.'};if(blockedThreats.some(rx=>rx.test(text)))return{ok:false,msg:'This story contains threatening language and cannot be submitted.'};return{ok:true,msg:''};}
let storyWarning=null;
if(storyForm){
  storyForm.id='dogtag-story-form';
  if(storyText)storyText.id='story-text';
  if(storySubmit)storySubmit.id='story-submit';
  const emailInput=storyForm.querySelector('input[name="email"]');
  if(emailInput)emailInput.required=true;
  let subject=storyForm.querySelector('input[name="subject"]');
  if(!subject){subject=document.createElement('input');subject.type='hidden';subject.name='subject';subject.value='Dog Tag Day Story';storyForm.appendChild(subject);}
  const permission=storyForm.querySelector('input[name="permission"]');
  if(permission){permission.required=true;const permissionText=permission.parentElement?.querySelector('span');if(permissionText)permissionText.textContent='I give Dog Tag Day permission to publish this story publicly on DogTagDay.org. I understand it may be removed later if it violates community standards.';}
  const fineprint=storyForm.querySelector('.fineprint');
  if(fineprint)fineprint.textContent='Approved family-friendly submissions are intended for public display on DogTagDay.org. Your email address is kept private and is never displayed publicly.';
  storyWarning=document.createElement('p');storyWarning.id='story-warning';storyWarning.setAttribute('role','alert');storyWarning.style.minHeight='1.5em';storyWarning.style.marginTop='12px';storySubmit?.before(storyWarning);
}
function updateStoryStatus(){if(!storyText||!storyWarning||!storySubmit)return true;const result=pgCheck(storyText.value);const hasText=storyText.value.trim().length>0;storyWarning.textContent=hasText?result.msg:'';storyWarning.style.fontWeight=result.ok?'normal':'700';storySubmit.disabled=hasText&&!result.ok;storySubmit.setAttribute('aria-disabled',String(hasText&&!result.ok));return result.ok;}
storyText?.addEventListener('input',updateStoryStatus);
storyForm?.addEventListener('submit',event=>{const result=pgCheck(storyText?.value);if(!result.ok){event.preventDefault();if(storyWarning)storyWarning.textContent=result.msg;storyText?.focus();}});

const storySection=document.querySelector('section.stories#story');
let storyWall=storySection?.querySelector('#published-stories')||null;
let loadMore=null,searchBox=null,storyCount=null,storiesPage=1;
const storiesPerPage=30;
const seenStories=new Set();

function indexExistingStories(){
  if(!storyWall)return;
  storyWall.querySelectorAll('article').forEach(article=>{
    article.dataset.search=(article.textContent||'').toLowerCase();
    const key=(article.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(key)seenStories.add(key);
  });
}

if(storySection&&storyWall){
  indexExistingStories();
  const lead=storySection.querySelector('.story-lead');
  if(lead)lead.textContent='Real stories shared with permission. Dog Tag Day is building this national story wall one veteran, one family, and one memory at a time.';
  const controls=document.createElement('div');controls.style.margin='28px 0 18px';
  searchBox=document.createElement('input');searchBox.type='search';searchBox.placeholder='Search stories by name or keyword';searchBox.setAttribute('aria-label','Search community stories');searchBox.style.width='100%';searchBox.style.maxWidth='620px';searchBox.style.padding='14px 16px';searchBox.style.borderRadius='8px';searchBox.style.border='1px solid currentColor';controls.appendChild(searchBox);
  storyCount=document.createElement('p');storyCount.style.margin='8px 0 20px';storyCount.style.fontWeight='700';storyCount.textContent=`${storyWall.querySelectorAll('article').length} published stories — every story on this wall was shared with permission.`;
  loadMore=document.createElement('button');loadMore.type='button';loadMore.className='button secondary';loadMore.textContent='Load More Stories';loadMore.style.marginTop='20px';loadMore.hidden=true;
  storyWall.before(controls,storyCount);storyWall.after(loadMore);
}

function cleanIssueBody(body){return(body||'').split(/\r?\n/).filter(line=>!/(^|\||\*\*)\s*(email|e-mail|permission|subject|tags)\s*(:|\||\*\*)/i.test(line)).filter(line=>!/formspree/i.test(line)).join('\n').replace(/^#+\s*/gm,'').replace(/\*\*/g,'').replace(/`/g,'').trim();}
function issueKey(issue){return`${(issue.title||'').trim().toLowerCase()}|${cleanIssueBody(issue.body).replace(/\s+/g,' ').trim().toLowerCase()}`;}
function renderIssue(issue){if(!storyWall||!issue||issue.pull_request)return;const key=issueKey(issue);if(seenStories.has(key))return;seenStories.add(key);const article=document.createElement('article');article.dataset.search=((issue.title||'')+' '+cleanIssueBody(issue.body)).toLowerCase();const title=document.createElement('h3');title.textContent=(issue.title||'Dog Tag Day Story').replace(/^Dog Tag Day Story\s*[-—:]?\s*/i,'')||'Dog Tag Day Story';const text=document.createElement('p');text.style.whiteSpace='pre-line';text.textContent=cleanIssueBody(issue.body)||'A Dog Tag Day community story.';article.append(title,text);storyWall.appendChild(article);}
function filterStories(){if(!storyWall)return;const q=(searchBox?.value||'').trim().toLowerCase();storyWall.querySelectorAll('article').forEach(article=>{article.hidden=!!q&&!((article.dataset.search||article.textContent||'').toLowerCase().includes(q));});}
searchBox?.addEventListener('input',filterStories);

async function loadStories(reset=false){
  if(!storyWall)return;
  try{
    const page=reset?1:storiesPage;
    const url=`https://api.github.com/repos/rshure001/DogTagDay/issues?state=open&labels=formspree&sort=created&direction=desc&per_page=${storiesPerPage}&page=${page}`;
    const response=await fetch(url,{headers:{Accept:'application/vnd.github+json'}});
    if(!response.ok)throw new Error(`GitHub ${response.status}`);
    const issues=(await response.json()).filter(issue=>!issue.pull_request);
    if(reset&&issues.length){storyWall.innerHTML='';seenStories.clear();}
    issues.forEach(renderIssue);
    if(storyCount){const count=storyWall.querySelectorAll('article').length;storyCount.textContent=`${count} published ${count===1?'story':'stories'} — every story on this wall was shared with permission.`;}
    if(loadMore)loadMore.hidden=issues.length<storiesPerPage;
    if(issues.length===storiesPerPage)storiesPage=page+1;
    filterStories();
  }catch(error){
    if(storyCount){const count=storyWall.querySelectorAll('article').length;storyCount.textContent=`${count} published ${count===1?'story':'stories'} — verified stories remain available even if the live feed is temporarily unavailable.`;}
    console.error('Story wall load failed',error);
  }
}
loadMore?.addEventListener('click',()=>loadStories(false));
loadStories(true);

if(storyForm){
  const formEyebrow=storyForm.querySelector('.eyebrow');if(formEyebrow)formEyebrow.textContent='Add a Story to the National Wall';
  const formHeading=storyForm.querySelector('h3');if(formHeading)formHeading.textContent='Tell us the story behind the tags.';
  const connectionInput=storyForm.querySelector('input[name="connection"]');if(connectionInput)connectionInput.placeholder='Veteran, family member, friend, supporter — optional';
  if(storyText)storyText.placeholder='A few sentences is enough. Tell us who served, what the tags mean, or who you want America to remember.';
  if(storySubmit)storySubmit.textContent='Add My Story';
}

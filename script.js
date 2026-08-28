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
function pgCheck(value){const text=(value||'').trim();if(!text)return{ok:false,msg:'Please enter your story.'};return{ok:true,msg:''};}
function receiptId(){return`DTD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;}
function saveRecovery(record){try{const key='dogtagday-story-recovery';const old=JSON.parse(localStorage.getItem(key)||'[]');old.push(record);localStorage.setItem(key,JSON.stringify(old.slice(-50)));}catch(e){console.warn('Local recovery unavailable',e);}}
let storyWarning=null;
if(storyForm){
  storyForm.id='dogtag-story-form';
  if(storyText)storyText.id='story-text';
  if(storySubmit)storySubmit.id='story-submit';
  const emailInput=storyForm.querySelector('input[name="email"]');if(emailInput)emailInput.required=true;
  let subject=storyForm.querySelector('input[name="subject"]');if(!subject){subject=document.createElement('input');subject.type='hidden';subject.name='subject';storyForm.appendChild(subject);}subject.value='Dog Tag Day Story';
  let source=storyForm.querySelector('input[name="source"]');if(!source){source=document.createElement('input');source.type='hidden';source.name='source';source.value='DogTagDay.org story wall';storyForm.appendChild(source);}
  let gotcha=storyForm.querySelector('input[name="_gotcha"]');if(!gotcha){gotcha=document.createElement('input');gotcha.type='text';gotcha.name='_gotcha';gotcha.tabIndex=-1;gotcha.autocomplete='off';gotcha.style.position='absolute';gotcha.style.left='-9999px';gotcha.setAttribute('aria-hidden','true');storyForm.appendChild(gotcha);}
  const permission=storyForm.querySelector('input[name="permission"]');if(permission)permission.required=true;
  storyWarning=document.createElement('p');storyWarning.id='story-warning';storyWarning.setAttribute('role','status');storyWarning.setAttribute('aria-live','polite');storyWarning.style.minHeight='1.5em';storyWarning.style.marginTop='12px';storySubmit?.before(storyWarning);
}
function updateStoryStatus(){if(!storyText||!storyWarning||!storySubmit)return true;const result=pgCheck(storyText.value);const hasText=storyText.value.trim().length>0;storyWarning.textContent=hasText?result.msg:'';storyWarning.style.fontWeight=result.ok?'normal':'700';storySubmit.disabled=hasText&&!result.ok;storySubmit.setAttribute('aria-disabled',String(hasText&&!result.ok));return result.ok;}
storyText?.addEventListener('input',updateStoryStatus);

storyForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  const result=pgCheck(storyText?.value);if(!result.ok){if(storyWarning)storyWarning.textContent=result.msg;storyText?.focus();return;}
  if(!storyForm.reportValidity())return;
  const receipt=receiptId();const submittedAt=new Date().toISOString();const data=new FormData(storyForm);data.set('receipt',receipt);data.set('submitted_at',submittedAt);
  const recovery={receipt,submitted_at:submittedAt,name:data.get('name')||'',email:data.get('email')||'',connection:data.get('connection')||'',message:data.get('message')||'',permission:data.get('permission')||''};saveRecovery(recovery);
  if(storySubmit){storySubmit.disabled=true;storySubmit.textContent='Posting Story…';}
  if(storyWarning){storyWarning.textContent=`Posting your story — receipt ${receipt}`;storyWarning.style.fontWeight='700';}
  try{
    const response=await fetch(storyForm.action,{method:'POST',body:data,headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error(`Formspree ${response.status}`);
    storyForm.reset();
    if(storyWarning){storyWarning.textContent=`Story received for the public Dog Tag Day story wall. Receipt: ${receipt}.`;storyWarning.style.fontWeight='700';}
  }catch(error){
    if(storyWarning){storyWarning.textContent=`Your story was NOT confirmed by the server. Recovery receipt: ${receipt}. Please try Submit again; a recovery copy remains on this device.`;storyWarning.style.fontWeight='700';}
    console.error('Story submission failed',error);
  }finally{if(storySubmit){storySubmit.disabled=false;storySubmit.textContent='Post My Story';}}
});

const storySection=document.querySelector('section.stories#story');let storyWall=storySection?.querySelector('#published-stories')||null;let loadMore=null,searchBox=null,storyCount=null,storiesPage=1;const storiesPerPage=30;const seenStories=new Set();
function indexExistingStories(){if(!storyWall)return;storyWall.querySelectorAll('article').forEach(article=>{article.dataset.search=(article.textContent||'').toLowerCase();const key=(article.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(key)seenStories.add(key);});}
if(storySection&&storyWall){indexExistingStories();const lead=storySection.querySelector('.story-lead');if(lead)lead.textContent='Community stories shared for public posting. Stories appear on the national wall and Dog Tag Day may remove content when necessary.';const controls=document.createElement('div');controls.style.margin='28px 0 18px';searchBox=document.createElement('input');searchBox.type='search';searchBox.placeholder='Search stories by name or keyword';searchBox.setAttribute('aria-label','Search community stories');searchBox.style.width='100%';searchBox.style.maxWidth='620px';searchBox.style.padding='14px 16px';searchBox.style.borderRadius='8px';searchBox.style.border='1px solid currentColor';controls.appendChild(searchBox);storyCount=document.createElement('p');storyCount.style.margin='8px 0 20px';storyCount.style.fontWeight='700';storyCount.textContent=`${storyWall.querySelectorAll('article').length} community stories on the wall.`;loadMore=document.createElement('button');loadMore.type='button';loadMore.className='button secondary';loadMore.textContent='Load More Stories';loadMore.style.marginTop='20px';loadMore.hidden=true;storyWall.before(controls,storyCount);storyWall.after(loadMore);}
function cleanIssueBody(body){return(body||'').split(/\r?\n/).filter(line=>!/(^|\||\*\*)\s*(email|e-mail|permission|subject|tags)\s*(:|\||\*\*)/i.test(line)).filter(line=>!/formspree/i.test(line)).join('\n').replace(/^#+\s*/gm,'').replace(/\*\*/g,'').replace(/`/g,'').trim();}
function issueKey(issue){return`${(issue.title||'').trim().toLowerCase()}|${cleanIssueBody(issue.body).replace(/\s+/g,' ').trim().toLowerCase()}`;}
function renderIssue(issue){if(!storyWall||!issue||issue.pull_request)return;const key=issueKey(issue);if(seenStories.has(key))return;seenStories.add(key);const article=document.createElement('article');article.dataset.search=((issue.title||'')+' '+cleanIssueBody(issue.body)).toLowerCase();const title=document.createElement('h3');title.textContent=(issue.title||'Dog Tag Day Story').replace(/^Dog Tag Day Story\s*[-—:]?\s*/i,'')||'Dog Tag Day Story';const text=document.createElement('p');text.style.whiteSpace='pre-line';text.textContent=cleanIssueBody(issue.body)||'A Dog Tag Day community story.';article.append(title,text);storyWall.appendChild(article);}
function filterStories(){if(!storyWall)return;const q=(searchBox?.value||'').trim().toLowerCase();storyWall.querySelectorAll('article').forEach(article=>{article.hidden=!!q&&!((article.dataset.search||article.textContent||'').toLowerCase().includes(q));});}
searchBox?.addEventListener('input',filterStories);
async function loadStories(reset=false){if(!storyWall)return;try{const page=reset?1:storiesPage;const url=`https://api.github.com/repos/rshure001/DogTagDay/issues?state=open&labels=formspree&sort=created&direction=desc&per_page=${storiesPerPage}&page=${page}`;const response=await fetch(url,{headers:{Accept:'application/vnd.github+json'}});if(!response.ok)throw new Error(`GitHub ${response.status}`);const issues=(await response.json()).filter(issue=>!issue.pull_request);issues.forEach(renderIssue);if(storyCount){const count=storyWall.querySelectorAll('article').length;storyCount.textContent=`${count} community ${count===1?'story':'stories'} on the wall.`;}if(loadMore)loadMore.hidden=issues.length<storiesPerPage;if(issues.length===storiesPerPage)storiesPage=page+1;filterStories();}catch(error){if(storyCount){const count=storyWall.querySelectorAll('article').length;storyCount.textContent=`${count} community ${count===1?'story':'stories'} currently available.`;}console.error('Story wall load failed',error);}}
loadMore?.addEventListener('click',()=>loadStories(false));loadStories(true);
if(storyForm){const formEyebrow=storyForm.querySelector('.eyebrow');if(formEyebrow)formEyebrow.textContent='Post to the National Story Wall';const formHeading=storyForm.querySelector('h3');if(formHeading)formHeading.textContent='Tell the story behind the tags.';const connectionInput=storyForm.querySelector('input[name="connection"]');if(connectionInput)connectionInput.placeholder='Veteran, family member, friend, supporter — optional';if(storyText)storyText.placeholder='Write what you want to share with the Dog Tag Day community.';if(storySubmit)storySubmit.textContent='Post My Story';}

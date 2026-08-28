if((location.pathname==='/'||location.pathname.endsWith('/index.html'))&&!location.search.includes('noredirect')){location.replace('/live.html?v=202608282015');}
const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('#main-nav');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');}));

function nextApril18(){const now=new Date();let y=now.getFullYear();let d=new Date(y,3,18,0,0,0);if(now>=d)d=new Date(y+1,3,18,0,0,0);return d;}
function updateCountdown(){const el=document.querySelector('#countdown');if(!el)return;const diff=nextApril18()-new Date();const days=Math.ceil(diff/86400000);el.textContent=days===1?'Tomorrow':`${days} days`;}
updateCountdown();setInterval(updateCountdown,3600000);
const yearEl=document.querySelector('#year');if(yearEl)yearEl.textContent=new Date().getFullYear();

(() => {
  const endpoint = 'https://ynleeweezwkdbisaiovq.supabase.co/functions/v1/story-wall';
  const oldForm = document.querySelector('form.form-shell[action*="formspree.io"], #dogtag-story-form, #dogtag-story-form-live');
  if (!oldForm || oldForm.dataset.storyWallReady === '1') return;
  const form = oldForm.cloneNode(true);
  oldForm.replaceWith(form);
  form.dataset.storyWallReady = '1';
  form.removeAttribute('action');
  form.removeAttribute('method');
  form.id = 'dogtag-story-form-live';
  const email = form.querySelector('input[name="email"]');
  if (email) email.closest('div')?.remove();
  const eyebrow = form.querySelector('.eyebrow'); if (eyebrow) eyebrow.textContent = 'Post to the National Story Wall';
  const title = form.querySelector('h3'); if (title) title.textContent = 'Tell the story behind the tags.';
  const fineprint = form.querySelector('.fineprint'); if (fineprint) fineprint.textContent = 'Submissions are intended for immediate public posting. Dog Tag Day may remove content when necessary. Do not include private information you do not want shown publicly.';
  const permissionText = form.querySelector('.checkline span'); if (permissionText) permissionText.textContent = 'I understand and agree that my submission will be posted publicly on the Dog Tag Day Story Wall.';
  const submit = form.querySelector('button[type="submit"]'); if (submit) submit.textContent = 'Post My Story';
  const section = document.querySelector('section.stories#story');
  const lead = section?.querySelector('.story-lead'); if (lead) lead.textContent = 'Community stories are posted publicly when submitted. Dog Tag Day may remove content afterward when necessary.';
  const message = form.querySelector('textarea[name="message"]');
  const name = form.querySelector('input[name="name"]');
  const connection = form.querySelector('input[name="connection"]');
  const permission = form.querySelector('input[name="permission"]'); if (permission) permission.required = true;
  let status = form.querySelector('#story-warning');
  if (!status) { status = document.createElement('p'); status.id = 'story-warning'; status.setAttribute('role','status'); status.style.minHeight = '1.5em'; submit?.before(status); }
  let trap = form.querySelector('input[name="website"]');
  if (!trap) { trap = document.createElement('input'); trap.type='text'; trap.name='website'; trap.tabIndex=-1; trap.autocomplete='off'; trap.style.position='absolute'; trap.style.left='-9999px'; trap.setAttribute('aria-hidden','true'); form.appendChild(trap); }
  const wall = section?.querySelector('#published-stories');
  const storyKey = s => `${String(s.name||'').trim().toLowerCase()}|${String(s.message||'').replace(/\s+/g,' ').trim().toLowerCase()}`;
  function renderStory(s, prepend = true) { if (!wall || !s) return; const key = storyKey(s); if ([...wall.querySelectorAll('article')].some(a => a.dataset.liveKey === key)) return; const article = document.createElement('article'); article.dataset.liveKey = key; const h=document.createElement('h3'); h.textContent=s.name||'Anonymous'; const p=document.createElement('p'); p.style.whiteSpace='pre-line'; p.textContent=s.message||''; article.append(h); if(s.connection){const meta=document.createElement('p'); meta.textContent=s.connection; meta.style.fontWeight='700'; article.append(meta);} article.append(p); prepend ? wall.prepend(article) : wall.appendChild(article); }
  form.addEventListener('submit', async e => { e.preventDefault(); if (!form.reportValidity()) return; const text=String(message?.value||'').trim(); if(!text){status.textContent='Please enter your story.'; message?.focus(); return;} if(submit){submit.disabled=true; submit.textContent='Posting Story…';} status.textContent='Posting your story…'; try { const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:String(name?.value||'Anonymous').trim()||'Anonymous',connection:String(connection?.value||'').trim(),message:text,website:String(trap?.value||'')})}); const data=await r.json(); if(!r.ok||!data.ok) throw new Error(data.error||`Story wall ${r.status}`); renderStory(data.story,true); form.reset(); status.textContent='Your story is now posted on the public Dog Tag Day Story Wall.'; } catch(err){console.error(err); status.textContent='Your story did not post. Please try again.';} finally { if(submit){submit.disabled=false; submit.textContent='Post My Story';} } });
  fetch(`${endpoint}?limit=500`).then(r=>r.json()).then(data=>(data.stories||[]).slice().reverse().forEach(s=>renderStory(s,true))).catch(console.error);
})();

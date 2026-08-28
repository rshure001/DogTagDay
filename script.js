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

(() => {
  const hero = document.querySelector('.hero-shell');
  if (!hero || document.querySelector('#nationwide-outreach')) return;
  const section = document.createElement('section');
  section.id = 'nationwide-outreach';
  section.setAttribute('aria-label','Dog Tag Day nationwide outreach');
  section.style.cssText='max-width:1180px;margin:34px auto 44px;padding:0 18px;text-align:center;';
  section.innerHTML = `<p class="eyebrow">REACHING ACROSS AMERICA</p><h2 style="margin:0 0 8px">1,800 outreach connections—and growing.</h2><p style="max-width:820px;margin:0 auto 20px">Every light represents a connection made in the mission to ensure our veterans are seen, heard, and remembered.</p><div style="background:radial-gradient(circle at 50% 45%,#12385d 0,#071a2b 50%,#030b13 100%);border:1px solid rgba(255,255,255,.14);border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(0,0,0,.28)"><canvas id="outreach-light-map" width="1400" height="790" style="display:block;width:100%;height:auto;aspect-ratio:1400/790"></canvas></div><p style="margin:14px 0 0;font-weight:800;letter-spacing:.08em">DOG TAG DAY • APRIL 18</p><p style="margin:7px auto 0;font-size:.82rem;opacity:.66">The 1,800 lights represent outreach connections; positions are an illustrative nationwide visualization.</p>`;
  hero.insertAdjacentElement('afterend', section);

  const c = section.querySelector('#outreach-light-map');
  const x = c.getContext('2d');
  const W=c.width,H=c.height;
  const usa=[[128,230],[175,200],[230,202],[265,180],[340,187],[420,184],[505,190],[575,205],[650,210],[720,198],[800,190],[875,205],[940,222],[1010,240],[1075,268],[1125,310],[1165,336],[1185,365],[1160,388],[1130,400],[1110,430],[1080,455],[1060,500],[1032,530],[1005,570],[980,612],[946,640],[915,626],[890,596],[855,580],[820,570],[790,548],[752,540],[716,525],[680,515],[640,510],[600,495],[560,480],[520,470],[485,445],[455,418],[420,410],[382,395],[350,380],[318,362],[286,350],[252,332],[225,313],[196,298],[168,282],[145,260]];
  const alaska=[[98,590],[130,560],[172,568],[200,595],[180,625],[145,642],[108,630]];
  const hawaii=[[285,665],[302,672],[320,680],[340,690],[360,702]];
  function path(poly){x.beginPath();x.moveTo(poly[0][0],poly[0][1]);for(let i=1;i<poly.length;i++)x.lineTo(poly[i][0],poly[i][1]);x.closePath();}
  x.fillStyle='#0a2a3a';path(usa);x.fill();x.strokeStyle='rgba(175,220,255,.40)';x.lineWidth=3;path(usa);x.stroke();
  x.fillStyle='#0a2a3a';path(alaska);x.fill();x.strokeStyle='rgba(175,220,255,.38)';x.lineWidth=2;path(alaska);x.stroke();
  x.strokeStyle='rgba(175,220,255,.42)';x.lineWidth=4;x.beginPath();x.moveTo(hawaii[0][0],hawaii[0][1]);for(let i=1;i<hawaii.length;i++)x.lineTo(hawaii[i][0],hawaii[i][1]);x.stroke();
  const gridX=[270,350,430,510,590,670,750,830,910,990,1070],gridY=[245,305,365,425,485,545];
  x.strokeStyle='rgba(130,185,220,.12)';x.lineWidth=1;for(const gx of gridX){x.beginPath();x.moveTo(gx,215);x.lineTo(gx,535);x.stroke()}for(const gy of gridY){x.beginPath();x.moveTo(190,gy);x.lineTo(1105,gy);x.stroke()}
  function inside(px,py,p){let ok=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const xi=p[i][0],yi=p[i][1],xj=p[j][0],yj=p[j][1];const hit=((yi>py)!=(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi);if(hit)ok=!ok;}return ok;}
  let seed=1800418;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  const centers=[[1070,315,5],[1030,350,4],[990,330,4],[930,300,3],[890,280,3],[850,330,3],[810,360,3],[760,350,2.5],[700,380,2],[650,410,2],[585,400,2],[520,390,2],[450,390,2],[375,360,2],[300,330,2],[245,310,2.5],[205,265,3],[255,250,2.5],[315,245,2],[390,235,2],[975,515,3],[1005,560,4],[925,540,2.5],[860,500,2.5],[800,500,2],[730,480,2],[680,455,2],[610,440,2],[540,430,2],[470,420,2]];
  const pts=[];
  while(pts.length<1730){let px,py;if(rnd()<.72){const c0=centers[Math.floor(rnd()*centers.length)],s=34+52/rnd();px=c0[0]+(rnd()+rnd()+rnd()-1.5)*s;py=c0[1]+(rnd()+rnd()+rnd()-1.5)*s*.58;}else{px=135+rnd()*1040;py=190+rnd()*440;}if(inside(px,py,usa))pts.push([px,py]);}
  while(pts.length<1780){const px=108+rnd()*82,py=565+rnd()*66;if(inside(px,py,alaska))pts.push([px,py]);}
  while(pts.length<1800){const i=pts.length-1780;const h=hawaii[i%hawaii.length];pts.push([h[0]+(rnd()-.5)*14,h[1]+(rnd()-.5)*10]);}
  const colors=['#ff2e45','#ffcc24','#2eff8d','#33a8ff','#c45cff','#ff7a20','#54f6ff'];
  x.globalCompositeOperation='lighter';
  pts.forEach((p,i)=>{const col=colors[(i+Math.floor(rnd()*colors.length))%colors.length];x.shadowColor=col;x.shadowBlur=10+rnd()*10;x.fillStyle=col;x.beginPath();x.arc(p[0],p[1],2.4+rnd()*2.2,0,Math.PI*2);x.fill();});
  x.globalCompositeOperation='source-over';x.shadowBlur=0;
})();

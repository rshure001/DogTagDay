(() => {
  document.querySelectorAll('#reach-across-america, #live-outreach-picture').forEach(el => el.remove());
  document.querySelectorAll('a[href="#reach-across-america"], a[href="#live-outreach-picture"]').forEach(el => el.remove());
})();

(() => {
  const endpoint = 'https://ynleeweezwkdbisaiovq.supabase.co/functions/v1/story-wall';
  const oldForm = document.querySelector('form.form-shell[action*="formspree.io"], #dogtag-story-form, #dogtag-story-form-live');
  if (!oldForm) return;

  const form = oldForm.cloneNode(true);
  oldForm.replaceWith(form);
  form.removeAttribute('action');
  form.removeAttribute('method');
  form.id = 'dogtag-story-form-live';

  const email = form.querySelector('input[name="email"]');
  if (email) email.closest('div')?.remove();
  const eyebrow = form.querySelector('.eyebrow');
  if (eyebrow) eyebrow.textContent = 'Post to the National Story Wall';
  const title = form.querySelector('h3');
  if (title) title.textContent = 'Tell the story behind the tags.';
  const fineprint = form.querySelector('.fineprint');
  if (fineprint) fineprint.textContent = 'Submissions are intended for immediate public posting. Dog Tag Day may remove content when necessary. Do not include private information you do not want shown publicly.';
  const permissionText = form.querySelector('.checkline span');
  if (permissionText) permissionText.textContent = 'I understand and agree that my submission will be posted publicly on the Dog Tag Day Story Wall.';
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.textContent = 'Post My Story';

  const message = form.querySelector('textarea[name="message"]');
  const name = form.querySelector('input[name="name"]');
  const connection = form.querySelector('input[name="connection"]');
  const permission = form.querySelector('input[name="permission"]');
  if (permission) permission.required = true;

  let status = form.querySelector('#story-warning');
  if (!status) {
    status = document.createElement('p');
    status.id = 'story-warning';
    status.setAttribute('role','status');
    status.style.minHeight = '1.5em';
    submit?.before(status);
  }

  let trap = form.querySelector('input[name="website"]');
  if (!trap) {
    trap = document.createElement('input');
    trap.type = 'text'; trap.name = 'website'; trap.tabIndex = -1; trap.autocomplete = 'off';
    trap.style.position = 'absolute'; trap.style.left = '-9999px'; trap.setAttribute('aria-hidden','true');
    form.appendChild(trap);
  }

  const wall = document.querySelector('#published-stories');
  const storyKey = s => `${String(s.name||'').trim().toLowerCase()}|${String(s.message||'').replace(/\s+/g,' ').trim().toLowerCase()}`;

  function renderStory(s, prepend = true) {
    if (!wall || !s) return;
    const key = storyKey(s);
    if ([...wall.querySelectorAll('article')].some(a => a.dataset.liveKey === key)) return;
    const article = document.createElement('article');
    article.dataset.liveKey = key;
    const h = document.createElement('h3'); h.textContent = s.name || 'Anonymous';
    const p = document.createElement('p'); p.style.whiteSpace = 'pre-line'; p.textContent = s.message || '';
    article.append(h);
    if (s.connection) { const meta = document.createElement('p'); meta.textContent = s.connection; meta.style.fontWeight = '700'; article.append(meta); }
    article.append(p); prepend ? wall.prepend(article) : wall.appendChild(article);
  }

  const fallbackStories = [
    {name:'Lena Pendleton',connection:'Daughter of a Veteran',message:'I would like to honor and remember my Dad. A man who meant so much to so many and whose life left a lasting mark on everyone fortunate enough to know him.\n\nMy Dad proudly served in the United States Air Force. His service was a reflection of the kind of man he was: dedicated, courageous, dependable and willing to put others before himself. He carried that same sense of duty and strength into every part of his life.\n\nHe was the person whose presence helped shape who I am, whose lessons I will carry with me for the rest of my life. I will remember the things he taught me—not only through his words, but through the way he lived his life.\n\nDad, you served your country with honor. You loved your family with all your heart and you will never be forgotten.\n\nContinue to rest peaceful, Dad.\nUntil we meet again.\nAlways, your little girl,\nLena Joyce'},
    {name:'Willie Beard III',connection:'Family',message:'I want to 🇺🇸 Salute everyone that has ever served in the Military 🇺🇸 🙏... The sacrifice everyone of you made is priceless... I have family (My nephew) currently in the Navy that\'s active... I have a brother from another mother that went to Iraq and Afghanistan as well... They made it home, a lot if people didn\'t... May Jesus bless everyone that is currently serving our Country USA,\n\nLove Willie Beard III'},
    {name:'Willie Beard III',connection:'Family',message:'To all the men and women who have served in the United States military, thank you for your immeasurable sacrifices. I am deeply proud of my nephew currently serving in the Navy, and a close friend who bravely served in Iraq and Afghanistan. While I am thankful for their safe return, I honor and remember those who made the ultimate sacrifice. May God bless all who are actively serving our nation today.\n\nRespectfully,\nWillie Beard III'}
  ];

  fallbackStories.slice().reverse().forEach(s => renderStory(s, true));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const text = String(message?.value || '').trim();
    if (!text) { status.textContent = 'Please enter your story.'; message?.focus(); return; }
    if (submit) { submit.disabled = true; submit.textContent = 'Posting Story…'; }
    status.textContent = 'Posting your story…';
    try {
      const r = await fetch(endpoint, { method:'POST', cache:'no-store', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:String(name?.value||'Anonymous').trim()||'Anonymous',connection:String(connection?.value||'').trim(),message:text,website:String(trap?.value||'')}) });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || `Story wall ${r.status}`);
      renderStory(data.story, true); form.reset(); status.textContent = 'Your story is now posted on the public Dog Tag Day Story Wall.';
    } catch (err) {
      console.error(err); status.textContent = 'Your story did not post. Please try again.';
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = 'Post My Story'; }
    }
  });

  fetch(`${endpoint}?limit=500&t=${Date.now()}`, {cache:'no-store'})
    .then(r => { if (!r.ok) throw new Error(`Story wall ${r.status}`); return r.json(); })
    .then(data => {
      const stories = data.stories || [];
      if (!wall || !stories.length) return;
      wall.innerHTML = '';
      stories.slice().reverse().forEach(s => renderStory(s, true));
    })
    .catch(err => console.error('Story Wall live load failed; showing saved fallback stories.', err));
})();

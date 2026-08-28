(() => {
  const endpoint = 'https://ynleeweezwkdbisaiovq.supabase.co/functions/v1/story-wall';
  const oldForm = document.querySelector('form.form-shell[action*="formspree.io"], #dogtag-story-form');
  if (!oldForm) return;

  const form = oldForm.cloneNode(true);
  oldForm.replaceWith(form);
  form.removeAttribute('action');
  form.removeAttribute('method');
  form.id = 'dogtag-story-form-live';

  const submit = form.querySelector('button[type="submit"]');
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
    trap.type = 'text';
    trap.name = 'website';
    trap.tabIndex = -1;
    trap.autocomplete = 'off';
    trap.style.position = 'absolute';
    trap.style.left = '-9999px';
    trap.setAttribute('aria-hidden','true');
    form.appendChild(trap);
  }

  const section = document.querySelector('section.stories#story');
  const wall = section?.querySelector('#published-stories');

  function storyKey(s) {
    return `${String(s.name||'').trim().toLowerCase()}|${String(s.message||'').replace(/\s+/g,' ').trim().toLowerCase()}`;
  }

  function renderStory(s, prepend = true) {
    if (!wall || !s) return;
    const key = storyKey(s);
    const exists = [...wall.querySelectorAll('article')].some(a => a.dataset.liveKey === key);
    if (exists) return;
    const article = document.createElement('article');
    article.dataset.liveKey = key;
    article.dataset.search = `${s.name||''} ${s.connection||''} ${s.message||''}`.toLowerCase();
    const h = document.createElement('h3');
    h.textContent = s.name || 'Anonymous';
    const p = document.createElement('p');
    p.style.whiteSpace = 'pre-line';
    p.textContent = s.message || '';
    article.append(h);
    if (s.connection) {
      const meta = document.createElement('p');
      meta.textContent = s.connection;
      meta.style.fontWeight = '700';
      article.append(meta);
    }
    article.append(p);
    prepend ? wall.prepend(article) : wall.appendChild(article);
  }

  async function loadLiveStories() {
    try {
      const r = await fetch(`${endpoint}?limit=500`, { method:'GET' });
      if (!r.ok) throw new Error(`Story wall ${r.status}`);
      const data = await r.json();
      (data.stories || []).slice().reverse().forEach(s => renderStory(s, true));
      const count = section?.querySelector('#published-stories')?.querySelectorAll('article').length || 0;
      const countEl = section?.querySelector('p[style*="font-weight: 700"]');
      if (countEl && /stor/i.test(countEl.textContent || '')) countEl.textContent = `${count} community ${count===1?'story':'stories'} on the wall.`;
    } catch (e) {
      console.error('Live story wall load failed', e);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const text = String(message?.value || '').trim();
    if (!text) { status.textContent = 'Please enter your story.'; message?.focus(); return; }
    if (submit) { submit.disabled = true; submit.textContent = 'Posting Story…'; }
    status.textContent = 'Posting your story…';
    try {
      const r = await fetch(endpoint, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          name: String(name?.value || 'Anonymous').trim() || 'Anonymous',
          connection: String(connection?.value || '').trim(),
          message: text,
          website: String(trap?.value || '')
        })
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || `Story wall ${r.status}`);
      renderStory(data.story, true);
      form.reset();
      status.textContent = 'Your story is now posted on the public Dog Tag Day Story Wall.';
    } catch (err) {
      console.error(err);
      status.textContent = 'Your story did not post. Please try again.';
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = 'Post My Story'; }
    }
  });

  loadLiveStories();
})();

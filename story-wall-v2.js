(() => {
  const endpoint='https://ynleeweezwkdbisaiovq.supabase.co/functions/v1/story-wall';
  const wall=document.getElementById('published-stories');
  const form=document.getElementById('dogtag-story-form');
  if(!wall) return;

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const card=s=>`<article><h3>${esc(s.name||'Anonymous')}</h3>${s.connection?`<p style="font-weight:700">${esc(s.connection)}</p>`:''}<p style="white-space:pre-line">${esc(s.message||'')}</p></article>`;
  const staticHTML=wall.innerHTML;

  async function load(){
    try{
      const r=await fetch(`${endpoint}?limit=500&v=${Date.now()}`,{cache:'no-store'});
      const d=await r.json();
      if(!r.ok||!Array.isArray(d.stories)) throw new Error(d.error||`HTTP ${r.status}`);
      if(d.stories.length) wall.innerHTML=d.stories.map(card).join('');
      else if(!wall.querySelector('article')) wall.innerHTML=staticHTML;
    }catch(e){
      console.error('Story Wall v2 load failed; static stories retained.',e);
      if(!wall.querySelector('article')) wall.innerHTML=staticHTML;
    }
  }

  if(form){
    const button=form.querySelector('button[type="submit"]');
    if(button) button.textContent='Submit Story for Review';
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      if(!form.reportValidity()) return;
      let status=form.querySelector('[data-story-status]');
      if(!status){status=document.createElement('p');status.dataset.storyStatus='1';button.before(status);}
      const fd=new FormData(form);
      const payload={name:String(fd.get('name')||'Anonymous').trim()||'Anonymous',connection:String(fd.get('connection')||'').trim(),message:String(fd.get('message')||'').trim(),website:''};
      if(!payload.message) return;
      button.disabled=true; button.textContent='Submitting…'; status.textContent='Sending your story for private review…';
      try{
        const r=await fetch(endpoint,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        const d=await r.json();
        if(!r.ok||!d.ok) throw new Error(d.error||`HTTP ${r.status}`);
        form.reset(); status.textContent='Thank you. Your story was received for private review. It will not be published automatically.';
      }catch(err){console.error(err);status.textContent='Your story was not submitted. Please try again.';}
      finally{button.disabled=false;button.textContent='Submit Story for Review';}
    });
  }
  load();
})();
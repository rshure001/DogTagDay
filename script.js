(() => {
  const oldDynamic = document.querySelector('#nationwide-outreach');
  if (oldDynamic) oldDynamic.remove();

  let section = document.querySelector('#reach-across-america');
  if (!section) {
    section = document.createElement('section');
    section.id = 'reach-across-america';
    section.style.cssText = 'padding:56px 18px;background:#04101c;color:white;text-align:center;border-top:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12)';
    section.innerHTML = '<div style="max-width:1100px;margin:auto"><p class="eyebrow" style="color:#d9b45a">REACHING ACROSS AMERICA</p><h2 style="margin:.2em 0 .35em">1,800 outreach connections—and growing.</h2><p style="max-width:820px;margin:0 auto 24px;font-size:1.08rem;line-height:1.65">Every light represents a connection made in the mission to ensure our veterans are seen, heard, and remembered.</p><div id="outreach-photo-wrap" style="max-width:900px;margin:0 auto;background:#02070c;padding:14px;border-radius:18px;box-shadow:0 18px 55px rgba(0,0,0,.35)"></div><p style="font-weight:800;letter-spacing:.12em;margin:18px 0 0">DOG TAG DAY • APRIL 18</p></div>';
    const hero = document.querySelector('.hero-shell, .hero');
    if (hero) hero.insertAdjacentElement('afterend', section);
    else document.querySelector('main')?.prepend(section);
  }

  const canvas = section.querySelector('#reach-map-canvas');
  let wrap = section.querySelector('#outreach-photo-wrap');
  if (!wrap) {
    wrap = canvas?.parentElement || document.createElement('div');
    if (!wrap.parentElement) section.appendChild(wrap);
  }

  if (canvas) canvas.remove();
  const inlineMapScript = section.querySelector('script');
  if (inlineMapScript) inlineMapScript.remove();

  let img = section.querySelector('#outreach-map-photo');
  if (!img) {
    img = document.createElement('img');
    img.id = 'outreach-map-photo';
    img.src = 'assets/outreach-map-photo.jpg?v=20260828photo1';
    img.alt = 'Dog Tag Day nationwide outreach map filled with lights across America';
    img.style.cssText = 'display:block;width:100%;max-width:900px;height:auto;margin:0 auto;border-radius:12px';
    wrap.replaceChildren(img);
  }
})();

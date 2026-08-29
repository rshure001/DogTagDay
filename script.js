(() => {
  const oldDynamic = document.querySelector('#nationwide-outreach');
  if (oldDynamic) oldDynamic.remove();

  let section = document.querySelector('#reach-across-america');
  if (!section) {
    section = document.createElement('section');
    section.id = 'reach-across-america';
    const hero = document.querySelector('.hero-shell, .hero');
    if (hero) hero.insertAdjacentElement('afterend', section);
    else document.querySelector('main')?.prepend(section);
  }

  section.style.cssText = 'padding:48px 18px;background:#04101c;color:white;text-align:center;border-top:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12)';
  section.innerHTML = '<div style="max-width:1100px;margin:auto"><p class="eyebrow" style="color:#d9b45a">REACHING ACROSS AMERICA</p><h2 style="margin:.2em 0 .35em">1,800 outreach lights across America.</h2><p style="max-width:760px;margin:0 auto 22px;font-size:1rem;line-height:1.55">Each light represents an outreach point in the Dog Tag Day campaign. Zoom in, zoom out, drag, and explore the map.</p><div style="max-width:1000px;margin:0 auto;background:#02070c;padding:8px;border-radius:18px;box-shadow:0 18px 55px rgba(0,0,0,.35);overflow:hidden"><iframe id="dogtag-outreach-map" title="Dog Tag Day 1,800-light interactive outreach map" src="map-1800.html?v=20260828interactive1" loading="lazy" style="display:block;width:100%;height:min(68vh,680px);min-height:430px;border:0;border-radius:12px;background:#02060b"></iframe></div><div style="margin-top:18px"><a href="map-1800.html?v=20260828interactive1" style="display:inline-block;padding:12px 18px;border:1px solid #d9b45a;border-radius:10px;color:#fff;text-decoration:none;font-weight:800;letter-spacing:.04em">OPEN FULL-SCREEN MAP</a></div><p style="font-weight:800;letter-spacing:.12em;margin:18px 0 0">DOG TAG DAY • APRIL 18</p></div>';

  const frame = section.querySelector('#dogtag-outreach-map');
  frame?.addEventListener('load', () => {
    try {
      const doc = frame.contentDocument;
      ['.top', '.home', '.key', '.legend'].forEach(sel => {
        const el = doc?.querySelector(sel);
        if (el) el.style.display = 'none';
      });
    } catch (_) {}
  });

  const nav = document.querySelector('header nav');
  if (nav && !nav.querySelector('a[href="#reach-across-america"]')) {
    const link = document.createElement('a');
    link.href = '#reach-across-america';
    link.textContent = 'Map';
    const storyLink = nav.querySelector('a[href="#story"]');
    if (storyLink) nav.insertBefore(link, storyLink);
    else nav.appendChild(link);
  }
})();

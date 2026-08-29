(()=>{
  document.querySelector('#nationwide-outreach')?.remove();
  document.querySelector('#reach-across-america')?.remove();
  document.querySelector('header nav a[href="#reach-across-america"]')?.remove();
  if(!document.querySelector('script[data-dtd-guide]')){
    const s=document.createElement('script');
    s.src='visitor-guide.js?v=20260829assistant1';
    s.defer=true;
    s.dataset.dtdGuide='1';
    document.body.appendChild(s);
  }
  if(!document.querySelector('script[data-dtd-music]')){
    const m=document.createElement('script');
    m.src='music-player.js?v=20260829marine1909b1';
    m.defer=true;
    m.dataset.dtdMusic='1';
    document.body.appendChild(m);
  }
})();

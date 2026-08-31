(()=>{
const install=()=>{
  const old=document.getElementById('dtd-music-pill');
  if(old) old.remove();
  document.querySelectorAll('#dtd-seasonal-accent,.holiday-emblem,.holiday-badge,.holiday-corner,.seasonal-emblem,.seasonal-badge').forEach(el=>el.remove());

  const style=document.createElement('style');
  style.id='dtd-cadence-style';
  style.textContent=`
#dtd-cadence-pill{position:fixed;left:12px;bottom:12px;z-index:9998;display:flex;align-items:center;gap:9px;background:#07111bf2;color:#fff;border:1px solid #d9b45a;border-radius:999px;padding:8px 11px;font:800 12px Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.4)}
#dtd-cadence-pill button{border:0;border-radius:999px;background:#d9b45a;color:#07111b;font-weight:900;min-height:38px;padding:8px 13px;cursor:pointer}
#dtd-cadence-modal{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.88);padding:18px}
#dtd-cadence-modal.open{display:flex}
#dtd-cadence-box{width:min(920px,96vw);background:#07111b;border:2px solid #d9b45a;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.65)}
#dtd-cadence-head{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;color:#fff;font:900 14px Arial,sans-serif}
#dtd-cadence-close{border:0;background:#d9b45a;color:#07111b;border-radius:999px;width:38px;height:38px;font-size:20px;font-weight:900;cursor:pointer}
#dtd-cadence-video{width:100%;aspect-ratio:16/9;border:0;display:block;background:#000}
@media(max-width:700px){#dtd-cadence-pill{position:static;margin:8px auto;width:max-content;max-width:92%;font-size:11px}#dtd-cadence-pill button{min-height:38px}}
`;
  document.head.appendChild(style);

  const pill=document.createElement('div');
  pill.id='dtd-cadence-pill';
  pill.innerHTML='<span>♪ Marine Corps Recruit Cadence</span><button type="button">▶ Play</button>';
  document.body.appendChild(pill);

  const modal=document.createElement('div');
  modal.id='dtd-cadence-modal';
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML='<div id="dtd-cadence-box"><div id="dtd-cadence-head"><span>Marine Corps Drill Instructor Cadence — MCRD San Diego</span><button id="dtd-cadence-close" type="button" aria-label="Close">×</button></div><iframe id="dtd-cadence-video" title="Marine Corps Drill Instructor Cadence Calling" allow="autoplay; fullscreen" allowfullscreen></iframe></div>';
  document.body.appendChild(modal);

  const frame=modal.querySelector('iframe');
  const open=()=>{frame.src='https://www.dvidshub.net/video/embed/485738';modal.classList.add('open');modal.setAttribute('aria-hidden','false')};
  const close=()=>{frame.src='about:blank';modal.classList.remove('open');modal.setAttribute('aria-hidden','true')};
  pill.querySelector('button').addEventListener('click',open);
  modal.querySelector('#dtd-cadence-close').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();

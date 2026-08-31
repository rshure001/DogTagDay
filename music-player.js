(()=>{
const style=document.createElement('style');
style.textContent='#dtd-seasonal-accent{display:none!important}@media(max-width:700px){#dtd-music-pill{left:8px!important;bottom:calc(env(safe-area-inset-bottom) + 8px)!important;max-width:58%!important}#hardAsk{right:8px!important;bottom:calc(env(safe-area-inset-bottom) + 8px)!important}}';
document.head.appendChild(style);
const base=document.createElement('script');
base.src='music-player-base.js?v=20260831CADENCE1';
base.onload=()=>{
 const cadence=document.createElement('script');
 cadence.src='cadence-override.js?v=20260831CADENCE1';
 document.head.appendChild(cadence);
};
document.head.appendChild(base);
})();

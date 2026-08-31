(()=>{
const CADENCE_URL='https://d34w7g4gy10iej.cloudfront.net/video/1610/DOD_103717433/DOD_103717433-1920x1080-6221k.mp4';
let tries=0;
const swap=()=>{
  const old=document.getElementById('dtd-music-pill');
  if(!old){if(tries++<80)setTimeout(swap,100);return;}
  old.remove();
  const wrap=document.createElement('div');
  wrap.id='dtd-music-pill';
  wrap.innerHTML='<div class="dtd-music-label">♪ Marine Corps Drill Instructor Cadence<span class="dtd-music-status">Paused</span></div><button type="button">▶ Play</button>';
  document.body.appendChild(wrap);
  const button=wrap.querySelector('button');
  const status=wrap.querySelector('.dtd-music-status');
  const audio=new Audio(CADENCE_URL);
  audio.preload='none';
  button.addEventListener('click',async()=>{
    if(audio.paused){
      try{await audio.play();button.textContent='⏸ Pause';status.textContent='Marine Corps cadence playing';}
      catch(e){status.textContent='Unable to play cadence';}
    }else{
      audio.pause();button.textContent='▶ Play';status.textContent='Paused';
    }
  });
  audio.addEventListener('ended',()=>{button.textContent='▶ Play';status.textContent='Paused';});
  audio.addEventListener('error',()=>{button.textContent='▶ Play';status.textContent='Cadence unavailable';});
};
swap();
})();

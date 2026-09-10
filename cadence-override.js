(()=>{
const CADENCE_URL='https://d34w7g4gy10iej.cloudfront.net/video/1610/DOD_103717433/DOD_103717433-1920x1080-6221k.mp4';
const SOFT_VOLUME=0.10;
const FADE_MS=2400;
let tries=0,fadeTimer=null;
const fadeTo=(audio,target,done)=>{
  if(fadeTimer)clearInterval(fadeTimer);
  const start=audio.volume;
  const steps=24;
  let i=0;
  fadeTimer=setInterval(()=>{
    i++;
    audio.volume=Math.max(0,Math.min(1,start+(target-start)*(i/steps)));
    if(i>=steps){clearInterval(fadeTimer);fadeTimer=null;if(done)done();}
  },FADE_MS/steps);
};
const swap=()=>{
  const old=document.getElementById('dtd-music-pill');
  if(!old){if(tries++<80)setTimeout(swap,100);return;}
  old.remove();
  const wrap=document.createElement('div');
  wrap.id='dtd-music-pill';
  wrap.innerHTML='<div class="dtd-music-label">♪ Soft Military March<span class="dtd-music-status">Paused</span></div><button type="button">▶ Play</button>';
  document.body.appendChild(wrap);
  const button=wrap.querySelector('button');
  const status=wrap.querySelector('.dtd-music-status');
  const audio=new Audio(CADENCE_URL);
  audio.preload='none';
  audio.volume=0;
  button.addEventListener('click',async()=>{
    if(audio.paused){
      try{
        audio.volume=0;
        await audio.play();
        fadeTo(audio,SOFT_VOLUME);
        button.textContent='⏸ Pause';
        status.textContent='Soft march playing';
      }catch(e){status.textContent='Unable to play march';}
    }else{
      fadeTo(audio,0,()=>audio.pause());
      button.textContent='▶ Play';
      status.textContent='Paused';
    }
  });
  audio.addEventListener('ended',()=>{audio.volume=0;button.textContent='▶ Play';status.textContent='Paused';});
  audio.addEventListener('error',()=>{button.textContent='▶ Play';status.textContent='March unavailable';});
};
swap();
})();

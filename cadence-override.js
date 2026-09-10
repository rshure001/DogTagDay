(()=>{
const CADENCE_URL='https://d34w7g4gy10iej.cloudfront.net/video/1610/DOD_103717433/DOD_103717433-1920x1080-6221k.mp4';
const SOFT_VOLUME=0.10;
const FADE_MS=1800;
// Keep the same recording, but stay inside its quieter middle passage.
const QUIET_START=24;
const QUIET_END=54;
let tries=0,fadeTimer=null;
const fadeTo=(audio,target,done)=>{
  if(fadeTimer)clearInterval(fadeTimer);
  const start=audio.volume;
  const steps=18;
  let i=0;
  fadeTimer=setInterval(()=>{
    i++;
    audio.volume=Math.max(0,Math.min(1,start+(target-start)*(i/steps)));
    if(i>=steps){clearInterval(fadeTimer);fadeTimer=null;if(done)done();}
  },FADE_MS/steps);
};
const returnToQuiet=(audio)=>{
  fadeTo(audio,0,()=>{
    audio.currentTime=QUIET_START;
    audio.play().then(()=>fadeTo(audio,SOFT_VOLUME)).catch(()=>{});
  });
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
  audio.preload='metadata';
  audio.volume=0;
  audio.addEventListener('loadedmetadata',()=>{
    if(Number.isFinite(audio.duration)&&audio.duration>QUIET_START) audio.currentTime=QUIET_START;
  });
  audio.addEventListener('timeupdate',()=>{
    if(!audio.paused && audio.currentTime>=QUIET_END) returnToQuiet(audio);
  });
  button.addEventListener('click',async()=>{
    if(audio.paused){
      try{
        if(audio.currentTime<QUIET_START || audio.currentTime>=QUIET_END) audio.currentTime=QUIET_START;
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
  audio.addEventListener('ended',()=>returnToQuiet(audio));
  audio.addEventListener('error',()=>{button.textContent='▶ Play';status.textContent='March unavailable';});
};
swap();
})();

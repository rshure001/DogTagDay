(()=>{
/* DTD_FINAL_MOBILE_FIX_20260830_1901 */
const RealDate=Date,realSetInterval=window.setInterval;
const noon=(y,m,d)=>new RealDate(y,m,d,12,0,0,0);
const easter=y=>{const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return noon(y,mo-1,da)};
const firstMonday=(y,m)=>{const d=noon(y,m,1);d.setDate(1+(8-d.getDay())%7);return d};
const lastMonday=(y,m)=>{const d=noon(y,m+1,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d};
const fourthThursday=(y,m)=>{const d=noon(y,m,1);d.setDate(1+(11-d.getDay())%7+21);return d};
const list=y=>[
 ['New Year',noon(y,0,1)],['Valentine’s Day',noon(y,1,14)],['St. Patrick’s Day',noon(y,2,17)],['Easter',easter(y)],['National Pet Day',noon(y,3,11)],['Memorial Day',lastMonday(y,4)],['Juneteenth',noon(y,5,19)],['Independence Day',noon(y,6,4)],['Labor Day',firstMonday(y,8)],['Patriot Day',noon(y,8,11)],['Constitution Day',noon(y,8,17)],['Halloween',noon(y,9,31)],['Veterans Day',noon(y,10,11)],['Thanksgiving',fourthThursday(y,10)],['Christmas',noon(y,11,25)]
].sort((a,b)=>a[1]-b[1]);
const rnow=new RealDate(),today=noon(rnow.getFullYear(),rnow.getMonth(),rnow.getDate());
let target=list(rnow.getFullYear()).find(x=>x[1]>=today);if(!target)target=list(rnow.getFullYear()+1)[0];
const targetName=target[0],fakeTime=target[1].getTime();
class FakeDate extends RealDate{constructor(...a){super(...(a.length?a:[fakeTime]))}static now(){return fakeTime}static parse(v){return RealDate.parse(v)}static UTC(...a){return RealDate.UTC(...a)}}
const heroImg=document.querySelector('.hero-frame img');
if(heroImg){let fallbackStep=0;const recover=()=>{fallbackStep++;if(fallbackStep===1)heroImg.src='assets/approved-dog-tags-old.PNG?v=FINAL0830A';else if(fallbackStep===2)heroImg.src='assets/dog-tag-day-hero.PNG?v=FINAL0830B';};heroImg.addEventListener('error',recover);if(heroImg.complete&&heroImg.naturalWidth===0)recover();}
window.Date=FakeDate;window.setInterval=()=>0;
const st=document.createElement('style');st.id='dtd-final-mobile-fix';st.textContent=`
html body .hero-frame #dtd-seasonal-accent{top:auto!important;bottom:12px!important;right:12px!important;width:66px!important;max-width:66px!important}
html body #dtd-seasonal-accent .holiday-art{transition:none!important;animation:none!important}
@media(max-width:700px){
 header{position:relative!important;top:auto!important} header nav{display:none!important}.hero-shell{padding-top:12px!important}
 html body .hero-frame #dtd-seasonal-accent{top:auto!important;bottom:10px!important;right:10px!important;width:54px!important;max-width:54px!important}
 html body #dtd-music-pill{left:8px!important;bottom:calc(env(safe-area-inset-bottom) + 8px)!important;width:42px!important;max-width:42px!important;height:42px!important;min-height:42px!important;padding:0!important;gap:0!important;border-radius:50%!important;overflow:hidden!important;display:grid!important;place-items:center!important}
 html body #dtd-music-pill .dtd-music-label{display:none!important}
 html body #dtd-music-pill button{width:42px!important;height:42px!important;min-height:42px!important;padding:0!important;font-size:0!important;border-radius:50%!important;display:grid!important;place-items:center!important}
 html body #dtd-music-pill button::after{content:'▶';font-size:15px!important;line-height:1!important}
 html body #hardAsk{right:8px!important;bottom:calc(env(safe-area-inset-bottom) + 8px)!important;width:112px!important;height:42px!important;min-height:42px!important;padding:0 10px!important;font-size:11px!important;line-height:1!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;white-space:nowrap!important}
 body{padding-bottom:58px!important}
}
`;document.head.appendChild(st);
const s=document.createElement('script');s.src='music-player-base.js?v=20260830FINAL1901';
s.onload=()=>{window.Date=RealDate;window.setInterval=realSetInterval;const a=document.getElementById('dtd-seasonal-accent');if(!a)return;if(targetName==='Easter'){a.setAttribute('aria-label','Easter holiday accent');const old=a.querySelector('.holiday-art');if(old)old.outerHTML='<svg class="holiday-art" viewBox="0 0 120 120"><ellipse cx="42" cy="67" rx="24" ry="35" fill="#f2c7da" stroke="#fff" stroke-width="2"/><ellipse cx="77" cy="62" rx="23" ry="34" fill="#b9d7ef" stroke="#fff" stroke-width="2"/><path d="M24 64h36M59 58h36" stroke="#d9b45a" stroke-width="5"/><path d="M27 78q15-13 30 0M62 75q14-13 29 0" fill="none" stroke="#fff" stroke-width="4"/></svg>';}a.classList.add('hide-label');};
s.onerror=()=>{window.Date=RealDate;window.setInterval=realSetInterval};
document.head.appendChild(s);
})();

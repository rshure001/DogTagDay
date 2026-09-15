(()=>{
  document.querySelector('#nationwide-outreach')?.remove();
  document.querySelector('#reach-across-america')?.remove();
  document.querySelector('header nav a[href="#reach-across-america"]')?.remove();

  const founderPortrait=document.querySelector('.founderPortrait img');
  if(founderPortrait){
    founderPortrait.src='assets/ronnie-founder-crowsfeet-20260906.jpg?v=20260906-crowsfeet';
  }

  if(!document.querySelector('#field-outreach-proof')){
    const section=document.createElement('section');
    section.id='field-outreach-proof';
    section.setAttribute('aria-label','Dog Tag Day veteran outreach in the field');
    section.innerHTML=`
      <div class="fieldProofInner">
        <div class="fieldProofImageWrap">
          <img class="fieldProofImage" alt="Dog Tag Day founder sitting beside a veteran during a recorded street outreach conversation" src="assets/swipe-page2.jpg?v=20260915-field">
        </div>
        <div class="fieldProofCopy">
          <div class="eyebrow">What We Do — In the Field</div>
          <h2>We show up. We sit down. We listen.</h2>
          <p>Dog Tag Day meets veterans where they are — on the street, in shelters, in neighborhoods, at events, and in their communities. We record their stories with permission, connect veterans who ask for help to verified resources, and follow up so they are not handed a phone number and forgotten.</p>
          <blockquote>“The lower you go, the more you mean it when you pray.”</blockquote>
          <p class="fieldProofNote">The camera is there to preserve the veteran’s story — not to make the veteran a prop. Every recorded story, resource connection, follow-up contact, and April 18 community event is work we can document and report to partners and funders.</p>
          <div class="fieldProofActions">
            <a class="btn primary" href="#support">Help One Veteran Be Seen</a>
            <a class="btn secondary" href="#stories">See the Stories Behind the Tags</a>
          </div>
        </div>
      </div>`;

    const style=document.createElement('style');
    style.textContent=`
      #field-outreach-proof{max-width:1100px;margin:34px auto 42px;padding:0 20px}
      .fieldProofInner{display:grid;grid-template-columns:minmax(300px,1.08fr) minmax(280px,.92fr);gap:28px;align-items:stretch;border:2px solid #dfba62;background:linear-gradient(145deg,#07131f,#102e50);box-shadow:inset 6px 0 0 #b62035,inset -6px 0 0 #143b68,0 10px 28px rgba(0,0,0,.28);overflow:hidden}
      .fieldProofImageWrap{min-height:430px;background:#02070c}
      .fieldProofImage{display:block;width:100%;height:100%;object-fit:cover;object-position:center}
      .fieldProofCopy{padding:34px 30px 30px}
      .fieldProofCopy h2{font-family:Georgia,serif;font-size:clamp(2.35rem,5.4vw,4.55rem);line-height:.96;margin:10px 0 18px;color:#fff}
      .fieldProofCopy p{color:#dce5ef;line-height:1.65}
      .fieldProofCopy blockquote{margin:22px 0;padding:18px 20px;border-left:5px solid #b62035;border-top:1px solid rgba(223,186,98,.55);border-bottom:1px solid rgba(223,186,98,.55);background:rgba(2,7,12,.54);font-family:Georgia,serif;font-size:clamp(1.35rem,2.7vw,2rem);line-height:1.32;color:#fff}
      .fieldProofNote{font-size:.95rem!important;color:#b9c7d4!important}
      .fieldProofActions{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}
      @media(max-width:820px){#field-outreach-proof{padding:0 10px;margin-top:24px}.fieldProofInner{grid-template-columns:1fr}.fieldProofImageWrap{min-height:auto;aspect-ratio:675/1200}.fieldProofCopy{padding:28px 20px}.fieldProofActions{display:grid;grid-template-columns:1fr}.fieldProofActions .btn{text-align:center}}
    `;
    document.head.appendChild(style);

    const support=document.querySelector('#support');
    if(support){
      support.parentNode.insertBefore(section,support);
    }else{
      document.querySelector('main')?.appendChild(section);
    }
  }

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

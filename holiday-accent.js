(() => {
  const hero = document.querySelector('.hero-frame');
  if (hero) {
    const now = new Date();
    const y = now.getFullYear();
    const dayMs = 86400000;
    const atNoon = d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
    const daysUntil = d => Math.round((atNoon(d) - atNoon(now)) / dayMs);

    const nthWeekday = (year, month, weekday, nth) => {
      const d = new Date(year, month, 1);
      const shift = (weekday - d.getDay() + 7) % 7;
      return new Date(year, month, 1 + shift + 7 * (nth - 1));
    };
    const lastWeekday = (year, month, weekday) => {
      const d = new Date(year, month + 1, 0);
      const shift = (d.getDay() - weekday + 7) % 7;
      return new Date(year, month, d.getDate() - shift);
    };

    const holidays = [
      {name:"New Year's Day", date:new Date(y,0,1), icon:'✨'},
      {name:'Martin Luther King Jr. Day', date:nthWeekday(y,0,1,3), icon:'★'},
      {name:"Washington's Birthday", date:nthWeekday(y,1,1,3), icon:'🇺🇸'},
      {name:'Memorial Day', date:lastWeekday(y,4,1), icon:'🌺'},
      {name:'Juneteenth National Independence Day', date:new Date(y,5,19), icon:'★'},
      {name:'Independence Day', date:new Date(y,6,4), icon:'🎆'},
      {name:'Labor Day', date:nthWeekday(y,8,1,1), icon:'🛠️'},
      {name:'Columbus Day', date:nthWeekday(y,9,1,2), icon:'🧭'},
      {name:'Veterans Day', date:new Date(y,10,11), icon:'🎖️'},
      {name:'Thanksgiving Day', date:nthWeekday(y,10,4,4), icon:'🍂'},
      {name:'Christmas Day', date:new Date(y,11,25), icon:'🎄'},
      {name:'Halloween', date:new Date(y,9,31), icon:'🎃', seasonal:true}
    ];

    const current = holidays
      .map(h => ({...h, delta:daysUntil(h.date)}))
      .filter(h => h.delta >= 0 && h.delta <= 10)
      .sort((a,b) => a.delta - b.delta)[0];

    if (current) {
      hero.style.position = hero.style.position || 'relative';
      const accent = document.createElement('div');
      accent.setAttribute('aria-label', current.name);
      accent.title = current.name;
      accent.textContent = current.icon;
      accent.style.cssText = [
        'position:absolute','right:10px','top:10px','z-index:8',
        'width:34px','height:34px','display:flex','align-items:center','justify-content:center',
        'border-radius:50%','background:rgba(5,12,20,.48)','border:1px solid rgba(217,180,90,.55)',
        'box-shadow:0 3px 12px rgba(0,0,0,.22)','backdrop-filter:blur(3px)',
        'font-size:20px','line-height:1','pointer-events:none'
      ].join(';');
      hero.appendChild(accent);
    }
  }

  if (!document.getElementById('supportDogTagDay')) {
    const founder = document.getElementById('founder');
    const main = document.querySelector('main');
    if (main) {
      const support = document.createElement('section');
      support.id = 'supportDogTagDay';
      support.className = 'section';
      support.innerHTML = `
        <div class="dtd-support-wrap">
          <p class="eyebrow">Help Build Dog Tag Day</p>
          <h2>Help build a national tradition.</h2>
          <p class="dtd-support-lead">We are not asking you to simply donate. We are asking you to help build a national tradition that keeps military service visible, preserves stories, and brings communities together.</p>
          <div class="dtd-support-grid">
            <a class="dtd-support-card" href="contact.html"><span class="dtd-support-icon">★</span><h3>Become a Sponsor</h3><p>Help expand outreach, events, awareness, and community participation.</p><strong>Learn More →</strong></a>
            <a class="dtd-support-card" href="contact.html"><span class="dtd-support-icon">♥</span><h3>Fund the Mission</h3><p>Support education, storytelling, technology, and national awareness.</p><strong>Support the Mission →</strong></a>
            <a class="dtd-support-card" href="contact.html"><span class="dtd-support-icon">🤝</span><h3>Partner With Us</h3><p>Join as a community, corporate, educational, legal, or nonprofit partner.</p><strong>Partner With Us →</strong></a>
          </div>
          <p class="dtd-support-note">If you received an email from Dog Tag Day Foundation, this is your invitation to help us build April 18 into a national day of recognition.</p>
        </div>`;
      if (founder) main.insertBefore(support, founder);
      else main.appendChild(support);

      const style = document.createElement('style');
      style.textContent = `
        #supportDogTagDay{padding-top:68px;padding-bottom:68px}
        .dtd-support-wrap{max-width:1040px;margin:0 auto;text-align:center}
        .dtd-support-wrap h2{margin:8px 0 14px}
        .dtd-support-lead{max-width:790px;margin:0 auto 30px;font-size:1.12rem;line-height:1.7}
        .dtd-support-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
        .dtd-support-card{display:block;text-decoration:none;color:inherit;padding:28px 22px;border:1px solid rgba(217,180,90,.55);border-radius:16px;background:rgba(255,255,255,.045);transition:transform .18s ease,border-color .18s ease,background .18s ease}
        .dtd-support-card:hover{transform:translateY(-3px);border-color:#d9b45a;background:rgba(217,180,90,.08)}
        .dtd-support-card h3{margin:10px 0 10px;font-size:1.28rem}
        .dtd-support-card p{line-height:1.55;margin:0 0 14px}
        .dtd-support-card strong{color:#d9b45a}
        .dtd-support-icon{font-size:2rem;display:block;color:#d9b45a}
        .dtd-support-note{max-width:820px;margin:28px auto 0;padding:16px 20px;border-left:3px solid #d9b45a;background:rgba(217,180,90,.07);line-height:1.55}
        @media(max-width:760px){.dtd-support-grid{grid-template-columns:1fr}.dtd-support-card{padding:23px 20px}#supportDogTagDay{padding-top:54px;padding-bottom:54px}}
      `;
      document.head.appendChild(style);
    }
  }
})();

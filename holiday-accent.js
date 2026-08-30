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
    const current = holidays.map(h => ({...h, delta:daysUntil(h.date)})).filter(h => h.delta >= 0 && h.delta <= 10).sort((a,b) => a.delta - b.delta)[0];
    if (current && !hero.querySelector('[data-holiday-accent]')) {
      hero.style.position = hero.style.position || 'relative';
      const accent = document.createElement('div');
      accent.dataset.holidayAccent = '1';
      accent.setAttribute('aria-label', current.name);
      accent.title = current.name;
      accent.textContent = current.icon;
      accent.style.cssText = 'position:absolute;right:10px;top:10px;z-index:8;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(5,12,20,.48);border:1px solid rgba(217,180,90,.55);box-shadow:0 3px 12px rgba(0,0,0,.22);backdrop-filter:blur(3px);font-size:20px;line-height:1;pointer-events:none';
      hero.appendChild(accent);
    }
  }

  if (!document.getElementById('support')) {
    const founder = document.getElementById('founder');
    if (founder) {
      const section = document.createElement('section');
      section.className = 'section';
      section.id = 'support';
      section.innerHTML = `<div style="max-width:1080px;margin:0 auto;text-align:center"><p class="eyebrow">Build the Movement</p><h2 style="margin-bottom:10px">Help Build Dog Tag Day</h2><p style="max-width:850px;margin:0 auto 28px;font-size:1.2rem;line-height:1.6">We are not asking you to simply donate. <strong style="color:#d9b45a">We are asking you to help build a national tradition.</strong></p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px"><div style="padding:28px 22px;border:1px solid rgba(217,180,90,.48);border-radius:14px;background:rgba(217,180,90,.07)"><h3>Become a Sponsor</h3><p>Help expand veteran recognition, outreach, education, storytelling, technology, and local participation.</p><a class="button primary" href="contact.html">Become a Sponsor</a></div><div style="padding:28px 22px;border:1px solid rgba(217,180,90,.48);border-radius:14px;background:rgba(217,180,90,.07)"><h3>Fund the Mission</h3><p>Support the work that helps more veterans be seen, more stories be preserved, and more communities participate.</p><a class="button primary" href="contact.html">Fund the Mission</a></div><div style="padding:28px 22px;border:1px solid rgba(217,180,90,.48);border-radius:14px;background:rgba(217,180,90,.07)"><h3>Partner With Us</h3><p>Businesses, nonprofits, schools, attorneys, community leaders, and public organizations can help carry April 18 nationwide.</p><a class="button primary" href="contact.html">Partner With Us</a></div></div><div style="max-width:900px;margin:26px auto 0;padding:16px 20px;border-top:1px solid rgba(255,255,255,.14);font-weight:700;line-height:1.55">If you received an email from Dog Tag Day Foundation, this is your invitation to help us build April 18 into a national day of recognition.<br><strong>How can Dog Tag Day Foundation and your organization help each other?</strong></div></div>`;
      founder.parentNode.insertBefore(section, founder);
    }
  }
})();

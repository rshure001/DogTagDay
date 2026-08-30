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
      {name:'Veterans Day', date:new Date(y,10,11), icon:'🎖️'},
      {name:'Thanksgiving Day', date:nthWeekday(y,10,4,4), icon:'🍂'},
      {name:'Christmas Day', date:new Date(y,11,25), icon:'🎄'}
    ];
    const current = holidays.map(h => ({...h, delta:daysUntil(h.date)})).filter(h => h.delta >= 0 && h.delta <= 10).sort((a,b) => a.delta - b.delta)[0];
    if (current && !hero.querySelector('[data-holiday-accent]')) {
      hero.style.position = hero.style.position || 'relative';
      const accent = document.createElement('div');
      accent.dataset.holidayAccent = '1';
      accent.setAttribute('aria-label', current.name);
      accent.title = current.name;
      accent.textContent = current.icon;
      accent.style.cssText = 'position:absolute;right:10px;top:10px;z-index:8;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(5,12,20,.48);border:1px solid rgba(217,180,90,.55);box-shadow:0 3px 12px rgba(0,0,0,.22);font-size:20px;line-height:1;pointer-events:none';
      hero.appendChild(accent);
    }
  }

  const join = document.getElementById('join');
  if (join && !document.getElementById('action-timeline')) {
    join.innerHTML = `
      <div class="join-inner" id="action-timeline" style="max-width:980px;margin:auto;text-align:center">
        <p class="eyebrow">America Can Join In</p>
        <h2>What can I do on April 18?</h2>
        <p style="max-width:760px;margin:0 auto 38px">One simple action at a time. Wear the tags, acknowledge the person, share the story, and help the movement reach another community.</p>
        <div class="action-line">
          <article class="action-step"><div class="action-copy"><h3>Wear Your Tags</h3><p>If you served, put on your dog tags. Let them say, “I served.”</p></div><span class="action-dot"></span><img src="assets/approved-dog-tags.PNG" alt="Military dog tags for Dog Tag Day"></article>
          <article class="action-step reverse"><img src="assets/dog-tag-day-hero.PNG" alt="Dog Tag Day recognition"><span class="action-dot"></span><div class="action-copy"><h3>Acknowledge One</h3><p>If you see the tags, acknowledge the person — a nod, handshake, fist to the heart, or simply, “I see you.”</p></div></article>
          <article class="action-step"><div class="action-copy"><h3>Tell the Story</h3><p>Take a picture or video with permission and share the person, the tags, and the story behind them.</p></div><span class="action-dot"></span><img src="assets/approved-dog-tags-old.PNG" alt="Dog tags representing a military story"></article>
          <article class="action-step reverse"><img class="map-photo" src="assets/outreach-map-photo.jpg" alt="Dog Tag Day outreach map across America"><span class="action-dot"></span><div class="action-copy"><h3>Help It Reach America</h3><p>The map shows the outreach already made across the country. Help carry April 18 into another community.</p></div></article>
        </div>
      </div>`;

    const style = document.createElement('style');
    style.textContent = `
      #action-timeline .action-line{position:relative;max-width:900px;margin:0 auto;text-align:left}
      #action-timeline .action-line:before{content:"";position:absolute;left:50%;top:0;bottom:0;width:3px;background:#d9b45a;transform:translateX(-50%);opacity:.8}
      #action-timeline .action-step{display:grid;grid-template-columns:1fr 56px 1fr;gap:18px;align-items:center;margin:0 0 38px;position:relative}
      #action-timeline .action-step:last-child{margin-bottom:0}
      #action-timeline .action-copy{text-align:right}
      #action-timeline .reverse .action-copy{text-align:left}
      #action-timeline .action-copy h3{margin:0 0 8px}
      #action-timeline .action-copy p{margin:0;color:#c6ced6;line-height:1.6}
      #action-timeline .action-dot{width:24px;height:24px;border-radius:50%;background:#d9b45a;border:5px solid #07111b;margin:auto;z-index:2}
      #action-timeline img{width:100%;max-height:225px;object-fit:cover;border-radius:14px;border:1px solid rgba(217,180,90,.45);box-shadow:0 14px 32px rgba(0,0,0,.28)}
      #action-timeline img.map-photo{object-fit:contain;background:#02070c}
      @media(max-width:700px){
        #action-timeline .action-line{padding-left:34px}
        #action-timeline .action-line:before{left:12px;transform:none}
        #action-timeline .action-step,#action-timeline .action-step.reverse{display:flex;flex-direction:column;align-items:stretch;gap:10px;margin-bottom:34px}
        #action-timeline .action-dot{position:absolute;left:-33px;top:10px;margin:0}
        #action-timeline .action-copy,#action-timeline .reverse .action-copy{text-align:left}
        #action-timeline .reverse img{order:2}
        #action-timeline .reverse .action-copy{order:1}
        #action-timeline .reverse .action-dot{order:0}
        #action-timeline img{max-height:200px}
      }`;
    document.head.appendChild(style);
  }
})();

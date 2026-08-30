(() => {
  const hero = document.querySelector('.hero-frame');
  if (!hero) return;

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

  if (!current) return;

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
})();

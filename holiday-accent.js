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

  let current = holidays
    .map(h => ({...h, delta:daysUntil(h.date)}))
    .filter(h => h.delta >= 0 && h.delta <= (h.seasonal ? 10 : 10))
    .sort((a,b) => a.delta - b.delta)[0];

  if (!current) return;

  hero.style.position = hero.style.position || 'relative';
  const badge = document.createElement('div');
  badge.setAttribute('aria-label', current.name);
  badge.style.cssText = [
    'position:absolute','right:14px','top:14px','z-index:8','display:flex','align-items:center','gap:9px',
    'padding:9px 13px','border-radius:999px','background:rgba(5,12,20,.78)','border:1px solid rgba(217,180,90,.72)',
    'box-shadow:0 5px 20px rgba(0,0,0,.3)','backdrop-filter:blur(4px)','font:800 13px/1.1 Arial,sans-serif',
    'letter-spacing:.04em','color:#fff','text-transform:uppercase'
  ].join(';');
  const icon = document.createElement('span');
  icon.textContent = current.icon;
  icon.style.cssText = 'font-size:25px;line-height:1';
  const label = document.createElement('span');
  label.textContent = current.name;
  badge.append(icon,label);
  hero.appendChild(badge);
})();

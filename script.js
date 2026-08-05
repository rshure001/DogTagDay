const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#main-nav');

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

function nextDogTagDay(now = new Date()) {
  let target = new Date(now.getFullYear(), 3, 18, 0, 0, 0);
  if (now >= target) target = new Date(now.getFullYear() + 1, 3, 18, 0, 0, 0);
  return target;
}

function updateCountdown() {
  const now = new Date();
  const distance = nextDogTagDay(now) - now;
  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance % 86400000) / 3600000);
  const minutes = Math.floor((distance % 3600000) / 60000);
  const seconds = Math.floor((distance % 60000) / 1000);

  document.querySelector('#days').textContent = String(days).padStart(3, '0');
  document.querySelector('#hours').textContent = String(hours).padStart(2, '0');
  document.querySelector('#minutes').textContent = String(minutes).padStart(2, '0');
  document.querySelector('#seconds').textContent = String(seconds).padStart(2, '0');
}

document.querySelector('#year').textContent = new Date().getFullYear();
updateCountdown();
setInterval(updateCountdown, 1000);

const header = document.querySelector('.site-header');
const menuButton = document.getElementById('menuButton');
const nav = document.getElementById('siteNav');
const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function updateHeaderBorder() {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
}

function updateActiveNav() {
  const offset = window.innerHeight * 0.3;
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top - offset <= 0) current = section;
  }
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`);
  });
}

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

window.addEventListener('scroll', () => {
  updateHeaderBorder();
  updateActiveNav();
});

window.addEventListener('load', () => {
  updateHeaderBorder();
  updateActiveNav();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// Grain overlay
(function () {
  const size = 600;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    img.data[i]     = Math.min(255, v + 18);
    img.data[i + 1] = Math.min(255, v + 8);
    img.data[i + 2] = Math.max(0,   v - 22);
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  const grain = document.createElement('div');
  grain.style.position = 'fixed';
  grain.style.top = '0';
  grain.style.left = '0';
  grain.style.width = '100%';
  grain.style.height = '100%';
  grain.style.pointerEvents = 'none';
  grain.style.zIndex = '9999';
  grain.style.opacity = '0.05';
  grain.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';
  grain.style.backgroundSize = size + 'px ' + size + 'px';
  grain.style.backgroundRepeat = 'repeat';
  document.body.appendChild(grain);
}());

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

// Grain overlay — inline SVG feTurbulence, works on all static hosts
(function () {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;opacity:0.09';

  const defs = document.createElementNS(ns, 'defs');
  const filter = document.createElementNS(ns, 'filter');
  filter.setAttribute('id', 'gmf-grain');

  const turb = document.createElementNS(ns, 'feTurbulence');
  turb.setAttribute('type', 'fractalNoise');
  turb.setAttribute('baseFrequency', '0.38');
  turb.setAttribute('numOctaves', '4');
  turb.setAttribute('seed', '7');
  turb.setAttribute('stitchTiles', 'stitch');

  const warm = document.createElementNS(ns, 'feColorMatrix');
  warm.setAttribute('type', 'matrix');
  warm.setAttribute('values', '1.12 0 0 0 0.04  0 1.02 0 0 0  0 0 0.82 0 0  0 0 0 1 0');

  filter.appendChild(turb);
  filter.appendChild(warm);
  defs.appendChild(filter);

  const rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('width', '100%');
  rect.setAttribute('height', '100%');
  rect.setAttribute('filter', 'url(#gmf-grain)');

  svg.appendChild(defs);
  svg.appendChild(rect);
  document.body.appendChild(svg);
}());

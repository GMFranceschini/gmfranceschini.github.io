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


/* theme.js — light is the default; dark is a choice this page remembers.
   The system colour-scheme setting is deliberately not consulted. */
(function () {
  'use strict';

  const root = document.documentElement;
  const button = document.getElementById('themeToggle');
  if (!button) return;

  function sync() {
    const dark = root.getAttribute('data-theme') === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  button.addEventListener('click', function () {
    const dark = root.getAttribute('data-theme') === 'dark';
    if (dark) root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', 'dark');
    try {
      localStorage.setItem('theme', dark ? 'light' : 'dark');
    } catch (e) {
      /* storage unavailable — the choice still applies to this page view */
    }
    sync();
  });

  sync();
}());

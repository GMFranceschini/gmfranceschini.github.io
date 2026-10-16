const modeToggle = document.getElementById('modeToggle');

function currentMode() {
  return document.documentElement.getAttribute('data-mode') === 'crt' ? 'crt' : 'paper';
}

function syncToggle() {
  if (!modeToggle) return;
  const isCrt = currentMode() === 'crt';
  modeToggle.setAttribute('aria-pressed', String(isCrt));
  modeToggle.querySelector('.mode-toggle-label').textContent = isCrt ? '[ PAPER ]' : '[ CRT ]';
}

if (modeToggle) {
  modeToggle.addEventListener('click', () => {
    const next = currentMode() === 'crt' ? 'paper' : 'crt';
    document.documentElement.setAttribute('data-mode', next);
    try {
      localStorage.setItem('receipt-mode', next);
    } catch (e) {
      /* storage unavailable — mode still applies for this page view */
    }
    syncToggle();
  });
  syncToggle();
}

// Receipt stamps: print timestamp, year, pseudo serial number
(function () {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');

  const printed = document.getElementById('printed');
  if (printed) {
    printed.textContent =
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(now.getFullYear());

  const serial = document.getElementById('serial');
  if (serial) {
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    serial.textContent = String(dayOfYear * 7 + now.getHours()).padStart(4, '0');
  }
}());

// Headline types itself in once, then the caret keeps blinking
(function () {
  const heading = document.querySelector('.slip-head h1');
  if (!heading) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const text = heading.textContent;
  heading.textContent = '';
  heading.style.minHeight = '1em';

  let i = 0;
  const step = () => {
    heading.textContent = text.slice(0, (i += 1));
    if (i < text.length) setTimeout(step, 28);
  };
  setTimeout(step, 180);
}());

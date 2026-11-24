/* blog.js — renders the Writing section from posts/posts.json and shows a single
   post in place when the URL hash is #post/<slug>. Aesthetic-agnostic: it only
   fills containers marked with data attributes, using class names each
   stylesheet defines.

   Markup contract (see any variant page):
     <div data-page-main> … the whole normal page … </div>
     <ol data-post-list></ol>                     inside the Writing section
     <article data-post-view>
       <a data-post-back href="#writing">…</a>
       <h1 data-post-title></h1>
       <p data-post-meta></p>
       <div data-post-body></div>
     </article>

   The <html> element gets data-view="post" while a post is open, so each
   stylesheet can swap the two views with two rules. */
(function () {
  'use strict';

  const INDEX_URL = './posts/posts.json';
  const root = document.documentElement;
  const listEl = document.querySelector('[data-post-list]');
  const viewEl = document.querySelector('[data-post-view]');
  if (!listEl || !viewEl) return;

  const titleEl = viewEl.querySelector('[data-post-title]');
  const metaEl = viewEl.querySelector('[data-post-meta]');
  const bodyEl = viewEl.querySelector('[data-post-body]');
  const pageTitle = document.title;

  let posts = [];
  const cache = new Map();

  const fmtDate = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function renderList() {
    if (!posts.length) {
      listEl.innerHTML = '<li class="post-empty">No posts yet.</li>';
      return;
    }
    listEl.innerHTML = posts
      .map(
        (p) => `
        <li class="post-item">
          <a class="post-row" href="#post/${encodeURIComponent(p.slug)}">
            <span class="post-date">${esc(fmtDate(p.date))}</span>
            <span class="post-title">${esc(p.title)}</span>
            <span class="post-leader" aria-hidden="true"></span>
            <span class="post-tags">${(p.tags || []).map(esc).join(' · ')}</span>
          </a>
          ${p.summary ? `<p class="post-summary">${esc(p.summary)}</p>` : ''}
        </li>`
      )
      .join('');
  }

  function showIndex() {
    root.removeAttribute('data-view');
    document.title = pageTitle;
  }

  async function showPost(slug) {
    const meta = posts.find((p) => p.slug === slug);
    root.setAttribute('data-view', 'post');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

    titleEl.textContent = meta ? meta.title : slug;
    metaEl.textContent = meta
      ? [fmtDate(meta.date), (meta.tags || []).join(' · ')].filter(Boolean).join('  ·  ')
      : '';
    document.title = (meta ? meta.title : slug) + ' — ' + pageTitle;

    if (cache.has(slug)) {
      bodyEl.innerHTML = cache.get(slug);
      return;
    }

    bodyEl.innerHTML = '<p class="post-loading">Loading…</p>';
    const file = meta && meta.file ? meta.file : `${slug}.md`;
    const url = `./posts/${file}`;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = window.renderMarkdown(await res.text());
      cache.set(slug, html);
      bodyEl.innerHTML = html;
    } catch (err) {
      bodyEl.innerHTML =
        `<p class="post-error">This post could not be loaded (${esc(err.message)}). ` +
        `Posts are fetched at runtime, so the site needs to be served over http — ` +
        `opening the file directly from disk will not work. ` +
        `<a href="${url}">Open the Markdown source</a>.</p>`;
    }
  }

  function route() {
    const m = location.hash.match(/^#post\/(.+)$/);
    if (m) showPost(decodeURIComponent(m[1]));
    else showIndex();
  }

  async function init() {
    try {
      const res = await fetch(INDEX_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      posts = (await res.json()).filter((p) => p.draft !== true);
      posts.sort((a, b) => (a.date < b.date ? 1 : -1));
    } catch (err) {
      listEl.innerHTML =
        `<li class="post-empty">The post index could not be loaded (${esc(err.message)}). ` +
        `Serve the site over http rather than opening the file from disk.</li>`;
    }
    renderList();
    route();
  }

  window.addEventListener('hashchange', route);
  init();
}());

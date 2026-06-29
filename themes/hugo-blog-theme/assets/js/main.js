/* ============================================================
   Nguyen Chung Notebook — main.js
   Vanilla JS, không phụ thuộc framework. Bọc DOMContentLoaded,
   mọi init kiểm tra element tồn tại trước khi chạy.
   ============================================================ */

/* ── Dark / Light theme ─────────────────────────────────── */
function initTheme() {
  var root = document.documentElement;
  var btns = document.querySelectorAll('[data-theme-toggle]');
  if (!btns.length) return;

  function icon() {
    var dark = root.dataset.theme !== 'light';
    btns.forEach(function (b) { b.textContent = dark ? '☀' : '☽'; });
  }
  icon();

  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var dark = root.dataset.theme !== 'light';
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('ncn-dark', String(!dark)); } catch (e) {}
      icon();
    });
  });
}

/* ── Mobile burger nav ──────────────────────────────────── */
function initMobileNav() {
  var burger = document.querySelector('[data-nav-burger]');
  var menu = document.querySelector('[data-nav-mobile]');
  if (!burger || !menu) return;
  burger.addEventListener('click', function () { menu.classList.toggle('open'); });
}

/* ── Language (UI strings VI/EN, mặc định VI) ───────────────
   Dịch các phần tử có data-vi / data-en. Nội dung bài viết
   (.post__content) KHÔNG đụng tới. */
function initLang() {
  var btns = document.querySelectorAll('[data-lang-toggle]');
  var nodes = document.querySelectorAll('[data-vi]');
  if (!btns.length && !nodes.length) return;

  var lang = 'VI';
  try { lang = localStorage.getItem('ncn-lang') || 'VI'; } catch (e) {}

  function apply(l) {
    nodes.forEach(function (n) {
      var v = l === 'EN' ? n.getAttribute('data-en') : n.getAttribute('data-vi');
      if (v !== null) n.textContent = v;
    });
    btns.forEach(function (b) { b.textContent = l; });
    document.documentElement.lang = l === 'EN' ? 'en' : 'vi';
  }
  apply(lang);

  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      lang = lang === 'VI' ? 'EN' : 'VI';
      try { localStorage.setItem('ncn-lang', lang); } catch (e) {}
      apply(lang);
    });
  });
}

/* ── Reading progress (post) ────────────────────────────── */
function initReadingProgress() {
  var bar = document.querySelector('[data-reading-progress]');
  if (!bar) return;
  function update() {
    var st = document.documentElement.scrollTop || document.body.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? Math.min(100, (st / h) * 100) : 0) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── TOC scroll-spy ─────────────────────────────────────── */
function initTOC() {
  var toc = document.querySelector('[data-toc]');
  if (!toc) return;
  var links = toc.querySelectorAll('a[href^="#"]');
  if (!links.length) return;
  var map = [];
  links.forEach(function (a) {
    var el = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (el) map.push({ a: a, el: el });
  });
  function spy() {
    var pos = window.scrollY + 120;
    var cur = null;
    map.forEach(function (m) { if (m.el.offsetTop <= pos) cur = m; });
    links.forEach(function (a) { a.classList.remove('active'); });
    if (cur) cur.a.classList.add('active');
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();
}

/* ── Copy link ──────────────────────────────────────────── */
function initCopyLink() {
  var btn = document.querySelector('[data-copy-link]');
  if (!btn || !navigator.clipboard) return;
  btn.addEventListener('click', function () {
    navigator.clipboard.writeText(location.href).then(function () {
      var old = btn.textContent; btn.textContent = '✓';
      setTimeout(function () { btn.textContent = old; }, 1200);
    });
  });
}

/* ── Category search + tag filter (lọc rows hiển thị) ──────
   Hoạt động trên các bài của TRANG hiện tại (server-paginated). */
function initCatFilter() {
  var rows = document.querySelector('[data-cat-rows]');
  if (!rows) return;
  var search = document.querySelector('[data-cat-search]');
  var tagBtns = document.querySelectorAll('[data-cat-tags] [data-tag]');
  var empty = document.querySelector('[data-cat-empty]');
  var items = Array.prototype.slice.call(rows.querySelectorAll('.post-row'));
  var activeTag = '';

  function apply() {
    var q = (search && search.value || '').toLowerCase().trim();
    var shown = 0;
    items.forEach(function (it) {
      var okQ = !q || (it.dataset.title || '').indexOf(q) !== -1;
      var okT = !activeTag || (' ' + (it.dataset.tags || '') + ' ').indexOf(' ' + activeTag + ' ') !== -1;
      var ok = okQ && okT;
      it.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });
    if (empty) empty.hidden = shown !== 0;
  }
  if (search) search.addEventListener('input', apply);
  tagBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var t = (b.dataset.tag || '').toLowerCase();
      if (activeTag === t) { activeTag = ''; b.classList.remove('active'); }
      else {
        activeTag = t;
        tagBtns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
      }
      apply();
    });
  });
}

/* ── Boot ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  initMobileNav();
  initLang();
  initReadingProgress();
  initTOC();
  initCopyLink();
  initCatFilter();
});

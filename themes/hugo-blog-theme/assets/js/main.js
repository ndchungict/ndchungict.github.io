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

/* ── Boot ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  initMobileNav();
  initLang();
});

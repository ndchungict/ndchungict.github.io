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
      syncGiscusTheme();
    });
  });
}

/* ── Giscus: đồng bộ theme với site ─────────────────────── */
function syncGiscusTheme() {
  var s = document.getElementById('giscus-script');
  var iframe = document.querySelector('iframe.giscus-frame');
  if (!s || !iframe) return;
  var isLight = document.documentElement.dataset.theme === 'light';
  var theme = isLight
    ? (s.dataset.themeLight || 'light')
    : (s.dataset.themeDark || 'dark');
  iframe.contentWindow.postMessage(
    { giscus: { setConfig: { theme: theme } } },
    'https://giscus.app'
  );
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

  var phNodes = document.querySelectorAll('[data-vi-ph]');
  function apply(l) {
    nodes.forEach(function (n) {
      var v = l === 'EN' ? n.getAttribute('data-en') : n.getAttribute('data-vi');
      if (v !== null) n.textContent = v;
    });
    phNodes.forEach(function (n) {
      var v = l === 'EN' ? n.getAttribute('data-en-ph') : n.getAttribute('data-vi-ph');
      if (v !== null) n.setAttribute('placeholder', v);
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

/* ── Copy code (nút Copy trên mỗi codeblock) ────────────── */
function initCopyCode() {
  var btns = document.querySelectorAll('[data-copy-code]');
  if (!btns.length || !navigator.clipboard) return;

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var block = btn.closest('.codeblock');
      var code = block && block.querySelector('pre');
      if (!code) return;

      navigator.clipboard.writeText(code.innerText.replace(/\n$/, '')).then(function () {
        var label = btn.querySelector('[data-copy-label]');
        if (!label) return;
        var en = document.documentElement.lang === 'en';
        var old = label.textContent;
        label.textContent = en ? 'Copied' : 'Đã copy';
        btn.classList.add('is-copied');
        setTimeout(function () {
          label.textContent = old;
          btn.classList.remove('is-copied');
        }, 1400);
      });
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

/* ── Series list filter tabs ────────────────────────────── */
function initSeriesTabs() {
  var tabsWrap = document.querySelector('[data-series-tabs]');
  var grid = document.querySelector('[data-series-grid]');
  if (!tabsWrap || !grid) return;
  var tabs = tabsWrap.querySelectorAll('.sl-tab');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.series-card'));
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      var cat = t.dataset.cat;
      cards.forEach(function (c) { c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none'; });
    });
  });
}

/* ── Series progress (localStorage ncn-series-<id>) ─────── */
function seriesRead(id, n) {
  try {
    var raw = localStorage.getItem('ncn-series-' + id);
    var arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr) || arr.length !== n) arr = new Array(n).fill(false);
    return arr;
  } catch (e) { return new Array(n).fill(false); }
}
function seriesWrite(id, arr) {
  try { localStorage.setItem('ncn-series-' + id, JSON.stringify(arr)); } catch (e) {}
}

function initSeriesProgress() {
  // Cards trên SeriesList (chỉ hiển thị)
  document.querySelectorAll('[data-series-id][data-series-parts]:not([data-series-detail])').forEach(function (card) {
    var id = card.dataset.seriesId, n = parseInt(card.dataset.seriesParts, 10) || 0;
    var arr = seriesRead(id, n);
    var done = arr.filter(Boolean).length;
    var pct = n ? Math.round((done / n) * 100) : 0;
    var fill = card.querySelector('[data-series-fill]');
    var label = card.querySelector('[data-series-label]');
    var cta = card.querySelector('[data-series-cta] span[data-vi]');
    if (fill) fill.style.width = pct + '%';
    if (label) label.firstChild && (label.firstChild.textContent = done + '/' + n + ' ');
    if (cta) {
      if (done >= n && n > 0) { cta.setAttribute('data-vi', 'Đã hoàn thành ✓'); cta.setAttribute('data-en', 'Completed ✓'); }
      else if (done > 0) { cta.setAttribute('data-vi', 'Tiếp tục (' + done + '/' + n + ')'); cta.setAttribute('data-en', 'Continue (' + done + '/' + n + ')'); }
      cta.textContent = (localStorage.getItem('ncn-lang') === 'EN') ? cta.getAttribute('data-en') : cta.getAttribute('data-vi');
    }
  });

  // Trang SeriesDetail (tương tác)
  var detail = document.querySelector('[data-series-detail]');
  if (!detail) return;
  var id = detail.dataset.seriesId, n = parseInt(detail.dataset.seriesParts, 10) || 0;
  var arr = seriesRead(id, n);
  var items = Array.prototype.slice.call(detail.querySelectorAll('.sd-item'));
  var links = items.map(function (it) { var a = it.querySelector('[data-part-link]'); return a ? a.getAttribute('href') : '#'; });

  function render() {
    var done = arr.filter(Boolean).length;
    var pct = n ? Math.round((done / n) * 100) : 0;
    items.forEach(function (it, i) {
      it.classList.toggle('is-done', !!arr[i]);
      var btn = it.querySelector('[data-part-toggle]');
      if (btn) btn.textContent = arr[i]
        ? (localStorage.getItem('ncn-lang') === 'EN' ? '✓ Read' : '✓ Đã đọc')
        : (localStorage.getItem('ncn-lang') === 'EN' ? 'Mark as read' : 'Đánh dấu đã đọc');
    });
    detail.querySelectorAll('[data-series-fill]').forEach(function (f) { f.style.width = pct + '%'; });
    detail.querySelectorAll('[data-series-fill-top]').forEach(function (f) { f.style.width = pct + '%'; });
    detail.querySelectorAll('[data-series-done]').forEach(function (d) { d.textContent = done; });
    detail.querySelectorAll('[data-series-pct]').forEach(function (p) { p.textContent = pct + '%'; });
    detail.querySelectorAll('[data-series-label]').forEach(function (l) {
      l.textContent = done + '/' + n + (l.closest('.sd-strip') ? (' phần · ' + pct + '%') : ' phần');
    });
    var circ = 163.4;
    detail.querySelectorAll('[data-series-circle]').forEach(function (c) { c.setAttribute('stroke-dashoffset', circ - circ * pct / 100); });
    // continue → bài chưa đọc đầu tiên
    var nextIdx = arr.indexOf(false);
    detail.querySelectorAll('[data-series-continue]').forEach(function (b) {
      b.setAttribute('href', nextIdx >= 0 ? links[nextIdx] : links[0]);
    });
  }

  items.forEach(function (it, i) {
    var btn = it.querySelector('[data-part-toggle]');
    if (btn) btn.addEventListener('click', function (e) {
      e.preventDefault();
      arr[i] = !arr[i]; seriesWrite(id, arr); render();
    });
  });
  var reset = detail.querySelector('[data-series-reset]');
  if (reset) reset.addEventListener('click', function () { arr = new Array(n).fill(false); seriesWrite(id, arr); render(); });
  render();
}

/* ── Contact form (Web3Forms + success state) ───────────── */
function initContactForm() {
  var form = document.querySelector('[data-contact-form]');
  if (!form) return;
  var wrap = document.querySelector('[data-contact-form-wrap]');
  var success = document.querySelector('[data-contact-success]');
  var msg = form.querySelector('[data-msg]');
  var counter = form.querySelector('[data-counter]');
  var pills = form.querySelectorAll('[data-topic-pills] [data-topic]');
  var topicInput = form.querySelector('[data-topic-value]');
  var resetBtn = document.querySelector('[data-contact-reset]');

  if (msg && counter) msg.addEventListener('input', function () { counter.textContent = msg.value.length; });
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      pills.forEach(function (x) { x.classList.remove('active'); });
      p.classList.add('active');
      if (topicInput) topicInput.value = p.dataset.topic;
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success) { if (wrap) wrap.hidden = true; if (success) success.hidden = false; }
        else { alert((res && res.message) || 'Gửi thất bại, vui lòng thử lại.'); }
      })
      .catch(function () { alert('Lỗi mạng, vui lòng thử lại.'); });
  });

  if (resetBtn) resetBtn.addEventListener('click', function () {
    form.reset();
    if (counter) counter.textContent = '0';
    if (success) success.hidden = true;
    if (wrap) wrap.hidden = false;
  });
}

/* ── Search overlay (fetch /index.json, lọc client-side) ─── */
function initSearch() {
  var overlay = document.querySelector('[data-search-overlay]');
  if (!overlay) return;
  var openers = document.querySelectorAll('[data-search-open]');
  var closeBtn = overlay.querySelector('[data-search-close]');
  var box = overlay.querySelector('[data-search-box]');
  var input = overlay.querySelector('[data-search-input]');
  var results = overlay.querySelector('[data-search-results]');
  var hint = overlay.querySelector('[data-search-hint]');
  var empty = overlay.querySelector('[data-search-empty]');
  var suggests = overlay.querySelectorAll('[data-search-suggest]');
  var data = null, loaded = false;

  function load() {
    if (loaded) return;
    loaded = true;
    fetch('/index.json').then(function (r) { return r.json(); }).then(function (j) { data = j; })
      .catch(function () { data = []; });
  }
  function open() { load(); overlay.hidden = false; document.body.style.overflow = 'hidden'; setTimeout(function () { input.focus(); }, 30); }
  function close() { overlay.hidden = true; document.body.style.overflow = ''; input.value = ''; render(''); }

  function score(item, q) {
    var t = item.title.toLowerCase(), tags = (item.tags || []).join(' ').toLowerCase(), s = (item.summary || '').toLowerCase();
    if (t.indexOf(q) !== -1) return 3;
    if (tags.indexOf(q) !== -1) return 2;
    if (s.indexOf(q) !== -1) return 1;
    return 0;
  }
  function render(q) {
    q = (q || '').toLowerCase().trim();
    if (!q) { results.innerHTML = ''; if (hint) hint.hidden = false; if (empty) empty.hidden = true; return; }
    if (hint) hint.hidden = true;
    var hits = (data || []).map(function (it) { return { it: it, s: score(it, q) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; }).slice(0, 8);
    if (!hits.length) { results.innerHTML = ''; if (empty) empty.hidden = false; return; }
    if (empty) empty.hidden = true;
    results.innerHTML = hits.map(function (x) {
      var it = x.it;
      return '<a class="search-hit" href="' + it.url + '">' +
        '<div class="search-hit__title">' + it.title + '</div>' +
        '<div class="search-hit__meta">' + (it.category || '') + ' · ' + it.read + ' min · ' + it.date + '</div>' +
        '</a>';
    }).join('');
  }

  openers.forEach(function (b) { b.addEventListener('click', open); });
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) close(); });
  if (input) input.addEventListener('input', function () { render(input.value); });
  suggests.forEach(function (s) { s.addEventListener('click', function () { input.value = s.dataset.searchSuggest; render(input.value); input.focus(); }); });
}

/* ── Boot ───────────────────────────────────────────────── */
/* ── Giscus: đồng bộ theme khi iframe load xong ─────────── */
function initGiscus() {
  if (!document.querySelector('.comments__giscus')) return;
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://giscus.app') return;
    if (!e.data || e.data.giscus === undefined) return;
    syncGiscusTheme();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  initMobileNav();
  initLang();
  initReadingProgress();
  initTOC();
  initCopyLink();
  initCopyCode();
  initCatFilter();
  initSeriesTabs();
  initSeriesProgress();
  initContactForm();
  initSearch();
  initGiscus();
});

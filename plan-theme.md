# Task list: chỉnh Website & Theme cho khớp thiết kế

> Theme Hugo hiện tại là skeleton (CSS gần trống) → dựng lại đúng thiết kế
> **Nguyen Chung Notebook** trong mockup.
>
> - Mockup HTML (nguồn chuẩn): `/Volumes/WorkSpace/Datahub/ChungND/mockup/*.dc.html`
> - Design system (tham khảo): `/Volumes/WorkSpace/Datahub/ChungND/mockup/ncn-design-system/`
> - Ảnh đối chiếu: `/Volumes/WorkSpace/Datahub/ChungND/imgs/*.pdf`
> - Ảnh bìa mẫu: `/Volumes/WorkSpace/Datahub/ChungND/mockup/covers/*.png`
>
> **Cách dùng:** làm xong mục nào đổi `- [ ]` → `- [x]`.

---

## ⚠️ Ghi nhớ trước khi code
- Có 2 nguồn token màu khác nhau → **bám theo mockup `.dc.html`** (cái đã render ra PDF user duyệt), KHÔNG lấy màu từ `ncn-design-system`.
  - accent `#F97316` (không phải `#FF9800`); nền dark `#0D1117`; category: IT cam `#F97316` · Auto green `#22C55E` · EN blue `#3B82F6` · CN red `#EF4444`.
- Mockup dùng framework "DC" (`x-dc`, `sc-for`, `{{ }}`) — KHÔNG phải Hugo. Chỉ dịch ý tưởng sang Hugo template + CSS + vanilla JS.

---

## ⛳ Phase 0 — Chốt quyết định (ĐÃ CHỐT)
- [x] **Song ngữ**: UI song ngữ VI/EN, **mặc định VI**. Nút VI/EN đổi label giao diện (nav, button, nhãn) — **nội dung bài viết giữ nguyên VI, không dịch**. ⇒ dùng từ điển UI string + JS toggle (như mockup), KHÔNG nhân đôi content, KHÔNG dùng multilingual content mode.
- [x] **Lượt xem / độc giả/tháng**: làm CUỐI CÙNG, nghiên cứu thêm → tạm bỏ khỏi Phase 1-3 (chỗ nào cần thì ẩn).
- [x] **Ảnh bìa**: giữ **SVG** (theo CLAUDE.md), đặt trong `static/images/`.
- [x] **Form liên hệ**: **Web3Forms** (`action=https://api.web3forms.com/submit` + `access_key` ẩn lưu trong `hugo.toml`). ⚠️ Cần user cung cấp access key.
- [x] **Tiến độ series (mark-as-read)**: **có** — JS + localStorage `ncn-series-*`.

---

## 🧱 Phase 1 — Nền tảng (lên hình tĩnh, VI, dark/light)

### 1.1 CSS tokens & base (`assets/css/main.css`)
- [x] Khai báo `:root` (dark mặc định): `--c-bg/#0D1117`, `--c-surface/#161B22`, `--c-card/#1C2128`, `--c-code/#0A0E14`, `--c-border/#30363D`, `--c-text/#E6EDF3`, `--c-text2/#8B949E`
- [x] Khai báo `[data-theme="light"]`: `#F6F8FA / #FFFFFF / #FFFFFF / #D0D7DE / #1F2937 / #57606A`
- [x] Accent + category cố định: `--c-accent/#F97316`, `--c-accent-hover/#EA6C10`, `--cat-it/-auto/-en/-cn`
- [x] Reset (`box-sizing`, margin/padding 0, `a` reset) + biến layout (container 1200px, padding 32px/18px)
- [x] Import Google Fonts: Space Grotesk + JetBrains Mono (qua `<link>` trong head.html)
- [x] `@keyframes`: `blink`, `fadeUp`, `chipFloat`, `floaty`, `checkPop` + bọc `prefers-reduced-motion`
- [x] Utility classes dùng lại: `.container`, `.btn`/`.btn--primary`, `.tag-pill`, `.badge`, `.section-head`

### 1.2 Head + JS nền
- [x] `_partials/head.html`: thêm fonts, meta description/OG/canonical, link `main.css` (fingerprint)
- [x] Inline script chống FOUC (set `data-theme` từ localStorage ngay đầu `<head>`)
- [x] `assets/js/main.js`: `initTheme()` (toggle dark/light + icon ☀/☽ + lưu localStorage)
- [x] `main.js`: `initMobileNav()` (mở/đóng burger menu)
- [x] `main.js`: `initLang()` — toggle VI/EN cho **UI string** (mặc định VI, lưu `ncn-lang`); dịch phần tử có `data-vi`/`data-en`. KHÔNG đụng `.Content` bài viết.
- [x] Từ điển UI string VI/EN: dùng cơ chế `data-vi`/`data-en` trên template (đặt trực tiếp tại nhãn).

### 1.3 Khung chung
- [x] `baseof.html`: `<html data-theme lang>`, gắn navbar + mobile nav + `{{ block "main" }}` + footer _(search overlay để Phase 4)_
- [x] `_partials/header.html`: navbar 64px sticky blur — logo "NC" + menu (category lấy từ `hugo.toml`) + nút lang(VI⇄EN)/theme + burger _(search btn để Phase 4)_
- [x] `_partials/nav-mobile.html`: menu mobile xổ xuống
- [x] `_partials/footer.html`: footer lớn (home) + footer gọn (trang con)
- [x] `hugo.toml`: `[params]` + `[[params.categories]]` (it/automation/english/chinese: label VI/EN + emoji + class màu) + `paginate=6` + markup TOC/unsafe

### 1.4 Partial tái sử dụng
- [x] `_partials/post-card.html`: thumb 150px + bottom gradient bar theo category + tag + title + meta
- [x] `_partials/series-card.html`: cover + badge category + số phần + desc + CTA _(progress để Phase 3)_
- [x] `_partials/terms.html`: restyle thành tag pill `#tag` (mono)
- [x] Fallback ảnh: gradient + emoji category khi thiếu `thumbnail`

---

## 📄 Phase 2 — Các trang chính

### 2.1 Homepage (`home.html`)
- [ ] Hero: grid dots + glow cam, badge, H1 + dòng cam (typed optional), subtitle, 2 CTA, chip tag float
- [ ] Hero stats: số bài thật (`len .Site.RegularPages`), readers (tĩnh/bỏ), số series
- [ ] Featured post card 2 cột (bài `featured: true` hoặc mới nhất)
- [ ] Category grid 4 card (💻🤖🇬🇧🀄) + số bài thật từ taxonomy + glow theo màu
- [ ] 4 section theo category (IT/Auto/EN/CN): heading vạch màu + "Xem tất cả →" + 3 post-card mới nhất
- [ ] Series showcase: 3 series nổi bật từ taxonomy `series`

### 2.2 Post (`page.html`) + CSS nội dung
- [ ] Progress bar fixed 3px cam (JS `initReadingProgress()`)
- [ ] Header: breadcrumb + tag category + H1 + meta (avatar/author/date/`.ReadingTime`/tags)
- [ ] Grid 3 cột `240px 1fr 280px`, mobile xếp dọc
- [ ] TOC trái sticky từ `.TableOfContents` + `initTOC()` scroll-spy + nút share
- [ ] Series banner (nếu bài thuộc series) + prev/next theo `weight`
- [ ] Author card cuối bài
- [ ] Sidebar phải: Related (cùng category) + Top posts + Tag cloud
- [ ] CSS `.post__content`: h2 underline, p, `pre`/code (nền `--c-code`, mono), table, blockquote/callout

### 2.3 CategoryList (`term.html` cho categories)
- [ ] Hero category: breadcrumb + icon màu + tên/mô tả + số bài + pill chuyển category
- [ ] Toolbar: search (JS lọc DOM) + filter tag (JS) + sort Newest/Popular
- [ ] List bài dạng hàng ngang: thumb 260×168 + tag/title/excerpt/meta + badge NEW
- [ ] Pagination `{{ .Paginator }}` style nút tròn 38px active theo màu category
- [ ] Sidebar: thống kê + popular tags + top posts + other categories

### 2.4 Taxonomy index (`taxonomy.html`)
- [ ] Lưới term dạng pill/card cho `/tags/` và `/categories/`

---

## 📚 Phase 3 — Series & trang phụ

### 3.1 Series
- [ ] Series list (taxonomy `series`): hero + 3 stat + filter tab category (JS) + grid series card
- [ ] Series detail (`series/term.html`): hero gradient + icon mờ + breadcrumb + author box
- [ ] Series detail: strip tiến độ + nút Tiếp tục/Reset + timeline `.Pages.ByWeight` (dot/số/tag/duration)
- [ ] Series detail sidebar: vòng tròn % SVG + info (phần/giờ/level/tag) + other series
- [ ] `main.js`: `initSeriesProgress()` (localStorage `ncn-series-*`) — nếu Phase 0 chốt làm

### 3.2 About (`about.html`)
- [ ] Hero: avatar gradient "NC" + badge + tên/chức danh/bio + 2 CTA + 3 stat card
- [ ] Skills: 2 card progress-bar + 2 card chip (EN/CN)
- [ ] Tech stack chips (mono, hover đổi màu)
- [ ] Timeline hành trình (2019→2025) + CTA banner
- [ ] Đưa dữ liệu vào `content/about/index.md` hoặc hard-code layout

### 3.3 Contact (`contact.html`)
- [ ] Hero ✉ + title + sub
- [ ] Form: name/email + topic pills + subject + message + counter 500 + submit
- [ ] Panel phải: direct contact (email/LinkedIn/GitHub/YouTube) + response time + topics
- [ ] Gắn service form (Formspree/Web3Forms) hoặc `mailto:` + trạng thái success (JS)

### 3.4 404 (`404.html`)
- [ ] Nền grid + glow + "404" số 0 cam float
- [ ] Terminal card (`$ cd ... → Error 404 → cd ~/home`)
- [ ] Title + desc + 2 CTA + 4 quick-link card

---

## 🔧 Phase 4 — Nâng cao (optional)
- [ ] Search overlay + Fuse.js + JSON index (`initSearch()` lọc thật)
- [ ] Hoàn thiện phủ UI string VI/EN cho toàn bộ trang (rà soát nhãn còn sót)
- [ ] Lượt xem / độc giả/tháng (nghiên cứu nguồn số liệu — đã hoãn từ Phase 0)
- [ ] Code block render hook (terminal traffic-light + tên file)
- [ ] Callout shortcodes (Pros/Cons, TL;DR)
- [ ] Rà responsive toàn bộ + `prefers-reduced-motion`

---

## ⚙️ Cấu hình & content (làm song song khi cần)
- [ ] `hugo.toml`: `title`, `baseURL`, `[params]` (author/role/email/tagline/socials/readers), `[menus]` (Home/IT/Auto/EN/CN/Series/About)
- [ ] `[params.categoryMeta]`: map it/auto/eng/cn → màu + emoji + mô tả
- [ ] (tuỳ chọn) `[markup.goldmark.renderer] unsafe=true`, `[markup.tableOfContents]`
- [ ] `archetypes/default.md` & `series.md`: thêm `featured=false`, đảm bảo `summary`
- [ ] Bổ sung `categories/tags/series(+weight)/thumbnail/summary` cho các bài hiện có
- [ ] Đặt avatar + ảnh OG vào `static/images/`

---

## ✅ Kiểm thử cuối mỗi phase
- [ ] `hugo server --buildDrafts` chạy không lỗi, xem `http://localhost:1313`
- [ ] Dark/Light toggle hoạt động, không nháy FOUC
- [ ] Responsive mobile (navbar burger, grid co lại)
- [ ] Build production `hugo` không warning nghiêm trọng

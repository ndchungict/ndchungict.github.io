# Hugo Blog Page

## Project Overview

Hugo static site blog với custom theme tự phát triển.

- **Hugo version**: 0.163.3
- **Theme**: `hugo-blog-theme` (custom, nằm trong `themes/hugo-blog-theme/`)
- **Dev server**: `hugo server --buildDrafts` → http://localhost:1313

## Project Structure

```
hugo-blog-page/
├── archetypes/
│   ├── default.md        # Template mặc định cho mọi bài viết
│   └── series.md         # Template cho bài thuộc series (có thêm trường weight)
├── content/
│   ├── _index.md         # Homepage
│   ├── about/index.md    # Trang About
│   ├── contact/index.md  # Trang Contact
│   └── posts/            # Bài viết blog
├── themes/hugo-blog-theme/
│   ├── layouts/
│   │   ├── baseof.html   # Layout gốc (wrapper cho tất cả trang)
│   │   ├── home.html     # Trang chủ
│   │   ├── about.html    # Trang About
│   │   ├── contact.html  # Trang Contact (có sẵn HTML form)
│   │   ├── page.html     # Single post (hiển thị categories, tags, series, authors)
│   │   ├── section.html  # Danh sách bài trong một section
│   │   ├── taxonomy.html # Danh sách tất cả terms (/categories/, /tags/,...)
│   │   ├── term.html     # Danh sách bài theo term (/categories/tech/,...)
│   │   ├── 404.html      # Trang 404 Not Found
│   │   └── _partials/    # header, footer, menu, head, terms
│   └── assets/
│       ├── css/main.css  # CSS chính
│       └── js/main.js    # JS chính
├── static/               # Files tĩnh (images, fonts,...)
├── hugo.toml             # Cấu hình site
└── public/               # Build output (gitignored)
```

## Content

### Quy tắc đặt tên file

Tên file bài viết theo format: `yyyyMMdd-hhmm-ten-bai-viet.md`

- `yyyyMMdd` — ngày viết (ví dụ: `20260629`)
- `hhmm` — giờ:phút (ví dụ: `0800`)
- `ten-bai-viet` — slug kebab-case

Ví dụ: `20260629-0800-git-la-gi-tai-sao-can-dung-git.md`

> Lưu ý: `slug` trong front matter vẫn **không có prefix ngày giờ**, chỉ là `git-la-gi-tai-sao-can-dung-git`. Hugo dùng `slug` để tạo URL, không dùng tên file khi `slug` được khai báo.

### Tạo bài viết mới

```bash
hugo new content posts/<ten-bai>.md
# Rồi đổi tên file: mv <ten-bai>.md <yyyyMMdd-hhmm-ten-bai>.md
```

Front matter mặc định (`archetypes/default.md`):

```toml
+++
date        = '...'
draft       = true
title       = '...'
slug        = ''          # để trống = dùng tên file làm URL
summary     = ''          # để trống = Hugo tự lấy ~70 từ đầu
thumbnail   = ''          # ảnh mặc định theo category (xem mục Thumbnail)
categories  = []
tags        = []
series      = []
authors     = ['Nguyen Chung']
+++
```

### Tạo bài trong series

```bash
hugo new content series/<ten-bai>.md
```

Front matter (`archetypes/series.md`) — thêm trường `weight` để xác định thứ tự:

```toml
+++
date        = '...'
draft       = true
title       = '...'
slug        = ''
summary     = ''
thumbnail   = ''
weight      = 1           # thứ tự bài trong series (1, 2, 3,...)
categories  = []
tags        = []
series      = []
authors     = ['Nguyen Chung']
+++
```

Render danh sách bài trong series theo đúng thứ tự dùng `.ByWeight`:
```html
{{ range .Pages.ByWeight }}
```

- Bài có `draft = true` chỉ hiển thị khi chạy `hugo server --buildDrafts`
- Đổi thành `draft = false` khi muốn publish

### Build production

```bash
hugo
# Output nằm trong public/
```

## URLs & Permalinks

Cấu hình trong `hugo.toml`:
```toml
[permalinks]
  posts = '/posts/:slug/'
```

- Nếu `slug` để trống → Hugo dùng tên file làm URL
- Nếu `slug` có giá trị → Hugo dùng giá trị đó

Ví dụ:
```
File: posts/huong-dan-hugo.md, slug = ''           → /posts/huong-dan-hugo/
File: posts/huong-dan-hugo.md, slug = 'cai-hugo'  → /posts/cai-hugo/
```

## Pages

| Trang    | Content file              | Layout              | URL        |
|----------|---------------------------|---------------------|------------|
| Homepage | `content/_index.md`       | `layouts/home.html` | `/`        |
| About    | `content/about/index.md`  | `layouts/about.html`| `/about/`  |
| Contact  | `content/contact/index.md`| `layouts/contact.html`| `/contact/`|
| 404      | _(không cần)_             | `layouts/404.html`  | `/404.html`|

## Taxonomies

Được định nghĩa trong `hugo.toml`:

| Singular | Plural     | URL             |
|----------|------------|-----------------|
| category | categories | `/categories/`  |
| tag      | tags       | `/tags/`        |
| series   | series     | `/series/`      |
| author   | authors    | `/authors/`     |

Hugo tự sinh 2 loại trang cho mỗi taxonomy:
- `/categories/` — liệt kê tất cả categories (dùng `taxonomy.html`)
- `/categories/tech/` — liệt kê tất cả bài có category "tech" (dùng `term.html`)

## Thumbnail (ảnh đại diện bài viết)

Thumbnail là file `.webp` (1200×630, chuẩn OG image), tham chiếu qua front matter:

```toml
thumbnail = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
```

Thumbnail dùng cho ảnh card trong danh sách (`section.html`, `home.html`).

### Quy tắc tạo thumbnail cho bài mới

> **KHÔNG tạo file ảnh SVG mới nữa.** Khi tạo bài viết mới, dùng ảnh mặc định
> theo `category` của bài, lấy từ `static/images/default-thumb/`.

Map `category` → ảnh mặc định:

| Category (`key`) | Thumbnail mặc định |
|------------------|--------------------|
| `it`             | `/images/default-thumb/default-thumb-it-lap-trinh.webp` |
| `automation`     | `/images/default-thumb/default-thumb-it-lap-trinh.webp` |
| `english`        | `/images/default-thumb/default-thumb-tieng-anh.webp` |
| `chinese`        | `/images/default-thumb/default-thumb-tieng-trung.webp` |

- Lấy category đầu tiên trong front matter `categories` để chọn ảnh.
- Nếu bài đã có ảnh `.webp` riêng (đặt trong `static/images/<chu-de>/`) thì dùng ảnh đó thay cho ảnh mặc định.

## Comments (Giscus)

Comment dùng [Giscus](https://giscus.app) — lưu bình luận trong **GitHub Discussions** của repo.

### Cấu trúc

| File | Vai trò |
|------|---------|
| `hugo.toml` → `[params.giscus]` | Toàn bộ config (bật/tắt, repo, ID, theme,...) |
| `layouts/_partials/comments.html` | Render script Giscus, chỉ hiện khi `enable = true` và đã điền đủ ID |
| `layouts/page.html` | Nhúng `{{ partial "comments.html" . }}` ở cuối cột bài viết, sau author-card |
| `assets/js/main.js` → `syncGiscusTheme()` / `initGiscus()` | Đồng bộ theme Giscus với light/dark của site |
| `assets/css/main.css` → `.comments` | Style khung bao quanh Giscus (chỉ là divider + spacing) |
| `static/css/giscus-light.css` | Custom theme Giscus — chế độ sáng (khớp màu/font site) |
| `static/css/giscus-dark.css` | Custom theme Giscus — chế độ tối |

### Theming

Giscus render trong `<iframe>` → **CSS của site không can thiệp được** nội dung bên trong.
Giao diện đến từ custom theme CSS đặt trong `static/css/giscus-*.css`, trỏ tới qua `themeLight`/`themeDark`.

- Hai file CSS này set biến Primer (`--color-*`) theo bảng màu site + bo góc card bình luận.
- `data-theme` trỏ tới **URL tuyệt đối** của file CSS (Hugo tự `absURL` khi giá trị bắt đầu bằng `/`).
- JS đổi theme light↔dark khi user bấm nút chuyển chế độ (gửi `postMessage` tới iframe Giscus).
- Tiêu đề "Bình luận" + reactions là do **Giscus tự render** (dịch nhờ `lang = 'vi'`) — partial **không** tự thêm `<h2>` để tránh trùng.

> ⚠️ Custom theme CSS phải truy cập được qua **HTTPS công khai**. Trên `hugo server` (localhost) giscus.app không fetch được file → tạm fallback theme mặc định. Chỉ hiển thị đúng sau khi **deploy** với `baseURL` thật trong `hugo.toml`.

### Config (`hugo.toml`)

```toml
[params.giscus]
  enable      = false              # true để bật comment
  repo        = ''                 # ví dụ: 'ndchungict/hugo-blog-page'
  repoId      = ''                 # lấy từ giscus.app
  category    = 'Announcements'    # tên category trong Discussions
  categoryId  = ''                 # lấy từ giscus.app
  mapping     = 'pathname'         # map bài viết ↔ discussion theo URL
  reactionsEnabled = '1'
  inputPosition    = 'bottom'
  lang        = 'vi'
  themeLight  = '/css/giscus-light.css'   # tên builtin HOẶC path file CSS custom
  themeDark   = '/css/giscus-dark.css'
```

### Bật comment (lần đầu)

1. Repo GitHub → Settings → *Features* → tick **Discussions**
2. Cài app: https://github.com/apps/giscus → Install → chọn repo
3. Vào https://giscus.app, nhập repo → copy `repoId` + `categoryId` vào `hugo.toml`, đặt `enable = true`

> `mapping = 'pathname'` map discussion theo đường dẫn URL. Vì URL dựa trên `slug` (ổn định) nên đổi tên file không làm mất comment.

## Theme Development

Theme đang ở giai đoạn skeleton — layout có cấu trúc HTML + BEM class names sẵn, CSS gần như trống. Khi phát triển UI:
- Chỉnh layout: `themes/hugo-blog-theme/layouts/`
- Chỉnh style: `themes/hugo-blog-theme/assets/css/main.css`
- Partials: `themes/hugo-blog-theme/layouts/_partials/`

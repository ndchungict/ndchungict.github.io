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
thumbnail   = ''          # đường dẫn ảnh, đặt trong static/images/
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

Thumbnail là file SVG đặt trong `static/images/<chu-de>/`, tham chiếu qua front matter:

```toml
thumbnail = '/images/git-series/01-git-la-gi.svg'
```

### Quy tắc thiết kế SVG thumbnail

- **Kích thước**: `1200×630` (tỉ lệ 16:9, chuẩn OG image)
- **Dùng cho hai nơi**: ảnh header trong bài viết (`page.html`) và ảnh card trong danh sách (`section.html`, `home.html`)
- **Minh họa**: thuần visual, gắn với nội dung bài — không đưa tag, weight, series, số thứ tự vào ảnh
- **Không có metadata** trong ảnh: không tag, không số bài, không tên series

### Cấu trúc SVG

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <!-- 1. Gradient background (linearGradient hoặc radialGradient) -->
  <!-- 2. Texture nhẹ (dot grid, line grid, ...) opacity thấp ~0.04–0.08 -->
  <!-- 3. Minh họa chính liên quan đến nội dung bài -->
  <!-- 4. KHÔNG có text metadata (tag / series / weight) -->
</svg>
```

### Bảng màu theo chủ đề

| Chủ đề | Gradient | Dùng cho |
|--------|----------|----------|
| Cam-đỏ | `#ea580c` → `#991b1b` | Khái niệm, giới thiệu |
| Xanh navy | `#1e3a8a` → `#0f0f2e` | Cài đặt, cấu hình |
| Xanh lá | `#065f46` → `#022c22` | Cơ bản, workflow |
| Tím | `#5b21b6` → `#1e1b4b` | Remote, kết nối |
| Teal | `#0e7490` → `#042f2e` | Branch, parallel |
| Xanh đậm | `#1e3a5f` → `#0f0a2e` | Rebase, advanced flow |
| Đen | `#111827` → `#030712` | Nâng cao, tools |
| Hổ phách | `#78350f` → `#1c0a00` | Automation, hooks |

### Các loại minh họa đã dùng

- **Network nodes**: vòng tròn nối nhau bằng đường thẳng → chủ đề phân tán, kết nối
- **Terminal window**: khung terminal với traffic lights và code lines → cài đặt, lệnh
- **Workflow boxes**: các ô chữ nhật nối nhau bằng mũi tên → quy trình nhiều bước
- **Cloud + laptop**: shape cloud và shape laptop nối nhau → remote/local
- **Git graph**: đường ngang (main) + đường cong (branch) + chấm tròn (commit) → branch/merge
- **Before/after split**: chia đôi canvas, hiện trạng thái trước và sau → rebase, transform
- **Stacked cards**: nhiều card màu sắc khác nhau, mỗi card = một lệnh → nâng cao
- **Pipeline boxes**: các ô nối nhau bằng mũi tên theo chiều ngang → automation, hooks

## Comments (Giscus)

Comment dùng [Giscus](https://giscus.app) — lưu bình luận trong **GitHub Discussions** của repo.

### Cấu trúc

| File | Vai trò |
|------|---------|
| `hugo.toml` → `[params.giscus]` | Toàn bộ config (bật/tắt, repo, ID, theme,...) |
| `layouts/_partials/comments.html` | Render script Giscus, chỉ hiện khi `enable = true` và đã điền đủ ID |
| `layouts/page.html` | Nhúng `{{ partial "comments.html" . }}` ở cuối cột bài viết, sau author-card |
| `assets/js/main.js` → `syncGiscusTheme()` / `initGiscus()` | Đồng bộ theme Giscus với light/dark của site |
| `assets/css/main.css` → `.comments` | Style khung comment |

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
  theme       = 'dark'             # khớp data-theme của site
  lang        = 'vi'
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

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

### Tạo bài viết mới

```bash
hugo new content posts/<ten-bai>.md
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

## Theme Development

Theme đang ở giai đoạn skeleton — layout có cấu trúc HTML + BEM class names sẵn, CSS gần như trống. Khi phát triển UI:
- Chỉnh layout: `themes/hugo-blog-theme/layouts/`
- Chỉnh style: `themes/hugo-blog-theme/assets/css/main.css`
- Partials: `themes/hugo-blog-theme/layouts/_partials/`

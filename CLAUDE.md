# Hugo Blog Page

## Project Overview

Hugo static site blog với custom theme tự phát triển.

- **Hugo version**: 0.163.3
- **Theme**: `hugo-blog-theme` (custom, nằm trong `themes/hugo-blog-theme/`)
- **Dev server**: `hugo server --buildDrafts` → http://localhost:1313

## Project Structure

```
hugo-blog-page/
├── content/              # Nội dung bài viết và trang
├── themes/hugo-blog-theme/
│   ├── layouts/          # HTML templates
│   │   ├── baseof.html   # Layout gốc (wrapper)
│   │   ├── home.html     # Trang chủ
│   │   ├── page.html     # Trang đơn
│   │   ├── section.html  # Danh sách bài viết
│   │   └── _partials/    # header, footer, menu, head
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

Front matter mặc định (TOML):

```toml
+++
date       = '...'
draft      = true
title      = '...'
categories = []
tags       = []
series     = []
authors    = []
+++
```

- Bài có `draft = true` chỉ hiển thị khi chạy `hugo server --buildDrafts`
- Đổi thành `draft = false` khi muốn publish

### Build production

```bash
hugo
# Output nằm trong public/
```

## Taxonomies

Được định nghĩa trong `hugo.toml`:

| Singular  | Plural       | URL                   |
|-----------|--------------|-----------------------|
| category  | categories   | /categories/          |
| tag       | tags         | /tags/                |
| series    | series       | /series/              |
| author    | authors      | /authors/             |

Dùng trong front matter:

```toml
categories = ["Tech", "DevOps"]
tags       = ["hugo", "golang"]
series     = ["Getting Started"]
authors    = ["ChungND"]
```

## Theme Development

Theme đang ở giai đoạn skeleton — layout có sẵn nhưng CSS gần như trống. Khi phát triển UI:
- Chỉnh layout: `themes/hugo-blog-theme/layouts/`
- Chỉnh style: `themes/hugo-blog-theme/assets/css/main.css`
- Partials: `themes/hugo-blog-theme/layouts/_partials/`

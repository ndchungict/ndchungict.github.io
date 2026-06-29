# Nguyen Chung Notebook

Blog cá nhân xây bằng [Hugo](https://gohugo.io/) với theme tự phát triển, deploy lên GitHub Pages.

🔗 **Live:** https://ndchungict.github.io/

## Tech stack

- **Hugo** `0.163.3` (extended)
- **Theme:** `hugo-blog-theme` — custom, nằm trong [`themes/hugo-blog-theme/`](themes/hugo-blog-theme/)
- **Comments:** [Giscus](https://giscus.app) (lưu trong GitHub Discussions)
- **Hosting:** GitHub Pages, build & deploy tự động bằng GitHub Actions

## Chạy local

```bash
hugo server --buildDrafts   # http://localhost:1313
```

`--buildDrafts` để xem cả bài đang ở trạng thái `draft = true`.

## Cấu trúc thư mục

```
├── archetypes/        # Template front matter cho bài viết mới
├── content/
│   ├── _index.md      # Homepage
│   ├── about/         # Trang About
│   ├── contact/       # Trang Contact
│   └── posts/         # Bài viết blog
├── themes/hugo-blog-theme/
│   ├── layouts/       # Templates (baseof, home, page, section, taxonomy,...)
│   └── assets/        # css/main.css, js/main.js
├── static/            # Files tĩnh (images, css/giscus-*.css,...)
├── hugo.toml          # Cấu hình site
└── .github/workflows/ # CI/CD deploy lên GitHub Pages
```

## Viết bài mới

```bash
hugo new content posts/ten-bai.md
```

Đổi tên file theo format `yyyyMMdd-hhmm-ten-bai-viet.md`, ví dụ:

```bash
mv ten-bai.md 20260629-0800-git-la-gi.md
```

Đặt `draft = false` trong front matter khi muốn publish. Chi tiết quy tắc đặt tên, thumbnail, series, taxonomy... xem trong [CLAUDE.md](CLAUDE.md).

## Build production

```bash
hugo            # output nằm trong public/ (gitignored)
```

## Deploy

Mỗi lần push lên branch `main`, [GitHub Actions](.github/workflows/hugo.yml) tự build Hugo và deploy lên GitHub Pages — không cần build thủ công.

Cấu hình GitHub: **Settings → Pages → Source: GitHub Actions**.

## License

Nội dung bài viết © Nguyen Chung. Code theme dùng tự do.

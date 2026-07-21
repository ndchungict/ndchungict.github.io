# Nguyen Chung Notebook

[![Deploy Hugo site to Pages](https://github.com/ndchungict/ndchungict.github.io/actions/workflows/hugo.yml/badge.svg)](https://github.com/ndchungict/ndchungict.github.io/actions/workflows/hugo.yml)
[![Hugo](https://img.shields.io/badge/Hugo-0.163.3%2B-ff4088?logo=hugo&logoColor=white)](https://gohugo.io/)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fndchungict.github.io&label=demo)](https://ndchungict.github.io/)

Blog cá nhân mình xây bằng [Hugo](https://gohugo.io/) với theme tự phát triển (`hugo-blog-theme`), viết về IT/Automation Testing, Tiếng Anh và Tiếng Trung, deploy miễn phí trên GitHub Pages.

🔗 **Demo:** https://ndchungict.github.io/

Repo này được mình dọn sẵn để **bất kỳ ai cũng có thể fork về, đổi thông tin và có ngay một blog Hugo tiếng Việt cho riêng mình** — không cần tự dựng theme từ đầu. README này vừa giới thiệu site, vừa là hướng dẫn từng bước để bạn biến nó thành website của bạn.

### Tính năng có sẵn

- 🌗 Chuyển giao diện sáng/tối (light/dark)
- 🗂️ Phân loại bài viết theo category + subcategory (menu con tự ẩn mục chưa có bài)
- 📚 Hỗ trợ viết theo **series** (đánh thứ tự bằng `weight`)
- 📐 Layout trang bài viết chọn được **2 cột hoặc 3 cột** theo từng bài (`columns` trong front matter, mặc định 2 cột cho bài mới)
- 💬 Bình luận qua [Giscus](https://giscus.app) (lưu trong GitHub Discussions), tự đổi theme sáng/tối theo site
- 📨 Form liên hệ qua [Web3Forms](https://web3forms.com/) — không cần backend riêng
- 📡 Tự sinh RSS + JSON feed
- ⚙️ CI/CD build & deploy GitHub Pages tự động bằng GitHub Actions, không cần build tay

## Mục lục

- [Yêu cầu cài đặt](#yêu-cầu-cài-đặt)
- [Bắt đầu nhanh](#bắt-đầu-nhanh)
- [Tùy chỉnh thành website của riêng bạn](#tùy-chỉnh-thành-website-của-riêng-bạn)
- [Deploy lên GitHub Pages của riêng bạn](#deploy-lên-github-pages-của-riêng-bạn)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [License](#license)
- [Ghi chú và liên hệ tác giả gốc](#ghi-chú-và-liên-hệ-tác-giả-gốc)

## Yêu cầu cài đặt

| Công cụ | Bắt buộc? | Ghi chú |
|---|---|---|
| [Hugo **Extended**](https://gohugo.io/installation/) `≥ 0.163.3` | ✅ Có | Phải là bản **Extended**, không phải bản thường — cần cho việc xử lý asset của theme |
| [Git](https://git-scm.com/) | ✅ Có | Để clone repo và đẩy lên GitHub của bạn |
| [Go](https://go.dev/) | ❌ Không | Repo **không** dùng Hugo Modules (không có `go.mod`) — theme nằm sẵn trong `themes/hugo-blog-theme/`, không phải git submodule. Chỉ cần Go nếu bạn tự chuyển theme sang quản lý bằng Hugo Modules |

Cài Hugo nhanh bằng Homebrew (macOS/Linux):

```bash
brew install hugo
hugo version   # kiểm tra output có chữ "extended"
```

Windows hoặc cách cài khác: xem [trang cài đặt chính thức của Hugo](https://gohugo.io/installation/).

## Bắt đầu nhanh

```bash
# 1. Clone repo (đổi tên thư mục nếu muốn)
git clone https://github.com/ndchungict/ndchungict.github.io.git ten-site-cua-ban
cd ten-site-cua-ban

# 2. Chạy dev server
hugo server --buildDrafts
```

Mở [http://localhost:1313](http://localhost:1313) là xong — không cần `npm install`, không cần init submodule gì cả.

`--buildDrafts` để hiển thị cả bài đang ở trạng thái `draft = true` (front matter mặc định của bài mới tạo).

Build bản production (output vào `public/`, đã gitignore):

```bash
hugo --gc --minify
```

## Tùy chỉnh thành website của riêng bạn

### 1. Đổi/tùy biến theme

Theme khai báo ở đầu `hugo.toml`:

```toml
theme = 'hugo-blog-theme'
```

- **Giữ theme này, chỉ đổi màu/giao diện** → sửa `themes/hugo-blog-theme/assets/css/main.css` (và các file trong `assets/css/components/`); cấu trúc HTML nằm ở `themes/hugo-blog-theme/layouts/`.
- **Dùng theme Hugo khác** → tải theme mới vào `themes/<ten-theme>/`, đổi giá trị `theme` trong `hugo.toml` cho khớp. Lưu ý: các phần đặc thù của theme hiện tại (subcategories, series, Giscus,...) sẽ không tự hoạt động trên theme khác.

### 2. Sửa thông tin cá nhân

Gần như toàn bộ thông tin hiển thị nằm trong `hugo.toml`:

```toml
baseURL = 'https://<username>.github.io/'   # domain của bạn
title   = 'Tên site của bạn'

[params]
  description = 'Mô tả ngắn cho website của bạn'
  author      = 'Tên bạn'
  role        = 'Chức danh / nghề nghiệp'
  email       = 'ban@email.com'
  phone       = '...'
  tagline     = 'Khẩu hiệu ngắn'
  showAbout   = true   # true để hiện trang /about/

  [params.social]
    github   = 'https://github.com/<username>'
    linkedin = '...'
    facebook = '...'   # để trống = ẩn icon đó ở footer
```

Hai trang tĩnh khác sửa trực tiếp bằng Markdown:

- Trang **About**: `content/about/index.md`
- Trang **Contact**: `content/contact/index.md` (form dùng Web3Forms — lấy access key tại [web3forms.com](https://web3forms.com/) rồi điền vào `params.web3formsKey`)

Muốn bật bình luận Giscus, xem hướng dẫn chi tiết trong [CLAUDE.md](CLAUDE.md#comments-giscus).

### 3. Viết bài mới

```bash
hugo new content posts/<category>/<ten-bai>.md
```

Đổi tên file theo format `yyyyMMdd-hhmm-ten-bai-viet.md`, ví dụ:

```bash
mv ten-bai.md 20260629-0800-git-la-gi.md
```

Điền front matter (`title`, `categories`, `tags`,...), đặt `draft = false` khi muốn publish. Toàn bộ quy ước đặt tên file, chọn category/subcategory, thumbnail, series... được ghi chi tiết trong [CLAUDE.md](CLAUDE.md) — nên đọc qua trước khi viết bài đầu tiên.

Front matter có trường `columns` để chọn layout trang bài viết: `2` (mặc định — nội dung bên trái, TOC + sidebar gộp bên phải) hoặc `3` (kiểu cũ — TOC trái, nội dung giữa, sidebar phải riêng). Chi tiết ở [CLAUDE.md](CLAUDE.md#layout-bài-viết-2-cột-hoặc-3-cột).

> 💡 Nếu bạn dùng [Claude Code](https://claude.com/claude-code), repo có sẵn skill tại `.claude/skills/new-post/` tự động hoá toàn bộ bước trên (đặt tên file, front matter, thumbnail, cập nhật `post-library.md`) — chỉ cần mô tả bài viết bạn muốn tạo.

## Deploy lên GitHub Pages của riêng bạn

Workflow có sẵn tại [`.github/workflows/hugo.yml`](.github/workflows/hugo.yml) — tự build và deploy mỗi khi push lên nhánh `main`. Các bước cần làm khi chuyển sang tài khoản GitHub của bạn:

**1. Đặt tên repo**

| Muốn site chạy ở | Tên repo cần đặt |
|---|---|
| `https://<username>.github.io/` (domain gốc) | Đúng chính xác `<username>.github.io` |
| `https://<username>.github.io/<ten-repo>/` (project site) | Tuỳ ý |

**2. Đẩy code lên repo mới**

Cách nhanh nhất: bấm **Fork** trên GitHub. Hoặc clone rồi đổi remote thủ công:

```bash
git remote set-url origin https://github.com/<username>/<ten-repo>.git
git push -u origin main
```

**3. Bật GitHub Pages**

**Settings → Pages** → mục **Source**, chọn **GitHub Actions** (không chọn "Deploy from a branch").

**4. Không cần sửa gì trong file workflow**

Bước `configure-pages` trong `hugo.yml` tự nhận diện bạn đang dùng domain gốc hay project site rồi truyền đúng `--baseURL` cho Hugo lúc build — **dù đặt tên repo nào, workflow cũng chạy đúng ngay** mà không cần sửa YAML.

Dù vậy vẫn nên cập nhật `baseURL` ở đầu `hugo.toml` thành domain thật của bạn: giá trị này chỉ ảnh hưởng khi build local (lệnh `hugo` không kèm cờ `--baseURL`), không ảnh hưởng bản deploy trên Pages.

**5. Secrets?**

Không cần khai báo **Repository secret** nào để deploy — workflow dùng token tạm GitHub tự cấp (`permissions: pages: write, id-token: write`). Bạn chỉ cần *điền giá trị cấu hình* (không phải secret bí mật) trực tiếp vào `hugo.toml` nếu muốn bật thêm:

- **Giscus** (bình luận) — `repoId`/`categoryId` lấy từ [giscus.app](https://giscus.app) sau khi bật Discussions cho repo.
- **Web3Forms** (form Contact) — access key lấy từ [web3forms.com](https://web3forms.com/).

**6. Push và chờ deploy**

```bash
git push origin main
```

Vào tab **Actions** trên GitHub xem tiến trình — vài phút sau site sẽ live tại URL tương ứng.

## Cấu trúc thư mục

```
.
├── archetypes/                 # Front matter mặc định khi tạo bài mới
│   ├── default.md              # Bài thường
│   └── series.md                # Bài thuộc series (có thêm trường weight)
├── content/
│   ├── _index.md                # Homepage
│   ├── about/index.md           # Trang About
│   ├── contact/index.md         # Trang Contact
│   ├── posts/                    # Bài viết, chia thư mục theo category (chỉ để tổ chức file)
│   │   ├── it/
│   │   ├── english/
│   │   └── chinese/
│   └── series/                   # Trang danh sách cho từng series bài viết
├── themes/hugo-blog-theme/
│   ├── layouts/                  # Templates: baseof, home, page, section, taxonomy, _partials...
│   └── assets/                   # css/main.css, js/main.js
├── static/                       # File tĩnh: images, css/giscus-*.css, files/ (tài liệu đính kèm)
├── .github/workflows/hugo.yml   # CI/CD build & deploy GitHub Pages
├── hugo.toml                     # Cấu hình chính của site
├── CLAUDE.md                     # Quy ước chi tiết cho nội dung & theme
└── post-library.md               # Nhật ký toàn bộ bài viết (STT, ngày đăng, tiêu đề)
```

> `CLAUDE.md` ban đầu viết cho [Claude Code](https://claude.com/claude-code) nhưng đọc được như tài liệu convention bình thường — nên xem qua dù bạn không dùng AI hỗ trợ viết bài.

## License

Repo hiện **chưa có file `LICENSE`** chính thức. Trong khi đó:

- **Code** (theme, layout, CSS/JS, cấu hình, GitHub Actions workflow) — tự do dùng, sửa, deploy lại cho site của riêng bạn, không cần xin phép.
- **Nội dung bài viết** (mọi thứ trong `content/posts/`, `content/series/`,...) — thuộc bản quyền tác giả gốc (Nguyễn Chung), vui lòng **không** copy nguyên văn sang site khác. Khi fork, hãy thay bằng bài viết của riêng bạn.

Nếu cần một giấy phép rõ ràng hơn về mặt pháp lý cho phần code, hãy tự thêm file `LICENSE` (ví dụ [MIT](https://choosealicense.com/licenses/mit/)) vào repo sau khi fork.

## Ghi chú và liên hệ tác giả gốc

Repo này là blog cá nhân của mình, public sẵn để ai cần một blog Hugo tiếng Việt gọn nhẹ đều có thể fork về dùng ngay. Vài lưu ý nhỏ:

- Đây không phải theme "chuẩn thị trường" (chưa submit lên [Hugo Themes](https://themes.gohugo.io/)) — vài phần (form Contact, Giscus, danh sách category...) được viết khá gắn với nhu cầu cá nhân, bạn có thể cần chỉnh thêm cho vừa ý.
- Không có roadmap công khai hay cam kết hỗ trợ dài hạn cho theme, nhưng repo vẫn được cập nhật khi mình rảnh.
- Có câu hỏi, muốn góp ý hoặc báo lỗi, cứ liên hệ qua email hoặc mở issue trên GitHub.

**Nguyễn Chung** — Senior Automation Test Engineer
📧 ndchungict@gmail.com · 🐙 [github.com/ndchungict](https://github.com/ndchungict) · 💼 [LinkedIn](https://linkedin.com/in/nguyen-duc-chung) · 🌐 [ndchungict.github.io](https://ndchungict.github.io)

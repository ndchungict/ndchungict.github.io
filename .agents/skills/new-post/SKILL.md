---
name: new-post
description: Tạo bài viết blog Hugo mới đúng convention của repo này — tên file yyyyMMdd-hhmm-slug, front matter chuẩn, thumbnail mặc định theo category, và cập nhật post-library.md. Dùng khi user muốn viết/tạo một bài post mới (kể cả bài thuộc series).
---

# Tạo bài viết Hugo mới

Tạo một bài post mới trong `content/posts/` theo đúng quy ước repo, rồi ghi nó vào `post-library.md`. KHÔNG tạo file ảnh SVG. LUÔN LUÔN tạo ảnh thumbnail bằng AI (dùng tool `generate_image`) cho bài viết mới và gợi ý phong cách ảnh cho user.

## Bước 1 — Thu thập thông tin

Hỏi user (gộp 1 lần, ưu tiên dùng AskUserQuestion) những gì còn thiếu. Đừng hỏi lại thứ user đã cung cấp.

- **Tiêu đề** bài viết (bắt buộc).
- **Category** — chỉ chọn 1, là `key` hợp lệ: `it`, `english`, `chinese`.
- **Nếu category = `it`**: hỏi thêm **subcategory** — có thể chọn nhiều `key` hợp lệ: `qa-testing` (QA/ISTQB/kiến thức testing nói chung), `automation` (automation test bằng công cụ như Playwright — luôn đi kèm cho bài `workflow`), `workflow` (automation dạng workflow/no-code như n8n — luôn đi kèm `automation`), `develop` (phát triển phần mềm), `devops` (Docker,...), `database` (cơ sở dữ liệu), `version-control` (Git,...), `ai` (bài liên quan AI, kể cả bài automation/workflow có nhắc AI), `tips-tricks` (Homebrew, mise,...).
- **Tags** (danh sách; có thể rỗng).
- **Slug** (kebab-case, không dấu, không prefix ngày giờ). Nếu user không cho → tự sinh từ tiêu đề (xem Bước 2).
- **Summary** (tùy chọn; để trống = Hugo tự lấy ~70 từ đầu).
- **Có thuộc series không?** Nếu có: `series-slug` + `weight` (thứ tự bài trong series). Nếu user muốn tạo cả series mới → dùng skill [[new-series]] thay vì skill này.
- **Sinh nội dung hay để trống?** Mặc định để body trống (chỉ heading mở đầu) trừ khi user yêu cầu viết nội dung.
- **Phong cách ảnh thumbnail:** Đưa ra vài gợi ý phong cách (vd: 3D Illustration, Minimalist, Cyberpunk, Pixel Art, Watercolor, Flat Design...) để user chọn cho ảnh thumbnail AI, hoặc để user tự mô tả.

## Bước 2 — Đặt tên file

Format: `content/posts/<category-folder>/<yyyyMMdd>-<hhmm>-<slug>.md`

- `<category-folder>`: `it`, `english`, hoặc `chinese` — theo `category` đã chọn ở Bước 1. Thư mục con chỉ để tổ chức file, không ảnh hưởng URL/section.
- `<yyyyMMdd>-<hhmm>`: ngày giờ hiện tại. Lấy bằng `date +%Y%m%d-%H%M`.
- `<slug>`: kebab-case. Quy tắc sinh slug từ tiêu đề:
  - Bỏ dấu tiếng Việt (đ → d), chuyển thường, thay khoảng trắng & ký tự đặc biệt bằng `-`, gộp nhiều `-` liền nhau, bỏ `-` ở đầu/cuối.
  - Ví dụ: "Git là gì? Tại sao cần Git" → `git-la-gi-tai-sao-can-git`.
- Kiểm tra trùng tên file trong toàn bộ `content/posts/**` (không chỉ trong thư mục con); nếu trùng, đổi `<hhmm>` (vd +1 phút) hoặc tinh chỉnh slug.

> Tên file có prefix ngày giờ, nhưng trường `slug` trong front matter KHÔNG có prefix. Hugo dùng `slug` để tạo URL `/posts/<slug>/`.

## Bước 3 — Tạo / Chọn thumbnail

- **LUÔN LUÔN tạo ảnh thumbnail bằng AI** cho bài viết mới bằng tool `generate_image` với prompt mô tả dựa trên tiêu đề và phong cách user đã chọn ở Bước 1. Sau khi sinh ảnh xong (lưu ở thư mục artifact), hãy copy/di chuyển ảnh đó vào thư mục `static/images/<chu-de>/` (đổi tên cho chuẩn SEO và convert sang `.webp` nếu cần) rồi lấy đường dẫn đó gán vào trường `thumbnail`.
- *Ngoại lệ:* Nếu user cung cấp sẵn ảnh `.webp` riêng (đặt trong `static/images/<chu-de>/`) thì dùng ảnh đó thay vì tạo AI.
- *Fallback:* Chỉ khi user kiên quyết từ chối tạo ảnh hoặc tool gặp lỗi mới dùng ảnh mặc định theo category trong `static/images/default-thumb/`: `it` (lap-trinh), `english` (tieng-anh), `chinese` (tieng-trung).

## Bước 4 — Ghi file bài viết

Bài thường (theo `archetypes/default.md`):

```toml
+++
date        = '<ISO 8601 + offset, vd 2026-06-30T14:05:00+07:00>'
draft       = true
title       = '<Tiêu đề>'
slug        = '<slug>'
summary     = '<summary hoặc để trống>'
thumbnail   = '<đường dẫn thumbnail ở Bước 3>'
featured    = false
columns     = 2  # mặc định cho bài mới (layout 2 cột); đổi thành 3 nếu user muốn layout 3 cột kiểu cũ
categories  = ['<category>']
subcategories = ['<subcategory1>', '<subcategory2>', ...]  # chỉ thêm dòng này nếu category = 'it'; có thể nhiều key
tags        = [<'tag1', 'tag2', ...>]
series      = []
authors     = ['Nguyen Chung']
+++

<body — heading mở đầu hoặc nội dung user yêu cầu>
```

Bài thuộc series — thêm `weight` ngay dưới `columns` và điền `series` (như `archetypes/series.md`):

```toml
featured    = false
columns     = 2
weight      = <thứ tự>
...
series      = ['<series-slug>']
```

- Dùng nháy đơn `'...'` cho chuỗi TOML (khớp các bài hiện có).
- `date` ở dạng ISO 8601 có offset `+07:00`, trùng với mốc trong tên file.

## Bước 5 — Cập nhật `post-library.md`

Sau khi tạo file, BẮT BUỘC cập nhật `post-library.md` ở thư mục gốc repo:

1. Thêm 1 dòng vào bảng `| STT | Datetime | Title |`:
   - **STT**: số thứ tự kế tiếp.
   - **Datetime**: định dạng `yyyy-MM-dd hh:mm` (vd `2026-06-30 14:05`) — lấy đúng ngày giờ ở tên file.
   - **Title**: đúng tiêu đề bài (giữ nguyên tiếng Việt, dấu câu).
2. Giữ bảng **sắp xếp tăng dần theo Datetime**. Nếu bài mới chèn vào giữa, **đánh số lại STT** cho liên tục từ trên xuống.
3. Cập nhật dòng đếm `> Tổng số bài viết: **N**` thành số mới.

> Nếu tạo nhiều bài cùng lúc (vd qua [[new-series]]), thêm tất cả rồi mới đánh số lại 1 lần.

## Bước 6 — Báo cáo

Báo lại cho user:
- Đường dẫn file đã tạo + thumbnail đã gán.
- Đã thêm vào `post-library.md` (STT mới + tổng số bài).
- Nhắc: bài đang `draft = true`, chỉ hiện với `hugo server --buildDrafts`; đổi `draft = false` khi muốn publish.

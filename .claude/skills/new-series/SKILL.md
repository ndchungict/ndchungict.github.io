---
name: new-series
description: Tạo một series bài viết mới cho blog Hugo này — gồm trang term của series (content/series/<slug>/_index.md) và khung các bài thành phần trong content/posts/ với weight tăng dần. Dùng khi user muốn tạo/khởi tạo một series mới (vd "tạo series học X gồm N bài").
---

# Tạo series mới

Một "series" gồm 2 phần phải tạo cùng nhau:

1. **Trang term** — `content/series/<series-slug>/_index.md` (mô tả series, hiện ở series-card trang chủ + trang `/series/`).
2. **Các bài thành phần** — file trong `content/posts/`, mỗi bài có `series = ['<series-slug>']` và `weight` tăng dần (1, 2, 3…) để xác định thứ tự.

> Bài thường được tạo theo skill [[new-post]] — series chỉ thêm `series` + `weight`. KHÔNG tạo file ảnh SVG; thumbnail dùng ảnh mặc định theo category.

## Bước 1 — Thu thập thông tin

Hỏi user (gộp 1 lần) những gì còn thiếu:

- **Tên series** (title, vd "Tự học Playwright").
- **series-slug** (kebab-case, vd `tu-hoc-playwright`) — dùng trong `series = [...]` và đường dẫn `content/series/<slug>/`. Nếu user không cho, tự sinh từ title.
- **Mô tả** series (1–2 câu).
- **Icon** emoji (tùy chọn; bỏ trống = tự lấy emoji theo category).
- **Level** (tùy chọn, vd "Cơ bản → Nâng cao").
- **Category** chung cho cả series — 1 key hợp lệ: `it`, `english`, `chinese`.
- **Nếu category = `it`**: hỏi thêm **subcategory** chung cho cả series — có thể nhiều `key` hợp lệ: `qa-testing` (QA/ISTQB/kiến thức testing nói chung), `automation` (automation test bằng công cụ như Playwright — luôn đi kèm cho bài `workflow`), `workflow` (automation dạng workflow/no-code như n8n — luôn đi kèm `automation`), `develop` (phát triển phần mềm), `devops` (Docker,...), `database` (cơ sở dữ liệu), `version-control` (Git,...), `ai` (bài liên quan AI, kể cả bài automation/workflow có nhắc AI), `tips-tricks` (Homebrew, mise,...).
- **Tags** chung.
- **Danh sách bài**: số lượng + tiêu đề từng bài (theo thứ tự). Nếu user chỉ cho số lượng, hỏi tiêu đề hoặc tạo placeholder.

## Bước 2 — Tạo trang term của series

Tạo `content/series/<series-slug>/_index.md` theo mẫu các series hiện có:

```toml
+++
title       = '<Tên series>'
description = '<Mô tả series>'
icon        = '<emoji>'        # tùy chọn
level       = '<Level>'        # tùy chọn
+++
```

Tham khảo file mẫu: `content/series/tu-hoc-playwright/_index.md`.

## Bước 3 — Tạo các bài thành phần

Với mỗi bài thứ `i` (i = 1..N):

- Tên file: `content/posts/<category-folder>/<yyyyMMdd>-<hhmm>-<slug-bai>.md`
  - `<category-folder>`: `it`, `english`, hoặc `chinese` — theo `category` chung của series. Thư mục con chỉ để tổ chức file, không ảnh hưởng URL/section.
  - Ngày giờ hiện tại làm gốc; mỗi bài cách nhau ~30 phút để giữ thứ tự thời gian (vd 0800, 0830, 0900…). Lấy mốc đầu bằng `date +%Y%m%d-%H%M`.
  - `<slug-bai>`: kebab-case từ tiêu đề bài.
- Front matter (như `archetypes/series.md`):

```toml
+++
date        = '<ISO date, mỗi bài cộng thêm thời gian>'
draft       = true
title       = '<Tiêu đề bài i>'
slug        = '<slug-bai>'
summary     = ''
thumbnail   = '<thumbnail theo category — xem bảng dưới>'
featured    = false
weight      = <i>
categories  = ['<category>']
subcategories = ['<subcategory1>', '<subcategory2>', ...]  # chỉ thêm dòng này nếu category = 'it'; có thể nhiều key
tags        = [<tags>]
series      = ['<series-slug>']
authors     = ['Nguyen Chung']
+++
```

### Thumbnail theo category

| Category     | Thumbnail |
|--------------|-----------|
| `it`         | `/images/default-thumb/default-thumb-it-lap-trinh.webp` |
| `english`    | `/images/default-thumb/default-thumb-tieng-anh.webp` |
| `chinese`    | `/images/default-thumb/default-thumb-tieng-trung.webp` |

Nếu user đã có ảnh `.webp` riêng cho từng bài (trong `static/images/<chu-de>/`) thì dùng ảnh đó.

### Quy tắc sinh slug (cho slug series và slug từng bài)

- Bỏ dấu tiếng Việt (đ → d), chuyển thường, thay khoảng trắng & ký tự đặc biệt bằng `-`, gộp `-` liền nhau, bỏ `-` ở đầu/cuối.
- Kiểm tra trùng tên file trong toàn bộ `content/posts/**` (không chỉ trong thư mục con); nếu trùng, đổi `<hhmm>` hoặc tinh chỉnh slug.
- Dùng nháy đơn `'...'` cho chuỗi TOML; `date` dạng ISO 8601 có offset `+07:00`, trùng mốc trong tên file.

## Bước 4 — Cập nhật `post-library.md`

Sau khi tạo xong toàn bộ N bài, BẮT BUỘC ghi tất cả vào `post-library.md` ở thư mục gốc repo:

1. Thêm N dòng vào bảng `| STT | Datetime | Title |`, mỗi dòng:
   - **Datetime**: `yyyy-MM-dd hh:mm` đúng mốc trong tên file từng bài.
   - **Title**: đúng tiêu đề bài.
2. Giữ bảng **sắp xếp tăng dần theo Datetime**, chèn các bài mới đúng vị trí.
3. **Đánh số lại STT** liên tục từ trên xuống (1 lần sau khi đã thêm hết).
4. Cập nhật dòng đếm `> Tổng số bài viết: **N**` thành tổng mới.

## Bước 5 — Hoàn tất

- Tất cả bài để `draft = true`. Nhắc user đổi `draft = false` khi publish.
- Để body trống hoặc heading mở đầu, trừ khi user yêu cầu sinh nội dung.
- Báo lại: đường dẫn trang term + danh sách N file bài đã tạo (kèm weight) + thumbnail đã gán + đã thêm vào `post-library.md` (số dòng + tổng số bài mới).
- Nhắc: thứ tự bài trong series render bằng `.Pages.ByWeight`, nên `weight` phải đúng thứ tự mong muốn.

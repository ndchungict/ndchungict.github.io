---
name: new-post
description: Tạo bài viết blog Hugo mới đúng convention của repo này — tên file yyyyMMdd-hhmm-slug, front matter chuẩn, thumbnail mặc định theo category. Dùng khi user muốn viết/tạo một bài post mới (kể cả bài thuộc series).
---

# Tạo bài viết Hugo mới

Tạo một bài post mới trong `content/posts/` theo đúng quy ước repo. KHÔNG tạo file ảnh SVG.

## Bước 1 — Thu thập thông tin

Hỏi user (gộp 1 lần, dùng AskUserQuestion nếu phù hợp) những gì còn thiếu:

- **Tiêu đề** bài viết.
- **Category** — chỉ chọn 1, là `key` hợp lệ: `it`, `automation`, `english`, `chinese`.
- **Tags** (danh sách).
- **Slug** (kebab-case, không có prefix ngày giờ) — nếu user không cho, tự sinh từ tiêu đề.
- **Có thuộc series không?** Nếu có: tên series + `weight` (thứ tự bài trong series).

## Bước 2 — Đặt tên file

Format: `content/posts/<yyyyMMdd>-<hhmm>-<slug>.md`

- `<yyyyMMdd>-<hhmm>`: lấy ngày giờ hiện tại (chạy `date +%Y%m%d-%H%M`).
- `<slug>`: slug kebab-case ở trên.

> Tên file có prefix ngày giờ, nhưng trường `slug` trong front matter thì KHÔNG có prefix.

## Bước 3 — Chọn thumbnail theo category

Map `category` (phần tử đầu của `categories`) → ảnh mặc định trong `static/images/default-thumb/`:

| Category     | Thumbnail |
|--------------|-----------|
| `it`         | `/images/default-thumb/default-thumb-it-lap-trinh.webp` |
| `automation` | `/images/default-thumb/default-thumb-it-lap-trinh.webp` |
| `english`    | `/images/default-thumb/default-thumb-tieng-anh.webp` |
| `chinese`    | `/images/default-thumb/default-thumb-tieng-trung.webp` |

Nếu user đã có ảnh `.webp` riêng (đặt trong `static/images/<chu-de>/`) thì dùng ảnh đó thay vì ảnh mặc định.

## Bước 4 — Ghi front matter

Bài thường (theo `archetypes/default.md`):

```toml
+++
date        = '<ISO date hiện tại>'
draft       = true
title       = '<Tiêu đề>'
slug        = '<slug>'
summary     = ''          # để trống = Hugo tự lấy ~70 từ đầu
thumbnail   = '<đường dẫn thumbnail ở Bước 3>'
featured    = false
categories  = ['<category>']
tags        = [<tags>]
series      = []
authors     = ['Nguyen Chung']
+++
```

Bài thuộc series — thêm trường `weight` (như `archetypes/series.md`):

```toml
weight      = <thứ tự>    # đặt ngay dưới featured
series      = ['<tên series>']
```

## Bước 5 — Hoàn tất

- Để `draft = true` (chỉ hiện khi `hugo server --buildDrafts`). Nhắc user đổi `draft = false` khi muốn publish.
- Để body trống hoặc một heading mở đầu để user viết tiếp, trừ khi user yêu cầu sinh nội dung.
- Báo lại đường dẫn file đã tạo và thumbnail đã gán.

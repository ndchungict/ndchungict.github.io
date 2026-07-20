+++
date        = '2026-06-28T09:30:00+07:00'
draft       = false
title       = 'Làm việc với Remote Repository: clone, push, pull, fetch'
slug        = 'lam-viec-voi-remote-repository'
summary     = 'Hướng dẫn kết nối repo local với GitHub/GitLab, clone dự án có sẵn, push code lên remote và đồng bộ thay đổi từ đồng nghiệp về máy.'
thumbnail   = '/images/git-series/04-remote-repo.webp'
weight      = 4
categories  = ['it']
subcategories = ['database-version-control']
tags        = ['git', 'devops']
series      = ['huong-dan-git-tu-co-ban-den-nang-cao']
authors     = ['Nguyen Chung']
+++

Đến đây bạn đã biết cách dùng Git trên máy cá nhân. Bài này sẽ đưa code của bạn lên internet — kết nối với GitHub, GitLab, push code, pull về, và làm việc nhóm thực sự.

## Remote Repository là gì?

**Remote** là một bản sao của repository nằm trên server, giúp:

- **Backup**: Code không mất khi máy hỏng
- **Chia sẻ**: Đồng nghiệp, khách hàng có thể xem/clone
- **Làm việc nhóm**: Nhiều người cùng contribute

```
  Local Machine                    Remote (GitHub/GitLab)
  ┌─────────────┐                  ┌─────────────────────┐
  │  .git/      │                  │                     │
  │  (local     │  ── git push ──▶│   Remote repo       │
  │   repo)     │◀── git pull  ──  │   (origin/main)     │
  └─────────────┘                  └─────────────────────┘
```

### GitHub vs GitLab vs Bitbucket

| | GitHub | GitLab | Bitbucket |
|---|---|---|---|
| Phổ biến | ⭐⭐⭐ Nhất | ⭐⭐ | ⭐ |
| Free private repos | ✅ | ✅ | ✅ (giới hạn) |
| CI/CD | GitHub Actions | GitLab CI | Pipelines |
| Phù hợp | Open source, cộng đồng | DevOps nội bộ | Atlassian stack |

---

## Tạo Remote Repository

### Trên GitHub

1. Vào [github.com](https://github.com) → **New repository**
2. Đặt tên, chọn Public/Private
3. **Không tick** "Initialize with README" nếu bạn đã có repo local
4. Nhấn **Create repository**

GitHub sẽ hiển thị lệnh để kết nối:

```bash
# Với repo đã có sẵn local
git remote add origin git@github.com:chungnd1/my-project.git
git branch -M main
git push -u origin main
```

---

## git remote — Quản lý remote

```bash
# Xem danh sách remote
git remote -v
# origin  git@github.com:chungnd1/my-project.git (fetch)
# origin  git@github.com:chungnd1/my-project.git (push)

# Thêm remote mới
git remote add origin git@github.com:chungnd1/my-project.git

# Đổi tên remote
git remote rename origin upstream

# Xóa remote
git remote remove upstream

# Đổi URL của remote (khi chuyển từ HTTPS sang SSH)
git remote set-url origin git@github.com:chungnd1/my-project.git
```

**Convention**: Remote chính luôn được đặt tên là `origin`. Với fork workflow, repo gốc thường đặt là `upstream`.

---

## git clone — Tải về repository

Clone là cách nhanh nhất để bắt đầu làm việc với một repo có sẵn trên remote.

```bash
# Clone qua SSH (cần SSH key, nhưng không cần nhập password)
git clone git@github.com:chungnd1/my-project.git

# Clone qua HTTPS (cần nhập token/password)
git clone https://github.com/chungnd1/my-project.git

# Clone vào thư mục tùy chỉnh
git clone git@github.com:chungnd1/my-project.git ten-thu-muc

# Clone chỉ lấy 1 branch cụ thể
git clone --single-branch --branch develop git@github.com:chungnd1/my-project.git
```

Clone tự động:
- Tải về toàn bộ code và lịch sử
- Tạo remote `origin` trỏ đến URL clone
- Checkout branch mặc định (thường là `main`)

---

## git push — Đẩy commit lên remote

```bash
# Push branch hiện tại lên remote
git push origin main

# -u: thiết lập upstream, lần sau chỉ cần git push
git push -u origin main

# Sau khi đã set upstream:
git push
```

### Khi push bị từ chối

```
! [rejected] main -> main (fetch first)
error: failed to push some refs to 'origin'
hint: Updates were rejected because the remote contains work that you do not have locally.
```

Điều này xảy ra khi remote có commit mới mà local bạn chưa có (đồng nghiệp đã push trước). Giải pháp:

```bash
# Kéo thay đổi về trước
git pull origin main

# Resolve conflict nếu có, rồi push lại
git push origin main
```

### Force push (cẩn thận!)

```bash
# NGUY HIỂM: ghi đè lịch sử remote
git push --force origin main

# Safer option: chỉ force push nếu không có ai push mới
git push --force-with-lease origin main
```

**Quy tắc vàng**: Không bao giờ force push lên `main`/`master` của repo chung. Chỉ dùng khi cần thiết trên branch cá nhân.

---

## git pull — Kéo thay đổi từ remote

```bash
# Pull từ remote (fetch + merge)
git pull origin main

# Nếu đã set upstream:
git pull

# Pull với rebase thay vì merge (lịch sử gọn hơn)
git pull --rebase origin main
```

`git pull` thực ra là kết hợp 2 bước:

```bash
git fetch origin     # Tải thay đổi về
git merge origin/main # Merge vào branch hiện tại
```

---

## git fetch — Cập nhật thông tin từ remote mà không merge

```bash
# Tải về tất cả thay đổi từ remote (không merge)
git fetch origin

# Tải về tất cả remote
git fetch --all

# Xem thay đổi sau khi fetch
git log HEAD..origin/main --oneline
# e4f5g6h feat: thêm tính năng export PDF
# i7j8k9l fix: sửa lỗi phân trang

# Rồi quyết định merge hay không
git merge origin/main
```

Khi nào dùng `fetch` thay `pull`?

- Khi muốn **xem trước** thay đổi từ remote trước khi đưa vào code
- Trong CI/CD pipelines
- Khi muốn kiểm soát cẩn thận quá trình tích hợp

---

## Quy trình làm việc hàng ngày

### Bắt đầu ngày mới

```bash
# Luôn pull về trước khi bắt đầu
git pull origin main
```

### Trong khi làm việc

```bash
# Code, code, code...

git add .
git commit -m "feat: hoàn thành tính năng X"

# Có thể commit nhiều lần nhỏ trong ngày
git commit -m "fix: sửa typo trong validation message"
```

### Cuối ngày — push lên remote

```bash
git push origin main
# hoặc
git push  # nếu đã set upstream
```

### Sơ đồ quy trình

```
Sáng:     git pull
          ↓
Cả ngày:  code → git add → git commit  (lặp lại)
          ↓
Chiều:    git push
```

---

## Xử lý conflict khi pull

Đây là tình huống hay gặp khi làm việc nhóm:

```bash
git pull

# Auto-merging index.html
# CONFLICT (content): Merge conflict in index.html
# Automatic merge failed; fix conflicts and then commit the result.
```

File conflict sẽ có dạng:

```html
<<<<<<< HEAD (thay đổi của bạn)
<h1>Chào mừng đến với website của chúng tôi</h1>
=======
<h1>Welcome to our website</h1>
>>>>>>> origin/main (thay đổi từ remote)
```

Cách xử lý:

1. Mở file, tìm các markers `<<<<<<<`, `=======`, `>>>>>>>`
2. Giữ lại phần code đúng (hoặc kết hợp cả hai)
3. Xóa các markers
4. Stage và commit:

```bash
git add index.html
git commit -m "merge: giải quyết conflict tại index.html"
```

VS Code có giao diện hỗ trợ resolve conflict rất trực quan với các nút "Accept Current", "Accept Incoming", "Accept Both".

---

## Các lệnh hữu ích khác

```bash
# Xem trạng thái so với remote
git status
# Your branch is ahead of 'origin/main' by 2 commits.

# Xem commit local chưa push
git log origin/main..HEAD --oneline

# Xem commit remote chưa pull
git log HEAD..origin/main --oneline

# Clone chỉ metadata, không lấy file (nhanh, dùng khi inspect repo)
git clone --bare git@github.com:chungnd1/my-project.git
```

---

## Tóm tắt các lệnh

| Lệnh | Tác dụng |
|---|---|
| `git remote add origin <url>` | Kết nối repo local với remote |
| `git remote -v` | Xem danh sách remote |
| `git clone <url>` | Tải về toàn bộ repo |
| `git push origin main` | Đẩy code lên remote |
| `git push -u origin main` | Push và set upstream |
| `git pull` | Kéo + merge thay đổi từ remote |
| `git fetch` | Kéo thay đổi về mà không merge |

---

**Bài trước**: [← Git cơ bản: init, add, commit](/posts/git-co-ban-init-add-commit/)

**Bài tiếp theo**: [Git Branch và Merge: Làm việc song song →](/posts/git-branch-merge-resolve-conflict/)

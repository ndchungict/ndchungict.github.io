+++
date        = '2026-06-28T09:00:00+07:00'
draft       = false
title       = 'Git cơ bản: init, add, commit, status, log, diff'
slug        = 'git-co-ban-init-add-commit'
summary     = 'Học các lệnh Git cơ bản nhất: khởi tạo repo, theo dõi thay đổi, tạo commit, xem lịch sử và so sánh code. Kèm bài tập thực hành từ đầu.'
thumbnail   = '/images/git-series/03-git-co-ban.webp'
weight      = 3
categories  = ['it']
subcategories = ['database-version-control']
tags        = ['git', 'devops']
series      = ['huong-dan-git-tu-co-ban-den-nang-cao']
authors     = ['Nguyen Chung']
+++

Bài này là trung tâm của toàn bộ series — bạn sẽ học cách dùng Git hàng ngày: tạo repo, theo dõi thay đổi, tạo commit và xem lịch sử. Hãy mở terminal lên và thực hành cùng nhé.

## Khởi tạo Repository

### git init — Bắt đầu theo dõi một thư mục

```bash
# Tạo thư mục mới và khởi tạo repo
mkdir my-project
cd my-project
git init

# Initialized empty Git repository in /path/to/my-project/.git/
```

Lệnh `git init` tạo thư mục ẩn `.git/` trong project của bạn — đây là nơi Git lưu toàn bộ lịch sử và cấu hình. **Đừng xóa thư mục này.**

```bash
ls -la
# .git/       ← thư mục ẩn chứa toàn bộ dữ liệu Git
# (thư mục project hiện đang trống)
```

---

## Vòng đời của file trong Git

Trước khi học các lệnh, hãy nắm vững **trạng thái** mà một file có thể ở trong Git:

```
                        git add              git commit
  ┌──────────────┐  ─────────────▶  ┌──────────────┐  ─────────────▶  ┌───────────┐
  │  Untracked   │                  │    Staged    │                  │ Committed │
  │  (chưa track)│  ◀─────────────  │  (sẵn sàng  │                  │ (đã lưu)  │
  └──────────────┘    git restore   │   commit)   │                  └───────────┘
                      --staged      └──────────────┘
                                           ▲
  ┌──────────────┐                         │ git add
  │   Modified   │  ───────────────────────┘
  │  (đã sửa,    │
  │ chưa stage)  │
  └──────────────┘
```

- **Untracked**: File mới tạo, Git chưa theo dõi
- **Staged**: File đã `git add`, sẵn sàng vào commit tiếp theo
- **Modified**: File đã được track nhưng có thay đổi chưa stage
- **Committed**: File đã được lưu vào repo

---

## git status — Kiểm tra trạng thái

`git status` là lệnh bạn sẽ dùng nhiều nhất. Nó cho biết file nào đang ở trạng thái nào.

```bash
# Tạo vài file thử
echo "# My Project" > README.md
echo "body { margin: 0; }" > style.css

git status
```

```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.md
        style.css

nothing added to commit but untracked files present (use "git add" to track)
```

Git thấy 2 file mới nhưng chưa theo dõi chúng.

---

## git add — Đưa file vào Staging Area

```bash
# Add từng file cụ thể
git add README.md

# Add nhiều file cùng lúc
git add README.md style.css

# Add tất cả file trong thư mục hiện tại
git add .

# Add tất cả file có phần mở rộng .md
git add *.md

# Add theo interactive mode (chọn từng phần thay đổi)
git add -p
```

Sau khi `git add`:

```bash
git status
```

```
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   README.md
        new file:   style.css
```

File màu xanh lá → đã được stage, sẵn sàng commit.

### Bỏ file khỏi Staging Area

```bash
# Bỏ stage một file cụ thể (Git 2.23+)
git restore --staged README.md

# Hoặc cách cũ
git reset HEAD README.md
```

---

## git commit — Lưu snapshot

Commit là điểm mấu chốt — bạn "chụp ảnh" trạng thái hiện tại của code và lưu vào lịch sử.

```bash
git commit -m "feat: khởi tạo dự án với README và CSS cơ bản"
```

```
[main (root-commit) a1b2c3d] feat: khởi tạo dự án với README và CSS cơ bản
 2 files changed, 2 insertions(+)
 create mode 100644 README.md
 create mode 100644 style.css
```

### Viết commit message tốt

Commit message tốt trả lời câu hỏi **"Tại sao thay đổi này?"**, không phải "Đã thay đổi gì?". Code đã thể hiện "cái gì" rồi.

```bash
# ❌ Tệ — quá mơ hồ
git commit -m "fix bug"
git commit -m "update code"
git commit -m "changes"

# ✅ Tốt — rõ ràng, có context
git commit -m "fix: sửa lỗi form đăng nhập không validate email trống"
git commit -m "feat: thêm tính năng tìm kiếm sản phẩm theo tên"
git commit -m "refactor: tách UserService thành các module nhỏ hơn"
git commit -m "docs: cập nhật hướng dẫn cài đặt trong README"
```

**Conventional Commits** — quy ước phổ biến:

| Prefix | Dùng khi |
|---|---|
| `feat:` | Thêm tính năng mới |
| `fix:` | Sửa bug |
| `docs:` | Thay đổi tài liệu |
| `style:` | Format code, không đổi logic |
| `refactor:` | Tái cấu trúc code |
| `test:` | Thêm/sửa tests |
| `chore:` | Công việc bảo trì, build |

### Commit nhiều dòng message

```bash
# Mở editor để viết message dài
git commit

# Hoặc dùng -m nhiều lần
git commit -m "feat: thêm trang dashboard cho admin" \
           -m "- Hiển thị thống kê người dùng" \
           -m "- Biểu đồ doanh thu theo tháng" \
           -m "- Bảng danh sách đơn hàng mới nhất"
```

### Sửa commit gần nhất (chưa push)

```bash
# Sửa message của commit cuối
git commit --amend -m "feat: message mới chính xác hơn"

# Thêm file còn quên vào commit cuối
git add file-quen.txt
git commit --amend --no-edit
```

---

## git log — Xem lịch sử commit

```bash
git log
```

```
commit a1b2c3d4e5f6789012345678901234567890abcd (HEAD -> main)
Author: Nguyen Chung <ndchungict@gmail.com>
Date:   Sun Jun 29 09:00:00 2026 +0700

    feat: khởi tạo dự án với README và CSS cơ bản
```

### Các dạng hiển thị hữu ích

```bash
# Dạng ngắn gọn (dùng nhiều nhất)
git log --oneline
# a1b2c3d feat: khởi tạo dự án với README và CSS cơ bản

# Dạng đồ thị với branch
git log --oneline --graph --all --decorate

# Lọc theo tác giả
git log --author="Nguyen Chung"

# Lọc theo khoảng thời gian
git log --since="2026-01-01" --until="2026-06-30"

# Tìm commit chứa từ khóa trong message
git log --grep="login"

# Xem thay đổi trong mỗi commit
git log -p

# Chỉ xem 5 commit gần nhất
git log -5
```

---

## git diff — So sánh thay đổi

```bash
# Sửa README.md
echo "## Giới thiệu" >> README.md

# Xem thay đổi trong Working Directory (chưa stage)
git diff
```

```diff
diff --git a/README.md b/README.md
index abc1234..def5678 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,3 @@
 # My Project
+
+## Giới thiệu
```

```bash
# Xem thay đổi đã stage (chuẩn bị commit)
git diff --staged

# So sánh hai commit
git diff a1b2c3d e4f5g6h

# So sánh với branch khác
git diff main feature/login
```

---

## .gitignore — Bỏ qua file không cần track

Không phải file nào cũng cần vào Git. Tạo file `.gitignore` trong thư mục gốc:

```bash
# .gitignore

# Dependencies
node_modules/
vendor/

# Build output
dist/
build/
public/

# Environment & secrets
.env
.env.local
*.key
*.pem

# IDE files
.vscode/
.idea/
*.swp

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/
```

### Bỏ qua file đã được track

Nếu lỡ commit file rồi mới thêm vào `.gitignore`:

```bash
# Xóa file khỏi tracking (nhưng giữ file trên disk)
git rm --cached .env

# Xóa thư mục khỏi tracking
git rm -r --cached node_modules/

# Commit thay đổi
git commit -m "chore: bỏ file .env khỏi tracking"
```

---

## Bài tập thực hành

Hãy tự làm bài tập sau:

```bash
# 1. Tạo dự án mới
mkdir git-practice && cd git-practice
git init

# 2. Tạo vài file
echo "# Git Practice" > README.md
echo "console.log('Hello Git');" > index.js
echo "node_modules/" > .gitignore

# 3. Kiểm tra trạng thái
git status

# 4. Stage và commit
git add README.md index.js .gitignore
git status   # xem gì đã stage
git commit -m "feat: khởi tạo project Git practice"

# 5. Sửa file và xem diff
echo "console.log('Hello World');" >> index.js
git diff

# 6. Stage, commit lần 2
git add index.js
git commit -m "feat: thêm log Hello World"

# 7. Xem lịch sử
git log --oneline
```

---

## Tóm tắt các lệnh trong bài

| Lệnh | Tác dụng |
|---|---|
| `git init` | Khởi tạo repository mới |
| `git status` | Xem trạng thái file |
| `git add <file>` | Stage file để chuẩn bị commit |
| `git add .` | Stage tất cả thay đổi |
| `git commit -m "msg"` | Tạo commit với message |
| `git log --oneline` | Xem lịch sử commit dạng ngắn |
| `git diff` | Xem thay đổi chưa stage |
| `git diff --staged` | Xem thay đổi đã stage |
| `git restore --staged <file>` | Bỏ file khỏi staging area |

---

**Bài trước**: [← Cài đặt và cấu hình Git](/posts/cai-dat-va-cau-hinh-git/)

**Bài tiếp theo**: [Làm việc với Remote Repository →](/posts/lam-viec-voi-remote-repository/)

+++
date        = '2026-06-28T10:00:00+07:00'
draft       = false
title       = 'Git Branch và Merge: Làm việc song song, resolve conflict'
slug        = 'git-branch-merge-resolve-conflict'
summary     = 'Hiểu sâu về Git branch: tạo nhánh, chuyển nhánh, merge các loại (fast-forward, no-ff, squash) và xử lý conflict như một developer chuyên nghiệp.'
thumbnail   = '/images/git-series/05-branch-merge.webp'
weight      = 5
columns     = 2
categories  = ['it']
subcategories = ['version-control']
tags        = ['git', 'devops']
series      = ['huong-dan-git-tu-co-ban-den-nang-cao']
authors     = ['Nguyen Chung']
+++

Branch là tính năng mạnh nhất của Git. Nó cho phép bạn và đồng nghiệp phát triển nhiều tính năng song song mà không ảnh hưởng nhau. Bài này giải thích branch từ cơ bản đến các chiến lược merge thực tế.

## Branch là gì?

**Branch** (nhánh) là một con trỏ di động, trỏ đến một commit cụ thể. Khi bạn tạo commit mới, branch tự động di chuyển về phía trước.

```
Trước khi tạo branch:

main: A ── B ── C
                ▲
               HEAD

Sau git checkout -b feature/login:

main:         A ── B ── C
                        ▲
feature/login:          │ (cùng trỏ vào C lúc đầu)
```

Mỗi lần commit trên `feature/login`, nhánh đó tiến lên:

```
main:         A ── B ── C
                         \
feature/login:            D ── E
                               ▲
                              HEAD
```

**HEAD** là con trỏ cho biết bạn đang ở đâu trong lịch sử Git.

---

## Tạo và quản lý Branch

### Tạo branch mới

```bash
# Tạo branch mới (chưa switch sang)
git branch feature/login

# Tạo branch và switch ngay (cách phổ biến nhất)
git checkout -b feature/login

# Cách mới hơn (Git 2.23+)
git switch -c feature/login
```

### Switch giữa các branch

```bash
# Cách cũ
git checkout main

# Cách mới (Git 2.23+)
git switch main
```

### Xem danh sách branch

```bash
# Branch local
git branch
# * main
#   feature/login
#   bugfix/validate-email

# Branch local + remote
git branch -a
# * main
#   feature/login
#   remotes/origin/main
#   remotes/origin/develop

# Xem branch với commit cuối
git branch -v
#   feature/login a1b2c3d feat: thêm login form
# * main          e4f5g6h Initial commit
```

### Xóa branch

```bash
# Xóa branch đã merge (an toàn)
git branch -d feature/login

# Xóa branch chưa merge (cẩn thận!)
git branch -D feature/wip

# Xóa branch trên remote
git push origin --delete feature/login
```

---

## Naming convention cho Branch

Tên branch tốt giúp cả team hiểu ai đang làm gì:

```bash
# Tính năng mới
feature/ten-tinh-nang
feature/user-authentication
feature/payment-integration

# Sửa bug
bugfix/mo-ta-bug
bugfix/login-not-working
fix/TICKET-123-null-pointer

# Hotfix cho production
hotfix/ten-van-de-khan-cap
hotfix/xss-vulnerability

# Release
release/1.2.0

# Cải thiện
improvement/refactor-auth-module
```

---

## git merge — Kết hợp branch

Sau khi hoàn thành tính năng trên branch, bạn merge nó vào `main`.

### Fast-forward Merge

Xảy ra khi `main` không có commit mới kể từ khi bạn tạo branch — Git đơn giản di chuyển con trỏ:

```
Trước merge:
main:         A ── B ── C
                         \
feature/login:            D ── E

Sau git merge feature/login (fast-forward):
main:         A ── B ── C ── D ── E
                               ▲
                              HEAD
```

```bash
git switch main
git merge feature/login

# Updating a1b2c3d..e4f5g6h
# Fast-forward
#  login.html | 30 +++++++++++++
#  auth.js    | 45 +++++++++++++++++
#  2 files changed, 75 insertions(+)
```

### No-Fast-Forward Merge (--no-ff)

Tạo merge commit riêng, giữ rõ lịch sử "nhánh này được merge vào":

```
Trước:
main:    A ── B ── C
                    \
feature:             D ── E

Sau git merge --no-ff feature:
main:    A ── B ── C ─────────── M   (M = merge commit)
                    \           /
feature:             D ── E ───
```

```bash
git merge --no-ff feature/login -m "merge: tích hợp tính năng đăng nhập"
```

Đây là cách được khuyến nghị trong dự án nhóm — bạn luôn thấy rõ "tính năng này được thêm vào lúc nào và gồm những commit nào".

### Squash Merge

Gộp toàn bộ commit của branch thành 1 commit duy nhất trên `main`:

```
Trước:
main:    A ── B ── C
                    \
feature:             D ── E ── F

Sau git merge --squash feature:
main:    A ── B ── C ── S   (S = squash commit, chứa nội dung D+E+F)
```

```bash
git switch main
git merge --squash feature/login
git commit -m "feat: hoàn thiện tính năng đăng nhập (#123)"
```

Dùng squash khi branch có nhiều "WIP" commit nhỏ, không muốn đưa hết lên `main`.

---

## Xử lý Merge Conflict

Conflict xảy ra khi hai branch cùng chỉnh sửa cùng một vùng code.

### Tạo tình huống conflict

```bash
# Branch A sửa dòng 5 của file.js
git switch main
git switch -c branch-a
echo 'const greeting = "Xin chào!";' >> app.js
git add app.js && git commit -m "feat: thêm lời chào tiếng Việt"

# Branch B cũng sửa dòng 5 đó
git switch main
git switch -c branch-b
echo 'const greeting = "Hello!";' >> app.js
git add app.js && git commit -m "feat: thêm lời chào tiếng Anh"

# Merge branch-a vào main (không có conflict)
git switch main
git merge branch-a

# Merge branch-b → conflict!
git merge branch-b
# CONFLICT (content): Merge conflict in app.js
```

### Đọc markers conflict

```javascript
<<<<<<< HEAD (thay đổi trên nhánh hiện tại — main/branch-a)
const greeting = "Xin chào!";
======= (đường phân cách)
const greeting = "Hello!";
>>>>>>> branch-b (thay đổi từ nhánh được merge)
```

### Resolve conflict

**Cách 1 — Thủ công** (bất kỳ editor nào):

```javascript
// Xóa markers và giữ lại code đúng
const greeting = "Xin chào!"; // hoặc kết hợp cả hai
```

**Cách 2 — VS Code** (giao diện trực quan):

```
[ Accept Current Change ] [ Accept Incoming Change ] [ Accept Both Changes ] [ Compare Changes ]
```

**Cách 3 — merge tool:**

```bash
git mergetool  # Mở tool đã cấu hình (vimdiff, meld, kdiff3...)
```

### Hoàn tất sau khi resolve

```bash
# Stage file đã resolve
git add app.js

# Tạo merge commit
git commit -m "merge: giải quyết conflict lời chào"

# Kiểm tra kết quả
git log --oneline --graph
```

### Hủy merge (quay về trạng thái trước)

```bash
git merge --abort
```

---

## Xem lịch sử branch với git log

```bash
# Đồ thị branch
git log --oneline --graph --all --decorate

# *   a1b2c3d (HEAD -> main) merge: tích hợp login
# |\
# | * e4f5g6h (feature/login) fix: validate password
# | * i7j8k9l feat: thêm forgot password
# | * m1n2o3p feat: thêm login form
# |/
# * q4r5s6t Initial commit
```

---

## Chiến lược branching cho dự án nhỏ

```
main (production)
  ↑ merge từ develop khi release
develop (integration)
  ↑ merge từ feature/*, bugfix/*
feature/xyz     bugfix/abc
```

Quy tắc:
- `main` → luôn stable, chỉ có code đã test
- `develop` → tích hợp các tính năng đang làm
- `feature/*` → mỗi tính năng một branch riêng
- Không commit trực tiếp vào `main`

---

## Tóm tắt

| Lệnh | Tác dụng |
|---|---|
| `git branch <name>` | Tạo branch mới |
| `git switch -c <name>` | Tạo + switch sang branch mới |
| `git switch <name>` | Chuyển sang branch |
| `git branch -d <name>` | Xóa branch đã merge |
| `git merge <name>` | Merge branch vào nhánh hiện tại |
| `git merge --no-ff <name>` | Merge với merge commit rõ ràng |
| `git merge --squash <name>` | Gộp thành 1 commit rồi merge |
| `git merge --abort` | Hủy merge đang dang dở |

---

**Bài trước**: [← Remote Repository: clone, push, pull](/posts/lam-viec-voi-remote-repository/)

**Bài tiếp theo**: [Git Rebase và quy trình làm việc nhóm →](/posts/git-rebase-va-git-flow/)

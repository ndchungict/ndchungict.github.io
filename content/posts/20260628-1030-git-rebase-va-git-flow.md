+++
date        = '2026-06-28T10:30:00+07:00'
draft       = false
title       = 'Git Rebase và quy trình làm việc nhóm: Git Flow, GitHub Flow'
slug        = 'git-rebase-va-git-flow'
summary     = 'Hiểu sự khác biệt giữa merge và rebase, khi nào dùng cái nào, interactive rebase để làm sạch lịch sử, và các quy trình làm việc nhóm phổ biến.'
thumbnail   = '/images/git-series/06-rebase-git-flow.webp'
weight      = 6
categories  = ['it']
tags        = ['git', 'devops']
series      = ['huong-dan-git-tu-co-ban-den-nang-cao']
authors     = ['Nguyen Chung']
+++

Rebase là một trong những lệnh Git được thảo luận nhiều nhất — vừa mạnh, vừa dễ gây rối nếu dùng sai. Bài này giải thích rebase rõ ràng, so sánh với merge, và giới thiệu các quy trình làm việc nhóm phổ biến.

## Rebase là gì?

**Rebase** đặt lại base (điểm xuất phát) của branch. Thay vì tạo merge commit, rebase **viết lại lịch sử** để làm như thể bạn đã bắt đầu branch từ một điểm khác.

### Merge vs Rebase — So sánh trực quan

**Tình huống**: `feature` branch có 2 commit D, E. Trong lúc đó `main` có thêm commit F.

```
Trạng thái ban đầu:

main:    A ── B ── C ── F
                    \
feature:             D ── E
```

**Merge** (tạo merge commit):

```bash
git switch main
git merge feature
```

```
main:    A ── B ── C ── F ── M   (M = merge commit)
                    \       /
feature:             D ── E
```

✅ Giữ nguyên lịch sử thực tế  
❌ Lịch sử phức tạp khi nhiều branch

**Rebase** (viết lại lịch sử):

```bash
git switch feature
git rebase main
```

```
main:    A ── B ── C ── F
                         \
feature:                  D' ── E'   (D' và E' là commit mới với base mới)
```

✅ Lịch sử tuyến tính, sạch đẹp  
❌ Thay đổi SHA của commit (D → D', E → E')

---

## Cách dùng git rebase

### Rebase cơ bản

```bash
# Chuyển sang feature branch
git switch feature/login

# Rebase lên đầu main
git rebase main
```

Nếu có conflict trong quá trình rebase:

```bash
# Git dừng lại, bạn resolve conflict...
# ... rồi tiếp tục
git rebase --continue

# Hoặc bỏ qua commit này
git rebase --skip

# Hoặc hủy rebase, quay về trước
git rebase --abort
```

### Pull với rebase (thay vì merge)

```bash
# Thay vì git pull (fetch + merge)
git pull --rebase origin main

# Thiết lập mặc định (khuyến nghị)
git config --global pull.rebase true
```

---

## Interactive Rebase — Chỉnh sửa lịch sử

Interactive rebase (`git rebase -i`) cho phép bạn chỉnh sửa, sắp xếp, gộp, hoặc xóa commit trước khi push.

```bash
# Chỉnh sửa 3 commit gần nhất
git rebase -i HEAD~3
```

Một editor sẽ mở ra:

```
pick a1b2c3d feat: thêm login form
pick e4f5g6h fix: typo trong login
pick i7j8k9l wip: đang làm validate

# Commands:
# p, pick = dùng commit này
# r, reword = dùng commit nhưng đổi message
# e, edit = dùng commit nhưng dừng lại để sửa
# s, squash = gộp vào commit trước
# f, fixup = gộp vào commit trước, bỏ message
# d, drop = xóa commit
```

### Các thao tác thường dùng

**Squash — gộp nhiều commit thành 1:**

```
pick a1b2c3d feat: thêm login form
s    e4f5g6h fix: typo trong login     ← squash vào commit trước
s    i7j8k9l wip: đang làm validate   ← squash vào commit trước
```

Kết quả: 3 commit → 1 commit với message tổng hợp.

**Reword — đổi commit message:**

```
r    a1b2c3d feat: thêm login form
```

**Drop — xóa commit:**

```
drop i7j8k9l wip: commit tạm không cần giữ
```

**Reorder — đổi thứ tự commit** (chỉ cần kéo dòng lên/xuống):

```
pick i7j8k9l test: thêm unit test cho auth   ← di chuyển lên trên
pick a1b2c3d feat: thêm login form
pick e4f5g6h fix: typo trong login
```

---

## Quy tắc vàng của Rebase

> **Đừng bao giờ rebase branch đã được push và người khác đang dùng.**

Khi bạn rebase, SHA của commit thay đổi (D → D'). Nếu đồng nghiệp đang làm việc dựa trên D, họ sẽ gặp lịch sử bị xung đột và rất khó giải quyết.

```
✅ Safe: Rebase branch cá nhân chưa push
✅ Safe: Rebase branch đã push mà chỉ mình bạn dùng (+ force push)
❌ Nguy hiểm: Rebase branch mà nhiều người đã pull về
❌ Nguy hiểm: Rebase main/develop của team
```

---

## Git Flow — Quy trình làm việc cho dự án lớn

Git Flow là một mô hình branching được **Vincent Driessen** đề xuất năm 2010, phù hợp cho phần mềm có versioned release.

### Cấu trúc branch

```
main          ──────────────────────────────────────────── (production)
                  ↑ merge khi release        ↑ merge hotfix
develop       ──────────────────────────────────────────── (integration)
                ↑              ↑                    ↑
feature/A  ────┘          feature/B  ──────────────┘
                                    release/1.2 ──── (ngắn, chỉ để test)
hotfix/bug ──────────── (thẳng từ main, urgent fix)
```

### Các loại branch trong Git Flow

| Branch | Mục đích | Base từ | Merge vào |
|---|---|---|---|
| `main` | Code production | — | — |
| `develop` | Tích hợp | `main` | `main` (khi release) |
| `feature/*` | Tính năng mới | `develop` | `develop` |
| `release/*` | Chuẩn bị release | `develop` | `main` + `develop` |
| `hotfix/*` | Sửa khẩn cấp | `main` | `main` + `develop` |

### Thực hành với git-flow tool

```bash
# Cài đặt
brew install git-flow  # macOS
apt install git-flow   # Linux

# Khởi tạo
git flow init

# Bắt đầu feature
git flow feature start user-authentication

# ... code, commit ...

# Hoàn thành feature
git flow feature finish user-authentication
# Tự động: merge vào develop, xóa feature branch

# Bắt đầu release
git flow release start 1.2.0

# ... test, sửa bug nhỏ ...

# Hoàn thành release
git flow release finish 1.2.0
# Tự động: merge vào main + develop, tạo tag v1.2.0

# Hotfix
git flow hotfix start critical-security-fix
git flow hotfix finish critical-security-fix
# Tự động: merge vào main + develop, tạo tag
```

---

## GitHub Flow — Đơn giản hơn cho CD/CD liên tục

GitHub Flow phù hợp với team deploy liên tục (không có versioned release):

```
main: A ── B ──────────────────── M ── deploy
              \                  /
feature/xyz:   C ── D ── E ──── PR review ──┘
```

**Quy trình:**

1. Tạo branch từ `main`
2. Commit, push thường xuyên
3. Mở Pull Request để review
4. Discuss, chỉnh sửa
5. Merge vào `main`
6. Deploy ngay lập tức

```bash
# Bước 1-2
git switch -c feature/new-search
# ... code ...
git push -u origin feature/new-search

# Bước 3: mở PR trên GitHub UI
# Bước 4-5: review, approved
# Bước 6: merge qua GitHub, tự động trigger CD pipeline
```

### Git Flow vs GitHub Flow

| | Git Flow | GitHub Flow |
|---|---|---|
| Phức tạp | Cao | Thấp |
| Phù hợp | Versioned software | SaaS, web app |
| Branches | Nhiều long-lived | Chỉ main + feature |
| Release | Định kỳ | Liên tục |
| Ví dụ | Mobile app, thư viện | GitHub.com, Stripe |

---

## Khi nào dùng Merge, khi nào dùng Rebase?

```
Dùng MERGE khi:
├── Merge feature branch vào main/develop
├── Merge từ develop lên main (release)
├── Muốn giữ nguyên lịch sử thực tế
└── Branch đã push, nhiều người dùng

Dùng REBASE khi:
├── Cập nhật feature branch với thay đổi mới nhất từ main
│   (git rebase main trên feature branch cá nhân)
├── Dọn dẹp commit message trước khi merge (git rebase -i)
├── pull --rebase để tránh merge commit thừa
└── Branch cá nhân, chưa push hoặc chỉ mình dùng
```

---

## Tóm tắt

| Lệnh | Tác dụng |
|---|---|
| `git rebase main` | Đặt lại base của branch hiện tại lên main |
| `git rebase -i HEAD~n` | Interactive rebase để chỉnh n commit gần nhất |
| `git rebase --continue` | Tiếp tục rebase sau khi resolve conflict |
| `git rebase --abort` | Hủy rebase, quay về trạng thái trước |
| `git pull --rebase` | Pull với rebase thay vì merge |

---

**Bài trước**: [← Git Branch và Merge](/posts/git-branch-merge-resolve-conflict/)

**Bài tiếp theo**: [Git Nâng cao: stash, cherry-pick, reset, revert →](/posts/git-nang-cao-stash-cherry-pick-reset/)

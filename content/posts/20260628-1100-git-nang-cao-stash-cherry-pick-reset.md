+++
date        = '2026-06-28T11:00:00+07:00'
draft       = false
title       = 'Git Nâng cao: Stash, Cherry-pick, Reset, Revert, Reflog'
slug        = 'git-nang-cao-stash-cherry-pick-reset'
summary     = 'Các lệnh Git nâng cao giúp bạn xử lý mọi tình huống phức tạp: lưu tạm công việc, chọn commit cụ thể, quay về quá khứ an toàn, và phục hồi lịch sử.'
thumbnail   = '/images/git-series/07-git-nang-cao.svg'
weight      = 7
categories  = ['it']
tags        = ['git', 'devops']
series      = ['huong-dan-git-tu-co-ban-den-nang-cao']
authors     = ['Nguyen Chung']
+++

Bài này tập trung vào những lệnh Git mà developer cấp trung nên nắm: stash để lưu tạm, cherry-pick để chọn commit cụ thể, reset/revert để quay lại lịch sử, và reflog để phục hồi khi gặp sự cố.

## git stash — Lưu tạm công việc đang dở

Tình huống thường gặp: Bạn đang code giữa chừng thì cần chuyển sang branch khác gấp (fix bug, review PR). Bạn chưa muốn commit vì code chưa xong.

```bash
# Thay vì commit một đống WIP, dùng stash
git stash push -m "WIP: đang làm form validate"

# Hoặc ngắn gọn (không có message)
git stash
```

Bây giờ Working Directory sạch, bạn có thể switch branch:

```bash
git switch main
git switch -c hotfix/critical-bug
# ... fix bug, commit, push ...

# Quay lại và lấy code ra
git switch feature/login
git stash pop  # Áp dụng stash gần nhất và xóa khỏi danh sách
```

### Quản lý nhiều stash

```bash
# Xem danh sách stash
git stash list
# stash@{0}: On feature/login: WIP: đang làm form validate
# stash@{1}: On feature/dashboard: WIP: chart component

# Áp dụng stash cụ thể (không xóa)
git stash apply stash@{1}

# Xóa stash cụ thể
git stash drop stash@{1}

# Xóa tất cả stash
git stash clear

# Xem nội dung stash trước khi apply
git stash show -p stash@{0}
```

### Stash file untracked và ignored

```bash
# Stash cả file untracked (chưa git add lần nào)
git stash push -u -m "WIP: bao gồm file mới"

# Stash tất cả kể cả file trong .gitignore
git stash push -a -m "WIP: stash toàn bộ"
```

### Tạo branch từ stash

```bash
# Tạo branch mới và apply stash vào đó
git stash branch feature/new-branch stash@{0}
```

---

## git cherry-pick — Chọn commit cụ thể

Cherry-pick cho phép bạn "hái" một hoặc vài commit từ branch khác và áp dụng vào branch hiện tại.

### Tình huống sử dụng

```
develop: A ── B ── C ── D ── E
                   ↑
               Commit này (C) fix bug quan trọng
               cần đưa vào main ngay

main:    A ── B ──────────── C'
                              ↑
                         cherry-pick C
```

```bash
# Tìm hash của commit cần lấy
git log develop --oneline
# e4f5g6h feat: thêm export PDF
# a1b2c3d fix: sửa lỗi XSS quan trọng    ← cần cái này
# m1n2o3p feat: dashboard v2

# Cherry-pick commit đó vào branch hiện tại
git switch main
git cherry-pick a1b2c3d
```

### Cherry-pick nhiều commit

```bash
# Nhiều commit rời
git cherry-pick a1b2c3d e4f5g6h

# Dải commit liên tiếp (không bao gồm commit đầu)
git cherry-pick a1b2c3d..e4f5g6h

# Dải commit bao gồm cả commit đầu
git cherry-pick a1b2c3d^..e4f5g6h
```

### Cherry-pick không commit ngay

```bash
# Áp dụng thay đổi nhưng không tạo commit
git cherry-pick a1b2c3d --no-commit

# Xem lại, sửa thêm nếu cần
git status
git commit -m "fix: cherry-pick và chỉnh sửa thêm"
```

### Xử lý conflict khi cherry-pick

```bash
git cherry-pick a1b2c3d
# CONFLICT (content): Merge conflict in auth.js

# Resolve conflict...
git add auth.js
git cherry-pick --continue

# Hoặc hủy
git cherry-pick --abort
```

---

## git reset — Quay ngược lịch sử (local)

`git reset` di chuyển con trỏ HEAD về một commit cũ hơn. Có 3 chế độ:

```
                    Working     Staging
reset mode          Directory    Area      Repository
────────────────────────────────────────────────────
--soft              Giữ nguyên  Giữ nguyên  ← Quay lại
--mixed (default)   Giữ nguyên  Xóa stage   ← Quay lại
--hard              Xóa thay đổi Xóa stage  ← Quay lại
```

### git reset --soft

Quay lại commit cũ nhưng giữ nguyên thay đổi trong Staging Area:

```bash
# Undo commit gần nhất (giữ file đã stage)
git reset --soft HEAD~1

# Use case: muốn gộp commit cuối vào commit kế
git log --oneline
# a1b2c3d feat: thêm button   ← muốn gộp cái này
# e4f5g6h feat: thêm login form

git reset --soft HEAD~1
# Bây giờ thay đổi của a1b2c3d đang ở Staging
git commit -m "feat: thêm login form với button"
```

### git reset --mixed (mặc định)

Quay lại commit cũ, giữ thay đổi trong Working Directory nhưng bỏ stage:

```bash
git reset HEAD~2
# hoặc
git reset --mixed HEAD~2

# Use case: muốn chỉnh sửa lại cả 2 commit gần nhất
```

### git reset --hard

Quay về hẳn — xóa toàn bộ thay đổi sau điểm đó:

```bash
git reset --hard HEAD~1   # Xóa commit gần nhất và toàn bộ thay đổi

git reset --hard origin/main  # Reset về trạng thái giống remote

# ⚠️ Cảnh báo: --hard xóa code không thể khôi phục bằng cách thông thường
# (nhưng vẫn có thể dùng reflog để lấy lại)
```

---

## git revert — Hoàn tác an toàn (kể cả sau khi push)

Thay vì xóa commit (như reset), `git revert` tạo một commit **mới** làm ngược lại commit cũ. Lịch sử vẫn giữ nguyên.

```
Trước revert:
A ── B ── C   (C gây ra bug)

Sau git revert C:
A ── B ── C ── C'   (C' = commit đảo ngược C)
```

```bash
# Revert commit gần nhất
git revert HEAD

# Revert một commit cụ thể
git revert a1b2c3d

# Revert nhiều commit
git revert HEAD~3..HEAD

# Revert không commit ngay (để review trước)
git revert --no-commit a1b2c3d
```

### Reset vs Revert — Khi nào dùng cái nào?

| | Reset | Revert |
|---|---|---|
| Thay đổi lịch sử | ✅ Có | ❌ Không (thêm commit mới) |
| Dùng sau push | ❌ Nguy hiểm | ✅ An toàn |
| Dùng cho shared branch | ❌ Không | ✅ Có |
| Phù hợp | Branch cá nhân, local | main, develop, sau khi push |

**Quy tắc đơn giản**: Đã push lên remote và người khác có thể đã pull → dùng `revert`. Chưa push → có thể dùng `reset`.

---

## git reflog — Bảo hiểm tối thượng

`reflog` (reference log) ghi lại **mọi thứ HEAD đã trỏ đến** — kể cả khi bạn reset --hard hay xóa branch. Đây là công cụ phục hồi mạnh nhất của Git.

```bash
git reflog
```

```
a1b2c3d (HEAD -> main) HEAD@{0}: commit: feat: thêm tính năng search
e4f5g6h HEAD@{1}: reset: moving to HEAD~1
i7j8k9l HEAD@{2}: commit: fix: sửa bug validation (commit bị "mất")
m1n2o3p HEAD@{3}: checkout: moving from feature to main
```

### Phục hồi commit bị xóa

```bash
# Lỡ reset --hard và mất commit
git reset --hard HEAD~1

# Tìm lại commit trong reflog
git reflog
# e4f5g6h HEAD@{1}: commit: feat: code quan trọng

# Phục hồi
git checkout e4f5g6h  # Xem trước
# hoặc
git reset --hard e4f5g6h  # Quay về đúng commit đó
# hoặc
git cherry-pick e4f5g6h   # Áp dụng commit đó lên branch hiện tại
```

### Phục hồi branch bị xóa

```bash
# Lỡ xóa branch quan trọng
git branch -D feature/important

# Tìm commit cuối của branch trong reflog
git reflog
# a1b2c3d HEAD@{5}: checkout: moving from feature/important to main

# Tạo lại branch từ commit đó
git checkout -b feature/important a1b2c3d
```

---

## git bisect — Tìm commit gây ra bug

Khi không biết commit nào gây ra bug, `bisect` dùng **binary search** để tìm:

```bash
# Bắt đầu bisect
git bisect start

# Đánh dấu commit hiện tại là "bad" (có bug)
git bisect bad

# Đánh dấu commit cũ biết là "good" (không có bug)
git bisect good v1.0.0

# Git tự checkout commit ở giữa
# Test xem có bug không, rồi đánh dấu:
git bisect good  # hoặc
git bisect bad

# Git tiếp tục thu hẹp... cho đến khi tìm ra commit gây bug
# Kết quả: "a1b2c3d is the first bad commit"

# Kết thúc
git bisect reset
```

Với 1000 commit, `bisect` chỉ cần test khoảng **10 lần** (log₂ 1000 ≈ 10).

---

## Tóm tắt

| Lệnh | Tác dụng |
|---|---|
| `git stash` | Lưu tạm thay đổi chưa commit |
| `git stash pop` | Lấy stash gần nhất ra và xóa |
| `git stash list` | Xem danh sách stash |
| `git cherry-pick <hash>` | Áp dụng commit cụ thể vào branch hiện tại |
| `git reset --soft HEAD~1` | Undo commit, giữ thay đổi ở staging |
| `git reset --hard HEAD~1` | Undo commit và xóa luôn thay đổi |
| `git revert <hash>` | Tạo commit đảo ngược (an toàn) |
| `git reflog` | Xem toàn bộ lịch sử HEAD (cứu hộ) |
| `git bisect` | Tìm commit gây bug bằng binary search |

---

**Bài trước**: [← Git Rebase và Git Flow](/posts/git-rebase-va-git-flow/)

**Bài tiếp theo**: [Git Hooks và tự động hóa workflow →](/posts/git-hooks-va-tu-dong-hoa/)

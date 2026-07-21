+++
date        = '2026-06-28T11:30:00+07:00'
draft       = false
title       = 'Git Hooks và tự động hóa workflow: Hooks, Aliases, Husky'
slug        = 'git-hooks-va-tu-dong-hoa'
summary     = 'Tự động hóa Git workflow với hooks: chạy lint trước commit, test trước push, enforce commit message. Kèm Git aliases hữu ích và Husky cho dự án Node.js.'
thumbnail   = '/images/git-series/08-git-hooks.webp'
weight      = 8
categories  = ['it']
subcategories = ['version-control']
tags        = ['git', 'devops']
series      = ['huong-dan-git-tu-co-ban-den-nang-cao']
authors     = ['Nguyen Chung']
+++

Bài cuối của series này đi vào tự động hóa workflow với Git Hooks — chạy script tự động tại các điểm quan trọng trong vòng đời của commit. Kết hợp với Git aliases, bạn sẽ làm việc nhanh và ít lỗi hơn đáng kể.

## Git Hooks là gì?

**Git Hooks** là các script shell được Git tự động chạy khi một sự kiện nhất định xảy ra (commit, push, merge...). Chúng nằm trong thư mục `.git/hooks/`.

```bash
ls .git/hooks/
# applypatch-msg.sample    pre-applypatch.sample
# commit-msg.sample        pre-commit.sample
# post-commit.sample       pre-push.sample
# post-merge.sample        prepare-commit-msg.sample
# post-receive.sample      update.sample
```

Các file `.sample` là ví dụ — để kích hoạt, xóa phần `.sample`:

```bash
cp .git/hooks/pre-commit.sample .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Client-side vs Server-side Hooks

**Client-side** (chạy trên máy developer):

| Hook | Thời điểm chạy |
|---|---|
| `pre-commit` | Trước khi tạo commit — dùng nhiều nhất |
| `prepare-commit-msg` | Sau khi tạo template message |
| `commit-msg` | Sau khi nhập commit message |
| `post-commit` | Sau khi commit thành công |
| `pre-push` | Trước khi push lên remote |
| `pre-rebase` | Trước khi rebase |

**Server-side** (chạy trên remote server — GitHub/GitLab):

| Hook | Thời điểm chạy |
|---|---|
| `pre-receive` | Trước khi nhận push |
| `update` | Trước khi update từng branch |
| `post-receive` | Sau khi nhận push thành công |

---

## pre-commit — Tự động lint và format code

Hook phổ biến nhất: tự động chạy linter trước khi commit, từ chối commit nếu có lỗi.

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "🔍 Chạy ESLint..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ ESLint phát hiện lỗi. Commit bị hủy."
    echo "   Chạy 'npm run lint:fix' để tự động sửa."
    exit 1
fi

echo "✅ Lint OK, tiến hành commit..."
exit 0
```

Thêm quyền thực thi:

```bash
chmod +x .git/hooks/pre-commit
```

Giờ mỗi lần `git commit`, script trên sẽ chạy trước. Nếu lint fail → commit bị hủy.

### Kiểm tra với Python project

```bash
#!/bin/sh
# .git/hooks/pre-commit — cho dự án Python

# Chạy black formatter
echo "🔍 Kiểm tra format với black..."
black --check .

if [ $? -ne 0 ]; then
    echo "❌ Code chưa được format. Chạy 'black .' để sửa."
    exit 1
fi

# Chạy flake8 linter
echo "🔍 Chạy flake8..."
flake8 .

if [ $? -ne 0 ]; then
    echo "❌ Flake8 phát hiện lỗi."
    exit 1
fi

echo "✅ Tất cả OK!"
exit 0
```

---

## commit-msg — Enforce commit message format

Hook này validate commit message theo quy ước Conventional Commits:

```bash
#!/bin/sh
# .git/hooks/commit-msg

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Regex kiểm tra Conventional Commits
PATTERN="^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,72}"

if ! echo "$COMMIT_MSG" | grep -qE "$PATTERN"; then
    echo "❌ Commit message không đúng format!"
    echo ""
    echo "   Yêu cầu: <type>(<scope>): <description>"
    echo "   Ví dụ:   feat(auth): thêm tính năng đăng nhập bằng Google"
    echo ""
    echo "   Types hợp lệ: feat, fix, docs, style, refactor, test, chore"
    exit 1
fi

echo "✅ Commit message hợp lệ."
exit 0
```

Thử test:

```bash
git commit -m "sửa bug"
# ❌ Commit message không đúng format!

git commit -m "fix(auth): sửa lỗi validate email khi đăng ký"
# ✅ Commit message hợp lệ.
```

---

## pre-push — Chạy test trước khi push

```bash
#!/bin/sh
# .git/hooks/pre-push

echo "🧪 Chạy test suite trước khi push..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests thất bại! Push bị hủy."
    echo "   Sửa test trước khi push."
    exit 1
fi

echo "✅ Tất cả tests pass. Đang push..."
exit 0
```

---

## post-commit — Thông báo sau commit

```bash
#!/bin/sh
# .git/hooks/post-commit

COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%s)

echo "🎉 Commit thành công: [$COMMIT_HASH] $COMMIT_MSG"

# Ví dụ: gửi thông báo lên Slack webhook
# curl -X POST -H 'Content-type: application/json' \
#   --data "{\"text\":\"New commit: [$COMMIT_HASH] $COMMIT_MSG\"}" \
#   $SLACK_WEBHOOK_URL
```

---

## Husky — Quản lý Git Hooks trong dự án Node.js

Vấn đề của hooks thủ công: `.git/hooks/` **không được commit vào Git**. Mỗi thành viên team phải tự cài.

**Husky** giải quyết điều này bằng cách lưu hooks trong source code:

### Cài đặt

```bash
npm install --save-dev husky
npx husky init
```

Tạo file `.husky/pre-commit`:

```bash
#!/bin/sh
npm run lint && npm run test
```

Commit và push `.husky/` vào repo. Khi đồng nghiệp clone về và chạy `npm install`, hooks tự động được cài đặt.

### Kết hợp với lint-staged

`lint-staged` chỉ chạy lint trên các file đang được stage (nhanh hơn lint toàn bộ dự án):

```bash
npm install --save-dev lint-staged
```

`package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "lint-staged": {
    "*.{js,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint --edit $1"
    }
  }
}
```

### commitlint — Enforce Conventional Commits với Husky

```bash
npm install --save-dev @commitlint/{cli,config-conventional}
```

`commitlint.config.js`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2, 'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'revert']
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'header-max-length': [2, 'always', 100],
  }
};
```

---

## Git Aliases — Viết tắt lệnh thường dùng

Thêm aliases vào `~/.gitconfig` để gõ nhanh hơn:

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.undo "reset --soft HEAD~1"
git config --global alias.unstage "restore --staged"
```

Hoặc chỉnh trực tiếp `~/.gitconfig`:

```ini
[alias]
    st     = status
    co     = checkout
    sw     = switch
    br     = branch
    ci     = commit
    ca     = commit --amend --no-edit

    # Log đẹp
    lg     = log --oneline --graph --all --decorate
    ll     = log --oneline -20

    # Thao tác nhanh
    undo   = reset --soft HEAD~1
    unstage = restore --staged

    # Xem diff đã stage
    ds     = diff --staged

    # Xóa branch đã merge
    cleanup = "!git branch --merged | grep -v main | xargs git branch -d"

    # Push branch mới lên remote
    publish = "!git push -u origin $(git branch --show-current)"
```

Cách dùng:

```bash
git st          # = git status
git lg          # = git log --oneline --graph --all --decorate
git undo        # = git reset --soft HEAD~1 (undo commit gần nhất)
git unstage README.md  # = git restore --staged README.md
git cleanup     # Xóa tất cả branch đã merge vào main
git publish     # Push branch hiện tại lên remote với --set-upstream
```

---

## Tips & Best Practices

### Bỏ qua hook khi cần thiết

```bash
# Bỏ qua pre-commit hook (dùng cẩn thận)
git commit --no-verify -m "wip: commit nhanh chưa cần lint"

# Bỏ qua pre-push hook
git push --no-verify
```

Chỉ dùng `--no-verify` khi thực sự cần — không dùng như thói quen để tránh hook.

### Chia sẻ hooks với team (không dùng Husky)

```bash
# Đặt hooks vào thư mục trong repo
mkdir -p .githooks
cp .git/hooks/pre-commit .githooks/

# Mỗi thành viên chạy lệnh này sau khi clone
git config core.hooksPath .githooks
```

Hoặc thêm vào `Makefile`:

```makefile
setup:
	git config core.hooksPath .githooks
	npm install
```

---

## Tổng kết series

Chúc mừng! Bạn đã hoàn thành toàn bộ series **Hướng dẫn Git từ cơ bản đến nâng cao**. Dưới đây là bản đồ tổng quan những gì bạn đã học:

```
Bài 1: Git là gì?
  └─ Version control, distributed VCS, khái niệm cơ bản

Bài 2: Cài đặt & Cấu hình
  └─ Windows/macOS/Linux, git config, SSH key

Bài 3: Git Cơ bản
  └─ init, add, commit, status, log, diff, .gitignore

Bài 4: Remote Repository
  └─ clone, push, pull, fetch, xử lý conflict

Bài 5: Branch & Merge
  └─ Tạo branch, fast-forward, no-ff, squash, resolve conflict

Bài 6: Rebase & Git Flow
  └─ Rebase, interactive rebase, Git Flow, GitHub Flow

Bài 7: Git Nâng cao
  └─ stash, cherry-pick, reset, revert, reflog, bisect

Bài 8: Hooks & Automation  ← Bạn đang ở đây
  └─ pre-commit, commit-msg, Husky, lint-staged, aliases
```

### Lộ trình tiếp theo

- **GitHub Actions / GitLab CI**: Tự động build, test, deploy khi push
- **Conventional Commits**: Tự động sinh CHANGELOG
- **Semantic Versioning**: Quản lý version dự án
- **Git LFS**: Quản lý file lớn (media, datasets)
- **Monorepo**: Quản lý nhiều dự án trong một repo

---

**Bài trước**: [← Git Nâng cao: stash, cherry-pick, reset](/posts/git-nang-cao-stash-cherry-pick-reset/)

**Bài đầu series**: [Git là gì? Tại sao cần dùng Git? →](/posts/git-la-gi-tai-sao-can-dung-git/)

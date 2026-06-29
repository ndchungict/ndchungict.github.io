+++
date        = '2026-06-29T08:30:00+07:00'
draft       = false
title       = 'Cài đặt và cấu hình Git trên Windows, macOS, Linux'
slug        = 'cai-dat-va-cau-hinh-git'
summary     = 'Hướng dẫn cài đặt Git trên Windows, macOS và Linux, cấu hình user, editor, SSH key và các thiết lập cần thiết trước khi bắt đầu làm việc.'
thumbnail   = '/images/git-series/02-cai-dat-git.svg'
weight      = 2
categories  = ['it']
tags        = ['git', 'devops']
series      = ['huong-dan-git-tu-co-ban-den-nang-cao']
authors     = ['Nguyen Chung']
+++

Trước khi bắt đầu dùng Git, bạn cần cài đặt và cấu hình đúng cách. Bài này hướng dẫn cài Git trên cả 3 hệ điều hành phổ biến, thiết lập SSH key để kết nối GitHub/GitLab không cần nhập password.

## Cài đặt Git

### Windows

**Cách 1 — Git for Windows (khuyến nghị cho người mới):**

Tải installer tại [git-scm.com/download/win](https://git-scm.com/download/win), chạy file `.exe` và giữ nguyên các tùy chọn mặc định. Git Bash sẽ được cài kèm.

**Cách 2 — winget (Windows Package Manager):**

```powershell
winget install --id Git.Git -e --source winget
```

**Cách 3 — Chocolatey:**

```powershell
choco install git
```

Kiểm tra sau khi cài:

```bash
git --version
# git version 2.43.0.windows.1
```

### macOS

**Cách 1 — Homebrew (khuyến nghị):**

```bash
# Cài Homebrew nếu chưa có
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Cài Git
brew install git
```

**Cách 2 — Xcode Command Line Tools:**

```bash
xcode-select --install
```

Lệnh này sẽ cài một bộ tools bao gồm Git (phiên bản Apple, thường cũ hơn). Nên dùng Homebrew để có phiên bản mới nhất.

### Linux

**Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install git -y
```

**Fedora / RHEL / CentOS:**

```bash
sudo dnf install git
```

**Arch Linux:**

```bash
sudo pacman -S git
```

---

## Cấu hình Git lần đầu

Sau khi cài, bước đầu tiên là khai báo danh tính. Thông tin này sẽ gắn vào mọi commit bạn tạo.

### Cấu hình bắt buộc

```bash
git config --global user.name "Nguyen Chung"
git config --global user.email "ndchungict@gmail.com"
```

Flag `--global` nghĩa là áp dụng cho toàn bộ dự án trên máy. Bạn cũng có thể cấu hình riêng từng dự án bằng cách bỏ `--global` (chạy lệnh trong thư mục dự án đó).

### Cấu hình editor

Khi Git cần bạn nhập thông tin (ví dụ viết commit message dài), nó sẽ mở editor. Cấu hình editor bạn quen dùng:

```bash
# VS Code
git config --global core.editor "code --wait"

# Vim
git config --global core.editor "vim"

# Nano (dễ hơn cho người mới)
git config --global core.editor "nano"

# Neovim
git config --global core.editor "nvim"
```

### Cấu hình branch mặc định

Thay `master` thành `main` (quy ước hiện đại):

```bash
git config --global init.defaultBranch main
```

### Cấu hình line ending (quan trọng khi làm việc cross-platform)

```bash
# Windows: tự động chuyển CRLF thành LF khi commit
git config --global core.autocrlf true

# macOS / Linux: giữ nguyên LF
git config --global core.autocrlf input
```

### Xem tất cả cấu hình

```bash
git config --list

# user.name=Nguyen Chung
# user.email=ndchungict@gmail.com
# core.editor=code --wait
# init.defaultBranch=main
# core.autocrlf=input
```

### File .gitconfig

Tất cả cấu hình `--global` được lưu trong file `~/.gitconfig` (thư mục home của bạn):

```ini
[user]
    name = Nguyen Chung
    email = ndchungict@gmail.com

[core]
    editor = code --wait
    autocrlf = input

[init]
    defaultBranch = main

[alias]
    st = status
    lg = log --oneline --graph --all --decorate
    co = checkout
    br = branch
```

Bạn có thể chỉnh sửa file này trực tiếp thay vì dùng lệnh `git config`.

---

## Thiết lập SSH Key

SSH key cho phép bạn push/pull với GitHub, GitLab mà không cần nhập username/password mỗi lần.

### Tạo SSH key mới

```bash
ssh-keygen -t ed25519 -C "ndchungict@gmail.com"
```

Khi được hỏi:
- **File location**: nhấn Enter để dùng đường dẫn mặc định (`~/.ssh/id_ed25519`)
- **Passphrase**: nhập mật khẩu bảo vệ key (nên có), hoặc Enter để bỏ qua

```
Generating public/private ed25519 key pair.
Enter file in which to save the key (/Users/chungnd/.ssh/id_ed25519):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /Users/chungnd/.ssh/id_ed25519
Your public key has been saved in /Users/chungnd/.ssh/id_ed25519.pub
```

Hai file được tạo ra:
- `~/.ssh/id_ed25519` — **private key** (KHÔNG chia sẻ với ai)
- `~/.ssh/id_ed25519.pub` — **public key** (thêm vào GitHub/GitLab)

### Thêm SSH key vào GitHub

**Bước 1**: Sao chép public key:

```bash
# macOS
cat ~/.ssh/id_ed25519.pub | pbcopy

# Linux
cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard

# Windows (Git Bash)
cat ~/.ssh/id_ed25519.pub | clip
```

**Bước 2**: Vào GitHub → **Settings** → **SSH and GPG keys** → **New SSH key**

**Bước 3**: Dán public key vào ô **Key**, đặt tên và lưu.

### Kiểm tra kết nối SSH

```bash
ssh -T git@github.com
# Hi chungnd1! You've successfully authenticated,
# but GitHub does not provide shell access.
```

Nếu thấy thông báo trên → SSH đã hoạt động.

### Thêm SSH key vào ssh-agent (để không nhập passphrase mỗi lần)

```bash
# Khởi động ssh-agent
eval "$(ssh-agent -s)"

# Thêm key
ssh-add ~/.ssh/id_ed25519
```

Trên macOS, thêm vào `~/.ssh/config` để tự động load:

```
Host github.com
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

---

## Git GUI Clients (tùy chọn)

Nếu bạn thích giao diện đồ họa thay vì dòng lệnh:

| Công cụ | Nền tảng | Ghi chú |
|---|---|---|
| **GitHub Desktop** | Win/Mac | Đơn giản, dành cho người mới |
| **GitKraken** | Win/Mac/Linux | Mạnh, có phí cho advanced features |
| **Sourcetree** | Win/Mac | Miễn phí, đầy đủ tính năng |
| **VS Code** | Win/Mac/Linux | Built-in Git integration |
| **IntelliJ IDEA** | Win/Mac/Linux | Tích hợp tốt cho Java/Kotlin |

Dù vậy, **khuyến khích học dòng lệnh trước** — bạn sẽ hiểu Git sâu hơn và không bị phụ thuộc vào một công cụ cụ thể.

---

## Tóm tắt checklist

Sau bài này, bạn nên đã hoàn thành:

- [x] Cài Git và kiểm tra bằng `git --version`
- [x] Cấu hình `user.name` và `user.email`
- [x] Cấu hình editor
- [x] Cấu hình `init.defaultBranch = main`
- [x] Tạo SSH key và thêm vào GitHub/GitLab
- [x] Test kết nối SSH với `ssh -T git@github.com`

---

**Bài trước**: [← Git là gì? Tại sao cần dùng Git?](/posts/git-la-gi-tai-sao-can-dung-git/)

**Bài tiếp theo**: [Git cơ bản: init, add, commit, status, log →](/posts/git-co-ban-init-add-commit/)

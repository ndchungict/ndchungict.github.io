---
layout: post
title: "[AI] Cài Đặt và Thiết Lập Kiro"
summary: "Hướng dẫn chi tiết cách cài đặt Kiro IDE, thiết lập môi trường làm việc ban đầu và cấu hình các tùy chọn cơ bản"
author: chungnd
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro installation, kiro setup, kiro configuration, install kiro ide
permalink: /huong-dan-su-dung-kiro/cai-dat-thiet-lap-kiro
usemathjax: false
---

# Chương 2: Cài Đặt và Thiết Lập

## Tóm Tắt

Chương này hướng dẫn chi tiết cách cài đặt Kiro IDE, thiết lập môi trường làm việc ban đầu, và cấu hình các tùy chọn cơ bản để bắt đầu sử dụng hiệu quả.

## Yêu Cầu Hệ Thống

### Phần Cứng Tối Thiểu
- **CPU**: Intel Core i5 hoặc tương đương
- **RAM**: 8GB (khuyến nghị 16GB)
- **Ổ cứng**: 2GB dung lượng trống
- **Kết nối**: Internet ổn định

### Hệ Điều Hành Hỗ Trợ
- ✅ Windows 10/11 (64-bit)
- ✅ macOS 10.15 (Catalina) trở lên
- ✅ Linux (Ubuntu 20.04+, Fedora, Debian)

### Phần Mềm Cần Thiết
- Git (phiên bản 2.0+)
- Node.js (khuyến nghị LTS)
- Python 3.8+ (cho MCP servers)
- uv/uvx (cho Python MCP servers)

## Cài Đặt Kiro

### Bước 1: Tải Kiro

1. Truy cập https://kiro.dev
2. Click nút **Download**
3. Chọn phiên bản phù hợp với hệ điều hành

### Bước 2: Cài Đặt

#### Windows
```bash
# Chạy file installer đã tải
kiro-setup-x64.exe

# Hoặc dùng winget
winget install Amazon.Kiro
```

#### macOS
```bash
# Mở file .dmg và kéo Kiro vào Applications
# Hoặc dùng Homebrew
brew install --cask kiro
```

#### Linux
```bash
# Debian/Ubuntu
sudo dpkg -i kiro_amd64.deb

# Fedora/RHEL
sudo rpm -i kiro-x86_64.rpm

# Hoặc dùng snap
sudo snap install kiro --classic
```

### Bước 3: Khởi Động Lần Đầu

1. Mở Kiro IDE
2. Chọn theme (Light/Dark)
3. Đăng nhập hoặc tạo tài khoản AWS
4. Chọn AI model (Claude Sonnet 4.5 khuyến nghị)

## Thiết Lập Ban Đầu

### Cấu Hình Git

```bash
# Kiểm tra Git đã cài đặt
git --version

# Cấu hình thông tin cá nhân
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"
```

### Cài Đặt Python và uv (Cho MCP Servers)

#### macOS/Linux
```bash
# Cài đặt uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Hoặc dùng pip
pip install uv

# Kiểm tra
uv --version
uvx --version
```

#### Windows
```powershell
# Dùng pip
pip install uv

# Hoặc dùng scoop
scoop install uv
```

### Mở Dự Án Đầu Tiên

#### Cách 1: Từ Terminal
```bash
# Di chuyển đến thư mục dự án
cd /path/to/your/project

# Mở với Kiro
kiro .
```

#### Cách 2: Từ GUI
1. Mở Kiro IDE
2. File → Open Folder
3. Chọn thư mục dự án

#### Cách 3: Tạo Dự Án Mới
1. File → New Window
2. Chọn thư mục trống
3. Kiro sẽ khởi tạo cấu trúc cơ bản

## Cấu Hình Workspace

### Tạo Thư Mục .kiro

Kiro tự động tạo thư mục `.kiro` trong dự án với cấu trúc:

```
.kiro/
├── settings/
│   └── mcp.json          # Cấu hình MCP servers
├── steering/             # Hướng dẫn cho AI
│   ├── architecture.md
│   ├── product.md
│   └── tech.md
├── specs/                # Đặc tả dự án
└── hooks/                # Automation hooks
```

### Tạo Steering Files Tự Động

1. Click vào biểu tượng **Ghost** (👻) trên sidebar
2. Chọn **Generate Steering Docs**
3. Kiro sẽ phân tích dự án và tạo 3 files:
   - `architecture.md`: Cấu trúc dự án
   - `product.md`: Thông tin sản phẩm
   - `tech.md`: Stack công nghệ

## Cấu Hình Settings

### User Settings (Toàn Cục)

Mở Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):
```
Preferences: Open User Settings (JSON)
```

Ví dụ cấu hình:
```json
{
  "kiro.model": "claude-sonnet-4.5",
  "kiro.autopilot.enabled": true,
  "kiro.steering.autoLoad": true,
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "files.autoSave": "afterDelay"
}
```

### Workspace Settings (Theo Dự Án)

Tạo file `.vscode/settings.json`:
```json
{
  "kiro.steering.paths": [
    ".kiro/steering/**/*.md"
  ],
  "kiro.specs.defaultMode": "spec",
  "kiro.hooks.enabled": true
}
```

## Cài Đặt Extensions

### Extensions Khuyến Nghị

Kiro tương thích với VS Code extensions từ Open VSX:

1. Mở Extensions view (`Ctrl+Shift+X`)
2. Tìm và cài đặt:
   - **GitLens**: Git history và blame
   - **Prettier**: Code formatting
   - **ESLint**: JavaScript linting
   - **Python**: Python support
   - **Docker**: Container support

### Đồng Bộ Settings Từ VS Code

Nếu đã dùng VS Code:
```bash
# Copy settings
cp ~/.vscode/settings.json ~/.kiro/settings.json

# Copy keybindings
cp ~/.vscode/keybindings.json ~/.kiro/keybindings.json
```

## Cấu Hình MCP Servers

### Tạo File MCP Config

Tạo `.kiro/settings/mcp.json`:
```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Kiểm Tra MCP Servers

1. Mở Command Palette
2. Gõ: `MCP: List Servers`
3. Kiểm tra status của các servers

## Xác Minh Cài Đặt

### Checklist Hoàn Thành

- [ ] Kiro IDE đã cài đặt và mở được
- [ ] Git đã cấu hình
- [ ] Python và uv/uvx đã cài đặt
- [ ] Đã tạo hoặc mở một dự án
- [ ] Thư mục `.kiro` đã được tạo
- [ ] Steering files đã được generate
- [ ] MCP servers đã cấu hình (nếu cần)
- [ ] Extensions cần thiết đã cài đặt

### Kiểm Tra Bằng Chat

Mở Kiro Chat và thử:
```
Xin chào Kiro! Hãy giới thiệu về dự án này.
```

Nếu Kiro trả lời được, cài đặt đã thành công!

## Troubleshooting

### Lỗi Thường Gặp

#### 1. Kiro không khởi động
```bash
# Xóa cache và khởi động lại
rm -rf ~/.kiro/cache
kiro --reset
```

#### 2. MCP Server không kết nối
```bash
# Kiểm tra uvx
uvx --version

# Cài đặt lại uv
pip install --upgrade uv
```

#### 3. Git không được nhận diện
```bash
# Thêm Git vào PATH (Windows)
setx PATH "%PATH%;C:\Program Files\Git\bin"

# macOS/Linux
export PATH="/usr/local/bin:$PATH"
```

#### 4. Lỗi quyền truy cập (Linux/macOS)
```bash
# Cấp quyền cho thư mục .kiro
chmod -R 755 .kiro/
```

## Cập Nhật Kiro

### Kiểm Tra Phiên Bản
```bash
kiro --version
```

### Cập Nhật

#### Windows
```bash
winget upgrade Amazon.Kiro
```

#### macOS
```bash
brew upgrade kiro
```

#### Linux
```bash
# Tải phiên bản mới từ kiro.dev
# Cài đặt như bước cài đặt ban đầu
```

## Gỡ Cài Đặt

### Windows
```bash
# Control Panel → Programs → Uninstall
# Hoặc
winget uninstall Amazon.Kiro
```

### macOS
```bash
# Kéo Kiro từ Applications vào Trash
# Hoặc
brew uninstall kiro

# Xóa dữ liệu
rm -rf ~/.kiro
```

### Linux
```bash
sudo apt remove kiro  # Debian/Ubuntu
sudo dnf remove kiro  # Fedora
sudo snap remove kiro # Snap

# Xóa dữ liệu
rm -rf ~/.kiro
```

## Tips Thiết Lập

### 1. Tối Ưu Hiệu Suất
```json
{
  "kiro.indexing.enabled": true,
  "kiro.indexing.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/.git/**"
  ]
}
```

### 2. Keyboard Shortcuts Hữu Ích
- `Ctrl+Shift+P`: Command Palette
- `Ctrl+K Ctrl+S`: Keyboard Shortcuts
- `Ctrl+` `: Toggle Terminal
- `Ctrl+B`: Toggle Sidebar

### 3. Backup Settings
```bash
# Backup
cp -r ~/.kiro/settings ~/kiro-backup/

# Restore
cp -r ~/kiro-backup/* ~/.kiro/settings/
```

## Kết Luận

Sau khi hoàn thành chương này, bạn đã có một môi trường Kiro IDE hoàn chỉnh và sẵn sàng để bắt đầu phát triển. Hãy chuyển sang chương tiếp theo để làm quen với giao diện và các tính năng cơ bản.

---

**Chương tiếp theo**: [Giao Diện và Tính Năng Cơ Bản](./03-giao-dien.md)

---

*Bài viết được viết bằng AI 🚀*

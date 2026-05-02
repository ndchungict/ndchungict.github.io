---
layout: post
title: "[AI] Cài Đặt và Bắt Đầu với GitHub Copilot"
summary: "Hướng dẫn chi tiết cách cài đặt và thiết lập GitHub Copilot trên các IDE phổ biến như VS Code, JetBrains, Visual Studio và bắt đầu sử dụng ngay"
author: chungnd
date: '2026-02-06 10:30:00 +0700'
category: ['ai','github-copilot']
series: "tong-quan-github-copilot"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: cài đặt github copilot, setup copilot, vs code copilot, copilot installation
permalink: /cai-dat-va-bat-dau-github-copilot/
usemathjax: false
---

# Cài Đặt và Bắt Đầu với GitHub Copilot

## Yêu cầu trước khi cài đặt

### 1. Tài khoản GitHub
- Cần có tài khoản GitHub cá nhân
- Đăng ký gói Copilot (Free, Pro, hoặc Pro+)

### 2. IDE được hỗ trợ
Chọn một trong các IDE sau:
- Visual Studio Code (khuyên dùng cho người mới)
- Visual Studio
- JetBrains IDEs
- Neovim
- Xcode
- Eclipse

## Đăng ký GitHub Copilot

### Bước 1: Truy cập trang GitHub Copilot
1. Đăng nhập vào GitHub.com
2. Truy cập: https://github.com/features/copilot
3. Chọn gói phù hợp với nhu cầu

### Bước 2: Chọn gói dịch vụ

**Copilot Free** (Miễn phí)
- Phù hợp để dùng thử
- Giới hạn số lượng suggestions
- Không cần thẻ tín dụng

**Copilot Pro** ($10/tháng)
- Dành cho cá nhân
- Dùng thử miễn phí 30 ngày
- Truy cập đầy đủ tính năng
- Giới hạn sử dụng cao

**Copilot Pro+** ($20/tháng)
- Premium requests
- Các mô hình AI mới nhất
- Ưu tiên xử lý

### Bước 3: Xác nhận đăng ký
- Làm theo hướng dẫn trên màn hình
- Xác nhận email nếu cần
- Hoàn tất thanh toán (nếu chọn gói trả phí)

## Cài đặt trên Visual Studio Code

### Bước 1: Cài đặt Extension

**Cách 1: Từ VS Code**
1. Mở VS Code
2. Nhấn `Ctrl+Shift+X` (Windows/Linux) hoặc `Cmd+Shift+X` (macOS)
3. Tìm kiếm "GitHub Copilot"
4. Click "Install" trên extension "GitHub Copilot"
5. Cài thêm "GitHub Copilot Chat" để sử dụng tính năng chat

**Cách 2: Từ Marketplace**
1. Truy cập: https://marketplace.visualstudio.com/items?itemName=GitHub.copilot
2. Click "Install"
3. VS Code sẽ tự động mở và cài đặt

### Bước 2: Đăng nhập GitHub

1. Sau khi cài đặt, VS Code sẽ yêu cầu đăng nhập
2. Click "Sign in to GitHub"
3. Trình duyệt sẽ mở, xác nhận quyền truy cập
4. Quay lại VS Code, bạn sẽ thấy thông báo đăng nhập thành công

### Bước 3: Kiểm tra cài đặt

1. Mở một file code bất kỳ (ví dụ: `.js`, `.py`)
2. Bắt đầu gõ code
3. Bạn sẽ thấy suggestions màu xám từ Copilot
4. Nhấn `Tab` để chấp nhận suggestion

## Cài đặt trên các IDE khác

### JetBrains IDEs (IntelliJ IDEA, PyCharm, WebStorm, v.v.)

1. Mở IDE
2. Vào `File` → `Settings` (Windows/Linux) hoặc `Preferences` (macOS)
3. Chọn `Plugins`
4. Tìm "GitHub Copilot"
5. Click "Install"
6. Restart IDE
7. Đăng nhập GitHub khi được yêu cầu

### Visual Studio

1. Mở Visual Studio
2. Vào `Extensions` → `Manage Extensions`
3. Tìm "GitHub Copilot"
4. Download và cài đặt
5. Restart Visual Studio
6. Đăng nhập GitHub

### Xcode (macOS)

1. Download GitHub Copilot for Xcode từ GitHub
2. Cài đặt theo hướng dẫn
3. Mở Xcode
4. Vào `Editor` → `GitHub Copilot` → `Sign In`
5. Xác nhận quyền truy cập

## Sử dụng lần đầu tiên

### 1. Nhận suggestion đầu tiên

**Ví dụ với JavaScript:**

```javascript
// Tạo file mới: calculator.js
// Gõ comment sau:

// Function to calculate the sum of two numbers

// Copilot sẽ tự động đề xuất:
function sum(a, b) {
    return a + b;
}
```

**Nhấn `Tab`** để chấp nhận suggestion

### 2. Sử dụng Copilot Chat

**Trong VS Code:**

1. Mở Chat view từ Activity Bar (biểu tượng chat bên trái)
2. Hoặc nhấn `Ctrl+Shift+I` (Windows/Linux) hoặc `Cmd+Shift+I` (macOS)
3. Gõ câu hỏi trong chat box

**Ví dụ câu hỏi:**
```
explain this file
```
```
how do I fix this error?
```
```
write unit tests for this function
```

### 3. Inline Chat

1. Chọn đoạn code cần hỗ trợ
2. Nhấn `Ctrl+I` (Windows/Linux) hoặc `Cmd+I` (macOS)
3. Gõ yêu cầu của bạn
4. Copilot sẽ đề xuất thay đổi trực tiếp

**Ví dụ:**
```
add error handling to this function
```
```
refactor this code to use async/await
```

## Các phím tắt quan trọng

### VS Code

| Chức năng | Windows/Linux | macOS |
|-----------|---------------|-------|
| Chấp nhận suggestion | `Tab` | `Tab` |
| Từ chối suggestion | `Esc` | `Esc` |
| Xem suggestion tiếp theo | `Alt+]` | `Option+]` |
| Xem suggestion trước đó | `Alt+[` | `Option+[` |
| Mở Copilot Chat | `Ctrl+Shift+I` | `Cmd+Shift+I` |
| Inline Chat | `Ctrl+I` | `Cmd+I` |
| Trigger suggestion | `Alt+\` | `Option+\` |

### JetBrains IDEs

| Chức năng | Phím tắt |
|-----------|----------|
| Chấp nhận suggestion | `Tab` |
| Từ chối suggestion | `Esc` |
| Xem suggestion khác | `Alt+]` / `Alt+[` |
| Mở Copilot Chat | Click icon bên phải |

## Cấu hình cơ bản

### Trong VS Code

1. Mở Settings: `Ctrl+,` (Windows/Linux) hoặc `Cmd+,` (macOS)
2. Tìm "Copilot"
3. Các cài đặt quan trọng:

**Enable/Disable Copilot:**
```
GitHub Copilot: Enable
```

**Ngôn ngữ được bật:**
```
GitHub Copilot: Enable For Languages
```

**Inline suggestions:**
```
Editor: Inline Suggest: Enabled
```

### Tắt Copilot tạm thời

**Tắt toàn bộ:**
- Click icon Copilot ở status bar (góc dưới phải)
- Chọn "Disable Completions"

**Tắt cho file cụ thể:**
- Click icon Copilot
- Chọn "Disable Completions for [file type]"

## Kiểm tra hoạt động

### Test 1: Code Completion

Tạo file `test.js` và gõ:
```javascript
// Function to reverse a string
```

Copilot sẽ đề xuất implementation. Nhấn `Tab` để chấp nhận.

### Test 2: Chat

Mở Copilot Chat và hỏi:
```
How do I read a file in Node.js?
```

Copilot sẽ trả lời với code example.

### Test 3: Explain Code

1. Viết một đoạn code phức tạp
2. Chọn code đó
3. Trong Chat, gõ: `explain this code`
4. Copilot sẽ giải thích chi tiết

## Xử lý sự cố thường gặp

### Copilot không hiển thị suggestions

**Giải pháp:**
1. Kiểm tra icon Copilot ở status bar (phải có màu xanh)
2. Đảm bảo đã đăng nhập GitHub
3. Kiểm tra subscription còn hiệu lực
4. Restart IDE
5. Kiểm tra kết nối internet

### Suggestions không chính xác

**Giải pháp:**
1. Cung cấp context rõ ràng hơn (comments, function names)
2. Mở các file liên quan
3. Viết code mẫu để Copilot học pattern
4. Sử dụng Chat để hỏi cụ thể hơn

### Không thể đăng nhập

**Giải pháp:**
1. Kiểm tra tài khoản GitHub
2. Xác nhận đã đăng ký Copilot
3. Clear cache và đăng nhập lại
4. Kiểm tra firewall/proxy

### Extension bị lỗi

**Giải pháp:**
1. Uninstall extension
2. Restart IDE
3. Cài đặt lại extension
4. Kiểm tra phiên bản IDE có tương thích không

## Tips cho người mới bắt đầu

1. **Bắt đầu với code đơn giản**: Thử với các function cơ bản trước
2. **Sử dụng comments**: Viết comments rõ ràng để Copilot hiểu ý định
3. **Đặt tên có ý nghĩa**: Function và variable names giúp Copilot đề xuất tốt hơn
4. **Thử nghiệm**: Không ngại thử các cách viết prompt khác nhau
5. **Review code**: Luôn đọc và hiểu code trước khi chấp nhận
6. **Sử dụng Chat**: Khi không chắc chắn, hỏi Copilot Chat
7. **Học từ suggestions**: Quan sát cách Copilot code để học patterns mới

## Bước tiếp theo

Sau khi cài đặt thành công, bạn nên:
1. Đọc phần "Cách viết Prompts hiệu quả"
2. Tìm hiểu các tính năng nâng cao
3. Thực hành với các dự án thực tế
4. Tham gia cộng đồng để học hỏi kinh nghiệm

Bài viết được viết bằng AI 🚀

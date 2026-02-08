---
layout: post
title: "[AI] Giới Thiệu Kiro IDE"
summary: "Tìm hiểu về Kiro - Agentic IDE do Amazon phát triển, đại diện cho sự chuyển đổi từ phát triển mệnh lệnh sang phát triển theo ý định với AI"
author: leo
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro ide, agentic ide, ai coding assistant, spec-driven development, intent-driven development
permalink: /huong-dan-su-dung-kiro/gioi-thieu-kiro-ide
usemathjax: false
---

# Chương 1: Giới Thiệu Về Kiro

## Tóm Tắt

Kiro là một Agentic IDE (Integrated Development Environment) do Amazon phát triển, đại diện cho sự chuyển đổi từ "Imperative Development" (phát triển mệnh lệnh) sang "Intent-Driven Development" (phát triển theo ý định). Thay vì phải chỉ dẫn chi tiết từng bước, lập trình viên chỉ cần mô tả mục tiêu và Kiro sẽ tự động lập kế hoạch và thực thi.

## Kiro Là Gì?

Kiro là một IDE tích hợp AI agent, giúp lập trình viên:
- Chuyển đổi ý tưởng thành yêu cầu rõ ràng
- Tạo thiết kế có cấu trúc
- Tự động hóa các tác vụ lập trình
- Duy trì chất lượng code thông qua quy chuẩn

### Điểm Khác Biệt So Với Các Công Cụ Khác

| Tính Năng | Kiro | Cursor/Copilot | Amazon Q Developer |
|-----------|------|----------------|-------------------|
| Phát triển theo đặc tả | ✅ | ❌ | Một phần |
| Tự động hóa với Hooks | ✅ | ❌ | ❌ |
| Steering (Hướng dẫn AI) | ✅ | ❌ | Project Rules |
| Autopilot Mode | ✅ | Một phần | ❌ |
| MCP Integration | ✅ | ❌ | ❌ |

## Kiến Trúc 4 Tầng Của Kiro

### 1. Intent Layer (Tầng Ý Định)
Nơi Kiro hiểu và xử lý ý định của lập trình viên thông qua:
- **Specs**: Ý định có cấu trúc (Requirements → Design → Tasks)
- **Vibe/Chat**: Ý định tự do, không cấu trúc
- **Terminal**: Tương tác qua dòng lệnh

### 2. Knowledge Layer (Tầng Kiến Thức)
Cung cấp ngữ cảnh để AI đưa ra quyết định:
- **Codebase Indexing**: Hiểu cấu trúc dự án, function calls, class structures
- **Steering Files**: Nguyên tắc hướng dẫn, quy chuẩn, best practices của team

### 3. Execution Layer (Tầng Thực Thi)
Chuyển đổi ý định thành hành động:
- **Autopilot**: Tự động thực hiện danh sách tasks
- **Hooks**: Tự động hóa dựa trên sự kiện (save, create, delete files)

### 4. Oversight Layer (Tầng Giám Sát)
Đảm bảo con người luôn kiểm soát:
- **Supervised Mode**: Xem xét và phê duyệt từng thay đổi
- **Autopilot Mode**: Thực thi tự động nhưng có thể can thiệp
- **Review Tools**: Xem diff, rollback changes

## Hai Chế Độ Làm Việc

### Vibe Mode
**Khi nào sử dụng:**
- Prototyping nhanh
- Khám phá ý tưởng
- Thử nghiệm giải pháp
- Dự án nhỏ, cá nhân

**Đặc điểm:**
- Chat-first approach
- Linh hoạt, nhanh chóng
- Ít cấu trúc
- Phù hợp cho giai đoạn đầu

### Spec Mode
**Khi nào sử dụng:**
- Dự án production
- Làm việc nhóm
- Yêu cầu rõ ràng
- Cần documentation

**Đặc điểm:**
- Plan-first approach
- Có cấu trúc, có thể theo dõi
- Requirements → Design → Implementation
- Phù hợp cho phát triển chuyên nghiệp

## Lợi Ích Của Kiro

### Cho Lập Trình Viên
- ⚡ Tăng năng suất 70-85%
- 📝 Tự động tạo documentation
- 🎯 Tập trung vào logic nghiệp vụ
- 🔄 Giảm thiểu technical debt

### Cho Automation Tester
- 🧪 Tự động tạo test cases
- 🔧 Xây dựng test framework nhanh chóng
- 📊 Tích hợp CI/CD dễ dàng
- 🎨 Tạo test data và fixtures

### Cho Team
- 📚 Chia sẻ kiến thức qua Steering
- 🤝 Đồng bộ quy chuẩn coding
- 📈 Onboarding nhanh cho thành viên mới
- 🔍 Code review hiệu quả hơn

## Công Nghệ Nền Tảng

- **Base**: Visual Studio Code (Code OSS)
- **AI Model**: Claude Sonnet 4.5 (Anthropic)
- **Protocol**: Model Context Protocol (MCP)
- **Extensions**: Tương thích với Open VSX

## Triết Lý Phát Triển

Kiro thay đổi cách chúng ta tương tác với máy tính:

**Trước đây (Imperative):**
```
Lập trình viên → Viết code chi tiết → Máy tính thực thi
```

**Với Kiro (Intent-Driven):**
```
Lập trình viên → Mô tả mục tiêu → Kiro lập kế hoạch → Thực thi
```

## Khi Nào Nên Dùng Kiro?

### ✅ Phù Hợp
- Dự án mới cần thiết lập từ đầu
- Refactoring code base lớn
- Xây dựng test automation suite
- Cần documentation tự động
- Team muốn chuẩn hóa quy trình

### ⚠️ Cân Nhắc
- Dự án legacy phức tạp (cần thời gian setup Steering)
- Code base không có cấu trúc rõ ràng
- Team chưa quen với AI-assisted development

## Roadmap Học Tập

1. **Tuần 1**: Cài đặt, làm quen giao diện, thử Vibe mode
2. **Tuần 2**: Học Specs, tạo dự án đầu tiên
3. **Tuần 3**: Thiết lập Steering cho team
4. **Tuần 4**: Tạo Hooks tự động hóa
5. **Tuần 5+**: Tích hợp MCP, Powers, nâng cao

## Tài Nguyên Chính Thức

- Website: https://kiro.dev
- Documentation: https://kiro.dev/docs
- GitHub Powers: https://github.com/kirodotdev/powers
- Community: Discord server (link trên website)

## Kết Luận

Kiro không chỉ là một công cụ hỗ trợ code, mà là một hệ điều hành mới cho quy trình phát triển phần mềm. Nó giúp lập trình viên tập trung vào "cái gì" và "tại sao", thay vì "làm thế nào", từ đó tăng năng suất và chất lượng sản phẩm.

---

**Chương tiếp theo**: [Cài Đặt và Thiết Lập](./02-cai-dat.md)

---

*Bài viết được viết bằng AI 🚀*

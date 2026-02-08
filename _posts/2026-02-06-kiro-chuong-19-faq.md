---
layout: post
title: "[AI] Câu Hỏi Thường Gặp (FAQ)"
summary: "Tổng hợp các câu hỏi thường gặp về Kiro IDE, từ cài đặt, sử dụng đến troubleshooting và best practices"
author: chungnd
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro faq, kiro questions, kiro help, kiro troubleshooting, kiro support
permalink: /huong-dan-su-dung-kiro/faq
usemathjax: false
---

# Chương 19: Câu Hỏi Thường Gặp (FAQ)

## Tổng Quan

### Kiro là gì?
Kiro là Agentic IDE do Amazon phát triển, giúp lập trình viên phát triển phần mềm theo cách có cấu trúc thông qua specs, steering và automation hooks.

### Kiro khác gì với Cursor, GitHub Copilot?
- **Cursor/Copilot**: Chat-first, code suggestions
- **Kiro**: Spec-driven development, có cấu trúc, steering files, hooks automation

### Kiro có miễn phí không?
Kiro đang trong giai đoạn public preview với free tier. Các gói trả phí sẽ có sau.

### Kiro chạy trên nền tảng nào?
Windows, macOS, Linux (dựa trên VS Code)

## Cài Đặt và Thiết Lập

### Làm sao để cài đặt Kiro?
1. Truy cập https://kiro.dev
2. Download installer cho hệ điều hành
3. Chạy installer và làm theo hướng dẫn

### Kiro có tương thích với VS Code extensions không?
Có, Kiro tương thích với extensions từ Open VSX marketplace.

### Làm sao để import settings từ VS Code?
```bash
cp ~/.vscode/settings.json ~/.kiro/settings.json
```

### MCP servers là gì và cần thiết không?
MCP (Model Context Protocol) servers mở rộng khả năng của Kiro. Không bắt buộc nhưng rất hữu ích (vd: AWS Docs, Terraform, etc.)

## Specs

### Khi nào nên dùng Spec mode?
- Dự án production
- Làm việc nhóm
- Cần documentation
- Requirements phức tạp

### Khi nào nên dùng Vibe mode?
- Prototyping
- Thử nghiệm
- Quick fixes
- Học và khám phá

### Có thể chuyển từ Vibe sang Spec không?
Có, yêu cầu Kiro: "Tạo spec từ code hiện tại"

### EARS format là gì?
Easy Approach to Requirements Syntax - cách viết requirements rõ ràng:
- WHEN [event], the system SHALL [action]
- IF [condition], THEN [result]

### Làm sao để update spec khi requirements thay đổi?
1. Update requirements.md
2. Click "Refine" ở tab Design
3. Click "Refine" ở tab Tasks
4. Kiro sẽ update design và tasks

## Steering

### Steering files là gì?
Markdown files chứa quy chuẩn, best practices, tech stack của team để hướng dẫn AI.

### Kiro có tự động tạo steering files không?
Có, click biểu tượng Ghost (👻) → "Generate Steering Docs"

### Nên có bao nhiêu steering files?
Tùy dự án, thường:
- architecture.md
- product.md
- tech.md
- testing.md
- security.md

### Steering files có được share giữa các dự án không?
Có, có thể dùng Git submodule hoặc copy files.

### Làm sao để Kiro tuân thủ steering files?
Viết steering files cụ thể với ví dụ code và format "✅ Good / ❌ Bad"

## Hooks

### Hooks là gì?
Automation triggers: WHEN [event] → THEN [action]

### Có những loại events nào?
- fileEdited
- fileCreated
- fileDeleted
- userTriggered
- promptSubmit
- agentStop

### Làm sao để tạo hook?
1. Explorer → Agent Hooks → Click +
2. Hoặc: Command Palette → "Open Kiro Hook UI"
3. Hoặc: Tạo file JSON trong .kiro/hooks/

### Hook có thể chạy shell commands không?
Có, với action type "runCommand" (chỉ với promptSubmit và agentStop events)

### Làm sao để disable một hook?
```json
{
  "kiro.hooks.disabled": ["hook-name"]
}
```

## Automation Testing

### Kiro có hỗ trợ automation testing không?
Có, Kiro có thể:
- Generate test cases từ requirements
- Tạo test framework
- Generate Page Objects
- Tạo test data factories

### Framework nào được hỗ trợ?
- Playwright (E2E)
- Jest (Unit)
- Supertest (API)
- Cypress (E2E)

### Làm sao để tạo test framework?
Tạo spec với requirements về testing, Kiro sẽ generate framework.

### Kiro có thể update tests khi code thay đổi không?
Có, dùng hooks:
```json
{
  "when": { "type": "fileEdited", "patterns": ["src/**/*.ts"] },
  "then": { "type": "askAgent", "prompt": "Update related tests" }
}
```

## Troubleshooting

### Kiro không khởi động được
```bash
rm -rf ~/.kiro/cache
kiro --reset
```

### MCP server không kết nối
```bash
# Kiểm tra uvx
uvx --version

# Cài đặt lại
pip install --upgrade uv
```

### Kiro không tuân thủ steering files
- Kiểm tra steering files có trong .kiro/steering/
- Thêm ví dụ cụ thể vào steering files
- Kiểm tra không có mâu thuẫn giữa các files

### Hooks không chạy
- Kiểm tra: `"kiro.hooks.enabled": true`
- Kiểm tra file patterns có match không
- Xem logs: View → Output → "Kiro Hooks"

### Kiro generate code không đúng
- Bổ sung requirements chi tiết hơn
- Update steering files
- Provide examples trong prompt

### Tests fail sau khi Kiro generate
- Review test logic
- Check test data
- Verify assertions
- Run tests manually để debug

## Performance

### Kiro chạy chậm
- Giảm số lượng files được index
- Exclude node_modules, dist trong settings
- Tăng RAM nếu có thể

### Indexing mất nhiều thời gian
```json
{
  "kiro.indexing.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/.git/**"
  ]
}
```

### Autopilot chạy chậm
- Chia tasks nhỏ hơn
- Chạy từng task thay vì autopilot all

## Best Practices

### Nên bắt đầu từ đâu?
1. Tuần 1: Học Vibe mode, làm quen giao diện
2. Tuần 2: Tạo dự án đầu tiên với Specs
3. Tuần 3: Setup Steering files
4. Tuần 4: Tạo Hooks automation

### Làm sao để team adopt Kiro?
1. Setup shared steering files
2. Tạo templates cho specs
3. Document workflows
4. Training sessions
5. Start với dự án nhỏ

### Có nên dùng Kiro cho tất cả dự án?
Không nhất thiết:
- ✅ Dự án mới: Rất phù hợp
- ✅ Refactoring: Tốt
- ⚠️ Legacy code: Cần thời gian setup steering
- ❌ Dự án quá nhỏ: Có thể overkill

### Làm sao để maintain specs?
- Commit specs cùng với code
- Review specs trong code review
- Update specs khi requirements thay đổi
- Version control specs

## Tích Hợp

### Kiro có tích hợp với Git không?
Có, Kiro có built-in Git support như VS Code.

### Có thể dùng Kiro với GitHub Actions không?
Có, Kiro CLI có thể chạy trong CI/CD.

### Kiro có API không?
Chưa có public API, nhưng có CLI commands.

### Có thể remote development với Kiro không?
Có, tương tự VS Code Remote Development.

## Bảo Mật

### Code có được gửi lên cloud không?
Có, khi sử dụng AI features. Đọc Privacy Policy để biết chi tiết.

### Có thể dùng Kiro offline không?
Không, Kiro cần internet để sử dụng AI features.

### Làm sao để bảo vệ sensitive data?
- Không commit .env files
- Dùng .gitignore
- Không paste sensitive data vào chat
- Review code trước khi commit

### Kiro có tuân thủ GDPR không?
Xem Privacy Policy tại kiro.dev

## Pricing

### Kiro có miễn phí không?
Preview period có free tier với giới hạn.

### Pricing model như thế nào?
- Vibe Requests: Chat-based operations
- Spec Tasks: Spec task executions
- Xem chi tiết tại kiro.dev/pricing

### Có student discount không?
Kiểm tra tại kiro.dev hoặc liên hệ support.

## Support

### Làm sao để báo bug?
- GitHub: Report issue
- Website: kiro.dev → "Report a bug"
- Discord: Community support

### Có documentation chính thức không?
Có tại https://kiro.dev/docs

### Có community không?
- Discord server
- GitHub Discussions
- Twitter/X

### Làm sao để request feature?
- Website: "Suggest an idea"
- GitHub: Feature request
- Discord: #feature-requests

## Tài Nguyên

### Học Kiro ở đâu?
- Official docs: kiro.dev/docs
- Tutorial: kiro.dev/guides
- Blog: kiro.dev/blog
- Community: Discord

### Có video tutorials không?
Kiểm tra YouTube và kiro.dev/resources

### Có example projects không?
- GitHub: kirodotdev/examples
- Community projects trên Discord

## Kết Luận

Nếu câu hỏi của bạn chưa được trả lời:
1. Xem documentation: kiro.dev/docs
2. Search trong Discord
3. Hỏi trong community
4. Contact support

---

**Chương tiếp theo**: [Troubleshooting](./20-troubleshooting.md)

---

*Bài viết được viết bằng AI 🚀*

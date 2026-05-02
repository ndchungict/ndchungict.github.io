---
layout: post
title: "[AI] Tính Năng Nâng Cao của GitHub Copilot"
summary: "Khám phá các tính năng nâng cao của GitHub Copilot: Copilot Chat, Agent Mode, Copilot Edits, Code Review, và các công cụ mạnh mẽ khác"
author: chungnd
date: '2026-02-06 11:30:00 +0700'
category: ['ai','github-copilot']
series: "tong-quan-github-copilot"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: copilot chat, agent mode, copilot edits, code review, slash commands
permalink: /tinh-nang-nang-cao-github-copilot/
usemathjax: false
---

# Tính Năng Nâng Cao của GitHub Copilot

## 1. Copilot Chat - Trò chuyện thông minh

### Các loại Chat

#### Chat Panel (Chat cơ bản)
- Mở bằng `Ctrl+Shift+I` (Windows/Linux) hoặc `Cmd+Shift+I` (macOS)
- Hỏi đáp về code, giải thích, debug
- Lưu lịch sử conversation

#### Inline Chat
- Mở bằng `Ctrl+I` (Windows/Linux) hoặc `Cmd+I` (macOS)
- Chỉnh sửa code trực tiếp tại vị trí con trỏ
- Nhanh chóng và tiện lợi

#### Quick Chat
- Mở bằng `Ctrl+Shift+Alt+I` (Windows/Linux)
- Chat nhanh không lưu lịch sử
- Phù hợp cho câu hỏi đơn giản

### Slash Commands - Lệnh đặc biệt

Slash commands giúp bạn thực hiện các tác vụ phổ biến nhanh chóng:

#### `/explain` - Giải thích code
```
/explain this function
```
**Khi nào dùng:**
- Hiểu code của người khác
- Review code phức tạp
- Học patterns mới

#### `/fix` - Sửa lỗi
```
/fix this error
```
**Khi nào dùng:**
- Có lỗi compile/runtime
- Code không hoạt động như mong đợi
- Cần gợi ý debug

#### `/tests` - Tạo test cases
```
/tests for this function
```
**Khi nào dùng:**
- Cần viết unit tests
- Tạo test coverage
- Kiểm tra edge cases

#### `/doc` - Tạo documentation
```
/doc this class
```
**Khi nào dùng:**
- Cần JSDoc, docstrings
- Tạo API documentation
- Comment cho team

#### `/optimize` - Tối ưu code
```
/optimize this algorithm
```
**Khi nào dùng:**
- Code chạy chậm
- Cần cải thiện performance
- Refactor code

#### `/new` - Tạo project mới
```
/new Express API with TypeScript
```
**Khi nào dùng:**
- Bắt đầu project mới
- Scaffold boilerplate
- Setup nhanh

### Chat Participants - Agents chuyên biệt

Sử dụng `@` để gọi các agents chuyên môn:

#### `@workspace` - Hiểu toàn bộ codebase
```
@workspace How is authentication implemented?
```
```
@workspace Where is the user model defined?
```
```
@workspace Show me all API endpoints
```

**Khả năng:**
- Tìm kiếm trong toàn bộ workspace
- Hiểu kiến trúc dự án
- Đề xuất dựa trên codebase hiện tại

#### `@vscode` - Hỗ trợ VS Code
```
@vscode How do I change the theme?
```
```
@vscode Create a new keyboard shortcut
```

**Khả năng:**
- Hướng dẫn sử dụng VS Code
- Cấu hình settings
- Extensions và customization

#### `@terminal` - Hỗ trợ command line
```
@terminal How do I find all .js files?
```
```
@terminal Explain this git command
```

**Khả năng:**
- Giải thích shell commands
- Đề xuất CLI commands
- Debug terminal errors

## 2. Copilot Edits - Chỉnh sửa đa file

### Khả năng
- Chỉnh sửa nhiều file cùng lúc
- Refactor toàn dự án
- Áp dụng thay đổi nhất quán

### Cách sử dụng

**Bước 1: Mở Copilot Edits**
- Command Palette → "Copilot: Open Edits"
- Hoặc click icon Copilot Edits

**Bước 2: Mô tả thay đổi**
```
Rename all instances of "userId" to "customerId" across the project
```
```
Add error handling to all API calls
```
```
Convert all var declarations to const/let
```

**Bước 3: Review và Apply**
- Xem preview các thay đổi
- Chọn files muốn apply
- Confirm changes

### Ví dụ thực tế

**Refactoring:**
```
Refactor authentication logic:
- Move auth functions to separate module
- Add TypeScript types
- Implement error handling
- Update all imports
```

**Feature implementation:**
```
Add logging to all database operations:
- Import logger
- Add log before query
- Add log after success
- Add error log on failure
```

## 3. Agent Mode - Chế độ tự động

### Giới thiệu
Agent Mode cho phép Copilot làm việc độc lập:
- Tự động implement features
- Phát hiện và sửa lỗi
- Chạy tests và iterate
- Đề xuất terminal commands

### Kích hoạt Agent Mode

**Trong VS Code:**
1. Mở Copilot Chat
2. Toggle "Agent Mode" button
3. Mô tả task cần làm

### Ví dụ sử dụng

**Task 1: Implement feature hoàn chỉnh**
```
Create a user registration API endpoint with:
- Input validation
- Password hashing
- Database storage
- Email verification
- Error handling
- Unit tests
```

Agent sẽ:
1. Tạo các files cần thiết
2. Implement logic
3. Viết tests
4. Chạy tests
5. Fix lỗi nếu có
6. Báo cáo kết quả

**Task 2: Debug và fix**
```
The login function is not working. Debug and fix it.
```

Agent sẽ:
1. Phân tích code
2. Tìm lỗi
3. Đề xuất fix
4. Apply changes
5. Test lại

## 4. Code Review - Đánh giá code tự động

### Tính năng
- Review pull requests tự động
- Phát hiện bugs và security issues
- Đề xuất improvements
- Check coding standards

### Cách sử dụng

**Trên GitHub.com:**
1. Tạo Pull Request
2. Copilot tự động review
3. Xem comments và suggestions
4. Apply hoặc discuss

**Trong IDE:**
```
@workspace review this file
```
```
Check this code for security issues
```
```
Suggest improvements for this function
```

### Các vấn đề Copilot có thể phát hiện

**Security:**
- SQL injection vulnerabilities
- XSS risks
- Hardcoded credentials
- Insecure dependencies

**Performance:**
- Inefficient algorithms
- Memory leaks
- N+1 queries
- Unnecessary loops

**Best Practices:**
- Code smells
- Violation of SOLID principles
- Missing error handling
- Poor naming conventions

## 5. Context Variables - Biến ngữ cảnh

### Sử dụng # để reference

#### `#file` - Reference file cụ thể
```
#file:userModel.ts Explain the User interface
```

#### `#selection` - Code đang chọn
```
#selection Refactor this to use async/await
```

#### `#editor` - File đang mở
```
#editor Add error handling
```

#### `#codebase` - Toàn bộ codebase
```
#codebase Find all database queries
```

#### `#terminalLastCommand` - Lệnh terminal cuối
```
#terminalLastCommand Why did this fail?
```

### Ví dụ kết hợp

```
Compare #file:oldAuth.js with #file:newAuth.js and explain the differences
```

```
Based on #codebase, suggest how to implement user permissions
```

## 6. Copilot CLI - Command Line Interface

### Cài đặt
```bash
npm install -g @githubnext/github-copilot-cli
```

### Sử dụng

#### `??` - Giải thích command
```bash
?? "find all javascript files modified in last 7 days"
```

#### `git?` - Git commands
```bash
git? "undo last commit but keep changes"
```

#### `gh?` - GitHub CLI
```bash
gh? "list my open pull requests"
```

### Ví dụ thực tế

```bash
?? "compress all images in current directory"
# Copilot suggests: find . -name "*.jpg" -exec mogrify -quality 85 {} \;

git? "show changes in last 3 commits"
# Copilot suggests: git log -3 -p

gh? "create issue from template"
# Copilot suggests: gh issue create --template bug_report.md
```

## 7. Copilot for Pull Requests

### Tính năng

#### Auto-generate PR description
- Tóm tắt changes
- List affected files
- Highlight important changes

#### Suggest reviewers
- Dựa trên code ownership
- Expertise của team members

#### Generate test plan
- Đề xuất test cases
- Checklist cho QA

### Sử dụng

**Trên GitHub.com:**
1. Tạo PR
2. Click "Copilot: Generate description"
3. Review và edit
4. Submit

## 8. Custom Instructions - Hướng dẫn tuỳ chỉnh

### Tạo instructions cho project

**File: `.github/copilot-instructions.md`**
```markdown
# Project Coding Guidelines

## Style
- Use TypeScript strict mode
- Prefer functional components in React
- Use async/await over promises

## Naming
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE

## Testing
- Write tests for all public functions
- Use Jest and React Testing Library
- Aim for 80% coverage

## Error Handling
- Always use try-catch for async operations
- Log errors with context
- Return meaningful error messages
```

Copilot sẽ tự động tuân theo guidelines này khi generate code.

## 9. Workspace Context - Ngữ cảnh dự án

### Copilot học từ:

**Code patterns:**
- Coding style trong project
- Architecture patterns
- Naming conventions

**Dependencies:**
- Packages đang sử dụng
- Framework versions
- APIs và libraries

**Configuration:**
- TypeScript config
- ESLint rules
- Build settings

### Tối ưu context

**Mở files liên quan:**
```
src/
  models/User.ts          ← Mở
  services/userService.ts ← Đang code
  types/index.ts          ← Mở
```

**Viết code mẫu:**
```typescript
// Example pattern Copilot should follow
export class UserService {
    constructor(private db: Database) {}
    
    async getUser(id: string): Promise<User> {
        // Pattern: async, error handling, types
    }
}

// New service - Copilot sẽ follow pattern
export class ProductService {
    // Copilot suggests similar structure
}
```

## 10. Keyboard Shortcuts nâng cao

### VS Code

| Tính năng | Windows/Linux | macOS |
|-----------|---------------|-------|
| Accept suggestion | `Tab` | `Tab` |
| Accept word | `Ctrl+→` | `Cmd+→` |
| Next suggestion | `Alt+]` | `Option+]` |
| Previous suggestion | `Alt+[` | `Option+[` |
| Trigger suggestion | `Alt+\` | `Option+\` |
| Open Chat | `Ctrl+Shift+I` | `Cmd+Shift+I` |
| Inline Chat | `Ctrl+I` | `Cmd+I` |
| Quick Chat | `Ctrl+Shift+Alt+I` | `Cmd+Shift+Option+I` |

### Tuỳ chỉnh shortcuts

1. `Ctrl+K Ctrl+S` → Keyboard Shortcuts
2. Tìm "Copilot"
3. Click vào shortcut muốn thay đổi
4. Nhập combination mới

## Tips sử dụng tính năng nâng cao

### 1. Kết hợp nhiều tính năng
```
@workspace #file:config.ts 
How should I implement caching based on current architecture?
```

### 2. Sử dụng Agent Mode cho tasks lớn
- Feature implementation
- Refactoring toàn dự án
- Migration code

### 3. Tận dụng Copilot Edits
- Rename variables/functions
- Update imports
- Apply patterns consistently

### 4. Custom instructions cho team
- Tạo shared guidelines
- Enforce coding standards
- Document best practices

### 5. Review với Copilot
```
@workspace review this PR for:
- Security issues
- Performance problems
- Code quality
- Test coverage
```

## Kết luận

Các tính năng nâng cao của GitHub Copilot giúp bạn:
- Làm việc hiệu quả hơn với Agent Mode
- Refactor an toàn với Copilot Edits
- Maintain code quality với Code Review
- Tận dụng context của toàn bộ workspace

Bài viết được viết bằng AI 🚀

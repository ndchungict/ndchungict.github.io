---
layout: post
title: "[AI] Hooks - Tự Động Hóa"
summary: "Hướng dẫn sử dụng Hooks - hệ thống tự động hóa của Kiro cho phép trigger các hành động khi có sự kiện xảy ra"
author: chungnd
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro hooks, automation, event triggers, workflow automation, kiro events
permalink: /huong-dan-su-dung-kiro/hooks-tu-dong-hoa
usemathjax: false
---

# Chương 7: Hooks - Tự Động Hóa

## Tóm Tắt

Hooks là hệ thống tự động hóa của Kiro, cho phép trigger các hành động khi có sự kiện xảy ra (file saved, created, deleted, etc.). Đây là công cụ mạnh mẽ giúp tự động hóa các tác vụ lặp đi lặp lại trong quy trình phát triển.

## Hooks Là Gì?

Hooks = Event + Action

```
WHEN [event happens] → THEN [do action]
```

**Ví dụ:**
- WHEN file .ts được save → THEN run linter
- WHEN test file được tạo → THEN generate test cases
- WHEN spec được update → THEN update documentation

## Cấu Trúc Hook

### Hook File Format

```json
{
  "name": "Hook Name",
  "version": "1.0.0",
  "description": "What this hook does",
  "when": {
    "type": "eventType",
    "patterns": ["file patterns"]
  },
  "then": {
    "type": "actionType",
    "prompt": "or command"
  }
}
```

### Event Types

| Event Type | Khi Nào Trigger | Patterns Required |
|------------|-----------------|-------------------|
| `fileEdited` | File được save | ✅ Yes |
| `fileCreated` | File mới được tạo | ✅ Yes |
| `fileDeleted` | File bị xóa | ✅ Yes |
| `userTriggered` | User click button | ❌ No |
| `promptSubmit` | Gửi message trong chat | ❌ No |
| `agentStop` | Agent hoàn thành task | ❌ No |

### Action Types

| Action Type | Mô Tả | Dùng Với Events |
|-------------|-------|-----------------|
| `askAgent` | Gửi prompt cho Kiro | Tất cả events |
| `runCommand` | Chạy shell command | `promptSubmit`, `agentStop` only |

## Tạo Hooks

### Cách 1: Từ UI

1. Mở **Explorer** → **Agent Hooks**
2. Click **+** để tạo hook mới
3. Điền thông tin:
   - Name
   - Event type
   - File patterns (nếu cần)
   - Action
4. Save

### Cách 2: Command Palette

```
Ctrl+Shift+P → Open Kiro Hook UI
```

### Cách 3: Tạo File Thủ Công

```bash
# Tạo file trong .kiro/hooks/
touch .kiro/hooks/lint-on-save.json
```

## Ví Dụ Hooks Thực Tế

### 1. Lint On Save

**Use case**: Tự động chạy linter khi save file TypeScript

```json
{
  "name": "Lint TypeScript On Save",
  "version": "1.0.0",
  "description": "Run ESLint and fix issues when TypeScript files are saved",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts", "src/**/*.tsx"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run `npm run lint:fix` on the edited file and report any remaining issues"
  }
}
```

### 2. Generate Tests For New Files

**Use case**: Tự động tạo test file khi tạo file mới

```json
{
  "name": "Generate Test File",
  "version": "1.0.0",
  "description": "Create test file when new source file is created",
  "when": {
    "type": "fileCreated",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Create a corresponding test file in tests/ directory with basic test structure and test cases for the new file"
  }
}
```

### 3. Update Tests On Code Change

**Use case**: Cập nhật tests khi code thay đổi

```json
{
  "name": "Update Tests On Change",
  "version": "1.0.0",
  "description": "Update related tests when source code changes",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Find and update related test files to reflect the changes made to the source file. Add new test cases if new functionality was added."
  }
}
```

### 4. Format On Save

**Use case**: Tự động format code

```json
{
  "name": "Format Code On Save",
  "version": "1.0.0",
  "description": "Run Prettier on save",
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run Prettier to format the edited file"
  }
}
```

### 5. Update Documentation

**Use case**: Cập nhật docs khi API thay đổi

```json
{
  "name": "Update API Documentation",
  "version": "1.0.0",
  "description": "Update OpenAPI spec when API routes change",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/api/routes/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Update the OpenAPI specification in docs/openapi.yaml to reflect the changes in the API route"
  }
}
```

### 6. Security Scan

**Use case**: Scan security issues khi có thay đổi

```json
{
  "name": "Security Scan On Change",
  "version": "1.0.0",
  "description": "Run security scan when dependencies or sensitive files change",
  "when": {
    "type": "fileEdited",
    "patterns": ["package.json", "src/config/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run `npm audit` and check for security vulnerabilities. Report any issues found."
  }
}
```

### 7. Commit Message Helper

**Use case**: Gợi ý commit message sau khi agent hoàn thành

```json
{
  "name": "Suggest Commit Message",
  "version": "1.0.0",
  "description": "Suggest commit message after agent completes task",
  "when": {
    "type": "agentStop"
  },
  "then": {
    "type": "askAgent",
    "prompt": "Analyze the changes made and suggest a conventional commit message (feat/fix/docs/etc.)"
  }
}
```

### 8. Run Tests After Prompt

**Use case**: Tự động chạy tests sau khi submit prompt

```json
{
  "name": "Run Tests After Changes",
  "version": "1.0.0",
  "description": "Run relevant tests after making changes",
  "when": {
    "type": "promptSubmit"
  },
  "then": {
    "type": "runCommand",
    "command": "npm test -- --changed"
  }
}
```

## Hooks Cho Automation Testing

### 1. Run Tests On Save

```json
{
  "name": "Run Tests On Save",
  "version": "1.0.0",
  "description": "Run related tests when test or source files are saved",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts", "tests/**/*.spec.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run tests related to the edited file using `npm test -- <file-pattern>` and report results"
  }
}
```

### 2. Update Test Data

```json
{
  "name": "Update Test Fixtures",
  "version": "1.0.0",
  "description": "Update test fixtures when data models change",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/models/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Update test fixtures in tests/fixtures/ to match the changed data model"
  }
}
```

### 3. Generate Page Object

```json
{
  "name": "Generate Page Object",
  "version": "1.0.0",
  "description": "Create Page Object when new UI component is created",
  "when": {
    "type": "fileCreated",
    "patterns": ["src/components/**/*.tsx"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Create a Page Object class in tests/pages/ for the new component with methods for common interactions"
  }
}
```

### 4. Update E2E Tests

```json
{
  "name": "Update E2E Tests",
  "version": "1.0.0",
  "description": "Update E2E tests when UI changes",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/pages/**/*.tsx", "src/components/**/*.tsx"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Check if E2E tests need updates due to UI changes. Update selectors and test logic if needed."
  }
}
```

### 5. Screenshot On Test Failure

```json
{
  "name": "Analyze Test Failures",
  "version": "1.0.0",
  "description": "Analyze and suggest fixes for test failures",
  "when": {
    "type": "userTriggered"
  },
  "then": {
    "type": "askAgent",
    "prompt": "Analyze the test failure logs and screenshots, then suggest potential fixes"
  }
}
```

## File Patterns

### Glob Patterns

```json
{
  "patterns": [
    "**/*.ts",              // Tất cả .ts files
    "src/**/*.tsx",         // .tsx trong src/
    "tests/**/*.spec.ts",   // Test files
    "*.json",               // JSON files ở root
    "!node_modules/**",     // Exclude node_modules
    "src/{api,services}/**" // Multiple directories
  ]
}
```

### Pattern Examples

```json
// TypeScript files only
"patterns": ["**/*.ts", "**/*.tsx"]

// Test files only
"patterns": ["**/*.spec.ts", "**/*.test.ts"]

// Config files
"patterns": ["*.config.js", "*.config.ts"]

// Specific directories
"patterns": ["src/api/**/*.ts", "src/services/**/*.ts"]

// Exclude patterns
"patterns": ["src/**/*.ts", "!src/**/*.spec.ts"]
```

## Best Practices

### 1. Specific Patterns

```json
❌ Bad: Too broad
{
  "patterns": ["**/*"]  // Triggers on every file
}

✅ Good: Specific
{
  "patterns": ["src/**/*.ts", "!src/**/*.spec.ts"]
}
```

### 2. Clear Prompts

```json
❌ Bad: Vague
{
  "prompt": "Fix the code"
}

✅ Good: Specific
{
  "prompt": "Run ESLint on the edited file, fix auto-fixable issues, and report remaining errors with line numbers"
}
```

### 3. Avoid Infinite Loops

```json
❌ Bad: Can cause loop
{
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Modify this file"  // Will trigger hook again!
  }
}

✅ Good: Safe
{
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run linter and report issues (don't modify files)"
  }
}
```

### 4. Performance Considerations

```json
// ❌ Bad: Runs on every file save
{
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run full test suite"  // Too slow!
  }
}

// ✅ Good: Only relevant files
{
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run tests related to this file only"
  }
}
```

### 5. User-Triggered For Heavy Tasks

```json
{
  "name": "Full Test Suite",
  "version": "1.0.0",
  "description": "Run complete test suite (manual trigger)",
  "when": {
    "type": "userTriggered"
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run full test suite with coverage report"
  }
}
```

## Quản Lý Hooks

### Enable/Disable Hooks

```json
// Trong settings
{
  "kiro.hooks.enabled": true,
  "kiro.hooks.disabled": [
    "lint-on-save",  // Disable specific hooks
    "format-on-save"
  ]
}
```

### Hook Priority

Nếu nhiều hooks match cùng event:
1. Hooks chạy theo thứ tự alphabetical
2. Có thể set priority (nếu cần):

```json
{
  "name": "High Priority Hook",
  "priority": 1,  // Lower number = higher priority
  "when": {...},
  "then": {...}
}
```

### Debug Hooks

```json
// Enable hook logging
{
  "kiro.hooks.debug": true
}
```

Xem logs:
```
View → Output → Select "Kiro Hooks"
```

## Hooks Cho Team

### Shared Hooks Repository

```bash
# Tạo hooks repository
git init team-kiro-hooks
cd team-kiro-hooks
mkdir hooks
# Tạo hooks
git add .
git commit -m "Add team hooks"
git push
```

### Sử Dụng Trong Dự Án

```bash
# Option 1: Git submodule
git submodule add https://github.com/team/kiro-hooks .kiro/hooks

# Option 2: Copy hooks
cp -r ~/team-hooks/hooks/* .kiro/hooks/
```

### Hook Templates

```json
// .kiro/hooks/templates/test-on-save.json
{
  "name": "Run Tests On Save",
  "version": "1.0.0",
  "when": {
    "type": "fileEdited",
    "patterns": ["{{TEST_PATTERNS}}"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "{{TEST_COMMAND}}"
  }
}
```

## Advanced Patterns

### Conditional Hooks

```json
{
  "name": "Conditional Hook",
  "version": "1.0.0",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "IF file is in src/api/, run API tests. IF file is in src/services/, run unit tests."
  }
}
```

### Chained Actions

```json
{
  "name": "Lint Then Test",
  "version": "1.0.0",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "First run linter and fix issues. Then run related tests. Report results of both."
  }
}
```

### Context-Aware Hooks

```json
{
  "name": "Smart Test Runner",
  "version": "1.0.0",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Analyze the changed file. If it's a controller, run API tests. If it's a service, run unit tests. If it's a utility, run both."
  }
}
```

## Troubleshooting

### Hook Không Chạy

**Kiểm tra:**
1. Hooks có enabled không?
   ```json
   { "kiro.hooks.enabled": true }
   ```

2. Pattern có match không?
   ```
   Test bằng cách save file và xem logs
   ```

3. File có trong .gitignore không?
   ```
   Hooks không chạy với ignored files
   ```

### Hook Chạy Quá Chậm

**Giải pháp:**
1. Giới hạn file patterns
2. Dùng `userTriggered` cho heavy tasks
3. Optimize prompt (đừng yêu cầu quá nhiều)

### Hook Gây Infinite Loop

**Nguyên nhân**: Hook modify file → trigger lại hook

**Giải pháp:**
```json
{
  "prompt": "Analyze and REPORT issues only. Do NOT modify files."
}
```

### Nhiều Hooks Conflict

**Giải pháp:**
1. Set priority
2. Merge hooks thành một
3. Disable hooks không cần thiết

## Kết Luận

Hooks là công cụ mạnh mẽ để tự động hóa workflow. Sử dụng đúng cách sẽ giúp:
- Tự động lint, format, test
- Maintain code quality
- Giảm thiểu manual tasks
- Đảm bảo consistency

**Tips:**
- Bắt đầu với hooks đơn giản
- Test kỹ trước khi deploy cho team
- Document hooks cho team members
- Review và update hooks định kỳ

---

**Chương tiếp theo**: [Powers - Mở Rộng Khả Năng](./08-powers.md)

---

*Bài viết được viết bằng AI 🚀*

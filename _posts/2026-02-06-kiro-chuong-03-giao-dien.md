---
layout: post
title: "[AI] Giao Diện và Tính Năng Cơ Bản Kiro"
summary: "Giới thiệu giao diện người dùng của Kiro IDE, các panel chính, shortcuts hữu ích và cách sử dụng các tính năng cơ bản"
author: leo
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro interface, kiro ui, kiro features, kiro shortcuts, kiro panels
permalink: /huong-dan-su-dung-kiro/giao-dien-tinh-nang-co-ban
usemathjax: false
---

# Chương 3: Giao Diện và Tính Năng Cơ Bản

## Tóm Tắt

Chương này giới thiệu giao diện người dùng của Kiro IDE, các panel chính, shortcuts hữu ích và cách sử dụng các tính năng cơ bản để bắt đầu làm việc hiệu quả.

## Giao Diện Tổng Quan

Kiro IDE kế thừa giao diện từ VS Code với các bổ sung riêng:

```
┌─────────────────────────────────────────────────────┐
│  Menu Bar                                           │
├──────┬──────────────────────────────────────────────┤
│      │  Editor Area                                 │
│ Side │  ┌────────────────────────────────────────┐ │
│ Bar  │  │                                        │ │
│      │  │  Code Editor                           │ │
│ 👻   │  │                                        │ │
│ 📁   │  └────────────────────────────────────────┘ │
│ 🔍   │                                             │
│ 📋   │  ┌────────────────────────────────────────┐ │
│ ⚙️   │  │  Kiro Chat Panel                       │ │
│      │  └────────────────────────────────────────┘ │
├──────┴──────────────────────────────────────────────┤
│  Terminal / Output / Problems                       │
└─────────────────────────────────────────────────────┘
```

## Sidebar Icons

### 1. 👻 Kiro Panel (Ghost Icon)
- **Specs**: Quản lý specifications
- **Steering**: Xem và edit steering files
- **Hooks**: Quản lý automation hooks
- **Powers**: Cài đặt và quản lý powers

### 2. 📁 Explorer
- File tree
- Outline view
- Timeline

### 3. 🔍 Search
- Find in files
- Replace in files
- Search với regex

### 4. 📋 Source Control
- Git integration
- Commit, push, pull
- View diffs

### 5. ⚙️ Extensions
- Cài đặt extensions
- Quản lý extensions

## Kiro Chat Panel

### Mở Chat Panel
- Click biểu tượng chat trên sidebar
- Hoặc: `Ctrl+Shift+K` (Windows/Linux), `Cmd+Shift+K` (macOS)

### Sử Dụng Chat

**Basic Chat:**
```
Giải thích function này làm gì?
```

**Context References:**
```
#File src/user.ts
Refactor code này theo clean architecture

#Folder src/api
Tạo OpenAPI spec cho các endpoints này

#Codebase
Tìm tất cả nơi sử dụng UserService
```

**Vibe Mode:**
```
Tạo REST API cho user management với CRUD operations
```

**Spec Mode:**
```
Tạo spec cho tính năng authentication với JWT
```

## Command Palette

### Mở Command Palette
- `Ctrl+Shift+P` (Windows/Linux)
- `Cmd+Shift+P` (macOS)

### Kiro Commands

```
Kiro: Create New Spec
Kiro: Generate Steering Docs
Kiro: Open Hook UI
Kiro: List MCP Servers
Kiro: Re-index Codebase
Kiro: Toggle Autopilot Mode
```

## Keyboard Shortcuts

### Essential Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Kiro Chat | `Ctrl+Shift+K` | `Cmd+Shift+K` |
| Quick Open | `Ctrl+P` | `Cmd+P` |
| Terminal | `` Ctrl+` `` | `` Cmd+` `` |
| Save | `Ctrl+S` | `Cmd+S` |
| Find | `Ctrl+F` | `Cmd+F` |
| Replace | `Ctrl+H` | `Cmd+H` |

### Kiro-Specific Shortcuts

| Action | Shortcut |
|--------|----------|
| Ask Kiro | `Ctrl+K Ctrl+K` |
| Refine Spec | `Ctrl+K R` |
| Start Tasks | `Ctrl+K T` |
| Toggle Autopilot | `Ctrl+K A` |

## Làm Việc Với Files

### Tạo File Mới
1. Right-click trong Explorer
2. Chọn "New File"
3. Hoặc: `Ctrl+N`

### Mở File
- `Ctrl+P` → Gõ tên file
- Click vào file trong Explorer

### Split Editor
- `Ctrl+\`: Split vertical
- `Ctrl+K Ctrl+\`: Split horizontal

### Navigate Between Files
- `Ctrl+Tab`: Switch giữa open files
- `Alt+Left/Right`: Back/Forward

## Terminal

### Mở Terminal
- `` Ctrl+` ``
- View → Terminal

### Multiple Terminals
- Click `+` để tạo terminal mới
- Switch giữa terminals bằng dropdown

### Run Commands
```bash
npm install
npm test
git status
```

## Problems Panel

### Xem Errors/Warnings
- View → Problems
- Hoặc: `Ctrl+Shift+M`

### Types of Problems
- ❌ Errors: Syntax errors, type errors
- ⚠️ Warnings: Linting issues, deprecations
- ℹ️ Info: Suggestions, hints

## Settings

### Mở Settings
- File → Preferences → Settings
- Hoặc: `Ctrl+,`

### Common Settings

```json
{
  // Editor
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  
  // Kiro
  "kiro.model": "claude-sonnet-4.5",
  "kiro.autopilot.enabled": true,
  "kiro.steering.autoLoad": true,
  
  // Files
  "files.autoSave": "afterDelay",
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true
  }
}
```

## Themes và Appearance

### Thay Đổi Theme
1. `Ctrl+K Ctrl+T`
2. Chọn theme từ list

### Popular Themes
- Dark+ (default dark)
- Light+ (default light)
- Monokai
- Dracula

### Customize Theme
```json
{
  "workbench.colorTheme": "Dark+",
  "workbench.iconTheme": "vs-seti"
}
```

## Extensions

### Cài Đặt Extensions
1. Click Extensions icon
2. Search extension
3. Click Install

### Recommended Extensions
- GitLens
- Prettier
- ESLint
- Docker
- REST Client

## Tips và Tricks

### 1. Multi-Cursor Editing
- `Alt+Click`: Thêm cursor
- `Ctrl+Alt+Up/Down`: Add cursor above/below
- `Ctrl+D`: Select next occurrence

### 2. Quick Fix
- `Ctrl+.`: Show quick fixes
- Kiro suggest fixes cho errors

### 3. Zen Mode
- `Ctrl+K Z`: Enter Zen mode (distraction-free)
- `Esc Esc`: Exit Zen mode

### 4. Breadcrumbs
- Show file path và symbols
- Click để navigate

### 5. Minimap
- Overview của file
- Click để jump to location

## Kết Luận

Làm quen với giao diện Kiro sẽ giúp bạn làm việc hiệu quả hơn. Hãy thử các shortcuts và tính năng để tìm workflow phù hợp nhất.

---

**Chương tiếp theo**: [Chat và Vibe Coding](./04-chat-vibe.md)

---

*Bài viết được viết bằng AI 🚀*

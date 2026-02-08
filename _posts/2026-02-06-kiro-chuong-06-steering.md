---
layout: post
title: "[AI] Steering - Hướng Dẫn AI"
summary: "Tìm hiểu về Steering - hệ thống bộ nhớ dài hạn của Kiro giúp AI hiểu và tuân thủ các quy chuẩn, nguyên tắc và best practices của team"
author: leo
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro steering, ai guidelines, coding standards, best practices, team conventions
permalink: /huong-dan-su-dung-kiro/steering-huong-dan-ai
usemathjax: false
---

# Chương 6: Steering - Hướng Dẫn AI

## Tóm Tắt

Steering là hệ thống "bộ nhớ dài hạn" của Kiro, giúp AI hiểu và tuân thủ các quy chuẩn, nguyên tắc và best practices của team. Đây là một trong những tính năng quan trọng nhất giúp Kiro tạo ra code chất lượng và nhất quán.

## Steering Là Gì?

Steering files là các file Markdown trong thư mục `.kiro/steering/` chứa:
- Quy chuẩn coding của team
- Kiến trúc và design patterns
- Tech stack và libraries ưa thích
- Best practices và conventions
- Workflows và processes

### Tại Sao Cần Steering?

**Không có Steering:**
```
Bạn: "Tạo API endpoint cho user"
Kiro: *Tạo code với style ngẫu nhiên, không theo quy chuẩn team*
```

**Có Steering:**
```
Bạn: "Tạo API endpoint cho user"
Kiro: *Đọc steering files*
      *Biết team dùng Express + TypeScript*
      *Biết phải có validation với Zod*
      *Biết phải có error handling*
      *Tạo code đúng chuẩn team*
```

## Cấu Trúc Steering Files

### Default Steering Files

Kiro tự động tạo 3 files cơ bản:

```
.kiro/steering/
├── architecture.md    # Kiến trúc hệ thống
├── product.md        # Thông tin sản phẩm
└── tech.md           # Stack công nghệ
```

### Tạo Steering Files Tự Động

1. Click biểu tượng **Ghost** (👻) trên sidebar
2. Chọn **Generate Steering Docs**
3. Kiro phân tích codebase và tạo files

### Tạo Custom Steering Files

```bash
# Tạo file mới
touch .kiro/steering/testing.md
touch .kiro/steering/security.md
touch .kiro/steering/api-design.md
```

## Viết Steering Files Hiệu Quả

### 1. Architecture.md

Mô tả kiến trúc và cấu trúc dự án.

**Template:**
```markdown
# Architecture

## System Overview
[Mô tả tổng quan hệ thống]

## Architecture Pattern
- Pattern: [MVC, Clean Architecture, Microservices, etc.]
- Layers: [Presentation, Business, Data, etc.]

## Project Structure
```
src/
├── controllers/    # HTTP request handlers
├── services/       # Business logic
├── repositories/   # Data access
├── models/         # Data models
├── middlewares/    # Express middlewares
└── utils/          # Utilities
```

## Component Communication
- Controllers → Services → Repositories
- Use dependency injection
- Avoid circular dependencies

## Design Patterns
- Repository pattern for data access
- Factory pattern for object creation
- Strategy pattern for algorithms

## Naming Conventions
- Files: kebab-case (user-service.ts)
- Classes: PascalCase (UserService)
- Functions: camelCase (getUserById)
- Constants: UPPER_SNAKE_CASE (MAX_RETRY_COUNT)
```

**Ví dụ thực tế:**
```markdown
# Architecture

## System Overview
E-commerce platform với microservices architecture.
Frontend: React SPA, Backend: Node.js services, Database: PostgreSQL

## Architecture Pattern
- Pattern: Clean Architecture + Microservices
- Layers:
  - Presentation (Controllers)
  - Application (Use Cases)
  - Domain (Business Logic)
  - Infrastructure (Database, External APIs)

## Project Structure
```
src/
├── api/
│   ├── controllers/     # HTTP handlers
│   ├── middlewares/     # Auth, validation, error handling
│   └── routes/          # Route definitions
├── application/
│   ├── use-cases/       # Business use cases
│   └── dto/             # Data transfer objects
├── domain/
│   ├── entities/        # Business entities
│   ├── repositories/    # Repository interfaces
│   └── services/        # Domain services
├── infrastructure/
│   ├── database/        # Database implementations
│   ├── external/        # External API clients
│   └── config/          # Configuration
└── shared/
    ├── errors/          # Custom errors
    └── utils/           # Shared utilities
```

## Dependency Rules
- Inner layers NEVER depend on outer layers
- Use interfaces for dependencies
- Inject dependencies via constructor

## Error Handling
- Use custom error classes
- Centralized error handler middleware
- Never expose internal errors to client

## Logging
- Use Winston for logging
- Log levels: error, warn, info, debug
- Include request ID in all logs
```

### 2. Product.md

Thông tin về sản phẩm và business logic.

**Template:**
```markdown
# Product Information

## Product Overview
[Mô tả sản phẩm]

## Target Users
- [User persona 1]
- [User persona 2]

## Core Features
1. [Feature 1]
2. [Feature 2]

## Business Rules
- [Rule 1]
- [Rule 2]

## User Workflows
### Workflow 1: [Name]
1. Step 1
2. Step 2

## Terminology
- **Term 1**: Definition
- **Term 2**: Definition
```

**Ví dụ thực tế:**
```markdown
# Product Information

## Product Overview
Online learning platform cho automation testing courses.
Users có thể đăng ký khóa học, học video, làm bài tập và nhận certificate.

## Target Users
- **Students**: Người muốn học automation testing
- **Instructors**: Người tạo và quản lý khóa học
- **Admins**: Quản trị viên hệ thống

## Core Features
1. Course Management: Tạo, sửa, xóa khóa học
2. Video Streaming: Xem video bài giảng
3. Assignments: Làm và nộp bài tập
4. Certificates: Nhận certificate khi hoàn thành
5. Payment: Thanh toán khóa học

## Business Rules
- User phải đăng nhập để xem khóa học
- Khóa học phải được thanh toán trước khi truy cập
- Certificate chỉ được cấp khi hoàn thành 100% khóa học
- Instructor chỉ có thể sửa khóa học của mình
- Admin có thể sửa tất cả khóa học

## User Workflows

### Workflow 1: Enroll in Course
1. User browse courses
2. User click "Enroll"
3. System check if user logged in
4. If not logged in, redirect to login
5. Show payment page
6. After payment, grant access to course

### Workflow 2: Complete Course
1. User watch all videos
2. User complete all assignments
3. System calculate completion percentage
4. If 100%, generate certificate
5. Send email with certificate

## Terminology
- **Enrollment**: Quá trình đăng ký khóa học
- **Module**: Một phần của khóa học (vd: Module 1, 2, 3)
- **Lesson**: Một bài học trong module
- **Assignment**: Bài tập thực hành
- **Certificate**: Chứng chỉ hoàn thành khóa học
```

### 3. Tech.md

Stack công nghệ và quy chuẩn kỹ thuật.

**Template:**
```markdown
# Technology Stack

## Programming Languages
- [Language 1]: [Version]
- [Language 2]: [Version]

## Frameworks & Libraries
- [Framework 1]: [Purpose]
- [Library 1]: [Purpose]

## Database
- [Database]: [Version]
- ORM: [ORM tool]

## Development Tools
- Package Manager: [npm, yarn, pnpm]
- Linter: [ESLint, Prettier]
- Testing: [Jest, Mocha]

## Code Standards
- [Standard 1]
- [Standard 2]

## Preferred Libraries
- For [task]: Use [library]
- For [task]: Use [library]

## Avoid
- ❌ Don't use [library/pattern]
- ❌ Don't use [library/pattern]
```

**Ví dụ thực tế:**
```markdown
# Technology Stack

## Programming Languages
- **Backend**: TypeScript 5.0+
- **Frontend**: TypeScript 5.0+ with React
- **Testing**: TypeScript

## Backend Stack
- **Framework**: Express.js 4.18+
- **Validation**: Zod for schema validation
- **ORM**: Prisma 5.0+
- **Authentication**: JWT with refresh tokens
- **API Documentation**: OpenAPI 3.0 (Swagger)

## Frontend Stack
- **Framework**: React 18+ with TypeScript
- **State Management**: Zustand (avoid Redux)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## Database
- **Primary**: PostgreSQL 15+
- **Cache**: Redis 7+
- **ORM**: Prisma
- **Migrations**: Prisma Migrate

## Development Tools
- **Package Manager**: pnpm (not npm or yarn)
- **Linter**: ESLint with TypeScript rules
- **Formatter**: Prettier
- **Testing**: Jest + Supertest (API), Playwright (E2E)
- **Git Hooks**: Husky + lint-staged

## Code Standards

### TypeScript
- Always use strict mode
- No `any` type (use `unknown` if needed)
- Prefer interfaces over types for objects
- Use enums for fixed sets of values

### Error Handling
```typescript
// ✅ Good
try {
  await userService.create(data);
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  throw error; // Let error handler middleware catch it
}

// ❌ Bad
try {
  await userService.create(data);
} catch (error) {
  console.log(error); // Don't just log
  return res.status(500).json({ error: 'Something went wrong' });
}
```

### API Design
- RESTful conventions
- Use plural nouns for resources (/users, not /user)
- Use HTTP methods correctly (GET, POST, PUT, DELETE)
- Return proper status codes
- Always return JSON

### Validation
```typescript
// Always validate input with Zod
const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});

// In controller
const data = CreateUserSchema.parse(req.body);
```

## Preferred Libraries
- **Date/Time**: date-fns (not moment.js)
- **UUID**: uuid
- **Environment Variables**: dotenv
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Mocking**: jest.mock()

## Avoid
- ❌ Don't use `var`, always use `const` or `let`
- ❌ Don't use `require()`, use ES6 `import`
- ❌ Don't use `any` type
- ❌ Don't use `console.log()` in production code
- ❌ Don't commit `.env` files
- ❌ Don't use `==`, always use `===`
- ❌ Don't use callbacks, use async/await
- ❌ Don't use Redux (use Zustand instead)

## Testing Standards
- Minimum 80% code coverage
- Test file naming: `*.spec.ts` or `*.test.ts`
- Use AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- One assertion per test when possible

## Documentation
- JSDoc for public APIs
- README.md for each module
- OpenAPI spec for REST APIs
- Architecture diagrams in docs/
```

## Steering Files Nâng Cao

### 4. Testing.md

```markdown
# Testing Guidelines

## Test Strategy
- Unit tests: 70%
- Integration tests: 20%
- E2E tests: 10%

## Test Framework
- Unit: Jest
- API: Supertest
- E2E: Playwright

## Test Structure
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@test.com', password: 'pass123' };
      
      // Act
      const user = await userService.createUser(userData);
      
      // Assert
      expect(user.email).toBe(userData.email);
      expect(user.id).toBeDefined();
    });
  });
});
```

## Test Data
- Use factories for test data
- Clean up after each test
- Never use production data

## Mocking
```typescript
// Mock external services
jest.mock('../services/email-service');

// Mock database
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn()
  }
};
```

## Coverage Requirements
- Minimum 80% overall
- 100% for critical business logic
- Exclude: config files, types, interfaces
```

### 5. Security.md

```markdown
# Security Guidelines

## Authentication
- Use JWT with short expiry (15 minutes)
- Implement refresh tokens
- Store tokens in httpOnly cookies
- Never store passwords in plain text

## Password Requirements
- Minimum 8 characters
- Must include: uppercase, lowercase, number
- Hash with bcrypt (cost factor 12)

## Input Validation
- Validate all user input
- Sanitize HTML input
- Use parameterized queries (prevent SQL injection)
- Validate file uploads (type, size)

## API Security
- Rate limiting: 100 requests/minute per IP
- CORS: Whitelist specific origins
- HTTPS only in production
- API keys in environment variables

## Sensitive Data
- Never log passwords or tokens
- Encrypt sensitive data at rest
- Use environment variables for secrets
- Never commit .env files

## Error Messages
- Don't expose internal errors
- Generic messages for auth failures
- Log detailed errors server-side only
```

### 6. API-Design.md

```markdown
# API Design Guidelines

## RESTful Conventions
- Use nouns, not verbs: `/users` not `/getUsers`
- Use plural: `/users` not `/user`
- Nested resources: `/users/:id/posts`

## HTTP Methods
- GET: Retrieve data (no side effects)
- POST: Create new resource
- PUT: Update entire resource
- PATCH: Partial update
- DELETE: Remove resource

## Status Codes
- 200: Success
- 201: Created
- 204: No Content (successful delete)
- 400: Bad Request (validation error)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 500: Internal Server Error

## Request/Response Format
```typescript
// Request
POST /api/users
{
  "email": "user@example.com",
  "name": "John Doe"
}

// Success Response
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}

// Error Response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be valid email"
      }
    ]
  }
}
```

## Pagination
```typescript
GET /api/users?page=1&limit=20

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Filtering & Sorting
```
GET /api/users?role=admin&sort=-createdAt
```

## Versioning
- URL versioning: `/api/v1/users`
- Never break backward compatibility
```

## Inclusion Modes

Steering files có 3 chế độ:

### 1. Always Included (Mặc định)

```markdown
---
# Không cần frontmatter, hoặc:
inclusion: always
---

# Content
```

Kiro luôn đọc file này.

### 2. Conditional (Theo điều kiện)

```markdown
---
inclusion: fileMatch
fileMatchPattern: '**/*.test.ts'
---

# Testing Guidelines
[Chỉ được include khi đọc file test]
```

**Use cases:**
- Testing guidelines: Chỉ khi làm việc với test files
- React guidelines: Chỉ khi làm việc với React components
- API guidelines: Chỉ khi làm việc với API routes

### 3. Manual (Thủ công)

```markdown
---
inclusion: manual
---

# Advanced Patterns
[Chỉ include khi user gọi #steering-file-name]
```

Sử dụng trong chat:
```
#advanced-patterns Hãy implement pattern này
```

## Best Practices

### 1. Cụ Thể và Rõ Ràng

```markdown
❌ Bad:
"Write clean code"

✅ Good:
"Use meaningful variable names. Example:
- ✅ const userEmail = 'test@test.com'
- ❌ const x = 'test@test.com'"
```

### 2. Có Ví Dụ Code

```markdown
## Error Handling

```typescript
// ✅ Good
try {
  await userService.create(data);
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  logger.error('Unexpected error:', error);
  return res.status(500).json({ error: 'Internal server error' });
}

// ❌ Bad
try {
  await userService.create(data);
} catch (error) {
  console.log(error);
}
```
```

### 3. Giải Thích "Tại Sao"

```markdown
## Use Zod for Validation

**Why**: Zod provides type-safe validation and automatically generates TypeScript types from schemas, reducing duplication.

**Example**:
```typescript
const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
});

type User = z.infer<typeof UserSchema>; // Auto-generated type
```
```

### 4. Tổ Chức Theo Chủ Đề

```
.kiro/steering/
├── architecture.md      # Kiến trúc
├── product.md          # Business logic
├── tech.md             # Tech stack
├── testing.md          # Testing
├── security.md         # Security
├── api-design.md       # API design
├── frontend.md         # Frontend specific
└── deployment.md       # Deployment
```

### 5. Cập Nhật Thường Xuyên

```bash
# Khi có quy chuẩn mới
git commit -m "Update steering: Add React hooks guidelines"

# Review steering files mỗi sprint
```

## Steering Cho Team

### Setup Cho Team Mới

1. **Tạo Steering Repository**
```bash
git init kiro-steering
cd kiro-steering
mkdir steering
# Tạo các steering files
git add .
git commit -m "Initial steering files"
git push
```

2. **Sử Dụng Trong Dự Án**
```bash
# Option 1: Git submodule
git submodule add https://github.com/team/kiro-steering .kiro/steering

# Option 2: Copy files
cp -r ~/kiro-steering/steering/* .kiro/steering/
```

3. **Onboarding Thành Viên Mới**
```
Thành viên mới chỉ cần:
1. Clone project
2. Mở Kiro
3. Kiro tự động đọc steering files
4. Code theo đúng chuẩn team ngay từ đầu
```

### Review và Cập Nhật

```markdown
# .kiro/steering/CHANGELOG.md

## 2026-01-15
- Added: React hooks guidelines
- Updated: Testing coverage requirements (70% → 80%)
- Removed: Deprecated Redux guidelines

## 2026-01-01
- Initial steering files
```

## Troubleshooting

### Kiro Không Tuân Thủ Steering

**Nguyên nhân**: Steering file quá chung chung hoặc mâu thuẫn

**Giải pháp**:
1. Thêm ví dụ cụ thể
2. Sử dụng format "✅ Good / ❌ Bad"
3. Kiểm tra không có mâu thuẫn giữa các files

### Steering Files Quá Dài

**Giải pháp**: Chia nhỏ theo chủ đề
```
tech.md → backend.md + frontend.md + database.md
```

### Steering Không Được Apply

**Kiểm tra**:
```
1. File có trong .kiro/steering/?
2. File có extension .md?
3. Frontmatter có đúng format?
4. Inclusion mode có phù hợp?
```

## Kết Luận

Steering là "bộ não" của Kiro, giúp AI hiểu và tuân thủ quy chuẩn team. Đầu tư thời gian viết steering files tốt sẽ giúp:
- Code nhất quán trong toàn team
- Onboarding nhanh cho thành viên mới
- Giảm thiểu code review comments
- Tăng chất lượng code

---

**Chương tiếp theo**: [Hooks - Tự Động Hóa](./07-hooks.md)

---

*Bài viết được viết bằng AI 🚀*

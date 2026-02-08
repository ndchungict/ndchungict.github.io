---
layout: post
title: "[AI] Dự Án Đầu Tiên Với Kiro"
summary: "Hướng dẫn từng bước tạo dự án đầu tiên với Kiro, từ setup ban đầu đến deployment với Todo List API"
author: chungnd
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro first project, kiro tutorial, todo api, kiro example, getting started
permalink: /huong-dan-su-dung-kiro/du-an-dau-tien
usemathjax: false
---

# Chương 10: Dự Án Đầu Tiên

## Tóm Tắt

Chương này hướng dẫn từng bước tạo dự án đầu tiên với Kiro, từ setup ban đầu đến deployment. Bạn sẽ xây dựng một Todo List API với đầy đủ specs, steering, hooks và tests.

## Tổng Quan Dự Án

### Mục Tiêu
Xây dựng **Todo List REST API** với:
- CRUD operations
- User authentication
- Input validation
- Unit và integration tests
- API documentation
- Deployment ready

### Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Documentation**: OpenAPI/Swagger

## Bước 1: Setup Dự Án

### Tạo Thư Mục Dự Án

```bash
mkdir todo-api
cd todo-api
```

### Mở Với Kiro

```bash
kiro .
```

### Khởi Tạo Git

```bash
git init
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore
```

## Bước 2: Generate Steering Files

### Tự Động Generate

1. Click biểu tượng **Ghost** (👻)
2. Click **Generate Steering Docs**
3. Kiro sẽ tạo 3 files cơ bản

### Customize Steering Files

**`.kiro/steering/tech.md`:**
```markdown
# Technology Stack

## Backend
- **Language**: TypeScript 5.0+
- **Framework**: Express.js 4.18+
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.0+
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` type
- Prefer interfaces over types for objects

### Error Handling
```typescript
// ✅ Good
try {
  const result = await service.create(data);
  return res.status(201).json(result);
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  throw error;
}

// ❌ Bad
try {
  const result = await service.create(data);
  return res.status(201).json(result);
} catch (error) {
  console.log(error);
  return res.status(500).json({ error: 'Error' });
}
```

### API Design
- RESTful conventions
- Plural nouns: `/todos` not `/todo`
- Proper HTTP methods and status codes
- JSON responses

### Project Structure
```
src/
├── api/
│   ├── controllers/
│   ├── routes/
│   └── middlewares/
├── services/
├── repositories/
├── models/
├── utils/
└── config/
```

## Testing
- Minimum 80% coverage
- Jest for unit tests
- Supertest for API tests
- Test file naming: `*.spec.ts`
```

**`.kiro/steering/product.md`:**
```markdown
# Product: Todo List API

## Overview
REST API for managing todo items with user authentication.

## Core Features
1. User registration and login
2. Create, read, update, delete todos
3. Mark todos as complete/incomplete
4. Filter todos by status
5. User can only access their own todos

## Business Rules
- User must be authenticated to access todos
- Todo title is required (1-200 characters)
- Todo description is optional (max 1000 characters)
- Todos belong to users (one-to-many)
- Completed todos cannot be deleted (must archive)

## API Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/todos - List user's todos
- POST /api/todos - Create todo
- GET /api/todos/:id - Get todo detail
- PUT /api/todos/:id - Update todo
- DELETE /api/todos/:id - Delete todo
- PATCH /api/todos/:id/complete - Mark as complete
```

**`.kiro/steering/testing.md`:**
```markdown
# Testing Guidelines

## Test Structure
- Use AAA pattern (Arrange, Act, Assert)
- One test file per source file
- Clear test descriptions

## Test Coverage
- Unit tests: Services and utilities
- Integration tests: API endpoints
- Minimum 80% coverage

## Test Data
- Use factories for test data
- Clean database before each test
- Never use production data

## Example
```typescript
describe('TodoService', () => {
  describe('createTodo', () => {
    it('should create todo with valid data', async () => {
      // Arrange
      const userId = 'user-123';
      const todoData = { title: 'Test todo' };
      
      // Act
      const todo = await todoService.createTodo(userId, todoData);
      
      // Assert
      expect(todo.title).toBe(todoData.title);
      expect(todo.userId).toBe(userId);
      expect(todo.completed).toBe(false);
    });
  });
});
```
```

## Bước 3: Tạo Spec

### Mở Kiro Chat

```
Tạo spec cho Todo List API với các yêu cầu:

1. User Authentication:
   - Register với email/password
   - Login với JWT token
   - Password phải hash với bcrypt

2. Todo Management:
   - CRUD operations
   - Todos thuộc về user
   - Filter by status (all, active, completed)
   - Mark as complete/incomplete

3. Validation:
   - Email format validation
   - Password minimum 8 characters
   - Todo title required (1-200 chars)
   - Todo description optional (max 1000 chars)

4. Tech Stack:
   - Node.js + Express + TypeScript
   - PostgreSQL + Prisma
   - JWT authentication
   - Zod validation
   - Jest + Supertest testing

5. API Documentation:
   - OpenAPI/Swagger spec
```

### Kiro Sẽ Tạo Spec

Kiro tạo folder `.kiro/specs/todo-api/` với 3 files:
- `requirements.md`
- `design.md`
- `tasks.md`

### Review Requirements

Mở `requirements.md` và review:

```markdown
# Requirements: Todo List API

## User Stories

### US-1: User Registration
**Là** người dùng mới
**Tôi muốn** đăng ký tài khoản
**Để** sử dụng ứng dụng

**Acceptance Criteria:**
- WHEN user submits valid email and password, the system SHALL create new account
- IF email already exists, THEN return 400 error
- WHERE password < 8 characters, the system SHALL reject
- WHEN registration successful, the system SHALL return JWT token

### US-2: User Login
**Là** người dùng đã đăng ký
**Tôi muốn** đăng nhập
**Để** truy cập todos của tôi

**Acceptance Criteria:**
- WHEN credentials are correct, the system SHALL return JWT token
- IF email not found, THEN return 401 error
- IF password incorrect, THEN return 401 error
- WHEN login successful, the system SHALL include user info in response

### US-3: Create Todo
**Là** người dùng đã đăng nhập
**Tôi muốn** tạo todo mới
**Để** quản lý công việc

**Acceptance Criteria:**
- WHEN user provides valid title, the system SHALL create todo
- WHERE title is empty, the system SHALL reject
- WHERE title > 200 characters, the system SHALL reject
- WHEN created, the system SHALL set completed = false
- WHEN created, the system SHALL associate with current user

[... more user stories ...]

## Non-Functional Requirements
- Performance: API response < 200ms
- Security: Passwords hashed with bcrypt (cost 12)
- Security: JWT tokens expire in 24 hours
- Validation: All inputs validated with Zod
- Testing: Minimum 80% code coverage
```

Nếu cần chỉnh sửa, update file và click **Refine**.

### Generate Design

1. Chuyển sang tab **Design**
2. Click **Refine**
3. Kiro generate `design.md`

**Review design.md:**
```markdown
# Design: Todo List API

## Architecture
Clean Architecture với 4 layers:
- API Layer (Controllers, Routes, Middlewares)
- Service Layer (Business Logic)
- Repository Layer (Data Access)
- Database Layer (Prisma)

## Data Models

```typescript
// User Model
interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  todos: Todo[];
}

// Todo Model
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Todos
- GET /api/todos?status=all|active|completed
- POST /api/todos
- GET /api/todos/:id
- PUT /api/todos/:id
- DELETE /api/todos/:id
- PATCH /api/todos/:id/complete

## Components

### 1. Auth Controller
```typescript
class AuthController {
  async register(req: Request, res: Response): Promise<Response>
  async login(req: Request, res: Response): Promise<Response>
}
```

### 2. Todo Controller
```typescript
class TodoController {
  async list(req: Request, res: Response): Promise<Response>
  async create(req: Request, res: Response): Promise<Response>
  async get(req: Request, res: Response): Promise<Response>
  async update(req: Request, res: Response): Promise<Response>
  async delete(req: Request, res: Response): Promise<Response>
  async toggleComplete(req: Request, res: Response): Promise<Response>
}
```

### 3. Auth Service
```typescript
class AuthService {
  async register(email: string, password: string): Promise<User>
  async login(email: string, password: string): Promise<{ user: User, token: string }>
  async hashPassword(password: string): Promise<string>
  async comparePassword(password: string, hash: string): Promise<boolean>
  generateToken(userId: string): string
}
```

### 4. Todo Service
```typescript
class TodoService {
  async list(userId: string, status?: string): Promise<Todo[]>
  async create(userId: string, data: CreateTodoDto): Promise<Todo>
  async get(id: string, userId: string): Promise<Todo>
  async update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo>
  async delete(id: string, userId: string): Promise<void>
  async toggleComplete(id: string, userId: string): Promise<Todo>
}
```

## Validation Schemas

```typescript
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const CreateTodoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional()
});
```

## Security
- JWT secret in environment variable
- Passwords hashed with bcrypt (cost 12)
- Auth middleware validates JWT on protected routes
- Users can only access their own todos
```

### Generate Tasks

1. Chuyển sang tab **Tasks**
2. Click **Refine**
3. Kiro generate `tasks.md`

**Review tasks.md:**
```markdown
# Implementation Plan

- [ ] 1. Project Setup
  - [ ] 1.1 Initialize Node.js project
  - [ ] 1.2 Install dependencies
  - [ ] 1.3 Setup TypeScript
  - [ ] 1.4 Configure Prisma
  - _Requirements: 3.1_

- [ ] 2. Database Setup
  - [ ] 2.1 Create Prisma schema
  - [ ] 2.2 Create migrations
  - [ ] 2.3 Generate Prisma client
  - _Requirements: Data Models_

- [ ] 3. Implement Authentication
  - [ ] 3.1 Create User model
  - [ ] 3.2 Implement AuthService
  - [ ] 3.3 Create auth routes
  - [ ] 3.4 Add JWT middleware
  - _Requirements: US-1, US-2_

- [ ] 4. Implement Todo CRUD
  - [ ] 4.1 Create Todo model
  - [ ] 4.2 Implement TodoService
  - [ ] 4.3 Create todo routes
  - [ ] 4.4 Add validation
  - _Requirements: US-3, US-4, US-5_

- [ ] 5. Add Tests
  - [ ] 5.1 Setup Jest
  - [ ] 5.2 Write unit tests
  - [ ] 5.3 Write API tests
  - [ ] 5.4 Check coverage
  - _Requirements: Testing_

- [ ] 6. Documentation
  - [ ] 6.1 Generate OpenAPI spec
  - [ ] 6.2 Setup Swagger UI
  - [ ] 6.3 Write README
  - _Requirements: Documentation_
```

## Bước 4: Implement

### Option 1: Autopilot Mode

```
1. Click "Start Tasks"
2. Kiro tự động implement tất cả tasks
3. Review changes
4. Test
```

### Option 2: Manual Mode

Implement từng task một:

**Task 1.1: Initialize Project**
```
# Trong chat
"Implement task 1.1: Initialize Node.js project"
```

Kiro sẽ:
```bash
npm init -y
npm install express prisma @prisma/client bcrypt jsonwebtoken zod
npm install -D typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken ts-node-dev jest @types/jest ts-jest supertest @types/supertest
```

**Task 1.3: Setup TypeScript**
```
"Implement task 1.3: Setup TypeScript configuration"
```

Kiro tạo `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Task 2.1: Create Prisma Schema**
```
"Implement task 2.1: Create Prisma schema for User and Todo models"
```

Kiro tạo `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  todos        Todo[]
}

model Todo {
  id          String   @id @default(uuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}
```

**Task 3.2: Implement AuthService**
```
"Implement task 3.2: Create AuthService with register and login methods"
```

Kiro tạo `src/services/AuthService.ts`:
```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_EXPIRES_IN = '24h';

  async register(email: string, password: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });

    // Generate token
    const token = this.generateToken(user.id);

    return { user, token };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });
  }

  verifyToken(token: string): { userId: string } {
    return jwt.verify(token, this.JWT_SECRET) as { userId: string };
  }
}
```

Tiếp tục với các tasks còn lại...

## Bước 5: Setup Hooks

### Create Hooks

**`.kiro/hooks/run-tests-on-save.json`:**
```json
{
  "name": "Run Tests On Save",
  "version": "1.0.0",
  "description": "Run tests when source files are saved",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run tests related to the edited file and report results"
  }
}
```

**`.kiro/hooks/lint-on-save.json`:**
```json
{
  "name": "Lint On Save",
  "version": "1.0.0",
  "description": "Run ESLint when files are saved",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run ESLint on the edited file and fix auto-fixable issues"
  }
}
```

## Bước 6: Testing

### Run Tests

```bash
npm test
```

### Check Coverage

```bash
npm test -- --coverage
```

### Fix Failing Tests

```
# Trong chat
"Fix failing tests in TodoService.spec.ts"
```

## Bước 7: Documentation

### Generate OpenAPI Spec

```
# Trong chat
"Generate OpenAPI 3.0 specification for all API endpoints"
```

Kiro tạo `docs/openapi.yaml`:
```yaml
openapi: 3.0.0
info:
  title: Todo List API
  version: 1.0.0
  description: REST API for managing todos

servers:
  - url: http://localhost:3000
    description: Development server

paths:
  /api/auth/register:
    post:
      summary: Register new user
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        '201':
          description: User registered successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: Validation error

  /api/todos:
    get:
      summary: List todos
      tags: [Todos]
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [all, active, completed]
      responses:
        '200':
          description: List of todos
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Todo'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        createdAt:
          type: string
          format: date-time

    Todo:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        completed:
          type: boolean
        userId:
          type: string
        createdAt:
          type: string
          format: date-time

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### Create README

```
"Generate comprehensive README.md with setup instructions"
```

## Bước 8: Run và Test

### Setup Database

```bash
# Create .env
echo "DATABASE_URL=postgresql://user:password@localhost:5432/todo_db" > .env
echo "JWT_SECRET=your-secret-key" >> .env

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### Start Server

```bash
npm run dev
```

### Test API

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create Todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"My first todo"}'

# List Todos
curl http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Bước 9: Commit

```bash
git add .
git commit -m "feat: implement todo list API

- User authentication with JWT
- CRUD operations for todos
- Input validation with Zod
- Unit and integration tests
- OpenAPI documentation"
```

## Kết Luận

Bạn đã hoàn thành dự án đầu tiên với Kiro! Bạn đã học:
- ✅ Setup steering files
- ✅ Tạo specs với requirements, design, tasks
- ✅ Implement với Autopilot hoặc manual
- ✅ Setup hooks cho automation
- ✅ Testing và documentation
- ✅ Deploy ready code

**Next Steps:**
- Deploy lên cloud (AWS, Heroku, etc.)
- Thêm features mới (pagination, search, etc.)
- Improve test coverage
- Add monitoring và logging

---

**Chương tiếp theo**: [Quy Trình Làm Việc Hiệu Quả](./11-quy-trinh-lam-viec.md)

---

*Bài viết được viết bằng AI 🚀*

---
layout: post
title: "[AI] Best Practices Với Kiro"
summary: "Tổng hợp các best practices khi sử dụng Kiro, từ viết specs, steering files, hooks đến collaboration và maintenance"
author: leo
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro best practices, coding standards, testing guidelines, team workflows
permalink: /huong-dan-su-dung-kiro/best-practices
usemathjax: false
---

# Chương 12: Best Practices

## Tóm Tắt

Chương này tổng hợp các best practices khi sử dụng Kiro, từ viết specs, steering files, hooks đến collaboration và maintenance. Áp dụng những practices này sẽ giúp bạn tận dụng tối đa sức mạnh của Kiro.

## Specs Best Practices

### 1. Viết Requirements Chi Tiết

```markdown
❌ Bad: Vague Requirements
"User can login"

✅ Good: Detailed Requirements
### US-1: User Login
**Là** registered user
**Tôi muốn** login với email và password
**Để** access my account

**Acceptance Criteria:**
- WHEN user enters correct credentials, system SHALL redirect to dashboard
- IF email not found, THEN return 401 with message "Invalid credentials"
- IF password incorrect, THEN return 401 with message "Invalid credentials"
- WHERE user fails login 3 times, system SHALL lock account for 15 minutes
- WHEN login successful, system SHALL generate JWT token valid for 24 hours
- WHEN login successful, system SHALL log login event with timestamp and IP

**Test Data:**
- Valid user: test@example.com / Password123
- Invalid email: notfound@example.com
- Invalid password: WrongPassword
```

### 2. Sử Dụng EARS Format

```markdown
✅ Good: EARS Format
- WHEN [trigger event], the system SHALL [expected behavior]
- IF [condition], THEN [consequence]
- WHERE [precondition], the system SHALL [behavior]
- WHILE [state], the system SHALL [continuous behavior]

Examples:
- WHEN user clicks submit, the system SHALL validate all fields
- IF email is invalid, THEN display error message below email field
- WHERE user is admin, the system SHALL show admin panel
- WHILE file is uploading, the system SHALL display progress bar
```

### 3. Include Non-Functional Requirements

```markdown
## Non-Functional Requirements

### Performance
- API response time < 200ms for 95th percentile
- Page load time < 2 seconds
- Support 1000 concurrent users

### Security
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire in 24 hours
- HTTPS only in production
- Rate limiting: 100 requests/minute per IP

### Scalability
- Horizontal scaling support
- Database connection pooling
- Caching strategy for frequently accessed data

### Reliability
- 99.9% uptime
- Automatic failover
- Data backup every 6 hours

### Maintainability
- Code coverage > 80%
- Documentation for all public APIs
- Logging for all critical operations
```

### 4. Link Requirements to Tasks

```markdown
# tasks.md

- [ ] 1. Implement user authentication
  - [ ] 1.1 Create User model
    - _Requirements: US-1, Data Models_
  - [ ] 1.2 Implement login endpoint
    - _Requirements: US-1, API Design_
  - [ ] 1.3 Add JWT middleware
    - _Requirements: US-1, Security_
```

### 5. Keep Specs Updated

```bash
# When requirements change
1. Update requirements.md
2. Click "Refine" in Design tab
3. Click "Refine" in Tasks tab
4. Review and approve changes
5. Commit updated spec

git add .kiro/specs/
git commit -m "spec: update authentication requirements"
```

## Steering Best Practices

### 1. Be Specific với Examples

```markdown
❌ Bad: Generic
"Write clean code"

✅ Good: Specific with Examples
## Error Handling

Always use custom error classes:

```typescript
// ✅ Good
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

throw new ValidationError('Invalid email', 'email', userInput.email);

// ❌ Bad
throw new Error('Invalid email');
```

Handle errors at controller level:

```typescript
// ✅ Good
try {
  const result = await service.create(data);
  return res.status(201).json(result);
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: error.message,
      field: error.field
    });
  }
  logger.error('Unexpected error:', error);
  return res.status(500).json({ error: 'Internal server error' });
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
```

### 2. Organize by Topic

```
.kiro/steering/
├── architecture.md       # System architecture
├── product.md           # Business logic
├── tech.md              # Tech stack
├── api-design.md        # API conventions
├── database.md          # Database patterns
├── testing.md           # Testing standards
├── security.md          # Security practices
├── performance.md       # Performance guidelines
└── deployment.md        # Deployment process
```

### 3. Use Conditional Inclusion

```markdown
---
inclusion: fileMatch
fileMatchPattern: '**/api/**/*.ts'
---

# API Design Guidelines
[Only loaded when working with API files]
```

```markdown
---
inclusion: fileMatch
fileMatchPattern: '**/*.spec.ts'
---

# Testing Guidelines
[Only loaded when working with test files]
```

### 4. Include "Why" Not Just "What"

```markdown
## Use Zod for Validation

**Why**: 
- Type-safe validation
- Automatic TypeScript type inference
- Composable schemas
- Better error messages than manual validation

**How**:
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().min(18, 'Must be 18 or older')
});

type User = z.infer<typeof UserSchema>; // Auto-generated type

// In controller
const data = UserSchema.parse(req.body); // Throws if invalid
```

**Benefits**:
- Single source of truth for validation and types
- Reduces code duplication
- Better developer experience
```

### 5. Keep Steering Files Concise

```markdown
❌ Bad: Too Long (1000+ lines in one file)
tech.md with everything

✅ Good: Split by Topic
tech.md → Overview
backend.md → Backend specifics
frontend.md → Frontend specifics
database.md → Database patterns
```

## Hooks Best Practices

### 1. Specific File Patterns

```json
❌ Bad: Too Broad
{
  "patterns": ["**/*"]  // Triggers on every file!
}

✅ Good: Specific
{
  "patterns": [
    "src/**/*.ts",
    "!src/**/*.spec.ts",  // Exclude tests
    "!src/**/*.d.ts"      // Exclude type definitions
  ]
}
```

### 2. Clear, Actionable Prompts

```json
❌ Bad: Vague
{
  "prompt": "Check the code"
}

✅ Good: Specific
{
  "prompt": "Run ESLint on the edited file. Fix auto-fixable issues. Report remaining errors with line numbers and suggested fixes."
}
```

### 3. Avoid Infinite Loops

```json
❌ Bad: Can Cause Loop
{
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts"]
  },
  "then": {
    "prompt": "Modify this file to add comments"  // Will trigger hook again!
  }
}

✅ Good: Safe
{
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts"]
  },
  "then": {
    "prompt": "Run linter and REPORT issues only. Do NOT modify files."
  }
}
```

### 4. Use userTriggered for Heavy Tasks

```json
// ❌ Bad: Runs on every save (slow!)
{
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts"]
  },
  "then": {
    "prompt": "Run full test suite with coverage report"
  }
}

// ✅ Good: Manual trigger
{
  "name": "Full Test Suite",
  "when": {
    "type": "userTriggered"
  },
  "then": {
    "prompt": "Run full test suite with coverage report"
  }
}
```

### 5. Document Hooks

```json
{
  "name": "Lint TypeScript On Save",
  "version": "1.0.0",
  "description": "Automatically runs ESLint and fixes auto-fixable issues when TypeScript files are saved. Reports remaining issues that need manual fixing.",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts", "src/**/*.tsx"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run `npm run lint:fix` on the edited file. Report any remaining issues with line numbers."
  }
}
```

## Testing Best Practices

### 1. Test Pyramid

```
        /\
       /E2E\      ← 10% (Critical flows only)
      /------\
     /  API   \   ← 20% (Integration tests)
    /----------\
   /   Unit     \ ← 70% (Fast, isolated tests)
  /--------------\
```

**Implementation:**
```markdown
# .kiro/steering/testing.md

## Test Distribution
- Unit tests: 70% - Business logic, utilities, helpers
- Integration tests: 20% - API endpoints, database operations
- E2E tests: 10% - Critical user journeys only

## When to Write Each Type

### Unit Tests
- Pure functions
- Business logic
- Utilities and helpers
- Validation logic

### Integration Tests
- API endpoints
- Database operations
- External service integrations
- Authentication flows

### E2E Tests
- User registration and login
- Critical business transactions
- Payment flows
- Data export/import
```

### 2. AAA Pattern

```typescript
// ✅ Good: Clear AAA structure
describe('TodoService', () => {
  describe('createTodo', () => {
    it('should create todo with valid data', async () => {
      // Arrange
      const userId = 'user-123';
      const todoData = {
        title: 'Test todo',
        description: 'Test description'
      };
      
      // Act
      const todo = await todoService.createTodo(userId, todoData);
      
      // Assert
      expect(todo.title).toBe(todoData.title);
      expect(todo.userId).toBe(userId);
      expect(todo.completed).toBe(false);
      expect(todo.id).toBeDefined();
    });
  });
});

// ❌ Bad: Mixed arrange/act/assert
it('should create todo', async () => {
  const todo = await todoService.createTodo('user-123', { title: 'Test' });
  expect(todo.title).toBe('Test');
  const saved = await todoRepository.findById(todo.id);
  expect(saved).toBeDefined();
});
```

### 3. Test Data Factories

```typescript
// ✅ Good: Use factories
import { UserFactory } from '../factories/UserFactory';

it('should update user profile', async () => {
  const user = await UserFactory.create();
  const updates = { name: 'New Name' };
  
  const updated = await userService.update(user.id, updates);
  
  expect(updated.name).toBe(updates.name);
});

// ❌ Bad: Hardcoded data
it('should update user profile', async () => {
  const user = {
    id: '123',
    email: 'test@test.com',
    password: 'password',
    name: 'Test User'
  };
  // ... test logic
});
```

### 4. Descriptive Test Names

```typescript
// ✅ Good: Descriptive
describe('AuthService', () => {
  describe('login', () => {
    it('should return user and token when credentials are valid', async () => {});
    it('should throw error when email is not found', async () => {});
    it('should throw error when password is incorrect', async () => {});
    it('should lock account after 3 failed attempts', async () => {});
  });
});

// ❌ Bad: Vague
describe('AuthService', () => {
  it('test login', async () => {});
  it('test error', async () => {});
  it('test lock', async () => {});
});
```

### 5. Test Independence

```typescript
// ✅ Good: Independent tests
describe('UserService', () => {
  beforeEach(async () => {
    await database.clear();
    await database.seed();
  });

  it('should create user', async () => {
    const user = await userService.create({ email: 'test@test.com' });
    expect(user.id).toBeDefined();
  });

  it('should update user', async () => {
    const user = await UserFactory.create();
    const updated = await userService.update(user.id, { name: 'New' });
    expect(updated.name).toBe('New');
  });
});

// ❌ Bad: Tests depend on each other
let userId: string;

it('should create user', async () => {
  const user = await userService.create({ email: 'test@test.com' });
  userId = user.id; // Shared state!
});

it('should update user', async () => {
  await userService.update(userId, { name: 'New' }); // Depends on previous test
});
```

## Code Quality Best Practices

### 1. Consistent Naming

```typescript
// ✅ Good: Consistent naming
// Files: kebab-case
user-service.ts
todo-controller.ts

// Classes: PascalCase
class UserService {}
class TodoController {}

// Functions: camelCase
function getUserById() {}
async function createTodo() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// Interfaces: PascalCase with 'I' prefix (optional)
interface User {}
interface IUserRepository {}

// Types: PascalCase
type UserId = string;
type TodoStatus = 'active' | 'completed';
```

### 2. Small, Focused Functions

```typescript
// ✅ Good: Small, focused
async function createUser(data: CreateUserDto): Promise<User> {
  validateUserData(data);
  const hashedPassword = await hashPassword(data.password);
  const user = await userRepository.create({
    ...data,
    password: hashedPassword
  });
  await sendWelcomeEmail(user.email);
  return user;
}

function validateUserData(data: CreateUserDto): void {
  if (!isValidEmail(data.email)) {
    throw new ValidationError('Invalid email');
  }
  if (data.password.length < 8) {
    throw new ValidationError('Password too short');
  }
}

// ❌ Bad: Large, unfocused
async function createUser(data: any): Promise<any> {
  // 100 lines of validation
  // 50 lines of password hashing
  // 30 lines of database operations
  // 20 lines of email sending
  // Total: 200+ lines
}
```

### 3. Error Handling

```typescript
// ✅ Good: Proper error handling
class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    try {
      // Validate
      const validated = CreateUserSchema.parse(data);
      
      // Check if exists
      const existing = await this.userRepository.findByEmail(validated.email);
      if (existing) {
        throw new ConflictError('Email already registered');
      }
      
      // Create user
      const user = await this.userRepository.create(validated);
      
      // Send email (don't fail if email fails)
      try {
        await this.emailService.sendWelcome(user.email);
      } catch (error) {
        logger.warn('Failed to send welcome email:', error);
      }
      
      return user;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid user data', error.errors);
      }
      throw error;
    }
  }
}

// ❌ Bad: Poor error handling
async function createUser(data: any) {
  try {
    const user = await db.users.create(data);
    await sendEmail(user.email);
    return user;
  } catch (error) {
    console.log(error);
    throw new Error('Error creating user');
  }
}
```

### 4. Type Safety

```typescript
// ✅ Good: Type-safe
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

async function createUser(data: CreateUserDto): Promise<User> {
  // TypeScript ensures data has correct shape
  return await userRepository.create(data);
}

// ❌ Bad: No types
async function createUser(data: any): Promise<any> {
  return await userRepository.create(data);
}
```

### 5. Documentation

```typescript
// ✅ Good: Well documented
/**
 * Creates a new user account
 * 
 * @param data - User registration data
 * @returns Created user object (without password)
 * @throws {ValidationError} If data is invalid
 * @throws {ConflictError} If email already exists
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'user@example.com',
 *   password: 'SecurePass123',
 *   name: 'John Doe'
 * });
 * ```
 */
async function createUser(data: CreateUserDto): Promise<User> {
  // Implementation
}

// ❌ Bad: No documentation
async function createUser(data: CreateUserDto): Promise<User> {
  // Implementation
}
```

## Collaboration Best Practices

### 1. Commit Specs với Code

```bash
# ✅ Good: Specs and code together
git add .kiro/specs/user-auth/
git add src/auth/
git add tests/auth/
git commit -m "feat: implement user authentication

- JWT-based authentication
- Register and login endpoints
- Password hashing with bcrypt
- Input validation with Zod

Spec: .kiro/specs/user-auth/"

# ❌ Bad: Only code
git add src/
git commit -m "add auth"
```

### 2. Meaningful Commit Messages

```bash
# ✅ Good: Conventional commits
feat: add user authentication
fix: resolve login case-sensitivity bug
docs: update API documentation
test: add tests for todo service
refactor: extract validation logic
chore: update dependencies

# ❌ Bad: Vague messages
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

### 3. Small Pull Requests

```bash
# ✅ Good: Focused PRs
PR #1: Add user model and repository
PR #2: Implement authentication service
PR #3: Add auth API endpoints
PR #4: Add authentication tests

# ❌ Bad: Massive PR
PR #1: Implement entire authentication system (50 files changed)
```

### 4. Code Review Checklist

```markdown
## Code Review Checklist

### Spec Alignment
- [ ] All requirements implemented
- [ ] Design followed
- [ ] Tasks completed

### Code Quality
- [ ] Follows coding standards
- [ ] No code smells
- [ ] Proper error handling
- [ ] Type-safe

### Testing
- [ ] Tests added
- [ ] Tests pass
- [ ] Coverage > 80%
- [ ] Edge cases covered

### Documentation
- [ ] Code documented
- [ ] API docs updated
- [ ] README updated if needed

### Security
- [ ] No security vulnerabilities
- [ ] Input validated
- [ ] Sensitive data protected
```

### 5. Share Steering Files

```bash
# Team steering repository
team-kiro-steering/
├── architecture.md
├── tech.md
├── testing.md
└── security.md

# In each project
git submodule add https://github.com/team/kiro-steering .kiro/steering/team
```

## Performance Best Practices

### 1. Optimize Kiro Indexing

```json
// .kiro/settings.json
{
  "kiro.indexing.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**",
    "**/coverage/**",
    "**/*.log"
  ]
}
```

### 2. Disable Unused MCP Servers

```json
{
  "mcpServers": {
    "unused-server": {
      "disabled": true
    }
  }
}
```

### 3. Use Specific Hooks

```json
// ✅ Good: Specific patterns
{
  "patterns": ["src/**/*.ts"]
}

// ❌ Bad: Too broad
{
  "patterns": ["**/*"]
}
```

## Kết Luận

Best practices tổng hợp:

### Specs
- ✅ Chi tiết, cụ thể
- ✅ EARS format
- ✅ Non-functional requirements
- ✅ Keep updated

### Steering
- ✅ Specific với examples
- ✅ Organize by topic
- ✅ Include "why"
- ✅ Conditional inclusion

### Hooks
- ✅ Specific patterns
- ✅ Clear prompts
- ✅ Avoid loops
- ✅ Document purpose

### Testing
- ✅ Test pyramid
- ✅ AAA pattern
- ✅ Factories
- ✅ Independence

### Code Quality
- ✅ Consistent naming
- ✅ Small functions
- ✅ Error handling
- ✅ Type safety
- ✅ Documentation

### Collaboration
- ✅ Commit specs
- ✅ Meaningful commits
- ✅ Small PRs
- ✅ Code review
- ✅ Share steering

Áp dụng những practices này sẽ giúp bạn và team làm việc hiệu quả hơn với Kiro!

---

**Chương tiếp theo**: [Kiro Cho Automation Testing](./13-automation-testing.md)

---

*Bài viết được viết bằng AI 🚀*

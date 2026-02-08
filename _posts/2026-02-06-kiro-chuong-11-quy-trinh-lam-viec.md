---
layout: post
title: "[AI] Quy Trình Làm Việc Hiệu Quả"
summary: "Trình bày các quy trình làm việc hiệu quả với Kiro cho cả cá nhân và team, bao gồm development workflow và collaboration"
author: leo
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro workflow, team collaboration, development process, code review, kiro best practices
permalink: /huong-dan-su-dung-kiro/quy-trinh-lam-viec-hieu-qua
usemathjax: false
---

# Chương 11: Quy Trình Làm Việc Hiệu Quả

## Tóm Tắt

Chương này trình bày các quy trình làm việc (workflows) hiệu quả với Kiro cho cả cá nhân và team, bao gồm development workflow, code review, collaboration và maintenance.

## Development Workflow

### Solo Developer Workflow

```
1. Idea → 2. Spec → 3. Implement → 4. Test → 5. Deploy
```

#### 1. Capture Idea

```
# Trong Kiro Chat
"Tạo spec cho feature: User profile management
- Users can update profile info
- Upload avatar image
- Change password
- View activity history"
```

#### 2. Create Spec

```
Kiro: *Creates spec with requirements, design, tasks*
You: *Review and refine*
```

#### 3. Implement

**Option A: Autopilot**
```
Click "Start Tasks" → Kiro implements all
```

**Option B: Selective**
```
- Let Kiro do: Boilerplate, CRUD, tests
- You do: Complex business logic, algorithms
```

#### 4. Test

```
# Auto-run with hooks
Save file → Hook triggers → Tests run

# Or manual
npm test
```

#### 5. Deploy

```
git add .
git commit -m "feat: add user profile management"
git push
```

### Team Workflow

```
1. Planning → 2. Spec Review → 3. Implementation → 4. Code Review → 5. Merge
```

#### 1. Planning Meeting

**Product Owner:**
```
"Chúng ta cần feature user notifications"
```

**Tech Lead:**
```
"Tôi sẽ tạo spec và share với team"
```

#### 2. Create và Review Spec

**Tech Lead tạo spec:**
```
# Trong Kiro
"Tạo spec cho notification system:
- Email notifications
- In-app notifications
- Push notifications
- Notification preferences"
```

**Team review:**
```
1. Tech Lead share spec trong Git
2. Team members review requirements.md
3. Discuss và refine trong meeting
4. Update spec based on feedback
5. Approve spec
```

#### 3. Assign Tasks

**tasks.md:**
```markdown
- [ ] 1. Email Service
  - Assignee: @john
  - [ ] 1.1 Setup email provider
  - [ ] 1.2 Create email templates

- [ ] 2. In-app Notifications
  - Assignee: @jane
  - [ ] 2.1 Create notification model
  - [ ] 2.2 Build notification UI

- [ ] 3. Push Notifications
  - Assignee: @bob
  - [ ] 3.1 Setup FCM
  - [ ] 3.2 Implement push service
```

#### 4. Implement

**Mỗi developer:**
```
1. Checkout feature branch
2. Implement assigned tasks với Kiro
3. Run tests
4. Commit changes
5. Create Pull Request
```

#### 5. Code Review

**Reviewer:**
```
1. Read spec để hiểu context
2. Review code changes
3. Check tests
4. Verify requirements met
5. Approve hoặc request changes
```

#### 6. Merge và Deploy

```
1. Merge PR
2. CI/CD runs tests
3. Deploy to staging
4. QA testing
5. Deploy to production
```

## Feature Development Workflow

### New Feature

```
1. Create Spec
2. Review Requirements
3. Design Architecture
4. Break Down Tasks
5. Implement
6. Test
7. Document
8. Deploy
```

**Example: Add Search Feature**

**Step 1: Create Spec**
```
"Tạo spec cho search feature:
- Full-text search
- Filter by category
- Sort results
- Pagination
- Search suggestions"
```

**Step 2: Review Requirements**
```markdown
# requirements.md

### US-1: Basic Search
**Là** user
**Tôi muốn** search items by keyword
**Để** tìm nhanh items cần thiết

**Acceptance Criteria:**
- WHEN user enters keyword, system SHALL return matching items
- WHERE keyword < 3 characters, system SHALL not search
- WHEN no results, system SHALL show "No results found"
- WHEN results found, system SHALL highlight matching text
```

**Step 3: Design**
```markdown
# design.md

## Components
- SearchService: Business logic
- SearchRepository: Database queries
- SearchController: API endpoint

## Database
- Add full-text search index
- Use PostgreSQL tsvector

## API
- GET /api/search?q=keyword&category=&sort=&page=
```

**Step 4: Tasks**
```markdown
- [ ] 1. Database setup
- [ ] 2. Implement SearchService
- [ ] 3. Create API endpoint
- [ ] 4. Add tests
- [ ] 5. Update documentation
```

**Step 5-7: Implement, Test, Document**
```
Use Kiro Autopilot or manual implementation
```

### Bug Fix Workflow

```
1. Reproduce Bug → 2. Understand Root Cause → 3. Fix → 4. Test → 5. Deploy
```

**Example: Fix Login Bug**

**Step 1: Reproduce**
```
# Trong chat
"#Problems
Bug: Users can't login with email containing uppercase letters

Steps to reproduce:
1. Register with Test@Example.com
2. Try login with test@example.com
3. Login fails"
```

**Step 2: Understand**
```
"Analyze AuthService.login method and explain why this bug occurs"

Kiro: "The bug occurs because email comparison is case-sensitive.
In register, email is stored as-is: Test@Example.com
In login, we search for: test@example.com
These don't match."
```

**Step 3: Fix**
```
"Fix this bug by normalizing email to lowercase in both register and login"

Kiro: *Updates AuthService*
```typescript
async register(email: string, password: string) {
  const normalizedEmail = email.toLowerCase();
  // ... rest of code
}

async login(email: string, password: string) {
  const normalizedEmail = email.toLowerCase();
  // ... rest of code
}
```

**Step 4: Test**
```
"Add test case for case-insensitive email login"

Kiro: *Creates test*
```typescript
it('should login with case-insensitive email', async () => {
  await authService.register('Test@Example.com', 'password123');
  const result = await authService.login('test@example.com', 'password123');
  expect(result.user.email).toBe('test@example.com');
});
```

**Step 5: Deploy**
```bash
git commit -m "fix: make email login case-insensitive"
```

### Refactoring Workflow

```
1. Identify Code Smell → 2. Plan Refactoring → 3. Refactor → 4. Test → 5. Commit
```

**Example: Refactor Large Controller**

**Step 1: Identify**
```
"#File src/api/controllers/UserController.ts
This controller is too large (500 lines). Suggest refactoring strategy."

Kiro: "Suggestions:
1. Extract validation logic to separate validators
2. Move business logic to UserService
3. Create separate controllers for related features
4. Use middleware for common operations"
```

**Step 2: Plan**
```
"Create refactoring plan following your suggestions"

Kiro: *Creates plan*
```markdown
1. Create UserValidator class
2. Move business logic to UserService
3. Split into:
   - UserProfileController
   - UserSettingsController
   - UserActivityController
4. Create auth middleware
```

**Step 3: Refactor**
```
"Implement refactoring step by step, starting with step 1"
```

**Step 4: Test**
```
"Run all tests to ensure refactoring didn't break anything"
```

**Step 5: Commit**
```bash
git commit -m "refactor: split UserController into smaller controllers"
```

## Code Review Workflow

### Reviewer Workflow

```
1. Read Spec → 2. Review Code → 3. Check Tests → 4. Verify Requirements → 5. Provide Feedback
```

**Step 1: Read Spec**
```
# Open .kiro/specs/feature-name/
- Read requirements.md
- Read design.md
- Understand what should be implemented
```

**Step 2: Review Code**
```
# Trong Kiro
"#Git
Review these changes and check for:
- Code quality
- Following design patterns
- Error handling
- Security issues
- Performance concerns"

Kiro: *Analyzes diff and provides feedback*
```

**Step 3: Check Tests**
```
"Check if tests cover all acceptance criteria in requirements.md"

Kiro: *Compares tests with requirements*
"Coverage analysis:
✅ US-1: Covered by test_create_user
✅ US-2: Covered by test_login
❌ US-3: Missing test for password reset
✅ US-4: Covered by test_update_profile"
```

**Step 4: Verify Requirements**
```
"Verify all requirements in requirements.md are implemented"

Kiro: *Checks implementation against requirements*
```

**Step 5: Provide Feedback**
```
# In PR comments
"Overall looks good! Few suggestions:

1. Add test for US-3 (password reset)
2. Consider adding rate limiting to login endpoint
3. Extract validation logic to separate file

Spec reference: .kiro/specs/user-auth/requirements.md"
```

### Author Workflow

```
1. Address Feedback → 2. Update Code → 3. Update Tests → 4. Update Spec (if needed) → 5. Request Re-review
```

**Step 1-2: Address Feedback**
```
"Implement reviewer's suggestions:
1. Add test for password reset
2. Add rate limiting to login
3. Extract validation logic"
```

**Step 3: Update Tests**
```
"Add missing test for US-3"
```

**Step 4: Update Spec (if needed)**
```
# If requirements changed
Update requirements.md with new requirements
```

**Step 5: Request Re-review**
```
git push
# Comment in PR: "Addressed all feedback, ready for re-review"
```

## Collaboration Patterns

### Pair Programming với Kiro

**Pattern 1: Driver-Navigator**
```
Developer 1 (Driver): Viết code
Developer 2 (Navigator): Review và suggest
Kiro: Generate boilerplate và tests
```

**Example:**
```
Navigator: "Chúng ta cần validate email format"
Driver: "Kiro, add email validation to RegisterSchema"
Kiro: *Adds validation*
Navigator: "Good, now add test for invalid email"
Driver: "Kiro, add test for invalid email format"
Kiro: *Adds test*
```

**Pattern 2: Ping-Pong**
```
Developer 1: Write test
Developer 2: Implement code to pass test
Kiro: Generate additional test cases
```

### Mob Programming với Kiro

**Setup:**
```
1. Team gathers around one screen
2. One person drives (uses Kiro)
3. Team discusses và decides
4. Kiro implements decisions
```

**Example Session:**
```
Team: "Chúng ta cần implement payment processing"
Driver: "Kiro, create spec for payment processing"
Kiro: *Creates spec*
Team: *Reviews và discusses*
Team: "Looks good, let's implement"
Driver: "Kiro, start implementing tasks"
Kiro: *Implements*
Team: *Reviews code together*
```

### Async Collaboration

**Pattern: Spec-First Collaboration**
```
1. Tech Lead creates spec
2. Commits spec to Git
3. Team reviews async
4. Comments on spec file
5. Tech Lead updates spec
6. Approve và start implementation
```

**Example:**
```bash
# Tech Lead
git checkout -b feature/notifications
# Create spec with Kiro
git add .kiro/specs/notifications/
git commit -m "spec: add notification system spec"
git push

# Team members review
# Add comments in PR

# Tech Lead updates
# Update spec based on feedback
git commit -m "spec: update based on team feedback"
git push

# After approval
# Team members implement assigned tasks
```

## Maintenance Workflow

### Update Dependencies

```
1. Check Updates → 2. Review Changes → 3. Update → 4. Test → 5. Fix Issues
```

**Step 1: Check**
```bash
npm outdated
```

**Step 2: Review**
```
"Review breaking changes in these package updates:
- express: 4.18.0 → 5.0.0
- prisma: 5.0.0 → 5.5.0"

Kiro: *Summarizes breaking changes*
```

**Step 3: Update**
```bash
npm update
```

**Step 4: Test**
```bash
npm test
```

**Step 5: Fix**
```
"Fix test failures caused by Express 5.0 breaking changes"

Kiro: *Updates code to work with new version*
```

### Update Specs

```
1. Requirements Change → 2. Update Spec → 3. Update Code → 4. Update Tests
```

**Example:**
```
Product: "We need to add 2FA to login"

Developer:
1. Update requirements.md
   "Add US-6: Two-Factor Authentication"

2. Update design.md
   "Add 2FA service and endpoints"

3. Update tasks.md
   "Add tasks for 2FA implementation"

4. Implement with Kiro

5. Update tests
```

### Documentation Updates

```
# Auto-update with hooks
.kiro/hooks/update-docs.json:
{
  "when": {
    "type": "fileEdited",
    "patterns": ["src/api/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Update OpenAPI spec if API changed"
  }
}
```

## Best Practices

### 1. Commit Specs với Code

```bash
# ✅ Good
git add .kiro/specs/feature-name/
git add src/
git commit -m "feat: implement feature-name"

# ❌ Bad
# Only commit code, forget specs
```

### 2. Keep Specs Updated

```
# When requirements change
1. Update requirements.md
2. Regenerate design.md
3. Regenerate tasks.md
4. Update implementation
```

### 3. Use Branches

```bash
# Feature branch
git checkout -b feature/user-notifications

# Bug fix branch
git checkout -b fix/login-case-sensitive

# Refactor branch
git checkout -b refactor/split-controllers
```

### 4. Small, Focused Commits

```bash
# ✅ Good
git commit -m "feat: add email validation"
git commit -m "test: add email validation tests"
git commit -m "docs: update API documentation"

# ❌ Bad
git commit -m "add feature and fix bugs and update docs"
```

### 5. Review Before Merge

```
# Always review:
- Code changes
- Test coverage
- Spec alignment
- Documentation updates
```

### 6. Use Hooks Wisely

```json
// ✅ Good: Helpful automation
{
  "when": { "type": "fileEdited" },
  "then": { "prompt": "Run linter" }
}

// ❌ Bad: Annoying automation
{
  "when": { "type": "fileEdited" },
  "then": { "prompt": "Rewrite entire file" }
}
```

## Troubleshooting Workflows

### When Kiro Generates Wrong Code

```
1. Check steering files
   → Are they clear and specific?

2. Check spec
   → Are requirements detailed enough?

3. Provide examples
   "Generate code similar to this example: [paste example]"

4. Iterate
   "This is close but needs adjustment: [explain]"
```

### When Tests Fail

```
1. Read error message
   "#Problems Explain this test failure"

2. Understand root cause
   Kiro: *Explains why test fails*

3. Fix
   "Fix the code to make this test pass"

4. Verify
   npm test
```

### When Stuck

```
1. Ask Kiro for help
   "I'm stuck on implementing [feature]. Suggest approach."

2. Review spec
   Read requirements and design again

3. Break down problem
   "Break this complex task into smaller steps"

4. Search documentation
   Use MCP servers to search docs
```

## Kết Luận

Quy trình làm việc hiệu quả với Kiro:
- 📋 Spec-driven development
- 🤝 Team collaboration
- 🔄 Iterative refinement
- ✅ Continuous testing
- 📚 Living documentation

**Key Takeaways:**
- Always start with specs
- Keep specs updated
- Use hooks for automation
- Review code with spec context
- Commit specs with code
- Iterate and refine

---

**Chương tiếp theo**: [Best Practices](./12-best-practices.md)

---

*Bài viết được viết bằng AI 🚀*

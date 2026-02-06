---
layout: post
title: "[AI] Chat và Vibe Coding với Kiro"
summary: "Hướng dẫn sử dụng Vibe mode - cách làm việc linh hoạt và nhanh chóng với Kiro thông qua chat interface"
author: chungnd
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro vibe mode, kiro chat, ai chat coding, rapid prototyping, kiro prompts
permalink: /huong-dan-su-dung-kiro/chat-vibe-coding
usemathjax: false
---

# Chương 4: Chat và Vibe Coding

## Tóm Tắt

Vibe mode là cách làm việc linh hoạt và nhanh chóng với Kiro thông qua chat interface. Phù hợp cho prototyping, khám phá ý tưởng và các tác vụ đơn giản không cần cấu trúc phức tạp.

## Vibe Mode Là Gì?

Vibe mode = Chat-first development

```
Bạn mô tả → Kiro hiểu → Kiro code → Bạn review → Done
```

**Đặc điểm:**
- ⚡ Nhanh, linh hoạt
- 💬 Giao tiếp tự nhiên
- 🔄 Iterate nhanh chóng
- 🎯 Phù hợp cho prototyping

## Khi Nào Dùng Vibe Mode?

### ✅ Phù Hợp
- Prototyping ý tưởng mới
- Thử nghiệm giải pháp
- Quick fixes
- Refactoring nhỏ
- Học và khám phá
- Dự án cá nhân

### ❌ Không Phù Hợp
- Dự án production lớn
- Cần documentation chi tiết
- Làm việc nhóm
- Requirements phức tạp
- Cần theo dõi progress

## Sử Dụng Chat

### Mở Chat Panel
- Click icon chat trên sidebar
- `Ctrl+Shift+K` (Windows/Linux)
- `Cmd+Shift+K` (macOS)

### Basic Chat

**Hỏi về code:**
```
Giải thích function này làm gì?
```

**Request changes:**
```
Refactor function này để dễ đọc hơn
```

**Generate code:**
```
Tạo function để validate email address
```

**Debug:**
```
Tại sao code này bị lỗi?
```

## Context References

### #File - Reference File

```
#File src/user.ts
Thêm method để update user profile
```

Kiro sẽ đọc file và hiểu context.

### #Folder - Reference Folder

```
#Folder src/api
Tạo OpenAPI documentation cho tất cả endpoints
```

### #Codebase - Search Codebase

```
#Codebase
Tìm tất cả nơi sử dụng UserService và list ra
```

### #Problems - Current Problems

```
#Problems
Fix tất cả TypeScript errors trong file này
```

### #Terminal - Terminal Output

```
#Terminal
Giải thích lỗi này và suggest fix
```

### #Git - Git Diff

```
#Git
Review changes và suggest improvements
```

## Prompt Engineering

### 1. Specific và Clear

```
❌ Bad: "Fix this"
✅ Good: "Fix TypeScript error on line 25: Property 'email' does not exist on type 'User'"

❌ Bad: "Make it better"
✅ Good: "Refactor this function to use async/await instead of callbacks"
```

### 2. Provide Context

```
❌ Bad: "Create API"
✅ Good: "Create REST API endpoint POST /api/users that:
- Accepts email and password
- Validates input with Zod
- Hashes password with bcrypt
- Saves to database
- Returns user object"
```

### 3. Break Down Complex Tasks

```
❌ Bad: "Build complete authentication system"
✅ Good:
"Step 1: Create User model with email and password fields"
[Wait for completion]
"Step 2: Create register endpoint"
[Wait for completion]
"Step 3: Create login endpoint"
```

### 4. Specify Tech Stack

```
❌ Bad: "Create web app"
✅ Good: "Create React app with TypeScript, using:
- React Router for routing
- Zustand for state management
- Tailwind CSS for styling
- React Hook Form for forms"
```

### 5. Include Examples

```
"Create function similar to this:
```typescript
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```
but for calculating tax"
```

## Ví Dụ Thực Tế

### Example 1: Create Component

**Prompt:**
```
Tạo React component LoginForm với:
- Email input (required, email validation)
- Password input (required, min 8 chars)
- Submit button
- Error message display
- Loading state
- Use React Hook Form + Zod
- Tailwind CSS styling
```

**Kiro sẽ tạo:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    try {
      // API call here
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <input
          {...register('password')}
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>
      
      {error && <p className="text-red-500">{error}</p>}
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### Example 2: API Endpoint

**Prompt:**
```
#File src/api/routes/users.ts
Thêm endpoint GET /api/users/:id với:
- Validate id là UUID
- Query database
- Return 404 nếu không tìm thấy
- Return user object (exclude password)
- Add error handling
```

### Example 3: Refactoring

**Prompt:**
```
#File src/services/user-service.ts
Refactor code này:
1. Extract validation logic thành separate functions
2. Add JSDoc comments
3. Improve error messages
4. Add logging
```

### Example 4: Testing

**Prompt:**
```
#File src/services/user-service.ts
Tạo unit tests cho UserService với:
- Test successful user creation
- Test validation errors
- Test duplicate email
- Mock database calls
- Use Jest
```

### Example 5: Bug Fix

**Prompt:**
```
#Problems
#File src/components/UserList.tsx
Fix lỗi "Cannot read property 'map' of undefined"
Thêm proper null checking và loading state
```

## Iterate và Refine

### Pattern 1: Generate → Review → Refine

```
1. "Tạo login form"
   → Kiro tạo basic form

2. "Thêm remember me checkbox"
   → Kiro update form

3. "Add forgot password link"
   → Kiro thêm link

4. "Style với Tailwind, modern design"
   → Kiro update styling
```

### Pattern 2: Start Simple → Add Features

```
1. "Tạo todo list app cơ bản"
   → Basic CRUD

2. "Thêm filter: all, active, completed"
   → Add filtering

3. "Thêm local storage persistence"
   → Add persistence

4. "Thêm drag and drop để reorder"
   → Add DnD
```

## Multi-Turn Conversations

Kiro nhớ context trong conversation:

```
You: "Tạo User model với email và password"
Kiro: [Creates model]

You: "Thêm createdAt và updatedAt timestamps"
Kiro: [Updates model]

You: "Tạo validation cho model này"
Kiro: [Creates validation using the model]

You: "Tạo repository để save vào database"
Kiro: [Creates repository using the model]
```

## Best Practices

### 1. One Task At A Time

```
❌ Bad: "Tạo user model, API endpoints, tests, và documentation"
✅ Good: 
  "Tạo user model"
  [Review]
  "Tạo API endpoints"
  [Review]
  "Tạo tests"
```

### 2. Review Before Proceeding

```
1. Kiro generates code
2. You review
3. If good → proceed
4. If issues → ask for fixes
```

### 3. Use Steering Files

```markdown
# .kiro/steering/vibe-guidelines.md

When in vibe mode:
- Always use TypeScript
- Add error handling
- Include JSDoc comments
- Follow naming conventions
```

### 4. Save Important Code

```
Khi Kiro tạo code tốt:
1. Save file
2. Commit to git
3. Tiếp tục iterate
```

## Limitations của Vibe Mode

### 1. Thiếu Documentation
- Không tự động tạo specs
- Khó track requirements
- Thiếu design docs

**Giải pháp**: Chuyển sang Spec mode cho production

### 2. Khó Maintain
- Không có structure rõ ràng
- Khó onboard team members
- Khó track changes

**Giải pháp**: Refactor thành specs sau khi prototype xong

### 3. Context Loss
- Conversation dài → Kiro quên context
- Phải repeat information

**Giải pháp**: 
- Use steering files
- Break into smaller conversations
- Reference files với #File

## Chuyển Từ Vibe Sang Spec

Khi prototype xong và muốn productionize:

```
1. "Tạo spec từ code hiện tại"
   → Kiro analyze code và tạo requirements.md

2. Review và refine requirements

3. "Generate design document"
   → Kiro tạo design.md

4. "Generate implementation tasks"
   → Kiro tạo tasks.md

5. Bây giờ có đầy đủ specs để maintain
```

## Tips và Tricks

### 1. Use Templates

```
"Tạo [component type] theo template:
- Props interface
- State management
- Error handling
- Loading states
- TypeScript strict mode"
```

### 2. Learn From Examples

```
"Tạo component tương tự LoginForm nhưng cho RegisterForm"
```

### 3. Incremental Development

```
"Tạo basic version trước, sau đó thêm features"
```

### 4. Ask For Explanations

```
"Giải thích code này và tại sao dùng pattern này"
```

### 5. Request Alternatives

```
"Suggest 3 cách khác nhau để implement feature này"
```

## Kết Luận

Vibe mode là công cụ mạnh mẽ cho rapid prototyping và learning. Sử dụng đúng lúc sẽ giúp bạn:
- Prototype nhanh chóng
- Thử nghiệm ý tưởng
- Học công nghệ mới
- Quick fixes

Nhưng nhớ chuyển sang Spec mode khi cần structure và documentation cho production.

---

**Chương tiếp theo**: [Specs - Phát Triển Theo Đặc Tả](./05-specs.md)

---

*Bài viết được viết bằng AI 🚀*

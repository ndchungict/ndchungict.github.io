---
layout: post
title: "[AI] Specs - Phát Triển Theo Đặc Tả"
summary: "Tìm hiểu về Specs - tính năng cốt lõi của Kiro cho phép phát triển phần mềm theo quy trình có cấu trúc từ Requirements đến Implementation"
author: leo
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro specs, spec-driven development, requirements, design, tasks, ears format
permalink: /huong-dan-su-dung-kiro/specs-phat-trien-theo-dac-ta
usemathjax: false
---

# Chương 5: Specs - Phát Triển Theo Đặc Tả

## Tóm Tắt

Specs (Specifications) là tính năng cốt lõi của Kiro, cho phép phát triển phần mềm theo quy trình có cấu trúc: Requirements → Design → Implementation. Đây là điểm khác biệt lớn nhất giữa Kiro và các AI coding tools khác.

## Specs Là Gì?

Specs là các tài liệu có cấu trúc giúp chuyển đổi ý tưởng thành kế hoạch thực thi cụ thể:

```
Ý tưởng → Requirements → Design → Tasks → Implementation
```

### Lợi Ích Của Specs

- 📋 **Rõ ràng**: Mọi người hiểu cùng một điều
- 🎯 **Tập trung**: Không bị lạc hướng khi code
- 📊 **Theo dõi**: Biết đã làm được bao nhiêu
- 🤝 **Cộng tác**: Team làm việc đồng bộ
- 📚 **Documentation**: Tự động có tài liệu

## Cấu Trúc Một Spec

Mỗi spec gồm 3 file chính:

```
.kiro/specs/ten-tinh-nang/
├── requirements.md    # Yêu cầu nghiệp vụ
├── design.md         # Thiết kế kỹ thuật
└── tasks.md          # Danh sách công việc
```

### 1. Requirements.md

Định nghĩa **CÁI GÌ** cần xây dựng và **TẠI SAO**.

**Cấu trúc:**
```markdown
# Requirements: [Tên Tính Năng]

## Tổng Quan
Mô tả ngắn gọn về tính năng

## User Stories

### US-1: [Tiêu đề]
**Là** [vai trò]
**Tôi muốn** [hành động]
**Để** [mục đích]

**Acceptance Criteria (EARS format):**
- WHEN [điều kiện], the system SHALL [hành vi]
- IF [điều kiện], THEN [kết quả]
- WHERE [ngữ cảnh], the system SHALL [hành vi]

### US-2: [Tiêu đề tiếp theo]
...

## Non-Functional Requirements
- Performance: [yêu cầu]
- Security: [yêu cầu]
- Scalability: [yêu cầu]
```

**Ví dụ thực tế:**
```markdown
# Requirements: User Authentication

## Tổng Quan
Xây dựng hệ thống đăng nhập/đăng ký cho ứng dụng web

## User Stories

### US-1: Đăng ký tài khoản
**Là** người dùng mới
**Tôi muốn** đăng ký tài khoản bằng email
**Để** có thể sử dụng ứng dụng

**Acceptance Criteria:**
- WHEN người dùng nhập email và password hợp lệ, the system SHALL tạo tài khoản mới
- IF email đã tồn tại, THEN hiển thị thông báo lỗi
- WHERE password < 8 ký tự, the system SHALL từ chối và yêu cầu nhập lại
- WHEN đăng ký thành công, the system SHALL gửi email xác nhận

### US-2: Đăng nhập
**Là** người dùng đã có tài khoản
**Tôi muốn** đăng nhập bằng email/password
**Để** truy cập vào hệ thống

**Acceptance Criteria:**
- WHEN thông tin đăng nhập đúng, the system SHALL chuyển đến trang chủ
- IF sai password 3 lần, THEN khóa tài khoản 15 phút
- WHERE tài khoản chưa xác nhận email, the system SHALL yêu cầu xác nhận

## Non-Functional Requirements
- Performance: Thời gian đăng nhập < 2 giây
- Security: Password phải được hash bằng bcrypt
- Scalability: Hỗ trợ 10,000 concurrent users
```

### 2. Design.md

Định nghĩa **LÀM THẾ NÀO** để xây dựng.

**Cấu trúc:**
```markdown
# Design: [Tên Tính Năng]

## Architecture Overview
Mô tả kiến trúc tổng thể

## Components

### Component 1: [Tên]
- **Responsibility**: [Trách nhiệm]
- **Technology**: [Công nghệ sử dụng]
- **Interfaces**: [API/Methods]

### Component 2: [Tên]
...

## Data Models
```typescript
interface User {
  id: string;
  email: string;
  // ...
}
```

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`

## Security Considerations
- [Các vấn đề bảo mật]

## Testing Strategy
- Unit tests
- Integration tests
- E2E tests
```

**Ví dụ thực tế:**
```markdown
# Design: User Authentication

## Architecture Overview
Sử dụng JWT-based authentication với refresh token pattern.
Backend: Node.js + Express, Database: PostgreSQL

## Components

### 1. Auth Controller
- **Responsibility**: Xử lý HTTP requests cho auth
- **Technology**: Express.js
- **Methods**:
  - `register(req, res)`
  - `login(req, res)`
  - `logout(req, res)`
  - `refreshToken(req, res)`

### 2. Auth Service
- **Responsibility**: Business logic cho authentication
- **Technology**: TypeScript
- **Methods**:
  - `createUser(email, password)`
  - `validateCredentials(email, password)`
  - `generateTokens(userId)`

### 3. User Repository
- **Responsibility**: Database operations
- **Technology**: TypeORM
- **Methods**:
  - `findByEmail(email)`
  - `create(userData)`
  - `update(userId, data)`

## Data Models

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}
```

## API Endpoints

### POST /api/auth/register
Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```
Response:
```json
{
  "user": { "id": "...", "email": "..." },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### POST /api/auth/login
[Tương tự...]

## Security Considerations
- Password hash: bcrypt với cost factor 12
- JWT secret: Lưu trong environment variables
- Refresh token: Lưu trong httpOnly cookie
- Rate limiting: 5 requests/minute cho login endpoint

## Testing Strategy
- Unit tests: Auth Service với mock repository
- Integration tests: API endpoints với test database
- E2E tests: Full user flow từ register đến login
```

### 3. Tasks.md

Danh sách công việc cụ thể để implement.

**Cấu trúc:**
```markdown
# Implementation Plan

- [ ] 1. Setup project structure
  - [ ] 1.1 Initialize Node.js project
  - [ ] 1.2 Install dependencies
  - _Requirements: 3.1_

- [ ] 2. Implement authentication
  - [ ] 2.1 Create User model
  - [ ] 2.2 Implement register endpoint
  - [ ] 2.3 Implement login endpoint
  - _Requirements: US-1, US-2_

- [ ] 3. Add tests
  - [ ] 3.1 Unit tests for Auth Service
  - [ ] 3.2 Integration tests for API
  - _Requirements: Testing Strategy_
```

## Quy Trình Làm Việc Với Specs

### Bước 1: Tạo Spec Mới

**Cách 1: Từ Kiro Panel**
1. Click nút **+** trong Specs panel
2. Nhập tên spec (vd: `user-authentication`)
3. Mô tả ngắn gọn tính năng

**Cách 2: Từ Command Palette**
```
Ctrl+Shift+P → Kiro: Create New Spec
```

**Cách 3: Từ Chat**
```
Tạo spec mới cho tính năng đăng nhập người dùng
```

### Bước 2: Viết Requirements

1. Mở file `requirements.md`
2. Viết user stories theo format EARS
3. Click **Refine** để Kiro cải thiện

**Tips viết Requirements tốt:**
- ✅ Cụ thể, đo lường được
- ✅ Tập trung vào "cái gì", không phải "làm sao"
- ✅ Có acceptance criteria rõ ràng
- ❌ Tránh mơ hồ, chung chung
- ❌ Không nhắc đến implementation details

### Bước 3: Generate Design

1. Chuyển sang tab **Design**
2. Click **Refine**
3. Kiro sẽ:
   - Đọc requirements
   - Tham khảo steering files
   - Tạo thiết kế kỹ thuật

4. Review và chỉnh sửa nếu cần

### Bước 4: Generate Tasks

1. Chuyển sang tab **Tasks**
2. Click **Refine**
3. Kiro tạo danh sách tasks với:
   - Dependencies giữa các tasks
   - Ước lượng độ phức tạp
   - Link đến requirements

### Bước 5: Implement

**Autopilot Mode:**
```
Click "Start Tasks" → Kiro tự động implement
```

**Manual Mode:**
```
Click từng task → Review → Approve → Next
```

**Hybrid Mode:**
```
Để Kiro làm tasks đơn giản
Tự làm tasks phức tạp
```

## EARS Format Chi Tiết

EARS (Easy Approach to Requirements Syntax) giúp viết requirements rõ ràng.

### Các Pattern Cơ Bản

#### 1. Ubiquitous (Luôn luôn)
```
The system SHALL [hành vi]
```
Ví dụ:
```
The system SHALL log all authentication attempts
```

#### 2. Event-Driven (Khi có sự kiện)
```
WHEN [trigger], the system SHALL [response]
```
Ví dụ:
```
WHEN user clicks "Login", the system SHALL validate credentials
```

#### 3. State-Driven (Phụ thuộc trạng thái)
```
WHILE [state], the system SHALL [behavior]
```
Ví dụ:
```
WHILE user is logged in, the system SHALL display logout button
```

#### 4. Optional (Tùy chọn)
```
WHERE [condition], the system SHALL [behavior]
```
Ví dụ:
```
WHERE user has admin role, the system SHALL show admin panel
```

#### 5. Unwanted (Không mong muốn)
```
IF [condition], THEN the system SHALL [response]
```
Ví dụ:
```
IF password is incorrect, THEN the system SHALL display error message
```

## Best Practices

### 1. Đầu Tư Thời Gian Vào Requirements
```
❌ Sai: "Làm tính năng login"
✅ Đúng: Viết chi tiết 5-10 user stories với acceptance criteria
```

Lý do: Requirements tốt → Design tốt → Code tốt

### 2. Sử Dụng Steering Files
```markdown
# .kiro/steering/tech.md
- Luôn sử dụng TypeScript
- API phải có validation với Zod
- Mọi endpoint phải có rate limiting
```

Kiro sẽ áp dụng các quy tắc này vào design.

### 3. Chia Nhỏ Tasks
```
❌ Sai: "Implement authentication" (quá lớn)
✅ Đúng:
  - Setup database schema
  - Create User model
  - Implement register endpoint
  - Add validation
  - Write tests
```

### 4. Link Requirements Với Tasks
```markdown
- [ ] 2.1 Create User model
  - _Requirements: US-1, US-2, Data Models_
```

Giúp theo dõi coverage.

### 5. Review Trước Khi Implement
```
Requirements → Review → Design → Review → Tasks → Review → Implement
```

Sửa ở giai đoạn đầu rẻ hơn sửa sau khi code.

## Làm Việc Nhóm Với Specs

### Phân Công Công Việc

```markdown
# tasks.md
- [ ] 1. Backend API
  - Assignee: @john
  - [ ] 1.1 Setup Express
  - [ ] 1.2 Create endpoints

- [ ] 2. Frontend UI
  - Assignee: @jane
  - [ ] 2.1 Create login form
  - [ ] 2.2 Integrate API
```

### Code Review

1. Reviewer xem spec để hiểu context
2. Kiểm tra code có match với design không
3. Verify acceptance criteria đã đáp ứng

### Update Specs Khi Thay Đổi

```bash
# Khi có thay đổi requirements
git commit -m "Update auth spec: Add OAuth support"

# Kiro sẽ detect và suggest update design/tasks
```

## Ví Dụ Hoàn Chỉnh

### Spec: Weather Forecast App

**requirements.md:**
```markdown
# Requirements: Weather Forecast App

## Tổng Quan
Ứng dụng hiển thị dự báo thời tiết cho 4 thành phố: Oslo, Paris, London, Barcelona

## User Stories

### US-1: Xem thời tiết
**Là** người dùng
**Tôi muốn** xem thời tiết ngày mai của 4 thành phố
**Để** lên kế hoạch du lịch

**Acceptance Criteria:**
- WHEN trang load, the system SHALL hiển thị thời tiết 4 thành phố
- WHERE dữ liệu < 1 giờ, the system SHALL dùng cache
- IF API lỗi, THEN hiển thị thông báo lỗi thân thiện

### US-2: Responsive design
**Là** người dùng mobile
**Tôi muốn** xem được trên điện thoại
**Để** tiện tra cứu khi di chuyển

**Acceptance Criteria:**
- WHEN màn hình < 768px, the system SHALL hiển thị 1 cột
- WHEN màn hình >= 768px, the system SHALL hiển thị 2x2 grid

## Non-Functional Requirements
- Performance: Load time < 2s
- Caching: 1 giờ cho weather data
- API: Sử dụng met.no (free, no API key)
```

**design.md:**
```markdown
# Design: Weather Forecast App

## Architecture
- Frontend: React + TypeScript
- Backend: AWS Lambda + API Gateway
- Cache: DynamoDB
- CDN: CloudFront
- IaC: Terraform

## Components

### 1. Lambda Function
```typescript
export async function handler(event: APIGatewayEvent) {
  // Check cache
  // Fetch from met.no if needed
  // Return weather data
}
```

### 2. React App
```typescript
function WeatherApp() {
  const { data, loading, error } = useWeatherData();
  return <WeatherGrid cities={data} />;
}
```

## Data Flow
```
User → CloudFront → API Gateway → Lambda
                                    ↓
                                DynamoDB (cache)
                                    ↓
                                met.no API
```

## API Endpoints
- GET /api/weather → Returns weather for all cities
- GET /health → Health check
```

**tasks.md:**
```markdown
# Implementation Plan

- [ ] 1. Setup infrastructure
  - [ ] 1.1 Create Terraform modules
  - [ ] 1.2 Setup DynamoDB table
  - [ ] 1.3 Create Lambda function
  - [ ] 1.4 Configure API Gateway

- [ ] 2. Implement Lambda
  - [ ] 2.1 Weather API integration
  - [ ] 2.2 Caching logic
  - [ ] 2.3 Error handling

- [ ] 3. Build frontend
  - [ ] 3.1 Create React components
  - [ ] 3.2 API integration
  - [ ] 3.3 Responsive styling

- [ ] 4. Deploy
  - [ ] 4.1 Deploy infrastructure
  - [ ] 4.2 Deploy frontend to S3
  - [ ] 4.3 Configure CloudFront
```

## Troubleshooting

### Kiro không generate design tốt

**Nguyên nhân**: Requirements không đủ chi tiết hoặc steering files thiếu

**Giải pháp**:
1. Bổ sung acceptance criteria
2. Thêm non-functional requirements
3. Update steering files với tech stack

### Tasks quá lớn hoặc quá nhỏ

**Giải pháp**:
```
# Trong chat
"Hãy chia task 2.1 thành các subtasks nhỏ hơn"
"Hãy gộp tasks 3.1, 3.2, 3.3 thành một task"
```

### Specs không sync với code

**Giải pháp**:
```
# Sau khi thay đổi code manually
"Hãy cập nhật spec để phản ánh những thay đổi tôi vừa làm"
```

## Kết Luận

Specs là trái tim của Kiro, giúp phát triển phần mềm có cấu trúc và dễ quản lý. Đầu tư thời gian vào việc viết specs tốt sẽ tiết kiệm rất nhiều thời gian ở giai đoạn implementation và maintenance.

---

**Chương tiếp theo**: [Steering - Hướng Dẫn AI](./06-steering.md)

---

*Bài viết được viết bằng AI 🚀*

---
layout: post
title: "[AI] Powers - Mở Rộng Khả Năng"
summary: "Tìm hiểu về Powers - hệ thống plugin của Kiro cho phép mở rộng khả năng của AI agent với kiến thức chuyên môn và công cụ"
author: leo
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro powers, kiro plugins, mcp servers, aws power, terraform power
permalink: /huong-dan-su-dung-kiro/powers-mo-rong-kha-nang
usemathjax: false
---

# Chương 8: Powers - Mở Rộng Khả Năng

## Tóm Tắt

Powers là hệ thống plugin của Kiro, cho phép mở rộng khả năng của AI agent với kiến thức chuyên môn, công cụ và workflows cho các công nghệ cụ thể. Powers giúp Kiro hiểu sâu về các framework, cloud services, và best practices.

## Powers Là Gì?

Powers = Documentation + Tools + Workflows + MCP Servers

```
Power = {
  POWER.md: Hướng dẫn và documentation
  steering/: Workflow guides chi tiết
  mcp.json: MCP servers configuration (optional)
}
```

**Ví dụ:**
- **AWS Power**: Kiến thức về AWS services, best practices, MCP servers
- **React Power**: React patterns, hooks, component design
- **Terraform Power**: IaC best practices, module structure

## Tại Sao Cần Powers?

### Không Có Powers
```
Bạn: "Deploy app lên AWS với best practices"
Kiro: *Tạo code generic, không tối ưu*
```

### Có Powers
```
Bạn: "Deploy app lên AWS với best practices"
Kiro: *Activate AWS Power*
      *Đọc AWS documentation*
      *Áp dụng Well-Architected Framework*
      *Sử dụng AWS MCP servers*
      *Tạo infrastructure theo chuẩn AWS*
```

## Cài Đặt Powers

### Cách 1: Từ Powers Panel

1. Click biểu tượng **Ghost** (👻) trên sidebar
2. Chọn tab **Powers**
3. Click **Browse Powers**
4. Tìm và click **Install** power cần dùng

### Cách 2: Command Palette

```
Ctrl+Shift+P → Kiro: Configure Powers
```

### Cách 3: Manual Installation

```bash
# Clone power repository
cd ~/.kiro/powers
git clone https://github.com/kirodotdev/powers/aws-power

# Hoặc download và extract
```

## Powers Phổ Biến

### 1. AWS Power

**Chức năng:**
- AWS services documentation
- Well-Architected Framework
- Cost optimization
- Security best practices
- MCP servers: AWS Docs, API, Pricing, Diagram

**Khi nào dùng:**
- Deploy lên AWS
- Thiết kế cloud architecture
- Cost optimization
- Security audit

**Activation:**
```
# Tự động activate khi mention AWS keywords
"Tạo Lambda function với API Gateway"

# Hoặc manual
"#aws-power Deploy serverless app"
```

### 2. React Power

**Chức năng:**
- React best practices
- Hooks patterns
- Component design
- Performance optimization
- Testing strategies

**Khi nào dùng:**
- Xây dựng React apps
- Component refactoring
- Performance tuning

**Activation:**
```
"Tạo React component với hooks"
"Optimize React app performance"
```

### 3. Terraform Power

**Chức năng:**
- IaC best practices
- Module structure
- State management
- Testing strategies
- MCP server: Terraform docs, validation

**Khi nào dùng:**
- Infrastructure as Code
- Multi-environment setup
- Module development

**Activation:**
```
"Tạo Terraform module cho VPC"
"Setup Terraform backend với S3"
```

### 4. Testing Power

**Chức năng:**
- Test frameworks setup
- Testing patterns
- Coverage strategies
- CI/CD integration

**Khi nào dùng:**
- Setup test framework
- Write test cases
- Improve test coverage

**Activation:**
```
"Setup Playwright test framework"
"Generate test cases for API"
```

### 5. Python Power

**Chức năng:**
- Python best practices
- Package management
- Virtual environments
- Testing with pytest

**Activation:**
```
"Create Python FastAPI application"
"Setup pytest with fixtures"
```

### 6. Docker Power

**Chức năng:**
- Dockerfile best practices
- Multi-stage builds
- Docker Compose
- Container optimization

**Activation:**
```
"Create optimized Dockerfile for Node.js"
"Setup Docker Compose for microservices"
```

## Cấu Trúc Một Power

### POWER.md

```markdown
---
name: aws-power
displayName: AWS Power
description: AWS services and best practices
keywords: [aws, lambda, s3, dynamodb, cloudformation]
version: 1.0.0
---

# AWS Power

## Overview
This power provides comprehensive AWS knowledge and tools.

## Getting Started

### 1. Install AWS CLI
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 2. Configure Credentials
```bash
aws configure
```

### 3. Verify Setup
```bash
aws sts get-caller-identity
```

## Best Practices

### Lambda Functions
- Use environment variables for configuration
- Implement proper error handling
- Set appropriate timeout and memory
- Use layers for dependencies

### S3 Buckets
- Enable versioning for important data
- Use lifecycle policies
- Implement proper IAM policies
- Enable encryption at rest

### DynamoDB
- Design partition keys carefully
- Use GSI for additional access patterns
- Enable point-in-time recovery
- Monitor capacity usage

## Common Patterns

### Serverless API
```typescript
// Lambda handler
export async function handler(event: APIGatewayEvent) {
  try {
    // Business logic
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
```

### S3 Event Processing
```typescript
export async function handler(event: S3Event) {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;
    // Process file
  }
}
```

## Troubleshooting

### Lambda Timeout
- Increase timeout setting
- Optimize code performance
- Use async operations

### S3 Access Denied
- Check IAM policies
- Verify bucket policies
- Check CORS configuration
```

### Steering Files

```
aws-power/
├── POWER.md
├── steering/
│   ├── lambda-best-practices.md
│   ├── s3-patterns.md
│   ├── dynamodb-design.md
│   └── security.md
└── mcp.json
```

**lambda-best-practices.md:**
```markdown
---
inclusion: fileMatch
fileMatchPattern: '**/lambda/**/*.ts'
---

# Lambda Best Practices

## Function Structure
```typescript
// ✅ Good: Separate handler from business logic
export async function handler(event: APIGatewayEvent) {
  return await processRequest(event);
}

async function processRequest(event: APIGatewayEvent) {
  // Business logic here
}

// ❌ Bad: Everything in handler
export async function handler(event: APIGatewayEvent) {
  // 100 lines of code here
}
```

## Environment Variables
```typescript
// ✅ Good: Validate env vars
const TABLE_NAME = process.env.TABLE_NAME;
if (!TABLE_NAME) {
  throw new Error('TABLE_NAME not set');
}

// ❌ Bad: No validation
const table = process.env.TABLE_NAME;
```

## Error Handling
```typescript
// ✅ Good: Proper error responses
try {
  const result = await dynamodb.get(params);
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
} catch (error) {
  logger.error('DynamoDB error:', error);
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Internal server error' })
  };
}
```
```

### MCP Configuration

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "aws-api": {
      "command": "uvx",
      "args": ["awslabs.aws-api-mcp-server@latest"]
    },
    "aws-pricing": {
      "command": "uvx",
      "args": ["awslabs.aws-pricing-mcp-server@latest"]
    }
  }
}
```

## Sử Dụng Powers

### Activate Power

**Tự động (Keyword-based):**
```
# Kiro tự động activate khi detect keywords
"Create Lambda function"  → AWS Power activated
"Build React component"   → React Power activated
"Write Terraform module"  → Terraform Power activated
```

**Thủ công:**
```
# Trong chat
#aws-power Thiết kế serverless architecture

# Hoặc
"Activate AWS power và giúp tôi deploy app"
```

### List Installed Powers

```
Command Palette → Kiro: List Powers
```

Hoặc trong chat:
```
"List các powers đã cài đặt"
```

### Read Steering Files

```
# Kiro tự động đọc steering files khi power activated
# Hoặc manual:
"#aws-power/lambda-best-practices Tạo Lambda function"
```

## Tạo Custom Power

### Bước 1: Tạo Cấu Trúc

```bash
mkdir my-custom-power
cd my-custom-power
touch POWER.md
mkdir steering
```

### Bước 2: Viết POWER.md

```markdown
---
name: my-company-power
displayName: My Company Standards
description: Company coding standards and practices
keywords: [company, standards, practices]
version: 1.0.0
---

# My Company Power

## Overview
Internal coding standards and best practices.

## Tech Stack
- Backend: Node.js + TypeScript
- Frontend: React + TypeScript
- Database: PostgreSQL
- Cloud: AWS

## Coding Standards

### Naming Conventions
- Files: kebab-case
- Classes: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE

### Error Handling
Always use custom error classes:
```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### API Design
- RESTful conventions
- Versioning: /api/v1/
- Authentication: JWT
- Rate limiting: 100 req/min
```

### Bước 3: Tạo Steering Files

```bash
# steering/api-design.md
---
inclusion: fileMatch
fileMatchPattern: '**/api/**/*.ts'
---

# API Design Standards

## Endpoint Structure
```
GET    /api/v1/users      - List users
POST   /api/v1/users      - Create user
GET    /api/v1/users/:id  - Get user
PUT    /api/v1/users/:id  - Update user
DELETE /api/v1/users/:id  - Delete user
```

## Response Format
```typescript
// Success
{
  "data": { ... },
  "meta": { ... }
}

// Error
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```
```

### Bước 4: Install Power

```bash
# Copy to powers directory
cp -r my-custom-power ~/.kiro/powers/

# Hoặc symlink
ln -s /path/to/my-custom-power ~/.kiro/powers/my-company-power
```

### Bước 5: Test Power

```
# Trong Kiro chat
"#my-company-power Tạo API endpoint cho users"
```

## Powers Cho Team

### Shared Powers Repository

```bash
# Tạo team powers repo
git init team-kiro-powers
cd team-kiro-powers

# Tạo powers
mkdir aws-power
mkdir react-power
mkdir company-standards

# Commit và push
git add .
git commit -m "Initial team powers"
git push
```

### Sử Dụng Trong Team

**Option 1: Git Submodule**
```bash
cd ~/.kiro/powers
git submodule add https://github.com/team/kiro-powers
```

**Option 2: Clone**
```bash
cd ~/.kiro/powers
git clone https://github.com/team/kiro-powers
```

**Option 3: Symlink**
```bash
ln -s /shared/team-powers ~/.kiro/powers/team
```

## Best Practices

### 1. Specific Keywords

```markdown
❌ Bad: Generic keywords
keywords: [code, programming, development]

✅ Good: Specific keywords
keywords: [aws, lambda, s3, dynamodb, cloudformation, cdk]
```

### 2. Clear Documentation

```markdown
# ✅ Good: Step-by-step with examples
## Setup Lambda Function

1. Create handler file:
```typescript
export async function handler(event) {
  // Your code
}
```

2. Configure in template:
```yaml
Resources:
  MyFunction:
    Type: AWS::Lambda::Function
```

# ❌ Bad: Vague
## Lambda
Create Lambda functions properly.
```

### 3. Conditional Steering

```markdown
---
inclusion: fileMatch
fileMatchPattern: '**/lambda/**/*.ts'
---
# Only loaded when working with Lambda files
```

### 4. Include Examples

```markdown
## Pattern: API Gateway + Lambda

```typescript
// Example implementation
export async function handler(event: APIGatewayEvent) {
  const { httpMethod, path, body } = event;
  
  switch (httpMethod) {
    case 'GET':
      return handleGet(path);
    case 'POST':
      return handlePost(JSON.parse(body));
    default:
      return { statusCode: 405 };
  }
}
```
```

### 5. Version Control

```markdown
---
version: 1.2.0
---

# Changelog
## 1.2.0
- Added Lambda Layers guide
- Updated security practices

## 1.1.0
- Added DynamoDB patterns
```

## Official Powers

### Browse Official Powers

```
https://github.com/kirodotdev/powers
```

**Available Powers:**
- aws-power
- react-power
- terraform-power
- python-power
- docker-power
- kubernetes-power
- testing-power
- security-power

### Install Official Power

```bash
cd ~/.kiro/powers
git clone https://github.com/kirodotdev/powers/aws-power
```

## Troubleshooting

### Power Không Activate

**Kiểm tra:**
1. Power có trong `~/.kiro/powers/`?
2. POWER.md có đúng format?
3. Keywords có match với prompt?

**Debug:**
```
# Trong chat
"List active powers"
"Activate aws-power manually"
```

### Steering Files Không Load

**Kiểm tra:**
1. File có trong `steering/` directory?
2. Frontmatter có đúng?
3. File pattern có match?

**Test:**
```
# Trong chat
"#aws-power/lambda-best-practices Show me Lambda patterns"
```

### MCP Servers Không Kết Nối

**Kiểm tra:**
```bash
# Verify uvx
uvx --version

# Test MCP server
uvx awslabs.aws-documentation-mcp-server@latest
```

**Fix:**
```bash
pip install --upgrade uv
```

## Advanced Patterns

### Power Composition

```
# Combine multiple powers
"#aws-power #terraform-power Deploy infrastructure"
```

### Dynamic Power Loading

```typescript
// In POWER.md
## Dynamic Loading
This power loads additional context based on:
- File type being edited
- Current task in spec
- User's explicit request
```

### Power Dependencies

```markdown
---
name: my-power
dependencies:
  - aws-power
  - terraform-power
---

# My Power
This power requires AWS and Terraform powers.
```

## Kết Luận

Powers mở rộng khả năng của Kiro với:
- 📚 Kiến thức chuyên môn
- 🛠️ Tools và MCP servers
- 📋 Workflows và patterns
- 🎯 Best practices

**Tips:**
- Install powers cho tech stack bạn dùng
- Tạo company power cho team standards
- Keep powers updated
- Contribute to community powers

---

**Chương tiếp theo**: [MCP Servers - Tích Hợp Công Cụ](./09-mcp-servers.md)

---

*Bài viết được viết bằng AI 🚀*

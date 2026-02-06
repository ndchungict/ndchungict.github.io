---
layout: post
title: "[AI] API Testing Với Kiro"
summary: "Hướng dẫn chi tiết cách sử dụng Kiro để tạo và quản lý API test suite với REST API testing và contract testing"
author: chungnd
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: api testing, rest api testing, supertest, api automation, schema validation
permalink: /huong-dan-su-dung-kiro/api-testing
usemathjax: false
---

# Chương 17: API Testing Với Kiro

## Tóm Tắt

Hướng dẫn chi tiết cách sử dụng Kiro để tạo và quản lý API test suite, bao gồm REST API testing, GraphQL testing, và API contract testing.

## Tạo API Test Suite

### Spec Cho API Testing

**requirements.md:**
```markdown
# Requirements: API Test Suite

## Test Coverage
- All REST endpoints
- Request/Response validation
- Authentication/Authorization
- Error handling
- Rate limiting
- Performance testing

## Test Scenarios

### TS-1: GET /api/users
**Given** valid authentication token
**When** request GET /api/users
**Then** should return 200 status
**And** response should match schema
**And** response time < 500ms

### TS-2: POST /api/users - Success
**Given** valid user data
**When** request POST /api/users
**Then** should return 201 status
**And** should create user in database
**And** response should include user id

### TS-3: POST /api/users - Validation Error
**Given** invalid email format
**When** request POST /api/users
**Then** should return 400 status
**And** error message should indicate invalid email

### TS-4: Authentication Required
**Given** no auth token
**When** request any protected endpoint
**Then** should return 401 status
**And** error message should indicate unauthorized
```

## Test Framework Setup

### Prompt Cho Kiro

```
Tạo API test framework với:

1. Framework: Jest + Supertest
2. TypeScript support
3. Test structure:
   - Request builders
   - Response validators
   - Schema validation
   - Test data factories
4. Features:
   - Authentication helpers
   - Database seeding
   - API mocking
   - Test reporting
```

### Generated Structure

```
tests/
├── api/
│   ├── auth.spec.ts
│   ├── users.spec.ts
│   └── posts.spec.ts
├── helpers/
│   ├── ApiClient.ts
│   ├── AuthHelper.ts
│   └── DatabaseHelper.ts
├── schemas/
│   ├── UserSchema.ts
│   └── PostSchema.ts
├── fixtures/
│   ├── users.json
│   └── posts.json
└── setup.ts
```

## API Test Examples

### 1. Basic GET Request

```typescript
// tests/api/users.spec.ts
import request from 'supertest';
import { app } from '../../src/app';
import { AuthHelper } from '../helpers/AuthHelper';

describe('GET /api/users', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await AuthHelper.getValidToken();
  });

  it('should return list of users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users.length).toBeGreaterThan(0);
  });

  it('should return 401 without auth token', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(401);

    expect(response.body.error).toBe('Unauthorized');
  });

  it('should respond within 500ms', async () => {
    const start = Date.now();
    
    await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

### 2. POST Request With Validation

```typescript
describe('POST /api/users', () => {
  it('should create user with valid data', async () => {
    const newUser = {
      email: 'newuser@example.com',
      password: 'SecurePass123',
      name: 'New User'
    };

    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newUser)
      .expect(201);

    expect(response.body).toMatchObject({
      email: newUser.email,
      name: newUser.name
    });
    expect(response.body).toHaveProperty('id');
    expect(response.body).not.toHaveProperty('password');
  });

  it('should return 400 with invalid email', async () => {
    const invalidUser = {
      email: 'invalid-email',
      password: 'SecurePass123'
    };

    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidUser)
      .expect(400);

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        field: 'email',
        message: expect.stringContaining('Invalid email')
      })
    );
  });

  it('should return 400 with weak password', async () => {
    const weakPasswordUser = {
      email: 'user@example.com',
      password: '123'
    };

    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(weakPasswordUser)
      .expect(400);

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        field: 'password',
        message: expect.stringContaining('at least 8 characters')
      })
    );
  });
});
```

### 3. PUT/PATCH Request

```typescript
describe('PUT /api/users/:id', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await UserFactory.create();
    userId = user.id;
  });

  it('should update user', async () => {
    const updates = {
      name: 'Updated Name',
      bio: 'New bio'
    };

    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updates)
      .expect(200);

    expect(response.body.name).toBe(updates.name);
    expect(response.body.bio).toBe(updates.bio);
  });

  it('should return 404 for non-existent user', async () => {
    const fakeId = 'non-existent-id';

    await request(app)
      .put(`/api/users/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test' })
      .expect(404);
  });

  it('should return 403 when updating other user', async () => {
    const otherUserToken = await AuthHelper.getTokenForUser('other@example.com');

    await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ name: 'Hacked' })
      .expect(403);
  });
});
```

### 4. DELETE Request

```typescript
describe('DELETE /api/users/:id', () => {
  it('should delete user', async () => {
    const user = await UserFactory.create();

    await request(app)
      .delete(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    // Verify user is deleted
    const checkResponse = await request(app)
      .get(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('should require admin role', async () => {
    const user = await UserFactory.create();

    await request(app)
      .delete(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${regularUserToken}`)
      .expect(403);
  });
});
```

## Schema Validation

### Define Schemas

```typescript
// tests/schemas/UserSchema.ts
import Ajv from 'ajv';

const ajv = new Ajv();

export const UserSchema = {
  type: 'object',
  required: ['id', 'email', 'name', 'createdAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    name: { type: 'string', minLength: 1 },
    bio: { type: 'string' },
    role: { type: 'string', enum: ['user', 'admin'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  additionalProperties: false
};

export const validateUser = ajv.compile(UserSchema);

// Helper
export function expectValidUser(data: any) {
  const valid = validateUser(data);
  if (!valid) {
    throw new Error(`Invalid user schema: ${JSON.stringify(validateUser.errors)}`);
  }
}
```

### Use In Tests

```typescript
import { expectValidUser } from '../schemas/UserSchema';

it('should return valid user schema', async () => {
  const response = await request(app)
    .get('/api/users/123')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);

  expectValidUser(response.body);
});
```

## Test Helpers

### API Client Helper

```typescript
// tests/helpers/ApiClient.ts
import request from 'supertest';
import { app } from '../../src/app';

export class ApiClient {
  private authToken?: string;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  async get(path: string, expectedStatus = 200) {
    const req = request(app).get(path);
    
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    
    return req.expect(expectedStatus);
  }

  async post(path: string, data: any, expectedStatus = 201) {
    const req = request(app).post(path).send(data);
    
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    
    return req.expect(expectedStatus);
  }

  async put(path: string, data: any, expectedStatus = 200) {
    const req = request(app).put(path).send(data);
    
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    
    return req.expect(expectedStatus);
  }

  async delete(path: string, expectedStatus = 204) {
    const req = request(app).delete(path);
    
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    
    return req.expect(expectedStatus);
  }
}
```

### Auth Helper

```typescript
// tests/helpers/AuthHelper.ts
import jwt from 'jsonwebtoken';
import { UserFactory } from '../factories/UserFactory';

export class AuthHelper {
  static async getValidToken(role: 'user' | 'admin' = 'user'): Promise<string> {
    const user = await UserFactory.create({ role });
    return this.generateToken(user.id, role);
  }

  static generateToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  }

  static async getTokenForUser(email: string): Promise<string> {
    const user = await UserFactory.findByEmail(email);
    return this.generateToken(user.id, user.role);
  }
}
```

### Database Helper

```typescript
// tests/helpers/DatabaseHelper.ts
import { prisma } from '../../src/lib/prisma';

export class DatabaseHelper {
  static async clearDatabase() {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  }

  static async seedTestData() {
    await UserFactory.createBatch(10);
    await PostFactory.createBatch(20);
  }

  static async resetDatabase() {
    await this.clearDatabase();
    await this.seedTestData();
  }
}
```

## Advanced Testing Patterns

### 1. Pagination Testing

```typescript
describe('GET /api/users - Pagination', () => {
  beforeAll(async () => {
    await UserFactory.createBatch(50);
  });

  it('should return first page', async () => {
    const response = await request(app)
      .get('/api/users?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.users).toHaveLength(10);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 50,
      totalPages: 5
    });
  });

  it('should return last page', async () => {
    const response = await request(app)
      .get('/api/users?page=5&limit=10')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.users).toHaveLength(10);
    expect(response.body.pagination.page).toBe(5);
  });
});
```

### 2. Filtering Testing

```typescript
describe('GET /api/users - Filtering', () => {
  it('should filter by role', async () => {
    await UserFactory.create({ role: 'admin' });
    await UserFactory.create({ role: 'user' });

    const response = await request(app)
      .get('/api/users?role=admin')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.users.every(u => u.role === 'admin')).toBe(true);
  });

  it('should filter by multiple criteria', async () => {
    const response = await request(app)
      .get('/api/users?role=admin&status=active')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.users.every(u => 
      u.role === 'admin' && u.status === 'active'
    )).toBe(true);
  });
});
```

### 3. Sorting Testing

```typescript
describe('GET /api/users - Sorting', () => {
  it('should sort by createdAt descending', async () => {
    const response = await request(app)
      .get('/api/users?sort=-createdAt')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const dates = response.body.users.map(u => new Date(u.createdAt));
    const sorted = [...dates].sort((a, b) => b.getTime() - a.getTime());
    
    expect(dates).toEqual(sorted);
  });
});
```

### 4. Rate Limiting Testing

```typescript
describe('Rate Limiting', () => {
  it('should rate limit after 100 requests', async () => {
    const requests = Array(101).fill(null).map(() =>
      request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
    );

    const responses = await Promise.all(requests);
    const lastResponse = responses[responses.length - 1];

    expect(lastResponse.status).toBe(429);
    expect(lastResponse.body.error).toContain('Too many requests');
  });
});
```

## Contract Testing

### OpenAPI Validation

```typescript
import SwaggerParser from '@apidevtools/swagger-parser';
import { validateAgainstSchema } from 'openapi-validator';

describe('API Contract Tests', () => {
  let apiSpec: any;

  beforeAll(async () => {
    apiSpec = await SwaggerParser.validate('./docs/openapi.yaml');
  });

  it('GET /api/users should match OpenAPI spec', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const errors = validateAgainstSchema(
      response.body,
      apiSpec.paths['/api/users'].get.responses['200']
    );

    expect(errors).toHaveLength(0);
  });
});
```

## Performance Testing

```typescript
describe('Performance Tests', () => {
  it('should handle 100 concurrent requests', async () => {
    const requests = Array(100).fill(null).map(() =>
      request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
    );

    const start = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    expect(responses.every(r => r.status === 200)).toBe(true);
    expect(duration).toBeLessThan(5000); // 5 seconds for 100 requests
  });

  it('should respond quickly under load', async () => {
    const responseTimes: number[] = [];

    for (let i = 0; i < 50; i++) {
      const start = Date.now();
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);
      responseTimes.push(Date.now() - start);
    }

    const avgResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
    const p95 = responseTimes.sort()[Math.floor(responseTimes.length * 0.95)];

    expect(avgResponseTime).toBeLessThan(200);
    expect(p95).toBeLessThan(500);
  });
});
```

## Kết Luận

API testing với Kiro giúp:
- Tự động generate test cases
- Validate request/response schemas
- Test authentication và authorization
- Performance và load testing
- Contract testing với OpenAPI

---

**Chương tiếp theo**: [UI Testing và E2E Testing](./18-ui-e2e-testing.md)

---

*Bài viết được viết bằng AI 🚀*

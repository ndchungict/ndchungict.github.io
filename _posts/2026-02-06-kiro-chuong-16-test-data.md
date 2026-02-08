---
layout: post
title: "[AI] Quản Lý Test Data và Fixtures"
summary: "Hướng dẫn chi tiết về quản lý test data, tạo factories, fixtures và strategies để maintain test data hiệu quả"
author: leo
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: test data, test fixtures, data factories, test data management, faker js
permalink: /huong-dan-su-dung-kiro/test-data-fixtures
usemathjax: false
---

# Chương 16: Quản Lý Test Data và Fixtures

## Tóm Tắt

Hướng dẫn chi tiết về quản lý test data, tạo factories, fixtures, và strategies để maintain test data hiệu quả trong automation testing.

## Tại Sao Cần Quản Lý Test Data?

### Vấn Đề Thường Gặp

❌ **Hardcoded Data:**
```typescript
// Bad
const user = {
  email: 'test@test.com',
  password: '123456'
};
```

❌ **Data Conflicts:**
```typescript
// Test 1 creates user with email test@test.com
// Test 2 also tries to create user with same email → Fails!
```

❌ **Maintenance Nightmare:**
```typescript
// When User model changes, need to update 100+ test files
```

✅ **Solution: Factories và Fixtures**

## Test Data Factories

### Basic Factory Pattern

```typescript
// tests/factories/BaseFactory.ts
export abstract class BaseFactory<T> {
  abstract build(overrides?: Partial<T>): T;
  
  async create(overrides?: Partial<T>): Promise<T> {
    const data = this.build(overrides);
    return await this.save(data);
  }
  
  async createBatch(count: number, overrides?: Partial<T>): Promise<T[]> {
    const items: T[] = [];
    for (let i = 0; i < count; i++) {
      items.push(await this.create(overrides));
    }
    return items;
  }
  
  protected abstract save(data: T): Promise<T>;
}
```

### User Factory

```typescript
// tests/factories/UserFactory.ts
import { faker } from '@faker-js/faker';
import { prisma } from '@/config/database';
import bcrypt from 'bcrypt';
import { BaseFactory } from './BaseFactory';

interface UserData {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
}

export class UserFactory extends BaseFactory<UserData> {
  build(overrides?: Partial<UserData>): UserData {
    return {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      name: faker.person.fullName(),
      role: 'user',
      isEmailVerified: true,
      ...overrides
    };
  }

  protected async save(data: UserData) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    
    return await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
        isEmailVerified: data.isEmailVerified
      }
    });
  }

  // Helper methods
  static async createAdmin(overrides?: Partial<UserData>) {
    return await new UserFactory().create({
      ...overrides,
      role: 'admin'
    });
  }

  static async createUnverified(overrides?: Partial<UserData>) {
    return await new UserFactory().create({
      ...overrides,
      isEmailVerified: false
    });
  }

  static async createWithTodos(todoCount = 5) {
    const user = await new UserFactory().create();
    const todos = await new TodoFactory().createBatch(todoCount, {
      userId: user.id
    });
    return { user, todos };
  }

  // Generate unique email
  static generateUniqueEmail(): string {
    return `test-${Date.now()}-${faker.string.alphanumeric(5)}@example.com`;
  }
}
```

### Todo Factory

```typescript
// tests/factories/TodoFactory.ts
import { faker } from '@faker-js/faker';
import { prisma } from '@/config/database';
import { BaseFactory } from './BaseFactory';
import { UserFactory } from './UserFactory';

interface TodoData {
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  userId: string;
}

export class TodoFactory extends BaseFactory<TodoData> {
  build(overrides?: Partial<TodoData>): TodoData {
    return {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      completed: false,
      priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
      dueDate: faker.date.future(),
      userId: '', // Will be set in create
      ...overrides
    };
  }

  protected async save(data: TodoData) {
    // Create user if userId not provided
    if (!data.userId) {
      const user = await new UserFactory().create();
      data.userId = user.id;
    }

    return await prisma.todo.create({
      data: {
        title: data.title,
        description: data.description,
        completed: data.completed,
        priority: data.priority,
        dueDate: data.dueDate,
        userId: data.userId
      }
    });
  }

  // Helper methods
  static async createCompleted(overrides?: Partial<TodoData>) {
    return await new TodoFactory().create({
      ...overrides,
      completed: true
    });
  }

  static async createOverdue(overrides?: Partial<TodoData>) {
    return await new TodoFactory().create({
      ...overrides,
      dueDate: faker.date.past()
    });
  }

  static async createHighPriority(overrides?: Partial<TodoData>) {
    return await new TodoFactory().create({
      ...overrides,
      priority: 'high'
    });
  }
}
```

### Advanced Factory với Traits

```typescript
// tests/factories/UserFactory.ts
export class UserFactory extends BaseFactory<UserData> {
  private traits: string[] = [];

  withTrait(trait: string): this {
    this.traits.push(trait);
    return this;
  }

  build(overrides?: Partial<UserData>): UserData {
    let data = {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      name: faker.person.fullName(),
      role: 'user' as const,
      isEmailVerified: true,
      ...overrides
    };

    // Apply traits
    for (const trait of this.traits) {
      data = this.applyTrait(trait, data);
    }

    return data;
  }

  private applyTrait(trait: string, data: UserData): UserData {
    switch (trait) {
      case 'admin':
        return { ...data, role: 'admin' };
      case 'unverified':
        return { ...data, isEmailVerified: false };
      case 'premium':
        return { ...data, isPremium: true };
      default:
        return data;
    }
  }
}

// Usage
const adminUser = await new UserFactory()
  .withTrait('admin')
  .withTrait('premium')
  .create();
```

## Fixtures

### Static Fixtures

```typescript
// tests/fixtures/users.json
{
  "admin": {
    "email": "admin@example.com",
    "password": "Admin123!",
    "name": "Admin User",
    "role": "admin"
  },
  "regularUser": {
    "email": "user@example.com",
    "password": "User123!",
    "name": "Regular User",
    "role": "user"
  },
  "testUser": {
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "role": "user"
  }
}
```

### Fixture Loader

```typescript
// tests/fixtures/FixtureLoader.ts
import fs from 'fs';
import path from 'path';
import { prisma } from '@/config/database';
import bcrypt from 'bcrypt';

export class FixtureLoader {
  static async loadUsers() {
    const data = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'users.json'),
        'utf-8'
      )
    );

    const users = [];
    for (const [key, userData] of Object.entries(data)) {
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash,
          name: userData.name,
          role: userData.role
        }
      });
      
      users.push({ key, user });
    }

    return users;
  }

  static async loadTodos() {
    const data = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'todos.json'),
        'utf-8'
      )
    );

    const todos = [];
    for (const todoData of data) {
      const todo = await prisma.todo.create({
        data: todoData
      });
      todos.push(todo);
    }

    return todos;
  }

  static async loadAll() {
    await this.loadUsers();
    await this.loadTodos();
  }
}
```

### Dynamic Fixtures

```typescript
// tests/fixtures/testData.ts
export const testData = {
  users: {
    admin: () => ({
      email: `admin-${Date.now()}@example.com`,
      password: 'Admin123!',
      name: 'Admin User',
      role: 'admin' as const
    }),
    
    regular: () => ({
      email: `user-${Date.now()}@example.com`,
      password: 'User123!',
      name: 'Regular User',
      role: 'user' as const
    })
  },

  todos: {
    simple: () => ({
      title: 'Simple Todo',
      description: 'A simple todo item',
      completed: false
    }),
    
    completed: () => ({
      title: 'Completed Todo',
      description: 'Already done',
      completed: true
    })
  }
};

// Usage
const adminData = testData.users.admin();
const user = await UserFactory.create(adminData);
```

## Database Seeding

### Seed Script

```typescript
// tests/seeds/seed.ts
import { prisma } from '@/config/database';
import { UserFactory } from '../factories/UserFactory';
import { TodoFactory } from '../factories/TodoFactory';

export async function seed() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const admin = await UserFactory.createAdmin({
    email: 'admin@example.com',
    name: 'Admin User'
  });
  console.log('✅ Created admin user');

  // Create regular users
  const users = await new UserFactory().createBatch(10);
  console.log(`✅ Created ${users.length} users`);

  // Create todos for each user
  for (const user of users) {
    await new TodoFactory().createBatch(5, { userId: user.id });
  }
  console.log('✅ Created todos');

  // Create specific test scenarios
  const userWithManyTodos = await UserFactory.create({
    email: 'busy@example.com'
  });
  await new TodoFactory().createBatch(50, { userId: userWithManyTodos.id });
  console.log('✅ Created user with many todos');

  console.log('🎉 Seeding complete!');
}

// Run if called directly
if (require.main === module) {
  seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
```

### Seed in Tests

```typescript
// tests/setup/global-setup.ts
import { seed } from '../seeds/seed';

export default async function globalSetup() {
  await seed();
}
```

## Test Data Builders

### Builder Pattern

```typescript
// tests/builders/UserBuilder.ts
export class UserBuilder {
  private data: Partial<UserData> = {};

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withRole(role: 'user' | 'admin'): this {
    this.data.role = role;
    return this;
  }

  asAdmin(): this {
    this.data.role = 'admin';
    return this;
  }

  asUnverified(): this {
    this.data.isEmailVerified = false;
    return this;
  }

  build(): UserData {
    return new UserFactory().build(this.data);
  }

  async create() {
    return await new UserFactory().create(this.data);
  }
}

// Usage
const user = await new UserBuilder()
  .withEmail('test@example.com')
  .withName('Test User')
  .asAdmin()
  .create();
```

### Fluent Interface

```typescript
// tests/builders/TodoBuilder.ts
export class TodoBuilder {
  private data: Partial<TodoData> = {};

  withTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  asCompleted(): this {
    this.data.completed = true;
    return this;
  }

  asHighPriority(): this {
    this.data.priority = 'high';
    return this;
  }

  dueIn(days: number): this {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    this.data.dueDate = dueDate;
    return this;
  }

  forUser(userId: string): this {
    this.data.userId = userId;
    return this;
  }

  async create() {
    return await new TodoFactory().create(this.data);
  }
}

// Usage
const todo = await new TodoBuilder()
  .withTitle('Important Task')
  .asHighPriority()
  .dueIn(7)
  .forUser(user.id)
  .create();
```

## Test Data Cleanup

### Cleanup Strategies

```typescript
// tests/helpers/CleanupHelper.ts
export class CleanupHelper {
  // Strategy 1: Delete all
  static async deleteAll() {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
  }

  // Strategy 2: Delete by pattern
  static async deleteTestData() {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-'
        }
      }
    });
  }

  // Strategy 3: Delete by timestamp
  static async deleteOldData(olderThanDays = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    await prisma.user.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
  }

  // Strategy 4: Truncate tables
  static async truncateTables() {
    await prisma.$executeRaw`TRUNCATE TABLE "Todo" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  }
}
```

### Cleanup Hooks

```typescript
// tests/setup/cleanup.ts
import { CleanupHelper } from '../helpers/CleanupHelper';

// Before each test
beforeEach(async () => {
  await CleanupHelper.deleteAll();
});

// After all tests
afterAll(async () => {
  await CleanupHelper.deleteAll();
  await prisma.$disconnect();
});
```

## Test Data Isolation

### Transaction Rollback

```typescript
// tests/helpers/TransactionHelper.ts
export class TransactionHelper {
  static async runInTransaction<T>(
    fn: () => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(async (tx) => {
      const result = await fn();
      // Transaction will rollback after test
      throw new Error('Rollback');
    }).catch((error) => {
      if (error.message === 'Rollback') {
        return result;
      }
      throw error;
    });
  }
}

// Usage
test('should create user', async () => {
  await TransactionHelper.runInTransaction(async () => {
    const user = await UserFactory.create();
    expect(user.id).toBeDefined();
    // Data will be rolled back after test
  });
});
```

### Separate Test Database

```typescript
// tests/config/database.ts
import { PrismaClient } from '@prisma/client';

const testDatabaseUrl = process.env.TEST_DATABASE_URL || 
  'postgresql://postgres:postgres@localhost:5432/test_db';

export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl
    }
  }
});
```

## Mock Data Generators

### Faker.js Helpers

```typescript
// tests/helpers/FakerHelper.ts
import { faker } from '@faker-js/faker';

export class FakerHelper {
  static email(): string {
    return faker.internet.email();
  }

  static password(length = 12): string {
    return faker.internet.password({ length });
  }

  static name(): string {
    return faker.person.fullName();
  }

  static phoneNumber(): string {
    return faker.phone.number();
  }

  static address(): string {
    return faker.location.streetAddress();
  }

  static company(): string {
    return faker.company.name();
  }

  static url(): string {
    return faker.internet.url();
  }

  static uuid(): string {
    return faker.string.uuid();
  }

  static date(options?: { past?: boolean; future?: boolean }): Date {
    if (options?.past) return faker.date.past();
    if (options?.future) return faker.date.future();
    return faker.date.recent();
  }

  static number(min = 0, max = 100): number {
    return faker.number.int({ min, max });
  }

  static boolean(): boolean {
    return faker.datatype.boolean();
  }

  static arrayElement<T>(array: T[]): T {
    return faker.helpers.arrayElement(array);
  }

  static arrayElements<T>(array: T[], count?: number): T[] {
    return faker.helpers.arrayElements(array, count);
  }
}
```

## Best Practices

### 1. Use Factories Over Hardcoded Data

```typescript
// ❌ Bad
const user = {
  email: 'test@test.com',
  password: '123456',
  name: 'Test User'
};

// ✅ Good
const user = await UserFactory.create();
```

### 2. Generate Unique Data

```typescript
// ✅ Good: Unique email every time
const user = await UserFactory.create({
  email: `test-${Date.now()}@example.com`
});
```

### 3. Clean Up After Tests

```typescript
// ✅ Good
afterEach(async () => {
  await CleanupHelper.deleteAll();
});
```

### 4. Use Meaningful Test Data

```typescript
// ❌ Bad: Random data
const user = await UserFactory.create();

// ✅ Good: Meaningful data
const adminUser = await UserFactory.createAdmin({
  email: 'admin@example.com',
  name: 'Admin User'
});
```

### 5. Reuse Common Scenarios

```typescript
// ✅ Good: Reusable scenario
export async function createUserWithTodos(todoCount = 5) {
  const user = await UserFactory.create();
  const todos = await TodoFactory.createBatch(todoCount, {
    userId: user.id
  });
  return { user, todos };
}
```

## Kết Luận

Test data management với:
- ✅ Factories cho dynamic data
- ✅ Fixtures cho static data
- ✅ Builders cho complex scenarios
- ✅ Cleanup strategies
- ✅ Data isolation
- ✅ Best practices

---

**Chương tiếp theo**: [UI Testing và E2E Testing](./18-ui-e2e-testing.md)

---

*Bài viết được viết bằng AI 🚀*

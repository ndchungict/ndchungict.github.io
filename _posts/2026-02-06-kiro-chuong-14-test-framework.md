---
layout: post
title: "[AI] Tạo Test Framework Với Kiro"
summary: "Hướng dẫn chi tiết cách sử dụng Kiro để xây dựng test framework hoàn chỉnh từ đầu với Playwright, Jest và Page Object Model"
author: chungnd
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: test framework, playwright setup, jest configuration, page object model, test utilities
permalink: /huong-dan-su-dung-kiro/tao-test-framework
usemathjax: false
---

# Chương 14: Tạo Test Framework với Kiro

## Tóm Tắt

Hướng dẫn chi tiết cách sử dụng Kiro để xây dựng test framework hoàn chỉnh từ đầu, bao gồm setup Playwright, Jest, Page Object Model, test utilities và best practices.

## Tổng Quan

### Mục Tiêu
Xây dựng test framework với:
- **Unit Testing**: Jest
- **API Testing**: Supertest
- **E2E Testing**: Playwright
- **Page Object Model**: Structured approach
- **Test Data Management**: Factories và fixtures
- **Reporting**: Allure Reports

## Bước 1: Tạo Spec Cho Test Framework

### Prompt Cho Kiro

```
Tạo spec cho test automation framework với yêu cầu:

1. Framework Structure:
   - Support unit, API, và E2E tests
   - Page Object Model cho UI tests
   - Test data factories
   - Reusable utilities

2. Tech Stack:
   - Jest cho unit tests
   - Supertest cho API tests
   - Playwright cho E2E tests
   - TypeScript
   - Allure reporting

3. Features:
   - Parallel execution
   - Screenshot on failure
   - Video recording
   - Test retry mechanism
   - Environment configuration

4. Test Organization:
   - tests/unit/
   - tests/api/
   - tests/e2e/
   - tests/fixtures/
   - tests/helpers/
   - tests/pages/

5. CI/CD Ready:
   - GitHub Actions integration
   - Docker support
   - Test reports
```

### Kiro Generate Spec

**requirements.md:**
```markdown
# Requirements: Test Automation Framework

## Functional Requirements

### FR-1: Unit Testing Support
**Acceptance Criteria:**
- WHEN developer writes unit test, framework SHALL provide Jest setup
- WHERE test needs mocking, framework SHALL provide mock utilities
- WHEN test runs, framework SHALL generate coverage report

### FR-2: API Testing Support
**Acceptance Criteria:**
- WHEN testing API endpoint, framework SHALL provide Supertest helpers
- WHERE authentication needed, framework SHALL provide auth helpers
- WHEN API test runs, framework SHALL validate response schemas

### FR-3: E2E Testing Support
**Acceptance Criteria:**
- WHEN testing UI flow, framework SHALL provide Playwright setup
- WHERE page interaction needed, framework SHALL provide Page Objects
- WHEN E2E test fails, framework SHALL capture screenshot and video

### FR-4: Test Data Management
**Acceptance Criteria:**
- WHEN test needs data, framework SHALL provide factories
- WHERE specific data needed, framework SHALL provide fixtures
- WHEN test completes, framework SHALL clean up test data

### FR-5: Reporting
**Acceptance Criteria:**
- WHEN tests complete, framework SHALL generate Allure report
- WHERE test fails, framework SHALL include error details
- WHEN viewing report, user SHALL see test history and trends

## Non-Functional Requirements

### Performance
- Test execution time < 5 minutes for full suite
- Parallel execution support
- Efficient resource usage

### Reliability
- Automatic retry for flaky tests (max 2 retries)
- Stable selectors for UI tests
- Proper test isolation

### Maintainability
- Clear test structure
- Reusable components
- Well-documented utilities
```

## Bước 2: Setup Project Structure

### Generate Structure với Kiro

```
"Generate test framework project structure based on spec"
```

**Kiro tạo:**
```
tests/
├── config/
│   ├── jest.config.ts
│   ├── playwright.config.ts
│   └── test.config.ts
├── unit/
│   └── example.spec.ts
├── api/
│   ├── auth.spec.ts
│   └── users.spec.ts
├── e2e/
│   ├── login.spec.ts
│   └── user-flow.spec.ts
├── pages/
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   └── DashboardPage.ts
├── fixtures/
│   ├── users.json
│   └── testData.ts
├── helpers/
│   ├── ApiHelper.ts
│   ├── AuthHelper.ts
│   ├── DatabaseHelper.ts
│   └── TestHelper.ts
├── factories/
│   ├── UserFactory.ts
│   └── TodoFactory.ts
└── setup/
    ├── global-setup.ts
    └── global-teardown.ts
```

## Bước 3: Setup Jest (Unit Tests)

### Jest Configuration

```typescript
// tests/config/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/../unit'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/../setup/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../src/$1'
  }
};

export default config;
```

### Jest Setup File

```typescript
// tests/setup/jest.setup.ts
import { prisma } from '@/config/database';

// Extend Jest matchers
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid email`
          : `Expected ${received} to be a valid email`
    };
  }
});

// Global setup
beforeAll(async () => {
  // Setup test database
  await prisma.$connect();
});

// Global teardown
afterAll(async () => {
  await prisma.$disconnect();
});

// Clear database before each test
beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.todo.deleteMany();
});
```

### Example Unit Test

```typescript
// tests/unit/services/UserService.spec.ts
import { UserService } from '@/services/UserService';
import { UserFactory } from '../../factories/UserFactory';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = UserFactory.build();

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user).not.toHaveProperty('password');
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      const userData = UserFactory.build();
      await userService.createUser(userData);

      // Act & Assert
      await expect(
        userService.createUser(userData)
      ).rejects.toThrow('Email already exists');
    });

    it('should hash password', async () => {
      // Arrange
      const userData = UserFactory.build({ password: 'plaintext' });

      // Act
      const user = await userService.createUser(userData);

      // Assert
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      expect(dbUser?.passwordHash).not.toBe('plaintext');
      expect(dbUser?.passwordHash).toMatch(/^\$2[aby]\$/);
    });
  });
});
```

## Bước 4: Setup Supertest (API Tests)

### API Test Helper

```typescript
// tests/helpers/ApiHelper.ts
import request from 'supertest';
import { app } from '@/app';

export class ApiHelper {
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
    const req = request(app)
      .post(path)
      .send(data);
    
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    
    return req.expect(expectedStatus);
  }

  async put(path: string, data: any, expectedStatus = 200) {
    const req = request(app)
      .put(path)
      .send(data);
    
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

  static async loginAs(email: string, password: string): Promise<string> {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);
    
    return response.body.token;
  }
}
```

### Example API Test

```typescript
// tests/api/users.spec.ts
import { ApiHelper } from '../helpers/ApiHelper';
import { AuthHelper } from '../helpers/AuthHelper';
import { UserFactory } from '../factories/UserFactory';

describe('Users API', () => {
  let api: ApiHelper;
  let authToken: string;

  beforeAll(async () => {
    authToken = await AuthHelper.getValidToken('admin');
  });

  beforeEach(() => {
    api = new ApiHelper();
    api.setAuthToken(authToken);
  });

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      // Arrange
      await UserFactory.createBatch(5);

      // Act
      const response = await api.get('/api/users');

      // Assert
      expect(response.body.users).toHaveLength(5);
      expect(response.body.users[0]).toHaveProperty('id');
      expect(response.body.users[0]).not.toHaveProperty('passwordHash');
    });

    it('should return 401 without auth token', async () => {
      // Arrange
      api.setAuthToken('');

      // Act & Assert
      await api.get('/api/users', 401);
    });

    it('should support pagination', async () => {
      // Arrange
      await UserFactory.createBatch(20);

      // Act
      const response = await api.get('/api/users?page=2&limit=5');

      // Assert
      expect(response.body.users).toHaveLength(5);
      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 5,
        total: 20,
        totalPages: 4
      });
    });
  });

  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = UserFactory.build();

      // Act
      const response = await api.post('/api/users', userData);

      // Assert
      expect(response.body).toMatchObject({
        email: userData.email,
        name: userData.name
      });
      expect(response.body.id).toBeDefined();
    });

    it('should validate email format', async () => {
      // Arrange
      const userData = UserFactory.build({ email: 'invalid-email' });

      // Act
      const response = await api.post('/api/users', userData, 400);

      // Assert
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: expect.stringContaining('Invalid email')
        })
      );
    });
  });
});
```

## Bước 5: Setup Playwright (E2E Tests)

### Playwright Configuration

```typescript
// tests/config/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['allure-playwright']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

### Base Page Object

```typescript
// tests/pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async navigate(path: string) {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true
    });
  }

  async getElementText(selector: string): Promise<string> {
    return await this.page.locator(selector).textContent() || '';
  }

  async clickElement(selector: string) {
    await this.page.locator(selector).click();
  }

  async fillInput(selector: string, value: string) {
    await this.page.locator(selector).fill(value);
  }

  async isElementVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  async waitForElement(selector: string, timeout = 5000) {
    await this.page.locator(selector).waitFor({ timeout });
  }
}
```

### Login Page Object

```typescript
// tests/pages/LoginPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly emailInput = '[data-testid="email-input"]';
  private readonly passwordInput = '[data-testid="password-input"]';
  private readonly loginButton = '[data-testid="login-button"]';
  private readonly errorMessage = '[data-testid="error-message"]';

  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await super.navigate('/login');
  }

  async enterEmail(email: string) {
    await this.fillInput(this.emailInput, email);
  }

  async enterPassword(password: string) {
    await this.fillInput(this.passwordInput, password);
  }

  async clickLogin() {
    await this.clickElement(this.loginButton);
  }

  async login(email: string, password: string) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async getErrorMessage(): Promise<string> {
    return await this.getElementText(this.errorMessage);
  }

  async isErrorVisible(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }
}
```

### Dashboard Page Object

```typescript
// tests/pages/DashboardPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  private readonly welcomeMessage = '[data-testid="welcome-message"]';
  private readonly logoutButton = '[data-testid="logout-button"]';
  private readonly userMenu = '[data-testid="user-menu"]';

  constructor(page: Page) {
    super(page);
  }

  async isDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.welcomeMessage);
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.getElementText(this.welcomeMessage);
  }

  async logout() {
    await this.clickElement(this.userMenu);
    await this.clickElement(this.logoutButton);
  }
}
```

### Example E2E Test

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UserFactory } from '../factories/UserFactory';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

  test('should login with valid credentials', async () => {
    // Arrange
    const user = await UserFactory.create({
      email: 'test@example.com',
      password: 'Password123'
    });

    // Act
    await loginPage.login(user.email, 'Password123');

    // Assert
    await expect(dashboardPage.isDisplayed()).resolves.toBe(true);
    const welcomeMsg = await dashboardPage.getWelcomeMessage();
    expect(welcomeMsg).toContain(user.name);
  });

  test('should show error with invalid credentials', async () => {
    // Act
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Assert
    await expect(loginPage.isErrorVisible()).resolves.toBe(true);
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Invalid credentials');
  });

  test('should validate email format', async () => {
    // Act
    await loginPage.login('invalid-email', 'password');

    // Assert
    await expect(loginPage.isErrorVisible()).resolves.toBe(true);
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Invalid email');
  });
});
```

## Bước 6: Test Data Factories

### User Factory

```typescript
// tests/factories/UserFactory.ts
import { faker } from '@faker-js/faker';
import { prisma } from '@/config/database';
import bcrypt from 'bcrypt';

interface UserData {
  email?: string;
  password?: string;
  name?: string;
  role?: 'user' | 'admin';
}

export class UserFactory {
  static build(overrides?: UserData) {
    return {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      name: faker.person.fullName(),
      role: 'user' as const,
      ...overrides
    };
  }

  static async create(overrides?: UserData) {
    const data = this.build(overrides);
    const passwordHash = await bcrypt.hash(data.password, 12);

    return await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role
      }
    });
  }

  static async createBatch(count: number, overrides?: UserData) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create(overrides));
    }
    return users;
  }

  static async createAdmin() {
    return await this.create({ role: 'admin' });
  }
}
```

### Todo Factory

```typescript
// tests/factories/TodoFactory.ts
import { faker } from '@faker-js/faker';
import { prisma } from '@/config/database';
import { UserFactory } from './UserFactory';

interface TodoData {
  title?: string;
  description?: string;
  completed?: boolean;
  userId?: string;
}

export class TodoFactory {
  static build(overrides?: TodoData) {
    return {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      completed: false,
      ...overrides
    };
  }

  static async create(overrides?: TodoData) {
    const data = this.build(overrides);
    
    let userId = data.userId;
    if (!userId) {
      const user = await UserFactory.create();
      userId = user.id;
    }

    return await prisma.todo.create({
      data: {
        title: data.title!,
        description: data.description,
        completed: data.completed!,
        userId
      }
    });
  }

  static async createBatch(count: number, overrides?: TodoData) {
    const todos = [];
    for (let i = 0; i < count; i++) {
      todos.push(await this.create(overrides));
    }
    return todos;
  }

  static async createCompleted(overrides?: TodoData) {
    return await this.create({ ...overrides, completed: true });
  }
}
```

## Bước 7: Test Utilities

### Database Helper

```typescript
// tests/helpers/DatabaseHelper.ts
import { prisma } from '@/config/database';

export class DatabaseHelper {
  static async clearAll() {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
  }

  static async seed() {
    // Seed test data
    const users = await UserFactory.createBatch(10);
    
    for (const user of users) {
      await TodoFactory.createBatch(5, { userId: user.id });
    }
  }

  static async reset() {
    await this.clearAll();
    await this.seed();
  }
}
```

### Test Helper

```typescript
// tests/helpers/TestHelper.ts
import { Page } from '@playwright/test';

export class TestHelper {
  static async waitForPageLoad(page: Page) {
    await page.waitForLoadState('networkidle');
  }

  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  static async clearCookies(page: Page) {
    await page.context().clearCookies();
  }

  static async clearLocalStorage(page: Page) {
    await page.evaluate(() => localStorage.clear());
  }

  static generateUniqueEmail(): string {
    return `test-${Date.now()}@example.com`;
  }

  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.sleep(delay);
      }
    }
    throw new Error('Max retries exceeded');
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Bước 8: Reporting

### Allure Configuration

```typescript
// tests/config/allure.config.ts
export const allureConfig = {
  resultsDir: 'allure-results',
  reportDir: 'allure-report',
  categories: [
    {
      name: 'Failed tests',
      matchedStatuses: ['failed']
    },
    {
      name: 'Broken tests',
      matchedStatuses: ['broken']
    },
    {
      name: 'Flaky tests',
      matchedStatuses: ['failed', 'passed']
    }
  ]
};
```

### Generate Reports Script

```typescript
// scripts/generate-reports.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateReports() {
  console.log('Generating Allure report...');
  
  try {
    await execAsync('allure generate allure-results --clean -o allure-report');
    console.log('✅ Allure report generated');
    
    await execAsync('allure open allure-report');
  } catch (error) {
    console.error('❌ Failed to generate report:', error);
    process.exit(1);
  }
}

generateReports();
```

## Bước 9: Package.json Scripts

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:api && npm run test:e2e",
    "test:unit": "jest --config tests/config/jest.config.ts",
    "test:api": "jest --config tests/config/jest.config.ts tests/api",
    "test:e2e": "playwright test",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "test:report": "ts-node scripts/generate-reports.ts",
    "playwright:ui": "playwright test --ui",
    "playwright:debug": "playwright test --debug"
  }
}
```

## Kết Luận

Bạn đã có test framework hoàn chỉnh với:
- ✅ Jest cho unit tests
- ✅ Supertest cho API tests
- ✅ Playwright cho E2E tests
- ✅ Page Object Model
- ✅ Test data factories
- ✅ Reusable helpers
- ✅ Allure reporting

---

**Chương tiếp theo**: [CI/CD và Test Automation](./15-cicd-testing.md)

---

*Bài viết được viết bằng AI 🚀*

---
layout: post
title: "[AI] UI Testing và E2E Testing"
summary: "Hướng dẫn chi tiết về UI testing và End-to-End testing với Playwright, Page Object Model và cross-browser testing"
author: chungnd
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: ui testing, e2e testing, playwright, page object model, visual testing, cross-browser
permalink: /huong-dan-su-dung-kiro/ui-e2e-testing
usemathjax: false
---

# Chương 18: UI Testing và E2E Testing

## Tóm Tắt

Hướng dẫn chi tiết về UI testing và End-to-End testing với Playwright, bao gồm Page Object Model, best practices, visual testing và cross-browser testing.

## Playwright Setup

### Installation

```bash
npm install -D @playwright/test
npx playwright install
```

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000
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
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
```

## Page Object Model

### Base Page

```typescript
// tests/pages/BasePage.ts
import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  // Navigation
  async navigate(path: string) {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async reload() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  // Element interactions
  async click(selector: string) {
    await this.page.locator(selector).click();
  }

  async fill(selector: string, value: string) {
    await this.page.locator(selector).fill(value);
  }

  async type(selector: string, value: string, delay = 50) {
    await this.page.locator(selector).type(value, { delay });
  }

  async select(selector: string, value: string) {
    await this.page.locator(selector).selectOption(value);
  }

  async check(selector: string) {
    await this.page.locator(selector).check();
  }

  async uncheck(selector: string) {
    await this.page.locator(selector).uncheck();
  }

  // Element queries
  async getText(selector: string): Promise<string> {
    return await this.page.locator(selector).textContent() || '';
  }

  async getValue(selector: string): Promise<string> {
    return await this.page.locator(selector).inputValue();
  }

  async getAttribute(selector: string, attr: string): Promise<string | null> {
    return await this.page.locator(selector).getAttribute(attr);
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  async isEnabled(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isEnabled();
  }

  async isChecked(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isChecked();
  }

  // Waiting
  async waitForSelector(selector: string, timeout = 5000) {
    await this.page.locator(selector).waitFor({ timeout });
  }

  async waitForText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  async waitForUrl(url: string | RegExp) {
    await this.page.waitForURL(url);
  }

  // Screenshots
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  // Alerts
  async acceptAlert() {
    this.page.once('dialog', dialog => dialog.accept());
  }

  async dismissAlert() {
    this.page.once('dialog', dialog => dialog.dismiss());
  }

  async getAlertText(): Promise<string> {
    return new Promise(resolve => {
      this.page.once('dialog', dialog => {
        resolve(dialog.message());
        dialog.dismiss();
      });
    });
  }

  // Local Storage
  async getLocalStorage(key: string): Promise<string | null> {
    return await this.page.evaluate(
      (k) => localStorage.getItem(k),
      key
    );
  }

  async setLocalStorage(key: string, value: string) {
    await this.page.evaluate(
      ({ k, v }) => localStorage.setItem(k, v),
      { k: key, v: value }
    );
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  // Cookies
  async getCookie(name: string) {
    const cookies = await this.page.context().cookies();
    return cookies.find(c => c.name === name);
  }

  async setCookie(name: string, value: string) {
    await this.page.context().addCookies([{
      name,
      value,
      domain: 'localhost',
      path: '/'
    }]);
  }

  async clearCookies() {
    await this.page.context().clearCookies();
  }
}
```

### Login Page

```typescript
// tests/pages/LoginPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Selectors
  private readonly selectors = {
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginButton: '[data-testid="login-button"]',
    errorMessage: '[data-testid="error-message"]',
    forgotPasswordLink: '[data-testid="forgot-password-link"]',
    signupLink: '[data-testid="signup-link"]',
    rememberMeCheckbox: '[data-testid="remember-me"]',
    showPasswordButton: '[data-testid="show-password"]'
  };

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigate() {
    await super.navigate('/login');
  }

  // Actions
  async enterEmail(email: string) {
    await this.fill(this.selectors.emailInput, email);
  }

  async enterPassword(password: string) {
    await this.fill(this.selectors.passwordInput, password);
  }

  async clickLogin() {
    await this.click(this.selectors.loginButton);
  }

  async login(email: string, password: string) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async checkRememberMe() {
    await this.check(this.selectors.rememberMeCheckbox);
  }

  async clickForgotPassword() {
    await this.click(this.selectors.forgotPasswordLink);
  }

  async clickSignup() {
    await this.click(this.selectors.signupLink);
  }

  async togglePasswordVisibility() {
    await this.click(this.selectors.showPasswordButton);
  }

  // Queries
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.selectors.errorMessage);
  }

  async isErrorVisible(): Promise<boolean> {
    return await this.isVisible(this.selectors.errorMessage);
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isEnabled(this.selectors.loginButton);
  }

  // Validations
  async expectErrorMessage(message: string) {
    const error = await this.getErrorMessage();
    expect(error).toContain(message);
  }

  async expectLoginButtonDisabled() {
    const enabled = await this.isLoginButtonEnabled();
    expect(enabled).toBe(false);
  }
}
```

### Dashboard Page

```typescript
// tests/pages/DashboardPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  private readonly selectors = {
    welcomeMessage: '[data-testid="welcome-message"]',
    userMenu: '[data-testid="user-menu"]',
    logoutButton: '[data-testid="logout-button"]',
    profileLink: '[data-testid="profile-link"]',
    settingsLink: '[data-testid="settings-link"]',
    notificationBadge: '[data-testid="notification-badge"]',
    searchInput: '[data-testid="search-input"]',
    createButton: '[data-testid="create-button"]'
  };

  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await super.navigate('/dashboard');
  }

  async isDisplayed(): Promise<boolean> {
    return await this.isVisible(this.selectors.welcomeMessage);
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.getText(this.selectors.welcomeMessage);
  }

  async openUserMenu() {
    await this.click(this.selectors.userMenu);
  }

  async logout() {
    await this.openUserMenu();
    await this.click(this.selectors.logoutButton);
  }

  async goToProfile() {
    await this.openUserMenu();
    await this.click(this.selectors.profileLink);
  }

  async goToSettings() {
    await this.openUserMenu();
    await this.click(this.selectors.settingsLink);
  }

  async search(query: string) {
    await this.fill(this.selectors.searchInput, query);
    await this.page.keyboard.press('Enter');
  }

  async clickCreate() {
    await this.click(this.selectors.createButton);
  }

  async getNotificationCount(): Promise<number> {
    const text = await this.getText(this.selectors.notificationBadge);
    return parseInt(text) || 0;
  }
}
```

### Todo List Page

```typescript
// tests/pages/TodoListPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TodoListPage extends BasePage {
  private readonly selectors = {
    todoInput: '[data-testid="todo-input"]',
    addButton: '[data-testid="add-button"]',
    todoItem: (index: number) => `[data-testid="todo-item-${index}"]`,
    todoCheckbox: (index: number) => `[data-testid="todo-checkbox-${index}"]`,
    todoText: (index: number) => `[data-testid="todo-text-${index}"]`,
    deleteButton: (index: number) => `[data-testid="delete-button-${index}"]`,
    editButton: (index: number) => `[data-testid="edit-button-${index}"]`,
    filterAll: '[data-testid="filter-all"]',
    filterActive: '[data-testid="filter-active"]',
    filterCompleted: '[data-testid="filter-completed"]',
    clearCompleted: '[data-testid="clear-completed"]',
    todoCount: '[data-testid="todo-count"]'
  };

  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await super.navigate('/todos');
  }

  async addTodo(text: string) {
    await this.fill(this.selectors.todoInput, text);
    await this.click(this.selectors.addButton);
  }

  async toggleTodo(index: number) {
    await this.click(this.selectors.todoCheckbox(index));
  }

  async deleteTodo(index: number) {
    await this.click(this.selectors.deleteButton(index));
  }

  async editTodo(index: number, newText: string) {
    await this.click(this.selectors.editButton(index));
    await this.fill(this.selectors.todoInput, newText);
    await this.page.keyboard.press('Enter');
  }

  async getTodoText(index: number): Promise<string> {
    return await this.getText(this.selectors.todoText(index));
  }

  async isTodoCompleted(index: number): Promise<boolean> {
    return await this.isChecked(this.selectors.todoCheckbox(index));
  }

  async getTodoCount(): Promise<number> {
    const text = await this.getText(this.selectors.todoCount);
    return parseInt(text.match(/\d+/)?.[0] || '0');
  }

  async filterAll() {
    await this.click(this.selectors.filterAll);
  }

  async filterActive() {
    await this.click(this.selectors.filterActive);
  }

  async filterCompleted() {
    await this.click(this.selectors.filterCompleted);
  }

  async clearCompleted() {
    await this.click(this.selectors.clearCompleted);
  }

  async getAllTodos(): Promise<string[]> {
    const todos = await this.page.locator('[data-testid^="todo-text-"]').all();
    return Promise.all(todos.map(t => t.textContent() || ''));
  }
}
```

## E2E Test Examples

### Login Flow

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
    await loginPage.expectErrorMessage('Invalid credentials');
  });

  test('should validate email format', async () => {
    // Act
    await loginPage.enterEmail('invalid-email');
    await loginPage.enterPassword('password');
    await loginPage.clickLogin();

    // Assert
    await loginPage.expectErrorMessage('Invalid email format');
  });

  test('should remember user when checkbox checked', async ({ page }) => {
    // Arrange
    const user = await UserFactory.create();

    // Act
    await loginPage.login(user.email, 'Password123');
    await loginPage.checkRememberMe();
    await loginPage.clickLogin();

    // Assert
    const cookie = await page.context().cookies();
    expect(cookie.some(c => c.name === 'remember_token')).toBe(true);
  });

  test('should navigate to forgot password', async ({ page }) => {
    // Act
    await loginPage.clickForgotPassword();

    // Assert
    await expect(page).toHaveURL('/forgot-password');
  });

  test('should navigate to signup', async ({ page }) => {
    // Act
    await loginPage.clickSignup();

    // Assert
    await expect(page).toHaveURL('/signup');
  });
});
```

### Todo CRUD Flow

```typescript
// tests/e2e/todo-crud.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TodoListPage } from '../pages/TodoListPage';
import { UserFactory } from '../factories/UserFactory';

test.describe('Todo CRUD', () => {
  let loginPage: LoginPage;
  let todoPage: TodoListPage;
  let user: any;

  test.beforeEach(async ({ page }) => {
    // Setup
    loginPage = new LoginPage(page);
    todoPage = new TodoListPage(page);
    user = await UserFactory.create();

    // Login
    await loginPage.navigate();
    await loginPage.login(user.email, 'Password123');
    await todoPage.navigate();
  });

  test('should create new todo', async () => {
    // Act
    await todoPage.addTodo('Buy groceries');

    // Assert
    const todos = await todoPage.getAllTodos();
    expect(todos).toContain('Buy groceries');
  });

  test('should mark todo as completed', async () => {
    // Arrange
    await todoPage.addTodo('Complete task');

    // Act
    await todoPage.toggleTodo(0);

    // Assert
    const isCompleted = await todoPage.isTodoCompleted(0);
    expect(isCompleted).toBe(true);
  });

  test('should delete todo', async () => {
    // Arrange
    await todoPage.addTodo('Delete me');
    const initialCount = await todoPage.getTodoCount();

    // Act
    await todoPage.deleteTodo(0);

    // Assert
    const newCount = await todoPage.getTodoCount();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should edit todo', async () => {
    // Arrange
    await todoPage.addTodo('Original text');

    // Act
    await todoPage.editTodo(0, 'Updated text');

    // Assert
    const text = await todoPage.getTodoText(0);
    expect(text).toBe('Updated text');
  });

  test('should filter todos', async () => {
    // Arrange
    await todoPage.addTodo('Active todo');
    await todoPage.addTodo('Completed todo');
    await todoPage.toggleTodo(1);

    // Act - Filter active
    await todoPage.filterActive();
    let todos = await todoPage.getAllTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0]).toBe('Active todo');

    // Act - Filter completed
    await todoPage.filterCompleted();
    todos = await todoPage.getAllTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0]).toBe('Completed todo');

    // Act - Filter all
    await todoPage.filterAll();
    todos = await todoPage.getAllTodos();
    expect(todos).toHaveLength(2);
  });

  test('should clear completed todos', async () => {
    // Arrange
    await todoPage.addTodo('Todo 1');
    await todoPage.addTodo('Todo 2');
    await todoPage.toggleTodo(0);

    // Act
    await todoPage.clearCompleted();

    // Assert
    const todos = await todoPage.getAllTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0]).toBe('Todo 2');
  });
});
```

### User Registration Flow

```typescript
// tests/e2e/registration.spec.ts
import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('User Registration', () => {
  let signupPage: SignupPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
    dashboardPage = new DashboardPage(page);
    await signupPage.navigate();
  });

  test('should register new user', async () => {
    // Arrange
    const email = `test-${Date.now()}@example.com`;
    const password = 'SecurePass123!';
    const name = 'Test User';

    // Act
    await signupPage.fillRegistrationForm({
      email,
      password,
      confirmPassword: password,
      name
    });
    await signupPage.acceptTerms();
    await signupPage.submit();

    // Assert
    await expect(dashboardPage.isDisplayed()).resolves.toBe(true);
  });

  test('should validate password strength', async () => {
    // Act
    await signupPage.enterPassword('weak');

    // Assert
    await signupPage.expectPasswordStrength('weak');
  });

  test('should validate password match', async () => {
    // Act
    await signupPage.enterPassword('Password123!');
    await signupPage.enterConfirmPassword('DifferentPass123!');
    await signupPage.submit();

    // Assert
    await signupPage.expectErrorMessage('Passwords do not match');
  });
});
```

## Visual Testing

### Screenshot Comparison

```typescript
// tests/e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage should match snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('login page should match snapshot', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveScreenshot('login-page.png');
  });

  test('dashboard should match snapshot', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('dashboard.png');
  });
});
```

### Element Screenshot

```typescript
test('button should match snapshot', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('[data-testid="primary-button"]');
  await expect(button).toHaveScreenshot('primary-button.png');
});
```

## Cross-Browser Testing

### Browser-Specific Tests

```typescript
// tests/e2e/cross-browser.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test('should work on all browsers', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Browser-specific logic
    if (browserName === 'webkit') {
      // Safari-specific test
    } else if (browserName === 'firefox') {
      // Firefox-specific test
    }
    
    // Common assertions
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## Mobile Testing

### Mobile-Specific Tests

```typescript
// tests/e2e/mobile.spec.ts
import { test, expect, devices } from '@playwright/test';

test.use(devices['iPhone 12']);

test.describe('Mobile Experience', () => {
  test('should display mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Mobile menu should be visible
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
    
    // Desktop menu should be hidden
    const desktopMenu = page.locator('[data-testid="desktop-menu"]');
    await expect(desktopMenu).not.toBeVisible();
  });

  test('should handle touch gestures', async ({ page }) => {
    await page.goto('/todos');
    
    // Swipe to delete
    const todo = page.locator('[data-testid="todo-item-0"]');
    await todo.swipe('left');
    
    const deleteButton = page.locator('[data-testid="delete-button-0"]');
    await expect(deleteButton).toBeVisible();
  });
});
```

## Performance Testing

### Measure Page Load Time

```typescript
// tests/e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test('homepage should load quickly', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

### Lighthouse Integration

```typescript
import { test } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test('should pass lighthouse audit', async ({ page }) => {
  await page.goto('/');
  
  await playAudit({
    page,
    thresholds: {
      performance: 90,
      accessibility: 90,
      'best-practices': 90,
      seo: 90
    }
  });
});
```

## Best Practices

### 1. Use Data Test IDs

```html
<!-- ✅ Good -->
<button data-testid="login-button">Login</button>

<!-- ❌ Bad -->
<button class="btn btn-primary">Login</button>
```

### 2. Wait for Elements

```typescript
// ✅ Good
await page.locator('[data-testid="button"]').waitFor();
await page.locator('[data-testid="button"]').click();

// ❌ Bad
await page.locator('[data-testid="button"]').click(); // May fail if not ready
```

### 3. Use Page Objects

```typescript
// ✅ Good
await loginPage.login(email, password);

// ❌ Bad
await page.fill('#email', email);
await page.fill('#password', password);
await page.click('#login-btn');
```

### 4. Clean Test Data

```typescript
test.afterEach(async () => {
  await CleanupHelper.deleteTestData();
});
```

### 5. Handle Flaky Tests

```typescript
// Retry flaky tests
test.describe.configure({ retries: 2 });

// Or use polling
await expect(async () => {
  const text = await page.textContent('[data-testid="status"]');
  expect(text).toBe('Success');
}).toPass({ timeout: 10000 });
```

## Kết Luận

UI và E2E testing với Playwright:
- ✅ Page Object Model
- ✅ Cross-browser testing
- ✅ Mobile testing
- ✅ Visual testing
- ✅ Performance testing
- ✅ Best practices

---

**Chương tiếp theo**: [Troubleshooting](./20-troubleshooting.md)

---

*Bài viết được viết bằng AI 🚀*

---
layout: post
title: "[AI] CI/CD và Test Automation"
summary: "Hướng dẫn tích hợp test automation vào CI/CD pipeline với GitHub Actions, GitLab CI, Docker và best practices"
author: chungnd
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: cicd testing, github actions, gitlab ci, docker testing, continuous testing
permalink: /huong-dan-su-dung-kiro/cicd-testing
usemathjax: false
---

# Chương 15: CI/CD và Test Automation

## Tóm Tắt

Hướng dẫn tích hợp test automation vào CI/CD pipeline, bao gồm GitHub Actions, GitLab CI, Docker, và best practices cho continuous testing.

## Tổng Quan CI/CD Testing

### Mục Tiêu
- Tự động chạy tests trên mỗi commit
- Fail build nếu tests fail
- Generate và publish test reports
- Parallel test execution
- Test trên multiple environments

### Pipeline Flow

```
Code Push → Build → Unit Tests → API Tests → E2E Tests → Deploy
              ↓         ↓            ↓           ↓
           Fail?     Fail?        Fail?       Fail?
              ↓         ↓            ↓           ↓
           Stop      Stop         Stop        Stop
```

## GitHub Actions

### Basic Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  api-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run API tests
        run: npm run test:api
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          JWT_SECRET: test-secret

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
      
      - name: Upload videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos
          path: test-results/
```

### Advanced Workflow với Matrix

```yaml
# .github/workflows/test-matrix.yml
name: Test Matrix

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]
        browser: [chromium, firefox, webkit]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests on ${{ matrix.browser }}
        run: npx playwright test --project=${{ matrix.browser }}
```

### Parallel Test Execution

```yaml
# .github/workflows/parallel-tests.yml
name: Parallel Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run tests (shard ${{ matrix.shard }}/4)
        run: npx playwright test --shard=${{ matrix.shard }}/4
      
      - name: Upload blob report
        uses: actions/upload-artifact@v3
        with:
          name: blob-report-${{ matrix.shard }}
          path: blob-report
          retention-days: 1

  merge-reports:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download blob reports
        uses: actions/download-artifact@v3
        with:
          path: all-blob-reports
      
      - name: Merge reports
        run: npx playwright merge-reports --reporter html ./all-blob-reports
      
      - name: Upload HTML report
        uses: actions/upload-artifact@v3
        with:
          name: html-report
          path: playwright-report
```

### Scheduled Tests

```yaml
# .github/workflows/scheduled-tests.yml
name: Scheduled Tests

on:
  schedule:
    # Run every day at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Manual trigger

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://production.example.com
      
      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Smoke tests failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## GitLab CI

### Basic Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - report
  - deploy

variables:
  NODE_VERSION: "18"
  POSTGRES_DB: test_db
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
  cache:
    paths:
      - node_modules/
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

unit-tests:
  stage: test
  image: node:${NODE_VERSION}
  dependencies:
    - build
  script:
    - npm run test:unit
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

api-tests:
  stage: test
  image: node:${NODE_VERSION}
  services:
    - postgres:15
  dependencies:
    - build
  variables:
    DATABASE_URL: postgresql://postgres:postgres@postgres:5432/test_db
  script:
    - npx prisma migrate deploy
    - npm run test:api
  artifacts:
    reports:
      junit: test-results/junit.xml

e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  dependencies:
    - build
  script:
    - npm run test:e2e
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 30 days

generate-report:
  stage: report
  image: node:${NODE_VERSION}
  dependencies:
    - unit-tests
    - api-tests
    - e2e-tests
  script:
    - npm run test:report
  artifacts:
    paths:
      - allure-report/
    expire_in: 30 days
  only:
    - main
    - develop
```

### Parallel Execution

```yaml
# .gitlab-ci.yml
e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  parallel: 4
  script:
    - npx playwright test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
  artifacts:
    when: always
    paths:
      - test-results/
```

## Docker Support

### Dockerfile for Testing

```dockerfile
# Dockerfile.test
FROM node:18-alpine

# Install Playwright dependencies
RUN apk add --no-cache \
    chromium \
    firefox \
    webkit \
    ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Set environment variables
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV NODE_ENV=test

# Run tests
CMD ["npm", "test"]
```

### Docker Compose for Testing

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  test-runner:
    build:
      context: .
      dockerfile: Dockerfile.test
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/test_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: test-secret
    volumes:
      - ./test-results:/app/test-results
      - ./coverage:/app/coverage
    command: npm test
```

### Run Tests in Docker

```bash
# Build and run tests
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit

# Run specific test suite
docker-compose -f docker-compose.test.yml run test-runner npm run test:e2e

# Clean up
docker-compose -f docker-compose.test.yml down -v
```

## Test Reports

### Allure Reports

```typescript
// tests/config/allure.setup.ts
import { allure } from 'allure-playwright';

export function setupAllure() {
  // Add environment info
  allure.writeEnvironmentInfo({
    'Node Version': process.version,
    'OS': process.platform,
    'Browser': 'Chromium',
    'Test Environment': process.env.TEST_ENV || 'local'
  });

  // Add categories
  allure.writeCategoriesDefinitions([
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
      messageRegex: '.*flaky.*'
    }
  ]);
}
```

### Jest HTML Reporter

```typescript
// jest.config.ts
export default {
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Test Report',
        outputPath: 'test-results/index.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        sort: 'status'
      }
    ]
  ]
};
```

### Playwright HTML Reporter

```typescript
// playwright.config.ts
export default {
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/results.json' 
    }],
    ['junit', { 
      outputFile: 'test-results/junit.xml' 
    }]
  ]
};
```

## Notifications

### Slack Notifications

```yaml
# .github/workflows/test-with-notifications.yml
jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run tests
        run: npm test
      
      - name: Notify Slack on success
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "✅ Tests passed!",
              attachments: [{
                color: 'good',
                text: `Branch: ${process.env.GITHUB_REF}\nCommit: ${process.env.GITHUB_SHA}`
              }]
            }
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify Slack on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "❌ Tests failed!",
              attachments: [{
                color: 'danger',
                text: `Branch: ${process.env.GITHUB_REF}\nCommit: ${process.env.GITHUB_SHA}\nView: ${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
              }]
            }
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Email Notifications

```yaml
# .github/workflows/test-with-email.yml
jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run tests
        run: npm test
      
      - name: Send email on failure
        if: failure()
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 465
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: Test Failed - ${{ github.repository }}
          body: |
            Tests failed in ${{ github.repository }}
            
            Branch: ${{ github.ref }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
            
            View details: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
          to: team@example.com
          from: ci@example.com
```

## Best Practices

### 1. Fast Feedback

```yaml
# Run fast tests first
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint  # 30 seconds
  
  unit-tests:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit  # 2 minutes
  
  api-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:api  # 5 minutes
  
  e2e-tests:
    needs: api-tests
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:e2e  # 10 minutes
```

### 2. Caching

```yaml
# Cache dependencies
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

# Cache Playwright browsers
- name: Cache Playwright browsers
  uses: actions/cache@v3
  with:
    path: ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
```

### 3. Retry Flaky Tests

```typescript
// playwright.config.ts
export default {
  retries: process.env.CI ? 2 : 0,
  
  use: {
    // Retry failed assertions
    actionTimeout: 10000,
    navigationTimeout: 30000
  }
};
```

### 4. Test Isolation

```typescript
// tests/setup/global-setup.ts
export default async function globalSetup() {
  // Create fresh test database
  await exec('createdb test_db');
  
  // Run migrations
  await exec('npx prisma migrate deploy');
}

// tests/setup/global-teardown.ts
export default async function globalTeardown() {
  // Drop test database
  await exec('dropdb test_db');
}
```

### 5. Environment Variables

```yaml
# .github/workflows/test.yml
env:
  NODE_ENV: test
  DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
  JWT_SECRET: ${{ secrets.TEST_JWT_SECRET }}
  API_KEY: ${{ secrets.TEST_API_KEY }}
```

### 6. Artifacts

```yaml
# Save test artifacts
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: |
      test-results/
      playwright-report/
      coverage/
    retention-days: 30
```

## Monitoring và Analytics

### Test Metrics

```typescript
// scripts/analyze-tests.ts
import fs from 'fs';

interface TestResult {
  name: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
}

function analyzeTests() {
  const results: TestResult[] = JSON.parse(
    fs.readFileSync('test-results/results.json', 'utf-8')
  );

  const metrics = {
    total: results.length,
    passed: results.filter(t => t.status === 'passed').length,
    failed: results.filter(t => t.status === 'failed').length,
    skipped: results.filter(t => t.status === 'skipped').length,
    avgDuration: results.reduce((sum, t) => sum + t.duration, 0) / results.length,
    slowestTests: results
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
  };

  console.log('Test Metrics:', metrics);
  
  // Send to monitoring service
  // await sendToDatadog(metrics);
}

analyzeTests();
```

## Kết Luận

CI/CD testing setup hoàn chỉnh với:
- ✅ GitHub Actions / GitLab CI
- ✅ Docker support
- ✅ Parallel execution
- ✅ Test reports
- ✅ Notifications
- ✅ Best practices

---

**Chương tiếp theo**: [Quản Lý Test Data và Fixtures](./16-test-data.md)

---

*Bài viết được viết bằng AI 🚀*

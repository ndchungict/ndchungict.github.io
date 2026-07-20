+++
date        = '2025-06-29T08:30:00+07:00'
draft       = false
title       = 'Cài đặt, cấu hình và cấu trúc dự án Playwright'
slug        = 'cai-dat-cau-hinh-du-an-playwright'
summary     = 'Khởi tạo dự án Playwright với TypeScript, hiểu từng phần trong playwright.config.ts, cấu trúc thư mục chuẩn, và cách quản lý nhiều môi trường (dev/staging/prod).'
thumbnail   = '/images/playwright-series/playwright-bai-02-cai-dat-cau-hinh-cau-truc-du-an.webp'
featured    = false
weight      = 2
categories  = ['it']
subcategories = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Cài Playwright thì chỉ một lệnh. Nhưng hiểu **`playwright.config.ts`** — trái tim cấu hình của toàn bộ dự án — mới là thứ quyết định test của bạn chạy ổn định và dễ bảo trì hay không. Bài này tập trung vào cấu hình và cấu trúc dự án thực chiến, dùng **TypeScript** (khuyến nghị mặc định).

## Yêu cầu

- **Node.js 18+** (LTS)
- Một trình quản lý gói: `npm`, `pnpm` hoặc `yarn`

## Khởi tạo dự án

```bash
npm init playwright@latest
```

Lệnh này hỏi vài câu (TypeScript hay JS, thư mục test, có thêm GitHub Actions không) rồi tự động:

- Cài `@playwright/test`
- Tải 3 trình duyệt (Chromium, Firefox, WebKit) cùng dependency
- Sinh `playwright.config.ts`, thư mục `tests/` và vài test mẫu

Cài trình duyệt thủ công khi cần (ví dụ trên CI):

```bash
npx playwright install --with-deps
```

## Cấu trúc thư mục chuẩn

```
my-e2e/
├── tests/                  # test specs
│   ├── auth/
│   │   └── login.spec.ts
│   └── checkout.spec.ts
├── pages/                  # Page Object Models
│   └── login.page.ts
├── fixtures/               # custom fixtures
│   └── auth.fixture.ts
├── utils/                  # helper, data factory
├── playwright.config.ts    # cấu hình trung tâm
├── .env                    # biến môi trường (gitignore)
├── package.json
└── tsconfig.json
```

Quy ước đặt tên file test: `*.spec.ts` hoặc `*.test.ts` — `testMatch` trong config kiểm soát việc này.

## Giải phẫu `playwright.config.ts`

Đây là file bạn sẽ mở đi mở lại. Cùng đọc một cấu hình thực tế và hiểu từng phần:

```ts
import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config'; // nạp biến từ .env

export default defineConfig({
  testDir: './tests',
  // Chạy các test trong cùng một file song song
  fullyParallel: true,
  // Cấm test.only lọt lên CI (tránh vô tình bỏ qua test khác)
  forbidOnly: !!process.env.CI,
  // Số lần retry: 2 trên CI, 0 ở local
  retries: process.env.CI ? 2 : 0,
  // Số worker song song
  workers: process.env.CI ? 4 : undefined,
  // Reporter: HTML để xem, list để theo dõi terminal
  reporter: [['html'], ['list']],

  // Cấu hình mặc định áp cho mọi test
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    // Chỉ giữ trace khi retry lần đầu thất bại — cân bằng dung lượng & hữu ích
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Mỗi "project" = một cấu hình trình duyệt/thiết bị
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'mobile',   use: { ...devices['Pixel 7'] } },
  ],

  // Tự khởi động dev server trước khi chạy test
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Những trường quan trọng nhất

| Trường | Vai trò | Lưu ý |
|---|---|---|
| `testDir` | Thư mục chứa test | |
| `fullyParallel` | Song song hóa cả test trong cùng file | Tăng tốc rõ rệt |
| `retries` | Số lần thử lại khi fail | Để 0 ở local để lộ flaky test |
| `workers` | Số tiến trình chạy song song | Giới hạn theo CPU/CI |
| `use.baseURL` | URL gốc, dùng cho `page.goto('/')` | Tách theo môi trường |
| `use.trace` | Khi nào ghi trace | `on-first-retry` là lựa chọn cân bằng |
| `projects` | Ma trận trình duyệt/thiết bị | Lọc bằng `--project=chromium` |
| `webServer` | Tự bật server app trước test | Rất tiện cho local & CI |

## `baseURL` — viết test ngắn và linh hoạt

Khi đã set `baseURL`, mọi `page.goto()` có thể dùng đường dẫn tương đối:

```ts
await page.goto('/login');     // → http://localhost:3000/login
await page.goto('/dashboard'); // → http://localhost:3000/dashboard
```

Đổi môi trường chỉ cần đổi biến `BASE_URL`, không phải sửa từng test.

## Quản lý nhiều môi trường

Dùng file `.env` + `dotenv`:

```bash
# .env (gitignore file này!)
BASE_URL=https://staging.myapp.com
TEST_USER=qa@myapp.com
TEST_PASS=secret
```

Chạy theo môi trường khác nhau bằng cách nạp env file tương ứng:

```bash
BASE_URL=https://prod.myapp.com npx playwright test
```

> Đừng bao giờ commit mật khẩu/token. Cho `.env` vào `.gitignore`, trên CI dùng secrets.

## Các lệnh chạy test hay dùng

```bash
# Chạy toàn bộ
npx playwright test

# Chỉ một file / một project / một test theo tên
npx playwright test tests/auth/login.spec.ts
npx playwright test --project=chromium
npx playwright test -g "đăng nhập thành công"

# Chế độ UI tương tác (rất nên dùng khi viết test)
npx playwright test --ui

# Chế độ có giao diện trình duyệt (không headless)
npx playwright test --headed

# Mở report HTML sau khi chạy
npx playwright show-report
```

## `tsconfig.json` tối thiểu

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@pages/*": ["pages/*"], "@fixtures/*": ["fixtures/*"] }
  }
}
```

`paths` giúp import gọn: `import { LoginPage } from '@pages/login.page'` thay vì đường dẫn tương đối dài ngoằng.

## Tóm tắt

- `npm init playwright@latest` dựng sẵn project + 3 trình duyệt.
- **`playwright.config.ts`** là trung tâm: nắm chắc `testDir`, `retries`, `workers`, `use.baseURL`, `trace`, `projects`, `webServer`.
- Tách cấu hình theo **môi trường** qua `.env` + `baseURL`, không hardcode.
- Tổ chức thư mục `tests/` `pages/` `fixtures/` `utils/` ngay từ đầu để dự án dễ scale.

---

**Bài trước**: [← Playwright là gì? Kiến trúc và so sánh với Selenium, Cypress](/posts/playwright-la-gi-kien-truc-va-so-sanh/)

**Bài tiếp theo**: [Playwright Test Runner: test, expect, hooks và annotations →](/posts/playwright-test-runner-test-expect-hooks/)

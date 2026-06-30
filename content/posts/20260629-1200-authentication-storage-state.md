+++
date        = '2026-06-29T12:00:00+07:00'
draft       = false
title       = 'Authentication và quản lý storage state'
slug        = 'authentication-storage-state'
summary     = 'Đăng nhập một lần, tái sử dụng cho mọi test bằng storageState. Setup project để chuẩn bị phiên, xử lý nhiều vai trò người dùng, và đăng nhập nhanh qua API thay vì qua UI.'
thumbnail   = '/images/playwright-series/playwright-bai-09-authentication-storage-state.webp'
featured    = false
weight      = 9
categories  = ['it']
tags        = ['playwright', 'automation', 'test', 'e2e', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Đăng nhập lại qua UI ở **mỗi** test vừa chậm vừa thừa. Nếu suite có 200 test, đó là 200 lần điền form đăng nhập — lãng phí hàng phút. Playwright giải quyết bằng **storageState**: đăng nhập một lần, lưu cookie + localStorage, rồi nạp lại cho mọi test. Bài này trình bày pattern chuẩn cho authentication.

## Ý tưởng: tách "đăng nhập" khỏi "test"

Trạng thái đăng nhập của một web nằm ở **cookies** và/hoặc **localStorage** (token). Playwright cho phép:

1. Đăng nhập một lần, **lưu** state đó ra file JSON.
2. Tạo BrowserContext mới **từ** file đó → context "đã đăng nhập sẵn".

```ts
// Lưu state sau khi đăng nhập
await context.storageState({ path: 'playwright/.auth/user.json' });

// Tạo context từ state đã lưu
const context = await browser.newContext({
  storageState: 'playwright/.auth/user.json',
});
```

## Pattern chuẩn: setup project

Cách được khuyến nghị là dùng một **project riêng** chạy trước để chuẩn bị auth, các project test phụ thuộc vào nó.

```ts
// playwright.config.ts
projects: [
  // 1. Project "setup" — chạy đăng nhập và lưu state
  { name: 'setup', testMatch: /.*\.setup\.ts/ },

  // 2. Project test phụ thuộc setup, dùng state đã lưu
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json',
    },
    dependencies: ['setup'],   // chạy sau khi setup xong
  },
],
```

```ts
// auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('đăng nhập', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER!);
  await page.getByLabel('Mật khẩu').fill(process.env.TEST_PASS!);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  // Đợi đăng nhập thành công TRƯỚC khi lưu state
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
```

Giờ **mọi** test trong project `chromium` đều khởi động ở trạng thái đã đăng nhập, không cần làm gì thêm:

```ts
test('xem trang cá nhân', async ({ page }) => {
  await page.goto('/profile');   // đã đăng nhập sẵn
  await expect(page.getByText(process.env.TEST_USER!)).toBeVisible();
});
```

> Nhớ cho `playwright/.auth/` vào `.gitignore` — file này chứa session nhạy cảm.

## Đăng nhập nhanh qua API (bỏ qua UI)

Điền form qua UI vẫn tốn vài giây. Nếu app cấp token qua API, đăng nhập **qua request** nhanh hơn nhiều và ổn định hơn (không phụ thuộc UI login):

```ts
setup('đăng nhập qua API', async ({ request }) => {
  const response = await request.post('/api/login', {
    data: { email: process.env.TEST_USER, password: process.env.TEST_PASS },
  });
  expect(response.ok()).toBeTruthy();

  // request context tự giữ cookie → lưu thẳng ra state
  await request.storageState({ path: 'playwright/.auth/user.json' });
});
```

Với token lưu trong localStorage, bạn có thể set thủ công:

```ts
setup('seed token', async ({ page }) => {
  const { token } = await (await fetch(...)).json();
  await page.addInitScript(t => localStorage.setItem('token', t), token);
  await page.goto('/');
  await page.context().storageState({ path: authFile });
});
```

## Nhiều vai trò người dùng

App thật thường có admin, editor, guest... Lưu mỗi vai trò một file, dùng project riêng:

```ts
// auth.setup.ts — đăng nhập từng vai trò
setup('auth admin',  async ({ page }) => { /* ... */
  await page.context().storageState({ path: 'playwright/.auth/admin.json' });
});
setup('auth editor', async ({ page }) => { /* ... */
  await page.context().storageState({ path: 'playwright/.auth/editor.json' });
});
```

```ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'admin-tests',
    testMatch: /.*\.admin\.spec\.ts/,
    use: { storageState: 'playwright/.auth/admin.json' },
    dependencies: ['setup'],
  },
  {
    name: 'editor-tests',
    testMatch: /.*\.editor\.spec\.ts/,
    use: { storageState: 'playwright/.auth/editor.json' },
    dependencies: ['setup'],
  },
],
```

### Đổi vai trò trong một file test

Dùng `test.use` để chỉ định state cho một nhóm:

```ts
test.describe('khu vực admin', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });
  test('xóa người dùng', async ({ page }) => { /* ... */ });
});
```

## Test luồng đăng nhập/đăng xuất thật

Một số test **cần** chạy không đăng nhập sẵn (ví dụ chính test login, hoặc test logout). Ghi đè bằng state rỗng:

```ts
test.describe('luồng đăng nhập', () => {
  test.use({ storageState: { cookies: [], origins: [] } });  // bắt đầu "sạch"

  test('báo lỗi khi sai mật khẩu', async ({ page }) => {
    await page.goto('/login');
    // ... test login từ trạng thái chưa đăng nhập
  });
});
```

## Lưu ý về hết hạn session

State được lưu một lần lúc setup. Nếu token hết hạn nhanh (vài phút) và suite chạy lâu, một số test có thể gặp 401. Giải pháp:

- Setup chạy **đầu mỗi lần** `npx playwright test`, nên thường đủ tươi cho một lần chạy.
- Với token ngắn hạn, cân nhắc đăng nhập theo **worker scope fixture** thay vì file dùng chung.

## Tóm tắt

- **storageState** lưu cookie + localStorage để tái sử dụng phiên đăng nhập → bỏ qua login lặp lại.
- Pattern chuẩn: **setup project** chạy `auth.setup.ts`, các project test `dependencies: ['setup']` và dùng `storageState`.
- **Đăng nhập qua API** nhanh và ổn định hơn qua UI; lưu mỗi **vai trò** một file state.
- Ghi đè bằng state rỗng khi cần test chính luồng login/logout; cho thư mục `.auth/` vào `.gitignore`.

---

**Bài trước**: [← Network: intercept, mock API và route](/posts/network-intercept-mock-api/)

**Bài tiếp theo**: [Xử lý nâng cao: iframe, tab, upload/download, dialog →](/posts/xu-ly-nang-cao-iframe-tab-upload-download/)

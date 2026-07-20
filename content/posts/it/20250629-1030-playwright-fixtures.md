+++
date        = '2025-06-29T10:30:00+07:00'
draft       = false
title       = 'Fixtures — kiến trúc test mạnh mẽ của Playwright'
slug        = 'playwright-fixtures'
summary     = 'Fixtures là hệ thống dependency injection của Playwright. Học cách tạo custom fixture, quản lý scope (test/worker), tự động setup/teardown, override fixture built-in và xây nền tảng test sạch, tái sử dụng.'
thumbnail   = '/images/playwright-series/playwright-bai-06-fixtures.webp'
featured    = false
weight      = 6
categories  = ['it']
subcategories = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Nhiều người dùng Playwright cả năm mà chưa khai thác **fixtures** — và đó là phần khiến code test của họ lặp lại, rối rắm. Fixtures là hệ thống **dependency injection** của Playwright: nó cấp đúng những gì mỗi test cần, tự setup trước và teardown sau. Đây là chìa khóa để có một test suite sạch ở quy mô lớn.

## Fixture là gì?

Mỗi tham số bạn destructure trong `test(...)` là một fixture:

```ts
test('demo', async ({ page, context, request, browserName }) => { ... });
```

`page`, `context`, `request`, `browser`, `browserName`... đều là **fixture built-in**. Playwright khởi tạo chúng **theo yêu cầu** (lazy): bạn không dùng `request` thì nó không được tạo.

Ưu điểm so với hook `beforeEach`:

| | `beforeEach` | Fixture |
|---|---|---|
| Tái sử dụng giữa file | Khó (phải copy) | Import là dùng |
| Lazy (chỉ tạo khi cần) | ❌ luôn chạy | ✅ chỉ khi test yêu cầu |
| Có teardown gắn liền | Tách rời (`afterEach`) | Gói chung một chỗ |
| Phụ thuộc lẫn nhau | Khó kiểm soát | Tự giải quyết theo graph |

## Tạo custom fixture

Mở rộng `test` bằng `test.extend`:

```ts
// fixtures/base.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/login.page';

type MyFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    // --- setup ---
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // --- cung cấp giá trị cho test ---
    await use(loginPage);

    // --- teardown (chạy sau khi test xong) ---
    // ví dụ: cleanup, đóng kết nối...
  },
});

export { expect } from '@playwright/test';
```

Trong test, chỉ cần khai báo là có:

```ts
import { test, expect } from '@fixtures/base.fixture';

test('đăng nhập', async ({ loginPage }) => {
  await loginPage.login('user', 'pass');
  // ...
});
```

Mô hình `setup → await use(value) → teardown` là trái tim của fixture. Mọi thứ **trước** `use()` là chuẩn bị; **sau** `use()` là dọn dẹp.

## Scope: `test` vs `worker`

Mặc định fixture có scope **test** — tạo mới cho mỗi test. Nhưng thứ tốn kém (đăng nhập, kết nối DB) nên dùng scope **worker** — tạo một lần, dùng chung cho mọi test trong cùng worker:

```ts
export const test = base.extend<{}, { dbConnection: DbClient }>({
  dbConnection: [async ({}, use) => {
    const db = await connectToDb();   // tốn kém → chỉ một lần mỗi worker
    await use(db);
    await db.close();
  }, { scope: 'worker' }],  // ← đánh dấu scope worker
});
```

> Lưu ý cách ly: fixture worker-scope **dùng chung** state giữa các test trong worker. Đừng đặt dữ liệu dễ thay đổi ở đây nếu test có thể làm "bẩn" lẫn nhau.

## Fixture tự động (`auto`)

Fixture `auto` chạy cho **mọi** test dù test không khai báo — hữu ích cho logging, gắn thông tin chung:

```ts
export const test = base.extend<{ logSteps: void }>({
  logSteps: [async ({}, use, testInfo) => {
    console.log(`▶ Bắt đầu: ${testInfo.title}`);
    await use();
    console.log(`■ Kết thúc: ${testInfo.title} → ${testInfo.status}`);
  }, { auto: true }],
});
```

## Override fixture built-in

Bạn có thể "ghi đè" fixture có sẵn. Ví dụ tự động đăng nhập bằng cách override `page`:

```ts
export const test = base.extend({
  // mọi test dùng fixture này sẽ có sẵn một page đã đăng nhập
  page: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.TEST_USER!);
    await page.getByLabel('Mật khẩu').fill(process.env.TEST_PASS!);
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await page.waitForURL('**/dashboard');
    await use(page);   // bàn giao page đã login cho test
  },
});
```

(Ở bài Authentication ta sẽ thấy cách làm này nhanh hơn nhiều bằng `storageState`.)

## Tham số hóa qua `test.use` và `options`

Có thể định nghĩa fixture kiểu **option** để cấu hình từ ngoài:

```ts
export const test = base.extend<{ role: string }>({
  role: ['guest', { option: true }],  // giá trị mặc định, có thể override
  // fixture khác phụ thuộc role
  authedPage: async ({ page, role }, use) => {
    await loginAs(page, role);
    await use(page);
  },
});

// Trong một file test, đổi giá trị option:
test.use({ role: 'admin' });
test('chức năng admin', async ({ authedPage }) => { /* ... */ });
```

## Fixture phụ thuộc fixture

Fixtures tự xây thành đồ thị phụ thuộc. Playwright khởi tạo theo đúng thứ tự và teardown ngược lại:

```ts
export const test = base.extend<{
  apiClient: ApiClient;
  seededUser: User;
}>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
  seededUser: async ({ apiClient }, use) => {   // phụ thuộc apiClient
    const user = await apiClient.createUser();
    await use(user);
    await apiClient.deleteUser(user.id);         // dọn dẹp
  },
});
```

`seededUser` cần `apiClient` → Playwright tạo `apiClient` trước, `seededUser` sau; khi test xong thì teardown `seededUser` rồi mới tới `apiClient`.

## Tóm tắt

- Fixtures là **DI** của Playwright: cấp đúng thứ test cần, **lazy**, gói gọn cả setup lẫn teardown quanh `await use()`.
- Dùng scope **worker** cho tài nguyên đắt đỏ (DB, đăng nhập chung); scope **test** cho thứ cần cách ly.
- Fixture `auto` cho hành vi áp dụng toàn cục; **override** fixture built-in (như `page`) để chèn logic chung.
- Fixtures phụ thuộc nhau tạo thành graph — nền tảng để dựng test suite lớn mà vẫn sạch và tái sử dụng cao.

---

**Bài trước**: [← Actions, Auto-waiting và Web-first Assertions](/posts/actions-auto-waiting-web-first-assertions/)

**Bài tiếp theo**: [Page Object Model và tổ chức test ở quy mô lớn →](/posts/page-object-model-to-chuc-test/)

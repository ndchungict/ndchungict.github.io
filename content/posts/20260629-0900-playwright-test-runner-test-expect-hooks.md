+++
date        = '2026-06-29T09:00:00+07:00'
draft       = false
title       = 'Playwright Test Runner: test, expect, hooks và annotations'
slug        = 'playwright-test-runner-test-expect-hooks'
summary     = 'Nắm chắc test runner của Playwright: cấu trúc test/describe, các hook, web-first assertions với expect, soft assertions, annotations (skip/fixme/fail) và cách nhóm/tag test.'
thumbnail   = '/images/playwright-series/playwright-bai-03-test-runner-test-expect-hooks.webp'
featured    = false
weight      = 3
categories  = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Playwright đi kèm test runner riêng (`@playwright/test`) — không cần Jest hay Mocha. Nó được thiết kế dành riêng cho test trình duyệt: hiểu `page`, hỗ trợ song song, có `expect` tự retry. Bài này mổ xẻ API của test runner mà bạn dùng hằng ngày.

## Cấu trúc một test cơ bản

```ts
import { test, expect } from '@playwright/test';

test('hiển thị tiêu đề trang chủ', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/My App/);
});
```

`{ page }` là một **fixture** Playwright cung cấp sẵn — một `Page` mới, trong một `BrowserContext` cô lập riêng cho mỗi test. Ta sẽ đào sâu fixtures ở bài riêng.

## Nhóm test với `describe`

```ts
test.describe('Trang đăng nhập', () => {
  test('đăng nhập thành công', async ({ page }) => { /* ... */ });
  test('báo lỗi khi sai mật khẩu', async ({ page }) => { /* ... */ });
});
```

`describe` giúp gom test cùng chủ đề, và là phạm vi để áp `beforeEach`, `test.use()`, hay chạy tuần tự bằng `test.describe.serial()`.

## Hooks — chạy code trước/sau test

```ts
test.describe('Giỏ hàng', () => {
  test.beforeAll(async () => {
    // chạy một lần trước tất cả test trong nhóm — seed dữ liệu chung
  });

  test.beforeEach(async ({ page }) => {
    // chạy trước MỖI test — ví dụ điều hướng tới trang
    await page.goto('/cart');
  });

  test.afterEach(async ({ page }, testInfo) => {
    // dọn dẹp sau mỗi test; testInfo cho biết kết quả
    if (testInfo.status !== testInfo.expectedStatus) {
      console.log(`Test thất bại: ${testInfo.title}`);
    }
  });

  test.afterAll(async () => {
    // dọn dẹp một lần sau cùng
  });
});
```

> Lưu ý quan trọng: với `fullyParallel`, mỗi worker là một process riêng. `beforeAll` chạy **một lần mỗi worker**, không phải một lần cho toàn bộ suite. Đừng giả định nó chạy duy nhất một lần trên cả CI.

## `expect` — web-first assertions

Đây là điểm khác biệt lớn so với assertion thường. Assertion của Playwright **tự retry** cho tới khi điều kiện đúng hoặc hết timeout (mặc định 5s), nên bạn không cần chờ thủ công:

```ts
// Tự đợi phần tử hiện ra rồi mới kiểm tra — không cần wait riêng
await expect(page.getByRole('alert')).toBeVisible();
await expect(page.getByTestId('total')).toHaveText('1.250.000đ');
await expect(page.getByRole('listitem')).toHaveCount(3);
```

So sánh với assertion "thường" (không retry):

```ts
// ❌ Chụp giá trị NGAY lập tức — dễ fail nếu UI chưa cập nhật
const count = await page.getByRole('listitem').count();
expect(count).toBe(3);

// ✅ Tự retry tới khi đủ 3 phần tử hoặc timeout
await expect(page.getByRole('listitem')).toHaveCount(3);
```

Nguyên tắc vàng: **ưu tiên `expect(locator).toXxx()`** thay vì lấy giá trị ra rồi so sánh.

### Các matcher hay dùng

| Matcher | Kiểm tra |
|---|---|
| `toBeVisible()` / `toBeHidden()` | hiển thị / ẩn |
| `toHaveText()` / `toContainText()` | nội dung text |
| `toHaveValue()` | giá trị input |
| `toBeEnabled()` / `toBeDisabled()` | trạng thái |
| `toBeChecked()` | checkbox/radio |
| `toHaveCount()` | số phần tử khớp locator |
| `toHaveURL()` / `toHaveTitle()` | URL / tiêu đề trang |
| `toHaveAttribute()` / `toHaveClass()` | thuộc tính / class |

### Soft assertions — không dừng ngay khi fail

Mặc định test dừng ở assertion đầu tiên thất bại. Đôi khi bạn muốn kiểm tra nhiều thứ rồi báo cáo tất cả lỗi:

```ts
await expect.soft(page.getByTestId('name')).toHaveText('Chung');
await expect.soft(page.getByTestId('email')).toHaveText('a@b.com');
await expect.soft(page.getByTestId('role')).toHaveText('Admin');
// Test vẫn chạy hết; cuối cùng đánh dấu fail nếu có soft assertion sai
```

### Tùy chỉnh timeout cho một assertion

```ts
await expect(page.getByText('Đang xử lý...')).toBeHidden({ timeout: 15000 });
```

## Annotations — skip, fixme, fail, slow

```ts
test.skip('tính năng chưa làm', async ({ page }) => {});
test.fixme('đang lỗi, sẽ sửa sau', async ({ page }) => {});

// Có điều kiện
test('chỉ chạy trên chromium', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chỉ áp dụng cho Chromium');
  // ...
});

// Báo cho runner biết test này vốn chậm → nhân đôi timeout
test('upload file lớn', async ({ page }) => {
  test.slow();
  // ...
});

// test.fail: test này ĐANG được kỳ vọng sẽ fail (bug đã biết)
test('bug #123 chưa fix', async ({ page }) => {
  test.fail();
  // ...
});
```

## `test.only` — chạy đúng một test khi debug

```ts
test.only('chỉ chạy test này', async ({ page }) => {});
```

Cực tiện khi đang viết, nhưng **đừng commit**. Đặt `forbidOnly: !!process.env.CI` trong config để CI báo lỗi nếu lỡ commit `test.only`.

## Gắn tag và lọc test

```ts
test('thanh toán @smoke @critical', async ({ page }) => {});

test.describe('Báo cáo', { tag: '@slow' }, () => {
  test('xuất Excel', async ({ page }) => {});
});
```

Chạy theo tag:

```bash
npx playwright test --grep @smoke
npx playwright test --grep-invert @slow   # bỏ qua test gắn @slow
```

## Truyền dữ liệu test (data-driven)

```ts
const users = [
  { role: 'admin', canDelete: true },
  { role: 'editor', canDelete: false },
];

for (const u of users) {
  test(`quyền xóa của ${u.role}`, async ({ page }) => {
    // ... kiểm tra theo u.canDelete
  });
}
```

## Tóm tắt

- Test runner của Playwright là **độc lập**, hiểu `page` và song song hóa sẵn.
- Dùng `describe` để nhóm, `beforeEach/afterEach` để setup/teardown — nhớ hook chạy **mỗi worker**.
- **Web-first `expect`** tự retry: luôn ưu tiên `expect(locator).toXxx()` thay vì lấy giá trị rồi so sánh.
- `soft`, `skip/fixme/fail/slow`, `only`, và **tag + `--grep`** là bộ công cụ để tổ chức và lọc test linh hoạt.

---

**Bài trước**: [← Cài đặt, cấu hình và cấu trúc dự án Playwright](/posts/cai-dat-cau-hinh-du-an-playwright/)

**Bài tiếp theo**: [Locators — chiến lược định vị phần tử hiện đại →](/posts/playwright-locators-dinh-vi-phan-tu/)

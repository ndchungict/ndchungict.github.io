+++
date        = '2026-07-01T09:40:00+07:00'
draft       = false
title       = 'Bài 23 — Fixtures trong Playwright: tái sử dụng setup giữa các test'
slug        = 'fixtures-trong-playwright'
summary     = 'Fixtures cung cấp môi trường cô lập và tái sử dụng setup/teardown giữa các test. Hiểu fixtures built-in (page, context), beforeEach/afterEach vs beforeAll/afterAll, và cách viết custom fixture.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-23-fixtures-trong-playwright.webp'
featured    = false
weight      = 24
categories  = ['automation']
tags        = ['automation-test', 'playwright', 'fixtures']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

**Fixtures** là cơ chế của Playwright để cung cấp cho mỗi test những gì nó cần (một trang, một page object, dữ liệu) một cách **cô lập và tái sử dụng**. Đây là nền tảng đằng sau tính độc lập của test mà [Bài 14](../thiet-ke-test-case-aaa/) nhấn mạnh. Hiểu fixtures giúp bạn loại bỏ code setup lặp lại và giữ test sạch.

## page là một fixture

Bạn đã dùng fixture từ Bài 15 mà chưa gọi tên. Trong `test('...', async ({ page }) => {})`, chính `page` là một **fixture built-in** do Playwright cung cấp.

Điểm quan trọng: mỗi test nhận một `page` **mới, sạch, cô lập** — trình duyệt riêng, cookie riêng, storage riêng. Đây là lý do test Playwright độc lập mặc định: không test nào ảnh hưởng test khác. Playwright tự khởi tạo `page` trước test và dọn dẹp sau test.

## Các fixture built-in thường dùng

Lấy ra bằng destructuring ([Bài 9](../object-trong-javascript/)) trong tham số test:

```javascript
test('ví dụ', async ({ page, context, request }) => {
  // page    — một tab trình duyệt cô lập
  // context — "phiên" trình duyệt (chứa cookie, storage); một context có thể mở nhiều page
  // request — client gọi API trực tiếp (dùng ở Bài 29)
});
```

| Fixture | Vai trò |
|---------|---------|
| `page` | Một tab trình duyệt để thao tác |
| `context` | Phiên trình duyệt cô lập (cookie, storage) |
| `browser` | Instance trình duyệt (ít dùng trực tiếp) |
| `request` | Gọi API độc lập với UI |

## beforeEach và afterEach: setup/teardown lặp lại

Khi nhiều test cùng một file cần bước chuẩn bị giống nhau (ví dụ đều mở trang login), dùng hook `beforeEach`:

```javascript
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

test.describe('Nhóm test đăng nhập', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();     // mọi test trong nhóm đều bắt đầu ở trang login
  });

  test('đăng nhập thành công', async () => {
    await loginPage.dangNhap('test@demo.com', 'Test@1234');
    await expect(loginPage.page).toHaveURL('/dashboard');
  });

  test('đăng nhập sai mật khẩu', async () => {
    await loginPage.dangNhap('test@demo.com', 'sai');
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
```

- `test.describe(...)` nhóm các test liên quan.
- `test.beforeEach(...)` chạy **trước mỗi** test trong nhóm — nơi đặt phần Arrange chung.
- `test.afterEach(...)` chạy **sau mỗi** test — nơi dọn dẹp (xóa dữ liệu test, đăng xuất) nếu cần.

Điều này loại bỏ code lặp mà vẫn giữ mỗi test độc lập (mỗi test một `page` mới).

**Phân biệt với `beforeAll`/`afterAll`:** cặp `...Each` chạy **trước/sau MỖI test**; cặp `...All` chạy **một lần duy nhất** cho cả nhóm (trước test đầu tiên / sau test cuối cùng).

```javascript
test.beforeAll(async () => {
  // Chạy MỘT LẦN — vd chuẩn bị dữ liệu dùng chung, kết nối tốn kém
});

test.beforeEach(async ({ page }) => {
  // Chạy TRƯỚC MỖI test — vd mở lại trang, reset trạng thái
});
```

Quy tắc chọn: dùng `beforeEach` cho phần setup mỗi test cần *làm mới* (giữ tính độc lập); chỉ dùng `beforeAll` cho việc *nặng, dùng chung, không đổi giữa các test*. Cẩn thận: dữ liệu tạo trong `beforeAll` bị chia sẻ giữa các test — nếu một test sửa nó, có thể phá tính độc lập.

## Custom fixture: nâng cao tái sử dụng

Khi muốn cung cấp sẵn một đối tượng cho nhiều file (không chỉ trong một `describe`), viết **custom fixture** bằng `test.extend`. Ví dụ cung cấp sẵn một `LoginPage` cho mọi test:

```javascript
// fixtures.js
const base = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');

exports.test = base.test.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();     // setup
    await use(loginPage);       // giao đối tượng cho test dùng
    // (code sau use() là teardown, chạy sau test)
  },
});
exports.expect = base.expect;
```

Dùng trong test:

```javascript
const { test, expect } = require('./fixtures');

test('đăng nhập', async ({ loginPage }) => {
  await loginPage.dangNhap('test@demo.com', 'Test@1234');
  // ...
});
```

Giờ `loginPage` đã sẵn sàng (đã mở trang) mà test không cần tự khởi tạo. Đây là cách gói setup phức tạp thành thứ dùng lại được toàn dự án.

## beforeEach hay custom fixture: chọn cái nào

| Nhu cầu | Dùng |
|---------|------|
| Setup chung cho các test trong **một file/describe** | `beforeEach` |
| Cung cấp đối tượng/tài nguyên tái dùng **nhiều file** | Custom fixture |
| Cần teardown gắn liền với setup | Custom fixture (dùng `use`) |

> Sức mạnh thật của fixtures là **cô lập + tái sử dụng cùng lúc**: mỗi test có môi trường sạch riêng, nhưng bạn không phải viết lại code setup. Đây là nền tảng để chạy song song an toàn (Bài 28). Đừng lạm dụng biến toàn cục hay chia sẻ trạng thái giữa test — nó phá vỡ tính độc lập và gây lỗi chập chờn.

[Bài 24](../test-data-va-bien-moi-truong/) học cách quản lý **dữ liệu test và biến môi trường** với file `.env`, tách dữ liệu nhạy cảm ra khỏi code.

## 🛠 Thực hành

1. **Dùng beforeEach:** gom một nhóm test đăng nhập vào `test.describe`, chuyển bước mở trang login vào `beforeEach`, xác nhận các test vẫn chạy độc lập.
2. **Kiểm chứng cô lập:** viết hai test, test đầu điền dữ liệu vào một ô; xác nhận test thứ hai bắt đầu với trang sạch (ô trống) — chứng minh mỗi test có `page` riêng.
3. **Custom fixture:** viết một fixture cung cấp sẵn một page object đã ở trạng thái mong muốn, và dùng nó trong một test.

## Website tham khảo

- [Playwright — Fixtures](https://playwright.dev/docs/test-fixtures) — hướng dẫn đầy đủ, gồm custom fixture.
- [Playwright — Test hooks (beforeEach...)](https://playwright.dev/docs/api/class-test#test-before-each) — các hook setup/teardown.
- [Playwright — Test isolation](https://playwright.dev/docs/browser-contexts) — cơ chế cô lập giữa các test.

+++
date        = '2024-07-01T10:25:00+07:00'
draft       = false
title       = 'Bài 32 — Project thực chiến: xây dựng test suite hoàn chỉnh cho website thương mại điện tử'
slug        = 'xay-dung-test-suite-hoan-chinh'
summary     = 'Áp dụng toàn bộ series vào một project thật: chọn website demo, thiết kế cấu trúc dự án và POM, viết test cho các luồng cốt lõi (tìm kiếm, giỏ hàng, thanh toán) theo chuẩn chuyên nghiệp.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-32-project-thuc-chien-test-suite-ecommerce.webp'
featured    = false
weight      = 33
categories  = ['it']
subcategories = ['automation']
tags        = ['automation-test', 'playwright', 'project']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Giai đoạn 6 là nơi mọi thứ hội tụ. Thay vì học khái niệm mới, bạn **xây dựng một project thật** — bộ test hoàn chỉnh cho một website thương mại điện tử. Đây là bài quan trọng nhất về mặt thực hành: nó biến kiến thức rời rạc thành một sản phẩm có thể đưa vào portfolio.

## Chọn website để test

Dùng một trang demo công khai, ổn định, được thiết kế cho mục đích luyện automation:

- **[demo.playwright.dev/todomvc](https://demo.playwright.dev/todomvc)** — đơn giản, tốt để bắt đầu.
- **[saucedemo.com](https://www.saucedemo.com)** — trang bán hàng demo, có đăng nhập, sản phẩm, giỏ hàng, thanh toán — lý tưởng cho project này.

Bài này lấy **saucedemo.com** làm ví dụ (có đủ luồng của một e-commerce). Bạn có thể áp dụng y nguyên cách làm cho trang khác.

## Bước 1 — Thiết kế cấu trúc dự án

Trước khi viết test, dựng cấu trúc rõ ràng (tổng hợp [Bài 16](../cau-truc-project-playwright/), [Bài 22](../page-object-model/)):

```text
ecommerce-tests/
├── pages/                   # Page Objects
│   ├── LoginPage.js
│   ├── ProductsPage.js
│   ├── CartPage.js
│   └── CheckoutPage.js
├── tests/                   # Test theo luồng
│   ├── auth.setup.js        # đăng nhập một lần (Bài 26)
│   ├── login.spec.js
│   ├── products.spec.js
│   ├── cart.spec.js
│   └── checkout.spec.js
├── data/                    # dữ liệu test (Bài 24)
│   └── users.js
├── .env                     # bí mật (không commit)
├── .gitignore
├── playwright.config.js
└── package.json
```

## Bước 2 — Xác định các luồng cần test

Áp dụng tư duy thiết kế test case ([Bài 14](../thiet-ke-test-case-aaa/)) — liệt kê các luồng nghiệp vụ cốt lõi và trường hợp cần bao phủ:

| Luồng | Test case cần có |
|-------|------------------|
| Đăng nhập | Đúng thông tin → vào được; sai mật khẩu → báo lỗi; tài khoản bị khóa → báo lỗi |
| Danh sách sản phẩm | Hiển thị đủ sản phẩm; sắp xếp theo giá/tên đúng |
| Giỏ hàng | Thêm sản phẩm → giỏ tăng; xóa sản phẩm → giỏ giảm; số lượng đúng |
| Thanh toán | Điền thông tin → hoàn tất; thiếu thông tin → báo lỗi; tổng tiền đúng |

Chú ý bao gồm cả **trường hợp lỗi**, không chỉ happy path.

## Bước 3 — Viết Page Objects

Ví dụ `LoginPage.js` (áp dụng [Bài 22](../page-object-model/)):

```javascript
// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async dangNhap(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

module.exports = { LoginPage };
```

Làm tương tự cho `ProductsPage`, `CartPage`, `CheckoutPage` — mỗi trang gói locator và thao tác của nó.

## Bước 4 — Viết test cho từng luồng

Ví dụ `login.spec.js` với data-driven ([Bài 24](../test-data-va-bien-moi-truong/)) cho các trường hợp lỗi:

```javascript
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

test.describe('Đăng nhập', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('đăng nhập hợp lệ thì vào trang sản phẩm', async ({ page }) => {
    await loginPage.dangNhap('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);
  });

  const truongHopLoi = [
    { user: 'locked_out_user', pass: 'secret_sauce', loi: 'locked out' },
    { user: 'standard_user',   pass: 'sai',          loi: 'do not match' },
  ];

  for (const tc of truongHopLoi) {
    test(`đăng nhập "${tc.user}" với lỗi thì hiện thông báo`, async () => {
      await loginPage.dangNhap(tc.user, tc.pass);
      await expect(loginPage.errorMessage).toContainText(tc.loi);
    });
  }
});
```

Ví dụ `checkout.spec.js` — luồng end-to-end đầy đủ, tận dụng storageState để bỏ qua login ([Bài 26](../authentication-state/)):

```javascript
test('hoàn tất đơn hàng với một sản phẩm', async ({ page }) => {
  const products = new ProductsPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);

  // Arrange + Act
  await products.goto();
  await products.themVaoGio('Sauce Labs Backpack');
  await cart.goto();
  await cart.thanhToan();
  await checkout.dienThongTin('Nguyen', 'Chung', '700000');
  await checkout.hoanTat();

  // Assert
  await expect(page.getByText('Thank you for your order')).toBeVisible();
});
```

## Bước 5 — Chạy và kiểm chứng

- Chạy toàn bộ: `npx playwright test`.
- Đảm bảo test **độc lập** (chạy song song vẫn pass — [Bài 28](../chay-song-song-report-debug/)).
- Xem HTML report, xác nhận không có test flaky (chạy vài lần đều ổn định).

> Đây là lúc mọi nguyên tắc trong series được kiểm chứng thật: POM giúp test gọn, fixtures giữ độc lập, data-driven phủ nhiều case, storageState tăng tốc. Một bộ test được tổ chức tốt sẽ *dễ đọc như tài liệu nghiệp vụ* — người mới nhìn vào là hiểu ứng dụng làm gì. Đó là mục tiêu bạn hướng tới.

[Bài 33](../hoan-thien-ci-pipeline-portfolio/) hoàn thiện project: đưa lên CI, viết README, và biến nó thành portfolio để đi xin việc.

## 🛠 Thực hành

1. **Dựng khung project:** tạo cấu trúc thư mục như trên cho saucedemo.com (hoặc trang bạn chọn), cấu hình `baseURL` và `.env`.
2. **Viết Page Objects:** hoàn thành ít nhất `LoginPage`, `ProductsPage`, `CartPage`.
3. **Viết test các luồng:** viết test cho đăng nhập (gồm case lỗi), thêm/xóa giỏ hàng, và một luồng thanh toán end-to-end hoàn chỉnh. Đảm bảo tất cả pass ổn định khi chạy song song.

## Website tham khảo

- [Sauce Demo](https://www.saucedemo.com) — website thương mại điện tử demo để luyện tập.
- [Playwright — Best Practices](https://playwright.dev/docs/best-practices) — đối chiếu project của bạn với chuẩn.
- [Playwright — Page Object Models](https://playwright.dev/docs/pom) — cấu trúc POM cho dự án lớn.

+++
date        = '2025-06-29T11:00:00+07:00'
draft       = false
title       = 'Page Object Model và tổ chức test ở quy mô lớn'
slug        = 'page-object-model-to-chuc-test'
summary     = 'Áp dụng Page Object Model đúng cách trong Playwright: tách locator và hành động, kết hợp POM với fixtures, component object, và những sai lầm POM thường gặp khiến test khó bảo trì.'
thumbnail   = '/images/playwright-series/playwright-bai-07-page-object-model.webp'
featured    = false
weight      = 7
columns     = 2
categories  = ['it']
subcategories = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Khi test vượt vài chục file, viết locator trực tiếp trong mỗi test trở thành cơn ác mộng bảo trì: đổi một nút, sửa hai mươi chỗ. **Page Object Model (POM)** giải quyết bằng cách gói locator và hành động của mỗi trang vào một class. Bài này trình bày POM theo phong cách Playwright hiện đại — và những bẫy cần tránh.

## Vấn đề POM giải quyết

```ts
// ❌ Không POM: locator rải khắp nơi, lặp lại, khó sửa
test('mua hàng', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('a@b.com');
  await page.getByLabel('Mật khẩu').fill('123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  // ... lặp lại y hệt ở 20 test khác
});
```

Khi UI đăng nhập đổi, bạn phải sửa từng test. POM gom logic này về **một nơi duy nhất**.

## Page Object cơ bản

```ts
// pages/login.page.ts
import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Khởi tạo locator MỘT lần — không truy DOM ở đây, chỉ là "công thức"
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Mật khẩu');
    this.submitButton = page.getByRole('button', { name: 'Đăng nhập' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  // Hành động nghiệp vụ — đặt tên theo ý định, không theo thao tác kỹ thuật
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toHaveText(message);
  }
}
```

Test giờ đọc như mô tả nghiệp vụ:

```ts
test('đăng nhập sai mật khẩu', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('a@b.com', 'sai-mat-khau');
  await loginPage.expectError('Email hoặc mật khẩu không đúng');
});
```

## Kết hợp POM với fixtures — cách làm "Playwright-thuần"

Thay vì `new LoginPage(page)` ở mọi test, cấp nó qua fixture (xem lại bài Fixtures):

```ts
// fixtures/pages.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { CartPage } from '@pages/cart.page';

type Pages = { loginPage: LoginPage; cartPage: CartPage };

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  cartPage:  async ({ page }, use) => { await use(new CartPage(page)); },
});
export { expect } from '@playwright/test';
```

```ts
import { test } from '@fixtures/pages.fixture';

test('mua hàng', async ({ loginPage, cartPage }) => {
  await loginPage.goto();
  await loginPage.login('a@b.com', '123');
  await cartPage.addItem('iPhone 16');
  await cartPage.expectItemCount(1);
});
```

Sạch, không lặp, mỗi page object tự được khởi tạo khi cần.

## Component Object — cho phần UI dùng lại

Không phải mọi thứ là "trang". Header, modal, bảng dữ liệu xuất hiện ở nhiều trang → tách thành **component object**:

```ts
// components/header.component.ts
export class Header {
  constructor(private page: Page) {}
  readonly userMenu = this.page.getByRole('button', { name: 'Tài khoản' });

  async logout() {
    await this.userMenu.click();
    await this.page.getByRole('menuitem', { name: 'Đăng xuất' }).click();
  }
}
```

Page object có thể chứa component object — phản ánh đúng cấu trúc UI thật.

## Những sai lầm POM thường gặp

**1. Trả về assertion ra ngoài thay vì... đừng.** Tranh cãi muôn thuở: assertion nên nằm trong hay ngoài page object? Thực dụng: đặt các **assertion chung, lặp lại** (`expectError`) trong POM; giữ assertion **đặc thù nghiệp vụ** trong test để đọc rõ ý định.

**2. Đừng bọc lại Playwright API một cách vô nghĩa.**

```ts
// ❌ Vô ích: chỉ làm dày thêm một lớp
async clickSubmit() { await this.submitButton.click(); }
// ✅ Page object nên diễn đạt NGHIỆP VỤ, không phải từng cú click
async login(email, password) { /* nhiều bước gộp lại */ }
```

**3. Đừng lưu trạng thái DOM trong constructor.** Locator là công thức — khởi tạo trong constructor thì OK. Nhưng **đừng** `await` hay đọc text trong constructor; mọi thao tác phải nằm trong method `async`.

**4. Đừng để page object "biết" quá nhiều về nhau.** Hạn chế một page object gọi thẳng vào page object khác; điều phối luồng nên là việc của test hoặc một lớp "flow" riêng.

## Tổ chức thư mục khi scale

```
tests/
  auth/login.spec.ts
  shop/checkout.spec.ts
pages/
  login.page.ts
  cart.page.ts
components/
  header.component.ts
  product-card.component.ts
fixtures/
  pages.fixture.ts
utils/
  data-factory.ts        # sinh dữ liệu test
  api-helpers.ts          # seed/cleanup qua API
```

## Tóm tắt

- POM gom **locator + hành động** của mỗi trang vào một class → đổi UI chỉ sửa một chỗ.
- Khởi tạo **locator trong constructor** (chỉ là công thức), mọi thao tác đặt trong method `async`.
- Kết hợp POM với **fixtures** để loại bỏ `new ...Page(page)` lặp lại; tách **component object** cho UI dùng chung.
- Đặt tên method theo **nghiệp vụ**, tránh bọc lại Playwright API một cách vô nghĩa, và đừng để các page object phụ thuộc chéo nhau.

---

**Bài trước**: [← Fixtures — kiến trúc test mạnh mẽ của Playwright](/posts/playwright-fixtures/)

**Bài tiếp theo**: [Network: intercept, mock API và route →](/posts/network-intercept-mock-api/)

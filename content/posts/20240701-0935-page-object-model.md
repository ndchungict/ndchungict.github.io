+++
date        = '2024-07-01T09:35:00+07:00'
draft       = false
title       = 'Bài 22 — Page Object Model: tổ chức test dễ bảo trì'
slug        = 'page-object-model'
summary     = 'Page Object Model (POM) tách locator và thao tác của mỗi trang vào một class riêng, giúp test sạch, dễ đọc, dễ bảo trì. Cách xây dựng POM và các nguyên tắc thiết kế đúng.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-22-page-object-model.webp'
featured    = false
weight      = 23
categories  = ['automation']
tags        = ['automation-test', 'playwright', 'page-object-model']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Giai đoạn 4 tập trung vào các kỹ thuật giúp bộ test **lớn lên mà không rối**. Mở đầu là **Page Object Model (POM)** — pattern tổ chức code quan trọng nhất trong automation. Không có POM, bộ test vài chục file sẽ trở thành cơn ác mộng bảo trì. Có POM, nó gọn gàng và bền theo thời gian.

## Vấn đề POM giải quyết

Khi chưa dùng POM, locator và thao tác nằm rải rác, lặp lại trong mọi test:

```javascript
// Lặp lại y hệt trong nhiều test
await page.getByLabel('Email').fill('test@demo.com');
await page.getByLabel('Mật khẩu').fill('Test@1234');
await page.getByRole('button', { name: 'Đăng nhập' }).click();
```

Vấn đề: nếu nhãn nút đổi từ "Đăng nhập" thành "Sign in", bạn phải sửa **mọi test** có đoạn này. Với hàng chục test, đây là công việc dễ sót và tốn kém. Đây chính là thứ khiến bộ test "khó bảo trì".

## Ý tưởng POM

**Page Object Model** gom tất cả locator và thao tác của **một trang** vào **một class riêng**. Test không thao tác trực tiếp với `page` nữa, mà gọi các phương thức có nghĩa của page object.

Nguyên tắc: locator định nghĩa **một chỗ duy nhất**. Đổi giao diện chỉ sửa page object, mọi test dùng nó tự đúng theo.

## Xây dựng một Page Object

Tạo thư mục `pages/`, thêm file `LoginPage.js`:

```javascript
// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    // Định nghĩa locator một lần, tại một chỗ
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Mật khẩu');
    this.submitButton = page.getByRole('button', { name: 'Đăng nhập' });
    this.errorMessage = page.getByText('Sai email hoặc mật khẩu');
  }

  // Thao tác có nghĩa, đặt tên theo hành vi
  async goto() {
    await this.page.goto('/login');
  }

  async dangNhap(email, matKhau) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(matKhau);
    await this.submitButton.click();
  }
}

module.exports = { LoginPage };
```

Giải thích, nối với kiến thức đã học:

- `class` là khuôn tạo đối tượng; `constructor` chạy khi tạo object mới, nhận `page` và lưu lại.
- Locator định nghĩa trong constructor — mỗi phần tử **một chỗ duy nhất**.
- `dangNhap(email, matKhau)` là **phương thức** (hàm gắn với object — mở rộng của [Bài 7](../ham-va-arrow-function/)) gói cả luồng đăng nhập.
- `module.exports` cho phép file khác `require` class này (cơ chế chia file của Node.js).

## Dùng Page Object trong test

Test giờ trở nên ngắn, đọc như mô tả nghiệp vụ:

```javascript
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

test('đăng nhập sai mật khẩu thì hiện thông báo lỗi', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Arrange
  await loginPage.goto();

  // Act
  await loginPage.dangNhap('test@demo.com', 'sai-mat-khau');

  // Assert
  await expect(loginPage.errorMessage).toBeVisible();
});
```

So với bản chưa POM: test không còn locator lặp lại, đọc rõ *đang làm gì*, và nếu giao diện đổi thì chỉ sửa `LoginPage.js`.

## Nguyên tắc thiết kế POM đúng

POM dễ bị làm sai. Vài nguyên tắc từ thực tế:

- **Một page object cho một trang/thành phần** — LoginPage, CartPage, ProductPage. Thành phần dùng chung (header, menu) có thể tách riêng.
- **Phương thức đặt tên theo hành vi nghiệp vụ** — `dangNhap()`, `themVaoGio()`, không phải `clickButton1()`.
- **Không đặt assertion bên trong page object** (nguyên tắc phổ biến): page object lo *thao tác và cung cấp locator*, còn *khẳng định kết quả* để test tự làm. Điều này giữ page object tái dùng được cho nhiều kịch bản kiểm tra khác nhau.
- **Trả về dữ liệu khi cần** — phương thức lấy thông tin (vd `layTongTien()`) nên `return` giá trị để test assert.

> POM không phải "chia file cho có". Giá trị thật của nó là **tách thứ hay đổi (locator, giao diện) khỏi thứ ổn định (luồng nghiệp vụ)**. Khi làm đúng, thay đổi UI chỉ chạm một chỗ. Đây là kỹ thuật giúp bộ test sống được qua nhiều lần app thay đổi — điều mà mọi dự án thật đều cần.

[Bài 23](../fixtures-trong-playwright/) học **fixtures** — cơ chế của Playwright để tái sử dụng phần thiết lập (như tạo sẵn page object đã đăng nhập) giữa các test một cách gọn gàng.

## 🛠 Thực hành

1. **Viết page object đầu tiên:** tạo `pages/LoginPage.js` cho một trang đăng nhập (thật hoặc demo), gồm các locator và phương thức `goto()`, `dangNhap()`.
2. **Refactor test cũ:** lấy một test đã viết ở Giai đoạn 3 còn chứa locator trực tiếp, chuyển sang dùng page object.
3. **Thêm phương thức trả về dữ liệu:** thêm vào page object một phương thức lấy text thông báo lỗi và `return` nó, rồi assert trong test.

## Website tham khảo

- [Playwright — Page Object Models](https://playwright.dev/docs/pom) — hướng dẫn chính thức về POM.
- [Playwright — Best Practices](https://playwright.dev/docs/best-practices) — nguyên tắc tổ chức test.
- [MDN — Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) — nền tảng về class trong JavaScript.

+++
date        = '2026-07-01T09:45:00+07:00'
draft       = false
title       = 'Bài 24 — Quản lý test data và biến môi trường với .env'
slug        = 'test-data-va-bien-moi-truong'
summary     = 'Tách dữ liệu test khỏi code, dùng biến môi trường với file .env cho thông tin nhạy cảm và cấu hình theo môi trường, và kỹ thuật data-driven test chạy cùng logic với nhiều bộ dữ liệu.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-24-test-data-va-env.webp'
featured    = false
weight      = 25
categories  = ['automation']
tags        = ['automation-test', 'playwright', 'test-data', 'env']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Test tốt tách **dữ liệu** khỏi **logic**. Nhồi email, mật khẩu, URL trực tiếp vào code khiến test khó thay đổi và làm lộ thông tin nhạy cảm. Bài này dạy quản lý dữ liệu test đúng cách: tách dữ liệu ra, dùng biến môi trường với `.env`, và chạy một test với nhiều bộ dữ liệu.

## Vấn đề: dữ liệu lẫn trong code

```javascript
// Dữ liệu cứng nằm rải rác trong test
await page.goto('https://staging.demo.com/login');
await loginPage.dangNhap('admin@demo.com', 'SuperSecret@123');
```

Ba vấn đề: URL đổi theo môi trường phải sửa nhiều chỗ; mật khẩu thật **lộ trong code** (và bị commit lên Git — nhớ cảnh báo ở [Bài 3](../git-github-co-ban/)); khó chạy cùng test với dữ liệu khác.

## Tách dữ liệu test ra file riêng

Với dữ liệu không nhạy cảm, gom vào một file dữ liệu ([Bài 9](../object-trong-javascript/) — object và mảng):

```javascript
// data/users.js
module.exports = {
  taiKhoanHopLe: { email: 'test@demo.com', matKhau: 'Test@1234' },
  taiKhoanSai:   { email: 'test@demo.com', matKhau: 'sai-mat-khau' },
};
```

```javascript
// trong test
const users = require('../data/users');
await loginPage.dangNhap(users.taiKhoanHopLe.email, users.taiKhoanHopLe.matKhau);
```

Dữ liệu ở một chỗ, dễ sửa, dễ tái dùng.

## Biến môi trường với .env cho dữ liệu nhạy cảm

**Biến môi trường (environment variable)** là giá trị cấu hình nằm *ngoài* code, nạp lúc chạy. Đây là cách chuẩn để xử lý thông tin nhạy cảm (mật khẩu, token, API key) và cấu hình theo môi trường.

Cài gói `dotenv` để đọc file `.env`:

```bash
npm install dotenv
```

Tạo file `.env` ở gốc dự án:

```text
BASE_URL=https://staging.demo.com
ADMIN_EMAIL=admin@demo.com
ADMIN_PASSWORD=SuperSecret@123
```

Nạp nó trong `playwright.config.js`:

```javascript
require('dotenv').config();   // đọc .env, đưa vào process.env

module.exports = defineConfig({
  use: {
    baseURL: process.env.BASE_URL,   // dùng biến môi trường
  },
});
```

Truy cập trong test qua `process.env`:

```javascript
await loginPage.dangNhap(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
```

`process.env` là object chứa mọi biến môi trường; `dotenv` nạp nội dung `.env` vào đó.

## Quy tắc bắt buộc: .env KHÔNG bao giờ commit

File `.env` chứa bí mật, **tuyệt đối không** đưa lên Git. Thêm vào `.gitignore` ngay:

```text
.env
```

> Đây là quy tắc bảo mật cứng, không phải tùy chọn. Vô số sự cố lộ mật khẩu, token thật xảy ra vì commit nhầm `.env` lên GitHub công khai. Thực hành chuẩn của mọi team: `.env` nằm trong `.gitignore`, và commit kèm một file mẫu `.env.example` (chỉ có tên biến, không có giá trị thật) để người khác biết cần khai báo những gì.

```text
# .env.example — commit được, không chứa giá trị thật
BASE_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## Cấu hình nhiều môi trường

Nhờ biến môi trường, chuyển giữa dev/staging/production chỉ là đổi giá trị, không sửa code. Ví dụ chạy với `BASE_URL` khác nhau:

```bash
BASE_URL=https://production.demo.com npx playwright test
```

Giá trị truyền lúc chạy ghi đè `.env`, cho phép cùng bộ test chạy trên nhiều môi trường.

## Data-driven test: một logic, nhiều bộ dữ liệu

Khi cần kiểm tra cùng một luồng với nhiều dữ liệu khác nhau, lặp qua một mảng dữ liệu và sinh test cho mỗi phần tử ([Bài 6](../vong-lap-for-for-of/) — vòng lặp):

```javascript
const { test, expect } = require('@playwright/test');

const boDuLieu = [
  { email: '',              loi: 'Vui lòng nhập email' },
  { email: 'sai-dinh-dang', loi: 'Email không hợp lệ' },
  { email: 'a@b.com',       loi: 'Sai email hoặc mật khẩu' },
];

for (const dl of boDuLieu) {
  test(`đăng nhập với email "${dl.email}" thì hiện lỗi phù hợp`, async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(dl.email);
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await expect(page.getByText(dl.loi)).toBeVisible();
  });
}
```

Mỗi phần tử trong `boDuLieu` sinh ra một test riêng, có tên riêng — hiệu quả để phủ nhiều trường hợp mà không lặp code. Đây là kỹ thuật **data-driven testing**.

[Bài 25](../xu-ly-tabs-popup-iframe/) xử lý các tình huống giao diện phức tạp hơn: nhiều tab, popup, và iframe.

## 🛠 Thực hành

1. **Tách dữ liệu:** tạo file `data/users.js` chứa vài bộ tài khoản test, dùng nó trong một test thay cho dữ liệu cứng.
2. **Dùng .env:** cài `dotenv`, tạo `.env` với `BASE_URL` và một tài khoản, nạp trong config, và **thêm `.env` vào `.gitignore`**. Tạo kèm `.env.example`.
3. **Data-driven:** viết một test data-driven kiểm tra chức năng đăng nhập với ít nhất 3 bộ dữ liệu (một hợp lệ, hai trường hợp lỗi khác nhau).

## Website tham khảo

- [Playwright — Parameterize tests](https://playwright.dev/docs/test-parameterize) — data-driven test.
- [Playwright — Passing environment variables](https://playwright.dev/docs/test-parameterize#passing-environment-variables) — dùng biến môi trường và `.env`.
- [dotenv — npm](https://www.npmjs.com/package/dotenv) — tài liệu gói đọc file `.env`.

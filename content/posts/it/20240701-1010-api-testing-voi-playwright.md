+++
date        = '2024-07-01T10:10:00+07:00'
draft       = false
title       = 'Bài 29 — Xử lý API Testing'
slug        = 'api-testing-voi-playwright'
summary     = 'Test API trực tiếp bằng request fixture của Playwright: gửi GET/POST, kiểm tra status và response body, và kết hợp API với UI test để setup dữ liệu nhanh.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-29-api-test-voi-playwright.webp'
featured    = false
weight      = 30
columns     = 2
categories  = ['it']
subcategories = ['qa-testing']
tags        = ['automation-test', 'playwright', 'api-testing']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Playwright không chỉ test giao diện — nó test được cả **API** trực tiếp, không qua trình duyệt. Giai đoạn 5 mở đầu với API testing: kiểm tra tầng backend, và quan trọng hơn, dùng API để *chuẩn bị dữ liệu* nhanh cho UI test. Đây là kỹ năng thực chiến giá trị cao.

Kiến thức nền: request/response và status code (nhắc ở [Bài 12](../lam-quen-devtools/)).

## API testing là gì

**API (Application Programming Interface)** là cổng để các phần mềm trao đổi dữ liệu. Web frontend gọi API để lấy/gửi dữ liệu tới backend. **API testing** kiểm tra trực tiếp các cổng này: gửi request, kiểm tra response — không cần giao diện.

Ưu điểm so với UI test: **nhanh hơn nhiều** (không dựng trình duyệt), **ổn định hơn** (không phụ thuộc giao diện), và test được logic backend độc lập.

Vài khái niệm cần nắm:

- **HTTP method:** `GET` (lấy dữ liệu), `POST` (tạo mới), `PUT`/`PATCH` (cập nhật), `DELETE` (xóa).
- **Status code:** `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `404` Not Found, `500` Server Error.
- **Request/response body:** dữ liệu gửi đi và nhận về, thường ở định dạng JSON.

## request fixture

Playwright cung cấp fixture `request` ([Bài 23](../fixtures-trong-playwright/)) để gọi API. Lấy nó qua destructuring:

```javascript
const { test, expect } = require('@playwright/test');

test('GET danh sách sản phẩm trả về 200 và có dữ liệu', async ({ request }) => {
  const response = await request.get('/api/products');

  // Kiểm tra status
  expect(response.status()).toBe(200);
  expect(response.ok()).toBeTruthy();

  // Kiểm tra nội dung response
  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);
});
```

- `request.get(url)` gửi request GET; trả về một Promise ([Bài 10](../bat-dong-bo-promise-async-await/)) nên cần `await`.
- `response.status()` — status code; `response.ok()` — true nếu status trong khoảng 2xx.
- `response.json()` — parse body thành object/mảng JavaScript để kiểm tra.

## POST — tạo dữ liệu

```javascript
test('POST tạo sản phẩm mới trả về 201', async ({ request }) => {
  const response = await request.post('/api/products', {
    data: {
      ten: 'Sản phẩm test',
      gia: 150,
    },
  });

  expect(response.status()).toBe(201);

  const sanPham = await response.json();
  expect(sanPham).toMatchObject({ ten: 'Sản phẩm test', gia: 150 });
  expect(sanPham.id).toBeTruthy();   // backend đã gán id
});
```

- `data` là body gửi đi (Playwright tự chuyển thành JSON).
- `toMatchObject` kiểm tra response chứa các trường mong đợi (không cần khớp toàn bộ).

## Gửi header và xác thực

API thường yêu cầu xác thực qua header (token). Truyền header trong lời gọi hoặc cấu hình chung:

```javascript
const response = await request.get('/api/profile', {
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
});
```

Có thể đặt `baseURL` và header mặc định trong `playwright.config.js` (mục `use`) để không lặp lại.

## Kết hợp API và UI: setup dữ liệu nhanh

Đây là ứng dụng giá trị nhất trong thực tế. Thay vì click qua UI để tạo dữ liệu tiền đề (chậm), dùng API tạo nhanh, rồi mới test UI:

```javascript
test('sản phẩm mới tạo hiển thị trên trang danh sách', async ({ request, page }) => {
  // Arrange — tạo dữ liệu qua API (nhanh)
  const response = await request.post('/api/products', {
    data: { ten: 'Sản phẩm UI Test', gia: 99 },
  });
  expect(response.status()).toBe(201);

  // Act + Assert — kiểm tra qua UI
  await page.goto('/products');
  await expect(page.getByText('Sản phẩm UI Test')).toBeVisible();
});
```

> Đây là best practice quan trọng: **dùng API cho setup, UI cho thứ cần kiểm tra qua giao diện.** Tạo 10 sản phẩm để test bộ lọc — làm qua API mất một giây, click qua UI mất cả phút và dễ vỡ. Người làm nghề tận dụng API để test nhanh và tập trung UI test vào đúng thứ cần mắt người.

## Khi nào dùng API test

- **Test thuần API:** kiểm tra logic backend, validation, phân quyền — độc lập với frontend.
- **Setup/teardown dữ liệu:** tạo tiền đề và dọn dẹp cho UI test.
- **Kiểm tra chéo:** so sánh dữ liệu API trả về với dữ liệu hiển thị trên UI.

[Bài 30](../ci-cd-github-actions/) đưa toàn bộ bộ test lên **CI/CD với GitHub Actions** — chạy test tự động mỗi lần đẩy code.

## 🛠 Thực hành

1. **GET và kiểm tra:** dùng một API công khai (vd [reqres.in](https://reqres.in) hoặc [jsonplaceholder](https://jsonplaceholder.typicode.com)), viết test GET một endpoint và kiểm tra status 200 cùng cấu trúc dữ liệu.
2. **POST tạo mới:** viết test POST tạo một bản ghi và kiểm tra status cùng dữ liệu trả về.
3. **API + UI:** với một ứng dụng có cả API và giao diện, dùng API tạo một bản ghi rồi kiểm tra nó xuất hiện trên UI.

## Website tham khảo

- [Playwright — API testing](https://playwright.dev/docs/api-testing) — hướng dẫn đầy đủ.
- [Playwright — APIRequestContext](https://playwright.dev/docs/api/class-apirequestcontext) — tham chiếu fixture request.
- [MDN — HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — bảng tra status code.

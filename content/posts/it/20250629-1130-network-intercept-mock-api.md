+++
date        = '2025-06-29T11:30:00+07:00'
draft       = false
title       = 'Network: intercept, mock API và route'
slug        = 'network-intercept-mock-api'
summary     = 'Chặn và can thiệp request mạng với page.route: mock response API, giả lập lỗi/timeout, sửa request, ghi đè dữ liệu — để test ổn định, nhanh và phủ được cả các trạng thái khó tái hiện.'
thumbnail   = '/images/playwright-series/playwright-bai-08-network-intercept-mock.webp'
featured    = false
weight      = 8
categories  = ['it']
subcategories = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Khả năng can thiệp mạng là một trong những thứ Playwright làm **xuất sắc**. Bạn có thể chặn request, trả về dữ liệu giả, giả lập lỗi 500, làm chậm mạng — tất cả không cần backend thật. Điều này khiến test nhanh hơn, ổn định hơn, và phủ được những trạng thái cực khó tái hiện (lỗi server, mạng chậm, danh sách rỗng).

## `page.route` — cánh cổng can thiệp

`page.route(url, handler)` đăng ký một handler chạy mỗi khi có request khớp pattern. Trong handler, bạn quyết định số phận request:

```ts
await page.route('**/api/products', async route => {
  // 3 lựa chọn chính:
  // route.fulfill()  → trả response giả, KHÔNG gọi server thật
  // route.continue() → cho đi tiếp (có thể sửa request)
  // route.abort()    → hủy request (giả lập lỗi mạng)
});
```

## Mock một response API

Trường hợp phổ biến nhất: trả dữ liệu giả để test UI độc lập với backend.

```ts
test('hiển thị danh sách sản phẩm', async ({ page }) => {
  await page.route('**/api/products', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'iPhone 16', price: 25000000 },
        { id: 2, name: 'iPad Pro', price: 30000000 },
      ]),
    });
  });

  await page.goto('/shop');
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByText('iPhone 16')).toBeVisible();
});
```

Lưu ý: **đăng ký route TRƯỚC `page.goto`** — nếu không, request có thể đã đi trước khi route được cài.

### Trả dữ liệu từ file fixture

```ts
await page.route('**/api/products', route =>
  route.fulfill({ path: 'fixtures/products.json' })
);
```

## Giả lập lỗi và trạng thái biên

Đây là chỗ network mocking tỏa sáng — test những thứ gần như không thể tái hiện thật:

```ts
// Lỗi server 500
await page.route('**/api/checkout', route =>
  route.fulfill({ status: 500, body: 'Internal Server Error' })
);

// Lỗi mạng (mất kết nối)
await page.route('**/api/**', route => route.abort('failed'));

// Danh sách rỗng → test "empty state"
await page.route('**/api/orders', route =>
  route.fulfill({ status: 200, body: '[]' })
);

// Lỗi 401 → test logic logout/redirect
await page.route('**/api/me', route => route.fulfill({ status: 401 }));
```

```ts
test('hiển thị thông báo khi server lỗi', async ({ page }) => {
  await page.route('**/api/checkout', r => r.fulfill({ status: 500 }));
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Thanh toán' }).click();
  await expect(page.getByText('Có lỗi xảy ra, vui lòng thử lại')).toBeVisible();
});
```

## Sửa request hoặc response thật

Đôi khi bạn muốn gọi server thật nhưng **chỉnh sửa** một chút.

```ts
// Sửa request trước khi gửi đi (thêm header, đổi body)
await page.route('**/api/search', async route => {
  const headers = { ...route.request().headers(), 'x-test': '1' };
  await route.continue({ headers });
});

// Lấy response thật rồi vá dữ liệu (fulfill với response gốc)
await page.route('**/api/user', async route => {
  const response = await route.fetch();      // gọi server thật
  const json = await response.json();
  json.role = 'admin';                        // ép quyền admin để test
  await route.fulfill({ response, json });
});
```

## Phạm vi route: page vs context

```ts
// Áp cho mọi page trong context (kể cả popup) — đặt một lần
await context.route('**/api/analytics', route => route.abort());

// Áp cho riêng một page
await page.route('**/api/x', handler);
```

Đặt route ở **context level** trong fixture là cách hay để mock chung (ví dụ chặn analytics, quảng cáo) cho toàn bộ test.

## Gỡ và giới hạn route

```ts
// Gỡ route đã đăng ký
await page.unroute('**/api/products');

// Chỉ áp dụng một số lần rồi tự gỡ (vd: lần đầu lỗi, lần sau thành công)
let count = 0;
await page.route('**/api/data', route => {
  count++;
  if (count === 1) return route.fulfill({ status: 500 });
  return route.continue();
});
```

## Theo dõi request mà không can thiệp

Khi chỉ muốn **kiểm chứng** một request đã xảy ra đúng:

```ts
const reqPromise = page.waitForRequest('**/api/track');
await page.getByRole('button', { name: 'Mua' }).click();
const req = await reqPromise;
expect(req.method()).toBe('POST');
expect(req.postDataJSON()).toMatchObject({ event: 'purchase' });
```

## HAR — ghi và phát lại toàn bộ traffic

Playwright có thể ghi lại toàn bộ mạng vào file HAR rồi phát lại — biến API thật thành mock ổn định:

```ts
// Ghi lần đầu
await page.routeFromHAR('hars/shop.har', { url: '**/api/**', update: true });
// Lần sau phát lại (không gọi server)
await page.routeFromHAR('hars/shop.har', { url: '**/api/**' });
```

## Khi nào nên — và không nên — mock

- **Nên mock**: test UI/logic frontend, trạng thái lỗi/biên, làm test nhanh và độc lập backend.
- **Không nên mock**: test tích hợp đầu-cuối thật (E2E "thật"), kiểm chứng hợp đồng API. Mock quá tay khiến test "xanh" nhưng không phản ánh hệ thống thật. Hãy có cả hai tầng: nhiều test mock + một ít test E2E thật.

## Tóm tắt

- `page.route` cho phép **fulfill** (mock), **continue** (sửa & cho đi), hoặc **abort** (hủy) mỗi request.
- Đăng ký route **trước `goto`**; dùng `context.route` để mock chung cho toàn bộ test.
- Network mocking giúp phủ **trạng thái lỗi/biên** khó tái hiện, và làm test nhanh, ổn định.
- Cân bằng: dùng mock cho phần lớn test frontend, nhưng giữ một lớp **E2E thật** để không đánh mất giá trị tích hợp.

---

**Bài trước**: [← Page Object Model và tổ chức test ở quy mô lớn](/posts/page-object-model-to-chuc-test/)

**Bài tiếp theo**: [Authentication và quản lý storage state →](/posts/authentication-storage-state/)

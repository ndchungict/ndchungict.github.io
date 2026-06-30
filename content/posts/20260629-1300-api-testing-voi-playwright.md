+++
date        = '2026-06-29T13:00:00+07:00'
draft       = false
title       = 'API Testing với Playwright'
slug        = 'api-testing-voi-playwright'
summary     = 'Playwright không chỉ test UI. Dùng APIRequestContext để test REST API thuần, kết hợp UI + API trong một test, seed/cleanup dữ liệu qua API, và chia sẻ trạng thái đăng nhập giữa hai tầng.'
thumbnail   = '/images/playwright-series/playwright-bai-11-api-testing-request-fixture-ui-api.webp'
featured    = false
weight      = 11
categories  = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Nhiều người chỉ biết Playwright qua khía cạnh UI, nhưng nó cũng là một **HTTP client** đầy đủ để test REST API. Sức mạnh thật sự đến khi bạn **kết hợp** cả hai: dùng API để dựng dữ liệu nhanh, rồi kiểm tra UI — vừa nhanh, vừa ổn định.

## `request` fixture — gửi HTTP thuần

Fixture `request` là một `APIRequestContext` — không cần mở trình duyệt:

```ts
import { test, expect } from '@playwright/test';

test('GET danh sách user', async ({ request }) => {
  const response = await request.get('/api/users');

  expect(response.ok()).toBeTruthy();        // status 2xx
  expect(response.status()).toBe(200);

  const users = await response.json();
  expect(users).toHaveLength(10);
  expect(users[0]).toHaveProperty('email');
});
```

`baseURL` trong config áp dụng luôn cho `request`, nên `/api/users` tự nối với base.

## Các method và payload

```ts
// POST với JSON body
const res = await request.post('/api/users', {
  data: { name: 'Chung', role: 'admin' },
  headers: { 'Authorization': `Bearer ${token}` },
});
expect(res.status()).toBe(201);
const created = await res.json();
expect(created).toMatchObject({ name: 'Chung', role: 'admin' });

// PUT / PATCH / DELETE
await request.put(`/api/users/${id}`, { data: { role: 'editor' } });
await request.patch(`/api/users/${id}`, { data: { name: 'X' } });
await request.delete(`/api/users/${id}`);

// Query params
await request.get('/api/search', { params: { q: 'laptop', page: 2 } });

// Form data / multipart
await request.post('/api/upload', {
  multipart: { file: { name: 'a.png', mimeType: 'image/png', buffer } },
});
```

## Kiểm chứng response sâu hơn

```ts
const res = await request.get('/api/orders/42');

// Header
expect(res.headers()['content-type']).toContain('application/json');

// Body dạng object — matchObject kiểm tra một phần
const order = await res.json();
expect(order).toMatchObject({ status: 'paid', total: 250000 });

// Body dạng text / buffer
const text = await res.text();
const buffer = await res.body();
```

## Kết hợp UI + API trong một test

Đây là pattern giá trị nhất. Thay vì click qua 10 màn hình để tạo dữ liệu, **seed bằng API** rồi chỉ test phần UI cần quan tâm:

```ts
test('hiển thị đơn hàng vừa tạo', async ({ page, request }) => {
  // 1. Dựng dữ liệu nhanh qua API (vài mili-giây)
  const res = await request.post('/api/orders', {
    data: { product: 'iPhone 16', qty: 1 },
  });
  const order = await res.json();

  // 2. Chỉ test phần UI thật sự quan tâm
  await page.goto(`/orders/${order.id}`);
  await expect(page.getByRole('heading')).toHaveText('iPhone 16');
});
```

Ngược lại — thao tác UI rồi **kiểm chứng qua API** rằng dữ liệu đã đúng ở backend:

```ts
test('tạo user qua form lưu đúng vào hệ thống', async ({ page, request }) => {
  await page.goto('/users/new');
  await page.getByLabel('Tên').fill('Chung');
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByText('Đã lưu')).toBeVisible();

  // Xác nhận ở tầng API, không chỉ tin UI
  const res = await request.get('/api/users?name=Chung');
  expect(await res.json()).toHaveLength(1);
});
```

## Seed và cleanup qua fixture

Đóng gói tạo/xóa dữ liệu vào fixture để mỗi test tự dọn sau mình (xem lại bài Fixtures):

```ts
export const test = base.extend<{ seededOrder: Order }>({
  seededOrder: async ({ request }, use) => {
    const res = await request.post('/api/orders', { data: { product: 'X' } });
    const order = await res.json();

    await use(order);                          // bàn giao cho test

    await request.delete(`/api/orders/${order.id}`);  // cleanup sau test
  },
});
```

## Chia sẻ đăng nhập giữa API và UI

`request` context giữ cookie riêng. Để API "đã đăng nhập", nạp cùng `storageState` (từ bài Authentication):

```ts
// Tạo một request context có sẵn auth
const apiContext = await request.newContext({
  baseURL: 'https://api.myapp.com',
  storageState: 'playwright/.auth/user.json',
  extraHTTPHeaders: { 'Accept': 'application/json' },
});
const res = await apiContext.get('/me');
```

Ngược lại, sau khi đăng nhập qua API có thể lưu state để UI dùng — đúng pattern "đăng nhập qua API" đã nói ở bài trước.

## Test API thuần (không UI) — tổ chức riêng

Với API test thuần, tách thành project riêng không cần trình duyệt:

```ts
{
  name: 'api',
  testMatch: /.*\.api\.spec\.ts/,
  use: { baseURL: 'https://api.myapp.com' },
}
```

```bash
npx playwright test --project=api
```

## Tóm tắt

- Fixture **`request`** biến Playwright thành HTTP client đầy đủ: GET/POST/PUT/DELETE, headers, params, multipart.
- Kiểm chứng response bằng `status()`, `ok()`, `json()` + `toMatchObject` cho linh hoạt.
- Pattern mạnh nhất: **seed dữ liệu qua API** rồi test UI (nhanh, ổn định), hoặc thao tác UI rồi **xác nhận qua API**.
- Dùng **fixture** cho seed/cleanup và chia sẻ `storageState` để API và UI cùng "đã đăng nhập".

---

**Bài trước**: [← Xử lý nâng cao: iframe, tab, upload/download, dialog](/posts/xu-ly-nang-cao-iframe-tab-upload-download/)

**Bài tiếp theo**: [Visual Testing và Screenshot Comparison →](/posts/visual-testing-screenshot-comparison/)

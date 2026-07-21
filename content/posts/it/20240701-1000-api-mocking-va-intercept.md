+++
date        = '2024-07-01T10:00:00+07:00'
draft       = false
title       = 'Bài 27 — API mocking và intercept network request trong Playwright'
slug        = 'api-mocking-va-intercept'
summary     = 'Chặn và can thiệp network request với page.route: mock response API để kiểm soát dữ liệu, giả lập lỗi/trạng thái rỗng, và làm test nhanh, ổn định, độc lập với backend.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-27-api-mocking-va-intercept.webp'
featured    = false
weight      = 28
categories  = ['it']
subcategories = ['qa-testing']
tags        = ['automation-test', 'playwright', 'api-mocking', 'network']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Trang web lấy dữ liệu từ **API** (các request mạng tới backend). Playwright cho phép **chặn (intercept)** và **giả lập (mock)** các request này, cho bạn toàn quyền kiểm soát dữ liệu mà trang nhận được. Đây là kỹ thuật mạnh để test các tình huống khó dựng bằng dữ liệu thật, và làm test nhanh, ổn định hơn.

Kiến thức nền: tab Network trong DevTools ([Bài 12](../lam-quen-devtools/)).

## Vì sao cần mock API

Test qua UI thật phụ thuộc backend, kéo theo nhiều vấn đề:

- **Chậm và không ổn định:** mỗi test gọi API thật, phụ thuộc mạng và trạng thái server.
- **Khó dựng tình huống:** làm sao để backend trả về đúng lỗi 500, hay danh sách rỗng, hay 1000 sản phẩm — theo ý muốn?
- **Phụ thuộc dữ liệu:** dữ liệu thật thay đổi khiến assertion vỡ.

**Mock** giải quyết bằng cách: thay vì để trang gọi API thật, ta *chặn* request và *trả về dữ liệu do ta định sẵn*. Trang không biết khác biệt — nó nhận dữ liệu như thật.

## page.route: chặn request

`page.route(url, handler)` đăng ký chặn các request khớp mẫu URL. Trong handler, bạn quyết định làm gì với request đó.

```javascript
test('hiển thị danh sách sản phẩm từ dữ liệu mock', async ({ page }) => {
  // Chặn request tới API sản phẩm, trả về dữ liệu tự định
  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, ten: 'Sản phẩm A', gia: 100 },
        { id: 2, ten: 'Sản phẩm B', gia: 200 },
      ]),
    });
  });

  await page.goto('/products');

  // Trang hiển thị đúng dữ liệu mock
  await expect(page.getByText('Sản phẩm A')).toBeVisible();
  await expect(page.getByText('Sản phẩm B')).toBeVisible();
});
```

- `page.route('**/api/products', ...)` — chặn mọi request tới URL kết thúc bằng `/api/products` (`**` là ký tự đại diện).
- `route.fulfill({...})` — **trả về response giả** thay cho việc gọi API thật.
- `body` là dữ liệu JSON; `JSON.stringify` chuyển object/mảng JavaScript thành chuỗi JSON.

## Giả lập các tình huống khó

Đây là chỗ mock tỏa sáng — dựng các trạng thái mà dữ liệu thật khó tạo:

```javascript
// Danh sách rỗng — kiểm tra giao diện "không có sản phẩm"
await page.route('**/api/products', async (route) => {
  await route.fulfill({ status: 200, body: JSON.stringify([]) });
});

// Lỗi server — kiểm tra xử lý lỗi của giao diện
await page.route('**/api/products', async (route) => {
  await route.fulfill({ status: 500, body: 'Internal Server Error' });
});
```

Nhờ đó bạn kiểm tra được: giao diện hiển thị gì khi rỗng, khi lỗi, khi chậm — những trường hợp quan trọng mà [Bài 14](../thiet-ke-test-case-aaa/) nhấn mạnh là hay bị bỏ sót.

## Sửa request/response thật thay vì thay hẳn

Đôi khi bạn muốn để request đi tới server thật nhưng can thiệp một phần:

```javascript
// Để request đi tiếp bình thường
await page.route('**/api/**', (route) => route.continue());

// Lấy response thật rồi sửa một phần
await page.route('**/api/products', async (route) => {
  const response = await route.fetch();       // gọi API thật
  const data = await response.json();
  data[0].ten = 'Tên đã sửa';                 // chỉnh dữ liệu
  await route.fulfill({ response, json: data });
});
```

- `route.continue()` — cho request đi tiếp không đổi.
- `route.fetch()` — lấy response thật để dựa vào rồi tùy biến.

## Kiểm tra request mà trang gửi đi

Ngoài mock response, bạn có thể **xác minh** trang gửi request đúng không (đúng URL, đúng dữ liệu):

```javascript
const [request] = await Promise.all([
  page.waitForRequest('**/api/login'),
  page.getByRole('button', { name: 'Đăng nhập' }).click(),
]);

expect(request.method()).toBe('POST');
expect(request.postDataJSON()).toMatchObject({ email: 'test@demo.com' });
```

## Khi nào mock, khi nào dùng dữ liệu thật

Mock mạnh nhưng không phải luôn đúng. Cân nhắc:

- **Nên mock:** khi test tập trung vào *giao diện* xử lý dữ liệu thế nào, cần dựng tình huống khó (lỗi, rỗng), hoặc muốn test nhanh/ổn định không phụ thuộc backend.
- **Không nên mock:** khi bạn cần kiểm tra *tích hợp thật* giữa frontend và backend (E2E đúng nghĩa). Mock quá nhiều khiến test "xanh" nhưng không phản ánh hệ thống thật.

> Cân bằng là chìa khóa. Một chiến lược phổ biến: có một lớp test E2E chạy với backend thật cho các luồng cốt lõi, và dùng mock cho các test cần kiểm soát dữ liệu hoặc dựng tình huống biên. Đừng mock mọi thứ — bạn sẽ test cái mock của chính mình chứ không phải ứng dụng.

[Bài 28](../chay-song-song-report-debug/) khép Giai đoạn 4: chạy test song song, đọc report và debug nâng cao với Trace Viewer.

## 🛠 Thực hành

1. **Mock danh sách:** viết test chặn một API trả về danh sách bằng `route.fulfill` với dữ liệu tự định, và kiểm tra trang hiển thị đúng.
2. **Giả lập lỗi:** mock cùng API đó trả về status 500, và kiểm tra giao diện hiển thị thông báo lỗi phù hợp.
3. **Xác minh request:** viết test bắt request bằng `waitForRequest` khi submit một form, và assert method cùng dữ liệu gửi đi.

## Website tham khảo

- [Playwright — Mock APIs](https://playwright.dev/docs/mock) — hướng dẫn mock đầy đủ.
- [Playwright — Network](https://playwright.dev/docs/network) — chặn, sửa, theo dõi request.
- [Playwright — page.route API](https://playwright.dev/docs/api/class-page#page-route) — tham chiếu.

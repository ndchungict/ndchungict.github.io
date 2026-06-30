+++
date        = '2026-06-29T10:00:00+07:00'
draft       = false
title       = 'Actions, Auto-waiting và Web-first Assertions'
slug        = 'actions-auto-waiting-web-first-assertions'
summary     = 'Cách Playwright thực hiện hành động (click, fill, select...), cơ chế actionability và auto-waiting đứng sau, khi nào cần waitFor, và vì sao bạn gần như không bao giờ phải dùng sleep.'
thumbnail   = '/images/playwright-series/playwright-bai-05-actions-auto-waiting-web-first-assertions.webp'
featured    = false
weight      = 5
categories  = ['it']
tags        = ['playwright', 'automation', 'test', 'e2e', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Flaky test phần lớn sinh ra từ việc **thao tác quá sớm** — click khi nút chưa sẵn sàng, đọc giá trị khi UI chưa cập nhật. Playwright giải quyết tận gốc bằng cơ chế **auto-waiting**. Bài này giải thích chính xác nó hoạt động thế nào và cách dùng đúng.

## Các action cơ bản

```ts
// Click
await page.getByRole('button', { name: 'Lưu' }).click();
await page.getByText('Menu').dblclick();
await page.getByRole('button').click({ button: 'right' }); // chuột phải

// Nhập liệu
await page.getByLabel('Email').fill('a@b.com');     // set thẳng giá trị (nhanh)
await page.getByLabel('Tìm').pressSequentially('abc'); // gõ từng phím (mô phỏng thật)
await page.getByLabel('Mô tả').clear();

// Checkbox / radio
await page.getByLabel('Đồng ý').check();
await page.getByLabel('Đồng ý').uncheck();

// Dropdown <select>
await page.getByLabel('Quốc gia').selectOption('VN');
await page.getByLabel('Quốc gia').selectOption({ label: 'Việt Nam' });

// Bàn phím
await page.getByLabel('Tìm').press('Enter');
await page.keyboard.press('Control+A');

// Hover, focus
await page.getByText('Thông tin').hover();
```

`fill` vs `pressSequentially`: dùng `fill` cho hầu hết trường hợp (nhanh, set value + trigger event). Chỉ dùng `pressSequentially` khi cần kích hoạt logic theo từng phím gõ (như autocomplete).

## Actionability — điều kiện trước mỗi action

Trước khi thực hiện, Playwright **tự kiểm tra** một loạt điều kiện và **chờ** cho tới khi thỏa (hoặc timeout). Mỗi action yêu cầu một tập điều kiện khác nhau:

| Action | visible | stable | enabled | nhận event | editable |
|---|:---:|:---:|:---:|:---:|:---:|
| `click()` | ✅ | ✅ | ✅ | ✅ | |
| `fill()` | ✅ | | ✅ | | ✅ |
| `check()` | ✅ | ✅ | ✅ | ✅ | |
| `hover()` | ✅ | ✅ | | ✅ | |
| `selectOption()` | ✅ | | ✅ | | |

- **stable**: phần tử đứng yên qua 2 khung hình liên tiếp (hết animation trượt vào).
- **nhận event**: tại điểm click, phần tử thật sự là mục tiêu — không bị overlay/modal che. Đây là lý do Playwright tránh được lỗi click trúng lớp phủ.

```ts
// Bạn KHÔNG cần viết thế này:
// await page.waitForTimeout(1000);
// Playwright tự chờ nút enabled + visible + stable rồi mới click:
await page.getByRole('button', { name: 'Gửi' }).click();
```

## Vì sao `waitForTimeout` (sleep) là phản pattern

```ts
// ❌ Tệ: chờ cứng 3 giây — chậm nếu app nhanh, fail nếu app chậm hơn
await page.waitForTimeout(3000);

// ✅ Tốt: chờ đúng điều kiện cần
await expect(page.getByText('Tải xong')).toBeVisible();
```

`waitForTimeout` chỉ chấp nhận được khi debug tạm thời, không bao giờ trong test thật.

## Khi auto-wait chưa đủ: chờ tường minh

Đôi khi bạn cần chờ một **trạng thái** chứ không phải một action. Dùng `waitFor`:

```ts
// Chờ phần tử đạt một trạng thái cụ thể
await page.getByText('Đang tải').waitFor({ state: 'hidden' });
await page.getByRole('dialog').waitFor({ state: 'visible' });

// Chờ điều hướng / URL
await page.waitForURL('**/dashboard');

// Chờ một response mạng cụ thể
await page.waitForResponse(resp =>
  resp.url().includes('/api/orders') && resp.status() === 200
);

// Chờ một sự kiện load
await page.waitForLoadState('networkidle');
```

> Cẩn trọng với `networkidle`: nó chờ mạng "im" 500ms, nhưng với app có polling/websocket thì có thể không bao giờ idle. Ưu tiên chờ phần tử/response cụ thể.

## Pattern chuẩn cho hành động kích hoạt request

Tránh **race condition** bằng cách thiết lập listener **trước** khi kích hoạt:

```ts
// ✅ Đăng ký chờ response TRƯỚC khi click, rồi await cả hai
const responsePromise = page.waitForResponse('**/api/login');
await page.getByRole('button', { name: 'Đăng nhập' }).click();
const response = await responsePromise;
expect(response.status()).toBe(200);
```

Nếu `click` rồi mới `waitForResponse`, response có thể đã về trước khi bạn kịp lắng nghe → flaky.

## Tùy chỉnh timeout

```ts
// Timeout cho một action cụ thể
await page.getByRole('button').click({ timeout: 10000 });

// Timeout mặc định cho mọi action (trong config)
use: { actionTimeout: 15000 },

// Timeout của cả test
test.setTimeout(60000);

// Bỏ điều kiện actionability (hiếm khi cần — dùng khi phần tử cố tình bị che)
await page.getByRole('button').click({ force: true });
```

> `force: true` **tắt kiểm tra an toàn** — chỉ dùng khi bạn chắc chắn và hiểu hậu quả. Lạm dụng `force` là che giấu bug UI thật.

## Web-first assertions nhắc lại

Action có auto-wait, và **assertion cũng có**. Cặp đôi này mới là thứ giết flaky:

```ts
await page.getByRole('button', { name: 'Thanh toán' }).click();
// Không cần wait — expect tự retry tới khi thông báo hiện ra
await expect(page.getByText('Đặt hàng thành công')).toBeVisible();
await expect(page).toHaveURL(/\/orders\/\d+/);
```

## Tóm tắt

- Mỗi action (`click`, `fill`, `check`...) đi kèm một tập **điều kiện actionability** và Playwright **tự chờ** cho tới khi thỏa.
- **Không dùng `waitForTimeout`/sleep** trong test thật — chờ điều kiện cụ thể bằng `expect` hoặc `waitFor`.
- Đăng ký `waitForResponse`/`waitForURL` **trước** khi kích hoạt action để tránh race condition.
- `force: true` tắt mọi kiểm tra an toàn — chỉ dùng khi thực sự cần và hiểu rủi ro.

---

**Bài trước**: [← Locators — chiến lược định vị phần tử hiện đại](/posts/playwright-locators-dinh-vi-phan-tu/)

**Bài tiếp theo**: [Fixtures — kiến trúc test mạnh mẽ của Playwright →](/posts/playwright-fixtures/)

+++
date        = '2026-07-01T09:20:00+07:00'
draft       = true
title       = 'Bài 19 — Các hành động cơ bản trong Playwright: click, fill, check, select, upload'
slug        = 'cac-hanh-dong-co-ban-playwright'
summary     = 'Thực hiện thao tác trên phần tử: click, điền text (fill), tick checkbox, chọn dropdown, upload file, nhấn phím. Hiểu cơ chế auto-wait giúp thao tác ổn định.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 20
categories  = ['automation']
tags        = ['automation-test', 'playwright', 'actions']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

[Bài 18](../locator-trong-playwright/) cho bạn cách *định vị* phần tử. Bài này cho cách *thao tác* với chúng: click, điền, chọn, upload. Đây là các động từ tạo nên phần "Act" trong cấu trúc AAA ([Bài 14](../thiet-ke-test-case-aaa/)).

Mọi hành động đều là thao tác bất đồng bộ, nên luôn đi kèm `await` ([Bài 10](../bat-dong-bo-promise-async-await/)).

## Auto-wait: vì sao hành động Playwright ổn định

Trước khi thực hiện một hành động, Playwright **tự động chờ** phần tử đạt trạng thái sẵn sàng (actionable): hiển thị, ổn định, không bị che, cho phép tương tác. Nhờ đó bạn không cần tự viết lệnh chờ thủ công — điểm khác biệt lớn so với công cụ đời cũ.

Ví dụ, khi gọi `await nut.click()`, Playwright chờ tới khi nút thực sự click được rồi mới click. Nếu sau timeout vẫn chưa sẵn sàng, nó báo lỗi (loại timeout đã học ở [Bài 17](../doc-loi-va-tu-duy-debug/)).

## click — nhấp chuột

```javascript
await page.getByRole('button', { name: 'Đăng nhập' }).click();

// Các biến thể
await locator.dblclick();                    // nhấp đúp
await locator.click({ button: 'right' });    // chuột phải
```

## fill — điền text vào ô nhập

`fill` xóa nội dung cũ và điền giá trị mới vào ô input/textarea:

```javascript
await page.getByLabel('Email').fill('test@demo.com');
await page.getByLabel('Mật khẩu').fill('Test@1234');
```

`fill` là cách điền form được khuyến nghị — nhanh và ổn định. Khi cần mô phỏng gõ từng phím (ví dụ để kích hoạt gợi ý tìm kiếm), dùng `pressSequentially`:

```javascript
await page.getByPlaceholder('Tìm kiếm').pressSequentially('playwright');
```

## check / uncheck — tick checkbox và radio

```javascript
await page.getByLabel('Ghi nhớ đăng nhập').check();
await page.getByLabel('Nhận email quảng cáo').uncheck();
```

`check` đảm bảo ô ở trạng thái đã tick (không đảo qua lại như click thường). Xác minh trạng thái bằng assertion `toBeChecked` (Bài 20).

## selectOption — chọn trong dropdown

Với dropdown `<select>` chuẩn:

```javascript
// Chọn theo value
await page.getByLabel('Quốc gia').selectOption('vn');

// Chọn theo nhãn hiển thị
await page.getByLabel('Quốc gia').selectOption({ label: 'Việt Nam' });
```

Lưu ý: dropdown "giả" dựng bằng `<div>` (không phải thẻ `<select>` thật) thì xử lý như danh sách phần tử thông thường — click mở rồi click chọn.

## Upload file

```javascript
await page.getByLabel('Tải ảnh lên').setInputFiles('duong-dan/anh.png');

// Nhiều file
await page.getByLabel('Tài liệu').setInputFiles(['a.pdf', 'b.pdf']);

// Xóa file đã chọn
await page.getByLabel('Tải ảnh lên').setInputFiles([]);
```

## Bàn phím và di chuột

```javascript
await page.getByLabel('Email').press('Enter');   // nhấn phím trên phần tử
await page.keyboard.press('Escape');             // nhấn phím toàn cục
await locator.hover();                           // di chuột lên (hiện tooltip, menu)
```

`press` nhận tên phím như `Enter`, `Tab`, `Escape`, `ArrowDown`, hoặc tổ hợp như `Control+A`.

## Ví dụ hoàn chỉnh: điền và submit form

Ghép các hành động thành một luồng đăng nhập theo cấu trúc AAA:

```javascript
const { test, expect } = require('@playwright/test');

test('đăng nhập thành công với thông tin hợp lệ', async ({ page }) => {
  // Arrange
  await page.goto('/login');

  // Act
  await page.getByLabel('Email').fill('test@demo.com');
  await page.getByLabel('Mật khẩu').fill('Test@1234');
  await page.getByLabel('Ghi nhớ đăng nhập').check();
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  // Assert (chi tiết ở Bài 20)
  await expect(page.getByText('Xin chào')).toBeVisible();
});
```

## Lỗi thường gặp

- **Timeout khi click** — phần tử bị che, chưa hiển thị, hoặc locator sai. Playwright báo rõ lý do trong call log; đọc kỹ (Bài 17).
- **`fill` không chạy trên phần tử không phải input** — `fill` chỉ dùng cho input/textarea/contenteditable. Với phần tử khác cần cách khác.
- **selectOption sai giá trị** — value truyền vào phải khớp thuộc tính `value` của `<option>`; kiểm tra HTML bằng DevTools nếu không chắc.
- **Quên `await`** — hành động không hoàn thành trước dòng sau, gây kết quả chập chờn. Luôn `await`.

[Bài 20](../assertion-voi-expect/) học cách **kiểm tra kết quả** bằng `expect` — hoàn thiện phần "Assert" của test.

## 🛠 Thực hành

1. **Điền form:** trên một trang đăng nhập bất kỳ (hoặc trang demo), viết test điền email, mật khẩu bằng `fill` và click nút submit.
2. **Checkbox và dropdown:** tìm một form có checkbox và dropdown, viết test `check` một ô và `selectOption` một giá trị.
3. **Bàn phím:** viết test điền ô tìm kiếm rồi `press('Enter')` thay vì click nút, xác nhận trang chuyển sang kết quả tìm kiếm.

## Website tham khảo

- [Playwright — Actions](https://playwright.dev/docs/input) — đầy đủ các hành động nhập liệu.
- [Playwright — Auto-waiting](https://playwright.dev/docs/actionability) — cơ chế chờ phần tử sẵn sàng.
- [Playwright — Locator API](https://playwright.dev/docs/api/class-locator) — tham chiếu mọi phương thức hành động.

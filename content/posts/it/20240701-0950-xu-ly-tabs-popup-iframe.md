+++
date        = '2024-07-01T09:50:00+07:00'
draft       = false
title       = 'Bài 25 — Xử lý multiple tabs, popup, iframe và dialog'
slug        = 'xu-ly-tabs-popup-iframe'
summary     = 'Thao tác với các tình huống giao diện phức tạp: tab/popup mới mở, iframe lồng trong trang, và hộp thoại dialog (alert/confirm). Các kỹ thuật cần khi test ứng dụng thực tế.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-25-multiple-tabs-popup-iframe.webp'
featured    = false
weight      = 26
categories  = ['automation']
tags        = ['automation-test', 'playwright', 'iframe', 'popup']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Ứng dụng thật không chỉ có một trang phẳng. Chúng mở tab mới, hiện popup, nhúng nội dung trong iframe, bật hộp thoại xác nhận. Bài này trang bị kỹ thuật xử lý các tình huống đó — những chỗ người mới hay bí vì locator thông thường "không thấy" phần tử.

## Multiple tabs và popup

Khi click một link mở tab/cửa sổ mới, Playwright coi đó là một `page` mới. Bạn phải **bắt** page mới đó để thao tác. Vì việc mở là bất đồng bộ, dùng mẫu `waitForEvent('popup')` cùng lúc với hành động mở:

```javascript
// Bắt tab mới mở khi click
const [tabMoi] = await Promise.all([
  page.waitForEvent('popup'),                              // chờ page mới
  page.getByRole('link', { name: 'Mở tab mới' }).click(),  // hành động gây mở
]);

// Thao tác trên tab mới
await tabMoi.waitForLoadState();
await expect(tabMoi).toHaveTitle(/Trang mới/);
await tabMoi.getByRole('button', { name: 'OK' }).click();
```

`Promise.all` chạy hai việc song song và chờ cả hai (nhắc lại Promise ở [Bài 10](../bat-dong-bo-promise-async-await/)): đăng ký lắng nghe popup *trước*, rồi mới click — tránh bỏ lỡ sự kiện. `tabMoi` là một `page` độc lập, dùng đúng mọi API đã học.

Chuyển thao tác qua lại giữa các tab chỉ là dùng biến `page` tương ứng (`page` gốc hay `tabMoi`).

## iframe

**iframe** là một trang web nhúng bên trong trang khác (thường gặp: khung thanh toán, quảng cáo, widget nhúng). Phần tử trong iframe **không** truy cập được bằng locator thông thường — phải đi vào frame trước bằng `frameLocator`:

```javascript
// Định vị iframe, rồi tìm phần tử bên trong nó
const frame = page.frameLocator('#payment-iframe');
await frame.getByLabel('Số thẻ').fill('4111111111111111');
await frame.getByRole('button', { name: 'Thanh toán' }).click();
```

- `page.frameLocator('<selector-cua-iframe>')` trỏ tới iframe.
- Từ `frame`, dùng các locator quen thuộc (`getByLabel`, `getByRole`) như với một trang bình thường.

> Đây là nguyên nhân số một khiến người mới bối rối: phần tử "rõ ràng nằm trên trang" mà locator báo không tìm thấy. Nếu inspect thấy phần tử nằm trong thẻ `<iframe>`, bạn **bắt buộc** phải qua `frameLocator`. Kiểm tra bằng DevTools ([Bài 12](../lam-quen-devtools/)) khi nghi ngờ.

## Dialog: alert, confirm, prompt

**Dialog** là hộp thoại trình duyệt bật lên bằng JavaScript (`alert`, `confirm`, `prompt`) — không phải phần tử HTML trên trang, nên không click bằng locator được. Playwright **tự động đóng** dialog theo mặc định, nhưng khi cần kiểm soát, đăng ký handler *trước* khi kích hoạt:

```javascript
// Đăng ký cách xử lý dialog TRƯỚC khi hành động làm nó xuất hiện
page.on('dialog', async (dialog) => {
  console.log(dialog.message());   // đọc nội dung
  await dialog.accept();           // bấm OK (hoặc dialog.dismiss() để Hủy)
});

await page.getByRole('button', { name: 'Xóa' }).click();  // hành động bật confirm
```

- `page.on('dialog', ...)` lắng nghe dialog xuất hiện.
- `dialog.accept()` = bấm OK; `dialog.dismiss()` = bấm Cancel; `dialog.accept('text')` cho prompt.
- Đăng ký handler **trước** hành động, vì dialog xuất hiện ngay khi hành động chạy.

## Xử lý download

Tương tự popup, bắt sự kiện download khi click nút tải:

```javascript
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: 'Tải xuống' }).click(),
]);

// Lưu file về đường dẫn mong muốn
await download.saveAs('duong-dan/file-tai-ve.pdf');
console.log(await download.suggestedFilename());
```

## Khi nào cần các kỹ thuật này

Không phải test nào cũng đụng tới. Nhưng khi test một ứng dụng thật, bạn sẽ gặp:

- **Popup/tab mới:** đăng nhập qua bên thứ ba (Google, Facebook), mở tài liệu.
- **iframe:** cổng thanh toán (Stripe, PayPal), reCAPTCHA, widget nhúng.
- **Dialog:** xác nhận xóa, cảnh báo rời trang.

Nhận biết đúng tình huống (qua DevTools) và áp dụng đúng kỹ thuật là điều tách một tester xử lý được app phức tạp với người chỉ test được trang đơn giản.

[Bài 26](../authentication-state/) giải quyết một vấn đề thực tế lớn: lưu trạng thái đăng nhập để không phải login lại trong mỗi test.

## 🛠 Thực hành

1. **Tab mới:** tìm một trang có link mở tab mới (thuộc tính `target="_blank"`), viết test bắt tab mới bằng `waitForEvent('popup')` và kiểm tra tiêu đề của nó.
2. **iframe:** tìm một trang có nội dung trong iframe (hoặc trang demo iframe), dùng `frameLocator` để thao tác một phần tử bên trong.
3. **Dialog:** tạo hoặc tìm một nút bật hộp thoại `confirm`, viết test đăng ký handler và `accept()` nó, xác nhận hành động sau đó xảy ra.

## Website tham khảo

- [Playwright — Pages, popups](https://playwright.dev/docs/pages) — xử lý nhiều page và popup.
- [Playwright — Frames](https://playwright.dev/docs/frames) — làm việc với iframe.
- [Playwright — Dialogs](https://playwright.dev/docs/dialogs) — xử lý alert/confirm/prompt.
- [Playwright — Downloads](https://playwright.dev/docs/downloads) — bắt và lưu file tải về.

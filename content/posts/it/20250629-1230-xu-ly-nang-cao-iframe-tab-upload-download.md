+++
date        = '2025-06-29T12:30:00+07:00'
draft       = false
title       = 'Xử lý nâng cao: iframe, tab, upload/download, dialog'
slug        = 'xu-ly-nang-cao-iframe-tab-upload-download'
summary     = 'Những tình huống thực tế hay gặp: thao tác trong iframe, mở tab/popup mới, upload và download file, xử lý dialog (alert/confirm/prompt), drag & drop và giả lập thiết bị di động.'
thumbnail   = '/images/playwright-series/playwright-bai-10-xu-ly-nang-cao-iframe-tab-upload-download-dialog.webp'
featured    = false
weight      = 10
categories  = ['it']
subcategories = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Ứng dụng thật luôn có những phần "khó nhằn": cổng thanh toán trong iframe, nút mở tab mới, upload ảnh, xác nhận xóa bằng dialog. Bài này gom các tình huống nâng cao hay gặp và cách Playwright xử lý từng cái — phần lớn đều gọn gàng hơn bạn nghĩ.

## iframe — thao tác bên trong khung nhúng

Phần tử trong iframe **không** truy cập trực tiếp từ `page`. Dùng `frameLocator`:

```ts
// Định vị iframe rồi tìm phần tử BÊN TRONG nó
const frame = page.frameLocator('#payment-iframe');
await frame.getByLabel('Số thẻ').fill('4242424242424242');
await frame.getByRole('button', { name: 'Thanh toán' }).click();
```

`frameLocator` cũng có auto-waiting như locator thường. iframe lồng nhau thì chuỗi lại:

```ts
page.frameLocator('#outer').frameLocator('#inner').getByRole('button');
```

## Tab / popup mới

Khi click mở tab mới (`target="_blank"` hoặc `window.open`), bạn cần "bắt" page mới qua sự kiện `popup`:

```ts
// Đăng ký chờ popup TRƯỚC khi click
const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Mở trang điều khoản' }).click();
const popup = await popupPromise;

// Giờ thao tác trên tab mới
await popup.waitForLoadState();
await expect(popup).toHaveTitle(/Điều khoản/);
await popup.close();
```

Cùng pattern "đăng ký trước, kích hoạt sau" như `waitForResponse` ở bài Actions — để tránh race condition.

## Upload file

Playwright không cần thao tác qua hộp thoại OS — set thẳng file vào input:

```ts
// Cách phổ biến: set vào <input type="file">
await page.getByLabel('Ảnh đại diện').setInputFiles('fixtures/avatar.png');

// Nhiều file
await page.getByLabel('Tài liệu').setInputFiles([
  'fixtures/a.pdf', 'fixtures/b.pdf',
]);

// Xóa lựa chọn
await page.getByLabel('Ảnh đại diện').setInputFiles([]);

// Tạo file trong bộ nhớ (không cần file thật trên đĩa)
await page.getByLabel('Tệp').setInputFiles({
  name: 'data.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('nội dung file'),
});
```

Nếu nút upload không phải `<input>` thuần mà mở dialog OS qua JS, bắt sự kiện `filechooser`:

```ts
const chooserPromise = page.waitForEvent('filechooser');
await page.getByRole('button', { name: 'Chọn ảnh' }).click();
const chooser = await chooserPromise;
await chooser.setFiles('fixtures/avatar.png');
```

## Download file

```ts
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Tải báo cáo' }).click();
const download = await downloadPromise;

// Tên file gợi ý từ server
expect(download.suggestedFilename()).toBe('report.xlsx');

// Lưu ra đường dẫn mong muốn
await download.saveAs('downloads/report.xlsx');

// Hoặc đọc nội dung để kiểm tra
const path = await download.path();
```

## Dialog: alert, confirm, prompt

Dialog của trình duyệt **chặn** trang. Playwright **tự động đóng** (dismiss) chúng theo mặc định để test không treo. Khi cần kiểm soát, đăng ký handler `dialog`:

```ts
// Chấp nhận confirm
page.on('dialog', async dialog => {
  expect(dialog.type()).toBe('confirm');
  expect(dialog.message()).toBe('Bạn chắc chắn muốn xóa?');
  await dialog.accept();
});
await page.getByRole('button', { name: 'Xóa' }).click();

// Nhập giá trị cho prompt
page.once('dialog', d => d.accept('Tên mới'));

// Từ chối
page.once('dialog', d => d.dismiss());
```

> Đăng ký handler **trước** hành động kích hoạt dialog. Dùng `page.once` nếu chỉ mong đợi một dialog.

## Drag & drop

```ts
// Cách đơn giản
await page.getByText('Thẻ A').dragTo(page.getByTestId('cột-đích'));

// Kiểm soát chi tiết (cho UI nhạy cảm với từng bước chuột)
const source = page.getByText('Thẻ A');
await source.hover();
await page.mouse.down();
await page.getByTestId('cột-đích').hover();
await page.mouse.up();
```

## Hover menu, tooltip

```ts
await page.getByRole('button', { name: 'Tài khoản' }).hover();
await expect(page.getByRole('menu')).toBeVisible();
await page.getByRole('menuitem', { name: 'Cài đặt' }).click();
```

## Giả lập thiết bị di động và quyền

```ts
// Trong config: project mobile dùng device preset (đã thấy ở bài cấu hình)
{ name: 'mobile', use: { ...devices['Pixel 7'] } }

// Cấp quyền (vị trí, camera...) và set toạ độ
test.use({
  permissions: ['geolocation'],
  geolocation: { latitude: 10.762622, longitude: 106.660172 }, // TP.HCM
  locale: 'vi-VN',
  timezoneId: 'Asia/Ho_Chi_Minh',
});
```

## Chụp ảnh có chủ đích

```ts
await page.screenshot({ path: 'full.png', fullPage: true });
await page.getByRole('article').screenshot({ path: 'card.png' }); // chỉ một phần tử
```

## Tóm tắt

- Dùng **`frameLocator`** cho phần tử trong iframe; chuỗi lại cho iframe lồng nhau.
- Tab mới, download, filechooser, dialog đều theo pattern **đăng ký sự kiện trước, kích hoạt sau**.
- **`setInputFiles`** xử lý upload không cần đụng hộp thoại OS; `download.saveAs` để lưu file tải về.
- Dialog mặc định bị tự đóng — đăng ký `page.on('dialog')` khi cần `accept`/`dismiss` có kiểm soát.

---

**Bài trước**: [← Authentication và quản lý storage state](/posts/authentication-storage-state/)

**Bài tiếp theo**: [API Testing với Playwright →](/posts/api-testing-voi-playwright/)

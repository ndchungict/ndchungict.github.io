+++
date        = '2026-07-01T10:20:00+07:00'
draft       = true
title       = 'Bài 31 — Giới thiệu Visual Regression Testing'
slug        = 'visual-regression-testing'
summary     = 'Phát hiện thay đổi giao diện ngoài ý muốn bằng so sánh ảnh chụp: toHaveScreenshot, baseline và diff, xử lý phần động, và khi nào visual testing thực sự đáng dùng.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 32
categories  = ['automation']
tags        = ['automation-test', 'playwright', 'visual-testing']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Các assertion đã học kiểm tra *chức năng*: text đúng không, nút bấm được không. Nhưng chúng không bắt được lỗi **giao diện**: một nút lệch, màu sai, layout vỡ. **Visual regression testing** lấp khoảng trống này bằng cách so sánh ảnh chụp giao diện qua thời gian. Bài này khép Giai đoạn 5 với một kỹ thuật bổ sung mạnh mẽ.

## Vấn đề: assertion chức năng không thấy lỗi hiển thị

Một trang có thể *hoạt động đúng* nhưng *trông sai*: CSS lỗi làm nút tràn ra ngoài, khoảng cách lệch, phần tử chồng lên nhau. Assertion `toBeVisible` hay `toHaveText` vẫn pass, vì về mặt chức năng phần tử vẫn ở đó và đúng nội dung. Lỗi hiển thị lọt lưới.

**Visual regression testing** giải quyết bằng cách: chụp ảnh giao diện ở trạng thái "đúng" (baseline), rồi mỗi lần chạy sau so sánh ảnh mới với baseline. Khác biệt về pixel = có thể là lỗi hiển thị.

## toHaveScreenshot: so sánh ảnh

Playwright có sẵn assertion `toHaveScreenshot`:

```javascript
const { test, expect } = require('@playwright/test');

test('giao diện trang chủ khớp baseline', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('trang-chu.png');
});
```

Cơ chế hoạt động:

- **Lần chạy đầu tiên:** chưa có ảnh baseline, Playwright chụp và lưu làm baseline, test được đánh dấu cần xác nhận (thường "fail" lần đầu một cách có chủ đích).
- **Các lần sau:** chụp ảnh mới, so với baseline. Khớp → pass. Khác → fail, kèm ảnh **diff** làm nổi vùng khác biệt.

Có thể chụp cả trang hoặc chỉ một phần tử:

```javascript
await expect(page.getByRole('banner')).toHaveScreenshot('header.png');
```

## Baseline và diff

- **Baseline** là ảnh "chuẩn" được lưu trong repo (thư mục `*-snapshots`), commit cùng code.
- Khi test fail vì khác biệt, HTML report hiện ba ảnh: **Expected** (baseline), **Actual** (hiện tại), **Diff** (vùng khác được tô nổi).

Khi thay đổi giao diện là **có chủ đích** (bạn cố tình đổi thiết kế), cập nhật baseline:

```bash
npx playwright test --update-snapshots
```

Lệnh này chụp lại baseline mới. Nhớ commit baseline cập nhật cùng thay đổi code.

## Xử lý phần động

Kẻ thù lớn nhất của visual testing là **nội dung thay đổi mỗi lần chạy**: ngày giờ, quảng cáo, ảnh động, dữ liệu ngẫu nhiên. Chúng làm ảnh khác nhau dù giao diện không lỗi — gây false positive.

Cách xử lý:

```javascript
await expect(page).toHaveScreenshot('trang.png', {
  // Che các phần tử động
  mask: [page.getByTestId('quang-cao'), page.getByTestId('thoi-gian')],
  // Cho phép sai lệch nhỏ (chống khác biệt do render)
  maxDiffPixelRatio: 0.01,
});
```

- `mask` — che (bôi đen) các phần tử động để bỏ qua khi so sánh.
- `maxDiffPixelRatio` / `maxDiffPixels` — ngưỡng chấp nhận khác biệt nhỏ do khác biệt render giữa các máy.

## Cạm bẫy: khác biệt môi trường

Ảnh render **khác nhau** giữa các hệ điều hành (font, cách vẽ) — baseline chụp trên macOS có thể fail khi so trên Linux của CI. Đây là vấn đề thực tế lớn nhất của visual testing.

Giải pháp chuẩn: **tạo baseline trong cùng môi trường sẽ chạy so sánh** — thường là chạy `--update-snapshots` *trên CI* (hoặc trong Docker khớp môi trường CI), không phải trên máy cá nhân. Nhờ đó baseline và ảnh so sánh cùng điều kiện render.

## Khi nào nên dùng visual testing

Visual testing mạnh nhưng tốn công bảo trì (baseline đổi mỗi khi thiết kế đổi). Cân nhắc:

- **Nên dùng:** các thành phần giao diện quan trọng, ổn định (header, trang landing, component thư viện UI); phát hiện lỗi CSS hồi quy.
- **Thận trọng:** trang nhiều nội dung động; giai đoạn thiết kế còn thay đổi liên tục (baseline vỡ suốt, tốn công hơn lợi).

> Visual testing là *bổ sung*, không thay thế test chức năng. Đừng visual-test mọi trang — bạn sẽ ngập trong việc cập nhật baseline. Dùng nó có chọn lọc cho các phần giao diện mà lỗi hiển thị gây hậu quả thật. Với dự án lớn, nhiều team dùng dịch vụ chuyên visual testing để quản lý baseline tốt hơn.

Giai đoạn 5 hoàn tất. [Bài 32](../xay-dung-test-suite-hoan-chinh/) mở Giai đoạn 6 — project thực chiến: dựng một bộ test hoàn chỉnh cho website thương mại điện tử, tổng hợp mọi thứ đã học.

## 🛠 Thực hành

1. **Baseline đầu tiên:** viết test `toHaveScreenshot` cho một trang tĩnh, chạy hai lần (lần đầu tạo baseline, lần sau so sánh) và xác nhận pass.
2. **Phát hiện thay đổi:** sửa một chút CSS/nội dung của trang, chạy lại và xem ảnh diff trong HTML report.
3. **Che phần động:** tìm một trang có phần tử thay đổi (thời gian, số ngẫu nhiên), dùng `mask` để bỏ qua nó và làm test ổn định.

## Website tham khảo

- [Playwright — Visual comparisons](https://playwright.dev/docs/test-snapshots) — hướng dẫn đầy đủ.
- [Playwright — toHaveScreenshot](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot-1) — tham chiếu assertion.
- [Playwright — Test snapshots on CI](https://playwright.dev/docs/test-snapshots#docker) — xử lý khác biệt môi trường bằng Docker.

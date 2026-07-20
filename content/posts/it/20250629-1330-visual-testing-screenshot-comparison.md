+++
date        = '2025-06-29T13:30:00+07:00'
draft       = false
title       = 'Visual Testing và Screenshot Comparison'
slug        = 'visual-testing-screenshot-comparison'
summary     = 'Phát hiện thay đổi giao diện ngoài ý muốn bằng toHaveScreenshot: tạo baseline, so sánh pixel, cấu hình ngưỡng sai khác, che vùng động, cập nhật snapshot và giữ visual test ổn định trên CI.'
thumbnail   = '/images/playwright-series/playwright-bai-12-visual-testing.webp'
featured    = false
weight      = 12
categories  = ['it']
subcategories = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Test chức năng kiểm tra "nút có hoạt động không", nhưng không bắt được "nút bị lệch, đổi màu, hay biến mất khỏi layout". **Visual regression testing** lấp khoảng trống đó: chụp ảnh giao diện, so với ảnh chuẩn (baseline), báo động khi có sai khác pixel. Playwright tích hợp sẵn tính năng này.

## `toHaveScreenshot` — so sánh ảnh

```ts
test('giao diện trang chủ không đổi', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

Lần chạy **đầu tiên**: chưa có baseline → Playwright chụp và lưu, test được đánh dấu "đã tạo snapshot" (coi như chưa pass thật). Các lần sau: chụp ảnh mới, so với baseline. Lệch quá ngưỡng → **fail** kèm ảnh diff.

Ảnh baseline lưu cạnh file test:

```
tests/
  home.spec.ts
  home.spec.ts-snapshots/
    homepage-chromium-darwin.png    ← baseline theo project + OS
```

> Tên baseline gắn với **trình duyệt và hệ điều hành**. Đây là lý do visual test phải tạo baseline trên **cùng môi trường** sẽ chạy (thường là CI/Docker), không phải máy local — sẽ nói kỹ ở phần CI.

## Chụp một phần tử thay vì cả trang

So cả trang dễ vỡ vì nhiều thứ thay đổi. Khoanh vùng vào component cần kiểm soát:

```ts
await expect(page.getByRole('navigation')).toHaveScreenshot('nav.png');
await expect(page.getByTestId('product-card')).toHaveScreenshot('card.png');
```

## Cấu hình ngưỡng sai khác

Khác biệt render nhỏ (anti-aliasing, font hinting) là bình thường. Điều chỉnh độ nhạy:

```ts
await expect(page).toHaveScreenshot('home.png', {
  maxDiffPixels: 100,        // cho phép tối đa 100 pixel khác
  maxDiffPixelRatio: 0.01,   // hoặc 1% tổng số pixel
  threshold: 0.2,            // ngưỡng khác biệt mỗi pixel (0-1), mặc định 0.2
});
```

Đặt mặc định toàn dự án trong config:

```ts
// playwright.config.ts
expect: {
  toHaveScreenshot: { maxDiffPixelRatio: 0.01, threshold: 0.2 },
},
```

## Xử lý nội dung động — kẻ thù của visual test

Ngày giờ, avatar ngẫu nhiên, quảng cáo, animation... khiến ảnh khác nhau mỗi lần chạy. Cách xử lý:

```ts
await expect(page).toHaveScreenshot('home.png', {
  // Che các vùng động — Playwright phủ ô màu lên trước khi so
  mask: [page.getByTestId('timestamp'), page.locator('.ad-banner')],

  // Tắt animation để ảnh ổn định
  animations: 'disabled',

  // Chụp full page
  fullPage: true,
});
```

Các mẹo bổ sung làm ổn định:

```ts
// Cố định thời gian/seed nếu app cho phép
await page.clock.setFixedTime(new Date('2026-06-30T08:00:00'));

// Ẩn caret nhấp nháy, vô hiệu hoá transition qua CSS inj, v.v.
await expect(page).toHaveScreenshot({ caret: 'hide' });
```

## Cập nhật baseline khi thay đổi là chủ đích

Khi bạn **cố ý** đổi UI, cập nhật ảnh chuẩn:

```bash
# Cập nhật toàn bộ snapshot
npx playwright test --update-snapshots

# Chỉ một file
npx playwright test home.spec.ts --update-snapshots
```

Sau đó **review ảnh mới trong code review** như review code — đây là bước quan trọng để không vô tình "đóng dấu" một lỗi giao diện.

## So sánh ảnh bất kỳ (không phải snapshot trang)

`toMatchSnapshot` so một buffer/chuỗi bất kỳ với baseline — hữu ích cho ảnh tải về, file export:

```ts
const download = await downloadPromise;
const buffer = await fs.readFile(await download.path());
expect(buffer).toMatchSnapshot('report-thumbnail.png');
```

## Giữ visual test ổn định trên CI

Đây là phần khiến nhiều người bỏ cuộc. Nguyên tắc:

1. **Tạo baseline trên CI/Docker**, không trên máy local — render khác nhau giữa OS/máy.
2. Dùng **cùng image Docker** (ví dụ `mcr.microsoft.com/playwright`) cho cả tạo baseline lẫn chạy CI.
3. Ưu tiên **chụp component** thay vì full page để giảm điểm vỡ.
4. Luôn `animations: 'disabled'` và `mask` vùng động.
5. Đặt ngưỡng `maxDiffPixelRatio` hợp lý — quá chặt thì flaky, quá lỏng thì bỏ sót lỗi.

## Khi nào dùng — và không dùng — visual test

- **Nên**: design system, component library, trang marketing tĩnh, layout quan trọng.
- **Cân nhắc**: trang nhiều nội dung động, dashboard real-time — chi phí duy trì baseline cao.
- Visual test **bổ sung** chứ không thay thế test chức năng. Một ảnh "khớp pixel" không đảm bảo logic đúng.

## Tóm tắt

- `toHaveScreenshot` tạo **baseline** lần đầu, các lần sau **so pixel** và fail nếu lệch quá ngưỡng.
- Ưu tiên chụp **component**, dùng `mask` + `animations: 'disabled'` để chống nội dung động gây flaky.
- Baseline gắn với **OS + trình duyệt** → tạo và chạy trên **cùng môi trường (Docker/CI)**.
- Cập nhật bằng `--update-snapshots` và **review ảnh mới** như review code; visual test bổ sung, không thay thế test chức năng.

---

**Bài trước**: [← API Testing với Playwright](/posts/api-testing-voi-playwright/)

**Bài tiếp theo**: [Debugging: Trace Viewer, Codegen và UI Mode →](/posts/debugging-trace-viewer-codegen-ui-mode/)

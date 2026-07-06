+++
date        = '2025-06-29T14:00:00+07:00'
draft       = false
title       = 'Debugging: Trace Viewer, Codegen và UI Mode'
slug        = 'debugging-trace-viewer-codegen-ui-mode'
summary     = 'Bộ công cụ debug mạnh nhất của Playwright: Trace Viewer để "time-travel" qua từng action, UI Mode để phát triển test tương tác, Codegen để sinh test, Inspector và các kỹ thuật điều tra flaky test.'
thumbnail   = '/images/playwright-series/playwright-bai-13-debugging-trace-viewer-ui-mode-codegen-flaky.webp'
featured    = false
weight      = 13
categories  = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Khi test fail trên CI lúc 2 giờ sáng mà bạn không tái hiện được ở local — đó là lúc bộ công cụ debug của Playwright cứu bạn. **Trace Viewer**, **UI Mode**, **Codegen** và **Inspector** biến việc điều tra lỗi từ đoán mò thành xem lại chính xác chuyện gì đã xảy ra.

## Trace Viewer — "time-travel" qua từng action

Trace ghi lại **toàn bộ** quá trình chạy test: ảnh DOM trước/sau mỗi action, network, console, source code. Đây là công cụ debug giá trị nhất.

### Bật trace

```ts
// playwright.config.ts
use: {
  trace: 'on-first-retry',   // ghi trace khi test fail rồi retry
}
```

Các giá trị:

| Giá trị | Khi nào ghi |
|---|---|
| `'on'` | Mọi test (tốn dung lượng) |
| `'off'` | Không bao giờ |
| `'on-first-retry'` | Khi retry lần đầu — **khuyến nghị** |
| `'retain-on-failure'` | Giữ lại nếu test fail |

### Mở trace

```bash
# Mở từ report HTML (click vào test fail) hoặc trực tiếp:
npx playwright show-trace trace.zip
```

Trong Trace Viewer bạn có:

- **Timeline/filmstrip**: rê chuột để xem từng khung hình giao diện.
- **Action list**: click từng action để xem DOM snapshot **trước và sau**.
- **DOM snapshot tương tác**: thực sự inspect được element tại thời điểm đó.
- **Tab Network, Console, Source, Errors**: tất cả ngữ cảnh trong một chỗ.

Nhờ DOM snapshot, bạn thấy chính xác locator của mình lúc fail trỏ vào đâu (hoặc không trỏ vào đâu) — gần như luôn đủ để hiểu nguyên nhân.

## UI Mode — phát triển test tương tác

Đây nên là cách bạn **viết** test hằng ngày:

```bash
npx playwright test --ui
```

UI Mode cho bạn:

- **Watch mode**: tự chạy lại test khi lưu file.
- **Time-travel** ngay khi chạy, không cần fail.
- **Pick locator**: rê chuột lên giao diện, Playwright gợi ý locator tốt nhất.
- Chạy lại từng test, xem trace, network, console — tất cả trong một cửa sổ.

## Codegen — sinh test bằng cách thao tác

Không chắc viết locator/flow thế nào? Để Playwright ghi lại thao tác của bạn:

```bash
npx playwright codegen https://myapp.com
```

Bạn click/gõ trên trình duyệt, Playwright sinh code test tương ứng theo đúng thứ tự ưu tiên locator. Hữu ích để:

- Bắt đầu nhanh một test mới.
- Học cách Playwright chọn locator.
- Lấy locator cho một phần tử khó.

> Codegen sinh code làm **điểm khởi đầu**, không phải bản cuối. Luôn refactor: gom vào page object, đặt tên ý nghĩa, thêm assertion hợp lý.

## Chạy có giao diện và làm chậm

```bash
# Thấy trình duyệt thật chạy
npx playwright test --headed

# Chạy chậm lại để quan sát (mili-giây mỗi thao tác)
# trong config:
use: { launchOptions: { slowMo: 500 } }
```

## Playwright Inspector và breakpoint

```bash
# Mở Inspector, dừng ở từng bước, step-through
PWDEBUG=1 npx playwright test
# hoặc
npx playwright test --debug
```

Đặt điểm dừng thủ công trong code:

```ts
await page.pause();   // mở Inspector và dừng tại đây, bạn thao tác/inspect tay
```

`page.pause()` cực mạnh: dừng ngay tại dòng đó, bạn dùng "Pick locator" thử nghiệm locator trực tiếp trên trang.

## Debug bằng log và console

```ts
// In ra console của trang (không phải của Node)
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err));

// Bật log nội bộ của Playwright (rất chi tiết)
// DEBUG=pw:api npx playwright test
```

## Điều tra flaky test một cách có hệ thống

Test "lúc pass lúc fail" là loại khó nhất. Quy trình:

1. **Chạy lặp nhiều lần** để tái hiện:

```bash
npx playwright test flaky.spec.ts --repeat-each=20
npx playwright test flaky.spec.ts --workers=1   # loại trừ vấn đề song song
```

2. **Bật trace `on`** cho test đó, so sánh trace lần pass và fail.
3. Tìm các nghi phạm kinh điển:
   - Thiếu auto-wait → đang lấy giá trị trước khi UI cập nhật (dùng `expect(locator)` thay vì `.textContent()`).
   - Race condition mạng → đăng ký `waitForResponse` trước action.
   - Phụ thuộc thứ tự test / state dùng chung → cách ly bằng context riêng.
   - Animation/thời gian → `animations: 'disabled'`, cố định clock.

## Annotations và attachments trong report

Đính kèm thông tin debug vào report cho test cụ thể:

```ts
test('có log kèm theo', async ({ page }, testInfo) => {
  await testInfo.attach('screenshot', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  testInfo.annotations.push({ type: 'issue', description: 'JIRA-123' });
});
```

## Tóm tắt

- **Trace Viewer** là công cụ debug số một: DOM snapshot trước/sau mỗi action + network + console; bật `trace: 'on-first-retry'`.
- Viết test hằng ngày trong **UI Mode** (`--ui`): watch mode, time-travel, pick locator.
- **Codegen** sinh test khởi đầu; `page.pause()` + **Inspector** để step-through và thử locator trực tiếp.
- Với **flaky test**: `--repeat-each`, `--workers=1`, so trace pass/fail, và truy các nghi phạm kinh điển (thiếu wait, race, state dùng chung).

---

**Bài trước**: [← Visual Testing và Screenshot Comparison](/posts/visual-testing-screenshot-comparison/)

**Bài tiếp theo**: [Parallel, sharding và cấu hình nâng cao →](/posts/parallel-sharding-cau-hinh-nang-cao/)

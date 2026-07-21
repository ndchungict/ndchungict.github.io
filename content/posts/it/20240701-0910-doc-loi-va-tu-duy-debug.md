+++
date        = '2024-07-01T09:10:00+07:00'
draft       = false
title       = 'Bài 17 — Đọc lỗi và tư duy debug cho người mới'
slug        = 'doc-loi-va-tu-duy-debug'
summary     = 'Cách đọc thông báo lỗi Playwright không hoảng, phân loại các lỗi thường gặp, và quy trình debug có hệ thống. Đặt sớm để bạn không nản khi gặp màn hình đỏ.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-17-doc-loi-va-tu-duy-debug.webp'
featured    = false
weight      = 18
columns     = 2
categories  = ['it']
subcategories = ['qa-testing']
tags        = ['automation-test', 'playwright', 'debug']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Bài này đặt sớm có chủ đích. Bạn sắp viết nhiều test hơn, và **test sẽ fail** — đó là chuyện bình thường, kể cả với người làm lâu năm. Kỹ năng phân biệt người mới với người vững nghề không phải "không bao giờ gặp lỗi", mà là **đọc lỗi bình tĩnh và sửa có phương pháp**. Bài này trang bị đúng kỹ năng đó.

## Nguyên tắc nền: lỗi là thông tin, không phải thất bại

Thông báo lỗi (error message) không phải máy "trách" bạn — nó là **manh mối** chỉ ra chuyện gì sai và ở đâu. Phản xạ đúng khi thấy màn hình đỏ: **đọc kỹ**, không đóng vội, không đoán mò. Phần lớn lỗi tự nói ra nguyên nhân nếu bạn chịu đọc.

## Cấu trúc một thông báo lỗi

Lỗi trong Node.js/Playwright thường gồm ba phần. Ví dụ:

```text
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Đăng nhậpp' })
Expected: visible
Received: <element not found>

   at tests/login.spec.js:12:38
```

- **Loại và mô tả lỗi:** `expect(...).toBeVisible() failed` — assertion kiểm tra hiển thị đã thất bại.
- **Chi tiết:** locator nào, mong đợi gì (`Expected: visible`), nhận được gì (`Received: element not found`).
- **Vị trí (stack trace):** `at tests/login.spec.js:12:38` — lỗi xảy ra ở **file `login.spec.js`, dòng 12**. Luôn tìm dòng trỏ vào **file của bạn** trước.

Đọc theo thứ tự: *lỗi gì → chi tiết → dòng nào*. Ba câu hỏi này giải quyết phần lớn tình huống.

## Các loại lỗi thường gặp và cách xử lý

### 1. Timeout — không tìm thấy phần tử

```text
TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log: waiting for getByRole('button', { name: 'Submit' })
```

Đây là lỗi phổ biến **nhất**. Playwright chờ phần tử tới 30 giây rồi bỏ cuộc. Nguyên nhân thường gặp:

- **Locator sai** — gõ nhầm tên, sai role, phần tử không như bạn tưởng. → Dùng DevTools ([Bài 12](../lam-quen-devtools/)) kiểm tra lại.
- **Phần tử chưa xuất hiện** — cần thao tác khác trước đó, hoặc trang chưa tải xong.
- **Phần tử nằm trong iframe/tab khác** (Bài 25).

### 2. Assertion failed — kết quả không như mong đợi

```text
Error: expect(received).toHaveText(expected)
Expected string: "Chào mừng"
Received string: "Xin chào"
```

Phần tử tồn tại, nhưng giá trị không khớp. Đọc `Expected` vs `Received` để thấy khác biệt. Nguyên nhân hay gặp: khoảng trắng thừa (nhớ `.trim()` ở [Bài 8](../array-va-string-trong-javascript/)), text thực tế khác kỳ vọng, hoặc kỳ vọng của bạn sai.

### 3. Syntax / Reference error — lỗi code

```text
ReferenceError: pge is not defined
```

Lỗi lập trình thuần: gõ sai tên biến (`pge` thay vì `page`), thiếu ngoặc, thiếu `await`. Đọc dòng được chỉ và soát chính tả.

### 4. Strict mode violation — locator trúng nhiều phần tử

```text
Error: strict mode violation: getByRole('button') resolved to 3 elements
```

Playwright yêu cầu mỗi locator trỏ tới **đúng một** phần tử. Nếu trúng nhiều, cần locator cụ thể hơn (Bài 18).

## Công cụ debug của Playwright

Playwright có sẵn công cụ debug mạnh, không cần cài thêm:

```bash
# Chạy ở chế độ debug — dừng từng bước, mở trình duyệt kèm inspector
npx playwright test --debug

# UI Mode — giao diện trực quan chạy/xem lại từng test
npx playwright test --ui
```

- `--debug` mở **Playwright Inspector**: chạy test từng bước, xem locator được tô sáng trên trang, thử locator trực tiếp.
- `--ui` mở **UI Mode**: giao diện xem timeline từng hành động, tua tới lui, xem ảnh chụp mỗi bước. Đây là công cụ debug được khuyên dùng nhất.

Ngoài ra, **Trace Viewer** (Bài 28) cho phép xem lại "hộp đen" của một lần chạy đã fail — cực hữu ích khi test fail trên CI mà không tái hiện được ở máy.

## Quy trình debug có hệ thống

Khi một test fail, làm theo trình tự thay vì sửa mò:

1. **Đọc thông báo lỗi** — loại lỗi gì, dòng nào, mong đợi vs thực tế.
2. **Tái hiện** — chạy lại đúng test đó ở chế độ `--headed` hoặc `--ui` để thấy tận mắt.
3. **Khoanh vùng** — lỗi ở locator, ở dữ liệu, hay ở logic? Dùng DevTools kiểm tra phần tử.
4. **Sửa một thứ một lần** — đổi một chỗ, chạy lại. Đổi nhiều thứ cùng lúc sẽ không biết cái nào tác dụng.
5. **Xác nhận** — test pass ổn định (chạy lại vài lần), không phải may rủi.

> Cạm bẫy của người mới: thấy lỗi là lập tức thử random — thêm chỗ này, xóa chỗ kia — cho tới khi "tự nhiên chạy". Cách đó khiến bạn không hiểu vì sao lỗi, và nó sẽ quay lại. Debug có phương pháp chậm hơn lúc đầu nhưng nhanh hơn về lâu dài, và giúp bạn thực sự giỏi lên.

[Bài 18](../locator-trong-playwright/) đi vào **locator** — cách định vị phần tử của Playwright, cũng là nguồn gốc của phần lớn lỗi timeout bạn vừa học cách đọc.

## 🛠 Thực hành

1. **Gây lỗi có chủ đích:** trong một test đang chạy được, đổi tên một locator thành sai (thêm ký tự thừa), chạy lại và **đọc kỹ** thông báo timeout: nó chỉ ra locator nào, dòng nào?
2. **Debug bằng UI Mode:** chạy `npx playwright test --ui`, chọn một test, xem lại từng bước và ảnh chụp tương ứng.
3. **Phân loại lỗi:** cố ý tạo ba lỗi khác nhau — một ReferenceError (gõ sai `page`), một assertion fail (kỳ vọng text sai), một timeout (locator sai) — và ghi lại cách nhận biết mỗi loại.

## Website tham khảo

- [Playwright — Debugging Tests](https://playwright.dev/docs/debug) — Inspector, UI Mode, VS Code debug.
- [Playwright — UI Mode](https://playwright.dev/docs/test-ui-mode) — công cụ debug trực quan.
- [Playwright — Trace Viewer](https://playwright.dev/docs/trace-viewer-intro) — xem lại lần chạy đã fail.

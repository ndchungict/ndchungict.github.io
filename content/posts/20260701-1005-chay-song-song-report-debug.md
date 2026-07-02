+++
date        = '2026-07-01T10:05:00+07:00'
draft       = false
title       = 'Bài 28 — Chạy test song song, đọc report và debug với Trace Viewer'
slug        = 'chay-song-song-report-debug'
summary     = 'Tăng tốc bằng chạy song song và sharding, cấu hình retries, đọc HTML report, và điều tra test fail bằng Trace Viewer, screenshot, video — bộ công cụ debug mạnh nhất của Playwright.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-28-chay-test-song-song.webp'
featured    = false
weight      = 29
categories  = ['automation']
tags        = ['automation-test', 'playwright', 'trace-viewer', 'parallel']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Giai đoạn 4 khép lại bằng hai chủ đề vận hành: chạy test **nhanh** (song song) và điều tra test **fail** hiệu quả (Trace Viewer). Đây là kỹ năng phân biệt người chỉ viết được test với người vận hành được một bộ test lớn trong thực tế.

## Chạy test song song

Playwright mặc định chạy các test **song song** bằng nhiều worker (tiến trình chạy đồng thời). Đây là lý do bộ test lớn vẫn nhanh.

```javascript
// playwright.config.js
module.exports = defineConfig({
  fullyParallel: true,     // chạy song song cả test trong cùng file
  workers: 4,              // số tiến trình song song (mặc định theo số CPU)
});
```

- `fullyParallel: true` — cho phép các test *trong cùng file* cũng chạy song song.
- `workers` — số luồng đồng thời. Nhiều worker nhanh hơn nhưng tốn tài nguyên hơn.

Điều kiện để song song an toàn: **test phải độc lập** ([Bài 14](../thiet-ke-test-case-aaa/), [Bài 23](../fixtures-trong-playwright/)). Test phụ thuộc nhau sẽ fail ngẫu nhiên khi chạy song song. Đây là lý do tính độc lập được nhấn mạnh xuyên suốt series.

Kiểm soát nhanh qua dòng lệnh:

```bash
npx playwright test --workers=1     # chạy tuần tự (hữu ích khi debug)
npx playwright test --workers=50%   # dùng 50% số CPU
```

## Sharding: chia test qua nhiều máy

Với bộ test rất lớn chạy trên CI, **sharding** chia test thành nhiều phần chạy trên nhiều máy song song:

```bash
# Máy 1 chạy phần 1/4, máy 2 chạy phần 2/4, ...
npx playwright test --shard=1/4
npx playwright test --shard=2/4
```

Kỹ thuật này rút ngắn thời gian chạy CI đáng kể — sẽ dùng ở [Bài 30](../ci-cd-github-actions/).

## Retries: xử lý test chập chờn

`retries` cho phép tự chạy lại test fail vài lần trước khi báo fail hẳn:

```javascript
module.exports = defineConfig({
  retries: 2,   // thử lại tối đa 2 lần
});
```

Retries hữu ích để giảm ảnh hưởng của bất ổn tạm thời (mạng chập chờn). **Nhưng cảnh báo:** retries **không phải** cách sửa test flaky. Nếu một test cần retry mới pass, hãy tìm nguyên nhân gốc (thường là thiếu chờ đúng cách, hoặc phụ thuộc trạng thái). Dùng retries để che flakiness là nợ kỹ thuật sẽ quay lại cắn bạn.

## Đọc HTML report

Báo cáo HTML ([Bài 16](../cau-truc-project-playwright/)) là nơi đọc kết quả. Với test fail, mở báo cáo và nhấp vào test đó để thấy: bước nào fail, thông báo lỗi, ảnh chụp, video, và trace.

```bash
npx playwright show-report
```

## Trace Viewer: công cụ debug mạnh nhất

**Trace** là bản ghi đầy đủ một lần chạy test: từng hành động, ảnh chụp trước/sau mỗi bước, snapshot DOM, network, console. **Trace Viewer** cho phép xem lại "hộp đen" này — cực kỳ hữu ích khi test fail trên CI mà không tái hiện được ở máy.

Bật ghi trace trong config:

```javascript
module.exports = defineConfig({
  use: {
    trace: 'on-first-retry',   // ghi trace khi test được retry
  },
});
```

Các giá trị thường dùng: `'on-first-retry'` (khuyến nghị — chỉ ghi khi cần, tiết kiệm), `'retain-on-failure'` (giữ trace của test fail), `'on'` (luôn ghi — nặng).

Mở trace:

```bash
npx playwright show-trace trace.zip
```

Giao diện Trace Viewer cho bạn tua qua từng bước, xem chính xác trạng thái trang tại thời điểm fail — trả lời câu hỏi "lúc đó màn hình trông thế nào, phần tử có ở đó không". Đây là cách điều tra test fail nhanh và chắc chắn nhất.

## Screenshot và video khi fail

Playwright tự chụp ảnh và quay video khi cấu hình:

```javascript
module.exports = defineConfig({
  use: {
    screenshot: 'only-on-failure',   // chụp ảnh khi fail
    video: 'retain-on-failure',      // giữ video của test fail
  },
});
```

Chúng đính kèm vào HTML report, giúp thấy ngay hiện trạng lúc fail mà không cần chạy lại.

## Quy trình điều tra test fail — tổng hợp

Kết hợp mọi thứ đã học ([Bài 17](../doc-loi-va-tu-duy-debug/)):

1. Mở HTML report, đọc thông báo lỗi và xem ảnh/video của test fail.
2. Mở Trace Viewer để tua lại từng bước, xác định bước fail và trạng thái trang lúc đó.
3. Nếu cần, chạy lại đúng test đó với `--ui` hoặc `--debug` ở `--workers=1`.
4. Khoanh vùng, sửa một thứ, xác nhận pass ổn định.

Giai đoạn 4 hoàn tất: bạn đã có POM, fixtures, test data, xử lý UI phức tạp, auth, mock, và vận hành/debug. [Bài 29](../api-testing-voi-playwright/) mở Giai đoạn 5 — tích hợp thực tế, bắt đầu với API testing.

## 🛠 Thực hành

1. **Song song vs tuần tự:** chạy bộ test với `--workers=4` rồi `--workers=1`, so sánh thời gian.
2. **Bật và đọc trace:** đặt `trace: 'on'`, chạy một test (cố ý cho fail), mở Trace Viewer và tua qua các bước để tìm bước fail.
3. **Ảnh và video:** cấu hình `screenshot` và `video` chỉ khi fail, gây một test fail, và xem chúng trong HTML report.

## Website tham khảo

- [Playwright — Parallelism](https://playwright.dev/docs/test-parallel) — chạy song song và workers.
- [Playwright — Sharding](https://playwright.dev/docs/test-sharding) — chia test qua nhiều máy.
- [Playwright — Trace Viewer](https://playwright.dev/docs/trace-viewer) — hướng dẫn đầy đủ.
- [Playwright — Retries](https://playwright.dev/docs/test-retries) — cấu hình và triết lý retries.

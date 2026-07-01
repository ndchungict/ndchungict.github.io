+++
date        = '2026-07-01T09:05:00+07:00'
draft       = false
title       = 'Bài 16 — Cấu trúc project Playwright: file config, thư mục tests và HTML report'
slug        = 'cau-truc-project-playwright'
summary     = 'Hiểu playwright.config.js (baseURL, projects/trình duyệt, retries, timeout, reporter), tổ chức thư mục tests, và cách đọc HTML report. Nắm môi trường trước khi viết nhiều test.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 17
categories  = ['automation']
tags        = ['automation-test', 'playwright', 'config']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

[Bài 15](../cai-dat-playwright-test-dau-tien/) đã chạy được test. Bài này giúp bạn hiểu **môi trường** mình đang làm việc: file cấu hình, cách tổ chức test, và báo cáo. Nắm phần này giúp bạn tùy chỉnh hành vi Playwright thay vì chỉ chạy mù theo mặc định.

## playwright.config.js — trung tâm cấu hình

File `playwright.config.js` ở gốc dự án điều khiển gần như mọi hành vi của Playwright. Nó là một **object** cấu hình ([Bài 9](../object-trong-javascript/)). Một phiên bản rút gọn với các mục quan trọng nhất:

```javascript
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',        // thư mục chứa test
  fullyParallel: true,       // chạy các test song song
  retries: 0,                // số lần thử lại khi test fail
  timeout: 30000,            // thời gian tối đa cho MỖI test (ms)
  reporter: 'html',          // loại báo cáo

  use: {
    baseURL: 'https://demo.playwright.dev',  // URL gốc dùng chung
    trace: 'on-first-retry',                 // ghi trace khi retry
  },

  expect: {
    timeout: 5000,           // thời gian chờ tối đa cho mỗi assertion (ms)
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
```

Giải thích các mục cốt lõi:

| Mục | Vai trò |
|-----|---------|
| `testDir` | Thư mục Playwright tìm file test |
| `fullyParallel` | Chạy nhiều test đồng thời để nhanh hơn (Bài 28) |
| `retries` | Tự chạy lại test fail bao nhiêu lần trước khi báo fail hẳn |
| `timeout` | Thời gian tối đa cho **mỗi test** (mặc định 30 giây) |
| `expect.timeout` | Thời gian chờ tối đa cho **mỗi assertion** web-first (mặc định 5 giây) |
| `reporter` | Định dạng báo cáo (`html`, `list`, `dot`...) |
| `use.baseURL` | URL gốc — cho phép `page.goto('/login')` thay vì URL đầy đủ |
| `use.trace` | Khi nào ghi lại trace để debug (Bài 28) |
| `projects` | Danh sách môi trường/trình duyệt chạy test |

## baseURL — viết đường dẫn gọn

Khi đặt `baseURL`, các lời gọi điều hướng chỉ cần đường dẫn tương đối:

```javascript
// Không có baseURL:
await page.goto('https://demo.playwright.dev/todomvc');

// Có baseURL = 'https://demo.playwright.dev':
await page.goto('/todomvc');
```

Lợi ích thực tế: khi đổi môi trường (dev → staging → production), chỉ sửa `baseURL` một chỗ thay vì sửa URL trong từng test. Đây là best practice nên áp dụng ngay.

## projects — chạy trên nhiều trình duyệt

`projects` khai báo các cấu hình chạy khác nhau. Mặc định gồm ba trình duyệt: **chromium** (Chrome/Edge), **firefox**, **webkit** (Safari). Cùng một bộ test chạy trên cả ba — đó là lý do khi chạy `npx playwright test`, bạn thấy số test nhân lên.

Chạy chỉ một trình duyệt:

```bash
npx playwright test --project=chromium
```

Trong giai đoạn học và phát triển test, chạy một trình duyệt (thường chromium) cho nhanh; chạy cả ba khi cần kiểm tra tương thích chéo.

## Tổ chức thư mục tests

Khi số test tăng, tổ chức file theo tính năng giúp dễ quản lý:

```text
tests/
├── auth/
│   ├── login.spec.js
│   └── register.spec.js
├── cart/
│   └── add-to-cart.spec.js
└── search/
    └── search.spec.js
```

- Nhóm test theo tính năng/luồng nghiệp vụ, không nhét tất cả vào một file.
- Tên file mô tả rõ nội dung, kết thúc bằng `.spec.js`.
- Cấu trúc rõ ràng giúp chạy chọn lọc: `npx playwright test tests/auth`.

## Đọc HTML report

Báo cáo HTML (mở bằng `npx playwright show-report`) là công cụ đọc kết quả chính. Cấu trúc:

- **Danh sách test** kèm trạng thái pass (xanh) / fail (đỏ) / skipped.
- **Thời gian chạy** từng test — hữu ích để phát hiện test chậm.
- **Nhóm theo project** (trình duyệt).
- Nhấp một test để xem **từng bước** đã chạy; với test fail có thêm thông báo lỗi, ảnh chụp và trace.

Tập đọc báo cáo từ sớm: đây là nơi bạn quay lại mỗi lần chạy để biết chuyện gì đã xảy ra.

## package.json và script

`package.json` khai báo dependency và có thể chứa **script** tắt cho các lệnh hay dùng:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "report": "playwright show-report"
  }
}
```

Sau đó chạy gọn bằng `npm run test:headed`. Đây là thói quen giúp cả team dùng lệnh nhất quán.

[Bài 17](../doc-loi-va-tu-duy-debug/) trang bị kỹ năng thiết yếu tiếp theo: đọc thông báo lỗi và tư duy debug khi test không chạy như mong đợi.

## 🛠 Thực hành

1. **Khám phá config:** mở `playwright.config.js` của dự án ở Bài 15, xác định giá trị hiện tại của `testDir`, `reporter`, và danh sách `projects`.
2. **Dùng baseURL:** thêm `baseURL` vào config, rồi sửa một test dùng đường dẫn tương đối trong `page.goto`.
3. **Chạy chọn lọc:** chạy test chỉ trên `--project=chromium`, rồi thêm script `test:chromium` vào `package.json` và chạy bằng `npm run`.

## Website tham khảo

- [Playwright — Configuration](https://playwright.dev/docs/test-configuration) — tham chiếu đầy đủ file config.
- [Playwright — Projects](https://playwright.dev/docs/test-projects) — cấu hình nhiều trình duyệt/môi trường.
- [Playwright — HTML Reporter](https://playwright.dev/docs/test-reporters#html-reporter) — chi tiết báo cáo HTML.

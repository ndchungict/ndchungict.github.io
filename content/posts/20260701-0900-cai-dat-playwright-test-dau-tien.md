+++
date        = '2026-07-01T09:00:00+07:00'
draft       = false
title       = 'Bài 15 — Cài đặt Playwright và viết test đầu tiên'
slug        = 'cai-dat-playwright-test-dau-tien'
summary     = 'Khởi tạo Playwright bằng npm init playwright, hiểu các file được sinh ra, viết và chạy test tự động đầu tiên, rồi xem báo cáo HTML. Bước đầu tiên vào automation thực sự.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-15-cai-dat-playwright-viet-va-chay-test-dau-tien.webp'
featured    = false
weight      = 16
categories  = ['automation']
tags        = ['automation-test', 'playwright']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Toàn bộ nền tảng ở Giai đoạn 0–2 quy tụ về đây: cài **Playwright** và chạy test tự động đầu tiên. Từ bài này, mỗi khái niệm JavaScript và web bạn đã học sẽ được dùng thật.

Yêu cầu: đã cài Node.js và VS Code ([Bài 2](../cai-dat-moi-truong-vs-code-nodejs/)).

## Khởi tạo Playwright

Tạo một thư mục dự án mới và khởi tạo Playwright bằng lệnh chính thức:

```bash
mkdir playwright-demo
cd playwright-demo
npm init playwright@latest
```

`npm init playwright@latest` tải và chạy trình khởi tạo. Nó hỏi vài lựa chọn — với người mới, dùng mặc định:

- **Ngôn ngữ:** chọn **TypeScript** hoặc **JavaScript**. Series dùng JavaScript cho nhất quán; chọn **JavaScript**.
- **Thư mục test:** để mặc định `tests`.
- **Thêm GitHub Actions workflow:** chọn có cũng được (dùng ở Bài 30), hoặc để sau.
- **Cài trình duyệt:** đồng ý — Playwright tải sẵn Chromium, Firefox, WebKit.

Lệnh này làm khá nhiều việc: cài package Playwright, tải các trình duyệt, và sinh cấu trúc dự án mẫu.

## Các file được sinh ra

Sau khi xong, thư mục có cấu trúc chính:

```text
playwright-demo/
├── tests/
│   └── example.spec.js      # file test mẫu
├── tests-examples/
│   └── demo-todo-app.spec.js # test mẫu phức tạp hơn
├── playwright.config.js      # file cấu hình (Bài 16)
├── package.json              # thông tin dự án và dependency
└── node_modules/             # thư viện đã cài (không commit — Bài 3)
```

- File test đặt trong `tests/`, tên theo quy ước `*.spec.js` (spec = specification).
- `playwright.config.js` là nơi cấu hình toàn bộ hành vi — sẽ tìm hiểu ở [Bài 16](../cau-truc-project-playwright/).
- `node_modules/` đã được `.gitignore` sẵn — nhớ kiến thức Git ở [Bài 3](../git-github-co-ban/).

## Đọc file test mẫu

Mở `tests/example.spec.js`. Bỏ qua chi tiết, để ý cấu trúc:

```javascript
const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Kiểm tra tiêu đề trang chứa chữ "Playwright"
  await expect(page).toHaveTitle(/Playwright/);
});
```

Ráp lại với kiến thức đã học:

- `require('@playwright/test')` — nạp công cụ test của Playwright, lấy ra `test` và `expect` bằng **destructuring** ([Bài 9](../object-trong-javascript/)).
- `test('has title', async ({ page }) => { ... })` — khai báo một test. Tham số đầu là **tên test**, tham số sau là một **arrow function** ([Bài 7](../ham-va-arrow-function/)) `async` ([Bài 10](../bat-dong-bo-promise-async-await/)).
- `({ page })` — destructuring lấy ra `page`, đối tượng đại diện cho một tab trình duyệt.
- `await page.goto(...)` — điều hướng tới URL; `await` vì đây là thao tác bất đồng bộ.
- `await expect(page).toHaveTitle(...)` — assertion kiểm tra tiêu đề.

Mọi thứ mập mờ trước đây giờ có chỗ dùng thật.

## Chạy test

Trong terminal, chạy toàn bộ test:

```bash
npx playwright test
```

Mặc định Playwright chạy **headless** (không mở cửa sổ trình duyệt) trên nhiều trình duyệt cùng lúc. Kết quả in ra terminal cho biết số test pass/fail.

Muốn **thấy trình duyệt chạy** (headed), thêm cờ `--headed`:

```bash
npx playwright test --headed
```

Chạy chỉ một file cụ thể:

```bash
npx playwright test tests/example.spec.js
```

> **Mẹo cho người mới — extension Playwright cho VS Code.** Cài extension chính thức *Playwright Test for VSCode* (Microsoft) trong tab Extensions. Nó cho phép **chạy và debug test bằng cú click** ngay cạnh dòng code (nút ▶ xanh), đặt breakpoint, chọn trình duyệt, và ghi test mới — không cần gõ lệnh terminal. Đây là cách làm việc thuận tiện nhất khi mới học; các lệnh `npx` ở trên vẫn cần biết vì CI dùng chúng.

## Xem báo cáo HTML

Playwright tự tạo một **báo cáo HTML** trực quan sau khi chạy. Mở nó bằng:

```bash
npx playwright show-report
```

Báo cáo hiện ra trong trình duyệt, liệt kê từng test, thời gian chạy, và chi tiết từng bước. Khi test **fail**, báo cáo còn kèm ảnh chụp, thông báo lỗi, và dấu vết (trace) — công cụ điều tra mạnh mà ta sẽ khai thác kỹ ở Bài 28.

## Viết test đầu tiên của bạn

Tạo file mới `tests/dau-tien.spec.js`:

```javascript
const { test, expect } = require('@playwright/test');

test('trang chủ Playwright hiển thị nút Get started', async ({ page }) => {
  // Arrange — mở trang (nhớ cấu trúc AAA ở Bài 14)
  await page.goto('https://playwright.dev/');

  // Assert — kiểm tra link "Get started" hiển thị
  await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
});
```

Chạy:

```bash
npx playwright test tests/dau-tien.spec.js --headed
```

Nếu test pass, bạn vừa viết và chạy test automation đầu tiên của mình. `getByRole` là một locator — chủ đề chính của [Bài 18](../locator-trong-playwright/).

## Lỗi thường gặp

- **`command not found: npx`** → Node.js chưa cài đúng; xem lại Bài 2.
- **Test fail vì mạng/URL** → kiểm tra kết nối và URL trong `page.goto`.
- **Trình duyệt chưa cài** → chạy `npx playwright install` để tải lại các trình duyệt.

[Bài 16](../cau-truc-project-playwright/) mổ xẻ cấu trúc dự án và file `playwright.config.js` để bạn hiểu mình đang làm việc trong môi trường nào.

## 🛠 Thực hành

1. **Khởi tạo dự án:** chạy `npm init playwright@latest` trong một thư mục mới, chọn JavaScript, và chạy thành công test mẫu bằng `npx playwright test`.
2. **Chạy headed và xem báo cáo:** chạy lại với `--headed` để thấy trình duyệt, sau đó mở báo cáo bằng `npx playwright show-report`.
3. **Sửa test đầu tiên:** đổi test `dau-tien.spec.js` sang mở một trang khác (vd trang chủ một website bạn biết) và kiểm tra một phần tử hiển thị trên đó.

## Website tham khảo

- [Playwright — Installation](https://playwright.dev/docs/intro) — hướng dẫn cài đặt chính thức.
- [Playwright — Writing tests](https://playwright.dev/docs/writing-tests) — viết test cơ bản.
- [Playwright — Running and debugging tests](https://playwright.dev/docs/running-tests) — các cách chạy test.
- [Playwright — VS Code extension](https://playwright.dev/docs/getting-started-vscode) — chạy/debug/record test ngay trong VS Code.

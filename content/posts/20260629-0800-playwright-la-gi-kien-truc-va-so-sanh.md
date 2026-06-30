+++
date        = '2026-06-29T08:00:00+07:00'
draft       = false
title       = 'Playwright là gì? Kiến trúc và so sánh với Selenium, Cypress'
slug        = 'playwright-la-gi-kien-truc-va-so-sanh'
summary     = 'Tổng quan về Playwright: kiến trúc dựa trên CDP/WebSocket, mô hình auto-waiting, hỗ trợ đa trình duyệt, và so sánh thẳng thắn với Selenium và Cypress để bạn chọn đúng công cụ.'
thumbnail   = '/images/playwright-series/playwright-bai-01-playwright-la-gi-kien-truc-so-sanh.webp'
featured    = false
weight      = 1
categories  = ['it']
tags        = ['playwright', 'automation', 'test', 'e2e', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Nếu bạn đã từng viết test với Selenium và phát mệt vì `Thread.sleep`, `StaleElementReferenceException` và đủ loại flaky test, thì Playwright sinh ra để giải quyết đúng những nỗi đau đó. Bài mở đầu series này không dạy lại "automation test là gì" — mà đi thẳng vào **kiến trúc** của Playwright, lý do nó nhanh và ổn định, rồi so sánh sòng phẳng với Selenium và Cypress.

## Playwright là gì?

**Playwright** là framework automation test cho web do **Microsoft** phát triển và mã nguồn mở (2020). Nó cho phép điều khiển **Chromium, Firefox và WebKit** bằng một API duy nhất, hỗ trợ nhiều ngôn ngữ: **TypeScript/JavaScript, Python, Java, .NET**.

Điểm khác biệt cốt lõi so với thế hệ cũ:

- **Auto-waiting** tích hợp sẵn — không cần `sleep` hay explicit wait thủ công.
- **Web-first assertions** — assertion tự retry cho tới khi điều kiện đúng hoặc timeout.
- **Trace Viewer** — ghi lại toàn bộ quá trình chạy test, xem lại như "time-travel".
- Một engine, **3 trình duyệt thật** (không phải bản giả lập).

## Kiến trúc: vì sao Playwright nhanh và ổn định?

Đây là phần quan trọng nhất để hiểu Playwright. Selenium giao tiếp với trình duyệt qua **WebDriver protocol** (HTTP, request–response). Playwright dùng một kết nối **WebSocket hai chiều** tới trình duyệt, dựa trên các giao thức devtools (CDP với Chromium, protocol tương ứng cho Firefox/WebKit).

```
   SELENIUM (WebDriver)                 PLAYWRIGHT

  Test ──HTTP──▶ Driver               Test
       ◀─────── (mỗi lệnh một          │  một kết nối WebSocket
                 vòng request)         │  hai chiều, giữ liên tục
                  │                     ▼
              Browser              Browser (CDP / protocol)
```

Hệ quả thực tế:

| | Selenium | Playwright |
|---|---|---|
| Giao thức | HTTP request–response | WebSocket hai chiều, persistent |
| Mỗi lệnh | Một vòng HTTP riêng | Gửi qua kết nối có sẵn |
| Theo dõi sự kiện | Khó (phải polling) | Nghe event trực tiếp từ browser |
| Tốc độ | Chậm hơn | Nhanh hơn rõ rệt |

Vì giữ kết nối liên tục và **nghe được event** từ trình duyệt (DOM thay đổi, network request, console log...), Playwright biết chính xác khi nào trang "ổn định" để thao tác — đây là nền tảng của auto-waiting.

## Browser, Context và Page

Ba khái niệm bạn sẽ gặp suốt series:

```
Browser  (một process trình duyệt — Chromium/Firefox/WebKit)
  └── BrowserContext  (một phiên ẩn danh, cookie/storage riêng biệt)
        └── Page  (một tab)
              └── Frame  (iframe bên trong tab)
```

- **Browser**: tốn tài nguyên để khởi động, thường dùng chung.
- **BrowserContext**: như một cửa sổ ẩn danh — cookie, localStorage, cache hoàn toàn cô lập. Tạo context mới **rất nhẹ** (mili-giây), nên mỗi test nên có context riêng để **cách ly** hoàn toàn.
- **Page**: một tab để thao tác.

Chính nhờ BrowserContext nhẹ mà Playwright chạy test song song cực tốt: mỗi worker mở context riêng, không đụng state của nhau.

## Auto-waiting — "viên ngọc" của Playwright

Trước mỗi hành động (`click`, `fill`...), Playwright tự kiểm tra một loạt điều kiện **actionability** trên phần tử:

- Phần tử đã xuất hiện trong DOM (attached)
- Đang **visible**
- **Ổn định** (không còn animation di chuyển)
- Nhận được sự kiện (không bị phần tử khác che)
- **Enabled** (không bị disabled)

Nếu chưa thỏa, nó **chờ** (tới khi timeout) rồi mới thao tác. Đây là lý do bạn gần như không bao giờ phải viết:

```js
// ❌ Cách cũ kiểu Selenium
driver.sleep(2000);
element.click();

// ✅ Playwright — tự chờ phần tử sẵn sàng
await page.getByRole('button', { name: 'Đăng nhập' }).click();
```

## So sánh Playwright vs Selenium vs Cypress

| Tiêu chí | Playwright | Selenium | Cypress |
|---|---|---|---|
| Trình duyệt | Chromium, Firefox, WebKit | Tất cả (cả IE legacy) | Chromium, Firefox (giới hạn) |
| Ngôn ngữ | TS/JS, Python, Java, .NET | Rất nhiều | Chỉ JS/TS |
| Kiến trúc | WebSocket / CDP | WebDriver HTTP | Chạy **trong** browser |
| Auto-wait | ✅ Mạnh, tích hợp | ❌ Tự lo | ✅ Có |
| Đa tab / đa origin | ✅ Tốt | ✅ | ❌ Hạn chế |
| Chạy song song | ✅ Native, theo file | Cần Grid/tự dựng | Cần trả phí (Dashboard) |
| Network mocking | ✅ Mạnh, native | ❌ Yếu | ✅ Có |
| Trace/Debug | ✅ Trace Viewer xịn | Cơ bản | ✅ Time-travel UI |
| Độ trưởng thành | Mới nhưng phát triển nhanh | Lâu đời, hệ sinh thái lớn | Trưởng thành |

Tóm gọn khi nào chọn cái nào:

- **Selenium**: cần phủ trình duyệt cũ/đặc thù, hệ thống legacy đã có Grid, hoặc team đa ngôn ngữ rất đa dạng.
- **Cypress**: app SPA, team thuần frontend JS, thích DX (developer experience) và UI runner đẹp; chấp nhận giới hạn về đa tab/đa origin.
- **Playwright**: cần tốc độ, ổn định, đa trình duyệt thật, chạy song song mạnh, network mocking, và CI/CD nghiêm túc. **Đây là lựa chọn mặc định tốt cho hầu hết dự án mới năm 2026.**

## Khi nào Playwright *không* phải lựa chọn tối ưu?

Công bằng mà nói:

- Cần test trên **Internet Explorer** hoặc trình duyệt thật trên thiết bị di động vật lý → Playwright chỉ *emulate* mobile, không thay được Appium cho native app.
- Team đã có hạ tầng Selenium Grid khổng lồ và ổn định, chi phí chuyển đổi lớn.
- Cần test ứng dụng desktop native (không phải web).

## Tóm tắt

- **Playwright** điều khiển Chromium/Firefox/WebKit qua **WebSocket/CDP** thay vì WebDriver HTTP → nhanh và "nghe" được event browser.
- Mô hình **Browser → Context → Page**: context cực nhẹ, là chìa khóa cho cách ly và chạy song song.
- **Auto-waiting** + **web-first assertions** loại bỏ phần lớn nguyên nhân flaky test.
- So với Selenium/Cypress, Playwright cân bằng tốt nhất giữa tốc độ, độ ổn định và độ phủ trình duyệt — lựa chọn mặc định hợp lý cho dự án mới.

---

**Bài tiếp theo**: [Cài đặt, cấu hình và cấu trúc dự án Playwright →](/posts/cai-dat-cau-hinh-du-an-playwright/)

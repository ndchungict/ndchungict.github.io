+++
date        = '2026-07-01T08:40:00+07:00'
draft       = false
title       = 'Bài 12 — Làm quen DevTools: inspect phần tử và đọc cấu trúc trang'
slug        = 'lam-quen-devtools'
summary     = 'Dùng Chrome DevTools để inspect phần tử, đọc HTML/DOM trực tiếp trên trang, thử CSS selector trong Console, và quan sát network request. Công cụ điều tra không thể thiếu của tester.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 13
categories  = ['automation']
tags        = ['automation-test', 'devtools', 'chrome']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

[Bài 11](../html-va-css-selector-co-ban/) dạy đọc HTML trên giấy. Bài này dạy đọc HTML của **trang web thật** bằng **DevTools** — bộ công cụ dành cho nhà phát triển tích hợp sẵn trong mọi trình duyệt. Đây là công cụ bạn mở ra hàng ngày khi viết automation, để tìm phần tử và điều tra khi test thất bại.

Bài này minh họa trên **Chrome DevTools**; Edge và Firefox có công cụ tương đương.

## Mở DevTools

Ba cách trên Chrome:

- Phím tắt `F12`, hoặc `Ctrl + Shift + I` (Windows/Linux), `Cmd + Option + I` (macOS).
- Chuột phải vào bất kỳ chỗ nào trên trang → **Inspect**.
- Menu trình duyệt → More Tools → Developer Tools.

DevTools mở ra một khung nhiều tab. Bốn tab quan trọng nhất với tester: **Elements**, **Console**, **Network**, và công cụ **inspect**.

## Inspect một phần tử

Đây là thao tác dùng nhiều nhất. Mục tiêu: tìm HTML tương ứng với một thứ bạn nhìn thấy trên trang.

1. Nhấn biểu tượng mũi tên ở góc trái DevTools (hoặc `Ctrl + Shift + C`).
2. Di chuột lên phần tử trên trang (một nút, một ô nhập) — nó được tô sáng.
3. Nhấp vào phần tử đó.

Tab **Elements** lập tức nhảy tới và bôi đậm đúng đoạn HTML của phần tử. Từ đây bạn đọc được thẻ, `id`, `class`, các thuộc tính — chính là thông tin cần để định vị nó trong test.

> Đây là bước đầu tiên mỗi khi viết một dòng test mới: inspect phần tử cần thao tác để biết định vị nó bằng gì. Tập phản xạ này ngay từ bây giờ.

## Tab Elements: đọc và duyệt DOM

Tab **Elements** hiển thị toàn bộ cây DOM (Bài 11). Bạn có thể:

- Bung/thu các nút bằng mũi tên tam giác để xem cấu trúc lồng nhau.
- Chuột phải một phần tử → **Copy** → **Copy selector** để lấy nhanh một CSS selector (lưu ý: selector tự sinh này thường dài và dễ vỡ — dùng để tham khảo, không nên bê thẳng vào test).
- Sửa trực tiếp HTML/CSS để thử nghiệm (thay đổi chỉ là tạm thời, tải lại trang là mất).

## Tab Console: thử selector ngay lập tức

Tab **Console** cho phép chạy JavaScript trực tiếp trên trang hiện tại. Với tester, nó cực hữu ích để **kiểm tra một selector có trúng phần tử không** trước khi đưa vào code.

Dùng hàm `document.querySelector` (chọn phần tử đầu tiên khớp) và `document.querySelectorAll` (chọn tất cả):

```javascript
// Gõ vào Console, nhấn Enter
document.querySelector('#email')          // trả về phần tử có id="email", hoặc null
document.querySelectorAll('.btn-primary') // trả về danh sách mọi phần tử class btn-primary
```

- Nếu trả về đúng phần tử → selector của bạn đúng.
- Nếu trả về `null` → selector sai hoặc phần tử chưa tồn tại.

Đây là cách nhanh nhất để kiểm chứng một CSS selector mà không cần chạy cả test. `querySelector` cũng nhận đúng cú pháp CSS selector đã học ở Bài 11.

**Hai lối tắt tiện dùng hằng ngày trong Console:**

```javascript
$('#email')        // lối tắt của document.querySelector('#email')
$$('.btn-primary') // lối tắt của document.querySelectorAll('.btn-primary')
$0                 // tham chiếu tới phần tử ĐANG chọn ở tab Elements
```

- `$` và `$$` gõ nhanh hơn nhiều so với `document.querySelector(...)`. (Lưu ý: đây là tiện ích *của DevTools Console*, không dùng được trong code test.)
- `$0` cực hữu ích: sau khi inspect và chọn một phần tử ở tab Elements, gõ `$0` trong Console để thao tác ngay với chính phần tử đó (vd `$0.textContent` để đọc text, `$0.getAttribute('data-testid')`).

## Tab Network: quan sát request

Tab **Network** ghi lại mọi yêu cầu mạng (request) mà trang gửi đi: tải trang, gọi API, lấy hình ảnh. Với tester, nó giúp:

- Xem trang gọi những API nào, trả về status gì (200 OK, 404, 500...).
- Kiểm tra dữ liệu API trả về khi điều tra một bug.

Mở tab Network rồi tải lại trang, bạn sẽ thấy danh sách request cuộn ra. Nhấp một request để xem chi tiết (URL, status, dữ liệu). Kiến thức này làm nền cho API testing (Bài 29) và network mocking (Bài 27).

## Ứng dụng thực tế khi viết test

Quy trình chuẩn khi viết một test mới:

1. Mở trang cần test, bật DevTools.
2. Inspect phần tử cần thao tác → đọc thẻ, id, class, text.
3. Sang Console, thử `document.querySelector(...)` để xác nhận định vị đúng.
4. Đưa cách định vị đó vào code Playwright.

Khi test thất bại với lỗi "không tìm thấy phần tử", cũng chính DevTools giúp bạn kiểm tra lại: phần tử có tồn tại không, id/class có bị đổi không.

[Bài 13](../testing-la-gi/) chuyển sang nền tảng tư duy kiểm thử: testing là gì, các loại test, và khi nào nên tự động hóa.

## 🛠 Thực hành

1. **Inspect thực tế:** mở [playwright.dev](https://playwright.dev), dùng inspect để tìm HTML của nút "Get started". Ghi lại thẻ và các thuộc tính của nó.
2. **Thử selector trong Console:** trên cùng trang, mở Console và chạy `$('a')` rồi `$$('a').length` (lối tắt) để đếm số link trên trang.
3. **Dùng $0:** inspect và chọn nút "Get started" ở tab Elements, rồi trong Console gõ `$0.textContent` để đọc text của chính nó.
4. **Quan sát Network:** mở tab Network, tải lại một trang bất kỳ, tìm request tải trang chính và ghi lại status code của nó.

## Website tham khảo

- [Chrome DevTools — Tài liệu chính thức](https://developer.chrome.com/docs/devtools) — hướng dẫn đầy đủ.
- [Chrome DevTools — Open DevTools](https://developer.chrome.com/docs/devtools/open) — các cách mở và tổng quan giao diện.
- [MDN — document.querySelector()](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) — hàm thử selector trong Console.

+++
date        = '2024-07-01T08:35:00+07:00'
draft       = false
title       = 'Bài 11 — HTML và CSS selector cơ bản cho automation test'
slug        = 'html-va-css-selector-co-ban'
summary     = 'Đọc hiểu cấu trúc HTML (thẻ, thuộc tính, id, class) và viết CSS selector để định vị phần tử. Kiến thức nền để hiểu locator của Playwright ở Bài 18.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-11-html-va-css-selector-co-ban.webp'
featured    = false
weight      = 12
categories  = ['it']
subcategories = ['qa-testing']
tags        = ['automation-test', 'html', 'css-selector']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Giai đoạn 2 chuyển từ JavaScript sang **kiến thức web**. Để tự động hóa một trang web, bạn phải hiểu trang đó được cấu tạo thế nào và cách "chỉ" cho công cụ biết phần tử nào cần thao tác. Bài này dạy đọc hiểu **HTML** và viết **CSS selector**.

> Phạm vi bài này: đủ để **đọc hiểu cấu trúc trang và định vị phần tử**. Playwright có hệ thống locator riêng, hiện đại hơn (getByRole, getByText...), sẽ học ở [Bài 18](../locator-trong-playwright/). CSS selector ở đây là kiến thức nền, không phải cách định vị được ưu tiên trong Playwright — nhưng vẫn cần biết vì đôi khi phải dùng tới.

## HTML là gì

**HTML (HyperText Markup Language)** là ngôn ngữ mô tả cấu trúc một trang web. Trình duyệt đọc HTML và dựng thành trang bạn nhìn thấy. HTML gồm các **thẻ (tag)** lồng nhau.

```html
<button class="btn-primary" id="login-btn">Đăng nhập</button>
```

Phân tích một phần tử (element):

- `<button>` — **thẻ mở**, xác định loại phần tử (ở đây là nút bấm).
- `</button>` — **thẻ đóng** (có dấu `/`).
- `Đăng nhập` — **nội dung text** giữa thẻ mở và đóng.
- `class="btn-primary"` và `id="login-btn"` — các **thuộc tính (attribute)**, dạng `tên="giá-trị"`.

## Các thẻ HTML hay gặp khi test

| Thẻ | Ý nghĩa |
|-----|---------|
| `<div>` | Khối chứa tổng quát, dùng để nhóm nội dung |
| `<button>` | Nút bấm |
| `<input>` | Ô nhập liệu (text, password, checkbox...) |
| `<a>` | Liên kết (link) |
| `<form>` | Biểu mẫu chứa các ô nhập |
| `<span>` | Đoạn văn bản ngắn nội dòng |
| `<h1>`–`<h6>` | Tiêu đề, từ lớn đến nhỏ |
| `<label>` | Nhãn mô tả cho một ô nhập |

## id và class: hai thuộc tính quan trọng nhất

Khi định vị phần tử, hai thuộc tính này được dùng nhiều nhất:

- **`id`** — định danh **duy nhất** trên toàn trang. Về nguyên tắc, mỗi `id` chỉ xuất hiện một lần.
- **`class`** — nhãn phân loại, **có thể trùng** ở nhiều phần tử, và một phần tử có thể mang nhiều class.

```html
<input id="email" class="form-input required" type="email" />
```

Phần tử này có `id="email"` (duy nhất) và hai class: `form-input` và `required`.

## Thuộc tính data-* dành riêng cho test

Ngoài `id` và `class`, có một loại thuộc tính đặc biệt: `data-*` (ví dụ `data-testid`, `data-test`). Đây là thuộc tính **tùy biến** do lập trình viên thêm vào, và nhiều đội **cố ý gắn `data-testid` để phục vụ test**:

```html
<button data-testid="submit-order">Đặt hàng</button>
```

Vì sao quan trọng: `class` và `id` phục vụ giao diện/CSS nên hay đổi khi refactor, làm test vỡ. Còn `data-testid` tồn tại *riêng cho test*, nên **rất ổn định**. Playwright có locator chuyên cho nó là `getByTestId` (Bài 18). Khi thấy `data-testid` trên trang, đó thường là "điểm bám" định vị tốt nhất.

## CSS selector — cú pháp định vị phần tử

**CSS selector** là cú pháp để "chỉ" tới một hoặc nhiều phần tử dựa trên thẻ, id, class, hoặc thuộc tính. Các dạng cơ bản:

| Selector | Chọn phần tử | Ví dụ |
|----------|--------------|-------|
| `tên-thẻ` | Theo tên thẻ | `button` — mọi `<button>` |
| `#id` | Theo id (dấu `#`) | `#login-btn` |
| `.class` | Theo class (dấu `.`) | `.btn-primary` |
| `[thuộc-tính=giá-trị]` | Theo thuộc tính | `[type="email"]`, `[data-testid="submit"]` |
| `A B` | `B` nằm bên trong `A` (con/cháu bất kỳ cấp) | `form input` |
| `A > B` | `B` là con **trực tiếp** của `A` | `ul > li` |

```css
#email                 /* phần tử có id="email" */
.btn-primary           /* mọi phần tử có class "btn-primary" */
button.btn-primary     /* thẻ button có class "btn-primary" */
form input[type="password"]  /* input password nằm trong form */
[data-testid="submit-order"]  /* phần tử có data-testid cụ thể */
```

Phân biệt `A B` và `A > B`: `A B` chọn `B` nằm **ở bất kỳ cấp nào** bên trong `A`; còn `A > B` chỉ chọn `B` là **con trực tiếp** (ngay dưới một cấp).

Kết hợp các dạng trên cho phép định vị chính xác. Ví dụ `form.login .required` chọn phần tử có class `required` nằm trong form có class `login`.

## Cây DOM: HTML là cấu trúc lồng nhau

Trình duyệt biến HTML thành một cấu trúc cây gọi là **DOM (Document Object Model)**. Mỗi phần tử là một "nút" (node), có nút cha, nút con:

```html
<form class="login">
  <label>Email</label>
  <input id="email" type="email" />
  <button>Gửi</button>
</form>
```

Ở đây `<form>` là cha, chứa ba con: `<label>`, `<input>`, `<button>`. Hiểu quan hệ cha–con này giúp bạn viết selector đi từ ngoài vào trong, và hiểu cách Playwright điều hướng trong trang.

## Vì sao tester cần nắm phần này

Bạn không cần *viết* HTML/CSS như một lập trình viên front-end. Nhưng bạn cần **đọc** được chúng, vì:

- Để định vị phần tử cần thao tác, bạn phải biết nó là thẻ gì, có id/class nào.
- Khi test thất bại vì "không tìm thấy phần tử", bạn phải đọc HTML để hiểu vì sao.
- Selector do lập trình viên đặt id/class không ổn định — hiểu HTML giúp bạn chọn cách định vị bền vững (chủ đề của Bài 18).

[Bài 12](../lam-quen-devtools/) dạy dùng **DevTools** để trực tiếp xem HTML của bất kỳ trang nào và thử selector ngay trên trình duyệt.

## 🛠 Thực hành

1. **Đọc HTML:** cho đoạn `<input id="username" class="field big" type="text" data-testid="user-input" placeholder="Tên đăng nhập" />`, xác định: tên thẻ, id, các class, `data-testid`, và các thuộc tính khác.
2. **Viết selector:** với phần tử trên, viết 4 CSS selector khác nhau chọn được nó (theo id, theo class, theo thuộc tính `type`, và theo `data-testid`).
3. **Selector lồng nhau:** cho HTML có `<div class="card"><button class="buy">Mua</button></div>`, viết selector chọn đúng nút "Mua" nằm trong card. Thử cả `A B` và `A > B`, giải thích khác biệt.

## Website tham khảo

- [MDN — HTML basics (tiếng Việt)](https://developer.mozilla.org/vi/docs/Learn/Getting_started_with_the_web/HTML_basics) — nhập môn HTML.
- [MDN — CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors) — tham chiếu selector.
- [W3Schools — CSS Selector Reference](https://www.w3schools.com/cssref/css_selectors.php) — bảng tra selector kèm ví dụ.

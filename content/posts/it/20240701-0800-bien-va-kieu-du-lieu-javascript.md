+++
date        = '2024-07-01T08:00:00+07:00'
draft       = false
title       = 'Bài 4 — Biến và kiểu dữ liệu trong JavaScript'
slug        = 'bien-va-kieu-du-lieu-javascript'
summary     = 'Khai báo biến với let và const, phân biệt các kiểu dữ liệu cơ bản (string, number, boolean, null, undefined) và cách kiểm tra kiểu bằng typeof. Nền tảng cho mọi dòng code phía sau.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-4-bien-va-kieu-du-lieu-trong-javascript.webp'
featured    = false
weight      = 5
categories  = ['automation']
tags        = ['automation-test', 'javascript']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Giai đoạn 1 bắt đầu từ đây: học JavaScript ở mức đủ dùng cho automation test. Bài này là **biến (variable)** và **kiểu dữ liệu (data type)** — hai khái niệm nền tảng nhất, có mặt trong mọi dòng code bạn viết về sau.

Toàn bộ code trong bài chạy bằng `node ten-file.js` như đã học ở [Bài 2](../cai-dat-moi-truong-vs-code-nodejs/).

## Biến là gì

**Biến** là một tên gọi trỏ tới một giá trị được lưu trong bộ nhớ. Thay vì lặp lại giá trị cụ thể khắp nơi, bạn đặt tên cho nó một lần rồi dùng lại qua tên đó.

```javascript
let tenNguoiDung = 'nguyenvanA';
console.log(tenNguoiDung);   // in ra: nguyenvanA
```

- `let` là **từ khóa khai báo** biến.
- `tenNguoiDung` là **tên biến** (do bạn đặt).
- `=` là **toán tử gán** — đưa giá trị bên phải vào biến bên trái.
- `'nguyenvanA'` là **giá trị** được gán.

## let và const: khi nào dùng cái nào

JavaScript có hai cách khai báo biến nên dùng: `let` và `const`.

```javascript
let diem = 5;      // biến có thể gán lại giá trị mới
diem = 8;          // hợp lệ

const PI = 3.14;   // hằng số — không thể gán lại
// PI = 3.15;      // lỗi: Assignment to constant variable
```

- `let` — dùng khi giá trị **sẽ thay đổi** trong quá trình chạy.
- `const` — dùng khi giá trị **không đổi** sau khi gán (constant = hằng).

> **Best practice (áp dụng suốt series):** mặc định dùng `const`. Chỉ đổi sang `let` khi bạn thực sự cần gán lại biến. Quy tắc này giúp code an toàn hơn — người đọc biết ngay giá trị nào cố định, và tránh vô tình ghi đè. Tránh dùng `var` (cách khai báo cũ, có nhiều hành vi gây lỗi khó lường).

## Quy tắc đặt tên biến

- Bắt đầu bằng chữ cái, `_` hoặc `$`; không bắt đầu bằng số.
- Phân biệt hoa thường: `diem` và `Diem` là hai biến khác nhau.
- Quy ước JavaScript dùng **camelCase**: chữ đầu thường, các từ sau viết hoa chữ cái đầu — `tenNguoiDung`, `soLanThuLai`.
- Đặt tên **có nghĩa**. `const x = 30` không nói lên điều gì; `const timeoutGiay = 30` thì rõ. Tên tốt là tài liệu sống của code.

## Các kiểu dữ liệu cơ bản

Mỗi giá trị trong JavaScript thuộc một **kiểu dữ liệu**. Năm kiểu nguyên thủy (primitive) bạn gặp thường xuyên nhất:

```javascript
const ten = 'Playwright';   // string  — chuỗi ký tự, đặt trong nháy
const soBai = 35;           // number  — số (nguyên hoặc thập phân)
const daHoanThanh = false;  // boolean — chỉ nhận true hoặc false
let ketQua = null;          // null    — "cố ý không có giá trị"
let chuaGan;                // undefined — đã khai báo nhưng chưa gán
```

| Kiểu | Mô tả | Ví dụ |
|------|-------|-------|
| **string** | Chuỗi ký tự, đặt trong `'...'`, `"..."` hoặc `` `...` `` | `'email@test.com'` |
| **number** | Số nguyên hoặc thập phân | `42`, `3.14`, `-7` |
| **boolean** | Giá trị đúng/sai | `true`, `false` |
| **null** | Chủ động biểu thị "không có giá trị" | `null` |
| **undefined** | Biến chưa được gán giá trị | `undefined` |

`boolean` đặc biệt quan trọng với testing: mọi phép kiểm tra (assertion) cuối cùng đều quy về "đúng hay sai" — tức một giá trị `boolean`.

**Phân biệt `null` và `undefined`** — hai cái hay bị nhầm:

- `undefined` — *máy* để trạng thái này khi bạn khai báo biến mà chưa gán gì.
- `null` — *bạn* chủ động gán để nói "biến này cố ý đang rỗng".

Nói ngắn: `undefined` là "chưa có ai đụng tới", `null` là "tôi cố tình để trống".

## String template — nối chuỗi hiện đại

Khi cần ghép biến vào chuỗi, dùng **template literal** — chuỗi đặt trong dấu backtick `` ` ``, chèn biến bằng cú pháp `${...}`:

```javascript
const ten = 'An';
const tuoi = 25;

// Cách cũ, dễ sai dấu cách:
console.log('Xin chao ' + ten + ', ban ' + tuoi + ' tuoi');

// Template literal — rõ ràng, dễ đọc hơn:
console.log(`Xin chao ${ten}, ban ${tuoi} tuoi`);
```

Template literal là cách ghép chuỗi được ưu tiên trong code hiện đại, và bạn sẽ dùng nó liên tục khi viết message cho test.

## Kiểm tra kiểu bằng typeof

Toán tử `typeof` trả về kiểu của một giá trị dưới dạng chuỗi. Công dụng chính là **kiểm tra một biến khi debug** — biết nó thực sự đang chứa kiểu gì, thay vì đoán:

```javascript
const email = 'a@test.com';
const tuoi = 25;
let chuaGan;

console.log(typeof email);   // 'string'
console.log(typeof tuoi);    // 'number'
console.log(typeof chuaGan); // 'undefined'
```

`typeof` cũng dùng trực tiếp trên giá trị: `typeof 35` → `'number'`, `typeof true` → `'boolean'`.

> ⚠️ **Bẫy kinh điển:** `typeof null` trả về `'object'`, **không phải** `'null'`. Đây là một lỗi thiết kế đã tồn tại từ đầu của JavaScript và không bao giờ được sửa (để tránh phá code cũ). Bạn không cần hiểu vì sao — chỉ cần nhớ: đừng dựa vào `typeof` để kiểm tra `null`. Muốn kiểm tra một biến có phải `null` không, so sánh trực tiếp `bien === null` (dùng `===` sẽ học ở [Bài 5](../cau-lenh-dieu-kien-if-else/)).

## Lỗi thường gặp

- **Gán lại `const`** → `TypeError: Assignment to constant variable`. Đổi khai báo sang `let` nếu thật sự cần thay đổi giá trị.
- **Dùng biến trước khi khai báo** → `ReferenceError: <ten> is not defined`. Kiểm tra chính tả tên biến (phân biệt hoa thường) và thứ tự dòng.
- **Nhầm số với chuỗi số:** `'5'` (string) khác `5` (number). `'5' + 1` cho ra `'51'` (nối chuỗi), còn `5 + 1` cho ra `6`. Đây là nguồn bug rất phổ biến — sẽ nói kỹ ở Bài 5.

Ở [Bài 5](../cau-lenh-dieu-kien-if-else/) ta dùng các giá trị `boolean` để cho chương trình **ra quyết định** với câu lệnh điều kiện `if/else`.

## 🛠 Thực hành

1. **Khai báo hồ sơ:** tạo file `bien.js`, khai báo các biến `hoTen` (string), `tuoi` (number), `dangHoc` (boolean) với giá trị của bạn. Dùng template literal in ra một câu giới thiệu hoàn chỉnh.
2. **Kiểm tra kiểu:** dùng `typeof` in ra kiểu của từng biến trên và xác nhận đúng như mong đợi.
3. **Chạm vào bẫy:** khai báo `let a;` (chưa gán) và `const b = null;`. In `typeof a` và `typeof b`, quan sát: cái nào ra `'undefined'`, cái nào ra `'object'`? Giải thích vì sao `typeof b` không ra `'null'`.
4. **const vs let:** thử gán lại một biến `const` và quan sát thông báo lỗi; sau đó đổi nó thành `let` và gán lại thành công.

## Website tham khảo

- [MDN — Storing information in variables (tiếng Việt)](https://developer.mozilla.org/vi/docs/Learn/JavaScript/First_steps/Variables) — giải thích biến cho người mới.
- [MDN — JavaScript data types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures) — đặc tả các kiểu dữ liệu.
- [javascript.info — Variables](https://javascript.info/variables) và [Data types](https://javascript.info/types) — trình bày rõ ràng, nhiều ví dụ.

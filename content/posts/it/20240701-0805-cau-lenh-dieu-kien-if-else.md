+++
date        = '2024-07-01T08:05:00+07:00'
draft       = false
title       = 'Bài 5 — Câu lệnh điều kiện if/else và toán tử so sánh'
slug        = 'cau-lenh-dieu-kien-if-else'
summary     = 'Cho chương trình ra quyết định với if/else/else if, nắm các toán tử so sánh và logic, và hiểu vì sao luôn dùng === thay vì ==. Nền tảng logic cho mọi assertion sau này.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-5-cau-lenh-dieu-kien-if-else-toan-tu-so-sanh.webp'
featured    = false
weight      = 6
categories  = ['automation']
tags        = ['automation-test', 'javascript']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

[Bài 4](../bien-va-kieu-du-lieu-javascript/) cho ta cách lưu dữ liệu. Bài này cho chương trình khả năng **ra quyết định** dựa trên dữ liệu đó — bằng câu lệnh điều kiện `if/else`. Đây chính là hiện thực hóa tư duy "nếu... thì..." đã nói ở [Bài 1](../lap-trinh-la-gi-tu-duy-giai-quyet-van-de/).

Trong automation test, logic điều kiện có mặt khắp nơi: "nếu phần tử hiển thị thì click", "nếu response trả về 200 thì pass". Nắm chắc phần này là bắt buộc.

## Cấu trúc if/else

```javascript
const diem = 7;

if (diem >= 5) {
  console.log('Đậu');
} else {
  console.log('Rớt');
}
```

- `if (điều-kiện)` — nếu điều kiện là `true`, chạy khối lệnh trong `{ }` ngay sau nó.
- `else { }` — nếu điều kiện là `false`, chạy khối này thay thế.
- Điều kiện trong `( )` luôn được quy về một giá trị **boolean** (`true`/`false`).

Khối `else` là tùy chọn — có thể chỉ dùng `if` một mình khi không cần xử lý trường hợp ngược lại.

## Nhiều nhánh với else if

Khi có hơn hai trường hợp, nối thêm `else if`:

```javascript
const diem = 7;

if (diem >= 8) {
  console.log('Giỏi');
} else if (diem >= 5) {
  console.log('Đạt');
} else {
  console.log('Chưa đạt');
}
```

JavaScript kiểm tra lần lượt từ trên xuống, chạy khối **đầu tiên** có điều kiện `true` rồi bỏ qua phần còn lại. Với `diem = 7`: điều kiện đầu (`>= 8`) sai, điều kiện thứ hai (`>= 5`) đúng → in `'Đạt'` và dừng.

## Toán tử so sánh

Các toán tử so sánh trả về giá trị `boolean`:

| Toán tử | Ý nghĩa | Ví dụ | Kết quả |
|---------|---------|-------|---------|
| `===` | Bằng (cả giá trị và kiểu) | `5 === 5` | `true` |
| `!==` | Khác | `5 !== 3` | `true` |
| `>` | Lớn hơn | `7 > 10` | `false` |
| `<` | Nhỏ hơn | `7 < 10` | `true` |
| `>=` | Lớn hơn hoặc bằng | `5 >= 5` | `true` |
| `<=` | Nhỏ hơn hoặc bằng | `4 <= 3` | `false` |

## === thay vì ==: quy tắc quan trọng

JavaScript có hai toán tử so sánh bằng: `==` và `===`. Sự khác biệt là nguồn bug kinh điển.

```javascript
console.log(5 === '5');  // false — khác kiểu (number vs string)
console.log(5 == '5');   // true  — == tự chuyển kiểu trước khi so sánh
```

- `===` (strict equality) — so sánh **cả giá trị lẫn kiểu**, không tự chuyển đổi.
- `==` (loose equality) — **tự chuyển kiểu** rồi mới so sánh, dẫn tới kết quả khó lường.

> **Best practice tuyệt đối:** luôn dùng `===` và `!==`. Việc `==` tự chuyển kiểu ngầm gây ra những bug rất khó tìm. Đây không phải sở thích — nó là quy tắc chuẩn trong mọi codebase JavaScript nghiêm túc và trong cả API assertion của Playwright.

## Toán tử logic: kết hợp nhiều điều kiện

Khi cần kiểm tra nhiều điều kiện cùng lúc:

| Toán tử | Tên | Trả về `true` khi |
|---------|-----|-------------------|
| `&&` | AND (và) | **tất cả** điều kiện đều `true` |
| `\|\|` | OR (hoặc) | **ít nhất một** điều kiện `true` |
| `!` | NOT (phủ định) | đảo ngược: `!true` là `false` |

```javascript
const tuoi = 25;
const coBangLai = true;

if (tuoi >= 18 && coBangLai) {
  console.log('Được phép lái xe');
}

const laCuoiTuan = false;
if (!laCuoiTuan) {
  console.log('Hôm nay là ngày làm việc');
}
```

## Truthy và Falsy: giá trị không phải boolean trong điều kiện

Điều kiện trong `if` không nhất thiết phải là `true`/`false`. Bạn có thể đặt **bất kỳ giá trị nào** vào, và JavaScript tự quy nó về "đúng" hoặc "sai". Cơ chế này gọi là **truthy** (được coi là đúng) và **falsy** (được coi là sai).

Chỉ có **6 giá trị falsy** — nhớ danh sách này là đủ:

```javascript
false        // boolean false
0            // số 0
''           // chuỗi rỗng
null         // (Bài 4)
undefined    // (Bài 4)
NaN          // "Not a Number" — kết quả tính toán số không hợp lệ
```

**Mọi giá trị khác đều là truthy** — kể cả `'0'` (chuỗi có ký tự 0), `'false'` (chuỗi), số âm, mảng rỗng.

```javascript
const ten = 'An';
if (ten) {
  console.log('Có tên');   // chạy, vì chuỗi không rỗng là truthy
}

let loi;   // undefined → falsy
if (loi) {
  console.log('Có lỗi');   // KHÔNG chạy
}
```

Đây là lý do bạn thường thấy `if (bien)` thay vì `if (bien !== '' && bien !== null)`. Ví dụ sát testing: `if (errorMessage)` nghĩa là "nếu có thông báo lỗi (khác rỗng/null)".

> **Cảnh báo thực chiến:** truthy/falsy tiện nhưng dễ gài bẫy. Giá trị `0` là **falsy**, nên `if (soLuong)` sẽ coi số lượng bằng 0 là "sai" — có thể không phải ý bạn. Khi cần phân biệt rõ "bằng 0" với "không có giá trị", hãy so sánh tường minh (`if (soLuong === 0)`, `if (soLuong !== undefined)`) thay vì dựa vào truthy/falsy.

## Toán tử ba ngôi (ternary): viết tắt if/else

Khi cần chọn một trong hai giá trị dựa trên điều kiện, **toán tử ba ngôi** viết gọn hơn `if/else`:

```javascript
điều-kiện ? giá-trị-nếu-đúng : giá-trị-nếu-sai
```

Ví dụ, hai đoạn sau tương đương:

```javascript
// Dùng if/else
let ketQua;
if (diem >= 5) {
  ketQua = 'Đậu';
} else {
  ketQua = 'Rớt';
}

// Dùng ternary — ngắn gọn
const ketQua = diem >= 5 ? 'Đậu' : 'Rớt';
```

Ternary phù hợp khi logic đơn giản (chọn giữa hai giá trị). Với logic phức tạp nhiều nhánh, dùng `if/else if` cho dễ đọc — đừng lồng nhiều ternary vào nhau, sẽ rất khó hiểu. Bạn sẽ gặp ternary thường xuyên trong code thật, kể cả file cấu hình Playwright.

## Liên hệ với testing

Bản chất của một **assertion** (khẳng định kiểm thử) là một biểu thức điều kiện: kiểm tra một giá trị có đúng như kỳ vọng không. Ví dụ tư duy:

```javascript
const statusCode = 200;

// "Nếu status không phải 200 thì test này thất bại"
if (statusCode !== 200) {
  console.log('TEST FAILED: status code không đúng');
} else {
  console.log('TEST PASSED');
}
```

Ở Bài 20, Playwright cung cấp hàm `expect()` viết assertion gọn hơn nhiều, nhưng logic bên dưới vẫn là các phép so sánh bạn học hôm nay.

## Lỗi thường gặp

- **Nhầm `=` với `===`:** `=` là *gán*, `===` là *so sánh*. Viết `if (diem = 5)` sẽ **gán** 5 cho `diem` (không phải so sánh) và gây hành vi sai. Luôn dùng `===` trong điều kiện.
- **Dùng `==` rồi bị chuyển kiểu ngầm** → kết quả bất ngờ. Đổi sang `===`.
- **Quên dấu ngoặc nhọn `{ }`** với khối nhiều dòng → chỉ dòng đầu tiên thuộc `if`, các dòng sau luôn chạy.

Ở [Bài 6](../vong-lap-for-for-of/) ta học **vòng lặp** — cách lặp lại một khối lệnh nhiều lần mà không viết lại thủ công.

## 🛠 Thực hành

1. **Xếp loại điểm:** viết chương trình nhận một biến `diem`, dùng `if/else if/else` in ra "Giỏi" (>= 8), "Khá" (>= 6.5), "Trung bình" (>= 5), "Yếu" (< 5). Thử với nhiều giá trị.
2. **Kiểm chứng === vs ==:** in ra kết quả của `0 == ''`, `0 === ''`, `1 == true`, `1 === true` và giải thích vì sao khác nhau.
3. **Truthy/Falsy:** với mỗi giá trị `0`, `'0'`, `''`, `'An'`, `null`, `[]` (mảng rỗng), viết `if` để in ra nó là "truthy" hay "falsy". Kết quả nào làm bạn bất ngờ?
4. **Ternary:** viết lại bằng toán tử ba ngôi một câu `if/else` gán biến `thongBao` thành `'Còn hàng'` nếu `soLuong > 0`, ngược lại `'Hết hàng'`. Thử với `soLuong = 0` và để ý bẫy falsy.
5. **Logic kết hợp:** viết điều kiện kiểm tra một tài khoản hợp lệ khi cả `tenDangNhap` không rỗng **và** `matKhau` có độ dài >= 8 (gợi ý: dùng truthy cho `tenDangNhap` và `.length` của chuỗi cho `matKhau`).

## Website tham khảo

- [MDN — Making decisions in your code (tiếng Việt)](https://developer.mozilla.org/vi/docs/Learn/JavaScript/Building_blocks/conditionals) — điều kiện cho người mới.
- [javascript.info — Conditional branching](https://javascript.info/ifelse) — if/else chi tiết.
- [javascript.info — Comparisons](https://javascript.info/comparison) — giải thích kỹ `==` vs `===`.

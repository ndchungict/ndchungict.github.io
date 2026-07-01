+++
date        = '2026-07-01T08:20:00+07:00'
draft       = true
title       = 'Bài 8 — Làm việc với Array và String trong JavaScript'
slug        = 'array-va-string-trong-javascript'
summary     = 'Array và các phương thức hay dùng trong automation test (map, filter, find, includes), cùng các thao tác chuỗi thiết yếu (includes, trim, split, template literal) để xử lý và assert text.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 9
categories  = ['automation']
tags        = ['automation-test', 'javascript']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

**Array (mảng)** và **String (chuỗi)** là hai kiểu dữ liệu bạn thao tác nhiều nhất trong automation test: lấy danh sách phần tử trên trang, kiểm tra nội dung text, xử lý dữ liệu test. Bài này tập trung vào các phương thức thực dụng nhất, không liệt kê dàn trải.

## Array — danh sách có thứ tự

Array là một danh sách các giá trị, đặt trong `[ ]`, ngăn bởi dấu phẩy:

```javascript
const trinhDuyet = ['chromium', 'firefox', 'webkit'];

console.log(trinhDuyet[0]);      // 'chromium' — truy cập bằng chỉ số, đếm từ 0
console.log(trinhDuyet.length);  // 3 — số phần tử
```

- Truy cập phần tử qua **chỉ số (index)**, bắt đầu từ `0`.
- `.length` cho biết số phần tử.

Thêm/xóa phần tử cơ bản:

```javascript
trinhDuyet.push('edge');   // thêm vào cuối → ['chromium','firefox','webkit','edge']
trinhDuyet.pop();          // xóa phần tử cuối
```

## Các phương thức Array quan trọng cho automation

Đây là nhóm phương thức bạn sẽ dùng thường xuyên. Điểm chung: tất cả đều nhận một **hàm** làm đối số — chính là **callback** đã học ở [Bài 7](../ham-va-arrow-function/). Mỗi phương thức tự gọi hàm callback đó trên từng phần tử; việc của bạn chỉ là mô tả "làm gì với mỗi phần tử".

### includes — kiểm tra có chứa giá trị không

```javascript
const tags = ['smoke', 'regression', 'critical'];
console.log(tags.includes('smoke'));      // true
console.log(tags.includes('performance')); // false
```

Trả về `boolean` — rất hay dùng trong assertion để kiểm tra một giá trị có nằm trong danh sách không.

### map — biến đổi từng phần tử thành mảng mới

```javascript
const gia = [100, 200, 300];
const giaSauThue = gia.map((g) => g * 1.1);
console.log(giaSauThue);   // [110, 220, 330.00000000000003]
```

`map` chạy hàm trên **từng** phần tử và trả về **mảng mới** cùng độ dài. Dùng khi cần chuyển đổi dữ liệu — ví dụ lấy text từ một danh sách phần tử web.

### filter — lọc ra các phần tử thỏa điều kiện

```javascript
const diem = [4, 7, 9, 2, 8];
const diemDat = diem.filter((d) => d >= 5);
console.log(diemDat);   // [7, 9, 8]
```

`filter` giữ lại các phần tử mà hàm trả về `true`. Trả về mảng mới, có thể ngắn hơn.

### find — tìm phần tử đầu tiên thỏa điều kiện

```javascript
const nguoiDung = [
  { ten: 'An', tuoi: 20 },
  { ten: 'Bình', tuoi: 30 },
];
const timThay = nguoiDung.find((u) => u.tuoi > 25);
console.log(timThay);   // { ten: 'Bình', tuoi: 30 }
```

`find` trả về **phần tử đầu tiên** thỏa điều kiện (không phải mảng), hoặc `undefined` nếu không có. (Object với cú pháp `{ }` học kỹ ở [Bài 9](../object-trong-javascript/).)

### forEach — chạy qua từng phần tử

`forEach` chạy một hàm trên **từng** phần tử, nhưng **không trả về mảng mới** — dùng khi bạn chỉ muốn *làm gì đó* với mỗi phần tử (in ra, xử lý), không cần kết quả gộp lại:

```javascript
const trinhDuyet = ['chromium', 'firefox', 'webkit'];

trinhDuyet.forEach((ten) => {
  console.log(`Chạy test trên ${ten}`);
});
```

Phân biệt cốt lõi với `map`: `map` **trả về mảng mới** (dùng khi cần biến đổi dữ liệu), còn `forEach` **không trả về gì** (dùng khi chỉ cần chạy qua). Cần kết quả thì `map`; chỉ cần hành động thì `forEach`. (Về việc lặp có `await`, ta sẽ nói ở [Bài 10](../bat-dong-bo-promise-async-await/) — đây là chỗ `forEach` có hạn chế.)

> Các phương thức `includes`, `map`, `filter`, `find`, `forEach` là bộ công cụ xử lý danh sách chủ lực. Trong Playwright bạn thường lấy nhiều phần tử rồi dùng chúng để trích xuất, lọc, và kiểm tra dữ liệu. Nắm chắc nhóm này quan trọng hơn học thuộc hàng chục phương thức khác.

### Nối chuỗi phương thức (method chaining)

Vì `map` và `filter` đều **trả về mảng mới**, bạn có thể gọi phương thức tiếp theo ngay trên kết quả — gọi là **chaining**. Cách này đọc gọn và thể hiện rõ luồng xử lý dữ liệu:

```javascript
const sanPham = [
  { ten: 'Áo', gia: 120 },
  { ten: 'Quần', gia: 80 },
  { ten: 'Giày', gia: 300 },
];

// Lọc sản phẩm >= 100, rồi lấy ra mảng tên — nối liền trong một biểu thức
const tenDatTien = sanPham
  .filter((sp) => sp.gia >= 100)   // → [{Áo...}, {Giày...}]
  .map((sp) => sp.ten);            // → ['Áo', 'Giày']

console.log(tenDatTien);   // ['Áo', 'Giày']
```

Mỗi phương thức nhận mảng từ bước trước và trả mảng cho bước sau. Thứ tự quan trọng: thường `filter` trước (thu hẹp) rồi `map` sau (biến đổi). Đừng nối quá dài (3–4 bước là nhiều) kẻo khó đọc.

## String — thao tác chuỗi thiết yếu

Trong test, phần lớn assertion là kiểm tra **text**: tiêu đề trang, thông báo lỗi, nội dung nút. Các thao tác chuỗi hay dùng:

```javascript
const thongBao = '  Đăng nhập thành công!  ';

console.log(thongBao.length);              // độ dài chuỗi (tính cả khoảng trắng)
console.log(thongBao.includes('thành công')); // true — có chứa chuỗi con không
console.log(thongBao.trim());              // bỏ khoảng trắng đầu/cuối
console.log(thongBao.toLowerCase());       // chuyển thường
console.log(thongBao.toUpperCase());       // chuyển hoa
console.log(thongBao.replace('công', 'CÔNG')); // thay thế
```

| Phương thức | Tác dụng |
|-------------|----------|
| `.includes(x)` | Chuỗi có chứa `x` không (trả `boolean`) |
| `.trim()` | Bỏ khoảng trắng thừa hai đầu |
| `.toLowerCase()` / `.toUpperCase()` | Đổi hoa/thường |
| `.replace(a, b)` | Thay `a` bằng `b` |
| `.split(dauNgan)` | Cắt chuỗi thành mảng theo dấu ngăn |
| `.startsWith(x)` / `.endsWith(x)` | Kiểm tra chuỗi bắt đầu/kết thúc bằng `x` |

`.trim()` đặc biệt quan trọng: text lấy từ web thường dính khoảng trắng thừa, gây assertion thất bại một cách khó hiểu. So sánh sau khi `.trim()` là thói quen nên có.

```javascript
const csv = 'An,Bình,Chi';
const danhSach = csv.split(',');
console.log(danhSach);   // ['An', 'Bình', 'Chi'] — chuỗi thành mảng

// join làm điều ngược lại: mảng thành chuỗi
console.log(danhSach.join(' | '));   // 'An | Bình | Chi'
```

`split` (chuỗi → mảng) và `join` (mảng → chuỗi) là cặp thao tác ngược nhau, hay dùng khi xử lý dữ liệu dạng danh sách ngăn cách.

## Liên hệ với testing

Ví dụ tư duy — trích và kiểm tra danh sách tên sản phẩm:

```javascript
const sanPham = ['  Áo thun  ', 'Quần jean', '  Giày  '];

// Chuẩn hóa: bỏ khoảng trắng thừa từng phần tử
const daChuanHoa = sanPham.map((ten) => ten.trim());
console.log(daChuanHoa);   // ['Áo thun', 'Quần jean', 'Giày']

// Kiểm tra có sản phẩm "Quần jean" không
console.log(daChuanHoa.includes('Quần jean'));   // true
```

Cấu trúc "lấy danh sách → map để chuẩn hóa → includes/filter để kiểm tra" là mô-típ lặp đi lặp lại khi test dữ liệu hiển thị trên trang.

## Lỗi thường gặp

- **Sai chỉ số:** phần tử đầu là index `0`, phần tử cuối là `length - 1`. Truy cập index vượt quá trả về `undefined`.
- **Quên `.trim()`:** so sánh text web có khoảng trắng thừa → assertion thất bại dù nhìn "giống nhau".
- **Nhầm `map` với `forEach`:** `map` **trả về mảng mới**, `forEach` chỉ chạy qua từng phần tử mà **không trả về gì**. Cần kết quả thì dùng `map`.

Ở [Bài 9](../object-trong-javascript/) ta học **Object** — cách biểu diễn dữ liệu có cấu trúc (ví dụ một người dùng gồm tên, email, mật khẩu).

## 🛠 Thực hành

1. **Chaining filter + map:** cho mảng giá `[120, 45, 300, 89, 15]`, **nối chuỗi** `filter` (lấy giá >= 100) rồi `map` (thêm ký hiệu `'đ'`) trong một biểu thức, cho ra mảng như `['120đ', '300đ']`.
2. **forEach:** cho mảng `['An', 'Binh', 'Chi']`, dùng `forEach` in ra `Xin chao <ten>` cho từng người. Tự hỏi: `forEach` có trả về mảng không?
3. **Xử lý chuỗi:** cho chuỗi `'  Xin Chào Automation Test  '`, dùng `.trim()` và `.toLowerCase()` để chuẩn hóa, rồi kiểm tra bằng `.includes('automation')`.
4. **Split, filter, join:** cho chuỗi email `'a@test.com;b@demo.vn;c@mail.org'`, dùng `.split(';')` tách thành mảng, `.filter` giữ các email kết thúc bằng `.com`, rồi `.join(', ')` ghép lại thành một chuỗi.

## Website tham khảo

- [MDN — Arrays (tiếng Việt)](https://developer.mozilla.org/vi/docs/Learn/JavaScript/First_steps/Arrays) — mảng cho người mới.
- [javascript.info — Array methods](https://javascript.info/array-methods) — map, filter, find và hơn thế.
- [MDN — String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) — tham chiếu các phương thức chuỗi.

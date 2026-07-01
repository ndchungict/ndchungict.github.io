+++
date        = '2026-07-01T08:10:00+07:00'
draft       = false
title       = 'Bài 6 — Vòng lặp: for, for...of và khi nào dùng loại nào'
slug        = 'vong-lap-for-for-of'
summary     = 'Lặp lại một khối lệnh nhiều lần với vòng lặp for cổ điển và for...of. Phân biệt khi nào dùng loại nào, kèm break/continue và liên hệ với thao tác lặp trong automation test.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 7
categories  = ['automation']
tags        = ['automation-test', 'javascript']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

[Bài 5](../cau-lenh-dieu-kien-if-else/) cho chương trình ra quyết định. Bài này cho nó khả năng **lặp lại** — thực thi một khối lệnh nhiều lần mà không viết lại thủ công. Đây là hiện thực của tư duy "khuôn mẫu lặp lại" nhắc ở [Bài 1](../lap-trinh-la-gi-tu-duy-giai-quyet-van-de/).

Trong automation, vòng lặp xuất hiện khi bạn cần xử lý một danh sách: kiểm tra từng sản phẩm trong giỏ hàng, chạy cùng một test với nhiều bộ dữ liệu, duyệt qua các dòng của một bảng.

## Vòng lặp for cổ điển

```javascript
for (let i = 0; i < 5; i++) {
  console.log(`Lần lặp thứ ${i}`);
}
```

Phần trong `( )` gồm ba thành phần, ngăn bởi dấu `;`:

1. **Khởi tạo:** `let i = 0` — chạy một lần khi bắt đầu. `i` là biến đếm.
2. **Điều kiện:** `i < 5` — kiểm tra trước mỗi vòng. Còn `true` thì còn lặp.
3. **Cập nhật:** `i++` — chạy sau mỗi vòng. `i++` nghĩa là tăng `i` thêm 1.

Kết quả in ra `i` từ 0 đến 4 (năm lần). Lưu ý: lập trình đếm từ **0**, nên `i < 5` cho đúng 5 lần lặp với `i` = 0,1,2,3,4.

## for...of: duyệt qua từng phần tử

Khi cần đi qua từng phần tử của một danh sách (array — học kỹ ở Bài 8), `for...of` gọn và rõ hơn nhiều:

```javascript
const cacTrinhDuyet = ['chromium', 'firefox', 'webkit'];

for (const trinhDuyet of cacTrinhDuyet) {
  console.log(`Chạy test trên ${trinhDuyet}`);
}
```

Mỗi vòng lặp, biến `trinhDuyet` tự nhận giá trị của phần tử kế tiếp. Không cần biến đếm `i`, không lo sai chỉ số. Đây là lý do `for...of` được ưu tiên khi bạn chỉ cần *nội dung* các phần tử.

> ⚠️ **Đừng nhầm `for...of` với `for...in`.** Có một vòng lặp tên gần giống là `for...in`, nhưng nó duyệt **chỉ số/khóa (key)** chứ không phải giá trị — và với mảng, chỉ số đó là **chuỗi** (`'0'`, `'1'`,...), rất dễ gây bug. Quy tắc đơn giản: **duyệt mảng thì luôn dùng `for...of`** (lấy giá trị). Chỉ dùng `for...in` khi thực sự muốn duyệt khóa của object (Bài 9), và ngay cả khi đó cũng có cách tốt hơn. Thấy `for...in` trong lúc search Google thì cẩn thận — dễ dùng nhầm.
>
> ```javascript
> const arr = ['a', 'b', 'c'];
> for (const x of arr) console.log(x);   // 'a', 'b', 'c'  ← giá trị (đúng ý)
> for (const x in arr) console.log(x);   // '0', '1', '2'  ← chỉ số dạng chuỗi
> ```

## Vòng lặp while

`while` lặp lại một khối lệnh **chừng nào điều kiện còn `true`**. Khác với `for` (thường dùng khi biết trước số lần), `while` hợp khi **không biết trước bao nhiêu vòng** — chỉ biết điều kiện dừng.

```javascript
let i = 0;
while (i < 5) {
  console.log(`Lần ${i}`);
  i++;                    // BẮT BUỘC cập nhật, nếu không sẽ lặp vô hạn
}
```

- Điều kiện được kiểm tra **trước mỗi vòng**. Sai ngay từ đầu thì khối lệnh không chạy lần nào.
- Bạn phải tự thay đổi điều kiện bên trong (ở đây là `i++`), nếu không vòng lặp không bao giờ dừng.

`while` phù hợp cho tình huống kiểu "lặp cho tới khi đạt trạng thái mong muốn". Nhưng cẩn thận: quên cập nhật điều kiện là nguyên nhân số một gây **vòng lặp vô hạn**.

## Khi nào dùng loại nào

| Tình huống | Nên dùng |
|-----------|----------|
| Cần chính bản thân các phần tử của danh sách | `for...of` |
| Cần chỉ số (index) hoặc điều khiển bước nhảy | `for` cổ điển |
| Lặp một số lần cố định không gắn với danh sách | `for` cổ điển |
| Lặp tới khi đạt điều kiện, không biết trước số vòng | `while` |
| Duyệt khóa của một object | `for...in` (Bài 9) |

> Trong thực tế viết automation, `for...of` chiếm đa số vì bạn thường thao tác trên danh sách phần tử (locator). Chỉ dùng `for` cổ điển khi thực sự cần chỉ số hoặc bước nhảy đặc biệt. Ngoài ra còn các phương thức như `.forEach`, `.map` (Bài 8) cũng để duyệt — nhưng nắm `for...of` trước đã.

## break và continue

Hai lệnh điều khiển luồng bên trong vòng lặp:

```javascript
// break — thoát hẳn vòng lặp ngay lập tức
for (const so of [1, 2, 3, 4, 5]) {
  if (so === 3) break;
  console.log(so);        // in 1, 2 rồi dừng
}

// continue — bỏ qua phần còn lại của vòng hiện tại, sang vòng kế
for (const so of [1, 2, 3, 4, 5]) {
  if (so % 2 === 0) continue;  // bỏ qua số chẵn
  console.log(so);        // in 1, 3, 5
}
```

- `break` — dừng toàn bộ vòng lặp.
- `continue` — bỏ qua lần lặp hiện tại, tiếp tục lần sau.
- `%` là toán tử **chia lấy dư** (modulo); `so % 2 === 0` nghĩa là số chẵn.

## Liên hệ với testing

Một ví dụ tư duy sát nghề — kiểm tra một danh sách sản phẩm đều có giá hợp lệ:

```javascript
const giaSanPham = [100, 250, 0, 80];

for (const gia of giaSanPham) {
  if (gia <= 0) {
    console.log(`LỖI: phát hiện giá không hợp lệ (${gia})`);
  } else {
    console.log(`OK: giá ${gia}`);
  }
}
```

Về sau với Playwright, bạn sẽ lặp qua các dòng của một bảng hoặc các item trong danh sách để kiểm tra từng cái — cấu trúc y hệt ví dụ này.

## Lỗi thường gặp

- **Vòng lặp vô hạn:** quên cập nhật biến đếm (thiếu `i++`) hoặc điều kiện luôn `true` → chương trình treo. Nếu terminal đứng im, nhấn `Ctrl + C` để dừng.
- **Lệch chỉ số (off-by-one):** dùng `i <= 5` thay vì `i < 5` khi lặp 5 lần → chạy dư một vòng. Nhớ đếm từ 0.
- **Dùng `for...of` trên number:** `for...of` chỉ chạy trên danh sách (iterable), không chạy trên một số đơn lẻ → `TypeError`.

Ở [Bài 7](../ham-va-arrow-function/) ta học **hàm** — cách đóng gói một khối code thành một đơn vị tái sử dụng, gọi lại bất cứ khi nào cần.

## 🛠 Thực hành

1. **Đếm và tính tổng:** dùng `for` cổ điển in các số từ 1 đến 10, đồng thời tính tổng của chúng và in kết quả cuối.
2. **Duyệt danh sách:** cho mảng `['An', 'Binh', 'Chi']`, dùng `for...of` in ra `Xin chao <ten>` cho từng người.
3. **Lọc bằng continue:** duyệt mảng số từ 1 đến 20, chỉ in ra các số chia hết cho 3 (gợi ý: `so % 3 === 0`).
4. **Thử while:** viết vòng lặp `while` đếm ngược từ 5 về 1 rồi in `'Bắt đầu!'`. Sau đó thử **xóa dòng cập nhật biến đếm** và quan sát vòng lặp vô hạn (nhấn `Ctrl + C` để dừng).
5. **for...of vs for...in:** với mảng `['a', 'b', 'c']`, chạy cả `for...of` và `for...in` in ra biến lặp, so sánh kết quả và giải thích khác biệt.

## Website tham khảo

- [MDN — Looping code (tiếng Việt)](https://developer.mozilla.org/vi/docs/Learn/JavaScript/Building_blocks/Looping_code) — vòng lặp cho người mới.
- [javascript.info — Loops: while and for](https://javascript.info/while-for) — vòng lặp chi tiết.
- [MDN — for...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) — đặc tả `for...of`.

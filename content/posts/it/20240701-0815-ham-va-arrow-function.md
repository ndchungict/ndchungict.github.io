+++
date        = '2024-07-01T08:15:00+07:00'
draft       = false
title       = 'Bài 7 — Hàm (function) và arrow function'
slug        = 'ham-va-arrow-function'
summary     = 'Đóng gói code thành hàm tái sử dụng: khai báo, tham số, giá trị trả về, và cú pháp arrow function. Hiểu vì sao hàm là đơn vị tổ chức nền tảng của mọi test.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-7-ham-function-va-arrow-function.webp'
featured    = false
weight      = 8
categories  = ['it']
subcategories = ['automation']
tags        = ['automation-test', 'javascript']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

**Hàm (function)** là một khối code được đặt tên, đóng gói để tái sử dụng. Thay vì viết lại cùng một đoạn logic ở nhiều nơi, bạn định nghĩa nó một lần thành hàm, rồi **gọi (call)** khi cần. Đây là hiện thực của tư duy "gói khuôn mẫu lặp lại" ở [Bài 1](../lap-trinh-la-gi-tu-duy-giai-quyet-van-de/).

Hàm là đơn vị tổ chức quan trọng nhất trong automation: mỗi test là một hàm, mỗi thao tác lặp lại (đăng nhập, điền form) thường được gói thành hàm dùng chung.

## Khai báo và gọi hàm

```javascript
// Khai báo hàm
function chao() {
  console.log('Xin chào từ trong hàm');
}

// Gọi hàm
chao();   // in ra: Xin chào từ trong hàm
```

- `function` — từ khóa khai báo hàm.
- `chao` — tên hàm (đặt theo camelCase, thường là động từ mô tả hành động).
- `{ }` — thân hàm, chứa code sẽ chạy khi hàm được gọi.
- Định nghĩa hàm **không** tự chạy; code bên trong chỉ chạy khi bạn **gọi** nó bằng `chao()`.

## Tham số và đối số

**Tham số (parameter)** là biến đầu vào của hàm, cho phép hàm làm việc với dữ liệu khác nhau mỗi lần gọi:

```javascript
function chaoNguoi(ten) {
  console.log(`Xin chào, ${ten}`);
}

chaoNguoi('An');    // Xin chào, An
chaoNguoi('Bình');  // Xin chào, Bình
```

- `ten` là **tham số** — chỗ trống trong định nghĩa.
- `'An'`, `'Bình'` là **đối số (argument)** — giá trị thực truyền vào khi gọi.

Hàm có thể nhận nhiều tham số, ngăn bởi dấu phẩy:

```javascript
function tinhTong(a, b) {
  console.log(a + b);
}
tinhTong(3, 5);   // 8
```

## Tham số mặc định (default parameter)

Khi gọi hàm mà **thiếu đối số**, tham số tương ứng nhận `undefined` — thường gây kết quả sai. **Tham số mặc định** cho phép đặt sẵn một giá trị dự phòng khi đối số không được truyền:

```javascript
function chao(ten = 'bạn') {
  console.log(`Xin chào, ${ten}`);
}

chao('An');   // Xin chào, An
chao();       // Xin chào, bạn   ← dùng giá trị mặc định
```

Cú pháp là `tên = giá-trị-mặc-định` ngay trong danh sách tham số. Giá trị mặc định chỉ áp dụng khi đối số là `undefined` (không truyền). Đây là cách viết hàm an toàn hơn, tránh lỗi thiếu đối số.

## Giá trị trả về với return

Nhiều hàm cần **trả về** một kết quả để nơi gọi sử dụng tiếp, thay vì chỉ in ra. Dùng `return`:

```javascript
function tinhTong(a, b) {
  return a + b;
}

const ketQua = tinhTong(3, 5);
console.log(ketQua);        // 8
console.log(tinhTong(10, 20)); // 30
```

- `return` trả giá trị về nơi gọi hàm, đồng thời **kết thúc hàm** ngay tại đó.
- Hàm không có `return` sẽ trả về `undefined`.

Phân biệt quan trọng: `console.log` chỉ **hiển thị** giá trị; `return` **đưa giá trị ra** để dùng tiếp (gán vào biến, truyền vào hàm khác). Trong test, các hàm kiểm tra thường `return` kết quả để nơi khác xử lý.

## Arrow function

**Arrow function** là cú pháp viết hàm ngắn gọn hơn, dùng dấu `=>`. Bạn sẽ gặp nó liên tục trong code Playwright, nên cần quen mặt:

```javascript
// Hàm thường
function tinhTong(a, b) {
  return a + b;
}

// Arrow function tương đương
const tinhTong = (a, b) => {
  return a + b;
};

// Rút gọn hơn: một dòng, tự return
const tinhTongNgan = (a, b) => a + b;
```

- Bỏ từ khóa `function`, thêm `=>` giữa danh sách tham số và thân hàm.
- Nếu thân hàm chỉ là một biểu thức, có thể bỏ `{ }` và bỏ luôn `return` — giá trị của biểu thức được trả về tự động.

> Trong series, Playwright dùng arrow function ở khắp nơi, ví dụ `test('tên', async () => { ... })`. Bạn chưa cần hiểu hết cú pháp đó bây giờ, chỉ cần nhận ra `() => { ... }` là "một hàm viết ngắn". Về sự khác biệt sâu hơn (cách xử lý `this`), người mới tạm chưa cần quan tâm.

## Hàm là một giá trị: khái niệm callback

Đây là ý tưởng quan trọng nhất của bài, và là chìa khóa để hiểu gần như mọi code Playwright về sau. Trong JavaScript, **một hàm cũng là một giá trị** — giống như số hay chuỗi, nó gán được vào biến và **truyền được vào hàm khác làm đối số**.

Một hàm được truyền vào hàm khác để "hàm kia gọi lại khi cần" gọi là **callback**.

```javascript
// 'thucHien' là một hàm nhận vào MỘT HÀM KHÁC làm đối số
function thucHien(hanhDong) {
  console.log('Chuẩn bị...');
  hanhDong();              // gọi hàm được truyền vào
  console.log('Xong.');
}

// Truyền một hàm vào làm đối số
thucHien(() => {
  console.log('Đang làm việc chính');
});
```

Nhìn kỹ: đối số truyền cho `thucHien` không phải số hay chuỗi, mà là **cả một hàm** `() => { ... }`. `thucHien` sẽ gọi hàm đó vào đúng thời điểm nó muốn.

Vì sao phải hiểu điều này? Vì đó chính là hình dạng của toàn bộ API bạn sắp gặp:

```javascript
// test() nhận một CHUỖI (tên) và một HÀM (nội dung test) làm đối số
test('đăng nhập thành công', async () => {
  // ... nội dung test nằm trong hàm callback này
});

// map() nhận một HÀM, áp dụng cho từng phần tử (Bài 8)
[1, 2, 3].map((so) => so * 2);

// page.on() nhận tên sự kiện và một HÀM xử lý (Bài 25)
page.on('dialog', (dialog) => dialog.accept());
```

Khi đã quen "hàm truyền vào hàm", các cú pháp trên không còn bí ẩn — bạn nhận ra ngay đâu là callback và nó sẽ được gọi khi nào.

## Liên hệ với testing

Gói một thao tác lặp lại thành hàm là best practice cốt lõi. Ví dụ tư duy — gói việc kiểm tra một email có hợp lệ:

```javascript
function emailHopLe(email) {
  return email.includes('@') && email.includes('.');
}

console.log(emailHopLe('a@test.com'));  // true
console.log(emailHopLe('sai-dinh-dang')); // false
```

Ở Bài 22 (Page Object Model), bạn sẽ gói cả các thao tác như "đăng nhập" thành hàm/phương thức dùng chung cho nhiều test — chính là mở rộng của ý tưởng này.

## Lỗi thường gặp

- **Định nghĩa hàm nhưng quên gọi:** viết `function chao() {...}` mà không có dòng `chao()` → không có gì chạy.
- **Nhầm giữa in và trả về:** hàm dùng `console.log` bên trong nhưng không `return` → không thể gán kết quả vào biến (nhận `undefined`).
- **Sai số lượng đối số:** gọi thiếu đối số → tham số tương ứng nhận `undefined`, dễ gây kết quả sai.

Ở [Bài 8](../array-va-string-trong-javascript/) ta học **Array và String** cùng các phương thức thao tác dữ liệu dùng rất nhiều trong automation test.

## 🛠 Thực hành

1. **Hàm tính toán:** viết hàm `tinhDienTich(dai, rong)` trả về diện tích hình chữ nhật. Gọi nó với vài bộ giá trị và in kết quả.
2. **Viết lại bằng arrow:** chuyển hàm ở bài 1 sang dạng arrow function rút gọn một dòng.
3. **Tham số mặc định:** viết hàm `taoLoiChao(ten = 'khách', loiChao = 'Xin chào')` trả về chuỗi ghép hai tham số. Gọi nó khi truyền đủ, thiếu một, và không truyền gì.
4. **Hàm kiểm tra:** viết hàm `laSoChan(so)` trả về `true`/`false`. Dùng nó trong một vòng lặp `for...of` để phân loại các số trong mảng `[3, 8, 15, 22]`.
5. **Callback:** viết một hàm `lapLai(soLan, hanhDong)` nhận một số và một **hàm**, gọi `hanhDong()` đúng `soLan` lần. Gọi nó và truyền vào một arrow function in ra lời chào.

## Website tham khảo

- [MDN — Functions (tiếng Việt)](https://developer.mozilla.org/vi/docs/Learn/JavaScript/Building_blocks/Functions) — hàm cho người mới.
- [javascript.info — Functions](https://javascript.info/function-basics) và [Arrow functions, the basics](https://javascript.info/arrow-functions-basics) — trình bày rõ ràng.
- [MDN — Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) — đặc tả arrow function.

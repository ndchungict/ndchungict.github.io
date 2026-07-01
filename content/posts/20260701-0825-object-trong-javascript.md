+++
date        = '2026-07-01T08:25:00+07:00'
draft       = true
title       = 'Bài 9 — Làm việc với Object trong JavaScript'
slug        = 'object-trong-javascript'
summary     = 'Biểu diễn dữ liệu có cấu trúc bằng object: truy cập, thêm/sửa thuộc tính, object lồng nhau, mảng object và destructuring cơ bản. Nền tảng để hiểu config và dữ liệu test.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 10
categories  = ['automation']
tags        = ['automation-test', 'javascript']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

**Object (đối tượng)** biểu diễn một thực thể có nhiều thuộc tính liên quan — ví dụ một người dùng gồm tên, email, mật khẩu. Trong khi array là *danh sách theo thứ tự*, object là *tập hợp các cặp tên–giá trị*. Object có mặt khắp nơi trong automation: dữ liệu test, file cấu hình Playwright, response API đều là object.

## Cú pháp object

```javascript
const nguoiDung = {
  ten: 'Nguyễn Văn A',
  email: 'a@test.com',
  tuoi: 25,
  daKichHoat: true,
};

console.log(nguoiDung.ten);    // 'Nguyễn Văn A'
console.log(nguoiDung.email);  // 'a@test.com'
```

- Object đặt trong `{ }`.
- Mỗi mục là một cặp **`key: value`** (khóa: giá trị), ngăn bởi dấu phẩy.
- `key` là tên thuộc tính (property); `value` là giá trị, có thể thuộc bất kỳ kiểu nào.

## Truy cập thuộc tính: hai cách

```javascript
console.log(nguoiDung.email);       // cách dấu chấm (phổ biến nhất)
console.log(nguoiDung['email']);    // cách ngoặc vuông
```

- **Dấu chấm** (`.email`) — ngắn gọn, dùng khi biết trước tên thuộc tính.
- **Ngoặc vuông** (`['email']`) — dùng khi tên thuộc tính nằm trong một biến, hoặc chứa ký tự đặc biệt.

## Thêm, sửa, xóa thuộc tính

```javascript
const nguoiDung = { ten: 'An', tuoi: 20 };

nguoiDung.email = 'an@test.com';  // thêm thuộc tính mới
nguoiDung.tuoi = 21;              // sửa thuộc tính có sẵn
delete nguoiDung.email;           // xóa thuộc tính

console.log(nguoiDung);   // { ten: 'An', tuoi: 21 }
```

Lưu ý: một object khai báo bằng `const` **vẫn có thể** thay đổi thuộc tính bên trong. `const` chỉ ngăn gán lại **toàn bộ** biến, không "đóng băng" nội dung object.

## Object lồng nhau và mảng object

Giá trị của một thuộc tính có thể lại là object hoặc array — cho phép biểu diễn dữ liệu phức tạp:

```javascript
const cauHinh = {
  baseURL: 'https://demo.com',
  trinhDuyet: {
    ten: 'chromium',
    headless: true,
  },
  retries: 2,
};

console.log(cauHinh.trinhDuyet.ten);   // 'chromium' — truy cập nhiều cấp
```

Cấu trúc lồng nhau này chính là hình dạng của file `playwright.config` bạn sẽ gặp ở Bài 16.

**Optional chaining `?.` — truy cập an toàn nhiều cấp.** Khi truy cập một thuộc tính có thể không tồn tại, chạm tới cấp sâu hơn sẽ gây lỗi:

```javascript
const nguoiDung = { ten: 'An' };            // không có thuộc tính diaChi
console.log(nguoiDung.diaChi.thanhPho);     // ❌ TypeError: Cannot read properties of undefined
```

Toán tử **optional chaining `?.`** giải quyết: nếu phần bên trái là `undefined`/`null`, cả biểu thức trả về `undefined` thay vì ném lỗi:

```javascript
console.log(nguoiDung.diaChi?.thanhPho);    // undefined — không lỗi
```

Đây là cách xử lý dữ liệu "có thể thiếu" rất phổ biến, đặc biệt khi làm việc với response API (Bài 29) — nơi một trường có thể vắng mặt.

Kết hợp array và object (rất phổ biến — một danh sách bản ghi):

```javascript
const danhSachNguoiDung = [
  { ten: 'An', vaiTro: 'admin' },
  { ten: 'Bình', vaiTro: 'user' },
];

// Duyệt bằng for...of (Bài 6)
for (const u of danhSachNguoiDung) {
  console.log(`${u.ten} — ${u.vaiTro}`);
}

// Hoặc lọc bằng filter (Bài 8)
const admins = danhSachNguoiDung.filter((u) => u.vaiTro === 'admin');
```

Đây là cách bạn tổ chức **dữ liệu test**: mỗi bộ dữ liệu là một object, nhiều bộ gộp thành một mảng để chạy lặp.

## Duyệt các thuộc tính của object

Array duyệt bằng `for...of` (Bài 6), nhưng object thì khác. Để đi qua các thuộc tính, dùng `for...in` (nhắc lại từ [Bài 6](../vong-lap-for-for-of/) — vòng lặp này duyệt **khóa**, đúng việc cần ở đây):

```javascript
const nguoiDung = { ten: 'An', tuoi: 25, email: 'an@test.com' };

for (const khoa in nguoiDung) {
  console.log(`${khoa}: ${nguoiDung[khoa]}`);   // dùng ngoặc vuông vì khóa nằm trong biến
}
// ten: An
// tuoi: 25
// email: an@test.com
```

Chú ý `nguoiDung[khoa]` dùng **ngoặc vuông** — vì `khoa` là một biến chứa tên thuộc tính (không viết được bằng dấu chấm).

Cách hiện đại hơn, thường được ưu tiên, là biến các thuộc tính thành mảng rồi dùng phương thức mảng (Bài 8):

```javascript
Object.keys(nguoiDung);     // ['ten', 'tuoi', 'email']  — mảng các khóa
Object.values(nguoiDung);   // ['An', 25, 'an@test.com']  — mảng các giá trị
Object.entries(nguoiDung);  // [['ten','An'], ['tuoi',25], ...] — mảng cặp [khóa, giá trị]
```

`Object.keys` đặc biệt hữu ích để đếm số thuộc tính (`Object.keys(obj).length`) hoặc duyệt bằng `for...of`/`forEach`.

## Destructuring — lấy nhanh thuộc tính ra biến

**Destructuring** cho phép trích các thuộc tính của object ra thành biến riêng, gọn hơn nhiều so với gán từng dòng:

```javascript
const nguoiDung = { ten: 'An', email: 'an@test.com', tuoi: 25 };

// Cách thường
const ten = nguoiDung.ten;
const email = nguoiDung.email;

// Destructuring — tương đương, ngắn hơn
const { ten, email } = nguoiDung;

console.log(ten, email);   // An an@test.com
```

Tên biến trong `{ }` phải **trùng tên thuộc tính**. Bạn sẽ thấy destructuring xuất hiện dày đặc trong code Playwright, ví dụ `test('...', async ({ page }) => { ... })` — chính là lấy thuộc tính `page` ra khỏi một object. Quen mặt cú pháp này từ bây giờ sẽ giúp bạn đọc code Playwright dễ dàng.

## Liên hệ với testing

Ví dụ tư duy — một bộ dữ liệu test đăng nhập:

```javascript
const taiKhoanTest = {
  email: 'test@demo.com',
  matKhau: 'Test@1234',
};

const { email, matKhau } = taiKhoanTest;
console.log(`Đăng nhập với ${email}`);
// Về sau: page.getByLabel('Email').fill(email)
```

Gom dữ liệu test vào object giúp test sạch, dễ thay đổi, và dễ tách ra file riêng (Bài 24).

## Lỗi thường gặp

- **Truy cập thuộc tính không tồn tại** → nhận `undefined` (không báo lỗi ngay). Nếu truy cập tiếp một cấp nữa trên `undefined` → `TypeError: Cannot read properties of undefined`. Khi dữ liệu có thể thiếu, dùng optional chaining `?.` (xem trên).
- **Nhầm object với array:** object dùng `{ }` và truy cập bằng tên khóa; array dùng `[ ]` và truy cập bằng chỉ số số.
- **Tưởng `const` khóa được nội dung object:** không — `const` chỉ chặn gán lại toàn bộ biến, thuộc tính bên trong vẫn sửa được.

Ở [Bài 10](../bat-dong-bo-promise-async-await/) ta học phần **quan trọng nhất** của giai đoạn này: bất đồng bộ, Promise và async/await — nền tảng để hiểu mọi dòng code Playwright.

## 🛠 Thực hành

1. **Tạo hồ sơ:** tạo object `sanPham` gồm `ten`, `gia`, `conHang` (boolean). In từng thuộc tính, rồi sửa `gia` và thêm thuộc tính `giamGia`.
2. **Duyệt object:** với object `sanPham` trên, dùng `for...in` in ra tất cả `khóa: giá trị`. Sau đó dùng `Object.keys` in ra số lượng thuộc tính.
3. **Optional chaining:** cho object `{ ten: 'An' }` (không có `diaChi`), in `nguoiDung.diaChi?.thanhPho` và xác nhận nó trả về `undefined` chứ không ném lỗi.
4. **Mảng object:** tạo mảng 3 object sản phẩm, dùng `filter` lấy các sản phẩm `conHang === true`, rồi `map` để lấy ra mảng chỉ gồm tên.
5. **Destructuring:** từ object `{ hoTen: 'Le Van C', email: 'c@test.com', tuoi: 30 }`, dùng destructuring lấy `hoTen` và `email` ra biến rồi in bằng template literal.

## Website tham khảo

- [MDN — JavaScript object basics (tiếng Việt)](https://developer.mozilla.org/vi/docs/Learn/JavaScript/Objects/Basics) — object cho người mới.
- [javascript.info — Objects](https://javascript.info/object) — object chi tiết.
- [javascript.info — Destructuring assignment](https://javascript.info/destructuring-assignment) — destructuring đầy đủ.

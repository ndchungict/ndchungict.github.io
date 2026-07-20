+++
date        = '2024-07-01T08:50:00+07:00'
draft       = false
title       = 'Bài 14 — Thiết kế test case tốt: pattern AAA và nguyên tắc test độc lập'
slug        = 'thiet-ke-test-case-aaa'
summary     = 'Cách viết test case chất lượng: cấu trúc Arrange–Act–Assert, đặt tên test rõ ràng, giữ test độc lập, và xác định test cái gì / không test cái gì. Phần phân biệt biết gõ Playwright với biết làm automation.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-14-thiet-ke-test-case-tot.webp'
featured    = false
weight      = 15
categories  = ['it']
subcategories = ['automation']
tags        = ['automation-test', 'test-design', 'best-practices']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

[Bài 13](../testing-la-gi/) đã trả lời *khi nào* nên tự động hóa. Bài này trả lời câu tiếp theo: tự động hóa *thế nào cho tốt*. Biết cú pháp Playwright chỉ là một nửa công việc. Nửa còn lại — thường bị bỏ qua — là **thiết kế test case tốt**: viết test sao cho rõ ràng, đáng tin, dễ bảo trì. Đây là phần phân biệt người "gõ được test" với người "làm automation" thật sự. Bài này khép lại Giai đoạn 2 bằng các nguyên tắc thiết kế mà mọi test bạn viết về sau nên tuân theo.

## Cấu trúc AAA: Arrange – Act – Assert

Mọi test tốt đều có ba phần rõ ràng, gọi tắt là **AAA**:

1. **Arrange (chuẩn bị):** thiết lập điều kiện ban đầu — mở trang, đăng nhập, chuẩn bị dữ liệu.
2. **Act (hành động):** thực hiện đúng **một** hành động cần kiểm tra — click nút, submit form.
3. **Assert (khẳng định):** kiểm tra kết quả có đúng như mong đợi không.

Minh họa bằng mã giả (chưa cần đúng cú pháp Playwright, tập trung vào cấu trúc):

```javascript
test('đăng nhập với thông tin hợp lệ thì vào được trang chủ', async () => {
  // Arrange — chuẩn bị
  mở trang '/login'
  const email = 'test@demo.com'
  const matKhau = 'Test@1234'

  // Act — hành động cần kiểm tra
  điền email và mật khẩu
  bấm nút "Đăng nhập"

  // Assert — kiểm tra kết quả
  khẳng định: URL hiện tại là '/dashboard'
});
```

Tách ba phần này giúp test dễ đọc: người khác nhìn vào biết ngay *chuẩn bị gì, làm gì, kiểm tra gì*. Đây là cấu trúc chuẩn của mọi framework test.

## Đặt tên test rõ ràng

Tên test nên mô tả **kịch bản và kết quả mong đợi**, đọc lên như một câu. Khi test fail, tên tốt cho biết ngay *cái gì hỏng* mà không cần đọc code.

```text
Kém:  test('login')
      test('test 2')

Tốt:  test('đăng nhập với mật khẩu sai thì hiện thông báo lỗi')
      test('giỏ hàng trống thì nút thanh toán bị vô hiệu hóa')
```

Công thức hữu ích: **[điều kiện] thì [kết quả mong đợi]**.

## Nguyên tắc: mỗi test kiểm tra một thứ

Một test nên tập trung vào **một hành vi**. Nhồi nhiều kiểm tra không liên quan vào một test khiến khi fail khó biết phần nào hỏng, và test dễ vỡ.

- **Nên:** một test cho "đăng nhập thành công", một test khác cho "đăng nhập sai mật khẩu".
- **Tránh:** một test khổng lồ đăng nhập, thêm giỏ hàng, thanh toán, đổi mật khẩu — tất cả trong một.

Điều này không có nghĩa mỗi test chỉ được một dòng `assert`. Có thể có vài assertion cùng kiểm chứng *một* hành vi. Nguyên tắc là **một lý do để fail**.

## Nguyên tắc: test phải độc lập

Mỗi test phải chạy được **độc lập**, không phụ thuộc test khác chạy trước. Vi phạm nguyên tắc này là nguồn lỗi kinh điển và khó chịu nhất.

- Test không được dựa vào dữ liệu do test trước tạo ra.
- Test phải chạy đúng dù chạy một mình, chạy theo nhóm, hay chạy theo thứ tự bất kỳ.
- Mỗi test tự chuẩn bị điều kiện của nó (phần Arrange).

Vì sao quan trọng: các framework hiện đại (gồm Playwright) chạy test **song song** và có thể theo thứ tự bất kỳ. Test phụ thuộc lẫn nhau sẽ fail ngẫu nhiên, cực khó điều tra. Playwright hỗ trợ tính độc lập này qua cơ chế cô lập (mỗi test một môi trường trình duyệt sạch) và fixtures (Bài 23).

## Kỹ thuật chọn test case: phân vùng tương đương và giá trị biên

AAA cho biết *cấu trúc* một test, nhưng làm sao chọn *giá trị đầu vào nào* để kiểm tra? Thử mọi giá trị là bất khả thi. Hai kỹ thuật kinh điển giúp chọn ít mà phủ nhiều:

**Phân vùng tương đương (equivalence partitioning).** Chia đầu vào thành các "nhóm" mà mọi giá trị trong nhóm được xử lý *giống nhau*, rồi chỉ cần test **một đại diện** mỗi nhóm.

Ví dụ: ô nhập tuổi chấp nhận 18–60. Các vùng tương đương:

- Nhỏ hơn 18 → không hợp lệ (test một giá trị, vd `10`).
- 18–60 → hợp lệ (test một giá trị, vd `30`).
- Lớn hơn 60 → không hợp lệ (test một giá trị, vd `70`).

Ba giá trị đại diện là đủ, thay vì thử hàng chục số.

**Phân tích giá trị biên (boundary value analysis).** Bug hay nấp ở **ranh giới** giữa các vùng, không phải ở giữa. Với khoảng 18–60, hãy test đúng các điểm biên và sát biên:

- `17`, `18` (biên dưới) và `60`, `61` (biên trên).
- Đây là nơi lỗi `>` vs `>=` hay xuất hiện — chính loại bug mà lập trình viên dễ viết sai.

> Đây là điểm phân biệt tester nghiệp dư với chuyên nghiệp. Người mới test vài giá trị ngẫu nhiên; người có kỹ thuật **phủ hết các vùng và các biên** với số test tối thiểu. Khi thiết kế test cho bất kỳ ô nhập nào (số, ngày, độ dài chuỗi), hãy tự hỏi: *các vùng là gì, và biên nằm ở đâu?*

## Test cái gì và không test cái gì

Chọn đúng thứ để kiểm tra quan trọng ngang cách viết:

**Nên tập trung:**
- Luồng nghiệp vụ cốt lõi (đăng nhập, thanh toán, tìm kiếm).
- Các trường hợp biên (dữ liệu rỗng, giá trị cực đại, ký tự đặc biệt).
- Các trường hợp lỗi (nhập sai, thiếu thông tin) — không chỉ "happy path".

**Nên tránh:**
- Test lại những thứ nằm ngoài tầm kiểm soát (dịch vụ bên thứ ba đã có bảo đảm riêng).
- Kiểm tra chi tiết triển khai dễ thay đổi thay vì hành vi người dùng thấy.
- Trùng lặp: kiểm tra cùng một logic ở nhiều tầng không cần thiết.

> Người mới thường chỉ viết "happy path" — trường hợp mọi thứ suôn sẻ. Nhưng bug hay nấp ở các **trường hợp biên và trường hợp lỗi**. Một tester giỏi dành phần lớn suy nghĩ cho câu hỏi "điều gì có thể sai?", chứ không phải "chứng minh nó chạy đúng".

## Tính chất của một test tốt — tóm tắt

| Tính chất | Nghĩa là |
|-----------|----------|
| **Rõ ràng** | Đọc tên và cấu trúc là hiểu ngay kiểm tra gì |
| **Độc lập** | Chạy được đơn lẻ, không phụ thuộc test khác |
| **Đáng tin** | Cùng đầu vào luôn cho cùng kết quả (không chập chờn) |
| **Tập trung** | Kiểm tra một hành vi, một lý do để fail |
| **Có ý nghĩa** | Kiểm tra thứ thực sự quan trọng với người dùng |

Giai đoạn 2 kết thúc tại đây. Bạn đã có nền web và nền tư duy testing. [Bài 15](../cai-dat-playwright-test-dau-tien/) mở Giai đoạn 3 — cài đặt Playwright và viết test tự động đầu tiên, áp dụng đúng cấu trúc AAA vừa học.

## 🛠 Thực hành

1. **Viết theo AAA:** chọn chức năng "thêm sản phẩm vào giỏ hàng", viết mô tả một test case rõ ba phần Arrange / Act / Assert (bằng lời, chưa cần code).
2. **Đặt lại tên:** cho các tên test kém sau, viết lại theo công thức [điều kiện] thì [kết quả]: `test('checkout')`, `test('search test')`, `test('form')`.
3. **Nghĩ trường hợp lỗi:** với chức năng "đăng ký tài khoản", liệt kê 5 test case, trong đó ít nhất 3 cái là trường hợp biên hoặc lỗi (không phải happy path).
4. **Phân vùng + biên:** một ô "số lượng" chấp nhận 1–99. Xác định các vùng tương đương và liệt kê các giá trị biên cần test (gợi ý: quanh 1 và quanh 99).

## Website tham khảo

- [Playwright — Best Practices](https://playwright.dev/docs/best-practices) — nguyên tắc viết test tốt, gồm tính độc lập.
- [Martin Fowler — Given-When-Then](https://martinfowler.com/bliki/GivenWhenThen.html) — một cách diễn đạt cấu trúc test tương đương AAA.
- [ISTQB — Test design techniques](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-/) — kỹ thuật thiết kế test case bài bản.

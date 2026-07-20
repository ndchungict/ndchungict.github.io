+++
date        = '2024-07-01T09:30:00+07:00'
draft       = false
title       = 'Bài 21 — Codegen: sinh code test nhanh và giới hạn của công cụ'
slug        = 'codegen-playwright'
summary     = 'Dùng Codegen để tự sinh code test bằng cách thao tác trên trình duyệt: cách chạy, đọc code sinh ra, và quan trọng nhất — vì sao không nên phụ thuộc hoàn toàn vào nó.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-21-codegen-trong-playwright.webp'
featured    = false
weight      = 22
categories  = ['automation']
tags        = ['automation-test', 'playwright', 'codegen']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

**Codegen** là công cụ tự sinh code test của Playwright: bạn thao tác trên trình duyệt, nó ghi lại thành code. Đây là công cụ tuyệt vời để học cách viết locator và tăng tốc, nhưng cũng dễ bị lạm dụng. Bài này khép Giai đoạn 3 bằng cả hai mặt: dùng nó hiệu quả, và hiểu giới hạn.

## Chạy Codegen

```bash
npx playwright codegen https://playwright.dev
```

Lệnh mở hai cửa sổ: một trình duyệt và một **Playwright Inspector**. Mỗi thao tác bạn làm trên trình duyệt (click, điền, chọn) được ghi ngay thành code trong Inspector, theo thời gian thực.

Chạy không kèm URL để bắt đầu từ trang trắng:

```bash
npx playwright codegen
```

## Đọc code Codegen sinh ra

Ví dụ, thao tác điền form đăng nhập sinh ra code đại loại:

```javascript
await page.goto('https://demo.playwright.dev/login');
await page.getByLabel('Email').fill('test@demo.com');
await page.getByLabel('Password').fill('Test@1234');
await page.getByRole('button', { name: 'Sign in' }).click();
```

Để ý điều quan trọng: Codegen **ưu tiên đúng các locator ngữ nghĩa** đã học ở [Bài 18](../locator-trong-playwright/) — `getByLabel`, `getByRole` — thay vì CSS selector. Vì vậy nó là công cụ học locator rất tốt: quan sát Codegen chọn locator nào cho mỗi phần tử giúp bạn hình thành trực giác về cách định vị bền vững.

## Sinh cả assertion

Codegen có thể ghi cả assertion. Trong thanh công cụ Inspector có các nút để chọn chế độ:

- **Record** — ghi hành động.
- **Assert visibility / text / value** — click vào chế độ này rồi chọn phần tử để sinh assertion tương ứng (`toBeVisible`, `toHaveText`, `toHaveValue`).

Nhờ đó bạn dựng nhanh một test hoàn chỉnh có cả hành động lẫn kiểm tra.

## Codegen như công cụ định vị

Ngay cả khi không dùng để sinh cả test, Codegen hữu ích để **tra nhanh locator cho một phần tử khó**: mở Codegen, di chuột lên phần tử, nó gợi ý locator tốt nhất. Nhanh hơn tự mò trong DevTools nhiều.

## Giới hạn: vì sao KHÔNG nên phụ thuộc hoàn toàn

Đây là phần quan trọng nhất của bài. Codegen là điểm **khởi đầu**, không phải sản phẩm cuối. Code nó sinh ra có các vấn đề:

- **Không có cấu trúc:** nó tuôn ra một chuỗi lệnh phẳng, không tổ chức theo AAA ([Bài 14](../thiet-ke-test-case-aaa/)), không tách hàm, không Page Object (Bài 22).
- **Assertion nghèo nàn:** nó chỉ ghi những gì bạn click, thường thiếu các kiểm tra quan trọng mà chỉ con người biết cần có.
- **Locator đôi khi chưa tối ưu:** với phần tử không có nhãn/role rõ ràng, nó rơi về locator kém bền; bạn cần sửa tay.
- **Không hiểu ý đồ test:** nó ghi lại *thao tác*, không biết *bạn đang muốn kiểm tra điều gì* và *các trường hợp lỗi* cần bao phủ.

> Cách dùng đúng của người làm nghề: dùng Codegen để **dựng khung nhanh** và **tra locator**, rồi **tự tay refactor** — đặt tên test có nghĩa, tổ chức theo AAA, thêm assertion còn thiếu, đưa vào Page Object. Ai copy nguyên xi output Codegen vào dự án sẽ có bộ test lộn xộn và khó bảo trì sau vài tháng. Công cụ hỗ trợ tư duy, không thay thế tư duy.

## Quy trình kết hợp hợp lý

1. Dùng Codegen ghi lại luồng thao tác chính → có khung code nhanh.
2. Copy vào file test, **đặt lại tên** test theo [điều kiện] thì [kết quả].
3. **Tổ chức** theo Arrange / Act / Assert.
4. **Bổ sung assertion** kiểm chứng hành vi thật và các trường hợp biên/lỗi.
5. Về sau, **trích** các thao tác lặp lại vào Page Object (Bài 22).

Giai đoạn 3 kết thúc tại đây: bạn đã định vị, thao tác, kiểm tra, debug, và biết tận dụng Codegen. [Bài 22](../page-object-model/) mở Giai đoạn 4 — kỹ thuật nâng cao, bắt đầu bằng Page Object Model để test dễ bảo trì ở quy mô lớn.

## 🛠 Thực hành

1. **Ghi một luồng:** chạy `npx playwright codegen` trên một website có form, thực hiện một luồng (vd tìm kiếm) và quan sát code sinh ra theo thời gian thực.
2. **Sinh assertion:** dùng chế độ Assert của Codegen để thêm một kiểm tra hiển thị và một kiểm tra text vào luồng trên.
3. **Refactor:** lấy code Codegen vừa sinh, tự tay tổ chức lại thành một test hoàn chỉnh: đặt tên rõ ràng, chia AAA, và thêm ít nhất một assertion mà Codegen không tự sinh.

## Website tham khảo

- [Playwright — Test generator (Codegen)](https://playwright.dev/docs/codegen) — hướng dẫn đầy đủ.
- [Playwright — Codegen intro](https://playwright.dev/docs/codegen-intro) — tổng quan cách dùng.
- [Playwright — Best Practices](https://playwright.dev/docs/best-practices) — nguyên tắc để refactor code sinh ra cho tốt.

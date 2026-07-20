+++
date        = '2024-07-01T09:15:00+07:00'
draft       = false
title       = 'Bài 18 — Locator trong Playwright: getByRole, getByText, getByLabel'
slug        = 'locator-trong-playwright'
summary     = 'Locator là cách Playwright định vị phần tử. Vì sao ưu tiên các locator theo vai trò/ngữ nghĩa (getByRole, getByText, getByLabel) hơn CSS selector, và cách xử lý khi trúng nhiều phần tử.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-18-locator-trong-playwright.webp'
featured    = false
weight      = 19
categories  = ['automation']
tags        = ['automation-test', 'playwright', 'locator']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

**Locator** là khái niệm trung tâm của Playwright: cách bạn "chỉ" cho Playwright biết phần tử nào cần thao tác. Chọn locator tốt là kỹ năng quan trọng nhất để có test **bền vững** — không vỡ mỗi khi giao diện thay đổi nhỏ. Bài này là một trong những bài đáng đầu tư nhất của Giai đoạn 3.

Ở [Bài 11](../html-va-css-selector-co-ban/) bạn học CSS selector để *đọc hiểu* trang. Playwright có hệ thống locator riêng, hiện đại hơn, và bài này giải thích vì sao nên ưu tiên nó.

## Locator là gì

Một **locator** đại diện cho một cách tìm phần tử trên trang. Điểm đặc biệt: locator có tính **lazy** (trì hoãn) và tự động chờ (**auto-wait**) — nó chỉ thực sự tìm phần tử vào lúc bạn thao tác, và tự chờ phần tử sẵn sàng.

```javascript
// Tạo locator (chưa tìm ngay)
const nutGui = page.getByRole('button', { name: 'Gửi' });

// Khi thao tác, Playwright mới tìm và tự chờ phần tử sẵn sàng
await nutGui.click();
```

Đây là lý do bạn hiếm khi phải tự viết lệnh "chờ" — cơ chế auto-wait đã lo (nhắc lại ưu điểm nêu ở [Bài 0](../automation-test-la-gi-vi-sao-chon-playwright/)).

## Vì sao ưu tiên locator theo ngữ nghĩa

Playwright **khuyến nghị** định vị phần tử theo cách người dùng *nhìn thấy và tương tác*, thay vì theo cấu trúc HTML nội bộ. Lý do:

- **Bền vững hơn:** id/class do lập trình viên đặt hay đổi khi refactor. Nhưng "nút có chữ Đăng nhập" thì ít đổi — vì nó gắn với ý nghĩa với người dùng.
- **Gần với trải nghiệm thật:** test định vị theo vai trò/nhãn phản ánh đúng cách người dùng dùng trang.
- **Kiểm tra khả năng truy cập (accessibility):** locator theo role khuyến khích HTML đúng chuẩn.

> Đây là thay đổi tư duy quan trọng so với công cụ đời cũ (vốn phụ thuộc nặng vào CSS/XPath). Quy tắc thực chiến: **ưu tiên `getByRole` trước tiên; chỉ dùng CSS selector khi không còn cách ngữ nghĩa nào.** Test dựa trên CSS/id dễ vỡ là nguyên nhân số một khiến bộ test trở nên "khó bảo trì" sau vài tháng.

## Các locator được khuyến nghị

### getByRole — định vị theo vai trò (ưu tiên số 1)

Mỗi phần tử tương tác có một **role** (vai trò): button, link, textbox, checkbox... `getByRole` định vị theo vai trò kèm tên hiển thị:

```javascript
page.getByRole('button', { name: 'Đăng nhập' });
page.getByRole('link', { name: 'Trang chủ' });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('heading', { name: 'Chào mừng' });
```

Đây nên là lựa chọn đầu tiên cho hầu hết trường hợp.

### getByText — định vị theo nội dung text

```javascript
page.getByText('Đăng nhập thành công');       // khớp một phần
page.getByText('Đăng nhập thành công', { exact: true }); // khớp chính xác
```

Dùng để tìm phần tử theo văn bản hiển thị — hữu ích cho thông báo, nhãn, đoạn text.

### getByLabel — định vị ô nhập theo nhãn

```javascript
page.getByLabel('Mật khẩu');
```

Định vị ô input qua `<label>` gắn với nó — cách tự nhiên nhất để điền form, vì đúng cách người dùng nhận biết ô nhập.

### Các locator hữu ích khác

```javascript
page.getByPlaceholder('Nhập email');   // theo placeholder
page.getByTestId('submit-btn');        // theo thuộc tính data-testid
```

`getByTestId` dùng khi lập trình viên chủ động gắn `data-testid` cho mục đích test — ổn định vì nó tồn tại riêng để test dùng.

## Khi nào dùng CSS selector

Playwright vẫn hỗ trợ CSS selector qua `page.locator()`, dùng khi không có cách ngữ nghĩa phù hợp:

```javascript
page.locator('.product-card');
page.locator('#special-element');
```

Đây là phương án cuối. Nếu buộc dùng, ưu tiên các thuộc tính ổn định (như `data-testid`) hơn class trình bày dễ đổi.

## Xử lý khi locator trúng nhiều phần tử

Playwright chạy **strict mode**: một locator thao tác phải trỏ đúng **một** phần tử. Trúng nhiều sẽ báo lỗi `strict mode violation` (đã gặp ở [Bài 17](../doc-loi-va-tu-duy-debug/)). Cách thu hẹp:

```javascript
// Lọc theo text
page.getByRole('listitem').filter({ hasText: 'Sản phẩm A' });

// Chọn theo thứ tự
page.getByRole('button', { name: 'Xóa' }).first();
page.getByRole('button', { name: 'Xóa' }).nth(1);   // phần tử thứ 2 (đếm từ 0)

// Thu hẹp theo phần tử cha
page.getByRole('row', { name: 'Đơn hàng 1' }).getByRole('button');
```

Ưu tiên **lọc theo ngữ cảnh** (text, cha) hơn là chọn theo chỉ số — chỉ số dễ vỡ khi thứ tự phần tử thay đổi.

## Kiểm tra locator trước khi dùng

Trước khi đưa vào test, xác minh locator bằng công cụ:

- `npx playwright test --ui` hoặc `--debug` — tô sáng phần tử locator trỏ tới.
- **Codegen** (Bài 21) — Playwright tự sinh locator khi bạn click trên trang, giúp học cách viết locator tốt.

[Bài 19](../cac-hanh-dong-co-ban-playwright/) dùng các locator này để thực hiện **hành động**: click, điền, chọn, upload.

## 🛠 Thực hành

1. **Ưu tiên getByRole:** trên trang [playwright.dev](https://playwright.dev), viết test định vị link "Get started" bằng `getByRole('link', ...)` và kiểm tra nó hiển thị.
2. **Nhiều loại locator:** với một form đăng nhập bất kỳ, viết locator cho ô email bằng `getByLabel`, nút submit bằng `getByRole`, và một thông báo bằng `getByText`.
3. **Thu hẹp strict mode:** tìm một trang có nhiều nút giống nhau, cố định vị chung gây `strict mode violation`, rồi sửa lại bằng `.filter()` hoặc `.first()`.

## Website tham khảo

- [Playwright — Locators](https://playwright.dev/docs/locators) — hướng dẫn đầy đủ, gồm thứ tự ưu tiên.
- [Playwright — Other locators](https://playwright.dev/docs/other-locators) — CSS, XPath và khi nào dùng.
- [Playwright — Best Practices: Locators](https://playwright.dev/docs/best-practices#use-locators) — vì sao ưu tiên locator ngữ nghĩa.

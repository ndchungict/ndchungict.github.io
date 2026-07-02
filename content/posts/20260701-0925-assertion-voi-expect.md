+++
date        = '2026-07-01T09:25:00+07:00'
draft       = false
title       = 'Bài 20 — Assertion với expect: kiểm tra nội dung và trạng thái phần tử'
slug        = 'assertion-voi-expect'
summary     = 'Viết assertion bằng expect: web-first assertions tự chờ, kiểm tra hiển thị/text/giá trị/trạng thái, phủ định với not, và vì sao web-first assertion loại bỏ test chập chờn.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-20-assertion-voi-expect.webp'
featured    = false
weight      = 21
categories  = ['automation']
tags        = ['automation-test', 'playwright', 'assertion']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

**Assertion** là phần "Assert" của test — bước khẳng định kết quả có đúng như mong đợi không. Không có assertion, test chỉ *thao tác* mà không *kiểm tra* gì, nên vô nghĩa. Playwright cung cấp hàm `expect` với các assertion tự chờ, mạnh và đáng tin. Bài này hoàn thiện bộ ba định vị – hành động – kiểm tra.

## Cú pháp expect

```javascript
await expect(locator).toBeVisible();
```

Đọc như câu tiếng Anh: *"expect (kỳ vọng) locator này toBeVisible (hiển thị)"*. Cấu trúc: `expect(đối-tượng).matcher(giá-trị-mong-đợi)`. `matcher` là loại kiểm tra (visible, có text, bằng giá trị...).

## Web-first assertion: tự chờ, hết chập chờn

Đây là điểm cốt lõi. Các assertion trên **locator** trong Playwright là **web-first**: chúng **tự động thử lại** cho tới khi điều kiện đúng hoặc hết timeout.

```javascript
// Playwright tự chờ tới khi thông báo hiện ra (trong giới hạn timeout)
await expect(page.getByText('Đăng nhập thành công')).toBeVisible();
```

Vì sao quan trọng: web hiện đại cập nhật bất đồng bộ — sau khi click, thông báo có thể xuất hiện sau vài trăm mili-giây. Assertion đời cũ kiểm tra *ngay lập tức* nên fail nếu kết quả chưa kịp có, gây **test chập chờn (flaky)**. Web-first assertion chờ giúp loại bỏ vấn đề này.

> Vì đây là thao tác chờ, assertion trên locator **luôn cần `await`**. Quên `await` khiến assertion không thực sự chạy — một lỗi âm thầm nguy hiểm vì test vẫn "pass" mà chẳng kiểm tra gì.

## Các assertion hay dùng nhất

### Trạng thái hiển thị

```javascript
await expect(locator).toBeVisible();      // đang hiển thị
await expect(locator).toBeHidden();       // đang ẩn
await expect(locator).toBeEnabled();      // cho phép tương tác
await expect(locator).toBeDisabled();     // bị vô hiệu hóa
await expect(locator).toBeChecked();      // checkbox/radio đã tick
```

### Nội dung text

```javascript
await expect(locator).toHaveText('Chào mừng');       // text đúng chính xác
await expect(locator).toContainText('Chào');         // chứa một phần
await expect(page.getByRole('list')).toHaveText(['Mục 1', 'Mục 2']); // danh sách
```

`toHaveText` khớp toàn bộ (đã tự bỏ khoảng trắng thừa hai đầu); `toContainText` khớp một phần — chọn cái phù hợp mức độ chặt chẽ mong muốn.

### Giá trị ô nhập và thuộc tính

```javascript
await expect(page.getByLabel('Email')).toHaveValue('test@demo.com');
await expect(locator).toHaveAttribute('href', '/trang-chu');
await expect(locator).toHaveClass(/active/);
```

### Kiểm tra ở cấp trang

```javascript
await expect(page).toHaveTitle(/Trang chủ/);          // tiêu đề trang
await expect(page).toHaveURL('/dashboard');           // URL hiện tại
```

### Số lượng phần tử

```javascript
await expect(page.getByRole('listitem')).toHaveCount(5);
```

## Phủ định với not

Thêm `.not` để đảo ngược kỳ vọng:

```javascript
await expect(page.getByText('Lỗi')).not.toBeVisible();   // KHÔNG hiển thị
await expect(locator).not.toHaveText('Sai');
```

## Assertion trên giá trị thường (không tự chờ)

Với giá trị JavaScript thuần (số, chuỗi, boolean) — không phải locator — `expect` hoạt động như assertion thông thường, **không tự chờ**, và **không cần `await`**:

```javascript
const tong = 3 + 5;
expect(tong).toBe(8);
expect('playwright').toContain('play');
expect([1, 2, 3]).toHaveLength(3);
```

Phân biệt: assertion trên **locator** (tự chờ, cần `await`) khác assertion trên **giá trị** (tức thì, không `await`). Nhầm lẫn ở đây là nguồn lỗi phổ biến.

## Tùy chỉnh timeout cho một assertion

Assertion web-first mặc định chờ theo timeout chung (thường 5 giây). Khi một phần tử cần chờ lâu hơn (vd trang tải chậm), tăng timeout riêng cho assertion đó:

```javascript
await expect(page.getByText('Đang xử lý xong')).toBeVisible({ timeout: 15000 });
```

Chỉ nên tăng timeout khi thật sự cần. Tăng bừa để "cho chắc" sẽ làm test chậm và che giấu vấn đề thật.

## Soft assertion: kiểm nhiều thứ mà không dừng ở lỗi đầu tiên

Mặc định, khi một assertion fail, test **dừng ngay** — các assertion sau không chạy. Đôi khi bạn muốn kiểm tra *nhiều thứ* và thấy **tất cả** cái nào fail trong một lần chạy. Dùng `expect.soft`:

```javascript
await expect.soft(page.getByRole('heading')).toHaveText('Trang chủ');
await expect.soft(page.getByText('Xin chào')).toBeVisible();
await expect.soft(page.getByRole('button', { name: 'Đăng xuất' })).toBeVisible();
// Test tiếp tục chạy dù một trong các assertion trên fail;
// cuối cùng test vẫn báo fail nếu có bất kỳ soft assertion nào không đạt.
```

Soft assertion hữu ích khi kiểm tra nhiều chi tiết độc lập trên cùng một trang (vd nhiều trường trong một form kết quả). Với các bước *bắt buộc đúng mới đi tiếp được* (như đăng nhập), vẫn dùng assertion thường để dừng sớm.

## Ví dụ hoàn chỉnh

```javascript
const { test, expect } = require('@playwright/test');

test('đăng nhập sai mật khẩu thì hiện lỗi và không chuyển trang', async ({ page }) => {
  // Arrange
  await page.goto('/login');

  // Act
  await page.getByLabel('Email').fill('test@demo.com');
  await page.getByLabel('Mật khẩu').fill('sai-mat-khau');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  // Assert
  await expect(page.getByText('Sai email hoặc mật khẩu')).toBeVisible();
  await expect(page).toHaveURL('/login');            // vẫn ở trang login
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeEnabled();
});
```

Chú ý: đây là một test **trường hợp lỗi**, đúng tinh thần "nghĩ điều gì có thể sai" ở [Bài 14](../thiet-ke-test-case-aaa/).

## Lỗi thường gặp

- **Quên `await` trước `expect` trên locator** — assertion không chạy thật, test pass giả. Luôn `await` với assertion locator.
- **Dùng `toHaveText` khi text có phần động** — nếu chỉ một phần cố định, dùng `toContainText` hoặc biểu thức chính quy `/.../ `.
- **So text bị lệch khoảng trắng** — `toHaveText` đã trim hai đầu, nhưng khoảng trắng *giữa* vẫn tính; kiểm tra kỹ chuỗi mong đợi.
- **Assert quá ít** — chỉ kiểm tra "có click được" mà không kiểm tra *kết quả*. Mỗi test nên có assertion kiểm chứng hành vi thực sự.

[Bài 21](../codegen-playwright/) giới thiệu **Codegen** — công cụ tự sinh code test khi bạn thao tác trên trang, và giới hạn của nó.

## 🛠 Thực hành

1. **Bộ assertion cơ bản:** viết test mở một trang và kiểm tra: tiêu đề trang (`toHaveTitle`), một nút hiển thị (`toBeVisible`), và một link có đúng `href` (`toHaveAttribute`).
2. **Trường hợp phủ định:** viết test xác nhận một thông báo lỗi `not.toBeVisible()` khi trang vừa tải (chưa có lỗi).
3. **Phân biệt hai loại expect:** trong cùng file, viết một assertion trên locator (có `await`) và một assertion trên giá trị số (không `await`), giải thích khác biệt.
4. **Soft assertion:** viết một test dùng ba `expect.soft` trên một trang, cố ý cho một cái sai, và xác nhận hai cái còn lại vẫn được kiểm tra (test vẫn báo fail cuối cùng).

## Website tham khảo

- [Playwright — Assertions](https://playwright.dev/docs/test-assertions) — danh sách đầy đủ matcher.
- [Playwright — Web-first assertions](https://playwright.dev/docs/best-practices#use-web-first-assertions) — vì sao chúng loại bỏ flakiness.
- [Playwright — expect API](https://playwright.dev/docs/api/class-locatorassertions) — tham chiếu assertion trên locator.

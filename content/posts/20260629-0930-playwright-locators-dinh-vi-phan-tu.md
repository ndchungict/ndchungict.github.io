+++
date        = '2026-06-29T09:30:00+07:00'
draft       = false
title       = 'Locators — chiến lược định vị phần tử hiện đại'
slug        = 'playwright-locators-dinh-vi-phan-tu'
summary     = 'Locator là khái niệm trung tâm của Playwright. Học cách dùng getByRole, getByLabel, getByTestId, chuỗi/lọc locator, xử lý nhiều phần tử và vì sao locator lại chống flaky tốt hơn selector truyền thống.'
thumbnail   = '/images/playwright-series/playwright-bai-04-locators.webp'
featured    = false
weight      = 4
categories  = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Nếu chỉ được học **một** khái niệm Playwright thật kỹ, hãy chọn **Locator**. Locator quyết định test của bạn ổn định hay flaky, dễ đọc hay rối rắm. Bài này trình bày triết lý định vị phần tử của Playwright và bộ API đầy đủ.

## Locator khác gì element handle?

Trong Selenium, `findElement` trả về một tham chiếu tới phần tử **tại thời điểm đó**. Nếu DOM render lại, tham chiếu cũ "chết" → `StaleElementReferenceException`.

Locator của Playwright thì khác: nó là một **mô tả về cách tìm phần tử**, chứ chưa tìm ngay. Phần tử chỉ được "resolve" lại **mỗi khi bạn thao tác**. Nhờ vậy không bao giờ bị stale:

```ts
const btn = page.getByRole('button', { name: 'Lưu' });
// btn chỉ là "công thức tìm", chưa truy DOM
await btn.click();   // tới đây mới tìm phần tử trong DOM hiện tại
```

## Triết lý: định vị theo cách người dùng nhìn thấy

Playwright khuyến khích định vị theo **vai trò (role) và nội dung mà người dùng cảm nhận**, thay vì bám vào CSS/XPath dễ vỡ. Thứ tự ưu tiên khuyến nghị:

```
1. getByRole       ← ưu tiên cao nhất (accessibility)
2. getByLabel      ← form fields
3. getByPlaceholder
4. getByText
5. getByAltText / getByTitle
6. getByTestId     ← khi không có cách ngữ nghĩa nào
--- (hạn chế) ---
7. CSS / XPath     ← chỉ khi bất đắc dĩ
```

### `getByRole` — vũ khí chính

```ts
page.getByRole('button', { name: 'Đăng nhập' });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('heading', { name: 'Trang chủ', level: 1 });
page.getByRole('checkbox', { name: 'Ghi nhớ tôi' });
page.getByRole('link', { name: 'Quên mật khẩu' });
```

Vì sao tốt? Vì nó gắn với **accessibility tree** — đúng thứ trình đọc màn hình thấy. Test theo role vừa ổn định, vừa gián tiếp kiểm tra app của bạn có accessible hay không.

### `getByLabel`, `getByPlaceholder` — cho form

```ts
await page.getByLabel('Mật khẩu').fill('secret');
await page.getByPlaceholder('nhập email của bạn').fill('a@b.com');
```

### `getByText` — theo nội dung

```ts
page.getByText('Chào mừng trở lại');           // khớp một phần (mặc định)
page.getByText('Đăng xuất', { exact: true });  // khớp chính xác
page.getByText(/đơn hàng #\d+/);                // regex
```

### `getByTestId` — khi không có cách ngữ nghĩa

Khi UI không có role/label rõ ràng (ví dụ một `div` thuần), thêm `data-testid` vào code app:

```html
<div data-testid="cart-total">1.250.000đ</div>
```

```ts
await expect(page.getByTestId('cart-total')).toHaveText('1.250.000đ');
```

> `testId` ổn định hơn CSS class (vốn hay đổi theo styling). Có thể đổi tên attribute qua config: `use: { testIdAttribute: 'data-qa' }`.

## Khi nào vẫn dùng CSS/XPath?

Locator CSS vẫn có chỗ đứng cho các trường hợp đặc thù, nhưng nên là lựa chọn cuối:

```ts
page.locator('css=.product-card');
page.locator('#submit');
page.locator('xpath=//div[@class="row"]');
```

Tránh selector dài, bám cấu trúc sâu (`div > div > span:nth-child(3)`) — chúng vỡ ngay khi UI đổi nhẹ.

## Chuỗi và lọc locator

Sức mạnh thật sự đến khi **kết hợp** locator để thu hẹp phạm vi.

```ts
// Chuỗi: tìm trong phạm vi một phần tử cha
const card = page.getByRole('listitem').filter({ hasText: 'iPhone 16' });
await card.getByRole('button', { name: 'Thêm vào giỏ' }).click();

// filter theo locator con
page.getByRole('listitem').filter({
  has: page.getByRole('img', { name: 'sale' }),
});

// loại trừ
page.getByRole('listitem').filter({ hasNotText: 'Hết hàng' });
```

`filter` là cách "Playwright-thuần" để xử lý danh sách — sạch hơn nhiều so với XPath phức tạp.

## Xử lý nhiều phần tử

Khi một locator khớp nhiều phần tử:

```ts
const items = page.getByRole('listitem');

await expect(items).toHaveCount(5);   // assertion theo số lượng

// Chọn theo vị trí
await items.first().click();
await items.last().click();
await items.nth(2).click();

// Duyệt tất cả
for (const item of await items.all()) {
  await expect(item).toBeVisible();
}

// Lấy toàn bộ text
const texts = await items.allTextContents();
```

> Nếu locator khớp **nhiều hơn một** phần tử mà bạn lại gọi `.click()`, Playwright sẽ **báo lỗi strictness** thay vì âm thầm click phần tử đầu — buộc bạn viết locator chính xác. Đây là tính năng, không phải bug.

## Locator strictness — vì sao mặc định nghiêm ngặt

```ts
// ❌ Nếu có 3 nút "Xóa" trên trang → lỗi: "strict mode violation"
await page.getByRole('button', { name: 'Xóa' }).click();

// ✅ Thu hẹp phạm vi cho rõ ràng
await page.getByRole('listitem')
  .filter({ hasText: 'Sản phẩm A' })
  .getByRole('button', { name: 'Xóa' })
  .click();
```

## Mẹo: dùng Codegen để khám phá locator

Không chắc nên dùng locator nào? Để Playwright gợi ý:

```bash
npx playwright codegen https://example.com
```

Click vào trang, Playwright sinh ra locator theo đúng thứ tự ưu tiên ở trên. Rất hữu ích để học và để bắt đầu nhanh (ta sẽ nói kỹ ở bài Debugging).

## Tóm tắt

- **Locator là "công thức tìm phần tử"**, resolve lại mỗi lần thao tác → không bao giờ stale.
- Ưu tiên định vị theo ngữ nghĩa: `getByRole` → `getByLabel` → `getByText` → `getByTestId`; CSS/XPath là cuối cùng.
- `filter` + chuỗi locator là cách xử lý danh sách sạch sẽ, thay cho XPath rối rắm.
- **Strict mode** buộc locator phải khớp đúng một phần tử — viết locator chính xác ngay từ đầu để test ổn định.

---

**Bài trước**: [← Playwright Test Runner: test, expect, hooks và annotations](/posts/playwright-test-runner-test-expect-hooks/)

**Bài tiếp theo**: [Actions, Auto-waiting và Web-first Assertions →](/posts/actions-auto-waiting-web-first-assertions/)

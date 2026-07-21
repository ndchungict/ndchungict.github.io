+++
date        = '2024-07-01T09:55:00+07:00'
draft       = false
title       = 'Bài 26 — Lưu trạng thái đăng nhập (authentication state)'
slug        = 'authentication-state'
summary     = 'Đăng nhập một lần rồi tái sử dụng cho mọi test bằng storageState và setup project. Tăng tốc bộ test đáng kể và giữ các test vẫn độc lập.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-26-authentication-state.webp'
featured    = false
weight      = 27
columns     = 2
categories  = ['it']
subcategories = ['qa-testing']
tags        = ['automation-test', 'playwright', 'authentication']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Hầu hết ứng dụng yêu cầu đăng nhập trước khi làm gì. Nếu **mỗi** test phải đăng nhập lại từ đầu, bộ test sẽ chậm khủng khiếp và lặp lại vô nghĩa. Bài này giải quyết bằng kỹ thuật chuẩn: đăng nhập **một lần**, lưu trạng thái, rồi tái sử dụng cho mọi test.

## Vấn đề: đăng nhập lặp lại

```javascript
// Lặp trong MỌI test — chậm và thừa
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.EMAIL);
  await page.getByLabel('Mật khẩu').fill(process.env.PASSWORD);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
});
```

Với 100 test, bạn đăng nhập 100 lần — mỗi lần vài giây, cộng lại là nhiều phút lãng phí. Đăng nhập không phải thứ ta muốn kiểm tra trong *mọi* test; ta chỉ cần *đã đăng nhập*.

## Giải pháp: storageState

Khi đăng nhập, trình duyệt lưu thông tin phiên (cookie, local storage). Playwright cho phép **xuất** trạng thái này ra file và **nạp** lại cho các test khác — bỏ qua bước đăng nhập UI hoàn toàn.

**storageState** là ảnh chụp cookie + storage của một context, lưu dưới dạng file JSON.

## Bước 1 — Tạo setup project để đăng nhập một lần

Cách khuyến nghị hiện nay là dùng một **setup project** chạy trước, thực hiện đăng nhập và lưu state. Tạo file `auth.setup.js`:

```javascript
// auth.setup.js
const { test: setup, expect } = require('@playwright/test');

const authFile = 'playwright/.auth/user.json';

setup('đăng nhập', async ({ page }) => {
  // Thực hiện đăng nhập một lần
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL);
  await page.getByLabel('Mật khẩu').fill(process.env.ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  // Chờ đăng nhập xong (một dấu hiệu chắc chắn)
  await expect(page.getByRole('button', { name: 'Đăng xuất' })).toBeVisible();

  // Lưu trạng thái đăng nhập ra file
  await page.context().storageState({ path: authFile });
});
```

## Bước 2 — Cấu hình project dùng state

Trong `playwright.config.js`, khai báo project setup và cho các project test dùng state đã lưu:

```javascript
module.exports = defineConfig({
  projects: [
    // Project setup — chạy trước, thực hiện đăng nhập
    { name: 'setup', testMatch: /.*\.setup\.js/ },

    // Project test — nạp state đã lưu, phụ thuộc setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',   // nạp trạng thái đăng nhập
      },
      dependencies: ['setup'],   // chạy sau khi setup xong
    },
  ],
});
```

- `dependencies: ['setup']` buộc project `setup` chạy xong trước.
- `storageState` nạp file state cho mọi test trong project — chúng khởi động ở trạng thái **đã đăng nhập**.

## Bước 3 — Test không cần đăng nhập nữa

```javascript
test('xem trang dashboard', async ({ page }) => {
  await page.goto('/dashboard');   // đã đăng nhập sẵn — vào thẳng
  await expect(page.getByRole('heading', { name: 'Bảng điều khiển' })).toBeVisible();
});
```

Test đi thẳng vào chức năng cần kiểm tra, không tốn bước login. Bộ test chạy nhanh hơn rõ rệt.

## Không commit file auth

File state chứa thông tin phiên nhạy cảm. Thêm vào `.gitignore` (nhắc lại [Bài 3](../git-github-co-ban/), [Bài 24](../test-data-va-bien-moi-truong/)):

```text
playwright/.auth/
```

## Tính độc lập vẫn được giữ

Điểm quan trọng: kỹ thuật này **không** phá vỡ tính độc lập ([Bài 14](../thiet-ke-test-case-aaa/)). Mỗi test vẫn nhận một context mới, chỉ là context đó được nạp sẵn cookie đăng nhập. Các test không chia sẻ trạng thái *runtime* với nhau — chúng chỉ cùng khởi đầu từ một điểm "đã đăng nhập".

> Đây là một trong những tối ưu có giá trị nhất cho bộ test thật. Nhưng lưu ý: nếu bạn *đang kiểm tra chính chức năng đăng nhập*, thì test đó phải làm login qua UI thật (không dùng state). storageState dành cho các test *cần đã đăng nhập để làm việc khác*, không phải để test bản thân việc đăng nhập.

## Nhiều vai trò người dùng

Khi cần test với nhiều vai trò (admin, user thường), tạo nhiều file state — mỗi vai trò một setup và một file, rồi project tương ứng nạp file phù hợp. Cách tổ chức tương tự, chỉ nhân bản theo vai trò.

[Bài 27](../api-mocking-va-intercept/) học cách can thiệp vào network: mock API và chặn/sửa request để kiểm soát dữ liệu test.

## 🛠 Thực hành

1. **Tạo setup đăng nhập:** với một ứng dụng có đăng nhập, viết `auth.setup.js` đăng nhập và lưu `storageState`.
2. **Cấu hình dependencies:** thêm project `setup` và cho project test nạp state với `dependencies`. Xác nhận test vào thẳng trang cần đăng nhập mà không login lại.
3. **So sánh tốc độ:** đo thời gian chạy một nhóm test khi mỗi test tự login so với khi dùng storageState, ghi lại khác biệt.

## Website tham khảo

- [Playwright — Authentication](https://playwright.dev/docs/auth) — hướng dẫn đầy đủ storageState và setup project.
- [Playwright — Global setup / project dependencies](https://playwright.dev/docs/test-global-setup-teardown) — cơ chế chạy setup trước.
- [Playwright — storageState API](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state) — tham chiếu.

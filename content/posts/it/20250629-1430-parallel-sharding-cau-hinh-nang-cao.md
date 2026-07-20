+++
date        = '2025-06-29T14:30:00+07:00'
draft       = false
title       = 'Parallel, sharding và cấu hình nâng cao'
slug        = 'parallel-sharding-cau-hinh-nang-cao'
summary     = 'Tăng tốc test suite lớn: cơ chế worker và fullyParallel, chạy tuần tự khi cần, sharding chia test cho nhiều máy CI, projects với dependencies, global setup/teardown và quản lý timeout/retry.'
thumbnail   = '/images/playwright-series/playwright-bai-14-parallel-sharding.webp'
featured    = false
weight      = 14
categories  = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Một suite 500 test chạy tuần tự có thể mất cả tiếng. Playwright được thiết kế để **song song hóa** từ gốc — và khi một máy không đủ, **sharding** chia việc ra nhiều máy CI. Bài này trình bày mô hình thực thi và các cấu hình nâng cao để suite chạy nhanh mà vẫn đúng.

## Mô hình thực thi: worker

Playwright chạy test trong nhiều **worker process** song song. Mỗi worker:

- Là một process Node độc lập.
- Có **BrowserContext riêng** → cách ly hoàn toàn state.
- Chạy các test được phân cho nó, lần lượt.

```ts
// playwright.config.ts
workers: process.env.CI ? 4 : '50%',  // CI: 4 worker; local: 50% số CPU
```

> Vì mỗi worker là process riêng, **không** chia sẻ biến trong bộ nhớ giữa test ở các worker khác nhau. Muốn chia sẻ dữ liệu phải qua file/DB/global setup.

## `fullyParallel` — song song cả trong một file

Mặc định, các **file** chạy song song nhưng test **trong cùng một file** chạy tuần tự. Bật `fullyParallel` để song song hóa cả test trong file:

```ts
fullyParallel: true,
```

Điều kiện để dùng được: các test phải **độc lập** — không phụ thuộc thứ tự, không dùng chung state. Đây là lý do ta luôn nhấn mạnh cách ly (context riêng, seed/cleanup riêng).

## Khi cần chạy tuần tự

Một số luồng buộc phải theo thứ tự (ví dụ: tạo → sửa → xóa cùng một bản ghi). Dùng `serial`:

```ts
test.describe.configure({ mode: 'serial' });

test.describe('luồng tuần tự', () => {
  test('tạo bản ghi', async () => { /* ... */ });
  test('sửa bản ghi', async () => { /* ... */ });  // chạy sau, nếu test trên fail thì skip
});
```

> Trong `serial`, nếu một test fail thì các test sau bị **skip**. Hạn chế dùng — nó đánh đổi tốc độ và độ độc lập. Tốt hơn là thiết kế test độc lập + seed dữ liệu riêng.

Ngược lại, ép một nhóm chạy song song dù mặc định khác:

```ts
test.describe.configure({ mode: 'parallel' });
```

## Sharding — chia test cho nhiều máy

Khi một máy đã max worker mà vẫn chậm, chia suite thành **shard** chạy trên nhiều máy CI song song:

```bash
# Máy 1
npx playwright test --shard=1/3
# Máy 2
npx playwright test --shard=2/3
# Máy 3
npx playwright test --shard=3/3
```

Mỗi shard chạy một phần ba số test. Trên CI, đây là cách rút thời gian từ 30 phút xuống còn ~10 phút. Sau đó **gộp report** từ các shard lại (sẽ thấy ở bài CI/CD với `blob` reporter + `merge-reports`).

## Projects nâng cao và `dependencies`

Đã gặp `projects` cho đa trình duyệt và setup auth. Vài pattern nâng cao:

```ts
projects: [
  // Setup chung chạy trước tất cả
  { name: 'setup', testMatch: /global\.setup\.ts/ },

  // Smoke test chạy trước, nếu fail thì khỏi chạy phần còn lại
  { name: 'smoke', testMatch: /.*\.smoke\.ts/, dependencies: ['setup'] },

  // Test đầy đủ phụ thuộc smoke
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    dependencies: ['setup', 'smoke'],
    teardown: 'cleanup',     // chạy project cleanup sau khi xong
  },

  // Project dọn dẹp
  { name: 'cleanup', testMatch: /global\.teardown\.ts/ },
],
```

`dependencies` tạo thứ tự thực thi giữa các project; `teardown` đảm bảo dọn dẹp chạy kể cả khi test fail.

## Global setup / teardown

Khi cần chuẩn bị/dọn dẹp **một lần cho toàn bộ** suite (không phải mỗi worker) — ví dụ seed database, khởi tạo môi trường:

```ts
// playwright.config.ts
export default defineConfig({
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
});
```

```ts
// global-setup.ts
import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // chạy MỘT lần trước toàn bộ test (cả khi sharding, mỗi shard một lần)
  await seedDatabase();
}
export default globalSetup;
```

> Lựa chọn giữa **global setup** và **setup project**: setup project hiển thị trong report, có trace, và truy cập được fixture — thường được khuyến nghị hơn cho việc đăng nhập/seed. Dùng global setup cho việc thuần "hạ tầng" không cần trình duyệt.

## Timeout và retry — các tầng

Playwright có nhiều tầng timeout, hiểu rõ để khỏi nhầm:

| Loại | Cấu hình | Mặc định |
|---|---|---|
| Toàn bộ một test | `timeout` | 30s |
| Một assertion `expect` | `expect.timeout` | 5s |
| Một action (click...) | `use.actionTimeout` | không giới hạn |
| Điều hướng | `use.navigationTimeout` | không giới hạn |
| Cả suite (global) | `globalTimeout` | không giới hạn |

```ts
export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: { actionTimeout: 15_000, navigationTimeout: 30_000 },
  retries: process.env.CI ? 2 : 0,
});
```

**Retry**: để `0` ở local (lộ flaky ngay), bật `2` trên CI (chống nhiễu hạ tầng). Test phải **idempotent** để retry an toàn — đây lại là lý do cần seed/cleanup sạch.

## Tóm tắt

- Playwright song song qua **worker process** cách ly; bật **`fullyParallel`** khi test thực sự độc lập.
- **`serial`** chỉ dùng khi buộc theo thứ tự — đánh đổi tốc độ; ưu tiên thiết kế test độc lập.
- **Sharding** (`--shard=i/n`) chia test cho nhiều máy CI để rút thời gian, sau đó gộp report.
- Dùng **projects + `dependencies`/`teardown`**, hiểu các **tầng timeout**, và bật **retry** trên CI cho test idempotent.

---

**Bài trước**: [← Debugging: Trace Viewer, Codegen và UI Mode](/posts/debugging-trace-viewer-codegen-ui-mode/)

**Bài tiếp theo**: [Playwright trong CI/CD với GitHub Actions và Docker →](/posts/playwright-ci-cd-github-actions-docker/)

+++
date        = '2025-06-29T15:00:00+07:00'
draft       = false
title       = 'Playwright trong CI/CD với GitHub Actions và Docker'
slug        = 'playwright-ci-cd-github-actions-docker'
summary     = 'Đưa Playwright lên CI: workflow GitHub Actions hoàn chỉnh, chạy với Docker image chính thức, sharding song song nhiều máy, gộp report với blob, lưu artifact trace/screenshot và các reporter.'
thumbnail   = '/images/playwright-series/playwright-bai-15-ci-cd-github-actions-docker.webp'
featured    = false
weight      = 15
categories  = ['automation']
tags        = ['playwright', 'test', 'e2e', 'testing', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Test chỉ thực sự có giá trị khi chạy **tự động** ở mỗi pull request và mỗi lần deploy. Bài này dựng một pipeline Playwright hoàn chỉnh trên **GitHub Actions**: từ workflow cơ bản, chạy trong Docker, đến sharding nhiều máy và gộp report — đúng cách một team nghiêm túc vận hành.

## Workflow GitHub Actions cơ bản

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      # Cài trình duyệt + dependency hệ thống
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
      # Lưu report kể cả khi test fail
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

Vài điểm quan trọng:

- **`npm ci`** (không phải `npm install`) — cài đúng theo lockfile, nhanh và ổn định trên CI.
- **`--with-deps`** cài cả thư viện hệ thống mà trình duyệt cần.
- **`if: ${{ !cancelled() }}`** trên bước upload — luôn lưu report cả khi test fail (đây mới là lúc bạn cần report nhất).

## Chạy bằng Docker image chính thức

Để render **nhất quán** (đặc biệt cho visual test) và bỏ qua bước cài dependency hệ thống, dùng image Playwright chính thức:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.50.0-noble   # khớp ĐÚNG version Playwright
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright test    # trình duyệt đã có sẵn trong image
```

> **Khớp version**: tag image phải trùng version `@playwright/test` trong `package.json`. Lệch version → trình duyệt và API không tương thích. Đây cũng là image bạn nên dùng để **tạo baseline visual** ở local (`docker run`), đảm bảo ảnh khớp với CI.

## Cấu hình config cho CI

Nhắc lại từ các bài trước, gom vào một chỗ:

```ts
export default defineConfig({
  forbidOnly: !!process.env.CI,          // chặn test.only lọt lên CI
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI
    ? [['blob'], ['github']]             // blob để gộp shard; github để annotate PR
    : [['html'], ['list']],
  use: { trace: 'on-first-retry', screenshot: 'only-on-failure' },
});
```

Reporter `github` tự gắn annotation lỗi vào đúng dòng code trong PR — rất tiện khi review.

## Sharding nhiều máy + gộp report

Đây là cấu hình "production": chia test cho 3 máy chạy song song rồi gộp report thành một.

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.50.0-noble
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright test --shard=${{ matrix.shard }}/3
      # Mỗi shard lưu report dạng blob
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: blob-report-${{ matrix.shard }}
          path: blob-report/
          retention-days: 1

  merge-report:
    needs: [test]
    runs-on: ubuntu-latest
    if: ${{ !cancelled() }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      # Tải tất cả blob về một thư mục
      - uses: actions/download-artifact@v4
        with:
          path: all-blobs
          pattern: blob-report-*
          merge-multiple: true
      # Gộp thành một report HTML duy nhất
      - run: npx playwright merge-reports --reporter=html ./all-blobs
      - uses: actions/upload-artifact@v4
        with:
          name: html-report
          path: playwright-report/
```

`blob` reporter sinh report trung gian từ mỗi shard; `merge-reports` ghép lại thành **một** report HTML hoàn chỉnh — bạn xem toàn bộ kết quả ở một nơi dù test chạy trên 3 máy.

## Các loại reporter

| Reporter | Dùng cho |
|---|---|
| `list` / `line` / `dot` | Theo dõi trên terminal |
| `html` | Report tương tác, kèm trace (mở bằng `show-report`) |
| `github` | Annotation lỗi ngay trong PR GitHub |
| `blob` | Trung gian để `merge-reports` khi sharding |
| `junit` | Tích hợp hệ thống CI/test management (XML) |
| `json` | Xử lý/chuyển đổi tùy biến |

```ts
reporter: [
  ['html', { open: 'never' }],
  ['junit', { outputFile: 'results/junit.xml' }],
],
```

## Caching để CI nhanh hơn

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm                 # cache node_modules theo lockfile
# (Với Docker image official thì không cần cache browser)
```

Khi không dùng Docker image, có thể cache cả browser binary theo version để khỏi tải lại mỗi lần.

## Tích hợp với deploy

Pattern thường gặp: test E2E là **cổng** trước khi deploy.

```yaml
deploy:
  needs: [test]        # chỉ deploy khi test xanh
  runs-on: ubuntu-latest
  steps:
    - run: echo "Deploy production..."
```

Hoặc chạy smoke test **sau** khi deploy lên staging với `BASE_URL` trỏ tới môi trường thật.

## Tóm tắt

- Workflow tối thiểu: `npm ci` → `playwright install --with-deps` → `playwright test`, luôn **upload report** kể cả khi fail.
- Dùng **Docker image chính thức** khớp đúng version để render nhất quán (quan trọng cho visual test).
- **Sharding qua matrix** + `blob` reporter + `merge-reports` để chạy song song nhiều máy và gộp về một report.
- Bật `forbidOnly`, `retries`, reporter `github` trên CI; đặt E2E làm **cổng** trước khi deploy.

---

**Bài trước**: [← Parallel, sharding và cấu hình nâng cao](/posts/parallel-sharding-cau-hinh-nang-cao/)

**Bài tiếp theo**: [Best practices và chiến lược test thực chiến →](/posts/best-practices-chien-luoc-test-thuc-chien/)

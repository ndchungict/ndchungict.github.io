+++
date        = '2024-07-01T10:15:00+07:00'
draft       = false
title       = 'Bài 30 — Tích hợp CI/CD cơ bản với GitHub Actions'
slug        = 'ci-cd-github-actions'
summary     = 'Chạy Playwright test tự động trên GitHub Actions mỗi khi push hoặc mở pull request: hiểu CI/CD, viết workflow YAML, và lưu HTML report làm artifact để xem kết quả.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-30-ci-cd-voi-github-actions.webp'
featured    = false
weight      = 31
columns     = 2
categories  = ['it']
subcategories = ['qa-testing']
tags        = ['automation-test', 'playwright', 'ci-cd', 'github-actions']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Test tự động chỉ phát huy hết giá trị khi nó **tự chạy** — mỗi lần code thay đổi, không cần ai bấm tay. Đây là vai trò của **CI/CD**. Bài này cấu hình **GitHub Actions** để chạy Playwright test tự động mỗi khi push hoặc mở pull request. Đây là mảnh ghép biến bộ test thành công cụ bảo vệ chất lượng thật sự.

Kiến thức nền: Git/GitHub, push, pull request ([Bài 3](../git-github-co-ban/)).

## CI/CD là gì

- **CI (Continuous Integration — tích hợp liên tục):** mỗi thay đổi code được tự động build và **test** ngay khi tích hợp vào repo chung. Mục tiêu: phát hiện lỗi sớm, ngay khi vừa gây ra.
- **CD (Continuous Delivery/Deployment):** tự động đưa code đã qua test tới môi trường tiếp theo (staging, production).

Với automation test, phần quan trọng là **CI**: mỗi push/PR tự chạy toàn bộ test. Nếu test fail, cả team biết ngay và code lỗi không được merge.

**GitHub Actions** là dịch vụ CI/CD tích hợp sẵn trong GitHub — miễn phí cho mức dùng cơ bản, cấu hình bằng file YAML trong repo.

## Cách hoạt động

GitHub Actions chạy dựa trên **workflow** — file cấu hình đặt trong `.github/workflows/`. Mỗi workflow định nghĩa:

- **Trigger (khi nào chạy):** push, pull request, theo lịch...
- **Job (việc cần làm):** chạy trên một máy ảo (runner) do GitHub cấp.
- **Step (các bước):** checkout code, cài dependency, chạy test...

## File workflow cho Playwright

Nếu ở [Bài 15](../cai-dat-playwright-test-dau-tien/) bạn chọn thêm GitHub Actions khi khởi tạo, file này đã có sẵn. Nếu chưa, tạo `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

# Trigger: chạy khi push hoặc mở PR vào nhánh main
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest      # máy ảo Linux do GitHub cấp
    steps:
      - uses: actions/checkout@v4          # lấy code về runner

      - uses: actions/setup-node@v4        # cài Node.js
        with:
          node-version: 20

      - name: Cài dependency
        run: npm ci                        # cài đúng theo package-lock

      - name: Cài trình duyệt Playwright
        run: npx playwright install --with-deps

      - name: Chạy test
        run: npx playwright test

      - name: Lưu báo cáo
        if: ${{ !cancelled() }}            # lưu cả khi test fail
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

Giải thích các bước quan trọng:

- `on:` — định nghĩa trigger: chạy mỗi push và mỗi PR vào `main`.
- `runs-on: ubuntu-latest` — máy ảo Linux.
- `actions/checkout` — tải code repo về runner.
- `npm ci` — cài dependency chính xác theo `package-lock.json` (đáng tin hơn `npm install` cho CI).
- `npx playwright install --with-deps` — tải trình duyệt kèm thư viện hệ thống.
- `npx playwright test` — chạy test. Nếu có test fail, bước này báo lỗi và job fail.
- `upload-artifact` — lưu HTML report để tải về xem (vì runner là máy ảo, xóa sau khi chạy).

## Đưa lên và xem kết quả

Commit file workflow và push ([Bài 3](../git-github-co-ban/)):

```bash
git add .github/workflows/playwright.yml
git commit -m "Them CI chay Playwright test"
git push
```

Vào repo trên GitHub, tab **Actions** — bạn thấy workflow đang chạy. Nhấp vào để xem log từng bước theo thời gian thực. Khi xong:

- **Dấu tích xanh** — mọi test pass.
- **Dấu X đỏ** — có test fail; mở log để xem chi tiết, tải artifact `playwright-report` về xem HTML report.

## Test trên pull request

Nhờ trigger `pull_request`, mỗi PR sẽ tự chạy test và hiển thị trạng thái ngay trên PR. Đây là hiện thực của quy trình đã nhắc ở [Bài 3](../git-github-co-ban/): **code chỉ được merge khi test pass**. Có thể cấu hình branch protection để *chặn* merge nếu CI fail — thực hành chuẩn của mọi team chuyên nghiệp.

## Tăng tốc CI với sharding

Với bộ test lớn, dùng sharding ([Bài 28](../chay-song-song-report-debug/)) chia test qua nhiều runner song song. GitHub Actions hỗ trợ chạy ma trận (matrix) nhiều job cùng lúc — mỗi job một shard, rút ngắn thời gian đáng kể.

> Có CI là bước ngoặt: từ đây bộ test không còn là thứ "thỉnh thoảng chạy ở máy mình", mà là **hàng rào chất lượng tự động** cho cả team. Đây cũng chính là thứ khiến automation test thực sự có giá trị trong quy trình phát triển — và là điểm sáng lớn trong portfolio của bạn.

[Bài 31](../visual-regression-testing/) khép Giai đoạn 5 với visual regression testing — phát hiện thay đổi giao diện ngoài ý muốn.

## 🛠 Thực hành

1. **Tạo workflow:** thêm `.github/workflows/playwright.yml` vào dự án Playwright của bạn, push lên GitHub và xem nó chạy trong tab Actions.
2. **Xem artifact:** cố ý để một test fail, push, và tải artifact `playwright-report` về, mở HTML report xem chi tiết.
3. **Test trên PR:** tạo một nhánh, sửa code, mở pull request và quan sát CI tự chạy hiển thị trạng thái pass/fail ngay trên PR.

## Website tham khảo

- [Playwright — Continuous Integration](https://playwright.dev/docs/ci) — cấu hình CI cho nhiều nền tảng.
- [Playwright — GitHub Actions](https://playwright.dev/docs/ci-intro) — hướng dẫn chuyên cho GitHub Actions.
- [GitHub Actions — Tài liệu chính thức](https://docs.github.com/en/actions) — nền tảng về workflow, job, step.

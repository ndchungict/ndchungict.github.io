+++
date        = '2024-07-01T10:30:00+07:00'
draft       = false
title       = 'Bài 33 — Hoàn thiện CI pipeline và đưa project lên GitHub làm portfolio'
slug        = 'hoan-thien-ci-pipeline-portfolio'
summary     = 'Hoàn thiện project: cấu hình CI chạy tự động, viết README chuyên nghiệp, công bố HTML report, và trình bày repo sao cho nhà tuyển dụng thấy được năng lực automation của bạn.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-33-hoan-thien-ci-pipeline-portfolio.webp'
featured    = false
weight      = 34
categories  = ['it']
subcategories = ['qa-testing']
tags        = ['automation-test', 'playwright', 'portfolio', 'ci-cd']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Project ở [Bài 32](../xay-dung-test-suite-hoan-chinh/) đã chạy tốt trên máy bạn. Bài này biến nó thành một **portfolio** thực thụ: chạy tự động trên CI, có tài liệu rõ ràng, trình bày chuyên nghiệp. Với người mới đi xin việc automation, một repo GitHub được đầu tư tốt có sức thuyết phục hơn nhiều so với dòng "biết Playwright" trong CV.

## Vì sao portfolio quan trọng

Nhà tuyển dụng automation muốn thấy bằng chứng bạn *làm được*, không chỉ *biết*. Một repo tốt cho họ thấy: bạn tổ chức code thế nào, viết test có sạch không, có hiểu CI/CD không, có tư duy testing không. Đây là thứ khác biệt giữa các ứng viên cùng "mới ra nghề".

## Bước 1 — Đưa project lên GitHub

Áp dụng Git đã học ([Bài 3](../git-github-co-ban/)):

```bash
git init
git add .
git commit -m "Bo test automation cho e-commerce demo"
git branch -M main
git remote add origin https://github.com/<tai-khoan>/ecommerce-tests.git
git push -u origin main
```

Kiểm tra `.gitignore` **trước khi push**: `node_modules/`, `.env`, `playwright-report/`, `test-results/`, `playwright/.auth/` đều phải bị loại (nhắc lại [Bài 24](../test-data-va-bien-moi-truong/), [Bài 26](../authentication-state/)). Lộ `.env` lên repo công khai là lỗi tệ nhất về hình ảnh chuyên môn.

## Bước 2 — Hoàn thiện CI pipeline

Đảm bảo workflow GitHub Actions ([Bài 30](../ci-cd-github-actions/)) chạy ổn định. Nâng cấp đáng cân nhắc cho portfolio:

```yaml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

Sau khi CI chạy xanh, thêm **status badge** vào README để hiển thị trạng thái test ngay đầu repo — chi tiết nhỏ nhưng tạo ấn tượng chuyên nghiệp.

## Bước 3 — Viết README chuyên nghiệp

README là thứ nhà tuyển dụng đọc **đầu tiên**. Một README tốt nên có:

```markdown
# E-commerce Automation Tests

Bộ test tự động cho [saucedemo.com] viết bằng Playwright, minh họa
kiến trúc test chuyên nghiệp: Page Object Model, data-driven, CI/CD.

![CI](https://github.com/<tai-khoan>/ecommerce-tests/actions/workflows/playwright.yml/badge.svg)

## Công nghệ
- Playwright (JavaScript)
- GitHub Actions (CI)

## Phạm vi test
- Đăng nhập (gồm các trường hợp lỗi)
- Danh sách & sắp xếp sản phẩm
- Giỏ hàng (thêm/xóa)
- Thanh toán end-to-end

## Kiến trúc
- `pages/` — Page Object Model
- `tests/` — test theo luồng nghiệp vụ
- `data/`  — dữ liệu test tách riêng

## Chạy thử
\`\`\`bash
npm ci
npx playwright install
npx playwright test
\`\`\`
```

Điểm mấu chốt: README phải cho người đọc hiểu **bạn test cái gì**, **tổ chức thế nào**, và **chạy ra sao** — trong vài chục giây.

## Bước 4 — Công bố HTML report (tùy chọn nâng cao)

Gây ấn tượng hơn nữa: xuất bản HTML report lên **GitHub Pages** để nhà tuyển dụng xem kết quả trực tiếp trên web, không cần tải artifact. Playwright và GitHub Actions hỗ trợ deploy report lên Pages qua vài bước cấu hình. Đây là điểm cộng cho thấy bạn nắm cả khâu công bố kết quả.

## Bước 5 — Trình bày để gây ấn tượng

Vài chi tiết nhỏ tạo khác biệt lớn:

- **Commit history sạch** — commit message rõ ràng, có ý nghĩa ([Bài 3](../git-github-co-ban/)). Nhà tuyển dụng có xem lịch sử commit.
- **Code nhất quán** — đặt tên thống nhất, cấu trúc gọn, không để code chết/comment thừa.
- **Không có secret** — kiểm tra kỹ không lộ mật khẩu, token.
- **Test thật sự pass** — badge xanh phải là xanh thật; đừng để repo có test fail.
- **Có cả trường hợp lỗi** — cho thấy bạn nghĩ tới "điều gì có thể sai", không chỉ happy path.

> Một sự thật từ góc nhìn tuyển dụng: giữa hai ứng viên mới, người có một repo automation *chỉn chu, chạy được, tổ chức tốt* gần như luôn thắng người chỉ liệt kê kỹ năng trên giấy. Repo này là bằng chứng sống. Đầu tư cho nó xứng đáng — nó làm việc thay bạn trong mọi buổi phỏng vấn.

Chỉ còn một bài nữa. [Bài 34](../tong-ket-lo-trinh/) tổng kết toàn bộ hành trình và vạch hướng đi tiếp cho sự nghiệp automation của bạn.

## 🛠 Thực hành

1. **Public hóa project:** đẩy project ở Bài 32 lên GitHub, kiểm tra kỹ `.gitignore` không để lộ secret, và xác nhận CI chạy xanh.
2. **Viết README:** soạn README chuyên nghiệp theo mẫu trên, gồm status badge, phạm vi test, kiến trúc, và hướng dẫn chạy.
3. **Rà soát portfolio:** tự đánh giá repo theo checklist ở Bước 5, sửa mọi điểm chưa đạt (commit lộn xộn, test flaky, code thừa).

## Website tham khảo

- [Playwright — Continuous Integration](https://playwright.dev/docs/ci) — hoàn thiện pipeline.
- [GitHub — Publishing HTML report to Pages](https://playwright.dev/docs/ci#publishing-report-on-the-web) — công bố report.
- [GitHub Docs — About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) — viết README hiệu quả.

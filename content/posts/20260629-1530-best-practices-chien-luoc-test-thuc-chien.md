+++
date        = '2026-06-29T15:30:00+07:00'
draft       = false
title       = 'Best practices và chiến lược test thực chiến'
slug        = 'best-practices-chien-luoc-test-thuc-chien'
summary     = 'Bài tổng kết series: nguyên tắc viết test ổn định và dễ bảo trì, chiến lược test pyramid/trophy, chống flaky test, quản lý dữ liệu, và checklist trưởng thành cho một bộ E2E quy mô lớn.'
thumbnail   = '/images/playwright-series/16-best-practices.svg'
featured    = false
weight      = 16
categories  = ['it']
tags        = ['playwright', 'automation', 'test', 'e2e', 'framework']
series      = ['tu-hoc-playwright']
authors     = ['Nguyen Chung']
+++

Qua 15 bài, bạn đã có đủ công cụ. Bài cuối này không giới thiệu API mới — mà gom lại thành **nguyên tắc và chiến lược** để xây một bộ test E2E thật sự đáng tin: nhanh, ổn định, dễ bảo trì, và được cả team tin tưởng thay vì né tránh.

## Chiến lược: đặt E2E đúng chỗ

E2E test **đắt** (chậm, dễ vỡ, tốn công bảo trì). Đừng dùng nó để test mọi thứ. Hình dung **test pyramid** (hoặc "testing trophy"):

```
        ╱ E2E ╲          ← ít: các luồng nghiệp vụ quan trọng nhất
      ╱─────────╲
     ╱ Integration ╲     ← vừa: API, tích hợp module
    ╱───── + API ────╲
   ╱─────── Unit ──────╲ ← nhiều: logic, hàm thuần, component
```

Nguyên tắc chọn:

- Logic thuần, tính toán, edge case → **unit test** (nhanh, rẻ).
- Hợp đồng API, tích hợp service → **API/integration test** (Playwright `request` rất hợp).
- Luồng **người dùng quan trọng** (đăng nhập, thanh toán, đăng ký) → **E2E**.

Một bộ E2E tốt thường chỉ phủ **happy path + vài luồng tiền quan trọng**, không cố phủ mọi nhánh.

## Mười nguyên tắc viết test ổn định

**1. Mỗi test độc lập.** Không phụ thuộc thứ tự, không dùng chung state. Test phải chạy được đơn lẻ và song song.

**2. Tự dựng và tự dọn dữ liệu.** Seed qua API ở `beforeEach`/fixture, cleanup sau. Đừng dựa vào dữ liệu có sẵn trên môi trường.

**3. Locator theo ngữ nghĩa.** `getByRole`/`getByLabel` trước, `getByTestId` khi cần, CSS/XPath cuối cùng. (Bài Locators)

**4. Luôn dùng web-first assertions.** `expect(locator).toXxx()` thay vì lấy giá trị ra rồi so sánh. (Bài Actions)

**5. Không bao giờ `waitForTimeout`/sleep.** Chờ điều kiện cụ thể. Sleep là dấu hiệu của test sẽ flaky.

**6. Đăng ký listener trước khi kích hoạt.** `waitForResponse`/`popup`/`download` đăng ký **trước** action. (Tránh race condition)

**7. Đặt tên test mô tả hành vi, không mô tả thao tác.** "đăng nhập sai mật khẩu báo lỗi" tốt hơn "test 3".

**8. Page Object cho UI dùng lại, fixtures để lắp ráp.** Đừng lặp locator khắp nơi. (Bài POM + Fixtures)

**9. `retries: 0` ở local, `2` trên CI.** Local lộ flaky ngay; CI chịu được nhiễu hạ tầng. Test phải idempotent.

**10. Test phải chạy trên CI từ ngày đầu.** Test không chạy tự động = test sẽ chết.

## Chống flaky test — nguồn gốc và cách trị

Flaky test giết niềm tin của team nhanh hơn bất cứ thứ gì. Bảng nguyên nhân – cách trị:

| Triệu chứng | Nguyên nhân gốc | Cách trị |
|---|---|---|
| Đọc giá trị sai/rỗng | Lấy `.textContent()` trước khi UI cập nhật | Dùng `expect(locator).toHaveText()` |
| Click trượt / "element not stable" | Animation, layout shift | Auto-wait đã lo; nếu cần `animations:'disabled'` |
| Lúc pass lúc fail theo thứ tự | State dùng chung giữa test | Cách ly context, seed/cleanup riêng |
| Fail khi chạy song song | Đụng dữ liệu chung | Mỗi test tạo dữ liệu riêng (tên/email ngẫu nhiên) |
| Race với mạng | Action xong trước khi listener gắn | `waitForResponse` trước action |
| Chỉ fail trên CI | Render/timezone/locale khác | Dùng Docker image official, cố định locale/clock |

Quy trình điều tra: `--repeat-each=20`, `--workers=1`, so trace pass/fail (bài Debugging).

## Quản lý dữ liệu test

- **Data factory**: hàm sinh dữ liệu với giá trị ngẫu nhiên/duy nhất để tránh đụng nhau.

```ts
// utils/data-factory.ts
export const makeUser = (overrides = {}) => ({
  email: `user-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
  name: 'Test User',
  ...overrides,
});
```

- **Seed qua API** (nhanh) thay vì click qua UI để dựng tiền đề.
- **Tránh hardcode** ID, ngày tháng cố định; cố định clock khi cần xác định.

## Tổ chức và đặt tên

```
tests/
  auth/login.spec.ts          # nhóm theo tính năng/domain
  checkout/payment.spec.ts
pages/        components/      # POM + component object
fixtures/     utils/           # fixtures + helper, data factory
```

- Gắn **tag** (`@smoke`, `@critical`, `@slow`) để chạy theo nhóm trên CI.
- Tách **smoke suite** chạy nhanh ở mỗi PR, full suite chạy theo lịch/nightly.

## Hiệu năng suite

- Bật `fullyParallel` + đủ `workers`; **shard** trên nhiều máy khi cần (bài Parallel/CI).
- Đăng nhập qua **storageState**, không qua UI mỗi test (bài Authentication).
- **Mock** network cho test frontend để khỏi phụ thuộc backend chậm (bài Network), nhưng giữ một lớp E2E thật.
- Giữ test ngắn, tập trung một hành vi — test "khổng lồ" vừa chậm vừa khó debug.

## Checklist trưởng thành cho bộ E2E

- [ ] Test chạy tự động ở mỗi PR và mỗi deploy.
- [ ] `retries: 0` ở local, không có `waitForTimeout` nào trong code.
- [ ] Mỗi test độc lập, tự seed + cleanup, chạy song song an toàn.
- [ ] Locator theo ngữ nghĩa, gom trong Page Object / Component Object.
- [ ] Đăng nhập qua storageState; dữ liệu sinh động qua factory.
- [ ] Trace bật `on-first-retry`; report (HTML + github) gắn vào PR.
- [ ] Sharding khi suite vượt ngưỡng thời gian chấp nhận được.
- [ ] Visual test (nếu có) chạy trong Docker image official, baseline được review.
- [ ] Smoke suite nhanh tách khỏi full suite; tag rõ ràng.
- [ ] Flaky test bị coi là **bug phải sửa**, không phải "chạy lại cho qua".

## Kết series

Playwright mạnh, nhưng công cụ không tự sinh ra test tốt. Test tốt đến từ **kỷ luật**: độc lập, ổn định, đặt đúng tầng trong pyramid, và được chạy tự động liên tục. Nắm vững những nguyên tắc trong series này, bạn không chỉ "biết dùng Playwright" mà còn xây được một bộ test mà cả team **tin tưởng** — đó mới là đích đến thật sự của automation test.

## Tóm tắt

- Đặt E2E ở **đỉnh pyramid**: ít, phủ luồng quan trọng; đẩy phần còn lại xuống unit/API test.
- Mười nguyên tắc cốt lõi xoay quanh: **độc lập, web-first assertions, không sleep, locator ngữ nghĩa, dữ liệu tự quản**.
- Coi **flaky test là bug**; điều tra có hệ thống bằng trace và chạy lặp.
- Một bộ E2E trưởng thành **chạy tự động trên CI**, nhanh nhờ parallel/shard/storageState, và được cả team tin dùng.

---

**Bài trước**: [← Playwright trong CI/CD với GitHub Actions và Docker](/posts/playwright-ci-cd-github-actions-docker/)

Cảm ơn bạn đã theo dõi trọn series **Tự học Playwright**! Xem lại toàn bộ lộ trình tại trang [series](/series/tu-hoc-playwright/).

# Lộ trình: Học Automation Test từ số 0

> Series dành cho người **chưa có nền tảng lập trình**, đi từ tư duy code → JavaScript → web/testing → Playwright → kỹ thuật nâng cao → project thực chiến.
>
> - **Slug series (dự kiến):** `hoc-automation-test-tu-so-0`
> - **Công cụ chính:** Playwright
> - **Ngôn ngữ:** JavaScript
> - **Tổng số bài:** 35 (Bài 0 → Bài 34)

---

## Phần mở đầu series (1 bài)

- **Bài 0:** Automation Test là gì, vì sao chọn Playwright, lộ trình tổng quan của series — đóng vai trò "mục lục", giới thiệu toàn bộ hành trình để người đọc biết họ sẽ đi qua những gì.

## Giai đoạn 0: Làm quen lập trình (3 bài)

- **Bài 1:** Lập trình là gì, tư duy giải quyết vấn đề bằng code cho người chưa từng viết dòng code nào.
- **Bài 2:** Cài đặt môi trường — VS Code, Node.js, làm quen terminal, chạy file JavaScript đầu tiên.
- **Bài 3:** Git & GitHub cơ bản — clone, commit, push, pull request, `.gitignore`. *(Nền tảng bắt buộc trước khi tới CI/CD và đưa project lên portfolio.)*

> 🛠 **Thực hành:** Tạo một repo GitHub, push file JavaScript "Hello World" đầu tiên lên.

## Giai đoạn 1: JavaScript căn bản (7 bài)

- **Bài 4:** Biến và kiểu dữ liệu trong JavaScript.
- **Bài 5:** Câu lệnh điều kiện if/else, toán tử so sánh.
- **Bài 6:** Vòng lặp for, for...of và khi nào dùng loại nào.
- **Bài 7:** Hàm (function) và arrow function.
- **Bài 8:** Làm việc với Array và String — phương thức hay dùng trong automation test (map, filter, find, includes; template literal, trim, includes của chuỗi để assert text).
- **Bài 9:** Làm việc với Object — truy cập, thêm sửa thuộc tính, destructuring cơ bản.
- **Bài 10:** Bất đồng bộ trong JavaScript — Promise và async/await *(bài quan trọng nhất giai đoạn này, giải thích kỹ bằng ví dụ trực quan).*

> 🛠 **Thực hành:** Viết một hàm nhận mảng dữ liệu test và lọc/biến đổi nó bằng map/filter.

## Giai đoạn 2: Kiến thức web và testing (4 bài)

- **Bài 11:** HTML và CSS selector cơ bản — *đủ để **đọc hiểu cấu trúc trang web*** (chưa phải locator của Playwright — sẽ học ở Bài 18).
- **Bài 12:** Làm quen DevTools — cách inspect phần tử, đọc cấu trúc trang web.
- **Bài 13:** Testing là gì — phân biệt manual và automation test, các loại test, khi nào nên tự động hóa.
- **Bài 14:** Thiết kế test case tốt — pattern AAA (Arrange–Act–Assert), test độc lập, đặt tên rõ ràng, test cái gì / không test cái gì. *(Phần phân biệt "biết gõ Playwright" với "biết làm automation".)*

> 🛠 **Thực hành:** Chọn một trang web quen thuộc, dùng DevTools inspect và viết tay 3 test case theo AAA (chưa cần code).

## Giai đoạn 3: Nhập môn Playwright (7 bài)

- **Bài 15:** Cài đặt Playwright, viết và chạy test đầu tiên.
- **Bài 16:** Hiểu cấu trúc project Playwright — file config, thư mục tests, báo cáo HTML report.
- **Bài 17:** Đọc lỗi & tư duy debug cho người mới — hiểu error message, tư duy thử–sai, cách khoanh vùng nguyên nhân. *(Đặt sớm để người học không nản khi gặp lỗi đỏ.)*
- **Bài 18:** Locator trong Playwright — getByRole, getByText, getByLabel và vì sao nên ưu tiên chúng (khác với CSS selector "đọc hiểu" ở Bài 11).
- **Bài 19:** Các hành động cơ bản — click, fill, check, select, upload file.
- **Bài 20:** Assertion với expect — kiểm tra nội dung, trạng thái phần tử.
- **Bài 21:** Dùng Codegen để sinh code nhanh — và giới hạn của công cụ này.

> 🛠 **Thực hành:** Tự động hóa một luồng đăng nhập đơn giản và assert kết quả.

## Giai đoạn 4: Kỹ thuật nâng cao (7 bài)

- **Bài 22:** Page Object Model — pattern quan trọng nhất để code test dễ bảo trì.
- **Bài 23:** Fixtures trong Playwright — tái sử dụng setup giữa các test.
- **Bài 24:** Quản lý test data và biến môi trường với .env.
- **Bài 25:** Xử lý multiple tabs, popup, iframe.
- **Bài 26:** Lưu trạng thái đăng nhập (authentication state) để không phải login lại mỗi test.
- **Bài 27:** API mocking và intercept network request trong Playwright.
- **Bài 28:** Chạy test song song, đọc report, debug nâng cao khi test fail (trace viewer, screenshot, video).

> 🛠 **Thực hành:** Refactor test ở Giai đoạn 3 sang POM + fixtures, tách test data ra .env.

## Giai đoạn 5: Tích hợp thực tế (3 bài)

- **Bài 29:** Viết API test bằng Playwright.
- **Bài 30:** Tích hợp CI/CD cơ bản với GitHub Actions.
- **Bài 31:** Giới thiệu visual regression testing.

> 🛠 **Thực hành:** Cho test suite chạy tự động trên GitHub Actions mỗi lần push.

## Giai đoạn 6: Project thực chiến (3 bài)

- **Bài 32:** Xây dựng test suite hoàn chỉnh cho một website demo thương mại điện tử — từ thiết kế POM đến viết test case.
- **Bài 33:** Hoàn thiện CI pipeline cho project, đưa lên GitHub làm portfolio.
- **Bài 34 (tổng kết):** Nhìn lại lộ trình, gợi ý hướng đi tiếp theo (testing chuyên sâu, performance test, hoặc chuyển hướng sang SDET).

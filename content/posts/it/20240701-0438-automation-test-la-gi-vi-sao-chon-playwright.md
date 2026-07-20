+++
date        = '2024-07-01T04:38:00+07:00'
draft       = false
title       = 'Bài 0 — Automation Test là gì? Vì sao chọn Playwright và lộ trình của series'
slug        = 'automation-test-la-gi-vi-sao-chon-playwright'
summary     = 'Bài mở đầu: hiểu automation test là gì bằng ngôn ngữ đời thường, vì sao mình chọn Playwright cho người mới, và toàn cảnh 35 bài bạn sẽ đi qua để từ số 0 thành người làm được việc.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-0-automation-test-va-lo-trinh-playwright.webp'
featured    = false
weight      = 1
categories  = ['it']
subcategories = ['automation']
tags        = ['automation-test', 'playwright', 'roadmap']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Chào bạn. Nếu bạn đang đọc dòng này, khả năng cao bạn đang đứng trước một trong hai tình huống: hoặc bạn nghe nói "automation test" lương cao, dễ xin việc và muốn thử; hoặc bạn đang test tay (manual) mỏi cả tay rồi và muốn để máy làm hộ. Cả hai đều hợp lý. Và tin tốt: bạn **không cần** biết lập trình trước khi bắt đầu series này.

Mình đã làm automation nhiều năm, từng phỏng vấn và kèm không ít bạn từ con số 0. Bài này mình sẽ nói thẳng với bạn vài điều mà hồi mới vào nghề mình ước có người nói cho mình nghe — trước khi bạn bỏ ra vài tháng đi theo lộ trình này.

## Automation test là gì? Giải thích kiểu không màu mè

Hãy tưởng tượng bạn làm ở một quán cà phê. Mỗi sáng, trước khi mở cửa, bạn phải kiểm tra: máy pha còn chạy không, tủ lạnh có lạnh không, đèn có sáng không, máy tính tiền có lên không. Ngày nào cũng làm, đúng từng ấy bước, lặp đi lặp lại.

**Test phần mềm** cũng y hệt vậy. Trước khi đưa một website hay app tới tay người dùng, ai đó phải kiểm tra: đăng nhập có vào được không, bấm nút "Mua hàng" có thêm vào giỏ không, nhập sai mật khẩu có báo lỗi không... Người làm việc kiểm tra đó gọi là **tester** (kiểm thử viên).

Có hai cách làm:

- **Manual test** (test thủ công): bạn tự tay mở trình duyệt, tự bấm, tự nhìn xem đúng hay sai. Như anh nhân viên sáng nào cũng đi kiểm tra từng cái một.
- **Automation test** (test tự động): bạn **viết một đoạn chương trình** thay bạn mở trình duyệt, tự bấm, tự nhập, tự so kết quả và tự báo "đúng" hay "sai". Như thể bạn lắp một con robot, mỗi sáng nó tự đi rảo một vòng kiểm tra giúp bạn.

> Nói gọn: **automation test là dùng code để thay con người làm những bước kiểm tra lặp đi lặp lại.**

Đoạn code đó trông đại khái thế này (bạn chưa cần hiểu, chỉ cần *cảm* được nó gần với tiếng Anh đời thường):

```javascript
// Mở trang web, gõ vào ô tìm kiếm chữ "playwright", rồi kiểm tra kết quả hiện ra
await page.goto('https://google.com');        // mở Google
await page.getByRole('combobox').fill('playwright'); // gõ vào ô tìm kiếm
await page.keyboard.press('Enter');            // nhấn Enter
await expect(page).toHaveTitle(/playwright/);  // kiểm tra: tiêu đề trang có chữ "playwright" không?
```

Thấy không? Nó đọc gần như một câu chuyện: *mở trang → gõ chữ → nhấn Enter → kiểm tra kết quả*. Học automation phần lớn là học cách "kể" những câu chuyện như vậy cho máy nghe.

## Vì sao phải tự động, đã có test tay rồi?

Câu hỏi rất hay, và là câu mình hay hỏi ngược lại ứng viên. Test tay không hề tệ — thực tế **không bao giờ bỏ được test tay**. Nhưng nó có giới hạn:

- **Lặp lại tốn thời gian kinh khủng.** Một website lớn có hàng nghìn thứ phải kiểm. Mỗi lần lập trình viên sửa code, về lý thuyết phải test lại *tất cả* để chắc không có gì vỡ. Làm tay thì... đến Tết.
- **Con người hay mệt và bỏ sót.** Bấm cùng một luồng 50 lần trong ngày, đến lần thứ 30 mắt bạn sẽ lướt qua cái lỗi mà không nhận ra. Máy thì không biết chán.
- **Cần phản hồi nhanh.** Ngày nay code được đẩy lên liên tục, có khi mỗi ngày vài chục lần. Phải có thứ tự động kiểm tra trong vài phút, không thể chờ người test cả ngày.

Đây là chỗ automation tỏa sáng: viết **một lần**, chạy **nghìn lần**, lúc nào cũng đều tay như nhau, và chạy lúc 2 giờ sáng cũng được.

> Một câu mình hay nói với lính mới: **automation không thay thế tester, nó giải phóng tester** khỏi việc nhàm chán để tập trung vào việc cần cái đầu — nghĩ ra kịch bản kiểm thử hóc búa mà máy không tự nghĩ ra.

Và đây là điều thực tế ít ai nói thẳng: **không phải thứ gì cũng nên tự động hóa.** Một màn hình mới toanh, còn thay đổi xoành xoạch mỗi tuần thì viết automation cho nó chỉ tổ phí công sửa tới sửa lui. Biết *khi nào nên* và *khi nào không nên* tự động hóa là dấu hiệu của người làm nghề thật, chứ không phải người mới. Cái này mình sẽ nói kỹ ở **Bài 13** và **Bài 14**.

## Vì sao series này chọn Playwright?

Trong nghề có nhiều công cụ để viết automation cho web: **Selenium** (đàn anh kỳ cựu), **Cypress**, và **Playwright**. Mình sẽ không vòng vo: với một người **mới bắt đầu năm nay**, mình khuyên đi thẳng vào **Playwright**. Lý do rất thực tế:

- **Do Microsoft phát triển, miễn phí, mã nguồn mở** và đang được cộng đồng đón nhận rất mạnh. Học cái đang lên thì cơ hội việc làm tốt hơn.
- **Tự chờ (auto-wait).** Đây là điểm mình mê nhất. Web hiện đại load lắt nhắt, phần tử lúc có lúc chưa. Công cụ đời cũ bắt bạn tự viết lệnh "chờ" khắp nơi, sai một cái là test "lúc chạy lúc không" (dân trong nghề gọi là **flaky test** — test chập chờn, ác mộng của mọi đội). Playwright tự chờ giúp bạn, đỡ được cả tấn lỗi vớ vẩn cho người mới.
- **Công cụ hỗ trợ xịn sẵn trong hộp:** tự sinh code (Codegen), xem lại "hộp đen" khi test fail (Trace Viewer), chụp ảnh/quay video tự động. Mấy thứ này giúp bạn học nhanh hơn rất nhiều.
- **Một bộ, chạy được nhiều trình duyệt** (Chrome, Firefox, Safari) và viết được bằng nhiều ngôn ngữ.

Nói vậy không phải để bạn chê Selenium — đi làm bạn vẫn sẽ gặp nó, và nó vẫn rất mạnh. Nhưng để **học từ 0**, Playwright cho bạn cảm giác thành công sớm hơn, ít vấp những lỗi gây nản hơn. Mà với người mới, *giữ được động lực* mới là thứ quyết định bạn đi tới đích hay bỏ cuộc giữa đường.

Về ngôn ngữ, series này dùng **JavaScript**. Đừng lo nếu bạn chưa biết nó là gì — nguyên Giai đoạn 1 mình dành để dạy bạn JavaScript từ đầu, ở mức vừa đủ cho automation.

## Bạn sẽ đi qua những gì? Toàn cảnh lộ trình

Bài 0 này đóng vai trò **tấm bản đồ**. Cả series có **35 bài** (Bài 0 → Bài 34), chia thành 7 chặng. Bạn không cần nhớ hết, chỉ cần thấy được bức tranh lớn:

| Giai đoạn | Bạn học được gì | Bài |
|-----------|-----------------|-----|
| **0. Làm quen lập trình** | Tư duy code, cài môi trường, Git/GitHub | Bài 1–3 |
| **1. JavaScript căn bản** | Biến, điều kiện, vòng lặp, hàm, mảng, object, async/await | Bài 4–10 |
| **2. Web & testing** | HTML/CSS selector, DevTools, tư duy testing, thiết kế test case | Bài 11–14 |
| **3. Nhập môn Playwright** | Cài đặt, locator, hành động, assertion, debug, Codegen | Bài 15–21 |
| **4. Kỹ thuật nâng cao** | Page Object Model, fixtures, test data, auth, mock API, chạy song song | Bài 22–28 |
| **5. Tích hợp thực tế** | API test, CI/CD với GitHub Actions, visual testing | Bài 29–31 |
| **6. Project thực chiến** | Tự build test suite cho web bán hàng, lên CI, làm portfolio | Bài 32–34 |

Vài lời thật lòng về tấm bản đồ này:

- **Đừng nhảy cóc.** Mình biết bạn nóng lòng muốn vào Playwright ngay ở Giai đoạn 3. Nhưng nếu chưa nắm JavaScript (đặc biệt là **async/await** ở Bài 10), bạn sẽ "viết được mà không hiểu mình viết gì" — và đến lúc lỗi thì bó tay. Nền móng chán thật, nhưng nó là thứ phân biệt người làm được việc với người chỉ copy-paste.
- **Học đi đôi với gõ.** Mỗi giai đoạn mình đều để phần 🛠 *Thực hành*. Đọc không làm thì 2 hôm là quên sạch. Cứ mở máy lên gõ theo, sai cũng được — sai là cách học nhanh nhất trong nghề này.
- **Mục tiêu cuối** không phải là "biết Playwright", mà là **Bài 32–34**: bạn tự tay dựng một bộ test hoàn chỉnh cho một website, cho nó chạy tự động trên GitHub, và biến nó thành sản phẩm để khoe khi đi xin việc. Đó mới là thứ nhà tuyển dụng muốn thấy.

## Tâm thế trước khi bắt đầu

Mình chốt lại bằng vài câu mình hay dặn người mới:

- **Không ai giỏi từ Bài 1.** Bạn sẽ gặp lỗi đỏ lòm trên màn hình rất nhiều. Đó là chuyện bình thường, kể cả với người đi làm 5 năm. Mình còn để hẳn **Bài 17** dạy bạn cách đọc lỗi và bình tĩnh xử lý.
- **Chậm mà chắc.** Đi hết 35 bài một cách tử tế giá trị hơn lướt qua 35 bài trong một tuần rồi chẳng đọng lại gì.
- **Google và đọc tài liệu là kỹ năng nghề, không phải gian lận.** Người đi làm lâu năm vẫn tra tài liệu mỗi ngày. Mình sẽ luôn để link nguồn chuẩn ở cuối mỗi bài để bạn quen dần.

Rồi, bản đồ đã có trong tay. Hẹn bạn ở **Bài 1**, nơi mình sẽ trả lời câu hỏi tưởng đơn giản mà nhiều người mơ hồ: *lập trình thực ra là gì, và "tư duy như một lập trình viên" nghĩa là sao?*

## 🛠 Thực hành

Chưa cần code gì ở bài này — nhưng làm hai việc nhỏ để khởi động:

1. **Tự trả lời ra giấy:** lấy một website bạn hay dùng (Shopee, Facebook, web ngân hàng...), viết ra 3 việc mà "một con robot kiểm tra" nên làm mỗi ngày trên đó. Đây chính là tư duy test case sơ khai.
2. **Đặt mục tiêu:** ghi lại lý do bạn học automation và mốc thời gian bạn muốn đi hết lộ trình. Khi nào nản, đọc lại tờ giấy này.

## Website tham khảo

- [Playwright — Official Docs](https://playwright.dev/docs/intro) — trang tài liệu chính thức, sẽ là "kim chỉ nam" của bạn suốt series.
- [Playwright — Why Playwright](https://playwright.dev/docs/why-playwright) — chính chủ giải thích vì sao công cụ này được thiết kế như vậy, đọc để hiểu thêm các lý do mình nêu ở trên.
- [MDN Web Docs (tiếng Việt)](https://developer.mozilla.org/vi/docs/Web) — nguồn chuẩn về web/JavaScript, dùng dài dài từ Giai đoạn 1 trở đi.
- [ISTQB — Foundation Level Syllabus](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-/) — tài liệu nền tảng về kiểm thử phần mềm, đọc để có cái nhìn bài bản về nghề tester.

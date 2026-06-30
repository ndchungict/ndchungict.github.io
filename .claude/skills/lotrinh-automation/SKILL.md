---
name: lotrinh-automation
description: Viết nội dung cho một (hoặc nhiều) bài trong lộ trình "Học Automation Test từ số 0". Đọc khung lộ trình từ content/lotrinh/hoc-automation-test-tu-so-0.md, sinh file .md vào content/lotrinh với draft = true. Dùng khi user muốn viết/soạn bài thuộc lộ trình automation test này (vd "viết Bài 3", "soạn bài Git cho lộ trình").
---

# Viết bài cho lộ trình "Học Automation Test từ số 0"

Soạn nội dung từng bài của lộ trình. File bài lưu vào `content/lotrinh/`, luôn `draft = true` (chưa publish). KHÔNG tạo file ảnh SVG.

> File khung lộ trình: `content/lotrinh/hoc-automation-test-tu-so-0.md` — chứa danh sách 35 bài (Bài 0 → Bài 34) chia theo 7 giai đoạn. Đây là nguồn duy nhất quyết định bài nào, tiêu đề gì, phạm vi tới đâu.

## Bước 1 — Đọc khung lộ trình

Luôn đọc `content/lotrinh/hoc-automation-test-tu-so-0.md` trước. Từ đó lấy:

- **Số bài** (Bài N) và **tiêu đề** chính xác.
- **Giai đoạn** chứa bài → dùng để canh độ sâu (giai đoạn 0–1 cực kỳ căn bản, giai đoạn 4+ nâng cao).
- **Ghi chú phạm vi** trong ngoặc/italic của bài (vd "bài quan trọng nhất", "đặt sớm để không nản") — phải bám theo.

## Bước 2 — Xác định bài cần viết

Hỏi user (nếu chưa rõ): viết **bài nào** (1 bài, một dải, hay cả một giai đoạn). Nếu user chỉ nói số bài → lấy tiêu đề tương ứng từ khung. Đừng tự thêm/bớt bài ngoài khung; nếu thấy cần đổi khung, báo user trước.

## Bước 3 — Đặt tên file

Format: `content/lotrinh/bai-<NN>-<slug>.md`

- `<NN>`: số bài, **2 chữ số, zero-pad** (Bài 0 → `00`, Bài 7 → `07`, Bài 14 → `14`). Giúp file tự sắp đúng thứ tự trong thư mục.
- `<slug>`: kebab-case từ tiêu đề. Bỏ dấu tiếng Việt (đ → d), chuyển thường, thay khoảng trắng & ký tự đặc biệt bằng `-`, gộp `-` liền nhau, bỏ `-` đầu/cuối.
- Ví dụ: Bài 3 "Git & GitHub cơ bản" → `content/lotrinh/bai-03-git-github-co-ban.md`.
- Kiểm tra trùng tên; nếu trùng (viết lại bài cũ), hỏi user ghi đè hay bỏ qua.

## Bước 4 — Ghi front matter

```toml
+++
date        = '<ISO 8601 + offset, vd 2026-06-30T16:40:00+07:00>'
draft       = true
title       = '<Tiêu đề bài đúng theo khung>'
slug        = '<slug>'
summary     = ''
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = <N + 1>
categories  = ['automation']
tags        = [<tag liên quan, vd 'automation-test', 'playwright', 'javascript'>]
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++
```

- `draft = true` **luôn luôn** — đây là yêu cầu cố định của lộ trình, không publish.
- `weight = N + 1` để Bài 0 có weight 1 (Hugo coi weight 0 là "chưa set"). Giữ đúng thứ tự render `.Pages.ByWeight`.
- `category` cố định `automation` → thumbnail `default-thumb-it-lap-trinh.webp`.
- `tags`: chọn theo nội dung bài (giai đoạn JS → `javascript`; giai đoạn Playwright → `playwright`; luôn có `automation-test`).
- Dùng nháy đơn `'...'` cho chuỗi TOML; `date` trùng mốc trong tên file (nếu viết nhiều bài, cộng dồn ~vài phút mỗi bài để khác mốc).

## Bước 5 — Viết nội dung (phong cách "từ số 0")

### Quy tắc văn phong (BẮT BUỘC)

- **Dễ đọc:** câu ngắn, mỗi câu một ý. Tránh câu lồng nhiều mệnh đề. Ưu tiên gạch đầu dòng, bảng, đoạn ngắn thay vì khối chữ dày đặc.
- **Dễ hiểu:** viết như đang giảng cho người mới hoàn toàn. Mọi thuật ngữ phải được giải thích ngay lần đầu xuất hiện. Không giả định kiến thức nền.
- **Phân tích gọn gàng:** đi thẳng vào trọng tâm, không lan man, không nhắc lại ý đã nói. Mỗi mục giải quyết đúng một vấn đề.
- **Chi tiết:** giải thích đủ sâu để người đọc *làm theo được*, không bỏ bước. Nêu rõ "tại sao" chứ không chỉ "làm gì".
- **Có ví dụ minh họa:** mỗi khái niệm phải kèm ít nhất một ví dụ cụ thể (code chạy được hoặc phép so sánh đời thường). Không nêu lý thuyết suông mà thiếu ví dụ.
- **Giọng văn:** chuyên nghiệp, mạch lạc, xưng hô nhất quán (vd "bạn"). Thiên về **kỹ thuật và chính xác**, không sáo rỗng, không dịch máy cứng nhắc.

### Tông kỹ thuật (BẮT BUỘC — mặc định cho mọi bài)

Mặc định viết theo **tông kỹ thuật, chính xác**, như tài liệu nội bộ chất lượng cao của một team automation, KHÔNG phải bài blog tâm sự.

- **Dùng đúng thuật ngữ kỹ thuật** và định nghĩa gọn khi xuất hiện lần đầu (vd: runtime, standard output, working directory, environment variable). Người mới vẫn hiểu, nhưng học luôn từ vựng chuẩn của nghề.
- **Tiết chế văn phong đời thường:** hạn chế câu cảm thán, emoji, ví von đời sống dài dòng, hài hước. Một phép so sánh ngắn để làm rõ một khái niệm khó thì được; lạm dụng thì không.
- **Trình bày dạng tài liệu:** mỗi mục giải quyết một vấn đề; ưu tiên bảng, danh sách bước có đánh số, code block có chú thích. Lệnh/thao tác nên có phần **xác minh (verify)** kết quả.
- **Mô tả lỗi theo cấu trúc:** triệu chứng → nguyên nhân → cách xử lý, kèm **tên/thông báo lỗi chính xác**.
- **Chính xác kỹ thuật là ưu tiên cao nhất.** Không nói ẩu, không phỏng đoán; nêu rõ "khi nào dùng", "vì sao", "tránh gì".

### Giữ chất Senior/Leader (vẫn áp dụng, trong khuôn khổ tông kỹ thuật)

Tông kỹ thuật KHÔNG có nghĩa là khô như đặc tả API. Vẫn viết như một **người dẫn dắt đội automation nhiều kinh nghiệm** đang truyền nghề:

- **Có quan điểm, dám khuyên:** nói thẳng cái gì nên dùng / nên tránh và **vì sao** (vd "luôn chọn bản LTS", "tránh tự viết wait thủ công"), thay vì liệt kê trung lập.
- **Phân biệt lý thuyết và thực tế dự án:** chỉ ra pitfall, best practice, thói quen tốt của team chuyên nghiệp — nhưng diễn đạt gọn, chuyên môn, không lan man kể lể.
- Đưa kinh nghiệm thực chiến ở mức **cô đọng** (một câu lưu ý, một cảnh báo), không biến bài thành hồi ký.

### Cấu trúc bài

Đối tượng là người **chưa từng viết code**. Mỗi bài nên có:

- **Mở đầu ngắn**: bài này giải quyết vấn đề gì, vì sao cần (1–2 đoạn, không lý thuyết dài dòng).
- **Giải thích bằng đời thường** trước khi vào thuật ngữ: dùng ví dụ, phép so sánh trực quan. Giới thiệu thuật ngữ tiếng Anh kèm cách đọc/nghĩa khi xuất hiện lần đầu.
- **Code block đầy đủ, chạy được**, có comment giải thích từng dòng quan trọng. Ưu tiên ví dụ nhỏ, tăng dần.
- **Cảnh báo lỗi thường gặp** của người mới (nếu có) — "nếu thấy lỗi X thì do...".
- **Mini-exercise cuối bài**: 1–2 bài tập tự làm, bám theo gợi ý "🛠 Thực hành" của giai đoạn trong khung lộ trình.
- **Website tham khảo** (mục cuối bài, BẮT BUỘC): 2–5 link tài liệu/nguồn học để người đọc đào sâu. Đặt dưới heading `## Website tham khảo`, mỗi dòng `- [Tên nguồn](URL) — mô tả ngắn nó giúp gì`.
  - Ưu tiên **nguồn chính thống** (official docs) và tài liệu có bản tiếng Việt khi phù hợp.
  - Chọn link **đúng chủ đề bài**, không nhồi link chung chung. Gợi ý theo giai đoạn:
    - JavaScript: [MDN Web Docs](https://developer.mozilla.org/vi/docs/Web/JavaScript), [javascript.info](https://javascript.info).
    - HTML/CSS/DevTools: [MDN HTML](https://developer.mozilla.org/vi/docs/Web/HTML), [Chrome DevTools docs](https://developer.chrome.com/docs/devtools).
    - Git/GitHub: [Git docs](https://git-scm.com/doc), [GitHub Docs](https://docs.github.com).
    - Playwright: [Playwright docs](https://playwright.dev/docs/intro), [Playwright API](https://playwright.dev/docs/api/class-playwright).
    - CI/CD: [GitHub Actions docs](https://docs.github.com/en/actions).
  - Chỉ ghi URL **thật, còn sống**; không bịa link. Nếu không chắc một link tồn tại, bỏ qua link đó.
- **Liên kết bài trước/sau** khi hợp lý (vd "ở Bài 9 ta đã học async/await...").

Độ dài và độ sâu canh theo giai đoạn: giai đoạn đầu giải thích chậm, nhiều ví dụ vụn; giai đoạn sau giả định đã nắm nền JavaScript.

Heading dùng `##`, `###`. KHÔNG lặp lại `# Tiêu đề` H1 trong body (Hugo đã render title từ front matter).

## Bước 6 — Báo cáo

- Liệt kê file đã tạo (đường dẫn + weight + tiêu đề).
- Nhắc: tất cả `draft = true`, chỉ hiện với `hugo server --buildDrafts`; đổi `draft = false` khi muốn publish.
- KHÔNG cập nhật `post-library.md` (bài lộ trình là bản nháp trong `content/lotrinh/`, không thuộc thư viện bài chính), trừ khi user yêu cầu.

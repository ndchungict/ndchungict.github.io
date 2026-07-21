+++
date        = '2024-07-01T06:50:00+07:00'
draft       = false
title       = 'Bài 2 — Cài đặt môi trường: VS Code, Node.js và chạy file JavaScript đầu tiên'
slug        = 'cai-dat-moi-truong-vs-code-nodejs'
summary     = 'Cài đặt Node.js và VS Code, nắm các thao tác terminal cơ bản, và chạy file JavaScript đầu tiên bằng Node. Kèm cách xác minh cài đặt và xử lý các lỗi thường gặp.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-2-cai-dat-moi-truong-javascript.webp'
featured    = false
weight      = 3
categories  = ['it']
subcategories = ['qa-testing']
tags        = ['automation-test', 'nodejs', 'vs-code', 'terminal']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

[Bài 1](../lap-trinh-la-gi-tu-duy-giai-quyet-van-de/) đã giải thích lập trình là gì ở mức khái niệm. Bài này thiết lập môi trường phát triển (development environment) trên máy của bạn và chạy chương trình JavaScript đầu tiên bằng Node.js.

Thực hiện đúng thứ tự các bước bên dưới. Mỗi bước đều có phần xác minh (verify) để đảm bảo cài đặt thành công trước khi đi tiếp.

## Hai thành phần cần cài

Môi trường tối thiểu để viết và chạy code automation gồm hai thành phần:

| Thành phần | Vai trò | Lý do cần |
|-----------|---------|-----------|
| **Node.js** | Runtime để thực thi JavaScript bên ngoài trình duyệt | JavaScript nguyên thủy chỉ chạy trong trình duyệt. Node.js cung cấp một runtime độc lập để chạy JavaScript trực tiếp trên hệ điều hành. Playwright chạy trên Node.js. |
| **VS Code** | Trình soạn thảo mã nguồn (code editor) | Cung cấp syntax highlighting, autocomplete, tích hợp terminal và Git. Là editor tiêu chuẩn trong phần lớn dự án automation hiện nay. |

> **Phân biệt:** *VS Code* (Visual Studio **Code**) là code editor nhẹ, đa nền tảng. Nó khác *Visual Studio* — một IDE nặng cho hệ sinh thái .NET. Series này dùng VS Code.

**Runtime** là phần mềm chịu trách nhiệm đọc và thực thi code của bạn. Khi nói "JavaScript chạy trên Node.js runtime", nghĩa là Node.js là chương trình đọc file `.js` và thực thi từng lệnh trong đó.

## Bước 1 — Cài đặt Node.js

1. Truy cập trang chính thức: [https://nodejs.org](https://nodejs.org).
2. Tải bản **LTS** (Long-Term Support). LTS là nhánh phát hành ổn định, được hỗ trợ bảo trì dài hạn, phù hợp cho môi trường làm việc. Tránh bản *Current* vì nó chứa các tính năng mới chưa ổn định.
3. Chạy trình cài đặt, giữ nguyên các tùy chọn mặc định. Trên Windows, tùy chọn *Add to PATH* được bật sẵn — không tắt nó.

`PATH` là một biến môi trường (environment variable) liệt kê các thư mục mà hệ điều hành tìm kiếm chương trình khả thi. Node.js cần nằm trong `PATH` để bạn gọi lệnh `node` từ bất kỳ thư mục nào.

**Xác minh cài đặt.** Mở terminal (xem Bước 3) và chạy:

```bash
node -v
```

Lệnh in ra phiên bản Node.js đang cài, ví dụ `v20.11.1`. Tiếp theo kiểm tra `npm`:

```bash
npm -v
```

`npm` (Node Package Manager) là trình quản lý gói đi kèm Node.js, dùng để cài các thư viện bên thứ ba — bao gồm Playwright ở các bài sau. Lệnh in ra một số phiên bản là đạt.

> Nếu nhận thông báo `command not found` (macOS/Linux) hoặc `'node' is not recognized` (Windows): đóng hoàn toàn terminal và mở lại để nạp `PATH` mới. Nếu vẫn lỗi, cài lại Node.js và xác nhận tùy chọn thêm vào `PATH` được bật.

## Bước 2 — Cài đặt VS Code

1. Truy cập [https://code.visualstudio.com](https://code.visualstudio.com), tải bản tương ứng hệ điều hành (Windows / macOS / Linux).
2. Chạy trình cài đặt với tùy chọn mặc định.

VS Code sẽ là nơi bạn viết code và thao tác trong suốt series. Phần dưới sử dụng terminal tích hợp của nó.

## Bước 3 — Terminal và các lệnh cơ bản

**Terminal** (command line, dòng lệnh) là giao diện nhập lệnh dạng văn bản để điều khiển hệ điều hành. Bạn gõ một lệnh, nhấn Enter, hệ thống thực thi và trả về kết quả. Đây là cách tương tác chính khi làm việc với Node.js và các công cụ dòng lệnh khác.

VS Code có terminal tích hợp. Mở qua menu **Terminal → New Terminal**, hoặc phím tắt `` Ctrl + ` ``.

Một số lệnh điều hướng cơ bản cần nắm:

```bash
pwd        # print working directory — in đường dẫn thư mục hiện tại
ls         # liệt kê file và thư mục (Windows: dir)
cd <ten>   # change directory — di chuyển vào thư mục <ten>
cd ..      # di chuyển ra thư mục cha
mkdir <ten> # make directory — tạo thư mục mới tên <ten>
```

Tất cả thao tác trong series chỉ cần đến nhóm lệnh này. Mỗi lệnh tác động lên **thư mục hiện tại** (working directory) — vị trí mà terminal đang đứng, kiểm tra bằng `pwd`.

## Bước 4 — Chạy chương trình JavaScript đầu tiên

**1. Tạo thư mục dự án** và di chuyển vào trong:

```bash
mkdir hoc-automation
cd hoc-automation
```

**2. Mở thư mục trong VS Code:** menu **File → Open Folder**, chọn thư mục `hoc-automation`.

**3. Tạo file** tên `chao.js`. Phần mở rộng `.js` xác định đây là file JavaScript; Node.js dựa vào đó để xử lý.

**4. Nhập nội dung sau** vào file:

```javascript
// In một chuỗi ra standard output
console.log('Dòng JavaScript đầu tiên.');
```

Giải thích các thành phần:

- `console.log(...)` — hàm ghi tham số đầu vào ra **standard output** (luồng xuất chuẩn, hiển thị trong terminal). Đây là công cụ chính để quan sát giá trị và trạng thái chương trình khi phát triển.
- `'Dòng JavaScript đầu tiên.'` — một **string** (chuỗi ký tự), đặt trong dấu nháy đơn. Đây là tham số truyền vào `console.log`.
- Dòng mở đầu bằng `//` là **comment** (chú thích). Runtime bỏ qua comment khi thực thi; nó chỉ phục vụ người đọc.
- Lưu file bằng `Ctrl + S` trước khi chạy. Code chưa lưu sẽ không được phản ánh khi thực thi.

**5. Thực thi file** bằng Node.js:

```bash
node chao.js
```

Cú pháp `node <đường-dẫn-file>` yêu cầu Node.js đọc và thực thi file chỉ định. Kết quả mong đợi:

```text
Dòng JavaScript đầu tiên.
```

Chu trình vừa thực hiện — viết lệnh, lưu, thực thi, quan sát kết quả — là chu trình cốt lõi của mọi công việc lập trình. Các bài sau, kể cả khi làm việc với Playwright, đều dựa trên cùng chu trình này ở quy mô lớn hơn.

## Lỗi thường gặp

- **`Error: Cannot find module '.../chao.js'`** — terminal không đứng ở thư mục chứa file. Chạy `ls` (hoặc `dir`) để kiểm tra, dùng `cd` di chuyển đến đúng thư mục chứa `chao.js`.
- **Sửa code nhưng kết quả không đổi** — file chưa được lưu. Tab có dấu chấm tròn `●` thay cho nút đóng nghĩa là file còn thay đổi chưa lưu; nhấn `Ctrl + S`.
- **`SyntaxError`** — lỗi cú pháp: thiếu dấu nháy, thiếu ngoặc, hoặc sai ký tự. Thông báo lỗi chỉ ra số dòng (line) và vị trí; đọc đúng dòng đó. Cách phân tích thông báo lỗi được trình bày chi tiết ở Bài 17.
- **`node -v` không trả về phiên bản** — xem lại phần xác minh ở Bước 1 (vấn đề `PATH`).

Sửa lỗi là một phần thường trực của quá trình phát triển. Việc gặp và xử lý lỗi từ những bài đầu là bình thường và cần thiết.

Ở [Bài 3](../git-github-co-ban/) ta thiết lập **Git & GitHub** để quản lý phiên bản mã nguồn — nền tảng bắt buộc trước khi làm việc với CI/CD và xây dựng portfolio.

## 🛠 Thực hành

1. **Thay đổi nội dung output:** sửa chuỗi trong `console.log` thành thông tin của bạn, chạy lại `node chao.js` và xác nhận kết quả thay đổi tương ứng.
2. **Nhiều câu lệnh:** thêm vài lệnh `console.log(...)`, mỗi lệnh in một chuỗi khác nhau. Chạy lại và xác nhận thứ tự output khớp với thứ tự các lệnh trong file (thực thi tuần tự từ trên xuống).
3. **Thao tác terminal:** luyện các lệnh `pwd`, `ls`/`dir`, `mkdir`, `cd <ten>`, `cd ..` để thành thạo điều hướng thư mục.

## Website tham khảo

- [Node.js — Trang tải chính thức](https://nodejs.org/en/download) — tải Node.js bản LTS.
- [Visual Studio Code — Trang chủ](https://code.visualstudio.com) — tải và tài liệu sử dụng VS Code.
- [VS Code — Integrated Terminal](https://code.visualstudio.com/docs/terminal/basics) — tài liệu chính thức về terminal tích hợp.
- [MDN — console.log()](https://developer.mozilla.org/en-US/docs/Web/API/console/log_static) — đặc tả hàm `console.log`.
- [Node.js — Run a Node.js script](https://nodejs.org/en/learn/getting-started/how-to-run-a-node-program) — hướng dẫn chính thức về cách thực thi file bằng Node.js.

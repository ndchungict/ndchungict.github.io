+++
date        = '2024-07-01T07:55:00+07:00'
draft       = false
title       = 'Bài 3 — Git & GitHub cơ bản: commit, push, pull request và .gitignore'
slug        = 'git-github-co-ban'
summary     = 'Thiết lập Git, nắm vòng đời thay đổi (working directory → staging → commit), đẩy code lên GitHub, dùng .gitignore và pull request. Nền tảng quản lý phiên bản bắt buộc trước khi làm CI/CD.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-3-git-github-co-ban.webp'
featured    = false
weight      = 4
columns     = 2
categories  = ['it']
subcategories = ['qa-testing']
tags        = ['automation-test', 'git', 'github']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

[Bài 2](../cai-dat-moi-truong-vs-code-nodejs/) đã dựng môi trường chạy JavaScript. Bài này thiết lập **quản lý phiên bản (version control)** cho mã nguồn bằng Git và GitHub.

Đây không phải kiến thức "học cho biết". Code automation của bạn là tài sản: nó cần được lưu lịch sử thay đổi, sao lưu an toàn, và chia sẻ được. Ở các bài sau, **CI/CD (Bài 30)** chạy test tự động mỗi khi code được đẩy lên GitHub, và **portfolio (Bài 33)** chính là repository GitHub của bạn. Không nắm Git thì không đi tiếp được.

## Version control là gì và Git/GitHub khác nhau ra sao

**Version control** (quản lý phiên bản) là hệ thống ghi lại mọi thay đổi của mã nguồn theo thời gian, cho phép xem lại lịch sử, quay về phiên bản cũ, và làm việc nhóm mà không ghi đè lên nhau.

Cần phân biệt rõ hai khái niệm thường bị dùng lẫn:

| Khái niệm | Bản chất | Vai trò |
|-----------|----------|---------|
| **Git** | Phần mềm version control chạy **trên máy bạn** (local) | Theo dõi thay đổi, tạo commit, quản lý lịch sử |
| **GitHub** | Dịch vụ **lưu trữ trên cloud** cho repository Git (remote) | Sao lưu, chia sẻ, cộng tác, tích hợp CI/CD |

Git là công cụ; GitHub là một nơi để gửi repository Git lên mạng. Có thể dùng Git mà không dùng GitHub, nhưng trong series này ta dùng cả hai.

Một số thuật ngữ nền tảng:

- **Repository (repo):** một dự án được Git theo dõi — gồm toàn bộ file và lịch sử thay đổi của chúng.
- **Commit:** một bản ghi (snapshot) đánh dấu trạng thái mã nguồn tại một thời điểm, kèm mô tả thay đổi.
- **Remote:** bản sao của repo nằm trên server (ví dụ trên GitHub). `origin` là tên mặc định của remote.

## Bước 1 — Cài đặt và cấu hình Git

Tải Git từ [https://git-scm.com/downloads](https://git-scm.com/downloads), cài với tùy chọn mặc định. Xác minh:

```bash
git --version
```

Lệnh in ra phiên bản, ví dụ `git version 2.43.0`.

Cấu hình danh tính (identity) — thông tin này được gắn vào mỗi commit, nên bắt buộc thiết lập một lần:

```bash
git config --global user.name "Ten Cua Ban"
git config --global user.email "email@cua-ban.com"
```

- `--global` áp dụng cấu hình cho mọi repo trên máy.
- Dùng **đúng email đã/sẽ đăng ký GitHub** để GitHub gắn commit vào tài khoản của bạn.

Kiểm tra lại cấu hình:

```bash
git config --global --list
```

## Bước 2 — Khởi tạo repository

Vào thư mục dự án đã tạo ở Bài 2 và khởi tạo Git:

```bash
cd hoc-automation
git init
```

`git init` tạo thư mục ẩn `.git` — nơi Git lưu toàn bộ lịch sử. Từ đây, thư mục `hoc-automation` đã là một repository.

Kiểm tra trạng thái:

```bash
git status
```

Git liệt kê các file **chưa được theo dõi (untracked)** — ví dụ `chao.js`. Untracked nghĩa là Git thấy file nhưng chưa quản lý lịch sử của nó.

## Bước 3 — Vòng đời một thay đổi: working → staging → commit

Đây là khái niệm cốt lõi nhất của Git. Một file đi qua ba khu vực:

1. **Working directory** — thư mục làm việc thực tế, nơi bạn sửa file.
2. **Staging area (index)** — khu vực "chờ", chứa các thay đổi đã chọn để đưa vào commit kế tiếp.
3. **Repository** — nơi commit được lưu vĩnh viễn vào lịch sử.

Tách *staging* ra giữa là có chủ đích: nó cho phép bạn chọn **chính xác** những thay đổi nào vào một commit, thay vì gộp tất cả. Đây là điểm người mới hay bỏ qua, nhưng là cơ chế then chốt để tạo commit gọn gàng, có ý nghĩa.

Quy trình chuẩn:

```bash
git add chao.js        # đưa chao.js từ working directory vào staging
git commit -m "Them file chao.js dau tien"  # ghi staging thành một commit
```

- `git add <file>` — chuyển thay đổi vào staging. Dùng `git add .` để stage **tất cả** thay đổi trong thư mục hiện tại.
- `git commit -m "..."` — tạo commit từ những gì đang ở staging. Phần `-m` là **commit message** (mô tả thay đổi).

> **Best practice về commit message:** viết ngắn, ở thể mệnh lệnh, mô tả *thay đổi làm gì* (vd `Them test dang nhap`), không phải nhật ký cá nhân. Commit thường xuyên theo từng đơn vị thay đổi hoàn chỉnh — đừng dồn cả ngày vào một commit khổng lồ. Lịch sử commit rõ ràng là thứ phân biệt repo chuyên nghiệp với repo lộn xộn.

Xem lại lịch sử:

```bash
git log --oneline
```

Mỗi dòng là một commit, gồm mã định danh (hash) rút gọn và message.

## Bước 4 — .gitignore: loại trừ file không nên theo dõi

Không phải file nào cũng nên đưa vào Git. Cụ thể, **không bao giờ** commit:

- Thư mục `node_modules/` — chứa thư viện cài qua `npm`, dung lượng lớn và có thể tái tạo bất cứ lúc nào bằng `npm install`.
- File chứa thông tin nhạy cảm như `.env` (biến môi trường, mật khẩu, token — chi tiết ở Bài 24).
- File tạm, log, kết quả build, báo cáo test.

Cơ chế loại trừ là file `.gitignore` đặt ở thư mục gốc repo. Tạo file `.gitignore` với nội dung:

```text
# Thư viện cài qua npm — tái tạo được, không commit
node_modules/

# Biến môi trường, thông tin nhạy cảm
.env

# Log và file tạm
*.log
```

Mỗi dòng là một mẫu (pattern) file/thư mục Git sẽ bỏ qua. Sau khi tạo, chạy `git status` để xác nhận các mục này không còn xuất hiện trong danh sách theo dõi.

> Commit `node_modules/` hoặc `.env` là hai lỗi kinh điển của người mới — cái đầu làm repo phình to vô ích, cái sau làm **lộ thông tin bí mật**. Tạo `.gitignore` **trước** khi commit lần đầu để tránh lỡ đưa chúng vào lịch sử.

Commit file `.gitignore`:

```bash
git add .gitignore
git commit -m "Them .gitignore"
```

## Bước 5 — Đẩy code lên GitHub

**1. Tạo tài khoản** tại [https://github.com](https://github.com) nếu chưa có (dùng đúng email đã cấu hình ở Bước 1).

**2. Tạo repository mới** trên GitHub: nút **New** → đặt tên (vd `hoc-automation`) → **không** tích "Add a README" để tránh xung đột với repo local → **Create repository**.

**3. Kết nối repo local với remote** bằng các lệnh GitHub hiển thị sau khi tạo:

```bash
git remote add origin https://github.com/<tai-khoan>/hoc-automation.git
git branch -M main
git push -u origin main
```

- `git remote add origin <url>` — khai báo remote tên `origin` trỏ tới repo trên GitHub.
- `git branch -M main` — đặt tên nhánh chính là `main` (chuẩn hiện hành).
- `git push -u origin main` — **đẩy (push)** các commit local lên remote. Cờ `-u` thiết lập liên kết để các lần sau chỉ cần gõ `git push`.

Lần đầu push, GitHub yêu cầu xác thực. Cách khuyến nghị là dùng **Personal Access Token** (token thay cho mật khẩu) hoặc đăng nhập qua GitHub CLI / trình quản lý credential. Sau khi push xong, tải lại trang repo trên GitHub — toàn bộ file và lịch sử commit đã hiện trên đó.

Chu trình thường ngày từ đây về sau:

```bash
git add .
git commit -m "Mo ta thay doi"
git push
```

## Bước 6 — Pull request: cộng tác qua nhánh

**Branch (nhánh)** là một đường phát triển song song, tách khỏi `main`, để bạn làm một thay đổi mà không ảnh hưởng nhánh chính cho tới khi hoàn tất.

**Pull request (PR)** là đề xuất gộp (merge) các commit từ một nhánh vào nhánh khác, kèm cơ chế xem xét (review) và thảo luận trước khi gộp. Đây là quy trình cộng tác chuẩn ở hầu hết các team.

Quy trình tối thiểu:

```bash
git checkout -b them-tinh-nang   # tạo và chuyển sang nhánh mới
# ... sửa code, git add, git commit ...
git push -u origin them-tinh-nang  # đẩy nhánh mới lên GitHub
```

Sau khi push, GitHub hiển thị nút **Compare & pull request**. Mở PR, mô tả thay đổi, rồi **Merge** khi đã sẵn sàng. Trong dự án thật, đây cũng là thời điểm CI tự động chạy test trên PR (Bài 30) — code chỉ được merge khi test pass.

Ở giai đoạn tự học một mình, bạn có thể commit thẳng vào `main` cho nhanh. Nhưng nên tập làm việc theo nhánh + PR sớm, vì đó là cách mọi team chuyên nghiệp vận hành.

## Bước 7 — Vượt khỏi happy-path: clone, pull, diff và sửa khi lỡ tay

Sáu lệnh ở các bước trên đủ cho luồng cơ bản. Nhưng trong thực tế, bạn sẽ gặp thêm vài tình huống thường ngày dưới đây — nắm chúng giúp bạn không hoảng khi mọi thứ không "thẳng tắp".

### git clone — lấy một repo có sẵn về máy

Ở Bước 2 ta dùng `git init` để biến một thư mục *trống* thành repo. Ngược lại, khi muốn lấy một repo **đã tồn tại** trên GitHub về máy (repo của bạn, của team, hoặc một project cần test), dùng `git clone`:

```bash
git clone https://github.com/<tai-khoan>/<ten-repo>.git
```

Lệnh tải toàn bộ repo kèm lịch sử về một thư mục mới, và tự thiết lập sẵn remote `origin`. Đây là cách bạn bắt đầu làm việc với một codebase có sẵn — phổ biến hơn `git init` rất nhiều trong công việc thực tế.

### git pull — đồng bộ thay đổi từ remote về local

`git push` đẩy thay đổi *lên* remote. Chiều ngược lại là `git pull` — kéo các commit mới từ remote *về* local:

```bash
git pull
```

Bạn cần `pull` khi: làm trên nhiều máy, người khác (hoặc CI) đã đẩy code lên, hoặc PR vừa được merge. **Thói quen tốt:** `git pull` trước khi bắt đầu làm việc mỗi ngày, để local luôn cập nhật so với remote. Bỏ qua bước này là nguyên nhân số một gây ra xung đột không đáng có.

### git diff — xem chính xác đã thay đổi gì

Trước khi `git add`, nên xem mình thực sự đã đổi gì. `git status` chỉ cho biết *file nào* đổi; `git diff` cho biết *nội dung* đổi ra sao:

```bash
git diff            # xem thay đổi ở working directory (chưa stage)
git diff --staged   # xem thay đổi đã đưa vào staging
```

Dấu `-` là dòng bị xóa, `+` là dòng thêm vào. Đọc `diff` trước khi commit là thói quen giúp bạn không commit nhầm file rác, code debug, hay thông tin nhạy cảm.

### Sửa khi lỡ tay

Người mới hay hoảng khi thao tác nhầm. Phần lớn tình huống đều khôi phục được. Ba trường hợp thường gặp nhất:

```bash
# 1. Lỡ sửa một file, muốn bỏ thay đổi, quay lại bản đã commit gần nhất:
git restore <file>

# 2. Đã "git add" nhầm file, muốn đưa nó ra khỏi staging (giữ nguyên nội dung sửa):
git restore --staged <file>

# 3. Vừa commit nhưng muốn sửa lại commit message, hoặc thêm file còn sót vào commit đó:
git add <file-con-sot>
git commit --amend -m "Commit message moi"
```

> Lưu ý quan trọng: `git restore <file>` **xóa vĩnh viễn** các thay đổi chưa commit của file đó — đã chạy thì không lấy lại được. Chỉ dùng khi chắc chắn muốn bỏ. Còn `git commit --amend` thì **viết lại** commit gần nhất, nên **chỉ amend những commit chưa push lên remote**; amend một commit đã push rồi đẩy lại sẽ gây rối lịch sử cho người khác.

### Merge conflict — khi Git không tự gộp được

**Merge conflict (xung đột gộp)** xảy ra khi hai thay đổi chạm vào **cùng một vùng của cùng một file**, và Git không tự quyết được nên giữ bản nào. Bạn sẽ gặp nó khi `git pull` hoặc merge một nhánh.

Khi xung đột, Git đánh dấu vùng tranh chấp ngay trong file:

```text
<<<<<<< HEAD
Đây là nội dung ở nhánh hiện tại của bạn
=======
Đây là nội dung đến từ phía remote / nhánh kia
>>>>>>> origin/main
```

Cách xử lý:

1. Mở file, tìm các dấu `<<<<<<<`, `=======`, `>>>>>>>`.
2. Quyết định giữ nội dung nào — giữ một bên, bên kia, hoặc kết hợp cả hai. **Xóa toàn bộ ba dòng đánh dấu** sau khi đã chọn.
3. `git add <file>` để báo Git rằng xung đột đã được giải quyết.
4. `git commit` để hoàn tất việc gộp.

Conflict trông đáng sợ nhưng bản chất đơn giản: Git chỉ đang hỏi bạn "giữ bản nào?". VS Code còn có giao diện hỗ trợ chọn từng vùng (*Accept Current* / *Accept Incoming*), dùng quen sẽ thấy nhẹ nhàng.

## Tổng kết các lệnh cần nhớ

| Lệnh | Tác dụng |
|------|----------|
| `git init` | Khởi tạo repo trong thư mục hiện tại |
| `git clone <url>` | Tải một repo có sẵn từ remote về máy |
| `git status` | Xem trạng thái các file |
| `git diff` / `git diff --staged` | Xem nội dung thay đổi (working / staging) |
| `git add <file>` / `git add .` | Đưa thay đổi vào staging |
| `git restore <file>` | Bỏ thay đổi chưa commit của file |
| `git restore --staged <file>` | Đưa file ra khỏi staging |
| `git commit -m "..."` | Tạo commit từ staging |
| `git commit --amend` | Sửa lại commit gần nhất (chưa push) |
| `git log --oneline` | Xem lịch sử commit |
| `git pull` | Kéo commit mới từ remote về local |
| `git push` | Đẩy commit lên remote |
| `git checkout -b <ten>` | Tạo và chuyển sang nhánh mới |

Giai đoạn 0 đến đây kết thúc: bạn đã có môi trường chạy code và công cụ quản lý mã nguồn. [Bài 4](../bien-va-kieu-du-lieu-javascript/) bắt đầu Giai đoạn 1 — học JavaScript từ nền tảng, khởi đầu với biến và kiểu dữ liệu.

## 🛠 Thực hành

1. **Hoàn tất chu trình:** đưa thư mục `hoc-automation` lên một repo GitHub mới của bạn (init → add → commit → tạo repo → push). Xác nhận file và commit hiển thị trên GitHub.
2. **Kiểm chứng .gitignore:** tạo một thư mục `node_modules/` rỗng và một file `.env` bất kỳ trong repo, chạy `git status`, xác nhận chúng **không** xuất hiện trong danh sách theo dõi.
3. **Tập pull request:** tạo nhánh mới, sửa một file, commit, push nhánh đó lên GitHub và mở một pull request.
4. **Clone và pull:** clone repo vừa tạo về một thư mục khác bằng `git clone`. Trên GitHub, sửa trực tiếp một file (nút bút chì → commit), rồi quay lại thư mục clone chạy `git pull` để kéo thay đổi đó về.
5. **Đọc diff và sửa khi lỡ tay:** sửa file `chao.js`, chạy `git diff` để xem thay đổi. Sau đó dùng `git restore chao.js` để bỏ thay đổi đó. Tiếp tục: `git add chao.js` rồi `git restore --staged chao.js` để tập đưa file ra/vào staging.
6. **Tạo và giải quyết merge conflict (nâng cao):** trên nhánh `main`, sửa dòng đầu của một file rồi commit. Tạo nhánh mới từ trước đó, sửa *cùng dòng* đó thành nội dung khác rồi commit. Merge hai nhánh để tạo xung đột, sau đó giải quyết theo 4 bước ở Bước 7.

## Website tham khảo

- [Git — Tài liệu chính thức](https://git-scm.com/doc) — tham chiếu đầy đủ về Git.
- [Pro Git (sách miễn phí)](https://git-scm.com/book/vi) — sách nền tảng về Git, có bản tiếng Việt; đọc các chương đầu để hiểu sâu hơn.
- [GitHub Docs](https://docs.github.com) — hướng dẫn sử dụng GitHub.
- [GitHub — Về pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) — chi tiết quy trình pull request.
- [gitignore.io](https://www.toptal.com/developers/gitignore) — sinh nội dung `.gitignore` theo ngôn ngữ/công cụ.

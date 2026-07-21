+++
date        = '2026-06-28T08:00:00+07:00'
draft       = false
title       = 'Git là gì? Tại sao mọi developer cần biết Git?'
slug        = 'git-la-gi-tai-sao-can-dung-git'
summary     = 'Tìm hiểu Git là gì, lịch sử ra đời, tại sao nó quan trọng với mọi developer, và những khái niệm nền tảng cần nắm trước khi bắt đầu.'
thumbnail   = '/images/git-series/01-git-la-gi.webp'
weight      = 1
columns     = 2
categories  = ['it']
subcategories = ['version-control']
tags        = ['git', 'devops']
series      = ['huong-dan-git-tu-co-ban-den-nang-cao']
authors     = ['Nguyen Chung']
+++

Git là một trong những kỹ năng không thể thiếu với bất kỳ developer nào. Dù bạn làm việc một mình hay trong nhóm, Git giúp bạn quản lý code an toàn, hiệu quả và chuyên nghiệp. Bài viết mở đầu series này sẽ giải thích Git là gì và tại sao bạn cần học nó.

## Version Control System (VCS) là gì?

Hãy tưởng tượng bạn đang viết một đề án quan trọng. Sau vài lần chỉnh sửa, thư mục của bạn trông như thế này:

```
đề-án-v1.docx
đề-án-v2.docx
đề-án-final.docx
đề-án-final-2.docx
đề-án-final-chinh-sua-cuoi.docx
đề-án-final-chinh-sua-cuoi-OK.docx
```

Đây chính là "version control" thủ công — rất lộn xộn, dễ nhầm lẫn, và không thể làm việc nhóm hiệu quả.

**Version Control System (VCS)** là công cụ giải quyết vấn đề này, giúp bạn:

- Lưu lại toàn bộ lịch sử thay đổi của code
- Biết ai đã thay đổi gì, khi nào, và tại sao
- Quay lại phiên bản cũ bất cứ lúc nào
- Làm việc nhóm không bị xung đột

## Git là gì?

**Git** là một hệ thống Version Control **phân tán** (Distributed Version Control System — DVCS), được tạo ra bởi **Linus Torvalds** vào năm 2005 — người cũng là cha đẻ của nhân Linux.

### Centralized vs Distributed VCS

```
     CENTRALIZED VCS (SVN)            DISTRIBUTED VCS (Git)

          [Server trung tâm]               [Remote Server]
                  │                        /      │      \
          ┌───────┼───────┐           [Dev A]  [Dev B]  [Dev C]
        [A]      [B]      [C]            │        │        │
                                      [Local   [Local   [Local
                                       Repo]    Repo]    Repo]

    Mất server = mất tất cả         Mỗi người có bản sao đầy đủ
```

Điểm khác biệt then chốt:

| | Centralized (SVN) | Distributed (Git) |
|---|---|---|
| Lưu trữ | Chỉ trên server | Mỗi máy có toàn bộ history |
| Offline | Không làm việc được | Vẫn commit, branch bình thường |
| Tốc độ | Chậm (cần kết nối) | Cực nhanh (local) |
| Rủi ro | Mất server = mất hết | Phân tán, an toàn hơn |

### Tại sao Linus Torvalds tạo ra Git?

Năm 2005, cộng đồng phát triển Linux kernel không còn được dùng miễn phí **BitKeeper** (công cụ VCS thương mại họ đang dùng). Linus quyết định tự xây dựng một công cụ mới với các yêu cầu rõ ràng:

- Tốc độ **cực nhanh**
- Thiết kế **đơn giản**
- Hỗ trợ branching **mạnh mẽ**
- **Phân tán** hoàn toàn
- Xử lý được dự án lớn như Linux kernel (hàng nghìn contributors)

Kết quả? Chỉ sau vài tuần, Git ra đời và thay đổi cả ngành công nghiệp phần mềm.

## Tại sao bạn cần học Git?

### 1. Làm việc an toàn — không bao giờ mất code

Với Git, bạn có thể tự tin thử nghiệm mà không sợ phá vỡ thứ đang hoạt động:

```bash
# Tạo branch để thử nghiệm tính năng mới
git checkout -b feature/thu-nghiem

# Làm gì đó... nếu không ổn
git checkout main
git branch -D feature/thu-nghiem  # xóa đi, code gốc hoàn toàn nguyên vẹn
```

### 2. Lịch sử thay đổi hoàn chỉnh

```bash
$ git log --oneline
a1b2c3d (HEAD -> main) Fix: sửa lỗi validate email trống
e4f5g6h Feat: thêm tính năng đặt lại mật khẩu
i7j8k9l Refactor: tách UserService thành module riêng
m1n2o3p Init: khởi tạo dự án backend
```

Bạn biết chính xác: ai thay đổi gì, lúc nào, vì sao — không cần hỏi lại đồng nghiệp.

### 3. Làm việc nhóm hiệu quả

Mỗi người phát triển trên **branch riêng**, không can thiệp vào nhau. Khi xong thì **merge** lại — Git giúp tự động phát hiện và xử lý xung đột:

```
main:     A---B-----------M   (merge commit)
               \         /
feature:        C---D---E
```

### 4. Tiêu chuẩn của ngành

Hầu hết công ty hiện nay đều dùng Git. Không biết Git = khó xin được việc dev.

### 5. Nền tảng cho toàn bộ hệ sinh thái DevOps

```
Git commit → CI/CD pipeline → Build → Test → Deploy
         ↓
    Code Review (PR/MR)
         ↓
    Issue Tracking, Project Board
```

GitHub, GitLab, Bitbucket, Jenkins, GitHub Actions, GitLab CI — tất cả đều xoay quanh Git.

## Ba vùng quan trọng nhất trong Git

Đây là khái niệm nền tảng bạn **phải** hiểu:

```
┌───────────────────┐  git add   ┌──────────────┐  git commit  ┌─────────────┐
│  Working Directory │ ─────────▶│ Staging Area │ ────────────▶│  Repository │
│   (thư mục dự án) │           │   (Index)    │              │  (.git/)    │
└───────────────────┘           └──────────────┘              └─────────────┘
         ▲                                                             │
         └─────────────────── git checkout ───────────────────────────┘
```

- **Working Directory**: Thư mục dự án trên máy bạn — nơi bạn viết code.
- **Staging Area (Index)**: Vùng "chờ commit" — bạn chọn file nào sẽ vào commit tiếp theo.
- **Repository (.git/)**: Kho lưu trữ toàn bộ lịch sử commit, nằm trong thư mục ẩn `.git`.

Tại sao cần Staging Area? Vì đôi khi bạn thay đổi 5 file nhưng chỉ muốn commit 3 file. Staging Area cho phép bạn chọn lọc trước khi commit.

## Các khái niệm cơ bản cần nhớ

| Khái niệm | Giải thích |
|---|---|
| **Repository (Repo)** | Kho chứa code + toàn bộ lịch sử thay đổi |
| **Commit** | Một "snapshot" của code tại một thời điểm |
| **Branch** | Nhánh phát triển độc lập |
| **Merge** | Kết hợp hai branch lại với nhau |
| **Remote** | Bản sao của repo trên server (GitHub, GitLab...) |
| **Clone** | Tải về toàn bộ repo từ remote |
| **Push** | Đẩy commit từ local lên remote |
| **Pull** | Kéo thay đổi từ remote về local |

## Git vs SVN — Nên chọn cái nào?

| Tiêu chí | Git | SVN |
|---|---|---|
| Kiến trúc | Phân tán (distributed) | Tập trung (centralized) |
| Tốc độ | ⚡ Rất nhanh | Chậm hơn |
| Branching | ✅ Rất mạnh, nhanh | Phức tạp, chậm |
| Làm việc offline | ✅ Có | ❌ Không |
| Phổ biến năm 2026 | ✅ Tiêu chuẩn ngành | Ít dùng, legacy |
| Learning curve | Trung bình | Dễ hơn một chút |

**Câu trả lời**: Dùng Git. SVN vẫn tồn tại trong các hệ thống cũ nhưng Git là tiêu chuẩn của ngành hiện tại.

## Tóm tắt

- **Git** là Distributed VCS phổ biến nhất thế giới, do Linus Torvalds tạo năm 2005
- Git giúp **lưu lịch sử code**, **làm việc nhóm an toàn**, và **quay về phiên bản cũ** bất cứ lúc nào
- Ba vùng cốt lõi: **Working Directory → Staging Area → Repository**
- Git là **kỹ năng bắt buộc** với mọi developer hiện đại

---

**Bài tiếp theo**: [Cài đặt và cấu hình Git trên Windows, macOS, Linux →](/posts/cai-dat-va-cau-hinh-git/)

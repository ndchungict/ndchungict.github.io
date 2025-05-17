---
layout: post
title:  "Làm việc với Git Submodule"
summary: "Git Submodule là một tính năng trong Git cho phép bạn nhúng một repository Git khác vào trong một repository chính như một thư mục con."
author: chungnd
date: '2024-09-11 13:35:23 +0700'
category: ['develop','devops']
tag: [git]
thumbnail: /assets/img/post_images/lam-viec-voi-git-submodule.png
keywords: git,tutorial,develop,submodule
permalink: /lam-viec-voi-git-submodule/
usemathjax: true
---
## Git Submodule là gì?
`Git Submodule` là một tính năng trong Git cho phép bạn nhúng một repository Git khác vào trong một repository chính như một thư mục con. Điều này hữu ích khi bạn muốn tích hợp một dự án phụ hoặc thư viện vào dự án chính mà vẫn giữ chúng độc lập về mặt phát triển và lịch sử commit.


## Đặc điểm của Git Submodule.
* `Nhúng Repository`: Một submodule là một liên kết đến một repository Git khác bên trong repository chính, nhưng không trực tiếp sao chép mã nguồn của submodule vào repository chính.
* `Độc lập về lịch sử commit`: Mỗi submodule có thể có lịch sử commit riêng, giúp dễ dàng phát triển và cập nhật thư viện hoặc dự án con mà không làm ảnh hưởng đến repository chính.
* `Quản lý phiên bản`: Submodule lưu lại trạng thái của nó dưới dạng một commit cụ thể từ repository con, vì vậy, bạn có thể giữ repository chính luôn đồng bộ với phiên bản mong muốn của submodule mà không bị phụ thuộc vào các thay đổi liên tục từ dự án phụ.


## Khi nào nên sử dụng Submodule?
* Khi bạn cần sử dụng lại một thư viện hoặc dự án con ở nhiều dự án khác nhau.
* Khi bạn muốn giữ dự án phụ tách biệt khỏi dự án chính, nhưng vẫn có thể theo dõi và cập nhật nó một cách dễ dàng.

Ví dụ, bạn có một dự án chính và bạn muốn sử dụng lại một thư viện mã nguồn mở. Thay vì sao chép mã nguồn của thư viện vào dự án chính, bạn có thể thêm nó như một submodule.

## Các bước cơ bản sử dụng Git Submodule

### 1. Thêm Submodule vào dự án chính
Để thêm một repository khác làm submodule vào dự án chính của bạn, sử dụng lệnh sau:
```bash
git submodule add <URL repository>
```
Ví dụ
```bash
git submodule add https://github.com/user/project-submodule.git
```
Lệnh này sẽ:
* Thêm submodule vào dự án hiện tại.
* Tạo một thư mục chứa submodule.
* Tạo một file .gitmodules trong dự án chính để theo dõi submodule.

### 2. Clone một repository có chứa submodule
Khi bạn clone một repository có chứa submodule, bạn cần tải về cả submodule bằng cách sử dụng lệnh:
```bash
git clone --recurse-submodules <URL repository>
```
Nếu bạn đã clone repository mà quên thêm flag `--recurse-submodules`, bạn có thể khởi tạo submodule sau khi clone bằng cách:
```bash
git submodule init
git submodule update
```

### 3. Cập nhật Submodule
Để cập nhật submodule lên commit mới nhất của nó (nếu có thay đổi), bạn có thể chạy lệnh:
```bash
git submodule update --remote
```
Lệnh này sẽ lấy các thay đổi mới nhất từ remote repository của submodule và cập nhật nó trong dự án chính của bạn.

### 4. Thay đổi commit của Submodule
Nếu bạn muốn thay đổi submodule để trỏ đến một commit cụ thể, bạn có thể vào thư mục submodule, sau đó checkout commit mà bạn muốn:
```bash
cd path/to/submodule
git checkout <commit-hash>
```
Sau đó, trở lại thư mục chính và commit thay đổi này:
```bash
cd ..
git add path/to/submodule
git commit -m "Update submodule"
```
### 5. Xóa Submodule
Để xóa một submodule, làm theo các bước sau:
* Xóa dòng submodule từ file .gitmodules:

Mở file .gitmodules và xóa entry tương ứng với submodule.

* Xóa mục submodule từ .git/config:
```bash
git config -f .git/config --remove-section submodule.<path/to/submodule>
```
* Xóa thư mục submodule:
```bash
git rm --cached <path/to/submodule>
```

* Xóa thư mục submodule còn lại nếu cần:
```bash
rm -rf <path/to/submodule>
```

* Sau đó commit những thay đổi:
```bash
git commit -m "Remove submodule"
```

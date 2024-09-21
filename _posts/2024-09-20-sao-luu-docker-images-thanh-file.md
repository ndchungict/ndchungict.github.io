---
layout: post
title:  "Sao lưu docker images thành file"
summary: "Docker có thể export hoặc import một hoặc nhiều images ra file tar"
author: chungnd
date: '2024-09-20 11:10:23 +0700'
category: ['develop','devops']
tag: [docker]
series: "docker"
thumbnail: /assets/img/posts/docker-images-to-file.webp
keywords: develop,devops
permalink: /sao-luu-docker-images-thanh-file/
usemathjax: true
---
Lệnh docker save được sử dụng để xuất (export) một hoặc nhiều Docker image ra file tar. Điều này rất hữu ích khi bạn muốn sao lưu một image hoặc chuyển image từ một hệ thống này sang hệ thống khác mà không cần phải đẩy (push) image lên Docker Hub hoặc một registry khác.

### Cú pháp của lệnh docker save:

```bash
docker save -o <đường-dẫn-file-tar> <image-name>[:tag]
```

* `-o` <đường-dẫn-file-tar>: Đường dẫn đến file tar mà bạn muốn lưu image vào. Ví dụ: myimage.tar.
* `<image-name>[:tag]`: Tên image bạn muốn export. Nếu không chỉ định tag, Docker sẽ sử dụng tag mặc định là latest.
Ví dụ:

##### 1. Lưu một image với tag latest vào file:

```bash
docker save -o myimage.tar my-app:latest
```
Trong ví dụ này, image my-app với tag latest sẽ được lưu vào file myimage.tar.

##### 2. Lưu một image không có tag cụ thể (sử dụng tag `latest` mặc định):

```bash
docker save -o myimage.tar my-app
```
Nếu bạn không chỉ định tag, Docker sẽ mặc định sử dụng tag latest để lưu.

##### 3. Lưu nhiều image vào cùng một file:

Bạn cũng có thể lưu nhiều image vào một file tar duy nhất:

```bash
docker save -o multiple-images.tar my-app:latest another-app:v1
```
Lệnh này sẽ lưu cả `my-app:latest` và `another-app:v1` vào file `multiple-images.tar`.

##### 4. Tải lại (import) Docker image từ file .tar

Khi bạn đã export Docker image bằng lệnh docker save, bạn có thể tải lại image từ file .tar bằng lệnh docker load:

```bash
docker load -i <đường-dẫn-file-tar>
```
Ví dụ:

```bash
docker load -i myimage.tar
```

##### 5. Kiểm tra image sau khi tải:

Sau khi tải image từ file tar, bạn có thể kiểm tra danh sách các image đã tải về bằng lệnh:

```bash
docker images
```

Lệnh này sẽ hiển thị danh sách các image hiện có trên máy của bạn.

**Tóm tắt:**
Lệnh docker save giúp bạn xuất Docker image ra file tar để sao lưu hoặc chuyển giao.

Lệnh docker load cho phép bạn tải lại image từ file tar.

Đây là cách hữu ích để di chuyển image giữa các máy mà không cần tải lên hoặc kéo xuống từ một registry trung gian.
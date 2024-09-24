---
layout: post
title:  "Sử dụng Docker bind mount"
summary: "Trong Docker, Bind Mount là một cơ chế để chia sẻ thư mục giữa host và container"
author: chungnd
date: '2024-09-23 11:10:23 +0700'
category: ['develop','devops']
tag: [docker]
series: "docker"
thumbnail: /assets/img/posts/su-dung-docker-bind-mount.webp
keywords: bind,mount
permalink: /su-dung-docker-bind-mount/
usemathjax: true
---

Trong Docker, Bind Mount là một cơ chế để chia sẻ thư mục giữa host và container, giúp container có thể truy cập vào dữ liệu trên hệ thống tệp của máy host. Bind Mount rất hữu ích trong việc chia sẻ dữ liệu hoặc lưu trữ thông tin, chẳng hạn như log files hoặc dữ liệu tạm thời, giữa container và hệ thống host.

### Cách sử dụng Bind Mount trong Docker

#### 1. Tạo Bind Mount: 
Khi chạy container, bạn có thể sử dụng tùy chọn -v hoặc --mount để thiết lập Bind Mount. Cú pháp của hai lệnh này hơi khác nhau.

Sử dụng `-v`:
```bash
docker run -d -v /path/on/host:/path/in/container image_name
```
Trong đó:

* `/path/on/host`: Đường dẫn đến thư mục trên máy host.
* `/path/in/container`: Đường dẫn đến thư mục trong container mà bạn muốn mount.
* `image_name`: Tên của image Docker mà bạn đang chạy.
Ví dụ:

```bash
docker run -d -v /home/user/data:/app/data nginx
```
Câu lệnh này sẽ mount thư mục /home/user/data trên host vào thư mục /app/data trong container.

Sử dụng `--mount`:

Cú pháp này rõ ràng hơn và linh hoạt hơn:

```bash
docker run -d --mount type=bind,source=/path/on/host,target=/path/in/container image_name
```
Ví dụ:

```bash
docker run -d --mount type=bind,source=/home/user/data,target=/app/data nginx
```
#### 2. Các thông số quan trọng:

* `type=bind`: Xác định rằng đây là Bind Mount.
* `source`: Đường dẫn trên host mà bạn muốn mount.
* `target`: Đường dẫn trong container mà bạn muốn mount đến.

#### 3. Lợi ích của Bind Mount:

- Chia sẻ dữ liệu: Bạn có thể chia sẻ dữ liệu giữa container và host một cách dễ dàng.
- Phát triển ứng dụng: Trong quá trình phát triển, bạn có thể chia sẻ mã nguồn của dự án từ máy host vào container để không phải build lại container khi có thay đổi mã.
- Log: Dữ liệu log có thể được lưu trực tiếp trên host để dễ dàng theo dõi và phân tích.

#### 4. Lưu ý:

- Bind Mount không được Docker quản lý chặt chẽ, bạn cần đảm bảo rằng đường dẫn trên host là chính xác và có quyền truy cập.
- Vì Bind Mount có thể thay đổi trực tiếp hệ thống tệp trên host, nên cẩn thận khi thao tác để tránh làm hỏng dữ liệu.


**Ví dụ chi tiết:**
```bash
docker run -it --name mycontainer -v /home/user/myproject:/app ubuntu /bin/bash
```
Trong ví dụ này:

- Thư mục /home/user/myproject trên host sẽ được mount vào thư mục /app trong container.
- Khi bạn thay đổi nội dung trong thư mục /home/user/myproject trên host, thay đổi này cũng sẽ xuất hiện trong container, và ngược lại.
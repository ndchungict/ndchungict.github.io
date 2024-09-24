---
layout: post
title:  "Sử dụng Docker Volume"
summary: "Docker Volumes là một công cụ mạnh mẽ để quản lý dữ liệu giữa các container."
author: chungnd
date: '2024-09-23 10:10:23 +0700'
category: ['develop','devops']
tag: [docker]
series: "docker"
thumbnail: /assets/img/posts/su-dung-docker-volume.webp
keywords: volume
permalink: /su-dung-docker-volume/
usemathjax: true
---
Docker Volumes là một công cụ mạnh mẽ để quản lý dữ liệu giữa các container. Nó cho phép lưu trữ dữ liệu ngoài container và giữ lại dữ liệu ngay cả khi container bị xóa. Sau đây là cách sử dụng Docker Volume trong các trường hợp khác nhau.

### 1. Tạo Volume
Trước khi sử dụng Volume, bạn có thể tạo một Volume riêng bằng lệnh:

```bash
docker volume create my_volume
```
- `my_volume`: Tên của Volume bạn muốn tạo.

Bạn có thể kiểm tra danh sách các Volume hiện có bằng lệnh:

```bash
docker volume ls
```

### 2. Sử dụng Volume khi chạy container
Khi chạy container, bạn có thể gắn Volume vào bằng tùy chọn `-v` hoặc `--mount`:

**Cách 1: Sử dụng `-v` (tùy chọn ngắn)**
```bash
docker run -d -v my_volume:/path/in/container image_name
```
Trong đó:
- `my_volume`: Tên của Volume mà bạn đã tạo hoặc Docker sẽ tự tạo nếu Volume không tồn tại.
- `/path/in/container`: Đường dẫn trong container nơi bạn muốn mount Volume.
- `image_name`: Tên của image Docker mà bạn muốn chạy.
Ví dụ:

```bash
docker run -d -v my_volume:/var/www/html nginx
```
Lệnh này gắn Volume my_volume vào thư mục /var/www/html của container Nginx.

**Cách 2: Sử dụng --mount (tùy chọn đầy đủ và rõ ràng hơn)**
```bash
docker run -d --mount source=my_volume,target=/path/in/container image_name
```
Trong đó:
- source=my_volume: Nguồn Volume bạn muốn sử dụng.
- target=/path/in/container: Thư mục trong container mà Volume sẽ được gắn vào.
Ví dụ:

```bash
docker run -d --mount source=my_volume,target=/var/lib/mysql mysql
```
Lệnh này sẽ chạy một container MySQL và gắn Volume my_volume vào thư mục /var/lib/mysql của container, nơi MySQL lưu trữ dữ liệu database.

### 3. Kiểm tra và quản lý Volumes
**Liệt kê các Volume:**

```bash
docker volume ls
```

**Xem thông tin chi tiết của một Volume:**

```bash
docker volume inspect my_volume
```

**Xóa Volume:**

```bash
docker volume rm my_volume
```
Lưu ý rằng Volume chỉ có thể bị xóa khi không còn container nào sử dụng nó.

### 4. Sử dụng Volume trong Docker Compose
Docker Compose giúp bạn dễ dàng quản lý nhiều container và Volume trong một file cấu hình docker-compose.yml. Ví dụ:

```yaml
version: '3'
services:
  db:
    image: mysql
    environment:
      MYSQL_ROOT_PASSWORD: example
    volumes:
      - db_data:/var/lib/mysql

  web:
    image: wordpress
    ports:
      - "8080:80"
    volumes:
      - web_data:/var/www/html
    depends_on:
      - db

volumes:
  db_data:
  web_data:
```
Trong ví dụ trên:

- Volume db_data được gắn vào thư mục /var/lib/mysql trong container MySQL.
- Volume web_data được gắn vào thư mục /var/www/html trong container WordPress.

### 5. Tính năng của Docker Volumes
- **Volume không phụ thuộc vào container**: Dữ liệu trong Volume vẫn tồn tại ngay cả khi container bị xóa.
- **Chia sẻ dữ liệu giữa các container**: Bạn có thể gắn cùng một Volume vào nhiều container khác nhau, giúp chia sẻ dữ liệu giữa các container.
- **Sao lưu dữ liệu**: Bạn có thể dễ dàng sao lưu dữ liệu từ Volume bằng cách mount Volume vào một container và thực hiện các thao tác sao lưu.
   

#### Ví dụ thực tế về quản lý Volume:
**Sao lưu dữ liệu từ Volume:**

Giả sử bạn có một Volume chứa dữ liệu MySQL và bạn muốn sao lưu nó. Bạn có thể thực hiện bằng cách gắn Volume vào một container và sao chép dữ liệu ra ngoài:

```bash
docker run --rm -v my_volume:/var/lib/mysql -v /path/to/backup:/backup busybox tar czf /backup/backup.tar.gz /var/lib/mysql
```
Trong ví dụ này:

- Volume my_volume được gắn vào container tạm thời.
- Dữ liệu trong Volume được nén thành file backup.tar.gz và lưu vào thư mục /path/to/backup trên host.

**Khôi phục dữ liệu vào Volume:**
Bạn có thể khôi phục dữ liệu đã sao lưu vào Volume bằng cách sử dụng lệnh tương tự:

```bash
docker run --rm -v my_volume:/var/lib/mysql -v /path/to/backup:/backup busybox tar xzf /backup/backup.tar.gz -C /
```

Tổng kết
Docker Volumes là cách tốt nhất để quản lý dữ liệu lâu dài và chia sẻ dữ liệu giữa các container. Sử dụng Volumes giúp bảo toàn dữ liệu ngay cả khi container bị xóa, đồng thời tạo sự tiện lợi trong việc quản lý và sao lưu dữ liệu.
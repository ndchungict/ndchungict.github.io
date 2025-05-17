---
layout: post
title:  "Một số câu lệnh cơ bản trong Docker"
summary: "Docker cung cấp nhiều câu lệnh khác nhau để quản lý và vận hành container, image, network, và volume"
author: chungnd
date: '2024-09-20 10:10:23 +0700'
category: ['develop','devops']
tag: [docker]
series: "docker"
thumbnail: /assets/img/post_images/it/mot-so-cau-lenh-co-ban-trong-docker.webp
keywords: develop,devops,cmd
permalink: /mot-so-cau-lenh-co-ban-trong-docker/
usemathjax: true
---
Docker cung cấp nhiều câu lệnh khác nhau để quản lý và vận hành container, image, network, và volume. Dưới đây là một số câu lệnh Docker cơ bản và phổ biến, được chia thành các nhóm chính:

### 1. Câu lệnh liên quan đến Docker container:

* #### Tạo và chạy container:

```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```
Ví dụ:
```bash
docker run -d -p 80:80 nginx
```
Chạy container từ image Nginx với chế độ nền (-d) và ánh xạ cổng 80 của máy chủ đến cổng 80 của container (-p 80:80).

* #### Liệt kê các container đang chạy:

```bash
docker ps
```
Hiển thị danh sách các container đang chạy.

* #### Liệt kê tất cả container (bao gồm cả container đã dừng):

```bash
docker ps -a
```

* #### Dừng một container:

```bash
docker stop CONTAINER_ID/NAME
```
Ví dụ:
```bash
docker stop my_container
```

* #### Khởi động lại một container:

```bash
docker restart CONTAINER_ID/NAME
```

* #### Xóa một container:

```bash
docker rm CONTAINER_ID/NAME
```
Ví dụ:
```bash
docker rm my_container
```

* #### Truy cập vào một container đang chạy (mở terminal trong container):

```bash
docker exec -it CONTAINER_ID/NAME bash
```
Ví dụ:
```bash
docker exec -it my_container bash
```

* #### Xem log của một container:

```bash
docker logs CONTAINER_ID/NAME
```

* #### Xóa tất cả các container đã dừng:

```bash
docker container prune
```

### 2. Câu lệnh liên quan đến Docker image:

* #### Tải image từ Docker Hub:

```bash
docker pull IMAGE_NAME[:TAG]
```
Ví dụ:
```bash
docker pull nginx:latest
```

* #### Liệt kê các image trên máy cục bộ:

```bash
docker images
```

* #### Xóa một image:
```bash
docker rmi IMAGE_ID/NAME
```
Ví dụ:
```bash
docker rmi nginx
```

* #### Xóa tất cả các image không sử dụng:

```bash
docker image prune
```

* #### Build một image từ Dockerfile:

```bash
docker build -t IMAGE_NAME .
```
Ví dụ:
```bash
docker build -t myapp .
```

* #### Gắn tag cho một image:

```bash
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
```
Ví dụ:
```bash
docker tag myapp:latest myrepo/myapp:v1.0
```

* #### Đẩy một image lên Docker Hub:

```bash
docker push IMAGE_NAME[:TAG]
```
Ví dụ:
```bash
docker push myrepo/myapp:v1.0
```

### 3. Câu lệnh liên quan đến network:

* #### Liệt kê các network:

```bash
docker network ls
```

* #### Tạo một network mới:

```bash
docker network create NETWORK_NAME
```

* #### Xóa một network:

```bash
docker network rm NETWORK_NAME
```

* #### Kết nối container vào một network:

```bash
docker network connect NETWORK_NAME CONTAINER_NAME
```

* #### Ngắt kết nối container khỏi một network:

```bash
docker network disconnect NETWORK_NAME CONTAINER_NAME
```

### 4. Câu lệnh liên quan đến volume:
* #### Liệt kê các volume:

```bash
docker volume ls
```

* #### Tạo một volume mới:

```bash
docker volume create VOLUME_NAME
```

* #### Xóa một volume:

```bash
docker volume rm VOLUME_NAME
```

* #### Gắn volume vào container:

```bash
docker run -d -v VOLUME_NAME:/path/in/container IMAGE
```
Ví dụ:
```bash
docker run -d -v my_volume:/var/lib/mysql mysql
```

### 5. Câu lệnh quản lý hệ thống:
* #### Hiển thị thông tin hệ thống Docker:

```bash
docker info
```

* #### Hiển thị chi tiết phiên bản Docker:

```bash
docker version
```

* #### Dọn dẹp hệ thống Docker (xóa dữ liệu không sử dụng):

```bash
docker system prune
```

* #### Dọn dẹp toàn bộ dữ liệu không sử dụng (container, image, volume, network):

```bash
docker system prune -a
```

### 6. Câu lệnh liên quan đến Docker Compose:
Docker Compose được sử dụng để quản lý các ứng dụng Docker có nhiều container hoạt động cùng nhau.

* #### Khởi động dịch vụ được định nghĩa trong docker-compose.yml:

```bash
docker-compose up
```

* #### Khởi động dịch vụ ở chế độ nền:

```bash
docker-compose up -d
```
* #### Dừng dịch vụ:

```bash
docker-compose down
```

* #### Xem log của các container trong Docker Compose:

```bash
docker-compose logs
```

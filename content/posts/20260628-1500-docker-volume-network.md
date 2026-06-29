+++
date        = '2026-06-28T15:00:00+07:00'
draft       = false
title       = 'Docker Volume & Network: lưu trữ và kết nối container'
slug        = 'docker-volume-network'
summary     = 'Hiểu cách lưu trữ dữ liệu bền vững với volume, phân biệt volume và bind mount, cùng cách các container giao tiếp với nhau qua Docker network.'
thumbnail   = '/images/docker-series/05-volume-network.svg'
weight      = 5
categories  = ['it']
tags        = ['docker', 'devops']
series      = ['huong-dan-docker-tu-a-den-z']
authors     = ['Nguyen Chung']
+++

Container vốn **tạm thời (ephemeral)** — xóa container là mất dữ liệu bên trong. Vậy database lưu ở đâu? Các container nói chuyện với nhau thế nào? Bài viết này trả lời hai câu hỏi đó qua **volume** và **network**.

## Vấn đề: dữ liệu biến mất khi container bị xóa

Mặc định, mọi thứ container ghi ra đều nằm trong **lớp ghi (writable layer)** của container đó. Khi container bị xóa, lớp này biến mất theo:

```
docker run postgres → ghi dữ liệu vào container
docker rm postgres  → DỮ LIỆU MẤT SẠCH
```

Rõ ràng database, file upload, log... cần tồn tại độc lập với vòng đời container. Đó là lý do có **volume**.

## Phần 1: Lưu trữ dữ liệu

Docker có hai cơ chế lưu trữ chính:

```
        ┌──────────────────────────────────────────┐
        │              Container                     │
        │  /var/lib/postgresql/data ───┐             │
        └──────────────────────────────┼────────────┘
                                        │
              ┌─────────────────────────┴─────────────────┐
              │                                            │
        ┌─────▼──────┐                          ┌──────────▼─────────┐
        │   VOLUME   │                          │    BIND MOUNT      │
        │ Docker quản│                          │ Thư mục cụ thể trên│
        │  lý, an    │                          │  máy host          │
        │  toàn      │                          │ (vd: ./data)       │
        └────────────┘                          └────────────────────┘
```

### Volume (khuyến nghị cho dữ liệu)

Volume do Docker quản lý, lưu ở khu vực riêng trên host. Đây là cách được khuyến nghị để lưu dữ liệu ứng dụng:

```bash
# Tạo volume
docker volume create pgdata

# Gắn volume vào container
docker run -d \
  --name db \
  -v pgdata:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  postgres:16

# Bây giờ xóa container, dữ liệu vẫn còn trong volume pgdata
docker rm -f db

# Chạy lại với cùng volume → dữ liệu cũ vẫn nguyên
docker run -d --name db -v pgdata:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret postgres:16
```

### Bind Mount (khuyến nghị cho code lúc dev)

Bind mount gắn một **thư mục cụ thể trên máy host** vào container. Rất hữu ích khi dev — sửa code trên host, container thấy ngay:

```bash
# Mount thư mục code hiện tại vào container
docker run -d \
  --name web \
  -p 3000:3000 \
  -v $(pwd):/app \
  node:20-alpine \
  npm run dev
```

### Volume vs Bind Mount — chọn cái nào?

| | Volume | Bind Mount |
|---|---|---|
| Ai quản lý | Docker | Bạn (đường dẫn host cụ thể) |
| Vị trí | Khu vực riêng của Docker | Thư mục bạn chỉ định |
| Dùng cho | Dữ liệu app (DB, upload) | Code khi dev, file cấu hình |
| Tính di động | Cao | Phụ thuộc đường dẫn host |
| Khuyến nghị | Production data | Development |

### Lệnh quản lý volume

```bash
# Liệt kê volume
docker volume ls

# Xem chi tiết một volume
docker volume inspect pgdata

# Xóa volume (mất dữ liệu)
docker volume rm pgdata

# Dọn volume không còn container nào dùng
docker volume prune
```

## Phần 2: Network — kết nối container

Trong ứng dụng thực tế, bạn thường có nhiều container: web app, database, cache... Chúng cần giao tiếp với nhau. Đó là việc của **Docker network**.

### Các loại network

| Loại | Mô tả |
|---|---|
| **bridge** | Mặc định; container trên cùng bridge network nói chuyện được với nhau |
| **host** | Container dùng chung network của host (không cô lập cổng) |
| **none** | Container không có network |

Phần lớn thời gian bạn làm việc với **bridge network** tự tạo.

### Vì sao cần tự tạo network?

Điểm mấu chốt: trên một **user-defined bridge network**, các container có thể gọi nhau **bằng tên** (Docker tự lo phần DNS):

```
┌──────────────── network: myapp-net ────────────────┐
│                                                      │
│   ┌──────────┐                  ┌──────────┐         │
│   │  web     │ ──"db:5432"────▶ │   db     │         │
│   │ (app)    │                  │(postgres)│         │
│   └──────────┘                  └──────────┘         │
│   gọi nhau bằng TÊN container, không cần IP           │
└──────────────────────────────────────────────────────┘
```

### Ví dụ: web app kết nối database

```bash
# 1. Tạo network riêng
docker network create myapp-net

# 2. Chạy database trên network đó
docker run -d \
  --name db \
  --network myapp-net \
  -e POSTGRES_PASSWORD=secret \
  postgres:16

# 3. Chạy web app trên cùng network
docker run -d \
  --name web \
  --network myapp-net \
  -p 3000:3000 \
  my-app:1.0
```

Trong code của `web`, bạn kết nối tới database bằng hostname là **`db`** (đúng bằng tên container), ví dụ:

```
DATABASE_URL=postgres://postgres:secret@db:5432/mydb
                                          ▲
                              tên container = hostname
```

Không cần biết IP — Docker tự phân giải `db` thành đúng IP của container database.

### Lệnh quản lý network

```bash
# Liệt kê network
docker network ls

# Xem chi tiết (gồm các container đang nối vào)
docker network inspect myapp-net

# Nối / gỡ container khỏi network
docker network connect myapp-net web
docker network disconnect myapp-net web

# Xóa network
docker network rm myapp-net
```

## Ghép lại: một stack hoàn chỉnh

Kết hợp volume + network để chạy một ứng dụng thực tế:

```bash
# Network và volume
docker network create shop-net
docker volume create shop-db

# Database: có network + volume bền vững
docker run -d --name shop-db \
  --network shop-net \
  -v shop-db:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  postgres:16

# Web app: cùng network, expose ra ngoài
docker run -d --name shop-web \
  --network shop-net \
  -p 8080:3000 \
  -e DATABASE_URL=postgres://postgres:secret@shop-db:5432/postgres \
  my-shop:1.0
```

Bạn sẽ nhận ra việc gõ tay nhiều lệnh thế này khá mệt và dễ sai. Đó chính là lý do **Docker Compose** ra đời — chủ đề của bài tiếp theo.

## Tóm tắt

- Container là tạm thời; dùng **volume** để lưu dữ liệu bền vững
- **Volume** hợp cho dữ liệu app (DB); **bind mount** hợp cho code khi dev
- Tạo **user-defined network** để container gọi nhau **bằng tên** thay vì IP
- Volume + network là nền tảng để chạy ứng dụng nhiều container thực tế

---

**Bài trước**: [← Dockerfile: tự đóng gói ứng dụng thành image](/posts/dockerfile-dong-goi-ung-dung/)

**Bài tiếp theo**: [Docker Compose: quản lý ứng dụng multi-container →](/posts/docker-compose-multi-container/)

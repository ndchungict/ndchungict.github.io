+++
date        = '2026-06-28T16:00:00+07:00'
draft       = false
title       = 'Tối ưu Docker image & best practices'
slug        = 'toi-uu-image-best-practices'
summary     = 'Giảm kích thước image với multi-stage build và image alpine, tận dụng layer cache, bảo mật image và những thực hành tốt giúp image gọn, nhanh, an toàn.'
thumbnail   = '/images/docker-series/07-toi-uu-image.webp'
weight      = 7
categories  = ['it']
tags        = ['docker', 'devops']
series      = ['huong-dan-docker-tu-a-den-z']
authors     = ['Nguyen Chung']
+++

Một image viết "cho chạy được" có thể nặng hàng GB, build chậm và tiềm ẩn rủi ro bảo mật. Bài viết này tập hợp những kỹ thuật giúp image của bạn **nhỏ hơn, build nhanh hơn và an toàn hơn** — đây là dấu hiệu của một developer dùng Docker thành thạo.

## Vì sao kích thước image quan trọng?

```
Image lớn  →  pull/push chậm  →  deploy chậm
           →  tốn dung lượng registry & server
           →  bề mặt tấn công (attack surface) rộng hơn
```

Một image gọn không chỉ tiết kiệm, mà còn an toàn và triển khai nhanh hơn. Mục tiêu: cắt bỏ mọi thứ không cần cho việc **chạy** ứng dụng.

## Kỹ thuật 1: Chọn image nền nhẹ

Image nền quyết định phần lớn kích thước cuối cùng:

| Image nền | Kích thước xấp xỉ |
|---|---|
| `node:20` | ~1 GB |
| `node:20-slim` | ~200 MB |
| `node:20-alpine` | ~130 MB |

`alpine` là bản Linux siêu nhẹ. Chỉ cần đổi base image, bạn đã cắt được rất nhiều dung lượng:

```dockerfile
# Thay vì
FROM node:20

# Dùng
FROM node:20-alpine
```

> Lưu ý: alpine dùng `musl` libc thay vì `glibc`. Hầu hết app chạy tốt, nhưng một số thư viện biên dịch native có thể cần điều chỉnh.

## Kỹ thuật 2: Multi-stage build (quan trọng nhất)

Đây là kỹ thuật giảm size mạnh nhất. Ý tưởng: dùng **một stage để build**, rồi **chỉ copy kết quả** sang một image runtime gọn nhẹ — bỏ lại toàn bộ công cụ build.

### Vấn đề khi build một stage

```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install      # gồm cả devDependencies
RUN npm run build    # cần toolchain build
CMD ["node", "dist/server.js"]
```

Image cuối chứa cả `node_modules` dev, mã nguồn TypeScript, công cụ build... toàn thứ **không cần lúc chạy**.

### Giải pháp multi-stage

```dockerfile
# ---- Stage 1: build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build        # tạo ra thư mục dist/

# ---- Stage 2: runtime ----
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production   # chỉ dependency production
COPY --from=builder /app/dist ./dist   # chỉ copy kết quả build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Minh họa sự khác biệt:

```
   ┌──────────────────────────┐        ┌──────────────────┐
   │  Stage builder           │        │  Image cuối cùng │
   │  - source code           │ copy   │  - dist/         │
   │  - devDependencies        │ ─────▶ │  - prod deps     │
   │  - build toolchain        │ dist/  │  (nhỏ gọn)       │
   │  (bị bỏ lại, không xuất)  │        │                  │
   └──────────────────────────┘        └──────────────────┘
```

Image cuối chỉ chứa thứ cần để **chạy** — thường nhỏ hơn nhiều lần.

## Kỹ thuật 3: Tận dụng layer cache

Như đã học ở bài Dockerfile: đặt thứ **ít thay đổi lên trên**, thứ **hay thay đổi xuống dưới**.

```dockerfile
COPY package*.json ./   # ít đổi → cache lâu
RUN npm install         # tốn thời gian → được cache
COPY . .                # code hay đổi → đặt cuối
```

Nhờ vậy, sửa code không kích hoạt cài lại dependency.

## Kỹ thuật 4: Gộp lệnh RUN, dọn rác trong cùng layer

Mỗi `RUN` tạo một layer. Quan trọng hơn: **phải dọn rác trong cùng layer tạo ra nó**, nếu không rác vẫn nằm trong layer cũ:

```dockerfile
# CHƯA tối ưu: rác apt vẫn nằm trong layer
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# TỐI ƯU: cài và dọn trong cùng một layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*
```

## Kỹ thuật 5: Luôn dùng .dockerignore

Tránh đưa file thừa vào build context và image:

```
node_modules
.git
.env
*.log
dist
coverage
Dockerfile
README.md
```

Build context nhỏ hơn → gửi tới Docker nhanh hơn → tránh lộ secret.

## Best practices về bảo mật

### 1. Không chạy bằng root

Mặc định container chạy với quyền root — rủi ro nếu bị khai thác. Tạo user thường:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY --chown=node:node . .
USER node          # chuyển sang user không phải root
CMD ["node", "server.js"]
```

> Image chính thức như `node` đã có sẵn user `node`.

### 2. Không nhúng secret vào image

```dockerfile
# TUYỆT ĐỐI KHÔNG
ENV DB_PASSWORD=secret123
```

Secret nhúng trong image sẽ nằm trong layer history, ai pull image cũng đọc được. Thay vào đó, truyền lúc chạy:

```bash
docker run -e DB_PASSWORD=secret123 my-app
# hoặc dùng --env-file, Docker secrets, hệ thống secret manager
```

### 3. Ghim version, quét lỗ hổng

```dockerfile
FROM node:20.11-alpine   # ghim version cụ thể, tránh "latest"
```

```bash
# Quét lỗ hổng image
docker scout cves my-app:1.0
```

### 4. Dùng image chính thức, tin cậy

Ưu tiên image official trên Docker Hub (có dấu "Official Image" hoặc "Verified Publisher").

## Đo lường: kiểm tra image của bạn

```bash
# Xem kích thước các image
docker images

# Xem từng layer và dung lượng nó thêm vào
docker history my-app:1.0

# Xem Docker đang chiếm bao nhiêu dung lượng
docker system df
```

Dùng `docker history` để phát hiện layer nào "phình to" và tối ưu đúng chỗ.

## Checklist tối ưu image

| Hạng mục | Việc cần làm |
|---|---|
| Base image | Dùng `alpine` hoặc `slim` khi có thể |
| Kích thước | Áp dụng **multi-stage build** |
| Cache | Copy file dependency trước, code sau |
| Layer | Gộp `RUN`, dọn rác trong cùng layer |
| Build context | Có `.dockerignore` đầy đủ |
| Bảo mật | Chạy với `USER` không phải root |
| Secret | Không nhúng vào image, truyền lúc chạy |
| Version | Ghim version base image, quét CVE |

## Tóm tắt

- **Multi-stage build** là kỹ thuật giảm size hiệu quả nhất — bỏ lại toolchain build
- Chọn base image nhẹ (**alpine/slim**) và tận dụng **layer cache**
- Gộp `RUN` + dọn rác trong cùng layer để image gọn
- Bảo mật: **không chạy root**, **không nhúng secret**, ghim version và quét lỗ hổng

---

**Bài trước**: [← Docker Compose: quản lý ứng dụng multi-container](/posts/docker-compose-multi-container/)

**Bài tiếp theo**: [Docker trong CI/CD và production →](/posts/docker-trong-cicd-production/)

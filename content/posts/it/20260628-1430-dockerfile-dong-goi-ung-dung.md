+++
date        = '2026-06-28T14:30:00+07:00'
draft       = false
title       = 'Dockerfile: tự đóng gói ứng dụng thành image'
slug        = 'dockerfile-dong-goi-ung-dung'
summary     = 'Học cách viết Dockerfile để đóng gói chính ứng dụng của bạn thành image: các chỉ thị quan trọng, cơ chế layer, .dockerignore và build image đầu tiên.'
thumbnail   = '/images/docker-series/04-dockerfile.webp'
weight      = 4
categories  = ['it']
tags        = ['docker', 'devops']
series      = ['huong-dan-docker-tu-a-den-z']
authors     = ['Nguyen Chung']
+++

Đến giờ bạn đã biết chạy các image có sẵn. Nhưng để đóng gói **chính ứng dụng của mình**, bạn cần viết một **Dockerfile**. Đây là kỹ năng trung tâm khi làm việc với Docker.

## Dockerfile là gì?

**Dockerfile** là một file text chứa **danh sách các chỉ thị (instruction)** mô tả từng bước để build nên một image.

```
Dockerfile  ──(docker build)──▶  Image  ──(docker run)──▶  Container
```

Mỗi dòng trong Dockerfile là một bước, ví dụ: "lấy image nền Node", "copy code vào", "cài dependency", "chạy app".

## Một Dockerfile hoàn chỉnh

Đây là ví dụ đóng gói một ứng dụng Node.js — ta sẽ phân tích từng dòng:

```dockerfile
# 1. Image nền
FROM node:20-alpine

# 2. Thư mục làm việc bên trong container
WORKDIR /app

# 3. Copy file khai báo dependency trước
COPY package*.json ./

# 4. Cài dependency
RUN npm install --production

# 5. Copy toàn bộ source code
COPY . .

# 6. Khai báo cổng app lắng nghe
EXPOSE 3000

# 7. Lệnh chạy khi container khởi động
CMD ["node", "server.js"]
```

## Các chỉ thị quan trọng

| Chỉ thị | Công dụng |
|---|---|
| `FROM` | Chọn image nền để bắt đầu (bắt buộc, luôn ở đầu) |
| `WORKDIR` | Đặt thư mục làm việc bên trong image |
| `COPY` | Copy file từ máy host vào image |
| `ADD` | Như COPY nhưng thêm tính năng (giải nén tar, tải URL) |
| `RUN` | Chạy lệnh **lúc build** (cài package, build code...) |
| `ENV` | Đặt biến môi trường |
| `EXPOSE` | Khai báo (mang tính tài liệu) cổng container dùng |
| `CMD` | Lệnh mặc định chạy **khi container khởi động** |
| `ENTRYPOINT` | Lệnh cố định khi chạy, thường kết hợp với CMD |

### RUN vs CMD — đừng nhầm

Đây là điểm gây nhầm lẫn phổ biến:

- **`RUN`**: thực thi **lúc build image** (ví dụ `npm install`). Kết quả được "đóng băng" vào image.
- **`CMD`**: thực thi **lúc container khởi động** (ví dụ `node server.js`). Chỉ chạy khi bạn `docker run`.

```dockerfile
RUN npm install        # chạy 1 lần khi build, kết quả nằm trong image
CMD ["node", "app.js"] # chạy mỗi lần container khởi động
```

### CMD vs ENTRYPOINT

- `CMD`: lệnh mặc định, **có thể bị ghi đè** khi `docker run image lenh-khac`.
- `ENTRYPOINT`: lệnh cố định, đối số từ `docker run` được **nối thêm** vào sau.

Thường dùng kết hợp:

```dockerfile
ENTRYPOINT ["python"]
CMD ["app.py"]
# docker run image           → python app.py
# docker run image other.py  → python other.py
```

## Layer — cơ chế hoạt động của image

Mỗi chỉ thị `FROM`, `COPY`, `RUN`... tạo ra một **layer** (lớp). Image là chồng các layer xếp lên nhau:

```
┌─────────────────────────┐
│ CMD ["node","server.js"]│  ← layer trên cùng
├─────────────────────────┤
│ COPY . .                │
├─────────────────────────┤
│ RUN npm install         │
├─────────────────────────┤
│ COPY package*.json ./   │
├─────────────────────────┤
│ FROM node:20-alpine     │  ← layer nền
└─────────────────────────┘
```

Docker **cache** từng layer. Khi build lại, nếu một layer không thay đổi, Docker dùng lại cache thay vì làm lại — giúp build nhanh hơn rất nhiều.

### Tại sao copy package.json trước source code?

Để tận dụng cache. Quan sát thứ tự trong Dockerfile ở trên:

```dockerfile
COPY package*.json ./    # ít thay đổi
RUN npm install          # tốn thời gian, được cache
COPY . .                 # source code thay đổi liên tục
```

Khi bạn chỉ sửa code (không đổi dependency), Docker dùng lại layer `npm install` đã cache → build cực nhanh. Nếu copy hết source trước rồi mới `npm install`, mỗi lần sửa code đều phải cài lại dependency từ đầu.

> Nguyên tắc: **đặt thứ ít thay đổi lên trước, thứ hay thay đổi xuống dưới.**

## File .dockerignore

Giống như `.gitignore`, file `.dockerignore` loại bỏ những file không cần đưa vào image:

```
node_modules
npm-debug.log
.git
.env
Dockerfile
*.md
```

Lợi ích:

- Image nhẹ hơn, build nhanh hơn
- Không vô tình đóng gói secret (`.env`) hay `node_modules` cồng kềnh

## Build image

Từ Dockerfile, tạo ra image bằng `docker build`:

```bash
# Build và đặt tên (tag) cho image
docker build -t my-app:1.0 .
```

Giải thích:

- `-t my-app:1.0` — đặt tên `my-app` với tag `1.0`
- `.` — build context, tức thư mục hiện tại (nơi chứa Dockerfile và source)

Theo dõi output, bạn sẽ thấy Docker chạy lần lượt từng bước (`FROM`, `COPY`, `RUN`...).

## Chạy image vừa build

```bash
# Chạy container từ image của bạn
docker run -d -p 3000:3000 --name my-app-container my-app:1.0

# Kiểm tra
docker ps
docker logs my-app-container
```

Mở `http://localhost:3000` — ứng dụng của bạn đang chạy trong container do chính bạn đóng gói.

## Quy trình hoàn chỉnh

Tổng kết toàn bộ luồng làm việc với Dockerfile:

```
1. Viết Dockerfile + .dockerignore
2. docker build -t my-app:1.0 .      → tạo image
3. docker run -p 3000:3000 my-app:1.0 → chạy container
4. Sửa code → build lại (cache giúp nhanh)
5. docker push my-app:1.0             → đẩy lên registry (tùy chọn)
```

## Một vài thực hành tốt

- Dùng image nền **alpine** khi có thể (`node:20-alpine`) — nhẹ hơn nhiều
- Luôn có **.dockerignore** để loại `node_modules`, `.git`, `.env`
- Gộp các lệnh `RUN` liên quan để giảm số layer
- Không nhúng secret (mật khẩu, API key) trực tiếp vào Dockerfile
- Ghi rõ version của image nền, tránh dùng `latest` cho production

> Chúng ta sẽ đào sâu việc tối ưu image (multi-stage build, giảm size) ở [bài số 7 của series](/posts/toi-uu-image-best-practices/).

## Tóm tắt

- **Dockerfile** mô tả từng bước để build image; build bằng `docker build -t ten .`
- `RUN` chạy lúc build, `CMD` chạy lúc container khởi động — đừng nhầm
- Image gồm nhiều **layer** được **cache**; sắp xếp chỉ thị hợp lý để build nhanh
- Luôn dùng **.dockerignore** để image gọn và an toàn

---

**Bài trước**: [← Docker cơ bản: image, container và các lệnh thiết yếu](/posts/docker-co-ban-image-container-lenh/)

**Bài tiếp theo**: [Docker Volume & Network: lưu trữ và kết nối container →](/posts/docker-volume-network/)

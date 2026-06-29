+++
date        = '2026-06-29T15:30:00+07:00'
draft       = false
title       = 'Docker Compose: quản lý ứng dụng multi-container'
slug        = 'docker-compose-multi-container'
summary     = 'Dùng Docker Compose để định nghĩa và chạy ứng dụng nhiều container bằng một file YAML duy nhất: cú pháp, services, volumes, networks và các lệnh thường dùng.'
thumbnail   = '/images/docker-series/06-docker-compose.svg'
weight      = 6
categories  = ['it']
tags        = ['docker', 'devops']
series      = ['huong-dan-docker-tu-a-den-z']
authors     = ['Nguyen Chung']
+++

Ở bài trước, để chạy một stack web + database, chúng ta phải gõ hàng loạt lệnh `docker run` dài dằng dặc. **Docker Compose** giải quyết vấn đề đó: mô tả toàn bộ ứng dụng trong **một file YAML**, rồi khởi động mọi thứ bằng **một lệnh**.

## Docker Compose là gì?

**Docker Compose** là công cụ định nghĩa và chạy ứng dụng **nhiều container** bằng một file cấu hình duy nhất (`compose.yaml` hoặc `docker-compose.yml`).

```
        NHIỀU LỆNH docker run            →    MỘT FILE compose.yaml
    docker network create ...                 + MỘT LỆNH
    docker volume create ...                  docker compose up
    docker run db ...
    docker run web ...
    docker run cache ...
```

Compose đã đi kèm sẵn trong Docker Desktop và bản cài Docker Engine hiện đại (lệnh `docker compose`).

## File compose.yaml đầu tiên

Đây là stack web + database từ bài trước, viết lại bằng Compose:

```yaml
services:
  web:
    build: .
    ports:
      - "8080:3000"
    environment:
      DATABASE_URL: postgres://postgres:secret@db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Toàn bộ stack — web app, database, volume, network — gói gọn trong vài chục dòng dễ đọc.

## Phân tích cấu trúc

### services

Mỗi **service** là một container (hoặc một nhóm container cùng loại). Ở trên có hai service: `web` và `db`.

```yaml
services:
  web:    # ← tên service, cũng là hostname trong network
    ...
  db:
    ...
```

Compose tự động tạo một network chung cho các service, nên `web` gọi `db` bằng đúng tên service `db` — y như chương network ở bài trước.

### build vs image

```yaml
  web:
    build: .            # build từ Dockerfile trong thư mục hiện tại
  db:
    image: postgres:16  # dùng image có sẵn từ registry
```

- `build`: tự build image từ Dockerfile của bạn
- `image`: kéo image có sẵn về dùng

### ports, environment, volumes

```yaml
    ports:
      - "8080:3000"            # host:container, như flag -p
    environment:
      POSTGRES_PASSWORD: secret # như flag -e
    volumes:
      - pgdata:/var/lib/postgresql/data  # như flag -v
```

Mọi flag bạn từng dùng với `docker run` đều có dạng khai báo tương ứng trong Compose.

### depends_on

```yaml
    depends_on:
      - db
```

Khai báo `web` phụ thuộc `db`, nên Compose khởi động `db` trước.

> Lưu ý: `depends_on` chỉ đảm bảo **thứ tự khởi động**, không đảm bảo `db` đã **sẵn sàng nhận kết nối**. Để chờ DB thực sự sẵn sàng, dùng thêm healthcheck (xem bên dưới).

## Các lệnh Compose thường dùng

```bash
# Khởi động toàn bộ stack (chạy nền với -d)
docker compose up -d

# Xem log của tất cả service
docker compose logs -f

# Xem trạng thái các service
docker compose ps

# Dừng và xóa container + network
docker compose down

# Dừng, xóa và xóa luôn volume (mất dữ liệu)
docker compose down -v

# Build lại image rồi khởi động
docker compose up -d --build

# Chạy một lệnh trong service
docker compose exec web sh
```

Vòng đời điển hình:

```
docker compose up -d      → bật cả stack
docker compose logs -f    → theo dõi
... làm việc ...
docker compose down       → tắt sạch
```

## Ví dụ thực tế hơn: web + db + cache

Stack ba tầng phổ biến (app, database, Redis cache):

```yaml
services:
  web:
    build: .
    ports:
      - "8080:3000"
    environment:
      DATABASE_URL: postgres://postgres:secret@db:5432/myapp
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  cache:
    image: redis:7-alpine

volumes:
  pgdata:
```

Ở đây ta dùng **healthcheck** + `condition: service_healthy` để `web` chỉ khởi động sau khi PostgreSQL thực sự sẵn sàng nhận kết nối.

## Bind mount cho môi trường dev

Khi phát triển, mount code vào container để sửa là thấy ngay, không cần build lại:

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app           # mount code hiện tại vào container
      - /app/node_modules # giữ node_modules của container, không bị host ghi đè
    command: npm run dev
```

## Nhiều môi trường: dev và production

Một mẹo phổ biến là tách cấu hình theo môi trường bằng nhiều file:

```bash
# compose.yaml          → cấu hình chung
# compose.override.yaml → cấu hình dev (Compose tự nạp khi up)
# compose.prod.yaml     → cấu hình production

# Chạy với cấu hình production
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

## Vì sao Compose là bước ngoặt

| Trước Compose | Với Compose |
|---|---|
| Nhiều lệnh `docker run` dài | Một file YAML rõ ràng |
| Khó tái lập trên máy khác | `git clone` + `docker compose up` là chạy |
| Tự quản network, volume thủ công | Compose tự tạo và liên kết |
| Khó theo dõi cả stack | `logs`, `ps` cho toàn bộ stack |

Với Compose, cả team chỉ cần `docker compose up` là có y hệt môi trường — không còn "trên máy tôi chạy được".

## Tóm tắt

- **Docker Compose** mô tả ứng dụng nhiều container trong một file `compose.yaml`
- Mỗi **service** là một container; các service gọi nhau bằng **tên service**
- Lệnh cốt lõi: `docker compose up -d`, `logs -f`, `ps`, `down`
- Dùng **healthcheck** + `depends_on` để đảm bảo thứ tự và độ sẵn sàng

---

**Bài trước**: [← Docker Volume & Network: lưu trữ và kết nối container](/posts/docker-volume-network/)

**Bài tiếp theo**: [Tối ưu image & best practices →](/posts/toi-uu-image-best-practices/)

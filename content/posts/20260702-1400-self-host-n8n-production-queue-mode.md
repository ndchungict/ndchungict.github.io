+++
date        = '2026-07-02T14:00:00+07:00'
draft       = false
title       = 'Bài 13 — Self-host production: Postgres + Redis, queue mode, worker, reverse proxy'
slug        = 'self-host-n8n-production-queue-mode'
summary     = 'Triển khai n8n production: Docker Compose với Postgres + Redis, queue mode và worker, scaling, reverse proxy (Nginx/Traefik) và HTTPS.'
thumbnail   = '/images/series-n8n/13-self-host-production.webp'
featured    = false
weight      = 13
categories  = ['it']
tags        = ['n8n', 'self-host', 'queue-mode']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Single-instance ở [Bài 2](../cai-dat-n8n-docker-compose/) đủ để dev và tải nhẹ. Nhưng khi ShopViet chạy hàng chục nghìn execution mỗi ngày, một process n8n xử lý tuần tự sẽ thành nút thắt: workflow xếp hàng, webhook chậm, một execution nặng làm treo cả hệ. Đây là lúc chuyển sang **queue mode** — tách phần nhận việc (main) khỏi phần chạy việc (worker), dùng **Redis** làm hàng đợi, và scale worker theo tải. Bài này mở đầu phần Chuyên sâu: dựng n8n production thật với Postgres + Redis, queue mode, reverse proxy và HTTPS.

## Yêu cầu chuẩn bị

- Đã có setup Compose + Postgres ([Bài 2](../cai-dat-n8n-docker-compose/)).
- Hiểu Docker Compose, reverse proxy, DNS/TLS cơ bản.
- Một domain trỏ về server (cho HTTPS).
- n8n 1.x. Queue mode và tên biến môi trường có thể đổi theo phiên bản — đối chiếu tài liệu bản bạn ghim.

## Regular mode vs queue mode

- **Regular mode** (mặc định): một process n8n vừa phục vụ UI/webhook vừa **chạy execution** trong chính nó. Đơn giản, nhưng không scale ngang và một execution nặng ảnh hưởng cả process.
- **Queue mode**: tách vai trò:
  - **Main process** — phục vụ UI, nhận webhook/trigger, **đẩy execution vào hàng đợi Redis**. Không tự chạy execution nặng.
  - **Worker** — lấy job từ Redis và **thực thi**. Chạy nhiều worker song song, scale theo tải.
  - **Redis** — hàng đợi trung gian giữa main và worker.

Queue mode là điều kiện cần để scale ngang và cô lập tải. Chi tiết cơ chế bên trong (main vs worker, execution mode) sẽ mổ ở [Bài 14](../kien-truc-n8n-ben-trong/); bài này tập trung **dựng** nó.

## Bật queue mode

Các thành phần cần thêm so với [Bài 2](../cai-dat-n8n-docker-compose/): **Redis**, và ít nhất một **worker** chạy lệnh `n8n worker`. Cấu hình chính qua env:

- `EXECUTIONS_MODE=queue` — bật queue mode.
- `QUEUE_BULL_REDIS_HOST` / `QUEUE_BULL_REDIS_PORT` — kết nối Redis (n8n dùng Bull trên Redis).
- Main và worker **dùng chung** Postgres và **cùng `N8N_ENCRYPTION_KEY`** — nếu key khác nhau, worker không giải mã được credential.
- (Tùy chọn) tách **webhook processor** riêng cho tải webhook lớn.

Điểm hay quên: **mọi process (main + tất cả worker) phải chia sẻ cùng encryption key và cùng DB.** Đây là lỗi khiến "chạy tay thì được, qua worker thì credential lỗi".

## Reverse proxy + HTTPS

Trong production, đặt n8n sau **reverse proxy** (Nginx/Traefik/Caddy) để:

- Kết thúc **TLS** (HTTPS) — n8n không tự lo chứng chỉ.
- Định tuyến domain → container n8n.
- (Tùy) rate limit, header bảo mật.

Khi đứng sau proxy, đặt đúng: `N8N_HOST=n8n.shopviet.vn`, `N8N_PROTOCOL=https`, `WEBHOOK_URL=https://n8n.shopviet.vn/`, và `N8N_SECURE_COOKIE=true`. Nếu `WEBHOOK_URL` sai, URL webhook sinh ra sẽ trỏ nội bộ và nhà cung cấp không gọi tới được (lỗi đã cảnh báo ở [Bài 2](../cai-dat-n8n-docker-compose/) và [Bài 11](../webhook-nang-cao-hmac-idempotency/)). WebSocket cho push UI cũng cần proxy cấu hình cho phép upgrade connection.

## Ví dụ thực hành: docker-compose.yml queue mode

Compose dưới đây gồm: Postgres + Redis + main + worker + Traefik (reverse proxy + HTTPS tự động qua Let's Encrypt). Đây là khung ShopViet dùng để chạy thật. `.env` kế thừa từ [Bài 2](../cai-dat-n8n-docker-compose/), thêm `REDIS`/domain.

```yaml
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7
    restart: unless-stopped
    command: redis-server --appendonly yes   # bat AOF de ben job dang cho
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  # Cau hinh chung cho main + worker (dung YAML anchor)
  n8n-main:
    image: docker.n8n.io/n8nio/n8n:1.68.0
    restart: unless-stopped
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_DATABASE: ${POSTGRES_DB}
      DB_POSTGRESDB_USER: ${POSTGRES_USER}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
      EXECUTIONS_MODE: queue
      QUEUE_BULL_REDIS_HOST: redis
      QUEUE_BULL_REDIS_PORT: 6379
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      N8N_HOST: ${N8N_HOST}
      N8N_PROTOCOL: https
      WEBHOOK_URL: https://${N8N_HOST}/
      N8N_SECURE_COOKIE: 'true'
      N8N_PROXY_HOPS: 1                 # tin reverse proxy -> doc dung X-Forwarded-For (IP client)
      N8N_RUNNERS_ENABLED: 'true'       # task runner cho Code node (Bai 7)
      GENERIC_TIMEZONE: ${GENERIC_TIMEZONE}
      TZ: ${GENERIC_TIMEZONE}
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    labels:
      - traefik.enable=true
      - traefik.http.routers.n8n.rule=Host(`${N8N_HOST}`)
      - traefik.http.routers.n8n.entrypoints=websecure
      - traefik.http.routers.n8n.tls.certresolver=le
      - traefik.http.services.n8n.loadbalancer.server.port=5678

  n8n-worker:
    image: docker.n8n.io/n8nio/n8n:1.68.0
    restart: unless-stopped
    command: worker            # chay o che do worker
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_DATABASE: ${POSTGRES_DB}
      DB_POSTGRESDB_USER: ${POSTGRES_USER}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
      EXECUTIONS_MODE: queue
      QUEUE_BULL_REDIS_HOST: redis
      QUEUE_BULL_REDIS_PORT: 6379
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}   # PHAI trung voi main
      N8N_RUNNERS_ENABLED: 'true'                 # task runner cho Code node (Bai 7)
      GENERIC_TIMEZONE: ${GENERIC_TIMEZONE}
      TZ: ${GENERIC_TIMEZONE}
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    deploy:
      replicas: 2              # scale worker: tang so nay

  traefik:
    image: traefik:v3.1
    restart: unless-stopped
    command:
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.le.acme.tlschallenge=true
      - --certificatesresolvers.le.acme.email=${ACME_EMAIL}
      - --certificatesresolvers.le.acme.storage=/letsencrypt/acme.json
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

volumes:
  postgres_data:
  redis_data:
  letsencrypt:
```

Khởi động và scale worker:

```bash
docker compose up -d
# Tang so worker khi tai cao
docker compose up -d --scale n8n-worker=4
```

Điểm mấu chốt trong file: `EXECUTIONS_MODE=queue`, Redis dùng chung, **cùng `N8N_ENCRYPTION_KEY`** cho main lẫn worker, và Traefik lo TLS. Toàn bộ chạy trên **Community Edition miễn phí** — queue mode không phải tính năng trả phí. `command: worker` là cách một image n8n chạy ở vai trò worker.

## Lỗi thường gặp và cách xử lý

1. **Worker khác `N8N_ENCRYPTION_KEY` với main.** Triệu chứng: execution qua worker báo lỗi giải mã credential, dù chạy tay ở main thì được. Fix: mọi process dùng chung một key.
2. **Bật queue mode nhưng thiếu worker.** Triệu chứng: execution xếp hàng trong Redis mà không ai chạy. Fix: phải có ít nhất một process `n8n worker`.
3. **`WEBHOOK_URL` sai sau proxy.** Triệu chứng: URL webhook trỏ nội bộ, nhà cung cấp không gọi được. Fix: đặt đúng domain HTTPS công khai.
4. **WebSocket/push UI không hoạt động.** Nguyên nhân: proxy chưa cho upgrade connection. Fix: cấu hình proxy cho WebSocket.
5. **Redis mất dữ liệu → mất job đang chờ.** Fix: bật **AOF persistence** (`redis-server --appendonly yes`) kèm volume như ví dụ (chỉ mount volume thì mới có RDB snapshot mặc định), và thiết kế idempotency ([Bài 11](../webhook-nang-cao-hmac-idempotency/)) để chạy lại an toàn.

## Best practices

- **Queue mode cho mọi production có tải thật**; regular mode chỉ cho dev/tải nhẹ.
- **Cùng encryption key + cùng DB** cho main và tất cả worker — nguyên tắc bất di bất dịch.
- **Reverse proxy lo TLS**; đặt đúng `N8N_HOST`/`WEBHOOK_URL`/secure cookie.
- **Scale worker theo tải**, giám sát độ dài hàng đợi Redis để biết khi nào cần thêm.
- **Backup cả Postgres lẫn Redis** (hoặc chấp nhận mất job chờ + dựa vào idempotency để chạy lại).

## Tổng kết + xem tiếp

- **Queue mode** tách main (nhận việc, đẩy vào Redis) khỏi worker (chạy việc) — điều kiện để scale ngang.
- Cần thêm **Redis** và ít nhất một **worker**; mọi process chia sẻ **cùng key + cùng DB**.
- **Reverse proxy (Traefik/Nginx)** lo HTTPS; đặt đúng biến host/webhook/cookie.
- Tất cả có ở **Community Edition miễn phí**; scale worker bằng cách tăng replica.

**Bài tiếp — [Bài 14: Kiến trúc n8n bên trong — main vs worker, execution mode, binary data](../kien-truc-n8n-ben-trong/)**: đã dựng queue mode, giờ hiểu *vì sao* nó hoạt động — cơ chế main/worker, execution mode, cách n8n lưu binary data, và những gì bạn cần biết để tối ưu hiệu năng và RAM.

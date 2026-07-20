+++
date        = '2026-07-02T08:30:00+07:00'
draft       = false
title       = 'Bài 2 — Cài đặt n8n: npm, Docker, Docker Compose và biến môi trường'
slug        = 'cai-dat-n8n-docker-compose'
summary     = 'Ba cách chạy n8n (npm, Docker, Docker Compose) cho dev và production, các biến môi trường quan trọng (N8N_ENCRYPTION_KEY, WEBHOOK_URL, DB), và cấu trúc thư mục dữ liệu cần backup.'
thumbnail   = '/images/series-n8n/02-cai-dat-n8n.webp'
featured    = false
weight      = 2
categories  = ['it']
subcategories = ['workflow', 'automation', 'ai']
tags        = ['n8n', 'docker', 'devops']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

[Bài 1](../n8n-la-gi-goc-nhin-developer/) đã định vị n8n là một workflow automation engine self-host. Giờ ta dựng môi trường chạy thật. Đừng xem nhẹ bước này: **cách bạn cài n8n quyết định sau này backup, nâng cấp và scale có đau hay không.** Rất nhiều team chọn cách cài nhanh nhất cho "chạy được", rồi trả giá khi mất credentials hoặc không thể migrate. Bài này đi qua ba cách cài, chỉ rõ cái nào cho việc gì, các biến môi trường bắt buộc phải hiểu, và một `docker-compose.yml` chuẩn để ShopViet dùng xuyên suốt series.

## Yêu cầu chuẩn bị

- Docker và Docker Compose (bản v2, lệnh `docker compose`). Đây là hướng chính của series.
- Node.js LTS nếu muốn thử cách npm (tùy chọn).
- Biết cơ chế environment variable và volume của Docker.
- n8n 1.x. Các biến môi trường bên dưới ổn định trong 1.x, nhưng vẫn nên đối chiếu tài liệu ứng với version bạn ghim.

## Ba cách chạy n8n — và khi nào dùng cái nào

### 1. npm / npx — chỉ để thử nhanh

```bash
# Chạy tức thì, không cài cố định
npx n8n

# Hoặc cài global
npm install -g n8n && n8n start
```

Cách này khởi động n8n với database mặc định là **SQLite** trong thư mục `~/.n8n`. Dùng được để nghịch 5 phút, xem giao diện. **Không dùng cho bất cứ thứ gì nghiêm túc**: khó backup nhất quán, khó chạy nhiều instance, và phụ thuộc Node version của máy. Tôi gần như không bao giờ khởi động n8n kiểu này ngoài lúc test một node mới.

### 2. Docker single container — dev/POC

```bash
docker volume create n8n_data

docker run -d --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -e GENERIC_TIMEZONE="Asia/Ho_Chi_Minh" \
  docker.n8n.io/n8nio/n8n:1.68.0   # ghim version cụ thể, KHÔNG dùng :latest
```

Gọn, cô lập khỏi máy host, nhưng vẫn dùng SQLite trong volume. Ổn cho POC hoặc môi trường dev cá nhân. Vẫn chưa phải thứ tôi để chạy production.

### 3. Docker Compose + Postgres — mặc định của series

Đây là cấu hình tôi khuyên cho mọi thứ nghiêm túc, và là nền cho ShopViet. Vì sao **bỏ SQLite mặc định** dù nó chạy được?

- SQLite khóa file khi ghi — với nhiều execution đồng thời, bạn sẽ gặp lock/độ trễ.
- Không tách được compute và storage; muốn scale sang **queue mode** ([Bài 13](../self-host-n8n-production-queue-mode/)) thì bắt buộc Postgres.
- Backup/restore Postgres là quy trình chuẩn, đáng tin hơn copy file SQLite đang mở.

Nói thẳng: nếu có ý định dùng thật, hãy bắt đầu bằng Postgres ngay từ ngày đầu để khỏi phải migrate sau.

## Biến môi trường quan trọng

n8n cấu hình gần như toàn bộ qua env var. Đây là những biến bạn **phải** hiểu trước khi chạy production:

| Biến | Mục đích | Ghi chú |
|------|----------|---------|
| `N8N_ENCRYPTION_KEY` | Khóa mã hóa toàn bộ credentials trong DB | **Quan trọng nhất.** Mất key = mọi credential thành rác. Đặt cố định, backup riêng. |
| `DB_TYPE` | Loại database | Đặt `postgresdb` để dùng Postgres |
| `DB_POSTGRESDB_HOST/PORT/DATABASE/USER/PASSWORD` | Kết nối Postgres | Trỏ tới service Postgres |
| `N8N_HOST` | Hostname public của instance | vd `n8n.shopviet.vn` |
| `N8N_PROTOCOL` | `http` hoặc `https` | Dùng `https` khi có reverse proxy TLS |
| `N8N_PORT` | Cổng n8n lắng nghe | Mặc định `5678` |
| `WEBHOOK_URL` | URL gốc để sinh webhook | **Bắt buộc đúng** khi đứng sau reverse proxy, nếu không webhook trả URL sai |
| `GENERIC_TIMEZONE` | Timezone cho Schedule/cron *bên trong* n8n | vd `Asia/Ho_Chi_Minh` |
| `TZ` | Timezone của **hệ điều hành** trong container | Đặt **cùng giá trị** với `GENERIC_TIMEZONE`; nếu thiếu, log và một số node xử lý ngày/giờ sẽ lệch về UTC |
| `N8N_SECURE_COOKIE` | Cookie chỉ gửi qua HTTPS | Đặt `false` khi chạy local HTTP, `true` khi có HTTPS |

> **Vì sao cần cả `TZ` lẫn `GENERIC_TIMEZONE`?** `GENERIC_TIMEZONE` chỉ chỉnh timezone mà Schedule Trigger/cron dùng để tính lịch. Nhưng đồng hồ *hệ thống* của container mặc định là UTC — nên timestamp trong log, và các hàm ngày/giờ chạm tới giờ hệ thống, sẽ lệch nếu bạn không set `TZ`. Quy tắc an toàn: **luôn set cả hai, cùng một giá trị.**

n8n phiên bản gần đây khuyến nghị chạy **Code node** qua *task runners* (tiến trình tách biệt, an toàn và ổn định hơn), và sẽ in cảnh báo deprecation nếu chưa bật. Cách bật đơn giản nhất là đặt `N8N_RUNNERS_ENABLED=true`. Việc này phụ thuộc phiên bản (đối chiếu docs với tag bạn ghim); ta sẽ đào sâu Code node và runner ở [Bài 7](../code-node-chuyen-sau-n8n/).

Về `N8N_ENCRYPTION_KEY`: nếu không đặt, n8n tự sinh một key và lưu trong file `config` ở thư mục dữ liệu. Vấn đề là khi bạn tái tạo container hoặc chuyển máy mà **không mang theo key đó**, toàn bộ credentials đã lưu sẽ không giải mã được — workflow chạy sẽ fail hàng loạt. Vì vậy: **luôn đặt `N8N_ENCRYPTION_KEY` tường minh** và cất nó vào secret manager. Cơ chế mã hóa credentials sẽ được mổ xẻ ở [Bài 10](../credentials-va-bao-mat-n8n/).

## Ví dụ thực hành hoàn chỉnh: docker-compose.yml + .env

Cấu trúc thư mục:

```text
shopviet-n8n/
├── docker-compose.yml
└── .env
```

File `.env` (không commit vào Git — thêm vào `.gitignore`):

```bash
# .env
# Sinh key ngẫu nhiên: openssl rand -hex 32
N8N_ENCRYPTION_KEY=thay-bang-chuoi-32-byte-hex-cua-ban

# Postgres
POSTGRES_USER=n8n
POSTGRES_PASSWORD=doi-mat-khau-manh
POSTGRES_DB=n8n

# n8n host (local dev)
N8N_HOST=localhost
N8N_PROTOCOL=http
N8N_PORT=5678
WEBHOOK_URL=http://localhost:5678/
GENERIC_TIMEZONE=Asia/Ho_Chi_Minh
TZ=Asia/Ho_Chi_Minh
```

> Mẹo Git: commit một file **`.env.example`** có đúng các khóa trên nhưng để trống/giá trị giả (vd `N8N_ENCRYPTION_KEY=`), và cho `.env` thật vào `.gitignore`. Người mới clone repo chỉ việc copy `.env.example` → `.env` rồi điền — không ai vô tình commit secret.

File `docker-compose.yml`:

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
      # n8n chỉ nên khởi động khi DB đã sẵn sàng
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      interval: 10s
      timeout: 5s
      retries: 5

  n8n:
    image: docker.n8n.io/n8nio/n8n:1.68.0   # ghim version, không dùng latest
    restart: unless-stopped
    ports:
      - '5678:5678'
    environment:
      # Database
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: ${POSTGRES_DB}
      DB_POSTGRESDB_USER: ${POSTGRES_USER}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
      # Bảo mật & host
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      N8N_HOST: ${N8N_HOST}
      N8N_PROTOCOL: ${N8N_PROTOCOL}
      N8N_PORT: ${N8N_PORT}
      WEBHOOK_URL: ${WEBHOOK_URL}
      GENERIC_TIMEZONE: ${GENERIC_TIMEZONE}
      TZ: ${TZ}                       # timezone hệ thống container — khớp GENERIC_TIMEZONE
      # Chạy Code node qua task runner (khuyến nghị ở bản mới; xem Bài 7)
      N8N_RUNNERS_ENABLED: 'true'
      # Local HTTP nên tắt secure cookie; bật lại khi có HTTPS
      N8N_SECURE_COOKIE: 'false'
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
  n8n_data:
```

Khởi động:

```bash
docker compose up -d
docker compose logs -f n8n   # theo dõi tới khi thấy "Editor is now accessible"
```

Mở `http://localhost:5678`, tạo tài khoản owner đầu tiên. Toàn bộ cấu hình trên chạy trên **Community Edition miễn phí** — không cần license.

### Xác nhận instance sống bằng một workflow nhỏ

Import workflow sau (**Workflows → Import from File / Paste**). Nó dùng Schedule trigger chạy mỗi phút và một Set node — đủ để xác nhận engine + scheduler hoạt động:

```json
{
  "name": "ShopViet - Healthcheck",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            { "field": "minutes", "minutesInterval": 1 }
          ]
        }
      },
      "id": "7a2b0000-0000-4000-9000-000000000001",
      "name": "Moi phut",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [0, 0]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "f1",
              "name": "status",
              "value": "n8n alive",
              "type": "string"
            },
            {
              "id": "f2",
              "name": "checkedAt",
              "value": "={{ $now.toISO() }}",
              "type": "string"
            }
          ]
        }
      },
      "id": "7a2b0000-0000-4000-9000-000000000002",
      "name": "Danh dau song",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [240, 0]
    }
  ],
  "connections": {
    "Moi phut": {
      "main": [
        [
          { "node": "Danh dau song", "type": "main", "index": 0 }
        ]
      ]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Bật workflow (toggle **Active**), chờ một phút rồi vào tab **Executions** — thấy execution success là môi trường đã chạy đúng. `typeVersion` các node có thể lệch theo phiên bản; nếu import cảnh báo, để n8n tự nâng cấp node.

## Cấu trúc thư mục dữ liệu và backup

Trong container, dữ liệu n8n nằm ở `/home/node/.n8n` (map ra volume `n8n_data`). Với setup Postgres, thư mục này chủ yếu chứa file `config` (gồm encryption key nếu bạn không set qua env) và một số dữ liệu cục bộ; **phần lớn state quan trọng — workflow, credentials, execution — nằm trong Postgres.**

Vậy cần backup gì:

1. **Database Postgres** — nguồn sự thật của workflow, credentials (đã mã hóa), execution. Backup bằng `pg_dump`.
2. **`N8N_ENCRYPTION_KEY`** — cất riêng trong secret manager. Không có key này, bản dump credentials là vô dụng.

```bash
# Backup Postgres
docker compose exec postgres pg_dump -U n8n n8n > backup_n8n_$(date +%F).sql
```

Nhắc lại cho rõ: **DB + encryption key phải đi cùng nhau.** Tôi từng thấy team backup DB đều đặn nhưng quên key — tới lúc restore thì mọi credential thành chuỗi mã hóa không mở được.

## Lỗi thường gặp và cách xử lý

1. **Mất/không cố định `N8N_ENCRYPTION_KEY`.** Triệu chứng: sau khi tái tạo container, tất cả credential báo lỗi giải mã, workflow fail. Nguyên nhân: key mới khác key đã mã hóa dữ liệu cũ. Fix: luôn set key tường minh và backup; nếu đã mất, phải nhập lại toàn bộ credentials.
2. **`WEBHOOK_URL` sai sau reverse proxy.** Triệu chứng: URL webhook n8n hiển thị là `localhost:5678` thay vì domain thật, bên thứ ba không gọi tới được. Nguyên nhân: n8n dùng `WEBHOOK_URL`/`N8N_HOST` để sinh URL. Fix: đặt đúng domain public (chi tiết reverse proxy ở [Bài 13](../self-host-n8n-production-queue-mode/)).
3. **Quyền volume với user `node`.** Triệu chứng: n8n báo không ghi được vào `/home/node/.n8n`. Nguyên nhân: image chạy bằng user `node` (UID 1000), volume bind-mount từ host có owner khác. Fix: dùng named volume như ví dụ trên, hoặc `chown -R 1000:1000` thư mục bind-mount.
4. **Chạy `image: ...:latest`.** Triệu chứng: sau khi Docker kéo bản mới, workflow vỡ vì node đổi typeVersion hoặc behavior. Fix: **ghim version tag** và nâng cấp có kiểm soát (đọc changelog, test ở staging trước).
5. **n8n khởi động trước khi Postgres sẵn sàng.** Triệu chứng: log n8n báo lỗi kết nối DB lúc `up`. Fix: dùng `healthcheck` + `depends_on: condition: service_healthy` như ví dụ.

## Best practices

- **Postgres từ ngày đầu.** Đừng bắt đầu bằng SQLite rồi hẹn "sau này migrate" — lần migrate đó hiếm khi diễn ra êm.
- **Ghim version, nâng cấp có chủ đích.** Coi n8n như một dependency: pin tag, đọc release note, test ở staging ([Bài 16](../n8n-api-versioning-cicd-workflow/) nói về môi trường dev/staging/prod).
- **Encryption key là secret hạng nhất.** Sinh bằng `openssl rand -hex 32`, lưu trong secret manager, không commit, không đặt trong image.
- **Tách `.env` khỏi Git.** Bí mật đi qua `.env`/secret manager; chỉ commit `docker-compose.yml` và một file `.env.example` không chứa giá trị thật.
- **Backup định kỳ cả DB lẫn key**, và thử **restore** ít nhất một lần — backup chưa từng restore thử thì coi như chưa có.

## Tổng kết + xem tiếp

- Ba cách cài: npm (chỉ thử nhanh), Docker single (dev/POC), **Docker Compose + Postgres (mặc định cho việc thật)**.
- Nhóm biến bắt buộc hiểu: `N8N_ENCRYPTION_KEY` (quan trọng nhất), cấu hình DB, `N8N_HOST`/`WEBHOOK_URL`/`N8N_PROTOCOL`, timezone.
- Backup gồm **Postgres + encryption key**, và hai thứ này phải đi cùng nhau.
- Ghim version, tách secret ra `.env`, dùng healthcheck để n8n đợi DB — những thói quen nhỏ tránh sự cố lớn.

**Bài tiếp — [Bài 3: Khái niệm cốt lõi — Workflow, Node, Trigger, Execution và mô hình items](../khai-niem-cot-loi-n8n-workflow-node-item/)**: có instance chạy rồi, ta mổ xẻ mô hình dữ liệu items/JSON chảy giữa các node — nền tảng để hiểu mọi node về sau và để debug đúng cách.

> Lưu ý phạm vi: bài này dựng single-instance production-ready cơ bản. **Queue mode với Redis + worker, reverse proxy và HTTPS đầy đủ** sẽ có ở [Bài 13](../self-host-n8n-production-queue-mode/).

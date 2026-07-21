+++
date        = '2026-07-02T13:30:00+07:00'
draft       = false
title       = 'Bài 12 — Tích hợp database: Postgres/MySQL/MongoDB, query tham số, transaction'
slug        = 'tich-hop-database-n8n'
summary     = 'Tích hợp database với n8n: Postgres/MySQL/MongoDB node, viết query có tham số, xử lý transaction và tránh SQL injection trong expression.'
thumbnail   = '/images/series-n8n/12-tich-hop-database.webp'
featured    = false
weight      = 12
columns     = 2
categories  = ['it']
subcategories = ['workflow', 'automation', 'ai']
tags        = ['n8n', 'database', 'postgres']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Hai bài trước để lại hai "món nợ" cần một database: store idempotency ([Bài 11](../webhook-nang-cao-hmac-idempotency/)) và bảng dead-letter ([Bài 9](../error-handling-production-n8n/)). Database cũng là nơi automation gặp dữ liệu thật của doanh nghiệp — đọc đơn hàng, cập nhật trạng thái, ghi log. n8n có node cho Postgres, MySQL, MongoDB, nhưng "chạy được query" và "query an toàn cho production" là hai chuyện khác nhau. Bài này tập trung vào phần dễ sai nhất với developer khi làm việc trong n8n: **query có tham số, transaction, và tránh SQL injection trong expression**.

## Yêu cầu chuẩn bị

- Một Postgres đang chạy (ta đã có sẵn từ [Bài 2](../cai-dat-n8n-docker-compose/)).
- Biết SQL cơ bản.
- Hiểu credential ([Bài 10](../credentials-va-bao-mat-n8n/)) để kết nối DB an toàn.
- n8n 1.x. Ví dụ dùng **Postgres node**; MySQL/MongoDB tương tự về khái niệm.

## Kết nối: dùng credential, không nhét chuỗi kết nối vào node

Tạo credential *Postgres* (*Settings → Credentials → Add credential*) với host/port/database/user/password. Với ShopViet có thể trỏ tới **chính Postgres của n8n** (schema riêng) hoặc một DB nghiệp vụ tách biệt — tôi khuyên **tách DB nghiệp vụ khỏi DB của n8n** để automation không đụng vào dữ liệu vận hành của chính n8n.

Node Postgres có các operation dựng sẵn (Insert, Update, Select, Upsert) và chế độ **Execute Query** để viết SQL tự do. Operation dựng sẵn tiện cho CRUD đơn giản; Execute Query cho truy vấn phức tạp.

## Query có tham số: đừng nối chuỗi

Đây là phần quan trọng nhất. Cách **SAI** kinh điển — nối trực tiếp expression vào SQL:

```sql
-- NGUY HIEM: SQL injection neu email chua dau nhay
SELECT * FROM orders WHERE email = '{{ $json.email }}';
```

Nếu `$json.email` chứa `' OR '1'='1`, bạn vừa mở toang bảng. Cách **ĐÚNG** — dùng **query parameters** ($1, $2...) và truyền giá trị tách rời:

```sql
SELECT * FROM orders WHERE email = $1 AND status = $2;
```

Trong Postgres node, phần **Query Parameters** nhận danh sách giá trị (map từ item), n8n gửi chúng tách khỏi câu SQL để DB driver tự escape. Giá trị người dùng đi qua tham số, **không** ghép vào chuỗi SQL. Đây là nguyên tắc không được phá: **cấu trúc SQL do bạn viết, dữ liệu đi qua tham số.**

MongoDB không có "SQL injection" theo nghĩa cổ điển, nhưng vẫn phải cẩn thận với query object build từ input người dùng (NoSQL injection) — nguyên tắc "dữ liệu người dùng không định hình cấu trúc query" vẫn đúng.

## Transaction: khi nhiều bước phải "tất cả hoặc không gì"

Automation thường cần nhiều thao tác DB đi cùng nhau: trừ tồn kho **và** tạo đơn — nếu một cái fail, cái kia phải rollback. n8n **không** tự bọc nhiều node vào một transaction; mỗi lệnh Postgres node là một câu chạy độc lập. Có mấy cách xử lý:

1. **Gộp vào một câu SQL/khối** trong Execute Query dùng `BEGIN ... COMMIT`, hoặc viết một hàm/stored procedure trong DB và gọi nó — cách chắc chắn nhất để có tính nguyên tử.
2. **Đẩy logic giao dịch xuống DB**: viết một stored procedure `create_order(...)` lo cả trừ kho lẫn tạo đơn trong một transaction, workflow chỉ gọi một lần. Đây là cách tôi khuyên cho các thao tác thật sự cần nguyên tử — để DB làm việc DB giỏi nhất.
3. Nếu buộc phải tách nhiều node, thiết kế **bù trừ (compensating action)** khi bước sau fail (giống saga) — phức tạp hơn, chỉ dùng khi không gộp được.

Đừng giả định "hai node Postgres cạnh nhau" là một transaction — chúng không phải.

## Ví dụ thực hành: idempotency store bằng Postgres

Hiện thực hóa store idempotency của [Bài 11](../webhook-nang-cao-hmac-idempotency/). Trước hết tạo bảng (chạy một lần):

```sql
CREATE TABLE IF NOT EXISTS processed_events (
  event_id    TEXT PRIMARY KEY,          -- UNIQUE: chong xu ly trung
  order_id    TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Workflow: nhận một sự kiện (giả lập) → **Insert** vào `processed_events` với `neverError` để bắt vi phạm UNIQUE → IF: insert thành công (mới) thì xử lý, đụng UNIQUE (trùng) thì bỏ qua. Import qua **Workflows → Import from File / Paste** (nhớ gán credential Postgres vào hai node DB):

```json
{
  "name": "ShopViet - Idempotency store (Postgres)",
  "nodes": [
    {
      "parameters": {},
      "id": "bc000000-0000-4000-9000-000000000001",
      "name": "When clicking Test workflow",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "jsCode": "// Gia lap mot su kien webhook da xac thuc (Bai 11)\nreturn [{ json: { event_id: 'evt-9001', orderId: 'SV-7001', total: 500000 } }];"
      },
      "id": "bc000000-0000-4000-9000-000000000002",
      "name": "Su kien vao",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [220, 0]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO processed_events (event_id, order_id) VALUES ($1, $2) ON CONFLICT (event_id) DO NOTHING RETURNING event_id;",
        "options": {
          "queryReplacement": "={{ [$json.event_id, $json.orderId] }}"
        }
      },
      "id": "bc000000-0000-4000-9000-000000000003",
      "name": "Insert khoa idempotency",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [440, 0],
      "alwaysOutputData": true,
      "credentials": {
        "postgres": { "id": "REPLACE_WITH_CREDENTIAL_ID", "name": "ShopViet DB - prod" }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": true, "typeValidation": "loose" },
          "combinator": "and",
          "conditions": [
            { "id": "n1", "leftValue": "={{ $json.event_id }}", "rightValue": "", "operator": { "type": "string", "operation": "notEmpty" } }
          ]
        },
        "options": {}
      },
      "id": "bc000000-0000-4000-9000-000000000004",
      "name": "La su kien moi?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [660, 0]
    },
    {
      "parameters": {
        "assignments": { "assignments": [ { "id": "p1", "name": "action", "value": "Xu ly don moi", "type": "string" } ] },
        "options": {}
      },
      "id": "bc000000-0000-4000-9000-000000000005",
      "name": "Xu ly don",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [880, -120]
    },
    {
      "parameters": {
        "assignments": { "assignments": [ { "id": "p2", "name": "action", "value": "Bo qua - da xu ly", "type": "string" } ] },
        "options": {}
      },
      "id": "bc000000-0000-4000-9000-000000000006",
      "name": "Bo qua trung",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [880, 120]
    }
  ],
  "connections": {
    "When clicking Test workflow": {
      "main": [[{ "node": "Su kien vao", "type": "main", "index": 0 }]]
    },
    "Su kien vao": {
      "main": [[{ "node": "Insert khoa idempotency", "type": "main", "index": 0 }]]
    },
    "Insert khoa idempotency": {
      "main": [[{ "node": "La su kien moi?", "type": "main", "index": 0 }]]
    },
    "La su kien moi?": {
      "main": [
        [{ "node": "Xu ly don", "type": "main", "index": 0 }],
        [{ "node": "Bo qua trung", "type": "main", "index": 0 }]
      ]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Cơ chế: `INSERT ... ON CONFLICT (event_id) DO NOTHING RETURNING event_id`. Lần đầu, insert thành công → có `event_id` trả về → nhánh "mới" → xử lý. Lần trùng, `ON CONFLICT DO NOTHING` không insert → truy vấn trả **0 row** → node phát ra item rỗng (không có `event_id`) → nhánh "bỏ qua".

Hai chi tiết khiến ví dụ chạy đúng:

- **Query Parameters truyền dạng mảng**: `={{ [$json.event_id, $json.orderId] }}` — phần tử map lần lượt vào `$1, $2`. **Đừng** nối hai expression bằng dấu phẩy (`={{ a }},={{ b }}`): chỉ dấu `=` đầu field bật chế độ expression, các `=` sau là ký tự literal nên giá trị thứ hai sẽ dính `=` thừa. Dùng mảng vừa đúng vừa chống injection (cấu trúc SQL của bạn, dữ liệu qua tham số).
- **Bật Always Output Data** trên node Postgres: khi trùng, truy vấn trả 0 row; nếu không bật, nhiều phiên bản node sẽ **không phát item nào** → node IF không có input → nhánh "bỏ qua" cũng không chạy. Bật option này để ca 0-row vẫn tạo item chảy vào IF.

`typeVersion`/cách khai báo query parameter của Postgres node có thể khác giữa các phiên bản; nếu import cảnh báo, mở node kiểm tra lại phần Query Parameters.

## Lỗi thường gặp và cách xử lý

1. **Nối expression vào SQL → injection.** Triệu chứng: lỗi cú pháp với dữ liệu có dấu nháy, hoặc lỗ hổng bảo mật. Fix: dùng query parameter `$1, $2`, không ghép chuỗi.
2. **Tưởng nhiều node Postgres là một transaction.** Triệu chứng: một bước fail để lại dữ liệu nửa vời. Fix: gộp vào một khối `BEGIN...COMMIT`/stored procedure, hoặc thiết kế bù trừ.
3. **Không xử lý vi phạm UNIQUE.** Triệu chứng: workflow đỏ khi gặp bản ghi trùng. Fix: `ON CONFLICT DO NOTHING`/`neverError` rồi rẽ nhánh.
4. **Kết nối DB không qua credential.** Triệu chứng: mật khẩu lộ khi export. Fix: dùng credential Postgres ([Bài 10](../credentials-va-bao-mat-n8n/)).
5. **Automation ghi đè lên DB của chính n8n.** Triệu chứng: hỏng dữ liệu vận hành n8n. Fix: tách DB nghiệp vụ khỏi DB n8n.

## Best practices

- **Query parameter cho mọi giá trị từ input** — cấu trúc SQL do bạn viết, dữ liệu đi qua tham số.
- **Nguyên tử hóa ở tầng DB**: stored procedure/`BEGIN...COMMIT` cho thao tác cần transaction, thay vì ghép nhiều node.
- **Tách DB nghiệp vụ khỏi DB của n8n**; kết nối qua credential.
- **Tận dụng `ON CONFLICT`/UPSERT** cho idempotency và cập nhật an toàn.
- **Giới hạn quyền DB user** mà n8n dùng — chỉ cấp đúng bảng/thao tác cần thiết.

## Tổng kết + xem tiếp

- Kết nối DB qua **credential**; tách DB nghiệp vụ khỏi DB của n8n.
- **Query có tham số (`$1,$2`)** là bắt buộc để tránh SQL injection — không bao giờ ghép chuỗi.
- n8n **không** tự bọc nhiều node vào transaction; dùng stored procedure/khối SQL cho tính nguyên tử.
- `ON CONFLICT`/UNIQUE hiện thực idempotency store — nối tiếp trực tiếp [Bài 11](../webhook-nang-cao-hmac-idempotency/).

**Bài tiếp — [Bài 13: Self-host production — Postgres + Redis, queue mode, worker, reverse proxy](../self-host-n8n-production-queue-mode/)**: kết thúc phần Trung cấp, ta chuyển sang vận hành thật — mở rộng single-instance ([Bài 2](../cai-dat-n8n-docker-compose/)) thành hệ có queue mode với Redis, worker, reverse proxy và HTTPS để chịu tải production.

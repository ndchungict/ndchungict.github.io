+++
date        = '2026-07-02T13:00:00+07:00'
draft       = false
title       = 'Bài 11 — Webhook nâng cao: response mode, HMAC signature, payload lớn, idempotency'
slug        = 'webhook-nang-cao-hmac-idempotency'
summary     = 'Webhook ở mức production: các response mode, xác thực webhook bằng HMAC signature, xử lý payload lớn và đảm bảo idempotency khi bị gọi trùng.'
thumbnail   = '/images/series-n8n/11-webhook-nang-cao.webp'
featured    = false
weight      = 11
columns     = 2
categories  = ['it']
subcategories = ['workflow', 'automation', 'ai']
tags        = ['n8n', 'webhook', 'idempotency']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Webhook cơ bản ở [Bài 4](../workflow-dau-tien-webhook-rest-api/) nhận request và xử lý — đủ để chạy, nhưng chưa đủ an toàn cho production. Một endpoint webhook công khai là cửa mở ra Internet: bất kỳ ai biết URL đều gọi được. Nhà cung cấp (Stripe, GitHub, cổng thanh toán...) gửi webhook thật, nhưng kẻ xấu cũng có thể giả mạo. Thêm nữa, mạng không đáng tin: cùng một sự kiện có thể được gửi **nhiều lần**. Bài này nâng webhook lên mức production: xác thực nguồn bằng **HMAC signature**, xử lý **payload lớn**, và đảm bảo **idempotency** để xử lý trùng không gây hậu quả.

## Yêu cầu chuẩn bị

- Đã dựng webhook cơ bản ([Bài 4](../workflow-dau-tien-webhook-rest-api/)) và biết response mode.
- Hiểu Code node + built-in `crypto` ([Bài 7](../code-node-chuyen-sau-n8n/)).
- Có DB hoặc store để lưu khóa idempotency (Postgres — [Bài 12](../tich-hop-database-n8n/)).
- n8n 1.x.

## Nhắc lại response mode — chọn đúng cho webhook production

Đã bàn ở [Bài 4](../workflow-dau-tien-webhook-rest-api/): `onReceived` trả `200` ngay khi nhận, `responseNode` chờ workflow chạy xong. Với webhook từ nhà cung cấp bên ngoài, thường nên **trả nhanh** (`onReceived` hoặc Respond sớm) rồi xử lý nền — vì nhiều nhà cung cấp có timeout ngắn và sẽ **gửi lại** nếu bạn trả chậm. Trả chậm chính là một nguyên nhân gây gọi trùng (dẫn thẳng tới nhu cầu idempotency bên dưới).

## Xác thực webhook bằng HMAC signature

Cách chuẩn để biết webhook thật sự đến từ nhà cung cấp: **HMAC signature**. Nhà cung cấp và bạn chia sẻ một **secret**; khi gửi, họ ký payload bằng secret đó (thường HMAC-SHA256) và đính chữ ký vào header (vd `X-Signature`). Bạn tính lại chữ ký trên payload nhận được bằng cùng secret; **khớp thì hợp lệ**.

Điểm phải làm đúng:

- **Ký trên raw body**, đúng byte nhận được — không phải trên object đã parse rồi stringify lại (thứ tự khóa/spacing khác đi sẽ làm chữ ký lệch).
- **So sánh an toàn thời gian** (timing-safe) để tránh rò rỉ qua thời gian so sánh.
- Secret lấy từ **credential** (hoặc `$env` — nhưng `$env` có thể bị chặn bởi `N8N_BLOCK_ENV_ACCESS_IN_NODE` trên instance nhiều người dùng, [Bài 10](../credentials-va-bao-mat-n8n/)); không bao giờ hard-code.

Trong n8n, bạn tính HMAC bằng Code node với built-in `crypto` (nhớ cho phép `crypto` qua `NODE_FUNCTION_ALLOW_BUILTIN` trên self-host — [Bài 7](../code-node-chuyen-sau-n8n/)).

## Idempotency: xử lý trùng không gây hại

**Idempotency** = gọi nhiều lần cho cùng một sự kiện chỉ tạo ra **một** kết quả. Cần thiết vì: nhà cung cấp gửi lại khi timeout, retry của bạn ([Bài 9](../error-handling-production-n8n/)) có thể chạy lại, mạng nhân đôi request. Nếu webhook "tạo đơn" hay "trừ tiền" không idempotent, xử lý trùng = đơn trùng, tiền trừ hai lần.

Pattern chuẩn:

1. Mỗi sự kiện có một **khóa định danh duy nhất** (idempotency key) — nhà cung cấp thường gửi sẵn (`event_id`, `delivery_id`); nếu không, tự sinh từ nội dung (vd hash payload + orderId).
2. Trước khi xử lý, **kiểm tra khóa đã thấy chưa** trong một store (bảng Postgres `processed_events`, hoặc Redis với TTL).
3. Nếu đã thấy → bỏ qua (trả 200, không xử lý lại). Nếu chưa → ghi khóa **rồi** xử lý.
4. Cân nhắc điều kiện đua (race): dùng ràng buộc UNIQUE trên khóa để hai request song song không cùng lọt qua ([Bài 12](../tich-hop-database-n8n/)).

Với ShopViet, `processed_events(event_id)` có UNIQUE constraint; insert khóa trước khi xử lý — nếu insert đụng UNIQUE nghĩa là đã xử lý, bỏ qua.

## Payload lớn

Webhook đôi khi mang payload lớn (danh sách nhiều bản ghi, file base64). Lưu ý:

- n8n có giới hạn kích thước payload cho webhook (cấu hình được qua biến môi trường trên self-host — kiểm tra theo phiên bản). Payload vượt ngưỡng bị từ chối.
- Với dữ liệu thật sự lớn (file), pattern tốt hơn là nhà cung cấp gửi **link tải** thay vì nhồi vào payload; workflow tải riêng bằng HTTP Request ([Bài 5](../http-request-node-auth-pagination-retry/)). File/binary được xử lý theo cơ chế binary data ([Bài 14](../kien-truc-n8n-ben-trong/)).
- Trả nhanh, xử lý nền để không giữ kết nối lâu với payload lớn.

## Ví dụ thực hành: webhook xác thực HMAC + idempotency

Workflow: Webhook → Code (tính HMAC, so với header, sinh idempotency key) → IF (chữ ký hợp lệ?) → [true] tiếp tục / [false] trả 401. Phần lưu idempotency key vào DB để ở [Bài 12](../tich-hop-database-n8n/); ở đây tập trung xác thực và chuẩn bị khóa. Import qua **Workflows → Import from File / Paste**:

```json
{
  "name": "ShopViet - Webhook HMAC + idempotency",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "shopviet/secure-hook",
        "responseMode": "responseNode",
        "options": { "rawBody": true }
      },
      "id": "bb000000-0000-4000-9000-000000000001",
      "name": "Webhook bao mat",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [0, 0]
    },
    {
      "parameters": {
        "jsCode": "// Yeu cau: cho phep 'crypto' qua NODE_FUNCTION_ALLOW_BUILTIN (self-host)\nconst crypto = require('crypto');\n\n// Secret: nen lay tu credential; day dung env de minh hoa\nconst secret = $env.WEBHOOK_SECRET || 'shopviet-demo-secret';\n\nconst item = $input.first();\n\n// RAW BODY: khi bat 'Raw Body' o node Webhook, n8n dua raw body vao BINARY\n// (KHONG phai $json.body da parse). Doc buffer roi decode UTF-8 dung byte da nhan.\n// Field/che do luu binary co the khac theo phien ban -> kiem tra voi ban dang chay.\nconst bin = item.binary && item.binary.data;\nconst rawBody = bin ? Buffer.from(bin.data, 'base64').toString('utf8') : '';\n\nconst sigHeader = (item.json.headers && item.json.headers['x-signature']) || '';\n\n// Ky tren dung raw body, khong stringify lai object da parse\nconst expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');\n\n// So sanh timing-safe (try/catch phong khi lech do dai)\nlet valid = false;\ntry {\n  valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sigHeader));\n} catch (e) {\n  valid = false;\n}\n\n// Idempotency key: uu tien event_id tu payload, khong co thi hash raw body\nconst body = item.json.body || {};\nconst idempotencyKey = body.event_id || crypto.createHash('sha256').update(rawBody).digest('hex');\n\nreturn [{ json: { valid, idempotencyKey, order: body } }];"
      },
      "id": "bb000000-0000-4000-9000-000000000002",
      "name": "Xac thuc HMAC",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [240, 0]
    },
    {
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": true, "typeValidation": "strict" },
          "combinator": "and",
          "conditions": [
            { "id": "v1", "leftValue": "={{ $json.valid }}", "rightValue": true, "operator": { "type": "boolean", "operation": "true", "singleValue": true } }
          ]
        },
        "options": {}
      },
      "id": "bb000000-0000-4000-9000-000000000003",
      "name": "Chu ky hop le?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [480, 0]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"status\": \"accepted\", \"idempotencyKey\": $json.idempotencyKey } }}",
        "options": { "responseCode": 200 }
      },
      "id": "bb000000-0000-4000-9000-000000000004",
      "name": "Tra 200",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [720, -120]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"status\": \"invalid signature\" } }}",
        "options": { "responseCode": 401 }
      },
      "id": "bb000000-0000-4000-9000-000000000005",
      "name": "Tra 401",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [720, 120]
    }
  ],
  "connections": {
    "Webhook bao mat": {
      "main": [[{ "node": "Xac thuc HMAC", "type": "main", "index": 0 }]]
    },
    "Xac thuc HMAC": {
      "main": [[{ "node": "Chu ky hop le?", "type": "main", "index": 0 }]]
    },
    "Chu ky hop le?": {
      "main": [
        [{ "node": "Tra 200", "type": "main", "index": 0 }],
        [{ "node": "Tra 401", "type": "main", "index": 0 }]
      ]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Test bằng `curl` với chữ ký đúng (tính HMAC-SHA256 của body bằng secret) sẽ được 200 kèm `idempotencyKey`; chữ ký sai → 401. Bước tiếp theo trong thực tế: trước khi xử lý đơn, insert `idempotencyKey` vào bảng `processed_events` có UNIQUE — trùng thì bỏ qua ([Bài 12](../tich-hop-database-n8n/)).

> Lưu ý về raw body: bật **Raw Body** ở node Webhook thì n8n đưa raw body vào **binary** (không phải `$json.body` đã parse) — nên Code node đọc buffer từ binary rồi decode UTF-8, đúng byte nhà cung cấp đã ký. **Tuyệt đối không** `JSON.stringify($json.body)` để ký: object đã parse rồi stringify lại đổi thứ tự khóa/khoảng trắng sẽ làm lệch chữ ký. Cách truy cập binary (`item.binary.data`) và chế độ lưu binary có thể khác theo phiên bản n8n — đối chiếu với bản bạn chạy và tài liệu HMAC của nhà cung cấp cụ thể (Stripe dùng header `Stripe-Signature`, GitHub `X-Hub-Signature-256`, Shopify `X-Shopify-Hmac-Sha256`...).

## Lỗi thường gặp và cách xử lý

1. **Ký trên body đã parse+stringify thay vì raw body.** Triệu chứng: chữ ký luôn lệch dù secret đúng. Fix: dùng raw body đúng byte; theo tài liệu nhà cung cấp.
2. **So sánh chữ ký bằng `===`.** Rủi ro timing attack. Fix: `crypto.timingSafeEqual`.
3. **Không idempotent, retry gây trùng.** Triệu chứng: đơn/giao dịch nhân đôi. Fix: idempotency key + store có UNIQUE, kiểm tra trước khi xử lý.
4. **Trả response chậm làm nhà cung cấp gửi lại.** Triệu chứng: cùng sự kiện đến nhiều lần. Fix: trả nhanh, xử lý nền; kết hợp idempotency.
5. **Payload lớn bị từ chối.** Fix: dùng pattern link-tải thay vì nhồi payload; chỉnh giới hạn kích thước theo phiên bản nếu cần.

## Best practices

- **Luôn xác thực webhook công khai** bằng HMAC (hoặc cơ chế nhà cung cấp yêu cầu) — đừng tin URL bí mật là đủ.
- **Idempotency là bắt buộc** cho mọi webhook gây thay đổi trạng thái; khóa duy nhất + UNIQUE constraint.
- **Ký trên raw body, so sánh timing-safe**, secret từ credential/env.
- **Trả nhanh, xử lý nền** cho webhook bên ngoài để tránh gửi lại.
- **Payload lớn**: ưu tiên link-tải, không nhồi vào body.

## Tổng kết + xem tiếp

- Xác thực nguồn webhook bằng **HMAC signature** trên **raw body**, so sánh **timing-safe**.
- **Idempotency** (khóa duy nhất + store có UNIQUE) chống xử lý trùng do gửi lại/retry.
- **Trả nhanh, xử lý nền**; payload lớn dùng pattern link-tải.
- Secret luôn qua credential/env ([Bài 10](../credentials-va-bao-mat-n8n/)), không hard-code.

**Bài tiếp — [Bài 12: Tích hợp database — Postgres/MySQL/MongoDB, query tham số, transaction](../tich-hop-database-n8n/)**: ta hiện thực hóa store cho idempotency và dead-letter — kết nối database, viết query có tham số an toàn, xử lý transaction và tránh SQL injection trong expression.

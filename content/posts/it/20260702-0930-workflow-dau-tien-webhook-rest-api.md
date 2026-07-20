+++
date        = '2026-07-02T09:30:00+07:00'
draft       = false
title       = 'Bài 4 — Xây workflow đầu tiên: Webhook → xử lý → REST API → response'
slug        = 'workflow-dau-tien-webhook-rest-api'
summary     = 'Dựng workflow hoàn chỉnh đầu tiên: nhận request qua Webhook trigger, xử lý dữ liệu, gọi REST API bên ngoài và trả response; debug bằng execution log.'
thumbnail   = '/images/series-n8n/04-workflow-dau-tien.webp'
featured    = false
weight      = 4
categories  = ['it']
subcategories = ['workflow', 'automation', 'ai']
tags        = ['n8n', 'webhook', 'rest-api']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Ba bài đầu đã cho bạn nền lý thuyết: định vị n8n, dựng instance, và hiểu mô hình items ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)). Giờ ta ghép tất cả thành **workflow thật đầu tiên** — một endpoint nhận đơn hàng cho ShopViet: client POST đơn hàng vào Webhook, n8n validate và chuẩn hóa, gọi REST API để tạo bản ghi, rồi trả response về client. Đây là "hello world" nhưng làm theo kiểu production: có validate, có nhánh lỗi, có response tường minh. Xong bài này bạn sẽ biết đọc execution log để debug — kỹ năng quan trọng hơn cả việc nối node.

## Yêu cầu chuẩn bị

- Instance n8n đang chạy ([Bài 2](../cai-dat-n8n-docker-compose/)) và đã nắm mô hình items ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)).
- Một công cụ gọi HTTP (`curl` hoặc Postman) để bắn request test.
- Một REST API để workflow gọi tới. Ví dụ dùng `https://httpbin.org/post` (echo lại payload) cho dễ quan sát; trong thực tế thay bằng API đơn hàng nội bộ của bạn.
- n8n 1.x.

## Webhook trigger: điểm vào của workflow

Kéo node **Webhook** làm trigger. Vài tham số cần hiểu:

- **HTTP Method**: chọn `POST` (nhận đơn hàng).
- **Path**: ví dụ `shopviet/order`. n8n ghép path này vào URL gốc (`WEBHOOK_URL` bạn đặt ở [Bài 2](../cai-dat-n8n-docker-compose/)).
- **Respond**: tạm để `Using 'Respond to Webhook' node` — ta sẽ chủ động trả response ở cuối.

Điểm khiến người mới vấp: **n8n có hai URL webhook khác nhau.**

- **Test URL** — chỉ sống khi bạn bấm *Listen for test event* trong editor; dùng để bắt payload mẫu lúc dựng. Path có tiền tố `webhook-test`, vd `http://localhost:5678/webhook-test/shopviet/order`.
- **Production URL** — chỉ hoạt động khi workflow được **Active** (bật toggle); tiền tố `webhook`, vd `http://localhost:5678/webhook/shopviet/order`. Trước khi Active, gọi vào production URL sẽ 404.

Payload gửi tới sẽ nằm trong item dưới các khóa như `body`, `headers`, `query`. Tức trong workflow bạn lấy dữ liệu đơn hàng bằng `{{ $json.body.orderId }}`, **không phải** `{{ $json.orderId }}` — đây là lỗi kinh điển của người mới (xem phần Lỗi thường gặp).

## Validate và chuẩn hóa dữ liệu

Đừng tin payload từ ngoài. Ngay sau Webhook, đặt một node **IF** để chặn đơn thiếu trường bắt buộc:

- Điều kiện: `{{ $json.body.orderId }}` *is not empty* **và** `{{ $json.body.total }}` *is not empty*.
- Nhánh **true** → xử lý tiếp; nhánh **false** → trả lỗi 400.

Trên nhánh hợp lệ, dùng **Edit Fields (Set)** để chuẩn hóa item — rút gọn về đúng các trường cần, ép kiểu, thêm metadata:

```text
orderId     = {{ $json.body.orderId }}
total       = {{ $json.body.total }}
source      = "webhook"
receivedAt  = {{ $now.toISO() }}
```

Chuẩn hóa sớm giúp các node sau chỉ làm việc với cấu trúc sạch, không phải lặn vào `body` mỗi lần. (Các node transform này được đào sâu ở [Bài 6](../xu-ly-du-lieu-expression-n8n/).)

## Gọi REST API bằng HTTP Request node

Node **HTTP Request** thực hiện cuộc gọi ra ngoài — ở đây POST đơn đã chuẩn hóa tới API tạo đơn:

- **Method**: `POST`
- **URL**: endpoint API của bạn (ví dụ `https://httpbin.org/post`)
- **Body**: gửi JSON, map từ item hiện tại.

Bài này cố ý chỉ chạm bề mặt HTTP Request. Authentication (Bearer/OAuth2/API key), pagination, retry và xử lý lỗi HTTP là cả một bài riêng — [Bài 5](../http-request-node-auth-pagination-retry/).

## Respond to Webhook: trả kết quả về client

Vì đã chọn respond mode `responseNode`, ta kết thúc bằng node **Respond to Webhook**:

- Trả JSON gồm `orderId` và trạng thái, kèm HTTP status code (200 cho thành công, 400 cho đơn không hợp lệ trên nhánh false).

Phân biệt hai response mode:

- **`onReceived`** (mặc định) — n8n trả `200` ngay khi nhận request, *trước khi* chạy xong workflow. Hợp cho fire-and-forget, webhook cần phản hồi cực nhanh.
- **`responseNode`** — n8n chờ workflow chạy tới node Respond to Webhook rồi mới trả. Dùng khi client cần kết quả thật (như ở đây). Đánh đổi: client phải chờ workflow xong, nên cẩn thận với workflow chậm (xem phần timeout ở Lỗi thường gặp).

## Ví dụ thực hành hoàn chỉnh

Workflow đầy đủ: Webhook → IF (validate) → [true] Set → HTTP Request → Respond 200 / [false] Respond 400. Import qua **Workflows → Import from File / Paste**:

```json
{
  "name": "ShopViet - Nhan don qua webhook",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "shopviet/order",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "b4000000-0000-4000-9000-000000000001",
      "name": "Webhook nhan don",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [0, 0]
    },
    {
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": true, "typeValidation": "loose" },
          "combinator": "and",
          "conditions": [
            {
              "id": "c1",
              "leftValue": "={{ $json.body.orderId }}",
              "rightValue": "",
              "operator": { "type": "string", "operation": "notEmpty" }
            },
            {
              "id": "c2",
              "leftValue": "={{ $json.body.total }}",
              "rightValue": "",
              "operator": { "type": "string", "operation": "notEmpty" }
            }
          ]
        },
        "options": {}
      },
      "id": "b4000000-0000-4000-9000-000000000002",
      "name": "Don hop le?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [220, 0]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            { "id": "a1", "name": "orderId", "value": "={{ $json.body.orderId }}", "type": "string" },
            { "id": "a2", "name": "total", "value": "={{ $json.body.total }}", "type": "number" },
            { "id": "a3", "name": "source", "value": "webhook", "type": "string" },
            { "id": "a4", "name": "receivedAt", "value": "={{ $now.toISO() }}", "type": "string" }
          ]
        },
        "options": {}
      },
      "id": "b4000000-0000-4000-9000-000000000003",
      "name": "Chuan hoa don",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [460, -120]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://httpbin.org/post",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json) }}",
        "options": {}
      },
      "id": "b4000000-0000-4000-9000-000000000004",
      "name": "Goi API tao don",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [680, -120]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"status\": \"created\", \"orderId\": $json.json.orderId } }}",
        "options": { "responseCode": 200 }
      },
      "id": "b4000000-0000-4000-9000-000000000005",
      "name": "Tra 200",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [900, -120]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"status\": \"error\", \"message\": \"Thieu orderId hoac total\" } }}",
        "options": { "responseCode": 400 }
      },
      "id": "b4000000-0000-4000-9000-000000000006",
      "name": "Tra 400",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [460, 120]
    }
  ],
  "connections": {
    "Webhook nhan don": {
      "main": [[{ "node": "Don hop le?", "type": "main", "index": 0 }]]
    },
    "Don hop le?": {
      "main": [
        [{ "node": "Chuan hoa don", "type": "main", "index": 0 }],
        [{ "node": "Tra 400", "type": "main", "index": 0 }]
      ]
    },
    "Chuan hoa don": {
      "main": [[{ "node": "Goi API tao don", "type": "main", "index": 0 }]]
    },
    "Goi API tao don": {
      "main": [[{ "node": "Tra 200", "type": "main", "index": 0 }]]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Lưu ý: node HTTP Request gọi `httpbin.org/post` sẽ echo payload trong khóa `json`, nên node Respond đọc `$json.json.orderId`. Khi thay bằng API thật, chỉnh lại đường dẫn field theo response thực tế. `typeVersion` có thể lệch theo phiên bản n8n — nếu import cảnh báo, để n8n tự nâng cấp.

### Test bằng curl

**Active** workflow, rồi bắn request (thay URL production bằng của bạn):

```bash
# Đơn hợp lệ → 200
curl -X POST http://localhost:5678/webhook/shopviet/order \
  -H 'Content-Type: application/json' \
  -d '{"orderId":"SV-3001","total":450000}'

# Đơn thiếu total → 400
curl -X POST http://localhost:5678/webhook/shopviet/order \
  -H 'Content-Type: application/json' \
  -d '{"orderId":"SV-3002"}'
```

## Debug bằng execution log

Vào tab **Executions**, mở một lần chạy: bạn thấy từng node với **input** và **output** thực tế. Kỹ thuật dùng nhiều:

- **Đọc ngược từ node lỗi**: node nào viền đỏ là chỗ hỏng; mở nó xem input đã đúng chưa.
- **Pin data**: ghim output của Webhook để re-run workflow nhiều lần với cùng payload mẫu, khỏi phải bắn curl lại — cực tiện khi tinh chỉnh các node sau.
- **Re-run**: chạy lại execution cũ sau khi sửa node, đối chiếu kết quả.

## Lỗi thường gặp và cách xử lý

1. **Gọi production URL nhưng workflow chưa Active.** Triệu chứng: `404 not registered`. Fix: bật toggle **Active**; hoặc dùng test URL khi còn đang dựng.
2. **Đọc `$json.orderId` thay vì `$json.body.orderId`.** Triệu chứng: expression trả `undefined`, đơn luôn rớt xuống nhánh không hợp lệ. Nguyên nhân: payload nằm trong `body`. Fix: luôn mở execution data của Webhook để thấy đúng cấu trúc trước khi viết expression ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)).
3. **Response mode sai nên client bị treo hoặc nhận rỗng.** Triệu chứng: đặt `responseNode` nhưng không có node Respond to Webhook → request treo tới timeout. Fix: hoặc thêm node Respond, hoặc đổi về `onReceived` nếu không cần trả dữ liệu.
4. **Workflow chậm làm webhook timeout.** Với `responseNode`, client chờ cả workflow. Nếu có bước chậm (API ngoài lag), client có thể timeout. Fix: cân nhắc `onReceived` + xử lý nền, hoặc tối ưu bước chậm; với luồng quan trọng thêm idempotency ([Bài 11](../webhook-nang-cao-hmac-idempotency/)).
5. **HTTP Request fail làm cả workflow đỏ, client không nhận response.** Fix tạm thời: bật *Continue On Fail* hoặc thêm error handling; cách làm chuẩn production ở [Bài 9](../error-handling-production-n8n/).

## Best practices

- **Validate sớm, ngay sau trigger.** Chặn dữ liệu rác trước khi nó lan xuống các node tốn kém (API, DB).
- **Chuẩn hóa item một lần** bằng Set, để phần còn lại của workflow làm việc với cấu trúc sạch thay vì lặn vào `body`.
- **Trả response tường minh** với status code đúng (200/400/...), đừng để client tự đoán.
- **Tách test và production URL trong đầu**: dựng bằng test URL + pin data, chỉ chuyển sang production URL khi đã Active và test kỹ.
- **Đặt tên node theo việc** (đã nhấn ở [Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)) — execution log sẽ dễ đọc hơn nhiều khi có sự cố.

## Tổng kết + xem tiếp

- Webhook trigger có **hai URL** (test/production); production chỉ sống khi workflow **Active**, và payload nằm trong `$json.body`.
- Một workflow production tối thiểu nên có: **validate (IF) → chuẩn hóa (Set) → hành động (HTTP Request) → response (Respond to Webhook)**.
- Hai **response mode** (`onReceived` vs `responseNode`) đánh đổi giữa tốc độ trả và việc trả được kết quả thật.
- **Execution log** (input/output từng node, pin data, re-run) là công cụ debug số một.

**Bài tiếp — [Bài 5: Làm chủ HTTP Request node — authentication, pagination, retry, xử lý lỗi HTTP](../http-request-node-auth-pagination-retry/)**: ta đào sâu node vừa dùng lướt qua — cách xác thực Bearer/OAuth2/API key, phân trang tự động, retry/backoff và xử lý lỗi HTTP đúng chuẩn khi tích hợp API thật.

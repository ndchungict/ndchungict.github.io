+++
date        = '2026-07-02T16:30:00+07:00'
draft       = false
title       = 'Bài 18 — Case study tổng hợp: hệ thống automation xử lý đơn hàng'
slug        = 'case-study-automation-xu-ly-don-hang'
summary     = 'Case study tổng hợp toàn series: xây hệ thống automation hoàn chỉnh xử lý đơn hàng cho ShopViet, kết hợp webhook, database, error handling, queue mode và alert.'
thumbnail   = '/images/series-n8n/18-case-study-tong-hop.webp'
featured    = false
weight      = 18
columns     = 2
categories  = ['it']
subcategories = ['workflow', 'automation', 'ai']
tags        = ['n8n', 'case-study', 'automation']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Mười bảy bài trước dạy từng mảnh; bài này ghép chúng thành một **hệ thống thật**. Ta xây pipeline xử lý đơn hàng hoàn chỉnh cho ShopViet — từ lúc đơn vào qua webhook cho tới khi được xử lý, lưu, thông báo, và xử lý lỗi tử tế. Đây không phải "hello world" mà là bản thu nhỏ của thứ tôi từng chạy production: có xác thực, idempotency, database, phân loại bằng AI, error handling và alert. Mục tiêu là bạn thấy các khái niệm rời rạc *ăn khớp* với nhau ra sao, và có một khung để nhân bản cho bài toán của chính mình.

## Yêu cầu chuẩn bị

- Đã đi qua cả series, đặc biệt: webhook nâng cao ([Bài 11](../webhook-nang-cao-hmac-idempotency/)), database ([Bài 12](../tich-hop-database-n8n/)), error handling ([Bài 9](../error-handling-production-n8n/)), queue mode ([Bài 13](../self-host-n8n-production-queue-mode/)).
- Instance queue mode + Postgres + Redis đang chạy.
- Credential: ShopViet DB, kênh alert (Slack/Telegram), LLM (tùy chọn).
- n8n 1.x.

## Bức tranh tổng thể

Hệ thống gồm các workflow phối hợp, mỗi cái một trách nhiệm (tinh thần sub-workflow từ [Bài 8](../dieu-khien-luong-if-switch-loop-subworkflow/)):

```text
[Cong thanh toan] --webhook--> (1) Nhan & xac thuc don
                                     |
                    HMAC + idempotency (Bai 11)
                                     |
                              (2) Xu ly don
                    - luu DB (Bai 12)
                    - phan loai uu tien bang LLM (Bai 17)
                    - dinh tuyen theo trang thai (Bai 8)
                                     |
                    +----------------+----------------+
                    |                                 |
              (3) Thanh cong                    (4) That bai
              - cap nhat DB                     - dead-letter (Bai 9)
              - alert Slack                     - alert + retry
                                     |
                          (E) Error Workflow (Bai 9)
                          bat moi execution loi -> alert
```

Nguyên tắc thiết kế xuyên suốt:

- **Trả nhanh ở webhook, xử lý nền** ([Bài 11](../webhook-nang-cao-hmac-idempotency/)) — cổng thanh toán không phải chờ.
- **Idempotency trước mọi thứ** — retry/gửi lại không tạo đơn trùng.
- **Mỗi thao tác thay đổi trạng thái đều có đường xử lý lỗi** — không có "happy path only".
- **Một Error Workflow tập trung** bắt mọi sự cố ngoài dự kiến.

## Các thành phần và cách chúng nối vào kiến thức đã học

### (1) Nhận & xác thực đơn

Webhook nhận payload từ cổng thanh toán, **xác thực HMAC** và tính **idempotency key** ([Bài 11](../webhook-nang-cao-hmac-idempotency/)). Trả `200` sớm cho cổng, đẩy phần xử lý xuống nền (queue mode lo phần chạy — [Bài 13](../self-host-n8n-production-queue-mode/)).

### (2) Xử lý đơn

- **Idempotency store**: insert key vào `processed_events` với UNIQUE ([Bài 12](../tich-hop-database-n8n/)); trùng thì dừng sớm.
- **Lưu đơn** vào bảng `orders` bằng query tham số.
- **Phân loại ưu tiên bằng LLM** ([Bài 17](../ai-workflow-n8n-llm-rag/)) — đơn có ghi chú phàn nàn → ưu tiên cao. Đây là "AI như một bước", đúng ranh giới đã bàn.
- **Định tuyến** theo trạng thái/ưu tiên bằng Switch ([Bài 8](../dieu-khien-luong-if-switch-loop-subworkflow/)).

### (3) & (4) Thành công / thất bại

Thành công: cập nhật trạng thái DB + alert kênh vận hành. Thất bại: đẩy vào **dead-letter** (`failed_orders`) kèm nguyên nhân ([Bài 9](../error-handling-production-n8n/)), alert, và một workflow định kỳ thử lại.

### (E) Error Workflow

Một workflow Error Trigger dùng chung ([Bài 9](../error-handling-production-n8n/)) bắt mọi execution fail của cả hệ, gửi alert kèm link execution để debug.

## Ví dụ thực hành: workflow xử lý đơn (rút gọn, import được)

Dưới đây là **workflow (2) xử lý đơn** ở dạng rút gọn nhưng chạy được: nhận đơn (giả lập) → idempotency check (Postgres) → lưu đơn → phân loại đơn giản → định tuyến. Đã lược phần HMAC (xem [Bài 11](../webhook-nang-cao-hmac-idempotency/)) và LLM (xem [Bài 17](../ai-workflow-n8n-llm-rag/)) để giữ ví dụ gọn và không phụ thuộc credential ngoài; gán credential Postgres trước khi chạy. Import qua **Workflows → Import from File / Paste**:

```json
{
  "name": "ShopViet - Xu ly don (tong hop)",
  "nodes": [
    {
      "parameters": {},
      "id": "c0000000-0000-4000-9000-000000000001",
      "name": "When clicking Test workflow",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "jsCode": "// Gia lap don da qua xac thuc HMAC (Bai 11)\nreturn [{ json: { event_id: 'evt-shopviet-1', orderId: 'SV-9001', total: 1250000, note: 'Giao gap giup minh' } }];"
      },
      "id": "c0000000-0000-4000-9000-000000000002",
      "name": "Don vao (da xac thuc)",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [220, 0]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO processed_events (event_id, order_id) VALUES ($1, $2) ON CONFLICT (event_id) DO NOTHING RETURNING event_id;",
        "options": { "queryReplacement": "={{ [$json.event_id, $json.orderId] }}" }
      },
      "id": "c0000000-0000-4000-9000-000000000003",
      "name": "Idempotency check",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [440, 0],
      "alwaysOutputData": true,
      "credentials": { "postgres": { "id": "REPLACE_WITH_CREDENTIAL_ID", "name": "ShopViet DB - prod" } }
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
      "id": "c0000000-0000-4000-9000-000000000004",
      "name": "Don moi?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [660, 0]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            { "id": "p1", "name": "orderId", "value": "={{ $('Don vao (da xac thuc)').item.json.orderId }}", "type": "string" },
            { "id": "p2", "name": "total", "value": "={{ $('Don vao (da xac thuc)').item.json.total }}", "type": "number" },
            { "id": "p3", "name": "priority", "value": "={{ /gap|khan|phan nan/i.test($('Don vao (da xac thuc)').item.json.note || '') ? 'cao' : 'thuong' }}", "type": "string" }
          ]
        },
        "options": {}
      },
      "id": "c0000000-0000-4000-9000-000000000005",
      "name": "Chuan hoa + phan loai",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [880, -120]
    },
    {
      "parameters": {
        "rules": {
          "values": [
            {
              "conditions": {
                "options": { "caseSensitive": true, "typeValidation": "loose" },
                "combinator": "and",
                "conditions": [
                  { "id": "r1", "leftValue": "={{ $json.priority }}", "rightValue": "cao", "operator": { "type": "string", "operation": "equals" } }
                ]
              },
              "outputKey": "uu tien cao"
            }
          ]
        },
        "options": { "fallbackOutput": "extra" }
      },
      "id": "c0000000-0000-4000-9000-000000000006",
      "name": "Dinh tuyen uu tien",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3,
      "position": [1100, -120]
    },
    {
      "parameters": {
        "assignments": { "assignments": [ { "id": "d1", "name": "action", "value": "Bo qua - da xu ly (idempotent)", "type": "string" } ] },
        "options": {}
      },
      "id": "c0000000-0000-4000-9000-000000000007",
      "name": "Bo qua trung",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [880, 120]
    }
  ],
  "connections": {
    "When clicking Test workflow": {
      "main": [[{ "node": "Don vao (da xac thuc)", "type": "main", "index": 0 }]]
    },
    "Don vao (da xac thuc)": {
      "main": [[{ "node": "Idempotency check", "type": "main", "index": 0 }]]
    },
    "Idempotency check": {
      "main": [[{ "node": "Don moi?", "type": "main", "index": 0 }]]
    },
    "Don moi?": {
      "main": [
        [{ "node": "Chuan hoa + phan loai", "type": "main", "index": 0 }],
        [{ "node": "Bo qua trung", "type": "main", "index": 0 }]
      ]
    },
    "Chuan hoa + phan loai": {
      "main": [[{ "node": "Dinh tuyen uu tien", "type": "main", "index": 0 }]]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Workflow này gói gọn nhiều bài: idempotency ([Bài 11](../webhook-nang-cao-hmac-idempotency/)/[Bài 12](../tich-hop-database-n8n/)), item linking `$('Node').item` ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)), chuẩn hóa Set + phân loại bằng expression ([Bài 6](../xu-ly-du-lieu-expression-n8n/)), định tuyến Switch ([Bài 8](../dieu-khien-luong-if-switch-loop-subworkflow/)). Trong bản production đầy đủ, bạn nối thêm: node lưu `orders`, gọi LLM thay cho regex phân loại, các nhánh alert/dead-letter, và trỏ *Settings → Error Workflow* tới Error Workflow chung. Nhớ tạo bảng `processed_events` ([Bài 12](../tich-hop-database-n8n/)) trước khi chạy. Hai chi tiết giữ cho luồng idempotency chạy đúng (đã bàn kỹ ở [Bài 12](../tich-hop-database-n8n/)): query parameter truyền dạng **mảng** `={{ [$json.event_id, $json.orderId] }}`, và node Postgres bật **Always Output Data** để ca trùng (0 row) vẫn chảy vào nhánh "Bỏ qua trùng".

## Lỗi thường gặp và cách xử lý

1. **Ghép nhiều trách nhiệm vào một workflow khổng lồ.** Triệu chứng: khó đọc, khó test, khó sửa. Fix: tách sub-workflow theo trách nhiệm ([Bài 8](../dieu-khien-luong-if-switch-loop-subworkflow/)).
2. **Quên tạo bảng/DB trước khi chạy.** Triệu chứng: node Postgres đỏ. Fix: tạo `processed_events`, `orders`, `failed_orders` trước.
3. **Không trỏ Error Workflow.** Triệu chứng: sự cố nền không ai biết. Fix: cấu hình Error Workflow chung ([Bài 9](../error-handling-production-n8n/)).
4. **Bỏ idempotency vì "đang vội".** Triệu chứng: đơn trùng khi cổng gửi lại. Fix: idempotency là bắt buộc, không phải tùy chọn.
5. **Sửa trực tiếp trên prod.** Fix: versioning + deploy qua pipeline ([Bài 16](../n8n-api-versioning-cicd-workflow/)).

## Best practices (đúc kết cả series)

- **Một workflow, một trách nhiệm**; điều phối ở trên, chi tiết trong sub-workflow.
- **Idempotency + error handling + dead-letter** cho mọi luồng thay đổi trạng thái — không có ngoại lệ ở production.
- **Trả nhanh, xử lý nền** cho webhook; **queue mode** cho tải thật.
- **Secret qua credential, workflow trong Git, prod không sửa tay.**
- **AI/logic phức tạp đúng vai trò**: n8n điều phối, phần lõi nặng để cho code/DB.

## Tổng kết + kết thúc series

- Một hệ automation production là nhiều **workflow một-trách-nhiệm** phối hợp, không phải một khối khổng lồ.
- Các mảnh của series — webhook an toàn, idempotency, database, error handling, queue mode, AI — **ăn khớp** thành pipeline xử lý đơn hoàn chỉnh.
- Xương sống là các nguyên tắc production: trả nhanh/xử lý nền, idempotency, dead-letter, Error Workflow tập trung, workflow-as-code.
- Bạn giờ có khung để nhân bản cho bài toán của mình.

Cảm ơn bạn đã theo hết **18 bài**. Series đi từ [định vị n8n](../n8n-la-gi-goc-nhin-developer/) tới đây — một hệ thống thật. Bước tiếp theo là của bạn: lấy một quy trình thủ công đang tốn thời gian ở công ty, và tự động hóa nó bằng đúng những nguyên tắc trên. Đó mới là lúc kiến thức thành kỹ năng.

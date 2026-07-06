+++
date        = '2026-07-02T11:30:00+07:00'
draft       = true
title       = 'Bài 8 — Điều khiển luồng: IF, Switch, Loop Over Items, Wait và sub-workflow'
slug        = 'dieu-khien-luong-if-switch-loop-subworkflow'
summary     = 'Điều khiển luồng thực thi: IF, Switch, Loop Over Items, Wait, xử lý batch và tách logic bằng Execute Workflow (sub-workflow).'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 8
categories  = ['it']
tags        = ['n8n', 'flow-control', 'sub-workflow']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Tới giờ ta đã biến đổi dữ liệu ([Bài 6](../xu-ly-du-lieu-expression-n8n/)) và viết logic tùy biến ([Bài 7](../code-node-chuyen-sau-n8n/)). Nhưng workflow thật hiếm khi là một đường thẳng: đơn hàng VIP đi một hướng, đơn thường đi hướng khác; có khi phải xử lý 10.000 bản ghi theo batch để không quá tải; có khi phải chờ một sự kiện rồi mới đi tiếp. Đó là lúc cần **điều khiển luồng** — quyết định dữ liệu đi *đường nào*, lặp *bao nhiêu lần*, và khi nào *dừng chờ*. Bài này đi qua IF, Switch, Loop Over Items, Wait, và cách tách logic thành sub-workflow bằng Execute Workflow.

## Yêu cầu chuẩn bị

- Hiểu items và item linking ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)).
- Đã dùng qua IF/Filter ([Bài 6](../xu-ly-du-lieu-expression-n8n/)).
- n8n 1.x.

## IF và Switch: rẽ nhánh theo điều kiện

**IF** cho **hai** output: true và false. Đã dùng ở [Bài 4](../workflow-dau-tien-webhook-rest-api/) để validate đơn. Dùng khi quyết định là nhị phân.

**Switch** cho **nhiều** output theo giá trị hoặc theo nhiều điều kiện — như `switch/case`. Ví dụ định tuyến đơn theo trạng thái: `pending` → nhánh 0, `paid` → nhánh 1, `cancelled` → nhánh 2, còn lại → nhánh fallback. Switch tránh việc lồng nhiều IF vào nhau (vừa rối vừa khó đọc).

Quy tắc chọn: **hai hướng → IF; ba hướng trở lên → Switch.** Đừng chồng IF nhiều tầng khi Switch diễn đạt gọn hơn.

> Gotcha: Switch mặc định gửi mỗi item vào **rule khớp đầu tiên** — nếu nhiều rule cùng khớp, các rule sau bị bỏ qua. Khi muốn một item đi vào *mọi* nhánh khớp, bật tùy chọn gửi tới tất cả nhánh (*Options → Send data to all matching outputs*). Xếp rule cụ thể trước, rule chung sau để tránh "nuốt" nhầm.

## Loop Over Items: xử lý theo batch

Nhắc lại từ [Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/): phần lớn node đã tự xử lý cả mảng items, nên bạn **không** cần lặp thủ công cho các thao tác thường. **Loop Over Items (Split In Batches)** chỉ cần khi:

- Bạn muốn chia items thành **batch nhỏ** để gọi API theo cụm (tránh rate limit — [Bài 5](../http-request-node-auth-pagination-retry/)).
- Cần xử lý **tuần tự** với trạng thái tích lũy giữa các vòng.
- Cần giãn nhịp (kết hợp Wait) giữa các batch.

Node này hoạt động theo vòng: mỗi lần nó phát ra một batch, bạn nối các node xử lý, rồi vòng lại về Loop cho tới khi hết. Có một output **done** để đi tiếp sau khi lặp xong. Điểm hay vấp: quên nối nhánh xử lý quay lại node Loop, khiến vòng lặp không chạy hết.

## Wait: tạm dừng workflow

**Wait** cho phép dừng và tiếp tục sau. Ba kiểu chính:

- **Chờ một khoảng thời gian** (vd 5 phút) — hữu ích để giãn nhịp, hoặc chờ hệ thống khác xử lý.
- **Chờ tới thời điểm cụ thể**.
- **Chờ webhook (resume URL)** — n8n tạo một URL; workflow tiếp tục khi URL đó được gọi. Đây là cách làm các luồng cần phê duyệt (gửi link approve, chờ người bấm).

Với chờ dài, n8n không giữ tiến trình chạy suốt — nó lưu trạng thái và đánh thức lại, nên Wait tiết kiệm tài nguyên hơn là "sleep" trong Code node. (Cơ chế thực thi liên quan tới execution mode — [Bài 14](../kien-truc-n8n-ben-trong/).)

## Sub-workflow: tách logic bằng Execute Workflow

Khi một đoạn logic lặp lại ở nhiều workflow (vd "gửi thông báo đơn hàng", "ghi log chuẩn"), tách nó thành một **sub-workflow** riêng và gọi bằng node **Execute Workflow**. Lợi ích:

- **Tái sử dụng**: sửa một chỗ, mọi nơi gọi đều được cập nhật.
- **Gọn**: workflow chính ngắn, dễ đọc.
- **Phân tách trách nhiệm**: mỗi workflow lo một việc — giống tách hàm/microservice.

Sub-workflow nhận input (items truyền vào), xử lý, trả output về workflow gọi. Với hệ ShopViet, tôi thường có các sub-workflow dùng chung: `notify-slack`, `write-audit-log`, `validate-order`. Đây cũng là nền để tổ chức dự án lớn ([Bài 18](../case-study-automation-shopviet/)).

## Ví dụ thực hành: định tuyến đơn theo trạng thái

Workflow: tạo đơn nhiều trạng thái → **Switch** định tuyến `paid`/`pending`/`cancelled` → mỗi nhánh Set một hành động tương ứng. Import qua **Workflows → Import from File / Paste**:

```json
{
  "name": "ShopViet - Dinh tuyen don theo trang thai",
  "nodes": [
    {
      "parameters": {},
      "id": "b8000000-0000-4000-9000-000000000001",
      "name": "When clicking Test workflow",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "jsCode": "return [\n  { json: { orderId: 'SV-6001', status: 'paid' } },\n  { json: { orderId: 'SV-6002', status: 'pending' } },\n  { json: { orderId: 'SV-6003', status: 'cancelled' } }\n];"
      },
      "id": "b8000000-0000-4000-9000-000000000002",
      "name": "Tao don",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [220, 0]
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
                  { "id": "r1", "leftValue": "={{ $json.status }}", "rightValue": "paid", "operator": { "type": "string", "operation": "equals" } }
                ]
              },
              "outputKey": "paid"
            },
            {
              "conditions": {
                "options": { "caseSensitive": true, "typeValidation": "loose" },
                "combinator": "and",
                "conditions": [
                  { "id": "r2", "leftValue": "={{ $json.status }}", "rightValue": "pending", "operator": { "type": "string", "operation": "equals" } }
                ]
              },
              "outputKey": "pending"
            }
          ]
        },
        "options": { "fallbackOutput": "extra" }
      },
      "id": "b8000000-0000-4000-9000-000000000003",
      "name": "Dinh tuyen",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3,
      "position": [440, 0]
    },
    {
      "parameters": {
        "assignments": { "assignments": [ { "id": "a1", "name": "action", "value": "Xuat kho + gui bien nhan", "type": "string" } ] },
        "options": {}
      },
      "id": "b8000000-0000-4000-9000-000000000004",
      "name": "Xu ly don da thanh toan",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [680, -140]
    },
    {
      "parameters": {
        "assignments": { "assignments": [ { "id": "a2", "name": "action", "value": "Nhac thanh toan", "type": "string" } ] },
        "options": {}
      },
      "id": "b8000000-0000-4000-9000-000000000005",
      "name": "Xu ly don cho",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [680, 0]
    },
    {
      "parameters": {
        "assignments": { "assignments": [ { "id": "a3", "name": "action", "value": "Ghi log huy", "type": "string" } ] },
        "options": {}
      },
      "id": "b8000000-0000-4000-9000-000000000006",
      "name": "Xu ly don huy",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [680, 140]
    }
  ],
  "connections": {
    "When clicking Test workflow": {
      "main": [[{ "node": "Tao don", "type": "main", "index": 0 }]]
    },
    "Tao don": {
      "main": [[{ "node": "Dinh tuyen", "type": "main", "index": 0 }]]
    },
    "Dinh tuyen": {
      "main": [
        [{ "node": "Xu ly don da thanh toan", "type": "main", "index": 0 }],
        [{ "node": "Xu ly don cho", "type": "main", "index": 0 }],
        [{ "node": "Xu ly don huy", "type": "main", "index": 0 }]
      ]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Switch có ba output: hai rule (`paid`, `pending`) và nhánh fallback (đón `cancelled` và mọi trạng thái lạ). Đây là cách định tuyến sạch hơn nhiều so với lồng IF. `typeVersion` của Switch thay đổi giữa các phiên bản — nếu import cảnh báo, để n8n nâng cấp và kiểm tra lại các rule.

## Lỗi thường gặp và cách xử lý

1. **Lồng nhiều IF thay vì dùng Switch.** Triệu chứng: workflow rối như mì, khó sửa. Fix: ba hướng trở lên → Switch, có nhánh fallback.
2. **Quên nối nhánh xử lý quay lại Loop Over Items.** Triệu chứng: vòng lặp chỉ chạy một batch rồi dừng. Fix: nối output của node xử lý trở về node Loop; dùng output **done** để đi tiếp.
3. **Dùng Loop cho việc node đã tự lặp.** Triệu chứng: chậm, phức tạp thừa. Fix: chỉ Loop khi cần batch/tuần tự thật ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)).
4. **"Sleep" trong Code node thay vì Wait.** Triệu chứng: giữ tiến trình, tốn tài nguyên, dễ timeout. Fix: dùng Wait — n8n lưu trạng thái và đánh thức lại.
5. **Sub-workflow nhận sai dữ liệu.** Nguyên nhân: không rõ item nào được truyền vào. Fix: chuẩn hóa input bằng Set trước khi Execute Workflow, và kiểm tra execution của sub-workflow riêng.

## Best practices

- **IF cho nhị phân, Switch cho đa hướng** — luôn có nhánh fallback trong Switch để không nuốt mất case lạ.
- **Chỉ Loop khi thật cần** (batch, tuần tự, giãn nhịp); mặc định để node xử lý cả mảng.
- **Wait thay cho sleep**; với luồng phê duyệt, dùng Wait kiểu resume-URL.
- **Tách sub-workflow** cho logic dùng lại (notify, log, validate) — coi như tách hàm.
- **Giữ workflow chính ngắn**: điều phối ở trên, chi tiết đẩy xuống sub-workflow.

## Tổng kết + xem tiếp

- **IF** (2 nhánh) vs **Switch** (đa nhánh, có fallback) để rẽ hướng dữ liệu.
- **Loop Over Items** chỉ cho batch/tuần tự thật; **Wait** để tạm dừng tiết kiệm tài nguyên (kể cả chờ phê duyệt qua resume-URL).
- **Execute Workflow** tách logic dùng lại thành sub-workflow — tái sử dụng, gọn, phân tách trách nhiệm.
- Điều khiển luồng tốt giúp workflow phức tạp vẫn đọc được và bảo trì được.

**Bài tiếp — [Bài 9: Error handling chuẩn production — Error Trigger, retry, dead-letter, alert](../error-handling-production-n8n/)**: workflow sẽ fail — câu hỏi là fail rồi thì sao. Ta xây chiến lược xử lý lỗi thật: Error Trigger workflow, retry, dead-letter pattern và gửi alert qua Slack/Telegram.

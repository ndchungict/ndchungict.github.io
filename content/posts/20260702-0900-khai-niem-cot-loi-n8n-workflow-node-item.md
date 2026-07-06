+++
date        = '2026-07-02T09:00:00+07:00'
draft       = true
title       = 'Bài 3 — Khái niệm cốt lõi: Workflow, Node, Trigger, Execution và mô hình items'
slug        = 'khai-niem-cot-loi-n8n-workflow-node-item'
summary     = 'Mô hình dữ liệu của n8n: workflow, node, connection, trigger, execution, và cách các items (mảng JSON) chảy giữa các node — nền tảng để hiểu mọi thứ về sau.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 3
categories  = ['it']
tags        = ['n8n', 'core-concept', 'data-flow']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Bạn đã có một instance n8n chạy từ [Bài 2](../cai-dat-n8n-docker-compose/). Trước khi dựng workflow thật, cần nắm **mô hình dữ liệu** của n8n — vì đây chính là ranh giới giữa "xài được n8n" và "hiểu n8n". Phần lớn bug khó chịu của người mới (expression trả `undefined`, node xử lý sai số dòng, dữ liệu "biến mất") đều bắt nguồn từ việc không hiểu **items chảy giữa các node như thế nào**. Bài này mổ xẻ đúng điểm đó: từ vựng cốt lõi, mô hình items, và cơ chế item linking mà tài liệu ít nói nhưng gây bug nhiều nhất.

## Yêu cầu chuẩn bị

- Một instance n8n đang chạy (theo [Bài 2](../cai-dat-n8n-docker-compose/)).
- Đọc-hiểu JSON và JavaScript cơ bản.
- n8n 1.x. Tên và hành vi các node ở bài này ổn định trong 1.x.

## Từ vựng cốt lõi

Nhắc nhanh (đã phác ở [Bài 1](../n8n-la-gi-goc-nhin-developer/), ở đây định nghĩa chặt để dùng xuyên series):

- **Workflow** — một đồ thị có hướng gồm các node và connection, lưu dưới dạng JSON.
- **Node** — một đơn vị xử lý. Chia làm bốn nhóm về mặt vai trò:
  - *Trigger*: khởi động workflow (Webhook, Schedule, App trigger, Manual).
  - *Action*: làm việc với thế giới bên ngoài (HTTP Request, Postgres, Slack...).
  - *Transform*: biến đổi dữ liệu (Edit Fields/Set, Filter, Merge, Split Out, Aggregate — [Bài 6](../xu-ly-du-lieu-expression-n8n/)).
  - *Flow control*: điều khiển luồng (IF, Switch, Loop, Wait — [Bài 8](../dieu-khien-luong-if-switch-loop-subworkflow/)).
- **Connection** — cạnh nối output của node này vào input của node kia. Quyết định thứ tự và đường đi của dữ liệu.
- **Trigger** — node đầu vào. Không có trigger, workflow không tự chạy (chỉ chạy tay khi test).
- **Execution** — một lần chạy workflow: có ID, trạng thái (success/error/running), và **lưu dữ liệu vào/ra của từng node**. Mặc định n8n chạy ở *regular mode* (trong main process); *queue mode* để scale — khái niệm ở [Bài 14](../kien-truc-n8n-ben-trong/), cách dựng thực tế ở [Bài 13](../self-host-n8n-production-queue-mode/).

## Mô hình items — phần lõi phải nắm chắc

Đây là khái niệm quan trọng nhất của cả series. Dữ liệu chảy giữa các node **luôn là một mảng các item**. Mỗi item có dạng:

```javascript
{
  json: { /* payload dạng object, đây là phần bạn thao tác nhiều nhất */ },
  binary: { /* tùy chọn: file/ảnh, mỗi khóa là một file kèm metadata */ }
}
```

Ba điều cần khắc cốt:

1. **Luôn là mảng — kể cả khi chỉ có một phần tử.** Output của một node là `[{json:{...}}]`, không phải `{json:{...}}`. Đây là lý do trong Code node bạn `return [ ... ]` chứ không `return {...}`.
2. **Một node thường chạy một lần trên cả mảng.** Node nhận vào toàn bộ items, xử lý, trả ra items. Nó *không* tự động chạy lại cho từng phần tử (trừ các node/chế độ "run once for each item", hoặc node Loop Over Items). Hiểu nhầm điểm này khiến người mới tưởng phải tự viết vòng lặp ở khắp nơi.
3. **Số item vào ≠ số item ra.** Một node có thể nhận 1 item và phát ra n item (Split Out tách mảng con), hoặc nhận n item và gộp còn 1 (Aggregate). Đây là cách n8n "fan-out / fan-in" dữ liệu.

Bảng đối chiếu nhận thức hay sai:

| Bạn tưởng | Thực tế trong n8n |
|-----------|-------------------|
| Node xử lý một object JSON | Node xử lý một **mảng** items |
| `return { orderId: 1 }` trong Code node | Phải là `return [{ json: { orderId: 1 } }]` |
| Node chạy lại cho từng dòng dữ liệu | Node chạy một lần trên cả mảng (trừ khi lặp) |
| 1 item vào thì 1 item ra | Có thể 1 → n (Split) hoặc n → 1 (Aggregate) |
| `$json` là toàn bộ output node trước | `$json` là item **hiện tại** đang được xử lý |

## Item linking: vì sao expression lấy đúng dòng dữ liệu

Đây là phần tài liệu ít nhấn nhưng gây bug nhiều. Khi bạn viết expression `{{ $json.orderId }}`, n8n hiểu là "trường `orderId` của **item hiện tại**". Khi có nhiều item, n8n xử lý theo từng item và tự map input ↔ output qua cơ chế **paired items** (item linking). Nhờ đó khi bạn tham chiếu ngược về node trước bằng `{{ $('Tên Node').item.json.field }}`, n8n biết lấy đúng item *tương ứng* với item đang xử lý, chứ không phải item bất kỳ.

Hệ quả thực tế cần nhớ:

- `$json` → item hiện tại tại node hiện tại.
- `$('Node X').item` → item của Node X **được liên kết** với item hiện tại.
- `$('Node X').all()` → toàn bộ items của Node X (khi bạn thực sự cần cả mảng).
- `$('Node X').first()` / `.last()` → item đầu/cuối của Node X.

Khi item linking bị "đứt" (thường do một Code node hoặc transform tạo item mới mà không giữ liên kết), tham chiếu `.item` có thể trả sai dòng hoặc `undefined`. Lúc đó cân nhắc dùng `.all()` và tự map theo một khóa định danh (vd `orderId`) thay vì dựa vào liên kết ngầm. Ta sẽ gặp lại tình huống này khi làm việc với Code node ([Bài 7](../code-node-chuyen-sau-n8n/)) và Merge ([Bài 6](../xu-ly-du-lieu-expression-n8n/)).

## Ví dụ thực hành: quan sát items 1 → n

Workflow dưới đây phát ra một đơn hàng ShopViet chứa mảng `lines` (các dòng sản phẩm), rồi dùng **Split Out** để tách mỗi dòng thành một item riêng — minh họa trực tiếp "1 item vào, n item ra". Import qua **Workflows → Import from File / Paste**, chạy *Test workflow* và mở output từng node để xem sự biến đổi:

```json
{
  "name": "ShopViet - Item model demo",
  "nodes": [
    {
      "parameters": {},
      "id": "9c000000-0000-4000-9000-000000000001",
      "name": "When clicking Test workflow",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "jsCode": "// 1 item duy nhat: mot don hang co mang lines\nreturn [\n  {\n    json: {\n      orderId: 'SV-2001',\n      customer: 'Tran Thi B',\n      lines: [\n        { sku: 'AO-001', qty: 2, price: 150000 },\n        { sku: 'QUAN-007', qty: 1, price: 320000 },\n        { sku: 'NON-003', qty: 3, price: 80000 }\n      ]\n    }\n  }\n];"
      },
      "id": "9c000000-0000-4000-9000-000000000002",
      "name": "Tao 1 don hang",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [240, 0]
    },
    {
      "parameters": {
        "fieldToSplitOut": "lines",
        "options": {
          "includeBinary": false,
          "destinationFieldName": ""
        }
      },
      "id": "9c000000-0000-4000-9000-000000000003",
      "name": "Tach tung dong san pham",
      "type": "n8n-nodes-base.splitOut",
      "typeVersion": 1,
      "position": [480, 0]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "s1",
              "name": "sku",
              "value": "={{ $json.sku }}",
              "type": "string"
            },
            {
              "id": "s2",
              "name": "lineTotal",
              "value": "={{ $json.qty * $json.price }}",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "id": "9c000000-0000-4000-9000-000000000004",
      "name": "Tinh thanh tien dong",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [720, 0]
    }
  ],
  "connections": {
    "When clicking Test workflow": {
      "main": [[{ "node": "Tao 1 don hang", "type": "main", "index": 0 }]]
    },
    "Tao 1 don hang": {
      "main": [[{ "node": "Tach tung dong san pham", "type": "main", "index": 0 }]]
    },
    "Tach tung dong san pham": {
      "main": [[{ "node": "Tinh thanh tien dong", "type": "main", "index": 0 }]]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Điều cần quan sát trong execution:

- Node **Tao 1 don hang**: output **1 item**, có trường `lines` là mảng 3 phần tử.
- Node **Tach tung dong san pham** (Split Out): output **3 items** — mỗi dòng sản phẩm thành một item độc lập. Đây là "1 → n".
- Node **Tinh thanh tien dong** (Set): vẫn 3 items, mỗi item được tính thêm `lineTotal`. `$json` ở đây là *từng dòng*, không phải cả đơn hàng.

Chỉ với ba node, bạn đã thấy toàn bộ mô hình: item là object dưới `json`, dữ liệu là mảng, và số lượng item thay đổi dọc workflow.

### Đọc execution data đúng cách

Cả series lặp lại lời khuyên "luôn nhìn execution data" — nhưng nhìn ở đâu? Bấm đúp vào một node để mở **Node Detail View (NDV)**: cột trái là **INPUT** (items node *nhận vào*), cột phải là **OUTPUT** (items node *phát ra*). Ba chế độ xem đáng dùng:

- **Schema** — hiển thị *cấu trúc* trường (tên + kiểu), gọn hơn JSON thô rất nhiều. Đây là chế độ nên dùng khi viết expression: bạn thấy ngay đường dẫn tới trường cần lấy, thậm chí **kéo-thả** trường từ panel vào ô expression để n8n tự sinh `{{ $json... }}` đúng.
- **Table** — xem items dạng bảng, tiện khi có nhiều item cùng cấu trúc (vd sau Split Out).
- **JSON** — xem raw, dùng khi cần soi chính xác kiểu dữ liệu hoặc trường lồng sâu.

Thói quen mở Schema view *trước khi* gõ expression sẽ loại bỏ phần lớn lỗi `undefined` do đoán sai tên/đường dẫn trường.

## Lỗi thường gặp và cách xử lý

1. **`return {…}` thay vì `return [{ json: {…} }]` trong Code node.** Triệu chứng: node báo lỗi định dạng hoặc dữ liệu ra rỗng. Fix: luôn trả **mảng item**, payload nằm dưới khóa `json`.
2. **Expression trả `undefined`.** Nguyên nhân phổ biến: dùng `$json.field` khi `field` nằm ở *item khác* hoặc *node khác*, hoặc sai chính tả tên trường. Fix: mở execution data của node trước, xem chính xác cấu trúc; dùng `$('Node').item.json.field` cho đúng nguồn.
3. **Lấy nhầm dòng dữ liệu khi có nhiều item.** Nguyên nhân: item linking bị đứt sau một transform tạo item mới. Fix: map theo khóa định danh (vd `orderId`) bằng `$('Node').all()` thay vì dựa vào `.item` ngầm.
4. **Binary "biến mất" sau khi transform.** Nguyên nhân: nhiều node transform chỉ giữ phần `json`, không mang theo `binary`. Fix: kiểm tra tùy chọn của node (vd Split Out có `includeBinary`), hoặc xử lý binary bằng node/tham số chuyên biệt.
5. **Tưởng node tự lặp qua từng item nên nhồi vòng lặp thủ công.** Kết quả: logic rối, chạy sai. Fix: hiểu rằng node đã xử lý cả mảng; chỉ dùng Loop Over Items khi thực sự cần batch/tuần tự ([Bài 8](../dieu-khien-luong-if-switch-loop-subworkflow/)).

## Best practices

- **Luôn nhìn execution data.** Trước khi viết expression, mở output node trước và đọc đúng cấu trúc JSON. Đoán mò là nguồn bug số một.
- **Đặt tên node theo việc nó làm**, không để tên mặc định "Set1", "Code2". Tên rõ giúp expression `$('...')` dễ đọc và workflow tự tài liệu hóa.
- **Giữ item gọn.** Đừng kéo theo cả payload khổng lồ qua từng node nếu chỉ cần vài trường — vừa tốn RAM (đáng kể ở [Bài 14](../kien-truc-n8n-ben-trong/)), vừa khó đọc.
- **Chuẩn hóa một khóa định danh** (như `orderId`) sớm trong workflow, để về sau map/merge dữ liệu ổn định thay vì phụ thuộc liên kết ngầm.

## Tổng kết + xem tiếp

- Workflow là đồ thị node + connection; execution là một lần chạy có lưu dữ liệu vào/ra từng node — công cụ debug chính.
- **Dữ liệu giữa node luôn là mảng items**; mỗi item = `{ json, binary? }`; số item có thể thay đổi (1 → n với Split, n → 1 với Aggregate).
- **Item linking** giúp expression lấy đúng dòng dữ liệu tương ứng; khi liên kết đứt, map theo khóa định danh.
- Thói quen "luôn đọc execution data" và "đặt tên node có nghĩa" tiết kiệm cho bạn phần lớn thời gian debug về sau.

**Bài tiếp — [Bài 4: Xây workflow đầu tiên — Webhook → xử lý → REST API → response](../workflow-dau-tien-webhook-rest-api/)**: áp dụng mô hình items vào một workflow thật — nhận đơn hàng ShopViet qua Webhook, xử lý, gọi REST API và trả response, đồng thời debug bằng execution log.

+++
date        = '2026-07-02T10:30:00+07:00'
draft       = false
title       = 'Bài 6 — Xử lý dữ liệu: Set, Filter, Merge, Split Out, Aggregate và expression'
slug        = 'xu-ly-du-lieu-expression-n8n'
summary     = 'Các node biến đổi dữ liệu cốt lõi (Edit Fields, Filter, Merge, Split Out, Aggregate) và cú pháp expression {{ }} cùng các hàm built-in hay dùng.'
thumbnail   = '/images/series-n8n/06-xu-ly-du-lieu-n8n.webp'
featured    = false
weight      = 6
categories  = ['it']
subcategories = ['workflow', 'automation', 'ai']
tags        = ['n8n', 'data-transformation', 'expression']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Lấy được dữ liệu từ API ([Bài 5](../http-request-node-auth-pagination-retry/)) mới là nửa việc; nửa còn lại là **biến đổi** nó cho đúng hình dạng bạn cần. Đây là phần bạn làm nhiều nhất trong n8n: lọc bớt item, gộp hai nguồn, tách mảng con, tổng hợp số liệu, đổi tên/ép kiểu trường. n8n có một bộ node transform gọn nhưng đủ mạnh, và tất cả gắn với **expression** — cú pháp `{{ }}` để tính giá trị động. Nắm chắc bộ này, bạn giải quyết 80% nhu cầu xử lý dữ liệu mà không cần đụng tới Code node ([Bài 7](../code-node-chuyen-sau-n8n/)).

## Yêu cầu chuẩn bị

- Hiểu mô hình items ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)) — đặc biệt "dữ liệu là mảng items" và item linking.
- Đọc-hiểu JavaScript cơ bản (expression của n8n dựa trên JS).
- n8n 1.x.

## Expression: cú pháp `{{ }}` và những gì dùng được bên trong

Ở bất kỳ ô tham số nào, bấm để chuyển sang chế độ expression và viết `{{ ... }}`. Bên trong là **biểu thức JavaScript**, cộng thêm các biến/hàm n8n cung cấp:

- `{{ $json.field }}` — trường của item hiện tại.
- `{{ $json.total * 1.1 }}` — tính toán JS bình thường.
- `{{ $('Ten Node').item.json.field }}` — lấy trường từ node khác (item được liên kết — [Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)).
- `{{ $now }}`, `{{ $now.toISO() }}` — thời gian (n8n dùng Luxon cho DateTime).
- `{{ $itemIndex }}`, `{{ $runIndex }}` — chỉ số item/lần chạy.
- Các helper chuỗi/mảng JS: `.toUpperCase()`, `.map()`, `.filter()`, `.includes()`, `.join()`...

Vài hàm/biến built-in hay dùng:

```javascript
{{ $json.email.toLowerCase().trim() }}                 // chuẩn hóa chuỗi
{{ $json.lines.reduce((s, l) => s + l.qty * l.price, 0) }} // tổng tiền đơn
{{ $now.minus({ days: 7 }).toISO() }}                  // 7 ngày trước
{{ $json.status ?? 'pending' }}                        // giá trị mặc định
{{ $if($json.total > 1000000, 'VIP', 'thuong') }}      // điều kiện gọn
```

Ngoài JS thuần, n8n còn gắn sẵn một bộ **data transformation function** vào chính giá trị — thường ngắn và rõ hơn cách viết JS tương đương:

```javascript
{{ $json.email.isEmpty() }}                 // true nếu rỗng/null/undefined
{{ $json.name.toTitleCase() }}              // "tran van an" → "Tran Van An"
{{ $json.note.extractEmail() }}             // rút email ra khỏi chuỗi
{{ $json.totals.sum() }}                    // tổng một mảng số
{{ $json.skus.unique() }}                   // loại trùng trong mảng
{{ $json.total.round(0) }}                  // làm tròn số
```

Gõ `.` sau một giá trị trong ô expression, n8n gợi ý đúng nhóm hàm hợp với kiểu dữ liệu (string/number/array/object/date) — cách nhanh nhất để khám phá bộ này.

> Mẹo: khi expression phức tạp tới mức khó đọc trên một dòng, đó là tín hiệu nên chuyển sang Code node ([Bài 7](../code-node-chuyen-sau-n8n/)). Đừng nhồi cả thuật toán vào một `{{ }}`.

## Các node transform cốt lõi

### Edit Fields (Set) — đổi hình item

Node dùng nhiều nhất. Thêm/sửa/xóa trường, ép kiểu, chuẩn hóa. Có tùy chọn **Keep Only Set Fields** để vứt mọi trường thừa — hữu ích để "làm sạch" item trước khi đẩy sang DB hay API. Đã dùng ở [Bài 4](../workflow-dau-tien-webhook-rest-api/).

### Filter — bỏ item không thỏa

Khác IF (rẽ nhánh), **Filter** chỉ giữ lại các item thỏa điều kiện và loại phần còn lại — không tạo nhánh thứ hai. Dùng khi bạn muốn "lọc bớt" giữa luồng, ví dụ chỉ giữ đơn `total > 0`.

### Split Out — tách mảng con thành nhiều item

Biến một trường mảng thành nhiều item (1 → n). Đã minh họa ở [Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/) với `lines` của đơn hàng.

### Aggregate — gộp nhiều item thành một (n → 1)

Ngược với Split Out. Gộp giá trị nhiều item thành một item chứa mảng, hoặc tính tổng/đếm. Dùng khi cần "thu" dữ liệu lại sau khi xử lý từng phần tử.

### Merge — hợp hai luồng dữ liệu

Node **Merge** kết hợp dữ liệu từ **hai input**. Các chế độ chính:

- **Append**: nối items của cả hai nhánh thành một danh sách.
- **Combine → By Matching Fields**: join theo khóa chung (giống SQL join, vd ghép đơn hàng với thông tin khách theo `customerId`).
- **Combine → By Position**: ghép theo vị trí index.
- **SQL Query** (một số bản): join bằng cú pháp SQL trên dữ liệu items.

Merge By Matching Fields là công cụ chủ lực khi bạn kéo dữ liệu từ nhiều nguồn (hai API, hoặc API + DB) rồi cần khớp chúng lại.

## Ví dụ thực hành: chuẩn hóa và tổng hợp đơn hàng ShopViet

Workflow: tạo vài đơn thô → **Filter** bỏ đơn giá trị 0 → **Set** chuẩn hóa + phân loại VIP → **Aggregate** tính tổng doanh thu. Minh họa cả expression lẫn chuỗi transform. Import qua **Workflows → Import from File / Paste**:

```json
{
  "name": "ShopViet - Chuan hoa va tong hop don",
  "nodes": [
    {
      "parameters": {},
      "id": "b6000000-0000-4000-9000-000000000001",
      "name": "When clicking Test workflow",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "jsCode": "return [\n  { json: { orderId: 'SV-4001', customer: 'An', total: 1500000 } },\n  { json: { orderId: 'SV-4002', customer: 'Binh', total: 0 } },\n  { json: { orderId: 'SV-4003', customer: 'Chi', total: 350000 } }\n];"
      },
      "id": "b6000000-0000-4000-9000-000000000002",
      "name": "Tao don tho",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [220, 0]
    },
    {
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": true, "typeValidation": "loose" },
          "combinator": "and",
          "conditions": [
            {
              "id": "f1",
              "leftValue": "={{ $json.total }}",
              "rightValue": 0,
              "operator": { "type": "number", "operation": "gt" }
            }
          ]
        },
        "options": {}
      },
      "id": "b6000000-0000-4000-9000-000000000003",
      "name": "Bo don gia tri 0",
      "type": "n8n-nodes-base.filter",
      "typeVersion": 2,
      "position": [440, 0]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            { "id": "s1", "name": "orderId", "value": "={{ $json.orderId }}", "type": "string" },
            { "id": "s2", "name": "customer", "value": "={{ $json.customer }}", "type": "string" },
            { "id": "s3", "name": "total", "value": "={{ $json.total }}", "type": "number" },
            { "id": "s4", "name": "tier", "value": "={{ $json.total >= 1000000 ? 'VIP' : 'thuong' }}", "type": "string" }
          ]
        },
        "options": {}
      },
      "id": "b6000000-0000-4000-9000-000000000004",
      "name": "Chuan hoa + phan loai",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [660, 0]
    },
    {
      "parameters": {
        "aggregate": "aggregateAllItemData",
        "options": {}
      },
      "id": "b6000000-0000-4000-9000-000000000005",
      "name": "Gom lai",
      "type": "n8n-nodes-base.aggregate",
      "typeVersion": 1,
      "position": [880, 0]
    }
  ],
  "connections": {
    "When clicking Test workflow": {
      "main": [[{ "node": "Tao don tho", "type": "main", "index": 0 }]]
    },
    "Tao don tho": {
      "main": [[{ "node": "Bo don gia tri 0", "type": "main", "index": 0 }]]
    },
    "Bo don gia tri 0": {
      "main": [[{ "node": "Chuan hoa + phan loai", "type": "main", "index": 0 }]]
    },
    "Chuan hoa + phan loai": {
      "main": [[{ "node": "Gom lai", "type": "main", "index": 0 }]]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Quan sát: sau **Filter** còn 2 item (đơn `total = 0` bị loại); sau **Set** mỗi item có thêm `tier` tính bằng expression; sau **Aggregate** còn 1 item chứa mảng tất cả đơn — sẵn sàng để gửi report hay ghi log. Muốn tính tổng doanh thu, bạn có thể thêm một Set sau Aggregate với `{{ $json.data.reduce((s, o) => s + o.total, 0) }}`.

## Lỗi thường gặp và cách xử lý

1. **Nhầm Filter với IF.** Filter loại item (một output); IF rẽ nhánh (hai output). Dùng nhầm khiến bạn mất nhánh xử lý phần bị loại. Fix: cần rẽ nhánh → IF; chỉ cần bỏ bớt → Filter.
2. **Merge By Matching Fields không khớp.** Nguyên nhân: khóa hai bên khác kiểu (số vs chuỗi) hoặc khác tên. Fix: chuẩn hóa khóa bằng Set trước khi Merge; kiểm tra kiểu dữ liệu.
3. **Expression trả `undefined` hoặc `[object Object]`.** Nguyên nhân: sai đường dẫn field, hoặc gán object vào ô kiểu string. Fix: mở execution data xem cấu trúc; dùng `JSON.stringify()` nếu thật sự cần chuỗi hóa object.
4. **Ngày giờ lệch múi giờ.** Nguyên nhân: quên `GENERIC_TIMEZONE` ([Bài 2](../cai-dat-n8n-docker-compose/)) hoặc thao tác Luxon sai. Fix: đặt timezone ở env, dùng `$now`/Luxon nhất quán.
5. **Nhồi thuật toán vào expression một dòng.** Kết quả: khó đọc, khó debug. Fix: chuyển sang Code node ([Bài 7](../code-node-chuyen-sau-n8n/)).

## Best practices

- **Chuẩn hóa sớm bằng Set** (kèm *Keep Only Set Fields*) để item gọn, giảm RAM và dễ đọc.
- **Chọn đúng node cho đúng việc**: Filter để lọc, IF để rẽ nhánh, Split Out/Aggregate cho fan-out/fan-in, Merge để join.
- **Chuẩn hóa khóa trước khi Merge** — cùng tên, cùng kiểu — để join không âm thầm rớt bản ghi.
- **Giữ expression đơn giản**; expression phức tạp là mùi code cần tách sang Code node.
- **Luôn kiểm tra số item ở mỗi bước** trong execution — đó là cách nhanh nhất phát hiện transform làm mất/nhân dữ liệu ngoài ý muốn.

## Tổng kết + xem tiếp

- **Expression `{{ }}`** là JavaScript cộng biến/hàm n8n (`$json`, `$now`, `$('Node')`...); giữ nó đơn giản.
- Bộ transform cốt lõi: **Set** (đổi hình), **Filter** (lọc), **Split Out** (1→n), **Aggregate** (n→1), **Merge** (join hai luồng).
- Phân biệt rõ **Filter vs IF** và chuẩn hóa khóa trước **Merge** — hai lỗi hay gặp nhất.
- Khi expression phình to, đó là lúc chuyển sang Code node.

**Bài tiếp — [Bài 7: Code node chuyên sâu — JavaScript/Python, `$input`/`$json`, sandbox](../code-node-chuyen-sau-n8n/)**: khi node có sẵn không đủ, ta viết code trong n8n — mô hình `items`, các biến `$input`/`$json`/`$node`, giới hạn sandbox và ranh giới nên/không nên dùng Code node.

+++
date        = '2026-07-02T11:00:00+07:00'
draft       = true
title       = 'Bài 7 — Code node chuyên sâu: JavaScript/Python, \$input/\$json, sandbox'
slug        = 'code-node-chuyen-sau-n8n'
summary     = 'Viết JavaScript/Python trong Code node: mô hình items, các biến \$input, \$json, \$node, giới hạn sandbox, và khi nào nên dùng Code node thay cho node có sẵn.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 7
categories  = ['it']
tags        = ['n8n', 'code-node', 'javascript']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Node có sẵn giải quyết phần lớn nhu cầu ([Bài 6](../xu-ly-du-lieu-expression-n8n/)), nhưng sẽ có lúc bạn cần logic mà UI không diễn đạt nổi: một thuật toán, một vòng lặp phức tạp, gọi thư viện, biến đổi dữ liệu nhiều bước. Đó là lúc dùng **Code node** — nơi bạn viết JavaScript (hoặc Python) ngay trong workflow. Với developer, đây là node "thân quen" nhất, nhưng cũng là nơi dễ viết sai nhất nếu không nắm mô hình items và giới hạn sandbox. Bài này giúp bạn dùng Code node đúng chỗ, đúng cách — và biết khi nào **không** nên dùng nó.

## Yêu cầu chuẩn bị

- Nắm chắc mô hình items ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)): item = `{ json, binary? }`, dữ liệu là mảng.
- JavaScript ở mức viết được hàm, map/filter, async/await.
- n8n 1.x. Code node ở đây là `typeVersion` 2.

## Hai chế độ chạy: Run Once for All Items vs For Each Item

Code node có hai mode, chọn ở tham số **Mode**:

- **Run Once for All Items** (mặc định): code chạy **một lần**, nhận toàn bộ items, trả về mảng items mới. Dùng khi cần nhìn cả tập dữ liệu (tính tổng, gộp, sắp xếp).
- **Run Once for Each Item**: code chạy **một lần cho mỗi item**. Trong scope, `$json` là item hiện tại. Dùng khi xử lý độc lập từng item và muốn code gọn.

Hiểu nhầm mode là lỗi số một. Ở mode "All Items", `$json` **không** phải một item — bạn phải duyệt qua `$input.all()`.

## Các biến trong Code node

```javascript
// MODE: Run Once for All Items
const items = $input.all();        // mảng tất cả item: [{ json, binary }, ...]
const first = $input.first();      // item đầu
const last  = $input.last();       // item cuối

// Truy cập node khác
const fromNode = $('Ten Node').all();       // items của node khác
const cur      = $('Ten Node').item.json;   // item liên kết (xem Bài 3)

// Tiện ích n8n
$now;        // DateTime hiện tại (Luxon)
$workflow;   // metadata workflow (id, name)
$execution;  // metadata execution
```

Ở mode **For Each Item**, thêm:

```javascript
// MODE: Run Once for Each Item
const data = $json;          // item hiện tại (phần json)
const bin  = $binary;        // binary của item hiện tại (nếu có)
```

**Định dạng trả về** phải đúng, nếu không node lỗi:

```javascript
// All Items: trả mảng item, payload dưới khóa json
return items.map(i => ({
  json: {
    orderId: i.json.orderId,
    totalWithVat: i.json.total * 1.1,
  },
}));

// For Each Item: trả MỘT item (n8n tự bọc mảng)
return { json: { ...$json, processed: true } };
```

## Giới hạn sandbox — điểm developer hay vấp

Code node **không phải Node.js đầy đủ**. Nó chạy trong sandbox, và có vài ràng buộc quan trọng:

- **Không `require` tùy tiện.** Trên n8n Cloud, module ngoài bị chặn. Trên **self-hosted**, bạn phải cho phép tường minh qua biến môi trường `NODE_FUNCTION_ALLOW_EXTERNAL` (danh sách module) và `NODE_FUNCTION_ALLOW_BUILTIN` (module built-in như `crypto`). Không cấu hình thì `require('axios')` sẽ ném lỗi.
- **Không truy cập filesystem/mạng tùy ý** như một service thường — hãy dùng HTTP Request node cho việc gọi mạng, đừng tự `fetch` trong Code trừ khi có lý do.
- **Async được hỗ trợ**: dùng `await` bình thường, nhưng nhớ code phải trả về đúng cấu trúc items.
- **Python** (chế độ "Python (Beta)") chạy qua Pyodide — chậm hơn, thư viện hạn chế. Với developer đã biết JS, tôi khuyên **mặc định dùng JavaScript**; chỉ chọn Python khi có lý do cụ thể (thư viện chỉ có ở Python).

> Ghi nhớ: `NODE_FUNCTION_ALLOW_EXTERNAL` là tính năng của bản **self-hosted**. Việc mở cho phép module ngoài cũng là một quyết định bảo mật — bạn đang cho code trong workflow nạp thư viện; cân nhắc kỹ trên instance nhiều người dùng ([Bài 10](../credentials-va-bao-mat-n8n/)).

## Khi nào dùng Code node — và khi nào tránh

**Nên dùng khi:**

- Logic phức tạp mà expression một dòng không kham nổi (thuật toán, nhiều bước biến đổi).
- Cần gom/tính toán trên cả tập items theo cách các node transform không có sẵn.
- Cần dùng một built-in như `crypto` để ký/hash (vd HMAC — [Bài 11](../webhook-nang-cao-hmac-idempotency/)).

**Nên tránh khi:**

- Việc đó đã có node chuyên biệt (gọi HTTP, query DB, Set/Filter/Merge). Code node tự `fetch` hay tự nối chuỗi SQL vừa khó đọc vừa dễ sai và bỏ qua các tính năng (retry, credential, chống injection) mà node có sẵn lo hộ.
- Workflow cần **non-dev đọc/sửa** — một khối code 50 dòng phá vỡ tính "đọc được" của workflow.
- Bạn định nhét cả nghiệp vụ lõi vào Code node — lúc đó cân nhắc viết một service riêng và để n8n gọi qua HTTP ([Bài 1](../n8n-la-gi-goc-nhin-developer/) đã bàn ranh giới này).

Nguyên tắc của tôi: **Code node để "dán" chỗ các node có sẵn không với tới, không phải để viết lại cả ứng dụng bên trong n8n.**

## Ví dụ thực hành: gộp và tính toán đơn hàng bằng Code node

Workflow: tạo đơn thô → Code node (mode All Items) nhóm đơn theo khách, tính tổng chi tiêu và gắn nhãn hạng. Đây là loại tổng hợp mà node Aggregate khó làm gọn. Import qua **Workflows → Import from File / Paste**:

```json
{
  "name": "ShopViet - Tong hop theo khach (Code node)",
  "nodes": [
    {
      "parameters": {},
      "id": "b7000000-0000-4000-9000-000000000001",
      "name": "When clicking Test workflow",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "jsCode": "return [\n  { json: { orderId: 'SV-5001', customer: 'An', total: 800000 } },\n  { json: { orderId: 'SV-5002', customer: 'An', total: 500000 } },\n  { json: { orderId: 'SV-5003', customer: 'Binh', total: 200000 } }\n];"
      },
      "id": "b7000000-0000-4000-9000-000000000002",
      "name": "Tao don tho",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [220, 0]
    },
    {
      "parameters": {
        "jsCode": "// Mode: Run Once for All Items\n// Nhom don theo khach, tinh tong chi tieu va gan hang\nconst items = $input.all();\nconst byCustomer = {};\n\nfor (const it of items) {\n  const { customer, total } = it.json;\n  if (!byCustomer[customer]) {\n    byCustomer[customer] = { customer, orders: 0, spent: 0 };\n  }\n  byCustomer[customer].orders += 1;\n  byCustomer[customer].spent += total;\n}\n\n// Tra ve moi khach la mot item\nreturn Object.values(byCustomer).map((c) => ({\n  json: {\n    ...c,\n    tier: c.spent >= 1000000 ? 'VIP' : 'thuong',\n  },\n}));"
      },
      "id": "b7000000-0000-4000-9000-000000000003",
      "name": "Tong hop theo khach",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [440, 0]
    }
  ],
  "connections": {
    "When clicking Test workflow": {
      "main": [[{ "node": "Tao don tho", "type": "main", "index": 0 }]]
    },
    "Tao don tho": {
      "main": [[{ "node": "Tong hop theo khach", "type": "main", "index": 0 }]]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Kết quả node cuối: 2 item — `An` với `spent = 1.300.000` nhãn `VIP`, `Binh` với `spent = 200.000` nhãn `thuong`. Chú ý code trả về **mảng item**, mỗi item có payload dưới `json` — đúng mô hình đã học ở [Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/).

## Lỗi thường gặp và cách xử lý

1. **Trả sai định dạng** (`return {...}` ở mode All Items, hoặc quên khóa `json`). Triệu chứng: node báo lỗi hoặc output rỗng. Fix: All Items → trả `[{ json: {...} }]`; For Each Item → trả `{ json: {...} }`.
2. **Dùng `$json` ở mode All Items.** Triệu chứng: `undefined`. Nguyên nhân: `$json` chỉ có nghĩa ở mode For Each Item. Fix: dùng `$input.all()` và duyệt.
3. **`require('...')` lỗi.** Nguyên nhân: sandbox chặn module ngoài. Fix (self-host): thêm vào `NODE_FUNCTION_ALLOW_EXTERNAL`/`NODE_FUNCTION_ALLOW_BUILTIN`; hoặc thiết kế lại để không cần module ngoài.
4. **Item linking đứt sau Code node.** Nguyên nhân: tạo item mới hoàn toàn làm mất liên kết với node trước. Fix: map theo khóa định danh ở các node sau, thay vì dựa `$('Node').item` ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)).
5. **Nhét logic gọi mạng/DB vào Code node.** Triệu chứng: mất retry, mất credential, khó debug. Fix: dùng HTTP Request ([Bài 5](../http-request-node-auth-pagination-retry/)) / Database node ([Bài 12](../tich-hop-database-n8n/)) thay vì tự code.

## Best practices

- **Chọn đúng mode** và nhớ ý nghĩa `$json` trong từng mode.
- **Ưu tiên node có sẵn**; chỉ dùng Code node cho phần chúng không với tới.
- **Giữ Code node ngắn và thuần** (biến đổi dữ liệu), tránh biến nó thành nơi chứa nghiệp vụ lõi.
- **Comment ý đồ** trong code — người sau (và bạn của 3 tháng sau) sẽ cảm ơn.
- **Mặc định JavaScript**; chỉ dùng Python khi bắt buộc, và cân nhắc chi phí hiệu năng.

## Tổng kết + xem tiếp

- Code node có hai mode: **All Items** (`$input.all()`, chạy một lần) và **For Each Item** (`$json`, chạy mỗi item) — nhớ đúng ngữ nghĩa mỗi mode.
- Sandbox giới hạn `require`; self-host mở qua `NODE_FUNCTION_ALLOW_EXTERNAL`/`ALLOW_BUILTIN`, và đó cũng là quyết định bảo mật.
- Định dạng trả về phải đúng: mảng item với payload dưới `json`.
- Dùng Code node để "dán" chỗ node có sẵn không tới, **không** để viết lại cả ứng dụng trong n8n.

**Bài tiếp — [Bài 8: Điều khiển luồng — IF, Switch, Loop Over Items, Wait và sub-workflow](../dieu-khien-luong-if-switch-loop-subworkflow/)**: ta chuyển từ biến đổi dữ liệu sang điều khiển *đường đi* của nó — rẽ nhánh, phân nhánh nhiều hướng, lặp theo batch, tạm dừng, và tách logic bằng Execute Workflow.

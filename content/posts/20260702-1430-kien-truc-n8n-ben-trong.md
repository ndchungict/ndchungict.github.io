+++
date        = '2026-07-02T14:30:00+07:00'
draft       = true
title       = 'Bài 14 — Kiến trúc n8n bên trong: main vs worker, execution mode, binary data'
slug        = 'kien-truc-n8n-ben-trong'
summary     = 'Bên trong n8n: main process vs worker, execution mode (regular/queue), cách lưu binary data — hiểu để tối ưu hiệu năng và tài nguyên.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 14
categories  = ['it']
tags        = ['n8n', 'architecture', 'performance']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Ở [Bài 13](../self-host-n8n-production-queue-mode/) ta *dựng* queue mode. Bài này trả lời câu **vì sao** — và quan trọng hơn, giúp bạn đọc được hành vi hiệu năng của hệ thống. Khi một workflow ngốn RAM bất thường, khi execution chậm dù đã thêm worker, khi binary data làm phình database — bạn cần hiểu n8n hoạt động bên trong ra sao mới chẩn đoán đúng. Đây là bài "kiến trúc" cho mid/senior: main vs worker, các execution mode, và cơ chế binary data — ba thứ quyết định phần lớn bài toán hiệu năng.

## Yêu cầu chuẩn bị

- Đã dựng queue mode ([Bài 13](../self-host-n8n-production-queue-mode/)).
- Hiểu mô hình items ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)) — đặc biệt "item đi qua từng node".
- n8n 1.x. Chi tiết triển khai bên trong có thể thay đổi giữa các phiên bản — bài này nêu nguyên lý, hãy đối chiếu tài liệu bản bạn dùng khi cần con số cụ thể.

## Main process vs worker

Trong queue mode, hai vai trò có trách nhiệm khác hẳn nhau:

- **Main process**: phục vụ Editor UI, REST API, và **đăng ký trigger/webhook**. Khi một trigger kích hoạt, main **không** tự chạy execution mà đẩy một job vào Redis. Main là "bộ não điều phối".
- **Worker**: kéo job từ Redis, **thực thi workflow** (chạy từng node, gọi API, query DB), ghi kết quả execution vào Postgres. Đây là nơi tải CPU/RAM thực sự nằm.

Hệ quả thực tế:

- Muốn chạy nhanh hơn/nhiều hơn → thêm **worker**, không phải thêm main.
- Trigger và webhook do main quản; nếu tải webhook rất lớn, có thể tách **webhook processor** riêng để main không nghẽn.
- Concurrency của mỗi worker cấu hình được (số execution song song một worker chạy). Tổng công suất ≈ số worker × concurrency mỗi worker.

## Execution mode và cách lưu execution data

n8n lưu **execution** (input/output từng node) vào database — đây là thứ bạn xem khi debug ([Bài 4](../workflow-dau-tien-webhook-rest-api/)). Điểm cần nắm về hiệu năng:

- Mỗi execution lưu **toàn bộ dữ liệu chảy qua các node**. Workflow kéo theo payload lớn qua nhiều node → execution nặng → DB phình nhanh.
- Bạn cấu hình được **lưu gì**: chỉ lưu execution lỗi, hay cả thành công; có prune (tự xóa execution cũ) theo thời gian/số lượng. Trên hệ tải cao, **bật pruning** là bắt buộc, nếu không Postgres phình vô hạn.
- `EXECUTIONS_MODE` (regular/queue) quyết định *ai* chạy; cấu hình lưu trữ execution (`EXECUTIONS_DATA_SAVE_*`, pruning) quyết định *lưu bao nhiêu*. Hai nhóm này độc lập — kiểm tra tên biến theo phiên bản.

Tối ưu điển hình: chỉ lưu execution lỗi cho các workflow tải cao ít cần audit, và giữ execution thành công cho các workflow quan trọng cần truy vết.

## Binary data: nơi RAM và storage dễ nổ

Nhắc lại từ [Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/): item có thể mang `binary` (file/ảnh). Đây là nguồn sự cố hiệu năng phổ biến nhất:

- Mặc định, binary data có thể được giữ **trong bộ nhớ** và đi kèm execution — xử lý vài file lớn song song là RAM tăng vọt, worker OOM.
- n8n cho chọn **backend lưu binary**: in-memory (mặc định, nhanh nhưng tốn RAM) hoặc **filesystem/S3** (`N8N_DEFAULT_BINARY_DATA_MODE=filesystem`) để không giữ file trong RAM và không nhồi vào DB.
- Với workflow xử lý file (import CSV lớn, ảnh, PDF), **chuyển binary sang filesystem/S3** là tối ưu quan trọng nhất. Kèm theo: dọn binary tạm định kỳ.

Nguyên tắc: **đừng để dữ liệu lớn đi qua bộ nhớ execution nếu tránh được.** Với file, dùng backend filesystem/S3 và chỉ giữ *tham chiếu*, không giữ nội dung, trong item.

## Đọc và tối ưu hiệu năng — checklist tư duy

Khi gặp vấn đề hiệu năng, đi theo thứ tự:

1. **Tải nằm ở worker** — thiếu công suất thì thêm worker/concurrency, đừng động vào main.
2. **Execution nặng vì item to** — cắt bớt trường sớm ([Bài 6](../xu-ly-du-lieu-expression-n8n/)), đừng kéo payload thừa qua nhiều node.
3. **DB phình** — bật pruning execution, cân nhắc chỉ lưu execution lỗi.
4. **RAM tăng đột biến** — nghi binary in-memory; chuyển sang filesystem/S3.
5. **Hàng đợi Redis dài** — worker không theo kịp; scale worker, hoặc tách webhook processor.

## Ví dụ thực hành: workflow đo "sức nặng" execution

Không có JSON hạ tầng để "import" cho bài kiến trúc này; thay vào đó, đây là một workflow chẩn đoán nhỏ — tạo một item với payload lớn rồi rút gọn — để bạn *thấy* tác động của kích thước item lên execution data. Import qua **Workflows → Import from File / Paste**, chạy và so sánh kích thước output hai node:

```json
{
  "name": "ShopViet - Do suc nang execution",
  "nodes": [
    {
      "parameters": {},
      "id": "be000000-0000-4000-9000-000000000001",
      "name": "When clicking Test workflow",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "jsCode": "// Tao payload lon: 1000 dong san pham kem mo ta dai\nconst lines = Array.from({ length: 1000 }, (_, i) => ({\n  sku: 'SKU-' + i,\n  qty: (i % 5) + 1,\n  price: 10000 * ((i % 9) + 1),\n  description: 'Mo ta san pham rat dai '.repeat(20),\n}));\nreturn [{ json: { orderId: 'SV-BIG-1', lines } }];"
      },
      "id": "be000000-0000-4000-9000-000000000002",
      "name": "Payload lon (nang)",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [220, 0]
    },
    {
      "parameters": {
        "jsCode": "// Rut gon: chi giu thong tin can, bo description\nconst it = $input.first().json;\nconst slim = it.lines.map((l) => ({ sku: l.sku, lineTotal: l.qty * l.price }));\nreturn [{ json: { orderId: it.orderId, count: slim.length, lines: slim } }];"
      },
      "id": "be000000-0000-4000-9000-000000000003",
      "name": "Rut gon (nhe)",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [440, 0]
    }
  ],
  "connections": {
    "When clicking Test workflow": {
      "main": [[{ "node": "Payload lon (nang)", "type": "main", "index": 0 }]]
    },
    "Payload lon (nang)": {
      "main": [[{ "node": "Rut gon (nhe)", "type": "main", "index": 0 }]]
    }
  },
  "settings": {},
  "pinData": {}
}
```

So sánh output hai node: node đầu mang theo cả `description` dài (nặng, được lưu vào execution data), node sau đã cắt bỏ (nhẹ hơn nhiều). Bài học trực quan: **mỗi trường thừa bạn kéo qua node đều nhân lên trong execution data** — cắt sớm giúp giảm RAM và giảm phình DB. Đây chính là lý do best practice "giữ item gọn" từ [Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/) có ý nghĩa hiệu năng thật.

## Lỗi thường gặp và cách xử lý

1. **Thêm main thay vì worker để tăng tốc.** Fix: tải nằm ở worker; scale worker/concurrency.
2. **DB phình vô hạn.** Nguyên nhân: không prune execution. Fix: bật pruning, cân nhắc chỉ lưu execution lỗi cho workflow tải cao.
3. **Worker OOM khi xử lý file.** Nguyên nhân: binary in-memory. Fix: `N8N_DEFAULT_BINARY_DATA_MODE=filesystem` (hoặc S3), dọn binary tạm.
4. **Execution nặng, chạy chậm.** Nguyên nhân: item kéo theo payload lớn qua nhiều node. Fix: cắt trường thừa sớm ([Bài 6](../xu-ly-du-lieu-expression-n8n/)).
5. **Hàng đợi Redis dồn.** Nguyên nhân: worker không đủ. Fix: thêm worker, tách webhook processor nếu webhook là điểm nghẽn.

## Best practices

- **Scale worker, không scale main**; giám sát độ dài hàng đợi Redis.
- **Bật pruning execution** và chọn lọc lưu (lỗi vs thành công) theo nhu cầu audit.
- **Binary sang filesystem/S3** cho mọi workflow xử lý file.
- **Giữ item gọn** — cắt trường thừa sớm để giảm cả RAM lẫn dung lượng execution.
- **Đo trước khi tối ưu**: xem execution data/kích thước item để biết nút thắt thật ở đâu.

## Tổng kết + xem tiếp

- **Main điều phối, worker thực thi**; tăng công suất bằng cách thêm worker × concurrency.
- **Execution data lưu toàn bộ dữ liệu qua node** — bật pruning và giữ item gọn để không phình DB/RAM.
- **Binary data** là nguồn OOM phổ biến; chuyển sang filesystem/S3 cho workflow xử lý file.
- Hiểu kiến trúc giúp bạn chẩn đoán hiệu năng đúng chỗ thay vì đoán mò.

**Bài tiếp — [Bài 15: Xây custom node bằng TypeScript — declarative vs programmatic, publish npm](../xay-custom-node-n8n-typescript/)**: khi không node có sẵn nào phù hợp và Code node cũng không đủ gọn, ta tự viết node — cấu trúc một community node bằng TypeScript, hai style declarative/programmatic, và cách publish lên npm.

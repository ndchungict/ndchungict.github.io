+++
date        = '2026-07-02T08:00:00+07:00'
draft       = false
title       = 'Bài 1 — Giới thiệu về n8n, kiến trúc của n8n'
slug        = 'n8n-la-gi-goc-nhin-developer'
summary     = 'Hiểu n8n như một workflow automation engine: kiến trúc tổng thể, mô hình node-based, so sánh thẳng với Zapier, Make, Airflow và Temporal, và tiêu chí kỹ thuật để quyết định khi nào nên — và không nên — dùng n8n.'
thumbnail   = '/images/series-n8n/01-n8n-la-gi-kien-truc-n8n.webp'
featured    = false
weight      = 1
categories  = ['it']
tags        = ['n8n', 'automation', 'kien-truc']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Nếu bạn từng nghe "n8n là Zapier cho người không biết code" thì hãy quên câu đó đi — nó khiến developer đánh giá thấp công cụ này. Dưới góc nhìn kỹ thuật, n8n là một **workflow automation engine** self-hostable, nơi bạn nối các bước xử lý thành một đồ thị và để engine thực thi, nhưng vẫn thả được JavaScript/TypeScript vào bất kỳ đâu khi UI không đủ.

Bài mở màn này không dạy bạn kéo-thả; nó giúp bạn **định vị đúng n8n**: kiến trúc bên trong ra sao, khác gì Zapier/Make/Airflow/Temporal, và quan trọng nhất — khi nào chọn nó là đúng, khi nào là sai lầm. Đây là nền để cả series (18 bài, xoay quanh hệ thống automation cho một công ty e-commerce giả định tên **ShopViet**) không bị lạc hướng.

## Yêu cầu chuẩn bị

- Biết REST API, JSON, và JavaScript ở mức đọc-hiểu (series giả định điều này).
- Docker cơ bản (để hình dung phần self-host; cài đặt chi tiết ở [Bài 2](../cai-dat-n8n-docker-compose/)).
- Chưa cần cài gì cho riêng bài này — đây là bài định vị kiến trúc. Toàn series viết dựa trên **n8n 1.x, Community Edition self-hosted**. n8n phát hành nhanh, nên khi một tính năng phụ thuộc phiên bản, tôi sẽ nói rõ; bạn nên đối chiếu với version đang chạy của mình.

## n8n thực chất là gì

Bỏ phần marketing sang một bên, n8n gồm ba khối:

1. **Editor UI** — ứng dụng web để bạn dựng workflow bằng cách nối các node. Đây chỉ là lớp tạo ra một file cấu hình.
2. **Workflow (bản chất là một đồ thị)** — mỗi workflow là một **directed graph**: node là đỉnh, connection là cạnh. Nó được lưu dưới dạng JSON (nodes + connections). Chính vì là JSON nên workflow *versioning được bằng Git*, điều ta khai thác ở [Bài 16](../n8n-api-versioning-cicd-workflow/).
3. **Execution engine** — bộ phận đọc đồ thị đó và chạy: khởi động từ trigger, đẩy dữ liệu qua từng node theo connection, ghi lại execution vào database.

Điểm mấu chốt mà developer cần nắm ngay: **mỗi node là một hàm nhận vào một mảng items và trả ra một mảng items.** "Item" là một object có khóa `json` (payload) và tùy chọn `binary` (file). Dữ liệu chảy giữa các node luôn là **mảng** — kể cả khi chỉ có một phần tử. Hiểu sai điểm này là nguồn gốc của phần lớn bug ở người mới (viết Code node tưởng đang xử lý một object, thực ra đang xử lý một array). Ta sẽ mổ xẻ mô hình items ở [Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/).

Về mặt tư duy, hãy coi một workflow như một **pipeline hàm thuần**:

```text
Trigger ──items──▶ Node A ──items──▶ Node B ──items──▶ Node C
```

Mỗi mũi tên mang theo một mảng items. Node không "gọi" nhau như hàm trong code; engine mới là thứ điều phối: nó chạy node xong, lấy output làm input cho node kế tiếp. Đây là lý do n8n xử lý được cả nhánh, gộp luồng, lặp — những thứ ta bàn ở [Bài 8](../dieu-khien-luong-if-switch-loop-subworkflow/).

### Trigger và execution

Một workflow bắt đầu bằng **trigger node**: có thể là Webhook (nhận HTTP request), Schedule (cron), hoặc trigger của một app (nhận event từ SaaS). Mỗi lần trigger kích hoạt, engine tạo một **execution** — một lần chạy có ID, có trạng thái (success/error/running), có log dữ liệu vào/ra từng node. Với developer, execution log chính là "stack trace + request/response inspector" của n8n, và là công cụ debug số một (dùng nhiều từ [Bài 4](../workflow-dau-tien-webhook-rest-api/) trở đi).

## So sánh có chính kiến: n8n vs Zapier/Make vs Airflow vs Temporal

Đây là phần quan trọng nhất của bài. Chọn nhầm nhóm công cụ là sai lầm tốn kém nhất, và bốn cái tên này thường bị đặt nhầm cạnh nhau.

| Trục | n8n | Zapier / Make | Airflow | Temporal |
|------|-----|---------------|---------|----------|
| Mô hình | Node-based, workflow = graph JSON | Node-based, SaaS | DAG viết bằng Python | Durable execution, code thuần (Go/Java/TS...) |
| Self-host | Có (Community miễn phí) | Không | Có | Có |
| Giá | Miễn phí self-host / trả tiền Cloud | Theo số task/operation | Hạ tầng tự trả | Hạ tầng tự trả |
| Điểm mạnh | Tích hợp SaaS + API, có code khi cần | Nhanh, không cần hạ tầng | Lập lịch data pipeline khối lượng lớn | Workflow long-running, bền, retry ở mức ngôn ngữ |
| Đối tượng | Developer + team vận hành | Non-tech / growth | Data engineer | Backend engineer |

Diễn giải thẳng:

- **Zapier/Make** là SaaS thuần, tính tiền theo số operation. Chúng thắng khi bạn cần dựng nhanh, không muốn nuôi hạ tầng, và dữ liệu không nhạy cảm. Chúng thua khi khối lượng lớn (hóa đơn phình to), hoặc khi bạn cần control ở mức code, hoặc bắt buộc self-host vì lý do dữ liệu. n8n sinh ra để lấp đúng khoảng đó.
- **Airflow** không cùng loại với n8n dù nhìn xa giống nhau. Airflow là **scheduler cho data pipeline**: chạy batch job theo lịch, DAG viết bằng Python, mạnh về backfill và quản lý phụ thuộc giữa các job nặng. Nếu bài toán của bạn là ETL hàng chục triệu dòng mỗi đêm, dùng Airflow (hoặc Dagster/Prefect), đừng ép n8n.
- **Temporal** là **durable execution framework**: bạn viết workflow bằng chính ngôn ngữ backend, và Temporal đảm bảo nó chạy tới cùng dù process chết giữa chừng — state được persist ở mức từng bước. Đây là thứ để xây business-critical, long-running logic (ví dụ quy trình hoàn tiền kéo dài nhiều ngày). n8n *có* lưu execution nhưng không phải durable execution theo nghĩa của Temporal; đừng dùng n8n cho loại bài toán này.

Một câu để nhớ: **Zapier/Make là "no-code SaaS", Airflow là "data pipeline scheduler", Temporal là "durable code workflow", còn n8n là "integration/automation engine self-host có cửa hậu code".**

### Còn các engine self-host khác thì sao?

Bốn cái tên trên giúp định vị theo *loại bài toán*, nhưng đối thủ **gần n8n nhất** lại là nhóm engine tự-host mã nguồn mở khác — và developer thường hỏi đúng nhóm này:

- **Windmill** — lấy *script làm gốc* (Python/TypeScript/Go/Bash), UI workflow chỉ là lớp phủ. Thắng khi team code-first, muốn viết logic thuần rồi ghép lại. Nếu bạn thấy "cửa hậu code" của n8n vẫn chưa đủ code, Windmill đáng cân nhắc.
- **Activepieces** — gần n8n nhất về mô hình node/tích hợp, tự-host được và dùng **license MIT** sạch. Đáng xem nếu bạn cần nhúng engine vào sản phẩm mà không vướng ràng buộc license (xem note dưới).
- **Pipedream** — mô hình tương tự nhưng thiên **cloud**, mạnh ở kho tích hợp khổng lồ; self-host không phải trọng tâm.

n8n thắng khi bạn muốn **cân bằng giữa UI cho non-dev và cửa hậu code cho dev**, cộng với hệ sinh thái node trưởng thành và cộng đồng lớn nhất nhóm này.

> **Về license — đọc trước khi làm agency/SaaS:** n8n phát hành theo **Sustainable Use License** (mô hình *fair-code*), **không phải** OSI open-source thuần. Tự-host cho nội bộ và dùng thương mại nội bộ thì miễn phí thoải mái. Nhưng nếu bạn định **bán n8n như một phần sản phẩm/dịch vụ cho bên thứ ba** (host hộ khách hàng, nhúng vào SaaS của bạn), hãy đọc kỹ license hoặc mua giấy phép thương mại. Đây là khác biệt pháp lý cần cân nhắc từ đầu — nếu vướng, Activepieces (MIT) là lối thoát.

## Khi nào NÊN — và KHÔNG NÊN — dùng n8n

**Nên dùng khi:**

- Bạn cần **glue nhiều SaaS/API** lại với nhau (CRM ↔ kho ↔ Slack ↔ database) mà viết service riêng thì thừa.
- Bạn xây **internal tool / automation nội bộ**: đồng bộ dữ liệu, gửi alert, tạo report định kỳ, xử lý webhook.
- Bạn **bắt buộc self-host** vì dữ liệu nhạy cảm (khách hàng, đơn hàng) không được đẩy qua SaaS bên thứ ba.
- Bạn muốn **non-dev trong team đọc/sửa được** luồng, nhưng vẫn cần dev nhúng code ở các bước phức tạp.

**Không nên dùng khi:**

- Bài toán là **data pipeline khối lượng lớn** với yêu cầu backfill, lineage → Airflow/Dagster.
- Logic là **long-running, durable, business-critical** cần đảm bảo exactly-once ở mức nghiêm ngặt → Temporal hoặc tự viết service + queue.
- Logic **thuần code, phức tạp, thay đổi liên tục theo commit** — lúc đó một microservice trong repo của bạn dễ test, review, deploy hơn là một workflow trong UI. n8n mạnh ở *tích hợp*, không phải thay thế toàn bộ codebase.
- Yêu cầu **latency cực thấp, throughput cực cao** trên đường đi nóng của sản phẩm.

> Kinh nghiệm production của tôi: n8n tỏa sáng ở "vùng biên" của hệ thống — nơi các service gặp SaaS và cần automation vận hành. Đẩy nó vào lõi xử lý nghiệp vụ nặng là cách nhanh nhất để sau này phải viết lại.

## Ví dụ minh họa: items chảy qua workflow

Vì đây là bài định vị, ví dụ ở đây cố ý tối giản — chỉ để bạn *thấy* mô hình items trước khi dựng workflow thật ở [Bài 4](../workflow-dau-tien-webhook-rest-api/). Workflow dưới đây: một Manual Trigger, nối vào một Code node phát ra hai đơn hàng mẫu của ShopViet. Vào n8n chọn **Workflows → Import from File / Paste**, dán JSON sau và chạy thử (nút *Test workflow*):

```json
{
  "name": "ShopViet - Demo items flow",
  "nodes": [
    {
      "parameters": {},
      "id": "5f1c8b10-0001-4a00-9000-000000000001",
      "name": "When clicking Test workflow",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "jsCode": "// Mỗi phần tử trong mảng trả về là 1 item.\n// n8n yêu cầu bọc payload trong khóa `json`.\nreturn [\n  { json: { orderId: 'SV-1001', total: 250000, status: 'pending' } },\n  { json: { orderId: 'SV-1002', total: 990000, status: 'pending' } }\n];"
      },
      "id": "5f1c8b10-0002-4a00-9000-000000000002",
      "name": "Tao don hang mau",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [240, 0]
    }
  ],
  "connections": {
    "When clicking Test workflow": {
      "main": [
        [
          { "node": "Tao don hang mau", "type": "main", "index": 0 }
        ]
      ]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Chạy xong, mở output của node Code: bạn sẽ thấy **hai item**, mỗi item là một object dưới khóa `json`. Đó chính là "hình hài" dữ liệu mà mọi node sau này nhận vào. Lưu ý: `typeVersion` của node có thể khác giữa các phiên bản n8n — nếu import báo lệch version, n8n thường tự nâng cấp node, hoặc bạn chỉnh lại cho khớp bản đang chạy.

## Lỗi thường gặp và cách xử lý

1. **Tưởng node xử lý một object, thực ra là một mảng items.** Đây là hiểu lầm số một. Viết Code node kiểu `return { orderId: 1 }` sẽ lỗi hoặc cho kết quả sai; đúng phải là `return [{ json: {...} }]`. Nắm chắc "dữ liệu luôn là mảng items" từ đầu.
2. **Chọn nhầm n8n cho bài toán data pipeline lớn.** Triệu chứng: workflow chạy chậm, ngốn RAM, execution nặng nề. Nguyên nhân: dùng sai loại công cụ. Fix: tách phần xử lý khối lượng lớn sang Airflow/service riêng, để n8n làm điều phối/tích hợp.
3. **Kỳ vọng n8n "durable" như Temporal.** Khi process chết giữa execution, không phải lúc nào cũng resume hoàn hảo như bạn tưởng. Với luồng critical, thiết kế **idempotency** ([Bài 11](../webhook-nang-cao-hmac-idempotency/)) và error handling ([Bài 9](../error-handling-production-n8n/)) thay vì trông chờ engine tự cứu.
4. **Dùng bản Cloud rồi mặc định mọi tính năng đều có ở self-host.** Một số tính năng (SSO, RBAC nâng cao, log streaming, external secrets, environments) thuộc gói **Enterprise/Cloud**. Community Edition self-hosted miễn phí nhưng thiếu các mục này — kiểm tra trước khi thiết kế phụ thuộc vào chúng.

## Best practices

- **Định vị trước khi dựng.** Trước mỗi automation, tự hỏi: đây có phải bài toán tích hợp không? Nếu là data pipeline nặng hoặc durable business logic, dừng lại — chọn công cụ khác.
- **Coi workflow là artifact code.** Vì workflow là JSON, hãy xem nó như code: đặt tên node có nghĩa, export và commit vào Git ngay từ đầu (chi tiết ở [Bài 16](../n8n-api-versioning-cicd-workflow/)).
- **Tự host khi dữ liệu nhạy cảm.** Với ShopViet (dữ liệu đơn hàng, khách hàng), self-host là lựa chọn mặc định trong series — vừa kiểm soát dữ liệu, vừa không bị tính tiền theo operation.
- **Ghim phiên bản n8n.** Đừng chạy `latest`; ghim tag version cụ thể để tránh workflow vỡ sau khi node đổi typeVersion. Ta cấu hình việc này ở [Bài 2](../cai-dat-n8n-docker-compose/).

## Tổng kết + xem tiếp

- n8n là **workflow automation engine**: workflow là đồ thị JSON, mỗi node là hàm nhận/trả **mảng items**, engine điều phối và ghi lại execution.
- So với các công cụ khác: n8n nằm giữa "no-code SaaS" (Zapier/Make) và "code thuần" — mạnh ở **tích hợp SaaS/API self-host**, không phải data pipeline nặng (Airflow) hay durable execution (Temporal).
- Chọn n8n khi cần glue hệ thống, internal tool, self-host vì dữ liệu; tránh khi bài toán là ETL khối lượng lớn, long-running critical, hoặc logic thuần code phức tạp.
- Vì workflow là JSON nên nó versioning được — nền tảng cho toàn bộ cách làm việc "workflow as code" của series.

**Bài tiếp — [Bài 2: Cài đặt n8n với npm, Docker, Docker Compose và biến môi trường](../cai-dat-n8n-docker-compose/)**: ta dựng môi trường chạy thật, ghim version, cấu hình các biến quan trọng (`N8N_ENCRYPTION_KEY`, `WEBHOOK_URL`, kết nối database) và nắm cấu trúc thư mục dữ liệu cần backup — chuẩn bị cho workflow đầu tiên ở Bài 4.

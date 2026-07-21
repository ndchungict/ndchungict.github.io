+++
date        = '2026-07-02T12:00:00+07:00'
draft       = false
title       = 'Bài 9 — Error handling chuẩn production: Error Trigger, retry, dead-letter, alert'
slug        = 'error-handling-production-n8n'
summary     = 'Xử lý lỗi ở mức production: Error Trigger workflow, retry strategy, dead-letter pattern và gửi alert qua Slack/Telegram khi workflow fail.'
thumbnail   = '/images/series-n8n/09-error-handling-n8n.webp'
featured    = false
weight      = 9
columns     = 2
categories  = ['it']
subcategories = ['workflow', 'automation', 'ai']
tags        = ['n8n', 'error-handling', 'production']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Trong dev, workflow fail thì bạn mở execution log xem ([Bài 4](../workflow-dau-tien-webhook-rest-api/)). Trong production, không ai ngồi canh — và workflow **sẽ** fail: API ngoài sập, DB timeout, dữ liệu rác lọt qua. Câu hỏi không phải "làm sao để không bao giờ fail" mà là **"fail rồi thì sao"**: ai được báo, dữ liệu hỏng đi đâu, có tự thử lại không. Bài này xây chiến lược error handling thật cho ShopViet: Error Trigger workflow tập trung, retry đúng chỗ, dead-letter cho việc không cứu được ngay, và alert qua Slack/Telegram.

## Yêu cầu chuẩn bị

- Đã hiểu HTTP error ([Bài 5](../http-request-node-auth-pagination-retry/)) và flow control ([Bài 8](../dieu-khien-luong-if-switch-loop-subworkflow/)).
- Một kênh để nhận alert: Slack webhook hoặc Telegram bot.
- n8n 1.x.

## Ba tầng xử lý lỗi

Tôi chia error handling trong n8n thành ba tầng, dùng phối hợp:

1. **Tầng node** — xử lý ngay tại node có thể lỗi: retry (Retry On Fail), Continue On Fail để rẽ nhánh ([Bài 5](../http-request-node-auth-pagination-retry/)). Đây là tuyến phòng thủ đầu.
2. **Tầng workflow** — Error Trigger workflow bắt mọi execution fail của một hoặc nhiều workflow, tập trung xử lý (log, alert).
3. **Tầng dữ liệu** — dead-letter: item không xử lý được thì cất riêng để xử lý lại sau, thay vì mất hoặc chặn cả luồng.

Nguyên tắc: **lỗi tạm thời thì retry, lỗi dữ liệu thì dead-letter, mọi lỗi bất thường thì alert.**

## Error Trigger: một workflow bắt lỗi cho nhiều workflow

n8n có node **Error Trigger**. Bạn tạo một workflow riêng bắt đầu bằng node này; nó sẽ chạy **mỗi khi một workflow khác fail** (đã được trỏ tới workflow lỗi này trong *Settings → Error Workflow* của workflow đó, hoặc đặt mặc định toàn instance).

Khi chạy, Error Trigger nhận một payload mô tả lỗi:

```javascript
// Dữ liệu Error Trigger nhận được (rút gọn)
{
  execution: { id, url, error: { message, stack }, lastNodeExecuted },
  workflow:  { id, name }
}
```

Từ đó bạn định tuyến: log vào DB, gửi alert kèm link execution để debug nhanh. **Một Error Workflow dùng chung cho cả hệ** là cách gọn nhất — thay vì mỗi workflow tự xử lý lỗi riêng, bạn có một chỗ tập trung để chuẩn hóa alert và log.

> ⚠️ Gotcha khi test: Error Workflow **chỉ chạy cho production execution** — tức workflow đang **Active** và fail khi chạy qua trigger thật (webhook, schedule...). Lần chạy thử bằng nút *Test workflow* trong editor mà lỗi sẽ **không** kích hoạt Error Workflow (lỗi hiện thẳng trên UI). Nên nhiều người tưởng Error Workflow hỏng. Muốn kiểm thử: Active workflow rồi cố tình tạo lỗi thật (vd trỏ HTTP Request tới URL sai), sau đó xem execution của chính Error Workflow.

## Retry strategy: thử lại cho đúng

Retry chỉ hợp lý với **lỗi tạm thời** (5xx, timeout, mất kết nối). Có hai chỗ đặt retry:

- **Retry On Fail tại node** ([Bài 5](../http-request-node-auth-pagination-retry/)): số lần + khoảng chờ. Đủ cho hầu hết trường hợp.
- **Retry ở tầng execution**: chạy lại cả execution fail (thủ công từ UI, hoặc bằng logic trong Error Workflow).

Tránh: retry lỗi 4xx (dữ liệu sai — thử lại vẫn sai), và retry vô hạn (nên có trần số lần + backoff). Với thao tác **không idempotent** (tạo bản ghi, trừ tiền), retry có thể gây trùng — phải kết hợp idempotency ([Bài 11](../webhook-nang-cao-hmac-idempotency/)) trước khi bật retry mạnh tay.

## Dead-letter pattern: đừng để một item hỏng chặn cả lô

Khi xử lý một lô items, một item lỗi không nên làm mất cả lô. Pattern dead-letter:

1. Bật **Continue On Fail** ở node xử lý (hoặc rẽ nhánh lỗi bằng IF theo `statusCode`).
2. Item lỗi → đẩy sang một "dead-letter store": bảng DB, một Slack channel, hoặc một file — kèm nguyên nhân và payload gốc.
3. Item tốt → tiếp tục luồng bình thường.
4. Có một workflow/định kỳ **xử lý lại** dead-letter sau (đọc lại, thử lại, hoặc để người xử lý tay).

Với ShopViet, dead-letter là một bảng Postgres `failed_orders` (dùng Database node — [Bài 12](../tich-hop-database-n8n/)); mỗi đêm một workflow quét bảng này thử xử lý lại. Nhờ vậy một đơn dữ liệu lỗi không bao giờ làm dừng dây chuyền xử lý các đơn còn lại.

## Alert: báo cho đúng người, đủ thông tin

Alert vô dụng nếu thiếu ngữ cảnh. Một alert tốt gồm: tên workflow, thông điệp lỗi, node fail, và **link tới execution** để mở xem ngay. Đừng spam — gộp hoặc throttle nếu một lỗi lặp lại dồn dập (tránh "alert fatigue").

## Ví dụ thực hành: Error Workflow gửi alert Slack

Workflow dưới đây là một **Error Workflow** hoàn chỉnh: Error Trigger → Set chuẩn hóa thông tin lỗi → HTTP Request gửi message vào Slack Incoming Webhook. Trỏ workflow bất kỳ tới nó qua *Settings → Error Workflow*. Import qua **Workflows → Import from File / Paste**:

```json
{
  "name": "ShopViet - Error Workflow (alert Slack)",
  "nodes": [
    {
      "parameters": {},
      "id": "b9000000-0000-4000-9000-000000000001",
      "name": "Khi co workflow loi",
      "type": "n8n-nodes-base.errorTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            { "id": "e1", "name": "workflowName", "value": "={{ $json.workflow.name }}", "type": "string" },
            { "id": "e2", "name": "errorMessage", "value": "={{ $json.execution.error.message }}", "type": "string" },
            { "id": "e3", "name": "failedNode", "value": "={{ $json.execution.lastNodeExecuted }}", "type": "string" },
            { "id": "e4", "name": "executionUrl", "value": "={{ $json.execution.url }}", "type": "string" }
          ]
        },
        "options": {}
      },
      "id": "b9000000-0000-4000-9000-000000000002",
      "name": "Chuan hoa thong tin loi",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [240, 0]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://hooks.slack.com/services/THAY/BANG/WEBHOOK",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ { \"text\": `:rotating_light: *${$json.workflowName}* loi tai node *${$json.failedNode}*\\n> ${$json.errorMessage}\\n<${$json.executionUrl}|Mo execution>` } }}",
        "options": {}
      },
      "id": "b9000000-0000-4000-9000-000000000003",
      "name": "Gui alert Slack",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [480, 0]
    }
  ],
  "connections": {
    "Khi co workflow loi": {
      "main": [[{ "node": "Chuan hoa thong tin loi", "type": "main", "index": 0 }]]
    },
    "Chuan hoa thong tin loi": {
      "main": [[{ "node": "Gui alert Slack", "type": "main", "index": 0 }]]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Thay URL Slack bằng Incoming Webhook thật của bạn (hoặc dùng node Slack/Telegram chuyên biệt với credential — [Bài 10](../credentials-va-bao-mat-n8n/)). Alert gửi đi kèm **link execution** — bấm vào là mở đúng lần chạy lỗi để debug, không phải đi tìm.

> Lưu ý: `{{ $json.execution.url }}` chỉ có giá trị khi instance biết URL công khai của mình (đặt `N8N_HOST`/`WEBHOOK_URL` đúng — [Bài 2](../cai-dat-n8n-docker-compose/)); nếu chưa cấu hình, link trong alert sẽ rỗng.

## Lỗi thường gặp và cách xử lý

1. **Không đặt Error Workflow.** Triệu chứng: workflow fail âm thầm, không ai biết cho tới khi khách phàn nàn. Fix: tạo Error Workflow dùng chung và trỏ mọi workflow production tới nó.
2. **Retry thao tác không idempotent.** Triệu chứng: đơn bị tạo trùng, tiền bị trừ hai lần. Fix: đảm bảo idempotency ([Bài 11](../webhook-nang-cao-hmac-idempotency/)) trước khi bật retry.
3. **Một item hỏng làm mất cả lô.** Fix: Continue On Fail + dead-letter, tách item lỗi ra khỏi luồng chính.
4. **Alert thiếu ngữ cảnh.** Triệu chứng: nhận "Workflow failed" mà không biết ở đâu. Fix: đính kèm tên node, message, và link execution.
5. **Alert fatigue.** Triệu chứng: một lỗi lặp bắn hàng trăm message, mọi người tắt thông báo. Fix: throttle/gộp alert; tách mức nghiêm trọng.

## Best practices

- **Một Error Workflow tập trung** cho cả hệ — chuẩn hóa alert và log ở một chỗ.
- **Phân loại lỗi**: tạm thời → retry; dữ liệu → dead-letter; bất thường → alert.
- **Dead-letter mọi luồng batch quan trọng** — không để một item chặn cả lô, và luôn có đường xử lý lại.
- **Alert giàu ngữ cảnh + link execution**, kèm throttle để tránh nhiễu.
- **Idempotency trước retry** cho mọi thao tác thay đổi trạng thái.

## Tổng kết + xem tiếp

- Ba tầng: **node** (retry/continue), **workflow** (Error Trigger tập trung), **dữ liệu** (dead-letter).
- **Error Trigger** cho một workflow bắt lỗi dùng chung, nhận đủ thông tin để alert và debug.
- **Retry** chỉ cho lỗi tạm thời và thao tác idempotent; **dead-letter** cho item hỏng để không chặn luồng.
- **Alert** phải đủ ngữ cảnh và có link execution, tránh spam.

**Bài tiếp — [Bài 10: Credentials và bảo mật — mã hóa, quản lý secrets, phân quyền](../credentials-va-bao-mat-n8n/)**: alert Slack ở trên vẫn hard-code URL webhook — chưa chuẩn. Ta chuyển sang cách n8n mã hóa và quản lý credentials an toàn, phân quyền, và export workflow mà không lộ bí mật.

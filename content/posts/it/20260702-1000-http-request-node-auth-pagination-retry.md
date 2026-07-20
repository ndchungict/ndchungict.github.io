+++
date        = '2026-07-02T10:00:00+07:00'
draft       = false
title       = 'Bài 5 — Làm chủ HTTP Request node: auth, pagination, retry, xử lý lỗi'
slug        = 'http-request-node-auth-pagination-retry'
summary     = 'HTTP Request node ở mức production: authentication (Bearer, API key, OAuth2), pagination tự động, retry/backoff và xử lý lỗi HTTP đúng cách.'
thumbnail   = '/images/series-n8n/05-http-request-node.webp'
featured    = false
weight      = 5
categories  = ['it']
subcategories = ['workflow', 'automation', 'ai']
tags        = ['n8n', 'http-request', 'api-integration']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Ở [Bài 4](../workflow-dau-tien-webhook-rest-api/) ta đã dùng lướt qua HTTP Request node để POST một đơn hàng. Nhưng khi tích hợp API thật, "gọi được" chỉ là phần dễ. Phần khó — và là nơi workflow production hay chết — nằm ở **authentication, pagination, retry và xử lý lỗi HTTP**. Một API hết hạn token lúc 2 giờ sáng, một endpoint phân trang trả 10.000 bản ghi, một service chập chờn trả 503: nếu node của bạn không xử lý những thứ này, workflow sẽ fail âm thầm hoặc lấy thiếu dữ liệu. Bài này biến HTTP Request node từ "công cụ gọi API" thành "client API chịu được production".

## Yêu cầu chuẩn bị

- Đã dựng workflow cơ bản ([Bài 4](../workflow-dau-tien-webhook-rest-api/)) và hiểu items ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)).
- Một API để thử. Ví dụ dùng `https://httpbin.org` (test auth/status code) và một REST API có phân trang bất kỳ.
- n8n 1.x. HTTP Request node ở đây là `typeVersion` 4.x.

## Authentication: đừng nhét token vào header bằng tay

HTTP Request node hỗ trợ auth theo hai hướng: **dùng Credential** (khuyên dùng) hoặc **tự set header**. Luôn ưu tiên Credential, vì n8n mã hóa và tách bí mật khỏi workflow JSON ([Bài 10](../credentials-va-bao-mat-n8n/)) — nếu bạn hard-code token vào header, nó sẽ lộ khi export workflow.

Các kiểu auth hay dùng:

- **Bearer token**: tạo credential *Header Auth* hoặc *Bearer* — n8n tự gắn `Authorization: Bearer <token>`.
- **API key**: nhiều API nhận key qua header (`X-API-Key`) hoặc query param. Dùng credential *Header Auth* / *Query Auth*.
- **Basic Auth**: credential *Basic Auth* (user/password).
- **OAuth2**: dùng credential *OAuth2 API*. n8n lo vòng đời token — tự refresh khi hết hạn. Đây là lý do lớn để dùng Credential thay vì tự quản: bạn không phải viết logic refresh token thủ công.

Trong node, chọn **Authentication → Predefined/Generic Credential Type**, trỏ tới credential đã tạo (*Settings → Credentials → Add credential*). Workflow chỉ tham chiếu credential theo ID, không chứa bí mật.

> Kinh nghiệm: với API nội bộ ShopViet, tôi tạo một credential *Header Auth* dùng chung, đặt tên rõ (`ShopViet API - prod`). Khi xoay vòng key, chỉ sửa một credential thay vì sửa từng node.

## Pagination: lấy đủ dữ liệu, không chỉ trang đầu

Lỗi kinh điển: gọi API list, nhận 50 bản ghi, tưởng là tất cả — thực ra API phân trang và bạn mới lấy trang 1. HTTP Request node có sẵn phần **Pagination** (trong *Options → Pagination*), hỗ trợ các kiểu:

- **Trang tăng dần / offset**: gửi `?page={{ $pageCount + 1 }}` hoặc `?offset=...`, lặp tới khi trang rỗng.
- **Cursor / next-URL**: nhiều API trả `next_cursor` hoặc URL trang kế trong response; cấu hình n8n lấy giá trị đó cho request tiếp theo.
- **Điều kiện dừng** (*Complete Expression*): ví dụ dừng khi response rỗng hoặc không còn cursor.

Cấu hình pagination đúng thì node tự gộp kết quả tất cả trang thành các items — bạn không phải tự viết vòng lặp. Nếu API có kiểu phân trang lạ, phương án dự phòng là tự lặp bằng Loop Over Items + biến trạng thái ([Bài 8](../dieu-khien-luong-if-switch-loop-subworkflow/)), nhưng hãy thử pagination built-in trước.

## Retry và timeout: chịu được service chập chờn

Mạng và API bên thứ ba không đáng tin. HTTP Request node có sẵn (trong *Options*):

- **Retry On Fail**: bật để tự thử lại khi request lỗi, cấu hình số lần và khoảng chờ giữa các lần.
- **Timeout**: đặt timeout hợp lý (vd 30s) thay vì để treo vô hạn.
- **Batching**: khi gọi API nhiều lần, giãn nhịp để không bị rate limit.

Quy tắc của tôi: retry chỉ nên áp cho lỗi **tạm thời** (5xx, timeout, network). Retry một lỗi `400 Bad Request` là vô nghĩa — request sai thì thử lại vẫn sai, chỉ tổ tốn thời gian. Với lỗi 4xx do dữ liệu, nên rẽ nhánh xử lý (validate lại, đẩy vào dead-letter) thay vì retry — pattern này ở [Bài 9](../error-handling-production-n8n/).

## Xử lý lỗi HTTP đúng cách

Mặc định, HTTP Request node coi status code 4xx/5xx là **lỗi** và làm node đỏ, dừng workflow. Bạn có vài lựa chọn:

- **Continue On Fail / "Never Error"**: node không ném lỗi mà đưa response (kèm status) xuống output, để bạn tự rẽ nhánh bằng IF theo `statusCode`. Hữu ích khi 404 là kết quả hợp lệ (vd "chưa có bản ghi").
- **Bắt lỗi bằng Error Trigger workflow** ([Bài 9](../error-handling-production-n8n/)) cho lỗi thật sự bất thường.
- Đọc **response headers** (vd `Retry-After` khi bị 429) để quyết định chờ bao lâu trước khi thử lại.

Điểm mấu chốt: **phân biệt lỗi "mong đợi được" (404, 409) với lỗi "bất thường" (500, timeout)** và xử lý mỗi loại một cách khác nhau, thay vì để mọi thứ làm workflow đỏ.

## Ví dụ thực hành: đồng bộ sản phẩm ShopViet có phân trang + xử lý lỗi

Workflow: Manual Trigger → HTTP Request (GET danh sách sản phẩm, có pagination, không ném lỗi) → IF theo `statusCode` → nhánh thành công ghi nhận OK / nhánh lỗi ghi lại `statusCode`. Đây là mẫu "kéo dữ liệu từ API bên ngoài" hay gặp. Import qua **Workflows → Import from File / Paste**:

```json
{
  "name": "ShopViet - Dong bo san pham (phan trang)",
  "nodes": [
    {
      "parameters": {},
      "id": "b5000000-0000-4000-9000-000000000001",
      "name": "When clicking Test workflow",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://httpbin.org/get",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            { "name": "page", "value": "1" },
            { "name": "limit", "value": "50" }
          ]
        },
        "options": {
          "response": {
            "response": { "neverError": true, "fullResponse": true }
          },
          "pagination": {
            "pagination": {
              "parameters": {
                "parameters": [
                  { "name": "page", "value": "={{ $pageCount + 1 }}" }
                ]
              },
              "paginationCompleteWhen": "other",
              "completeExpression": "={{ $response.body.json === undefined }}",
              "limitPagesFetched": true,
              "maxRequests": 5
            }
          },
          "timeout": 30000
        }
      },
      "id": "b5000000-0000-4000-9000-000000000002",
      "name": "GET san pham",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [240, 0]
    },
    {
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": true, "typeValidation": "loose" },
          "combinator": "and",
          "conditions": [
            {
              "id": "c1",
              "leftValue": "={{ $json.statusCode ?? 200 }}",
              "rightValue": 400,
              "operator": { "type": "number", "operation": "lt" }
            }
          ]
        },
        "options": {}
      },
      "id": "b5000000-0000-4000-9000-000000000003",
      "name": "Request thanh cong?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [480, 0]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            { "id": "a1", "name": "message", "value": "Dong bo OK", "type": "string" }
          ]
        },
        "options": {}
      },
      "id": "b5000000-0000-4000-9000-000000000004",
      "name": "Log thanh cong",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [720, -120]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            { "id": "a2", "name": "message", "value": "Dong bo that bai", "type": "string" },
            { "id": "a3", "name": "statusCode", "value": "={{ $json.statusCode }}", "type": "number" }
          ]
        },
        "options": {}
      },
      "id": "b5000000-0000-4000-9000-000000000005",
      "name": "Log loi",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [720, 120]
    }
  ],
  "connections": {
    "When clicking Test workflow": {
      "main": [[{ "node": "GET san pham", "type": "main", "index": 0 }]]
    },
    "GET san pham": {
      "main": [[{ "node": "Request thanh cong?", "type": "main", "index": 0 }]]
    },
    "Request thanh cong?": {
      "main": [
        [{ "node": "Log thanh cong", "type": "main", "index": 0 }],
        [{ "node": "Log loi", "type": "main", "index": 0 }]
      ]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Ví dụ dùng `httpbin.org/get` nên phần pagination chỉ mang tính minh họa cấu hình (nó không thực sự phân trang). Khi nối vào API thật, chỉnh `completeExpression` theo cách API báo hết trang (response rỗng, hết `next_cursor`...), và tăng `maxRequests` cho phù hợp.

Hai tùy chọn response phối hợp để việc rẽ nhánh chạy đúng: `neverError: true` khiến node **không** đỏ khi gặp 4xx/5xx mà đưa response xuống output; `fullResponse: true` để output có cả `statusCode` (và `headers`) — nếu thiếu nó, node chỉ trả body và `$json.statusCode` sẽ luôn `undefined`, khiến IF không phân biệt được thành công/lỗi. **Lưu ý:** khi bật `fullResponse`, dữ liệu thật của API nằm dưới `$json.body` (không còn ở gốc `$json`), nên các node sau phải đọc `$json.body.<field>`.

## Lỗi thường gặp và cách xử lý

1. **Chỉ lấy trang đầu.** Triệu chứng: thiếu dữ liệu mà không báo lỗi. Nguyên nhân: quên cấu hình pagination. Fix: bật Pagination, đặt `completeExpression` đúng, kiểm tra số item khớp tổng thật.
2. **Hard-code token vào header.** Triệu chứng: token lộ khi export workflow, và hết hạn thì phải sửa tay khắp nơi. Fix: dùng Credential (OAuth2 tự refresh) — [Bài 10](../credentials-va-bao-mat-n8n/).
3. **Retry cả lỗi 4xx.** Triệu chứng: workflow chậm, spam request sai. Fix: chỉ retry lỗi tạm thời (5xx/timeout); 4xx thì rẽ nhánh xử lý.
4. **Bị rate limit (429) làm fail hàng loạt.** Fix: giãn nhịp bằng batching, đọc header `Retry-After`, giảm concurrency.
5. **Node đỏ vì 404 dù 404 là hợp lệ.** Fix: bật `neverError`/Continue On Fail và tự kiểm tra `statusCode` bằng IF.

## Best practices

- **Auth qua Credential, không qua header tay** — đặc biệt OAuth2 để n8n tự refresh token.
- **Luôn giả định API có phân trang** cho tới khi chứng minh ngược lại; kiểm tra tổng số bản ghi.
- **Retry có chọn lọc**: chỉ lỗi tạm thời, có backoff, tôn trọng `Retry-After`.
- **Phân loại lỗi HTTP**: "mong đợi được" (rẽ nhánh) vs "bất thường" (đẩy sang error handling ở [Bài 9](../error-handling-production-n8n/)).
- **Đặt timeout tường minh** cho mọi request ra ngoài — đừng để workflow treo vì một service không phản hồi.

## Tổng kết + xem tiếp

- Dùng **Credential** cho authentication (Bearer/API key/Basic/OAuth2); OAuth2 được n8n tự refresh — lý do chính để không tự quản token.
- Bật **Pagination** built-in để lấy đủ dữ liệu; chỉ tự lặp khi API có kiểu phân trang lạ.
- **Retry có chọn lọc** cho lỗi tạm thời + **timeout** tường minh; phân biệt lỗi mong đợi với lỗi bất thường.
- `neverError`/Continue On Fail cho phép rẽ nhánh theo `statusCode` thay vì để mọi lỗi làm workflow đỏ.

**Bài tiếp — [Bài 6: Xử lý dữ liệu — Set, Filter, Merge, Split Out, Aggregate và expression](../xu-ly-du-lieu-expression-n8n/)**: sau khi lấy được dữ liệu từ API, ta biến đổi nó — lọc, gộp, tách, tổng hợp — và nắm cú pháp expression `{{ }}` cùng các hàm built-in hay dùng nhất.

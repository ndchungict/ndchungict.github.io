+++
date        = '2026-07-02T16:00:00+07:00'
draft       = true
title       = 'Bài 17 — AI workflow với n8n: AI Agent, LLM, RAG với vector store'
slug        = 'ai-workflow-n8n-llm-rag'
summary     = 'Xây AI workflow trong n8n: AI Agent node, tích hợp LLM (OpenAI/Anthropic), RAG cơ bản với vector store và khi nào nên dùng n8n cho AI pipeline.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 17
categories  = ['it']
tags        = ['n8n', 'ai-agent', 'rag']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

n8n đã trở thành một trong những chỗ dựng AI workflow nhanh nhất: nó có sẵn nhóm node **AI (dựa trên LangChain)** — AI Agent, Chat Model, Embeddings, Vector Store — nối bằng kéo-thả. Với developer, đây là con dao hai lưỡi: dựng prototype RAG hay agent trong một buổi chiều thì tuyệt, nhưng cũng dễ đẩy n8n vào chỗ nó không nên đứng. Bài này chỉ cách tích hợp LLM và dựng RAG cơ bản trong n8n — và, đúng tinh thần cả series, nói thẳng **khi nào n8n hợp và khi nào không** cho AI pipeline.

## Yêu cầu chuẩn bị

- API key của một nhà cung cấp LLM (OpenAI, Anthropic...) — tạo credential trong n8n ([Bài 10](../credentials-va-bao-mat-n8n/)).
- Hiểu HTTP Request ([Bài 5](../http-request-node-auth-pagination-retry/)) và items ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/)).
- n8n 1.x có nhóm node LangChain. **Tên/typeVersion node AI và tên model thay đổi rất nhanh** — bài này nêu nguyên lý và dùng ví dụ ổn định; hãy đối chiếu node/model khả dụng trong instance của bạn.

## Nhóm node AI trong n8n

n8n gói khả năng LLM thành các node LangChain, kết nối bằng **loại connection đặc biệt** (không phải `main` thông thường):

- **AI Agent** — node điều phối: nhận câu hỏi, gọi model, có thể dùng **tools** (các node khác làm công cụ) và **memory**.
- **Chat Model** (OpenAI/Anthropic/...) — nối vào Agent qua cổng *ai_languageModel*, cung cấp "bộ não" LLM.
- **Embeddings** — biến text thành vector, nối vào Vector Store.
- **Vector Store** (in-memory, Postgres pgvector, Pinecone, Qdrant...) — lưu và truy vấn vector cho RAG.
- **Memory / Tool** — bộ nhớ hội thoại và công cụ cho agent.

Điểm khác biệt developer cần nhớ: các node AI này nối với nhau bằng cổng chuyên biệt (ai_languageModel, ai_embedding, ai_tool, ai_memory...), không phải luồng `main` như các node thường. Trên canvas, bạn "cắm" Chat Model và Vector Store *vào dưới* Agent, thay vì nối tuần tự.

## RAG cơ bản: hai pha

**RAG (Retrieval-Augmented Generation)** = cho LLM trả lời dựa trên tài liệu của bạn, thay vì chỉ kiến thức huấn luyện. Trong n8n, RAG gồm hai workflow/pha:

1. **Ingest (nạp tài liệu)**: đọc nguồn (tài liệu sản phẩm ShopViet, FAQ) → chia nhỏ (chunk) → **Embeddings** → ghi vector vào **Vector Store**. Chạy một lần hoặc định kỳ khi tài liệu đổi.
2. **Query (trả lời)**: nhận câu hỏi → embed câu hỏi → truy vấn Vector Store lấy chunk liên quan → nhồi vào prompt cho LLM → trả câu trả lời có dẫn nguồn.

Với ShopViet, ứng dụng điển hình: chatbot hỗ trợ trả lời về chính sách đổi trả, tình trạng đơn, thông tin sản phẩm — dựa trên tài liệu nội bộ chứ không bịa.

## Khi nào nên — và không nên — dùng n8n cho AI

Đây là phần quan trọng, đúng tinh thần [Bài 1](../n8n-la-gi-goc-nhin-developer/):

**Nên dùng n8n khi:**

- Prototype nhanh một AI feature, hoặc **glue** LLM vào automation sẵn có (đơn hàng đến → LLM phân loại → định tuyến).
- AI là **một bước** trong workflow nghiệp vụ lớn hơn (tóm tắt ticket, trích xuất dữ liệu, phân loại).
- Cần kết nối LLM với nhiều hệ thống (DB, API, Slack) mà n8n vốn mạnh.

**Không nên dùng n8n khi:**

- Bạn xây một **sản phẩm AI lõi** với logic agent phức tạp, cần kiểm soát chi tiết prompt/retry/streaming, test tự động, tối ưu chi phí token — lúc đó viết bằng SDK (LangChain/LlamaIndex trong code) trong repo của bạn dễ kiểm soát hơn.
- Cần **throughput cực cao** hoặc **streaming token** tới client theo cách tùy biến sâu.
- RAG ở quy mô lớn với pipeline ingest phức tạp — cân nhắc hạ tầng chuyên dụng.

Nói gọn: **n8n tuyệt để "gắn AI vào quy trình", không phải để làm nền cho một sản phẩm AI nghiêm túc.** Ranh giới y hệt như với automation thường.

## Ví dụ thực hành: phân loại đơn hàng bằng LLM (HTTP Request)

Để ví dụ **import được và ổn định qua các phiên bản**, workflow dưới gọi LLM qua **HTTP Request** (không phụ thuộc typeVersion của node AI) — nhận một ghi chú đơn hàng, yêu cầu LLM phân loại mức ưu tiên. Bạn thay URL/credential theo nhà cung cấp của mình. Đây là pattern "AI như một bước trong workflow":

```json
{
  "name": "ShopViet - Phan loai don bang LLM",
  "nodes": [
    {
      "parameters": {},
      "id": "bf000000-0000-4000-9000-000000000001",
      "name": "When clicking Test workflow",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "jsCode": "return [{ json: { orderId: 'SV-8001', note: 'Khach phan nan giao tre 3 ngay, doi hoan tien gap' } }];"
      },
      "id": "bf000000-0000-4000-9000-000000000002",
      "name": "Don co ghi chu",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [220, 0]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.your-llm-provider.example/v1/chat/completions",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ {\n  \"model\": \"REPLACE_WITH_MODEL\",\n  \"messages\": [\n    { \"role\": \"system\", \"content\": \"Ban phan loai muc uu tien xu ly don hang thanh: cao, trung binh, thap. Chi tra ve 1 tu.\" },\n    { \"role\": \"user\", \"content\": $json.note }\n  ]\n} }}",
        "options": {}
      },
      "id": "bf000000-0000-4000-9000-000000000003",
      "name": "Goi LLM phan loai",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [440, 0],
      "credentials": {
        "httpHeaderAuth": { "id": "REPLACE_WITH_CREDENTIAL_ID", "name": "LLM API - prod" }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            { "id": "p1", "name": "orderId", "value": "={{ $('Don co ghi chu').item.json.orderId }}", "type": "string" },
            { "id": "p2", "name": "priority", "value": "={{ $json.choices ? $json.choices[0].message.content : 'unknown' }}", "type": "string" }
          ]
        },
        "options": {}
      },
      "id": "bf000000-0000-4000-9000-000000000004",
      "name": "Gan muc uu tien",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [660, 0]
    }
  ],
  "connections": {
    "When clicking Test workflow": {
      "main": [[{ "node": "Don co ghi chu", "type": "main", "index": 0 }]]
    },
    "Don co ghi chu": {
      "main": [[{ "node": "Goi LLM phan loai", "type": "main", "index": 0 }]]
    },
    "Goi LLM phan loai": {
      "main": [[{ "node": "Gan muc uu tien", "type": "main", "index": 0 }]]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Thay `url`, `model`, và credential theo nhà cung cấp bạn dùng (đường dẫn field trong response cũng chỉnh theo API cụ thể). Khi làm thật với **AI Agent + Vector Store node** cho RAG, canvas sẽ có Chat Model và Vector Store cắm vào Agent qua các cổng ai_*; do các node đó phụ thuộc phiên bản mạnh, tôi khuyên dựng trực tiếp trong editor bằng cách kéo node và để n8n tự nối cổng, thay vì chép JSON. Về chọn model: **dùng model mới và phù hợp của nhà cung cấp tại thời điểm bạn triển khai** — đừng ghim cứng một tên model cũ trong tài liệu vì nó lỗi thời nhanh.

## Lỗi thường gặp và cách xử lý

1. **Nối node AI bằng cổng `main`.** Triệu chứng: Agent không nhận model/vector store. Fix: cắm Chat Model/Vector Store vào cổng ai_* của Agent, không nối tuần tự.
2. **RAG trả lời bịa (hallucinate).** Nguyên nhân: chunk không liên quan hoặc prompt không ràng buộc "chỉ dựa vào ngữ cảnh". Fix: cải thiện chunking/embedding, thêm chỉ dẫn "nếu không có trong tài liệu thì nói không biết", trả kèm nguồn.
3. **Chi phí token tăng vọt.** Nguyên nhân: nhồi quá nhiều context mỗi request, chạy trên vòng lặp lớn. Fix: giới hạn số chunk, cache, cân nhắc batch; đo chi phí trước khi scale.
4. **Bí mật API key lộ.** Fix: credential, không hard-code ([Bài 10](../credentials-va-bao-mat-n8n/)).
5. **Ép n8n làm sản phẩm AI lõi.** Triệu chứng: workflow AI khổng lồ khó test/tối ưu. Fix: chuyển phần lõi sang code/SDK, để n8n điều phối.

## Best practices

- **AI là một bước trong workflow**, không phải toàn bộ sản phẩm — giữ đúng vai trò của n8n.
- **RAG phải có nguồn**: ràng buộc model trả lời dựa trên ngữ cảnh, trả kèm trích dẫn để kiểm chứng.
- **Kiểm soát chi phí token**: giới hạn context, cache, đo trước khi scale.
- **Credential cho API key**; chọn model mới phù hợp, đừng ghim cứng tên model cũ.
- **Prototype ở n8n, sản phẩm lõi ở code** — biết khi nào "tốt nghiệp" khỏi n8n.

## Tổng kết + xem tiếp

- n8n có nhóm node **AI (LangChain)** — Agent, Chat Model, Embeddings, Vector Store — nối bằng cổng ai_* chuyên biệt.
- **RAG** gồm pha ingest (embed → vector store) và pha query (retrieve → prompt → trả lời có nguồn).
- n8n tuyệt để **gắn AI vào quy trình** và prototype; sản phẩm AI lõi phức tạp nên viết bằng code/SDK.
- Chọn model mới của nhà cung cấp tại thời điểm triển khai; kiểm soát chi phí và bảo mật key.

**Bài tiếp — [Bài 18: Case study tổng hợp — hệ thống automation xử lý đơn hàng ShopViet](../case-study-automation-shopviet/)**: bài khép series — ghép mọi thứ đã học (webhook có HMAC/idempotency, database, error handling, queue mode, alert, và một bước AI phân loại) thành một hệ thống xử lý đơn hàng hoàn chỉnh cho ShopViet.

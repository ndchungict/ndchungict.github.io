+++
date        = '2026-07-02T15:30:00+07:00'
draft       = false
title       = 'Bài 16 — n8n API và quản lý workflow bằng code: export/import, Git, CI/CD'
slug        = 'n8n-api-versioning-cicd-workflow'
summary     = 'Quản lý workflow như code: n8n API, export/import workflow JSON, versioning bằng Git, CI/CD cho workflow và tách môi trường dev/staging/prod.'
thumbnail   = '/images/series-n8n/16-n8n-api-workflow-as-code.webp'
featured    = false
weight      = 16
columns     = 2
categories  = ['it']
subcategories = ['workflow', 'automation', 'ai']
tags        = ['n8n', 'ci-cd', 'versioning']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Từ [Bài 1](../n8n-la-gi-goc-nhin-developer/) tôi đã nhấn: workflow là JSON, nên nó **versioning được**. Giờ ta hiện thực hóa điều đó thành quy trình thật. Trong production, "sửa trực tiếp trên UI production" là công thức của thảm họa: không rollback được, không review, không biết ai đổi gì. Developer đã có sẵn bộ công cụ để làm tốt hơn — Git, CI/CD, tách môi trường — và n8n có **REST API** để đưa workflow vào quy trình đó. Bài này biến workflow từ "thứ nằm trong UI" thành **artifact được version và deploy như code**.

## Yêu cầu chuẩn bị

- Đã hiểu workflow là JSON và credential tách rời ([Bài 10](../credentials-va-bao-mat-n8n/)).
- Git + CI/CD cơ bản (GitHub Actions dùng ở ví dụ).
- Có ít nhất hai instance/môi trường (hoặc chuẩn bị tách) để làm dev/staging/prod.
- n8n 1.x. Public API cần bật và tạo API key (kiểm tra theo phiên bản/bản license).

## n8n Public API

n8n cung cấp **REST API** để thao tác workflow, credential (giới hạn), execution bằng code. Tạo API key trong *Settings → n8n API* (khả dụng tùy phiên bản/bản license — kiểm tra với instance của bạn). Vài endpoint chính:

```bash
# Liet ke workflow
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
  https://n8n.shopviet.vn/api/v1/workflows

# Lay 1 workflow (JSON day du)
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
  https://n8n.shopviet.vn/api/v1/workflows/123

# Tao/cap nhat workflow tu file JSON
curl -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H 'Content-Type: application/json' \
  --data @order-webhook.json \
  https://n8n.shopviet.vn/api/v1/workflows
```

Ngoài API, còn hai đường export/import: **UI** (Download/Import) và **CLI** (`n8n export:workflow` / `n8n import:workflow` chạy trong container self-host) — CLI tiện cho script hàng loạt.

## Versioning workflow bằng Git

Ý tưởng: **JSON workflow là source of truth, nằm trong Git repo**, không phải trong UI production. Quy trình:

1. Dev sửa workflow trên instance **dev**, export JSON.
2. Commit JSON vào repo (mỗi workflow một file), tạo Pull Request.
3. Review diff JSON như review code — thấy rõ node nào thêm/đổi.
4. Merge → CI/CD deploy JSON lên staging rồi prod.

Vài lưu ý để diff sạch:

- **Chuẩn hóa export**: workflow JSON chứa ID, có thể chứa metadata thay đổi mỗi lần export. Cân nhắc một bước "normalize" (bỏ trường biến động) trước khi commit để diff không nhiễu.
- **Credential không nằm trong JSON** ([Bài 10](../credentials-va-bao-mat-n8n/)) — chỉ có ID/tên tham chiếu. Mỗi môi trường tạo credential riêng cùng tên; deploy chỉ mang workflow, không mang secret.
- **Đừng commit secret**: rà JSON trước khi push (đã nhấn ở [Bài 10](../credentials-va-bao-mat-n8n/)).

> n8n bản Enterprise có tính năng **Git-based Source Control / Environments** tích hợp sẵn. Trên **Community**, bạn tự dựng quy trình bằng API/CLI + Git như bài này — mất công hơn nhưng làm được và miễn phí. Biết ranh giới này để chọn đúng.

## Tách môi trường dev / staging / prod

Nguyên tắc như mọi hệ thống phần mềm:

- **Dev**: nơi sửa và thử, dữ liệu giả, credential trỏ sandbox.
- **Staging**: giống prod nhất có thể, test trước khi lên.
- **Prod**: chỉ nhận thay đổi qua pipeline, **không sửa tay**.

Điểm đặc thù n8n: vì credential tách rời, cùng một workflow JSON chạy ở ba môi trường chỉ khác **credential được gán** (ShopViet API sandbox vs prod). Đặt tên credential nhất quán giữa các môi trường (`ShopViet API - <env>`) để mapping trơn tru. Biến môi trường (`$env`) giúp workflow đọc cấu hình khác nhau theo môi trường mà không sửa JSON.

## Ví dụ thực hành: pipeline GitHub Actions deploy workflow

Repo chứa các file JSON workflow trong `workflows/`. Khi merge vào `main`, Actions gọi n8n API của môi trường tương ứng để cập nhật. Đây là pipeline tối giản deploy lên prod:

```yaml
# .github/workflows/deploy-n8n.yml
name: Deploy n8n workflows

on:
  push:
    branches: [main]
    paths: ['workflows/**.json']

jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy tung workflow len n8n prod
        env:
          N8N_URL: ${{ secrets.N8N_PROD_URL }}
          N8N_API_KEY: ${{ secrets.N8N_PROD_API_KEY }}
        run: |
          set -euo pipefail
          for f in workflows/*.json; do
            echo "Deploying $f"
            # workflowId de biet target (doc tu file, KHONG gui trong body)
            WF_ID=$(jq -r '.id // empty' "$f")
            # NORMALIZE: chi giu field Public API chap nhan.
            # Bo id/active/tags/createdAt/updatedAt... de tranh loi 400 va diff sach.
            BODY=$(jq '{name, nodes, connections, settings}' "$f")
            if [ -n "$WF_ID" ]; then
              # Cap nhat workflow da ton tai
              curl -sf -X PUT \
                -H "X-N8N-API-KEY: $N8N_API_KEY" \
                -H 'Content-Type: application/json' \
                --data "$BODY" \
                "$N8N_URL/api/v1/workflows/$WF_ID" > /dev/null
              # PUT khong tu bat workflow -> kich hoat qua endpoint rieng
              curl -sf -X POST \
                -H "X-N8N-API-KEY: $N8N_API_KEY" \
                "$N8N_URL/api/v1/workflows/$WF_ID/activate" > /dev/null
            else
              # Tao moi
              curl -sf -X POST \
                -H "X-N8N-API-KEY: $N8N_API_KEY" \
                -H 'Content-Type: application/json' \
                --data "$BODY" \
                "$N8N_URL/api/v1/workflows" > /dev/null
            fi
          done
          echo "Done."
```

Script đã kèm bước **normalize** (`jq '{name, nodes, connections, settings}'`) — vừa tránh lỗi 400 do gửi field read-only, vừa làm diff Git sạch. Để production-hardened hơn, thêm: **deploy staging trước rồi mới prod** (thêm job/environment), và **smoke test** (gọi thử một webhook) sau deploy. Payload chính xác mà API `POST/PUT /workflows` chấp nhận **khác nhau giữa các phiên bản** n8n (một số bản còn không nhận cả `settings`, hoặc yêu cầu field khác) — kiểm tra tài liệu API bản bạn dùng và điều chỉnh danh sách field trong `jq` cho khớp.

## Lỗi thường gặp và cách xử lý

1. **Sửa tay trên prod.** Triệu chứng: mất thay đổi khi deploy sau, không rollback được. Fix: prod chỉ nhận qua pipeline; khóa việc sửa tay bằng quy trình/đội.
2. **Commit secret trong JSON.** Fix: rà trước khi push; secret luôn qua credential ([Bài 10](../credentials-va-bao-mat-n8n/)).
3. **Diff JSON nhiễu.** Nguyên nhân: trường biến động mỗi lần export. Fix: bước normalize trước commit.
4. **Credential thiếu ở môi trường đích.** Triệu chứng: deploy xong workflow đỏ vì không có credential. Fix: tạo sẵn credential cùng tên ở mỗi môi trường.
5. **Payload API sai theo phiên bản.** Triệu chứng: API trả 400. Fix: đối chiếu schema API của bản đang chạy; điều chỉnh field gửi lên.

## Best practices

- **JSON trong Git là source of truth**; UI prod chỉ là nơi *chạy*, không phải nơi *sửa*.
- **Deploy qua pipeline**, staging trước prod, có smoke test sau deploy.
- **Credential cùng tên theo môi trường**; dùng `$env` cho cấu hình khác nhau.
- **Normalize + rà secret** trước khi commit để diff sạch và an toàn.
- **Biết ranh giới**: Source Control/Environments tích hợp là Enterprise; Community tự dựng bằng API/CLI + Git.

## Tổng kết + xem tiếp

- **n8n Public API/CLI** cho phép export/import workflow bằng code — nền của "workflow as code".
- **Git là source of truth**; review diff JSON, deploy qua CI/CD, prod không sửa tay.
- Tách **dev/staging/prod**; workflow giống nhau, khác ở **credential được gán** theo môi trường.
- Source Control tích hợp là Enterprise; trên Community tự dựng quy trình — miễn phí, làm được.

**Bài tiếp — [Bài 17: AI workflow với n8n — AI Agent, LLM, RAG với vector store](../ai-workflow-n8n-llm-rag/)**: ta bước vào phần AI — dùng AI Agent node, tích hợp LLM (OpenAI/Anthropic), dựng RAG cơ bản với vector store, và bàn thẳng khi nào n8n hợp (và không hợp) cho AI pipeline.

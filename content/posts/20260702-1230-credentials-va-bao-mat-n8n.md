+++
date        = '2026-07-02T12:30:00+07:00'
draft       = true
title       = 'Bài 10 — Credentials và bảo mật: mã hóa, quản lý secrets, phân quyền'
slug        = 'credentials-va-bao-mat-n8n'
summary     = 'Cách n8n mã hóa và lưu credentials, quản lý secrets, phân quyền, và best practice khi export/chia sẻ workflow mà không lộ bí mật.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 10
categories  = ['it']
tags        = ['n8n', 'security', 'credentials']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Ở [Bài 9](../error-handling-production-n8n/), alert Slack vẫn hard-code URL webhook thẳng trong node — tiện lúc demo, nhưng là thói quen nguy hiểm: export workflow ra là lộ bí mật. n8n xử lý việc này bằng **credentials** — một hệ thống lưu và mã hóa bí mật tách khỏi workflow. Với developer, hiểu đúng cơ chế này quan trọng không kém viết logic: nó quyết định bạn có thể chia sẻ, version, và vận hành workflow an toàn hay không. Bài này đi vào cách n8n mã hóa credentials, quản lý secrets, phân quyền, và những ranh giới bảo mật khi self-host cho một team.

## Yêu cầu chuẩn bị

- Đã cấu hình `N8N_ENCRYPTION_KEY` ([Bài 2](../cai-dat-n8n-docker-compose/)) — bài này giải thích vì sao nó quan trọng đến vậy.
- Hiểu workflow là JSON export được ([Bài 1](../n8n-la-gi-goc-nhin-developer/)).
- n8n 1.x.

## Credentials hoạt động thế nào

Trong n8n, **credential** là một bản ghi chứa bí mật (token, mật khẩu, key) cho một loại kết nối (HTTP Header Auth, Postgres, Slack...). Điểm mấu chốt về mặt kỹ thuật:

- Credential được **mã hóa** bằng `N8N_ENCRYPTION_KEY` rồi lưu trong database. Trong DB nó là chuỗi mã hóa, không phải plaintext.
- Workflow **không chứa** giá trị bí mật — nó chỉ tham chiếu credential theo **ID**. Vì thế khi export workflow JSON, bí mật không đi kèm (chỉ còn tham chiếu).
- Khi execution chạy, n8n giải mã credential trong bộ nhớ để dùng, rồi node gọi đi.

Đây là lý do bạn phải **luôn dùng credential thay vì nhét token vào node**: vừa được mã hóa, vừa tách khỏi workflow khi chia sẻ/versioning ([Bài 16](../n8n-api-versioning-cicd-workflow/)).

Và đây cũng là lý do `N8N_ENCRYPTION_KEY` là secret hạng nhất: **mất key = mọi credential trong DB thành rác không giải mã được** (đã cảnh báo ở [Bài 2](../cai-dat-n8n-docker-compose/)). Backup DB mà quên key thì credential coi như mất.

## Tạo và dùng credential

Tạo qua *Settings → Credentials → Add credential*, chọn loại (vd *Header Auth*), nhập giá trị, đặt tên rõ ràng (`ShopViet API - prod`, `Slack alert - ops`). Trong node, chọn credential đó ở phần Authentication. Một credential dùng được cho nhiều node/workflow — xoay vòng key chỉ cần sửa một chỗ.

> Kinh nghiệm: đặt tên credential kèm môi trường (`- prod`, `- staging`). Khi có cả dev/staging/prod ([Bài 16](../n8n-api-versioning-cicd-workflow/)), tên rõ tránh việc vô tình chạy workflow staging bằng credential production.

## Quản lý secrets: env, external secrets, và ranh giới bản

Có mấy cách đưa bí mật vào n8n:

1. **Credential trong UI** (mã hóa trong DB) — mặc định, đủ cho hầu hết trường hợp.
2. **Biến môi trường** — với self-host, bạn có thể tham chiếu env trong một số ngữ cảnh; hữu ích cho cấu hình khác nhau theo môi trường. Lưu ý phạm vi cho phép truy cập env trong expression bị giới hạn vì lý do bảo mật.
3. **External Secrets** (Vault, AWS/GCP Secrets Manager) — n8n tích hợp secret manager ngoài. **Đây là tính năng Enterprise**; bản Community self-hosted miễn phí không có. Nếu bạn cần nguồn secret tập trung, hãy biết trước ranh giới này để không thiết kế phụ thuộc vào nó rồi mới phát hiện phải trả tiền.

Với ShopViet trên Community Edition, tôi dùng credential UI (mã hóa) + `N8N_ENCRYPTION_KEY` được cấp qua secret manager của hạ tầng (Docker secret / biến CI). Đó là mức an toàn hợp lý mà không cần Enterprise.

## Phân quyền: ai làm được gì

Về phân quyền, cần phân biệt rõ giữa các bản:

- **Community Edition (self-host miễn phí)**: mô hình người dùng cơ bản. Không có RBAC chi tiết, không có project/phân quyền theo tài nguyên nâng cao.
- **Enterprise/Cloud (trả phí)**: RBAC, projects, chia sẻ credential/workflow theo vai trò, SSO, audit log nâng cao.

Nói thẳng: nếu bạn cần **phân quyền chi tiết cho nhiều team** trên cùng một instance, đó là bài toán của bản trả phí. Trên Community, cách thực tế để cô lập là **tách instance** theo team/môi trường, hoặc kiểm soát chặt ai có quyền truy cập instance. Đừng giả định Community có RBAC như Enterprise — hãy kiểm tra với phiên bản bạn đang chạy.

## Bảo mật khi export/chia sẻ workflow

Vì workflow là JSON và thường được commit vào Git ([Bài 16](../n8n-api-versioning-cicd-workflow/)):

- **Export không kèm bí mật** — workflow chỉ tham chiếu credential ID, nên JSON an toàn để commit. Nhưng **hãy kiểm tra**: nếu bạn lỡ hard-code token vào một node (URL, header, Code node), nó **sẽ** nằm trong JSON. Rà soát trước khi commit.
- **Đừng commit `.env`** chứa `N8N_ENCRYPTION_KEY` hay mật khẩu DB — dùng `.env.example` ([Bài 2](../cai-dat-n8n-docker-compose/)).
- Khi chia sẻ workflow cho người khác import, họ phải **tự tạo lại credential** cùng tên/ID mapping — bí mật của bạn không đi theo.

## Ví dụ thực hành: refactor alert Slack sang credential

Ta sửa lỗi hard-code ở [Bài 9](../error-handling-production-n8n/): tạo credential *Header Auth* cho Slack (hoặc dùng node Slack chuyên biệt), và node HTTP Request tham chiếu credential thay vì nhúng URL bí mật. Workflow export ra sẽ không còn chứa secret:

```json
{
  "name": "ShopViet - Alert dung credential",
  "nodes": [
    {
      "parameters": {},
      "id": "ba000000-0000-4000-9000-000000000001",
      "name": "When clicking Test workflow",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={{ $env.SLACK_WEBHOOK_PATH ? 'https://hooks.slack.com/services' + $env.SLACK_WEBHOOK_PATH : 'https://hooks.slack.com/services/PLACEHOLDER' }}",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ { \"text\": \"ShopViet: test alert dung credential\" } }}",
        "options": {}
      },
      "id": "ba000000-0000-4000-9000-000000000002",
      "name": "Gui Slack (co credential)",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [240, 0],
      "credentials": {
        "httpHeaderAuth": {
          "id": "REPLACE_WITH_CREDENTIAL_ID",
          "name": "Slack alert - ops"
        }
      }
    }
  ],
  "connections": {
    "When clicking Test workflow": {
      "main": [[{ "node": "Gui Slack (co credential)", "type": "main", "index": 0 }]]
    }
  },
  "settings": {},
  "pinData": {}
}
```

Chú ý khối `credentials` chỉ chứa **ID + tên**, không có giá trị bí mật — đó chính là điều làm JSON này an toàn để commit. Khi import, bạn tạo credential *Header Auth* tên `Slack alert - ops` rồi gán lại vào node. (Thực tế, dùng **node Slack** chuyên biệt với credential OAuth/token sẽ sạch hơn là HTTP Request thô; ví dụ trên minh họa cơ chế tham chiếu credential.)

## Lỗi thường gặp và cách xử lý

1. **Hard-code token/secret vào node.** Triệu chứng: lộ khi export/commit. Fix: luôn dùng credential; rà soát JSON trước khi commit.
2. **Mất `N8N_ENCRYPTION_KEY`.** Triệu chứng: sau restore, toàn bộ credential lỗi giải mã. Fix: backup key cùng DB, cất trong secret manager ([Bài 2](../cai-dat-n8n-docker-compose/)).
3. **Giả định Community có RBAC/External Secrets.** Triệu chứng: thiết kế xong mới biết cần Enterprise. Fix: kiểm tra tính năng theo bản trước khi phụ thuộc; Community thì cô lập bằng cách tách instance.
4. **Commit `.env` chứa bí mật.** Fix: `.gitignore` + `.env.example`; nếu lỡ commit, xoay vòng ngay toàn bộ secret đã lộ.
5. **Dùng chung một credential prod cho cả staging.** Triệu chứng: workflow test bắn vào hệ thống thật. Fix: tách credential theo môi trường, đặt tên rõ.

## Best practices

- **Không bao giờ hard-code bí mật** — credential cho mọi thứ, kể cả URL webhook có chứa token.
- **Bảo vệ `N8N_ENCRYPTION_KEY` như secret quan trọng nhất**; backup cùng DB.
- **Đặt tên credential kèm môi trường**; tách credential prod/staging/dev.
- **Rà soát workflow JSON trước khi commit** để chắc không lọt secret.
- **Biết ranh giới Community vs Enterprise** (RBAC, External Secrets) và thiết kế trong khả năng bản đang dùng.

## Tổng kết + xem tiếp

- Credential được **mã hóa bằng `N8N_ENCRYPTION_KEY`** và lưu trong DB; workflow chỉ tham chiếu **ID**, nên export không kèm bí mật.
- Quản lý secret: credential UI (mặc định), env (giới hạn), **External Secrets là Enterprise**.
- Phân quyền chi tiết (RBAC/projects) thuộc **bản trả phí**; Community cô lập bằng cách tách instance.
- Luôn dùng credential, bảo vệ encryption key, và rà JSON trước khi commit.

**Bài tiếp — [Bài 11: Webhook nâng cao — response mode, HMAC signature, payload lớn, idempotency](../webhook-nang-cao-hmac-idempotency/)**: quay lại webhook ([Bài 4](../workflow-dau-tien-webhook-rest-api/)) ở mức production — xác thực nguồn gọi bằng HMAC, xử lý payload lớn, và đảm bảo idempotency để retry ([Bài 9](../error-handling-production-n8n/)) không gây xử lý trùng.

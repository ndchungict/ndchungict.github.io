+++
date        = '2026-07-02T15:00:00+07:00'
draft       = false
title       = 'Bài 15 — Xây custom node bằng TypeScript: declarative vs programmatic, publish npm'
slug        = 'xay-custom-node-n8n-typescript'
summary     = 'Viết n8n community node bằng TypeScript: cấu trúc project, so sánh declarative vs programmatic style và publish node lên npm.'
thumbnail   = '/images/series-n8n/15-custom-node-typescript.webp'
featured    = false
weight      = 15
categories  = ['it']
subcategories = ['workflow', 'automation', 'ai']
tags        = ['n8n', 'custom-node', 'typescript']
series      = ['n8n-tu-co-ban-den-chuyen-sau']
authors     = ['Nguyen Chung']
+++

Code node ([Bài 7](../code-node-chuyen-sau-n8n/)) giải quyết logic tùy biến trong một workflow, nhưng khi bạn cần **cùng một tích hợp dùng lại ở nhiều workflow, nhiều team** — ví dụ node "ShopViet API" gói sẵn auth và các thao tác đơn hàng — thì viết một **custom node** đúng nghĩa mới sạch. Node là một package TypeScript, cài vào n8n, hiện trong danh sách node như node chính hãng. Bài này đi qua cấu trúc một community node, hai style viết (declarative vs programmatic), và cách publish lên npm để cả cộng đồng (hoặc nội bộ) cài được.

## Yêu cầu chuẩn bị

- TypeScript ở mức viết được class/interface.
- Node.js + npm, hiểu cách một package npm hoạt động.
- Đã hiểu items và credential ([Bài 3](../khai-niem-cot-loi-n8n-workflow-node-item/), [Bài 10](../credentials-va-bao-mat-n8n/)).
- n8n 1.x. API xây node ổn định nhưng có tiến hóa — dùng bộ khởi tạo chính thức và đối chiếu tài liệu bản bạn nhắm tới.

## Khởi tạo project

n8n có template chính thức để tạo node (`n8n-nodes-starter`). Cấu trúc một node package điển hình:

```text
n8n-nodes-shopviet/
├── credentials/
│   └── ShopVietApi.credentials.ts   # dinh nghia credential
├── nodes/
│   └── ShopViet/
│       ├── ShopViet.node.ts         # dinh nghia node
│       └── shopViet.svg             # icon
├── package.json                     # khai bao n8n.nodes / n8n.credentials
├── tsconfig.json
└── index.ts
```

Phần quan trọng trong `package.json` là khối `n8n` khai báo đường dẫn tới file node/credential đã build:

```json
{
  "name": "n8n-nodes-shopviet",
  "version": "0.1.0",
  "keywords": ["n8n-community-node-package"],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": ["dist/credentials/ShopVietApi.credentials.js"],
    "nodes": ["dist/nodes/ShopViet/ShopViet.node.js"]
  }
}
```

Keyword `n8n-community-node-package` là thứ giúp node được nhận diện trong hệ sinh thái community.

## Declarative vs programmatic — chọn style nào

n8n hỗ trợ hai cách viết node:

- **Declarative** (khuyên cho REST API): bạn **mô tả** request bằng cấu hình (`routing`) — endpoint, method, mapping tham số — n8n tự lo việc gọi. Ít code, ít bug, hợp với đại đa số node tích hợp API. Đây là lựa chọn mặc định của tôi cho node kiểu "gọi API X".
- **Programmatic**: bạn viết hàm `execute()` tự xử lý items và tự gọi. Linh hoạt tối đa — cần khi logic phức tạp (nhiều bước, xử lý binary, phân trang tùy biến) mà declarative không diễn đạt nổi.

Quy tắc: **REST API thuần → declarative; logic phức tạp → programmatic.** Đừng chọn programmatic chỉ vì quen viết code — declarative ít lỗi hơn nhiều cho các node API.

## Credential cho node

Định nghĩa credential riêng để node dùng auth an toàn ([Bài 10](../credentials-va-bao-mat-n8n/)):

```typescript
// credentials/ShopVietApi.credentials.ts
import {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ShopVietApi implements ICredentialType {
  name = 'shopVietApi';
  displayName = 'ShopViet API';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true }, // an di trong UI
      default: '',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.shopviet.vn',
    },
  ];

  // Tu gan API key vao header cho MOI request cua node dung credential nay
  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{ $credentials.apiKey }}',
      },
    },
  };
}
```

## Ví dụ thực hành: node ShopViet style declarative

Node dưới đây có một resource `order` với operation `get` — lấy đơn theo `orderId`, tự gắn API key từ credential. Toàn bộ request được **mô tả** qua `routing`, không cần viết `execute()`:

```typescript
// nodes/ShopViet/ShopViet.node.ts
import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class ShopViet implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'ShopViet',
    name: 'shopViet',
    icon: 'file:shopViet.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
    description: 'Tuong tac voi API don hang ShopViet',
    defaults: { name: 'ShopViet' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'shopVietApi', required: true }],
    // Base URL + header auth ap dung cho moi request
    requestDefaults: {
      baseURL: '={{ $credentials.baseUrl }}',
      headers: { 'Content-Type': 'application/json' },
    },
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [{ name: 'Order', value: 'order' }],
        default: 'order',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['order'] } },
        options: [
          {
            name: 'Get',
            value: 'get',
            action: 'Lay mot don hang',
            // Declarative: mo ta request, n8n tu goi
            routing: {
              request: {
                method: 'GET',
                url: '=/orders/{{ $parameter["orderId"] }}',
              },
            },
          },
        ],
        default: 'get',
      },
      {
        displayName: 'Order ID',
        name: 'orderId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['order'], operation: ['get'] } },
        default: '',
      },
    ],
  };
}
```

API key được gắn vào header tự động nhờ khối `authenticate` đã khai báo trong credential ở trên (`Authorization: Bearer <apiKey>`) — mọi request của node dùng credential này đều được ký, không cần lặp lại trong node. Ưu điểm declarative thấy rõ: **không có vòng lặp items, không có `execute()`** — n8n lo phần thực thi, bạn chỉ mô tả "gọi gì, ở đâu".

Nếu cần logic phức tạp (gộp nhiều call, xử lý binary), chuyển sang programmatic bằng cách thêm hàm `execute()` tự duyệt `this.getInputData()` và gọi `this.helpers.httpRequestWithAuthentication(...)`.

## Test cục bộ và publish npm

Quy trình phát triển:

1. **Build**: `npm run build` (biên dịch TS → `dist/`).
2. **Link cục bộ**: `npm link` rồi trong thư mục custom của n8n `npm link n8n-nodes-shopviet`, khởi động lại n8n để thấy node. (Cách nạp node custom self-host qua `N8N_CUSTOM_EXTENSIONS` cũng dùng được.)
3. **Test** trong editor: kéo node ra, tạo credential, chạy thử.
4. **Publish**: `npm publish` (public) để cộng đồng cài, hoặc publish lên **npm registry nội bộ** cho dùng riêng ShopViet.
5. Người dùng cài node community qua *Settings → Community Nodes → Install* (self-host), nhập tên package.

> Lưu ý: cài community node từ nguồn ngoài là đưa **code bên thứ ba** vào instance của bạn — cân nhắc bảo mật ([Bài 10](../credentials-va-bao-mat-n8n/)), đặc biệt trên hệ nhiều người dùng. Với nội bộ, registry riêng + review code là cách an toàn.

## Lỗi thường gặp và cách xử lý

1. **Node không hiện sau khi cài.** Nguyên nhân: sai đường dẫn trong khối `n8n` của `package.json`, hoặc quên build. Fix: kiểm tra `dist/` tồn tại và path trỏ đúng file `.js`.
2. **Chọn programmatic cho việc declarative làm được.** Triệu chứng: code dài, nhiều bug. Fix: REST API thuần thì dùng declarative `routing`.
3. **Hard-code secret trong node.** Fix: luôn qua credential type ([Bài 10](../credentials-va-bao-mat-n8n/)).
4. **Lệch version API node** giữa n8n và package. Fix: khai báo `n8nNodesApiVersion` đúng, đối chiếu tài liệu phiên bản.
5. **Quên `displayOptions`** khiến tham số hiện sai ngữ cảnh. Fix: dùng `show/hide` theo resource/operation để UI gọn.

## Best practices

- **Dùng template chính thức** để đúng cấu trúc ngay từ đầu.
- **Declarative làm mặc định** cho node API; programmatic chỉ khi thật cần.
- **Credential riêng, secret ẩn** (`typeOptions.password`); không hard-code.
- **Versioning package rõ ràng** (semver) và review khi cập nhật.
- **Cẩn trọng bảo mật community node**; nội bộ thì dùng registry riêng + review.

## Tổng kết + xem tiếp

- Custom node là **package TypeScript** khai báo trong khối `n8n` của `package.json`; gồm node + credential.
- **Declarative** (mô tả request qua `routing`) cho REST API; **programmatic** (`execute()`) cho logic phức tạp.
- Test bằng `npm link`/`N8N_CUSTOM_EXTENSIONS`, publish qua npm public hoặc registry nội bộ.
- Cài community node là đưa code bên thứ ba vào hệ — cân nhắc bảo mật.

**Bài tiếp — [Bài 16: n8n API và quản lý workflow bằng code — export/import, Git, CI/CD](../n8n-api-versioning-cicd-workflow/)**: ta khép vòng "workflow as code" đã nhắc từ [Bài 1](../n8n-la-gi-goc-nhin-developer/) — dùng n8n API để export/import, versioning bằng Git, dựng CI/CD cho workflow và tách môi trường dev/staging/prod.

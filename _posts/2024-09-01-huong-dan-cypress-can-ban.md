---
layout: post
title:  "Hướng dẫn cypress căn bản"
summary: "Cypress là một công cụ kiểm thử end-to-end mạnh mẽ giúp bạn viết và thực thi các bài kiểm thử cho ứng dụng web của mình. Trong hướng dẫn này, bạn sẽ học cách cài đặt và sử dụng Cypress."
author: chungnd
date: '2024-09-01 13:35:23 +0700'
category: ['develop','automation','cypress','guides']
thumbnail: /assets/img/posts/cypress-ui-specs.png
keywords: cypress,tutorial,automation,test,javascript
permalink: /huong-dan-cypress-can-ban/
usemathjax: true
---


# Hướng Dẫn Sử Dụng Cypress

Cypress là một công cụ kiểm thử end-to-end mạnh mẽ giúp bạn viết và thực thi các bài kiểm thử cho ứng dụng web của mình. Trong hướng dẫn này, bạn sẽ học cách cài đặt và sử dụng Cypress.

## I. Cài đặt

### 1. Cài Đặt Node.js
Cypress yêu cầu Node.js. Bạn có thể tải và cài đặt Node.js từ website chính thức [nodejs.org](https://nodejs.org/)

### 2. Tạo hoặc Mở Dự Án
Nếu bạn chưa có project Node.js, hãy tạo một thư mục mới sau đó khởi tạo project:
```bash
mkdir my-cypress-project
cd my-cypress-project
npm init -y
```
Nếu bạn đã có một project Node.js, hãy mở thư mục project của của bạn.
```shell
cd your/project/path
```

### 3. Cài Đặt Cypress
Cài đặt Cypress qua npm bằng lệnh sau:
```bash
npm install cypress --save-dev
```

## II. Cấu trúc project
Cấu trúc 1 project Cypress cơ bản sẽ có dạng như sau:
```lua
your-project/
├── cypress/
│   ├── e2e/
│   │   ├── examples/
│   │   ├── integration/
│   │   │   ├── your-tests.spec.js
│   │   │   └── another-test.spec.js
│   │   └── fixtures/
│   │       └── example.json
│   ├── support/
│   │   ├── commands.js
│   │   └── e2e.js
│   ├── plugins/
│   │   └── index.js
├── cypress.config.js
├── package.json
└── README.md
```
**Giải thích Các Thư Mục và Tệp**

- `cypress/`: Thư mục chính chứa tất cả các tệp và thư mục liên quan đến Cypress.
  - `e2e/`: Thư mục chứa các tài nguyên cho kiểm thử end-to-end (E2E). Trong thư mục này có các thư mục con:
    - `integration/`: Đây là nơi bạn đặt các tệp kiểm thử của bạn, thường có đuôi .spec.js hoặc .spec.ts nếu bạn sử dụng TypeScript.
    - `fixtures/`: Chứa các tệp dữ liệu mẫu (fixtures) như các tệp JSON, có thể được sử dụng trong các bài kiểm thử để cung cấp dữ liệu.
  - `support/`: Thư mục này chứa các tệp hỗ trợ và mở rộng Cypress.
    - `commands.js`: Tại đây bạn có thể định nghĩa các lệnh tùy chỉnh để sử dụng trong các bài kiểm thử.
    - `e2e.js`: Tệp này thường chứa mã cấu hình và thiết lập cho các bài kiểm thử, chẳng hạn như các hook (before, after) chung cho toàn bộ các bài kiểm thử.
  - `plugins/`: Thư mục chứa các plugin Cypress.
    - `index.js`: Tệp này dùng để cấu hình các plugin Cypress, như các tùy chỉnh cấu hình cho Cypress hoặc tích hợp với các công cụ khác.
- `cypress.config.js`: Tệp cấu hình chính của Cypress. Tại đây bạn có thể cấu hình các tùy chọn như các đường dẫn, môi trường, thời gian chờ, và nhiều thiết lập khác.
- `package.json`: Tệp cấu hình của npm, nơi bạn quản lý các phụ thuộc, script và thông tin về dự án. Đây là nơi bạn sẽ cài đặt Cypress và các gói phụ thuộc khác.
- `README.md`: Tệp hướng dẫn và tài liệu cho dự án của bạn. Nơi bạn có thể cung cấp thông tin về cách cài đặt và chạy các bài kiểm thử Cypress.


## III. Cấu hình Cypress
Cypress sử dụng tệp cấu hình cypress.config.js (hoặc cypress.json trong phiên bản cũ hơn) để quản lý các thiết lập.
**Cấu hình cơ bản trong cypress.config.js:**
```javascript
// cypress.config.js
module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      // Cấu hình các plugin và các sự kiện Node.js tại đây
    },
    baseUrl: 'http://localhost:3000', // URL của ứng dụng bạn muốn kiểm tra
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 4000,
    // Các tùy chọn cấu hình khác
  },
}
```
- `baseUrl`: Đặt URL cơ bản cho các yêu cầu mạng.
- `viewportWidth` và `viewportHeight`: Xác định kích thước của viewport (khu vực nhìn thấy của trình duyệt).
- `defaultCommandTimeout`: Thời gian chờ mặc định (theo mili giây) cho các lệnh như cy.get() và cy.find().
- `pageLoadTimeout`: Thời gian chờ tối đa (theo mili giây) cho việc tải trang.
- `requestTimeout`: Thời gian chờ tối đa (theo mili giây) cho các yêu cầu mạng.
- `responseTimeout`: Thời gian chờ tối đa (theo mili giây) cho phản hồi của yêu cầu mạng.
- `video`: Quyết định có quay video các bài kiểm tra hay không. (Mặc định là true trong chế độ chạy đầu ra).
- `screenshotsFolder`: Thư mục lưu trữ ảnh chụp màn hình khi kiểm tra thất bại.
- `videosFolder`: Thư mục lưu trữ video khi kiểm tra thất bại.
- `env`: Xác định các biến môi trường có thể được sử dụng trong các bài kiểm tra.
- `chromeWebSecurity`: Tùy chọn để bật hoặc tắt bảo mật web của Chrome. Nếu bạn đang gặp vấn đề với các lỗi liên quan đến CORS, bạn có thể thử tắt nó.
- `numTestsKeptInMemory`: Số lượng bài kiểm tra được giữ trong bộ nhớ (dùng cho hiển thị các báo cáo).
- `videoCompression`: Tùy chọn nén video, có thể là false hoặc 0 (không nén) cho chất lượng video tốt hơn.

Các cấu hình này giúp tùy chỉnh hành vi của Cypress và phù hợp với nhu cầu kiểm thử của bạn. Bạn có thể tìm thêm thông tin chi tiết và tùy chọn cấu hình khác trong tài liệu chính thức của Cypress tại [trang tài liệu](https://docs.cypress.io/guides/overview/why-cypress) của Cypress.



## IV. Test Scripts
Dưới đây là một ví dụ cơ bản về cách viết một test script với Cypress. Ví dụ này kiểm tra xem trang chủ của một trang web có chứa một tiêu đề cụ thể hay không.

### 1. Tạo mới một Test Script
Cypress tự động tạo một số ví dụ test script trong thư mục cypress/integration. Bạn có thể tạo các tệp test script của riêng bạn trong thư mục này. Ví dụ, bạn có thể tạo một tệp mới có tên `example_spec.js`.

### 2. ViếtTest Script
```javascript
// cypress/integration/example_spec.js

describe('Trang chủ', () => {
  it('Nên hiển thị tiêu đề đúng', () => {
    // Mở trang web cần kiểm tra
    cy.visit('https://example.com');

    // Xác nhận tiêu đề của trang web
    cy.title().should('include', 'Example Domain');

    // Kiểm tra xem có chứa một yếu tố cụ thể không
    cy.get('h1').should('contain', 'Example Domain');
  });
});
```
**Trong ví dụ này:**
- describe định nghĩa một nhóm các bài kiểm thử (Test Suite).
- it định nghĩa một bài kiểm thử cụ thể (Test case).
- cy.visit mở trang web cần kiểm thử.
- cy.title kiểm tra tiêu đề của trang.

### 3. Các lệnh cơ bản của Cypress
- `cy.visit(url)`: Truy cập vào URL được chỉ định.
- `cy.get(selector)`: Tìm phần tử trên trang web bằng selector CSS.
- `cy.contains(text)`: Tìm phần tử chứa văn bản cụ thể.
- `cy.title()`: Lấy tiêu đề của trang web.
- `cy.should('condition')`: Xác nhận rằng điều kiện được chỉ định là đúng.

### 4. Tùy chỉnh Test
Cypress cung cấp nhiều tính năng mạnh mẽ để tùy chỉnh các bài kiểm tra của bạn, bao gồm:
- Hooks: `before`, `beforeEach`, `after`, `afterEach` để thực hiện các hành động trước và sau các bài kiểm tra.
- Assertions: Các phương thức xác nhận để kiểm tra trạng thái của phần tử.
  Fixtures: Để sử dụng dữ liệu giả lập trong các bài kiểm tra.

**Ví dụ với hooks:**
```javascript
describe('Test với Hooks', () => {
  before(() => {
    // Thực hiện hành động trước tất cả các bài kiểm tra
  });

  beforeEach(() => {
    // Thực hiện hành động trước mỗi bài kiểm tra
    cy.visit('https://example.com');
  });

  it('Kiểm tra tiêu đề', () => {
    cy.title().should('include', 'Example Domain');
  });

  after(() => {
    // Thực hiện hành động sau tất cả các bài kiểm tra
  });
});
```

## V. Running Test Scripts
Để chạy Cypress, bạn có thể thực hiện các bước sau đây, tùy thuộc vào cách bạn muốn chạy các bài kiểm thử: qua giao diện người dùng (GUI) hoặc trong chế độ dòng lệnh (headless).

### 1. Chạy Cypress qua Giao Diện Người Dùng (GUI)

Để mở giao diện người dùng của Cypress, chạy lệnh sau trong terminal:
```bash
npx cypress open
```
Lệnh này sẽ mở Cypress Test Runner, cho phép bạn chọn và chạy các bài kiểm thử bằng giao diện đồ họa. Bạn có thể chọn bài kiểm thử từ danh sách và xem các kết quả ngay lập tức.

### 2. Chạy Cypress trong Chế Độ Dòng Lệnh (Headless).

### 2.1. Chạy Các Bài Kiểm Thử:
- Để chạy tất cả các bài kiểm thử trong chế độ headless, sử dụng lệnh sau:
```bash
npx cypress run
```
- Lệnh này sẽ thực thi tất cả các bài kiểm thử mà không mở giao diện người dùng. Kết quả sẽ được hiển thị trong terminal.

### 2.2. Chạy Các Bài Kiểm Thử Với Trình Duyệt Cụ Thể:
- Mặc định, Cypress chạy bài kiểm thử trên Chromium. Để chạy với một trình duyệt cụ thể, bạn có thể sử dụng tùy chọn --browser. Ví dụ, để chạy kiểm thử trên Firefox, bạn có thể sử dụng:
```bash
npx cypress run --browser firefox
```

### 2.3. Chạy Các Bài Kiểm Thử Với Các Tùy Chọn Khác::
- Để xem tất cả các tùy chọn có sẵn, bạn có thể chạy:
```bash
npx npx cypress run --help
```
- Một số tùy chọn phổ biến bao gồm:
  - `--record`: Ghi lại kết quả kiểm thử vào Cypress Dashboard.
  - `--headed`: Chạy các bài kiểm thử trong chế độ giao diện người dùng, tương tự như npx cypress open, nhưng từ dòng lệnh.


## VI. Hỗ trợ
Dưới đây là các tài liệu và hướng dẫn chính về Cypress, nơi bạn có thể tìm hiểu thêm chi tiết về cách sử dụng và cấu hình công cụ này:

- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress): Đây là nguồn tài liệu chính thức cung cấp hướng dẫn chi tiết về cách cài đặt, cấu hình, và viết bài kiểm tra với Cypress. Tài liệu được phân loại theo các chủ đề như cài đặt, cấu hình, viết bài kiểm tra, và nhiều tính năng nâng cao.
- [Get Started with Cypress](https://docs.cypress.io/guides/getting-started/installing-cypress): Một hướng dẫn chi tiết từ cài đặt đến viết các bài kiểm tra đầu tiên. Rất hữu ích cho người mới bắt đầu.
- [Cypress API Documentation](https://docs.cypress.io/api/table-of-contents): Cung cấp thông tin chi tiết về các API của Cypress, bao gồm các lệnh và phương thức mà bạn có thể sử dụng trong bài kiểm tra của mình.
- [Configuration](https://docs.cypress.io/guides/references/configuration): Hướng dẫn về cách cấu hình Cypress, bao gồm các tùy chọn cấu hình trong `cypress.json` và `cypress.config.js`.
- [Best Practices](https://docs.cypress.io/guides/references/best-practices): Hướng dẫn về các phương pháp tốt nhất khi viết bài kiểm tra với Cypress để đảm bảo kiểm tra của bạn là hiệu quả và dễ duy trì.
- [Examples and Sample Projects](https://docs.cypress.io/examples/recipes/): Bộ sưu tập các ví dụ và dự án mẫu để bạn có thể tham khảo và học hỏi từ các tình huống thực tế.
- [Cypress Blog](https://www.cypress.io/blog): Blog chính thức của Cypress cung cấp các bài viết cập nhật, mẹo và kỹ thuật mới.
- [GitHub Repository](https://github.com/cypress-io/cypress): Kho lưu trữ chính thức của Cypress trên GitHub, nơi bạn có thể xem mã nguồn, báo cáo lỗi, và đóng góp cho dự án.
- [Cypress YouTube Channel](https://www.youtube.com/c/Cypressio): Kênh YouTube chính thức của Cypress với các video hướng dẫn, hội thảo trên web, và demo.

+++
date        = '2026-06-28T13:00:00+07:00'
draft       = false
title       = 'Docker là gì? Tại sao mọi developer cần biết Docker?'
slug        = 'docker-la-gi-tai-sao-can-dung-docker'
summary     = 'Tìm hiểu Docker là gì, vấn đề mà nó giải quyết, sự khác nhau giữa container và máy ảo, cùng những khái niệm nền tảng cần nắm trước khi bắt đầu.'
thumbnail   = '/images/docker-series/01-docker-la-gi.webp'
weight      = 1
columns     = 2
categories  = ['it']
subcategories = ['devops']
tags        = ['docker', 'devops']
series      = ['huong-dan-docker-tu-a-den-z']
authors     = ['Nguyen Chung']
+++

Docker đã thay đổi cách chúng ta đóng gói, phân phối và chạy phần mềm. Dù bạn là backend developer, frontend developer hay DevOps engineer, hiểu Docker là một lợi thế lớn. Bài viết mở đầu series này sẽ giải thích Docker là gì và tại sao nó lại quan trọng đến vậy.

## Vấn đề: "Trên máy tôi chạy được mà!"

Hãy tưởng tượng tình huống quen thuộc này:

```
Dev viết code → chạy ngon trên laptop
         ↓
Đưa lên server → lỗi tùm lum
         ↓
"Ủa, trên máy tôi chạy được mà?!"
```

Nguyên nhân thường là **môi trường khác nhau**:

- Máy dev dùng Node 20, server dùng Node 16
- Thiếu thư viện hệ thống, sai version Python
- Biến môi trường, cấu hình OS không giống nhau

Cài đặt thủ công từng dependency trên mỗi máy vừa tốn thời gian, vừa dễ sai sót. Đây chính là vấn đề mà Docker sinh ra để giải quyết.

## Docker là gì?

**Docker** là một nền tảng giúp **đóng gói ứng dụng cùng toàn bộ môi trường chạy của nó** (thư viện, dependency, cấu hình) vào một đơn vị tiêu chuẩn gọi là **container**.

Container này chạy **y hệt nhau** ở mọi nơi: máy dev, server test, server production, hay máy của đồng nghiệp.

> Triết lý của Docker: **"Build once, run anywhere"** — đóng gói một lần, chạy ở bất cứ đâu.

Docker được giới thiệu năm 2013 bởi công ty dotCloud (sau đổi tên thành Docker, Inc.) và nhanh chóng trở thành chuẩn mực của ngành.

## Container hoạt động như thế nào?

Hãy nghĩ về **container hàng hóa** ngoài đời thực: bất kể bên trong là quần áo, điện tử hay thực phẩm, container đều có kích thước chuẩn, nên tàu, cảng, xe tải đều xử lý được mà không cần quan tâm bên trong là gì.

Docker container cũng vậy: dù bên trong là app Node.js, Python hay Java, Docker đều chạy chúng theo một cách thống nhất.

## Container vs Máy ảo (Virtual Machine)

Đây là so sánh quan trọng nhất để hiểu Docker:

```
        MÁY ẢO (VM)                      CONTAINER (Docker)

  ┌─────┐ ┌─────┐ ┌─────┐         ┌─────┐ ┌─────┐ ┌─────┐
  │ App │ │ App │ │ App │         │ App │ │ App │ │ App │
  ├─────┤ ├─────┤ ├─────┤         ├─────┤ ├─────┤ ├─────┤
  │ OS  │ │ OS  │ │ OS  │         │ libs│ │ libs│ │ libs│
  │ đầy │ │ đầy │ │ đầy │         └─────┴─┴─────┴─┴─────┘
  │ đủ  │ │ đủ  │ │ đủ  │         ┌───────────────────────┐
  └─────┴─┴─────┴─┴─────┘         │   Docker Engine       │
  ┌───────────────────────┐       ├───────────────────────┤
  │      Hypervisor       │       │      Host OS          │
  ├───────────────────────┤       ├───────────────────────┤
  │      Host OS          │       │      Hardware         │
  └───────────────────────┘       └───────────────────────┘
```

Khác biệt then chốt:

| Tiêu chí | Máy ảo (VM) | Container (Docker) |
|---|---|---|
| Cách hoạt động | Ảo hóa cả phần cứng + OS riêng | Chia sẻ kernel của OS host |
| Kích thước | Hàng GB | Thường vài chục–vài trăm MB |
| Thời gian khởi động | Vài phút | Vài giây hoặc nhanh hơn |
| Hiệu năng | Có overhead lớn | Gần như native |
| Số lượng chạy đồng thời | Vài cái | Hàng chục, hàng trăm |

Container nhẹ hơn vì **không cần một OS đầy đủ cho mỗi ứng dụng** — chúng dùng chung kernel của máy host.

## Tại sao bạn nên học Docker?

### 1. Hết cảnh "trên máy tôi chạy được"

Môi trường được đóng gói trong image, nên ai chạy cũng giống nhau — từ dev đến production.

### 2. Cài đặt môi trường trong vài giây

Cần một database PostgreSQL để test? Không cần cài đặt phức tạp:

```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres:16
```

Một lệnh, vài giây, bạn đã có PostgreSQL chạy sẵn. Xong việc thì xóa đi, không để lại rác trên máy.

### 3. Cô lập (isolation) — không xung đột

Dự án A cần Node 16, dự án B cần Node 20? Mỗi container có môi trường riêng, không ảnh hưởng lẫn nhau.

### 4. Nền tảng của DevOps hiện đại

```
Docker → CI/CD → Kubernetes → Microservices → Cloud
```

Docker là viên gạch nền cho cả hệ sinh thái: Kubernetes, container orchestration, microservices đều dựa trên container.

### 5. Tiêu chuẩn của ngành

Hầu hết công ty công nghệ hiện nay đều dùng Docker ở một mức độ nào đó. Biết Docker là một điểm cộng lớn trong CV.

## Các khái niệm cốt lõi cần nhớ

Đây là những thuật ngữ bạn sẽ gặp xuyên suốt series:

| Khái niệm | Giải thích |
|---|---|
| **Image** | Bản "khuôn mẫu" chỉ đọc, chứa app + môi trường. Giống như "class" trong lập trình |
| **Container** | Một phiên bản đang chạy của image. Giống như "object" được tạo từ class |
| **Dockerfile** | File text mô tả các bước để build nên một image |
| **Registry** | Kho lưu trữ image (Docker Hub là phổ biến nhất) |
| **Volume** | Cơ chế lưu trữ dữ liệu bền vững, tồn tại độc lập với container |
| **Docker Engine** | Phần lõi chạy và quản lý container trên máy host |

Mối quan hệ giữa chúng:

```
Dockerfile  ──build──▶  Image  ──run──▶  Container
                          │
                        push/pull
                          │
                          ▼
                       Registry (Docker Hub)
```

## Docker Engine và Docker Hub

- **Docker Engine**: Phần mềm chạy trên máy bạn, chịu trách nhiệm build image và chạy container. Trên Windows/macOS, nó đi kèm trong **Docker Desktop**.
- **Docker Hub**: "Kho image" công cộng lớn nhất, nơi bạn tải về các image có sẵn như `nginx`, `postgres`, `node`, `python`... hoặc đẩy image của mình lên.

## Khi nào KHÔNG nên dùng Docker?

Docker mạnh, nhưng không phải lúc nào cũng cần:

- Ứng dụng desktop GUI native (Docker không phù hợp lắm)
- Dự án nhỏ chạy hoàn toàn local, không có nhu cầu deploy
- Khi team chưa sẵn sàng và bài toán quá đơn giản

Hiểu đúng công cụ giúp bạn dùng nó đúng chỗ.

## Tóm tắt

- **Docker** giúp đóng gói ứng dụng + môi trường vào **container** chạy giống nhau ở mọi nơi
- Container **nhẹ và nhanh hơn máy ảo** vì chia sẻ kernel của OS host
- Ba khái niệm nền tảng: **Dockerfile → Image → Container**
- Docker là **kỹ năng nền tảng** cho DevOps, microservices và cloud hiện đại

---

**Bài tiếp theo**: [Cài đặt Docker trên Windows, macOS, Linux →](/posts/cai-dat-va-cau-hinh-docker/)

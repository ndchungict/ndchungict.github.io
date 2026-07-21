+++
date        = '2026-06-28T16:30:00+07:00'
draft       = false
title       = 'Docker trong CI/CD và production'
slug        = 'docker-trong-cicd-production'
summary     = 'Đưa Docker vào pipeline CI/CD: build và push image lên registry, tự động hóa với GitHub Actions, deploy lên server, cùng các lưu ý vận hành production.'
thumbnail   = '/images/docker-series/08-docker-cicd.webp'
weight      = 8
columns     = 2
categories  = ['it']
subcategories = ['devops']
tags        = ['docker', 'devops']
series      = ['huong-dan-docker-tu-a-den-z']
authors     = ['Nguyen Chung']
+++

Bạn đã biết build image, viết Compose và tối ưu image. Bài cuối của series này khép lại bức tranh: đưa Docker vào **quy trình tự động (CI/CD)** và chạy ở **production** — nơi Docker thực sự phát huy sức mạnh.

## Bức tranh tổng thể

Vòng đời của một image từ code đến production:

```
   Code   ──push──▶   CI (build & test)   ──▶   Registry   ──deploy──▶   Server
  (Git)              GitHub Actions             Docker Hub /           (production)
                                                GHCR / ECR
```

Mỗi lần push code, hệ thống tự động build image, test, đẩy lên registry, rồi triển khai. Không còn thao tác tay, không còn "trên máy tôi chạy được".

## Phần 1: Registry — kho chứa image

Registry là nơi lưu trữ image để chia sẻ và triển khai:

| Registry | Đặc điểm |
|---|---|
| **Docker Hub** | Phổ biến nhất, public miễn phí, private có giới hạn |
| **GitHub Container Registry (GHCR)** | Gắn liền GitHub, tiện cho dự án trên GitHub |
| **AWS ECR / Google Artifact Registry** | Của các cloud provider, hợp khi deploy lên cloud đó |

### Đẩy image lên Docker Hub

```bash
# 1. Đăng nhập
docker login

# 2. Đặt tag theo định dạng: <username>/<repo>:<tag>
docker tag my-app:1.0 username/my-app:1.0

# 3. Đẩy lên registry
docker push username/my-app:1.0

# Trên máy/server khác, kéo về và chạy
docker pull username/my-app:1.0
docker run -d -p 3000:3000 username/my-app:1.0
```

### Chiến lược đặt tag

Đừng chỉ dùng `latest`. Tag rõ ràng giúp truy vết và rollback:

```bash
docker tag my-app username/my-app:1.4.2      # version cụ thể
docker tag my-app username/my-app:1.4         # minor
docker tag my-app username/my-app:latest      # bản mới nhất
docker tag my-app username/my-app:a1b2c3d     # theo git commit SHA
```

> Thực hành tốt: tag theo **git commit SHA** hoặc **semantic version** để biết chính xác image đang chạy ứng với code nào.

## Phần 2: Tự động hóa với GitHub Actions

Đây là pipeline CI/CD thực tế: mỗi lần push lên nhánh `main`, tự build và đẩy image lên GHCR.

```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}
```

Pipeline này:

```
push main ──▶ checkout ──▶ login GHCR ──▶ build image ──▶ push (latest + SHA)
```

Có thể bổ sung bước chạy test trước khi build, hoặc bước deploy sau khi push.

## Phần 3: Deploy lên production

### Cách 1: Compose trên server (đơn giản, phổ biến)

Với ứng dụng vừa và nhỏ, chạy Compose ngay trên server là đủ:

```bash
# Trên server production
git pull                          # hoặc chỉ cần file compose
docker compose pull               # kéo image mới nhất
docker compose up -d              # cập nhật, chỉ restart cái thay đổi
docker image prune -f             # dọn image cũ
```

Một `compose.prod.yaml` điển hình:

```yaml
services:
  web:
    image: ghcr.io/username/my-app:latest
    ports:
      - "80:3000"
    environment:
      NODE_ENV: production
    env_file:
      - .env.production
    restart: always              # tự khởi động lại nếu crash
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

### Cách 2: Orchestrator (quy mô lớn)

Khi cần nhiều server, auto-scaling, tự phục hồi... bạn cần một **orchestrator**:

| Công cụ | Khi nào dùng |
|---|---|
| **Docker Swarm** | Đơn giản, đi kèm Docker, cụm nhỏ |
| **Kubernetes (K8s)** | Tiêu chuẩn cho quy mô lớn, nhiều tính năng, học khó hơn |

Đây là hướng đi tiếp theo sau khi bạn vững Docker — nhưng nằm ngoài phạm vi series này.

## Các lưu ý vận hành production

### 1. restart policy

Đảm bảo container tự sống lại khi crash hoặc khi server reboot:

```bash
docker run -d --restart always my-app
# unless-stopped: tự restart, trừ khi bạn chủ động stop
```

### 2. Giới hạn tài nguyên

Tránh một container ngốn hết CPU/RAM của server:

```bash
docker run -d \
  --memory="512m" \
  --cpus="1.0" \
  my-app
```

### 3. Healthcheck

Để Docker/orchestrator biết container có **thực sự khỏe** hay không, không chỉ là "đang chạy":

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
```

### 4. Log và monitoring

```bash
# Giới hạn dung lượng log để không đầy ổ đĩa
docker run -d \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  my-app
```

Ở production thực tế, thường gom log về hệ thống tập trung (ELK, Loki) và giám sát metric (Prometheus, Grafana).

### 5. Quản lý secret an toàn

- Không commit `.env.production` vào Git
- Dùng secret của CI/CD (GitHub Secrets), Docker secrets, hoặc secret manager của cloud
- Truyền secret lúc chạy, không nhúng vào image (đã nói ở bài tối ưu)

## Checklist sẵn sàng cho production

| Hạng mục | Việc cần làm |
|---|---|
| Image | Đã tối ưu (multi-stage, alpine), quét CVE |
| Tag | Theo version/SHA, không chỉ `latest` |
| CI/CD | Tự build, test, push qua pipeline |
| Restart | `--restart always` / `unless-stopped` |
| Tài nguyên | Giới hạn `--memory`, `--cpus` |
| Healthcheck | Có endpoint `/health` và HEALTHCHECK |
| Log | Giới hạn size, gom về nơi tập trung |
| Secret | Truyền lúc chạy, không nhúng/không commit |

## Tổng kết series

Qua 8 bài, bạn đã đi từ con số 0 đến chỗ tự tin dùng Docker:

```
1. Docker là gì         →  hiểu container vs VM
2. Cài đặt              →  môi trường sẵn sàng
3. Lệnh cơ bản          →  image & container
4. Dockerfile           →  đóng gói app của mình
5. Volume & Network     →  lưu trữ & kết nối
6. Docker Compose       →  multi-container
7. Tối ưu image         →  nhỏ, nhanh, an toàn
8. CI/CD & production    →  tự động hóa & vận hành
```

### Lộ trình tiếp theo

- **Kubernetes**: orchestration cho quy mô lớn, bước tiến tự nhiên sau Docker
- **Docker Swarm**: orchestration nhẹ, đi kèm Docker
- **Helm**: quản lý ứng dụng trên Kubernetes
- **GitOps (ArgoCD, Flux)**: deploy theo trạng thái khai báo từ Git
- **Service mesh, observability**: vận hành microservices ở quy mô lớn

Docker chỉ là điểm khởi đầu của một hệ sinh thái rộng lớn — nhưng là viên gạch nền vững chắc cho tất cả những gì phía sau.

---

**Bài trước**: [← Tối ưu Docker image & best practices](/posts/toi-uu-image-best-practices/)

**Bài đầu series**: [Docker là gì? Tại sao cần dùng Docker? →](/posts/docker-la-gi-tai-sao-can-dung-docker/)

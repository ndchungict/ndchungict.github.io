+++
date        = '2026-06-28T14:00:00+07:00'
draft       = false
title       = 'Docker cơ bản: image, container và các lệnh thiết yếu'
slug        = 'docker-co-ban-image-container-lenh'
summary     = 'Hiểu rõ mối quan hệ giữa image và container, vòng đời của container, cùng bộ lệnh thiết yếu bạn sẽ dùng hằng ngày khi làm việc với Docker.'
thumbnail   = '/images/docker-series/03-docker-co-ban.webp'
weight      = 3
columns     = 2
categories  = ['it']
subcategories = ['devops']
tags        = ['docker', 'devops']
series      = ['huong-dan-docker-tu-a-den-z']
authors     = ['Nguyen Chung']
+++

Sau khi đã cài Docker, đây là lúc nắm vững những lệnh bạn sẽ dùng hằng ngày. Bài viết này tập trung vào hai khái niệm trung tâm — **image** và **container** — cùng vòng đời và các lệnh quản lý chúng.

## Image và Container — phân biệt cho rõ

Đây là cặp khái niệm dễ nhầm nhất với người mới:

```
   IMAGE  ──(docker run)──▶  CONTAINER
  (khuôn mẫu,                (bản đang chạy,
   chỉ đọc)                   có thể start/stop/xóa)
```

So sánh dễ hiểu:

| | Image | Container |
|---|---|---|
| Bản chất | Khuôn mẫu chỉ đọc | Phiên bản đang chạy của image |
| Tương tự lập trình | `class` | `object` (instance) |
| Số lượng | Một image | Tạo được nhiều container từ một image |
| Trạng thái | Tĩnh, không đổi | Có vòng đời: chạy, dừng, xóa |

Từ **một** image `nginx`, bạn có thể chạy **nhiều** container nginx cùng lúc, mỗi cái độc lập.

## Làm việc với Image

### Tải image về (pull)

```bash
# Tải image về máy từ Docker Hub
docker pull nginx

# Tải một version cụ thể bằng tag
docker pull nginx:1.27
docker pull node:20-alpine
```

> Tag mặc định là `latest` nếu bạn không chỉ định. Trong thực tế nên ghi rõ version để tránh bất ngờ.

### Xem và xóa image

```bash
# Liệt kê image trên máy
docker images

# Xóa một image
docker rmi nginx:1.27

# Xóa các image không còn dùng (dangling)
docker image prune
```

## Vòng đời của Container

Một container đi qua các trạng thái sau:

```
       docker run / create
              │
              ▼
       ┌────────────┐  docker stop   ┌────────────┐
       │  RUNNING   │ ─────────────▶ │  STOPPED   │
       │ (đang chạy)│ ◀───────────── │ (đã dừng)  │
       └────────────┘  docker start  └────────────┘
              │                            │
              │         docker rm          │
              └────────────┬───────────────┘
                           ▼
                       REMOVED (đã xóa)
```

## Chạy Container — lệnh `docker run`

`docker run` là lệnh bạn dùng nhiều nhất. Nó tạo và khởi động container từ một image:

```bash
docker run nginx
```

Các tùy chọn (flag) quan trọng:

```bash
docker run \
  -d \                      # detached: chạy nền
  --name my-web \           # đặt tên cho container
  -p 8080:80 \              # map cổng host:container
  -e ENV=production \       # set biến môi trường
  nginx
```

Giải thích từng flag:

| Flag | Ý nghĩa |
|---|---|
| `-d` | Chạy ở chế độ nền (detached), trả lại terminal cho bạn |
| `--name` | Đặt tên dễ nhớ thay vì ID ngẫu nhiên |
| `-p 8080:80` | Cổng 8080 trên máy host → cổng 80 trong container |
| `-e` | Truyền biến môi trường vào container |
| `-it` | Chế độ tương tác (interactive) — dùng khi cần vào shell |
| `--rm` | Tự xóa container khi nó dừng |
| `-v` | Mount volume (sẽ học ở bài sau) |

### Port mapping — vì sao cần `-p`?

Container có mạng riêng, bị cô lập với máy host. Để truy cập được service bên trong, bạn phải "mở cửa" bằng port mapping:

```
Trình duyệt ──▶ localhost:8080 ──▶ [container: port 80 / nginx]
                    (host)              (bên trong container)
```

## Quản lý Container

### Xem container

```bash
# Container đang chạy
docker ps

# Tất cả container (kể cả đã dừng)
docker ps -a
```

### Dừng, khởi động lại, xóa

```bash
# Dừng container
docker stop my-web

# Khởi động lại container đã dừng
docker start my-web

# Restart (dừng rồi chạy lại)
docker restart my-web

# Xóa container (phải dừng trước, hoặc thêm -f để ép)
docker rm my-web
docker rm -f my-web
```

## Tương tác với Container đang chạy

### Xem log

```bash
# Xem log của container
docker logs my-web

# Theo dõi log realtime (như tail -f)
docker logs -f my-web
```

### Vào bên trong container (cực kỳ hữu ích)

```bash
# Mở shell bên trong container đang chạy
docker exec -it my-web bash

# Nếu image không có bash, thử sh (image alpine)
docker exec -it my-web sh
```

Lệnh này đưa bạn vào "bên trong" container như đang SSH vào một máy — rất hữu ích để debug.

### Chạy một lệnh đơn lẻ

```bash
# Xem nội dung thư mục bên trong container
docker exec my-web ls /usr/share/nginx/html

# Xem các process đang chạy trong container
docker exec my-web ps aux
```

## Dọn dẹp — giải phóng dung lượng

Sau một thời gian, máy bạn sẽ đầy image và container không dùng:

```bash
# Xóa tất cả container đã dừng
docker container prune

# Xóa image không dùng
docker image prune

# Dọn tổng lực: container dừng + image thừa + network + cache
docker system prune

# Dọn cả volume không dùng (cẩn thận: mất dữ liệu)
docker system prune -a --volumes

# Xem Docker đang chiếm bao nhiêu dung lượng
docker system df
```

## Bảng lệnh thiết yếu — bỏ túi

| Lệnh | Công dụng |
|---|---|
| `docker run` | Tạo và chạy container từ image |
| `docker ps` / `docker ps -a` | Xem container đang chạy / tất cả |
| `docker images` | Xem image trên máy |
| `docker pull` | Tải image từ registry |
| `docker stop` / `docker start` | Dừng / khởi động container |
| `docker rm` / `docker rmi` | Xóa container / xóa image |
| `docker logs -f` | Xem log realtime |
| `docker exec -it ... bash` | Vào shell bên trong container |
| `docker system prune` | Dọn dẹp tài nguyên thừa |

## Ví dụ thực tế: chạy một database để dev

Ghép các lệnh lại trong một tình huống thật:

```bash
# Chạy PostgreSQL cho việc phát triển
docker run -d \
  --name dev-postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=myapp \
  postgres:16

# Kiểm tra nó đang chạy
docker ps

# Xem log để chắc DB đã sẵn sàng
docker logs dev-postgres

# Vào psql bên trong container
docker exec -it dev-postgres psql -U postgres -d myapp

# Xong việc, dọn dẹp
docker rm -f dev-postgres
```

Chỉ vài lệnh, không cài đặt PostgreSQL trực tiếp lên máy, không để lại rác.

## Tóm tắt

- **Image** là khuôn mẫu chỉ đọc; **container** là bản đang chạy của image
- `docker run` với các flag `-d`, `--name`, `-p`, `-e` là lệnh bạn dùng nhiều nhất
- `docker exec -it ... bash` đưa bạn vào bên trong container để debug
- Đừng quên `docker system prune` để giải phóng dung lượng định kỳ

---

**Bài trước**: [← Cài đặt Docker trên Windows, macOS, Linux](/posts/cai-dat-va-cau-hinh-docker/)

**Bài tiếp theo**: [Dockerfile: tự đóng gói ứng dụng thành image →](/posts/dockerfile-dong-goi-ung-dung/)

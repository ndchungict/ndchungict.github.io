+++
date        = '2026-06-29T13:30:00+07:00'
draft       = false
title       = 'Cài đặt Docker trên Windows, macOS, Linux'
slug        = 'cai-dat-va-cau-hinh-docker'
summary     = 'Hướng dẫn cài đặt Docker trên Windows, macOS và Linux, kiểm tra hoạt động, cấu hình cơ bản và chạy thử container đầu tiên.'
thumbnail   = '/images/docker-series/02-cai-dat-docker.svg'
weight      = 2
categories  = ['it']
tags        = ['docker', 'devops']
series      = ['huong-dan-docker-tu-a-den-z']
authors     = ['Nguyen Chung']
+++

Trước khi học các lệnh và viết Dockerfile, bạn cần cài đặt Docker trên máy. Bài viết này hướng dẫn cài Docker trên cả ba hệ điều hành phổ biến và kiểm tra mọi thứ hoạt động đúng.

## Docker Desktop vs Docker Engine

Có hai cách dùng Docker, tùy hệ điều hành:

| | Docker Desktop | Docker Engine |
|---|---|---|
| Dành cho | Windows, macOS (và Linux) | Linux (server) |
| Giao diện | Có GUI quản lý | Chỉ command line |
| Bao gồm | Engine + CLI + Compose + GUI | Chỉ engine + CLI |
| Phù hợp | Máy cá nhân, dev | Server production |

- **Windows / macOS**: dùng **Docker Desktop** (vì hai OS này không chạy Linux container trực tiếp, cần một lớp ảo hóa nhẹ bên dưới).
- **Linux**: thường cài thẳng **Docker Engine**, nhẹ và phù hợp cho server.

## Cài đặt trên Windows

### Yêu cầu

- Windows 10/11 64-bit
- Bật **WSL 2** (Windows Subsystem for Linux) — Docker Desktop khuyến nghị dùng backend này
- Ảo hóa được bật trong BIOS

### Các bước

1. Bật WSL 2 (mở PowerShell với quyền Admin):

```powershell
wsl --install
```

2. Tải **Docker Desktop for Windows** từ trang chủ Docker và cài đặt như phần mềm bình thường.
3. Khởi động lại máy nếu được yêu cầu.
4. Mở Docker Desktop, đợi đến khi icon báo trạng thái **"running"**.

## Cài đặt trên macOS

1. Tải **Docker Desktop for Mac** — chú ý chọn đúng phiên bản chip:
   - **Apple Silicon** (M1/M2/M3/M4): bản Apple chip
   - **Intel**: bản Intel chip
2. Kéo Docker vào thư mục Applications.
3. Mở Docker, cấp quyền khi được hỏi.
4. Đợi icon trên thanh menu báo Docker đang chạy.

> Mẹo: Cài nhanh bằng Homebrew: `brew install --cask docker`

## Cài đặt trên Linux (Ubuntu/Debian)

Trên Linux, cài Docker Engine qua repository chính thức để luôn có bản mới nhất:

```bash
# 1. Gỡ các bản cũ nếu có
sudo apt-get remove docker docker-engine docker.io containerd runc

# 2. Cài các gói cần thiết
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 3. Thêm GPG key chính thức của Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Thêm repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Cài Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### Chạy Docker không cần sudo

Mặc định trên Linux phải gõ `sudo` trước mỗi lệnh. Để bỏ điều này:

```bash
# Thêm user hiện tại vào group docker
sudo usermod -aG docker $USER

# Đăng xuất rồi đăng nhập lại (hoặc chạy)
newgrp docker
```

> Lưu ý bảo mật: thành viên group `docker` có quyền tương đương root. Chỉ thêm user bạn tin tưởng.

## Kiểm tra cài đặt

Bất kể hệ điều hành nào, hãy kiểm tra Docker đã sẵn sàng:

```bash
# Xem phiên bản
docker --version
# Docker version 27.x.x, build ...

# Xem thông tin chi tiết về Docker Engine
docker info
```

Nếu cả hai lệnh chạy không lỗi, Docker đã hoạt động.

## Chạy container đầu tiên

Đây là "Hello World" của Docker:

```bash
docker run hello-world
```

Bạn sẽ thấy output đại loại như:

```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
...
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

Chuyện gì vừa xảy ra?

```
1. Docker không tìm thấy image hello-world trên máy
2. Tự động tải (pull) image từ Docker Hub
3. Tạo một container từ image đó
4. Container chạy, in ra lời chào, rồi kết thúc
```

Chúc mừng — bạn vừa chạy container Docker đầu tiên!

## Một vài lệnh kiểm tra hữu ích

```bash
# Liệt kê container đang chạy
docker ps

# Liệt kê tất cả container (kể cả đã dừng)
docker ps -a

# Liệt kê image đang có trên máy
docker images

# Chạy thử một web server nginx
docker run -d -p 8080:80 nginx
# Mở trình duyệt: http://localhost:8080
```

## Cấu hình Docker Desktop (tùy chọn)

Trong phần Settings của Docker Desktop, bạn có thể điều chỉnh:

- **Resources**: số CPU, RAM, dung lượng đĩa cấp cho Docker
- **File sharing**: thư mục được phép mount vào container
- **Auto-start**: tự khởi động Docker khi mở máy

Với máy dev, mức mặc định thường đủ dùng. Tăng RAM nếu bạn chạy nhiều container cùng lúc.

## Xử lý sự cố thường gặp

| Lỗi | Nguyên nhân & cách xử lý |
|---|---|
| `Cannot connect to the Docker daemon` | Docker chưa chạy — mở Docker Desktop hoặc `sudo systemctl start docker` |
| `permission denied` (Linux) | Chưa thêm user vào group `docker`, hoặc chưa đăng nhập lại |
| Docker Desktop không khởi động (Windows) | Chưa bật WSL 2 hoặc ảo hóa trong BIOS |
| Pull image rất chậm | Mạng yếu, hoặc thử cấu hình registry mirror |

## Tóm tắt

- **Windows/macOS** dùng **Docker Desktop**; **Linux server** dùng **Docker Engine**
- Kiểm tra bằng `docker --version` và `docker info`
- Chạy thử `docker run hello-world` để xác nhận mọi thứ hoạt động
- Trên Linux, thêm user vào group `docker` để khỏi gõ `sudo`

---

**Bài trước**: [← Docker là gì? Tại sao cần dùng Docker?](/posts/docker-la-gi-tai-sao-can-dung-docker/)

**Bài tiếp theo**: [Docker cơ bản: image, container và các lệnh thiết yếu →](/posts/docker-co-ban-image-container-lenh/)

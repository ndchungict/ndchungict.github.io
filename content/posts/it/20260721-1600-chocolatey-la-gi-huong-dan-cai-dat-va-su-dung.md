+++
date        = '2026-07-21T16:00:00+07:00'
draft       = false
title       = 'Chocolatey là gì? Hướng dẫn cài đặt và sử dụng trình quản lý gói cho Windows'
slug        = 'chocolatey-la-gi-huong-dan-cai-dat-va-su-dung'
summary     = 'Chocolatey là trình quản lý gói giúp cài đặt, cập nhật và gỡ phần mềm trên Windows chỉ bằng một dòng lệnh PowerShell, thay vì tải file .exe rồi bấm Next liên tục. Bài viết hướng dẫn từ cài đặt, các lệnh cốt lõi (install, upgrade, uninstall, search...), ví dụ cài git/VS Code/Chrome/7-Zip, đến cách viết script tự động hoá setup máy mới và so sánh với winget, Scoop.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
columns     = 2
categories  = ['it']
subcategories = ['devops', 'tips-tricks']
tags        = ['chocolatey', 'windows', 'powershell', 'package-manager', 'automation']
series      = []
authors     = ['Nguyen Chung']
+++

Cài máy Windows mới thường đi kèm một buổi chiều lặp đi lặp lại: mở trình duyệt, tìm trang chủ từng phần mềm, tải file `.exe`, bấm Next-Next-Next, rồi lặp lại cho phần mềm tiếp theo. **Chocolatey** ra đời để biến toàn bộ quy trình đó thành vài dòng lệnh trong PowerShell — giống hệt cách `apt` làm trên Ubuntu hay Homebrew làm trên macOS. Bài viết này giới thiệu Chocolatey là gì, cách cài đặt, các lệnh dùng hằng ngày, và cách dùng nó để tự động hoá việc setup máy mới.

## Chocolatey là gì? Ra đời để giải quyết vấn đề gì?

**Chocolatey** là một **trình quản lý gói (package manager)** mã nguồn mở dành cho Windows, cho phép cài đặt, cập nhật và gỡ bỏ phần mềm chỉ bằng một dòng lệnh trong PowerShell hoặc Command Prompt — thay vì phải tải installer thủ công từ từng trang chủ.

Chocolatey ra mắt năm 2011, xây dựng trên nền **NuGet** (hệ thống quản lý package của .NET). Mỗi phần mềm trên Chocolatey được đóng gói thành một **package** (`.nupkg`) chứa script cài đặt — script này biết cách tải installer gốc (`.exe`, `.msi`) từ đúng nguồn, chạy nó ở chế độ **silent** (không hiện giao diện, không cần bấm gì), và tự thêm phần mềm vào `PATH` nếu cần.

Vấn đề Chocolatey giải quyết:

- **Windows không có package manager mặc định** (ít nhất là cho tới khi Microsoft ra `winget`) — không như Linux có `apt`/`dnf`, hay macOS có Homebrew.
- **Cài đặt thủ công tốn thời gian và dễ sai sót**: tải nhầm bản, quên bỏ chọn toolbar rác đi kèm installer, cài xong quên thêm vào `PATH`.
- **Khó tái lập môi trường**: cài lại máy, setup máy cho đồng nghiệp mới, hay dựng máy ảo CI — làm thủ công từng bước rất khó đảm bảo giống nhau giữa các máy.
- **Khó cập nhật hàng loạt**: có hàng chục phần mềm cài trên máy, muốn biết cái nào đang lỗi thời và update tất cả cùng lúc gần như không thể làm thủ công.

Chocolatey giải quyết cả bốn vấn đề trên bằng cách chuẩn hoá việc cài/gỡ/cập nhật phần mềm thành một cú pháp lệnh duy nhất, chạy được im lặng (không cần tương tác), và có thể **viết thành script để chạy lại y hệt trên bất kỳ máy Windows nào**.

## So sánh với cách cài đặt phần mềm truyền thống trên Windows

| Tiêu chí | Cài thủ công (tải .exe/.msi) | Chocolatey |
|---|---|---|
| Cách thực hiện | Tìm trang chủ → tải file → chạy installer → bấm Next nhiều lần | Gõ 1 dòng lệnh `choco install <tên-gói>` |
| Thời gian cho nhiều phần mềm | Lặp lại thủ công cho từng phần mềm | Cài hàng loạt cùng lúc trong 1 lệnh |
| Rủi ro | Dễ tải nhầm bản/nguồn giả mạo, dễ lỡ tick chọn phần mềm rác đi kèm | Cài từ nguồn package đã kiểm duyệt, chạy silent, không có bloatware kèm theo |
| Cập nhật | Phải tự kiểm tra từng phần mềm còn bản mới hay không | `choco upgrade all` cập nhật toàn bộ trong 1 lệnh |
| Tái lập trên máy khác | Phải làm lại thủ công từng bước | Chạy lại đúng script/lệnh đã dùng |
| Gỡ cài đặt | Vào Control Panel tìm và gỡ từng cái, có thể sót rác | `choco uninstall <tên-gói>` gỡ gọn, đúng phần mềm đã cài qua choco |

Nói ngắn gọn: cài thủ công vẫn ổn nếu chỉ cần 1-2 phần mềm một lần, nhưng càng nhiều phần mềm và càng nhiều máy cần setup, lợi thế của Chocolatey càng rõ.

## Cài đặt Chocolatey qua PowerShell

### Yêu cầu

- Windows 7+ / Windows Server 2003+.
- **PowerShell chạy với quyền Administrator** (mở "Windows PowerShell" → chuột phải → "Run as administrator").
- `.NET Framework 4.8+` — hầu hết Windows hiện đại đã có sẵn, script cài đặt sẽ tự kiểm tra và cảnh báo nếu thiếu.

### Câu lệnh cài đặt

Mở PowerShell **với quyền Administrator**, kiểm tra execution policy hiện tại rồi chạy lệnh cài đặt chính thức từ [chocolatey.org](https://chocolatey.org/install):

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; `
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Giải thích từng phần:

1. `Set-ExecutionPolicy Bypass -Scope Process -Force` — tạm thời cho phép chạy script không cần chữ ký số, **chỉ trong phiên PowerShell hiện tại** (không đổi policy toàn hệ thống).
2. Dòng `SecurityProtocol` — ép dùng TLS 1.2 để tải an toàn trên các bản Windows cũ chưa mặc định bật TLS 1.2.
3. `iex (...)` — tải script cài đặt chính thức từ `community.chocolatey.org` rồi chạy ngay (`iex` là alias của `Invoke-Expression`).

> Luôn cài Chocolatey bằng đúng lệnh trên trang chính thức [chocolatey.org/install](https://chocolatey.org/install), tránh copy lệnh từ nguồn không rõ ràng — đây là script chạy với quyền Administrator trên máy.

### Kiểm tra sau khi cài

Đóng và mở lại cửa sổ PowerShell (để nạp lại `PATH`), rồi kiểm tra:

```powershell
choco --version
choco -v
```

Nếu hiện ra số version (ví dụ `2.3.0`), Chocolatey đã cài thành công và sẵn sàng dùng.

## Các lệnh cơ bản

| Lệnh | Chức năng |
|---|---|
| `choco install <tên-gói>` | Cài một hoặc nhiều gói phần mềm |
| `choco uninstall <tên-gói>` | Gỡ một gói đã cài |
| `choco upgrade <tên-gói>` | Nâng cấp một gói lên bản mới nhất |
| `choco upgrade all` | Nâng cấp **toàn bộ** gói đã cài qua Chocolatey |
| `choco search <từ-khoá>` hoặc `choco list <từ-khoá>` | Tìm gói theo tên/từ khoá |
| `choco list --local-only` | Liệt kê các gói đã cài trên máy |
| `choco info <tên-gói>` | Xem thông tin chi tiết (version, mô tả, dependency) |
| `choco outdated` | Xem gói nào đang có bản mới hơn chưa update |

Tất cả lệnh `install`/`uninstall`/`upgrade` nên chạy trong PowerShell **với quyền Administrator**, vì đa số phần mềm cần quyền ghi vào `Program Files` hoặc Registry.

Ví dụ dùng thực tế:

```powershell
choco search editor          # tìm gói liên quan đến "editor"
choco install git -y         # cài git, tự đồng ý mọi câu hỏi xác nhận
choco list --local-only      # xem đã cài những gì qua choco
choco upgrade git -y         # nâng cấp git lên bản mới nhất
choco uninstall git -y       # gỡ git
```

> Cờ `-y` (viết tắt của `--yes`) tự động trả lời "Yes" cho mọi câu hỏi xác nhận trong quá trình cài/gỡ/nâng cấp — rất cần thiết khi chạy script không có người ngồi trực bấm phím.

## Ví dụ thực tế: cài một vài phần mềm phổ biến

Cài từng phần mềm:

```powershell
choco install git -y                # Git
choco install vscode -y             # Visual Studio Code
choco install googlechrome -y       # Google Chrome
choco install 7zip -y               # 7-Zip
```

Hoặc cài **tất cả cùng lúc** chỉ bằng một dòng lệnh — liệt kê tên gói cách nhau bởi khoảng trắng:

```powershell
choco install git vscode googlechrome 7zip -y
```

Chocolatey sẽ tự tải đúng bản cài đặt mới nhất của từng phần mềm, chạy silent, và (với các công cụ dòng lệnh như `git`) tự thêm vào `PATH` — mở lại terminal là dùng được ngay, không cần tự cấu hình gì thêm.

> Tên gói trên Chocolatey không phải lúc nào cũng trùng tên phần mềm (ví dụ Chrome là `googlechrome`, không phải `chrome`). Dùng `choco search <tên-phần-mềm>` để tìm đúng tên gói trước khi cài.

## Tự động hoá setup máy mới bằng script

Đây là điểm mạnh nhất của Chocolatey: viết một lần, chạy lại trên bất kỳ máy Windows nào để có ngay bộ công cụ quen thuộc.

### Cách 1 — Script PowerShell đơn giản

Tạo file `setup.ps1` liệt kê toàn bộ phần mềm cần cài:

```powershell
# setup.ps1 — chạy với quyền Administrator
$packages = @(
    "git",
    "vscode",
    "googlechrome",
    "7zip",
    "nodejs-lts",
    "docker-desktop",
    "postman"
)

foreach ($pkg in $packages) {
    choco install $pkg -y
}
```

Chạy script:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\setup.ps1
```

### Cách 2 — Packages config file (`packages.config`)

Chocolatey hỗ trợ định nghĩa danh sách gói bằng file XML, rồi cài toàn bộ chỉ với một lệnh — tiện commit vào dotfiles repo hoặc chia sẻ cho cả team:

```xml
<?xml version="1.0" encoding="utf-8"?>
<packages>
  <package id="git" />
  <package id="vscode" />
  <package id="googlechrome" />
  <package id="7zip" />
  <package id="nodejs-lts" />
  <package id="docker-desktop" />
</packages>
```

Cài toàn bộ từ file này:

```powershell
choco install packages.config -y
```

### Cách 3 — Một dòng lệnh duy nhất

Nếu không muốn tạo file riêng, liệt kê thẳng tên gói ngay trong lệnh (giống ví dụ ở mục trước) — phù hợp khi chỉ cần chạy nhanh, không cần lưu lại:

```powershell
choco install git vscode googlechrome 7zip nodejs-lts docker-desktop -y
```

> Gợi ý: commit file `setup.ps1` hoặc `packages.config` vào một repo dotfiles cá nhân. Máy mới chỉ cần cài Chocolatey rồi chạy đúng một lệnh là có lại toàn bộ công cụ quen thuộc — tiết kiệm rất nhiều thời gian so với việc nhớ và cài lại thủ công từng phần mềm.

## Ưu điểm và hạn chế

### Ưu điểm

- **Nhanh, gọn, một lệnh cho mọi thao tác** — không cần tìm installer, không cần nhớ đã cài phần mềm nào bằng cách nào.
- **Cài silent, không có bloatware** — không lo bị tick nhầm cài kèm toolbar/phần mềm rác như nhiều installer gốc hay có.
- **Dễ tự động hoá** — viết script/`packages.config` một lần, dùng lại cho mọi máy, rất hợp để setup máy mới hoặc dựng máy ảo CI.
- **Kho gói khổng lồ** — hàng chục nghìn package trên [community.chocolatey.org](https://community.chocolatey.org/packages), gần như phần mềm phổ biến nào cũng có.
- **Cập nhật hàng loạt dễ dàng** — `choco upgrade all` nâng cấp mọi phần mềm đã cài chỉ trong một lệnh.

### Hạn chế

- **Chất lượng package không đồng đều** — vì cộng đồng tự đóng gói (community repository), có package cập nhật chậm hơn bản gốc, hoặc thỉnh thoảng lỗi script cài đặt.
- **Vẫn dùng installer gốc bên dưới** — Chocolatey không build lại phần mềm như Homebrew hay biên dịch từ source, mà chỉ tự động hoá việc tải và chạy `.exe`/`.msi` gốc — nên vẫn phụ thuộc vào nguồn/độ ổn định của installer đó.
- **Nhiều tính năng nâng cao yêu cầu bản trả phí** — Chocolatey có phiên bản **Business** (self-hosted repository nội bộ, hỗ trợ doanh nghiệp...); bản miễn phí (Community) vẫn đủ dùng cho cá nhân/nhóm nhỏ nhưng thiếu vài tính năng quản trị.
- **Cần quyền Administrator** cho hầu hết lệnh cài/gỡ — không phù hợp với môi trường máy bị khoá quyền chặt.

## So sánh ngắn gọn với winget và Scoop

| Tiêu chí | Chocolatey | winget | Scoop |
|---|---|---|---|
| Nhà phát hành | Cộng đồng (Chocolatey Software Inc.) | Microsoft (chính thức, có sẵn từ Windows 10/11 mới) | Cộng đồng |
| Cài đặt | Cần chạy script cài riêng | Có sẵn trên Windows 10/11 bản mới (App Installer) | Cần chạy script cài riêng |
| Cần quyền Admin? | Có (đa số package) | Tuỳ package, nhiều package cài user-level | Không — cài vào thư mục user, không cần Admin |
| Kho package | Rất lớn, cộng đồng đóng góp | Đang phát triển, ngày càng đầy đủ, có kiểm duyệt từ Microsoft | Nhỏ hơn, tập trung vào công cụ dòng lệnh/dev tool |
| Ứng dụng GUI (Chrome, VS Code...) | Hỗ trợ tốt | Hỗ trợ tốt | Hạn chế, chủ yếu CLI tool |
| Tự động hoá bằng script | Rất mạnh (`packages.config`, PowerShell) | Hỗ trợ qua file `.json` export/import | Hỗ trợ qua `scoop export`/`import` |

Không có công cụ nào "thắng tuyệt đối" — `winget` tiện vì có sẵn trên Windows và do Microsoft duy trì, `Scoop` gọn nhẹ và không cần quyền Admin (hợp cho công cụ dev cá nhân), còn **Chocolatey vẫn có kho package lớn nhất và hệ sinh thái tự động hoá trưởng thành nhất** — nhiều tool CI/CD, script provisioning máy ảo Windows vẫn mặc định hỗ trợ Chocolatey đầu tiên.

## Kết luận — khi nào nên dùng Chocolatey?

Chocolatey phù hợp nhất khi bạn:

- Thường xuyên phải **setup lại máy Windows** (máy cá nhân, máy đồng nghiệp mới, máy ảo test) và muốn làm việc đó nhanh, nhất quán.
- Cần **tự động hoá provisioning** trong script CI/CD hoặc công cụ như Ansible/Packer để dựng image Windows.
- Muốn **cập nhật hàng loạt** phần mềm đang cài trên máy mà không phải kiểm tra từng cái thủ công.
- Cần một phần mềm hiếm/cũ mà `winget` hoặc `Scoop` chưa có sẵn — khả năng cao Chocolatey đã có.

Nếu chỉ thỉnh thoảng cài 1-2 phần mềm và dùng Windows 11 bản mới, `winget` có sẵn sẵn và không cần cài thêm gì cũng là lựa chọn hợp lý. Nhưng một khi đã quen với việc gõ `choco install` thay vì lục lại từng trang tải phần mềm, rất khó quay lại cách làm thủ công — đặc biệt là lúc cần dựng lại một chiếc máy Windows từ số 0.

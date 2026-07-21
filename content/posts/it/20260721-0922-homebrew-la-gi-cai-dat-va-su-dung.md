+++
date        = '2026-07-21T09:22:00+07:00'
draft       = true
title       = 'Homebrew là gì? Hướng dẫn cài đặt và sử dụng cho người mới bắt đầu'
slug        = 'homebrew-la-gi-cai-dat-va-su-dung'
summary     = 'Homebrew là trình quản lý gói giúp cài đặt, cập nhật và gỡ phần mềm trên macOS/Linux chỉ bằng một dòng lệnh, thay vì tải file cài đặt thủ công. Bài viết hướng dẫn từ cài đặt, các lệnh cốt lõi (install, update, upgrade, search...), cài ứng dụng GUI bằng Cask, đến các tip nâng cao như Brewfile và tap — dành cho người mới bắt đầu.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
categories  = ['it']
subcategories = ['tips-tricks']
tags        = ['homebrew', 'macos', 'terminal', 'cli', 'package-manager']
series      = []
authors     = ['Nguyen Chung']
+++

Mở một MacBook mới tinh, việc đầu tiên nhiều developer làm không phải là mở App Store, mà là mở Terminal và gõ một dòng lệnh để cài Homebrew. Đó là vì macOS không đi kèm sẵn trình quản lý gói nào cho dân lập trình — và Homebrew đã lấp đầy khoảng trống đó suốt hơn một thập kỷ qua. Bài viết này đưa bạn từ con số 0: Homebrew là gì, cài đặt ra sao, dùng những lệnh nào hằng ngày, và vài tip giúp bạn dùng nó thuần thục hơn.

## Homebrew là gì?

**Homebrew** là một **trình quản lý gói (package manager)** mã nguồn mở dành cho macOS và Linux, cho phép cài đặt, cập nhật và gỡ bỏ phần mềm dòng lệnh (và cả ứng dụng GUI) chỉ bằng một dòng lệnh trong Terminal — thay vì phải lên từng trang chủ, tải file `.dmg`/`.pkg`, rồi kéo thả vào `Applications`.

Homebrew ra đời năm 2009, do Max Howell tạo ra, với khẩu hiệu nổi tiếng:

> "The Missing Package Manager for macOS (or Linux)" — trình quản lý gói còn thiếu của macOS (hoặc Linux).

Mỗi phần mềm trong Homebrew được mô tả bằng một **formula** — một file Ruby ngắn gọn định nghĩa: tải source/binary ở đâu, build như thế nào, phụ thuộc (dependency) vào gói nào khác. Khi gõ `brew install git`, Homebrew đọc formula của `git` rồi tự động tải và cài luôn mọi dependency cần thiết.

### Dùng Homebrew để làm gì?

- Cài công cụ dòng lệnh cho dev: `git`, `node`, `python`, `wget`, `jq`, `ffmpeg`...
- Cài ngôn ngữ lập trình & runtime, có thể chọn version: `node@18`, `python@3.11`...
- Cài ứng dụng GUI qua **Cask**: VS Code, Chrome, Docker Desktop, Slack...
- Cài và quản lý các service chạy nền: PostgreSQL, Redis, MySQL... (qua `brew services`)
- Đồng bộ danh sách phần mềm giữa nhiều máy bằng **Brewfile**

### Vì sao nên dùng Homebrew?

- **macOS không có sẵn package manager.** Không như Ubuntu có `apt` hay Fedora có `dnf`, macOS chỉ có App Store (chỉ chứa ứng dụng GUI). Homebrew lấp đầy khoảng trống này cho dân dòng lệnh.
- **Nhanh, gọn, một lệnh cho mọi thao tác.** Không cần tìm installer trên mạng, không cần nhớ mình đã cài phần mềm nào bằng cách nào.
- **Tự động xử lý dependency.** Cài `ffmpeg` sẽ tự kéo theo hàng chục thư viện nó cần, không phải tự lo.
- **Dễ gỡ sạch, dễ update.** `brew uninstall` gỡ đúng những gì đã cài, không để lại rác như một số installer `.pkg`.
- **Cộng đồng cực lớn.** Hàng chục nghìn formula và cask, cập nhật liên tục, hầu như phần mềm phổ biến nào cũng có.
- **Minh bạch, mã nguồn mở.** Formula là script Ruby, ai cũng đọc được nó làm gì trước khi cài.

## Yêu cầu hệ thống

### macOS

- Phiên bản macOS còn được Apple hỗ trợ (khuyến nghị 3 bản mới nhất). Bản cũ hơn vẫn có thể chạy nhưng không được test chính thức.
- **Xcode Command Line Tools** — bộ công cụ biên dịch (Clang, Make, Git...) mà nhiều formula cần để build từ source. Không cần cài full Xcode (vài chục GB), chỉ cần bộ Command Line Tools (vài trăm MB).
- Chip **Intel** hay **Apple Silicon** (M1/M2/M3/M4) đều dùng được — chỉ khác nhau ở thư mục cài đặt (nói kỹ ở phần dưới).

Cài Xcode Command Line Tools:

```bash
xcode-select --install
```

Một hộp thoại sẽ hiện ra để xác nhận cài đặt. Nếu máy đã có sẵn, lệnh trên sẽ báo là đã cài rồi.

### Linux

- Hầu hết distro phổ biến: Ubuntu, Debian, Fedora, CentOS...
- Cần có sẵn `git`, `curl` và bộ công cụ build cơ bản (`gcc`, `make`) — trên Ubuntu/Debian cài nhanh bằng:

```bash
sudo apt-get install build-essential curl file git
```

- Homebrew trên Linux (trước đây gọi là "Linuxbrew", nay đã hợp nhất chính thức vào Homebrew) cài vào thư mục riêng `/home/linuxbrew/.linuxbrew`, không đụng tới package manager gốc của distro (`apt`, `dnf`...).
- WSL (Windows Subsystem for Linux) cũng dùng được, coi như một máy Linux bình thường.

## Cài đặt Homebrew

### Câu lệnh cài đặt

Chạy lệnh chính thức từ [brew.sh](https://brew.sh) trong Terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Lệnh này tải script cài đặt chính thức từ GitHub của Homebrew rồi chạy bằng `bash`. Script sẽ:

1. Kiểm tra hệ điều hành, kiểm tra Xcode Command Line Tools (macOS) và tự đề nghị cài nếu thiếu.
2. Hỏi nhấn `Enter` để xác nhận, có thể hỏi mật khẩu tài khoản (sudo) để tạo thư mục cài đặt.
3. Tải và giải nén Homebrew vào đúng thư mục theo hệ điều hành/chip.
4. In ra một mục **"Next steps"** — bước khá quan trọng, xem phần dưới.

> Luôn cài Homebrew qua đúng lệnh trên trang [brew.sh](https://brew.sh), tránh copy lệnh cài từ nguồn không rõ ràng vì đây là script chạy với quyền cao trên máy.

### Thư mục cài đặt theo từng nền tảng

| Nền tảng | Thư mục cài đặt |
|---|---|
| macOS – Apple Silicon (M1/M2/M3/M4) | `/opt/homebrew` |
| macOS – Intel | `/usr/local` |
| Linux | `/home/linuxbrew/.linuxbrew` |

### Thêm Homebrew vào PATH (đặc biệt quan trọng trên Apple Silicon)

Trên Apple Silicon, Homebrew cài ở `/opt/homebrew` — thư mục này **không** nằm sẵn trong `PATH`, nên ngay sau khi cài, gõ `brew` sẽ báo `command not found`. Đây là điểm người mới hay bị vướng nhất.

Script cài đặt thường tự in ra đúng lệnh cần chạy, nhưng nếu bỏ lỡ, hãy tự thêm bằng tay. Với shell mặc định của macOS hiện nay là **zsh**:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Nếu dùng **Intel Mac**, đường dẫn là `/usr/local/bin/brew`:

```bash
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/usr/local/bin/brew shellenv)"
```

Nếu dùng **bash** thay vì zsh, thay `~/.zprofile` bằng `~/.bash_profile` (hoặc `~/.bashrc` trên Linux).

Trên **Linux**, thêm dòng tương tự vào `~/.bashrc`:

```bash
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
```

`brew shellenv` in ra các biến môi trường cần thiết (thêm `PATH`, `MANPATH`...); `eval` áp dụng chúng ngay cho phiên Terminal hiện tại, còn dòng `echo ... >>` ghi vào file cấu hình shell để các phiên Terminal sau tự động có Homebrew trong `PATH`.

### Kiểm tra sau khi cài

```bash
brew --version     # in ra version Homebrew đang cài
which brew          # phải trỏ đúng /opt/homebrew/bin/brew (Apple Silicon) hoặc /usr/local/bin/brew (Intel)
brew doctor         # chẩn đoán cấu hình hệ thống
```

Nếu mọi thứ ổn, `brew doctor` sẽ in ra:

```
Your system is ready to brew.
```

Nếu thấy `command not found: brew` dù cài xong, gần như chắc chắn là do chưa nạp `PATH` — đóng mở lại Terminal, hoặc chạy lại lệnh `eval "$(... brew shellenv)"` ở trên.

## Các lệnh cơ bản

Đây là những lệnh sẽ dùng mỗi ngày:

| Lệnh | Chức năng |
|---|---|
| `brew install <tên-gói>` | Cài một gói phần mềm |
| `brew uninstall <tên-gói>` | Gỡ một gói đã cài |
| `brew update` | Cập nhật chính Homebrew + danh sách formula mới nhất |
| `brew upgrade [tên-gói]` | Nâng cấp gói đã cài lên bản mới nhất (không ghi tên = upgrade tất cả) |
| `brew search <từ-khoá>` | Tìm gói theo tên hoặc từ khoá |
| `brew list` | Liệt kê tất cả gói đang cài |
| `brew info <tên-gói>` | Xem thông tin chi tiết về một gói |
| `brew doctor` | Kiểm tra và chẩn đoán vấn đề cấu hình |

Ví dụ dùng thực tế:

```bash
brew install wget           # cài wget
brew list                   # xem đã cài những gì
brew info wget               # xem version, dependency, mô tả của wget
brew uninstall wget          # gỡ wget
```

### Phân biệt `update` và `upgrade` — điểm hay nhầm nhất

Đây là chỗ hầu như ai mới dùng Homebrew cũng nhầm ít nhất một lần:

- **`brew update`** — cập nhật **chính Homebrew** và làm mới danh sách formula (giống `git pull` kho công thức về máy). Nó **không** cài bản mới cho phần mềm đã có.
- **`brew upgrade`** — dùng danh sách formula mới nhất đó để **nâng cấp phần mềm đã cài** lên version mới.

Quy trình chuẩn để cập nhật toàn bộ hệ thống:

```bash
brew update      # 1. làm mới danh sách công thức
brew upgrade     # 2. nâng cấp mọi gói đã cài lên bản mới nhất
```

Muốn xem trước phần mềm nào đang cũ mà chưa upgrade:

```bash
brew outdated
```

## Cask — cài ứng dụng GUI

**Cask** là phần mở rộng của Homebrew dùng để cài các **ứng dụng có giao diện (GUI)** trên macOS — những app trước đây phải tải file `.dmg`/`.pkg` rồi kéo thả vào `Applications`.

Cú pháp chỉ thêm cờ `--cask` vào lệnh quen thuộc:

```bash
brew install --cask <tên-app>
```

Ví dụ thực tế — cài một bộ công cụ dev cơ bản:

```bash
brew install --cask visual-studio-code   # VS Code
brew install --cask google-chrome        # Google Chrome
brew install --cask docker               # Docker Desktop
brew install --cask iterm2               # iTerm2 (terminal thay thế)
brew install --cask slack                # Slack
```

Các lệnh khác cũng dùng chung "họ" với formula, chỉ cần thêm `--cask`:

```bash
brew uninstall --cask visual-studio-code   # gỡ app
brew list --cask                           # liệt kê cask đã cài
brew search --cask notion                  # tìm cask theo tên
brew upgrade --cask                        # nâng cấp mọi cask đã cài
```

> Từ các bản Homebrew gần đây, `brew search` đã tự tìm trong cả formula lẫn cask cùng lúc, nên không nhất thiết phải nhớ thêm `--cask` khi tìm kiếm — nhưng vẫn cần `--cask` khi `install`/`uninstall`.

Cask chỉ hoạt động đầy đủ trên **macOS** (vì đây là app đóng gói `.app`); trên Linux, phần mềm GUI vẫn nên cài qua package manager gốc của distro (`apt`, `dnf`...) như bình thường.

## Quản lý phiên bản và dọn dẹp

### Dọn dẹp với `brew cleanup`

Sau một thời gian dùng, Homebrew giữ lại cache tải về và các bản cũ của gói đã upgrade — khá tốn dung lượng. Dọn bằng:

```bash
brew cleanup             # xoá cache cũ và bản cũ của gói đã upgrade
brew cleanup -n           # xem trước sẽ xoá gì, chưa xoá thật (dry-run)
brew cleanup --prune=all  # dọn triệt để, kể cả cache còn hạn giữ lại
```

Xem Homebrew đang chiếm bao nhiêu dung lượng:

```bash
du -sh $(brew --cache)
```

### Ghim phiên bản với `brew pin`

Có lúc cần **giữ nguyên version** của một gói (ví dụ project yêu cầu đúng `node@18`, upgrade lên bản mới sẽ hỏng), dùng:

```bash
brew pin node        # ghim node ở version hiện tại
brew upgrade          # upgrade các gói khác, node được bỏ qua
brew unpin node       # bỏ ghim khi muốn upgrade lại bình thường
```

Muốn cài hẳn một version cụ thể (nếu formula có hỗ trợ versioned), dùng tên kèm version:

```bash
brew install node@18
brew install python@3.11
```

### Lỗi thường gặp

| Lỗi | Nguyên nhân & cách xử lý |
|---|---|
| `zsh: command not found: brew` | Chưa nạp `PATH`. Chạy lại `eval "$(brew shellenv)"` hoặc mở Terminal mới |
| `Error: Cannot install X because conflicting formulae are installed` | Có gói khác xung đột — gỡ gói cũ hoặc dùng `brew link --overwrite <tên-gói>` |
| `Permission denied` khi install/upgrade | Thường do thư mục Homebrew từng bị cài/chỉnh bằng `sudo`. Tránh dùng `sudo` với `brew`; nếu dính lỗi quyền, làm theo hướng dẫn cụ thể mà `brew doctor` in ra |
| `brew doctor` báo warning symlink/file lạ | Làm theo đúng gợi ý `brew doctor` in ra — thường chỉ cần xoá/di chuyển file được liệt kê |
| Cask báo app "is damaged and can't be opened" | Thường gặp trên macOS sau khi cài cask — thử gỡ và cài lại bằng `brew reinstall --cask <app>` |

> Nguyên tắc chung: **không** chạy `brew` với `sudo`. Homebrew được thiết kế để cài vào thư mục thuộc quyền sở hữu của user, chạy bằng `sudo` dễ gây lỗi quyền truy cập rất khó gỡ về sau.

## Tips nâng cao

### Brewfile — backup và đồng bộ danh sách package

**Brewfile** là một file khai báo toàn bộ formula, cask và tap đang dùng — hữu ích khi cài lại máy mới hoặc đồng bộ môi trường giữa nhiều máy/team.

Xuất Brewfile từ những gì đang cài trên máy hiện tại:

```bash
brew bundle dump          # tạo file Brewfile ở thư mục hiện tại
brew bundle dump --force  # ghi đè nếu Brewfile đã tồn tại
```

File `Brewfile` sinh ra trông như thế này:

```ruby
tap "homebrew/bundle"
brew "git"
brew "node"
brew "wget"
cask "visual-studio-code"
cask "docker"
cask "iterm2"
```

Trên máy mới (hoặc sau khi cài lại hệ điều hành), cài lại toàn bộ chỉ với:

```bash
brew bundle install
```

Vài lệnh hữu ích khác:

```bash
brew bundle check     # kiểm tra máy hiện tại còn thiếu gói nào so với Brewfile
brew bundle cleanup   # gỡ những gói KHÔNG có trong Brewfile (cẩn thận khi dùng)
```

> Gợi ý: commit file `Brewfile` vào dotfiles repo cá nhân — mỗi lần setup máy mới chỉ cần `brew bundle install` là có đủ toàn bộ công cụ quen thuộc.

### Brewfile mẫu — tải về và dùng ngay

Để dễ hình dung, đây là Brewfile thật mình đang dùng hằng ngày — gồm các công cụ dev cơ bản (Git, mise, VS Code, Docker Desktop, Postman...), vài extension VS Code cài kèm, và cả Calibre để quản lý sách điện tử:

[⬇ Tải Brewfile mẫu](/files/homebrew/Brewfile)

Cài đặt nhanh chỉ với vài bước:

```bash
# 1. Tải file về thư mục hiện tại
curl -fsSL https://ndchungict.github.io/files/homebrew/Brewfile -o Brewfile

# 2. (Tuỳ chọn) Xem trước sẽ cài những gì, chưa cài gì cả
brew bundle check --file=./Brewfile

# 3. Cài toàn bộ
brew bundle install --file=./Brewfile
```

> File mẫu này có cả dòng `vscode "..."` để cài extension VS Code qua Homebrew — cần bật CLI `code` trước (mở VS Code → Command Palette → "Shell Command: Install 'code' command in PATH") thì `brew bundle` mới cài được các dòng này. Dòng nào không cần, cứ xoá hoặc thêm `#` để comment lại trước khi cài.

### Tap — thêm kho phần mềm bên thứ ba

**Tap** là một "kho" (repository) chứa formula/cask, ngoài kho chính thức mà Homebrew đã cài sẵn. Một số công ty hoặc dự án phát hành phần mềm riêng qua tap của họ.

```bash
brew tap <user>/<repo>           # thêm một tap
brew tap homebrew/cask-versions  # tap chính thức chứa các bản cũ/beta của nhiều app
brew untap <user>/<repo>         # gỡ một tap
brew tap                         # liệt kê các tap đang có
```

Sau khi tap, cài gói trong đó như bình thường bằng `brew install`.

### Vài lệnh khác đáng biết

```bash
brew leaves                 # liệt kê gói chủ động cài (không phải dependency của gói khác)
brew services list          # xem các service (postgresql, redis...) đang chạy nền
brew services start redis   # khởi động một service nền
brew deps <tên-gói>          # xem cây dependency của một gói
```

## Kết

Homebrew biến việc cài đặt phần mềm trên macOS/Linux từ "tải file, kéo thả, dò dependency thủ công" thành một dòng lệnh duy nhất — và làm điều đó cho cả công cụ dòng lệnh lẫn ứng dụng GUI (qua Cask). Với người mới, chỉ cần nhớ vòng lặp quen thuộc `install → update → upgrade → cleanup` là đủ dùng tốt cho công việc hằng ngày.

Nếu mới cài máy: chạy lệnh cài đặt, nhớ thêm `brew shellenv` vào `PATH`, chạy `brew doctor` để chắc chắn mọi thứ sẵn sàng, rồi cài vài công cụ quen thuộc (`git`, `wget`, VS Code...). Khi đã quen tay, hãy thử `brew bundle dump` để có một `Brewfile` backup — công cụ nhỏ nhưng sẽ tiết kiệm rất nhiều thời gian cho lần setup máy tiếp theo.

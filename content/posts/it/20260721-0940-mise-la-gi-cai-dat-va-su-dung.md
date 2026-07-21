+++
date        = '2026-07-21T09:40:00+07:00'
draft       = false
title       = 'Mise là gì? Hướng dẫn cài đặt và sử dụng cho người mới bắt đầu'
slug        = 'mise-la-gi-cai-dat-va-su-dung'
summary     = 'Mise (mise-en-place, trước đây là rtx) là công cụ quản lý phiên bản ngôn ngữ lập trình và công cụ dòng lệnh, thay thế asdf/nvm/pyenv/rbenv bằng một file cấu hình duy nhất. Bài viết hướng dẫn cài đặt, các lệnh cốt lõi, quản lý version/env theo project, chạy task kiểu Makefile, cài plugin cho tool lạ, đến cách migrate từ asdf và dùng trong CI/CD.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
columns     = 2
categories  = ['it']
subcategories = ['tips-tricks']
tags        = ['mise', 'asdf', 'nodejs', 'python', 'version-manager']
series      = []
authors     = ['Nguyen Chung']
+++

Nếu bạn từng vật lộn với việc máy có Node 18 nhưng project A cần Node 20 còn project B cần Node 16, hay cài Python qua `pyenv` rồi cài Ruby qua `rbenv`, cài Terraform qua một công cụ khác nữa — mỗi ngôn ngữ một trình quản lý version riêng — thì `mise` sinh ra để giải quyết đúng vấn đề đó. Bài viết này giới thiệu mise từ con số 0: nó là gì, cài đặt ra sao, quản lý version/biến môi trường/task theo từng project như thế nào, và khi nào nên chọn nó thay vì asdf, nvm hay pyenv.

## Mise là gì?

**mise** (đọc là "meez", lấy tinh thần từ *mise en place* — thuật ngữ nấu ăn kiểu Pháp nghĩa là "mọi thứ vào đúng vị trí trước khi bắt tay vào nấu") là một **trình quản lý phiên bản đa ngôn ngữ (polyglot version manager)**, kiêm luôn quản lý biến môi trường và task runner, chạy trên dòng lệnh. Dự án trước đây có tên **rtx**, đổi tên thành `mise` từ năm 2023 vì vướng vấn đề trùng thương hiệu.

Nói ngắn gọn, mise cho phép:

- Cài và chuyển đổi qua lại giữa nhiều **version của Node.js, Python, Ruby, Go, Java...** theo từng thư mục project.
- Khai báo version đó trong **một file cấu hình duy nhất** (`.mise.toml`) commit cùng source code, để cả team và CI dùng chung đúng version.
- Quản lý **biến môi trường** (`.env`) tự động theo từng project.
- Định nghĩa và chạy **task** (build, test, dev...) giống `Makefile` hay `npm scripts`, nhưng dùng chung được cho mọi ngôn ngữ.

### Vấn đề mise giải quyết

Hình dung một máy dev "thực chiến":

```
Project A (cũ)     → cần Node 16, Python 2.7
Project B (mới)    → cần Node 20, Python 3.12
Project C (khách)  → cần Ruby 3.1, Go 1.20
```

Không có version manager, máy chỉ có một bản Node/Python/Ruby cài cố định — đổi qua lại giữa các project là ác mộng. Trước đây, mỗi ngôn ngữ giải quyết việc này bằng một công cụ riêng: `nvm` cho Node, `pyenv` cho Python, `rbenv` cho Ruby... Mỗi công cụ một cú pháp, một cách cấu hình, một dòng activate riêng trong `.zshrc`.

**mise gộp tất cả các công cụ đó thành một** — một lệnh, một file cấu hình, một cách hoạt động chung cho mọi ngôn ngữ.

### So sánh nhanh với asdf, nvm, pyenv

| Tiêu chí | mise | asdf | nvm | pyenv |
|---|---|---|---|---|
| Ngôn ngữ hỗ trợ | Đa ngôn ngữ (polyglot) | Đa ngôn ngữ (qua plugin) | Chỉ Node.js | Chỉ Python |
| Viết bằng | Rust — khởi động, resolve version rất nhanh | Bash — dùng shim, chậm hơn rõ rệt | Bash | Bash |
| Cần cài plugin riêng? | Không với tool "core" (Node, Python, Ruby, Go...); cần plugin cho tool ít phổ biến | Luôn cần cài plugin cho từng ngôn ngữ | Không áp dụng | Không áp dụng |
| Quản lý biến môi trường | Có sẵn (`[env]`, đọc `.env`) | Không (phải cài thêm `direnv`) | Không | Không |
| Chạy task/script | Có sẵn (`mise tasks`) | Không | Không | Không |
| File cấu hình | `.mise.toml` (đọc được cả `.tool-versions` của asdf) | `.tool-versions` | `.nvmrc` | `.python-version` |

> mise được thiết kế **tương thích ngược với asdf** — đọc được file `.tool-versions` và toàn bộ hệ sinh thái plugin của asdf, nên chuyển từ asdf sang gần như không tốn công (xem phần Tips nâng cao).

## Yêu cầu hệ thống

- **macOS** và **Linux** — hỗ trợ đầy đủ, mọi distro phổ biến.
- **Windows** — dùng tốt nhất qua **WSL** (Windows Subsystem for Linux), coi như một máy Linux bình thường. mise cũng có bản cài native cho Windows (qua `winget`/`scoop`) nhưng một số tính năng (activate theo shell, shim) hợp với môi trường Unix-like hơn.
- **Shell** được hỗ trợ: `bash`, `zsh`, `fish` (và một số shell khác như `nushell`, `PowerShell` ở mức cơ bản hơn).

## Cài đặt mise

### Cách 1 — Script cài đặt (nhanh nhất)

```bash
curl https://mise.run | sh
```

Đây là cách được khuyến nghị chính thức, tự tải bản mise phù hợp với hệ điều hành/kiến trúc CPU và cài vào `~/.local/bin`.

### Cách 2 — Homebrew (macOS/Linux)

```bash
brew install mise
```

Phù hợp nếu máy đã có sẵn Homebrew.

### Cách 3 — Cargo (nếu đã có Rust toolchain)

```bash
cargo install mise
```

Cách này build từ source bằng Rust, phù hợp nếu máy đã có sẵn `cargo` và muốn luôn dùng bản mới nhất.

> mise còn có gói cài riêng cho `apt`, `dnf`, `pacman`... trên Linux, hoặc `winget`/`scoop` trên Windows — xem chi tiết trên trang chủ chính thức nếu cần.

### Kích hoạt mise trong shell (activate)

Cài xong chưa dùng được ngay — cần "activate" để mise tự động chèn đúng version tool vào `PATH` mỗi khi đổi thư mục. Thêm dòng tương ứng vào file cấu hình shell:

```bash
# zsh — thêm vào ~/.zshrc
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc

# bash — thêm vào ~/.bashrc
echo 'eval "$(mise activate bash)"' >> ~/.bashrc

# fish — thêm vào ~/.config/fish/config.fish
echo 'mise activate fish | source' >> ~/.config/fish/config.fish
```

Sau đó mở lại Terminal (hoặc `source ~/.zshrc`) để áp dụng.

### Kiểm tra sau khi cài

```bash
mise --version
mise doctor
```

`mise doctor` kiểm tra shell đã activate đúng chưa, `PATH` có vấn đề gì không — giống `brew doctor` của Homebrew.

## Các lệnh cơ bản

| Lệnh | Chức năng |
|---|---|
| `mise install` | Cài tool theo cấu hình hiện tại (đọc `.mise.toml`/`.tool-versions`) |
| `mise install node@20` | Cài một version cụ thể, chưa set làm version dùng |
| `mise use node@20` | Cài (nếu chưa có) **và** set làm version dùng cho project hiện tại |
| `mise ls` | Liệt kê tool + version đã cài trên máy |
| `mise current` | Xem version đang active cho từng tool tại thư mục hiện tại |
| `mise uninstall node@18` | Gỡ một version cụ thể |
| `mise doctor` | Chẩn đoán vấn đề cấu hình/cài đặt |

Ví dụ dùng thực tế:

```bash
mise install node@20.11.0    # cài Node 20.11.0
mise use node@20              # set Node 20 cho project hiện tại (ghi vào .mise.toml)
mise current                  # xem version đang active
mise ls                       # xem tất cả tool + version đã cài
mise ls-remote node            # xem các version Node có thể cài
mise uninstall node@18.0.0     # gỡ version không dùng nữa
```

## Quản lý phiên bản theo project

### `.mise.toml` — file cấu hình chính

Chạy `mise use node@20` trong thư mục project sẽ tự tạo (hoặc cập nhật) file `.mise.toml`:

```toml
[tools]
node = "20"
python = "3.12"
ruby = "3.3.0"
go = "1.22"
```

Mỗi khi `cd` vào thư mục có file này (hoặc thư mục con của nó), mise tự động đưa đúng version vào `PATH`. Ra khỏi thư mục, version global tự quay lại — không cần bật/tắt thủ công.

### Tương thích `.tool-versions` (định dạng của asdf)

Nếu project đã dùng asdf từ trước, mise đọc thẳng file `.tool-versions` không cần đổi gì:

```
nodejs 20.11.0
python 3.12.1
ruby 3.3.0
```

### Local vs Global

- **Local** (`mise use node@20`) — ghi vào `.mise.toml` trong thư mục hiện tại, chỉ áp dụng cho project đó.
- **Global** (`mise use -g node@20`) — ghi vào file cấu hình global `~/.config/mise/config.toml`, dùng làm version **mặc định** cho mọi nơi không có `.mise.toml`/`.tool-versions` riêng.

```bash
mise use -g node@20    # set Node 20 làm mặc định toàn hệ thống
mise use node@18        # riêng project hiện tại dùng Node 18, ghi đè global
```

mise tìm cấu hình theo nguyên tắc: xuất phát từ thư mục hiện tại, đi ngược lên thư mục cha cho đến khi gặp `.mise.toml`/`.tool-versions` gần nhất; không thấy thì mới dùng global.

### Ví dụ với Node.js, Python, Ruby

```bash
mkdir demo-node && cd demo-node
mise use node@20
node -v            # v20.x.x — đúng version vừa set, không cần nvm

cd .. && mkdir demo-python && cd demo-python
mise use python@3.12
python -V           # Python 3.12.x

cd .. && mkdir demo-ruby && cd demo-ruby
mise use ruby@3.3
ruby -v              # ruby 3.3.x
```

Ba project, ba ngôn ngữ, ba version khác nhau — cùng tồn tại trên một máy, không xung đột, không cần nhớ `nvm use`/`pyenv local`/`rbenv local` riêng lẻ cho từng cái.

## Quản lý biến môi trường (env)

mise quản lý được cả biến môi trường theo project, thay luôn vai trò của `direnv` mà không cần cài thêm gì:

```toml
[env]
NODE_ENV = "development"
DATABASE_URL = "postgres://localhost/myapp_dev"

# tự nạp thêm biến từ file .env trong project
_.file = ".env"

# thêm thư mục vào PATH khi ở trong project này
_.path = ["./node_modules/.bin"]
```

Giải thích:

- Khai báo trực tiếp trong bảng `[env]` — biến tự có mặt khi `cd` vào thư mục, tự biến mất khi ra khỏi.
- `_.file = ".env"` — bảo mise tự đọc thêm biến từ file `.env` (định dạng `KEY=value` quen thuộc), không cần công cụ nào khác load nó.
- `_.path` — thêm thư mục vào đầu `PATH`, hữu ích để gọi thẳng binary trong `node_modules/.bin` mà không cần `npx`.

> Đừng commit file `.env` chứa secret thật lên Git — thêm `.env` vào `.gitignore`, chỉ commit `.env.example` làm mẫu.

## Chạy task với mise tasks

mise có sẵn một **task runner** tích hợp, định nghĩa trong `.mise.toml` — dùng thay `Makefile` hoặc `npm scripts` nhưng không giới hạn ở một ngôn ngữ:

```toml
[tasks.build]
description = "Build production bundle"
run = "npm run build"

[tasks.test]
description = "Chạy test suite"
run = "npm test"
depends = ["build"]

[tasks.dev]
description = "Chạy dev server"
run = "npm run dev"
```

Chạy task:

```bash
mise run build    # chạy task "build"
mise run test       # tự chạy "build" trước (vì khai báo depends), rồi mới "test"
mise tasks           # liệt kê toàn bộ task đang có
```

`depends` khai báo task nào phải chạy xong trước — mise tự sắp thứ tự, tương tự target dependency trong `Makefile`.

Với logic phức tạp hơn một dòng lệnh, tạo file script trong thư mục `mise-tasks/` (cấp quyền thực thi), mise tự nhận diện làm task theo tên file:

```bash
mkdir -p mise-tasks
cat > mise-tasks/deploy << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "Deploying..."
EOF
chmod +x mise-tasks/deploy

mise run deploy
```

## Plugin và registry

Các tool phổ biến (Node.js, Python, Ruby, Go, Java, Deno, Bun, Rust...) là **"core" backend** — viết sẵn bằng Rust, tích hợp thẳng trong mise, không cần cài gì thêm, tốc độ cài đặt rất nhanh.

Với tool ít phổ biến hơn, mise tương thích trực tiếp với **hệ sinh thái plugin của asdf** (hàng trăm plugin có sẵn):

```bash
mise plugins install terraform    # cài plugin theo tên trong registry của mise
mise plugins ls                    # xem plugin đã cài
mise plugins ls-remote              # xem toàn bộ plugin có sẵn

mise install terraform@1.7.0       # sau khi có plugin, cài version như bình thường
mise use terraform@1.7.0
```

Nếu plugin không có trong registry, cài trực tiếp từ URL Git của plugin đó:

```bash
mise plugins install my-tool https://github.com/<user>/asdf-my-tool
```

### Cài "vãng lai" không cần plugin — điểm mạnh riêng của mise

Ngoài plugin kiểu asdf, mise còn cài được tool trực tiếp qua nhiều "backend" khác chỉ bằng một tiền tố, không ai phải viết plugin trước:

```bash
mise use cargo:ripgrep                # cài qua cargo install
mise use npm:prettier                  # cài qua npm
mise use pipx:black                     # cài qua pipx
mise use go:golang.org/x/tools/gopls    # cài qua go install
mise use ubi:BurntSushi/ripgrep         # tải thẳng binary từ GitHub Releases
```

Đây là khác biệt lớn so với asdf: asdf luôn cần một plugin git repo được viết sẵn cho từng tool, còn mise có thể cài gần như bất kỳ CLI nào ngay lập tức.

## Tips nâng cao

### Migrate từ asdf sang mise

1. Cài mise song song, **chưa cần gỡ asdf ngay**.
2. Vì mise đọc thẳng `.tool-versions`, các project cũ chạy được ngay không cần sửa gì.
3. Thay dòng activate `asdf` trong `.zshrc`/`.bashrc` bằng `eval "$(mise activate zsh)"` (xem phần Cài đặt).
4. mise cài tool vào thư mục riêng (không dùng chung `~/.asdf`), nên cần chạy `mise install` để cài lại version theo `.tool-versions` — thường vẫn nhanh vì tải bản build sẵn.
5. Kiểm tra mọi project quen thuộc chạy ổn rồi mới gỡ asdf khỏi máy.

### Dùng trong CI/CD

mise có action chính thức cho GitHub Actions, tự cài mise và chạy `mise install` theo đúng cấu hình trong repo — CI dùng **chính xác cùng version** với máy dev:

```yaml
# .github/workflows/ci.yml
steps:
  - uses: actions/checkout@v4
  - uses: jdx/mise-action@v2
  - run: npm test
```

Không cần khai báo version Node/Python riêng trong workflow nữa — mise đọc thẳng từ `.mise.toml` đã commit cùng source code.

### Cấu hình global

File `~/.config/mise/config.toml` chứa version mặc định và các setting áp dụng cho toàn máy:

```toml
[tools]
node = "20"
python = "3.12"

[settings]
legacy_version_file = true    # tự đọc thêm .nvmrc, .python-version của project cũ
always_keep_download = false  # không giữ lại file cài đặt đã tải sau khi cài xong
```

`legacy_version_file = true` giúp mise tự nhận file version kiểu cũ (`.nvmrc`, `.python-version`...) ở những project chưa kịp chuyển sang `.mise.toml` — rất hữu ích khi migrate dần dần thay vì đổi hết một lúc.

### Config mẫu — tải về và dùng ngay

Đây là file `config.toml` (global config) mình đang dùng thật — cài sẵn Node.js LTS, Java (Temurin 21), Maven, Gradle, Python 3.13, Ruby, Deno, Flutter, Android SDK và cả Appium (qua npm):

[⬇ Tải config.toml mẫu](/files/mise/config.toml)

Cài đặt nhanh chỉ với vài bước:

```bash
# 1. Tạo thư mục cấu hình global của mise (nếu chưa có)
mkdir -p ~/.config/mise

# 2. Tải file về đúng vị trí global config
curl -fsSL https://ndchungict.github.io/files/mise/config.toml -o ~/.config/mise/config.toml

# 3. Cài toàn bộ tool khai báo trong file
mise install
```

> File mẫu này cài khá nhiều tool (Java, Flutter, Android SDK...) nên lần `mise install` đầu tiên có thể mất vài phút. Muốn dùng làm điểm khởi đầu rồi tinh chỉnh, mở file vừa tải, xoá bớt dòng nào không cần trước khi chạy `mise install`.

### Dùng chung Android SDK giữa mise và Android Studio

`android-sdk` trong file cấu hình mẫu ở trên là một tool hơi đặc biệt: nếu để **Android Studio tự tải SDK riêng** (qua wizard lúc mở lần đầu), các lệnh dòng lệnh như `adb`, `sdkmanager`, `emulator` sẽ **không** tự có trong `PATH` — phải tự thêm `ANDROID_HOME` và vài dòng `export PATH=...` vào `.zshrc` bằng tay.

Để mise lo luôn phần đó, dùng chung một bản SDK cho cả Terminal lẫn Android Studio:

```bash
mise use -g android-sdk@latest   # cài (nếu chưa có) — PATH/ANDROID_HOME tự động có sẵn
mise where android-sdk            # in ra đường dẫn SDK mise vừa cài
```

Copy đường dẫn đó, mở Android Studio → **Settings → Languages & Frameworks → Android SDK → Android SDK Location**, dán vào. Từ giờ:

- `adb`, `sdkmanager`, `emulator`... dùng được ngay trong Terminal nhờ mise activate, không cần tự sửa `PATH`.
- Vẫn mở **SDK Manager** trong Android Studio như bình thường để tick tải platform, build-tools, system image, NDK — tải "đầy đủ" qua giao diện quen thuộc, vào đúng thư mục mise quản lý.
- Chỉ có **một bản SDK duy nhất** dùng chung cho cả IDE lẫn CLI (Appium, Gradle, CI...), không lo lệch version giữa hai nơi.

## Kết

mise gộp việc quản lý version ngôn ngữ (thay `nvm`/`pyenv`/`rbenv`/`asdf`), biến môi trường (thay `direnv`) và chạy task (thay `Makefile`) vào **một công cụ, một file cấu hình duy nhất** — lại còn nhanh hơn hẳn nhờ viết bằng Rust và tương thích ngược với toàn bộ hệ sinh thái plugin của asdf.

Nên chuyển sang mise nếu bạn làm việc với nhiều ngôn ngữ/nhiều project có version khác nhau, muốn máy dev và CI luôn đồng bộ version, hoặc đã thấy asdf chậm và phải cài quá nhiều công cụ rời rạc. Nếu chỉ dùng đúng một ngôn ngữ và không quan tâm tốc độ, `nvm`/`pyenv` riêng lẻ vẫn ổn — nhưng mise là lựa chọn "chọn một lần, dùng cho mọi ngôn ngữ về sau".

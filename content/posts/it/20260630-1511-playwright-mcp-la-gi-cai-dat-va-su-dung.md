+++
date        = '2026-06-30T15:11:00+07:00'
draft       = false
title       = 'Playwright MCP là gì? Hướng dẫn cài đặt và sử dụng cho automation test'
slug        = 'playwright-mcp-la-gi-cai-dat-va-su-dung'
summary     = 'Playwright MCP biến trình duyệt thành một công cụ mà AI agent (Claude, Copilot, Cursor...) điều khiển trực tiếp qua accessibility tree — nhanh, xác định, không cần ảnh chụp. Bài viết giải thích kiến trúc, cài đặt cho từng client, danh sách tool, ví dụ thực chiến và lưu ý bảo mật cho team automation.'
thumbnail   = '/images/it/playwright-mcp-automation-test.webp'
featured    = false
categories  = ['it']
subcategories = ['automation', 'ai']
tags        = ['ai', 'playwright', 'mcp', 'test', 'automation']
series      = []
authors     = ['Nguyen Chung']
+++

Là người làm automation test, bạn đã quen với việc tự viết từng `locator`, từng `expect`. Nhưng khi các trợ lý AI (Claude, GitHub Copilot, Cursor...) bắt đầu tham gia vào quy trình test, có một câu hỏi thực tế: **làm sao để AI thật sự "nhìn thấy" và thao tác được trên trình duyệt** thay vì chỉ đoán mò từ ảnh chụp màn hình?

Đó chính là lý do **Playwright MCP** ra đời. Bài này viết cho cả team — từ người mới đến senior — để ai cũng cài được, hiểu được và dùng được nó vào việc thật: khám phá ứng dụng, sinh test, debug và tăng tốc công việc hằng ngày.

## MCP là gì? (đủ để hiểu, không lan man)

**MCP — Model Context Protocol** là một giao thức mở (do Anthropic khởi xướng) chuẩn hóa cách các ứng dụng AI kết nối với công cụ và dữ liệu bên ngoài. Hãy hình dung MCP như "cổng USB-C cho AI": thay vì mỗi tool tự chế một cách tích hợp riêng, tất cả nói chung một ngôn ngữ.

Một hệ MCP gồm hai phía:

- **MCP Client** — phần mềm AI bạn dùng (Claude Desktop, VS Code Copilot, Cursor, Claude Code...).
- **MCP Server** — tiến trình cung cấp **tools** (hành động) cho client gọi.

Playwright MCP chính là một **MCP server** mở ra các công cụ điều khiển trình duyệt cho AI.

## Playwright MCP là gì?

**Playwright MCP** (`@playwright/mcp`) là MCP server chính thức của Microsoft, cho phép AI agent điều khiển trình duyệt thật (Chromium, Firefox, WebKit) thông qua Playwright.

Điểm cốt lõi khiến nó khác biệt: **nó không dựa vào ảnh chụp màn hình**. Thay vào đó, mặc định nó dùng **accessibility tree** — cây cấu trúc ngữ nghĩa mà trình duyệt vốn dùng cho công nghệ trợ năng (screen reader).

```
   CÁCH CŨ (vision)                 PLAYWRIGHT MCP (snapshot)

  Screenshot ──▶ Model            Accessibility tree ──▶ Model
  "đoán" pixel, toạ độ            danh sách phần tử + role + ref
  chậm, dễ sai, tốn token         nhanh, xác định, ít token
```

Vì AI làm việc trên **dữ liệu có cấu trúc** (mỗi phần tử có `role`, tên, và một `ref` để tham chiếu) chứ không phải pixel, nên thao tác **nhanh, nhẹ và mang tính xác định** — đúng tinh thần auto-waiting của Playwright. Đây là khác biệt rất quan trọng với dân automation: kết quả lặp lại được, không "hên xui" như khi để model đoán toạ độ trên ảnh.

### Hai chế độ làm việc

| | Snapshot mode (mặc định) | Vision mode (`--vision`) |
|---|---|---|
| Đầu vào cho AI | Accessibility tree (text có cấu trúc) | Ảnh chụp màn hình |
| Cách định vị | Theo `ref` của phần tử | Theo toạ độ X/Y |
| Tốc độ & token | Nhanh, ít token | Chậm hơn, tốn token |
| Độ ổn định | Cao, xác định | Phụ thuộc model nhìn ảnh |
| Khi nào dùng | Hầu hết trường hợp | Canvas, ảnh, nội dung không có trong a11y tree |

> Khuyến nghị: dùng **snapshot mode** mặc định. Chỉ bật `--vision` khi cần thao tác với thứ không biểu diễn được bằng accessibility tree (vd canvas vẽ tay, game, biểu đồ).

## Vì sao team automation nên quan tâm?

- **Khám phá ứng dụng nhanh** — bảo AI mở trang, điền form, đi qua luồng nghiệp vụ để hiểu hành vi trước khi viết test.
- **Sinh test từ thao tác thật** — AI thao tác qua MCP rồi kết tinh thành file test Playwright (`.spec.ts`), thay vì bịa selector.
- **Debug & điều tra lỗi** — mở đúng trang đang lỗi, đọc console, kiểm tra network, mô tả lại vấn đề.
- **Self-healing / kiểm thử khám phá** — AI tự dò luồng, phát hiện nút gãy, trạng thái lạ.
- **Không cần cài đặt nặng** — chạy bằng `npx`, không phải dựng cả framework chỉ để thử nghiệm.

## Yêu cầu trước khi cài

- **Node.js 18 trở lên** (khuyến nghị LTS 20+).
- Một **MCP client**: Claude Desktop, VS Code (Copilot), Cursor, Claude Code, Windsurf... tùy team.
- Kết nối mạng để `npx` tải `@playwright/mcp` và Playwright tự tải browser ở lần chạy đầu.

Kiểm tra nhanh:

```bash
node -v   # >= 18
npx -v
```

## Cài đặt

Tất cả client đều dùng chung một ý tưởng: khai báo một MCP server tên `playwright` chạy bằng lệnh `npx @playwright/mcp@latest`. Khác nhau chỉ ở **nơi đặt cấu hình**.

### Cách 1 — VS Code (nhanh nhất)

VS Code có sẵn hỗ trợ MCP cho Copilot. Cài bằng một lệnh CLI:

```bash
code --add-mcp '{"name":"playwright","command":"npx","args":["@playwright/mcp@latest"]}'
```

Hoặc tạo file `.vscode/mcp.json` trong workspace:

```json
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Mở Copilot Chat ở chế độ **Agent**, server `playwright` sẽ xuất hiện trong danh sách tools.

### Cách 2 — Claude Desktop

Mở file cấu hình (`Settings → Developer → Edit Config`) và thêm vào mục `mcpServers`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Lưu lại và **khởi động lại Claude Desktop**. Khi thấy biểu tượng tools (🔨) là đã nhận server.

### Cách 3 — Cursor

`Settings → MCP → Add new MCP server`, hoặc tạo file `~/.cursor/mcp.json` (global) / `.cursor/mcp.json` (theo project):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Cách 4 — Claude Code (CLI)

```bash
claude mcp add playwright -- npx @playwright/mcp@latest
```

Kiểm tra: `claude mcp list` — thấy `playwright` là xong.

### Cách 5 — Chạy thử bằng tay (debug cấu hình)

Muốn xem server khởi động đúng không, chạy trực tiếp:

```bash
npx @playwright/mcp@latest --help
```

Lệnh này in ra toàn bộ tùy chọn dòng lệnh — rất hữu ích để tra cứu nhanh.

## Các tùy chọn cấu hình hay dùng

Thêm vào mảng `args` trong cấu hình. Một số tùy chọn quan trọng:

| Tùy chọn | Ý nghĩa |
|---|---|
| `--headless` | Chạy không hiện cửa sổ trình duyệt (mặc định là có giao diện) |
| `--browser <chromium\|firefox\|webkit\|msedge>` | Chọn trình duyệt |
| `--device "iPhone 15"` | Giả lập thiết bị |
| `--viewport-size "1280,720"` | Kích thước cửa sổ |
| `--vision` | Bật chế độ vision (thao tác theo ảnh/toạ độ) |
| `--isolated` | Phiên cô lập, không lưu state sau khi đóng |
| `--storage-state <path>` | Nạp sẵn cookie/localStorage (vd để đăng nhập trước) |
| `--user-data-dir <path>` | Thư mục profile để giữ đăng nhập giữa các lần chạy |
| `--save-trace` | Lưu Playwright trace để xem lại bằng Trace Viewer |
| `--output-dir <path>` | Nơi lưu file xuất ra (ảnh, trace...) |
| `--port <number>` | Chạy server qua HTTP/SSE thay vì stdio |
| `--caps <list>` | Bật thêm nhóm năng lực (vd `pdf`, `verify`...) |
| `--allowed-origins` / `--blocked-origins` | Giới hạn domain được phép truy cập |

Ví dụ cấu hình chạy headless với Chromium, lưu trace:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless",
        "--browser", "chromium",
        "--save-trace",
        "--output-dir", "./mcp-output"
      ]
    }
  }
}
```

## Các tool Playwright MCP cung cấp

AI sẽ tự gọi các tool này; bạn không gõ tay, nhưng hiểu chúng giúp bạn ra lệnh chính xác hơn. Nhóm chính:

**Điều hướng & quan sát**

- `browser_navigate` — mở một URL.
- `browser_navigate_back` — quay lại trang trước.
- `browser_snapshot` — chụp **accessibility snapshot** của trang (đây là "mắt" chính của AI).
- `browser_take_screenshot` — chụp ảnh màn hình (PNG/JPEG).

**Tương tác**

- `browser_click` — click vào phần tử (theo `ref` trong snapshot).
- `browser_type` — gõ chữ vào ô input.
- `browser_fill_form` — điền nhiều trường form một lần.
- `browser_select_option` — chọn trong dropdown.
- `browser_hover` — di chuột.
- `browser_press_key` — nhấn phím.
- `browser_drag` — kéo–thả.
- `browser_file_upload` — upload file.

**Tab & cửa sổ**

- `browser_tabs` — liệt kê / mở / đóng / chuyển tab.

**Chẩn đoán & chờ**

- `browser_console_messages` — đọc log console.
- `browser_network_requests` — xem các request mạng.
- `browser_wait_for` — chờ text/điều kiện xuất hiện hoặc biến mất.
- `browser_handle_dialog` — xử lý alert/confirm/prompt.
- `browser_evaluate` — chạy JavaScript trong trang.

> Tập tool có thể thay đổi theo phiên bản và theo `--caps` bạn bật. Dùng `--help` hoặc xem snapshot tools trong client để biết chính xác.

## Ví dụ thực chiến

### 1. Khám phá một luồng đăng nhập

Prompt cho AI agent:

> "Dùng Playwright MCP mở `https://example.com/login`, đăng nhập với user `qa@demo.com` / `Test@1234`, rồi mô tả lại các bước và những phần tử bạn đã tương tác."

AI sẽ tuần tự: `browser_navigate` → `browser_snapshot` → `browser_type` (email, password) → `browser_click` (nút Login) → `browser_snapshot` để xác nhận đã vào dashboard, rồi tóm tắt cho bạn.

### 2. Sinh test Playwright từ thao tác thật

> "Sau khi đi qua luồng đăng nhập ở trên, hãy viết một file `tests/login.spec.ts` dùng Playwright Test, với assertion kiểm tra URL chuyển sang `/dashboard` và hiển thị tên user."

Vì AI vừa **thực sự** đi qua luồng và biết selector/role thật, test sinh ra bám sát DOM thực tế chứ không phải selector bịa.

```ts
import { test, expect } from '@playwright/test';

test('đăng nhập thành công', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.getByLabel('Email').fill('qa@demo.com');
  await page.getByLabel('Password').fill('Test@1234');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: /Xin chào/ })).toBeVisible();
});
```

### 3. Debug một trang đang lỗi

> "Mở `https://example.com/checkout`, kiểm tra console có lỗi gì không và liệt kê các request mạng bị fail."

AI gọi `browser_console_messages` và `browser_network_requests`, rồi tổng hợp lại các lỗi 4xx/5xx và exception JS — tiết kiệm rất nhiều thời gian dò tay.

### 4. Đăng nhập sẵn bằng storage state

Nếu luồng đăng nhập phức tạp (OTP, SSO), hãy đăng nhập một lần và lưu state, rồi nạp lại qua `--storage-state` để AI bắt đầu từ trạng thái đã đăng nhập — vừa nhanh vừa tránh lộ mật khẩu trong prompt.

## Chạy như HTTP/SSE server (cho team & CI)

Mặc định Playwright MCP chạy qua **stdio** (client tự spawn tiến trình). Nhưng bạn có thể chạy nó như một **server HTTP** để nhiều client cùng kết nối, hoặc dùng trong môi trường CI/container:

```bash
npx @playwright/mcp@latest --headless --port 8931
```

Sau đó trỏ client tới endpoint đó:

```json
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:8931/sse"
    }
  }
}
```

Cách này hợp với việc đóng gói trong Docker, chạy headless trên server CI, hoặc chia sẻ một browser session cho nhiều người.

## Lưu ý bảo mật & vận hành (góc nhìn senior)

- **Không dán secret thật vào prompt.** Dùng `--storage-state` hoặc tài khoản test riêng. Mọi thứ trong prompt có thể bị log lại.
- **Giới hạn domain** bằng `--allowed-origins` / `--blocked-origins` để AI không lang thang ra ngoài phạm vi cho phép.
- **Chỉ trỏ vào môi trường test/staging**, tuyệt đối không để AI thao tác tự do trên production.
- **Dùng `--isolated` cho CI** để mỗi lần chạy là một phiên sạch, không rò state giữa các test.
- **MCP không thay thế bộ test có chủ đích.** Nó mạnh ở khám phá, sinh nháp và debug; còn regression suite vẫn cần được review và version hóa như code thật.
- **Pin phiên bản** (`@playwright/mcp@<version>`) cho môi trường cần ổn định, thay vì `@latest`.

## Kết

Playwright MCP là cây cầu nối giữa **năng lực điều khiển trình duyệt đáng tin cậy của Playwright** và **khả năng suy luận của AI agent**. Nhờ làm việc trên accessibility tree thay vì pixel, nó cho ra kết quả nhanh và xác định — đúng thứ dân automation cần.

Hãy bắt đầu nhỏ: cài cho VS Code hoặc Claude Desktop, bảo AI khám phá một luồng quen thuộc, rồi để nó sinh test cho bạn xem lại. Khi cả team quen tay, đây sẽ là một công cụ tăng tốc đáng kể cho cả việc viết test mới lẫn điều tra lỗi.

+++
date        = '2026-07-22T09:02:00+07:00'
draft       = true
title       = 'Cron là gì? Hướng dẫn viết Cron Expression cho người mới bắt đầu'
slug        = 'cron-la-gi-huong-dan-viet-cron-expression-cho-nguoi-moi-bat-dau'
summary     = 'Cron là công cụ lập lịch chạy tác vụ tự động có sẵn trên Linux/macOS. Bài viết giải thích cấu trúc 5 trường của cron expression, các ký tự đặc biệt *, ,  -  /, kèm 8 ví dụ thực tế, lưu ý về múi giờ UTC vs giờ Việt Nam, lỗi thường gặp và công cụ crontab.guru để kiểm tra biểu thức.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
columns     = 2
categories  = ['it']
subcategories = ['devops', 'tips-tricks']
tags        = ['cron', 'linux', 'automation', 'devops']
series      = []
authors     = ['Nguyen Chung']
+++

Nếu bạn từng viết một script tự động backup database vào lúc nửa đêm, hay tự động gửi báo cáo email mỗi sáng thứ Hai, thì rất có thể bạn đã (hoặc sẽ) cần đến cron. Đây là một trong những công cụ "nhỏ mà có võ" gần như dev backend hay DevOps nào cũng dùng qua, nhưng cú pháp của nó lại khiến không ít người mới nhìn vào là... ngán. Bài viết này sẽ giúp bạn hiểu cron từ A đến Z, để lần sau viết `0 2 * * *` bạn biết chính xác nó nghĩa là gì, thay vì copy-paste rồi cầu nguyện nó chạy đúng giờ.

## Cron là gì và dùng để làm gì?

Cron là một tiện ích có sẵn trên hầu hết hệ điều hành Unix/Linux (macOS cũng có), cho phép bạn **lập lịch chạy một lệnh hoặc script tự động** theo thời gian định trước — không cần bạn ngồi canh giờ để bấm chạy tay.

Chương trình đứng sau cron gọi là `cron daemon` (hay `crond`) — nó chạy ngầm liên tục, cứ mỗi phút lại kiểm tra một lần: "Có tác vụ nào cần chạy vào lúc này không?". Danh sách các tác vụ đó được khai báo trong một file gọi là `crontab` (cron table), chỉnh sửa bằng lệnh `crontab -e`.

Một số việc dev hay dùng cron để tự động hóa:

- Backup database mỗi đêm.
- Dọn dẹp log file, file tạm định kỳ.
- Gửi email báo cáo, thống kê hàng tuần/hàng tháng.
- Đồng bộ dữ liệu giữa các hệ thống.
- Kiểm tra sức khỏe server (health check), gia hạn SSL certificate...

Nói ngắn gọn: bất cứ việc gì lặp đi lặp lại theo chu kỳ thời gian, cron đều có thể lo giúp bạn, để bạn khỏi phải nhớ hay thức khuya làm tay.

## Cấu trúc 5 trường của cron expression

Một dòng khai báo lịch trong crontab có cú pháp:

```
* * * * * lệnh-cần-chạy
```

5 dấu `*` tương ứng với 5 trường thời gian, theo đúng thứ tự sau:

| Vị trí | Ý nghĩa | Giá trị hợp lệ |
|---|---|---|
| 1 | Phút (minute) | 0–59 |
| 2 | Giờ (hour) | 0–23 |
| 3 | Ngày trong tháng (day of month) | 1–31 |
| 4 | Tháng (month) | 1–12 |
| 5 | Thứ trong tuần (day of week) | 0–6 (0 = Chủ nhật) |

Mẹo nhớ thứ tự: đọc từ trái sang phải là đi từ đơn vị **nhỏ đến lớn** — phút → giờ → ngày → tháng → thứ.

Ví dụ `30 14 * * *` nghĩa là "chạy vào lúc 14:30, mỗi ngày" (vì ngày, tháng, thứ đều để `*` — không giới hạn gì thêm).

## Các ký tự đặc biệt trong cron

Ngoài số cụ thể, cron còn hỗ trợ vài ký tự đặc biệt giúp biểu thức linh hoạt hơn:

- **`*` (mọi giá trị)** — nghĩa là "bất kỳ giá trị nào" của trường đó. Ví dụ `*` ở trường giờ nghĩa là "giờ nào cũng được".
- **`,` (danh sách)** — liệt kê nhiều giá trị cụ thể, cách nhau bằng dấu phẩy. Ví dụ `0,30` ở trường phút nghĩa là "chạy vào phút 0 và phút 30".
- **`-` (khoảng)** — chọn một dải giá trị liên tục. Ví dụ `1-5` ở trường thứ nghĩa là "từ thứ Hai đến thứ Sáu".
- **`/` (bước nhảy — step)** — chia nhỏ một khoảng theo bước cố định. Ví dụ `*/15` ở trường phút nghĩa là "cứ mỗi 15 phút một lần" (tức phút 0, 15, 30, 45).

Các ký tự này kết hợp được với nhau. Ví dụ `0 9-17/2 * * 1-5` nghĩa là "vào phút 0, mỗi 2 tiếng trong khoảng 9h–17h, từ thứ Hai đến thứ Sáu".

## 8 ví dụ cron expression thực tế

| Cron expression | Ý nghĩa | Tình huống thực tế |
|---|---|---|
| `0 2 * * *` | 2:00 sáng mỗi ngày | Backup database mỗi đêm, lúc traffic thấp nhất |
| `*/5 * * * *` | Mỗi 5 phút | Health check server, kiểm tra service còn sống không |
| `0 * * * *` | Đầu mỗi giờ | Dọn log file, xóa file tạm định kỳ mỗi giờ |
| `0 9 * * 1` | 9:00 sáng thứ Hai hàng tuần | Gửi email báo cáo tổng kết tuần cho sếp |
| `0 0 1 * *` | 0:00 ngày 1 hàng tháng | Chốt số liệu, tính hóa đơn cuối tháng |
| `30 8 * * 1-5` | 8:30 sáng, thứ Hai đến thứ Sáu | Gửi nhắc lịch họp daily standup |
| `0 3 * * 0` | 3:00 sáng mỗi Chủ nhật | Chạy job dọn dẹp, tối ưu database định kỳ |
| `0 0 1 1 *` | 0:00 ngày 1/1 hàng năm | Gia hạn license, gửi báo cáo tổng kết năm |

## Lưu ý về múi giờ (timezone) khi chạy cron

Đây là cái bẫy **rất nhiều người mới dính** phải: cron chạy theo múi giờ của hệ thống, chứ không tự hiểu bạn đang ở Việt Nam.

- Trên laptop cá nhân, hệ điều hành thường đã set sẵn múi giờ Việt Nam (`Asia/Ho_Chi_Minh`, UTC+7), nên `0 2 * * *` đúng là 2h sáng giờ Việt Nam.
- Nhưng server, đặc biệt server thuê ở nước ngoài (AWS, GCP, DigitalOcean...) hoặc container Docker, **mặc định thường chạy theo giờ UTC**. Lúc đó `0 2 * * *` sẽ chạy vào 2h sáng UTC — tức **9h sáng giờ Việt Nam** (UTC+7), lệch tận 7 tiếng so với dự định!

Cách xử lý:

1. Kiểm tra timezone hiện tại của server bằng lệnh `timedatectl` (Linux) hoặc `date`.
2. Đổi timezone server về `Asia/Ho_Chi_Minh` nếu muốn cron chạy đúng theo cảm nhận giờ Việt Nam thông thường.
3. Hoặc giữ nguyên UTC nhưng **tự quy đổi giờ** khi viết cron expression — ví dụ muốn chạy 2h sáng giờ Việt Nam thì viết `0 19 * * *` (vì 2h VN = 19h UTC của ngày hôm trước).
4. Nếu chạy cron trong Docker container, nhớ rằng container có thể có timezone riêng, không tự kế thừa từ máy host.

## Những lỗi thường gặp khi viết cron expression

- **Nhầm thứ tự các trường** — viết nhầm giờ vào chỗ phút hoặc ngược lại. Luôn nhớ đúng thứ tự "phút - giờ - ngày - tháng - thứ".
- **Nhầm lẫn giữa "ngày trong tháng" và "thứ trong tuần"** — khi cả hai trường đều khác `*`, cron sẽ chạy nếu **một trong hai** điều kiện đúng (quan hệ OR), không phải cả hai cùng lúc (AND) — dễ khiến job chạy nhiều hơn dự kiến.
- **Quên vấn đề múi giờ** như đã nói ở trên, khiến job chạy sai giờ mong muốn cả tiếng đồng hồ.
- **Dùng `*/1` thay vì `*`** — về ý nghĩa thì giống nhau (chạy mỗi đơn vị thời gian), nhưng viết `*` cho gọn và dễ đọc hơn.
- **Không kiểm tra lại trước khi deploy** — một dấu phẩy hay dấu gạch ngang gõ nhầm có thể khiến job chạy sai hoàn toàn mà không hề có lỗi cú pháp nào báo trước.

## Công cụ hỗ trợ: crontab.guru

Nếu vẫn còn lăn tăn không chắc biểu thức mình viết có đúng ý không, hãy dùng [crontab.guru](https://crontab.guru) — một website miễn phí giúp bạn:

- Gõ cron expression vào, web sẽ **dịch ngay ra câu tiếng Anh dễ hiểu** (ví dụ "At 02:00 AM").
- Có sẵn danh sách các mẫu phổ biến (mỗi phút, mỗi giờ, mỗi ngày...) để tham khảo nhanh.
- Cảnh báo nếu biểu thức bạn viết trông có vẻ bất thường, dễ gây nhầm lẫn.

Đây gần như là công cụ "phải có" trong tab trình duyệt của bất kỳ ai làm việc với cron thường xuyên — kể cả người đã quen thuộc vẫn dùng để double-check trước khi deploy.

---

Giờ thì bạn đã nắm được cron là gì, cách đọc/viết 5 trường thời gian, các ký tự đặc biệt, và biết tránh những cái bẫy về múi giờ hay quan hệ AND/OR giữa ngày-và-thứ. Lần tới cần lập lịch chạy job, cứ tự tin viết cron expression — hoặc kiểm tra lại bằng crontab.guru cho chắc ăn.

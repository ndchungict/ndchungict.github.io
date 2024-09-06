---
layout: post
title:  "Đặt lịch theo định dạng cron"
summary: "Định dạng cron được sử dụng để thiết lập lịch build tự động trong Jenkins và nhiều hệ thống khác."
author: chungnd
date: '2024-09-06 143:35:23 +0700'
category: [automation']
tags: jenkins,cron
thumbnail: /assets/img/posts/cron-calendar.png
keywords: cron,schedule
permalink: /blog/dat-lich-theo-dinh-dang-cron/
usemathjax: true
---


Dịnh dạng cron được sử dụng để thiết lập lịch build tự động trong Jenkins và nhiều hệ thống khác. Định dạng này cho phép bạn chỉ định khi nào một tác vụ sẽ được thực hiện dựa trên các giá trị cho phút, giờ, ngày của tháng, tháng, và ngày của tuần. 

Dưới đây là hướng dẫn chi tiết về định dạng cron và các ví dụ đi kèm.

### Định Dạng Cron
Định dạng cron thường có 5 trường (hoặc 6 nếu tính cả năm) và mỗi trường được phân cách bằng dấu cách:

```scss
* * * * * *
| | | | | |
| | | | | +--- Ngày trong tuần (0 - 6) (Chủ Nhật = 0)
| | | | +----- Tháng (1 - 12)
| | | +------- Ngày trong tháng (1 - 31)
| | +--------- Giờ (0 - 23)
| +----------- Phút (0 - 59)
+------------- Giây (0 - 59) (Không bắt buộc, thường không dùng trong các hệ thống cron tiêu chuẩn)
```

#### Các Ký Tự Đặc Biệt
* `*` (Asterisk): Đại diện cho tất cả các giá trị trong trường đó. Ví dụ: * trong trường phút có nghĩa là "mỗi phút".
  , (Comma): Để liệt kê nhiều giá trị. Ví dụ: 1,15,30 trong trường phút có nghĩa là "vào phút thứ 1, 15 và 30".
* `-` (Hyphen): Để chỉ một khoảng giá trị. Ví dụ: 1-5 trong trường ngày của tuần có nghĩa là "từ thứ Hai đến thứ Sáu".
* `/` (Slash): Để chỉ các bước tăng. Ví dụ: */15 trong trường phút có nghĩa là "mỗi 15 phút".

### Dưới đây là một số ví dụ về lịch cron và cách chúng hoạt động:

#### 1. Mỗi giờ vào phút 30

```scss
30 * * * *
```
Đây là lịch build mỗi giờ vào phút thứ 30 (ví dụ: 1:30, 2:30, 3:30, v.v.).

#### 2. Mỗi ngày vào lúc 2 giờ sáng

```scss
0 2 * * *
```
Đây là lịch build mỗi ngày vào 2:00 AM.

#### 3. Mỗi tuần vào thứ Hai lúc 3 giờ chiều

```scss
0 15 * * 1
```
Đây là lịch build vào 3:00 PM mỗi thứ Hai.

#### 4. Mỗi ngày vào lúc nửa đêm

```scss
0 0 * * *
```
Đây là lịch build mỗi ngày vào 12:00 AM.

#### 5. Mỗi tháng vào ngày 1 lúc 6 giờ sáng

```scss
0 6 1 * *
```
Đây là lịch build vào 6:00 AM vào ngày 1 của mỗi tháng.

#### 6. Mỗi giờ vào phút thứ 15 và 45

```scss
15,45 * * * *
```
Đây là lịch build vào phút 15 và 45 của mỗi giờ.

#### 7. Mỗi 10 phút

```scss
*/10 * * * *
```
Đây là lịch build mỗi 10 phút (ví dụ: 0, 10, 20, 30, 40, 50 phút của mỗi giờ).

#### 8. Mỗi tuần vào thứ Sáu và thứ Bảy lúc 10 giờ tối

```scss
0 22 * * 5,6
```
Đây là lịch build vào 10:00 PM mỗi thứ Sáu và thứ Bảy.
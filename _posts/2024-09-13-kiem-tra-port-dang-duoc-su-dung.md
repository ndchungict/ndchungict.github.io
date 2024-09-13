---
layout: post
title:  "Kiểm tra port đang được sử dụng"
summary: "Một số thao tác cơ bản để kiểm tra xem cổng (port) nào đang được sử dụng, các kết nối đang được thực hiện"
author: chungnd
date: '2024-09-13 09:35:23 +0700'
category: ['develop']
thumbnail: /assets/img/posts/check-port.png
keywords: develop,port,task
permalink: /kiem-tra-port-dang-duoc-su-dung/
usemathjax: true
---
### Trên Windows

#### 1. Kiểm tra cổng đang được sử dụng:

* Mở Command Prompt (cmd) với quyền quản trị.
* Sử dụng lệnh sau để kiểm tra các cổng đang được sử dụng:
```bash
netstat -ano
```
* Tìm cổng cụ thể trong danh sách. Ví dụ, để tìm cổng 4000, bạn có thể sử dụng:
```bash
netstat -ano | findstr :4000
```
Lệnh này sẽ hiển thị PID (Process ID) của tiến trình đang sử dụng cổng.

#### 2. Xác định ứng dụng đang sử dụng cổng:

* Mở Task Manager (Quản lý tác vụ) bằng cách nhấn Ctrl + Shift + Esc.
* Chuyển đến tab "Details" (Chi tiết).
* Tìm PID mà bạn tìm thấy từ lệnh netstat trong danh sách các tiến trình. Điều này sẽ cho bạn biết ứng dụng nào đang sử dụng cổng.

#### 3. Dừng tác vụ:

* Trong Task Manager, chọn tiến trình có PID tương ứng và nhấp chuột phải vào nó.
* Chọn "End Task" (Kết thúc tác vụ) để dừng ứng dụng đang sử dụng cổng.

### Trên Linux hoặc macOS
#### 1. Kiểm tra cổng đang được sử dụng:

* Mở terminal.
* Sử dụng lệnh sau để kiểm tra cổng đang được sử dụng:
```bash
sudo lsof -i :4000
```
Lệnh này sẽ hiển thị thông tin về tiến trình đang sử dụng cổng 4000.

#### 2. Xác định ứng dụng đang sử dụng cổng:
* Kết quả của lệnh lsof sẽ bao gồm PID và tên tiến trình. Bạn có thể thấy tên ứng dụng và PID trong cột tương ứng.

#### 3. Dừng tác vụ:

* Sử dụng lệnh kill để dừng tiến trình. Ví dụ, nếu PID là 1234, bạn có thể sử dụng:
```bash
sudo kill <PID>
```
Nếu tiến trình không dừng, bạn có thể sử dụng lệnh kill -9 để buộc dừng:
```bash
sudo kill -9 <PID>
```
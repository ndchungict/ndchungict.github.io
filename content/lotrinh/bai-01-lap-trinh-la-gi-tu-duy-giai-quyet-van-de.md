+++
date        = '2026-06-30T16:45:00+07:00'
draft       = true
title       = 'Bài 1 — Lập trình là gì? Tư duy giải quyết vấn đề bằng code'
slug        = 'lap-trinh-la-gi-tu-duy-giai-quyet-van-de'
summary     = 'Dành cho người chưa từng viết một dòng code: hiểu lập trình thực ra là gì bằng ví dụ đời thường, và làm quen với "tư duy lập trình" — cách chẻ nhỏ vấn đề thành các bước máy hiểu được.'
thumbnail   = '/images/default-thumb/default-thumb-it-lap-trinh.webp'
featured    = false
weight      = 2
categories  = ['automation']
tags        = ['automation-test', 'lap-trinh', 'tu-duy']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Ở [Bài 0](../automation-test-la-gi-vi-sao-chon-playwright/) mình đã cho bạn xem tấm bản đồ. Giờ bắt đầu bước đầu tiên, và mình cố tình để nó **không có dòng code nào phải cài đặt**. Vì trước khi gõ, bạn cần *hiểu mình đang làm gì*. Rất nhiều bạn mới lao vào gõ luôn, rồi mãi mãi ở trạng thái "copy được mà không hiểu" — mình không muốn bạn như vậy.

Bài này trả lời hai câu: **lập trình thực ra là gì?** và **"tư duy lập trình" nghĩa là sao?** Nắm được hai cái này, mọi bài sau sẽ nhẹ hơn nhiều.

## Lập trình là gì? Bỏ hết định nghĩa hàn lâm đi

Bạn từng chỉ đường cho ai đó chưa? Kiểu: *"Đi thẳng 200 mét, tới ngã tư có cây xăng thì rẽ phải, đi thêm chút thấy quán cà phê bên trái là tới."*

Đó. Bạn vừa **lập trình** đấy — chỉ là lập trình cho con người.

**Lập trình là viết ra một dãy hướng dẫn rõ ràng, theo thứ tự, để ra lệnh cho máy tính làm việc gì đó.** Hết. Không có gì huyền bí.

Khác biệt duy nhất: con người *thông minh và biết tự đoán ý*, còn máy tính thì **ngu một cách trung thành**. Nó làm **chính xác** điều bạn bảo, không thêm không bớt, không tự hiểu. Đây là điều quan trọng nhất bạn cần khắc cốt ghi tâm hôm nay:

> **Máy không làm điều bạn *muốn*. Nó làm điều bạn *viết*.**

Hồi mới vào nghề mình mất kha khá thời gian để chấp nhận sự thật này. Mỗi lần code chạy sai, phản xạ đầu tiên của người mới là "máy bị lỗi rồi". Không đâu. 99% là *bạn* bảo nó sai, chỉ là bạn chưa nhận ra thôi. Người làm nghề lâu năm khác người mới ở chỗ: họ mặc định **lỗi nằm ở mình trước**, rồi đi tìm.

## Một ví dụ: "pha mì gói" cho máy

Giả sử bạn phải hướng dẫn một con robot pha mì gói. Robot này cực ngu, chỉ làm đúng từng câu bạn nói. Bạn viết:

```text
1. Mở gói mì
2. Cho mì vào tô
3. Đổ nước sôi vào
4. Đợi 3 phút
5. Cho gói gia vị vào
6. Trộn đều
```

Đây chính là một **chương trình** (program) viết bằng tiếng Việt. Mỗi dòng là một **lệnh** (instruction). Để ý vài thứ rất "lập trình" trong đây:

- **Thứ tự quan trọng.** Đảo bước 3 (đổ nước) lên trước bước 2 (cho mì vào tô) là nước đổ ra bàn. Máy chạy **lần lượt từ trên xuống**, đúng như bạn xếp.
- **Phải đủ chi tiết.** Bạn không ghi "đổ nước" mà ghi "đổ nước **sôi**". Thiếu chữ "sôi", robot ngu kia đổ nước lạnh vào là xong. Máy không tự hiểu.
- **Có bước chờ.** "Đợi 3 phút" — máy cũng có khái niệm chờ đợi. (Nhớ vụ *auto-wait* mình khen Playwright ở Bài 0 không? Gốc rễ là đây.)

Viết code thật ra cũng y hệt: bạn chẻ một việc lớn thành các bước nhỏ, rõ ràng, đúng thứ tự, đủ chi tiết để một "con robot ngu" làm theo được.

## "Tư duy lập trình" — kỹ năng thật sự bạn cần luyện

Nhiều người tưởng học lập trình là học thuộc cú pháp (mấy dấu ngoặc, dấu chấm phẩy). Sai. Cú pháp chỉ là *ngôn ngữ*. Thứ khó và đáng giá hơn là **tư duy lập trình** (computational thinking) — tức **cách bạn nghĩ về vấn đề** trước khi gõ.

Nó gồm 4 thói quen, mình giải thích bằng một việc đời thường: *"sáng nay đi làm".*

**1. Chẻ nhỏ vấn đề (decomposition).**
"Đi làm" là việc lớn. Chẻ ra: thức dậy → vệ sinh → ăn sáng → mặc đồ → ra xe → chạy tới công ty. Việc to nào cũng là tập hợp của nhiều việc nhỏ. Code cũng vậy: không ai viết một phát ra cả hệ thống, người ta chẻ tới khi mỗi mẩu đủ nhỏ để làm.

**2. Tìm khuôn mẫu lặp lại (pattern).**
Sáng nào cũng "thức dậy → vệ sinh → ăn sáng". Cùng một quy trình, chỉ khác ngày. Khi thấy thứ gì lặp lại, dân lập trình gói nó thành một "công thức" để dùng lại, khỏi viết đi viết lại. (Cái này về sau bạn sẽ gặp dưới tên **hàm** ở Bài 7, và **vòng lặp** ở Bài 6.)

**3. Ra quyết định theo điều kiện (logic).**
"*Nếu* trời mưa *thì* mang áo mưa, *không thì* thôi." Máy cũng quyết định kiểu **nếu... thì...** này suốt ngày. Trong automation test, nó nghe như: "*nếu* nút Đăng nhập hiện ra *thì* bấm vào". (Bài 4 sẽ dạy bạn viết mấy câu "nếu... thì..." này bằng code.)

**4. Bỏ qua chi tiết thừa (abstraction).**
Khi nghĩ "lái xe đi làm", bạn không nghĩ tới chuyện động cơ đốt xăng thế nào. Bạn chỉ cần biết: đạp ga thì chạy. Lập trình cũng thế — bạn dùng những công cụ người khác làm sẵn mà không cần biết bên trong nó hoạt động ra sao. Playwright là một ví dụ: bạn ra lệnh `click`, còn nó tự lo phần phức tạp bên dưới.

> Bốn thói quen này nghe đơn giản, nhưng đây **chính là nghề**. Một automation engineer giỏi không phải người thuộc nhiều hàm nhất, mà là người **chẻ vấn đề gọn nhất và nghĩ ra nhiều tình huống nhất**. Cú pháp tra Google 5 giây ra; tư duy thì phải luyện.

## Thử "tư duy như lập trình viên" ngay

Quay lại đúng nghề mình đang học. Giả sử sếp bảo: *"Kiểm tra giúp anh chức năng đăng nhập có chạy không."* Người mới sẽ làm đại. Người có tư duy lập trình sẽ **chẻ nó ra** trước:

```text
Việc lớn: Kiểm tra chức năng đăng nhập

Chẻ nhỏ:
1. Mở trang đăng nhập
2. Nhập email đúng
3. Nhập mật khẩu đúng
4. Bấm nút "Đăng nhập"
5. Kiểm tra: có vào được trang chủ không?

Nghĩ thêm các tình huống (đây là phần đáng giá):
- Nếu nhập sai mật khẩu thì sao? → phải báo lỗi
- Nếu bỏ trống ô email thì sao? → phải báo "vui lòng nhập email"
- Nếu nhập email sai định dạng (thiếu @) thì sao?
```

Thấy chưa — bạn còn chưa viết một dòng code nào, nhưng bạn đã **làm công việc của một automation engineer** rồi đó. Phần dịch mấy bước này sang JavaScript + Playwright chỉ là chuyện kỹ thuật, học vài bài là xong. Còn **nghĩ ra được các bước và các tình huống** mới là thứ khiến bạn có giá.

## Cảnh báo cho người mới

- **Đừng sợ vì "mình không giỏi toán".** Lập trình ứng dụng (nhất là automation test) cần **tư duy logic và sự cẩn thận**, không cần toán cao siêu. Nếu bạn chỉ đường mạch lạc được, bạn lập trình được.
- **Đừng học thuộc lòng.** Không ai bắt bạn nhớ cú pháp. Hiểu *ý tưởng* rồi tra cú pháp khi cần — đó là cách dân chuyên làm.
- **Đừng nóng.** Tư duy chẻ nhỏ vấn đề là kỹ năng *luyện dần*, không phải đọc một bài là có. Cứ làm nhiều, nó tự ngấm.

Ở [Bài 2](../cai-dat-moi-truong-vs-code-nodejs/), mình sẽ cùng bạn cài VS Code, Node.js và chạy dòng JavaScript đầu tiên trong đời. Lúc đó bạn sẽ tự tay ra lệnh cho máy — và mấy thứ tư duy hôm nay sẽ bắt đầu có hình hài.

## 🛠 Thực hành

Không cần máy tính, chỉ cần giấy bút (đây là bài tập "tư duy", quan trọng hơn bạn nghĩ):

1. **Chẻ nhỏ một việc đời thường:** chọn việc "rút tiền ở cây ATM". Viết ra tất cả các bước theo thứ tự, chi tiết tới mức một robot ngu cũng làm được. Sau đó thử nghĩ: *có bước nào sai thứ tự thì hỏng việc?*
2. **Nghĩ tình huống:** với việc rút tiền ở trên, liệt kê 3 tình huống "bất thường" có thể xảy ra (vd: nhập sai mã PIN, tài khoản không đủ tiền...). Đây chính là tư duy nghĩ test case mà bạn sẽ dùng cả quá trình làm việc.

## Website tham khảo

- [MDN — JavaScript First Steps (tiếng Việt)](https://developer.mozilla.org/vi/docs/Learn/JavaScript/First_steps) — nhập môn cực kỳ thân thiện cho người chưa biết gì, đọc song song series này.
- [javascript.info — An Introduction](https://javascript.info/intro) — giải thích "code chạy ở đâu, như thế nào" rõ ràng, dễ hiểu.
- [Computational Thinking — BBC Bitesize](https://www.bbc.co.uk/bitesize/articles/zp92mp3) — diễn giải 4 trụ cột tư duy lập trình (chẻ nhỏ, pattern, abstraction, thuật toán) bằng tiếng Anh đơn giản.

+++
date        = '2024-07-01T08:30:00+07:00'
draft       = false
title       = 'Bài 10 — Bất đồng bộ trong JavaScript: Promise và async/await'
slug        = 'bat-dong-bo-promise-async-await'
summary     = 'Bài quan trọng nhất của giai đoạn JavaScript: hiểu bất đồng bộ (asynchronous), Promise, và cú pháp async/await cùng await. Đây là nền tảng để hiểu vì sao mọi lệnh Playwright đều có await.'
thumbnail   = '/images/series-hoc-automation-test-tu-so-0/bai-10-bat-dong-bo-promise-async-await.webp'
featured    = false
weight      = 11
categories  = ['it']
subcategories = ['automation']
tags        = ['automation-test', 'javascript', 'async-await']
series      = ['hoc-automation-test-tu-so-0']
authors     = ['Nguyen Chung']
+++

Đây là bài **quan trọng nhất** của Giai đoạn 1. Nếu chỉ được nắm vững một khái niệm JavaScript trước khi bước vào Playwright, thì đó là **bất đồng bộ (asynchronous)** cùng cặp từ khóa `async`/`await`.

Lý do rất cụ thể: gần như **mọi** lệnh Playwright đều bắt đầu bằng `await` — `await page.goto(...)`, `await page.click(...)`. Không hiểu `await`, bạn sẽ viết code chạy sai mà không biết vì sao. Bài này giải thích cặn kẽ.

## Vấn đề: một số việc cần thời gian

Phần lớn code chạy **tuần tự và tức thì**: cộng hai số, gán biến — xong ngay. Nhưng một số việc cần **thời gian chờ** và kết quả không có ngay lập tức:

- Tải một trang web (chờ mạng phản hồi).
- Đọc một file lớn.
- Gọi một API và chờ dữ liệu trả về.
- Chờ một nút xuất hiện trên trang.

Những việc này gọi là **bất đồng bộ (asynchronous)**: bạn ra lệnh, nhưng kết quả đến *sau đó* chứ không phải ngay dòng tiếp theo. Ngược lại với **đồng bộ (synchronous)** — làm xong mới sang dòng sau.

Vấn đề: nếu JavaScript "đứng chờ" mỗi việc chậm này thì cả chương trình treo cứng. Nên nó xử lý bất đồng bộ theo cơ chế khác — và **Promise** là cách biểu diễn cơ chế đó.

## Promise là gì

**Promise** (lời hứa) là một object đại diện cho **một kết quả sẽ có trong tương lai**, chưa có ngay bây giờ. Hình dung như phiếu giữ chỗ khi gọi món: bạn chưa có món ăn, nhưng cầm một tấm phiếu "sẽ có món". Phiếu đó có ba trạng thái:

- **pending** — đang chờ (món đang nấu).
- **fulfilled** — hoàn thành, có kết quả (món đã xong).
- **rejected** — thất bại (hết nguyên liệu, không làm được).

Nhiều hàm trong JavaScript và toàn bộ API Playwright **trả về Promise**. Vấn đề còn lại là: làm sao lấy được kết quả *sau khi* Promise hoàn thành? Câu trả lời hiện đại là `async`/`await`.

## async/await: viết code bất đồng bộ như đồng bộ

`async` và `await` là cú pháp giúp làm việc với Promise một cách **dễ đọc, tuần tự**, như thể code đồng bộ.

- **`await`** đặt trước một lời gọi trả về Promise. Nó **tạm dừng** hàm tại dòng đó cho tới khi Promise hoàn thành, rồi lấy ra kết quả.
- **`async`** đặt trước một hàm để báo rằng bên trong hàm đó có dùng `await`. Chỉ được dùng `await` bên trong một hàm `async`.

```javascript
async function taiTrang() {
  console.log('Bắt đầu tải...');
  const ketQua = await moTrang();   // dừng ở đây tới khi moTrang() xong
  console.log('Đã tải xong:', ketQua);
}
```

Không có `await`, dòng `moTrang()` sẽ chạy nhưng chương trình **không chờ** kết quả — nó lao ngay xuống dòng dưới khi kết quả chưa có. Đây chính là nguồn lỗi số một của người mới khi dùng Playwright.

## Minh họa trực quan bằng ví dụ chạy được

Đoạn code sau mô phỏng một việc mất 2 giây. `setTimeout` gói trong Promise để tạo "độ trễ" giả:

```javascript
// Hàm giả lập một việc mất 'giay' giây rồi trả về kết quả
function việcMấtThờiGian(giay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Xong sau ${giay} giây`);
    }, giay * 1000);
  });
}

async function chay() {
  console.log('1. Bắt đầu');
  const kq = await việcMấtThờiGian(2);   // chờ 2 giây tại đây
  console.log('2. ' + kq);
  console.log('3. Kết thúc');
}

chay();
```

Kết quả in ra đúng thứ tự, có khoảng dừng 2 giây giữa dòng 1 và dòng 2:

```text
1. Bắt đầu
(chờ 2 giây)
2. Xong sau 2 giây
3. Kết thúc
```

**Điểm mấu chốt:** nhờ `await`, dòng "2" và "3" chỉ chạy *sau khi* việc chậm hoàn thành. Bỏ `await` đi, bạn sẽ thấy "3. Kết thúc" in ra *trước* khi việc xong — sai thứ tự hoàn toàn. Hãy thử cả hai cách trong phần thực hành để tự cảm nhận.

## Xử lý lỗi với try/catch

Promise có thể **thất bại** (rejected). Với `async`/`await`, bắt lỗi bằng khối `try/catch`:

```javascript
async function chay() {
  try {
    const kq = await việcCóThểLỗi();
    console.log('Thành công:', kq);
  } catch (loi) {
    console.log('Đã xảy ra lỗi:', loi.message);
  }
}
```

- Code trong `try` chạy bình thường; nếu một `await` bị lỗi, luồng nhảy ngay sang `catch`.
- `loi` chứa thông tin lỗi. Đây là cách xử lý khi một thao tác test thất bại (ví dụ không tìm thấy phần tử).

## await trong vòng lặp: dùng for...of, không dùng forEach

Đây là điểm mình đã hẹn ở [Bài 8](../array-va-string-trong-javascript/). Khi cần `await` trên từng phần tử của một mảng, **dùng `for...of`** — nó chờ đúng như mong đợi:

```javascript
const trang = ['/a', '/b', '/c'];

// ĐÚNG: for...of chờ từng await lần lượt
for (const url of trang) {
  await moTrang(url);   // chờ trang này xong mới sang trang kế
}
```

**Cạm bẫy kinh điển:** `forEach` **không hoạt động đúng** với `await`. Callback bên trong có `await`, nhưng bản thân `forEach` **không chờ** các callback đó — nó chạy tiếp ngay, khiến "Xong hết" in ra trước khi các việc thực sự xong:

```javascript
// SAI: forEach không chờ await bên trong
trang.forEach(async (url) => {
  await moTrang(url);
});
console.log('Xong hết');   // in ra NGAY, khi các trang còn chưa mở xong
```

Quy tắc nhớ đời: **cần `await` trong vòng lặp thì dùng `for...of`, tránh `forEach`.** Đây là lỗi rất hay gặp khi viết automation.

## Promise.all: chạy nhiều việc song song

`for...of` chạy **lần lượt** (việc này xong mới tới việc kia). Khi các việc **độc lập** và muốn chạy **cùng lúc** cho nhanh, dùng `Promise.all` — nó nhận một mảng Promise và chờ *tất cả* hoàn thành:

```javascript
// Chạy 3 việc song song, chờ cả 3 xong
const ketQua = await Promise.all([
  moTrang('/a'),
  moTrang('/b'),
  moTrang('/c'),
]);
```

Bạn sẽ gặp lại `Promise.all` ở [Bài 25](../xu-ly-tabs-popup-iframe/) (bắt tab mới mở đồng thời với hành động click). Lưu ý: chỉ dùng khi các việc *không phụ thuộc thứ tự* của nhau.

## Vì sao điều này quan trọng với Playwright

Xem trước một đoạn test Playwright (chưa cần hiểu hết, chỉ nhìn `await`):

```javascript
test('kiểm tra tiêu đề trang', async ({ page }) => {
  await page.goto('https://playwright.dev');   // chờ trang tải xong
  await expect(page).toHaveTitle(/Playwright/); // chờ kiểm tra hoàn tất
});
```

Mọi thao tác — mở trang, click, điền, kiểm tra — đều là việc bất đồng bộ (cần chờ trình duyệt và mạng). Vì vậy:

- Hàm test luôn khai báo `async`.
- Mỗi lệnh Playwright đều đặt `await` phía trước.

Quên `await` là lỗi kinh điển: test "chạy qua" trước khi thao tác kịp hoàn thành, dẫn tới kết quả chập chờn hoặc sai. Khi đã hiểu bài này, bạn sẽ luôn nhớ đặt `await` một cách tự nhiên.

## Lỗi thường gặp

- **Quên `await`:** thao tác chưa xong đã sang dòng sau → kết quả sai hoặc lỗi `Promise { <pending> }`. Quy tắc với Playwright: **thấy lệnh trả về Promise thì thêm `await`**.
- **Dùng `await` ngoài hàm `async`:** → `SyntaxError`. `await` chỉ hợp lệ bên trong hàm khai báo `async`.
- **Không bắt lỗi:** một `await` thất bại mà không có `try/catch` sẽ làm chương trình dừng với lỗi chưa xử lý. (Trong Playwright, framework tự xử phần này — nhưng vẫn nên hiểu cơ chế.)

Đến đây Giai đoạn 1 kết thúc: bạn đã có đủ nền JavaScript cho automation. [Bài 11](../html-va-css-selector-co-ban/) mở Giai đoạn 2 — kiến thức web: HTML và CSS selector, đủ để định vị phần tử trên trang.

## 🛠 Thực hành

1. **Cảm nhận await:** chạy đoạn code minh họa ở trên. Sau đó **xóa từ `await`** ở dòng gọi `việcMấtThờiGian(2)`, chạy lại và quan sát thứ tự output thay đổi thế nào. Giải thích vì sao.
2. **Tuần tự nhiều await:** viết hàm `async` gọi `việcMấtThờiGian` ba lần liên tiếp (1 giây, 2 giây, 1 giây) với `await` trong một vòng `for...of`, in thông báo trước và sau mỗi lần. Xác nhận chúng chạy lần lượt.
3. **Bẫy forEach:** lặp lại bài 2 nhưng dùng `forEach` thay cho `for...of`, thêm dòng `console.log('Xong hết')` sau vòng lặp. Quan sát "Xong hết" in ra khi nào và giải thích.
4. **Song song với Promise.all:** gọi `việcMấtThờiGian` ba lần bằng `Promise.all`, đo tổng thời gian và so với cách chạy tuần tự ở bài 2.
5. **Bắt lỗi:** tạo một hàm trả về Promise bị `reject`, gọi nó với `await` trong khối `try/catch` và in thông báo lỗi ra màn hình.

## Website tham khảo

- [MDN — Introducing asynchronous JavaScript (tiếng Việt)](https://developer.mozilla.org/vi/docs/Learn/JavaScript/Asynchronous/Introducing) — nhập môn bất đồng bộ.
- [javascript.info — Promises, async/await](https://javascript.info/async) — loạt bài giải thích rất kỹ, nên đọc.
- [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) và [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) — đặc tả chính thức.

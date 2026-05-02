---
layout: post
title: "[AI] Cách Viết Prompts Hiệu Quả cho GitHub Copilot"
summary: "Học cách viết prompts chất lượng cao để tận dụng tối đa GitHub Copilot với 3 nguyên tắc vàng, kỹ thuật nâng cao và ví dụ thực tế"
author: chungnd
date: '2026-02-06 11:00:00 +0700'
category: ['ai','github-copilot']
series: "tong-quan-github-copilot"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: prompt engineering, github copilot prompts, ai prompts, copilot best practices
permalink: /cach-viet-prompts-hieu-qua-github-copilot/
usemathjax: false
---

# Cách Viết Prompts Hiệu Quả cho GitHub Copilot

## Prompt là gì?

**Prompt** là cách bạn giao tiếp với GitHub Copilot để nhận được kết quả mong muốn. Có thể là:
- Comments trong code
- Tên function/variable
- Code mẫu
- Câu hỏi trong Chat
- Context từ các file đang mở

**Prompt Engineering** là kỹ thuật tạo ra các prompts hiệu quả để AI hiểu đúng ý định và tạo ra code chất lượng.

## Nguyên tắc vàng: 3 Best Practices

### 1. Đặt bối cảnh với mục tiêu tổng quan 🖼️

**Tại sao quan trọng:**
- Giúp Copilot hiểu "big picture"
- Đặc biệt hữu ích khi bắt đầu file mới hoặc dự án mới
- Giống như brief cho đồng nghiệp trước khi làm việc

**Cách làm:**
Viết comment mô tả tổng quan trước khi code chi tiết

**❌ Không tốt:**
```javascript
// Create function
```

**✅ Tốt:**
```javascript
/*
Create a basic markdown editor in Next.js with the following features:
- Use react hooks
- Create state for markdown with default text
- A text area where users can write markdown
- Show a live preview of the markdown text as I type
- Support for basic markdown syntax like headers, bold, italics
- Use React markdown npm package
- The markdown text and resulting HTML should be saved in state and updated in real time
*/
```

**Kết quả:** Copilot sẽ tạo ra component hoàn chỉnh với tất cả tính năng được yêu cầu.

### 2. Yêu cầu đơn giản và cụ thể 🗨️

**Tại sao quan trọng:**
- Copilot hiểu tốt hơn khi bạn chia nhỏ vấn đề
- Giảm thiểu kết quả không mong muốn
- Dễ kiểm soát và review code

**Cách làm:**
Chia nhỏ logic thành các bước rõ ràng, để Copilot generate từng bước một

**❌ Không tốt:**
```javascript
// Create a function that processes user data, validates it, saves to database, sends email notification, and returns result
```

**✅ Tốt:**
```javascript
// Step 1: Validate user data
function validateUserData(data) {
    // Copilot sẽ generate validation logic
}

// Step 2: Save to database
function saveToDatabase(validatedData) {
    // Copilot sẽ generate database logic
}

// Step 3: Send email notification
function sendEmailNotification(user) {
    // Copilot sẽ generate email logic
}
```

**Ví dụ thực tế - Reverse string:**
```javascript
// Function to reverse a string
// Step 1: Convert string to array
// Step 2: Reverse the array
// Step 3: Join back to string
function reverseString(str) {
    // Copilot sẽ generate implementation theo từng bước
}
```

### 3. Cung cấp ví dụ ✍️

**Tại sao quan trọng:**
- AI học tốt từ examples (giống con người)
- Giúp Copilot hiểu chính xác format và pattern bạn muốn
- Đặc biệt hữu ích với data structures phức tạp

**Cách làm:**
Cung cấp input mẫu và output mong muốn

**❌ Không có ví dụ:**
```javascript
// Map through an array of arrays of objects to transform data
const data = [
    [
        { name: 'John', age: 25 },
        { name: 'Jane', age: 30 }
    ],
    [
        { name: 'Bob', age: 40 }
    ]
];

const mappedData = data.map(x => x.name);
console.log(mappedData);
// Kết quả: [undefined, undefined] ❌
```

**✅ Có ví dụ:**
```javascript
// Map through an array of arrays of objects
// Example: Extract names from the data array
// Desired outcome: ['John', 'Jane', 'Bob']
const data = [
    [{ name: 'John', age: 25 }, { name: 'Jane', age: 30 }],
    [{ name: 'Bob', age: 40 }]
];

const mappedData = data.flatMap(sublist => sublist.map(person => person.name));
console.log(mappedData);
// Kết quả: ['John', 'Jane', 'Bob'] ✅
```

## Kỹ thuật viết Prompts nâng cao

### 1. Sử dụng cấu trúc rõ ràng

**Format chuẩn cho function:**
```javascript
/**
 * [Mô tả ngắn gọn function làm gì]
 * 
 * @param {type} paramName - Mô tả parameter
 * @returns {type} Mô tả giá trị trả về
 * 
 * @example
 * functionName(input) // => expectedOutput
 */
function functionName(paramName) {
    // Copilot sẽ generate implementation
}
```

**Ví dụ thực tế:**
```javascript
/**
 * Calculate the total price including tax
 * 
 * @param {number} price - Original price
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns {number} Total price with tax
 * 
 * @example
 * calculateTotal(100, 0.1) // => 110
 */
function calculateTotal(price, taxRate) {
    // Copilot generates: return price * (1 + taxRate);
}
```

### 2. Cung cấp context qua tên biến và function

**❌ Tên không rõ ràng:**
```javascript
function rndpwd(l) {
    // Copilot: "Code goes here" - không hiểu bạn muốn gì
}
```

**✅ Tên mô tả rõ ràng:**
```javascript
function generateRandomPassword(length) {
    // Copilot sẽ generate code tạo random password với độ dài được chỉ định
}
```

### 3. Sử dụng patterns nhất quán

**Ví dụ với authentication:**
```javascript
// Copilot sẽ học pattern từ code có sẵn
function authenticateUser(username, password) {
    if (isValidUser(username, password)) {
        generateSessionToken(username);
        return true;
    } else {
        return false;
    }
}

// Khi bạn viết function mới với pattern tương tự:
function authorizeUser(userId, resource) {
    // Copilot sẽ suggest theo pattern tương tự
}
```

### 4. Chỉ định constraints và requirements

```javascript
// Create a function to validate email
// Requirements:
// - Must contain @ symbol
// - Must have domain extension (.com, .net, etc.)
// - No spaces allowed
// - Return true if valid, false otherwise
function validateEmail(email) {
    // Copilot sẽ generate validation logic theo requirements
}
```

### 5. Sử dụng test cases làm examples

```javascript
// Function to check if a number is prime
// Test cases:
// isPrime(2) => true
// isPrime(4) => false
// isPrime(17) => true
// isPrime(1) => false
function isPrime(num) {
    // Copilot sẽ generate logic dựa trên test cases
}
```

## Prompts cho các tình huống cụ thể

### Tạo API endpoint

```javascript
/**
 * POST /api/users
 * Create a new user
 * 
 * Request body:
 * {
 *   "username": "string",
 *   "email": "string",
 *   "password": "string"
 * }
 * 
 * Response:
 * - 201: User created successfully
 * - 400: Invalid input
 * - 409: User already exists
 */
app.post('/api/users', async (req, res) => {
    // Copilot generates implementation
});
```

### Xử lý lỗi

```javascript
// Fetch user data with error handling
// Handle cases:
// - Network error
// - 404 Not found
// - 500 Server error
// - Success case
async function fetchUserData(userId) {
    try {
        // Copilot generates fetch logic with error handling
    } catch (error) {
        // Copilot generates appropriate error handling
    }
}
```

### Database queries

```javascript
// Query to get all active users who registered in the last 30 days
// Include: id, username, email, registration_date
// Order by: registration_date DESC
// Limit: 100
const query = `
    // Copilot generates SQL query
`;
```

### Refactoring

```javascript
// Original code
function calculateDiscount(price, customerType) {
    if (customerType === 'regular') {
        return price * 0.9;
    } else if (customerType === 'premium') {
        return price * 0.8;
    } else if (customerType === 'vip') {
        return price * 0.7;
    }
    return price;
}

// Refactor using strategy pattern
// Create discount strategies for each customer type
// Use object lookup instead of if-else chain
```

## Tips bổ sung

### 1. Thử nghiệm với prompts

Nếu không được kết quả mong muốn, hãy:
- Thêm chi tiết cụ thể hơn
- Cung cấp ví dụ
- Chia nhỏ yêu cầu
- Thay đổi cách diễn đạt

**Ví dụ iteration:**

**Lần 1:**
```python
# Write code for grades.py
```
→ Quá mơ hồ

**Lần 2:**
```python
# Implement a function to calculate average grade
```
→ Thiếu chi tiết về input/output

**Lần 3:**
```python
# Implement calculate_average_grade that takes a list of grades 
# and returns the average as a float
# Example: calculate_average_grade([85, 90, 78]) => 84.33
```
→ Rõ ràng và có ví dụ ✅

### 2. Giữ các tab liên quan mở

Copilot sử dụng "neighboring tabs" để hiểu context:
- Mở 1-2 file liên quan
- Copilot sẽ học patterns từ các file này
- Đặc biệt hữu ích với types, interfaces, và shared utilities

**Ví dụ:**
```
Tab 1: userModel.ts (định nghĩa User interface)
Tab 2: userService.ts (đang code) 
→ Copilot sẽ biết structure của User và suggest phù hợp
```

### 3. Tuân thủ coding practices tốt

Copilot hoạt động tốt hơn khi bạn:
- Sử dụng naming conventions nhất quán
- Theo coding style của dự án
- Viết code có cấu trúc rõ ràng
- Comment đầy đủ

### 4. Sử dụng Copilot Chat cho câu hỏi phức tạp

Khi inline suggestions không đủ:
```
@workspace How is authentication implemented in this project?
```
```
Explain the difference between Promise.all and Promise.race
```
```
How can I optimize this database query?
```

### 5. Kết hợp nhiều kỹ thuật

```javascript
/**
 * Shopping cart checkout process
 * 
 * Requirements:
 * - Validate cart items
 * - Calculate total with tax and shipping
 * - Process payment
 * - Send confirmation email
 * - Update inventory
 * 
 * @param {Object} cart - Shopping cart object
 * @param {Object} paymentInfo - Payment information
 * @returns {Promise<Object>} Order confirmation
 * 
 * @example
 * checkout(cart, paymentInfo)
 *   .then(order => console.log(order.id))
 *   .catch(error => console.error(error))
 */
async function checkout(cart, paymentInfo) {
    // Step 1: Validate cart
    const validatedCart = validateCart(cart);
    
    // Step 2: Calculate totals
    const totals = calculateTotals(validatedCart);
    
    // Step 3: Process payment
    // Copilot continues with remaining steps
}
```

## Các lỗi thường gặp khi viết Prompts

### ❌ Lỗi 1: Quá mơ hồ
```javascript
// Do something with data
```

### ✅ Sửa:
```javascript
// Transform user data array to object keyed by user ID
// Input: [{id: 1, name: 'John'}, {id: 2, name: 'Jane'}]
// Output: {1: {id: 1, name: 'John'}, 2: {id: 2, name: 'Jane'}}
```

### ❌ Lỗi 2: Quá phức tạp
```javascript
// Create a comprehensive user management system with authentication, authorization, profile management, password reset, email verification, and admin dashboard
```

### ✅ Sửa: Chia nhỏ thành nhiều functions
```javascript
// User authentication module
function authenticateUser(credentials) { }

// User authorization module  
function authorizeUser(userId, permission) { }

// Profile management module
function updateUserProfile(userId, profileData) { }
```

### ❌ Lỗi 3: Thiếu context
```javascript
function process(data) {
    // Copilot không biết "process" nghĩa là gì
}
```

### ✅ Sửa:
```javascript
// Process payment transaction
// Validate card, charge amount, update order status
function processPayment(paymentData) { }
```

## Checklist cho Prompts hiệu quả

✅ Mục tiêu rõ ràng và cụ thể  
✅ Chia nhỏ thành các bước đơn giản  
✅ Cung cấp ví dụ input/output  
✅ Sử dụng tên biến/function mô tả  
✅ Chỉ định constraints và requirements  
✅ Tuân thủ coding style của dự án  
✅ Mở các file liên quan  
✅ Sẵn sàng thử nghiệm và điều chỉnh  

## Kết luận

Viết prompts hiệu quả là kỹ năng quan trọng để tận dụng tối đa GitHub Copilot. Hãy nhớ:

1. **Bối cảnh là quan trọng**: Càng nhiều context, Copilot càng hiểu rõ
2. **Đơn giản hóa**: Chia nhỏ vấn đề phức tạp
3. **Ví dụ là vàng**: Show, don't just tell
4. **Thực hành**: Kỹ năng viết prompts cải thiện qua thời gian
5. **Review luôn**: AI là trợ lý, bạn là người quyết định cuối cùng

Bài viết được viết bằng AI 🚀

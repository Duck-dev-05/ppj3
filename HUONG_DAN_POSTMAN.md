# Hướng dẫn sử dụng Postman để test API Clients

## Vấn đề: GET trả về số `1` thay vì danh sách clients

## Bước 1: Đăng nhập để lấy JWT Token

### Request 1: Login
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw, JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- **Response:** Copy token từ response
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "admin",
    "fullName": "Administrator",
    "role": "Admin"
  }
  ```

## Bước 2: Cấu hình Authorization trong Postman

### Cách 1: Dùng Bearer Token (Khuyên dùng)
1. Click vào tab **Authorization**
2. Chọn **Type:** `Bearer Token`
3. Paste token vào ô **Token** (CHỈ paste phần token, KHÔNG có dấu ngoặc kép)
4. Click **Save**

### Cách 2: Thêm Header thủ công
1. Click vào tab **Headers**
2. Thêm header mới:
   - **Key:** `Authorization`
   - **Value:** `Bearer <paste-token-ở-đây>`
   - **Lưu ý:** Phải có khoảng trắng giữa "Bearer" và token

## Bước 3: POST Client (Tạo mới)

### Request 2: Create Client
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/clients`
- **Authorization:** Đã cấu hình ở Bước 2
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (tự động nếu dùng Bearer Token)
- **Body (raw, JSON):**
```json
{
  "clientCode": "A02",
  "companyName": "Công ty Test",
  "contactPerson": "Nguyễn Văn A",
  "email": "test123@example.com",
  "phone": "0123456789",
  "address": "123 Đường ABC",
  "city": "Hồ Chí Minh",
  "country": "Việt Nam",
  "isActive": true
}
```

**QUAN TRỌNG:**
- ❌ **KHÔNG** gửi field `id` trong body
- ❌ **KHÔNG** gửi field `createdAt` trong body
- ✅ Email phải unique (không trùng với email đã có)

- **Expected Response:** Status `201 Created`
  ```json
  {
    "id": 2,
    "clientCode": "A02",
    "companyName": "Công ty Test",
    ...
  }
  ```

## Bước 4: GET Clients (Lấy danh sách)

### Request 3: Get All Clients
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/clients`
- **Authorization:** Đã cấu hình ở Bước 2 (CÙNG TOKEN)
- **Headers:**
  - `Authorization: Bearer <token>` (tự động nếu dùng Bearer Token)
- **Body:** Không cần (GET request không có body)

- **Expected Response:** Status `200 OK`
  ```json
  [
    {
      "id": 1,
      "clientCode": "A01",
      "companyName": "FPT",
      ...
    },
    {
      "id": 2,
      "clientCode": "A02",
      "companyName": "Công ty Test",
      ...
    }
  ]
  ```

## Troubleshooting

### Vấn đề 1: GET trả về số `1` thay vì array
**Nguyên nhân có thể:**
1. ❌ **Thiếu JWT Token** - Request bị reject
2. ❌ **Token hết hạn** - Cần đăng nhập lại
3. ❌ **Token sai format** - Thiếu "Bearer " hoặc có khoảng trắng thừa
4. ❌ **API server chưa restart** - Code mới chưa được load

**Giải pháp:**
1. Kiểm tra tab **Authorization** có được chọn và token có được điền không
2. Kiểm tra tab **Headers** xem có header `Authorization: Bearer <token>` không
3. Đăng nhập lại để lấy token mới
4. Restart API server và thử lại

### Vấn đề 2: GET trả về `401 Unauthorized`
**Nguyên nhân:** Thiếu hoặc sai JWT Token

**Giải pháp:**
1. Đăng nhập lại để lấy token mới
2. Kiểm tra format token: `Bearer <token>` (có khoảng trắng)
3. Đảm bảo token chưa hết hạn

### Vấn đề 3: GET trả về `[]` (mảng rỗng)
**Nguyên nhân:** Database chưa có dữ liệu

**Giải pháp:**
1. Kiểm tra POST request đã thành công chưa (Status 201)
2. Kiểm tra database có dữ liệu không
3. Thử POST thêm client mới

### Vấn đề 4: POST trả về `400 Bad Request`
**Nguyên nhân có thể:**
1. Email đã tồn tại
2. Thiếu field bắt buộc
3. Format JSON sai

**Giải pháp:**
1. Đổi email sang email khác
2. Kiểm tra tất cả field bắt buộc đã có chưa
3. Kiểm tra format JSON (dấu ngoặc, dấu phẩy)

## Checklist khi test

- [ ] Đã đăng nhập và lấy được token
- [ ] Đã cấu hình Authorization (Bearer Token hoặc Header)
- [ ] POST request không có field `id` và `createdAt`
- [ ] POST request trả về Status `201 Created`
- [ ] GET request có header `Authorization: Bearer <token>`
- [ ] GET request trả về Status `200 OK` và mảng JSON
- [ ] Token chưa hết hạn (thử đăng nhập lại nếu cần)

## Lưu ý quan trọng

1. **Token có thời hạn:** Token JWT có thời hạn (mặc định 60 phút), nếu hết hạn cần đăng nhập lại
2. **Mỗi request cần token:** Tất cả request đến `/api/clients` đều cần JWT token
3. **Email phải unique:** Không thể tạo 2 client với cùng email
4. **ID tự động:** Không cần (và không nên) gửi `id` khi POST, server sẽ tự tạo



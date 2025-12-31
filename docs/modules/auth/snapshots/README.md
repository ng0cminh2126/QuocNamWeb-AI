# Auth API Snapshots

Thư mục này chứa các JSON response thực tế từ API.

## Cần tạo các file sau:

- [ ] `login_success.json` - Response khi login thành công
- [ ] `login_error.json` - Response khi login thất bại (sai password, user not found, etc.)
- [ ] `refresh_success.json` - Response khi refresh token thành công
- [ ] `refresh_error.json` - Response khi refresh token thất bại (expired, invalid)
- [ ] `me_success.json` - Response khi get current user thành công
- [ ] `me_error.json` - Response khi get current user thất bại (unauthorized)

## Format mỗi file:

```json
{
  "_meta": {
    "endpoint": "POST /api/auth/login",
    "capturedAt": "2025-12-26T10:00:00Z",
    "environment": "development | staging | production",
    "httpStatus": 200,
    "notes": "Mô tả ngắn về case này"
  },
  "response": {
    // PASTE ACTUAL JSON RESPONSE HERE
  }
}
```

## Cách capture snapshot:

### Option 1: Postman
1. Gọi API trong Postman
2. Copy response body
3. Tạo file mới, paste vào phần `response`

### Option 2: Browser DevTools
1. Mở Network tab
2. Thực hiện action (login, etc.)
3. Click vào request, copy Response
4. Tạo file mới, paste vào phần `response`

### Option 3: curl
```bash
curl -X POST https://api.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' \
  | jq '.' > login_success.json
```

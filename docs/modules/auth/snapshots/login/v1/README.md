# Login Feature Snapshots - v1

> **Feature:** Login (basic username/password)  
> **Version:** v1  
> **Captured:** [HUMAN điền khi capture]

---

## 📁 Files cần tạo

| # | File | Description | Status |
|---|------|-------------|--------|
| 1 | `success.json` | Login thành công | ⬜ Cần capture |
| 2 | `error_invalid_credentials.json` | Sai username/password | ⬜ Cần capture |
| 3 | `error_user_inactive.json` | User bị disable | ⬜ Optional |
| 4 | `error_validation.json` | Validation error | ⬜ Optional |

---

## 📋 Template cho mỗi file

```json
{
  "_meta": {
    "feature": "login",
    "version": "v1",
    "endpoint": "POST /api/auth/login",
    "capturedAt": "2025-12-26T10:00:00Z",
    "capturedBy": "[Tên người capture]",
    "environment": "development | staging | production",
    "httpStatus": 200,
    "notes": "Mô tả ngắn về case này"
  },
  "request": {
    "username": "testuser",
    "password": "***"
  },
  "response": {
    // PASTE ACTUAL JSON RESPONSE HERE
  }
}
```

---

## 🔧 Cách capture

### 1. Success case

```bash
curl -X POST https://[API_URL]/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"validuser","password":"validpassword"}' \
  | jq '.'
```

### 2. Error case - Invalid credentials

```bash
curl -X POST https://[API_URL]/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"validuser","password":"wrongpassword"}' \
  | jq '.'
```

---

## ⚠️ Lưu ý bảo mật

- KHÔNG commit password thật vào snapshot
- Thay password bằng `"***"` hoặc `"[REDACTED]"`
- Có thể thay đổi sensitive data trong response nếu cần

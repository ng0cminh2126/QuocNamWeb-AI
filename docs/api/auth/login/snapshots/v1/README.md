# Login Snapshots - v1

> **Version:** v1  
> **Created:** 2025-12-27  
> **Status:** ⏳ PENDING - Cần HUMAN capture

---

## Required Files

| File             | Description                   | Status     |
| ---------------- | ----------------------------- | ---------- |
| `success.json`   | Response khi login thành công | ⬜ Chưa có |
| `error-401.json` | Response khi sai credentials  | ⬜ Chưa có |
| `error-400.json` | Response khi validation error | ⬜ Chưa có |

---

## How to Capture

### Option 1: Sử dụng cURL

```bash
# Success case (dùng credentials thật)
curl -X POST https://vega-identity-api-dev.allianceitsc.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "your_email@example.com", "password": "your_password"}' \
  > success.json

# Error 401 case (dùng wrong password)
curl -X POST https://vega-identity-api-dev.allianceitsc.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "your_email@example.com", "password": "wrong_password"}' \
  > error-401.json
```

### Option 2: Sử dụng Postman/Insomnia

1. Import collection
2. Set environment variables
3. Run requests
4. Copy response và paste vào file JSON

### Option 3: Browser DevTools

1. Mở Network tab
2. Thực hiện login
3. Click request → Response tab
4. Copy và paste

---

## Snapshot Format

Mỗi snapshot file cần có format:

```json
{
  "_meta": {
    "endpoint": "POST /auth/login",
    "capturedAt": "2025-12-27T10:00:00Z",
    "capturedBy": "HUMAN",
    "environment": "dev"
  },
  "_request": {
    "body": { ... }
  },
  "_response": {
    "status": 200,
    "body": { ... actual response ... }
  }
}
```

Hoặc đơn giản chỉ cần response body:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  ...
}
```

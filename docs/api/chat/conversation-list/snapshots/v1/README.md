# Snapshots - Conversation List API

## Hướng Dẫn Capture

### Cách 1: Sử dụng cURL

```bash
curl -X GET "https://[API_URL]/api/conversations" \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  > success.json
```

### Cách 2: Sử dụng Browser DevTools

1. Mở Network tab
2. Thực hiện action để trigger API call
3. Click vào request → Copy → Copy response

### Cách 3: Paste trực tiếp

HUMAN có thể paste response JSON trực tiếp vào file `success.json`

---

## Files Cần Tạo

| File             | Description         | Status     |
| ---------------- | ------------------- | ---------- |
| `success.json`   | Successful response | ⏳ Pending |
| `error-401.json` | Unauthorized error  | ⏳ Pending |
| `error-403.json` | Forbidden error     | ⏳ Pending |
| `empty.json`     | Empty list response | ⏳ Pending |

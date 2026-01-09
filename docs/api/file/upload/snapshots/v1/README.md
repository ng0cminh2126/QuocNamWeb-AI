# Capture Snapshots

## 📝 Overview

Snapshots trong folder này là **actual JSON responses** từ Vega File API (Development environment).

**Environment:** https://vega-file-api-dev.allianceitsc.com  
**Captured Date:** 2026-01-06  
**API Version:** v1

---

## 📊 Available Snapshots

| File                                    | Status Code                | Description                    |
| --------------------------------------- | -------------------------- | ------------------------------ |
| `success.json`                          | 201 Created                | Successful file upload         |
| `error-400-missing-source-module.json`  | 400 Bad Request            | Missing sourceModule parameter |
| `error-401-unauthorized.json`           | 401 Unauthorized           | Missing/invalid Bearer token   |
| `error-413-file-too-large.json`         | 413 Payload Too Large      | File exceeds size limit        |
| `error-415-unsupported-media-type.json` | 415 Unsupported Media Type | Invalid file type              |

---

## 🔧 How to Capture Manually

### Success Case (201)

```bash
curl -X POST "https://vega-file-api-dev.allianceitsc.com/api/Files?sourceModule=1" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -F "file=@test-document.pdf" \
  -w "\n\nStatus: %{http_code}\n" \
  -s -o success.json
```

### Error 400 - Missing sourceModule

```bash
curl -X POST "https://vega-file-api-dev.allianceitsc.com/api/Files" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -F "file=@test-document.pdf" \
  -w "\n\nStatus: %{http_code}\n" \
  -s -o error-400-missing-source-module.json
```

### Error 401 - Unauthorized

```bash
curl -X POST "https://vega-file-api-dev.allianceitsc.com/api/Files?sourceModule=1" \
  -F "file=@test-document.pdf" \
  -w "\n\nStatus: %{http_code}\n" \
  -s -o error-401-unauthorized.json
```

---

## ⚠️ Notes

- **HUMAN** needs to capture actual snapshots with valid Bearer token
- Test files should be small (< 1MB) for quick testing
- Use `sourceModule=1` for Chat module
- Snapshots should be committed to Git for reference

---

## 🔐 Test Credentials

Test credentials should be stored in `.env.local`:

```env
TEST_JWT_TOKEN=your_test_jwt_token_here
```

**DO NOT commit `.env.local` to Git!**

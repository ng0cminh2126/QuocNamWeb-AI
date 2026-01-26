# Conversation Members API - Snapshot Capture Guide

**API:** `GET /api/conversations/{id}/members`  
**Version:** v1  
**Date:** 2026-01-20

---

## 📋 Required Snapshots

Cần capture 3 files:

- [ ] `success.json` - Response thành công với danh sách members
- [ ] `error-401.json` - Unauthorized (missing/invalid token)
- [ ] `error-404.json` - Conversation not found

---

## 🔧 How to Capture

### Prerequisites

1. Có access token hợp lệ
2. Có conversationId đang tồn tại trong hệ thống
3. Terminal/PowerShell với curl hoặc Postman

---

### 1. Success Response

**Command:**

```bash
curl -X GET \
  'https://api.quocnam.com/api/conversations/{CONVERSATION_ID}/members' \
  -H 'Authorization: Bearer {YOUR_TOKEN}' \
  -H 'Content-Type: application/json' \
  > success.json
```

**Thay thế:**

- `{CONVERSATION_ID}`: ID của conversation thật (ví dụ: `conv-12345`)
- `{YOUR_TOKEN}`: Access token của bạn

**Expected Output:**

```json
{
  "success": true,
  "data": {
    "conversationId": "conv-12345",
    "members": [...],
    "totalCount": 5
  }
}
```

---

### 2. Error 401 - Unauthorized

**Command:**

```bash
curl -X GET \
  'https://api.quocnam.com/api/conversations/{CONVERSATION_ID}/members' \
  -H 'Authorization: Bearer invalid_token_here' \
  -H 'Content-Type: application/json' \
  > error-401.json
```

**Expected Output:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

### 3. Error 404 - Not Found

**Command:**

```bash
curl -X GET \
  'https://api.quocnam.com/api/conversations/non-existent-conversation-id/members' \
  -H 'Authorization: Bearer {YOUR_TOKEN}' \
  -H 'Content-Type: application/json' \
  > error-404.json
```

**Expected Output:**

```json
{
  "success": false,
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "Conversation not found"
  }
}
```

---

## 📍 Save Location

Save các files vào:

```
docs/api/chat/members/snapshots/v1/
├── success.json
├── error-401.json
└── error-404.json
```

---

## ✅ Verification

Sau khi capture, verify:

- [ ] 3 files đã được tạo
- [ ] success.json có `members[]` array
- [ ] success.json có `totalCount` field
- [ ] error-401.json có `error.code = "UNAUTHORIZED"`
- [ ] error-404.json có `error.code = "CONVERSATION_NOT_FOUND"`
- [ ] Không có sensitive data (passwords, full tokens)

---

## 🔄 Alternative: Postman

Nếu không dùng curl, có thể dùng Postman:

1. Create new request: `GET {BASE_URL}/api/conversations/{id}/members`
2. Add header: `Authorization: Bearer {token}`
3. Send request
4. Copy response
5. Save as JSON file

---

**Note:** Nếu backend chưa implement endpoint này, thông báo ngay để AI skip API integration và dùng mock data tạm thời.

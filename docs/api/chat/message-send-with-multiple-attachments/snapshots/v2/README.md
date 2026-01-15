# Snapshots for Send Message with Multiple Attachments

> **API:** POST /api/messages  
> **Version:** v2  
> **Status:** ⏳ PENDING (Waiting for HUMAN to capture)

---

## 📋 Required Snapshots

### ✅ Success Cases

- [ ] **success-3-attachments.json** - Send message với 3 files (1 PDF + 2 images)
- [ ] **success-1-attachment.json** - Send message với 1 file (backward compatible test)
- [ ] **success-max-attachments.json** - Send message với 10 files (max limit)
- [ ] **success-no-attachments.json** - Send text-only message (no attachments)
- [ ] **success-mixed-types.json** - Send với nhiều loại file khác nhau (pdf, xlsx, jpg, png)

### ❌ Error Cases

- [ ] **error-400-too-many-attachments.json** - Gửi >10 attachments
- [ ] **error-400-invalid-file-id.json** - File ID không tồn tại trong hệ thống
- [ ] **error-400-empty-content.json** - Content rỗng hoặc chỉ có whitespace
- [ ] **error-401-unauthorized.json** - Missing hoặc invalid token
- [ ] **error-403-forbidden.json** - User không phải member của conversation
- [ ] **error-404-conversation-not-found.json** - Conversation ID không tồn tại

---

## 🔧 How to Capture

### Prerequisites:

1. **Upload files first** để có `fileId`:

   ```bash
   # Upload batch files to get file IDs
   curl -X POST "https://vega-file-api-dev.allianceitsc.com/api/Files/batch" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "files=@test1.pdf" \
     -F "files=@test2.jpg" \
     -F "files=@test3.jpg"

   # Copy fileId values from response
   ```

2. **Get conversation ID** từ existing conversation hoặc create mới

### Using cURL:

```bash
# Success - 3 attachments (1 PDF + 2 images)
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "YOUR_CONVERSATION_ID",
    "content": "Test message with multiple attachments",
    "attachments": [
      {
        "fileId": "FILE_ID_1",
        "fileName": "report.pdf",
        "fileSize": 2621440,
        "fileType": "application/pdf"
      },
      {
        "fileId": "FILE_ID_2",
        "fileName": "photo1.jpg",
        "fileSize": 3984128,
        "fileType": "image/jpeg",
        "thumbnailUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/FILE_ID_2/thumbnail"
      },
      {
        "fileId": "FILE_ID_3",
        "fileName": "photo2.jpg",
        "fileSize": 4123456,
        "fileType": "image/jpeg",
        "thumbnailUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/FILE_ID_3/thumbnail"
      }
    ]
  }' \
  -o success-3-attachments.json

# Success - 1 attachment (backward compatible)
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "YOUR_CONVERSATION_ID",
    "content": "Test message with one file",
    "attachments": [
      {
        "fileId": "FILE_ID_1",
        "fileName": "report.pdf",
        "fileSize": 2621440,
        "fileType": "application/pdf"
      }
    ]
  }' \
  -o success-1-attachment.json

# Success - No attachments
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "YOUR_CONVERSATION_ID",
    "content": "Text-only message, no files"
  }' \
  -o success-no-attachments.json

# Error - Too many attachments (>10)
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "YOUR_CONVERSATION_ID",
    "content": "Test with too many files",
    "attachments": [
      {"fileId": "id1", "fileName": "f1.pdf", "fileSize": 100000, "fileType": "application/pdf"},
      {"fileId": "id2", "fileName": "f2.pdf", "fileSize": 100000, "fileType": "application/pdf"},
      {"fileId": "id3", "fileName": "f3.pdf", "fileSize": 100000, "fileType": "application/pdf"},
      {"fileId": "id4", "fileName": "f4.pdf", "fileSize": 100000, "fileType": "application/pdf"},
      {"fileId": "id5", "fileName": "f5.pdf", "fileSize": 100000, "fileType": "application/pdf"},
      {"fileId": "id6", "fileName": "f6.pdf", "fileSize": 100000, "fileType": "application/pdf"},
      {"fileId": "id7", "fileName": "f7.pdf", "fileSize": 100000, "fileType": "application/pdf"},
      {"fileId": "id8", "fileName": "f8.pdf", "fileSize": 100000, "fileType": "application/pdf"},
      {"fileId": "id9", "fileName": "f9.pdf", "fileSize": 100000, "fileType": "application/pdf"},
      {"fileId": "id10", "fileName": "f10.pdf", "fileSize": 100000, "fileType": "application/pdf"},
      {"fileId": "id11", "fileName": "f11.pdf", "fileSize": 100000, "fileType": "application/pdf"}
    ]
  }' \
  -o error-400-too-many-attachments.json

# Error - Invalid file ID
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "YOUR_CONVERSATION_ID",
    "content": "Test with invalid file ID",
    "attachments": [
      {
        "fileId": "INVALID-FILE-ID-DOES-NOT-EXIST",
        "fileName": "fake.pdf",
        "fileSize": 100000,
        "fileType": "application/pdf"
      }
    ]
  }' \
  -o error-400-invalid-file-id.json

# Error - Unauthorized
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "YOUR_CONVERSATION_ID",
    "content": "Test without token",
    "attachments": []
  }' \
  -o error-401-unauthorized.json
```

### Using Postman:

1. **Setup:**

   - Create POST request to `https://vega-chat-api-dev.allianceitsc.com/api/messages`
   - Authorization → Bearer Token → Paste your token
   - Headers → Content-Type: `application/json`

2. **Success - 3 Attachments:**

   - Body → raw → JSON
   - Paste request với 3 attachments (see cURL example)
   - Send → Copy response → Save to `success-3-attachments.json`

3. **Error Cases:**
   - Remove token để test 401
   - Use invalid fileId để test 400
   - Send >10 attachments để test validation

---

## 📝 Snapshot Template

```json
{
  "_meta": {
    "capturedAt": "2026-01-14T11:00:00Z",
    "environment": "dev",
    "apiVersion": "v2",
    "tester": "HUMAN_NAME",
    "scenario": "Send message with 3 attachments"
  },
  "_request": {
    "method": "POST",
    "endpoint": "/api/messages",
    "conversationId": "conv-abc123",
    "attachmentsCount": 3,
    "body": {
      // Request body here (optional)
    }
  },
  "_response": {
    "status": 200,
    "body": {
      // Actual API response here
    }
  }
}
```

**Or simply paste raw response** (preferred).

---

## ⚠️ HUMAN ACTION REQUIRED

**Priority HIGH - Needed for development:**

1. `success-3-attachments.json` - **PRIORITY 1**
2. `success-1-attachment.json` - **PRIORITY 2**
3. `error-400-too-many-attachments.json` - **PRIORITY 3**
4. `error-401-unauthorized.json` - **PRIORITY 3**

**Priority MEDIUM - For comprehensive testing:** 5. `success-max-attachments.json` 6. `success-no-attachments.json` 7. `error-400-invalid-file-id.json` 8. Other error cases

**Steps:**

1. Capture snapshots theo thứ tự priority
2. Save files vào folder `snapshots/v2/`
3. Update README này: tick ✅ vào các snapshots đã có
4. Update contract.md status từ ⏳ PENDING → ✅ READY

---

## 📧 Alternative Method

Nếu gặp khó khăn, HUMAN có thể:

1. **Test thủ công** bằng Postman/Insomnia
2. **Copy response** và paste trực tiếp vào chat
3. **AI sẽ format** và save vào files

**Example:**

```
AI, đây là response từ API khi gửi 3 attachments:
{
  "id": "msg-xyz",
  "conversationId": "conv-abc",
  ...
}
```

AI sẽ tự động save vào đúng file.

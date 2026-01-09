# API Snapshots - Send Message v1

> **Endpoint:** `POST /api/messages`  
> **Version:** v1  
> **Last Updated:** 2026-01-07

---

## 📸 Snapshot Files

### Success Cases

| File                                                             | Description              | Request | Response       |
| ---------------------------------------------------------------- | ------------------------ | ------- | -------------- |
| [`send-text-only.json`](./send-text-only.json)                   | Send text message only   | ✅      | ⏳ Chờ capture |
| [`send-with-attachment.json`](./send-with-attachment.json)       | Send message with 1 file | ✅      | ⏳ Chờ capture |
| [`send-reply-with-mention.json`](./send-reply-with-mention.json) | Reply with @mention      | ✅      | ⏳ Chờ capture |

### Error Cases

| File                                                       | Status | Description                |
| ---------------------------------------------------------- | ------ | -------------------------- |
| [`error-400-validation.json`](./error-400-validation.json) | 400    | Missing conversationId     |
| [`error-403-forbidden.json`](./error-403-forbidden.json)   | 403    | Not member of conversation |
| [`error-404-not-found.json`](./error-404-not-found.json)   | 404    | Conversation not found     |

---

## 🛠️ How to Capture Snapshots

### Prerequisites

1. **API Base URL:** `https://vega-chat-api-dev.allianceitsc.com`
2. **Access Token:** Get from login response
3. **Conversation ID:** Create a test conversation first
4. **File ID:** Upload a test file first using `POST /api/Files`

### Method 1: Using Swagger UI (Recommended)

1. Mở Swagger: https://vega-chat-api-dev.allianceitsc.com/swagger/index.html
2. Click **Authorize** → Paste Bearer token
3. Tìm endpoint **POST /api/messages**
4. Click **Try it out**
5. Điền request body:

```json
{
  "conversationId": "your-conversation-id",
  "content": "Test message",
  "parentMessageId": null,
  "mentions": null,
  "attachment": null
}
```

6. Click **Execute**
7. Copy response JSON → Paste vào file snapshot

### Method 2: Using curl

#### Send Text Only

```bash
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "content": "Hello team!",
    "parentMessageId": null,
    "mentions": null,
    "attachment": null
  }' | jq '.' > send-text-only.json
```

#### Send with Attachment

**Bước 1:** Upload file trước

```bash
# Upload file
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/Files?sourceModule=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/test-file.pdf" \
  | jq '.fileId'

# Output: "8f85d64a-1234-5678-abcd-1234567890ab"
```

**Bước 2:** Send message với fileId

```bash
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "content": "Báo cáo tháng 12",
    "parentMessageId": null,
    "mentions": null,
    "attachment": {
      "fileId": "8f85d64a-1234-5678-abcd-1234567890ab",
      "fileName": "test-file.pdf",
      "fileSize": 2621440,
      "contentType": "application/pdf"
    }
  }' | jq '.' > send-with-attachment.json
```

#### Send Reply with Mention

```bash
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "content": "@john Please review this",
    "parentMessageId": "9c75d64a-2345-6789-bcde-2345678901bc",
    "mentions": [
      {
        "userId": "a185f64b-3456-7890-cdef-3456789012cd",
        "startIndex": 0,
        "length": 5,
        "mentionText": "@john"
      }
    ],
    "attachment": null
  }' | jq '.' > send-reply-with-mention.json
```

#### Capture Error Responses

**400 Bad Request:**

```bash
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Missing conversationId"
  }' | jq '.' > error-400-validation.json
```

**403 Forbidden:**

```bash
# Use a conversation where user is NOT a member
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "not-a-member-conversation-id",
    "content": "This should fail"
  }' | jq '.' > error-403-forbidden.json
```

**404 Not Found:**

```bash
# Use a non-existent conversation ID
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "00000000-0000-0000-0000-000000000000",
    "content": "This should fail"
  }' | jq '.' > error-404-not-found.json
```

---

## 📋 Snapshot Format

Mỗi file snapshot nên có format sau:

```json
{
  "_meta": {
    "capturedAt": "2026-01-07T10:30:00Z",
    "environment": "dev",
    "apiVersion": "v1",
    "endpoint": "POST /api/messages",
    "description": "Send text message only"
  },
  "_request": {
    "headers": {
      "Authorization": "Bearer [REDACTED]",
      "Content-Type": "application/json"
    },
    "body": {
      "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "content": "Hello team!",
      "parentMessageId": null,
      "mentions": null,
      "attachment": null
    }
  },
  "_response": {
    "status": 201,
    "headers": {
      "content-type": "application/json"
    },
    "body": {
      "id": "1a95f64c-4567-8901-def0-4567890123de",
      "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "senderId": "b285f64d-5678-9012-ef01-5678901234ef",
      "senderName": "nguyenvana",
      "content": "Hello team!",
      "contentType": "TXT",
      "sentAt": "2026-01-07T10:30:00Z",
      "attachments": null,
      "replyCount": 0,
      "isStarred": false,
      "isPinned": false
    }
  }
}
```

**Hoặc đơn giản hơn (chỉ response body):**

```json
{
  "id": "1a95f64c-4567-8901-def0-4567890123de",
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "senderId": "b285f64d-5678-9012-ef01-5678901234ef",
  "senderName": "nguyenvana",
  "content": "Hello team!",
  "contentType": "TXT",
  "sentAt": "2026-01-07T10:30:00Z"
}
```

---

## ⏳ Current Status

| Snapshot                     | Status     | Notes             |
| ---------------------------- | ---------- | ----------------- |
| send-text-only.json          | ⏳ Pending | Chờ HUMAN capture |
| send-with-attachment.json    | ⏳ Pending | Chờ HUMAN capture |
| send-reply-with-mention.json | ⏳ Pending | Optional          |
| error-400-validation.json    | ⏳ Pending | Chờ HUMAN capture |
| error-403-forbidden.json     | ⏳ Pending | Optional          |
| error-404-not-found.json     | ⏳ Pending | Optional          |

---

## 📝 Notes for HUMAN

1. **Test credentials:**

   - Cần có access token hợp lệ
   - Cần có conversation ID để test
   - Cần upload file trước để có fileId

2. **Minimum snapshots required:**

   - ✅ `send-text-only.json` - Bắt buộc
   - ✅ `send-with-attachment.json` - Bắt buộc (vì đây là feature chính)
   - ✅ `error-400-validation.json` - Bắt buộc

3. **Optional snapshots:**

   - `send-reply-with-mention.json` - Nếu có thời gian
   - `error-403-forbidden.json` - Nếu có test conversation
   - `error-404-not-found.json` - Dễ test

4. **After capturing:**
   - Paste JSON vào file tương ứng
   - Update status table ở trên
   - Update `contract.md` status → ✅ READY

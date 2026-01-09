# API Contract: Send Message with Attachment

> **Endpoint:** `POST /api/messages`  
> **Module:** Chat  
> **Feature:** Send Message (Text + File Attachment)  
> **Version:** v1  
> **Status:** ✅ READY  
> **Last Updated:** 2026-01-07

---

## 📋 Overview

| Property           | Value                                        |
| ------------------ | -------------------------------------------- |
| **Endpoint**       | `POST /api/messages`                         |
| **Base URL**       | `https://vega-chat-api-dev.allianceitsc.com` |
| **Authentication** | Required (Bearer Token)                      |
| **Content-Type**   | `application/json`                           |
| **Rate Limit**     | Not specified                                |

---

## 🔑 Authentication

### Request Headers

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

---

## 📤 Request Body

### TypeScript Interface

```typescript
interface SendMessageRequest {
  conversationId: string; // UUID của conversation
  content: string | null; // Text content của message
  parentMessageId?: string | null; // UUID của message parent (for replies/threads)
  mentions?: MentionInputDto[] | null; // Array of user mentions
  attachment?: AttachmentInputDto | null; // ⚠️ SINGULAR - Only 1 file per message
}

interface AttachmentInputDto {
  fileId: string; // UUID - Returned from File Upload API
  fileName: string | null; // Original filename
  fileSize: number; // File size in bytes (int64)
  contentType: string | null; // MIME type (e.g., "application/pdf")
}

interface MentionInputDto {
  userId: string; // UUID
  startIndex: number; // int32
  length: number; // int32
  mentionText: string | null;
}
```

### Example - Text Only

```json
{
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "content": "Hello team!",
  "parentMessageId": null,
  "mentions": null,
  "attachment": null
}
```

### Example - Text + File Attachment

```json
{
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "content": "Báo cáo tháng 12",
  "parentMessageId": null,
  "mentions": null,
  "attachment": {
    "fileId": "8f85d64a-1234-5678-abcd-1234567890ab",
    "fileName": "bao-cao-thang-12.pdf",
    "fileSize": 2621440,
    "contentType": "application/pdf"
  }
}
```

### Example - Reply với Mention

```json
{
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
}
```

---

## ✅ Validation Rules

| Field             | Required       | Type    | Constraints                | Notes                     |
| ----------------- | -------------- | ------- | -------------------------- | ------------------------- |
| `conversationId`  | ✅ Yes         | UUID    | Must exist                 | User must be member       |
| `content`         | ⚠️ Conditional | string  | -                          | Required if no attachment |
| `parentMessageId` | ❌ No          | UUID?   | Must exist in conversation | For thread replies        |
| `mentions`        | ❌ No          | array?  | -                          | Auto-parsed from content  |
| `attachment`      | ❌ No          | object? | See below                  | **Only 1 file** allowed   |

### Attachment Validation

| Field         | Required | Type    | Constraints                  |
| ------------- | -------- | ------- | ---------------------------- |
| `fileId`      | ✅ Yes   | UUID    | Must be valid uploaded file  |
| `fileName`    | ❌ No    | string? | Original filename            |
| `fileSize`    | ✅ Yes   | int64   | > 0, ≤ 10MB (10485760 bytes) |
| `contentType` | ❌ No    | string? | Valid MIME type              |

**⚠️ Critical: API chỉ accept 1 file per message (singular `attachment`, not `attachments`)**

---

## 📥 Response Success (201 Created)

### TypeScript Interface

```typescript
interface MessageDto {
  id: string; // UUID
  conversationId: string; // UUID
  senderId: string; // UUID
  senderName: string | null;
  senderIdentifier: string | null;
  senderFullName: string | null;
  senderRoles: string | null;
  parentMessageId: string | null;
  content: string | null;
  contentType: "TXT" | "SYS" | "FILE" | "IMG" | "VID";
  sentAt: string; // ISO 8601 DateTime
  editedAt: string | null;
  linkedTaskId: string | null;
  reactions: ReactionDto[] | null;
  attachments: AttachmentDto[] | null; // ⚠️ Response uses PLURAL
  replyCount: number; // int32
  isStarred: boolean;
  isPinned: boolean;
  threadPreview: MessageDto | null;
  mentions: MessageMentionSummaryDto[] | null;
}

interface AttachmentDto {
  id: string; // UUID - Database ID
  fileId: string; // UUID - File storage ID
  fileName: string | null;
  fileSize: number; // int64
  contentType: string | null;
  createdAt: string; // ISO 8601
}
```

### Example Response

```json
{
  "id": "1a95f64c-4567-8901-def0-4567890123de",
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "senderId": "b285f64d-5678-9012-ef01-5678901234ef",
  "senderName": "nguyenvana",
  "senderFullName": "Nguyễn Văn A",
  "content": "Báo cáo tháng 12",
  "contentType": "TXT",
  "sentAt": "2026-01-07T10:30:00Z",
  "attachments": [
    {
      "id": "2b05f64e-6789-0123-f012-6789012345f0",
      "fileId": "8f85d64a-1234-5678-abcd-1234567890ab",
      "fileName": "bao-cao-thang-12.pdf",
      "fileSize": 2621440,
      "contentType": "application/pdf",
      "createdAt": "2026-01-07T10:30:00Z"
    }
  ],
  "replyCount": 0,
  "isStarred": false,
  "isPinned": false
}
```

---

## ❌ Error Responses

### 400 Bad Request

**Causes:**

- Missing required fields (`conversationId`)
- Invalid UUID format
- Content empty AND no attachment
- Invalid attachment data
- File size > 10MB

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "detail": "conversationId is required",
  "instance": "/api/messages"
}
```

### 403 Forbidden

**Causes:**

- User not member of conversation
- Conversation archived/deleted
- User banned from group

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403,
  "detail": "You are not a member of this conversation"
}
```

### 404 Not Found

**Causes:**

- Conversation không tồn tại
- Parent message không tồn tại (for replies)
- File ID không tồn tại

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Conversation not found"
}
```

### Error Codes Summary

| HTTP Status | Error Code                 | Description                          | User Action             |
| ----------- | -------------------------- | ------------------------------------ | ----------------------- |
| 400         | `VALIDATION_ERROR`         | Invalid request data                 | Fix request body        |
| 400         | `CONTENT_REQUIRED`         | Both content and attachment are null | Add text or file        |
| 400         | `FILE_TOO_LARGE`           | File size > 10MB                     | Reduce file size        |
| 400         | `INVALID_FILE_ID`          | File ID không hợp lệ                 | Re-upload file          |
| 403         | `NOT_MEMBER`               | User not in conversation             | Join conversation first |
| 403         | `CONVERSATION_ARCHIVED`    | Conversation is archived             | Cannot send message     |
| 404         | `CONVERSATION_NOT_FOUND`   | Conversation doesn't exist           | Check conversation ID   |
| 404         | `PARENT_MESSAGE_NOT_FOUND` | Parent message doesn't exist         | Check parent message ID |

---

## 🔗 Related APIs

- **Upload File:** `POST /api/Files?sourceModule=1` - Phải upload file trước khi send message
- **Get Messages:** `GET /api/conversations/{id}/messages` - Xem messages đã gửi
- **Edit Message:** `PUT /api/messages/{id}` - Sửa content (không sửa attachment)
- **Delete Message:** `DELETE /api/messages/{id}` - Xoá message

---

## 📸 Snapshots

- [`send-text-only.json`](./snapshots/v1/send-text-only.json) - Message không có file
- [`send-with-attachment.json`](./snapshots/v1/send-with-attachment.json) - Message có 1 file attachment
- [`send-reply-with-mention.json`](./snapshots/v1/send-reply-with-mention.json) - Reply message với mention
- [`error-400-validation.json`](./snapshots/v1/error-400-validation.json) - Validation error
- [`error-403-forbidden.json`](./snapshots/v1/error-403-forbidden.json) - Not member
- [`error-404-not-found.json`](./snapshots/v1/error-404-not-found.json) - Conversation not found

---

## ⚠️ CRITICAL NOTES

### 1. Attachment Asymmetry (Request vs Response)

```
REQUEST:  attachment: AttachmentInputDto     (SINGULAR)
RESPONSE: attachments: AttachmentDto[]       (PLURAL)
```

**Lý do:** Backend design choice - request 1 file, response array để consistent với existing messages.

### 2. Multiple Files Strategy

**API limitation:** Chỉ 1 file per message.

**Client solution (để gửi nhiều files):**

```typescript
// Option A: Sequential messages (Recommended)
for (const file of files) {
  await sendMessage({
    conversationId,
    content: index === 0 ? userText : "", // Chỉ gửi text ở message đầu
    attachment: { fileId: file.id, fileName: file.name, ... }
  });
}

// Option B: Single message with text only + warning
sendMessage({
  conversationId,
  content: userText,
  attachment: files[0] // Chỉ lấy file đầu
});
toast.warning(`Chỉ gửi được 1 file. ${files.length - 1} file còn lại bị bỏ qua.`);
```

**Quyết định:** ⏳ PENDING HUMAN DECISION (xem BƯỚC 4 trong implementation plan)

### 3. Content Type Auto-Detection

API **không tự động** set `contentType` dựa trên attachment. Frontend PHẢI:

```typescript
// ❌ Wrong
{
  content: "Check this file",
  contentType: "TXT", // ← Sai nếu có attachment
  attachment: { ... }
}

// ✅ Correct
{
  content: "Check this file",
  contentType: attachment ? "FILE" : "TXT", // ← Auto set based on attachment
  attachment: { ... }
}
```

### 4. FileId Lifecycle

```
1. User selects file → File object (local)
2. Upload to /api/Files → Get fileId (UUID)
3. Send message with fileId → Get MessageDto with AttachmentDto
4. Display message → Use fileId to generate download URL
```

**FileId MU ST be valid** - Backend validates before creating message.

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                                          | Status                                |
| ------------------------------------------------- | ------------------------------------- |
| Đã review API schema từ Swagger                   | ✅ Reviewed                           |
| Hiểu rõ attachment singular vs attachments plural | ✅ Understood                         |
| Quyết định strategy cho multiple files            | ✅ **Option A - Sequential Messages** |
| **APPROVED để implement code**                    | ✅ APPROVED                           |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-07

---

**Contract Version:** 1.0  
**Swagger Source:** https://vega-chat-api-dev.allianceitsc.com/swagger/v1/swagger.json  
**Schema Path:** `components.schemas.SendMessageRequest`

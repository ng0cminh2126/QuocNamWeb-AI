# API Contract: Upload File

> **Endpoint:** `POST /api/chat/conversations/{conversationId}/upload`  
> **Module:** Chat  
> **Feature:** File Upload trong Conversation  
> **Version:** v1  
> **Status:** ⏳ PENDING (Chờ HUMAN approve)

---

## 📋 Overview

| Property         | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Endpoint**     | `POST /api/chat/conversations/{conversationId}/upload` |
| **Base URL**     | `https://api.example.com` (từ env)                     |
| **Auth**         | ✅ Required (Bearer token)                             |
| **Content-Type** | `multipart/form-data`                                  |
| **Method**       | POST                                                   |

### Purpose

Upload files (ảnh, PDF, Excel, Word) vào conversation. Backend sẽ lưu file và trả về URL để gửi message.

---

## 📤 Request

### Path Parameters

| Name             | Type   | Required | Description         |
| ---------------- | ------ | -------- | ------------------- |
| `conversationId` | string | ✅       | ID của conversation |

### Headers

```http
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

### Request Body (multipart/form-data)

| Field  | Type   | Required | Description                          | Max Size |
| ------ | ------ | -------- | ------------------------------------ | -------- |
| `file` | File   | ✅       | File to upload                       | 10MB     |
| `type` | string | ⬜       | File type hint ("image", "document") | -        |

### Allowed File Types

| Category | MIME Types                                                                                      | Extensions                     |
| -------- | ----------------------------------------------------------------------------------------------- | ------------------------------ |
| Image    | `image/jpeg`, `image/png`, `image/gif`, `image/webp`                                            | .jpg, .jpeg, .png, .gif, .webp |
| PDF      | `application/pdf`                                                                               | .pdf                           |
| Word     | `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | .doc, .docx                    |
| Excel    | `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | .xls, .xlsx                    |

### TypeScript Interface

```typescript
interface UploadFileRequest {
  file: File;
  type?: "image" | "document";
}
```

### Example Request

```typescript
const formData = new FormData();
formData.append("file", fileObject); // File from <input type="file">
formData.append("type", "document");

const response = await fetch("/api/chat/conversations/conv-123/upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    // NO Content-Type - Browser sets automatically for FormData
  },
  body: formData,
});
```

### Validation Rules

| Rule                | Validation                          | Error Code               |
| ------------------- | ----------------------------------- | ------------------------ |
| File required       | `file` field must be present        | `FILE_REQUIRED`          |
| File size           | Max 10MB                            | `FILE_TOO_LARGE`         |
| File type           | Must be in allowed types            | `INVALID_FILE_TYPE`      |
| Conversation exists | `conversationId` must be valid      | `CONVERSATION_NOT_FOUND` |
| User has access     | User must be member of conversation | `ACCESS_DENIED`          |

---

## 📥 Response

### Success Response (200 OK)

```typescript
interface UploadFileResponse {
  fileId: string; // Unique ID của file
  fileName: string; // Tên file gốc
  fileUrl: string; // URL để download
  fileSize: number; // Size in bytes
  mimeType: string; // MIME type
  uploadedAt: string; // ISO timestamp
}
```

### Example Success Response

```json
{
  "fileId": "file-abc123",
  "fileName": "report.pdf",
  "fileUrl": "https://storage.example.com/files/conv-123/file-abc123.pdf",
  "fileSize": 2457600,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-01-06T10:30:00Z"
}
```

### Error Responses

| Status | Code                     | Message                         | Cause                  |
| ------ | ------------------------ | ------------------------------- | ---------------------- |
| 400    | `FILE_REQUIRED`          | File is required                | Missing file           |
| 400    | `FILE_TOO_LARGE`         | File size exceeds 10MB limit    | File > 10MB            |
| 400    | `INVALID_FILE_TYPE`      | File type not allowed           | Wrong extension/MIME   |
| 401    | `UNAUTHORIZED`           | Invalid or missing token        | Auth failure           |
| 403    | `ACCESS_DENIED`          | User not member of conversation | Permission denied      |
| 404    | `CONVERSATION_NOT_FOUND` | Conversation not found          | Invalid conversationId |
| 500    | `UPLOAD_FAILED`          | Failed to upload file           | Server error           |

### Example Error Response

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 10MB limit",
    "details": {
      "maxSize": 10485760,
      "actualSize": 15728640
    }
  }
}
```

---

## 🔄 Integration Flow

```
User chọn file
  ↓
Validate client-side (size, type)
  ↓
Show loading indicator
  ↓
POST /api/chat/conversations/{id}/upload
  ↓
Backend lưu file → Storage (S3, Azure Blob, etc.)
  ↓
Response với fileUrl
  ↓
Client gọi POST /api/chat/conversations/{id}/messages
với attachment.url = fileUrl từ upload response
  ↓
Message với file được tạo
  ↓
SignalR broadcast message mới
```

---

## 🧪 Test Scenarios

### Happy Path

- Upload image (2MB .jpg) → Success 200
- Upload PDF (5MB .pdf) → Success 200
- Upload Excel (1MB .xlsx) → Success 200

### Error Cases

- Upload 15MB file → 400 FILE_TOO_LARGE
- Upload .exe file → 400 INVALID_FILE_TYPE
- Upload without token → 401 UNAUTHORIZED
- Upload to other user's conversation → 403 ACCESS_DENIED
- Upload to non-existent conversation → 404 CONVERSATION_NOT_FOUND

---

## 📊 Performance

| Metric          | Target     |
| --------------- | ---------- |
| Upload speed    | ~1MB/s     |
| Max upload time | 10s        |
| Retry           | 3 attempts |

---

## 🔗 Related Endpoints

- [Send Message](../conversation-details-phase-1/contract.md#post-messages) - Gửi message với file đã upload
- [Get Messages](../conversation-details-phase-1/contract.md#get-messages) - Lấy messages có attachments

---

## 📋 PENDING DECISIONS

| #   | Question              | Options                    | HUMAN Decision |
| --- | --------------------- | -------------------------- | -------------- |
| 1   | Storage location      | S3, Azure Blob, or local?  | ⬜ **\_\_\_**  |
| 2   | File retention        | 30 days, 90 days, forever? | ⬜ **\_\_\_**  |
| 3   | CDN for file delivery | CloudFront, CloudFlare?    | ⬜ **\_\_\_**  |
| 4   | Thumbnail for images  | Auto-generate or not?      | ⬜ **\_\_\_**  |
| 5   | Virus scan            | Enable or not?             | ⬜ **\_\_\_**  |

---

## ✅ HUMAN CONFIRMATION

| Item                     | Status         |
| ------------------------ | -------------- |
| API spec reviewed        | ⬜ Chưa review |
| Snapshots captured       | ⬜ Chưa có     |
| Pending decisions filled | ⬜ Chưa điền   |
| **STATUS**               | ⏳ PENDING     |

**HUMAN Signature:** **\_\_**  
**Date:** **\_\_**

> ⚠️ AI KHÔNG ĐƯỢC code nếu status ≠ ✅ READY

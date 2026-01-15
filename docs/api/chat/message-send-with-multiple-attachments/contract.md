# API Contract - Send Message with Multiple Attachments

> **API:** POST /api/messages  
> **Module:** chat  
> **Feature:** message-send-with-multiple-attachments  
> **Version:** 2.0.0 (Updated from 1.0)  
> **Status:** ⏳ PENDING SNAPSHOTS  
> **Created:** 2026-01-14

---

## 📋 Overview

| Property      | Value                                                  |
| ------------- | ------------------------------------------------------ |
| Endpoint      | `POST /api/messages`                                   |
| Base URL      | `https://vega-chat-api-dev.allianceitsc.com`           |
| Method        | POST                                                   |
| Content-Type  | `application/json`                                     |
| Auth Required | ✅ Yes (Bearer token)                                  |
| Description   | Send a message with optional multiple file attachments |

---

## 🔄 Breaking Changes from v1.0

| Field         | v1.0 (Phase 1)                 | v2.0 (Phase 2)                  | Impact       |
| ------------- | ------------------------------ | ------------------------------- | ------------ |
| `attachment`  | `AttachmentInputDto?` (single) | ❌ REMOVED                      | **BREAKING** |
| `attachments` | ❌ Not existed                 | `AttachmentInputDto[]?` (array) | **NEW**      |

**Migration Guide:**

```typescript
// v1.0 (OLD - Phase 1)
{
  conversationId: "abc123",
  content: "Here is the file",
  attachment: {
    fileId: "file-123",
    fileName: "report.pdf",
    fileSize: 2621440,
    fileType: "application/pdf",
    thumbnailUrl: "https://..."
  }
}

// v2.0 (NEW - Phase 2)
{
  conversationId: "abc123",
  content: "Here are the files",
  attachments: [
    {
      fileId: "file-123",
      fileName: "report.pdf",
      fileSize: 2621440,
      fileType: "application/pdf",
      thumbnailUrl: "https://..."
    },
    {
      fileId: "file-456",
      fileName: "photo.jpg",
      fileSize: 3984128,
      fileType: "image/jpeg",
      thumbnailUrl: "https://..."
    }
  ]
}
```

---

## 📥 Request

### Headers

```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Request Body

**TypeScript Interface:**

```typescript
interface SendMessageRequest {
  conversationId: string;
  content: string;
  attachments?: AttachmentInputDto[]; // NEW: Array instead of single
  mentions?: MentionInputDto[];
  parentMessageId?: string; // For thread replies
}

interface AttachmentInputDto {
  fileId: string; // From upload API response
  fileName: string;
  fileSize: number; // Bytes
  fileType: string; // MIME type
  thumbnailUrl?: string; // For images
}

interface MentionInputDto {
  userId: string;
  displayName: string;
  startIndex: number;
  length: number;
}
```

**Example Request Body (Multiple Attachments):**

```json
{
  "conversationId": "conv-abc123",
  "content": "Here are the files from our meeting",
  "attachments": [
    {
      "fileId": "f7b3c4a1-2d5e-4f8a-9b1c-3e4d5f6a7b8c",
      "fileName": "meeting-notes.pdf",
      "fileSize": 2621440,
      "fileType": "application/pdf"
    },
    {
      "fileId": "a8c2d3e4-5f6g-7h8i-9j0k-1l2m3n4o5p6q",
      "fileName": "photo1.jpg",
      "fileSize": 3984128,
      "fileType": "image/jpeg",
      "thumbnailUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/a8c2d3e4-.../thumbnail"
    },
    {
      "fileId": "b9d3e4f5-6g7h-8i9j-0k1l-2m3n4o5p6q7r",
      "fileName": "photo2.jpg",
      "fileSize": 4123456,
      "fileType": "image/jpeg",
      "thumbnailUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/b9d3e4f5-.../thumbnail"
    }
  ]
}
```

**Example Request Body (Single Attachment - Backward Compatible):**

```json
{
  "conversationId": "conv-abc123",
  "content": "Here is the file",
  "attachments": [
    {
      "fileId": "f7b3c4a1-2d5e-4f8a-9b1c-3e4d5f6a7b8c",
      "fileName": "report.pdf",
      "fileSize": 2621440,
      "fileType": "application/pdf"
    }
  ]
}
```

**Example Request Body (No Attachments):**

```json
{
  "conversationId": "conv-abc123",
  "content": "Hello! This is a text-only message"
}
```

### Validation Rules

| Field                  | Type                 | Required | Max Length | Notes                          |
| ---------------------- | -------------------- | -------- | ---------- | ------------------------------ |
| conversationId         | string (GUID)        | ✅ Yes   | -          | Must be valid conversation ID  |
| content                | string               | ✅ Yes   | 5000       | Cannot be empty or whitespace  |
| attachments            | AttachmentInputDto[] | ❌ No    | 10 items   | Max 10 attachments per message |
| attachments[].fileId   | string (GUID)        | ✅ Yes   | -          | Must be valid uploaded file ID |
| attachments[].fileName | string               | ✅ Yes   | 255        | -                              |
| attachments[].fileSize | number (integer)     | ✅ Yes   | -          | Bytes, must be > 0             |
| attachments[].fileType | string (MIME)        | ✅ Yes   | 100        | Valid MIME type                |
| mentions               | MentionInputDto[]    | ❌ No    | 50         | Max 50 mentions                |
| parentMessageId        | string (GUID)        | ❌ No    | -          | For thread replies             |

---

## 📤 Response

### Success Response (200 OK)

**TypeScript Interface:**

```typescript
interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  contentType: MessageContentType;
  attachments?: AttachmentDto[]; // NEW: Array
  mentions?: MessageMentionSummaryDto[];
  reactions?: ReactionSummaryDto[];
  isStarred: boolean;
  isPinned: boolean;
  parentMessageId?: string;
  threadSummary?: ThreadSummaryDto;
  createdAt: string; // ISO 8601
  updatedAt?: string;
  deletedAt?: string;
}

interface AttachmentDto {
  id: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  downloadUrl: string;
}

enum MessageContentType {
  Text = 0,
  Image = 1,
  File = 2,
  System = 3,
}
```

**Example Success Response (Multiple Attachments):**

```json
{
  "id": "msg-xyz789",
  "conversationId": "conv-abc123",
  "senderId": "user-123",
  "senderName": "John Doe",
  "senderAvatar": "https://avatar.url/john.jpg",
  "content": "Here are the files from our meeting",
  "contentType": 2,
  "attachments": [
    {
      "id": "att-001",
      "fileId": "f7b3c4a1-2d5e-4f8a-9b1c-3e4d5f6a7b8c",
      "fileName": "meeting-notes.pdf",
      "fileSize": 2621440,
      "fileType": "application/pdf",
      "fileUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/f7b3c4a1-.../download",
      "downloadUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/f7b3c4a1-.../download"
    },
    {
      "id": "att-002",
      "fileId": "a8c2d3e4-5f6g-7h8i-9j0k-1l2m3n4o5p6q",
      "fileName": "photo1.jpg",
      "fileSize": 3984128,
      "fileType": "image/jpeg",
      "fileUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/a8c2d3e4-.../download",
      "thumbnailUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/a8c2d3e4-.../thumbnail",
      "downloadUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/a8c2d3e4-.../download"
    },
    {
      "id": "att-003",
      "fileId": "b9d3e4f5-6g7h-8i9j-0k1l-2m3n4o5p6q7r",
      "fileName": "photo2.jpg",
      "fileSize": 4123456,
      "fileType": "image/jpeg",
      "fileUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/b9d3e4f5-.../download",
      "thumbnailUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/b9d3e4f5-.../thumbnail",
      "downloadUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/b9d3e4f5-.../download"
    }
  ],
  "mentions": [],
  "reactions": [],
  "isStarred": false,
  "isPinned": false,
  "createdAt": "2026-01-14T10:30:00Z",
  "updatedAt": "2026-01-14T10:30:00Z"
}
```

### Error Responses

| Status | Code                   | Message                            | When                          |
| ------ | ---------------------- | ---------------------------------- | ----------------------------- |
| 400    | `InvalidRequest`       | Content is required                | Content rỗng                  |
| 400    | `TooManyAttachments`   | Maximum 10 attachments per message | attachments.length > 10       |
| 400    | `InvalidFileId`        | File ID {fileId} not found         | fileId không tồn tại          |
| 400    | `ConversationNotFound` | Conversation {id} not found        | conversationId không hợp lệ   |
| 401    | `Unauthorized`         | Authentication required            | Missing/invalid token         |
| 403    | `Forbidden`            | Not a member of this conversation  | User không phải member        |
| 404    | `NotFound`             | Parent message {id} not found      | parentMessageId không tồn tại |
| 500    | `ServerError`          | Internal server error              | Server exception              |

**Error Response Format:**

```typescript
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}
```

**Example Error Response (400 - Too Many Attachments):**

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Maximum 10 attachments per message. You provided 12 attachments.",
  "instance": "/api/messages",
  "errors": {
    "attachments": ["Maximum 10 attachments allowed"]
  }
}
```

---

## 🔗 Snapshots

> ⚠️ **STATUS:** Chưa có snapshot thực tế từ API  
> **Action Required:** HUMAN cần capture response bằng cách:

### Cách capture snapshot:

**Using cURL:**

```bash
# Success - Multiple attachments (3 files)
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "YOUR_CONVERSATION_ID",
    "content": "Test message with 3 files",
    "attachments": [
      { "fileId": "FILE_ID_1", "fileName": "file1.pdf", "fileSize": 100000, "fileType": "application/pdf" },
      { "fileId": "FILE_ID_2", "fileName": "photo1.jpg", "fileSize": 200000, "fileType": "image/jpeg", "thumbnailUrl": "..." },
      { "fileId": "FILE_ID_3", "fileName": "photo2.jpg", "fileSize": 300000, "fileType": "image/jpeg", "thumbnailUrl": "..." }
    ]
  }' \
  > snapshots/v2/success-3-attachments.json

# Error - Too many attachments
curl -X POST "https://vega-chat-api-dev.allianceitsc.com/api/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "YOUR_CONVERSATION_ID",
    "content": "Test with 12 files",
    "attachments": [/* 12 items */]
  }' \
  > snapshots/v2/error-400-too-many-attachments.json
```

**Required Snapshots:**

- [ ] `snapshots/v2/success-3-attachments.json` - Send với 3 files (1 PDF + 2 images)
- [ ] `snapshots/v2/success-1-attachment.json` - Send với 1 file (backward compatible)
- [ ] `snapshots/v2/success-max-attachments.json` - Send với 10 files (max limit)
- [ ] `snapshots/v2/success-no-attachments.json` - Send text-only (no files)
- [ ] `snapshots/v2/error-400-too-many.json` - Vượt quá 10 attachments
- [ ] `snapshots/v2/error-400-invalid-file-id.json` - File ID không tồn tại
- [ ] `snapshots/v2/error-401-unauthorized.json` - Missing token

### Snapshot Links:

- [Success - 3 Attachments](./snapshots/v2/success-3-attachments.json) ⏳ PENDING
- [Success - 1 Attachment](./snapshots/v2/success-1-attachment.json) ⏳ PENDING
- [Success - Max 10 Attachments](./snapshots/v2/success-max-attachments.json) ⏳ PENDING
- [Success - No Attachments](./snapshots/v2/success-no-attachments.json) ⏳ PENDING
- [Error - Too Many](./snapshots/v2/error-400-too-many.json) ⏳ PENDING
- [Error - Invalid File ID](./snapshots/v2/error-400-invalid-file-id.json) ⏳ PENDING
- [Error - Unauthorized](./snapshots/v2/error-401-unauthorized.json) ⏳ PENDING

---

## 📝 Implementation Notes

### Client-side (TypeScript)

```typescript
// src/api/messages.api.ts
export async function sendMessage(
  request: SendMessageRequest
): Promise<MessageDto> {
  const response = await client.post<MessageDto>("/api/messages", request);
  return response.data;
}
```

### Usage in Hook (Updated for Phase 2)

```typescript
// src/hooks/mutations/useSendMessage.ts
import { useMutation } from "@tanstack/react-query";
import { sendMessage } from "@/api/messages.api";
import type { SendMessageRequest, MessageDto } from "@/types/messages";

export function useSendMessage() {
  return useMutation({
    mutationFn: (request: SendMessageRequest) => sendMessage(request),
    onSuccess: (message) => {
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({
        queryKey: messagesKeys.list(message.conversationId),
      });
    },
  });
}
```

### Integration with Batch Upload

```typescript
// src/features/portal/workspace/ChatMainContainer.tsx
const handleSendMessage = async () => {
  try {
    // Step 1: Upload files (batch or single)
    let uploadedFiles: UploadedFile[] = [];

    if (selectedFiles.length === 1) {
      // Use single upload API (Phase 1)
      const result = await uploadFile(selectedFiles[0]);
      uploadedFiles = [result];
    } else if (selectedFiles.length > 1) {
      // Use batch upload API (Phase 2)
      const batchResult = await uploadFilesBatch(selectedFiles);
      uploadedFiles = batchResult.results
        .filter(r => r.success)
        .map(r => ({ fileId: r.fileId!, fileName: r.fileName, ... }));

      if (batchResult.failureCount > 0) {
        toast.error(`${batchResult.failureCount} files failed to upload`);
      }
    }

    // Step 2: Send message with multiple attachments
    const attachments = uploadedFiles.map(file => ({
      fileId: file.fileId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.contentType,
      thumbnailUrl: file.thumbnailUrl,
    }));

    await sendMessage({
      conversationId: currentConversationId,
      content: messageContent,
      attachments, // Array of attachments
    });

    toast.success('Message sent!');
  } catch (error) {
    toast.error('Failed to send message');
  }
};
```

---

## ✅ HUMAN CONFIRMATION

| Hạng mục               | Status               |
| ---------------------- | -------------------- |
| Đã review API contract | ⬜ Chưa review       |
| Đã capture snapshots   | ⬜ Chưa có           |
| **Contract status**    | ⏳ PENDING SNAPSHOTS |

**HUMAN Signature:** [CHƯA DUYỆT]  
**Date:** ****\_\_\_****

> ⚠️ **Contract status = ⏳ PENDING khi chưa có snapshots**  
> ✅ **Contract status = READY khi đã có snapshots + confirmed**

---

## 🔗 References

- [Swagger Documentation](https://vega-chat-api-dev.allianceitsc.com/swagger/index.html)
- [Phase 1 - Single Attachment](../../chat/send-message/contract.md) (if exists)
- [Batch Upload API](../../file/batch-upload/contract.md)
- [Feature Requirements](../../../../modules/chat/features/file-upload-phase-2/01_requirements.md)

---

## 📋 Upgrade Guide (v1.0 → v2.0)

### Code Changes Required:

**Before (Phase 1):**

```typescript
await sendMessage({
  conversationId: "conv-123",
  content: "Hello",
  attachment: {
    // Single object
    fileId: "file-123",
    fileName: "report.pdf",
    fileSize: 100000,
    fileType: "application/pdf",
  },
});
```

**After (Phase 2):**

```typescript
await sendMessage({
  conversationId: "conv-123",
  content: "Hello",
  attachments: [
    // Array
    {
      fileId: "file-123",
      fileName: "report.pdf",
      fileSize: 100000,
      fileType: "application/pdf",
    },
  ],
});
```

### Type Changes:

```typescript
// Update type definition
interface SendMessageRequest {
  conversationId: string;
  content: string;
  // attachment?: AttachmentInputDto; // ❌ REMOVE
  attachments?: AttachmentInputDto[]; // ✅ ADD
  mentions?: MentionInputDto[];
  parentMessageId?: string;
}
```

### Impact:

- **Breaking:** Existing code sử dụng `attachment` sẽ fail
- **Solution:** Update all usages to use `attachments` array
- **Backward Compatible:** Server có thể support cả 2 (nếu backend implement)

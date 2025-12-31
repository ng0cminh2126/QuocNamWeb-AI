# API Contract - Conversation Detail

> **Feature:** Chi tiết đoạn chat  
> **Status:** ✅ READY - Đã có snapshots  
> **Last Updated:** 2025-12-30

---

## 📋 Overview

| Property      | Value                                        |
| ------------- | -------------------------------------------- |
| Base URL      | `https://vega-chat-api-dev.allianceitsc.com` |
| Auth Required | ✅ Yes - Bearer Token                        |
| Content-Type  | `application/json`                           |

---

## 📡 Endpoints

### 1. GET /api/conversations/{guid}/messages - Lấy tin nhắn

Lấy danh sách messages trong một conversation (group hoặc DM).

**Request:**

```http
GET /api/conversations/{guid}/messages?limit=50
Authorization: Bearer {accessToken}
```

**Parameters:**

| Param  | Type           | Required | Default | Description                      |
| ------ | -------------- | -------- | ------- | -------------------------------- |
| guid   | string (path)  | ✅       | -       | UUID của conversation hoặc group |
| limit  | number (query) | ❌       | 50      | Số messages tối đa trả về        |
| cursor | string (query) | ❌       | -       | Cursor để lấy page tiếp theo     |

**Response (200 OK):**

```typescript
interface GetMessagesResponse {
  items: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface Message {
  id: string; // UUID của message
  conversationId: string; // UUID của conversation
  senderId: string; // UUID của người gửi
  senderName: string; // Tên người gửi
  parentMessageId: string | null; // UUID của message cha (nếu là reply)
  content: string; // Nội dung tin nhắn
  contentType: ContentType; // Loại nội dung
  sentAt: string; // ISO datetime - thời gian gửi
  editedAt: string | null; // ISO datetime - thời gian edit
  linkedTaskId: string | null; // UUID của task liên kết
  reactions: Reaction[]; // Danh sách reactions
  attachments: Attachment[]; // Danh sách file đính kèm
  replyCount: number; // Số reply
  isStarred: boolean; // Đã đánh dấu sao
  isPinned: boolean; // Đã ghim
  threadPreview: any | null; // Preview của thread
  mentions: string[]; // Danh sách user được mention
}

type ContentType = "TXT" | "IMG" | "FILE" | "TASK";

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
}
```

**Snapshot:** [get-messages-success.json](snapshots/v1/get-messages-success.json)

---

### 2. POST /api/conversations/{guid}/messages - Gửi tin nhắn

> ⚠️ **Chờ HUMAN xác nhận** - API này cần được test và capture snapshot

**Request:**

```http
POST /api/conversations/{guid}/messages
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "content": "Nội dung tin nhắn",
  "contentType": "TXT",
  "parentMessageId": null,
  "attachments": []
}
```

**Expected Response (201 Created):**

```typescript
interface SendMessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  contentType: string;
  sentAt: string;
  // ... other fields
}
```

---

## 🔑 Authentication

```http
Authorization: Bearer {accessToken}
```

---

## 📊 Pagination

API sử dụng **cursor-based pagination**:

```typescript
{
  items: Message[];
  nextCursor: string | null;  // Để lấy page cũ hơn
  hasMore: boolean;
}
```

**Load more messages (cũ hơn):**

```http
GET /api/conversations/{guid}/messages?limit=50&cursor={nextCursor}
```

---

## 📝 Content Types

| Type   | Description         | Example               |
| ------ | ------------------- | --------------------- |
| `TXT`  | Text message        | "Xin chào!"           |
| `IMG`  | Image attachment    | Has attachments array |
| `FILE` | File attachment     | Has attachments array |
| `TASK` | Task linked message | Has linkedTaskId      |

---

## ❌ Error Responses

| Status | Code                  | Description                     |
| ------ | --------------------- | ------------------------------- |
| 401    | Unauthorized          | Token không hợp lệ              |
| 403    | Forbidden             | Không có quyền xem conversation |
| 404    | Not Found             | Conversation không tồn tại      |
| 500    | Internal Server Error | Lỗi server                      |

---

## 📂 Snapshots

| File                                                                | Description             | Status     |
| ------------------------------------------------------------------- | ----------------------- | ---------- |
| [get-messages-success.json](snapshots/v1/get-messages-success.json) | GET messages thành công | ✅         |
| send-message-success.json                                           | POST message thành công | ⏳ Pending |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                         | Status       |
| -------------------------------- | ------------ |
| GET messages API đúng            | ✅ Confirmed |
| GET messages snapshot captured   | ✅ Done      |
| POST message API cần confirm     | ⏳ Pending   |
| **READY for GET implementation** | ✅ READY     |

**Confirmed by:** HUMAN  
**Date:** 2025-12-30

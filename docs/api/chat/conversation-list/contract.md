# API Contract - Conversation List

> **Feature:** Danh sách đoạn chat  
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

### 1. GET /api/groups - Danh sách Nhóm

Lấy danh sách tất cả group conversations mà user tham gia.

**Request:**

```http
GET /api/groups
Authorization: Bearer {accessToken}
```

**Response (200 OK):**

```typescript
interface GetGroupsResponse {
  items: GroupConversation[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface GroupConversation {
  id: string; // UUID của group
  type: "GRP"; // Luôn là "GRP"
  name: string; // Tên nhóm
  description: string; // Mô tả nhóm
  avatarFileId: string | null; // File ID của avatar
  createdBy: string; // UUID của người tạo
  createdByName: string; // Tên người tạo
  createdAt: string; // ISO datetime
  updatedAt: string | null; // ISO datetime
  memberCount: number; // Số thành viên
  unreadCount: number; // Số tin chưa đọc
  lastMessage: LastMessage | null;
}

interface LastMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  parentMessageId: string | null;
  content: string;
  contentType: "TXT" | "IMG" | "FILE";
  sentAt: string; // ISO datetime
  editedAt: string | null;
  linkedTaskId: string | null;
  reactions: any[];
  attachments: any[];
  replyCount: number;
  isStarred: boolean;
  isPinned: boolean;
  threadPreview: any | null;
  mentions: any[];
}
```

**Snapshot:** [groups-success.json](snapshots/v1/groups-success.json)

---

### 2. GET /api/conversations - Danh sách Cá nhân (DM)

Lấy danh sách tất cả direct message conversations.

**Request:**

```http
GET /api/conversations
Authorization: Bearer {accessToken}
```

**Response (200 OK):**

```typescript
interface GetConversationsResponse {
  items: DirectConversation[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface DirectConversation {
  id: string; // UUID của conversation
  type: "DM"; // Luôn là "DM"
  name: string; // Format: "DM: {user1} <> {user2}"
  description: string | null;
  avatarFileId: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string | null;
  memberCount: 2; // Luôn là 2 cho DM
  unreadCount: number;
  lastMessage: LastMessage | null;
}
```

**Snapshot:** [conversations-success.json](snapshots/v1/conversations-success.json)

---

## 🔑 Authentication

Tất cả requests cần gửi Bearer token trong header:

```http
Authorization: Bearer {accessToken}
```

Token được lấy từ `useAuthStore().accessToken`

---

## 📊 Response Structure

### Pagination (Cursor-based)

API sử dụng **cursor-based pagination**:

```typescript
{
  items: T[];           // Danh sách items
  nextCursor: string | null;  // Cursor cho page tiếp theo (null nếu hết)
  hasMore: boolean;     // Còn data không
}
```

**Cách sử dụng:**

```http
GET /api/groups?cursor={nextCursor}
```

---

## ❌ Error Responses

| Status | Code                  | Description                     |
| ------ | --------------------- | ------------------------------- |
| 401    | Unauthorized          | Token không hợp lệ hoặc hết hạn |
| 403    | Forbidden             | Không có quyền truy cập         |
| 500    | Internal Server Error | Lỗi server                      |

---

## 📂 Snapshots

| File                                                                  | Description                       | Status |
| --------------------------------------------------------------------- | --------------------------------- | ------ |
| [groups-success.json](snapshots/v1/groups-success.json)               | GET /api/groups thành công        | ✅     |
| [conversations-success.json](snapshots/v1/conversations-success.json) | GET /api/conversations thành công | ✅     |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                     | Status       |
| ---------------------------- | ------------ |
| API spec đúng                | ✅ Confirmed |
| Snapshots captured           | ✅ Done      |
| **READY for implementation** | ✅ READY     |

**Confirmed by:** HUMAN  
**Date:** 2025-12-30

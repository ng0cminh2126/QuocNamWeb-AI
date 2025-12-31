# 💬 Chat Module - API Specification

> **Extracted from:** implementation_plan_20251226.md  
> **Last updated:** 2025-12-26

---

## 📡 REST Endpoints

### GET /api/groups/:groupId/messages

Lấy danh sách tin nhắn trong nhóm (có pagination).

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `workTypeId` | string | No | Filter theo loại việc |
| `before` | string | No | Message ID để paginate (cursor) |
| `limit` | number | No | Số lượng tin (default: 50) |

**Response:**
```typescript
interface MessagesResponse {
  data: Message[];
  hasMore: boolean;
  oldestMessageId?: string;
}

interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  type: "text" | "image" | "file" | "system";
  content?: string;
  files?: FileAttachment[];
  replyTo?: {
    id: string;
    type: "text" | "image" | "file";
    senderName: string;
    content?: string;
    files?: { name: string; url: string; type: string }[];
  };
  isPinned: boolean;
  workTypeId?: string;
  taskId?: string;
  createdAt: string;
  updatedAt?: string;
}

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: "image" | "pdf" | "excel" | "word" | "other";
  size: number;
  mimeType: string;
}
```

---

### POST /api/groups/:groupId/messages

Gửi tin nhắn mới.

**Request Body:**
```typescript
interface SendMessageRequest {
  type: "text" | "image" | "file";
  content?: string;
  fileIds?: string[];       // IDs từ upload trước đó
  replyToId?: string;
}
```

**Response:** `Message` object

---

### PATCH /api/messages/:id/pin

Pin hoặc unpin tin nhắn.

**Request Body:**
```typescript
interface PinMessageRequest {
  isPinned: boolean;
}
```

---

### GET /api/groups/:groupId/messages/pinned

Lấy danh sách tin nhắn đã pin.

**Response:**
```typescript
interface PinnedMessagesResponse {
  data: Message[];
}
```

---

### GET /api/groups/:groupId/messages/search

Tìm kiếm tin nhắn.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | Yes | Từ khóa tìm kiếm |
| `fromDate` | string | No | Từ ngày (ISO) |
| `toDate` | string | No | Đến ngày (ISO) |

**Response:**
```typescript
interface SearchMessagesResponse {
  data: Message[];
  total: number;
}
```

---

## 🔌 SignalR Hub

**Hub URL:** `/hubs/chat`

### Client → Server Methods

```typescript
// Tham gia room
JoinGroup(groupId: string): Promise<void>

// Rời room  
LeaveGroup(groupId: string): Promise<void>

// Typing indicator
SendTyping(groupId: string, isTyping: boolean): Promise<void>

// Mark as read
MarkAsRead(groupId: string, lastMessageId: string): Promise<void>
```

### Server → Client Events

```typescript
// Nhận tin nhắn mới
ReceiveMessage(message: Message): void

// Tin nhắn được update
MessageUpdated(message: Message): void

// Tin nhắn bị xoá
MessageDeleted(data: { messageId: string; groupId: string }): void

// User đang typing
UserTyping(data: {
  groupId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}): void

// Unread count thay đổi
UnreadUpdated(data: { groupId: string; unreadCount: number }): void
```

---

## 📊 Query Keys

```typescript
export const messagesKeys = {
  all: ['messages'] as const,
  lists: () => [...messagesKeys.all, 'list'] as const,
  list: (groupId: string, workTypeId?: string) => 
    [...messagesKeys.lists(), groupId, workTypeId] as const,
  pinned: (groupId: string) => 
    [...messagesKeys.all, 'pinned', groupId] as const,
  search: (groupId: string, query: string) =>
    [...messagesKeys.all, 'search', groupId, query] as const,
};
```

---

## 📋 Implementation Checklist

- [ ] `src/api/messages.api.ts` - API client functions
- [ ] `src/hooks/queries/useMessages.ts` - Infinite query hook
- [ ] `src/hooks/queries/usePinnedMessages.ts` - Pinned messages hook
- [ ] `src/hooks/mutations/useSendMessage.ts` - Send mutation
- [ ] `src/hooks/mutations/usePinMessage.ts` - Pin mutation
- [ ] `src/lib/signalr.ts` - SignalR client
- [ ] `src/hooks/useSignalR.ts` - SignalR hook
- [ ] Integrate `ChatMain.tsx`
- [ ] Integrate `MessageBubble.tsx`
- [ ] Integrate `PinnedMessagesPanel.tsx`

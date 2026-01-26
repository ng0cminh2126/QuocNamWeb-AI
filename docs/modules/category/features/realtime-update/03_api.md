# [BƯỚC 3] API Specification - Category List Real-time Update

**Feature:** Category List Real-time Update  
**Version:** 1.0  
**Date:** 2026-01-23  
**Status:** ✅ APPROVED

---

## 1. REST API

### GET /api/categories

**Swagger:** https://vega-chat-api-dev.allianceitsc.com/swagger/index.html

#### Request

```http
GET /api/categories
Authorization: Bearer {token}
```

**Headers:**

- `Authorization`: `Bearer <access_token>` (required)

**Query Parameters:** None

#### Response: 200 OK

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Team Development",
    "conversations": [
      {
        "conversationId": "8ba85f64-1234-4562-b3fc-2c963f66afa6",
        "conversationName": "Team Backend",
        "memberCount": 5,
        "lastMessage": {
          "messageId": "9ca85f64-5678-4562-b3fc-2c963f66afa6",
          "senderId": "1da85f64-9012-4562-b3fc-2c963f66afa6",
          "senderName": "John Doe",
          "content": "Đã hoàn thành task XYZ",
          "sentAt": "2026-01-23T10:30:00Z"
        }
      },
      {
        "conversationId": "7ea85f64-3456-4562-b3fc-2c963f66afa6",
        "conversationName": "Team Frontend",
        "memberCount": 3,
        "lastMessage": null
      }
    ]
  },
  {
    "id": "2fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Marketing",
    "conversations": []
  }
]
```

#### TypeScript Interface

```typescript
export interface CategoryDto {
  id: string;
  name: string;
  conversations: ConversationInfoDto[];
}

export interface ConversationInfoDto {
  conversationId: string;
  conversationName: string;
  memberCount: number;
  lastMessage: LastMessageDto | null;
}

export interface LastMessageDto {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string; // ISO 8601
}
```

#### Error Responses

| Status | Code                | Message               |
| ------ | ------------------- | --------------------- |
| 401    | Unauthorized        | Token invalid/expired |
| 403    | Forbidden           | User không có quyền   |
| 500    | InternalServerError | Server error          |

---

## 2. SignalR EVENTS

**Hub URL:** `https://vega-chat-api-dev.allianceitsc.com/chatHub`  
**Connection:** Existing in `src/lib/signalr.ts`

### Event 1: MessageSent

**Description:** Triggered khi có tin nhắn mới trong conversation.

**Event Name:** `"MessageSent"`

**Payload:**

```typescript
{
  message: {
    id: string;                    // Message ID
    conversationId: string;         // Conversation ID
    senderId: string;              // User ID người gửi
    senderName: string;            // Tên người gửi
    content: string;               // Nội dung tin nhắn
    sentAt: string;                // ISO 8601
    messageType?: string;          // "Text" | "File" | "Image"
    attachments?: Array<{...}>;    // (Optional) File attachments
  }
}
```

**Example:**

```json
{
  "message": {
    "id": "9ca85f64-5678-4562-b3fc-2c963f66afa6",
    "conversationId": "8ba85f64-1234-4562-b3fc-2c963f66afa6",
    "senderId": "1da85f64-9012-4562-b3fc-2c963f66afa6",
    "senderName": "John Doe",
    "content": "Hello team!",
    "sentAt": "2026-01-23T11:00:00Z",
    "messageType": "Text"
  }
}
```

**When to handle:**

- User ĐANG subscribe conversation (đã join)
- Update lastMessage trong cache
- Tính unreadCount (nếu cần)

---

### Event 2: MessageRead

**Description:** Triggered khi user đánh dấu tin nhắn đã đọc.

**Event Name:** `"MessageRead"`

**Payload:**

```typescript
{
  conversationId: string;  // Conversation ID
  userId: string;          // User đã đọc
  readAt?: string;         // (Optional) Timestamp
}
```

**Example:**

```json
{
  "conversationId": "8ba85f64-1234-4562-b3fc-2c963f66afa6",
  "userId": "1da85f64-9012-4562-b3fc-2c963f66afa6",
  "readAt": "2026-01-23T11:05:00Z"
}
```

**When to handle:**

- Reset unreadCount = 0 cho conversation này
- Hide badge trong UI

---

## 3. SignalR METHODS (Client → Server)

### Method 1: JoinConversation

**Description:** Subscribe vào conversation để nhận events.

```typescript
chatHub.joinConversation(conversationId: string): Promise<void>
```

**Example:**

```typescript
await chatHub.joinConversation("8ba85f64-1234-4562-b3fc-2c963f66afa6");
```

**Response:** `void` (success) hoặc throw error

---

### Method 2: LeaveConversation

**Description:** Unsubscribe khỏi conversation.

```typescript
chatHub.leaveConversation(conversationId: string): Promise<void>
```

**Example:**

```typescript
await chatHub.leaveConversation("8ba85f64-1234-4562-b3fc-2c963f66afa6");
```

**Response:** `void`

---

## 4. CLIENT-SIDE CALCULATIONS

### Unread Count Calculation

**Rule:** API **KHÔNG TRẢ** unreadCount. Phải tính client-side.

**Logic:**

```typescript
// Initialize: Khi load /categories lần đầu
conversation.unreadCount = 0; // Start from 0

// Update: Khi nhận MessageSent event
if (
  message.senderId !== currentUserId && // ❌ Không phải tin của mình
  !isConversationActive(message.conversationId) // ❌ Conversation không đang mở
) {
  conversation.unreadCount += 1; // ✅ Tăng unread
}

// Reset: Khi nhận MessageRead event
if (event.userId === currentUserId) {
  conversation.unreadCount = 0; // ✅ Reset về 0
}
```

**Storage:** Store trong TanStack Query cache (in-memory)

---

## 5. API CONTRACT SUMMARY

### Data Flow

```
┌──────────────────┐
│  REST API        │
│  /categories     │────▶ Initial data load
│                  │      • Categories
└──────────────────┘      • Conversations
                          • Last messages
                          • Member counts

┌──────────────────┐
│  SignalR Hub     │
│  /chatHub        │────▶ Real-time updates
│                  │      • MessageSent
└──────────────────┘      • MessageRead

┌──────────────────┐
│  Client Logic    │────▶ Calculated data
│  (React)         │      • unreadCount
└──────────────────┘      • UI state
```

### Type Changes Required

**File:** `src/types/categories.ts`

**Changes:**

```diff
export interface ConversationInfoDto {
  conversationId: string;
  conversationName: string;
- lastMessage?: string;
+ memberCount: number;
+ lastMessage: LastMessageDto | null;
}

+ export interface LastMessageDto {
+   messageId: string;
+   senderId: string;
+   senderName: string;
+   content: string;
+   sentAt: string;
+ }
```

---

## 6. API SNAPSHOTS

**Location:** `docs/api/category/list/snapshots/v1/`

**Files:**

- `success.json` - Full response with messages
- `empty-conversations.json` - Category không có conversations
- `no-last-message.json` - Conversation chưa có tin nhắn

**Snapshot Example:** See `success.json`:

```json
[
  {
    "id": "cat-001",
    "name": "Team Development",
    "conversations": [
      {
        "conversationId": "conv-001",
        "conversationName": "Team Backend",
        "memberCount": 5,
        "lastMessage": {
          "messageId": "msg-001",
          "senderId": "user-001",
          "senderName": "John Doe",
          "content": "Task completed",
          "sentAt": "2026-01-23T10:00:00Z"
        }
      }
    ]
  }
]
```

---

## 7. TESTING ENDPOINTS

**Development:**

- REST API: `https://vega-chat-api-dev.allianceitsc.com/api/categories`
- SignalR: `https://vega-chat-api-dev.allianceitsc.com/chatHub`
- Swagger: https://vega-chat-api-dev.allianceitsc.com/swagger/index.html

**Test Credentials:** See `.env.local`

```bash
VITE_API_BASE_URL=https://vega-chat-api-dev.allianceitsc.com
VITE_SIGNALR_HUB_URL=https://vega-chat-api-dev.allianceitsc.com/chatHub
```

---

## ✅ APPROVAL

| Item                | Status |
| ------------------- | ------ |
| Đã review API spec  | ⬜     |
| Đã verify Swagger   | ⬜     |
| Type changes hợp lý | ⬜     |
| **APPROVED**        | ⬜     |

**Signature:** **\*\***\_**\*\***  
**Date:** **\*\***\_**\*\***

> AI chỉ được tiếp tục khi APPROVED

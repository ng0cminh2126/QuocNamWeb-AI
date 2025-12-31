# [BƯỚC 1] Requirements - Conversation Detail

> **Feature:** Chi tiết đoạn chat  
> **Version:** 1.0.0  
> **Status:** ✅ APPROVED

---

## 📋 Functional Requirements

### FR-01: Header Area

| ID      | Requirement                              | Priority | Notes    |
| ------- | ---------------------------------------- | -------- | -------- |
| FR-01.1 | Hiển thị tên conversation (group/person) | HIGH     |          |
| FR-01.2 | Hiển thị avatar/initials                 | HIGH     |          |
| FR-01.3 | Hiển thị số thành viên (group)           | MEDIUM   |          |
| FR-01.4 | Hiển thị online status (DM)              | HIGH     | Realtime |
| FR-01.5 | Button toggle right panel                | MEDIUM   |          |
| FR-01.6 | Button back (mobile)                     | HIGH     |          |

### FR-02: Message List

| ID      | Requirement                      | Priority | Notes        |
| ------- | -------------------------------- | -------- | ------------ |
| FR-02.1 | Hiển thị danh sách messages      | HIGH     |              |
| FR-02.2 | Phân biệt sent/received messages | HIGH     | Bubble UI    |
| FR-02.3 | Hiển thị avatar sender (group)   | HIGH     |              |
| FR-02.4 | Hiển thị thời gian gửi           | HIGH     |              |
| FR-02.5 | Hiển thị trạng thái đã đọc       | MEDIUM   | ReceivedInfo |
| FR-02.6 | Infinite scroll (load more cũ)   | HIGH     |              |
| FR-02.7 | Auto scroll xuống tin mới        | HIGH     |              |
| FR-02.8 | Group messages theo ngày         | MEDIUM   | Date divider |

### FR-03: Message Types

| ID      | Requirement                     | Priority | Notes              |
| ------- | ------------------------------- | -------- | ------------------ |
| FR-03.1 | Text message                    | HIGH     |                    |
| FR-03.2 | Image attachment                | HIGH     | Preview + modal    |
| FR-03.3 | File attachment (PDF, DOC, etc) | HIGH     | Download link      |
| FR-03.4 | Reply message                   | MEDIUM   | Quote original     |
| FR-03.5 | System message                  | LOW      | "User joined", etc |

### FR-04: Message Input

| ID      | Requirement                         | Priority | Notes   |
| ------- | ----------------------------------- | -------- | ------- |
| FR-04.1 | Text input với multiline            | HIGH     |         |
| FR-04.2 | Send button                         | HIGH     |         |
| FR-04.3 | Attach file button                  | HIGH     |         |
| FR-04.4 | Attach image button                 | HIGH     |         |
| FR-04.5 | Enter to send (Shift+Enter newline) | MEDIUM   |         |
| FR-04.6 | Typing indicator                    | MEDIUM   | SignalR |
| FR-04.7 | Disable input khi sending           | MEDIUM   |         |

### FR-05: Real-time Updates (SignalR)

| ID      | Requirement                       | Priority | Notes                 |
| ------- | --------------------------------- | -------- | --------------------- |
| FR-05.1 | Nhận tin nhắn mới → thêm vào list | HIGH     |                       |
| FR-05.2 | Nhận typing indicator             | MEDIUM   | "[User] đang nhập..." |
| FR-05.3 | Nhận read receipt                 | MEDIUM   |                       |
| FR-05.4 | Nhận message reaction             | LOW      | Phase 2               |
| FR-05.5 | Nhận message deleted              | LOW      | Phase 2               |

### FR-06: Loading States

| ID      | Requirement                 | Priority | Notes       |
| ------- | --------------------------- | -------- | ----------- |
| FR-06.1 | Skeleton khi load initial   | HIGH     |             |
| FR-06.2 | Loading indicator load more | HIGH     | Top of list |
| FR-06.3 | Sending indicator           | HIGH     |             |
| FR-06.4 | Error retry send            | HIGH     |             |

---

## 🎨 UI Requirements

### UI-01: Layout

```
┌────────────────────────────────────────────────────────────┐
│ [←] [Avatar] Tên nhóm/người           [📎] [⋯] [Panel]    │ ← Header
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ─────────── Hôm nay ───────────                          │ ← Date divider
│                                                            │
│        ┌────────────────────┐                              │
│        │ Tin nhắn received  │ [12:30]                     │ ← Received
│        └────────────────────┘                              │
│                                                            │
│                     ┌────────────────────┐                 │
│          [12:35]    │ Tin nhắn sent      │                │ ← Sent
│                     └────────────────────┘                 │
│                                                            │
│  [User] đang nhập...                                      │ ← Typing
├────────────────────────────────────────────────────────────┤
│ [📎] [🖼️] │ Nhập tin nhắn...                    │ [Send]  │ ← Input
└────────────────────────────────────────────────────────────┘
```

### UI-02: Message Bubble

| Type     | Style                                          |
| -------- | ---------------------------------------------- |
| Sent     | Background brand-600, text white, align right  |
| Received | Background gray-100, text gray-900, align left |
| System   | Center, italic, gray-500                       |

### UI-03: Responsive

| Breakpoint | Behavior                         |
| ---------- | -------------------------------- |
| Desktop    | Full layout với right panel      |
| Tablet     | Right panel có thể collapse      |
| Mobile     | Full screen, back button to list |

---

## 🔐 Security Requirements

| ID     | Requirement                         | Notes             |
| ------ | ----------------------------------- | ----------------- |
| SEC-01 | Gửi Bearer token trong API request  |                   |
| SEC-02 | Validate message content trước send | XSS prevention    |
| SEC-03 | File upload size limit              | Max 10MB          |
| SEC-04 | File type validation                | Server-side check |

---

## 🔗 API Requirements

> ✅ **API đã được xác nhận** - Xem chi tiết: [contract.md](../../../api/chat/conversation-detail/contract.md)

### Base URL

```
https://vega-chat-api-dev.allianceitsc.com
```

### Endpoints

| Endpoint                             | Method | Description      | Status     |
| ------------------------------------ | ------ | ---------------- | ---------- |
| `/api/conversations/{guid}/messages` | GET    | Lấy messages     | ✅ Ready   |
| `/api/conversations/{guid}/messages` | POST   | Gửi tin nhắn mới | ⏳ Pending |

### GET Messages Response

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
  parentMessageId: string | null; // Reply message
  content: string; // Nội dung tin nhắn
  contentType: "TXT" | "IMG" | "FILE" | "TASK";
  sentAt: string; // ISO datetime
  editedAt: string | null;
  linkedTaskId: string | null;
  reactions: Reaction[];
  attachments: Attachment[];
  replyCount: number;
  isStarred: boolean;
  isPinned: boolean;
  threadPreview: any | null;
  mentions: string[];
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}
```

### Query Parameters

| Param  | Type   | Required | Default | Description               |
| ------ | ------ | -------- | ------- | ------------------------- |
| limit  | number | ❌       | 50      | Số messages tối đa        |
| cursor | string | ❌       | -       | Cursor cho page tiếp theo |

### Pagination

API sử dụng **cursor-based pagination**:

```http
GET /api/conversations/{guid}/messages?limit=50&cursor={nextCursor}
```

### Authentication

```http
Authorization: Bearer {accessToken}
```

### SignalR Events

| Hub          | Event         | Direction | Description    |
| ------------ | ------------- | --------- | -------------- |
| `/hubs/chat` | `NewMessage`  | Receive   | Tin nhắn mới   |
| `/hubs/chat` | `SendMessage` | Send      | Gửi tin nhắn   |
| `/hubs/chat` | `Typing`      | Send      | Đang nhập      |
| `/hubs/chat` | `UserTyping`  | Receive   | User đang nhập |
| `/hubs/chat` | `MessageRead` | Receive   | Tin đã đọc     |

### Snapshots

- [get-messages-success.json](../../../api/chat/conversation-detail/snapshots/v1/get-messages-success.json)

---

## 📊 Component Naming Convention

### Từ Mockup → Production

| Mockup Name      | Production Name      | Lý do          |
| ---------------- | -------------------- | -------------- |
| `ChatMain`       | `ConversationDetail` | Rõ nghĩa hơn   |
| `MessageBubble`  | `MessageBubble`      | Giữ nguyên     |
| `Message` (type) | `ChatMessage`        | Tránh conflict |
| `messages`       | `messages`           | Giữ nguyên     |
| `selectedGroup`  | `conversation`       | Bao quát hơn   |

### File Naming

| Type      | Pattern                  | Example |
| --------- | ------------------------ | ------- |
| Component | `ConversationDetail.tsx` |         |
| Component | `MessageList.tsx`        |         |
| Component | `MessageInput.tsx`       |         |
| Hook      | `useMessages.ts`         |         |
| Hook      | `useSendMessage.ts`      |         |
| API       | `messages.api.ts`        |         |
| Types     | `messages.ts`            |         |

---

## ✅ Acceptance Criteria

- [ ] Load và hiển thị messages từ API
- [ ] Infinite scroll load messages cũ
- [ ] Gửi text message hoạt động
- [ ] Upload và gửi file hoạt động
- [ ] SignalR nhận tin mới realtime
- [ ] Typing indicator hoạt động
- [ ] Auto scroll khi có tin mới
- [ ] Loading states đúng
- [ ] Error handling + retry
- [ ] Token gửi trong requests
- [ ] Unit tests pass (≥80% coverage)

---

## 📋 IMPACT SUMMARY (Tóm tắt thay đổi)

### Files sẽ tạo mới:

| File                                                          | Description           |
| ------------------------------------------------------------- | --------------------- |
| `src/api/messages.api.ts`                                     | API client            |
| `src/hooks/queries/useMessages.ts`                            | Query hook (infinite) |
| `src/hooks/mutations/useSendMessage.ts`                       | Mutation hook         |
| `src/types/messages.ts`                                       | Update types          |
| `src/features/chat/ConversationDetail/ConversationDetail.tsx` | Main component        |
| `src/features/chat/ConversationDetail/MessageList.tsx`        | Message list          |
| `src/features/chat/ConversationDetail/MessageInput.tsx`       | Input area            |
| `src/features/chat/ConversationDetail/MessageBubble.tsx`      | Single message        |
| `src/features/chat/ConversationDetail/TypingIndicator.tsx`    | Typing UI             |
| `src/features/chat/ConversationDetail/index.ts`               | Barrel export         |
| `src/features/chat/ConversationDetail/__tests__/*.test.tsx`   | Tests                 |

### Files sẽ sửa đổi:

| File                                              | Changes                   |
| ------------------------------------------------- | ------------------------- |
| `src/features/portal/workspace/WorkspaceView.tsx` | Import ConversationDetail |
| `src/lib/signalr.ts`                              | Thêm message events       |
| `src/types/index.ts`                              | Export message types      |

### Files sẽ xoá:

- Không xoá (giữ mockup để reference)

### Dependencies:

- Không cần thêm dependencies mới

---

## ⏳ PENDING DECISIONS (Các quyết định chờ HUMAN)

| #   | Vấn đề                    | Lựa chọn                         | HUMAN Decision                                                 |
| --- | ------------------------- | -------------------------------- | -------------------------------------------------------------- |
| 1   | Message pagination        | Page number hay cursor-based?    | ✅ **Cursor-based** (từ API: limit param + response structure) |
| 2   | Page size                 | 20, 50, hay 100 messages?        | ✅ **50** (default từ API: `?limit=50`)                        |
| 3   | File upload               | Direct upload hay presigned URL? | ✅ **Direct upload**                                           |
| 4   | Max file size             | 5MB, 10MB, hay 25MB?             | ✅ **10Mb**                                                    |
| 5   | Typing indicator debounce | 500ms hay 1000ms?                | ✅ **500ms**                                                   |
| 6   | Message cache staleTime   | 30s, 60s, hay 5m?                | ✅ **30s**                                                     |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status       |
| ------------------------- | ------------ |
| Đã review Requirements    | ✅ Đã review |
| Đã review Impact Summary  | ✅ Đã review |
| Đã điền Pending Decisions | ✅ Đã điền   |
| API Contract ready        | ✅ READY     |
| **APPROVED để thực thi**  | ✅ APPROVED  |

**HUMAN Signature:** HUMAN  
**Date:** 2025-12-30

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

# [BƯỚC 1] Requirements - Conversation List

> **Feature:** Danh sách đoạn chat  
> **Version:** 1.0.0  
> **Status:** ✅ APPROVED

---

## 📋 Functional Requirements

### FR-01: Hiển thị danh sách Nhóm (Groups)

| ID      | Requirement                                         | Priority | Notes         |
| ------- | --------------------------------------------------- | -------- | ------------- |
| FR-01.1 | Hiển thị danh sách tất cả group chats user tham gia | HIGH     | Từ API        |
| FR-01.2 | Hiển thị tên nhóm + avatar/initials                 | HIGH     | Giữ UI mockup |
| FR-01.3 | Hiển thị tin nhắn cuối + thời gian                  | HIGH     |               |
| FR-01.4 | Hiển thị badge số tin chưa đọc                      | HIGH     |               |
| FR-01.5 | Highlight nhóm đang chọn                            | MEDIUM   |               |
| FR-01.6 | Click để mở conversation detail                     | HIGH     |               |

### FR-02: Hiển thị danh sách Cá nhân (Direct Messages)

| ID      | Requirement                                  | Priority | Notes            |
| ------- | -------------------------------------------- | -------- | ---------------- |
| FR-02.1 | Hiển thị danh sách DM conversations          | HIGH     | Từ API           |
| FR-02.2 | Hiển thị tên người + vai trò (Leader/Member) | HIGH     |                  |
| FR-02.3 | Hiển thị trạng thái online/offline           | HIGH     | Realtime SignalR |
| FR-02.4 | Hiển thị tin nhắn cuối + thời gian           | HIGH     |                  |
| FR-02.5 | Hiển thị badge số tin chưa đọc               | HIGH     |                  |
| FR-02.6 | Click để mở conversation detail              | HIGH     |                  |

### FR-03: Filter và Search

| ID      | Requirement                           | Priority | Notes              |
| ------- | ------------------------------------- | -------- | ------------------ |
| FR-03.1 | Tabs chuyển đổi: Nhóm / Cá nhân       | HIGH     | SegmentedTabs      |
| FR-03.2 | Search box tìm kiếm theo tên/nội dung | MEDIUM   | Client-side filter |
| FR-03.3 | Giữ state tab khi navigate            | LOW      |                    |

### FR-04: Loading States

| ID      | Requirement                            | Priority | Notes |
| ------- | -------------------------------------- | -------- | ----- |
| FR-04.1 | Hiển thị skeleton khi đang load        | HIGH     |       |
| FR-04.2 | Hiển thị empty state khi không có data | MEDIUM   |       |
| FR-04.3 | Hiển thị error state + retry button    | MEDIUM   |       |

### FR-05: Real-time Updates (SignalR)

| ID      | Requirement                              | Priority | Notes   |
| ------- | ---------------------------------------- | -------- | ------- |
| FR-05.1 | Nhận tin nhắn mới → cập nhật lastMessage | HIGH     |         |
| FR-05.2 | Nhận online status → cập nhật dot        | HIGH     | DM only |
| FR-05.3 | Đẩy conversation mới nhất lên đầu        | MEDIUM   |         |
| FR-05.4 | Cập nhật unread count realtime           | HIGH     |         |

---

## 🎨 UI Requirements

### UI-01: Layout

```
┌──────────────────────────────────┐
│  [Search box]                    │
├──────────────────────────────────┤
│  [ Nhóm ]  [ Cá nhân ]          │  ← Segmented tabs
├──────────────────────────────────┤
│  ┌─────────────────────────────┐ │
│  │ [Avatar] Tên nhóm      12:30│ │  ← Conversation item
│  │          Last message...  ●3│ │  ← Badge unread
│  └─────────────────────────────┘ │
│  ┌─────────────────────────────┐ │
│  │ [Avatar] Tên nhóm 2    Hôm │ │
│  │          [hình ảnh]        │ │
│  └─────────────────────────────┘ │
│  ...                             │
└──────────────────────────────────┘
```

### UI-02: Responsive

| Breakpoint | Behavior                       |
| ---------- | ------------------------------ |
| Desktop    | Sidebar cố định bên trái       |
| Tablet     | Sidebar có thể collapse        |
| Mobile     | Full screen, navigate khi chọn |

### UI-03: States

| State    | Display                          |
| -------- | -------------------------------- |
| Loading  | Skeleton items (3-5 items)       |
| Empty    | Icon + "Chưa có cuộc trò chuyện" |
| Error    | Icon + message + Retry button    |
| Selected | Background highlight + border    |

---

## 🔐 Security Requirements

| ID     | Requirement                              | Notes                |
| ------ | ---------------------------------------- | -------------------- |
| SEC-01 | Gửi Bearer token trong API request       | Authorization header |
| SEC-02 | Chỉ hiển thị conversations user có quyền | Server-side filter   |
| SEC-03 | Không cache sensitive data               |                      |

---

## 🔗 API Requirements

> ✅ **API đã được xác nhận** - Xem chi tiết: [contract.md](../../../api/chat/conversation-list/contract.md)

### Base URL

```
https://vega-chat-api-dev.allianceitsc.com
```

### Endpoints

| Endpoint             | Method | Description                    | Response Type              |
| -------------------- | ------ | ------------------------------ | -------------------------- |
| `/api/groups`        | GET    | Lấy danh sách group chats      | `GetGroupsResponse`        |
| `/api/conversations` | GET    | Lấy danh sách DM conversations | `GetConversationsResponse` |

### Response Structure

```typescript
// Groups Response
interface GetGroupsResponse {
  items: GroupConversation[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface GroupConversation {
  id: string; // UUID
  type: "GRP"; // Luôn là "GRP"
  name: string;
  description: string;
  avatarFileId: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string; // ISO datetime
  updatedAt: string | null;
  memberCount: number;
  unreadCount: number;
  lastMessage: LastMessage | null;
}

// DM Response
interface GetConversationsResponse {
  items: DirectConversation[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface DirectConversation {
  id: string;
  type: "DM"; // Luôn là "DM"
  name: string; // Format: "DM: {user1} <> {user2}"
  // ... similar to GroupConversation
}
```

### Pagination

API sử dụng **cursor-based pagination**:

```http
GET /api/groups?cursor={nextCursor}
```

### Authentication

```http
Authorization: Bearer {accessToken}
```

### SignalR Hubs

| Hub          | Event                | Description     |
| ------------ | -------------------- | --------------- |
| `/hubs/chat` | `NewMessage`         | Tin nhắn mới    |
| `/hubs/chat` | `UserOnline`         | User online     |
| `/hubs/chat` | `UserOffline`        | User offline    |
| `/hubs/chat` | `UnreadCountUpdated` | Cập nhật unread |

### Snapshots

- [groups-success.json](../../../api/chat/conversation-list/snapshots/v1/groups-success.json)
- [conversations-success.json](../../../api/chat/conversation-list/snapshots/v1/conversations-success.json)

---

## 📊 Component Naming Convention

### Từ Mockup → Production

| Mockup Name     | Production Name        | Lý do                  |
| --------------- | ---------------------- | ---------------------- |
| `LeftSidebar`   | `ConversationList`     | Rõ nghĩa hơn           |
| `GroupChat`     | `Conversation`         | Bao gồm cả group và DM |
| `contacts`      | `directMessages`       | Chính xác hơn          |
| `groups`        | `groupConversations`   | Rõ ràng hơn            |
| `selectedGroup` | `activeConversation`   | Bao quát hơn           |
| `onSelectGroup` | `onSelectConversation` | Consistent             |
| `onSelectChat`  | `onOpenConversation`   | Rõ action              |

### File Naming

| Type      | Pattern                     | Example |
| --------- | --------------------------- | ------- |
| Component | `ConversationList.tsx`      |         |
| Hook      | `useConversations.ts`       |         |
| API       | `conversations.api.ts`      |         |
| Types     | `conversations.ts`          |         |
| Test      | `ConversationList.test.tsx` |         |

---

## ✅ Acceptance Criteria

- [ ] Hiển thị danh sách groups từ API
- [ ] Hiển thị danh sách DMs từ API
- [ ] Filter Nhóm/Cá nhân hoạt động đúng
- [ ] Search filter hoạt động client-side
- [ ] Loading skeleton hiển thị khi fetch
- [ ] Error state + retry hoạt động
- [ ] Click item navigate đến detail
- [ ] SignalR cập nhật realtime
- [ ] Token được gửi trong request
- [ ] Unit tests pass (≥80% coverage)

---

## 📋 IMPACT SUMMARY (Tóm tắt thay đổi)

### Files sẽ tạo mới:

| File                                                          | Description      |
| ------------------------------------------------------------- | ---------------- |
| `src/api/conversations.api.ts`                                | API client       |
| `src/hooks/queries/useConversations.ts`                       | Query hook       |
| `src/types/conversations.ts`                                  | TypeScript types |
| `src/features/chat/ConversationList/ConversationList.tsx`     | Main component   |
| `src/features/chat/ConversationList/ConversationItem.tsx`     | Item component   |
| `src/features/chat/ConversationList/ConversationSkeleton.tsx` | Loading state    |
| `src/features/chat/ConversationList/index.ts`                 | Barrel export    |
| `src/features/chat/ConversationList/__tests__/*.test.tsx`     | Tests            |

### Files sẽ sửa đổi:

| File                                              | Changes                                  |
| ------------------------------------------------- | ---------------------------------------- |
| `src/features/portal/workspace/WorkspaceView.tsx` | Import ConversationList thay LeftSidebar |
| `src/lib/signalr.ts`                              | Thêm conversation events                 |
| `src/types/index.ts`                              | Export conversations types               |

### Files sẽ xoá:

- Không xoá (giữ mockup để reference)

### Dependencies:

- Không cần thêm dependencies mới

---

## ⏳ PENDING DECISIONS (Các quyết định chờ HUMAN)

| #   | Vấn đề                           | Lựa chọn                        | HUMAN Decision                                    |
| --- | -------------------------------- | ------------------------------- | ------------------------------------------------- |
| 1   | API endpoint structure           | REST hay GraphQL?               | ✅ **REST** (confirmed từ API)                    |
| 2   | Pagination cho conversation list | Infinite scroll hay pagination? | ✅ **Cursor-based** (từ API: nextCursor, hasMore) |
| 3   | Cache strategy                   | staleTime bao lâu? (30s/60s/5m) | ✅ **30s**                                        |
| 4   | SignalR reconnect strategy       | Auto hay manual?                | ✅ **Auto**                                       |
| 5   | Offline support                  | Có cần không?                   | ✅ **Không**                                      |

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

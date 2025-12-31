# Chat Module - Changelog

> **Module:** Chat  
> **Created:** 2025-12-26

---

## [2.1.0] - 2025-12-30 - IMPLEMENTED ✅

### ✅ IMPLEMENTED

Full API integration và SignalR real-time updates cho cả 2 features:

**1. Conversation List (ConversationListSidebar)**

- ✅ API integration: `getGroups()`, `getConversations()`
- ✅ Query hooks: `useGroups`, `useDirectMessages` (infinite)
- ✅ Loading skeleton component
- ✅ Error state với retry button
- ✅ Auto-select first group
- ✅ SignalR real-time updates: `useConversationRealtime`
- ✅ Filter: Nhóm / Cá nhân

**2. Conversation Detail (ChatMainContainer)**

- ✅ API integration: `getMessages()`, `sendMessage()`
- ✅ Query hooks: `useMessages` (infinite, cursor-based)
- ✅ Mutation hooks: `useSendMessage` (optimistic updates)
- ✅ Loading skeleton component
- ✅ Error state với retry button
- ✅ SignalR real-time: `useMessageRealtime`
- ✅ Typing indicator: `useSendTypingIndicator`

**3. File Restructuring**

| Old Name        | New Name                   | Reason         |
| --------------- | -------------------------- | -------------- |
| LeftSidebar.tsx | ConversationListSidebar.tsx | Clearer naming |
| ChatMain.tsx    | ChatMessagePanel.tsx        | Clearer naming |
| RightPanel.tsx  | ConversationDetailPanel.tsx | Clearer naming |

**4. Page Structure**

- ✅ Created `src/pages/PortalPage.tsx` as main entry point
- ✅ Updated routes to use PortalPage
- ✅ Created `src/components/shared/` folder

### Files Created

```
src/
├── api/
│   ├── conversations.api.ts
│   └── messages.api.ts
├── hooks/
│   ├── queries/
│   │   ├── keys/conversationKeys.ts
│   │   ├── keys/messageKeys.ts
│   │   ├── useGroups.ts
│   │   ├── useDirectMessages.ts
│   │   └── useMessages.ts
│   └── mutations/
│       └── useSendMessage.ts
├── hooks/
│   ├── useMessageRealtime.ts
│   ├── useConversationRealtime.ts
│   └── useSendTypingIndicator.ts
├── features/portal/components/
│   ├── ConversationSkeleton.tsx
│   ├── MessageSkeleton.tsx
│   └── ChatMainContainer.tsx
├── pages/
│   ├── PortalPage.tsx
│   └── index.ts
└── types/
    └── conversations.ts
```

---

## [2.0.0] - 2025-12-30 - RESTRUCTURE

### 🔄 RESTRUCTURED

Module được restructure theo yêu cầu HUMAN:

**Chia thành 2 Features:**

1. **conversation-list** (Danh sách đoạn chat)

   - Hiển thị Groups và Direct Messages
   - Filter: Nhóm / Cá nhân
   - SignalR realtime updates

2. **conversation-detail** (Chi tiết đoạn chat)
   - Message list với infinite scroll
   - Send messages + attachments
   - Typing indicator
   - SignalR realtime messages

**Documentation Structure:**

- Mỗi feature có folder riêng với 7 bước workflow
- API docs tách biệt trong `docs/api/chat/`
- Naming convention thay đổi cho rõ ràng hơn

---

## [1.0.0] - 2025-12-XX (Mockup Version)

### Initial Release

**Status:** ✅ PRODUCTION (mockup)

#### Features

- Chat UI với mockup data
- Message types: text, image, file
- Pin messages (UI only)
- Reply to messages (UI only)
- Search messages
- File manager panel
- Mobile responsive

#### Components

- ChatMain.tsx - Main chat component
- MessageBubble.tsx - Individual message rendering
- LeftSidebar.tsx - Groups/contacts sidebar
- RightPanel.tsx - Info/tasks panel
- PinnedMessagesPanel.tsx

#### Data

- Mock data: `src/data/mockMessages.ts`
- Mock groups: `src/data/mockOrg.ts`
- Hardcoded trong component state

---

## Version Comparison

| Feature            | v1.0 (Mockup)    | v2.1 (API Integration)      |
| ------------------ | ---------------- | --------------------------- |
| Data Source        | Hardcoded mock   | ✅ Real API                 |
| State Management   | useState (local) | ✅ TanStack Query           |
| Loading States     | ❌ None          | ✅ Skeleton + spinners      |
| Error Handling     | ❌ None          | ✅ Retry logic + banners    |
| Infinite Scroll    | ❌ None          | ✅ Cursor-based pagination  |
| Optimistic Updates | ❌ None          | ✅ Immediate UI feedback    |
| Real-Time Updates  | ❌ None          | ✅ SignalR integration      |
| Typing Indicator   | ❌ None          | ✅ Debounced broadcast      |

---

## Planned Features (Future Versions)

### v2.2 - Enhanced Features

- [ ] File/image attachments upload
- [ ] Read receipts
- [ ] Message reactions (emojis)
- [ ] Mentions (@user)

### v3.0 - Advanced Features

- [ ] Message threading
- [ ] Voice messages
- [ ] Video messages
- [ ] Message forwarding
- [ ] Offline mode support

---

## Notes

- **Semantic Versioning:** MAJOR.MINOR.PATCH
  - MAJOR: Breaking changes (API structure, component props)
  - MINOR: New features (backward compatible)
  - PATCH: Bug fixes, performance improvements

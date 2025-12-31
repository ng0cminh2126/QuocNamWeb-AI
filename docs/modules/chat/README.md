# 💬 Chat Module

> **Status:** ✅ IMPLEMENTED  
> **Sprint:** 2  
> **Owner:** Copilot  
> **Last Updated:** 2025-12-30

---

## 📋 Overview

Module Chat xử lý tất cả chức năng liên quan đến nhắn tin trong hệ thống portal.

---

## 📂 Features

Module này được chia thành **2 features chính**:

| Feature                                                          | Description                        | Status          |
| ---------------------------------------------------------------- | ---------------------------------- | --------------- |
| [conversation-list](features/conversation-list/00_README.md)     | Danh sách đoạn chat (Groups + DMs) | ✅ Implemented  |
| [conversation-detail](features/conversation-detail/00_README.md) | Chi tiết đoạn chat + messaging     | ✅ Implemented  |

### Feature 1: Conversation List (Danh sách đoạn chat)

- ✅ Hiển thị danh sách group chats (API integration)
- ✅ Hiển thị danh sách direct messages (DM)
- ✅ Filter: Nhóm / Cá nhân
- ✅ Search conversations
- ✅ Real-time updates (SignalR)
- ✅ Loading states (skeleton)
- ✅ Error states với retry button
- ✅ Auto-select first group

**UI Reference:** `ConversationListSidebar.tsx`

### Feature 2: Conversation Detail (Chi tiết đoạn chat)

- ✅ Hiển thị tin nhắn trong conversation (API integration)
- ✅ Gửi text message (optimistic updates)
- ✅ Infinite scroll (cursor-based pagination)
- ✅ Typing indicator (SignalR)
- ✅ Real-time messages (SignalR)
- ✅ Loading states (skeleton)
- ✅ Error states với retry button

**UI Reference:** `ChatMessagePanel.tsx`, `ChatMainContainer.tsx`

---

## 📁 Documentation Structure

```
docs/modules/chat/
├── README.md                    # Overview (file này)
├── _changelog.md                # Version history
├── api-spec.md                  # API overview
│
├── features/
│   ├── conversation-list/       # Feature 1
│   │   ├── 00_README.md
│   │   ├── 01_requirements.md
│   │   ├── 02a_wireframe.md
│   │   ├── 02b_flow.md
│   │   ├── 03_api-contract.md
│   │   ├── 04_implementation-plan.md
│   │   ├── 05_progress.md
│   │   └── 06_testing.md
│   │
│   └── conversation-detail/     # Feature 2
│       ├── 00_README.md
│       ├── 01_requirements.md
│       ├── 02a_wireframe.md
│       ├── 02b_flow.md
│       ├── 03_api-contract.md
│       ├── 04_implementation-plan.md
│       ├── 05_progress.md
│       └── 06_testing.md

docs/api/chat/
├── conversation-list/           # API docs feature 1
│   ├── contract.md
│   └── snapshots/v1/
│
└── conversation-detail/         # API docs feature 2
    ├── contract.md
    └── snapshots/v1/
```

---

## 📁 Source Code Structure (Implemented)

```
src/
├── api/
│   ├── conversations.api.ts     # ✅ Conversation list API
│   └── messages.api.ts          # ✅ Messages API
│
├── hooks/
│   ├── queries/
│   │   ├── keys/
│   │   │   ├── conversationKeys.ts  # ✅ Query key factory
│   │   │   └── messageKeys.ts       # ✅ Query key factory
│   │   ├── useGroups.ts             # ✅ List groups (infinite)
│   │   ├── useDirectMessages.ts     # ✅ List DMs (infinite)
│   │   └── useMessages.ts           # ✅ Get messages (infinite)
│   └── mutations/
│       └── useSendMessage.ts        # ✅ Send message with optimistic updates
│
├── hooks/
│   ├── useMessageRealtime.ts        # ✅ SignalR message events
│   ├── useConversationRealtime.ts   # ✅ SignalR conversation events
│   └── useSendTypingIndicator.ts    # ✅ Typing indicator (debounced)
│
├── features/portal/
│   ├── components/
│   │   ├── ConversationSkeleton.tsx # ✅ Loading skeleton
│   │   ├── MessageSkeleton.tsx      # ✅ Loading skeleton
│   │   └── ChatMainContainer.tsx    # ✅ API-integrated chat
│   │
│   └── workspace/
│       ├── ConversationListSidebar.tsx  # ✅ Renamed from LeftSidebar
│       ├── ChatMessagePanel.tsx         # ✅ Renamed from ChatMain
│       ├── ConversationDetailPanel.tsx  # ✅ Renamed from RightPanel
│       └── WorkspaceView.tsx            # ✅ Updated with API integration
│
├── pages/
│   └── PortalPage.tsx           # ✅ Main portal entry point
│
├── types/
│   ├── conversations.ts         # ✅ Conversation types
│   └── messages.ts              # ✅ Message types (ChatMessage)
│
└── lib/
    └── signalr.ts               # ✅ SignalR integration with event constants
```

---

## 🎯 Naming Convention Changes (Implemented)

| Mockup (Cũ)       | Production (Mới)            | Lý do                           |
| ----------------- | --------------------------- | ------------------------------- |
| `LeftSidebar`     | `ConversationListSidebar`   | Rõ nghĩa hơn                    |
| `ChatMain`        | `ChatMessagePanel`          | Rõ nghĩa hơn                    |
| `RightPanel`      | `ConversationDetailPanel`   | Rõ nghĩa hơn                    |
| N/A               | `ChatMainContainer`         | API-integrated version          |

---

## 🔗 Related Links

### Documentation

- [API Contract - Conversation List](../../api/chat/conversation-list/contract.md)
- [API Contract - Conversation Detail](../../api/chat/conversation-detail/contract.md)

### Source Files

- [ConversationListSidebar.tsx](../../../src/features/portal/workspace/ConversationListSidebar.tsx)
- [ChatMessagePanel.tsx](../../../src/features/portal/workspace/ChatMessagePanel.tsx)
- [ChatMainContainer.tsx](../../../src/features/portal/components/ChatMainContainer.tsx)
- [MessageBubble.tsx](../../../src/features/portal/components/MessageBubble.tsx)

---

## ✅ Completed Tasks

1. ✅ **API Integration** - Conversation list and messages
2. ✅ **SignalR Integration** - Real-time updates
3. ✅ **Loading States** - Skeleton components
4. ✅ **Error Handling** - Retry buttons
5. ✅ **File Restructuring** - Clearer naming
6. ✅ **Page Structure** - PortalPage as entry point

## ⏳ Future Enhancements

1. [ ] File/image attachments upload
2. [ ] Read receipts
3. [ ] Message reactions
4. [ ] Message threading

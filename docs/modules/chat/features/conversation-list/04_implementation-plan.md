# [BƯỚC 4] Implementation Plan - Conversation List

> **Feature:** Danh sách đoạn chat  
> **Status:** ✅ READY TO IMPLEMENT  
> **Last Updated:** 2025-12-30

---

## ✅ Prerequisites Check

| Prerequisite          | Status | Reference                                          |
| --------------------- | ------ | -------------------------------------------------- |
| Requirements approved | ✅     | [01_requirements.md](01_requirements.md)           |
| Wireframe approved    | ✅     | [02a_wireframe.md](02a_wireframe.md)               |
| Flow approved         | ✅     | [02b_flow.md](02b_flow.md)                         |
| API Contract ready    | ✅     | [contract.md](../../../api/chat/conversation-list) |
| API Snapshots ready   | ✅     | `snapshots/v1/*.json`                              |

---

## 📋 Confirmed Decisions (từ Requirements)

| Vấn đề                     | Quyết định                         |
| -------------------------- | ---------------------------------- |
| API endpoint structure     | REST                               |
| Pagination                 | Cursor-based (nextCursor, hasMore) |
| Cache strategy (staleTime) | 30s                                |
| SignalR reconnect          | Auto                               |
| Offline support            | Không                              |

---

## 📁 Implementation Tasks

### Phase 1: Types & API Client (⏱️ ~1.5 hours)

#### Task 1.1: Create Conversation Types

**File:** `src/types/conversations.ts`

```typescript
// Conversation Types
export type ConversationType = "GRP" | "DM";

// Last Message
export interface LastMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  parentMessageId: string | null;
  content: string;
  contentType: "TXT" | "IMG" | "FILE";
  sentAt: string;
  editedAt: string | null;
  linkedTaskId: string | null;
  reactions: unknown[];
  attachments: unknown[];
  replyCount: number;
  isStarred: boolean;
  isPinned: boolean;
  threadPreview: unknown | null;
  mentions: unknown[];
}

// Group Conversation
export interface GroupConversation {
  id: string;
  type: "GRP";
  name: string;
  description: string;
  avatarFileId: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string | null;
  memberCount: number;
  unreadCount: number;
  lastMessage: LastMessage | null;
}

// Direct Message Conversation
export interface DirectConversation {
  id: string;
  type: "DM";
  name: string;
  description: string | null;
  avatarFileId: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string | null;
  memberCount: 2;
  unreadCount: number;
  lastMessage: LastMessage | null;
}

// Union type
export type Conversation = GroupConversation | DirectConversation;

// API Responses
export interface GetGroupsResponse {
  items: GroupConversation[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface GetConversationsResponse {
  items: DirectConversation[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

**Tests:** `src/types/__tests__/conversations.test.ts`

- [ ] Type guards: isGroupConversation, isDirectConversation
- [ ] Validate against API snapshots

---

#### Task 1.2: Create API Client

**File:** `src/api/conversations.api.ts`

```typescript
import { apiClient } from "./client";
import type {
  GetGroupsResponse,
  GetConversationsResponse,
} from "@/types/conversations";

// GET /api/groups
export const getGroups = async (
  cursor?: string
): Promise<GetGroupsResponse> => {
  const params = cursor ? { cursor } : {};
  const response = await apiClient.get("/api/groups", { params });
  return response.data;
};

// GET /api/conversations
export const getConversations = async (
  cursor?: string
): Promise<GetConversationsResponse> => {
  const params = cursor ? { cursor } : {};
  const response = await apiClient.get("/api/conversations", { params });
  return response.data;
};

// POST mark as read (optional - confirm with API)
export const markConversationAsRead = async (
  conversationId: string
): Promise<void> => {
  await apiClient.post(`/api/conversations/${conversationId}/read`);
};
```

**Tests:** `src/api/__tests__/conversations.api.test.ts`

- [ ] getGroups: success, with cursor, error handling
- [ ] getConversations: success, with cursor, error handling
- [ ] Auth header được gửi đúng

---

### Phase 2: Query Hooks (⏱️ ~2 hours)

#### Task 2.1: Create Query Keys

**File:** `src/hooks/queries/keys/conversationKeys.ts`

```typescript
export const conversationKeys = {
  all: ["conversations"] as const,

  // Groups
  groups: () => [...conversationKeys.all, "groups"] as const,
  groupsList: (cursor?: string) =>
    [...conversationKeys.groups(), { cursor }] as const,

  // Direct Messages
  directs: () => [...conversationKeys.all, "directs"] as const,
  directsList: (cursor?: string) =>
    [...conversationKeys.directs(), { cursor }] as const,
};
```

---

#### Task 2.2: Create useGroups Hook

**File:** `src/hooks/queries/useGroups.ts`

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { getGroups } from "@/api/conversations.api";
import { conversationKeys } from "./keys/conversationKeys";

export function useGroups() {
  return useInfiniteQuery({
    queryKey: conversationKeys.groups(),
    queryFn: ({ pageParam }) => getGroups(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30, // 30 seconds
  });
}
```

**Tests:** `src/hooks/queries/__tests__/useGroups.test.ts`

- [ ] Initial loading state
- [ ] Success state with data
- [ ] Infinite scroll (fetchNextPage)
- [ ] Error handling
- [ ] Cache behavior (staleTime: 30s)

---

#### Task 2.3: Create useDirectMessages Hook

**File:** `src/hooks/queries/useDirectMessages.ts`

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { getConversations } from "@/api/conversations.api";
import { conversationKeys } from "./keys/conversationKeys";

export function useDirectMessages() {
  return useInfiniteQuery({
    queryKey: conversationKeys.directs(),
    queryFn: ({ pageParam }) => getConversations(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30, // 30 seconds
  });
}
```

**Tests:** `src/hooks/queries/__tests__/useDirectMessages.test.ts`

- [ ] Initial loading state
- [ ] Success state with data
- [ ] Infinite scroll
- [ ] Error handling

---

### Phase 3: Components (⏱️ ~3 hours)

#### Task 3.1: Component Structure

```
src/features/chat/ConversationList/
├── index.ts                      # Barrel export
├── ConversationList.tsx          # Main component
├── ConversationItem.tsx          # Single item
├── ConversationSkeleton.tsx      # Loading skeleton
├── EmptyState.tsx                # Empty state
├── ErrorState.tsx                # Error with retry
└── __tests__/
    ├── ConversationList.test.tsx
    └── ConversationItem.test.tsx
```

---

#### Task 3.2: ConversationList.tsx

```typescript
interface ConversationListProps {
  type: "groups" | "directs";
  onSelect: (conversation: Conversation) => void;
  selectedId?: string;
}

export function ConversationList({
  type,
  onSelect,
  selectedId,
}: ConversationListProps) {
  const query = type === "groups" ? useGroups() : useDirectMessages();
  const conversations = query.data?.pages.flatMap((p) => p.items) ?? [];

  if (query.isLoading) return <ConversationSkeleton />;
  if (query.isError)
    return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (conversations.length === 0) return <EmptyState type={type} />;

  return (
    <div data-testid="conversation-list">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isSelected={conv.id === selectedId}
          onClick={() => onSelect(conv)}
        />
      ))}
      {query.hasNextPage && (
        <button
          data-testid="load-more-button"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
        >
          {query.isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
        </button>
      )}
    </div>
  );
}
```

**Tests:**

- [ ] Render groups data
- [ ] Render DM data
- [ ] Loading skeleton
- [ ] Error state + retry
- [ ] Empty state
- [ ] Selection handling
- [ ] Load more functionality

---

#### Task 3.3: ConversationItem.tsx

```typescript
interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const { name, lastMessage, unreadCount } = conversation;

  return (
    <div
      data-testid={`conversation-item-${conversation.id}`}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100",
        isSelected && "bg-blue-50 border-l-2 border-blue-500"
      )}
      onClick={onClick}
    >
      <Avatar data-testid="conversation-avatar">
        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span
            className="font-medium truncate"
            data-testid="conversation-name"
          >
            {conversation.type === "DM" ? name.replace("DM: ", "") : name}
          </span>
          {lastMessage && (
            <span
              className="text-xs text-gray-500"
              data-testid="conversation-time"
            >
              {formatRelativeTime(lastMessage.sentAt)}
            </span>
          )}
        </div>
        {lastMessage && (
          <p
            className="text-sm text-gray-500 truncate"
            data-testid="conversation-preview"
          >
            {lastMessage.content}
          </p>
        )}
      </div>

      {unreadCount > 0 && (
        <Badge variant="destructive" data-testid="unread-badge">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </div>
  );
}
```

**Tests:**

- [ ] Render với full data
- [ ] Render selected state
- [ ] Unread badge hiển thị đúng
- [ ] Time format đúng
- [ ] Click handler được gọi

---

### Phase 4: SignalR Integration (⏱️ ~2 hours)

#### Task 4.1: Update SignalR Events

**File:** `src/lib/signalr.ts` (modify)

```typescript
// Add conversation events
export const SIGNALR_EVENTS = {
  // ... existing events

  // Conversation events
  NEW_MESSAGE: "NewMessage",
  MESSAGE_READ: "MessageRead",
  USER_ONLINE: "UserOnline",
  USER_OFFLINE: "UserOffline",
  CONVERSATION_UPDATED: "ConversationUpdated",
} as const;
```

---

#### Task 4.2: Create useConversationRealtime Hook

**File:** `src/hooks/useConversationRealtime.ts`

```typescript
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { signalRConnection, SIGNALR_EVENTS } from "@/lib/signalr";
import { conversationKeys } from "./queries/keys/conversationKeys";

export function useConversationRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleNewMessage = (data: NewMessageEvent) => {
      // Invalidate cả groups và directs để refetch
      queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });
    };

    const handleUserOnline = (userId: string) => {
      // Update online status in cache
      // Implementation depends on how we track online users
    };

    // Subscribe
    signalRConnection.on(SIGNALR_EVENTS.NEW_MESSAGE, handleNewMessage);
    signalRConnection.on(SIGNALR_EVENTS.USER_ONLINE, handleUserOnline);

    // Cleanup
    return () => {
      signalRConnection.off(SIGNALR_EVENTS.NEW_MESSAGE, handleNewMessage);
      signalRConnection.off(SIGNALR_EVENTS.USER_ONLINE, handleUserOnline);
    };
  }, [queryClient]);
}
```

---

### Phase 5: Integration (⏱️ ~1.5 hours)

#### Task 5.1: Update LeftSidebar.tsx

**File:** `src/features/portal/LeftSidebar.tsx` (modify)

- [ ] Import `ConversationList` component
- [ ] Replace mock data với real hooks
- [ ] Integrate with existing tab switching logic
- [ ] Add data-testid attributes

---

## 📊 Test Coverage Requirements

| File                    | Type      | Min Coverage |
| ----------------------- | --------- | ------------ |
| conversations.api.ts    | API       | 80%          |
| useGroups.ts            | Hook      | 80%          |
| useDirectMessages.ts    | Hook      | 80%          |
| ConversationList.tsx    | Component | 75%          |
| ConversationItem.tsx    | Component | 75%          |
| useConversationRealtime | Hook      | 70%          |

---

## 📅 Timeline Summary

| Phase   | Tasks               | Duration     | Dependencies |
| ------- | ------------------- | ------------ | ------------ |
| Phase 1 | Types + API Client  | 1.5 hours    | -            |
| Phase 2 | Query Hooks         | 2 hours      | Phase 1      |
| Phase 3 | Components          | 3 hours      | Phase 2      |
| Phase 4 | SignalR Integration | 2 hours      | Phase 3      |
| Phase 5 | Portal Integration  | 1.5 hours    | Phase 4      |
| -       | **TOTAL**           | **10 hours** |              |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                       | Status       |
| ------------------------------ | ------------ |
| Prerequisites met              | ✅           |
| Implementation plan reviewed   | ✅ Đã review |
| Timeline acceptable            | ✅ Đồng ý    |
| **APPROVED để bắt đầu coding** | ✅ APPROVED  |

**HUMAN Signature:** HUMAN  
**Date:** 2025-12-30

> ✅ **READY: AI được phép bắt đầu Phase 1**

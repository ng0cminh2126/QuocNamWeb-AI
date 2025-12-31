# Required Changes Summary

> **Feature:** Message Send & Receive Real-time  
> **Created:** 2025-12-30

---

## 📋 Files to Modify

### 1. `src/lib/signalr.ts`

**Changes Required:**

#### 1.1 Update SIGNALR_EVENTS constant (Line ~6-23)

```typescript
// FROM:
export const SIGNALR_EVENTS = {
  RECEIVE_MESSAGE: "ReceiveMessage",
  NEW_MESSAGE: "NewMessage",
  MESSAGE_UPDATED: "MessageUpdated",
  MESSAGE_DELETED: "MessageDeleted",
  USER_TYPING: "UserTyping",
  MESSAGE_READ: "MessageRead",
  USER_ONLINE: "UserOnline",
  USER_OFFLINE: "UserOffline",
  CONVERSATION_UPDATED: "ConversationUpdated",
  SEND_TYPING: "SendTyping",
  JOIN_GROUP: "JoinGroup",
  LEAVE_GROUP: "LeaveGroup",
} as const;

// TO:
export const SIGNALR_EVENTS = {
  // Message Events (Server → Client)
  MESSAGE_SENT: "MessageSent",
  MESSAGE_EDITED: "MessageEdited",
  MESSAGE_DELETED: "MessageDeleted",
  MESSAGE_PINNED: "MessagePinned",
  MESSAGE_UNPINNED: "MessageUnpinned",

  // Member Events
  MEMBER_ADDED: "MemberAdded",
  MEMBER_REMOVED: "MemberRemoved",

  // Typing & Presence
  USER_TYPING: "UserTyping",
  USER_PRESENCE_CHANGED: "UserPresenceChanged",

  // Mentions
  USER_MENTIONED: "UserMentioned",
  MENTION_READ: "MentionRead",
  MENTIONS_BULK_READ: "MentionsBulkRead",

  // Client → Server
  JOIN_CONVERSATION: "JoinConversation",
  LEAVE_CONVERSATION: "LeaveConversation",
  SEND_TYPING: "SendTyping",

  // Legacy (for backward compatibility during migration)
  NEW_MESSAGE: "NewMessage", // DEPRECATED
  RECEIVE_MESSAGE: "ReceiveMessage", // DEPRECATED
} as const;
```

#### 1.2 Update reconnect strategy (Line ~103)

```typescript
// FROM:
.withAutomaticReconnect([0, 2000, 5000, 10000, 30000])

// TO:
.withAutomaticReconnect({
  nextRetryDelayInMilliseconds: (retryContext) => {
    if (retryContext.previousRetryCount >= 10) {
      return null; // Stop after 10 attempts
    }
    return 180000; // Fixed 3 minutes
  },
})
```

#### 1.3 Update maxReconnectAttempts (Line ~62)

```typescript
// FROM:
private maxReconnectAttempts = 5;

// TO:
private maxReconnectAttempts = 10;
```

#### 1.4 Add new event interfaces (After line ~56)

```typescript
// ADD these new interfaces:
export interface MessageSentEvent {
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    parentMessageId: string | null;
    content: string;
    contentType: "TXT" | "IMG" | "FILE" | "TASK";
    sentAt: string;
    editedAt: string | null;
    linkedTaskId: string | null;
    attachments: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
    reactions: Array<{
      emoji: string;
      userId: string;
      userName: string;
    }>;
    replyCount: number;
    isStarred: boolean;
    isPinned: boolean;
    threadPreview: unknown[] | null;
    mentions: string[];
  };
}

export interface MessagePinnedEvent {
  messageId: string;
  conversationId: string;
  pinnedBy: string;
  timestamp: string;
}

export interface MessageUnpinnedEvent {
  messageId: string;
  conversationId: string;
  unpinnedBy: string;
  timestamp: string;
}

export interface UserPresenceChangedEvent {
  userId: string;
  status: "Online" | "Offline" | "Away";
  timestamp: string;
}

export interface UserMentionedEvent {
  mentionId: string;
  messageId: string;
  conversationId: string;
  mentionedByUserId: string;
  mentionedByUserName: string;
  messageContentPreview: string;
  mentionedAt: string;
}
```

---

### 2. `src/hooks/useMessageRealtime.ts`

**Changes Required:**

#### 2.1 Update imports (Line ~5)

```typescript
// FROM:
import { chatHub, SIGNALR_EVENTS, type UserTypingEvent } from "@/lib/signalr";

// TO:
import {
  chatHub,
  SIGNALR_EVENTS,
  type UserTypingEvent,
  type MessageSentEvent,
} from "@/lib/signalr";
import { toast } from "sonner";
```

#### 2.2 Update handleNewMessage to use MessageSent (Line ~35-68)

```typescript
// Update the event subscription to use MESSAGE_SENT instead of NEW_MESSAGE
// And update handler signature to accept MessageSentEvent
```

#### 2.3 Add toast notification logic

```typescript
// Add toast for messages from other users in other conversations
if (isFromOtherUser && !isViewingConversation) {
  toast.info(message.senderName || "New message", {
    description: message.content.substring(0, 100),
    duration: 5000,
  });
}
```

---

### 3. Files to Create

| File                                     | Purpose                                |
| ---------------------------------------- | -------------------------------------- |
| `src/components/ui/ConnectionStatus.tsx` | Show connection status banner          |
| `src/hooks/useSignalRStatus.ts`          | Hook to track SignalR connection state |

---

## ⚠️ Breaking Changes

### Event Name Changes

| Old Event        | New Event             | Impact                   |
| ---------------- | --------------------- | ------------------------ |
| `NewMessage`     | `MessageSent`         | Update all subscribers   |
| `ReceiveMessage` | `MessageSent`         | Update all subscribers   |
| `UserOnline`     | `UserPresenceChanged` | Update presence handlers |
| `UserOffline`    | `UserPresenceChanged` | Update presence handlers |

### Migration Steps

1. Add new events while keeping legacy events
2. Update handlers one by one
3. Remove legacy events after verification

---

## 🧪 Verification Steps

After making changes:

1. [ ] App compiles without errors
2. [ ] SignalR connects successfully
3. [ ] Send message → appears immediately (optimistic)
4. [ ] Send message → confirmed by SignalR event
5. [ ] Receive message from other user → appears in chat
6. [ ] Receive message from other conv → shows toast
7. [ ] Disconnect network → shows reconnecting banner
8. [ ] Reconnect → events resume working

---

**Created by:** GitHub Copilot  
**Date:** 2025-12-30

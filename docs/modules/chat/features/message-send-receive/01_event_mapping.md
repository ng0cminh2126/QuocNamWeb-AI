# SignalR Event Mapping - Backend to Frontend

> **Purpose:** Mapping SignalR events giữa Backend và Frontend  
> **Created:** 2025-12-30

---

## 📋 Event Mapping Table

### Message Events

| Backend Event     | Payload                            | Frontend Handler        | Action                                   |
| ----------------- | ---------------------------------- | ----------------------- | ---------------------------------------- |
| `MessageSent`     | `MessageSentEvent`                 | `handleMessageSent`     | Add to cache, update sidebar, show toast |
| `MessageEdited`   | `{ messageId, content, editedAt }` | `handleMessageEdited`   | Update message in cache                  |
| `MessageDeleted`  | `{ messageId, conversationId }`    | `handleMessageDeleted`  | Remove from cache                        |
| `MessagePinned`   | `MessagePinnedEvent`               | `handleMessagePinned`   | Reload pinned messages                   |
| `MessageUnpinned` | `MessageUnpinnedEvent`             | `handleMessageUnpinned` | Reload pinned messages                   |

### Member Events

| Backend Event   | Payload              | Frontend Handler      | Action                          |
| --------------- | -------------------- | --------------------- | ------------------------------- |
| `MemberAdded`   | `MemberAddedEvent`   | `handleMemberAdded`   | Invalidate conversation members |
| `MemberRemoved` | `MemberRemovedEvent` | `handleMemberRemoved` | Invalidate conversation members |

### Typing & Presence

| Backend Event         | Payload                    | Frontend Handler        | Action                  |
| --------------------- | -------------------------- | ----------------------- | ----------------------- |
| `UserTyping`          | `UserTypingEvent`          | `handleUserTyping`      | Update typing indicator |
| `UserPresenceChanged` | `UserPresenceChangedEvent` | `handlePresenceChanged` | Update online status    |

### Mention Events

| Backend Event      | Payload                 | Frontend Handler         | Action                                 |
| ------------------ | ----------------------- | ------------------------ | -------------------------------------- |
| `UserMentioned`    | `UserMentionedEvent`    | `handleUserMentioned`    | Invalidate mentions, show notification |
| `MentionRead`      | `MentionReadEvent`      | `handleMentionRead`      | Update mention count                   |
| `MentionsBulkRead` | `MentionsBulkReadEvent` | `handleMentionsBulkRead` | Update mention count                   |

---

## 📦 Event Payload Schemas

### MessageSentEvent

```typescript
interface MessageSentEvent {
  message: {
    id: string; // UUID
    conversationId: string; // UUID
    senderId: string; // UUID
    senderName: string; // Display name
    parentMessageId: string | null; // For replies
    content: string; // Message text
    contentType: "TXT" | "IMG" | "FILE" | "TASK";
    sentAt: string; // ISO datetime
    editedAt: string | null; // ISO datetime if edited
    linkedTaskId: string | null; // For task messages
    attachments: Array<{
      id: string;
      name: string;
      url: string;
      type: string; // MIME type
      size: number; // Bytes
    }>;
    reactions: Array<{
      emoji: string;
      userId: string;
      userName: string;
    }>;
    replyCount: number;
    isStarred: boolean;
    isPinned: boolean;
    threadPreview: Message[] | null;
    mentions: string[]; // User IDs
  };
}
```

### MessagePinnedEvent

```typescript
interface MessagePinnedEvent {
  messageId: string;
  conversationId: string;
  pinnedBy: string; // User ID who pinned
  timestamp: string; // ISO datetime
}
```

### MessageUnpinnedEvent

```typescript
interface MessageUnpinnedEvent {
  messageId: string;
  conversationId: string;
  unpinnedBy: string; // User ID who unpinned
  timestamp: string; // ISO datetime
}
```

### MemberAddedEvent

```typescript
interface MemberAddedEvent {
  conversationId: string;
  userId: string;
  userName: string;
  addedBy: string; // User ID who added
  timestamp: string;
}
```

### MemberRemovedEvent

```typescript
interface MemberRemovedEvent {
  conversationId: string;
  userId: string;
  userName: string;
  removedBy: string; // User ID who removed
  timestamp: string;
}
```

### UserTypingEvent

```typescript
interface UserTypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}
```

### UserPresenceChangedEvent

```typescript
interface UserPresenceChangedEvent {
  userId: string;
  status: "Online" | "Offline" | "Away";
  timestamp: string;
}
```

### UserMentionedEvent

```typescript
interface UserMentionedEvent {
  mentionId: string;
  messageId: string;
  conversationId: string;
  mentionedByUserId: string;
  mentionedByUserName: string;
  messageContentPreview: string; // Truncated content
  mentionedAt: string;
}
```

### MentionReadEvent

```typescript
interface MentionReadEvent {
  mentionId: string;
  readBy: string; // User ID
  readAt: string;
}
```

### MentionsBulkReadEvent

```typescript
interface MentionsBulkReadEvent {
  mentionIds: string[];
  readBy: string;
  readAt: string;
}
```

---

## 🔄 Handler Implementation Guide

### Pattern: Event → Cache Update

```typescript
// In useMessageRealtime or Provider
useEffect(() => {
  if (!connection) return;

  const handleMessageSent = (event: MessageSentEvent) => {
    const { message } = event;

    // 1. Update messages cache
    queryClient.setQueryData(
      messageKeys.conversation(message.conversationId),
      (old) => {
        if (!old) return old;
        // Add message to first page
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              items: [message, ...old.pages[0].items],
            },
            ...old.pages.slice(1),
          ],
        };
      }
    );

    // 2. Invalidate conversation list (lastMessage changed)
    queryClient.invalidateQueries({
      queryKey: conversationKeys.all,
    });

    // 3. Show toast if needed
    if (shouldShowToast(message)) {
      toast.info(message.senderName, {
        description: message.content.slice(0, 100),
      });
    }
  };

  connection.on("MessageSent", handleMessageSent);
  return () => connection.off("MessageSent", handleMessageSent);
}, [connection, queryClient]);
```

### Pattern: Invalidate vs SetQueryData

| Scenario        | Strategy            | Reason               |
| --------------- | ------------------- | -------------------- |
| New message     | `setQueryData`      | Immediate UI update  |
| Message edited  | `setQueryData`      | Update specific item |
| Message deleted | `setQueryData`      | Remove specific item |
| Pinned messages | `invalidateQueries` | Reload entire list   |
| Member changed  | `invalidateQueries` | Reload members list  |
| Mentions        | `invalidateQueries` | Reload mentions      |

---

## 🧪 Testing Checklist

### MessageSent Event

- [ ] Message appears in correct conversation
- [ ] Message NOT duplicated if already exists (from optimistic update)
- [ ] Sidebar shows updated lastMessage
- [ ] Toast shown for messages in other conversations
- [ ] No toast for own messages

### UserTyping Event

- [ ] Typing indicator shows when user starts typing
- [ ] Typing indicator hides when user stops
- [ ] Multiple users typing shows correctly
- [ ] Typing indicator only for current conversation

### Reconnection

- [ ] Events received after reconnect
- [ ] No duplicate handlers after reconnect
- [ ] Cache stays consistent

---

**Created by:** GitHub Copilot  
**Date:** 2025-12-30

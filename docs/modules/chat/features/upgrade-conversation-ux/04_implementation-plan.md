# [BƯỚC 4] Implementation Plan - Upgrade Conversation UX

> **Status:** ✅ Phase 1 COMPLETED | ⏳ Phase 2 PENDING APPROVAL  
> **Created:** 2026-01-07  
> **Phase 1 Approved:** 2026-01-07  
> **Phase 1 Completed:** 2026-01-07  
> **Phase 2 Created:** 2026-01-07  
> **Version:** 1.2 (Added Phase 2: UI Enhancements)  
> **Note:** BƯỚC 3 (API Contract) được skip vì APIs đã có sẵn

---

## 📋 Implementation Overview

**Phase 1 (COMPLETED):** Core real-time conversation list functionality

1. **Phase 1:** Unread Badge & Message Preview (UI only) ✅
2. **Phase 2:** Real-time Updates & Sorting (SignalR integration) ✅
3. **Phase 3:** Multi-line Input (Textarea + Shift+Enter) ✅
4. **Phase 4:** Auto-focus & Polish (UX improvements) ✅

**Phase 2 (NEW - PENDING):** UI Enhancements

5. **Enhancement 1:** Message Input Auto-Grow (5 rows max)
6. **Enhancement 2:** Auto-Focus Input on Conversation Switch
7. **Enhancement 3:** Fix Conversation Item Border Hover
8. **Enhancement 4:** Reposition Unread Count Badge

---

## 🗂️ File Structure

> ⚠️ **IMPORTANT - File Clarification:**
>
> - ✅ **ACTIVE:** `src/features/portal/components/ChatMainContainer.tsx` (đang dùng)
> - ❌ **DEPRECATED:** `src/features/portal/workspace/ChatMessagePanel.tsx` (cũ, không dùng)
> - ❌ **NOT EXISTS:** `ChatMain.tsx` (đã rename thành ChatMainContainer)

```
src/
├── components/
│   └── ui/
│       ├── UnreadBadge.tsx                    # [NEW] Phase 1
│       └── __tests__/
│           └── UnreadBadge.test.tsx           # [NEW] Phase 1
│
├── features/portal/components/
│   ├── ConversationList.tsx                   # [MODIFY] Phase 1,2
│   ├── ConversationItem.tsx                   # [NEW] Phase 1 (extract)
│   ├── MessagePreview.tsx                     # [NEW] Phase 1
│   ├── RelativeTime.tsx                       # [NEW] Phase 1
│   └── __tests__/
│       ├── ConversationItem.test.tsx          # [NEW] Phase 1
│       ├── MessagePreview.test.tsx            # [NEW] Phase 1
│       └── RelativeTime.test.tsx              # [NEW] Phase 1
│
├── features/portal/workspace/
│   ├── ChatMainContainer.tsx                   # [MODIFY] Phase 3,4
│   ├── ChatInput.tsx                          # [NEW] Phase 3 (extract)
│   └── __tests__/
│       └── ChatInput.test.tsx                 # [NEW] Phase 3
│
├── hooks/
│   ├── mutations/
│   │   ├── useMarkConversationAsRead.ts       # [NEW] Phase 2
│   │   └── __tests__/
│   │       └── useMarkConversationAsRead.test.ts # [NEW] Phase 2
│   │
│   └── useConversationRealtime.ts             # [NEW] Phase 2
│       └── __tests__/
│           └── useConversationRealtime.test.ts # [NEW] Phase 2
│
├── utils/
│   ├── conversationSort.ts                    # [NEW] Phase 2
│   ├── formatRelativeTime.ts                  # [NEW] Phase 1
│   └── __tests__/
│       ├── conversationSort.test.ts           # [NEW] Phase 2
│       └── formatRelativeTime.test.ts         # [NEW] Phase 1
│
└── types/
    └── conversations.ts                       # [MODIFY] Phase 1 (type updates)

tests/
├── chat/
│   ├── conversation-list.test.ts              # [MODIFY] Phase 1,2
│   └── chat-input.test.ts                     # [NEW] Phase 3
```

---

## 🔨 Phase 1: Unread Badge & Message Preview

### Objectives

- ✅ Hiển thị unread count badge
- ✅ Hiển thị message preview formatted
- ✅ Hiển thị relative time
- ✅ Extract ConversationItem component

### Files to Create

#### 1.1 `src/components/ui/UnreadBadge.tsx`

```typescript
interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count === 0) return null;

  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <span
      data-testid="unread-badge"
      className={cn(
        "min-w-[20px] h-5 px-1.5 rounded-full",
        "bg-red-500 text-white text-xs font-semibold",
        "flex items-center justify-center",
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {displayCount}
    </span>
  );
}
```

**Tests Required:**

- ✅ Renders với count = 1
- ✅ Renders "99+" khi count > 99
- ✅ Returns null khi count = 0
- ✅ Applies custom className

---

#### 1.2 `src/features/portal/components/MessagePreview.tsx`

```typescript
interface MessagePreviewProps {
  message: LastMessage;
  maxLength?: number;
}

export function MessagePreview({
  message,
  maxLength = 50,
}: MessagePreviewProps) {
  const getPreviewText = () => {
    const { senderName, content, contentType, attachments } = message;

    let preview = "";

    // Format based on content type
    switch (contentType) {
      case "image":
        preview = "📷 [Hình ảnh]";
        break;
      case "file":
        const fileName = attachments?.[0]?.name || "file";
        preview = `📎 [File] ${fileName}`;
        break;
      case "task":
        preview = "📋 [Task]";
        break;
      default:
        preview = content;
    }

    // Truncate if needed
    if (preview.length > maxLength) {
      preview = preview.substring(0, maxLength) + "...";
    }

    return `${senderName}: ${preview}`;
  };

  return (
    <p data-testid="message-preview" className="text-sm text-gray-600 truncate">
      {getPreviewText()}
    </p>
  );
}
```

**Tests Required:**

- ✅ Renders text message with sender name
- ✅ Renders image message with icon
- ✅ Renders file message with filename
- ✅ Truncates long messages at maxLength
- ✅ Handles missing attachment name

---

#### 1.3 `src/utils/formatRelativeTime.ts`

```typescript
export function formatRelativeTime(timestamp: string | Date): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;

  // Format as date for older messages
  return past.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}
```

**Tests Required:**

- ✅ Returns "Vừa xong" for < 1 minute
- ✅ Returns "X phút trước" for < 60 minutes
- ✅ Returns "X giờ trước" for < 24 hours
- ✅ Returns "Hôm qua" for 1 day ago
- ✅ Returns "X ngày trước" for < 7 days
- ✅ Returns formatted date for >= 7 days

---

#### 1.4 `src/features/portal/components/RelativeTime.tsx`

```typescript
import { formatRelativeTime } from "@/utils/formatRelativeTime";

interface RelativeTimeProps {
  timestamp: string | Date;
  className?: string;
}

export function RelativeTime({ timestamp, className }: RelativeTimeProps) {
  const [relativeTime, setRelativeTime] = useState(() =>
    formatRelativeTime(timestamp)
  );

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(timestamp));
    }, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span
      data-testid="relative-time"
      className={cn("text-xs text-gray-500", className)}
      title={new Date(timestamp).toLocaleString("vi-VN")}
    >
      {relativeTime}
    </span>
  );
}
```

**Tests Required:**

- ✅ Renders formatted time
- ✅ Updates after 1 minute (via fake timers)
- ✅ Shows full timestamp on hover (title attribute)
- ✅ Cleans up interval on unmount

---

#### 1.5 `src/features/portal/components/ConversationItem.tsx`

**Extract from ConversationList.tsx:**

```typescript
interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const { id, name, avatar, lastMessage, unreadCount } = conversation;

  return (
    <div
      data-testid={`conversation-item-${id}`}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer",
        "hover:bg-gray-50 transition-colors",
        isActive && "bg-blue-50",
        unreadCount > 0 && "border-l-3 border-blue-500"
      )}
      role="button"
      tabIndex={0}
      aria-label={`Conversation with ${name}, ${unreadCount} unread messages`}
    >
      {/* Avatar */}
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-base truncate">{name}</h3>
          {!isActive && unreadCount > 0 && <UnreadBadge count={unreadCount} />}
        </div>

        {lastMessage && (
          <div className="flex items-center justify-between">
            <MessagePreview message={lastMessage} />
            <RelativeTime timestamp={lastMessage.sentAt} />
          </div>
        )}
      </div>
    </div>
  );
}
```

**Tests Required:**

- ✅ Renders conversation info correctly
- ✅ Shows badge when unreadCount > 0 and !isActive
- ✅ Hides badge when isActive
- ✅ Applies active styles when isActive
- ✅ Shows unread border when unreadCount > 0
- ✅ Calls onClick when clicked

---

### Files to Modify

#### 1.6 `src/features/portal/components/ConversationList.tsx`

**Changes:**

```typescript
// BEFORE
export function ConversationList() {
  const conversations = useMockConversations();

  return (
    <div>
      {conversations.map((conv) => (
        <div key={conv.id}>{/* Inline conversation item rendering */}</div>
      ))}
    </div>
  );
}

// AFTER
import { ConversationItem } from "./ConversationItem";

export function ConversationList() {
  const { data: conversations } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string>();

  return (
    <div data-testid="conversation-list">
      {conversations?.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeConversationId}
          onClick={() => setActiveConversationId(conv.id)}
        />
      ))}
    </div>
  );
}
```

---

## 🔨 Phase 2: Real-time Updates & Sorting

### Objectives

- ✅ Listen SignalR `MessageSent` event
- ✅ Update conversation lastMessage & unreadCount
- ✅ Sort conversations by latest message
- ✅ Mark as read when click conversation
- ✅ Lock scroll position khi reorder

### Files to Create

#### 2.1 `src/hooks/mutations/useMarkConversationAsRead.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markConversationAsRead } from "@/api/conversations.api";
import { conversationsKeys } from "@/hooks/queries/useConversations";

export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markConversationAsRead,

    onMutate: async (conversationId) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: conversationsKeys.all,
      });

      const previousData = queryClient.getQueryData(conversationsKeys.lists());

      // Update unreadCount to 0
      queryClient.setQueryData(
        conversationsKeys.lists(),
        (old: Conversation[]) =>
          old?.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
      );

      return { previousData };
    },

    onError: (err, conversationId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          conversationsKeys.lists(),
          context.previousData
        );
      }
    },

    onSuccess: () => {
      // Invalidate to sync with server
      queryClient.invalidateQueries({
        queryKey: conversationsKeys.all,
      });
    },
  });
}
```

**Tests Required:**

- ✅ Calls API with conversationId
- ✅ Optimistically updates unreadCount to 0
- ✅ Rollbacks on API error
- ✅ Invalidates queries on success

---

#### 2.2 `src/utils/conversationSort.ts`

```typescript
import type { Conversation } from "@/types/conversations";

export function sortConversationsByLatest(
  conversations: Conversation[]
): Conversation[] {
  return [...conversations].sort((a, b) => {
    const timeA = a.lastMessage?.sentAt
      ? new Date(a.lastMessage.sentAt).getTime()
      : 0;
    const timeB = b.lastMessage?.sentAt
      ? new Date(b.lastMessage.sentAt).getTime()
      : 0;

    return timeB - timeA; // Newest first
  });
}
```

**Tests Required:**

- ✅ Sorts conversations by lastMessage.sentAt DESC
- ✅ Handles conversations without lastMessage
- ✅ Doesn't mutate original array
- ✅ Handles empty array

---

#### 2.3 `src/hooks/useConversationRealtime.ts`

```typescript
import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSignalR } from "@/lib/signalr";
import { conversationsKeys } from "@/hooks/queries/useConversations";
import type { MessageSentEvent } from "@/types/signalr";

interface UseConversationRealtimeOptions {
  activeConversationId?: string;
}

export function useConversationRealtime({
  activeConversationId,
}: UseConversationRealtimeOptions = {}) {
  const queryClient = useQueryClient();
  const { connection } = useSignalR();

  const handleMessageSent = useCallback(
    (event: MessageSentEvent) => {
      const { conversationId, message } = event;

      queryClient.setQueryData(
        conversationsKeys.lists(),
        (old: Conversation[]) => {
          if (!old) return old;

          return old.map((conv) => {
            if (conv.id !== conversationId) return conv;

            // Update lastMessage
            const updated = {
              ...conv,
              lastMessage: {
                content: message.content,
                senderName: message.senderName,
                sentAt: message.sentAt,
                contentType: message.contentType,
                attachments: message.attachments,
              },
            };

            // Increment unreadCount nếu KHÔNG phải active conversation
            if (conversationId !== activeConversationId) {
              updated.unreadCount = (conv.unreadCount || 0) + 1;
            }

            return updated;
          });
        }
      );

      // Resort conversations
      queryClient.setQueryData(
        conversationsKeys.lists(),
        (old: Conversation[]) => (old ? sortConversationsByLatest(old) : old)
      );
    },
    [queryClient, activeConversationId]
  );

  const handleMessageRead = useCallback(
    (event: { conversationId: string; userId: string }) => {
      const { conversationId } = event;

      // Update unreadCount to 0
      queryClient.setQueryData(
        conversationsKeys.lists(),
        (old: Conversation[]) =>
          old?.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
      );
    },
    [queryClient]
  );

  useEffect(() => {
    if (!connection) return;

    connection.on("MessageSent", handleMessageSent);
    connection.on("MessageRead", handleMessageRead);

    return () => {
      connection.off("MessageSent", handleMessageSent);
      connection.off("MessageRead", handleMessageRead);
    };
  }, [connection, handleMessageSent, handleMessageRead]);
}
```

**Tests Required:**

- ✅ Listens to MessageSent event
- ✅ Updates lastMessage on new message
- ✅ Increments unreadCount if not active conversation
- ✅ Does NOT increment unreadCount if active conversation
- ✅ Resorts conversations after update
- ✅ Listens to MessageRead event
- ✅ Sets unreadCount to 0 on MessageRead
- ✅ Cleans up listeners on unmount

---

### Files to Modify

#### 2.4 `src/features/portal/components/ConversationList.tsx`

**Add:**

```typescript
import { useConversationRealtime } from "@/hooks/useConversationRealtime";
import { useMarkConversationAsRead } from "@/hooks/mutations/useMarkConversationAsRead";
import { sortConversationsByLatest } from "@/utils/conversationSort";

export function ConversationList() {
  const { data: conversations } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const { mutate: markAsRead } = useMarkConversationAsRead();
  const listRef = useRef<HTMLDivElement>(null);

  // Real-time updates
  useConversationRealtime({ activeConversationId });

  // Sort conversations
  const sortedConversations = useMemo(
    () => (conversations ? sortConversationsByLatest(conversations) : []),
    [conversations]
  );

  // Lock scroll position when reordering
  useEffect(() => {
    if (!listRef.current) return;
    const scrollY = listRef.current.scrollTop;

    return () => {
      if (listRef.current) {
        listRef.current.scrollTop = scrollY;
      }
    };
  }, [sortedConversations]);

  const handleConversationClick = (conversationId: string) => {
    setActiveConversationId(conversationId);
    markAsRead(conversationId);
  };

  return (
    <div ref={listRef} data-testid="conversation-list">
      {sortedConversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeConversationId}
          onClick={() => handleConversationClick(conv.id)}
        />
      ))}
    </div>
  );
}
```

---

## 🔨 Phase 3: Multi-line Input

### Objectives

- ✅ Replace `<Input>` with `<Textarea>`
- ✅ Auto-resize textarea (max 5 lines)
- ✅ Shift+Enter → new line
- ✅ Enter → submit message
- ✅ Support paste multi-line text

### Files to Create

#### 3.1 `src/features/portal/workspace/ChatInput.tsx`

```typescript
import { useRef, useState, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue("");

    // Auto-focus sau khi gửi
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get scrollHeight
    textarea.style.height = "auto";

    // Set height based on content, max 120px (5 lines)
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  }, [value]);

  const isDisabled = disabled || !value.trim();

  return (
    <div
      data-testid="chat-input-container"
      className="border-t border-gray-200 p-4"
    >
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            data-testid="chat-message-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            disabled={disabled}
            aria-label="Nhập tin nhắn"
            aria-describedby="input-helper-text"
            className="w-full min-h-[40px] max-h-[120px] p-2.5 
                       border border-gray-300 rounded-lg
                       resize-none overflow-y-auto
                       focus:border-blue-500 focus:outline-none
                       focus:ring-2 focus:ring-blue-100
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={1}
          />
          <span
            id="input-helper-text"
            className="text-xs text-gray-400 mt-1 block"
          >
            Shift+Enter để xuống hàng
          </span>
        </div>

        <Button
          data-testid="chat-send-button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="h-10 w-10 p-0"
          aria-label="Gửi tin nhắn"
        >
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
}
```

**Tests Required:**

- ✅ Renders textarea và send button
- ✅ Updates value on input change
- ✅ Calls onSend on Enter key (no Shift)
- ✅ Does NOT call onSend on Shift+Enter
- ✅ Adds newline on Shift+Enter
- ✅ Clears input after send
- ✅ Auto-focuses after send
- ✅ Disables send button when empty
- ✅ Auto-resizes textarea (max 120px)
- ✅ Handles paste multi-line text

---

### Files to Modify

#### 3.2 `src/features/portal/components/ChatMainContainer.tsx`

**Replace input section:**

```typescript
// BEFORE
<div className="input-area">
  <Input
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleSend()}
  />
  <Button onClick={handleSend}>Send</Button>
</div>;

// AFTER
import { ChatInput } from "./ChatInput";

// ... in render
<ChatInput onSend={handleSendMessage} disabled={isSending} />;
```

---

## 🔨 Phase 4: Auto-focus & Polish

### Objectives

- ✅ Auto-focus input on page load
- ✅ Flash effect on new message
- ✅ Smooth scroll lock implementation
- ✅ Error handling & toast notifications

### Files to Modify

#### 4.1 `src/features/portal/workspace/ChatInput.tsx`

**Add initial focus:**

```typescript
export function ChatInput({ onSend, disabled }: ChatInputProps) {
  // ... existing code

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // ... rest of component
}
```

---

#### 4.2 `src/features/portal/components/ConversationItem.tsx`

**Add flash effect:**

```typescript
export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const [isJustUpdated, setIsJustUpdated] = useState(false);
  const prevLastMessageRef = useRef(conversation.lastMessage);

  // Detect new message
  useEffect(() => {
    if (
      conversation.lastMessage &&
      prevLastMessageRef.current?.sentAt !== conversation.lastMessage.sentAt
    ) {
      setIsJustUpdated(true);

      // Remove flash after 2s
      const timer = setTimeout(() => setIsJustUpdated(false), 2000);
      return () => clearTimeout(timer);
    }

    prevLastMessageRef.current = conversation.lastMessage;
  }, [conversation.lastMessage]);

  return (
    <div
      className={cn(
        // ... existing classes
        isJustUpdated && "animate-flash" // Add flash animation
      )}
    >
      {/* ... */}
    </div>
  );
}
```

**Add CSS animation in `globals.css`:**

```css
@keyframes flash {
  0% {
    background-color: #fef9c3;
  } /* yellow-50 */
  100% {
    background-color: transparent;
  }
}

.animate-flash {
  animation: flash 2s ease-out;
}
```

---

#### 4.3 Error Handling Updates

**Add toast notifications in `useMarkConversationAsRead`:**

```typescript
import { toast } from "@/components/ui/use-toast";

export function useMarkConversationAsRead() {
  return useMutation({
    // ... existing code

    onError: (err, conversationId, context) => {
      // Rollback
      if (context?.previousData) {
        queryClient.setQueryData(
          conversationsKeys.lists(),
          context.previousData
        );
      }

      // Show error toast
      toast({
        title: "Lỗi",
        description: "Không thể đánh dấu đã đọc. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });
}
```

**Add error handling in `ChatInput`:**

```typescript
const handleSubmit = async () => {
  const trimmed = value.trim();
  if (!trimmed || disabled) return;

  try {
    await onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  } catch (error) {
    // Keep input value on error, don't clear
    toast({
      title: "Gửi tin nhất thất bại",
      description: "Vui lòng kiểm tra kết nối và thử lại.",
      variant: "destructive",
    });
  }
};
```

---

## 📦 Dependencies

### Existing (No new dependencies needed!)

- ✅ `@tanstack/react-query` - Already in project
- ✅ `@microsoft/signalr` - Already in project
- ✅ `lucide-react` - Already in project
- ✅ Native `<textarea>` - No library needed

### Decision: react-textarea-autosize → KHÔNG CẦN

**Lý do:** Auto-resize đơn giản, tự implement bằng `scrollHeight` + `useEffect`

---

## 🧪 Testing Strategy

### Unit Tests (Required)

| File                                | Test Count | Priority  |
| ----------------------------------- | ---------- | --------- |
| `UnreadBadge.test.tsx`              | 4          | 🔴 High   |
| `MessagePreview.test.tsx`           | 5          | 🔴 High   |
| `formatRelativeTime.test.ts`        | 6          | 🔴 High   |
| `RelativeTime.test.tsx`             | 4          | 🟡 Medium |
| `ConversationItem.test.tsx`         | 6          | 🔴 High   |
| `conversationSort.test.ts`          | 4          | 🔴 High   |
| `useMarkConversationAsRead.test.ts` | 4          | 🔴 High   |
| `useConversationRealtime.test.ts`   | 8          | 🔴 High   |
| `ChatInput.test.tsx`                | 10         | 🔴 High   |

**Total:** 51 unit tests

### Integration Tests (Optional but recommended)

| File                        | Test Scenarios                          |
| --------------------------- | --------------------------------------- |
| `conversation-list.test.ts` | Real-time updates, sorting, unread sync |
| `chat-input.test.ts`        | Multi-line input flow, submit flow      |

---

## 📋 IMPACT SUMMARY (Updated)

### Files sẽ tạo mới:

**Phase 1:**

- `src/components/ui/UnreadBadge.tsx` + test
- `src/features/portal/components/MessagePreview.tsx` + test
- `src/features/portal/components/RelativeTime.tsx` + test
- `src/features/portal/components/ConversationItem.tsx` + test
- `src/utils/formatRelativeTime.ts` + test

**Phase 2:**

- `src/hooks/mutations/useMarkConversationAsRead.ts` + test
- `src/hooks/useConversationRealtime.ts` + test
- `src/utils/conversationSort.ts` + test

**Phase 3:**

- `src/features/portal/workspace/ChatInput.tsx` + test

**Phase 4:**

- (No new files, chỉ modify existing)

**Total:** 9 implementation files + 9 test files = **18 files**

### Files sẽ sửa đổi:

**Phase 1:**

- `src/features/portal/workspace/ConversationListSidebar.tsx` - Integrate ConversationItem (thay vì ConversationList.tsx không tồn tại)

**Phase 2:**

- `src/features/portal/workspace/ConversationListSidebar.tsx` - Add real-time, sorting
- `src/hooks/useConversationRealtime.ts` - Upgrade với activeConversationId tracking

**Phase 3:**

- `src/features/portal/components/ChatMainContainer.tsx` - Replace input with ChatInput ⚠️ **FILE ĐANG DÙNG**

**Phase 4:**

- `src/features/portal/components/ChatInput.tsx` - Add auto-focus (already implemented)
- `src/features/portal/components/ConversationItem.tsx` - Add flash effect (CSS ready)
- `src/styles/globals.css` - Add flash animation (attempted)

**Total:** 4 files modified

> ⚠️ **Note:** ChatMessagePanel.tsx là file deprecated, không được modify trong feature này.

### Dependencies sẽ thêm:

- ❌ **NONE** - Tất cả dependencies đã có sẵn!

---

## 📅 Implementation Timeline

| Phase   | Estimated Time | Can Start After           |
| ------- | -------------- | ------------------------- |
| Phase 1 | 4-6 hours      | BƯỚC 6 approved           |
| Phase 2 | 6-8 hours      | Phase 1 complete          |
| Phase 3 | 3-4 hours      | BƯỚC 6 approved (độc lập) |
| Phase 4 | 2-3 hours      | Phase 1,2,3 complete      |

**Total:** 15-21 hours (2-3 ngày làm việc)

---

## � Critical Issues Discovered During Implementation

### Issue #1: SignalR Event Structure Mismatch

**Severity:** 🔴 CRITICAL  
**Status:** ✅ FIXED

**Problem:** Backend sends `{ message: {...} }` but code expected `{ conversationId, message }`

**Solution:** Modified `handleMessageSent` to handle multiple formats:

```typescript
const handleMessageSent = useCallback((...args: any[]) => {
  const payload = args[0];
  if (payload.message) {
    message = payload.message;
    conversationId = message.conversationId;
  }
}, []);
```

### Issue #2: API Response Structure (data vs items)

**Severity:** 🔴 CRITICAL  
**Status:** ✅ FIXED

**Problem:** API returns `items` array but code used `data` property

**Solution:** Fixed `ConversationPage` type:

```typescript
type ConversationPage = {
  items: (GroupConversation | DirectConversation)[]; // ✅ Changed from 'data'
  nextCursor: string | null;
  hasMore: boolean;
};
```

### Issue #3: Missing useApiData Prop

**Severity:** 🔴 CRITICAL  
**Status:** ✅ FIXED

**Problem:** `WorkspaceView.tsx` didn't pass `useApiData={true}` to `ConversationListSidebar`

**Solution:** Added prop in both desktop and mobile views:

```typescript
<ConversationListSidebar useApiData={true} />
```

### Issue #4: TanStack Query Cache Notification

**Severity:** 🟡 HIGH  
**Status:** ✅ FIXED

**Problem:** `setQueryData` doesn't trigger re-render during `staleTime`

**Solution:** Force notification without refetching:

```typescript
queryClient.setQueryData(key, newData);
queryClient.invalidateQueries({
  queryKey: key,
  refetchType: "none", // ✅ Notify only
});
```

### Issue #5: Wrong Type Names

**Severity:** 🟢 LOW  
**Status:** ✅ FIXED

**Problem:** Code used `DMConversation` but correct type is `DirectConversation`

**Solution:** Global search & replace across 4 files

---

## 📝 Actual Files Modified

### Core Realtime Logic

- `src/hooks/useConversationRealtime.ts` - ~60 lines
  - Handle flexible SignalR formats
  - Fix ConversationPage type
  - Add cache notification
  - Remove debug logs

### Query Hooks (Already correct)

- `src/hooks/queries/useGroups.ts` - No changes needed
- `src/hooks/queries/useDirectMessages.ts` - No changes needed

### Mutations

- `src/hooks/mutations/useMarkConversationAsRead.ts` - ~15 lines
  - Fix types
  - Fix data→items

### UI Components

- `src/features/portal/workspace/WorkspaceView.tsx` - 2 lines
- `src/features/portal/workspace/ConversationListSidebar.tsx` - ~10 lines
- `src/features/portal/components/ConversationItem.tsx` - 2 lines

### Utils

- `src/utils/sortConversationsByLatest.ts` - 2 lines

**Total:** 9 files, ~91 lines changed

---

## �🔀 Rollback Plan

Nếu cần rollback:

**Phase 1-3:** Git revert commits, xoá files mới
**Phase 4:** Disable flash animation, remove auto-focus

**No breaking changes** - Tất cả backward compatible.

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                        | Status       |
| ------------------------------- | ------------ |
| Đã review Implementation Plan   | ✅ Đã review |
| Đã review File Structure        | ✅ Đã review |
| Đã review Timeline              | ✅ Đã review |
| **APPROVED để tiếp tục BƯỚC 6** | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-07

> ✅ **Implementation Plan approved - AI được phép tiếp tục BƯỚC 6**

---

_Last updated: 2026-01-07_

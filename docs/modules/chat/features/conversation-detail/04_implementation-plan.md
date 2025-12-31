# [BƯỚC 4] Implementation Plan - Conversation Detail

> **Feature:** Chi tiết đoạn chat  
> **Status:** ✅ READY TO IMPLEMENT  
> **Last Updated:** 2025-12-30

---

## ✅ Prerequisites Check

| Prerequisite          | Status | Reference                                            |
| --------------------- | ------ | ---------------------------------------------------- |
| Requirements approved | ✅     | [01_requirements.md](01_requirements.md)             |
| Wireframe approved    | ✅     | [02a_wireframe.md](02a_wireframe.md)                 |
| Flow approved         | ✅     | [02b_flow.md](02b_flow.md)                           |
| API Contract ready    | ✅     | [contract.md](../../../api/chat/conversation-detail) |
| API Snapshots ready   | ✅     | `snapshots/v1/get-messages-success.json`             |
| ConversationList done | ⏳     | Có thể làm song song                                 |

---

## 📋 Confirmed Decisions (từ Requirements)

| Vấn đề                    | Quyết định    |
| ------------------------- | ------------- |
| Message pagination        | Cursor-based  |
| Page size                 | 50 messages   |
| File upload               | Direct upload |
| Max file size             | 10MB          |
| Typing indicator debounce | 500ms         |
| Message cache (staleTime) | 30s           |

---

## 📁 Implementation Tasks

### Phase 1: Types & API Client (⏱️ ~2 hours)

#### Task 1.1: Create/Update Message Types

**File:** `src/types/messages.ts`

```typescript
// Content Types
export type MessageContentType = "TXT" | "IMG" | "FILE" | "TASK";

// Attachment
export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Reaction
export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

// Message
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  parentMessageId: string | null;
  content: string;
  contentType: MessageContentType;
  sentAt: string;
  editedAt: string | null;
  linkedTaskId: string | null;
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  replyCount: number;
  isStarred: boolean;
  isPinned: boolean;
  threadPreview: unknown | null;
  mentions: string[];
}

// API Response
export interface GetMessagesResponse {
  items: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Send Message Request
export interface SendMessageRequest {
  content: string;
  contentType: MessageContentType;
  parentMessageId?: string | null;
  attachments?: string[]; // File IDs
}

// Send Message Response
export interface SendMessageResponse extends ChatMessage {}
```

**Tests:** `src/types/__tests__/messages.test.ts`

- [ ] Type guards: isTextMessage, isImageMessage, isFileMessage
- [ ] Validate against API snapshots

---

#### Task 1.2: Create Messages API Client

**File:** `src/api/messages.api.ts`

```typescript
import { apiClient } from "./client";
import type {
  GetMessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "@/types/messages";

interface GetMessagesParams {
  conversationId: string;
  limit?: number;
  cursor?: string;
}

// GET /api/conversations/{guid}/messages
export const getMessages = async ({
  conversationId,
  limit = 50,
  cursor,
}: GetMessagesParams): Promise<GetMessagesResponse> => {
  const params: Record<string, unknown> = { limit };
  if (cursor) params.cursor = cursor;

  const response = await apiClient.get(
    `/api/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
};

// POST /api/conversations/{guid}/messages
export const sendMessage = async (
  conversationId: string,
  data: SendMessageRequest
): Promise<SendMessageResponse> => {
  const response = await apiClient.post(
    `/api/conversations/${conversationId}/messages`,
    data
  );
  return response.data;
};

// POST upload attachment (if separate endpoint)
export const uploadAttachment = async (
  conversationId: string,
  file: File
): Promise<{ id: string; url: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    `/api/conversations/${conversationId}/attachments`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};
```

**Tests:** `src/api/__tests__/messages.api.test.ts`

- [ ] getMessages: success, with params, pagination
- [ ] sendMessage: success, validation
- [ ] uploadAttachment: success, file size check
- [ ] Error handling (401, 403, 404, 500)

---

### Phase 2: Query & Mutation Hooks (⏱️ ~2.5 hours)

#### Task 2.1: Create Message Query Keys

**File:** `src/hooks/queries/keys/messageKeys.ts`

```typescript
export const messageKeys = {
  all: ["messages"] as const,

  // Messages by conversation
  conversation: (conversationId: string) =>
    [...messageKeys.all, "conversation", conversationId] as const,

  // Messages list with pagination
  list: (conversationId: string, cursor?: string) =>
    [...messageKeys.conversation(conversationId), { cursor }] as const,

  // Single message detail
  detail: (messageId: string) =>
    [...messageKeys.all, "detail", messageId] as const,
};
```

---

#### Task 2.2: Create useMessages Hook (Infinite Query)

**File:** `src/hooks/queries/useMessages.ts`

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessages } from "@/api/messages.api";
import { messageKeys } from "./keys/messageKeys";

interface UseMessagesOptions {
  conversationId: string;
  limit?: number;
  enabled?: boolean;
}

export function useMessages({
  conversationId,
  limit = 50,
  enabled = true,
}: UseMessagesOptions) {
  return useInfiniteQuery({
    queryKey: messageKeys.conversation(conversationId),
    queryFn: ({ pageParam }) =>
      getMessages({
        conversationId,
        limit,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30, // 30 seconds
    enabled: enabled && !!conversationId,
  });
}

// Helper to flatten messages from pages
export function flattenMessages(
  data: ReturnType<typeof useMessages>["data"]
): ChatMessage[] {
  return data?.pages.flatMap((page) => page.items) ?? [];
}
```

**Tests:** `src/hooks/queries/__tests__/useMessages.test.ts`

- [ ] Initial loading state
- [ ] Success với messages data
- [ ] Infinite scroll (load older messages)
- [ ] Empty conversation
- [ ] Error handling
- [ ] Disabled khi không có conversationId
- [ ] Cache behavior

---

#### Task 2.3: Create useSendMessage Mutation

**File:** `src/hooks/mutations/useSendMessage.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/api/messages.api";
import { messageKeys } from "../queries/keys/messageKeys";
import type { SendMessageRequest, ChatMessage } from "@/types/messages";

interface UseSendMessageOptions {
  conversationId: string;
  onSuccess?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

export function useSendMessage({
  conversationId,
  onSuccess,
  onError,
}: UseSendMessageOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => sendMessage(conversationId, data),

    // Optimistic update
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.conversation(conversationId),
      });

      const previousMessages = queryClient.getQueryData(
        messageKeys.conversation(conversationId)
      );

      // Add optimistic message to cache
      queryClient.setQueryData(
        messageKeys.conversation(conversationId),
        (old: any) => {
          if (!old) return old;
          const optimisticMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            conversationId,
            senderId: "current-user", // Get from auth store
            senderName: "Bạn",
            content: newMessage.content,
            contentType: newMessage.contentType,
            sentAt: new Date().toISOString(),
            // ... other defaults
          };
          return {
            ...old,
            pages: [
              {
                ...old.pages[0],
                items: [optimisticMessage, ...old.pages[0].items],
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );

      return { previousMessages };
    },

    onError: (err, newMessage, context) => {
      // Rollback on error
      queryClient.setQueryData(
        messageKeys.conversation(conversationId),
        context?.previousMessages
      );
      onError?.(err as Error);
    },

    onSuccess: (data) => {
      // Replace optimistic message with real one
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(conversationId),
      });
      onSuccess?.(data);
    },
  });
}
```

**Tests:** `src/hooks/mutations/__tests__/useSendMessage.test.ts`

- [ ] Successful send
- [ ] Optimistic update appears immediately
- [ ] Error rollback
- [ ] Invalidate queries on success

---

### Phase 3: Components (⏱️ ~4 hours)

#### Task 3.1: Component Structure

```
src/features/chat/ConversationDetail/
├── index.ts                      # Barrel export
├── ConversationDetail.tsx        # Main container
├── ConversationHeader.tsx        # Header với name, avatar, actions
├── MessageList.tsx               # Virtualized/scrollable list
├── MessageBubble.tsx             # Single message bubble
├── MessageInput.tsx              # Input area + attachments
├── TypingIndicator.tsx           # "[User] đang nhập..."
├── DateDivider.tsx               # "Hôm nay", "Hôm qua"
├── MessageSkeleton.tsx           # Loading skeleton
├── EmptyConversation.tsx         # Empty state
└── __tests__/
    ├── ConversationDetail.test.tsx
    ├── MessageList.test.tsx
    ├── MessageBubble.test.tsx
    └── MessageInput.test.tsx
```

---

#### Task 3.2: ConversationDetail.tsx (Main Container)

```typescript
interface ConversationDetailProps {
  conversationId: string;
  conversationName: string;
  conversationType: "GRP" | "DM";
}

export function ConversationDetail({
  conversationId,
  conversationName,
  conversationType,
}: ConversationDetailProps) {
  const messagesQuery = useMessages({ conversationId });
  const sendMessageMutation = useSendMessage({ conversationId });

  const messages = flattenMessages(messagesQuery.data);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = (content: string, attachments?: File[]) => {
    sendMessageMutation.mutate({
      content,
      contentType: "TXT",
      attachments: [],
    });
  };

  if (messagesQuery.isLoading) return <MessageSkeleton />;
  if (messagesQuery.isError)
    return (
      <ErrorState error={messagesQuery.error} onRetry={messagesQuery.refetch} />
    );

  return (
    <div className="flex flex-col h-full" data-testid="conversation-detail">
      <ConversationHeader name={conversationName} type={conversationType} />

      <MessageList
        ref={messagesContainerRef}
        messages={messages}
        hasMore={messagesQuery.hasNextPage}
        isLoadingMore={messagesQuery.isFetchingNextPage}
        onLoadMore={() => messagesQuery.fetchNextPage()}
      />

      <TypingIndicator conversationId={conversationId} />

      <MessageInput
        onSend={handleSend}
        isSending={sendMessageMutation.isPending}
        disabled={sendMessageMutation.isPending}
      />
    </div>
  );
}
```

---

#### Task 3.3: MessageList.tsx

```typescript
interface MessageListProps {
  messages: ChatMessage[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, hasMore, isLoadingMore, onLoadMore }, ref) => {
    // Group messages by date
    const groupedMessages = useMemo(
      () => groupMessagesByDate(messages),
      [messages]
    );

    return (
      <div
        ref={ref}
        className="flex-1 overflow-y-auto p-4"
        data-testid="message-list"
      >
        {/* Load more button at top */}
        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full py-2 text-sm text-blue-500"
            data-testid="load-more-messages"
          >
            {isLoadingMore ? "Đang tải..." : "Tải tin nhắn cũ hơn"}
          </button>
        )}

        {/* Messages grouped by date */}
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <DateDivider date={date} />
            {msgs.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))}
          </div>
        ))}

        {messages.length === 0 && <EmptyConversation />}
      </div>
    );
  }
);
```

---

#### Task 3.4: MessageBubble.tsx

```typescript
interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const { content, contentType, senderName, sentAt, attachments } = message;

  return (
    <div
      className={cn("flex gap-2 mb-3", isOwn ? "justify-end" : "justify-start")}
      data-testid={`message-bubble-${message.id}`}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8" data-testid="message-avatar">
          <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn("max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <span
            className="text-xs text-gray-500 mb-1"
            data-testid="message-sender"
          >
            {senderName}
          </span>
        )}

        <div
          className={cn(
            "rounded-lg px-4 py-2",
            isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
          )}
          data-testid="message-content"
        >
          {contentType === "TXT" && <p>{content}</p>}
          {contentType === "IMG" && (
            <img src={attachments[0]?.url} alt="Hình ảnh" className="rounded" />
          )}
          {contentType === "FILE" && (
            <FileAttachment attachment={attachments[0]} />
          )}
        </div>

        <span className="text-xs text-gray-400 mt-1" data-testid="message-time">
          {formatTime(sentAt)}
        </span>
      </div>
    </div>
  );
}
```

---

#### Task 3.5: MessageInput.tsx

```typescript
interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void;
  isSending: boolean;
  disabled: boolean;
}

export function MessageInput({
  onSend,
  isSending,
  disabled,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!content.trim() && attachments.length === 0) return;
    onSend(content.trim(), attachments);
    setContent("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Validate file size (max 10MB)
    const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024);
    setAttachments((prev) => [...prev, ...validFiles]);
  };

  return (
    <div className="border-t p-4" data-testid="message-input-container">
      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2" data-testid="attachment-preview">
          {attachments.map((file, idx) => (
            <AttachmentPreview
              key={idx}
              file={file}
              onRemove={() =>
                setAttachments((prev) => prev.filter((_, i) => i !== idx))
              }
            />
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attach buttons */}
        <input
          type="file"
          id="file-input"
          className="hidden"
          onChange={handleFileSelect}
          multiple
          data-testid="file-input"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => document.getElementById("file-input")?.click()}
          data-testid="attach-file-button"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          disabled={disabled}
          className="flex-1 resize-none"
          rows={1}
          data-testid="message-textarea"
        />

        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={disabled || (!content.trim() && attachments.length === 0)}
          data-testid="send-message-button"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
```

---

### Phase 4: SignalR Integration (⏱️ ~2 hours)

#### Task 4.1: Add Message Events to SignalR

**File:** `src/lib/signalr.ts` (modify)

```typescript
export const SIGNALR_EVENTS = {
  // ... existing events

  // Message events
  NEW_MESSAGE: "NewMessage",
  MESSAGE_UPDATED: "MessageUpdated",
  MESSAGE_DELETED: "MessageDeleted",
  USER_TYPING: "UserTyping",
  MESSAGE_READ: "MessageRead",
} as const;

// Types for events
export interface NewMessageEvent {
  conversationId: string;
  message: ChatMessage;
}

export interface UserTypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}
```

---

#### Task 4.2: Create useMessageRealtime Hook

**File:** `src/hooks/useMessageRealtime.ts`

```typescript
import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { signalRConnection, SIGNALR_EVENTS } from "@/lib/signalr";
import { messageKeys } from "./queries/keys/messageKeys";
import { conversationKeys } from "./queries/keys/conversationKeys";
import type { NewMessageEvent, UserTypingEvent } from "@/lib/signalr";

interface UseMessageRealtimeOptions {
  conversationId: string;
  onNewMessage?: (message: ChatMessage) => void;
  onUserTyping?: (event: UserTypingEvent) => void;
}

export function useMessageRealtime({
  conversationId,
  onNewMessage,
  onUserTyping,
}: UseMessageRealtimeOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleNewMessage = (event: NewMessageEvent) => {
      if (event.conversationId !== conversationId) return;

      // Add message to cache
      queryClient.setQueryData(
        messageKeys.conversation(conversationId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: [
              {
                ...old.pages[0],
                items: [event.message, ...old.pages[0].items],
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );

      // Also update conversation list (lastMessage)
      queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });

      onNewMessage?.(event.message);
    };

    const handleUserTyping = (event: UserTypingEvent) => {
      if (event.conversationId !== conversationId) return;
      onUserTyping?.(event);
    };

    // Subscribe
    signalRConnection.on(SIGNALR_EVENTS.NEW_MESSAGE, handleNewMessage);
    signalRConnection.on(SIGNALR_EVENTS.USER_TYPING, handleUserTyping);

    // Cleanup
    return () => {
      signalRConnection.off(SIGNALR_EVENTS.NEW_MESSAGE, handleNewMessage);
      signalRConnection.off(SIGNALR_EVENTS.USER_TYPING, handleUserTyping);
    };
  }, [conversationId, queryClient, onNewMessage, onUserTyping]);
}
```

---

#### Task 4.3: Create useSendTypingIndicator Hook

**File:** `src/hooks/useSendTypingIndicator.ts`

```typescript
import { useCallback, useRef } from "react";
import { signalRConnection } from "@/lib/signalr";

interface UseSendTypingIndicatorOptions {
  conversationId: string;
  debounceMs?: number;
}

export function useSendTypingIndicator({
  conversationId,
  debounceMs = 500,
}: UseSendTypingIndicatorOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isTypingRef = useRef(false);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      signalRConnection.invoke("SendTyping", {
        conversationId,
        isTyping,
      });
    },
    [conversationId]
  );

  const handleTyping = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Send typing start if not already
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping(true);
    }

    // Set timeout to send typing stop
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTyping(false);
    }, debounceMs);
  }, [sendTyping, debounceMs]);

  return { handleTyping };
}
```

---

### Phase 5: Integration (⏱️ ~1.5 hours)

#### Task 5.1: Update ChatMain.tsx / WorkspaceView

**File:** `src/features/portal/workspace/WorkspaceView.tsx` (modify)

- [ ] Import `ConversationDetail` component
- [ ] Pass selected conversation info
- [ ] Handle conversation selection from ConversationList

---

## 📊 Test Coverage Requirements

| File                   | Type      | Min Coverage |
| ---------------------- | --------- | ------------ |
| messages.api.ts        | API       | 80%          |
| useMessages.ts         | Hook      | 80%          |
| useSendMessage.ts      | Hook      | 80%          |
| ConversationDetail.tsx | Component | 75%          |
| MessageList.tsx        | Component | 75%          |
| MessageBubble.tsx      | Component | 75%          |
| MessageInput.tsx       | Component | 80%          |
| useMessageRealtime.ts  | Hook      | 70%          |

---

## 📅 Timeline Summary

| Phase   | Tasks                  | Duration     | Dependencies |
| ------- | ---------------------- | ------------ | ------------ |
| Phase 1 | Types + API Client     | 2 hours      | -            |
| Phase 2 | Query + Mutation Hooks | 2.5 hours    | Phase 1      |
| Phase 3 | Components             | 4 hours      | Phase 2      |
| Phase 4 | SignalR Integration    | 2 hours      | Phase 3      |
| Phase 5 | Portal Integration     | 1.5 hours    | Phase 4      |
| -       | **TOTAL**              | **12 hours** |              |

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

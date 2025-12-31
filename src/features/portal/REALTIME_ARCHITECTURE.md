# Kiến Trúc Real-time Chat - Vega.Chat Module

**Ngày tạo:** 30/12/2025  
**Tác giả:** GitHub Copilot  
**Nguồn:** Phân tích từ source code thực tế Vega.Chat.Client

---

## 📚 Mục Lục

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [SignalR Connection Layer](#2-signalr-connection-layer)
3. [Event Handling Architecture](#3-event-handling-architecture)
4. [Chat Context & State Management](#4-chat-context--state-management)
5. [Configuration Management](#5-configuration-management)
6. [Message Flow](#6-message-flow)
7. [Reconnection Strategy](#7-reconnection-strategy)
8. [Best Practices](#8-best-practices)
9. [Source Code Reference](#9-source-code-reference)

---

## 1. Tổng Quan Kiến Trúc

### 1.1. Sơ Đồ Kiến Trúc React Client

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         React Application                                 │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      ChatProvider (Context)                      │    │
│  │  ─────────────────────────────────────────────────────────────  │    │
│  │  • Manages global chat state                                     │    │
│  │  • Integrates all custom hooks                                   │    │
│  │  • Provides context to entire app                                │    │
│  └───────┬─────────────────────────────────────────────────────────┘    │
│          │                                                                │
│          ├──► useSignalR()                                               │
│          │    ├─ Manages connection lifecycle                            │
│          │    ├─ Auto-reconnect with 3-minute delay                      │
│          │    ├─ Max 10 reconnect attempts                               │
│          │    └─ Returns: { connection, isConnected, connect, disconnect }│
│          │                                                                │
│          ├──► useSignalREvents({ connection, handlers })                 │
│          │    ├─ Subscribes to SignalR events                            │
│          │    ├─ Handles event → state updates                           │
│          │    └─ Auto cleanup on unmount                                 │
│          │                                                                │
│          ├──► useChat()                                                  │
│          │    ├─ Manages messages, conversations, groups                 │
│          │    ├─ API calls (load, send, pin, etc.)                       │
│          │    └─ Local state management                                  │
│          │                                                                │
│          ├──► useChatHandlers()                                          │
│          │    ├─ UI event handlers                                       │
│          │    ├─ Send message, select chat, etc.                         │
│          │    └─ Combines chat + signalR + fileUpload                    │
│          │                                                                │
│          ├──► useFileUpload()                                            │
│          │    └─ File upload logic                                       │
│          │                                                                │
│          ├──► useUserSearch()                                            │
│          │    └─ User search functionality                               │
│          │                                                                │
│          └──► useAutoScroll()                                            │
│               └─ Auto-scroll to bottom on new messages                   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Technology Stack

| Layer                | Technology               | File                  |
| -------------------- | ------------------------ | --------------------- |
| **Connection**       | `@microsoft/signalr` 8.x | `useSignalR.ts`       |
| **Event Handling**   | Custom hook              | `useSignalREvents.ts` |
| **State Management** | React Context + Hooks    | `ChatContext.tsx`     |
| **Configuration**    | Vite env + TypeScript    | `env.ts`              |
| **API Calls**        | Axios + React Query      | `services/*.ts`       |
| **UI State**         | Local useState + useRef  | Components            |

---

## 2. SignalR Connection Layer

### 2.1. useSignalR Hook

**File:** `src/hooks/useSignalR.ts`

#### Đặc điểm chính:

✅ **Auto-connect:** Tự động kết nối khi component mount (nếu đã authenticated)  
✅ **Singleton connection:** Sử dụng `useRef` để tránh multiple connections  
✅ **Reconnection:** Fixed 3-minute delay, max 10 attempts  
✅ **Lifecycle events:** onreconnecting, onreconnected, onclose  
✅ **Manual controls:** Expose `connect()` và `disconnect()` methods

#### Connection Configuration

```typescript
const connection = new signalR.HubConnectionBuilder()
  .withUrl(config.chatHubUrl, {
    // ✅ JWT authentication
    accessTokenFactory: () => authService.getAccessToken() || "",

    // ✅ Allow negotiate (không skip)
    skipNegotiation: false,

    // ✅ Multi-transport fallback
    transport:
      signalR.HttpTransportType.WebSockets |
      signalR.HttpTransportType.ServerSentEvents |
      signalR.HttpTransportType.LongPolling,
  })
  .withAutomaticReconnect({
    nextRetryDelayInMilliseconds: (retryContext) => {
      if (retryContext.previousRetryCount >= 10) {
        return null; // Stop after 10 attempts
      }
      return 180000; // Fixed 3 minutes
    },
  })
  .configureLogging(
    config.debug.signalr ? signalR.LogLevel.Debug : signalR.LogLevel.Information
  )
  .build();
```

#### State Management

```typescript
interface SignalRState {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  reconnectAttempt: number;
}
```

#### Connection Guards

```typescript
// ✅ Sử dụng ref để guard race conditions
const connectingRef = useRef<boolean>(false);

const connect = async () => {
  // Guard: prevent concurrent connections
  if (connectingRef.current || state.isConnected) {
    return;
  }

  connectingRef.current = true;

  try {
    // ... connection logic
  } finally {
    connectingRef.current = false;
  }
};
```

#### Auto-connect Logic

```typescript
useEffect(() => {
  const shouldConnect =
    authService.isAuthenticated() &&
    !connectionRef.current &&
    !connectingRef.current;

  if (shouldConnect) {
    connect();
  }

  return () => {
    if (connectionRef.current) {
      disconnect();
    }
  };
}, []); // Only on mount/unmount
```

### 2.2. Reconnection Strategy

#### Đặc điểm:

- **Fixed delay:** 3 minutes (180,000ms) giữa mỗi lần retry
- **Max attempts:** 10 lần
- **Toast notifications:**
  - ✅ "Chat connected" khi connect thành công
  - ✅ "Chat reconnected" khi reconnect thành công
  - ❌ "Chat connection lost" khi disconnect
  - ❌ "Unable to connect to chat after multiple attempts" khi hết retries

#### Implementation:

```typescript
const maxReconnectAttempts = 10;
const reconnectDelay = 180000; // 3 minutes

// Manual retry logic (nếu initial connect fail)
if (state.reconnectAttempt < maxReconnectAttempts) {
  setState((prev) => ({
    ...prev,
    reconnectAttempt: prev.reconnectAttempt + 1,
  }));

  reconnectTimeoutRef.current = setTimeout(() => {
    connect();
  }, reconnectDelay);
} else {
  // Clear connection ref để cho phép fresh start
  connectionRef.current = null;
  toast.error("Unable to connect to chat after multiple attempts");
}
```

### 2.3. Lifecycle Events

#### onreconnecting

```typescript
connection.onreconnecting((error) => {
  setState((prev) => ({
    ...prev,
    isConnected: false,
    error: error || null,
    reconnectAttempt: prev.reconnectAttempt + 1,
  }));

  if (config.debug.signalr) {
    console.warn("[SignalR] Reconnecting...", error);
  }
});
```

#### onreconnected

```typescript
connection.onreconnected((connectionId) => {
  setState((prev) => ({
    ...prev,
    isConnected: true,
    error: null,
    reconnectAttempt: 0, // Reset counter
  }));

  toast.success("Chat reconnected");
});
```

#### onclose

```typescript
connection.onclose((error) => {
  setState((prev) => ({
    ...prev,
    isConnected: false,
    error: error || null,
  }));

  // Chỉ show toast nếu có error (không phải manual disconnect)
  if (error) {
    toast.error("Chat connection lost");
  }
});
```

---

## 3. Event Handling Architecture

### 3.1. useSignalREvents Hook

**File:** `src/hooks/useSignalREvents.ts`

#### Đặc điểm:

✅ **Type-safe:** Interface cho mỗi event payload  
✅ **Handler-based:** Callback pattern cho flexibility  
✅ **Auto cleanup:** Unsubscribe khi component unmount  
✅ **Debug logging:** Optional logging qua config

#### Event Types

```typescript
export interface SignalREventHandlers {
  onMessageSent?: (event: MessageSentEvent) => void;
  onMemberAdded?: (event: MemberAddedEvent) => void;
  onMemberRemoved?: (event: MemberRemovedEvent) => void;
  onMessagePinned?: (event: MessagePinnedEvent) => void;
  onMessageUnpinned?: (event: MessageUnpinnedEvent) => void;
  onUserTyping?: (event: UserTypingEvent) => void;
  onUserPresenceChanged?: (event: UserPresenceChangedEvent) => void;
  onUserMentioned?: (event: UserMentionedEvent) => void;
  onMentionRead?: (event: MentionReadEvent) => void;
  onMentionsBulkRead?: (event: MentionsBulkReadEvent) => void;
}
```

#### Subscription Pattern

```typescript
useEffect(() => {
  if (!connection) return;

  // Define handlers
  const messageSentHandler = (event: MessageSentEvent) => {
    if (config.debug.signalr) {
      console.log("[SignalR Event] MessageSent:", event);
    }
    handlers.onMessageSent?.(event);
  };

  // Subscribe
  connection.on("MessageSent", messageSentHandler);

  // Cleanup: unsubscribe
  return () => {
    connection.off("MessageSent", messageSentHandler);
  };
}, [connection, handlers]);
```

#### Supported Events (Backend SignalREvents)

| Event Name            | Payload                    | Description              |
| --------------------- | -------------------------- | ------------------------ |
| `MessageSent`         | `MessageSentEvent`         | Message mới được gửi     |
| `MemberAdded`         | `MemberAddedEvent`         | Thành viên mới vào group |
| `MemberRemoved`       | `MemberRemovedEvent`       | Thành viên rời group     |
| `MessagePinned`       | `MessagePinnedEvent`       | Message được pin         |
| `MessageUnpinned`     | `MessageUnpinnedEvent`     | Message được unpin       |
| `UserTyping`          | `UserTypingEvent`          | User đang typing         |
| `UserPresenceChanged` | `UserPresenceChangedEvent` | User online/offline      |
| `UserMentioned`       | `UserMentionedEvent`       | User được mention        |
| `MentionRead`         | `MentionReadEvent`         | Mention được đọc         |
| `MentionsBulkRead`    | `MentionsBulkReadEvent`    | Bulk mark read           |

### 3.2. Event Payloads

#### MessageSentEvent

```typescript
export interface MessageSentEvent {
  message: Message; // Full MessageDto from backend
}

// Message type includes:
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUserName: string;
  content: string;
  contentType: "TXT" | "IMG" | "FILE";
  sentAt: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  // ... other fields
}
```

#### MessagePinnedEvent

```typescript
export interface MessagePinnedEvent {
  messageId: string;
  conversationId: string;
  pinnedBy: string;
  timestamp: string;
}
```

#### UserMentionedEvent

```typescript
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

## 4. Chat Context & State Management

### 4.1. ChatProvider Structure

**File:** `src/contexts/ChatContext.tsx`

#### Responsibility:

- ✅ Tích hợp tất cả custom hooks
- ✅ Quản lý global chat state
- ✅ Cung cấp context cho toàn bộ app
- ✅ Xử lý SignalR events → update state

#### Hook Integration:

```typescript
export const ChatProvider: React.FC = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.userId;

  // SignalR connection
  const signalR = useSignalR();

  // Chat operations (messages, conversations, groups)
  const chat = useChat();

  // File upload
  const fileUpload = useFileUpload();

  // User search
  const userSearch = useUserSearch();

  // Auto-scroll
  const { messagesEndRef } = useAutoScroll({
    isLoadingMessages: chat.isLoadingMessages,
    messages: chat.messages,
    currentUserId,
  });

  // ... state management
};
```

### 4.2. SignalR Event Handling trong ChatContext

#### onMessageSent Handler

```typescript
useSignalREvents({
  connection: signalR.connection,
  handlers: {
    onMessageSent: (event) => {
      const message = event.message;

      // 1. Update chat sidebar (last message + unread count)
      if (chat.onLastMessageEvent) {
        chat.onLastMessageEvent(message);
      }

      // 2. Add message to current chat if viewing it
      if (activeChat) {
        const isViewingConversation =
          activeChat.conversationId === message.conversationId;
        const isViewingGroup =
          activeChat.groupId && activeChat.groupId === message.conversationId;

        if (isViewingConversation || isViewingGroup) {
          chat.addMessage(message);
        }
      }

      // 3. Show notification if not viewing + message from other user
      if (currentUserId && message.senderId !== currentUserId) {
        const notInActiveChat =
          !activeChat ||
          (activeChat.conversationId !== message.conversationId &&
            activeChat.groupId !== message.conversationId);

        if (notInActiveChat) {
          toast.info(message.senderUserName || "New message", {
            description: message.content,
            duration: 5000,
          });
        }
      }
    },
  },
});
```

#### onMessagePinned Handler

```typescript
onMessagePinned: (event) => {
  // Reload pinned messages nếu đang xem conversation đó
  if (activeChat) {
    const targetId = activeChat.conversationId || activeChat.groupId;
    if (targetId === event.conversationId) {
      chat.loadPinMessages(
        activeChat.type === 'user' ? targetId : undefined,
        activeChat.type === 'group' ? targetId : undefined
      );
    }
  }
},
```

#### onUserMentioned Handler

```typescript
onUserMentioned: (event) => {
  // Invalidate mention queries (React Query)
  queryClient.invalidateQueries({
    queryKey: mentionKeys.unreadCount()
  });
  queryClient.invalidateQueries({
    queryKey: mentionKeys.list({ isRead: false })
  });

  // Show notification
  showMentionNotification({
    mentionId: event.mentionId,
    messageId: event.messageId,
    conversationId: event.conversationId,
    mentionedByUserName: event.mentionedByUserName,
    messageContentPreview: event.messageContentPreview,
  });
},
```

### 4.3. Load Initial Data

```typescript
useEffect(() => {
  if (signalR.isConnected) {
    chat.loadConversations();
    chat.loadGroups();
  }
}, [signalR.isConnected]);
```

**Logic:** Chỉ load conversations/groups khi SignalR đã connected.

---

## 5. Configuration Management

### 5.1. Environment Variables

**File:** `.env`

```env
# Backend API URLs
VITE_IDENTITY_API_URL=https://vega-identity-api-dev.allianceitsc.com/auth
VITE_CHAT_API_URL=https://vega-chat-api-dev.allianceitsc.com/api

# SignalR Hub URL
VITE_CHAT_HUB_URL=https://vega-chat-api-dev.allianceitsc.com/hubs/chat

# App Info
VITE_APP_NAME=Vega Chat
VITE_APP_VERSION=2.0.0

# Feature Flags
VITE_FEATURE_GROUPS_ENABLED=false
VITE_FEATURE_FILE_UPLOAD_ENABLED=false
VITE_FEATURE_QUICK_MESSAGES_ENABLED=false
VITE_FEATURE_USER_SEARCH_ENABLED=false

# Debug
VITE_DEBUG_API_CALLS=true
VITE_DEBUG_SIGNALR=true
```

### 5.2. Config Module

**File:** `src/config/env.ts`

```typescript
interface AppConfig {
  // API URLs
  identityApiUrl: string;
  chatApiUrl: string;
  chatHubUrl: string;

  // App Info
  appName: string;
  appVersion: string;

  // Feature Flags
  features: {
    groupsEnabled: boolean;
    fileUploadEnabled: boolean;
    quickMessagesEnabled: boolean;
    userSearchEnabled: boolean;
  };

  // Debug
  debug: {
    apiCalls: boolean;
    signalr: boolean;
  };
}

export const config: AppConfig = {
  identityApiUrl:
    import.meta.env.VITE_IDENTITY_API_URL ||
    "https://localhost:7135/api/identity",
  chatApiUrl:
    import.meta.env.VITE_CHAT_API_URL || "https://localhost:7136/api/chat",
  chatHubUrl:
    import.meta.env.VITE_CHAT_HUB_URL || "https://localhost:7136/hubs/chat",

  // ... rest of config

  debug: {
    apiCalls: parseBool(import.meta.env.VITE_DEBUG_API_CALLS),
    signalr: parseBool(import.meta.env.VITE_DEBUG_SIGNALR),
  },
};
```

#### Validation on Load

```typescript
export const validateConfig = (): void => {
  const required = [
    "VITE_IDENTITY_API_URL",
    "VITE_CHAT_API_URL",
    "VITE_CHAT_HUB_URL",
  ];

  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

// Auto-validate on module load
validateConfig();
```

### 5.3. Vite Proxy Configuration

**File:** `vite.config.ts`

```typescript
export default defineConfig({
  server: {
    proxy: {
      "/auth": {
        target: "https://localhost:7083",
        changeOrigin: true,
        secure: false, // Ignore SSL cert errors
      },
      "/api": {
        target: "https://localhost:7136",
        changeOrigin: true,
        secure: false,
      },
      "/hubs": {
        target: "https://localhost:7136",
        changeOrigin: true,
        secure: false,
        ws: true, // ✅ Enable WebSocket proxy
        rewrite: (path) => path, // Keep path as-is
      },
    },
  },
});
```

**Lợi ích:**

- ✅ Tránh CORS issues
- ✅ Tất cả requests đi qua cùng origin (localhost:5173)
- ✅ WebSocket hoạt động qua proxy

---

## 6. Message Flow

### 6.1. Sending Message Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User Types & Clicks Send                                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ handleSendMessage() (useChatHandlers)                        │
│ ─────────────────────────────────────────────────────────── │
│ 1. Validate input (text or file)                             │
│ 2. Upload file if exists → get fileData                      │
│ 3. Build SendMessageRequest payload                          │
│ 4. Call messageService.sendMessage(payload)                  │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ HTTP POST /api/messages
┌─────────────────────────────────────────────────────────────┐
│ Backend: SendMessageCommandHandler                           │
│ ─────────────────────────────────────────────────────────── │
│ 1. Save message to database                                  │
│ 2. Return MessageDto                                          │
│ 3. Broadcast SignalR event: "MessageSent"                    │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──► SignalR Broadcast → All conversation members
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Client: useSignalREvents - onMessageSent handler             │
│ ─────────────────────────────────────────────────────────── │
│ 1. Update sidebar (last message + unread count)              │
│ 2. Add message to chat if viewing                            │
│ 3. Show toast notification if not viewing                    │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ UI Updates:                                                   │
│ • Message appears in chat                                    │
│ • Sidebar shows latest message                               │
│ • Auto-scroll to bottom                                      │
└─────────────────────────────────────────────────────────────┘
```

### 6.2. Receiving Message Flow (from other user)

```
┌─────────────────────────────────────────────────────────────┐
│ Other User Sends Message                                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ SignalR Event: "MessageSent"
┌─────────────────────────────────────────────────────────────┐
│ useSignalREvents - onMessageSent handler                     │
│ ─────────────────────────────────────────────────────────── │
│ const message = event.message;                               │
│                                                               │
│ // 1. Update sidebar                                         │
│ chat.onLastMessageEvent(message);                            │
│                                                               │
│ // 2. Add to chat if viewing                                 │
│ if (activeChat.conversationId === message.conversationId) {  │
│   chat.addMessage(message);                                  │
│ }                                                             │
│                                                               │
│ // 3. Show notification if not viewing                       │
│ if (notInActiveChat && message.senderId !== currentUserId) { │
│   toast.info(message.senderUserName, {                       │
│     description: message.content                             │
│   });                                                         │
│ }                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3. Pin Message Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User Clicks Pin on Message                                   │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ HTTP POST /api/messages/{id}/pin
┌─────────────────────────────────────────────────────────────┐
│ Backend: PinMessageCommandHandler                            │
│ ─────────────────────────────────────────────────────────── │
│ 1. Save pinned message to database                           │
│ 2. Broadcast SignalR: "MessagePinned"                        │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ SignalR Event
┌─────────────────────────────────────────────────────────────┐
│ useSignalREvents - onMessagePinned handler                   │
│ ─────────────────────────────────────────────────────────── │
│ if (activeChat && targetId === event.conversationId) {       │
│   chat.loadPinMessages(conversationId);                      │
│ }                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Reconnection Strategy

### 7.1. Automatic Reconnection (SignalR Built-in)

```typescript
.withAutomaticReconnect({
  nextRetryDelayInMilliseconds: (retryContext) => {
    if (retryContext.previousRetryCount >= 10) {
      return null; // Stop
    }
    return 180000; // 3 minutes
  },
})
```

**Kích hoạt khi:**

- Network lost
- Server restart
- Connection timeout

**Behavior:**

- Tự động retry với delay 3 phút
- Max 10 lần
- Không cần manual intervention

### 7.2. Manual Reconnection (Initial Connect Fail)

```typescript
const connect = async () => {
  try {
    await connection.start();
    // Success
  } catch (error) {
    // Failed

    if (state.reconnectAttempt < maxReconnectAttempts) {
      // Schedule retry
      reconnectTimeoutRef.current = setTimeout(() => {
        connect(); // Recursive retry
      }, 180000); // 3 minutes
    } else {
      // Give up
      connectionRef.current = null;
      toast.error("Unable to connect after multiple attempts");
    }
  }
};
```

**Kích hoạt khi:**

- Initial connection fails (e.g., no JWT token)
- Backend offline khi app starts

### 7.3. User-triggered Reconnection

```typescript
// ChatProvider exposes disconnect/connect methods
const { connect, disconnect } = signalR;

// User can manually trigger
<Button onClick={connect}>Reconnect</Button>;
```

---

## 8. Best Practices

### 8.1. Connection Management

✅ **DO:**

- Sử dụng `useRef` để tránh multiple connections
- Guard concurrent connection attempts với `connectingRef`
- Auto-connect khi authenticated
- Cleanup connection on unmount

❌ **DON'T:**

- Tạo connection trong mỗi render
- Bỏ qua cleanup trong useEffect
- Connect khi chưa có JWT token

### 8.2. Event Subscriptions

✅ **DO:**

- Sử dụng named functions cho handlers (dễ unsubscribe)
- Always cleanup (`connection.off`) trong useEffect return
- Type-safe payloads với TypeScript interfaces
- Optional debug logging qua config

❌ **DON'T:**

- Subscribe nhiều lần cùng event
- Quên unsubscribe (memory leak)
- Inline anonymous functions (khó cleanup)

### 8.3. State Updates

✅ **DO:**

- Immutable updates với spread operator
- Batch updates khi possible
- Validate data trước khi update state
- Use React Query cho server state

❌ **DON'T:**

- Mutate state directly
- Update state quá thường xuyên (performance)
- Mix local state với server state

### 8.4. Error Handling

✅ **DO:**

- Try-catch trong async handlers
- Show user-friendly toast messages
- Log errors cho debugging
- Graceful degradation khi offline

❌ **DON'T:**

- Silent failures
- Generic error messages
- Crash app khi connection fails

---

## 9. Source Code Reference

### 9.1. Core Files

| File                            | Responsibility       | Lines |
| ------------------------------- | -------------------- | ----- |
| `src/hooks/useSignalR.ts`       | Connection lifecycle | 300   |
| `src/hooks/useSignalREvents.ts` | Event subscriptions  | 228   |
| `src/contexts/ChatContext.tsx`  | State management     | 402   |
| `src/hooks/useChatHandlers.ts`  | UI event handlers    | 300   |
| `src/config/env.ts`             | Configuration        | 100   |
| `vite.config.ts`                | Vite proxy setup     | 50    |

### 9.2. Key Interfaces

#### UseSignalRReturn

```typescript
export interface UseSignalRReturn {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  reconnectAttempt: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}
```

#### SignalREventHandlers

```typescript
export interface SignalREventHandlers {
  onMessageSent?: (event: MessageSentEvent) => void;
  onMemberAdded?: (event: MemberAddedEvent) => void;
  onMemberRemoved?: (event: MemberRemovedEvent) => void;
  onMessagePinned?: (event: MessagePinnedEvent) => void;
  onMessageUnpinned?: (event: MessageUnpinnedEvent) => void;
  onUserTyping?: (event: UserTypingEvent) => void;
  onUserPresenceChanged?: (event: UserPresenceChangedEvent) => void;
  onUserMentioned?: (event: UserMentionedEvent) => void;
  onMentionRead?: (event: MentionReadEvent) => void;
  onMentionsBulkRead?: (event: MentionsBulkReadEvent) => void;
}
```

### 9.3. Configuration

#### Hub URL

```typescript
// Development (via Vite proxy)
chatHubUrl: "https://localhost:7136/hubs/chat";

// Production
chatHubUrl: "https://vega-chat-api-dev.allianceitsc.com/hubs/chat";
```

#### Reconnection Config

```typescript
maxReconnectAttempts: 10;
reconnectDelay: 180000; // 3 minutes
```

#### Debug Logging

```typescript
debug: {
  apiCalls: true,  // Log API requests/responses
  signalr: true,   // Log SignalR events
}
```

---

## 📊 Summary

### Architecture Highlights

| Aspect               | Implementation               | Quality    |
| -------------------- | ---------------------------- | ---------- |
| **Connection**       | Singleton với useRef + guard | ⭐⭐⭐⭐⭐ |
| **Reconnection**     | Fixed 3-min delay, max 10    | ⭐⭐⭐⭐   |
| **Event Handling**   | Callback-based, type-safe    | ⭐⭐⭐⭐⭐ |
| **State Management** | Context + custom hooks       | ⭐⭐⭐⭐⭐ |
| **Error Handling**   | Toast + logging              | ⭐⭐⭐⭐   |
| **Configuration**    | Vite env + validation        | ⭐⭐⭐⭐⭐ |

### Strengths

✅ Type-safe với TypeScript  
✅ Clean separation of concerns  
✅ Reusable custom hooks  
✅ Auto-reconnection logic  
✅ Debug-friendly logging  
✅ Comprehensive event handling

### Potential Improvements

⚠️ Exponential backoff thay vì fixed delay  
⚠️ Retry queue cho failed messages  
⚠️ Optimistic UI updates  
⚠️ Offline queue support

---

**Tài liệu này được tạo từ phân tích source code thực tế - 30/12/2025**

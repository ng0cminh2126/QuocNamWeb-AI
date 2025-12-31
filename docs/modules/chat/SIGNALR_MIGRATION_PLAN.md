# SignalR Migration Plan - From Working Source to Current Project

> **Source:** Vega.Chat.Client (Working Implementation)  
> **Target:** M1 Portal Chat Module  
> **Status:** ✅ READY TO IMPLEMENT  
> **Created:** 2025-12-30

---

## 📋 Overview

Document này định nghĩa chi tiết cách migrate SignalR implementation từ source đã hoạt động (Vega.Chat.Client) sang project hiện tại (M1 Portal).

**Tham khảo:**

- [REALTIME_ARCHITECTURE.md](../../REALTIME_ARCHITECTURE.md) - Kiến trúc source gốc
- [SIGNALR_GUIDE.md](../../SIGNALR_GUIDE.md) - Backend documentation

---

## 🔍 Gap Analysis - So sánh Source vs Current

### ✅ Có sẵn trong Current Project

| Component            | Status                | Location                  |
| -------------------- | --------------------- | ------------------------- |
| `@microsoft/signalr` | ✅ v10.0.0 installed  | package.json              |
| Authentication (JWT) | ✅ Working            | `src/stores/authStore.ts` |
| Toast system         | ✅ sonner installed   | package.json              |
| TanStack Query       | ✅ v5.90.12 installed | package.json              |
| Vite config          | ✅ Existing           | `vite.config.js`          |

### ⚠️ Cần tạo mới (từ source)

| Component               | Source File                      | Target File                         | Estimate |
| ----------------------- | -------------------------------- | ----------------------------------- | -------- |
| SignalR Connection Hook | `useSignalR.ts`                  | `src/hooks/useSignalRConnection.ts` | 1h       |
| SignalR Events Hook     | `useSignalREvents.ts`            | `src/hooks/useSignalREvents.ts`     | 1h       |
| Event Type Definitions  | Mixed                            | `src/lib/signalr/events.ts`         | 0.5h     |
| SignalR Config          | `env.ts`                         | `src/config/signalr.config.ts`      | 0.5h     |
| SignalR Provider        | `ChatContext.tsx` (phần SignalR) | `src/providers/SignalRProvider.tsx` | 1h       |
| Event Handlers          | `ChatContext.tsx` (handlers)     | `src/hooks/signalr/use*Events.ts`   | 2h       |

**Total Estimate:** ~6 hours

---

## 📁 Implementation Tasks

### Phase 1: Foundation Setup (⏱️ ~1.5 hours)

#### Task 1.1: Add ENV Configuration

**File:** `.env.development`

```env
# SignalR Hub URL (từ backend cung cấp)
VITE_CHAT_HUB_URL=https://vega-chat-api-dev.allianceitsc.com/hubs/chat

# Debug flags
VITE_DEBUG_SIGNALR=true
```

**File:** `.env.production`

```env
VITE_CHAT_HUB_URL=https://api.vega.com/hubs/chat
VITE_DEBUG_SIGNALR=false
```

---

#### Task 1.2: Create SignalR Config

**File:** `src/config/signalr.config.ts`

```typescript
interface SignalRConfig {
  hubUrl: string;
  reconnection: {
    maxAttempts: number;
    delayMs: number; // Fixed delay: 3 minutes
  };
  debug: boolean;
}

const parseBool = (value: string | undefined): boolean => {
  return value === "true" || value === "1";
};

export const signalRConfig: SignalRConfig = {
  // Hub URL
  hubUrl:
    import.meta.env.VITE_CHAT_HUB_URL ||
    "https://vega-chat-api-dev.allianceitsc.com/hubs/chat",

  // Reconnection strategy (từ source gốc)
  reconnection: {
    maxAttempts: 10,
    delayMs: 180000, // 3 minutes = 180,000ms
  },

  // Debug mode
  debug: parseBool(import.meta.env.VITE_DEBUG_SIGNALR),
};

// Validation
const validateConfig = (): void => {
  if (!signalRConfig.hubUrl) {
    throw new Error("Missing VITE_CHAT_HUB_URL environment variable");
  }
};

validateConfig();
```

---

#### Task 1.3: Create Event Type Definitions

**File:** `src/lib/signalr/events.ts`

```typescript
/**
 * SignalR Event Names & Payloads
 * Based on: REALTIME_ARCHITECTURE.md Section 3.1
 */

// ============================================
// EVENT NAMES (Backend SignalREvents)
// ============================================

export const SIGNALR_EVENTS = {
  // Message Events
  MESSAGE_SENT: "MessageSent",
  MESSAGE_EDITED: "MessageEdited",
  MESSAGE_DELETED: "MessageDeleted",
  MESSAGE_PINNED: "MessagePinned",
  MESSAGE_UNPINNED: "MessageUnpinned",

  // Member Events
  MEMBER_ADDED: "MemberAdded",
  MEMBER_REMOVED: "MemberRemoved",

  // Typing
  USER_TYPING: "UserTyping",

  // Presence
  USER_PRESENCE_CHANGED: "UserPresenceChanged",

  // Mentions
  USER_MENTIONED: "UserMentioned",
  MENTION_READ: "MentionRead",
  MENTIONS_BULK_READ: "MentionsBulkRead",
} as const;

// ============================================
// EVENT PAYLOADS (TypeScript Interfaces)
// ============================================

// Message Event Payloads
export interface MessageSentEvent {
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    contentType: "TXT" | "IMG" | "FILE" | "TASK";
    sentAt: string;
    editedAt: string | null;
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
    reactions?: Array<{
      emoji: string;
      userId: string;
      userName: string;
    }>;
    replyCount: number;
    isStarred: boolean;
    isPinned: boolean;
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

// Member Events
export interface MemberAddedEvent {
  conversationId: string;
  userId: string;
  userName: string;
  addedBy: string;
  timestamp: string;
}

export interface MemberRemovedEvent {
  conversationId: string;
  userId: string;
  userName: string;
  removedBy: string;
  timestamp: string;
}

// Typing Event
export interface UserTypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

// Presence Event
export interface UserPresenceChangedEvent {
  userId: string;
  status: "Online" | "Offline" | "Away";
  timestamp: string;
}

// Mention Events
export interface UserMentionedEvent {
  mentionId: string;
  messageId: string;
  conversationId: string;
  mentionedByUserId: string;
  mentionedByUserName: string;
  messageContentPreview: string;
  mentionedAt: string;
}

export interface MentionReadEvent {
  mentionId: string;
  readBy: string;
  readAt: string;
}

export interface MentionsBulkReadEvent {
  mentionIds: string[];
  readBy: string;
  readAt: string;
}

// ============================================
// EVENT HANDLERS INTERFACE
// ============================================

export interface SignalREventHandlers {
  onMessageSent?: (event: MessageSentEvent) => void;
  onMessageEdited?: (event: MessageSentEvent) => void;
  onMessageDeleted?: (event: {
    messageId: string;
    conversationId: string;
  }) => void;
  onMessagePinned?: (event: MessagePinnedEvent) => void;
  onMessageUnpinned?: (event: MessageUnpinnedEvent) => void;
  onMemberAdded?: (event: MemberAddedEvent) => void;
  onMemberRemoved?: (event: MemberRemovedEvent) => void;
  onUserTyping?: (event: UserTypingEvent) => void;
  onUserPresenceChanged?: (event: UserPresenceChangedEvent) => void;
  onUserMentioned?: (event: UserMentionedEvent) => void;
  onMentionRead?: (event: MentionReadEvent) => void;
  onMentionsBulkRead?: (event: MentionsBulkReadEvent) => void;
}
```

---

### Phase 2: Core Connection Hook (⏱️ ~1 hour)

#### Task 2.1: Create useSignalRConnection Hook

**File:** `src/hooks/useSignalRConnection.ts`

```typescript
import { useState, useEffect, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "@/stores/authStore";
import { signalRConfig } from "@/config/signalr.config";
import { toast } from "sonner";

interface SignalRState {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  reconnectAttempt: number;
}

interface UseSignalRConnectionReturn extends SignalRState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useSignalRConnection(): UseSignalRConnectionReturn {
  const [state, setState] = useState<SignalRState>({
    connection: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempt: 0,
  });

  // Refs để guard race conditions
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const connectingRef = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Access token from auth store
  const accessToken = useAuthStore((state) => state.accessToken);

  // Connect function
  const connect = useCallback(async () => {
    // Guard: prevent concurrent connections
    if (connectingRef.current || state.isConnected) {
      if (signalRConfig.debug) {
        console.log("[SignalR] Already connecting or connected, skip");
      }
      return;
    }

    // Guard: require access token
    if (!accessToken) {
      if (signalRConfig.debug) {
        console.warn("[SignalR] No access token, skip connection");
      }
      return;
    }

    connectingRef.current = true;
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Create connection if not exists
      if (!connectionRef.current) {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(signalRConfig.hubUrl, {
            // JWT authentication
            accessTokenFactory: () => accessToken,

            // Transport config
            skipNegotiation: false,
            transport:
              signalR.HttpTransportType.WebSockets |
              signalR.HttpTransportType.ServerSentEvents |
              signalR.HttpTransportType.LongPolling,
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              // Stop after max attempts
              if (
                retryContext.previousRetryCount >=
                signalRConfig.reconnection.maxAttempts
              ) {
                return null;
              }
              // Fixed delay: 3 minutes
              return signalRConfig.reconnection.delayMs;
            },
          })
          .configureLogging(
            signalRConfig.debug
              ? signalR.LogLevel.Debug
              : signalR.LogLevel.Information
          )
          .build();

        // Lifecycle events
        connection.onreconnecting((error) => {
          setState((prev) => ({
            ...prev,
            isConnected: false,
            error: error || null,
            reconnectAttempt: prev.reconnectAttempt + 1,
          }));

          if (signalRConfig.debug) {
            console.warn("[SignalR] Reconnecting...", error);
          }
        });

        connection.onreconnected((connectionId) => {
          setState((prev) => ({
            ...prev,
            isConnected: true,
            error: null,
            reconnectAttempt: 0, // Reset counter
          }));

          if (signalRConfig.debug) {
            console.log("[SignalR] Reconnected:", connectionId);
          }

          toast.success("Chat reconnected");
        });

        connection.onclose((error) => {
          setState((prev) => ({
            ...prev,
            isConnected: false,
            error: error || null,
          }));

          // Only show toast if error (not manual disconnect)
          if (error) {
            if (signalRConfig.debug) {
              console.error("[SignalR] Connection closed:", error);
            }
            toast.error("Chat connection lost");
          }
        });

        connectionRef.current = connection;
      }

      // Start connection
      await connectionRef.current.start();

      setState((prev) => ({
        ...prev,
        connection: connectionRef.current,
        isConnected: true,
        isConnecting: false,
        reconnectAttempt: 0,
      }));

      if (signalRConfig.debug) {
        console.log("[SignalR] Connected successfully");
      }

      toast.success("Chat connected");
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err,
      }));

      if (signalRConfig.debug) {
        console.error("[SignalR] Connection failed:", err);
      }

      // Manual retry logic (for initial connect fail)
      if (state.reconnectAttempt < signalRConfig.reconnection.maxAttempts) {
        setState((prev) => ({
          ...prev,
          reconnectAttempt: prev.reconnectAttempt + 1,
        }));

        reconnectTimeoutRef.current = setTimeout(() => {
          connect(); // Recursive retry
        }, signalRConfig.reconnection.delayMs);
      } else {
        // Give up
        connectionRef.current = null;
        toast.error("Unable to connect to chat after multiple attempts");
      }
    } finally {
      connectingRef.current = false;
    }
  }, [accessToken, state.isConnected, state.reconnectAttempt]);

  // Disconnect function
  const disconnect = useCallback(async () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
        if (signalRConfig.debug) {
          console.log("[SignalR] Disconnected");
        }
      } catch (error) {
        console.error("[SignalR] Disconnect error:", error);
      } finally {
        connectionRef.current = null;
        setState({
          connection: null,
          isConnected: false,
          isConnecting: false,
          error: null,
          reconnectAttempt: 0,
        });
      }
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    const shouldConnect =
      accessToken && !connectionRef.current && !connectingRef.current;

    if (shouldConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        disconnect();
      }
    };
  }, [accessToken]); // Re-connect when token changes

  return {
    ...state,
    connect,
    disconnect,
  };
}
```

**Tests:** `src/hooks/__tests__/useSignalRConnection.test.ts`

- [ ] Auto-connect khi có token
- [ ] Không connect khi không có token
- [ ] Reconnect sau network loss
- [ ] Stop reconnect sau 10 attempts
- [ ] Cleanup on unmount

---

### Phase 3: Event Subscription Hook (⏱️ ~1 hour)

#### Task 3.1: Create useSignalREvents Hook

**File:** `src/hooks/useSignalREvents.ts`

```typescript
import { useEffect } from "react";
import type { HubConnection } from "@microsoft/signalr";
import {
  SIGNALR_EVENTS,
  type SignalREventHandlers,
  type MessageSentEvent,
  type MessagePinnedEvent,
  type MessageUnpinnedEvent,
  type MemberAddedEvent,
  type MemberRemovedEvent,
  type UserTypingEvent,
  type UserPresenceChangedEvent,
  type UserMentionedEvent,
  type MentionReadEvent,
  type MentionsBulkReadEvent,
} from "@/lib/signalr/events";
import { signalRConfig } from "@/config/signalr.config";

interface UseSignalREventsOptions {
  connection: HubConnection | null;
  handlers: SignalREventHandlers;
}

export function useSignalREvents({
  connection,
  handlers,
}: UseSignalREventsOptions): void {
  // MessageSent event
  useEffect(() => {
    if (!connection) return;

    const handler = (event: MessageSentEvent) => {
      if (signalRConfig.debug) {
        console.log("[SignalR Event] MessageSent:", event);
      }
      handlers.onMessageSent?.(event);
    };

    connection.on(SIGNALR_EVENTS.MESSAGE_SENT, handler);
    return () => {
      connection.off(SIGNALR_EVENTS.MESSAGE_SENT, handler);
    };
  }, [connection, handlers.onMessageSent]);

  // MessagePinned event
  useEffect(() => {
    if (!connection) return;

    const handler = (event: MessagePinnedEvent) => {
      if (signalRConfig.debug) {
        console.log("[SignalR Event] MessagePinned:", event);
      }
      handlers.onMessagePinned?.(event);
    };

    connection.on(SIGNALR_EVENTS.MESSAGE_PINNED, handler);
    return () => {
      connection.off(SIGNALR_EVENTS.MESSAGE_PINNED, handler);
    };
  }, [connection, handlers.onMessagePinned]);

  // MessageUnpinned event
  useEffect(() => {
    if (!connection) return;

    const handler = (event: MessageUnpinnedEvent) => {
      if (signalRConfig.debug) {
        console.log("[SignalR Event] MessageUnpinned:", event);
      }
      handlers.onMessageUnpinned?.(event);
    };

    connection.on(SIGNALR_EVENTS.MESSAGE_UNPINNED, handler);
    return () => {
      connection.off(SIGNALR_EVENTS.MESSAGE_UNPINNED, handler);
    };
  }, [connection, handlers.onMessageUnpinned]);

  // UserTyping event
  useEffect(() => {
    if (!connection) return;

    const handler = (event: UserTypingEvent) => {
      if (signalRConfig.debug) {
        console.log("[SignalR Event] UserTyping:", event);
      }
      handlers.onUserTyping?.(event);
    };

    connection.on(SIGNALR_EVENTS.USER_TYPING, handler);
    return () => {
      connection.off(SIGNALR_EVENTS.USER_TYPING, handler);
    };
  }, [connection, handlers.onUserTyping]);

  // UserPresenceChanged event
  useEffect(() => {
    if (!connection) return;

    const handler = (event: UserPresenceChangedEvent) => {
      if (signalRConfig.debug) {
        console.log("[SignalR Event] UserPresenceChanged:", event);
      }
      handlers.onUserPresenceChanged?.(event);
    };

    connection.on(SIGNALR_EVENTS.USER_PRESENCE_CHANGED, handler);
    return () => {
      connection.off(SIGNALR_EVENTS.USER_PRESENCE_CHANGED, handler);
    };
  }, [connection, handlers.onUserPresenceChanged]);

  // UserMentioned event
  useEffect(() => {
    if (!connection) return;

    const handler = (event: UserMentionedEvent) => {
      if (signalRConfig.debug) {
        console.log("[SignalR Event] UserMentioned:", event);
      }
      handlers.onUserMentioned?.(event);
    };

    connection.on(SIGNALR_EVENTS.USER_MENTIONED, handler);
    return () => {
      connection.off(SIGNALR_EVENTS.USER_MENTIONED, handler);
    };
  }, [connection, handlers.onUserMentioned]);

  // MemberAdded event
  useEffect(() => {
    if (!connection) return;

    const handler = (event: MemberAddedEvent) => {
      if (signalRConfig.debug) {
        console.log("[SignalR Event] MemberAdded:", event);
      }
      handlers.onMemberAdded?.(event);
    };

    connection.on(SIGNALR_EVENTS.MEMBER_ADDED, handler);
    return () => {
      connection.off(SIGNALR_EVENTS.MEMBER_ADDED, handler);
    };
  }, [connection, handlers.onMemberAdded]);

  // MemberRemoved event
  useEffect(() => {
    if (!connection) return;

    const handler = (event: MemberRemovedEvent) => {
      if (signalRConfig.debug) {
        console.log("[SignalR Event] MemberRemoved:", event);
      }
      handlers.onMemberRemoved?.(event);
    };

    connection.on(SIGNALR_EVENTS.MEMBER_REMOVED, handler);
    return () => {
      connection.off(SIGNALR_EVENTS.MEMBER_REMOVED, handler);
    };
  }, [connection, handlers.onMemberRemoved]);

  // MentionRead event
  useEffect(() => {
    if (!connection) return;

    const handler = (event: MentionReadEvent) => {
      if (signalRConfig.debug) {
        console.log("[SignalR Event] MentionRead:", event);
      }
      handlers.onMentionRead?.(event);
    };

    connection.on(SIGNALR_EVENTS.MENTION_READ, handler);
    return () => {
      connection.off(SIGNALR_EVENTS.MENTION_READ, handler);
    };
  }, [connection, handlers.onMentionRead]);

  // MentionsBulkRead event
  useEffect(() => {
    if (!connection) return;

    const handler = (event: MentionsBulkReadEvent) => {
      if (signalRConfig.debug) {
        console.log("[SignalR Event] MentionsBulkRead:", event);
      }
      handlers.onMentionsBulkRead?.(event);
    };

    connection.on(SIGNALR_EVENTS.MENTIONS_BULK_READ, handler);
    return () => {
      connection.off(SIGNALR_EVENTS.MENTIONS_BULK_READ, handler);
    };
  }, [connection, handlers.onMentionsBulkRead]);
}
```

---

### Phase 4: Event-specific Handlers (⏱️ ~2 hours)

#### Task 4.1: Create useMessageEvents Hook

**File:** `src/hooks/signalr/useMessageEvents.ts`

```typescript
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { HubConnection } from "@microsoft/signalr";
import type { MessageSentEvent } from "@/lib/signalr/events";
import { messageKeys } from "@/hooks/queries/keys/messageKeys";
import { conversationKeys } from "@/hooks/queries/keys/conversationKeys";
import { toast } from "sonner";

interface UseMessageEventsOptions {
  connection: HubConnection | null;
  currentConversationId?: string;
  currentUserId?: string;
}

export function useMessageEvents({
  connection,
  currentConversationId,
  currentUserId,
}: UseMessageEventsOptions) {
  const queryClient = useQueryClient();

  const handleMessageSent = (event: MessageSentEvent) => {
    const message = event.message;

    // 1. Update conversation list cache (lastMessage + unreadCount)
    queryClient.invalidateQueries({
      queryKey: conversationKeys.all,
    });

    // 2. Add message to current conversation if viewing it
    if (currentConversationId === message.conversationId) {
      queryClient.setQueryData(
        messageKeys.conversation(message.conversationId),
        (old: any) => {
          if (!old) return old;
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
    }

    // 3. Show notification if message from other user & not viewing
    const isFromOtherUser = currentUserId && message.senderId !== currentUserId;
    const notViewing = currentConversationId !== message.conversationId;

    if (isFromOtherUser && notViewing) {
      toast.info(message.senderName || "New message", {
        description: message.content,
        duration: 5000,
      });
    }
  };

  // Subscribe to MessageSent via useSignalREvents
  // (This will be used in SignalRProvider)
  return { handleMessageSent };
}
```

---

#### Task 4.2: Create usePresenceEvents Hook

**File:** `src/hooks/signalr/usePresenceEvents.ts`

```typescript
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { HubConnection } from "@microsoft/signalr";
import type { UserPresenceChangedEvent } from "@/lib/signalr/events";
import { conversationKeys } from "@/hooks/queries/keys/conversationKeys";

interface UsePresenceEventsOptions {
  connection: HubConnection | null;
}

export function usePresenceEvents({ connection }: UsePresenceEventsOptions) {
  const queryClient = useQueryClient();

  const handlePresenceChanged = (event: UserPresenceChangedEvent) => {
    // Update DM conversations cache (online status)
    queryClient.setQueryData(conversationKeys.directs(), (old: any) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          items: page.items.map((conv: any) => {
            // Update if this DM involves the user
            // TODO: Check if conversation involves this userId
            // For now, invalidate all to refetch
            return conv;
          }),
        })),
      };
    });

    // Simpler approach: just invalidate
    queryClient.invalidateQueries({
      queryKey: conversationKeys.directs(),
    });
  };

  return { handlePresenceChanged };
}
```

---

#### Task 4.3: Create useTypingEvents Hook

**File:** `src/hooks/signalr/useTypingEvents.ts`

```typescript
import { useState, useEffect } from "react";
import type { HubConnection } from "@microsoft/signalr";
import type { UserTypingEvent } from "@/lib/signalr/events";

interface TypingUser {
  userId: string;
  userName: string;
}

interface UseTypingEventsOptions {
  connection: HubConnection | null;
  conversationId: string;
}

export function useTypingEvents({
  connection,
  conversationId,
}: UseTypingEventsOptions) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const handleUserTyping = (event: UserTypingEvent) => {
    // Only handle typing for current conversation
    if (event.conversationId !== conversationId) return;

    setTypingUsers((prev) => {
      if (event.isTyping) {
        // Add user if not already typing
        if (!prev.find((u) => u.userId === event.userId)) {
          return [
            ...prev,
            {
              userId: event.userId,
              userName: event.userName,
            },
          ];
        }
      } else {
        // Remove user from typing list
        return prev.filter((u) => u.userId !== event.userId);
      }
      return prev;
    });
  };

  return { typingUsers, handleUserTyping };
}
```

---

### Phase 5: Provider & Integration (⏱️ ~1 hour)

#### Task 5.1: Create SignalRProvider

**File:** `src/providers/SignalRProvider.tsx`

```typescript
import React, { createContext, useContext, useMemo } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { useSignalRConnection } from "@/hooks/useSignalRConnection";
import { useSignalREvents } from "@/hooks/useSignalREvents";
import { useMessageEvents } from "@/hooks/signalr/useMessageEvents";
import { usePresenceEvents } from "@/hooks/signalr/usePresenceEvents";

interface SignalRContextValue {
  connection: HubConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempt: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextValue | undefined>(
  undefined
);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const signalR = useSignalRConnection();

  // Event handlers
  const messageEvents = useMessageEvents({
    connection: signalR.connection,
    // These will be passed from components via context or other hooks
  });

  const presenceEvents = usePresenceEvents({
    connection: signalR.connection,
  });

  // Subscribe to all events
  useSignalREvents({
    connection: signalR.connection,
    handlers: {
      onMessageSent: messageEvents.handleMessageSent,
      onUserPresenceChanged: presenceEvents.handlePresenceChanged,
      // Add other handlers as needed
    },
  });

  const value = useMemo<SignalRContextValue>(
    () => ({
      connection: signalR.connection,
      isConnected: signalR.isConnected,
      isConnecting: signalR.isConnecting,
      reconnectAttempt: signalR.reconnectAttempt,
      connect: signalR.connect,
      disconnect: signalR.disconnect,
    }),
    [
      signalR.connection,
      signalR.isConnected,
      signalR.isConnecting,
      signalR.reconnectAttempt,
      signalR.connect,
      signalR.disconnect,
    ]
  );

  return (
    <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>
  );
}

export function useSignalR(): SignalRContextValue {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within SignalRProvider");
  }
  return context;
}
```

---

#### Task 5.2: Add Provider to App

**File:** `src/main.tsx`

```typescript
import { SignalRProvider } from "@/providers/SignalRProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SignalRProvider>
        {" "}
        {/* ✅ Add SignalR provider */}
        <RouterProvider router={router} />
      </SignalRProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

#### Task 5.3: Use in Components

**Example: ConversationDetail.tsx**

```typescript
import { useSignalR } from "@/providers/SignalRProvider";
import { useTypingEvents } from "@/hooks/signalr/useTypingEvents";

export function ConversationDetail({ conversationId }: Props) {
  const { isConnected } = useSignalR();
  const { typingUsers } = useTypingEvents({
    connection: signalR.connection,
    conversationId,
  });

  return (
    <div>
      {/* Connection indicator */}
      {!isConnected && (
        <div className="bg-yellow-100 p-2 text-center text-sm">
          ⚠️ Reconnecting to chat...
        </div>
      )}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500 italic">
          {typingUsers.map((u) => u.userName).join(", ")} đang nhập...
        </div>
      )}

      {/* ... rest of component */}
    </div>
  );
}
```

---

### Phase 6: Vite Proxy Configuration (⏱️ ~0.5 hour)

#### Task 6.1: Update vite.config.js

**File:** `vite.config.js`

```javascript
export default defineConfig({
  server: {
    proxy: {
      "/auth": {
        target: "https://vega-identity-api-dev.allianceitsc.com",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "https://vega-chat-api-dev.allianceitsc.com",
        changeOrigin: true,
        secure: false,
      },
      "/hubs": {
        target: "https://vega-chat-api-dev.allianceitsc.com",
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

- ✅ Tránh CORS issues trong development
- ✅ WebSocket hoạt động qua proxy
- ✅ Consistent origin

---

## 📊 Test Plan

### Unit Tests

| File                      | Test Cases                                   | Coverage |
| ------------------------- | -------------------------------------------- | -------- |
| `useSignalRConnection.ts` | Connection lifecycle, auto-reconnect, guards | 80%      |
| `useSignalREvents.ts`     | Event subscription/unsubscription            | 75%      |
| `useMessageEvents.ts`     | MessageSent handling, cache updates          | 75%      |
| `useTypingEvents.ts`      | Add/remove typing users                      | 70%      |

### Integration Tests

- [ ] Connect với valid token → success
- [ ] Connect với invalid/expired token → fail gracefully
- [ ] Auto-reconnect sau network loss
- [ ] MessageSent event updates cache correctly
- [ ] Typing indicator shows/hides correctly

### Manual Testing Checklist

- [ ] Open 2 tabs của same user
  - [ ] Cả 2 tabs đều connected
  - [ ] Gửi message từ tab 1 → tab 2 nhận real-time
- [ ] Disconnect network
  - [ ] Show "Reconnecting..." toast
  - [ ] Auto-reconnect sau 3 phút
- [ ] Logout
  - [ ] SignalR connection stopped
  - [ ] No error toasts
- [ ] Login lại
  - [ ] SignalR auto-connect
  - [ ] Show "Connected" toast

---

## 📋 Migration Checklist

### Phase 1: Foundation Setup ✅

- [ ] Add `.env` variables
- [ ] Create `signalr.config.ts`
- [ ] Create event type definitions

### Phase 2: Core Connection Hook ✅

- [ ] Create `useSignalRConnection.ts`
- [ ] Add unit tests
- [ ] Manual test connection lifecycle

### Phase 3: Event Subscription Hook ✅

- [ ] Create `useSignalREvents.ts`
- [ ] Add unit tests

### Phase 4: Event-specific Handlers ✅

- [ ] Create `useMessageEvents.ts`
- [ ] Create `usePresenceEvents.ts`
- [ ] Create `useTypingEvents.ts`

### Phase 5: Provider & Integration ✅

- [ ] Create `SignalRProvider.tsx`
- [ ] Add provider to `main.tsx`
- [ ] Update components to use `useSignalR()`

### Phase 6: Vite Proxy ✅

- [ ] Update `vite.config.js`
- [ ] Test proxy hoạt động

### Phase 7: Testing ✅

- [ ] Write unit tests
- [ ] Manual testing
- [ ] E2E tests (Playwright)

---

## ⚠️ Known Differences from Source

| Aspect             | Source (Vega.Chat.Client) | Current Project | Impact                              |
| ------------------ | ------------------------- | --------------- | ----------------------------------- |
| State Management   | Context API               | TanStack Query  | ✅ Better - server state separation |
| Reconnect Strategy | Fixed 3-min delay         | Same            | ✅ No change needed                 |
| Event Handling     | ChatContext handlers      | Separate hooks  | ✅ Better - separation of concerns  |
| Toast Library      | Custom                    | sonner          | ✅ No issue                         |
| Auth Store         | Custom                    | Zustand         | ✅ Compatible                       |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                       | Status           |
| ------------------------------ | ---------------- |
| Đã review migration plan       | ⬜ Chưa review   |
| Backend Hub URL confirmed      | ⬜ Pending       |
| Event names confirmed          | ⬜ Pending       |
| Timeline acceptable (6 hours)  | ⬜ Chưa xác nhận |
| **APPROVED để bắt đầu coding** | ⬜ CHƯA APPROVED |

**HUMAN Signature:** ******\_\_\_******  
**Date:** ******\_\_\_******

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC bắt đầu Phase 1 nếu plan chưa được APPROVED**

---

## 📅 Timeline Summary

| Phase   | Tasks                   | Duration     | Dependencies |
| ------- | ----------------------- | ------------ | ------------ |
| Phase 1 | Foundation Setup        | 1.5 hours    | Hub URL      |
| Phase 2 | Core Connection Hook    | 1 hour       | Phase 1      |
| Phase 3 | Event Subscription Hook | 1 hour       | Phase 2      |
| Phase 4 | Event-specific Handlers | 2 hours      | Phase 3      |
| Phase 5 | Provider & Integration  | 1 hour       | Phase 4      |
| Phase 6 | Vite Proxy              | 0.5 hour     | -            |
| -       | **TOTAL**               | **~6 hours** |              |

---

## 📖 Reference Documents

- [REALTIME_ARCHITECTURE.md](../../REALTIME_ARCHITECTURE.md) - Source architecture
- [SIGNALR_GUIDE.md](../../SIGNALR_GUIDE.md) - Backend guide
- [SIGNALR_IMPLEMENTATION_PLAN.md](SIGNALR_IMPLEMENTATION_PLAN.md) - Original plan (now superseded)

// useMessageRealtime hook - Handle realtime message updates via SignalR

import { useEffect, useCallback, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatHub, SIGNALR_EVENTS, type UserTypingEvent } from '@/lib/signalr';
import { useSignalRConnection } from '@/providers/SignalRProvider';
import { messageKeys } from './queries/keys/messageKeys';
import { conversationKeys } from './queries/keys/conversationKeys';
import type { ChatMessage, GetMessagesResponse } from '@/types/messages';

interface UseMessageRealtimeOptions {
  conversationId: string;
  onNewMessage?: (message: ChatMessage) => void;
  onUserTyping?: (event: UserTypingEvent) => void;
}

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

// Backend sends message wrapped in { message: ChatMessage }
interface MessageSentEvent {
  message: ChatMessage;
}

/**
 * Hook to handle realtime message updates for a specific conversation
 * - Receives new messages via SignalR and updates the cache
 * - Handles typing indicators
 * - Updates conversation list when new message arrives
 */
export function useMessageRealtime({
  conversationId,
  onNewMessage,
  onUserTyping,
}: UseMessageRealtimeOptions) {
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { isConnected } = useSignalRConnection();
  const hasJoinedGroupRef = useRef(false);

  // Normalize contentType from SignalR (number) to match API format (string)
  // Backend SignalR sends: 1 = TXT, 2 = IMG, 3 = FILE
  // Backend API returns: "TXT", "IMG", "FILE"
  const normalizeContentType = (contentType: string | number): string => {
    if (typeof contentType === 'string') return contentType;
    
    const contentTypeMap: Record<number, string> = {
      1: 'TXT',
      2: 'IMG',
      3: 'FILE',
    };
    return contentTypeMap[contentType] || 'TXT';
  };

  // Handle MessageSent event from backend (data is wrapped: { message: ChatMessage })
  const handleMessageSent = useCallback(
    (data: MessageSentEvent | ChatMessage) => {
      // Extract message from wrapper if present
      const rawMessage = 'message' in data ? data.message : data;
      
      // Normalize the message to match API format
      const message: ChatMessage = {
        ...rawMessage,
        contentType: normalizeContentType(rawMessage.contentType as string | number),
      };
      
      console.log('useMessageRealtime: Received message', message.id, 'for conversation', message.conversationId, 'contentType:', message.contentType);
      
      // Only handle messages for this conversation
      if (message.conversationId !== conversationId) {
        console.log('useMessageRealtime: Ignoring message for different conversation');
        return;
      }

      // Add message to cache
      queryClient.setQueryData<{
        pages: GetMessagesResponse[];
        pageParams: (string | undefined)[];
      }>(messageKeys.conversation(conversationId), (old) => {
        if (!old || !old.pages.length) return old;

        // Check if message already exists (prevent duplicates)
        const exists = old.pages.some((page) =>
          page.items.some((item) => item.id === message.id)
        );
        if (exists) return old;

        // Add to first page (newest messages)
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          items: [message, ...newPages[0].items],
        };

        return {
          ...old,
          pages: newPages,
        };
      });

      // Also invalidate conversation list to update lastMessage
      queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });

      onNewMessage?.(message);
    },
    [conversationId, queryClient, onNewMessage]
  );

  // Handle typing indicator event
  const handleUserTyping = useCallback(
    (event: UserTypingEvent) => {
      // Only handle typing for this conversation
      if (event.conversationId !== conversationId) return;

      setTypingUsers((prev) => {
        if (event.isTyping) {
          // Add or update typing user
          const existing = prev.find((u) => u.userId === event.userId);
          if (existing) {
            return prev.map((u) =>
              u.userId === event.userId ? { ...u, timestamp: Date.now() } : u
            );
          }
          return [
            ...prev,
            {
              userId: event.userId,
              userName: event.userName,
              timestamp: Date.now(),
            },
          ];
        } else {
          // Remove typing user
          return prev.filter((u) => u.userId !== event.userId);
        }
      });

      onUserTyping?.(event);
    },
    [conversationId, onUserTyping]
  );

  // Setup SignalR listeners when connected
  useEffect(() => {
    // Only subscribe when connected
    if (!isConnected) {
      console.log('useMessageRealtime: Waiting for SignalR connection...');
      return;
    }

    console.log('useMessageRealtime: SignalR connected, setting up listeners for conversation:', conversationId);

    // Subscribe to MESSAGE_SENT event (primary event from backend)
    // Backend sends data as { message: ChatMessage }
    chatHub.on<MessageSentEvent>(SIGNALR_EVENTS.MESSAGE_SENT, handleMessageSent);
    
    // Also subscribe to legacy event names for backward compatibility
    chatHub.on<ChatMessage>(SIGNALR_EVENTS.NEW_MESSAGE, handleMessageSent);
    chatHub.on<ChatMessage>(SIGNALR_EVENTS.RECEIVE_MESSAGE, handleMessageSent);
    chatHub.on<UserTypingEvent>(SIGNALR_EVENTS.USER_TYPING, handleUserTyping);

    // Join the conversation group
    chatHub.joinGroup(conversationId).then(() => {
      hasJoinedGroupRef.current = true;
      console.log('useMessageRealtime: Joined conversation', conversationId);
    });

    // Cleanup
    return () => {
      chatHub.off(SIGNALR_EVENTS.MESSAGE_SENT, handleMessageSent);
      chatHub.off(SIGNALR_EVENTS.NEW_MESSAGE, handleMessageSent);
      chatHub.off(SIGNALR_EVENTS.RECEIVE_MESSAGE, handleMessageSent);
      chatHub.off(SIGNALR_EVENTS.USER_TYPING, handleUserTyping);
      if (hasJoinedGroupRef.current) {
        chatHub.leaveGroup(conversationId);
        hasJoinedGroupRef.current = false;
      }
    };
  }, [conversationId, handleMessageSent, handleUserTyping, isConnected]);

  // Cleanup stale typing indicators (after 3 seconds of no update)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) =>
        prev.filter((u) => now - u.timestamp < 3000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    typingUsers,
  };
}

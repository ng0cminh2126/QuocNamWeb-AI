// useConversationRealtime hook - Handle realtime conversation list updates

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatHub, SIGNALR_EVENTS } from '@/lib/signalr';
import { conversationKeys } from './queries/keys/conversationKeys';
import type { ChatMessage } from '@/types/messages';

interface UseConversationRealtimeOptions {
  onNewMessage?: (message: ChatMessage) => void;
}

/**
 * Hook to handle realtime updates for conversation list
 * - Updates lastMessage when new messages arrive
 * - Handles unread count updates
 * - Reorders conversations based on activity
 */
export function useConversationRealtime(
  options: UseConversationRealtimeOptions = {}
) {
  const { onNewMessage } = options;
  const queryClient = useQueryClient();

  // Handle new message - invalidate conversation list
  const handleNewMessage = useCallback(
    (message: ChatMessage) => {
      // Invalidate both groups and directs to refresh
      queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });

      onNewMessage?.(message);
    },
    [queryClient, onNewMessage]
  );

  // Handle conversation updated event
  const handleConversationUpdated = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: conversationKeys.all,
    });
  }, [queryClient]);

  // Setup SignalR listeners
  useEffect(() => {
    // Subscribe to events
    chatHub.on<ChatMessage>(SIGNALR_EVENTS.NEW_MESSAGE, handleNewMessage);
    chatHub.on<ChatMessage>(SIGNALR_EVENTS.RECEIVE_MESSAGE, handleNewMessage);
    chatHub.on<void>(
      SIGNALR_EVENTS.CONVERSATION_UPDATED,
      handleConversationUpdated
    );

    // Cleanup
    return () => {
      chatHub.off(SIGNALR_EVENTS.NEW_MESSAGE, handleNewMessage);
      chatHub.off(SIGNALR_EVENTS.RECEIVE_MESSAGE, handleNewMessage);
      chatHub.off(
        SIGNALR_EVENTS.CONVERSATION_UPDATED,
        handleConversationUpdated
      );
    };
  }, [handleNewMessage, handleConversationUpdated]);
}

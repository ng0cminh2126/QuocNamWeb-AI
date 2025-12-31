// useSendMessage hook - Send message mutation with optimistic updates

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '@/api/messages.api';
import { messageKeys } from '../queries/keys/messageKeys';
import { conversationKeys } from '../queries/keys/conversationKeys';
import type {
  SendChatMessageRequest,
  ChatMessage,
  GetMessagesResponse,
} from '@/types/messages';
import { useAuthStore } from '@/stores/authStore';

interface UseSendMessageOptions {
  conversationId: string;
  onSuccess?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to send a message to a conversation
 * Includes optimistic updates for immediate UI feedback
 */
export function useSendMessage({
  conversationId,
  onSuccess,
  onError,
}: UseSendMessageOptions) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (data: SendChatMessageRequest) =>
      sendMessage(conversationId, data),

    // Optimistic update - add message immediately
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: messageKeys.conversation(conversationId),
      });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<{
        pages: GetMessagesResponse[];
        pageParams: (string | undefined)[];
      }>(messageKeys.conversation(conversationId));

      // Create optimistic message
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: user?.id ?? 'current-user',
        senderName: user?.identifier ?? 'Bạn',
        parentMessageId: newMessage.parentMessageId ?? null,
        content: newMessage.content,
        contentType: newMessage.contentType,
        sentAt: new Date().toISOString(),
        editedAt: null,
        linkedTaskId: null,
        reactions: [],
        attachments: [],
        replyCount: 0,
        isStarred: false,
        isPinned: false,
        threadPreview: null,
        mentions: [],
      };

      // Optimistically add message to cache
      queryClient.setQueryData<{
        pages: GetMessagesResponse[];
        pageParams: (string | undefined)[];
      }>(messageKeys.conversation(conversationId), (old) => {
        if (!old || !old.pages.length) return old;

        // Add to the first page (newest messages)
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          items: [optimisticMessage, ...newPages[0].items],
        };

        return {
          ...old,
          pages: newPages,
        };
      });

      // Return context for rollback
      return { previousMessages };
    },

    // On error, rollback to previous state
    onError: (err, _newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          messageKeys.conversation(conversationId),
          context.previousMessages
        );
      }
      onError?.(err as Error);
    },

    // On success, invalidate to get fresh data
    onSuccess: (data) => {
      // Replace optimistic message with real one
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(conversationId),
      });

      // Also invalidate conversation list to update lastMessage
      queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });

      onSuccess?.(data);
    },
  });
}

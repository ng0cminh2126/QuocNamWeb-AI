// useSendMessage hook - Send message mutation via SignalR
// NOTE: No optimistic updates - SignalR will handle realtime message delivery

import { useMutation } from "@tanstack/react-query";
import { sendMessage } from "@/api/messages.api";
import type { SendChatMessageRequest, ChatMessage } from "@/types/messages";

interface UseSendMessageOptions {
  onSuccess?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to send a message to a conversation
 *
 * NOTE: This hook does NOT use optimistic updates because SignalR handles
 * realtime message delivery. When you send a message:
 * 1. API call is made via sendMessage()
 * 2. Backend sends message via SignalR
 * 3. useMessageRealtime hook receives and adds message to cache
 *
 * This prevents duplicate messages from optimistic update + SignalR.
 *
 * @example
 * const sendMsg = useSendMessage({
 *   onSuccess: (msg) => console.log('Sent:', msg.id)
 * });
 *
 * sendMsg.mutate({
 *   conversationId: 'conv-123',
 *   content: 'Hello',
 *   attachment: { fileId: 'file-1', fileName: 'doc.pdf', fileSize: 1024, contentType: 'application/pdf' }
 * });
 */
export function useSendMessage({ onSuccess, onError }: UseSendMessageOptions) {
  return useMutation({
    mutationFn: (data: SendChatMessageRequest) => sendMessage(data),

    // No optimistic update - SignalR will deliver message in realtime
    // This prevents duplicate messages

    onError: (err) => {
      onError?.(err as Error);
    },

    onSuccess: (data) => {
      // Message will be added by SignalR listener in useMessageRealtime
      // Just call the success callback if provided
      onSuccess?.(data);
    },
  });
}

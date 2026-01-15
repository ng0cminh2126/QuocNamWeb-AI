import { useMutation, useQueryClient } from "@tanstack/react-query";
import { linkTaskToMessage } from "@/api/messages.api";
import type { LinkTaskToMessageResponse } from "@/types/messages";

interface LinkTaskToMessageVariables {
  messageId: string;
  taskId: string;
}

interface UseLinkTaskToMessageOptions {
  onSuccess?: (data: LinkTaskToMessageResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for linking a task to a message
 * 
 * Usage:
 * ```ts
 * const linkMutation = useLinkTaskToMessage({
 *   onSuccess: (data) => console.log('Linked:', data),
 *   onError: (error) => console.error('Error:', error),
 * });
 * 
 * linkMutation.mutate({ messageId: 'msg-123', taskId: 'task-456' });
 * ```
 */
export function useLinkTaskToMessage(options?: UseLinkTaskToMessageOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, taskId }: LinkTaskToMessageVariables) => {
      console.log('Calling linkTaskToMessage with:', { messageId, taskId });
      return linkTaskToMessage(messageId, taskId);
    },
    onSuccess: (data) => {
      console.log('Successfully linked task to message:', data);
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      
      // Call user's onSuccess callback
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error("Failed to link task to message:", error);
      options?.onError?.(error);
    },
  });
}

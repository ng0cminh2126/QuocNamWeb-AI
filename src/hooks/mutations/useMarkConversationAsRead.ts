import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markConversationAsRead } from "@/api/conversations.api";
import { conversationKeys } from "@/hooks/queries/keys/conversationKeys";
import { toast } from "sonner";
import type { InfiniteData } from "@tanstack/react-query";
import type {
  GroupConversation,
  DirectConversation,
} from "@/types/conversations";

interface MarkAsReadVariables {
  conversationId: string;
}

type ConversationPage = {
  items: (GroupConversation | DirectConversation)[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Mutation hook để mark conversation as read
 *
 * Features:
 * - Optimistic update: Set unreadCount = 0 ngay lập tức
 * - Auto-rollback nếu API fail
 * - Error toast nếu thất bại
 *
 * @example
 * ```tsx
 * const { mutate } = useMarkConversationAsRead();
 *
 * const handleConversationClick = (id: string) => {
 *   mutate({ conversationId: id });
 * };
 * ```
 */
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId }: MarkAsReadVariables) => {
      return markConversationAsRead(conversationId);
    },

    // Optimistic update
    onMutate: async ({ conversationId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: conversationKeys.all });

      // Snapshot previous value
      const previousGroups = queryClient.getQueryData<
        InfiniteData<ConversationPage>
      >(conversationKeys.groups());
      const previousDirects = queryClient.getQueryData<
        InfiniteData<ConversationPage>
      >(conversationKeys.directs());

      // Optimistically update groups
      if (previousGroups) {
        queryClient.setQueryData<InfiniteData<ConversationPage>>(
          conversationKeys.groups(),
          {
            ...previousGroups,
            pages: previousGroups.pages.map((page) => ({
              ...page,
              items: (page.items || []).map((conv) =>
                conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
              ),
            })),
          }
        );
      }

      // Optimistically update directs
      if (previousDirects) {
        queryClient.setQueryData<InfiniteData<ConversationPage>>(
          conversationKeys.directs(),
          {
            ...previousDirects,
            pages: previousDirects.pages.map((page) => ({
              ...page,
              items: (page.items || []).map((conv) =>
                conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
              ),
            })),
          }
        );
      }

      // Return context for rollback
      return { previousGroups, previousDirects };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(
          conversationKeys.groups(),
          context.previousGroups
        );
      }
      if (context?.previousDirects) {
        queryClient.setQueryData(
          conversationKeys.directs(),
          context.previousDirects
        );
      }

      toast.error("Không thể đánh dấu đã đọc", {
        description: "Vui lòng thử lại sau.",
      });
    },

    // Refetch on success (to ensure sync with server)
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });
    },
  });
}

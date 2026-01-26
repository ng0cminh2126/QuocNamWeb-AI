/**
 * Real-time hook for category list updates via SignalR
 * Handles MessageSent and MessageRead events to update lastMessage and unreadCount
 */

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatHub } from "@/lib/signalr";
import { categoriesKeys } from "@/hooks/queries/useCategories";
import { useAuthStore } from "@/stores/authStore";
import type {
  CategoryWithUnread,
  ConversationWithUnread,
} from "@/types/categories";

/**
 * Hook for real-time category updates via SignalR
 *
 * Features:
 * - Auto-join all conversations on mount
 * - Listen MessageSent event → update lastMessage + unreadCount
 * - Listen MessageRead event → reset unreadCount
 * - Auto-cleanup on unmount
 *
 * @param categories - Current categories with conversations
 *
 * @example
 * ```tsx
 * const { data: categories } = useCategories();
 * useCategoriesRealtime(categories); // Auto-handles real-time updates
 * ```
 */
export function useCategoriesRealtime(
  categories: CategoryWithUnread[] | undefined,
) {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);

  // Track joined conversations to prevent duplicate joins
  const joinedConversationsRef = useRef<Set<string>>(new Set());

  // ────────────────────────────────────────────────────────
  // AUTO-JOIN CONVERSATIONS
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!categories || categories.length === 0) {
      return;
    }

    const conversationIds = categories.flatMap((cat) =>
      cat.conversations.map((conv) => conv.conversationId),
    );

    // Get current joined set
    const currentJoined = joinedConversationsRef.current;

    // Find new conversations to join
    const toJoin = conversationIds.filter((id) => !currentJoined.has(id));

    // Find old conversations to leave (joined but not in current list)
    const toLeave = Array.from(currentJoined).filter(
      (id) => !conversationIds.includes(id),
    );

    // Join new conversations
    if (toJoin.length > 0) {
      toJoin.forEach((id) => {
        chatHub
          .joinGroup(id)
          .then(() => {
            currentJoined.add(id);
          })
          .catch((err) => {
            console.error(`[CategoryRealtime] Failed to join ${id}:`, err);
          });
      });
    }

    // Leave old conversations
    if (toLeave.length > 0) {
      toLeave.forEach((id) => {
        chatHub.leaveGroup(id);
        currentJoined.delete(id);
      });
    }

    // Cleanup: Leave all on unmount
    return () => {
      Array.from(currentJoined).forEach((id) => {
        chatHub.leaveGroup(id);
      });
      currentJoined.clear();
    };
  }, [categories]);

  // ────────────────────────────────────────────────────────
  // EVENT: MessageSent
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    // Wait for SignalR to connect
    if (chatHub.state !== "Connected") {
      // Try again after a delay
      const timer = setTimeout(() => {
        if (chatHub.state === "Connected") {
          setupMessageListener();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }

    setupMessageListener();

    function setupMessageListener() {
      const handleMessageSent = (data: any) => {
        const { message } = data;
        if (!message) {
          console.error(`[CategoryRealtime] ❌ No message in event data`);
          return;
        }

        const {
          conversationId,
          senderId,
          id,
          senderName,
          content,
          sentAt,
          attachments,
        } = message;

        queryClient.setQueryData<CategoryWithUnread[]>(
          categoriesKeys.list(),
          (oldData) => {
            if (!oldData) return oldData;

            const updatedData = oldData.map((category) => ({
              ...category,
              conversations: category.conversations.map((conv) => {
                // Skip if not this conversation
                if (conv.conversationId !== conversationId) return conv;

                // Calculate unreadCount increment
                // KHÔNG tăng nếu tin nhắn của chính user
                const shouldIncrement = senderId !== currentUserId;
                const newUnreadCount = shouldIncrement
                  ? (conv.unreadCount || 0) + 1
                  : conv.unreadCount || 0;

                // Update lastMessage and unreadCount
                return {
                  ...conv,
                  lastMessage: {
                    messageId: id,
                    senderId,
                    senderName,
                    content,
                    sentAt,
                    attachments,
                  },
                  unreadCount: newUnreadCount,
                };
              }),
            }));

            return updatedData;
          },
        );

        // Don't use invalidateQueries - it refetches from API and overwrites our update!
        // Instead, just notify observers by setting data again (forces re-render)
        // This is a workaround to trigger React Query's observers without refetching
        setTimeout(() => {
          const currentData = queryClient.getQueryData<CategoryWithUnread[]>(
            categoriesKeys.list(),
          );
          if (currentData) {
            queryClient.setQueryData(categoriesKeys.list(), [...currentData]);
          }
        }, 0);
      };

      // Register event listener
      chatHub.onMessageSent(handleMessageSent);
    }

    return () => {
      // Auto cleanup
    };
  }, [queryClient, currentUserId]);

  // ────────────────────────────────────────────────────────
  // EVENT: MessageRead
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMessageRead = (data: any) => {
      const { conversationId, userId } = data;

      // Only update if current user read the messages
      if (userId !== currentUserId) return;

      queryClient.setQueryData<CategoryWithUnread[]>(
        categoriesKeys.list(),
        (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((category) => ({
            ...category,
            conversations: category.conversations.map((conv) =>
              conv.conversationId === conversationId
                ? { ...conv, unreadCount: 0 } // Reset unread
                : conv,
            ),
          }));
        },
      );

      // Force re-render
      queryClient.invalidateQueries({ queryKey: categoriesKeys.list() });
    };

    // Register event listener
    chatHub.onMessageRead(handleMessageRead);

    // Cleanup handled by SignalR lib
    return () => {
      // Auto cleanup
    };
  }, [queryClient, currentUserId]);
}

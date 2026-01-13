// useConversationRealtime hook - Handle realtime conversation list updates (UPGRADED)

import { useEffect, useCallback, useRef } from "react";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { chatHub, SIGNALR_EVENTS } from "@/lib/signalr";
import { useSignalRConnection } from "@/providers/SignalRProvider";
import { conversationKeys } from "./queries/keys/conversationKeys";
import type { ChatMessage } from "@/types/messages";
import type {
  GroupConversation,
  DirectConversation,
} from "@/types/conversations";

// Use API response structure (items, not data)
type ConversationPage = {
  items: (GroupConversation | DirectConversation)[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Backend SignalR event: MessageSent
 * Structure: { message: ChatMessage }
 *
 * Note: conversationId is inside message.conversationId
 */
interface MessageSentEvent {
  message: ChatMessage;
}

/**
 * Backend SignalR event: MessageRead
 * Structure: { conversationId: string, userId: string }
 */
interface MessageReadEvent {
  conversationId: string;
  userId: string;
}

interface UseConversationRealtimeOptions {
  /** Active conversation ID - không tăng unreadCount nếu message thuộc conversation này */
  activeConversationId?: string;

  /** Callback khi có message mới */
  onNewMessage?: (message: ChatMessage) => void;
}

/**
 * Hook to handle realtime updates for conversation list (UPGRADED)
 *
 * Features:
 * - Listen MessageSent: Update lastMessage + increment unreadCount (nếu không active)
 * - Listen MessageRead: Clear unreadCount
 * - Auto sort conversations by latest message
 * - Optimistic updates without full refetch
 * - Auto join/leave conversation groups for realtime updates
 *
 * @example
 * ```tsx
 * // In ConversationList
 * useConversationRealtime({ activeConversationId: selectedId });
 *
 * // In ChatMain
 * useConversationRealtime({
 *   activeConversationId: conversationId,
 *   onNewMessage: (msg) => console.log('New message:', msg)
 * });
 * ```
 */
export function useConversationRealtime(
  options: UseConversationRealtimeOptions = {}
) {
  const { activeConversationId, onNewMessage } = options;
  const queryClient = useQueryClient();
  const joinedGroupsRef = useRef<Set<string>>(new Set());
  const { isConnected } = useSignalRConnection();

  // Handle MessageSent event
  const handleMessageSent = useCallback(
    (event: any) => {
      // Handle both wrapped and unwrapped message structures
      // Wrapped: { message: ChatMessage }
      // Unwrapped: ChatMessage (backend sends directly)
      const message = event.message || event;
      const conversationId = message?.conversationId;

      if (!message || !conversationId) {
        console.error("❌ [Realtime] Invalid MessageSent event:", event);
        return;
      }

      const isActiveConversation = activeConversationId === conversationId;

      // Update groups cache
      try {
        const groupsData = queryClient.getQueryData<
          InfiniteData<ConversationPage>
        >(conversationKeys.groups());

        if (groupsData?.pages) {
          const updatedPages = groupsData.pages.map((page) => ({
            ...page,
            items: (page.items || []).map((conv) => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: {
                    id: message.id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    senderName: message.senderName,
                    parentMessageId: message.parentMessageId,
                    content: message.content,
                    contentType: message.contentType,
                    sentAt: message.sentAt,
                    editedAt: message.editedAt,
                    linkedTaskId: message.linkedTaskId,
                    reactions: message.reactions,
                    attachments: message.attachments,
                    replyCount: message.replyCount,
                    isStarred: message.isStarred,
                    isPinned: message.isPinned,
                    threadPreview: message.threadPreview,
                    mentions: message.mentions,
                  },
                  // Increment unreadCount ONLY if not active
                  unreadCount: isActiveConversation ? 0 : conv.unreadCount + 1,
                };
              }
              return conv;
            }),
          }));

          queryClient.setQueryData(conversationKeys.groups(), {
            ...groupsData,
            pages: updatedPages,
          });

          // Force notify subscribers without refetching
          queryClient.invalidateQueries({
            queryKey: conversationKeys.groups(),
            refetchType: "none",
          });
        }
      } catch (error) {
        console.error("[Realtime] Error updating groups cache:", error);
      }

      // Update directs cache (same logic)
      try {
        const directsData = queryClient.getQueryData<
          InfiniteData<ConversationPage>
        >(conversationKeys.directs());

        if (directsData?.pages) {
          const updatedPages = directsData.pages.map((page) => ({
            ...page,
            items: (page.items || []).map((conv) => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: {
                    id: message.id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    senderName: message.senderName,
                    parentMessageId: message.parentMessageId,
                    content: message.content,
                    contentType: message.contentType,
                    sentAt: message.sentAt,
                    editedAt: message.editedAt,
                    linkedTaskId: message.linkedTaskId,
                    reactions: message.reactions,
                    attachments: message.attachments,
                    replyCount: message.replyCount,
                    isStarred: message.isStarred,
                    isPinned: message.isPinned,
                    threadPreview: message.threadPreview,
                    mentions: message.mentions,
                  },
                  unreadCount: isActiveConversation ? 0 : conv.unreadCount + 1,
                };
              }
              return conv;
            }),
          }));

          queryClient.setQueryData(conversationKeys.directs(), {
            ...directsData,
            pages: updatedPages,
          });

          // Force notify subscribers without refetching
          queryClient.invalidateQueries({
            queryKey: conversationKeys.directs(),
            refetchType: "none",
          });
        }
      } catch (error) {
        console.error("[Realtime] Error updating directs cache:", error);
      }

      onNewMessage?.(message);
    },
    [queryClient, activeConversationId, onNewMessage]
  );

  // Handle MessageRead event
  const handleMessageRead = useCallback(
    (...args: any[]) => {
      // Backend có thể gửi nhiều cách giống MessageSent
      let conversationId: string;

      if (args.length === 1 && typeof args[0] === "object") {
        const payload = args[0];
        conversationId = payload.conversationId || payload.groupId;
      } else if (args.length >= 1) {
        conversationId = args[0];
      } else {
        console.error("❌ [Realtime] Unknown MessageRead structure:", args);
        return;
      }

      // Update groups cache
      const groupsData = queryClient.getQueryData<
        InfiniteData<ConversationPage>
      >(conversationKeys.groups());

      if (groupsData) {
        const updatedPages = groupsData.pages.map((page) => ({
          ...page,
          items: (page.items || []).map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          ),
        }));

        queryClient.setQueryData(conversationKeys.groups(), {
          ...groupsData,
          pages: updatedPages,
        });

        queryClient.invalidateQueries({
          queryKey: conversationKeys.groups(),
          refetchType: "none",
        });
      }

      // Update directs cache
      const directsData = queryClient.getQueryData<
        InfiniteData<ConversationPage>
      >(conversationKeys.directs());

      if (directsData) {
        const updatedPages = directsData.pages.map((page) => ({
          ...page,
          items: (page.items || []).map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          ),
        }));

        queryClient.setQueryData(conversationKeys.directs(), {
          ...directsData,
          pages: updatedPages,
        });

        queryClient.invalidateQueries({
          queryKey: conversationKeys.directs(),
          refetchType: "none",
        });
      }
    },
    [queryClient]
  );

  // Handle ConversationUpdated event (fallback - full refetch)
  const handleConversationUpdated = useCallback(
    (...args: any[]) => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });
    },
    [queryClient]
  );

  // Setup SignalR listeners
  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to events
    // Note: Use 'any' type to accept both object and multiple params from backend
    chatHub.on(SIGNALR_EVENTS.MESSAGE_SENT, handleMessageSent as any);

    chatHub.on(SIGNALR_EVENTS.RECEIVE_MESSAGE, handleMessageSent as any);

    chatHub.on(SIGNALR_EVENTS.MESSAGE_READ, handleMessageRead as any);

    chatHub.on(
      SIGNALR_EVENTS.CONVERSATION_UPDATED,
      handleConversationUpdated as any
    );

    // Cleanup
    return () => {
      chatHub.off(SIGNALR_EVENTS.MESSAGE_SENT, handleMessageSent as any);
      chatHub.off(SIGNALR_EVENTS.RECEIVE_MESSAGE, handleMessageSent as any);
      chatHub.off(SIGNALR_EVENTS.MESSAGE_READ, handleMessageRead as any);
      chatHub.off(
        SIGNALR_EVENTS.CONVERSATION_UPDATED,
        handleConversationUpdated as any
      );
    };
  }, [
    handleMessageSent,
    handleMessageRead,
    handleConversationUpdated,
    isConnected,
  ]);

  // Join all conversations in the list to receive realtime updates
  useEffect(() => {
    if (!isConnected) return;

    // Get all conversation IDs from cache
    const groupsData = queryClient.getQueryData<InfiniteData<ConversationPage>>(
      conversationKeys.groups()
    );
    const directsData = queryClient.getQueryData<
      InfiniteData<ConversationPage>
    >(conversationKeys.directs());

    const allConversationIds = new Set<string>();

    // Collect from groups
    groupsData?.pages?.forEach((page) => {
      page.items?.forEach((conv) => {
        if (conv.id) allConversationIds.add(conv.id);
      });
    });

    // Collect from directs
    directsData?.pages?.forEach((page) => {
      page.items?.forEach((conv) => {
        if (conv.id) allConversationIds.add(conv.id);
      });
    });

    // Join new groups
    const newGroups = Array.from(allConversationIds).filter(
      (id) => !joinedGroupsRef.current.has(id)
    );

    newGroups.forEach((conversationId) => {
      chatHub.joinGroup(conversationId).then(() => {
        joinedGroupsRef.current.add(conversationId);
      });
    });

    // Leave old groups that are no longer in the list
    const currentGroups = Array.from(joinedGroupsRef.current);
    const groupsToLeave = currentGroups.filter(
      (id) => !allConversationIds.has(id)
    );

    groupsToLeave.forEach((conversationId) => {
      chatHub.leaveGroup(conversationId);
      joinedGroupsRef.current.delete(conversationId);
    });

    // Cleanup on unmount
    return () => {
      joinedGroupsRef.current.forEach((conversationId) => {
        chatHub.leaveGroup(conversationId);
      });
      joinedGroupsRef.current.clear();
    };
  }, [queryClient, isConnected]);
}

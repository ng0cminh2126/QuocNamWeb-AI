// useConversationMembers hook - Fetch members of a conversation

import { useQuery } from "@tanstack/react-query";
import { getConversationMembers } from "@/api/conversations.api";
import { conversationKeys } from "./keys/conversationKeys";
import type { ConversationMember } from "@/types/conversations";

interface UseConversationMembersOptions {
  conversationId: string;
  enabled?: boolean;
}

/**
 * Hook to fetch members of a specific conversation
 * Uses TanStack Query for caching and deduplication
 * 
 * Multiple components can call this with the same conversationId
 * and they will share the same cached data (no duplicate API calls)
 */
export function useConversationMembers({
  conversationId,
  enabled = true,
}: UseConversationMembersOptions) {
  return useQuery({
    queryKey: conversationKeys.members(conversationId),
    queryFn: () => getConversationMembers(conversationId),
    enabled: enabled && !!conversationId,
    staleTime: 1000 * 60 * 5, // 5 minutes - members don't change frequently
    gcTime: 1000 * 60 * 10, // 10 minutes cache
  });
}

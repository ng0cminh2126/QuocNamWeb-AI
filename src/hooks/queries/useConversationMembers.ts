// useConversationMembers hook - Fetch members of a conversation

import { useQuery } from '@tanstack/react-query';
import { getConversationMembers } from '@/api/conversations.api';
import { conversationKeys } from './keys/conversationKeys';

interface UseConversationMembersOptions {
  conversationId: string;
  enabled?: boolean;
}

/**
 * Hook to fetch members of a specific conversation
 * Used in AssignTaskSheet to populate the AssignTo dropdown
 * API returns array of members directly
 * 
 * @param conversationId - The conversation ID to fetch members for
 * @param enabled - Whether the query is enabled (default: true)
 */
export function useConversationMembers({
  conversationId,
  enabled = true,
}: UseConversationMembersOptions) {
  return useQuery({
    queryKey: conversationKeys.members(conversationId),
    queryFn: () => getConversationMembers(conversationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!conversationId,
  });
}

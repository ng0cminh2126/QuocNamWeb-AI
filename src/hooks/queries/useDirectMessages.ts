// useDirectMessages hook - Fetch DM conversations with infinite scroll

import { useInfiniteQuery } from '@tanstack/react-query';
import { getConversations } from '@/api/conversations.api';
import { conversationKeys } from './keys/conversationKeys';
import type { DirectConversation } from '@/types/conversations';

interface UseDirectMessagesOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch direct message conversations with cursor-based pagination
 * Uses TanStack Query's useInfiniteQuery for infinite scroll support
 */
export function useDirectMessages(options: UseDirectMessagesOptions = {}) {
  const { enabled = true } = options;

  return useInfiniteQuery({
    queryKey: conversationKeys.directs(),
    queryFn: ({ pageParam }) => getConversations(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30, // 30 seconds (from requirements)
    enabled,
  });
}

/**
 * Helper function to flatten direct messages from infinite query pages
 */
export function flattenDirectMessages(
  data: ReturnType<typeof useDirectMessages>['data']
): DirectConversation[] {
  return data?.pages.flatMap((page) => page.items) ?? [];
}

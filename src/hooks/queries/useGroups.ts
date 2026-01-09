// useGroups hook - Fetch group conversations with infinite scroll

import { useInfiniteQuery } from "@tanstack/react-query";
import { getGroups } from "@/api/conversations.api";
import { conversationKeys } from "./keys/conversationKeys";
import type { GroupConversation } from "@/types/conversations";

interface UseGroupsOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch group conversations with cursor-based pagination
 * Uses TanStack Query's useInfiniteQuery for infinite scroll support
 */
export function useGroups(options: UseGroupsOptions = {}) {
  const { enabled = true } = options;

  return useInfiniteQuery({
    queryKey: conversationKeys.groups(),
    queryFn: ({ pageParam }) => getGroups(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30, // 30 seconds (from requirements)
    enabled,
    // Force component re-render when cache updates (important for realtime)
    notifyOnChangeProps: ["data", "dataUpdatedAt"],
  });
}

/**
 * Helper function to flatten groups from infinite query pages
 */
export function flattenGroups(
  data: ReturnType<typeof useGroups>["data"]
): GroupConversation[] {
  return data?.pages.flatMap((page) => page.items) ?? [];
}

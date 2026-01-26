/**
 * React Query hooks for categories
 * Handles fetching categories and category conversations
 */

import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/api/categories.api";
import type {
  CategoryDto,
  CategoryWithUnread,
  ConversationWithUnread,
} from "@/types/categories";

/**
 * Query key factory for categories
 * Ensures consistent cache keys across the app
 */
export const categoriesKeys = {
  all: ["categories"] as const,
  lists: () => [...categoriesKeys.all, "list"] as const,
  list: () => [...categoriesKeys.lists()] as const,
  conversations: () => [...categoriesKeys.all, "conversations"] as const,
  conversation: (categoryId: string) =>
    [...categoriesKeys.conversations(), categoryId] as const,
};

/**
 * Fetch all categories for the authenticated user
 * Transforms API response to add unreadCount = 0 for client-side tracking
 *
 * @returns Query result with categories array (CategoryWithUnread[])
 *
 * @example
 * ```tsx
 * const { data: categories, isLoading, error } = useCategories();
 *
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!categories?.length) return <EmptyState />;
 *
 * return categories.map(cat => <CategoryCard key={cat.id} {...cat} />);
 * ```
 */
export function useCategories() {
  return useQuery<CategoryWithUnread[], Error>({
    queryKey: categoriesKeys.list(),
    queryFn: async () => {
      const data = await categoriesApi.getCategories();
      // Transform ONCE when fetching from API: Add unreadCount = 0
      return data.map((category) => ({
        ...category,
        conversations: category.conversations.map(
          (conv): ConversationWithUnread => ({
            ...conv,
            unreadCount: 0, // Initialize with 0, SignalR will update
          }),
        ),
      }));
    },
    // Keep data fresh for real-time updates via SignalR
    // Don't auto-refetch to avoid overwriting real-time updates
    staleTime: 1000 * 60 * 5, // 5 minutes - allow SignalR to update cache
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    refetchOnWindowFocus: false, // Don't refetch on focus - SignalR handles updates
    refetchOnMount: false, // Don't refetch on mount if data exists
  });
}

/**
 * Fetch all conversations in a specific category
 *
 * @param categoryId - The category UUID
 * @returns Query result with conversations array
 *
 * @example
 * ```tsx
 * const { data: conversations, isLoading } = useCategoryConversations(categoryId);
 *
 * return conversations?.map(conv => (
 *   <ConversationCard key={conv.id} {...conv} />
 * ));
 * ```
 */
export function useCategoryConversations(categoryId: string) {
  return useQuery({
    queryKey: categoriesKeys.conversation(categoryId),
    queryFn: () => categoriesApi.getCategoryConversations(categoryId),
    enabled: !!categoryId, // Only fetch when categoryId is provided
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });
}

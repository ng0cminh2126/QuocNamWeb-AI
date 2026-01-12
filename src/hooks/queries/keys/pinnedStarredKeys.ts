// Query keys for pinned and starred messages
// Using factory pattern for consistent key generation

export const pinnedStarredKeys = {
  // Root keys
  pinned: ["pinned"] as const,
  starred: ["starred"] as const,

  // Pinned messages by conversation
  pinnedByConversation: (conversationId: string) =>
    [...pinnedStarredKeys.pinned, "conversation", conversationId] as const,

  // All starred messages for current user
  starredAll: () => [...pinnedStarredKeys.starred, "all"] as const,

  // Starred messages with pagination
  starredList: (cursor?: string) =>
    [...pinnedStarredKeys.starred, "list", { cursor }] as const,

  // Starred messages by conversation
  starredByConversation: (conversationId: string, cursor?: string) =>
    [
      ...pinnedStarredKeys.starred,
      "conversation",
      conversationId,
      { cursor },
    ] as const,
};

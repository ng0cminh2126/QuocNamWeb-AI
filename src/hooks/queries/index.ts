// Query hooks barrel export

// Keys
export { conversationKeys } from './keys/conversationKeys';
export { messageKeys } from './keys/messageKeys';
export { pinnedStarredKeys } from './keys/pinnedStarredKeys';

// Conversation hooks
export { useGroups, flattenGroups } from './useGroups';
export { useDirectMessages, flattenDirectMessages } from './useDirectMessages';

// Message hooks
export { useMessages, flattenMessages, getMessageCount } from './useMessages';

// Pinned & Starred hooks
export { usePinnedMessages, getPinnedMessageCount, isMessagePinned } from './usePinnedMessages';
export { useStarredMessages, useConversationStarredMessages, getStarredMessageCount, isMessageStarred } from './useStarredMessages';

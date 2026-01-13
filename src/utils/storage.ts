/**
 * LocalStorage helpers for Phase 6
 * - Draft messages persistence
 * - Failed messages queue
 * - Selected conversation persistence
 * - Scroll positions
 */

// ============================================
// DRAFT MESSAGES
// ============================================

export interface DraftMessage {
  conversationId: string;
  content: string;
  attachedFiles: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
  }>;
  lastModified: number;
}

const DRAFTS_KEY = "chat-drafts";

/**
 * Save draft message for a conversation
 */
export function saveDraft(draft: DraftMessage): void {
  try {
    const drafts = getAllDrafts();
    drafts[draft.conversationId] = draft;
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error("Failed to save draft:", error);
  }
}

/**
 * Get draft message for a conversation
 */
export function getDraft(conversationId: string): DraftMessage | null {
  try {
    const drafts = getAllDrafts();
    return drafts[conversationId] || null;
  } catch (error) {
    console.error("Failed to get draft:", error);
    return null;
  }
}

/**
 * Delete draft message for a conversation
 */
export function deleteDraft(conversationId: string): void {
  try {
    const drafts = getAllDrafts();
    delete drafts[conversationId];
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error("Failed to delete draft:", error);
  }
}

function getAllDrafts(): Record<string, DraftMessage> {
  try {
    const json = localStorage.getItem(DRAFTS_KEY);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.error("Failed to parse drafts:", error);
    return {};
  }
}

// ============================================
// FAILED MESSAGES QUEUE
// ============================================

export interface FailedMessage {
  id: string; // Client-generated temporary ID
  content: string;
  attachedFileIds: string[];
  workspaceId: string;
  conversationId: string;
  retryCount: number;
  lastError: string;
  timestamp: number;
}

const FAILED_MESSAGES_KEY = "failed-messages";
const MAX_FAILED_MESSAGES = 50;

/**
 * Add failed message to queue
 */
export function addFailedMessage(message: FailedMessage): void {
  try {
    let queue = getFailedMessages();

    // Add to queue
    queue.push(message);

    // Keep only latest 50 messages
    if (queue.length > MAX_FAILED_MESSAGES) {
      queue = queue.slice(-MAX_FAILED_MESSAGES);
    }

    localStorage.setItem(FAILED_MESSAGES_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to add failed message:", error);
  }
}

/**
 * Get all failed messages or filter by conversation
 */
export function getFailedMessages(conversationId?: string): FailedMessage[] {
  try {
    const json = localStorage.getItem(FAILED_MESSAGES_KEY);
    const queue: FailedMessage[] = json ? JSON.parse(json) : [];

    if (conversationId) {
      return queue.filter((msg) => msg.conversationId === conversationId);
    }

    return queue;
  } catch (error) {
    console.error("Failed to get failed messages:", error);
    return [];
  }
}

/**
 * Remove failed message from queue
 */
export function removeFailedMessage(id: string): void {
  try {
    const queue = getFailedMessages();
    const updated = queue.filter((msg) => msg.id !== id);
    localStorage.setItem(FAILED_MESSAGES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to remove failed message:", error);
  }
}

/**
 * Increment retry count for a failed message
 */
export function incrementRetryCount(id: string): void {
  try {
    const queue = getFailedMessages();
    const message = queue.find((msg) => msg.id === id);

    if (message) {
      message.retryCount += 1;
      localStorage.setItem(FAILED_MESSAGES_KEY, JSON.stringify(queue));
    }
  } catch (error) {
    console.error("Failed to increment retry count:", error);
  }
}

// ============================================
// SELECTED CONVERSATION PERSISTENCE
// ============================================

const SELECTED_CONVERSATION_KEY = "selected-conversation-id";

/**
 * Save selected conversation ID
 */
export function saveSelectedConversation(conversationId: string): void {
  try {
    localStorage.setItem(SELECTED_CONVERSATION_KEY, conversationId);
  } catch (error) {
    console.error("Failed to save selected conversation:", error);
  }
}

/**
 * Get selected conversation ID
 */
export function getSelectedConversation(): string | null {
  try {
    return localStorage.getItem(SELECTED_CONVERSATION_KEY);
  } catch (error) {
    console.error("Failed to get selected conversation:", error);
    return null;
  }
}

/**
 * Clear selected conversation (e.g., on logout)
 */
export function clearSelectedConversation(): void {
  try {
    localStorage.removeItem(SELECTED_CONVERSATION_KEY);
  } catch (error) {
    console.error("Failed to clear selected conversation:", error);
  }
}

// ============================================
// SCROLL POSITIONS
// ============================================

export interface ScrollPosition {
  conversationId: string;
  scrollTop: number;
  scrollHeight: number;
  timestamp: number;
}

const SCROLL_POSITIONS_KEY = "chat-scroll-positions";
const SCROLL_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Save scroll position for a conversation
 */
export function saveScrollPosition(position: ScrollPosition): void {
  try {
    const positions = getAllScrollPositions();
    positions[position.conversationId] = position;

    // Clean expired positions
    const now = Date.now();
    Object.keys(positions).forEach((id) => {
      if (now - positions[id].timestamp > SCROLL_EXPIRE_TIME) {
        delete positions[id];
      }
    });

    localStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
  } catch (error) {
    console.error("Failed to save scroll position:", error);
  }
}

/**
 * Get scroll position for a conversation
 */
export function getScrollPosition(
  conversationId: string
): ScrollPosition | null {
  try {
    const positions = getAllScrollPositions();
    const position = positions[conversationId];

    if (!position) return null;

    // Check expiration
    if (Date.now() - position.timestamp > SCROLL_EXPIRE_TIME) {
      delete positions[conversationId];
      localStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
      return null;
    }

    return position;
  } catch (error) {
    console.error("Failed to get scroll position:", error);
    return null;
  }
}

function getAllScrollPositions(): Record<string, ScrollPosition> {
  try {
    const json = localStorage.getItem(SCROLL_POSITIONS_KEY);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.error("Failed to parse scroll positions:", error);
    return {};
  }
}

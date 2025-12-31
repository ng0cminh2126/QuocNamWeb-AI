// Message related types

import type { ID, Timestamps, InfiniteScrollResponse } from './common';
import type { User } from './auth';
import type { FileAttachment } from './files';

// =============================================================
// Legacy Message Types (used by mockup components)
// =============================================================

export interface Message extends Timestamps {
  id: ID;
  groupId: ID;
  senderId: ID;
  sender: User;
  content: string;
  contentType: MessageContentType;
  attachments?: FileAttachment[];
  replyToId?: ID;
  replyTo?: Message;
  reactions?: MessageReaction[];
  isPinned: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  readBy?: ID[];
  receivedInfo?: MessageReceivedInfo[];
}

export type MessageContentType = 'text' | 'image' | 'file' | 'system' | 'task';

export interface MessageReaction {
  emoji: string;
  userIds: ID[];
  count: number;
}

export interface MessageReceivedInfo {
  userId: ID;
  userName: string;
  receivedAt: string;
  readAt?: string;
}

export interface PinnedMessage {
  id: ID;
  messageId: ID;
  message: Message;
  pinnedBy: User;
  pinnedAt: string;
  groupId: ID;
}

// Legacy API Request/Response types
export interface SendMessageRequest {
  groupId: ID;
  content: string;
  contentType?: MessageContentType;
  replyToId?: ID;
  attachmentIds?: ID[];
}

export interface UpdateMessageRequest {
  content: string;
}

export interface MessagesQueryParams {
  groupId: ID;
  cursor?: string;
  limit?: number;
  before?: string;
  after?: string;
}

export type MessagesResponse = InfiniteScrollResponse<Message>;

// Typing indicator
export interface TypingIndicator {
  userId: ID;
  userName: string;
  groupId: ID;
  isTyping: boolean;
}

// =============================================================
// API Message Types (matches actual API response)
// =============================================================

// Content Types from API
export type ChatMessageContentType = 'TXT' | 'IMG' | 'FILE' | 'TASK';

// Message Attachment from API
export interface ChatMessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Message Reaction from API
export interface ChatMessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

// Chat Message from API (matches API contract)
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  parentMessageId: string | null;
  content: string;
  contentType: ChatMessageContentType;
  sentAt: string; // ISO datetime
  editedAt: string | null;
  linkedTaskId: string | null;
  reactions: ChatMessageReaction[];
  attachments: ChatMessageAttachment[];
  replyCount: number;
  isStarred: boolean;
  isPinned: boolean;
  threadPreview: unknown | null;
  mentions: string[];
}

// API Response for GET messages
export interface GetMessagesResponse {
  items: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

// API Request for POST message
export interface SendChatMessageRequest {
  content: string;
  contentType: ChatMessageContentType;
  parentMessageId?: string | null;
  attachments?: string[]; // File IDs
}

// API Response for POST message (same as ChatMessage)
export type SendChatMessageResponse = ChatMessage;

// =============================================================
// Type Guards
// =============================================================

export function isTextMessage(msg: ChatMessage): boolean {
  return msg.contentType === 'TXT';
}

export function isImageMessage(msg: ChatMessage): boolean {
  return msg.contentType === 'IMG';
}

export function isFileMessage(msg: ChatMessage): boolean {
  return msg.contentType === 'FILE';
}

export function isTaskMessage(msg: ChatMessage): boolean {
  return msg.contentType === 'TASK';
}

// =============================================================
// Helper Functions
// =============================================================

// Map API content type to legacy content type (for UI compatibility)
export function mapContentTypeToLegacy(contentType: ChatMessageContentType): MessageContentType {
  switch (contentType) {
    case 'TXT':
      return 'text';
    case 'IMG':
      return 'image';
    case 'FILE':
      return 'file';
    case 'TASK':
      return 'task';
    default:
      return 'text';
  }
}

// Map legacy content type to API content type
export function mapContentTypeToAPI(contentType: MessageContentType): ChatMessageContentType {
  switch (contentType) {
    case 'text':
      return 'TXT';
    case 'image':
      return 'IMG';
    case 'file':
      return 'FILE';
    case 'task':
      return 'TASK';
    default:
      return 'TXT';
  }
}

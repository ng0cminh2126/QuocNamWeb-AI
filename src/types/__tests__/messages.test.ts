// Unit tests for message type guards and helper functions
import { describe, it, expect } from 'vitest';
import {
  isTextMessage,
  isImageMessage,
  isFileMessage,
  isTaskMessage,
  mapContentTypeToLegacy,
  mapContentTypeToAPI,
  type ChatMessage,
} from '../messages';

const createMockMessage = (
  contentType: ChatMessage['contentType']
): ChatMessage => ({
  id: 'msg-1',
  conversationId: 'conv-123',
  senderId: 'user-1',
  senderName: 'Test User',
  parentMessageId: null,
  content: 'Test content',
  contentType,
  sentAt: '2025-12-30T08:00:00Z',
  editedAt: null,
  linkedTaskId: null,
  reactions: [],
  attachments: [],
  replyCount: 0,
  isStarred: false,
  isPinned: false,
  threadPreview: null,
  mentions: [],
});

describe('Message Type Guards', () => {
  describe('isTextMessage', () => {
    it('should return true for TXT content type', () => {
      expect(isTextMessage(createMockMessage('TXT'))).toBe(true);
    });

    it('should return false for non-TXT content type', () => {
      expect(isTextMessage(createMockMessage('IMG'))).toBe(false);
      expect(isTextMessage(createMockMessage('FILE'))).toBe(false);
      expect(isTextMessage(createMockMessage('TASK'))).toBe(false);
    });
  });

  describe('isImageMessage', () => {
    it('should return true for IMG content type', () => {
      expect(isImageMessage(createMockMessage('IMG'))).toBe(true);
    });

    it('should return false for non-IMG content type', () => {
      expect(isImageMessage(createMockMessage('TXT'))).toBe(false);
      expect(isImageMessage(createMockMessage('FILE'))).toBe(false);
    });
  });

  describe('isFileMessage', () => {
    it('should return true for FILE content type', () => {
      expect(isFileMessage(createMockMessage('FILE'))).toBe(true);
    });

    it('should return false for non-FILE content type', () => {
      expect(isFileMessage(createMockMessage('TXT'))).toBe(false);
      expect(isFileMessage(createMockMessage('IMG'))).toBe(false);
    });
  });

  describe('isTaskMessage', () => {
    it('should return true for TASK content type', () => {
      expect(isTaskMessage(createMockMessage('TASK'))).toBe(true);
    });

    it('should return false for non-TASK content type', () => {
      expect(isTaskMessage(createMockMessage('TXT'))).toBe(false);
      expect(isTaskMessage(createMockMessage('FILE'))).toBe(false);
    });
  });
});

describe('Content Type Mapping Functions', () => {
  describe('mapContentTypeToLegacy', () => {
    it('should map TXT to text', () => {
      expect(mapContentTypeToLegacy('TXT')).toBe('text');
    });

    it('should map IMG to image', () => {
      expect(mapContentTypeToLegacy('IMG')).toBe('image');
    });

    it('should map FILE to file', () => {
      expect(mapContentTypeToLegacy('FILE')).toBe('file');
    });

    it('should map TASK to task', () => {
      expect(mapContentTypeToLegacy('TASK')).toBe('task');
    });

    it('should default to text for unknown types', () => {
      // @ts-expect-error Testing edge case
      expect(mapContentTypeToLegacy('UNKNOWN')).toBe('text');
    });
  });

  describe('mapContentTypeToAPI', () => {
    it('should map text to TXT', () => {
      expect(mapContentTypeToAPI('text')).toBe('TXT');
    });

    it('should map image to IMG', () => {
      expect(mapContentTypeToAPI('image')).toBe('IMG');
    });

    it('should map file to FILE', () => {
      expect(mapContentTypeToAPI('file')).toBe('FILE');
    });

    it('should map task to TASK', () => {
      expect(mapContentTypeToAPI('task')).toBe('TASK');
    });

    it('should default to TXT for unknown types', () => {
      // @ts-expect-error Testing edge case
      expect(mapContentTypeToAPI('unknown')).toBe('TXT');
    });
  });
});

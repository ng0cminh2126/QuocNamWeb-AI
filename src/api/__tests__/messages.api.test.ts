// Unit tests for messages.api.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMessages, sendMessage, deleteMessage, editMessage } from '../messages.api';
import { apiClient } from '../client';
import type { GetMessagesResponse, ChatMessage, SendChatMessageRequest } from '@/types/messages';

// Mock the apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('messages.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMessages', () => {
    const mockResponse: GetMessagesResponse = {
      items: [
        {
          id: 'msg-1',
          conversationId: 'conv-123',
          senderId: 'user-1',
          senderName: 'Nguyễn Văn A',
          parentMessageId: null,
          content: 'Xin chào!',
          contentType: 'TXT',
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
        },
      ],
      nextCursor: null,
      hasMore: false,
    };

    it('should fetch messages with default limit', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await getMessages({ conversationId: 'conv-123' });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/conversations/conv-123/messages',
        { params: { limit: 50 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch messages with custom limit', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      await getMessages({ conversationId: 'conv-123', limit: 20 });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/conversations/conv-123/messages',
        { params: { limit: 20 } }
      );
    });

    it('should include cursor in params when provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      await getMessages({
        conversationId: 'conv-123',
        cursor: 'cursor-abc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/conversations/conv-123/messages',
        { params: { limit: 50, cursor: 'cursor-abc' } }
      );
    });

    it('should throw error when API fails', async () => {
      const error = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(getMessages({ conversationId: 'conv-123' })).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('sendMessage', () => {
    const mockMessage: ChatMessage = {
      id: 'msg-new',
      conversationId: 'conv-123',
      senderId: 'current-user',
      senderName: 'Bạn',
      parentMessageId: null,
      content: 'Hello world!',
      contentType: 'TXT',
      sentAt: '2025-12-30T09:00:00Z',
      editedAt: null,
      linkedTaskId: null,
      reactions: [],
      attachments: [],
      replyCount: 0,
      isStarred: false,
      isPinned: false,
      threadPreview: null,
      mentions: [],
    };

    it('should send a text message', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockMessage });

      const request: SendChatMessageRequest = {
        content: 'Hello world!',
        contentType: 'TXT',
      };

      const result = await sendMessage('conv-123', request);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/messages',
        { conversationId: 'conv-123', ...request }
      );
      expect(result).toEqual(mockMessage);
    });

    it('should send a message with parent (reply)', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockMessage });

      const request: SendChatMessageRequest = {
        content: 'Reply message',
        contentType: 'TXT',
        parentMessageId: 'msg-parent',
      };

      await sendMessage('conv-123', request);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/messages',
        { conversationId: 'conv-123', ...request }
      );
    });

    it('should throw error when sending fails', async () => {
      const error = new Error('Failed to send');
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(
        sendMessage('conv-123', { content: 'test', contentType: 'TXT' })
      ).rejects.toThrow('Failed to send');
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: undefined });

      await deleteMessage('conv-123', 'msg-1');

      expect(apiClient.delete).toHaveBeenCalledWith(
        '/api/messages/msg-1'
      );
    });

    it('should throw error when delete fails', async () => {
      const error = new Error('Delete failed');
      vi.mocked(apiClient.delete).mockRejectedValueOnce(error);

      await expect(deleteMessage('conv-123', 'msg-1')).rejects.toThrow(
        'Delete failed'
      );
    });
  });

  describe('editMessage', () => {
    const mockEditedMessage: ChatMessage = {
      id: 'msg-1',
      conversationId: 'conv-123',
      senderId: 'user-1',
      senderName: 'Nguyễn Văn A',
      parentMessageId: null,
      content: 'Edited content',
      contentType: 'TXT',
      sentAt: '2025-12-30T08:00:00Z',
      editedAt: '2025-12-30T09:00:00Z',
      linkedTaskId: null,
      reactions: [],
      attachments: [],
      replyCount: 0,
      isStarred: false,
      isPinned: false,
      threadPreview: null,
      mentions: [],
    };

    it('should edit a message', async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockEditedMessage });

      const result = await editMessage('conv-123', 'msg-1', 'Edited content');

      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/messages/msg-1',
        { content: 'Edited content' }
      );
      expect(result).toEqual(mockEditedMessage);
    });

    it('should throw error when edit fails', async () => {
      const error = new Error('Edit failed');
      vi.mocked(apiClient.put).mockRejectedValueOnce(error);

      await expect(
        editMessage('conv-123', 'msg-1', 'New content')
      ).rejects.toThrow('Edit failed');
    });
  });
});

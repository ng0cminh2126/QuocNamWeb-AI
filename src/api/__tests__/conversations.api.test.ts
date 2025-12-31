// Unit tests for conversations.api.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getGroups, getConversations, markConversationAsRead } from '../conversations.api';
import { apiClient } from '../client';
import type { GetGroupsResponse, GetConversationsResponse } from '@/types/conversations';

// Mock the apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('conversations.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGroups', () => {
    const mockGroupsResponse: GetGroupsResponse = {
      items: [
        {
          id: 'group-1',
          name: 'Team Alpha',
          type: 'GRP',
          memberCount: 5,
          unreadCount: 2,
          createdAt: '2025-12-30T08:00:00Z',
          updatedAt: '2025-12-30T09:00:00Z',
          lastMessage: {
            id: 'msg-1',
            content: 'Xin chào team!',
            senderId: 'user-1',
            senderName: 'Nguyễn Văn A',
            sentAt: '2025-12-30T09:00:00Z',
          },
        },
      ],
      nextCursor: null,
      hasMore: false,
    };

    it('should fetch groups without cursor', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockGroupsResponse });

      const result = await getGroups();

      expect(apiClient.get).toHaveBeenCalledWith('/api/groups', { params: {} });
      expect(result).toEqual(mockGroupsResponse);
    });

    it('should fetch groups with cursor for pagination', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockGroupsResponse });

      await getGroups('cursor-abc');

      expect(apiClient.get).toHaveBeenCalledWith('/api/groups', {
        params: { cursor: 'cursor-abc' },
      });
    });

    it('should throw error when API fails', async () => {
      const error = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(getGroups()).rejects.toThrow('Network error');
    });
  });

  describe('getConversations', () => {
    const mockConversationsResponse: GetConversationsResponse = {
      items: [
        {
          id: 'conv-1',
          name: 'DM: Nguyễn Văn A <> Trần Thị B',
          type: 'DM',
          memberCount: 2,
          unreadCount: 1,
          createdAt: '2025-12-30T08:00:00Z',
          updatedAt: '2025-12-30T10:00:00Z',
          lastMessage: {
            id: 'msg-2',
            content: 'Ok, noted!',
            senderId: 'user-2',
            senderName: 'Trần Thị B',
            sentAt: '2025-12-30T10:00:00Z',
          },
        },
      ],
      nextCursor: null,
      hasMore: false,
    };

    it('should fetch conversations without cursor', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockConversationsResponse });

      const result = await getConversations();

      expect(apiClient.get).toHaveBeenCalledWith('/api/conversations', { params: {} });
      expect(result).toEqual(mockConversationsResponse);
    });

    it('should fetch conversations with cursor for pagination', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockConversationsResponse });

      await getConversations('cursor-xyz');

      expect(apiClient.get).toHaveBeenCalledWith('/api/conversations', {
        params: { cursor: 'cursor-xyz' },
      });
    });

    it('should throw error when API fails', async () => {
      const error = new Error('Failed to fetch');
      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(getConversations()).rejects.toThrow('Failed to fetch');
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark conversation as read', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: undefined });

      await markConversationAsRead('conv-1');

      expect(apiClient.post).toHaveBeenCalledWith('/api/conversations/conv-1/read');
    });

    it('should throw error when marking fails', async () => {
      const error = new Error('Failed to mark as read');
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(markConversationAsRead('conv-1')).rejects.toThrow(
        'Failed to mark as read'
      );
    });
  });
});

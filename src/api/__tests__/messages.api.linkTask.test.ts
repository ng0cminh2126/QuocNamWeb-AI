import { describe, it, expect, vi, beforeEach } from 'vitest';
import { linkTaskToMessage } from '../messages.api';
import { apiClient } from '../client';
import type { LinkTaskToMessageResponse } from '@/types/messages';

// Mock the API client
vi.mock('../client', () => ({
  apiClient: {
    patch: vi.fn(),
  },
}));

describe('linkTaskToMessage', () => {
  const mockMessageId = 'msg-123';
  const mockTaskId = 'task-456';

  const mockResponse: LinkTaskToMessageResponse = {
    id: mockMessageId,
    taskId: mockTaskId,
    conversationId: 'conv-789',
    content: 'Test message',
    contentType: 'TASK',
    sender: {
      id: 'user-1',
      name: 'John Doe',
      avatar: null,
    },
    createdAt: '2026-01-14T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully link task to message', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: mockResponse,
    });

    const result = await linkTaskToMessage(mockMessageId, mockTaskId);

    expect(apiClient.patch).toHaveBeenCalledWith(
      `/api/messages/${mockMessageId}/link-task`,
      { taskId: mockTaskId }
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const mockError = new Error('Failed to link task');
    vi.mocked(apiClient.patch).mockRejectedValueOnce(mockError);

    await expect(linkTaskToMessage(mockMessageId, mockTaskId)).rejects.toThrow(
      'Failed to link task'
    );
  });

  it('should send correct payload structure', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: mockResponse,
    });

    await linkTaskToMessage(mockMessageId, mockTaskId);

    const callArgs = vi.mocked(apiClient.patch).mock.calls[0];
    expect(callArgs[1]).toEqual({ taskId: mockTaskId });
  });
});

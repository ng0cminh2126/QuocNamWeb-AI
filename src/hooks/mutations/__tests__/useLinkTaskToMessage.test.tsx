import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLinkTaskToMessage } from '../useLinkTaskToMessage';
import { linkTaskToMessage } from '@/api/messages.api';
import type { LinkTaskToMessageResponse } from '@/types/messages';
import React from 'react';

// Mock the API
vi.mock('@/api/messages.api', () => ({
  linkTaskToMessage: vi.fn(),
}));

describe('useLinkTaskToMessage', () => {
  let queryClient: QueryClient;

  const mockResponse: LinkTaskToMessageResponse = {
    id: 'msg-123',
    taskId: 'task-456',
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
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should successfully link task to message', async () => {
    vi.mocked(linkTaskToMessage).mockResolvedValueOnce(mockResponse);

    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useLinkTaskToMessage({ onSuccess }),
      { wrapper }
    );

    result.current.mutate({ messageId: 'msg-123', taskId: 'task-456' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(linkTaskToMessage).toHaveBeenCalledWith('msg-123', 'task-456');
    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle errors', async () => {
    const mockError = new Error('Failed to link task');
    vi.mocked(linkTaskToMessage).mockRejectedValueOnce(mockError);

    const onError = vi.fn();
    const { result } = renderHook(
      () => useLinkTaskToMessage({ onError }),
      { wrapper }
    );

    result.current.mutate({ messageId: 'msg-123', taskId: 'task-456' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should invalidate messages queries on success', async () => {
    vi.mocked(linkTaskToMessage).mockResolvedValueOnce(mockResponse);

    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useLinkTaskToMessage(), { wrapper });

    result.current.mutate({ messageId: 'msg-123', taskId: 'task-456' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['messages'],
    });
  });

  it('should show loading state during mutation', async () => {
    vi.mocked(linkTaskToMessage).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
    );

    const { result } = renderHook(() => useLinkTaskToMessage(), { wrapper });

    result.current.mutate({ messageId: 'msg-123', taskId: 'task-456' });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isPending).toBe(false);
  });
});

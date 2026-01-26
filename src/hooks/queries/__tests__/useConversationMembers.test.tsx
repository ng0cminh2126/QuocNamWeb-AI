// useConversationMembers hook tests
// Verify TanStack Query caching and deduplication

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConversationMembers } from '../useConversationMembers';
import * as conversationsApi from '@/api/conversations.api';
import type { ConversationMember } from '@/types/conversations';
import type { ReactNode } from 'react';

// Mock the API
vi.mock('@/api/conversations.api');

describe('useConversationMembers', () => {
  let queryClient: QueryClient;

  const mockMembers: ConversationMember[] = [
    {
      userId: 'user-1',
      userName: 'John Doe',
      role: 'member',
      joinedAt: '2025-01-01T00:00:00Z',
      isMuted: false,
      userInfo: {
        id: 'user-1',
        userName: 'John Doe',
        fullName: 'John Doe',
        identifier: 'john@example.com',
        roles: 'member',
        avatarUrl: null,
      },
    },
    {
      userId: 'user-2',
      userName: 'Jane Smith',
      role: 'member',
      joinedAt: '2025-01-02T00:00:00Z',
      isMuted: false,
      userInfo: {
        id: 'user-2',
        userName: 'Jane Smith',
        fullName: 'Jane Smith',
        identifier: 'jane@example.com',
        roles: 'member',
        avatarUrl: null,
      },
    },
  ];

  beforeEach(() => {
    // Create a new QueryClient for each test to ensure isolation
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch members successfully', async () => {
    vi.mocked(conversationsApi.getConversationMembers).mockResolvedValue(
      mockMembers
    );

    const { result } = renderHook(
      () =>
        useConversationMembers({
          conversationId: 'conv-1',
          enabled: true,
        }),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockMembers);
    expect(conversationsApi.getConversationMembers).toHaveBeenCalledTimes(1);
    expect(conversationsApi.getConversationMembers).toHaveBeenCalledWith('conv-1');
  });

  it('should not fetch when enabled is false', async () => {
    vi.mocked(conversationsApi.getConversationMembers).mockResolvedValue(
      mockMembers
    );

    const { result } = renderHook(
      () =>
        useConversationMembers({
          conversationId: 'conv-1',
          enabled: false,
        }),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(false);
    expect(conversationsApi.getConversationMembers).not.toHaveBeenCalled();
  });

  it('should not fetch when conversationId is empty', async () => {
    vi.mocked(conversationsApi.getConversationMembers).mockResolvedValue(
      mockMembers
    );

    const { result } = renderHook(
      () =>
        useConversationMembers({
          conversationId: '',
          enabled: true,
        }),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(false);
    expect(conversationsApi.getConversationMembers).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    vi.mocked(conversationsApi.getConversationMembers).mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useConversationMembers({
          conversationId: 'conv-1',
          enabled: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('should cache results and avoid duplicate API calls', async () => {
    vi.mocked(conversationsApi.getConversationMembers).mockResolvedValue(
      mockMembers
    );

    // First hook instance
    const { result: result1 } = renderHook(
      () =>
        useConversationMembers({
          conversationId: 'conv-1',
          enabled: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    // Second hook instance with same conversationId
    const { result: result2 } = renderHook(
      () =>
        useConversationMembers({
          conversationId: 'conv-1',
          enabled: true,
        }),
      { wrapper }
    );

    // Should immediately have cached data without loading
    expect(result2.current.isLoading).toBe(false);
    expect(result2.current.isSuccess).toBe(true);
    expect(result2.current.data).toEqual(mockMembers);

    // API should only be called once (cached for second call)
    expect(conversationsApi.getConversationMembers).toHaveBeenCalledTimes(1);
  });

  it('should use different cache for different conversationIds', async () => {
    const mockMembers2: ConversationMember[] = [
      {
        userId: 'user-3',
        userName: 'Alice Brown',
        role: 'member',
        joinedAt: '2025-01-03T00:00:00Z',
        isMuted: false,
        userInfo: {
          id: 'user-3',
          userName: 'Alice Brown',
          fullName: 'Alice Brown',
          identifier: 'alice@example.com',
          roles: 'member',
          avatarUrl: null,
        },
      },
    ];

    vi.mocked(conversationsApi.getConversationMembers)
      .mockResolvedValueOnce(mockMembers)
      .mockResolvedValueOnce(mockMembers2);

    // First conversation
    const { result: result1 } = renderHook(
      () =>
        useConversationMembers({
          conversationId: 'conv-1',
          enabled: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    // Second conversation
    const { result: result2 } = renderHook(
      () =>
        useConversationMembers({
          conversationId: 'conv-2',
          enabled: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    // Should have different data
    expect(result1.current.data).toEqual(mockMembers);
    expect(result2.current.data).toEqual(mockMembers2);

    // API should be called twice (once per conversation)
    expect(conversationsApi.getConversationMembers).toHaveBeenCalledTimes(2);
    expect(conversationsApi.getConversationMembers).toHaveBeenCalledWith('conv-1');
    expect(conversationsApi.getConversationMembers).toHaveBeenCalledWith('conv-2');
  });
});

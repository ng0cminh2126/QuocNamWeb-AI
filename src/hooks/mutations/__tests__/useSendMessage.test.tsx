// Unit tests for useSendMessage hook
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSendMessage } from '../useSendMessage';
import * as messagesApi from '@/api/messages.api';
import type { ChatMessage, SendChatMessageRequest } from '@/types/messages';

// Mock the API module
vi.mock('@/api/messages.api');

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn((selector) =>
    selector({
      user: { id: 'current-user', identifier: 'Test User' },
      accessToken: 'test-token',
    })
  ),
}));

const mockSentMessage: ChatMessage = {
  id: 'msg-new',
  conversationId: 'conv-123',
  senderId: 'current-user',
  senderName: 'Test User',
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useSendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a message successfully', async () => {
    vi.mocked(messagesApi.sendMessage).mockResolvedValueOnce(mockSentMessage);
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useSendMessage({
          conversationId: 'conv-123',
          onSuccess,
        }),
      { wrapper: createWrapper() }
    );

    const request: SendChatMessageRequest = {
      content: 'Hello world!',
      contentType: 'TXT',
    };

    await act(async () => {
      result.current.mutate(request);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(messagesApi.sendMessage).toHaveBeenCalledWith('conv-123', request);
    expect(onSuccess).toHaveBeenCalledWith(mockSentMessage);
  });

  it('should handle send message error', async () => {
    const error = new Error('Failed to send message');
    vi.mocked(messagesApi.sendMessage).mockRejectedValueOnce(error);
    const onError = vi.fn();

    const { result } = renderHook(
      () =>
        useSendMessage({
          conversationId: 'conv-123',
          onError,
        }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      result.current.mutate({ content: 'test', contentType: 'TXT' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalled();
  });

  it('should send a reply message', async () => {
    vi.mocked(messagesApi.sendMessage).mockResolvedValueOnce({
      ...mockSentMessage,
      parentMessageId: 'msg-parent',
    });

    const { result } = renderHook(
      () => useSendMessage({ conversationId: 'conv-123' }),
      { wrapper: createWrapper() }
    );

    const request: SendChatMessageRequest = {
      content: 'Reply message',
      contentType: 'TXT',
      parentMessageId: 'msg-parent',
    };

    await act(async () => {
      result.current.mutate(request);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(messagesApi.sendMessage).toHaveBeenCalledWith('conv-123', request);
  });

  it('should have pending state while sending', async () => {
    let resolvePromise: (value: ChatMessage) => void;
    const promise = new Promise<ChatMessage>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(messagesApi.sendMessage).mockReturnValueOnce(promise);

    const { result } = renderHook(
      () => useSendMessage({ conversationId: 'conv-123' }),
      { wrapper: createWrapper() }
    );

    // Start mutation without awaiting
    act(() => {
      result.current.mutate({ content: 'test', contentType: 'TXT' });
    });

    // Check pending state immediately after mutation starts
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Resolve the promise
    await act(async () => {
      resolvePromise!(mockSentMessage);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
  });
});

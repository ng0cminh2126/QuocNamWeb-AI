// Integration tests for Chat flow
// Tests the complete flow from API to UI

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMessages, flattenMessages } from '@/hooks/queries/useMessages';
import { useSendMessage } from '@/hooks/mutations/useSendMessage';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { GetMessagesResponse, ChatMessage, SendChatMessageRequest } from '@/types/messages';

// Test server with real-like API handlers
const API_BASE_URL = 'https://vega-chat-api-dev.allianceitsc.com';

// Mock data store for the test
let mockMessageStore: ChatMessage[] = [];

const handlers = [
  http.get(`${API_BASE_URL}/api/conversations/:conversationId/messages`, ({ params }) => {
    const { conversationId } = params;
    const messages = mockMessageStore.filter(m => m.conversationId === conversationId);
    
    const response: GetMessagesResponse = {
      items: messages.slice().reverse(), // Newest first
      nextCursor: null,
      hasMore: false,
    };
    
    return HttpResponse.json(response);
  }),

  // Updated endpoint: POST /api/messages with conversationId in body
  http.post(`${API_BASE_URL}/api/messages`, async ({ request }) => {
    const body = (await request.json()) as SendChatMessageRequest & { conversationId: string };
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: body.conversationId,
      senderId: 'current-user',
      senderName: 'Test User',
      parentMessageId: body.parentMessageId ?? null,
      content: body.content,
      contentType: body.contentType,
      sentAt: new Date().toISOString(),
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
    
    mockMessageStore.push(newMessage);
    
    return HttpResponse.json(newMessage, { status: 201 });
  }),
];

const server = setupServer(...handlers);

// Mock auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn((selector) =>
    selector({
      user: { id: 'current-user', identifier: 'Test User' },
      accessToken: 'test-token',
    })
  ),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    queryClient,
  };
}

describe('Chat Integration Tests', () => {
  beforeEach(() => {
    // Reset message store
    mockMessageStore = [
      {
        id: 'msg-1',
        conversationId: 'conv-test',
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
      {
        id: 'msg-2',
        conversationId: 'conv-test',
        senderId: 'user-2',
        senderName: 'Trần Thị B',
        parentMessageId: null,
        content: 'Chào bạn!',
        contentType: 'TXT',
        sentAt: '2025-12-30T08:01:00Z',
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
    ];
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('should load messages and display them in chronological order', async () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useMessages({ conversationId: 'conv-test' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const messages = flattenMessages(result.current.data);
    
    // Should have 2 messages
    expect(messages).toHaveLength(2);
    
    // Should be in chronological order (oldest first)
    expect(messages[0].id).toBe('msg-1');
    expect(messages[1].id).toBe('msg-2');
  });

  it('should send a new message and receive confirmation', async () => {
    const { wrapper, queryClient } = createWrapper();
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () => useSendMessage({ conversationId: 'conv-test', onSuccess }),
      { wrapper }
    );

    await act(async () => {
      result.current.mutate({
        content: 'Hello, this is a test message!',
        contentType: 'TXT',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Callback should have been called
    expect(onSuccess).toHaveBeenCalled();

    // The new message should be in the store
    expect(mockMessageStore).toHaveLength(3);
    expect(mockMessageStore[2].content).toBe('Hello, this is a test message!');
  });

  it('should handle empty conversation', async () => {
    // Clear messages for this test
    mockMessageStore = [];
    
    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useMessages({ conversationId: 'conv-empty' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const messages = flattenMessages(result.current.data);
    expect(messages).toHaveLength(0);
  });

  it('should complete full send-receive cycle', async () => {
    const { wrapper, queryClient } = createWrapper();

    // First, load existing messages
    const messagesResult = renderHook(
      () => useMessages({ conversationId: 'conv-test' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(messagesResult.result.current.isSuccess).toBe(true);
    });

    const initialMessages = flattenMessages(messagesResult.result.current.data);
    expect(initialMessages).toHaveLength(2);

    // Now send a new message
    const sendResult = renderHook(
      () => useSendMessage({ conversationId: 'conv-test' }),
      { wrapper }
    );

    await act(async () => {
      sendResult.result.current.mutate({
        content: 'New message from test!',
        contentType: 'TXT',
      });
    });

    await waitFor(() => {
      expect(sendResult.result.current.isSuccess).toBe(true);
    });

    // Refetch messages - in real app this would be done via invalidation
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['messages'] });
    });

    // The message should be in the store now
    expect(mockMessageStore).toHaveLength(3);
  });
});

describe('Message Ordering Tests', () => {
  beforeEach(() => {
    mockMessageStore = [];
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('should maintain correct order after multiple messages', async () => {
    // Pre-populate with messages
    mockMessageStore = [
      {
        id: 'msg-1',
        conversationId: 'conv-test',
        senderId: 'user-1',
        senderName: 'User 1',
        parentMessageId: null,
        content: 'First message',
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
      {
        id: 'msg-2',
        conversationId: 'conv-test',
        senderId: 'user-2',
        senderName: 'User 2',
        parentMessageId: null,
        content: 'Second message',
        contentType: 'TXT',
        sentAt: '2025-12-30T08:01:00Z',
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
      {
        id: 'msg-3',
        conversationId: 'conv-test',
        senderId: 'user-1',
        senderName: 'User 1',
        parentMessageId: null,
        content: 'Third message',
        contentType: 'TXT',
        sentAt: '2025-12-30T08:02:00Z',
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
    ];

    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useMessages({ conversationId: 'conv-test' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const messages = flattenMessages(result.current.data);
    
    expect(messages).toHaveLength(3);
    expect(messages[0].content).toBe('First message');
    expect(messages[1].content).toBe('Second message');
    expect(messages[2].content).toBe('Third message');
  });
});

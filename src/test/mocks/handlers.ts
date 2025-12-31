// MSW handlers for API mocking
import { http, HttpResponse } from 'msw';
import type { GetMessagesResponse, ChatMessage, SendChatMessageRequest } from '@/types/messages';

const API_BASE_URL = 'http://localhost:3000';

// Mock data
export const mockMessages: ChatMessage[] = [
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
  {
    id: 'msg-2',
    conversationId: 'conv-123',
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
  {
    id: 'msg-3',
    conversationId: 'conv-123',
    senderId: 'user-1',
    senderName: 'Nguyễn Văn A',
    parentMessageId: null,
    content: 'Hôm nay công việc thế nào?',
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

export const handlers = [
  // GET messages for a conversation
  http.get(`${API_BASE_URL}/api/conversations/:conversationId/messages`, ({ params, request }) => {
    const { conversationId } = params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const cursor = url.searchParams.get('cursor');

    // Filter messages by conversation
    const conversationMessages = mockMessages.filter(
      (m) => m.conversationId === conversationId
    );

    // Simulate cursor-based pagination
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = conversationMessages.findIndex((m) => m.id === cursor);
      startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    }

    const items = conversationMessages.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < conversationMessages.length;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    const response: GetMessagesResponse = {
      items,
      nextCursor,
      hasMore,
    };

    return HttpResponse.json(response);
  }),

  // POST send message (new endpoint: /api/messages with conversationId in body)
  http.post(`${API_BASE_URL}/api/messages`, async ({ request }) => {
    const body = (await request.json()) as SendChatMessageRequest & { conversationId: string };

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: body.conversationId,
      senderId: 'current-user',
      senderName: 'Bạn',
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

    return HttpResponse.json(newMessage, { status: 201 });
  }),

  // DELETE message (updated endpoint)
  http.delete(`${API_BASE_URL}/api/messages/:messageId`, () => {
    return HttpResponse.json({ success: true });
  }),
];

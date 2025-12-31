// Messages API client
// Handles API calls for chat messages

import { apiClient } from './client';
import type {
  GetMessagesResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from '@/types/messages';

interface GetMessagesParams {
  conversationId: string;
  limit?: number;
  cursor?: string;
}

/**
 * GET /api/conversations/{guid}/messages
 * Fetch messages for a conversation with pagination
 */
export const getMessages = async ({
  conversationId,
  limit = 50,
  cursor,
}: GetMessagesParams): Promise<GetMessagesResponse> => {
  const params: Record<string, unknown> = { limit };
  if (cursor) {
    params.cursor = cursor;
  }

  const response = await apiClient.get<GetMessagesResponse>(
    `/api/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
};

/**
 * POST /api/messages
 * Send a new message to a conversation
 * Note: conversationId is passed in the request body, not URL path
 */
export const sendMessage = async (
  conversationId: string,
  data: SendChatMessageRequest
): Promise<SendChatMessageResponse> => {
  const response = await apiClient.post<SendChatMessageResponse>(
    `/api/messages`,
    {
      conversationId,
      ...data,
    }
  );
  return response.data;
};

/**
 * POST /api/conversations/{guid}/attachments
 * Upload a file attachment to a conversation
 */
export const uploadAttachment = async (
  conversationId: string,
  file: File
): Promise<{ id: string; url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<{ id: string; url: string }>(
    `/api/conversations/${conversationId}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * DELETE /api/messages/{messageId}
 * Delete a message (soft delete)
 */
export const deleteMessage = async (
  _conversationId: string,
  messageId: string
): Promise<void> => {
  await apiClient.delete(`/api/messages/${messageId}`);
};

/**
 * PUT /api/messages/{messageId}
 * Edit a message content
 */
export const editMessage = async (
  _conversationId: string,
  messageId: string,
  content: string
): Promise<SendChatMessageResponse> => {
  const response = await apiClient.put<SendChatMessageResponse>(
    `/api/messages/${messageId}`,
    { content }
  );
  return response.data;
};

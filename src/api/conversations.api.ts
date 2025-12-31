// Conversations API client
// Handles API calls for Groups and Direct Messages

import { apiClient } from './client';
import type {
  GetGroupsResponse,
  GetConversationsResponse,
} from '@/types/conversations';

/**
 * GET /api/groups
 * Fetch list of group conversations the user is a member of
 */
export const getGroups = async (cursor?: string): Promise<GetGroupsResponse> => {
  const params: Record<string, unknown> = {};
  if (cursor) {
    params.cursor = cursor;
  }

  const response = await apiClient.get<GetGroupsResponse>('/api/groups', {
    params,
  });
  return response.data;
};

/**
 * GET /api/conversations
 * Fetch list of direct message (DM) conversations
 */
export const getConversations = async (
  cursor?: string
): Promise<GetConversationsResponse> => {
  const params: Record<string, unknown> = {};
  if (cursor) {
    params.cursor = cursor;
  }

  const response = await apiClient.get<GetConversationsResponse>(
    '/api/conversations',
    { params }
  );
  return response.data;
};

/**
 * POST /api/conversations/{id}/read (optional - if API supports)
 * Mark a conversation as read
 */
export const markConversationAsRead = async (
  conversationId: string
): Promise<void> => {
  await apiClient.post(`/api/conversations/${conversationId}/read`);
};

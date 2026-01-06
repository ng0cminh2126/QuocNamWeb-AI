/**
 * Unit Tests for useSendMessage hook
 *
 * NOTE: This hook does NOT use optimistic updates since SignalR handles
 * realtime message delivery. Tests verify API calls only.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSendMessage } from "../useSendMessage";
import { sendMessage } from "@/api/messages.api";
import type { ChatMessage } from "@/types/messages";

// Mock dependencies
vi.mock("@/api/messages.api");

describe("useSendMessage", () => {
  let queryClient: QueryClient;

  const mockConversationId = "conv-123";

  const mockNewMessage: ChatMessage = {
    id: "msg-new",
    conversationId: mockConversationId,
    senderId: "user-123",
    senderName: "Test User",
    parentMessageId: null,
    content: "New message content",
    contentType: "TXT",
    sentAt: "2026-01-06T10:00:00Z",
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

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // Test Case 1: Success - Send message via API
  it("should send message successfully via API", async () => {
    vi.mocked(sendMessage).mockResolvedValueOnce(mockNewMessage);

    const { result } = renderHook(
      () => useSendMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    // Send message
    result.current.mutate({
      content: "New message content",
      contentType: "TXT",
    });

    // Wait for mutation to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify API was called correctly
    expect(sendMessage).toHaveBeenCalledWith(mockConversationId, {
      content: "New message content",
      contentType: "TXT",
    });
  });

  // Test Case 2: Success callback
  it("should call onSuccess callback when message is sent", async () => {
    vi.mocked(sendMessage).mockResolvedValueOnce(mockNewMessage);
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () => useSendMessage({ conversationId: mockConversationId, onSuccess }),
      { wrapper }
    );

    result.current.mutate({
      content: "Test message",
      contentType: "TXT",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(onSuccess).toHaveBeenCalledWith(mockNewMessage);
  });

  // Test Case 3: Error handling
  it("should handle API error correctly", async () => {
    const mockError = new Error("Failed to send message");
    vi.mocked(sendMessage).mockRejectedValueOnce(mockError);
    const onError = vi.fn();

    const { result } = renderHook(
      () => useSendMessage({ conversationId: mockConversationId, onError }),
      { wrapper }
    );

    result.current.mutate({
      content: "Test message",
      contentType: "TXT",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(onError).toHaveBeenCalledWith(mockError);
    expect(result.current.error).toBe(mockError);
  });

  // Test Case 4: Message with parent (reply)
  it("should send reply message with parentMessageId", async () => {
    const replyMessage: ChatMessage = {
      ...mockNewMessage,
      id: "msg-reply",
      parentMessageId: "msg-parent",
      content: "This is a reply",
    };

    vi.mocked(sendMessage).mockResolvedValueOnce(replyMessage);

    const { result } = renderHook(
      () => useSendMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({
      content: "This is a reply",
      contentType: "TXT",
      parentMessageId: "msg-parent",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sendMessage).toHaveBeenCalledWith(mockConversationId, {
      content: "This is a reply",
      contentType: "TXT",
      parentMessageId: "msg-parent",
    });
  });

  // Test Case 5: No duplicate API calls
  it("should not trigger duplicate API calls", async () => {
    vi.mocked(sendMessage).mockResolvedValueOnce(mockNewMessage);

    const { result } = renderHook(
      () => useSendMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({
      content: "Test message",
      contentType: "TXT",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify sendMessage was called exactly once
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });
});

// Unit tests for usePinnedMessages hook
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  usePinnedMessages,
  getPinnedMessageCount,
  isMessagePinned,
} from "../usePinnedMessages";
import * as pinnedStarredApi from "@/api/pinned_and_starred.api";
import type { PinnedMessageDto } from "@/types/pinned_and_starred";
import type { ChatMessage } from "@/types/messages";

// Mock the API module
vi.mock("@/api/pinned_and_starred.api");

const mockMessage: ChatMessage = {
  id: "msg-1",
  conversationId: "conv-123",
  senderId: "user-1",
  senderName: "Nguyễn Văn A",
  senderIdentifier: "nvana",
  senderFullName: "Nguyễn Văn A",
  senderRoles: "Member",
  parentMessageId: null,
  content: "Important message",
  contentType: "TXT",
  sentAt: "2026-01-08T10:00:00Z",
  editedAt: null,
  linkedTaskId: null,
  reactions: [],
  attachments: [],
  replyCount: 0,
  isStarred: false,
  isPinned: true,
  threadPreview: null,
  mentions: [],
};

const mockPinnedMessages: PinnedMessageDto[] = [
  {
    messageId: "msg-1",
    pinnedBy: "user-1",
    pinnedAt: "2026-01-08T10:00:00Z",
    message: mockMessage,
  },
  {
    messageId: "msg-2",
    pinnedBy: "user-2",
    pinnedAt: "2026-01-08T11:00:00Z",
    message: { ...mockMessage, id: "msg-2", content: "Another important message" },
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("usePinnedMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch pinned messages successfully", async () => {
    vi.mocked(pinnedStarredApi.getPinnedMessages).mockResolvedValueOnce(
      mockPinnedMessages
    );

    const { result } = renderHook(
      () => usePinnedMessages({ conversationId: "conv-123" }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPinnedMessages);
    expect(result.current.data).toHaveLength(2);
    expect(pinnedStarredApi.getPinnedMessages).toHaveBeenCalledWith("conv-123");
  });

  it("should handle loading state", async () => {
    vi.mocked(pinnedStarredApi.getPinnedMessages).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(
      () => usePinnedMessages({ conversationId: "conv-123" }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should handle error state", async () => {
    const error = new Error("Failed to fetch pinned messages");
    vi.mocked(pinnedStarredApi.getPinnedMessages).mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => usePinnedMessages({ conversationId: "conv-123" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it("should use correct cache key", async () => {
    vi.mocked(pinnedStarredApi.getPinnedMessages).mockResolvedValueOnce(
      mockPinnedMessages
    );

    const { result } = renderHook(
      () => usePinnedMessages({ conversationId: "conv-123" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Cache key should be ["pinned", "conversation", "conv-123"]
    expect(pinnedStarredApi.getPinnedMessages).toHaveBeenCalledTimes(1);
  });

  it("should support refetch", async () => {
    vi.mocked(pinnedStarredApi.getPinnedMessages)
      .mockResolvedValueOnce(mockPinnedMessages)
      .mockResolvedValueOnce([mockPinnedMessages[0]]);

    const { result } = renderHook(
      () => usePinnedMessages({ conversationId: "conv-123" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);

    // Refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
    });

    expect(pinnedStarredApi.getPinnedMessages).toHaveBeenCalledTimes(2);
  });

  it("should not fetch when enabled is false", async () => {
    vi.mocked(pinnedStarredApi.getPinnedMessages).mockResolvedValueOnce(
      mockPinnedMessages
    );

    const { result } = renderHook(
      () => usePinnedMessages({ conversationId: "conv-123", enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(pinnedStarredApi.getPinnedMessages).not.toHaveBeenCalled();
  });
});

describe("getPinnedMessageCount", () => {
  it("should return correct count", () => {
    expect(getPinnedMessageCount(mockPinnedMessages)).toBe(2);
  });

  it("should return 0 for undefined data", () => {
    expect(getPinnedMessageCount(undefined)).toBe(0);
  });

  it("should return 0 for empty array", () => {
    expect(getPinnedMessageCount([])).toBe(0);
  });
});

describe("isMessagePinned", () => {
  it("should return true for pinned message", () => {
    expect(isMessagePinned(mockPinnedMessages, "msg-1")).toBe(true);
    expect(isMessagePinned(mockPinnedMessages, "msg-2")).toBe(true);
  });

  it("should return false for non-pinned message", () => {
    expect(isMessagePinned(mockPinnedMessages, "msg-999")).toBe(false);
  });

  it("should return false for undefined data", () => {
    expect(isMessagePinned(undefined, "msg-1")).toBe(false);
  });

  it("should return false for empty array", () => {
    expect(isMessagePinned([], "msg-1")).toBe(false);
  });
});

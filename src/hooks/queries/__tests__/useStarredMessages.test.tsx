// Unit tests for useStarredMessages hook
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useStarredMessages,
  useConversationStarredMessages,
  getStarredMessageCount,
  isMessageStarred,
} from "../useStarredMessages";
import * as pinnedStarredApi from "@/api/pinned_and_starred.api";
import type { StarredMessageDto } from "@/types/pinned_and_starred";
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
  content: "Starred message",
  contentType: "TXT",
  sentAt: "2026-01-08T10:00:00Z",
  editedAt: null,
  linkedTaskId: null,
  reactions: [],
  attachments: [],
  replyCount: 0,
  isStarred: true,
  isPinned: false,
  threadPreview: null,
  mentions: [],
};

const mockStarredMessages: StarredMessageDto[] = [
  {
    messageId: "msg-1",
    starredAt: "2026-01-08T10:00:00Z",
    message: mockMessage,
  },
  {
    messageId: "msg-2",
    starredAt: "2026-01-08T11:00:00Z",
    message: { ...mockMessage, id: "msg-2", content: "Another starred message" },
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

describe("useStarredMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch starred messages successfully", async () => {
    vi.mocked(pinnedStarredApi.getStarredMessages).mockResolvedValueOnce(
      mockStarredMessages
    );

    const { result } = renderHook(() => useStarredMessages(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStarredMessages);
    expect(result.current.data).toHaveLength(2);
    expect(pinnedStarredApi.getStarredMessages).toHaveBeenCalledWith({
      limit: 50,
      cursor: undefined,
    });
  });

  it("should handle loading state", async () => {
    vi.mocked(pinnedStarredApi.getStarredMessages).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useStarredMessages(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should handle error state", async () => {
    const error = new Error("Failed to fetch starred messages");
    vi.mocked(pinnedStarredApi.getStarredMessages).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useStarredMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it("should use correct cache key with cursor", async () => {
    vi.mocked(pinnedStarredApi.getStarredMessages).mockResolvedValueOnce(
      mockStarredMessages
    );

    const { result } = renderHook(
      () => useStarredMessages({ cursor: "next-cursor" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(pinnedStarredApi.getStarredMessages).toHaveBeenCalledWith({
      limit: 50,
      cursor: "next-cursor",
    });
  });

  it("should support refetch", async () => {
    vi.mocked(pinnedStarredApi.getStarredMessages)
      .mockResolvedValueOnce(mockStarredMessages)
      .mockResolvedValueOnce([mockStarredMessages[0]]);

    const { result } = renderHook(() => useStarredMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);

    // Refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
    });

    expect(pinnedStarredApi.getStarredMessages).toHaveBeenCalledTimes(2);
  });

  it("should support custom limit", async () => {
    vi.mocked(pinnedStarredApi.getStarredMessages).mockResolvedValueOnce(
      mockStarredMessages
    );

    const { result } = renderHook(() => useStarredMessages({ limit: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(pinnedStarredApi.getStarredMessages).toHaveBeenCalledWith({
      limit: 20,
      cursor: undefined,
    });
  });
});

describe("useConversationStarredMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch conversation starred messages successfully", async () => {
    vi.mocked(
      pinnedStarredApi.getConversationStarredMessages
    ).mockResolvedValueOnce(mockStarredMessages);

    const { result } = renderHook(
      () => useConversationStarredMessages({ conversationId: "conv-123" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStarredMessages);
    expect(
      pinnedStarredApi.getConversationStarredMessages
    ).toHaveBeenCalledWith({
      conversationId: "conv-123",
      limit: 50,
      cursor: undefined,
    });
  });

  it("should not fetch when enabled is false", async () => {
    const { result } = renderHook(
      () =>
        useConversationStarredMessages({
          conversationId: "conv-123",
          enabled: false,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(pinnedStarredApi.getConversationStarredMessages).not.toHaveBeenCalled();
  });

  it("should support pagination", async () => {
    vi.mocked(
      pinnedStarredApi.getConversationStarredMessages
    ).mockResolvedValueOnce(mockStarredMessages);

    const { result } = renderHook(
      () =>
        useConversationStarredMessages({
          conversationId: "conv-123",
          limit: 20,
          cursor: "cursor-123",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(
      pinnedStarredApi.getConversationStarredMessages
    ).toHaveBeenCalledWith({
      conversationId: "conv-123",
      limit: 20,
      cursor: "cursor-123",
    });
  });
});

describe("getStarredMessageCount", () => {
  it("should return correct count", () => {
    expect(getStarredMessageCount(mockStarredMessages)).toBe(2);
  });

  it("should return 0 for undefined data", () => {
    expect(getStarredMessageCount(undefined)).toBe(0);
  });

  it("should return 0 for empty array", () => {
    expect(getStarredMessageCount([])).toBe(0);
  });
});

describe("isMessageStarred", () => {
  it("should return true for starred message", () => {
    expect(isMessageStarred(mockStarredMessages, "msg-1")).toBe(true);
    expect(isMessageStarred(mockStarredMessages, "msg-2")).toBe(true);
  });

  it("should return false for non-starred message", () => {
    expect(isMessageStarred(mockStarredMessages, "msg-999")).toBe(false);
  });

  it("should return false for undefined data", () => {
    expect(isMessageStarred(undefined, "msg-1")).toBe(false);
  });

  it("should return false for empty array", () => {
    expect(isMessageStarred([], "msg-1")).toBe(false);
  });
});

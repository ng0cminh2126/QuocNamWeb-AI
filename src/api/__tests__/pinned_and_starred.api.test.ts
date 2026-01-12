// Unit tests for pinned_and_starred.api.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  pinMessage,
  unpinMessage,
  getPinnedMessages,
  starMessage,
  unstarMessage,
  getStarredMessages,
  getConversationStarredMessages,
} from "../pinned_and_starred.api";
import { apiClient } from "../client";
import type {
  PinnedMessageDto,
  StarredMessageDto,
} from "@/types/pinned_and_starred";
import type { ChatMessage } from "@/types/messages";

// Mock the apiClient
vi.mock("../client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("pinned_and_starred.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Mock message data
  const mockMessage: ChatMessage = {
    id: "msg-1",
    conversationId: "conv-123",
    senderId: "user-1",
    senderName: "Nguyễn Văn A",
    senderIdentifier: "nvana",
    senderFullName: "Nguyễn Văn A",
    senderRoles: "Member",
    parentMessageId: null,
    content: "Test message",
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

  describe("pinMessage", () => {
    it("should pin a message successfully", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: undefined });

      await pinMessage("msg-1");

      expect(apiClient.post).toHaveBeenCalledWith("/api/messages/msg-1/pin");
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });

    it("should handle pin error", async () => {
      const error = new Error("Failed to pin message");
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(pinMessage("msg-1")).rejects.toThrow("Failed to pin message");
    });

    it("should handle 403 forbidden error", async () => {
      const error = { response: { status: 403, data: { message: "Forbidden" } } };
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(pinMessage("msg-1")).rejects.toEqual(error);
    });

    it("should handle network error", async () => {
      const error = new Error("Network error");
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(pinMessage("msg-1")).rejects.toThrow("Network error");
    });
  });

  describe("unpinMessage", () => {
    it("should unpin a message successfully", async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: undefined });

      await unpinMessage("msg-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/api/messages/msg-1/pin");
      expect(apiClient.delete).toHaveBeenCalledTimes(1);
    });

    it("should handle unpin error", async () => {
      const error = new Error("Failed to unpin message");
      vi.mocked(apiClient.delete).mockRejectedValueOnce(error);

      await expect(unpinMessage("msg-1")).rejects.toThrow(
        "Failed to unpin message"
      );
    });
  });

  describe("getPinnedMessages", () => {
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
        message: { ...mockMessage, id: "msg-2", content: "Another message" },
      },
    ];

    it("should fetch pinned messages successfully", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockPinnedMessages,
      });

      const result = await getPinnedMessages("conv-123");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/conversations/conv-123/pinned-messages"
      );
      expect(result).toEqual(mockPinnedMessages);
      expect(result).toHaveLength(2);
    });

    it("should handle empty pinned messages", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      const result = await getPinnedMessages("conv-123");

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should handle fetch error", async () => {
      const error = new Error("Failed to fetch pinned messages");
      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(getPinnedMessages("conv-123")).rejects.toThrow(
        "Failed to fetch pinned messages"
      );
    });
  });

  describe("starMessage", () => {
    it("should star a message successfully", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: undefined });

      await starMessage("msg-1");

      expect(apiClient.post).toHaveBeenCalledWith("/api/messages/msg-1/star");
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });

    it("should handle star error", async () => {
      const error = new Error("Failed to star message");
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(starMessage("msg-1")).rejects.toThrow("Failed to star message");
    });

    it("should handle 401 unauthorized error", async () => {
      const error = { response: { status: 401, data: { message: "Unauthorized" } } };
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(starMessage("msg-1")).rejects.toEqual(error);
    });
  });

  describe("unstarMessage", () => {
    it("should unstar a message successfully", async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: undefined });

      await unstarMessage("msg-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/api/messages/msg-1/star");
      expect(apiClient.delete).toHaveBeenCalledTimes(1);
    });

    it("should handle unstar error", async () => {
      const error = new Error("Failed to unstar message");
      vi.mocked(apiClient.delete).mockRejectedValueOnce(error);

      await expect(unstarMessage("msg-1")).rejects.toThrow(
        "Failed to unstar message"
      );
    });
  });

  describe("getStarredMessages", () => {
    const mockStarredMessages: StarredMessageDto[] = [
      {
        messageId: "msg-1",
        starredAt: "2026-01-08T10:00:00Z",
        message: { ...mockMessage, isStarred: true },
      },
      {
        messageId: "msg-2",
        starredAt: "2026-01-08T11:00:00Z",
        message: { ...mockMessage, id: "msg-2", isStarred: true },
      },
    ];

    it("should fetch starred messages with default params", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockStarredMessages,
      });

      const result = await getStarredMessages();

      expect(apiClient.get).toHaveBeenCalledWith("/api/starred-messages", {
        params: { limit: 50 },
      });
      expect(result).toEqual(mockStarredMessages);
    });

    it("should fetch starred messages with custom limit", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockStarredMessages,
      });

      await getStarredMessages({ limit: 20 });

      expect(apiClient.get).toHaveBeenCalledWith("/api/starred-messages", {
        params: { limit: 20 },
      });
    });

    it("should fetch starred messages with cursor pagination", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockStarredMessages,
      });

      await getStarredMessages({ limit: 50, cursor: "next-cursor" });

      expect(apiClient.get).toHaveBeenCalledWith("/api/starred-messages", {
        params: { limit: 50, cursor: "next-cursor" },
      });
    });

    it("should handle empty starred messages", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      const result = await getStarredMessages();

      expect(result).toEqual([]);
    });
  });

  describe("getConversationStarredMessages", () => {
    const mockStarredMessages: StarredMessageDto[] = [
      {
        messageId: "msg-1",
        starredAt: "2026-01-08T10:00:00Z",
        message: mockMessage,
      },
    ];

    it("should fetch conversation starred messages successfully", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockStarredMessages,
      });

      const result = await getConversationStarredMessages({
        conversationId: "conv-123",
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/conversations/conv-123/starred-messages",
        { params: { limit: 50 } }
      );
      expect(result).toEqual(mockStarredMessages);
    });

    it("should support pagination", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockStarredMessages,
      });

      await getConversationStarredMessages({
        conversationId: "conv-123",
        limit: 20,
        cursor: "cursor-123",
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/conversations/conv-123/starred-messages",
        { params: { limit: 20, cursor: "cursor-123" } }
      );
    });
  });
});

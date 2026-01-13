import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  saveDraft,
  getDraft,
  deleteDraft,
  addFailedMessage,
  getFailedMessages,
  removeFailedMessage,
  incrementRetryCount,
  saveSelectedConversation,
  getSelectedConversation,
  clearSelectedConversation,
  saveScrollPosition,
  getScrollPosition,
  type DraftMessage,
  type FailedMessage,
  type ScrollPosition,
} from "@/utils/storage";

describe("storage - Draft Messages", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("LS-1: should save draft message", () => {
    const draft: DraftMessage = {
      conversationId: "conv-123",
      content: "Draft text",
      attachedFiles: [],
      lastModified: Date.now(),
    };

    saveDraft(draft);

    const saved = getDraft("conv-123");
    expect(saved).toEqual(draft);
  });

  it("LS-2: should get draft message", () => {
    const draft: DraftMessage = {
      conversationId: "conv-123",
      content: "Draft text",
      attachedFiles: [
        { fileId: "file-1", fileName: "test.pdf", fileSize: 1024 },
      ],
      lastModified: Date.now(),
    };

    saveDraft(draft);

    const retrieved = getDraft("conv-123");
    expect(retrieved).toEqual(draft);

    // Test non-existent draft
    const nonExistent = getDraft("conv-999");
    expect(nonExistent).toBeNull();
  });

  it("LS-3: should delete draft message", () => {
    const draft: DraftMessage = {
      conversationId: "conv-123",
      content: "Draft text",
      attachedFiles: [],
      lastModified: Date.now(),
    };

    saveDraft(draft);
    deleteDraft("conv-123");

    const saved = getDraft("conv-123");
    expect(saved).toBeNull();
  });

  it("should handle multiple drafts for different conversations", () => {
    const draft1: DraftMessage = {
      conversationId: "conv-1",
      content: "Draft 1",
      attachedFiles: [],
      lastModified: Date.now(),
    };

    const draft2: DraftMessage = {
      conversationId: "conv-2",
      content: "Draft 2",
      attachedFiles: [],
      lastModified: Date.now(),
    };

    saveDraft(draft1);
    saveDraft(draft2);

    expect(getDraft("conv-1")).toEqual(draft1);
    expect(getDraft("conv-2")).toEqual(draft2);

    deleteDraft("conv-1");
    expect(getDraft("conv-1")).toBeNull();
    expect(getDraft("conv-2")).toEqual(draft2);
  });
});

describe("storage - Failed Messages Queue", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("LS-4: should add failed message to queue", () => {
    const message: FailedMessage = {
      id: "msg-1",
      content: "Failed message",
      attachedFileIds: [],
      workspaceId: "ws-1",
      conversationId: "conv-1",
      retryCount: 0,
      lastError: "Network error",
      timestamp: Date.now(),
    };

    addFailedMessage(message);

    const queue = getFailedMessages();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toEqual(message);
  });

  it("LS-5: should get all failed messages", () => {
    const message1: FailedMessage = {
      id: "msg-1",
      content: "Failed 1",
      attachedFileIds: [],
      workspaceId: "ws-1",
      conversationId: "conv-1",
      retryCount: 0,
      lastError: "Error",
      timestamp: Date.now(),
    };

    const message2: FailedMessage = {
      id: "msg-2",
      content: "Failed 2",
      attachedFileIds: [],
      workspaceId: "ws-1",
      conversationId: "conv-2",
      retryCount: 1,
      lastError: "Error",
      timestamp: Date.now(),
    };

    addFailedMessage(message1);
    addFailedMessage(message2);

    const queue = getFailedMessages();
    expect(queue).toHaveLength(2);
  });

  it("LS-6: should get failed messages by conversation", () => {
    const message1: FailedMessage = {
      id: "msg-1",
      content: "Failed 1",
      attachedFileIds: [],
      workspaceId: "ws-1",
      conversationId: "conv-1",
      retryCount: 0,
      lastError: "Error",
      timestamp: Date.now(),
    };

    const message2: FailedMessage = {
      id: "msg-2",
      content: "Failed 2",
      attachedFileIds: [],
      workspaceId: "ws-1",
      conversationId: "conv-2",
      retryCount: 0,
      lastError: "Error",
      timestamp: Date.now(),
    };

    addFailedMessage(message1);
    addFailedMessage(message2);

    const conv1Messages = getFailedMessages("conv-1");
    expect(conv1Messages).toHaveLength(1);
    expect(conv1Messages[0].id).toBe("msg-1");
  });

  it("LS-7: should remove failed message from queue", () => {
    const message: FailedMessage = {
      id: "msg-1",
      content: "Failed",
      attachedFileIds: [],
      workspaceId: "ws-1",
      conversationId: "conv-1",
      retryCount: 0,
      lastError: "Error",
      timestamp: Date.now(),
    };

    addFailedMessage(message);
    removeFailedMessage("msg-1");

    const queue = getFailedMessages();
    expect(queue).toHaveLength(0);
  });

  it("LS-8: should increment retry count", () => {
    const message: FailedMessage = {
      id: "msg-1",
      content: "Failed",
      attachedFileIds: [],
      workspaceId: "ws-1",
      conversationId: "conv-1",
      retryCount: 0,
      lastError: "Error",
      timestamp: Date.now(),
    };

    addFailedMessage(message);
    incrementRetryCount("msg-1");

    const queue = getFailedMessages();
    expect(queue[0].retryCount).toBe(1);

    incrementRetryCount("msg-1");
    const updated = getFailedMessages();
    expect(updated[0].retryCount).toBe(2);
  });

  it("LS-9: should enforce max queue size of 50", () => {
    // Add 51 messages
    for (let i = 0; i < 51; i++) {
      const message: FailedMessage = {
        id: `msg-${i}`,
        content: `Message ${i}`,
        attachedFileIds: [],
        workspaceId: "ws-1",
        conversationId: "conv-1",
        retryCount: 0,
        lastError: "Error",
        timestamp: Date.now() + i,
      };
      addFailedMessage(message);
    }

    const queue = getFailedMessages();
    expect(queue.length).toBe(50);
    // Oldest (msg-0) should be removed
    expect(queue.find((m) => m.id === "msg-0")).toBeUndefined();
    // Newest (msg-50) should exist
    expect(queue.find((m) => m.id === "msg-50")).toBeDefined();
  });
});

describe("storage - Selected Conversation Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("LS-10: should save and get selected conversation", () => {
    saveSelectedConversation("conv-123");

    const saved = getSelectedConversation();
    expect(saved).toBe("conv-123");
  });

  it("LS-11: should clear selected conversation", () => {
    saveSelectedConversation("conv-123");
    clearSelectedConversation();

    const saved = getSelectedConversation();
    expect(saved).toBeNull();
  });

  it("should return null when no conversation saved", () => {
    const saved = getSelectedConversation();
    expect(saved).toBeNull();
  });
});

describe("storage - Scroll Positions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("LS-12: should save and get scroll position", () => {
    const position: ScrollPosition = {
      conversationId: "conv-123",
      scrollTop: 500,
      scrollHeight: 1000,
      timestamp: Date.now(),
    };

    saveScrollPosition(position);

    const saved = getScrollPosition("conv-123");
    expect(saved).toEqual(position);
  });

  it("should return null for expired scroll position (24h old)", () => {
    const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
    const position: ScrollPosition = {
      conversationId: "conv-123",
      scrollTop: 500,
      scrollHeight: 1000,
      timestamp: oldTimestamp,
    };

    saveScrollPosition(position);

    const saved = getScrollPosition("conv-123");
    expect(saved).toBeNull();
  });

  it("should clean expired positions when saving new position", () => {
    const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000;
    const oldPosition: ScrollPosition = {
      conversationId: "conv-old",
      scrollTop: 100,
      scrollHeight: 200,
      timestamp: oldTimestamp,
    };

    const newPosition: ScrollPosition = {
      conversationId: "conv-new",
      scrollTop: 500,
      scrollHeight: 1000,
      timestamp: Date.now(),
    };

    saveScrollPosition(oldPosition);
    saveScrollPosition(newPosition);

    // Old position should be cleaned
    expect(getScrollPosition("conv-old")).toBeNull();
    // New position should exist
    expect(getScrollPosition("conv-new")).toEqual(newPosition);
  });

  it("should return null for non-existent scroll position", () => {
    const saved = getScrollPosition("conv-999");
    expect(saved).toBeNull();
  });
});

describe("storage - Error Handling", () => {
  it("should handle localStorage errors gracefully", () => {
    // Mock localStorage.setItem to throw
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error("QuotaExceededError");
    });

    const draft: DraftMessage = {
      conversationId: "conv-1",
      content: "Test",
      attachedFiles: [],
      lastModified: Date.now(),
    };

    // Should not throw
    expect(() => saveDraft(draft)).not.toThrow();

    // Restore
    Storage.prototype.setItem = originalSetItem;
  });
});

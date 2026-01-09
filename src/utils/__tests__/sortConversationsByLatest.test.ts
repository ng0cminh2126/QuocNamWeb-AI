import { describe, test, expect } from "vitest";
import { sortConversationsByLatest } from "../sortConversationsByLatest";
import type { GroupConversation } from "@/types/conversations";

const createMockConversation = (
  id: string,
  sentAt?: string
): GroupConversation => ({
  id,
  type: "GRP",
  name: `Group ${id}`,
  description: "",
  avatarFileId: null,
  createdBy: "user-1",
  createdByName: "Admin",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: null,
  unreadCount: 0,
  lastMessage: sentAt
    ? {
        id: `msg-${id}`,
        conversationId: id,
        senderId: "user-1",
        senderName: "User",
        parentMessageId: null,
        content: "Test",
        contentType: "TXT",
        sentAt,
        editedAt: null,
        linkedTaskId: null,
        reactions: [],
        attachments: [],
        replyCount: 0,
        isStarred: false,
        isPinned: false,
        threadPreview: null,
        mentions: [],
      }
    : null,
  memberCount: 5,
});

describe("sortConversationsByLatest", () => {
  test("TC-8.1: sorts conversations by lastMessage.sentAt descending", () => {
    const conversations = [
      createMockConversation("1", "2026-01-07T10:00:00Z"),
      createMockConversation("2", "2026-01-07T12:00:00Z"), // Newest
      createMockConversation("3", "2026-01-07T08:00:00Z"),
    ];

    const sorted = sortConversationsByLatest(conversations);

    expect(sorted[0].id).toBe("2"); // 12:00
    expect(sorted[1].id).toBe("1"); // 10:00
    expect(sorted[2].id).toBe("3"); // 08:00
  });

  test("TC-8.2: places conversations without lastMessage at the end", () => {
    const conversations = [
      createMockConversation("1", undefined), // No lastMessage
      createMockConversation("2", "2026-01-07T12:00:00Z"),
      createMockConversation("3", undefined), // No lastMessage
    ];

    const sorted = sortConversationsByLatest(conversations);

    expect(sorted[0].id).toBe("2"); // Has lastMessage
    expect(sorted[1].id).toBe("1"); // No lastMessage
    expect(sorted[2].id).toBe("3"); // No lastMessage
  });

  test("TC-8.3: does not mutate original array", () => {
    const conversations = [
      createMockConversation("1", "2026-01-07T10:00:00Z"),
      createMockConversation("2", "2026-01-07T12:00:00Z"),
    ];

    const original = [...conversations];
    sortConversationsByLatest(conversations);

    expect(conversations).toEqual(original); // Unchanged
  });

  test("TC-8.4: handles empty array", () => {
    const sorted = sortConversationsByLatest([]);
    expect(sorted).toEqual([]);
  });

  test("TC-8.5: handles single conversation", () => {
    const conversations = [createMockConversation("1", "2026-01-07T10:00:00Z")];
    const sorted = sortConversationsByLatest(conversations);

    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe("1");
  });

  test("TC-8.6: handles conversations with same timestamp", () => {
    const sameTime = "2026-01-07T12:00:00Z";
    const conversations = [
      createMockConversation("1", sameTime),
      createMockConversation("2", sameTime),
    ];

    const sorted = sortConversationsByLatest(conversations);

    // Should maintain original order when timestamps are equal
    expect(sorted).toHaveLength(2);
    expect(sorted[0].lastMessage?.sentAt).toBe(sameTime);
    expect(sorted[1].lastMessage?.sentAt).toBe(sameTime);
  });
});

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConversationItem from "../ConversationItem";
import type { GroupConversation } from "@/types/conversations";

const createMockConversation = (
  overrides: Partial<GroupConversation> = {}
): GroupConversation => ({
  id: "conv-1",
  type: "GRP",
  name: "Test Group",
  description: "Test description",
  avatarFileId: null,
  createdBy: "user-1",
  createdByName: "Admin",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: null,
  unreadCount: 0,
  lastMessage: {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-2",
    senderName: "User B",
    parentMessageId: null,
    content: "Hello",
    contentType: "TXT",
    sentAt: "2026-01-07T10:00:00Z",
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
  memberCount: 5,
  ...overrides,
});

describe("ConversationItem", () => {
  test("TC-5.1: renders conversation name and message preview", () => {
    const conversation = createMockConversation();
    render(
      <ConversationItem
        conversation={conversation}
        isActive={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByText("Test Group")).toBeInTheDocument();
    expect(screen.getByText(/User B: Hello/)).toBeInTheDocument();
  });

  test("TC-5.2: shows badge when unreadCount > 0 and NOT active", () => {
    const conversation = createMockConversation({ unreadCount: 3 });
    render(
      <ConversationItem
        conversation={conversation}
        isActive={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByTestId("unread-badge")).toHaveTextContent("3");
  });

  test("TC-5.3: hides badge when isActive (even with unread)", () => {
    const conversation = createMockConversation({ unreadCount: 5 });
    render(
      <ConversationItem
        conversation={conversation}
        isActive={true}
        onClick={() => {}}
      />
    );

    expect(screen.queryByTestId("unread-badge")).not.toBeInTheDocument();
  });

  test("TC-5.4: applies active styles when isActive", () => {
    const conversation = createMockConversation();
    render(
      <ConversationItem
        conversation={conversation}
        isActive={true}
        onClick={() => {}}
      />
    );

    const button = screen.getByTestId("conversation-item-conv-1");
    expect(button).toHaveClass("bg-brand-50");
    expect(button).toHaveAttribute("aria-current", "true");
  });

  test("TC-5.5: shows unread border when unreadCount > 0", () => {
    const conversation = createMockConversation({ unreadCount: 2 });
    render(
      <ConversationItem
        conversation={conversation}
        isActive={false}
        onClick={() => {}}
      />
    );

    const button = screen.getByTestId("conversation-item-conv-1");
    expect(button).toHaveClass("border-l-4", "border-brand-500");
  });

  test("TC-5.6: calls onClick with conversation id when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const conversation = createMockConversation();

    render(
      <ConversationItem
        conversation={conversation}
        isActive={false}
        onClick={handleClick}
      />
    );

    const button = screen.getByTestId("conversation-item-conv-1");
    await user.click(button);

    expect(handleClick).toHaveBeenCalledWith("conv-1");
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

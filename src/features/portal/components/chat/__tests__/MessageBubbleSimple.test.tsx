import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageBubbleSimple } from "../MessageBubbleSimple";
import type { ChatMessage } from "@/types/messages";

// Mock message helper
function createMockMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-1",
    senderName: "Test User",
    senderIdentifier: "testuser",
    senderFullName: "Test User Full",
    senderRoles: null,
    parentMessageId: null,
    content: "Test message content",
    contentType: "TXT",
    sentAt: "2026-01-13T10:00:00Z",
    editedAt: null,
    linkedTaskId: null,
    reactions: [],
    attachments: [],
    replyCount: 0,
    isStarred: false,
    isPinned: false,
    threadPreview: null,
    mentions: [],
    ...overrides,
  };
}

describe("MessageBubbleSimple - Send status states", () => {
  const formatTime = (dateStr: string) => "10:30 AM";

  it("renders MessageStatusIndicator with sending status", () => {
    // GIVEN: message with sendStatus='sending'
    const message = createMockMessage({ sendStatus: "sending" });

    render(
      <MessageBubbleSimple
        message={message}
        isOwn={true}
        formatTime={formatTime}
      />
    );

    // THEN: MessageStatusIndicator rendered with status='sending'
    expect(screen.getByText(/Đang gửi/i)).toBeInTheDocument();
    expect(screen.getByTestId("status-icon-sending")).toBeInTheDocument();
  });

  it("renders MessageStatusIndicator with retrying status and count", () => {
    // GIVEN: message with sendStatus='retrying', retryCount=2
    const message = createMockMessage({
      sendStatus: "retrying",
      retryCount: 2,
    });

    render(
      <MessageBubbleSimple
        message={message}
        isOwn={true}
        formatTime={formatTime}
      />
    );

    // THEN: MessageStatusIndicator rendered with status='retrying', retryCount=2
    expect(screen.getByText(/Thử lại 2\/3/i)).toBeInTheDocument();
    expect(screen.getByTestId("status-icon-retrying")).toBeInTheDocument();
  });

  it("applies failed state styling (red border and background)", () => {
    // GIVEN: message with sendStatus='failed'
    const message = createMockMessage({
      sendStatus: "failed",
      failReason: "Mất kết nối mạng",
    });

    render(
      <MessageBubbleSimple
        message={message}
        isOwn={true}
        formatTime={formatTime}
      />
    );

    // THEN: Bubble has classes 'bg-red-50/50 border-2 border-red-400'
    const bubble = screen.getByTestId("message-bubble-msg-1");
    expect(bubble).toHaveClass("bg-red-50/50");
    expect(bubble).toHaveClass("border-2");
    expect(bubble).toHaveClass("border-red-400");
  });

  it("renders retry button below bubble when failed", () => {
    // GIVEN: message with sendStatus='failed', onRetry=mockFn
    const message = createMockMessage({
      sendStatus: "failed",
      failReason: "Mất kết nối mạng",
    });
    const onRetry = vi.fn();

    render(
      <MessageBubbleSimple
        message={message}
        isOwn={true}
        formatTime={formatTime}
        onRetry={onRetry}
      />
    );

    // THEN: Retry button rendered with text "Thử lại"
    const retryButton = screen.getByTestId("retry-button");
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveTextContent("Thử lại");
  });

  it("calls onRetry with message ID when retry button clicked", async () => {
    // GIVEN: message with sendStatus='failed', onRetry=mockFn
    const user = userEvent.setup();
    const message = createMockMessage({
      sendStatus: "failed",
      failReason: "Timeout",
    });
    const onRetry = vi.fn();

    render(
      <MessageBubbleSimple
        message={message}
        isOwn={true}
        formatTime={formatTime}
        onRetry={onRetry}
      />
    );

    // WHEN: Click retry button
    const retryButton = screen.getByTestId("retry-button");
    await user.click(retryButton);

    // THEN: onRetry called with message.id
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith("msg-1");
  });

  it("applies opacity-90 when sending or retrying", () => {
    // GIVEN: message with sendStatus='sending'
    const { rerender } = render(
      <MessageBubbleSimple
        message={createMockMessage({ sendStatus: "sending" })}
        isOwn={true}
        formatTime={formatTime}
      />
    );

    // THEN: Bubble has class 'opacity-90'
    let bubble = screen.getByTestId("message-bubble-msg-1");
    expect(bubble).toHaveClass("opacity-90");

    // GIVEN: message with sendStatus='retrying'
    rerender(
      <MessageBubbleSimple
        message={createMockMessage({ sendStatus: "retrying", retryCount: 1 })}
        isOwn={true}
        formatTime={formatTime}
      />
    );

    // THEN: Bubble has class 'opacity-90'
    bubble = screen.getByTestId("message-bubble-msg-1");
    expect(bubble).toHaveClass("opacity-90");
  });
});

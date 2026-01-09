import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MessagePreview from "../MessagePreview";
import type { LastMessage } from "@/types/conversations";

const createMockMessage = (
  contentType: LastMessage["contentType"],
  content: string,
  attachments: any[] = []
): LastMessage => ({
  id: "msg-1",
  conversationId: "conv-1",
  senderId: "user-1",
  senderName: "Nguyễn Văn A",
  parentMessageId: null,
  content,
  contentType,
  sentAt: "2026-01-07T10:00:00Z",
  editedAt: null,
  linkedTaskId: null,
  reactions: [],
  attachments,
  replyCount: 0,
  isStarred: false,
  isPinned: false,
  threadPreview: null,
  mentions: [],
});

describe("MessagePreview", () => {
  test("TC-4.1: shows 'Chưa có tin nhắn' when lastMessage is null", () => {
    render(<MessagePreview lastMessage={null} />);
    const preview = screen.getByTestId("message-preview");
    expect(preview).toHaveTextContent("Chưa có tin nhắn");
  });

  test("TC-4.2: formats TEXT message correctly", () => {
    const message = createMockMessage("TXT", "Hello world");
    render(<MessagePreview lastMessage={message} />);

    const preview = screen.getByTestId("message-preview");
    expect(preview).toHaveTextContent("Nguyễn Văn A: Hello world");
  });

  test("TC-4.3: formats IMAGE message with icon", () => {
    const message = createMockMessage("IMG", "");
    render(<MessagePreview lastMessage={message} />);

    const preview = screen.getByTestId("message-preview");
    expect(preview).toHaveTextContent("Nguyễn Văn A: 📷 Hình ảnh");
  });

  test("TC-4.4: formats FILE message with filename", () => {
    const message = createMockMessage("FILE", "", [
      { fileName: "document.pdf" },
    ]);
    render(<MessagePreview lastMessage={message} />);

    const preview = screen.getByTestId("message-preview");
    expect(preview).toHaveTextContent("Nguyễn Văn A: 📎 document.pdf");
  });

  test("TC-4.5: formats TASK message with icon", () => {
    const message = createMockMessage("TASK", "Task description");
    render(<MessagePreview lastMessage={message} />);

    const preview = screen.getByTestId("message-preview");
    expect(preview).toHaveTextContent("Nguyễn Văn A: 📋 Task");
  });

  test("TC-4.6: truncates long text with maxLength", () => {
    const longText = "This is a very long message that should be truncated";
    const message = createMockMessage("TXT", longText);
    render(<MessagePreview lastMessage={message} maxLength={20} />);

    const preview = screen.getByTestId("message-preview");
    // maxLength=20 applies to FULL TEXT (senderName + previewText)
    // "Nguyễn Văn A: This i" = 20 chars, then "..."
    expect(preview).toHaveTextContent("Nguyễn Văn A: This i...");
    expect(preview).toHaveAttribute(
      "title",
      "Nguyễn Văn A: This is a very long message that should be truncated"
    );
  });
});

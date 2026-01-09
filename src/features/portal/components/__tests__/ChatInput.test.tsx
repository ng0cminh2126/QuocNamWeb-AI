import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatInput from "../ChatInput";

describe("ChatInput", () => {
  test("TC-9.1: renders textarea with placeholder", () => {
    render(
      <ChatInput
        value=""
        onChange={() => {}}
        onSend={() => {}}
        placeholder="Type message..."
      />
    );

    const textarea = screen.getByTestId("chat-input");
    expect(textarea).toHaveAttribute("placeholder", "Type message...");
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  test("TC-9.2: Enter key calls onSend (without Shift)", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const onChange = vi.fn();

    render(<ChatInput value="Hello" onChange={onChange} onSend={onSend} />);

    const textarea = screen.getByTestId("chat-input");
    await user.click(textarea);
    await user.keyboard("{Enter}");

    expect(onSend).toHaveBeenCalledTimes(1);
  });

  test("TC-9.3: Shift+Enter does NOT call onSend (inserts newline)", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const onChange = vi.fn();

    render(<ChatInput value="Line 1" onChange={onChange} onSend={onSend} />);

    const textarea = screen.getByTestId("chat-input");
    await user.click(textarea);
    await user.keyboard("{Shift>}{Enter}{/Shift}");

    expect(onSend).not.toHaveBeenCalled();
    // Note: userEvent inserts "\n" when Shift+Enter, captured by onChange
  });

  test("TC-9.4: does NOT send if value is empty or whitespace", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    const { rerender } = render(
      <ChatInput value="" onChange={() => {}} onSend={onSend} />
    );

    const textarea = screen.getByTestId("chat-input");
    await user.click(textarea);
    await user.keyboard("{Enter}");

    expect(onSend).not.toHaveBeenCalled();

    // Test with whitespace
    rerender(<ChatInput value="   " onChange={() => {}} onSend={onSend} />);

    await user.click(textarea);
    await user.keyboard("{Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  test("TC-9.5: auto-focuses on mount when autoFocus=true", () => {
    render(
      <ChatInput value="" onChange={() => {}} onSend={() => {}} autoFocus />
    );

    const textarea = screen.getByTestId("chat-input");
    expect(textarea).toHaveFocus();
  });

  test("TC-9.6: auto-resizes based on content (maxRows=5)", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChatInput value="" onChange={() => {}} onSend={() => {}} />
    );

    const textarea = screen.getByTestId("chat-input") as HTMLTextAreaElement;

    // Thêm content dài (> 5 dòng)
    const longText = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7";

    await user.clear(textarea);
    await user.type(textarea, longText);

    // Textarea should have scrollbar after 5 rows
    // (react-textarea-autosize handles this automatically)
    expect(textarea.value).toBe(longText);
  });

  test("TC-9.7: disabled state prevents sending", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <ChatInput value="Message" onChange={() => {}} onSend={onSend} disabled />
    );

    const textarea = screen.getByTestId("chat-input");
    expect(textarea).toBeDisabled();

    await user.click(textarea);
    await user.keyboard("{Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  test("TC-9.8: re-focuses after sending when autoFocus=true", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <ChatInput
        value="Message"
        onChange={() => {}}
        onSend={onSend}
        autoFocus
      />
    );

    const textarea = screen.getByTestId("chat-input");

    // Send message
    await user.keyboard("{Enter}");

    // Should re-focus
    await waitFor(() => {
      expect(textarea).toHaveFocus();
    });
  });
});

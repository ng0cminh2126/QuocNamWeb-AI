import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UnreadBadge from "../UnreadBadge";

describe("UnreadBadge", () => {
  test("TC-1.1: returns null when count is 0", () => {
    const { container } = render(<UnreadBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  test("TC-1.2: displays exact number when count <= 99", () => {
    render(<UnreadBadge count={5} />);
    const badge = screen.getByTestId("unread-badge");
    expect(badge).toHaveTextContent("5");
    expect(badge).toHaveAttribute("aria-label", "5 tin nhắn chưa đọc");
  });

  test("TC-1.3: displays '99+' when count > 99", () => {
    render(<UnreadBadge count={123} />);
    const badge = screen.getByTestId("unread-badge");
    expect(badge).toHaveTextContent("99+");
    expect(badge).toHaveAttribute("aria-label", "123 tin nhắn chưa đọc");
  });

  test("TC-1.4: applies custom className", () => {
    render(<UnreadBadge count={3} className="ml-2" />);
    const badge = screen.getByTestId("unread-badge");
    expect(badge).toHaveClass("ml-2");
    expect(badge).toHaveClass("bg-brand-600");
  });
});

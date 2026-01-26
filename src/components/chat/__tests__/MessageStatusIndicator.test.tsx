import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageStatusIndicator } from "../MessageStatusIndicator";

describe("MessageStatusIndicator", () => {
  it("renders sending state with Loader2 icon and text", () => {
    // GIVEN: status='sending'
    render(<MessageStatusIndicator status="sending" />);

    // THEN: Shows "Đang gửi..." with spinning Loader2 icon
    const text = screen.getByText(/Đang gửi/i);
    expect(text).toBeInTheDocument();

    // THEN: Text color is text-white/80
    expect(text).toHaveClass("text-white/80");

    // Icon should be present (check for Loader2 by data-testid or svg)
    const icon = screen.getByTestId("status-icon-sending");
    expect(icon).toBeInTheDocument();
  });

  it("renders retrying state with RefreshCw icon and retry count", () => {
    // GIVEN: status='retrying', retryCount=2, maxRetries=3
    render(
      <MessageStatusIndicator status="retrying" retryCount={2} maxRetries={3} />
    );

    // THEN: Shows "Thử lại 2/3..." with spinning RefreshCw icon
    const text = screen.getByText(/Thử lại 2\/3/i);
    expect(text).toBeInTheDocument();

    // THEN: Text color is text-orange-400
    expect(text).toHaveClass("text-orange-400");

    // Icon should be present
    const icon = screen.getByTestId("status-icon-retrying");
    expect(icon).toBeInTheDocument();
  });

  it("renders failed state with AlertCircle icon and error message", () => {
    // GIVEN: status='failed', errorMessage='Mất kết nối mạng'
    render(
      <MessageStatusIndicator status="failed" errorMessage="Mất kết nối mạng" />
    );

    // THEN: Shows "Mất kết nối mạng" with AlertCircle icon
    const text = screen.getByText(/Mất kết nối mạng/i);
    expect(text).toBeInTheDocument();

    // THEN: Text color is text-red-600
    expect(text).toHaveClass("text-red-600");

    // Icon should be present
    const icon = screen.getByTestId("status-icon-failed");
    expect(icon).toBeInTheDocument();
  });

  it("renders sent state with Check icon and timestamp", () => {
    // GIVEN: status='sent', timestamp='10:30 AM'
    render(<MessageStatusIndicator status="sent" timestamp="10:30 AM" />);

    // THEN: Shows "10:30 AM" with Check icon
    const text = screen.getByText(/10:30 AM/i);
    expect(text).toBeInTheDocument();

    // THEN: Text color is text-white/60
    expect(text).toHaveClass("text-white/60");

    // Icon should be present
    const icon = screen.getByTestId("status-icon-sent");
    expect(icon).toBeInTheDocument();
  });
});

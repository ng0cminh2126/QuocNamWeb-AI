import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import RelativeTime from "../RelativeTime";

describe("RelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-07T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("TC-3.1: renders relative time correctly", () => {
    const timestamp = new Date("2026-01-07T11:58:00Z"); // 2 phút trước
    render(<RelativeTime timestamp={timestamp} />);

    const element = screen.getByTestId("relative-time");
    expect(element).toHaveTextContent("2 phút trước");
  });

  test("TC-3.2: shows full timestamp in title (tooltip)", () => {
    const timestamp = new Date("2026-01-07T10:30:00Z");
    render(<RelativeTime timestamp={timestamp} />);

    const element = screen.getByTestId("relative-time");
    // UTC+7: 10:30 UTC = 17:30 local time
    expect(element).toHaveAttribute("title", "07/01/2026 17:30");
  });

  test(
    "TC-3.3: updates text every 60 seconds",
    { timeout: 10000 },
    async () => {
      const timestamp = new Date("2026-01-07T11:59:30Z"); // 30s trước
      render(<RelativeTime timestamp={timestamp} />);

      const element = screen.getByTestId("relative-time");
      expect(element).toHaveTextContent("Vừa xong");

      // Advance 60s -> now 1 minute passed
      vi.advanceTimersByTime(60000);

      await waitFor(() => {
        expect(element).toHaveTextContent("1 phút trước");
      });
    }
  );

  test("TC-3.4: cleans up interval on unmount", () => {
    const timestamp = new Date("2026-01-07T11:58:00Z");
    const { unmount } = render(<RelativeTime timestamp={timestamp} />);

    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTime } from "../formatRelativeTime";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    // Mock current time: 2026-01-07 12:00:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-07T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("TC-2.1: returns 'Vừa xong' when < 1 minute", () => {
    const timestamp = new Date("2026-01-07T11:59:30Z"); // 30s trước
    expect(formatRelativeTime(timestamp)).toBe("Vừa xong");
  });

  test("TC-2.2: returns 'X phút trước' when < 60 minutes", () => {
    const timestamp = new Date("2026-01-07T11:58:00Z"); // 2 phút trước
    expect(formatRelativeTime(timestamp)).toBe("2 phút trước");
  });

  test("TC-2.3: returns 'X giờ trước' when < 24 hours", () => {
    const timestamp = new Date("2026-01-07T10:00:00Z"); // 2 giờ trước
    expect(formatRelativeTime(timestamp)).toBe("2 giờ trước");
  });

  test("TC-2.4: returns 'Hôm qua' for yesterday", () => {
    const timestamp = new Date("2026-01-06T12:00:00Z"); // Hôm qua
    expect(formatRelativeTime(timestamp)).toBe("Hôm qua");
  });

  test("TC-2.5: returns 'X ngày trước' when < 7 days", () => {
    const timestamp = new Date("2026-01-04T12:00:00Z"); // 3 ngày trước
    expect(formatRelativeTime(timestamp)).toBe("3 ngày trước");
  });

  test("TC-2.6: returns 'DD/MM' when >= 7 days", () => {
    const timestamp = new Date("2025-12-25T12:00:00Z"); // 13 ngày trước
    expect(formatRelativeTime(timestamp)).toBe("25/12");
  });
});

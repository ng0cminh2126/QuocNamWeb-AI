import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { useNetworkStatus } from "../useNetworkStatus";

describe("useNetworkStatus", () => {
  beforeEach(() => {
    // Reset navigator.onLine to default state
    vi.stubGlobal("navigator", {
      onLine: true,
    });

    // Clear all timers
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it("returns isOnline: true initially when navigator.onLine is true", () => {
    // GIVEN: navigator.onLine = true (set in beforeEach)

    // WHEN: Hook renders
    const { result } = renderHook(() => useNetworkStatus());

    // THEN: Returns { isOnline: true, wasOffline: false }
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it("updates isOnline to false when window fires offline event", () => {
    // GIVEN: Hook is mounted with isOnline=true
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);

    // WHEN: window.dispatchEvent(new Event('offline'))
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    // THEN: isOnline becomes false
    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(false); // Not set yet (only on recovery)
  });

  it("updates isOnline to true when window fires online event", () => {
    // GIVEN: Hook is mounted with isOnline=false
    vi.stubGlobal("navigator", {
      onLine: false,
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);

    // WHEN: window.dispatchEvent(new Event('online'))
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    // THEN: isOnline becomes true, wasOffline becomes true
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(true);
  });

  it("resets wasOffline to false after 3 seconds of going online", async () => {
    // GIVEN: Hook is mounted with isOnline=false
    vi.useFakeTimers();

    vi.stubGlobal("navigator", {
      onLine: false,
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);

    // WHEN: window.dispatchEvent(new Event('online'))
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.wasOffline).toBe(true);

    // THEN: After 3s, wasOffline becomes false
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.wasOffline).toBe(false);

    vi.useRealTimers();
  });
});

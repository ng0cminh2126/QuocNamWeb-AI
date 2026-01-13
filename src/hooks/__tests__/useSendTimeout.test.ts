import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { useSendTimeout } from "../useSendTimeout";

describe("useSendTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts timeout and returns AbortSignal", () => {
    // GIVEN: Hook with timeoutMs=1000
    const { result } = renderHook(() =>
      useSendTimeout({
        timeoutMs: 1000,
        onTimeout: vi.fn(),
      })
    );

    // WHEN: Call startTimeout()
    let signal!: AbortSignal; // Definite assignment assertion
    act(() => {
      signal = result.current.startTimeout();
    });

    // THEN: Returns AbortSignal object
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it("calls onTimeout callback after timeout duration", async () => {
    // GIVEN: Hook with timeoutMs=1000, onTimeout=mockFn
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useSendTimeout({
        timeoutMs: 1000,
        onTimeout,
      })
    );

    // WHEN: Call startTimeout() and wait 1000ms
    act(() => {
      result.current.startTimeout();
    });

    expect(onTimeout).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // THEN: onTimeout called once
    await waitFor(() => {
      expect(onTimeout).toHaveBeenCalledTimes(1);
    });
  });

  it("can cancel timeout before expiration", async () => {
    // GIVEN: Hook with timeoutMs=1000, onTimeout=mockFn
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useSendTimeout({
        timeoutMs: 1000,
        onTimeout,
      })
    );

    // WHEN: Call startTimeout(), then cancelTimeout() after 500ms
    act(() => {
      result.current.startTimeout();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result.current.cancelTimeout();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // THEN: onTimeout NOT called after 1000ms
    await waitFor(() => {
      expect(onTimeout).not.toHaveBeenCalled();
    });
  });

  it("abort() cancels both signal and timeout", async () => {
    // GIVEN: Hook with timeoutMs=1000
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useSendTimeout({
        timeoutMs: 1000,
        onTimeout,
      })
    );

    // WHEN: Call startTimeout(), then abort() after 500ms
    let signal!: AbortSignal; // Definite assignment assertion
    act(() => {
      signal = result.current.startTimeout();
    });

    expect(signal.aborted).toBe(false);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result.current.abort();
    });

    // THEN: Signal.aborted = true, onTimeout NOT called
    expect(signal.aborted).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(onTimeout).not.toHaveBeenCalled();
    });
  });
});

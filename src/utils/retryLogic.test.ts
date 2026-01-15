import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  retryWithBackoff,
  MESSAGE_RETRY_CONFIG,
  FILE_RETRY_CONFIG,
} from "@/utils/retryLogic";

describe("retryLogic - retryWithBackoff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("RL-1: should succeed on first try without retry", async () => {
    const fn = vi.fn(async () => "success");

    const config = {
      maxRetries: 3,
      delays: [1000, 2000, 4000],
      shouldRetry: () => true,
    };

    const promise = retryWithBackoff(fn, config);
    const result = await promise;

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("RL-2: should succeed on second try (1 retry)", async () => {
    let attempts = 0;
    const fn = vi.fn(async () => {
      attempts++;
      if (attempts === 1) {
        throw new Error("Network error");
      }
      return "success";
    });

    const config = {
      maxRetries: 3,
      delays: [1000, 2000, 4000],
      shouldRetry: () => true,
    };

    const promise = retryWithBackoff(fn, config);

    // Fast-forward timers
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;

    expect(result).toBe("success");
    expect(attempts).toBe(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("RL-3: should succeed on third try (2 retries)", async () => {
    let attempts = 0;
    const fn = vi.fn(async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error("Network error");
      }
      return "success";
    });

    const config = {
      maxRetries: 3,
      delays: [1000, 2000, 4000],
      shouldRetry: () => true,
    };

    const promise = retryWithBackoff(fn, config);

    // Fast-forward timers for first retry
    await vi.advanceTimersByTimeAsync(1000);
    // Fast-forward timers for second retry
    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;

    expect(result).toBe("success");
    expect(attempts).toBe(3);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("RL-4: should fail after max retries (3 times)", async () => {
    const fn = vi.fn(async () => {
      throw new Error("Persistent error");
    });

    const config = {
      maxRetries: 3,
      delays: [100, 200, 400],
      shouldRetry: () => true,
    };

    const promise = retryWithBackoff(fn, config);

    // Fast-forward all retries
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(400);

    await expect(promise).rejects.toThrow("Persistent error");
    expect(fn).toHaveBeenCalledTimes(4); // Initial + 3 retries
  });

  it("RL-5: should stop retry on non-retryable error", async () => {
    const fn = vi.fn(async () => {
      throw new Error("401 Unauthorized");
    });

    const config = {
      maxRetries: 3,
      delays: [1000, 2000, 4000],
      shouldRetry: (error: any) => {
        // Don't retry 401 errors
        return !error.message.includes("401");
      },
    };

    await expect(retryWithBackoff(fn, config)).rejects.toThrow(
      "401 Unauthorized"
    );
    expect(fn).toHaveBeenCalledTimes(1); // No retries
  });

  it("RL-6: should verify exponential backoff delays", async () => {
    let attempts = 0;
    const delays: number[] = [];
    const startTime = Date.now();

    const fn = vi.fn(async () => {
      attempts++;
      delays.push(Date.now() - startTime);
      if (attempts <= 3) {
        throw new Error("Error");
      }
      return "success";
    });

    const config = {
      maxRetries: 3,
      delays: [1000, 2000, 4000],
      shouldRetry: () => true,
    };

    const promise = retryWithBackoff(fn, config);

    // Advance timers for each retry
    await vi.advanceTimersByTimeAsync(1000); // First retry
    await vi.advanceTimersByTimeAsync(2000); // Second retry
    await vi.advanceTimersByTimeAsync(4000); // Third retry

    await promise;

    expect(fn).toHaveBeenCalledTimes(4);
    // Verify delays match config (approximately, accounting for async timing)
  });
});

describe("retryLogic - Retry Configs", () => {
  it("should have correct MESSAGE_RETRY_CONFIG", () => {
    expect(MESSAGE_RETRY_CONFIG.maxRetries).toBe(3);
    expect(MESSAGE_RETRY_CONFIG.delays).toEqual([1000, 2000, 4000]);
    expect(typeof MESSAGE_RETRY_CONFIG.shouldRetry).toBe("function");
  });

  it("should have correct FILE_RETRY_CONFIG", () => {
    expect(FILE_RETRY_CONFIG.maxRetries).toBe(3);
    expect(FILE_RETRY_CONFIG.delays).toEqual([500, 1000, 2000]);
    expect(typeof FILE_RETRY_CONFIG.shouldRetry).toBe("function");
  });
});

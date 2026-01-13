import { describe, it, expect, vi, beforeEach } from "vitest";
import { retryWithBackoff, RetryConfig } from "../retryLogic";

describe("retryWithBackoff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls onRetry with retry count before each retry", async () => {
    // GIVEN: Function that fails 2 times then succeeds
    let attemptCount = 0;
    const fn = vi.fn(async () => {
      attemptCount++;
      if (attemptCount <= 2) {
        throw new Error("Simulated error");
      }
      return "success";
    });

    // GIVEN: Config with onRetry callback mock
    const onRetry = vi.fn();
    const config: RetryConfig = {
      maxRetries: 3,
      delays: [10, 20, 30], // Short delays for testing
      shouldRetry: () => true,
      onRetry, // NEW: onRetry callback
    };

    // WHEN: Call retryWithBackoff()
    const result = await retryWithBackoff(fn, config);

    // THEN: onRetry called with (1) after first fail
    expect(onRetry).toHaveBeenNthCalledWith(1, 1);

    // THEN: onRetry called with (2) after second fail
    expect(onRetry).toHaveBeenNthCalledWith(2, 2);

    // THEN: onRetry NOT called on success (retry 3)
    expect(onRetry).toHaveBeenCalledTimes(2);

    // Function succeeds on 3rd attempt
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not call onRetry on first attempt", async () => {
    // GIVEN: Function that fails once
    let attemptCount = 0;
    const fn = vi.fn(async () => {
      attemptCount++;
      if (attemptCount === 1) {
        throw new Error("Fail first");
      }
      return "success";
    });

    const onRetry = vi.fn();
    const config: RetryConfig = {
      maxRetries: 3,
      delays: [10],
      shouldRetry: () => true,
      onRetry,
    };

    // WHEN: Call retryWithBackoff()
    await retryWithBackoff(fn, config);

    // THEN: onRetry NOT called before first attempt (retry count = 0)
    // But called once after first failure (retry count = 1)
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1); // Called with retry count 1
  });

  it("works without onRetry callback (backward compatibility)", async () => {
    // GIVEN: Config without onRetry (optional parameter)
    const fn = vi.fn(async () => "success");
    const config: RetryConfig = {
      maxRetries: 3,
      delays: [10],
      shouldRetry: () => true,
      // NO onRetry
    };

    // WHEN: Call retryWithBackoff()
    const result = await retryWithBackoff(fn, config);

    // THEN: Function succeeds without errors
    expect(result).toBe("success");
  });
});

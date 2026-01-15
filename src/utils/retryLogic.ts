/**
 * Retry logic utilities with exponential backoff
 * For Phase 6 - Error handling & Persistence
 */

import { isRetryableError } from "./errorHandling";

export interface RetryConfig {
  maxRetries: number;
  delays: number[]; // Exponential backoff delays in milliseconds
  shouldRetry: (error: unknown) => boolean;
  onRetry?: (retryCount: number) => void; // NEW: Callback triggered before each retry
}

/**
 * Message send retry configuration
 * Max 3 retries with exponential backoff: 1s, 2s, 4s
 */
export const MESSAGE_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delays: [1000, 2000, 4000],
  shouldRetry: isRetryableError,
};

/**
 * File upload retry configuration
 * Max 3 retries with faster backoff: 500ms, 1s, 2s
 */
export const FILE_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delays: [500, 1000, 2000],
  shouldRetry: isRetryableError,
};

/**
 * Retry async function with exponential backoff
 * @param fn - Async function to retry
 * @param config - Retry configuration
 * @param currentRetry - Current retry attempt (internal use)
 * @returns Promise resolving to function result
 * @throws Error after max retries exceeded or non-retryable error
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  currentRetry: number = 0
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Check if should retry
    if (currentRetry >= config.maxRetries || !config.shouldRetry(error)) {
      throw error;
    }

    // Call onRetry callback before retry (if provided)
    const nextRetryCount = currentRetry + 1;
    if (config.onRetry) {
      config.onRetry(nextRetryCount);
    }

    // Wait before retry (exponential backoff)
    const delay =
      config.delays[currentRetry] || config.delays[config.delays.length - 1];
    await sleep(delay);

    // Retry recursively
    return retryWithBackoff(fn, config, nextRetryCount);
  }
}

/**
 * Sleep helper function
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

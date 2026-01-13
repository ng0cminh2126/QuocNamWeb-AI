import { useRef, useCallback } from "react";

interface UseSendTimeoutOptions {
  /**
   * Timeout duration in milliseconds
   * @default 10000 (10 seconds)
   */
  timeoutMs?: number;

  /**
   * Callback triggered when timeout expires
   */
  onTimeout?: () => void;
}

/**
 * Hook để quản lý timeout với AbortController cho message sending
 *
 * Features:
 * - Tạo AbortSignal để pass vào API call
 * - Tự động abort request sau timeoutMs
 * - Có thể cancel timeout trước khi hết hạn
 * - Có thể abort manually
 *
 * @param options - Timeout configuration
 * @returns {Object} Timeout controls
 * @returns {Function} startTimeout - Start timeout and return AbortSignal
 * @returns {Function} cancelTimeout - Cancel timeout before expiration
 * @returns {Function} abort - Abort both signal and timeout
 *
 * @example
 * const { startTimeout, cancelTimeout, abort } = useSendTimeout({
 *   timeoutMs: 10000,
 *   onTimeout: () => toast.error('Timeout')
 * });
 *
 * const signal = startTimeout();
 * sendMessage({ content, signal });
 *
 * // On success or error:
 * cancelTimeout();
 */
export function useSendTimeout({
  timeoutMs = 10000,
  onTimeout,
}: UseSendTimeoutOptions = {}) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start timeout and return AbortSignal
   */
  const startTimeout = useCallback((): AbortSignal => {
    // Clear any existing timeout/controller
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Set timeout
    timeoutIdRef.current = setTimeout(() => {
      controller.abort();
      if (onTimeout) {
        onTimeout();
      }
    }, timeoutMs);

    return controller.signal;
  }, [timeoutMs, onTimeout]);

  /**
   * Cancel timeout without aborting signal
   */
  const cancelTimeout = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  /**
   * Abort signal and cancel timeout
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    cancelTimeout();
  }, [cancelTimeout]);

  return {
    startTimeout,
    cancelTimeout,
    abort,
  };
}

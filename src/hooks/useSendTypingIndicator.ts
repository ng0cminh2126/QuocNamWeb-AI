// useSendTypingIndicator hook - Send typing indicator with debounce

import { useCallback, useRef } from "react";
import { chatHub } from "@/lib/signalr";

interface UseSendTypingIndicatorOptions {
  conversationId: string;
  debounceMs?: number;
}

/**
 * Hook to send typing indicator to a conversation
 * Includes debouncing to prevent excessive server calls
 */
export function useSendTypingIndicator({
  conversationId,
  debounceMs = 500,
}: UseSendTypingIndicatorOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const isTypingRef = useRef(false);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      chatHub.sendTyping(conversationId, isTyping);
    },
    [conversationId]
  );

  const handleTyping = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Send typing start if not already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping(true);
    }

    // Set timeout to send typing stop
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTyping(false);
    }, debounceMs);
  }, [sendTyping, debounceMs]);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTyping(false);
    }
  }, [sendTyping]);

  return {
    handleTyping,
    stopTyping,
  };
}

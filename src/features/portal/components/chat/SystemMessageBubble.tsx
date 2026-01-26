/**
 * SystemMessageBubble - System notification message component
 * Displays system messages (contentType = "SYS") in the center without sender info
 */

import React from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/messages";

export interface SystemMessageBubbleProps {
  message: ChatMessage;
  formatTime: (dateStr: string) => string;
}

export const SystemMessageBubble: React.FC<SystemMessageBubbleProps> = ({
  message,
  formatTime,
}) => {
  return (
    <div
      className="flex justify-center py-2"
      data-testid={`system-message-bubble-${message.id}`}
    >
      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
        <span className="text-gray-700">{message.content}</span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-500">{formatTime(message.sentAt)}</span>
      </div>
    </div>
  );
};

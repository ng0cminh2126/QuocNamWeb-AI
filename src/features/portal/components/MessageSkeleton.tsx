// MessageSkeleton - Loading skeleton for message list

import React from 'react';

interface MessageSkeletonProps {
  count?: number;
}

/**
 * Skeleton placeholder for message list
 * Shows animated placeholder while data is loading
 */
export const MessageSkeleton: React.FC<MessageSkeletonProps> = ({
  count = 8,
}) => {
  return (
    <div className="flex-1 p-4 space-y-4" data-testid="message-skeleton">
      {Array.from({ length: count }).map((_, i) => {
        // Alternate between sent and received styles
        const isRight = i % 3 === 0;
        
        return (
          <div
            key={i}
            className={`flex gap-3 animate-pulse ${isRight ? 'justify-end' : 'justify-start'}`}
            data-testid={`message-skeleton-${i}`}
          >
            {/* Avatar (only for received) */}
            {!isRight && (
              <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
            )}

            {/* Message bubble */}
            <div
              className={`max-w-[70%] space-y-2 ${isRight ? 'items-end' : 'items-start'}`}
            >
              {/* Sender name (only for received) */}
              {!isRight && (
                <div className="h-3 w-20 bg-gray-200 rounded" />
              )}

              {/* Message content */}
              <div
                className={`rounded-lg p-3 space-y-2 ${
                  isRight ? 'bg-brand-100' : 'bg-gray-200'
                }`}
              >
                <div className="h-3 w-32 bg-white/50 rounded" />
                {i % 2 === 0 && (
                  <div className="h-3 w-24 bg-white/50 rounded" />
                )}
              </div>

              {/* Time */}
              <div className="h-2 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;

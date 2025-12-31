// ConversationSkeleton - Loading skeleton for conversation list items

import React from 'react';

interface ConversationSkeletonProps {
  count?: number;
}

/**
 * Skeleton placeholder for conversation list items
 * Shows animated placeholder while data is loading
 */
export const ConversationSkeleton: React.FC<ConversationSkeletonProps> = ({
  count = 5,
}) => {
  return (
    <div className="p-2 space-y-1" data-testid="conversation-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2 rounded-lg animate-pulse"
          data-testid={`skeleton-item-${i}`}
        >
          {/* Avatar skeleton */}
          <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              {/* Name */}
              <div className="h-4 w-24 bg-gray-200 rounded" />
              {/* Time */}
              <div className="h-3 w-10 bg-gray-200 rounded" />
            </div>
            {/* Last message */}
            <div className="h-3 w-3/4 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationSkeleton;

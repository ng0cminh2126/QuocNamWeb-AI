/**
 * MessageBubbleSimple - Simple message bubble for API messages
 * Supports message grouping with dynamic border-radius
 */

import React from "react";
import { Pin, Star, StarOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import FileIcon from "@/components/FileIcon";
import MessageImage from "@/features/portal/workspace/MessageImage";
import { MessageStatusIndicator } from "@/components/MessageStatusIndicator";
import type { ChatMessage } from "@/types/messages";

/**
 * Format file size from bytes to human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get file extension from filename or MIME type
 */
function getFileExtension(fileName?: string, contentType?: string): string {
  // Try to get from filename first
  if (fileName) {
    const match = fileName.match(/\.(\w+)$/);
    if (match) return `.${match[1].toLowerCase()}`;
  }

  // Fallback to MIME type mapping
  if (contentType) {
    const mimeMap: Record<string, string> = {
      "application/pdf": ".pdf",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
      "application/vnd.ms-powerpoint": ".ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        ".pptx",
    };
    return mimeMap[contentType] || "";
  }

  return "";
}

export interface MessageBubbleSimpleProps {
  message: ChatMessage;
  isOwn: boolean;
  formatTime: (dateStr: string) => string;
  onFilePreviewClick?: (fileId: string, fileName: string) => void;
  onTogglePin?: (messageId: string, isPinned: boolean) => void;
  onToggleStar?: (messageId: string, isStarred: boolean) => void;
  onRetry?: (messageId: string) => void; // NEW: Retry failed message
  // Phase 4: Grouping props
  isFirstInGroup?: boolean;
  isMiddleInGroup?: boolean;
  isLastInGroup?: boolean;
}

export const MessageBubbleSimple: React.FC<MessageBubbleSimpleProps> = ({
  message,
  isOwn,
  formatTime,
  onTogglePin,
  onToggleStar,
  onFilePreviewClick,
  onRetry,
  isFirstInGroup = true,
  isMiddleInGroup = false,
  isLastInGroup = true,
}) => {
  // Phase 4: Dynamic border-radius based on grouping position
  const radiusBySide = isOwn
    ? cn(
        "rounded-2xl",
        !isFirstInGroup && "rounded-tr-md",
        !isLastInGroup && "rounded-br-md"
      )
    : cn(
        "rounded-2xl",
        !isFirstInGroup && "rounded-tl-md",
        !isLastInGroup && "rounded-bl-md"
      );

  return (
    <div
      className={cn(
        "flex gap-2",
        isOwn ? "justify-end" : "justify-start",
        isLastInGroup && "!mb-3" // Spacing between groups (0.75rem = 12px) - important to override parent space-y
      )}
    >
      {/* Avatar (only for received messages and first in group) */}
      {!isOwn && isFirstInGroup ? (
        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-brand-700">
            {message.senderName.charAt(0).toUpperCase()}
          </span>
        </div>
      ) : !isOwn ? (
        <div className="w-8 flex-shrink-0" />
      ) : null}

      <div
        className={`max-w-[70%] ${
          isOwn ? "items-end" : "items-start"
        } relative group`}
      >
        {/* Sender name and pin indicator (only for received and first in group) */}
        {!isOwn && isFirstInGroup && (
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs text-gray-500"
              data-testid="message-sender"
            >
              {message.senderName}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">
              {formatTime(message.sentAt)}
            </span>
            {message.isPinned && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                <Pin size={10} className="fill-amber-600" />
                Đã ghim
              </span>
            )}
            {message.isStarred && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 font-medium">
                <Star size={10} className="fill-blue-600" />
                Đã đánh dấu
              </span>
            )}
          </div>
        )}

        {/* Pin indicator for received messages (not first in group) */}
        {!isOwn && !isFirstInGroup && message.isPinned && (
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
              <Pin size={10} className="fill-amber-600" />
              Đã ghim
            </span>
          </div>
        )}

        {/* Timestamp for own messages (only first in group) */}
        {isOwn && isFirstInGroup && (
          <div className="flex justify-end mb-1">
            <span className="text-xs text-gray-500">
              {formatTime(message.sentAt)}
            </span>
          </div>
        )}

        {/* Pin indicator for own messages */}
        {isOwn && message.isPinned && (
          <div className="flex justify-end mb-1">
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
              <Pin size={10} className="fill-amber-600" />
              Đã ghim
            </span>
          </div>
        )}

        {/* Star indicator for own messages */}
        {isOwn && message.isStarred && (
          <div className="flex justify-end mb-1">
            <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 font-medium">
              <Star size={10} className="fill-blue-600" />
              Đã đánh dấu
            </span>
          </div>
        )}

        {/* Hover action buttons */}
        {(onTogglePin || onToggleStar) && (
          <div
            className={cn(
              "absolute -top-8 flex items-center gap-1 rounded-lg border border-gray-200 bg-white shadow-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10",
              isOwn ? "right-0" : "left-0"
            )}
          >
            {onTogglePin && (
              <button
                className={cn(
                  "p-1.5 rounded transition",
                  message.isPinned
                    ? "text-amber-600 hover:text-amber-700"
                    : "text-gray-500 hover:text-amber-600"
                )}
                onClick={() => onTogglePin(message.id, message.isPinned)}
                title={message.isPinned ? "Bỏ ghim tin nhắn" : "Ghim tin nhắn"}
                data-testid="toggle-pin-button"
              >
                {message.isPinned ? (
                  <Pin size={14} className="fill-amber-600" />
                ) : (
                  <Pin size={14} />
                )}
              </button>
            )}
            {onToggleStar && (
              <button
                className={cn(
                  "p-1.5 rounded transition",
                  message.isStarred
                    ? "text-amber-600 hover:text-amber-700"
                    : "text-gray-500 hover:text-amber-600"
                )}
                onClick={() => onToggleStar(message.id, message.isStarred)}
                title={message.isStarred ? "Bỏ đánh dấu" : "Đánh dấu"}
                data-testid="toggle-star-button"
              >
                {message.isStarred ? <StarOff size={14} /> : <Star size={14} />}
              </button>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "overflow-hidden",
            radiusBySide,
            // Failed state styling
            message.sendStatus === "failed"
              ? "bg-red-50/50 border-2 border-red-400"
              : isOwn
              ? "bg-brand-600 text-white"
              : "bg-white text-gray-900 shadow-sm",
            // Pin/Star borders (override failed state)
            message.isPinned && message.sendStatus !== "failed"
              ? "border-2 border-amber-400"
              : message.isStarred && message.sendStatus !== "failed"
              ? "border-2 border-blue-400"
              : message.sendStatus !== "failed" && "border",
            // Opacity for sending/retrying
            (message.sendStatus === "sending" ||
              message.sendStatus === "retrying") &&
              "opacity-90"
          )}
          data-testid={`message-bubble-${message.id}`}
        >
          {/* Helper: Check if message has text, image, or file */}
          {(() => {
            const hasText =
              message.content && message.content.trim().length > 0;
            const hasImage =
              message.attachments &&
              message.attachments.length > 0 &&
              message.attachments[0].contentType?.startsWith("image/");
            const hasFile =
              message.attachments &&
              message.attachments.length > 0 &&
              !hasImage;
            const hasMixedContent = hasText && hasImage;
            const hasMixedTextFile = hasText && hasFile;

            return (
              <>
                {/* Text content - with v2.1 padding for mixed content */}
                {hasText && (
                  <div
                    className={
                      hasMixedContent || hasMixedTextFile
                        ? "px-4 pt-2 pb-2"
                        : "px-4 py-2"
                    }
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                )}

                {/* Gap between text and image/file - Increased spacing */}
                {(hasMixedContent || hasMixedTextFile) && (
                  <div className="h-3" />
                )}

                {/* Image attachment - Using MessageImage component */}
                {hasImage && (
                  <MessageImage
                    fileId={message.attachments[0].fileId}
                    fileName={message.attachments[0].fileName || "Image"}
                    onPreviewClick={(fileId) => {
                      onFilePreviewClick?.(
                        fileId,
                        message.attachments[0].fileName || "Image"
                      );
                    }}
                  />
                )}

                {/* File attachment - v3.2: All file types clickable for preview */}
                {hasFile && (
                  <div
                    className={cn(
                      "flex items-center gap-3 cursor-pointer hover:bg-black/5 transition-colors",
                      hasText ? "px-4 pb-4" : "px-4 py-4"
                    )}
                    data-testid={`message-file-attachment-${message.attachments[0].fileId}`}
                    onClick={() => {
                      onFilePreviewClick?.(
                        message.attachments[0].fileId,
                        message.attachments[0].fileName || "document"
                      );
                    }}
                  >
                    {/* Icon container with white background for visibility */}
                    <div className="bg-white rounded-lg p-2 shadow-sm">
                      <FileIcon
                        contentType={
                          message.attachments[0].contentType ||
                          "application/octet-stream"
                        }
                        size="md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {message.attachments[0].fileName || "File"}
                      </p>
                      <div
                        className={cn(
                          "flex items-center gap-2 text-xs",
                          isOwn ? "text-white/80" : "text-gray-600"
                        )}
                      >
                        {message.attachments[0].fileSize && (
                          <span>
                            {formatFileSize(message.attachments[0].fileSize)}
                          </span>
                        )}
                        {getFileExtension(
                          message.attachments[0].fileName ?? undefined,
                          message.attachments[0].contentType ?? undefined
                        ) && (
                          <>
                            {message.attachments[0].fileSize && <span>•</span>}
                            <span className="font-medium uppercase">
                              {getFileExtension(
                                message.attachments[0].fileName ?? undefined,
                                message.attachments[0].contentType ?? undefined
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Time or Status Indicator (only for last message in group and own messages) */}
        {isLastInGroup && isOwn && (
          <div className={cn("mt-1.5 mb-1", "flex justify-end")}>
            <MessageStatusIndicator
              status={message.sendStatus || "sent"}
              retryCount={message.retryCount}
              errorMessage={message.failReason}
              timestamp={formatTime(message.sentAt)}
            />
          </div>
        )}

        {/* Retry button (below bubble, only for failed messages) */}
        {message.sendStatus === "failed" && onRetry && (
          <div
            className={cn(
              "mt-2",
              isOwn ? "flex justify-end" : "flex justify-start"
            )}
          >
            <button
              onClick={() => onRetry(message.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                "text-xs font-medium transition-colors",
                "bg-blue-500 text-white hover:bg-blue-600",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
              data-testid="retry-button"
            >
              <RefreshCw className="h-3 w-3" />
              Thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubbleSimple;

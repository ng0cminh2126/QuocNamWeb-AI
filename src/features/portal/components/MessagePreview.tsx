import type { LastMessage } from "@/types/conversations";

interface MessagePreviewProps {
  lastMessage: LastMessage | null;
  maxLength?: number;
  className?: string;
}

/**
 * Component hiển thị preview của tin nhắn cuối cùng
 *
 * v2.1 Updates:
 * - IMG: "SenderName: Đã gửi một ảnh"
 * - FILE: "SenderName: Đã gửi [filename]"
 * - TXT: "SenderName: content..."
 * - TASK: "SenderName: 📋 Task"
 *
 * @param lastMessage - Last message object từ API
 * @param maxLength - Độ dài tối đa trước khi truncate (default: 50)
 *
 * @example
 * ```tsx
 * <MessagePreview lastMessage={conversation.lastMessage} />
 * ```
 */
export default function MessagePreview({
  lastMessage,
  maxLength = 50,
  className,
}: MessagePreviewProps) {
  if (!lastMessage) {
    return (
      <span className={className} data-testid="message-preview">
        Chưa có tin nhắn
      </span>
    );
  }

  const { senderName, contentType, content, attachments } = lastMessage;

  let previewText = "";

  // Priority 1: If has text content, show it
  if (content && content.trim().length > 0) {
    previewText = content.trim();
  }
  // Priority 2: Check attachments
  else if (
    attachments &&
    Array.isArray(attachments) &&
    attachments.length > 0
  ) {
    const firstAttachment = attachments[0] as any;

    // Check if image based on MIME type or contentType
    const isImage =
      firstAttachment?.contentType?.toLowerCase().startsWith("image/") ||
      firstAttachment?.mimeType?.toLowerCase().startsWith("image/");

    if (isImage) {
      // Multiple images
      if (attachments.length > 1) {
        previewText = `Đã gửi ${attachments.length} ảnh`;
      } else {
        previewText = "Đã gửi một ảnh";
      }
    } else {
      // File attachment
      const filename =
        firstAttachment?.fileName || firstAttachment?.name || "file";
      previewText = `Đã gửi ${filename}`;
    }
  }
  // Priority 3: Check contentType for special types
  else if (contentType === "TASK") {
    previewText = "📋 Task";
  }
  // Fallback
  else {
    previewText = content || "";
  }

  // Build full text first
  const fullText = `${senderName}: ${previewText}`;

  // Then truncate if needed
  const displayText =
    fullText.length > maxLength
      ? fullText.substring(0, maxLength) + "..."
      : fullText;

  return (
    <span className={className} data-testid="message-preview" title={fullText}>
      {displayText}
    </span>
  );
}

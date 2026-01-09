import type { Message } from "@/types/messages";
import type { FileAttachment } from "@/types/files";

/**
 * Maximum preview text length
 */
const MAX_PREVIEW_LENGTH = 50;

/**
 * Truncate text to max length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
}

/**
 * Get file name from attachment
 */
function getFileName(attachment: FileAttachment): string {
  return attachment.name || attachment.originalName || "file";
}

/**
 * Check if attachment is an image based on content type
 */
function isImageAttachment(attachment: FileAttachment): boolean {
  if (!attachment.mimeType) {
    return false;
  }

  const imageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return imageTypes.includes(attachment.mimeType.toLowerCase().trim());
}

/**
 * Generate preview text for conversation list
 *
 * Rules:
 * - If message has text content: show text (truncated to 50 chars)
 * - If message has only images: show "Đã gửi một ảnh" (or count if multiple)
 * - If message has only files: show "Đã gửi [filename]" (truncated to 50 chars)
 * - If message has both text and attachments: show text content
 */
export function getMessagePreviewText(message: Message): string {
  // If has text content, return it (truncated)
  if (message.content && message.content.trim().length > 0) {
    return truncateText(message.content.trim(), MAX_PREVIEW_LENGTH);
  }

  // If no attachments, return empty string
  if (!message.attachments || message.attachments.length === 0) {
    return "";
  }

  const attachments = message.attachments;
  const imageCount = attachments.filter(isImageAttachment).length;
  const fileCount = attachments.length - imageCount;

  // Case 1: Only images
  if (imageCount > 0 && fileCount === 0) {
    if (imageCount === 1) {
      return "Đã gửi một ảnh";
    }
    return `Đã gửi ${imageCount} ảnh`;
  }

  // Case 2: Only files (no images)
  if (fileCount > 0 && imageCount === 0) {
    const firstFile = attachments.find((att) => !isImageAttachment(att));
    if (firstFile) {
      const fileName = getFileName(firstFile);
      return truncateText(`Đã gửi ${fileName}`, MAX_PREVIEW_LENGTH);
    }
    return "Đã gửi file";
  }

  // Case 3: Mixed (both images and files)
  // Show first attachment type
  const firstAttachment = attachments[0];
  if (isImageAttachment(firstAttachment)) {
    return "Đã gửi một ảnh";
  } else {
    const fileName = getFileName(firstAttachment);
    return truncateText(`Đã gửi ${fileName}`, MAX_PREVIEW_LENGTH);
  }
}

import type { LastMessageDto } from "@/types/categories";

/**
 * Truncate filename to max length, keeping extension
 *
 * @param filename - Full filename with extension
 * @param maxLength - Maximum length for filename (excluding extension)
 * @returns Truncated filename
 *
 * @example
 * truncateFilename('report.pdf', 20) // "report.pdf"
 * truncateFilename('project_final_report_v3_updated.pdf', 20) // "project_final_r...pdf"
 */
function truncateFilename(filename: string, maxLength: number = 20): string {
  const lastDotIndex = filename.lastIndexOf(".");

  // No extension or filename is short enough
  if (lastDotIndex === -1 || filename.length <= maxLength + 5) {
    return filename;
  }

  const name = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex);

  // If name is short enough, return as is
  if (name.length <= maxLength) {
    return filename;
  }

  // Truncate: keep first 15 chars + "..." + extension
  const truncatedName = name.substring(0, 15);
  return `${truncatedName}...${extension}`;
}

/**
 * Format message preview based on content and attachments
 * Handles different message types: text, images, files, mixed
 *
 * @param message - Last message DTO with sender and content info
 * @returns Formatted preview string
 *
 * @example
 * // Text message
 * formatMessagePreview({
 *   senderName: 'John',
 *   content: 'Hello world',
 *   attachments: []
 * }) // "John: Hello world"
 *
 * // Single image
 * formatMessagePreview({
 *   senderName: 'Jane',
 *   content: '',
 *   attachments: [{ type: 'image', name: 'photo.jpg' }]
 * }) // "Jane: đã gửi 1 ảnh"
 *
 * // Multiple files
 * formatMessagePreview({
 *   senderName: 'Mike',
 *   content: '',
 *   attachments: [
 *     { type: 'file', name: 'doc1.pdf' },
 *     { type: 'file', name: 'doc2.pdf' }
 *   ]
 * }) // "Mike: đã gửi 2 tệp"
 */
export function formatMessagePreview(
  message: LastMessageDto & { attachments?: any[] },
): string {
  const { senderName, content, attachments } = message;

  // 🐛 DEBUG: Log để xem structure của message
  // console.log("[formatMessagePreview] Debug:", {
  //   senderName,
  //   content,
  //   attachments,
  //   fullMessage: message,
  // });

  // Case 1: Has attachments (check first before text)
  if (attachments && attachments.length > 0) {
    const images = attachments.filter(
      (a) =>
        a.type === "image" ||
        a.type === "IMG" ||
        a.contentType?.startsWith("image/"),
    );
    const files = attachments.filter(
      (a) =>
        a.type === "file" ||
        a.type === "FILE" ||
        (!a.contentType?.startsWith("image/") &&
          a.type !== "image" &&
          a.type !== "IMG"),
    );

    // Case 1a: Attachments with text caption
    if (content && content.trim().length > 0) {
      return `${senderName}: ${content}`;
    }

    // Case 1b: Only images (no text)
    if (images.length > 0 && files.length === 0) {
      return images.length === 1
        ? `${senderName}: đã gửi 1 ảnh`
        : `${senderName}: đã gửi ${images.length} ảnh`;
    }

    // Case 1c: Only files (no text)
    if (files.length > 0 && images.length === 0) {
      if (files.length === 1) {
        const filename = files[0].name || files[0].fileName || "file";
        return `${senderName}: đã gửi tệp ${truncateFilename(filename)}`;
      }
      return `${senderName}: đã gửi ${files.length} tệp`;
    }

    // Case 1d: Mixed attachments (images + files)
    const total = attachments.length;
    return `${senderName}: đã gửi ${total} tệp đính kèm`;
  }

  // Case 2: No attachments - text only or empty
  return content && content.trim().length > 0
    ? `${senderName}: ${content}`
    : `${senderName}: ...`;
}

/**
 * File Extraction Utility
 * Extract attachments from messages and create ExtractedFile objects
 * @module utils/fileExtraction
 */

import type { MessageDto, ExtractedFile, ViewFileType } from '@/types/files';

/**
 * Extract files from messages based on type
 * @param messages - Array of messages from API
 * @param type - 'media' for images/videos or 'docs' for documents
 * @returns Array of ExtractedFile objects
 * 
 * @example
 * const mediaFiles = extractFilesFromMessages(messages, 'media');
 * const docFiles = extractFilesFromMessages(messages, 'docs');
 */
export function extractFilesFromMessages(
  messages: MessageDto[],
  type: ViewFileType = 'media'
): ExtractedFile[] {
  const files: ExtractedFile[] = [];

  messages.forEach((msg) => {
    msg.attachments?.forEach((att) => {
      const isMedia =
        att.contentType.startsWith('image/') ||
        att.contentType.startsWith('video/');

      // Only include files matching the requested type
      if ((type === 'media' && isMedia) || (type === 'docs' && !isMedia)) {
        files.push({
          id: att.fileId,
          name: att.fileName,
          url: `/api/files/${att.fileId}`,
          thumbnailUrl: att.thumbnailUrl,
          size: att.fileSize,
          contentType: att.contentType,
          uploadedAt: att.uploadedAt,
          senderId: msg.senderId,
          senderName: msg.senderName,
          messageId: msg.id,
          dimensions: att.dimensions,
          duration: att.duration,
        });
      }
    });
  });

  return files;
}

/**
 * Extract all files from messages (both media and docs)
 * @param messages - Array of messages from API
 * @returns Array of all ExtractedFile objects
 */
export function extractAllFilesFromMessages(messages: MessageDto[]): ExtractedFile[] {
  const files: ExtractedFile[] = [];

  messages.forEach((msg) => {
    msg.attachments?.forEach((att) => {
      files.push({
        id: att.fileId,
        name: att.fileName,
        url: `/api/files/${att.fileId}`,
        thumbnailUrl: att.thumbnailUrl,
        size: att.fileSize,
        contentType: att.contentType,
        uploadedAt: att.uploadedAt,
        senderId: msg.senderId,
        senderName: msg.senderName,
        messageId: msg.id,
        dimensions: att.dimensions,
        duration: att.duration,
      });
    });
  });

  return files;
}

/**
 * Filter media files (images and videos)
 * @param files - Array of extracted files
 * @returns Only media files
 */
export function getMediaFiles(files: ExtractedFile[]): ExtractedFile[] {
  return files.filter(
    (f) =>
      f.contentType.startsWith('image/') || f.contentType.startsWith('video/')
  );
}

/**
 * Filter document files
 * @param files - Array of extracted files
 * @returns Only document files
 */
export function getDocumentFiles(files: ExtractedFile[]): ExtractedFile[] {
  return files.filter(
    (f) =>
      !f.contentType.startsWith('image/') && !f.contentType.startsWith('video/')
  );
}

/**
 * Check if file is media (image or video)
 * @param file - File to check
 * @returns true if media file
 */
export function isMediaFile(file: ExtractedFile): boolean {
  return (
    file.contentType.startsWith('image/') || file.contentType.startsWith('video/')
  );
}

/**
 * Check if file is a specific type
 * @param file - File to check
 * @param type - Type to check for ('image', 'video', 'pdf', 'word', 'excel', 'powerpoint')
 * @returns true if file matches type
 */
export function isFileType(file: ExtractedFile, type: string): boolean {
  switch (type) {
    case 'image':
      return file.contentType.startsWith('image/');
    case 'video':
      return file.contentType.startsWith('video/');
    case 'pdf':
      return file.contentType === 'application/pdf';
    case 'word':
      return file.contentType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.contentType === 'application/msword';
    case 'excel':
      return file.contentType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.contentType === 'application/vnd.ms-excel';
    case 'powerpoint':
      return file.contentType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        file.contentType === 'application/vnd.ms-powerpoint';
    default:
      return false;
  }
}

/**
 * Get file extension from content type
 * @param contentType - MIME type
 * @returns File extension (without dot)
 */
export function getFileExtension(contentType: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      'pptx',
    'application/vnd.ms-powerpoint': 'ppt',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/json': 'json',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
  };

  return map[contentType] || 'file';
}

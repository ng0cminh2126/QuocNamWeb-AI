/**
 * File helper utilities for file upload feature
 */

import type { SelectedFile } from "@/types/files";

/**
 * Format file size to human-readable string
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file icon based on MIME type
 * @param mimeType MIME type of the file
 * @returns Emoji icon
 */
export function getFileIcon(mimeType: string): string {
  const iconMap: Record<string, string> = {
    // PDFs
    "application/pdf": "📄",

    // Excel
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
    "application/vnd.ms-excel": "📊",

    // Word
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "📝",
    "application/msword": "📝",

    // Images
    "image/jpeg": "🖼️",
    "image/png": "🖼️",
    "image/gif": "🖼️",
    "image/webp": "🖼️",
  };

  return iconMap[mimeType] || "📎";
}

/**
 * Truncate filename if too long
 * @param fileName Original filename
 * @param maxLength Maximum length (default: 40)
 * @returns Truncated filename with extension preserved
 */
export function truncateFileName(
  fileName: string,
  maxLength: number = 40
): string {
  if (fileName.length <= maxLength) return fileName;

  const extension = fileName.split(".").pop() || "";
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));

  if (nameWithoutExt.length <= maxLength - extension.length - 3) {
    return fileName;
  }

  const truncatedName = nameWithoutExt.substring(
    0,
    maxLength - extension.length - 3
  );
  return `${truncatedName}...${extension}`;
}

/**
 * Generate unique ID for selected file
 * @returns Unique ID string
 */
export function generateFileId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if file is an image
 * @param mimeType MIME type of the file
 * @returns True if file is an image
 */
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

/**
 * Create File object preview URL (for images)
 * @param file File object
 * @returns Object URL or undefined if not an image
 */
export function createFilePreview(file: File): string | undefined {
  if (!isImage(file.type)) return undefined;
  return URL.createObjectURL(file);
}

/**
 * Revoke File object preview URL to free memory
 * @param url Object URL to revoke
 */
export function revokeFilePreview(url: string | undefined): void {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Convert File to SelectedFile with preview
 * @param file File object
 * @returns SelectedFile object
 */
export function fileToSelectedFile(file: File): SelectedFile {
  return {
    file,
    id: generateFileId(),
    preview: createFilePreview(file),
  };
}

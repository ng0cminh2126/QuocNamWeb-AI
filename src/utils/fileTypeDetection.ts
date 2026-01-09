/**
 * File Type Detection Utility
 *
 * Detects if a file is an image based on its MIME type.
 * Used to route attachments to MessageImage vs MessageAttachment components.
 */

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];

/**
 * Check if contentType is an image MIME type
 *
 * @param contentType - MIME type string from attachment
 * @returns true if image, false otherwise
 *
 * @example
 * isImageFile('image/jpeg') // true
 * isImageFile('application/pdf') // false
 * isImageFile('IMAGE/PNG') // true (case-insensitive)
 */
export function isImageFile(contentType: string): boolean {
  if (!contentType) return false;

  const normalized = contentType.toLowerCase().trim();
  return IMAGE_MIME_TYPES.some((type) => normalized.includes(type));
}

/**
 * Get file category (image or file)
 *
 * @param contentType - MIME type string
 * @returns 'image' or 'file'
 */
export function getFileCategory(contentType: string): "image" | "file" {
  return isImageFile(contentType) ? "image" : "file";
}

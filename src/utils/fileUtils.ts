/**
 * File Utility Functions
 *
 * Helper functions for file type detection and validation.
 * Used by FilePreviewModal for determining file type from filename.
 *
 * @module utils/fileUtils
 */

import {
  SUPPORTED_FILE_EXTENSIONS,
  type SupportedPreviewFileType,
} from "@/types/files";

/**
 * Determine file type from filename extension
 *
 * @param filename - File name with extension (e.g., "document.docx")
 * @returns File type category (pdf, word, excel, powerpoint, text, image)
 * @example
 * getFileType("report.docx") // Returns "word"
 * getFileType("data.xlsx") // Returns "excel"
 * getFileType("photo.jpg") // Returns "image"
 */
export function getFileType(filename: string): SupportedPreviewFileType {
  const ext = filename.toLowerCase().split(".").pop() || "";
  const extWithDot = `.${ext}`;

  for (const [type, extensions] of Object.entries(SUPPORTED_FILE_EXTENSIONS)) {
    if (extensions.includes(extWithDot)) {
      return type as SupportedPreviewFileType;
    }
  }

  // Default fallback to image if no match found
  return "image";
}

/**
 * Check if a document has multiple pages
 *
 * @param totalPages - Total number of pages from API response
 * @returns True if document has more than 1 page
 * @example
 * isMultiPageDocument(5) // Returns true
 * isMultiPageDocument(1) // Returns false
 */
export function isMultiPageDocument(totalPages: number): boolean {
  return totalPages > 1;
}

/**
 * Check if file extension is supported for preview
 *
 * @param filename - File name with extension
 * @returns True if file type is supported
 * @example
 * isSupportedFileType("document.docx") // Returns true
 * isSupportedFileType("video.mp4") // Returns false
 */
export function isSupportedFileType(filename: string): boolean {
  const ext = filename.toLowerCase().split(".").pop() || "";
  const extWithDot = `.${ext}`;

  return Object.values(SUPPORTED_FILE_EXTENSIONS).some((extensions) =>
    extensions.includes(extWithDot)
  );
}

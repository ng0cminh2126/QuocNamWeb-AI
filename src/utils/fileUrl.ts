/**
 * File URL utilities
 * Build URLs for downloading/viewing files from Vega File API
 */

/**
 * Get File API base URL based on environment
 */
function getFileApiBaseUrl(): string {
  const mode = import.meta.env.MODE;

  if (mode === "production") {
    return (
      import.meta.env.VITE_PROD_FILE_API_URL ||
      "https://vega-file-api.allianceitsc.com"
    );
  }

  return (
    import.meta.env.VITE_DEV_FILE_API_URL ||
    "https://vega-file-api-dev.allianceitsc.com"
  );
}

/**
 * Build file download URL from fileId
 *
 * TODO: Verify exact endpoint when backend provides GET file endpoint
 * Current assumption: GET /api/Files/{fileId}
 *
 * @param fileId - File ID from upload result
 * @returns Full URL to download/view file
 *
 * @example
 * ```typescript
 * const url = getFileUrl('3fa85f64-5717-4562-b3fc-2c963f66afa6');
 * // Returns: https://vega-file-api-dev.allianceitsc.com/api/Files/3fa85f64-5717-4562-b3fc-2c963f66afa6
 * ```
 */
export function getFileUrl(fileId: string): string {
  const baseUrl = getFileApiBaseUrl();
  return `${baseUrl}/api/Files/${fileId}`;
}

/**
 * Build file thumbnail URL (if supported by backend)
 *
 * TODO: Implement when thumbnail endpoint is available
 *
 * @param fileId - File ID
 * @returns Thumbnail URL or null if not supported
 */
export function getFileThumbnailUrl(fileId: string): string | null {
  // TODO: Implement thumbnail endpoint when available
  // Example: return `${baseUrl}/api/Files/${fileId}/thumbnail`;
  return null;
}

/**
 * Check if file type supports inline preview (image, pdf, etc.)
 *
 * @param contentType - MIME type
 * @returns True if file can be previewed inline
 */
export function isPreviewableFile(contentType: string | null): boolean {
  if (!contentType) return false;

  const previewableTypes = [
    "image/",
    "application/pdf",
    "text/",
    "video/",
    "audio/",
  ];

  return previewableTypes.some((type) => contentType.startsWith(type));
}

/**
 * Get file icon name based on content type
 *
 * @param contentType - MIME type
 * @returns Icon identifier (can be used with icon library)
 */
export function getFileIcon(
  contentType: string | null
): "file" | "image" | "video" | "audio" | "pdf" | "archive" | "document" {
  if (!contentType) return "file";

  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";
  if (contentType === "application/pdf") return "pdf";
  if (
    contentType.includes("zip") ||
    contentType.includes("archive") ||
    contentType.includes("compressed")
  )
    return "archive";
  if (
    contentType.includes("word") ||
    contentType.includes("document") ||
    contentType.includes("text")
  )
    return "document";

  return "file";
}

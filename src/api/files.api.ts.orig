import { fileApiClient } from "./fileClient";
import type { UploadFileResult } from "@/types/files";

/**
 * Parameters for uploading a file
 */
export interface UploadFileParams {
  /** The file to upload */
  file: File;
  /** Source module (0=Task, 1=Chat, 2=Company, 3=User) */
  sourceModule: number;
  /** Optional source entity ID (e.g., conversationId for Chat) */
  sourceEntityId?: string;
  /** Optional callback for upload progress tracking */
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
}

/**
 * Upload a single file to Vega File API
 *
 * @param params Upload parameters
 * @returns Upload result with fileId
 * @throws Error if upload fails (401, 400, 413, 415, network error)
 *
 * @example
 * ```typescript
 * const result = await uploadFile({
 *   file: myFile,
 *   sourceModule: 1, // Chat
 *   sourceEntityId: conversationId,
 *   onUploadProgress: (e) => {
 *     const progress = Math.round((e.loaded * 100) / e.total);
 *     console.log(`Upload progress: ${progress}%`);
 *   }
 * });
 *
 * console.log('File ID:', result.fileId);
 * ```
 */
export async function uploadFile(
  params: UploadFileParams
): Promise<UploadFileResult> {
  const { file, sourceModule, sourceEntityId, onUploadProgress } = params;

  // Create FormData
  const formData = new FormData();
  formData.append("file", file);

  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.append("sourceModule", sourceModule.toString());

  if (sourceEntityId) {
    queryParams.append("sourceEntityId", sourceEntityId);
  }

  // Upload file
  const response = await fileApiClient.post<UploadFileResult>(
    `/api/Files?${queryParams.toString()}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onUploadProgress as any,
    }
  );

  return response.data;
}

/**
 * Get watermarked thumbnail image for a file
 *
 * @param fileId File ID
 * @param size Thumbnail size (small=200px, medium=300px, large=400px)
 * @returns Blob containing watermarked thumbnail image
 * @throws Error if file not found (404) or network error
 *
 * @example
 * ```typescript
 * const thumbnailBlob = await getImageThumbnail('file-123', 'large');
 * const blobUrl = URL.createObjectURL(thumbnailBlob);
 * // Use blobUrl in <img src={blobUrl} />
 * // Remember to revoke: URL.revokeObjectURL(blobUrl)
 * ```
 */
export async function getImageThumbnail(
  fileId: string,
  size: "small" | "medium" | "large" = "large"
): Promise<Blob> {
  const response = await fileApiClient.get(
    `/api/Files/${fileId}/watermarked-thumbnail`,
    {
      params: { size },
      responseType: "blob",
      timeout: 30000, // 30s timeout for image loading
    }
  );

  return response.data;
}

/**
 * Get watermarked preview (full-size) image for a file
 *
 * @param fileId File ID
 * @returns Blob containing watermarked full-size image
 * @throws Error if file not found (404) or network error
 *
 * @example
 * ```typescript
 * const previewBlob = await getImagePreview('file-123');
 * const blobUrl = URL.createObjectURL(previewBlob);
 * // Use blobUrl in modal preview
 * // Remember to revoke: URL.revokeObjectURL(blobUrl)
 * ```
 */
export async function getImagePreview(fileId: string): Promise<Blob> {
  const response = await fileApiClient.get(`/api/Files/${fileId}/preview`, {
    responseType: "blob",
    timeout: 30000, // 30s timeout for image loading
  });

  return response.data;
}

/**
 * Create blob URL from blob data
 * Remember to revoke URL when done to prevent memory leaks
 *
 * @param blob Blob data
 * @returns Object URL string
 *
 * @example
 * ```typescript
 * const blob = await getImageThumbnail('file-123');
 * const blobUrl = createBlobUrl(blob);
 * // Use in <img src={blobUrl} />
 * // Cleanup when done: revokeBlobUrl(blobUrl)
 * ```
 */
export function createBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke blob URL to free memory
 * Should be called when blob URL is no longer needed
 *
 * @param url Object URL to revoke
 *
 * @example
 * ```typescript
 * useEffect(() => {
 *   const blobUrl = createBlobUrl(blob);
 *   return () => revokeBlobUrl(blobUrl); // Cleanup
 * }, [blob]);
 * ```
 */
export function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}

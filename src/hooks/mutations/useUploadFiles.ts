import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFile } from "@/api/files.api";
import type { SelectedFile, UploadFileResult } from "@/types/files";

/**
 * Parameters for uploading multiple files
 */
export interface UploadFilesParams {
  /** Array of files to upload */
  files: SelectedFile[];
  /** Source module (0=Task, 1=Chat, 2=Company, 3=User) */
  sourceModule: number;
  /** Optional source entity ID (e.g., conversationId) */
  sourceEntityId?: string;
  /** Optional callback for progress tracking per file */
  onProgress?: (fileId: string, progress: number) => void;
}

/**
 * Uploaded file data including original file and upload result
 *
 * @since 2026-01-07 - Updated to include full file metadata for attachment formatting
 */
export interface UploadedFileData {
  /** Original File object selected by user */
  originalFile: File;
  /** Upload result from API including fileId and metadata */
  uploadResult: UploadFileResult;
}

/**
 * Result after uploading multiple files
 *
 * @since 2026-01-07 - Changed from fileIds array to full file data for attachment support
 */
export interface UploadFilesResult {
  /** Array of successfully uploaded files with full metadata */
  files: UploadedFileData[];
  /** Number of successful uploads */
  successCount: number;
  /** Number of failed uploads */
  failedCount: number;
  /** Array of errors for failed uploads */
  errors: Array<{ file: SelectedFile; error: string }>;
}

/**
 * Hook to upload multiple files sequentially to Vega File API
 *
 * Files are uploaded one-by-one because API only accepts 1 file per request.
 * Progress is tracked per file, errors are collected, and fileIds are returned.
 *
 * @example
 * ```typescript
 * const uploadFiles = useUploadFiles();
 *
 * const handleUpload = async () => {
 *   const result = await uploadFiles.mutateAsync({
 *     files: selectedFiles,
 *     sourceModule: 1, // Chat
 *     sourceEntityId: conversationId,
 *     onProgress: (fileId, progress) => {
 *       console.log(`File ${fileId}: ${progress}%`);
 *     },
 *   });
 *
 *   // Updated: result.files instead of result.fileIds
 *   console.log('Uploaded files:', result.files);
 *   console.log('Success:', result.successCount, 'Failed:', result.failedCount);
 *
 *   // Access file metadata for attachments
 *   const attachments = result.files.map(({ originalFile, uploadResult }) => ({
 *     fileId: uploadResult.fileId,
 *     fileName: originalFile.name,
 *     fileSize: originalFile.size,
 *     contentType: originalFile.type,
 *   }));
 * };
 * ```
 */
export function useUploadFiles() {
  return useMutation({
    mutationFn: async (
      params: UploadFilesParams
    ): Promise<UploadFilesResult> => {
      const { files, sourceModule, sourceEntityId, onProgress } = params;

      const uploadedFiles: UploadedFileData[] = [];
      const errors: Array<{ file: SelectedFile; error: string }> = [];

      // Upload files sequentially (one-by-one)
      for (const selectedFile of files) {
        try {
          // Upload single file
          const result: UploadFileResult = await uploadFile({
            file: selectedFile.file,
            sourceModule,
            sourceEntityId,
            onUploadProgress: (progressEvent) => {
              // Calculate progress percentage
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );

              // Call progress callback
              onProgress?.(selectedFile.id, progress);
            },
          });

          // Collect successful upload with full file data
          uploadedFiles.push({
            originalFile: selectedFile.file,
            uploadResult: result,
          });
        } catch (error: any) {
          // Extract error message
          const errorMessage =
            error.response?.data?.detail || error.message || "Upload failed";

          // Collect error
          errors.push({
            file: selectedFile,
            error: errorMessage,
          });

          // Show error toast
          toast.error(`Lỗi upload ${selectedFile.file.name}`, {
            description: errorMessage,
          });
        }
      }

      return {
        files: uploadedFiles,
        successCount: uploadedFiles.length,
        failedCount: errors.length,
        errors,
      };
    },
  });
}

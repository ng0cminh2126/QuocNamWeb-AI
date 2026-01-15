import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { uploadFilesBatch } from "@/api/files.api";
import type { BatchUploadResult } from "@/types/files";

/**
 * Parameters for batch file upload
 */
export interface UploadFilesBatchParams {
  /** Array of files to upload (2-10 files) */
  files: File[];
  /** Source module (0=Task, 1=Chat, 2=Company, 3=User) */
  sourceModule?: number;
  /** Optional source entity ID (e.g., conversationId for Chat) */
  sourceEntityId?: string;
}

/**
 * Options for useUploadFilesBatch hook
 */
export interface UseUploadFilesBatchOptions {
  /** Callback on successful batch upload */
  onSuccess?: (data: BatchUploadResult) => void;
  /** Callback on failed batch upload */
  onError?: (error: Error) => void;
}

/**
 * Phase 2: Mutation hook for batch file upload
 *
 * Features:
 * - Auto retry: 1 time with 2s delay
 * - Validation: 2-10 files, max 10MB per file
 * - Partial success handling
 * - Error handling with toast notifications
 *
 * @param options Optional callbacks for success/error
 * @returns TanStack Query mutation
 *
 * @example
 * ```tsx
 * const uploadBatch = useUploadFilesBatch({
 *   onSuccess: (result) => {
 *     if (result.allSuccess) {
 *       toast.success('Tất cả file đã upload thành công');
 *     } else if (result.partialSuccess) {
 *       toast.warning(`${result.successCount}/${result.totalFiles} file upload thành công`);
 *     }
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * // Usage in component
 * const handleUpload = () => {
 *   uploadBatch.mutate({
 *     files: selectedFiles,
 *     sourceModule: 1,
 *     sourceEntityId: conversationId
 *   });
 * };
 * ```
 */
export function useUploadFilesBatch(options?: UseUploadFilesBatchOptions) {
  return useMutation({
    mutationFn: async (params: UploadFilesBatchParams) => {
      const result = await uploadFilesBatch(params.files, {
        sourceModule: params.sourceModule,
        sourceEntityId: params.sourceEntityId,
      });
      return result;
    },

    // Auto retry once after 2 seconds for network errors
    retry: (failureCount, error) => {
      // Don't retry validation errors
      if (error instanceof Error) {
        const isValidationError =
          error.message.includes("No files provided") ||
          error.message.includes("Use single upload API") ||
          error.message.includes("Maximum 10 files");

        if (isValidationError) {
          return false;
        }
      }

      // Retry once for network errors
      return failureCount < 1;
    },
    retryDelay: 2000,

    // Callbacks
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

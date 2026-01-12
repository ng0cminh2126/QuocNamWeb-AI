/**
 * React Query Hook: Word Preview
 *
 * Fetches Word document preview with HTML conversion.
 * Manages loading, error, and success states.
 *
 * @module hooks/queries/useWordPreview
 */

import { useQuery } from "@tanstack/react-query";
import { previewWordFile } from "@/api/filePreview.api";
import type { WordPreviewDto } from "@/types/filePreview";

/**
 * Query key factory for Word preview
 * Enables targeted cache invalidation and refetching
 */
export const wordPreviewKeys = {
  all: ["wordPreview"] as const,
  file: (fileId: string) => [...wordPreviewKeys.all, fileId] as const,
};

/**
 * Hook to fetch Word document preview
 *
 * Features:
 * - Automatic loading and error state management
 * - Cache result for 5 minutes (staleTime)
 * - Retry failed requests up to 2 times
 * - Only fetch when fileId is provided and not empty
 *
 * @param fileId - File ID to preview (GUID format)
 * @returns React Query result with Word preview data
 *
 * @example
 * function WordPreviewModal({ fileId }: { fileId: string }) {
 *   const { data, isLoading, isError, error, refetch } = useWordPreview(fileId);
 *
 *   if (isLoading) return <Skeleton />;
 *   if (isError) return <ErrorMessage error={error} onRetry={refetch} />;
 *
 *   return (
 *     <div
 *       dangerouslySetInnerHTML={{ __html: data.htmlContent }}
 *       style={{ ...parseCss(data.cssStyles) }}
 *     />
 *   );
 * }
 */
export function useWordPreview(fileId: string) {
  return useQuery<WordPreviewDto, Error>({
    queryKey: wordPreviewKeys.file(fileId),
    queryFn: () => previewWordFile(fileId),
    enabled: !!fileId && fileId.trim() !== "",
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch on tab focus
  });
}

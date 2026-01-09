/**
 * File Preview Query Keys
 *
 * Query key factory for file preview related queries.
 * Used with TanStack Query for cache management and invalidation.
 *
 * @module hooks/queries/filePreviewKeys
 */

/**
 * Query key factory for file preview operations
 *
 * Structure:
 * - all: ['filePreview'] - Root key for all file preview queries
 * - previews(): ['filePreview', 'preview'] - All preview queries
 * - preview(fileId): ['filePreview', 'preview', fileId] - Specific file preview
 * - pages(): ['filePreview', 'page'] - All page render queries
 * - page(fileId, pageNumber): ['filePreview', 'page', fileId, pageNumber] - Specific page
 *
 * @example
 * // Use in query
 * useQuery({
 *   queryKey: filePreviewKeys.preview('file-123'),
 *   queryFn: () => getFilePreview({ fileId: 'file-123' })
 * })
 *
 * // Invalidate all previews
 * queryClient.invalidateQueries({ queryKey: filePreviewKeys.previews() })
 *
 * // Invalidate specific file's pages
 * queryClient.invalidateQueries({ queryKey: filePreviewKeys.pages() })
 */
export const filePreviewKeys = {
  /**
   * Root key for all file preview queries
   */
  all: ["filePreview"] as const,

  /**
   * Key for all preview queries
   */
  previews: () => [...filePreviewKeys.all, "preview"] as const,

  /**
   * Key for a specific file preview query
   * @param fileId - File ID (GUID)
   */
  preview: (fileId: string) => [...filePreviewKeys.previews(), fileId] as const,

  /**
   * Key for all page render queries
   */
  pages: () => [...filePreviewKeys.all, "page"] as const,

  /**
   * Key for a specific page render query
   * @param fileId - File ID (GUID)
   * @param pageNumber - Page number (1-based)
   */
  page: (fileId: string, pageNumber: number) =>
    [...filePreviewKeys.pages(), fileId, pageNumber] as const,
};

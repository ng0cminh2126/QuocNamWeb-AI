/**
 * File Sorting Utility
 * Sort extracted files by various criteria
 * @module utils/fileSorting
 */

import type { ExtractedFile, FileSortOption } from '@/types/files';

/**
 * Sort files based on selected option
 * @param files - Array of files to sort
 * @param sortBy - Sort option (default: 'newest')
 * @returns Sorted array
 * 
 * @example
 * const sorted = sortFiles(files, 'newest');
 * const byName = sortFiles(files, 'name-asc');
 * const bySize = sortFiles(files, 'size-desc');
 */
export function sortFiles(
  files: ExtractedFile[],
  sortBy: FileSortOption = 'newest'
): ExtractedFile[] {
  const sorted = [...files];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

    case 'oldest':
      return sorted.sort((a, b) =>
        new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
      );

    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case 'size-desc':
      return sorted.sort((a, b) => b.size - a.size);

    case 'size-asc':
      return sorted.sort((a, b) => a.size - b.size);

    default:
      return sorted;
  }
}

/**
 * Sort by upload date (newest first) - DEFAULT
 * @param files - Files to sort
 * @returns Sorted by newest
 */
export function sortByNewest(files: ExtractedFile[]): ExtractedFile[] {
  return [...files].sort((a, b) =>
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

/**
 * Sort by upload date (oldest first)
 * @param files - Files to sort
 * @returns Sorted by oldest
 */
export function sortByOldest(files: ExtractedFile[]): ExtractedFile[] {
  return [...files].sort((a, b) =>
    new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
  );
}

/**
 * Sort by filename (alphabetical)
 * @param files - Files to sort
 * @returns Sorted by name A-Z
 */
export function sortByName(files: ExtractedFile[]): ExtractedFile[] {
  return [...files].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Sort by file size (largest first)
 * @param files - Files to sort
 * @returns Sorted by size descending
 */
export function sortByLargeSize(files: ExtractedFile[]): ExtractedFile[] {
  return [...files].sort((a, b) => b.size - a.size);
}

/**
 * Sort by file size (smallest first)
 * @param files - Files to sort
 * @returns Sorted by size ascending
 */
export function sortBySmallSize(files: ExtractedFile[]): ExtractedFile[] {
  return [...files].sort((a, b) => a.size - b.size);
}

/**
 * Get label for sort option in Vietnamese
 * @param option - Sort option
 * @returns Vietnamese label
 */
export function getSortLabel(option: FileSortOption): string {
  const labels: Record<FileSortOption, string> = {
    newest: 'Mới nhất',
    oldest: 'Cũ nhất',
    'name-asc': 'Tên (A-Z)',
    'size-desc': 'Kích thước (Lớn → Nhỏ)',
    'size-asc': 'Kích thước (Nhỏ → Lớn)',
  };

  return labels[option] || option;
}

/**
 * Get available sort options for file type
 * @param fileType - 'media' or 'docs'
 * @returns Array of available sort options
 */
export function getAvailableSortOptions(
  fileType: 'media' | 'docs'
): FileSortOption[] {
  const baseOptions: FileSortOption[] = ['newest', 'oldest', 'name-asc'];

  // All file types support size sorting
  return [...baseOptions, 'size-desc', 'size-asc'];
}

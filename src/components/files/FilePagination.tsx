/**
 * File Pagination Component
 * Navigate between pages of files
 * Locked decision: 50 items per page
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useViewFilesStore } from '@/stores/viewFilesStore';
import { usePaginationInfo } from '@/stores/viewFilesStore';
import type { FilePaginationProps } from '@/types/files';

export default function FilePagination({
  onPageChange,
}: FilePaginationProps) {
  const { goToPage, nextPage, prevPage, currentPage } = useViewFilesStore();
  const { totalPages, hasNextPage, hasPrevPage, startIndex, endIndex, totalFiles } =
    usePaginationInfo();

  const handlePrevious = () => {
    prevPage();
    onPageChange?.(currentPage - 1);
  };

  const handleNext = () => {
    nextPage();
    onPageChange?.(currentPage + 1);
  };

  const handleGoToPage = (page: number) => {
    goToPage(page);
    onPageChange?.(page);
  };

  // Hide pagination if only one page
  if (totalPages <= 1) return null;

  // Generate page numbers to display (show 5 pages max)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if near start or end
    if (currentPage <= halfVisible) {
      end = Math.min(totalPages, maxVisiblePages);
    } else if (currentPage > totalPages - halfVisible) {
      start = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    // Add first page and ellipsis
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    // Add page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className="flex flex-col gap-4 items-center justify-between"
      data-testid="chat-file-pagination-container"
    >
      {/* Page Info */}
      <div className="text-sm text-gray-600">
        <span data-testid="chat-file-pagination-info">
          Hiển thị {startIndex} - {endIndex} của {totalFiles} file
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={!hasPrevPage}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
          data-testid="chat-file-pagination-prev-button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <div key={`${page}-${index}`}>
              {page === '...' ? (
                <span className="px-2 py-1 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => handleGoToPage(page as number)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white font-medium'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                  data-testid={`chat-file-pagination-page-${page}`}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!hasNextPage}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
          data-testid="chat-file-pagination-next-button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Page Input (Optional) */}
      <div className="text-xs text-gray-500">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}

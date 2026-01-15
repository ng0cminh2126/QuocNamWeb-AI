/**
 * View All Files Modal Component
 * Using React Portal instead of Radix Dialog to avoid infinite loop
 * 
 * Note: Radix Dialog was causing infinite re-render loop when used with 
 * Zustand store subscriptions. This version uses createPortal directly.
 */

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Grid3x3, List } from 'lucide-react';
import { useViewFilesStore } from '@/stores/viewFilesStore';
import FileSearchBar from './FileSearchBar';
import FileFilters from './FileFilters';
import FileSortDropdown from './FileSortDropdown';
import FilePagination from './FilePagination';
import FileGrid from './FileGrid';
import FileList from './FileList';
import type { ExtractedFile, ViewAllFilesModalProps } from '@/types/files';
import React from 'react';
import { getMessages } from '@/api/messages.api';
import { extractAllFilesFromMessages } from '@/utils/fileExtraction';
import type { MessageDto } from '@/types/files';

type ViewMode = 'grid' | 'list';

interface ViewAllFilesModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ViewAllFilesModal({
  isOpen = false,
  onOpenChange,
}: ViewAllFilesModalProps) {
  // const [viewMode, setViewMode] = useState<ViewMode>('grid');
  // const [showFilters, setShowFilters] = useState(false);
  const hasFetchedRef = React.useRef<string | null>(null);

  const {
    isModalOpen,
    closeModal,
    displayedFiles,
    allFiles,
    filters,
    sortBy,
    searchQuery,
    previewFile,
    setError,
    setLoading,
    openModal,
    updateFiles,
    currentGroupId,
    currentWorkTypeId,
    setFilters,
    setSortBy,
    setSearchQuery,
    setPreviewFile,
    goToPage,
    currentPage,
    totalFiles,
    pageSize,
  } = useViewFilesStore();
  // Get files from store
  // const displayedFiles = useViewFilesStore((state) => state.displayedFiles);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange?.(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  
  // Use controlled prop if provided, otherwise use store state
  const open = isOpen ?? isModalOpen;

  /**
   * Fetch messages from API and extract files
   * Then update modal with extracted files
   * Memoized to prevent recreation on every render
   */
  const fetchMessagesAndExtractFiles = useCallback(
    async (conversationId: string | null) => {
      if (!conversationId) {
        setError(new Error('Không có cuộc trò chuyện để tải tệp'));
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch messages from API
        const response = await getMessages({ conversationId, limit: 100 });

        if (!response?.items || response.items.length === 0) {
          setError(new Error('Không tìm thấy tin nhắn với tệp đính kèm'));
          return;
        }

        // Extract files from messages
        const files = extractAllFilesFromMessages(
          response.items as unknown as MessageDto[]
        );

        if (files.length === 0) {
          setError(new Error('Không tìm thấy tệp trong tin nhắn'));
          return;
        }

        // Update modal files (don't call openModal to avoid infinite loop)
        updateFiles(files);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        setError(new Error(`Lỗi tải tệp: ${errorMessage}`));
        console.error('Error fetching messages and extracting files:', error);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentWorkTypeId] // Only track currentWorkTypeId; Zustand actions are stable
  );

  // Fetch files when modal opens - only once per conversation
  // Skip fetching if files were already provided (e.g., from InformationPanel button)
  React.useEffect(() => {
    if (open && currentGroupId && hasFetchedRef.current !== currentGroupId) {
      // Check if we already have files for this conversation
      const hasExistingFiles = allFiles.length > 0;
      
      if (!hasExistingFiles) {
        hasFetchedRef.current = currentGroupId;
        fetchMessagesAndExtractFiles(currentGroupId);
      } else {
        // Mark as fetched to prevent future fetches for this conversation
        hasFetchedRef.current = currentGroupId;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentGroupId]); // Don't include allFiles or fetchMessagesAndExtractFiles

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      data-testid="chat-view-all-files-backdrop"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 animate-in fade-in-0" />

      {/* Modal Content */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-lg p-6 flex flex-col animate-in zoom-in-95 slide-in-from-bottom-2"
        data-testid="chat-view-all-files-modal"
      >
        {/* Header */}
        <div
          className="border-b pb-4"
          data-testid="chat-view-all-files-header"
        >
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              Tất cả file
            </h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              data-testid="chat-view-all-files-close-button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-4">
          {/* Toolbar */}
          <div
            className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg"
            data-testid="chat-view-all-files-toolbar"
          >
            {/* Search Bar */}
            <FileSearchBar
              placeholder="Tìm kiếm file..."
              value={searchQuery}
              onChange={(query) => setSearchQuery(query)}
            />

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-3">
              {/* Sort & View Toggle */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sắp xếp:</label>
                <FileSortDropdown
                  value={sortBy}
                  onChange={(option) => setSortBy(option)}
                  fileType="docs"
                />

                {/* View Mode Toggle */}
                {/* <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${viewMode === 'grid'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    title="Grid view"
                    data-testid="chat-view-all-files-view-grid-button"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${viewMode === 'list'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    title="List view"
                    data-testid="chat-view-all-files-view-list-button"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div> */}
              </div>

              {/* Filter Toggle */}
              {/* <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                data-testid="chat-view-all-files-filter-toggle-button"
              >
                ⚙️ Lọc
              </button> */}
            </div>

            {/* Filters Panel (Collapsible) */}
            {/* {showFilters && (
              <div
                className="p-3 bg-white border border-gray-300 rounded-lg"
                data-testid="chat-view-all-files-filters-panel"
              >
                <FileFilters
                  filters={filters}
                  onChange={(newFilters) => setFilters(newFilters)}
                  fileType="docs"
                />
              </div>
            )} */}
          </div>

          {/* Files Display Area */}
          <div
            className="flex-1 overflow-y-auto px-4"
            data-testid="chat-view-all-files-display-area"
          >
            {displayedFiles.length > 0 ? (
              // viewMode === 'grid' 
              true ? (
                <FileGrid
                  files={displayedFiles}
                  isLoading={false}
                  onFileClick={(file) => setPreviewFile(file)}
                />
              ) : (
                <FileList
                  files={displayedFiles}
                  isLoading={false}
                  onFileClick={(file) => setPreviewFile(file)}
                />
              )
            ) : (
              <div
                className="flex items-center justify-center h-full text-gray-500"
                data-testid="chat-view-all-files-empty-state"
              >
                <div className="text-center">
                  <p className="text-sm font-medium">Không tìm thấy file</p>
                  <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {displayedFiles.length > 0 && (
            <div
              className="border-t pt-4 px-4"
              data-testid="chat-view-all-files-pagination"
            >
              <FilePagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalFiles / pageSize)}
                totalItems={totalFiles}
                pageSize={pageSize}
                onPageChange={(page) => goToPage(page)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use React Portal to render modal at document body
  return createPortal(modalContent, document.body);
}


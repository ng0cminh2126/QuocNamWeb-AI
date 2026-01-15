/**
 * View All Files Store
 * Zustand store for managing View All Files modal state
 * @module stores/viewFilesStore
 */

import React from 'react';
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import type {
  ExtractedFile,
  FileFilters,
  FileSortOption,
  ViewFilesState,
} from '@/types/files';
import { extractAllFilesFromMessages } from '@/utils/fileExtraction';
import type { MessageDto } from '@/types/files';

/**
 * Initial filter state
 */
const INITIAL_FILTERS: FileFilters = {
  images: true,
  videos: true,
  pdf: true,
  word: true,
  excel: true,
  powerpoint: true,
  other: true,
};

/**
 * View All Files Store
 * Manages:
 * - Modal open/close state
 * - Files list and filtering
 * - Sorting and pagination
 * - Search and preview functionality
 */
export const useViewFilesStore = create<ViewFilesState>()((set, get) => ({
  // ===== STATE =====

  // Modal state
  isModalOpen: false,
  currentGroupId: null,
  currentWorkTypeId: null,

  // Files
  allFiles: [],
  filteredFiles: [],
  displayedFiles: [],

  // Filters & Sort
  filters: INITIAL_FILTERS,
  sortBy: 'newest', // Locked decision: Default sort is "Newest first"
  searchQuery: '',

  // Pagination (Locked decision: 50 items per page)
  currentPage: 1,
  pageSize: 50,
  totalFiles: 0,

  // Preview
  previewFile: null,
  previewPosition: null,

  // Loading state
  isLoading: false,
  error: null,

  // ===== ACTIONS =====

  /**
   * Open modal with files
   */
  openModal: (
    files: ExtractedFile[],
    groupId: string,
    workTypeId?: string
  ) =>
    set((state) => ({
      isModalOpen: true,
      allFiles: files,
      currentGroupId: groupId,
      currentWorkTypeId: workTypeId,
      filteredFiles: files,
      displayedFiles: files.slice(0, state.pageSize),
      totalFiles: files.length,
      currentPage: 1,
      searchQuery: '',
      sortBy: 'newest',
      filters: INITIAL_FILTERS,
      previewFile: null,
      error: null,
    })),

  /**
   * Close modal and reset state
   */
  closeModal: () =>
    set({
      isModalOpen: false,
      currentGroupId: null,
      currentWorkTypeId: null,
      previewFile: null,
      previewPosition: null,
      searchQuery: '',
    }),

  /**
   * Update filter state
   */
  setFilters: (filters: Partial<FileFilters>) =>
    set((state) => {
      const newFilters = { ...state.filters, ...filters };
      const filtered = applyFilters(
        state.allFiles,
        newFilters,
        state.searchQuery,
        state.sortBy
      );

      return {
        filters: newFilters,
        filteredFiles: filtered,
        displayedFiles: filtered.slice(0, state.pageSize),
        currentPage: 1,
        totalFiles: filtered.length,
      };
    }),

  /**
   * Reset all filters to default
   */
  resetFilters: () =>
    set((state) => {
      const filtered = applyFilters(
        state.allFiles,
        INITIAL_FILTERS,
        state.searchQuery,
        state.sortBy
      );

      return {
        filters: INITIAL_FILTERS,
        filteredFiles: filtered,
        displayedFiles: filtered.slice(0, state.pageSize),
        currentPage: 1,
        totalFiles: filtered.length,
      };
    }),

  /**
   * Update sort option
   */
  setSortBy: (sortBy: FileSortOption) =>
    set((state) => {
      const filtered = applyFilters(
        state.allFiles,
        state.filters,
        state.searchQuery,
        sortBy
      );

      return {
        sortBy,
        filteredFiles: filtered,
        displayedFiles: filtered.slice(0, state.pageSize),
        currentPage: 1,
        totalFiles: filtered.length,
      };
    }),

  /**
   * Update search query
   */
  setSearchQuery: (query: string) =>
    set((state) => {
      const filtered = applyFilters(
        state.allFiles,
        state.filters,
        query,
        state.sortBy
      );

      return {
        searchQuery: query,
        filteredFiles: filtered,
        displayedFiles: filtered.slice(0, state.pageSize),
        currentPage: 1,
        totalFiles: filtered.length,
      };
    }),

  /**
   * Clear search query
   */
  clearSearch: () =>
    set((state) => {
      const filtered = applyFilters(
        state.allFiles,
        state.filters,
        '',
        state.sortBy
      );

      return {
        searchQuery: '',
        filteredFiles: filtered,
        displayedFiles: filtered.slice(0, state.pageSize),
        currentPage: 1,
        totalFiles: filtered.length,
      };
    }),

  /**
   * Go to specific page (1-indexed)
   */
  goToPage: (page: number) =>
    set((state) => {
      const maxPage = Math.ceil(state.filteredFiles.length / state.pageSize);
      const validPage = Math.min(Math.max(1, page), maxPage);
      const start = (validPage - 1) * state.pageSize;
      const end = start + state.pageSize;

      return {
        currentPage: validPage,
        displayedFiles: state.filteredFiles.slice(start, end),
      };
    }),

  /**
   * Go to next page
   */
  nextPage: () =>
    set((state) => {
      const maxPage = Math.ceil(state.filteredFiles.length / state.pageSize);
      const nextPage = Math.min(state.currentPage + 1, maxPage);

      if (nextPage === state.currentPage) return state;

      const start = (nextPage - 1) * state.pageSize;
      const end = start + state.pageSize;

      return {
        currentPage: nextPage,
        displayedFiles: state.filteredFiles.slice(start, end),
      };
    }),

  /**
   * Go to previous page
   */
  prevPage: () =>
    set((state) => {
      const prevPage = Math.max(state.currentPage - 1, 1);

      if (prevPage === state.currentPage) return state;

      const start = (prevPage - 1) * state.pageSize;
      const end = start + state.pageSize;

      return {
        currentPage: prevPage,
        displayedFiles: state.filteredFiles.slice(start, end),
      };
    }),

  /**
   * Set page size (regenerates pagination)
   */
  setPageSize: (size: number) =>
    set((state) => {
      const validSize = Math.max(1, Math.min(100, size)); // Clamp between 1-100

      return {
        pageSize: validSize,
        currentPage: 1,
        displayedFiles: state.filteredFiles.slice(0, validSize),
      };
    }),

  /**
   * Preview a specific file
   */
  setPreviewFile: (file: ExtractedFile | null, position?: number) =>
    set({
      previewFile: file,
      previewPosition: position,
    }),

  /**
   * Navigate to next file in preview
   */
  nextPreview: () =>
    set((state) => {
      if (!state.previewFile || state.previewPosition === null || state.previewPosition === undefined)
        return state;

      const nextIndex = state.previewPosition + 1;
      if (nextIndex >= state.filteredFiles.length) return state;

      return {
        previewFile: state.filteredFiles[nextIndex],
        previewPosition: nextIndex,
      };
    }),

  /**
   * Navigate to previous file in preview
   */
  prevPreview: () =>
    set((state) => {
      if (!state.previewFile || state.previewPosition === null || state.previewPosition === undefined)
        return state;

      const prevIndex = state.previewPosition - 1;
      if (prevIndex < 0) return state;

      return {
        previewFile: state.filteredFiles[prevIndex],
        previewPosition: prevIndex,
      };
    }),

  /**
   * Clear preview
   */
  clearPreview: () =>
    set({
      previewFile: null,
      previewPosition: null,
    }),

  /**
   * Set loading state
   */
  setLoading: (isLoading: boolean) =>
    set({ isLoading }),

  /**
   * Set error state
   */
  setError: (error: Error | null) =>
    set({ error }),

  /**
   * Update all files (refresh)
   */
  updateFiles: (files: ExtractedFile[]) =>
    set((state) => {
      const filtered = applyFilters(
        files,
        state.filters,
        state.searchQuery,
        state.sortBy
      );

      return {
        allFiles: files,
        filteredFiles: filtered,
        displayedFiles: filtered.slice(0, state.pageSize),
        currentPage: 1,
        totalFiles: filtered.length,
      };
    }),

  /**
   * Auto-update files when messages are fetched from API
   * This is called automatically when messages come from:
   * - /api/conversations/{conversationId}/messages
   * - /api/groups/{groupId}/messages
   * 
   * @param messages - Array of MessageDto from API
   * @param groupId - Group ID for context
   * @param workTypeId - Optional work type ID
   */
  updateFilesFromMessages: (
    messages: MessageDto[],
    groupId: string,
    workTypeId?: string
  ) =>
    set((state) => {
      try {
        // Extract files from messages
        const files = extractAllFilesFromMessages(messages);
        
        // Apply filters
        const filtered = applyFilters(
          files,
          state.filters,
          state.searchQuery,
          state.sortBy
        );

        return {
          allFiles: files,
          filteredFiles: filtered,
          displayedFiles: filtered.slice(0, state.pageSize),
          currentPage: 1,
          totalFiles: filtered.length,
          currentGroupId: groupId,
          currentWorkTypeId: workTypeId || state.currentWorkTypeId,
          error: null,
        };
      } catch (error) {
        console.error('Error updating files from messages:', error);
        return {
          error: error instanceof Error ? error : new Error('Failed to process messages'),
        };
      }
    }),

  /**
   * Reset entire store
   */
  reset: () =>
    set({
      isModalOpen: false,
      currentGroupId: null,
      currentWorkTypeId: null,
      allFiles: [],
      filteredFiles: [],
      displayedFiles: [],
      filters: INITIAL_FILTERS,
      sortBy: 'newest',
      searchQuery: '',
      currentPage: 1,
      pageSize: 50,
      totalFiles: 0,
      previewFile: null,
      previewPosition: null,
      isLoading: false,
      error: null,
    }),
}));

/**
 * Helper function to apply all filters and sorting
 * @internal
 */
function applyFilters(
  files: ExtractedFile[],
  filters: FileFilters,
  searchQuery: string,
  sortBy: FileSortOption
): ExtractedFile[] {
  let result = [...files];

  // Apply filter selections
  result = result.filter((file) => {
    if (file.contentType.startsWith('image/')) return filters.images;
    if (file.contentType.startsWith('video/')) return filters.videos;
    if (file.contentType.includes('pdf')) return filters.pdf;
    if (
      file.contentType.includes('word') ||
      file.contentType.includes('msword')
    ) {
      return filters.word;
    }
    if (file.contentType.includes('excel')) return filters.excel;
    if (file.contentType.includes('powerpoint')) return filters.powerpoint;
    return filters.other;
  });

  // Apply search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter((file) =>
      file.name.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (
          new Date(b.uploadedAt).getTime() -
          new Date(a.uploadedAt).getTime()
        );
      case 'oldest':
        return (
          new Date(a.uploadedAt).getTime() -
          new Date(b.uploadedAt).getTime()
        );
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'size-desc':
        return b.size - a.size;
      case 'size-asc':
        return a.size - b.size;
      default:
        return 0;
    }
  });

  return result;
}

/**
 * Selector to get pagination info
 * Uses shallow comparison to prevent infinite re-renders
 */
export function usePaginationInfo() {
  return useViewFilesStore(
    (state) => {
      const totalPages = Math.ceil(state.totalFiles / state.pageSize);
      return {
        currentPage: state.currentPage,
        totalPages,
        pageSize: state.pageSize,
        totalFiles: state.totalFiles,
        hasNextPage: state.currentPage < totalPages,
        hasPrevPage: state.currentPage > 1,
        startIndex: (state.currentPage - 1) * state.pageSize + 1,
        endIndex: Math.min(
          state.currentPage * state.pageSize,
          state.totalFiles
        ),
      };
    },
    shallow
  );
}

/**
 * Selector to get filter counts
 * Uses shallow comparison to prevent infinite re-renders
 */
export function useFilterCounts() {
  return useViewFilesStore(
    (state) => {
      const counts = {
        images: 0,
        videos: 0,
        pdf: 0,
        word: 0,
        excel: 0,
        powerpoint: 0,
        other: 0,
      };

      state.allFiles.forEach((file) => {
        if (file.contentType.startsWith('image/')) counts.images++;
        else if (file.contentType.startsWith('video/')) counts.videos++;
        else if (file.contentType.includes('pdf')) counts.pdf++;
        else if (
          file.contentType.includes('word') ||
          file.contentType.includes('msword')
        ) {
          counts.word++;
        } else if (file.contentType.includes('excel')) counts.excel++;
        else if (file.contentType.includes('powerpoint')) counts.powerpoint++;
        else counts.other++;
      });

      return counts;
    },
    shallow
  );
}
/**
 * Hook to sync messages to store automatically
 * Use this in components that receive messages from API calls to:
 * - /api/conversations/{conversationId}/messages
 * - /api/groups/{groupId}/messages
 * 
 * @example
 * ```tsx
 * // In ConversationDetailPanel.tsx or similar:
 * useSyncMessagesToFileStore(messages, groupId, selectedWorkTypeId);
 * ```
 */
export function useSyncMessagesToFileStore(
  messages: MessageDto[] | undefined,
  groupId: string | undefined,
  workTypeId?: string
) {
  const updateFilesFromMessages = useViewFilesStore(
    (state) => state.updateFilesFromMessages
  );

  // Sync messages to store whenever they change
  React.useEffect(() => {
    if (messages && messages.length > 0 && groupId) {
      updateFilesFromMessages(messages, groupId, workTypeId);
    }
  }, [messages, groupId, workTypeId, updateFilesFromMessages]);
}
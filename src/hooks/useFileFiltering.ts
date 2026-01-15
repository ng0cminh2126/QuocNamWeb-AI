/**
 * useFileFiltering Hook
 * Custom hook for managing file filtering, sorting, and search logic
 * Provides reactive computed values based on store state
 */

import { useViewFilesStore, usePaginationInfo, useFilterCounts } from '@/stores/viewFilesStore';
import type { FileSortOption, FileFilters } from '@/types/files';

interface UseFileFilteringReturn {
  // Current state
  searchQuery: string;
  sortBy: FileSortOption;
  filters: FileFilters;
  currentPage: number;
  pageSize: number;
  
  // Computed values
  totalFiles: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filterCounts: Record<string, number>;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSortBy: (option: FileSortOption) => void;
  setFilters: (filters: Partial<FileFilters>) => void;
  resetFilters: () => void;
  clearSearch: () => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

/**
 * Hook to manage file filtering, sorting, and search
 * Returns reactive state and action functions
 * 
 * @example
 * const {
 *   searchQuery,
 *   setSearchQuery,
 *   sortBy,
 *   setSortBy,
 *   goToPage,
 *   totalPages,
 * } = useFileFiltering();
 * 
 * return (
 *   <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
 * );
 */
export function useFileFiltering(): UseFileFilteringReturn {
  const {
    searchQuery,
    sortBy,
    filters,
    currentPage,
    pageSize,
    totalFiles,
    setSearchQuery,
    setSortBy,
    setFilters,
    resetFilters,
    clearSearch,
    goToPage,
    nextPage,
    prevPage,
  } = useViewFilesStore();

  const paginationInfo = usePaginationInfo();
  const filterCounts = useFilterCounts();

  return {
    // Current state
    searchQuery,
    sortBy,
    filters,
    currentPage,
    pageSize,
    
    // Computed values
    totalFiles,
    totalPages: paginationInfo.totalPages,
    hasNextPage: paginationInfo.hasNextPage,
    hasPrevPage: paginationInfo.hasPrevPage,
    filterCounts,
    
    // Actions
    setSearchQuery,
    setSortBy,
    setFilters,
    resetFilters,
    clearSearch,
    goToPage,
    nextPage,
    prevPage,
  };
}

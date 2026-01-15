/**
 * useFileFiltering Hook Tests
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileFiltering } from '@/hooks/useFileFiltering';
import { useViewFilesStore } from '@/stores/viewFilesStore';
import type { ExtractedFile } from '@/types/files';

const mockFiles: ExtractedFile[] = [
  {
    id: '1',
    name: 'image1.jpg',
    contentType: 'image/jpeg',
    size: 1024 * 100,
    url: 'https://example.com/image1.jpg',
    uploadedAt: '2025-01-01T10:00:00Z',
    senderName: 'Alice',
  },
  {
    id: '2',
    name: 'document.pdf',
    contentType: 'application/pdf',
    size: 1024 * 200,
    url: 'https://example.com/document.pdf',
    uploadedAt: '2025-01-02T10:00:00Z',
    senderName: 'Bob',
  },
  {
    id: '3',
    name: 'image2.jpg',
    contentType: 'image/jpeg',
    size: 1024 * 150,
    url: 'https://example.com/image2.jpg',
    uploadedAt: '2025-01-03T10:00:00Z',
    senderName: 'Charlie',
  },
  {
    id: '4',
    name: 'video.mp4',
    contentType: 'video/mp4',
    size: 1024 * 500,
    url: 'https://example.com/video.mp4',
    uploadedAt: '2025-01-04T10:00:00Z',
    senderName: 'David',
  },
];

describe('useFileFiltering', () => {
  beforeEach(() => {
    // Reset store first
    const store = useViewFilesStore.getState();
    store.reset();
    
    // Setup mock files through openModal which properly initializes all state
    store.openModal(mockFiles, 'test-group', 'test-worktype');
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useFileFiltering());

    expect(result.current.searchQuery).toBe('');
    expect(result.current.sortBy).toBe('newest');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalFiles).toBe(4);
  });

  it('should update search query', () => {
    const { result, rerender } = renderHook(() => useFileFiltering());

    act(() => {
      result.current.setSearchQuery('image');
    });

    rerender();

    expect(result.current.searchQuery).toBe('image');
  });

  it('should update sort option', () => {
    const { result, rerender } = renderHook(() => useFileFiltering());

    act(() => {
      result.current.setSortBy('oldest');
    });

    rerender();

    expect(result.current.sortBy).toBe('oldest');
  });

  it('should update filters', () => {
    const { result, rerender } = renderHook(() => useFileFiltering());

    act(() => {
      result.current.setFilters({ images: false });
    });

    rerender();

    expect(result.current.filters.images).toBe(false);
  });

  it('should reset filters to default', () => {
    const { result, rerender } = renderHook(() => useFileFiltering());

    act(() => {
      result.current.setFilters({ images: false, pdf: false });
    });

    rerender();

    expect(result.current.filters.images).toBe(false);
    expect(result.current.filters.pdf).toBe(false);

    act(() => {
      result.current.resetFilters();
    });

    rerender();

    expect(result.current.filters.images).toBe(true);
    expect(result.current.filters.pdf).toBe(true);
  });

  it('should clear search query', () => {
    const { result, rerender } = renderHook(() => useFileFiltering());

    act(() => {
      result.current.setSearchQuery('test');
    });

    rerender();

    expect(result.current.searchQuery).toBe('test');

    act(() => {
      result.current.clearSearch();
    });

    rerender();

    expect(result.current.searchQuery).toBe('');
  });

  it('should navigate pages', () => {
    // Create enough files for multiple pages
    const manyFiles = Array.from({ length: 100 }, (_, i) => ({
      id: String(i),
      name: `file-${i}.jpg`,
      contentType: 'image/jpeg',
      size: 1024,
      url: `https://example.com/file-${i}.jpg`,
      uploadedAt: new Date().toISOString(),
      senderName: 'User',
    }));

    useViewFilesStore.setState({
      allFiles: manyFiles,
      filteredFiles: manyFiles,
      totalFiles: manyFiles.length,
    });

    const { result, rerender } = renderHook(() => useFileFiltering());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasNextPage).toBe(true);

    act(() => {
      result.current.nextPage();
    });

    rerender();

    expect(result.current.currentPage).toBe(2);
    expect(result.current.hasPrevPage).toBe(true);

    act(() => {
      result.current.prevPage();
    });

    rerender();

    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it('should go to specific page', () => {
    const manyFiles = Array.from({ length: 100 }, (_, i) => ({
      id: String(i),
      name: `file-${i}.jpg`,
      contentType: 'image/jpeg',
      size: 1024,
      url: `https://example.com/file-${i}.jpg`,
      uploadedAt: new Date().toISOString(),
      senderName: 'User',
    }));

    useViewFilesStore.setState({
      allFiles: manyFiles,
      filteredFiles: manyFiles,
      totalFiles: manyFiles.length,
    });

    const { result, rerender } = renderHook(() => useFileFiltering());

    act(() => {
      result.current.goToPage(3);
    });

    rerender();

    expect(result.current.currentPage).toBe(3);
  });

  it('should provide filter counts', () => {
    const { result } = renderHook(() => useFileFiltering());

    expect(result.current.filterCounts.images).toBe(2); // image1.jpg, image2.jpg
    expect(result.current.filterCounts.pdf).toBe(1); // document.pdf
    expect(result.current.filterCounts.videos).toBe(1); // video.mp4
  });

  it('should provide pagination info', () => {
    const manyFiles = Array.from({ length: 60 }, (_, i) => ({
      id: String(i),
      name: `file-${i}.jpg`,
      contentType: 'image/jpeg',
      size: 1024,
      url: `https://example.com/file-${i}.jpg`,
      uploadedAt: new Date().toISOString(),
      senderName: 'User',
    }));

    useViewFilesStore.setState({
      allFiles: manyFiles,
      filteredFiles: manyFiles,
      totalFiles: manyFiles.length,
      pageSize: 50,
    });

    const { result } = renderHook(() => useFileFiltering());

    expect(result.current.totalPages).toBe(2); // 60 files / 50 per page
    expect(result.current.totalFiles).toBe(60);
  });

  it('should prevent navigating beyond page limits', () => {
    const { result, rerender } = renderHook(() => useFileFiltering());

    // Try to go to previous page when on page 1
    act(() => {
      result.current.prevPage();
    });

    rerender();

    expect(result.current.currentPage).toBe(1); // Should stay on page 1

    // Try to go next when only 1 page
    act(() => {
      result.current.nextPage();
    });

    rerender();

    expect(result.current.currentPage).toBe(1); // Should stay on page 1
  });
});

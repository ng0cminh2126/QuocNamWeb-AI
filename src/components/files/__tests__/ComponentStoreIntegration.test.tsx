/**
 * Integration Tests - Component & Store Interaction
 * Tests how UI components interact with Zustand store and update display
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useViewFilesStore } from '@/stores/viewFilesStore';
import { useFileFiltering } from '@/hooks/useFileFiltering';
import { useViewFiles } from '@/hooks/useViewFiles';
import type { ExtractedFile } from '@/types/files';

describe('Component Store Integration', () => {
  beforeEach(() => {
    useViewFilesStore.setState({
      isModalOpen: false,
      currentGroupId: null,
      currentWorkTypeId: null,
      allFiles: [],
      filteredFiles: [],
      displayedFiles: [],
      filters: {
        images: true,
        videos: true,
        pdf: true,
        word: true,
        excel: true,
        powerpoint: true,
        other: true,
      },
      sortBy: 'newest',
      searchQuery: '',
      currentPage: 1,
      pageSize: 50,
      totalFiles: 0,
      previewFile: null,
      previewPosition: null,
      isLoading: false,
      error: null,
    });
  });

  describe('useFileFiltering Hook Integration', () => {
    it('should provide access to all store state', () => {
      const { result } = renderHook(() => useFileFiltering());

      expect(result.current).toHaveProperty('searchQuery');
      expect(result.current).toHaveProperty('sortBy');
      expect(result.current).toHaveProperty('filters');
      expect(result.current).toHaveProperty('currentPage');
      expect(result.current).toHaveProperty('pageSize');
    });

    it('should sync setSearchQuery action with store', () => {
      const { result } = renderHook(() => useFileFiltering());

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.searchQuery).toBe('test');
      expect(useViewFilesStore.getState().searchQuery).toBe('test');
    });

    it('should sync setSortBy action with store', () => {
      const { result } = renderHook(() => useFileFiltering());

      act(() => {
        result.current.setSortBy('oldest');
      });

      expect(result.current.sortBy).toBe('oldest');
      expect(useViewFilesStore.getState().sortBy).toBe('oldest');
    });

    it('should sync setFilters action with store', () => {
      const { result } = renderHook(() => useFileFiltering());

      act(() => {
        result.current.setFilters({ images: false });
      });

      expect(result.current.filters.images).toBe(false);
      expect(useViewFilesStore.getState().filters.images).toBe(false);
    });

    it('should sync pagination actions with store', () => {
      const mockFiles: ExtractedFile[] = Array.from({ length: 150 }, (_, i) => ({
        id: String(i),
        name: `file-${i}.jpg`,
        contentType: 'image/jpeg',
        size: 1024,
        url: `https://example.com/file-${i}.jpg`,
        uploadedAt: '2025-01-01T00:00:00Z',
        senderName: 'User',
      }));

      useViewFilesStore.getState().openModal(mockFiles, 'group1');

      const { result } = renderHook(() => useFileFiltering());

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.currentPage).toBe(3);
      expect(useViewFilesStore.getState().currentPage).toBe(3);
    });

    it('should compute filter counts based on current files', () => {
      const mockFiles: ExtractedFile[] = [
        {
          id: '1',
          name: 'photo.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/photo.jpg',
          uploadedAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
        },
        {
          id: '2',
          name: 'video.mp4',
          contentType: 'video/mp4',
          size: 1024,
          url: 'https://example.com/video.mp4',
          uploadedAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
        },
        {
          id: '3',
          name: 'doc.pdf',
          contentType: 'application/pdf',
          size: 1024,
          url: 'https://example.com/doc.pdf',
          uploadedAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
        },
      ];

      useViewFilesStore.getState().openModal(mockFiles, 'group1');

      const { result } = renderHook(() => useFileFiltering());

      expect(result.current.filterCounts).toHaveProperty('images');
      expect(result.current.filterCounts.images).toBe(1);
      expect(result.current.filterCounts.videos).toBe(1);
      expect(result.current.filterCounts.pdf).toBe(1);
    });

    it('should compute pagination info correctly', () => {
      const mockFiles: ExtractedFile[] = Array.from({ length: 150 }, (_, i) => ({
        id: String(i),
        name: `file-${i}.jpg`,
        contentType: 'image/jpeg',
        size: 1024,
        url: `https://example.com/file-${i}.jpg`,
        uploadedAt: '2025-01-01T00:00:00Z',
        senderName: 'User',
      }));

      useViewFilesStore.getState().openModal(mockFiles, 'group1');

      const { result } = renderHook(() => useFileFiltering());

      expect(result.current.totalPages).toBe(3); // 150 / 50
      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.hasPrevPage).toBe(false);

      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.hasPrevPage).toBe(true);

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.hasPrevPage).toBe(true);
    });
  });

  describe('useViewFiles Hook Integration', () => {
    it('should open modal and update store state', () => {
      const mockMessages = [
        {
          id: 'msg1',
          content: 'Test',
          attachments: [
            {
              id: 'att1',
              name: 'file.jpg',
              contentType: 'image/jpeg',
              size: 1024,
              url: 'https://example.com/file.jpg',
            },
          ],
          createdAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
          senderId: 'user1',
        },
      ];

      const { result } = renderHook(() => useViewFiles());

      act(() => {
        result.current.openModal(mockMessages, 'group1');
      });

      const state = useViewFilesStore.getState();
      expect(state.isModalOpen).toBe(true);
      expect(state.allFiles.length).toBe(1);
      expect(state.currentGroupId).toBe('group1');
    });

    it('should extract files with proper sender info', () => {
      const mockMessages = [
        {
          id: 'msg1',
          content: 'Test',
          attachments: [
            {
              id: 'att1',
              name: 'file1.jpg',
              contentType: 'image/jpeg',
              size: 1024,
              url: 'https://example.com/file1.jpg',
            },
          ],
          createdAt: '2025-01-01T10:00:00Z',
          senderName: 'Alice',
          senderId: 'user1',
        },
        {
          id: 'msg2',
          content: 'Test 2',
          attachments: [
            {
              id: 'att2',
              name: 'file2.jpg',
              contentType: 'image/jpeg',
              size: 1024,
              url: 'https://example.com/file2.jpg',
            },
          ],
          createdAt: '2025-01-01T11:00:00Z',
          senderName: 'Bob',
          senderId: 'user2',
        },
      ];

      const { result } = renderHook(() => useViewFiles());

      act(() => {
        result.current.openModal(mockMessages, 'group1');
      });

      const files = useViewFilesStore.getState().allFiles;
      expect(files[1].senderName).toBe('Alice');
      expect(files[0].senderName).toBe('Bob');
    });

    it('should close modal and reset state', () => {
      const mockMessages = [
        {
          id: 'msg1',
          content: 'Test',
          attachments: [
            {
              id: 'att1',
              name: 'file.jpg',
              contentType: 'image/jpeg',
              size: 1024,
              url: 'https://example.com/file.jpg',
            },
          ],
          createdAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
          senderId: 'user1',
        },
      ];

      const { result } = renderHook(() => useViewFiles());

      act(() => {
        result.current.openModal(mockMessages, 'group1');
      });

      expect(useViewFilesStore.getState().isModalOpen).toBe(true);

      act(() => {
        result.current.closeModal();
      });

      const state = useViewFilesStore.getState();
      expect(state.isModalOpen).toBe(false);
      expect(state.searchQuery).toBe('');
      expect(state.currentPage).toBe(1);
    });

    it('should handle empty attachments gracefully', () => {
      const mockMessages = [
        {
          id: 'msg1',
          content: 'No files',
          attachments: [],
          createdAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
          senderId: 'user1',
        },
      ];

      const { result } = renderHook(() => useViewFiles());

      expect(() => {
        act(() => {
          result.current.openModal(mockMessages, 'group1');
        });
      }).not.toThrow();

      expect(useViewFilesStore.getState().allFiles.length).toBe(0);
    });
  });

  describe('Store State Synchronization', () => {
    it('should synchronize search state across multiple hooks', () => {
      const mockFiles: ExtractedFile[] = [
        {
          id: '1',
          name: 'document.pdf',
          contentType: 'application/pdf',
          size: 1024,
          url: 'https://example.com/document.pdf',
          uploadedAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
        },
      ];

      useViewFilesStore.getState().openModal(mockFiles, 'group1');

      const { result: filterResult } = renderHook(() => useFileFiltering());

      act(() => {
        filterResult.current.setSearchQuery('doc');
      });

      // Create another hook instance - should see same state
      const { result: filterResult2 } = renderHook(() => useFileFiltering());
      expect(filterResult2.current.searchQuery).toBe('doc');
    });

    it('should synchronize filter state across hooks', () => {
      const mockFiles: ExtractedFile[] = [
        {
          id: '1',
          name: 'photo.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/photo.jpg',
          uploadedAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
        },
      ];

      useViewFilesStore.getState().openModal(mockFiles, 'group1');

      const { result: filterResult } = renderHook(() => useFileFiltering());

      act(() => {
        filterResult.current.setFilters({ images: false });
      });

      const { result: filterResult2 } = renderHook(() => useFileFiltering());
      expect(filterResult2.current.filters.images).toBe(false);
    });

    it('should update pagination across all components', () => {
      const mockFiles: ExtractedFile[] = Array.from({ length: 150 }, (_, i) => ({
        id: String(i),
        name: `file-${i}.jpg`,
        contentType: 'image/jpeg',
        size: 1024,
        url: `https://example.com/file-${i}.jpg`,
        uploadedAt: '2025-01-01T00:00:00Z',
        senderName: 'User',
      }));

      useViewFilesStore.getState().openModal(mockFiles, 'group1');

      const { result: filterResult1 } = renderHook(() => useFileFiltering());
      const { result: filterResult2 } = renderHook(() => useFileFiltering());

      act(() => {
        filterResult1.current.goToPage(2);
      });

      // Both hooks should reflect the same page
      expect(filterResult1.current.currentPage).toBe(2);
      expect(filterResult2.current.currentPage).toBe(2);
    });
  });

  describe('Computed Values Reactivity', () => {
    it('should update displayed files when filters change', () => {
      const mockFiles: ExtractedFile[] = [
        {
          id: '1',
          name: 'photo.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/photo.jpg',
          uploadedAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
        },
        {
          id: '2',
          name: 'video.mp4',
          contentType: 'video/mp4',
          size: 1024,
          url: 'https://example.com/video.mp4',
          uploadedAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
        },
      ];

      useViewFilesStore.getState().openModal(mockFiles, 'group1');

      const { result } = renderHook(() => useFileFiltering());

      expect(result.current.totalFiles).toBe(2);

      act(() => {
        result.current.setFilters({ images: false });
      });

      expect(result.current.totalFiles).toBe(1);
    });

    it('should update filter counts when files are added', () => {
      const mockFiles: ExtractedFile[] = [
        {
          id: '1',
          name: 'photo.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/photo.jpg',
          uploadedAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
        },
      ];

      useViewFilesStore.getState().openModal(mockFiles, 'group1');

      const { result } = renderHook(() => useFileFiltering());
      expect(result.current.filterCounts.images).toBe(1);

      // Add more files
      const newFiles: ExtractedFile[] = [
        ...mockFiles,
        {
          id: '2',
          name: 'photo2.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/photo2.jpg',
          uploadedAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
        },
      ];

      useViewFilesStore.getState().updateFiles(newFiles, 'group1');

      expect(result.current.filterCounts.images).toBe(2);
    });

    it('should recompute pagination when sort changes', () => {
      const mockFiles: ExtractedFile[] = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        name: `file-${i}.jpg`,
        contentType: 'image/jpeg',
        size: 1024 * (i + 1),
        url: `https://example.com/file-${i}.jpg`,
        uploadedAt: new Date(Date.now() - i * 1000).toISOString(),
        senderName: 'User',
      }));

      useViewFilesStore.getState().openModal(mockFiles, 'group1');

      const { result } = renderHook(() => useFileFiltering());

      expect(result.current.totalPages).toBe(2);

      // Change sort - should preserve pagination
      act(() => {
        result.current.setSortBy('size-asc');
      });

      expect(result.current.totalPages).toBe(2);
    });
  });

  describe('State Isolation & Cleanup', () => {
    it('should isolate modal state between different groups', () => {
      const mockFiles: ExtractedFile[] = [
        {
          id: '1',
          name: 'file.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/file.jpg',
          uploadedAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
        },
      ];

      useViewFilesStore.getState().openModal(mockFiles, 'group1');
      expect(useViewFilesStore.getState().currentGroupId).toBe('group1');

      useViewFilesStore.getState().openModal(mockFiles, 'group2');
      expect(useViewFilesStore.getState().currentGroupId).toBe('group2');
    });

    it('should properly clean up on store reset', () => {
      const mockFiles: ExtractedFile[] = [
        {
          id: '1',
          name: 'file.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/file.jpg',
          uploadedAt: '2025-01-01T00:00:00Z',
          senderName: 'User',
        },
      ];

      useViewFilesStore.getState().openModal(mockFiles, 'group1');
      const state1 = useViewFilesStore.getState();

      expect(state1.isModalOpen).toBe(true);
      expect(state1.allFiles.length).toBe(1);

      useViewFilesStore.getState().reset();

      const state2 = useViewFilesStore.getState();
      expect(state2.isModalOpen).toBe(false);
      expect(state2.allFiles.length).toBe(0);
    });
  });
});

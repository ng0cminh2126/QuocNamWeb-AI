/**
 * Integration Tests - ViewAllFilesModal System
 * Tests component integration with store, hooks, and utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewAllFilesModal from '@/components/files/ViewAllFilesModal';
import { useViewFilesStore } from '@/stores/viewFilesStore';
import { useViewFiles } from '@/hooks/useViewFiles';
import { useFileFiltering } from '@/hooks/useFileFiltering';
import type { ExtractedFile, MessageDto } from '@/types/files';

// Mock data with various file types
const mockMessages: MessageDto[] = [
  {
    id: 'msg1',
    content: 'Here are some images',
    attachments: [
      {
        id: 'att1',
        name: 'photo1.jpg',
        contentType: 'image/jpeg',
        size: 1024 * 100,
        url: 'https://example.com/photo1.jpg',
      },
      {
        id: 'att2',
        name: 'photo2.png',
        contentType: 'image/png',
        size: 1024 * 150,
        url: 'https://example.com/photo2.png',
      },
    ],
    createdAt: '2025-01-09T10:00:00Z',
    senderName: 'Alice',
    senderId: 'user1',
  },
  {
    id: 'msg2',
    content: 'Check this document',
    attachments: [
      {
        id: 'att3',
        name: 'report.pdf',
        contentType: 'application/pdf',
        size: 1024 * 200,
        url: 'https://example.com/report.pdf',
      },
    ],
    createdAt: '2025-01-08T10:00:00Z',
    senderName: 'Bob',
    senderId: 'user2',
  },
  {
    id: 'msg3',
    content: 'Video presentation',
    attachments: [
      {
        id: 'att4',
        name: 'demo.mp4',
        contentType: 'video/mp4',
        size: 1024 * 500,
        url: 'https://example.com/demo.mp4',
      },
    ],
    createdAt: '2025-01-07T10:00:00Z',
    senderName: 'Charlie',
    senderId: 'user3',
  },
];

describe('ViewAllFilesModal Integration Tests', () => {
  beforeEach(() => {
    // Reset store state
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

  describe('Modal Open/Close Flow', () => {
    it('should open modal when files are loaded via hook', () => {
      const { result } = renderHook(() => useViewFiles());

      act(() => {
        result.current.openModal(mockMessages, 'group1', 'workType1');
      });

      expect(useViewFilesStore.getState().isModalOpen).toBe(true);
      expect(useViewFilesStore.getState().allFiles.length).toBeGreaterThan(0);
    });

    it('should extract files from messages on modal open', () => {
      const { result } = renderHook(() => useViewFiles());

      act(() => {
        result.current.openModal(mockMessages, 'group1');
      });

      const state = useViewFilesStore.getState();
      expect(state.allFiles.length).toBe(4); // 4 attachments total
    });

    it('should close modal and reset state', () => {
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
    });

    it('should preserve group and worktype across modal operations', () => {
      const { result } = renderHook(() => useViewFiles());

      act(() => {
        result.current.openModal(mockMessages, 'group-123', 'type-456');
      });

      let state = useViewFilesStore.getState();
      expect(state.currentGroupId).toBe('group-123');
      expect(state.currentWorkTypeId).toBe('type-456');

      // Perform some filtering
      const filterStore = useViewFilesStore.getState();
      act(() => {
        filterStore.setFilters({ images: false });
      });

      state = useViewFilesStore.getState();
      expect(state.currentGroupId).toBe('group-123');
      expect(state.currentWorkTypeId).toBe('type-456');
    });
  });

  describe('Filter & Sort Integration', () => {
    beforeEach(() => {
      const store = useViewFilesStore.getState();
      const mockFiles: ExtractedFile[] = [
        {
          id: '1',
          name: 'photo.jpg',
          contentType: 'image/jpeg',
          size: 1024 * 100,
          url: 'https://example.com/photo.jpg',
          uploadedAt: '2025-01-09T10:00:00Z',
          senderName: 'Alice',
        },
        {
          id: '2',
          name: 'document.pdf',
          contentType: 'application/pdf',
          size: 1024 * 200,
          url: 'https://example.com/document.pdf',
          uploadedAt: '2025-01-08T10:00:00Z',
          senderName: 'Bob',
        },
        {
          id: '3',
          name: 'video.mp4',
          contentType: 'video/mp4',
          size: 1024 * 500,
          url: 'https://example.com/video.mp4',
          uploadedAt: '2025-01-07T10:00:00Z',
          senderName: 'Charlie',
        },
      ];

      store.openModal(mockFiles, 'group1');
    });

    it('should filter files by type and reflect in displayed files', () => {
      const store = useViewFilesStore.getState();

      // Filter to only images
      store.setFilters({ images: true, pdf: false, videos: false });

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles.length).toBe(1);
      expect(state.filteredFiles[0].contentType).toBe('image/jpeg');
      expect(state.displayedFiles.length).toBe(1);
    });

    it('should apply sort option to filtered results', () => {
      const store = useViewFilesStore.getState();

      // Sort by oldest
      store.setSortBy('oldest');

      const state = useViewFilesStore.getState();
      const oldestFile = state.filteredFiles[0];
      const newestFile = state.filteredFiles[state.filteredFiles.length - 1];

      expect(new Date(oldestFile.uploadedAt).getTime()).toBeLessThan(
        new Date(newestFile.uploadedAt).getTime()
      );
    });

    it('should combine filter and sort operations', () => {
      const store = useViewFilesStore.getState();

      // Filter + Sort
      store.setFilters({ images: false, pdf: true, videos: true });
      store.setSortBy('size-desc');

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles.length).toBe(2); // pdf + video

      // Should be sorted by size descending
      if (state.filteredFiles.length > 1) {
        expect(state.filteredFiles[0].size).toBeGreaterThanOrEqual(
          state.filteredFiles[1].size
        );
      }
    });

    it('should reset filters and show all files', () => {
      const store = useViewFilesStore.getState();

      // Apply filters
      store.setFilters({ images: false });
      expect(store.getState().filteredFiles.length).toBeLessThan(3);

      // Reset
      store.resetFilters();

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles.length).toBe(3);
    });
  });

  describe('Search Integration', () => {
    beforeEach(() => {
      const store = useViewFilesStore.getState();
      const mockFiles: ExtractedFile[] = [
        {
          id: '1',
          name: 'document-2025.pdf',
          contentType: 'application/pdf',
          size: 1024 * 100,
          url: 'https://example.com/document-2025.pdf',
          uploadedAt: '2025-01-09T10:00:00Z',
          senderName: 'Alice',
        },
        {
          id: '2',
          name: 'report-final.pdf',
          contentType: 'application/pdf',
          size: 1024 * 200,
          url: 'https://example.com/report-final.pdf',
          uploadedAt: '2025-01-08T10:00:00Z',
          senderName: 'Bob',
        },
        {
          id: '3',
          name: 'presentation.pptx',
          contentType: 'application/powerpoint',
          size: 1024 * 300,
          url: 'https://example.com/presentation.pptx',
          uploadedAt: '2025-01-07T10:00:00Z',
          senderName: 'Charlie',
        },
      ];

      store.openModal(mockFiles, 'group1');
    });

    it('should filter files by search query', () => {
      const store = useViewFilesStore.getState();
      store.setSearchQuery('document');

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles.length).toBe(1);
      expect(state.filteredFiles[0].name).toContain('document');
    });

    it('should search case-insensitively', () => {
      const store = useViewFilesStore.getState();
      store.setSearchQuery('DOCUMENT');

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles.length).toBe(1);
      expect(state.filteredFiles[0].name.toLowerCase()).toContain('document');
    });

    it('should clear search and show all files', () => {
      const store = useViewFilesStore.getState();
      store.setSearchQuery('document');
      expect(store.getState().filteredFiles.length).toBe(1);

      store.clearSearch();

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles.length).toBe(3);
      expect(state.searchQuery).toBe('');
    });

    it('should combine search with filters', () => {
      const store = useViewFilesStore.getState();

      // Search for PDFs only
      store.setSearchQuery('report');
      store.setFilters({ pdf: true, powerpoint: false });

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles.length).toBe(1);
      expect(state.filteredFiles[0].name).toBe('report-final.pdf');
    });
  });

  describe('Pagination Integration', () => {
    beforeEach(() => {
      const store = useViewFilesStore.getState();
      const manyFiles = Array.from({ length: 150 }, (_, i) => ({
        id: String(i),
        name: `file-${i}.jpg`,
        contentType: 'image/jpeg',
        size: 1024 * (i + 1),
        url: `https://example.com/file-${i}.jpg`,
        uploadedAt: new Date(Date.now() - i * 1000 * 60).toISOString(),
        senderName: 'User',
      }));

      store.openModal(manyFiles, 'group1');
    });

    it('should paginate with locked page size (50 items)', () => {
      const state = useViewFilesStore.getState();
      expect(state.pageSize).toBe(50);
      expect(state.displayedFiles.length).toBe(50);
    });

    it('should navigate between pages', () => {
      const store = useViewFilesStore.getState();

      expect(store.getState().currentPage).toBe(1);

      store.nextPage();
      expect(store.getState().currentPage).toBe(2);

      store.prevPage();
      expect(store.getState().currentPage).toBe(1);
    });

    it('should display correct items for each page', () => {
      const store = useViewFilesStore.getState();

      let state = store.getState();
      const page1FirstId = state.displayedFiles[0].id;
      expect(page1FirstId).toBe('0');

      store.nextPage();

      state = store.getState();
      const page2FirstId = state.displayedFiles[0].id;
      expect(page2FirstId).toBe('50');
    });

    it('should reset pagination when filters change', () => {
      const store = useViewFilesStore.getState();

      store.nextPage();
      expect(store.getState().currentPage).toBe(2);

      store.setFilters({ videos: false });

      expect(store.getState().currentPage).toBe(1);
    });

    it('should reset pagination when search changes', () => {
      const store = useViewFilesStore.getState();

      store.nextPage();
      store.nextPage();
      expect(store.getState().currentPage).toBe(3);

      store.setSearchQuery('file');

      expect(store.getState().currentPage).toBe(1);
    });
  });

  describe('Preview Integration', () => {
    beforeEach(() => {
      const store = useViewFilesStore.getState();
      const mockFiles: ExtractedFile[] = [
        {
          id: '1',
          name: 'image1.jpg',
          contentType: 'image/jpeg',
          size: 1024 * 100,
          url: 'https://example.com/image1.jpg',
          uploadedAt: '2025-01-09T10:00:00Z',
          senderName: 'Alice',
        },
        {
          id: '2',
          name: 'image2.jpg',
          contentType: 'image/jpeg',
          size: 1024 * 100,
          url: 'https://example.com/image2.jpg',
          uploadedAt: '2025-01-08T10:00:00Z',
          senderName: 'Bob',
        },
        {
          id: '3',
          name: 'image3.jpg',
          contentType: 'image/jpeg',
          size: 1024 * 100,
          url: 'https://example.com/image3.jpg',
          uploadedAt: '2025-01-07T10:00:00Z',
          senderName: 'Charlie',
        },
      ];

      store.openModal(mockFiles, 'group1');
    });

    it('should set preview file with position', () => {
      const store = useViewFilesStore.getState();
      const fileToPreview = store.getState().filteredFiles[1];

      store.setPreviewFile(fileToPreview, 1);

      const state = store.getState();
      expect(state.previewFile?.id).toBe(fileToPreview.id);
      expect(state.previewPosition).toBe(1);
    });

    it('should navigate to next file in preview', () => {
      const store = useViewFilesStore.getState();

      store.setPreviewFile(store.getState().filteredFiles[0], 0);
      store.nextPreview();

      const state = store.getState();
      expect(state.previewPosition).toBe(1);
    });

    it('should navigate to previous file in preview', () => {
      const store = useViewFilesStore.getState();

      store.setPreviewFile(store.getState().filteredFiles[2], 2);
      store.prevPreview();

      const state = store.getState();
      expect(state.previewPosition).toBe(1);
    });

    it('should clear preview', () => {
      const store = useViewFilesStore.getState();

      store.setPreviewFile(store.getState().filteredFiles[0], 0);
      expect(store.getState().previewFile).not.toBeNull();

      store.clearPreview();

      const state = store.getState();
      expect(state.previewFile).toBeNull();
      expect(state.previewPosition).toBeNull();
    });
  });

  describe('Complex User Flows', () => {
    beforeEach(() => {
      const store = useViewFilesStore.getState();
      const mockFiles: ExtractedFile[] = [
        {
          id: '1',
          name: 'photo.jpg',
          contentType: 'image/jpeg',
          size: 1024 * 100,
          url: 'https://example.com/photo.jpg',
          uploadedAt: '2025-01-09T10:00:00Z',
          senderName: 'Alice',
        },
        {
          id: '2',
          name: 'document.pdf',
          contentType: 'application/pdf',
          size: 1024 * 200,
          url: 'https://example.com/document.pdf',
          uploadedAt: '2025-01-08T10:00:00Z',
          senderName: 'Bob',
        },
        {
          id: '3',
          name: 'spreadsheet.xlsx',
          contentType: 'application/excel',
          size: 1024 * 150,
          url: 'https://example.com/spreadsheet.xlsx',
          uploadedAt: '2025-01-07T10:00:00Z',
          senderName: 'Charlie',
        },
      ];

      store.openModal(mockFiles, 'group1');
    });

    it('should handle: open → search → filter → sort', () => {
      const store = useViewFilesStore.getState();

      // Start: 3 files
      expect(store.getState().filteredFiles.length).toBe(3);

      // Search for specific file
      store.setSearchQuery('doc');
      expect(store.getState().filteredFiles.length).toBe(1);

      // Clear search and apply filter
      store.clearSearch();
      store.setFilters({ images: false, powerpoint: false });

      // Should have pdf + excel (2 files)
      const state = store.getState();
      expect(state.filteredFiles.length).toBe(2);

      // Sort by size
      store.setSortBy('size-desc');
      const state2 = store.getState();
      expect(state2.filteredFiles[0].size).toBeGreaterThan(
        state2.filteredFiles[1].size
      );
    });

    it('should handle: filter → search → preview → sort', () => {
      const store = useViewFilesStore.getState();

      // Start with documents only
      store.setFilters({ images: false });
      expect(store.getState().filteredFiles.length).toBe(2);

      // Search for pdf
      store.setSearchQuery('pdf');
      expect(store.getState().filteredFiles.length).toBe(1);

      // Preview it
      store.setPreviewFile(store.getState().filteredFiles[0], 0);
      expect(store.getState().previewFile).not.toBeNull();

      // Clear and sort all by newest
      store.clearSearch();
      store.setSortBy('newest');

      const state = store.getState();
      expect(state.filteredFiles.length).toBe(2); // back to documents
      expect(state.filteredFiles[0].id).toBe('2'); // pdf is newer
    });

    it('should reset to initial state', () => {
      const store = useViewFilesStore.getState();

      // Apply multiple operations
      store.setSearchQuery('test');
      store.setFilters({ images: false });
      store.setSortBy('oldest');
      store.goToPage(2);

      expect(store.getState().searchQuery).not.toBe('');
      expect(store.getState().currentPage).not.toBe(1);

      // Reset
      store.reset();

      const state = store.getState();
      expect(state.isModalOpen).toBe(false);
      expect(state.searchQuery).toBe('');
      expect(state.currentPage).toBe(1);
      expect(state.sortBy).toBe('newest');
    });
  });
});

// Helper render hook function for tests
function renderHook<T>(hook: () => T) {
  let result: { current: T } = { current: undefined as any };

  function TestComponent() {
    result.current = hook();
    return null;
  }

  render(<TestComponent />);
  return { result };
}

// Helper act function for state updates
function act(callback: () => void) {
  callback();
}

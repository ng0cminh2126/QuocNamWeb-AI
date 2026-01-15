/**
 * View Files Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
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
];

describe('viewFilesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
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

  describe('modal state', () => {
    it('should open modal with files', () => {
      const store = useViewFilesStore.getState();
      store.openModal(mockFiles, 'group1', 'workType1');

      const state = useViewFilesStore.getState();
      expect(state.isModalOpen).toBe(true);
      expect(state.currentGroupId).toBe('group1');
      expect(state.currentWorkTypeId).toBe('workType1');
      expect(state.allFiles.length).toBe(3);
    });

    it('should close modal', () => {
      const store = useViewFilesStore.getState();
      store.openModal(mockFiles, 'group1');
      store.closeModal();

      const state = useViewFilesStore.getState();
      expect(state.isModalOpen).toBe(false);
      expect(state.currentGroupId).toBeNull();
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      const store = useViewFilesStore.getState();
      store.openModal(mockFiles, 'group1');
    });

    it('should filter images only', () => {
      const store = useViewFilesStore.getState();
      store.setFilters({ pdf: false });

      const state = useViewFilesStore.getState();
      const imageCount = state.filteredFiles.filter((f) =>
        f.contentType.startsWith('image/')
      ).length;
      expect(imageCount).toBe(2);
      expect(state.filteredFiles.some((f) => f.contentType === 'application/pdf')).toBe(
        false
      );
    });

    it('should reset all filters', () => {
      const store = useViewFilesStore.getState();
      store.setFilters({ images: false, pdf: false });
      store.resetFilters();

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles.length).toBe(3);
    });
  });

  describe('sorting', () => {
    beforeEach(() => {
      const store = useViewFilesStore.getState();
      store.openModal(mockFiles, 'group1');
    });

    it('should sort by newest', () => {
      const store = useViewFilesStore.getState();
      store.setSortBy('newest');

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles[0].id).toBe('3'); // 2025-01-03
      expect(state.filteredFiles[1].id).toBe('2'); // 2025-01-02
      expect(state.filteredFiles[2].id).toBe('1'); // 2025-01-01
    });

    it('should sort by oldest', () => {
      const store = useViewFilesStore.getState();
      store.setSortBy('oldest');

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles[0].id).toBe('1'); // 2025-01-01
      expect(state.filteredFiles[1].id).toBe('2'); // 2025-01-02
      expect(state.filteredFiles[2].id).toBe('3'); // 2025-01-03
    });

    it('should sort by size', () => {
      const store = useViewFilesStore.getState();
      store.setSortBy('size-desc');

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles[0].size).toBe(1024 * 200); // document.pdf
      expect(state.filteredFiles[1].size).toBe(1024 * 150); // image2.jpg
      expect(state.filteredFiles[2].size).toBe(1024 * 100); // image1.jpg
    });
  });

  describe('search', () => {
    beforeEach(() => {
      const store = useViewFilesStore.getState();
      store.openModal(mockFiles, 'group1');
    });

    it('should search by filename', () => {
      const store = useViewFilesStore.getState();
      store.setSearchQuery('image');

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles.length).toBe(2); // image1.jpg, image2.jpg
      expect(state.filteredFiles.every((f) => f.name.includes('image'))).toBe(true);
    });

    it('should clear search', () => {
      const store = useViewFilesStore.getState();
      store.setSearchQuery('image');
      store.clearSearch();

      const state = useViewFilesStore.getState();
      expect(state.searchQuery).toBe('');
      expect(state.filteredFiles.length).toBe(3);
    });

    it('should search case-insensitively', () => {
      const store = useViewFilesStore.getState();
      store.setSearchQuery('IMAGE');

      const state = useViewFilesStore.getState();
      expect(state.filteredFiles.length).toBe(2);
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      const store = useViewFilesStore.getState();
      store.openModal(mockFiles, 'group1');
    });

    it('should display correct page size (locked: 50)', () => {
      const state = useViewFilesStore.getState();
      expect(state.pageSize).toBe(50);
    });

    it('should go to next page', () => {
      const store = useViewFilesStore.getState();
      // Create enough files to have multiple pages
      const manyFiles = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        name: `file-${i}.jpg`,
        contentType: 'image/jpeg',
        size: 1024,
        url: `https://example.com/file-${i}.jpg`,
        uploadedAt: new Date().toISOString(),
        senderName: 'User',
      }));
      store.openModal(manyFiles, 'group1');
      store.nextPage();

      const state = useViewFilesStore.getState();
      expect(state.currentPage).toBe(2);
    });

    it('should go to previous page', () => {
      const store = useViewFilesStore.getState();
      const manyFiles = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        name: `file-${i}.jpg`,
        contentType: 'image/jpeg',
        size: 1024,
        url: `https://example.com/file-${i}.jpg`,
        uploadedAt: new Date().toISOString(),
        senderName: 'User',
      }));
      store.openModal(manyFiles, 'group1');
      store.nextPage();
      store.prevPage();

      const state = useViewFilesStore.getState();
      expect(state.currentPage).toBe(1);
    });

    it('should go to specific page', () => {
      const store = useViewFilesStore.getState();
      const manyFiles = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        name: `file-${i}.jpg`,
        contentType: 'image/jpeg',
        size: 1024,
        url: `https://example.com/file-${i}.jpg`,
        uploadedAt: new Date().toISOString(),
        senderName: 'User',
      }));
      store.openModal(manyFiles, 'group1');
      store.goToPage(2); // With 100 files and 50 per page, we have exactly 2 pages

      const state = useViewFilesStore.getState();
      expect(state.currentPage).toBe(2);
    });
  });

  describe('preview', () => {
    beforeEach(() => {
      const store = useViewFilesStore.getState();
      store.openModal(mockFiles, 'group1');
    });

    it('should preview file', () => {
      const store = useViewFilesStore.getState();
      store.setPreviewFile(mockFiles[0], 0);

      const state = useViewFilesStore.getState();
      expect(state.previewFile?.id).toBe('1');
      expect(state.previewPosition).toBe(0);
    });

    it('should navigate to next preview', () => {
      const store = useViewFilesStore.getState();
      store.setPreviewFile(mockFiles[0], 0);
      store.nextPreview();

      const state = useViewFilesStore.getState();
      expect(state.previewFile?.id).toBe('2');
      expect(state.previewPosition).toBe(1);
    });

    it('should navigate to previous preview', () => {
      const store = useViewFilesStore.getState();
      store.setPreviewFile(mockFiles[1], 1);
      store.prevPreview();

      const state = useViewFilesStore.getState();
      expect(state.previewFile?.id).toBe('1');
      expect(state.previewPosition).toBe(0);
    });

    it('should clear preview', () => {
      const store = useViewFilesStore.getState();
      store.setPreviewFile(mockFiles[0], 0);
      store.clearPreview();

      const state = useViewFilesStore.getState();
      expect(state.previewFile).toBeNull();
      expect(state.previewPosition).toBeNull();
    });
  });

  describe('loading and error states', () => {
    it('should set loading state', () => {
      const store = useViewFilesStore.getState();
      store.setLoading(true);

      const state = useViewFilesStore.getState();
      expect(state.isLoading).toBe(true);
    });

    it('should set error state', () => {
      const store = useViewFilesStore.getState();
      store.setError('Failed to load files');

      const state = useViewFilesStore.getState();
      expect(state.error).toBe('Failed to load files');
    });
  });

  describe('reset', () => {
    it('should reset entire store', () => {
      const store = useViewFilesStore.getState();
      store.openModal(mockFiles, 'group1');
      store.reset();

      const state = useViewFilesStore.getState();
      expect(state.isModalOpen).toBe(false);
      expect(state.allFiles.length).toBe(0);
      expect(state.searchQuery).toBe('');
      expect(state.currentPage).toBe(1);
    });
  });
});

/**
 * File Sorting Utility Tests
 */

import { describe, it, expect } from 'vitest';
import {
  sortFiles,
  sortByNewest,
  sortByOldest,
  sortByName,
  sortByLargeSize,
  sortBySmallSize,
  getSortLabel,
  getAvailableSortOptions,
} from '@/utils/fileSorting';
import type { ExtractedFile } from '@/types/files';

const mockFiles: ExtractedFile[] = [
  {
    id: '1',
    name: 'zebra.pdf',
    contentType: 'application/pdf',
    size: 1024 * 100, // 100 KB
    url: 'https://example.com/zebra.pdf',
    uploadedAt: '2025-01-01T10:00:00Z',
    senderName: 'Alice',
  },
  {
    id: '2',
    name: 'apple.jpg',
    contentType: 'image/jpeg',
    size: 1024 * 50, // 50 KB
    url: 'https://example.com/apple.jpg',
    uploadedAt: '2025-01-03T10:00:00Z',
    senderName: 'Bob',
  },
  {
    id: '3',
    name: 'middle.docx',
    contentType: 'application/msword',
    size: 1024 * 200, // 200 KB
    url: 'https://example.com/middle.docx',
    uploadedAt: '2025-01-02T10:00:00Z',
    senderName: 'Charlie',
  },
];

describe('fileSorting', () => {
  describe('sortFiles', () => {
    it('should sort by newest (default)', () => {
      const result = sortFiles(mockFiles);
      expect(result[0].id).toBe('2'); // 2025-01-03
      expect(result[1].id).toBe('3'); // 2025-01-02
      expect(result[2].id).toBe('1'); // 2025-01-01
    });

    it('should sort by oldest', () => {
      const result = sortFiles(mockFiles, 'oldest');
      expect(result[0].id).toBe('1'); // 2025-01-01
      expect(result[1].id).toBe('3'); // 2025-01-02
      expect(result[2].id).toBe('2'); // 2025-01-03
    });

    it('should sort by name ascending', () => {
      const result = sortFiles(mockFiles, 'name-asc');
      expect(result[0].name).toBe('apple.jpg');
      expect(result[1].name).toBe('middle.docx');
      expect(result[2].name).toBe('zebra.pdf');
    });

    it('should sort by size descending (largest first)', () => {
      const result = sortFiles(mockFiles, 'size-desc');
      expect(result[0].size).toBe(1024 * 200); // 200 KB
      expect(result[1].size).toBe(1024 * 100); // 100 KB
      expect(result[2].size).toBe(1024 * 50); // 50 KB
    });

    it('should sort by size ascending (smallest first)', () => {
      const result = sortFiles(mockFiles, 'size-asc');
      expect(result[0].size).toBe(1024 * 50); // 50 KB
      expect(result[1].size).toBe(1024 * 100); // 100 KB
      expect(result[2].size).toBe(1024 * 200); // 200 KB
    });

    it('should not mutate original array', () => {
      const original = [...mockFiles];
      sortFiles(mockFiles, 'name-asc');
      expect(mockFiles).toEqual(original);
    });
  });

  describe('sortByNewest', () => {
    it('should sort files by newest first', () => {
      const result = sortByNewest(mockFiles);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });
  });

  describe('sortByOldest', () => {
    it('should sort files by oldest first', () => {
      const result = sortByOldest(mockFiles);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('2');
    });
  });

  describe('sortByName', () => {
    it('should sort files by name alphabetically', () => {
      const result = sortByName(mockFiles);
      expect(result[0].name).toBe('apple.jpg');
      expect(result[1].name).toBe('middle.docx');
      expect(result[2].name).toBe('zebra.pdf');
    });
  });

  describe('sortByLargeSize', () => {
    it('should sort files by size largest first', () => {
      const result = sortByLargeSize(mockFiles);
      expect(result[0].size).toBe(1024 * 200);
      expect(result[1].size).toBe(1024 * 100);
      expect(result[2].size).toBe(1024 * 50);
    });
  });

  describe('sortBySmallSize', () => {
    it('should sort files by size smallest first', () => {
      const result = sortBySmallSize(mockFiles);
      expect(result[0].size).toBe(1024 * 50);
      expect(result[1].size).toBe(1024 * 100);
      expect(result[2].size).toBe(1024 * 200);
    });
  });

  describe('getSortLabel', () => {
    it('should return Vietnamese label for newest', () => {
      expect(getSortLabel('newest')).toBe('Mới nhất');
    });

    it('should return Vietnamese label for oldest', () => {
      expect(getSortLabel('oldest')).toBe('Cũ nhất');
    });

    it('should return Vietnamese label for name-asc', () => {
      expect(getSortLabel('name-asc')).toBe('Tên (A-Z)');
    });

    it('should return Vietnamese label for size-desc', () => {
      expect(getSortLabel('size-desc')).toBe('Kích thước (Lớn → Nhỏ)');
    });

    it('should return Vietnamese label for size-asc', () => {
      expect(getSortLabel('size-asc')).toBe('Kích thước (Nhỏ → Lớn)');
    });
  });

  describe('getAvailableSortOptions', () => {
    it('should return sort options for media', () => {
      const options = getAvailableSortOptions('media');
      expect(options).toContain('newest');
      expect(options).toContain('oldest');
      expect(options).toContain('name-asc');
      expect(options).toContain('size-desc');
      expect(options).toContain('size-asc');
    });

    it('should return sort options for docs', () => {
      const options = getAvailableSortOptions('docs');
      expect(options).toContain('newest');
      expect(options).toContain('oldest');
      expect(options).toContain('name-asc');
      expect(options).toContain('size-desc');
      expect(options).toContain('size-asc');
    });
  });
});

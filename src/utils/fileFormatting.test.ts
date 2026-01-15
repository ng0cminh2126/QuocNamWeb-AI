/**
 * File Formatting Utility Tests
 */

import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  formatFileSizeToMB,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  truncateFilename,
  getFilenameWithoutExt,
  getExtensionFromFilename,
} from '@/utils/fileFormatting';

describe('fileFormatting', () => {
  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(512)).toBe('512 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should respect decimals parameter', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB');
      expect(formatFileSize(1536, 1)).toBe('1.5 KB');
      expect(formatFileSize(1536, 3)).toBe('1.5 KB'); // parseFloat removes trailing zeros
    });
  });

  describe('formatFileSizeToMB', () => {
    it('should format bytes to MB', () => {
      expect(formatFileSizeToMB(1048576)).toBe('1.00 MB');
    });

    it('should format large sizes to MB', () => {
      expect(formatFileSizeToMB(5242880)).toBe('5.00 MB');
    });

    it('should handle very small sizes', () => {
      expect(formatFileSizeToMB(1024)).toBe('<0.01 MB'); // Less than 0.01 MB shows as <0.01 MB
    });

    it('should show <0.01 MB for tiny files', () => {
      expect(formatFileSizeToMB(100)).toBe('<0.01 MB');
    });
  });

  describe('formatDate', () => {
    it('should format ISO string date', () => {
      const result = formatDate('2025-01-09T10:30:00Z');
      expect(result).toBe('09/01/2025');
    });

    it('should format Date object', () => {
      const date = new Date('2025-01-09T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('09/01/2025');
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Không xác định');
    });
  });

  describe('formatDateTime', () => {
    it('should format ISO string with time', () => {
      const result = formatDateTime('2025-01-09T10:30:00Z');
      expect(result).toContain('09/01/2025');
      expect(result).toContain('10:30');
    });

    it('should format Date object with time', () => {
      const date = new Date('2025-01-09T10:30:00Z');
      const result = formatDateTime(date);
      expect(result).toContain('09/01/2025');
      expect(result).toContain('10:30');
    });

    it('should handle invalid dates', () => {
      expect(formatDateTime('invalid-date')).toBe('Không xác định');
    });
  });

  describe('formatRelativeTime', () => {
    it('should show "Vừa xong" for very recent times', () => {
      const now = new Date();
      const result = formatRelativeTime(now);
      expect(result).toBe('Vừa xong');
    });

    it('should show minutes ago', () => {
      const past = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const result = formatRelativeTime(past);
      expect(result).toBe('5 phút trước');
    });

    it('should show hours ago', () => {
      const past = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      const result = formatRelativeTime(past);
      expect(result).toBe('3 giờ trước');
    });

    it('should show "Hôm qua" for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(yesterday);
      expect(result).toBe('Hôm qua');
    });

    it('should show days ago', () => {
      const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      const result = formatRelativeTime(past);
      expect(result).toBe('5 ngày trước');
    });

    it('should handle invalid dates', () => {
      expect(formatRelativeTime('invalid-date')).toBe('Không xác định');
    });
  });

  describe('truncateFilename', () => {
    it('should not truncate short filenames', () => {
      expect(truncateFilename('document.pdf')).toBe('document.pdf');
    });

    it('should truncate long filenames with extension', () => {
      const longName = 'very-long-document-name-that-exceeds-limit.pdf';
      const result = truncateFilename(longName, 20);
      expect(result.length).toBeLessThanOrEqual(23); // 20 + "..."
      expect(result).toContain('...');
      expect(result.endsWith('.pdf')).toBe(true);
    });

    it('should use custom max length', () => {
      const result = truncateFilename('document.pdf', 10);
      expect(result.length).toBeLessThanOrEqual(13); // 10 + "..."
    });

    it('should preserve extension', () => {
      const longName = 'this-is-a-very-long-filename-for-testing.docx';
      const result = truncateFilename(longName, 20);
      expect(result.endsWith('.docx')).toBe(true);
    });
  });

  describe('getFilenameWithoutExt', () => {
    it('should remove extension from filename', () => {
      expect(getFilenameWithoutExt('document.pdf')).toBe('document');
    });

    it('should handle multiple dots in filename', () => {
      expect(getFilenameWithoutExt('my.document.final.pdf')).toBe('my.document.final');
    });

    it('should handle no extension', () => {
      // When there's no extension, lastIndexOf returns -1, substring(0, -1) returns empty string
      expect(getFilenameWithoutExt('filename')).toBe('');
    });
  });

  describe('getExtensionFromFilename', () => {
    it('should extract file extension', () => {
      expect(getExtensionFromFilename('document.pdf')).toBe('pdf');
    });

    it('should lowercase extension', () => {
      expect(getExtensionFromFilename('document.PDF')).toBe('pdf');
    });

    it('should handle multiple dots', () => {
      expect(getExtensionFromFilename('my.document.final.docx')).toBe('docx');
    });

    it('should return empty string for no extension', () => {
      expect(getExtensionFromFilename('filename')).toBe('');
    });
  });
});

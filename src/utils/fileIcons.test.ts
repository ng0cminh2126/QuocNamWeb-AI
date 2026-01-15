/**
 * File Icons & Type Mapping Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getFileIcon,
  getFileTypeColor,
  getFileTypeBadgeColor,
  getFileTypeLabel,
  getFileCategory,
  isPlayableMedia,
  getCategoryCounts,
  getCategoryBadgeColor,
  getCategoryBadgeBgColor,
} from '@/utils/fileIcons';
import { File, FileImage, FileVideo } from 'lucide-react';
import type { ExtractedFile } from '@/types/files';

describe('fileIcons', () => {
  describe('getFileIcon', () => {
    it('should return image icon for image files', () => {
      const result = getFileIcon('image/jpeg');
      expect(result).toBe(FileImage);
    });

    it('should return video icon for video files', () => {
      const result = getFileIcon('video/mp4');
      expect(result).toBe(FileVideo);
    });

    it('should return default icon for unknown types', () => {
      const result = getFileIcon('application/unknown');
      expect(result).toBe(File);
    });

    it('should work with file object', () => {
      const file: ExtractedFile = {
        id: '1',
        name: 'photo.jpg',
        contentType: 'image/jpeg',
        size: 1024,
        url: 'https://example.com/photo.jpg',
        uploadedAt: '2025-01-09T10:00:00Z',
        senderName: 'Alice',
      };
      expect(getFileIcon(file)).toBe(FileImage);
    });
  });

  describe('getFileTypeColor', () => {
    it('should return color for images', () => {
      expect(getFileTypeColor('image/jpeg')).toBe('text-blue-500');
    });

    it('should return color for videos', () => {
      expect(getFileTypeColor('video/mp4')).toBe('text-red-500');
    });

    it('should return color for PDFs', () => {
      expect(getFileTypeColor('application/pdf')).toBe('text-red-600');
    });

    it('should return color for Word docs', () => {
      expect(getFileTypeColor('application/msword')).toBe('text-blue-600');
    });

    it('should return color for Excel files', () => {
      expect(getFileTypeColor('application/excel')).toBe('text-green-600');
    });

    it('should return default color for unknown types', () => {
      expect(getFileTypeColor('application/unknown')).toBe('text-gray-400');
    });
  });

  describe('getFileTypeBadgeColor', () => {
    it('should return badge color for images', () => {
      expect(getFileTypeBadgeColor('image/jpeg')).toBe('bg-blue-100');
    });

    it('should return badge color for videos', () => {
      expect(getFileTypeBadgeColor('video/mp4')).toBe('bg-red-100');
    });

    it('should return badge color for PDFs', () => {
      expect(getFileTypeBadgeColor('application/pdf')).toBe('bg-red-100');
    });

    it('should return default badge color for unknown types', () => {
      expect(getFileTypeBadgeColor('application/unknown')).toBe('bg-gray-100');
    });
  });

  describe('getFileTypeLabel', () => {
    it('should return Vietnamese label for images', () => {
      expect(getFileTypeLabel('image/jpeg')).toBe('Hình ảnh');
    });

    it('should return Vietnamese label for videos', () => {
      expect(getFileTypeLabel('video/mp4')).toBe('Video');
    });

    it('should return Vietnamese label for PDFs', () => {
      expect(getFileTypeLabel('application/pdf')).toBe('PDF');
    });

    it('should return Vietnamese label for Word', () => {
      expect(getFileTypeLabel('application/msword')).toBe('Tài liệu Word');
    });

    it('should return Vietnamese label for Excel', () => {
      expect(getFileTypeLabel('application/excel')).toBe('Bảng tính Excel');
    });

    it('should return default label for unknown types', () => {
      expect(getFileTypeLabel('application/unknown')).toBe('Tệp');
    });
  });

  describe('getFileCategory', () => {
    it('should categorize image files', () => {
      expect(getFileCategory('image/jpeg')).toBe('image');
      expect(getFileCategory('image/png')).toBe('image');
    });

    it('should categorize video files', () => {
      expect(getFileCategory('video/mp4')).toBe('video');
    });

    it('should categorize audio files', () => {
      expect(getFileCategory('audio/mp3')).toBe('audio');
    });

    it('should categorize document files', () => {
      expect(getFileCategory('application/pdf')).toBe('document');
      expect(getFileCategory('application/msword')).toBe('document');
      expect(getFileCategory('text/plain')).toBe('document');
    });

    it('should categorize unknown files as other', () => {
      expect(getFileCategory('application/unknown')).toBe('other');
    });
  });

  describe('isPlayableMedia', () => {
    it('should return true for images', () => {
      expect(isPlayableMedia('image/jpeg')).toBe(true);
    });

    it('should return true for videos', () => {
      expect(isPlayableMedia('video/mp4')).toBe(true);
    });

    it('should return false for documents', () => {
      expect(isPlayableMedia('application/pdf')).toBe(false);
    });

    it('should return false for audio', () => {
      expect(isPlayableMedia('audio/mp3')).toBe(false);
    });
  });

  describe('getCategoryCounts', () => {
    it('should count files by category', () => {
      const files: ExtractedFile[] = [
        {
          id: '1',
          name: 'photo.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/photo.jpg',
          uploadedAt: '2025-01-09T10:00:00Z',
          senderName: 'Alice',
        },
        {
          id: '2',
          name: 'video.mp4',
          contentType: 'video/mp4',
          size: 1024,
          url: 'https://example.com/video.mp4',
          uploadedAt: '2025-01-09T10:00:00Z',
          senderName: 'Bob',
        },
        {
          id: '3',
          name: 'document.pdf',
          contentType: 'application/pdf',
          size: 1024,
          url: 'https://example.com/document.pdf',
          uploadedAt: '2025-01-09T10:00:00Z',
          senderName: 'Charlie',
        },
      ];

      const counts = getCategoryCounts(files);
      expect(counts.image).toBe(1);
      expect(counts.video).toBe(1);
      expect(counts.document).toBe(1);
      expect(counts.audio).toBe(0);
      expect(counts.other).toBe(0);
    });

    it('should return zero counts for empty array', () => {
      const counts = getCategoryCounts([]);
      expect(counts.image).toBe(0);
      expect(counts.video).toBe(0);
      expect(counts.document).toBe(0);
      expect(counts.audio).toBe(0);
      expect(counts.other).toBe(0);
    });
  });

  describe('getCategoryBadgeColor', () => {
    it('should return text color for image category', () => {
      expect(getCategoryBadgeColor('image')).toBe('text-blue-700');
    });

    it('should return text color for video category', () => {
      expect(getCategoryBadgeColor('video')).toBe('text-red-700');
    });

    it('should return text color for document category', () => {
      expect(getCategoryBadgeColor('document')).toBe('text-gray-700');
    });

    it('should return text color for audio category', () => {
      expect(getCategoryBadgeColor('audio')).toBe('text-indigo-700');
    });
  });

  describe('getCategoryBadgeBgColor', () => {
    it('should return background color for image category', () => {
      expect(getCategoryBadgeBgColor('image')).toBe('bg-blue-50');
    });

    it('should return background color for video category', () => {
      expect(getCategoryBadgeBgColor('video')).toBe('bg-red-50');
    });

    it('should return background color for document category', () => {
      expect(getCategoryBadgeBgColor('document')).toBe('bg-gray-50');
    });

    it('should return background color for audio category', () => {
      expect(getCategoryBadgeBgColor('audio')).toBe('bg-indigo-50');
    });
  });
});

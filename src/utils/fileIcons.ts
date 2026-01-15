/**
 * File Icon & Type Mapping Utility
 * Map file types to icons and display information
 * @module utils/fileIcons
 */

import {
  File,
  FileImage,
  FileVideo,
  FileText,
  FileCode,
  FileArchive,
  Music,
  LucideIcon,
} from 'lucide-react';

import type { ExtractedFile } from '@/types/files';

/**
 * Color scheme for different file types
 */
export const FILE_TYPE_COLORS = {
  image: 'text-blue-500',
  video: 'text-red-500',
  pdf: 'text-red-600',
  word: 'text-blue-600',
  excel: 'text-green-600',
  powerpoint: 'text-orange-600',
  text: 'text-gray-600',
  code: 'text-purple-600',
  archive: 'text-yellow-600',
  audio: 'text-indigo-600',
  other: 'text-gray-400',
};

/**
 * Get appropriate icon for file type
 * @param file - File object or content type
 * @returns Lucide icon component
 *
 * @example
 * const icon = getFileIcon(file);
 * const pdfIcon = getFileIcon('application/pdf');
 */
export function getFileIcon(
  file: ExtractedFile | string
): LucideIcon {
  const contentType = typeof file === 'string' ? file : file.contentType;

  if (contentType.startsWith('image/')) return FileImage;
  if (contentType.startsWith('video/')) return FileVideo;
  if (contentType.startsWith('audio/')) return Music;

  if (contentType.includes('pdf')) return FileText;
  if (
    contentType.includes('word') ||
    contentType.includes('document') ||
    contentType.includes('msword')
  ) {
    return FileText;
  }
  if (
    contentType.includes('excel') ||
    contentType.includes('spreadsheet')
  ) {
    return FileCode;
  }
  if (
    contentType.includes('powerpoint') ||
    contentType.includes('presentation')
  ) {
    return FileCode;
  }

  if (contentType.startsWith('text/')) return FileText;
  if (
    contentType.includes('zip') ||
    contentType.includes('rar') ||
    contentType.includes('archive')
  ) {
    return FileArchive;
  }

  return File;
}

/**
 * Get color class for file type
 * @param file - File object or content type
 * @returns Tailwind color class
 *
 * @example
 * const colorClass = getFileTypeColor(file); // 'text-blue-500'
 */
export function getFileTypeColor(
  file: ExtractedFile | string
): string {
  const contentType = typeof file === 'string' ? file : file.contentType;

  if (contentType.startsWith('image/')) return FILE_TYPE_COLORS.image;
  if (contentType.startsWith('video/')) return FILE_TYPE_COLORS.video;
  if (contentType.startsWith('audio/')) return FILE_TYPE_COLORS.audio;

  if (contentType.includes('pdf')) return FILE_TYPE_COLORS.pdf;
  if (
    contentType.includes('word') ||
    contentType.includes('document') ||
    contentType.includes('msword')
  ) {
    return FILE_TYPE_COLORS.word;
  }
  if (
    contentType.includes('excel') ||
    contentType.includes('spreadsheet')
  ) {
    return FILE_TYPE_COLORS.excel;
  }
  if (
    contentType.includes('powerpoint') ||
    contentType.includes('presentation')
  ) {
    return FILE_TYPE_COLORS.powerpoint;
  }

  if (contentType.startsWith('text/')) return FILE_TYPE_COLORS.text;
  if (contentType.includes('code')) return FILE_TYPE_COLORS.code;
  if (
    contentType.includes('zip') ||
    contentType.includes('rar') ||
    contentType.includes('archive')
  ) {
    return FILE_TYPE_COLORS.archive;
  }

  return FILE_TYPE_COLORS.other;
}

/**
 * Get badge background color for file type
 * @param file - File object or content type
 * @returns Tailwind background color class
 *
 * @example
 * const bgClass = getFileTypeBadgeColor(file); // 'bg-blue-100'
 */
export function getFileTypeBadgeColor(
  file: ExtractedFile | string
): string {
  const contentType = typeof file === 'string' ? file : file.contentType;

  if (contentType.startsWith('image/')) return 'bg-blue-100';
  if (contentType.startsWith('video/')) return 'bg-red-100';
  if (contentType.startsWith('audio/')) return 'bg-indigo-100';

  if (contentType.includes('pdf')) return 'bg-red-100';
  if (
    contentType.includes('word') ||
    contentType.includes('document') ||
    contentType.includes('msword')
  ) {
    return 'bg-blue-100';
  }
  if (
    contentType.includes('excel') ||
    contentType.includes('spreadsheet')
  ) {
    return 'bg-green-100';
  }
  if (
    contentType.includes('powerpoint') ||
    contentType.includes('presentation')
  ) {
    return 'bg-orange-100';
  }

  if (contentType.startsWith('text/')) return 'bg-gray-100';
  if (contentType.includes('code')) return 'bg-purple-100';
  if (
    contentType.includes('zip') ||
    contentType.includes('rar') ||
    contentType.includes('archive')
  ) {
    return 'bg-yellow-100';
  }

  return 'bg-gray-100';
}

/**
 * Get human-readable file type label
 * @param file - File object or content type
 * @returns Display label
 *
 * @example
 * getFileTypeLabel(file) // 'PDF File'
 * getFileTypeLabel('image/jpeg') // 'Image'
 */
export function getFileTypeLabel(
  file: ExtractedFile | string
): string {
  const contentType = typeof file === 'string' ? file : file.contentType;

  if (contentType.startsWith('image/')) return 'Hình ảnh';
  if (contentType.startsWith('video/')) return 'Video';
  if (contentType.startsWith('audio/')) return 'Âm thanh';

  if (contentType.includes('pdf')) return 'PDF';
  if (
    contentType.includes('word') ||
    contentType.includes('document') ||
    contentType.includes('msword')
  ) {
    return 'Tài liệu Word';
  }
  if (
    contentType.includes('excel') ||
    contentType.includes('spreadsheet')
  ) {
    return 'Bảng tính Excel';
  }
  if (
    contentType.includes('powerpoint') ||
    contentType.includes('presentation')
  ) {
    return 'Trình chiếu PowerPoint';
  }

  if (contentType.startsWith('text/')) return 'Tệp văn bản';
  if (contentType.includes('code') || contentType === 'text/plain') {
    return 'Tệp mã';
  }
  if (
    contentType.includes('zip') ||
    contentType.includes('rar') ||
    contentType.includes('archive')
  ) {
    return 'Tệp nén';
  }

  return 'Tệp';
}

/**
 * Get category for file type grouping
 * @param file - File object or content type
 * @returns Category ('image', 'video', 'document', 'audio', 'other')
 *
 * @example
 * getFileCategory(file) // 'document'
 */
export function getFileCategory(
  file: ExtractedFile | string
): 'image' | 'video' | 'document' | 'audio' | 'other' {
  const contentType = typeof file === 'string' ? file : file.contentType;

  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.startsWith('audio/')) return 'audio';
  if (
    contentType.includes('document') ||
    contentType.includes('word') ||
    contentType.includes('excel') ||
    contentType.includes('powerpoint') ||
    contentType.includes('pdf') ||
    contentType.startsWith('text/')
  ) {
    return 'document';
  }

  return 'other';
}

/**
 * Check if file is playable media
 * @param file - File object or content type
 * @returns True if image or video
 */
export function isPlayableMedia(file: ExtractedFile | string): boolean {
  const category = getFileCategory(file);
  return category === 'image' || category === 'video';
}

/**
 * Get file type category with count
 * @param files - Array of files
 * @returns Object with counts by category
 *
 * @example
 * getCategoryCounts(files)
 * // { image: 5, video: 2, document: 8, audio: 1, other: 0 }
 */
export function getCategoryCounts(
  files: ExtractedFile[]
): Record<string, number> {
  const counts = {
    image: 0,
    video: 0,
    document: 0,
    audio: 0,
    other: 0,
  };

  files.forEach((file) => {
    const category = getFileCategory(file);
    counts[category]++;
  });

  return counts;
}

/**
 * Get badge color text for category
 * @param category - File category
 * @returns Tailwind text color class
 */
export function getCategoryBadgeColor(
  category: 'image' | 'video' | 'document' | 'audio' | 'other'
): string {
  const colors = {
    image: 'text-blue-700',
    video: 'text-red-700',
    document: 'text-gray-700',
    audio: 'text-indigo-700',
    other: 'text-gray-500',
  };

  return colors[category];
}

/**
 * Get badge background color for category
 * @param category - File category
 * @returns Tailwind background color class
 */
export function getCategoryBadgeBgColor(
  category: 'image' | 'video' | 'document' | 'audio' | 'other'
): string {
  const colors = {
    image: 'bg-blue-50',
    video: 'bg-red-50',
    document: 'bg-gray-50',
    audio: 'bg-indigo-50',
    other: 'bg-gray-50',
  };

  return colors[category];
}

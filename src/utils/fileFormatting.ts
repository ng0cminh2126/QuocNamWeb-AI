/**
 * File Formatting Utility
 * Format file-related data for display
 * @module utils/fileFormatting
 */

/**
 * Format bytes to human-readable size (B, KB, MB, GB)
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted size string
 *
 * @example
 * formatFileSize(1024) // '1.00 KB'
 * formatFileSize(1048576) // '1.00 MB'
 * formatFileSize(512) // '512 B'
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format bytes to MB for display (used in list view)
 * @param bytes - File size in bytes
 * @returns Formatted size string in MB
 *
 * @example
 * formatFileSizeToMB(1048576) // '1 MB'
 * formatFileSizeToMB(5242880) // '5 MB'
 */
export function formatFileSizeToMB(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 0.01) return '<0.01 MB';
  return mb.toFixed(2) + ' MB';
}

/**
 * Format date to human-readable format
 * @param date - Date string or Date object
 * @returns Formatted date in Vietnamese locale
 *
 * @example
 * formatDate('2025-01-09T10:30:00Z') // '09/01/2025'
 * formatDate(new Date()) // Today's date formatted
 */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) {
    return 'Không xác định';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Không xác định';
  }

  return dateObj.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format date with time
 * @param date - Date string or Date object
 * @returns Formatted datetime in Vietnamese locale
 *
 * @example
 * formatDateTime('2025-01-09T10:30:00Z') // '09/01/2025 10:30'
 */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) {
    return 'Không xác định';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Không xác định';
  }

  return dateObj.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date as relative time (e.g., "2 days ago")
 * @param date - Date string or Date object
 * @returns Relative time string in Vietnamese
 *
 * @example
 * formatRelativeTime('2025-01-08T10:30:00Z') // 'Hôm qua'
 * formatRelativeTime('2025-01-01T10:30:00Z') // '8 ngày trước'
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) {
    return 'Không xác định';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Không xác định';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return formatDate(dateObj);
}

/**
 * Truncate filename to max length with ellipsis
 * @param filename - Full filename with extension
 * @param maxLength - Maximum length (default: 30)
 * @returns Truncated filename
 *
 * @example
 * truncateFilename('very-long-document-name.pdf', 20) // 'very-long-document...'
 */
export function truncateFilename(filename: string, maxLength = 30): string {
  if (filename.length <= maxLength) return filename;

  const ext = filename.substring(filename.lastIndexOf('.'));
  const name = filename.substring(0, filename.lastIndexOf('.'));
  const availableLength = maxLength - ext.length - 3; // -3 for "..."

  return name.substring(0, availableLength) + '...' + ext;
}

/**
 * Get filename without extension
 * @param filename - Full filename with extension
 * @returns Filename without extension
 *
 * @example
 * getFilenameWithoutExt('document.pdf') // 'document'
 */
export function getFilenameWithoutExt(filename: string): string {
  return filename.substring(0, filename.lastIndexOf('.'));
}

/**
 * Get file extension from filename
 * @param filename - Full filename with extension
 * @returns File extension (without dot)
 *
 * @example
 * getExtensionFromFilename('document.pdf') // 'pdf'
 */
export function getExtensionFromFilename(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot + 1).toLowerCase();
}

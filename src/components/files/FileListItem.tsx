/**
 * File List Item Component (List View Item)
 * Displays a single file in list layout
 */

import { Download, Eye, MoreVertical } from 'lucide-react';
import { getFileIcon, getFileTypeColor, getFileTypeLabel } from '@/utils/fileIcons';
import { formatFileSize, formatDate } from '@/utils/fileFormatting';
import { useViewFilesStore } from '@/stores/viewFilesStore';
import type { FileListItemProps } from '@/types/files';

export default function FileListItem({
  file,
  onPreview,
  position,
}: FileListItemProps) {
  const Icon = getFileIcon(file);
  const iconColor = getFileTypeColor(file);
  const typeLabel = getFileTypeLabel(file);
  const { previewFile } = useViewFilesStore();

  const isPreviewActive = previewFile?.id === file.id;

  const handlePreview = () => {
    onPreview?.(file, position);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group ${
        isPreviewActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-blue-400 bg-white hover:bg-gray-50'
      }`}
      onClick={handlePreview}
      data-testid={`chat-file-list-item-${file.id}`}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 p-2 bg-gray-100 rounded-lg"
        data-testid={`chat-file-list-item-icon-${file.id}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        {/* Filename */}
        <p
          className="text-sm font-medium text-gray-900 truncate"
          title={file.name}
          data-testid={`chat-file-list-item-name-${file.id}`}
        >
          {file.name}
        </p>

        {/* Metadata Row */}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-500">
            {typeLabel}
          </span>
          <span className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(file.uploadedAt)}
          </span>
        </div>
      </div>

      {/* Sender Info (Optional - shown on hover) */}
      {file.senderName && (
        <div
          className="hidden group-hover:flex flex-col items-end text-xs text-gray-500"
          data-testid={`chat-file-list-item-sender-${file.id}`}
        >
          <span className="font-medium text-gray-700">{file.senderName}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePreview();
          }}
          className="p-1.5 hover:bg-blue-100 rounded transition-colors"
          title="Preview"
          data-testid={`chat-file-list-item-preview-button-${file.id}`}
        >
          <Eye className="h-4 w-4 text-blue-600" />
        </button>
        <button
          onClick={handleDownload}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Download"
          data-testid={`chat-file-list-item-download-button-${file.id}`}
        >
          <Download className="h-4 w-4 text-gray-600" />
        </button>
        <button
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="More options"
          data-testid={`chat-file-list-item-more-button-${file.id}`}
        >
          <MoreVertical className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

/**
 * File List Component
 * List layout display for files
 */

import { FileListProps } from '@/types/files';
import FileListItem from './FileListItem';

export default function FileList({
  files,
  onPreviewFile,
}: FileListProps) {
  if (!files || files.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-12 text-gray-500"
        data-testid="chat-file-list-empty"
      >
        <div className="text-center">
          <p className="text-sm">Không có file nào</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-2"
      data-testid="chat-file-list-container"
    >
      {files.map((file, index) => (
        <FileListItem
          key={file.id}
          file={file}
          position={index}
          onPreview={onPreviewFile}
        />
      ))}
    </div>
  );
}

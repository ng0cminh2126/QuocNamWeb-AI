/**
 * File Grid Component
 * Grid layout display for files
 */

import { FileGridProps } from '@/types/files';
import FileCard from './FileCard';

export default function FileGrid({
  files,
  onPreviewFile,
}: FileGridProps) {
  if (!files || files.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-12 text-gray-500"
        data-testid="chat-file-grid-empty"
      >
        <div className="text-center">
          <p className="text-sm">Không có file nào</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      data-testid="chat-file-grid-container"
    >
      {files.map((file, index) => (
        <FileCard
          key={file.id}
          file={file}
          position={index}
          onPreview={onPreviewFile}
        />
      ))}
    </div>
  );
}

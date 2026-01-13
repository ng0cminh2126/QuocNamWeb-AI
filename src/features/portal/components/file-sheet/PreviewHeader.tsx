/**
 * PreviewHeader Component
 *
 * Displays file name and close button at the top of preview modal.
 * Phase 5: No download functionality (preview-only)
 * Style matches PDF/Image preview modal
 *
 * @module components/portal/components/file-sheet/PreviewHeader
 */

import { FileText, Sheet } from "lucide-react";

/**
 * Get file icon and color based on file extension
 */
function getFileIcon(fileName: string): {
  Icon: typeof FileText | typeof Sheet;
  colorClass: string;
} {
  const ext = fileName.toLowerCase().split(".").pop() || "";

  if (ext === "xlsx" || ext === "xls") {
    return { Icon: Sheet, colorClass: "text-green-500" };
  }
  if (ext === "docx" || ext === "doc") {
    return { Icon: FileText, colorClass: "text-blue-500" };
  }

  // Default
  return { Icon: FileText, colorClass: "text-blue-600" };
}

export interface PreviewHeaderProps {
  /** File name to display */
  fileName: string;

  /** Callback when close button clicked */
  onClose: () => void;
}

/**
 * Preview header with file info and close button
 * Matches styling of PDF/Image modal header
 *
 * @example
 * <PreviewHeader
 *   fileName="Report.docx"
 *   onClose={() => setOpen(false)}
 * />
 */
export default function PreviewHeader({
  fileName,
  onClose,
}: PreviewHeaderProps) {
  const { Icon, colorClass } = getFileIcon(fileName);

  return (
    <div
      className="flex h-[60px] items-center justify-between border-b border-gray-200 bg-white px-6"
      data-testid="file-preview-modal-header"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <Icon className={`h-6 w-6 flex-shrink-0 ${colorClass}`} />
        <h2
          className="truncate text-lg font-semibold text-gray-900"
          title={fileName}
          data-testid="file-preview-modal-filename"
        >
          {fileName}
        </h2>
      </div>
      <button
        onClick={onClose}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-gray-800 transition-colors hover:bg-gray-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Đóng"
        data-testid="file-preview-modal-close-button"
      >
        <span className="text-lg font-medium">✕</span>
      </button>
    </div>
  );
}

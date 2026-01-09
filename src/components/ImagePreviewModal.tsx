import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { getImagePreview, createBlobUrl, revokeBlobUrl } from "@/api/files.api";

interface ImagePreviewModalProps {
  /** Whether modal is open */
  open: boolean;
  /** Callback when modal is closed */
  onOpenChange: (open: boolean) => void;
  /** File ID to preview */
  fileId: string | null;
  /** Optional file name for download */
  fileName?: string;
}

/**
 * Image preview modal with full-size watermarked image
 *
 * Features:
 * - Shows full-size watermarked preview
 * - Loading skeleton during fetch
 * - Error handling
 * - Download button
 * - Cleanup blob URL on close
 *
 * @example
 * ```tsx
 * const [previewFileId, setPreviewFileId] = useState<string | null>(null);
 *
 * <ImagePreviewModal
 *   open={!!previewFileId}
 *   onOpenChange={(open) => !open && setPreviewFileId(null)}
 *   fileId={previewFileId}
 *   fileName="screenshot.png"
 * />
 * ```
 */
export default function ImagePreviewModal({
  open,
  onOpenChange,
  fileId,
  fileName,
}: ImagePreviewModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!open || !fileId) {
      setImageUrl(null);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    let blobUrl: string | null = null;

    async function loadPreview() {
      if (!fileId) return;

      try {
        setIsLoading(true);
        setHasError(false);

        const blob = await getImagePreview(fileId);
        blobUrl = createBlobUrl(blob);
        setImageUrl(blobUrl);
      } catch (error) {
        console.error("Failed to load image preview:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadPreview();

    // Cleanup blob URL when modal closes
    return () => {
      if (blobUrl) {
        revokeBlobUrl(blobUrl);
      }
    };
  }, [open, fileId]);

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName || "image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl w-[90vw] max-h-[90vh] p-0"
        data-testid="image-preview-modal"
      >
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>{fileName || "Xem ảnh"}</span>
            <div className="flex gap-2">
              {imageUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  data-testid="image-preview-download-button"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                data-testid="image-preview-close-button"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 overflow-auto">
          {isLoading && (
            <div
              className="w-full h-[60vh] bg-gray-200 animate-pulse rounded-lg"
              data-testid="image-preview-skeleton"
            />
          )}

          {hasError && (
            <div
              className="w-full h-[60vh] flex items-center justify-center bg-gray-100 rounded-lg text-gray-400"
              data-testid="image-preview-error"
            >
              <span>Không thể tải ảnh</span>
            </div>
          )}

          {!isLoading && !hasError && imageUrl && (
            <img
              src={imageUrl}
              alt={fileName || "Preview"}
              className="w-full h-auto rounded-lg"
              data-testid="image-preview-image"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

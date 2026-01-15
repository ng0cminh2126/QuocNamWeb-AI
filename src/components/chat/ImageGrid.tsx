import type { AttachmentDto } from "@/types/messages";
import ImageGridItem from "./ImageGridItem";

/**
 * Props for ImageGrid component
 */
export interface ImageGridProps {
  /** Array of image attachments to display */
  images: AttachmentDto[];
  /** Callback when an image is clicked */
  onImageClick: (fileId: string, fileName: string) => void;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Phase 2: Image grid component for displaying multiple images
 *
 * Features:
 * - Responsive grid: 3 columns desktop/tablet, 2 columns mobile (<640px)
 * - Lazy loading with Intersection Observer
 * - Aspect ratio 1:1 for all images
 * - Click to preview
 *
 * @param props ImageGridProps
 * @returns ImageGrid component
 *
 * @example
 * ```tsx
 * <ImageGrid
 *   images={message.attachments.filter(isImage)}
 *   onImageClick={(fileId, fileName) => {
 *     setPreviewImage({ fileId, fileName });
 *     setShowPreview(true);
 *   }}
 * />
 * ```
 */
export default function ImageGrid({
  images,
  onImageClick,
  className = "",
}: ImageGridProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="image-grid"
      className={`grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-full sm:max-w-[400px] ${className}`}
    >
      {images.map((image) => (
        <ImageGridItem
          key={image.fileId}
          fileId={image.fileId}
          fileName={image.fileName || "Image"}
          onClick={() => onImageClick(image.fileId, image.fileName || "Image")}
        />
      ))}
    </div>
  );
}

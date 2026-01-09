import { useState, useEffect, useRef } from "react";
import { getImageThumbnail } from "@/api/files.api";

export interface MessageImageProps {
  fileId: string;
  fileName: string;
  onPreviewClick: (fileId: string) => void;
}

/**
 * Image message component with lazy loading (Intersection Observer)
 * Displays watermarked thumbnail, opens preview modal on click
 */
export default function MessageImage({
  fileId,
  fileName,
  onPreviewClick,
}: MessageImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Lazy load: Setup Intersection Observer
  useEffect(() => {
    // Fallback for browsers without Intersection Observer support
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true); // Load immediately (graceful degradation)
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Load only once
        }
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "50px", // Preload 50px before visible
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Fetch thumbnail when visible
  useEffect(() => {
    if (!isVisible || imageUrl || error) return;

    const fetchThumbnail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const blob = await getImageThumbnail(fileId, "large");
        const blobUrl = URL.createObjectURL(blob);
        setImageUrl(blobUrl);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load image")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchThumbnail();
  }, [isVisible, fileId, imageUrl, error]);

  // Cleanup: Revoke blob URL
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Handle click - Open preview modal
  const handleClick = () => {
    onPreviewClick(fileId);
  };

  // Render: Not visible yet → Empty placeholder (reserve space to prevent layout shift)
  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        data-testid="message-image-placeholder"
        className="w-full max-w-[320px] bg-gray-100 rounded-lg"
        style={{ aspectRatio: "4/3" }}
      />
    );
  }

  // Render: Loading → Skeleton loader (fixed dimensions to prevent layout shift)
  if (isLoading) {
    return (
      <div
        data-testid="image-skeleton-loader"
        className="w-[320px] h-[220px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg"
      />
    );
  }

  // Render: Error → Error placeholder (clickable, fixed dimensions)
  if (error) {
    return (
      <div
        data-testid="image-error-placeholder"
        onClick={handleClick}
        className="w-full max-w-[320px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
        style={{ aspectRatio: "4/3" }}
      >
        <svg
          className="w-12 h-12 text-gray-400 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm text-gray-500">Failed to load image</p>
        <p className="text-xs text-gray-400 mt-1">Click to try preview</p>
      </div>
    );
  }

  // Render: Success → Image (clickable, smooth fade-in)
  return (
    <div
      data-testid="message-image-container"
      className="w-full max-w-[320px] max-h-[220px] cursor-pointer group overflow-hidden rounded-lg"
      onClick={handleClick}
    >
      <img
        data-testid="message-image"
        src={imageUrl!}
        alt={fileName}
        className="w-full h-full object-cover transition-all duration-200 group-hover:opacity-90"
      />
    </div>
  );
}

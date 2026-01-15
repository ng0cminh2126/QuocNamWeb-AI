/**
 * File Preview Types
 *
 * Type definitions for PDF/Image preview modal feature.
 * Supports multi-page PDF navigation with pagination.
 *
 * @module types/filePreview
 */

/**
 * Request parameters for file preview API
 * GET /api/Files/{id}/preview
 */
export interface FilePreviewRequest {
  /** File ID (GUID) */
  fileId: string;

  /** Page number to preview (optional, defaults to 1) */
  page?: number;
}

/**
 * Response from file preview API
 * Includes binary image data and pagination headers
 */
export interface FilePreviewResponse {
  /** Binary image data (Blob) */
  data: Blob;

  /** Response headers with pagination info */
  headers: {
    /** Total number of pages (from X-Total-Pages header) */
    "x-total-pages": string;

    /** Current page number (from X-Current-Page header) */
    "x-current-page": string;

    /** Content type (e.g., image/png) */
    "content-type": string;
  };
}

/**
 * Request parameters for PDF page rendering API
 * GET /api/pdf/{fileId}/pages/{pageNumber}/render?dpi=300
 */
export interface PdfRenderRequest {
  /** File ID (GUID) */
  fileId: string;

  /** Page number to render (1-based) */
  pageNumber: number;

  /** DPI for rendering quality (default: 300) */
  dpi?: number;
}

/**
 * Response from PDF render API
 */
export interface PdfRenderResponse {
  /** Binary PNG image data */
  data: Blob;

  /** Response headers */
  headers: {
    /** Content type (image/png) */
    "content-type": string;
  };
}

/**
 * Metadata for a PDF page in cache
 */
export interface PdfPageMetadata {
  /** Page number (1-based) */
  pageNumber: number;

  /** Object URL for the rendered image */
  imageUrl: string;

  /** File ID this page belongs to */
  fileId: string;

  /** Timestamp when cached (for cache invalidation) */
  cachedAt: Date;
}

/**
 * State for PDF preview modal
 */
export interface PdfPreviewState {
  /** Currently displayed page number */
  currentPage: number;

  /** Total number of pages (from X-Total-Pages header) */
  totalPages: number | null;

  /** Object URL for current page image */
  imageUrl: string | null;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;
}

/**
 * Cache entry for page images
 */
export interface PageCacheEntry {
  /** Object URL for the image */
  url: string;

  /** Timestamp when cached */
  timestamp: number;
}

/**
 * Cache map for storing page images
 * Key format: "{fileId}-{pageNumber}"
 */
export type PageCache = Map<string, PageCacheEntry>;

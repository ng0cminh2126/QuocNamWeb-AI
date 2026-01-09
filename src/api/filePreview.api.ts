/**
 * File Preview API Client
 *
 * Provides functions to fetch file preview and render PDF pages.
 * Uses separate API client for file service endpoints.
 *
 * @module api/filePreview
 */

import axios from "axios";
import { getAccessToken } from "@/lib/auth/tokenStorage";
import { API_ENDPOINTS } from "@/config/env.config";
import type {
  FilePreviewRequest,
  FilePreviewResponse,
  PdfRenderRequest,
  PdfRenderResponse,
} from "@/types/filePreview";

// Use file API endpoint
const FILE_API_BASE_URL = API_ENDPOINTS.file;

/**
 * File API client (separate from main chat API)
 * Includes auth token in requests
 */
const fileApiClient = axios.create({
  baseURL: FILE_API_BASE_URL,
  timeout: 30000,
  responseType: "blob", // Expect binary data
});

// Add auth token to requests
fileApiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Disable cache to avoid 304 Not Modified
    config.headers["Cache-Control"] = "no-cache";
    config.headers["Pragma"] = "no-cache";
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 304 Not Modified as success
fileApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Axios treats 304 as error, but it should be success
    if (error.response?.status === 304) {
      return error.response;
    }
    return Promise.reject(error);
  }
);

/**
 * Get file preview (first page for PDF, full image for images)
 * Returns binary image data + pagination headers
 *
 * @param request - File preview request parameters
 * @returns Promise with image blob and headers
 * @throws Error nếu không tìm thấy tệp (404) hoặc lỗi kết nối mạng
 *
 * @example
 * const result = await getFilePreview({ fileId: "abc-123" });
 * const totalPages = parseInt(result.headers['x-total-pages'] || '1');
 * const imageUrl = URL.createObjectURL(result.data);
 */
export async function getFilePreview(
  request: FilePreviewRequest
): Promise<FilePreviewResponse> {
  try {
    const pageNumber = request.page || 1;
    const response = await fileApiClient.get<Blob>(
      `/api/Files/${request.fileId}/preview?page=${pageNumber}`,
      {
        responseType: "blob",
      }
    );

    return {
      data: response.data,
      headers: {
        "x-total-pages":
          response.headers["x-total-pages"] ||
          response.headers["X-Total-Pages"] ||
          "1",
        "x-current-page":
          response.headers["x-current-page"] ||
          response.headers["X-Current-Page"] ||
          "1",
        "content-type": response.headers["content-type"] || "image/png",
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy tệp");
      }
      throw new Error(
        `Không thể tải xem trước: ${
          error.response?.statusText || error.message
        }`
      );
    }
    throw error;
  }
}

/**
 * Render a specific PDF page as PNG image
 * Used for pages 2+ (page 1 comes from getFilePreview)
 *
 * @param request - PDF render request parameters
 * @returns Promise with PNG image blob
 * @throws Error nếu không tìm thấy trang (404) hoặc lỗi kết nối mạng
 *
 * @example
 * const result = await renderPdfPage({
 *   fileId: "abc-123",
 *   pageNumber: 2,
 *   dpi: 300
 * });
 * const imageUrl = URL.createObjectURL(result.data);
 */
export async function renderPdfPage(
  request: PdfRenderRequest
): Promise<PdfRenderResponse> {
  try {
    const params = new URLSearchParams();
    params.append("page", request.pageNumber.toString());
    if (request.dpi) {
      params.append("dpi", request.dpi.toString());
    } else {
      params.append("dpi", "300"); // Default DPI
    }

    const response = await fileApiClient.get<Blob>(
      `/api/pdf/${request.fileId}/pages/${
        request.pageNumber
      }/render?${params.toString()}`,
      {
        responseType: "blob",
      }
    );

    return {
      data: response.data,
      headers: {
        "content-type": response.headers["content-type"] || "image/png",
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy trang");
      }
      throw new Error(
        `Không thể hiển thị trang: ${
          error.response?.statusText || error.message
        }`
      );
    }
    throw error;
  }
}

/**
 * Create an object URL from blob data
 * Should be revoked when no longer needed to prevent memory leaks
 *
 * @param blob - Image blob data
 * @returns Object URL string
 *
 * @example
 * const url = createObjectUrl(blob);
 * // Use url in <img src={url} />
 * // Later: URL.revokeObjectURL(url);
 */
export function createObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke an object URL to free memory
 *
 * @param url - Object URL to revoke
 *
 * @example
 * revokeObjectUrl(imageUrl);
 */
export function revokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}

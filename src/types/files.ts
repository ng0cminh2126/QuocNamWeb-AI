// File related types

import type { ID, Timestamps } from "./common";
import type { User } from "./auth";

export interface FileAttachment extends Timestamps {
  id: ID;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedById: ID;
  uploadedBy?: User;
  type: FileType;
}

export type FileType =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "pdf"
  | "archive"
  | "other";

// Phase 3.2: Supported file types for preview modal
export type SupportedPreviewFileType =
  | "pdf"
  | "word"
  | "excel"
  | "powerpoint"
  | "text"
  | "image";

export const SUPPORTED_FILE_EXTENSIONS: Record<
  SupportedPreviewFileType,
  readonly string[]
> = {
  pdf: [".pdf"],
  word: [".doc", ".docx"],
  excel: [".xls", ".xlsx"],
  powerpoint: [".ppt", ".pptx"],
  text: [".txt", ".rtf"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
} as const;

export const FILE_TYPE_ICONS: Record<SupportedPreviewFileType, string> = {
  pdf: "📄",
  word: "📝",
  excel: "📊",
  powerpoint: "📽️",
  text: "📃",
  image: "🖼️",
};

export const FILE_TYPE_LABELS: Record<SupportedPreviewFileType, string> = {
  pdf: "PDF",
  word: "Word",
  excel: "Excel",
  powerpoint: "PowerPoint",
  text: "Text",
  image: "Ảnh",
};

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export interface FileFolder {
  id: ID;
  name: string;
  parentId?: ID;
  groupId: ID;
  fileCount: number;
  createdById: ID;
  createdAt: string;
}

// API Request/Response types
export interface UploadFileRequest {
  file: File;
  groupId?: ID;
  folderId?: ID;
  messageId?: ID;
  taskId?: ID;
}

export interface UploadFileResponse {
  file: FileAttachment;
  url: string;
}

export interface FilesQueryParams {
  groupId?: ID;
  folderId?: ID;
  type?: FileType;
  search?: string;
  page?: number;
  pageSize?: number;
}

// File preview
export interface FilePreviewData {
  file: FileAttachment;
  previewUrl: string;
  canPreview: boolean;
  downloadUrl: string;
}

// Phase 1: File Upload UI (client-side only)
export interface SelectedFile {
  file: File;
  id: string; // Unique ID for React key
  preview?: string; // For image preview (optional)
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationRules {
  maxSize: number; // Max file size in bytes
  maxFiles: number; // Max number of files
  allowedTypes: string[]; // MIME types allowed
}

// Default validation rules for client-side validation
export const DEFAULT_FILE_RULES: FileValidationRules = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedTypes: [
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
};

// File type categories
export const FILE_CATEGORIES = {
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  SPREADSHEET: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;

// Phase 2: API Integration types

/**
 * Upload file result from Vega File API
 * Response from POST /api/Files endpoint
 */
export interface UploadFileResult {
  /** Unique file ID from server */
  fileId: string;
  /** Storage path where file is saved */
  storagePath: string;
  /** Original filename */
  fileName: string;
  /** MIME type */
  contentType: string;
  /** File size in bytes */
  size: number;
}

/**
 * Upload progress state for each file
 * Used to track upload progress in UI
 */
export interface FileUploadProgressState {
  /** SelectedFile.id */
  fileId: string;
  /** File name */
  fileName: string;
  /** Upload status */
  status: "pending" | "uploading" | "success" | "error";
  /** Progress percentage (0-100) */
  progress: number;
  /** Error message if failed */
  error?: string;
  /** Server-returned fileId if success */
  uploadedFileId?: string;
}

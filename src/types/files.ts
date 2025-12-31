// File related types

import type { ID, Timestamps } from './common';
import type { User } from './auth';

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
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'archive'
  | 'other';

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
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

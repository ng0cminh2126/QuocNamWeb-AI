# 📁 File Module - API Specification

> **Extracted from:** implementation_plan_20251226.md  
> **Last updated:** 2025-12-26

---

## 📡 REST Endpoints

### POST /api/files/upload

Upload file mới.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (binary)

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `groupId` | string | No | Group ID (for access control) |

**Response:**
```typescript
interface UploadFileResponse {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: "image" | "pdf" | "excel" | "word" | "other";
  size: number;
  mimeType: string;
  uploadedAt: string;
}
```

---

### GET /api/groups/:groupId/files

Lấy danh sách files trong group.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | No | Filter: image, pdf, excel, word, all |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response:**
```typescript
interface GroupFilesResponse {
  data: FileAttachment[];
  total: number;
  page: number;
  limit: number;
}

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: "image" | "pdf" | "excel" | "word" | "other";
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  messageId?: string;  // Message chứa file này
}
```

---

### DELETE /api/files/:id

Xoá file.

**Response:** `204 No Content`

---

## 📊 Query Keys

```typescript
export const filesKeys = {
  all: ['files'] as const,
  lists: () => [...filesKeys.all, 'list'] as const,
  list: (groupId: string, type?: string) => 
    [...filesKeys.lists(), groupId, type] as const,
};
```

---

## 📋 Implementation Checklist

- [ ] `src/api/files.api.ts` - API client functions
- [ ] `src/hooks/queries/useGroupFiles.ts` - Files list hook
- [ ] `src/hooks/mutations/useUploadFile.ts` - Upload mutation with progress
- [ ] `src/hooks/mutations/useDeleteFile.ts` - Delete mutation
- [ ] Integrate `FileManager.tsx`
- [ ] Integrate `FilePreviewModal.tsx`

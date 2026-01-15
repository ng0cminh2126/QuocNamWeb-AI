# API Contract - Batch File Upload

> **API:** POST /api/Files/batch  
> **Module:** file  
> **Feature:** batch-upload  
> **Version:** 1.0.0  
> **Status:** ⏳ PENDING SNAPSHOTS  
> **Created:** 2026-01-14

---

## 📋 Overview

| Property      | Value                                                    |
| ------------- | -------------------------------------------------------- |
| Endpoint      | `POST /api/Files/batch`                                  |
| Base URL      | `https://vega-file-api-dev.allianceitsc.com`             |
| Method        | POST                                                     |
| Content-Type  | `multipart/form-data`                                    |
| Auth Required | ✅ Yes (Bearer token)                                    |
| Description   | Upload multiple files in a single request (batch upload) |

---

## 📥 Request

### Headers

```http
Authorization: Bearer {access_token}
Content-Type: multipart/form-data; boundary=---WebKitFormBoundary...
```

### Request Body (multipart/form-data)

```
------WebKitFormBoundary...
Content-Disposition: form-data; name="files"; filename="file1.pdf"
Content-Type: application/pdf

<binary data of file1.pdf>
------WebKitFormBoundary...
Content-Disposition: form-data; name="files"; filename="file2.jpg"
Content-Type: image/jpeg

<binary data of file2.jpg>
------WebKitFormBoundary...
Content-Disposition: form-data; name="files"; filename="file3.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<binary data of file3.xlsx>
------WebKitFormBoundary...--
```

**TypeScript Interface:**

```typescript
// FormData construction
const formData = new FormData();
files.forEach((file) => {
  formData.append("files", file); // Multiple files with same field name
});
```

### Validation Rules

| Field        | Type   | Required | Max Size   | Allowed Extensions                                             |
| ------------ | ------ | -------- | ---------- | -------------------------------------------------------------- |
| files        | File[] | ✅ Yes   | 10MB/file  | .pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png, .gif, .webp |
| files        | -      | -        | 50MB total | Total batch size limit                                         |
| files.length | number | -        | 10 files   | Max files per batch                                            |

---

## 📤 Response

### Success Response (200 OK)

**TypeScript Interface:**

```typescript
interface BatchUploadResult {
  results: BatchUploadItemResult[];
  successCount: number;
  failureCount: number;
  totalCount: number;
}

interface BatchUploadItemResult {
  fileName: string;
  fileId?: string; // Present if upload succeeded
  fileUrl?: string; // Present if upload succeeded
  success: boolean;
  errorMessage?: string; // Present if upload failed
  fileSize?: number; // Bytes
  contentType?: string;
}
```

**Example Success Response:**

```json
{
  "results": [
    {
      "fileName": "report.pdf",
      "fileId": "f7b3c4a1-2d5e-4f8a-9b1c-3e4d5f6a7b8c",
      "fileUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/f7b3c4a1-2d5e-4f8a-9b1c-3e4d5f6a7b8c/download",
      "success": true,
      "fileSize": 2621440,
      "contentType": "application/pdf"
    },
    {
      "fileName": "photo.jpg",
      "fileId": "a8c2d3e4-5f6g-7h8i-9j0k-1l2m3n4o5p6q",
      "fileUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/a8c2d3e4-5f6g-7h8i-9j0k-1l2m3n4o5p6q/download",
      "success": true,
      "fileSize": 3984128,
      "contentType": "image/jpeg"
    },
    {
      "fileName": "data.xlsx",
      "fileId": "b9d3e4f5-6g7h-8i9j-0k1l-2m3n4o5p6q7r",
      "fileUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/b9d3e4f5-6g7h-8i9j-0k1l-2m3n4o5p6q7r/download",
      "success": true,
      "fileSize": 1258291,
      "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  ],
  "successCount": 3,
  "failureCount": 0,
  "totalCount": 3
}
```

**Partial Success Response (Some files failed):**

```json
{
  "results": [
    {
      "fileName": "report.pdf",
      "fileId": "f7b3c4a1-2d5e-4f8a-9b1c-3e4d5f6a7b8c",
      "fileUrl": "https://vega-file-api-dev.allianceitsc.com/api/Files/f7b3c4a1-2d5e-4f8a-9b1c-3e4d5f6a7b8c/download",
      "success": true,
      "fileSize": 2621440,
      "contentType": "application/pdf"
    },
    {
      "fileName": "large-file.zip",
      "success": false,
      "errorMessage": "File size exceeds maximum allowed size of 10MB"
    },
    {
      "fileName": "invalid.exe",
      "success": false,
      "errorMessage": "File type not allowed"
    }
  ],
  "successCount": 1,
  "failureCount": 2,
  "totalCount": 3
}
```

### Error Responses

| Status | Code               | Message                       | When                   |
| ------ | ------------------ | ----------------------------- | ---------------------- |
| 400    | `InvalidRequest`   | No files provided             | Request body rỗng      |
| 400    | `FileSizeExceeded` | Total batch size exceeds 50MB | Tổng size > 50MB       |
| 400    | `TooManyFiles`     | Maximum 10 files per batch    | files.length > 10      |
| 401    | `Unauthorized`     | Authentication required       | Missing/invalid token  |
| 413    | `PayloadTooLarge`  | Request entity too large      | Request > server limit |
| 500    | `ServerError`      | Internal server error         | Server exception       |

**Error Response Format:**

```typescript
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}
```

**Example Error Response (400):**

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Total batch size exceeds 50MB limit",
  "instance": "/api/Files/batch"
}
```

---

## 🔗 Snapshots

> ⚠️ **STATUS:** Chưa có snapshot thực tế từ API  
> **Action Required:** HUMAN cần capture response bằng cách:

### Cách capture snapshot:

**Option 1: Curl command**

```bash
curl -X POST "https://vega-file-api-dev.allianceitsc.com/api/Files/batch" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@file1.pdf" \
  -F "files=@file2.jpg" \
  -F "files=@file3.xlsx" \
  > snapshots/v1/success-3-files.json
```

**Option 2: Postman/Insomnia**

1. Tạo POST request tới `/api/Files/batch`
2. Thêm Bearer token vào Authorization
3. Body → form-data → Add multiple "files" fields
4. Send và copy response
5. Paste vào `snapshots/v1/success.json`

**Required Snapshots:**

- [ ] `snapshots/v1/success-3-files.json` - Upload 3 files thành công
- [ ] `snapshots/v1/success-1-file.json` - Upload 1 file (so sánh với single API)
- [ ] `snapshots/v1/partial-success.json` - 1 số file thành công, 1 số fail
- [ ] `snapshots/v1/error-400-no-files.json` - Request không có file
- [ ] `snapshots/v1/error-400-size-exceeded.json` - Tổng size > 50MB
- [ ] `snapshots/v1/error-401-unauthorized.json` - Missing token

### Snapshot Links:

- [Success - 3 files](./snapshots/v1/success-3-files.json) ⏳ PENDING
- [Success - 1 file](./snapshots/v1/success-1-file.json) ⏳ PENDING
- [Partial Success](./snapshots/v1/partial-success.json) ⏳ PENDING
- [Error - No Files](./snapshots/v1/error-400-no-files.json) ⏳ PENDING
- [Error - Size Exceeded](./snapshots/v1/error-400-size-exceeded.json) ⏳ PENDING
- [Error - Unauthorized](./snapshots/v1/error-401-unauthorized.json) ⏳ PENDING

---

## 📝 Implementation Notes

### Client-side (TypeScript)

```typescript
// src/api/files.api.ts
export async function uploadFilesBatch(
  files: File[]
): Promise<BatchUploadResult> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await client.post<BatchUploadResult>(
    "/api/Files/batch",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60s timeout for batch upload
    }
  );

  return response.data;
}
```

### Usage in Hook

```typescript
// src/hooks/mutations/useUploadFilesBatch.ts
import { useMutation } from "@tanstack/react-query";
import { uploadFilesBatch } from "@/api/files.api";

export function useUploadFilesBatch() {
  return useMutation({
    mutationFn: uploadFilesBatch,
    onSuccess: (data) => {
      if (data.failureCount > 0) {
        // Handle partial success
        console.warn(`${data.failureCount} files failed to upload`);
      }
    },
  });
}
```

---

## ✅ HUMAN CONFIRMATION

| Hạng mục               | Status               |
| ---------------------- | -------------------- |
| Đã review API contract | ⬜ Chưa review       |
| Đã capture snapshots   | ⬜ Chưa có           |
| **Contract status**    | ⏳ PENDING SNAPSHOTS |

**HUMAN Signature:** [CHƯA DUYỆT]  
**Date:** ****\_\_\_****

> ⚠️ **Contract status = ⏳ PENDING khi chưa có snapshots**  
> ✅ **Contract status = READY khi đã có snapshots + confirmed**

---

## 🔗 References

- [Swagger Documentation](https://vega-file-api-dev.allianceitsc.com/swagger/index.html)
- [Single File Upload API](../../file/upload/contract.md) (Phase 1)
- [Feature Requirements](../../../../modules/chat/features/file-upload-phase-2/01_requirements.md)

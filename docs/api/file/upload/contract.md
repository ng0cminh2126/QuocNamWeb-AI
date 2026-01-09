# API Contract - File Upload

> **Endpoint:** POST /api/Files  
> **Service:** Vega File API  
> **Version:** v1  
> **Status:** ✅ READY  
> **Created:** 2026-01-06  
> **Base URL:** `https://vega-file-api-dev.allianceitsc.com` (Development)  
> **Base URL:** `https://vega-file-api.allianceitsc.com` (Production)

---

## 📋 Overview

| Property           | Value                                 |
| ------------------ | ------------------------------------- |
| **HTTP Method**    | POST                                  |
| **Endpoint**       | `/api/Files`                          |
| **Content-Type**   | `multipart/form-data`                 |
| **Authentication** | ✅ Required (Bearer Token)            |
| **Rate Limit**     | TBD                                   |
| **Max File Size**  | 10MB (client-side), TBD (server-side) |

**Purpose:** Upload a file to Vega File API. Files are associated with a source module (Task, Chat, Company, User).

**Important Notes:**

- `sourceModule` is **REQUIRED** - no default value
- Returns 400 Bad Request if sourceModule is missing
- Files are stored based on configured storage provider (Local, Azure, S3, Google Drive)
- JWT Bearer token required in Authorization header

---

## 📥 Request

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

### Query Parameters

| Parameter        | Type    | Required | Description                      | Allowed Values                                          |
| ---------------- | ------- | -------- | -------------------------------- | ------------------------------------------------------- |
| `sourceModule`   | integer | ✅ Yes   | Source module uploading the file | `0` (Task)<br>`1` (Chat)<br>`2` (Company)<br>`3` (User) |
| `sourceEntityId` | UUID    | ❌ No    | Optional source entity ID        | Valid UUID                                              |

### Request Body (multipart/form-data)

| Field  | Type   | Required | Description        |
| ------ | ------ | -------- | ------------------ |
| `file` | binary | ✅ Yes   | The file to upload |

**TypeScript Interface:**

```typescript
interface UploadFileRequest {
  // Query parameters
  sourceModule: SourceModule; // 0=Task, 1=Chat, 2=Company, 3=User
  sourceEntityId?: string; // UUID

  // Form data
  file: File;
}

enum SourceModule {
  Task = 0,
  Chat = 1,
  Company = 2,
  User = 3,
}
```

---

## 📤 Response

### Success Response (201 Created)

```json
{
  "fileId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "storagePath": "chat/2024/01/06/3fa85f64-5717-4562-b3fc-2c963f66afa6.pdf",
  "fileName": "document.pdf",
  "contentType": "application/pdf",
  "size": 1048576
}
```

**TypeScript Interface:**

```typescript
interface UploadFileResult {
  fileId: string; // UUID
  storagePath: string; // Storage path in provider
  fileName: string; // Original filename
  contentType: string; // MIME type
  size: number; // File size in bytes (int64)
}
```

### Error Responses

| Status | Code                   | Message          | Description                             |
| ------ | ---------------------- | ---------------- | --------------------------------------- |
| 400    | Bad Request            | `ProblemDetails` | Missing sourceModule or invalid request |
| 401    | Unauthorized           | `ProblemDetails` | Missing or invalid Bearer token         |
| 413    | Payload Too Large      | `ProblemDetails` | File exceeds server size limit          |
| 415    | Unsupported Media Type | `ProblemDetails` | File type not allowed                   |

**ProblemDetails Schema:**

```typescript
interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}
```

---

## 🔒 Validation Rules

### Client-Side Validation (UI)

| Rule            | Value                    | Error Message                               |
| --------------- | ------------------------ | ------------------------------------------- |
| Max file size   | 10MB                     | "File vượt quá kích thước cho phép (10 MB)" |
| Max files count | 5 files                  | "Bạn chỉ có thể chọn tối đa 5 file"         |
| Allowed types   | PDF, Word, Excel, Images | "Định dạng file không được hỗ trợ"          |

**Allowed MIME Types:**

- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`

### Server-Side Validation

TBD - Backend will enforce additional validation (file type, virus scan, etc.)

---

## � Multi-File Upload Strategy

### API Limitation

**Vega File API chỉ nhận 1 file per request.**  
Endpoint `/api/Files` chỉ accept 1 file trong FormData.

### Client-Side Solution: Sequential Upload

Khi user chọn nhiều files (max 5), client phải upload **tuần tự** (sequential):

```typescript
// Example: Upload 3 files
const files = [file1.pdf, file2.jpg, file3.docx];
const fileIds: string[] = [];

// Upload one-by-one
for (const file of files) {
  const result = await uploadFile({
    file,
    sourceModule: 1, // Chat
    sourceEntityId: conversationId,
  });

  fileIds.push(result.fileId);
}

// Use fileIds in message
sendMessage({ content: "...", fileIds });
```

### Upload Flow Diagram

```
User selects: [file1, file2, file3]
              ↓
┌─────────────────────────────────────────┐
│  Client-side Sequential Upload          │
├─────────────────────────────────────────┤
│                                          │
│  1. POST /api/Files (file1)             │
│     ✅ Response: { fileId: "uuid-1" }   │
│     Progress: 33% (1/3 complete)        │
│                                          │
│  2. POST /api/Files (file2)             │
│     ✅ Response: { fileId: "uuid-2" }   │
│     Progress: 67% (2/3 complete)        │
│                                          │
│  3. POST /api/Files (file3)             │
│     ✅ Response: { fileId: "uuid-3" }   │
│     Progress: 100% (3/3 complete)       │
│                                          │
└─────────────────────────────────────────┘
              ↓
Result: ["uuid-1", "uuid-2", "uuid-3"]
              ↓
Send message with fileIds array
```

### Error Handling in Multi-File Upload

**Scenario:** User uploads 5 files, 1 fails

```
Upload Queue: [file1, file2, file3, file4, file5]

Progress:
✅ file1 → fileId: "uuid-1" (success)
✅ file2 → fileId: "uuid-2" (success)
❌ file3 → Error: "File too large" (failed)
✅ file4 → fileId: "uuid-4" (success)
✅ file5 → fileId: "uuid-5" (success)

Result:
- Success: 4 files
- Failed: 1 file
- FileIds: ["uuid-1", "uuid-2", "uuid-4", "uuid-5"]

Action:
- Show toast: "Upload thành công 4/5 file"
- Attach successful fileIds to message
- User can retry failed file or proceed without it
```

### Performance Considerations

| Aspect                  | Impact                        | Mitigation                                         |
| ----------------------- | ----------------------------- | -------------------------------------------------- |
| **Sequential = Slower** | 5 files @ 2s each = 10s total | Show progress per file, disable Send during upload |
| **Network overhead**    | Multiple HTTP requests        | Unavoidable with API limitation                    |
| **User waiting**        | Long wait for many files      | Provide clear progress feedback                    |
| **Partial failures**    | Some files succeed, some fail | Continue uploading, collect all results            |

**Recommendation:** Phase 3 có thể consider parallel uploads nếu backend updates API.

---

## �📝 Example Usage

### JavaScript/TypeScript with Axios

```typescript
import axios from "axios";
import type { UploadFileResult } from "@/types/files";

async function uploadFile(
  file: File,
  sourceModule: number,
  sourceEntityId?: string
): Promise<UploadFileResult> {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams();
  params.append("sourceModule", sourceModule.toString());
  if (sourceEntityId) {
    params.append("sourceEntityId", sourceEntityId);
  }

  const response = await axios.post<UploadFileResult>(
    `/api/Files?${params.toString()}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}
```

### cURL Example

```bash
curl -X POST "https://vega-file-api-dev.allianceitsc.com/api/Files?sourceModule=1" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "file=@document.pdf"
```

---

## 📊 Response Examples

See [snapshots/v1/](./snapshots/v1/) folder for actual API responses:

- ✅ [success.json](./snapshots/v1/success.json) - Successful upload
- ❌ [error-400-missing-source-module.json](./snapshots/v1/error-400-missing-source-module.json) - Missing sourceModule
- ❌ [error-401-unauthorized.json](./snapshots/v1/error-401-unauthorized.json) - Missing/invalid auth token
- ❌ [error-413-file-too-large.json](./snapshots/v1/error-413-file-too-large.json) - File size exceeds limit
- ❌ [error-415-unsupported-media-type.json](./snapshots/v1/error-415-unsupported-media-type.json) - Invalid file type

---

## 🔗 Related Endpoints

| Endpoint                        | Method | Purpose                   |
| ------------------------------- | ------ | ------------------------- |
| `GET /api/Files/{id}`           | GET    | Get file metadata         |
| `GET /api/Files/{id}/download`  | GET    | Download file             |
| `GET /api/Files/{id}/thumbnail` | GET    | Get file thumbnail        |
| `GET /api/Files/{id}/view`      | GET    | View file with watermark  |
| `DELETE /api/Files/{id}`        | DELETE | Delete file (soft delete) |

---

## 📋 SourceModule Enum Reference

```typescript
enum SourceModule {
  Task = 0, // File uploaded from Task module
  Chat = 1, // File uploaded from Chat module
  Company = 2, // File uploaded from Company module
  User = 3, // File uploaded from User module
}
```

**Usage in Chat:**

- Always use `sourceModule=1` (Chat)
- Set `sourceEntityId` to conversation ID

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                           | Status      |
| ---------------------------------- | ----------- |
| Đã review endpoint specification   | ✅ Reviewed |
| Đã review request/response schemas | ✅ Reviewed |
| Đã review validation rules         | ✅ Reviewed |
| Đã review error responses          | ✅ Reviewed |
| Đã review snapshot files           | ⏳ Pending  |
| **APPROVED để implement**          | ✅ APPROVED |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-06

> ✅ **READY: Contract approved, snapshots needed for full implementation**

---

## 📝 Change Log

| Date       | Version | Changes                           |
| ---------- | ------- | --------------------------------- |
| 2026-01-06 | 1.0.0   | Initial contract from Swagger API |

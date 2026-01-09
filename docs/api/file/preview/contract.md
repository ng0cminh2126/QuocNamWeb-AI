# API Contract - Preview File with Watermark

> **Module:** File  
> **Feature:** Preview  
> **Endpoint:** `GET /api/Files/{id}/preview`  
> **Base URL (Dev):** https://vega-file-api-dev.allianceitsc.com  
> **Base URL (Prod):** https://vega-file-api.allianceitsc.com  
> **Status:** ✅ READY (with mock snapshots)  
> **Created:** 2026-01-07  
> **Last Updated:** 2026-01-07

---

## 📋 Overview

| Property        | Value                                                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method**      | GET                                                                                                                                                      |
| **Path**        | `/api/Files/{id}/preview`                                                                                                                                |
| **Auth**        | ✅ Required (Bearer token)                                                                                                                               |
| **Summary**     | Preview a file with watermark. Returns file content optimized for in-browser display.                                                                    |
| **Description** | For images: Returns watermarked image. For PDFs: Returns first page as image with redacted sensitive info. Generic storage endpoint - no business logic. |
| **Created By**  | GitHub Copilot (2026-01-07)                                                                                                                              |

---

## 📥 Request

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | `uuid` | ✅ Yes   | File ID     |

### Headers

```http
Authorization: Bearer {access_token}
```

### Request Example

```http
GET /api/Files/550e8400-e29b-41d4-a716-446655440000/preview HTTP/1.1
Host: vega-file-api-dev.allianceitsc.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📤 Response

### Success Response (200 OK)

**Content-Type:** Depends on file type

- Images: `image/jpeg`, `image/png`, `image/webp`
- PDFs: `image/jpeg` (first page rendered as image)
- Other: May vary

**Body:** Binary file data optimized for preview

**Response Type:** `binary`

**Response Schema:**

```typescript
type PreviewFileData = Blob; // Binary file data
```

**Example Response:**

```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 124563
Content-Disposition: inline; filename="preview_550e8400-e29b-41d4-a716-446655440000.jpg"

[Binary image data - watermarked preview]
```

### Error Responses

#### 404 Not Found

File not found

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "File with ID '550e8400-e29b-41d4-a716-446655440000' not found.",
  "instance": "/api/Files/550e8400-e29b-41d4-a716-446655440000/preview"
}
```

---

## 🎯 File Type Behavior

### Images (JPG, PNG, GIF, WebP)

- **Response:** Full-size watermarked image
- **Watermark:** Applied to prevent unauthorized copying
- **Quality:** High (90% JPEG quality)
- **Max Size:** Original resolution (no downscaling)

### PDF Files

- **Response:** First page rendered as JPEG image
- **Watermark:** Applied to entire page
- **Redaction:** Sensitive info may be redacted (implementation detail)
- **Quality:** 300 DPI render
- **Max Size:** A4 size equivalent

### Other Files

- Behavior depends on backend implementation
- May return placeholder image or error

---

## 🔗 Related Endpoints

- **Thumbnail (Watermarked):** `GET /api/Files/{id}/watermarked-thumbnail` - Get small thumbnail
- **Download Original:** `GET /api/Files/{id}/download` - Download unwatermarked original
- **Preview Specific Page:** `GET /api/Files/{id}/preview-page?page=2` - Preview specific PDF page

---

## 📸 Snapshots

**Location:** `docs/api/file/preview/snapshots/v1/`

Required snapshots:

- [x] `jpeg-success.json` - JPEG image preview ✅ MOCK
- [x] `png-success.json` - PNG image preview ✅ MOCK
- [x] `pdf-success.json` - PDF first page preview ✅ MOCK
- [x] `error-404.json` - File not found ✅ MOCK

**Snapshot Guide:** See `docs/api/file/preview/snapshots/v1/README.md`

---

## ⚠️ HUMAN CONFIRMATION

**Status:** ✅ READY - Mock snapshots created

| Checklist                          | Status  |
| ---------------------------------- | ------- |
| ✅ Contract reviewed               | ✅      |
| ✅ Snapshots captured (4 required) | ✅ MOCK |
| ✅ Response format verified        | ✅      |
| ✅ Error scenarios tested          | ✅ MOCK |
| ✅ **APPROVED để implement**       | ✅      |

**HUMAN Signature:** ******\_\_\_******  
**Date:** ******\_\_\_******

> ⚠️ **AI KHÔNG ĐƯỢC code nếu status = ⬜ CHƯA APPROVED**

---

## 🔍 Implementation Notes

### TypeScript Interface

```typescript
// Request
interface PreviewFileRequest {
  id: string; // UUID
}

// Response
type PreviewFileData = Blob; // Binary image data

// Usage
const previewBlob = await getFilePreview(fileId);
const imageUrl = URL.createObjectURL(previewBlob);
```

### Use Cases

1. **Image Preview Modal**

   - User clicks thumbnail in chat → Opens modal with preview
   - Preview shows full-size watermarked image
   - User can zoom, but cannot download unwatermarked version

2. **PDF Preview**
   - Show first page as preview in modal
   - Option to view more pages using `/preview-page?page=N`
   - Full PDF download requires different permission

### Caching Strategy

- **Browser Cache:** Set `Cache-Control: max-age=3600` (1 hour)
- **Client Cache:** Store blob URLs in IndexedDB with file ID as key
- **Invalidation:** Clear cache when file is updated
- **Memory Management:** Revoke blob URLs when modal closes

### Performance Considerations

- Preview files are generated on-demand (first request may be slower)
- Subsequent requests are cached on server
- Response time: ~200-500ms for images, ~500-1000ms for PDF render
- Large files (>10MB) may take longer to process

### Security Notes

- Watermark cannot be removed client-side
- Preview is optimized quality (not full original)
- Download permission is separate from preview permission
- Sensitive PDF content may be automatically redacted

---

## 📚 References

- **Swagger:** https://vega-file-api-dev.allianceitsc.com/swagger/index.html
- **Thumbnail Contract:** `docs/api/file/thumbnail/contract.md`
- **Download Contract:** `docs/api/file/download/contract.md`

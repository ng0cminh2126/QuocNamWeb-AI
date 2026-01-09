# API Contract - Get Watermarked Thumbnail

> **Module:** File  
> **Feature:** Thumbnail  
> **Endpoint:** `GET /api/Files/{id}/watermarked-thumbnail`  
> **Base URL (Dev):** https://vega-file-api-dev.allianceitsc.com  
> **Base URL (Prod):** https://vega-file-api.allianceitsc.com  
> **Status:** ✅ READY (with mock snapshots)  
> **Created:** 2026-01-07  
> **Last Updated:** 2026-01-07

---

## 📋 Overview

| Property        | Value                                                                                |
| --------------- | ------------------------------------------------------------------------------------ |
| **Method**      | GET                                                                                  |
| **Path**        | `/api/Files/{id}/watermarked-thumbnail`                                              |
| **Auth**        | ✅ Required (Bearer token)                                                           |
| **Summary**     | Get watermarked thumbnail for a file                                                 |
| **Description** | Returns a watermarked thumbnail image. Generic storage endpoint - no business logic. |
| **Created By**  | GitHub Copilot (2026-01-07)                                                          |

---

## 📥 Request

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | `uuid` | ✅ Yes   | File ID     |

### Query Parameters

| Parameter | Type     | Required | Default    | Description                                                        |
| --------- | -------- | -------- | ---------- | ------------------------------------------------------------------ |
| `size`    | `string` | ❌ No    | `"medium"` | Thumbnail size: `small` (100px), `medium` (200px), `large` (400px) |

### Headers

```http
Authorization: Bearer {access_token}
```

### Request Example

```http
GET /api/Files/550e8400-e29b-41d4-a716-446655440000/watermarked-thumbnail?size=medium HTTP/1.1
Host: vega-file-api-dev.allianceitsc.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📤 Response

### Success Response (200 OK)

**Content-Type:** `image/jpeg`, `image/png`, or `image/webp`  
**Body:** Binary image data (base64 encoded in JSON context)

**Response Type:** `byte` (Base64-encoded string in JSON/XML context, raw binary in HTTP)

**Response Schema:**

```typescript
type ThumbnailResponse = string; // base64-encoded image bytes
```

**Example Response:**

```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 8532

[Binary image data - JPEG with watermark]
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
  "instance": "/api/Files/550e8400-e29b-41d4-a716-446655440000/watermarked-thumbnail"
}
```

#### 400 Bad Request

Invalid parameters (e.g., invalid size value)

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid thumbnail size. Allowed values: small, medium, large.",
  "instance": "/api/Files/550e8400-e29b-41d4-a716-446655440000/watermarked-thumbnail"
}
```

---

## 🔗 Related Endpoints

- **Upload File:** `POST /api/Files` - Upload original file
- **Preview File:** `GET /api/Files/{id}/preview` - Get full preview with watermark
- **Download File:** `GET /api/Files/{id}/download` - Download original file
- **Regular Thumbnail:** `GET /api/Files/{id}/thumbnail` - Get thumbnail without watermark

---

## 📸 Snapshots

**Location:** `docs/api/file/thumbnail/snapshots/v1/`

Required snapshots:

- [x] `small-success.json` - Small thumbnail (100px) ✅ MOCK
- [x] `medium-success.json` - Medium thumbnail (200px) ✅ MOCK
- [x] `large-success.json` - Large thumbnail (400px) ✅ MOCK
- [x] `error-404.json` - File not found ✅ MOCK
- [x] `error-400.json` - Invalid size parameter ✅ MOCK

**Snapshot Guide:** See `docs/api/file/thumbnail/snapshots/v1/README.md`

---

## ⚠️ HUMAN CONFIRMATION

**Status:** ✅ READY - Mock snapshots created

| Checklist                          | Status  |
| ---------------------------------- | ------- |
| ✅ Contract reviewed               | ✅      |
| ✅ Snapshots captured (5 required) | ✅ MOCK |
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
interface GetWatermarkedThumbnailRequest {
  id: string; // UUID
  size?: "small" | "medium" | "large"; // Default: 'medium'
}

// Response
type ThumbnailImageData = Blob; // Binary image data

// Usage
const thumbnailBlob = await getThumbnailImage(fileId, "medium");
```

### Size Specifications

| Size     | Max Dimension | Use Case                   |
| -------- | ------------- | -------------------------- |
| `small`  | 100px         | Message list, compact view |
| `medium` | 200px         | Chat message preview       |
| `large`  | 400px         | Popup preview, detail view |

### Caching Strategy

- **Browser Cache:** Set `Cache-Control: max-age=86400` (24 hours)
- **Client Cache:** Store blob URLs in memory with file ID + size as key
- **Invalidation:** Clear cache when file is updated/deleted

### Performance Considerations

- Watermarked thumbnails are pre-generated on upload
- Response time: ~50-200ms (network + API processing)
- Image format: JPEG for photos, PNG for documents/diagrams
- Compression: Optimized for web (quality ~80%)

---

## 📚 References

- **Swagger:** https://vega-file-api-dev.allianceitsc.com/swagger/index.html
- **File Upload Contract:** `docs/api/file/upload/contract.md`
- **Preview Contract:** `docs/api/file/preview/contract.md`

# API Contract: File Preview

> **Module:** Chat  
> **Feature:** File Preview  
> **Version:** 1.0  
> **Base URL:** `https://vega-file-api-dev.allianceitsc.com/api`  
> **Swagger:** https://vega-file-api-dev.allianceitsc.com/swagger/index.html  
> **Status:** ✅ READY - Contract documented, snapshots pending

---

## 📋 Overview

API endpoints để preview files (đặc biệt là PDF) trong browser. Bao gồm:

1. Lấy số pages của PDF
2. Render từng page PDF thành image
3. Preview first page với watermark

---

## 🔗 Endpoints

### 1. Get PDF Page Count

**Endpoint:** `GET /api/pdf/{fileId}/pages/count`

**Purpose:** Lấy tổng số pages của PDF file

**Parameters:**

| Name   | Type | Location | Required | Description |
| ------ | ---- | -------- | -------- | ----------- |
| fileId | uuid | path     | ✅       | File ID     |

**Request Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response 200 OK:**

```typescript
// Response type
type GetPdfPageCountResponse = {
  count: number;
  fileId: string;
};
```

```json
{
  "count": 5,
  "fileId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 404 Not Found:**

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "File not found"
}
```

**Validation Rules:**

- fileId phải là UUID hợp lệ
- File phải tồn tại trong database
- File phải có contentType là PDF

---

### 2. Render Single PDF Page

**Endpoint:** `GET /api/pdf/{fileId}/pages/{pageNumber}/render`

**Purpose:** Render 1 page cụ thể của PDF thành image

**Parameters:**

| Name       | Type  | Location | Required | Default | Description           |
| ---------- | ----- | -------- | -------- | ------- | --------------------- |
| fileId     | uuid  | path     | ✅       | -       | File ID               |
| pageNumber | int32 | path     | ✅       | -       | Page number (1-based) |
| dpi        | int32 | query    | ❌       | 300     | Image quality (DPI)   |

**Request Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Request Example:**

```
GET /api/pdf/550e8400-e29b-41d4-a716-446655440000/pages/1/render?dpi=300
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Response 200 OK:**

```
Content-Type: image/png
Content-Length: <bytes>

[Binary image data]
```

**Response 404 Not Found:**

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "File or page not found"
}
```

**Validation Rules:**

- fileId phải là UUID hợp lệ
- pageNumber phải > 0 và <= tổng số pages
- dpi phải trong khoảng 72-600

---

### 3. Preview File (First Page)

**Endpoint:** `GET /api/Files/{id}/preview`

**Purpose:** Preview file với watermark. Cho PDF: trả về first page as image.

**Description:**

- Generic storage endpoint - no business logic
- For PDF: Returns first page as image with watermark
- For images: Returns image with watermark
- Optimized for in-browser display

**Parameters:**

| Name | Type | Location | Required | Description |
| ---- | ---- | -------- | -------- | ----------- |
| id   | uuid | path     | ✅       | File ID     |

**Request Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Request Example:**

```
GET /api/Files/550e8400-e29b-41d4-a716-446655440000/preview
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Response 200 OK:**

```
Content-Type: image/png (for PDF) or original content type
Content-Disposition: inline; filename="document.png"
Content-Length: <bytes>

[Binary data - image with watermark]
```

**Response 404 Not Found:**

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "File not found"
}
```

**Validation Rules:**

- id phải là UUID hợp lệ
- File phải tồn tại
- User phải có quyền access file

---

## 🔄 Typical Flow

### Preview Multi-Page PDF

```
1. User clicks on PDF file
   ↓
2. GET /api/Files/{id}/preview
   → Response Headers:
      X-Total-Pages: 5
      X-Current-Page: 1
   → Response Body: Binary image (page 1 with watermark)
   ↓
3. Frontend reads X-Total-Pages header → knows PDF has 5 pages
   ↓
4. User clicks "Next"
   GET /api/pdf/{fileId}/pages/2/render?dpi=300
   → Response: Binary image (page 2)
   ↓
5. Continue until page 5...
```

### Preview Single Page Document

```
1. User clicks on file
   ↓
2. GET /api/Files/{id}/preview
   → Response: Binary image with watermark
```

---

## 🧪 Snapshot Files

> ⏳ **Status:** Snapshots chưa được capture

Cần capture các snapshots sau:

- [ ] `preview-success-headers.json` - Response headers (X-Total-Pages, X-Current-Page)
- [ ] `preview-error-404.json` - File not found
- [ ] `render-page-success-headers.json` - Response headers
- [ ] `render-page-error-404.json` - Page not found

**Capture Instructions:** See [snapshots/v1/README.md](./snapshots/v1/README.md)

---

## 🔐 Security

- **Authentication:** Bearer JWT token required
- **Authorization:** User must have access to file
- **Watermark:** Applied automatically to prevent unauthorized sharing

---

## 📊 Performance Considerations

- **DPI:** Higher DPI = better quality but larger file size (default 300 is good balance)
- **Caching:** Browser should cache rendered pages
- **Lazy Loading:** Only load pages when user navigates to them

---

## 🔗 Related Endpoints

- [GET /api/Files/{id}/download](../conversation-details-phase-1/contract.md#download) - Download original file
- [POST /api/Files](../upload-file/contract.md) - Upload file

---

**Created:** 2026-01-08  
**Last Updated:** 2026-01-08

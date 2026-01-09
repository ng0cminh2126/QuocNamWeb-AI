# API Snapshot Capture Instructions

> **API Base URL:** `https://vega-file-api-dev.allianceitsc.com/api`  
> **Swagger:** https://vega-file-api-dev.allianceitsc.com/swagger/index.html

---

## 📋 Prerequisites

Trước khi capture snapshots, bạn cần:

1. **File ID thực tế:** Upload một PDF file và lấy file ID
2. **Access Token:** Lấy JWT token từ localStorage hoặc DevTools
3. **cURL hoặc Postman:** Để gọi API

---

## 🔍 How to Get File ID

### Option 1: Via Swagger UI

1. Mở https://vega-file-api-dev.allianceitsc.com/swagger/index.html
2. Click **"Authorize"** → Paste access token
3. Expand **POST /api/Files** → Click "Try it out"
4. Upload một PDF file (chọn sourceModule = Chat)
5. Execute → Copy `fileId` từ response

### Option 2: Via DevTools

1. Login vào app
2. Upload file trong chat conversation
3. Mở DevTools → Network tab
4. Filter: `/api/Files`
5. Tìm POST request → Response có `fileId`

---

## 🔑 How to Get Access Token

### Via DevTools (Recommended)

1. Login vào app
2. Mở DevTools → Application tab
3. Expand **Local Storage** → Click domain
4. Tìm key `auth-storage` hoặc `access-token`
5. Copy giá trị `accessToken` field

### Example Token Format

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.abc123...
```

---

## 📸 Snapshot 1: Preview Success (with headers)

**Endpoint:** `GET /api/Files/{id}/preview`

**Purpose:** Lấy first page + X-Total-Pages header

### cURL Command

```bash
curl -i -X GET \
  "https://vega-file-api-dev.allianceitsc.com/api/Files/YOUR_FILE_ID/preview" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  --output snapshots/v1/preview-first-page.png
```

**⚠️ NOTE:** `-i` flag để hiện headers

### Expected Headers

```
HTTP/1.1 200 OK
Content-Type: image/png
X-Total-Pages: 5
X-Current-Page: 1
Content-Length: 123456
```

### Save Headers

Copy toàn bộ headers vào file:

```bash
# File: snapshots/v1/preview-success-headers.txt
```

**Content example:**

```
HTTP/1.1 200 OK
Date: Wed, 08 Jan 2026 10:30:00 GMT
Content-Type: image/png
X-Total-Pages: 5
X-Current-Page: 1
Content-Length: 123456
Connection: keep-alive
```

---

## 📸 Snapshot 2: Preview Error 404

**Endpoint:** `GET /api/Files/{invalid-id}/preview`

**Purpose:** Test error handling

### cURL Command

```bash
curl -i -X GET \
  "https://vega-file-api-dev.allianceitsc.com/api/Files/00000000-0000-0000-0000-000000000000/preview" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Save Response

```bash
# File: snapshots/v1/preview-error-404.json
```

**Expected content:**

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "File with ID 00000000-0000-0000-0000-000000000000 not found.",
  "traceId": "00-abc123-def456-00"
}
```

---

## 📸 Snapshot 3: Render Page 2

**Endpoint:** `GET /api/pdf/{fileId}/pages/{pageNumber}/render`

**Purpose:** Test page navigation

### cURL Command

```bash
curl -X GET \
  "https://vega-file-api-dev.allianceitsc.com/api/pdf/YOUR_FILE_ID/pages/2/render?dpi=300" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  --output snapshots/v1/render-page2-success.png
```

### Save Image

Image sẽ được save tự động vào `render-page2-success.png`

---

## 📸 Snapshot 4: Render Page Error (Invalid Page)

**Endpoint:** `GET /api/pdf/{fileId}/pages/999/render`

**Purpose:** Test invalid page number

### cURL Command

```bash
curl -i -X GET \
  "https://vega-file-api-dev.allianceitsc.com/api/pdf/YOUR_FILE_ID/pages/999/render?dpi=300" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Save Response

```bash
# File: snapshots/v1/render-page-error-404.json
```

**Expected content:**

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Page 999 does not exist. PDF has only 5 pages."
}
```

---

## 📸 Snapshot 5: Image File Preview

**Endpoint:** `GET /api/Files/{imageFileId}/preview`

**Purpose:** Test single-page image preview

### Upload Image First

1. Upload JPG/PNG file qua **POST /api/Files**
2. Lấy `fileId` từ response

### cURL Command

```bash
curl -i -X GET \
  "https://vega-file-api-dev.allianceitsc.com/api/Files/YOUR_IMAGE_FILE_ID/preview" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  --output snapshots/v1/preview-image-success.png
```

### Expected Headers

```
HTTP/1.1 200 OK
Content-Type: image/jpeg
X-Total-Pages: 1
X-Current-Page: 1
```

---

## ✅ Checklist

After capturing all snapshots:

- [ ] **preview-success-headers.txt** - Headers có X-Total-Pages
- [ ] **preview-first-page.png** - First page image
- [ ] **preview-error-404.json** - File not found error
- [ ] **render-page2-success.png** - Page 2 rendered
- [ ] **render-page-error-404.json** - Invalid page error
- [ ] **preview-image-success.png** - Single image file preview

---

## 🧪 How to Use Snapshots in Tests

```typescript
// In tests, you can reference snapshots:

import previewHeaders from "./snapshots/v1/preview-success-headers.txt?raw";
import error404 from "./snapshots/v1/preview-error-404.json";

// Mock API response
mockApiClient.get.mockResolvedValueOnce({
  data: new Blob(["mock-image"]),
  headers: {
    "x-total-pages": "5", // From real snapshot
    "x-current-page": "1",
  },
});
```

---

## 🔄 When to Re-Capture

Capture lại snapshots khi:

- ✅ API contract thay đổi (new version v2)
- ✅ Response format thay đổi
- ✅ Headers mới được thêm
- ✅ Error messages thay đổi

---

## 📝 Notes

- **Snapshots are REAL data:** Không phải mock, đây là actual API responses
- **Keep old versions:** Khi tạo v2, GIỮ NGUYÊN v1 folder
- **Sensitive data:** Nếu có PII trong snapshots, redact trước khi commit
- **File size:** Binary images có thể lớn, consider using Git LFS

---

**Created:** 2026-01-08  
**Updated:** 2026-01-08

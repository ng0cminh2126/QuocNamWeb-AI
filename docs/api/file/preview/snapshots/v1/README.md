# Preview API Snapshots - v1

> **Endpoint:** `GET /api/Files/{id}/preview`  
> **Version:** v1  
> **Created:** 2026-01-07  
> **Last Updated:** 2026-01-07

---

## 📸 Snapshot Capture Guide

### Required Snapshots

1. **success_image_jpeg.json** - JPEG image preview
2. **success_image_png.json** - PNG image preview
3. **success_pdf.json** - PDF first page preview
4. **error_404.json** - File not found

---

## 🔧 How to Capture Snapshots

### Prerequisites

- Valid access token
- Test files uploaded (JPEG, PNG, PDF)
- File IDs noted down

### Using cURL

```bash
# Setup
ACCESS_TOKEN="your_bearer_token_here"
JPEG_FILE_ID="uuid-of-jpeg-file"
PNG_FILE_ID="uuid-of-png-file"
PDF_FILE_ID="uuid-of-pdf-file"

# 1. Success - JPEG image
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/Files/${JPEG_FILE_ID}/preview" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -o preview_image.jpg

echo '{
  "_meta": {
    "capturedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "environment": "dev",
    "endpoint": "/api/Files/{id}/preview"
  },
  "_request": {
    "fileId": "'${JPEG_FILE_ID}'",
    "originalFileName": "test-photo.jpg",
    "originalContentType": "image/jpeg"
  },
  "_response": {
    "status": 200,
    "contentType": "image/jpeg",
    "contentLength": '$(wc -c < preview_image.jpg)',
    "note": "Watermarked preview image saved to preview_image.jpg"
  }
}' > success_image_jpeg.json

# 2. Success - PNG image
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/Files/${PNG_FILE_ID}/preview" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -o preview_image.png

echo '{
  "_meta": {
    "capturedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "environment": "dev",
    "endpoint": "/api/Files/{id}/preview"
  },
  "_request": {
    "fileId": "'${PNG_FILE_ID}'",
    "originalFileName": "test-diagram.png",
    "originalContentType": "image/png"
  },
  "_response": {
    "status": 200,
    "contentType": "image/png",
    "contentLength": '$(wc -c < preview_image.png)',
    "note": "Watermarked preview image saved to preview_image.png"
  }
}' > success_image_png.json

# 3. Success - PDF (first page as image)
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/Files/${PDF_FILE_ID}/preview" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -o preview_pdf.jpg

echo '{
  "_meta": {
    "capturedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "environment": "dev",
    "endpoint": "/api/Files/{id}/preview"
  },
  "_request": {
    "fileId": "'${PDF_FILE_ID}'",
    "originalFileName": "test-document.pdf",
    "originalContentType": "application/pdf"
  },
  "_response": {
    "status": 200,
    "contentType": "image/jpeg",
    "contentLength": '$(wc -c < preview_pdf.jpg)',
    "note": "First page of PDF rendered as watermarked JPEG - saved to preview_pdf.jpg"
  }
}' > success_pdf.json

# 4. Error 404 - File not found
INVALID_FILE_ID="00000000-0000-0000-0000-000000000000"
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/Files/${INVALID_FILE_ID}/preview" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -w "\n" > error_404.json
```

---

## 📋 Snapshot Format

### For Binary Responses (Images)

Example `success_image_jpeg.json`:

```json
{
  "_meta": {
    "capturedAt": "2026-01-07T10:40:00Z",
    "environment": "dev",
    "endpoint": "/api/Files/{id}/preview"
  },
  "_request": {
    "fileId": "550e8400-e29b-41d4-a716-446655440000",
    "originalFileName": "vacation-photo.jpg",
    "originalContentType": "image/jpeg",
    "headers": {
      "Authorization": "Bearer [REDACTED]"
    }
  },
  "_response": {
    "status": 200,
    "headers": {
      "Content-Type": "image/jpeg",
      "Content-Length": "124563",
      "Content-Disposition": "inline; filename=\"preview_550e8400-e29b-41d4-a716-446655440000.jpg\"",
      "Cache-Control": "max-age=3600"
    },
    "body": "Binary image data - see preview_image.jpg",
    "watermark": {
      "applied": true,
      "position": "diagonal",
      "text": "Confidential - Vega Portal"
    },
    "note": "Full-size watermarked preview saved as preview_image.jpg"
  }
}
```

### For Error Responses

Example `error_404.json`:

```json
{
  "_meta": {
    "capturedAt": "2026-01-07T10:45:00Z",
    "environment": "dev",
    "endpoint": "/api/Files/{id}/preview"
  },
  "_request": {
    "fileId": "00000000-0000-0000-0000-000000000000"
  },
  "_response": {
    "status": 404,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
      "title": "Not Found",
      "status": 404,
      "detail": "File with ID '00000000-0000-0000-0000-000000000000' not found.",
      "instance": "/api/Files/00000000-0000-0000-0000-000000000000/preview"
    }
  }
}
```

---

## ✅ Verification Checklist

After capturing snapshots:

- [ ] All 4 snapshot JSON files exist
- [ ] Binary image files exist for success cases
- [ ] Each JSON has `_meta`, `_request`, `_response`
- [ ] Watermark is visible in preview images
- [ ] PDF preview shows first page only
- [ ] Error responses include ProblemDetails
- [ ] Tokens are redacted in snapshots

---

## 📂 File Organization

```
snapshots/v1/
├── README.md                     # This file
├── success_image_jpeg.json       # Metadata for JPEG preview
├── preview_image.jpg             # Actual JPEG preview with watermark
├── success_image_png.json        # Metadata for PNG preview
├── preview_image.png             # Actual PNG preview with watermark
├── success_pdf.json              # Metadata for PDF preview
├── preview_pdf.jpg               # First page of PDF as JPEG
└── error_404.json                # File not found error
```

---

## 🔍 Notes

### Watermark Verification

Check that watermarks are visible:

- **Images:** Diagonal text overlay
- **PDFs:** Watermark on rendered first page
- **Text:** "Confidential - Vega Portal" or similar

### File Size Considerations

- Preview files are optimized (compressed)
- JPEG quality: ~80-90%
- PNG: Compressed but lossless
- PDF renders: 300 DPI JPEG

### Caching Behavior

Document observed caching:

- First request: Slower (generation time)
- Subsequent requests: Faster (cached)
- Cache duration: Check `Cache-Control` header

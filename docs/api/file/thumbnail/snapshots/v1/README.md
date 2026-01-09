# Thumbnail API Snapshots - v1

> **Endpoint:** `GET /api/Files/{id}/watermarked-thumbnail`  
> **Version:** v1  
> **Created:** 2026-01-07  
> **Last Updated:** 2026-01-07

---

## 📸 Snapshot Capture Guide

### Required Snapshots

1. **success_small.json** - Small thumbnail (100px)
2. **success_medium.json** - Medium thumbnail (200px) - DEFAULT
3. **success_large.json** - Large thumbnail (400px)
4. **error_404.json** - File not found
5. **error_400_invalid_size.json** - Invalid size parameter

---

## 🔧 How to Capture Snapshots

### Prerequisites

- Valid access token
- Test file uploaded to dev environment
- File ID noted down

### Method 1: Using cURL (Recommended)

```bash
# Get access token first
ACCESS_TOKEN="your_bearer_token_here"
FILE_ID="550e8400-e29b-41d4-a716-446655440000"

# 1. Success - Small thumbnail
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/Files/${FILE_ID}/watermarked-thumbnail?size=small" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -o thumbnail_small.jpg

# Save metadata
echo '{
  "_meta": {
    "capturedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "environment": "dev",
    "endpoint": "/api/Files/{id}/watermarked-thumbnail?size=small"
  },
  "_request": {
    "fileId": "'${FILE_ID}'",
    "size": "small"
  },
  "_response": {
    "status": 200,
    "contentType": "image/jpeg",
    "contentLength": '$(wc -c < thumbnail_small.jpg)',
    "note": "Binary image data saved to thumbnail_small.jpg"
  }
}' > success_small.json

# 2. Success - Medium thumbnail (default)
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/Files/${FILE_ID}/watermarked-thumbnail?size=medium" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -o thumbnail_medium.jpg

echo '{
  "_meta": {
    "capturedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "environment": "dev",
    "endpoint": "/api/Files/{id}/watermarked-thumbnail?size=medium"
  },
  "_request": {
    "fileId": "'${FILE_ID}'",
    "size": "medium"
  },
  "_response": {
    "status": 200,
    "contentType": "image/jpeg",
    "contentLength": '$(wc -c < thumbnail_medium.jpg)',
    "note": "Binary image data saved to thumbnail_medium.jpg"
  }
}' > success_medium.json

# 3. Success - Large thumbnail
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/Files/${FILE_ID}/watermarked-thumbnail?size=large" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -o thumbnail_large.jpg

echo '{
  "_meta": {
    "capturedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "environment": "dev",
    "endpoint": "/api/Files/{id}/watermarked-thumbnail?size=large"
  },
  "_request": {
    "fileId": "'${FILE_ID}'",
    "size": "large"
  },
  "_response": {
    "status": 200,
    "contentType": "image/jpeg",
    "contentLength": '$(wc -c < thumbnail_large.jpg)',
    "note": "Binary image data saved to thumbnail_large.jpg"
  }
}' > success_large.json

# 4. Error 404 - File not found
INVALID_FILE_ID="00000000-0000-0000-0000-000000000000"
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/Files/${INVALID_FILE_ID}/watermarked-thumbnail?size=medium" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -w "\n" > error_404.json

# 5. Error 400 - Invalid size
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/Files/${FILE_ID}/watermarked-thumbnail?size=invalid" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -w "\n" > error_400_invalid_size.json
```

### Method 2: Using Postman

1. Import Swagger → Import from URL: `https://vega-file-api-dev.allianceitsc.com/swagger/v1/swagger.json`
2. Set Authorization header with Bearer token
3. Call endpoint with different parameters
4. Save responses to JSON files

### Method 3: Using Browser DevTools

1. Open chat application
2. Upload an image file
3. Open DevTools → Network tab
4. Click on thumbnail in chat
5. Find request to `/watermarked-thumbnail`
6. Right-click → Copy as cURL
7. Run cURL command to get JSON response

---

## 📋 Snapshot Format

### For Binary Responses (Images)

Save both:

1. **Metadata JSON** - Request/response metadata
2. **Binary file** - Actual image file

Example `success_medium.json`:

```json
{
  "_meta": {
    "capturedAt": "2026-01-07T10:30:00Z",
    "environment": "dev",
    "endpoint": "/api/Files/{id}/watermarked-thumbnail?size=medium"
  },
  "_request": {
    "fileId": "550e8400-e29b-41d4-a716-446655440000",
    "size": "medium",
    "headers": {
      "Authorization": "Bearer [REDACTED]"
    }
  },
  "_response": {
    "status": 200,
    "headers": {
      "Content-Type": "image/jpeg",
      "Content-Length": "8532",
      "Cache-Control": "max-age=86400"
    },
    "body": "Binary image data - see thumbnail_medium.jpg",
    "note": "Actual image saved as thumbnail_medium.jpg in same directory"
  }
}
```

### For Error Responses (JSON)

Save full JSON response:

```json
{
  "_meta": {
    "capturedAt": "2026-01-07T10:35:00Z",
    "environment": "dev",
    "endpoint": "/api/Files/{id}/watermarked-thumbnail?size=invalid"
  },
  "_request": {
    "fileId": "550e8400-e29b-41d4-a716-446655440000",
    "size": "invalid"
  },
  "_response": {
    "status": 400,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
      "title": "Bad Request",
      "status": 400,
      "detail": "Invalid thumbnail size. Allowed values: small, medium, large.",
      "instance": "/api/Files/550e8400-e29b-41d4-a716-446655440000/watermarked-thumbnail"
    }
  }
}
```

---

## ✅ Verification Checklist

After capturing snapshots:

- [ ] All 5 snapshot files exist
- [ ] Binary image files exist for success cases
- [ ] Each JSON file has `_meta`, `_request`, `_response` sections
- [ ] Timestamps are in UTC ISO format
- [ ] File IDs are valid UUIDs
- [ ] Error responses include ProblemDetails structure
- [ ] All sensitive data (tokens) are redacted

---

## 📂 File Organization

```
snapshots/v1/
├── README.md                        # This file
├── success_small.json               # Metadata for small thumbnail
├── thumbnail_small.jpg              # Actual small thumbnail image
├── success_medium.json              # Metadata for medium thumbnail
├── thumbnail_medium.jpg             # Actual medium thumbnail image
├── success_large.json               # Metadata for large thumbnail
├── thumbnail_large.jpg              # Actual large thumbnail image
├── error_404.json                   # File not found error
└── error_400_invalid_size.json      # Invalid size parameter error
```

---

## 🔒 Security Notes

- **NEVER commit actual Bearer tokens** - Use `[REDACTED]` in snapshots
- **File IDs can be committed** - They are not sensitive
- **Image files can be committed** - They contain watermarks already
- Store test credentials in `.env.local` (gitignored)

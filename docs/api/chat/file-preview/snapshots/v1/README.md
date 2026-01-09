# API Snapshots - File Preview

> **Purpose:** Store actual API response examples for file preview endpoints  
> **Version:** v1  
> **Last Updated:** 2026-01-08

---

## 📋 Required Snapshots

### 1. Get PDF Page Count

**File:** `get-pdf-pages-count-success.json`

**Capture Command:**

```bash
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/pdf/{FILE_ID}/pages/count" \
  -H "Authorization: Bearer {TOKEN}" \
  -o get-pdf-pages-count-success.json
```

**Expected Response:**

```json
{
  "count": 5,
  "fileId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 2. Get PDF Page Count - Error 404

**File:** `get-pdf-pages-count-error-404.json`

**Capture Command:**

```bash
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/pdf/00000000-0000-0000-0000-000000000000/pages/count" \
  -H "Authorization: Bearer {TOKEN}" \
  -o get-pdf-pages-count-error-404.json
```

---

### 3. Render Single Page - Metadata

**File:** `render-page-success-metadata.json`

**Note:** Actual response is binary image, but we save metadata

**Capture Command:**

```bash
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/pdf/{FILE_ID}/pages/1/render?dpi=300" \
  -H "Authorization: Bearer {TOKEN}" \
  -I > render-page-success-metadata.json
```

**Expected Headers:**

```
Content-Type: image/png
Content-Length: 245678
```

---

### 4. Preview File - Metadata

**File:** `preview-success-metadata.json`

**Capture Command:**

```bash
curl -X GET "https://vega-file-api-dev.allianceitsc.com/api/Files/{FILE_ID}/preview" \
  -H "Authorization: Bearer {TOKEN}" \
  -I > preview-success-metadata.json
```

---

## 🔧 How to Capture

### Prerequisites

1. **Get Test File ID:**

   - Upload a test PDF file
   - Save the returned `fileId`

2. **Get Bearer Token:**
   - Login to dev environment
   - Copy JWT token from browser DevTools

### Capture All Snapshots

```bash
# Set variables
FILE_ID="YOUR_FILE_ID_HERE"
TOKEN="YOUR_JWT_TOKEN_HERE"
BASE_URL="https://vega-file-api-dev.allianceitsc.com/api"

# 1. Page count success
curl -X GET "$BASE_URL/pdf/$FILE_ID/pages/count" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.' > get-pdf-pages-count-success.json

# 2. Page count error
curl -X GET "$BASE_URL/pdf/00000000-0000-0000-0000-000000000000/pages/count" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.' > get-pdf-pages-count-error-404.json

# 3. Render page metadata
curl -X GET "$BASE_URL/pdf/$FILE_ID/pages/1/render?dpi=300" \
  -H "Authorization: Bearer $TOKEN" \
  -I > render-page-success-metadata.txt

# 4. Preview metadata
curl -X GET "$BASE_URL/Files/$FILE_ID/preview" \
  -H "Authorization: Bearer $TOKEN" \
  -I > preview-success-metadata.txt
```

---

## ✅ Snapshot Checklist

- [ ] `get-pdf-pages-count-success.json` - Success response
- [ ] `get-pdf-pages-count-error-404.json` - File not found
- [ ] `render-page-success-metadata.txt` - HTTP headers
- [ ] `render-page-error-404.json` - Page not found
- [ ] `preview-success-metadata.txt` - HTTP headers
- [ ] `preview-error-404.json` - File not found

---

## 📝 Notes

- Binary image responses cannot be stored as JSON
- Store HTTP headers in `.txt` files for binary endpoints
- All snapshots should use same test file ID for consistency
- Update this README when adding new snapshots

---

**Last Updated:** 2026-01-08  
**Status:** ⏳ Snapshots pending capture

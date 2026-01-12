# API Response Snapshots - Word Preview (v1)

> **Endpoint:** `GET /api/Files/{id}/preview/word`  
> **Version:** v1  
> **Created:** 2026-01-12  
> **Environment:** Dev (https://vega-file-api-dev.allianceitsc.com)

---

## 📁 Snapshot Files

| File             | Description                      | Status     | Captured Date |
| ---------------- | -------------------------------- | ---------- | ------------- |
| `success.json`   | Successful DOCX conversion       | ⏳ PENDING | -             |
| `error-404.json` | File not found error             | ⏳ PENDING | -             |
| `error-415.json` | Unsupported format (.doc legacy) | ⏳ PENDING | -             |
| `error-400.json` | Invalid file ID format           | ⏳ PENDING | -             |

---

## 🔧 How to Capture Snapshots

### Prerequisites

1. Access token from dev environment
2. Test DOCX file uploaded to File API
3. Test DOC file (legacy) for 415 error

### Capture Commands

#### 1. Success Case (200 OK)

```powershell
# Upload a test DOCX file first
$fileId = "550e8400-e29b-41d4-a716-446655440000" # Replace with actual file ID
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Replace with actual token

# Call preview endpoint
$response = Invoke-RestMethod `
  -Uri "https://vega-file-api-dev.allianceitsc.com/api/Files/$fileId/preview/word?maxContentLength=500000" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }

# Save to file
$response | ConvertTo-Json -Depth 10 | Out-File -FilePath "success.json" -Encoding UTF8
```

#### 2. Error 404 - File Not Found

```powershell
# Use non-existent file ID
$fileId = "00000000-0000-0000-0000-000000000000"
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

try {
  $response = Invoke-RestMethod `
    -Uri "https://vega-file-api-dev.allianceitsc.com/api/Files/$fileId/preview/word" `
    -Method GET `
    -Headers @{
      "Authorization" = "Bearer $token"
    }
} catch {
  $_.ErrorDetails.Message | Out-File -FilePath "error-404.json" -Encoding UTF8
}
```

#### 3. Error 415 - Unsupported Media Type (Legacy .doc)

```powershell
# Upload a .doc file (not .docx) and use its file ID
$fileId = "..." # File ID of .doc file
$token = "..."

try {
  $response = Invoke-RestMethod `
    -Uri "https://vega-file-api-dev.allianceitsc.com/api/Files/$fileId/preview/word" `
    -Method GET `
    -Headers @{
      "Authorization" = "Bearer $token"
    }
} catch {
  $_.ErrorDetails.Message | Out-File -FilePath "error-415.json" -Encoding UTF8
}
```

#### 4. Error 400 - Invalid File ID

```powershell
# Use invalid UUID format
$fileId = "invalid-id-format"
$token = "..."

try {
  $response = Invoke-RestMethod `
    -Uri "https://vega-file-api-dev.allianceitsc.com/api/Files/$fileId/preview/word" `
    -Method GET `
    -Headers @{
      "Authorization" = "Bearer $token"
    }
} catch {
  $_.ErrorDetails.Message | Out-File -FilePath "error-400.json" -Encoding UTF8
}
```

---

## 📝 Test DOCX File Requirements

To get comprehensive snapshot, upload a DOCX file with:

- ✅ Headings (H1, H2, H3)
- ✅ Paragraphs with bold, italic, underline
- ✅ Numbered list (ordered)
- ✅ Bullet list (unordered)
- ✅ Simple table (2-3 rows, 3-4 columns)
- ✅ At least 1 embedded image
- ❌ No comments or tracked changes (will be ignored)
- ❌ No complex formatting (text boxes, shapes)

---

## ✅ Validation Checklist

After capturing snapshots, verify:

- [ ] `success.json` - Contains all expected fields
  - [ ] `fileId` is UUID
  - [ ] `fileName` matches test file
  - [ ] `metadata.hasImages` = true (if test file has images)
  - [ ] `htmlContent` is not null
  - [ ] `cssStyles` is not null
  - [ ] `watermark.userIdentifier` is present
- [ ] `error-404.json` - Status code 404
  - [ ] Contains `type`, `title`, `status`, `detail`, `instance`
- [ ] `error-415.json` - Status code 415
  - [ ] Detail mentions ".doc not supported"
- [ ] `error-400.json` - Status code 400
  - [ ] Detail mentions "invalid file ID format"

---

## 🔗 Related Documentation

- API Contract: [../contract.md](../contract.md)
- File Upload API: [../../upload/contract.md](../../upload/contract.md)
- Swagger: https://vega-file-api-dev.allianceitsc.com/swagger/index.html

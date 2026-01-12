# API Response Snapshots - Excel Preview (v1)

> **Endpoint:** `GET /api/Files/{id}/preview/excel`  
> **Version:** v1  
> **Created:** 2026-01-12  
> **Environment:** Dev (https://vega-file-api-dev.allianceitsc.com)

---

## 📁 Snapshot Files

| File                  | Description                     | Status     | Captured Date |
| --------------------- | ------------------------------- | ---------- | ------------- |
| `success.json`        | Basic Excel parsing             | ⏳ PENDING | -             |
| `success-styles.json` | Excel with cell styles          | ⏳ PENDING | -             |
| `success-merged.json` | Excel with merged cells         | ⏳ PENDING | -             |
| `truncated.json`      | Large file (truncated response) | ⏳ PENDING | -             |
| `error-404.json`      | File not found error            | ⏳ PENDING | -             |
| `error-415.json`      | Unsupported format error        | ⏳ PENDING | -             |
| `error-400.json`      | Invalid parameters error        | ⏳ PENDING | -             |

---

## 🔧 How to Capture Snapshots

### Prerequisites

1. Access token from dev environment
2. Test XLSX files uploaded to File API:
   - Basic file (simple data)
   - File with cell styles
   - File with merged cells
   - Large file (for truncation test)
3. Test non-Excel file for 415 error

### Capture Commands

#### 1. Success Case - Basic (200 OK)

```powershell
# Upload a basic test XLSX file first
$fileId = "550e8400-e29b-41d4-a716-446655440000" # Replace with actual file ID
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Replace with actual token

# Call preview endpoint
$response = Invoke-RestMethod `
  -Uri "https://vega-file-api-dev.allianceitsc.com/api/Files/$fileId/preview/excel?maxRows=500&maxColumns=50&maxSheets=5&includeStyles=false" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }

# Save to file
$response | ConvertTo-Json -Depth 10 | Out-File -FilePath "success.json" -Encoding UTF8
```

#### 2. Success Case - With Styles

```powershell
# Use file ID of Excel with cell styles
$fileId = "..." # File ID with styled cells
$token = "..."

$response = Invoke-RestMethod `
  -Uri "https://vega-file-api-dev.allianceitsc.com/api/Files/$fileId/preview/excel?includeStyles=true" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }

$response | ConvertTo-Json -Depth 10 | Out-File -FilePath "success-styles.json" -Encoding UTF8
```

#### 3. Success Case - With Merged Cells

```powershell
# Use file ID of Excel with merged cells
$fileId = "..." # File ID with merged cells
$token = "..."

$response = Invoke-RestMethod `
  -Uri "https://vega-file-api-dev.allianceitsc.com/api/Files/$fileId/preview/excel" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }

$response | ConvertTo-Json -Depth 10 | Out-File -FilePath "success-merged.json" -Encoding UTF8
```

#### 4. Truncated Response (Large File)

```powershell
# Use file ID of large Excel (> 500 rows or > 50 columns or > 5 sheets)
$fileId = "..." # File ID of large Excel
$token = "..."

$response = Invoke-RestMethod `
  -Uri "https://vega-file-api-dev.allianceitsc.com/api/Files/$fileId/preview/excel?maxRows=100&maxColumns=20&maxSheets=2" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }

$response | ConvertTo-Json -Depth 10 | Out-File -FilePath "truncated.json" -Encoding UTF8
```

#### 5. Error 404 - File Not Found

```powershell
# Use non-existent file ID
$fileId = "00000000-0000-0000-0000-000000000000"
$token = "..."

try {
  $response = Invoke-RestMethod `
    -Uri "https://vega-file-api-dev.allianceitsc.com/api/Files/$fileId/preview/excel" `
    -Method GET `
    -Headers @{
      "Authorization" = "Bearer $token"
    }
} catch {
  $_.ErrorDetails.Message | Out-File -FilePath "error-404.json" -Encoding UTF8
}
```

#### 6. Error 415 - Unsupported Media Type

```powershell
# Upload a PDF or image file and use its file ID
$fileId = "..." # File ID of non-Excel file
$token = "..."

try {
  $response = Invoke-RestMethod `
    -Uri "https://vega-file-api-dev.allianceitsc.com/api/Files/$fileId/preview/excel" `
    -Method GET `
    -Headers @{
      "Authorization" = "Bearer $token"
    }
} catch {
  $_.ErrorDetails.Message | Out-File -FilePath "error-415.json" -Encoding UTF8
}
```

#### 7. Error 400 - Invalid Parameters

```powershell
# Use negative maxRows value
$fileId = "..." # Valid file ID
$token = "..."

try {
  $response = Invoke-RestMethod `
    -Uri "https://vega-file-api-dev.allianceitsc.com/api/Files/$fileId/preview/excel?maxRows=-100" `
    -Method GET `
    -Headers @{
      "Authorization" = "Bearer $token"
    }
} catch {
  $_.ErrorDetails.Message | Out-File -FilePath "error-400.json" -Encoding UTF8
}
```

---

## 📝 Test Excel File Requirements

### Basic File (`success.json`)

Simple Excel with:

- 1-2 sheets
- 10-20 rows
- 5-10 columns
- Text, numbers, dates
- No special formatting

### Styles File (`success-styles.json`)

Excel with cell styles:

- ✅ Bold/italic text
- ✅ Background colors (yellow, blue, green)
- ✅ Font colors (red, blue, black)
- ✅ Text alignment (left, center, right)
- ✅ Different font sizes

### Merged Cells File (`success-merged.json`)

Excel with:

- ✅ Header row with merged cells (A1:D1)
- ✅ Table with merged rows or columns
- ✅ At least 2-3 merged cell ranges

### Large File (`truncated.json`)

Excel that exceeds limits:

- ❌ > 500 rows (to trigger row truncation)
- ❌ > 50 columns (to trigger column truncation)
- ❌ > 5 sheets (to trigger sheet truncation)

---

## ✅ Validation Checklist

After capturing snapshots, verify:

- [ ] `success.json` - Contains all expected fields
  - [ ] `fileId` is UUID
  - [ ] `fileName` matches test file
  - [ ] `metadata.totalSheets` > 0
  - [ ] `sheets` array is not empty
  - [ ] `sheets[0].rows` is 2D array
  - [ ] Cell has `value`, `type`, `formattedValue`
  - [ ] `watermark.userIdentifier` is present
- [ ] `success-styles.json` - Cell styles present
  - [ ] `sheets[0].rows[0][0].style` is not null
  - [ ] `style.bold`, `style.backgroundColor` are populated
- [ ] `success-merged.json` - Merged cells present
  - [ ] `sheets[0].mergedCells` array has items
  - [ ] Each item has `firstRow`, `lastRow`, `firstColumn`, `lastColumn`
- [ ] `truncated.json` - Truncation flags set
  - [ ] `metadata.isTruncated` = true
  - [ ] `metadata.truncationReason` is not null
  - [ ] OR `sheets[0].isTruncated` = true
- [ ] `error-404.json` - Status code 404
  - [ ] Contains `type`, `title`, `status`, `detail`, `instance`
- [ ] `error-415.json` - Status code 415
  - [ ] Detail mentions "only .xlsx and .xls files supported"
- [ ] `error-400.json` - Status code 400
  - [ ] Detail mentions parameter validation error

---

## 📊 Sample Cell Data Structure

Expected structure in `success.json`:

```json
{
  "sheets": [
    {
      "rows": [
        [
          {
            "value": "Product Name",
            "type": "string",
            "formattedValue": "Product Name",
            "style": null
          },
          {
            "value": 12500.5,
            "type": "number",
            "formattedValue": "$12,500.50",
            "style": null
          },
          {
            "value": "2026-01-12T00:00:00",
            "type": "date",
            "formattedValue": "12/01/2026",
            "style": null
          }
        ]
      ]
    }
  ]
}
```

---

## 🔗 Related Documentation

- API Contract: [../contract.md](../contract.md)
- File Upload API: [../../upload/contract.md](../../upload/contract.md)
- Swagger: https://vega-file-api-dev.allianceitsc.com/swagger/index.html

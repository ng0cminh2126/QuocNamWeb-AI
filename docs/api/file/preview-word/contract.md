# API Contract - Word File Preview

> **Module:** File  
> **Feature:** Preview Word  
> **Endpoint:** `GET /api/Files/{id}/preview/word`  
> **Base URL (Dev):** https://vega-file-api-dev.allianceitsc.com  
> **Base URL (Prod):** https://vega-file-api.allianceitsc.com  
> **Status:** ⏳ PENDING (Chưa có snapshots)  
> **Created:** 2026-01-12  
> **Last Updated:** 2026-01-12

---

## 📋 Overview

| Property        | Value                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method**      | GET                                                                                                                                                                       |
| **Path**        | `/api/Files/{id}/preview/word`                                                                                                                                            |
| **Auth**        | ✅ Required (Bearer token)                                                                                                                                                |
| **Summary**     | Get Word file preview as HTML. Converts DOCX to semantic HTML using Mammoth library.                                                                                      |
| **Description** | Converts .docx files to semantic HTML for in-browser preview. Supports headings, paragraphs, lists, bold/italic/underline, basic tables, and embedded images (as base64). |
| **Created By**  | GitHub Copilot (2026-01-08)                                                                                                                                               |

---

## ⚠️ Supported Formats

| Format  | Support Status     | Notes                                      |
| ------- | ------------------ | ------------------------------------------ |
| `.docx` | ✅ Fully supported | OOXML format - converted using Mammoth lib |
| `.doc`  | ❌ NOT supported   | Legacy format - not supported              |

---

## 📥 Request

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | `uuid` | ✅ Yes   | File ID     |

### Query Parameters

| Parameter          | Type      | Required | Default  | Description                           |
| ------------------ | --------- | -------- | -------- | ------------------------------------- |
| `maxContentLength` | `integer` | ❌ No    | `500000` | Max HTML content length in characters |

### Headers

```http
Authorization: Bearer {access_token}
```

### Request Example

```http
GET /api/Files/550e8400-e29b-41d4-a716-446655440000/preview/word?maxContentLength=500000 HTTP/1.1
Host: vega-file-api-dev.allianceitsc.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📤 Response

### Success Response (200 OK)

**TypeScript Interface:**

```typescript
interface WordPreviewDto {
  fileId: string; // UUID format
  fileName: string | null;
  metadata: WordMetadataDto;
  htmlContent: string | null; // Converted HTML content
  cssStyles: string | null; // CSS styles for HTML
  watermark: WatermarkInfoDto;
}

interface WordMetadataDto {
  fileSize: number; // int64
  contentType: string | null;
  hasImages: boolean;
  imageCount: number; // int32
  hasTables: boolean;
  isTruncated: boolean;
  truncationReason: string | null;
  warnings: string[] | null; // Array of warning messages
}

interface WatermarkInfoDto {
  userIdentifier: string | null; // User email or ID
  timestamp: string; // ISO 8601 date-time
  text: string | null; // Watermark text
}
```

**Content-Type:** `application/json`

**Example Response:**

```json
{
  "fileId": "550e8400-e29b-41d4-a716-446655440000",
  "fileName": "report.docx",
  "metadata": {
    "fileSize": 524288,
    "contentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "hasImages": true,
    "imageCount": 3,
    "hasTables": true,
    "isTruncated": false,
    "truncationReason": null,
    "warnings": []
  },
  "htmlContent": "<h1>Document Title</h1><p>This is a <strong>bold</strong> paragraph.</p><table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>",
  "cssStyles": "h1 { font-size: 24px; font-weight: bold; } p { font-size: 14px; }",
  "watermark": {
    "userIdentifier": "user@example.com",
    "timestamp": "2026-01-12T10:30:00Z",
    "text": "user@example.com - 12/01/2026 10:30:00"
  }
}
```

---

## 🔴 Error Responses

### 404 Not Found

**When:** File ID không tồn tại trong database

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "File with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "instance": "/api/Files/550e8400-e29b-41d4-a716-446655440000/preview/word"
}
```

### 400 Bad Request

**When:**

- File ID format không hợp lệ (not a valid UUID)
- `maxContentLength` value không hợp lệ

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid file ID format",
  "instance": "/api/Files/invalid-id/preview/word"
}
```

### 415 Unsupported Media Type

**When:** File không phải là DOCX format (hoặc là .doc legacy)

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.13",
  "title": "Unsupported Media Type",
  "status": 415,
  "detail": "File format not supported. Only .docx files are supported. Legacy .doc files are not supported.",
  "instance": "/api/Files/550e8400-e29b-41d4-a716-446655440000/preview/word"
}
```

---

## 🔒 Validation Rules

| Field              | Rule                     | Error Message                                            |
| ------------------ | ------------------------ | -------------------------------------------------------- |
| `id`               | Must be valid UUID       | "Invalid file ID format"                                 |
| `id`               | Must exist in database   | "File with ID {id} not found"                            |
| File format        | Must be `.docx`          | "Only .docx files supported. Legacy .doc not supported." |
| `maxContentLength` | Must be positive integer | "Max content length must be a positive integer"          |
| Authorization      | Bearer token required    | "Unauthorized"                                           |

---

## 📖 HTML Conversion Details

Mammoth library converts DOCX to semantic HTML with the following support:

### ✅ Supported Elements

| DOCX Feature      | HTML Output                         | Notes                             |
| ----------------- | ----------------------------------- | --------------------------------- |
| Headings (H1-H6)  | `<h1>`, `<h2>`, ..., `<h6>`         | Preserved hierarchy               |
| Paragraphs        | `<p>`                               | Standard paragraphs               |
| Bold              | `<strong>`                          | Bold text                         |
| Italic            | `<em>`                              | Italic text                       |
| Underline         | `<u>`                               | Underlined text                   |
| Lists (ordered)   | `<ol>`, `<li>`                      | Numbered lists                    |
| Lists (unordered) | `<ul>`, `<li>`                      | Bullet lists                      |
| Tables            | `<table>`, `<tr>`, `<td>`           | Basic tables (no complex styling) |
| Images            | `<img src="data:image/...;base64">` | Embedded as base64                |

### ⚠️ Limitations

- Complex table styling (merged cells, borders) may not render correctly
- Comments and tracked changes are ignored
- Headers and footers are not included
- Page breaks are not preserved
- Some advanced formatting (text boxes, shapes) may be lost

---

## 🔗 Snapshots

Snapshot files location: `docs/api/file/preview-word/snapshots/v1/`

| Snapshot File    | Description                          | Status     |
| ---------------- | ------------------------------------ | ---------- |
| `success.json`   | Successful DOCX conversion response  | ⏳ PENDING |
| `error-404.json` | File not found error                 | ⏳ PENDING |
| `error-415.json` | Unsupported format error (.doc file) | ⏳ PENDING |
| `error-400.json` | Invalid ID format error              | ⏳ PENDING |

---

## 📝 Implementation Notes

### Backend Processing

1. File validation:
   - Check file exists in DB
   - Verify file extension is `.docx` (case-insensitive)
2. Mammoth conversion:
   - Load DOCX file from storage
   - Parse using Mammoth.NET library
   - Convert to semantic HTML
3. Watermark injection:
   - Add watermark info to response
   - User identifier from JWT token
   - Current timestamp
4. Content truncation:
   - Apply `maxContentLength` limit
   - Set `isTruncated: true` if content exceeds limit
   - Provide `truncationReason` message

### Frontend Usage

```typescript
// Example usage in React
async function previewWordFile(fileId: string) {
  const response = await fetch(
    `https://vega-file-api-dev.allianceitsc.com/api/Files/${fileId}/preview/word?maxContentLength=500000`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to preview Word file");
  }

  const data: WordPreviewDto = await response.json();

  // Render HTML content
  return (
    <div>
      <style>{data.cssStyles}</style>
      <div dangerouslySetInnerHTML={{ __html: data.htmlContent }} />
      <div className="watermark">{data.watermark.text}</div>
    </div>
  );
}
```

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                    | Status           |
| --------------------------- | ---------------- |
| Đã review API specification | ⬜ Chưa review   |
| Cần snapshot files          | ⬜ Chưa cung cấp |
| **APPROVED để implement**   | ⬜ CHƯA APPROVED |

**HUMAN Tasks:**

1. ⬜ Cung cấp actual response snapshots từ dev API:

   - Success case với DOCX file thật
   - Error 404 case
   - Error 415 case (với .doc file)
   - Error 400 case (invalid UUID)

2. ⬜ Xác nhận `maxContentLength` default value (500000)

3. ⬜ Test Mammoth conversion quality với real DOCX files

**HUMAN Signature:** [CHƯA DUYỆT]  
**Date:** ******\_******

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC implement nếu status = ⬜ CHƯA APPROVED**

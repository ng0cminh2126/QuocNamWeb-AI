# API Contract - Excel File Preview

> **Module:** File  
> **Feature:** Preview Excel  
> **Endpoint:** `GET /api/Files/{id}/preview/excel`  
> **Base URL (Dev):** https://vega-file-api-dev.allianceitsc.com  
> **Base URL (Prod):** https://vega-file-api.allianceitsc.com  
> **Status:** ⏳ PENDING (Chưa có snapshots)  
> **Created:** 2026-01-12  
> **Last Updated:** 2026-01-12

---

## 📋 Overview

| Property        | Value                                                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Method**      | GET                                                                                                                              |
| **Path**        | `/api/Files/{id}/preview/excel`                                                                                                  |
| **Auth**        | ✅ Required (Bearer token)                                                                                                       |
| **Summary**     | Preview Excel file (.xlsx, .xls) as JSON data. Returns parsed sheets with cells, styles, and watermark info.                     |
| **Description** | Parses Excel files and returns structured JSON data including cell values, formatting, merged cells, column info, and watermark. |
| **Created By**  | GitHub Copilot (2026-01-08)                                                                                                      |

---

## ⚠️ Supported Formats

| Format  | Support Status     | Notes                       |
| ------- | ------------------ | --------------------------- |
| `.xlsx` | ✅ Fully supported | Modern Excel format (OOXML) |
| `.xls`  | ✅ Supported       | Legacy Excel format (BIFF8) |

---

## 📥 Request

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | `uuid` | ✅ Yes   | File ID     |

### Query Parameters

| Parameter       | Type      | Required | Default | Description                              |
| --------------- | --------- | -------- | ------- | ---------------------------------------- |
| `maxRows`       | `integer` | ❌ No    | `500`   | Maximum rows per sheet to parse          |
| `maxColumns`    | `integer` | ❌ No    | `50`    | Maximum columns per sheet to parse       |
| `maxSheets`     | `integer` | ❌ No    | `5`     | Maximum number of sheets to parse        |
| `includeStyles` | `boolean` | ❌ No    | `true`  | Include cell styles (bold, colors, etc.) |

### Headers

```http
Authorization: Bearer {access_token}
```

### Request Example

```http
GET /api/Files/550e8400-e29b-41d4-a716-446655440000/preview/excel?maxRows=500&maxColumns=50&maxSheets=5&includeStyles=true HTTP/1.1
Host: vega-file-api-dev.allianceitsc.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📤 Response

### Success Response (200 OK)

**TypeScript Interface:**

```typescript
interface ExcelPreviewDto {
  fileId: string; // UUID format
  fileName: string | null;
  metadata: ExcelMetadataDto;
  sheets: SheetDataDto[] | null;
  watermark: WatermarkInfoDto;
}

interface ExcelMetadataDto {
  totalSheets: number; // int32 - Total sheets in workbook
  totalRows: number; // int32 - Total rows across all sheets
  totalCells: number; // int32 - Total cells parsed
  isTruncated: boolean; // True if data was truncated
  truncationReason: string | null; // Reason for truncation
  fileSize: number; // int64 - File size in bytes
  contentType: string | null; // MIME type
}

interface SheetDataDto {
  name: string | null; // Sheet name
  index: number; // int32 - Sheet index (0-based)
  rowCount: number; // int32 - Number of rows in this sheet
  columnCount: number; // int32 - Number of columns in this sheet
  mergedCells: MergedCellDto[] | null; // Merged cell ranges
  columns: ColumnInfoDto[] | null; // Column metadata
  rows: CellDataDto[][] | null; // 2D array of cells [row][column]
  isTruncated: boolean; // True if this sheet was truncated
}

interface CellDataDto {
  value: any; // Cell value (string, number, boolean, date, null)
  type: string | null; // Cell type: "string", "number", "boolean", "date", "formula", "error"
  formattedValue: string | null; // Display value with number formatting
  style: CellStyleDto | null; // Cell styling (if includeStyles=true)
}

interface CellStyleDto {
  bold: boolean | null;
  italic: boolean | null;
  backgroundColor: string | null; // Hex color code (e.g., "#FFFF00")
  fontColor: string | null; // Hex color code
  horizontalAlign: string | null; // "left", "center", "right"
  fontSize: number | null; // int32
}

interface MergedCellDto {
  firstRow: number; // int32 - 0-based
  lastRow: number; // int32 - 0-based
  firstColumn: number; // int32 - 0-based
  lastColumn: number; // int32 - 0-based
}

interface ColumnInfoDto {
  index: number; // int32 - 0-based column index
  letter: string | null; // Column letter (A, B, C, ..., AA, AB, ...)
  width: number; // int32 - Column width in characters
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
  "fileName": "sales-report.xlsx",
  "metadata": {
    "totalSheets": 3,
    "totalRows": 120,
    "totalCells": 1500,
    "isTruncated": false,
    "truncationReason": null,
    "fileSize": 1048576,
    "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  },
  "sheets": [
    {
      "name": "Sales Data",
      "index": 0,
      "rowCount": 100,
      "columnCount": 10,
      "mergedCells": [
        {
          "firstRow": 0,
          "lastRow": 0,
          "firstColumn": 0,
          "lastColumn": 4
        }
      ],
      "columns": [
        {
          "index": 0,
          "letter": "A",
          "width": 15
        },
        {
          "index": 1,
          "letter": "B",
          "width": 20
        }
      ],
      "rows": [
        [
          {
            "value": "Product Name",
            "type": "string",
            "formattedValue": "Product Name",
            "style": {
              "bold": true,
              "italic": false,
              "backgroundColor": "#FFFF00",
              "fontColor": "#000000",
              "horizontalAlign": "center",
              "fontSize": 12
            }
          },
          {
            "value": "Sales Amount",
            "type": "string",
            "formattedValue": "Sales Amount",
            "style": {
              "bold": true,
              "italic": false,
              "backgroundColor": "#FFFF00",
              "fontColor": "#000000",
              "horizontalAlign": "center",
              "fontSize": 12
            }
          }
        ],
        [
          {
            "value": "Widget A",
            "type": "string",
            "formattedValue": "Widget A",
            "style": null
          },
          {
            "value": 12500.5,
            "type": "number",
            "formattedValue": "$12,500.50",
            "style": null
          }
        ]
      ],
      "isTruncated": false
    }
  ],
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
  "instance": "/api/Files/550e8400-e29b-41d4-a716-446655440000/preview/excel"
}
```

### 400 Bad Request

**When:**

- File ID format không hợp lệ (not a valid UUID)
- Query parameters không hợp lệ (negative values, etc.)

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid parameter: maxRows must be a positive integer",
  "instance": "/api/Files/550e8400-e29b-41d4-a716-446655440000/preview/excel"
}
```

### 415 Unsupported Media Type

**When:** File không phải là Excel format (.xlsx hoặc .xls)

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.13",
  "title": "Unsupported Media Type",
  "status": 415,
  "detail": "File format not supported. Only .xlsx and .xls files are supported.",
  "instance": "/api/Files/550e8400-e29b-41d4-a716-446655440000/preview/excel"
}
```

---

## 🔒 Validation Rules

| Field         | Rule                      | Error Message                           |
| ------------- | ------------------------- | --------------------------------------- |
| `id`          | Must be valid UUID        | "Invalid file ID format"                |
| `id`          | Must exist in database    | "File with ID {id} not found"           |
| File format   | Must be `.xlsx` or `.xls` | "Only .xlsx and .xls files supported"   |
| `maxRows`     | Must be positive integer  | "maxRows must be a positive integer"    |
| `maxColumns`  | Must be positive integer  | "maxColumns must be a positive integer" |
| `maxSheets`   | Must be positive integer  | "maxSheets must be a positive integer"  |
| Authorization | Bearer token required     | "Unauthorized"                          |

---

## 📊 Cell Type Details

| Cell Type | `type` Value | `value` Type   | Example Value       | `formattedValue` Example |
| --------- | ------------ | -------------- | ------------------- | ------------------------ |
| Text      | `"string"`   | `string`       | `"Hello World"`     | `"Hello World"`          |
| Number    | `"number"`   | `number`       | `12500.50`          | `"$12,500.50"`           |
| Boolean   | `"boolean"`  | `boolean`      | `true`              | `"TRUE"`                 |
| Date      | `"date"`     | `string` (ISO) | `"2026-01-12"`      | `"12/01/2026"`           |
| Formula   | `"formula"`  | `any` (result) | `150` (from =SUM()) | `"150"`                  |
| Error     | `"error"`    | `string`       | `"#DIV/0!"`         | `"#DIV/0!"`              |
| Empty     | `null`       | `null`         | `null`              | `null`                   |

---

## 🎨 Style Properties

### Background Colors

Common background colors in Excel:

| Color Name  | Hex Code  |
| ----------- | --------- |
| Yellow      | `#FFFF00` |
| Light Blue  | `#ADD8E6` |
| Light Green | `#90EE90` |
| Light Gray  | `#D3D3D3` |
| White       | `#FFFFFF` |

### Horizontal Alignment

| Value      | Description    |
| ---------- | -------------- |
| `"left"`   | Left-aligned   |
| `"center"` | Center-aligned |
| `"right"`  | Right-aligned  |
| `null`     | Default (left) |

---

## 📏 Truncation Behavior

### When Truncation Occurs

1. **Sheet limit exceeded:** More than `maxSheets` sheets in workbook
2. **Row limit exceeded:** More than `maxRows` rows in a sheet
3. **Column limit exceeded:** More than `maxColumns` columns in a sheet
4. **File too large:** File size exceeds processing limit

### Truncation Metadata

```json
{
  "metadata": {
    "isTruncated": true,
    "truncationReason": "Sheet count exceeds limit (10 sheets, max 5)"
  },
  "sheets": [
    {
      "isTruncated": true,
      "rowCount": 500,
      "columnCount": 50
    }
  ]
}
```

---

## 🔗 Snapshots

Snapshot files location: `docs/api/file/preview-excel/snapshots/v1/`

| Snapshot File         | Description                       | Status     |
| --------------------- | --------------------------------- | ---------- |
| `success.json`        | Successful Excel parsing response | ⏳ PENDING |
| `success-styles.json` | Success with cell styles included | ⏳ PENDING |
| `success-merged.json` | Success with merged cells         | ⏳ PENDING |
| `truncated.json`      | Truncated response (large file)   | ⏳ PENDING |
| `error-404.json`      | File not found error              | ⏳ PENDING |
| `error-415.json`      | Unsupported format error          | ⏳ PENDING |
| `error-400.json`      | Invalid parameters error          | ⏳ PENDING |

---

## 📝 Implementation Notes

### Backend Processing

1. File validation:
   - Check file exists in DB
   - Verify file extension is `.xlsx` or `.xls` (case-insensitive)
2. Excel parsing:
   - Load Excel file from storage
   - Parse using EPPlus or ClosedXML library
   - Respect `maxSheets`, `maxRows`, `maxColumns` limits
3. Cell processing:
   - Extract cell values and types
   - Apply number formatting to get `formattedValue`
   - Extract styles if `includeStyles=true`
   - Detect merged cell ranges
4. Watermark injection:
   - Add watermark info to response
   - User identifier from JWT token
   - Current timestamp

### Frontend Usage

```typescript
// Example usage in React
interface ExcelViewerProps {
  fileId: string;
}

export default function ExcelViewer({ fileId }: ExcelViewerProps) {
  const [data, setData] = useState<ExcelPreviewDto | null>(null);

  useEffect(() => {
    async function fetchExcel() {
      const response = await fetch(
        `https://vega-file-api-dev.allianceitsc.com/api/Files/${fileId}/preview/excel?maxRows=500&includeStyles=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const json = await response.json();
      setData(json);
    }

    fetchExcel();
  }, [fileId]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>{data.fileName}</h2>
      {data.sheets?.map((sheet) => (
        <div key={sheet.index}>
          <h3>{sheet.name}</h3>
          <table>
            {sheet.rows?.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      fontWeight: cell.style?.bold ? "bold" : "normal",
                      fontStyle: cell.style?.italic ? "italic" : "normal",
                      backgroundColor:
                        cell.style?.backgroundColor || "transparent",
                      color: cell.style?.fontColor || "inherit",
                      textAlign: cell.style?.horizontalAlign || "left",
                    }}
                  >
                    {cell.formattedValue || cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </table>
        </div>
      ))}
      <div className="watermark">{data.watermark.text}</div>
    </div>
  );
}
```

---

## 🚀 Performance Considerations

### Recommended Limits

| Parameter       | Recommended | Max Safe Value | Notes                                |
| --------------- | ----------- | -------------- | ------------------------------------ |
| `maxRows`       | 500         | 1000           | Higher values increase memory usage  |
| `maxColumns`    | 50          | 100            | Wide sheets can cause slow rendering |
| `maxSheets`     | 5           | 10             | Multiple sheets multiply data size   |
| `includeStyles` | `true`      | -              | Styles add ~30% to response size     |

### Response Size Estimation

- **Without styles:** ~100-200 bytes per cell
- **With styles:** ~150-300 bytes per cell
- **Example:** 500 rows × 50 columns × 200 bytes = ~5 MB per sheet

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                    | Status           |
| --------------------------- | ---------------- |
| Đã review API specification | ⬜ Chưa review   |
| Cần snapshot files          | ⬜ Chưa cung cấp |
| **APPROVED để implement**   | ⬜ CHƯA APPROVED |

**HUMAN Tasks:**

1. ⬜ Cung cấp actual response snapshots từ dev API:

   - Success case với XLSX file thật
   - Success case với XLS file (legacy)
   - Success case với merged cells
   - Truncated case (large file)
   - Error 404 case
   - Error 415 case (với PDF file)
   - Error 400 case (invalid parameters)

2. ⬜ Xác nhận default values:

   - `maxRows: 500` - có đủ không?
   - `maxColumns: 50` - có đủ không?
   - `maxSheets: 5` - có đủ không?

3. ⬜ Test với Excel files thực tế:
   - File có formulas
   - File có merged cells
   - File có nhiều sheets
   - File có cell styles phức tạp

**HUMAN Signature:** [CHƯA DUYỆT]  
**Date:** ******\_******

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC implement nếu status = ⬜ CHƯA APPROVED**

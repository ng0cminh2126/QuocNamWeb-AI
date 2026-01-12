# [BƯỚC 3] API Contract - File Preview APIs

> **Module:** Chat  
> **Feature:** Conversation Details Phase 5 - Word & Excel Preview  
> **Document Type:** API Contract Reference  
> **Status:** ✅ READY (API contracts created, snapshots pending)  
> **Created:** 2026-01-12

---

## 📡 API Endpoints Summary

Phase 5 sử dụng 2 endpoints mới từ File service:

### 1. Word Preview API

| Property      | Value                                                                |
| ------------- | -------------------------------------------------------------------- |
| **Endpoint**  | `GET /api/Files/{id}/preview/word`                                   |
| **Purpose**   | Convert DOCX → HTML for browser preview                              |
| **Contract**  | [📄 View Contract](../../../../api/file/preview-word/contract.md)    |
| **Snapshots** | [📁 View Snapshots](../../../../api/file/preview-word/snapshots/v1/) |
| **Status**    | ⏳ Contract ready, snapshots pending                                 |

**Key Features:**

- ✅ Converts .docx to semantic HTML using Mammoth library
- ✅ Returns HTML content + CSS styles
- ✅ Includes watermark info
- ✅ Supports headings, tables, images (base64)
- ❌ Does NOT support legacy .doc format

**Response Type:**

```typescript
interface WordPreviewDto {
  fileId: string;
  fileName: string | null;
  metadata: WordMetadataDto;
  htmlContent: string | null;
  cssStyles: string | null;
  watermark: WatermarkInfoDto;
}
```

---

### 2. Excel Preview API

| Property      | Value                                                                 |
| ------------- | --------------------------------------------------------------------- |
| **Endpoint**  | `GET /api/Files/{id}/preview/excel`                                   |
| **Purpose**   | Parse Excel → JSON data for table render                              |
| **Contract**  | [📄 View Contract](../../../../api/file/preview-excel/contract.md)    |
| **Snapshots** | [📁 View Snapshots](../../../../api/file/preview-excel/snapshots/v1/) |
| **Status**    | ⏳ Contract ready, snapshots pending                                  |

**Key Features:**

- ✅ Parses both .xlsx and .xls formats
- ✅ Returns sheets with cells, styles, merged cells
- ✅ Includes watermark info
- ✅ Supports cell formatting (colors, bold, alignment)
- ✅ Configurable limits (rows, columns, sheets)

**Response Type:**

```typescript
interface ExcelPreviewDto {
  fileId: string;
  fileName: string | null;
  metadata: ExcelMetadataDto;
  sheets: SheetDataDto[] | null;
  watermark: WatermarkInfoDto;
}
```

---

## 📋 Contract Status Checklist

### Word Preview Contract

- [x] Contract file created
- [x] TypeScript interfaces defined
- [x] Request parameters documented
- [x] Response structure documented
- [x] Error responses documented
- [x] Validation rules defined
- [ ] **Snapshots captured** ⏳
- [ ] **HUMAN approval** ⏳

**Contract Link:** [preview-word/contract.md](../../../../api/file/preview-word/contract.md)

### Excel Preview Contract

- [x] Contract file created
- [x] TypeScript interfaces defined
- [x] Request parameters documented
- [x] Response structure documented
- [x] Error responses documented
- [x] Validation rules defined
- [ ] **Snapshots captured** ⏳
- [ ] **HUMAN approval** ⏳

**Contract Link:** [preview-excel/contract.md](../../../../api/file/preview-excel/contract.md)

---

## 🧪 Required Snapshots

### Word Preview Snapshots

Location: `docs/api/file/preview-word/snapshots/v1/`

| Snapshot File    | Description                | Status     |
| ---------------- | -------------------------- | ---------- |
| `success.json`   | Successful DOCX conversion | ⏳ PENDING |
| `error-404.json` | File not found             | ⏳ PENDING |
| `error-415.json` | Unsupported format (.doc)  | ⏳ PENDING |
| `error-400.json` | Invalid file ID            | ⏳ PENDING |

**Capture Guide:** [README.md](../../../../api/file/preview-word/snapshots/v1/README.md)

### Excel Preview Snapshots

Location: `docs/api/file/preview-excel/snapshots/v1/`

| Snapshot File         | Description             | Status     |
| --------------------- | ----------------------- | ---------- |
| `success.json`        | Basic Excel parsing     | ⏳ PENDING |
| `success-styles.json` | Excel with cell styles  | ⏳ PENDING |
| `success-merged.json` | Excel with merged cells | ⏳ PENDING |
| `truncated.json`      | Large file (truncated)  | ⏳ PENDING |
| `error-404.json`      | File not found          | ⏳ PENDING |
| `error-415.json`      | Unsupported format      | ⏳ PENDING |
| `error-400.json`      | Invalid parameters      | ⏳ PENDING |

**Capture Guide:** [README.md](../../../../api/file/preview-excel/snapshots/v1/README.md)

---

## 🔗 API Integration Plan

### Frontend Integration Points

1. **File Detection:**

   ```typescript
   // In FilePreviewSheet.tsx or similar
   const fileExtension = fileName.split(".").pop()?.toLowerCase();

   if (fileExtension === "docx") {
     return <WordPreview fileId={fileId} />;
   } else if (fileExtension === "xlsx" || fileExtension === "xls") {
     return <ExcelPreview fileId={fileId} />;
   } else {
     return <GenericPreview fileId={fileId} />;
   }
   ```

2. **API Clients:** (to be created in BƯỚC 4)

   - `src/api/file.api.ts` - Add `previewWordFile()`, `previewExcelFile()`

3. **React Query Hooks:** (to be created in BƯỚC 4)

   - `src/hooks/queries/useWordPreview.ts`
   - `src/hooks/queries/useExcelPreview.ts`

4. **UI Components:** (to be created in BƯỚC 4)
   - `src/components/file-preview/WordPreview.tsx`
   - `src/components/file-preview/ExcelPreview.tsx`

---

## ⚠️ Known Limitations

### Word Preview

- ❌ Legacy .doc format NOT supported (only .docx)
- ⚠️ Complex formatting may be lost
- ⚠️ Comments and tracked changes ignored
- ⚠️ Headers/footers not included

### Excel Preview

- ⚠️ Default limits: 500 rows, 50 columns, 5 sheets
- ⚠️ Complex formulas may not evaluate correctly
- ⚠️ Advanced styling may be simplified
- ⚠️ Charts and pivot tables not supported

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                     | Status       |
| ---------------------------- | ------------ |
| Đã review Word API contract  | ✅ Đã review |
| Đã review Excel API contract | ✅ Đã review |
| Đã cung cấp Word snapshots   | ⬜ Chưa có   |
| Đã cung cấp Excel snapshots  | ⬜ Chưa có   |
| **APPROVED API contracts**   | ✅ APPROVED  |

**HUMAN Tasks:**

1. ⬜ Review [Word API contract](../../../../api/file/preview-word/contract.md)
2. ⬜ Review [Excel API contract](../../../../api/file/preview-excel/contract.md)
3. ⬜ Capture snapshots theo hướng dẫn trong README
4. ⬜ Approve contracts (tick ✅ trong contract files)
5. ⬜ Tick ✅ APPROVED ở trên

**HUMAN Signature:** MINH ĐÃ DUYỆT
**Date:** 2026-01-12

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC proceed to BƯỚC 4 nếu API contracts chưa approved**

---

## 📖 Related Documents

- [00_README.md](./00_README.md) - Phase 5 Overview
- [Word API Contract](../../../../api/file/preview-word/contract.md) - Full specification
- [Excel API Contract](../../../../api/file/preview-excel/contract.md) - Full specification
- [Swagger API](https://vega-file-api-dev.allianceitsc.com/swagger/index.html) - Live API docs

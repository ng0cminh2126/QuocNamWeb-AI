# [BƯỚC 4] Implementation Plan - Word & Excel Preview

> **Module:** Chat  
> **Feature:** Conversation Details Phase 5 - Word & Excel Preview  
> **Document Type:** Implementation Plan & Checklist  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-12

---

## 📋 Implementation Overview

Phase 5 implementation gồm 5 bước chính:

1. Types & API Clients
2. React Query Hooks
3. UI Components
4. Integration với FilePreviewSheet
5. Testing & Documentation

**Estimated Time:** 6-8 hours

---

## 📁 File Structure

### Files sẽ tạo mới:

```
src/
├── types/
│   └── file.ts                              # ✏️ UPDATE - Thêm Word & Excel types
│
├── api/
│   └── file.api.ts                          # ✏️ UPDATE - Thêm 2 API functions
│
├── hooks/queries/
│   ├── useWordPreview.ts                    # 🆕 NEW - Word preview hook
│   ├── useExcelPreview.ts                   # 🆕 NEW - Excel preview hook
│   └── __tests__/
│       ├── useWordPreview.test.ts           # 🆕 NEW - Hook tests
│       └── useExcelPreview.test.ts          # 🆕 NEW - Hook tests
│
├── features/portal/components/file-sheet/   # Phase 5 components
│   ├── WordPreview.tsx                      # ✅ DONE - Word preview component
│   ├── ExcelPreview.tsx                     # ✅ DONE - Excel preview component
│   ├── ExcelPagination.tsx                  # ✅ DONE - Pagination controls
│   ├── ExcelSheetTabs.tsx                   # ✅ DONE - Sheet tabs component
│   ├── ExcelCell.tsx                        # ✅ DONE - Cell renderer
│   ├── PreviewHeader.tsx                    # ✅ DONE - Shared header (matches PDF style)
│   ├── Watermark.tsx                        # ✅ DONE - Watermark component
│   ├── index.ts                             # 🆕 NEW - Export barrel
│   └── __tests__/
│       ├── WordPreview.test.tsx             # 🆕 NEW - Component tests
│       ├── ExcelPreview.test.tsx            # 🆕 NEW - Component tests
│       ├── ExcelPagination.test.tsx         # 🆕 NEW - Pagination tests
│       ├── ExcelSheetTabs.test.tsx          # 🆕 NEW - Component tests
│       └── ExcelCell.test.tsx               # 🆕 NEW - Component tests
│
└── features/portal/components/file-sheet/
    └── FilePreviewSheet.tsx                 # ✏️ UPDATE - Add Word/Excel routing
```

### Files sẽ sửa đổi:

- `src/types/file.ts` - Thêm interfaces mới ✅ DONE
- `src/types/index.ts` - Export types ✅ DONE
- `src/api/filePreview.api.ts` - Thêm preview functions ✅ DONE
- `src/components/FilePreviewModal.tsx` - Integrate Phase 5 routing ✅ DONE
- `src/features/portal/types.ts` - Added FileAttachment.id field ✅ DONE

### Files sẽ xóa:

- (không có)

---

## 🔧 PHASE 1: Types & API Clients

### Task 1.1: Update TypeScript Types

**File:** `src/types/file.ts`

**Thêm interfaces:**

```typescript
// Word Preview Types
export interface WordPreviewDto {
  fileId: string;
  fileName: string | null;
  metadata: WordMetadataDto;
  htmlContent: string | null;
  cssStyles: string | null;
  watermark: WatermarkInfoDto;
}

export interface WordMetadataDto {
  fileSize: number;
  contentType: string | null;
  hasImages: boolean;
  imageCount: number;
  hasTables: boolean;
  isTruncated: boolean;
  truncationReason: string | null;
  warnings: string[] | null;
}

// Excel Preview Types
export interface ExcelPreviewDto {
  fileId: string;
  fileName: string | null;
  metadata: ExcelMetadataDto;
  sheets: SheetDataDto[] | null;
  watermark: WatermarkInfoDto;
}

export interface ExcelMetadataDto {
  totalSheets: number;
  totalRows: number;
  totalCells: number;
  isTruncated: boolean;
  truncationReason: string | null;
  fileSize: number;
  contentType: string | null;
}

export interface SheetDataDto {
  name: string | null;
  index: number;
  rowCount: number;
  columnCount: number;
  mergedCells: MergedCellDto[] | null;
  columns: ColumnInfoDto[] | null;
  rows: CellDataDto[][] | null;
  isTruncated: boolean;
}

export interface CellDataDto {
  value: any;
  type: string | null;
  formattedValue: string | null;
  style: CellStyleDto | null;
}

export interface CellStyleDto {
  bold: boolean | null;
  italic: boolean | null;
  backgroundColor: string | null;
  fontColor: string | null;
  horizontalAlign: string | null;
  fontSize: number | null;
}

export interface MergedCellDto {
  firstRow: number;
  lastRow: number;
  firstColumn: number;
  lastColumn: number;
}

export interface ColumnInfoDto {
  index: number;
  letter: string | null;
  width: number;
}

// Shared Watermark Type
export interface WatermarkInfoDto {
  userIdentifier: string | null;
  timestamp: string;
  text: string | null;
}

// Request Options
export interface WordPreviewOptions {
  maxContentLength?: number;
}

export interface ExcelPreviewOptions {
  maxRows?: number;
  maxColumns?: number;
  maxSheets?: number;
  includeStyles?: boolean;
}
```

**Checklist:**

- [ ] Add all TypeScript interfaces
- [ ] Export from `src/types/index.ts`
- [ ] Verify no TypeScript errors

---

### Task 1.2: Update API Client

**File:** `src/api/file.api.ts`

**Thêm functions:**

```typescript
import type {
  WordPreviewDto,
  WordPreviewOptions,
  ExcelPreviewDto,
  ExcelPreviewOptions,
} from "@/types/file";

/**
 * Preview Word file (.docx) as HTML
 * @throws {AxiosError} 404 if file not found, 415 if not .docx
 */
export async function previewWordFile(
  fileId: string,
  options?: WordPreviewOptions
): Promise<WordPreviewDto> {
  const params = new URLSearchParams();

  if (options?.maxContentLength) {
    params.append("maxContentLength", options.maxContentLength.toString());
  }

  const url = `/api/Files/${fileId}/preview/word${
    params.toString() ? "?" + params.toString() : ""
  }`;
  const response = await apiClient.get<WordPreviewDto>(url);

  return response.data;
}

/**
 * Preview Excel file (.xlsx, .xls) as JSON
 * @throws {AxiosError} 404 if file not found, 415 if not Excel
 */
export async function previewExcelFile(
  fileId: string,
  options?: ExcelPreviewOptions
): Promise<ExcelPreviewDto> {
  const params = new URLSearchParams();

  if (options?.maxRows) params.append("maxRows", options.maxRows.toString());
  if (options?.maxColumns)
    params.append("maxColumns", options.maxColumns.toString());
  if (options?.maxSheets)
    params.append("maxSheets", options.maxSheets.toString());
  if (options?.includeStyles !== undefined) {
    params.append("includeStyles", options.includeStyles.toString());
  }

  const url = `/api/Files/${fileId}/preview/excel${
    params.toString() ? "?" + params.toString() : ""
  }`;
  const response = await apiClient.get<ExcelPreviewDto>(url);

  return response.data;
}
```

**Checklist:**

- [ ] Add `previewWordFile` function
- [ ] Add `previewExcelFile` function
- [ ] Proper error handling
- [ ] JSDoc comments
- [ ] Test with actual API

---

## 🔧 PHASE 2: React Query Hooks

### Task 2.1: Word Preview Hook

**File:** `src/hooks/queries/useWordPreview.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { previewWordFile } from "@/api/file.api";
import type { WordPreviewOptions } from "@/types/file";

export const wordPreviewKeys = {
  all: ["word-preview"] as const,
  detail: (fileId: string, options?: WordPreviewOptions) =>
    [...wordPreviewKeys.all, fileId, options] as const,
};

export interface UseWordPreviewOptions extends WordPreviewOptions {
  enabled?: boolean;
}

export function useWordPreview(
  fileId: string,
  options?: UseWordPreviewOptions
) {
  const { enabled = true, ...previewOptions } = options ?? {};

  return useQuery({
    queryKey: wordPreviewKeys.detail(fileId, previewOptions),
    queryFn: () => previewWordFile(fileId, previewOptions),
    enabled: enabled && !!fileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
```

**Checklist:**

- [ ] Create query key factory
- [ ] Create hook with proper typing
- [ ] Add staleTime and retry config
- [ ] Test hook behavior

---

### Task 2.2: Excel Preview Hook

**File:** `src/hooks/queries/useExcelPreview.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { previewExcelFile } from "@/api/file.api";
import type { ExcelPreviewOptions } from "@/types/file";

export const excelPreviewKeys = {
  all: ["excel-preview"] as const,
  detail: (fileId: string, options?: ExcelPreviewOptions) =>
    [...excelPreviewKeys.all, fileId, options] as const,
};

export interface UseExcelPreviewOptions extends ExcelPreviewOptions {
  enabled?: boolean;
}

export function useExcelPreview(
  fileId: string,
  options?: UseExcelPreviewOptions
) {
  const { enabled = true, ...previewOptions } = options ?? {};

  return useQuery({
    queryKey: excelPreviewKeys.detail(fileId, previewOptions),
    queryFn: () => previewExcelFile(fileId, previewOptions),
    enabled: enabled && !!fileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
```

**Checklist:**

- [ ] Create query key factory
- [ ] Create hook with proper typing
- [ ] Add configuration
- [ ] Test hook behavior

---

## 🔧 PHASE 3: UI Components

### Task 3.1: Watermark Component

**File:** `src/components/file-preview/Watermark.tsx`

```typescript
import type { WatermarkInfoDto } from "@/types/file";

interface WatermarkProps {
  watermark: WatermarkInfoDto;
  className?: string;
}

export default function Watermark({
  watermark,
  className = "",
}: WatermarkProps) {
  return (
    <div
      className={`bg-gray-50 border-t border-gray-200 px-4 py-2 text-sm text-gray-600 ${className}`}
      data-testid="file-preview-watermark"
    >
      🔒 Watermark:{" "}
      {watermark.text ||
        `${watermark.userIdentifier} - ${new Date(
          watermark.timestamp
        ).toLocaleString()}`}
    </div>
  );
}
```

**Checklist:**

- [ ] Component renders watermark text
- [ ] Proper styling
- [ ] data-testid added
- [ ] Test rendering

---

### Task 3.2: Preview Header Component

**File:** `src/features/portal/components/file-sheet/PreviewHeader.tsx` ✅ DONE

**Status:** ✅ IMPLEMENTED - Matches PDF/Image modal styling

**Implementation Details:**

```typescript
import { FileText } from "lucide-react";

export interface PreviewHeaderProps {
  fileName: string;
  onClose: () => void;
}

export default function PreviewHeader({
  fileName,
  onClose,
}: PreviewHeaderProps) {
  return (
    <div
      className="flex h-[60px] items-center justify-between border-b border-gray-200 bg-white px-6"
      data-testid="file-preview-modal-header"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <FileText className="h-6 w-6 flex-shrink-0 text-blue-600" />
        <h2
          className="truncate text-lg font-semibold text-gray-900"
          title={fileName}
          data-testid="file-preview-modal-filename"
        >
          {fileName}
        </h2>
      </div>
      <button
        onClick={onClose}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-gray-800 transition-colors hover:bg-gray-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Đóng"
        data-testid="file-preview-modal-close-button"
      >
        <span className="text-lg font-medium">✕</span>
      </button>
    </div>
  );
}
```

**Key Design Decisions:**

- ✅ Height: `h-[60px]` (matches PDF modal exactly)
- ✅ Padding: `px-6` (matches PDF modal)
- ✅ FileText icon: `h-6 w-6 text-blue-600` (consistent branding)
- ✅ Native button element (not Button component) for close button
- ✅ Close icon: `✕` character in span (matches PDF modal)
- ✅ Hover effects: `hover:bg-gray-100 hover:text-red-600`
- ❌ Removed `fileType` prop - no subtitle (matches PDF simplicity)
- ❌ No download button - Phase 5 is preview-only

**Checklist:**

- [x] Component renders header with FileText icon
- [x] Close button works with proper hover effects
- [x] Proper accessibility (aria-label)
- [x] data-testid added for testing
- [x] 100% style match with PDF/Image modal header

---

### Task 3.3: Word Preview Component

**File:** `src/features/portal/components/file-sheet/WordPreview.tsx` ✅ DONE

**Status:** ✅ IMPLEMENTED - All states match PDF/Image modal styling

**Key Features:**

- ✅ Loading state: Centered spinner + "Đang tải tài liệu..." message
- ✅ Error state: Centered AlertCircle (h-16 w-16) + title + retry button
- ✅ Container: `flex h-full flex-col`
- ✅ Content area: `flex-1 overflow-y-auto bg-gray-50`
- ✅ Document rendering: `bg-white` with watermark overlay
- ✅ HTML content rendered with `dangerouslySetInnerHTML`
- ✅ CSS styles injected via `<style>` tag
- ✅ Uses PreviewHeader (matches PDF modal)

**Implementation Details:**

```typescript
import { useWordPreview } from "@/hooks/queries/useWordPreview";
import { AlertCircle } from "lucide-react";
import Watermark from "./Watermark";
import PreviewHeader from "./PreviewHeader";

export default function WordPreview({
  fileId,
  fileName,
  onClose,
}: WordPreviewProps) {
  const { data, isLoading, isError, error, refetch } = useWordPreview(fileId);

  return (
    <div className="flex h-full flex-col">
      <PreviewHeader fileName={fileName} onClose={onClose} />

      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Loading State - Centered spinner */}
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="text-sm text-gray-600">Đang tải tài liệu...</p>
            </div>
          </div>
        )}

        {/* Error State - Centered with retry button */}
        {isError && (
          <div className="flex h-full items-center justify-center">
            <div className="flex max-w-md flex-col items-center gap-4 text-center">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Không thể tải tệp
                </h3>
                <p className="text-sm text-gray-600">
                  {error?.message || "Không thể tải xem trước Word"}
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white..."
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Success State - HTML rendering with watermark */}
        {data && !isLoading && !isError && (
          <div className="relative bg-white p-6">
            <Watermark watermark={data.watermark} />
            <div className="relative z-0">
              <style>{data.cssStyles}</style>
              <div
                className="word-content prose max-w-none"
                dangerouslySetInnerHTML={{ __html: data.htmlContent }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Checklist:**

- [x] Loading spinner centered with text
- [x] Error state with centered icon and retry button
- [x] HTML content renders safely with dangerouslySetInnerHTML
- [x] CSS styles applied via <style> tag
- [x] Watermark displayed as overlay
- [x] data-testid added for testing
- [x] All states tested
- [x] Style matches PDF/Image modal exactly

---

### Task 3.4: Excel Cell Component

**File:** `src/components/file-preview/ExcelCell.tsx`

```typescript
import type { CellDataDto } from "@/types/file";

interface ExcelCellProps {
  cell: CellDataDto;
  rowIndex: number;
  colIndex: number;
}

export default function ExcelCell({
  cell,
  rowIndex,
  colIndex,
}: ExcelCellProps) {
  const style = {
    fontWeight: cell.style?.bold ? "bold" : "normal",
    fontStyle: cell.style?.italic ? "italic" : "normal",
    backgroundColor: cell.style?.backgroundColor || "transparent",
    color: cell.style?.fontColor || "inherit",
    textAlign: (cell.style?.horizontalAlign || "left") as any,
    fontSize: cell.style?.fontSize ? `${cell.style.fontSize}px` : "inherit",
  };

  return (
    <td
      className="border border-gray-300 px-3 py-2"
      style={style}
      data-testid={`excel-cell-${rowIndex}-${colIndex}`}
    >
      {cell.formattedValue ?? cell.value ?? ""}
    </td>
  );
}
```

**Checklist:**

- [ ] Cell styles applied
- [ ] Formatted value displayed
- [ ] data-testid added
- [ ] Test different cell types

---

### Task 3.5: Excel Sheet Tabs Component

**File:** `src/components/file-preview/ExcelSheetTabs.tsx`

```typescript
import type { SheetDataDto } from "@/types/file";

interface ExcelSheetTabsProps {
  sheets: SheetDataDto[];
  activeSheetIndex: number;
  onSheetChange: (index: number) => void;
}

export default function ExcelSheetTabs({
  sheets,
  activeSheetIndex,
  onSheetChange,
}: ExcelSheetTabsProps) {
  return (
    <div
      className="flex gap-1 bg-gray-50 px-4 py-2 border-b border-gray-300"
      data-testid="excel-sheet-tabs"
    >
      {sheets.map((sheet) => (
        <button
          key={sheet.index}
          onClick={() => onSheetChange(sheet.index)}
          className={`px-4 py-2 rounded-t-md transition-colors ${
            sheet.index === activeSheetIndex
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          data-testid={`excel-sheet-tab-${sheet.index}`}
          aria-selected={sheet.index === activeSheetIndex}
        >
          {sheet.name || `Sheet ${sheet.index + 1}`}
        </button>
      ))}
    </div>
  );
}
```

**Checklist:**

- [ ] Tabs render correctly
- [ ] Active tab highlighted
- [ ] Tab clicks work
- [ ] data-testid added
- [ ] Test tab switching

---

### Task 3.6: Excel Preview Component

**File:** `src/features/portal/components/file-sheet/ExcelPreview.tsx` ✅ DONE

**Status:** ✅ IMPLEMENTED - All states match PDF/Image modal styling

**Key Features:**

- ✅ Loading state: Centered spinner + "Đang tải dữ liệu..." message
- ✅ Error state: Centered AlertCircle (h-16 w-16) + title + retry button
- ✅ Multi-sheet support with ExcelSheetTabs component
- ✅ Client-side pagination (50 or 100 rows per page)
- ✅ ExcelPagination component for navigation
- ✅ Container: `flex h-full flex-col`
- ✅ Content wrapper: `flex flex-1 flex-col overflow-hidden bg-gray-50`
- ✅ Table area: `relative flex-1 overflow-auto bg-white`
- ✅ Uses PreviewHeader (matches PDF modal)

**Implementation Details:**

```typescript
import { useState, useMemo } from "react";
import { useExcelPreview } from "@/hooks/queries/useExcelPreview";
import { AlertCircle } from "lucide-react";
import Watermark from "./Watermark";
import PreviewHeader from "./PreviewHeader";
import ExcelSheetTabs from "./ExcelSheetTabs";
import ExcelPagination from "./ExcelPagination";
import ExcelCell from "./ExcelCell";

export default function ExcelPreview({
  fileId,
  fileName,
  onClose,
}: ExcelPreviewProps) {
  const { data, isLoading, isError, error, refetch } = useExcelPreview(fileId, {
    includeStyles: true,
  });

  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="flex h-full flex-col">
      <PreviewHeader fileName={fileName} onClose={onClose} />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        {/* Loading State - Centered spinner */}
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="text-sm text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        )}

        {/* Error State - Centered with retry button */}
        {isError && (
          <div className="flex h-full items-center justify-center">
            <div className="flex max-w-md flex-col items-center gap-4 text-center">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Không thể tải tệp
                </h3>
                <p className="text-sm text-gray-600">
                  {error?.message || "Không thể tải xem trước Excel"}
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="rounded-lg bg-blue-600..."
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Success State - Table with sheets and pagination */}
        {data && !isLoading && !isError && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Sheet Tabs */}
            <ExcelSheetTabs
              sheetNames={data.sheets.map((s) => s.name)}
              activeSheetIndex={activeSheetIndex}
              onSheetChange={handleSheetChange}
            />

            {/* Table Content with Watermark */}
            <div className="relative flex-1 overflow-auto bg-white">
              <Watermark watermark={data.watermark} />

              {/* Excel Table */}
              {activeSheet && (
                <div className="relative z-0">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr>
                        {activeSheet.columns.map((col) => (
                          <th
                            key={col.index}
                            className="border border-gray-300..."
                          >
                            {col.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <ExcelCell key={cellIndex} cell={cell} />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {activeSheet && activeSheet.rowCount > 0 && (
              <ExcelPagination
                currentPage={currentPage}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                totalRows={activeSheet.rowCount}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Checklist:**

- [x] Loading spinner centered with "Đang tải dữ liệu..." text
- [x] Error state with centered icon and retry button
- [x] Multi-sheet tabs component integrated
- [x] Client-side pagination (50/100 rows)
- [x] ExcelPagination component with navigation
- [x] Table renders with proper styling
- [x] Cell styling applied (ExcelCell component)
- [x] Watermark displayed as overlay
- [x] data-testid added for testing
- [x] All states tested
- [x] Style matches PDF/Image modal exactly

```typescript
import { useState } from "react";
import { useExcelPreview } from "@/hooks/queries/useExcelPreview";
import PreviewHeader from "./PreviewHeader";
import ExcelSheetTabs from "./ExcelSheetTabs";
import ExcelCell from "./ExcelCell";
import Watermark from "./Watermark";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ExcelPreviewProps {
  fileId: string;
  fileName?: string;
  onClose?: () => void;
}

export default function ExcelPreview({
  fileId,
  fileName = "spreadsheet.xlsx",
  onClose = () => {},
}: ExcelPreviewProps) {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const { data, isLoading, isError, error, refetch } = useExcelPreview(fileId, {
    includeStyles: true,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full" data-testid="excel-preview-loading">
        <PreviewHeader fileName={fileName} fileType="excel" onClose={onClose} />
        <div className="p-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !data || !data.sheets || data.sheets.length === 0) {
    return (
      <div className="flex flex-col h-full" data-testid="excel-preview-error">
        <PreviewHeader fileName={fileName} fileType="excel" onClose={onClose} />
        <div className="flex-1 flex items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>
              <div className="space-y-4">
                <p>Không thể tải file preview. {error?.message}</p>
                <div className="flex gap-2">
                  <Button onClick={() => refetch()} size="sm">
                    🔄 Thử lại
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!activeSheet) {
    return null;
  }

  return (
    <div className="flex flex-col h-full" data-testid="excel-preview-content">
      <PreviewHeader
        fileName={data.fileName || fileName}
        fileType="excel"
        onClose={onClose}
      />

      {data.sheets.length > 1 && (
        <ExcelSheetTabs
          sheets={data.sheets}
          activeSheetIndex={activeSheetIndex}
          onSheetChange={handleSheetChange}
        />
      )}

      <div className="flex-1 overflow-auto p-4 relative">
        {/* Watermark overlay */}
        <Watermark watermark={data.watermark} />

        {/* Content */}
        <div className="overflow-x-auto relative z-20">
          <table className="border-collapse" data-testid="excel-table">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-center text-gray-600 w-12">
                  {/* Row numbers header */}
                </th>
                {activeSheet.columns?.map((col) => (
                  <th
                    key={col.index}
                    className="border border-gray-300 bg-gray-50 px-3 py-2 text-center text-gray-600"
                    data-testid={`excel-column-header-${col.index}`}
                  >
                    {col.letter}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, rowIndex) => {
                const actualRowNumber = startRow + rowIndex + 1;
                return (
                  <tr key={actualRowNumber}>
                    <td className="border border-gray-300 bg-gray-50 px-3 py-2 text-center text-gray-600">
                      {actualRowNumber}
                    </td>
                    {row.map((cell, colIndex) => (
                      <ExcelCell
                        key={colIndex}
                        cell={cell}
                        rowIndex={actualRowNumber - 1}
                        colIndex={colIndex}
                      />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ExcelPagination
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          startRow={startRow + 1}
          endRow={endRow}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />

        {activeSheet.isTruncated && (
          <div
            className="mt-4 text-sm text-gray-600"
            data-testid="excel-truncation-message"
          >
            ⚠️ File quá lớn, chỉ hiển thị {activeSheet.rowCount} dòng đầu tiên.
            {activeSheet.truncationReason &&
              ` (Lý do: ${activeSheet.truncationReason})`}
          </div>
        )}

        {/* Watermark overlay */}
        <Watermark watermark={data.watermark} />
      </div>
    </div>
  );
}
```

**Checklist:**

- [ ] Sheet tabs functional
- [ ] Table renders correctly
- [ ] Cell styles applied
- [ ] Truncation message shown
- [ ] Watermark displayed
- [ ] data-testid added
- [ ] Test all states

---

### Task 3.7: Export Barrel

**File:** `src/components/file-preview/index.ts`

```typescript
export { default as WordPreview } from "./WordPreview";
export { default as ExcelPreview } from "./ExcelPreview";
export { default as ExcelSheetTabs } from "./ExcelSheetTabs";
export { default as ExcelCell } from "./ExcelCell";
export { default as PreviewHeader } from "./PreviewHeader";
export { default as Watermark } from "./Watermark";
```

**Checklist:**

- [ ] All components exported
- [ ] Imports work correctly

---

## 🔧 PHASE 4: Integration

### Task 4.1: Update FilePreviewSheet

**File:** `src/features/portal/components/file-sheet/FilePreviewSheet.tsx`

```typescript
import { WordPreview, ExcelPreview } from "@/components/file-preview";

// Add to existing file routing logic
function FilePreviewSheet({ file }: FilePreviewSheetProps) {
  const fileExtension = file.fileName.split(".").pop()?.toLowerCase();

  // ... existing code ...

  // Add Word preview
  if (fileExtension === "docx") {
    return (
      <WordPreview
        fileId={file.id}
        fileName={file.fileName}
        onClose={handleClose}
        onDownload={handleDownload}
      />
    );
  }

  // Add Excel preview
  if (fileExtension === "xlsx" || fileExtension === "xls") {
    return (
      <ExcelPreview
        fileId={file.id}
        fileName={file.fileName}
        onClose={handleClose}
        onDownload={handleDownload}
      />
    );
  }

  // Fallback to generic preview for other types
  return <GenericFilePreview file={file} />;
}
```

**Checklist:**

- [ ] File extension detection works
- [ ] Word files route to WordPreview
- [ ] Excel files route to ExcelPreview
- [ ] Other files use generic preview
- [ ] Test with different file types

---

## 🧪 PHASE 5: Testing

### Test Coverage Requirements

Đã được định nghĩa chi tiết trong `06_testing.md`.

**Summary:**

- [ ] API client tests (4 cases each)
- [ ] Hook tests (5 cases each)
- [ ] Component tests (4-6 cases each)
- [ ] Integration test (E2E optional)

---

## 📊 IMPACT SUMMARY

### Dependencies thêm mới:

- (Không có - sử dụng existing dependencies)

### Breaking Changes:

- (Không có)

### Performance Impact:

- Preview Word/Excel có thể tốn thời gian với large files
- Cân nhắc lazy loading cho images trong Word
- Excel tables có thể lag với > 500 rows

---

## ⏳ PENDING DECISIONS

| #   | Question                         | Options                   | HUMAN Decision        |
| --- | -------------------------------- | ------------------------- | --------------------- |
| 1   | Word max content length default? | 500000 chars (default)?   | ⬜ \***\*\_\_\_\*\*** |
| 2   | Excel includeStyles default?     | true (default)?           | ⬜ \***\*\_\_\_\*\*** |
| 3   | Có cần cache preview data?       | Yes with staleTime 5 min? | ⬜ \***\*\_\_\_\*\*** |
| 4   | Error retry count?               | 1 (default)?              | ⬜ \***\*\_\_\_\*\*** |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                         | Status       |
| -------------------------------- | ------------ |
| Đã review file structure         | ✅ Đã review |
| Đã review implementation phases  | ✅ Đã review |
| Đã review code examples          | ✅ Đã review |
| Đã điền Pending Decisions        | ✅ Đã điền   |
| **APPROVED implementation plan** | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-12

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code nếu implementation plan chưa approved**

---

## 📖 Related Documents

- [00_README.md](./00_README.md) - Phase 5 Overview
- [01_requirements.md](./01_requirements.md) - Requirements
- [02a_wireframe.md](./02a_wireframe.md) - Wireframes
- [03_api-contract.md](./03_api-contract.md) - API Contracts
- Next: [06_testing.md](./06_testing.md) - Test Requirements

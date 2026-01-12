# [BƯỚC 6] Testing Requirements - Word & Excel Preview

> **Module:** Chat  
> **Feature:** Conversation Details Phase 5 - Word & Excel Preview  
> **Document Type:** Test Requirements & Coverage Matrix  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-12

---

## 📊 Test Coverage Matrix

### Implementation → Test Mapping

| Implementation File    | Test File                             | Test Cases | Priority |
| ---------------------- | ------------------------------------- | ---------- | -------- |
| `src/api/file.api.ts`  | `src/api/__tests__/file.api.test.ts`  | 8          | MUST     |
| `useWordPreview.ts`    | `__tests__/useWordPreview.test.ts`    | 5          | MUST     |
| `useExcelPreview.ts`   | `__tests__/useExcelPreview.test.ts`   | 5          | MUST     |
| `WordPreview.tsx`      | `__tests__/WordPreview.test.tsx`      | 6          | MUST     |
| `ExcelPreview.tsx`     | `__tests__/ExcelPreview.test.tsx`     | 8          | MUST     |
| `ExcelPagination.tsx`  | `__tests__/ExcelPagination.test.tsx`  | 6          | MUST     |
| `ExcelCell.tsx`        | `__tests__/ExcelCell.test.tsx`        | 4          | SHOULD   |
| `ExcelSheetTabs.tsx`   | `__tests__/ExcelSheetTabs.test.tsx`   | 4          | SHOULD   |
| `PreviewHeader.tsx`    | `__tests__/PreviewHeader.test.tsx`    | 2          | SHOULD   |
| `Watermark.tsx`        | `__tests__/Watermark.test.tsx`        | 5          | SHOULD   |
| `FilePreviewSheet.tsx` | `__tests__/FilePreviewSheet.test.tsx` | 3          | MUST     |

**Total Test Cases:** 53

---

## 🧪 API Client Tests

### File: `src/api/__tests__/file.api.test.ts`

#### Test Suite: `previewWordFile()`

| #   | Test Case                        | Description                      | Mock Data                            | Assertions                          |
| --- | -------------------------------- | -------------------------------- | ------------------------------------ | ----------------------------------- |
| 1   | Success - Returns WordPreviewDto | Call API với valid fileId        | Mock 200 response với WordPreviewDto | Response matches expected structure |
| 2   | Error 404 - File not found       | Call API với non-existent fileId | Mock 404 error                       | Throws AxiosError with status 404   |
| 3   | Error 415 - Unsupported format   | Call API với .doc file           | Mock 415 error                       | Throws AxiosError with status 415   |
| 4   | Network error - Axios throws     | Simulate network failure         | Mock network error                   | Throws AxiosError                   |

**Test Example:**

```typescript
import { describe, it, expect, vi } from "vitest";
import { previewWordFile } from "@/api/file.api";
import apiClient from "@/api/client";

vi.mock("@/api/client");

describe("previewWordFile", () => {
  it("should return WordPreviewDto on success", async () => {
    const mockData = {
      fileId: "123",
      fileName: "test.docx",
      metadata: { hasImages: true, imageCount: 2 },
      htmlContent: "<h1>Test</h1>",
      cssStyles: "h1 { color: red; }",
      watermark: {
        userIdentifier: "test@example.com",
        timestamp: "2026-01-12",
        text: "Test",
      },
    };

    vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

    const result = await previewWordFile("123");

    expect(result).toEqual(mockData);
    expect(apiClient.get).toHaveBeenCalledWith("/api/Files/123/preview/word");
  });

  it("should throw on 404 error", async () => {
    vi.mocked(apiClient.get).mockRejectedValue({
      response: { status: 404, data: { detail: "File not found" } },
    });

    await expect(previewWordFile("999")).rejects.toThrow();
  });
});
```

#### Test Suite: `previewExcelFile()`

| #   | Test Case                                 | Description                  | Mock Data                             | Assertions                              |
| --- | ----------------------------------------- | ---------------------------- | ------------------------------------- | --------------------------------------- |
| 1   | Success - Returns ExcelPreviewDto         | Call API với valid fileId    | Mock 200 response với ExcelPreviewDto | Response matches expected structure     |
| 2   | Success with options - includeStyles=true | Call với options             | Mock response với styles              | Query params include includeStyles=true |
| 3   | Error 404 - File not found                | Call với non-existent fileId | Mock 404 error                        | Throws AxiosError                       |
| 4   | Error 415 - Not Excel file                | Call với PDF file ID         | Mock 415 error                        | Throws AxiosError                       |

---

## 🪝 React Query Hook Tests

### File: `src/hooks/queries/__tests__/useWordPreview.test.ts`

| #   | Test Case               | Description                  | Setup                  | Assertions                         |
| --- | ----------------------- | ---------------------------- | ---------------------- | ---------------------------------- |
| 1   | Loading state initially | Mount hook                   | Query in loading state | isLoading = true, data = undefined |
| 2   | Success - Returns data  | Mock successful API response | Wait for query         | isSuccess = true, data exists      |
| 3   | Error - Returns error   | Mock API error               | Wait for error         | isError = true, error exists       |
| 4   | Query key generation    | Different fileIds            | Check query keys       | Keys differ for different fileIds  |
| 5   | Refetch capability      | Call refetch                 | Check API called again | API called twice                   |

**Test Example:**

```typescript
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useWordPreview } from "@/hooks/queries/useWordPreview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { previewWordFile } from "@/api/file.api";

vi.mock("@/api/file.api");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useWordPreview", () => {
  it("should be loading initially", () => {
    vi.mocked(previewWordFile).mockResolvedValue({} as any);

    const { result } = renderHook(() => useWordPreview("123"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should return data on success", async () => {
    const mockData = { fileId: "123", fileName: "test.docx" };
    vi.mocked(previewWordFile).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useWordPreview("123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
  });
});
```

### File: `src/hooks/queries/__tests__/useExcelPreview.test.ts`

| #   | Test Case                | Description               | Setup            | Assertions                        |
| --- | ------------------------ | ------------------------- | ---------------- | --------------------------------- |
| 1   | Loading state            | Mount hook                | Query in loading | isLoading = true                  |
| 2   | Success - Returns sheets | Mock response with sheets | Wait for success | data.sheets exists                |
| 3   | Error handling           | Mock API error            | Wait for error   | isError = true                    |
| 4   | Query key with options   | Different options         | Check keys       | Keys differ for different options |
| 5   | Refetch                  | Call refetch              | API called again | Call count increases              |

---

## 🎨 Component Tests

### File: `src/components/file-preview/__tests__/WordPreview.test.tsx`

| #   | Test Case                       | Description              | Setup           | Assertions                                              |
| --- | ------------------------------- | ------------------------ | --------------- | ------------------------------------------------------- |
| 1   | Renders loading skeleton        | Mock loading state       | Mount component | Skeleton visible, data-testid="word-preview-loading"    |
| 2   | Renders HTML content on success | Mock successful data     | Wait for render | HTML content rendered, data-testid="word-preview-html"  |
| 3   | Shows error message on error    | Mock API error           | Mount component | Error message visible, data-testid="word-preview-error" |
| 4   | Shows watermark                 | Mock data with watermark | Check watermark | Watermark text visible                                  |
| 5   | Retry button works              | Mock error state         | Click retry     | refetch function called                                 |
| 6   | Close button works              | Mount component          | Click close     | onClose called                                          |

**Test Example:**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WordPreview from "@/components/file-preview/WordPreview";
import { useWordPreview } from "@/hooks/queries/useWordPreview";

vi.mock("@/hooks/queries/useWordPreview");

describe("WordPreview", () => {
  it("renders loading skeleton", () => {
    vi.mocked(useWordPreview).mockReturnValue({
      isLoading: true,
      data: undefined,
      isError: false,
    } as any);

    render(<WordPreview fileId="123" />);

    expect(screen.getByTestId("word-preview-loading")).toBeInTheDocument();
  });

  it("renders HTML content on success", async () => {
    const mockData = {
      fileId: "123",
      fileName: "test.docx",
      htmlContent: "<h1>Test Content</h1>",
      cssStyles: "",
      watermark: { text: "Test Watermark" },
    };

    vi.mocked(useWordPreview).mockReturnValue({
      isLoading: false,
      data: mockData,
      isError: false,
      isSuccess: true,
    } as any);

    render(<WordPreview fileId="123" />);

    await waitFor(() => {
      expect(screen.getByTestId("word-preview-html")).toBeInTheDocument();
    });

    expect(screen.getByText(/Test Content/i)).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    vi.mocked(useWordPreview).mockReturnValue({
      isLoading: false,
      data: { htmlContent: "<p>Test</p>", watermark: { text: "" } },
      isError: false,
    } as any);

    render(<WordPreview fileId="123" onClose={onClose} />);

    const closeButton = screen.getByTestId("file-preview-close-button");
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
```

### File: `src/components/file-preview/__tests__/ExcelPreview.test.tsx`

| #   | Test Case                         | Description                    | Setup           | Assertions                              |
| --- | --------------------------------- | ------------------------------ | --------------- | --------------------------------------- |
| 1   | Renders loading skeleton          | Mock loading state             | Mount component | Skeleton visible                        |
| 2   | Renders table with paginated rows | Mock data with 150 rows        | Wait for render | Table rendered with 50 rows (page 1)    |
| 3   | Shows error message               | Mock error                     | Mount           | Error message visible                   |
| 4   | Sheet tabs work                   | Mock data with multiple sheets | Click tab       | Active sheet changes, pagination resets |
| 5   | Shows watermark                   | Mock data                      | Check watermark | Watermark visible                       |
| 6   | Pagination controls visible       | Mock data with 150 rows        | Check UI        | Pagination component rendered           |
| 7   | Correct row numbers displayed     | Page 2 with 50 rows/page       | Check table     | Row numbers show 51-100                 |
| 8   | Truncation message shown          | Mock truncated sheet           | Check message   | "File quá lớn" message visible          |

### File: `src/components/file-preview/__tests__/ExcelPagination.test.tsx`

| #   | Test Case                          | Description                    | Setup                      | Assertions                                  |
| --- | ---------------------------------- | ------------------------------ | -------------------------- | ------------------------------------------- |
| 1   | Renders pagination info            | totalRows=500, page=1, size=50 | Render                     | "Dòng 1-50 / 500" visible                   |
| 2   | Rows per page selector works       | Change from 50 to 100          | Click dropdown, select 100 | onRowsPerPageChange(100) called             |
| 3   | Next button goes to next page      | currentPage=1, totalPages=10   | Click "Sau"                | onPageChange(2) called                      |
| 4   | Prev button disabled on first page | currentPage=1                  | Check button state         | "Trước" button disabled                     |
| 5   | Next button disabled on last page  | currentPage=10, totalPages=10  | Check button state         | "Sau" button disabled                       |
| 6   | First/Last buttons work            | currentPage=5                  | Click "Đầu" and "Cuối"     | onPageChange(1) and onPageChange(10) called |

### File: `src/components/file-preview/__tests__/ExcelCell.test.tsx`

| #   | Test Case                      | Description                      | Setup        | Assertions                                 |
| --- | ------------------------------ | -------------------------------- | ------------ | ------------------------------------------ |
| 1   | Renders text cell              | Cell with string value           | Render cell  | Text visible                               |
| 2   | Renders number with formatting | Cell with number, formattedValue | Render       | Formatted value shown (e.g., "$12,500.50") |
| 3   | Applies bold style             | Cell with style.bold=true        | Check styles | fontWeight = 'bold'                        |
| 4   | Applies background color       | Cell with backgroundColor        | Check styles | backgroundColor applied                    |

### File: `src/components/file-preview/__tests__/ExcelSheetTabs.test.tsx`

| #   | Test Case                     | Description                | Setup          | Assertions              |
| --- | ----------------------------- | -------------------------- | -------------- | ----------------------- |
| 1   | Renders all sheet tabs        | Sheets array with 3 sheets | Render tabs    | 3 tabs visible          |
| 2   | Highlights active tab         | activeSheetIndex=1         | Check styles   | Tab 1 has active class  |
| 3   | Tab click calls onSheetChange | Click tab 2                | Check callback | onSheetChange(2) called |
| 4   | Shows sheet names             | Sheets with names          | Check text     | Sheet names visible     |

### File: `src/components/file-preview/__tests__/PreviewHeader.test.tsx`

| #   | Test Case                  | Description                       | Setup          | Assertions                         |
| --- | -------------------------- | --------------------------------- | -------------- | ---------------------------------- |
| 1   | Renders file name and type | fileName="test.docx", type="word" | Render         | "test.docx - Word Preview" visible |
| 2   | Close button calls onClose | Click close                       | Check callback | onClose called                     |

### File: `src/components/file-preview/__tests__/Watermark.test.tsx`

| #   | Test Case                                 | Description                                 | Setup     | Assertions                                                  |
| --- | ----------------------------------------- | ------------------------------------------- | --------- | ----------------------------------------------------------- |
| 1   | Returns watermark background style object | watermark with userIdentifier               | Call hook | Returns object with backgroundImage, backgroundRepeat, etc. |
| 2   | Generates SVG pattern with correct text   | watermark.userIdentifier="user@example.com" | Call hook | SVG contains "user@example.com", NO timestamp               |
| 3   | Uses font-weight 400 (normal font)        | Check SVG content                           | Call hook | SVG text has font-weight="400"                              |
| 4   | Text rotated -30 degrees                  | Check SVG transform                         | Call hook | SVG has transform="rotate(-30 150 100)"                     |
| 5   | Pattern size is 300x200px                 | Check backgroundSize                        | Call hook | backgroundSize="300px 200px" (~4 watermarks/row)            |

---

## 🔗 Integration Tests

### File: `src/features/portal/components/file-sheet/__tests__/FilePreviewSheet.test.tsx`

| #   | Test Case                             | Description                     | Setup | Assertions                      |
| --- | ------------------------------------- | ------------------------------- | ----- | ------------------------------- |
| 1   | Routes .docx to WordPreview           | file with fileName="test.docx"  | Mount | WordPreview component rendered  |
| 2   | Routes .xlsx to ExcelPreview          | file with fileName="sheet.xlsx" | Mount | ExcelPreview component rendered |
| 3   | Routes other files to generic preview | file with fileName="image.png"  | Mount | GenericFilePreview rendered     |

---

## 📋 Test Data & Mocks

### Mock Word Preview Data

```typescript
export const mockWordPreviewData: WordPreviewDto = {
  fileId: "550e8400-e29b-41d4-a716-446655440000",
  fileName: "report.docx",
  metadata: {
    fileSize: 524288,
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    hasImages: true,
    imageCount: 2,
    hasTables: true,
    isTruncated: false,
    truncationReason: null,
    warnings: [],
  },
  htmlContent:
    "<h1>Test Report</h1><p>This is a <strong>test</strong> document.</p>",
  cssStyles: "h1 { font-size: 24px; }",
  watermark: {
    userIdentifier: "test@example.com",
    timestamp: "2026-01-12T10:30:00Z",
    text: "test@example.com - 12/01/2026 10:30:00",
  },
};
```

### Mock Excel Preview Data

```typescript
export const mockExcelPreviewData: ExcelPreviewDto = {
  fileId: "550e8400-e29b-41d4-a716-446655440001",
  fileName: "sales.xlsx",
  metadata: {
    totalSheets: 2,
    totalRows: 100,
    totalCells: 500,
    isTruncated: false,
    truncationReason: null,
    fileSize: 1048576,
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  sheets: [
    {
      name: "Sales Data",
      index: 0,
      rowCount: 5,
      columnCount: 3,
      mergedCells: [],
      columns: [
        { index: 0, letter: "A", width: 15 },
        { index: 1, letter: "B", width: 20 },
        { index: 2, letter: "C", width: 15 },
      ],
      rows: [
        [
          {
            value: "Product",
            type: "string",
            formattedValue: "Product",
            style: { bold: true },
          },
          {
            value: "Sales",
            type: "string",
            formattedValue: "Sales",
            style: { bold: true },
          },
          {
            value: "Date",
            type: "string",
            formattedValue: "Date",
            style: { bold: true },
          },
        ],
        [
          {
            value: "Widget A",
            type: "string",
            formattedValue: "Widget A",
            style: null,
          },
          {
            value: 12500.5,
            type: "number",
            formattedValue: "$12,500.50",
            style: null,
          },
          {
            value: "2026-01-12",
            type: "date",
            formattedValue: "12/01/2026",
            style: null,
          },
        ],
      ],
      isTruncated: false,
    },
  ],
  watermark: {
    userIdentifier: "test@example.com",
    timestamp: "2026-01-12T10:30:00Z",
    text: "test@example.com - 12/01/2026 10:30:00",
  },
};
```

---

## 🎯 Test Generation Checklist

### Before Starting Tests

- [ ] All API contracts approved
- [ ] All API snapshots captured
- [ ] Implementation plan approved
- [ ] Mock data prepared

### During Test Development

- [ ] Write API client tests first (TDD approach)
- [ ] Write hook tests before implementing hooks
- [ ] Write component tests after components
- [ ] Use `data-testid` for all test selectors
- [ ] Mock external dependencies (API, hooks)
- [ ] Test all states (loading, success, error)

### After Test Implementation

- [ ] All tests passing (`npm run test`)
- [ ] Coverage > 80% for new files
- [ ] No console errors/warnings
- [ ] Tests run in < 10 seconds
- [ ] CI/CD integration works

---

## 📊 Coverage Goals

| Type        | Target Coverage | Files Count | Priority |
| ----------- | --------------- | ----------- | -------- |
| API Clients | 100%            | 1           | MUST     |
| Hooks       | 100%            | 2           | MUST     |
| Components  | 85%             | 6           | MUST     |
| Integration | 70%             | 1           | SHOULD   |
| **Overall** | **80%+**        | **10**      | **MUST** |

---

## ⏳ PENDING DECISIONS

| #   | Question                           | Options     | HUMAN Decision        |
| --- | ---------------------------------- | ----------- | --------------------- |
| 1   | Có cần E2E tests (Playwright)?     | Yes/No      | ⬜ \***\*\_\_\_\*\*** |
| 2   | Mock API responses hay use MSW?    | vi.mock/MSW | ⬜ \***\*\_\_\_\*\*** |
| 3   | Snapshot testing cho HTML content? | Yes/No      | ⬜ \***\*\_\_\_\*\*** |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                       | Status       |
| ------------------------------ | ------------ |
| Đã review test coverage matrix | ✅ Đã review |
| Đã review test cases           | ✅ Đã review |
| Đã review mock data            | ✅ Đã review |
| Đã điền Pending Decisions      | ✅ Đã điền   |
| **APPROVED test requirements** | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-12

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code nếu test requirements chưa approved**

---

## 📖 Related Documents

- [00_README.md](./00_README.md) - Phase 5 Overview
- [01_requirements.md](./01_requirements.md) - Requirements
- [02a_wireframe.md](./02a_wireframe.md) - Wireframes
- [03_api-contract.md](./03_api-contract.md) - API Contracts
- [04_implementation-plan.md](./04_implementation-plan.md) - Implementation Plan
- [Testing Strategy Guide](../../../../guides/testing_strategy_20251226_claude_opus_4_5.md)

# [BƯỚC 6] Testing Requirements - File Upload UI

> **Feature:** Upload File & Image trong Chat  
> **Version:** 1.0.0  
> **Status:** ✅ APPROVED  
> **Created:** 2026-01-06  
> **Approved:** 2026-01-06

---

## 📋 Test Coverage Matrix

| Implementation File                                    | Test File                                                      | Test Type   | Test Cases | Priority |
| ------------------------------------------------------ | -------------------------------------------------------------- | ----------- | ---------- | -------- |
| `src/utils/fileHelpers.ts`                             | `src/utils/__tests__/fileHelpers.test.ts`                      | Unit        | 9          | HIGH     |
| `src/utils/fileValidation.ts`                          | `src/utils/__tests__/fileValidation.test.ts`                   | Unit        | 5          | HIGH     |
| `src/hooks/useFileValidation.ts`                       | `src/hooks/__tests__/useFileValidation.test.tsx`               | Unit        | 5          | HIGH     |
| `src/components/FilePreview.tsx`                       | `src/components/__tests__/FilePreview.test.tsx`                | Unit        | 6          | HIGH     |
| `src/features/portal/components/ChatMainContainer.tsx` | `tests/chat/file-upload/integration/file-upload-flow.test.tsx` | Integration | 8          | MEDIUM   |
| File Upload E2E                                        | `tests/chat/file-upload/e2e/file-upload.spec.ts`               | E2E         | 6          | LOW      |

**Total Test Cases:** 39  
**Estimated Time:** 3-4 hours

---

## 🧪 Detailed Test Cases

### 1. fileHelpers.test.ts (9 test cases)

**File:** `src/utils/__tests__/fileHelpers.test.ts`  
**Functions to test:** 9 functions

#### Test Cases:

```typescript
describe("formatFileSize", () => {
  test("formats 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
  });

  test("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 Bytes");
  });

  test("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
  });

  test("formats megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1 MB");
  });

  test("formats with decimals", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });
});

describe("getFileIcon", () => {
  test("returns PDF icon for PDF", () => {
    expect(getFileIcon("application/pdf")).toBe("📄");
  });

  test("returns Excel icon for XLSX", () => {
    expect(
      getFileIcon(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ).toBe("📊");
  });

  test("returns Word icon for DOCX", () => {
    expect(
      getFileIcon(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe("📝");
  });

  test("returns Image icon for JPEG", () => {
    expect(getFileIcon("image/jpeg")).toBe("🖼️");
  });

  test("returns default icon for unknown type", () => {
    expect(getFileIcon("application/unknown")).toBe("📎");
  });
});

describe("truncateFileName", () => {
  test("does not truncate short names", () => {
    expect(truncateFileName("file.pdf")).toBe("file.pdf");
  });

  test("truncates long names", () => {
    const longName = "very-long-file-name-that-exceeds-forty-characters.pdf";
    const result = truncateFileName(longName, 40);
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result).toContain("...");
    expect(result).toContain(".pdf");
  });

  test("preserves extension", () => {
    const longName = "a".repeat(50) + ".xlsx";
    const result = truncateFileName(longName);
    expect(result).toContain(".xlsx");
  });
});

describe("generateFileId", () => {
  test("generates unique IDs", () => {
    const id1 = generateFileId();
    const id2 = generateFileId();
    expect(id1).not.toBe(id2);
  });

  test('starts with "file-" prefix', () => {
    const id = generateFileId();
    expect(id).toMatch(/^file-/);
  });
});

describe("isImage", () => {
  test("returns true for image MIME types", () => {
    expect(isImage("image/jpeg")).toBe(true);
    expect(isImage("image/png")).toBe(true);
  });

  test("returns false for non-image types", () => {
    expect(isImage("application/pdf")).toBe(false);
  });
});

describe("createFilePreview", () => {
  test("creates preview URL for images", () => {
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const url = createFilePreview(file);
    expect(url).toBeDefined();
    expect(typeof url).toBe("string");
  });

  test("returns undefined for non-images", () => {
    const file = new File([""], "test.pdf", { type: "application/pdf" });
    const url = createFilePreview(file);
    expect(url).toBeUndefined();
  });
});

describe("fileToSelectedFile", () => {
  test("converts File to SelectedFile", () => {
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const selected = fileToSelectedFile(file);

    expect(selected).toHaveProperty("file", file);
    expect(selected).toHaveProperty("id");
    expect(selected.id).toMatch(/^file-/);
    expect(selected).toHaveProperty("preview");
  });

  test("includes preview for images", () => {
    const file = new File([""], "test.png", { type: "image/png" });
    const selected = fileToSelectedFile(file);
    expect(selected.preview).toBeDefined();
  });

  test("no preview for non-images", () => {
    const file = new File([""], "test.pdf", { type: "application/pdf" });
    const selected = fileToSelectedFile(file);
    expect(selected.preview).toBeUndefined();
  });
});
```

**Coverage:** All 9 functions, edge cases included

---

### 2. fileValidation.test.ts (5 test cases)

**File:** `src/utils/__tests__/fileValidation.test.ts`  
**Functions to test:** 5 functions

#### Test Cases:

```typescript
describe("validateFileSize", () => {
  test("accepts file within size limit", () => {
    const file = new File(["a".repeat(1000)], "small.txt", {
      type: "text/plain",
    });
    const result = validateFileSize(file, 10 * 1024 * 1024);
    expect(result.isValid).toBe(true);
  });

  test("rejects file exceeding size limit", () => {
    const file = new File(["a".repeat(11 * 1024 * 1024)], "large.txt", {
      type: "text/plain",
    });
    const result = validateFileSize(file, 10 * 1024 * 1024);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("vượt quá kích thước");
  });
});

describe("validateFileType", () => {
  test("accepts allowed file type", () => {
    const file = new File([""], "test.pdf", { type: "application/pdf" });
    const result = validateFileType(file, ["application/pdf"]);
    expect(result.isValid).toBe(true);
  });

  test("rejects disallowed file type", () => {
    const file = new File([""], "test.exe", {
      type: "application/x-msdownload",
    });
    const result = validateFileType(file, ["application/pdf", "image/jpeg"]);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("không được hỗ trợ");
  });
});

describe("validateFileCount", () => {
  test("accepts count within limit", () => {
    const result = validateFileCount(2, 2, 5);
    expect(result.isValid).toBe(true);
  });

  test("rejects count exceeding limit", () => {
    const result = validateFileCount(3, 3, 5);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("tối đa 5 file");
  });

  test("rejects exactly at limit + 1", () => {
    const result = validateFileCount(5, 1, 5);
    expect(result.isValid).toBe(false);
  });
});

describe("validateFile", () => {
  const rules = {
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
    allowedTypes: ["application/pdf", "image/jpeg"],
  };

  test("validates file with all rules passing", () => {
    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const result = validateFile(file, rules);
    expect(result.isValid).toBe(true);
  });

  test("fails on size rule", () => {
    const largeContent = "a".repeat(11 * 1024 * 1024);
    const file = new File([largeContent], "large.pdf", {
      type: "application/pdf",
    });
    const result = validateFile(file, rules);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("vượt quá kích thước");
  });

  test("fails on type rule", () => {
    const file = new File(["test"], "test.txt", { type: "text/plain" });
    const result = validateFile(file, rules);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("không được hỗ trợ");
  });
});

describe("validateFiles", () => {
  const rules = {
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
    allowedTypes: ["application/pdf", "image/jpeg"],
  };

  test("validates multiple valid files", () => {
    const files = [
      new File([""], "test1.pdf", { type: "application/pdf" }),
      new File([""], "test2.jpg", { type: "image/jpeg" }),
    ];
    const result = validateFiles(files, 0, rules);
    expect(result.validFiles).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  test("filters out invalid files", () => {
    const files = [
      new File([""], "valid.pdf", { type: "application/pdf" }),
      new File([""], "invalid.txt", { type: "text/plain" }),
    ];
    const result = validateFiles(files, 0, rules);
    expect(result.validFiles).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });

  test("checks total count including current files", () => {
    const files = [
      new File([""], "test1.pdf", { type: "application/pdf" }),
      new File([""], "test2.pdf", { type: "application/pdf" }),
    ];
    const result = validateFiles(files, 4, rules); // 4 + 2 = 6 > 5
    expect(result.validFiles).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("tối đa 5 file");
  });
});
```

**Coverage:** All 5 functions, happy path + error cases

---

### 3. useFileValidation.test.tsx (5 test cases)

**File:** `src/hooks/__tests__/useFileValidation.test.tsx`  
**Hook to test:** `useFileValidation`

#### Test Cases:

```typescript
import { renderHook, act } from "@testing-library/react";
import { toast } from "sonner";
import { useFileValidation } from "../useFileValidation";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("useFileValidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("validates and adds valid files", () => {
    const { result } = renderHook(() => useFileValidation());

    const files = [new File([""], "test.pdf", { type: "application/pdf" })];

    let selectedFiles;
    act(() => {
      selectedFiles = result.current.validateAndAdd(files, 0);
    });

    expect(selectedFiles).toHaveLength(1);
    expect(selectedFiles[0]).toHaveProperty("file");
    expect(selectedFiles[0]).toHaveProperty("id");
    expect(toast.success).toHaveBeenCalledWith("Đã thêm 1 file");
  });

  test("shows error toast for invalid files", () => {
    const { result } = renderHook(() => useFileValidation());

    const files = [
      new File([""], "test.exe", { type: "application/x-msdownload" }),
    ];

    act(() => {
      result.current.validateAndAdd(files, 0);
    });

    expect(toast.error).toHaveBeenCalled();
  });

  test("respects custom validation rules", () => {
    const customRules = {
      maxSize: 1024, // 1KB only
      maxFiles: 2,
      allowedTypes: ["application/pdf"],
    };

    const { result } = renderHook(() =>
      useFileValidation({ rules: customRules })
    );

    const largeFile = new File(["a".repeat(2000)], "large.pdf", {
      type: "application/pdf",
    });

    act(() => {
      result.current.validateAndAdd([largeFile], 0);
    });

    expect(toast.error).toHaveBeenCalled();
  });

  test("calls onValidFiles callback when files are valid", () => {
    const onValidFiles = vi.fn();
    const { result } = renderHook(() => useFileValidation({ onValidFiles }));

    const files = [new File([""], "test.pdf", { type: "application/pdf" })];

    act(() => {
      result.current.validateAndAdd(files, 0);
    });

    expect(onValidFiles).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          file: files[0],
          id: expect.any(String),
        }),
      ])
    );
  });

  test("handles multiple files correctly", () => {
    const { result } = renderHook(() => useFileValidation());

    const files = [
      new File([""], "test1.pdf", { type: "application/pdf" }),
      new File([""], "test2.jpg", { type: "image/jpeg" }),
      new File([""], "test3.png", { type: "image/png" }),
    ];

    let selectedFiles;
    act(() => {
      selectedFiles = result.current.validateAndAdd(files, 0);
    });

    expect(selectedFiles).toHaveLength(3);
    expect(toast.success).toHaveBeenCalledWith("Đã thêm 3 files");
  });
});
```

**Coverage:** Hook behavior, toast notifications, custom rules, callbacks

---

### 4. FilePreview.test.tsx (6 test cases)

**File:** `src/components/__tests__/FilePreview.test.tsx`  
**Component to test:** `FilePreview`

#### Test Cases:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import FilePreview from "../FilePreview";
import type { SelectedFile } from "@/types/files";

describe("FilePreview", () => {
  const mockFiles: SelectedFile[] = [
    {
      id: "file-1",
      file: new File([""], "document.pdf", { type: "application/pdf" }),
    },
    {
      id: "file-2",
      file: new File([""], "spreadsheet.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    },
  ];

  test("renders nothing when no files", () => {
    const { container } = render(<FilePreview files={[]} onRemove={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders file list when files exist", () => {
    render(<FilePreview files={mockFiles} onRemove={vi.fn()} />);

    expect(screen.getByTestId("file-preview-container")).toBeInTheDocument();
    expect(screen.getByTestId("file-preview-item-file-1")).toBeInTheDocument();
    expect(screen.getByTestId("file-preview-item-file-2")).toBeInTheDocument();
  });

  test("displays correct file information", () => {
    render(<FilePreview files={mockFiles} onRemove={vi.fn()} />);

    expect(screen.getByText("document.pdf")).toBeInTheDocument();
    expect(screen.getByText("spreadsheet.xlsx")).toBeInTheDocument();
  });

  test("calls onRemove when remove button clicked", () => {
    const onRemove = vi.fn();
    render(<FilePreview files={mockFiles} onRemove={onRemove} />);

    const removeButton = screen.getByTestId("file-preview-remove-file-1");
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith("file-1");
  });

  test("shows file icon based on MIME type", () => {
    render(<FilePreview files={mockFiles} onRemove={vi.fn()} />);

    // PDF should have 📄 icon
    const pdfItem = screen.getByTestId("file-preview-item-file-1");
    expect(pdfItem).toHaveTextContent("📄");

    // Excel should have 📊 icon
    const excelItem = screen.getByTestId("file-preview-item-file-2");
    expect(excelItem).toHaveTextContent("📊");
  });

  test("has proper accessibility attributes", () => {
    render(<FilePreview files={mockFiles} onRemove={vi.fn()} />);

    const container = screen.getByTestId("file-preview-container");
    expect(container).toHaveAttribute("role", "list");
    expect(container).toHaveAttribute("aria-label", "Selected files");

    const removeButton = screen.getByTestId("file-preview-remove-file-1");
    expect(removeButton).toHaveAttribute("aria-label", "Remove document.pdf");
  });
});
```

**Coverage:** Conditional rendering, file display, interactions, accessibility

---

### 5. Integration Test (8 test cases)

**File:** `tests/chat/file-upload/integration/file-upload-flow.test.tsx`  
**Test:** File upload integration in ChatMainContainer

#### Test Cases:

```typescript
describe("File Upload Integration", () => {
  test("opens file picker when file button clicked");
  test("opens image picker when image button clicked");
  test("adds files to preview after selection");
  test("removes file from preview when X clicked");
  test("clears all files after message sent");
  test("auto-focuses input after file selection");
  test("validates file size and shows error toast");
  test("validates file count (max 5) and shows error toast");
});
```

---

### 6. E2E Test (6 test cases)

**File:** `tests/chat/file-upload/e2e/file-upload.spec.ts`  
**Test:** End-to-end file upload scenarios

#### Test Cases:

```typescript
test("User can select and preview files");
test("User can remove files from preview");
test("User sees error for invalid file type");
test("User sees error for file too large");
test("User sees error for too many files");
test("Files are cleared after sending message");
```

---

## 🎯 Test Data & Mocks

### Mock Files

```typescript
export const mockFiles = {
  validPDF: new File(["content"], "test.pdf", {
    type: "application/pdf",
  }),

  validImage: new File(["content"], "test.jpg", {
    type: "image/jpeg",
  }),

  invalidType: new File(["content"], "test.exe", {
    type: "application/x-msdownload",
  }),

  tooLarge: new File(["a".repeat(11 * 1024 * 1024)], "large.pdf", {
    type: "application/pdf",
  }),
};
```

### Mock Toast

```typescript
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));
```

---

## 📊 Test Generation Checklist

### Unit Tests

- [ ] `src/utils/__tests__/fileHelpers.test.ts`

  - [ ] formatFileSize (5 tests)
  - [ ] getFileIcon (5 tests)
  - [ ] truncateFileName (3 tests)
  - [ ] generateFileId (2 tests)
  - [ ] isImage (2 tests)
  - [ ] createFilePreview (2 tests)
  - [ ] fileToSelectedFile (3 tests)

- [ ] `src/utils/__tests__/fileValidation.test.ts`

  - [ ] validateFileSize (2 tests)
  - [ ] validateFileType (2 tests)
  - [ ] validateFileCount (3 tests)
  - [ ] validateFile (3 tests)
  - [ ] validateFiles (3 tests)

- [ ] `src/hooks/__tests__/useFileValidation.test.tsx`

  - [ ] validates and adds valid files (1 test)
  - [ ] shows error toast (1 test)
  - [ ] respects custom rules (1 test)
  - [ ] calls callback (1 test)
  - [ ] handles multiple files (1 test)

- [ ] `src/components/__tests__/FilePreview.test.tsx`
  - [ ] renders nothing when empty (1 test)
  - [ ] renders file list (1 test)
  - [ ] displays file info (1 test)
  - [ ] calls onRemove (1 test)
  - [ ] shows file icons (1 test)
  - [ ] has accessibility (1 test)

### Integration Tests

- [ ] `tests/chat/file-upload/integration/file-upload-flow.test.tsx`
  - [ ] 8 integration test scenarios

### E2E Tests (Optional)

- [ ] `tests/chat/file-upload/e2e/file-upload.spec.ts`
  - [ ] 6 E2E test scenarios

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status       |
| ------------------------- | ------------ |
| Đã review test coverage   | ✅ Đã review |
| Đã review test cases      | ✅ Đã review |
| Đã review test data/mocks | ✅ Đã review |
| **APPROVED để tạo tests** | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-06

> ✅ **APPROVED: AI có thể tạo test files**

---

## 📝 Change Log

| Date       | Version | Changes                              |
| ---------- | ------- | ------------------------------------ |
| 2026-01-06 | 1.0.0   | Initial testing requirements created |

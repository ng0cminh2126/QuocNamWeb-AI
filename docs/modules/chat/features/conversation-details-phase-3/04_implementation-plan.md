# [BƯỚC 4] Phase 3 Implementation Plan: File Preview Modal

> **Module:** Chat  
> **Feature:** File Preview Modal  
> **Version:** 3.0  
> **Status:** ✅ APPROVED - Ready for implementation  
> **Created:** 2026-01-08  
> **Dependencies:**
>
> - [01_requirements.md](./01_requirements.md) ✅ APPROVED
> - [02a_wireframe.md](./02a_wireframe.md) ⏳ PENDING
> - [02b_flow.md](./02b_flow.md) ⏳ PENDING
> - [06_testing.md](./06_testing.md) ⏳ PENDING

---

## 📋 Overview

Step-by-step implementation plan cho File Preview Modal, được chia thành các tasks nhỏ có thể track và verify.

**Implementation Approach:**

1. Bottom-up: API → Hooks → Components
2. Test-driven: Write tests first
3. Incremental: One file at a time với tests

**Estimated Total Effort:** 12-16 hours

---

## 🗂️ Task Breakdown

### Phase A: Foundation (4-5 hours)

#### Task A1: Create Types

**File:** `src/types/filePreview.ts`  
**Estimated Time:** 30 minutes  
**Priority:** HIGH

```typescript
// src/types/filePreview.ts

export interface FilePreviewResponse {
  imageUrl: string;
  totalPages: number;
  currentPage: number;
}

export interface PdfPageRenderParams {
  fileId: string;
  pageNumber: number;
  dpi?: number;
}

export interface FilePreviewModalProps {
  isOpen: boolean;
  fileId: string;
  fileName: string;
  onClose: () => void;
}

export interface UsePdfPreviewReturn {
  // State
  totalPages: number;
  currentPage: number;
  imageUrl: string | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  navigateToPage: (pageNumber: number) => void;
  retry: () => void;
}

export type ModalState = "loading" | "showing-page" | "error";
```

**Testing:** No tests needed (types only)

**Validation:**

- ✅ TypeScript compiles without errors
- ✅ Interfaces exported correctly

---

#### Task A2: Create API Client

**File:** `src/api/filePreview.api.ts`  
**Estimated Time:** 1.5 hours  
**Priority:** HIGH  
**Test File:** `src/api/__tests__/filePreview.api.test.ts`

**Implementation Steps:**

1. **Create API functions:**

```typescript
// src/api/filePreview.api.ts

import { apiClient } from "./client";
import type {
  FilePreviewResponse,
  PdfPageRenderParams,
} from "@/types/filePreview";

/**
 * Preview file (first page for PDF) với watermark
 * Lấy X-Total-Pages từ response headers
 */
export async function previewFile(
  fileId: string
): Promise<FilePreviewResponse> {
  const response = await apiClient.get(`/api/Files/${fileId}/preview`, {
    responseType: "blob",
  });

  // Parse headers
  const totalPages = parseInt(response.headers["x-total-pages"] || "1", 10);
  const currentPage = parseInt(response.headers["x-current-page"] || "1", 10);

  // Create object URL from blob
  const imageUrl = URL.createObjectURL(response.data);

  return {
    imageUrl,
    totalPages,
    currentPage,
  };
}

/**
 * Render specific PDF page to image
 */
export async function renderPdfPage(
  fileId: string,
  pageNumber: number,
  dpi: number = 300
): Promise<string> {
  const response = await apiClient.get(
    `/api/pdf/${fileId}/pages/${pageNumber}/render`,
    {
      params: { dpi },
      responseType: "blob",
    }
  );

  // Create object URL from blob
  return URL.createObjectURL(response.data);
}
```

2. **Write tests** (6 test cases from 06_testing.md):

```typescript
// src/api/__tests__/filePreview.api.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { previewFile, renderPdfPage } from "../filePreview.api";
import * as client from "../client";

vi.mock("../client");

describe("filePreview API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-AP-001: previewFile calls correct endpoint
  it("should call preview endpoint with file ID", async () => {
    // ... (see 06_testing.md for full test)
  });

  // TC-AP-002: renderPdfPage calls with correct params
  it("should call render endpoint with page number and dpi", async () => {
    // ...
  });

  // TC-AP-003: Includes auth token
  it("should include Bearer token in requests", async () => {
    // ...
  });

  // TC-AP-004: Handles 404 errors
  it("should throw error for 404 responses", async () => {
    // ...
  });

  // TC-AP-005: Handles network errors
  it("should handle network errors gracefully", async () => {
    // ...
  });

  // TC-AP-006: Creates object URLs
  it("should convert blob to object URL", async () => {
    // ...
  });
});
```

**Validation:**

- ✅ All 6 tests passing
- ✅ Coverage > 80%
- ✅ Manual test with real API (use captured snapshots)

---

#### Task A3: Create API Query Keys

**File:** `src/hooks/queries/keys.ts` (update existing)  
**Estimated Time:** 15 minutes  
**Priority:** MEDIUM

```typescript
// src/hooks/queries/keys.ts

export const filePreviewKeys = {
  all: ["file-preview"] as const,
  preview: (fileId: string) =>
    [...filePreviewKeys.all, "preview", fileId] as const,
  page: (fileId: string, pageNumber: number) =>
    [...filePreviewKeys.all, "page", fileId, pageNumber] as const,
};
```

**Testing:** No tests needed

---

### Phase B: Business Logic (4-5 hours)

#### Task B1: Create usePdfPreview Hook

**File:** `src/hooks/usePdfPreview.ts`  
**Estimated Time:** 2.5 hours  
**Priority:** HIGH  
**Test File:** `src/hooks/__tests__/usePdfPreview.test.tsx`

**Implementation Steps:**

1. **Create hook:**

```typescript
// src/hooks/usePdfPreview.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { previewFile, renderPdfPage } from "@/api/filePreview.api";
import type { UsePdfPreviewReturn } from "@/types/filePreview";

export function usePdfPreview(fileId: string): UsePdfPreviewReturn {
  // State
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Cache: pageNumber → imageUrl
  const imageCacheRef = useRef<Map<number, string>>(new Map());

  // Fetch first page on mount
  useEffect(() => {
    loadFirstPage();

    // Cleanup object URLs on unmount
    return () => {
      imageCacheRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [fileId]);

  // Load first page from /preview endpoint
  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await previewFile(fileId);

      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      setImageUrl(result.imageUrl);

      // Cache first page
      imageCacheRef.current.set(1, result.imageUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load preview")
      );
    } finally {
      setIsLoading(false);
    }
  }, [fileId]);

  // Navigate to specific page
  const navigateToPage = useCallback(
    async (pageNumber: number) => {
      if (pageNumber < 1 || pageNumber > totalPages) {
        return;
      }

      setCurrentPage(pageNumber);

      // Check cache first
      if (imageCacheRef.current.has(pageNumber)) {
        setImageUrl(imageCacheRef.current.get(pageNumber)!);
        return;
      }

      // Fetch from API
      setIsLoading(true);
      setError(null);

      try {
        const url = await renderPdfPage(fileId, pageNumber, 300);

        // Cache the page
        imageCacheRef.current.set(pageNumber, url);
        setImageUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load page"));
      } finally {
        setIsLoading(false);
      }
    },
    [fileId, totalPages]
  );

  // Retry on error
  const retry = useCallback(() => {
    if (currentPage === 1) {
      loadFirstPage();
    } else {
      navigateToPage(currentPage);
    }
  }, [currentPage, loadFirstPage, navigateToPage]);

  return {
    totalPages,
    currentPage,
    imageUrl,
    isLoading,
    error,
    navigateToPage,
    retry,
  };
}
```

2. **Write tests** (7 test cases from 06_testing.md):

```typescript
// src/hooks/__tests__/usePdfPreview.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePdfPreview } from "../usePdfPreview";
import * as api from "@/api/filePreview.api";

vi.mock("@/api/filePreview.api");

describe("usePdfPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-PH-001: Fetches first page
  it("should fetch first page from preview endpoint", async () => {
    // ... (see 06_testing.md)
  });

  // TC-PH-002: Parses headers
  it("should parse total pages from response header", async () => {
    // ...
  });

  // ... remaining 5 test cases
});
```

**Validation:**

- ✅ All 7 tests passing
- ✅ Coverage > 80%

---

### Phase C: UI Components (4-6 hours)

#### Task C1: Create FilePreviewModal Component

**File:** `src/components/FilePreviewModal.tsx`  
**Estimated Time:** 3 hours  
**Priority:** HIGH  
**Test File:** `src/components/__tests__/FilePreviewModal.test.tsx`

**Implementation Steps:**

1. **Create modal component:**

```typescript
// src/components/FilePreviewModal.tsx

import { useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
} from "lucide-react";
import { usePdfPreview } from "@/hooks/usePdfPreview";
import type { FilePreviewModalProps } from "@/types/filePreview";

export function FilePreviewModal({
  isOpen,
  fileId,
  fileName,
  onClose,
}: FilePreviewModalProps) {
  const {
    totalPages,
    currentPage,
    imageUrl,
    isLoading,
    error,
    navigateToPage,
    retry,
  } = usePdfPreview(fileId);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
        case "ArrowDown":
          if (currentPage < totalPages) {
            navigateToPage(currentPage + 1);
          }
          break;
        case "ArrowLeft":
        case "ArrowUp":
          if (currentPage > 1) {
            navigateToPage(currentPage - 1);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentPage, totalPages, navigateToPage, onClose]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid="file-preview-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Container */}
      <div
        className="relative bg-white rounded-xl shadow-2xl
                   w-[90vw] h-[90vh] max-w-7xl
                   md:w-[95vw] md:h-[95vh]
                   sm:w-full sm:h-full sm:rounded-none
                   flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-4
                       h-[60px] px-6 py-4
                       sm:h-[50px] sm:px-4 sm:py-3
                       border-b border-gray-200
                       sticky top-0 bg-white z-10"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText
              size={24}
              className="text-gray-600 flex-shrink-0
                                          sm:w-5 sm:h-5"
            />
            <h2
              id="modal-title"
              className="text-base font-medium text-gray-900 truncate
                                           sm:text-sm"
            >
              {fileName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors
                       sm:w-11 sm:h-11 sm:flex sm:items-center sm:justify-center"
            data-testid="file-preview-modal-close-button"
            aria-label="Close preview"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto bg-gray-50 p-6
                       sm:p-3"
        >
          {isLoading && (
            <div
              className="flex flex-col items-center justify-center py-12
                           animate-pulse space-y-4"
              data-testid="file-preview-loading"
            >
              <div className="bg-gray-200 h-[600px] w-full max-w-2xl rounded-lg" />
              <p className="text-sm text-gray-500">
                Đang tải trang {currentPage} / {totalPages || "..."}
              </p>
            </div>
          )}

          {error && (
            <div
              className="flex flex-col items-center justify-center py-12 px-4"
              data-testid="file-preview-error"
            >
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error.message === "File not found"
                  ? "Không tìm thấy tệp hoặc đã bị xóa"
                  : "Không thể tải xem trước tệp"}
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                {error.message === "File not found"
                  ? "Tệp bạn đang xem trước không còn tồn tại."
                  : "Vui lòng kiểm tra kết nối và thử lại."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={retry}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg
                           hover:bg-gray-50 text-sm font-medium text-gray-700"
                  data-testid="file-preview-error-retry-button"
                >
                  Thử lại
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg
                           hover:bg-brand-700 text-sm font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && imageUrl && (
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt={`Page ${currentPage}`}
                className="max-w-full h-auto shadow-lg rounded"
                data-testid={`pdf-page-image-${currentPage}`}
              />
            </div>
          )}
        </div>

        {/* Navigation Footer (only if multi-page) */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between gap-4
                         h-[70px] px-6 py-4
                         sm:h-[60px] sm:px-4 sm:py-2
                         border-t border-gray-200
                         sticky bottom-0 bg-white z-10"
          >
            <button
              onClick={() => navigateToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                       rounded-lg text-sm font-medium text-gray-700
                       flex items-center gap-2 transition-colors
                       sm:w-11 sm:h-11 sm:p-0 sm:justify-center"
              data-testid="file-preview-prev-button"
            >
              <ChevronLeft size={16} />
              <span className="sm:hidden">Trước</span>
            </button>

            <span
              className="text-sm font-medium text-gray-700"
              data-testid="file-preview-page-indicator"
            >
              Trang {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => navigateToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-brand-600 text-white
                       hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed
                       rounded-lg text-sm font-medium
                       flex items-center gap-2 transition-colors
                       sm:w-11 sm:h-11 sm:p-0 sm:justify-center"
              data-testid="file-preview-next-button"
            >
              <span className="sm:hidden">Sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

2. **Write tests** (8 test cases from 06_testing.md)

**Validation:**

- ✅ All 8 tests passing
- ✅ Visual review: Desktop/Tablet/Mobile layouts
- ✅ Keyboard navigation works
- ✅ Loading/Error states display correctly

---

#### Task C2: Integrate into ChatMainContainer

**File:** `src/features/portal/components/ChatMainContainer.tsx`  
**Estimated Time:** 1 hour  
**Priority:** HIGH  
**Test File:** Add 3 integration tests

**Implementation Steps:**

1. **Add modal state:**

```typescript
// ChatMainContainer.tsx

import { useState } from "react";
import { FilePreviewModal } from "@/components/FilePreviewModal";

export default function ChatMainContainer() {
  // ... existing code

  const [previewFile, setPreviewFile] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleFileClick = (fileId: string, fileName: string) => {
    setPreviewFile({ id: fileId, name: fileName });
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  return (
    <>
      {/* Existing chat UI */}
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            {/* ... message content ... */}

            {/* File attachment - make clickable */}
            {msg.fileId && (
              <div
                onClick={() => handleFileClick(msg.fileId!, msg.fileName!)}
                className="cursor-pointer"
                data-testid={`message-file-attachment-${msg.fileId}`}
              >
                {/* Existing file display from v2.2 */}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={previewFile !== null}
        fileId={previewFile?.id || ""}
        fileName={previewFile?.name || ""}
        onClose={handleClosePreview}
      />
    </>
  );
}
```

2. **Write integration tests** (3 test cases from 06_testing.md)

**Validation:**

- ✅ Click file → modal opens
- ✅ Close modal → returns to chat
- ✅ Correct file ID passed to modal

---

## 📊 Progress Tracking

### Checklist

**Phase A: Foundation**

- [ ] Task A1: Types created
- [ ] Task A2: API client created + 6 tests passing
- [ ] Task A3: Query keys added

**Phase B: Business Logic**

- [ ] Task B1: usePdfPreview hook created + 7 tests passing

**Phase C: UI Components**

- [ ] Task C1: FilePreviewModal created + 8 tests passing
- [ ] Task C2: ChatMainContainer integration + 3 tests passing

**Final Validation**

- [ ] All 24 tests passing (run `npm test`)
- [ ] Manual testing with real API
- [ ] Visual review: Desktop/Tablet/Mobile
- [ ] Keyboard navigation verified
- [ ] Error scenarios tested

---

## 🧪 Testing Strategy

### Test Execution Order

1. **Unit Tests First:**

   ```bash
   npm test -- filePreview.api.test.ts
   npm test -- usePdfPreview.test.tsx
   npm test -- FilePreviewModal.test.tsx
   ```

2. **Integration Tests:**

   ```bash
   npm test -- ChatMainContainer.test.tsx
   ```

3. **Full Suite:**
   ```bash
   npm test
   ```

### Coverage Threshold

```json
// vitest.config.ts
{
  "coverage": {
    "lines": 80,
    "branches": 75,
    "functions": 80,
    "statements": 80
  }
}
```

---

## 🚀 Deployment Checklist

- [ ] All tests passing (24/24)
- [ ] TypeScript compiles without errors
- [ ] ESLint no errors
- [ ] Manual testing completed
- [ ] Snapshots captured (see snapshots/v1/README.md)
- [ ] Code review requested
- [ ] Update `05_progress.md` with completion status
- [ ] Tag checkpoint: `checkpoint-xxx_[chat]_phase3-complete`

---

## 📋 HUMAN CONFIRMATION

| Hạng Mục                       | Status       |
| ------------------------------ | ------------ |
| Đã review task breakdown       | ✅ Đã review |
| Đã review implementation steps | ✅ Đã review |
| Đã review testing strategy     | ✅ Đã review |
| **APPROVED để bắt đầu coding** | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-08

> ✅ **APPROVED - AI bắt đầu implementation**

---

**Created:** 2026-01-08  
**Next Step:** Begin implementation (BƯỚC 5) → Track progress in 05_progress.md

# [BƯỚC 4] Implementation Plan - File Upload Phase 2

> **Feature:** Upload nhiều file & Hiển thị ảnh dạng grid  
> **Version:** 2.0.0  
> **Status:** ⏳ PENDING APPROVAL  
> **Created:** 2026-01-14  
> **Module:** chat

---

## 📋 Version History

| Version | Date       | Changes                                 |
| ------- | ---------- | --------------------------------------- |
| 2.0.0   | 2026-01-14 | Initial implementation plan for Phase 2 |

---

## 📂 File Structure (Final)

```
src/
├── api/
│   ├── files.api.ts                    # ✏️ MODIFY - Add uploadFilesBatch()
│   └── __tests__/
│       └── files.api.test.ts           # ✏️ MODIFY - Add batch upload tests
│
├── hooks/
│   ├── mutations/
│   │   ├── useUploadFiles.ts           # ✅ EXISTS (Phase 1)
│   │   └── useUploadFilesBatch.ts      # 🆕 NEW - Batch upload mutation
│   └── __tests__/
│       └── useUploadFilesBatch.test.ts # 🆕 NEW - Mutation hook tests
│
├── types/
│   └── files.ts                        # ✏️ MODIFY - Add BatchUploadResult types
│
├── utils/
│   ├── fileHelpers.ts                  # ✏️ MODIFY - Add batch validation
│   └── __tests__/
│       └── fileHelpers.test.ts         # ✏️ MODIFY - Add batch validation tests
│
├── components/
│   ├── chat/
│   │   ├── ImageGrid.tsx               # 🆕 NEW - Grid container
│   │   ├── ImageGridItem.tsx           # 🆕 NEW - Single grid item
│   │   └── __tests__/
│   │       ├── ImageGrid.test.tsx      # 🆕 NEW - Grid component tests
│   │       └── ImageGridItem.test.tsx  # 🆕 NEW - Grid item tests
│   │
│   └── FilePreview.tsx                 # ✅ EXISTS (Phase 1) - No change needed
│
├── features/portal/
│   └── components/
│       └── chat/
│           ├── ChatMainContainer.tsx   # ✏️ MODIFY - Add batch upload logic
│           ├── MessageBubbleSimple.tsx # ✏️ MODIFY - Add ImageGrid rendering
│           └── __tests__/
│               ├── ChatMainContainer.test.tsx        # ✏️ MODIFY - Add batch tests
│               └── MessageBubbleSimple.test.tsx      # ✏️ MODIFY - Add grid tests
│
└── test/
    └── fixtures/
        └── batchUploadResults.ts       # 🆕 NEW - Test fixtures
```

**Summary:**

- 🆕 NEW: 7 files
- ✏️ MODIFY: 8 files
- ✅ REUSE: 1 file (FilePreview.tsx)

---

## 🔨 Implementation Steps

### STEP 1: Update Types (30 min)

#### File: `src/types/files.ts`

**Add new types:**

```typescript
/**
 * Batch upload result from POST /api/Files/batch
 */
export interface BatchUploadResult {
  totalFiles: number;
  successCount: number;
  failedCount: number;
  results: BatchUploadItemResult[];
  allSuccess: boolean; // Computed field
  partialSuccess: boolean; // Computed field
}

/**
 * Individual file result in batch upload
 */
export interface BatchUploadItemResult {
  index: number;
  success: boolean;
  fileId?: string; // UUID, nullable
  fileName: string | null;
  contentType: string | null;
  size?: number; // int64, nullable
  storagePath: string | null;
  error: string | null;
}

/**
 * File upload progress state (Phase 2)
 */
export interface FileUploadProgressState {
  status: "uploading" | "success" | "error";
  progress?: number; // 0-100 (Decision #4: No - simplified)
  error?: string;
}
```

**Testing:**

```typescript
// src/types/__tests__/files.test.ts
describe("BatchUploadResult", () => {
  it("should have correct structure", () => {
    const result: BatchUploadResult = {
      totalFiles: 3,
      successCount: 2,
      failedCount: 1,
      results: [],
      allSuccess: false,
      partialSuccess: true,
    };
    expect(result).toBeDefined();
  });
});
```

---

### STEP 2: Create Batch Upload API Client (45 min)

#### File: `src/api/files.api.ts`

**Add function:**

```typescript
import { apiClient } from "./client";
import type { BatchUploadResult } from "@/types/files";

/**
 * Upload multiple files in a single batch request
 * POST /api/Files/batch
 *
 * @param files - Array of File objects (2-10 files)
 * @returns BatchUploadResult with individual results
 * @throws Error if network fails or server returns error
 */
export async function uploadFilesBatch(
  files: File[]
): Promise<BatchUploadResult> {
  // Validation
  if (files.length === 0) {
    throw new Error("No files to upload");
  }
  if (files.length === 1) {
    throw new Error("Use single upload API for 1 file");
  }
  if (files.length > 10) {
    throw new Error("Maximum 10 files per batch");
  }

  // Create FormData
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  // API call
  const response = await apiClient.post<BatchUploadResult>(
    "/Files/batch",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60s for batch upload
    }
  );

  return response.data;
}
```

**Testing (4 cases):**

```typescript
// src/api/__tests__/files.api.test.ts
import { uploadFilesBatch } from "../files.api";
import { apiClient } from "../client";
import type { BatchUploadResult } from "@/types/files";

vi.mock("../client");

describe("uploadFilesBatch", () => {
  const mockFiles = [
    new File(["content1"], "file1.pdf", { type: "application/pdf" }),
    new File(["content2"], "file2.jpg", { type: "image/jpeg" }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should upload multiple files successfully", async () => {
    const mockResult: BatchUploadResult = {
      totalFiles: 2,
      successCount: 2,
      failedCount: 0,
      results: [
        {
          index: 0,
          success: true,
          fileId: "file-id-1",
          fileName: "file1.pdf",
          contentType: "application/pdf",
          size: 1024,
          storagePath: "/path/file1.pdf",
          error: null,
        },
        {
          index: 1,
          success: true,
          fileId: "file-id-2",
          fileName: "file2.jpg",
          contentType: "image/jpeg",
          size: 2048,
          storagePath: "/path/file2.jpg",
          error: null,
        },
      ],
      allSuccess: true,
      partialSuccess: false,
    };

    vi.mocked(apiClient.post).mockResolvedValue({ data: mockResult });

    const result = await uploadFilesBatch(mockFiles);

    expect(apiClient.post).toHaveBeenCalledWith(
      "/Files/batch",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      })
    );
    expect(result).toEqual(mockResult);
    expect(result.successCount).toBe(2);
  });

  it("should handle partial success", async () => {
    const mockResult: BatchUploadResult = {
      totalFiles: 2,
      successCount: 1,
      failedCount: 1,
      results: [
        {
          index: 0,
          success: true,
          fileId: "file-id-1",
          fileName: "file1.pdf",
          contentType: "application/pdf",
          size: 1024,
          storagePath: "/path/file1.pdf",
          error: null,
        },
        {
          index: 1,
          success: false,
          fileId: null,
          fileName: "file2.jpg",
          contentType: "image/jpeg",
          size: 15728640, // 15MB
          storagePath: null,
          error: "File size exceeds limit",
        },
      ],
      allSuccess: false,
      partialSuccess: true,
    };

    vi.mocked(apiClient.post).mockResolvedValue({ data: mockResult });

    const result = await uploadFilesBatch(mockFiles);

    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.results[1].error).toBe("File size exceeds limit");
  });

  it("should throw error if no files provided", async () => {
    await expect(uploadFilesBatch([])).rejects.toThrow("No files to upload");
  });

  it("should throw error if more than 10 files", async () => {
    const manyFiles = Array.from(
      { length: 11 },
      (_, i) =>
        new File([`content${i}`], `file${i}.txt`, { type: "text/plain" })
    );

    await expect(uploadFilesBatch(manyFiles)).rejects.toThrow(
      "Maximum 10 files per batch"
    );
  });
});
```

---

### STEP 3: Create Batch Upload Mutation Hook (45 min)

#### File: `src/hooks/mutations/useUploadFilesBatch.ts`

```typescript
import { useMutation } from "@tanstack/react-query";
import { uploadFilesBatch } from "@/api/files.api";
import type { BatchUploadResult } from "@/types/files";

interface UseUploadFilesBatchOptions {
  onSuccess?: (result: BatchUploadResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Mutation hook for batch file upload
 *
 * Features:
 * - Auto retry once on network error (2s delay)
 * - Timeout: 60s
 * - Returns BatchUploadResult with individual results
 *
 * @example
 * const uploadMutation = useUploadFilesBatch({
 *   onSuccess: (result) => {
 *     if (result.allSuccess) {
 *       toast.success("All files uploaded");
 *     } else {
 *       toast.warning(`${result.successCount}/${result.totalFiles} uploaded`);
 *     }
 *   },
 * });
 *
 * uploadMutation.mutate(selectedFiles);
 */
export function useUploadFilesBatch(options?: UseUploadFilesBatchOptions) {
  return useMutation({
    mutationFn: uploadFilesBatch,
    retry: 1, // Auto retry once
    retryDelay: 2000, // 2s delay
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
```

**Testing (5 cases):**

```typescript
// src/hooks/__tests__/useUploadFilesBatch.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUploadFilesBatch } from "../mutations/useUploadFilesBatch";
import { uploadFilesBatch } from "@/api/files.api";
import type { BatchUploadResult } from "@/types/files";

vi.mock("@/api/files.api");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUploadFilesBatch", () => {
  const mockFiles = [
    new File(["content1"], "file1.pdf", { type: "application/pdf" }),
    new File(["content2"], "file2.jpg", { type: "image/jpeg" }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should upload files successfully", async () => {
    const mockResult: BatchUploadResult = {
      totalFiles: 2,
      successCount: 2,
      failedCount: 0,
      results: [],
      allSuccess: true,
      partialSuccess: false,
    };

    vi.mocked(uploadFilesBatch).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useUploadFilesBatch(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockFiles);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResult);
  });

  it("should handle error", async () => {
    const mockError = new Error("Upload failed");
    vi.mocked(uploadFilesBatch).mockRejectedValue(mockError);

    const { result } = renderHook(() => useUploadFilesBatch(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockFiles);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });

  it("should call onSuccess callback", async () => {
    const mockResult: BatchUploadResult = {
      totalFiles: 2,
      successCount: 2,
      failedCount: 0,
      results: [],
      allSuccess: true,
      partialSuccess: false,
    };
    const onSuccess = vi.fn();

    vi.mocked(uploadFilesBatch).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useUploadFilesBatch({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockFiles);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(mockResult));
  });

  it("should call onError callback", async () => {
    const mockError = new Error("Network error");
    const onError = vi.fn();

    vi.mocked(uploadFilesBatch).mockRejectedValue(mockError);

    const { result } = renderHook(() => useUploadFilesBatch({ onError }), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockFiles);

    await waitFor(() => expect(onError).toHaveBeenCalledWith(mockError));
  });

  it("should handle partial success", async () => {
    const mockResult: BatchUploadResult = {
      totalFiles: 2,
      successCount: 1,
      failedCount: 1,
      results: [],
      allSuccess: false,
      partialSuccess: true,
    };

    vi.mocked(uploadFilesBatch).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useUploadFilesBatch(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockFiles);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.partialSuccess).toBe(true);
  });
});
```

---

### STEP 4: Update File Helpers (30 min)

#### File: `src/utils/fileHelpers.ts`

**Add batch validation:**

```typescript
/**
 * Validate batch file selection
 *
 * @param files - Array of files to validate
 * @param maxFiles - Max files allowed (default: 10)
 * @param maxSizePerFile - Max size per file in bytes (default: 10MB)
 * @param maxTotalSize - Max total size in bytes (default: 50MB)
 * @returns Validation result with errors
 */
export function validateBatchFileSelection(
  files: File[],
  maxFiles: number = 10,
  maxSizePerFile: number = 10 * 1024 * 1024, // 10MB
  maxTotalSize: number = 50 * 1024 * 1024 // 50MB
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check max files
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed per message`);
  }

  // Check individual file size
  files.forEach((file, index) => {
    if (file.size > maxSizePerFile) {
      errors.push(
        `File "${file.name}" exceeds ${formatFileSize(maxSizePerFile)} limit`
      );
    }
  });

  // Check total batch size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > maxTotalSize) {
    errors.push(
      `Total files size (${formatFileSize(totalSize)}) exceeds ${formatFileSize(
        maxTotalSize
      )} limit`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Process batch upload results and extract successful files
 *
 * @param result - BatchUploadResult from API
 * @returns Array of AttachmentInputDto for successful uploads
 */
export function extractSuccessfulUploads(
  result: BatchUploadResult
): AttachmentInputDto[] {
  return result.results
    .filter((item) => item.success && item.fileId)
    .map((item) => ({
      fileId: item.fileId!,
      fileName: item.fileName || "unknown",
      fileSize: item.size || 0,
      contentType: item.contentType || "application/octet-stream",
    }));
}
```

**Testing (3 cases):**

```typescript
// src/utils/__tests__/fileHelpers.test.ts (add to existing)
describe("validateBatchFileSelection", () => {
  it("should pass valid batch", () => {
    const files = [
      new File(["content1"], "file1.pdf", { type: "application/pdf" }),
      new File(["content2"], "file2.jpg", { type: "image/jpeg" }),
    ];

    const result = validateBatchFileSelection(files);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should fail if too many files", () => {
    const files = Array.from(
      { length: 11 },
      (_, i) =>
        new File([`content${i}`], `file${i}.txt`, { type: "text/plain" })
    );

    const result = validateBatchFileSelection(files);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Maximum 10 files allowed per message");
  });

  it("should fail if total size exceeds limit", () => {
    const largeFile = new File(
      [new ArrayBuffer(30 * 1024 * 1024)],
      "large1.pdf"
    );
    const largeFile2 = new File(
      [new ArrayBuffer(30 * 1024 * 1024)],
      "large2.pdf"
    );

    const result = validateBatchFileSelection([largeFile, largeFile2]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Total files size"))).toBe(
      true
    );
  });
});

describe("extractSuccessfulUploads", () => {
  it("should extract successful uploads", () => {
    const result: BatchUploadResult = {
      totalFiles: 3,
      successCount: 2,
      failedCount: 1,
      results: [
        {
          index: 0,
          success: true,
          fileId: "file-id-1",
          fileName: "file1.pdf",
          contentType: "application/pdf",
          size: 1024,
          storagePath: "/path/1",
          error: null,
        },
        {
          index: 1,
          success: false,
          fileId: null,
          fileName: "file2.jpg",
          contentType: null,
          size: null,
          storagePath: null,
          error: "Too large",
        },
        {
          index: 2,
          success: true,
          fileId: "file-id-3",
          fileName: "file3.png",
          contentType: "image/png",
          size: 2048,
          storagePath: "/path/3",
          error: null,
        },
      ],
      allSuccess: false,
      partialSuccess: true,
    };

    const attachments = extractSuccessfulUploads(result);

    expect(attachments).toHaveLength(2);
    expect(attachments[0].fileId).toBe("file-id-1");
    expect(attachments[1].fileId).toBe("file-id-3");
  });
});
```

---

### STEP 5: Create ImageGrid Component (60 min)

#### File: `src/components/chat/ImageGrid.tsx`

```typescript
import React from "react";
import ImageGridItem from "./ImageGridItem";
import type { AttachmentDto } from "@/types/messages";

interface ImageGridProps {
  images: AttachmentDto[];
  onImageClick: (fileId: string, fileName: string) => void;
  className?: string;
}

/**
 * Image Grid Component
 * Displays multiple images in a responsive grid layout
 *
 * Layout:
 * - Desktop/Tablet: 3 columns
 * - Mobile (<640px): 2 columns
 * - Aspect ratio: 1:1 (square)
 *
 * @example
 * <ImageGrid
 *   images={message.attachments}
 *   onImageClick={(fileId) => openPreview(fileId)}
 * />
 */
export default function ImageGrid({
  images,
  onImageClick,
  className = "",
}: ImageGridProps) {
  if (images.length === 0) return null;

  return (
    <div
      className={`grid grid-cols-3 sm:grid-cols-3 gap-2 max-w-[400px] sm:max-w-[400px] ${className}`}
      data-testid="image-grid"
      role="grid"
      aria-label={`Image grid with ${images.length} images`}
    >
      {images.map((image) => (
        <ImageGridItem
          key={image.fileId}
          fileId={image.fileId}
          fileName={image.fileName || "Image"}
          onClick={() => onImageClick(image.fileId, image.fileName || "Image")}
        />
      ))}
    </div>
  );
}
```

**Responsive CSS (Tailwind):**

- `grid-cols-2`: Mobile (default, <640px)
- `sm:grid-cols-3`: Desktop/Tablet (≥640px)
- `gap-2`: 8px gap
- `max-w-[400px]`: Desktop max width
- `sm:max-w-[400px]`: Desktop max width (explicit for tablet)

**Testing (4 cases):**

```typescript
// src/components/chat/__tests__/ImageGrid.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageGrid from "../ImageGrid";
import type { AttachmentDto } from "@/types/messages";

// Mock ImageGridItem
vi.mock("../ImageGridItem", () => ({
  default: ({ fileId, fileName, onClick }: any) => (
    <div
      data-testid={`image-grid-item-${fileId}`}
      onClick={onClick}
      role="gridcell"
    >
      {fileName}
    </div>
  ),
}));

describe("ImageGrid", () => {
  const mockImages: AttachmentDto[] = [
    {
      id: "att-1",
      fileId: "file-1",
      fileName: "photo1.jpg",
      fileSize: 1024,
      contentType: "image/jpeg",
      createdAt: "2026-01-14T10:00:00Z",
    },
    {
      id: "att-2",
      fileId: "file-2",
      fileName: "photo2.jpg",
      fileSize: 2048,
      contentType: "image/jpeg",
      createdAt: "2026-01-14T10:00:00Z",
    },
    {
      id: "att-3",
      fileId: "file-3",
      fileName: "photo3.jpg",
      fileSize: 3072,
      contentType: "image/jpeg",
      createdAt: "2026-01-14T10:00:00Z",
    },
  ];

  it("should render grid with images", () => {
    const onImageClick = vi.fn();

    render(<ImageGrid images={mockImages} onImageClick={onImageClick} />);

    const grid = screen.getByTestId("image-grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute("role", "grid");
    expect(grid).toHaveAttribute("aria-label", "Image grid with 3 images");

    expect(screen.getByTestId("image-grid-item-file-1")).toBeInTheDocument();
    expect(screen.getByTestId("image-grid-item-file-2")).toBeInTheDocument();
    expect(screen.getByTestId("image-grid-item-file-3")).toBeInTheDocument();
  });

  it("should call onImageClick when image is clicked", async () => {
    const user = userEvent.setup();
    const onImageClick = vi.fn();

    render(<ImageGrid images={mockImages} onImageClick={onImageClick} />);

    const firstImage = screen.getByTestId("image-grid-item-file-1");
    await user.click(firstImage);

    expect(onImageClick).toHaveBeenCalledWith("file-1", "photo1.jpg");
  });

  it("should render null if no images", () => {
    const { container } = render(
      <ImageGrid images={[]} onImageClick={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should apply custom className", () => {
    render(
      <ImageGrid
        images={mockImages}
        onImageClick={vi.fn()}
        className="custom-class"
      />
    );

    const grid = screen.getByTestId("image-grid");
    expect(grid).toHaveClass("custom-class");
  });
});
```

---

### STEP 6: Create ImageGridItem Component (45 min)

#### File: `src/components/chat/ImageGridItem.tsx`

```typescript
import React, { useState, useEffect, useRef } from "react";
import { getImageThumbnail } from "@/api/files.api";
import { Loader2 } from "lucide-react";

interface ImageGridItemProps {
  fileId: string;
  fileName: string;
  onClick: () => void;
}

/**
 * Image Grid Item Component
 * Individual image in the grid with lazy loading
 *
 * Features:
 * - Lazy loading with Intersection Observer
 * - Loading skeleton
 * - Error placeholder
 * - Aspect ratio 1:1 (square)
 * - Hover scale effect
 *
 * @example
 * <ImageGridItem
 *   fileId="file-id"
 *   fileName="photo.jpg"
 *   onClick={() => openPreview()}
 * />
 */
export default function ImageGridItem({
  fileId,
  fileName,
  onClick,
}: ImageGridItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Fetch thumbnail when visible
  useEffect(() => {
    if (!isVisible || imageUrl || error) return;

    const fetchThumbnail = async () => {
      setIsLoading(true);
      try {
        const blob = await getImageThumbnail(fileId, "large");
        const blobUrl = URL.createObjectURL(blob);
        setImageUrl(blobUrl);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchThumbnail();
  }, [isVisible, fileId, imageUrl, error]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Not visible yet - placeholder
  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        className="aspect-square bg-gray-100 rounded-lg"
        data-testid="image-grid-item-placeholder"
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
        data-testid="image-grid-item-loading"
      >
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:scale-102 transition-transform"
        onClick={onClick}
        data-testid="image-grid-item-error"
        role="gridcell"
        tabIndex={0}
        aria-label={`${fileName} - Failed to load. Click to view.`}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
      >
        <span className="text-gray-500 text-xs">Failed to load</span>
      </div>
    );
  }

  // Success state
  return (
    <div
      ref={containerRef}
      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-102 transition-transform group"
      onClick={onClick}
      data-testid={`image-grid-item-${fileId}`}
      role="gridcell"
      tabIndex={0}
      aria-label={`${fileName}. Press Enter to preview.`}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <img
        src={imageUrl!}
        alt={fileName}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
```

**Testing (4 cases):**

```typescript
// src/components/chat/__tests__/ImageGridItem.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageGridItem from "../ImageGridItem";
import { getImageThumbnail } from "@/api/files.api";

vi.mock("@/api/files.api");

describe("ImageGridItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render placeholder initially", () => {
    render(
      <ImageGridItem fileId="file-1" fileName="photo.jpg" onClick={vi.fn()} />
    );

    expect(
      screen.getByTestId("image-grid-item-placeholder")
    ).toBeInTheDocument();
  });

  it("should load and display image", async () => {
    const mockBlob = new Blob(["image"], { type: "image/jpeg" });
    vi.mocked(getImageThumbnail).mockResolvedValue(mockBlob);

    // Mock IntersectionObserver
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      // Trigger immediately
      setTimeout(() => callback([{ isIntersecting: true }], {} as any), 0);
      return { observe: mockObserve, disconnect: mockDisconnect };
    }) as any;

    render(
      <ImageGridItem fileId="file-1" fileName="photo.jpg" onClick={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByTestId("image-grid-item-file-1")).toBeInTheDocument();
    });

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "photo.jpg");
  });

  it("should show error state on load failure", async () => {
    vi.mocked(getImageThumbnail).mockRejectedValue(new Error("Load failed"));

    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      setTimeout(() => callback([{ isIntersecting: true }], {} as any), 0);
      return { observe: vi.fn(), disconnect: vi.fn() };
    }) as any;

    render(
      <ImageGridItem fileId="file-1" fileName="photo.jpg" onClick={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByTestId("image-grid-item-error")).toBeInTheDocument();
    });

    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const mockBlob = new Blob(["image"], { type: "image/jpeg" });
    vi.mocked(getImageThumbnail).mockResolvedValue(mockBlob);

    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      setTimeout(() => callback([{ isIntersecting: true }], {} as any), 0);
      return { observe: vi.fn(), disconnect: vi.fn() };
    }) as any;

    render(
      <ImageGridItem fileId="file-1" fileName="photo.jpg" onClick={onClick} />
    );

    await waitFor(() => {
      expect(screen.getByTestId("image-grid-item-file-1")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("image-grid-item-file-1"));

    expect(onClick).toHaveBeenCalled();
  });
});
```

---

### STEP 7: Update ChatMainContainer (90 min)

#### File: `src/features/portal/components/chat/ChatMainContainer.tsx`

**Changes:**

1. **Replace single file state with array:**

```typescript
// OLD (Phase 1)
const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

// NEW (Phase 2)
const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
```

2. **Add batch upload mutation:**

```typescript
import { useUploadFilesBatch } from "@/hooks/mutations/useUploadFilesBatch";

const uploadBatchMutation = useUploadFilesBatch({
  onSuccess: (result) => {
    if (result.allSuccess) {
      toast.success("Files uploaded successfully");
    } else {
      toast.warning(
        `${result.successCount}/${result.totalFiles} files uploaded. ${result.failedCount} failed.`
      );
    }

    // Extract successful files
    const successfulAttachments = extractSuccessfulUploads(result);

    if (successfulAttachments.length > 0) {
      // Send message with successful files
      sendMessageMutation.mutate({
        conversationId,
        content: inputValue,
        attachments: successfulAttachments,
      });

      setInputValue("");
      setSelectedFiles([]);
    }
  },
  onError: (error) => {
    toast.error("Upload failed. Please try again.");
    setIsUploading(false);
  },
});
```

3. **Update file selection handler:**

```typescript
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);

  if (files.length === 0) return;

  // Validate batch
  const validation = validateBatchFileSelection(files);
  if (!validation.valid) {
    validation.errors.forEach((error) => toast.error(error));
    return;
  }

  // Convert to SelectedFile[]
  const newFiles: SelectedFile[] = files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    preview: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined,
  }));

  setSelectedFiles((prev) => [...prev, ...newFiles]);

  // Reset input
  e.target.value = "";
};
```

4. **Update send message handler:**

```typescript
const handleSendMessage = async () => {
  if (!inputValue.trim() && selectedFiles.length === 0) return;

  // Case 1: No files - text only
  if (selectedFiles.length === 0) {
    sendMessageMutation.mutate({
      conversationId,
      content: inputValue,
    });
    setInputValue("");
    return;
  }

  // Case 2: Single file - use Phase 1 single upload
  if (selectedFiles.length === 1) {
    setIsUploading(true);
    try {
      const result = await uploadFile(selectedFiles[0].file);

      sendMessageMutation.mutate({
        conversationId,
        content: inputValue,
        attachments: [
          {
            fileId: result.fileId,
            fileName: result.fileName,
            fileSize: result.fileSize,
            contentType: result.contentType,
          },
        ],
      });

      setInputValue("");
      setSelectedFiles([]);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
    return;
  }

  // Case 3: Multiple files - use Phase 2 batch upload
  setIsUploading(true);
  const filesToUpload = selectedFiles.map((sf) => sf.file);
  uploadBatchMutation.mutate(filesToUpload);
};
```

5. **Update file remove handler:**

```typescript
const handleRemoveFile = (fileId: string) => {
  setSelectedFiles((prev) => {
    const removed = prev.find((f) => f.id === fileId);
    if (removed?.preview) {
      URL.revokeObjectURL(removed.preview);
    }
    return prev.filter((f) => f.id !== fileId);
  });
};
```

**Testing (4 cases):**

```typescript
// src/features/portal/components/chat/__tests__/ChatMainContainer.test.tsx (add to existing)
describe("ChatMainContainer - Batch Upload", () => {
  it("should upload multiple files using batch API", async () => {
    const user = userEvent.setup();
    const files = [
      new File(["content1"], "file1.pdf", { type: "application/pdf" }),
      new File(["content2"], "file2.jpg", { type: "image/jpeg" }),
    ];

    render(<ChatMainContainer conversationId="conv-1" />);

    const fileInput = screen.getByTestId("file-input");
    await user.upload(fileInput, files);

    // Verify files in preview
    expect(screen.getByText("file1.pdf")).toBeInTheDocument();
    expect(screen.getByText("file2.jpg")).toBeInTheDocument();

    // Send message
    const sendButton = screen.getByTestId("send-message-button");
    await user.click(sendButton);

    await waitFor(() => {
      expect(uploadFilesBatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "file1.pdf" }),
          expect.objectContaining({ name: "file2.jpg" }),
        ])
      );
    });
  });

  it("should use single upload API for 1 file", async () => {
    const user = userEvent.setup();
    const file = new File(["content"], "file.pdf", { type: "application/pdf" });

    render(<ChatMainContainer conversationId="conv-1" />);

    const fileInput = screen.getByTestId("file-input");
    await user.upload(fileInput, [file]);

    const sendButton = screen.getByTestId("send-message-button");
    await user.click(sendButton);

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalled();
      expect(uploadFilesBatch).not.toHaveBeenCalled();
    });
  });

  it("should show validation error for too many files", async () => {
    const user = userEvent.setup();
    const files = Array.from(
      { length: 11 },
      (_, i) =>
        new File([`content${i}`], `file${i}.txt`, { type: "text/plain" })
    );

    render(<ChatMainContainer conversationId="conv-1" />);

    const fileInput = screen.getByTestId("file-input");
    await user.upload(fileInput, files);

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Maximum 10 files")
    );
  });

  it("should handle partial upload success", async () => {
    const user = userEvent.setup();
    const files = [
      new File(["content1"], "file1.pdf", { type: "application/pdf" }),
      new File(["content2"], "file2.jpg", { type: "image/jpeg" }),
    ];

    const partialResult: BatchUploadResult = {
      totalFiles: 2,
      successCount: 1,
      failedCount: 1,
      results: [
        {
          index: 0,
          success: true,
          fileId: "file-1",
          fileName: "file1.pdf",
          contentType: "application/pdf",
          size: 1024,
          storagePath: "/1",
          error: null,
        },
        {
          index: 1,
          success: false,
          fileId: null,
          fileName: "file2.jpg",
          contentType: null,
          size: null,
          storagePath: null,
          error: "Too large",
        },
      ],
      allSuccess: false,
      partialSuccess: true,
    };

    vi.mocked(uploadFilesBatch).mockResolvedValue(partialResult);

    render(<ChatMainContainer conversationId="conv-1" />);

    const fileInput = screen.getByTestId("file-input");
    await user.upload(fileInput, files);

    const sendButton = screen.getByTestId("send-message-button");
    await user.click(sendButton);

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        "1/2 files uploaded. 1 failed."
      );
    });
  });
});
```

---

### STEP 8: Update MessageBubbleSimple (60 min)

#### File: `src/features/portal/components/chat/MessageBubbleSimple.tsx`

**Add ImageGrid rendering logic:**

```typescript
import ImageGrid from "@/components/chat/ImageGrid";

// Inside component, add logic to separate images from files
const imageAttachments =
  message.attachments?.filter((att) => att.contentType?.startsWith("image/")) ||
  [];

const fileAttachments =
  message.attachments?.filter(
    (att) => !att.contentType?.startsWith("image/")
  ) || [];

const shouldUseGrid = imageAttachments.length >= 2;

// In JSX:
{
  /* Images - Grid if ≥2, single if 1 */
}
{
  imageAttachments.length > 0 && (
    <>
      {shouldUseGrid ? (
        <ImageGrid
          images={imageAttachments}
          onImageClick={(fileId, fileName) =>
            onFilePreviewClick?.(fileId, fileName)
          }
          className="mt-2"
        />
      ) : (
        <MessageImage
          fileId={imageAttachments[0].fileId}
          fileName={imageAttachments[0].fileName || "Image"}
          onPreviewClick={onFilePreviewClick || (() => {})}
        />
      )}
    </>
  );
}

{
  /* Non-image files - List */
}
{
  fileAttachments.length > 0 && (
    <div className="mt-2 space-y-2">
      {fileAttachments.map((file) => (
        <div key={file.fileId}>{/* Existing file display */}</div>
      ))}
    </div>
  );
}
```

**Testing (4 cases):**

```typescript
// src/features/portal/components/chat/__tests__/MessageBubbleSimple.test.tsx (add)
describe("MessageBubbleSimple - Image Grid", () => {
  it("should render ImageGrid for multiple images", () => {
    const message: ChatMessage = {
      id: "msg-1",
      content: "Photos",
      senderId: "user-1",
      senderName: "John",
      sentAt: "2026-01-14T10:00:00Z",
      attachments: [
        {
          id: "att-1",
          fileId: "file-1",
          fileName: "photo1.jpg",
          fileSize: 1024,
          contentType: "image/jpeg",
          createdAt: "2026-01-14T10:00:00Z",
        },
        {
          id: "att-2",
          fileId: "file-2",
          fileName: "photo2.jpg",
          fileSize: 2048,
          contentType: "image/jpeg",
          createdAt: "2026-01-14T10:00:00Z",
        },
      ],
    };

    render(<MessageBubbleSimple message={message} isOwn={false} />);

    expect(screen.getByTestId("image-grid")).toBeInTheDocument();
  });

  it("should render single MessageImage for 1 image", () => {
    const message: ChatMessage = {
      id: "msg-1",
      content: "Photo",
      senderId: "user-1",
      senderName: "John",
      sentAt: "2026-01-14T10:00:00Z",
      attachments: [
        {
          id: "att-1",
          fileId: "file-1",
          fileName: "photo.jpg",
          fileSize: 1024,
          contentType: "image/jpeg",
          createdAt: "2026-01-14T10:00:00Z",
        },
      ],
    };

    render(<MessageBubbleSimple message={message} isOwn={false} />);

    expect(screen.queryByTestId("image-grid")).not.toBeInTheDocument();
    // Should use existing MessageImage component
  });

  it("should render mixed content (images + files)", () => {
    const message: ChatMessage = {
      id: "msg-1",
      content: "Files",
      senderId: "user-1",
      senderName: "John",
      sentAt: "2026-01-14T10:00:00Z",
      attachments: [
        {
          id: "att-1",
          fileId: "file-1",
          fileName: "photo.jpg",
          fileSize: 1024,
          contentType: "image/jpeg",
          createdAt: "2026-01-14T10:00:00Z",
        },
        {
          id: "att-2",
          fileId: "file-2",
          fileName: "photo2.jpg",
          fileSize: 2048,
          contentType: "image/jpeg",
          createdAt: "2026-01-14T10:00:00Z",
        },
        {
          id: "att-3",
          fileId: "file-3",
          fileName: "report.pdf",
          fileSize: 3072,
          contentType: "application/pdf",
          createdAt: "2026-01-14T10:00:00Z",
        },
      ],
    };

    render(<MessageBubbleSimple message={message} isOwn={false} />);

    expect(screen.getByTestId("image-grid")).toBeInTheDocument();
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
  });

  it("should call onFilePreviewClick when grid image clicked", async () => {
    const user = userEvent.setup();
    const onFilePreviewClick = vi.fn();

    const message: ChatMessage = {
      id: "msg-1",
      content: "Photos",
      senderId: "user-1",
      senderName: "John",
      sentAt: "2026-01-14T10:00:00Z",
      attachments: [
        {
          id: "att-1",
          fileId: "file-1",
          fileName: "photo1.jpg",
          fileSize: 1024,
          contentType: "image/jpeg",
          createdAt: "2026-01-14T10:00:00Z",
        },
        {
          id: "att-2",
          fileId: "file-2",
          fileName: "photo2.jpg",
          fileSize: 2048,
          contentType: "image/jpeg",
          createdAt: "2026-01-14T10:00:00Z",
        },
      ],
    };

    render(
      <MessageBubbleSimple
        message={message}
        isOwn={false}
        onFilePreviewClick={onFilePreviewClick}
      />
    );

    // Mock ImageGrid to trigger click
    const grid = screen.getByTestId("image-grid");
    await user.click(grid);

    // Verify callback
    expect(onFilePreviewClick).toHaveBeenCalled();
  });
});
```

---

## 📋 IMPACT SUMMARY (Complete)

### Files sẽ tạo mới (7 files):

1. `src/hooks/mutations/useUploadFilesBatch.ts` - Batch upload mutation hook
2. `src/components/chat/ImageGrid.tsx` - Grid container component
3. `src/components/chat/ImageGridItem.tsx` - Grid item with lazy loading
4. `src/hooks/__tests__/useUploadFilesBatch.test.ts` - Hook tests (5 cases)
5. `src/components/chat/__tests__/ImageGrid.test.tsx` - Grid tests (4 cases)
6. `src/components/chat/__tests__/ImageGridItem.test.tsx` - Grid item tests (4 cases)
7. `src/test/fixtures/batchUploadResults.ts` - Test fixtures

### Files sẽ sửa đổi (8 files):

1. `src/types/files.ts` - Add `BatchUploadResult`, `BatchUploadItemResult`, `FileUploadProgressState`
2. `src/api/files.api.ts` - Add `uploadFilesBatch()` function
3. `src/api/__tests__/files.api.test.ts` - Add batch upload tests (4 cases)
4. `src/utils/fileHelpers.ts` - Add `validateBatchFileSelection()`, `extractSuccessfulUploads()`
5. `src/utils/__tests__/fileHelpers.test.ts` - Add validation tests (3 cases)
6. `src/features/portal/components/chat/ChatMainContainer.tsx` - Add batch upload logic
7. `src/features/portal/components/chat/MessageBubbleSimple.tsx` - Add ImageGrid rendering
8. `src/features/portal/components/chat/__tests__/ChatMainContainer.test.tsx` - Add batch tests (4 cases)

### Files giữ nguyên (1 file):

- `src/components/FilePreview.tsx` - Already supports multiple files

### Dependencies:

- ❌ No new dependencies (use existing TanStack Query, Radix UI, Tailwind CSS)

---

## 🧪 Testing Summary

### Test Coverage by File Type:

| File Type      | Files | Test Cases | Total Tests |
| -------------- | ----- | ---------- | ----------- |
| API Clients    | 1     | 4          | 4           |
| Mutation Hooks | 1     | 5          | 5           |
| Utilities      | 1     | 3          | 3           |
| Components     | 2     | 8          | 8           |
| Containers     | 2     | 8          | 8           |
| **TOTAL**      | **7** | **28**     | **28**      |

### Test Types:

- Unit Tests: 20 cases (API, hooks, utils, components)
- Integration Tests: 8 cases (containers with API integration)
- E2E Tests: See [06_testing.md](./06_testing.md)

---

## ⏱️ Estimated Timeline

| Phase                         | Duration | Cumulative |
| ----------------------------- | -------- | ---------- |
| STEP 1: Update Types          | 30 min   | 0.5h       |
| STEP 2: API Client + Tests    | 45 min   | 1.25h      |
| STEP 3: Mutation Hook + Tests | 45 min   | 2h         |
| STEP 4: File Helpers + Tests  | 30 min   | 2.5h       |
| STEP 5: ImageGrid + Tests     | 60 min   | 3.5h       |
| STEP 6: ImageGridItem + Tests | 45 min   | 4.25h      |
| STEP 7: ChatMainContainer     | 90 min   | 5.75h      |
| STEP 8: MessageBubbleSimple   | 60 min   | 6.75h      |
| **TOTAL CODING**              | **~7h**  | -          |
| Manual Testing                | 1h       | 7.75h      |
| Bug Fixes & Polish            | 1h       | 8.75h      |
| **GRAND TOTAL**               | **~9h**  | -          |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                      | Status       |
| ----------------------------- | ------------ |
| Đã review file structure      | ✅ Đã review |
| Đã review implementation plan | ✅ Đã review |
| Đã review test coverage       | ✅ Đã review |
| **APPROVED để thực thi**      | ✅ APPROVED  |

**HUMAN Signature:** MINH - ĐÃ DUYỆT  
**Date:** 2026-01-14

> ✅ **Implementation plan đã được approve - Ready to code**

---

## 🔗 References

- [Requirements](./01_requirements.md) ✅ APPROVED
- [Wireframe](./02a_wireframe.md) ✅ APPROVED
- [Flow](./02b_flow.md) ✅ APPROVED
- [Batch Upload API Contract](../../../api/file/batch-upload/contract.md) ✅ READY
- [Send Message API Contract](../../../api/chat/message-send-with-multiple-attachments/contract.md) ✅ READY
- [Testing Requirements](./06_testing.md) ⏳ NEXT

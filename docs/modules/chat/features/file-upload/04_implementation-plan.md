# [BƯỚC 4] Implementation Plan - File Upload UI

> **Feature:** Upload File & Image trong Chat  
> **Version:** 1.0.0  
> **Status:** ✅ APPROVED  
> **Created:** 2026-01-06  
> **Approved:** 2026-01-06  
> **Scope:** UI Only - No API Integration  
> **Phase:** 1 (UI Components & Validation)

---

## 📋 Implementation Overview

**Mục tiêu:** Implement file upload UI cho phép user chọn files/images, hiển thị preview, validate client-side, và auto-focus input. **KHÔNG implement upload API.**

**Thời gian ước tính:** 4-6 giờ

**Files cần tạo:** 4 files  
**Files cần sửa:** 2 files

---

## 🎯 Implementation Scope

### ✅ WILL DO (Phase 1 - UI Only)

- [x] File upload button (📎 icon)
- [x] Image upload button (🖼️ icon)
- [x] Native file picker (accept attributes)
- [x] File preview component
- [x] File validation (size, type, count)
- [x] Remove file from preview
- [x] Error toast notifications
- [x] Auto-focus input after file selection
- [x] Mobile responsive
- [x] Dark mode support
- [x] Accessibility (keyboard, screen reader, ARIA)

### ❌ WON'T DO (Phase 2 - Later)

- [ ] Upload API integration
- [ ] Upload progress indicator
- [ ] Drag & drop files
- [ ] Image preview modal
- [ ] Retry failed uploads
- [ ] Server-side validation
- [ ] File compression

---

## 📁 File Structure

```
src/
├── components/
│   └── FilePreview.tsx                      # 🆕 File preview component
├── hooks/
│   └── useFileValidation.ts                 # 🆕 Validation hook
├── utils/
│   ├── fileValidation.ts                    # 🆕 Validation utilities
│   └── fileHelpers.ts                       # 🆕 File helper functions
├── features/portal/components/
│   └── ChatMainContainer.tsx                # ✏️ Modify: Add upload UI
└── types/
    └── files.ts                             # 🆕 File-related types
```

---

## 🔨 Implementation Steps

### STEP 1: Create Types (15 min)

**File:** `src/types/files.ts`

**Nội dung:**

```typescript
/**
 * File-related types for file upload feature
 * Phase 1: UI only, no API integration
 */

export interface SelectedFile {
  file: File;
  id: string; // Unique ID for React key
  preview?: string; // For image preview (Phase 2)
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationRules {
  maxSize: number; // Max file size in bytes
  maxFiles: number; // Max number of files
  allowedTypes: string[]; // MIME types allowed
}

// Default validation rules
export const DEFAULT_FILE_RULES: FileValidationRules = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedTypes: [
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
};

// File type categories
export const FILE_CATEGORIES = {
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  SPREADSHEET: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;
```

**Testing:**

- [ ] Types compile without errors
- [ ] DEFAULT_FILE_RULES values match requirements

---

### STEP 2: Create File Helpers (30 min)

**File:** `src/utils/fileHelpers.ts`

**Nội dung:**

```typescript
/**
 * File helper utilities
 */

import type { SelectedFile } from "@/types/files";

/**
 * Format file size to human-readable string
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file icon based on MIME type
 * @param mimeType MIME type of the file
 * @returns Emoji icon
 */
export function getFileIcon(mimeType: string): string {
  const iconMap: Record<string, string> = {
    // PDFs
    "application/pdf": "📄",

    // Excel
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
    "application/vnd.ms-excel": "📊",

    // Word
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "📝",
    "application/msword": "📝",

    // Images
    "image/jpeg": "🖼️",
    "image/png": "🖼️",
    "image/gif": "🖼️",
    "image/webp": "🖼️",
  };

  return iconMap[mimeType] || "📎";
}

/**
 * Truncate filename if too long
 * @param filename Original filename
 * @param maxLength Max length (default: 40 for desktop, 25 for mobile)
 * @returns Truncated filename with extension preserved
 */
export function truncateFilename(
  filename: string,
  maxLength: number = 40
): string {
  if (filename.length <= maxLength) return filename;

  const extensionIndex = filename.lastIndexOf(".");
  const extension = extensionIndex > -1 ? filename.slice(extensionIndex) : "";
  const name =
    extensionIndex > -1 ? filename.slice(0, extensionIndex) : filename;

  const availableLength = maxLength - extension.length - 3; // -3 for "..."

  if (availableLength <= 0) return filename.slice(0, maxLength);

  return `${name.slice(0, availableLength)}...${extension}`;
}

/**
 * Generate unique ID for file
 * @param file File object
 * @returns Unique ID string
 */
export function generateFileId(file: File): string {
  return `${file.name}-${file.size}-${Date.now()}`;
}

/**
 * Convert File array to SelectedFile array
 * @param files File array from input
 * @returns SelectedFile array with IDs
 */
export function filesToSelectedFiles(files: File[]): SelectedFile[] {
  return files.map((file) => ({
    file,
    id: generateFileId(file),
  }));
}
```

**Testing:**

- [ ] `formatFileSize(2621440)` returns "2.5 MB"
- [ ] `getFileIcon('application/pdf')` returns "📄"
- [ ] `truncateFilename('very-long-filename-that-exceeds-limit.pdf', 30)` truncates correctly
- [ ] `generateFileId(file)` returns unique IDs for same file

---

### STEP 3: Create Validation Utilities (45 min)

**File:** `src/utils/fileValidation.ts`

**Nội dung:**

```typescript
/**
 * File validation utilities
 */

import type { FileValidationResult, FileValidationRules } from "@/types/files";
import { DEFAULT_FILE_RULES } from "@/types/files";

/**
 * Validate file size
 * @param file File to validate
 * @param maxSize Max size in bytes
 * @returns Validation result
 */
export function validateFileSize(
  file: File,
  maxSize: number = DEFAULT_FILE_RULES.maxSize
): FileValidationResult {
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File quá lớn: ${file.name} (${formatBytes(
        file.size
      )}). Kích thước tối đa: ${formatBytes(maxSize)}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate file type
 * @param file File to validate
 * @param allowedTypes Allowed MIME types
 * @returns Validation result
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = DEFAULT_FILE_RULES.allowedTypes
): FileValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Định dạng không hỗ trợ: ${file.name}. Chỉ chấp nhận: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, WEBP`,
    };
  }

  return { isValid: true };
}

/**
 * Validate file count
 * @param currentCount Current number of files
 * @param newCount Number of files to add
 * @param maxFiles Max files allowed
 * @returns Validation result
 */
export function validateFileCount(
  currentCount: number,
  newCount: number,
  maxFiles: number = DEFAULT_FILE_RULES.maxFiles
): FileValidationResult {
  const totalCount = currentCount + newCount;

  if (totalCount > maxFiles) {
    return {
      isValid: false,
      error: `Quá nhiều file. Chỉ có thể đính kèm tối đa ${maxFiles} files. Bạn đang chọn ${totalCount} files.`,
    };
  }

  return { isValid: true };
}

/**
 * Validate single file (size + type)
 * @param file File to validate
 * @param rules Validation rules
 * @returns Validation result
 */
export function validateFile(
  file: File,
  rules: FileValidationRules = DEFAULT_FILE_RULES
): FileValidationResult {
  // Validate size
  const sizeResult = validateFileSize(file, rules.maxSize);
  if (!sizeResult.isValid) return sizeResult;

  // Validate type
  const typeResult = validateFileType(file, rules.allowedTypes);
  if (!typeResult.isValid) return typeResult;

  return { isValid: true };
}

/**
 * Validate multiple files
 * @param files Files to validate
 * @param currentCount Current file count
 * @param rules Validation rules
 * @returns Array of validation results
 */
export function validateFiles(
  files: File[],
  currentCount: number = 0,
  rules: FileValidationRules = DEFAULT_FILE_RULES
): FileValidationResult[] {
  // Validate count first
  const countResult = validateFileCount(
    currentCount,
    files.length,
    rules.maxFiles
  );
  if (!countResult.isValid) {
    return [countResult]; // Return early if count exceeds
  }

  // Validate each file
  return files.map((file) => validateFile(file, rules));
}

// Helper: Format bytes (internal use)
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

**Testing:**

- [ ] `validateFileSize(11MB file)` returns invalid with error
- [ ] `validateFileType(.exe file)` returns invalid with error
- [ ] `validateFileCount(3, 3, 5)` returns invalid (exceeds 5)
- [ ] `validateFile(valid file)` returns `{ isValid: true }`
- [ ] `validateFiles([file1, file2])` validates all files

---

### STEP 4: Create Validation Hook (30 min)

**File:** `src/hooks/useFileValidation.ts`

**Nội dung:**

```typescript
/**
 * Hook for file validation with toast notifications
 */

import { useCallback } from "react";
import { toast } from "sonner"; // TODO: Confirm toast library
import { validateFiles } from "@/utils/fileValidation";
import type { FileValidationRules } from "@/types/files";
import { DEFAULT_FILE_RULES } from "@/types/files";

interface UseFileValidationReturn {
  validateAndNotify: (files: File[], currentCount: number) => File[];
}

/**
 * Hook for validating files with toast notifications
 * @param rules Validation rules (optional, uses defaults)
 * @returns Validation function
 */
export function useFileValidation(
  rules: FileValidationRules = DEFAULT_FILE_RULES
): UseFileValidationReturn {
  const validateAndNotify = useCallback(
    (files: File[], currentCount: number = 0): File[] => {
      const results = validateFiles(files, currentCount, rules);
      const validFiles: File[] = [];

      results.forEach((result, index) => {
        if (result.isValid) {
          validFiles.push(files[index]);
        } else if (result.error) {
          // Show error toast
          toast.error("File không hợp lệ", {
            description: result.error,
            duration: 5000,
          });
        }
      });

      return validFiles;
    },
    [rules]
  );

  return { validateAndNotify };
}
```

**Testing:**

- [ ] Hook validates files correctly
- [ ] Toast shown for invalid files
- [ ] Returns only valid files

---

### STEP 5: Create FilePreview Component (60 min)

**File:** `src/components/FilePreview.tsx`

**Nội dung:**

```typescript
/**
 * FilePreview component - Display selected files before sending
 */

import React from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import {
  formatFileSize,
  getFileIcon,
  truncateFilename,
} from "@/utils/fileHelpers";
import type { SelectedFile } from "@/types/files";

interface FilePreviewProps {
  files: SelectedFile[];
  onRemove: (id: string) => void;
  isMobile?: boolean;
}

export function FilePreview({
  files,
  onRemove,
  isMobile = false,
}: FilePreviewProps) {
  if (files.length === 0) return null;

  const maxFilenameLength = isMobile ? 25 : 40;

  return (
    <div
      className="border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
      data-testid="file-preview"
    >
      {/* Header */}
      <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Đính kèm file ({files.length}):
      </div>

      {/* File list */}
      <div
        className="space-y-2"
        role="list"
        aria-label={`${files.length} file đã chọn`}
      >
        {files.map((selectedFile, index) => {
          const { file, id } = selectedFile;

          return (
            <div
              key={id}
              role="listitem"
              className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-900"
              data-testid={`file-preview-item-${index}`}
            >
              {/* File icon */}
              <div className="flex-shrink-0 text-2xl" aria-hidden="true">
                {getFileIcon(file.type)}
              </div>

              {/* File info */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {truncateFilename(file.name, maxFilenameLength)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </div>
              </div>

              {/* Remove button */}
              <IconButton
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900 dark:hover:text-red-400"
                onClick={() => onRemove(id)}
                aria-label={`Xóa ${file.name}`}
                data-testid={`remove-file-${index}`}
              >
                <X className="h-4 w-4" />
              </IconButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Testing:**

- [ ] Component renders with files
- [ ] Component returns null when no files
- [ ] Remove button calls onRemove with correct ID
- [ ] Mobile mode truncates filename to 25 chars
- [ ] Desktop mode truncates to 40 chars
- [ ] Dark mode classes apply correctly
- [ ] Icons display based on file type

---

### STEP 6: Modify ChatMainContainer (90 min)

**File:** `src/features/portal/components/ChatMainContainer.tsx`

**Changes:**

1. **Add imports:**

```typescript
import { Paperclip, ImageUp } from "lucide-react";
import { FilePreview } from "@/components/FilePreview";
import { useFileValidation } from "@/hooks/useFileValidation";
import { filesToSelectedFiles } from "@/utils/fileHelpers";
import type { SelectedFile } from "@/types/files";
```

2. **Add state:**

```typescript
const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
const fileInputRef = useRef<HTMLInputElement>(null);
const imageInputRef = useRef<HTMLInputElement>(null);
```

3. **Add validation hook:**

```typescript
const { validateAndNotify } = useFileValidation();
```

4. **Add file change handlers:**

```typescript
const handleFileChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles = validateAndNotify(files, selectedFiles.length);

    // Add valid files to state
    if (validFiles.length > 0) {
      const newSelectedFiles = filesToSelectedFiles(validFiles);
      setSelectedFiles((prev) => [...prev, ...newSelectedFiles]);

      // Auto-focus input (0ms delay)
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }

    // Reset input
    e.target.value = "";
  },
  [selectedFiles.length, validateAndNotify]
);

const handleImageChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    // Same as handleFileChange
    handleFileChange(e);
  },
  [handleFileChange]
);

const handleRemoveFile = useCallback((id: string) => {
  setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
}, []);
```

5. **Clear files after send:**

```typescript
// In handleSend function, after successful send:
setSelectedFiles([]); // Clear files
```

6. **Add upload buttons in JSX:**

```tsx
{
  /* Input container */
}
<div className="flex items-end gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
  {/* Upload buttons */}
  <div className="flex gap-2">
    {/* File button */}
    <IconButton
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600"
      onClick={() => fileInputRef.current?.click()}
      disabled={isSending}
      aria-label="Đính kèm file"
      data-testid="attach-file-button"
    >
      <Paperclip className="h-5 w-5" />
    </IconButton>

    {/* Image button */}
    <IconButton
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600"
      onClick={() => imageInputRef.current?.click()}
      disabled={isSending}
      aria-label="Đính kèm ảnh"
      data-testid="attach-image-button"
    >
      <ImageUp className="h-5 w-5" />
    </IconButton>
  </div>

  {/* Textarea */}
  <textarea
    ref={textareaRef}
    // ... existing props
  />

  {/* Send button */}
  {/* ... existing send button */}

  {/* Hidden file inputs */}
  <input
    type="file"
    ref={fileInputRef}
    accept=".pdf,.doc,.docx,.xls,.xlsx"
    multiple
    style={{ display: "none" }}
    onChange={handleFileChange}
    data-testid="file-input"
  />

  <input
    type="file"
    ref={imageInputRef}
    accept="image/jpeg,image/png,image/gif,image/webp"
    multiple
    style={{ display: "none" }}
    onChange={handleImageChange}
    data-testid="image-input"
  />
</div>;
```

7. **Add FilePreview above input:**

```tsx
{
  /* File preview (above input) */
}
{
  selectedFiles.length > 0 && (
    <FilePreview
      files={selectedFiles}
      onRemove={handleRemoveFile}
      isMobile={isMobile}
    />
  );
}

{
  /* Input container */
}
{
  /* ... existing input */
}
```

**Testing:**

- [ ] File button opens file picker
- [ ] Image button opens image picker
- [ ] Selected files show in preview
- [ ] Remove button removes file from preview
- [ ] Validation shows error toasts
- [ ] Max 5 files enforced
- [ ] Auto-focus works after file selection
- [ ] Files cleared after send message

---

## 🧪 Testing Checklist

### Unit Tests

**fileHelpers.test.ts:**

- [ ] formatFileSize formats correctly
- [ ] getFileIcon returns correct icons
- [ ] truncateFilename preserves extension
- [ ] generateFileId creates unique IDs

**fileValidation.test.ts:**

- [ ] validateFileSize rejects files > 10MB
- [ ] validateFileType rejects .exe files
- [ ] validateFileCount rejects > 5 files
- [ ] validateFile validates size + type
- [ ] validateFiles validates array

**useFileValidation.test.ts:**

- [ ] Hook validates files
- [ ] Hook shows toasts for errors
- [ ] Hook returns only valid files

**FilePreview.test.tsx:**

- [ ] Renders with files
- [ ] Returns null when empty
- [ ] Remove button works
- [ ] Mobile/desktop modes work
- [ ] Dark mode classes apply

### Integration Tests

**ChatMainContainer integration:**

- [ ] Click file button → file picker opens
- [ ] Select files → preview shows
- [ ] Remove file → file removed
- [ ] Validate size → error toast
- [ ] Validate type → error toast
- [ ] Max files → error toast
- [ ] Auto-focus after selection
- [ ] Clear files after send

### E2E Tests (Playwright)

```typescript
test("File upload UI flow", async ({ page }) => {
  // 1. Navigate to chat
  await page.goto("/workspace");
  await page.click('[data-testid="conversation-item-1"]');

  // 2. Click file button
  await page.click('[data-testid="attach-file-button"]');

  // 3. Select file (mock)
  const fileInput = page.locator('[data-testid="file-input"]');
  await fileInput.setInputFiles("test-files/report.pdf");

  // 4. Verify preview shows
  await expect(page.locator('[data-testid="file-preview"]')).toBeVisible();
  await expect(page.locator("text=report.pdf")).toBeVisible();

  // 5. Remove file
  await page.click('[data-testid="remove-file-0"]');
  await expect(page.locator('[data-testid="file-preview"]')).not.toBeVisible();
});

test("File validation - size exceeds", async ({ page }) => {
  // Select 11MB file
  // Expect error toast
  await expect(page.locator("text=File quá lớn")).toBeVisible();
});

test("File validation - invalid type", async ({ page }) => {
  // Select .exe file
  // Expect error toast
  await expect(page.locator("text=Định dạng không hỗ trợ")).toBeVisible();
});
```

---

## 📦 Dependencies

**Existing (No new dependencies needed):**

- ✅ `lucide-react` - Icons (Paperclip, ImageUp, X)
- ✅ `sonner` or `react-hot-toast` - Toast notifications (confirm which one)
- ✅ `@/components/ui/icon-button` - Button component

**To confirm:**

- [ ] Toast library: `sonner` or `react-hot-toast`? (Update imports accordingly)

---

## ⏱️ Time Estimation

| Task                          | Time (min)                | Priority |
| ----------------------------- | ------------------------- | -------- |
| STEP 1: Types                 | 15                        | HIGH     |
| STEP 2: File helpers          | 30                        | HIGH     |
| STEP 3: Validation utilities  | 45                        | HIGH     |
| STEP 4: Validation hook       | 30                        | HIGH     |
| STEP 5: FilePreview component | 60                        | HIGH     |
| STEP 6: ChatMainContainer     | 90                        | HIGH     |
| Unit tests                    | 60                        | MEDIUM   |
| Integration tests             | 45                        | MEDIUM   |
| E2E tests                     | 30                        | LOW      |
| **Total:**                    | **405 min (~6.75 hours)** |          |

---

## 🚀 Deployment Checklist

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass (optional)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Mobile responsive verified
- [ ] Dark mode verified
- [ ] Accessibility tested (keyboard, screen reader)
- [ ] Code review completed
- [ ] Documentation updated

---

## 📝 Implementation Notes

### Important Reminders

1. **NO API calls** - This is UI only phase
2. **DO NOT mock upload** - No fake upload progress or success states
3. **Files stored in state only** - `useState<SelectedFile[]>`
4. **Clear files after send** - User expectation
5. **Toast library** - Confirm `sonner` vs `react-hot-toast` before starting
6. **Auto-focus timing** - 0ms delay (immediate)
7. **File input reset** - `e.target.value = ''` after each selection

### Edge Cases to Handle

- [ ] User selects same file twice → Allow (each has unique ID)
- [ ] User selects files then closes picker → No files added (expected)
- [ ] User removes all files → Preview disappears (expected)
- [ ] User selects 3 files, then 3 more → Show error "max 5 files"
- [ ] Large filename (>40 chars) → Truncate with ellipsis
- [ ] Mobile keyboard open → Layout should not break

---

## ⏳ PENDING IMPLEMENTATION DECISIONS

| #   | Decision             | Options                    | HUMAN Input     |
| --- | -------------------- | -------------------------- | --------------- |
| 1   | Toast library        | sonner / react-hot-toast   | ✅ **sonner**   |
| 2   | FilePreview location | Separate file or inline?   | ✅ **separate** |
| 3   | Animation approach   | CSS only or framer-motion? | ✅ **CSS only** |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                       | Status          |
| ------------------------------ | --------------- |
| Đã review implementation steps | ✅ Đã review    |
| Đã review time estimation      | ✅ Đã review    |
| Đã review testing checklist    | ✅ Đã review    |
| Đã điền Pending Decisions      | ✅ Đã điền      |
| **APPROVED để bắt đầu code**   | ✅ **APPROVED** |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-06

> ✅ **APPROVED: AI có thể bắt đầu code**

---

## 📝 Change Log

| Date       | Version | Changes                             |
| ---------- | ------- | ----------------------------------- |
| 2026-01-06 | 1.0.0   | Initial implementation plan created |

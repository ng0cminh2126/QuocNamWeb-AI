# [BƯỚC 2A] Wireframe - File Upload

> **Feature:** Upload File & Image trong Chat  
> **Version:** 1.0.0  
> **Status:** ⏳ PENDING APPROVAL  
> **Created:** 2026-01-06  
> **Module:** chat  
> **Scope:** UI Only - No API Integration

---

## 📋 Wireframe Overview

Document này chứa wireframes chi tiết cho file upload UI. **LÚU Ý: Phase 1 chỉ làm UI, KHÔNG implement upload API.**

---

## WF-01: Upload Buttons (Desktop)

### Layout trong ChatMainContainer

```
┌──────────────────────────────────────────────────────────────────┐
│ [←] [Avatar] Tên nhóm/người                         [⋯] [Panel] │ Header
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ────────── Hôm nay ──────────                                   │
│                                                                  │
│        ┌──────────────────┐                                      │
│        │ Message received │ [12:30]                              │
│        └──────────────────┘                                      │
│                                                                  │
│                  ┌──────────────────┐                            │
│       [12:35]    │ Message sent     │                            │
│                  └──────────────────┘                            │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ [📎] [🖼️] │ Nhập tin nhắn... (auto-focus)       │ [Send]        │ Input
│  ↑    ↑                                                          │
│  │    └─ Image button                                           │
│  └─ File button                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Button Specifications

**File Button (📎 Paperclip):**

```tsx
<IconButton
  variant="ghost"
  size="icon"
  className="h-9 w-9 text-gray-600 hover:bg-gray-100 active:bg-gray-200"
  aria-label="Đính kèm file"
  data-testid="attach-file-button"
  onClick={() => fileInputRef.current?.click()}
  disabled={isSending}
>
  <Paperclip className="h-5 w-5" />
</IconButton>
```

**Image Button (🖼️ ImageUp):**

```tsx
<IconButton
  variant="ghost"
  size="icon"
  className="h-9 w-9 text-gray-600 hover:bg-gray-100 active:bg-gray-200"
  aria-label="Đính kèm ảnh"
  data-testid="attach-image-button"
  onClick={() => imageInputRef.current?.click()}
  disabled={isSending}
>
  <ImageUp className="h-5 w-5" />
</IconButton>
```

**Hidden File Inputs:**

```tsx
{
  /* File input */
}
<input
  type="file"
  ref={fileInputRef}
  accept=".pdf,.doc,.docx,.xls,.xlsx"
  multiple
  style={{ display: "none" }}
  onChange={handleFileChange}
  data-testid="file-input"
/>;

{
  /* Image input */
}
<input
  type="file"
  ref={imageInputRef}
  accept="image/jpeg,image/png,image/gif,image/webp"
  multiple
  style={{ display: "none" }}
  onChange={handleImageChange}
  data-testid="image-input"
/>;
```

### Spacing & Alignment

```
Container: flex items-end gap-2

[📎]  [🖼️]     [Textarea]     [Send]
 ↑     ↑           ↑            ↑
 9px   9px      flex-1         9px
       ← 8px gap →
```

**CSS:**

```css
.input-container {
  display: flex;
  align-items: end;
  gap: 0.5rem; /* 8px */
  padding: 1rem;
  border-top: 1px solid rgb(229, 231, 235); /* gray-200 */
}

.upload-buttons {
  display: flex;
  gap: 0.5rem; /* 8px */
}
```

---

## WF-02: File Preview Component

### When Files Selected

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Đính kèm file (2):                                         │  │
│ │ ┌────────────────────────────────────────────────────────┐ │  │
│ │ │ 📄  Báo cáo tháng 12.pdf           2.5 MB        [❌]  │ │  │
│ │ └────────────────────────────────────────────────────────┘ │  │
│ │ ┌────────────────────────────────────────────────────────┐ │  │
│ │ │ 📊  Dữ liệu khách hàng.xlsx        1.2 MB        [❌]  │ │  │
│ │ └────────────────────────────────────────────────────────┘ │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ [📎] [🖼️] │ Thêm ghi chú...                      │ [Gửi]        │
└──────────────────────────────────────────────────────────────────┘
```

### FilePreview Component Structure

```tsx
<div className="border-t border-gray-200 bg-gray-50 p-3">
  {/* Header */}
  <div className="mb-2 text-sm font-medium text-gray-700">
    Đính kèm file ({files.length}):
  </div>

  {/* File list */}
  <div className="space-y-2">
    {files.map((file, index) => (
      <FilePreviewItem
        key={index}
        file={file}
        onRemove={() => handleRemoveFile(index)}
      />
    ))}
  </div>
</div>
```

### FilePreviewItem Component

```
┌────────────────────────────────────────────────────────────┐
│ [Icon] Filename.ext                        Size      [❌]  │
│  32px   ← flex-1, text-sm, truncate →    text-xs    24px  │
└────────────────────────────────────────────────────────────┘

Height: auto (min-h-12)
Padding: p-3 (12px all sides)
Background: bg-gray-50 (light mode), bg-gray-800 (dark mode)
Border: rounded-lg
Gap: gap-3 (12px between elements)
```

**Component Code:**

```tsx
<div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
  {/* File icon */}
  <div className="flex-shrink-0 text-2xl" aria-hidden="true">
    {getFileIcon(file.type)}
  </div>

  {/* File info */}
  <div className="flex-1 min-w-0">
    <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
      {file.name}
    </div>
    <div className="text-xs text-gray-500 dark:text-gray-400">
      {formatFileSize(file.size)}
    </div>
  </div>

  {/* Remove button */}
  <IconButton
    variant="ghost"
    size="icon"
    className="h-6 w-6 flex-shrink-0 text-gray-500 hover:bg-red-100 hover:text-red-600"
    onClick={onRemove}
    aria-label="Xóa file"
    data-testid={`remove-file-${index}`}
  >
    <X className="h-4 w-4" />
  </IconButton>
</div>
```

### File Type Icons

```tsx
const FILE_ICONS: Record<string, string> = {
  // PDFs
  "application/pdf": "📄",

  // Excel
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊", // .xlsx
  "application/vnd.ms-excel": "📊", // .xls

  // Word
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "📝", // .docx
  "application/msword": "📝", // .doc

  // Images
  "image/jpeg": "🖼️",
  "image/png": "🖼️",
  "image/gif": "🖼️",
  "image/webp": "🖼️",

  // Default
  default: "📎",
};

function getFileIcon(mimeType: string): string {
  return FILE_ICONS[mimeType] || FILE_ICONS.default;
}
```

---

## WF-03: Error States

### Error Toast - File Too Large

```
┌────────────────────────────────────────────────┐
│ ⚠️  File quá lớn                              │
│                                                │
│ report.pdf (15 MB) vượt quá giới hạn 10 MB    │
│                                         [Đóng] │
└────────────────────────────────────────────────┘

Position: top-right
Auto-dismiss: 5 seconds
Type: error (red background)
```

**Toast Component:**

```tsx
toast.error("File quá lớn", {
  description: `${file.name} (${formatFileSize(
    file.size
  )}) vượt quá giới hạn ${formatFileSize(MAX_FILE_SIZE)}`,
  duration: 5000,
});
```

### Error Toast - Invalid File Type

```
┌────────────────────────────────────────────────┐
│ ⚠️  Định dạng không hỗ trợ                    │
│                                                │
│ virus.exe                                      │
│ Chỉ chấp nhận: PDF, DOC, DOCX, XLS, XLSX,     │
│ JPG, PNG, GIF, WEBP                            │
│                                         [Đóng] │
└────────────────────────────────────────────────┘

Position: top-right
Auto-dismiss: 5 seconds
Type: error (red background)
```

**Toast Component:**

```tsx
toast.error("Định dạng không hỗ trợ", {
  description: `${file.name}\nChỉ chấp nhận: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, WEBP`,
  duration: 5000,
});
```

### Error Toast - Too Many Files

```
┌────────────────────────────────────────────────┐
│ ⚠️  Quá nhiều file                            │
│                                                │
│ Chỉ có thể đính kèm tối đa 5 files.           │
│ Bạn đã chọn 7 files.                          │
│                                         [Đóng] │
└────────────────────────────────────────────────┘

Position: top-right
Auto-dismiss: 5 seconds
Type: error (red background)
```

**Toast Component:**

```tsx
toast.error("Quá nhiều file", {
  description: `Chỉ có thể đính kèm tối đa ${MAX_FILES} files.\nBạn đã chọn ${selectedFiles.length} files.`,
  duration: 5000,
});
```

---

## WF-04: Mobile Layout

### Upload Buttons (Mobile)

```
┌──────────────────────────────────────┐
│ [←] Tên nhóm              [⋯]       │ Header (compact)
├──────────────────────────────────────┤
│                                      │
│  ───── Hôm nay ─────                │
│                                      │
│   ┌───────────┐                     │
│   │ Message   │ [12:30]             │
│   └───────────┘                     │
│                                      │
├──────────────────────────────────────┤
│ [📎][🖼️] │ Nhập...     │ [→]       │ Input (compact)
│ 32px 32px  flex-1      32px         │
└──────────────────────────────────────┘
```

**Button Specs (Mobile):**

- Size: `h-8 w-8` (32×32px) instead of 36×36
- Icon: `h-4 w-4` instead of h-5 w-5
- Gap: 6px instead of 8px

### File Preview (Mobile)

```
┌──────────────────────────────────────┐
│ Đính kèm (2):                        │
│ ┌──────────────────────────────────┐ │
│ │ 📄 Báo cáo...pdf   2.5MB   [❌] │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ 📊 Dữ liệu...xlsx  1.2MB   [❌] │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘

Filename truncate: 25 chars instead of 40
Font size: text-xs instead of text-sm
Padding: p-2 instead of p-3
```

---

## WF-05: Dark Mode

### Upload Buttons (Dark)

```css
/* File/Image buttons */
.upload-button-dark {
  color: rgb(156, 163, 175); /* gray-400 */
  background: transparent;
}

.upload-button-dark:hover {
  background: rgb(55, 65, 81); /* gray-700 */
}

.upload-button-dark:active {
  background: rgb(75, 85, 99); /* gray-600 */
}
```

### File Preview (Dark)

```
┌──────────────────────────────────────────────────────────────────┐
│ Đính kèm file (2):                    ← text-gray-300            │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ 📄  Báo cáo tháng 12.pdf           2.5 MB        [❌]      │  │
│ │     ↑ text-gray-100                 ↑ text-gray-400        │  │
│ │     bg-gray-800                                            │  │
│ └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

Background: bg-gray-800 instead of bg-gray-50
Border: border-gray-700 instead of border-gray-200
Filename: text-gray-100 instead of text-gray-900
File size: text-gray-400 instead of text-gray-500
```

**Dark Mode Classes:**

```tsx
<div className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
  <div className="text-gray-900 dark:text-gray-100">{file.name}</div>
  <div className="text-gray-500 dark:text-gray-400">
    {formatFileSize(file.size)}
  </div>
</div>
```

---

## WF-06: Animation States

### File Selection Animation

```
User clicks file button
  ↓
File picker opens (native)
  ↓
User selects files
  ↓
File preview appears (slide down, 200ms ease-out)
  ↓
Auto-focus input (0ms, immediate)
```

**Animation CSS:**

```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-preview-enter {
  animation: slideDown 200ms ease-out;
}
```

### File Removal Animation

```
User clicks remove button
  ↓
File item fades out (150ms ease-in)
  ↓
File removed from list
  ↓
Remaining items re-arrange (smooth transition)
```

**Animation CSS:**

```css
@keyframes fadeOut {
  from {
    opacity: 1;
    height: auto;
  }
  to {
    opacity: 0;
    height: 0;
  }
}

.file-preview-exit {
  animation: fadeOut 150ms ease-in;
}
```

---

## 🎨 Design Tokens

### Colors

```tsx
const COLORS = {
  // Light mode
  light: {
    button: {
      text: "text-gray-600",
      hover: "hover:bg-gray-100",
      active: "active:bg-gray-200",
    },
    preview: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      filename: "text-gray-900",
      filesize: "text-gray-500",
      header: "text-gray-700",
    },
    remove: {
      hover: "hover:bg-red-100 hover:text-red-600",
    },
  },

  // Dark mode
  dark: {
    button: {
      text: "dark:text-gray-400",
      hover: "dark:hover:bg-gray-700",
      active: "dark:active:bg-gray-600",
    },
    preview: {
      bg: "dark:bg-gray-800",
      border: "dark:border-gray-700",
      filename: "dark:text-gray-100",
      filesize: "dark:text-gray-400",
      header: "dark:text-gray-300",
    },
    remove: {
      hover: "dark:hover:bg-red-900 dark:hover:text-red-400",
    },
  },
};
```

### Spacing

```tsx
const SPACING = {
  buttonSize: {
    desktop: "h-9 w-9", // 36×36px
    mobile: "h-8 w-8", // 32×32px
  },
  iconSize: {
    desktop: "h-5 w-5", // 20×20px
    mobile: "h-4 w-4", // 16×16px
  },
  gap: {
    buttons: "gap-2", // 8px
    preview: "gap-3", // 12px
  },
  padding: {
    container: "p-4", // 16px
    preview: "p-3", // 12px
    previewMobile: "p-2", // 8px
  },
  borderRadius: "rounded-lg", // 8px
};
```

### Typography

```tsx
const TYPOGRAPHY = {
  preview: {
    header: "text-sm font-medium",
    filename: {
      desktop: "text-sm font-medium",
      mobile: "text-xs font-medium",
    },
    filesize: {
      desktop: "text-xs",
      mobile: "text-xs",
    },
  },
  truncate: {
    desktop: 40, // chars
    mobile: 25, // chars
  },
};
```

---

## 📏 Accessibility

### Keyboard Navigation

```
Tab order:
1. File button (📎)
2. Image button (🖼️)
3. Textarea
4. Send button
5. Remove buttons (nếu có files)

Keyboard actions:
- Enter/Space on file button → Open file picker
- Enter/Space on image button → Open image picker
- Enter/Space on remove button → Remove file
- Esc in file picker → Cancel selection
```

### Screen Reader

```tsx
// File button
<IconButton aria-label="Đính kèm file. Nhấn để chọn files PDF, Word, hoặc Excel">
  <Paperclip />
</IconButton>

// Image button
<IconButton aria-label="Đính kèm ảnh. Nhấn để chọn ảnh JPG, PNG, GIF, hoặc WebP">
  <ImageUp />
</IconButton>

// File preview
<div role="list" aria-label={`${files.length} file đã chọn`}>
  {files.map((file, index) => (
    <div key={index} role="listitem">
      <span className="sr-only">File {index + 1}:</span>
      {file.name}, {formatFileSize(file.size)}
      <button aria-label={`Xóa ${file.name}`}>
        <X />
      </button>
    </div>
  ))}
</div>
```

### ARIA Labels

```tsx
const ARIA_LABELS = {
  fileButton: "Đính kèm file",
  imageButton: "Đính kèm ảnh",
  fileInput: "Chọn files để đính kèm",
  imageInput: "Chọn ảnh để đính kèm",
  removeButton: (filename: string) => `Xóa ${filename}`,
  preview: (count: number) => `${count} file đã chọn`,
};
```

---

## 🧪 UI States Summary

| State           | UI Behavior                                  | data-testid              |
| --------------- | -------------------------------------------- | ------------------------ |
| Initial         | Buttons enabled, no preview                  | `attach-file-button`     |
| Files selected  | Preview visible, buttons enabled             | `file-preview`           |
| Max files (5)   | Buttons enabled, show warning if select more | `file-preview-max`       |
| Sending message | Buttons disabled, preview visible            | `attach-button-disabled` |
| Error (size)    | Toast notification, file not added           | (toast library)          |
| Error (type)    | Toast notification, file not added           | (toast library)          |
| Mobile view     | Smaller buttons, truncated filenames         | `mobile-file-preview`    |
| Dark mode       | Dark color scheme                            | (CSS classes)            |

---

## 📝 Implementation Notes

1. **NO API calls** - Phase 1 chỉ làm UI, không upload thật
2. **File state** - Lưu selected files trong component state (React useState)
3. **Validation** - Client-side validation only (size, type, count)
4. **Toast notifications** - Dùng existing toast system trong project
5. **Icons** - Dùng lucide-react (Paperclip, ImageUp, X icons)
6. **Auto-focus** - Focus input sau khi select files (0ms delay)
7. **Remove files** - User có thể remove files khỏi preview bất kỳ lúc nào

---

## ⏳ PENDING IMPLEMENTATION DECISIONS

| #   | Decision                 | Options                              | HUMAN Input                           |
| --- | ------------------------ | ------------------------------------ | ------------------------------------- |
| 1   | Toast library            | sonner / react-hot-toast / existing? | ⬜ ****\_\_\_****                     |
| 2   | FilePreview as component | Separate file or inline?             | ⬜ ****\_\_\_**** (đề xuất: separate) |
| 3   | Animation library        | CSS only or framer-motion?           | ⬜ ****\_\_\_**** (đề xuất: CSS only) |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                                | Status           |
| --------------------------------------- | ---------------- |
| Đã review wireframes (WF-01 to WF-06)   | ⬜ Chưa review   |
| Đã review design tokens                 | ⬜ Chưa review   |
| Đã review accessibility specs           | ⬜ Chưa review   |
| Đã điền Pending Decisions               | ⬜ Chưa điền     |
| **APPROVED để tạo implementation plan** | ⬜ CHƯA APPROVED |

**HUMAN Signature:** ******\_\_\_******  
**Date:** ******\_\_\_******

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tạo implementation plan nếu chưa APPROVED**

---

## 📝 Change Log

| Date       | Version | Changes                   |
| ---------- | ------- | ------------------------- |
| 2026-01-06 | 1.0.0   | Initial wireframe created |

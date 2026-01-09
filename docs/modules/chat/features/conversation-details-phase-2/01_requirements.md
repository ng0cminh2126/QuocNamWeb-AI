# [BƯỚC 1] Feature Requirements - Image Message Display with Preview

> **Module:** Chat  
> **Feature:** Image & File Message Display (Phase 2 Enhancement)  
> **Version:** 2.2 (Updated - File attachment display)  
> **Status:** ⏳ PENDING - Chờ HUMAN approval v2.2  
> **Created:** 2026-01-08  
> **Last Updated:** 2026-01-08 (v2.2 - File attachment display requirements)  
> **Priority:** HIGH - UX Improvement + Bug Fix

---

## 📋 Overview

Nâng cấp hiển thị hình ảnh và file attachments trong tin nhắn với khả năng:

1. **Image-only messages** - Message chỉ chứa ảnh, hiển thị full width với watermark ✅ v2.0
2. **Preview popup** - Click vào ảnh → mở popup xem full size ảnh ✅ v2.0
3. **Mixed content** - Text + ảnh với padding hợp lý ✅ v2.1
4. **File attachments display** - PDF/DOC/XLS hiển thị icon + tên file ⏳ v2.2 NEW
5. **File preview modal** - Click vào file → mở modal xem/download 🔮 Phase 3 (future)

**Version History:**

| Version | Date       | Changes                                                                       |
| ------- | ---------- | ----------------------------------------------------------------------------- |
| 2.2     | 2026-01-08 | ➕ **File attachment display** (icon + filename in message bubble)            |
| 2.1     | 2026-01-08 | ➕ Mixed message padding, file icons, preview text cho image-only messages    |
| 2.0     | 2026-01-08 | ✏️ Update with HUMAN clarifications (image-only messages, full width display) |
| 1.0     | 2026-01-07 | 🆕 Initial requirements                                                       |

**Key Design Decisions:**

- ✅ Message chỉ chứa ảnh (không có text) - v2.0
- ✅ Mỗi ảnh = 1 message riêng - v2.0
- ✅ Upload chỉ 1 file tại 1 thời điểm (Phase 2 constraint) - v2.0
- ✅ Full width của message bubble cho images - v2.0
- ✅ Mixed content padding (text + image) - v2.1
- ✅ Colored file icons (PDF red, Word blue, etc.) - v2.1
- ✅ Smart preview text in conversation list - v2.1
- 🆕 **File attachments hiển thị trong message bubble với icon + tên file** - v2.2
- 🔮 **File preview modal** - Phase 3 (future, not in v2.2 scope)

---

## 🆕 What's New in v2.2

### Bug Fix: File Attachment Display Missing

**Current Problem:**

- ✗ Khi gửi file PDF, DOCX, XLSX... → tin nhắn KHÔNG hiển thị gì cả
- ✗ Chỉ có thời gian hiển thị, không có nội dung
- ✗ User không biết file gì đã được gửi
- ✗ Không có cách nào để download hoặc mở file

**Root Cause:**

- ChatMainContainer.tsx chỉ xử lý `hasImage` case
- Không có render logic cho `contentType === "FILE"` hoặc non-image attachments
- File attachments bị bỏ qua trong message bubble rendering

**Solution (v2.2):**

**1. File Display Component:**

- Reuse `FileIcon` component từ v2.1 (already has colored icons)
- Layout: `[Icon] [Filename] [Size?]`
- Click behavior: Download file (open in new tab)

**2. Spacing & Padding:**

| Case         | Text Padding | Gap   | File Padding   |
| ------------ | ------------ | ----- | -------------- |
| File only    | N/A          | N/A   | `px-4 py-3`    |
| Text + File  | `px-4 pt-2`  | `h-2` | `px-4 pb-3`    |
| Text + Image | `px-4 pt-2`  | `h-2` | (image no pad) |
| Image only   | N/A          | N/A   | (image no pad) |
| Text only    | `px-4 py-2`  | N/A   | N/A            |

**3. File Display Specs:**

```tsx
<div className="px-4 py-3 flex items-center gap-3">
  <FileIcon mimeType={file.contentType} size="md" /> {/* 20x20px */}
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-gray-900 truncate">
      {file.fileName}
    </p>
    {file.fileSize && (
      <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
    )}
  </div>
  <Download className="h-4 w-4 text-gray-400" /> {/* Download icon hint */}
</div>
```

**4. Click Behavior:**

- Phase 2 (v2.2): Click → Download file (open URL in new tab)
- Phase 3 (future): Click → Open preview modal
  - PDF: Embedded PDF viewer
  - Images: Already has ImagePreviewModal
  - Others: Download fallback

**Impact:**

- ✅ User có thể thấy file attachments trong chat
- ✅ User có thể download file bằng click
- ✅ Consistent UI với image attachments (same spacing rules)
- ✅ Reuse FileIcon component từ v2.1
- 🔮 Phase 3: File preview modal (not in v2.2 scope)

---

## 🆕 What's New in v2.1 (Already Implemented)

### 1. Mixed Content Spacing Enhancement

**Problem:** Message có cả text và ảnh → text bị sát với ảnh và viền bubble, khó đọc

**Solution:**

- Text padding trái/phải: **16px** từ viền bubble
- Text padding trên: **8px** từ viền top bubble
- Gap giữa text và ảnh: **12px** vertical spacing
- Line-height: **1.5** cho text dễ đọc hơn

**Impact:** Better readability, professional appearance, không bị sát viền

### 2. File Type Icons

**Problem:** File attachments (PDF, DOC, XLS) hiện tại chỉ có generic icon

**Solution:**

- PDF files → 📄 Red PDF icon (Lucide `FileText`)
- Word files → 📝 Blue Word icon (Lucide `FileText`)
- Excel files → 📊 Green Excel icon (Lucide `Sheet`)
- PowerPoint files → 🎨 Orange PPT icon (Lucide `Presentation`)
- Generic files → 📁 Gray file icon (Lucide `File`)

**Impact:** Easier to identify file types at a glance

### 3. Conversation List Preview Text

**Problem:** Khi message mới nhất chỉ có ảnh → preview text empty hoặc không meaningful

**Solution:**

| Message Content | Preview Text          |
| --------------- | --------------------- |
| Image only      | _"Đã gửi một ảnh"_    |
| File only (PDF) | _"Đã gửi report.pdf"_ |
| Text only       | "Hello world"         |
| Text + Image    | "Hello world"         |

**Impact:** Better UX in conversation list, users know message content without opening

---

## 🎯 Business Requirements

### BR-1: Image Message Display

**As a** user viewing chat messages  
**I want to** see image attachments as standalone messages with watermark  
**So that** I can view images clearly in the conversation flow

**Acceptance Criteria:**

- ✅ Image attachments hiển thị trong message riêng biệt (không có text)
- ✅ Ảnh hiển thị full width của message bubble với watermark
- ✅ Chỉ hiển thị ảnh (không có filename, file size, hoặc metadata)
- ✅ Non-image attachments (PDF, DOC, etc.) giữ nguyên format hiện tại (icon + name)
- ✅ Loading state hiển thị skeleton loader full width
- ✅ Error state hiển thị placeholder icon với error message
- ✅ **[v2.1]** Message có cả text và ảnh: padding của text tăng lên để không bị sát với ảnh và viền bubble
  - Text padding: 16px từ viền trái/phải, 8px từ viền trên, 12px gap với ảnh (thay vì 12px default)

### BR-2: Preview Popup trên Click

**As a** user  
**I want to** click vào ảnh trong message để xem full size  
**So that** I can see image details clearly

**Acceptance Criteria:**

- ✅ Click vào ảnh trong message → mở popup/modal full-screen
- ✅ Popup hiển thị ảnh preview với watermark (full size, optimized)
- ✅ Popup có nút close (X button, ESC key, click outside backdrop)
- ✅ Preview load on-demand (chỉ khi popup mở)
- ✅ Loading state trong popup (centered spinner)
- ✅ Error handling với retry button
- ❌ Zoom controls - Phase 3 (not in scope)

### BR-3: File Type Detection & Routing

**As a** system  
**I want to** detect file type từ contentType  
**So that** I can hiển thị ảnh watermark hoặc file attachment phù hợp

**Acceptance Criteria:**

- ✅ Image files (JPEG, PNG, GIF, WebP) → render as image message với watermark
- 🆕 **Non-image files (PDF, DOC, XLS, etc.) → render as file attachment với icon + filename** (v2.2)
- ✅ Unknown types → render as generic file attachment
- ✅ Detection dựa trên `attachment.contentType` field
- ✅ **[v2.1]** File attachments hiển thị icon riêng theo loại file (Lucide icons):
  - PDF files → Icon riêng cho PDF (red-600) - **Phải khác Word**
  - Word files (.doc, .docx) → Icon riêng cho Word (blue-600) - **Phải khác PDF**
  - Excel files (.xls, .xlsx) → `Sheet` icon (green-600) ✅ Đã khác
  - PowerPoint files (.ppt, .pptx) → `Presentation` icon (orange-600) ✅ Đã khác
  - Generic files → `File` icon (gray-600) ✅ Đã khác
  - **CRITICAL:** Mỗi loại file dùng icon KHÁC NHAU, không chỉ đổi màu
  - **v2.1 Status:** Excel/PPT/Generic OK. PDF/Word hiện dùng chung `FileText` → cần tìm icon khác
- 🆕 **[v2.2]** File attachment display trong message bubble:
  - Icon (20x20px) + filename + file size (optional)
  - **KHÔNG cho phép download** (display only) - Phase 3: preview/download
  - Click → Không có action (Phase 3 sẽ có preview modal)
  - Padding: `px-4 py-3` (file only) or `px-4 pb-3` (text + file)

**Image MIME Types Supported:**

- `image/jpeg`, `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`

**Non-Image Files (Display in Message Bubble v2.2):**

- PDF: `application/pdf`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- PowerPoint: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- All other MIME types → Generic icon

### BR-4: Conversation List Preview Text (NEW - v2.1)

**As a** user viewing conversation list  
**I want to** see meaningful preview text for image-only messages  
**So that** I know what the last message was without opening the conversation

**Acceptance Criteria:**

- ✅ Khi message mới nhất chỉ có ảnh (không có text):
  - Hiển thị text preview: **"Đã gửi một ảnh"**
  - Format: Italic text (giống system messages)
- ✅ Khi message mới nhất có text:
  - Hiển thị text content như bình thường
- ✅ Khi message mới nhất có cả text và ảnh:
  - Hiển thị text content (ưu tiên text)
- ✅ Khi message mới nhất có file attachment (non-image):
  - Hiển thị text preview: **"Đã gửi [tên file]"** hoặc **"Đã gửi một file"**
- ✅ Preview text max 50 characters, truncate với "..."

**Display Rules:**

```
Message Content             → Preview Text
─────────────────────────────────────────────
Text only                   → "Hello world"
Image only                  → "Đã gửi một ảnh"
File only (PDF)             → "Đã gửi report.pdf"
Text + Image                → "Hello world"
Text + File                 → "Hello world"
```

---

## 🎨 UI/UX Requirements

### Message Display Modes

#### Mode 1: Text-only Message (Existing)

```
┌─────────────────────────────┐
│ User Name      10:30 AM     │
│ Hello, check this out       │
└─────────────────────────────┘
```

#### Mode 2: File Attachment Message (Existing - Updated v2.1)

```
┌─────────────────────────────┐
│ User Name      10:30 AM     │
│ ┌─────────────────────────┐ │
│ │ 📄 report.pdf (1.2 MB)  │ │ ← PDF icon
│ │ [Download icon]         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📝 memo.docx (500 KB)   │ │ ← Word icon
│ │ [Download icon]         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📊 data.xlsx (2.4 MB)   │ │ ← Excel icon
│ │ [Download icon]         │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

[v2.1] Icon tương ứng loại file: PDF/DOC/XLS/PPT
```

#### Mode 3: Image-Only Message (NEW - Phase 2)

```
┌─────────────────────────────┐
│ User Name      10:30 AM     │
│ ┌───────────────────────────┐ │ ← Full width
│ │                           │ │
│ │     [Image Preview]       │ │ ← Watermarked image
│ │     with watermark        │ │
│ │                           │ │
│ └───────────────────────────┘ │
└─────────────────────────────┘

(No filename, no file size, just the image)
```

#### Mode 4: Mixed Text + Image Message (NEW - v2.1)

```
┌─────────────────────────────┐
│ User Name      10:30 AM     │
│ ↕ 8px padding top           │
│ Check out this screenshot!  │ ← Text với padding 16px L/R, 8px top
│ ↕ 12px gap                  │
│ ┌───────────────────────────┐ │
│ │                           │ │
│ │     [Image Preview]       │ │ ← Watermarked image
│ │     with watermark        │ │
│ │                           │ │
│ └───────────────────────────┘ │
│                             │ ← Ảnh flush với bottom
└─────────────────────────────┘
   ←→ 16px L/R padding

[v2.1] Text: 16px L/R padding, 8px top padding, 12px gap với ảnh
```

---

### Image Message Specifications

| Property     | Value                                              |
| ------------ | -------------------------------------------------- |
| Display Size | Full width của message bubble                      |
| API Endpoint | `/api/Files/{id}/watermarked-thumbnail?size=large` |
| Watermark    | Yes (diagonal text overlay)                        |
| Aspect Ratio | Maintain original (max 400px width)                |
| Border       | None (seamless integration)                        |
| Rounded      | 8px border-radius (match bubble)                   |
| Hover Effect | Cursor pointer, opacity 0.9                        |
| Loading      | Skeleton full width with shimmer                   |
| Error        | Gray placeholder with broken image icon            |
| Click Target | Entire image area clickable                        |

**[v2.1] Mixed Content Spacing:**

| Property            | Value                                        |
| ------------------- | -------------------------------------------- |
| Text top padding    | 8px (từ top edge của bubble)                 |
| Text side padding   | 16px (từ left/right edge)                    |
| Gap text → image    | 12px (vertical space between text and image) |
| Image bottom margin | 0px (flush với bottom của bubble)            |
| Text line-height    | 1.5 (better readability)                     |

### File Attachment Specifications (Updated v2.1)

| Property      | Value                                 |
| ------------- | ------------------------------------- |
| Display Type  | Icon + Filename + Size + Download btn |
| Icon Size     | 24px × 24px                           |
| Icon Variants | PDF, DOC, XLS, PPT, Generic           |
| Max Filename  | 30 characters (truncate with ...)     |
| File Size     | Display in KB/MB format               |
| Hover Effect  | Background highlight                  |

**Icon Mapping (v2.1):**

```typescript
const FILE_ICONS = {
  "application/pdf": <FileText className="text-red-500" />, // PDF
  "application/msword": <FileText className="text-blue-500" />, // Word
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (
    <FileText className="text-blue-500" />
  ),
  "application/vnd.ms-excel": <Sheet className="text-green-500" />, // Excel
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (
    <Sheet className="text-green-500" />
  ),
  "application/vnd.ms-powerpoint": <Presentation className="text-orange-500" />, // PowerPoint
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": (
    <Presentation className="text-orange-500" />
  ),
  default: <File className="text-gray-500" />, // Generic
};
```

### Conversation List Preview Specifications (NEW - v2.1)

| Property           | Value                                                    |
| ------------------ | -------------------------------------------------------- |
| Image-only preview | "Đã gửi một ảnh" (italic)                                |
| File-only preview  | "Đã gửi [filename]" (italic, truncate nếu dài)           |
| Text priority      | Text hiển thị nếu message có text                        |
| Max length         | 50 characters                                            |
| Truncation         | "..." for overflow (filename dài: "Đã gửi report_lo...") |
| Font style         | Italic cho system-generated messages                     |
| Color              | text-gray-500 (lighter than text msg)                    |

### Preview Modal Specifications

| Property       | Value                                     |
| -------------- | ----------------------------------------- |
| Size           | Full-screen overlay (backdrop)            |
| Content Size   | Max 90vw x 90vh, maintain aspect ratio    |
| API Endpoint   | `/api/Files/{id}/preview`                 |
| Watermark      | Yes (full-size image)                     |
| Close Triggers | ESC key, X button, click outside backdrop |
| Loading        | Centered spinner on dark background       |
| Error          | Error message with retry button           |
| Background     | Semi-transparent black (rgba(0,0,0,0.85)) |
| Animation      | Fade in/out (200ms)                       |

---

## 🔧 Technical Requirements

### TR-1: API Integration

**Endpoints cần integrate:**

1. `GET /api/Files/{id}/watermarked-thumbnail?size=large`
   - Returns: Binary image (JPEG/PNG, max 400px)
   - Use for: Image message display (in chat)
2. `GET /api/Files/{id}/preview`
   - Returns: Binary image (full size, watermarked, optimized)
   - Use for: Preview modal (popup)

**Requirements:**

- ✅ API client functions trong `src/api/files.api.ts`
  - `getImageThumbnail(fileId)` - size=large fixed
  - `getImagePreview(fileId)` - full preview
- ✅ TypeScript interfaces cho requests/responses
- ✅ Error handling (404, 400, network errors)
- ✅ Response type: Blob (binary data)
- ✅ Blob URL creation & cleanup (revoke on unmount)

### TR-2: Component Architecture

**New Components:**

```
src/features/portal/components/
├── MessageAttachment.tsx           # EXISTING - cần update logic phân loại
├── MessageImage.tsx                # NEW - image-only message display
├── ImagePreviewModal.tsx           # NEW - full-screen preview modal
└── __tests__/
    ├── MessageImage.test.tsx
    └── ImagePreviewModal.test.tsx
```

**Updated/New Utils (v2.1):**

```
src/utils/
├── fileTypeDetection.ts            # Helper to detect image/file MIME types
├── fileIconMapping.ts              # NEW - Map MIME type to icon component
└── messagePreviewText.ts           # NEW - Generate preview text for conversation list
```

**Component Props:**

```typescript
// MessageImage.tsx
interface MessageImageProps {
  fileId: string;
  contentType: string; // For fallback/error handling
  onClick: () => void; // Open preview modal
  hasText?: boolean; // [v2.1] If message has text content
}

// ImagePreviewModal.tsx
interface ImagePreviewModalProps {
  fileId: string;
  isOpen: boolean;
  onClose: () => void;
}

// [v2.1] File Icon Component
interface FileIconProps {
  contentType: string;
  className?: string;
}
```

**Component Responsibilities:**

- `MessageImage`: Load large thumbnail, display full width, handle loading/error states, emit click event, **[v2.1]** adjust spacing if hasText=true
- `ImagePreviewModal`: Load full preview on open, display full-screen overlay, handle close triggers (ESC, X, outside click)
- `MessageAttachment` (or parent): Route to MessageImage for images, keep existing UI for files, **[v2.1]** use fileIconMapping for file icons
- **[v2.1]** `FileIconMapping`: Return appropriate icon component based on MIME type (PDF/DOC/XLS/PPT/Generic)
- **[v2.1]** `messagePreviewText`: Generate preview text cho conversation list ("Đã gửi một ảnh", "Đã gửi [file]", or text content)

### TR-3: State Management

**Local Component State:**

- `isModalOpen: boolean` - Preview modal open/closed state
- `selectedFileId: string | null` - File ID being previewed
- `imageBlobUrl: string | null` - Blob URL for displayed image (cleanup on unmount)

**No global state needed** - UI state only, ephemeral

**State Location:**

- Parent component (ChatMain or MessageList) manages modal state
- Child components (MessageImage) are stateless, emit events only

### TR-4: Performance Requirements

| Metric                            | Target                                                                  |
| --------------------------------- | ----------------------------------------------------------------------- |
| Image Load Time (large thumbnail) | < 400ms (with caching)                                                  |
| Preview Load Time                 | < 500ms (with caching)                                                  |
| Memory Usage                      | Revoke blob URLs on unmount (critical!)                                 |
| Lazy Loading                      | Load images only when message visible (Intersection Observer - Phase 3) |
| Caching                           | Browser cache: 24h for thumbnails, 1h for previews                      |
| Max Image Size                    | 400px width for chat display                                            |

### TR-5: Error Handling

**Error Scenarios:**

1. **Image Load Failed (in chat)**

   - Display: Gray placeholder with broken image icon + "Image unavailable"
   - User Action: Can still click to try preview modal
   - Log: Console warning (not error)
   - Fallback: Show file attachment format (icon + name) if contentType available

2. **Preview Load Failed (in modal)**

   - Display: Error message in modal center with retry button
   - User Action: Click retry or close modal
   - Log: Console error with file ID

3. **File Not Found (404)**

   - Display: "File not available" message
   - User Action: Close modal or view fallback
   - Log: Error with file ID

4. **Network Error**
   - Display: "Connection issue" with retry
   - User Action: Retry button
   - Log: Error with network details

---

## 📊 User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User views chat conversation                            │
└─────────────┬───────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Message rendering logic                                  │
│    - Check message.attachments[0].contentType               │
│    - If image MIME type → Render MessageImage component     │
│    - Else → Render MessageAttachment (file icon + name)     │
└─────────────┬───────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. MessageImage component loads                             │
│    - Call API: GET /Files/{id}/watermarked-thumbnail?size=large │
│    - Loading state: Skeleton full width                     │
│    - Success: Display watermarked image (full width)        │
│    - Error: Display placeholder + "Image unavailable"       │
└─────────────┬───────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. User clicks image                                        │
│    - Emit onClick event to parent                           │
│    - Parent opens ImagePreviewModal with fileId             │
└─────────────┬───────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. ImagePreviewModal loads                                  │
│    - Call API: GET /Files/{id}/preview                      │
│    - Loading state: Centered spinner on dark backdrop       │
│    - Success: Display full-size watermarked image           │
│    - Error: Error message with retry button                 │
└─────────────┬───────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. User closes modal                                        │
│    - Trigger: X button / ESC key / Click outside backdrop   │
│    - Cleanup: Revoke preview blob URL                       │
│    - State: Set isOpen = false                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Requirements

### SEC-1: Watermark Enforcement

- ✅ ALL images trong chat MUST have watermark (use `/watermarked-thumbnail` endpoint)
- ✅ ALL previews MUST have watermark (use `/preview` endpoint)
- ✅ NEVER use `/download` endpoint for display (no watermark)
- ✅ Watermark cannot be removed client-side

### SEC-2: Authentication

- ✅ All API calls include Bearer token
- ✅ Handle 401 Unauthorized → redirect to login
- ✅ Handle 403 Forbidden → show "Access Denied" message

### SEC-3: File Access Control

- ✅ Only show images for files user has access to
- ✅ Backend enforces file permissions
- ✅ Frontend handles permission errors gracefully

---

## 📋 Implementation Checklist

### Phase 2.1: API Integration (2 tasks)

- [ ] Create `src/api/files.api.ts` (hoặc update nếu đã tồn tại)
  - [ ] `getImageThumbnail(fileId)` - fixed size=large
  - [ ] `getImagePreview(fileId)` - full preview
  - [ ] Error handling (404, 400, network)
  - [ ] TypeScript interfaces
  - [ ] Blob URL creation utilities

### Phase 2.2: Components (3 tasks)

- [ ] Create `MessageImage.tsx`
  - [ ] Load large thumbnail from API (size=large)
  - [ ] Display full width trong message bubble
  - [ ] Loading state: skeleton full width
  - [ ] Error state: placeholder + message
  - [ ] onClick handler (emit event to parent)
  - [ ] Cleanup blob URL on unmount
- [ ] Create `ImagePreviewModal.tsx`
  - [ ] Full-screen modal overlay (dark backdrop)
  - [ ] Load preview from API when isOpen=true
  - [ ] Display image centered (max 90vw x 90vh)
  - [ ] Close handlers: X button, ESC key, click outside
  - [ ] Loading state: centered spinner
  - [ ] Error state: message + retry button
  - [ ] Cleanup blob URL on close
- [ ] Update `MessageAttachment.tsx` (hoặc parent component)
  - [ ] Detect image contentType (JPEG, PNG, GIF, WebP)
  - [ ] Route to MessageImage for images
  - [ ] Keep existing file attachment UI for non-images

### Phase 2.3: Testing (2 tasks)

- [ ] Unit tests
  - [ ] `MessageImage.test.tsx` (5 test cases)
    - Render with loading state
    - Render with success (image displays)
    - Render with error (placeholder shows)
    - onClick triggers callback
    - Blob URL cleanup on unmount
  - [ ] `ImagePreviewModal.test.tsx` (6 test cases)
    - Modal closed by default
    - Modal opens when isOpen=true
    - Image loads and displays
    - Close on X button click
    - Close on ESC key
    - Close on backdrop click
- [ ] Manual testing
  - [ ] Upload image → verify full-width display dengan watermark
  - [ ] Upload file → verify file icon displays (không image)
  - [ ] Click image → verify preview modal opens
  - [ ] Test close triggers (X, ESC, outside click)
  - [ ] Test error scenarios (404, network error)
  - [ ] Test performance (load time < 400ms)

---

## 🚨 IMPACT SUMMARY

### Files sẽ tạo mới:

1. **API Layer**
   - `src/api/files.api.ts` - API client for image thumbnail & preview
2. **Components**
   - `src/features/portal/components/MessageImage.tsx` - Image-only message display
   - `src/features/portal/components/ImagePreviewModal.tsx` - Full-screen preview modal
   - **[v2.1]** `src/features/portal/components/FileIcon.tsx` - File type icon component
3. **Tests**
   - `src/features/portal/components/__tests__/MessageImage.test.tsx`
   - `src/features/portal/components/__tests__/ImagePreviewModal.test.tsx`
   - **[v2.1]** `src/features/portal/components/__tests__/FileIcon.test.tsx`
4. **Utils**
   - `src/utils/fileTypeDetection.ts` - Helper to detect image MIME types
   - **[v2.1]** `src/utils/fileIconMapping.ts` - Map MIME type to icon component
   - **[v2.1]** `src/utils/messagePreviewText.ts` - Generate conversation list preview text

### Files sẽ sửa đổi:

1. **src/features/portal/components/MessageAttachment.tsx** (hoặc parent rendering logic)

   - Add: Image MIME type detection (JPEG, PNG, GIF, WebP)
   - Add: Conditional rendering → MessageImage for images
   - Keep: Existing file attachment UI for non-images (PDF, DOC, etc.)
   - **[v2.1]** Update: File icon rendering với FileIcon component
   - **[v2.1]** Update: Spacing/padding cho mixed text+image messages

2. **[v2.1] src/features/portal/components/ConversationListItem.tsx** (or similar)

   - Add: Logic to generate preview text cho image-only messages
   - Add: Use messagePreviewText utility
   - Update: Preview text hiển thị "Đã gửi một ảnh" khi message chỉ có ảnh

3. **src/types/files.ts** (if needed)
   - Add: Any missing interfaces for image rendering
   - **[v2.1]** Add: FileIconType enum/type

### Files sẽ xoá:

- (không có)

### Dependencies sẽ thêm:

- ❌ Không có dependencies mới - sử dụng existing stack
- **[v2.1]** Lucide icons cho file types (nếu chưa có): `lucide-react` (already installed)

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                              | Lựa chọn                                       | HUMAN Decision                               |
| --- | ----------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| 1   | Message structure                   | Image-only message (no text)                   | ✅ **Option A**                              |
| 2   | Multiple images handling            | 1 ảnh = 1 message riêng                        | ✅ **Option A**                              |
| 3   | Image display size                  | Full width của message bubble                  | ✅ **Confirmed**                             |
| 4   | Image metadata display              | Chỉ hiển thị ảnh (no filename/size)            | ✅ **Minimal**                               |
| 5   | File attachments                    | Giữ nguyên format hiện tại (icon + name)       | ✅ **Keep existing**                         |
| 6   | **[v2.1]** Mixed text+image padding | Text padding: 16px viền, 12px gap với ảnh      | ✅ **16px L/R, 8px top, 12px gap với ảnh**   |
| 7   | **[v2.1]** File icon library        | Lucide icons hoặc custom SVG?                  | ✅ **Lucide**                                |
| 8   | **[v2.1]** Preview text cho files   | "Đã gửi [filename]" hoặc "Đã gửi một file"?    | ✅ **"Đã gửi [filename]", truncate nếu dài** |
| 9   | **[v2.1]** Icon color scheme        | Match file type (red PDF, blue Word) hay mono? | ✅ **Colored (red/blue/green/orange)**       |
| 10  | Lazy loading images                 | Load all or Intersection Observer?             | ⏳ **Phase 3 - Intersection Observer**       |
| 11  | Zoom controls trong modal           | Basic display or zoom in/out?                  | ⬜ **Phase 3**                               |

> ✅ **Decisions 1-9 đã được HUMAN confirm (v2.0 + v2.1)**  
> ⏳ **Decisions 10-11 defer to Phase 3**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                                                | Status                    |
| ------------------------------------------------------- | ------------------------- |
| ✅ Đã review Overview & v2.1 What's New                 | ✅                        |
| ✅ Đã review Business Requirements (updated BR-1, BR-4) | ✅                        |
| ✅ Đã review UI/UX Specifications (Mode 4, file icons)  | ✅                        |
| ✅ Đã review Technical Requirements (new utils)         | ✅                        |
| ✅ Đã review Impact Summary (v2.1 additions)            | ✅                        |
| ✅ Đã điền Pending Decisions (9/11 - cần 6-9 confirmed) | ✅                        |
| ✅ Đã review API Contracts                              | ✅ READY (mock snapshots) |
| ✅ **APPROVED để tạo wireframe & flow (BƯỚC 2)**        | ✅ **APPROVED**           |
| ✅ **APPROVED để tạo implementation plan (BƯỚC 4)**     | ✅ **APPROVED**           |
| ✅ **APPROVED để implement code (BƯỚC 5)**              | ✅ **APPROVED**           |

**HUMAN Signature:** **HUMAN APPROVED**  
**Date:** **2026-01-08**

> ✅ **All planning docs APPROVED - Starting BƯỚC 5: Implementation**  
> 🚀 **Implementing v2.1 with Mixed Content, File Icons, Preview Text**

---

## 📚 Related Documents

### API Contracts (COMPLETED)

- ✅ [Thumbnail API Contract](../../../api/file/thumbnail/contract.md) - Status: READY
- ✅ [Preview API Contract](../../../api/file/preview/contract.md) - Status: READY

### Snapshots (COMPLETED - MOCK DATA)

- ✅ [Thumbnail Snapshots](../../../api/file/thumbnail/snapshots/v1/) - 5 files
- ✅ [Preview Snapshots](../../../api/file/preview/snapshots/v1/) - 4 files

### Implementation Docs (COMPLETED)

- ✅ [02a_wireframe.md](./02a_wireframe.md) - UI designs & layouts **APPROVED**
- ✅ [02b_flow.md](./02b_flow.md) - User flow diagrams **APPROVED**
- ✅ [04_implementation-plan.md](./04_implementation-plan.md) - Step-by-step plan **APPROVED**
- ✅ [06_testing.md](./06_testing.md) - Test requirements **APPROVED**
- ⏳ [05_progress.md](./05_progress.md) - Implementation progress **NEXT (BƯỚC 5)**

### Existing Docs

- 📄 [Phase 2 Implementation Plan](./07_phase2-implementation-plan.md) - File upload implementation
- 📄 [File Upload Contract](../../../api/file/upload/contract.md) - Upload API spec

---

## 🎯 Success Criteria

Feature sẽ được coi là hoàn thành khi:

1. ✅ **Functional:**

   - Image attachments hiển thị trong message riêng, full width, với watermark
   - Click vào ảnh mở preview modal với ảnh full-size watermarked
   - Non-image attachments giữ nguyên behavior (file icon + name)
   - 1 ảnh = 1 message (no mixed content)
   - **[v2.1]** Message có cả text và ảnh: text có padding phù hợp (16px L/R, 8px top, 12px gap)
   - **[v2.1]** File attachments hiển thị icon đúng loại với colors (PDF red, Word blue, Excel green, PPT orange)
   - **[v2.1]** Conversation list preview hiển thị "Đã gửi một ảnh" hoặc "Đã gửi [filename]" (truncate nếu dài)

2. ✅ **Performance:**

   - Image load (large thumbnail) < 400ms
   - Preview load < 500ms
   - Không memory leak (blob URLs được revoke on unmount/close)
   - Images có watermark (không sử dụng download endpoint)

3. ✅ **Quality:**

   - All unit tests passing (**[v2.1]** updated: 15+ test cases: 5 MessageImage + 6 ImagePreviewModal + 4 utils)
   - Manual testing completed (**[v2.1]** updated: 9 scenarios - thêm mixed content, file icons, preview text)
   - Error handling robust (4 error scenarios with fallbacks)

4. ✅ **Security:**

   - Watermarks visible trên tất cả images
   - Không sử dụng `/download` endpoint cho display
   - Authentication enforced

5. ✅ **UX:**
   - Loading states clear (skeleton loaders)
   - Error messages helpful
   - Modal UX smooth (animations, close triggers work)
   - No filename/size clutter (minimal design)
   - **[v2.1]** Text trong message dễ đọc (không bị sát với ảnh/viền)
   - **[v2.1]** File icons rõ ràng, dễ nhận biết loại file
   - **[v2.1]** Preview text trong conversation list meaningful

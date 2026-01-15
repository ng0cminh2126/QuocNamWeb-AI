# [BƯỚC 1] Requirements - File Upload Phase 2

> **Feature:** Upload nhiều file & Hiển thị ảnh dạng grid  
> **Version:** 2.0.0  
> **Status:** ⏳ PENDING APPROVAL  
> **Created:** 2026-01-14  
> **Module:** chat  
> **Parent Feature:** file-upload

---

## 📋 Version History

| Version | Date       | Type  | Changes                                         |
| ------- | ---------- | ----- | ----------------------------------------------- |
| 2.0.0   | 2026-01-14 | MAJOR | Batch upload API, multiple attachments, grid UI |
| 1.0.0   | 2026-01-06 | -     | Initial single file upload (Phase 1)            |

**Breaking Changes in v2.0:**

- ✅ API: `POST /api/Files/batch` - New batch upload endpoint
- ✅ API: `SendMessageRequest.attachments` - Changed from single to array
- ✅ UI: Image grid display (3 images per row) instead of single image

---

## 📋 Functional Requirements

### FR-01: Batch Upload API Integration

| ID      | Requirement                                    | Priority | Notes                        |
| ------- | ---------------------------------------------- | -------- | ---------------------------- |
| FR-01.1 | Phát hiện số lượng file được chọn              | HIGH     | files.length check           |
| FR-01.2 | Nếu 1 file → Dùng `POST /api/Files` (Phase 1)  | HIGH     | Giữ nguyên single upload     |
| FR-01.3 | Nếu >1 file → Dùng `POST /api/Files/batch`     | HIGH     | New batch upload API         |
| FR-01.4 | Batch upload: gửi tất cả files trong 1 request | HIGH     | FormData with multiple files |
| FR-01.5 | Nhận response array với từng file result       | HIGH     | `BatchUploadResult`          |
| FR-01.6 | Handle partial success (1 số file fail)        | MEDIUM   | Show which files failed      |
| FR-01.7 | Retry failed files only                        | LOW      | Phase 3                      |

### FR-02: Multiple Attachments in Message

| ID      | Requirement                                        | Priority | Notes                         |
| ------- | -------------------------------------------------- | -------- | ----------------------------- |
| FR-02.1 | `SendMessageRequest.attachments` nhận array        | HIGH     | Breaking change from single   |
| FR-02.2 | Gửi message với nhiều file IDs                     | HIGH     | Array of AttachmentInputDto   |
| FR-02.3 | `SendMessageRequest.content` phải là string        | HIGH     | Empty "" if no text, NOT null |
| FR-02.4 | `AttachmentInputDto.fileSize` bắt buộc gửi lên     | HIGH     | API requires fileSize field   |
| FR-02.5 | Validate max attachments per message               | MEDIUM   | API limit check               |
| FR-02.6 | Message với attachments → display all files        | HIGH     | Grid layout for images        |
| FR-02.7 | Non-image files → list display (existing behavior) | HIGH     | Phase 1 style                 |

### FR-03: Image Grid Display (Dynamic Layout - Decision 1A)

| ID       | Requirement                                        | Priority | Notes                                   |
| -------- | -------------------------------------------------- | -------- | --------------------------------------- |
| FR-03.1  | Tin nhắn với nhiều ảnh → Dynamic grid layout       | HIGH     | Số cột thay đổi theo số lượng ảnh       |
| FR-03.2  | 1 ảnh → Full width (không grid)                    | HIGH     | Max-width: 320px, max-height: 180px     |
| FR-03.3  | 2 ảnh → 2 columns grid                             | HIGH     | Each 50% width, **preserve ratio**      |
| FR-03.4  | 3-6 ảnh → 3 columns grid                           | HIGH     | `grid-template-columns: repeat(3, 1fr)` |
| FR-03.5  | 7+ ảnh → 3 columns + "Show more" overlay           | HIGH     | First 6 + "+N more" button              |
| FR-03.6  | Mỗi ảnh (3-6 grid) là ô vuông (aspect-ratio 1:1)   | HIGH     | `aspect-ratio: 1` (Decision 6)          |
| FR-03.7  | 2 ảnh grid: **preserve aspect ratio** (không crop) | HIGH     | No aspect-square, natural height        |
| FR-03.8  | Ảnh cover fit vào ô vuông (3-6 grid)               | HIGH     | `object-fit: cover`                     |
| FR-03.9  | Gap giữa các ảnh: 4px                              | MEDIUM   | `gap: 4px` (Tailwind `gap-1`)           |
| FR-03.10 | Border radius: 8px cho mỗi ảnh                     | MEDIUM   | `border-radius: 8px` (rounded)          |
| FR-03.11 | Hover effect: opacity 0.9                          | LOW      | Smooth transition                       |
| FR-03.12 | Click ảnh → Open preview modal with navigation     | HIGH     | See FR-07                               |
| FR-03.13 | Grid responsive (mobile: 2 ảnh/hàng)               | MEDIUM   | Breakpoint < 640px                      |
| FR-03.14 | "+N more" overlay → Open modal at image 6 (index)  | HIGH     | Start from first hidden image           |

### FR-04: Upload Progress (Visual Feedback)

| ID      | Requirement                            | Priority | Notes                    |
| ------- | -------------------------------------- | -------- | ------------------------ |
| FR-04.1 | Show loading state khi batch uploading | HIGH     | Spinner + "Uploading..." |
| FR-04.2 | Disable send button khi đang upload    | HIGH     | Prevent duplicate send   |
| FR-04.3 | Show số file đã upload / tổng số       | MEDIUM   | "Uploading 2/5 files..." |
| FR-04.4 | Individual file progress bars          | LOW      | Phase 3                  |

### FR-05: Error Handling

| ID      | Requirement                                    | Priority | Notes                        |
| ------- | ---------------------------------------------- | -------- | ---------------------------- |
| FR-05.1 | Batch upload failed → Show error toast         | HIGH     | "Upload failed"              |
| FR-05.2 | Partial success → Show which files failed      | HIGH     | "3/5 files uploaded"         |
| FR-05.3 | Network error → Retry toàn bộ batch            | MEDIUM   | Auto retry 1 time            |
| FR-05.4 | File validation error → Highlight failed files | MEDIUM   | Red border + error message   |
| FR-05.5 | Server 500 → Generic error message             | HIGH     | "Server error, please retry" |

### FR-06: Validation Updates

| ID      | Requirement                             | Priority | Notes                   |
| ------- | --------------------------------------- | -------- | ----------------------- |
| FR-06.1 | Max files per message: **10** (updated) | HIGH     | Increased from 5        |
| FR-06.2 | Each file max size: 10MB                | HIGH     | Same as Phase 1         |
| FR-06.3 | Total batch size: 50MB                  | MEDIUM   | New batch limit         |
| FR-06.4 | Show error if total size > 50MB         | MEDIUM   | "Total files too large" |
| FR-06.5 | Validate file types (same as Phase 1)   | HIGH     | No change               |

### FR-07: Image Preview Modal Navigation (Phase 2.1 - Gallery Mode)

| ID      | Requirement                                    | Priority | Notes                            |
| ------- | ---------------------------------------------- | -------- | -------------------------------- |
| FR-07.1 | Modal hiển thị ảnh lớn với prev/next arrows    | HIGH     | Left/Right chevron buttons       |
| FR-07.2 | Click prev arrow → Navigate to previous image  | HIGH     | Only visible if currentIndex > 0 |
| FR-07.3 | Click next arrow → Navigate to next image      | HIGH     | Only visible if not last image   |
| FR-07.4 | Keyboard navigation (arrows, ESC)              | HIGH     | ← → để prev/next, ESC to close   |
| FR-07.5 | Display counter ("N / Total - filename")       | HIGH     | Header của modal                 |
| FR-07.6 | Auto-load new image when navigating            | HIGH     | Call preview API for each image  |
| FR-07.7 | Download button cho current image              | MEDIUM   | Bottom-right header              |
| FR-07.8 | Gallery mode for messages with multiple images | HIGH     | Pass images[] array to modal     |
| FR-07.9 | Backward compatible with single image mode     | HIGH     | Support both fileId and images[] |

### FR-08: Mixed Attachments Display (Decision 3A - Separate Sections)

| ID      | Requirement                                 | Priority | Notes                             |
| ------- | ------------------------------------------- | -------- | --------------------------------- |
| FR-08.1 | Group attachments by type (images vs files) | HIGH     | Helper function                   |
| FR-08.2 | Display "📷 Images (N):" header nếu có ảnh  | MEDIUM   | Only if images exist              |
| FR-08.3 | Display images dạng grid (apply FR-03)      | HIGH     | Reuse DynamicImageGrid            |
| FR-08.4 | Display "📄 Files (N):" header nếu có files | MEDIUM   | Only if non-image files exist     |
| FR-08.5 | Display non-image files dạng list           | HIGH     | Icon + filename + size + download |
| FR-08.6 | Gap 16px giữa image section và file section | MEDIUM   | Visual separation                 |
| FR-08.7 | File list: Click → Download file            | HIGH     | Use existing download logic       |
| FR-08.8 | Nếu chỉ có images → Không show header       | LOW      | Cleaner UI                        |
| FR-08.9 | Nếu chỉ có files → Không show header        | LOW      | Cleaner UI                        |

---

## 🎨 UI Requirements

### UI-01: Image Grid Layout (3 ảnh/hàng)

**Desktop (≥640px):**

```
┌─────────────────────────────────────────────────────────────┐
│ User Avatar  │ Đây là tin nhắn với nhiều ảnh                │
│              │                                               │
│              │ ┌────────┬────────┬────────┐                 │
│              │ │ Ảnh 1  │ Ảnh 2  │ Ảnh 3  │ Row 1           │
│              │ │ (1:1)  │ (1:1)  │ (1:1)  │                 │
│              │ └────────┴────────┴────────┘                 │
│              │                                               │
│              │ ┌────────┬────────┐                          │
│              │ │ Ảnh 4  │ Ảnh 5  │         Row 2            │
│              │ │ (1:1)  │ (1:1)  │                          │
│              │ └────────┴────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

**Mobile (<640px):**

```
┌─────────────────────────────┐
│ User Avatar  │ Message      │
│              │              │
│              │ ┌─────┬─────┐│
│              │ │ Ảnh │ Ảnh ││ 2 ảnh/hàng
│              │ │  1  │  2  ││
│              │ └─────┴─────┘│
│              │ ┌─────┬─────┐│
│              │ │ Ảnh │ Ảnh ││
│              │ │  3  │  4  ││
│              │ └─────┴─────┘│
└─────────────────────────────┘
```

### UI-02: File Preview Container (Before Send)

**Layout:** Unified card layout for all files (max-width 200px)

**Design (Phase 2 Implemented):**

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ [▓] photo.jpg│  │ [▓] img2.png │  │📄 report.pdf │               │
│  │  (2.5 MB) [×]│  │  (1.2 MB) [×]│  │  (2.5 MB) [×]│               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│  max-width:200px  max-width:200px  max-width:200px                │
│  [▓] = 40x40 img  [▓] = 40x40 img  📄 = file icon                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ [📎] [🖼️]  │ Nhập tin nhắn...                  │  [Send]  │
│  ↑                                                          │
│  └─ Buttons remain the same as Phase 1                     │
└─────────────────────────────────────────────────────────────┘
```

**File Cards (All Files - Images & Non-Images):**

- Layout: **40x40px image preview or icon** + filename + size + delete button [×]
- Max-width: **200px**
- Display filename (truncated if needed)
- Display file size below filename
- Delete button [×]: Right side, inline
- Hover: border color → primary/50

**Image Preview Specs:**

- Size: 40x40px square
- Border-radius: 4px
- Border: 1px solid border color
- Object-fit: cover

**CSS Specs:**

```css
.file-preview-container {
  display: flex;
  flex-wrap: wrap; /* Wrap to next line if too many files */
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--border);
  background: var(--muted-30);
}

/* Unified file preview cards (images and non-images) */
.file-preview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  max-width: 200px;
  transition: border-color 0.2s;
}

.file-preview-item:hover {
  border-color: var(--primary-50);
}

/* Image preview thumbnail (40x40px square) */
.file-preview-item img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border);
}
```

````

### UI-03: Message Bubble với Image Grid

**CSS Specs:**

```css
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Desktop: 3 columns */
  gap: 8px;
  max-width: 400px;
}

@media (max-width: 640px) {
  .image-grid {
    grid-template-columns: repeat(2, 1fr); /* Mobile: 2 columns */
    max-width: 280px;
  }
}

.image-grid-item {
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-grid-item:hover {
  transform: scale(1.02);
}

.image-grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
````

---

## 🔒 Security Requirements

| ID     | Requirement                                | Priority | Notes                  |
| ------ | ------------------------------------------ | -------- | ---------------------- |
| SEC-01 | Validate file types client & server        | HIGH     | Same as Phase 1        |
| SEC-02 | Validate each file size ≤ 10MB             | HIGH     | Individual check       |
| SEC-03 | Validate total batch size ≤ 50MB           | HIGH     | New batch limit        |
| SEC-04 | Sanitize file names before upload          | HIGH     | Remove special chars   |
| SEC-05 | Virus scan for batch uploads (server-side) | MEDIUM   | Backend responsibility |

---

## 📊 Performance Requirements

| ID      | Requirement                              | Priority | Notes                    |
| ------- | ---------------------------------------- | -------- | ------------------------ |
| PERF-01 | Batch upload timeout: 60s                | HIGH     | For 10 files @ 10MB each |
| PERF-02 | Image thumbnails: lazy load in grid      | MEDIUM   | Intersection Observer    |
| PERF-03 | Grid rendering: virtualize if >20 images | LOW      | Phase 3                  |
| PERF-04 | Compress images >5MB before upload       | LOW      | Phase 3                  |

---

## ♿ Accessibility Requirements

| ID      | Requirement                             | Priority | Notes                    |
| ------- | --------------------------------------- | -------- | ------------------------ |
| A11Y-01 | Image grid: keyboard navigation support | HIGH     | Tab through images       |
| A11Y-02 | Each image: alt text with filename      | HIGH     | Screen reader support    |
| A11Y-03 | Upload progress: aria-live announcement | MEDIUM   | "Uploading 2 of 5 files" |
| A11Y-04 | Error messages: aria-describedby        | HIGH     | Link errors to inputs    |

---

## 🧪 Testing Requirements (Summary)

| Type        | Coverage                               | Priority |
| ----------- | -------------------------------------- | -------- |
| Unit Tests  | Batch upload API client                | HIGH     |
| Unit Tests  | Image grid component rendering         | HIGH     |
| Integration | Send message with multiple attachments | HIGH     |
| Integration | Batch upload error handling            | HIGH     |
| E2E         | User selects 5 images → grid display   | MEDIUM   |
| E2E         | Upload 1 file vs 5 files (API switch)  | MEDIUM   |

**Detailed test cases:** See [06_testing.md](./06_testing.md) (after approval)

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                              | Lựa chọn                       | HUMAN Decision |
| --- | ----------------------------------- | ------------------------------ | -------------- |
| 1   | Max files per message               | 5, 10, or 20?                  | ⬜ **10**      |
| 2   | Total batch size limit              | 50MB, 100MB, or unlimited?     | ⬜ **50MB**    |
| 3   | Grid columns on tablet (640-1024px) | 2 or 3 columns?                | ⬜ **3**       |
| 4   | Show upload progress per file?      | Yes (Phase 2) or No (Phase 3)? | ⬜ **No**      |
| 5   | Auto-compress images >5MB?          | Yes (Phase 2) or No (Phase 3)? | ⬜ **No**      |
| 6   | Retry failed files individually?    | Yes (Phase 2) or No (Phase 3)? | ⬜ **No**      |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

**Note:** Image preview modal library (Decision #7) → Bổ sung sau (Phase 3). Phase 2 sẽ dùng `ImagePreviewModal` hiện có.

---

## 📋 IMPACT SUMMARY (Tóm tắt thay đổi)

### Files sẽ tạo mới (Updated with Decisions):

**Phase 2 - Approved:**

- `src/api/files.api.ts` - **MODIFY** (thêm `uploadFilesBatch()`)
- `src/hooks/mutations/useUploadFilesBatch.ts` - **NEW** (batch upload hook)
- `src/components/chat/ImageGrid.tsx` - **MODIFY** → **DynamicImageGrid.tsx** (Decision 1A)
- `src/components/chat/ImageGridItem.tsx` - **NEW** (single grid item)
- `src/types/files.ts` - **MODIFY** (thêm `BatchUploadResult` type)

**Phase 2.1 - UI Enhancements (Approved):**

- `src/components/chat/DynamicImageGrid.tsx` - Dynamic grid with 1/2/3 cols logic (Decision 1A)
- `src/components/chat/ShowMoreOverlay.tsx` - "+N more" overlay cho 7+ images
- `src/components/ImagePreviewModalEnhanced.tsx` - Modal with thumbnails (Decision 2B)
- `src/components/chat/MixedAttachmentSections.tsx` - Separate image/file sections (Decision 3A)
- `src/components/chat/FileList.tsx` - File list component
- `src/components/chat/FileListItem.tsx` - Single file item
- `src/utils/attachmentHelpers.ts` - Group attachments by type helper
- `src/utils/imageGridHelpers.ts` - Calculate grid columns based on count

### Files sẽ sửa đổi:

**Phase 2 - Existing:**

- `src/hooks/mutations/useSendMessage.ts`
  - Update `SendMessageRequest` type: `attachment` → `attachments[]`
  - Logic chọn API: 1 file vs batch
- `src/features/portal/workspace/ChatMainContainer.tsx`
  - Update form state: handle multiple files
  - Add batch upload logic
- `src/types/messages.ts`
  - Update `AttachmentInputDto`: single → array support

**Phase 2.1 - UI Enhancements:**

- `src/components/chat/MessageBubbleSimple.tsx`
  - Add `AttachmentRenderer` logic
  - Conditional render: DynamicImageGrid / FileList / MixedAttachmentSections
  - Pass images array to ImagePreviewModal
- `src/components/ImagePreviewModal.tsx` → Rename to `ImagePreviewModalEnhanced.tsx`
  - Add thumbnails strip
  - Add prev/next navigation
  - Add keyboard support
  - Add auto-scroll for active thumbnail
  - Update form state: handle multiple files
  - Add batch upload logic
- `src/components/chat/MessageBubbleSimple.tsx`
  - Add `ImageGrid` component rendering
  - Conditional: nhiều ảnh → grid, ít ảnh → existing layout
- `src/types/messages.ts`
  - Update `AttachmentInputDto`: single → array support

### Files sẽ xoá:

- (không có)

### Dependencies sẽ thêm:

- (không có - dùng CSS Grid native)

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status       |
| ------------------------- | ------------ |
| Đã review Impact Summary  | ✅ Đã review |
| Đã điền Pending Decisions | ✅ Đã điền   |
| **APPROVED để thực thi**  | ✅ APPROVED  |

**HUMAN Signature:** MINH - ĐÃ DUYỆT  
**Date:** 2026-01-14

> ✅ **APPROVED: Tiến hành tạo wireframe và implementation plan**

---

## 🔗 References

- [Phase 1 Requirements](../file-upload/01_requirements.md)
- [Batch Upload API Contract](../../../api/file/batch-upload/contract.md) ⏳ PENDING
- [Send Message API Contract](../../../api/chat/message-send-with-multiple-attachments/contract.md) ⏳ PENDING
- [Swagger: File API](https://vega-file-api-dev.allianceitsc.com/swagger/index.html)
- [Swagger: Chat API](https://vega-chat-api-dev.allianceitsc.com/swagger/index.html)

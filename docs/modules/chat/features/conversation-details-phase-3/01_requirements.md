# [BƯỚC 1] Phase 3 Requirements: File Preview Modal

> **Module:** Chat  
> **Feature:** File Preview Modal  
> **Version:** 3.0  
> **Status:** ✅ APPROVED - Ready for implementation  
> **Created:** 2026-01-08

---

## 📋 Version History

| Version | Date       | Changes                                     | Status     |
| ------- | ---------- | ------------------------------------------- | ---------- |
| 3.0     | 2026-01-08 | Initial requirements for file preview modal | ⏳ PENDING |

---

## 🎯 Overview

**What's Phase 3?**

Bổ sung khả năng preview files (PDF, images, documents) ngay trong app thông qua modal, không cần download về máy.

**Why This Phase?**

- ✅ Phase 1: Messages + basic file info
- ✅ Phase 2: File attachments display (icon, name, size)
- 🎯 Phase 3: **Preview files in-app** (this phase)

**User Pain Point:**

- Hiện tại: User không thể bấm vào tin nhắn dạng file.
- Solution: Click vào file → modal hiện preview ngay → tiện lợi, nhanh chóng

---

## 📐 Functional Requirements

### FR-1: File Click Interaction

**ID:** FR-1  
**Priority:** HIGH  
**Description:** Khi user click vào file attachment trong message bubble, mở preview modal

**Acceptance Criteria:**

✅ Click vào file attachment (PDF, image) → modal mở  
✅ Modal overlay che toàn màn hình (semi-transparent backdrop)  
✅ Modal scroll inside only (body không scroll)  
✅ ESC key hoặc click backdrop → đóng modal  
✅ Khi modal mở, focus vào modal content

**User Flow:**

```
User sees message with PDF attachment
  ↓
Click on file name/icon
  ↓
Modal opens with preview
  ↓
User can view file, navigate pages
  ↓
Click close button or ESC → modal closes
```

---

### FR-2: Modal UI Structure

**ID:** FR-2  
**Priority:** HIGH  
**Description:** Modal có cấu trúc UI rõ ràng với header, content, navigation

**Acceptance Criteria:**

✅ **Header Section:**

- Display file name (truncate nếu quá dài)
- Close button (X icon) ở góc phải
- Header sticky khi scroll

✅ **Content Section:**

- Scrollable container (max-height với overflow-y-auto)
- Hiển thị file content:
  - PDF: Mỗi page là 1 image (stacked vertically)
  - Image: Display image với zoom controls (future)
- Loading skeleton khi đang load pages
- Empty state nếu không load được

✅ **Navigation Section** (for multi-page PDFs):

- Page indicator: "Page X of Y"
- Previous button (disabled ở page 1)
- Next button (disabled ở page cuối)
- Navigation sticky tại bottom của modal

**Wireframe Reference:**

> See [02a_wireframe.md](./02a_wireframe.md) for detailed UI specs

---

### FR-3: PDF Multi-Page Support

**ID:** FR-3  
**Priority:** HIGH  
**Description:** Hỗ trợ PDF nhiều trang với pagination

**Acceptance Criteria:**

✅ **Page Count:**

- Call API `GET /api/Files/{id}/preview` để load first page
- Read `X-Total-Pages` header để lấy tổng số pages
- Read `X-Current-Page` header (luôn = 1)
- Display "Page 1 of {X-Total-Pages}" ở navigation section

✅ **Page Rendering:**

- First page: Đã load từ `/api/Files/{id}/preview` call
- Next/Prev buttons để navigate giữa các pages
- Pages 2+: Call API `GET /api/pdf/{fileId}/pages/{pageNumber}/render?dpi=300`
- Cache rendered pages để không reload khi quay lại

✅ **Lazy Loading:**

- Chỉ load page hiện tại (không load tất cả pages trước)
- Preload next page ở background (optimization)

✅ **Keyboard Navigation:**

- Arrow Right/Down → next page
- Arrow Left/Up → previous page

**Technical Notes:**

- Use `dpi=300` for good quality/size balance
- Each page renders as PNG image
- Images have watermark (from API)

---

### FR-4: Image Preview

**ID:** FR-4  
**Priority:** MEDIUM  
**Description:** Preview image files (JPG, PNG, GIF)

**Acceptance Criteria:**

✅ Click on image attachment → modal opens  
✅ Display image với API endpoint: `GET /api/Files/{id}/preview`  
✅ Image fit container width (max-width: 100%)  
✅ No pagination (single image)

**Future Enhancements:**

- Zoom in/out controls
- Pan/drag image
- Full-screen mode

---

## 🎨 UI Requirements

### UR-1: Modal Design

**Modal Dimensions:**

- **Desktop:** Max width 90vw, max height 90vh
- **Tablet:** Max width 95vw, max height 95vh
- **Mobile:** Full screen (100vw x 100vh)

**Header:**

- Height: 60px
- Background: White
- Border-bottom: 1px solid gray-200
- Padding: 16px 24px
- Sticky position

**Content:**

- Padding: 24px
- Background: gray-50
- Overflow-y: auto
- Max-height: calc(90vh - 60px - 70px) // viewport - header - footer

**Navigation (Footer):**

- Height: 70px
- Background: White
- Border-top: 1px solid gray-200
- Padding: 16px 24px
- Sticky position
- Flex layout: [Prev] [Page X of Y] [Next]

---

### UR-2: Responsive Behavior

| Breakpoint          | Modal Size    | Layout                  |
| ------------------- | ------------- | ----------------------- |
| ≥1024px (Desktop)   | 90vw x 90vh   | Side margins visible    |
| 768-1023px (Tablet) | 95vw x 95vh   | Minimal margins         |
| <768px (Mobile)     | 100vw x 100vh | Full screen, no margins |

**Mobile Optimizations:**

- Header height reduced to 50px
- Navigation height reduced to 60px
- Button sizes increased (min 44x44px for touch)
- Swipe gestures for navigation (future)

---

### UR-3: Loading States

**Initial Load:**

```
[Header: filename + close button]
[Content: Loading skeleton]
  - Gray rectangles animating
  - "Loading page 1 of X..."
```

**Page Navigation:**

```
[Previous page fades out]
[Loading spinner]
[New page fades in]
```

---

### UR-4: Error States

**File Not Found:**

```
[Header: "File Preview" + close button]
[Content: Error icon + message]
  "File not found or has been deleted"
  [Retry Button]
```

**Network Error:**

```
[Content: Warning icon + message]
  "Failed to load file preview"
  "Please check your connection and try again"
  [Retry Button]
```

---

## 🔒 Security Requirements

### SR-1: Authorization

**Requirement:** User chỉ được preview files họ có quyền access

**Implementation:**

- API endpoint yêu cầu JWT token (Bearer authorization)
- Backend kiểm tra user permission trước khi trả file
- Frontend handle 401/403 errors → redirect to login hoặc show error

---

### SR-2: Watermark

**Requirement:** Tất cả preview images phải có watermark để prevent unauthorized sharing

**Implementation:**

- API tự động apply watermark
- Frontend không cần xử lý watermark
- Watermark format do backend quyết định

---

## 🧪 Testing Requirements

### TR-1: Manual Test Cases

**Test Case 1: PDF Single Page**

```
GIVEN: Message has 1-page PDF attachment
WHEN: User clicks on PDF file
THEN:
  - Modal opens
  - First page displays
  - No pagination controls (only 1 page)
  - Close button works
```

**Test Case 2: PDF Multi-Page**

```
GIVEN: Message has 5-page PDF attachment
WHEN: User clicks on PDF file
THEN:
  - Modal opens
  - Page indicator shows "Page 1 of 5"
  - Next button enabled, Prev button disabled
WHEN: User clicks Next
THEN:
  - Page indicator shows "Page 2 of 5"
  - Both buttons enabled
WHEN: User navigates to last page
THEN:
  - Page indicator shows "Page 5 of 5"
  - Next button disabled, Prev button enabled
```

**Test Case 3: Image File**

```
GIVEN: Message has JPG attachment
WHEN: User clicks on image file
THEN:
  - Modal opens
  - Image displays with watermark
  - No pagination controls
  - Image fits container width
```

**Test Case 4: Error Handling**

```
GIVEN: File ID is invalid/deleted
WHEN: User clicks on file
THEN:
  - Modal opens
  - Error state displays
  - "File not found" message shown
  - Retry button available
```

---

### TR-2: Unit Test Coverage

**Components to Test:**

✅ `FilePreviewModal.tsx`

- ✅ Renders with file ID
- ✅ Calls page count API on mount
- ✅ Calls render page API for current page
- ✅ Next/Prev navigation works
- ✅ Close button closes modal
- ✅ ESC key closes modal
- ✅ Handles API errors

✅ `usePdfPreview.ts` hook

- ✅ Fetches first page from /preview endpoint
- ✅ Parses X-Total-Pages header correctly
- ✅ Fetches subsequent pages from /render endpoint
- ✅ Caches rendered pages
- ✅ Handles loading states
- ✅ Handles error states (missing headers, invalid page count)

---

### TR-3: E2E Test Scenarios

**Scenario 1: Happy Path**

```gherkin
Feature: PDF Preview in Chat

Scenario: User previews multi-page PDF
  Given I am logged in
  And I am viewing a chat conversation
  And there is a message with a 3-page PDF attachment
  When I click on the PDF file name
  Then the preview modal should open
  And I should see "Page 1 of 3"
  And the first page should be displayed
  When I click the "Next" button
  Then I should see "Page 2 of 3"
  And the second page should be displayed
  When I press the ESC key
  Then the modal should close
  And I should return to the chat view
```

---

## 📊 Performance Requirements

### PR-1: Load Time

- **First page display:** < 2 seconds
- **Page navigation:** < 1 second (cached)
- **Page navigation:** < 2 seconds (not cached)

### PR-2: Image Quality

- **DPI:** 300 (good balance quality/size)
- **Format:** PNG (lossless for text clarity)
- **Max file size per page:** ~500KB

### PR-3: Caching

- **Browser cache:** Rendered pages cached locally
- **Cache duration:** Session-based (cleared on logout)
- **Cache key:** `fileId-pageNumber-dpi`

---

## 🔗 API Integration

> ✅ **API Status:** Documented in contract.md

### API Endpoints Used:

1. **GET /api/Files/{id}/preview**

   - Purpose: Preview file + lấy page count từ headers
   - Response Body: Binary image (first page với watermark)
   - Response Headers: `X-Total-Pages`, `X-Current-Page`
   - [Contract](../../../../api/chat/file-preview/contract.md#3-preview-file-first-page)

2. **GET /api/pdf/{fileId}/pages/{pageNumber}/render**

   - Purpose: Render page 2+ thành image
   - Params: `pageNumber` (1-based), `dpi` (default 300)
   - Response: Binary PNG image
   - [Contract](../../../../api/chat/file-preview/contract.md#2-render-single-pdf-page)

**Flow:**

```
Load first page → Read X-Total-Pages header → Navigate to other pages
```

---

## 🚀 Out of Scope (Future Phases)

❌ Download button (use existing download from Phase 1)  
❌ Zoom in/out controls for images  
❌ Full-screen mode  
❌ Print functionality  
❌ Share/send file to another chat  
❌ Edit/annotate PDF  
❌ Support for Office files (Word, Excel, PPT) - requires conversion

---

## ⏳ HUMAN DECISIONS

| #   | Decision Point                 | Options                       | HUMAN Choice     |
| --- | ------------------------------ | ----------------------------- | ---------------- |
| 1   | Modal close on backdrop click? | Yes / No                      | ⬜ \***Yes**     |
| 2   | Preload next page?             | Yes / No                      | ⬜ \***No**      |
| 3   | Show thumbnail strip?          | Yes / No / Future             | ⬜ \***Future**  |
| 4   | DPI setting                    | 150 / 300 / 600               | ⬜ \***300**     |
| 5   | Cache strategy                 | Session / LocalStorage / None | ⬜ \***Session** |

---

## 📋 IMPACT SUMMARY

### Files Tạo Mới:

- `src/components/FilePreviewModal.tsx` - Modal component
- `src/components/PdfPageViewer.tsx` - PDF page display
- `src/hooks/usePdfPreview.ts` - PDF preview logic hook
- `src/api/filePreview.api.ts` - API client
- `src/types/filePreview.ts` - TypeScript types

### Files Sửa Đổi:

- `src/features/portal/components/ChatMainContainer.tsx`
  - Add onClick handler cho file attachments
  - Import và sử dụng FilePreviewModal
  - Pass file ID to modal

### Dependencies Thêm:

- (Không có - sử dụng existing dependencies)

---

## ✅ HUMAN CONFIRMATION

| Hạng Mục                      | Status       |
| ----------------------------- | ------------ |
| Đã review Impact Summary      | ✅ Đã review |
| Đã điền Pending Decisions     | ✅ Đã điền   |
| **APPROVED để tạo wireframe** | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-08

---

**Created:** 2026-01-08  
**Approved:** 2026-01-08  
**Next Step:** Create wireframe document (BƯỚC 2A)

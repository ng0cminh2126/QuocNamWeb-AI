# [BƯỚC 6] Testing Requirements - File Upload Phase 2

> **Feature:** Upload nhiều file & Hiển thị ảnh dạng grid  
> **Version:** 2.0.0  
> **Status:** ⏳ PENDING APPROVAL  
> **Created:** 2026-01-14  
> **Module:** chat

---

## 📋 Version History

| Version | Date       | Changes                               |
| ------- | ---------- | ------------------------------------- |
| 2.0.0   | 2026-01-14 | Initial test requirements for Phase 2 |

---

## 🎯 Testing Objectives

1. **Batch Upload API** - Verify batch upload works correctly with 2-10 files
2. **Partial Success Handling** - Test scenarios where some files fail
3. **Image Grid Display** - Verify responsive grid layout (3 cols → 2 cols)
4. **API Selection Logic** - Ensure correct API (single vs batch) is used
5. **Error Handling** - Validate all error scenarios and user feedback
6. **Backward Compatibility** - Ensure Phase 1 single file upload still works

---

## 📊 Test Coverage Matrix

| Implementation File                                           | Test File                                              | Test Cases | Priority |
| ------------------------------------------------------------- | ------------------------------------------------------ | ---------- | -------- |
| `src/api/files.api.ts`                                        | `src/api/__tests__/files.api.test.ts`                  | 4          | HIGH     |
| `src/hooks/mutations/useUploadFilesBatch.ts`                  | `src/hooks/__tests__/useUploadFilesBatch.test.ts`      | 5          | HIGH     |
| `src/utils/fileHelpers.ts`                                    | `src/utils/__tests__/fileHelpers.test.ts`              | 3          | HIGH     |
| `src/components/chat/ImageGrid.tsx`                           | `src/components/chat/__tests__/ImageGrid.test.tsx`     | 4          | HIGH     |
| `src/components/chat/ImageGridItem.tsx`                       | `src/components/chat/__tests__/ImageGridItem.test.tsx` | 4          | MEDIUM   |
| `src/features/portal/components/chat/ChatMainContainer.tsx`   | `__tests__/ChatMainContainer.test.tsx`                 | 4          | HIGH     |
| `src/features/portal/components/chat/MessageBubbleSimple.tsx` | `__tests__/MessageBubbleSimple.test.tsx`               | 4          | HIGH     |
| **TOTAL**                                                     | **7 test files**                                       | **28**     | -        |

---

## 🧪 Detailed Test Cases

### TC-01: API Client Tests (`files.api.test.ts`)

#### TC-01.1: Upload multiple files successfully

**Given:**

- 2 valid files (file1.pdf, file2.jpg)

**When:**

- Call `uploadFilesBatch([file1, file2])`

**Then:**

- POST /api/Files/batch is called
- FormData contains both files
- Response has `successCount: 2, failedCount: 0`
- All results have `success: true` and valid `fileId`

**Priority:** HIGH

---

#### TC-01.2: Handle partial success

**Given:**

- 2 files: 1 valid (file1.pdf, 5MB), 1 invalid (file2.jpg, 15MB)

**When:**

- Call `uploadFilesBatch([file1, file2])`

**Then:**

- Response has `successCount: 1, failedCount: 1`
- `results[0].success === true` with fileId
- `results[1].success === false` with error message "File size exceeds limit"

**Priority:** HIGH

---

#### TC-01.3: Throw error if no files provided

**Given:**

- Empty array `[]`

**When:**

- Call `uploadFilesBatch([])`

**Then:**

- Throws error "No files to upload"

**Priority:** MEDIUM

---

#### TC-01.4: Throw error if more than 10 files

**Given:**

- 11 files

**When:**

- Call `uploadFilesBatch(files)`

**Then:**

- Throws error "Maximum 10 files per batch"

**Priority:** MEDIUM

---

### TC-02: Mutation Hook Tests (`useUploadFilesBatch.test.ts`)

#### TC-02.1: Upload files successfully

**Given:**

- Hook initialized with no options
- 2 valid files

**When:**

- Call `mutation.mutate(files)`

**Then:**

- `mutation.isSuccess === true`
- `mutation.data` contains BatchUploadResult
- `mutation.data.allSuccess === true`

**Priority:** HIGH

---

#### TC-02.2: Handle error

**Given:**

- Hook initialized
- API will fail with "Upload failed"

**When:**

- Call `mutation.mutate(files)`

**Then:**

- `mutation.isError === true`
- `mutation.error.message === "Upload failed"`

**Priority:** HIGH

---

#### TC-02.3: Call onSuccess callback

**Given:**

- Hook with `onSuccess` callback
- 2 valid files

**When:**

- Upload succeeds

**Then:**

- `onSuccess` is called with BatchUploadResult
- Callback receives correct `successCount`

**Priority:** HIGH

---

#### TC-02.4: Call onError callback

**Given:**

- Hook with `onError` callback
- API will fail

**When:**

- Upload fails

**Then:**

- `onError` is called with Error object

**Priority:** MEDIUM

---

#### TC-02.5: Handle partial success

**Given:**

- Hook initialized
- API returns partial success (1/2 files uploaded)

**When:**

- Upload completes

**Then:**

- `mutation.isSuccess === true` (because API responded 200)
- `mutation.data.partialSuccess === true`

**Priority:** HIGH

---

### TC-03: File Helpers Tests (`fileHelpers.test.ts`)

#### TC-03.1: Pass valid batch

**Given:**

- 3 files: each 5MB, total 15MB

**When:**

- Call `validateBatchFileSelection(files)`

**Then:**

- `result.valid === true`
- `result.errors === []`

**Priority:** HIGH

---

#### TC-03.2: Fail if too many files

**Given:**

- 11 files

**When:**

- Call `validateBatchFileSelection(files)`

**Then:**

- `result.valid === false`
- `result.errors` contains "Maximum 10 files allowed per message"

**Priority:** HIGH

---

#### TC-03.3: Fail if total size exceeds limit

**Given:**

- 2 files: 30MB + 30MB = 60MB (exceeds 50MB limit)

**When:**

- Call `validateBatchFileSelection(files)`

**Then:**

- `result.valid === false`
- `result.errors` contains "Total files size ... exceeds 50MB limit"

**Priority:** HIGH

---

### TC-04: ImageGrid Component Tests (`ImageGrid.test.tsx`)

#### TC-04.1: Render grid with images

**Given:**

- 3 image attachments

**When:**

- Render `<ImageGrid images={images} />`

**Then:**

- Grid element exists with `data-testid="image-grid"`
- `role="grid"` attribute present
- `aria-label="Image grid with 3 images"`
- 3 ImageGridItem components rendered

**Priority:** HIGH

---

#### TC-04.2: Call onImageClick when image clicked

**Given:**

- Grid with 3 images
- `onImageClick` callback

**When:**

- User clicks first image

**Then:**

- `onImageClick` is called with `(fileId, fileName)`

**Priority:** HIGH

---

#### TC-04.3: Render null if no images

**Given:**

- Empty images array `[]`

**When:**

- Render `<ImageGrid images={[]} />`

**Then:**

- Component returns `null`
- No grid element in DOM

**Priority:** MEDIUM

---

#### TC-04.4: Apply custom className

**Given:**

- Custom className "custom-class"

**When:**

- Render `<ImageGrid className="custom-class" />`

**Then:**

- Grid element has class "custom-class"

**Priority:** LOW

---

### TC-05: ImageGridItem Component Tests (`ImageGridItem.test.tsx`)

#### TC-05.1: Render placeholder initially

**Given:**

- ImageGridItem not yet visible

**When:**

- Render component

**Then:**

- Placeholder element with `data-testid="image-grid-item-placeholder"` exists
- No image fetching occurs

**Priority:** HIGH

---

#### TC-05.2: Load and display image

**Given:**

- Component becomes visible (Intersection Observer triggers)
- API returns valid image blob

**When:**

- Image loads

**Then:**

- Image element with correct `src` and `alt` attributes
- `data-testid="image-grid-item-{fileId}"`
- Loading spinner disappears

**Priority:** HIGH

---

#### TC-05.3: Show error state on load failure

**Given:**

- Component becomes visible
- API throws error

**When:**

- Image fetch fails

**Then:**

- Error element with `data-testid="image-grid-item-error"`
- Text "Failed to load" displayed
- Click still works (opens preview)

**Priority:** MEDIUM

---

#### TC-05.4: Call onClick when clicked

**Given:**

- Image loaded successfully
- `onClick` callback

**When:**

- User clicks image

**Then:**

- `onClick` is called

**Priority:** HIGH

---

### TC-06: ChatMainContainer Tests (`ChatMainContainer.test.tsx`)

#### TC-06.1: Upload multiple files using batch API

**Given:**

- User selects 2 files (file1.pdf, file2.jpg)

**When:**

- User clicks send button

**Then:**

- `uploadFilesBatch` is called with both files
- Single upload API is NOT called

**Priority:** HIGH

---

#### TC-06.2: Use single upload API for 1 file

**Given:**

- User selects 1 file

**When:**

- User clicks send button

**Then:**

- `uploadFile` (single) is called
- `uploadFilesBatch` is NOT called

**Priority:** HIGH

---

#### TC-06.3: Show validation error for too many files

**Given:**

- User selects 11 files

**When:**

- Files are selected

**Then:**

- Toast error "Maximum 10 files allowed"
- Files are NOT added to preview

**Priority:** MEDIUM

---

#### TC-06.4: Handle partial upload success

**Given:**

- User selects 2 files
- API returns partial success (1/2 uploaded)

**When:**

- Upload completes

**Then:**

- Toast warning "1/2 files uploaded. 1 failed."
- Message sent with 1 successful file
- Failed file remains in preview (for future retry - Phase 3)

**Priority:** HIGH

---

### TC-07: MessageBubbleSimple Tests (`MessageBubbleSimple.test.tsx`)

#### TC-07.1: Render ImageGrid for multiple images

**Given:**

- Message with 2 image attachments

**When:**

- Render MessageBubbleSimple

**Then:**

- ImageGrid component is rendered
- `data-testid="image-grid"` exists

**Priority:** HIGH

---

#### TC-07.2: Render single MessageImage for 1 image

**Given:**

- Message with 1 image attachment

**When:**

- Render MessageBubbleSimple

**Then:**

- ImageGrid is NOT rendered
- Existing MessageImage component is used (Phase 1 behavior)

**Priority:** HIGH

---

#### TC-07.3: Render mixed content (images + files)

**Given:**

- Message with 2 images + 1 PDF file

**When:**

- Render MessageBubbleSimple

**Then:**

- ImageGrid with 2 images displayed
- PDF file listed separately below grid

**Priority:** HIGH

---

#### TC-07.4: Call onFilePreviewClick when grid image clicked

**Given:**

- Message with 2 images
- `onFilePreviewClick` callback

**When:**

- User clicks image in grid

**Then:**

- `onFilePreviewClick` is called with `(fileId, fileName)`

**Priority:** MEDIUM

---

## 🧩 Test Data & Mocks

### Mock Files

```typescript
// src/test/fixtures/mockFiles.ts
export const mockPdfFile = new File(["PDF content"], "report.pdf", {
  type: "application/pdf",
});

export const mockJpgFile = new File(["JPG content"], "photo.jpg", {
  type: "image/jpeg",
});

export const mockLargeFile = new File(
  [new ArrayBuffer(15 * 1024 * 1024)], // 15MB
  "large.pdf",
  { type: "application/pdf" }
);

export const mockBatchFiles = [mockPdfFile, mockJpgFile];
```

### Mock API Responses

```typescript
// src/test/fixtures/batchUploadResults.ts
import type { BatchUploadResult } from "@/types/files";

export const mockBatchUploadSuccess: BatchUploadResult = {
  totalFiles: 2,
  successCount: 2,
  failedCount: 0,
  results: [
    {
      index: 0,
      success: true,
      fileId: "file-id-1",
      fileName: "report.pdf",
      contentType: "application/pdf",
      size: 1024,
      storagePath: "/path/file1.pdf",
      error: null,
    },
    {
      index: 1,
      success: true,
      fileId: "file-id-2",
      fileName: "photo.jpg",
      contentType: "image/jpeg",
      size: 2048,
      storagePath: "/path/file2.jpg",
      error: null,
    },
  ],
  allSuccess: true,
  partialSuccess: false,
};

export const mockBatchUploadPartialSuccess: BatchUploadResult = {
  totalFiles: 2,
  successCount: 1,
  failedCount: 1,
  results: [
    {
      index: 0,
      success: true,
      fileId: "file-id-1",
      fileName: "report.pdf",
      contentType: "application/pdf",
      size: 1024,
      storagePath: "/path/file1.pdf",
      error: null,
    },
    {
      index: 1,
      success: false,
      fileId: null,
      fileName: "large.pdf",
      contentType: "application/pdf",
      size: 15728640,
      storagePath: null,
      error: "File size exceeds limit",
    },
  ],
  allSuccess: false,
  partialSuccess: true,
};

export const mockBatchUploadFullFailure: BatchUploadResult = {
  totalFiles: 2,
  successCount: 0,
  failedCount: 2,
  results: [
    {
      index: 0,
      success: false,
      fileId: null,
      fileName: "file1.pdf",
      contentType: null,
      size: null,
      storagePath: null,
      error: "Invalid file type",
    },
    {
      index: 1,
      success: false,
      fileId: null,
      fileName: "file2.pdf",
      contentType: null,
      size: null,
      storagePath: null,
      error: "File too large",
    },
  ],
  allSuccess: false,
  partialSuccess: false,
};
```

### Mock Message with Multiple Images

```typescript
// src/test/fixtures/mockMessages.ts
import type { ChatMessage } from "@/types/messages";

export const mockMessageWithMultipleImages: ChatMessage = {
  id: "msg-1",
  conversationId: "conv-1",
  senderId: "user-1",
  senderName: "John Doe",
  content: "Check out these photos!",
  contentType: "FILE",
  sentAt: "2026-01-14T10:00:00Z",
  attachments: [
    {
      id: "att-1",
      fileId: "file-1",
      fileName: "photo1.jpg",
      fileSize: 1024000,
      contentType: "image/jpeg",
      createdAt: "2026-01-14T10:00:00Z",
    },
    {
      id: "att-2",
      fileId: "file-2",
      fileName: "photo2.jpg",
      fileSize: 2048000,
      contentType: "image/jpeg",
      createdAt: "2026-01-14T10:00:00Z",
    },
    {
      id: "att-3",
      fileId: "file-3",
      fileName: "photo3.jpg",
      fileSize: 3072000,
      contentType: "image/jpeg",
      createdAt: "2026-01-14T10:00:00Z",
    },
  ],
  replyCount: 0,
  isStarred: false,
  isPinned: false,
  mentions: [],
};

export const mockMessageWithMixedAttachments: ChatMessage = {
  id: "msg-2",
  conversationId: "conv-1",
  senderId: "user-1",
  senderName: "John Doe",
  content: "Files from meeting",
  contentType: "FILE",
  sentAt: "2026-01-14T10:00:00Z",
  attachments: [
    {
      id: "att-1",
      fileId: "file-1",
      fileName: "photo1.jpg",
      fileSize: 1024000,
      contentType: "image/jpeg",
      createdAt: "2026-01-14T10:00:00Z",
    },
    {
      id: "att-2",
      fileId: "file-2",
      fileName: "photo2.jpg",
      fileSize: 2048000,
      contentType: "image/jpeg",
      createdAt: "2026-01-14T10:00:00Z",
    },
    {
      id: "att-3",
      fileId: "file-3",
      fileName: "report.pdf",
      fileSize: 5120000,
      contentType: "application/pdf",
      createdAt: "2026-01-14T10:00:00Z",
    },
  ],
  replyCount: 0,
  isStarred: false,
  isPinned: false,
  mentions: [],
};
```

---

## 🎭 E2E Test Scenarios (Playwright)

### E2E-01: Upload 5 images and verify grid display

**Preconditions:**

- User logged in
- Conversation open

**Steps:**

1. Click file upload button
2. Select 5 image files
3. Verify file preview shows 5 files
4. Click send button
5. Wait for upload completion
6. Verify message appears with 5 images in grid (3 + 2 rows)

**Expected:**

- Desktop: 3 images in row 1, 2 images in row 2
- Mobile: 2 images per row, total 3 rows
- Grid uses CSS Grid layout
- Each image is square (aspect-ratio 1:1)

**Priority:** MEDIUM

---

### E2E-02: Upload 1 file vs 5 files (API switch)

**Preconditions:**

- User logged in
- Conversation open
- Network tab monitoring enabled

**Steps:**

1. Upload 1 file → Send
2. Verify network call: `POST /api/Files` (single)
3. Upload 5 files → Send
4. Verify network call: `POST /api/Files/batch`

**Expected:**

- Single file uses Phase 1 API
- Multiple files use Phase 2 batch API

**Priority:** HIGH

---

### E2E-03: Partial success - 3/5 files uploaded

**Preconditions:**

- User logged in
- Mock backend to simulate partial success

**Steps:**

1. Select 5 files (3 valid, 2 will fail)
2. Click send
3. Wait for upload

**Expected:**

- Toast warning: "3/5 files uploaded. 2 failed."
- Message sent with 3 files only
- File preview still shows 2 failed files (for retry)
- Failed files have red border + error message

**Priority:** MEDIUM

---

### E2E-04: Exceed validation limits

**Preconditions:**

- User logged in
- Conversation open

**Steps:**

1. Select 11 files → Verify error toast "Maximum 10 files"
2. Select 2 files totaling 60MB → Verify error "Total size exceeds 50MB"
3. Select 1 file 15MB → Verify error "File exceeds 10MB limit"

**Expected:**

- Validation errors shown immediately
- Files NOT added to preview
- Send button remains enabled (but won't work without valid files)

**Priority:** MEDIUM

---

### E2E-05: Click image in grid opens preview modal

**Preconditions:**

- Message with 3 images exists

**Steps:**

1. Scroll to message
2. Click second image in grid

**Expected:**

- ImagePreviewModal opens
- Preview shows second image
- Modal has close button and ESC key works

**Priority:** LOW

---

## 📋 Test Generation Checklist

### Before Writing Tests:

- [ ] All implementation files created
- [ ] Types defined in `src/types/files.ts`
- [ ] API client `uploadFilesBatch()` implemented
- [ ] Mutation hook `useUploadFilesBatch` implemented
- [ ] Components `ImageGrid`, `ImageGridItem` implemented

### Test Files to Create:

- [ ] `src/api/__tests__/files.api.test.ts` - 4 cases
- [ ] `src/hooks/__tests__/useUploadFilesBatch.test.ts` - 5 cases
- [ ] `src/utils/__tests__/fileHelpers.test.ts` - 3 cases (add to existing)
- [ ] `src/components/chat/__tests__/ImageGrid.test.tsx` - 4 cases
- [ ] `src/components/chat/__tests__/ImageGridItem.test.tsx` - 4 cases
- [ ] `src/features/portal/components/chat/__tests__/ChatMainContainer.test.tsx` - 4 cases (add)
- [ ] `src/features/portal/components/chat/__tests__/MessageBubbleSimple.test.tsx` - 4 cases (add)

### Test Fixtures to Create:

- [ ] `src/test/fixtures/mockFiles.ts`
- [ ] `src/test/fixtures/batchUploadResults.ts`
- [ ] `src/test/fixtures/mockMessages.ts` (add to existing)

### After Writing Tests:

- [ ] All unit tests pass (`npm run test`)
- [ ] Test coverage ≥ 80% for new code
- [ ] E2E tests planned in Playwright
- [ ] Manual testing completed

---

## 🎯 Acceptance Criteria

### Unit Tests:

✅ **PASS** if:

- All 28 test cases pass
- Code coverage ≥ 80% for new files
- No console errors or warnings
- Tests run in < 30 seconds

❌ **FAIL** if:

- Any test fails
- Coverage < 80%
- Tests timeout or hang

### Integration Tests:

✅ **PASS** if:

- ChatMainContainer correctly switches APIs (single vs batch)
- Partial success handled correctly
- Error toasts displayed
- Message sent with successful files only

### E2E Tests:

✅ **PASS** if:

- Image grid displays correctly on desktop and mobile
- File upload and send message work end-to-end
- Validation errors shown properly
- Preview modal opens when clicking grid image

---

## 📊 Coverage Goals

| Category   | Target Coverage | Minimum Coverage |
| ---------- | --------------- | ---------------- |
| Statements | 90%             | 80%              |
| Branches   | 85%             | 75%              |
| Functions  | 90%             | 80%              |
| Lines      | 90%             | 80%              |

**Critical Paths (Must be 100%):**

- `uploadFilesBatch()` - All branches
- `validateBatchFileSelection()` - All validation rules
- API selection logic in ChatMainContainer (1 file vs multiple)
- Partial success handling

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                 | Status       |
| ------------------------ | ------------ |
| Đã review test cases     | ✅ Đã review |
| Đã review test coverage  | ✅ Đã review |
| Đã review E2E scenarios  | ✅ Đã review |
| **APPROVED để thực thi** | ✅ APPROVED  |

**HUMAN Signature:** MINH - ĐÃ DUYỆT  
**Date:** 2026-01-14

> ✅ **Testing requirements đã được approve - Ready to write tests**

---

## 🔗 References

- [Requirements](./01_requirements.md) ✅ APPROVED
- [Implementation Plan](./04_implementation-plan.md) ⏳ PENDING
- [Testing Strategy Guide](../../../../guides/testing_strategy_20251226_claude_opus_4_5.md)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)

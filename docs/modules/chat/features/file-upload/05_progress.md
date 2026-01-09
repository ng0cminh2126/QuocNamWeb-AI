# [BƯỚC 5] Progress Tracking - File Upload

> **Feature:** Upload File & Image trong Chat  
> **Last Update:** 2026-01-06  
> **Overall Progress:** Phase 1 (100% ✅) + Phase 2 (100% ✅) - API Integration Complete

---

## 📊 Overall Progress

```
████████████ 100% Phase 1 Complete (UI Only)
████████████ 100% Phase 2 Complete (API Integration)
```

| Phase                   | Status  | Progress | Started    | Completed  |
| ----------------------- | ------- | -------- | ---------- | ---------- |
| **Phase 1: UI Only**    | ✅ Done | 100%     | 2026-01-06 | 2026-01-06 |
| **Phase 2: API Upload** | ✅ Done | 100%     | 2026-01-06 | 2026-01-06 |
| **Phase 3: Advanced**   | ⏳ Plan | 0%       | -          | -          |

### Phase 2 Breakdown (API Integration)

| Task                        | Status  | Tests    | Completed  |
| --------------------------- | ------- | -------- | ---------- |
| API Client (fileClient.ts)  | ✅ Done | -        | 2026-01-06 |
| Upload Function (files.api) | ✅ Done | 10/10 ✅ | 2026-01-06 |
| Mutation Hook               | ✅ Done | 9/9 ✅   | 2026-01-06 |
| ChatMainContainer Update    | ✅ Done | Manual   | 2026-01-06 |
| FilePreview Progress UI     | ✅ Done | Manual   | 2026-01-06 |
| **Total Tests**             | -       | 19/19 ✅ | -          |

---

## ✅ Completed Milestones

### 2026-01-06: Phase 2 API Integration Complete 🎉

**What's New:**

- ✅ Real API upload to Vega File API (sequential multi-file)
- ✅ Progress tracking per file (inline progress bars)
- ✅ Error handling với toast notifications
- ✅ Partial success handling (block send if any file fails)
- ✅ Send button disabled during upload
- ✅ Progress UI cleared after 2s (configurable)

**Files Created:**

- ✅ `src/api/fileClient.ts` - Dedicated Axios instance for File API

  - Environment-based baseURL (DEV/PROD)
  - Request interceptor (Bearer token)
  - Response interceptor (user-friendly errors)
  - 60s timeout for file uploads

- ✅ `src/api/files.api.ts` - uploadFile function

  - FormData creation
  - Query params (sourceModule, sourceEntityId)
  - Progress callback (onUploadProgress)
  - Returns UploadFileResult

- ✅ `src/api/__tests__/files.api.test.ts` - **10 tests ✅**

  - upload success
  - FormData validation
  - query params
  - sourceEntityId
  - progress callback
  - error handling (401, 400, 413, 415, network)

- ✅ `src/hooks/mutations/useUploadFiles.ts` - Mutation hook

  - Sequential upload loop (for multi-file)
  - Progress tracking per file
  - Error collection
  - Toast notifications
  - Returns {fileIds, successCount, failedCount, errors}

- ✅ `src/hooks/mutations/__tests__/useUploadFiles.test.tsx` - **9 tests ✅**
  - single/multiple uploads
  - fileIds returned
  - partial success
  - progress callbacks
  - error toast
  - errors array
  - all files fail
  - sequential order

**Files Modified:**

- ✅ `src/types/files.ts`

  - Added `UploadFileResult` interface
  - Added `FileUploadProgressState` interface

- ✅ `src/components/FilePreview.tsx`

  - Added `uploadProgress` prop (Map<string, FileUploadProgressState>)
  - Added inline progress bars (Decision #2)
  - Added retry button (Decision #3 - for Phase 3)
  - Added error message display
  - Changed layout to flex-col for progress UI

- ✅ `src/features/portal/components/ChatMainContainer.tsx`
  - Added `uploadProgress` state (Map)
  - Added `isUploading` state
  - Added `useUploadFiles()` hook
  - Modified `handleSend` to upload files before sending
  - Progress tracking per file
  - Partial success handling (Decision #4)
  - Send button disabled during upload (Decision #9)
  - Clear progress after 2s (Decision #10)

**Dependencies Added:**

- ✅ `axios-mock-adapter@^2.1.0` (devDependency for testing)

**Test Results:**

```bash
✓ src/api/__tests__/files.api.test.ts (10 tests) 12ms
✓ src/hooks/mutations/__tests__/useUploadFiles.test.tsx (9 tests) 75ms

Test Files  2 passed (2)
Tests  19 passed (19)
Duration  1.09s
```

**No TypeScript Errors:** ✅ All files compile successfully

**Decisions Implemented:**

| #   | Decision         | Implementation                | Status |
| --- | ---------------- | ----------------------------- | ------ |
| 1   | Upload timing    | Upload when click Send        | ✅     |
| 2   | Progress UI      | Inline progress bars          | ✅     |
| 3   | Failed upload    | Keep + retry button (Phase 3) | ⏳     |
| 4   | Partial success  | Block send                    | ✅     |
| 5   | Retry            | Manual only                   | ✅     |
| 6   | API client       | Separate fileApiClient        | ✅     |
| 7   | sourceEntityId   | conversationId                | ✅     |
| 8   | Upload cancel    | Phase 3                       | ⏳     |
| 9   | Send blocking    | Disable button                | ✅     |
| 10  | Progress persist | Keep 2s then clear            | ✅     |

### 2026-01-06: API Documentation Complete 📡

**Environment Variables Added:**

- ✅ `VITE_DEV_FILE_API_URL` = https://vega-file-api-dev.allianceitsc.com
- ✅ `VITE_PROD_FILE_API_URL` = https://vega-file-api.allianceitsc.com

**API Documentation Created:**

- ✅ `docs/api/file/upload/contract.md` - Complete API specification
  - Endpoint: POST /api/Files
  - Request: multipart/form-data with file + sourceModule query param
  - Response: UploadFileResult (fileId, storagePath, fileName, contentType, size)
  - Authentication: Bearer token required
  - Error handling: 400, 401, 413, 415 status codes
  - TypeScript interfaces included

**Snapshot Files Created:**

- ✅ `docs/api/file/upload/snapshots/v1/README.md` - Capture instructions
- ✅ `docs/api/file/upload/snapshots/v1/success.json` - 201 Created response
- ✅ `docs/api/file/upload/snapshots/v1/error-400-missing-source-module.json` - Bad Request
- ✅ `docs/api/file/upload/snapshots/v1/error-401-unauthorized.json` - Unauthorized
- ✅ `docs/api/file/upload/snapshots/v1/error-413-file-too-large.json` - Payload Too Large
- ✅ `docs/api/file/upload/snapshots/v1/error-415-unsupported-media-type.json` - Unsupported Media Type

**Documentation Updates:**

- ✅ Updated `docs/ENV_CONFIG_SUMMARY.md` with File API URLs
- ✅ Updated `05_progress.md` with API documentation milestone

**Swagger API Analyzed:**

- ✅ Fetched OpenAPI 3.0.1 specification from Vega File API
- ✅ Documented POST /api/Files endpoint details
- ✅ Documented SourceModule enum (0=Task, 1=Chat, 2=Company, 3=User)
- ✅ Documented UploadFileResult response schema
- ✅ Documented all error responses

**Status:** ✅ Ready for Phase 2 implementation (actual file upload integration)

### 2026-01-06: Phase 2 Documentation Complete 📋

**Documents Created:**

- ✅ `07_phase2-implementation-plan.md` - Complete implementation plan for API integration
  - Multi-file sequential upload strategy
  - API client specification (files.api.ts)
  - Mutation hook specification (useUploadFiles.ts)
  - Integration changes (ChatMainContainer)
  - 10 Pending Decisions for HUMAN
  - Impact Summary with all files to create/modify
- ✅ `08_phase2-testing.md` - Test requirements for Phase 2
  - 26 test cases (10 API + 9 hook + 7 integration)
  - Test coverage matrix
  - Mock data and strategies
  - Test generation checklist

**Requirements Updated:**

- ✅ `01_requirements.md` - Added Phase 2 Requirements section
  - FR-08: API Integration (10 requirements)
  - FR-09: Multi-File Upload Strategy (6 requirements)
  - FR-10: Upload Progress & Feedback (7 requirements)
  - FR-11: Error Handling & Retry (5 requirements)
  - FR-12: Message Integration (5 requirements)
  - Phase 2 Pending Decisions (10 items)
  - Phase 2 Acceptance Criteria

**API Contract Updated:**

- ✅ `docs/api/file/upload/contract.md` - Added multi-file upload strategy section
  - API limitation documented (1 file per request)
  - Sequential upload solution with code examples
  - Upload flow diagram
  - Error handling in multi-file scenario
  - Performance considerations table

**Status:** ⏳ Phase 2 documentation ready for HUMAN approval

**Next Steps:**

1. HUMAN review Phase 2 Implementation Plan (07_phase2-implementation-plan.md)
2. HUMAN điền 10 Pending Decisions
3. HUMAN approve Phase 2 plan
4. HUMAN review và approve Test Requirements (08_phase2-testing.md)
5. AI proceed with Phase 2 implementation (API client + mutation hook + integration)

### 2026-01-06: API Documentation Complete 📡

**Test Files Created:**

- ✅ `src/utils/__tests__/fileHelpers.test.ts` - 22 test cases ✅ ALL PASS
- ✅ `src/utils/__tests__/fileValidation.test.ts` - 13 test cases ✅ ALL PASS
- ✅ `src/hooks/__tests__/useFileValidation.test.tsx` - 5 test cases ✅ ALL PASS
- ✅ `src/components/__tests__/FilePreview.test.tsx` - 6 test cases ✅ ALL PASS

**Test Documentation:**

- ✅ `docs/modules/chat/features/file-upload/06_testing.md` - Test requirements & matrix

**Test Coverage:**

- ✅ **46/46 tests passing** (100%)
- ✅ All utilities tested (fileHelpers, fileValidation)
- ✅ Hook tested with mocked toast
- ✅ Component tested with user interactions
- ✅ Accessibility attributes verified

**Test Results:**

```
Test Files  4 passed (4)
     Tests  46 passed (46)
  Duration  1.44s
```

### 2026-01-06: Implementation Complete 🎉

**Files Created:**

- ✅ `src/utils/fileHelpers.ts` - File helper utilities (9 functions)
- ✅ `src/utils/fileValidation.ts` - Validation utilities (5 functions)
- ✅ `src/hooks/useFileValidation.ts` - Validation hook with toast
- ✅ `src/components/FilePreview.tsx` - File preview component

**Files Modified:**

- ✅ `src/types/files.ts` - Added SelectedFile, FileValidationResult, FileValidationRules, constants
- ✅ `src/features/portal/components/ChatMainContainer.tsx` - Integrated file upload UI

**Features Implemented:**

- ✅ File upload button (📎 icon)
- ✅ Image upload button (🖼️ icon)
- ✅ Native file picker with accept filters
- ✅ File preview component with remove button
- ✅ Client-side validation (size, type, count)
- ✅ Error toast notifications (sonner)
- ✅ Auto-focus input after selection
- ✅ Clear files after send
- ✅ Memory cleanup (URL.revokeObjectURL)
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessibility (ARIA, keyboard, screen reader)
- ✅ data-testid attributes for E2E testing

**No TypeScript Errors:** ✅ All files compile successfully

### 2026-01-06: Wireframe Phase Complete

**Documents:**

- ✅ [02a_wireframe.md](./02a_wireframe.md) - UI wireframes created

**Deliverables:**

- ✅ WF-01: Upload buttons layout (desktop)
- ✅ WF-02: File preview component design
- ✅ WF-03: Error states (toast notifications)
- ✅ WF-04: Mobile layout
- ✅ WF-05: Dark mode design
- ✅ WF-06: Animation states
- ✅ Design tokens (colors, spacing, typography)
- ✅ Accessibility specifications (keyboard, screen reader, ARIA)

### 2026-01-06: Requirements Phase Complete

**Documents:**

- ✅ [00_README.md](./00_README.md) - Feature overview created
- ✅ [01_requirements.md](./01_requirements.md) - Detailed requirements documented
- ✅ [05_progress.md](./05_progress.md) - Progress tracking initialized

**Key Decisions (Pending HUMAN):**

- ⏳ Upload API endpoint (#5)
- ⏳ Upload before or with message (#8)
- ⏳ Error notification method (#9)
- ✅ File types: .pdf, .doc, .docx, .xls, .xlsx, images
- ✅ Multiple files: max 5
- ✅ Auto-focus: 0ms immediate
- ✅ Preview position: above input
- ✅ Image preview: thumbnail with modal
- ✅ Max file size: 10MB
- ✅ File name length: 40 chars

---

## 🔄 Current Work

### Pending: Implementation Plan Creation

**Current Task:** Chờ HUMAN review và approve wireframe

**Next Steps:**

1. HUMAN review 02a_wireframe.md
2. HUMAN điền pending decisions (toast library, component structure, animation)
3. HUMAN approve wireframe
4. AI skip flow diagram & API contract (UI-only phase)
5. AI tạo 04_implementation-plan.md

**Estimated completion:** After HUMAN approval

---

## 📅 Upcoming Work

1. **Wireframe** (02a_wireframe.md)

   - Upload button designs (file + image buttons)
   - File preview component mockup
   - Error states UI
   - Responsive layouts

2. **Flow Diagram** (02b_flow.md)

   - File selection flow
   - Validation flow
   - Upload process flow
   - Error handling flow

3. **API Contract** (03_api-contract.md)

   - Upload endpoint specification
   - Request/response formats
   - Error codes documentation

4. **Implementation Plan** (04_implementation-plan.md)

   - Component breakdown
   - File-by-file plan
   - Integration steps

5. **Testing** (06_testing.md)
   - Unit tests (validation, helpers)
   - Integration tests (upload flow)
   - E2E tests (user scenarios)

---

## 📝 Change Log

| Date       | Phase        | Action  | Details                       |
| ---------- | ------------ | ------- | ----------------------------- |
| 2026-01-06 | Overview     | Created | Feature overview initialized  |
| 2026-01-06 | Requirements | Created | Requirements document created |
| 2026-01-06 | Requirements | Pending | Waiting for HUMAN approval    |

---

## 🎯 Next Steps

1. ⏳ **HUMAN review** 01_requirements.md
2. ⏳ **HUMAN fill** pending decisions (#5, #8, #9)
3. ⏳ **HUMAN approve** requirements (tick ✅ APPROVED)
4. ⏳ **AI create** 02a_wireframe.md (after approval)
5. ⏳ **Get HUMAN approval** on wireframe
6. ⏳ **AI create** 02b_flow.md
7. ⏳ **Get HUMAN approval** on flow
8. ⏳ **Start coding** (after all approvals)

---

## 📈 Metrics

### Documents

| Type           | Created | Approved | Pending |
| -------------- | ------- | -------- | ------- |
| Requirements   | 1       | 0        | 1       |
| Design         | 0       | 0        | 2       |
| Implementation | 0       | 0        | 2       |
| **Total**      | **1**   | **0**    | **5**   |

### Code Files

| Type       | Created | Modified | Total |
| ---------- | ------- | -------- | ----- |
| Components | 0       | 0        | 2     |
| Hooks      | 0       | 0        | 2     |
| Utils      | 0       | 0        | 2     |
| API        | 0       | 0        | 1     |
| Types      | 0       | 0        | 1     |
| **Total**  | **0**   | **0**    | **8** |

---

## 📝 Notes

- Feature được tách từ conversation-detail để dễ quản lý
- Upload file là extension của message input, không phải standalone feature
- Cần confirm API endpoint với backend team trước khi code
- Phase 2 (upload progress, drag & drop) sẽ làm sau khi Phase 1 stable

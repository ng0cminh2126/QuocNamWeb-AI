# [BƯỚC 6] Testing Requirements - Phase 2 (API Integration)

> **Phase:** Phase 2 - File Upload API Integration  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-06  
> **Test Type:** Unit + Integration

---

## 📋 Overview

Phase 2 testing covers:

- API client (`files.api.ts`)
- Mutation hook (`useUploadFiles.ts`)
- Integration vào ChatMainContainer
- Multi-file sequential upload
- Error handling

Phase 1 testing (UI components) đã complete với 46/46 tests passing.

---

## 📊 Test Coverage Matrix - Phase 2

### API Client Tests

| Implementation File    | Test File                             | Test Cases | Priority |
| ---------------------- | ------------------------------------- | ---------- | -------- |
| `src/api/files.api.ts` | `src/api/__tests__/files.api.test.ts` | 10         | HIGH     |

### Mutation Hook Tests

| Implementation File                     | Test File                                               | Test Cases | Priority |
| --------------------------------------- | ------------------------------------------------------- | ---------- | -------- |
| `src/hooks/mutations/useUploadFiles.ts` | `src/hooks/mutations/__tests__/useUploadFiles.test.tsx` | 9          | HIGH     |

### Integration Tests

| Implementation File                                    | Test File                                                             | Test Cases | Priority |
| ------------------------------------------------------ | --------------------------------------------------------------------- | ---------- | -------- |
| `src/features/portal/components/ChatMainContainer.tsx` | `src/features/portal/components/__tests__/ChatMainContainer.test.tsx` | 7          | HIGH     |

**Total Phase 2 Tests:** 26 test cases

---

## 🧪 Detailed Test Cases

### 1. API Client Tests (`files.api.test.ts`)

**File:** `src/api/__tests__/files.api.test.ts`  
**Implementation:** `src/api/files.api.ts`

#### Test Suite: uploadFile()

| #    | Test Case                          | Description                     | Input                     | Expected Output                   | Priority |
| ---- | ---------------------------------- | ------------------------------- | ------------------------- | --------------------------------- | -------- |
| 1.1  | Upload file successfully           | Call uploadFile with valid file | File, sourceModule=1      | UploadFileResult with fileId      | HIGH     |
| 1.2  | Create FormData correctly          | Verify FormData contains file   | File object               | FormData.get('file') returns File | HIGH     |
| 1.3  | Include sourceModule in URL        | Verify query param              | sourceModule=1            | URL contains ?sourceModule=1      | HIGH     |
| 1.4  | Include sourceEntityId if provided | Verify optional param           | sourceEntityId="uuid"     | URL contains &sourceEntityId=uuid | MEDIUM   |
| 1.5  | Call onUploadProgress callback     | Verify progress tracking        | onUploadProgress callback | Callback called with progress %   | MEDIUM   |
| 1.6  | Handle 401 Unauthorized            | API returns 401                 | Invalid token             | Throws error with 401 status      | HIGH     |
| 1.7  | Handle 400 Bad Request             | API returns 400                 | Missing sourceModule      | Throws error with 400 status      | HIGH     |
| 1.8  | Handle 413 File Too Large          | API returns 413                 | 15MB file                 | Throws error with 413 status      | MEDIUM   |
| 1.9  | Handle 415 Unsupported Type        | API returns 415                 | .exe file                 | Throws error with 415 status      | MEDIUM   |
| 1.10 | Handle network error               | Network failure                 | Timeout                   | Throws network error              | MEDIUM   |

**Minimum:** 10 test cases

---

### 2. Mutation Hook Tests (`useUploadFiles.test.tsx`)

**File:** `src/hooks/mutations/__tests__/useUploadFiles.test.tsx`  
**Implementation:** `src/hooks/mutations/useUploadFiles.ts`

#### Test Suite: useUploadFiles()

| #   | Test Case                          | Description                | Input               | Expected Output                                   | Priority |
| --- | ---------------------------------- | -------------------------- | ------------------- | ------------------------------------------------- | -------- |
| 2.1 | Upload single file successfully    | Call mutation with 1 file  | 1 SelectedFile      | fileIds array with 1 id, successCount=1           | HIGH     |
| 2.2 | Upload multiple files sequentially | Call mutation with 3 files | 3 SelectedFiles     | fileIds array with 3 ids, successCount=3          | HIGH     |
| 2.3 | Return all fileIds on success      | Verify result structure    | 3 files uploaded    | {fileIds: [...], successCount: 3, failedCount: 0} | HIGH     |
| 2.4 | Handle partial success             | 1 file fails, 2 succeed    | 3 files, 1 fails    | successCount=2, failedCount=1, errors array       | HIGH     |
| 2.5 | Call onProgress for each file      | Verify progress callbacks  | onProgress callback | Called for each file with progress %              | MEDIUM   |
| 2.6 | Show error toast on failure        | File upload fails          | 1 file fails        | toast.error called with error message             | HIGH     |
| 2.7 | Return errors array                | Verify error structure     | 1 file fails        | errors: [{file, error: "..."}]                    | MEDIUM   |
| 2.8 | Handle all files fail              | All uploads fail           | 3 files, all fail   | successCount=0, failedCount=3, empty fileIds      | MEDIUM   |
| 2.9 | Sequential order maintained        | Verify upload order        | 3 files A, B, C     | Uploaded in order A → B → C                       | LOW      |

**Minimum:** 9 test cases

---

### 3. Integration Tests (`ChatMainContainer.test.tsx`)

**File:** `src/features/portal/components/__tests__/ChatMainContainer.test.tsx`  
**Implementation:** `src/features/portal/components/ChatMainContainer.tsx`

#### Test Suite: File Upload Integration

| #   | Test Case                           | Description                  | User Actions              | Expected Behavior                             | Priority |
| --- | ----------------------------------- | ---------------------------- | ------------------------- | --------------------------------------------- | -------- |
| 3.1 | Upload files before sending message | Select 2 files, click Send   | Select files → Click Send | uploadFilesMutation called before sendMessage | HIGH     |
| 3.2 | Attach fileIds to message           | Upload success, send message | Upload complete → Send    | sendMessage called with fileIds array         | HIGH     |
| 3.3 | Clear files after successful send   | Send message with files      | Send complete             | selectedFiles cleared, fileIds attached       | HIGH     |
| 3.4 | Show upload progress during upload  | Files uploading              | Upload in progress        | uploadProgress state updated per file         | MEDIUM   |
| 3.5 | Handle upload errors gracefully     | Upload fails                 | File upload error         | Error toast shown, user can retry or proceed  | HIGH     |
| 3.6 | Disable send button while uploading | Upload in progress           | Click Send during upload  | Send button disabled, loading state shown     | MEDIUM   |
| 3.7 | Allow retry on failed uploads       | Upload fails                 | Click retry button        | Re-upload failed files                        | LOW      |

**Minimum:** 7 test cases

---

## 🔧 Test Data & Mocks

### Mock Files

```typescript
// Test data
const mockFile1 = new File(["content"], "document.pdf", {
  type: "application/pdf",
});
const mockFile2 = new File(["image"], "photo.jpg", { type: "image/jpeg" });
const mockFile3 = new File(["data"], "spreadsheet.xlsx", {
  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
});

const mockSelectedFile = {
  id: "file-1",
  file: mockFile1,
  preview: null,
};
```

### Mock API Responses

```typescript
// Success response (201)
const mockUploadSuccess = {
  fileId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  storagePath: "chat/2024/01/06/3fa85f64.pdf",
  fileName: "document.pdf",
  contentType: "application/pdf",
  size: 1048576,
};

// Error response (400)
const mockError400 = {
  type: "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  title: "Bad Request",
  status: 400,
  detail: "The sourceModule field is required.",
};

// Error response (401)
const mockError401 = {
  type: "https://tools.ietf.org/html/rfc7235#section-3.1",
  title: "Unauthorized",
  status: 401,
  detail: "Authorization has been denied.",
};
```

### Mock Axios

```typescript
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mockAxios = new MockAdapter(axios);

// Success case
mockAxios.onPost("/api/Files").reply(201, mockUploadSuccess);

// Error cases
mockAxios.onPost("/api/Files").reply(400, mockError400);
mockAxios.onPost("/api/Files").reply(401, mockError401);
```

### Mock TanStack Query

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false, // Disable retry in tests
    },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
```

### Mock Toast

```typescript
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

// In tests
expect(toast.error).toHaveBeenCalledWith("Lỗi upload document.pdf", {
  description: expect.any(String),
});
```

---

## 📋 Test Generation Checklist

### API Client Tests

- [ ] Create `src/api/__tests__/files.api.test.ts`
- [ ] Import uploadFile function
- [ ] Mock axios with MockAdapter
- [ ] Test 1.1: Upload file successfully ✅
- [ ] Test 1.2: Create FormData correctly ✅
- [ ] Test 1.3: Include sourceModule in URL ✅
- [ ] Test 1.4: Include sourceEntityId if provided ✅
- [ ] Test 1.5: Call onUploadProgress callback ✅
- [ ] Test 1.6: Handle 401 Unauthorized ✅
- [ ] Test 1.7: Handle 400 Bad Request ✅
- [ ] Test 1.8: Handle 413 File Too Large ✅
- [ ] Test 1.9: Handle 415 Unsupported Type ✅
- [ ] Test 1.10: Handle network error ✅
- [ ] Run tests → all pass ✅

### Mutation Hook Tests

- [ ] Create `src/hooks/mutations/__tests__/useUploadFiles.test.tsx`
- [ ] Import useUploadFiles hook
- [ ] Setup QueryClientProvider wrapper
- [ ] Mock uploadFile API function
- [ ] Mock toast notifications
- [ ] Test 2.1: Upload single file successfully ✅
- [ ] Test 2.2: Upload multiple files sequentially ✅
- [ ] Test 2.3: Return all fileIds on success ✅
- [ ] Test 2.4: Handle partial success ✅
- [ ] Test 2.5: Call onProgress for each file ✅
- [ ] Test 2.6: Show error toast on failure ✅
- [ ] Test 2.7: Return errors array ✅
- [ ] Test 2.8: Handle all files fail ✅
- [ ] Test 2.9: Sequential order maintained ✅
- [ ] Run tests → all pass ✅

### Integration Tests

- [ ] Update `src/features/portal/components/__tests__/ChatMainContainer.test.tsx`
- [ ] Mock useUploadFiles hook
- [ ] Mock useSendMessage hook
- [ ] Test 3.1: Upload files before sending message ✅
- [ ] Test 3.2: Attach fileIds to message ✅
- [ ] Test 3.3: Clear files after successful send ✅
- [ ] Test 3.4: Show upload progress during upload ✅
- [ ] Test 3.5: Handle upload errors gracefully ✅
- [ ] Test 3.6: Disable send button while uploading ✅
- [ ] Test 3.7: Allow retry on failed uploads ✅
- [ ] Run tests → all pass ✅

---

## 🎯 Expected Test Results

```bash
# After implementing all tests

Test Files  3 passed (3)
     Tests  26 passed (26)
  Start at  ...
  Duration  2.5s

✅ src/api/__tests__/files.api.test.ts (10/10)
✅ src/hooks/mutations/__tests__/useUploadFiles.test.tsx (9/9)
✅ src/features/portal/components/__tests__/ChatMainContainer.test.tsx (7/7)
```

**Phase 1 + Phase 2 Total:** 46 + 26 = **72 tests**

---

## 📚 Testing Tools

| Tool                            | Purpose                | Version |
| ------------------------------- | ---------------------- | ------- |
| **Vitest**                      | Test runner            | ^1.0.0  |
| **@testing-library/react**      | Component testing      | ^14.0.0 |
| **@testing-library/user-event** | User interactions      | ^14.0.0 |
| **axios-mock-adapter**          | Mock axios requests    | ^1.22.0 |
| **@tanstack/react-query**       | Query client for hooks | ^5.0.0  |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                            | Status           |
| ----------------------------------- | ---------------- |
| Đã review test coverage matrix      | ⬜ Chưa review   |
| Đã review test cases                | ⬜ Chưa review   |
| Đã review mock data strategy        | ⬜ Chưa review   |
| Đã review test generation checklist | ⬜ Chưa review   |
| **APPROVED để tạo tests**           | ⬜ CHƯA APPROVED |

**HUMAN Signature:** [\_\_\_\_\_\_\_\_]  
**Date:** \_\_\_\_\_\_\_\_

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết test code nếu chưa APPROVED**

---

## 📝 Notes

- Phase 2 tests focus on **API integration** and **sequential upload logic**
- Phase 1 tests (UI components) already complete: 46/46 passing ✅
- Total tests after Phase 2: **72 tests** (46 + 26)
- Sequential upload testing is critical - verify upload order maintained
- Partial success scenarios must be thoroughly tested
- Error handling tests cover all API error codes (400, 401, 413, 415)

---

**Status:** ⏳ PENDING HUMAN APPROVAL  
**Next Step:** HUMAN review và approve test requirements

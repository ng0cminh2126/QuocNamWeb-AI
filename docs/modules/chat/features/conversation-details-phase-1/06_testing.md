# [BƯỚC 6] Testing Requirements - Conversation Detail

> **Feature:** Chi tiết đoạn chat  
> **Version:** 1.1.0  
> **Status:** ⏳ PENDING  
> **Last Update:** 2026-01-06 - Thêm test cases cho file upload & auto-focus

---

## 🧪 Test Coverage Matrix

### Files & Test Mapping

| Implementation File            | Test File                           | Test Cases  |
| ------------------------------ | ----------------------------------- | ----------- |
| `messages.api.ts`              | `messages.api.test.ts`              | 8           |
| `useMessages.ts`               | `useMessages.test.ts`               | 6           |
| `useSendMessage.ts`            | `useSendMessage.test.ts`            | 5 (✅ Done) |
| 🆕 `useUploadFile.ts`          | 🆕 `useUploadFile.test.ts`          | 7           |
| `MessageInput.tsx`             | `MessageInput.test.tsx`             | 12          |
| `MessageList.tsx`              | `MessageList.test.tsx`              | 8           |
| `MessageBubble.tsx`            | `MessageBubble.test.tsx`            | 6           |
| 🆕 `FileAttachmentPreview.tsx` | 🆕 `FileAttachmentPreview.test.tsx` | 6           |
| `ConversationDetail.tsx`       | `ConversationDetail.test.tsx`       | 10          |

**Total:** ~68 test cases (minimum)

---

## 📝 Detailed Test Cases

### 1. API Client Tests

**File:** `src/api/messages.api.test.ts`

| Test ID | Test Case                      | Type | Priority |
| ------- | ------------------------------ | ---- | -------- |
| API-01  | getMessages() success          | Unit | HIGH     |
| API-02  | getMessages() with pagination  | Unit | HIGH     |
| API-03  | sendMessage() success          | Unit | HIGH     |
| API-04  | sendMessage() with auth header | Unit | HIGH     |
| API-05  | getMessages() network error    | Unit | MEDIUM   |
| API-06  | sendMessage() 401 error        | Unit | MEDIUM   |
| API-07  | 🆕 uploadFile() success        | Unit | HIGH     |
| API-08  | 🆕 uploadFile() file too large | Unit | HIGH     |

### 2. 🆕 File Upload Hook Tests

**File:** `src/hooks/mutations/useUploadFile.test.ts`

| Test ID   | Test Case                     | Type | Priority | Description                        |
| --------- | ----------------------------- | ---- | -------- | ---------------------------------- |
| UPLOAD-01 | Upload file successfully      | Unit | HIGH     | POST với FormData, verify API call |
| UPLOAD-02 | Upload multiple files         | Unit | HIGH     | Queue uploads, track progress      |
| UPLOAD-03 | Validate file size (max 10MB) | Unit | HIGH     | Reject files > 10MB client-side    |
| UPLOAD-04 | Validate file type            | Unit | HIGH     | Only allow image, PDF, Excel, Word |
| UPLOAD-05 | Handle upload error (network) | Unit | MEDIUM   | Retry logic, error callback        |
| UPLOAD-06 | Handle upload error (401)     | Unit | MEDIUM   | Unauthorized, trigger re-auth      |
| UPLOAD-07 | Cancel upload in progress     | Unit | LOW      | AbortController, cleanup state     |

### 3. Message Input Component Tests

**File:** `src/features/chat/MessageInput.test.tsx`

| Test ID  | Test Case                          | Type      | Priority | Description                                |
| -------- | ---------------------------------- | --------- | -------- | ------------------------------------------ |
| INPUT-01 | Render input field                 | Component | HIGH     | Verify placeholder, data-testid            |
| INPUT-02 | Type message updates value         | Component | HIGH     | onChange updates state                     |
| INPUT-03 | Send button click sends message    | Component | HIGH     | onClick triggers mutation                  |
| INPUT-04 | Enter key sends message            | Component | HIGH     | onKeyDown Enter → send                     |
| INPUT-05 | Shift+Enter adds newline           | Component | MEDIUM   | onKeyDown Shift+Enter → \n                 |
| INPUT-06 | Clear input after send             | Component | HIGH     | Value = "" after send                      |
| INPUT-07 | 🆕 Auto-focus after send           | Component | HIGH     | input.focus() called after send            |
| INPUT-08 | 🆕 Attach button opens file picker | Component | HIGH     | Click [📎] → input[type="file"].click()    |
| INPUT-09 | 🆕 Image button opens image picker | Component | HIGH     | Click [🖼️] → input[accept="image/*"]       |
| INPUT-10 | 🆕 File preview shows after select | Component | HIGH     | File selected → preview component rendered |
| INPUT-11 | 🆕 Remove file from preview        | Component | MEDIUM   | Click [❌] → file removed from list        |
| INPUT-12 | 🆕 Auto-focus after file attach    | Component | MEDIUM   | File selected → input.focus() called       |

### 4. 🆕 File Attachment Preview Tests

**File:** `src/components/FileAttachmentPreview.test.tsx`

| Test ID    | Test Case                    | Type      | Priority | Description                        |
| ---------- | ---------------------------- | --------- | -------- | ---------------------------------- |
| PREVIEW-01 | Render file with icon        | Component | HIGH     | PDF → 📄, Excel → 📊, Image → 🖼️   |
| PREVIEW-02 | Display file name            | Component | HIGH     | Correct filename shown             |
| PREVIEW-03 | Display file size            | Component | HIGH     | Format bytes (2.5 MB)              |
| PREVIEW-04 | Remove button visible        | Component | HIGH     | [❌] button exists                 |
| PREVIEW-05 | Remove button click callback | Component | HIGH     | onClick → onRemove(file.id) called |
| PREVIEW-06 | Multiple files rendered      | Component | MEDIUM   | List of 3 files → 3 preview items  |

### 5. Message Query Hook Tests

**File:** `src/hooks/queries/useMessages.test.ts`

| Test ID  | Test Case                    | Type | Priority |
| -------- | ---------------------------- | ---- | -------- |
| QUERY-01 | Fetch messages success       | Unit | HIGH     |
| QUERY-02 | Infinite scroll (fetch next) | Unit | HIGH     |
| QUERY-03 | Correct query key generated  | Unit | HIGH     |
| QUERY-04 | Stale time = 30s             | Unit | MEDIUM   |
| QUERY-05 | Loading state                | Unit | MEDIUM   |
| QUERY-06 | Error state + retry          | Unit | MEDIUM   |

---

## 🔬 Test Data & Mocks

### Mock Files

```typescript
// Test file objects
export const mockImageFile = new File(["fake"], "test-image.jpg", {
  type: "image/jpeg",
});

export const mockPDFFile = new File(["fake pdf"], "report.pdf", {
  type: "application/pdf",
});

export const mockLargeFile = new File(
  [new ArrayBuffer(11 * 1024 * 1024)], // 11MB
  "large-file.pdf",
  { type: "application/pdf" }
);

export const mockInvalidFile = new File(["exe"], "virus.exe", {
  type: "application/x-msdownload",
});
```

### Mock API Responses

```typescript
// Upload success
export const mockUploadResponse = {
  fileId: "file-abc123",
  fileName: "report.pdf",
  fileUrl: "https://storage.example.com/files/file-abc123.pdf",
  fileSize: 2457600,
  mimeType: "application/pdf",
  uploadedAt: "2026-01-06T10:30:00Z",
};

// Upload error
export const mockUploadError = {
  error: {
    code: "FILE_TOO_LARGE",
    message: "File size exceeds 10MB limit",
    details: { maxSize: 10485760, actualSize: 15728640 },
  },
};
```

---

## 🧩 Test Generation Checklist

- [ ] All API clients have tests
- [ ] 🆕 useUploadFile hook tested
- [ ] 🆕 MessageInput file attach tested
- [ ] 🆕 MessageInput auto-focus tested
- [ ] 🆕 FileAttachmentPreview component tested
- [ ] All hooks have tests
- [ ] All components have tests
- [ ] Mock data created
- [ ] Snapshots captured (if needed)
- [ ] Coverage ≥ 80%

---

## 📊 Test Coverage Goals

| Category   | Target | Notes                     |
| ---------- | ------ | ------------------------- |
| API        | ≥ 90%  | Critical path coverage    |
| Hooks      | ≥ 85%  | Include error cases       |
| Components | ≥ 80%  | UI logic + interactions   |
| Utils      | ≥ 90%  | Pure functions, easy test |
| Overall    | ≥ 80%  | Project minimum           |

---

## 🎯 Test Execution

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific file
npm test -- MessageInput.test
npm test -- useUploadFile.test
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: npm test -- --coverage
- name: Check Coverage
  run: |
    if [ $(cat coverage/summary.json | jq '.total.lines.pct') -lt 80 ]; then
      echo "Coverage < 80%"
      exit 1
    fi
```

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                       | Status           |
| ------------------------------ | ---------------- |
| Đã review test coverage matrix | ⬜ Chưa review   |
| Đã review test cases mới       | ⬜ Chưa review   |
| Đã review file upload tests    | ⬜ Chưa review   |
| Đã review auto-focus tests     | ⬜ Chưa review   |
| Test requirements đầy đủ       | ⬜ Chưa xác nhận |
| **APPROVED để generate tests** | ⬜ CHƯA APPROVED |

**HUMAN Signature:** **\_\_**  
**Date:** 2026-01-06

> ⚠️ AI KHÔNG ĐƯỢC generate test code nếu chưa approve

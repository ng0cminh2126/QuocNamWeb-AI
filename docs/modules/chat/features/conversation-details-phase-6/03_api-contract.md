# [BƯỚC 3] API Contract - Chat UX Improvements (Phase 6)

> **Module:** Chat  
> **Feature:** Conversation Details Phase 6 - Error Handling & Persistence  
> **Document Type:** API Contract Reference  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-13

---

## 📋 Overview

Phase 6 tập trung vào error handling và persistence, KHÔNG có API mới. Feature này sử dụng các API đã tồn tại từ các phase trước:

- **Message Send API**: Đã có contract tại [docs/api/chat/messages/contract.md](../../../api/chat/messages/contract.md)
- **File Upload API**: Đã có contract tại [docs/api/file/upload/contract.md](../../../api/file/upload/contract.md)

---

## 📡 API Contracts Reference

### 1. Message Send API

**Contract:** [docs/api/chat/messages/contract.md](../../../api/chat/messages/contract.md)

**Usage trong Phase 6:**

- Gửi message với retry logic (max 3 lần)
- Handle network errors (offline, timeout, 5xx)
- Store failed messages vào localStorage để retry sau

**Error Handling cần implement:**

```typescript
// Network errors
- ERR_NETWORK: Không có kết nối mạng
- ECONNABORTED: Request timeout
- ERR_CONNECTION_REFUSED: Server không phản hồi

// HTTP errors
- 400: Bad Request → Hiện error message từ server
- 401: Unauthorized → Redirect to login
- 500: Internal Server Error → Cho phép retry
```

**Snapshots reference:**

- Success: [snapshots/v1/success.json](../../../api/chat/messages/snapshots/v1/success.json)
- Error 400: [snapshots/v1/error-400.json](../../../api/chat/messages/snapshots/v1/error-400.json)
- Error 500: [snapshots/v1/error-500.json](../../../api/chat/messages/snapshots/v1/error-500.json)

---

### 2. File Upload API

**Contract:** [docs/api/file/upload/contract.md](../../../api/file/upload/contract.md)

**Usage trong Phase 6:**

- Upload files với progress tracking
- Handle upload errors (network, size limit, format)
- Allow retry individual file uploads

**Error Handling cần implement:**

```typescript
// Client-side validation
- File size > 20MB → Show inline error
- Invalid file type → Show inline error

// Network errors
- Upload failed → Show retry button
- Upload timeout → Show retry button với different strategy

// HTTP errors
- 413: Payload Too Large → Show specific error
- 415: Unsupported Media Type → Show specific error
```

**Snapshots reference:**

- Success: [snapshots/v1/success.json](../../../api/file/upload/snapshots/v1/success.json)
- Error 413: [snapshots/v1/error-413.json](../../../api/file/upload/snapshots/v1/error-413.json)
- Error 415: [snapshots/v1/error-415.json](../../../api/file/upload/snapshots/v1/error-415.json)

---

## 🔄 Retry Logic Requirements

### Message Send Retry

**Max retry count:** 3 lần (theo pending decision #2)

**Retry strategy:**

```typescript
interface RetryConfig {
  maxRetries: 3;
  retryDelay: [1000, 2000, 4000]; // Exponential backoff (ms)
  retryableErrors: ["ERR_NETWORK", "ECONNABORTED", 500, 502, 503, 504];
}
```

**Retry flow:**

1. Lần 1: Retry sau 1 giây
2. Lần 2: Retry sau 2 giây
3. Lần 3: Retry sau 4 giây
4. Sau 3 lần: Permanent failure state

**LocalStorage structure:**

```typescript
interface FailedMessage {
  id: string;
  content: string;
  attachedFileIds: string[];
  workspaceId: string;
  conversationId: string;
  retryCount: number;
  lastError: string;
  timestamp: number;
}

// localStorage key: 'failed-messages'
// Value: FailedMessage[]
```

---

### File Upload Retry

**Max retry count:** 3 lần per file

**Retry strategy:**

```typescript
interface FileRetryConfig {
  maxRetries: 3;
  retryDelay: [500, 1000, 2000]; // Faster retry for files
  retryableErrors: ["ERR_NETWORK", "ECONNABORTED", 500, 502, 503];
}
```

**File upload state machine:**

```typescript
type FileUploadStatus =
  | "pending" // Chưa upload
  | "validating" // Đang validate client-side
  | "uploading" // Đang upload
  | "success" // Upload thành công
  | "error" // Upload lỗi (có retry button)
  | "permanent-error"; // Lỗi permanent (không retry được)

interface FileUploadState {
  file: File;
  status: FileUploadStatus;
  progress: number; // 0-100
  uploadedFileId?: string;
  error?: string;
  retryCount: number;
}
```

---

## 💾 LocalStorage Requirements

### 1. Draft Messages

**Key:** `chat-drafts`

**Structure:**

```typescript
interface DraftMessage {
  conversationId: string;
  content: string;
  attachedFiles: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    uploadStatus: "success" | "error";
  }>;
  lastModified: number; // Timestamp
}

// Value: Record<conversationId, DraftMessage>
```

**Persistence rules:**

- Auto-save sau 500ms debounce khi user typing
- Clear draft khi message sent successfully
- Restore draft khi user quay lại conversation

---

### 2. Failed Messages Queue

**Key:** `failed-messages`

**Structure:**

```typescript
interface FailedMessage {
  id: string; // Temporary ID (client-generated)
  content: string;
  attachedFileIds: string[];
  workspaceId: string;
  conversationId: string;
  retryCount: number;
  lastError: string;
  timestamp: number;
}

// Value: FailedMessage[]
```

**Persistence rules:**

- Add vào queue khi message send failed
- Remove khi retry thành công
- Remove khi user click "Xoá"
- Max 50 messages trong queue (remove oldest nếu vượt quá)

---

### 3. Scroll Position

**Key:** `chat-scroll-positions`

**Structure:**

```typescript
interface ScrollPosition {
  conversationId: string;
  scrollTop: number;
  scrollHeight: number;
  timestamp: number;
}

// Value: Record<conversationId, ScrollPosition>
```

**Persistence rules:**

- Save khi user scroll (debounce 200ms)
- Restore khi user quay lại conversation
- Clear positions older than 24 hours

---

## 🧪 Testing với API Snapshots

### Message Send Error Scenarios

Phase 6 cần test với các snapshots sau:

1. **Network offline:**

   - Mock: `navigator.onLine = false`
   - Expected: Hiện error "Không có kết nối mạng" + retry button

2. **Timeout:**

   - Mock: Delay response > 30 seconds
   - Expected: Hiện error "Request timeout" + retry button

3. **Server error (500):**

   - Use snapshot: `error-500.json`
   - Expected: Hiện error message + retry button

4. **Bad request (400):**
   - Use snapshot: `error-400.json`
   - Expected: Hiện error message, KHÔNG có retry button

---

### File Upload Error Scenarios

1. **File quá lớn (client-side):**

   - Mock: File size > 20MB
   - Expected: Inline error, KHÔNG call API

2. **File format không hợp lệ:**

   - Mock: File type not in allowed list
   - Expected: Inline error, KHÔNG call API

3. **Upload timeout:**

   - Mock: Delay upload > 60 seconds
   - Expected: Error state + retry button

4. **Server reject (413):**
   - Use snapshot: `error-413.json`
   - Expected: Permanent error, KHÔNG có retry

---

## ✅ Contract Completeness Checklist

- [x] Message Send API contract exists
- [x] File Upload API contract exists
- [x] All error snapshots documented
- [x] Retry logic specified
- [x] LocalStorage structure defined
- [x] Testing scenarios mapped to snapshots
- [ ] **HUMAN đã review error handling logic**
- [ ] **HUMAN đã confirm retry count (3 lần)**
- [ ] **HUMAN đã approve localStorage keys**

---

## 📋 IMPACT SUMMARY (Tóm tắt thay đổi)

### Files sẽ tạo mới:

- KHÔNG có file mới (chỉ sửa logic existing files)

### Files sẽ sửa đổi:

- `src/hooks/mutations/useSendMessage.ts` - Thêm retry logic
- `src/hooks/mutations/useUploadFile.ts` - Thêm retry logic
- `src/features/portal/components/chat/ChatMainContainer.tsx` - Integrate error UI
- `src/utils/storage.ts` - Thêm helpers cho drafts & failed messages
- `src/utils/errorHandling.ts` - 🆕 Tạo mới hoặc enhance existing

### Files sẽ xoá:

- KHÔNG có

### Dependencies sẽ thêm:

- KHÔNG có (sử dụng existing dependencies)

---

## ⏳ PENDING DECISIONS (Các quyết định chờ HUMAN)

| #   | Vấn đề                           | Lựa chọn                     | HUMAN Decision  |
| --- | -------------------------------- | ---------------------------- | --------------- |
| 1   | Max retry count cho messages     | 3, 5, or unlimited?          | ✅ **3**        |
| 2   | LocalStorage max failed messages | 50, 100, or 200?             | ✅ **50**       |
| 3   | Draft auto-save debounce         | 300ms, 500ms, or 1000ms?     | ✅ **500ms**    |
| 4   | Scroll position expire time      | 1 hour, 24 hours, or 7 days? | ✅ **24 hours** |
| 5   | File upload timeout              | 30s, 60s, or 120s?           | ✅ **60s**      |

> ✅ **Tất cả quyết định đã được HUMAN xác nhận**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                           | Status       |
| ---------------------------------- | ------------ |
| Đã review API contracts references | ✅ Đã review |
| Đã review retry logic              | ✅ Đã review |
| Đã review localStorage structure   | ✅ Đã review |
| Đã điền Pending Decisions          | ✅ Đã điền   |
| **APPROVED để thực thi**           | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-13

> ✅ **APPROVED: AI được phép thực thi code**

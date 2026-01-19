# [BƯỚC 1] Requirements - Chat Details Phase 7 Bugfixes

**Document:** Requirements Specification  
**Created:** 2026-01-15  
**Status:** ✅ APPROVED  
**Version:** 1.0

---

## 🎯 Overview

Sửa 2 lỗi critical ảnh hưởng UX trong chat:

1. **Load More Messages** không hoạt động → Không xem được lịch sử tin nhắn
2. **File Upload Limit** logic sai → Confusing UX, không ngăn được việc chọn quá số file

---

## 🐛 Bug #1: Load More Messages không hoạt động

### Current Behavior (Broken)

```
User: Scroll to top of message list
UI: Hiển thị button "Tải thêm tin nhắn cũ"
User: Click button
Result: ❌ Không load được tin nhắn mới (hoặc lỗi console)
```

### ⚠️ CRITICAL WARNING

**HUMAN báo cáo: API `/api/conversations/{id}/messages` có thể KHÔNG có cursor parameter!**

**Trước khi fix bug này, PHẢI verify trong Swagger:**

1. API có hỗ trợ pagination không?
   - Nếu KHÔNG → Bug này KHÔNG thể fix (API limitation)
   - Nếu CÓ → Tên param là gì? (`cursor`, `before`, `after`, `page`, `offset`?)
2. Response có field `hasMore` / `hasNext` không?
3. Response có field `nextCursor` / `cursor` / `next` không?

**⛔ BLOCKED: Implementation PHẢI chờ HUMAN capture API snapshot để verify!**

---

### Expected Behavior

**Scenario 1: Manual Load More**

```
User: Scroll to top of message list
UI: Hiển thị button "Tải thêm tin nhắn cũ" (nếu hasNextPage = true)
User: Click button
Result: ✅ Load tin nhắn cũ hơn, append vào đầu danh sách
        ✅ Giữ CHÍNH XÁC scroll position - user vẫn nhìn thấy tin nhắn như cũ
        ✅ Scroll top được tự động điều chỉnh để compensate height mới thêm vào
        ✅ Khi hết tin nhắn → Ẩn button
        ✅ KHÔNG scroll xuống tin nhắn mới nhất (chỉ scroll khi conversation thay đổi)
```

**Scenario 2: Auto-load for Starred/Pinned Message (NEW)**

```
User: Click vào starred message trong starred list
Or: Click vào pinned message badge
Target Message: Là tin nhắn CŨ chưa có trong danh sách hiện tại

Result: ✅ Tự động load messages cho đến khi tìm thấy target message
        ✅ Scroll đến vị trí tin nhắn đó
        ✅ Highlight tin nhắn (animation/background color)
        ✅ Show loading indicator khi đang load
        ✅ Nếu không tìm thấy sau khi load hết → Show error toast
```

### Root Cause Analysis (Hypothesis)

**Possible Issue 1: API Integration (❌ CONFIRMED WRONG)**

```typescript
// File: src/api/messages.api.ts
export const getMessages = async ({
  conversationId,
  limit = 50,
  cursor, // ❌ WRONG PARAM NAME
}: GetMessagesParams): Promise<GetMessagesResponse> => {
  const params: Record<string, unknown> = { limit };
  if (cursor) {
    params.cursor = cursor; // ❌ API không nhận param 'cursor'
  }

  const response = await apiClient.get<GetMessagesResponse>(
    `/api/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
};
```

**✅ Swagger confirms:** API cần param `beforeMessageId` (UUID), KHÔNG phải `cursor`

**Possible Issue 2: Query Hook Config**

```typescript
// File: src/hooks/queries/useMessages.ts
export function useMessages({
  conversationId,
  limit = 50,
  enabled = true,
}: UseMessagesOptions) {
  return useInfiniteQuery({
    queryKey: messageKeys.conversation(conversationId),
    queryFn: ({ pageParam }) =>
      getMessages({
        conversationId,
        limit,
        cursor: pageParam, // ⚠️ pageParam có đúng không?
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined, // ⚠️ Có đúng field?
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30,
    enabled: enabled && !!conversationId,
  });
}
```

**Kiểm tra cần làm:**

- [ ] `getNextPageParam` có return đúng cursor value?
- [ ] `lastPage.hasMore` và `lastPage.nextCursor` có tồn tại trong response?
- [ ] `initialPageParam` có đúng type?

---

## 🐛 Bug #2: File Upload Limit Logic sai

### Current Behavior (Broken)

```typescript
// File: src/features/portal/components/chat/ChatMainContainer.tsx
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const fileArray = Array.from(files);

  // ❌ PROBLEM 1: Validate BEFORE adding, but uses wrong maxFiles (10)
  const validationError = validateBatchFileSelection(
    fileArray,
    10, // API limit: 10 files
    10 * 1024 * 1024, // 10MB per file
    100 * 1024 * 1024 // 100MB total (API limit)
  );

  if (validationError) {
    toast.error(validationError.message);
    e.target.value = "";
    return;
  }

  // ❌ PROBLEM 2: validateAndAdd uses DEFAULT_FILE_RULES.maxFiles (5)
  //    but doesn't account for already selected files correctly
  const validFiles = validateAndAdd(fileArray, selectedFiles.length);

  // Bug example: Inconsistent validation leads to confusing error messages
  // Need unified constant MAX_FILES_PER_MESSAGE = 10
};
```

**Root Cause:**

1. **Inconsistent validation** logic với hardcoded values
2. Validate batch selection TRƯỚC, không check `selectedFiles.length` hiện tại
3. Không **disable input** khi đã đủ 10 file

### Expected Behavior

```typescript
// Case 1: Chọn 5 file 1 lần
User: Click Paperclip icon
UI: Open file picker (NO restriction yet)
User: Select 5 files
Result: ✅ Accept all 5, show previews
        ✅ Disable file inputs (cannot select more)

// Case 2: Chọn 6 file 1 lần
User: Click Paperclip icon
UI: Open file picker
User: Select 6 files
Result: ⚠️ Toast: "Chỉ chọn được 5 file. Đã tự động bỏ 1 file."
        ✅ Add first 5 files, discard 6th file
        ✅ Show 5 file previews
        ✅ Disable both file input buttons
UI: Disable file inputs
User: Click Paperclip → ❌ Disabled, cannot open picker

// Case 4: Đã 5 file, xóa 1, chọn thêm
User: Remove 1 file (total: 4)
UI: Enable file inputs again
User: Select 1 file → ✅ Added (total: 5)
UI: Disable file inputs again

// Case 5: Đã 3 file, chọn 3 file nữa
User: Already have 3 files
User: Select 3 more files
Result: ⚠️ Toast: "Đã có 3 file. Chỉ chọn thêm được 2 file nữa."
        ✅ Add first 2 files from selection, discard 3rd file
        ✅ Total 5 files, disable buttons
```

### Required Changes

**1. Unified File Limit Constant**

```typescript
// src/types/files.ts
export const MAX_FILES_PER_MESSAGE = 5; // Single source of truth

export const DEFAULT_FILE_RULES: FileValidationRules = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: MAX_FILES_PER_MESSAGE, // Use constant
  allowedTypes: [...],
};
```

**2. Pre-check BEFORE opening file picker**

```typescript
// src/features/portal/components/chat/ChatMainContainer.tsx

// Calculate both count and size limits
const totalSize = selectedFiles.reduce((sum, f) => sum + f.file.size, 0);
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
const remainingSize = MAX_TOTAL_SIZE - totalSize;

// Disable when EITHER limit is reached
const isFileLimitReached =
  selectedFiles.length >= MAX_FILES_PER_MESSAGE ||
  remainingSize < 1024; // Less than 1KB space left

<Button
  disabled={isFileLimitReached || sendMessageMutation.isPending}
  onClick={() => fileInputRef.current?.click()}
  title={isFileLimitReached ? "Đã đạt giới hạn (10 file hoặc 100MB)" : ""}
>
  <Paperclip />
</Button>

<input
  disabled={isFileLimitReached} // ✅ Prevent opening picker
  type="file"
  onChange={handleFileSelect}
/>
```

**3. Improve validation message**

```typescript
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const fileArray = Array.from(files);
  const currentCount = selectedFiles.length;
  const remainingSlots = MAX_FILES_PER_MESSAGE - currentCount;

  // ✅ STEP 1: Check total size FIRST (highest priority)
  const currentTotalSize = selectedFiles.reduce((sum, f) => sum + f.file.size, 0);
  const newFilesSize = fileArray.reduce((sum, f) => sum + f.size, 0);
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
  const remainingSize = MAX_TOTAL_SIZE - currentTotalSize;

  if (currentTotalSize + newFilesSize > MAX_TOTAL_SIZE) {
    toast.error(
      remainingSize <= 0
        ? "Đã đạt giới hạn 100MB. Vui lòng xóa file cũ để chọn file mới."
        : `Tổng dung lượng vượt quá 100MB. Còn trống ${formatFileSize(remainingSize)}.`
    );
    e.target.value = "";
    return;
  }

  // ✅ STEP 2: Check total count
  if (fileArray.length > remainingSlots) {
    if (remainingSlots === 0) {
      toast.error(
        `Đã đủ ${MAX_FILES_PER_MESSAGE} file. Vui lòng xóa file cũ để chọn file mới.`
      );
    } else {
      toast.error(
        `Bạn đã chọn ${currentCount} file. Chỉ được chọn thêm tối đa ${remainingSlots} file nữa.`
      );
    }
    e.target.value = "";
    return;
  }

  // Then validate batch (size, type) for files to add
  const validationError = validateBatchFileSelection(
    filesToAdd,
    MAX_FILES_PER_MESSAGE, // 10 files
    10 * 1024 * 1024, // 10MB per file
    100 * 1024 * 1024 // 100MB total (API limit)
    10 * 1024 * 1024, // 10MB per file
    100 * 1024 * 1024 // 100MB total (API limit)

  if (validationError) {
    toast.error(validationError.message);
    e.target.value = "";
    return;
  }

  // Add validated files
  const validFiles = filesToAdd.map(fileToSelectedFile);
  setSelectedFiles((prev) => [...prev, ...validFiles]);

  // Show success if no warning was shown
  if (filesToAdd.length === fileArray.length) {
    toast.success(`Đã thêm ${validFiles.length} file`);
  }

  e.target.value = "";
};
```

---

## 📊 Acceptance Criteria

### Bug #1 - Load More Messages

**Manual Load More:**

| #   | Scenario                       | Expected                                                 |
| --- | ------------------------------ | -------------------------------------------------------- |
| 1   | Conversation có > 100 tin nhắn | Button "Tải thêm" hiển thị ở đầu list                    |
| 2   | Click "Tải thêm" lần 1         | Load 100 tin nhắn cũ hơn, append vào đầu                 |
| 3   | Click "Tải thêm" lần 2         | Load 100 tin nhắn cũ hơn nữa                             |
| 4   | Hết tin nhắn cũ                | Button "Tải thêm" bị ẩn                                  |
| 5   | Loading state                  | Button disabled, text "Đang tải..."                      |
| 6   | Scroll position preservation   | User vẫn nhìn thấy CHÍNH XÁC tin nhắn như trước khi load |
| 7   | Scroll calculation             | scrollTop = old position + added height                  |
| 8   | Conversation mới               | Scroll xuống bottom (chỉ khi conversation thay đổi)      |
| 9   | Real-time message mới          | Scroll xuống bottom (khi có tin nhắn mới từ người khác)  |

**Auto-load for Starred/Pinned (NEW):**

| #   | Scenario                                       | Expected                                                             |
| --- | ---------------------------------------------- | -------------------------------------------------------------------- |
| 7   | Click starred message (trong 100 tin mới nhất) | Scroll đến tin nhắn, highlight, KHÔNG load thêm                      |
| 8   | Click starred message (tin cũ chưa load)       | Auto-load 100 msgs/page cho đến khi tìm thấy, scroll + highlight     |
| 9   | Click pinned message (tin cũ chưa load)        | Auto-load 100 msgs/page cho đến khi tìm thấy, scroll + highlight     |
| 10  | Auto-load đang chạy                            | Show loading overlay "Đang tìm tin nhắn..."                          |
| 11  | Tin nhắn không tồn tại                         | Load hết messages, toast "Không tìm thấy tin nhắn"                   |
| 12  | User cancel khi đang auto-load                 | Stop loading, giữ nguyên messages đã load, scroll về vị trí hiện tại |

### Bug #2 - File Upload Limit

| #   | Scenario                            | Expected                                                                 |
| --- | ----------------------------------- | ------------------------------------------------------------------------ |
| 1   | Chọn 1-10 file 1 lần                | Accept tất cả, show previews                                             |
| 2   | Chọn 11+ file 1 lần                 | Accept 10 file đầu, toast "Chỉ chọn được 10 file. Đã tự động bỏ X file." |
| 3   | Đã 10 file                          | Both buttons disabled, không mở được picker                              |
| 4   | Đã 10 file → Xóa 1                  | Buttons enabled lại                                                      |
| 5   | Đã 7 file, chọn 3 file              | Accept, total 10, buttons disabled                                       |
| 6   | Đã 9 file, chọn 1 file              | Accept, total 10, buttons disabled                                       |
| 7   | Đã 6 file, chọn 4 file              | Accept, total 10, buttons disabled                                       |
| 8   | Tổng size hiện tại + mới > 100MB    | Reject TRƯỚC, toast "Tổng dung lượng vượt quá 100MB. Còn trống X MB."    |
| 9   | Đã 95MB, chọn 10MB file             | Reject, toast "Còn trống 5MB"                                            |
| 10  | Approaching 100MB (< 1KB remaining) | Both buttons disabled (không đủ chỗ cho file nhỏ nhất)                   |
| 11  | Both image & file buttons           | Cùng bị disable khi đủ 10 file HOẶC đủ 100MB                             |
| 12  | File quá nặng (>10MB per file)      | Reject individual file, toast "File X vượt quá 10MB"                     |

---

## 🚫 Out of Scope

- [ ] Thay đổi UI/UX design (giữ nguyên)
- [ ] Thay đổi file size limits (giữ 10MB/file)
- [ ] Thay đổi total size limit (giữ 50MB)
- [ ] Thêm drag & drop file upload
- [ ] Thay đổi supported file types

---

## 🔗 API Dependencies

### Bug #1: GET /api/conversations/{id}/messages

**Endpoint:** `GET /api/conversations/{id}/messages`  
**Swagger:** https://vega-chat-api-dev.allianceitsc.com/swagger/index.html

**Request Params:**

```typescript
{
  limit?: number;    // Number of messages to fetch
  cursor?: string;   // ⚠️ NEED TO VERIFY param name from Swagger
}
```

**Response Structure:** (NEED TO VERIFY)

```typescript
{
  items: ChatMessage[];
  hasMore: boolean;      // ⚠️ Field name to verify
  nextCursor?: string;   // ⚠️ Field name to verify
}
```

**Action Required:**

- [ ] HUMAN cần capture API snapshot để verify exact field names
- [ ] HUMAN cần cung cấp example response với pagination

---

## 📋 IMPACT SUMMARY (Tóm tắt thay đổi)

### Files sẽ tạo mới:

- (Không có - pure bugfix)

### Files sẽ sửa đổi:

#### Bug #1 - Load More:

1. **`src/api/messages.api.ts`**

   - Fix cursor param name (nếu sai)
   - Add better error handling

2. **`src/hooks/queries/useMessages.ts`**

   - Fix `getNextPageParam` logic
   - Verify response field names (hasMore, nextCursor)

3. **`src/types/messages.ts`**
   - Update `GetMessagesResponse` type (nếu sai)

#### Bug #2 - Upload Limit:

1. **`src/types/files.ts`**

   - Add `MAX_FILES_PER_MESSAGE = 5` constant
   - Update `DEFAULT_FILE_RULES.maxFiles = 5`

2. **`src/features/portal/components/chat/ChatMainContainer.tsx`**

   - Add `isFileLimitReached` computed value
   - Disable file inputs when limit reached
   - Improve validation logic in `handleFileSelect`
   - Better error messages

3. **`src/utils/fileHelpers.ts`**

   - Update `validateBatchFileSelection` to use new constant
   - Improve error messages

4. **`src/utils/fileValidation.ts`**
   - Update `validateFileCount` error message
   - Add context about remaining slots

### Files sẽ xoá:

- (Không có)

### Dependencies sẽ thêm:

- (Không có - pure bugfix)

---

## ⏳ PENDING DECISIONS (Các quyết định chờ HUMAN)

| #   | Vấn đề                       | Lựa chọn                                                    | HUMAN Decision |
| --- | ---------------------------- | ----------------------------------------------------------- | -------------- |
| 1   | **API cursor param name**    | Swagger docs cần verify: `cursor`, `before`, `after`?       | ⬜ **\_\_\_**  |
| 2   | **API response field names** | Verify: `hasMore` vs `hasNext`, `nextCursor` vs `cursor`?   | ⬜ **\_\_\_**  |
| 3   | **File limit value**         | Confirm 5 files max (cả image + file)?                      | ⬜ **5 files** |
| 4   | **Input disable behavior**   | Disable input khi đủ 5 file? (User không mở được picker)    | ⬜ **Yes/No?** |
| 5   | **Error message tone**       | Friendly vs Formal? E.g., "Bạn đã chọn..." vs "Đã chọn..."? | ⬜ **\_\_\_**  |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

**Action Required:**

- [ ] HUMAN cần capture API snapshot: `docs/api/chat/messages/snapshots/v1/pagination.json`
- [ ] HUMAN cần verify Swagger API documentation

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                    | Status               |
| --------------------------- | -------------------- |
| Đã review Impact Summary    | ⬜ Chưa review       |
| Đã điền Pending Decisions   | ⬜ Chưa điền         |
| Đã verify API documentation | ⬜ Chưa verify       |
| **APPROVED để thực thi**    | ⬜ **CHƯA APPROVED** |

**HUMAN Signature:** [_________________]  
**Date:** [_________________]

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

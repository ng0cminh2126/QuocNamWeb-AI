# Phase 2 ChatMainContainer Integration - Review Needed

## 📋 Current Status

Completed Steps 1-6:

- ✅ STEP 1: Types updated with BatchUploadResult, BatchUploadItemResult
- ✅ STEP 2: Batch upload API client created (uploadFilesBatch)
- ✅ STEP 3: Mutation hook created (useUploadFilesBatch)
- ✅ STEP 4: File helpers created (validateBatchFileSelection, extractSuccessfulUploads)
- ✅ STEP 5: ImageGrid component created
- ✅ STEP 6: ImageGridItem component created with lazy loading

Now ready for STEP 7 & 8: Container & Bubble updates

---

## 🔍 Analysis of ChatMainContainer.tsx

**Current Implementation (Phase 1):**

- Uses `useUploadFiles` hook (sequential upload)
- Sends 1 message per file (total N messages for N files)
- File selection limited to 1 file at a time
- Progress tracking per file with Map<string, FileUploadProgressState>

**Required Changes for Phase 2:**

1. Import new hooks and helpers
2. Add `useUploadFilesBatch` mutation hook
3. Update file selection to allow 2-10 files
4. Add validation using `validateBatchFileSelection`
5. Implement API selection logic (1 file → single upload, 2+ → batch)
6. Handle partial success for batch uploads
7. Send 1 message with multiple attachments (not N messages)

---

## 🎯 Implementation Strategy

### Option A: Full Replacement (Recommended)

Replace entire handleSendMessage logic with new implementation:

```typescript
// Imports to ADD:
import { useUploadFilesBatch } from "@/hooks/mutations/useUploadFilesBatch";
import { validateBatchFileSelection, extractSuccessfulUploads, BATCH_UPLOAD_LIMITS } from "@/utils/fileHelpers";
import type { BatchUploadResult } from "@/types/files";

// Hook to ADD (after useUploadFiles):
const uploadBatchMutation = useUploadFilesBatch({
  onSuccess: (result) => {
    if (result.allSuccess) {
      toast.success(`Tất cả ${result.totalFiles} file đã upload thành công`);
    } else if (result.partialSuccess) {
      toast.warning(
        `${result.successCount}/${result.totalFiles} file upload thành công`
      );
    }
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// Update handleFileSelect validation:
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const fileArray = Array.from(files);

  // Validate batch before adding
  const error = validateBatchFileSelection(fileArray, BATCH_UPLOAD_LIMITS.MAX_FILES);
  if (error) {
    toast.error(error.message);
    e.target.value = "";
    return;
  }

  const validFiles = validateAndAdd(fileArray, selectedFiles.length);
  if (validFiles.length > 0) {
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  e.target.value = "";
};

// NEW handleSendMessage logic:
const handleSend = useCallback(async () => {
  if (!inputValue.trim() && selectedFiles.length === 0) return;

  stopTyping();
  setIsUploading(true);

  try {
    if (selectedFiles.length === 0) {
      // Case 1: Text-only message (no files)
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: inputValue.trim(),
      });
    } else if (selectedFiles.length === 1) {
      // Case 2: Single file upload (Phase 1 API)
      const result = await uploadFilesMutation.mutateAsync({
        files: selectedFiles,
        sourceModule: 1,
        sourceEntityId: conversationId,
      });

      if (result.failedCount > 0) {
        toast.error("Lỗi upload file. Vui lòng thử lại.");
        setIsUploading(false);
        return;
      }

      // Send message with single attachment
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: inputValue.trim() || null,
        attachment: formatAttachment(
          result.files[0].originalFile,
          result.files[0].uploadResult
        ),
      });
    } else {
      // Case 3: Batch upload (Phase 2 API)
      const batchResult = await uploadBatchMutation.mutateAsync({
        files: selectedFiles.map((sf) => sf.file),
        sourceModule: 1,
        sourceEntityId: conversationId,
      });

      // Extract successful uploads
      const attachments = extractSuccessfulUploads(batchResult);

      if (attachments.length === 0) {
        toast.error("Tất cả file upload thất bại. Vui lòng thử lại.");
        setIsUploading(false);
        return;
      }

      if (batchResult.partialSuccess) {
        toast.warning(
          `${batchResult.successCount}/${batchResult.totalFiles} file upload thành công`
        );
      }

      // Send 1 message with multiple attachments (Phase 2 API v2.0)
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: inputValue.trim() || null,
        attachments, // BREAKING CHANGE: attachment → attachments[]
      });
    }

    // Success - clear state
    selectedFiles.forEach((sf) => revokeFilePreview(sf.preview));
    setSelectedFiles([]);
    setInputValue("");
    setIsUploading(false);

    setTimeout(() => inputRef.current?.focus(), 0);
  } catch (error) {
    console.error("Send message error:", error);
    toast.error("Lỗi gửi tin nhắn. Vui lòng thử lại.");
    setIsUploading(false);
  }
}, [inputValue, selectedFiles, ...]);
```

### Option B: Minimal Changes (Not Recommended)

Keep existing logic and add batch as separate path - creates code duplication

---

## ⚠️ Breaking Changes to Handle

### 1. Message Send API v2.0 (Breaking Change)

```typescript
// OLD (Phase 1):
interface SendMessageRequest {
  conversationId: string;
  content: string | null;
  attachment?: AttachmentInputDto; // Single attachment
}

// NEW (Phase 2):
interface SendMessageRequest {
  conversationId: string;
  content: string | null;
  attachments?: AttachmentInputDto[]; // Array of attachments
}
```

**Decision Required:**

- Option A: Update `useSendMessage` hook to accept both `attachment` and `attachments`
- Option B: Keep two separate mutation hooks (useSendMessage, useSendMessageBatch)
- Option C: Always send `attachments[]` array (even for single file)

**Recommendation:** Option C - Always use `attachments[]` for consistency

### 2. Progress Tracking Removal

Current code has complex progress tracking with `Map<string, FileUploadProgressState>`.
Phase 2 batch upload API doesn't support per-file progress (Decision #4 deferred to Phase 3).

**Required:**

- Remove `setUploadProgress` for batch uploads
- Show simple loading spinner instead
- Keep progress tracking only for single file upload (Phase 1 path)

### 3. File Selection Limits Update

```typescript
// OLD:
if (files.length > 1) {
  toast.warning("Vui lòng chỉ chọn 1 file mỗi lần");
}

// NEW:
const error = validateBatchFileSelection(fileArray);
if (error) {
  toast.error(error.message); // "Chỉ được upload tối đa 10 file cùng lúc..."
  return;
}
```

---

## 🧪 Test Cases for STEP 7 (ChatMainContainer)

TC-07.1: Should upload batch (3 files) → send 1 message with 3 attachments
TC-07.2: Should use single upload API for 1 file → send 1 message with 1 attachment
TC-07.3: Should show validation error for 11 files
TC-07.4: Should handle partial success (2/3 files uploaded) → send message with 2 attachments + warning toast

---

## 🚨 HUMAN DECISION NEEDED

### Decision #8: API Versioning Strategy

The message send API has breaking change: `attachment` → `attachments[]`.

**Current `useSendMessage` hook signature:**

```typescript
export function useSendMessage() {
  return useMutation({
    mutationFn: (request: SendMessageRequest) => sendMessage(request),
  });
}
```

**Question:** Should we:

1. Create new hook `useSendMessageV2` with `attachments[]`?
2. Update existing hook to detect and handle both `attachment` and `attachments`?
3. Always send `attachments[]` (breaking change for Phase 1 users)?

**Impact:**

- Option 1: Code duplication, need to maintain 2 hooks
- Option 2: Backward compatible, more complex logic in hook
- Option 3: Cleanest code, but requires update to Phase 1 message send everywhere

**Recommendation:** Option 2 (backward compatible) for now, migrate to Option 3 in future cleanup

---

## ✅ HUMAN APPROVAL REQUIRED

Before implementing STEP 7, please confirm:

- [ ] Approve Option A (Full Replacement) for handleSendMessage
- [ ] Approve Decision #8 Option (1, 2, or 3) for API versioning
- [ ] Confirm removal of progress tracking for batch uploads (show spinner only)
- [ ] Confirm `attachments[]` API update is compatible with backend v2.0

**HUMAN Signature:** [CHƯA DUYỆT]  
**Date:** \***\*\_\_\_\_\*\***

> ⚠️ **AI WILL NOT code STEP 7 until this review is approved**

---

## 📁 Files to Modify in STEP 7

1. `src/features/portal/components/chat/ChatMainContainer.tsx`

   - Add imports (3 new)
   - Add uploadBatchMutation hook
   - Replace handleSendMessage logic (150 lines)
   - Update handleFileSelect validation
   - Remove file count check "Vui lòng chỉ chọn 1 file"

2. `src/hooks/mutations/useSendMessage.ts` (if Decision #8 = Option 2 or 3)

   - Update SendMessageRequest type to accept `attachments[]`
   - Add backward compatibility logic

3. `src/api/messages.api.ts` (if Decision #8 = Option 2 or 3)

   - Update sendMessage API client

4. Test file: `src/features/portal/components/chat/__tests__/ChatMainContainer.test.tsx`
   - 4 new test cases (TC-07.1 to TC-07.4)

---

## 📅 Next Steps After Approval

1. User approves this review document
2. AI implements STEP 7 with approved decisions
3. AI implements STEP 8 (MessageBubbleSimple with ImageGrid)
4. Run all tests (28 unit tests)
5. Manual E2E testing

**Estimated Time:** 2 hours (STEP 7: 90 min, STEP 8: 60 min, Testing: 30 min)

# Session 022 - Phase 2 Implementation Complete

> **Date:** 2026-01-07  
> **Module:** [chat]  
> **Feature:** File Upload with Messages (Phase 2 - Option A)  
> **Status:** ✅ IMPLEMENTATION COMPLETE

---

## 🎯 Objective

Implement Phase 2 file upload integration using **Option A: Sequential Messages** strategy.

**User Request:** "bắt đầu implement đi"

**Context:** User reported message sending fails after successful file upload. AI discovered API contract mismatch and created comprehensive Phase 2 plan. HUMAN approved Option A strategy. AI began implementation.

---

## 📋 Strategy: Option A - Sequential Messages

```
UPLOAD ALL FILES → SEND N MESSAGES (1 file per message)

User uploads 3 files + text "Hello":
1. Upload file1.pdf → ✅ Success (fileId: abc-123)
2. Upload file2.jpg → ✅ Success (fileId: def-456)
3. Upload file3.zip → ✅ Success (fileId: ghi-789)

THEN send 3 sequential messages:
1. POST /api/messages { content: "Hello", attachment: { fileId: "abc-123", ... } }
2. POST /api/messages { content: null, attachment: { fileId: "def-456", ... } }
3. POST /api/messages { content: null, attachment: { fileId: "ghi-789", ... } }
```

**Rationale:** API only accepts 1 file per message (singular `attachment` field, not `attachments[]`)

---

## ✅ Implementation Summary

### 1. Updated useUploadFiles Hook

**File:** `src/hooks/mutations/useUploadFiles.ts`

**Changes:**

- Return type: `fileIds: string[]` → `files: UploadedFileData[]`
- New interface:
  ```typescript
  interface UploadedFileData {
    originalFile: File; // Keep original File object
    uploadResult: UploadFileResult; // Server response
  }
  ```
- Mutation logic: Collect full file metadata instead of just fileIds
- Purpose: Enable formatAttachment() to access File object + upload result

**Testing:** ✅ TypeScript compilation passing

### 2. Updated useSendMessage Hook

**File:** `src/hooks/mutations/useSendMessage.ts`

**Changes:**

- Removed `conversationId` parameter from hook options
- New signature: `sendMessage(data: SendChatMessageRequest)` where data contains conversationId
- Matches Swagger API contract

**Testing:** ✅ TypeScript compilation passing

### 3. Updated ChatMainContainer (Main Component)

**File:** `src/features/portal/components/ChatMainContainer.tsx`

**Changes:**

#### A. Imports

- Added `formatAttachment` from `@/utils/formatAttachment`
- Added `getFileUrl` from `@/utils/fileUrl`

#### B. Send Message Logic (handleSend)

Completely rewrote to implement Option A:

```typescript
// OLD (WRONG):
// 1. Upload files
// 2. Send 1 message with all fileIds (commented out)

// NEW (CORRECT - Option A):
if (selectedFiles.length > 0) {
  // 1. Upload all files sequentially
  const result = await uploadFilesMutation.mutateAsync({...});

  // 2. Send N messages (1 file each)
  for (let i = 0; i < result.files.length; i++) {
    const { originalFile, uploadResult } = result.files[i];

    await sendMessageMutation.mutateAsync({
      conversationId,
      content: i === 0 ? inputValue.trim() : null, // Only first has text
      attachment: formatAttachment(originalFile, uploadResult),
    });
  }
} else {
  // No files: Send single text-only message
  await sendMessageMutation.mutateAsync({
    conversationId,
    content: inputValue.trim(),
  });
}
```

#### C. Attachment Display

Fixed to use AttachmentDto (from API response):

```typescript
// OLD (WRONG):
<img src={message.attachments[0].url} />
<a href={message.attachments[0].url}>{message.attachments[0].name}</a>

// NEW (CORRECT):
<img src={getFileUrl(message.attachments[0].fileId)} />
<a href={getFileUrl(message.attachments[0].fileId)}>
  {message.attachments[0].fileName || "File"}
</a>
```

**Testing:** ✅ TypeScript compilation passing

### 4. Created File URL Utilities

**File:** `src/utils/fileUrl.ts` (NEW)

**Purpose:** Centralize file URL building logic

**Functions:**

- `getFileUrl(fileId: string)` - Build download/view URL
  - Dev: `https://vega-file-api-dev.allianceitsc.com/api/Files/{fileId}`
  - Prod: `https://vega-file-api.allianceitsc.com/api/Files/{fileId}`
- `getFileThumbnailUrl(fileId)` - Placeholder for thumbnail support
- `isPreviewableFile(contentType)` - Check if inline preview supported
- `getFileIcon(contentType)` - Get icon type for file

**Note:** GET file endpoint assumed as `/api/Files/{fileId}` - needs verification with backend team

---

## 🔄 Breaking Changes Summary

### API Changes (from Swagger analysis)

1. **Field name:** `attachments` (plural) → `attachment` (singular)
2. **Field type:** `string[]` (fileIds) → `AttachmentInputDto` (object with metadata)
3. **API limitation:** Only 1 file per message
4. **SendMessage signature:** `(conversationId, data)` → `(data)` where data contains conversationId

### Code Changes

1. **useUploadFiles return:** `{ fileIds: string[] }` → `{ files: UploadedFileData[] }`
2. **useSendMessage params:** Removed `conversationId` from hook, moved to request body
3. **ChatMainContainer:** Send N messages for N files instead of 1 message

---

## 📊 Files Modified

| #   | File                       | Type   | Lines Changed | Purpose                           |
| --- | -------------------------- | ------ | ------------- | --------------------------------- |
| 1   | useUploadFiles.ts          | MODIFY | ~50           | Return full file metadata         |
| 2   | useSendMessage.ts          | MODIFY | ~20           | Remove conversationId param       |
| 3   | ChatMainContainer.tsx      | MODIFY | ~100          | Implement Option A strategy       |
| 4   | fileUrl.ts                 | CREATE | ~110          | File URL utilities                |
| 5   | ai_action_log.md           | MODIFY | ~150          | Log session actions               |
| 6   | (this file)                | CREATE | ~200          | Session summary                   |
| --- | ---                        | ---    | **~630**      | **Total lines changed/created**   |
| --- | formatAttachment.ts        | ---    | (existing)    | Already created in previous step  |
| --- | types/messages.ts          | ---    | (existing)    | Already updated with API contract |
| --- | api/messages.api.ts        | ---    | (existing)    | Already updated signature         |
| --- | docs/api/chat/send-message | ---    | (existing)    | Contract + snapshots approved     |

---

## ✅ Testing Status

### Unit Tests

⏳ **PENDING** - Need to create:

1. `src/utils/__tests__/formatAttachment.test.ts`
2. `src/utils/__tests__/fileUrl.test.ts`
3. `src/hooks/mutations/__tests__/useUploadFiles.test.tsx`
4. Update `src/features/portal/components/__tests__/ChatMainContainer.phase2.test.tsx`

### TypeScript Compilation

✅ **PASSING** - All modified files compile without errors:

- `useUploadFiles.ts` - No errors
- `useSendMessage.ts` - No errors
- `ChatMainContainer.tsx` - No errors
- `fileUrl.ts` - No errors

### Manual E2E Testing

⏳ **PENDING** - HUMAN needs to test:

1. **Single file upload:**
   - Upload 1 PDF + text → Verify 1 message sent with attachment
2. **Multiple files upload:**
   - Upload 3 files + text → Verify 3 sequential messages:
     - Message 1: text + file1
     - Message 2: null content + file2
     - Message 3: null content + file3
3. **Text-only message:**
   - Send message without files → Verify normal message
4. **Attachment display:**
   - Verify attachments show correct file name
   - Click file link → Should download/open
5. **Error scenarios:**
   - Upload fails → No messages sent
   - Send message fails → Error toast shown

---

## 🚨 Known Issues / TODO

### 1. File Download Endpoint (ASSUMPTION)

**Issue:** GET file endpoint assumed as `/api/Files/{fileId}` - NOT verified with backend

**Current code:**

```typescript
export function getFileUrl(fileId: string): string {
  const baseUrl = getFileApiBaseUrl();
  return `${baseUrl}/api/Files/${fileId}`; // ⚠️ ASSUMPTION
}
```

**Action needed:**

- [ ] Verify with backend team
- [ ] Update if different endpoint
- [ ] Add Authorization header if needed

### 2. Unit Tests

**Action needed:**

- [ ] Write formatAttachment tests
- [ ] Write fileUrl tests
- [ ] Update useUploadFiles tests
- [ ] Update ChatMainContainer.phase2 tests

### 3. Thumbnail Support

**Future enhancement:**

- Backend needs to provide thumbnail endpoint
- Update `getFileThumbnailUrl()` when available
- Add thumbnail preview in attachment display

---

## 📖 Documentation Updated

1. ✅ `docs/sessions/ai_action_log.md` - Session 022 entry
2. ✅ `docs/sessions/session_022_20260107_[chat]_phase2-implementation.md` (this file)

**Not updated (existing approved docs):**

- `docs/modules/chat/features/file-upload/07_phase2-implementation-plan.md` - Already approved
- `docs/api/chat/send-message/contract.md` - Already approved
- `docs/api/chat/send-message/snapshots/v1/*.json` - Already approved

---

## 🎓 Lessons Learned

### 1. Always Verify API Contract First

**Mistake:** Initial code assumed `attachments: string[]` based on mockup

**Discovery:** Swagger API has `attachment: AttachmentInputDto` (singular, object)

**Lesson:** ALWAYS read Swagger/API docs before implementing, don't assume from UI

### 2. Multi-File Strategy Matters

**Challenge:** Backend only supports 1 file per message

**Options evaluated:**

- A: Sequential messages (1 file each) ✅ CHOSEN
- B: Combined single message (requires backend change)

**Lesson:** When API has limitations, work with it (Option A) rather than wait for backend changes

### 3. Full Metadata vs IDs Only

**Old approach:** Only keep fileIds after upload

**New approach:** Keep full `UploadedFileData { originalFile, uploadResult }`

**Benefit:** Can access File object properties (name, size, type) for formatAttachment()

---

## 🔄 Next Session Preparation

### Immediate Tasks (Session 023)

1. Write unit tests for Phase 2 implementation
2. Manual E2E testing with HUMAN
3. Fix any bugs discovered during testing
4. Verify file download endpoint with backend

### Future Enhancements (Phase 3+)

1. Thumbnail support for images
2. Inline preview for images/PDFs
3. Drag-and-drop file upload
4. Progress indicator for sequential message sending
5. Cancel/retry for failed messages
6. File size optimization/compression

---

## 🔄 Session Updates

### Update 1: Chặn Multiple File Selection (16:30)

**Change Request:** "tạm thời chặn chọn nhiều file hoặc ảnh 1 lúc đi"

**Rationale:** Simplify UX during Phase 2 testing - one file at a time

**Implementation:**

1. **Removed `multiple` attribute** from both file inputs:

   ```tsx
   // Before
   <input type="file" multiple ... />

   // After
   <input type="file" ... />  // Single file only
   ```

2. **Updated handleFileSelect logic:**

   - Only take first file: `const fileArray = [files[0]]`
   - Show warning toast if user somehow selects multiple files
   - Warning message: "Vui lòng chỉ chọn 1 file mỗi lần"

3. **Files modified:**
   - `ChatMainContainer.tsx` - Removed `multiple`, updated file selection logic

**Testing:** ✅ TypeScript compilation passing

**UX Impact:** File picker dialog now only allows selecting 1 file at a time

---

## ✅ Session Completion Checklist

- [x] Implementation complete
- [x] TypeScript compilation passing
- [x] AI action log updated
- [x] Session summary created
- [x] UX update: Single file selection enforced
- [ ] Unit tests written (PENDING)
- [ ] Manual testing (PENDING - requires HUMAN)
- [ ] Backend endpoint verification (PENDING)

**Status:** ✅ **READY FOR TESTING**

---

_Last updated: 2026-01-07 16:30_

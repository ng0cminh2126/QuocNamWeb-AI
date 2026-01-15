# File Upload Phase 2 - Batch Upload & Multi-Image Display

> **Feature:** Upload nhiều file cùng lúc & Hiển thị nhiều ảnh dạng grid  
> **Version:** 2.1.0 (UI Enhancements Approved)  
> **Status:** ⏳ READY FOR IMPLEMENTATION  
> **Created:** 2026-01-14  
> **Updated:** 2026-01-14 (Decisions approved)  
> **Module:** chat  
> **Parent Feature:** file-upload

---

## 📋 Overview

Phase 2 nâng cấp tính năng file upload để hỗ trợ:

1. **Batch Upload API** - Upload nhiều file cùng lúc bằng 1 request ✅ IMPLEMENTED
2. **Multiple Attachments** - Gửi tin nhắn với nhiều file đính kèm ✅ IMPLEMENTED
3. **Dynamic Image Grid Display** - Hiển thị ảnh dạng lưới thông minh (Decision 1A) 🆕 APPROVED
4. **Image Preview Modal with Thumbnails** - Navigation giữa nhiều ảnh (Decision 2B) 🆕 APPROVED
5. **Mixed Attachments Display** - Phân biệt ảnh và file rõ ràng (Decision 3A) 🆕 APPROVED

---

## 🎯 Scope (Updated)

### Phase 2 - Completed

- ✅ API Client cho batch upload (`POST /api/Files/batch`)
- ✅ Update send message API để hỗ trợ nhiều attachments
- ✅ Update message bubble để hiển thị nhiều attachments
- ✅ Tests cho batch upload flow
- ✅ File preview component với image thumbnails

### Phase 2.1 - UI Enhancements (Approved, Ready to Code)

- 🆕 **Dynamic Image Grid** (Decision 1A):

  - 1 ảnh → Full width (không grid)
  - 2 ảnh → 2 columns
  - 3-6 ảnh → 3 columns
  - 7+ ảnh → 3 columns + "+N more" overlay

- 🆕 **Preview Modal Navigation** (Decision 2B):

  - Thumbnail strip bên dưới
  - Prev/Next arrows
  - Keyboard support (← → ESC)
  - Auto-scroll active thumbnail

- 🆕 **Mixed Attachments** (Decision 3A):
  - Section "📷 Images (N):" cho ảnh
  - Section "📄 Files (N):" cho files
  - Gap 16px giữa 2 sections
  - Conditional headers (chỉ show nếu cần)

### Out of Scope (Phase 3)

- ❌ Retry failed uploads individually
- ❌ Cancel ongoing uploads
- ❌ Drag-and-drop file upload
- ❌ Progress bar cho từng file
- ❌ Image compression >5MB

---

## 📊 API Changes Summary

### 1. File Upload API

**Old (Phase 1):**

- `POST /api/Files` - Upload 1 file/request
- Request: `multipart/form-data` với 1 file
- Response: 1 `UploadFileResult`

**New (Phase 2):**

- `POST /api/Files/batch` - Upload nhiều file/request
- Request: `multipart/form-data` với nhiều files
- Response: `BatchUploadResult` chứa array of results

**Usage Logic:**

```typescript
if (files.length === 1) {
  // Dùng API cũ: POST /api/Files
  uploadFile(files[0]);
} else if (files.length > 1) {
  // Dùng API mới: POST /api/Files/batch
  uploadFilesBatch(files);
}
```

### 2. Send Message API

**Old (Phase 1):**

```typescript
{
  conversationId: string
  content: string
  attachment?: AttachmentInputDto // Single file
}
```

**New (Phase 2):**

```typescript
{
  conversationId: string
  content: string
  attachments?: AttachmentInputDto[] // Multiple files
}
```

---

## 📂 Documentation Structure

```
file-upload-phase-2/
├── 00_README.md              # [BƯỚC 0] ✅ This file
├── 01_requirements.md        # [BƯỚC 1] ⏳ PENDING
├── 02a_wireframe.md          # [BƯỚC 2A] ⏳ PENDING
├── 03_api-contract.md        # [BƯỚC 3] ⏳ PENDING (links to docs/api/)
├── 04_implementation-plan.md # [BƯỚC 4] ⏳ PENDING
├── 05_progress.md            # [BƯỚC 5] Auto-generated
└── 06_testing.md             # [BƯỚC 6] ⏳ PENDING
```

---

## 🔗 Related Documents

### API Contracts

- [Batch Upload API](../../../api/file/batch-upload/contract.md)
- [Send Message with Multiple Attachments](../../../api/chat/message-send-with-multiple-attachments/contract.md)

### Phase 1 Docs

- [Phase 1 Requirements](../file-upload/01_requirements.md)
- [Phase 1 Implementation](../file-upload/04_implementation-plan.md)

### Code References

- Upload Hook: `src/hooks/mutations/useSendMessage.ts`
- File Upload: `src/api/files.api.ts`
- Message API: `src/api/messages.api.ts`

---

## ⏱️ Timeline

| Phase                 | Status         | Date       |
| --------------------- | -------------- | ---------- |
| API Contract Review   | ⏳ PENDING     | 2026-01-14 |
| Requirements Approval | ⏳ PENDING     | TBD        |
| Wireframe Approval    | ⏳ PENDING     | TBD        |
| Implementation Plan   | ⏳ PENDING     | TBD        |
| Test Requirements     | ⏳ PENDING     | TBD        |
| Development           | ⏳ NOT STARTED | TBD        |
| Testing               | ⏳ NOT STARTED | TBD        |

---

## 🔄 Version History

| Version | Date       | Changes                                | Author |
| ------- | ---------- | -------------------------------------- | ------ |
| 2.0.0   | 2026-01-14 | Initial Phase 2 - Batch upload support | AI     |

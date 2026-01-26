# [BƯỚC 3] View Files Phase 2 - API Contract

**Module:** Chat  
**Feature:** View All Files - Jump to Message  
**Phase:** API Specification  
**Created:** 2026-01-16  
**Status:** ✅ N/A - No API Changes

---

## 📌 Overview

Phase 2 **KHÔNG có thay đổi API** - Chỉ sử dụng data có sẵn.

---

## ✅ Existing API Usage

### File Metadata Requirements

ViewAllFilesModal đã có `messageId` trong response hiện tại:

```typescript
// EXISTING API Response (đã có)
interface FileMetadata {
  fileId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  thumbnailUrl?: string;
  sentAt: string;
  senderName: string;
  senderId: string;
  messageId: string; // ✅ ĐÃ CÓ - Dùng cho jump feature
}
```

**Verification Required:**

- [ ] Confirm API response includes `messageId` field
- [ ] Verify `messageId` maps correctly to ChatMain message IDs

---

## 🔍 Message DOM Requirements

ChatMain component cần có `data-testid` trên message bubbles:

```tsx
// EXISTING ChatMain implementation
<MessageBubbleSimple
  data-testid={`message-bubble-${message.id}`} // ✅ Required
  message={message}
  // ...
/>
```

**Verification Required:**

- [ ] Check MessageBubbleSimple has correct data-testid
- [ ] Verify data-testid format matches: `message-bubble-{messageId}`

---

## 📊 No New Endpoints

| Endpoint | Method | Purpose | Status |
| -------- | ------ | ------- | ------ |
| (None)   | -      | -       | N/A    |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                    | Status       |
| --------------------------- | ------------ |
| Verified messageId in API   | ✅ Verified  |
| Verified data-testid exists | ✅ Verified  |
| **No API changes required** | ✅ CONFIRMED |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-16

---

**Next Step:** Create [04_implementation-plan.md](./04_implementation-plan.md)

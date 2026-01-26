# Implementation Plan: Category List File/Image Preview Fix

> **Bug ID:** CBN-PREVIEW-001  
> **Plan Date:** 2026-01-26  
> **Status:** ✅ IMPLEMENTED  
> **Solution:** Extract attachments từ SignalR event (Backend đã gửi rồi!)

---

## 📋 IMPACT SUMMARY (Tóm tắt thay đổi)

### Files sẽ tạo mới:

- (Không có)

### Files sẽ sửa đổi:

- `src/hooks/useCategoriesRealtime.ts` - Extract attachments từ SignalR event và update vào lastMessage
  - **Line 122:** Thêm `attachments` vào destructuring
  - **Lines 145-152:** Thêm `attachments` field vào lastMessage object

### Files sẽ xoá:

- (Không có)

### Dependencies sẽ thêm:

- (Không có - chỉ sửa code hiện tại)

---

## ✅ SOLUTION (Simplified - Backend đã gửi data rồi!)

**Phát hiện:** Backend **ĐÃ GỬI ĐẦY ĐỦ** attachments trong SignalR event. Frontend chỉ cần:

1. Extract `attachments` field từ event data
2. Include `attachments` vào `lastMessage` object khi update cache

**Complexity:** 🟢 **Rất đơn giản** - Chỉ sửa 2 dòng code

**Files affected:** 1 file duy nhất (`useCategoriesRealtime.ts`)

**No backend changes needed** ✅

**No API calls needed** ✅

**No new dependencies** ✅

---

## 🎯 IMPLEMENTATION STEPS

### Step 1: Update useCategoriesRealtime Hook

**File:** `src/hooks/useCategoriesRealtime.ts`

**Change 1:** Extract attachments từ message object (Line 122)

```typescript
// BEFORE: Chỉ lấy 6 fields
const { conversationId, senderId, id, senderName, content, sentAt } = message;

// AFTER: Thêm attachments
const {
  conversationId,
  senderId,
  id,
  senderName,
  content,
  sentAt,
  attachments,
} = message;
```

**Change 2:** Include attachments vào lastMessage (Lines 145-152)

```typescript
// BEFORE: lastMessage không có attachments
return {
  ...conv,
  lastMessage: {
    messageId: id,
    senderId,
    senderName,
    content,
    sentAt,
  },
  unreadCount: newUnreadCount,
};

// AFTER: Thêm attachments field
return {
  ...conv,
  lastMessage: {
    messageId: id,
    senderId,
    senderName,
    content,
    sentAt,
    attachments, // 🆕 ADD THIS
  },
  unreadCount: newUnreadCount,
};
```

### Step 2: Verify Changes

**Before implementation, verify:**

✅ `formatMessagePreview()` already supports attachments (no changes needed)  
✅ `LastMessageDto` type already has `attachments?: Array<...>` field  
✅ Backend SignalR event includes attachments data

**After implementation:**

1. Gửi message với attachment
2. **EXPECT:** Category list preview hiển thị ngay "Đã gửi 1 ảnh" (không cần reload)
3. **EXPECT:** Không có console errors

---

## 🧪 Testing Strategy

### Test Cases

| #    | Test Case                 | Expected Result                          | Status     |
| ---- | ------------------------- | ---------------------------------------- | ---------- |
| TC-1 | Gửi 1 ảnh                 | Preview: "[username]: Đã gửi 1 ảnh"      | ⏳ PENDING |
| TC-2 | Gửi 3 ảnh                 | Preview: "[username]: Đã gửi 3 ảnh"      | ⏳ PENDING |
| TC-3 | Gửi 1 file (report.pdf)   | Preview: "[username]: Đã gửi tệp re..."  | ⏳ PENDING |
| TC-4 | Gửi 2 files               | Preview: "[username]: Đã gửi 2 tệp"      | ⏳ PENDING |
| TC-5 | Gửi 1 ảnh + 1 file        | Preview: "[username]: Đã gửi 2 tệp đ..." | ⏳ PENDING |
| TC-6 | Gửi text + attachment     | Preview: "[username]: [text content]"    | ⏳ PENDING |
| TC-7 | Nhận message từ user khác | Preview updates real-time                | ⏳ PENDING |
| TC-8 | Reload page sau khi gửi   | Preview vẫn đúng (persisted)             | ⏳ PENDING |

### Manual Testing Steps

1. Login to app
2. Open category A
3. Send message với attachment (ảnh/file)
4. **CHECK:** Category list preview updates immediately ✅
5. **CHECK:** Preview shows correct format (not "...") ✅
6. **NO RELOAD** needed ✅
7. Switch to different category
8. Switch back to category A
9. **CHECK:** Preview vẫn đúng ✅

---

## ⏳ PENDING DECISIONS (Chờ HUMAN quyết định)

| #   | Vấn đề                   | Lựa chọn          | HUMAN Decision     |
| --- | ------------------------ | ----------------- | ------------------ |
| 1   | **Approve to implement** | Ready to proceed? | ⬜ **✅ APPROVED** |

> ⚠️ **AI SẼ IMPLEMENT ngay khi được approve (chỉ cần tick ✅)**

---

## 📅 Implementation Timeline (Estimate)

- Code changes: **5 minutes** (2 dòng code)
- Testing: **10 minutes** (manual tests)
- **Total:** ~15 minutes

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                 | Status           |
| ------------------------ | ---------------- |
| Đã review Impact Summary | ⬜ Chưa review   |
| Đã hiểu Solution         | ⬜ Chưa hiểu     |
| **APPROVED để thực thi** | ⬜ CHƯA APPROVED |

**HUMAN Signature:** [Chờ duyệt]  
**Date:** ****\_\_\_****

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

## 🔗 References

- Root Cause Analysis: [01_root-cause-analysis.md](./01_root-cause-analysis.md)
- Related Code:
  - [useCategoriesRealtime.ts](f:/Working/NgocMinhV2/QUOCNAM/WebUser/src/hooks/useCategoriesRealtime.ts#L122) (line 122 - needs update)
  - [formatMessagePreview.ts](f:/Working/NgocMinhV2/QUOCNAM/WebUser/src/utils/formatMessagePreview.ts) (already correct)
- Bug Summary: [00_README.md](./00_README.md)

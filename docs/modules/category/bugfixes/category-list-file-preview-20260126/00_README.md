# Bug Fix: Category List File/Image Preview Not Showing Real-time

> **Bug ID:** CBN-PREVIEW-001  
> **Created:** 2026-01-26  
> **Status:** ✅ VERIFIED & CLOSED  
> **Priority:** P1 - High (UX Issue)  
> **Module:** Category

---

## 🐛 Bug Summary

**Issue:** Khi gửi/nhận file hoặc ảnh, vùng category list hiển thị "..." thay vì preview đúng format. Phải reload lại page mới hiển thị đúng.

**Expected Behavior:**

- Gửi 1/nhiều ảnh: `[username]: Đã gửi 1/2/3/4... ảnh`
- Gửi 1 file: `[username]: Đã gửi tệp [filename].[ext]`
- Gửi nhiều file hoặc mix: `[username]: Đã gửi 2/3/4/5 tệp`

**Actual Behavior:**

- Hiển thị: `[username]: ...`
- Sau khi reload page: Hiển thị đúng format

---

## 📊 Impact

**Affected Areas:**

- Category list sidebar (ConversationListSidebar.tsx)
- Real-time message updates (useCategoriesRealtime hook)

**User Impact:**

- 🔴 **High**: Users phải reload page để thấy preview đúng
- ⚠️ **Confusion**: Preview "..." không rõ ràng về nội dung tin nhắn

---

## 📁 Related Files

- `src/features/portal/workspace/ConversationListSidebar.tsx` - Category list UI
- `src/utils/formatMessagePreview.ts` - Message preview formatter
- `src/hooks/useCategoriesRealtime.ts` - SignalR real-time updates
- `src/types/categories.ts` - LastMessageDto type definition

---

## 📚 Documentation

- [Root Cause Analysis](./01_root-cause-analysis.md) - ⏳ Chờ HUMAN review
- [Implementation Plan](./02_implementation-plan.md) - ⏳ Chờ HUMAN approve solution

---

## 🔗 References

- Related Bug: [Unread Badge Not Clearing](../unread-badge-not-clearing-20260126/)
- API Docs: [Categories API](../../api/categories/)

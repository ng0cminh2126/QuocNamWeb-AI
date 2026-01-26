# Bug Fix: Category Unread Badge Không Biến Mất Khi Click

> **Bug ID:** CBN-UNREAD-001  
> **Date Created:** 2026-01-26  
> **Status:** 🚧 In Progress  
> **Priority:** High  
> **Module:** Category, Chat

---

## 📋 Bug Summary

**Vấn đề:**  
User admin đang active category B, conversation Group2. Khi nhận tin nhắn từ category A (conversation Group) → unread badge hiện lên. **Nhưng khi click vào category A, unread badge KHÔNG biến mất**.

**Expected Behavior:**  
Khi click vào category có unread badge → badge phải biến mất (unread count reset về 0).

**Actual Behavior:**  
Click vào category → unread badge vẫn hiển thị với số count cũ.

---

## 🔍 Root Cause Analysis

Chi tiết phân tích nguyên nhân tại: [01_root-cause-analysis.md](./01_root-cause-analysis.md)

### Tóm tắt nguyên nhân:

| #   | Vấn đề                                                                                               | File                             | Impact      |
| --- | ---------------------------------------------------------------------------------------------------- | -------------------------------- | ----------- |
| 1   | `useMarkConversationAsRead` **KHÔNG update** `categoriesKeys.list()`                                 | `useMarkConversationAsRead.ts`   | ⚠️ High     |
| 2   | `handleGroupSelect` **KHÔNG gọi** `markAsReadMutation`                                               | `ConversationListSidebar.tsx`    | ⚠️ High     |
| 3   | `useMarkConversationAsRead` **KHÔNG gọi API** → backend không biết user đã đọc                       | `useMarkConversationAsRead.ts`   | ⚠️ High     |
| 4   | Backend **KHÔNG phát MessageRead event** → `useCategoriesRealtime` không nhận signal để clear unread | (Backend issue - cần verify)     | 🔴 Critical |
| 5   | API `POST /api/conversations/{id}/mark-read` tồn tại nhưng **KHÔNG được sử dụng**                    | `conversations.api.ts`, mutation | ⚠️ High     |

---

## 🎯 Fix Strategy

Chúng ta sẽ fix theo 3 levels:

### Level 1: Optimistic Update (Quick Fix)

✅ **Implement ngay** - Fix UI ngay lập tức

- Update `useMarkConversationAsRead` để cập nhật `categoriesKeys.list()`
- Khi user click conversation → unread count set về 0 ngay

### Level 2: API Integration

✅ **Implement ngay** - Fix backend sync

- Sửa `useMarkConversationAsRead` để gọi API thật: `POST /api/conversations/{id}/mark-read`
- Backend lưu trạng thái đã đọc vào database

### Level 3: Real-time Sync

⏳ **Depends on Backend** - Fix cross-device sync

- Backend cần phát `MessageRead` event sau khi API được gọi thành công
- Frontend `useCategoriesRealtime` đã có listener sẵn (line 188-220)
- Event này sẽ sync unread count across all tabs/devices

---

## 📂 Related Documents

- [01_root-cause-analysis.md](./01_root-cause-analysis.md) - Chi tiết phân tích nguyên nhân
- [02_api-contract.md](./02_api-contract.md) - API specification cho mark-as-read endpoint
- [03_implementation-plan.md](./03_implementation-plan.md) - Implementation checklist
- [04_testing-plan.md](./04_testing-plan.md) - Test cases để verify fix

---

## 🚀 Implementation Progress

- [ ] **BƯỚC 1:** Setup API contract + snapshots
- [ ] **BƯỚC 2:** Update `useMarkConversationAsRead` hook
- [ ] **BƯỚC 3:** Update unit tests
- [ ] **BƯỚC 4:** Manual testing
- [ ] **BƯỚC 5:** Deploy to staging
- [ ] **BƯỚC 6:** Verify with backend team về MessageRead event

---

## ✅ Success Criteria

1. ✅ Click vào category có unread → badge biến mất ngay lập tức (optimistic update)
2. ✅ API `POST /api/conversations/{id}/mark-read` được gọi thành công
3. ✅ Unread count được persist trên server (reload page không hiện lại badge)
4. ⏳ (Optional) Cross-device sync hoạt động khi backend emit MessageRead event

---

## 📝 Notes

- Fix này **KHÔNG breaking changes** - chỉ thêm chức năng mới
- Backwards compatible với code hiện tại
- API đã có sẵn trên backend, chỉ cần integrate

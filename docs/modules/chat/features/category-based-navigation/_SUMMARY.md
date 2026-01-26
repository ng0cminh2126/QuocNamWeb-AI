# 📋 SUMMARY: Category-Based Navigation Feature

**Feature ID:** `CBN-001`  
**Created:** 2026-01-19  
**Status:** ⏳ WAITING FOR HUMAN APPROVAL

---

## 📊 Documentation Complete

Đã tạo đầy đủ tài liệu theo quy trình 7 bước cho feature **Category-Based Navigation**:

| Bước  | File                 | Status  | Location                                                 |
| ----- | -------------------- | ------- | -------------------------------------------------------- |
| 0     | Overview             | ✅ DONE | [00_README.md](./00_README.md)                           |
| 1     | Requirements         | ✅ DONE | [01_requirements.md](./01_requirements.md)               |
| 2A    | Wireframes           | ✅ DONE | [02a_wireframe.md](./02a_wireframe.md)                   |
| 2B    | Flow Diagrams        | ✅ DONE | [02b_flow.md](./02b_flow.md)                             |
| 3     | API Contract         | ✅ DONE | [03_api-contract.md](./03_api-contract.md)               |
| 4     | Implementation Plan  | ✅ DONE | [04_implementation-plan.md](./04_implementation-plan.md) |
| 4.5/6 | Testing Requirements | ✅ DONE | [06_testing.md](./06_testing.md)                         |

---

## 🎯 Feature Overview

### What Changes:

1. **Tab Rename:**
   - "Conversation Category" → "Nhóm" (shows categories)
   - "Nhóm" → "Nhóm old" (legacy flat list)
2. **Category Click Behavior:**

   - Click category → Open chat screen
   - ChatHeader có embedded conversation list
   - Auto-select first conversation
   - Load messages immediately

3. **Conversation List in ChatHeader:**
   - Vị trí: Dưới `conversation-status-line`
   - 2 options: Dropdown hoặc Inline Panel
   - Hiển thị: conversations trong category
   - Tương tác: Click → switch conversation

### Data Flow:

```
Categories (/api/categories)
  ↓ [Click category]
Category Conversations (/api/categories/{id}/conversations)
  ↓ [Auto-select first]
Messages (/api/conversations/{id}/messages)
```

---

## 📋 Pending Decisions Summary

**HUMAN cần quyết định 10 mục trong Requirements (01_requirements.md):**

| Decision ID | Vấn đề                       | Options                               |
| ----------- | ---------------------------- | ------------------------------------- |
| PD-1.1      | Conversation list UI pattern | Dropdown / Inline Panel / Collapsible |
| PD-1.2      | Auto-select behavior         | Always / Wait for user                |
| PD-1.3      | Max height                   | Fixed 200px / Dynamic                 |
| PD-1.4      | Tab value rename             | "workTypes" → "categories"?           |
| PD-1.5      | Show last message            | Yes / No                              |
| PD-1.6      | Empty category behavior      | Stay / Redirect                       |
| PD-1.7      | Mobile conversation list     | Same as desktop / Bottom sheet        |
| PD-1.8      | Scroll behavior              | Auto-scroll to active / Manual        |
| PD-1.9      | Real-time updates            | Auto-refresh list / Manual            |
| PD-1.10     | Mark as read timing          | On select / On send                   |

**HUMAN cần quyết định 8 mục trong Wireframe (02a_wireframe.md):**

- UI style, avatar shape, max heights, mobile behavior, etc.

**HUMAN cần quyết định 8 mục trong Flow (02b_flow.md):**

- Auto-select, mark-as-read, URL params, sync behavior, etc.

**HUMAN cần quyết định 4 mục trong API Contract (03_api-contract.md):**

- Hook file location, stale time, cache strategy, retry logic

**HUMAN cần quyết định 8 mục trong Implementation Plan (04_implementation-plan.md):**

- Same as above (duplicates consolidated)

**HUMAN cần quyết định 4 mục trong Testing (06_testing.md):**

- E2E environment, coverage threshold, visual regression, performance tests

---

## 📊 Implementation Impact

### Files to Create: **4 files**

1. `ConversationListItem.tsx` (or `ConversationDropdown.tsx`)
2. `ConversationListItem.test.tsx`
3. `useCategoryConversations.test.ts` (if separate file)
4. `category-navigation.spec.ts` (E2E)

### Files to Modify: **6 files**

1. `ConversationListSidebar.tsx` - Tab rename, add handler
2. `ChatHeader.tsx` - Add conversation list UI
3. `ChatWorkspace.tsx` - State & API integration
4. `categories.api.ts` - Add getCategoryConversations
5. `useCategories.ts` - Extend with new hook
6. `categories.api.test.ts` - Add tests

### Dependencies to Add: **0**

- Sử dụng existing dependencies

---

## ⏱️ Estimated Effort

**Total:** 6-8 hours

- Phase 1 (API Layer): 1-2 hours
- Phase 2 (Components): 2-3 hours
- Phase 3 (State Management): 2-3 hours
- Testing: Covered in 06_testing.md

---

## 🧪 Testing Coverage

**Total Test Cases:** 34

- Unit Tests: 9 cases
- Component Tests: 19 cases
- E2E Tests: 6 cases

**Test Files:** 6 files (3 new, 3 extended)

---

## ⚠️ Critical Notes

### BLOCKED: Cannot Code Until Approved

Theo CRITICAL RULES, AI **KHÔNG ĐƯỢC** viết code cho đến khi:

1. ✅ HUMAN đã review tất cả 6 documents
2. ✅ HUMAN đã điền tất cả Pending Decisions (40+ mục)
3. ✅ HUMAN đã tick checkbox "APPROVED để thực thi" trong MỌI file

### Required Approvals:

| Document                  | HUMAN Confirmation Status |
| ------------------------- | ------------------------- |
| 01_requirements.md        | ⬜ CHƯA APPROVED          |
| 02a_wireframe.md          | ⬜ CHƯA APPROVED          |
| 02b_flow.md               | ⬜ CHƯA APPROVED          |
| 03_api-contract.md        | ⬜ CHƯA APPROVED          |
| 04_implementation-plan.md | ⬜ CHƯA APPROVED          |
| 06_testing.md             | ⬜ CHƯA APPROVED          |

---

## 📖 How to Proceed (For HUMAN)

### Step 1: Review Documents

Mở từng file và đọc kỹ:

- Requirements: Có đúng những gì bạn cần?
- Wireframes: UI có đúng mong đợi?
- Flow: Logic có hợp lý?
- API Contract: API có sẵn và đúng?
- Implementation Plan: Phương án code có khả thi?
- Testing: Test coverage có đủ?

### Step 2: Fill Pending Decisions

Trong mỗi file, tìm section **PENDING DECISIONS** và điền:

```markdown
| #   | Vấn đề   | Lựa chọn           | HUMAN Decision  |
| --- | -------- | ------------------ | --------------- | -------------- |
| 1   | UI style | Dropdown / Inline? | ✅ **Dropdown** | ← Điền vào đây |
```

### Step 3: Approve Each Document

Tại cuối mỗi file, tick checkbox:

```markdown
## ✅ HUMAN CONFIRMATION

| Hạng mục                 | Status       |
| ------------------------ | ------------ | -------------- |
| Đã review                | ✅ Đã review | ← Đổi thành ✅ |
| Đã điền Pending          | ✅ Đã điền   | ← Đổi thành ✅ |
| **APPROVED để thực thi** | ✅ APPROVED  | ← Đổi thành ✅ |

**HUMAN Signature:** [Tên bạn] ← Điền tên
**Date:** 2026-01-19 ← Điền ngày
```

### Step 4: Request Code Implementation

Sau khi TẤT CẢ 6 files đều có ✅ APPROVED, yêu cầu AI:

```
Đã approve tất cả documents. Vui lòng bắt đầu implement code theo plan.
```

AI sẽ kiểm tra approvals và bắt đầu code nếu hợp lệ.

---

## 🔗 Related Documentation

- Feature Workflow Guide: `docs/guides/feature_development_workflow.md`
- Testing Strategy: `docs/guides/testing_strategy_20251226_claude_opus_4_5.md`
- Code Conventions: `docs/guides/code_conventions_20251226_claude_opus_4_5.md`
- Existing Chat Features: `docs/modules/chat/`

---

## 📞 Questions/Concerns?

Nếu có bất kỳ câu hỏi hoặc cần clarification về bất kỳ phần nào:

1. Comment trực tiếp vào file tương ứng
2. Hoặc yêu cầu AI giải thích chi tiết hơn: "Giải thích chi tiết hơn về [topic]"
3. Hoặc yêu cầu AI tạo alternatives: "Tạo option khác cho [decision]"

AI sẽ **KHÔNG** tự ý code mà sẽ tạo thêm tài liệu/giải thích cho đến khi HUMAN approve.

---

**Status:** ⏳ WAITING FOR HUMAN APPROVAL  
**Next Action:** HUMAN review và approve documents  
**Blocked Until:** All approvals received

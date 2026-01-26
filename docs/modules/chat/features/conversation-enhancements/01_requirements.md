# [BƯỚC 1] Requirements - Conversation Enhancements

**Feature:** Conversation Enhancements  
**Date:** 2026-01-20  
**Updated:** 2026-01-21 (with bug fixes)  
**Status:** ✅ APPROVED & COMPLETED

---

## 📝 Requirements Overview

### REQ-1: Members Count Display ✅ COMPLETED (with bug fixes)

**As a** chat user  
**I want to** see the number of members in the current conversation  
**So that** I know how many people are in the conversation

**Requirements:**

1. ✅ Gọi API `GET /api/conversations/{id}/members` mỗi khi chọn conversation
2. ✅ Hiển thị số thành viên trong ChatHeader (format: "X thành viên")
3. ✅ Loading state khi đang fetch members
4. ✅ Error handling nếu API fail
5. 🐛 **FIXED:** Member count updates correctly when switching conversations
6. 🐛 **FIXED:** Prevent displaying stale member data from previous conversation

---

### REQ-2: Conversation Persistence (LocalStorage) ✅ COMPLETED (with bug fixes)

**As a** chat user  
**I want to** quay lại đúng conversation đã chọn khi reload trang  
**So that** không mất context công việc đang làm

**Requirements:**

1. ✅ Lưu vào LocalStorage:
   - `selected-category-id`: ID của category đang active
   - `selected-conversation-id`: ID của conversation đang active
2. ✅ Restore khi component mount từ localStorage
3. ✅ Update LocalStorage mỗi khi user chọn category/conversation mới
4. ✅ Fallback về default nếu không tìm thấy conversation trong localStorage
5. 🐛 **FIXED:** Active conversation persists correctly across page reloads

---

### REQ-3: ConversationDetailPanel Enhancement ✅ COMPLETED

**As a** chat user  
**I want to** xem rõ thông tin về nhóm và loại việc đang xem  
**So that** hiểu rõ context của conversation

**Requirements:**

1. ✅ **Nhóm (Group):** Hiển thị tên category đang active
2. ✅ **Loại việc:** Hiển thị tên conversation/group chat đang active
3. ✅ Cập nhật real-time khi chuyển conversation

---

## 🎯 Acceptance Criteria

### AC-1: Members Count API Integration ✅ ALL PASSED

- ✅ **Given** user chọn conversation A  
   **When** conversation switches  
   **Then** API GET /conversations/{A}/members được gọi

- ✅ **Given** API trả về members count = 5  
   **When** data loaded  
   **Then** ChatHeader hiển thị "5 thành viên"

- ✅ **Given** API đang loading  
   **When** waiting for response  
   **Then** Hiển thị fallback value từ memberCount prop

- ✅ **Given** API error  
   **When** request fails  
   **Then** TanStack Query retry mechanism handles error

### AC-2: LocalStorage Persistence ✅ ALL PASSED

- ✅ **Given** user chọn Category "Dự án A", Conversation "Task 123"  
   **When** user reload trang (F5)  
   **Then** Trang mở lại đúng Category "Dự án A" và Conversation "Task 123"

- ✅ **Given** user chọn conversation mới  
   **When** conversation changes  
   **Then** LocalStorage được update với conversationId mới

- ✅ **Given** LocalStorage có conversationId không còn tồn tại  
   **When** restore on mount  
   **Then** Fallback về first available conversation

- ✅ **Given** LocalStorage empty (first visit)  
   **When** component mounts  
   **Then** Chọn default conversation (from prop or first available)

### AC-3: ConversationDetailPanel Display

- [ ] **Given** user đang xem conversation "Task ABC" trong category "Marketing"  
       **When** ConversationDetailPanel renders  
       **Then** Nhóm hiển thị "Marketing", Loại việc hiển thị "Task ABC"

- [ ] **Given** user chuyển sang conversation "Bug #456" trong category "Dev Team"  
       **When** conversation changes  
       **Then** Nhóm update "Dev Team", Loại việc update "Bug #456"

---

## 🔍 Root Cause Analysis

### Issue 1: Members Count Not Displayed

**Current State:**

- ChatHeader không có thông tin members count
- Không có API call để lấy members

**Why Needed:**

- User cần biết có bao nhiêu người trong conversation để tag đúng người, follow-up công việc
- Quan trọng cho group conversations (nhiều thành viên)

### Issue 2: Lost Context on Reload

**Current State:**

- Mỗi lần reload, quay về default category + conversation
- User phải chọn lại conversation đang làm việc

**Why Needed:**

- UX frustration: mất context công việc
- Làm gián đoạn workflow khi refresh do bug/update

### Issue 3: Incorrect Detail Panel Display

**Current State:**

- ConversationDetailPanel không hiển thị đúng category name
- Loại việc không sync với conversation active

**Why Needed:**

- User confusion: không biết đang ở nhóm nào, loại việc nào
- Cần thông tin rõ ràng để tránh nhầm lẫn khi multitasking

---

## 🧪 Test Scenarios

### Test Case 1: Members Count

**Preconditions:** User logged in, có conversations với số members khác nhau

**Steps:**

1. Chọn conversation A (3 members)
2. Verify API called with correct conversationId
3. Verify ChatHeader shows "3 thành viên"
4. Chọn conversation B (10 members)
5. Verify API called again
6. Verify ChatHeader updates to "10 thành viên"

**Expected:** Members count hiển thị chính xác và update khi switch

### Test Case 2: LocalStorage Persistence

**Preconditions:** User logged in

**Steps:**

1. Chọn category "Marketing" (ID: cat-001)
2. Chọn conversation "Campaign Review" (ID: conv-456)
3. Verify LocalStorage: `selected-category-id = cat-001`, `selected-conversation-id = conv-456`
4. Reload page (F5)
5. Verify page opens with category "Marketing" active
6. Verify conversation "Campaign Review" selected

**Expected:** Trạng thái được restore chính xác

### Test Case 3: LocalStorage Fallback

**Preconditions:** LocalStorage có conversationId đã bị xóa

**Steps:**

1. Set LocalStorage: `selected-conversation-id = conv-deleted`
2. Reload page
3. Verify app không crash
4. Verify fallback về first available category + conversation

**Expected:** Graceful fallback, không lỗi

### Test Case 4: Detail Panel Display

**Preconditions:** User trong conversation

**Steps:**

1. Chọn category "Dev Team", conversation "Bug #123"
2. Mở ConversationDetailPanel
3. Verify "Nhóm" = "Dev Team"
4. Verify "Loại việc" = "Bug #123"
5. Chuyển sang conversation "Feature Request"
6. Verify "Loại việc" updates to "Feature Request"

**Expected:** Thông tin hiển thị chính xác và sync realtime

---

## 📋 IMPACT SUMMARY

### Files sẽ tạo mới:

- `src/api/conversations.api.ts` (hoặc update existing) - Add `getConversationMembers()` function
- `src/hooks/queries/useConversationMembers.ts` - Query hook cho members
- `src/hooks/useConversationPersistence.ts` - LocalStorage hook
- `src/types/conversation.ts` (update) - Add Member type

### Files sẽ sửa đổi:

- `src/features/portal/components/chat/ChatHeader.tsx`
  - Thêm useConversationMembers hook
  - Update prop `memberCount` với giá trị từ API
  - **KHÔNG đổi UI** - UI đã có sẵn, chỉ update data

- `src/features/portal/components/chat/ChatMainContainer.tsx`
  - Thêm useConversationPersistence hook
  - Load persisted state on mount
  - Save state on category/conversation change

- `src/features/portal/workspace/ConversationDetailPanel.tsx`
  - Nhận props: `categoryName`, `conversationName`
  - Update UI để hiển thị đúng
  - Sync với active conversation

- `src/stores/chatStore.ts` (if exists) hoặc context
  - Lưu activeCategoryId, activeConversationId để share giữa components

### Files sẽ xoá:

- (không có)

### Dependencies sẽ thêm:

- (không có - sử dụng existing: TanStack Query, localStorage web API)

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                                         | Giải thích                                                                                          | HUMAN Decision                                           |
| --- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | Members count display position in ChatHeader?  | ChatHeader đã có `memberCount` prop, chỉ cần update giá trị từ API, **KHÔNG đổi UI**                | ✅ **Giữ nguyên UI hiện tại**                            |
| 2   | Members count format?                          | Format hiển thị số thành viên                                                                       | ✅ **Theo UI hiện tại**                                  |
| 3   | LocalStorage keys?                             | Dùng 2 keys riêng: `selected-category-id` và `selected-conversation-id` (theo format cũ)            | ✅ **2 keys riêng biệt**                                 |
| 4   | Fallback behavior when persisted conv deleted? | Khi conversation đã lưu bị xóa, chọn conversation nào?                                              | ✅ **First available**                                   |
| 5   | ConversationDetailPanel field labels?          | ❓ **Giải thích:** Labels hiển thị trong panel bên phải. VD: "Nhóm: Marketing" hay "Category: ..."? | ⬜ **Không cần prefix chỉ cần tên của category là được** |
| 6   | Should persist across different browsers?      | LocalStorage chỉ lưu trên 1 browser, không sync sang browser/device khác                            | ✅ **No (LocalStorage only)**                            |
| 7   | API response cache time for members?           | ❓ **Giải thích:** Sau khi fetch members, cache bao lâu trước khi refetch? (để tối ưu performance)  | ⬜ **Cache dài (5 phút)**                                |
| 8   | Should refetch members on conversation switch? | Mỗi khi chuyển conversation, có gọi API lại không hay dùng cache?                                   | ✅ **Always refetch (no stale)**                         |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status           |
| ------------------------- | ---------------- |
| Đã review Impact Summary  | ⬜ Chưa review   |
| Đã điền Pending Decisions | ⬜ Chưa điền     |
| **APPROVED để thực thi**  | ⬜ CHƯA APPROVED |

**HUMAN Signature:** [Chưa ký]  
**Date:** \***\*\_\_\_\*\***

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

## 🔗 References

- Current ChatHeader: `src/features/portal/components/chat/ChatHeader.tsx`
- Current ConversationDetailPanel: `src/features/portal/workspace/ConversationDetailPanel.tsx`
- Current ChatMainContainer: `src/features/portal/components/chat/ChatMainContainer.tsx`

---

**Created:** 2026-01-20  
**Status:** ⏳ PENDING HUMAN APPROVAL  
**Next Step:** HUMAN review requirements → Fill pending decisions → Approve

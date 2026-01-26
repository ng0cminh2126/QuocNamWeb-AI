# [BƯỚC 1] Requirements - Category Unread Realtime Bugfix

**Feature:** Category Conversations Unread Count Realtime Update  
**Date:** 2026-01-20  
**Status:** ✅ RESOLVED

---

## 📋 Problem Description

### Current Behavior (BUG)

**Scenario:**

1. User A và User B cùng trong 1 category với nhiều conversations (Group, Group 3, etc.)
2. User B đang mở conversation "Group 3" trong ChatHeader
3. User A gửi tin nhắn vào conversation "Group" (khác với Group 3)

**Expected:**

- Tab "Group" trong ChatHeader (User B) hiển thị unread badge realtime (ví dụ: số "1", "2", etc.)

**Actual:**

- ❌ Tab "Group" KHÔNG hiển thị unread badge
- ❌ User B không biết có tin nhắn mới cho đến khi refresh page hoặc switch tab

### User Impact

| Impact Type  | Description                                   | Severity |
| ------------ | --------------------------------------------- | -------- |
| UX           | User không nhận thức được tin nhắn mới        | HIGH     |
| Productivity | Phải manually check từng conversation         | MEDIUM   |
| Trust        | User nghĩ app không hoạt động realtime        | HIGH     |
| Feature Goal | CBN-002 category navigation mất giá trị chính | HIGH     |

---

## 🔍 Root Cause Analysis

### Data Flow Investigation

```
┌─────────────────────────────────────────────────────────────┐
│  SignalR Event: MessageSent                                 │
│  { message: { conversationId: "group-1", content: "..." } } │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  useConversationRealtime Hook                               │
│  - Listen to MessageSent event                              │
│  - Update conversationKeys.groups() cache                   │
│  - Update conversationKeys.directs() cache                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  TanStack Query Cache Updated                               │
│  conversationKeys.groups() → { unreadCount: 1 }             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ChatMainContainer.apiGroups (from useGroups)               │
│  ✅ DOES update (reactive to cache changes)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ChatMainContainer.categoryConversations (useMemo)          │
│  ❌ DOES NOT re-compute (missing dependency trigger)       │
│  Dependencies: [selectedCategoryId, categories, apiGroups]  │
│  Problem: apiGroups reference KHÔNG thay đổi (shallow eq)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ChatHeader - Conversation Tabs                             │
│  ❌ Stale unreadCount displayed                             │
└─────────────────────────────────────────────────────────────┘
```

### Root Cause: useMemo Shallow Equality

**File:** [ChatMainContainer.tsx](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\features\portal\components\chat\ChatMainContainer.tsx#L204-L221)

**Problem Code:**

```tsx
const categoryConversations = useMemo<ConversationInfoDto[]>(() => {
  if (!selectedCategoryId || !categories) return [];

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
  );

  const conversations = selectedCategory?.conversations ?? [];
  return conversations.map((conv) => {
    const groupData = apiGroups.find((g) => g.id === conv.conversationId);
    return {
      ...conv,
      // ✅ Logic đúng: Merge realtime unread count từ apiGroups
      unreadCount: groupData?.unreadCount ?? conv.unreadCount ?? 0,
    };
  });
}, [selectedCategoryId, categories, apiGroups]); // ⚠️ Vấn đề: apiGroups
```

**Why it doesn't update:**

1. `apiGroups` được tạo từ `flattenGroups(groupsQuery.data)`
2. TanStack Query cache update → `groupsQuery.data` thay đổi (deep)
3. Nhưng `flattenGroups()` return new array → reference mới
4. ⚠️ **ISSUE:** React useMemo so sánh `apiGroups` bằng `Object.is()` (shallow)
5. Nếu array length và item references giống → React skip re-compute
6. → `categoryConversations` không update → ChatHeader stale

**Evidence:**

- `flattenGroups()` logic: [ChatMainContainer.tsx#L91-L107](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\features\portal\components\chat\ChatMainContainer.tsx#L91-L107)
- TanStack Query internal caching: Reference có thể giữ nguyên nếu item objects không change reference

### Why it works in Conversation List but NOT in ChatHeader

| Component        | Data Source                  | Update Trigger                    | Works? |
| ---------------- | ---------------------------- | --------------------------------- | ------ |
| ConversationList | `useGroups()` directly       | TanStack Query auto re-render     | ✅ Yes |
| ChatHeader Tabs  | `categoryConversations` memo | Manual dependency check (useMemo) | ❌ No  |

---

## 📝 Acceptance Criteria

### AC-1: Realtime Unread Count Display

**Given:** User B đang mở conversation "Group 3" trong category "Work"  
**When:** User A gửi tin nhắn vào conversation "Group" (cùng category)  
**Then:**

- ✅ Tab "Group" trong ChatHeader hiển thị unread badge với số "1"
- ✅ Latency < 2 giây (từ lúc gửi đến lúc hiển thị)
- ✅ Badge có màu đỏ background để nổi bật

### AC-2: Unread Count Increment

**Given:** Tab "Group" đang hiển thị badge "1"  
**When:** User A gửi thêm 1 tin nhắn nữa  
**Then:**

- ✅ Badge update thành "2"
- ✅ Update realtime không cần refresh

### AC-3: Badge Reset khi Switch Tab

**Given:** Tab "Group" đang hiển thị badge "2"  
**When:** User B click vào tab "Group"  
**Then:**

- ✅ Badge biến mất (unreadCount reset về 0)
- ✅ Conversation "Group" được load với tin nhắn mới

### AC-4: No Badge trên Active Conversation

**Given:** User B đang xem conversation "Group" (active)  
**When:** User A gửi tin nhắn vào "Group"  
**Then:**

- ✅ KHÔNG hiển thị badge trên tab "Group" (vì đang active)
- ✅ Tin nhắn mới xuất hiện trong message list realtime

### AC-5: Cross-Tab Sync (Bonus)

**Given:** User B mở app trên 2 browser tabs  
**When:** Tab 1 click vào "Group" (clear badge)  
**Then:**

- ✅ Tab 2 cũng clear badge "Group" (sync qua SignalR MessageRead event)

---

## 🧪 Test Scenarios

### Manual Test

**Prerequisites:**

- 2 browser windows (Chrome Incognito)
- User 1: `user@quoc-nam.com` / `User@123`
- User 2: `admin@quoc-nam.com` / `Admin@123`
- Both users in same category với ít nhất 2 conversations

**Steps:**

1. **Setup:**
   - Browser A: Login User 1 → Select category "Work" → Open "Group 3"
   - Browser B: Login User 2 → Select category "Work" → Open "Group 3"

2. **Test AC-1 (Unread Badge):**
   - Browser A (User 1): Send message vào "Group" conversation
   - Browser B (User 2): VERIFY tab "Group" shows badge "1" (trong vòng 2s)

3. **Test AC-2 (Increment):**
   - Browser A: Send thêm 1 message nữa
   - Browser B: VERIFY badge "1" → "2"

4. **Test AC-3 (Reset):**
   - Browser B: Click tab "Group"
   - Browser B: VERIFY badge disappear + message list load

5. **Test AC-4 (No Badge khi Active):**
   - Browser B: Đang xem "Group" (active)
   - Browser A: Send message vào "Group"
   - Browser B: VERIFY NO badge, message appears in list

6. **Test AC-5 (Cross-tab):**
   - Browser B: Open duplicate tab (Ctrl+Shift+T hoặc duplicate)
   - Tab 1: Click "Group" → Clear badge
   - Tab 2: VERIFY badge cũng clear (sau ~1-2s)

### E2E Automation Test

**File:** `tests/chat/category-conversations-realtime.spec.ts` (NEW)

**Test Cases:**

```typescript
describe("Category Conversations - Realtime Unread Count", () => {
  test("TC-1: Shows unread badge when message received in inactive conversation", async () => {
    // User B opens Group 3
    // User A sends message to Group
    // Expect: Badge "1" appears on Group tab
  });

  test("TC-2: Increments badge when multiple messages received", async () => {
    // User A sends 2 messages
    // Expect: Badge "1" → "2"
  });

  test("TC-3: Clears badge when switching to conversation", async () => {
    // Badge shows "2"
    // User B clicks Group tab
    // Expect: Badge disappears
  });

  test("TC-4: No badge on active conversation", async () => {
    // User B viewing Group (active)
    // User A sends message to Group
    // Expect: No badge, message in list
  });
});
```

---

## ⚙️ Technical Requirements

### Fix Requirements

| Requirement                    | Priority | Notes                                 |
| ------------------------------ | -------- | ------------------------------------- |
| Fix useMemo dependencies       | MUST     | Add trigger để force re-compute       |
| No breaking changes            | MUST     | Backward compatible với existing code |
| No extra API calls             | MUST     | Leverage existing SignalR events      |
| Add debug logging (optional)   | NICE     | Help troubleshoot realtime issues     |
| Performance: < 100ms re-render | MUST     | Không gây lag khi update              |

### Testing Requirements

| Requirement                 | Priority | Notes                              |
| --------------------------- | -------- | ---------------------------------- |
| E2E test với 2 users        | MUST     | Playwright automation              |
| Cross-browser test (Chrome) | MUST     | Primary browser                    |
| Network delay simulation    | NICE     | Test với slow network (throttling) |
| Flaky test retry (max 3)    | MUST     | Handle SignalR timing issues       |

---

## 🔗 Related Issues

### Dependencies

- ✅ CBN-002 Feature: Category-based Navigation (already implemented)
- ✅ SignalR Integration: `useConversationRealtime` hook (already working)
- ✅ TanStack Query Cache: Groups query (already working)

### Blockers

- None (all dependencies ready)

### Follow-up

- [ ] Monitor performance impact sau khi fix
- [ ] Consider adding animation khi badge xuất hiện (fade-in)
- [ ] Document pattern cho future useMemo pitfalls

---

## 📊 IMPACT SUMMARY

### Files to Modify

1. **[ChatMainContainer.tsx](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\features\portal\components\chat\ChatMainContainer.tsx#L204-L221)**
   - Fix `categoryConversations` useMemo dependencies
   - Add `groupsQuery.dataUpdatedAt` to force re-compute khi cache update

2. **[useConversationRealtime.ts](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\hooks\useConversationRealtime.ts#L100-L140)** (Optional)
   - Add debug logging: `console.log('🔔 [Category] Unread updated:', ...)`

### Files to Create

1. **`tests/chat/category-conversations-realtime.spec.ts`** (NEW)
   - E2E test với 2 users
   - 4 test cases (AC-1 to AC-4)
   - Credentials: `user@quoc-nam.com` / `admin@quoc-nam.com`

### Dependencies

- No new packages required
- No API changes needed

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                              | Lựa chọn                            | HUMAN Decision |
| --- | ----------------------------------- | ----------------------------------- | -------------- |
| 1   | Add debug logging?                  | Yes (helpful) / No (clean code)     | ⬜ **Yes**     |
| 2   | E2E test wait for badge timeout     | 2000ms / 3000ms / 5000ms            | ⬜ **3000ms**  |
| 3   | Badge animation when appearing?     | Instant / Fade-in 200ms             | ⬜ **Instant** |
| 4   | Test cross-tab sync (AC-5)?         | Yes (comprehensive) / No (overkill) | ⬜ **No**      |
| 5   | Retry failed tests (flaky network)? | Yes (max 3) / No                    | ⬜ **Yes**     |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                      | Status           |
| ----------------------------- | ---------------- |
| Đã review Problem Description | ⬜ Chưa review   |
| Đã review Root Cause Analysis | ⬜ Chưa review   |
| Đã review Acceptance Criteria | ⬜ Chưa review   |
| Đã điền Pending Decisions     | ✅ Đã điền       |
| **APPROVED để thực thi**      | ⬜ CHƯA APPROVED |

**HUMAN Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_  
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tạo implementation plan nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

## 📚 References

### Code Files

- [ChatMainContainer.tsx](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\features\portal\components\chat\ChatMainContainer.tsx) - Added mark as read + refetch
- [useConversationRealtime.ts](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\hooks\useConversationRealtime.ts) - Removed invalidateQueries, added categories join
- [useMarkConversationAsRead.ts](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\hooks\mutations\useMarkConversationAsRead.ts) - Optimistic update only
- [SignalRProvider.tsx](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\providers\SignalRProvider.tsx) - Cleanup debug logs
- [ConversationListContainer.tsx](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\features\portal\components\workspace\ConversationListContainer.tsx) - Removed duplicate hook
- [ConversationListSidebar.tsx](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\features\portal\components\workspace\ConversationListSidebar.tsx) - Removed duplicate hook

### Session Documentation

- [session_realtime_unread_count_fix_20260120.md](../../../sessions/session_realtime_unread_count_fix_20260120.md) - Complete session summary

### Root Causes Fixed

1. ❌ **Badge stuck at 1** → ✅ Removed invalidateQueries (6 locations)
2. ❌ **Duplicate events** → ✅ Single hook instance
3. ❌ **Own messages increment** → ✅ Added isOwnMessage check
4. ❌ **Missing messages from other categories** → ✅ Join ALL via categories API
5. ❌ **Badge not clearing** → ✅ Added markAsRead + refetch on switch
6. ❌ **Missing API** → ✅ Optimistic update only
7. ❌ **Stuck when returning** → ✅ isFirstMountRef flag

### Related Features

- [CBN-002: Category-based Navigation](../../features/upgrade-conversation-ux/)
- [Conversation List Realtime](../../features/conversation-list/)

---

**Status:** ✅ ALL ISSUES RESOLVED  
**Last Updated:** 2026-01-20

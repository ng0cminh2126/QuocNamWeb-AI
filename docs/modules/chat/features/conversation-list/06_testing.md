# [BƯỚC 6] Testing Documentation - Conversation List

> **Feature:** Danh sách đoạn chat  
> **Status:** ⏳ PENDING IMPLEMENTATION

---

## 🧪 Test Strategy

### Unit Tests

| Component        | Test File                   | Cases |
| ---------------- | --------------------------- | ----- |
| ConversationList | `ConversationList.test.tsx` | 6     |
| ConversationItem | `ConversationItem.test.tsx` | 5     |
| useConversations | `useConversations.test.ts`  | 5     |

### Test Cases - ConversationList

| #   | Case                                 | Type | Status |
| --- | ------------------------------------ | ---- | ------ |
| 1   | Renders loading skeleton initially   | Unit | ⏳     |
| 2   | Renders conversation list after load | Unit | ⏳     |
| 3   | Filters by tab (groups/direct)       | Unit | ⏳     |
| 4   | Search filters results               | Unit | ⏳     |
| 5   | Handles empty state                  | Unit | ⏳     |
| 6   | Handles error state with retry       | Unit | ⏳     |

### Test Cases - ConversationItem

| #   | Case                          | Type | Status |
| --- | ----------------------------- | ---- | ------ |
| 1   | Renders group conversation    | Unit | ⏳     |
| 2   | Renders DM with online status | Unit | ⏳     |
| 3   | Shows unread badge            | Unit | ⏳     |
| 4   | Highlights selected state     | Unit | ⏳     |
| 5   | Calls onSelect on click       | Unit | ⏳     |

### Test Cases - useConversations Hook

| #   | Case                            | Type | Status |
| --- | ------------------------------- | ---- | ------ |
| 1   | Returns loading state initially | Unit | ⏳     |
| 2   | Returns data on success         | Unit | ⏳     |
| 3   | Returns error on failure        | Unit | ⏳     |
| 4   | Sends auth token                | Unit | ⏳     |
| 5   | Refetches on invalidate         | Unit | ⏳     |

---

## 📊 Coverage Target

| Type       | Target | Actual |
| ---------- | ------ | ------ |
| Statements | ≥80%   | -      |
| Branches   | ≥75%   | -      |
| Functions  | ≥80%   | -      |
| Lines      | ≥80%   | -      |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục            | Status           |
| ------------------- | ---------------- |
| Test cases reviewed | ⬜ Chưa review   |
| Coverage target OK  | ⬜ Chưa confirm  |
| **APPROVED**        | ⬜ CHƯA APPROVED |

**HUMAN Signature:** ******\_\_\_******  
**Date:** ******\_\_\_******

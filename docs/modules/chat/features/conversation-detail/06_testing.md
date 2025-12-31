# [BƯỚC 6] Testing Documentation - Conversation Detail

> **Feature:** Chi tiết đoạn chat  
> **Status:** ⏳ PENDING IMPLEMENTATION

---

## 🧪 Test Strategy

### Unit Tests

| Component          | Test File                     | Cases |
| ------------------ | ----------------------------- | ----- |
| ConversationDetail | `ConversationDetail.test.tsx` | 6     |
| MessageList        | `MessageList.test.tsx`        | 7     |
| MessageBubble      | `MessageBubble.test.tsx`      | 6     |
| MessageInput       | `MessageInput.test.tsx`       | 6     |
| useMessages        | `useMessages.test.ts`         | 6     |
| useSendMessage     | `useSendMessage.test.ts`      | 5     |

### Test Cases - MessageList

| #   | Case                               | Type | Status |
| --- | ---------------------------------- | ---- | ------ |
| 1   | Renders loading skeleton initially | Unit | ⏳     |
| 2   | Renders messages after load        | Unit | ⏳     |
| 3   | Groups messages by date            | Unit | ⏳     |
| 4   | Infinite scroll loads more         | Unit | ⏳     |
| 5   | Auto scroll on new message         | Unit | ⏳     |
| 6   | Shows typing indicator             | Unit | ⏳     |
| 7   | Handles empty state                | Unit | ⏳     |

### Test Cases - MessageBubble

| #   | Case                                    | Type | Status |
| --- | --------------------------------------- | ---- | ------ |
| 1   | Renders sent message (right aligned)    | Unit | ⏳     |
| 2   | Renders received message (left aligned) | Unit | ⏳     |
| 3   | Shows avatar for group chat             | Unit | ⏳     |
| 4   | Renders image attachment                | Unit | ⏳     |
| 5   | Renders file attachment                 | Unit | ⏳     |
| 6   | Shows read receipts                     | Unit | ⏳     |

### Test Cases - MessageInput

| #   | Case                            | Type | Status |
| --- | ------------------------------- | ---- | ------ |
| 1   | Renders input and send button   | Unit | ⏳     |
| 2   | Send button disabled when empty | Unit | ⏳     |
| 3   | Enter key sends message         | Unit | ⏳     |
| 4   | Shift+Enter creates newline     | Unit | ⏳     |
| 5   | Attachment buttons work         | Unit | ⏳     |
| 6   | Shows sending state             | Unit | ⏳     |

### Test Cases - useMessages Hook

| #   | Case                            | Type | Status |
| --- | ------------------------------- | ---- | ------ |
| 1   | Returns loading state initially | Unit | ⏳     |
| 2   | Returns messages on success     | Unit | ⏳     |
| 3   | Supports infinite scroll        | Unit | ⏳     |
| 4   | Returns error on failure        | Unit | ⏳     |
| 5   | Sends auth token                | Unit | ⏳     |
| 6   | Invalidates on new message      | Unit | ⏳     |

### Test Cases - useSendMessage Hook

| #   | Case                    | Type | Status |
| --- | ----------------------- | ---- | ------ |
| 1   | Returns mutate function | Unit | ⏳     |
| 2   | Optimistic update works | Unit | ⏳     |
| 3   | Rollback on error       | Unit | ⏳     |
| 4   | Sends auth token        | Unit | ⏳     |
| 5   | Handles attachments     | Unit | ⏳     |

---

## 📊 Coverage Target

| Type       | Target | Actual |
| ---------- | ------ | ------ |
| Statements | ≥80%   | -      |
| Branches   | ≥75%   | -      |
| Functions  | ≥80%   | -      |
| Lines      | ≥80%   | -      |

---

## 🧪 Integration Tests (Optional)

| #   | Scenario                    | Status |
| --- | --------------------------- | ------ |
| 1   | User sends text message     | ⏳     |
| 2   | User sends image attachment | ⏳     |
| 3   | Real-time message receive   | ⏳     |
| 4   | Typing indicator flow       | ⏳     |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục            | Status           |
| ------------------- | ---------------- |
| Test cases reviewed | ⬜ Chưa review   |
| Coverage target OK  | ⬜ Chưa confirm  |
| **APPROVED**        | ⬜ CHƯA APPROVED |

**HUMAN Signature:** ******\_\_\_******  
**Date:** ******\_\_\_******

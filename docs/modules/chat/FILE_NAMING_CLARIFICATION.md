# File Naming Clarification - Chat Components

> **Created:** 2026-01-07  
> **Purpose:** Giải thích confusion giữa các file chat components và ngăn AI nhầm lẫn trong tương lai

---

## ❌ Confusion Sources (Nguồn gây nhầm lẫn)

### 1. Multiple Similar Names

Có **3 tên file tương tự** gây confusion:

| File Name               | Status           | Location                                                |
| ----------------------- | ---------------- | ------------------------------------------------------- |
| `ChatMain.tsx`          | ❌ KHÔNG TỒN TẠI | Đã rename thành ChatMainContainer                       |
| `ChatMessagePanel.tsx`  | ❌ DEPRECATED    | `src/features/portal/workspace/` (không dùng nữa)       |
| `ChatMainContainer.tsx` | ✅ **ACTIVE**    | `src/features/portal/components/` ⚠️ **FILE ĐANG DÙNG** |

### 2. Documentation Outdated

Nhiều tài liệu cũ (trước checkpoint conversation-detail) vẫn reference:

- `ChatMain.tsx` (tên cũ)
- `ChatMessagePanel.tsx` (deprecated)

**Root cause:** Khi migrate từ mockup sang API, team đã:

1. Tạo `ChatMainContainer.tsx` mới (component với TanStack Query)
2. Deprecate `ChatMessagePanel.tsx` cũ (mockup-based)
3. Nhưng **không update hết documentation**

---

## ✅ Correct File to Use

### ChatMainContainer.tsx (ACTIVE)

**Path:** `src/features/portal/components/ChatMainContainer.tsx`

**Responsibilities:**

- Fetch messages từ API qua `useMessages` hook
- Handle sending messages qua `useSendMessage` mutation
- Real-time updates qua `useMessageRealtime` hook
- File upload integration
- Typing indicator
- Infinite scroll

**Used by:**

- `src/features/portal/workspace/WorkspaceView.tsx`

**Documentation:**

- ✅ `docs/modules/chat/features/conversation-details-phase-1/01_requirements.md` (ĐÚNG)
- ✅ `docs/sessions/session_002_20260105_[chat]_fix-duplicate-api-calls.md`

---

## ❌ Files NOT to Use

### ChatMessagePanel.tsx (DEPRECATED)

**Path:** `src/features/portal/workspace/ChatMessagePanel.tsx`

**Why deprecated:**

- Dùng mockup data (không có API)
- Không support TanStack Query
- Không có file upload
- Code cũ, không maintain

**Last used:** Before conversation-detail feature (Phase 1)

### ChatMain.tsx (DOESN'T EXIST)

**Why confusion:**

- Tên ban đầu khi thiết kế
- Đã được rename thành `ChatMainContainer.tsx`
- Nhiều docs cũ vẫn reference tên này

---

## 📋 AI Checklist - How to Avoid Confusion

Khi AI làm việc với chat components:

### ✅ DO:

1. **Luôn search actual files** trước khi modify:

   ```bash
   file_search: **/ChatMain*.tsx
   grep_search: "ChatMainContainer"
   ```

2. **Verify file location**:

   - ✅ `src/features/portal/components/ChatMainContainer.tsx`
   - ❌ `src/features/portal/workspace/ChatMain.tsx`

3. **Check deprecation notes** trong docs:

   ```markdown
   | Component         | Status        | Location |
   | ----------------- | ------------- | -------- |
   | ChatMainContainer | ✅ ACTIVE     | ...      |
   | ChatMessagePanel  | ❌ DEPRECATED | ...      |
   ```

4. **Update outdated references** khi phát hiện:
   - Fix ngay trong document đang làm việc
   - Thêm note vào file này

### ❌ DON'T:

1. **Assume file tồn tại** dựa trên tên trong docs cũ
2. **Modify ChatMessagePanel.tsx** (deprecated)
3. **Reference ChatMain.tsx** trong docs mới (tên cũ)
4. **Skip verification** - luôn check actual codebase

---

## 🔄 Migration History

### Timeline:

1. **Phase 0 - Mockup (Before 2025-12):**

   - `ChatMessagePanel.tsx` - Main component (mockup data)

2. **Phase 1 - API Integration (2025-12-26):**

   - ✅ Created `ChatMainContainer.tsx` - New API-based component
   - ❌ Deprecated `ChatMessagePanel.tsx`
   - ⚠️ Many docs still reference old names

3. **Phase 2 - Confusion Fixed (2026-01-07):**
   - ✅ Updated all documentation in `upgrade-conversation-ux/`
   - ✅ Created this clarification document
   - ✅ Added warnings in implementation plans

---

## 📝 Documentation Updates Needed

Khi tạo feature mới liên quan chat:

### Templates to Update:

1. **Feature Requirements:**

   ```markdown
   **Files to Modify:**

   - `src/features/portal/components/ChatMainContainer.tsx` ✅ CORRECT
     ~~- `src/features/portal/workspace/ChatMain.tsx`~~ ❌ WRONG
   ```

2. **Implementation Plans:**

   ```markdown
   > ⚠️ **IMPORTANT:** Use ChatMainContainer.tsx (NOT ChatMain.tsx or ChatMessagePanel.tsx)
   ```

3. **Test Plans:**
   ```markdown
   | Component         | File                                                 | Status    |
   | ----------------- | ---------------------------------------------------- | --------- |
   | ChatMainContainer | src/features/portal/components/ChatMainContainer.tsx | ✅ ACTIVE |
   ```

---

## 🎯 Quick Reference

### "Tôi cần integrate chat input component, dùng file nào?"

✅ **ANSWER:** `src/features/portal/components/ChatMainContainer.tsx`

### "Tài liệu nói ChatMain.tsx, file ở đâu?"

✅ **ANSWER:** Tên cũ. File thực tế là `ChatMainContainer.tsx` trong `src/features/portal/components/`

### "ChatMessagePanel.tsx có còn dùng không?"

❌ **ANSWER:** DEPRECATED. Không modify file này. Dùng `ChatMainContainer.tsx`

---

## 📌 Related Files

### Conversation List:

| File                          | Status        | Location                         |
| ----------------------------- | ------------- | -------------------------------- |
| `ConversationListSidebar.tsx` | ✅ ACTIVE     | `src/features/portal/workspace/` |
| ~~ConversationList.tsx~~      | ❌ NOT EXISTS | (Không tồn tại trong codebase)   |

**Note:** Implementation plan references `ConversationList.tsx` nhưng thực tế là `ConversationListSidebar.tsx`

---

**Last Updated:** 2026-01-07  
**Updated By:** AI (after confusion detection)  
**Next Review:** When adding new chat features

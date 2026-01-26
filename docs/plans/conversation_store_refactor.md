# Conversation Store Refactor - Implementation Plan

**Date:** 2025-01-22  
**Type:** Refactoring - Store Migration  
**Status:** ⏳ PENDING APPROVAL

---

## 📋 OVERVIEW

Refactor conversation selection từ local state sang Zustand store để:

- Loại bỏ prop drilling
- Single source of truth cho conversation data
- Dễ dàng access từ bất kỳ component nào
- Persist conversation state properly

---

## 🎯 OBJECTIVES

1. Tạo `conversationStore.ts` mới với full conversation state
2. Migrate `WorkspaceView` từ local state sang store
3. Update `ConversationDetailPanel` lấy data từ store thay vì props
4. Update `ConversationListSidebar` để set store khi chọn conversation
5. Maintain backward compatibility với localStorage

---

## 📐 ARCHITECTURE DESIGN

### Store Structure

```typescript
// src/stores/conversationStore.ts

export type ChatTarget = {
  type: "group" | "dm";
  id: string;
  name?: string;
  category?: string; // Category name
  categoryId?: string; // Category ID
  memberCount?: number;
};

interface ConversationState {
  // Selected conversation
  selectedConversation: ChatTarget | null;

  // Actions
  setSelectedConversation: (conversation: ChatTarget) => void;
  clearSelectedConversation: () => void;

  // Selectors
  getConversationId: () => string | null;
  getConversationName: () => string | null;
  getConversationCategory: () => string | null;
  getConversationCategoryId: () => string | null;
}
```

### Data Flow

```
ConversationListSidebar
  ↓ (onClick)
conversationStore.setSelectedConversation({...})
  ↓
localStorage (auto-sync)
  ↓
ConversationDetailPanel (read from store)
  ↓
Display: categoryName, groupName, etc.
```

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Create Conversation Store

**File:** `src/stores/conversationStore.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  saveSelectedConversation,
  saveSelectedCategory,
} from "@/utils/storage";

export type ChatTarget = {
  type: "group" | "dm";
  id: string;
  name?: string;
  category?: string;
  categoryId?: string;
  memberCount?: number;
};

interface ConversationState {
  selectedConversation: ChatTarget | null;

  setSelectedConversation: (conversation: ChatTarget) => void;
  clearSelectedConversation: () => void;

  // Convenience getters
  getConversationId: () => string | null;
  getConversationName: () => string | null;
  getConversationCategory: () => string | null;
  getConversationCategoryId: () => string | null;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      selectedConversation: null,

      setSelectedConversation: (conversation) => {
        set({ selectedConversation: conversation });

        // Sync to localStorage
        saveSelectedConversation(conversation.id);
        if (conversation.categoryId) {
          saveSelectedCategory(conversation.categoryId);
        }
      },

      clearSelectedConversation: () => {
        set({ selectedConversation: null });
      },

      // Getters
      getConversationId: () => get().selectedConversation?.id ?? null,
      getConversationName: () => get().selectedConversation?.name ?? null,
      getConversationCategory: () =>
        get().selectedConversation?.category ?? null,
      getConversationCategoryId: () =>
        get().selectedConversation?.categoryId ?? null,
    }),
    {
      name: "conversation-storage",
      partialize: (state) => ({
        selectedConversation: state.selectedConversation,
      }),
    },
  ),
);
```

### Step 2: Update stores/index.ts

**File:** `src/stores/index.ts`

Add export:

```typescript
export { useConversationStore } from "./conversationStore";
export type { ChatTarget } from "./conversationStore";
```

### Step 3: Update WorkspaceView

**File:** `src/features/portal/workspace/WorkspaceView.tsx`

Changes:

1. Import store: `import { useConversationStore } from '@/stores';`
2. Remove local state: `const [selectedChat, setSelectedChat] = React.useState<ChatTarget | null>(null);`
3. Use store: `const { selectedConversation, setSelectedConversation } = useConversationStore();`
4. Replace all `selectedChat` → `selectedConversation`
5. Replace all `setSelectedChat` → `setSelectedConversation`

### Step 4: Update ConversationListSidebar

**File:** `src/features/portal/workspace/ConversationListSidebar.tsx`

Changes:

1. Import store
2. Update `handleGroupSelect` to use store directly
3. Update `handleDirectSelect` to use store directly

### Step 5: Update ConversationDetailPanel

**File:** `src/features/portal/workspace/ConversationDetailPanel.tsx`

Changes:

1. Import store
2. Read `categoryName` from store instead of props:
   ```typescript
   const categoryName = useConversationStore((s) =>
     s.getConversationCategory(),
   );
   const groupName = useConversationStore((s) => s.getConversationName());
   ```
3. Keep props as optional fallback for backward compatibility

### Step 6: Update authStore logout

**File:** `src/stores/authStore.ts`

Add clear conversation on logout:

```typescript
import { useConversationStore } from "./conversationStore";

// In logout action:
useConversationStore.getState().clearSelectedConversation();
```

---

## 📋 IMPACT SUMMARY

### Files sẽ tạo mới:

- `src/stores/conversationStore.ts` - New Zustand store for conversation state
- `src/stores/__tests__/conversationStore.test.ts` - Unit tests for store

### Files sẽ sửa đổi:

1. **`src/stores/index.ts`**
   - Thêm export `useConversationStore` và `ChatTarget` type

2. **`src/features/portal/workspace/WorkspaceView.tsx`**
   - Remove local state `selectedChat`
   - Import và sử dụng `useConversationStore`
   - Replace `selectedChat` → `selectedConversation` (15+ occurrences)
   - Replace `setSelectedChat` → `setSelectedConversation` (5 occurrences)
   - Simplify handlers (không cần manage local state nữa)

3. **`src/features/portal/workspace/ConversationListSidebar.tsx`**
   - Import `useConversationStore`
   - Update `handleGroupSelect` để set store
   - Update `handleDirectSelect` để set store

4. **`src/features/portal/workspace/ConversationDetailPanel.tsx`**
   - Import `useConversationStore`
   - Read `categoryName` từ store với fallback to props
   - Read `groupName` từ store với fallback to props
   - Make props optional (`categoryName?`, `groupName?`)

5. **`src/stores/authStore.ts`**
   - Thêm `clearSelectedConversation()` trong logout action

### Files sẽ xoá:

- (Không có)

### Dependencies sẽ thêm:

- (Không có - dùng zustand đã có sẵn)

### Breaking Changes:

- **NONE** - Backward compatible vì vẫn giữ props làm fallback

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                                                                                       | Lựa chọn                                     | HUMAN Decision               |
| --- | -------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------- |
| 1   | Có giữ props `categoryName`, `groupName` trong `ConversationDetailPanel` làm fallback không? | Yes (backward compatible) / No (clean break) | ⬜ **No (clean break)**      |
| 2   | Có cần migrate `WorkspaceView` props interface để remove `selectedChat` related props?       | Yes / No (keep for now)                      | ⬜ **Yes**                   |
| 3   | Store có cần lưu thêm `workTypeId` hiện tại không?                                           | Yes (include) / No (separate concern)        | ⬜ **No (separate concern)** |
| 4   | Có cần thêm middleware để log conversation changes?                                          | Yes (debugging) / No (keep simple)           | ⬜ **No (keep simple)**      |

---

## 🧪 TESTING STRATEGY

### Unit Tests

**File:** `src/stores/__tests__/conversationStore.test.ts`

Test cases:

1. Initial state should be null
2. `setSelectedConversation` updates state correctly
3. `setSelectedConversation` syncs to localStorage
4. `clearSelectedConversation` resets state
5. Getters return correct values
6. Persist middleware works (reload state)

### Integration Tests

**Manual testing checklist:**

- [ ] Chọn conversation trong sidebar → state update
- [ ] Refresh page → conversation vẫn được giữ
- [ ] Switch conversations → state update đúng
- [ ] Logout → conversation state cleared
- [ ] ConversationDetailPanel hiển thị đúng categoryName
- [ ] ConversationDetailPanel hiển thị đúng groupName

---

## 🚨 RISKS & MITIGATIONS

| Risk                         | Impact | Mitigation                                 |
| ---------------------------- | ------ | ------------------------------------------ |
| Breaking existing components | HIGH   | Giữ props làm fallback, test kỹ            |
| localStorage sync issues     | MEDIUM | Validate before save, error handling       |
| Performance (re-renders)     | LOW    | Use selectors, monitor with React DevTools |
| Type mismatches              | LOW    | Strict TypeScript, comprehensive tests     |

---

## 📊 ROLLBACK PLAN

Nếu có vấn đề sau khi deploy:

1. **Revert commits:**

   ```bash
   git revert <commit-hash>
   ```

2. **Files to rollback:**
   - `conversationStore.ts` (delete)
   - `WorkspaceView.tsx` (restore local state)
   - `ConversationDetailPanel.tsx` (restore prop usage)
   - `ConversationListSidebar.tsx` (restore direct prop callbacks)

3. **localStorage cleanup:**
   ```javascript
   localStorage.removeItem("conversation-storage");
   ```

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status           |
| ------------------------- | ---------------- |
| Đã review Impact Summary  | ⬜ Chưa review   |
| Đã điền Pending Decisions | ⬜ Chưa điền     |
| **APPROVED để thực thi**  | ⬜ CHƯA APPROVED |

**HUMAN Signature:** [Chờ duyệt]  
**Date:** \***\*\_\_\_\*\***

---

## 📝 NOTES

- Store sẽ tự động sync với localStorage qua persist middleware
- Backward compatible - không breaking changes
- Có thể dần dần remove props sau khi verify store hoạt động tốt
- Consider thêm DevTools middleware để debug easier

---

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

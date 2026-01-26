# [BƯỚC 4] Implementation Plan - Conversation Enhancements

**Feature:** Conversation Enhancements  
**Date:** 2026-01-20  
**Status:** ✅ APPROVED

---

## 🎯 Implementation Strategy

**Key Principle:** Tái sử dụng infrastructure hiện có, chỉ thay đổi tối thiểu để đạt requirements.

### Existing Infrastructure (Reuse)

✅ **Already Implemented:**

- `useConversationMembers` hook - **ĐÃ CÓ** (src/hooks/queries/useConversationMembers.ts)
- `getConversationMembers` API - **ĐÃ CÓ** (src/api/conversations.api.ts)
- LocalStorage utilities - **ĐÃ CÓ PARTIAL** (src/utils/storage.ts)
  - `selected-conversation-id` key exists
  - Need to add `selected-category-id` functions

### What Needs to Change

🆕 **New Implementations:**

1. LocalStorage: Add category persistence functions
2. ChatMainContainer: Add useConversationMembers + pass to ChatHeader
3. ChatMainContainer: Add category/conversation persistence logic
4. ConversationDetailPanel: Receive category name prop

---

## 📝 Detailed Changes

### Change 1: LocalStorage - Add Category Persistence

**File:** `src/utils/storage.ts`

**Current State:**

- Has `saveSelectedConversation()` and `getSelectedConversation()`
- Uses key: `selected-conversation-id`

**Changes:**

```typescript
// Add new constant
const SELECTED_CATEGORY_KEY = "selected-category-id";

/**
 * Save selected category ID
 */
export function saveSelectedCategory(categoryId: string): void {
  try {
    localStorage.setItem(SELECTED_CATEGORY_KEY, categoryId);
  } catch (error) {
    console.error("Failed to save selected category:", error);
  }
}

/**
 * Get selected category ID
 */
export function getSelectedCategory(): string | null {
  try {
    return localStorage.getItem(SELECTED_CATEGORY_KEY);
  } catch (error) {
    console.error("Failed to get selected category:", error);
    return null;
  }
}

/**
 * Clear selected category
 */
export function clearSelectedCategory(): void {
  try {
    localStorage.removeItem(SELECTED_CATEGORY_KEY);
  } catch (error) {
    console.error("Failed to clear selected category:", error);
  }
}
```

**Impact:** Low - Adding new functions, không ảnh hưởng existing code

---

### Change 2: ChatMainContainer - Add Members Count

**File:** `src/features/portal/components/chat/ChatMainContainer.tsx`

**Current State:**

- Manages conversation display
- Nhận `memberCount` prop từ component cha (WorkspaceView)
- Pass-through `memberCount` to ChatHeader
- **Vấn đề:** ChatMainContainer không tự fetch members, phụ thuộc vào component cha provide
- Khi dùng ở context khác (không phải WorkspaceView), `memberCount` có thể undefined

**Changes:**

**Step 1: Add useConversationMembers hook**

```typescript
import { useConversationMembers } from "@/hooks/queries/useConversationMembers";

// Inside component, sau khi có activeConversationId
const { data: membersData } = useConversationMembers({
  conversationId: activeConversationId || "",
  enabled: !!activeConversationId,
});

// Compute member count
const memberCount = membersData?.length ?? 0;
```

**Step 2: Pass to ChatHeader**

```typescript
<ChatHeader
  // ...existing props
  memberCount={memberCount}  // Update this prop
/>
```

**Impact:** Low - Chỉ thêm hook và pass prop, không đổi logic khác

**Note:** ⚠️ Hook này ĐÃ TỒN TẠI và đang được dùng ở WorkspaceView.tsx, chỉ cần reuse!

---

### Change 3: ChatMainContainer - Add Persistence Logic

**File:** `src/features/portal/components/chat/ChatMainContainer.tsx`

**Current State:**

- activeCategory và activeConversation không persist
- Mỗi lần reload reset về default

**Changes:**

**Step 1: Import storage utilities**

```typescript
import {
  saveSelectedCategory,
  getSelectedCategory,
  saveSelectedConversation,
  getSelectedConversation,
} from "@/utils/storage";
```

**Step 2: Restore on mount**

```typescript
useEffect(() => {
  // Restore persisted state on mount
  const persistedCategoryId = getSelectedCategory();
  const persistedConversationId = getSelectedConversation();

  if (persistedCategoryId && persistedConversationId) {
    // Validate persisted IDs still exist
    const categoryExists = categories?.some(cat => cat.id === persistedCategoryId);
    const conversationExists = /* check if conversation exists in category */;

    if (categoryExists && conversationExists) {
      setActiveCategory(persistedCategoryId);
      setActiveConversation(persistedConversationId);
      return;
    }
  }

  // Fallback: Set first available category + conversation
  if (categories && categories.length > 0) {
    const firstCategory = categories[0];
    const firstConversation = firstCategory.conversations?.[0];

    if (firstCategory.id) {
      setActiveCategory(firstCategory.id);
      saveSelectedCategory(firstCategory.id);
    }

    if (firstConversation?.conversationId) {
      setActiveConversation(firstConversation.conversationId);
      saveSelectedConversation(firstConversation.conversationId);
    }
  }
}, [categories]); // Run once when categories loaded
```

**Step 3: Save on change**

```typescript
useEffect(() => {
  if (activeCategory) {
    saveSelectedCategory(activeCategory);
  }
}, [activeCategory]);

useEffect(() => {
  if (activeConversation) {
    saveSelectedConversation(activeConversation);
  }
}, [activeConversation]);
```

**Impact:** Medium - Logic phức tạp hơn, nhưng isolated trong useEffect

**Testing Required:** Verify không conflict với existing conversation switching logic

---

### Change 4: ConversationDetailPanel - Display Category Name

**File:** `src/features/portal/workspace/ConversationDetailPanel.tsx`

**Current State:**

- Có thể không hiển thị category name, hoặc hiển thị sai

**Changes:**

**Step 1: Update props interface**

```typescript
interface ConversationDetailPanelProps {
  // ...existing props
  categoryName?: string; // 🆕 ADD
  conversationName?: string; // 🆕 ADD (nếu chưa có)
}
```

**Step 2: Display in UI**

```typescript
// In component render, update display section
<div className="detail-section">
  <div className="detail-row">
    <span className="label">Nhóm:</span>
    <span className="value">{categoryName || 'N/A'}</span>
  </div>
  <div className="detail-row">
    <span className="label">Loại việc:</span>
    <span className="value">{conversationName || 'N/A'}</span>
  </div>
</div>
```

**Step 3: Pass props from ChatMainContainer**

```typescript
<ConversationDetailPanel
  // ...existing props
  categoryName={activeCategoryName}
  conversationName={activeConversationName}
/>
```

**Impact:** Low - Chỉ nhận props và display, không thay đổi logic

**Note:** Decision #5: "Không cần prefix chỉ cần tên của category" → Display name trực tiếp, không có "Nhóm:" prefix? Cần clarify.

---

## 🔄 Implementation Order

### Phase 1: LocalStorage (30 mins)

1. ✅ Add category persistence functions to storage.ts
2. ✅ Write unit tests for storage functions

### Phase 2: Members Count Integration (45 mins)

1. ✅ Add useConversationMembers to ChatMainContainer
2. ✅ Pass memberCount to ChatHeader
3. ✅ Verify ChatHeader displays correctly
4. ✅ Write integration tests

### Phase 3: Persistence Logic (1.5 hours)

1. ✅ Add restore logic on mount
2. ✅ Add save logic on change
3. ✅ Add fallback logic for deleted conversations
4. ✅ Test reload scenarios
5. ✅ Write E2E tests for persistence

### Phase 4: Detail Panel (30 mins)

1. ✅ Update ConversationDetailPanel props
2. ✅ Pass props from parent
3. ✅ Verify display
4. ✅ Write component tests

**Total Estimate:** ~3 hours development + 1 hour testing = 4 hours

---

## 📋 Files to Modify

| File                                         | Type   | Changes                                  | Risk   |
| -------------------------------------------- | ------ | ---------------------------------------- | ------ |
| src/utils/storage.ts                         | Modify | Add category persistence (3 functions)   | Low    |
| src/features/.../ChatMainContainer.tsx       | Modify | Add members hook + persistence logic     | Medium |
| src/features/.../ChatHeader.tsx              | Modify | NO CHANGE (already has memberCount prop) | None   |
| src/features/.../ConversationDetailPanel.tsx | Modify | Add props + display                      | Low    |

**Files to Create:**

- src/utils/**tests**/storage.test.ts (unit tests)

**Files NOT Modified:**

- src/hooks/queries/useConversationMembers.ts - **REUSE AS-IS** ✅
- src/api/conversations.api.ts - **REUSE AS-IS** ✅

---

## ⚠️ Risk Assessment

### Low Risk Changes

- ✅ LocalStorage functions (new code, isolated)
- ✅ ConversationDetailPanel props (additive)
- ✅ ChatHeader (no change)

### Medium Risk Changes

- ⚠️ ChatMainContainer persistence logic
  - **Risk:** Có thể conflict với existing conversation switching
  - **Mitigation:**
    - Use separate useEffect hooks
    - Test thoroughly with existing flows
    - Add feature flag if needed

### Testing Strategy

1. **Unit Tests:** storage.ts functions
2. **Integration Tests:** Members count display
3. **E2E Tests:** Full persistence flow (reload scenarios)
4. **Manual Tests:** User workflows with existing features

---

## 🧪 Test Coverage Matrix

| Feature                 | Unit | Integration | E2E | Manual |
| ----------------------- | ---- | ----------- | --- | ------ |
| LocalStorage - Save     | ✅   | ✅          | ✅  | ✅     |
| LocalStorage - Restore  | ✅   | ✅          | ✅  | ✅     |
| LocalStorage - Fallback | ✅   | -           | ✅  | ✅     |
| Members Count - Display | -    | ✅          | ✅  | ✅     |
| Members Count - Update  | -    | ✅          | ✅  | ✅     |
| Detail Panel - Display  | ✅   | ✅          | -   | ✅     |

---

## 🔍 Edge Cases

### Edge Case 1: Persisted Conversation Deleted

**Scenario:** User had conversation A selected, then conversation A was deleted

**Handling:**

```typescript
// In restore logic
const conversationExists = categories
  ?.find((cat) => cat.id === persistedCategoryId)
  ?.conversations?.some(
    (conv) => conv.conversationId === persistedConversationId,
  );

if (!conversationExists) {
  // Fallback to first available
  const firstConversation = categories?.[0]?.conversations?.[0];
  // ...
}
```

### Edge Case 2: No Categories Available

**Scenario:** User has no categories (new account?)

**Handling:**

```typescript
if (!categories || categories.length === 0) {
  // Don't restore, don't save, show empty state
  return;
}
```

### Edge Case 3: LocalStorage Full/Disabled

**Scenario:** LocalStorage quota exceeded or disabled

**Handling:**

- Already handled in storage.ts with try-catch
- Silent fail, app continues working without persistence

### Edge Case 4: Members API Fails

**Scenario:** API returns error when fetching members

**Handling:**

```typescript
// useConversationMembers already handles this
const { data, isError } = useConversationMembers(...);

// In ChatHeader
const memberCount = data?.length ?? 0; // Fallback to 0
```

---

## 📊 Performance Considerations

### API Calls

- **Members API:**
  - Cache: 5 minutes (per decision #7)
  - Refetch: On conversation switch (per decision #8)
  - Impact: 1 API call per conversation switch (acceptable)

### LocalStorage

- Read: 2 operations on mount (category + conversation)
- Write: 2 operations per switch (category + conversation)
- Impact: Negligible (synchronous, <1ms)

### Re-renders

- ChatHeader: Will re-render when memberCount changes
- Detail Panel: Will re-render when category/conversation changes
- Impact: Minimal (React optimizations apply)

---

## 🚀 Rollout Plan

### Step 1: Development

1. Create feature branch: `feature/conversation-enhancements`
2. Implement changes in order (Phase 1 → Phase 4)
3. Write tests alongside implementation

### Step 2: Testing

1. Run unit tests: `npm run test`
2. Run E2E tests: `npm run test:e2e`
3. Manual testing: Follow test scenarios in 06_testing.md

### Step 3: Code Review

1. Self-review checklist
2. Create PR
3. Request review from team

### Step 4: Deployment

1. Merge to main
2. Deploy to staging
3. Verify on staging
4. Deploy to production
5. Monitor for errors

---

## 📋 IMPACT SUMMARY (Updated)

### Files sẽ tạo mới:

- `src/utils/__tests__/storage.test.ts` - Unit tests cho storage functions

### Files sẽ sửa đổi:

- `src/utils/storage.ts`
  - Thêm 3 functions: saveSelectedCategory, getSelectedCategory, clearSelectedCategory
  - ~30 lines of code

- `src/features/portal/components/chat/ChatMainContainer.tsx`
  - Thêm useConversationMembers hook (1 hook call)
  - Thêm 3 useEffect cho persistence logic (~50 lines)
  - Pass memberCount prop to ChatHeader (1 line)
  - Pass categoryName, conversationName to ConversationDetailPanel (2 lines)

- `src/features/portal/workspace/ConversationDetailPanel.tsx`
  - Update props interface (+2 props)
  - Update UI display (~10 lines)

### Files KHÔNG thay đổi:

- ✅ `src/features/portal/components/chat/ChatHeader.tsx` - Already has memberCount prop
- ✅ `src/hooks/queries/useConversationMembers.ts` - Reuse existing
- ✅ `src/api/conversations.api.ts` - Reuse existing

### Code Changes Summary:

- **New:** ~100 lines (storage functions + tests)
- **Modified:** ~60 lines (ChatMainContainer + ConversationDetailPanel)
- **Total:** ~160 lines

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                          | Status       |
| --------------------------------- | ------------ |
| Đã review implementation strategy | ✅ Đã review |
| Đã review risk assessment         | ✅ Đã review |
| Đã review edge cases              | ✅ Đã review |
| **APPROVED để code**              | ✅ APPROVED  |

**HUMAN Actions Required:**

1. Review implementation plan ✅ DONE
2. Clarify Decision #5: "Không cần prefix" nghĩa là không show "Nhóm:" và "Loại việc:" labels? ✅ CONFIRMED - Không show labels
3. Approve plan để proceed to coding ✅ DONE

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-21

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code nếu mục "APPROVED để code" = ⬜ CHƯA APPROVED**

---

**Created:** 2026-01-20  
**Status:** ⏳ PENDING APPROVAL  
**Next Step:** HUMAN approve → AI create 06_testing.md → AI implement code

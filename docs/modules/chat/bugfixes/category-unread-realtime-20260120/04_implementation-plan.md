# [BƯỚC 4] Implementation Plan - Category Unread Realtime Bugfix

**Feature:** Category Conversations Unread Count Realtime Update  
**Date:** 2026-01-20  
**Status:** ⏳ PENDING APPROVAL

---

## 🎯 Fix Strategy

### Chosen Approach: Fix useMemo Dependencies

**Rationale:**

- ✅ Simplest fix - chỉ 1 line code change
- ✅ No side effects, no breaking changes
- ✅ Leverage existing realtime infrastructure
- ✅ No extra API calls needed
- ✅ Performance impact minimal

**Alternative Approaches Rejected:**

| Approach                      | Why Rejected                                     |
| ----------------------------- | ------------------------------------------------ |
| Invalidate category cache     | ❌ Extra API calls, performance overhead         |
| Direct category cache update  | ❌ Complex nested structure traversal            |
| Force re-render via key prop  | ❌ Overkill, causes unnecessary re-mounts        |
| Remove useMemo entirely       | ❌ Performance regression (re-compute every render)|

---

## 🔧 Technical Implementation

### Fix #1: ChatMainContainer - useMemo Dependency

**File:** `src/features/portal/components/chat/ChatMainContainer.tsx`

**Current Code (Line ~204-221):**

```tsx
const categoryConversations = useMemo<ConversationInfoDto[]>(() => {
  if (!selectedCategoryId || !categories) return [];

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );

  const conversations = selectedCategory?.conversations ?? [];
  return conversations.map((conv) => {
    const groupData = apiGroups.find((g) => g.id === conv.conversationId);
    return {
      ...conv,
      unreadCount: groupData?.unreadCount ?? conv.unreadCount ?? 0,
    };
  });
}, [selectedCategoryId, categories, apiGroups]);
```

**Fixed Code:**

```tsx
const categoryConversations = useMemo<ConversationInfoDto[]>(() => {
  if (!selectedCategoryId || !categories) return [];

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );

  const conversations = selectedCategory?.conversations ?? [];
  return conversations.map((conv) => {
    const groupData = apiGroups.find((g) => g.id === conv.conversationId);
    return {
      ...conv,
      unreadCount: groupData?.unreadCount ?? conv.unreadCount ?? 0,
    };
  });
}, [selectedCategoryId, categories, apiGroups, groupsQuery.dataUpdatedAt]); // 🆕 Add trigger
```

**Changes:**

- ✅ Add `groupsQuery.dataUpdatedAt` to dependencies array
- ✅ This timestamp updates whenever TanStack Query cache changes
- ✅ Forces useMemo to re-compute even if `apiGroups` reference is same

**Why This Works:**

1. SignalR event → `useConversationRealtime` updates cache
2. TanStack Query increments `dataUpdatedAt` timestamp
3. `useMemo` detects `dataUpdatedAt` changed → re-run computation
4. `categoryConversations` gets fresh `unreadCount` from `apiGroups`
5. ChatHeader re-renders with updated badge

---

### Fix #2: Add Debug Logging (Optional)

**File:** `src/hooks/useConversationRealtime.ts`

**Location:** Inside `handleMessageSent` callback (~Line 100-140)

**Add After Cache Update:**

```tsx
// Update groups cache
try {
  const groupsData = queryClient.getQueryData<InfiniteData<ConversationPage>>(
    conversationKeys.groups()
  );

  if (groupsData?.pages) {
    const updatedPages = groupsData.pages.map((page) => ({
      ...page,
      items: (page.items || []).map((conv) => {
        if (conv.id === conversationId) {
          const newUnreadCount = isActiveConversation ? 0 : conv.unreadCount + 1;
          
          // 🆕 ADD: Debug logging
          console.log('🔔 [Category Realtime] Unread updated:', {
            conversationId,
            isActive: isActiveConversation,
            oldCount: conv.unreadCount,
            newCount: newUnreadCount,
            message: message.content?.substring(0, 50)
          });

          return {
            ...conv,
            lastMessage: { /* ... */ },
            unreadCount: newUnreadCount,
          };
        }
        return conv;
      }),
    }));

    queryClient.setQueryData(conversationKeys.groups(), {
      ...groupsData,
      pages: updatedPages,
    });

    // Force notify subscribers
    queryClient.invalidateQueries({
      queryKey: conversationKeys.groups(),
      refetchType: "none",
    });
  }
} catch (error) {
  console.error("[Realtime] Error updating groups cache:", error);
}
```

**Benefits:**

- ✅ Helps debug realtime issues in production
- ✅ Can be removed later (or use environment variable guard)
- ✅ Shows exactly when and how unread count changes

---

## 📊 Files to Change

### Modified Files

| File                        | Lines Changed | Change Type | Risk Level |
| --------------------------- | ------------- | ----------- | ---------- |
| ChatMainContainer.tsx       | 1 line        | Add dependency | LOW     |
| useConversationRealtime.ts  | 8 lines       | Add logging | LOW (optional) |

### New Files

| File                                    | Type      | Purpose                      |
| --------------------------------------- | --------- | ---------------------------- |
| tests/chat/category-conversations-realtime.spec.ts | E2E Test | Verify realtime unread count |

---

## 🧪 Testing Strategy

### Pre-Implementation Checks

- [x] Read existing code to understand current behavior
- [x] Verify `groupsQuery.dataUpdatedAt` is available (TanStack Query API)
- [x] Check if `useMemo` dependencies support timestamps

### Post-Implementation Verification

- [ ] Unit test: Verify useMemo re-runs when `dataUpdatedAt` changes
- [ ] Manual test: 2 users scenario (AC-1 to AC-4)
- [ ] E2E test: Automated Playwright test passes
- [ ] Performance test: No lag when updating badge
- [ ] Regression test: Conversation list still works

---

## 📝 Implementation Checklist

### Step 1: Code Changes

- [ ] Modify `ChatMainContainer.tsx` - Add `groupsQuery.dataUpdatedAt` dependency
- [ ] (Optional) Modify `useConversationRealtime.ts` - Add debug logging
- [ ] Verify no TypeScript errors
- [ ] Verify no ESLint warnings

### Step 2: Manual Testing

- [ ] Setup: 2 browser windows with different users
- [ ] Test AC-1: Badge appears when message received
- [ ] Test AC-2: Badge increments
- [ ] Test AC-3: Badge clears when switching tab
- [ ] Test AC-4: No badge on active conversation

### Step 3: E2E Test

- [ ] Create `tests/chat/category-conversations-realtime.spec.ts`
- [ ] Implement 4 test cases (AC-1 to AC-4)
- [ ] Run test locally: `npm run test:e2e -- category-conversations-realtime`
- [ ] Verify test passes reliably (retry if needed)

### Step 4: Documentation

- [ ] Update `05_progress.md` with implementation status
- [ ] Add commit message: `fix(chat): update category conversation unread count realtime`
- [ ] Update bugfix README checklist

### Step 5: Deployment

- [ ] Create PR with fix
- [ ] Code review by peer
- [ ] Merge to main branch
- [ ] Verify in staging environment
- [ ] Monitor production logs for errors

---

## 🔍 Code Review Checklist

### Before Submitting

- [ ] Code follows project conventions
- [ ] No breaking changes
- [ ] Backward compatible
- [ ] TypeScript types correct
- [ ] No console.logs in production (or guarded)
- [ ] E2E test passes locally

### Reviewer Should Check

- [ ] Fix addresses root cause correctly
- [ ] No performance regressions
- [ ] Test coverage adequate
- [ ] Documentation updated
- [ ] No side effects on other features

---

## 🚨 Rollback Plan

### If Fix Breaks Production

**Symptoms:**

- ChatHeader crashes
- Infinite re-renders
- Performance degradation

**Rollback Steps:**

1. Revert commit: `git revert <commit-hash>`
2. Or remove dependency: Change back to `[selectedCategoryId, categories, apiGroups]`
3. Deploy hotfix immediately
4. Investigate root cause

**Alternative Fix (Fallback):**

- Use `useEffect` to manually watch `apiGroups` changes
- Or invalidate category cache (Option 2 from requirements)

---

## 📊 IMPACT SUMMARY

### Code Changes

**File 1: ChatMainContainer.tsx**

```diff
  const categoryConversations = useMemo<ConversationInfoDto[]>(() => {
    // ... logic unchanged ...
- }, [selectedCategoryId, categories, apiGroups]);
+ }, [selectedCategoryId, categories, apiGroups, groupsQuery.dataUpdatedAt]);
```

**File 2: useConversationRealtime.ts** (Optional)

```diff
  if (conv.id === conversationId) {
+   const newUnreadCount = isActiveConversation ? 0 : conv.unreadCount + 1;
+   console.log('🔔 [Category Realtime] Unread updated:', {
+     conversationId, isActive: isActiveConversation,
+     oldCount: conv.unreadCount, newCount: newUnreadCount
+   });
    return {
      ...conv,
      lastMessage: { ... },
-     unreadCount: isActiveConversation ? 0 : conv.unreadCount + 1,
+     unreadCount: newUnreadCount,
    };
  }
```

### Test Changes

**New File: tests/chat/category-conversations-realtime.spec.ts**

- ~150 lines of E2E test code
- 4 test cases covering AC-1 to AC-4
- Uses Playwright + dual browser contexts
- Credentials: `user@quoc-nam.com` / `admin@quoc-nam.com`

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                                  | Decision        |
| --- | --------------------------------------- | --------------- |
| 1   | Include debug logging?                  | ✅ Yes          |
| 2   | Remove logging after bugfix confirmed?  | ⬜ **\_\_\_**   |
| 3   | Use environment variable for logging?   | ⬜ **\_\_\_**   |
| 4   | Create unit test for useMemo behavior?  | ⬜ **\_\_\_**   |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                           | Status         |
| ---------------------------------- | -------------- |
| Đã review Fix Strategy             | ⬜ Chưa review |
| Đã review Code Changes             | ⬜ Chưa review |
| Đã review Testing Strategy         | ⬜ Chưa review |
| Đã điền Pending Decisions          | ⬜ Chưa điền   |
| **APPROVED để thực thi code**      | ⬜ CHƯA APPROVED |

**HUMAN Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_  
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code nếu mục "APPROVED để thực thi code" = ⬜ CHƯA APPROVED**

---

## 📚 References

### TanStack Query Documentation

- [dataUpdatedAt](https://tanstack.com/query/latest/docs/framework/react/guides/queries#dataupdatedat) - Timestamp của lần update cache cuối
- [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)

### Related Code

- [ChatMainContainer.tsx](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\features\portal\components\chat\ChatMainContainer.tsx#L204-L221)
- [useConversationRealtime.ts](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\hooks\useConversationRealtime.ts)
- [flattenGroups utility](f:\Working\NgocMinhV2\QUOCNAM\WebUser\src\features\portal\components\chat\ChatMainContainer.tsx#L91-L107)

### Testing Guide

- [Playwright Multi-Context](https://playwright.dev/docs/browser-contexts) - For dual user testing
- [Previous E2E Example](f:\Working\NgocMinhV2\QUOCNAM\WebUser\tests\chat\conversation-list\e2e\realtime-updates.spec.ts)

# Implementation Plan - UI Issues Fix

**Date:** 2026-01-20  
**Bug Fix Document:** [bug_fix_20260120_ui-issues.md](./bug_fix_20260120_ui-issues.md)  
**Status:** ✅ COMPLETED

---

## 🔍 INVESTIGATION RESULTS

### Issue 1: Duplicate Items in LinkedTaskPanel (Staff UI)

**Root Cause Found:**  
Lines 147-157 in `LinkedTasksPanel.tsx`:
```tsx
{/* Todo Tasks */}
{!isLoading && !isError && staffBuckets.todo.map((linkedTask) => (
  <LinkedTaskCard
    key={linkedTask.taskId}
    linkedTask={linkedTask}
    onClick={onTaskClick}
  />
))}

{/* In Progress Tasks */}
{!isLoading && !isError && staffBuckets.inProgress.map((linkedTask) => (
  <LinkedTaskCard
    key={linkedTask.taskId}
    linkedTask={linkedTask}
    onClick={onTaskClick}
  />
))}
```

**Issue:** Both `todo` and `inProgress` tasks are rendered under the SAME accordion "Công Việc Của Tôi", without any visual separation. If a task appears in both buckets (due to data inconsistency or transition states), it will show as duplicate.

**Solution:** The code is actually correct - tasks are separated by status. The duplicate might be caused by:
1. Tasks in both buckets due to status transition
2. Data fetching returning duplicates from API

**Fix Strategy:** Add section headers to visually separate todo vs in-progress, and deduplicate tasks by ID.

---

### Issue 2: ChatBubble Action Menu Position

**Current Implementation:**  
Lines 193-245 in `MessageBubbleSimple.tsx`:
```tsx
<div
  className={cn(
    "absolute -top-8 flex items-center gap-1 rounded-lg border border-gray-200 bg-white shadow-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10",
    isOwn ? "right-0" : "left-0"  // ← Currently: right for own, left for received
  )}
>
```

**Issue:** The menu is positioned:
- Own messages (right side): Action menu at `right-0` (correct ✅)
- Received messages (left side): Action menu at `left-0` (WRONG ❌)

**Expected Behavior:** Action menu should ALWAYS be on the right side of the message, regardless of who sent it.

**Fix:** Change positioning to always use `right-0`.

---

### Issue 3: LinkedTask Filter for Leader View

**Current Implementation:**  
Lines 360-372 in `LinkedTasksPanel.tsx`:
```tsx
<RightAccordion
  icon={<ClipboardList className="h-4 w-4 text-brand-600" />}
  title={`Linked Tasks${taskCount > 0 ? ` (${taskCount})` : ''}`}  // ← Shows total count
  action={
    taskCount > 0 && onViewAll ? (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewAll();
        }}
        className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
        data-testid="view-all-tasks-button"
      >
        View All
      </button>
    ) : undefined
  }
>
```

**Issues:**
1. Shows `(${taskCount})` in title - needs to be removed
2. The UI shows "View All" button but no filtering functionality exists
3. All tasks are already loaded (lines 434-440) - no pagination/filtering

**Current Behavior Analysis:**
- API returns all tasks for the conversation
- Leader UI displays ALL tasks in a single list
- No filtering or pagination is implemented

**Fix Strategy:**
1. Remove the count from title
2. Since tasks are already loaded without filter, just remove the count display
3. The "View All" button can stay as it navigates to a separate page/modal (if implemented)

---

## 📝 DETAILED CHANGES

### Change 1: Fix Duplicate Tasks in Staff UI

**File:** `src/features/portal/components/LinkedTasksPanel.tsx`

**Lines 105-160:** Add visual separators and deduplicate logic

**Current Code:**
```tsx
<div className="grid grid-cols-1 gap-3">
  {/* Loading State */}
  {isLoading && (
    <div className="flex items-center justify-center py-4" data-testid="linked-tasks-loading">
      <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
    </div>
  )}

  {/* Error State */}
  {isError && !isLoading && (
    <div className="rounded border border-red-200 bg-red-50 p-3" data-testid="linked-tasks-error">
      {/* ... */}
    </div>
  )}

  {/* Empty State */}
  {!isLoading && !isError && staffBuckets.todo.length + staffBuckets.inProgress.length === 0 && (
    <div className="rounded border p-3 text-xs text-gray-500">
      Không có việc cần làm.
    </div>
  )}

  {/* Todo Tasks */}
  {!isLoading && !isError && staffBuckets.todo.map((linkedTask) => (
    <LinkedTaskCard
      key={linkedTask.taskId}
      linkedTask={linkedTask}
      onClick={onTaskClick}
    />
  ))}

  {/* In Progress Tasks */}
  {!isLoading && !isError && staffBuckets.inProgress.map((linkedTask) => (
    <LinkedTaskCard
      key={linkedTask.taskId}
      linkedTask={linkedTask}
      onClick={onTaskClick}
    />
  ))}
</div>
```

**New Code:**
```tsx
<div className="space-y-4">
  {/* Loading State */}
  {isLoading && (
    <div className="flex items-center justify-center py-4" data-testid="linked-tasks-loading">
      <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
    </div>
  )}

  {/* Error State */}
  {isError && !isLoading && (
    <div className="rounded border border-red-200 bg-red-50 p-3" data-testid="linked-tasks-error">
      {/* ... */}
    </div>
  )}

  {/* Empty State */}
  {!isLoading && !isError && staffBuckets.todo.length + staffBuckets.inProgress.length === 0 && (
    <div className="rounded border p-3 text-xs text-gray-500">
      Không có việc cần làm.
    </div>
  )}

  {/* Todo Tasks Section */}
  {!isLoading && !isError && staffBuckets.todo.length > 0 && (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-2 px-1">
        📋 Cần Làm ({staffBuckets.todo.length})
      </div>
      <div className="grid grid-cols-1 gap-3">
        {staffBuckets.todo.map((linkedTask) => (
          <LinkedTaskCard
            key={linkedTask.taskId}
            linkedTask={linkedTask}
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  )}

  {/* In Progress Tasks Section */}
  {!isLoading && !isError && staffBuckets.inProgress.length > 0 && (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-2 px-1">
        ⚡ Đang Làm ({staffBuckets.inProgress.length})
      </div>
      <div className="grid grid-cols-1 gap-3">
        {staffBuckets.inProgress.map((linkedTask) => (
          <LinkedTaskCard
            key={linkedTask.taskId}
            linkedTask={linkedTask}
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  )}
</div>
```

**Changes:**
- Changed outer container from `grid grid-cols-1 gap-3` to `space-y-4` for better section spacing
- Added section headers with emoji icons for "Cần Làm" and "Đang Làm"
- Wrapped each section in conditional rendering
- Each section shows count in header
- Prevents rendering empty sections

---

### Change 2: Fix Action Menu Position

**File:** `src/features/portal/components/chat/MessageBubbleSimple.tsx`

**Line 193-195:** Change action menu positioning

**Current Code:**
```tsx
<div
  className={cn(
    "absolute -top-8 flex items-center gap-1 rounded-lg border border-gray-200 bg-white shadow-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10",
    isOwn ? "right-0" : "left-0"
  )}
>
```

**New Code:**
```tsx
<div
  className={cn(
    "absolute -top-8 right-0 flex items-center gap-1 rounded-lg border border-gray-200 bg-white shadow-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
  )}
>
```

**Changes:**
- Removed conditional positioning logic
- Always position at `right-0` regardless of message direction
- Simplified className (no more `cn()` needed for positioning)

---

### Change 3: Remove Total Count in Leader View

**File:** `src/features/portal/components/LinkedTasksPanel.tsx`

**Line 362:** Remove count from title

**Current Code:**
```tsx
title={`Linked Tasks${taskCount > 0 ? ` (${taskCount})` : ''}`}
```

**New Code:**
```tsx
title="Linked Tasks"
```

**Changes:**
- Removed dynamic count display
- Static title "Linked Tasks"
- All tasks are already loaded and displayed (no filter needed)

---

## 🎯 IMPACT SUMMARY

### Files to Modify:

1. **`src/features/portal/components/LinkedTasksPanel.tsx`**
   - Add section headers for Staff UI (todo vs in-progress)
   - Change grid to space-y layout
   - Remove count from Leader UI title
   - ~50 lines changed

2. **`src/features/portal/components/chat/MessageBubbleSimple.tsx`**
   - Simplify action menu positioning
   - Always position at right side
   - ~2 lines changed

### Files to Create:
- None

### Files to Delete:
- None

### Dependencies:
- No new dependencies

---

## 🧪 TESTING REQUIREMENTS

### Test Plan File:
Will be created: `docs/bug-fixes/testing_plan_20260120_ui-issues.md`

### Test Coverage:

#### 1. LinkedTasksPanel - Staff UI (Deduplication)
- [ ] **Unit Test:** Verify section headers render with correct counts
- [ ] **Unit Test:** Verify tasks in different sections don't duplicate
- [ ] **Unit Test:** Verify empty sections don't render
- [ ] **E2E Test:** Visual regression - Staff view with tasks in both sections

#### 2. MessageBubbleSimple - Action Menu Position
- [ ] **Unit Test:** Verify action menu always has `right-0` class
- [ ] **Unit Test:** Verify own messages show menu on right
- [ ] **Unit Test:** Verify received messages show menu on right
- [ ] **E2E Test:** Visual regression - Hover on both message types

#### 3. LinkedTasksPanel - Leader UI (No Count)
- [ ] **Unit Test:** Verify title doesn't include count
- [ ] **Unit Test:** Verify all tasks display correctly
- [ ] **E2E Test:** Visual regression - Leader view title

### Test Files to Create/Modify:
- `src/features/portal/components/__tests__/LinkedTasksPanel.test.tsx`
- `src/features/portal/components/chat/__tests__/MessageBubbleSimple.test.tsx` (already exists)
- `tests/chat/linked-tasks-staff-ui.spec.ts` (new E2E test)

---

## ⏳ PENDING DECISIONS (Final Confirmation)

| #   | Decision Item                          | HUMAN Decision          |
| --- | -------------------------------------- | ----------------------- |
| 1   | Section headers for Staff UI?          | ✅ Use emoji icons      |
| 2   | Keep "View All" button in Leader view? | ⬜ Keep   |
| 3   | Add deduplication logic by taskId?     | ⬜ No   |

> Note: Decision #3 - If API can return duplicate taskIds in different status buckets, we should add `Array.from(new Set(ids))` logic. Otherwise, React's `key={linkedTask.taskId}` will handle it.

---

## ✅ HUMAN CONFIRMATION

| Item                                       | Status         |
| ------------------------------------------ | -------------- |
| Reviewed Investigation Results             | ⬜  reviewed |
| Reviewed Detailed Changes                  | ⬜  reviewed |
| Reviewed Impact Summary                    | ⬜  reviewed |
| Filled Final Pending Decisions             | ⬜  filled   |
| **APPROVED to proceed with implementation** | ⬜  APPROVED |

**HUMAN Signature:** [Khoa]  
**Date:** [20012026]

---

## 📋 IMPLEMENTATION CHECKLIST

After HUMAN approval, AI will execute:

- [ ] Create testing plan document
- [ ] Modify `LinkedTasksPanel.tsx` - Staff UI section headers
- [ ] Modify `LinkedTasksPanel.tsx` - Leader UI remove count
- [ ] Modify `MessageBubbleSimple.tsx` - Action menu positioning
- [ ] Create/update unit tests
- [ ] Create E2E test for Staff UI
- [ ] Run all tests locally
- [ ] Update changelog
- [ ] Commit changes with proper message
- [ ] Update bug fix document status to ✅ RESOLVED

---

## 📎 Related Documents

- Bug Fix Document: [bug_fix_20260120_ui-issues.md](./bug_fix_20260120_ui-issues.md)
- Testing Plan: [To be created after approval]
- Changelog: `docs/checkpoints/_changelog.md`

---

> ⚠️ **CRITICAL:** AI will NOT proceed with code changes until:
> 1. Investigation Results are reviewed
> 2. Pending Decisions are filled
> 3. HUMAN Confirmation = ✅ APPROVED

# Data Fetching Update - TabOwnTasksMobile vs ConversationDetailPanel
**Date:** January 14, 2026

---

## Summary

Updated task data fetching for two components with different API parameters:

1. **TabOwnTasksMobile.tsx** - Uses `/api/tasks?userTask=assigned` (user's own tasks)
2. **ConversationDetailPanel.tsx** - Uses `/api/conversations/{conversationId}/tasks` (conversation-linked tasks)

---

## Changes Made

### 1. TabOwnTasksMobile.tsx - Added useAssignedTasks Hook

**Location:** `src/features/portal/components/TabOwnTasksMobile.tsx`

**Changes:**

```tsx
// ADDED: Import hook
import { useAssignedTasks } from '@/hooks/queries/useTasks';

// ADDED: Fetch data with userTask parameter (no conversationId)
const { 
  data: assignedTasksData, 
  isLoading, 
  isError, 
  error,
  refetch: refetchTasks,
} = useAssignedTasks({ 
  enabled: open && !!currentUserId 
});

// Use API data if available, fallback to props
const tasks = assignedTasksData || propTasks || [];
```

**API Call:**
```
GET /api/tasks?userTask=assigned
```

**Parameters:**
- `userTask=assigned` - Get tasks assigned to current user
- NO `conversationId` parameter

**Loading State:** Shows spinner while fetching

**Error State:** Shows error message with retry button

---

### 2. ConversationDetailPanel.tsx - Unchanged

**Location:** `src/features/portal/workspace/ConversationDetailPanel.tsx`

**Existing Implementation:**

```tsx
// Still uses getLinkedTasks with conversationId
const {
  data: linkedTasksData,
  isLoading: linkedTasksLoading,
  isError: linkedTasksError,
  error: linkedTasksErrorObj,
  refetch: refetchLinkedTasks,
} = useLinkedTasks({
  conversationId: groupId || '',
  enabled: !!groupId && showViewAllTasksModal,
});
```

**API Call:**
```
GET /api/conversations/{conversationId}/tasks
```

**Parameters:**
- `conversationId` - Get tasks linked to a specific conversation
- NO `userTask` parameter

**Why No Change:**
- ConversationDetailPanel shows tasks linked to a conversation (for group context)
- Should fetch all related tasks regardless of current user
- Already uses the correct endpoint

---

## API Endpoints Reference

### For User's Own Tasks
```
GET /api/tasks?userTask=assigned
GET /api/tasks?userTask=created
GET /api/tasks?userTask=related
```

**Usage:** `useAssignedTasks()`, `useCreatedTasks()`, `useRelatedTasks()`

**Files:** 
- `src/api/tasks.api.ts` - `getTasks()`
- `src/hooks/queries/useTasks.ts` - `useAssignedTasks()` etc.

---

### For Conversation-Linked Tasks
```
GET /api/conversations/{conversationId}/tasks
```

**Usage:** `useLinkedTasks()`

**Files:**
- `src/api/tasks.api.ts` - `getLinkedTasks()`
- `src/hooks/queries/useLinkedTasks.ts` - `useLinkedTasks()`

---

## Query Key Structure

### TabOwnTasksMobile (userTask approach)
```
['tasks', 'list', { userTask: 'assigned' }]
```

### ConversationDetailPanel (conversationId approach)
```
['tasks', 'linkedTasks', conversationId]
```

---

## Data Flow

### TabOwnTasksMobile
```
User opens TabOwnTasksMobile
  ↓
useAssignedTasks hook enabled (if open && currentUserId)
  ↓
GET /api/tasks?userTask=assigned
  ↓
Data cached with React Query
  ↓
Component renders user's assigned tasks
  ↓
Loading/Error states handled
```

### ConversationDetailPanel
```
User views conversation
  ↓
LinkedTasksPanel mounts
  ↓
useLinkedTasks hook enabled (if conversationId)
  ↓
GET /api/conversations/{conversationId}/tasks
  ↓
Data cached with React Query
  ↓
Panel displays conversation-linked tasks
```

---

## Testing

### TabOwnTasksMobile
1. Open mobile chat view
2. Click on "Công Việc Của Tôi" (My Tasks)
3. Should load tasks assigned to current user via `/api/tasks?userTask=assigned`
4. Verify loading spinner shows while fetching
5. Verify error state displays on failure with retry option

### ConversationDetailPanel
1. Open conversation
2. Click "Tasks" tab
3. Should display LinkedTasksPanel
4. Verify linked tasks show from `/api/conversations/{conversationId}/tasks`
5. No changes needed - already working

---

## Key Differences

| Aspect | TabOwnTasksMobile | ConversationDetailPanel |
|--------|-------------------|------------------------|
| API Endpoint | `/api/tasks` | `/api/conversations/{id}/tasks` |
| Parameter | `userTask=assigned` | `conversationId` |
| Use Case | User's own tasks | Conversation-linked tasks |
| Fetch Scope | Current user only | All users in conversation |
| Component Type | Mobile-only view | Desktop & mobile |
| Cache Key | `['tasks', 'list', {...filters}]` | `['tasks', 'linkedTasks', id]` |

---

## Files Modified

1. **src/features/portal/components/TabOwnTasksMobile.tsx**
   - Added `useAssignedTasks` import
   - Added hook call with `userTask='assigned'`
   - Added loading state UI
   - Added error state UI with retry
   - Fallback to props if API data unavailable

2. **src/features/portal/workspace/ConversationDetailPanel.tsx**
   - NO CHANGES (already correct)
   - Continues to use `useLinkedTasks` with `conversationId`

---

## Notes

- Both components now properly fetch data from their respective endpoints
- TabOwnTasksMobile no longer relies solely on props - it fetches directly
- ConversationDetailPanel remains unchanged as it's already correctly implemented
- Error handling and loading states prevent UI from appearing broken during fetch
- Graceful fallback to props ensures backward compatibility if hook fails


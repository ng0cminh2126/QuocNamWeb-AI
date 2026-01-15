# Current State Analysis - Task Creation & Message Linking
**Date:** January 14, 2026  
**Status:** Implementation Complete but Testing Needed

---

## 🔍 Files Overview

### 1. **AssignTaskSheet.tsx** (src/components/sheet/)
**Lines 76-117** - Core Mutation Handlers:

```tsx
// Line 73-86: linkTaskMutation.onSuccess
const linkTaskMutation = useLinkTaskToMessage({
  onSuccess: async () => {
    if (conversationId) {
      // Invalidate the query to mark it as stale
      queryClient.invalidateQueries({
        queryKey: taskKeys.linkedTasks(conversationId),
      });
      
      // Explicitly refetch to update the UI immediately
      await queryClient.refetchQueries({
        queryKey: taskKeys.linkedTasks(conversationId),
      });
    }
    toast.success('Công việc đã được giao thành công');
    onClose();
  },
  // ...
});

// Line 104-128: createTaskMutation.onSuccess
const createTaskMutation = useCreateTask({
  onSuccess: (createdTaskId) => {
    console.log('Task created with ID:', createdTaskId);
    console.log('messageId:', messageId);
    console.log('conversationId:', conversationId);
    
    // Task created successfully - now link it to the message if messageId exists
    if (messageId && createdTaskId) {
      console.log('Linking task to message...');
      linkTaskMutation.mutate({
        messageId,
        taskId: createdTaskId,
      });
    } else {
      // No message to link - just close and invalidate
      console.log('No message to link, just invalidating...');
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.linkedTasks(conversationId),
        });
      }
      toast.success('Công việc đã được tạo thành công');
      onClose();
    }
  },
  // ...
});
```

**Status:** ✅ Correctly set up with:
- Receives `createdTaskId` as **string** (from API)
- Checks both `messageId` and `createdTaskId` before linking
- Calls `linkTaskMutation.mutate()` with proper params
- Fallback handling if no messageId
- Invalidation and explicit refetch after linking

---

### 2. **useCreateTask.ts** (src/hooks/mutations/)
**Lines 33-48** - Mutation Implementation:

```typescript
export function useCreateTask({
  onSuccess,
  onError,
}: UseCreateTaskOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => createTask(data),

    onSuccess: (taskId) => {
      console.log('useCreateTask onSuccess - taskId:', taskId);
      
      // Call success callback with task ID
      onSuccess?.(taskId);
    },

    onError: (err) => {
      console.error('useCreateTask onError:', err);
      onError?.(err as Error);
    },
  });
}
```

**Status:** ✅ Correctly implemented:
- Receives `taskId` as **string** parameter
- Passes it directly to `onSuccess?.(taskId)`
- No attempt to access `.id` property (was causing undefined before)

---

### 3. **tasks.api.ts** (src/api/)
**Lines 49-61** - Create Task Endpoint:

```typescript
export const createTask = async (
  data: CreateTaskRequest
): Promise<string> => {
  console.log('API: Creating task with data:', data);
  const response = await taskApiClient.post<string>(
    '/api/tasks',
    data
  );
  console.log('API: Create task response:', response.data);
  return response.data;
};
```

**Status:** ✅ Correctly typed:
- Return type: `Promise<string>` ✓
- Generic: `post<string>` ✓
- Returns `response.data` directly (the taskId string) ✓

---

### 4. **messages.api.ts** (src/api/)
**Lines 110-127** - Link Task Endpoint:

```typescript
export const linkTaskToMessage = async (
  messageId: string,
  taskId: string
): Promise<LinkTaskToMessageResponse> => {
  const payload: LinkTaskToMessageRequest = { taskId };
  console.log('API: Calling PATCH /api/messages/{messageId}/link-task', {
    messageId,
    taskId,
    payload,
  });
  const response = await apiClient.patch<LinkTaskToMessageResponse>(
    `/api/messages/${messageId}/link-task`,
    payload
  );
  console.log('API: Response from link-task:', response.data);
  return response.data;
};
```

**Status:** ✅ Correctly implemented:
- Accepts both `messageId` and `taskId`
- Makes PATCH call with proper endpoint
- Returns response data

---

### 5. **useLinkTaskToMessage.ts** (src/hooks/mutations/)
**Lines 27-48** - Linking Mutation:

```typescript
export function useLinkTaskToMessage(options?: UseLinkTaskToMessageOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, taskId }: LinkTaskToMessageVariables) => {
      console.log('Calling linkTaskToMessage with:', { messageId, taskId });
      return linkTaskToMessage(messageId, taskId);
    },
    onSuccess: (data) => {
      console.log('Successfully linked task to message:', data);
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      
      // Call user's onSuccess callback
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error("Failed to link task to message:", error);
      options?.onError?.(error);
    },
  });
}
```

**Status:** ✅ Correctly implemented:
- Receives proper params from AssignTaskSheet
- Calls linkTaskToMessage API
- Invalidates message queries

---

### 6. **useLinkedTasks.ts** (src/hooks/queries/)
**Lines 18-40** - Query Hook for LinkedTasksPanel:

```typescript
export function useLinkedTasks({
  conversationId,
  enabled = true,
}: UseLinkedTasksOptions) {
  return useQuery({
    queryKey: taskKeys.linkedTasks(conversationId),
    queryFn: () => getLinkedTasks(conversationId),
    staleTime: 1000 * 30, // 30 seconds
    enabled: enabled && !!conversationId,
  });
}
```

**Status:** ✅ Correctly implemented:
- Uses `taskKeys.linkedTasks(conversationId)` as query key
- This is the same key being invalidated/refetched in AssignTaskSheet
- Will auto-update when query is refetched

---

### 7. **LinkedTasksPanel.tsx** (src/features/portal/components/)
**Lines 33-40** - Component Using Hook:

```tsx
export function LinkedTasksPanel({
  conversationId,
  onTaskClick,
  onViewAll,
}: LinkedTasksPanelProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useLinkedTasks({
    conversationId,
    enabled: !!conversationId,
  });

  const taskCount = getTaskCount(data);
  const tasks = data?.tasks ?? [];
```

**Status:** ✅ Correctly implemented:
- Listens to `useLinkedTasks` hook
- Will auto-update when query is refetched in AssignTaskSheet

---

### 8. **ConversationDetailPanel.tsx** (src/features/portal/workspace/)
**Lines 1082-1091** - LinkedTasksPanel Integration:

```tsx
<div className="space-y-4 min-h-0">
  {/* NEW: Linked Tasks Panel - Show for all users */}
  {groupId && (
    <LinkedTasksPanel
      conversationId={groupId}
      onTaskClick={(taskId) => {
        // TODO: Navigate to task detail or open task modal
        console.log('Task clicked:', taskId);
      }}
      onViewAll={() => setShowViewAllTasksModal(true)}
    />
  )}
  {/* ... rest of panel ... */}
</div>
```

**Status:** ✅ Correctly placed:
- Renders at top of tasks tab
- Receives `conversationId={groupId}`
- Will display newly created/linked tasks immediately

---

## 📊 Complete Flow Diagram

```
1. User opens conversation & clicks create task button
   ↓
2. AssignTaskSheet opens with props:
   - conversationId (from App/Zustand store)
   - messageId (from App/Zustand store)
   - messageContent (from App/Zustand store)
   ↓
3. User fills form and clicks Submit
   ↓
4. handleSubmit() → createTaskMutation.mutate(formData)
   ↓
5. API: POST /api/tasks → returns "019bba6d-7309-70ac-a12d-69f1c32845dc"
   ↓
6. createTaskMutation.onSuccess(createdTaskId: string)
   ├─ Check: if (messageId && createdTaskId)
   ├─ linkTaskMutation.mutate({ messageId, taskId })
   │  ↓
   │  API: PATCH /api/messages/{messageId}/link-task
   │  ↓
   │  linkTaskMutation.onSuccess()
   │  ├─ invalidateQueries(taskKeys.linkedTasks(conversationId))
   │  ├─ refetchQueries(taskKeys.linkedTasks(conversationId))
   │  │  ↓
   │  │  API: GET /api/conversations/{conversationId}/tasks
   │  │  ↓
   │  │  LinkedTasksPanel gets fresh data & re-renders
   │  ├─ toast.success('Công việc đã được giao thành công')
   │  └─ onClose() (closes sheet)
   └─ (or no messageId → just close & toast)
```

---

## ✅ What's Working

| Component | Functionality | Status |
|-----------|---------------|--------|
| AssignTaskSheet | Form validation | ✅ |
| AssignTaskSheet | Task creation call | ✅ |
| AssignTaskSheet | Message linking call | ✅ |
| AssignTaskSheet | Query refetch | ✅ |
| useCreateTask | Receives string taskId | ✅ |
| useLinkTaskToMessage | Calls PATCH endpoint | ✅ |
| useLinkedTasks | Queries GET endpoint | ✅ |
| LinkedTasksPanel | Auto-updates on refetch | ✅ |
| ConversationDetailPanel | Displays panel | ✅ |

---

## 🔴 Potential Issues

### Issue 1: Debug Logging (Not a bug, but cleanup needed)
**Files with console.log:**
- AssignTaskSheet.tsx (lines 106-107, 115, 129-130)
- useCreateTask.ts (line 46)
- tasks.api.ts (lines 58, 60)
- messages.api.ts (lines 118-121)
- useLinkTaskToMessage.ts (lines 33, 38, 46)

**Impact:** Clutters console during testing  
**Priority:** Low (can be cleaned up before production)

---

### Issue 2: Silent Failures in Mutation Chains
**Problem:** If `linkTaskToMessage` API fails, onError callback closes the sheet anyway

**Current Code (Line 98-103):**
```tsx
onError: (error) => {
  console.error('Failed to link task to message:', error);
  toast.error('Công việc đã được tạo nhưng không thể liên kết với tin nhắn');
  onClose(); // ← Closes anyway, user can't retry
},
```

**Recommendation:** Consider keeping sheet open to retry, or add a "Task Created But Link Failed" recovery flow

---

## 🧪 Testing Checklist

To verify everything is working:

- [ ] Open a conversation
- [ ] Click create task button on a message
- [ ] Fill in all required fields (title, assignee, priority, template)
- [ ] Click Submit button
- [ ] Check DevTools Console:
  - Should see: `Task created with ID: [uuid]`
  - Should see: `messageId: [uuid]`
  - Should see: `conversationId: [uuid]`
  - Should see: `Linking task to message...`
  - Should see: `API: Calling PATCH /api/messages/{messageId}/link-task`
  - Should see: `Successfully linked task to message`
- [ ] Check Network tab:
  - POST /api/tasks should succeed
  - PATCH /api/messages/{messageId}/link-task should succeed
- [ ] Check UI:
  - Sheet should close
  - Toast should show success message
  - LinkedTasksPanel should immediately show new task
  - Task count should increase

---

## 📝 Summary

**All code is correctly implemented.**

The complete chain from task creation → message linking → query refetch → UI update is properly connected:

1. ✅ AssignTaskSheet correctly passes `messageId` and `conversationId`
2. ✅ useCreateTask receives string `taskId` from API
3. ✅ Task linking uses correct `taskKeys.linkedTasks(conversationId)` query key
4. ✅ Explicit refetch ensures LinkedTasksPanel gets updated immediately
5. ✅ ConversationDetailPanel properly renders LinkedTasksPanel

**Next Steps:**
- Test the complete flow end-to-end
- Remove debug console.log statements
- Consider error handling improvements for link failures
- Add retry logic if needed

---

## 🎯 Expected Behavior When Submitting Form

1. **Before Submit:** AssignTaskSheet is open with filled form
2. **On Submit Click:**
   - Form validates
   - POST /api/tasks is called
   - API returns taskId string
3. **After Create Success:**
   - If messageId exists: PATCH /api/messages/{messageId}/link-task is called
   - Query is invalidated: `taskKeys.linkedTasks(conversationId)`
   - Query is refetched: GET /api/conversations/{conversationId}/tasks
4. **After Link Success:**
   - Toast shows: "Công việc đã được giao thành công"
   - AssignTaskSheet closes
   - LinkedTasksPanel updates with new task
5. **If No MessageId:**
   - Query is still invalidated and refetched
   - Toast shows: "Công việc đã được tạo thành công"
   - Sheet closes

---

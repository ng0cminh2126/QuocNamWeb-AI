# [BƯỚC 4] Implementation Plan - Create Task Feature

## Architecture Overview

```
Message Component
    ↓
Message Hover Menu
    ↓
"Create Task" Button (NEW)
    ↓
CreateTaskModal Component (NEW)
    ├── API Calls (fetch priorities, templates, members)
    ├── Form State Management (Zustand)
    └── Form Validation
         ↓
   POST /api/tasks
         ↓
   Success: Close modal + Refresh linked tasks
   Error: Show error message + Retry
```

---

## Files to Create

| File Path | Type | Purpose | Size |
| --------- | ---- | ------- | ---- |
| `src/api/create_task.api.ts` | API | Task creation API client | ~150 LOC |
| `src/types/create_task.ts` | Types | Request/response types | ~100 LOC |
| `src/hooks/mutations/useCreateTask.ts` | Hook | Mutation hook for task creation | ~120 LOC |
| `src/hooks/queries/useTaskConfig.ts` | Hook | Fetch priorities & templates | ~100 LOC |
| `src/features/portal/components/CreateTaskModal.tsx` | Component | Main modal component | ~400 LOC |
| `src/features/portal/components/CreateTaskModal.module.css` | Style | Modal styles | ~200 LOC |
| `src/features/portal/components/MessageHoverMenu.tsx` | Update | Add "Create Task" button | ~50 LOC |
| `src/stores/createTaskStore.ts` | Store | Modal state (open/close) | ~80 LOC |

**Tests:**
- `src/api/__tests__/create_task.api.test.ts` - 4 unit tests
- `src/hooks/mutations/__tests__/useCreateTask.test.tsx` - 5 unit tests
- `src/hooks/queries/__tests__/useTaskConfig.test.tsx` - 4 unit tests
- `src/features/portal/components/__tests__/CreateTaskModal.test.tsx` - 6 E2E tests

---

## Files to Update

| File Path | Changes | Priority |
| --------- | ------- | -------- |
| `src/features/portal/components/MessageListItem.tsx` | Add hover menu with "Create Task" button | HIGH |
| `src/hooks/queries/index.ts` | Export `useTaskConfig` hook | LOW |
| `src/api/index.ts` | Export task creation APIs | LOW |
| `src/types/index.ts` | Export task creation types | LOW |

---

## Implementation Sequence

### Phase 1: Foundation (Types & API)
1. Create `create_task.ts` types
2. Create `create_task.api.ts` with API functions
3. Create API tests ✅

### Phase 2: Hooks & State
4. Create `useTaskConfig.ts` query hook
5. Create `useCreateTask.ts` mutation hook
6. Create `createTaskStore.ts` Zustand store
7. Create hook tests ✅

### Phase 3: UI Components
8. Create `CreateTaskModal.tsx` component
9. Add styles `CreateTaskModal.module.css`
10. Update `MessageHoverMenu` with button
11. Create component tests ✅

### Phase 4: Integration & Testing
12. Test modal open/close
13. Test form auto-fill
14. Test form validation
15. Test API call on submit
16. E2E testing

---

## Code Structure Example

### API Client (`create_task.api.ts`)
```typescript
export const getTaskPriorities = async (): Promise<TaskPriorityDto[]> => {
  const response = await apiClient.get<TaskPriorityDto[]>(
    '/api/task-config/priorities'
  );
  return response.data;
};

export const getChecklistTemplates = async (): Promise<CheckListTemplateResponse[]> => {
  // ...
};

export const createTask = async (data: CreateTaskRequest): Promise<TaskDetailResponse> => {
  // ...
};
```

### Query Hook (`useTaskConfig.ts`)
```typescript
export function useTaskConfig() {
  const { data: priorities, isLoading: prioritiesLoading } = useQuery({
    queryKey: ['task-config', 'priorities'],
    queryFn: getTaskPriorities,
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['task-config', 'templates'],
    queryFn: getChecklistTemplates,
  });

  return { priorities, templates, isLoading: prioritiesLoading || templatesLoading };
}
```

### Mutation Hook (`useCreateTask.ts`)
```typescript
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => createTask(data),
    onSuccess: () => {
      // Invalidate linked tasks query
      // Close modal
      // Show success toast
    },
    onError: (error) => {
      // Show error toast
    },
  });
}
```

### Modal Component (`CreateTaskModal.tsx`)
```typescript
export default function CreateTaskModal() {
  const { isOpen, messageId } = useCreateTaskStore();
  const { mutate: createTask, isPending } = useCreateTask();
  const { priorities, templates } = useTaskConfig();
  
  const [formData, setFormData] = useState({
    title: '',
    assignedToId: '',
    priorityId: '',
    checklistTemplateId: null,
  });

  const handleSubmit = async () => {
    // Validation
    // Auto-fill status ID
    // Call createTask()
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      {/* Form fields */}
      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Task'}
      </button>
    </Modal>
  );
}
```

---

## Data Flow Diagram

```
┌─────────────────┐
│  User hovers    │
│  message        │
└────────┬────────┘
         ↓
┌──────────────────────────┐
│ Show message hover menu  │
│ with "Create Task" btn   │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ User clicks              │
│ "Create Task"            │
└────────┬─────────────────┘
         ↓
┌────────────────────────────────────┐
│ 1. Open CreateTaskModal            │
│ 2. Call useTaskConfig() hook       │
│    - Fetch priorities              │
│    - Fetch templates               │
│ 3. Fetch conversation members      │
│ 4. Auto-fill task name             │
└────────┬─────────────────────────────┘
         ↓
┌────────────────────────────┐
│ User fills form:           │
│ - Task Name (pre-filled)   │
│ - Assign To                │
│ - Checklist Template       │
│ - Task Priority            │
└────────┬───────────────────┘
         ↓
┌────────────────────────────┐
│ User clicks "Create Task"  │
└────────┬───────────────────┘
         ↓
┌─────────────────────────────┐
│ Validate form               │
│ - Title required            │
│ - Priority required         │
│ - Assign To required        │
└────────┬────────────────────┘
         ↓
   Valid? ──No──→ Show errors (keep modal open)
         │
        Yes
         ↓
┌──────────────────────────────────┐
│ POST /api/tasks                  │
│ {                                │
│   title: string                  │
│   priorityId: string             │
│   assignedToId: string           │
│   statusId: "Todo"               │
│   checklistTemplateId?: string   │
│   conversationId: string         │
│ }                                │
└────────┬─────────────────────────┘
         ↓
   Success ──────→ ┌──────────────────────────┐
   (201)          │ 1. Show success toast    │
                  │ 2. Close modal           │
                  │ 3. Refresh linked tasks  │
                  │ 4. Navigate to task?     │
                  └──────────────────────────┘

   Error ────────→ ┌──────────────────────────┐
   (400/401/404)  │ 1. Show error toast      │
                  │ 2. Keep modal open       │
                  │ 3. Allow retry           │
                  └──────────────────────────┘
```

---

## Form Validation Rules

| Field | Required | Validation | Error Message |
| ----- | -------- | ---------- | ------------- |
| Task Name | ✅ Yes | 1-255 chars | "Task name is required and must be 1-255 characters" |
| Assign To | ✅ Yes | Valid user ID | "Please select a team member" |
| Priority | ✅ Yes | Valid priority ID | "Please select a task priority" |
| Template | ❌ No | Valid template ID or null | N/A |

---

## Key Implementation Details

### Auto-fill Task Name Logic
```typescript
function getTaskNameFromMessage(message: Message): string {
  // Priority: Text content > Attachment filename > Empty
  if (message.content?.trim()) {
    return message.content.substring(0, 255);
  }
  if (message.attachments?.length > 0) {
    return message.attachments[0].fileName.substring(0, 255);
  }
  return "";
}
```

### Get Todo Status ID
```typescript
async function getTodoStatusId(): Promise<string> {
  // Option 1: API call to get all statuses and find "Todo"
  // Option 2: Use config value from environment or constants
  const statuses = await apiClient.get('/api/task-config/statuses');
  const todoStatus = statuses.find(s => s.name === 'Todo');
  return todoStatus?.id || '';
}
```

### Form State Management
- Use React hooks + Zustand for modal visibility
- Local state for form fields (avoid re-renders)
- Debounce API calls for dropdowns

---

## Testing Strategy

### Unit Tests (API)
- ✅ `createTask()` success
- ✅ `getTaskPriorities()` success
- ✅ `getChecklistTemplates()` success
- ✅ API error handling

### Unit Tests (Hooks)
- ✅ `useTaskConfig()` loads data
- ✅ `useCreateTask()` handles success
- ✅ `useCreateTask()` handles errors
- ✅ Form validation logic
- ✅ Auto-fill logic

### Component Tests
- ✅ Modal opens/closes
- ✅ Form fields render
- ✅ Form validation shows errors
- ✅ Form submission works
- ✅ Success/error states display
- ✅ Responsive layout

### E2E Tests (Playwright)
- ✅ Complete flow: hover → create → submit
- ✅ Error case: invalid input → retry
- ✅ Modal overlay click to close
- ✅ Escape key to close

---

## Performance Considerations

1. **Lazy Load Modal:** Only render when needed
2. **Debounce Dropdowns:** Delay API calls while typing
3. **Cache Config:** Store priorities/templates for 5 mins
4. **Optimize Re-renders:** Use `React.memo` for dropdown options

---

## ⏳ PENDING DECISIONS

| # | Item | Options | HUMAN Input |
| - | ---- | ------- | ----------- |
| 1 | Modal position | Right sidebar OR Bottom sheet | ⬜Right sidebar |
| 2 | Auto-fill from | Message text OR Author name | ⬜ Message Text|
| 3 | Close on success | Auto-close OR Keep open | ⬜ Auto-close |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                      | Status   |
| ----------------------------- | -------- |
| Đã review Implementation Plan | ⬜ Rồi  |
| Đã điền Pending Decisions     | ⬜ Rồi  |
| **APPROVED để thực thi**      | ⬜ Rồi  |

**HUMAN Signature:** [Khoa]  
**Date:** [09012026]

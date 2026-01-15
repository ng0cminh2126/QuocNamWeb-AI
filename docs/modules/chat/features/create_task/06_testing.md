# [BƯỚC 4.5/6] Testing Requirements - Create Task Feature

## Test Coverage Matrix

| Implementation File | Test File | # Test Cases | Test Type |
| ------------------- | --------- | ------------ | --------- |
| `src/api/create_task.api.ts` | `src/api/__tests__/create_task.api.test.ts` | 4 | unit |
| `src/hooks/mutations/useCreateTask.ts` | `src/hooks/mutations/__tests__/useCreateTask.test.tsx` | 5 | unit |
| `src/hooks/queries/useTaskConfig.ts` | `src/hooks/queries/__tests__/useTaskConfig.test.tsx` | 4 | unit |
| `src/features/portal/components/CreateTaskModal.tsx` | `src/features/portal/components/__tests__/CreateTaskModal.test.tsx` | 8 | unit/integration |

**Total Tests Required:** 21 test cases

---

## Detailed Test Cases

### API Tests (`create_task.api.test.ts`)

#### Test 1: createTask - Success
- **Setup:** Mock successful API response
- **Action:** Call `createTask({ title, priorityId, assignedToId, conversationId, statusId })`
- **Expected:** Returns TaskDetailResponse with all fields populated
- **Assertions:** 
  - Response status: 201
  - Response has task ID
  - Response title matches input

#### Test 2: createTask - Validation Error (400)
- **Setup:** Mock 400 response with validation error
- **Action:** Call `createTask()` with invalid data
- **Expected:** Throws error with details
- **Assertions:**
  - Error status: 400
  - Error message contains validation detail

#### Test 3: getTaskPriorities - Success
- **Setup:** Mock array of task priorities
- **Action:** Call `getTaskPriorities()`
- **Expected:** Returns array of TaskPriorityDto
- **Assertions:**
  - Array has items
  - Each item has id, name, color

#### Test 4: getChecklistTemplates - Success
- **Setup:** Mock array of templates
- **Action:** Call `getChecklistTemplates()`
- **Expected:** Returns array of CheckListTemplateResponse
- **Assertions:**
  - Array has items
  - Each template has id, name, items array

---

### Mutation Hook Tests (`useCreateTask.test.tsx`)

#### Test 1: useCreateTask - Success Flow
- **Setup:** Mock `createTask()` API, QueryClient
- **Action:** Call `mutate()` with valid data
- **Expected:** Task created, modal closes, success toast shown
- **Assertions:**
  - `mutate()` was called with correct data
  - `onSuccess` callback fired
  - Linked tasks query invalidated
  - Modal closed

#### Test 2: useCreateTask - Pending State
- **Setup:** Hook mounted with slow API
- **Action:** Call `mutate()`, check state immediately
- **Expected:** `isPending` is true
- **Assertions:**
  - `isPending` = true during request
  - `isPending` = false after response

#### Test 3: useCreateTask - Error Handling
- **Setup:** Mock API error response
- **Action:** Call `mutate()`, error occurs
- **Expected:** Error caught, error toast shown
- **Assertions:**
  - `isError` = true
  - Error message displayable
  - Modal stays open for retry

#### Test 4: useCreateTask - Validation Error
- **Setup:** Mock 400 validation error
- **Action:** Call `mutate()` with invalid data
- **Expected:** Returns specific validation error
- **Assertions:**
  - Error includes field-level details
  - User can see which field failed

#### Test 5: useCreateTask - Network Error
- **Setup:** Mock network failure
- **Action:** Call `mutate()`
- **Expected:** Network error caught and handled
- **Assertions:**
  - Error message = "Network error" or similar
  - Retry button available

---

### Query Hook Tests (`useTaskConfig.test.tsx`)

#### Test 1: useTaskConfig - Load All Data
- **Setup:** Mock both API calls
- **Action:** Mount hook
- **Expected:** Both priorities and templates loaded
- **Assertions:**
  - `priorities` array populated
  - `templates` array populated
  - `isLoading` = false when done

#### Test 2: useTaskConfig - Error on Priorities
- **Setup:** Mock priorities error, templates success
- **Action:** Mount hook
- **Expected:** Still shows loading state for failed call
- **Assertions:**
  - `isLoading` = true for that section
  - Error state available

#### Test 3: useTaskConfig - Cache & Reuse
- **Setup:** Hook rendered twice
- **Action:** Mount, unmount, remount hook
- **Expected:** Second render uses cache
- **Assertions:**
  - API not called twice
  - Data same as first render
  - Performance improved

#### Test 4: useTaskConfig - Empty Results
- **Setup:** Mock empty arrays
- **Action:** Mount hook
- **Expected:** Returns empty arrays without error
- **Assertions:**
  - `priorities` = []
  - `templates` = []
  - `isLoading` = false

---

### Component Tests (`CreateTaskModal.test.tsx`)

#### Test 1: Modal Render & Auto-fill
- **Setup:** Mock message with content "Fix login button"
- **Action:** Open modal
- **Expected:** Task name auto-filled with "Fix login button"
- **Assertions:**
  - Modal renders
  - Task name input has "Fix login button"
  - `data-testid="task-name-input"` visible

#### Test 2: Form Validation - Empty Title
- **Setup:** Modal open, form empty
- **Action:** Click "Create Task" button
- **Expected:** Validation error shown
- **Assertions:**
  - Error message visible
  - Button disabled
  - No API call made

#### Test 3: Form Validation - All Fields Valid
- **Setup:** Modal open, all fields filled
- **Action:** Check button state
- **Expected:** Button is enabled
- **Assertions:**
  - `data-testid="create-task-button"` enabled
  - Submit handler ready

#### Test 4: Form Submission Success
- **Setup:** Valid form, mock successful API
- **Action:** Fill form → Click Create → Success
- **Expected:** Modal closes, success toast shown
- **Assertions:**
  - Modal closed
  - Success toast appeared
  - Task created in background

#### Test 5: Form Submission Error & Retry
- **Setup:** Valid form, mock API error
- **Action:** Fill form → Click Create → Error → Click Retry
- **Expected:** Error shown, can retry
- **Assertions:**
  - Error message visible
  - Modal still open
  - Retry button available

#### Test 6: Modal Close Button
- **Setup:** Modal open with dirty form
- **Action:** Click X button or press ESC
- **Expected:** Modal closes, form discarded
- **Assertions:**
  - Modal hidden
  - No unsaved data persisted
  - Focus returned to message

#### Test 7: Dropdown Loading State
- **Setup:** Dropdowns still loading
- **Action:** Render modal
- **Expected:** Dropdowns show skeleton/disabled
- **Assertions:**
  - Assign To dropdown disabled
  - Priority dropdown disabled
  - Loading spinner visible

#### Test 8: File Auto-fill Fallback
- **Setup:** Message with only attachments, no text
- **Action:** Open modal
- **Expected:** Task name = first file name
- **Assertions:**
  - Task name = attachment filename
  - Max 255 characters

---

## Test Data & Mocks

### Mock Message
```typescript
const mockMessage: Message = {
  id: 'msg-1',
  content: 'Fix login button styling issue',
  conversationId: 'conv-1',
  authorId: 'user-1',
  attachments: [],
  createdAt: new Date(),
};

const mockMessageWithAttachments: Message = {
  id: 'msg-2',
  content: '',
  conversationId: 'conv-1',
  authorId: 'user-1',
  attachments: [
    { id: 'att-1', fileName: 'screenshot.png', fileSize: 1024 },
  ],
  createdAt: new Date(),
};
```

### Mock Priorities
```typescript
const mockPriorities: TaskPriorityDto[] = [
  { id: 'p1', name: 'Low', color: '#10b981', displayOrder: 1 },
  { id: 'p2', name: 'Medium', color: '#f59e0b', displayOrder: 2 },
  { id: 'p3', name: 'High', color: '#ef4444', displayOrder: 3 },
];
```

### Mock Members
```typescript
const mockMembers: MemberDto[] = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', avatarUrl: '...' },
  { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', avatarUrl: '...' },
];
```

### Mock Response
```typescript
const mockCreateTaskResponse: TaskDetailResponse = {
  id: 'task-1',
  title: 'Fix login button styling',
  priorityId: 'p2',
  statusId: 'status-todo',
  assignedToId: 'u1',
  conversationId: 'conv-1',
  createdBy: 'current-user',
  createdAt: '2026-01-09T10:30:00Z',
  updatedAt: '2026-01-09T10:30:00Z',
};
```

---

## Test Generation Checklist

- [ ] All implementation files mapped to test files
- [ ] Minimum test cases per file:
  - API: 4 cases ✅
  - Hooks (mutation): 5 cases ✅
  - Hooks (query): 4 cases ✅
  - Component: 8 cases ✅
- [ ] Happy path tests (success flow)
- [ ] Error path tests (validation, network, API)
- [ ] Edge cases (empty data, large input)
- [ ] `data-testid` attributes added to all interactive elements
- [ ] Mock data comprehensive
- [ ] Test isolation (no interdependencies)

---

## Test Execution Plan

### Phase 1: Unit Tests (API & Hooks)
```bash
npm run test -- src/api/__tests__/create_task.api.test.ts
npm run test -- src/hooks/__tests__/useCreateTask.test.tsx
npm run test -- src/hooks/__tests__/useTaskConfig.test.tsx
```

### Phase 2: Component Tests
```bash
npm run test -- src/features/portal/components/__tests__/CreateTaskModal.test.tsx
```

### Phase 3: E2E Tests (Playwright)
```bash
npx playwright test tests/chat/create-task/
```

### Phase 4: Coverage Report
```bash
npm run test -- --coverage
# Target: >= 85% coverage
```

---

## Coverage Goals

| File | Target Coverage |
| ---- | --------------- |
| `create_task.api.ts` | 100% |
| `useCreateTask.ts` | 95% |
| `useTaskConfig.ts` | 90% |
| `CreateTaskModal.tsx` | 85% |
| **Total** | **≥ 90%** |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status   |
| ------------------------- | -------- |
| Đã review Test Requirements | ⬜ Chưa  |
| Đã điền Pending Decisions | ⬜ Chưa  |
| **APPROVED để thực thi**  | ⬜ Chưa  |

**HUMAN Signature:** [\_\_\_\_\_\_\_\_\_]  
**Date:** [\_\_\_\_\_\_\_\_\_]

> ⚠️ **CRITICAL:** AI CANNOT proceed to coding (BƯỚC 5) until this section is approved.

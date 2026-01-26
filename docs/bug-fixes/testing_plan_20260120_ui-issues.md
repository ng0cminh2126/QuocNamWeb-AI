# Testing Plan - UI Issues Fix

**Date:** 2026-01-20  
**Implementation Plan:** [implementation_plan_20260120_ui-issues.md](./implementation_plan_20260120_ui-issues.md)  
**Status:** ✅ READY FOR EXECUTION

---

## 🎯 Test Coverage Matrix

| Implementation File                 | Test File                                           | Test Type | Test Cases |
| ----------------------------------- | --------------------------------------------------- | --------- | ---------- |
| `LinkedTasksPanel.tsx` (Staff UI)   | `__tests__/LinkedTasksPanel.staff.test.tsx`         | Unit      | 5          |
| `LinkedTasksPanel.tsx` (Leader UI)  | `__tests__/LinkedTasksPanel.leader.test.tsx`        | Unit      | 3          |
| `MessageBubbleSimple.tsx`           | `chat/__tests__/MessageBubbleSimple.test.tsx`       | Unit      | 3          |
| Staff LinkedTasks Panel             | `tests/chat/linked-tasks-staff-ui.spec.ts`          | E2E       | 3          |
| Action Menu Position                | `tests/chat/message-action-menu-position.spec.ts`   | E2E       | 2          |

**Total:** 16 test cases

---

## 📋 Detailed Test Cases

### 1. LinkedTasksPanel - Staff UI (Section Headers)

**Test File:** `src/features/portal/components/__tests__/LinkedTasksPanel.staff.test.tsx`

#### Test Case 1.1: Render section headers with correct counts
```typescript
it('should render "Cần Làm" section header with count', () => {
  // Mock data: 2 todo tasks
  // Expect: "📋 Cần Làm (2)" header visible
});

it('should render "Đang Làm" section header with count', () => {
  // Mock data: 3 in-progress tasks
  // Expect: "⚡ Đang Làm (3)" header visible
});
```

#### Test Case 1.2: Hide empty sections
```typescript
it('should not render "Cần Làm" section when no todo tasks', () => {
  // Mock data: 0 todo tasks, 2 in-progress tasks
  // Expect: "Cần Làm" section not in DOM
  // Expect: "Đang Làm" section visible
});

it('should not render "Đang Làm" section when no in-progress tasks', () => {
  // Mock data: 2 todo tasks, 0 in-progress tasks
  // Expect: "Đang Làm" section not in DOM
  // Expect: "Cần Làm" section visible
});
```

#### Test Case 1.3: Tasks don't duplicate across sections
```typescript
it('should render each task only once even if in multiple status buckets', () => {
  // Mock data: Task with ID "task-1" in both todo and inProgress
  // Expect: Only 2 LinkedTaskCard components total (one per section)
  // Expect: Each has unique key
});
```

**Test Data:**
```typescript
const mockStaffTasks = {
  todo: [
    { taskId: 'task-1', task: { title: 'Todo Task 1', status: 'todo' } },
    { taskId: 'task-2', task: { title: 'Todo Task 2', status: 'todo' } },
  ],
  inProgress: [
    { taskId: 'task-3', task: { title: 'In Progress Task 1', status: 'doing' } },
    { taskId: 'task-4', task: { title: 'In Progress Task 2', status: 'doing' } },
    { taskId: 'task-5', task: { title: 'In Progress Task 3', status: 'in_progress' } },
  ],
};
```

---

### 2. LinkedTasksPanel - Leader UI (No Count)

**Test File:** `src/features/portal/components/__tests__/LinkedTasksPanel.leader.test.tsx`

#### Test Case 2.1: Title without count
```typescript
it('should display "Linked Tasks" without count', () => {
  // Mock data: 5 tasks
  // Expect: RightAccordion title = "Linked Tasks"
  // Expect: No "(5)" in title
});
```

#### Test Case 2.2: All tasks display correctly
```typescript
it('should render all tasks in single list', () => {
  // Mock data: 5 tasks
  // Expect: 5 LinkedTaskCard components
  // Expect: All visible in single grid
});
```

#### Test Case 2.3: "View All" button still works
```typescript
it('should show "View All" button when onViewAll provided', () => {
  // Mock: onViewAll callback
  // Expect: Button visible
  // Expect: Click triggers onViewAll
});
```

**Test Data:**
```typescript
const mockLeaderTasks = [
  { taskId: 'task-1', task: { title: 'Task 1', status: 'todo' } },
  { taskId: 'task-2', task: { title: 'Task 2', status: 'doing' } },
  { taskId: 'task-3', task: { title: 'Task 3', status: 'done' } },
  { taskId: 'task-4', task: { title: 'Task 4', status: 'todo' } },
  { taskId: 'task-5', task: { title: 'Task 5', status: 'doing' } },
];
```

---

### 3. MessageBubbleSimple - Action Menu Position

**Test File:** `src/features/portal/components/chat/__tests__/MessageBubbleSimple.test.tsx` (update existing)

#### Test Case 3.1: Action menu always positioned right
```typescript
it('should position action menu on right for own messages', () => {
  // Props: isOwn=true, onTogglePin/onToggleStar provided
  // Expect: Menu has "right-0" class
  // Expect: No "left-0" class
});

it('should position action menu on right for received messages', () => {
  // Props: isOwn=false, onTogglePin/onToggleStar provided
  // Expect: Menu has "right-0" class
  // Expect: No "left-0" class
});
```

#### Test Case 3.2: Action menu appears on hover
```typescript
it('should show action menu on hover for both message types', () => {
  // Test both isOwn=true and isOwn=false
  // Expect: Menu has "opacity-0" initially
  // Expect: Parent has "group" class
  // Expect: Menu has "group-hover:opacity-100"
});
```

**Test Data:**
```typescript
const mockOwnMessage = {
  id: 'msg-1',
  content: 'My message',
  isOwn: true,
  senderName: 'Me',
  sentAt: '2026-01-20T10:00:00Z',
  isPinned: false,
  isStarred: false,
};

const mockReceivedMessage = {
  ...mockOwnMessage,
  id: 'msg-2',
  content: 'Their message',
  isOwn: false,
  senderName: 'John Doe',
};
```

---

## 🎭 E2E Test Scenarios

### E2E Test 1: Staff LinkedTasks Panel

**Test File:** `tests/chat/linked-tasks-staff-ui.spec.ts` (new)

```typescript
test.describe('LinkedTasksPanel - Staff UI', () => {
  test('should display section headers with tasks separated', async ({ page }) => {
    // Navigate to staff workspace
    // Create 2 todo tasks and 3 in-progress tasks
    // Open right panel
    // Expect: "📋 Cần Làm (2)" header visible
    // Expect: 2 task cards under Cần Làm section
    // Expect: "⚡ Đang Làm (3)" header visible
    // Expect: 3 task cards under Đang Làm section
  });

  test('should hide empty sections', async ({ page }) => {
    // Navigate to staff workspace
    // Create only in-progress tasks (no todo)
    // Open right panel
    // Expect: "Cần Làm" section not visible
    // Expect: "Đang Làm" section visible
  });

  test('should not show duplicate tasks', async ({ page }) => {
    // Navigate to staff workspace
    // Create 5 unique tasks
    // Open right panel
    // Count all task cards in panel
    // Expect: Exactly 5 task cards (no duplicates)
  });
});
```

### E2E Test 2: Action Menu Position

**Test File:** `tests/chat/message-action-menu-position.spec.ts` (new)

```typescript
test.describe('Message Action Menu Position', () => {
  test('should show action menu on right for own messages', async ({ page }) => {
    // Send a message (own message, right-aligned)
    // Hover over the message
    // Expect: Action menu appears
    // Get menu bounding box
    // Expect: Menu is positioned to the right of message bubble
  });

  test('should show action menu on right for received messages', async ({ page }) => {
    // Receive a message (left-aligned)
    // Hover over the message
    // Expect: Action menu appears
    // Get menu bounding box
    // Expect: Menu is positioned to the right side (not left)
  });
});
```

---

## 🔧 Test Execution Plan

### Phase 1: Unit Tests (During Implementation)
1. Run tests after each file modification
2. Ensure all existing tests still pass
3. Add new test cases as needed

```bash
# Run specific test files
npm test -- LinkedTasksPanel
npm test -- MessageBubbleSimple

# Run all unit tests
npm test
```

### Phase 2: E2E Tests (After Implementation)
1. Create new E2E test files
2. Run E2E tests locally

```bash
# Run specific E2E tests
npx playwright test linked-tasks-staff-ui
npx playwright test message-action-menu-position

# Run all E2E tests
npx playwright test
```

### Phase 3: Visual Regression (Optional)
- Take screenshots of before/after
- Compare Staff UI with section headers
- Compare action menu position on both message types

---

## ✅ Test Acceptance Criteria

### Unit Tests:
- [ ] All existing tests pass
- [ ] New tests for section headers pass (5 tests)
- [ ] New tests for leader title pass (3 tests)
- [ ] Updated tests for action menu pass (3 tests)
- [ ] Code coverage ≥ 80% for modified lines

### E2E Tests:
- [ ] Staff UI section headers display correctly
- [ ] No duplicate tasks visible
- [ ] Action menu appears on right for all messages
- [ ] All tests pass in headless mode
- [ ] Tests run in < 30 seconds total

### Manual QA:
- [ ] Visual check: Staff UI sections look clean
- [ ] Visual check: Leader UI title no count
- [ ] Visual check: Action menu always on right
- [ ] No console errors
- [ ] No layout shift or flickering

---

## 📊 Test Results Tracking

| Test Suite                          | Status | Passed | Failed | Notes |
| ----------------------------------- | ------ | ------ | ------ | ----- |
| LinkedTasksPanel.staff.test.tsx     | ⏳      | -      | -      | -     |
| LinkedTasksPanel.leader.test.tsx    | ⏳      | -      | -      | -     |
| MessageBubbleSimple.test.tsx        | ⏳      | -      | -      | -     |
| E2E: linked-tasks-staff-ui.spec.ts  | ⏳      | -      | -      | -     |
| E2E: message-action-menu.spec.ts    | ⏳      | -      | -      | -     |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 📝 Notes

- Unit tests will use React Testing Library with `@testing-library/react`
- E2E tests will use Playwright
- Mock data matches actual API response structure from `types/tasks_api.ts` and `types/messages.ts`
- Tests should be idempotent (can run multiple times)

---

> ✅ This testing plan is ready for execution during implementation

# [BƯỚC 4.5] View All Tasks - Test Requirements

**Module:** Chat  
**Feature:** View All Tasks  
**Phase:** Test Coverage & Requirements  
**Created:** 2025-01-09

---

## 🎯 Testing Strategy

### Test Pyramid

```
        ╱╲         E2E Tests (2 tests)
       ╱──╲        - User complete flows
      ╱────╲       
     ╱──────╲      Integration Tests (5 tests)
    ╱────────╲     - Component + hooks
   ╱──────────╲    
  ╱────────────╲   Unit Tests (12 tests)
 ╱──────────────╲  - Individual components, hooks, utils
╱────────────────╲ 
```

**Total Test Cases:** 19 tests  
**Target Coverage:** 85%+  
**Execution Time:** ~15-20 seconds total

---

## 📊 Test Coverage Matrix

| Component/Function | Type | Tests | Coverage Target |
|---|---|---|---|
| **ViewAllTasksModal** | Component | 8 tests | 85% |
| **useViewAllTasks hook** | Hook | 6 tests | 90% |
| **LinkedTasksPanel** | Component (modified) | 2 tests | 80% |
| **Integration** | E2E/Integration | 3 tests | - |
| **TOTAL** | - | **19 tests** | **85%+** |

---

## 🧪 Unit Tests - ViewAllTasksModal Component

### Test File: `src/features/portal/components/__tests__/ViewAllTasksModal.test.tsx`

**Total Tests:** 8 unit tests + 2 integration tests

#### Test 1: Component Rendering
```typescript
test('should render modal with header, search, and task list', () => {
  // GIVEN: Modal with tasks loaded
  const { getByTestId, getByText } = render(
    <ViewAllTasksModal
      isOpen={true}
      onClose={mockOnClose}
      conversationId="conv-123"
      conversationName="Test Conversation"
      tasks={mockTasks}
      isLoading={false}
      isError={false}
    />
  );

  // WHEN: Component renders
  // THEN:
  expect(getByTestId('view-all-tasks-modal')).toBeInTheDocument();
  expect(getByTestId('modal-header')).toHaveTextContent('All Tasks (Test Conversation)');
  expect(getByTestId('search-input')).toBeInTheDocument();
  expect(getByTestId('task-list')).toBeInTheDocument();
});
```

#### Test 2: Close Button Functionality
```typescript
test('should call onClose when close button clicked', () => {
  const { getByTestId } = render(
    <ViewAllTasksModal
      isOpen={true}
      onClose={mockOnClose}
      conversationId="conv-123"
      tasks={mockTasks}
      isLoading={false}
      isError={false}
    />
  );

  fireEvent.click(getByTestId('modal-close-button'));
  expect(mockOnClose).toHaveBeenCalledTimes(1);
});
```

#### Test 3: Display Task Count
```typescript
test('should display correct task count in header', () => {
  const { getByTestId } = render(
    <ViewAllTasksModal
      isOpen={true}
      onClose={mockOnClose}
      conversationId="conv-123"
      tasks={mockTasks} // 5 tasks
      isLoading={false}
      isError={false}
    />
  );

  expect(getByTestId('modal-header')).toHaveTextContent('All Tasks (5)');
});
```

#### Test 4: Search Input Debouncing
```typescript
test('should debounce search input for 300ms before filtering', async () => {
  const { getByTestId, queryByText } = render(
    <ViewAllTasksModal
      isOpen={true}
      onClose={mockOnClose}
      conversationId="conv-123"
      tasks={mockTasks}
      isLoading={false}
      isError={false}
    />
  );

  const searchInput = getByTestId('search-input');
  
  fireEvent.change(searchInput, { target: { value: 'API' } });
  
  // Before 300ms: Should still show all tasks
  expect(queryByText('Implement API')).not.toBeInTheDocument();
  
  // After 300ms: Debounce completes, filter applied
  await waitFor(() => {
    expect(queryByText('Implement API')).toBeInTheDocument();
  }, { timeout: 400 });
});
```

#### Test 5: Status Filter (Single)
```typescript
test('should filter tasks by status when checkbox unchecked', async () => {
  const { getByTestId, queryByText } = render(
    <ViewAllTasksModal
      isOpen={true}
      onClose={mockOnClose}
      conversationId="conv-123"
      tasks={[
        { taskId: '1', task: { status: 'todo', title: 'Task 1' } },
        { taskId: '2', task: { status: 'done', title: 'Task 2' } },
      ]}
      isLoading={false}
      isError={false}
    />
  );

  // Initially both visible
  expect(queryByText('Task 1')).toBeInTheDocument();
  expect(queryByText('Task 2')).toBeInTheDocument();

  // Uncheck "Done" status
  fireEvent.click(getByTestId('filter-done-checkbox'));

  // Todo task still visible, Done task hidden
  expect(queryByText('Task 1')).toBeInTheDocument();
  expect(queryByText('Task 2')).not.toBeInTheDocument();
});
```

#### Test 6: Priority Filter (Multiple)
```typescript
test('should filter tasks by multiple priorities', () => {
  const { getByTestId, queryByText } = render(
    <ViewAllTasksModal
      isOpen={true}
      onClose={mockOnClose}
      conversationId="conv-123"
      tasks={[
        { taskId: '1', task: { priority: 'high', title: 'High Task' } },
        { taskId: '2', task: { priority: 'medium', title: 'Medium Task' } },
        { taskId: '3', task: { priority: 'low', title: 'Low Task' } },
      ]}
      isLoading={false}
      isError={false}
    />
  );

  // Uncheck "Medium" and "Low"
  fireEvent.click(getByTestId('filter-medium-checkbox'));
  fireEvent.click(getByTestId('filter-low-checkbox'));

  // Only high priority visible
  expect(queryByText('High Task')).toBeInTheDocument();
  expect(queryByText('Medium Task')).not.toBeInTheDocument();
  expect(queryByText('Low Task')).not.toBeInTheDocument();
});
```

#### Test 7: Sort by Created Date (Newest First)
```typescript
test('should sort tasks by created date (newest first)', () => {
  const tasks = [
    {
      taskId: '1',
      task: {
        title: 'Old Task',
        createdAt: '2025-01-01T00:00:00Z',
      },
    },
    {
      taskId: '2',
      task: {
        title: 'New Task',
        createdAt: '2025-01-09T00:00:00Z',
      },
    },
  ];

  const { container } = render(
    <ViewAllTasksModal
      isOpen={true}
      onClose={mockOnClose}
      conversationId="conv-123"
      tasks={tasks}
      isLoading={false}
      isError={false}
    />
  );

  const taskTitles = container
    .querySelectorAll('[data-testid^="task-card-"]')
    .map(el => el.textContent);

  expect(taskTitles).toEqual(['New Task', 'Old Task']);
});
```

#### Test 8: Empty State Message
```typescript
test('should show empty state when no tasks match filters', () => {
  const { getByTestId } = render(
    <ViewAllTasksModal
      isOpen={true}
      onClose={mockOnClose}
      conversationId="conv-123"
      tasks={[]}
      isLoading={false}
      isError={false}
    />
  );

  expect(getByTestId('empty-state')).toBeInTheDocument();
  expect(getByTestId('empty-state')).toHaveTextContent(
    'No linked tasks'
  );
});
```

---

## 🧪 Hook Tests - useViewAllTasks

### Test File: `src/hooks/queries/__tests__/useViewAllTasks.test.ts`

**Total Tests:** 6 tests

#### Test 1: Search Filtering
```typescript
test('should filter tasks by search term (case-insensitive)', () => {
  const tasks = [
    { taskId: '1', task: { title: 'API Integration' } },
    { taskId: '2', task: { title: 'Database Setup' } },
    { taskId: '3', task: { title: 'API Documentation' } },
  ];

  const { result } = renderHook(() =>
    useViewAllTasks(
      tasks,
      'api', // search term
      allStatusFilters,
      allPriorityFilters,
      'createdDate',
      1,
      10
    )
  );

  expect(result.current.tasks).toHaveLength(2);
  expect(result.current.filteredCount).toBe(2);
  expect(result.current.tasks[0].task.title).toMatch(/API/i);
});
```

#### Test 2: Status Filter (OR Logic)
```typescript
test('should apply status filters with OR logic', () => {
  const tasks = [
    { taskId: '1', task: { status: 'todo', title: 'Task 1' } },
    { taskId: '2', task: { status: 'inProgress', title: 'Task 2' } },
    { taskId: '3', task: { status: 'done', title: 'Task 3' } },
  ];

  const statusFilters = {
    todo: true,
    inProgress: true,
    awaiting: false,
    done: false,
  };

  const { result } = renderHook(() =>
    useViewAllTasks(
      tasks,
      '',
      statusFilters,
      allPriorityFilters,
      'createdDate',
      1,
      10
    )
  );

  expect(result.current.tasks).toHaveLength(2);
  expect(result.current.filteredCount).toBe(2);
});
```

#### Test 3: Priority Filter (OR Logic)
```typescript
test('should apply priority filters with OR logic', () => {
  const tasks = [
    { taskId: '1', task: { priority: 'high', title: 'High Task' } },
    { taskId: '2', task: { priority: 'medium', title: 'Medium Task' } },
    { taskId: '3', task: { priority: 'low', title: 'Low Task' } },
  ];

  const priorityFilters = {
    high: true,
    medium: true,
    low: false,
    urgent: false,
  };

  const { result } = renderHook(() =>
    useViewAllTasks(
      tasks,
      '',
      allStatusFilters,
      priorityFilters,
      'createdDate',
      1,
      10
    )
  );

  expect(result.current.tasks).toHaveLength(2);
});
```

#### Test 4: Sort by Priority (High to Low)
```typescript
test('should sort by priority (high to low)', () => {
  const tasks = [
    { taskId: '1', task: { priority: 'low', title: 'Low Task' } },
    { taskId: '2', task: { priority: 'high', title: 'High Task' } },
    { taskId: '3', task: { priority: 'medium', title: 'Medium Task' } },
  ];

  const { result } = renderHook(() =>
    useViewAllTasks(
      tasks,
      '',
      allStatusFilters,
      allPriorityFilters,
      'priority', // sort by priority
      1,
      10
    )
  );

  const priorityOrder = result.current.tasks.map(t => t.task.priority);
  expect(priorityOrder).toEqual(['high', 'medium', 'low']);
});
```

#### Test 5: Pagination
```typescript
test('should paginate tasks correctly', () => {
  const tasks = Array.from({ length: 25 }, (_, i) => ({
    taskId: `task-${i}`,
    task: { title: `Task ${i}` },
  }));

  const { result } = renderHook(() =>
    useViewAllTasks(
      tasks,
      '',
      allStatusFilters,
      allPriorityFilters,
      'createdDate',
      2, // page 2
      10 // page size 10
    )
  );

  expect(result.current.tasks).toHaveLength(10);
  expect(result.current.tasks[0].task.title).toBe('Task 10');
  expect(result.current.totalCount).toBe(25);
});
```

#### Test 6: Combined Filters (AND Logic)
```typescript
test('should apply combined filters with AND logic', () => {
  const tasks = [
    {
      taskId: '1',
      task: { status: 'todo', priority: 'high', title: 'High Todo' },
    },
    {
      taskId: '2',
      task: { status: 'todo', priority: 'low', title: 'Low Todo' },
    },
    {
      taskId: '3',
      task: { status: 'done', priority: 'high', title: 'High Done' },
    },
  ];

  const statusFilters = { todo: true, done: false, ... };
  const priorityFilters = { high: true, low: false, ... };

  const { result } = renderHook(() =>
    useViewAllTasks(
      tasks,
      '',
      statusFilters,
      priorityFilters,
      'createdDate',
      1,
      10
    )
  );

  // Should only get: (todo OR others) AND (high OR others)
  // = Just "High Todo"
  expect(result.current.tasks).toHaveLength(1);
  expect(result.current.tasks[0].task.title).toBe('High Todo');
});
```

---

## 🧪 Integration Tests

### Test 1: LinkedTasksPanel "View All" Button
```typescript
test('LinkedTasksPanel should render "View All" button and call callback', () => {
  const mockOnViewAll = jest.fn();
  
  const { getByTestId } = render(
    <LinkedTasksPanel
      conversationId="conv-123"
      onViewAll={mockOnViewAll}
      tasks={mockTasks}
    />
  );

  fireEvent.click(getByTestId('view-all-tasks-button'));
  expect(mockOnViewAll).toHaveBeenCalled();
});
```

### Test 2: Modal Integration with LinkedTasksPanel
```typescript
test('should open modal when "View All" button clicked in LinkedTasksPanel', () => {
  const { getByTestId, queryByTestId } = render(
    <ConversationDetailPanel
      groupId="conv-123"
      {...otherProps}
    />
  );

  // Initially modal not visible
  expect(queryByTestId('view-all-tasks-modal')).not.toBeInTheDocument();

  // Click "View All" in LinkedTasksPanel
  fireEvent.click(getByTestId('view-all-tasks-button'));

  // Modal becomes visible
  expect(getByTestId('view-all-tasks-modal')).toBeInTheDocument();
});
```

### Test 3: Error State with Retry
```typescript
test('should show error and allow retry', async () => {
  let callCount = 0;
  const mockFetch = jest.fn(() => {
    callCount++;
    if (callCount === 1) {
      return Promise.reject(new Error('API Error'));
    }
    return Promise.resolve({ data: mockTasks });
  });

  const { getByTestId, getByText } = render(
    <ViewAllTasksModal
      isOpen={true}
      onClose={mockOnClose}
      conversationId="conv-123"
      isError={true}
      error={new Error('API Error')}
      onRetry={mockFetch}
      {...otherProps}
    />
  );

  expect(getByTestId('error-state')).toBeInTheDocument();
  
  fireEvent.click(getByText('Retry'));
  
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
```

---

## 📱 E2E Tests (Playwright)

### Test 1: Complete User Journey - Search & Filter

```typescript
test.describe('View All Tasks - Complete User Journey', () => {
  test('user can search, filter, and sort tasks', async ({ page }) => {
    await page.goto('/conversation/conv-123');

    // Step 1: Click "View All" button
    await page.click('[data-testid="view-all-tasks-button"]');
    await page.waitForSelector('[data-testid="view-all-tasks-modal"]');

    // Step 2: Search for "API"
    await page.fill('[data-testid="search-input"]', 'API');
    await page.waitForTimeout(400); // debounce

    // Step 3: Verify filtered results
    const results = await page.locator('[data-testid^="task-card-"]').count();
    expect(results).toBeGreaterThan(0);

    // Step 4: Filter by "Done" status only
    await page.uncheck('[data-testid="filter-todo-checkbox"]');
    await page.uncheck('[data-testid="filter-inProgress-checkbox"]');
    await page.uncheck('[data-testid="filter-awaiting-checkbox"]');

    // Step 5: Sort by priority
    await page.selectOption('[data-testid="sort-dropdown"]', 'priority');

    // Step 6: Close modal
    await page.click('[data-testid="modal-close-button"]');
    expect(page.locator('[data-testid="view-all-tasks-modal"]')).not.toBeVisible();
  });
});
```

---

## 🎯 Test Data & Mocks

### Mock LinkedTaskDto Array

```typescript
export const mockLinkedTasks: LinkedTaskDto[] = [
  {
    taskId: 'task-001',
    task: {
      id: 'task-001',
      title: 'Implement API integration',
      status: 'in_progress',
      priority: 'high',
      assignedTo: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
      createdAt: '2025-01-07T14:30:00Z',
      updatedAt: '2025-01-09T10:15:00Z',
      checkItems: [
        { id: 'c1', title: 'Create client', completed: true, order: 1 },
        { id: 'c2', title: 'Write tests', completed: false, order: 2 },
      ],
    },
    messageId: 'msg-456',
  },
  {
    taskId: 'task-002',
    task: {
      id: 'task-002',
      title: 'Write documentation',
      status: 'todo',
      priority: 'medium',
      assignedTo: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
      createdAt: '2025-01-09T08:00:00Z',
      updatedAt: '2025-01-09T08:00:00Z',
      checkItems: [],
    },
  },
  // ... more tasks
];
```

---

## ✅ Test Execution Checklist

| Phase | Tests | Status |
|-------|-------|--------|
| Unit - ViewAllTasksModal | 8 tests | ⬜ Not started |
| Unit - useViewAllTasks hook | 6 tests | ⬜ Not started |
| Integration | 3 tests | ⬜ Not started |
| E2E - User journey | 1 test | ⬜ Not started |
| **TOTAL** | **18 tests** | ⬜ Pending |

---

## ⏳ PENDING TEST DECISIONS

| #   | Vấn đề            | Lựa chọn        | HUMAN Decision |
| --- | ----------------- | --------------- | -------------- |
| 1   | Snapshot Testing  | Include / Skip? | ✅ **Include**  |
| 2   | Visual Regression | Include / Skip? | ✅ **Skip**  |
| 3   | Performance Test  | Include / Skip? | ✅ **Skip**  |

---

## ✅ HUMAN CONFIRMATION

| Item | Status |
|------|--------|
| Đã review test coverage matrix | ✅ Reviewed |
| Đã review test cases | ✅ Reviewed |
| Đã review mock data | ✅ Reviewed |
| Đã điền Test Decisions | ✅ Filled |
| **APPROVED tiến tới BƯỚC 5 (Coding)** | ✅ APPROVED |

**HUMAN Signature:** Khoa  
**Date:** 09012026


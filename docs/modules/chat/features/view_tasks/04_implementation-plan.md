# [BƯỚC 4] View All Tasks - Implementation Plan

**Module:** Chat  
**Feature:** View All Tasks  
**Phase:** Architecture & Implementation  
**Created:** 2025-01-09

---

## 🏗️ Architecture Overview

### Component Structure

```
src/features/portal/
├── components/
│   ├── LinkedTasksPanel.tsx (MODIFY)
│   │   └── Add "View All" button
│   │   └── Call onViewAllTasks callback
│   │
│   └── ViewAllTasksModal.tsx (NEW)
│       ├── Modal wrapper
│       ├── Header (close button)
│       ├── Search input
│       ├── Filter controls (status, priority)
│       ├── Sort dropdown
│       ├── Task list rendering
│       └── Pagination/Load more
│       └── ViewAllTasksModal.module.css
│
├── workspace/
│   └── ConversationDetailPanel.tsx (MODIFY)
│       └── Add state: showViewAllModal: boolean
│       └── Pass onViewAllTasks handler to LinkedTasksPanel
│
hooks/queries/
├── useLinkedTasks.ts (EXISTING - reuse)
│
hooks/mutations/ (if needed)
└── useTaskStatusUpdate.ts (for future enhancements)

types/
└── tasks_api.ts (EXISTING - may extend)
```

---

## 📁 File Structure

### Files to Create

#### 1. `src/features/portal/components/ViewAllTasksModal.tsx`

**Purpose:** Main modal component for viewing all linked tasks

**Responsibility:**
- Render modal container with header
- Display search input with debouncing
- Render filter controls (status, priority)
- Render sort dropdown
- Render task list
- Handle pagination/infinite scroll
- Error and loading states

**Estimated LOC:** 350-400

**Key Props:**
```typescript
interface ViewAllTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationName?: string;
  tasks: LinkedTaskDto[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry: () => void;
}
```

**Key State:**
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [statusFilters, setStatusFilters] = useState({
  todo: true,
  inProgress: true,
  awaiting: true,
  done: true,
});
const [priorityFilters, setPriorityFilters] = useState({
  low: true,
  medium: true,
  high: true,
  urgent: true,
});
const [sortBy, setSortBy] = useState('createdDate');
const [currentPage, setCurrentPage] = useState(1);
```

---

#### 2. `src/features/portal/components/ViewAllTasksModal.module.css`

**Purpose:** Scoped styles for modal and components

**Estimated LOC:** 150-200

**Key Classes:**
- `.modal` - Modal container
- `.header` - Header with title
- `.searchContainer` - Search input wrapper
- `.filterSection` - Filter controls
- `.taskList` - Task list container
- `.taskCard` - Individual task card
- `.priorityDot` - Priority indicator
- `.statusBadge` - Status colored badge
- `.emptyState` - Empty state message
- `.loadingState` - Loading skeleton
- `.errorState` - Error message

---

#### 3. `src/hooks/queries/useViewAllTasks.ts`

**Purpose:** Custom hook for filtering/sorting logic

**Responsibility:**
- Accept LinkedTaskDto[] and filter/sort options
- Return processed task list
- Handle search debouncing
- Apply filters in correct order (AND/OR logic)
- Apply sorting

**Estimated LOC:** 120-150

**Key Logic:**
```typescript
export function useViewAllTasks(
  tasks: LinkedTaskDto[],
  searchTerm: string,
  statusFilters: StatusFilters,
  priorityFilters: PriorityFilters,
  sortBy: SortOption,
  currentPage: number,
  pageSize: number = 10
) {
  const debouncedSearch = useMemo(() => {
    // Debounce search term changes
    // Return debounced value after 300ms
  }, [searchTerm]);

  const filteredTasks = useMemo(() => {
    // 1. Search filter
    const bySearch = tasks.filter(t =>
      t.task.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    
    // 2. Status filter (OR logic)
    const byStatus = bySearch.filter(t =>
      statusFilters[t.task.status]
    );
    
    // 3. Priority filter (OR logic)
    const byPriority = byStatus.filter(t =>
      priorityFilters[t.task.priority]
    );
    
    return byPriority;
  }, [tasks, debouncedSearch, statusFilters, priorityFilters]);

  const sortedTasks = useMemo(() => {
    // Apply sort logic based on sortBy option
    const sorted = [...filteredTasks];
    
    switch (sortBy) {
      case 'createdDate':
        sorted.sort((a, b) =>
          new Date(b.task.createdAt).getTime() -
          new Date(a.task.createdAt).getTime()
        );
        break;
      // ... other cases
    }
    
    return sorted;
  }, [filteredTasks, sortBy]);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTasks.slice(start, start + pageSize);
  }, [sortedTasks, currentPage, pageSize]);

  return {
    tasks: paginatedTasks,
    filteredCount: filteredTasks.length,
    totalCount: tasks.length,
  };
}
```

---

### Files to Modify

#### 1. `src/features/portal/components/LinkedTasksPanel.tsx`

**Changes:**
- Add "View All (N)" button in header
- Add onClick handler to open ViewAllTasksModal
- Emit event or call callback when button clicked

**LOC Changes:** +20-30 lines

**Pseudo-code:**
```typescript
export function LinkedTasksPanel({
  conversationId,
  onTaskClick,
  onViewAll,  // NEW callback prop
}: LinkedTasksPanelProps) {
  // ... existing code ...

  return (
    <RightAccordion
      icon={<ClipboardList className="h-4 w-4 text-brand-600" />}
      title={`Linked Tasks${taskCount > 0 ? ` (${taskCount})` : ''}`}
      // NEW: Add action button
      action={
        taskCount > 0 && (
          <button
            onClick={onViewAll}
            className="text-xs text-brand-600 hover:text-brand-700"
            data-testid="view-all-tasks-button"
          >
            View All ({taskCount})
          </button>
        )
      }
    >
      {/* ... rest of component ... */}
    </RightAccordion>
  );
}
```

---

#### 2. `src/features/portal/workspace/ConversationDetailPanel.tsx`

**Changes:**
- Add state: `showViewAllTasksModal: boolean`
- Add handler: `handleViewAllTasks()`
- Render ViewAllTasksModal when state is true
- Pass handler to LinkedTasksPanel

**LOC Changes:** +30-40 lines

**Pseudo-code:**
```typescript
export const ConversationDetailPanel: React.FC<...> = ({
  // ... existing props ...
}) => {
  const [showViewAllTasksModal, setShowViewAllTasksModal] = useState(false);

  return (
    <aside className="...">
      {/* ... existing content ... */}
      
      {/* LinkedTasksPanel with new callback */}
      {groupId && (
        <LinkedTasksPanel
          conversationId={groupId}
          onTaskClick={(taskId) => {
            console.log('Task clicked:', taskId);
          }}
          onViewAll={() => setShowViewAllTasksModal(true)} // NEW
        />
      )}

      {/* NEW: ViewAllTasksModal */}
      {showViewAllTasksModal && (
        <ViewAllTasksModal
          isOpen={showViewAllTasksModal}
          onClose={() => setShowViewAllTasksModal(false)}
          conversationId={groupId}
          conversationName={groupName}
          tasks={tasks} // Pass tasks or fetch in modal
        />
      )}
    </aside>
  );
};
```

---

## 💾 Data Flow

```
ConversationDetailPanel (has: groupId, groupName, tasks)
    │
    ├─> LinkedTasksPanel (receives tasks, shows count)
    │   │
    │   └─> [View All Button clicked]
    │       │
    │       └─> onViewAll callback to parent
    │
    └─> ConversationDetailPanel state: showViewAllTasksModal = true
        │
        └─> ViewAllTasksModal (opens)
            │
            ├─> useLinkedTasks hook (fetch tasks)
            │
            ├─> User interacts: Search, Filter, Sort
            │
            ├─> useViewAllTasks hook (process data)
            │
            └─> Render processed task list
```

---

## 🔄 State Management Pattern

**No additional store needed** - Use component state + hooks

```typescript
// In ViewAllTasksModal.tsx

// UI State
const [searchTerm, setSearchTerm] = useState('');
const [statusFilters, setStatusFilters] = useState({...});
const [priorityFilters, setPriorityFilters] = useState({...});
const [sortBy, setSortBy] = useState('createdDate');
const [currentPage, setCurrentPage] = useState(1);

// Data from API (via hook)
const { data: linkedTasks, isLoading, isError } = useLinkedTasks({
  conversationId,
});

// Process data (via custom hook)
const { tasks: processedTasks, filteredCount } = useViewAllTasks(
  linkedTasks?.tasks ?? [],
  searchTerm,
  statusFilters,
  priorityFilters,
  sortBy,
  currentPage,
  pageSize
);
```

---

## 🧪 Testing Strategy

**Test Files to Create:**
- `src/features/portal/components/__tests__/ViewAllTasksModal.test.tsx`
- `src/hooks/queries/__tests__/useViewAllTasks.test.ts`

**Test Coverage Target:** 85%+

**Test Categories:**
1. Component rendering (4 tests)
2. Filter functionality (4 tests)
3. Search functionality (3 tests)
4. Sort functionality (3 tests)
5. Pagination (2 tests)
6. Error states (2 tests)
7. Loading states (1 test)

**Total: 19 tests**

---

## 📊 Implementation Phases

### Phase 1: Component Structure (1 hour)
- Create ViewAllTasksModal component skeleton
- Create ViewAllTasksModal.module.css with basic styles
- Modify LinkedTasksPanel to add button
- Modify ConversationDetailPanel to manage modal state

### Phase 2: Display Logic (1.5 hours)
- Implement task list rendering in modal
- Implement search/filter UI controls
- Implement sort dropdown
- Add loading, error, and empty states

### Phase 3: Processing Logic (1 hour)
- Create useViewAllTasks hook
- Implement search filtering (300ms debounce)
- Implement status and priority filtering
- Implement sorting logic

### Phase 4: Polish & Tests (1.5 hours)
- Add all data-testid attributes
- Write 19 unit tests
- Test responsive design (desktop, mobile)
- Test accessibility (keyboard nav, screen readers)

**Total Estimated Time:** 5 hours

---

## 🚨 Edge Cases to Handle

| Case | Solution |
|------|----------|
| No tasks linked | Show "No linked tasks" empty state |
| Filter removes all tasks | Show "No tasks match filters" message |
| Search finds nothing | Show "No tasks match search" message |
| API fails | Show error with retry button |
| Very long task titles | Truncate with ellipsis (text-ellipsis) |
| No assignee | Show "Unassigned" or "—" |
| Completed checklist | Show "All done" instead of "0/5" |
| Modal on mobile | Use full screen / bottom sheet |
| Scroll while filtering | Reset to top or maintain position (HUMAN decides) |

---

## ⏳ PENDING IMPLEMENTATION DECISIONS

| #   | Vấn đề            | Lựa chọn        | HUMAN Decision |
| --- | ----------------- | --------------- | -------------- |
| 1   | Hook vs Store     | useState hooks / Zustand store? | ✅ **useState hooks**  |
| 2   | Sidebar Portal    | Render in place / React Portal? | ✅ **Render in place (sidebar)**  |
| 3   | Scroll Behavior   | Reset to top / Maintain position? | ✅ **Maintain position**  |
| 4   | Task Card Click   | Show preview / Navigate to detail? | ✅ **Show preview**  |

---

## ✅ HUMAN CONFIRMATION

| Item | Status |
|------|--------|
| Đã review component structure | ✅ Reviewed |
| Đã review file organization | ✅ Reviewed |
| Đã review data flow | ✅ Reviewed |
| Đã review implementation phases | ✅ Reviewed |
| Đã điền Implementation Decisions | ✅ Filled |
| **APPROVED tiến tới BƯỚC 4.5 (Test Requirements)** | ✅ APPROVED |

**HUMAN Signature:** Khoa  
**Date:** 09012026


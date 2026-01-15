# [BƯỚC 2B] View All Tasks - User Flows & Data Flow

**Module:** Chat  
**Feature:** View All Tasks  
**Phase:** Flow & Interaction Design  
**Created:** 2025-01-09

---

## 🎯 Main User Journey

### Flow 1: Open View All Tasks Modal

```
START
  ↓
User sees LinkedTasksPanel with "View All (5)" button
  ↓
[Decision: Click "View All"?]
  ├─ NO → User continues in conversation
  └─ YES ↓
       ViewAllTasksModal opens (animation: fade-in, 200ms)
       ↓
       Modal header: "All Tasks (Conversation Name)"
       Search input: focused, placeholder visible
       Filters: All checked by default
       Task list: Loading skeleton shown (500ms)
       ↓
       API Call: GET /api/conversations/{conversationId}/tasks
       ↓
       [Decision: API Success?]
       ├─ FAIL → Error state, show retry button
       └─ SUCCESS ↓
                 Tasks loaded, skeleton removed
                 List displays with 10 tasks (default)
                 ↓
                 [User can now search/filter/sort]
                 ↓
                 Close button: Click to close
                 ↓
END
```

**Actors:** Team member viewing conversation  
**Preconditions:**
- User authenticated and in conversation detail view
- LinkedTasksPanel loaded with tasks count > 0
- Conversation has linked tasks

**Key Interactions:**
1. Button hover: bg-gray-100, cursor-pointer
2. Modal open: Blur background, modal slides in
3. Loading state: Skeleton cards replace content
4. API complete: Content fades in

---

### Flow 2: Search Tasks

```
START (Modal is open)
  ↓
User types "API" in search input
  ↓
Debounce timer starts (300ms)
  ↓
[Waiting for user to stop typing]
  ├─ User continues typing → Reset timer
  └─ Timer expires ↓
                 Filter applied to task list
                 List refiltered in real-time
                 Only tasks with "API" in title shown
                 ↓
                 [Decision: Results found?]
                 ├─ NO → Empty state message: "No tasks match search"
                 └─ YES ↓
                      Task list updated with filtered results
                      Scroll position: Maintain or reset to top
                      ↓
                 User can clear search or continue typing
                 ↓
END
```

**Example Searches:**
- "API" → Tasks with "API" in title
- "john" → Tasks assigned to John (searches assignee too if data available)
- "" → Clear search (show all tasks matching current filters)

---

### Flow 3: Filter Tasks by Status

```
START (Modal is open)
  ↓
User sees filter section: ☑ Todo  ☑ In Progress  ☑ Awaiting  ☑ Done
  ↓
[Decision: Change filter?]
  ├─ User unchecks "Done" → Status filter updated
  │   ↓
  │   Task list immediately refiltered
  │   "Done" tasks removed from view
  │   Count updates: "All Tasks (15)" → "All Tasks (12)"
  │   ↓
  │   Continue with other filters or search
  │
  └─ User unchecks "In Progress" → Another filter applied
      ↓
      Filters now: ☑ Todo  ☐ In Progress  ☑ Awaiting  ☑ Done
      ↓
      Task list shows only (Todo + Awaiting + Done) tasks
      ↓
END
```

**Multi-filter Behavior:**
- Multiple status filters can be active (OR logic)
- Multiple priority filters can be active (OR logic)
- Status AND Priority filters work together (AND logic)
  - Example: (Todo OR In Progress) AND (High OR Urgent)

---

### Flow 4: Sort Tasks

```
START (Modal is open)
  ↓
User sees Sort dropdown: "Created Date ▼"
  ↓
[Click dropdown to expand]
  ↓
Shows options:
  ○ Created Date (Newest first) [DEFAULT]
  ○ Updated Date (Newest first)
  ○ Priority (High → Low)
  ○ Assignee (A-Z)
  ○ Status (Todo → Done)
  ↓
User selects "Priority (High → Low)"
  ↓
Dropdown closes
  ↓
Task list re-sorts:
  1. HIGH │ Task A
  2. HIGH │ Task B
  3. MEDIUM │ Task C
  4. LOW │ Task D
  ↓
Scroll position: Reset to top (or maintain?)
  ↓
END
```

**Sort Options Behavior:**
- Each sort option is independent
- Changing sort does not reset filters
- Does not change search results, only order
- Can combine: Search for "API" + Sort by Priority

---

### Flow 5: Load More Tasks (Pagination)

```
START (User scrolled to bottom)
  ↓
User reaches bottom of task list
  ↓
[Decision: Load more type?]
  ├─ INFINITE SCROLL (if chosen):
  │   ↓
  │   Automatically loads next page (10-20 more tasks)
  │   Loading indicator: Spinner at bottom
  │   ↓
  │   New tasks appended to list
  │   Scroll position: Maintained
  │   ↓
  │   User continues scrolling/searching
  │
  └─ LOAD MORE BUTTON (if chosen):
      ↓
      Show "[Load More]" button at bottom
      ↓
      User clicks button
      ↓
      Loading state: Button shows spinner
      ↓
      Next page loads
      ↓
      New tasks appended, button remains visible
      ↓
      Continue clicking or scroll back up
END
```

---

### Flow 6: View Task Details (Future)

```
START (Task card visible)
  ↓
User sees task card:
  ┌─────────────────────────────────┐
  │ HIGH │ Implement API integration│
  │ In Progress - John Doe          │
  │ Created: 2 days ago             │
  │ 3/5 items completed    [View >] │
  └─────────────────────────────────┘
  ↓
User clicks card or "[View >]" button
  ↓
[Decision: Action type?]
  ├─ CLICK CARD → Navigate to task detail page
  │              /tasks/{taskId}
  │              (Implementation: Phase 2)
  │
  └─ CLICK [VIEW] → Open task detail modal
                     (Implementation: Phase 2)
                     ↓
END
```

**Note:** Initial Phase v1 does NOT implement task detail view. Clicking card logs to console.

---

## 📊 Data Flow Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  LinkedTasksPanel                          │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Task Count Display: "View All (5)"  [Button]       │ │
│  └──────────────────────────────────────────────────────┘ │
│                      ↓                                      │
│              [User clicks "View All"]                      │
│                      ↓                                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │            ViewAllTasksModal (new)                   │ │
│  │                                                      │ │
│  │  ┌────────────────────────────────────────────────┐ │ │
│  │  │ Header: "All Tasks (N)" + Close button         │ │ │
│  │  └────────────────────────────────────────────────┘ │ │
│  │                                                      │ │
│  │  ┌────────────────────────────────────────────────┐ │ │
│  │  │ Search Input: [Search tasks...]                │ │ │
│  │  │ (debounce: 300ms)                              │ │ │
│  │  └────────────────────────────────────────────────┘ │ │
│  │           ↓                                          │ │
│  │   [Update searchTerm state]                         │ │
│  │           ↓                                          │ │
│  │  ┌────────────────────────────────────────────────┐ │ │
│  │  │ Filters: Status (4) + Priority (4) checkboxes │ │ │
│  │  │ Sort dropdown: [Created Date ▼]               │ │ │
│  │  └────────────────────────────────────────────────┘ │ │
│  │           ↓                                          │ │
│  │   [Update filters & sortBy state]                   │ │
│  │           ↓                                          │ │
│  │  ┌────────────────────────────────────────────────┐ │ │
│  │  │ Process All Data:                              │ │ │
│  │  │ 1. Apply search filter (title matching)        │ │ │
│  │  │ 2. Apply status filters (OR logic)             │ │ │
│  │  │ 3. Apply priority filters (OR logic)           │ │ │
│  │  │ 4. Apply sort (by selected field)              │ │ │
│  │  │ 5. Apply pagination (slice for page)           │ │ │
│  │  └────────────────────────────────────────────────┘ │ │
│  │           ↓                                          │ │
│  │  ┌────────────────────────────────────────────────┐ │ │
│  │  │ Render Task List:                              │ │ │
│  │  │ • Loading: Show skeleton                        │ │ │
│  │  │ • Error: Show error message + retry             │ │ │
│  │  │ • Empty: Show "No tasks match filters"          │ │ │
│  │  │ • Success: Show task cards with metadata        │ │ │
│  │  └────────────────────────────────────────────────┘ │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
        ↓ (API fetch) ↓
┌────────────────────────────────────────────────────────────┐
│            API Layer (useLinkedTasks hook)                │
│                                                            │
│  GET /api/conversations/{conversationId}/tasks            │
│                                                            │
│  Response: LinkedTaskDto[]                                │
│  ├─ taskId: string                                        │
│  ├─ task: {                                               │
│  │   ├─ title: string                                     │
│  │   ├─ status: TaskStatus (enum)                         │
│  │   ├─ priority: TaskPriority (enum)                     │
│  │   ├─ assignedTo: UserDto                               │
│  │   ├─ createdAt: ISO date                               │
│  │   ├─ updatedAt: ISO date                               │
│  │   ├─ checkItems?: CheckItemDto[]                       │
│  │   └─ ...other fields                                   │
│  │ }                                                       │
│  └─ messageId?: string (which message it's linked from)   │
│                                                            │
│  Error Handling:                                          │
│  • 401 Unauthorized: Show "Please log in again"           │
│  • 403 Forbidden: Show "Access denied"                    │
│  • 404 Not Found: Show "Conversation not found"           │
│  • 500 Server Error: Show "Server error, try again"       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Management Flow

**State Structure (Component Level):**
```typescript
interface ViewAllTasksState {
  // Data from API
  tasks: LinkedTaskDto[];
  
  // UI Filters
  searchTerm: string;
  statusFilters: {
    todo: boolean;
    inProgress: boolean;
    awaiting: boolean;
    done: boolean;
  };
  priorityFilters: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
  
  // Sort & Pagination
  sortBy: 'createdDate' | 'updatedDate' | 'priority' | 'assignee' | 'status';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  pageSize: number; // 10, 20, or 50
  
  // UI States
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}
```

**Derived Data (Computed):**
```typescript
// 1. Apply filters
const filteredBySearch = tasks.filter(t =>
  t.task.title.toLowerCase().includes(searchTerm.toLowerCase())
);

// 2. Apply status & priority filters
const filteredByStatus = filteredBySearch.filter(t =>
  statusFilters[t.task.status.toLowerCase()]
);

const filteredByPriority = filteredByStatus.filter(t =>
  priorityFilters[t.task.priority.toLowerCase()]
);

// 3. Apply sort
const sorted = sortTasks(filteredByPriority, sortBy, sortOrder);

// 4. Apply pagination
const paginated = sorted.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

// Result: paginated is rendered to UI
```

---

## 🚨 Error Scenarios

### Scenario 1: API Fails to Load Tasks

```
User clicks "View All"
  ↓
Modal opens
  ↓
useLinkedTasks hook makes API call:
  GET /api/conversations/{id}/tasks
  ↓
Response: 500 Server Error
  ↓
Modal shows error state:
  ┌─────────────────────────────────────┐
  │ 🔴 Failed to load tasks             │
  │                                     │
  │ Server error. Please try again.     │
  │                                     │
  │ [Retry button]                      │
  └─────────────────────────────────────┘
  ↓
User clicks [Retry]
  ↓
API call retried
  ↓
[Decision: Success now?]
  ├─ YES → Tasks loaded, error removed
  └─ NO → Error persists
           User can close modal and try later
END
```

### Scenario 2: No Tasks Match Filters

```
Modal is open with tasks displayed
  ↓
User filters: Status = "Done" only
  ↓
Filters applied: "Done" only
  ↓
Result: 2 tasks shown (all are Done)
  ↓
User adds priority filter: "High" only
  ↓
Combined filters: Status = "Done" AND Priority = "High"
  ↓
Result: 0 tasks match (no Done + High priority tasks)
  ↓
Modal shows empty state:
  ┌─────────────────────────────────────┐
  │ 📋 No tasks match filters           │
  │                                     │
  │ Try adjusting filters or search     │
  └─────────────────────────────────────┘
  ↓
User clicks checkbox to uncheck "High" priority
  ↓
Filters now: Status = "Done", all priorities
  ↓
Tasks reappear (all Done tasks)
END
```

### Scenario 3: Unauthorized Access

```
User in conversation, clicks "View All"
  ↓
Modal opens, tries to load tasks
  ↓
API response: 401 Unauthorized
  ↓
Modal shows error:
  ┌──────────────────────────────────────┐
  │ 🔐 Access Denied                     │
  │                                      │
  │ Your session may have expired.       │
  │ Please log in again.                 │
  │                                      │
  │ [Retry] [Close]                      │
  └──────────────────────────────────────┘
  ↓
User clicks [Retry]
  ↓
If still 401: Show same message
If 200: Load tasks normally
END
```

---

## ⏳ PENDING FLOW DECISIONS

| #   | Vấn đề            | Lựa chọn        | HUMAN Decision |
| --- | ----------------- | --------------- | -------------- |
| 1   | Load More Type    | Infinite scroll / Load More button? | ✅ **No paginate (update later)**  |
| 2   | Click Task Action | Task detail page / Show preview? | ✅ **Show preview**  |
| 3   | Scroll on Filter  | Reset to top / Keep position? | ✅ **Keep position**  |
| 4   | Search Behavior   | Live filter / Search button? | ✅ **Live filter**  |
| 5   | Close Behavior    | Keep search/filters / Reset all? | ✅ **Reset all**  |

---

## ✅ HUMAN CONFIRMATION

| Item | Status |
|------|--------|
| Đã review user flows (4 main flows) | ✅ Reviewed |
| Đã review data flow architecture | ✅ Reviewed |
| Đã review error scenarios | ✅ Reviewed |
| Đã điền Flow Decisions | ✅ Filled |
| **APPROVED tiến tới BƯỚC 3** | ✅ APPROVED |

**HUMAN Signature:** Khoa  
**Date:** 09012026


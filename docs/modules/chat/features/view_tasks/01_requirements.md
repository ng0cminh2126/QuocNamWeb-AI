# [BƯỚC 1] View All Tasks - Requirements

**Module:** Chat  
**Feature:** View All Tasks  
**Phase:** Requirements & Specifications  
**Created:** 2025-01-09

---

## 📋 Functional Requirements (FR)

### FR-1: View All Tasks Button in LinkedTasksPanel
**Requirement:** Add "View All" button that opens expanded task list view

| Attribute | Details |
|-----------|---------|
| **Trigger** | User clicks "View All" button in LinkedTasksPanel header |
| **Precondition** | LinkedTasksPanel is visible, conversation is loaded |
| **Action** | Open ViewAllTasksModal |
| **Result** | Modal displays all linked tasks with search/filter controls |
| **Postcondition** | Modal can be closed, returns to conversation view |

**Acceptance Criteria:**
- ✅ Button visible when taskCount > 0 in LinkedTasksPanel
- ✅ Button text: "View All (N)" where N = total task count
- ✅ Clicking opens full-screen modal
- ✅ Modal title: "All Tasks (Conversation Name)"

---

### FR-2: Task List Display with Detailed Information
**Requirement:** Show comprehensive task information matching LinkedTaskDto structure

**Displayed Fields:**
| Field | Source | Format | Priority |
|-------|--------|--------|----------|
| Task Title | `task.title` | Text (bold) | 🔴 High |
| Status Badge | `task.status` | Colored pill | 🔴 High |
| Priority | `task.priority` | Color-coded badge | 🔴 High |
| Assigned To | `task.assignedTo` | Name or email | 🟡 Medium |
| Created Date | `task.createdAt` | "2 days ago" format | 🟡 Medium |
| Updated Date | `task.updatedAt` | Tooltip on hover | 🟢 Low |
| Checklist Progress | `task.checkItems` | "3/5 items completed" | 🟢 Low |

**Data Source:**
```
GET /api/conversations/{conversationId}/tasks
Response: LinkedTaskDto[]
```

---

### FR-3: Filtering & Sorting Controls
**Requirement:** Allow users to organize and find tasks quickly

#### Filtering
| Filter | Options | Default | Multi-select? |
|--------|---------|---------|---|
| Status | Todo / In Progress / Awaiting / Done | All checked | Yes |
| Priority | Low / Medium / High / Urgent | All checked | Yes |
| Assigned To | [Dynamic from task.assignedTo] | All | Yes |

#### Sorting
| Sort Option | Order | Apply to |
|-------------|-------|----------|
| Created Date | Newest first | All tasks |
| Updated Date | Newest first | All tasks |
| Priority | High → Low | All tasks |
| Assignee | A-Z alphabetical | All tasks |
| Status | Custom order (todo → done) | All tasks |

**Default Sort:** Based on HUMAN decision (see 00_README.md Decision #3)

---

### FR-4: Search Functionality
**Requirement:** Allow quick task lookup by title/description

| Aspect | Requirement |
|--------|-------------|
| **Search Field** | Text input at top of modal |
| **Placeholder** | "Search tasks..." |
| **Search Target** | Task title + task description (if available) |
| **Behavior** | Real-time filtering as user types |
| **Debounce** | 300ms to avoid excessive re-renders |
| **Case Sensitive** | No (case-insensitive search) |

---

## 🎨 Non-Functional Requirements (NFR)

| Requirement | Specification | Priority |
|-------------|---|----------|
| **Performance** | Load task list in < 500ms for 100 tasks | 🔴 High |
| **Responsiveness** | Modal must work on desktop (1920px) and mobile (375px) | 🔴 High |
| **Accessibility** | WCAG 2.1 AA compliance, keyboard navigation support | 🔴 High |
| **Error Handling** | Show error message if API fails, provide retry button | 🔴 High |
| **Loading State** | Show skeleton loader while fetching | 🟡 Medium |
| **Empty State** | Clear message when no tasks match filters | 🟡 Medium |
| **Scroll Behavior** | Maintain scroll position when toggling filters | 🟡 Medium |

---

## 📐 Business Rules

| Rule | Details | Exception |
|------|---------|-----------|
| **B1: Task Visibility** | Only show tasks linked via /api/conversations/{id}/tasks | None |
| **B2: Completed Tasks** | Based on HUMAN decision: always/collapsible/hidden | HUMAN decides |
| **B3: Real-time Updates** | Do not auto-refresh (Phase 2 feature) | Manual refetch via button |
| **B4: Task Deletion** | If task deleted via Task API, list should refresh on manual refetch | Graceful handling |
| **B5: Permission Check** | Display all tasks user can view (API handles authorization) | Trust API response |

---

## 🎯 User Stories

### Story 1: Quick Task Overview
```
As a team member in a conversation,
I want to see all linked tasks in one view,
So that I can quickly understand what work needs to be done
```
**Acceptance Criteria:**
- Modal shows all tasks at once
- Tasks are grouped logically (by status or priority)
- Can quickly scan task titles

### Story 2: Find Specific Task
```
As a lead managing many tasks,
I want to search and filter tasks,
So that I can find specific tasks without scrolling through all
```
**Acceptance Criteria:**
- Search by title finds task within 1 second
- Status/priority filters work correctly
- Multiple filters can be applied

### Story 3: Mobile Task Review
```
As a mobile user,
I want to view all tasks on my phone,
So that I can stay updated on task progress while away from desk
```
**Acceptance Criteria:**
- Modal adapts to 375px width
- Task information is still readable
- Filters are accessible (not hidden)

---

## 🔗 API Requirements

### Endpoint 1: Get Conversation Tasks
```
GET /api/conversations/{conversationId}/tasks
```
**Use:** Fetch all linked tasks for display

**Response Type:** LinkedTaskDto[]  
**Authentication:** Bearer Token (required)  
**Errors:** 400, 401, 403, 404, 500

### Endpoint 2: Get Conversation Details
```
GET /api/conversations/{id}
```
**Use:** Get conversation name for modal header + members list

**Response:** ConversationDto  
**Authentication:** Bearer Token (required)

### Endpoint 3: Get Task Priorities (optional)
```
GET /api/task-config/priorities
```
**Use:** Populate priority filter dropdown with available options

**Response:** TaskPriorityDto[]  
**Cache:** 1 hour

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề            | Lựa chọn        | HUMAN Decision |
| --- | ----------------- | --------------- | -------------- |
| 1   | Modal Style       | Full modal / Right sidebar? | ✅ **Sidebar**  |
| 2   | Pagination        | Infinite scroll / pages? | ✅ **No paginate, update later**  |
| 3   | Default Sort      | Newest / Priority / Status? | ✅ **Priority then Created date**  |
| 4   | Completed Tasks   | Always / Collapsible / Hidden? | ✅ **Hidden by default**  |
| 5   | Search Debounce   | 300ms (default) / 500ms / 1000ms? | ✅ **300ms (default)**  |

---

## ✅ HUMAN CONFIRMATION

| Item | Status |
|------|--------|
| Đã review tất cả FR | ✅ Reviewed |
| Đã review NFR & Business Rules | ✅ Reviewed |
| Đã điền Pending Decisions | ✅ Filled |
| **APPROVED tiến tới BƯỚC 2A** | ✅ APPROVED |

**HUMAN Signature:** Khoa  
**Date:** 09012026


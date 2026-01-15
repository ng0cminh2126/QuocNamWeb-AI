# [BƯỚC 0] View All Tasks - Feature Overview

**Module:** Chat  
**Feature:** View All Tasks  
**Status:** 📋 Planning Phase (BƯỚC 0-2)  
**Created:** 2025-01-09  
**Last Updated:** 2025-01-09

---

## 📌 Feature Summary

Enhance the **LinkedTasksPanel** component to display all tasks linked to a conversation with expanded capabilities:
- **Current State:** Shows linked tasks in a compact accordion with basic info
- **Enhanced State:** Add "View All" button to open a full-page modal showing detailed task list with filtering, sorting, and expanded information

This feature provides users with a dedicated interface to review all conversation-related tasks without leaving the chat interface.

---

## 🎯 Scope Definition

### In Scope ✅
- "View All" button in LinkedTasksPanel
- Full-screen modal/sidebar with complete task list
- Filtering: By status (todo, in-progress, awaiting, done)
- Sorting: By priority, assignee, created date
- Search: Quick task title search
- Task details display: Title, priority, assignee, status, dates
- Link to task detail page (future enhancement)

### Out of Scope ❌
- Creating new tasks from modal (use "Create Task" feature)
- Real-time task updates via SignalR (Phase 2)
- Task comments/activity in list view (task detail page)
- Bulk actions (select multiple, change status)

---

## 🏗️ Technical Integration

### Related Features
- **Create Task Feature** (`docs/modules/chat/features/create_task/`) - Creates tasks linked to conversation
- **Pinned & Starred Messages** - Similar pattern of expandable list views

### Component Location
- **Component:** `src/features/portal/components/ViewAllTasksModal.tsx` (new)
- **Integration:** Enhance `src/features/portal/components/LinkedTasksPanel.tsx` with button
- **Hook:** Use existing `useLinkedTasks` hook from `src/hooks/queries/useLinkedTasks.ts`

### API Used
- `GET /api/conversations/{conversationId}/tasks` - Fetch all linked tasks
- `GET /api/conversations/{id}` - Get conversation details (members)
- `GET /api/task-config/priorities` - Get priority options (for filtering UI)

### Data Flow
```
ConversationDetailPanel
    ↓
LinkedTasksPanel (with "View All" button)
    ↓
ViewAllTasksModal (new component)
    ↓
useLinkedTasks hook (existing)
    ↓
GET /api/conversations/{id}/tasks API
```

---

## 📊 Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| v1.0 | 2025-01-09 | Initial scope: Basic task list view with filtering | ⏳ PENDING |

---

## 🔗 Reference Documents

| Document | Status | Link |
|----------|--------|------|
| Requirements | 📋 Planning | [01_requirements.md](./01_requirements.md) |
| Wireframe | 🎨 Design | [02a_wireframe.md](./02a_wireframe.md) |
| Flow Diagram | 📈 Design | [02b_flow.md](./02b_flow.md) |
| API Contract | 📡 Spec | [03_api-contract.md](./03_api-contract.md) |
| Implementation Plan | 🛠️ Architecture | [04_implementation-plan.md](./04_implementation-plan.md) |
| Test Requirements | 🧪 Testing | [06_testing.md](./06_testing.md) |

---

## ✅ Key Decisions Required

| # | Decision | Options | Impact | HUMAN Decision |
|---|----------|---------|--------|---|
| 1 | Modal vs Sidebar | Full modal dialog / Right sidebar | UI/UX layout | ⬜ **\_\_\_** |
| 2 | Pagination | Infinite scroll / Pagination with page size | Performance | ⬜ **\_\_\_** |
| 3 | Default Sort | Created date (newest first) / Priority (high first) | UX priority | ⬜ **\_\_\_** |
| 4 | Show completed tasks | Always shown / Collapsible section / Hidden by default | Information density | ⬜ **\_\_\_** |

---

## 📋 IMPACT SUMMARY

### Files Will Create
- `src/features/portal/components/ViewAllTasksModal.tsx` - Full task list modal component (~350 LOC)
- `src/features/portal/components/ViewAllTasksModal.module.css` - Styles (~150 LOC)
- `src/hooks/queries/useViewAllTasks.ts` - Custom hook for task list with filtering (~120 LOC)
- Tests: `src/features/portal/components/__tests__/ViewAllTasksModal.test.tsx` (~200 LOC)

### Files Will Modify
- `src/features/portal/components/LinkedTasksPanel.tsx` - Add "View All" button and modal trigger (~50 LOC changes)

### Files Will Delete
- None

### Dependencies Add
- None (uses existing packages)

---

## ⏳ PENDING DECISIONS

Before proceeding to [BƯỚC 1], HUMAN must confirm:

| #   | Vấn đề            | Lựa chọn        | HUMAN Decision |
| --- | ----------------- | --------------- | -------------- |
| 1   | Modal vs Sidebar  | Full modal / Right sidebar? | ⬜ **\_\_\_**  |
| 2   | Pagination type   | Infinite scroll or pages? | ⬜ **\_\_\_**  |
| 3   | Default sort      | Newest / Priority / Status? | ⬜ **\_\_\_**  |
| 4   | Show completed    | Always / Collapsible / Hidden? | ⬜ **\_\_\_**  |

> ⚠️ **AI KHÔNG ĐƯỢC tiến hành đến BƯỚC 1 nếu các quyết định này chưa được điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status       |
| ------------------------- | ------------ |
| Đã review Feature Summary  | ⬜ Chưa review |
| Đã điền Key Decisions      | ⬜ Chưa điền   |
| **APPROVED để tiến tới BƯỚC 1** | ⬜ CHƯA APPROVED |

**HUMAN Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_  
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_

> ⚠️ **CRITICAL: AI sẽ không tiến hành nếu mục "APPROVED để tiến tới BƯỚC 1" ≠ ✅ APPROVED**


# ✅ Task Module - API Specification

> **Extracted from:** implementation_plan_20251226.md  
> **Last updated:** 2025-12-26

---

## 📡 REST Endpoints

### GET /api/tasks

Lấy danh sách tasks.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `groupId` | string | No | Filter theo nhóm |
| `workTypeId` | string | No | Filter theo loại việc |
| `status` | string | No | Filter theo status (comma-separated) |
| `assigneeId` | string | No | Filter theo người được giao |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |

**Response:**
```typescript
interface TasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

interface Task {
  id: string;
  groupId: string;
  groupName: string;
  workTypeId: string;
  workTypeName: string;
  checklistVariantId?: string;
  checklistVariantName?: string;
  
  sourceMessageId: string;
  sourceMessagePreview?: string;
  
  title: string;
  description?: string;
  
  assigneeId: string;
  assigneeName: string;
  assigneeAvatarUrl?: string;
  
  assignedById: string;
  assignedByName: string;
  
  status: "todo" | "in_progress" | "awaiting_review" | "done";
  priority?: "low" | "normal" | "high" | "urgent";
  
  dueAt?: string;
  isPending?: boolean;
  pendingUntil?: string;
  
  checklist: ChecklistItem[];
  progressPercent: number;
  
  createdAt: string;
  updatedAt: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  doneAt?: string;
  doneById?: string;
  doneByName?: string;
}
```

---

### POST /api/tasks

Tạo task mới.

**Request Body:**
```typescript
interface CreateTaskRequest {
  groupId: string;
  workTypeId: string;
  checklistVariantId?: string;
  sourceMessageId: string;
  title: string;
  description?: string;
  assigneeId: string;
  priority?: "low" | "normal" | "high" | "urgent";
  dueAt?: string;
  checklist?: { label: string }[];
}
```

**Response:** `Task` object

---

### GET /api/tasks/:id

Lấy chi tiết task với history.

**Response:**
```typescript
interface TaskDetailResponse extends Task {
  history: TaskEvent[];
}

interface TaskEvent {
  id: string;
  type: "status_change" | "assignee_change" | "checklist_update" | "comment";
  byId: string;
  byName: string;
  payload: any;
  createdAt: string;
}
```

---

### PATCH /api/tasks/:id

Cập nhật task.

**Request Body:**
```typescript
interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assigneeId?: string;
  status?: "todo" | "in_progress" | "awaiting_review" | "done";
  priority?: "low" | "normal" | "high" | "urgent";
  dueAt?: string;
  isPending?: boolean;
  pendingUntil?: string;
}
```

---

### PATCH /api/tasks/:id/checklist/:itemId

Toggle checklist item.

**Request Body:**
```typescript
interface UpdateChecklistItemRequest {
  done: boolean;
}
```

---

### POST /api/tasks/:id/checklist

Thêm checklist item mới.

**Request Body:**
```typescript
interface AddChecklistItemRequest {
  label: string;
}
```

---

## 📝 Task Log Endpoints

### GET /api/tasks/:taskId/logs

Lấy nhật ký công việc của task.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `before` | string | Log ID để paginate |
| `limit` | number | Số lượng (default: 50) |

**Response:**
```typescript
interface TaskLogsResponse {
  data: TaskLogMessage[];
  hasMore: boolean;
}

interface TaskLogMessage {
  id: string;
  taskId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  type: "text" | "image" | "file" | "system";
  content?: string;
  files?: FileAttachment[];
  replyToId?: string;
  createdAt: string;
}
```

### POST /api/tasks/:taskId/logs

Gửi message vào nhật ký.

**Request Body:**
```typescript
interface SendTaskLogRequest {
  type: "text" | "image" | "file";
  content?: string;
  fileIds?: string[];
  replyToId?: string;
}
```

---

## 📊 Query Keys

```typescript
export const tasksKeys = {
  all: ['tasks'] as const,
  lists: () => [...tasksKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => 
    [...tasksKeys.lists(), filters] as const,
  details: () => [...tasksKeys.all, 'detail'] as const,
  detail: (id: string) => [...tasksKeys.details(), id] as const,
  logs: (taskId: string) => [...tasksKeys.all, 'logs', taskId] as const,
};
```

---

## 📋 Implementation Checklist

- [ ] `src/api/tasks.api.ts` - API client functions
- [ ] `src/hooks/queries/useTasks.ts` - Tasks list hook
- [ ] `src/hooks/queries/useTaskDetail.ts` - Task detail hook
- [ ] `src/hooks/queries/useTaskLogs.ts` - Task logs hook
- [ ] `src/hooks/mutations/useCreateTask.ts` - Create mutation
- [ ] `src/hooks/mutations/useUpdateTask.ts` - Update mutation
- [ ] `src/hooks/mutations/useUpdateChecklist.ts` - Checklist mutation
- [ ] `src/hooks/mutations/useSendTaskLog.ts` - Task log mutation
- [ ] Integrate `RightPanel.tsx`
- [ ] Integrate `AssignTaskSheet.tsx`
- [ ] Integrate `TaskChecklist.tsx`
- [ ] Integrate `TaskLogThreadSheet.tsx`

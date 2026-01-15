# [BƯỚC 3] API Contracts - Create Task Feature

## API Overview

| API | Method | Endpoint | Purpose | Auth |
| --- | ------ | -------- | ------- | ---- |
| Task Config - Priorities | GET | `/api/task-config/priorities` | Get available task priorities | Yes |
| Checklist Templates | GET | `/api/checklist-templates` | Get available templates | Yes |
| Conversation Members | GET | `/api/conversations/{conversationId}` | Get group members | Yes |
| Create Task | POST | `/api/tasks` | Create new task | Yes |

---

## API Contract 1: Get Task Priorities

**Status:** ⏳ PENDING (need snapshot)

### Request

```http
GET /api/task-config/priorities HTTP/1.1
Authorization: Bearer {token}
Accept: application/json
```

### Response (200 OK)

```json
[
  {
    "id": "uuid",
    "name": "Low",
    "description": "Low priority task",
    "color": "#10b981",
    "displayOrder": 1
  },
  {
    "id": "uuid",
    "name": "Medium",
    "description": "Medium priority task",
    "color": "#f59e0b",
    "displayOrder": 2
  },
  {
    "id": "uuid",
    "name": "High",
    "description": "High priority task",
    "color": "#ef4444",
    "displayOrder": 3
  }
]
```

### TypeScript Interface

```typescript
interface TaskPriorityDto {
  id: string;
  name: string;
  description?: string;
  color: string;
  displayOrder: number;
}
```

**Snapshot:** See `snapshots/v1/task-priorities.json`

---

## API Contract 2: Get Checklist Templates

**Status:** ⏳ PENDING (need snapshot)

### Request

```http
GET /api/checklist-templates HTTP/1.1
Authorization: Bearer {token}
Accept: application/json
```

### Response (200 OK)

```json
[
  {
    "id": "uuid",
    "name": "Daily Standup",
    "description": "Template for daily standup tasks",
    "items": [
      {
        "id": "uuid",
        "content": "Update status",
        "displayOrder": 1
      },
      {
        "id": "uuid",
        "content": "Mention blockers",
        "displayOrder": 2
      }
    ],
    "createdAt": "2026-01-09T10:00:00Z"
  },
  {
    "id": "uuid",
    "name": "Code Review",
    "description": "Template for code review tasks",
    "items": [...]
  }
]
```

### TypeScript Interface

```typescript
interface TemplateItemDto {
  id: string;
  content: string;
  displayOrder: number;
}

interface CheckListTemplateResponse {
  id: string;
  name: string;
  description?: string;
  items: TemplateItemDto[];
  createdAt: string;
}
```

**Snapshot:** See `snapshots/v1/checklist-templates.json`

---

## API Contract 3: Get Conversation Members (Group Members)

**Status:** ⏳ PENDING (need snapshot)

### Request

```http
GET /api/conversations/{conversationId} HTTP/1.1
Authorization: Bearer {token}
Accept: application/json
```

**Path Parameters:**
- `conversationId` (uuid): The conversation/group ID

### Response (200 OK)

```json
{
  "id": "uuid",
  "name": "Development Team",
  "members": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://...",
      "role": "Member"
    },
    {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "avatarUrl": "https://...",
      "role": "Admin"
    }
  ]
}
```

### TypeScript Interface

```typescript
interface MemberDto {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

interface ConversationDto {
  id: string;
  name: string;
  members: MemberDto[];
}
```

**Snapshot:** See `snapshots/v1/conversation-members.json`

---

## API Contract 4: Create Task

**Status:** ⏳ PENDING (need snapshot)

### Request

```http
POST /api/tasks HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

### Request Body

```json
{
  "title": "Fix login button styling",
  "description": null,
  "priorityId": "uuid-of-priority",
  "statusId": "uuid-of-todo-status",
  "assignedToId": "uuid-of-user",
  "checklistTemplateId": "uuid-or-null",
  "conversationId": "uuid-of-conversation",
  "conversationLinkType": "Related"
}
```

### TypeScript Interface

```typescript
interface CreateTaskRequest {
  title: string;
  description?: string | null;
  priorityId: string;
  statusId: string;
  assignedToId: string;
  checklistTemplateId?: string | null;
  conversationId: string;
  conversationLinkType?: string;
}
```

### Response (201 Created)

```json
{
  "id": "uuid",
  "title": "Fix login button styling",
  "description": null,
  "priorityId": "uuid",
  "statusId": "uuid",
  "assignedToId": "uuid",
  "checklistTemplateId": null,
  "conversationId": "uuid",
  "createdBy": "uuid",
  "createdAt": "2026-01-09T10:30:00Z",
  "updatedAt": "2026-01-09T10:30:00Z"
}
```

### TypeScript Interface (Response)

```typescript
interface TaskDetailResponse {
  id: string;
  title: string;
  description?: string | null;
  priorityId: string;
  statusId: string;
  assignedToId: string;
  checklistTemplateId?: string | null;
  conversationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

**Snapshot:** See `snapshots/v1/create-task-success.json`

---

## Error Responses

### 400 Bad Request

```json
{
  "type": "https://...",
  "title": "Invalid request",
  "status": 400,
  "detail": "Title is required and must be between 1-255 characters",
  "instance": "/api/tasks"
}
```

### 401 Unauthorized

```json
{
  "type": "https://...",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "type": "https://...",
  "title": "Not found",
  "status": 404,
  "detail": "Conversation or user not found"
}
```

---

## Implementation Notes

### Auto-Fill Logic for Task Title

```typescript
function getTaskNameFromMessage(message: Message): string {
  // 1. If has text content
  if (message.content && message.content.trim()) {
    return message.content.substring(0, 255);
  }

  // 2. If only attachments, use first filename
  if (message.attachments && message.attachments.length > 0) {
    const filename = message.attachments[0].fileName;
    return filename.substring(0, 255);
  }

  // 3. Empty
  return "";
}
```

### Status Lookup (Todo)

Need to fetch all statuses and find "Todo":

```typescript
async function getTodoStatusId(): Promise<string> {
  const statuses = await getTaskStatuses();
  const todoStatus = statuses.find(s => s.name === "Todo");
  return todoStatus?.id || "";
}
```

---

## Snapshots Location

- `snapshots/v1/task-priorities.json`
- `snapshots/v1/checklist-templates.json`
- `snapshots/v1/conversation-members.json`
- `snapshots/v1/create-task-success.json`
- `snapshots/v1/create-task-error-400.json`

---

## ⏳ PENDING DECISIONS

| # | Item | Decision |
| - | ---- | -------- |
| 1 | Link type when creating task | "Related" or "Subtask"? | ⬜ \_\_\_ |
| 2 | Include description field | Yes or No? | ⬜ \_\_\_ |
| 3 | Auto-detect Todo status | By name "Todo" or need config? | ⬜ \_\_\_ |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status   |
| ------------------------- | -------- |
| Đã review API Contracts   | ⬜ Chưa  |
| Đã có snapshots           | ⬜ Chưa  |
| **APPROVED để thực thi**  | ⬜ Chưa  |

**HUMAN Signature:** [\_\_\_\_\_\_\_\_\_]  
**Date:** [\_\_\_\_\_\_\_\_\_]

> ⚠️ **CRITICAL:** Cannot proceed with implementation until:
> 1. All API contracts are finalized
> 2. Actual snapshots are provided (from running APIs)
> 3. This section is marked ✅ APPROVED

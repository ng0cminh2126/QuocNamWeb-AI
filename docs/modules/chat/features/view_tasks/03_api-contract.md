# [BƯỚC 3] View All Tasks - API Contract

**Module:** Chat  
**Feature:** View All Tasks  
**Phase:** API Specification  
**Created:** 2025-01-09

---

## 📡 API Overview

The **View All Tasks** feature uses existing APIs from the Task and Chat modules:

| Endpoint | Method | Purpose | Auth | Status |
|----------|--------|---------|------|--------|
| `/api/conversations/{id}/tasks` | GET | Fetch all linked tasks | Bearer | ✅ Exists |
| `/api/conversations/{id}` | GET | Get conversation name for header | Bearer | ✅ Exists |
| `/api/task-config/priorities` | GET | Get priority options for filters | Bearer | ✅ Exists |

---

## 🔌 Endpoint 1: Get Conversation Tasks

### Overview Table

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/conversations/{conversationId}/tasks` |
| **Base URL** | `https://api.domain.com` |
| **Auth Required** | Yes (Bearer Token) |
| **Rate Limit** | N/A |
| **Response Time** | < 500ms (for 100 tasks) |
| **Source** | Chat_Swagger.json: `/api/conversations/{id}/tasks` |

### Request

**Path Parameters:**
```typescript
{
  conversationId: string (UUID format)
}
```

**Example Request:**
```bash
curl -X GET "https://api.domain.com/api/conversations/550e8400-e29b-41d4-a716-446655440000/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Request Headers:**
```typescript
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Response - Success (200 OK)

**Data Type:** `LinkedTaskDto[]`

**TypeScript Interface:**
```typescript
interface LinkedTaskDto {
  taskId: string;                    // UUID of the task
  task: {
    id: string;
    title: string;                   // Task title (searchable)
    description?: string;            // Task description
    status: TaskStatus;              // 'todo' | 'in_progress' | 'awaiting_review' | 'done'
    priority: TaskPriority;          // 'low' | 'medium' | 'high' | 'urgent'
    assignedTo?: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    createdAt: string;               // ISO 8601 date
    updatedAt: string;               // ISO 8601 date
    dueDate?: string;                // Optional due date
    checkItems?: {
      id: string;
      title: string;
      completed: boolean;
      order: number;
    }[];
    workTypeId?: string;             // Related work type
  };
  messageId?: string;                // Message ID if linked from message
  linkType?: string;                 // How task is linked
}
```

**Example Response:**
```json
[
  {
    "taskId": "task-001",
    "task": {
      "id": "task-001",
      "title": "Implement API integration",
      "description": "Integrate payment gateway API",
      "status": "in_progress",
      "priority": "high",
      "assignedTo": {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatars/john.jpg"
      },
      "createdAt": "2025-01-07T14:30:00Z",
      "updatedAt": "2025-01-09T10:15:00Z",
      "dueDate": "2025-01-15T23:59:59Z",
      "checkItems": [
        {
          "id": "check-1",
          "title": "Create API client",
          "completed": true,
          "order": 1
        },
        {
          "id": "check-2",
          "title": "Implement endpoints",
          "completed": true,
          "order": 2
        },
        {
          "id": "check-3",
          "title": "Write tests",
          "completed": false,
          "order": 3
        }
      ],
      "workTypeId": "wt-backend"
    },
    "messageId": "msg-456",
    "linkType": "conversation"
  },
  {
    "taskId": "task-002",
    "task": {
      "id": "task-002",
      "title": "Write documentation",
      "status": "todo",
      "priority": "medium",
      "assignedTo": {
        "id": "user-456",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2025-01-09T08:00:00Z",
      "updatedAt": "2025-01-09T08:00:00Z",
      "checkItems": []
    },
    "messageId": null
  }
]
```

### Response - Error Cases

**400 Bad Request**
```json
{
  "type": "https://api.domain.com/errors/bad-request",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid conversationId format",
  "traceId": "00-trace-id-00"
}
```
**When:** conversationId is not valid UUID format

**401 Unauthorized**
```json
{
  "type": "https://api.domain.com/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid or expired token",
  "traceId": "00-trace-id-00"
}
```
**When:** Bearer token missing, invalid, or expired

**403 Forbidden**
```json
{
  "type": "https://api.domain.com/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "You don't have access to this conversation",
  "traceId": "00-trace-id-00"
}
```
**When:** User not member of conversation or doesn't have read permission

**404 Not Found**
```json
{
  "type": "https://api.domain.com/errors/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "Conversation not found",
  "traceId": "00-trace-id-00"
}
```
**When:** conversationId doesn't exist

**500 Internal Server Error**
```json
{
  "type": "https://api.domain.com/errors/server-error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred",
  "traceId": "00-trace-id-00"
}
```
**When:** Server-side error

---

## 🔌 Endpoint 2: Get Conversation Details

### Overview Table

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/conversations/{id}` |
| **Purpose** | Get conversation name and members for modal header |
| **Auth Required** | Yes (Bearer Token) |
| **Source** | Chat_Swagger.json: `/api/conversations/{id}` |

### Request

```bash
GET /api/conversations/{conversationId}
```

### Response - Success (200 OK)

**TypeScript Interface:**
```typescript
interface ConversationDto {
  id: string;
  name: string;                    // Used in modal title
  description?: string;
  type: 'dm' | 'group';
  members: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'owner' | 'admin' | 'member';
  }[];
  createdAt: string;
  updatedAt: string;
}
```

**Example Response:**
```json
{
  "id": "conv-123",
  "name": "Engineering Team",
  "description": "Team discussions",
  "type": "group",
  "members": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "owner"
    },
    {
      "id": "user-456",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "member"
    }
  ],
  "createdAt": "2024-12-01T10:00:00Z",
  "updatedAt": "2025-01-09T15:30:00Z"
}
```

---

## 🔌 Endpoint 3: Get Task Priorities (Optional)

### Overview Table

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/task-config/priorities` |
| **Purpose** | Get priority options for filter UI dropdown |
| **Auth Required** | Yes (Bearer Token) |
| **Cache** | 1 hour (safe to cache) |
| **Source** | Task_Swagger.json: `/api/task-config/priorities` |

### Response - Success (200 OK)

**TypeScript Interface:**
```typescript
interface TaskPriorityDto {
  id: string;
  name: string;        // 'Low', 'Medium', 'High', 'Urgent'
  displayName: string;
  color?: string;      // Hex color code
  order: number;       // Sort order
}
```

**Example Response:**
```json
[
  {
    "id": "low",
    "name": "Low",
    "displayName": "Low Priority",
    "color": "#10B981",
    "order": 1
  },
  {
    "id": "medium",
    "name": "Medium",
    "displayName": "Medium Priority",
    "color": "#F59E0B",
    "order": 2
  },
  {
    "id": "high",
    "name": "High",
    "displayName": "High Priority",
    "color": "#EA580C",
    "order": 3
  },
  {
    "id": "urgent",
    "name": "Urgent",
    "displayName": "Urgent Priority",
    "color": "#DC2626",
    "order": 4
  }
]
```

---

## 🔄 API Usage in Component

**Implementation Pattern (Pseudo-code):**

```typescript
// In ViewAllTasksModal.tsx or custom hook useViewAllTasks()

// 1. Fetch linked tasks
const { data: linkedTasks, isLoading, isError } = useQuery({
  queryKey: ['linkedTasks', conversationId],
  queryFn: () => axios.get(`/api/conversations/${conversationId}/tasks`),
  staleTime: 1000 * 30,  // 30 seconds
});

// 2. Fetch conversation details
const { data: conversation } = useQuery({
  queryKey: ['conversation', conversationId],
  queryFn: () => axios.get(`/api/conversations/${conversationId}`),
  staleTime: 1000 * 60,  // 1 minute
});

// 3. Fetch priority config (cache for app lifetime)
const { data: priorities } = useQuery({
  queryKey: ['taskPriorities'],
  queryFn: () => axios.get(`/api/task-config/priorities`),
  staleTime: 1000 * 60 * 60,  // 1 hour
});

// 4. Use in UI
<h2>{conversation?.name} - All Tasks</h2>
<TaskList tasks={linkedTasks} priorities={priorities} />
```

---

## 📊 Validation Rules

**For LinkedTaskDto:**

| Field | Validation | Example |
|-------|-----------|---------|
| `taskId` | UUID format | `550e8400-e29b-41d4-a716-446655440000` |
| `task.title` | String, 1-255 chars | "Implement API integration" |
| `task.status` | Enum: todo / in_progress / awaiting_review / done | "in_progress" |
| `task.priority` | Enum: low / medium / high / urgent | "high" |
| `task.assignedTo.email` | Valid email format | "john@example.com" |
| `task.createdAt` | ISO 8601 UTC date | "2025-01-09T14:30:00Z" |

---

## 📡 Related API Documentation

| Endpoint | Reference |
|----------|-----------|
| Get Conversation Tasks | Task_Swagger.json: `/api/conversations/{conversationId}/tasks` |
| Get Conversation Details | Chat_Swagger.json: `/api/conversations/{id}` |
| Get Task Priorities | Task_Swagger.json: `/api/task-config/priorities` |

---

## ✅ API Readiness Checklist

| Item | Status |
|------|--------|
| Endpoint 1 documented | ✅ Done |
| Endpoint 2 documented | ✅ Done |
| Endpoint 3 documented | ✅ Done |
| TypeScript interfaces | ✅ Done |
| Error responses defined | ✅ Done |
| Example responses provided | ✅ Done |
| **Ready for implementation** | ⬜ Pending HUMAN approval |

---

## ⏳ PENDING API DECISIONS

| #   | Vấn đề            | Lựa chọn        | HUMAN Decision |
| --- | ----------------- | --------------- | -------------- |
| 1   | Pagination API    | Server-side (limit/offset) or client-side? | ✅ **Client-side (no paginate v1)**  |
| 2   | Task Permissions  | API handles or frontend validates? | ✅ **API handles**  |
| 3   | Real-time Updates | WebSocket/SignalR subscribe needed? | ✅ **No (Phase 2)**  |

---

## ✅ HUMAN CONFIRMATION

| Item | Status |
|------|--------|
| Đã review API endpoints | ✅ Reviewed |
| Đã review TypeScript interfaces | ✅ Reviewed |
| Đã review error responses | ✅ Reviewed |
| Đã điền API Decisions | ✅ Filled |
| **APPROVED tiến tới BƯỚC 4** | ✅ APPROVED |

**HUMAN Signature:** Khoa  
**Date:** 09012026


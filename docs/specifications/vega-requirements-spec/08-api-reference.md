# 8. API Reference

## 8.1 API Overview

### Base URLs

| Environment | Service | Base URL |
|-------------|---------|----------|
| **Development** | Chat API | `https://vega-chat-api-dev.allianceitsc.com` |
| | Identity API | `https://vega-identity-api-dev.allianceitsc.com` |
| | Task API | `https://vega-task-api-dev.allianceitsc.com` |
| | File API | `https://vega-file-api-dev.allianceitsc.com` |
| **Production** | Chat API | `https://vega-chat-api-prod.allianceitsc.com` |
| | Identity API | `https://vega-identity-api-prod.allianceitsc.com` |
| | Task API | `https://vega-task-api-prod.allianceitsc.com` |
| | File API | `https://vega-file-api-prod.allianceitsc.com` |

### Authentication

All API requests (except `/api/auth/login`) require Bearer token:

```http
Authorization: Bearer <accessToken>
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Success, no response body |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 413 | Payload Too Large | File size exceeded |
| 415 | Unsupported Media Type | Invalid file type |
| 500 | Internal Server Error | Server error |

---

## 8.2 Authentication API

### 8.2.1 Login

**POST** `/api/auth/login`

**Request:**
```json
{
  "identifier": "john_doe",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "requiresMfa": false,
  "mfaToken": null,
  "mfaMethod": null,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "identifier": "john_doe",
    "roles": ["Staff", "Leader"]
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "errorCode": "INVALID_CREDENTIALS",
  "message": "Invalid username or password",
  "timestamp": "2026-01-26T10:30:00Z"
}
```

---

## 8.3 Chat API

### 8.3.1 Get Groups

**GET** `/api/groups`

**Query Parameters:**
- `cursor` (string, optional): Pagination cursor

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Team Alpha",
      "type": "Group",
      "lastMessage": {
        "content": "Hello team",
        "sentAt": "2026-01-26T10:30:00Z",
        "senderName": "john_doe"
      },
      "unreadCount": 3,
      "memberCount": 5,
      "createdAt": "2026-01-20T08:00:00Z"
    }
  ],
  "nextCursor": "...",
  "hasMore": true
}
```

### 8.3.2 Get Messages

**GET** `/api/conversations/{conversationId}/messages`

**Query Parameters:**
- `limit` (integer, optional): Messages per page (default: 50, max: 100)
- `beforeMessageId` (UUID, optional): Load older messages

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440222",
      "conversationId": "550e8400-e29b-41d4-a716-446655440000",
      "senderId": "880e8400-e29b-41d4-a716-446655440333",
      "senderName": "john_doe",
      "senderFullName": "John Doe",
      "content": "Hello team",
      "contentType": "TXT",
      "sentAt": "2026-01-26T10:30:00Z",
      "editedAt": null,
      "attachments": [],
      "isPinned": false,
      "isStarred": false,
      "linkedTaskId": null,
      "parentMessageId": null,
      "replyCount": 0
    }
  ],
  "nextCursor": "770e8400-e29b-41d4-a716-446655440222",
  "hasMore": true
}
```

### 8.3.3 Send Message

**POST** `/api/messages`

**Request:**
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hello team",
  "messageType": "TXT",
  "parentMessageId": null,
  "attachments": []
}
```

**Response (200 OK):** Returns `ChatMessage` object

### 8.3.4 Edit Message

**PUT** `/api/messages/{messageId}`

**Request:**
```json
{
  "content": "Updated message content"
}
```

**Response (200 OK):** Returns updated `ChatMessage`

### 8.3.5 Delete Message

**DELETE** `/api/messages/{messageId}`

**Response (204 No Content)**

### 8.3.6 Link Task to Message

**PATCH** `/api/messages/{messageId}/link-task`

**Request:**
```json
{
  "taskId": "990e8400-e29b-41d4-a716-446655440444"
}
```

**Response (200 OK):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440222",
  "taskId": "990e8400-e29b-41d4-a716-446655440444",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Task linked",
  "contentType": "TASK",
  "sender": {
    "id": "880e8400-e29b-41d4-a716-446655440333",
    "name": "john_doe"
  },
  "createdAt": "2026-01-26T10:30:00Z"
}
```

### 8.3.7 Pin/Unpin Message

**POST** `/api/conversations/{conversationId}/messages/{messageId}/pin`

**Response (204 No Content)**

**DELETE** `/api/conversations/{conversationId}/messages/{messageId}/pin`

**Response (204 No Content)**

### 8.3.8 Get Pinned Messages

**GET** `/api/conversations/{conversationId}/pinned-messages`

**Response (200 OK):**
```json
[
  {
    "id": "...",
    "conversationId": "...",
    "content": "Important message",
    ...
  }
]
```

### 8.3.9 Star/Unstar Message

**POST** `/api/messages/{messageId}/star`

**Response (204 No Content)**

**DELETE** `/api/messages/{messageId}/star`

**Response (204 No Content)**

### 8.3.10 Get Conversations

**GET** `/api/conversations`

**Query Parameters:**
- `cursor` (string, optional): Pagination cursor

**Response:** Similar to Get Groups

### 8.3.11 Mark Conversation as Read

**POST** `/api/conversations/{conversationId}/mark-read`

**Request (optional):**
```json
{
  "messageId": "770e8400-e29b-41d4-a716-446655440222"
}
```

**Response (204 No Content)**

---

## 8.4 Group Management API

### 8.4.1 Get Group Members

**GET** `/api/groups/{groupId}/members`

**Response (200 OK):**
```json
[
  {
    "userId": "880e8400-e29b-41d4-a716-446655440333",
    "userName": "john_doe",
    "role": "OWN",
    "joinedAt": "2026-01-20T08:00:00Z",
    "isMuted": false,
    "userInfo": {
      "id": "880e8400-e29b-41d4-a716-446655440333",
      "userName": "john_doe",
      "fullName": "John Doe",
      "identifier": "john_doe",
      "roles": "Staff,Leader",
      "email": "john@example.com",
      "avatarUrl": null
    }
  }
]
```

### 8.4.2 Add Group Member

**POST** `/api/groups/{groupId}/members`

**Request:**
```json
{
  "userId": "990e8400-e29b-41d4-a716-446655440555"
}
```

**Response (200 OK):** Returns `MemberDto`

**Error (400 Bad Request):**
```json
{
  "errorCode": "MEMBER_ALREADY_EXISTS",
  "message": "User is already a member of this group"
}
```

### 8.4.3 Remove Group Member

**DELETE** `/api/groups/{groupId}/members/{userId}`

**Response (204 No Content)**

**Error (400 Bad Request):**
```json
{
  "errorCode": "CANNOT_REMOVE_OWNER",
  "message": "Cannot remove group owner"
}
```

### 8.4.4 Promote Member to Admin

**POST** `/api/groups/{groupId}/members/{userId}/promote`

**Response (200 OK):**
```json
{
  "message": "Member promoted successfully",
  "userId": "990e8400-e29b-41d4-a716-446655440555",
  "newRole": "ADM"
}
```

**Error (403 Forbidden):**
```json
{
  "errorCode": "INSUFFICIENT_PERMISSIONS",
  "message": "Only group owner can promote members"
}
```

### 8.4.5 Get Conversation Members

**GET** `/api/conversations/{conversationId}/members`

**Response (200 OK):** Array of members (same structure as group members)

---

## 8.5 Task API

### 8.5.1 Get Task Priorities

**GET** `/api/task-config/priorities`

**Response (200 OK):**
```json
[
  {
    "id": "1",
    "name": "Low",
    "code": "low",
    "order": 1
  },
  {
    "id": "2",
    "name": "Normal",
    "code": "normal",
    "order": 2
  },
  {
    "id": "3",
    "name": "High",
    "code": "high",
    "order": 3
  },
  {
    "id": "4",
    "name": "Urgent",
    "code": "urgent",
    "order": 4
  }
]
```

### 8.5.2 Get Task Statuses

**GET** `/api/task-config/statuses`

**Response (200 OK):**
```json
[
  {
    "id": "1",
    "name": "To Do",
    "code": "todo",
    "order": 1
  },
  {
    "id": "2",
    "name": "Doing",
    "code": "doing",
    "order": 2
  },
  {
    "id": "3",
    "name": "Need to Verify",
    "code": "need_to_verified",
    "order": 3
  },
  {
    "id": "4",
    "name": "Finished",
    "code": "finished",
    "order": 4
  }
]
```

### 8.5.3 Get Checklist Templates

**GET** `/api/checklist-templates`

**Response (200 OK):**
```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440666",
    "name": "Standard Task Checklist",
    "description": "Default checklist for tasks",
    "items": [
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440777",
        "content": "Review requirements",
        "order": 1
      },
      {
        "id": "cc0e8400-e29b-41d4-a716-446655440888",
        "content": "Complete implementation",
        "order": 2
      }
    ],
    "isDefault": true
  }
]
```

### 8.5.4 Create Task

**POST** `/api/tasks`

**Request:**
```json
{
  "title": "Fix login bug",
  "description": "Users cannot login with special characters in password",
  "priority": "high",
  "assignTo": "990e8400-e29b-41d4-a716-446655440555",
  "dueDate": "2026-01-30T23:59:59Z",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "messageId": "770e8400-e29b-41d4-a716-446655440222",
  "workTypeId": "dd0e8400-e29b-41d4-a716-446655440999",
  "checklistTemplateId": "aa0e8400-e29b-41d4-a716-446655440666"
}
```

**Response (200 OK):**
```json
{
  "id": "ee0e8400-e29b-41d4-a716-446655441000",
  "title": "Fix login bug",
  "description": "Users cannot login with special characters in password",
  "status": "todo",
  "priority": "high",
  "assignTo": {
    "id": "990e8400-e29b-41d4-a716-446655440555",
    "name": "jane_smith"
  },
  "assignFrom": {
    "id": "880e8400-e29b-41d4-a716-446655440333",
    "name": "john_doe"
  },
  "dueDate": "2026-01-30T23:59:59Z",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "messageId": "770e8400-e29b-41d4-a716-446655440222",
  "workType": {
    "id": "dd0e8400-e29b-41d4-a716-446655440999",
    "name": "Bug Fix"
  },
  "checkList": [
    {
      "id": "ff0e8400-e29b-41d4-a716-446655441111",
      "content": "Review requirements",
      "isCompleted": false,
      "order": 1
    },
    {
      "id": "100e8400-e29b-41d4-a716-446655441222",
      "content": "Complete implementation",
      "isCompleted": false,
      "order": 2
    }
  ],
  "createdAt": "2026-01-26T10:30:00Z",
  "updatedAt": "2026-01-26T10:30:00Z"
}
```

### 8.5.5 Get Tasks

**GET** `/api/tasks`

**Query Parameters:**
- `userTask` (string, optional): Filter by user relationship
  - `assigned`: Tasks assigned to me
  - `created`: Tasks I created
  - `related`: Tasks I'm involved in
- `conversationId` (UUID, optional): Filter by conversation
- `messageId` (UUID, optional): Filter by message

**Response (200 OK):** Array of `TaskDetailResponse`

### 8.5.6 Get Linked Tasks

**GET** `/api/conversations/{conversationId}/tasks`

**Response (200 OK):**
```json
{
  "tasks": [
    {
      "id": "ee0e8400-e29b-41d4-a716-446655441000",
      "title": "Fix login bug",
      "status": "doing",
      ...
    }
  ]
}
```

### 8.5.7 Get Task Details

**GET** `/api/tasks/{taskId}`

**Response (200 OK):** Returns `TaskDetailResponse`

### 8.5.8 Update Task Status

**PATCH** `/api/tasks/{taskId}/status`

**Request:**
```json
{
  "status": "doing"
}
```

**Response (204 No Content)**

**Valid Status Values:**
- `todo`
- `doing`
- `need_to_verified`
- `finished`

### 8.5.9 Add Checklist Item

**POST** `/api/tasks/{taskId}/check-items`

**Request:**
```json
{
  "content": "Write unit tests",
  "order": 3
}
```

**Response (204 No Content)**

### 8.5.10 Toggle Checklist Item

**PATCH** `/api/tasks/{taskId}/check-items/{itemId}/toggle`

**Response (204 No Content)**

- If `isCompleted: false`, sets to `true`
- If `isCompleted: true`, sets to `false`

---

## 8.6 File API

### 8.6.1 Upload Single File

**POST** `/api/Files?sourceModule={module}&sourceEntityId={entityId}`

**Content-Type:** `multipart/form-data`

**Query Parameters:**
- `sourceModule` (integer, required): Source module
  - `0`: Task
  - `1`: Chat
  - `2`: Company
  - `3`: User
- `sourceEntityId` (UUID, optional): Source entity ID (e.g., conversationId)

**Request Body:**
```
file: [Binary file data]
```

**Response (200 OK):**
```json
{
  "fileId": "660e8400-e29b-41d4-a716-446655440111",
  "fileName": "document.pdf",
  "fileSize": 1048576,
  "contentType": "application/pdf",
  "uploadedAt": "2026-01-26T10:30:00Z"
}
```

**Error (413 Payload Too Large):**
```json
{
  "errorCode": "FILE_TOO_LARGE",
  "message": "File size exceeds maximum allowed (10MB)"
}
```

### 8.6.2 Upload Multiple Files (Batch)

**POST** `/api/Files/batch?sourceModule={module}&sourceEntityId={entityId}`

**Content-Type:** `multipart/form-data`

**Request Body:**
```
files: [Binary file 1]
files: [Binary file 2]
...
```

**Constraints:**
- Minimum 2 files
- Maximum 10 files
- Total size < 50MB (configurable)

**Response (200 OK):**
```json
{
  "allSuccess": true,
  "partialSuccess": false,
  "totalFiles": 3,
  "successCount": 3,
  "failedCount": 0,
  "results": [
    {
      "success": true,
      "fileId": "660e8400-e29b-41d4-a716-446655440111",
      "fileName": "doc1.pdf",
      "error": null
    },
    {
      "success": true,
      "fileId": "670e8400-e29b-41d4-a716-446655440112",
      "fileName": "doc2.pdf",
      "error": null
    },
    {
      "success": true,
      "fileId": "680e8400-e29b-41d4-a716-446655440113",
      "fileName": "doc3.pdf",
      "error": null
    }
  ]
}
```

### 8.6.3 Get Watermarked Thumbnail

**GET** `/api/Files/{fileId}/watermarked-thumbnail?size={size}`

**Query Parameters:**
- `size` (string, optional): Thumbnail size
  - `small`: 200px
  - `medium`: 300px
  - `large`: 400px (default)

**Response (200 OK):**
- Content-Type: `image/jpeg` or `image/png`
- Body: Binary image data

### 8.6.4 Get Watermarked Preview

**GET** `/api/Files/{fileId}/preview`

**Response (200 OK):**
- Content-Type: Depends on file type
- Body: Binary file data with watermark

---

## 8.7 SignalR Hub

### Connection URL

`{chatApiUrl}/hubs/chat`

**Example:** `wss://vega-chat-api-dev.allianceitsc.com/hubs/chat`

### Authentication

Use `accessTokenFactory` in SignalR connection options:

```typescript
new HubConnectionBuilder()
  .withUrl(`${apiUrl}/hubs/chat`, {
    accessTokenFactory: () => accessToken
  })
  .build();
```

### Hub Methods (Client → Server)

**JoinConversation:**
```typescript
connection.invoke("JoinConversation", conversationId: string)
```

**LeaveConversation:**
```typescript
connection.invoke("LeaveConversation", conversationId: string)
```

**SendTyping:**
```typescript
connection.invoke("SendTyping", conversationId: string, isTyping: boolean)
```

### Hub Events (Server → Client)

**MessageSent:**
```typescript
connection.on("MessageSent", (event: {
  conversationId: string;
  message: ChatMessage;
}) => {
  // Handle new message
});
```

**MessageUpdated:**
```typescript
connection.on("MessageUpdated", (event: {
  conversationId: string;
  message: ChatMessage;
}) => {
  // Handle message edit
});
```

**MessageDeleted:**
```typescript
connection.on("MessageDeleted", (event: {
  conversationId: string;
  messageId: string;
}) => {
  // Handle message deletion
});
```

**UserTyping:**
```typescript
connection.on("UserTyping", (event: {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}) => {
  // Handle typing indicator
});
```

**ConversationUpdated:**
```typescript
connection.on("ConversationUpdated", (event: {
  conversationId: string;
  // Additional fields
}) => {
  // Handle conversation metadata change
});
```

---

## 8.8 Rate Limiting

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/api/auth/login` | 5 requests | 1 minute |
| `/api/messages` (POST) | 30 requests | 1 minute |
| `/api/Files` (POST) | 10 requests | 1 minute |
| All others | 100 requests | 1 minute |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1706264400
```

**Error Response (429 Too Many Requests):**
```json
{
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "message": "Rate limit exceeded. Try again in 30 seconds.",
  "retryAfter": 30
}
```

---

## 8.9 Error Handling

### Standard Error Response

```json
{
  "errorCode": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2026-01-26T10:30:00Z",
  "details": {
    // Optional additional context
  }
}
```

### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Wrong username/password |
| `TOKEN_EXPIRED` | 401 | Access token expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permission |
| `RESOURCE_NOT_FOUND` | 404 | Entity doesn't exist |
| `MEMBER_ALREADY_EXISTS` | 400 | User already in group |
| `CANNOT_REMOVE_OWNER` | 400 | Cannot remove group owner |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |
| `UNSUPPORTED_FILE_TYPE` | 415 | File type not allowed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Next Section

Continue to: [9. Data Models](./09-data-models.md)

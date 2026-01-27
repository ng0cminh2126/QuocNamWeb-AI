# 1. System Overview

## 1.1 Introduction

**Vega Internal Chat & Task Management System** is an enterprise-grade, real-time communication and work coordination platform designed for organizations to manage team conversations, tasks, and workflows.

### Purpose

- Enable real-time team collaboration through group chats
- Convert conversations into actionable tasks
- Track task progress with checklists and status updates
- Organize work by departments and work types
- Provide leadership with team monitoring dashboards

---

## 1.2 System Architecture

### Architecture Pattern

**Microservices Architecture** with separate backend services:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  - React 19 + TypeScript                               │
│  - TanStack Query (Server State)                       │
│  - Zustand (Client State)                              │
│  - SignalR Client (Real-time)                          │
└───────────────┬─────────────────────────────────────────┘
                │
                │ HTTP + WebSocket
                │
        ┌───────┴────────┐
        │                │
┌───────▼──────┐  ┌─────▼──────────┐
│  API Gateway │  │  SignalR Hub   │
│  (optional)  │  │  (Chat API)    │
└───────┬──────┘  └────────────────┘
        │
        │ REST APIs
        │
┌───────┴──────────────────────────────────────────┐
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Chat API │  │ Task API │  │ File API │ ...  │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                   │
└───────────────────────────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
┌───────▼──────┐  ┌─────▼────────┐
│   Database   │  │ File Storage │
│  (SQL/NoSQL) │  │   (Blob)     │
└──────────────┘  └──────────────┘
```

### Backend Services

| Service | Responsibility | Base URL (Dev) |
|---------|---------------|----------------|
| **Identity API** | Authentication, user management | `vega-identity-api-dev.allianceitsc.com` |
| **Chat API** | Messages, conversations, SignalR hub | `vega-chat-api-dev.allianceitsc.com` |
| **Task API** | Task CRUD, checklists, status management | `vega-task-api-dev.allianceitsc.com` |
| **File API** | File uploads, watermarked previews | `vega-file-api-dev.allianceitsc.com` |

### Frontend Architecture

```
src/
├── api/                 # API clients (Axios)
├── hooks/
│   ├── queries/        # React Query GET hooks
│   └── mutations/      # React Query POST/PUT/DELETE hooks
├── stores/             # Zustand stores (auth, UI)
├── features/           # Feature modules
│   └── portal/
│       ├── workspace/  # Staff view
│       └── lead/       # Leader monitoring view
├── components/         # Reusable components
├── types/              # TypeScript types
└── lib/                # Utilities (SignalR, auth)
```

---

## 1.3 User Roles & Permissions

### Role Hierarchy

```
Owner (OWN)
  ├─ Full control over group
  ├─ Can promote members to Admin
  ├─ Can remove any member (except self)
  └─ Can manage all tasks

Admin (ADM)
  ├─ Can add/remove members (not Owner)
  ├─ Can create and assign tasks
  ├─ Can manage group settings
  └─ Cannot promote members

Member (MBR)
  ├─ Can send messages
  ├─ Can create tasks
  ├─ Can complete assigned tasks
  └─ Cannot manage members
```

### System Roles (User-level)

- **Admin:** System-wide administrators
- **Leader:** Team leaders - access to team monitoring dashboard
- **Staff:** Regular employees

---

## 1.4 Key User Flows

### 1.4.1 Login Flow

```
User
  ↓
Enter credentials (identifier + password)
  ↓
POST /api/auth/login
  ↓
Receive access token + user info
  ↓
Store token in localStorage
  ↓
Connect to SignalR Hub
  ↓
Redirect to Portal
```

**Business Rules:**
- Token expires after 24 hours (configurable)
- No refresh token in current implementation
- MFA not currently implemented (requiresMfa always false)

---

### 1.4.2 Send Message Flow

```
User types message
  ↓
Click Send
  ↓
[Client] Show "sending" status
  ↓
POST /api/messages
  ↓
[Server] Save to database
  ↓
[Server] Broadcast via SignalR ("MessageSent" event)
  ↓
[All Clients] Receive message via SignalR
  ↓
[Client] Update UI with new message
```

**Real-time Behavior:**
- Sender receives confirmation via SignalR (not just HTTP response)
- Other users receive message instantly via WebSocket
- Optimistic UI: message shows as "sending" immediately

**Error Handling:**
- Network failure: Show "failed" status with retry button
- Timeout (30s): Show "failed" status
- 4xx/5xx errors: Show error toast

---

### 1.4.3 Create Task Flow

```
User clicks "Create Task" (or converts message)
  ↓
Fill task form:
  - Title (required)
  - Description (optional)
  - Priority (default: normal)
  - Assign to (optional)
  - Due date (optional)
  - Checklist template (optional)
  - Work type (optional)
  ↓
POST /api/tasks
  ↓
If linked to message: PATCH /api/messages/{id}/link-task
  ↓
Task created with status "todo"
  ↓
Assignee receives notification (if implemented)
```

**Business Rules:**
- Task must have a title (max 200 characters)
- Task creator is stored in `assignFrom` field
- Default status: `todo`
- Default priority: `normal`
- Checklist items are copied from template (if selected)

---

### 1.4.4 File Upload Flow

```
User selects file (drag/drop or click)
  ↓
Validate file size/type
  ↓
POST /api/Files?sourceModule=1&sourceEntityId={conversationId}
  ↓
[Server] Store file, generate fileId
  ↓
[Client] Receive fileId
  ↓
POST /api/messages with attachments array
  ↓
Message sent with file attachments
```

**File Constraints:**
- Max file size: 10MB (configurable)
- Supported types: Images, PDF, Excel, Word, Text
- Batch upload: 2-10 files per request

---

## 1.5 Security Features

### DevTools Protection

- Blocks F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
- Prevents right-click context menu
- Disables text selection on sensitive content
- Admin whitelist bypass for testing

### Authentication

- JWT-based authentication
- Token stored in localStorage
- Authorization header: `Bearer <token>`
- Token validation on every API request

### File Security

- Watermarked thumbnails and previews
- Signed URLs (if implemented)
- Source module tracking (Task, Chat, Company, User)

---

## 1.6 Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI framework |
| TypeScript | 5.9.3 | Type safety |
| Vite (Rolldown) | 7.1.14 | Build tool |
| TanStack Query | 5.90.12 | Server state management |
| Zustand | 5.0.9 | Client state management |
| SignalR | 10.0.0 | Real-time communication |
| Axios | 1.13.2 | HTTP client |
| Radix UI | Latest | Accessible UI components |
| Tailwind CSS | 3.4.18 | Styling |

### Testing

- **Vitest:** Unit/integration tests
- **Playwright:** E2E tests
- **MSW:** API mocking

---

## 1.7 Performance Considerations

### Optimizations

- **Cursor-based pagination** for messages (50 messages per page)
- **Infinite scroll** for conversation list
- **Query caching** with React Query (staleTime: 5 minutes)
- **Debounced search** (300ms delay)
- **Lazy loading** of components
- **Code splitting** with Vite

### Real-time Connection

- **Automatic reconnection** with exponential backoff: [0ms, 2s, 5s, 10s, 30s]
- **Connection state tracking:** Disconnected, Connecting, Connected, Reconnecting
- **Graceful degradation:** Falls back to polling if WebSocket fails

---

## 1.8 Mobile Development Notes

### For iOS/Android Teams

**State Management:**
- Consider using equivalent of React Query (e.g., Apollo Client, Retrofit + Room)
- Cache server responses locally
- Implement optimistic updates for better UX

**Real-time:**
- Use SignalR client for .NET (iOS: SignalR-ObjC, Android: SignalR-Java)
- Handle reconnection logic carefully
- Join conversation groups on screen load

**File Handling:**
- Use native file picker
- Show upload progress
- Cache thumbnails for performance

**UI/UX Parity:**
- Message grouping by date (same as Web)
- Typing indicators (optional - low priority)
- Pull-to-refresh for message list
- Swipe actions for quick replies

---

## 1.9 QC Testing Scope

### Critical Test Areas

1. **Authentication:** Login, logout, token expiration
2. **Message Sending:** Text, images, files, replies
3. **Real-time Sync:** Multiple devices, network failures
4. **Task Lifecycle:** Create, update status, complete
5. **Permissions:** Role-based access control
6. **File Upload:** Size limits, type validation, errors

### Test Environments

- **Development:** `vega-*-api-dev.allianceitsc.com`
- **Staging:** (if available)
- **Production:** `vega-*-api-prod.allianceitsc.com`

### Test Data Requirements

- Multiple user accounts (Admin, Leader, Staff)
- Multiple groups with different member counts
- Conversations with 100+ messages
- Tasks in various states
- Large files for upload testing

---

## Next Section

Continue to: [2. Authentication & Authorization](./02-authentication.md)

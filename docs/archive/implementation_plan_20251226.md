# 🚀 Kế Hoạch Thực Thi - Quoc Nam Portal Phase 1A

> **Ngày tạo:** 2025-12-26  
> **Version:** 1.0  
> **Dự án:** M1 Portal Internal Chat  
> **Trạng thái:** Approved by Customer - Ready for Implementation

---

## 📋 Mục Lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc hệ thống đề xuất](#2-kiến-trúc-hệ-thống-đề-xuất)
3. [Phân chia công việc theo Sprint](#3-phân-chia-công-việc-theo-sprint)
4. [API Specification cho Backend Team](#4-api-specification-cho-backend-team)
5. [Frontend Implementation Tasks](#5-frontend-implementation-tasks)
6. [Integration & Testing Plan](#6-integration--testing-plan)
7. [Deployment Strategy](#7-deployment-strategy)
8. [Rủi ro và Giải pháp](#8-rủi-ro-và-giải-pháp)

---

## 1. Tổng quan dự án

### 1.1 Mô tả sản phẩm
Portal Internal Chat dành cho doanh nghiệp với các chức năng chính:
- **Chat nhóm** theo phòng ban/liên phòng ban
- **Quản lý công việc** (Task) với workflow và checklist
- **Quản lý file** đính kèm trong các cuộc hội thoại
- **Phân quyền** Leader/Staff với các chức năng tương ứng

### 1.2 Đối tượng người dùng
| Role | Mô tả | Chức năng chính |
|------|-------|-----------------|
| **Admin** | Quản trị hệ thống | Quản lý phòng ban, người dùng, cấu hình |
| **Leader** | Trưởng nhóm/phòng | Giám sát, phân công việc, duyệt task |
| **Staff** | Nhân viên | Chat, thực hiện task, báo cáo tiến độ |

### 1.3 Tech Stack Production

#### Frontend (Team chúng ta)
| Technology | Version | Ghi chú |
|------------|---------|---------|
| React | 19.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 7.x | Build tool |
| TailwindCSS | 3.x | Styling |
| Radix UI | Latest | Headless components |
| TanStack Query | 5.x | **Thêm mới** - Server state management |
| Zustand | 5.x | **Thêm mới** - Client state management |
| React Router | 7.x | **Thêm mới** - Routing |
| @microsoft/signalr | 8.x | **Thêm mới** - Real-time (SignalR) |
| Axios | 1.x | **Thêm mới** - HTTP Client |

#### Backend (Team khác cung cấp)
| Technology | Gợi ý | Ghi chú |
|------------|-------|---------|
| Runtime | Node.js / .NET / Java | Tuỳ chọn của team backend |
| Database | PostgreSQL | Khuyến nghị cho dữ liệu quan hệ |
| Cache | Redis | Session, real-time, cache |
| File Storage | S3 / MinIO | Lưu trữ file |
| Real-time | SignalR | WebSocket connection (.NET) |

---

## 2. Kiến trúc hệ thống đề xuất

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  Desktop Web    │  │  Mobile Web     │  │  Mobile App     │         │
│  │  (React SPA)    │  │  (React PWA)    │  │  (Future)       │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
└───────────┼─────────────────────┼─────────────────────┼─────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY / LOAD BALANCER                      │
│                      (Nginx / AWS ALB / Cloudflare)                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   REST API      │    │   WebSocket     │    │   File Service  │
│   Server        │    │   Server        │    │   (Upload/DL)   │
│                 │    │   (Real-time)   │    │                 │
│ - Auth          │    │ - Chat messages │    │ - S3/MinIO      │
│ - Users         │    │ - Notifications │    │ - Image resize  │
│ - Groups        │    │ - Presence      │    │ - File preview  │
│ - Tasks         │    │ - Typing status │    │                 │
│ - Messages      │    │                 │    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   S3 / MinIO    │
│   (Primary DB)  │    │   (Cache/PubSub)│    │   (Files)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 Frontend Architecture (Chi tiết)

```
src/
├── api/                          # 🆕 API layer
│   ├── client.ts                 # Axios instance, interceptors
│   ├── endpoints/
│   │   ├── auth.api.ts
│   │   ├── users.api.ts
│   │   ├── groups.api.ts
│   │   ├── messages.api.ts
│   │   ├── tasks.api.ts
│   │   └── files.api.ts
│   └── types/                    # API response types
│
├── hooks/                        # 🆕 Custom hooks
│   ├── queries/                  # TanStack Query hooks
│   │   ├── useGroups.ts
│   │   ├── useMessages.ts
│   │   ├── useTasks.ts
│   │   └── useUsers.ts
│   ├── mutations/                # Mutation hooks
│   │   ├── useCreateTask.ts
│   │   ├── useSendMessage.ts
│   │   └── useUpdateTask.ts
│   └── useSignalR.ts             # SignalR connection hook
│
├── stores/                       # 🆕 Zustand stores
│   ├── authStore.ts
│   ├── uiStore.ts
│   ├── chatStore.ts
│   └── notificationStore.ts
│
├── features/                     # Existing - refactor
│   └── portal/
│       ├── components/           # Giữ nguyên
│       ├── workspace/            # Giữ nguyên
│       ├── lead/                 # Giữ nguyên
│       └── hooks/                # Feature-specific hooks
│
├── components/                   # Shared components
│   ├── ui/                       # Giữ nguyên (Radix-based)
│   └── common/                   # 🆕 Business components
│
├── lib/                          # Utilities
│   ├── utils.ts                  # Giữ nguyên
│   ├── signalr.ts                # 🆕 SignalR client
│   └── constants.ts              # 🆕 App constants
│
├── routes/                       # 🆕 React Router
│   ├── index.tsx
│   ├── ProtectedRoute.tsx
│   └── routes.ts
│
└── types/                        # 🆕 Global types (move from portal)
    └── index.ts
```

---

## 3. Phân chia công việc theo Sprint

### 📅 Timeline tổng quan

```
┌────────────────┬────────────────┬────────────────┬────────────────┬────────────────┐
│   Sprint 0     │   Sprint 1     │   Sprint 2     │   Sprint 3     │   Sprint 4     │
│   (1 tuần)     │   (2 tuần)     │   (2 tuần)     │   (2 tuần)     │   (1 tuần)     │
├────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│ Setup &        │ Auth &         │ Chat &         │ Task &         │ Polish &       │
│ Foundation     │ Organization   │ Messaging      │ Workflow       │ Testing        │
└────────────────┴────────────────┴────────────────┴────────────────┴────────────────┘
```

### Sprint 0: Setup & Foundation (1 tuần)

#### Frontend Tasks
| # | Task | Priority | Effort |
|---|------|----------|--------|
| 0.1 | Setup project structure (api/, hooks/, stores/, routes/) | P0 | 4h |
| 0.2 | Install & configure TanStack Query | P0 | 2h |
| 0.3 | Install & configure Zustand | P0 | 2h |
| 0.4 | Install & configure React Router v7 | P0 | 4h |
| 0.5 | Setup Axios client với interceptors | P0 | 4h |
| 0.6 | Setup SignalR client (@microsoft/signalr) | P0 | 4h |
| 0.7 | Move types từ portal/types.ts sang global | P1 | 2h |
| 0.8 | Setup environment variables (.env) | P0 | 1h |
| 0.9 | Setup MSW (Mock Service Worker) cho development | P1 | 4h |

#### Backend Team cần cung cấp
- [ ] API documentation format (Swagger/OpenAPI preferred)
- [ ] Base URL cho các môi trường (dev, staging, prod)
- [ ] Authentication method (JWT recommended)
- [ ] SignalR Hub endpoint

---

### Sprint 1: Auth & Organization (2 tuần)

#### 1.1 Authentication Module

##### Frontend Tasks
| # | Task | Priority | Effort |
|---|------|----------|--------|
| 1.1.1 | Tạo Login page | P0 | 8h |
| 1.1.2 | Tạo authStore (Zustand) | P0 | 4h |
| 1.1.3 | Implement auth API hooks | P0 | 4h |
| 1.1.4 | Setup Protected Routes | P0 | 4h |
| 1.1.5 | Token refresh logic | P0 | 4h |
| 1.1.6 | Logout & session expiry handling | P0 | 2h |

##### API cần từ Backend

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;          // seconds
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    roles: ("admin" | "leader" | "staff")[];
    departmentIds: string[];
    primaryDepartmentId?: string;
  };
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// POST /api/auth/logout
interface LogoutRequest {
  refreshToken: string;
}

// GET /api/auth/me
// Headers: Authorization: Bearer {accessToken}
interface MeResponse {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: ("admin" | "leader" | "staff")[];
  departmentIds: string[];
  primaryDepartmentId?: string;
  active: boolean;
  createdAt: string;
}
```

#### 1.2 Organization Module

##### Frontend Tasks
| # | Task | Priority | Effort |
|---|------|----------|--------|
| 1.2.1 | Tạo useDepartments hook | P0 | 4h |
| 1.2.2 | Tạo useUsers hook | P0 | 4h |
| 1.2.3 | Tạo useGroups hook | P0 | 4h |
| 1.2.4 | Integrate MainSidebar với real data | P0 | 8h |
| 1.2.5 | Integrate LeftSidebar với groups data | P0 | 8h |

##### API cần từ Backend

```typescript
// ========== DEPARTMENTS ==========

// GET /api/departments
interface DepartmentsResponse {
  data: Department[];
  total: number;
}

interface Department {
  id: string;
  name: string;
  leaderId: string;           // user id của leader
  leaderName: string;         // display name của leader
  memberCount: number;
  createdAt: string;
}

// GET /api/departments/:id
interface DepartmentDetailResponse {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  members: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
    role: "leader" | "staff";
    active: boolean;
  }[];
  createdAt: string;
}

// ========== USERS ==========

// GET /api/users
// Query params: ?departmentId=xxx&role=staff&search=keyword&page=1&limit=20
interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  roles: ("admin" | "leader" | "staff")[];
  departmentIds: string[];
  primaryDepartmentId?: string;
  active: boolean;
  createdAt: string;
}

// GET /api/users/:id
interface UserDetailResponse extends User {
  // Additional user details if needed
}

// ========== GROUPS (Chat Groups) ==========

// GET /api/groups
// Query: ?type=all|joined  (default: joined - chỉ lấy group user tham gia)
interface GroupsResponse {
  data: GroupChat[];
  total: number;
}

interface GroupChat {
  id: string;
  name: string;
  description?: string;
  departmentIds: string[];
  memberCount: number;
  workTypes: WorkType[];
  defaultWorkTypeId?: string;
  // UI metadata
  lastMessage?: {
    content: string;
    senderName: string;
    sentAt: string;
    type: "text" | "image" | "file";
  };
  unreadCount: number;
  createdAt: string;
}

interface WorkType {
  id: string;
  key: string;
  name: string;
  icon?: string;                // lucide icon name
  color?: string;               // hex color
  checklistVariants?: {
    id: string;
    name: string;
    isDefault?: boolean;
  }[];
}

// GET /api/groups/:id
interface GroupDetailResponse extends GroupChat {
  members: {
    userId: string;
    displayName: string;
    avatarUrl?: string;
    role: "leader" | "staff";
    isAutoJoined: boolean;
    joinedAt: string;
  }[];
}

// GET /api/groups/:id/members
// Danh sách member có thể assign task
interface GroupMembersResponse {
  data: {
    userId: string;
    displayName: string;
    avatarUrl?: string;
    role: "leader" | "staff";
    departmentName: string;
  }[];
}
```

---

### Sprint 2: Chat & Messaging (2 tuần)

#### 2.1 Messages Module

##### Frontend Tasks
| # | Task | Priority | Effort |
|---|------|----------|--------|
| 2.1.1 | Tạo useMessages hook (infinite scroll) | P0 | 8h |
| 2.1.2 | Tạo useSendMessage mutation | P0 | 4h |
| 2.1.3 | Integrate ChatMain với real messages | P0 | 12h |
| 2.1.4 | Implement reply message | P0 | 4h |
| 2.1.5 | Implement pin/unpin message | P1 | 4h |
| 2.1.6 | Setup SignalR connection | P0 | 8h |
| 2.1.7 | Handle real-time incoming messages | P0 | 8h |
| 2.1.8 | Implement typing indicator | P2 | 4h |
| 2.1.9 | Implement message search | P1 | 8h |

##### API cần từ Backend

```typescript
// ========== MESSAGES ==========

// GET /api/groups/:groupId/messages
// Query: ?workTypeId=xxx&before=messageId&limit=50
interface MessagesResponse {
  data: Message[];
  hasMore: boolean;
  oldestMessageId?: string;
}

interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  type: "text" | "image" | "file" | "system";
  content?: string;
  files?: FileAttachment[];
  replyTo?: {
    id: string;
    type: "text" | "image" | "file";
    senderName: string;
    content?: string;
    files?: { name: string; url: string; type: string }[];
  };
  isPinned: boolean;
  workTypeId?: string;          // nếu đã chuyển thành task
  taskId?: string;              // id của task nếu đã tạo
  createdAt: string;            // ISO datetime
  updatedAt?: string;
}

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;        // cho image/pdf preview
  type: "image" | "pdf" | "excel" | "word" | "other";
  size: number;                 // bytes
  mimeType: string;
}

// POST /api/groups/:groupId/messages
interface SendMessageRequest {
  type: "text" | "image" | "file";
  content?: string;
  fileIds?: string[];           // ids từ upload trước đó
  replyToId?: string;
}

interface SendMessageResponse {
  id: string;
  // ... full Message object
}

// PATCH /api/messages/:id/pin
interface PinMessageRequest {
  isPinned: boolean;
}

// GET /api/groups/:groupId/messages/pinned
interface PinnedMessagesResponse {
  data: Message[];
}

// GET /api/groups/:groupId/messages/search
// Query: ?q=keyword&fromDate=xxx&toDate=xxx
interface SearchMessagesResponse {
  data: Message[];
  total: number;
}
```

#### 2.2 File Upload Module

##### Frontend Tasks
| # | Task | Priority | Effort |
|---|------|----------|--------|
| 2.2.1 | Implement file upload với progress | P0 | 8h |
| 2.2.2 | Integrate FileManager với real data | P0 | 8h |
| 2.2.3 | Implement file preview modal | P0 | 4h |
| 2.2.4 | Implement image gallery trong chat | P1 | 4h |

##### API cần từ Backend

```typescript
// ========== FILE UPLOAD ==========

// POST /api/files/upload
// Content-Type: multipart/form-data
// Body: file (binary)
// Query: ?groupId=xxx (optional, for access control)
interface UploadFileResponse {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: "image" | "pdf" | "excel" | "word" | "other";
  size: number;
  mimeType: string;
  uploadedAt: string;
}

// GET /api/groups/:groupId/files
// Query: ?type=image|pdf|excel|word|all&page=1&limit=20
interface GroupFilesResponse {
  data: FileAttachment[];
  total: number;
  page: number;
  limit: number;
}

// DELETE /api/files/:id
// Response: 204 No Content
```

#### 2.3 SignalR Hub Methods

```typescript
// ========== SIGNALR HUB: ChatHub ==========
// Hub URL: /hubs/chat

// Client -> Server (Hub Methods)
interface ChatHubServerMethods {
  // Tham gia room (group)
  JoinGroup(groupId: string): Promise<void>;
  
  // Rời room
  LeaveGroup(groupId: string): Promise<void>;
  
  // Typing indicator
  SendTyping(groupId: string, isTyping: boolean): Promise<void>;
  
  // Mark messages as read
  MarkAsRead(groupId: string, lastMessageId: string): Promise<void>;
}

// Server -> Client (Client Methods)
interface ChatHubClientMethods {
  // Tin nhắn mới
  ReceiveMessage(message: Message): void;
  
  // Tin nhắn được update (pin/unpin, edit)
  MessageUpdated(message: Message): void;
  
  // Tin nhắn bị xoá
  MessageDeleted(data: { messageId: string; groupId: string }): void;
  
  // User đang typing
  UserTyping(data: {
    groupId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
  }): void;
  
  // Unread count thay đổi
  UnreadUpdated(data: { groupId: string; unreadCount: number }): void;
  
  // Task được tạo từ message
  TaskCreated(data: { messageId: string; task: Task }): void;
  
  // Task status thay đổi
  TaskUpdated(task: Task): void;
  
  // User online/offline
  PresenceChanged(data: { userId: string; status: "online" | "offline" }): void;
}
```

#### 2.4 SignalR Client Setup Example

```typescript
// src/lib/signalr.ts
import * as signalR from "@microsoft/signalr";

class ChatHubConnection {
  private connection: signalR.HubConnection | null = null;
  
  async start(accessToken: string) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/chat", {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();
    
    await this.connection.start();
  }
  
  async joinGroup(groupId: string) {
    await this.connection?.invoke("JoinGroup", groupId);
  }
  
  async leaveGroup(groupId: string) {
    await this.connection?.invoke("LeaveGroup", groupId);
  }
  
  onReceiveMessage(callback: (message: Message) => void) {
    this.connection?.on("ReceiveMessage", callback);
  }
  
  onUserTyping(callback: (data: any) => void) {
    this.connection?.on("UserTyping", callback);
  }
  
  async stop() {
    await this.connection?.stop();
  }
}

export const chatHub = new ChatHubConnection();
```

---

### Sprint 3: Task & Workflow (2 tuần)

#### 3.1 Task Management Module

##### Frontend Tasks
| # | Task | Priority | Effort |
|---|------|----------|--------|
| 3.1.1 | Tạo useTasks hook | P0 | 4h |
| 3.1.2 | Tạo useCreateTask mutation | P0 | 4h |
| 3.1.3 | Tạo useUpdateTask mutation | P0 | 4h |
| 3.1.4 | Integrate RightPanel với real tasks | P0 | 12h |
| 3.1.5 | Integrate AssignTaskSheet với API | P0 | 8h |
| 3.1.6 | Implement task status flow UI | P0 | 8h |
| 3.1.7 | Implement checklist toggle | P0 | 4h |
| 3.1.8 | Implement Task Log (nhật ký công việc) | P1 | 12h |
| 3.1.9 | Implement task filtering & sorting | P1 | 4h |

##### API cần từ Backend

```typescript
// ========== TASKS ==========

// GET /api/tasks
// Query: ?groupId=xxx&workTypeId=xxx&status=todo,in_progress&assigneeId=xxx&page=1&limit=20
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
  
  sourceMessageId: string;      // message gốc
  sourceMessagePreview?: string; // snippet của message
  
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
  progressPercent: number;      // tính từ checklist done
  
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

// POST /api/tasks
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

interface CreateTaskResponse extends Task {}

// PATCH /api/tasks/:id
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

// PATCH /api/tasks/:id/checklist/:itemId
interface UpdateChecklistItemRequest {
  done: boolean;
}

// POST /api/tasks/:id/checklist
// Thêm item mới vào checklist
interface AddChecklistItemRequest {
  label: string;
}

// GET /api/tasks/:id
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

#### 3.2 Task Log (Nhật ký công việc) Module

##### API cần từ Backend

```typescript
// ========== TASK LOG (Thread riêng cho mỗi task) ==========

// GET /api/tasks/:taskId/logs
// Query: ?before=logId&limit=50
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

// POST /api/tasks/:taskId/logs
interface SendTaskLogRequest {
  type: "text" | "image" | "file";
  content?: string;
  fileIds?: string[];
  replyToId?: string;
}
```

#### 3.3 Checklist Templates Module

##### API cần từ Backend

```typescript
// ========== CHECKLIST TEMPLATES ==========

// GET /api/checklist-templates
// Query: ?workTypeId=xxx&checklistVariantId=xxx
interface ChecklistTemplatesResponse {
  data: ChecklistTemplate[];
}

interface ChecklistTemplate {
  id: string;
  workTypeId: string;
  checklistVariantId: string;
  name: string;
  items: {
    id: string;
    label: string;
    order: number;
  }[];
  createdById: string;
  createdAt: string;
}

// POST /api/checklist-templates
// (Admin/Leader only)
interface CreateTemplateRequest {
  workTypeId: string;
  checklistVariantId: string;
  name: string;
  items: { label: string }[];
}

// PUT /api/checklist-templates/:id
interface UpdateTemplateRequest {
  name?: string;
  items?: { id?: string; label: string }[];
}

// DELETE /api/checklist-templates/:id
// Response: 204 No Content
```

#### 3.4 ReceivedInfo & Transfer Module

##### API cần từ Backend

```typescript
// ========== RECEIVED INFO (Thông tin tiếp nhận) ==========

// GET /api/received-infos
// Query: ?groupId=xxx&status=waiting,assigned
interface ReceivedInfosResponse {
  data: ReceivedInfo[];
  total: number;
}

interface ReceivedInfo {
  id: string;
  messageId: string;
  groupId: string;
  title: string;
  senderName: string;
  status: "waiting" | "assigned" | "transferred";
  transferredToGroupId?: string;
  transferredToGroupName?: string;
  transferredWorkTypeName?: string;
  createdAt: string;
  updatedAt: string;
}

// POST /api/received-infos/:id/transfer
interface TransferInfoRequest {
  targetGroupId: string;
  targetWorkTypeId?: string;
  note?: string;
}
```

---

### Sprint 4: Polish & Testing (1 tuần)

#### Frontend Tasks
| # | Task | Priority | Effort |
|---|------|----------|--------|
| 4.1 | Error handling & retry logic | P0 | 8h |
| 4.2 | Loading states & skeletons | P0 | 8h |
| 4.3 | Optimistic updates cho UX | P1 | 8h |
| 4.4 | Offline indicator | P2 | 4h |
| 4.5 | Mobile responsive fixes | P0 | 8h |
| 4.6 | Performance optimization | P1 | 8h |
| 4.7 | E2E testing với Playwright | P1 | 12h |
| 4.8 | Unit tests cho hooks | P1 | 8h |
| 4.9 | Documentation | P1 | 8h |

---

## 4. API Specification cho Backend Team

### 4.1 Tổng hợp tất cả Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |

#### Organization
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/departments` | Danh sách phòng ban |
| GET | `/api/departments/:id` | Chi tiết phòng ban |
| GET | `/api/users` | Danh sách users |
| GET | `/api/users/:id` | Chi tiết user |

#### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | Danh sách nhóm chat |
| GET | `/api/groups/:id` | Chi tiết nhóm |
| GET | `/api/groups/:id/members` | Danh sách thành viên |

#### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups/:groupId/messages` | Lấy tin nhắn (paginated) |
| POST | `/api/groups/:groupId/messages` | Gửi tin nhắn |
| PATCH | `/api/messages/:id/pin` | Pin/Unpin tin nhắn |
| GET | `/api/groups/:groupId/messages/pinned` | Tin nhắn đã pin |
| GET | `/api/groups/:groupId/messages/search` | Tìm kiếm tin nhắn |

#### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload file |
| GET | `/api/groups/:groupId/files` | Danh sách files trong group |
| DELETE | `/api/files/:id` | Xoá file |

#### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Danh sách tasks |
| POST | `/api/tasks` | Tạo task mới |
| GET | `/api/tasks/:id` | Chi tiết task |
| PATCH | `/api/tasks/:id` | Cập nhật task |
| PATCH | `/api/tasks/:id/checklist/:itemId` | Toggle checklist item |
| POST | `/api/tasks/:id/checklist` | Thêm checklist item |

#### Task Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/:taskId/logs` | Lấy nhật ký công việc |
| POST | `/api/tasks/:taskId/logs` | Gửi tin trong nhật ký |

#### Checklist Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/checklist-templates` | Danh sách templates |
| POST | `/api/checklist-templates` | Tạo template |
| PUT | `/api/checklist-templates/:id` | Cập nhật template |
| DELETE | `/api/checklist-templates/:id` | Xoá template |

#### Received Info
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/received-infos` | Danh sách thông tin tiếp nhận |
| POST | `/api/received-infos/:id/transfer` | Chuyển tiếp thông tin |

### 4.2 Common Response Formats

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}

// Error Codes
enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  RATE_LIMITED = "RATE_LIMITED"
}
```

### 4.3 Authentication Headers

```typescript
// Tất cả API (trừ auth/login) cần header:
Authorization: Bearer {accessToken}

// Response khi token hết hạn:
// Status: 401
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token expired"
  }
}
```

---

## 5. Frontend Implementation Tasks

### 5.1 Checklist hoàn chỉnh

#### Sprint 0 (Foundation)
- [ ] Project structure setup
- [ ] TanStack Query setup
- [ ] Zustand stores setup
- [ ] React Router setup
- [ ] Axios client + interceptors
- [ ] SignalR client
- [ ] Environment variables
- [ ] MSW for development mocking

#### Sprint 1 (Auth & Org)
- [ ] Login page
- [ ] Auth store & hooks
- [ ] Protected routes
- [ ] Token refresh
- [ ] Departments hooks
- [ ] Users hooks
- [ ] Groups hooks
- [ ] MainSidebar integration
- [ ] LeftSidebar integration

#### Sprint 2 (Chat)
- [ ] Messages hooks (infinite scroll)
- [ ] Send message mutation
- [ ] ChatMain integration
- [ ] Reply message
- [ ] Pin/unpin message
- [ ] SignalR setup
- [ ] Real-time messages
- [ ] Typing indicator
- [ ] Message search
- [ ] File upload
- [ ] FileManager integration
- [ ] File preview

#### Sprint 3 (Tasks)
- [ ] Tasks hooks
- [ ] Create task mutation
- [ ] Update task mutation
- [ ] RightPanel integration
- [ ] AssignTaskSheet integration
- [ ] Task status flow
- [ ] Checklist toggle
- [ ] Task log
- [ ] Task filtering

#### Sprint 4 (Polish)
- [ ] Error handling
- [ ] Loading states
- [ ] Optimistic updates
- [ ] Mobile responsive
- [ ] Performance optimization
- [ ] E2E tests
- [ ] Unit tests
- [ ] Documentation

---

## 6. Integration & Testing Plan

### 6.1 Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Testing Pyramid                         │
├─────────────────────────────────────────────────────────────┤
│                         ┌─────┐                              │
│                        /  E2E  \                             │
│                       /  Tests  \                            │
│                      ├───────────┤     ~10% coverage        │
│                     /             \                          │
│                    / Integration   \                         │
│                   /     Tests       \                        │
│                  ├───────────────────┤  ~30% coverage       │
│                 /                     \                      │
│                /       Unit Tests      \                     │
│               /                         \                    │
│              └───────────────────────────┘ ~60% coverage    │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Unit Tests (Vitest)

```typescript
// Ví dụ test cho useMessages hook
describe('useMessages', () => {
  it('should fetch messages for a group', async () => {
    const { result } = renderHook(() => 
      useMessages('grp_vh_kho', 'wt_nhan_hang')
    );
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data.pages[0].data).toHaveLength(20);
  });
  
  it('should handle infinite scroll', async () => {
    // ...
  });
});
```

### 6.3 E2E Tests (Playwright)

```typescript
// Ví dụ E2E test cho chat flow
test.describe('Chat Flow', () => {
  test('should send and receive messages', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="email"]', 'chi@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-btn"]');
    
    // Wait for chat to load
    await page.waitForSelector('[data-testid="chat-main"]');
    
    // Send a message
    await page.fill('[data-testid="message-input"]', 'Hello world!');
    await page.click('[data-testid="send-btn"]');
    
    // Verify message appears
    await expect(page.locator('text=Hello world!')).toBeVisible();
  });
});
```

---

## 7. Deployment Strategy

### 7.1 Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | `http://localhost:5173` | Local development |
| Staging | `https://staging.portal.quocnam.vn` | Testing & QA |
| Production | `https://portal.quocnam.vn` | Live |

### 7.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      
  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      # Deploy to staging
      
  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      # Deploy to production
```

---

## 8. Rủi ro và Giải pháp

### 8.1 Bảng phân tích rủi ro

| Rủi ro | Xác suất | Ảnh hưởng | Giải pháp |
|--------|----------|-----------|-----------|
| API chậm trễ từ Backend | Cao | Cao | Dùng MSW mock API, phát triển song song |
| Thay đổi requirement | Trung bình | Trung bình | Thiết kế flexible, component-based |
| Performance issues với nhiều message | Trung bình | Cao | Virtual list, pagination, lazy loading |
| WebSocket disconnection | Cao | Trung bình | Auto-reconnect, offline queue |
| File upload lớn | Trung bình | Thấp | Chunked upload, progress indicator |

### 8.2 Mitigation Plan

1. **API Dependency**
   - Sử dụng MSW để mock tất cả API endpoints
   - Define API contract rõ ràng (document này)
   - Weekly sync với Backend team

2. **Performance**
   - Sử dụng React.memo cho heavy components
   - Virtual scrolling cho message list (react-virtual)
   - Image lazy loading
   - Code splitting theo route

3. **Real-time Reliability**
   - SignalR built-in auto-reconnect
   - Fallback transports (WebSocket -> SSE -> Long Polling)
   - Optimistic updates cho UX

---

## 📎 Phụ lục

### A. Type Definitions (Full)

Xem file: [types.ts](../src/features/portal/types.ts)

### B. Mock Data Structure

Xem folder: [data/](../src/data/)

### C. Component Hierarchy

Xem file: [analysis_20251226_claude_opus_4_5.md](./analysis_20251226_claude_opus_4_5.md)

---

**Tài liệu được tạo bởi:** Claude Opus 4.5 (GitHub Copilot)  
**Ngày:** 2025-12-26  
**Version:** 1.0

---

## ✅ Action Items cho Backend Team

1. [ ] Xác nhận API documentation format (Swagger/OpenAPI)
2. [ ] Cung cấp Base URL cho dev/staging/prod
3. [ ] Xác nhận authentication method (JWT recommended)
4. [ ] Setup SignalR Hub endpoints
5. [ ] Cung cấp API sandbox/mock server (optional)
6. [ ] Review và confirm tất cả endpoints trong document này
7. [ ] Thống nhất error codes và response format
8. [ ] Setup file storage service (S3/MinIO)

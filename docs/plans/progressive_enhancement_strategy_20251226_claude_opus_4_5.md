# 🔄 Chiến Lược Progressive Enhancement từ Mockup

> **Ngày tạo:** 2025-12-26  
> **Model AI:** Claude Opus 4.5 (GitHub Copilot)  
> **Version:** 1.0  
> **Approach:** Phát triển từ source mockup đã có

---

## 📋 Mục Lục

1. [Tổng quan chiến lược](#1-tổng-quan-chiến-lược)
2. [Phân tích Mockup hiện tại](#2-phân-tích-mockup-hiện-tại)
3. [Phase 1: Foundation Layer](#3-phase-1-foundation-layer)
4. [Phase 2: Module Integration](#4-phase-2-module-integration)
5. [Phase 3: Refactor & Optimize](#5-phase-3-refactor--optimize)
6. [Migration Checklist](#6-migration-checklist)
7. [Risk & Mitigation](#7-risk--mitigation)

---

## 1. Tổng quan chiến lược

### 1.1 Approach: Progressive Enhancement

```
┌─────────────────────────────────────────────────────────────────┐
│                 PROGRESSIVE ENHANCEMENT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   MOCKUP (hiện tại)                                             │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  ✅ UI Components    ✅ Styling    ✅ Layout             │   │
│   │  ⚠️ Mock Data        ⚠️ No API     ⚠️ State Lifting     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│   PHASE 1: Foundation (THÊM, không đụng UI)                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  🆕 TanStack Query   🆕 Zustand    🆕 React Router       │   │
│   │  🆕 API Layer        🆕 SignalR    🆕 Types              │   │
│   └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│   PHASE 2: Integration (THAY THẾ từng phần)                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  📦 Chat Module      📦 Task Module  📦 File Module      │   │
│   │  Mock → API          Mock → API      Mock → API          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│   PHASE 3: Refactor (TỐI ƯU)                                    │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  🔧 Split large files  🔧 Extract hooks  🔧 Performance  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Nguyên tắc cốt lõi

| # | Nguyên tắc | Mô tả |
|---|------------|-------|
| 1 | **Không break UI** | Giữ nguyên giao diện đã được approve |
| 2 | **Thêm trước, thay sau** | Thêm layers mới, sau đó mới integrate |
| 3 | **Module độc lập** | Migrate từng module, không phụ thuộc |
| 4 | **Test liên tục** | Mỗi step phải verify app vẫn chạy |
| 5 | **Checkpoint thường xuyên** | Commit & tag sau mỗi milestone |

---

## 2. Phân tích Mockup hiện tại

### 2.1 Inventory: Những gì đã có

#### ✅ UI Components (GIỮ NGUYÊN)

```
src/components/ui/              # 17 Radix-based components
├── button.tsx                  ✅ Keep
├── calendar.tsx                ✅ Keep
├── card.tsx                    ✅ Keep
├── dialog.tsx                  ✅ Keep
├── icon-button.tsx             ✅ Keep
├── input.tsx                   ✅ Keep
├── label.tsx                   ✅ Keep
├── popover.tsx                 ✅ Keep
├── radio-group.tsx             ✅ Keep
├── scroll-area.tsx             ✅ Keep
├── select.tsx                  ✅ Keep
├── separator.tsx               ✅ Keep
├── sheet.tsx                   ✅ Keep
├── textarea.tsx                ✅ Keep
├── toggle.tsx                  ✅ Keep
├── toggle-group.tsx            ✅ Keep
└── tooltip.tsx                 ✅ Keep
```

#### ✅ Sheet Components (GIỮ NGUYÊN, refactor nhẹ)

```
src/components/sheet/           # 4 Sheet components
├── AssignTaskSheet.tsx         ✅ Keep → integrate mutation
├── DepartmentTransferSheet.tsx ✅ Keep → integrate mutation
├── GroupTransferSheet.tsx      ✅ Keep → integrate mutation
└── MobileAssignTaskSheet.tsx   ✅ Keep → integrate mutation
```

#### ✅ Portal Components (GIỮ NGUYÊN, integrate hooks)

```
src/features/portal/components/  # 25+ components
├── Avatar.tsx                   ✅ Keep
├── Badge.tsx                    ✅ Keep
├── Chip.tsx                     ✅ Keep
├── MessageBubble.tsx            ✅ Keep → integrate real data
├── TaskChecklist.tsx            ✅ Keep → integrate mutation
├── FileManager.tsx              ✅ Keep → integrate query
├── PinnedMessagesPanel.tsx      ✅ Keep → integrate query
├── ChecklistTemplatePanel.tsx   ✅ Keep → integrate API
├── ...                          ✅ Keep
```

#### ✅ Workspace Components (REFACTOR DẦN)

```
src/features/portal/workspace/
├── ChatMain.tsx                 🔄 Integrate useMessages
├── LeftSidebar.tsx              🔄 Integrate useGroups
├── RightPanel.tsx               🔄 Integrate useTasks
├── WorkspaceView.tsx            🔄 Simplify, move state
├── TaskLogThreadSheet.tsx       🔄 Integrate useTaskLogs
└── MobileTaskLogScreen.tsx      🔄 Integrate
```

#### ⚠️ Main Container (CẦN REFACTOR LỚN)

```
src/features/portal/PortalWireframes.tsx
├── 1169 lines!                  ⚠️ Quá lớn
├── ~50 useState                 ⚠️ State lifting
├── Mock data imports            ⚠️ Cần thay bằng hooks
└── Business logic mixed         ⚠️ Cần extract
```

#### ❌ Mock Data (XOÁ SAU KHI MIGRATE)

```
src/data/                        # Mock data - sẽ xoá
├── mockMessages.ts              ❌ Replace với API
├── mockOrg.ts                   ❌ Replace với API
├── mockSidebar.ts               ❌ Replace với API
└── mockTasks.ts                 ❌ Replace với API
```

### 2.2 Types hiện có

```typescript
// src/features/portal/types.ts - 331 lines
// Đã define khá đầy đủ:
✅ Message, TaskLogMessage
✅ Task, TaskStatus, ChecklistItem
✅ User, Department, GroupChat
✅ WorkType, ChecklistVariant
✅ FileAttachment, AttachmentType
✅ PinnedMessage, ReceivedInfo
```

**Action:** Move sang `src/types/` và expand thêm API types

---

## 3. Phase 1: Foundation Layer

> **Mục tiêu:** Thêm infrastructure mới mà KHÔNG đụng đến UI code

### 3.1 Tasks Overview

| # | Task | Files | Effort |
|---|------|-------|--------|
| 1.1 | Install dependencies | package.json | 30m |
| 1.2 | Setup React Router | src/routes/ | 2h |
| 1.3 | Setup TanStack Query | src/main.tsx, src/lib/ | 1h |
| 1.4 | Setup Zustand stores | src/stores/ | 2h |
| 1.5 | Setup Axios client | src/api/client.ts | 1h |
| 1.6 | Setup SignalR client | src/lib/signalr.ts | 2h |
| 1.7 | Restructure types | src/types/ | 2h |
| 1.8 | Setup MSW (dev mocking) | src/mocks/ | 2h |

### 3.2 Chi tiết từng task

#### Task 1.1: Install dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zustand
npm install react-router-dom
npm install axios
npm install @microsoft/signalr
npm install -D msw
```

#### Task 1.2: Setup React Router

```
src/routes/
├── index.tsx           # Router setup
├── routes.ts           # Route definitions
└── ProtectedRoute.tsx  # Auth guard
```

**Routing plan:**
```typescript
// Route structure
/                       → Redirect to /portal
/login                  → Login page
/portal                 → Portal layout
  /portal/workspace     → WorkspaceView (default)
  /portal/lead          → TeamMonitorView
  /portal/settings      → Settings (future)
/mobile                 → Mobile layout
  /mobile/chat          → Mobile chat
  /mobile/task-log/:id  → Mobile task log
```

#### Task 1.3: Setup TanStack Query

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,      // 30 seconds
      gcTime: 1000 * 60 * 5,     // 5 minutes (cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

```typescript
// src/main.tsx - Wrap với provider
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

#### Task 1.4: Setup Zustand Stores

```
src/stores/
├── authStore.ts        # User, tokens, login state
├── uiStore.ts          # UI state (sidebar, modals, view mode)
├── chatStore.ts        # Active chat, typing, drafts
└── index.ts            # Barrel export
```

```typescript
// src/stores/authStore.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
}

// src/stores/uiStore.ts  
interface UIState {
  // View states
  viewMode: 'lead' | 'staff';
  currentView: 'workspace' | 'lead';
  showRightPanel: boolean;
  
  // Selected items
  selectedGroupId: string | null;
  selectedWorkTypeId: string | null;
  
  // Actions
  setViewMode: (mode: 'lead' | 'staff') => void;
  setSelectedGroup: (id: string) => void;
  toggleRightPanel: () => void;
}
```

#### Task 1.5: Setup Axios Client

```typescript
// src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401, refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
    }
    return Promise.reject(error);
  }
);
```

#### Task 1.6: Setup SignalR Client

```typescript
// src/lib/signalr.ts
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/stores/authStore';

const HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || '/hubs/chat';

class ChatHubConnection {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;
  
  async start() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }
    
    if (this.isConnecting) return;
    this.isConnecting = true;
    
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => useAuthStore.getState().accessToken || '',
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();
      
      await this.connection.start();
      console.log('SignalR Connected');
    } finally {
      this.isConnecting = false;
    }
  }
  
  async stop() {
    await this.connection?.stop();
  }
  
  // Hub methods
  async joinGroup(groupId: string) {
    await this.connection?.invoke('JoinGroup', groupId);
  }
  
  async leaveGroup(groupId: string) {
    await this.connection?.invoke('LeaveGroup', groupId);
  }
  
  async sendTyping(groupId: string, isTyping: boolean) {
    await this.connection?.invoke('SendTyping', groupId, isTyping);
  }
  
  // Event listeners
  onReceiveMessage(callback: (message: Message) => void) {
    this.connection?.on('ReceiveMessage', callback);
  }
  
  onUserTyping(callback: (data: TypingData) => void) {
    this.connection?.on('UserTyping', callback);
  }
  
  offReceiveMessage() {
    this.connection?.off('ReceiveMessage');
  }
}

export const chatHub = new ChatHubConnection();
```

#### Task 1.7: Restructure Types

```
# Move và reorganize
src/features/portal/types.ts → src/types/

src/types/
├── index.ts              # Barrel export
├── common.ts             # ID, ISODate, etc.
├── auth.ts               # User, roles, tokens
├── organization.ts       # Department, GroupChat, WorkType
├── messages.ts           # Message, FileAttachment
├── tasks.ts              # Task, ChecklistItem, TaskLog
└── api.ts                # API request/response types
```

#### Task 1.8: Setup MSW (Mock Service Worker)

```
src/mocks/
├── browser.ts            # Browser worker setup
├── handlers/
│   ├── auth.ts           # Auth endpoints
│   ├── messages.ts       # Messages endpoints
│   ├── tasks.ts          # Tasks endpoints
│   └── index.ts          # Combine handlers
└── data/                 # Mock data (move from src/data/)
```

### 3.3 Checkpoint sau Phase 1

```bash
git tag checkpoint-001_[foundation]_infrastructure-complete
```

**Verification:**
- [ ] App vẫn chạy với UI cũ
- [ ] DevTools hiển thị React Query
- [ ] MSW intercept requests trong dev
- [ ] No TypeScript errors

---

## 4. Phase 2: Module Integration

> **Mục tiêu:** Migrate từng module từ mock → real API

### 4.1 Thứ tự Migration

```
1. [auth] Auth Module          → Sprint 1
   └── Cần có trước khi gọi API khác
   
2. [org] Organization Module   → Sprint 1  
   └── Groups, Users cần cho Chat & Task
   
3. [chat] Chat Module          → Sprint 2
   └── Core feature
   
4. [file] File Module          → Sprint 2
   └── Đi kèm Chat
   
5. [task] Task Module          → Sprint 3
   └── Phụ thuộc Chat (tạo từ message)
```

### 4.2 Migration Pattern cho mỗi Component

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT MIGRATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BEFORE (Mockup)                                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ // ChatMain.tsx                                            │  │
│  │ import { mockMessages } from '@/data/mockMessages';        │  │
│  │                                                            │  │
│  │ function ChatMain({ messages }: Props) {                   │  │
│  │   // messages passed from parent (PortalWireframes)        │  │
│  │   return <div>{messages.map(...)}</div>;                   │  │
│  │ }                                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  AFTER (Integrated)                                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ // ChatMain.tsx                                            │  │
│  │ import { useMessages } from '@/hooks/queries/useMessages'; │  │
│  │                                                            │  │
│  │ function ChatMain({ groupId, workTypeId }: Props) {        │  │
│  │   const { data, isLoading, error } = useMessages(...);     │  │
│  │                                                            │  │
│  │   if (isLoading) return <Skeleton />;                      │  │
│  │   if (error) return <Error />;                             │  │
│  │                                                            │  │
│  │   const messages = data?.pages.flatMap(p => p.data) ?? []; │  │
│  │   return <div>{messages.map(...)}</div>;                   │  │
│  │ }                                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 [auth] Auth Module Migration

**Files to create:**
```
src/api/auth.api.ts
src/hooks/mutations/useLogin.ts
src/hooks/mutations/useLogout.ts
src/hooks/queries/useMe.ts
src/pages/Login.tsx
```

**Files to modify:**
```
src/main.tsx              → Add auth check
src/routes/index.tsx      → Protected routes
```

### 4.4 [org] Organization Module Migration

**Files to create:**
```
src/api/organization.api.ts
src/hooks/queries/useDepartments.ts
src/hooks/queries/useUsers.ts
src/hooks/queries/useGroups.ts
src/hooks/queries/useGroupMembers.ts
```

**Files to modify:**
```
src/features/portal/components/MainSidebar.tsx
src/features/portal/workspace/LeftSidebar.tsx
```

### 4.5 [chat] Chat Module Migration

**Files to create:**
```
src/api/messages.api.ts
src/hooks/queries/useMessages.ts
src/hooks/queries/usePinnedMessages.ts
src/hooks/mutations/useSendMessage.ts
src/hooks/mutations/usePinMessage.ts
src/hooks/useSignalR.ts
```

**Files to modify:**
```
src/features/portal/workspace/ChatMain.tsx
src/features/portal/components/MessageBubble.tsx
src/features/portal/components/PinnedMessagesPanel.tsx
```

### 4.6 [file] File Module Migration

**Files to create:**
```
src/api/files.api.ts
src/hooks/queries/useGroupFiles.ts
src/hooks/mutations/useUploadFile.ts
src/hooks/mutations/useDeleteFile.ts
```

**Files to modify:**
```
src/features/portal/components/FileManager.tsx
src/features/portal/components/FilePreviewModal.tsx
```

### 4.7 [task] Task Module Migration

**Files to create:**
```
src/api/tasks.api.ts
src/hooks/queries/useTasks.ts
src/hooks/queries/useTaskDetail.ts
src/hooks/queries/useTaskLogs.ts
src/hooks/mutations/useCreateTask.ts
src/hooks/mutations/useUpdateTask.ts
src/hooks/mutations/useUpdateChecklist.ts
src/hooks/mutations/useSendTaskLog.ts
```

**Files to modify:**
```
src/features/portal/workspace/RightPanel.tsx
src/features/portal/components/TaskChecklist.tsx
src/features/portal/workspace/TaskLogThreadSheet.tsx
src/components/sheet/AssignTaskSheet.tsx
```

---

## 5. Phase 3: Refactor & Optimize

> **Mục tiêu:** Clean up và optimize sau khi migrate xong

### 5.1 Refactor PortalWireframes

**Current:** 1169 lines, ~50 useState

**Target:**
```
src/features/portal/
├── PortalLayout.tsx        # Layout only, no business logic
├── hooks/
│   ├── usePortalState.ts   # Extract UI state logic
│   └── useToasts.ts        # Extract toast logic
└── providers/
    └── PortalProvider.tsx  # Context if needed
```

### 5.2 Xoá Mock Data

Sau khi tất cả modules đã migrate:

```bash
# Xoá folder mock data
rm -rf src/data/

# Remove unused imports
# Verify app still works
npm run build
```

### 5.3 Performance Optimization

- [ ] React.memo cho heavy components
- [ ] useMemo/useCallback cho computed values
- [ ] Virtual list cho message list (nếu > 1000 items)
- [ ] Code splitting theo route
- [ ] Image lazy loading

---

## 6. Migration Checklist

### Phase 1 Checklist

- [ ] **1.1** Install dependencies
- [ ] **1.2** Setup React Router
- [ ] **1.3** Setup TanStack Query
- [ ] **1.4** Setup Zustand stores
- [ ] **1.5** Setup Axios client
- [ ] **1.6** Setup SignalR client
- [ ] **1.7** Restructure types
- [ ] **1.8** Setup MSW
- [ ] **Checkpoint:** `checkpoint-001_[foundation]_complete`

### Phase 2 Checklist

#### [auth] Module
- [ ] auth.api.ts
- [ ] useLogin mutation
- [ ] useLogout mutation
- [ ] useMe query
- [ ] Login page
- [ ] Protected routes
- [ ] **Checkpoint:** `checkpoint-002_[auth]_complete`

#### [org] Module
- [ ] organization.api.ts
- [ ] useDepartments hook
- [ ] useUsers hook
- [ ] useGroups hook
- [ ] MainSidebar integration
- [ ] LeftSidebar integration
- [ ] **Checkpoint:** `checkpoint-003_[org]_complete`

#### [chat] Module
- [ ] messages.api.ts
- [ ] useMessages hook
- [ ] usePinnedMessages hook
- [ ] useSendMessage mutation
- [ ] usePinMessage mutation
- [ ] SignalR integration
- [ ] ChatMain integration
- [ ] MessageBubble integration
- [ ] PinnedMessagesPanel integration
- [ ] **Checkpoint:** `checkpoint-004_[chat]_complete`

#### [file] Module
- [ ] files.api.ts
- [ ] useGroupFiles hook
- [ ] useUploadFile mutation
- [ ] useDeleteFile mutation
- [ ] FileManager integration
- [ ] FilePreviewModal integration
- [ ] **Checkpoint:** `checkpoint-005_[file]_complete`

#### [task] Module
- [ ] tasks.api.ts
- [ ] useTasks hook
- [ ] useTaskDetail hook
- [ ] useTaskLogs hook
- [ ] useCreateTask mutation
- [ ] useUpdateTask mutation
- [ ] useUpdateChecklist mutation
- [ ] useSendTaskLog mutation
- [ ] RightPanel integration
- [ ] AssignTaskSheet integration
- [ ] TaskChecklist integration
- [ ] TaskLogThreadSheet integration
- [ ] **Checkpoint:** `checkpoint-006_[task]_complete`

### Phase 3 Checklist

- [ ] Refactor PortalWireframes
- [ ] Delete mock data
- [ ] Performance optimization
- [ ] Final testing
- [ ] **Checkpoint:** `checkpoint-010_sprint-complete`

---

## 7. Risk & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing UI | Medium | High | Checkpoint sau mỗi step, test ngay |
| API không match types | Medium | Medium | Sử dụng MSW để mock trước |
| SignalR connection issues | Medium | High | Fallback polling, retry logic |
| Performance degradation | Low | Medium | Profiling sau mỗi module |
| Merge conflicts | Low | Low | Feature branches, frequent merge |

### Recovery Plan

Nếu migration thất bại:

1. **Single component fail:**
   ```bash
   git checkout HEAD~1 -- src/path/to/component.tsx
   ```

2. **Module fail:**
   ```bash
   git reset --hard checkpoint-XXX
   ```

3. **Complete fail:**
   ```bash
   git checkout checkpoint-001_[foundation]_complete
   git checkout -b feature/retry-migration
   ```

---

## 📎 Related Documents

- [Implementation Plan](./implementation_plan_20251226.md)
- [Copilot Workflow Guide](../copilot_workflow_guide_20251226_claude_opus_4_5.md)
- [Module Docs](../modules/_index.md)
- [Rollback Guide](../rollback/rollback_guide.md)

---

**© 2025 - Tạo bởi Claude Opus 4.5 (GitHub Copilot)**

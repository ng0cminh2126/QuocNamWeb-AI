# Session 001: Foundation Infrastructure Setup

> **Ngày:** 2025-12-26  
> **Model:** Claude Opus 4.5  
> **Sprint:** 0  
> **Task IDs:** 1.1 - 1.8 (Phase 1 Foundation)  
> **Module:** `[foundation]`

---

## 🎯 Mục tiêu session

- [ ] Install dependencies (TanStack Query, Zustand, Router, Axios, SignalR)
- [ ] Setup project structure (api/, hooks/, stores/, routes/, types/)
- [ ] Setup TanStack Query provider
- [ ] Setup basic Zustand stores
- [ ] Setup Axios client with interceptors
- [ ] Setup SignalR client base
- [ ] Restructure types

---

## 📋 Pre-session Checklist

- [ ] Git status clean
- [ ] Branch: `feature/phase1-foundation`
- [ ] Terminal ready
- [ ] Mockup app đang chạy được (`npm run dev`)

---

## 📝 Các bước thực hiện

### Step 1: Create feature branch

**Command:**
```bash
git checkout -b feature/phase1-foundation
```

**Commit:** Initial branch

---

### Step 2: Install dependencies

**Command:**
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools zustand react-router-dom axios @microsoft/signalr
```

**Verification:**
- [ ] package.json updated
- [ ] node_modules installed
- [ ] No errors

**Commit:**
```bash
git add package.json package-lock.json
git commit -m "chore(deps): install TanStack Query, Zustand, Router, Axios, SignalR"
```

---

### Step 3: Create folder structure

**Prompt:**
```
Tạo folder structure cho Phase 1 Foundation:

src/
├── api/
│   └── client.ts
├── hooks/
│   ├── queries/
│   │   └── .gitkeep
│   └── mutations/
│       └── .gitkeep
├── stores/
│   ├── index.ts
│   ├── authStore.ts
│   └── uiStore.ts
├── routes/
│   ├── index.tsx
│   └── routes.ts
├── lib/
│   ├── queryClient.ts
│   └── signalr.ts
└── types/
    ├── index.ts
    ├── common.ts
    ├── auth.ts
    ├── organization.ts
    ├── messages.ts
    ├── tasks.ts
    └── api.ts

Chỉ tạo file structure với nội dung placeholder cơ bản.
Chưa implement logic chi tiết.
```

**Files tạo:**
| File | Action | Mô tả |
|------|--------|-------|
| `src/api/client.ts` | NEW | Axios instance placeholder |
| `src/stores/*.ts` | NEW | Zustand stores placeholder |
| `src/routes/*.tsx` | NEW | Router placeholder |
| `src/lib/*.ts` | NEW | Query client, SignalR placeholder |
| `src/types/*.ts` | NEW | Types structure |

**Commit:**
```bash
git add .
git commit -m "chore(structure): create foundation folder structure"
```

---

### Step 4: Setup TanStack Query

**Prompt:**
```
Setup TanStack Query trong project:

1. Tạo src/lib/queryClient.ts với config:
   - staleTime: 30 seconds
   - gcTime: 5 minutes
   - retry: 2
   - refetchOnWindowFocus: false

2. Update src/main.tsx:
   - Wrap App với QueryClientProvider
   - Add ReactQueryDevtools (chỉ trong development)

Giữ nguyên code hiện có trong main.tsx, chỉ thêm providers.
```

**Files:**
| File | Action |
|------|--------|
| `src/lib/queryClient.ts` | NEW |
| `src/main.tsx` | MODIFIED |

**Verification:**
- [ ] App vẫn chạy
- [ ] DevTools hiển thị (góc dưới phải)

**Commit:**
```bash
git commit -m "feat(foundation): setup TanStack Query with devtools"
```

---

### Step 5: Setup Zustand Stores

**Prompt:**
```
Tạo Zustand stores cơ bản:

1. src/stores/authStore.ts:
   - State: user, accessToken, refreshToken, isAuthenticated
   - Actions: setUser, setTokens, logout, clearAuth

2. src/stores/uiStore.ts:
   - State: viewMode, currentView, showRightPanel, selectedGroupId, selectedWorkTypeId
   - Actions: setViewMode, setCurrentView, toggleRightPanel, setSelectedGroup, setSelectedWorkType

3. src/stores/index.ts:
   - Export tất cả stores

Sử dụng TypeScript với proper interfaces.
Sử dụng persist middleware cho authStore (localStorage).
```

**Files:**
| File | Action |
|------|--------|
| `src/stores/authStore.ts` | NEW |
| `src/stores/uiStore.ts` | NEW |
| `src/stores/index.ts` | NEW |

**Verification:**
- [ ] TypeScript không lỗi
- [ ] App vẫn chạy

**Commit:**
```bash
git commit -m "feat(foundation): setup Zustand stores (auth, ui)"
```

---

### Step 6: Setup Axios Client

**Prompt:**
```
Tạo Axios client với interceptors:

File: src/api/client.ts

1. Tạo axios instance với:
   - baseURL từ env: VITE_API_BASE_URL (default: '/api')
   - Default headers: Content-Type: application/json

2. Request interceptor:
   - Lấy accessToken từ authStore
   - Add Authorization header nếu có token

3. Response interceptor:
   - Handle 401 Unauthorized:
     - Có thể gọi refresh token (TODO comment)
     - Hoặc logout user
   - Return error cho các trường hợp khác

Sử dụng TypeScript.
Import authStore để lấy token.
```

**Files:**
| File | Action |
|------|--------|
| `src/api/client.ts` | NEW/UPDATE |

**Verification:**
- [ ] TypeScript không lỗi

**Commit:**
```bash
git commit -m "feat(foundation): setup Axios client with auth interceptors"
```

---

### Step 7: Setup SignalR Client

**Prompt:**
```
Tạo SignalR client base:

File: src/lib/signalr.ts

1. Class ChatHubConnection với:
   - Private connection: HubConnection
   - Private isConnecting flag

2. Methods:
   - start(): Connect với auto-reconnect
   - stop(): Disconnect
   - joinGroup(groupId): Invoke JoinGroup
   - leaveGroup(groupId): Invoke LeaveGroup
   - sendTyping(groupId, isTyping): Invoke SendTyping

3. Event listeners (placeholder):
   - onReceiveMessage(callback)
   - onMessageUpdated(callback)
   - onUserTyping(callback)
   - off methods để cleanup

4. Config:
   - HUB_URL từ env: VITE_SIGNALR_HUB_URL (default: '/hubs/chat')
   - accessTokenFactory lấy từ authStore
   - Auto-reconnect: [0, 2000, 5000, 10000, 30000]

Export singleton instance: chatHub
```

**Files:**
| File | Action |
|------|--------|
| `src/lib/signalr.ts` | NEW |

**Verification:**
- [ ] TypeScript không lỗi

**Commit:**
```bash
git commit -m "feat(foundation): setup SignalR client base"
```

---

### Step 8: Restructure Types

**Prompt:**
```
Move và restructure types từ src/features/portal/types.ts:

1. src/types/common.ts:
   - type ID = string
   - type ISODate = string
   - BadgeType, ToastKind, UserRole

2. src/types/auth.ts:
   - User interface
   - LoginRequest, LoginResponse
   - RefreshRequest, RefreshResponse

3. src/types/organization.ts:
   - Department
   - GroupChat, GroupMember
   - WorkType, ChecklistVariant

4. src/types/messages.ts:
   - Message, TaskLogMessage
   - FileAttachment, AttachmentType
   - PinnedMessage

5. src/types/tasks.ts:
   - Task, TaskStatus, TaskEvent
   - ChecklistItem, ChecklistTemplate

6. src/types/api.ts:
   - PaginatedResponse<T>
   - ApiError
   - Common response wrappers

7. src/types/index.ts:
   - Re-export tất cả

GIỮ NGUYÊN file cũ src/features/portal/types.ts để không break imports.
Thêm comment deprecated và re-export từ src/types/.
```

**Files:**
| File | Action |
|------|--------|
| `src/types/*.ts` | NEW |
| `src/features/portal/types.ts` | MODIFIED (add re-export) |

**Verification:**
- [ ] App vẫn chạy (imports không break)
- [ ] TypeScript không lỗi

**Commit:**
```bash
git commit -m "feat(foundation): restructure types into separate modules"
```

---

### Step 9: Setup Basic Router (Optional - có thể làm sau)

**Prompt:**
```
Setup React Router cơ bản:

1. src/routes/routes.ts:
   - Define route paths as constants

2. src/routes/index.tsx:
   - BrowserRouter setup
   - Routes:
     - / → redirect to /portal
     - /portal/* → PortalWireframes
     - /login → TODO placeholder

3. Update src/App.tsx:
   - Wrap với RouterProvider hoặc BrowserRouter

CHÚ Ý: Giữ nguyên logic routing hiện tại trong PortalWireframes.
Chỉ wrap thêm layer Router bên ngoài, chưa thay đổi internal routing.
```

**Verification:**
- [ ] App vẫn chạy với URL hiện tại
- [ ] Console không có warnings

**Commit:**
```bash
git commit -m "feat(foundation): setup React Router base"
```

---

### Step 10: Create Checkpoint

**Commands:**
```bash
# Verify everything
npm run lint
npm run build
npm run dev

# Create tag
git tag checkpoint-001_[foundation]_infrastructure-complete

# Push
git push origin feature/phase1-foundation
git push origin checkpoint-001_[foundation]_infrastructure-complete
```

---

## ✅ Kết quả cuối session

### Hoàn thành:
- [ ] Dependencies installed
- [ ] Folder structure created
- [ ] TanStack Query setup
- [ ] Zustand stores setup
- [ ] Axios client setup
- [ ] SignalR client setup
- [ ] Types restructured
- [ ] Router setup (optional)

### Checkpoint:
- Tag: `checkpoint-001_[foundation]_infrastructure-complete`

---

## 🔄 Rollback

### Undo toàn bộ session:
```bash
git checkout main
git branch -D feature/phase1-foundation
```

### Quay về step cụ thể:
```bash
git log --oneline -10
git reset --hard [commit-hash]
```

---

## 📋 Next steps

- [ ] Session 002: [auth] Login API & Auth flow
- [ ] Session 003: [org] Groups & Users hooks
- [ ] Session 004: [chat] Messages API & hooks

---

## 💡 Notes

- Chưa implement MSW trong session này (có thể thêm sau nếu cần)
- Router setup có thể defer nếu app vẫn hoạt động tốt
- Focus vào infrastructure, chưa đụng UI components

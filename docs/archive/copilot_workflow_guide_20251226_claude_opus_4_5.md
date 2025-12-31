# 🤖 Hướng Dẫn Làm Việc Với GitHub Copilot - Quoc Nam Portal

> **Ngày tạo:** 2025-12-26  
> **Model AI:** Claude Opus 4.5 (GitHub Copilot)  
> **Version:** 1.0  
> **Dự án:** M1 Portal Internal Chat - Frontend Implementation

---

## 📋 Mục Lục

1. [Nguyên tắc cốt lõi](#1-nguyên-tắc-cốt-lõi)
2. [Cấu trúc tài liệu & Version Control](#2-cấu-trúc-tài-liệu--version-control)
3. [Workflow từng bước](#3-workflow-từng-bước)
4. [Template Prompt cho từng loại task](#4-template-prompt-cho-từng-loại-task)
5. [Checkpoint & Rollback Strategy](#5-checkpoint--rollback-strategy)
6. [Quy tắc đặt tên và tổ chức code](#6-quy-tắc-đặt-tên-và-tổ-chức-code)
7. [Troubleshooting Guide](#7-troubleshooting-guide)
8. [Checklist trước khi bắt đầu mỗi task](#8-checklist-trước-khi-bắt-đầu-mỗi-task)

---

## 1. Nguyên tắc cốt lõi

### 1.1 Quy tắc ATOMIC (Một việc một lần)

```
✅ TỐT: "Tạo hook useMessages để fetch messages với infinite scroll"
❌ XẤU: "Tạo tất cả hooks cho chat module"
```

**Lý do:** 
- Dễ review và validate kết quả
- Dễ rollback nếu có lỗi
- Copilot hiểu rõ context hơn

### 1.2 Quy tắc CONTEXT (Cung cấp đủ ngữ cảnh)

```
✅ TỐT: 
"Tạo hook useMessages dựa trên:
- API: GET /api/groups/:groupId/messages
- Response type: MessagesResponse (đã define trong src/types/api.ts)  
- Sử dụng TanStack Query useInfiniteQuery
- Tham khảo mockMessages.ts để hiểu data structure"

❌ XẤU: "Tạo hook lấy messages"
```

### 1.3 Quy tắc INCREMENTAL (Tăng dần độ phức tạp)

```
Bước 1: Tạo types/interfaces
Bước 2: Tạo API client function
Bước 3: Tạo hook cơ bản
Bước 4: Thêm error handling
Bước 5: Thêm optimistic updates
Bước 6: Integration với component
```

### 1.4 Quy tắc VERIFY (Kiểm tra sau mỗi bước)

```
Sau mỗi bước code:
1. ✅ File được tạo/sửa đúng vị trí
2. ✅ TypeScript không có lỗi (npm run lint)
3. ✅ Import/export đúng
4. ✅ App vẫn chạy được (npm run dev)
```

---

## 2. Cấu trúc tài liệu & Version Control

### 2.1 Cấu trúc thư mục docs

```
docs/
├── plans/                              # Kế hoạch tổng quan
│   └── implementation_plan_YYYYMMDD.md
│
├── sessions/                           # Log từng phiên làm việc
│   ├── _index.md                       # Index theo module & date
│   ├── _session_template.md
│   ├── session_001_20251226_[chat]_api-client.md
│   └── session_002_20251227_[task]_crud-hooks.md
│
├── checkpoints/                        # Điểm checkpoint
│   ├── _index.md                       # Index tất cả checkpoints
│   ├── _checkpoint_template.md
│   ├── checkpoint_001_foundation.md
│   └── checkpoint_002_[chat]_complete.md
│
├── modules/                            # 🆕 Reference docs per module
│   ├── _index.md                       # Index all modules
│   ├── chat/
│   │   ├── README.md                   # Module overview
│   │   ├── api-spec.md                 # API specification
│   │   └── signalr-events.md
│   ├── task/
│   │   ├── README.md
│   │   ├── api-spec.md
│   │   └── workflow.md
│   ├── file/
│   │   ├── README.md
│   │   └── api-spec.md
│   ├── auth/
│   └── org/
│
├── prompts/                            # Prompt templates (tái sử dụng)
│   ├── prompt_create_api_client.md
│   ├── prompt_create_query_hook.md
│   ├── prompt_create_mutation_hook.md
│   └── prompt_integrate_component.md
│
├── rollback/                           # Hướng dẫn rollback
│   └── rollback_guide.md
│
└── guides/                             # Hướng dẫn chung
    └── copilot_workflow_guide_YYYYMMDD_model.md
```

### 2.2 Naming Convention (Hybrid Approach)

**Session files:**
```
session_[NUMBER]_[YYYYMMDD]_[MODULE]_[title].md

# Ví dụ:
session_001_20251226_[foundation]_project-setup.md
session_002_20251226_[chat]_api-client.md
session_003_20251227_[chat+task]_integration.md   # Cross-module
```

**Checkpoint files:**
```
checkpoint_[NUMBER]_[MODULE(s)]_[title].md

# Ví dụ:
checkpoint_001_foundation-complete.md             # Cross-all
checkpoint_002_[auth]_login-flow.md               # Single module
checkpoint_003_[chat+task]_integrated.md          # Multi-module
checkpoint_010_sprint1-complete.md                # Sprint milestone
```

**Module tags:**
| Tag | Module |
|-----|--------|
| `[foundation]` | Setup, config, base infrastructure |
| `[auth]` | Authentication, authorization |
| `[chat]` | Messages, SignalR, real-time |
| `[task]` | Task management, checklist |
| `[file]` | Upload, preview, file management |
| `[org]` | Users, departments, groups |

### 2.2 Format Session Log

```markdown
# Session [NUMBER]: [TITLE]

> **Ngày:** YYYY-MM-DD HH:mm  
> **Model:** Claude Opus 4.5  
> **Sprint:** [Sprint number]  
> **Task ID:** [Task ID từ implementation plan]

## 🎯 Mục tiêu
- [ ] Task 1
- [ ] Task 2

## 📝 Các bước thực hiện

### Step 1: [Tên bước]
**Prompt sử dụng:**
```
[Prompt text]
```

**Files tạo/sửa:**
- `src/path/to/file.ts` - [Mô tả ngắn]

**Kết quả:**
- ✅ Thành công / ❌ Thất bại
- [Ghi chú nếu có]

**Git commit:** `abc1234` - "feat: [message]"

### Step 2: ...

## ✅ Kết quả cuối session
- [Tóm tắt những gì đã hoàn thành]

## 🔄 Rollback (nếu cần)
```bash
git revert [commit-hash]
# hoặc
git reset --hard [checkpoint-commit]
```

## 📎 Files đã thay đổi
- `src/api/messages.api.ts` (new)
- `src/hooks/useMessages.ts` (new)
- `src/components/ChatMain.tsx` (modified)
```

### 2.3 Git Commit Convention

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat     # Tính năng mới
fix      # Sửa lỗi
refactor # Refactor code
docs     # Documentation
style    # Formatting, không ảnh hưởng logic
test     # Thêm tests
chore    # Maintenance tasks

# Ví dụ:
git commit -m "feat(chat): add useMessages hook with infinite scroll"
git commit -m "fix(auth): handle token refresh race condition"
git commit -m "refactor(tasks): extract checklist logic to separate hook"
```

### 2.4 Branching Strategy

```
main
  └── develop
        ├── feature/sprint-0-foundation
        ├── feature/sprint-1-auth
        ├── feature/sprint-2-chat
        └── feature/sprint-3-tasks
```

```bash
# Tạo branch mới cho mỗi sprint/feature
git checkout develop
git pull origin develop
git checkout -b feature/sprint-1-auth

# Commit thường xuyên (mỗi step hoàn thành)
git add .
git commit -m "feat(auth): add login API client"

# Tạo checkpoint tag
git tag checkpoint-001-auth-api

# Merge khi hoàn thành feature
git checkout develop
git merge feature/sprint-1-auth
```

---

## 3. Workflow từng bước

### 3.1 Quy trình cho mỗi Task

```
┌─────────────────────────────────────────────────────────────────┐
│                    TASK WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  PLAN    │───▶│  CODE    │───▶│  VERIFY  │───▶│  COMMIT  │  │
│  │          │    │          │    │          │    │          │  │
│  │ - Read   │    │ - Prompt │    │ - Lint   │    │ - Git    │  │
│  │   spec   │    │ - Review │    │ - Test   │    │ - Tag    │  │
│  │ - Check  │    │ - Iterate│    │ - Run    │    │ - Log    │  │
│  │   deps   │    │          │    │          │    │          │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │                               │                         │
│       │         ┌──────────┐          │                         │
│       │         │ ROLLBACK │◀─────────┘                         │
│       │         │          │    (nếu verify fail)               │
│       │         │ - Revert │                                    │
│       │         │ - Fix    │                                    │
│       │         │ - Retry  │                                    │
│       │         └──────────┘                                    │
│       │              │                                          │
│       └──────────────┘                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Chi tiết từng Phase

#### Phase 1: PLAN (Chuẩn bị)

```markdown
□ Đọc lại task description từ implementation_plan
□ Xác định dependencies (cần gì trước)
□ Xác định files sẽ tạo/sửa
□ Chuẩn bị prompt (dùng template)
□ Mở các file reference trong VS Code
```

#### Phase 2: CODE (Thực hiện)

```markdown
□ Gửi prompt cho Copilot
□ Review code được generate
□ Request chỉnh sửa nếu cần
□ Lưu prompt đã dùng vào docs/prompts/
```

#### Phase 3: VERIFY (Kiểm tra)

```bash
# Chạy lint
npm run lint

# Chạy type check
npx tsc --noEmit

# Chạy dev server
npm run dev

# Test thủ công trên browser
# Kiểm tra console không có lỗi
```

#### Phase 4: COMMIT (Lưu lại)

```bash
# Stage changes
git add .

# Commit với message rõ ràng
git commit -m "feat(module): description"

# Tạo tag nếu là checkpoint quan trọng
git tag checkpoint-XXX-description

# Push (optional, tuỳ workflow)
git push origin feature/branch-name
```

---

## 4. Template Prompt cho từng loại task

### 4.1 Template: Tạo API Client Function

```markdown
## Task: Tạo API client function cho [MODULE]

### Context:
- API Endpoint: [METHOD] [URL]
- Request type: [Type name hoặc inline definition]
- Response type: [Type name hoặc inline definition]
- Authentication: Bearer token (đã setup trong src/api/client.ts)

### Reference files:
- Types: src/types/[module].ts
- Existing API: src/api/[other].api.ts (để tham khảo pattern)

### Yêu cầu:
1. Tạo file src/api/[module].api.ts
2. Export các functions: [list functions]
3. Sử dụng axios instance từ src/api/client.ts
4. Có proper TypeScript types

### Expected output:
```typescript
// src/api/[module].api.ts
// [Mô tả ngắn về file]
```
```

### 4.2 Template: Tạo TanStack Query Hook

```markdown
## Task: Tạo hook [HOOK_NAME] 

### Context:
- API function: [function name] từ src/api/[module].api.ts
- Query key: ['module', params...]
- Options: [staleTime, cacheTime, etc.]

### Reference:
- API types: src/types/[module].ts
- Existing hooks: src/hooks/queries/[other].ts

### Yêu cầu:
1. Tạo file src/hooks/queries/[hookName].ts
2. Sử dụng useQuery/useInfiniteQuery từ @tanstack/react-query
3. Export hook với proper TypeScript generics
4. Handle loading, error states
5. [Thêm yêu cầu đặc biệt: infinite scroll, polling, etc.]

### Expected usage:
```typescript
const { data, isLoading, error } = use[HookName](params);
```
```

### 4.3 Template: Tạo Mutation Hook

```markdown
## Task: Tạo mutation hook [HOOK_NAME]

### Context:
- API function: [function name] từ src/api/[module].api.ts
- Mutation key: ['module', 'action']
- Invalidate queries: [list query keys to invalidate]

### Yêu cầu:
1. Tạo file src/hooks/mutations/[hookName].ts
2. Sử dụng useMutation từ @tanstack/react-query
3. Implement onSuccess để invalidate related queries
4. Implement onError để show toast notification
5. [Optional: Optimistic updates]

### Expected usage:
```typescript
const { mutate, isLoading } = use[HookName]();
mutate(payload);
```
```

### 4.4 Template: Tạo Zustand Store

```markdown
## Task: Tạo Zustand store cho [MODULE]

### Context:
- Purpose: [Mô tả mục đích của store]
- State cần quản lý: [list state fields]
- Actions cần có: [list actions]

### Reference:
- Existing stores: src/stores/[other]Store.ts

### Yêu cầu:
1. Tạo file src/stores/[module]Store.ts
2. Define interface cho state và actions
3. Implement với persist middleware (nếu cần)
4. Export hook use[Module]Store

### State structure:
```typescript
interface [Module]State {
  // State fields
}

interface [Module]Actions {
  // Action methods  
}
```
```

### 4.5 Template: Integrate Component với Real Data

```markdown
## Task: Integrate [COMPONENT_NAME] với real API data

### Context:
- Component file: src/features/portal/[path]/[Component].tsx
- Hiện tại dùng mock data từ: src/data/[mock].ts
- Cần thay bằng hook: use[HookName] từ src/hooks/queries/[hook].ts

### Yêu cầu:
1. Import hook thay vì mock data
2. Handle loading state (skeleton hoặc spinner)
3. Handle error state (error message hoặc retry button)
4. Handle empty state
5. Giữ nguyên UI/UX hiện tại

### Checklist:
- [ ] Remove mock data import
- [ ] Add hook import
- [ ] Add loading state UI
- [ ] Add error state UI
- [ ] Test with network throttling
```

### 4.6 Template: Tạo Component mới

```markdown
## Task: Tạo component [COMPONENT_NAME]

### Context:
- Vị trí: src/features/portal/components/[Component].tsx
- Purpose: [Mô tả chức năng]
- Props interface: [define or reference]

### Design reference:
- Mockup: [link hoặc mô tả]
- Similar component: [reference existing component]

### Yêu cầu:
1. Sử dụng TypeScript với proper props interface
2. Sử dụng Tailwind CSS cho styling
3. Sử dụng Radix UI components nếu cần (từ src/components/ui/)
4. Responsive design (mobile + desktop)
5. Accessibility: proper ARIA labels

### Component structure:
```typescript
interface [Component]Props {
  // Props
}

export function [Component]({ ... }: [Component]Props) {
  // Implementation
}
```
```

---

## 5. Checkpoint & Rollback Strategy

### 5.1 Checkpoint Levels

```
Level 1: MICRO (mỗi step trong task)
└── Git commit thường

Level 2: TASK (hoàn thành 1 task)
└── Git commit + tag nhỏ

Level 3: MILESTONE (hoàn thành nhóm tasks)
└── Git tag + Session log + Checkpoint doc

Level 4: SPRINT (hoàn thành sprint)
└── Git tag + Merge to develop + Full documentation
```

### 5.2 Khi nào tạo Checkpoint

```markdown
✅ Tạo checkpoint khi:
- Hoàn thành một module/feature hoàn chỉnh
- Trước khi refactor lớn
- Khi code đang hoạt động tốt
- Cuối mỗi session làm việc

❌ KHÔNG tạo checkpoint khi:
- Code đang có lỗi
- Feature chưa hoàn chỉnh
- Đang giữa chừng refactor
```

### 5.3 Tạo Checkpoint Document

```markdown
# Checkpoint [NUMBER]: [TITLE]

> **Ngày:** YYYY-MM-DD HH:mm  
> **Git tag:** checkpoint-XXX  
> **Git commit:** [hash]  
> **Branch:** feature/xxx

## 📦 Những gì đã hoàn thành
- [List features/tasks completed]

## 📁 Files mới tạo
- `src/api/messages.api.ts`
- `src/hooks/queries/useMessages.ts`

## 📝 Files đã sửa
- `src/features/portal/workspace/ChatMain.tsx`

## 🔧 Dependencies đã thêm
```json
{
  "@tanstack/react-query": "^5.x"
}
```

## ✅ Verification status
- [x] npm run lint - pass
- [x] npm run dev - running
- [x] Manual test - OK

## 🔄 Rollback command
```bash
git checkout checkpoint-XXX
# hoặc
git reset --hard checkpoint-XXX
```

## 📋 Next steps
- [ ] Task tiếp theo cần làm
```

### 5.4 Rollback Procedures

#### Rollback Level 1: Undo last change

```bash
# Undo uncommitted changes
git checkout -- .

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

#### Rollback Level 2: Return to checkpoint

```bash
# Xem danh sách checkpoints
git tag -l "checkpoint-*"

# Checkout về checkpoint cụ thể
git checkout checkpoint-005

# Hoặc reset branch về checkpoint
git reset --hard checkpoint-005
```

#### Rollback Level 3: Full feature rollback

```bash
# Xem history
git log --oneline -20

# Revert một commit cụ thể
git revert [commit-hash]

# Revert nhiều commits
git revert [older-hash]..[newer-hash]
```

### 5.5 Recovery từ Session Log

Nếu cần làm lại một task:

1. Mở session log tương ứng: `docs/sessions/session_XXX.md`
2. Tìm prompt đã dùng
3. Checkout về checkpoint trước đó
4. Chạy lại prompt với điều chỉnh

```bash
# Ví dụ recovery flow
git checkout checkpoint-004
git checkout -b feature/retry-messages-hook

# Sau đó dùng lại prompt từ session log
# với các điều chỉnh cần thiết
```

---

## 6. Quy tắc đặt tên và tổ chức code

### 6.1 File Naming Convention

```
# API clients
src/api/[module].api.ts
  messages.api.ts
  tasks.api.ts
  auth.api.ts

# Query hooks
src/hooks/queries/use[Entity][Action].ts
  useMessages.ts
  useMessagesPinned.ts
  useTasks.ts
  useTaskDetail.ts

# Mutation hooks
src/hooks/mutations/use[Action][Entity].ts
  useSendMessage.ts
  useCreateTask.ts
  useUpdateTask.ts

# Stores
src/stores/[module]Store.ts
  authStore.ts
  chatStore.ts
  uiStore.ts

# Types
src/types/[module].ts
  auth.ts
  messages.ts
  tasks.ts
  api.ts (common API types)
```

### 6.2 Export Patterns

```typescript
// ✅ Named exports cho utilities và hooks
export function useMessages() { }
export function sendMessage() { }

// ✅ Barrel exports trong index.ts
// src/hooks/queries/index.ts
export * from './useMessages';
export * from './useTasks';

// ✅ Default export chỉ cho components
export default function ChatMain() { }

// ❌ Tránh mixing default và named exports trong cùng file
```

### 6.3 Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { useMessages } from '@/hooks/queries/useMessages';
import { Button } from '@/components/ui/button';
import type { Message } from '@/types/messages';

// 2. Types/Interfaces
interface ChatMainProps {
  groupId: string;
  workTypeId?: string;
}

// 3. Component
export default function ChatMain({ groupId, workTypeId }: ChatMainProps) {
  // 3a. Hooks (queries, mutations, stores)
  const { data, isLoading } = useMessages(groupId, workTypeId);
  
  // 3b. Local state
  const [input, setInput] = useState('');
  
  // 3c. Derived values
  const messages = data?.pages.flatMap(p => p.data) ?? [];
  
  // 3d. Handlers
  const handleSend = () => { };
  
  // 3e. Effects
  useEffect(() => { }, []);
  
  // 3f. Early returns (loading, error)
  if (isLoading) return <Skeleton />;
  
  // 3g. Main render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 6.4 Hook Structure

```typescript
// src/hooks/queries/useMessages.ts

import { useInfiniteQuery } from '@tanstack/react-query';
import { getMessages } from '@/api/messages.api';
import type { MessagesResponse } from '@/types/messages';

// Query key factory
export const messagesKeys = {
  all: ['messages'] as const,
  lists: () => [...messagesKeys.all, 'list'] as const,
  list: (groupId: string, workTypeId?: string) => 
    [...messagesKeys.lists(), groupId, workTypeId] as const,
  details: () => [...messagesKeys.all, 'detail'] as const,
  detail: (id: string) => [...messagesKeys.details(), id] as const,
};

// Hook
export function useMessages(groupId: string, workTypeId?: string) {
  return useInfiniteQuery({
    queryKey: messagesKeys.list(groupId, workTypeId),
    queryFn: ({ pageParam }) => 
      getMessages(groupId, { workTypeId, before: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.oldestMessageId : undefined,
    staleTime: 1000 * 30, // 30 seconds
  });
}
```

---

## 7. Troubleshooting Guide

### 7.1 Common Issues & Solutions

#### Issue: TypeScript errors sau khi Copilot generate code

```bash
# Chạy type check để xem chi tiết lỗi
npx tsc --noEmit

# Common fixes:
# 1. Missing import - thêm import statement
# 2. Wrong type - check API response type
# 3. Null/undefined - add optional chaining (?.)
```

**Prompt để fix:**
```
TypeScript báo lỗi: [paste error message]
File: [filename]
Hãy sửa lỗi này, giữ nguyên logic hiện tại.
```

#### Issue: Hook không re-render khi data thay đổi

```typescript
// Check 1: Query key có đúng không?
queryKey: ['messages', groupId, workTypeId] // groupId thay đổi → refetch

// Check 2: Dependencies trong useEffect
useEffect(() => { }, [dependency1, dependency2]);

// Check 3: Có invalidate query sau mutation không?
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['messages'] });
}
```

#### Issue: Infinite scroll không hoạt động

```typescript
// Check 1: getNextPageParam return đúng không?
getNextPageParam: (lastPage) => {
  console.log('lastPage:', lastPage); // Debug
  return lastPage.hasMore ? lastPage.nextCursor : undefined;
}

// Check 2: API có trả về hasMore/cursor không?

// Check 3: IntersectionObserver setup đúng không?
```

#### Issue: SignalR connection failed

```typescript
// Check 1: URL đúng không?
.withUrl("/hubs/chat", { ... })

// Check 2: Token valid không?
accessTokenFactory: () => getAccessToken()

// Check 3: CORS config ở backend?

// Debug:
.configureLogging(signalR.LogLevel.Debug)
```

### 7.2 Debug Prompts

```markdown
## Khi code không hoạt động như mong đợi:

"Code trong [file] không hoạt động đúng.

**Mong đợi:** [mô tả behavior mong đợi]
**Thực tế:** [mô tả behavior thực tế]
**Console log:** [paste any errors]

Hãy phân tích và sửa lỗi."
```

```markdown
## Khi cần explain code:

"Giải thích đoạn code sau trong [file], dòng [X-Y]:
- Logic hoạt động như thế nào?
- Có vấn đề tiềm ẩn nào không?
- Có cách nào tối ưu hơn không?"
```

### 7.3 Recovery Checklist

Khi task bị stuck hoặc failed:

```markdown
□ 1. Dừng lại, không panic
□ 2. Commit những gì đang có (với message "WIP: ...")
□ 3. Ghi chép lại vấn đề gặp phải
□ 4. Xem lại session log và prompt đã dùng
□ 5. Thử approach khác:
     - Break down thành steps nhỏ hơn
     - Tham khảo code tương tự trong project
     - Search documentation
□ 6. Nếu vẫn stuck:
     - Rollback về checkpoint gần nhất
     - Thử lại với prompt khác
□ 7. Document bài học kinh nghiệm
```

---

## 8. Checklist trước khi bắt đầu mỗi task

### 8.1 Pre-Task Checklist

```markdown
□ Git status clean (no uncommitted changes)
□ Đang ở đúng branch
□ Đã pull latest từ remote
□ Đã đọc task description
□ Đã identify dependencies
□ Đã mở reference files trong VS Code
□ Đã chuẩn bị prompt
□ Terminal sẵn sàng để test
```

### 8.2 Post-Task Checklist

```markdown
□ Code đã được review
□ npm run lint pass
□ npm run dev chạy không lỗi
□ Manual test passed
□ Git commit với message rõ ràng
□ Session log updated
□ Checkpoint created (nếu milestone)
```

### 8.3 End-of-Day Checklist

```markdown
□ Tất cả changes đã commit
□ Push to remote
□ Session log hoàn chỉnh
□ Ghi chú next steps
□ Tạo checkpoint nếu ở trạng thái ổn định
```

---

## 📎 Phụ lục

### A. Quick Reference Commands

```bash
# Git
git status
git add .
git commit -m "feat(module): message"
git tag checkpoint-XXX
git checkout checkpoint-XXX
git reset --hard checkpoint-XXX

# npm
npm run dev
npm run lint
npm run build
npx tsc --noEmit

# TypeScript check specific file
npx tsc src/path/to/file.ts --noEmit
```

### B. VS Code Shortcuts

```
Ctrl+Shift+P    → Command Palette
Ctrl+`          → Toggle Terminal
Ctrl+B          → Toggle Sidebar
Ctrl+Shift+E    → File Explorer
Ctrl+Shift+F    → Search in files
Ctrl+Shift+G    → Source Control
F12             → Go to Definition
Alt+F12         → Peek Definition
Ctrl+Space      → Trigger Copilot suggestions
```

### C. Session Log Template (Copy & Use)

```markdown
# Session [XXX]: [Title]

> **Ngày:** YYYY-MM-DD HH:mm  
> **Model:** Claude Opus 4.5  
> **Sprint:** X  
> **Task ID:** X.X.X

## 🎯 Mục tiêu
- [ ] 

## 📝 Steps

### Step 1: 
**Prompt:**
```

```

**Files:**
- 

**Result:** ✅ / ❌

**Commit:** ``

## ✅ Kết quả

## 🔄 Rollback
```bash

```

## 📋 Next
- [ ] 
```

---

**© 2025 - Tạo bởi Claude Opus 4.5 (GitHub Copilot)**

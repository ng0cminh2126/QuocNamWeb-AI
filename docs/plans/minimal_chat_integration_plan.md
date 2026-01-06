# Minimal Chat Integration Plan

> **Date:** 2025-01-05  
> **Scope:** Chỉ tích hợp API cho chat list và chat detail, giữ nguyên tasks/files  
> **Status:** ⏳ PENDING HUMAN APPROVAL

---

## 📋 OBJECTIVE

Tích hợp API thực cho:

- ✅ Danh sách đoạn chat (conversations list)
- ✅ Chi tiết chat (messages)

Giữ nguyên hoặc hiển thị empty state cho:

- ⚠️ Tasks (chưa có API)
- ⚠️ Files (chưa có API)

---

## 🔍 CURRENT STATE ANALYSIS

### Files sử dụng mock data

#### 1. PortalWireframes.tsx (Main orchestrator)

```tsx
// Line 10: Import mock conversations
import { mockGroups as sidebarGroups, mockContacts } from "@/data/mockSidebar";

// Line 13: Import mock messages
import { mockMessagesByWorkType } from "@/data/mockMessages";

// Line 133: Load messages from mock
const all = mockMessagesByWorkType[key] || [];

// Line 77-95: Merge groups data
const groupsMerged = groupsMerged từ sidebarGroups + mockGroup_VH_Kho/TaiXe
```

#### 2. ChatMessagePanel.tsx

```tsx
// Line 39: Import mock messages
import { mockMessagesByWorkType } from "@/data/mockMessages";

// Line 298: Use mock messages
const allMessages = (mockMessagesByWorkType as any)[key] || [];
```

#### 3. FileManagerPhase1A.tsx

```tsx
// Uses mockMessagesByWorkType to extract file attachments
// DECISION NEEDED: Keep mock or show empty state?
```

#### 4. ConversationDetailPanel.tsx (Tasks section)

```tsx
// Receives tasks from parent (PortalWireframes)
// DECISION NEEDED: Keep mock tasks or show "Chưa có dữ liệu"?
```

---

## 🎯 IMPLEMENTATION PLAN

### Phase 1: Replace Conversations List (PortalWireframes.tsx)

**Current mock data:**

```tsx
const groupsMerged: GroupChat[] = React.useMemo(() => {
  // Merge sidebarGroups + mockGroup_VH_Kho/TaiXe
}, []);
```

**New approach using API:**

```tsx
// 1. Fetch groups từ API
const { data: groupsData, isLoading: groupsLoading } = useGroups();
const { data: dmData, isLoading: dmLoading } = useDMConversations();

// 2. Map API types → Portal types
const groups: GroupChat[] = React.useMemo(() => {
  if (!groupsData?.data) return [];

  return groupsData.data.map((apiGroup) => ({
    id: apiGroup.id,
    name: apiGroup.name,
    avatar: apiGroup.avatar,
    lastMessage: apiGroup.lastMessage?.content || "",
    lastMessageAt: apiGroup.lastMessage?.sentAt,
    unreadCount: apiGroup.unreadCount || 0,
    isPinned: apiGroup.isPinned,
    workTypes: apiGroup.workTypes || [],
    defaultWorkTypeId: apiGroup.defaultWorkTypeId,
  }));
}, [groupsData]);
```

**Type mapping:**
| API Type (GroupConversation) | Portal Type (GroupChat) |
|------------------------------|-------------------------|
| `id` | `id` |
| `name` | `name` |
| `avatar` | `avatar` |
| `lastMessage.content` | `lastMessage` |
| `lastMessage.sentAt` | `lastMessageAt` |
| `unreadCount` | `unreadCount` |
| `isPinned` | `isPinned` |
| `workTypes` | `workTypes` |
| `defaultWorkTypeId` | `defaultWorkTypeId` |

### Phase 2: Replace Chat Messages (PortalWireframes.tsx + ChatMessagePanel.tsx)

**Current mock data:**

```tsx
// PortalWireframes.tsx line 133
const all = mockMessagesByWorkType[key] || [];
const filtered = all.filter((m) => m.groupId === selectedGroup.id);
setMessages(filtered);
```

**New approach using API:**

```tsx
// PortalWireframes.tsx
const { data: messagesData, isLoading: messagesLoading } = useMessages(
  selectedGroup?.id || "",
  selectedWorkTypeId
);

const messages: Message[] = React.useMemo(() => {
  if (!messagesData?.pages) return [];

  const allMessages = messagesData.pages.flatMap((page) => page.data);

  return allMessages.map((apiMsg) => ({
    id: apiMsg.id,
    sender: apiMsg.sender.name,
    senderId: apiMsg.sender.id,
    content: apiMsg.content,
    time: new Date(apiMsg.sentAt).toISOString(),
    type:
      apiMsg.contentType === "text"
        ? "text"
        : apiMsg.contentType === "image"
        ? "image"
        : "file",
    groupId: selectedGroup?.id,
    workTypeId: selectedWorkTypeId,
    // ... map other fields
  }));
}, [messagesData, selectedGroup?.id, selectedWorkTypeId]);
```

**Type mapping:**
| API Type (ChatMessage) | Portal Type (Message) |
|------------------------|----------------------|
| `id` | `id` |
| `sender.name` | `sender` |
| `sender.id` | `senderId` |
| `content` | `content` |
| `sentAt` | `time` |
| `contentType` | `type` (map: text→text, image→image, file→file) |
| (derived) | `groupId` (from selectedGroup) |
| (derived) | `workTypeId` (from selectedWorkTypeId) |

**ChatMessagePanel.tsx changes:**

```tsx
// BEFORE (line 298):
const allMessages = (mockMessagesByWorkType as any)[key] || [];

// AFTER:
// Remove mock import
// Use messages from props (already passed from parent)
const allMessages = messages || [];
```

### Phase 3: Handle Tasks & Files Empty State

**Option A: Keep mock data (easier, no changes needed)**

- Giữ nguyên mockTasks trong PortalWireframes
- Giữ nguyên mockMessagesByWorkType trong FileManagerPhase1A
- ✅ Advantage: No code changes, stable
- ❌ Disadvantage: Shows fake data

**Option B: Show empty state (recommended)**

#### Tasks (ConversationDetailPanel.tsx):

```tsx
// BEFORE:
<div>
  {tasks.length > 0 ? (
    <TaskList tasks={tasks} ... />
  ) : (
    <div className="text-sm text-muted-foreground">Chưa có task nào</div>
  )}
</div>

// AFTER (if empty):
const tasks: Task[] = []; // Pass empty array from parent
// Component already handles empty state
```

#### Files (FileManagerPhase1A.tsx):

```tsx
// BEFORE:
const allMsgs = mockMessagesByWorkType[workTypeKey] || [];
const filtered = allMsgs.filter((m) => m.groupId === groupId);

// AFTER:
const filtered: Message[] = messages || []; // Use messages from props
// Already passed from parent via WorkspaceView

// If no messages → no files → shows existing empty state
```

---

## 📂 FILES TO MODIFY

### ✏️ Files sẽ sửa đổi:

#### 1. `src/features/portal/PortalWireframes.tsx`

**Changes:**

- ❌ Remove: `import { mockGroups as sidebarGroups } from "@/data/mockSidebar"`
- ❌ Remove: `import { mockMessagesByWorkType } from "@/data/mockMessages"`
- ✅ Add: `import { useGroups, useDMConversations } from '@/hooks'`
- ✅ Add: `import { useMessages } from '@/hooks'`
- ✅ Replace: `const groupsMerged = useMemo(...)` with API mapping logic
- ✅ Replace: `React.useEffect(() => { const all = mockMessagesByWorkType... })` with `useMessages` hook
- ✅ Add: Loading states for groups and messages
- ⚠️ Decision: Keep `mockTasks` or pass empty array `[]` to child components

#### 2. `src/features/portal/workspace/ChatMessagePanel.tsx`

**Changes:**

- ❌ Remove: `import { mockMessagesByWorkType } from "@/data/mockMessages"`
- ❌ Remove: Line 298 `const allMessages = (mockMessagesByWorkType as any)[key] || []`
- ✅ Use: `messages` prop from parent (already declared in props interface)
- ✅ Keep: All existing UI logic, just change data source

#### 3. `src/features/portal/components/FileManagerPhase1A.tsx` (Optional - depends on HUMAN decision)

**If choosing empty state:**

- ❌ Remove: `import { mockMessagesByWorkType } from "@/data/mockMessages"`
- ✅ Use: `messages` prop from parent (if passed)
- ✅ Show: Empty state when `messages.length === 0`

**If keeping mock:**

- No changes needed

#### 4. `src/features/portal/workspace/ConversationDetailPanel.tsx` (Optional)

**If choosing empty state for tasks:**

- No code changes needed (component already handles empty `tasks` array)
- Parent (PortalWireframes) just passes `tasks={[]}` instead of `mockTasks`

---

## 🆕 FILES TO CREATE

None. All API hooks already exist:

- ✅ `src/hooks/queries/useConversations.ts` (useGroups, useDMConversations)
- ✅ `src/hooks/queries/useMessages.ts`

---

## 📊 TYPE MAPPING DETAILS

### GroupConversation → GroupChat

```typescript
// API Response (src/types/conversations.ts)
interface GroupConversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    sentAt: string;
    sender: { id: string; name: string };
  };
  unreadCount?: number;
  isPinned: boolean;
  workTypes?: WorkType[];
  defaultWorkTypeId?: string;
}

// Portal Type (src/features/portal/types.ts)
interface GroupChat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageAt?: string;
  unreadCount: number;
  isPinned?: boolean;
  workTypes?: WorkType[];
  defaultWorkTypeId?: string;
}

// Mapping function (in PortalWireframes.tsx)
const mapApiGroupToPortalGroup = (apiGroup: GroupConversation): GroupChat => ({
  id: apiGroup.id,
  name: apiGroup.name,
  avatar: apiGroup.avatar,
  lastMessage: apiGroup.lastMessage?.content || "",
  lastMessageAt: apiGroup.lastMessage?.sentAt,
  unreadCount: apiGroup.unreadCount || 0,
  isPinned: apiGroup.isPinned,
  workTypes: apiGroup.workTypes,
  defaultWorkTypeId: apiGroup.defaultWorkTypeId,
});
```

### ChatMessage → Message

```typescript
// API Response (src/types/messages.ts)
interface ChatMessage {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  contentType: "text" | "image" | "file" | "voice";
  sentAt: string;
  attachments?: FileAttachment[];
  isEdited: boolean;
  isPinned: boolean;
}

// Portal Type (src/features/portal/types.ts)
interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  time: string;
  type: "text" | "image" | "file" | "voice";
  files?: FileAttachment[];
  groupId?: string;
  workTypeId?: string;
  isPinned?: boolean;
  isEdited?: boolean;
}

// Mapping function (in PortalWireframes.tsx)
const mapApiMessageToPortalMessage = (
  apiMsg: ChatMessage,
  groupId: string,
  workTypeId: string
): Message => ({
  id: apiMsg.id,
  sender: apiMsg.sender.name,
  senderId: apiMsg.sender.id,
  content: apiMsg.content,
  time: new Date(apiMsg.sentAt).toISOString(),
  type: apiMsg.contentType,
  files: apiMsg.attachments,
  groupId,
  workTypeId,
  isPinned: apiMsg.isPinned,
  isEdited: apiMsg.isEdited,
});
```

---

## ⏳ PENDING DECISIONS (HUMAN QUYẾT ĐỊNH)

| #   | Vấn đề                          | Lựa chọn                                                                   | HUMAN Decision |
| --- | ------------------------------- | -------------------------------------------------------------------------- | -------------- |
| 1   | Tasks khi chưa có API           | A) Giữ mock `mockTasks` <br> B) Empty array `[]` + show "Chưa có dữ liệu"  | ✅ **A** - Giữ mock |
| 2   | Files khi chưa có API           | A) Giữ mock trong FileManagerPhase1A <br> B) Remove mock, show empty state | ✅ **A** - Giữ mock |
| 3   | Contacts trong sidebar          | A) Giữ `mockContacts` <br> B) Fetch từ `useDMConversations()`              | ✅ **A** - Giữ mock |
| 4   | Loading state cho conversations | A) Skeleton loader <br> B) Spinner <br> C) Text "Đang tải..."              | ✅ **A** - Skeleton |
| 5   | Error handling                  | A) Toast message <br> B) Inline error message <br> C) Retry button         | ✅ **C** - Retry button |

---

## 📋 IMPACT SUMMARY

### Files sẽ tạo mới:

- (Không có - sử dụng hooks hiện có)

### Files sẽ sửa đổi:

#### Core Changes (BẮT BUỘC):

- `src/features/portal/PortalWireframes.tsx`

  - Remove mock imports: `mockGroups`, `mockMessagesByWorkType`
  - Add API hooks: `useGroups()`, `useMessages()`
  - Add type mapping functions: `mapApiGroupToPortalGroup`, `mapApiMessageToPortalMessage`
  - Replace `groupsMerged` logic with API data mapping
  - Replace messages useEffect with `useMessages` hook
  - Add loading states handling
  - Estimated lines changed: ~50 lines

- `src/features/portal/workspace/ChatMessagePanel.tsx`
  - Remove `mockMessagesByWorkType` import
  - Remove line 298: `const allMessages = (mockMessagesByWorkType as any)[key] || []`
  - Use `messages` prop directly from parent
  - Estimated lines changed: ~5 lines

#### Optional Changes (tuỳ HUMAN decision):

- ~~`src/features/portal/components/FileManagerPhase1A.tsx`~~ ❌ **KHÔNG SỬA** (Decision #2 = A: Giữ mock)

- ~~`src/features/portal/PortalWireframes.tsx` (Tasks decision)~~ ❌ **KHÔNG SỬA** (Decision #1 = A: Giữ mock)

### Files sẽ xoá:

- (Không có - giữ mock files cho future reference)

### Dependencies sẽ thêm:

- (Không có - hooks đã tồn tại)

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests (sẽ tạo sau khi implement):

- `PortalWireframes.test.tsx`
  - Test type mapping: `mapApiGroupToPortalGroup()`
  - Test type mapping: `mapApiMessageToPortalMessage()`
  - Test loading states
  - Test error states
  - Test empty states

### Integration Tests:

- Test conversation list hiển thị đúng từ API
- Test chat messages hiển thị đúng từ API
- Test switching giữa conversations
- Test switching giữa work types

### Manual Testing Checklist:

- [ ] Danh sách conversations load từ API
- [ ] Click vào conversation hiển thị messages từ API
- [ ] Switching work types fetch messages đúng
- [ ] Loading states hiển thị đúng
- [ ] Error states hiển thị đúng
- [ ] Empty states hiển thị đúng (nếu chọn Option B)
- [ ] Tasks section (giữ mock hoặc empty state)
- [ ] Files section (giữ mock hoặc empty state)

---

## 🚀 IMPLEMENTATION STEPS

### Bước 1: Type Mapping Setup

1. Trong `PortalWireframes.tsx`, thêm helper functions:
   - `mapApiGroupToPortalGroup()`
   - `mapApiMessageToPortalMessage()`

### Bước 2: Replace Conversations List

1. Remove `mockGroups` import
2. Add `useGroups()` và `useDMConversations()` hooks
3. Map API data to `GroupChat[]` type
4. Handle loading/error states

### Bước 3: Replace Chat Messages

1. Remove `mockMessagesByWorkType` import và useEffect
2. Add `useMessages()` hook with proper params
3. Map API data to `Message[]` type
4. Pass messages to ChatMessagePanel

### Bước 4: Update ChatMessagePanel

1. Remove `mockMessagesByWorkType` import
2. Use `messages` prop directly

### Bước 5: ~~Handle Tasks & Files~~ ❌ SKIP (HUMAN Decision: Giữ mock cho cả tasks và files)

### Bước 6: Testing

1. Manual testing all scenarios
2. Fix any issues
3. Create unit tests (optional)

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                  | Status           |
| ------------------------- | ---------------- |
| Đã review Impact Summary  | ⏳ Chờ confirm   |
| Đã điền Pending Decisions | ✅ Đã điền (2026-01-06) |
| **APPROVED để thực thi**  | ⏳ CHỜ HUMAN TICK ✅ |

**HUMAN Signature:** [Chờ duyệt]  
**Date:** ******\_******

---

## 🎯 FINAL SCOPE (Based on HUMAN Decisions)

### ✅ Sẽ thực hiện:
1. ✅ Replace conversations list với API `useGroups()`
2. ✅ Replace chat messages với API `useMessages()`
3. ✅ Add Skeleton loading state
4. ✅ Add Retry button cho error handling

### ❌ KHÔNG thực hiện:
1. ❌ Tasks - Giữ nguyên `mockTasks`
2. ❌ Files - Giữ nguyên mock trong FileManagerPhase1A
3. ❌ Contacts - Giữ nguyên `mockContacts`

### 📝 Files sẽ sửa (FINAL):
- `src/features/portal/PortalWireframes.tsx` (~50 lines)
  - Remove: `mockGroups`, `mockMessagesByWorkType` imports
  - Add: `useGroups()`, `useMessages()` hooks
  - Keep: `mockTasks`, `mockContacts` imports
  
- `src/features/portal/workspace/ChatMessagePanel.tsx` (~5 lines)
  - Remove: `mockMessagesByWorkType` usage
  - Use: `messages` prop

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**
> 
> **Để tiếp tục, HUMAN vui lòng:**
> 1. Review FINAL SCOPE ở trên
> 2. Tick ✅ vào "APPROVED để thực thi" trong bảng HUMAN CONFIRMATION
> 3. Hoặc reply "APPROVED" để xác nhận
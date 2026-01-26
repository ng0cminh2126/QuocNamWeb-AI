# [BƯỚC 1] Category-Based Conversation Selector - Requirements

**Feature ID:** `CBN-002`  
**Version:** 2.0  
**Created:** 2026-01-19  
**Last Updated:** 2026-01-19  
**Status:** ⏳ PENDING HUMAN APPROVAL

---

## 📋 Tổng quan

Feature này thêm **conversation selector** vào ChatHeader (trong ChatMainContainer), cho phép user chọn conversation trong category bằng LinearTabs - tương tự WorkType selector trong ChatMessagePanel.

**Nguyên tắc quan trọng:**

- ✅ Minimal impact - chỉ thêm props optional vào ChatHeader
- ✅ Backward compatible - ChatHeader vẫn hoạt động nếu không có conversations
- ✅ Reference UI từ ChatMessagePanel, implement vào ChatMainContainer
- ✅ Không breaking existing logic

---

## 🎯 Functional Requirements

### FR-1: Optional Conversation Selector in ChatHeader

**Priority:** HIGH  
**Component:** `ChatHeader.tsx` (child of ChatMainContainer)

**Description:**  
ChatHeader nhận optional props để hiển thị LinearTabs cho conversations trong category.

**Props Interface:**

```typescript
interface ChatHeaderProps {
  // ... EXISTING props (không đổi) ...
  conversationName: string;
  conversationType?: "GRP" | "DM";
  conversationCategory?: string;
  memberCount?: number;
  onlineCount?: number;
  status?: "Active" | "Archived" | "Muted";
  avatarUrl?: string;
  isMobile?: boolean;
  onBack?: () => void;
  onOpenPinnedModal?: () => void;
  onOpenConversationStarredModal?: () => void;
  onOpenAllStarredModal?: () => void;

  // 🆕 NEW - optional props for conversation selector
  categoryConversations?: Array<{
    conversationId: string;
    conversationName: string;
    unreadCount?: number; // Optional unread badge
  }>;
  selectedConversationId?: string;
  onChangeConversation?: (conversationId: string) => void;
}
```

**Acceptance Criteria:**

- [ ] **AC-1.1:** Props mới là **optional** (`?`)
- [ ] **AC-1.2:** ChatHeader vẫn render bình thường nếu `categoryConversations` = undefined
- [ ] **AC-1.3:** Khi `categoryConversations` có data → render LinearTabs dưới status line
- [ ] **AC-1.4:** LinearTabs sử dụng cùng style với ChatMessagePanel (reference lines 557-584)
- [ ] **AC-1.5:** Active tab = `selectedConversationId` hoặc first conversation nếu undefined
- [ ] **AC-1.6:** Click tab → trigger `onChangeConversation(conversationId)`

**Edge Cases:**

- [ ] `categoryConversations` = `[]` (empty array) → không hiển thị tabs
- [ ] `categoryConversations` = `undefined` → không hiển thị tabs
- [ ] `categoryConversations` có 1 item → vẫn hiển thị 1 tab (không auto-hide)
- [ ] `selectedConversationId` không match → fallback to first conversation
- [ ] `onChangeConversation` undefined → tabs vẫn render nhưng không clickable

---

### FR-2: Auto-Select First Conversation

**Priority:** HIGH  
**Component:** `ChatMainContainer.tsx`

**Description:**  
Khi user click category từ sidebar, ChatMainContainer tự động select conversation đầu tiên.

**Logic Flow:**

```typescript
// Pseudo-code
function ChatMainContainer({ categoryId }) {
  const { data: categories } = useCategories(); // Fetch all categories
  const selectedCategory = categories?.find((c) => c.id === categoryId);

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >();

  // Auto-select first conversation when category changes
  useEffect(() => {
    if (
      selectedCategory?.conversations &&
      selectedCategory.conversations.length > 0
    ) {
      const firstConvId = selectedCategory.conversations[0].conversationId;
      setSelectedConversationId(firstConvId);
    }
  }, [selectedCategory]);

  // ... rest of component
}
```

**Acceptance Criteria:**

- [ ] **AC-2.1:** Khi `categoryId` changes → reset `selectedConversationId`
- [ ] **AC-2.2:** Auto-select `conversations[0].conversationId`
- [ ] **AC-2.3:** Trigger message loading cho conversation đã select
- [ ] **AC-2.4:** Nếu `conversations` = `[]` → `selectedConversationId` = undefined
- [ ] **AC-2.5:** useEffect chỉ chạy khi `categoryId` thay đổi (không re-run khi messages update)

---

### FR-3: Conversation Switching

**Priority:** MEDIUM  
**Component:** `ChatMainContainer.tsx`

**Description:**  
User có thể switch conversation bằng cách click tab khác.

**Logic Flow:**

```typescript
const handleConversationChange = (conversationId: string) => {
  setSelectedConversationId(conversationId);
  // Message loading tự động trigger qua conversationId prop change
};
```

**Acceptance Criteria:**

- [ ] **AC-3.1:** Click tab → update `selectedConversationId`
- [ ] **AC-3.2:** Messages query tự động refetch với `conversationId` mới
- [ ] **AC-3.3:** 🆕 Hiển thị loading state trong vùng chat khi switch conversation
- [ ] **AC-3.4:** 🆕 Loading indicator: skeleton hoặc spinner ở message area (KHÔNG ẩn tabs)
- [ ] **AC-3.5:** Scroll to bottom sau khi messages load xong
- [ ] **AC-3.6:** Clear typing indicators từ conversation cũ
- [ ] **AC-3.7:** Update document title với conversation name mới

---

### FR-4: Category Data Integration

**Priority:** CRITICAL  
**Component:** `ChatMainContainer.tsx`

**Description:**  
Extract conversations từ CategoryDto (nested data) và pass vào ChatHeader.

**Data Source:**

```typescript
// From GET /api/categories response
interface CategoryDto {
  id: string;
  userId: string;
  name: string;
  order: number;
  conversations: ConversationInfoDto[]; // 🔑 Nested conversations
  createdAt: string;
  updatedAt: string | null;
}

interface ConversationInfoDto {
  conversationId: string;
  conversationName: string;
}
```

**Implementation:**

```typescript
// In ChatMainContainer
const categoryConversations = selectedCategory?.conversations?.map((conv) => ({
  conversationId: conv.conversationId,
  conversationName: conv.conversationName,
  unreadCount: 0, // TODO: Get from unread API if available
}));

return (
  <>
    <ChatHeader
      {...existingProps}
      categoryConversations={categoryConversations} // Pass to header
      selectedConversationId={selectedConversationId}
      onChangeConversation={handleConversationChange}
    />
    {/* ... rest of component */}
  </>
);
```

**Acceptance Criteria:**

- [ ] **AC-4.1:** Extract `conversations[]` từ selected CategoryDto
- [ ] **AC-4.2:** Map to ChatHeader-compatible format
- [ ] **AC-4.3:** Handle `conversations` = undefined (old API version)
- [ ] **AC-4.4:** Handle `conversations` = `[]` (empty category)
- [ ] **AC-4.5:** Unread count hiển thị nếu có data (optional)

---

## 🎨 UI/UX Requirements

### UI-1: Visual Consistency with ChatMessagePanel

**Priority:** HIGH

**Description:**  
LinearTabs trong ChatHeader PHẢI match style của WorkType tabs trong ChatMessagePanel.

**Reference Code:** `ChatMessagePanel.tsx` lines 557-584

```tsx
<LinearTabs
  tabs={conversations.map((conv) => ({
    key: conv.conversationId,
    label: (
      <div className="relative inline-flex items-center gap-1">
        <span>{conv.conversationName}</span>
        {conv.unreadCount > 0 && (
          <span className="ml-1 inline-flex min-w-[16px] h-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-medium text-white">
            {conv.unreadCount}
          </span>
        )}
      </div>
    ),
  }))}
  active={selectedConversationId ?? conversations[0]?.conversationId}
  onChange={(id) => onChangeConversation?.(id)}
  textClass="text-xs"
  noWrap
/>
```

**Acceptance Criteria:**

- [ ] **UI-1.1:** Tab style: `text-xs`, `noWrap`
- [ ] **UI-1.2:** Unread badge: `bg-rose-500`, `min-w-[16px]`, `h-4`, `text-[10px]`
- [ ] **UI-1.3:** Badge position: `ml-1` (after name)
- [ ] **UI-1.4:** Layout: `relative inline-flex items-center gap-1`
- [ ] **UI-1.5:** Active tab highlighting (handled by LinearTabs component)

---

### UI-2: Responsive Layout

**Priority:** MEDIUM

**Desktop Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ [Avatar] Category Name                          [⋮ Menu] │
│          Status line • Members • Online                  │
│          [Conv 1] [Conv 2 🔴3] [Conv 3]                  │ ← LinearTabs
└──────────────────────────────────────────────────────────┘
```

**Mobile Layout:**

```
┌──────────────────────────────────────────┐
│ [<] [Avatar] Category Name        [⋮]   │
│     Status line                          │
├──────────────────────────────────────────┤
│ [Conv 1] [Conv 2 🔴3] [Conv 3]          │ ← LinearTabs (below header)
└──────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] **UI-2.1:** Desktop: tabs inline with header content
- [ ] **UI-2.2:** Mobile: tabs in separate row below header (border-top)
- [ ] **UI-2.3:** Tabs scrollable nếu overflow (LinearTabs handles this)
- [ ] **UI-2.4:** Padding/margin consistent với ChatMessagePanel reference

---

### UI-3: Loading & Empty States

**Priority:** HIGH (updated - empty state is critical)

**States:**

1. **Loading conversations:** Tabs không hiển thị (hoặc skeleton)
2. **No conversations (empty array/null):** 🆕 Hiển thị empty notification screen (see FR-5)
3. **1 conversation:** Hiển thị 1 tab (không auto-hide)
4. **Multiple conversations:** Hiển thị tất cả tabs

**Acceptance Criteria:**

- [ ] **UI-3.1:** Không hiển thị skeleton loading (too complex)
- [ ] **UI-3.2:** 🆕 Empty state: hiển thị full-screen notification (KHÔNG chỉ ẩn tabs)
- [ ] **UI-3.3:** Single conversation: vẫn render tab (for consistency)
- [ ] **UI-3.4:** 🆕 Empty notification: centered, có icon MessageSquareOff, title, description

---

### UI-4: 🆕 Loading State Khi Switch Conversation

**Priority:** HIGH

**Description:**  
Khi user switch conversation (click tab khác), vùng chat hiển thị loading indicator trong khi fetch messages mới.

**States:**

1. **User clicks tab** → `selectedConversationId` updates
2. **Messages query loading** → Show loading indicator
3. **Messages loaded** → Hide loading, show messages

**Loading UI Options:**

**Option A: Skeleton (Recommended)**

```tsx
{
  isLoadingMessages && (
    <div className="flex-1 p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-16 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Option B: Spinner**

```tsx
{
  isLoadingMessages && (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      <span className="ml-2 text-sm text-gray-500">Đang tải tin nhắn...</span>
    </div>
  );
}
```

**Acceptance Criteria:**

- [ ] **UI-4.1:** Loading indicator hiển thị NGAY khi `selectedConversationId` thay đổi
- [ ] **UI-4.2:** 🆕 Tabs vẫn hiển thị bình thường (KHÔNG disabled, KHÔNG ẩn)
- [ ] **UI-4.3:** Loading state chỉ ảnh hưởng vùng chat message area
- [ ] **UI-4.4:** Skeleton hoặc spinner (HUMAN chọn - PENDING DECISION #11)
- [ ] **UI-4.5:** Loading tắt sau khi messages fetch xong
- [ ] **UI-4.6:** Nếu fetch lỗi → show error state (không mắc loading mãi)

---

## 🔒 Security Requirements

### SEC-1: Authorization Check

**Priority:** CRITICAL

**Description:**  
User chỉ được xem conversations trong categories mà họ có quyền.

**Acceptance Criteria:**

- [ ] **SEC-1.1:** API `/api/categories` đã filter theo userId server-side
- [ ] **SEC-1.2:** Frontend KHÔNG cần additional authorization check
- [ ] **SEC-1.3:** 403 error từ API → hiển thị "Không có quyền truy cập"

---

### SEC-2: Data Validation

**Priority:** MEDIUM

**Description:**  
Validate data từ API trước khi render.

**Acceptance Criteria:**

- [ ] **SEC-2.1:** Check `conversations` là array trước khi map
- [ ] **SEC-2.2:** Check `conversationId` tồn tại trước khi set state
- [ ] **SEC-2.3:** Handle malformed data gracefully (log error, không crash)

---

## ⚙️ Performance Requirements

### PERF-1: Lazy Loading

**Priority:** LOW

**Description:**  
Conversations đã có sẵn trong CategoryDto (nested), không cần lazy load.

**Acceptance Criteria:**

- [ ] **PERF-1.1:** Sử dụng data từ `useCategories()` cache
- [ ] **PERF-1.2:** Không call API riêng cho conversations
- [ ] **PERF-1.3:** Minimal re-renders khi switch conversation

---

### PERF-2: Memoization

**Priority:** MEDIUM

**Description:**  
Memoize conversation list mapping để tránh re-compute.

```typescript
const categoryConversations = useMemo(
  () =>
    selectedCategory?.conversations?.map((conv) => ({
      conversationId: conv.conversationId,
      conversationName: conv.conversationName,
      unreadCount: 0,
    })) ?? [],
  [selectedCategory]
);
```

**Acceptance Criteria:**

- [ ] **PERF-2.1:** Use `useMemo` cho conversation mapping
- [ ] **PERF-2.2:** Dependency: `[selectedCategory]` only
- [ ] **PERF-2.3:** Không re-compute khi messages update

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                                         | Lựa chọn                             | HUMAN Decision                                        |
| --- | ---------------------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| 1   | Có hiển thị unread count cho conversations?    | Yes / No (skip for now)              | ⬜ **Yes**                                            |
| 2   | Có hiển thị last message preview?              | Yes / No                             | ⬜ **Yes**                                            |
| 3   | Tabs position trong ChatHeader?                | Below status line / Inline with name | ⬜ **Below status line**                              |
| 4   | Mobile layout?                                 | Separate row / Inline                | ⬜ **Inline**                                         |
| 5   | Có cần animation khi switch conversation?      | Yes / No                             | ⬜ **No**                                             |
| 6   | Scroll behavior khi switch?                    | Scroll to top / Scroll to bottom     | ⬜ **Scroll to bottom**                               |
| 7   | Empty category behavior?                       | Hide tabs / Show "No conversations"  | ⬜ **Show "No conversations"**                        |
| 8   | Có lưu selected conversation vào localStorage? | Yes / No                             | ⬜ **Yes**                                            |
| 9   | Có hỗ trợ keyboard navigation cho tabs?        | Yes (Tab/Arrow keys) / No            | ⬜ **Yes (Tab/Arrow keys)**                           |
| 10  | Badge color cho unread?                        | Red (rose-500) / Blue / Brand color  | ⬜ **Brand color**                                    |
| 11  | 🆕 Loading UI khi switch conversation?         | Skeleton / Spinner                   | ✅ **Skeleton** (giữ nguyên message loading hiện tại) |
| 12  | 🆕 Empty state icon?                           | MessageSquareOff / Inbox / FolderX   | ✅ **Giữ nguyên** (đã có trong code)                  |
| 13  | 🆕 Empty state message text?                   | Fixed / Customizable per category    | ✅ **Giữ nguyên** (đã có trong code)                  |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## 📊 IMPACT SUMMARY

### Files sẽ tạo mới:

- (không có - chỉ modify existing files)

### Files sẽ sửa đổi:

1. `src/features/portal/components/chat/ChatHeader.tsx`

   - Add 3 optional props (`categoryConversations?`, `selectedConversationId?`, `onChangeConversation?`)
   - Add LinearTabs rendering logic (copy from ChatMessagePanel reference)
   - Location: Below status line, trong `<div>` chứa conversation info
   - Lines affected: ~120-150 (estimated)

2. `src/features/portal/components/chat/ChatMainContainer.tsx`

   - Add state: `selectedConversationId`
   - Add effect: auto-select first conversation
   - Add handler: `handleConversationChange`
   - Extract conversations từ category data
   - Pass props to ChatHeader
   - Lines affected: ~150-200 (estimated)

3. `src/types/categories.ts` (if needed)
   - Update CategoryDto interface to include `conversations[]` field
   - Add ConversationInfoDto interface
   - Lines affected: ~10-20

### Files sẽ xoá:

- (không có)

### Dependencies sẽ thêm:

- (không có - sử dụng components/hooks có sẵn)

**Total Impact:** 🟢 LOW - Chỉ thêm optional props và logic mới, không breaking changes

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                           | Status       |
| ---------------------------------- | ------------ |
| Đã review Functional Requirements  | ✅ Đã review |
| Đã review UI/UX Requirements       | ✅ Đã review |
| Đã review Security Requirements    | ✅ Đã review |
| Đã điền Pending Decisions (13 mục) | ✅ Đã điền   |
| **APPROVED để thực thi**           | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-19

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

## 🔗 References

- **UI Reference:** ChatMessagePanel WorkType selector - `src/features/portal/workspace/ChatMessagePanel.tsx` (lines 557-667)
- **Component:** ChatMainContainer - `src/features/portal/components/chat/ChatMainContainer.tsx`
- **Component:** ChatHeader - `src/features/portal/components/chat/ChatHeader.tsx`
- **LinearTabs:** `src/features/portal/components/LinearTabs.tsx`
- **API:** CategoryDto schema - See `03_api-contract.md`

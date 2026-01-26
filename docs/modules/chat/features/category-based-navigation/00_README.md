# [BƯỚC 0] Category-Based Conversation Selector - Overview

**Feature ID:** `CBN-002`  
**Module:** Chat  
**Created:** 2026-01-19  
**Last Updated:** 2026-01-19  
**Status:** ⏳ PLANNING

---

## 📋 Feature Overview

**Mục đích:**  
Thêm conversation selector vào ChatHeader theo categories, tương tự như WorkType selector trong ChatMessagePanel (reference), nhưng implement vào ChatMainContainer (component thật sự được dùng).

**API Changes:**

- API `/api/categories` đã được update với nested `conversations[]` field
- Mỗi CategoryDto chứa sẵn danh sách conversations → không cần call `/api/categories/{id}/conversations` nữa

**Current State:**

- ChatMainContainer không có conversation selector
- User phải chọn conversation từ LeftSidebar
- Khi chọn category → chưa có cách chọn conversation trong category

**Target State:**

- ChatHeader (trong ChatMainContainer) có LinearTabs hiển thị conversations theo category
- UI giống WorkType selector trong ChatMessagePanel (lines 557-584 desktop, 633-667 mobile)
- Tự động active conversation đầu tiên khi load category
- User có thể switch conversation bằng cách click tab
- Luồng: Category → Conversations in Category (tabs) → Messages

**UI Reference:**

- Component: `ChatMessagePanel.tsx` (lines 557-667)
- Pattern: LinearTabs với unread badges
- Location: Below conversation name/status line in header

---

## 🎯 Core Requirements

### Requirement 1: API Integration

**Endpoint:** `GET /api/categories`

**Response Schema (Updated):**

```typescript
interface CategoryDto {
  id: string; // UUID
  userId: string; // UUID - category owner
  name: string; // Category name
  order: number; // Sort order (int32)
  conversations: ConversationInfoDto[]; // 🆕 NESTED conversations
  createdAt: string; // ISO date-time
  updatedAt: string | null; // ISO date-time
}

interface ConversationInfoDto {
  conversationId: string; // UUID
  conversationName: string; // Conversation name
}
```

### Requirement 2: UI Component Structure

**Location:** ChatHeader component (child of ChatMainContainer)

**Pattern:** LinearTabs (như WorkType selector)

**Desktop Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ [Avatar] Category Name                          [⋮ Menu] │
│          Status line • Members • Online                  │
│                                                           │
│ [Conversation 1] [Conversation 2 🔴3] [Conversation 3]   │ ← NEW
└──────────────────────────────────────────────────────────┘
```

**Mobile Layout:**

```
┌──────────────────────────────────────────┐
│ [<] [Avatar] Category Name        [⋮]   │
│     Status line                          │
├──────────────────────────────────────────┤
│ [Conv 1] [Conv 2 🔴3] [Conv 3]          │ ← NEW (below header)
└──────────────────────────────────────────┘
```

### Requirement 3: Auto-Select First Conversation

Khi user click category từ sidebar:

1. Load category data từ `GET /api/categories` (or from cache)
2. Extract `conversations[]` array từ selected category
3. **Auto-select first conversation:** `conversations[0].conversationId`
4. Load messages cho conversation đã select
5. Render LinearTabs với active state = first conversation

### Requirement 4: Data Flow

```
User clicks Category in Sidebar
  ↓
GET /api/categories (or cache hit)
  ↓
Extract category.conversations[]
  ↓
Auto-select conversations[0].conversationId
  ↓
GET /api/conversations/{id}/messages
  ↓
Render: ChatHeader with LinearTabs + Messages
```

---

## 📡 API Endpoints Used

| Endpoint                               | Purpose                        | Changes                                  |
| -------------------------------------- | ------------------------------ | ---------------------------------------- |
| `GET /api/categories`                  | Lấy categories + conversations | ✅ Updated schema (nested conversations) |
| `GET /api/conversations/{id}/messages` | Lấy messages                   | ✅ No changes                            |

**DEPRECATED:** `GET /api/categories/{id}/conversations` - Not needed anymore (data nested in CategoryDto)

---

## 🎨 UI Changes

### ChatMessagePanel (Reference Only):

```tsx
// Desktop (lines 557-584)
{
  selectedGroup?.workTypes && selectedGroup.workTypes.length > 0 && (
    <div className="mt-2">
      <LinearTabs
        tabs={selectedGroup.workTypes.map((w, idx) => ({
          key: w.id,
          label: (
            <div className="relative inline-flex items-center gap-1">
              <span>{w.name}</span>
              {unread > 0 && (
                <span className="ml-1 inline-flex min-w-[16px] h-4 ...">
                  {unread}
                </span>
              )}
            </div>
          ),
        }))}
        active={
          selectedWorkTypeId ??
          currentWorkTypeId ??
          selectedGroup.workTypes[0]?.id
        }
        onChange={(id) => onChangeWorkType?.(id)}
        textClass="text-xs"
        noWrap
      />
    </div>
  );
}
```

### ChatMainContainer (Implement Here):

**Component to modify:** `ChatHeader.tsx`

**Add props:**

```typescript
interface ChatHeaderProps {
  // ... existing props ...
  categoryConversations?: Array<{
    // 🆕
    conversationId: string;
    conversationName: string;
  }>;
  selectedConversationId?: string; // 🆕
  onChangeConversation?: (id: string) => void; // 🆕
}
```

**Render logic:**

```tsx
// In ChatHeader.tsx
{
  categoryConversations && categoryConversations.length > 0 && (
    <div className="mt-2">
      <LinearTabs
        tabs={categoryConversations.map((conv) => ({
          key: conv.conversationId,
          label: conv.conversationName,
          // TODO: Add unread badge if available
        }))}
        active={
          selectedConversationId ?? categoryConversations[0]?.conversationId
        }
        onChange={(id) => onChangeConversation?.(id)}
        textClass="text-xs"
        noWrap
      />
    </div>
  );
}
```

---

## 📂 Files to Modify/Create

### Phase 1: API Layer (if needed)

- ✅ **SKIP** - API client already exists (`categories.api.ts`)
- ✅ **SKIP** - Query hook already exists (`useCategories`)
- ✅ **UPDATE** - TypeScript types in `src/types/categories.ts` to match new CategoryDto schema

### Phase 2: Component Layer

**Modify:**

1. `src/features/portal/components/chat/ChatHeader.tsx`

   - Add 3 new props
   - Add LinearTabs rendering logic (copy from ChatMessagePanel reference)
   - Location: Below status line, same as ChatMessagePanel pattern

2. `src/features/portal/components/chat/ChatMainContainer.tsx`
   - Extract `conversations[]` from selected category data
   - Pass conversations to ChatHeader via props
   - Handle `onChangeConversation` callback to switch active conversation
   - Auto-select first conversation on category change

**Create (Optional):**

- `src/features/portal/components/chat/ConversationTabs.tsx` - Separate component nếu muốn reuse logic

### Phase 3: State Management

**ChatMainContainer state:**

```typescript
const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
const [selectedConversationId, setSelectedConversationId] = useState<string>();

// When category changes
useEffect(() => {
  if (
    selectedCategory?.conversations &&
    selectedCategory.conversations.length > 0
  ) {
    // Auto-select first conversation
    setSelectedConversationId(selectedCategory.conversations[0].conversationId);
  }
}, [selectedCategory]);
```

---

## 🧪 Testing Scope

### Unit Tests:

- ✅ ChatHeader renders LinearTabs when `categoryConversations` provided
- ✅ ChatHeader auto-selects first conversation
- ✅ ChatHeader calls `onChangeConversation` callback on tab click
- ✅ ChatMainContainer extracts conversations from category data correctly
- ✅ ChatMainContainer switches conversation when tab changes

### Component Tests:

- ✅ LinearTabs active state matches `selectedConversationId`
- ✅ Tab labels display conversation names correctly
- ✅ Unread badges display when available

### E2E Tests:

- ✅ User clicks category → ChatHeader shows conversation tabs
- ✅ First conversation auto-selected → Messages load
- ✅ User clicks different conversation tab → Messages switch
- ✅ Unread count updates after reading messages

---

## 📖 Documentation Steps

| Bước | File                      | Status         | Description                                    |
| ---- | ------------------------- | -------------- | ---------------------------------------------- |
| 0    | 00_README.md (this file)  | ✅ DONE        | Overview updated với API changes               |
| 1    | 01_requirements.md        | ⏳ PENDING     | Functional/UI/Security requirements            |
| 2A   | 02a_wireframe.md          | ⏳ PENDING     | UI wireframes cho LinearTabs pattern           |
| 2B   | 02b_flow.md               | ⏳ PENDING     | User flow: Category → Conversations → Messages |
| 3    | 03_api-contract.md        | ⏳ PENDING     | CategoryDto schema v2 + snapshots              |
| 4    | 04_implementation-plan.md | ⏳ PENDING     | Step-by-step implementation tasks              |
| 4.5  | 06_testing.md             | ⏳ PENDING     | Test requirements + coverage matrix            |
| 5    | 05_progress.md            | 🚫 Not Started | Track implementation progress                  |

---

## ⚠️ Breaking Changes

### API Schema Changes:

- ✅ **CategoryDto** now includes `userId` field (owner)
- ✅ **CategoryDto** now includes `conversations[]` array (nested data)
- ✅ **ConversationInfoDto** schema added
- ❌ **DEPRECATED:** `/api/categories/{id}/conversations` endpoint (use nested data instead)

### Component Changes:

- ✅ **ChatHeader** gains new responsibility: render conversation selector
- ✅ **ChatMainContainer** manages conversation state in addition to messages
- ⚠️ **Prop drilling:** 3 new props added to ChatHeader (may affect tests)

### UX Changes:

- ✅ Auto-select first conversation → User might be confused if expecting manual selection
- ✅ Conversation switching via tabs → Different from sidebar click interaction

---

## 🔗 Related Documentation

- **UI Reference:** ChatMessagePanel WorkType selector - `src/features/portal/workspace/ChatMessagePanel.tsx` (lines 557-667)
- **Component:** ChatMainContainer - `src/features/portal/components/chat/ChatMainContainer.tsx`
- **Component:** ChatHeader - `src/features/portal/components/chat/ChatHeader.tsx`
- **API Docs:** Categories API - `docs/api/chat/categories/` (needs update for v2 schema)
- **Types:** Categories types - `src/types/categories.ts`

---

**Next Steps:**

1. ✅ Update `00_README.md` - DONE
2. ⏳ Create `01_requirements.md` - Detailed requirements với reference ChatMessagePanel
3. ⏳ Create `02a_wireframe.md` - UI specs matching LinearTabs pattern
4. ⏳ Update `03_api-contract.md` - CategoryDto v2 schema + snapshots
5. ⏳ Create `04_implementation-plan.md` - Implementation tasks
6. ⏳ Create `06_testing.md` - Test requirements
7. ⏳ HUMAN approval all documents
8. 🚫 Code implementation (blocked until approval)

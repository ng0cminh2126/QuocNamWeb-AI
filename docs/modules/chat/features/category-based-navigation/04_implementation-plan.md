# [BƯỚC 4] Category-Based Conversation Selector - Implementation Plan

**Feature ID:** `CBN-002`  
**Version:** 2.0  
**Created:** 2026-01-19  
**Last Updated:** 2026-01-19  
**Status:** ⏳ PENDING HUMAN APPROVAL

---

## 📋 Overview

Implementation plan với **minimal impact approach** - chỉ thêm optional props vào ChatHeader và auto-select logic vào ChatMainContainer.

**Estimated Effort:** 3-4 hours  
**Risk Level:** 🟢 LOW  
**Breaking Changes:** None (backward compatible)

---

## 📦 Implementation Tasks

### Phase 1: TypeScript Types (Optional - Có thể skip nếu API client tự generate)

**File:** `src/types/categories.ts`

**Task 1.1:** Add ConversationInfoDto interface

```typescript
// src/types/categories.ts

export interface ConversationInfoDto {
  /** Conversation unique ID */
  conversationId: string;

  /** Conversation display name */
  conversationName: string;

  /** Optional: Unread count (nếu API support) */
  unreadCount?: number;

  /** Optional: Last message preview (nếu API support) */
  lastMessage?: string;
  lastMessageAt?: string;
}
```

**Task 1.2:** Update CategoryDto interface

```typescript
export interface CategoryDto {
  id: string;
  userId: string;
  name: string;
  order: number;
  conversations: ConversationInfoDto[]; // 🆕 ADD THIS
  createdAt: string;
  updatedAt: string;
}
```

**Checklist:**

- [ ] Add ConversationInfoDto interface
- [ ] Update CategoryDto with conversations field
- [ ] Verify types export correctly
- [ ] Run `npm run type-check` (no errors)

**Dependencies:** None  
**Estimated Time:** 10 minutes

---

### Phase 2: Update ChatHeader Component

**File:** `src/features/portal/components/chat/ChatHeader.tsx`

**Task 2.1:** Add optional props to interface

```typescript
// Lines ~15-25 (estimated)

interface ChatHeaderProps {
  // ... existing props
  displayName: string;
  avatarUrl?: string;
  statusLine?: string;
  conversationCategory?: string;
  conversationType?: "PER" | "GRP";
  onMenuClick?: () => void;

  // 🆕 NEW props (optional)
  categoryConversations?: ConversationInfoDto[];
  selectedConversationId?: string;
  onChangeConversation?: (conversationId: string) => void;
}
```

**Task 2.2:** Add LinearTabs rendering logic

```typescript
// Lines ~140-160 (after status line, before closing </div>)

export default function ChatHeader({
  // ... existing props
  categoryConversations,
  selectedConversationId,
  onChangeConversation,
}: ChatHeaderProps) {
  // ... existing code

  return (
    <div className="flex items-center justify-between border-b p-4 shrink-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* ... existing header content ... */}
        <div className="flex-1 min-w-0">
          {/* Name + category badge */}
          <div className="flex items-center gap-2">...</div>

          {/* Status line */}
          <div className="text-xs font-medium text-brand-600">{statusLine}</div>

          {/* 🆕 NEW: Conversation tabs */}
          {categoryConversations && categoryConversations.length > 0 && (
            <div className="mt-2">
              <LinearTabs
                tabs={categoryConversations.map((conv) => ({
                  key: conv.conversationId,
                  label: (
                    <div className="relative inline-flex items-center gap-1">
                      <span>{conv.conversationName}</span>
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <span className="ml-1 inline-flex min-w-[16px] h-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-medium text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  ),
                }))}
                active={
                  selectedConversationId ??
                  categoryConversations[0]?.conversationId
                }
                onChange={(id) => onChangeConversation?.(id)}
                textClass="text-xs"
                noWrap
              />
            </div>
          )}
        </div>
      </div>

      {/* ... existing menu button ... */}
    </div>
  );
}
```

**Task 2.3:** Add import

```typescript
import { LinearTabs } from "@/features/portal/components/LinearTabs";
import type { ConversationInfoDto } from "@/types/categories";
```

**Checklist:**

- [ ] Add 3 optional props to ChatHeaderProps interface
- [ ] Import LinearTabs component
- [ ] Import ConversationInfoDto type
- [ ] Add conditional tabs rendering (after status line, `mt-2`)
- [ ] Map conversations to tabs with unread badges
- [ ] Handle active state (selectedConversationId ?? first)
- [ ] Handle onChange with optional chaining (`?.`)
- [ ] Verify backward compatibility (no props = no tabs)
- [ ] Test visually in Storybook (optional)

**Dependencies:** Phase 1 (types)  
**Estimated Time:** 30 minutes

---

### Phase 2.5: 🆕 Empty State Notification Component

**File:** `src/features/portal/components/chat/ChatMainContainer.tsx`

**Task 2.5.1:** Add empty state rendering logic

```typescript
// Lines ~250-280 (in main render, before ChatHeader)

export default function ChatMainContainer() {
  // ... existing logic

  // 🆕 NEW: Show empty notification if no conversations
  if (categoryConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="mb-4">
          <MessageSquareOff className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Chưa có cuộc trò chuyện
        </h3>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          Category này chưa có cuộc trò chuyện nào. Vui lòng tạo cuộc trò chuyện mới hoặc chọn category khác.
        </p>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        )}
      </div>
    );
  }

  // Normal chat UI
  return (
    <>
      <ChatHeader categoryConversations={categoryConversations} ... />
      <ChatMain ... />
    </>
  );
}
```

**Task 2.5.2:** Add icon imports

```typescript
import { MessageSquareOff } from "lucide-react";
```

**Checklist:**

- [ ] Add empty state check before normal render
- [ ] Import MessageSquareOff icon from lucide-react
- [ ] Render centered notification with icon, title, description
- [ ] Verify no ChatHeader/ChatMain rendered when empty
- [ ] Verify no messages API call when empty
- [ ] Test responsive design (desktop & mobile)

**Dependencies:** Phase 3 (categoryConversations extracted)  
**Estimated Time:** 30 minutes

---

### Phase 3: Update ChatMainContainer Component

**File:** `src/features/portal/components/chat/ChatMainContainer.tsx`

**Task 3.1:** Extract conversations from selected category

```typescript
// Lines ~50-80 (estimated, inside component)

export default function ChatMainContainer() {
  // ... existing state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>();

  // ... existing hooks
  const { data: categories } = useCategories(); // Already exists

  // 🆕 NEW: Extract conversations from selected category
  const categoryConversations = useMemo(() => {
    if (!categories || !selectedCategoryId) return [];

    const selectedCategory = categories.find(
      (cat) => cat.id === selectedCategoryId
    );
    return selectedCategory?.conversations ?? [];
  }, [categories, selectedCategoryId]);

  // ... rest of code
}
```

**Task 3.2:** Add auto-select first conversation logic

```typescript
// Lines ~100-120 (estimated, after useMemo)

// 🆕 NEW: Auto-select first conversation khi category changes
useEffect(() => {
  // Chỉ auto-select nếu:
  // 1. Có conversations
  // 2. Chưa có conversation được chọn
  if (categoryConversations.length > 0 && !selectedConversationId) {
    setSelectedConversationId(categoryConversations[0].conversationId);
  }
}, [selectedCategoryId, categoryConversations, selectedConversationId]);
```

**Task 3.3:** Add conversation change handler

```typescript
// Lines ~130-140 (estimated, with other handlers)

const handleChangeConversation = (conversationId: string) => {
  // Optional: Validate conversation exists
  const exists = categoryConversations.some(
    (c) => c.conversationId === conversationId
  );

  if (exists) {
    setSelectedConversationId(conversationId);
  } else {
    // Fallback: select first conversation
    if (categoryConversations.length > 0) {
      setSelectedConversationId(categoryConversations[0].conversationId);
    }
  }
};
```

**Task 3.4:** Pass props to ChatHeader

```typescript
// Lines ~200-220 (estimated, in JSX where ChatHeader is rendered)

<ChatHeader
  displayName={displayName}
  avatarUrl={avatarUrl}
  statusLine={statusLine}
  conversationCategory={conversationCategory}
  conversationType={conversationType}
  onMenuClick={handleMenuClick}
  // 🆕 NEW props
  categoryConversations={categoryConversations}
  selectedConversationId={selectedConversationId}
  onChangeConversation={handleChangeConversation}
/>
```

**Checklist:**

- [ ] Add `selectedConversationId` state (if not exists)
- [ ] Add useMemo to extract categoryConversations from selected category
- [ ] Add useEffect for auto-select first conversation
- [ ] Add handleChangeConversation with validation (optional)
- [ ] Pass 3 new props to ChatHeader
- [ ] Verify useMessages hook uses selectedConversationId (may need update)
- [ ] Test category switching (auto-select first conversation)
- [ ] Test conversation switching (messages update)

**Dependencies:** Phase 2 (ChatHeader props)  
**Estimated Time:** 1 hour

---

### Phase 4: Update Message Loading Logic (If Needed)

**File:** `src/features/portal/components/chat/ChatMainContainer.tsx` (same file)

**Task 4.1:** Verify useMessages hook uses selectedConversationId

```typescript
// Existing code (verify):
const { data: messagesData } = useMessages(
  selectedConversationId, // ← Verify this prop exists
  workTypeId // Or other params
);
```

**If needed, update:**

```typescript
// Before (if using groupId directly):
const { data: messagesData } = useMessages(selectedGroup?.id, workTypeId);

// After (use selectedConversationId):
const { data: messagesData } = useMessages(
  selectedConversationId ?? selectedGroup?.id, // Fallback
  workTypeId
);
```

**Checklist:**

- [ ] Check useMessages parameters
- [ ] Update to use selectedConversationId if needed
- [ ] Add fallback to selectedGroup?.id (backward compatibility)
- [ ] Test messages load correctly after conversation switch

**Dependencies:** Phase 3  
**Estimated Time:** 20 minutes (if changes needed), 5 minutes (if just verification)

---

### Phase 5: Testing & Validation

**Task 5.1:** Unit Tests for ChatHeader

Create: `src/features/portal/components/chat/__tests__/ChatHeader.test.tsx`

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import ChatHeader from "../ChatHeader";

describe("ChatHeader - Conversation Selector", () => {
  it("should NOT render tabs when categoryConversations is undefined", () => {
    render(<ChatHeader displayName="Test" />);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("should NOT render tabs when categoryConversations is empty", () => {
    render(<ChatHeader displayName="Test" categoryConversations={[]} />);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("should render tabs when categoryConversations has items", () => {
    const conversations = [
      { conversationId: "1", conversationName: "Conv A" },
      { conversationId: "2", conversationName: "Conv B" },
    ];
    render(
      <ChatHeader displayName="Test" categoryConversations={conversations} />
    );
    expect(screen.getByText("Conv A")).toBeInTheDocument();
    expect(screen.getByText("Conv B")).toBeInTheDocument();
  });

  it("should call onChangeConversation when tab clicked", () => {
    const handleChange = vi.fn();
    const conversations = [
      { conversationId: "1", conversationName: "Conv A" },
      { conversationId: "2", conversationName: "Conv B" },
    ];
    render(
      <ChatHeader
        displayName="Test"
        categoryConversations={conversations}
        onChangeConversation={handleChange}
      />
    );

    fireEvent.click(screen.getByText("Conv B"));
    expect(handleChange).toHaveBeenCalledWith("2");
  });
});
```

**Task 5.2:** Integration Tests for ChatMainContainer

Create: `src/features/portal/components/chat/__tests__/ChatMainContainer.test.tsx`

```typescript
import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChatMainContainer from "../ChatMainContainer";

describe("ChatMainContainer - Auto-select Conversation", () => {
  it("should auto-select first conversation when category has conversations", async () => {
    // Mock useCategories to return categories with conversations
    const mockCategories = [
      {
        id: "cat-1",
        name: "Category A",
        conversations: [
          { conversationId: "conv-1", conversationName: "Conv 1" },
          { conversationId: "conv-2", conversationName: "Conv 2" },
        ],
      },
    ];

    // ... setup mocks, render component

    await waitFor(() => {
      expect(mockUseMessages).toHaveBeenCalledWith("conv-1", ...);
    });
  });
});
```

**Task 5.3:** E2E Tests (Playwright)

Create: `tests/chat/conversation-selector.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Conversation Selector", () => {
  test("should display conversation tabs after selecting category", async ({
    page,
  }) => {
    // Login, navigate to chat
    await page.goto("/portal/workspace");
    await page.click('[data-testid="category-item-cat-001"]');

    // Verify tabs appear
    await expect(
      page.locator('[data-testid="conversation-tab-conv-abc"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="conversation-tab-conv-def"]')
    ).toBeVisible();
  });

  test("should auto-select first conversation", async ({ page }) => {
    await page.goto("/portal/workspace");
    await page.click('[data-testid="category-item-cat-001"]');

    // Verify first tab is active
    await expect(
      page.locator('[data-testid="conversation-tab-conv-abc"]')
    ).toHaveClass(/active/);
  });

  test("should switch conversation when tab clicked", async ({ page }) => {
    await page.goto("/portal/workspace");
    await page.click('[data-testid="category-item-cat-001"]');

    // Click second tab
    await page.click('[data-testid="conversation-tab-conv-def"]');

    // Verify messages loaded for new conversation
    await expect(page.locator('[data-testid="message-list"]')).toBeVisible();
    // ... more assertions
  });
});
```

**Checklist:**

- [ ] Write 4 unit tests for ChatHeader (render, empty, tabs, onClick)
- [ ] Write 3 integration tests for ChatMainContainer (auto-select, switch, empty)
- [ ] Write 3 E2E tests (display tabs, auto-select, switch conversation)
- [ ] Run `npm run test` - all tests pass
- [ ] Run `npm run test:e2e` - E2E tests pass
- [ ] Code coverage > 80% for modified files

**Dependencies:** Phase 2, 3, 4  
**Estimated Time:** 1.5 hours

---

### Phase 6: Documentation & Cleanup

**Task 6.1:** Update component documentation

- [ ] Add JSDoc comments to new props in ChatHeader
- [ ] Add JSDoc to handleChangeConversation in ChatMainContainer
- [ ] Document auto-select behavior in code comments

**Task 6.2:** Update Storybook (Optional)

Create: `src/features/portal/components/chat/ChatHeader.stories.tsx`

```typescript
export const WithConversations: Story = {
  args: {
    displayName: "Dự án Website",
    statusLine: "Hoạt động • 12 thành viên",
    categoryConversations: [
      { conversationId: "1", conversationName: "Frontend" },
      { conversationId: "2", conversationName: "Backend", unreadCount: 5 },
      { conversationId: "3", conversationName: "DevOps", unreadCount: 12 },
    ],
    selectedConversationId: "1",
    onChangeConversation: (id) => console.log("Changed to:", id),
  },
};

export const EmptyConversations: Story = {
  args: {
    displayName: "Empty Category",
    statusLine: "Không có cuộc trò chuyện",
    categoryConversations: [],
  },
};
```

**Task 6.3:** Update CHANGELOG

Add to `docs/modules/chat/features/category-based-navigation/_changelog.md`:

```markdown
## v2.0 - 2026-01-19

### Added

- Conversation selector in ChatHeader using LinearTabs
- Auto-select first conversation when category changes
- Optional props for ChatHeader (backward compatible)
- Nested conversations[] in CategoryDto (API v2)
- 🆕 Empty state notification screen for categories with no conversations

### Changed

- ChatMainContainer extracts conversations from category data
- No longer needs `/api/categories/{id}/conversations` endpoint
- 🆕 Empty categories show notification instead of blank chat screen

### Migration

- Update CategoryDto type to include conversations[] field
- Pass categoryConversations, selectedConversationId, onChangeConversation to ChatHeader
- 🆕 Handle empty conversations case (show notification UI)
- Existing code without props continues to work (no breaking changes)
```

**Checklist:**

- [ ] Add JSDoc comments
- [ ] Create Storybook stories (optional)
- [ ] Update CHANGELOG
- [ ] Update 00_README.md status to COMPLETED
- [ ] Archive old docs to v1/ folder

**Dependencies:** All phases  
**Estimated Time:** 30 minutes

---

## 📊 Implementation Summary

### Total Effort Breakdown:

| Phase     | Task                      | Time         | Risk       |
| --------- | ------------------------- | ------------ | ---------- |
| Phase 1   | TypeScript types          | 10 min       | 🟢         |
| Phase 2   | ChatHeader updates        | 30 min       | 🟢         |
| Phase 3   | ChatMainContainer updates | 1 hour       | 🟡         |
| Phase 4   | Message loading logic     | 20 min       | 🟢         |
| Phase 5   | Testing & validation      | 1.5 hours    | 🟡         |
| Phase 6   | Documentation & cleanup   | 30 min       | 🟢         |
| **Total** | **All phases**            | **3h 40min** | **🟢 LOW** |

---

### Files Modified:

| File                                                                       | Lines Changed | Type   |
| -------------------------------------------------------------------------- | ------------- | ------ |
| `src/types/categories.ts`                                                  | +15           | ADD    |
| `src/features/portal/components/chat/ChatHeader.tsx`                       | +50           | MODIFY |
| `src/features/portal/components/chat/ChatMainContainer.tsx`                | +40           | MODIFY |
| `src/features/portal/components/chat/__tests__/ChatHeader.test.tsx`        | +80           | ADD    |
| `src/features/portal/components/chat/__tests__/ChatMainContainer.test.tsx` | +60           | ADD    |
| `tests/chat/conversation-selector.spec.ts`                                 | +50           | ADD    |

**Total:** ~295 lines added, 0 lines deleted, 2 files modified

---

### Dependencies Required:

None (all dependencies already exist in project)

---

### Risks & Mitigations:

| Risk                                  | Likelihood | Impact  | Mitigation                                    |
| ------------------------------------- | ---------- | ------- | --------------------------------------------- |
| Breaking existing ChatHeader usage    | 🟢 LOW     | 🔴 HIGH | Optional props, backward compatible           |
| useMessages hook incompatible params  | 🟡 MEDIUM  | 🟡 MED  | Add fallback, verify existing code            |
| LinearTabs component missing features | 🟢 LOW     | 🟡 MED  | Already used in ChatMessagePanel (reference)  |
| API returns malformed conversations[] | 🟡 MEDIUM  | 🟡 MED  | Add validation, fallback to empty array       |
| Auto-select infinite loop             | 🟢 LOW     | 🟡 MED  | Proper useEffect dependencies, prevent re-run |

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                                | Lựa chọn                  | HUMAN Decision |
| --- | ------------------------------------- | ------------------------- | -------------- |
| 1   | Skip TypeScript types phase?          | Yes (API client gen) / No | ⬜ **\_\_\_**  |
| 2   | Add Storybook stories?                | Yes / No / Later          | ⬜ **\_\_\_**  |
| 3   | E2E tests priority?                   | High (before merge) / Low | ⬜ **\_\_\_**  |
| 4   | Validate conversation exists?         | Strict / Lenient          | ⬜ **\_\_\_**  |
| 5   | Code review before Phase 5 (testing)? | Yes / No                  | ⬜ **\_\_\_**  |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                          | Status       |
| --------------------------------- | ------------ |
| Đã review tất cả 6 phases         | ✅ Đã review |
| Đã review effort estimate         | ✅ Đã review |
| Đã review files modified          | ✅ Đã review |
| Đã review risks & mitigations     | ✅ Đã review |
| Đã điền Pending Decisions (5 mục) | ✅ Đã điền   |
| **APPROVED để thực thi**          | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-19

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

## 🔗 References

- **Requirements:** See `01_requirements.md`
- **Wireframes:** See `02a_wireframe.md`
- **Flow Diagrams:** See `02b_flow.md`
- **API Contract:** See `03_api-contract.md`
- **Testing Requirements:** See `06_testing.md` (will be created)
- **Code Reference:** ChatMessagePanel WorkType tabs (lines 557-667)

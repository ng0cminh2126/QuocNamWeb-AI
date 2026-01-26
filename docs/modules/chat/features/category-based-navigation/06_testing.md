# [BƯỚC 6] Category-Based Conversation Selector - Testing Requirements

**Feature ID:** `CBN-002`  
**Version:** 2.1.1  
**Created:** 2026-01-19  
**Last Updated:** 2026-01-19 (v2.1.1)  
**Status:** ✅ IN PROGRESS

---

## 📋 Overview

Testing requirements cho conversation selector feature v2.1.1. Coverage bao gồm unit tests, integration tests, và E2E tests với focus vào **backward compatibility**, **UI enhancements**, và **architecture optimization**.

**Target Coverage:** 85%+  
**Priority:** Unit > Integration > E2E

---

## 🧪 Test Coverage Matrix

### Implementation Files → Test Files Mapping:

| Implementation File                      | Test File(s)                                    | Test Type   | Status       | Cases |
| ---------------------------------------- | ----------------------------------------------- | ----------- | ------------ | ----- |
| `ConversationListSidebar.tsx`            | `tests/chat/unit/handleGroupSelect.test.ts`     | Unit        | ✅ Created   | 8     |
| `src/features/.../ChatHeader.tsx`        | `.../chat/__tests__/ChatHeader.test.tsx`        | Component   | ✅ Created   | 10    |
| `src/features/.../ChatMainContainer.tsx` | `.../chat/__tests__/ChatMainContainer.test.tsx` | Integration | ✅ Created   | 10    |
| E2E User Flow                            | `tests/chat/category-selection.spec.ts`         | E2E         | ⚠️ 2/10 Pass | 10    |

**Total Test Cases:** 38 (✅ 28 created, ⚠️ 10 need app running)

---

## ✅ Created Test Files

### 1. Unit Tests - handleGroupSelect (✅ COMPLETE)

**File:** `tests/chat/unit/handleGroupSelect.test.ts`

**Test Cases:**

1. ✅ Should call onSelectGroup with conversationId
2. ✅ Should call onSelectChat with correct ChatTarget object
3. ✅ Should save conversation to localStorage
4. ✅ Should handle unreadCount parameter (optional)
5. ✅ Should work without unreadCount
6. ✅ Should map ConversationInfoDto to GroupConversation
7. ✅ Should handle categories without conversations
8. ✅ Should handle multiple categories with multiple conversations

**Status:** 8/8 implemented  
**Estimated Time to Run:** ~1 minute

---

### 2. Component Tests - ChatHeader v2.1.1 (✅ COMPLETE)

**File:** `src/features/portal/components/chat/__tests__/ChatHeader.test.tsx`

**Test Cases:**

#### Badge Status Display (v2.1.1)

1. ✅ Should render Active status with processing badge (blue)
2. ✅ Should render Archived status with neutral badge (gray)
3. ✅ Should render Muted status with danger badge (red)

#### Member Count Display (v2.1.1)

4. ✅ Should display member count for group conversations
5. ✅ Should NOT display member count for direct messages
6. ✅ Should NOT display member count when memberCount is 0
7. ✅ Should display online count when provided

#### Avatar Alignment (v2.1.1)

8. ✅ Should use items-start for proper alignment with category name

#### Conversation Tabs (CBN-002)

9. ✅ Should render conversation tabs when categoryConversations provided
10. ✅ Should display unread count badge
11. ✅ Should call onChangeConversation when tab clicked
12. ✅ Should NOT render tabs when categoryConversations is empty
13. ✅ Should NOT render tabs when not provided (backward compatible)

#### Category Name Display

14. ✅ Should display category name instead of conversation name when provided
15. ✅ Should display conversation name when no category provided

**Status:** 10/10 implemented (15 total assertions)  
**Estimated Time to Run:** ~2 minutes

---

### 3. Integration Tests - ChatMainContainer (✅ COMPLETE)

**File:** `src/features/portal/components/chat/__tests__/ChatMainContainer.test.tsx`

**Test Cases:**

#### Category Selection

1. ✅ Should auto-select first conversation when category selected
2. ✅ Should extract conversations from selected category
3. ✅ Should handle category with single conversation

#### Empty Category Handling (v2.1.1)

4. ✅ Should show EmptyCategoryState when category has no conversations
5. ✅ Should NOT render chat UI when conversations array is empty

#### Conversation Switching

6. ✅ Should update active conversation when tab clicked

#### Backward Compatibility

7. ✅ Should work without selectedCategoryId (legacy behavior)
8. ✅ Should handle undefined selectedCategoryId gracefully

#### Loading States

9. ✅ Should show loading skeleton while fetching categories

#### Error Handling

10. ✅ Should handle categories fetch error gracefully

**Status:** 10/10 implemented  
**Estimated Time to Run:** ~3 minutes

**Mock Data:**

```typescript
const mockCategories = [
  {
    id: "cat-1",
    name: "Dự án Website",
    conversations: [
      {
        conversationId: "conv-1",
        conversationName: "Frontend",
        unreadCount: 3,
      },
      { conversationId: "conv-2", conversationName: "Backend" },
    ],
  },
  {
    id: "cat-3",
    name: "Empty Category",
    conversations: [],
  },
];
```

const conversations = [
{ conversationId: "conv-1", conversationName: "Conv A" },
{ conversationId: "conv-2", conversationName: "Conv B" },
];

render(
<ChatHeader
      displayName="Test"
      categoryConversations={conversations}
      selectedConversationId="conv-2"
    />
);

const tab = screen.getByText("Conv B").closest("button");
expect(tab).toHaveClass(/active/); // Or whatever active class LinearTabs uses
});

````

**Priority:** 🟡 MEDIUM

---

#### TC-006: Auto-Select First (Default Active)

```typescript
it("should default to first conversation when selectedConversationId not provided", () => {
  const conversations = [
    { conversationId: "conv-1", conversationName: "Conv A" },
    { conversationId: "conv-2", conversationName: "Conv B" },
  ];

  render(
    <ChatHeader
      displayName="Test"
      categoryConversations={conversations}
      // NO selectedConversationId prop
    />
  );

  const firstTab = screen.getByText("Conv A").closest("button");
  expect(firstTab).toHaveClass(/active/);
});
````

**Priority:** 🔴 HIGH

---

#### TC-007: OnChange Callback

```typescript
it("should call onChangeConversation when tab clicked", () => {
  const handleChange = vi.fn();
  const conversations = [
    { conversationId: "conv-1", conversationName: "Conv A" },
    { conversationId: "conv-2", conversationName: "Conv B" },
  ];

  render(
    <ChatHeader
      displayName="Test"
      categoryConversations={conversations}
      selectedConversationId="conv-1"
      onChangeConversation={handleChange}
    />
  );

  fireEvent.click(screen.getByText("Conv B"));
  expect(handleChange).toHaveBeenCalledWith("conv-2");
  expect(handleChange).toHaveBeenCalledTimes(1);
});
```

**Priority:** 🔴 HIGH

---

#### TC-008: Unread Badge Display

```typescript
it("should display unread count badge when unreadCount > 0", () => {
  const conversations = [
    { conversationId: "conv-1", conversationName: "Conv A", unreadCount: 0 },
    { conversationId: "conv-2", conversationName: "Conv B", unreadCount: 5 },
    { conversationId: "conv-3", conversationName: "Conv C", unreadCount: 99 },
  ];

  render(
    <ChatHeader displayName="Test" categoryConversations={conversations} />
  );

  // Conv A: no badge
  expect(screen.queryByText("0")).not.toBeInTheDocument();

  // Conv B: badge with "5"
  expect(screen.getByText("5")).toBeInTheDocument();
  expect(screen.getByText("5")).toHaveClass(/bg-rose-500/);

  // Conv C: badge with "99"
  expect(screen.getByText("99")).toBeInTheDocument();
});
```

**Priority:** 🟡 MEDIUM

---

#### TC-009: No OnChange Handler (Optional)

```typescript
it("should not crash when onChangeConversation is undefined", () => {
  const conversations = [
    { conversationId: "conv-1", conversationName: "Conv A" },
    { conversationId: "conv-2", conversationName: "Conv B" },
  ];

  render(
    <ChatHeader
      displayName="Test"
      categoryConversations={conversations}
      // NO onChangeConversation prop
    />
  );

  // Should not crash when clicked
  expect(() => {
    fireEvent.click(screen.getByText("Conv B"));
  }).not.toThrow();
});
```

**Priority:** 🟢 LOW

---

**ChatHeader Tests Summary:**

- Total: 8 test cases
- Priority: 4 HIGH, 3 MEDIUM, 1 LOW
- Estimated Time: 1 hour

---

### 3. Integration Tests - ChatMainContainer

**File:** `src/features/portal/components/chat/__tests__/ChatMainContainer.test.tsx`

#### TC-010: Extract Conversations from Category

```typescript
it("should extract conversations from selected category", () => {
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

  // Mock useCategories hook
  vi.mocked(useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  });

  render(<ChatMainContainer selectedCategoryId="cat-1" />);

  // Verify ChatHeader receives correct conversations
  expect(screen.getByText("Conv 1")).toBeInTheDocument();
  expect(screen.getByText("Conv 2")).toBeInTheDocument();
});
```

**Priority:** 🔴 HIGH

---

#### TC-011: Auto-Select First Conversation

```typescript
it("should auto-select first conversation when category selected", async () => {
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

  vi.mocked(useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  });

  const mockUseMessages = vi.fn();
  vi.mocked(useMessages).mockImplementation(mockUseMessages);

  render(<ChatMainContainer selectedCategoryId="cat-1" />);

  await waitFor(() => {
    // Should load messages for first conversation
    expect(mockUseMessages).toHaveBeenCalledWith("conv-1", expect.anything());
  });
});
```

**Priority:** 🔴 HIGH

---

#### TC-012: Switch Conversation Updates Messages

```typescript
it("should load new messages when conversation switched", async () => {
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

  vi.mocked(useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  });

  const mockUseMessages = vi.fn();
  vi.mocked(useMessages).mockImplementation(mockUseMessages);

  render(<ChatMainContainer selectedCategoryId="cat-1" />);

  // Click second conversation tab
  fireEvent.click(screen.getByText("Conv 2"));

  await waitFor(() => {
    // Should load messages for second conversation
    expect(mockUseMessages).toHaveBeenCalledWith("conv-2", expect.anything());
  });
});
```

**Priority:** 🔴 HIGH

---

#### TC-013: Empty Conversations - No Auto-Select

```typescript
it("should NOT auto-select when category has no conversations", () => {
  const mockCategories = [
    {
      id: "cat-empty",
      name: "Empty Category",
      conversations: [],
    },
  ];

  vi.mocked(useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  });

  const mockUseMessages = vi.fn();
  vi.mocked(useMessages).mockImplementation(mockUseMessages);

  render(<ChatMainContainer selectedCategoryId="cat-empty" />);

  // Should NOT call useMessages with any conversation ID
  expect(mockUseMessages).not.toHaveBeenCalled();

  // Tabs should not render
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
});
```

**Priority:** 🟡 MEDIUM

---

#### TC-013B: 🆕 Empty State Notification Display

```typescript
it("should display empty state notification when category has no conversations", () => {
  const mockCategories = [
    {
      id: "cat-empty",
      name: "Empty Category",
      conversations: [],
    },
  ];

  vi.mocked(useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  });

  render(<ChatMainContainer selectedCategoryId="cat-empty" />);

  // Verify empty state UI elements
  expect(screen.getByText("Chưa có cuộc trò chuyện")).toBeInTheDocument();
  expect(
    screen.getByText(/Category này chưa có cuộc trò chuyện nào/)
  ).toBeInTheDocument();

  // Verify icon is rendered
  const icon = screen.getByTestId("empty-state-icon"); // Or use role/aria-label
  expect(icon).toBeInTheDocument();

  // Verify ChatHeader/ChatMain NOT rendered
  expect(screen.queryByTestId("chat-header")).not.toBeInTheDocument();
  expect(screen.queryByTestId("chat-main")).not.toBeInTheDocument();
});
```

**Priority:** 🔴 HIGH (🆕 new requirement)

---

#### TC-014: Category Switch Resets Conversation

```typescript
it("should auto-select first conversation of new category when category changes", async () => {
  const mockCategories = [
    {
      id: "cat-1",
      name: "Category A",
      conversations: [{ conversationId: "conv-a1", conversationName: "A1" }],
    },
    {
      id: "cat-2",
      name: "Category B",
      conversations: [{ conversationId: "conv-b1", conversationName: "B1" }],
    },
  ];

  vi.mocked(useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  });

  const { rerender } = render(<ChatMainContainer selectedCategoryId="cat-1" />);

  // Initially loads conv-a1
  await waitFor(() => {
    expect(screen.getByText("A1")).toBeInTheDocument();
  });

  // Switch to cat-2
  rerender(<ChatMainContainer selectedCategoryId="cat-2" />);

  // Should auto-select conv-b1
  await waitFor(() => {
    expect(screen.getByText("B1")).toBeInTheDocument();
  });
});
```

**Priority:** 🟡 MEDIUM

---

#### TC-015: Validation - Invalid Conversation ID

```typescript
it("should fallback to first conversation when invalid conversation selected", () => {
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

  vi.mocked(useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  });

  render(<ChatMainContainer selectedCategoryId="cat-1" />);

  // Try to select non-existent conversation (e.g., via prop injection)
  const handleChange = screen.getByTestId("conversation-change-handler");
  fireEvent.click(handleChange, { conversationId: "invalid-id" });

  // Should fallback to first conversation
  const firstTab = screen.getByText("Conv 1").closest("button");
  expect(firstTab).toHaveClass(/active/);
});
```

**Priority:** 🟢 LOW

---

**ChatMainContainer Tests Summary:**

- Total: 8 test cases (🆕 +2 for empty state)
- Priority: 4 HIGH, 3 MEDIUM, 1 LOW
- Estimated Time: 1 hour 50 minutes (🆕 +20 min for empty state)

---

### 4. E2E Tests - User Flow

**File:** `tests/chat/conversation-selector.spec.ts`

#### TC-016: Display Tabs After Category Selection

```typescript
test("should display conversation tabs after selecting category", async ({
  page,
}) => {
  await page.goto("/portal/workspace");

  // Click category in sidebar
  await page.click('[data-testid="category-item-cat-001"]');

  // Wait for tabs to appear
  await page.waitForSelector('[data-testid="conversation-tab-conv-abc"]', {
    state: "visible",
  });

  // Verify all tabs visible
  await expect(
    page.locator('[data-testid="conversation-tab-conv-abc"]')
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="conversation-tab-conv-def"]')
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="conversation-tab-conv-ghi"]')
  ).toBeVisible();
});
```

**Priority:** 🔴 HIGH  
**Estimated Time:** 15 minutes

---

#### TC-017: Auto-Select First Conversation

```typescript
test("should auto-select first conversation on category load", async ({
  page,
}) => {
  await page.goto("/portal/workspace");
  await page.click('[data-testid="category-item-cat-001"]');

  // Wait for first tab to be active
  const firstTab = page.locator('[data-testid="conversation-tab-conv-abc"]');
  await expect(firstTab).toHaveAttribute("data-active", "true");

  // Verify messages loaded
  await page.waitForSelector('[data-testid="message-list"]', {
    state: "visible",
  });
});
```

**Priority:** 🔴 HIGH  
**Estimated Time:** 15 minutes

---

#### TC-018: Switch Conversation Updates Messages

```typescript
test("should load new messages when switching conversation", async ({
  page,
}) => {
  await page.goto("/portal/workspace");
  await page.click('[data-testid="category-item-cat-001"]');

  // Wait for initial messages
  await page.waitForSelector('[data-testid="message-list"]');
  const initialMessage = await page
    .locator('[data-testid="message-item"]')
    .first()
    .textContent();

  // Click second conversation tab
  await page.click('[data-testid="conversation-tab-conv-def"]');

  // Wait for messages to update
  await page.waitForLoadState("networkidle");

  // Verify messages changed
  const newMessage = await page
    .locator('[data-testid="message-item"]')
    .first()
    .textContent();

  expect(newMessage).not.toBe(initialMessage);
});
```

**Priority:** 🔴 HIGH  
**Estimated Time:** 20 minutes

---

#### TC-019: Unread Badge Display

```typescript
test("should display unread count badge on tabs", async ({ page }) => {
  await page.goto("/portal/workspace");
  await page.click('[data-testid="category-item-cat-002"]'); // Category with unread

  // Verify badge appears
  const badge = page.locator(
    '[data-testid="conversation-tab-conv-jkl"] .badge-unread'
  );
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("5");
  await expect(badge).toHaveCSS("background-color", "rgb(244, 63, 94)"); // rose-500
});
```

**Priority:** 🟡 MEDIUM  
**Estimated Time:** 15 minutes

---

#### TC-020: Empty Category - No Tabs

```typescript
test("should NOT display tabs for category with no conversations", async ({
  page,
}) => {
  await page.goto("/portal/workspace");
  await page.click('[data-testid="category-item-cat-empty"]');

  // Verify tabs NOT visible
  await expect(page.locator('[data-testid^="conversation-tab-"]')).toHaveCount(
    0
  );

  // Verify empty state shown (optional)
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
});
```

**Priority:** 🟡 MEDIUM  
**Estimated Time:** 10 minutes

---

#### TC-020B: 🆕 Empty Category - Notification Screen

```typescript
test("should display notification screen for category with no conversations", async ({
  page,
}) => {
  await page.goto("/portal/workspace");
  await page.click('[data-testid="category-item-cat-empty"]');

  // Verify empty state notification
  await expect(page.locator('text="Chưa có cuộc trò chuyện"')).toBeVisible();
  await expect(
    page.locator('text="Category này chưa có cuộc trò chuyện nào"')
  ).toBeVisible();

  // Verify icon visible
  await expect(page.locator('[data-testid="empty-state-icon"]')).toBeVisible();

  // Verify NO tabs/chat UI
  await expect(page.locator('[data-testid^="conversation-tab-"]')).toHaveCount(
    0
  );
  await expect(page.locator('[data-testid="chat-header"]')).not.toBeVisible();
  await expect(page.locator('[data-testid="message-list"]')).not.toBeVisible();
});
```

**Priority:** 🔴 HIGH (🆕 new requirement)  
**Estimated Time:** 20 minutes

---

**E2E Tests Summary:**

- Total: 6 test cases (🆕 +1 for empty state)
- Priority: 4 HIGH, 2 MEDIUM
- Estimated Time: 1 hour 35 minutes (🆕 +20 min)

---

## 📊 Test Data & Mocks

### Mock Categories Data:

```typescript
export const mockCategories: CategoryDto[] = [
  {
    id: "cat-001",
    userId: "user-123",
    name: "Dự án Website",
    order: 1,
    conversations: [
      { conversationId: "conv-abc", conversationName: "Frontend Development" },
      {
        conversationId: "conv-def",
        conversationName: "Backend API",
        unreadCount: 3,
      },
      {
        conversationId: "conv-ghi",
        conversationName: "DevOps & CI/CD",
        unreadCount: 12,
      },
    ],
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-19T08:45:00Z",
  },
  {
    id: "cat-002",
    userId: "user-123",
    name: "Khách hàng VIP",
    order: 2,
    conversations: [
      {
        conversationId: "conv-jkl",
        conversationName: "Client A - Tư vấn",
        unreadCount: 5,
      },
      { conversationId: "conv-mno", conversationName: "Client B - Support" },
    ],
    createdAt: "2025-01-10T14:20:00Z",
    updatedAt: "2025-01-18T16:00:00Z",
  },
  {
    id: "cat-empty",
    userId: "user-123",
    name: "Empty Category",
    order: 3,
    conversations: [],
    createdAt: "2025-01-05T09:00:00Z",
    updatedAt: "2025-01-05T09:00:00Z",
  },
];
```

### Mock API Responses:

```typescript
// tests/mocks/handlers.ts
import { rest } from "msw";

export const handlers = [
  rest.get("/api/categories", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockCategories));
  }),

  rest.get("/api/categories/:id/conversations", (req, res, ctx) => {
    // Deprecated endpoint - should not be called
    return res(ctx.status(410), ctx.json({ error: "Endpoint deprecated" }));
  }),
];
```

---

## 🎯 Test Execution Checklist

### Before Implementation:

- [ ] Review all test cases with HUMAN
- [ ] Approve test data/mocks
- [ ] Setup test environment (vitest, testing-library, playwright)
- [ ] Create test files structure

### During Implementation:

- [ ] Write unit tests FIRST (TDD approach)
- [ ] Implement ChatHeader with tests passing
- [ ] Write integration tests
- [ ] Implement ChatMainContainer with tests passing
- [ ] Write E2E tests last

### After Implementation:

- [ ] Run all unit tests: `npm run test`
- [ ] Run integration tests: `npm run test:integration`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Check code coverage: `npm run test:coverage`
- [ ] Verify coverage > 85%
- [ ] Fix failing tests
- [ ] Review test reports
- [ ] Update test documentation

---

## 📈 Coverage Goals

| Layer             | Target Coverage | Priority  |
| ----------------- | --------------- | --------- |
| Unit Tests        | 90%+            | 🔴 HIGH   |
| Integration Tests | 80%+            | 🟡 MEDIUM |
| E2E Tests         | 60%+            | 🟢 LOW    |
| **Overall**       | **85%+**        | 🔴 HIGH   |

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                    | Lựa chọn                  | HUMAN Decision |
| --- | ------------------------- | ------------------------- | -------------- |
| 1   | Run E2E tests in CI/CD?   | Yes / No / Manual only    | ⬜ **\_\_\_**  |
| 2   | Code coverage minimum?    | 80% / 85% / 90%           | ⬜ **\_\_\_**  |
| 3   | TDD approach?             | Yes (tests first) / No    | ⬜ **\_\_\_**  |
| 4   | Mock API or real dev API? | Mock (MSW) / Real dev API | ⬜ **\_\_\_**  |
| 5   | E2E test data cleanup?    | Auto / Manual             | ⬜ **\_\_\_**  |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                          | Status       |
| --------------------------------- | ------------ |
| Đã review Test Coverage Matrix    | ✅ Đã review |
| Đã review 22 test cases           | ✅ Đã review |
| Đã review Mock data               | ✅ Đã review |
| Đã review Coverage goals          | ✅ Đã review |
| Đã điền Pending Decisions (5 mục) | ✅ Đã điền   |
| **APPROVED để thực thi**          | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-19

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code tests nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

## 🔗 References

- **Requirements:** See `01_requirements.md`
- **Implementation Plan:** See `04_implementation-plan.md`
- **Vitest Docs:** https://vitest.dev/
- **Testing Library:** https://testing-library.com/docs/react-testing-library/intro/
- **Playwright Docs:** https://playwright.dev/

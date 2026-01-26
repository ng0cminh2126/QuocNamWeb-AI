# [BƯỚC 4.5] Test Requirements - Conversation Enhancements

**Feature:** Conversation Enhancements  
**Date:** 2026-01-20  
**Status:** ✅ APPROVED

---

## 📊 Test Coverage Matrix

| Implementation File                          | Test File                            | Test Cases | Type        |
| -------------------------------------------- | ------------------------------------ | ---------- | ----------- |
| src/utils/storage.ts                         | src/utils/**tests**/storage.test.ts  | 9          | Unit        |
| src/features/.../ChatMainContainer.tsx       | tests/chat/chat-main-members.spec.ts | 4          | Integration |
| src/features/.../ChatMainContainer.tsx       | tests/chat/persistence.spec.ts       | 6          | E2E         |
| src/features/.../ConversationDetailPanel.tsx | tests/chat/detail-panel.spec.ts      | 3          | Integration |

**Total Test Cases:** 22

---

## 🧪 Detailed Test Cases

### Test Suite 1: LocalStorage Functions (Unit Tests)

**File:** `src/utils/__tests__/storage.test.ts`

#### TC-1.1: Save Selected Category - Success

```typescript
test("should save category ID to localStorage", () => {
  saveSelectedCategory("cat-123");
  expect(localStorage.getItem("selected-category-id")).toBe("cat-123");
});
```

#### TC-1.2: Get Selected Category - Success

```typescript
test("should retrieve saved category ID", () => {
  localStorage.setItem("selected-category-id", "cat-456");
  expect(getSelectedCategory()).toBe("cat-456");
});
```

#### TC-1.3: Get Selected Category - Empty

```typescript
test("should return null when no category saved", () => {
  expect(getSelectedCategory()).toBeNull();
});
```

#### TC-1.4: Clear Selected Category

```typescript
test("should remove category from localStorage", () => {
  localStorage.setItem("selected-category-id", "cat-789");
  clearSelectedCategory();
  expect(localStorage.getItem("selected-category-id")).toBeNull();
});
```

#### TC-1.5: Save - Handle localStorage Error

```typescript
test("should handle localStorage quota exceeded", () => {
  const consoleError = jest.spyOn(console, "error").mockImplementation();
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Quota exceeded");
  });

  expect(() => saveSelectedCategory("cat-999")).not.toThrow();
  expect(consoleError).toHaveBeenCalled();
});
```

#### TC-1.6: Get - Handle localStorage Error

```typescript
test("should return null when localStorage fails", () => {
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("localStorage disabled");
  });

  expect(getSelectedCategory()).toBeNull();
});
```

#### TC-1.7: Conversation Persistence - Existing Function Works

```typescript
test("should save and retrieve conversation ID", () => {
  saveSelectedConversation("conv-123");
  expect(getSelectedConversation()).toBe("conv-123");
});
```

#### TC-1.8: Multiple Keys Coexist

```typescript
test("should handle both category and conversation independently", () => {
  saveSelectedCategory("cat-111");
  saveSelectedConversation("conv-222");

  expect(getSelectedCategory()).toBe("cat-111");
  expect(getSelectedConversation()).toBe("conv-222");
});
```

#### TC-1.9: Key Format Validation

```typescript
test("should use correct key format", () => {
  saveSelectedCategory("cat-test");

  // Verify key follows existing pattern
  expect(localStorage.getItem("selected-category-id")).toBe("cat-test");
  expect(localStorage.getItem("selected-conversation-id")).toBeNull();
});
```

**Total:** 9 test cases

---

### Test Suite 2: Members Count Display (Integration)

**File:** `tests/chat/chat-main-members.spec.ts` (Playwright)

#### TC-2.1: Members Count Displays on Conversation Switch

**Preconditions:**

- User logged in
- Category with multiple conversations available
- Conversation A has 3 members
- Conversation B has 7 members

**Steps:**

1. Navigate to chat page
2. Select conversation A
3. Wait for members API response
4. Verify ChatHeader shows member count
5. Select conversation B
6. Verify ChatHeader updates to 7 members

**Expected:**

- ChatHeader displays "3 thành viên" (or format from UI) for conversation A
- ChatHeader updates to "7 thành viên" for conversation B
- No errors in console

**Playwright Code:**

```typescript
test("should display and update member count on conversation switch", async ({
  page,
}) => {
  await page.goto("/portal/workspace");

  // Select conversation A (3 members)
  await page.click('[data-testid="conversation-item-A"]');
  await page.waitForResponse((resp) => resp.url().includes("/members"));

  const memberCountA = await page.textContent(
    '[data-testid="chat-header-member-count"]',
  );
  expect(memberCountA).toContain("3");

  // Switch to conversation B (7 members)
  await page.click('[data-testid="conversation-item-B"]');
  await page.waitForResponse((resp) => resp.url().includes("/members"));

  const memberCountB = await page.textContent(
    '[data-testid="chat-header-member-count"]',
  );
  expect(memberCountB).toContain("7");
});
```

#### TC-2.2: Members API Error Handling

**Preconditions:**

- User logged in
- Mock API to return error

**Steps:**

1. Navigate to chat
2. Select conversation
3. API returns 500 error
4. Verify ChatHeader handles gracefully

**Expected:**

- No crash
- Member count shows 0 or fallback text
- Error logged to console (not shown to user)

```typescript
test("should handle members API error gracefully", async ({ page }) => {
  await page.route("**/api/conversations/*/members", (route) =>
    route.fulfill({ status: 500, body: '{"error": "Server error"}' }),
  );

  await page.goto("/portal/workspace");
  await page.click('[data-testid="conversation-item"]');

  // Should not crash, show fallback
  const memberCount = await page.textContent(
    '[data-testid="chat-header-member-count"]',
  );
  expect(memberCount).toBeTruthy(); // Shows something (0 or fallback)
});
```

#### TC-2.3: Members API Loading State

**Steps:**

1. Navigate to chat
2. Delay members API response
3. Verify loading state shown
4. Verify count appears after load

**Expected:**

- Skeleton/loading indicator during API call
- Member count appears after response

```typescript
test("should show loading state while fetching members", async ({ page }) => {
  await page.route("**/api/conversations/*/members", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay
    await route.continue();
  });

  await page.goto("/portal/workspace");
  await page.click('[data-testid="conversation-item"]');

  // Check loading state exists (depends on UI implementation)
  const isLoading = await page.isVisible(
    '[data-testid="member-count-skeleton"]',
  );
  expect(isLoading).toBe(true);

  // Wait for data
  await page.waitForResponse((resp) => resp.url().includes("/members"));
  const memberCount = await page.textContent(
    '[data-testid="chat-header-member-count"]',
  );
  expect(memberCount).toBeTruthy();
});
```

#### TC-2.4: Members API Called Only Once (Cache Verification)

**Steps:**

1. Select conversation A
2. Wait for members API call
3. Switch to conversation B
4. Switch back to conversation A within 5 minutes
5. Verify API NOT called again (cached)

**Expected:**

- First switch: API called
- Second switch back: Use cache (no API call)

```typescript
test("should use cache when returning to conversation within 5 minutes", async ({
  page,
}) => {
  let apiCallCount = 0;
  await page.route("**/api/conversations/*/members", (route) => {
    apiCallCount++;
    route.continue();
  });

  await page.goto("/portal/workspace");

  // First select - API called
  await page.click('[data-testid="conversation-item-A"]');
  await page.waitForTimeout(500);
  expect(apiCallCount).toBe(1);

  // Switch away
  await page.click('[data-testid="conversation-item-B"]');
  await page.waitForTimeout(500);
  expect(apiCallCount).toBe(2);

  // Switch back - should use cache (within 5 min)
  await page.click('[data-testid="conversation-item-A"]');
  await page.waitForTimeout(500);
  expect(apiCallCount).toBe(2); // Still 2, not 3 (cached)
});
```

**Total:** 4 test cases

---

### Test Suite 3: Persistence (E2E Tests)

**File:** `tests/chat/persistence.spec.ts` (Playwright)

#### TC-3.1: Save Category and Conversation on Switch

**Steps:**

1. Login
2. Select category "Marketing"
3. Select conversation "Campaign XYZ"
4. Check localStorage

**Expected:**

- `selected-category-id` = "cat-marketing"
- `selected-conversation-id` = "conv-campaign-xyz"

```typescript
test("should save category and conversation to localStorage", async ({
  page,
}) => {
  await page.goto("/portal/workspace");

  await page.click('[data-testid="category-tab-marketing"]');
  await page.click('[data-testid="conversation-item-campaign"]');

  const categoryId = await page.evaluate(() =>
    localStorage.getItem("selected-category-id"),
  );
  const conversationId = await page.evaluate(() =>
    localStorage.getItem("selected-conversation-id"),
  );

  expect(categoryId).toBe("cat-marketing");
  expect(conversationId).toBe("conv-campaign");
});
```

#### TC-3.2: Restore on Reload (Happy Path)

**Steps:**

1. Set localStorage: category + conversation
2. Reload page
3. Verify restored to correct category + conversation

**Expected:**

- Active category matches persisted
- Active conversation matches persisted
- Messages loaded for that conversation

```typescript
test("should restore category and conversation on reload", async ({ page }) => {
  await page.goto("/portal/workspace");

  // Set initial state
  await page.click('[data-testid="category-tab-dev"]');
  await page.click('[data-testid="conversation-item-bug-123"]');

  // Reload
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Verify restored
  const activeCategory = await page.getAttribute(
    '[data-testid="category-tab-dev"]',
    "aria-selected",
  );
  expect(activeCategory).toBe("true");

  const activeConversation = await page.getAttribute(
    '[data-testid="conversation-item-bug-123"]',
    "aria-selected",
  );
  expect(activeConversation).toBe("true");
});
```

#### TC-3.3: Fallback When Conversation Deleted

**Steps:**

1. Set localStorage with deleted conversation ID
2. Reload page
3. Verify fallback to first available

**Expected:**

- App doesn't crash
- First category selected
- First conversation in that category selected
- localStorage updated with new values

```typescript
test("should fallback to first conversation when persisted one deleted", async ({
  page,
}) => {
  // Pre-populate localStorage with non-existent IDs
  await page.goto("/portal/workspace");
  await page.evaluate(() => {
    localStorage.setItem("selected-category-id", "cat-deleted");
    localStorage.setItem("selected-conversation-id", "conv-deleted");
  });

  // Reload
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Should fallback to first available
  const firstCategorySelected = await page.isVisible(
    '[data-testid^="category-tab"]:first-of-type[aria-selected="true"]',
  );
  expect(firstCategorySelected).toBe(true);

  const firstConversationSelected = await page.isVisible(
    '[data-testid^="conversation-item"]:first-of-type[aria-selected="true"]',
  );
  expect(firstConversationSelected).toBe(true);
});
```

#### TC-3.4: No Persistence When No Categories

**Steps:**

1. Mock user with no categories
2. Check localStorage not written

**Expected:**

- No errors
- localStorage remains empty
- Empty state shown

```typescript
test("should not persist when user has no categories", async ({ page }) => {
  await page.route("**/api/categories", (route) =>
    route.fulfill({ status: 200, body: '{"data": []}' }),
  );

  await page.goto("/portal/workspace");

  const categoryId = await page.evaluate(() =>
    localStorage.getItem("selected-category-id"),
  );

  expect(categoryId).toBeNull();
});
```

#### TC-3.5: Persistence Across Tab Switch (Same Browser)

**Steps:**

1. Open chat in tab 1
2. Select category + conversation
3. Open same URL in tab 2
4. Verify tab 2 opens to same category + conversation

**Expected:**

- Tab 2 restores from localStorage
- Both tabs show same active state

```typescript
test("should persist across multiple tabs", async ({ browser }) => {
  const context = await browser.newContext();
  const page1 = await context.newPage();

  await page1.goto("/portal/workspace");
  await page1.click('[data-testid="category-tab-sales"]');
  await page1.click('[data-testid="conversation-item-deal-456"]');

  // Open tab 2
  const page2 = await context.newPage();
  await page2.goto("/portal/workspace");
  await page2.waitForLoadState("networkidle");

  // Verify tab 2 restored
  const activeCategory = await page2.getAttribute(
    '[data-testid="category-tab-sales"]',
    "aria-selected",
  );
  expect(activeCategory).toBe("true");

  await context.close();
});
```

#### TC-3.6: Update Persistence on Every Switch

**Steps:**

1. Select category A, conversation 1
2. Check localStorage
3. Switch to category B, conversation 2
4. Check localStorage updated
5. Reload
6. Verify opens to B, 2 (not A, 1)

**Expected:**

- LocalStorage updated on each switch
- Reload opens to last selected state

```typescript
test("should update localStorage on every switch", async ({ page }) => {
  await page.goto("/portal/workspace");

  // First selection
  await page.click('[data-testid="category-tab-A"]');
  await page.click('[data-testid="conversation-item-1"]');

  let catId = await page.evaluate(() =>
    localStorage.getItem("selected-category-id"),
  );
  let convId = await page.evaluate(() =>
    localStorage.getItem("selected-conversation-id"),
  );
  expect(catId).toBe("cat-A");
  expect(convId).toBe("conv-1");

  // Second selection
  await page.click('[data-testid="category-tab-B"]');
  await page.click('[data-testid="conversation-item-2"]');

  catId = await page.evaluate(() =>
    localStorage.getItem("selected-category-id"),
  );
  convId = await page.evaluate(() =>
    localStorage.getItem("selected-conversation-id"),
  );
  expect(catId).toBe("cat-B");
  expect(convId).toBe("conv-2");

  // Reload
  await page.reload();

  // Should open to B, 2
  const activeB = await page.getAttribute(
    '[data-testid="category-tab-B"]',
    "aria-selected",
  );
  expect(activeB).toBe("true");
});
```

**Total:** 6 test cases

---

### Test Suite 4: Detail Panel Display (Integration)

**File:** `tests/chat/detail-panel.spec.ts` (Playwright)

#### TC-4.1: Detail Panel Shows Category Name

**Steps:**

1. Select category "Marketing"
2. Select conversation "Q1 Campaign"
3. Open ConversationDetailPanel
4. Verify category displayed

**Expected:**

- Panel shows "Marketing" (based on decision #5: no prefix, just name)

```typescript
test("should display category name in detail panel", async ({ page }) => {
  await page.goto("/portal/workspace");

  await page.click('[data-testid="category-tab-marketing"]');
  await page.click('[data-testid="conversation-item-q1-campaign"]');
  await page.click('[data-testid="open-detail-panel"]');

  const categoryName = await page.textContent(
    '[data-testid="detail-panel-category"]',
  );
  expect(categoryName).toBe("Marketing"); // No "Nhóm:" prefix
});
```

#### TC-4.2: Detail Panel Shows Conversation Name

**Steps:**

1. Select conversation "Bug #456"
2. Open detail panel
3. Verify conversation name displayed

**Expected:**

- Panel shows "Bug #456"

```typescript
test("should display conversation name in detail panel", async ({ page }) => {
  await page.goto("/portal/workspace");

  await page.click('[data-testid="conversation-item-bug-456"]');
  await page.click('[data-testid="open-detail-panel"]');

  const conversationName = await page.textContent(
    '[data-testid="detail-panel-conversation"]',
  );
  expect(conversationName).toBe("Bug #456");
});
```

#### TC-4.3: Detail Panel Updates on Conversation Switch

**Steps:**

1. Select conversation A in category X
2. Open detail panel
3. Verify shows X, A
4. Switch to conversation B in category Y
5. Verify updates to Y, B

**Expected:**

- Panel updates real-time when switching

```typescript
test("should update detail panel when switching conversations", async ({
  page,
}) => {
  await page.goto("/portal/workspace");

  // First selection
  await page.click('[data-testid="category-tab-X"]');
  await page.click('[data-testid="conversation-item-A"]');
  await page.click('[data-testid="open-detail-panel"]');

  let category = await page.textContent(
    '[data-testid="detail-panel-category"]',
  );
  let conversation = await page.textContent(
    '[data-testid="detail-panel-conversation"]',
  );
  expect(category).toBe("Category X");
  expect(conversation).toBe("Conversation A");

  // Switch
  await page.click('[data-testid="category-tab-Y"]');
  await page.click('[data-testid="conversation-item-B"]');

  category = await page.textContent('[data-testid="detail-panel-category"]');
  conversation = await page.textContent(
    '[data-testid="detail-panel-conversation"]',
  );
  expect(category).toBe("Category Y");
  expect(conversation).toBe("Conversation B");
});
```

**Total:** 3 test cases

---

## 🎯 Test Data Requirements

### Mock Data Needed

**Categories:**

- Category A (ID: cat-A, Name: "Marketing")
- Category B (ID: cat-B, Name: "Dev Team")

**Conversations:**

- Conversation 1 (ID: conv-1, Name: "Q1 Campaign", Members: 3)
- Conversation 2 (ID: conv-2, Name: "Bug #456", Members: 7)

**Members API Response:**

```json
{
  "data": [
    {
      "id": "user-1",
      "fullName": "User One",
      "email": "user1@example.com"
    },
    {
      "id": "user-2",
      "fullName": "User Two",
      "email": "user2@example.com"
    },
    {
      "id": "user-3",
      "fullName": "User Three",
      "email": "user3@example.com"
    }
  ]
}
```

---

## 📋 Test Generation Checklist

### Unit Tests

- [ ] storage.ts - 9 test cases written
- [ ] All tests pass
- [ ] Coverage > 90%

### Integration Tests

- [ ] Members count display - 4 test cases
- [ ] Detail panel - 3 test cases
- [ ] All tests pass

### E2E Tests

- [ ] Persistence flow - 6 test cases
- [ ] All tests pass
- [ ] Run on CI/CD pipeline

### Manual Tests

- [ ] Test all scenarios in real browser
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsive testing

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                       | Status       |
| ------------------------------ | ------------ |
| Đã review test coverage matrix | ✅ Đã review |
| Đã review test cases           | ✅ Đã review |
| Test requirements đầy đủ       | ✅ Confirmed |
| **APPROVED để code + test**    | ✅ APPROVED  |

**HUMAN Actions Required:**

1. Review 22 test cases ✅ DONE
2. Confirm test data requirements ✅ DONE
3. Approve để AI proceed with implementation ✅ DONE

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-21

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code nếu mục "APPROVED để code + test" = ⬜ CHƯA APPROVED**

---

**Created:** 2026-01-20  
**Status:** ⏳ PENDING APPROVAL  
**Next Step:** HUMAN approve → AI start coding (Phase 1: LocalStorage)

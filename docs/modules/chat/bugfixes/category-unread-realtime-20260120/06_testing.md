# [BƯỚC 4.5] Testing Requirements - Category Unread Realtime Bugfix

**Feature:** Category Conversations Unread Count Realtime Update  
**Date:** 2026-01-20  
**Status:** ⏳ PENDING APPROVAL

---

## 🧪 Test Coverage Overview

### Test Pyramid

```
          ┌─────────────┐
          │   E2E (4)   │  ← Realtime 2-user scenarios
          │  Playwright │
          └─────────────┘
                 │
        ┌────────────────┐
        │ Integration (0) │  ← Not needed (useMemo behavior)
        └────────────────┘
                 │
          ┌──────────────┐
          │  Unit (0)    │  ← Not needed (trivial change)
          └──────────────┘
```

**Rationale:**

- **No Unit Tests:** Fix là 1 line dependency change, không có complex logic
- **No Integration Tests:** useMemo behavior là React internal, không test được
- **Focus on E2E:** Cần verify realtime behavior với 2 users thực tế

---

## 📋 Test Coverage Matrix

| Implementation File       | Test File                                      | Test Cases | Coverage |
| ------------------------- | ---------------------------------------------- | ---------- | -------- |
| ChatMainContainer.tsx     | category-conversations-realtime.spec.ts        | 4          | E2E      |
| useConversationRealtime.ts| (existing) useConversationRealtime.test.tsx   | 0 new      | N/A      |

**Total Test Cases:** 4 (all E2E)

---

## 🎯 Test Cases Detail

### TC-1: Badge Appears on Inactive Conversation

**Type:** E2E  
**Priority:** MUST  
**File:** `tests/chat/category-conversations-realtime.spec.ts`

**Setup:**

- User A: `user@quoc-nam.com` / `User@123`
- User B: `admin@quoc-nam.com` / `Admin@123`
- Both in same category with conversations: "Group", "Group 3"

**Steps:**

1. User B opens category → Select "Group 3" (active)
2. Verify User B sees ChatHeader with "Group" tab (inactive)
3. User A sends message to "Group" conversation
4. Wait for SignalR event (max 3000ms)
5. **ASSERT:** User B sees badge "1" on "Group" tab

**Expected Result:**

```tsx
// Locator: [data-testid="conversation-tabs"] >> text=Group
expect(groupTab).toContainText("1"); // Badge with count
```

**Cleanup:**

- Both users logout
- Clear browser storage

---

### TC-2: Badge Increments with Multiple Messages

**Type:** E2E  
**Priority:** MUST  
**File:** `tests/chat/category-conversations-realtime.spec.ts`

**Setup:**

- Continue from TC-1 (badge already shows "1")

**Steps:**

1. User A sends 2nd message to "Group"
2. Wait for SignalR event (max 3000ms)
3. **ASSERT:** Badge updates "1" → "2"

**Expected Result:**

```tsx
await expect(groupTab).toContainText("2", { timeout: 3000 });
```

---

### TC-3: Badge Clears When Switching to Conversation

**Type:** E2E  
**Priority:** MUST  
**File:** `tests/chat/category-conversations-realtime.spec.ts`

**Setup:**

- Continue from TC-2 (badge shows "2")

**Steps:**

1. User B clicks "Group" tab
2. Wait for conversation to load
3. **ASSERT:** Badge disappears (no longer visible)
4. **ASSERT:** Message list loads with new messages

**Expected Result:**

```tsx
// Badge should not be present
await expect(groupTab.locator('[data-testid="unread-badge"]')).not.toBeVisible();

// Messages visible
await expect(page.locator('[data-testid="message-list"]')).toBeVisible();
```

---

### TC-4: No Badge on Active Conversation

**Type:** E2E  
**Priority:** MUST  
**File:** `tests/chat/category-conversations-realtime.spec.ts`

**Setup:**

- Fresh test (independent from TC-1-3)
- User B opens "Group" (active)

**Steps:**

1. User B selects category → Opens "Group" (active)
2. User A sends message to "Group"
3. Wait for SignalR event (max 3000ms)
4. **ASSERT:** NO badge appears on "Group" tab (because it's active)
5. **ASSERT:** Message appears in message list instead

**Expected Result:**

```tsx
// No badge
await expect(groupTab.locator('[data-testid="unread-badge"]')).not.toBeVisible();

// Message visible in list
await expect(page.locator('[data-testid="message-list"]').last()).toContainText(messageContent);
```

---

## 🛠️ Test Implementation Guide

### Test File Structure

**File:** `tests/chat/category-conversations-realtime.spec.ts`

```typescript
import { test, expect, Page, BrowserContext } from "@playwright/test";

// Test credentials
const USER_A = { email: "user@quoc-nam.com", password: "User@123" };
const USER_B = { email: "admin@quoc-nam.com", password: "Admin@123" };

// Shared state
let userAContext: BrowserContext;
let userBContext: BrowserContext;
let pageA: Page;
let pageB: Page;

let testCategoryId: string;
let conversationGroup: string; // "Group"
let conversationGroup3: string; // "Group 3"

test.describe("Category Conversations - Realtime Unread Count", () => {
  test.beforeAll(async ({ browser }) => {
    // Setup: Create 2 browser contexts (2 users)
    userAContext = await browser.newContext();
    userBContext = await browser.newContext();
    
    pageA = await userAContext.newPage();
    pageB = await userBContext.newPage();
    
    // Login both users
    await loginUser(pageA, USER_A);
    await loginUser(pageB, USER_B);
    
    // Find shared category & conversations
    const setup = await findSharedCategoryAndConversations(pageA, pageB);
    testCategoryId = setup.categoryId;
    conversationGroup = setup.conversations[0]; // Assuming "Group"
    conversationGroup3 = setup.conversations[1]; // Assuming "Group 3"
  });

  test.afterAll(async () => {
    await userAContext.close();
    await userBContext.close();
  });

  test("TC-1: Badge appears on inactive conversation", async () => {
    // Implementation...
  });

  test("TC-2: Badge increments with multiple messages", async () => {
    // Implementation...
  });

  test("TC-3: Badge clears when switching to conversation", async () => {
    // Implementation...
  });

  test("TC-4: No badge on active conversation", async () => {
    // Implementation...
  });
});

// Helper functions
async function loginUser(page: Page, credentials: typeof USER_A) {
  // Implementation...
}

async function findSharedCategoryAndConversations(pageA: Page, pageB: Page) {
  // Implementation...
}

async function sendMessage(page: Page, conversationId: string, content: string) {
  // Implementation...
}

async function selectCategory(page: Page, categoryId: string) {
  // Implementation...
}

async function openConversation(page: Page, conversationName: string) {
  // Implementation...
}
```

---

## 🔧 Test Data & Mocks

### Required Test Data

| Data Type        | Source                  | Notes                          |
| ---------------- | ----------------------- | ------------------------------ |
| Category ID      | API (runtime discovery) | Find shared category for users |
| Conversation IDs | API (runtime discovery) | "Group", "Group 3", etc.       |
| User credentials | Hardcoded               | `user@quoc-nam.com`, etc.      |

### No Mocks Needed

- ✅ Uses real API (live testing environment)
- ✅ Uses real SignalR connection
- ✅ No stubbed data (ensures realtime behavior works)

---

## ⚙️ Test Configuration

### Playwright Config

**File:** `playwright.config.ts` (existing)

**Required Settings:**

```typescript
{
  testDir: './tests',
  timeout: 60000, // 60s per test (allow SignalR delays)
  retries: 2, // Retry flaky tests (network issues)
  use: {
    baseURL: process.env.VITE_API_BASE_URL,
    trace: 'on-first-retry', // Debug flaky tests
    video: 'retain-on-failure', // Record failures
  },
}
```

### Environment Variables

**File:** `.env.local` (for E2E tests)

```bash
VITE_API_BASE_URL=https://dev-api.quoc-nam.com
VITE_SIGNALR_HUB_URL=https://dev-api.quoc-nam.com/hubs/chat
```

---

## 🐛 Debugging Guide

### Common Issues

**Issue 1: SignalR Event Not Received**

**Symptoms:** Badge never appears, test times out

**Debug Steps:**

1. Check SignalR connection status: `window.chatHub?.state`
2. Add console.log in `useConversationRealtime.ts`
3. Verify backend emits events (check backend logs)
4. Check network tab for WebSocket connection

**Fix:** Increase timeout to 5000ms

---

**Issue 2: Badge Appears Too Late**

**Symptoms:** Test passes sometimes, fails other times (flaky)

**Debug Steps:**

1. Measure actual latency: `performance.now()`
2. Check network throttling in Playwright
3. Verify no CPU/memory bottleneck

**Fix:** Use `waitFor` with custom condition instead of fixed timeout

---

**Issue 3: Badge Shows Wrong Count**

**Symptoms:** Badge shows "0" or wrong number

**Debug Steps:**

1. Verify `apiGroups` contains correct `unreadCount`
2. Check `categoryConversations` computation in React DevTools
3. Verify `groupsQuery.dataUpdatedAt` actually changed

**Fix:** Add debug logging to `useMemo` dependencies

---

## 📊 Test Execution

### Running Tests Locally

```bash
# Run all category realtime tests
npm run test:e2e -- category-conversations-realtime

# Run specific test case
npm run test:e2e -- category-conversations-realtime -g "TC-1"

# Run with headed browser (see what's happening)
npm run test:e2e -- category-conversations-realtime --headed

# Run with debug mode
npm run test:e2e -- category-conversations-realtime --debug

# Generate HTML report
npm run test:e2e:report
```

### CI/CD Integration

**GitHub Actions Workflow:**

```yaml
- name: Run E2E Tests
  run: npm run test:e2e -- category-conversations-realtime
  env:
    VITE_API_BASE_URL: ${{ secrets.DEV_API_URL }}
    VITE_SIGNALR_HUB_URL: ${{ secrets.DEV_SIGNALR_URL }}
```

---

## ✅ Acceptance Criteria (Testing Perspective)

### Definition of Done

- [x] All 4 test cases implemented
- [ ] Tests pass locally (3 consecutive runs)
- [ ] Tests pass in CI/CD
- [ ] No flaky tests (retry < 2 times)
- [ ] Execution time < 120s total
- [ ] Test coverage documented
- [ ] Debug guide documented

### Performance Targets

| Metric                    | Target   | Measured |
| ------------------------- | -------- | -------- |
| Badge update latency      | < 2s     | \_\_\_   |
| Test execution time       | < 120s   | \_\_\_   |
| Flaky test rate           | < 10%    | \_\_\_   |
| False positive rate       | 0%       | \_\_\_   |

---

## 📝 Test Generation Checklist

### Pre-Implementation

- [x] Review acceptance criteria from requirements
- [x] Identify test data requirements
- [x] Design test file structure
- [ ] Setup test environment (credentials, API access)

### Implementation

- [ ] Create test file: `category-conversations-realtime.spec.ts`
- [ ] Implement TC-1: Badge appears
- [ ] Implement TC-2: Badge increments
- [ ] Implement TC-3: Badge clears
- [ ] Implement TC-4: No badge on active
- [ ] Add helper functions (login, sendMessage, etc.)
- [ ] Add debug logging for troubleshooting

### Verification

- [ ] Run tests locally: All pass
- [ ] Run tests 3 times: No flakes
- [ ] Test with slow network: Still passes
- [ ] Review video recordings of failures
- [ ] Verify trace files generated

### Documentation

- [ ] Update this file with actual execution results
- [ ] Document any new debugging techniques
- [ ] Update troubleshooting guide if new issues found

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                                | Decision        |
| --- | ------------------------------------- | --------------- |
| 1   | Badge update timeout                  | ✅ 3000ms       |
| 2   | Test retry count                      | ✅ 2 retries    |
| 3   | Record video for all tests?           | ⬜ **\_\_\_**   |
| 4   | Run tests on multiple browsers?       | ⬜ **\_\_\_**   |
| 5   | Add performance monitoring?           | ⬜ **\_\_\_**   |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                           | Status         |
| ---------------------------------- | -------------- |
| Đã review Test Coverage            | ⬜ Chưa review |
| Đã review Test Cases (TC-1 to 4)   | ⬜ Chưa review |
| Đã review Test Implementation      | ⬜ Chưa review |
| Đã điền Pending Decisions          | ⬜ Chưa điền   |
| **APPROVED để tạo test code**      | ⬜ CHƯA APPROVED |

**HUMAN Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_  
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tạo test code nếu mục "APPROVED để tạo test code" = ⬜ CHƯA APPROVED**

---

## 📚 References

### Playwright Documentation

- [Browser Contexts](https://playwright.dev/docs/browser-contexts) - Multi-user testing
- [Auto-waiting](https://playwright.dev/docs/actionability) - Wait for elements
- [Test Retries](https://playwright.dev/docs/test-retries) - Handle flaky tests

### Example Tests

- [realtime-updates.spec.ts](f:\Working\NgocMinhV2\QUOCNAM\WebUser\tests\chat\conversation-list\e2e\realtime-updates.spec.ts) - Similar 2-user test
- [signalr-realtime.spec.ts](f:\Working\NgocMinhV2\QUOCNAM\WebUser\tests\chat\messages\e2e\signalr-realtime.spec.ts) - SignalR testing example

### Related Docs

- [01_requirements.md](./01_requirements.md) - Acceptance criteria source
- [04_implementation-plan.md](./04_implementation-plan.md) - Code changes being tested

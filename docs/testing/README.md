# Testing Guide - Portal Chat Project

> **Last updated:** 2026-01-06  
> **Purpose:** Comprehensive testing strategy và guidelines cho mọi feature development

---

## 📚 Table of Contents

- [Overview](#overview)
- [Test Requirements Generation](#test-requirements-generation)
- [Test Types](#test-types)
- [Folder Structure](#folder-structure)
- [Test Creation Workflow](#test-creation-workflow)
- [Naming Conventions](#naming-conventions)
- [Testing Tools](#testing-tools)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Common Patterns](#common-patterns)
- [CI/CD Integration](#cicd-integration)

**📋 Quick Links:**

- 📖 [Test Requirements Workflow Guide](../guides/TEST_REQUIREMENTS_WORKFLOW.md) - Chi tiết về 06_testing.md
- 📝 [Testing Template](../modules/_feature_template/06_testing.md) - Template cho test requirements
- 📊 [Update Summary](./TEST_DOCUMENTATION_UPDATE_20260106.md) - Tổng hợp changes ngày 2026-01-06

---

## Overview

### Testing Philosophy

**"No Code Without Tests" - Mọi code mới PHẢI có tests tương ứng**

1. ✅ **Unit tests** - Test isolated functions, hooks, utilities
2. ✅ **Integration tests** - Test component interactions, data flow
3. ✅ **E2E tests** - Test critical user journeys in real browser

### When to Create Tests

| Scenario                            | Required Tests           |
| ----------------------------------- | ------------------------ |
| Tạo API client function             | Unit test (3+ cases)     |
| Tạo custom hook                     | Unit test (5+ cases)     |
| Tạo React component                 | Unit test (4+ cases)     |
| Tạo utility function                | Unit test (3+ cases)     |
| Feature có UI + API + real-time     | Unit + Integration + E2E |
| Critical user flow (login, payment) | E2E mandatory            |

---

## Test Requirements Generation

### 🎯 Automatic Test Requirements File

**RULE:** Mỗi feature mới PHẢI có file test requirements để AI/Developer dễ dàng generate test cases

**File:** `docs/modules/[module]/features/[feature]/06_testing.md` (BƯỚC 6)

**Khi nào tạo:** Sau khi hoàn thành implementation plan (BƯỚC 4) và trước khi coding (BƯỚC 5)

### Template Structure

File `06_testing.md` PHẢI bao gồm:

```markdown
# 🧪 [Feature Name] - Testing Requirements

## 📊 Test Coverage Matrix

### Unit Tests (Required)

| Implementation File | Test File                 | Test Cases | Status |
| ------------------- | ------------------------- | ---------- | ------ |
| src/api/xxx.api.ts  | tests/.../xxx.api.test.ts | 4          | ⏳     |

### Integration Tests (Required)

| Test File | Description | Test Cases | Status |
| --------- | ----------- | ---------- | ------ |

### E2E Tests (Optional/Required)

| Test File | User Flow | Status |
| --------- | --------- | ------ |

## 🧪 Detailed Test Cases

### 1. Unit Test: [filename].test.ts

| #   | Test Case    | Priority | Input      | Expected Output |
| --- | ------------ | -------- | ---------- | --------------- |
| 1   | Success case | HIGH     | valid data | returns data    |
| 2   | Error case   | HIGH     | invalid    | throws error    |

## ✅ Test Generation Checklist

- [ ] All implementation files have corresponding test files
- [ ] All test cases documented
- [ ] Test data/mocks prepared
- [ ] E2E scenarios defined
```

### Benefits

1. ✅ **AI-friendly:** AI có thể đọc file này và generate test code tự động
2. ✅ **Traceability:** Mỗi implementation file → test file mapping rõ ràng
3. ✅ **Completeness:** Đảm bảo không miss test cases quan trọng
4. ✅ **Review:** Dễ dàng review test coverage trước khi code

### Workflow Integration

```
BƯỚC 4: Implementation Plan (approved)
        ↓
BƯỚC 5: AI generates 06_testing.md
        ↓
HUMAN reviews test requirements
        ↓
HUMAN approves ✅
        ↓
BƯỚC 6: AI/Dev writes code + tests simultaneously
        (referencing 06_testing.md)
```

---

## Test Types

### 1. Unit Tests

**Purpose:** Test isolated units (functions, hooks, components)

**Location:** `tests/{module}/{feature}/unit/`

**Framework:** Vitest + React Testing Library

**Characteristics:**

- ✅ Fast execution (<100ms per test)
- ✅ Mock all dependencies
- ✅ Focus on single responsibility
- ✅ 100% predictable results

**Example:**

```typescript
// tests/chat/messages/unit/useSendMessage.test.tsx
describe("useSendMessage", () => {
  it("should send message with optimistic update", async () => {
    const { result } = renderHook(() => useSendMessage(), { wrapper });

    act(() => {
      result.current.mutate({ content: "Test" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

### 2. Integration Tests

**Purpose:** Test interactions between multiple units

**Location:** `tests/{module}/{feature}/integration/`

**Framework:** Vitest + React Testing Library

**Characteristics:**

- ✅ Test data flow between components
- ✅ Mock external APIs only
- ✅ Real state management (React Query, Zustand)
- ⏱️ Medium execution time (200-500ms)

**Example:**

```typescript
// tests/chat/messages/integration/message-flow.test.tsx
describe("Message Send Flow", () => {
  it("should handle send → optimistic → API → SignalR flow", async () => {
    const { getByTestId } = render(<ChatMain groupId="123" />);

    const input = getByTestId("chat-message-input");
    const sendBtn = getByTestId("chat-send-button");

    fireEvent.change(input, { target: { value: "Hi" } });
    fireEvent.click(sendBtn);

    // Optimistic message appears
    expect(getByTestId("message-list")).toHaveTextContent("Hi");

    await waitFor(() => {
      // Real message replaces optimistic
      expect(apiCalls.filter((c) => c.method === "POST")).toHaveLength(1);
    });
  });
});
```

### 3. E2E Tests

**Purpose:** Test complete user journeys in real browser

**Location:** `tests/{module}/{feature}/e2e/`

**Framework:** Playwright

**Characteristics:**

- ✅ Real browser (Chromium, Firefox, WebKit)
- ✅ Real API calls (use staging/dev environment)
- ✅ Test critical user flows
- ⏱️ Slow execution (5-30s per test)

**Example:**

```typescript
// tests/chat/messages/e2e/message-sending.spec.ts
test("should send message with no duplicate API calls", async ({ page }) => {
  await page.goto("/portal");
  await page.click('[data-testid="conversation-item-123"]');

  const apiCalls = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/")) apiCalls.push(req.method());
  });

  await page.fill('[data-testid="chat-message-input"]', "E2E Test");
  await page.click('[data-testid="chat-send-button"]');

  await page.waitForTimeout(2000);

  // Only 1 POST, no GET refetch
  expect(apiCalls.filter((m) => m === "POST")).toHaveLength(1);
  expect(apiCalls.filter((m) => m === "GET")).toHaveLength(0);
});
```

---

## Folder Structure

### Standard Layout

```
tests/
├── README.md                   # Testing overview
├── {module}/                   # e.g., auth, chat, task
│   └── {feature}/              # e.g., login, messages, create-task
│       ├── README.md           # Feature test docs
│       ├── unit/               # Unit tests
│       │   ├── {file}.test.ts(x)
│       │   └── ...
│       ├── integration/        # Integration tests
│       │   ├── {flow}.test.tsx
│       │   └── ...
│       └── e2e/                # E2E tests
│           ├── {scenario}.spec.ts
│           └── ...
└── fixtures/                   # Shared test data
    ├── messages.ts
    └── users.ts
```

### Example: Chat Messages

```
tests/chat/messages/
├── README.md
├── unit/
│   ├── useSendMessage.test.tsx         # 6 tests
│   └── useMessageRealtime.test.tsx     # 9 tests
├── integration/
│   └── message-send-flow.test.tsx      # 4 tests
└── e2e/
    ├── message-sending.spec.ts         # 4 tests
    └── signalr-realtime.spec.ts        # 4 tests
```

---

## Test Creation Workflow

### Step 1: Identify Test Scope

**When creating new feature:**

```
Feature: Send Message
├── API client → tests/{module}/{feature}/unit/{api-client}.test.ts
├── Hook → tests/{module}/{feature}/unit/{hook}.test.tsx
├── Component → tests/{module}/{feature}/unit/{component}.test.tsx
├── Flow → tests/{module}/{feature}/integration/{flow}.test.tsx
└── Critical path → tests/{module}/{feature}/e2e/{scenario}.spec.ts
```

### Step 2: Create Test Files

**Use naming pattern:**

| Type            | Pattern                | Example                      |
| --------------- | ---------------------- | ---------------------------- |
| Unit test (TS)  | `{name}.test.ts`       | `messages.api.test.ts`       |
| Unit test (TSX) | `{name}.test.tsx`      | `useSendMessage.test.tsx`    |
| Integration     | `{flow-name}.test.tsx` | `message-send-flow.test.tsx` |
| E2E             | `{scenario}.spec.ts`   | `message-sending.spec.ts`    |

### Step 3: Write Tests

**Minimum test cases:**

| File Type       | Min Cases | Examples                                      |
| --------------- | --------- | --------------------------------------------- |
| API client      | 3         | success, error, auth failure                  |
| Hook (query)    | 5         | loading, success, error, refetch, query key   |
| Hook (mutation) | 5         | loading, success, error, rollback, optimistic |
| Component       | 4         | render, conditional, events, accessibility    |
| Integration     | 3         | happy path, error scenario, edge case         |
| E2E             | 2         | happy path, error scenario                    |

### Step 4: Run Tests

```bash
# Unit tests (fast)
npm test tests/{module}/{feature}/unit

# Integration tests
npm test tests/{module}/{feature}/integration

# E2E tests (slow)
npx playwright test tests/{module}/{feature}/e2e

# All tests for a feature
npm test tests/{module}/{feature}
```

### Step 5: Update README

**Each feature folder MUST have README.md:**

````markdown
# {Feature Name} - Tests

## Test Coverage

- Unit: X tests
- Integration: Y tests
- E2E: Z tests

## Key Scenarios

- [Scenario 1]
- [Scenario 2]

## Run Tests

```bash
npm test tests/{module}/{feature}
```
````

---

## Naming Conventions

### File Names

```
✅ CORRECT:
tests/chat/messages/unit/useSendMessage.test.tsx
tests/chat/messages/integration/message-flow.test.tsx
tests/chat/messages/e2e/message-sending.spec.ts

❌ WRONG:
tests/chat/messages/unit/useSendMessageTest.tsx      # No "Test" suffix
tests/chat/messages/integration/messageFlow.test.tsx # camelCase
tests/chat/messages/e2e/message-sending.test.ts      # E2E uses .spec.ts
```

### Test Descriptions

```typescript
// ✅ CORRECT: Descriptive, action-oriented
describe("useSendMessage", () => {
  it("should send message with optimistic update", () => {});
  it("should rollback on API error", () => {});
  it("should not call invalidateQueries", () => {});
});

// ❌ WRONG: Vague, passive
describe("useSendMessage", () => {
  it("works", () => {});
  it("handles errors", () => {});
  it("test invalidate", () => {});
});
```

### data-testid Conventions

```typescript
// Pattern: {feature}-{element}-{action/identifier}

// ✅ CORRECT:
<Button data-testid="chat-send-button">Gửi</Button>
<Input data-testid="chat-message-input" />
<div data-testid="message-list">
  {messages.map(msg => (
    <div key={msg.id} data-testid={`message-item-${msg.id}`}>
      {msg.content}
    </div>
  ))}
</div>

// ❌ WRONG:
<Button data-testid="send">Gửi</Button>           # Too generic
<Input data-testid="chatMessageInput" />         # camelCase
<div data-testid="messages">                     # Not descriptive
```

---

## Testing Tools

### Core Dependencies

```json
{
  "devDependencies": {
    "vitest": "^4.0.16",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@playwright/test": "^1.40.0",
    "msw": "^2.0.0"
  }
}
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules/", "src/test/"],
    },
  },
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
});
```

---

## Best Practices

### 1. Test Independence

```typescript
// ✅ CORRECT: Each test is independent
describe('useSendMessage', () => {
  it('test 1', () => {
    const { result } = renderHook(() => useSendMessage(), { wrapper });
    // Test logic
  });

  it('test 2', () => {
    const { result } = renderHook(() => useSendMessage(), { wrapper });
    // Test logic (fresh hook)
  });
});

// ❌ WRONG: Tests depend on each other
describe('useSendMessage', () => {
  let result;

  it('test 1', () => {
    result = renderHook(() => useSendMessage(), { wrapper }).result;
  });

  it('test 2', () => {
    result.current.mutate(...); // Depends on test 1
  });
});
```

### 2. Use Test Wrappers

```typescript
// ✅ CORRECT: Consistent wrapper pattern
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// All tests use same wrapper
const { result } = renderHook(() => useSendMessage(), {
  wrapper: createWrapper(),
});
```

### 3. Mock External Dependencies

```typescript
// ✅ CORRECT: Mock API, SignalR, stores
vi.mock("@/api/messages.api", () => ({
  sendMessage: vi.fn(),
  getMessages: vi.fn(),
}));

vi.mock("@/providers/SignalRProvider", () => ({
  useChatHub: () => mockChatHub,
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));
```

### 4. Test What Matters

```typescript
// ✅ CORRECT: Test behavior, not implementation
it("should not refetch when sending message", () => {
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

  // Send message
  result.current.mutate({ content: "Test" });

  // Verify NO refetch happened
  expect(invalidateSpy).not.toHaveBeenCalled();
});

// ❌ WRONG: Testing internal details
it("should call setQueryData", () => {
  // This is too implementation-specific
  expect(internalFunction).toHaveBeenCalled();
});
```

### 5. Meaningful Assertions

```typescript
// ✅ CORRECT: Clear, specific assertions
expect(result.current.data?.pages[0].data).toHaveLength(1);
expect(result.current.data?.pages[0].data[0].content).toBe("Test");
expect(invalidateSpy).not.toHaveBeenCalled();

// ❌ WRONG: Vague assertions
expect(result.current.data).toBeTruthy();
expect(something).toBeDefined();
```

---

## Examples

### Example 1: Unit Test - API Client

```typescript
// tests/chat/messages/unit/messages.api.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendMessage, getMessages } from "@/api/messages.api";
import { axiosInstance } from "@/api/client";

vi.mock("@/api/client");

describe("messages.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendMessage", () => {
    it("should send POST request with correct payload", async () => {
      const mockResponse = { data: { id: "123", content: "Test" } };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const payload = { conversationId: "conv-1", content: "Test" };
      const result = await sendMessage(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith("/api/messages", payload);
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle network error", async () => {
      vi.mocked(axiosInstance.post).mockRejectedValue(
        new Error("Network error")
      );

      await expect(sendMessage({ content: "Test" })).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle 401 auth error", async () => {
      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: { status: 401 },
      });

      await expect(sendMessage({ content: "Test" })).rejects.toThrow();
    });
  });
});
```

### Example 2: Unit Test - Custom Hook

```typescript
// tests/chat/messages/unit/useMessages.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMessages } from "@/hooks/queries/useMessages";
import { getMessages } from "@/api/messages.api";

vi.mock("@/api/messages.api");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load messages successfully", async () => {
    const mockData = {
      data: [{ id: "1", content: "Message 1" }],
      hasMore: false,
      oldestMessageId: "1",
    };
    vi.mocked(getMessages).mockResolvedValue(mockData);

    const { result } = renderHook(() => useMessages("conv-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0]).toEqual(mockData);
  });

  it("should handle error state", async () => {
    vi.mocked(getMessages).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useMessages("conv-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it("should use correct query key", () => {
    const { result } = renderHook(() => useMessages("conv-1", "work-1"), {
      wrapper: createWrapper(),
    });

    // Query key should include both params
    expect(result.current.queryKey).toEqual([
      "messages",
      "list",
      "conv-1",
      "work-1",
    ]);
  });
});
```

### Example 3: Integration Test

```typescript
// tests/chat/messages/integration/message-send-flow.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChatMain from "@/features/portal/workspace/ChatMain";
import { sendMessage } from "@/api/messages.api";

vi.mock("@/api/messages.api");
vi.mock("@/providers/SignalRProvider", () => ({
  useChatHub: () => ({ on: vi.fn(), off: vi.fn() }),
}));

describe("Message Send Flow", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it("should complete send flow: input → optimistic → API → final", async () => {
    vi.mocked(sendMessage).mockResolvedValue({
      id: "msg-123",
      content: "Test message",
      createdAt: new Date().toISOString(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ChatMain groupId="conv-1" />
      </QueryClientProvider>
    );

    const input = screen.getByTestId("chat-message-input");
    const sendBtn = screen.getByTestId("chat-send-button");

    // Type message
    fireEvent.change(input, { target: { value: "Test message" } });
    expect(input.value).toBe("Test message");

    // Send
    fireEvent.click(sendBtn);

    // Message appears optimistically (instant)
    await waitFor(() => {
      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    // API called
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Test message" })
    );

    // Input cleared
    expect(input.value).toBe("");
  });
});
```

### Example 4: E2E Test

```typescript
// tests/chat/messages/e2e/message-sending.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Message Sending", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('[data-testid="login-email-input"]', "test@example.com");
    await page.fill('[data-testid="login-password-input"]', "password123");
    await page.click('[data-testid="login-submit-button"]');
    await page.waitForURL("/portal");

    // Navigate to chat
    await page.click('[data-testid="conversation-item-conv-123"]');
    await page.waitForSelector('[data-testid="chat-main-container"]');
  });

  test("should send message with only ONE API call", async ({ page }) => {
    const apiCalls: string[] = [];

    page.on("request", (request) => {
      if (request.url().includes("/api/messages")) {
        apiCalls.push(request.method());
      }
    });

    // Wait for initial load
    await page.waitForSelector('[data-testid="message-list"]');
    apiCalls.length = 0; // Clear

    // Send message
    await page.fill('[data-testid="chat-message-input"]', "E2E test");
    await page.click('[data-testid="chat-send-button"]');

    // Message appears instantly
    await expect(page.locator("text=E2E test")).toBeVisible();

    // Wait for API
    await page.waitForTimeout(2000);

    // Only 1 POST, no GET refetch
    const postCalls = apiCalls.filter((m) => m === "POST");
    const getCalls = apiCalls.filter((m) => m === "GET");

    expect(postCalls).toHaveLength(1);
    expect(getCalls).toHaveLength(0);
  });
});
```

---

## Common Patterns

### Pattern 1: Query Client Wrapper

```typescript
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
```

### Pattern 2: Spy on Query Client Methods

```typescript
const queryClient = new QueryClient();
const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

// Run test logic...

expect(invalidateSpy).not.toHaveBeenCalled();
expect(setQueryDataSpy).toHaveBeenCalledWith(
  expect.arrayContaining(["messages"]),
  expect.any(Function)
);
```

### Pattern 3: Mock SignalR Hub

```typescript
const mockChatHub = {
  on: vi.fn(),
  off: vi.fn(),
  invoke: vi.fn(),
};

vi.mock("@/providers/SignalRProvider", () => ({
  useChatHub: () => mockChatHub,
}));

// Simulate SignalR event
const messageHandler = mockChatHub.on.mock.calls.find(
  ([event]) => event === "MESSAGE_SENT"
)?.[1];

if (messageHandler) {
  messageHandler(mockMessage);
}
```

### Pattern 4: Mock Auth Store

```typescript
const mockUser = { id: "user-1", name: "Test User" };

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    user: mockUser,
    accessToken: "mock-token",
  })),
}));
```

### Pattern 5: API Call Monitoring (E2E)

```typescript
const apiCalls: { method: string; url: string }[] = [];

page.on("request", (request) => {
  const url = request.url();
  if (url.includes("/api/")) {
    apiCalls.push({
      method: request.method(),
      url: url,
    });
  }
});

// Clear after initial load
await page.waitForSelector('[data-testid="message-list"]');
apiCalls.length = 0;

// Perform action...

// Assert
const postCalls = apiCalls.filter((c) => c.method === "POST");
expect(postCalls).toHaveLength(1);
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - run: npm test -- --run
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run preview &
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### NPM Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/**/unit",
    "test:integration": "vitest run tests/**/integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest"
  }
}
```

---

## Checklist: Adding New Feature

Khi thêm feature mới, đảm bảo:

- [ ] Tạo folder `tests/{module}/{feature}/`
- [ ] Tạo `README.md` trong feature folder
- [ ] Tạo unit tests cho mọi file code mới
  - [ ] API clients
  - [ ] Hooks
  - [ ] Components
  - [ ] Utilities
- [ ] Tạo integration test cho main flow
- [ ] Tạo E2E test nếu critical user journey
- [ ] Thêm `data-testid` vào elements quan trọng
- [ ] Run tests và verify pass
- [ ] Update docs/testing/ nếu có pattern mới

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [TanStack Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)

---

**Next:** [Unit Testing Guide](./unit-testing.md) | [Integration Testing Guide](./integration-testing.md) | [E2E Testing Guide](./e2e-testing.md)

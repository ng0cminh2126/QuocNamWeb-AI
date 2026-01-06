# Unit Testing Guide

> **Testing Type:** Unit Tests  
> **Framework:** Vitest + React Testing Library  
> **Purpose:** Test isolated functions, hooks, components

---

## Overview

Unit tests focus on testing individual units of code in isolation. Mock all external dependencies để đảm bảo test chỉ verify logic của unit đang test.

### Characteristics

✅ **Fast** - Execution time < 100ms per test  
✅ **Isolated** - No external dependencies  
✅ **Predictable** - Same input = same output  
✅ **Focused** - Test ONE thing at a time

---

## What to Unit Test

### 1. API Client Functions

**Location:** `tests/{module}/{feature}/unit/{api-client}.test.ts`

**Test cases:**

- ✅ Success response
- ✅ Request params/body correct
- ✅ Error handling (network, 4xx, 5xx)
- ✅ Auth token included

**Example:**

```typescript
// tests/chat/messages/unit/messages.api.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendMessage } from "@/api/messages.api";
import { axiosInstance } from "@/api/client";

vi.mock("@/api/client");

describe("sendMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send POST request with correct payload", async () => {
    const mockResponse = { data: { id: "123", content: "Test" } };
    vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

    const payload = { conversationId: "conv-1", content: "Test" };
    const result = await sendMessage(payload);

    expect(axiosInstance.post).toHaveBeenCalledWith("/api/messages", payload);
    expect(result).toEqual(mockResponse.data);
  });

  it("should handle network error", async () => {
    vi.mocked(axiosInstance.post).mockRejectedValue(new Error("Network error"));

    await expect(sendMessage({ content: "Test" })).rejects.toThrow(
      "Network error"
    );
  });

  it("should handle 401 unauthorized", async () => {
    vi.mocked(axiosInstance.post).mockRejectedValue({
      response: { status: 401, data: { message: "Unauthorized" } },
    });

    await expect(sendMessage({ content: "Test" })).rejects.toThrow();
  });
});
```

### 2. Custom Hooks (useQuery)

**Location:** `tests/{module}/{feature}/unit/{hook}.test.tsx`

**Test cases:**

- ✅ Loading state
- ✅ Success state
- ✅ Error state
- ✅ Query key correct
- ✅ Refetch works

**Example:**

```typescript
// tests/chat/messages/unit/useMessages.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMessages } from "@/hooks/queries/useMessages";
import { getMessages } from "@/api/messages.api";
import type { ReactNode } from "react";

vi.mock("@/api/messages.api");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start in loading state", () => {
    vi.mocked(getMessages).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useMessages("conv-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
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

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0]).toEqual(mockData);
  });

  it("should handle error", async () => {
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

    // Query key format: ['messages', 'list', conversationId, workTypeId]
    expect(result.current.queryKey).toEqual([
      "messages",
      "list",
      "conv-1",
      "work-1",
    ]);
  });

  it("should refetch when called", async () => {
    const mockData = { data: [], hasMore: false, oldestMessageId: null };
    vi.mocked(getMessages).mockResolvedValue(mockData);

    const { result } = renderHook(() => useMessages("conv-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    vi.mocked(getMessages).mockClear();

    // Trigger refetch
    await result.current.refetch();

    expect(getMessages).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Custom Hooks (useMutation)

**Location:** `tests/{module}/{feature}/unit/{hook}.test.tsx`

**Test cases:**

- ✅ Loading state
- ✅ Success callback
- ✅ Error rollback
- ✅ Optimistic update
- ✅ NO unnecessary refetch

**Example:**

```typescript
// tests/chat/messages/unit/useSendMessage.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSendMessage } from "@/hooks/mutations/useSendMessage";
import { sendMessage } from "@/api/messages.api";
import { useAuthStore } from "@/stores/authStore";
import type { ReactNode } from "react";

vi.mock("@/api/messages.api");
vi.mock("@/stores/authStore");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSendMessage", () => {
  const mockUser = {
    id: "user-1",
    name: "Test User",
    avatar: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      accessToken: "mock-token",
    } as any);
  });

  it("should send message successfully", async () => {
    const mockResponse = {
      id: "msg-123",
      content: "Test message",
      createdAt: new Date().toISOString(),
    };
    vi.mocked(sendMessage).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        conversationId: "conv-1",
        content: "Test message",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Test message" })
    );
  });

  it("should create optimistic message", async () => {
    vi.mocked(sendMessage).mockImplementation(() => new Promise(() => {}));

    const queryClient = new QueryClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useSendMessage(), { wrapper });

    act(() => {
      result.current.mutate({
        conversationId: "conv-1",
        content: "Optimistic",
      });
    });

    await waitFor(() => {
      expect(setQueryDataSpy).toHaveBeenCalled();
    });

    // Verify optimistic message added
    const calls = setQueryDataSpy.mock.calls;
    const optimisticCall = calls.find((call) =>
      JSON.stringify(call[0]).includes("messages")
    );
    expect(optimisticCall).toBeDefined();
  });

  it("should NOT call invalidateQueries on success", async () => {
    const mockResponse = {
      id: "msg-123",
      content: "Test",
      createdAt: new Date().toISOString(),
    };
    vi.mocked(sendMessage).mockResolvedValue(mockResponse);

    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useSendMessage(), { wrapper });

    act(() => {
      result.current.mutate({
        conversationId: "conv-1",
        content: "Test",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // ✅ CRITICAL: No refetch should happen
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("should rollback on error", async () => {
    vi.mocked(sendMessage).mockRejectedValue(new Error("Network error"));

    const queryClient = new QueryClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useSendMessage(), { wrapper });

    act(() => {
      result.current.mutate({
        conversationId: "conv-1",
        content: "Test",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Rollback called
    const rollbackCalls = setQueryDataSpy.mock.calls.filter((call) =>
      JSON.stringify(call).includes("rollback")
    );
    expect(rollbackCalls.length).toBeGreaterThan(0);
  });
});
```

### 4. React Components

**Location:** `tests/{module}/{feature}/unit/{component}.test.tsx`

**Test cases:**

- ✅ Renders correctly
- ✅ Conditional rendering
- ✅ User events
- ✅ Accessibility

**Example:**

```typescript
// tests/chat/messages/unit/MessageItem.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MessageItem from "@/features/portal/workspace/MessageItem";

describe("MessageItem", () => {
  const mockMessage = {
    id: "msg-1",
    content: "Test message",
    userId: "user-1",
    userName: "Test User",
    createdAt: new Date().toISOString(),
    files: [],
  };

  it("should render message content", () => {
    render(<MessageItem message={mockMessage} />);

    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("should show file attachments when present", () => {
    const messageWithFiles = {
      ...mockMessage,
      files: [{ id: "file-1", name: "test.pdf", url: "/files/test.pdf" }],
    };

    render(<MessageItem message={messageWithFiles} />);

    expect(screen.getByText("test.pdf")).toBeInTheDocument();
  });

  it("should call onReply when reply button clicked", () => {
    const onReply = vi.fn();

    render(<MessageItem message={mockMessage} onReply={onReply} />);

    const replyBtn = screen.getByTestId("message-reply-button");
    fireEvent.click(replyBtn);

    expect(onReply).toHaveBeenCalledWith(mockMessage);
  });

  it("should have accessible label", () => {
    render(<MessageItem message={mockMessage} />);

    const messageEl = screen.getByRole("article");
    expect(messageEl).toHaveAccessibleName(/Test User/);
  });
});
```

### 5. Utility Functions

**Location:** `tests/{module}/{feature}/unit/{utility}.test.ts`

**Test cases:**

- ✅ Happy path
- ✅ Edge cases
- ✅ Error cases

**Example:**

```typescript
// tests/chat/messages/unit/formatMessage.test.ts
import { describe, it, expect } from "vitest";
import { formatMessage, truncateMessage } from "@/utils/messages";

describe("formatMessage", () => {
  it("should format plain text message", () => {
    const result = formatMessage("Hello world");
    expect(result).toBe("Hello world");
  });

  it("should escape HTML tags", () => {
    const result = formatMessage('<script>alert("xss")</script>');
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("should convert URLs to links", () => {
    const result = formatMessage("Check https://example.com");
    expect(result).toContain('<a href="https://example.com"');
  });
});

describe("truncateMessage", () => {
  it("should truncate long messages", () => {
    const longMessage = "a".repeat(200);
    const result = truncateMessage(longMessage, 100);

    expect(result.length).toBeLessThanOrEqual(103); // 100 + '...'
    expect(result).toContain("...");
  });

  it("should not truncate short messages", () => {
    const shortMessage = "Short";
    const result = truncateMessage(shortMessage, 100);

    expect(result).toBe("Short");
  });

  it("should handle empty string", () => {
    const result = truncateMessage("", 100);
    expect(result).toBe("");
  });
});
```

---

## Common Patterns

### Pattern 1: createWrapper Factory

**Use for:** Hooks that need QueryClient, Router, etc.

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

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

// Usage
const { result } = renderHook(() => useMessages("conv-1"), {
  wrapper: createWrapper(),
});
```

### Pattern 2: Spying on QueryClient Methods

**Use for:** Verify cache updates, NOT refetch

```typescript
const queryClient = new QueryClient();
const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

// Run test...

// Verify NO refetch
expect(invalidateSpy).not.toHaveBeenCalled();

// Verify cache update
expect(setQueryDataSpy).toHaveBeenCalledWith(
  expect.arrayContaining(["messages"]),
  expect.any(Function)
);
```

### Pattern 3: Mock API Functions

**Use for:** Isolate from API layer

```typescript
import { vi } from "vitest";
import { sendMessage } from "@/api/messages.api";

vi.mock("@/api/messages.api", () => ({
  sendMessage: vi.fn(),
  getMessages: vi.fn(),
  deleteMessage: vi.fn(),
}));

// In test
vi.mocked(sendMessage).mockResolvedValue({
  id: "msg-123",
  content: "Test",
  createdAt: new Date().toISOString(),
});
```

### Pattern 4: Mock Zustand Stores

**Use for:** Isolate from global state

```typescript
import { vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

// In test
vi.mocked(useAuthStore).mockReturnValue({
  user: { id: "user-1", name: "Test User" },
  accessToken: "mock-token",
} as any);
```

### Pattern 5: Mock SignalR

**Use for:** Isolate from WebSocket

```typescript
import { vi } from "vitest";

const mockChatHub = {
  on: vi.fn(),
  off: vi.fn(),
  invoke: vi.fn(),
};

vi.mock("@/providers/SignalRProvider", () => ({
  useChatHub: () => mockChatHub,
}));

// Simulate event
const messageHandler = mockChatHub.on.mock.calls.find(
  ([event]) => event === "MESSAGE_SENT"
)?.[1];

if (messageHandler) {
  messageHandler({ id: "1", content: "New message" });
}
```

---

## Best Practices

### ✅ DO

- **Test behavior, not implementation**

  ```typescript
  // ✅ Good
  expect(result.current.isSuccess).toBe(true);
  expect(invalidateSpy).not.toHaveBeenCalled();

  // ❌ Bad
  expect(internalVariable).toBe(true);
  ```

- **Use descriptive test names**

  ```typescript
  // ✅ Good
  it("should not call invalidateQueries after successful send", () => {});

  // ❌ Bad
  it("test invalidate", () => {});
  ```

- **Clear mocks between tests**

  ```typescript
  beforeEach(() => {
    vi.clearAllMocks();
  });
  ```

- **Test edge cases**
  ```typescript
  it("should handle empty message", () => {});
  it("should handle very long message (>10000 chars)", () => {});
  it("should handle special characters", () => {});
  ```

### ❌ DON'T

- **Don't test implementation details**

  ```typescript
  // ❌ Bad
  expect(component.state.internalCounter).toBe(1);
  ```

- **Don't skip cleanup**

  ```typescript
  // ❌ Bad - no cleanup
  it("test", () => {
    mockFn.mockReturnValue("value");
    // Test...
    // No cleanup - affects next test
  });
  ```

- **Don't make tests dependent**

  ```typescript
  // ❌ Bad
  let sharedResult;

  it('test 1', () => {
    sharedResult = doSomething();
  });

  it('test 2', () => {
    // Depends on test 1
    expect(sharedResult).toBe(...);
  });
  ```

- **Don't use real timers**

  ```typescript
  // ❌ Bad
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // ✅ Good
  vi.useFakeTimers();
  vi.advanceTimersByTime(1000);
  vi.useRealTimers();
  ```

---

## Running Unit Tests

```bash
# All unit tests
npm test tests/**/unit

# Specific module
npm test tests/chat/**/unit

# Specific file
npm test tests/chat/messages/unit/useSendMessage.test.tsx

# Watch mode
npm test tests/chat/messages/unit -- --watch

# Coverage
npm test tests/**/unit -- --coverage
```

---

## Checklist

Khi viết unit test, đảm bảo:

- [ ] File đặt trong `tests/{module}/{feature}/unit/`
- [ ] Tên file: `{name}.test.ts` hoặc `{name}.test.tsx`
- [ ] Mock ALL external dependencies
- [ ] Test loading, success, error states
- [ ] Test edge cases
- [ ] Clear mocks in `beforeEach`
- [ ] Use `createWrapper()` for hooks
- [ ] Descriptive test names
- [ ] No hardcoded timeouts (use `waitFor`)
- [ ] All tests pass

---

**Next:** [Integration Testing Guide](./integration-testing.md) | [E2E Testing Guide](./e2e-testing.md)

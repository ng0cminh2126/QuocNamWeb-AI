# Integration Testing Guide

> **Testing Type:** Integration Tests  
> **Framework:** Vitest + React Testing Library  
> **Purpose:** Test interactions between multiple components/hooks

---

## Overview

Integration tests verify that multiple units work together correctly. Mock only external APIs/services, but use real state management and component interactions.

### Characteristics

✅ **Real interactions** - Components communicate naturally  
✅ **Real state** - Actual React Query, Zustand stores  
✅ **Mock externals** - APIs, SignalR, localStorage  
⏱️ **Medium speed** - 200-500ms per test

---

## What to Integration Test

### 1. Complete Data Flows

**Example:** Send message flow

```
User Input → Hook → Optimistic Update → API Call → Cache Update → UI Update
```

**Test file:** `tests/chat/messages/integration/message-send-flow.test.tsx`

```typescript
/**
 * Integration Test: Message Send Flow
 *
 * Tests complete flow:
 * 1. User types message
 * 2. Optimistic update shows message instantly
 * 3. API call is made
 * 4. Real message replaces optimistic
 * 5. NO refetch happens
 *
 * @module tests/chat/messages/integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChatMain from "@/features/portal/workspace/ChatMain";
import { sendMessage, getMessages } from "@/api/messages.api";
import { useAuthStore } from "@/stores/authStore";

// Mock external APIs only
vi.mock("@/api/messages.api");
vi.mock("@/stores/authStore");

// Mock SignalR
const mockChatHub = {
  on: vi.fn(),
  off: vi.fn(),
};

vi.mock("@/providers/SignalRProvider", () => ({
  useChatHub: () => mockChatHub,
}));

describe("Message Send Flow Integration", () => {
  let queryClient: QueryClient;
  const mockUser = {
    id: "user-1",
    name: "Test User",
    avatar: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0 },
        mutations: { retry: false },
      },
    });

    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      accessToken: "mock-token",
    } as any);

    // Mock initial messages load
    vi.mocked(getMessages).mockResolvedValue({
      data: [],
      hasMore: false,
      oldestMessageId: null,
    });
  });

  it("should complete full send flow: input → optimistic → API → final", async () => {
    const mockResponse = {
      id: "msg-real-123",
      conversationId: "conv-1",
      userId: "user-1",
      userName: "Test User",
      content: "Integration test message",
      contentType: "0",
      createdAt: new Date().toISOString(),
      files: [],
      parentMessageId: null,
    };

    vi.mocked(sendMessage).mockResolvedValue(mockResponse);

    render(
      <QueryClientProvider client={queryClient}>
        <ChatMain groupId="conv-1" />
      </QueryClientProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("chat-main-container")).toBeInTheDocument();
    });

    const input = screen.getByTestId("chat-message-input");
    const sendBtn = screen.getByTestId("chat-send-button");

    // Type message
    fireEvent.change(input, { target: { value: "Integration test message" } });
    expect(input).toHaveValue("Integration test message");

    // Clear API call log
    vi.mocked(sendMessage).mockClear();
    vi.mocked(getMessages).mockClear();

    // Send message
    fireEvent.click(sendBtn);

    // Message should appear immediately (optimistic)
    await waitFor(() => {
      expect(screen.getByText("Integration test message")).toBeInTheDocument();
    });

    // Wait for API call
    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledTimes(1);
    });

    // Verify API payload
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "conv-1",
        content: "Integration test message",
      })
    );

    // Input should be cleared
    expect(input).toHaveValue("");

    // Message should still be visible (replaced optimistic with real)
    expect(screen.getByText("Integration test message")).toBeInTheDocument();

    // ✅ CRITICAL: NO GET refetch should happen
    expect(getMessages).not.toHaveBeenCalled();
  });

  it("should handle API error with rollback", async () => {
    vi.mocked(sendMessage).mockRejectedValue(new Error("Network error"));

    render(
      <QueryClientProvider client={queryClient}>
        <ChatMain groupId="conv-1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("chat-main-container")).toBeInTheDocument();
    });

    const input = screen.getByTestId("chat-message-input");
    const sendBtn = screen.getByTestId("chat-send-button");

    fireEvent.change(input, { target: { value: "Failed message" } });
    fireEvent.click(sendBtn);

    // Message appears optimistically
    await waitFor(() => {
      expect(screen.getByText("Failed message")).toBeInTheDocument();
    });

    // Wait for error
    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
    });

    // Message should be removed (rollback)
    await waitFor(() => {
      expect(screen.queryByText("Failed message")).not.toBeInTheDocument();
    });

    // Error toast should appear
    expect(screen.getByTestId("error-toast")).toBeInTheDocument();
  });

  it("should handle rapid message sending", async () => {
    const apiCallLog: string[] = [];

    vi.mocked(sendMessage).mockImplementation(async (payload) => {
      apiCallLog.push("POST");
      return {
        id: `msg-${Date.now()}`,
        ...payload,
        userId: "user-1",
        userName: "Test User",
        contentType: "0",
        createdAt: new Date().toISOString(),
        files: [],
        parentMessageId: null,
      };
    });

    vi.mocked(getMessages).mockImplementation(async () => {
      apiCallLog.push("GET");
      return { data: [], hasMore: false, oldestMessageId: null };
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ChatMain groupId="conv-1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("chat-main-container")).toBeInTheDocument();
    });

    const input = screen.getByTestId("chat-message-input");
    const sendBtn = screen.getByTestId("chat-send-button");

    // Clear initial load calls
    apiCallLog.length = 0;

    // Send 3 messages rapidly
    for (let i = 1; i <= 3; i++) {
      fireEvent.change(input, { target: { value: `Message ${i}` } });
      fireEvent.click(sendBtn);
      await waitFor(() => {
        expect(screen.getByText(`Message ${i}`)).toBeInTheDocument();
      });
    }

    // Wait for all API calls to complete
    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledTimes(3);
    });

    // All 3 messages visible
    expect(screen.getByText("Message 1")).toBeInTheDocument();
    expect(screen.getByText("Message 2")).toBeInTheDocument();
    expect(screen.getByText("Message 3")).toBeInTheDocument();

    // ✅ CRITICAL: 3 POST calls, 0 GET calls
    const postCalls = apiCallLog.filter((method) => method === "POST");
    const getCalls = apiCallLog.filter((method) => method === "GET");

    expect(postCalls).toHaveLength(3);
    expect(getCalls).toHaveLength(0);
  });

  it("should receive SignalR message without API refetch", async () => {
    vi.mocked(getMessages).mockResolvedValue({
      data: [],
      hasMore: false,
      oldestMessageId: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ChatMain groupId="conv-1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("chat-main-container")).toBeInTheDocument();
    });

    // Clear API call log
    vi.mocked(getMessages).mockClear();

    // Simulate SignalR MESSAGE_SENT event
    const messageHandler = mockChatHub.on.mock.calls.find(
      ([event]) => event === "MESSAGE_SENT"
    )?.[1];

    expect(messageHandler).toBeDefined();

    const signalrMessage = {
      id: "msg-signalr-1",
      conversationId: "conv-1",
      userId: "user-other",
      userName: "Other User",
      content: "SignalR realtime message",
      contentType: "0",
      createdAt: new Date().toISOString(),
      files: [],
      parentMessageId: null,
    };

    // Trigger SignalR event
    messageHandler!(signalrMessage);

    // Message should appear
    await waitFor(() => {
      expect(screen.getByText("SignalR realtime message")).toBeInTheDocument();
    });

    // ✅ CRITICAL: NO GET refetch
    expect(getMessages).not.toHaveBeenCalled();
  });
});
```

### 2. Multi-Component Interactions

**Example:** Task creation with file upload

**Test file:** `tests/task/create/integration/task-creation-flow.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TaskCreationDialog from "@/features/portal/task/TaskCreationDialog";
import { createTask, uploadFile } from "@/api/tasks.api";

vi.mock("@/api/tasks.api");

describe("Task Creation Flow Integration", () => {
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

  it("should create task with file attachments", async () => {
    const mockFile = new File(["content"], "test.pdf", {
      type: "application/pdf",
    });

    vi.mocked(uploadFile).mockResolvedValue({
      id: "file-1",
      name: "test.pdf",
      url: "/files/test.pdf",
    });

    vi.mocked(createTask).mockResolvedValue({
      id: "task-1",
      title: "New Task",
      files: [{ id: "file-1", name: "test.pdf", url: "/files/test.pdf" }],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TaskCreationDialog open={true} onClose={() => {}} />
      </QueryClientProvider>
    );

    // Fill form
    const titleInput = screen.getByTestId("task-title-input");
    fireEvent.change(titleInput, { target: { value: "New Task" } });

    // Upload file
    const fileInput = screen.getByTestId("task-file-input");
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Wait for upload
    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalled();
    });

    // File should appear in list
    expect(screen.getByText("test.pdf")).toBeInTheDocument();

    // Submit
    const submitBtn = screen.getByTestId("task-create-button");
    fireEvent.click(submitBtn);

    // Wait for task creation
    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
          fileIds: ["file-1"],
        })
      );
    });
  });
});
```

### 3. State Management Flows

**Example:** Auth flow with token refresh

**Test file:** `tests/auth/login/integration/auth-flow.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "@/pages/LoginPage";
import { login } from "@/api/auth.api";
import { useAuthStore } from "@/stores/authStore";

vi.mock("@/api/auth.api");

describe("Auth Flow Integration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset store
    useAuthStore.setState({
      user: null,
      accessToken: null,
    });
  });

  it("should login and update store", async () => {
    const mockResponse = {
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
      },
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    };

    vi.mocked(login).mockResolvedValue(mockResponse);

    render(
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>
    );

    const emailInput = screen.getByTestId("login-email-input");
    const passwordInput = screen.getByTestId("login-password-input");
    const submitBtn = screen.getByTestId("login-submit-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    // Store should be updated
    const authState = useAuthStore.getState();
    expect(authState.user).toEqual(mockResponse.user);
    expect(authState.accessToken).toBe("mock-access-token");

    // Should redirect to portal
    await waitFor(() => {
      expect(window.location.pathname).toBe("/portal");
    });
  });
});
```

---

## Best Practices

### ✅ DO

**1. Test real interactions between units**

```typescript
// ✅ Good - Tests real interaction between hook and component
it("should update UI when mutation succeeds", async () => {
  render(<ChatMain groupId="conv-1" />);

  fireEvent.click(screen.getByTestId("chat-send-button"));

  await waitFor(() => {
    expect(screen.getByText("Message sent")).toBeInTheDocument();
  });
});
```

**2. Mock only external boundaries**

```typescript
// ✅ Good - Mock API, use real React Query
vi.mock("@/api/messages.api");

const queryClient = new QueryClient(); // Real QueryClient

render(
  <QueryClientProvider client={queryClient}>
    <ChatMain />
  </QueryClientProvider>
);
```

**3. Test complete flows end-to-end**

```typescript
it("should complete send → optimistic → API → cache → UI flow", async () => {
  // 1. User input
  fireEvent.change(input, { target: { value: "Test" } });

  // 2. Click send
  fireEvent.click(sendBtn);

  // 3. Optimistic update
  expect(screen.getByText("Test")).toBeInTheDocument();

  // 4. API called
  await waitFor(() => expect(sendMessage).toHaveBeenCalled());

  // 5. Cache updated (no refetch)
  expect(getMessages).not.toHaveBeenCalled();

  // 6. UI updated
  expect(screen.getByText("Test")).toBeInTheDocument();
});
```

**4. Verify NO unnecessary API calls**

```typescript
it("should not refetch after mutation", async () => {
  const apiCallLog: string[] = [];

  vi.mocked(sendMessage).mockImplementation(() => {
    apiCallLog.push("POST");
    return Promise.resolve(mockResponse);
  });

  vi.mocked(getMessages).mockImplementation(() => {
    apiCallLog.push("GET");
    return Promise.resolve(mockData);
  });

  // Perform action
  fireEvent.click(sendBtn);

  await waitFor(() => {
    expect(sendMessage).toHaveBeenCalled();
  });

  // ✅ CRITICAL: Only POST, no GET
  expect(apiCallLog.filter((m) => m === "POST")).toHaveLength(1);
  expect(apiCallLog.filter((m) => m === "GET")).toHaveLength(0);
});
```

### ❌ DON'T

**1. Don't mock everything**

```typescript
// ❌ Bad - Mocking too much, not really integration test
vi.mock("@/hooks/queries/useMessages");
vi.mock("@/hooks/mutations/useSendMessage");
vi.mock("@tanstack/react-query");

// Not testing real interactions
```

**2. Don't test units in isolation here**

```typescript
// ❌ Bad - This is unit test, not integration
it("should call sendMessage API", () => {
  const { result } = renderHook(() => useSendMessage());

  result.current.mutate({ content: "Test" });

  expect(sendMessage).toHaveBeenCalled();
});

// ✅ Good - Test component + hook interaction
it("should send message when button clicked", () => {
  render(<ChatMain />);

  fireEvent.click(screen.getByTestId("chat-send-button"));

  await waitFor(() => {
    expect(sendMessage).toHaveBeenCalled();
    expect(screen.getByText("Sent")).toBeInTheDocument();
  });
});
```

**3. Don't ignore timing issues**

```typescript
// ❌ Bad - No wait, race condition
fireEvent.click(sendBtn);
expect(screen.getByText("Success")).toBeInTheDocument(); // Might fail

// ✅ Good - Use waitFor
fireEvent.click(sendBtn);
await waitFor(() => {
  expect(screen.getByText("Success")).toBeInTheDocument();
});
```

---

## Common Patterns

### Pattern 1: API Call Logging

```typescript
const apiCallLog: Array<{ method: string; endpoint: string }> = [];

vi.mocked(sendMessage).mockImplementation((payload) => {
  apiCallLog.push({ method: "POST", endpoint: "/messages" });
  return Promise.resolve(mockResponse);
});

vi.mocked(getMessages).mockImplementation((params) => {
  apiCallLog.push({ method: "GET", endpoint: "/messages" });
  return Promise.resolve(mockData);
});

// Clear after initial load
await waitFor(() => screen.getByTestId("chat-main-container"));
apiCallLog.length = 0;

// Perform action
fireEvent.click(sendBtn);

await waitFor(() => expect(sendMessage).toHaveBeenCalled());

// Assert call patterns
expect(apiCallLog.filter((c) => c.method === "POST")).toHaveLength(1);
expect(apiCallLog.filter((c) => c.method === "GET")).toHaveLength(0);
```

### Pattern 2: Multi-Step Wizard

```typescript
it("should complete multi-step form", async () => {
  render(<TaskCreationWizard />);

  // Step 1: Basic info
  fireEvent.change(screen.getByTestId("task-title-input"), {
    target: { value: "Task 1" },
  });
  fireEvent.click(screen.getByTestId("next-button"));

  // Step 2: Assignees
  await waitFor(() => {
    expect(screen.getByTestId("assignee-select")).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText("John Doe"));
  fireEvent.click(screen.getByTestId("next-button"));

  // Step 3: Review & Submit
  await waitFor(() => {
    expect(screen.getByTestId("review-step")).toBeInTheDocument();
  });
  expect(screen.getByText("Task 1")).toBeInTheDocument();
  expect(screen.getByText("John Doe")).toBeInTheDocument();

  fireEvent.click(screen.getByTestId("submit-button"));

  await waitFor(() => {
    expect(createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Task 1",
        assignees: ["john-doe-id"],
      })
    );
  });
});
```

### Pattern 3: Real-time Updates

```typescript
it("should update UI when receiving SignalR message", async () => {
  const mockChatHub = {
    on: vi.fn(),
    off: vi.fn(),
  };

  vi.mock("@/providers/SignalRProvider", () => ({
    useChatHub: () => mockChatHub,
  }));

  render(
    <QueryClientProvider client={queryClient}>
      <ChatMain groupId="conv-1" />
    </QueryClientProvider>
  );

  // Wait for component mount
  await waitFor(() => {
    expect(mockChatHub.on).toHaveBeenCalledWith(
      "MESSAGE_SENT",
      expect.any(Function)
    );
  });

  // Get event handler
  const messageHandler = mockChatHub.on.mock.calls.find(
    ([event]) => event === "MESSAGE_SENT"
  )?.[1];

  // Trigger event
  messageHandler!({
    id: "msg-1",
    content: "New message from SignalR",
    userId: "user-other",
    userName: "Other User",
  });

  // UI should update
  await waitFor(() => {
    expect(screen.getByText("New message from SignalR")).toBeInTheDocument();
  });

  // No API refetch
  expect(getMessages).not.toHaveBeenCalled();
});
```

---

## Running Integration Tests

```bash
# All integration tests
npm test tests/**/integration

# Specific module
npm test tests/chat/**/integration

# Specific file
npm test tests/chat/messages/integration/message-send-flow.test.tsx

# With coverage
npm test tests/**/integration -- --coverage

# Watch mode
npm test tests/chat/messages/integration -- --watch
```

---

## Checklist

Khi viết integration test:

- [ ] File đặt trong `tests/{module}/{feature}/integration/`
- [ ] Tên file: `{flow-name}.test.tsx`
- [ ] Mock ONLY external APIs/services
- [ ] Use real React Query, Zustand stores
- [ ] Test complete flows (input → action → result)
- [ ] Verify NO unnecessary API calls
- [ ] Use `waitFor` for async operations
- [ ] Clear mocks in `beforeEach`
- [ ] Test error scenarios
- [ ] Test edge cases (rapid actions, race conditions)

---

**Next:** [E2E Testing Guide](./e2e-testing.md) | [Back to Testing Overview](./README.md)

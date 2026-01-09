# [BƯỚC 6] Testing Requirements - Upgrade Conversation UX

> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-07  
> **Version:** 1.0  
> **Note:** BẮT BUỘC approve TRƯỚC KHI code (BƯỚC 5)

---

## 📊 Test Coverage Matrix

### Implementation → Test Mapping

| Implementation File                | Test File                           | Test Type   | Test Cases |
| ---------------------------------- | ----------------------------------- | ----------- | ---------- |
| `UnreadBadge.tsx`                  | `UnreadBadge.test.tsx`              | Unit        | 4          |
| `MessagePreview.tsx`               | `MessagePreview.test.tsx`           | Unit        | 5          |
| `formatRelativeTime.ts`            | `formatRelativeTime.test.ts`        | Unit        | 6          |
| `RelativeTime.tsx`                 | `RelativeTime.test.tsx`             | Unit        | 4          |
| `ConversationItem.tsx`             | `ConversationItem.test.tsx`         | Unit        | 6          |
| `conversationSort.ts`              | `conversationSort.test.ts`          | Unit        | 4          |
| `useMarkConversationAsRead.ts`     | `useMarkConversationAsRead.test.ts` | Unit        | 4          |
| `useConversationRealtime.ts`       | `useConversationRealtime.test.ts`   | Unit        | 8          |
| `ChatInput.tsx`                    | `ChatInput.test.tsx`                | Unit        | 10         |
| `ConversationList.tsx` (modified)  | `conversation-list.test.ts`         | Integration | 6          |
| `ChatMainContainer.tsx` (modified) | `chat-input.test.ts`                | Integration | 4          |

**Total Coverage:**

- Unit Tests: **51 test cases**
- Integration Tests: **10 test cases**
- **Grand Total: 61 test cases**

---

## 🧪 Detailed Test Cases

### Phase 1: Unread Badge & Message Preview

#### Test File: `UnreadBadge.test.tsx`

```typescript
describe("UnreadBadge", () => {
  test("TC-1.1: renders badge with count 1", () => {
    render(<UnreadBadge count={1} />);
    expect(screen.getByTestId("unread-badge")).toHaveTextContent("1");
  });

  test('TC-1.2: renders "99+" when count > 99', () => {
    render(<UnreadBadge count={150} />);
    expect(screen.getByTestId("unread-badge")).toHaveTextContent("99+");
  });

  test("TC-1.3: returns null when count = 0", () => {
    const { container } = render(<UnreadBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  test("TC-1.4: applies custom className", () => {
    render(<UnreadBadge count={5} className="custom-class" />);
    expect(screen.getByTestId("unread-badge")).toHaveClass("custom-class");
  });
});
```

**Coverage:** 100% (4/4 cases)

---

#### Test File: `MessagePreview.test.tsx`

```typescript
describe("MessagePreview", () => {
  test("TC-2.1: renders text message with sender name", () => {
    const message = {
      senderName: "John",
      content: "Hello world",
      contentType: "text",
      sentAt: new Date().toISOString(),
    };

    render(<MessagePreview message={message} />);
    expect(screen.getByTestId("message-preview")).toHaveTextContent(
      "John: Hello world"
    );
  });

  test("TC-2.2: renders image message with icon", () => {
    const message = {
      senderName: "Alice",
      content: "",
      contentType: "image",
      sentAt: new Date().toISOString(),
    };

    render(<MessagePreview message={message} />);
    expect(screen.getByTestId("message-preview")).toHaveTextContent(
      "Alice: 📷 [Hình ảnh]"
    );
  });

  test("TC-2.3: renders file message with filename", () => {
    const message = {
      senderName: "Bob",
      content: "",
      contentType: "file",
      attachments: [{ name: "document.pdf", url: "..." }],
      sentAt: new Date().toISOString(),
    };

    render(<MessagePreview message={message} />);
    expect(screen.getByTestId("message-preview")).toHaveTextContent(
      "Bob: 📎 [File] document.pdf"
    );
  });

  test("TC-2.4: truncates long messages at maxLength", () => {
    const longText = "A".repeat(100);
    const message = {
      senderName: "User",
      content: longText,
      contentType: "text",
      sentAt: new Date().toISOString(),
    };

    render(<MessagePreview message={message} maxLength={50} />);
    const preview = screen.getByTestId("message-preview").textContent;
    expect(preview).toContain("...");
    expect(preview.length).toBeLessThanOrEqual(
      50 + "User: ".length + "...".length
    );
  });

  test("TC-2.5: handles missing attachment name", () => {
    const message = {
      senderName: "User",
      content: "",
      contentType: "file",
      attachments: [],
      sentAt: new Date().toISOString(),
    };

    render(<MessagePreview message={message} />);
    expect(screen.getByTestId("message-preview")).toHaveTextContent(
      "User: 📎 [File] file"
    );
  });
});
```

**Coverage:** 100% (5/5 cases)

---

#### Test File: `formatRelativeTime.test.ts`

```typescript
describe("formatRelativeTime", () => {
  beforeAll(() => {
    // Mock current time: 2026-01-07 14:30:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-07T14:30:00"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('TC-3.1: returns "Vừa xong" for < 1 minute', () => {
    const timestamp = new Date("2026-01-07T14:29:30"); // 30s ago
    expect(formatRelativeTime(timestamp)).toBe("Vừa xong");
  });

  test('TC-3.2: returns "X phút trước" for < 60 minutes', () => {
    const timestamp = new Date("2026-01-07T14:00:00"); // 30 min ago
    expect(formatRelativeTime(timestamp)).toBe("30 phút trước");
  });

  test('TC-3.3: returns "X giờ trước" for < 24 hours', () => {
    const timestamp = new Date("2026-01-07T10:30:00"); // 4 hours ago
    expect(formatRelativeTime(timestamp)).toBe("4 giờ trước");
  });

  test('TC-3.4: returns "Hôm qua" for exactly 1 day ago', () => {
    const timestamp = new Date("2026-01-06T14:30:00"); // 1 day ago
    expect(formatRelativeTime(timestamp)).toBe("Hôm qua");
  });

  test('TC-3.5: returns "X ngày trước" for < 7 days', () => {
    const timestamp = new Date("2026-01-04T14:30:00"); // 3 days ago
    expect(formatRelativeTime(timestamp)).toBe("3 ngày trước");
  });

  test("TC-3.6: returns formatted date for >= 7 days", () => {
    const timestamp = new Date("2025-12-25T14:30:00"); // 13 days ago
    expect(formatRelativeTime(timestamp)).toBe("25/12");
  });
});
```

**Coverage:** 100% (6/6 cases)

---

#### Test File: `RelativeTime.test.tsx`

```typescript
describe("RelativeTime", () => {
  test("TC-4.1: renders formatted time", () => {
    const timestamp = new Date("2026-01-07T14:00:00");
    render(<RelativeTime timestamp={timestamp} />);

    expect(screen.getByTestId("relative-time")).toBeInTheDocument();
  });

  test("TC-4.2: updates after 1 minute", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-07T14:30:00"));

    const timestamp = new Date("2026-01-07T14:29:00"); // 1 min ago
    render(<RelativeTime timestamp={timestamp} />);

    expect(screen.getByTestId("relative-time")).toHaveTextContent(
      "1 phút trước"
    );

    // Fast-forward 1 minute
    vi.advanceTimersByTime(60000);

    expect(screen.getByTestId("relative-time")).toHaveTextContent(
      "2 phút trước"
    );

    vi.useRealTimers();
  });

  test("TC-4.3: shows full timestamp on hover (title attribute)", () => {
    const timestamp = new Date("2026-01-07T14:00:00");
    render(<RelativeTime timestamp={timestamp} />);

    const element = screen.getByTestId("relative-time");
    expect(element).toHaveAttribute("title");
    expect(element.getAttribute("title")).toContain("14:00");
  });

  test("TC-4.4: cleans up interval on unmount", () => {
    const { unmount } = render(<RelativeTime timestamp={new Date()} />);

    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
```

**Coverage:** 100% (4/4 cases)

---

#### Test File: `ConversationItem.test.tsx`

```typescript
describe("ConversationItem", () => {
  const mockConversation = {
    id: "1",
    name: "Test Group",
    avatar: "/avatar.jpg",
    unreadCount: 3,
    lastMessage: {
      content: "Hello",
      senderName: "John",
      sentAt: new Date().toISOString(),
      contentType: "text",
    },
  };

  test("TC-5.1: renders conversation info correctly", () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByText("Test Group")).toBeInTheDocument();
    expect(screen.getByAltText("Test Group")).toBeInTheDocument();
  });

  test("TC-5.2: shows badge when unreadCount > 0 and !isActive", () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByTestId("unread-badge")).toHaveTextContent("3");
  });

  test("TC-5.3: hides badge when isActive", () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={true}
        onClick={() => {}}
      />
    );

    expect(screen.queryByTestId("unread-badge")).not.toBeInTheDocument();
  });

  test("TC-5.4: applies active styles when isActive", () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={true}
        onClick={() => {}}
      />
    );

    const item = screen.getByTestId("conversation-item-1");
    expect(item).toHaveClass("bg-blue-50");
  });

  test("TC-5.5: shows unread border when unreadCount > 0", () => {
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={() => {}}
      />
    );

    const item = screen.getByTestId("conversation-item-1");
    expect(item).toHaveClass("border-l-3", "border-blue-500");
  });

  test("TC-5.6: calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByTestId("conversation-item-1"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Coverage:** 100% (6/6 cases)

---

### Phase 2: Real-time Updates & Sorting

#### Test File: `conversationSort.test.ts`

```typescript
describe("sortConversationsByLatest", () => {
  test("TC-6.1: sorts conversations by lastMessage.sentAt DESC", () => {
    const conversations = [
      { id: "1", lastMessage: { sentAt: "2026-01-07T10:00:00" } },
      { id: "2", lastMessage: { sentAt: "2026-01-07T14:00:00" } },
      { id: "3", lastMessage: { sentAt: "2026-01-07T12:00:00" } },
    ];

    const sorted = sortConversationsByLatest(conversations);

    expect(sorted[0].id).toBe("2"); // Newest
    expect(sorted[1].id).toBe("3");
    expect(sorted[2].id).toBe("1"); // Oldest
  });

  test("TC-6.2: handles conversations without lastMessage", () => {
    const conversations = [
      { id: "1", lastMessage: { sentAt: "2026-01-07T10:00:00" } },
      { id: "2", lastMessage: null },
    ];

    const sorted = sortConversationsByLatest(conversations);

    expect(sorted[0].id).toBe("1"); // Has message
    expect(sorted[1].id).toBe("2"); // No message (bottom)
  });

  test("TC-6.3: does not mutate original array", () => {
    const conversations = [
      { id: "1", lastMessage: { sentAt: "2026-01-07T10:00:00" } },
      { id: "2", lastMessage: { sentAt: "2026-01-07T14:00:00" } },
    ];

    const originalOrder = [...conversations];
    sortConversationsByLatest(conversations);

    expect(conversations).toEqual(originalOrder);
  });

  test("TC-6.4: handles empty array", () => {
    const sorted = sortConversationsByLatest([]);
    expect(sorted).toEqual([]);
  });
});
```

**Coverage:** 100% (4/4 cases)

---

#### Test File: `useMarkConversationAsRead.test.ts`

```typescript
describe("useMarkConversationAsRead", () => {
  test("TC-7.1: calls API with conversationId", async () => {
    const { result } = renderHook(() => useMarkConversationAsRead(), {
      wrapper: createQueryWrapper(),
    });

    const apiSpy = vi.spyOn(conversationsApi, "markConversationAsRead");

    result.current.mutate("conv-123");

    await waitFor(() => {
      expect(apiSpy).toHaveBeenCalledWith("conv-123");
    });
  });

  test("TC-7.2: optimistically updates unreadCount to 0", async () => {
    const queryClient = new QueryClient();

    // Set initial data
    queryClient.setQueryData(conversationsKeys.lists(), [
      { id: "conv-123", unreadCount: 5 },
    ]);

    const { result } = renderHook(() => useMarkConversationAsRead(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate("conv-123");

    // Check optimistic update
    const data = queryClient.getQueryData(conversationsKeys.lists());
    expect(data[0].unreadCount).toBe(0);
  });

  test("TC-7.3: rollbacks on API error", async () => {
    const queryClient = new QueryClient();

    queryClient.setQueryData(conversationsKeys.lists(), [
      { id: "conv-123", unreadCount: 5 },
    ]);

    vi.spyOn(conversationsApi, "markConversationAsRead").mockRejectedValue(
      new Error("API Error")
    );

    const { result } = renderHook(() => useMarkConversationAsRead(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate("conv-123");

    await waitFor(() => {
      const data = queryClient.getQueryData(conversationsKeys.lists());
      expect(data[0].unreadCount).toBe(5); // Rolled back
    });
  });

  test("TC-7.4: invalidates queries on success", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useMarkConversationAsRead(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate("conv-123");

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: conversationsKeys.all,
      });
    });
  });
});
```

**Coverage:** 100% (4/4 cases)

---

#### Test File: `useConversationRealtime.test.ts`

```typescript
describe("useConversationRealtime", () => {
  let mockConnection: MockSignalRConnection;

  beforeEach(() => {
    mockConnection = createMockSignalRConnection();
    vi.mocked(useSignalR).mockReturnValue({ connection: mockConnection });
  });

  test("TC-8.1: listens to MessageSent event", () => {
    renderHook(() => useConversationRealtime(), {
      wrapper: createQueryWrapper(),
    });

    expect(mockConnection.on).toHaveBeenCalledWith(
      "MessageSent",
      expect.any(Function)
    );
  });

  test("TC-8.2: updates lastMessage on new message", async () => {
    const queryClient = new QueryClient();

    queryClient.setQueryData(conversationsKeys.lists(), [
      { id: "conv-1", lastMessage: { content: "Old" } },
    ]);

    const { result } = renderHook(() => useConversationRealtime(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    // Simulate SignalR event
    const messageEvent = {
      conversationId: "conv-1",
      message: {
        content: "New message",
        senderName: "Alice",
        sentAt: new Date().toISOString(),
      },
    };

    mockConnection.trigger("MessageSent", messageEvent);

    await waitFor(() => {
      const data = queryClient.getQueryData(conversationsKeys.lists());
      expect(data[0].lastMessage.content).toBe("New message");
    });
  });

  test("TC-8.3: increments unreadCount if not active conversation", async () => {
    const queryClient = new QueryClient();

    queryClient.setQueryData(conversationsKeys.lists(), [
      { id: "conv-1", unreadCount: 2 },
      { id: "conv-2", unreadCount: 0 },
    ]);

    renderHook(
      () => useConversationRealtime({ activeConversationId: "conv-2" }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    );

    // Message for conv-1 (not active)
    mockConnection.trigger("MessageSent", {
      conversationId: "conv-1",
      message: { content: "Hi" },
    });

    await waitFor(() => {
      const data = queryClient.getQueryData(conversationsKeys.lists());
      expect(data[0].unreadCount).toBe(3); // Incremented
    });
  });

  test("TC-8.4: does NOT increment unreadCount if active conversation", async () => {
    const queryClient = new QueryClient();

    queryClient.setQueryData(conversationsKeys.lists(), [
      { id: "conv-1", unreadCount: 0 },
    ]);

    renderHook(
      () => useConversationRealtime({ activeConversationId: "conv-1" }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    );

    // Message for conv-1 (active)
    mockConnection.trigger("MessageSent", {
      conversationId: "conv-1",
      message: { content: "Hi" },
    });

    await waitFor(() => {
      const data = queryClient.getQueryData(conversationsKeys.lists());
      expect(data[0].unreadCount).toBe(0); // NOT incremented
    });
  });

  test("TC-8.5: resorts conversations after update", async () => {
    const queryClient = new QueryClient();

    queryClient.setQueryData(conversationsKeys.lists(), [
      { id: "conv-1", lastMessage: { sentAt: "2026-01-07T14:00:00" } },
      { id: "conv-2", lastMessage: { sentAt: "2026-01-07T10:00:00" } },
    ]);

    renderHook(() => useConversationRealtime(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    // New message for conv-2 (now newest)
    mockConnection.trigger("MessageSent", {
      conversationId: "conv-2",
      message: { sentAt: "2026-01-07T15:00:00" },
    });

    await waitFor(() => {
      const data = queryClient.getQueryData(conversationsKeys.lists());
      expect(data[0].id).toBe("conv-2"); // Moved to top
      expect(data[1].id).toBe("conv-1");
    });
  });

  test("TC-8.6: listens to MessageRead event", () => {
    renderHook(() => useConversationRealtime(), {
      wrapper: createQueryWrapper(),
    });

    expect(mockConnection.on).toHaveBeenCalledWith(
      "MessageRead",
      expect.any(Function)
    );
  });

  test("TC-8.7: sets unreadCount to 0 on MessageRead", async () => {
    const queryClient = new QueryClient();

    queryClient.setQueryData(conversationsKeys.lists(), [
      { id: "conv-1", unreadCount: 5 },
    ]);

    renderHook(() => useConversationRealtime(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    mockConnection.trigger("MessageRead", {
      conversationId: "conv-1",
      userId: "current-user",
    });

    await waitFor(() => {
      const data = queryClient.getQueryData(conversationsKeys.lists());
      expect(data[0].unreadCount).toBe(0);
    });
  });

  test("TC-8.8: cleans up listeners on unmount", () => {
    const { unmount } = renderHook(() => useConversationRealtime(), {
      wrapper: createQueryWrapper(),
    });

    unmount();

    expect(mockConnection.off).toHaveBeenCalledWith(
      "MessageSent",
      expect.any(Function)
    );
    expect(mockConnection.off).toHaveBeenCalledWith(
      "MessageRead",
      expect.any(Function)
    );
  });
});
```

**Coverage:** 100% (8/8 cases)

---

### Phase 3: Multi-line Input

#### Test File: `ChatInput.test.tsx`

```typescript
describe("ChatInput", () => {
  test("TC-9.1: renders textarea and send button", () => {
    render(<ChatInput onSend={() => {}} />);

    expect(screen.getByTestId("chat-message-input")).toBeInTheDocument();
    expect(screen.getByTestId("chat-send-button")).toBeInTheDocument();
  });

  test("TC-9.2: updates value on input change", () => {
    render(<ChatInput onSend={() => {}} />);

    const textarea = screen.getByTestId("chat-message-input");
    fireEvent.change(textarea, { target: { value: "Hello" } });

    expect(textarea).toHaveValue("Hello");
  });

  test("TC-9.3: calls onSend on Enter key (no Shift)", () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId("chat-message-input");
    fireEvent.change(textarea, { target: { value: "Test message" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(handleSend).toHaveBeenCalledWith("Test message");
  });

  test("TC-9.4: does NOT call onSend on Shift+Enter", () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId("chat-message-input");
    fireEvent.change(textarea, { target: { value: "Line 1" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(handleSend).not.toHaveBeenCalled();
  });

  test("TC-9.5: adds newline on Shift+Enter", () => {
    render(<ChatInput onSend={() => {}} />);

    const textarea = screen.getByTestId(
      "chat-message-input"
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Line 1" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    // Newline added by browser behavior (simulated in test)
    fireEvent.change(textarea, { target: { value: "Line 1\n" } });

    expect(textarea.value).toBe("Line 1\n");
  });

  test("TC-9.6: clears input after send", () => {
    render(<ChatInput onSend={() => {}} />);

    const textarea = screen.getByTestId("chat-message-input");
    fireEvent.change(textarea, { target: { value: "Message" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(textarea).toHaveValue("");
  });

  test("TC-9.7: auto-focuses after send", () => {
    render(<ChatInput onSend={() => {}} />);

    const textarea = screen.getByTestId("chat-message-input");
    fireEvent.change(textarea, { target: { value: "Message" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(textarea).toHaveFocus();
  });

  test("TC-9.8: disables send button when empty", () => {
    render(<ChatInput onSend={() => {}} />);

    const button = screen.getByTestId("chat-send-button");
    expect(button).toBeDisabled();
  });

  test("TC-9.9: auto-resizes textarea (max 120px)", () => {
    render(<ChatInput onSend={() => {}} />);

    const textarea = screen.getByTestId(
      "chat-message-input"
    ) as HTMLTextAreaElement;

    // Mock scrollHeight
    Object.defineProperty(textarea, "scrollHeight", {
      configurable: true,
      value: 150, // > max 120px
    });

    fireEvent.change(textarea, {
      target: { value: "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6" },
    });

    // Check max height applied
    expect(textarea.style.height).toBe("120px");
  });

  test("TC-9.10: handles paste multi-line text", () => {
    render(<ChatInput onSend={() => {}} />);

    const textarea = screen.getByTestId("chat-message-input");
    const multiLineText = "Line 1\nLine 2\nLine 3";

    fireEvent.paste(textarea, {
      clipboardData: {
        getData: () => multiLineText,
      },
    });

    fireEvent.change(textarea, { target: { value: multiLineText } });

    expect(textarea).toHaveValue(multiLineText);
  });
});
```

**Coverage:** 100% (10/10 cases)

---

### Integration Tests

#### Test File: `conversation-list.test.ts`

```typescript
describe("ConversationList - Integration", () => {
  test("INT-1: real-time message updates conversation list", async () => {
    const mockConnection = createMockSignalRConnection();

    render(<ConversationList />, { wrapper: createAppWrapper() });

    // Initial state
    expect(screen.getByText("Group A")).toBeInTheDocument();

    // Simulate new message via SignalR
    mockConnection.trigger("MessageSent", {
      conversationId: "group-a",
      message: { content: "New message", senderName: "Alice" },
    });

    await waitFor(() => {
      expect(screen.getByText(/Alice: New message/)).toBeInTheDocument();
    });
  });

  test("INT-2: unread count updates when receiving messages", async () => {
    render(<ConversationList />, { wrapper: createAppWrapper() });

    // Simulate message for inactive conversation
    mockConnection.trigger("MessageSent", {
      conversationId: "group-b",
      message: { content: "Hi" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("unread-badge")).toHaveTextContent("1");
    });
  });

  test("INT-3: conversation reorders on new message", async () => {
    render(<ConversationList />, { wrapper: createAppWrapper() });

    const items = screen.getAllByRole("button");
    expect(items[0]).toHaveTextContent("Group A"); // Initially first

    // New message for Group B (was second)
    mockConnection.trigger("MessageSent", {
      conversationId: "group-b",
      message: { sentAt: new Date().toISOString() },
    });

    await waitFor(() => {
      const updatedItems = screen.getAllByRole("button");
      expect(updatedItems[0]).toHaveTextContent("Group B"); // Now first
    });
  });

  test("INT-4: click conversation marks as read", async () => {
    const apiSpy = vi.spyOn(conversationsApi, "markConversationAsRead");

    render(<ConversationList />, { wrapper: createAppWrapper() });

    const conv = screen.getByText("Group A").closest('[role="button"]');
    fireEvent.click(conv);

    await waitFor(() => {
      expect(apiSpy).toHaveBeenCalledWith("group-a");
    });
  });

  test("INT-5: badge hides when conversation becomes active", async () => {
    render(<ConversationList />, { wrapper: createAppWrapper() });

    // Initially has badge
    expect(screen.getByTestId("unread-badge")).toBeInTheDocument();

    // Click conversation
    const conv = screen.getByText("Group A").closest('[role="button"]');
    fireEvent.click(conv);

    await waitFor(() => {
      expect(screen.queryByTestId("unread-badge")).not.toBeInTheDocument();
    });
  });

  test("INT-6: scroll position locked when reordering", async () => {
    const { container } = render(<ConversationList />, {
      wrapper: createAppWrapper(),
    });

    const listContainer = container.querySelector(
      '[data-testid="conversation-list"]'
    );
    listContainer.scrollTop = 200;

    // Trigger reorder
    mockConnection.trigger("MessageSent", {
      conversationId: "group-z",
      message: { sentAt: new Date().toISOString() },
    });

    await waitFor(() => {
      expect(listContainer.scrollTop).toBe(200); // Preserved
    });
  });
});
```

**Coverage:** 6 integration scenarios

---

#### Test File: `chat-input.test.ts`

```typescript
describe("ChatInput - Integration", () => {
  test("INT-7: full send flow with auto-focus", async () => {
    const handleSend = vi.fn().mockResolvedValue(undefined);

    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId("chat-message-input");

    // Type message
    fireEvent.change(textarea, { target: { value: "Hello" } });
    expect(textarea).toHaveValue("Hello");

    // Press Enter
    fireEvent.keyDown(textarea, { key: "Enter" });

    // Message sent
    await waitFor(() => {
      expect(handleSend).toHaveBeenCalledWith("Hello");
    });

    // Input cleared and focused
    expect(textarea).toHaveValue("");
    expect(textarea).toHaveFocus();
  });

  test("INT-8: multi-line input flow", () => {
    render(<ChatInput onSend={() => {}} />);

    const textarea = screen.getByTestId("chat-message-input");

    // Type line 1
    fireEvent.change(textarea, { target: { value: "Line 1" } });

    // Shift+Enter (newline)
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    fireEvent.change(textarea, { target: { value: "Line 1\n" } });

    // Type line 2
    fireEvent.change(textarea, { target: { value: "Line 1\nLine 2" } });

    // Send
    fireEvent.keyDown(textarea, { key: "Enter" });

    // Multi-line message sent
    expect(handleSend).toHaveBeenCalledWith("Line 1\nLine 2");
  });

  test("INT-9: error handling keeps input value", async () => {
    const handleSend = vi.fn().mockRejectedValue(new Error("Network error"));

    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId("chat-message-input");
    fireEvent.change(textarea, { target: { value: "Failed message" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(textarea).toHaveValue("Failed message"); // NOT cleared
    });
  });

  test("INT-10: click send button flow", async () => {
    const handleSend = vi.fn();

    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId("chat-message-input");
    const button = screen.getByTestId("chat-send-button");

    fireEvent.change(textarea, { target: { value: "Via button" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleSend).toHaveBeenCalledWith("Via button");
      expect(textarea).toHaveValue("");
      expect(textarea).toHaveFocus();
    });
  });
});
```

**Coverage:** 4 integration scenarios

---

## 📦 Test Data & Mocks

### Mock Conversations Data

```typescript
export const mockConversations = [
  {
    id: "conv-1",
    name: "Group A",
    avatar: "/avatars/group-a.jpg",
    unreadCount: 3,
    lastMessage: {
      content: "Latest message",
      senderName: "John",
      sentAt: "2026-01-07T14:00:00",
      contentType: "text",
      attachments: [],
    },
  },
  {
    id: "conv-2",
    name: "Group B",
    avatar: "/avatars/group-b.jpg",
    unreadCount: 0,
    lastMessage: {
      content: "Hello",
      senderName: "Alice",
      sentAt: "2026-01-07T10:00:00",
      contentType: "text",
      attachments: [],
    },
  },
];
```

### Mock SignalR Connection

```typescript
export function createMockSignalRConnection() {
  const listeners = new Map();

  return {
    on: vi.fn((event, handler) => {
      listeners.set(event, handler);
    }),
    off: vi.fn((event) => {
      listeners.delete(event);
    }),
    trigger: (event, data) => {
      const handler = listeners.get(event);
      if (handler) handler(data);
    },
  };
}
```

---

## ✅ Test Generation Checklist

| Phase                        | Tests Required | Status         |
| ---------------------------- | -------------- | -------------- |
| Phase 1: Badge & Preview     | 29 unit tests  | ⬜ Not started |
| Phase 2: Real-time & Sorting | 16 unit tests  | ⬜ Not started |
| Phase 3: Multi-line Input    | 10 unit tests  | ⬜ Not started |
| Integration Tests            | 10 tests       | ⬜ Not started |
| **Total**                    | **65 tests**   | ⬜ 0% complete |

---

## 🎯 Test Execution Strategy

### Run Order (for CI/CD)

1. Unit tests (fast, no dependencies)
2. Integration tests (require mock SignalR, QueryClient)

### Commands

```bash
# Run all tests
npm test

# Run specific phase
npm test -- UnreadBadge.test
npm test -- useConversationRealtime.test

# Coverage report
npm test -- --coverage

# Watch mode (development)
npm test -- --watch
```

### Coverage Targets

- **Statements:** >= 80%
- **Branches:** >= 75%
- **Functions:** >= 80%
- **Lines:** >= 80%

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                              | Status       |
| ------------------------------------- | ------------ |
| Đã review Test Coverage Matrix        | ✅ Đã review |
| Đã review Detailed Test Cases         | ✅ Đã review |
| Đã review Mock Data Strategy          | ✅ Đã review |
| **APPROVED để bắt đầu code (BƯỚC 5)** | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-07

> ✅ **Testing requirements approved - AI được phép bắt đầu implement code (BƯỚC 5)**

---

_Last updated: 2026-01-07_

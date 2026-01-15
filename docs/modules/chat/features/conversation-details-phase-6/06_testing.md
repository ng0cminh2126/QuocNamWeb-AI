# [BƯỚC 6] Testing Requirements - Chat UX Improvements (Phase 6)

> **Module:** Chat  
> **Feature:** Conversation Details Phase 6 - Error Handling & Persistence  
> **Document Type:** Testing Requirements  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Created:** 2026-01-13

---

## 📋 Overview

Test requirements cho Phase 6 - Error Handling & Persistence. Tài liệu này định nghĩa chi tiết test coverage matrix và test cases cần implement TRƯỚC KHI viết code.

---

## 📊 Test Coverage Matrix

| Implementation File                        | Test File                                              | Test Type        | Min Cases | Priority |
| ------------------------------------------ | ------------------------------------------------------ | ---------------- | --------- | -------- |
| `src/utils/errorHandling.ts`               | `src/utils/errorHandling.test.ts`                      | Unit             | 8         | MUST     |
| `src/utils/retryLogic.ts`                  | `src/utils/retryLogic.test.ts`                         | Unit             | 6         | MUST     |
| `src/utils/storage.ts`                     | `src/utils/storage.test.ts`                            | Unit             | 12        | MUST     |
| `src/hooks/mutations/useSendMessage.ts`    | `src/hooks/mutations/__tests__/useSendMessage.test.ts` | Integration      | 7         | MUST     |
| `src/hooks/mutations/useUploadFile.ts`     | `src/hooks/mutations/__tests__/useUploadFile.test.ts`  | Integration      | 8         | MUST     |
| `src/features/.../ChatMainContainer.tsx`   | `src/features/.../ChatMainContainer.test.tsx`          | Component        | 6         | MUST     |
| `src/features/.../MessageBubbleSimple.tsx` | `src/features/.../MessageBubbleSimple.test.tsx`        | Component        | 5         | MUST     |
| `src/features/.../FileAttachmentList.tsx`  | `src/features/.../FileAttachmentList.test.tsx`         | Component        | 6         | MUST     |
| E2E: Upload flow                           | `tests/chat/file-upload-error.spec.ts`                 | E2E (Playwright) | 4         | SHOULD   |
| E2E: Message send flow                     | `tests/chat/message-send-retry.spec.ts`                | E2E (Playwright) | 5         | SHOULD   |
| E2E: Conversation persistence              | `tests/chat/conversation-persistence.spec.ts`          | E2E (Playwright) | 4         | SHOULD   |

**Total Test Cases:** 71 minimum

---

## 🧪 Test Group 1: Error Classification (`errorHandling.ts`)

**File:** `src/utils/errorHandling.test.ts`

### Test Cases (8 minimum)

| Test ID | Test Case                                  | Input                         | Expected Output                                       | Priority |
| ------- | ------------------------------------------ | ----------------------------- | ----------------------------------------------------- | -------- |
| EC-1    | Classify network offline error             | `navigator.onLine = false`    | `type: 'NETWORK_OFFLINE'`, `isRetryable: true`        | MUST     |
| EC-2    | Classify network timeout error             | `error.code = 'ECONNABORTED'` | `type: 'NETWORK_TIMEOUT'`, `isRetryable: true`        | MUST     |
| EC-3    | Classify 401 Unauthorized error            | `axios error with status 401` | `type: 'UNAUTHORIZED'`, `isRetryable: false`          | MUST     |
| EC-4    | Classify 400 Bad Request error             | `axios error with status 400` | `type: 'BAD_REQUEST'`, `isRetryable: false`           | MUST     |
| EC-5    | Classify 500 Server Error                  | `axios error with status 500` | `type: 'SERVER_ERROR'`, `isRetryable: true`           | MUST     |
| EC-6    | Classify file too large error (413)        | `axios error with status 413` | `type: 'FILE_TOO_LARGE'`, `isRetryable: false`        | MUST     |
| EC-7    | Classify unsupported file type error (415) | `axios error with status 415` | `type: 'UNSUPPORTED_FILE_TYPE'`, `isRetryable: false` | MUST     |
| EC-8    | Classify unknown error                     | `new Error('Random error')`   | `type: 'UNKNOWN'`, `isRetryable: true`                | MUST     |

### Example Test:

```typescript
describe("classifyError", () => {
  it("EC-1: should classify network offline error", () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    const error = new Error("Network error");
    const result = classifyError(error);

    expect(result.type).toBe("NETWORK_OFFLINE");
    expect(result.isRetryable).toBe(true);
    expect(result.message).toContain("kết nối mạng");
  });

  it("EC-3: should classify 401 Unauthorized error", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 401,
        data: {},
      },
    };

    const result = classifyError(error);

    expect(result.type).toBe("UNAUTHORIZED");
    expect(result.isRetryable).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.message).toContain("đăng nhập");
  });
});
```

---

## 🧪 Test Group 2: Retry Logic (`retryLogic.ts`)

**File:** `src/utils/retryLogic.test.ts`

### Test Cases (6 minimum)

| Test ID | Test Case                         | Input                           | Expected Output                               | Priority |
| ------- | --------------------------------- | ------------------------------- | --------------------------------------------- | -------- |
| RL-1    | Success on first try (no retry)   | Function succeeds immediately   | Return result, 0 retries                      | MUST     |
| RL-2    | Success on second try (1 retry)   | Fail once, then succeed         | Return result after 1 retry, delay = 1000ms   | MUST     |
| RL-3    | Success on third try (2 retries)  | Fail twice, then succeed        | Return result after 2 retries, delays = 1s,2s | MUST     |
| RL-4    | Fail after max retries (3 times)  | Fail all 3 attempts             | Throw error after 3 retries                   | MUST     |
| RL-5    | Stop retry on non-retryable error | Throw 401 error (not retryable) | Throw immediately, no retries                 | MUST     |
| RL-6    | Verify exponential backoff delays | Fail 3 times                    | Delays: [1000ms, 2000ms, 4000ms]              | MUST     |

### Example Test:

```typescript
describe("retryWithBackoff", () => {
  it("RL-2: should retry once and succeed on second try", async () => {
    let attempts = 0;
    const fn = vi.fn(async () => {
      attempts++;
      if (attempts === 1) {
        throw new Error("Network error");
      }
      return "success";
    });

    const config = {
      maxRetries: 3,
      delays: [1000, 2000, 4000],
      shouldRetry: () => true,
    };

    const result = await retryWithBackoff(fn, config);

    expect(result).toBe("success");
    expect(attempts).toBe(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("RL-4: should fail after max retries", async () => {
    const fn = vi.fn(async () => {
      throw new Error("Persistent error");
    });

    const config = {
      maxRetries: 3,
      delays: [100, 200, 400],
      shouldRetry: () => true,
    };

    await expect(retryWithBackoff(fn, config)).rejects.toThrow(
      "Persistent error"
    );
    expect(fn).toHaveBeenCalledTimes(4); // Initial + 3 retries
  });
});
```

---

## 🧪 Test Group 3: LocalStorage Helpers (`storage.ts`)

**File:** `src/utils/storage.test.ts`

### Test Cases (12 minimum)

| Test ID | Test Case                                | Input                              | Expected Output                        | Priority |
| ------- | ---------------------------------------- | ---------------------------------- | -------------------------------------- | -------- |
| LS-1    | Save draft message                       | `DraftMessage` object              | Saved to localStorage with correct key | MUST     |
| LS-2    | Get draft message                        | `conversationId`                   | Return saved draft or null             | MUST     |
| LS-3    | Delete draft message                     | `conversationId`                   | Draft removed from localStorage        | MUST     |
| LS-4    | Add failed message to queue              | `FailedMessage` object             | Added to queue                         | MUST     |
| LS-5    | Get failed messages (all)                | No filter                          | Return all failed messages             | MUST     |
| LS-6    | Get failed messages by conversation      | `conversationId`                   | Return filtered messages               | MUST     |
| LS-7    | Remove failed message from queue         | `messageId`                        | Message removed                        | MUST     |
| LS-8    | Increment retry count                    | `messageId`                        | `retryCount` increased by 1            | MUST     |
| LS-9    | Max failed messages limit (50)           | Add 51st message                   | Queue size = 50 (oldest removed)       | MUST     |
| LS-10   | Save/get selected conversation           | `conversationId`                   | Saved and retrieved correctly          | MUST     |
| LS-11   | Clear selected conversation              | Call `clearSelectedConversation()` | Key removed from localStorage          | MUST     |
| LS-12   | Save/get scroll position with expiration | `ScrollPosition` (24h old)         | Return null if expired                 | MUST     |

### Example Test:

```typescript
describe("Draft Messages", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("LS-1: should save draft message", () => {
    const draft: DraftMessage = {
      conversationId: "conv-123",
      content: "Draft text",
      attachedFiles: [],
      lastModified: Date.now(),
    };

    saveDraft(draft);

    const saved = getDraft("conv-123");
    expect(saved).toEqual(draft);
  });

  it("LS-3: should delete draft message", () => {
    const draft: DraftMessage = {
      conversationId: "conv-123",
      content: "Draft text",
      attachedFiles: [],
      lastModified: Date.now(),
    };

    saveDraft(draft);
    deleteDraft("conv-123");

    const saved = getDraft("conv-123");
    expect(saved).toBeNull();
  });
});

describe("Failed Messages Queue", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("LS-9: should enforce max queue size of 50", () => {
    // Add 51 messages
    for (let i = 0; i < 51; i++) {
      const message: FailedMessage = {
        id: `msg-${i}`,
        content: `Message ${i}`,
        attachedFileIds: [],
        workspaceId: "ws-1",
        conversationId: "conv-1",
        retryCount: 0,
        lastError: "Error",
        timestamp: Date.now() + i,
      };
      addFailedMessage(message);
    }

    const queue = getFailedMessages();
    expect(queue.length).toBe(50);
    // Oldest (msg-0) should be removed
    expect(queue.find((m) => m.id === "msg-0")).toBeUndefined();
    // Newest (msg-50) should exist
    expect(queue.find((m) => m.id === "msg-50")).toBeDefined();
  });
});
```

---

## 🧪 Test Group 4: Send Message Hook (`useSendMessage.ts`)

**File:** `src/hooks/mutations/__tests__/useSendMessage.test.ts`

### Test Cases (7 minimum)

| Test ID | Test Case                               | Mock Setup                          | Expected Behavior                                | Priority |
| ------- | --------------------------------------- | ----------------------------------- | ------------------------------------------------ | -------- |
| SM-1    | Send message success on first try       | API succeeds immediately            | Message sent, cache invalidated, draft cleared   | MUST     |
| SM-2    | Send message success after 1 retry      | API fails once (500), then succeeds | Message sent after retry                         | MUST     |
| SM-3    | Send message fails after max retries    | API fails 4 times (500)             | Error thrown, message added to failed queue      | MUST     |
| SM-4    | Send message fails with 401 (no retry)  | API returns 401                     | Error thrown immediately, no retries             | MUST     |
| SM-5    | Send message fails with network offline | `navigator.onLine = false`          | Error toast shown, message added to failed queue | MUST     |
| SM-6    | Clear draft on success                  | API succeeds                        | `deleteDraft()` called with conversationId       | MUST     |
| SM-7    | Invalidate cache on success             | API succeeds                        | `queryClient.invalidateQueries()` called         | MUST     |

### Example Test:

```typescript
describe("useSendMessage", () => {
  it("SM-2: should retry once and succeed", async () => {
    let attempts = 0;
    vi.mocked(sendMessage).mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        throw { response: { status: 500 } };
      }
      return { id: "msg-1", content: "Test" };
    });

    const { result } = renderHook(() => useSendMessage("ws-1", "conv-1"), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ content: "Test", fileIds: [] });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(attempts).toBe(2);
    });
  });

  it("SM-4: should not retry on 401 error", async () => {
    vi.mocked(sendMessage).mockRejectedValue({
      response: { status: 401 },
    });

    const { result } = renderHook(() => useSendMessage("ws-1", "conv-1"), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ content: "Test", fileIds: [] });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(sendMessage).toHaveBeenCalledTimes(1); // No retries
    });
  });
});
```

---

## 🧪 Test Group 5: Upload File Hook (`useUploadFile.ts`)

**File:** `src/hooks/mutations/__tests__/useUploadFile.test.ts`

### Test Cases (8 minimum)

| Test ID | Test Case                                  | Mock Setup                          | Expected Behavior                       | Priority |
| ------- | ------------------------------------------ | ----------------------------------- | --------------------------------------- | -------- |
| UF-1    | Upload file success                        | File valid, API succeeds            | File uploaded, success status           | MUST     |
| UF-2    | Reject file too large (client-side)        | File size > 20MB                    | Error thrown before API call            | MUST     |
| UF-3    | Reject unsupported file type (client-side) | File type = 'application/exe'       | Error thrown before API call            | MUST     |
| UF-4    | Upload success after 1 retry               | API fails once (500), then succeeds | File uploaded after retry               | MUST     |
| UF-5    | Upload fails after max retries             | API fails 4 times (500)             | Error thrown, toast shown               | MUST     |
| UF-6    | Upload fails with 413 (no retry)           | API returns 413                     | Error thrown immediately, no retries    | MUST     |
| UF-7    | Upload progress tracking (optional)        | API reports progress                | `onProgress()` called with values 0-100 | SHOULD   |
| UF-8    | Upload timeout error                       | API timeout (ECONNABORTED)          | Error shown, retry allowed              | MUST     |

### Example Test:

```typescript
describe("useUploadFile", () => {
  it("UF-2: should reject file too large client-side", async () => {
    const largeFile = new File(["x".repeat(21 * 1024 * 1024)], "large.pdf", {
      type: "application/pdf",
    });

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ file: largeFile });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error.message).toContain("FILE_TOO_LARGE");
      expect(uploadFile).not.toHaveBeenCalled(); // No API call
    });
  });

  it("UF-4: should retry once and succeed", async () => {
    let attempts = 0;
    vi.mocked(uploadFile).mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        throw { response: { status: 500 } };
      }
      return { fileId: "file-1", url: "http://..." };
    });

    const file = new File(["content"], "test.pdf", { type: "application/pdf" });

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ file });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(attempts).toBe(2);
    });
  });
});
```

---

## 🧪 Test Group 6: Conversation Persistence (`ChatMainContainer.tsx`)

**File:** `src/features/portal/components/chat/ChatMainContainer.test.tsx`

### Test Cases (6 minimum)

| Test ID | Test Case                                        | Setup                                                 | Expected Behavior                                     | Priority |
| ------- | ------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------- | -------- |
| CP-1    | Restore selected conversation from localStorage  | `localStorage['selected-conversation-id'] = 'conv-1'` | Conversation 'conv-1' auto-selected                   | MUST     |
| CP-2    | Auto-select latest conversation (first visit)    | No saved conversation, 3 conversations in list        | First conversation selected, saved to localStorage    | MUST     |
| CP-3    | Show empty state when no conversations           | Conversations list empty                              | "Chưa có cuộc trò chuyện" displayed                   | MUST     |
| CP-4    | Show empty state when saved conversation deleted | Saved ID not in list                                  | "Chọn cuộc trò chuyện để bắt đầu" displayed           | MUST     |
| CP-5    | Save selected conversation on change             | User clicks conversation 'conv-2'                     | `localStorage['selected-conversation-id'] = 'conv-2'` | MUST     |
| CP-6    | Validate saved conversation exists in list       | Saved ID = 'conv-999' (doesn't exist)                 | Fallback to empty state or latest                     | MUST     |

### Example Test:

```typescript
describe("ChatMainContainer - Conversation Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("CP-1: should restore selected conversation from localStorage", () => {
    const conversations = [
      { id: "conv-1", name: "Conversation 1" },
      { id: "conv-2", name: "Conversation 2" },
    ];

    localStorage.setItem("selected-conversation-id", "conv-2");

    render(<ChatMainContainer />, {
      wrapper: createWrapper({
        queryClient: createTestQueryClient({
          conversations,
        }),
      }),
    });

    expect(screen.getByTestId("chat-messages-conv-2")).toBeInTheDocument();
  });

  it("CP-3: should show empty state when no conversations", () => {
    render(<ChatMainContainer />, {
      wrapper: createWrapper({
        queryClient: createTestQueryClient({
          conversations: [],
        }),
      }),
    });

    expect(screen.getByText(/Chưa có cuộc trò chuyện/i)).toBeInTheDocument();
  });
});
```

---

## 🧪 Test Group 7: Message Status Indicators (`MessageBubbleSimple.tsx`)

**File:** `src/features/portal/components/chat/MessageBubbleSimple.test.tsx`

### Test Cases (5 minimum)

| Test ID | Test Case                        | Props                                      | Expected Output                          | Priority |
| ------- | -------------------------------- | ------------------------------------------ | ---------------------------------------- | -------- |
| MS-1    | Show sending spinner             | `status='sending'`                         | Loader icon visible                      | MUST     |
| MS-2    | Show sent checkmark              | `status='sent'`                            | Check icon visible                       | MUST     |
| MS-3    | Show failed error icon + message | `status='failed'`, `error='Network error'` | Alert icon + error text visible          | MUST     |
| MS-4    | Show retry button on failed      | `status='failed'`                          | "Gửi lại" button visible, clickable      | MUST     |
| MS-5    | Show delete button on failed     | `status='failed'`                          | "Xoá" button visible, calls `onDelete()` | MUST     |

### Example Test:

```typescript
describe("MessageBubbleSimple - Status Indicators", () => {
  it("MS-1: should show sending spinner", () => {
    render(
      <MessageBubbleSimple
        message={{ id: "1", content: "Test" }}
        status="sending"
      />
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("MS-4: should show retry button on failed", async () => {
    const onRetry = vi.fn();

    render(
      <MessageBubbleSimple
        message={{ id: "1", content: "Test" }}
        status="failed"
        error="Network error"
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByTestId("message-retry-button");
    expect(retryButton).toBeInTheDocument();

    await userEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🧪 Test Group 8: File Error UI (`FileAttachmentList.tsx`)

**File:** `src/features/portal/components/chat/FileAttachmentList.test.tsx`

### Test Cases (6 minimum)

| Test ID | Test Case                            | Setup                                          | Expected Behavior                           | Priority |
| ------- | ------------------------------------ | ---------------------------------------------- | ------------------------------------------- | -------- |
| FE-1    | Show uploading spinner               | File `status='uploading'`                      | Loader icon visible                         | MUST     |
| FE-2    | Show success checkmark               | File `status='success'`                        | Check icon visible                          | MUST     |
| FE-3    | Show error state with inline message | File `status='error'`, `error='Upload failed'` | Error icon + message visible                | MUST     |
| FE-4    | Show retry button on error           | File `status='error'`                          | "Thử lại" button visible, calls `onRetry()` | MUST     |
| FE-5    | Delete button always visible         | File any status                                | Delete button (X) visible at all times      | MUST     |
| FE-6    | Delete button positioned top-right   | File any status                                | Button in top-right corner of file preview  | MUST     |

### Example Test:

```typescript
describe("FileAttachmentList - Error UI", () => {
  it("FE-3: should show error state with inline message", () => {
    const files = [
      {
        id: "file-1",
        file: new File(["content"], "test.pdf"),
        status: "error" as const,
        error: "Upload failed: Network error",
      },
    ];

    render(
      <FileAttachmentList files={files} onRetry={vi.fn()} onDelete={vi.fn()} />
    );

    expect(
      screen.getByText(/Upload failed: Network error/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("file-error-icon-file-1")).toBeInTheDocument();
  });

  it("FE-5: delete button should be always visible", () => {
    const files = [
      {
        id: "file-1",
        file: new File([""], "test.pdf"),
        status: "uploading" as const,
      },
      {
        id: "file-2",
        file: new File([""], "test2.pdf"),
        status: "success" as const,
      },
      {
        id: "file-3",
        file: new File([""], "test3.pdf"),
        status: "error" as const,
      },
    ];

    render(
      <FileAttachmentList files={files} onRetry={vi.fn()} onDelete={vi.fn()} />
    );

    // All delete buttons visible
    expect(screen.getByTestId("file-delete-button-file-1")).toBeVisible();
    expect(screen.getByTestId("file-delete-button-file-2")).toBeVisible();
    expect(screen.getByTestId("file-delete-button-file-3")).toBeVisible();
  });
});
```

---

## 🎭 E2E Test Group 9: File Upload Error Flow

**File:** `tests/chat/file-upload-error.spec.ts`

### Test Cases (4 minimum)

| Test ID | Test Case                               | Steps                                                        | Expected Outcome                           |
| ------- | --------------------------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| E2E-F1  | Upload file too large (client-side)     | Select file > 20MB → Upload                                  | Error message shown, no API call           |
| E2E-F2  | Upload fail (network) → Retry → Success | Upload → Mock network error → Click "Thử lại" → Mock success | File uploaded after retry                  |
| E2E-F3  | Upload fail → Delete failed file        | Upload → Mock error → Click "Xoá"                            | File removed from list                     |
| E2E-F4  | Upload multiple files, some fail        | Upload 3 files → Mock 2 fail, 1 success → Send message       | Only 1 successful file included in message |

---

## 🎭 E2E Test Group 10: Message Send Retry Flow

**File:** `tests/chat/message-send-retry.spec.ts`

### Test Cases (5 minimum)

| Test ID | Test Case                                             | Steps                                               | Expected Outcome                    |
| ------- | ----------------------------------------------------- | --------------------------------------------------- | ----------------------------------- |
| E2E-M1  | Send message success                                  | Type message → Click "Gửi"                          | Message sent, checkmark shown       |
| E2E-M2  | Send message fail (network) → Retry → Success         | Type message → Mock network error → Click "Gửi lại" | Message sent after retry            |
| E2E-M3  | Send message fail → Delete                            | Type message → Mock error → Click "Xoá"             | Failed message removed              |
| E2E-M4  | Send message offline → Show error                     | Set offline → Type message → Click "Gửi"            | Error "Không có kết nối mạng" shown |
| E2E-M5  | Send message with attachments → Retry preserves files | Attach file → Send → Mock error → Retry             | Same file attached on retry         |

---

## 🎭 E2E Test Group 11: Conversation Persistence

**File:** `tests/chat/conversation-persistence.spec.ts`

### Test Cases (4 minimum)

| Test ID | Test Case                                | Steps                                                    | Expected Outcome                  |
| ------- | ---------------------------------------- | -------------------------------------------------------- | --------------------------------- |
| E2E-C1  | Select conversation → Reload → Restored  | Select conversation 2 → Reload page                      | Conversation 2 still selected     |
| E2E-C2  | First visit → Auto-select latest         | Clear localStorage → Visit page                          | Latest conversation auto-selected |
| E2E-C3  | Saved conversation deleted → Empty state | Save ID 'conv-999' → Delete conversation → Reload        | Empty state shown                 |
| E2E-C4  | Multiple tabs → Last write wins          | Tab 1 select conv-1 → Tab 2 select conv-2 → Reload tab 1 | Tab 1 shows conv-2 (latest)       |

---

## 📋 Test Data & Mocks Requirements

### Mock API Responses

Cần tạo mock data cho:

1. **Success responses:**

   - `mockMessageSendSuccess.json`
   - `mockFileUploadSuccess.json`

2. **Error responses:**
   - `mockNetworkError.ts` - Simulate `navigator.onLine = false`
   - `mockTimeoutError.ts` - Simulate `ECONNABORTED`
   - `mockServerError500.json`
   - `mockUnauthorized401.json`
   - `mockBadRequest400.json`
   - `mockFileTooLarge413.json`
   - `mockUnsupportedType415.json`

### Test Fixtures

```typescript
// src/test/fixtures/messages.ts
export const mockMessages = {
  success: {
    id: "msg-1",
    content: "Test message",
    createdAt: "2026-01-13T10:00:00Z",
  },
  failed: {
    id: "temp-123",
    content: "Failed message",
    status: "failed",
    error: "Network error",
  },
};

// src/test/fixtures/files.ts
export const mockFiles = {
  valid: new File(["content"], "test.pdf", {
    type: "application/pdf",
    size: 1024,
  }),
  tooLarge: new File(["x".repeat(21 * 1024 * 1024)], "large.pdf"),
  unsupported: new File(["content"], "test.exe", { type: "application/exe" }),
};
```

---

## 🏃 Test Execution Strategy

### Phase 1: Unit Tests (Run First)

```bash
npm test src/utils/errorHandling.test.ts
npm test src/utils/retryLogic.test.ts
npm test src/utils/storage.test.ts
```

### Phase 2: Integration Tests (After Unit Tests Pass)

```bash
npm test src/hooks/mutations
```

### Phase 3: Component Tests (After Integration Tests Pass)

```bash
npm test src/features/portal/components/chat
```

### Phase 4: E2E Tests (After All Unit/Component Tests Pass)

```bash
npx playwright test tests/chat/
```

---

## ✅ Test Generation Checklist

- [ ] Create test files for all utils (errorHandling, retryLogic, storage)
- [ ] Create test files for hooks (useSendMessage, useUploadFile)
- [ ] Create test files for components (ChatMainContainer, MessageBubbleSimple, FileAttachmentList)
- [ ] Create mock data fixtures
- [ ] Create E2E test files (file-upload-error, message-send-retry, conversation-persistence)
- [ ] Setup test helpers (createQueryWrapper, createTestQueryClient)
- [ ] Run all unit tests
- [ ] Run all integration tests
- [ ] Run all component tests
- [ ] Run all E2E tests
- [ ] Verify test coverage > 80%

---

## 📋 IMPACT SUMMARY (Tóm tắt thay đổi)

### Test Files sẽ tạo mới:

- `src/utils/errorHandling.test.ts` - 8 test cases
- `src/utils/retryLogic.test.ts` - 6 test cases
- `src/utils/storage.test.ts` - 12 test cases
- `src/hooks/mutations/__tests__/useSendMessage.test.ts` - 7 test cases
- `src/hooks/mutations/__tests__/useUploadFile.test.ts` - 8 test cases
- `src/features/portal/components/chat/ChatMainContainer.test.tsx` - 6 test cases
- `src/features/portal/components/chat/MessageBubbleSimple.test.tsx` - 5 test cases
- `src/features/portal/components/chat/FileAttachmentList.test.tsx` - 6 test cases
- `tests/chat/file-upload-error.spec.ts` - 4 E2E tests
- `tests/chat/message-send-retry.spec.ts` - 5 E2E tests
- `tests/chat/conversation-persistence.spec.ts` - 4 E2E tests

### Mock/Fixture Files sẽ tạo mới:

- `src/test/fixtures/messages.ts` - Mock message data
- `src/test/fixtures/files.ts` - Mock file data
- `src/test/fixtures/errors.ts` - Mock error responses

### Test Helpers sẽ tạo mới (nếu chưa có):

- `src/test/helpers/queryWrapper.tsx` - Wrapper cho TanStack Query tests
- `src/test/helpers/testQueryClient.ts` - Test query client setup

---

## ⏳ PENDING DECISIONS (Các quyết định chờ HUMAN)

| #   | Vấn đề                                     | Lựa chọn               | HUMAN Decision |
| --- | ------------------------------------------ | ---------------------- | -------------- |
| 1   | Test coverage target                       | 70%, 80%, or 90%?      | ✅ **80%**     |
| 2   | E2E tests priority                         | MUST, SHOULD, or COULD | ✅ **SHOULD**  |
| 3   | Snapshot tests for components?             | Yes or No?             | ✅ **No**      |
| 4   | Visual regression tests (Percy/Chromatic)? | Yes or No?             | ✅ **No**      |

> ✅ **Tất cả quyết định đã được HUMAN xác nhận**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                         | Status       |
| -------------------------------- | ------------ |
| Đã review Test Coverage Matrix   | ✅ Đã review |
| Đã review Test Cases chi tiết    | ✅ Đã review |
| Đã review Test Data Requirements | ✅ Đã review |
| Đã điền Pending Decisions        | ✅ Đã điền   |
| **APPROVED để thực thi**         | ✅ APPROVED  |

**HUMAN Signature:** MINH ĐÃ DUYỆT  
**Date:** 2026-01-13

> ✅ **APPROVED: AI được phép generate test code**

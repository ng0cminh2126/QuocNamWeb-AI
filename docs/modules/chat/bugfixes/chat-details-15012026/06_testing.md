# [BƯỚC 4.5] Testing Requirements - Chat Details Phase 7 Bugfixes

**Document:** Test Requirements & Coverage  
**Created:** 2026-01-15  
**Status:** ✅ APPROVED  
**Version:** 1.0

---

## 🎯 Testing Overview

Testing strategy for 2 bugfixes:

1. **Load More Messages** - Verify infinite query pagination works
2. **File Upload Limit** - Verify 5-file limit enforcement

---

## 📊 Test Coverage Matrix

| Implementation File                                         | Test File                                                                         | Test Type   | Cases |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------- | ----- |
| `src/api/messages.api.ts`                                   | `src/api/__tests__/messages.api.test.ts`                                          | Unit        | 4     |
| `src/hooks/queries/useMessages.ts`                          | `src/hooks/queries/__tests__/useMessages.test.tsx`                                | Integration | 5     |
| `src/types/files.ts`                                        | N/A (constants only)                                                              | -           | 0     |
| `src/features/portal/components/chat/ChatMainContainer.tsx` | `src/features/portal/components/chat/__tests__/ChatMainContainer.phase7.test.tsx` | Integration | 8     |

**Total Test Cases:** 17  
**Coverage Target:** 100% for changed code paths

---

## 🧪 Bug #1: Load More Messages - Test Cases

### File: `src/api/__tests__/messages.api.test.ts`

#### Test Case 1.1: getMessages with no cursor

```typescript
describe("getMessages", () => {
  it("should fetch first page without cursor", async () => {
    // Arrange
    const mockResponse = {
      items: [mockMessage1, mockMessage2],
      hasNext: true, // Or hasMore, based on API
      cursor: "next-cursor-token",
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

    // Act
    const result = await getMessages({
      conversationId: "conv-1",
      limit: 50,
    });

    // Assert
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/conversations/conv-1/messages",
      { params: { limit: 50 } }
    );
    expect(result).toEqual(mockResponse);
  });
});
```

#### Test Case 1.2: getMessages with cursor

```typescript
it("should fetch next page with cursor", async () => {
  // Arrange
  const mockResponse = {
    items: [mockMessage3, mockMessage4],
    hasNext: false,
    cursor: null,
  };
  vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

  // Act
  const result = await getMessages({
    conversationId: "conv-1",
    limit: 50,
    cursor: "next-cursor-token",
  });

  // Assert
  expect(apiClient.get).toHaveBeenCalledWith(
    "/api/conversations/conv-1/messages",
    { params: { limit: 50, cursor: "next-cursor-token" } } // Or 'before' based on API
  );
  expect(result).toEqual(mockResponse);
});
```

#### Test Case 1.3: getMessages handles auth error

```typescript
it("should throw on 401 Unauthorized", async () => {
  // Arrange
  const error = {
    response: { status: 401, data: { message: "Unauthorized" } },
  };
  vi.mocked(apiClient.get).mockRejectedValue(error);

  // Act & Assert
  await expect(getMessages({ conversationId: "conv-1" })).rejects.toThrow();
});
```

#### Test Case 1.4: getMessages handles network error

```typescript
it("should throw on network error", async () => {
  // Arrange
  const error = new Error("Network Error");
  vi.mocked(apiClient.get).mockRejectedValue(error);

  // Act & Assert
  await expect(getMessages({ conversationId: "conv-1" })).rejects.toThrow(
    "Network Error"
  );
});
```

---

### File: `src/hooks/queries/__tests__/useMessages.test.tsx`

**NOTE:** File đã tồn tại, cần UPDATE existing tests

#### Test Case 1.5: hasNextPage returns true when hasNext is true

```typescript
it("should return hasNextPage=true when API hasNext=true", async () => {
  // Arrange
  const mockPage1 = {
    items: [mockMessage1],
    hasNext: true, // Or hasMore
    cursor: "cursor-1",
  };
  vi.mocked(getMessages).mockResolvedValue(mockPage1);

  // Act
  const { result } = renderHook(() =>
    useMessages({ conversationId: "conv-1" })
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  // Assert
  expect(result.current.hasNextPage).toBe(true);
});
```

#### Test Case 1.6: hasNextPage returns false when hasNext is false

```typescript
it("should return hasNextPage=false when API hasNext=false", async () => {
  // Arrange
  const mockPage1 = {
    items: [mockMessage1],
    hasNext: false,
    cursor: null,
  };
  vi.mocked(getMessages).mockResolvedValue(mockPage1);

  // Act
  const { result } = renderHook(() =>
    useMessages({ conversationId: "conv-1" })
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  // Assert
  expect(result.current.hasNextPage).toBe(false);
});
```

#### Test Case 1.7: fetchNextPage loads second page with cursor

```typescript
it("should pass cursor to fetchNextPage", async () => {
  // Arrange
  const mockPage1 = {
    items: [mockMessage1],
    hasNext: true,
    cursor: "cursor-1",
  };
  const mockPage2 = {
    items: [mockMessage2],
    hasNext: false,
    cursor: null,
  };
  vi.mocked(getMessages)
    .mockResolvedValueOnce(mockPage1)
    .mockResolvedValueOnce(mockPage2);

  // Act
  const { result } = renderHook(() =>
    useMessages({ conversationId: "conv-1" })
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  await act(async () => {
    await result.current.fetchNextPage();
  });

  // Assert
  expect(getMessages).toHaveBeenCalledWith({
    conversationId: "conv-1",
    limit: 50,
    cursor: "cursor-1", // Should use cursor from page 1
  });
  expect(result.current.data?.pages).toHaveLength(2);
});
```

#### Test Case 1.8: flattenMessages reverses order correctly

```typescript
it("should flatten and reverse messages (oldest first)", () => {
  // Arrange
  const mockData = {
    pages: [
      { items: [mockMessage1, mockMessage2], hasNext: true, cursor: "c1" }, // Newest
      { items: [mockMessage3, mockMessage4], hasNext: false, cursor: null }, // Oldest
    ],
    pageParams: [undefined, "c1"],
  };

  // Act
  const result = flattenMessages(mockData);

  // Assert
  // API returns newest first, we want oldest first for display
  expect(result).toEqual([
    mockMessage4,
    mockMessage3,
    mockMessage2,
    mockMessage1,
  ]);
});
```

#### Test Case 1.9: getMessageCount returns correct total

```typescript
it("should count total messages across all pages", () => {
  // Arrange
  const mockData = {
    pages: [
      { items: [mockMessage1, mockMessage2], hasNext: true, cursor: "c1" },
      { items: [mockMessage3], hasNext: false, cursor: null },
    ],
    pageParams: [undefined, "c1"],
  };

  // Act
  const result = getMessageCount(mockData);

  // Assert
  expect(result).toBe(3);
});
```

---

### 1.3. Hook Tests: useScrollToMessage.test.ts

**File:** `src/hooks/__tests__/useScrollToMessage.test.ts`

**Test Cases:**

#### Test Case 1.10: Scroll to message already loaded

```typescript
it("should scroll to message if already in list", async () => {
  // Arrange
  const mockMessagesQuery = {
    data: {
      pages: [{ items: [{ id: "msg-1", content: "Hello" }] }],
    },
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  };
  const scrollToMessageSpy = vi
    .spyOn(messageHelpers, "scrollToMessage")
    .mockReturnValue(true);

  const { result } = renderHook(() =>
    useScrollToMessage({
      conversationId: "conv-1",
      messagesQuery: mockMessagesQuery,
    })
  );

  // Act
  await act(async () => {
    await result.current.scrollToMessageById("msg-1");
  });

  // Assert
  expect(scrollToMessageSpy).toHaveBeenCalledWith("msg-1");
  expect(mockMessagesQuery.fetchNextPage).not.toHaveBeenCalled();
  expect(result.current.isAutoLoading).toBe(false);
});
```

#### Test Case 1.11: Auto-load until target message found

```typescript
it("should auto-load pages until message is found", async () => {
  // Arrange
  const mockPage1 = {
    items: [{ id: "msg-1" }],
    hasMore: true,
    nextCursor: "c1",
  };
  const mockPage2 = {
    items: [{ id: "msg-2" }],
    hasMore: true,
    nextCursor: "c2",
  };
  const mockPage3 = {
    items: [{ id: "msg-target" }],
    hasMore: false,
    nextCursor: null,
  };

  let callCount = 0;
  const mockMessagesQuery = {
    data: { pages: [mockPage1] },
    hasNextPage: true,
    fetchNextPage: vi.fn(async () => {
      callCount++;
      if (callCount === 1) {
        mockMessagesQuery.data.pages.push(mockPage2);
      } else if (callCount === 2) {
        mockMessagesQuery.data.pages.push(mockPage3);
        mockMessagesQuery.hasNextPage = false;
      }
    }),
  };

  const scrollToMessageSpy = vi
    .spyOn(messageHelpers, "scrollToMessage")
    .mockReturnValue(true);

  const { result } = renderHook(() =>
    useScrollToMessage({
      conversationId: "conv-1",
      messagesQuery: mockMessagesQuery,
    })
  );

  // Act
  await act(async () => {
    await result.current.scrollToMessageById("msg-target");
  });

  // Assert
  expect(mockMessagesQuery.fetchNextPage).toHaveBeenCalledTimes(2);
  expect(scrollToMessageSpy).toHaveBeenCalledWith("msg-target");
  expect(result.current.isAutoLoading).toBe(false);
});
```

#### Test Case 1.12: Show error when message not found

```typescript
it("should show error if message not found after loading all pages", async () => {
  // Arrange
  const mockMessagesQuery = {
    data: { pages: [{ items: [{ id: "msg-1" }] }] },
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  };

  const { result } = renderHook(() =>
    useScrollToMessage({
      conversationId: "conv-1",
      messagesQuery: mockMessagesQuery,
    })
  );

  // Act
  await act(async () => {
    await result.current.scrollToMessageById("msg-not-exist");
  });

  // Assert
  expect(toast.error).toHaveBeenCalledWith("Không tìm thấy tin nhắn");
  expect(result.current.isAutoLoading).toBe(false);
});
```

#### Test Case 1.13: isAutoLoading state management

```typescript
it("should set isAutoLoading during auto-load", async () => {
  // Arrange
  const mockMessagesQuery = {
    data: { pages: [{ items: [] }] },
    hasNextPage: true,
    fetchNextPage: vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      mockMessagesQuery.data.pages.push({ items: [{ id: "msg-target" }] });
      mockMessagesQuery.hasNextPage = false;
    }),
  };

  const { result } = renderHook(() =>
    useScrollToMessage({
      conversationId: "conv-1",
      messagesQuery: mockMessagesQuery,
    })
  );

  // Act & Assert
  expect(result.current.isAutoLoading).toBe(false);

  act(() => {
    result.current.scrollToMessageById("msg-target");
  });

  // During loading
  await waitFor(() => {
    expect(result.current.isAutoLoading).toBe(true);
  });

  // After complete
  await waitFor(() => {
    expect(result.current.isAutoLoading).toBe(false);
  });
});
```

---

### 1.4. Component Tests: ChatMainContainer.test.tsx (Auto-scroll integration)

    ],
    pageParams: [undefined, "c1"],

};

// Act
const count = getMessageCount(mockData);

// Assert
expect(count).toBe(3);
});

````

---

## 🧪 Bug #2: File Upload Limit - Test Cases

### File: `src/features/portal/components/chat/__tests__/ChatMainContainer.phase7.test.tsx`

**NEW TEST FILE** (create separate from existing phase tests)

#### Test Case 2.1: Allow 10 files selection at once

```typescript
describe("ChatMainContainer - File Upload Limit", () => {
  it("should accept 10 files selected at once", async () => {
    // Arrange
    const { user } = setup();
    const files = createMockFiles(10);
    const fileInput = screen.getByTestId("file-input");

    // Act
    await user.upload(fileInput, files);

    // Assert
    expect(screen.getAllByTestId(/file-preview-/)).toHaveLength(10);
    expect(toast.success).toHaveBeenCalledWith("Đã thêm 10 file");
  });
});
````

#### Test Case 2.2: Accept first 5 files when selecting 6 at once

```typescript
it("should accept first 5 files and discard 6th when selecting 6 files", async () => {
  // Arrange
  const { user } = setup();
  const files = createMockFiles(6);
  const fileInput = screen.getByTestId("file-input");

  // Act
  await user.upload(fileInput, files);

  // Assert
  expect(screen.getAllByTestId(/file-preview-/)).toHaveLength(5);
  expect(toast.warning).toHaveBeenCalledWith(
    "Chỉ chọn được 5 file. Đã tự động bỏ 1 file."
  );
  expect(screen.getByTestId("file-upload-button")).toBeDisabled();
  expect(screen.getByTestId("image-upload-button")).toBeDisabled();
});
```

#### Test Case 2.3: Incremental selection reaches limit

```typescript
it("should accept incremental selection up to 10 files", async () => {
  // Arrange
  const { user } = setup();
  const fileInput = screen.getByTestId("file-input");

  // Act - Select 5 files
  await user.upload(fileInput, createMockFiles(5));
  expect(screen.getAllByTestId(/file-preview-/)).toHaveLength(5);

  // Act - Select 5 more files
  await user.upload(fileInput, createMockFiles(5));

  // Assert
  expect(screen.getAllByTestId(/file-preview-/)).toHaveLength(10);
  expect(screen.getByTestId("file-upload-button")).toBeDisabled();
  expect(screen.getByTestId("image-upload-button")).toBeDisabled();
});
```

#### Test Case 2.4: Reject selection when limit reached

```typescript
it("should reject selection when already at 10 files", async () => {
  // Arrange
  const { user } = setup();
  const fileInput = screen.getByTestId("file-input");

  // Act - Select 10 files
  await user.upload(fileInput, createMockFiles(10));

  // Act - Try to select 1 more (input should be disabled, but test manually)
  await user.upload(fileInput, createMockFiles(1));

  // Assert
  expect(screen.getAllByTestId(/file-preview-/)).toHaveLength(10); // Still 10
  expect(toast.error).toHaveBeenCalledWith(
    "Đã đủ 10 file. Vui lòng xóa file cũ để chọn file mới."
  );
});
```

#### Test Case 2.5: Accept partial when incremental selection exceeds limit

```typescript
it("should accept only remaining slots when incremental selection exceeds limit", async () => {
  // Arrange
  const { user } = setup();
  const fileInput = screen.getByTestId("file-input");

  // Act - Select 7 files
  await user.upload(fileInput, createMockFiles(7));

  // Act - Try to select 5 more (can only add 3)
  await user.upload(fileInput, createMockFiles(5));

  // Assert
  expect(screen.getAllByTestId(/file-preview-/)).toHaveLength(10); // 7 + 3 = 10
  expect(toast.warning).toHaveBeenCalledWith(
    "Đã có 7 file. Chỉ chọn thêm được 3 file nữa."
  );
  expect(screen.getByTestId("file-upload-button")).toBeDisabled();
});
```

#### Test Case 2.6: Re-enable inputs after removing file

```typescript
it("should re-enable inputs after removing file from limit", async () => {
  // Arrange
  const { user } = setup();
  const fileInput = screen.getByTestId("file-input");

  // Act - Select 10 files
  await user.upload(fileInput, createMockFiles(10));
  expect(screen.getByTestId("file-upload-button")).toBeDisabled();

  // Act - Remove 1 file
  const removeButton = screen.getAllByTestId(/file-remove-button-/)[0];
  await user.click(removeButton);

  // Assert
  expect(screen.getAllByTestId(/file-preview-/)).toHaveLength(9);
  expect(screen.getByTestId("file-upload-button")).not.toBeDisabled();
  expect(screen.getByTestId("image-upload-button")).not.toBeDisabled();
});
```

#### Test Case 2.7: Both file and image inputs disabled at limit

```typescript
it("should disable both file and image inputs at limit", async () => {
  // Arrange
  const { user } = setup();
  const fileInput = screen.getByTestId("file-input");

  // Act - Select 6 files via file input
  await user.upload(fileInput, createMockFiles(6));

  // Act - Select 4 images via image input
  const imageInput = screen.getByTestId("image-input");
  await user.upload(imageInput, createMockImages(4));

  // Assert
  expect(screen.getAllByTestId(/file-preview-/)).toHaveLength(10);
  expect(screen.getByTestId("file-upload-button")).toBeDisabled();
  expect(screen.getByTestId("image-upload-button")).toBeDisabled();
  expect(fileInput).toBeDisabled();
  expect(imageInput).toBeDisabled();
});
```

#### Test Case 2.8: Reject when total size exceeds 100MB

```typescript
it("should reject when total size exceeds 100MB", async () => {
  // Arrange
  const { user } = setup();
  const fileInput = screen.getByTestId("file-input");

  // Act - Select files totaling 95MB
  const largeFiles = [
    new File([new ArrayBuffer(50 * 1024 * 1024)], "file1.pdf", {
      type: "application/pdf",
    }),
    new File([new ArrayBuffer(45 * 1024 * 1024)], "file2.pdf", {
      type: "application/pdf",
    }),
  ];
  await user.upload(fileInput, largeFiles);
  expect(screen.getAllByTestId(/file-preview-/)).toHaveLength(2);

  // Act - Try to add 10MB file (total would be 105MB)
  const extraFile = new File([new ArrayBuffer(10 * 1024 * 1024)], "file3.pdf", {
    type: "application/pdf",
  });
  await user.upload(fileInput, [extraFile]);

  // Assert
  expect(screen.getAllByTestId(/file-preview-/)).toHaveLength(2); // Still 2
  expect(toast.error).toHaveBeenCalledWith(
    expect.stringContaining("Tổng dung lượng vượt quá 100MB")
  );
});
```

#### Test Case 2.9: Disable buttons when approaching 100MB

```typescript
it("should disable buttons when total size approaches 100MB", async () => {
  // Arrange
  const { user } = setup();
  const fileInput = screen.getByTestId("file-input");

  // Act - Upload files close to 100MB (99.999MB)
  const largeFiles = [
    new File([new ArrayBuffer(99 * 1024 * 1024)], "file1.pdf", {
      type: "application/pdf",
    }),
    new File([new ArrayBuffer(999 * 1024)], "file2.pdf", {
      type: "application/pdf",
    }), // 999KB
  ];
  await user.upload(fileInput, largeFiles);

  // Assert - Buttons should be disabled (< 1KB remaining)
  expect(screen.getByTestId("file-upload-button")).toBeDisabled();
  expect(screen.getByTestId("image-upload-button")).toBeDisabled();
});
```

#### Test Case 2.10: File validation still works (size, type)

```typescript
it("should still validate file size and type", async () => {
  // Arrange
  const { user } = setup();
  const fileInput = screen.getByTestId("file-input");

  // Act - Try to upload 1 file that's too large (11MB)
  const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "large.pdf", {
    type: "application/pdf",
  });
  await user.upload(fileInput, [largeFile]);

  // Assert
  expect(screen.queryByTestId(/file-preview-/)).not.toBeInTheDocument();
  expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("quá lớn"));
});
```

---

## 🧪 Test Data & Mocks

### Mock Functions

```typescript
// File: src/features/portal/components/chat/__tests__/ChatMainContainer.phase7.test.tsx

/**
 * Create mock File objects for testing
 */
function createMockFiles(count: number): File[] {
  return Array.from(
    { length: count },
    (_, i) =>
      new File([`content-${i}`], `file-${i}.pdf`, { type: "application/pdf" })
  );
}

/**
 * Create mock image File objects
 */
function createMockImages(count: number): File[] {
  return Array.from(
    { length: count },
    (_, i) => new File([`image-${i}`], `image-${i}.jpg`, { type: "image/jpeg" })
  );
}

/**
 * Create mock ChatMessage
 */
function createMockMessage(id: string): ChatMessage {
  return {
    id,
    conversationId: "conv-1",
    content: `Message ${id}`,
    senderId: "user-1",
    senderName: "Test User",
    createdAt: new Date().toISOString(),
    contentType: "TXT",
  };
}
```

### Mock API Responses (for Bug #1)

```typescript
// File: src/api/__tests__/messages.api.test.ts

const mockMessage1: ChatMessage = createMockMessage("msg-1");
const mockMessage2: ChatMessage = createMockMessage("msg-2");
const mockMessage3: ChatMessage = createMockMessage("msg-3");
const mockMessage4: ChatMessage = createMockMessage("msg-4");

const mockPage1Response = {
  items: [mockMessage1, mockMessage2],
  hasNext: true, // Or hasMore based on API
  cursor: "cursor-1",
};

const mockPage2Response = {
  items: [mockMessage3, mockMessage4],
  hasNext: false,
  cursor: null,
};
```

---

## 📋 Test Generation Checklist

### Bug #1 Tests:

- [ ] Create/update `src/api/__tests__/messages.api.test.ts` (4 cases)
- [ ] Update `src/hooks/queries/__tests__/useMessages.test.tsx` (5 cases)
- [ ] Mock API client responses
- [ ] Verify field names match actual API

### Bug #2 Tests:

- [ ] Create `src/features/portal/components/chat/__tests__/ChatMainContainer.phase7.test.tsx`
- [ ] Implement 8 test cases
- [ ] Create mock file helpers
- [ ] Mock toast notifications
- [ ] Test both file and image inputs

### Coverage Verification:

- [ ] Run `npm run test:coverage`
- [ ] Verify 100% coverage for changed lines
- [ ] Verify all test cases pass

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                    | Lựa chọn                             | HUMAN Decision |
| --- | ------------------------- | ------------------------------------ | -------------- |
| 1   | API field names verified? | hasNext/hasMore, cursor/nextCursor?  | ⬜ **\_\_\_**  |
| 2   | Test file naming OK?      | `ChatMainContainer.phase7.test.tsx`? | ⬜ **OK?**     |
| 3   | Coverage target 100%?     | Or allow lower for bugfixes?         | ⬜ **100%?**   |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                       | Status               |
| ------------------------------ | -------------------- |
| Đã review Test Coverage Matrix | ⬜ Chưa review       |
| Đã review Test Cases           | ⬜ Chưa review       |
| Đã điền Pending Decisions      | ⬜ Chưa điền         |
| **APPROVED để generate tests** | ⬜ **CHƯA APPROVED** |

**HUMAN Signature:** [_________________]  
**Date:** [_________________]

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC code nếu "APPROVED để generate tests" = ⬜**

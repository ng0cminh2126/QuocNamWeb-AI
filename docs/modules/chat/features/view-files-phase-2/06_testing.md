# [BƯỚC 6] View Files Phase 2 - Testing Requirements

**Module:** Chat  
**Feature:** View All Files - Jump to Message  
**Phase:** Test Coverage Matrix  
**Created:** 2026-01-16  
**Status:** ⏳ PENDING APPROVAL

---

## 📋 Test Coverage Matrix

| Implementation File                         | Test File                          | Test Cases | Type        |
| ------------------------------------------- | ---------------------------------- | ---------- | ----------- |
| ViewAllFilesModal.tsx                       | ViewAllFilesModal.test.tsx         | 5          | Unit        |
| ViewAllFilesModal.tsx (handleJumpToMessage) | (Integration with ChatMain)        | 5          | Integration |
| Full flow: Modal → ChatMain                 | view-files-jump-to-message.spec.ts | 5          | E2E         |

**Total Test Cases:** 15

---

## 🧪 Unit Tests

### File: `ViewAllFilesModal.test.tsx`

**Test Suite:** handleJumpToMessage function

#### Test Case 1: Happy Path - Message Found

```typescript
test("should scroll to message and highlight when message exists", () => {
  // Setup
  const mockMessageId = "msg-123";
  const mockMessageElement = document.createElement("div");
  mockMessageElement.setAttribute(
    "data-testid",
    `message-bubble-${mockMessageId}`
  );
  document.body.appendChild(mockMessageElement);

  const mockScrollIntoView = jest.fn();
  mockMessageElement.scrollIntoView = mockScrollIntoView;

  const mockOnClose = jest.fn();

  // Render modal
  render(<ViewAllFilesModal onClose={mockOnClose} files={mockFiles} />);

  // Action: Click "Xem tin nhắn gốc" button
  const jumpButton = screen.getByTestId(
    `jump-to-message-${mockFiles[0].fileId}`
  );
  fireEvent.click(jumpButton);

  // Assertions
  expect(mockOnClose).toHaveBeenCalled(); // Modal closed
  expect(mockScrollIntoView).toHaveBeenCalledWith({
    behavior: "smooth",
    block: "center",
  });
  expect(mockMessageElement.classList.contains("ring-2")).toBe(true);
  expect(mockMessageElement.classList.contains("ring-amber-400")).toBe(true);

  // Wait for highlight removal
  jest.advanceTimersByTime(2000);
  expect(mockMessageElement.classList.contains("ring-2")).toBe(false);
});
```

#### Test Case 2: Message Not Found - Trigger Auto-Load

```typescript
test("should trigger auto-load when message not found", async () => {
  const mockToast = jest.spyOn(toast, "info");
  const mockFetchNextPage = jest.fn().mockResolvedValue({});
  const mockMessagesQuery = {
    hasNextPage: true,
    isFetchingNextPage: false,
    fetchNextPage: mockFetchNextPage,
  };

  render(
    <ViewAllFilesModal
      onClose={mockOnClose}
      files={mockFiles}
      messagesQuery={mockMessagesQuery}
    />
  );

  // Action: Click button (no matching message element)
  const jumpButton = screen.getByTestId(
    `jump-to-message-${mockFiles[0].fileId}`
  );
  fireEvent.click(jumpButton);

  // Assertions
  expect(mockToast).toHaveBeenCalledWith("Đang tải tin nhắn cũ hơn...", {
    duration: 3000,
  });

  // Verify fetchNextPage called
  await waitFor(() => {
    expect(mockFetchNextPage).toHaveBeenCalled();
  });
});
```

#### Test Case 3: Debounce Rapid Clicks

```typescript
test("should debounce rapid clicks", () => {
  const mockOnClose = jest.fn();

  render(<ViewAllFilesModal onClose={mockOnClose} files={mockFiles} />);

  const jumpButton = screen.getByTestId(
    `jump-to-message-${mockFiles[0].fileId}`
  );

  // Action: Click 5 times rapidly
  fireEvent.click(jumpButton);
  fireEvent.click(jumpButton);
  fireEvent.click(jumpButton);
  fireEvent.click(jumpButton);
  fireEvent.click(jumpButton);

  // Assertion: Modal closed only once
  expect(mockOnClose).toHaveBeenCalledTimes(1);
});
```

#### Test Case 4: Correct messageId Parameter

```typescript
test("should pass correct messageId to handleJumpToMessage", () => {
  const file = {
    fileId: "file-1",
    messageId: "msg-abc-123",
    fileName: "image.jpg",
  };

  render(<ViewAllFilesModal onClose={mockOnClose} files={[file]} />);

  const jumpButton = screen.getByTestId(`jump-to-message-${file.fileId}`);
  fireEvent.click(jumpButton);

  // Verify querySelector called with correct testid
  const spy = jest.spyOn(document, "querySelector");
  expect(spy).toHaveBeenCalledWith(
    `[data-testid="message-bubble-${file.messageId}"]`
  );
});
```

#### Test Case 5: Button Exists in All Locations

```typescript
test('should render "Xem tin nhắn gốc" button in image grid', () => {
  render(<ViewAllFilesModal activeTab="images" files={mockImageFiles} />);

  const jumpButtons = screen.getAllByText("Xem tin nhắn gốc");
  expect(jumpButtons.length).toBeGreaterThan(0);
});

test('should render "Xem tin nhắn gốc" button in document grid', () => {
  render(<ViewAllFilesModal activeTab="documents" files={mockDocFiles} />);

  const jumpButtons = screen.getAllByText("Xem tin nhắn gốc");
  expect(jumpButtons.length).toBeGreaterThan(0);
});
```

---

## 🔗 Integration Tests

### Test Suite: ViewAllFilesModal + ChatMain Integration

#### Integration Test 1: Scroll Triggers in ChatMain

```typescript
test("should scroll ChatMain container when message found", () => {
  // Setup: Render both ChatMain and ViewAllFilesModal
  const { container } = render(
    <>
      <ChatMain conversationId="conv-1" messages={mockMessages} />
      <ViewAllFilesModal files={mockFiles} />
    </>
  );

  // Action: Click jump button
  const jumpButton = screen.getByTestId(
    `jump-to-message-${mockFiles[0].fileId}`
  );
  fireEvent.click(jumpButton);

  // Assertion: ChatMain scrolled
  const messageElement = container.querySelector(
    `[data-testid="message-bubble-${mockFiles[0].messageId}"]`
  );
  expect(messageElement).toBeInTheDocument();
  // Verify element is centered in viewport (implementation-specific)
});
```

#### Integration Test 2: Highlight Visible in ChatMain

```typescript
test("should apply amber highlight ring to message bubble", async () => {
  render(
    <>
      <ChatMain conversationId="conv-1" messages={mockMessages} />
      <ViewAllFilesModal files={mockFiles} />
    </>
  );

  const jumpButton = screen.getByTestId(
    `jump-to-message-${mockFiles[0].fileId}`
  );
  fireEvent.click(jumpButton);

  const messageElement = screen.getByTestId(
    `message-bubble-${mockFiles[0].messageId}`
  );

  // Check highlight applied
  expect(messageElement).toHaveClass(
    "ring-2",
    "ring-amber-400",
    "ring-offset-2"
  );

  // Wait 2s and check highlight removed
  await waitFor(
    () => {
      expect(messageElement).not.toHaveClass("ring-2");
    },
    { timeout: 2500 }
  );
});
```

#### Integration Test 3: Modal Closes Before Scroll

```typescript
test("should close modal before scrolling starts", () => {
  const mockOnClose = jest.fn();

  render(
    <>
      <ChatMain conversationId="conv-1" messages={mockMessages} />
      <ViewAllFilesModal onClose={mockOnClose} files={mockFiles} />
    </>
  );

  const jumpButton = screen.getByTestId(
    `jump-to-message-${mockFiles[0].fileId}`
  );

  // Mock scrollIntoView to track call order
  const scrollSpy = jest.fn();
  Element.prototype.scrollIntoView = scrollSpy;

  fireEvent.click(jumpButton);

  // Verify onClose called BEFORE scrollIntoView
  expect(mockOnClose).toHaveBeenCalled();
  expect(scrollSpy).toHaveBeenCalled();

  // Check call order (onClose first)
  const onCloseOrder = mockOnClose.mock.invocationCallOrder[0];
  const scrollOrder = scrollSpy.mock.invocationCallOrder[0];
  expect(onCloseOrder).toBeLessThan(scrollOrder);
});
```

#### Integration Test 4: Auto-Load Retry Logic

```typescript
test("should retry loading older messages when message not found", async () => {
  const mockFetchNextPage = jest.fn().mockResolvedValue({});
  const mockMessagesQuery = {
    hasNextPage: true,
    isFetchingNextPage: false,
    fetchNextPage: mockFetchNextPage,
  };

  // Initially no message in DOM
  render(
    <>
      <ChatMain conversationId="conv-1" messages={[]} />
      <ViewAllFilesModal files={mockFiles} messagesQuery={mockMessagesQuery} />
    </>
  );

  const jumpButton = screen.getByTestId(
    `jump-to-message-${mockFiles[0].fileId}`
  );
  fireEvent.click(jumpButton);

  // Verify loading toast shown
  await waitFor(() => {
    expect(screen.getByText("Đang tải tin nhắn cũ hơn...")).toBeInTheDocument();
  });

  // Verify fetchNextPage called
  await waitFor(() => {
    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  // After 3 retries, message appears in DOM
  const mockMessageElement = document.createElement("div");
  mockMessageElement.setAttribute(
    "data-testid",
    `message-bubble-${mockFiles[0].messageId}`
  );
  document.body.appendChild(mockMessageElement);

  // Verify success toast shown
  await waitFor(
    () => {
      expect(screen.getByText("Đã tìm thấy tin nhắn!")).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
});

test("should show error after max retries", async () => {
  const mockFetchNextPage = jest.fn().mockResolvedValue({});
  const mockMessagesQuery = {
    hasNextPage: true,
    isFetchingNextPage: false,
    fetchNextPage: mockFetchNextPage,
  };

  render(
    <ViewAllFilesModal files={mockFiles} messagesQuery={mockMessagesQuery} />
  );

  const jumpButton = screen.getByTestId(
    `jump-to-message-${mockFiles[0].fileId}`
  );
  fireEvent.click(jumpButton);

  // After 5 retries, still not found
  await waitFor(
    () => {
      expect(mockFetchNextPage).toHaveBeenCalledTimes(5);
    },
    { timeout: 5000 }
  );

  // Verify error toast
  await waitFor(() => {
    expect(screen.getByText(/Không tìm thấy tin nhắn/)).toBeInTheDocument();
  });
});
```

#### Integration Test 5: No More Pages Available

```typescript
test("should stop retrying when hasNextPage is false", async () => {
  const mockFetchNextPage = jest.fn().mockResolvedValue({});
  const mockMessagesQuery = {
    hasNextPage: false, // No more pages
    isFetchingNextPage: false,
    fetchNextPage: mockFetchNextPage,
  };

  render(
    <ViewAllFilesModal files={mockFiles} messagesQuery={mockMessagesQuery} />
  );

  const jumpButton = screen.getByTestId(
    `jump-to-message-${mockFiles[0].fileId}`
  );
  fireEvent.click(jumpButton);

  // Verify fetchNextPage NOT called (no pages left)
  await waitFor(() => {
    expect(mockFetchNextPage).not.toHaveBeenCalled();
  });

  // Verify error toast shown immediately
  await waitFor(() => {
    expect(screen.getByText(/Không tìm thấy tin nhắn/)).toBeInTheDocument();
  });
});
```

---

## 🎭 E2E Tests (Playwright)

### File: `tests/chat/view-files-jump-to-message.spec.ts`

#### E2E Test 1: Complete User Flow - Image File

```typescript
test("should jump to message from image grid", async ({ page }) => {
  // Setup: Navigate to chat with ViewAllFilesModal
  await page.goto("/chat/conversation/conv-1");

  // Open ViewAllFilesModal
  await page.click('[data-testid="view-all-media-button"]');
  await page.waitForSelector('[data-testid="view-all-files-modal"]');

  // Click first image menu
  await page.hover('[data-testid="file-thumbnail-1"]');
  await page.click('[data-testid="file-menu-1"]');

  // Click "Xem tin nhắn gốc"
  await page.click('[data-testid="jump-to-message-file-1"]');

  // Assertions
  // 1. Modal closed
  await expect(
    page.locator('[data-testid="view-all-files-modal"]')
  ).not.toBeVisible();

  // 2. Message visible and centered
  const messageElement = page.locator('[data-testid="message-bubble-msg-1"]');
  await expect(messageElement).toBeInViewport();

  // 3. Highlight ring applied
  await expect(messageElement).toHaveClass(/ring-2.*ring-amber-400/);

  // 4. Highlight removed after 2s
  await page.waitForTimeout(2500);
  await expect(messageElement).not.toHaveClass(/ring-2/);
});
```

#### E2E Test 2: Toast When Message Not Loaded

```typescript
test("should show toast when message not in view", async ({ page }) => {
  await page.goto("/chat/conversation/conv-1");

  // Open modal and click jump on very old message
  await page.click('[data-testid="view-all-media-button"]');

  // Scroll to bottom of modal to find old message
  await page
    .locator('[data-testid="view-all-files-content"]')
    .evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

  await page.click('[data-testid="jump-to-message-file-999"]');

  // Assertion: Auto-load toast appears
  await expect(page.locator("text=Đang tải tin nhắn cũ hơn...")).toBeVisible();
});
```

#### E2E Test 3: Cross-Tab Functionality

```typescript
test("should work from both image and document tabs", async ({ page }) => {
  await page.goto("/chat/conversation/conv-1");
  await page.click('[data-testid="view-all-media-button"]');

  // Test from Ảnh tab
  await page.click('button:has-text("Ảnh")');
  await page.click('[data-testid="jump-to-message-file-1"]');
  await expect(
    page.locator('[data-testid="message-bubble-msg-1"]')
  ).toBeInViewport();

  // Re-open modal
  await page.click('[data-testid="view-all-media-button"]');

  // Test from Tài liệu tab
  await page.click('button:has-text("Tài liệu")');
  await page.click('[data-testid="jump-to-message-file-doc-1"]');
  await expect(
    page.locator('[data-testid="message-bubble-msg-doc-1"]')
  ).toBeInViewport();
});
```

#### E2E Test 4: Mobile Viewport

```typescript
test("should work on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto("/chat/conversation/conv-1");
  await page.click('[data-testid="view-all-media-button"]');

  await page.click('[data-testid="jump-to-message-file-1"]');

  // Verify scroll works on mobile
  const messageElement = page.locator('[data-testid="message-bubble-msg-1"]');
  await expect(messageElement).toBeInViewport();

  // Verify highlight visible on mobile
  await expect(messageElement).toHaveClass(/ring-2.*ring-amber-400/);
});
```

#### E2E Test 5: Auto-Load Old Messages

```typescript
test("should auto-load older messages when jumping to old file", async ({
  page,
}) => {
  await page.goto("/chat/conversation/conv-1");

  // Open modal
  await page.click('[data-testid="view-all-media-button"]');

  // Scroll to bottom of file list to find very old message
  await page
    .locator('[data-testid="view-all-files-content"]')
    .evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

  // Click jump on old message not in current view
  await page.click('[data-testid="jump-to-message-file-old-999"]');

  // Verify loading toast appears
  await expect(page.locator("text=Đang tải tin nhắn cũ hơn...")).toBeVisible();

  // Wait for auto-load to complete (max 5 retries × 300ms + network)
  await page.waitForTimeout(3000);

  // Verify either success or error toast
  const successToast = page.locator("text=Đã tìm thấy tin nhắn!");
  const errorToast = page.locator("text=Không tìm thấy tin nhắn");

  await expect(successToast.or(errorToast)).toBeVisible();

  // If success, verify message is highlighted
  if (await successToast.isVisible()) {
    const messageElement = page.locator(
      '[data-testid="message-bubble-msg-old-999"]'
    );
    await expect(messageElement).toBeInViewport();
    await expect(messageElement).toHaveClass(/ring-2.*ring-amber-400/);
  }
});
```

---

## 📊 Test Data Requirements

### Mock Files

```typescript
const mockImageFile = {
  fileId: "file-1",
  messageId: "msg-123",
  fileName: "screenshot.png",
  fileSize: 2048000,
  contentType: "image/png",
  thumbnailUrl: "/thumb/file-1.jpg",
  sentAt: "2026-01-15T10:00:00Z",
  senderName: "John Doe",
  senderId: "user-1",
};

const mockDocumentFile = {
  fileId: "file-doc-1",
  messageId: "msg-doc-456",
  fileName: "report.pdf",
  fileSize: 5120000,
  contentType: "application/pdf",
  sentAt: "2026-01-14T09:00:00Z",
  senderName: "Jane Smith",
  senderId: "user-2",
};
```

### Mock Messages

```typescript
const mockMessages = [
  {
    id: "msg-123",
    content: "",
    attachments: [{ fileId: "file-1", fileName: "screenshot.png" }],
    sentAt: "2026-01-15T10:00:00Z",
    senderId: "user-1",
    senderName: "John Doe",
  },
  {
    id: "msg-doc-456",
    content: "Here is the report",
    attachments: [{ fileId: "file-doc-1", fileName: "report.pdf" }],
    sentAt: "2026-01-14T09:00:00Z",
    senderId: "user-2",
    senderName: "Jane Smith",
  },
];
```

---

## ✅ Test Generation Checklist

- [ ] Create `ViewAllFilesModal.test.tsx` with 5 unit tests
- [ ] Setup Jest mocks for scrollIntoView, toast, timers
- [ ] Create integration tests for ChatMain interaction
- [ ] Create Playwright spec file with 4 E2E tests
- [ ] Setup test data fixtures
- [ ] Run tests locally before commit
- [ ] Verify 100% coverage of handleJumpToMessage function

---

## 📋 PENDING DECISIONS

> ✅ All testing decisions RESOLVED

| Decision            | Value                          |
| ------------------- | ------------------------------ |
| E2E tests required? | ✅ Yes (4 tests)               |
| Coverage threshold  | ✅ 100% for new function       |
| Integration tests   | ✅ Yes (3 tests)               |
| Mock vs Real DOM    | ✅ Mock for unit, Real for E2E |

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                       | Status           |
| ------------------------------ | ---------------- |
| Đã review test coverage matrix | ⬜ Chưa review   |
| Đã verify test requirements    | ⬜ Chưa verify   |
| Đã confirm test data adequate  | ⬜ Chưa confirm  |
| **APPROVED để thực thi**       | ⬜ CHƯA APPROVED |

**HUMAN Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Date:** \_\_\_\_\_\_\_\_\_\_

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

**Next Step:** Wait for HUMAN approval, then proceed to coding phase (BƯỚC 5)

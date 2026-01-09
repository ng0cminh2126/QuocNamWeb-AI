# [BƯỚC 6] Testing Requirements - Image Message Display with Preview

> **Module:** Chat  
> **Feature:** Image Message Display  
> **Document Type:** Test Requirements & Coverage  
> **Status:** ⏳ PENDING - Chờ HUMAN approval  
> **Created:** 2026-01-08  
> **Test Count:** 11 unit tests + 6 manual scenarios

---

## 📋 Overview

Document này định nghĩa test requirements cho Image Message Display feature trước khi implementation bắt đầu.

**Test Strategy:**

- ✅ **Test-first approach** - Define test cases before coding
- ✅ **Comprehensive coverage** - Unit + Integration + Manual tests
- ✅ **Mock external dependencies** - API, Intersection Observer, Blob URLs
- ✅ **Behavior-driven** - Test user-facing behaviors, not implementation details

---

## 📊 Test Coverage Matrix

Bảng mapping giữa implementation files và test files:

| Implementation File                                   | Test File                                            | Test Cases | Coverage Required |
| ----------------------------------------------------- | ---------------------------------------------------- | ---------- | ----------------- |
| `src/api/files.api.ts`                                | `src/api/__tests__/files.api.test.ts`                | 4          | ≥90%              |
| `src/features/portal/workspace/MessageImage.tsx`      | `src/features/portal/workspace/MessageImage.test.ts` | 5          | ≥80%              |
| `src/components/sheet/ImagePreviewModal.tsx`          | `src/components/sheet/ImagePreviewModal.test.ts`     | 6          | ≥80%              |
| `src/features/portal/workspace/MessageAttachment.tsx` | (Update existing tests)                              | 2 (new)    | ≥80%              |

**Total Test Cases:** 11 unit tests + 6 manual test scenarios

**Coverage Target:**

- Overall: ≥80%
- Critical paths (API, lazy load): ≥90%

---

## 🧪 Unit Test Requirements

### 1. API Client Tests (`files.api.test.ts`)

**File:** `src/api/__tests__/files.api.test.ts`  
**Test Count:** 4 cases  
**Coverage Target:** ≥90%

#### Test Case 1.1: Thumbnail Success

```typescript
describe("getImageThumbnail", () => {
  it("should fetch thumbnail with correct endpoint and params", async () => {
    // GIVEN: Mock API returns blob
    const mockBlob = new Blob(["fake-image"], { type: "image/jpeg" });
    mockAxios.get.mockResolvedValueOnce({ data: mockBlob });

    // WHEN: Call API with fileId and size
    const result = await getImageThumbnail("file-123", "large");

    // THEN: Correct endpoint called
    expect(mockAxios.get).toHaveBeenCalledWith(
      "/api/Files/file-123/watermarked-thumbnail",
      {
        params: { size: "large" },
        responseType: "blob",
        timeout: 30000,
      }
    );

    // AND: Returns blob
    expect(result).toBe(mockBlob);
  });
});
```

**Coverage:**

- ✅ Endpoint construction correct
- ✅ Query params sent (size parameter)
- ✅ Response type is blob
- ✅ Timeout configured (30s)
- ✅ Returns blob data

---

#### Test Case 1.2: Thumbnail Default Size

```typescript
it("should use default size when not provided", async () => {
  // GIVEN: No size param provided
  const mockBlob = new Blob(["fake-image"], { type: "image/jpeg" });
  mockAxios.get.mockResolvedValueOnce({ data: mockBlob });

  // WHEN: Call without size
  await getImageThumbnail("file-123");

  // THEN: Default size 'large' used
  expect(mockAxios.get).toHaveBeenCalledWith(
    "/api/Files/file-123/watermarked-thumbnail",
    expect.objectContaining({
      params: { size: "large" },
    })
  );
});
```

**Coverage:**

- ✅ Default parameter handling
- ✅ Size defaults to 'large'

---

#### Test Case 1.3: API Timeout

```typescript
it("should handle timeout errors", async () => {
  // GIVEN: API times out
  mockAxios.get.mockRejectedValueOnce({
    code: "ECONNABORTED",
    message: "timeout of 30000ms exceeded",
  });

  // WHEN: Call API
  // THEN: Throws timeout error
  await expect(getImageThumbnail("file-123")).rejects.toThrow(
    "timeout of 30000ms exceeded"
  );
});
```

**Coverage:**

- ✅ Timeout error handling
- ✅ Error propagates correctly

---

#### Test Case 1.4: API Error (404)

```typescript
it("should handle 404 errors", async () => {
  // GIVEN: File not found
  mockAxios.get.mockRejectedValueOnce({
    response: { status: 404, data: { message: "File not found" } },
  });

  // WHEN: Call API
  // THEN: Throws 404 error
  await expect(getImageThumbnail("file-999")).rejects.toMatchObject({
    response: { status: 404 },
  });
});
```

**Coverage:**

- ✅ HTTP error handling (404)
- ✅ Error object structure preserved

---

#### Test Case 1.5: Preview API Success

```typescript
describe("getImagePreview", () => {
  it("should fetch preview with correct endpoint", async () => {
    // GIVEN: Mock API returns blob
    const mockBlob = new Blob(["fake-preview"], { type: "image/png" });
    mockAxios.get.mockResolvedValueOnce({ data: mockBlob });

    // WHEN: Call preview API
    const result = await getImagePreview("file-123");

    // THEN: Correct endpoint called
    expect(mockAxios.get).toHaveBeenCalledWith("/api/Files/file-123/preview", {
      responseType: "blob",
      timeout: 30000,
    });

    // AND: Returns blob
    expect(result).toBe(mockBlob);
  });
});
```

**Coverage:**

- ✅ Preview endpoint correct
- ✅ No query params (different from thumbnail)
- ✅ Same timeout and blob response

---

### 2. MessageImage Component Tests (`MessageImage.test.ts`)

**File:** `src/features/portal/workspace/MessageImage.test.ts`  
**Test Count:** 5 cases  
**Coverage Target:** ≥80%

#### Test Case 2.1: Lazy Load - Only Fetch When Visible

```typescript
describe("MessageImage - Lazy Loading", () => {
  it("should only fetch thumbnail when component becomes visible", async () => {
    // GIVEN: Mock Intersection Observer
    let observerCallback: IntersectionObserverCallback;
    global.IntersectionObserver = jest.fn((callback) => {
      observerCallback = callback;
      return {
        observe: jest.fn(),
        disconnect: jest.fn(),
        unobserve: jest.fn(),
      };
    });

    // AND: Mock API
    const mockBlob = new Blob(["image"], { type: "image/jpeg" });
    (getImageThumbnail as jest.Mock).mockResolvedValueOnce(mockBlob);

    // WHEN: Render component
    const { container } = render(
      <MessageImage
        fileId="123"
        fileName="test.jpg"
        onPreviewClick={jest.fn()}
      />
    );

    // THEN: Initially, API not called (not visible yet)
    expect(getImageThumbnail).not.toHaveBeenCalled();

    // WHEN: Observer triggers (component visible)
    act(() => {
      observerCallback!([{ isIntersecting: true }] as any, {} as any);
    });

    // THEN: API called with correct params
    await waitFor(() => {
      expect(getImageThumbnail).toHaveBeenCalledWith("123", "large");
    });
  });
});
```

**Coverage:**

- ✅ Intersection Observer setup
- ✅ No API call until visible
- ✅ API triggered when visible
- ✅ Observer disconnects after trigger

---

#### Test Case 2.2: Loading State

```typescript
it("should show skeleton loader while loading", () => {
  // GIVEN: API is pending
  (getImageThumbnail as jest.Mock).mockImplementation(
    () => new Promise(() => {}) // Never resolves
  );

  // WHEN: Render and trigger visibility
  const { getByTestId } = render(
    <MessageImage fileId="123" fileName="test.jpg" onPreviewClick={jest.fn()} />
  );

  triggerVisibility(); // Helper to trigger observer

  // THEN: Shows loading skeleton
  expect(getByTestId("image-skeleton-loader")).toBeInTheDocument();
});
```

**Coverage:**

- ✅ Loading state renders correctly
- ✅ Skeleton loader displayed

---

#### Test Case 2.3: Success State - Display Image

```typescript
it("should display image when loaded successfully", async () => {
  // GIVEN: API returns blob
  const mockBlob = new Blob(["image"], { type: "image/jpeg" });
  (getImageThumbnail as jest.Mock).mockResolvedValueOnce(mockBlob);
  URL.createObjectURL = jest.fn(() => "blob:mock-url-123");

  // WHEN: Render and trigger
  const { getByTestId } = render(
    <MessageImage fileId="123" fileName="test.jpg" onPreviewClick={jest.fn()} />
  );

  triggerVisibility();

  // THEN: Image rendered with blob URL
  await waitFor(() => {
    const img = getByTestId("message-image") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("blob:mock-url-123");
  });

  // AND: Blob URL created
  expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
});
```

**Coverage:**

- ✅ Success state renders image
- ✅ Blob URL creation
- ✅ Image src attribute correct

---

#### Test Case 2.4: Error State - Display Placeholder

```typescript
it("should display error placeholder when API fails", async () => {
  // GIVEN: API fails
  (getImageThumbnail as jest.Mock).mockRejectedValueOnce(
    new Error("Network error")
  );

  // WHEN: Render and trigger
  const { getByTestId } = render(
    <MessageImage fileId="123" fileName="test.jpg" onPreviewClick={jest.fn()} />
  );

  triggerVisibility();

  // THEN: Error placeholder shown
  await waitFor(() => {
    expect(getByTestId("image-error-placeholder")).toBeInTheDocument();
  });
});
```

**Coverage:**

- ✅ Error state renders placeholder
- ✅ Error handling correct

---

#### Test Case 2.5: Click Handler - Open Preview

```typescript
it("should call onPreviewClick when image is clicked", async () => {
  // GIVEN: Image loaded successfully
  const mockBlob = new Blob(["image"], { type: "image/jpeg" });
  (getImageThumbnail as jest.Mock).mockResolvedValueOnce(mockBlob);
  URL.createObjectURL = jest.fn(() => "blob:mock-url");

  const onPreviewClick = jest.fn();

  // WHEN: Render
  const { getByTestId } = render(
    <MessageImage
      fileId="123"
      fileName="test.jpg"
      onPreviewClick={onPreviewClick}
    />
  );

  triggerVisibility();

  // THEN: Image rendered
  await waitFor(() => {
    expect(getByTestId("message-image")).toBeInTheDocument();
  });

  // WHEN: Click image
  fireEvent.click(getByTestId("message-image"));

  // THEN: Callback called with fileId
  expect(onPreviewClick).toHaveBeenCalledWith("123");
});
```

**Coverage:**

- ✅ Click event handler
- ✅ Callback invoked with correct fileId

---

### 3. ImagePreviewModal Component Tests (`ImagePreviewModal.test.ts`)

**File:** `src/components/sheet/ImagePreviewModal.test.ts`  
**Test Count:** 6 cases  
**Coverage Target:** ≥80%

#### Test Case 3.1: Modal Rendering

```typescript
describe("ImagePreviewModal", () => {
  it("should render modal when fileId is provided", () => {
    // GIVEN: fileId is not null
    const { getByTestId } = render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={jest.fn()} />
    );

    // THEN: Modal is visible
    expect(getByTestId("image-preview-modal")).toBeInTheDocument();
  });

  it("should not render when fileId is null", () => {
    // GIVEN: fileId is null (closed state)
    const { queryByTestId } = render(
      <ImagePreviewModal
        fileId={null}
        fileName="test.jpg"
        onClose={jest.fn()}
      />
    );

    // THEN: Modal not in DOM
    expect(queryByTestId("image-preview-modal")).not.toBeInTheDocument();
  });
});
```

**Coverage:**

- ✅ Render when open (fileId provided)
- ✅ Not render when closed (fileId null)

---

#### Test Case 3.2: Loading State

```typescript
it("should show spinner while loading preview", () => {
  // GIVEN: API is pending
  (getImagePreview as jest.Mock).mockImplementation(
    () => new Promise(() => {}) // Never resolves
  );

  // WHEN: Render modal
  const { getByTestId } = render(
    <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={jest.fn()} />
  );

  // THEN: Shows loading spinner
  expect(getByTestId("preview-loading-spinner")).toBeInTheDocument();
});
```

**Coverage:**

- ✅ Loading state displays spinner
- ✅ API called on mount

---

#### Test Case 3.3: Success State - Display Preview

```typescript
it("should display preview image when loaded", async () => {
  // GIVEN: API returns blob
  const mockBlob = new Blob(["preview"], { type: "image/png" });
  (getImagePreview as jest.Mock).mockResolvedValueOnce(mockBlob);
  URL.createObjectURL = jest.fn(() => "blob:preview-url");

  // WHEN: Render modal
  const { getByTestId } = render(
    <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={jest.fn()} />
  );

  // THEN: Preview image rendered
  await waitFor(() => {
    const img = getByTestId("preview-image") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("blob:preview-url");
  });
});
```

**Coverage:**

- ✅ Success state renders preview
- ✅ Blob URL created from API response

---

#### Test Case 3.4: Error State - Retry Button

```typescript
it("should show error and retry button when API fails", async () => {
  // GIVEN: API fails
  (getImagePreview as jest.Mock).mockRejectedValueOnce(
    new Error("Network error")
  );

  // WHEN: Render modal
  const { getByTestId } = render(
    <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={jest.fn()} />
  );

  // THEN: Error state shown
  await waitFor(() => {
    expect(getByTestId("preview-error-state")).toBeInTheDocument();
    expect(getByTestId("preview-retry-button")).toBeInTheDocument();
  });

  // WHEN: Click retry
  (getImagePreview as jest.Mock).mockResolvedValueOnce(
    new Blob(["preview"], { type: "image/png" })
  );
  fireEvent.click(getByTestId("preview-retry-button"));

  // THEN: API called again
  expect(getImagePreview).toHaveBeenCalledTimes(2);
});
```

**Coverage:**

- ✅ Error state displays correctly
- ✅ Retry button functionality

---

#### Test Case 3.5: Close Handlers

```typescript
describe("Close handlers", () => {
  it("should close on close button click", () => {
    // GIVEN: Modal is open
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={onClose} />
    );

    // WHEN: Click close button
    fireEvent.click(getByTestId("modal-close-button"));

    // THEN: onClose called
    expect(onClose).toHaveBeenCalled();
  });

  it("should close on ESC key press", () => {
    // GIVEN: Modal is open
    const onClose = jest.fn();
    render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={onClose} />
    );

    // WHEN: Press ESC
    fireEvent.keyDown(window, { key: "Escape" });

    // THEN: onClose called
    expect(onClose).toHaveBeenCalled();
  });

  it("should close on backdrop click", () => {
    // GIVEN: Modal is open
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={onClose} />
    );

    // WHEN: Click backdrop
    fireEvent.click(getByTestId("modal-overlay"));

    // THEN: onClose called
    expect(onClose).toHaveBeenCalled();
  });
});
```

**Coverage:**

- ✅ Close button works
- ✅ ESC key works
- ✅ Backdrop click works

---

#### Test Case 3.6: Blob URL Cleanup

```typescript
it("should revoke blob URL on unmount", async () => {
  // GIVEN: Preview loaded with blob URL
  const mockBlob = new Blob(["preview"], { type: "image/png" });
  (getImagePreview as jest.Mock).mockResolvedValueOnce(mockBlob);
  URL.createObjectURL = jest.fn(() => "blob:preview-url");
  URL.revokeObjectURL = jest.fn();

  // WHEN: Render modal
  const { unmount } = render(
    <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={jest.fn()} />
  );

  await waitFor(() => {
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  // WHEN: Unmount component
  unmount();

  // THEN: Blob URL revoked
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-url");
});
```

**Coverage:**

- ✅ Cleanup on unmount
- ✅ Memory leak prevention

---

### 4. MessageAttachment Integration Tests

**File:** `src/features/portal/workspace/__tests__/MessageAttachment.test.ts` (update existing)  
**New Test Cases:** 2

#### Test Case 4.1: Image Type Routing

```typescript
it("should render MessageImage for image attachments", () => {
  // GIVEN: Image attachment
  const attachment = {
    id: "123",
    fileName: "photo.jpg",
    contentType: "image/jpeg",
    fileSize: 12345,
  };

  // WHEN: Render
  const { getByTestId } = render(<MessageAttachment attachment={attachment} />);

  // THEN: MessageImage rendered (not file icon)
  expect(getByTestId("message-image-container")).toBeInTheDocument();
});
```

---

#### Test Case 4.2: Non-Image Type Routing

```typescript
it("should render file icon for non-image attachments", () => {
  // GIVEN: PDF attachment
  const attachment = {
    id: "456",
    fileName: "document.pdf",
    contentType: "application/pdf",
    fileSize: 54321,
  };

  // WHEN: Render
  const { getByTestId } = render(<MessageAttachment attachment={attachment} />);

  // THEN: File icon rendered (not MessageImage)
  expect(getByTestId("file-attachment-icon")).toBeInTheDocument();
  expect(getByTestId("file-attachment-name")).toHaveTextContent("document.pdf");
});
```

---

## 🧪 Test Data & Mocks

### Mock Intersection Observer

```typescript
// test/setup.ts hoặc mỗi test file
global.IntersectionObserver = class IntersectionObserver {
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {}

  observe() {
    // Auto-trigger for tests
    this.callback(
      [
        { isIntersecting: true, target: {} as Element },
      ] as IntersectionObserverEntry[],
      this as any
    );
  }

  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
};
```

### Mock Blob URLs

```typescript
// test/setup.ts
global.URL.createObjectURL = jest.fn(
  (blob: Blob) => `blob:mock-url-${Date.now()}`
);
global.URL.revokeObjectURL = jest.fn();
```

### Mock API Responses

```typescript
// Mock successful thumbnail
const mockThumbnailBlob = new Blob(["fake-thumbnail"], { type: "image/jpeg" });

// Mock successful preview
const mockPreviewBlob = new Blob(["fake-preview"], { type: "image/png" });

// Mock error response
const mock404Error = {
  response: {
    status: 404,
    data: { message: "File not found" },
  },
};
```

---

## 📋 Manual Test Scenarios

### Scenario 1: Happy Path - Upload to Preview

**Steps:**

1. Upload image file (JPEG) trong chat
2. Verify thumbnail hiển thị với watermark
3. Click vào thumbnail
4. Verify preview modal mở
5. Verify full-size image hiển thị với watermark
6. Click close button hoặc press ESC
7. Verify modal đóng

**Expected Results:**

- ✅ Thumbnail loads trong <400ms
- ✅ Watermark visible on thumbnail
- ✅ Modal opens smoothly
- ✅ Preview loads trong <1s
- ✅ Watermark visible on preview
- ✅ Close methods work

---

### Scenario 2: Error Handling - Deleted File

**Steps:**

1. Có message với image attachment
2. Delete file từ backend (hoặc mock 404)
3. Scroll đến message
4. Verify error placeholder hiển thị
5. Click vào error placeholder
6. Verify modal mở với error state
7. Click retry button
8. Verify retry attempt

**Expected Results:**

- ✅ Error placeholder renders thay vì ảnh
- ✅ Modal opens despite error
- ✅ Error message clear và actionable
- ✅ Retry button functional

---

### Scenario 3: Performance - Lazy Loading

**Steps:**

1. Có conversation với 20+ images
2. Scroll nhanh từ top → bottom
3. Monitor network tab
4. Verify chỉ visible images được load
5. Scroll back up
6. Verify already-loaded images không fetch lại

**Expected Results:**

- ✅ Chỉ ~5-7 images load tại 1 thời điểm (viewport dependent)
- ✅ No redundant API calls
- ✅ Scroll mượt mà (no jank)
- ✅ Loaded images cached

---

### Scenario 4: File Type Detection

**Steps:**

1. Upload PDF file → verify file icon (not image)
2. Upload JPEG → verify image display
3. Upload PNG → verify image display
4. Upload Word doc → verify file icon
5. Upload unknown type → verify file icon

**Expected Results:**

- ✅ Image types (JPEG, PNG, GIF, WebP) → MessageImage
- ✅ Non-image types → File icon
- ✅ Correct routing logic

---

### Scenario 5: Mobile - Touch Interactions

**Steps:**

1. Open chat trên mobile device (hoặc Chrome DevTools mobile mode)
2. Tap vào image message
3. Verify modal mở full-screen
4. Tap backdrop
5. Verify modal đóng
6. Repeat với pinch gesture (if supported - Phase 3)

**Expected Results:**

- ✅ Tap opens modal
- ✅ Modal fills screen
- ✅ Tap backdrop closes modal
- ✅ No scroll issues behind modal

---

### Scenario 6: Keyboard Navigation

**Steps:**

1. Tab navigate đến image message
2. Press Enter hoặc Space
3. Verify modal mở
4. Press ESC
5. Verify modal đóng

**Expected Results:**

- ✅ Image focusable
- ✅ Enter/Space opens modal
- ✅ ESC closes modal
- ✅ Focus management correct

---

## 🎯 Test Generation Checklist

Khi implement tests, AI PHẢI đảm bảo:

### API Tests

- ✅ Mock axios với `jest.mock('@/lib/axios')`
- ✅ Test cả success và error cases
- ✅ Verify endpoint URLs chính xác
- ✅ Verify params sent correctly
- ✅ Verify timeout configured (30s)
- ✅ Test blob response type

### Component Tests

- ✅ Mock Intersection Observer
- ✅ Mock URL.createObjectURL / revokeObjectURL
- ✅ Mock API imports
- ✅ Use `data-testid` để query elements
- ✅ Test all 3 states: loading, success, error
- ✅ Test user interactions (click, keyboard)
- ✅ Test cleanup (useEffect return)

### Accessibility Tests

- ✅ Verify alt text on images
- ✅ Verify ARIA labels on buttons
- ✅ Verify keyboard navigation
- ✅ Verify focus management trong modal

### Integration Tests

- ✅ Test file type routing logic
- ✅ Test modal open/close flow
- ✅ Test lazy load end-to-end

---

## 📊 Coverage Targets

### Overall Coverage

- **Statements:** ≥80%
- **Branches:** ≥80%
- **Functions:** ≥85%
- **Lines:** ≥80%

### Critical Path Coverage (Must be ≥90%)

- `getImageThumbnail()` function
- `getImagePreview()` function
- Intersection Observer logic
- Blob URL creation/cleanup
- Modal open/close logic

### Non-Critical (Can be <80%)

- Error message text formatting
- Console.log statements (dev-only)
- Type guards (TypeScript compile-time safe)

---

## 📋 IMPACT SUMMARY

### Test Files sẽ tạo mới:

- `src/api/__tests__/files.api.test.ts` - 4 test cases

  - Thumbnail success, params, timeout, 404 error
  - Mock axios, blob responses

- `src/features/portal/workspace/MessageImage.test.ts` - 5 test cases

  - Lazy load, loading state, success, error, click
  - Mock Intersection Observer, URL APIs

- `src/components/sheet/ImagePreviewModal.test.ts` - 6 test cases
  - Render, loading, success, error, close handlers, cleanup
  - Mock Radix Dialog, blob URLs

### Test Files sẽ sửa đổi:

- `src/features/portal/workspace/__tests__/MessageAttachment.test.ts` (nếu có)
  - Thêm 2 test cases: image routing, non-image routing

### Test Setup Files:

- `test/setup.ts` (hoặc vitest.setup.ts)
  - Global mocks: IntersectionObserver, URL.createObjectURL
  - Test utilities: triggerVisibility(), mockBlob()

### Dependencies cần thêm:

- (không có - tất cả testing libs đã installed)
  - vitest ✅
  - @testing-library/react ✅
  - @testing-library/user-event ✅

---

## ⏳ PENDING DECISIONS

| #   | Vấn đề                         | Lựa chọn                            | HUMAN Decision      |
| --- | ------------------------------ | ----------------------------------- | ------------------- |
| 1   | Intersection Observer mock     | Auto-trigger hoặc manual control?   | ✅ **Auto-trigger** |
| 2   | Coverage threshold enforcement | Fail CI nếu <80% hoặc warning only? | ✅ **Warning only** |
| 3   | E2E tests với Playwright       | Thêm E2E tests hoặc manual only?    | ✅ **Manual only**  |
| 4   | Visual regression tests        | Screenshot tests hoặc skip?         | ✅ **Skip**         |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ✅ HUMAN CONFIRMATION

| Hạng mục                            | Status |
| ----------------------------------- | ------ |
| Đã review Test Coverage Matrix      | ✅     |
| Đã review Unit Test Cases (11)      | ✅     |
| Đã review Manual Test Scenarios (6) | ✅     |
| Đã review Mock Strategy             | ✅     |
| Đã điền Pending Decisions           | ✅     |
| **APPROVED để thực thi**            | ✅     |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-08

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

## 📚 References

- **Requirements:** [01_requirements.md](./01_requirements.md)
- **Implementation Plan:** [04_implementation-plan.md](./04_implementation-plan.md)
- **Testing Strategy Guide:** [../../../guides/testing_strategy_20251226_claude_opus_4_5.md](../../../guides/testing_strategy_20251226_claude_opus_4_5.md)
- **Test Requirements Workflow:** [../../../guides/TEST_REQUIREMENTS_WORKFLOW.md](../../../guides/TEST_REQUIREMENTS_WORKFLOW.md)

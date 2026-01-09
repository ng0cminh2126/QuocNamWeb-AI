# [BƯỚC 6] Phase 3 Testing Requirements: File Preview Modal

> **Module:** Chat  
> **Feature:** File Preview Modal  
> **Version:** 3.0  
> **Status:** ✅ APPROVED - Ready for implementation  
> **Created:** 2026-01-08  
> **Dependencies:**
>
> - [01_requirements.md](./01_requirements.md) ✅ APPROVED
> - [02a_wireframe.md](./02a_wireframe.md) ⏳ PENDING
> - [02b_flow.md](./02b_flow.md) ⏳ PENDING

---

## 📋 Overview

Test requirements chi tiết cho File Preview Modal, bao gồm:

- Test coverage matrix (implementation → test mapping)
- Detailed test cases per file
- Test data & mocks requirements
- Test generation checklist

**Test Strategy:** Test Requirements First (BƯỚC 6) → Code + Tests (BƯỚC 5)

---

## 🗺️ Test Coverage Matrix

| Implementation File                   | Test File                    | Test Cases   | Priority |
| ------------------------------------- | ---------------------------- | ------------ | -------- |
| `src/components/FilePreviewModal.tsx` | `FilePreviewModal.test.tsx`  | 8 cases      | HIGH     |
| `src/hooks/usePdfPreview.ts`          | `usePdfPreview.test.tsx`     | 7 cases      | HIGH     |
| `src/api/filePreview.api.ts`          | `filePreview.api.test.ts`    | 6 cases      | HIGH     |
| `src/types/filePreview.ts`            | (No tests - types only)      | 0 cases      | -        |
| `ChatMainContainer.tsx` (integration) | `ChatMainContainer.test.tsx` | 3 cases      | MEDIUM   |
| **TOTAL**                             |                              | **24 cases** |          |

---

## 🧪 Test Case Details

### 1. FilePreviewModal.tsx Tests

**File:** `src/components/__tests__/FilePreviewModal.test.tsx`

#### TC-FM-001: Renders modal with file ID

```typescript
describe("FilePreviewModal", () => {
  it("should render modal when open with file info", () => {
    // GIVEN
    const mockFile = {
      id: "file-123",
      fileName: "document.pdf",
    };

    // WHEN
    render(
      <FilePreviewModal
        isOpen={true}
        fileId={mockFile.id}
        fileName={mockFile.fileName}
        onClose={mockOnClose}
      />
    );

    // THEN
    expect(screen.getByTestId("file-preview-modal")).toBeInTheDocument();
    expect(screen.getByText("document.pdf")).toBeInTheDocument();
    expect(
      screen.getByTestId("file-preview-modal-close-button")
    ).toBeInTheDocument();
  });
});
```

#### TC-FM-002: Calls preview API on mount

```typescript
it("should fetch first page on mount", async () => {
  // GIVEN
  const mockPreviewResponse = {
    data: new Blob(["mock-image"]),
    headers: {
      "x-total-pages": "5",
      "x-current-page": "1",
    },
  };
  mockApiClient.get.mockResolvedValueOnce(mockPreviewResponse);

  // WHEN
  render(<FilePreviewModal isOpen={true} fileId="file-123" />);

  // THEN
  await waitFor(() => {
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/api/Files/file-123/preview",
      expect.objectContaining({
        responseType: "blob",
      })
    );
  });
});
```

#### TC-FM-003: Displays page indicator correctly

```typescript
it("should display page indicator with correct values", async () => {
  // GIVEN
  mockUsePdfPreview.mockReturnValue({
    totalPages: 5,
    currentPage: 2,
    imageUrl: "blob:mock-url",
    isLoading: false,
    error: null,
  });

  // WHEN
  render(<FilePreviewModal isOpen={true} fileId="file-123" />);

  // THEN
  expect(screen.getByTestId("file-preview-page-indicator")).toHaveTextContent(
    "Page 2 of 5"
  );
});
```

#### TC-FM-004: Next/Prev navigation works

```typescript
it("should navigate to next page when Next button clicked", async () => {
  // GIVEN
  const mockNavigate = vi.fn();
  mockUsePdfPreview.mockReturnValue({
    totalPages: 5,
    currentPage: 2,
    navigateToPage: mockNavigate,
    isLoading: false,
  });

  // WHEN
  render(<FilePreviewModal isOpen={true} fileId="file-123" />);
  const nextButton = screen.getByTestId("file-preview-next-button");
  await userEvent.click(nextButton);

  // THEN
  expect(mockNavigate).toHaveBeenCalledWith(3);
});

it("should navigate to previous page when Prev button clicked", async () => {
  // GIVEN
  const mockNavigate = vi.fn();
  mockUsePdfPreview.mockReturnValue({
    totalPages: 5,
    currentPage: 3,
    navigateToPage: mockNavigate,
    isLoading: false,
  });

  // WHEN
  render(<FilePreviewModal isOpen={true} fileId="file-123" />);
  const prevButton = screen.getByTestId("file-preview-prev-button");
  await userEvent.click(prevButton);

  // THEN
  expect(mockNavigate).toHaveBeenCalledWith(2);
});
```

#### TC-FM-005: Close button closes modal

```typescript
it("should call onClose when close button clicked", async () => {
  // GIVEN
  const mockOnClose = vi.fn();

  // WHEN
  render(<FilePreviewModal isOpen={true} onClose={mockOnClose} />);
  const closeButton = screen.getByTestId("file-preview-modal-close-button");
  await userEvent.click(closeButton);

  // THEN
  expect(mockOnClose).toHaveBeenCalledTimes(1);
});
```

#### TC-FM-006: ESC key closes modal

```typescript
it("should call onClose when ESC key pressed", async () => {
  // GIVEN
  const mockOnClose = vi.fn();

  // WHEN
  render(<FilePreviewModal isOpen={true} onClose={mockOnClose} />);
  await userEvent.keyboard("{Escape}");

  // THEN
  expect(mockOnClose).toHaveBeenCalledTimes(1);
});
```

#### TC-FM-007: Handles API errors

```typescript
it("should display error state when API fails", async () => {
  // GIVEN
  mockUsePdfPreview.mockReturnValue({
    error: new Error("File not found"),
    isLoading: false,
    totalPages: 0,
  });

  // WHEN
  render(<FilePreviewModal isOpen={true} fileId="file-123" />);

  // THEN
  expect(
    screen.getByText(/kh\u00f4ng t\u00ecm th\u1ea5y t\u1ec7p/i)
  ).toBeInTheDocument();
  expect(
    screen.getByTestId("file-preview-error-retry-button")
  ).toBeInTheDocument();
});
```

#### TC-FM-008: Disables buttons at boundaries

```typescript
it("should disable Prev button on first page", () => {
  // GIVEN
  mockUsePdfPreview.mockReturnValue({
    totalPages: 5,
    currentPage: 1,
    isLoading: false,
  });

  // WHEN
  render(<FilePreviewModal isOpen={true} fileId="file-123" />);

  // THEN
  const prevButton = screen.getByTestId("file-preview-prev-button");
  expect(prevButton).toBeDisabled();
});

it("should disable Next button on last page", () => {
  // GIVEN
  mockUsePdfPreview.mockReturnValue({
    totalPages: 5,
    currentPage: 5,
    isLoading: false,
  });

  // WHEN
  render(<FilePreviewModal isOpen={true} fileId="file-123" />);

  // THEN
  const nextButton = screen.getByTestId("file-preview-next-button");
  expect(nextButton).toBeDisabled();
});
```

---

### 2. usePdfPreview.ts Hook Tests

**File:** `src/hooks/__tests__/usePdfPreview.test.tsx`

#### TC-PH-001: Fetches first page from /preview

```typescript
describe("usePdfPreview", () => {
  it("should fetch first page from preview endpoint", async () => {
    // GIVEN
    const mockBlob = new Blob(["image-data"]);
    mockPreviewApi.mockResolvedValueOnce({
      data: mockBlob,
      headers: {
        "x-total-pages": "3",
        "x-current-page": "1",
      },
    });

    // WHEN
    const { result } = renderHook(() => usePdfPreview("file-123"));

    // THEN
    await waitFor(() => {
      expect(result.current.totalPages).toBe(3);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.imageUrl).toMatch(/^blob:/);
    });
  });
});
```

#### TC-PH-002: Parses X-Total-Pages header

```typescript
it("should parse total pages from response header", async () => {
  // GIVEN
  mockPreviewApi.mockResolvedValueOnce({
    data: new Blob(),
    headers: { "x-total-pages": "10" },
  });

  // WHEN
  const { result } = renderHook(() => usePdfPreview("file-123"));

  // THEN
  await waitFor(() => {
    expect(result.current.totalPages).toBe(10);
  });
});

it("should default to 1 page if header missing", async () => {
  // GIVEN
  mockPreviewApi.mockResolvedValueOnce({
    data: new Blob(),
    headers: {}, // No X-Total-Pages
  });

  // WHEN
  const { result } = renderHook(() => usePdfPreview("file-123"));

  // THEN
  await waitFor(() => {
    expect(result.current.totalPages).toBe(1);
  });
});
```

#### TC-PH-003: Fetches subsequent pages from /render

```typescript
it("should fetch page 2+ from render endpoint", async () => {
  // GIVEN
  mockPreviewApi.mockResolvedValueOnce({
    data: new Blob(),
    headers: { "x-total-pages": "5" },
  });
  mockRenderPageApi.mockResolvedValueOnce({
    data: new Blob(["page-2-data"]),
  });

  // WHEN
  const { result } = renderHook(() => usePdfPreview("file-123"));

  await waitFor(() => {
    expect(result.current.currentPage).toBe(1);
  });

  act(() => {
    result.current.navigateToPage(2);
  });

  // THEN
  await waitFor(() => {
    expect(mockRenderPageApi).toHaveBeenCalledWith(
      "file-123",
      2,
      300 // dpi
    );
    expect(result.current.currentPage).toBe(2);
  });
});
```

#### TC-PH-004: Caches rendered pages

```typescript
it("should cache pages and not refetch", async () => {
  // GIVEN
  mockPreviewApi.mockResolvedValueOnce({
    data: new Blob(["page-1"]),
    headers: { "x-total-pages": "3" },
  });
  mockRenderPageApi.mockResolvedValueOnce({
    data: new Blob(["page-2"]),
  });

  // WHEN
  const { result } = renderHook(() => usePdfPreview("file-123"));

  await waitFor(() => {
    expect(result.current.currentPage).toBe(1);
  });

  // Navigate to page 2
  act(() => result.current.navigateToPage(2));
  await waitFor(() => {
    expect(result.current.currentPage).toBe(2);
  });

  // Navigate back to page 1
  act(() => result.current.navigateToPage(1));

  // THEN - Should use cache, not call API again
  await waitFor(() => {
    expect(result.current.currentPage).toBe(1);
  });
  expect(mockPreviewApi).toHaveBeenCalledTimes(1); // Only initial call
});
```

#### TC-PH-005: Handles loading states

```typescript
it("should set loading state during fetch", async () => {
  // GIVEN
  let resolvePromise;
  mockPreviewApi.mockReturnValueOnce(
    new Promise((resolve) => {
      resolvePromise = resolve;
    })
  );

  // WHEN
  const { result } = renderHook(() => usePdfPreview("file-123"));

  // THEN - Initially loading
  expect(result.current.isLoading).toBe(true);

  // Resolve promise
  act(() => {
    resolvePromise({
      data: new Blob(),
      headers: { "x-total-pages": "1" },
    });
  });

  // THEN - Not loading after resolve
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});
```

#### TC-PH-006: Handles error states

```typescript
it("should set error state on API failure", async () => {
  // GIVEN
  const mockError = new Error("Network error");
  mockPreviewApi.mockRejectedValueOnce(mockError);

  // WHEN
  const { result } = renderHook(() => usePdfPreview("file-123"));

  // THEN
  await waitFor(() => {
    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
  });
});
```

#### TC-PH-007: Cleans up object URLs on unmount

```typescript
it("should revoke object URLs on unmount", async () => {
  // GIVEN
  const mockRevoke = vi.spyOn(URL, "revokeObjectURL");
  mockPreviewApi.mockResolvedValueOnce({
    data: new Blob(),
    headers: { "x-total-pages": "1" },
  });

  // WHEN
  const { unmount } = renderHook(() => usePdfPreview("file-123"));

  await waitFor(() => {
    expect(mockRevoke).not.toHaveBeenCalled();
  });

  unmount();

  // THEN
  expect(mockRevoke).toHaveBeenCalled();
});
```

---

### 3. filePreview.api.ts Tests

**File:** `src/api/__tests__/filePreview.api.test.ts`

#### TC-AP-001: previewFile calls correct endpoint

```typescript
describe("filePreview API", () => {
  it("should call preview endpoint with file ID", async () => {
    // GIVEN
    const mockBlob = new Blob(["image"]);
    mockAxios.get.mockResolvedValueOnce({
      data: mockBlob,
      headers: {
        "x-total-pages": "3",
        "x-current-page": "1",
      },
    });

    // WHEN
    const result = await previewFile("file-123");

    // THEN
    expect(mockAxios.get).toHaveBeenCalledWith("/api/Files/file-123/preview", {
      responseType: "blob",
      headers: {
        Authorization: expect.stringContaining("Bearer"),
      },
    });
    expect(result.totalPages).toBe(3);
    expect(result.currentPage).toBe(1);
  });
});
```

#### TC-AP-002: renderPdfPage calls with correct params

```typescript
it("should call render endpoint with page number and dpi", async () => {
  // GIVEN
  const mockBlob = new Blob(["page-image"]);
  mockAxios.get.mockResolvedValueOnce({
    data: mockBlob,
  });

  // WHEN
  const result = await renderPdfPage("file-123", 2, 300);

  // THEN
  expect(mockAxios.get).toHaveBeenCalledWith(
    "/api/pdf/file-123/pages/2/render",
    {
      params: { dpi: 300 },
      responseType: "blob",
      headers: {
        Authorization: expect.stringContaining("Bearer"),
      },
    }
  );
  expect(result).toBeInstanceOf(Blob);
});
```

#### TC-AP-003: Includes auth token

```typescript
it("should include Bearer token in requests", async () => {
  // GIVEN
  mockUseAuthStore.mockReturnValue({
    accessToken: "test-token-123",
  });

  // WHEN
  await previewFile("file-123");

  // THEN
  expect(mockAxios.get).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      headers: {
        Authorization: "Bearer test-token-123",
      },
    })
  );
});
```

#### TC-AP-004: Handles 404 errors

```typescript
it("should throw error for 404 responses", async () => {
  // GIVEN
  mockAxios.get.mockRejectedValueOnce({
    response: {
      status: 404,
      data: {
        title: "File not found",
      },
    },
  });

  // WHEN & THEN
  await expect(previewFile("invalid-id")).rejects.toThrow("File not found");
});
```

#### TC-AP-005: Handles network errors

```typescript
it("should handle network errors gracefully", async () => {
  // GIVEN
  mockAxios.get.mockRejectedValueOnce(new Error("Network request failed"));

  // WHEN & THEN
  await expect(previewFile("file-123")).rejects.toThrow(
    "Network request failed"
  );
});
```

#### TC-AP-006: Creates object URLs from blobs

```typescript
it("should convert blob to object URL", async () => {
  // GIVEN
  const mockBlob = new Blob(["image"]);
  const mockURL = "blob:http://localhost/abc123";
  vi.spyOn(URL, "createObjectURL").mockReturnValueOnce(mockURL);

  mockAxios.get.mockResolvedValueOnce({
    data: mockBlob,
    headers: { "x-total-pages": "1" },
  });

  // WHEN
  const result = await previewFile("file-123");

  // THEN
  expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  expect(result.imageUrl).toBe(mockURL);
});
```

---

### 4. ChatMainContainer Integration Tests

**File:** `src/features/portal/components/__tests__/ChatMainContainer.test.tsx`

#### TC-INT-001: Clicking file opens preview modal

```typescript
it("should open preview modal when file attachment clicked", async () => {
  // GIVEN
  const mockMessage = {
    id: "msg-1",
    content: "See attachment",
    fileId: "file-123",
    fileName: "document.pdf",
    contentType: "application/pdf",
  };

  render(<ChatMainContainer messages={[mockMessage]} />);

  // WHEN
  const fileAttachment = screen.getByTestId("message-file-attachment-file-123");
  await userEvent.click(fileAttachment);

  // THEN
  expect(screen.getByTestId("file-preview-modal")).toBeInTheDocument();
  expect(screen.getByText("document.pdf")).toBeInTheDocument();
});
```

#### TC-INT-002: Modal receives correct file ID

```typescript
it("should pass file ID to preview modal", async () => {
  // GIVEN
  const mockMessage = {
    fileId: "file-456",
    fileName: "report.pdf",
  };

  render(<ChatMainContainer messages={[mockMessage]} />);

  // WHEN
  await userEvent.click(screen.getByTestId("message-file-attachment-file-456"));

  // THEN
  const modal = screen.getByTestId("file-preview-modal");
  expect(modal).toHaveAttribute("data-file-id", "file-456");
});
```

#### TC-INT-003: Closing modal returns to chat

```typescript
it("should close modal and return focus to chat", async () => {
  // GIVEN
  render(<ChatMainContainer />);

  // Open modal
  await userEvent.click(screen.getByTestId("message-file-attachment-file-123"));
  expect(screen.getByTestId("file-preview-modal")).toBeInTheDocument();

  // WHEN
  const closeButton = screen.getByTestId("file-preview-modal-close-button");
  await userEvent.click(closeButton);

  // THEN
  expect(screen.queryByTestId("file-preview-modal")).not.toBeInTheDocument();
  expect(screen.getByTestId("chat-main-container")).toHaveFocus();
});
```

---

## 🎭 Test Data & Mocks

### Mock Files

```typescript
// test/mocks/files.ts

export const mockPdfFile = {
  id: "pdf-file-123",
  fileName: "document.pdf",
  contentType: "application/pdf",
  size: 1024000, // 1MB
};

export const mockImageFile = {
  id: "img-file-456",
  fileName: "screenshot.png",
  contentType: "image/png",
  size: 512000, // 512KB
};

export const mockMultiPagePdf = {
  id: "multi-pdf-789",
  fileName: "report.pdf",
  contentType: "application/pdf",
  size: 5120000, // 5MB
  totalPages: 10,
};
```

### Mock API Responses

```typescript
// test/mocks/apiResponses.ts

export const mockPreviewResponse = {
  data: new Blob(["mock-image-data"], { type: "image/png" }),
  headers: {
    "x-total-pages": "5",
    "x-current-page": "1",
    "content-type": "image/png",
  },
};

export const mockRenderPageResponse = {
  data: new Blob(["mock-page-2-data"], { type: "image/png" }),
  headers: {
    "content-type": "image/png",
  },
};

export const mock404Error = {
  response: {
    status: 404,
    data: {
      type: "NotFound",
      title: "File not found",
      status: 404,
      detail: "The specified file does not exist.",
    },
  },
};
```

### Mock Hooks

```typescript
// test/mocks/hooks.ts

export const mockUsePdfPreview = vi.fn(() => ({
  totalPages: 5,
  currentPage: 1,
  imageUrl: "blob:http://localhost/mock-image",
  isLoading: false,
  error: null,
  navigateToPage: vi.fn(),
  retry: vi.fn(),
}));
```

---

## 📋 Test Generation Checklist

### Before Implementation

- [x] **Requirements approved** (BƯỚC 1)
- [x] **Wireframe approved** (BƯỚC 2A)
- [x] **Flow diagram approved** (BƯỚC 2B)
- [ ] **Test requirements approved** (BƯỚC 6 - this document)

### During Implementation

- [ ] Create test file alongside implementation file
- [ ] Write failing tests first (TDD approach)
- [ ] Implement code to make tests pass
- [ ] Refactor while keeping tests green
- [ ] Ensure all test cases from this document are covered

### Test File Creation Order

1. `filePreview.api.test.ts` - API layer (foundation)
2. `usePdfPreview.test.tsx` - Business logic hook
3. `FilePreviewModal.test.tsx` - UI component
4. `ChatMainContainer.test.tsx` - Integration tests

### Coverage Requirements

- **Minimum line coverage:** 80%
- **Minimum branch coverage:** 75%
- **All critical paths:** 100% (happy path + error scenarios)

---

## 🎯 Priority Test Cases

### Must-Have (Phase 3)

✅ All test cases marked as HIGH priority in coverage matrix:

- FilePreviewModal: All 8 cases
- usePdfPreview: All 7 cases
- filePreview.api: All 6 cases

### Nice-to-Have (Future)

⏳ Test cases for future features:

- Swipe gesture navigation (mobile)
- Thumbnail strip functionality
- Zoom/pan controls
- Keyboard shortcuts beyond basic navigation

---

## 📋 HUMAN CONFIRMATION

| Hạng Mục                                | Status       |
| --------------------------------------- | ------------ |
| Đã review test coverage matrix          | ✅ Đã review |
| Đã review test cases details            | ✅ Đã review |
| Đã review mock data requirements        | ✅ Đã review |
| **APPROVED để tạo implementation plan** | ✅ APPROVED  |

**HUMAN Signature:** [ĐÃ DUYỆT]  
**Date:** 2026-01-08

> ✅ **APPROVED - AI có thể tiến hành implementation**

---

**Created:** 2026-01-08  
**Next Step:** Await HUMAN approval → Create implementation plan (BƯỚC 4)

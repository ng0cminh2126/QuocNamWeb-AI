import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUploadFilesBatch } from "../useUploadFilesBatch";
import { uploadFilesBatch } from "@/api/files.api";
import type { BatchUploadResult } from "@/types/files";
import type { ReactNode } from "react";

// Mock API
vi.mock("@/api/files.api", () => ({
  uploadFilesBatch: vi.fn(),
}));

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useUploadFilesBatch", () => {
  const mockFile1 = new File(["content1"], "image1.jpg", {
    type: "image/jpeg",
  });
  const mockFile2 = new File(["content2"], "image2.png", {
    type: "image/png",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-02.1: should upload batch successfully and call onSuccess", async () => {
    // Arrange
    const mockResult: BatchUploadResult = {
      totalFiles: 2,
      successCount: 2,
      failedCount: 0,
      results: [
        {
          index: 0,
          success: true,
          fileId: "file-123",
          fileName: "image1.jpg",
          contentType: "image/jpeg",
          size: 1024,
          storagePath: "/uploads/image1.jpg",
          error: null,
        },
        {
          index: 1,
          success: true,
          fileId: "file-456",
          fileName: "image2.png",
          contentType: "image/png",
          size: 2048,
          storagePath: "/uploads/image2.png",
          error: null,
        },
      ],
      allSuccess: true,
      partialSuccess: false,
    };

    vi.mocked(uploadFilesBatch).mockResolvedValue(mockResult);

    const onSuccess = vi.fn();
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useUploadFilesBatch({ onSuccess }), {
      wrapper,
    });

    result.current.mutate({
      files: [mockFile1, mockFile2],
      sourceModule: 1,
      sourceEntityId: "conv-123",
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(uploadFilesBatch).toHaveBeenCalledWith([mockFile1, mockFile2], {
      sourceModule: 1,
      sourceEntityId: "conv-123",
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    // Check first 2 params (data, variables), context is undefined
    const successCall = onSuccess.mock.calls[0];
    expect(successCall[0]).toEqual(mockResult);
    expect(successCall[1]).toMatchObject({ files: expect.any(Array) });
    expect(result.current.data).toEqual(mockResult);
  });

  it("TC-02.2: should handle error and call onError", async () => {
    // Arrange
    const mockError = new Error("Network error");
    vi.mocked(uploadFilesBatch).mockRejectedValue(mockError);

    const onError = vi.fn();
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useUploadFilesBatch({ onError }), {
      wrapper,
    });

    result.current.mutate({
      files: [mockFile1, mockFile2],
    });

    // Assert - wait for retry to complete (hook retries 1 time with 2s delay)
    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 3000 }
    ); // Wait longer for retry

    expect(onError).toHaveBeenCalledTimes(1);
    const call = onError.mock.calls[0];
    expect(call[0]).toEqual(mockError);
    expect(call[1]).toMatchObject({ files: expect.any(Array) });
    expect(result.current.error).toEqual(mockError);
  });

  it("TC-02.3: should handle partial success correctly", async () => {
    // Arrange
    const mockResult: BatchUploadResult = {
      totalFiles: 2,
      successCount: 1,
      failedCount: 1,
      results: [
        {
          index: 0,
          success: true,
          fileId: "file-123",
          fileName: "image1.jpg",
          contentType: "image/jpeg",
          size: 1024,
          storagePath: "/uploads/image1.jpg",
          error: null,
        },
        {
          index: 1,
          success: false,
          fileId: undefined,
          fileName: "image2.png",
          contentType: "image/png",
          size: undefined,
          storagePath: null,
          error: "File size exceeds limit",
        },
      ],
      allSuccess: false,
      partialSuccess: true,
    };

    vi.mocked(uploadFilesBatch).mockResolvedValue(mockResult);

    const onSuccess = vi.fn();
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useUploadFilesBatch({ onSuccess }), {
      wrapper,
    });

    result.current.mutate({
      files: [mockFile1, mockFile2],
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(onSuccess).toHaveBeenCalledTimes(1);
    const partialSuccessCall = onSuccess.mock.calls[0];
    expect(partialSuccessCall[0]).toEqual(mockResult);
    expect(partialSuccessCall[1]).toMatchObject({ files: expect.any(Array) });
    expect(result.current.data?.partialSuccess).toBe(true);
    expect(result.current.data?.successCount).toBe(1);
    expect(result.current.data?.failedCount).toBe(1);
  });

  it("TC-02.4: should NOT retry validation errors", async () => {
    // Arrange
    const validationError = new Error("Maximum 10 files allowed per batch");
    vi.mocked(uploadFilesBatch).mockRejectedValue(validationError);

    const onError = vi.fn();
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useUploadFilesBatch({ onError }), {
      wrapper,
    });

    result.current.mutate({
      files: Array.from({ length: 11 }, () => mockFile1),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Should only call once (no retry)
    expect(uploadFilesBatch).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    const call = onError.mock.calls[0];
    expect(call[0]).toEqual(validationError);
    expect(call[1]).toMatchObject({ files: expect.any(Array) });
  });

  it("TC-02.5: should track loading state correctly", async () => {
    // Arrange
    const mockResult: BatchUploadResult = {
      totalFiles: 2,
      successCount: 2,
      failedCount: 0,
      results: [],
      allSuccess: true,
      partialSuccess: false,
    };

    // Delay response to test loading state
    vi.mocked(uploadFilesBatch).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockResult), 100);
        })
    );

    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useUploadFilesBatch(), { wrapper });

    expect(result.current.isPending).toBe(false);

    // Trigger mutation
    result.current.mutate({
      files: [mockFile1, mockFile2],
    });

    // Assert - should be pending after mutation triggered
    await waitFor(() => expect(result.current.isPending).toBe(true));

    // Wait for success
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isPending).toBe(false);
  });
});

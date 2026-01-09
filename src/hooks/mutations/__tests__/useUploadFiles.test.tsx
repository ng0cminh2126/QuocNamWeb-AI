import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUploadFiles } from "../useUploadFiles";
import * as filesApi from "@/api/files.api";
import { toast } from "sonner";
import type { SelectedFile, UploadFileResult } from "@/types/files";

// Mock dependencies
vi.mock("@/api/files.api");
vi.mock("sonner");

describe("useUploadFiles", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false, // Disable retry in tests
        },
      },
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockSelectedFiles: SelectedFile[] = [
    {
      id: "file-1",
      file: new File(["content1"], "document1.pdf", {
        type: "application/pdf",
      }),
      preview: undefined,
    },
    {
      id: "file-2",
      file: new File(["content2"], "image2.jpg", { type: "image/jpeg" }),
      preview: undefined,
    },
    {
      id: "file-3",
      file: new File(["content3"], "spreadsheet3.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      preview: undefined,
    },
  ];

  const mockUploadResults: UploadFileResult[] = [
    {
      fileId: "uuid-1",
      storagePath: "chat/2024/01/06/uuid-1.pdf",
      fileName: "document1.pdf",
      contentType: "application/pdf",
      size: 1048576,
    },
    {
      fileId: "uuid-2",
      storagePath: "chat/2024/01/06/uuid-2.jpg",
      fileName: "image2.jpg",
      contentType: "image/jpeg",
      size: 524288,
    },
    {
      fileId: "uuid-3",
      storagePath: "chat/2024/01/06/uuid-3.xlsx",
      fileName: "spreadsheet3.xlsx",
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 2097152,
    },
  ];

  it("should upload single file successfully", async () => {
    // Mock uploadFile to succeed
    vi.mocked(filesApi.uploadFile).mockResolvedValueOnce(mockUploadResults[0]);

    const { result } = renderHook(() => useUploadFiles(), { wrapper });

    // Upload single file
    const uploadResult = await result.current.mutateAsync({
      files: [mockSelectedFiles[0]],
      sourceModule: 1,
    });

    // Verify result structure (Phase 2: returns files, not fileIds)
    expect(uploadResult.files).toHaveLength(1);
    expect(uploadResult.files[0]).toEqual({
      originalFile: mockSelectedFiles[0].file,
      uploadResult: mockUploadResults[0],
    });
    expect(uploadResult.successCount).toBe(1);
    expect(uploadResult.failedCount).toBe(0);
    expect(uploadResult.errors).toEqual([]);
  });

  it("should upload multiple files sequentially", async () => {
    // Mock uploadFile to succeed for all 3 files
    vi.mocked(filesApi.uploadFile)
      .mockResolvedValueOnce(mockUploadResults[0])
      .mockResolvedValueOnce(mockUploadResults[1])
      .mockResolvedValueOnce(mockUploadResults[2]);

    const { result } = renderHook(() => useUploadFiles(), { wrapper });

    // Upload 3 files
    const uploadResult = await result.current.mutateAsync({
      files: mockSelectedFiles,
      sourceModule: 1,
    });

    // Verify all uploads were sequential (uploadFile called 3 times)
    expect(filesApi.uploadFile).toHaveBeenCalledTimes(3);

    // Verify result structure (Phase 2: returns files array)
    expect(uploadResult.files).toHaveLength(3);
    expect(uploadResult.files[0].originalFile).toBe(mockSelectedFiles[0].file);
    expect(uploadResult.files[0].uploadResult).toEqual(mockUploadResults[0]);
    expect(uploadResult.files[1].uploadResult.fileId).toBe("uuid-2");
    expect(uploadResult.files[2].uploadResult.fileId).toBe("uuid-3");
    expect(uploadResult.successCount).toBe(3);
    expect(uploadResult.failedCount).toBe(0);
  });

  it("should return all files with metadata on success", async () => {
    vi.mocked(filesApi.uploadFile)
      .mockResolvedValueOnce(mockUploadResults[0])
      .mockResolvedValueOnce(mockUploadResults[1])
      .mockResolvedValueOnce(mockUploadResults[2]);

    const { result } = renderHook(() => useUploadFiles(), { wrapper });

    const uploadResult = await result.current.mutateAsync({
      files: mockSelectedFiles,
      sourceModule: 1,
      sourceEntityId: "conversation-123",
    });

    // Verify structure (Phase 2: files array with original File + upload result)
    expect(uploadResult).toEqual({
      files: [
        {
          originalFile: mockSelectedFiles[0].file,
          uploadResult: mockUploadResults[0],
        },
        {
          originalFile: mockSelectedFiles[1].file,
          uploadResult: mockUploadResults[1],
        },
        {
          originalFile: mockSelectedFiles[2].file,
          uploadResult: mockUploadResults[2],
        },
      ],
      successCount: 3,
      failedCount: 0,
      errors: [],
    });
  });

  it("should handle partial success (some files fail)", async () => {
    // Mock: file1 success, file2 fails, file3 success
    vi.mocked(filesApi.uploadFile)
      .mockResolvedValueOnce(mockUploadResults[0])
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockUploadResults[2]);

    const { result } = renderHook(() => useUploadFiles(), { wrapper });

    const uploadResult = await result.current.mutateAsync({
      files: mockSelectedFiles,
      sourceModule: 1,
    });

    // Verify partial success (Phase 2: only successful files in array)
    expect(uploadResult.files).toHaveLength(2);
    expect(uploadResult.files[0].uploadResult.fileId).toBe("uuid-1");
    expect(uploadResult.files[1].uploadResult.fileId).toBe("uuid-3");
    expect(uploadResult.successCount).toBe(2);
    expect(uploadResult.failedCount).toBe(1);
    expect(uploadResult.errors).toHaveLength(1);
    expect(uploadResult.errors[0].file.id).toBe("file-2");
  });

  it("should call onProgress for each file", async () => {
    const onProgressMock = vi.fn();

    // Mock uploadFile with progress events
    vi.mocked(filesApi.uploadFile).mockImplementation(
      async ({ onUploadProgress }) => {
        // Simulate progress events
        onUploadProgress?.({ loaded: 50, total: 100 } as ProgressEvent);
        onUploadProgress?.({ loaded: 100, total: 100 } as ProgressEvent);
        return mockUploadResults[0];
      }
    );

    const { result } = renderHook(() => useUploadFiles(), { wrapper });

    await result.current.mutateAsync({
      files: [mockSelectedFiles[0]],
      sourceModule: 1,
      onProgress: onProgressMock,
    });

    // Verify onProgress was called with file ID and progress
    expect(onProgressMock).toHaveBeenCalledWith("file-1", expect.any(Number));
  });

  it("should show error toast on failure", async () => {
    const errorMessage = "File too large";

    // Mock upload failure
    vi.mocked(filesApi.uploadFile).mockRejectedValueOnce({
      response: {
        data: {
          detail: errorMessage,
        },
      },
    });

    const { result } = renderHook(() => useUploadFiles(), { wrapper });

    await result.current.mutateAsync({
      files: [mockSelectedFiles[0]],
      sourceModule: 1,
    });

    // Verify toast.error was called
    expect(toast.error).toHaveBeenCalledWith("Lỗi upload document1.pdf", {
      description: errorMessage,
    });
  });

  it("should return errors array with failed files", async () => {
    const error1 = "File too large";
    const error2 = "Network error";

    // Mock: file1 fails, file2 fails, file3 success
    vi.mocked(filesApi.uploadFile)
      .mockRejectedValueOnce({ response: { data: { detail: error1 } } })
      .mockRejectedValueOnce({ message: error2 })
      .mockResolvedValueOnce(mockUploadResults[2]);

    const { result } = renderHook(() => useUploadFiles(), { wrapper });

    const uploadResult = await result.current.mutateAsync({
      files: mockSelectedFiles,
      sourceModule: 1,
    });

    // Verify errors array
    expect(uploadResult.errors).toHaveLength(2);
    expect(uploadResult.errors[0]).toEqual({
      file: mockSelectedFiles[0],
      error: error1,
    });
    expect(uploadResult.errors[1]).toEqual({
      file: mockSelectedFiles[1],
      error: error2,
    });
  });

  it("should handle all files fail scenario", async () => {
    // Mock all uploads fail
    vi.mocked(filesApi.uploadFile)
      .mockRejectedValueOnce(new Error("Error 1"))
      .mockRejectedValueOnce(new Error("Error 2"))
      .mockRejectedValueOnce(new Error("Error 3"));

    const { result } = renderHook(() => useUploadFiles(), { wrapper });

    const uploadResult = await result.current.mutateAsync({
      files: mockSelectedFiles,
      sourceModule: 1,
    });

    // Verify all failed (Phase 2: empty files array)
    expect(uploadResult.files).toEqual([]);
    expect(uploadResult.successCount).toBe(0);
    expect(uploadResult.failedCount).toBe(3);
    expect(uploadResult.errors).toHaveLength(3);
  });

  it("should maintain sequential order", async () => {
    const callOrder: string[] = [];

    vi.mocked(filesApi.uploadFile).mockImplementation(async ({ file }) => {
      callOrder.push(file.name);

      // Simulate async delay
      await new Promise((resolve) => setTimeout(resolve, 10));

      return mockUploadResults[0];
    });

    const { result } = renderHook(() => useUploadFiles(), { wrapper });

    await result.current.mutateAsync({
      files: mockSelectedFiles,
      sourceModule: 1,
    });

    // Verify files uploaded in order
    expect(callOrder).toEqual([
      "document1.pdf",
      "image2.jpg",
      "spreadsheet3.xlsx",
    ]);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadFilesBatch } from "../files.api";
import { fileApiClient } from "../fileClient";
import type { BatchUploadResult } from "@/types/files";

// Mock fileApiClient
vi.mock("../fileClient", () => ({
  fileApiClient: {
    post: vi.fn(),
  },
}));

describe("uploadFilesBatch", () => {
  const mockFile1 = new File(["content1"], "image1.jpg", {
    type: "image/jpeg",
  });
  const mockFile2 = new File(["content2"], "image2.png", {
    type: "image/png",
  });
  const mockFile3 = new File(["content3"], "doc.pdf", {
    type: "application/pdf",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-01.1: should upload batch successfully (all files success)", async () => {
    // Arrange
    const files = [mockFile1, mockFile2, mockFile3];
    const mockResult: BatchUploadResult = {
      totalFiles: 3,
      successCount: 3,
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
        {
          index: 2,
          success: true,
          fileId: "file-789",
          fileName: "doc.pdf",
          contentType: "application/pdf",
          size: 3072,
          storagePath: "/uploads/doc.pdf",
          error: null,
        },
      ],
      allSuccess: true,
      partialSuccess: false,
    };

    vi.mocked(fileApiClient.post).mockResolvedValue({ data: mockResult });

    // Act
    const result = await uploadFilesBatch(files, {
      sourceModule: 1,
      sourceEntityId: "conv-123",
    });

    // Assert
    expect(result).toEqual(mockResult);
    expect(result.allSuccess).toBe(true);
    expect(result.successCount).toBe(3);
    expect(fileApiClient.post).toHaveBeenCalledWith(
      "/api/Files/batch?sourceModule=1&sourceEntityId=conv-123",
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      })
    );
  });

  it("TC-01.2: should handle partial success (some files failed)", async () => {
    // Arrange
    const files = [mockFile1, mockFile2, mockFile3];
    const mockResult: BatchUploadResult = {
      totalFiles: 3,
      successCount: 2,
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
          success: true,
          fileId: "file-456",
          fileName: "image2.png",
          contentType: "image/png",
          size: 2048,
          storagePath: "/uploads/image2.png",
          error: null,
        },
        {
          index: 2,
          success: false,
          fileId: undefined,
          fileName: "doc.pdf",
          contentType: "application/pdf",
          size: undefined,
          storagePath: null,
          error: "File size exceeds limit",
        },
      ],
      allSuccess: false,
      partialSuccess: true,
    };

    vi.mocked(fileApiClient.post).mockResolvedValue({ data: mockResult });

    // Act
    const result = await uploadFilesBatch(files);

    // Assert
    expect(result.partialSuccess).toBe(true);
    expect(result.successCount).toBe(2);
    expect(result.failedCount).toBe(1);
    expect(result.results[2].success).toBe(false);
    expect(result.results[2].error).toBe("File size exceeds limit");
  });

  it("TC-01.3: should throw error if no files provided", async () => {
    // Act & Assert
    await expect(uploadFilesBatch([])).rejects.toThrow(
      "No files provided for batch upload"
    );

    expect(fileApiClient.post).not.toHaveBeenCalled();
  });

  it("TC-01.4: should throw error if only 1 file provided (use single upload instead)", async () => {
    // Act & Assert
    await expect(uploadFilesBatch([mockFile1])).rejects.toThrow(
      "Use single upload API (uploadFile) for 1 file"
    );

    expect(fileApiClient.post).not.toHaveBeenCalled();
  });

  it("TC-01.5: should throw error if more than 10 files", async () => {
    // Arrange
    const files = Array.from(
      { length: 11 },
      (_, i) =>
        new File([`content${i}`], `file${i}.jpg`, { type: "image/jpeg" })
    );

    // Act & Assert
    await expect(uploadFilesBatch(files)).rejects.toThrow(
      "Maximum 10 files allowed per batch"
    );

    expect(fileApiClient.post).not.toHaveBeenCalled();
  });
});

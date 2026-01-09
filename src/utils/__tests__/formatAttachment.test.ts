/**
 * Unit tests for formatAttachment utilities
 */

import { describe, it, expect } from "vitest";
import { formatAttachment, formatAttachments } from "../formatAttachment";
import type { UploadFileResult } from "@/types/files";

describe("formatAttachment", () => {
  const mockFile = new File(["test content"], "test-document.pdf", {
    type: "application/pdf",
  });

  const mockUploadResult: UploadFileResult = {
    fileId: "abc-123-def-456",
    storagePath: "chat/2024/01/06/abc-123-def-456.pdf",
    fileName: "test-document.pdf",
    contentType: "application/pdf",
    size: 1024,
  };

  it("should format attachment with all metadata", () => {
    const result = formatAttachment(mockFile, mockUploadResult);

    expect(result).toEqual({
      fileId: "abc-123-def-456",
      fileName: "test-document.pdf",
      fileSize: 12, // File mock size from 'test content' string (12 bytes)
      contentType: "application/pdf",
    });
  });

  it("should handle missing fileName from upload result", () => {
    const uploadResultNoName: UploadFileResult = {
      ...mockUploadResult,
      fileName: "",
    };

    const result = formatAttachment(mockFile, uploadResultNoName);

    expect(result).toEqual({
      fileId: "abc-123-def-456",
      fileName: "test-document.pdf", // Fallback to File.name
      fileSize: 12, // File.size from mock
      contentType: "application/pdf",
    });
  });

  it("should handle missing contentType from upload result", () => {
    const uploadResultNoType: UploadFileResult = {
      ...mockUploadResult,
      contentType: "",
    };

    const result = formatAttachment(mockFile, uploadResultNoType);

    expect(result).toEqual({
      fileId: "abc-123-def-456",
      fileName: "test-document.pdf",
      fileSize: 12, // File.size from mock
      contentType: "application/pdf", // Fallback to File.type
    });
  });

  it("should use File object properties as fallback", () => {
    const fileWithMetadata = new File(["content"], "my-image.jpg", {
      type: "image/jpeg",
    });

    // Upload result with empty metadata
    const uploadResult: UploadFileResult = {
      fileId: "xyz-789",
      storagePath: "chat/xyz-789.jpg",
      fileName: "",
      contentType: "",
      size: 2048,
    };

    const result = formatAttachment(fileWithMetadata, uploadResult);

    expect(result).toEqual({
      fileId: "xyz-789",
      fileName: "my-image.jpg", // From File.name
      fileSize: 7, // From File.size ('content' = 7 bytes)
      contentType: "image/jpeg", // From File.type
    });
  });

  it("should handle null values gracefully", () => {
    const uploadResultWithNulls: UploadFileResult = {
      fileId: "test-id",
      storagePath: "path/test.pdf",
      fileName: null as any,
      contentType: null as any,
      size: 512,
    };

    const result = formatAttachment(mockFile, uploadResultWithNulls);

    expect(result.fileId).toBe("test-id");
    expect(result.fileName).toBe("test-document.pdf");
    expect(result.fileSize).toBe(12); // File.size from mock
    expect(result.contentType).toBe("application/pdf");
  });
});

describe("formatAttachments", () => {
  it("should format multiple attachments correctly", () => {
    const file1 = new File(["content1"], "doc1.pdf", {
      type: "application/pdf",
    });
    const file2 = new File(["content2"], "image.jpg", { type: "image/jpeg" });

    const uploadResult1: UploadFileResult = {
      fileId: "file-1",
      storagePath: "chat/file-1.pdf",
      fileName: "doc1.pdf",
      contentType: "application/pdf",
      size: 1024,
    };

    const uploadResult2: UploadFileResult = {
      fileId: "file-2",
      storagePath: "chat/file-2.jpg",
      fileName: "image.jpg",
      contentType: "image/jpeg",
      size: 2048,
    };

    const result = formatAttachments(
      [file1, file2],
      [uploadResult1, uploadResult2]
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      fileId: "file-1",
      fileName: "doc1.pdf",
      fileSize: 8, // 'content1' = 8 bytes
      contentType: "application/pdf",
    });
    expect(result[1]).toEqual({
      fileId: "file-2",
      fileName: "image.jpg",
      fileSize: 8, // 'content2' = 8 bytes
      contentType: "image/jpeg",
    });
  });

  it("should handle empty arrays", () => {
    const result = formatAttachments([], []);

    expect(result).toEqual([]);
  });

  it("should throw error on mismatched array lengths", () => {
    const file1 = new File(["content"], "doc.pdf", {
      type: "application/pdf",
    });
    const uploadResult1: UploadFileResult = {
      fileId: "file-1",
      storagePath: "chat/file-1.pdf",
      fileName: "doc.pdf",
      contentType: "application/pdf",
      size: 1024,
    };

    // More files than results - should throw
    expect(() => formatAttachments([file1, file1], [uploadResult1])).toThrow();

    // More results than files - should throw
    expect(() =>
      formatAttachments([file1], [uploadResult1, uploadResult1])
    ).toThrow();
  });

  it("should map files to upload results by index", () => {
    const files = [
      new File(["a"], "a.txt", { type: "text/plain" }),
      new File(["b"], "b.txt", { type: "text/plain" }),
      new File(["c"], "c.txt", { type: "text/plain" }),
    ];

    const uploadResults: UploadFileResult[] = [
      {
        fileId: "id-a",
        storagePath: "path-a",
        fileName: "a.txt",
        contentType: "text/plain",
        size: 100,
      },
      {
        fileId: "id-b",
        storagePath: "path-b",
        fileName: "b.txt",
        contentType: "text/plain",
        size: 200,
      },
      {
        fileId: "id-c",
        storagePath: "path-c",
        fileName: "c.txt",
        contentType: "text/plain",
        size: 300,
      },
    ];

    const result = formatAttachments(files, uploadResults);

    expect(result).toHaveLength(3);
    expect(result[0].fileId).toBe("id-a");
    expect(result[1].fileId).toBe("id-b");
    expect(result[2].fileId).toBe("id-c");
  });
});

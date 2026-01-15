import { describe, it, expect } from "vitest";
import {
  validateBatchFileSelection,
  extractSuccessfulUploads,
  BATCH_UPLOAD_LIMITS,
} from "../fileHelpers";
import type { BatchUploadResult } from "@/types/files";

describe("fileHelpers - Phase 2 Batch Upload", () => {
  describe("validateBatchFileSelection", () => {
    it("TC-03.1: should pass validation for valid batch (3 files, under limits)", () => {
      // Arrange
      const files = [
        new File(["a".repeat(1024)], "image1.jpg", { type: "image/jpeg" }), // 1KB
        new File(["b".repeat(2048)], "image2.png", { type: "image/png" }), // 2KB
        new File(["c".repeat(3072)], "doc.pdf", {
          type: "application/pdf",
        }), // 3KB
      ];

      // Act
      const error = validateBatchFileSelection(files);

      // Assert
      expect(error).toBeUndefined();
    });

    it("TC-03.2: should reject if too many files (>10)", () => {
      // Arrange
      const files = Array.from(
        { length: 11 },
        (_, i) =>
          new File([`content${i}`], `file${i}.jpg`, { type: "image/jpeg" })
      );

      // Act
      const error = validateBatchFileSelection(files);

      // Assert
      expect(error).toBeDefined();
      expect(error?.type).toBe("too-many-files");
      expect(error?.message).toContain("10 file");
      expect(error?.message).toContain("11 file");
    });

    it("TC-03.3: should reject if individual file exceeds 10MB", () => {
      // Arrange
      const largeFile = new File(
        ["x".repeat(11 * 1024 * 1024)], // 11MB
        "large-image.jpg",
        { type: "image/jpeg" }
      );
      const files = [largeFile];

      // Act
      const error = validateBatchFileSelection(files);

      // Assert
      expect(error).toBeDefined();
      expect(error?.type).toBe("file-too-large");
      expect(error?.message).toContain("large-image.jpg");
      expect(error?.message).toContain("quá lớn");
      expect(error?.fileIndex).toBe(0);
      expect(error?.fileName).toBe("large-image.jpg");
    });

    it("TC-03.4: should reject if total batch size exceeds 50MB", () => {
      // Arrange
      // 6 files x 9MB = 54MB > 50MB limit
      const files = Array.from(
        { length: 6 },
        (_, i) =>
          new File(["y".repeat(9 * 1024 * 1024)], `file${i}.jpg`, {
            type: "image/jpeg",
          })
      );

      // Act
      const error = validateBatchFileSelection(files);

      // Assert
      expect(error).toBeDefined();
      expect(error?.type).toBe("total-size-exceeded");
      expect(error?.message).toContain("Tổng kích thước");
      expect(error?.message).toContain("vượt quá giới hạn");
    });

    it("TC-03.5: should reject empty batch", () => {
      // Act
      const error = validateBatchFileSelection([]);

      // Assert
      expect(error).toBeDefined();
      expect(error?.type).toBe("empty-batch");
      expect(error?.message).toContain("ít nhất 1 file");
    });

    it("TC-03.6: should use custom limits when provided", () => {
      // Arrange
      const files = Array.from(
        { length: 3 },
        (_, i) =>
          new File([`content${i}`], `file${i}.jpg`, { type: "image/jpeg" })
      );

      // Act - custom maxFiles = 2
      const error = validateBatchFileSelection(files, 2);

      // Assert
      expect(error).toBeDefined();
      expect(error?.type).toBe("too-many-files");
      expect(error?.message).toContain("2 file");
    });
  });

  describe("extractSuccessfulUploads", () => {
    it("TC-03.7: should extract all successful uploads (allSuccess=true)", () => {
      // Arrange
      const batchResult: BatchUploadResult = {
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

      // Act
      const attachments = extractSuccessfulUploads(batchResult);

      // Assert
      expect(attachments).toHaveLength(3);
      expect(attachments[0]).toEqual({
        fileId: "file-123",
        fileName: "image1.jpg",
        fileSize: 1024,
        contentType: "image/jpeg",
      });
      expect(attachments[1]).toEqual({
        fileId: "file-456",
        fileName: "image2.png",
        fileSize: 2048,
        contentType: "image/png",
      });
      expect(attachments[2]).toEqual({
        fileId: "file-789",
        fileName: "doc.pdf",
        fileSize: 3072,
        contentType: "application/pdf",
      });
    });

    it("TC-03.8: should filter out failed uploads (partialSuccess=true)", () => {
      // Arrange
      const batchResult: BatchUploadResult = {
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
            success: false,
            fileId: undefined,
            fileName: "image2.png",
            contentType: "image/png",
            size: undefined,
            storagePath: null,
            error: "File size exceeds limit",
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
        allSuccess: false,
        partialSuccess: true,
      };

      // Act
      const attachments = extractSuccessfulUploads(batchResult);

      // Assert
      expect(attachments).toHaveLength(2); // Only successful ones
      expect(attachments[0]).toMatchObject({
        fileId: "file-123",
        fileName: "image1.jpg",
        fileSize: 1024,
        contentType: "image/jpeg",
      });
      expect(attachments[1]).toMatchObject({
        fileId: "file-789",
        fileName: "doc.pdf",
        fileSize: 3072,
        contentType: "application/pdf",
      });
    });

    it("TC-03.9: should handle empty results (all failed)", () => {
      // Arrange
      const batchResult: BatchUploadResult = {
        totalFiles: 2,
        successCount: 0,
        failedCount: 2,
        results: [
          {
            index: 0,
            success: false,
            fileId: undefined,
            fileName: "image1.jpg",
            contentType: "image/jpeg",
            size: undefined,
            storagePath: null,
            error: "Network error",
          },
          {
            index: 1,
            success: false,
            fileId: undefined,
            fileName: "image2.png",
            contentType: "image/png",
            size: undefined,
            storagePath: null,
            error: "File too large",
          },
        ],
        allSuccess: false,
        partialSuccess: false,
      };

      // Act
      const attachments = extractSuccessfulUploads(batchResult);

      // Assert
      expect(attachments).toHaveLength(0);
    });
  });
});

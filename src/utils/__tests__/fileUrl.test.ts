/**
 * Unit tests for fileUrl utilities
 */

import { describe, it, expect } from "vitest";
import { getFileUrl, isPreviewableFile, getFileIcon } from "../fileUrl";

describe("getFileUrl", () => {
  it("should build file URL with fileId", () => {
    const fileId = "abc-123-def-456";
    const result = getFileUrl(fileId);

    // Should contain fileId in URL path
    expect(result).toContain("/api/Files/abc-123-def-456");
    expect(result).toContain("allianceitsc.com");
  });

  it("should handle fileId with special characters", () => {
    const fileId = "file-with-dashes_and_underscores.123";
    const result = getFileUrl(fileId);

    expect(result).toContain("/api/Files/");
    expect(result).toContain(fileId);
  });

  it("should handle empty fileId", () => {
    const result = getFileUrl("");
    expect(result).toContain("/api/Files/");
  });
});

describe("isPreviewableFile", () => {
  it("should return true for image MIME types", () => {
    expect(isPreviewableFile("image/jpeg")).toBe(true);
    expect(isPreviewableFile("image/png")).toBe(true);
    expect(isPreviewableFile("image/gif")).toBe(true);
    expect(isPreviewableFile("image/webp")).toBe(true);
    expect(isPreviewableFile("image/svg+xml")).toBe(true);
  });

  it("should return true for PDF", () => {
    expect(isPreviewableFile("application/pdf")).toBe(true);
  });

  it("should return true for text MIME types", () => {
    expect(isPreviewableFile("text/plain")).toBe(true);
    expect(isPreviewableFile("text/html")).toBe(true);
    expect(isPreviewableFile("text/css")).toBe(true);
    expect(isPreviewableFile("text/javascript")).toBe(true);
  });

  it("should return true for video MIME types", () => {
    expect(isPreviewableFile("video/mp4")).toBe(true);
    expect(isPreviewableFile("video/webm")).toBe(true);
    expect(isPreviewableFile("video/ogg")).toBe(true);
  });

  it("should return true for audio MIME types", () => {
    expect(isPreviewableFile("audio/mpeg")).toBe(true);
    expect(isPreviewableFile("audio/wav")).toBe(true);
    expect(isPreviewableFile("audio/ogg")).toBe(true);
  });

  it("should return false for non-previewable MIME types", () => {
    expect(isPreviewableFile("application/zip")).toBe(false);
    expect(isPreviewableFile("application/x-rar-compressed")).toBe(false);
    expect(isPreviewableFile("application/msword")).toBe(false);
    expect(
      isPreviewableFile(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe(false);
  });

  it("should return false for null or empty contentType", () => {
    expect(isPreviewableFile(null)).toBe(false);
    expect(isPreviewableFile("")).toBe(false);
  });

  it("should be case-sensitive (lowercase expected)", () => {
    expect(isPreviewableFile("IMAGE/JPEG")).toBe(false); // Should be lowercase
    expect(isPreviewableFile("image/jpeg")).toBe(true);
  });
});

describe("getFileIcon", () => {
  it("should return 'image' for image MIME types", () => {
    expect(getFileIcon("image/jpeg")).toBe("image");
    expect(getFileIcon("image/png")).toBe("image");
    expect(getFileIcon("image/gif")).toBe("image");
    expect(getFileIcon("image/webp")).toBe("image");
  });

  it("should return 'video' for video MIME types", () => {
    expect(getFileIcon("video/mp4")).toBe("video");
    expect(getFileIcon("video/webm")).toBe("video");
    expect(getFileIcon("video/quicktime")).toBe("video");
  });

  it("should return 'audio' for audio MIME types", () => {
    expect(getFileIcon("audio/mpeg")).toBe("audio");
    expect(getFileIcon("audio/wav")).toBe("audio");
    expect(getFileIcon("audio/ogg")).toBe("audio");
  });

  it("should return 'pdf' for PDF", () => {
    expect(getFileIcon("application/pdf")).toBe("pdf");
  });

  it("should return 'archive' for compressed files", () => {
    expect(getFileIcon("application/zip")).toBe("archive");
    expect(getFileIcon("application/x-rar-compressed")).toBe("archive");
    expect(getFileIcon("application/x-7z-compressed")).toBe("archive");
    expect(getFileIcon("application/gzip")).toBe("archive");
  });

  it("should return 'document' for document MIME types", () => {
    expect(getFileIcon("application/msword")).toBe("document");
    expect(
      getFileIcon(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe("document");
    expect(getFileIcon("text/plain")).toBe("document");
    expect(getFileIcon("text/html")).toBe("document");
  });

  it("should return 'file' for unknown MIME types", () => {
    expect(getFileIcon("application/octet-stream")).toBe("file");
    expect(getFileIcon("application/unknown")).toBe("file");
    expect(getFileIcon("custom/type")).toBe("file");
  });

  it("should return 'file' for null or empty contentType", () => {
    expect(getFileIcon(null)).toBe("file");
    expect(getFileIcon("")).toBe("file");
  });

  it("should handle partial matches correctly", () => {
    // "zip" in filename should match archive
    expect(getFileIcon("application/zip")).toBe("archive");

    // "document" in MIME type should match document
    expect(getFileIcon("application/vnd.ms-word.document")).toBe("document");
  });

  it("should prioritize more specific matches", () => {
    // PDF should be 'pdf', not 'document' or 'file'
    expect(getFileIcon("application/pdf")).toBe("pdf");

    // Image should be 'image', not 'file'
    expect(getFileIcon("image/svg+xml")).toBe("image");
  });
});

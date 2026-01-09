/**
 * Unit tests for fileHelpers utilities
 */

import { describe, test, expect } from "vitest";
import {
  formatFileSize,
  getFileIcon,
  truncateFileName,
  generateFileId,
  isImage,
  createFilePreview,
  fileToSelectedFile,
} from "../fileHelpers";

describe("formatFileSize", () => {
  test("formats 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
  });

  test("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 Bytes");
  });

  test("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
  });

  test("formats megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1 MB");
  });

  test("formats with decimals", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });
});

describe("getFileIcon", () => {
  test("returns PDF icon for PDF", () => {
    expect(getFileIcon("application/pdf")).toBe("📄");
  });

  test("returns Excel icon for XLSX", () => {
    expect(
      getFileIcon(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ).toBe("📊");
  });

  test("returns Word icon for DOCX", () => {
    expect(
      getFileIcon(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe("📝");
  });

  test("returns Image icon for JPEG", () => {
    expect(getFileIcon("image/jpeg")).toBe("🖼️");
  });

  test("returns default icon for unknown type", () => {
    expect(getFileIcon("application/unknown")).toBe("📎");
  });
});

describe("truncateFileName", () => {
  test("does not truncate short names", () => {
    expect(truncateFileName("file.pdf")).toBe("file.pdf");
  });

  test("truncates long names", () => {
    const longName = "very-long-file-name-that-exceeds-forty-characters.pdf";
    const result = truncateFileName(longName, 40);
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result).toContain("...");
    expect(result).toContain(".pdf");
  });

  test("preserves extension", () => {
    const longName = "a".repeat(50) + ".xlsx";
    const result = truncateFileName(longName);
    expect(result).toContain(".xlsx");
  });
});

describe("generateFileId", () => {
  test("generates unique IDs", () => {
    const id1 = generateFileId();
    const id2 = generateFileId();
    expect(id1).not.toBe(id2);
  });

  test('starts with "file-" prefix', () => {
    const id = generateFileId();
    expect(id).toMatch(/^file-/);
  });
});

describe("isImage", () => {
  test("returns true for image MIME types", () => {
    expect(isImage("image/jpeg")).toBe(true);
    expect(isImage("image/png")).toBe(true);
  });

  test("returns false for non-image types", () => {
    expect(isImage("application/pdf")).toBe(false);
  });
});

describe("createFilePreview", () => {
  test("creates preview URL for images", () => {
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const url = createFilePreview(file);
    expect(url).toBeDefined();
    expect(typeof url).toBe("string");
  });

  test("returns undefined for non-images", () => {
    const file = new File([""], "test.pdf", { type: "application/pdf" });
    const url = createFilePreview(file);
    expect(url).toBeUndefined();
  });
});

describe("fileToSelectedFile", () => {
  test("converts File to SelectedFile", () => {
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const selected = fileToSelectedFile(file);

    expect(selected).toHaveProperty("file", file);
    expect(selected).toHaveProperty("id");
    expect(selected.id).toMatch(/^file-/);
    expect(selected).toHaveProperty("preview");
  });

  test("includes preview for images", () => {
    const file = new File([""], "test.png", { type: "image/png" });
    const selected = fileToSelectedFile(file);
    expect(selected.preview).toBeDefined();
  });

  test("no preview for non-images", () => {
    const file = new File([""], "test.pdf", { type: "application/pdf" });
    const selected = fileToSelectedFile(file);
    expect(selected.preview).toBeUndefined();
  });
});

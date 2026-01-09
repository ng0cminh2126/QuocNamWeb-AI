/**
 * Unit tests for fileValidation utilities
 */

import { describe, test, expect } from "vitest";
import {
  validateFileSize,
  validateFileType,
  validateFileCount,
  validateFile,
  validateFiles,
} from "../fileValidation";
import { DEFAULT_FILE_RULES } from "@/types/files";

describe("validateFileSize", () => {
  test("accepts file within size limit", () => {
    const file = new File(["a".repeat(1000)], "small.txt", {
      type: "text/plain",
    });
    const result = validateFileSize(file, 10 * 1024 * 1024);
    expect(result.isValid).toBe(true);
  });

  test("rejects file exceeding size limit", () => {
    // Create a file object with size property set manually
    const largeContent = "a".repeat(1000);
    const file = new File([largeContent], "large.txt", {
      type: "text/plain",
    });

    // Mock file size to be larger than limit
    Object.defineProperty(file, "size", {
      value: 11 * 1024 * 1024,
      writable: false,
    });

    const result = validateFileSize(file, 10 * 1024 * 1024);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("vượt quá kích thước");
  });
});

describe("validateFileType", () => {
  test("accepts allowed file type", () => {
    const file = new File([""], "test.pdf", { type: "application/pdf" });
    const result = validateFileType(file, ["application/pdf"]);
    expect(result.isValid).toBe(true);
  });

  test("rejects disallowed file type", () => {
    const file = new File([""], "test.exe", {
      type: "application/x-msdownload",
    });
    const result = validateFileType(file, ["application/pdf", "image/jpeg"]);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("không được hỗ trợ");
  });
});

describe("validateFileCount", () => {
  test("accepts count within limit", () => {
    const result = validateFileCount(2, 2, 5);
    expect(result.isValid).toBe(true);
  });

  test("rejects count exceeding limit", () => {
    const result = validateFileCount(3, 3, 5);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("tối đa 5 file");
  });

  test("rejects exactly at limit + 1", () => {
    const result = validateFileCount(5, 1, 5);
    expect(result.isValid).toBe(false);
  });
});

describe("validateFile", () => {
  const rules = {
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
    allowedTypes: ["application/pdf", "image/jpeg"],
  };

  test("validates file with all rules passing", () => {
    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const result = validateFile(file, rules);
    expect(result.isValid).toBe(true);
  });

  test("fails on size rule", () => {
    const file = new File(["test"], "large.pdf", { type: "application/pdf" });

    // Mock file size to exceed limit
    Object.defineProperty(file, "size", {
      value: 11 * 1024 * 1024,
      writable: false,
    });

    const result = validateFile(file, rules);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("vượt quá kích thước");
  });

  test("fails on type rule", () => {
    const file = new File(["test"], "test.txt", { type: "text/plain" });
    const result = validateFile(file, rules);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("không được hỗ trợ");
  });
});

describe("validateFiles", () => {
  const rules = {
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
    allowedTypes: ["application/pdf", "image/jpeg"],
  };

  test("validates multiple valid files", () => {
    const files = [
      new File([""], "test1.pdf", { type: "application/pdf" }),
      new File([""], "test2.jpg", { type: "image/jpeg" }),
    ];
    const result = validateFiles(files, 0, rules);
    expect(result.validFiles).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  test("filters out invalid files", () => {
    const files = [
      new File([""], "valid.pdf", { type: "application/pdf" }),
      new File([""], "invalid.txt", { type: "text/plain" }),
    ];
    const result = validateFiles(files, 0, rules);
    expect(result.validFiles).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });

  test("checks total count including current files", () => {
    const files = [
      new File([""], "test1.pdf", { type: "application/pdf" }),
      new File([""], "test2.pdf", { type: "application/pdf" }),
    ];
    const result = validateFiles(files, 4, rules); // 4 + 2 = 6 > 5
    expect(result.validFiles).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("tối đa 5 file");
  });
});

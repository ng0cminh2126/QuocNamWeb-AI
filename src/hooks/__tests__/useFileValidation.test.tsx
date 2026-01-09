/**
 * Unit tests for useFileValidation hook
 */

import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { useFileValidation } from "../useFileValidation";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("useFileValidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("validates and adds valid files", () => {
    const { result } = renderHook(() => useFileValidation());

    const files = [new File([""], "test.pdf", { type: "application/pdf" })];

    let selectedFiles;
    act(() => {
      selectedFiles = result.current.validateAndAdd(files, 0);
    });

    expect(selectedFiles).toHaveLength(1);
    expect(selectedFiles[0]).toHaveProperty("file");
    expect(selectedFiles[0]).toHaveProperty("id");
    expect(toast.success).toHaveBeenCalledWith("Đã thêm 1 file");
  });

  test("shows error toast for invalid files", () => {
    const { result } = renderHook(() => useFileValidation());

    const files = [
      new File([""], "test.exe", { type: "application/x-msdownload" }),
    ];

    act(() => {
      result.current.validateAndAdd(files, 0);
    });

    expect(toast.error).toHaveBeenCalled();
  });

  test("respects custom validation rules", () => {
    const customRules = {
      maxSize: 1024, // 1KB only
      maxFiles: 2,
      allowedTypes: ["application/pdf"],
    };

    const { result } = renderHook(() =>
      useFileValidation({ rules: customRules })
    );

    const largeFile = new File(["a".repeat(100)], "large.pdf", {
      type: "application/pdf",
    });

    // Mock file size to exceed custom limit
    Object.defineProperty(largeFile, "size", {
      value: 2000,
      writable: false,
    });

    act(() => {
      result.current.validateAndAdd([largeFile], 0);
    });

    expect(toast.error).toHaveBeenCalled();
  });

  test("calls onValidFiles callback when files are valid", () => {
    const onValidFiles = vi.fn();
    const { result } = renderHook(() => useFileValidation({ onValidFiles }));

    const files = [new File([""], "test.pdf", { type: "application/pdf" })];

    act(() => {
      result.current.validateAndAdd(files, 0);
    });

    expect(onValidFiles).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          file: files[0],
          id: expect.any(String),
        }),
      ])
    );
  });

  test("handles multiple files correctly", () => {
    const { result } = renderHook(() => useFileValidation());

    const files = [
      new File([""], "test1.pdf", { type: "application/pdf" }),
      new File([""], "test2.jpg", { type: "image/jpeg" }),
      new File([""], "test3.png", { type: "image/png" }),
    ];

    let selectedFiles;
    act(() => {
      selectedFiles = result.current.validateAndAdd(files, 0);
    });

    expect(selectedFiles).toHaveLength(3);
    expect(toast.success).toHaveBeenCalledWith("Đã thêm 3 files");
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import axios from "axios";
import {
  classifyError,
  isRetryableError,
  type ErrorType,
} from "@/utils/errorHandling";

describe("errorHandling - classifyError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure navigator.onLine is true by default
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("EC-1: should classify network offline error", () => {
    // Mock navigator.onLine to return false
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);

    const error = new Error("Network error");
    const result = classifyError(error);

    expect(result.type).toBe("NETWORK_OFFLINE");
    expect(result.isRetryable).toBe(true);
    expect(result.message).toContain("kết nối mạng");
  });

  it("EC-2: should classify network timeout error", () => {
    const error = {
      isAxiosError: true,
      code: "ECONNABORTED",
      response: undefined,
    } as any;

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const result = classifyError(error);

    expect(result.type).toBe("NETWORK_TIMEOUT");
    expect(result.isRetryable).toBe(true);
    expect(result.message).toContain("Kết nối quá lâu");
  });

  it("EC-3: should classify 401 Unauthorized error", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 401,
        data: {},
      },
    } as any;

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const result = classifyError(error);

    expect(result.type).toBe("UNAUTHORIZED");
    expect(result.isRetryable).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.message).toContain("đăng nhập");
  });

  it("EC-4: should classify 400 Bad Request error", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          message: "Invalid data format",
        },
      },
    } as any;

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const result = classifyError(error);

    expect(result.type).toBe("BAD_REQUEST");
    expect(result.isRetryable).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.message).toContain("Invalid data format");
  });

  it("EC-5: should classify 500 Server Error", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 500,
        data: {},
      },
    } as any;

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const result = classifyError(error);

    expect(result.type).toBe("SERVER_ERROR");
    expect(result.isRetryable).toBe(true);
    expect(result.statusCode).toBe(500);
    expect(result.message).toContain("máy chủ");
  });

  it("EC-6: should classify file too large error (413)", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 413,
        data: {},
      },
    } as any;

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const result = classifyError(error);

    expect(result.type).toBe("FILE_TOO_LARGE");
    expect(result.isRetryable).toBe(false);
    expect(result.statusCode).toBe(413);
    expect(result.message).toContain("20MB");
  });

  it("EC-7: should classify unsupported file type error (415)", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 415,
        data: {},
      },
    } as any;

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const result = classifyError(error);

    expect(result.type).toBe("UNSUPPORTED_FILE_TYPE");
    expect(result.isRetryable).toBe(false);
    expect(result.statusCode).toBe(415);
    expect(result.message).toContain("Định dạng file");
  });

  it("EC-8: should classify unknown error", () => {
    const error = new Error("Random error");

    const result = classifyError(error);

    expect(result.type).toBe("UNKNOWN");
    expect(result.isRetryable).toBe(true);
    expect(result.message).toContain("Đã xảy ra lỗi");
  });

  it("should classify client-side FILE_TOO_LARGE error", () => {
    const error = new Error("FILE_TOO_LARGE");

    const result = classifyError(error);

    expect(result.type).toBe("FILE_TOO_LARGE");
    expect(result.isRetryable).toBe(false);
    expect(result.message).toContain("20MB");
  });

  it("should classify client-side UNSUPPORTED_FILE_TYPE error", () => {
    const error = new Error("UNSUPPORTED_FILE_TYPE");

    const result = classifyError(error);

    expect(result.type).toBe("UNSUPPORTED_FILE_TYPE");
    expect(result.isRetryable).toBe(false);
    expect(result.message).toContain("Định dạng file");
  });
});

describe("errorHandling - isRetryableError", () => {
  it("should return true for retryable errors", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 500,
      },
    } as any;

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    expect(isRetryableError(error)).toBe(true);
  });

  it("should return false for non-retryable errors", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 401,
      },
    } as any;

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    expect(isRetryableError(error)).toBe(false);
  });
});

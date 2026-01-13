import { describe, it, expect } from "vitest";
import { classifyError } from "../errorHandling";

describe("classifyError - AbortError detection", () => {
  it("detects AbortError by error.name", () => {
    // GIVEN: Error with name='AbortError'
    const error = new Error("The operation was aborted");
    error.name = "AbortError";

    // WHEN: Call classifyError(error)
    const result = classifyError(error);

    // THEN: Returns type=NETWORK_TIMEOUT, message="Mất kết nối mạng"
    expect(result.type).toBe("NETWORK_TIMEOUT");
    expect(result.message).toBe("Mất kết nối mạng. Vui lòng kiểm tra kết nối.");
  });

  it("marks AbortError as non-retryable", () => {
    // GIVEN: AbortError
    const error = new Error("Aborted");
    error.name = "AbortError";

    // WHEN: Call classifyError(error)
    const result = classifyError(error);

    // THEN: Returns isRetryable=false
    expect(result.isRetryable).toBe(false);
  });

  it("provides Vietnamese error message for AbortError", () => {
    // GIVEN: AbortError
    const error = new Error("Request timeout");
    error.name = "AbortError";

    // WHEN: Call classifyError(error)
    const result = classifyError(error);

    // THEN: Vietnamese message
    expect(result.message).toBe("Mất kết nối mạng. Vui lòng kiểm tra kết nối.");
  });
});

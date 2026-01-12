// Unit tests for usePinMessage and useUnpinMessage hooks
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { usePinMessage, useUnpinMessage } from "../usePinMessage";
import { pinMessage, unpinMessage } from "@/api/pinned_and_starred.api";

// Mock dependencies
vi.mock("@/api/pinned_and_starred.api");

describe("usePinMessage", () => {
  let queryClient: QueryClient;
  const mockConversationId = "conv-123";

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should pin message successfully", async () => {
    vi.mocked(pinMessage).mockResolvedValueOnce(undefined);

    const { result } = renderHook(
      () => usePinMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(pinMessage).toHaveBeenCalledWith("msg-1");
    expect(pinMessage).toHaveBeenCalledTimes(1);
  });

  it("should call onSuccess callback", async () => {
    vi.mocked(pinMessage).mockResolvedValueOnce(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        usePinMessage({ conversationId: mockConversationId, onSuccess }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("should handle pin error", async () => {
    const error = new Error("Failed to pin");
    vi.mocked(pinMessage).mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => usePinMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it("should call onError callback", async () => {
    const error = new Error("Failed to pin");
    vi.mocked(pinMessage).mockRejectedValueOnce(error);
    const onError = vi.fn();

    const { result } = renderHook(
      () => usePinMessage({ conversationId: mockConversationId, onError }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should invalidate queries on success", async () => {
    vi.mocked(pinMessage).mockResolvedValueOnce(undefined);
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () => usePinMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should invalidate pinned messages and messages cache
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
  });
});

describe("useUnpinMessage", () => {
  let queryClient: QueryClient;
  const mockConversationId = "conv-123";

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should unpin message successfully", async () => {
    vi.mocked(unpinMessage).mockResolvedValueOnce(undefined);

    const { result } = renderHook(
      () => useUnpinMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(unpinMessage).toHaveBeenCalledWith("msg-1");
    expect(unpinMessage).toHaveBeenCalledTimes(1);
  });

  it("should call onSuccess callback", async () => {
    vi.mocked(unpinMessage).mockResolvedValueOnce(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useUnpinMessage({ conversationId: mockConversationId, onSuccess }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("should handle unpin error", async () => {
    const error = new Error("Failed to unpin");
    vi.mocked(unpinMessage).mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useUnpinMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it("should call onError callback", async () => {
    const error = new Error("Failed to unpin");
    vi.mocked(unpinMessage).mockRejectedValueOnce(error);
    const onError = vi.fn();

    const { result } = renderHook(
      () =>
        useUnpinMessage({ conversationId: mockConversationId, onError }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should invalidate queries on success", async () => {
    vi.mocked(unpinMessage).mockResolvedValueOnce(undefined);
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () => useUnpinMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should invalidate pinned messages and messages cache
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
  });
});

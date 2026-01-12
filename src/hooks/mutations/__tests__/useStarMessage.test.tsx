// Unit tests for useStarMessage and useUnstarMessage hooks
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useStarMessage, useUnstarMessage } from "../useStarMessage";
import { starMessage, unstarMessage } from "@/api/pinned_and_starred.api";

// Mock dependencies
vi.mock("@/api/pinned_and_starred.api");

describe("useStarMessage", () => {
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

  it("should star message successfully", async () => {
    vi.mocked(starMessage).mockResolvedValueOnce(undefined);

    const { result } = renderHook(
      () => useStarMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(starMessage).toHaveBeenCalledWith("msg-1");
    expect(starMessage).toHaveBeenCalledTimes(1);
  });

  it("should call onSuccess callback", async () => {
    vi.mocked(starMessage).mockResolvedValueOnce(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useStarMessage({ conversationId: mockConversationId, onSuccess }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("should handle star error", async () => {
    const error = new Error("Failed to star");
    vi.mocked(starMessage).mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useStarMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it("should call onError callback", async () => {
    const error = new Error("Failed to star");
    vi.mocked(starMessage).mockRejectedValueOnce(error);
    const onError = vi.fn();

    const { result } = renderHook(
      () => useStarMessage({ conversationId: mockConversationId, onError }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should invalidate queries on success", async () => {
    vi.mocked(starMessage).mockResolvedValueOnce(undefined);
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () => useStarMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should invalidate starred messages and messages cache
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
  });

  it("should work without conversationId", async () => {
    vi.mocked(starMessage).mockResolvedValueOnce(undefined);
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useStarMessage(), { wrapper });

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should only invalidate starred messages cache (not messages cache)
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
  });
});

describe("useUnstarMessage", () => {
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

  it("should unstar message successfully", async () => {
    vi.mocked(unstarMessage).mockResolvedValueOnce(undefined);

    const { result } = renderHook(
      () => useUnstarMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(unstarMessage).toHaveBeenCalledWith("msg-1");
    expect(unstarMessage).toHaveBeenCalledTimes(1);
  });

  it("should call onSuccess callback", async () => {
    vi.mocked(unstarMessage).mockResolvedValueOnce(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useUnstarMessage({ conversationId: mockConversationId, onSuccess }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("should handle unstar error", async () => {
    const error = new Error("Failed to unstar");
    vi.mocked(unstarMessage).mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useUnstarMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it("should call onError callback", async () => {
    const error = new Error("Failed to unstar");
    vi.mocked(unstarMessage).mockRejectedValueOnce(error);
    const onError = vi.fn();

    const { result } = renderHook(
      () =>
        useUnstarMessage({ conversationId: mockConversationId, onError }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should invalidate queries on success", async () => {
    vi.mocked(unstarMessage).mockResolvedValueOnce(undefined);
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () => useUnstarMessage({ conversationId: mockConversationId }),
      { wrapper }
    );

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should invalidate starred messages and messages cache
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
  });

  it("should work without conversationId", async () => {
    vi.mocked(unstarMessage).mockResolvedValueOnce(undefined);
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUnstarMessage(), { wrapper });

    result.current.mutate({ messageId: "msg-1" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should only invalidate starred messages cache (not messages cache)
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
  });
});

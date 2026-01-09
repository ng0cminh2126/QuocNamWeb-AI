import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMarkConversationAsRead } from "../useMarkConversationAsRead";
import * as conversationsApi from "@/api/conversations.api";
import { conversationKeys } from "@/hooks/queries/keys/conversationKeys";
import { toast } from "sonner";

vi.mock("@/api/conversations.api");
vi.mock("sonner");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useMarkConversationAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("TC-6.1: calls markConversationAsRead API with correct ID", async () => {
    const mockMarkAsRead = vi
      .spyOn(conversationsApi, "markConversationAsRead")
      .mockResolvedValue();

    const { result } = renderHook(() => useMarkConversationAsRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ conversationId: "conv-1" });

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith("conv-1");
    });
  });

  test("TC-6.2: optimistically sets unreadCount to 0", async () => {
    vi.spyOn(conversationsApi, "markConversationAsRead").mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const queryClient = new QueryClient();
    queryClient.setQueryData(conversationKeys.groups(), {
      pages: [
        {
          data: [
            { id: "conv-1", unreadCount: 5 },
            { id: "conv-2", unreadCount: 3 },
          ],
        },
      ],
      pageParams: [],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useMarkConversationAsRead(), {
      wrapper,
    });

    result.current.mutate({ conversationId: "conv-1" });

    // Wait for optimistic update to apply
    await waitFor(() => {
      const data: any = queryClient.getQueryData(conversationKeys.groups());
      expect(data.pages[0].data[0].unreadCount).toBe(0);
    });

    const data: any = queryClient.getQueryData(conversationKeys.groups());
    expect(data.pages[0].data[1].unreadCount).toBe(3); // Unchanged
  });

  test("TC-6.3: rolls back on API error", async () => {
    vi.spyOn(conversationsApi, "markConversationAsRead").mockRejectedValue(
      new Error("Network error")
    );

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    const initialData = {
      pages: [{ data: [{ id: "conv-1", unreadCount: 5 }] }],
      pageParams: [],
    };

    queryClient.setQueryData(conversationKeys.groups(), initialData);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useMarkConversationAsRead(), {
      wrapper,
    });

    result.current.mutate({ conversationId: "conv-1" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Check rollback
    const data: any = queryClient.getQueryData(conversationKeys.groups());
    expect(data.pages[0].data[0].unreadCount).toBe(5); // Restored
  });

  test("TC-6.4: shows error toast on failure", async () => {
    vi.spyOn(conversationsApi, "markConversationAsRead").mockRejectedValue(
      new Error("API error")
    );

    const { result } = renderHook(() => useMarkConversationAsRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ conversationId: "conv-1" });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Không thể đánh dấu đã đọc", {
        description: "Vui lòng thử lại sau.",
      });
    });
  });

  test("TC-6.5: invalidates queries on success", async () => {
    vi.spyOn(conversationsApi, "markConversationAsRead").mockResolvedValue();

    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useMarkConversationAsRead(), {
      wrapper,
    });

    result.current.mutate({ conversationId: "conv-1" });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: conversationKeys.all,
      });
    });
  });
});

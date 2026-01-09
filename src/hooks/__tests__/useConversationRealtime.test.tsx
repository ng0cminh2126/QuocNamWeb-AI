import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useConversationRealtime } from "../useConversationRealtime";
import { chatHub, SIGNALR_EVENTS } from "@/lib/signalr";
import { conversationKeys } from "../queries/keys/conversationKeys";

vi.mock("@/lib/signalr", () => ({
  chatHub: {
    on: vi.fn(),
    off: vi.fn(),
  },
  SIGNALR_EVENTS: {
    MESSAGE_SENT: "MessageSent",
    RECEIVE_MESSAGE: "ReceiveMessage",
    MESSAGE_READ: "MessageRead",
    CONVERSATION_UPDATED: "ConversationUpdated",
  },
}));

describe("useConversationRealtime", () => {
  let queryClient: QueryClient;
  let eventHandlers: Map<string, Function>;

  beforeEach(() => {
    queryClient = new QueryClient();
    eventHandlers = new Map();

    vi.mocked(chatHub.on).mockImplementation(
      (event: string, handler: Function) => {
        eventHandlers.set(event, handler);
      }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    eventHandlers.clear();
  });

  test("TC-7.1: registers SignalR event listeners on mount", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useConversationRealtime(), { wrapper });

    expect(chatHub.on).toHaveBeenCalledWith(
      SIGNALR_EVENTS.MESSAGE_SENT,
      expect.any(Function)
    );
    expect(chatHub.on).toHaveBeenCalledWith(
      SIGNALR_EVENTS.MESSAGE_READ,
      expect.any(Function)
    );
  });

  test("TC-7.2: unregisters listeners on unmount", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { unmount } = renderHook(() => useConversationRealtime(), {
      wrapper,
    });

    unmount();

    expect(chatHub.off).toHaveBeenCalledTimes(8); // MESSAGE_SENT, RECEIVE_MESSAGE, MESSAGE_READ, CONVERSATION_UPDATED (doubled due to groups + directs)
  });

  test("TC-7.3: updates lastMessage when MessageSent received", async () => {
    queryClient.setQueryData(conversationKeys.groups(), {
      pages: [
        {
          data: [
            {
              id: "conv-1",
              unreadCount: 2,
              lastMessage: { content: "Old message" },
            },
          ],
        },
      ],
      pageParams: [],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useConversationRealtime(), { wrapper });

    const messageSentHandler = eventHandlers.get(SIGNALR_EVENTS.MESSAGE_SENT);
    expect(messageSentHandler).toBeDefined();

    const mockEvent = {
      conversationId: "conv-1",
      message: {
        id: "msg-new",
        content: "New message",
        senderId: "user-2",
        senderName: "User B",
        sentAt: "2026-01-07T12:00:00Z",
        conversationId: "conv-1",
        parentMessageId: null,
        contentType: "TXT" as const,
        editedAt: null,
        linkedTaskId: null,
        reactions: [],
        attachments: [],
        replyCount: 0,
        isStarred: false,
        isPinned: false,
        threadPreview: null,
        mentions: [],
      },
    };

    messageSentHandler!(mockEvent);

    await waitFor(() => {
      const data: any = queryClient.getQueryData(conversationKeys.groups());
      expect(data.pages[0].data[0].lastMessage.content).toBe("New message");
    });
  });

  test("TC-7.4: increments unreadCount if conversation is NOT active", async () => {
    queryClient.setQueryData(conversationKeys.groups(), {
      pages: [{ data: [{ id: "conv-1", unreadCount: 2 }] }],
      pageParams: [],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Active conversation is conv-2, not conv-1
    renderHook(
      () => useConversationRealtime({ activeConversationId: "conv-2" }),
      {
        wrapper,
      }
    );

    const handler = eventHandlers.get(SIGNALR_EVENTS.MESSAGE_SENT);
    handler!({
      conversationId: "conv-1",
      message: {
        id: "msg-1",
        content: "Hello",
        sentAt: new Date().toISOString(),
      },
    });

    await waitFor(() => {
      const data: any = queryClient.getQueryData(conversationKeys.groups());
      expect(data.pages[0].data[0].unreadCount).toBe(3); // Incremented
    });
  });

  test("TC-7.5: does NOT increment unreadCount if active conversation", async () => {
    queryClient.setQueryData(conversationKeys.groups(), {
      pages: [{ data: [{ id: "conv-1", unreadCount: 0 }] }],
      pageParams: [],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(
      () => useConversationRealtime({ activeConversationId: "conv-1" }),
      {
        wrapper,
      }
    );

    const handler = eventHandlers.get(SIGNALR_EVENTS.MESSAGE_SENT);
    handler!({
      conversationId: "conv-1",
      message: { id: "msg-1", sentAt: new Date().toISOString() },
    });

    await waitFor(() => {
      const data: any = queryClient.getQueryData(conversationKeys.groups());
      expect(data.pages[0].data[0].unreadCount).toBe(0); // NOT incremented
    });
  });

  test("TC-7.6: clears unreadCount when MessageRead received", async () => {
    queryClient.setQueryData(conversationKeys.groups(), {
      pages: [{ data: [{ id: "conv-1", unreadCount: 5 }] }],
      pageParams: [],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useConversationRealtime(), { wrapper });

    const handler = eventHandlers.get(SIGNALR_EVENTS.MESSAGE_READ);
    handler!({ conversationId: "conv-1", userId: "user-1" });

    await waitFor(() => {
      const data: any = queryClient.getQueryData(conversationKeys.groups());
      expect(data.pages[0].data[0].unreadCount).toBe(0); // Cleared
    });
  });

  test("TC-7.7: invalidates queries on ConversationUpdated", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderHook(() => useConversationRealtime(), { wrapper });

    const handler = eventHandlers.get(SIGNALR_EVENTS.CONVERSATION_UPDATED);
    handler!();

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: conversationKeys.all,
      });
    });
  });

  test("TC-7.8: calls onNewMessage callback when message received", async () => {
    const onNewMessage = vi.fn();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useConversationRealtime({ onNewMessage }), { wrapper });

    const handler = eventHandlers.get(SIGNALR_EVENTS.MESSAGE_SENT);
    const mockMessage = { id: "msg-1", content: "Test" };
    handler!({ conversationId: "conv-1", message: mockMessage });

    await waitFor(() => {
      expect(onNewMessage).toHaveBeenCalledWith(mockMessage);
    });
  });
});

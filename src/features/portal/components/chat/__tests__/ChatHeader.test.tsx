/**
 * Component Tests: ChatHeader
 * Testing Badge display, member count, and conversation tabs
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatHeader } from "../ChatHeader";
import type { ConversationInfoDto } from "@/types/categories";

describe("ChatHeader - v2.1.1 UI Enhancements", () => {
  describe("Badge Status Display", () => {
    it("should render Active status with processing badge (blue)", () => {
      render(
        <ChatHeader
          conversationName="Test Conversation"
          status="Active"
          memberCount={120}
        />
      );

      const badge = screen.getByText("Hoạt động");
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain("bg-brand-50");
      expect(badge.className).toContain("text-brand-600");
    });

    it("should render Archived status with neutral badge (gray)", () => {
      render(
        <ChatHeader conversationName="Test Conversation" status="Archived" />
      );

      const badge = screen.getByText("Đã lưu trữ");
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain("bg-gray-100");
      expect(badge.className).toContain("text-gray-600");
    });

    it("should render Muted status with danger badge (red)", () => {
      render(
        <ChatHeader conversationName="Test Conversation" status="Muted" />
      );

      const badge = screen.getByText("Đã tắt thông báo");
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain("bg-rose-50");
      expect(badge.className).toContain("text-rose-700");
    });
  });

  describe("Member Count Display", () => {
    it("should display member count for group conversations", () => {
      render(
        <ChatHeader
          conversationName="Team Chat"
          conversationType="GRP"
          memberCount={120}
          status="Active"
        />
      );

      expect(screen.getByText("120 thành viên")).toBeInTheDocument();
    });

    it("should NOT display member count for direct messages", () => {
      render(
        <ChatHeader
          conversationName="DM: John Doe"
          conversationType="DM"
          memberCount={2}
          status="Active"
        />
      );

      expect(screen.queryByText("2 thành viên")).not.toBeInTheDocument();
    });

    it("should NOT display member count when memberCount is 0", () => {
      render(
        <ChatHeader
          conversationName="Empty Group"
          conversationType="GRP"
          memberCount={0}
          status="Active"
        />
      );

      expect(screen.queryByText("0 thành viên")).not.toBeInTheDocument();
    });

    it("should display online count when provided", () => {
      render(
        <ChatHeader
          conversationName="Team Chat"
          memberCount={120}
          onlineCount={45}
          status="Active"
        />
      );

      expect(screen.getByText("120 thành viên")).toBeInTheDocument();
      expect(screen.getByText("45 đang online")).toBeInTheDocument();
    });
  });

  describe("Avatar Alignment", () => {
    it("should use items-start for proper alignment with category name", () => {
      const { container } = render(
        <ChatHeader
          conversationName="Test Category"
          conversationCategory="Dự án Website"
          status="Active"
        />
      );

      // Find the flex container with avatar and content
      const flexContainer = container.querySelector(".flex.items-start");
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe("Conversation Tabs (CBN-002)", () => {
    const mockConversations: ConversationInfoDto[] = [
      { conversationId: "conv-1", conversationName: "Frontend" },
      { conversationId: "conv-2", conversationName: "Backend", unreadCount: 5 },
      { conversationId: "conv-3", conversationName: "DevOps" },
    ];

    it("should render conversation tabs when categoryConversations provided", () => {
      const handleChange = vi.fn();

      render(
        <ChatHeader
          conversationName="Team Chat"
          conversationCategory="Dự án Website"
          categoryConversations={mockConversations}
          selectedConversationId="conv-1"
          onChangeConversation={handleChange}
          status="Active"
        />
      );

      expect(screen.getByText("Frontend")).toBeInTheDocument();
      expect(screen.getByText("Backend")).toBeInTheDocument();
      expect(screen.getByText("DevOps")).toBeInTheDocument();
    });

    it("should display unread count badge", () => {
      render(
        <ChatHeader
          conversationName="Team Chat"
          categoryConversations={mockConversations}
          selectedConversationId="conv-1"
          onChangeConversation={vi.fn()}
          status="Active"
        />
      );

      const unreadBadge = screen.getByText("5");
      expect(unreadBadge).toBeInTheDocument();
      expect(unreadBadge.className).toContain("bg-rose-500");
    });

    it("should call onChangeConversation when tab clicked", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ChatHeader
          conversationName="Team Chat"
          categoryConversations={mockConversations}
          selectedConversationId="conv-1"
          onChangeConversation={handleChange}
          status="Active"
        />
      );

      await user.click(screen.getByText("Backend"));

      expect(handleChange).toHaveBeenCalledWith("conv-2");
    });

    it("should NOT render tabs when categoryConversations is empty", () => {
      render(
        <ChatHeader
          conversationName="Empty Category"
          categoryConversations={[]}
          status="Active"
        />
      );

      expect(screen.queryByTestId("conversation-tabs")).not.toBeInTheDocument();
    });

    it("should NOT render tabs when categoryConversations not provided (backward compatible)", () => {
      render(
        <ChatHeader
          conversationName="Regular Chat"
          status="Active"
          memberCount={50}
        />
      );

      expect(screen.queryByTestId("conversation-tabs")).not.toBeInTheDocument();
      expect(screen.getByText("Regular Chat")).toBeInTheDocument();
      expect(screen.getByText("50 thành viên")).toBeInTheDocument();
    });
  });

  describe("Category Name Display", () => {
    it("should display category name instead of conversation name when provided", () => {
      render(
        <ChatHeader
          conversationName="Conv 123"
          conversationCategory="Dự án Website"
          status="Active"
        />
      );

      expect(screen.getByText("Dự án Website")).toBeInTheDocument();
      expect(screen.queryByText("Conv 123")).not.toBeInTheDocument();
    });

    it("should display conversation name when no category provided", () => {
      render(<ChatHeader conversationName="Direct Message" status="Active" />);

      expect(screen.getByText("Direct Message")).toBeInTheDocument();
    });
  });
});

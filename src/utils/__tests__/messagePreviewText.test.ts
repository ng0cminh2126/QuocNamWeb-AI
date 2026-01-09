import { describe, it, expect } from "vitest";
import { getMessagePreviewText } from "../messagePreviewText";
import type { Message } from "@/types/messages";
import type { FileAttachment } from "@/types/files";

// Helper to create mock FileAttachment
const createMockAttachment = (
  overrides: Partial<FileAttachment> = {}
): FileAttachment => ({
  id: "att1",
  name: "file.txt",
  originalName: "file.txt",
  mimeType: "text/plain",
  size: 1024,
  url: "https://example.com/file.txt",
  uploadedById: "user1",
  type: "other",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Helper to create mock Message
const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "1",
  groupId: "group1",
  senderId: "user1",
  sender: {
    id: "user1",
    username: "user1",
    email: "user1@test.com",
    fullName: "Test User",
    role: "staff",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  content: "",
  contentType: "text",
  isPinned: false,
  isEdited: false,
  isDeleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("messagePreviewText", () => {
  describe("getMessagePreviewText", () => {
    it("should return text content if present", () => {
      const message = createMockMessage({
        content: "Hello world",
      });
      expect(getMessagePreviewText(message)).toBe("Hello world");
    });

    it("should truncate long text to 50 characters", () => {
      const longText =
        "This is a very long message that should be truncated at 50 characters exactly";
      const message = createMockMessage({
        content: longText,
      });
      const result = getMessagePreviewText(message);
      expect(result.length).toBeLessThanOrEqual(53); // 50 + '...'
      expect(result).toContain("...");
    });

    it("should trim whitespace from text content", () => {
      const message = createMockMessage({
        content: "  Hello world  ",
      });
      expect(getMessagePreviewText(message)).toBe("Hello world");
    });

    it('should return "Đã gửi một ảnh" for single image attachment', () => {
      const message = createMockMessage({
        content: "",
        attachments: [
          createMockAttachment({
            name: "image.jpg",
            originalName: "image.jpg",
            mimeType: "image/jpeg",
            type: "image",
          }),
        ],
      });
      expect(getMessagePreviewText(message)).toBe("Đã gửi một ảnh");
    });

    it('should return "Đã gửi X ảnh" for multiple images', () => {
      const message = createMockMessage({
        content: "",
        attachments: [
          createMockAttachment({
            id: "att1",
            name: "image1.jpg",
            mimeType: "image/jpeg",
            type: "image",
          }),
          createMockAttachment({
            id: "att2",
            name: "image2.png",
            mimeType: "image/png",
            type: "image",
          }),
        ],
      });
      expect(getMessagePreviewText(message)).toBe("Đã gửi 2 ảnh");
    });

    it('should return "Đã gửi [filename]" for single file attachment', () => {
      const message = createMockMessage({
        content: "",
        attachments: [
          createMockAttachment({
            name: "document.pdf",
            mimeType: "application/pdf",
            type: "pdf",
          }),
        ],
      });
      expect(getMessagePreviewText(message)).toBe("Đã gửi document.pdf");
    });

    it("should truncate long file names to 50 characters", () => {
      const longFileName =
        "this_is_a_very_long_file_name_that_should_be_truncated_to_50_characters.pdf";
      const message = createMockMessage({
        content: "",
        attachments: [
          createMockAttachment({
            name: longFileName,
            mimeType: "application/pdf",
            type: "pdf",
          }),
        ],
      });
      const result = getMessagePreviewText(message);
      expect(result.length).toBeLessThanOrEqual(53); // 50 + '...'
      expect(result).toContain("Đã gửi");
      expect(result).toContain("...");
    });

    it("should prioritize text content over attachments", () => {
      const message = createMockMessage({
        content: "Check out this image!",
        attachments: [
          createMockAttachment({
            name: "image.jpg",
            mimeType: "image/jpeg",
            type: "image",
          }),
        ],
      });
      expect(getMessagePreviewText(message)).toBe("Check out this image!");
    });

    it("should handle mixed attachments (images and files)", () => {
      const message = createMockMessage({
        content: "",
        attachments: [
          createMockAttachment({
            id: "att1",
            name: "image.jpg",
            mimeType: "image/jpeg",
            type: "image",
          }),
          createMockAttachment({
            id: "att2",
            name: "document.pdf",
            mimeType: "application/pdf",
            type: "pdf",
          }),
        ],
      });
      // Should show first attachment type (image in this case)
      expect(getMessagePreviewText(message)).toBe("Đã gửi một ảnh");
    });

    it("should return empty string if no content and no attachments", () => {
      const message = createMockMessage({
        content: "",
      });
      expect(getMessagePreviewText(message)).toBe("");
    });

    it("should handle all supported image types", () => {
      const imageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      imageTypes.forEach((mimeType) => {
        const message = createMockMessage({
          content: "",
          attachments: [
            createMockAttachment({
              name: `image.${mimeType.split("/")[1]}`,
              mimeType,
              type: "image",
            }),
          ],
        });
        expect(getMessagePreviewText(message)).toBe("Đã gửi một ảnh");
      });
    });
  });
});

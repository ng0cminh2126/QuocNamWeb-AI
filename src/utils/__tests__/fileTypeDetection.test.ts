import { describe, it, expect } from "vitest";
import {
  isImageFile,
  getFileCategory,
  IMAGE_MIME_TYPES,
} from "../fileTypeDetection";

describe("fileTypeDetection", () => {
  describe("isImageFile", () => {
    it("should return true for image MIME types", () => {
      expect(isImageFile("image/jpeg")).toBe(true);
      expect(isImageFile("image/jpg")).toBe(true);
      expect(isImageFile("image/png")).toBe(true);
      expect(isImageFile("image/gif")).toBe(true);
      expect(isImageFile("image/webp")).toBe(true);
    });

    it("should return false for non-image MIME types", () => {
      expect(isImageFile("application/pdf")).toBe(false);
      expect(isImageFile("application/msword")).toBe(false);
      expect(isImageFile("text/plain")).toBe(false);
      expect(isImageFile("video/mp4")).toBe(false);
    });

    it("should be case-insensitive", () => {
      expect(isImageFile("IMAGE/JPEG")).toBe(true);
      expect(isImageFile("Image/Png")).toBe(true);
      expect(isImageFile("IMAGE/GIF")).toBe(true);
    });

    it("should handle empty or null contentType", () => {
      expect(isImageFile("")).toBe(false);
      expect(isImageFile(null as any)).toBe(false);
      expect(isImageFile(undefined as any)).toBe(false);
    });

    it("should handle contentType with extra whitespace", () => {
      expect(isImageFile("  image/jpeg  ")).toBe(true);
      expect(isImageFile("\timage/png\n")).toBe(true);
    });
  });

  describe("getFileCategory", () => {
    it('should return "image" for image MIME types', () => {
      expect(getFileCategory("image/jpeg")).toBe("image");
      expect(getFileCategory("image/png")).toBe("image");
    });

    it('should return "file" for non-image MIME types', () => {
      expect(getFileCategory("application/pdf")).toBe("file");
      expect(getFileCategory("text/plain")).toBe("file");
    });
  });

  describe("IMAGE_MIME_TYPES", () => {
    it("should export all supported image types", () => {
      expect(IMAGE_MIME_TYPES).toContain("image/jpeg");
      expect(IMAGE_MIME_TYPES).toContain("image/jpg");
      expect(IMAGE_MIME_TYPES).toContain("image/png");
      expect(IMAGE_MIME_TYPES).toContain("image/gif");
      expect(IMAGE_MIME_TYPES).toContain("image/webp");
      expect(IMAGE_MIME_TYPES).toHaveLength(5);
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  getFileIconType,
  getFileIconConfig,
  FILE_ICON_MAP,
} from "../fileIconMapping";
import { FileText, Sheet, Presentation, File } from "lucide-react";

describe("fileIconMapping", () => {
  describe("getFileIconType", () => {
    it('should return "pdf" for PDF MIME type', () => {
      expect(getFileIconType("application/pdf")).toBe("pdf");
    });

    it('should return "word" for Word MIME types', () => {
      expect(getFileIconType("application/msword")).toBe("word");
      expect(
        getFileIconType(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
      ).toBe("word");
    });

    it('should return "excel" for Excel MIME types', () => {
      expect(getFileIconType("application/vnd.ms-excel")).toBe("excel");
      expect(
        getFileIconType(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ).toBe("excel");
    });

    it('should return "powerpoint" for PowerPoint MIME types', () => {
      expect(getFileIconType("application/vnd.ms-powerpoint")).toBe(
        "powerpoint"
      );
      expect(
        getFileIconType(
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
      ).toBe("powerpoint");
    });

    it('should return "generic" for unknown MIME types', () => {
      expect(getFileIconType("text/plain")).toBe("generic");
      expect(getFileIconType("application/zip")).toBe("generic");
      expect(getFileIconType("video/mp4")).toBe("generic");
    });

    it("should be case-insensitive", () => {
      expect(getFileIconType("APPLICATION/PDF")).toBe("pdf");
      expect(getFileIconType("Application/Msword")).toBe("word");
    });

    it("should handle empty or null contentType", () => {
      expect(getFileIconType("")).toBe("generic");
      expect(getFileIconType(null as any)).toBe("generic");
      expect(getFileIconType(undefined as any)).toBe("generic");
    });

    it("should handle contentType with extra whitespace", () => {
      expect(getFileIconType("  application/pdf  ")).toBe("pdf");
      expect(getFileIconType("\tapplication/msword\n")).toBe("word");
    });
  });

  describe("getFileIconConfig", () => {
    it("should return correct config for PDF", () => {
      const config = getFileIconConfig("application/pdf");
      expect(config.icon).toBe(FileText);
      expect(config.color).toBe("text-red-500");
      expect(config.label).toBe("PDF");
    });

    it("should return correct config for Word", () => {
      const config = getFileIconConfig("application/msword");
      expect(config.icon).toBe(FileText);
      expect(config.color).toBe("text-blue-500");
      expect(config.label).toBe("Word");
    });

    it("should return correct config for Excel", () => {
      const config = getFileIconConfig("application/vnd.ms-excel");
      expect(config.icon).toBe(Sheet);
      expect(config.color).toBe("text-green-500");
      expect(config.label).toBe("Excel");
    });

    it("should return correct config for PowerPoint", () => {
      const config = getFileIconConfig("application/vnd.ms-powerpoint");
      expect(config.icon).toBe(Presentation);
      expect(config.color).toBe("text-orange-500");
      expect(config.label).toBe("PowerPoint");
    });

    it("should return generic config for unknown types", () => {
      const config = getFileIconConfig("text/plain");
      expect(config.icon).toBe(File);
      expect(config.color).toBe("text-gray-500");
      expect(config.label).toBe("File");
    });
  });

  describe("FILE_ICON_MAP", () => {
    it("should have all file types defined", () => {
      expect(FILE_ICON_MAP).toHaveProperty("pdf");
      expect(FILE_ICON_MAP).toHaveProperty("word");
      expect(FILE_ICON_MAP).toHaveProperty("excel");
      expect(FILE_ICON_MAP).toHaveProperty("powerpoint");
      expect(FILE_ICON_MAP).toHaveProperty("generic");
    });

    it("should have correct color classes", () => {
      expect(FILE_ICON_MAP.pdf.color).toBe("text-red-500");
      expect(FILE_ICON_MAP.word.color).toBe("text-blue-500");
      expect(FILE_ICON_MAP.excel.color).toBe("text-green-500");
      expect(FILE_ICON_MAP.powerpoint.color).toBe("text-orange-500");
      expect(FILE_ICON_MAP.generic.color).toBe("text-gray-500");
    });

    it("should use correct icons", () => {
      expect(FILE_ICON_MAP.pdf.icon).toBe(FileText);
      expect(FILE_ICON_MAP.word.icon).toBe(FileText);
      expect(FILE_ICON_MAP.excel.icon).toBe(Sheet);
      expect(FILE_ICON_MAP.powerpoint.icon).toBe(Presentation);
      expect(FILE_ICON_MAP.generic.icon).toBe(File);
    });
  });
});

/**
 * Tests for protection helper utilities
 */

import { describe, it, expect } from "vitest";
import {
  isEditableElement,
  isUserWhitelisted,
  getFileExtension,
  isProtectedFileType,
} from "../protectionHelpers";

describe("protectionHelpers", () => {
  describe("isEditableElement", () => {
    it("should identify input elements as editable", () => {
      const input = document.createElement("input");
      expect(isEditableElement(input)).toBe(true);
    });

    it("should identify textarea as editable", () => {
      const textarea = document.createElement("textarea");
      expect(isEditableElement(textarea)).toBe(true);
    });

    it("should identify contenteditable div as editable", () => {
      const div = document.createElement("div");
      div.contentEditable = "true";
      expect(isEditableElement(div)).toBe(true);
    });

    it("should identify regular div as not editable", () => {
      const div = document.createElement("div");
      expect(isEditableElement(div)).toBe(false);
    });
  });

  describe("isUserWhitelisted", () => {
    const whitelist = ["admin@test.com", "dev@test.com"];

    it("should return true for whitelisted email", () => {
      expect(isUserWhitelisted("admin@test.com", whitelist)).toBe(true);
    });

    it("should return true for whitelisted email (case insensitive)", () => {
      expect(isUserWhitelisted("ADMIN@TEST.COM", whitelist)).toBe(true);
    });

    it("should return false for non-whitelisted email", () => {
      expect(isUserWhitelisted("user@test.com", whitelist)).toBe(false);
    });

    it("should return false for null email", () => {
      expect(isUserWhitelisted(null, whitelist)).toBe(false);
    });

    it("should return false for empty string email", () => {
      expect(isUserWhitelisted("", whitelist)).toBe(false);
    });
  });

  describe("getFileExtension", () => {
    it("should extract extension from filename", () => {
      expect(getFileExtension("document.pdf")).toBe("pdf");
    });

    it("should handle multiple dots in filename", () => {
      expect(getFileExtension("my.file.name.docx")).toBe("docx");
    });

    it("should return lowercase extension", () => {
      expect(getFileExtension("FILE.PDF")).toBe("pdf");
    });

    it("should return empty string for no extension", () => {
      expect(getFileExtension("noextension")).toBe("");
    });

    it("should handle filename with only dot", () => {
      expect(getFileExtension(".hidden")).toBe("hidden");
    });
  });

  describe("isProtectedFileType", () => {
    const protectedTypes = ["pdf", "docx", "xlsx"];

    it("should return true for protected file type", () => {
      expect(isProtectedFileType("document.pdf", protectedTypes)).toBe(true);
    });

    it("should return true for protected file type (case insensitive)", () => {
      expect(isProtectedFileType("document.PDF", protectedTypes)).toBe(true);
    });

    it("should return false for non-protected file type", () => {
      expect(isProtectedFileType("document.txt", protectedTypes)).toBe(false);
    });

    it("should return false for no extension", () => {
      expect(isProtectedFileType("document", protectedTypes)).toBe(false);
    });
  });
});

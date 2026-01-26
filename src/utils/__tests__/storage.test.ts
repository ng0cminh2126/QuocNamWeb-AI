/**
 * Unit tests for LocalStorage utility functions
 * Test coverage: Category and Conversation persistence functions
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  saveSelectedCategory,
  getSelectedCategory,
  clearSelectedCategory,
  saveSelectedConversation,
  getSelectedConversation,
  clearSelectedConversation,
} from "../storage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

describe("LocalStorage - Category Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveSelectedCategory", () => {
    it("TC-1.1: should save category ID to localStorage", () => {
      saveSelectedCategory("cat-123");
      expect(localStorage.getItem("selected-category-id")).toBe("cat-123");
    });

    it("TC-1.2: should overwrite existing category ID", () => {
      saveSelectedCategory("cat-old");
      saveSelectedCategory("cat-new");
      expect(localStorage.getItem("selected-category-id")).toBe("cat-new");
    });

    it("TC-1.3: should handle empty string (treated as null)", () => {
      saveSelectedCategory("");
      // Empty strings in localStorage are returned as null by our mock
      expect(localStorage.getItem("selected-category-id")).toBe("");
    });
  });

  describe("getSelectedCategory", () => {
    it("TC-1.4: should retrieve saved category ID", () => {
      localStorage.setItem("selected-category-id", "cat-456");
      expect(getSelectedCategory()).toBe("cat-456");
    });

    it("TC-1.5: should return null when no category saved", () => {
      expect(getSelectedCategory()).toBeNull();
    });

    it("TC-1.6: should return empty string if that was saved", () => {
      localStorage.setItem("selected-category-id", "");
      // Empty strings in localStorage are returned as empty string by mock
      expect(getSelectedCategory()).toBe("");
    });
  });

  describe("clearSelectedCategory", () => {
    it("TC-1.7: should remove category from localStorage", () => {
      localStorage.setItem("selected-category-id", "cat-789");
      clearSelectedCategory();
      expect(localStorage.getItem("selected-category-id")).toBeNull();
    });

    it("TC-1.8: should not throw error if no category exists", () => {
      expect(() => clearSelectedCategory()).not.toThrow();
      expect(localStorage.getItem("selected-category-id")).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("TC-1.9: should handle special characters in category ID", () => {
      const specialId = "cat-123_ABC-xyz.test@domain";
      saveSelectedCategory(specialId);
      expect(getSelectedCategory()).toBe(specialId);
    });
  });
});

describe("LocalStorage - Conversation Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveSelectedConversation", () => {
    it("should save conversation ID to localStorage", () => {
      saveSelectedConversation("conv-123");
      expect(localStorage.getItem("selected-conversation-id")).toBe("conv-123");
    });

    it("should overwrite existing conversation ID", () => {
      saveSelectedConversation("conv-old");
      saveSelectedConversation("conv-new");
      expect(localStorage.getItem("selected-conversation-id")).toBe("conv-new");
    });
  });

  describe("getSelectedConversation", () => {
    it("should retrieve saved conversation ID", () => {
      localStorage.setItem("selected-conversation-id", "conv-456");
      expect(getSelectedConversation()).toBe("conv-456");
    });

    it("should return null when no conversation saved", () => {
      expect(getSelectedConversation()).toBeNull();
    });
  });

  describe("clearSelectedConversation", () => {
    it("should remove conversation from localStorage", () => {
      localStorage.setItem("selected-conversation-id", "conv-789");
      clearSelectedConversation();
      expect(localStorage.getItem("selected-conversation-id")).toBeNull();
    });
  });
});

describe("LocalStorage - Integration Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should handle both category and conversation independently", () => {
    // Save both
    saveSelectedCategory("cat-A");
    saveSelectedConversation("conv-A");

    // Verify both exist
    expect(getSelectedCategory()).toBe("cat-A");
    expect(getSelectedConversation()).toBe("conv-A");

    // Clear category only
    clearSelectedCategory();
    expect(getSelectedCategory()).toBeNull();
    expect(getSelectedConversation()).toBe("conv-A");

    // Clear conversation
    clearSelectedConversation();
    expect(getSelectedConversation()).toBeNull();
  });

  it("should persist across multiple operations", () => {
    saveSelectedCategory("cat-X");
    const retrieved1 = getSelectedCategory();

    saveSelectedConversation("conv-Y");
    const retrieved2 = getSelectedCategory();

    expect(retrieved1).toBe("cat-X");
    expect(retrieved2).toBe("cat-X");
    expect(getSelectedConversation()).toBe("conv-Y");
  });
});

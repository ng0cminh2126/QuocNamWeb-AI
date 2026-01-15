/**
 * Tests for useContextMenuProtection hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useContextMenuProtection } from "../useContextMenuProtection";

// Mock security config
vi.mock("@/config/security.config", () => ({
  securityConfig: {
    contextMenuProtection: {
      enabled: true,
      allowOnInputs: true,
      showCustomMenu: false,
    },
  },
}));

describe("useContextMenuProtection", () => {
  beforeEach(() => {
    // Clean up any existing event listeners
    document.removeEventListener("contextmenu", () => {});
  });

  afterEach(() => {
    // Restore all spies after each test
    vi.restoreAllMocks();
  });

  it("should register contextmenu listener when enabled", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    renderHook(() => useContextMenuProtection(true));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "contextmenu",
      expect.any(Function),
      true
    );
  });

  it("should not register listener when disabled", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    renderHook(() => useContextMenuProtection(false));

    // Should not register our specific contextmenu listener
    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "contextmenu",
      expect.any(Function),
      true
    );
  });

  it("should prevent contextmenu on div element", () => {
    renderHook(() => useContextMenuProtection(true));

    const div = document.createElement("div");
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    Object.defineProperty(event, "target", { value: div, writable: false });

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("should allow contextmenu on input element", () => {
    renderHook(() => useContextMenuProtection(true));

    const input = document.createElement("input");
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    Object.defineProperty(event, "target", { value: input, writable: false });

    document.dispatchEvent(event);

    // Should NOT prevent default for inputs
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("should cleanup on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useContextMenuProtection(true));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "contextmenu",
      expect.any(Function),
      true
    );
  });
});

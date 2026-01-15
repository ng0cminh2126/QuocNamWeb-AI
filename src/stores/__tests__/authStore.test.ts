import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useAuthStore } from "../authStore";
import { queryClient } from "@/lib/queryClient";
import * as tokenStorage from "@/lib/auth/tokenStorage";
import * as storage from "@/utils/storage";

// Mock dependencies
vi.mock("@/lib/queryClient", () => ({
  queryClient: {
    clear: vi.fn(),
  },
}));

vi.mock("@/lib/auth/tokenStorage", () => ({
  setAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
  clearAuthStorage: vi.fn(),
}));

vi.mock("@/utils/storage", () => ({
  clearSelectedConversation: vi.fn(),
}));

vi.mock("@/lib/auth/jwt", () => ({
  getTokenExpiry: vi.fn(() => Date.now() + 3600000), // 1 hour from now
}));

describe("authStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Clear all mocks
    vi.clearAllMocks();

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("loginSuccess", () => {
    it("should set user state correctly on first login", () => {
      const mockUser = {
        id: "user-123",
        identifier: "test@example.com",
        roles: ["user"],
      };

      useAuthStore.getState().loginSuccess(mockUser, "mock-token-123");

      const state = useAuthStore.getState();
      expect(state.user).toEqual({
        id: "user-123",
        identifier: "test@example.com",
        roles: ["user"],
      });
      expect(state.accessToken).toBe("mock-token-123");
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);

      expect(tokenStorage.setAccessToken).toHaveBeenCalledWith(
        "mock-token-123"
      );
    });

    it("should NOT clear cache when same user logs in again", () => {
      // First login
      const mockUser = {
        id: "user-123",
        identifier: "test@example.com",
        roles: ["user"],
      };

      useAuthStore.getState().loginSuccess(mockUser, "mock-token-123");
      vi.clearAllMocks();

      // Same user logs in again
      useAuthStore.getState().loginSuccess(mockUser, "new-token-456");

      // Should NOT clear cache for same user
      expect(queryClient.clear).not.toHaveBeenCalled();
      expect(storage.clearSelectedConversation).not.toHaveBeenCalled();
    });

    it("should clear cache when different user logs in", () => {
      // First login - User A
      const userA = {
        id: "user-A",
        identifier: "userA@example.com",
        roles: ["user"],
      };

      useAuthStore.getState().loginSuccess(userA, "token-A");
      vi.clearAllMocks();

      // Different user logs in - User B
      const userB = {
        id: "user-B",
        identifier: "userB@example.com",
        roles: ["admin"],
      };

      useAuthStore.getState().loginSuccess(userB, "token-B");

      // Should clear cache for different user
      expect(queryClient.clear).toHaveBeenCalledTimes(1);
      expect(storage.clearSelectedConversation).toHaveBeenCalledTimes(1);

      // Should set new user state
      const state = useAuthStore.getState();
      expect(state.user?.id).toBe("user-B");
      expect(state.user?.identifier).toBe("userB@example.com");
    });
  });

  describe("logout", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should clear all auth data on logout", () => {
      // Setup: User logged in
      const mockUser = {
        id: "user-123",
        identifier: "test@example.com",
        roles: ["user"],
      };

      useAuthStore.getState().loginSuccess(mockUser, "mock-token-123");
      vi.clearAllMocks();

      // Action: Logout
      useAuthStore.getState().logout();

      // Assert: Storage cleared
      expect(tokenStorage.clearAuthStorage).toHaveBeenCalled();
      expect(tokenStorage.removeAccessToken).toHaveBeenCalled();
      expect(queryClient.clear).toHaveBeenCalledTimes(1);

      // Assert: State reset
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.expiresAt).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("should call clearAuthStorage again after timeout", () => {
      useAuthStore.getState().logout();

      // Initial calls
      expect(tokenStorage.clearAuthStorage).toHaveBeenCalledTimes(1);
      expect(tokenStorage.removeAccessToken).toHaveBeenCalledTimes(1);

      // Fast-forward time
      vi.advanceTimersByTime(100);

      // Should be called again
      expect(tokenStorage.clearAuthStorage).toHaveBeenCalledTimes(2);
      expect(tokenStorage.removeAccessToken).toHaveBeenCalledTimes(2);
    });
  });

  describe("clearAuth", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should clear all auth data", () => {
      // Setup: User logged in
      const mockUser = {
        id: "user-123",
        identifier: "test@example.com",
        roles: ["user"],
      };

      useAuthStore.getState().loginSuccess(mockUser, "mock-token-123");
      vi.clearAllMocks();

      // Action: Clear auth
      useAuthStore.getState().clearAuth();

      // Assert: Storage cleared
      expect(tokenStorage.clearAuthStorage).toHaveBeenCalled();
      expect(tokenStorage.removeAccessToken).toHaveBeenCalled();
      expect(queryClient.clear).toHaveBeenCalledTimes(1);

      // Assert: State reset
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("should call clearAuthStorage again after timeout", () => {
      useAuthStore.getState().clearAuth();

      // Initial calls
      expect(tokenStorage.clearAuthStorage).toHaveBeenCalledTimes(1);
      expect(tokenStorage.removeAccessToken).toHaveBeenCalledTimes(1);

      // Fast-forward time
      vi.advanceTimersByTime(100);

      // Should be called again
      expect(tokenStorage.clearAuthStorage).toHaveBeenCalledTimes(2);
      expect(tokenStorage.removeAccessToken).toHaveBeenCalledTimes(2);
    });
  });

  describe("setUser", () => {
    it("should set user and mark as authenticated", () => {
      const mockUser = {
        id: "user-123",
        identifier: "test@example.com",
        roles: ["user"],
      };

      useAuthStore.getState().setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe("setLoading", () => {
    it("should update loading state", () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});

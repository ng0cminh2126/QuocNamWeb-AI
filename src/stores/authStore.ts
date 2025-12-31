import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { setAccessToken, removeAccessToken, clearAuthStorage } from '@/lib/auth/tokenStorage';
import { getTokenExpiry } from '@/lib/auth/jwt';
import type { LoginApiUser } from '@/types/auth';

// Auth user type (from login API)
export interface AuthUser {
  id: string;
  identifier: string;
  roles: string[];
}

interface AuthState {
  // State
  user: AuthUser | null;
  accessToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser) => void;
  loginSuccess: (user: LoginApiUser, accessToken: string) => void;
  logout: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      loginSuccess: (apiUser, accessToken) => {
        // Store token in localStorage
        setAccessToken(accessToken);

        // Parse JWT to get expiry
        const expiresAt = getTokenExpiry(accessToken);

        // Map API user to AuthUser
        const user: AuthUser = {
          id: apiUser.id,
          identifier: apiUser.identifier,
          roles: apiUser.roles,
        };

        set({
          user,
          accessToken,
          expiresAt,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Clear all storage
        clearAuthStorage();
        removeAccessToken();

        set({
          user: null,
          accessToken: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      clearAuth: () => {
        clearAuthStorage();
        removeAccessToken();

        set({
          user: null,
          accessToken: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

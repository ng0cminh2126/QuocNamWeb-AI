/**
 * useLogin Hook
 *
 * TanStack Query mutation for login
 */

import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/auth.api';
import { useAuthStore } from '@/stores/authStore';
import { getAuthErrorMessage } from '@/lib/validation/auth';
import type { LoginRequest, LoginResponse } from '@/types/auth';

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error & { errorCode?: string }) => void;
}

/**
 * Login mutation hook
 *
 * Handles API call, state update, and error handling
 */
export function useLogin(options?: UseLoginOptions) {
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      setLoading(true);
      return login(credentials);
    },
    onSuccess: (data) => {
      // Update auth store with user and token
      loginSuccess(data.user, data.accessToken);
      options?.onSuccess?.(data);
    },
    onError: (error: Error & { errorCode?: string }) => {
      setLoading(false);
      options?.onError?.(error);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

/**
 * Get user-friendly error message from login error
 */
export function getLoginErrorMessage(
  error: Error & { errorCode?: string }
): string {
  if (error.errorCode) {
    return getAuthErrorMessage(error.errorCode);
  }
  return getAuthErrorMessage('UNKNOWN_ERROR');
}

export default useLogin;

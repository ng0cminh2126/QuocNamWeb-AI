/**
 * Auth Validation Utilities
 *
 * Zod schemas for login form validation
 */

import { z } from 'zod';
import { IDENTIFIER_LABELS, IDENTIFIER_TYPE } from '@/types/auth';

// Get current identifier labels based on type
const labels = IDENTIFIER_LABELS[IDENTIFIER_TYPE];

/**
 * Login form validation schema
 * Note: Username only requires non-empty input (no format validation)
 */
export const loginSchema = z.object({
  identifier: z.string().min(1, labels.errorRequired),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Error messages mapping (API errorCode → Vietnamese)
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'Tài khoản hoặc mật khẩu không đúng',
  AUTH_ACCOUNT_LOCKED: 'Tài khoản đã bị khóa',
  AUTH_ACCOUNT_DISABLED: 'Tài khoản đã bị vô hiệu hóa',
  NETWORK_ERROR: 'Không thể kết nối. Vui lòng kiểm tra mạng.',
  UNKNOWN_ERROR: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
};

/**
 * Get localized error message from API error code
 */
export function getAuthErrorMessage(errorCode: string): string {
  return AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
}

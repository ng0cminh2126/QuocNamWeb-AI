/**
 * JWT Utilities
 *
 * Parse JWT tokens to extract claims (exp, sub, etc.)
 */

export interface JWTPayload {
  sub: string;
  jti: string;
  email: string;
  exp: number;
  iss: string;
  aud: string;
  [key: string]: unknown;
}

/**
 * Parse JWT token and extract payload
 * Returns null if token is invalid or cannot be parsed
 */
export function parseJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    // Handle URL-safe base64 and add proper padding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(paddedBase64);
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Get token expiration time in milliseconds
 * Returns null if token is invalid or has no exp claim
 */
export function getTokenExpiry(token: string): number | null {
  const payload = parseJWT(token);
  if (!payload || typeof payload.exp !== 'number') {
    return null;
  }
  // Convert seconds to milliseconds
  return payload.exp * 1000;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (expiry === null) {
    return true; // Consider invalid tokens as expired
  }
  return Date.now() >= expiry;
}

/**
 * Check if token will expire within given milliseconds
 */
export function willTokenExpireSoon(
  token: string,
  withinMs: number
): boolean {
  const expiry = getTokenExpiry(token);
  if (expiry === null) {
    return true;
  }
  return Date.now() >= expiry - withinMs;
}

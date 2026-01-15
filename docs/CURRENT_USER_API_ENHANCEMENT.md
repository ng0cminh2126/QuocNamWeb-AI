# Current User API Enhancement - Swagger Integration

**Date:** January 14, 2026  
**File Modified:** `src/utils/getCurrentUser.ts`  
**Swagger Endpoint:** `GET /api/auth/me`

## Summary

Enhanced `getCurrentUser.ts` to integrate with the Swagger-documented Identity API, implementing proper fallback handling with HTTP status code awareness.

## Changes Made

### 1. Made `getCurrentUser()` Async
**Before:** Synchronous function that only checked localStorage and returned demo user  
**After:** Async function with 5-level fallback chain

```typescript
// Fallback Priority:
1. localStorage "current_user" (immediate, synchronous)
2. localStorage "auth-storage" (immediate, synchronous)  
3. Cached API response (immediate, from memory)
4. API call to GET /api/auth/me (async, fetches from server)
5. Demo user (fallback when everything fails)
```

### 2. Enhanced `getCurrentUserFromAPI()` with Swagger Error Handling

**HTTP Status Code Handling (per Swagger spec):**

| Status | Meaning | Action |
|--------|---------|--------|
| **200** | Success | Cache user, save to localStorage, return user |
| **401** | Unauthorized (token missing/expired/invalid) | Clear localStorage, return null |
| **403** | Forbidden (access denied) | Log error, return null |
| **5xx** | Server error (API unavailable) | Log warning, return null |
| **Other** | Network/parsing errors | Log warning, return null |

**Key Features:**
- Detailed logging with error status, message, and code
- Automatic token cleanup on 401 responses
- Caching to prevent repeated API calls
- localStorage persistence across page refreshes

### 3. Added Sync Variants for Backward Compatibility

Since `getCurrentUser()` is now async, added synchronous versions for use in sync contexts:

#### `getCurrentUserIdSync(): string`
- Gets user ID from localStorage/cache only (no API call)
- Fast, synchronous execution
- Falls back to demo user ID

#### `isAuthenticatedUserSync(): boolean`
- Checks localStorage/cache only
- Determines if user is logged in without API call
- Fast for UI conditionals

#### `isAuthenticatedUser(): Promise<boolean>` (Async)
- Checks localStorage first (fast path)
- Falls back to API check if needed
- Comprehensive authentication verification

## Code Examples

### Using the Async Version (Recommended)
```typescript
// In async components or effects
const user = await getCurrentUser();
console.log(user.id); // Guaranteed to have user data or demo user

// Check authentication with API fallback
const isAuthenticated = await isAuthenticatedUser();
if (!isAuthenticated) {
  // Redirect to login
}
```

### Using the Sync Version (Fallback)
```typescript
// For immediate ID access without async/await
const userId = getCurrentUserIdSync();

// For quick auth check in sync contexts
const isLoggedIn = isAuthenticatedUserSync();
```

## Behavior Flow

```
getCurrentUser() called
    ↓
✅ Check localStorage "current_user"
    ↓ (not found)
✅ Check localStorage "auth-storage" 
    ↓ (not found)
✅ Check cached API response
    ↓ (not found)
✅ Call API: GET /api/auth/me
    ├─ 200: Save to cache & localStorage → Return user
    ├─ 401: Clear localStorage → Return null → Use demo user
    ├─ 403: Return null → Use demo user  
    ├─ 5xx: Return null → Use demo user
    └─ Other: Return null → Use demo user
    ↓
✅ Return demo user as final fallback
```

## Migration Guide

### For Components Currently Using `getCurrentUser()` (Sync)

**Old code:**
```typescript
const user = getCurrentUser();
```

**New code (Option 1 - Async):**
```typescript
useEffect(() => {
  const fetchUser = async () => {
    const user = await getCurrentUser();
    setUser(user);
  };
  fetchUser();
}, []);
```

**New code (Option 2 - Sync for immediate need):**
```typescript
const userId = getCurrentUserIdSync(); // Fast, no API
```

### For Components Using `getCurrentUserId()` (Sync)

**Old code:**
```typescript
const userId = getCurrentUserId(); // Was synchronous
```

**New code (Option 1 - Async):**
```typescript
const userId = await getCurrentUserId();
```

**New code (Option 2 - Keep sync):**
```typescript
const userId = getCurrentUserIdSync(); // Renamed sync version
```

### For Components Using `isAuthenticatedUser()` (Sync)

**Old code:**
```typescript
if (isAuthenticatedUser()) { }
```

**New code (Option 1 - Async):**
```typescript
if (await isAuthenticatedUser()) { }
```

**New code (Option 2 - Keep sync):**
```typescript
if (isAuthenticatedUserSync()) { }
```

## Benefits

✅ **Swagger Compliant** - Fully implements Identity API endpoint behavior  
✅ **HTTP Status Aware** - Handles 401, 403, 5xx appropriately  
✅ **Token Cleanup** - Clears invalid tokens on 401  
✅ **Automatic Caching** - Avoids repeated API calls  
✅ **Graceful Degradation** - Falls back to demo user when API unavailable  
✅ **Backward Compatible** - Sync variants provided for existing code  
✅ **Better Error Logging** - Detailed debugging information  

## Files Impacted

### Modified:
- `src/utils/getCurrentUser.ts` - 286 lines (enhanced with API integration)

### Potentially Need Updates:
- Any component importing `getCurrentUser`, `getCurrentUserId`, or `isAuthenticatedUser`
- Consider adding async/await or using sync variants

## Testing Checklist

- [ ] Test localStorage "current_user" path (should be instant)
- [ ] Test localStorage "auth-storage" path (should be instant)  
- [ ] Test API call with valid token (should cache result)
- [ ] Test API call with 401 (should clear tokens)
- [ ] Test API call with network error (should fallback to demo)
- [ ] Test repeated calls (should use cache on 2nd call)
- [ ] Test page refresh (should load from localStorage)

## Notes

- The demo user `u_thanh_truc` is the final fallback and won't be removed by API changes
- API is only called when localStorage is empty (efficient)
- Cached responses avoid thundering herd problems
- Token cleanup on 401 helps prevent redirect loops

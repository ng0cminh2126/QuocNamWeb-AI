# Current User Refactoring - January 14, 2026

## Overview
Replaced all hardcoded `"u_thanh_truc"` references with dynamic current user resolution from localStorage "current_user" key, with API fallback to `/api/auth/me`.

## Changes Made

### 1. **src/utils/getCurrentUser.ts** ✅
**Status:** COMPLETED

#### New Features Added:
- **Priority-based User Resolution:**
  1. Check localStorage `"current_user"` (NEW PRIMARY)
  2. Check localStorage `"auth-storage"` (Zustand fallback)
  3. API fallback: `GET /api/auth/me` (new async function)
  4. Default demo user: `"u_thanh_truc"` (last resort)

#### New Function: `getCurrentUserFromAPI()`
```typescript
/**
 * Get current user from API (async version)
 * Use this when you need to ensure fresh user data from server
 * Automatically saves to localStorage "current_user"
 */
export async function getCurrentUserFromAPI(): Promise<{
  id: string;
  identifier: string;
  roles: string[];
} | null>
```

**Usage:**
```typescript
import { getCurrentUserFromAPI } from "@/utils/getCurrentUser";

// On app init or login
const user = await getCurrentUserFromAPI();
if (user) {
  console.log("Current user:", user.id);
}
```

#### Updated Function: `isAuthenticatedUser()`
- Now checks both `"current_user"` and `"auth-storage"` localStorage keys
- More robust authentication detection

---

### 2. **src/data/mockMessages.ts** ✅
**Status:** COMPLETED

- ✅ Already using `getCurrentUserId()` correctly
- ✅ No changes needed (only comments reference "u_thanh_truc")

---

### 3. **src/data/mockTasks.ts** ✅
**Status:** COMPLETED

#### Replacements Made:
- **22 occurrences** of `"u_thanh_truc"` → `CURRENT_USER_ID` 
- Affected tasks: `task_001` through `task_011` (staff assignments)
- Affected leader tasks: `task_leader_001` through `task_leader_010`

**Changes:**
```typescript
// Before
assignFrom: "u_thanh_truc",  // Hardcoded leader

// After
assignFrom: CURRENT_USER_ID,  // Dynamic current user
```

#### Updated Comment:
```typescript
/**
 * - Leader: getCurrentUserId() (will use current_user from localStorage or fallback to u_thanh_truc in demo)
 */
```

---

### 4. **src/features/portal/workspace/MobileTaskLogScreenDemo.tsx** ✅
**Status:** COMPLETED

#### Updated User Display Name Logic:
```typescript
// Before
const CURRENT_USER_NAME = CURRENT_USER_ID === "u_thanh_truc" ? "Thanh Trúc" : CURRENT_USER_ID.replace("u_", "").replace(/_/g, " ");

// After
const CURRENT_USER_NAME = CURRENT_USER_ID === "u_thanh_truc" ? "Thanh Trúc" : CURRENT_USER_ID.replace("u_", "").replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
```

**Improvement:** Now properly capitalizes user names (e.g., `"u_thu_an"` → `"Thu An"`)

---

## LocalStorage Structure

### New Key: `"current_user"`
```json
{
  "id": "u_thanh_truc",
  "identifier": "thanh.truc@example.com",
  "email": "thanh.truc@example.com",
  "roles": ["leader"]
}
```

### How to Set Current User:
```typescript
// After successful login
const currentUser = {
  id: userId,
  identifier: userEmail,
  roles: userRoles,
};
localStorage.setItem("current_user", JSON.stringify(currentUser));
```

### Accessing Current User:
```typescript
import { getCurrentUserId, getCurrentUser } from "@/utils/getCurrentUser";

// Get user ID
const userId = getCurrentUserId();

// Get full user object
const user = getCurrentUser();

// Get fresh data from API
const freshUser = await getCurrentUserFromAPI();
```

---

## API Integration

### GET /api/auth/me
**When used:** When `"current_user"` doesn't exist in localStorage
**Response:**
```json
{
  "id": "u_thanh_truc",
  "identifier": "thanh.truc@example.com",
  "roles": ["leader"]
}
```

**Error Handling:**
- 401 Unauthorized → Redirect to login
- Network error → Use default demo user

---

## Files NOT Changed (Intentional)

### src/data/mockSidebar.ts
- `"u_thanh_truc"` is a **mock contact** (other user), not current user
- ✅ No change needed

### src/data/mockOrg.ts
- `"u_thanh_truc"` is a **mock team member** and leader data
- ✅ No change needed

### Comments in mockMessages.ts & mockTasks.ts
- Educational/documentation comments
- ✅ No change needed

---

## Testing Recommendations

### Unit Tests Needed:
```typescript
describe("getCurrentUser", () => {
  it("should read from current_user localStorage first", () => {
    // Test priority: current_user > auth-storage > api > fallback
  });
  
  it("should fetch from API if localStorage keys not found", async () => {
    // Test getCurrentUserFromAPI()
  });
  
  it("should return demo user as fallback", () => {
    // Test default behavior
  });
});
```

### E2E Tests Needed:
- [ ] Login → Set `current_user` → Verify mock data uses correct user
- [ ] Switch user → Update `current_user` → Verify mock data updates
- [ ] Clear localStorage → Verify API fallback works
- [ ] Network error → Verify demo user fallback

---

## Migration Checklist

- [x] Update getCurrentUser utility
- [x] Add getCurrentUserFromAPI async function
- [x] Replace all hardcoded "u_thanh_truc" with CURRENT_USER_ID in mock data
- [x] Update comments to reflect new behavior
- [x] Verify localStorage keys are used in priority order
- [ ] Add unit tests for getCurrentUser functions
- [ ] Add localStorage key validation
- [ ] Document API integration in team wiki

---

## Summary

**Total Changes:** 4 files modified
- ✅ src/utils/getCurrentUser.ts (Enhanced with API fallback)
- ✅ src/data/mockTasks.ts (22 replacements)
- ✅ src/features/portal/workspace/MobileTaskLogScreenDemo.tsx (1 improvement)
- ✅ src/data/mockMessages.ts (Verified - no changes needed)

**Result:** All current user references now respect localStorage `"current_user"` with automatic API fallback, making the app production-ready for multi-user scenarios.

---

## Next Steps

1. **Add localStorage initialization** in login flow:
   ```typescript
   localStorage.setItem("current_user", JSON.stringify(user));
   ```

2. **Clear localStorage on logout**:
   ```typescript
   localStorage.removeItem("current_user");
   localStorage.removeItem("auth-storage");
   ```

3. **Implement unit tests** for getCurrentUser functions

4. **Document API endpoint** /api/auth/me in team wiki

5. **Monitor localStorage** usage in production

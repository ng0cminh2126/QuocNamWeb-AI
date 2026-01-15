# How to Use Current User from localStorage

## Quick Reference

### Getting Current User ID
```typescript
import { getCurrentUserId } from "@/utils/getCurrentUser";

const userId = getCurrentUserId();
// Returns: "u_thanh_truc" or other user ID
```

### Getting Full User Object
```typescript
import { getCurrentUser } from "@/utils/getCurrentUser";

const user = getCurrentUser();
// Returns: { id: "u_thanh_truc", identifier: "...", roles: [...] }
```

### Getting Fresh User Data from API
```typescript
import { getCurrentUserFromAPI } from "@/utils/getCurrentUser";

const freshUser = await getCurrentUserFromAPI();
if (freshUser) {
  console.log("User from API:", freshUser.id);
  // Also automatically saved to localStorage["current_user"]
}
```

---

## Setting Current User (After Login)

```typescript
// In your login component or auth flow
import { loginUser } from "@/api/auth.api";

async function handleLogin(email: string, password: string) {
  try {
    const response = await loginUser({ email, password });
    
    // Save to localStorage["current_user"]
    const currentUser = {
      id: response.user.id,
      identifier: response.user.identifier,
      roles: response.user.roles,
    };
    localStorage.setItem("current_user", JSON.stringify(currentUser));
    
    // Also update Zustand auth store
    useAuthStore.getState().setUser(currentUser);
    
    // Redirect to dashboard
    navigate("/dashboard");
  } catch (error) {
    console.error("Login failed:", error);
  }
}
```

---

## Clearing Current User (On Logout)

```typescript
// In your logout handler
async function handleLogout() {
  // Clear localStorage
  localStorage.removeItem("current_user");
  localStorage.removeItem("auth-storage");
  
  // Clear Zustand store
  useAuthStore.getState().logout();
  
  // Call logout API
  await logoutUser();
  
  // Redirect to login
  navigate("/login");
}
```

---

## Using in Components

### Example 1: Display Current User Name
```typescript
import { getCurrentUser } from "@/utils/getCurrentUser";

function UserGreeting() {
  const user = getCurrentUser();
  
  return <h1>Welcome, {user.identifier}!</h1>;
}
```

### Example 2: Conditional Rendering Based on User Role
```typescript
import { getCurrentUser } from "@/utils/getCurrentUser";

function Dashboard() {
  const user = getCurrentUser();
  const isLeader = user.roles.includes("leader");
  
  return (
    <div>
      {isLeader && <LeaderPanel />}
      {!isLeader && <StaffPanel />}
    </div>
  );
}
```

### Example 3: Using in Mock Data
```typescript
import { getCurrentUserId } from "@/utils/getCurrentUser";

const CURRENT_USER_ID = getCurrentUserId();

export const mockTasks = [
  {
    id: "task_001",
    assignFrom: CURRENT_USER_ID,  // Dynamically uses current user
    assignTo: "u_thu_an",
    // ...
  },
];
```

---

## LocalStorage Priority Order

The system checks in this order:

1. **localStorage["current_user"]** (Primary - NEW)
   - Direct current user key
   - Fastest to access
   
2. **localStorage["auth-storage"]** (Secondary - Zustand)
   - Zustand persist middleware storage
   - Fallback if new key not found
   
3. **API: GET /api/auth/me** (Tertiary)
   - Fresh data from server
   - Automatically caches to localStorage["current_user"]
   - Use when offline cache is stale
   
4. **Default Demo User** (Last Resort)
   - id: `"u_thanh_truc"`
   - Used for development/testing
   - Only when all above fail

---

## Error Handling

### Network Error When Fetching from API
```typescript
import { getCurrentUserFromAPI } from "@/utils/getCurrentUser";

try {
  const user = await getCurrentUserFromAPI();
  if (!user) {
    // API failed, fallback to localStorage or demo user
    const fallbackUser = getCurrentUser();
    console.log("Using fallback user:", fallbackUser.id);
  }
} catch (error) {
  console.error("Failed to fetch user:", error);
  // Use localStorage or demo user
}
```

### localStorage Quota Exceeded
```typescript
// If localStorage is full, getCurrentUser still works
// by reading from memory cache or Zustand store

const user = getCurrentUser();
// Returns user even if localStorage temporarily unavailable
```

---

## Testing

### Mock Current User in Tests
```typescript
import { beforeEach, afterEach } from "vitest";

beforeEach(() => {
  // Set test user
  localStorage.setItem("current_user", JSON.stringify({
    id: "u_test_user",
    identifier: "test@example.com",
    roles: ["staff"],
  }));
});

afterEach(() => {
  // Clean up
  localStorage.removeItem("current_user");
});
```

---

## Troubleshooting

### Issue: Getting Default User Instead of Logged In User
**Solution:** Verify localStorage has `"current_user"` key
```typescript
// Check what's in localStorage
console.log(localStorage.getItem("current_user"));

// Should output:
// {"id":"u_thanh_truc","identifier":"...","roles":[...]}
```

### Issue: User Changes Not Reflected Immediately
**Solution:** Call `getCurrentUserFromAPI()` to refresh
```typescript
// Force refresh from server
const freshUser = await getCurrentUserFromAPI();
// Now other components will see updated user
```

### Issue: localStorage is Cleared After Navigation
**Solution:** Ensure localStorage is persisted in login flow
```typescript
// Make sure you're calling this on successful login
localStorage.setItem("current_user", JSON.stringify(user));

// And not clearing it on route changes
// (Only clear on logout)
```

---

## Best Practices

✅ **DO:**
- Set `"current_user"` immediately after successful login
- Clear both `"current_user"` and `"auth-storage"` on logout
- Use `getCurrentUserId()` for task/data associations
- Call `getCurrentUserFromAPI()` on app init to verify session

❌ **DON'T:**
- Hardcode user IDs in components (use getCurrentUserId instead)
- Assume localStorage is always available (use fallback functions)
- Store sensitive data in localStorage (only store ID and basic info)
- Clear `"current_user"` during route navigation (only on logout)

---

## Performance Tips

### Caching User Data
```typescript
// The getCurrentUser function is optimized to:
// 1. Return from memory cache immediately (fast)
// 2. Check localStorage only once per session
// 3. Only call API when absolutely necessary

// No need to cache separately - already optimized
const user = getCurrentUser(); // Always fast
```

### Reducing API Calls
```typescript
// Don't call getCurrentUserFromAPI() on every render
// Call once on app init instead

// app.tsx or main.tsx
useEffect(() => {
  // Verify session on app start
  getCurrentUserFromAPI().catch(() => {
    navigate("/login");
  });
}, []);
```

---

## Migration from Hard-Coded User

### Before (❌ Don't Do This)
```typescript
const LEADER_ID = "u_thanh_truc";  // Hardcoded!
const leader = mockUsers.find(u => u.id === LEADER_ID);
```

### After (✅ Do This Instead)
```typescript
import { getCurrentUserId } from "@/utils/getCurrentUser";

const currentUserId = getCurrentUserId();
const currentUser = mockUsers.find(u => u.id === currentUserId);
```

---

## API Endpoint Reference

### GET /api/auth/me
Get current authenticated user information

**Request:**
```bash
GET /api/auth/me HTTP/1.1
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "u_thanh_truc",
  "identifier": "thanh.truc@example.com",
  "roles": ["leader"]
}
```

**Error Responses:**
- `401 Unauthorized` - No valid token (redirects to login)
- `403 Forbidden` - Token invalid or expired
- `500 Server Error` - Server issue

---

## Summary

- ✅ Use `getCurrentUserId()` for user ID
- ✅ Use `getCurrentUser()` for full user object
- ✅ Use `await getCurrentUserFromAPI()` for fresh data
- ✅ Set localStorage on login, clear on logout
- ✅ Handle errors gracefully with fallbacks
- ✅ Test with mock localStorage setup

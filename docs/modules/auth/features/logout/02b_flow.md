# 🗺️ Logout Feature - User Flow Document

> **[BƯỚC 2B]** User Flow & Navigation Logic  
> **Feature ID:** `AUTH-002`  
> **Module:** Auth  
> **Version:** v1.0  
> **Last Updated:** 2025-12-27  
> **Status:** ⏳ PENDING APPROVAL

---

## 📐 Overview

Logout là một flow đơn giản, chỉ có 1 happy path và 0 error states (vì là client-side only).

---

## 🎯 Main Flow - Happy Path

```
┌────────────────────────────────────────────────────────────────┐
│  START: User trong màn hình Portal (/portal)                 │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  User click vào Avatar Button (bottom of MainSidebar)        │
│  Icon: Tròn với initials "DM"                                │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  Profile Popover mở ra (bên phải avatar)                      │
│  Hiển thị:                                                     │
│  - "Xin chào {userName}"                                      │
│  - Button "Đăng xuất" với LogOut icon                         │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  User click "Đăng xuất" button                                │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  Frontend executes:                                            │
│  1. Close popover                                             │
│  2. Call authStore.logout()                                   │
│  3. Clear localStorage (accessToken)                          │
│  4. Clear Zustand persist storage (auth-storage)              │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  React Router navigate("/login")                              │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  Login Page displayed                                          │
│  User can login again                                          │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  END: User logged out successfully                            │
└────────────────────────────────────────────────────────────────┘
```

---

## 🛤️ Detailed Step-by-Step Flow

### Step 1: User Opens Profile Popover

**Trigger:** Click avatar button in MainSidebar

**UI State:**
- Popover state: `openProfile = true`
- Avatar button: Highlighted (active state)
- Popover: Visible, positioned right of avatar

**User sees:**
```
┌──────────────────────────────────┐
│  Xin chào Diễm My               │
│                                  │
│  [🚪] Đăng xuất                 │
└──────────────────────────────────┘
```

---

### Step 2: User Clicks Logout Button

**Trigger:** Click "Đăng xuất" button

**onClick handler:**
```typescript
onClick={() => {
  setOpenProfile(false);  // Close popover
  onSelect("logout");     // Trigger logout handler
}}
```

**UI State:**
- Popover closes immediately
- MainSidebar still visible (momentarily)

---

### Step 3: Logout Handler Execution

**In PortalWireframes.tsx:**

```typescript
// MainSidebar onSelect callback
onSelect={(key) => {
  if (key === "logout") {
    handleLogout();  // NEW handler
    return;
  }
  // ... other handlers
}}
```

**handleLogout function:**

```typescript
const handleLogout = () => {
  // 1. Clear auth store
  authStore.logout();  // Calls clearAuthStorage() + removeAccessToken()
  
  // 2. Navigate to login
  navigate("/login");
};
```

**authStore.logout() does:**
- Call `clearAuthStorage()` from tokenStorage
- Call `removeAccessToken()` from tokenStorage
- Set state: `{ user: null, accessToken: null, isAuthenticated: false }`

---

### Step 4: Navigation to Login

**React Router navigate("/login")**

**ProtectedRoute logic:**
- Checks `isAuthenticated` from authStore
- Since `isAuthenticated = false` → redirect to `/login`
- Login page renders

**User sees:**
- Login form
- Can login again with credentials

---

## 🚦 State Transitions

### Auth Store State

```typescript
// BEFORE logout
{
  user: { id: "123", identifier: "user@example.com", roles: ["staff"] },
  accessToken: "eyJhbGc...",
  expiresAt: 1735294800000,
  isAuthenticated: true,
  isLoading: false
}

// AFTER logout
{
  user: null,
  accessToken: null,
  expiresAt: null,
  isAuthenticated: false,
  isLoading: false
}
```

### LocalStorage State

```typescript
// BEFORE logout
localStorage.getItem("auth-storage") // Contains persisted auth state
localStorage.getItem("accessToken")  // "eyJhbGc..."

// AFTER logout
localStorage.getItem("auth-storage") // null or empty
localStorage.getItem("accessToken")  // null
```

---

## 🔀 Alternative Flows

### Flow 2: Session Expired (Auto Logout)

**Không thuộc scope của feature này.** Sẽ được handle bởi token refresh logic.

### Flow 3: Network Error During Logout

**Không áp dụng** vì logout là client-side only, không gọi API.

---

## 🧭 Navigation Map

```
┌──────────────────────────────────────────────────────────┐
│                    Application Routes                    │
└──────────────────────────────────────────────────────────┘

/ (Home)
  │
  ├─ Protected ✅ → Redirect to /portal
  │
/login
  │
  ├─ Public ✅ → Login Form
  │
/portal
  │
  ├─ Protected ✅ → Portal Main UI
  │    │
  │    ├─ /portal/workspace (default)
  │    ├─ /portal/lead
  │    └─ ... other portal routes
  │
  └─ After logout → Redirect to /login ⬅️ OUR FLOW
```

---

## ⏱️ Timing & Performance

| Action                    | Expected Time | Notes                  |
| ------------------------- | ------------- | ---------------------- |
| Click logout button       | Instant       | UI response            |
| Close popover             | < 50ms        | State update           |
| Clear auth store          | < 50ms        | Zustand state update   |
| Clear localStorage        | < 50ms        | Browser API            |
| Navigate to /login        | < 200ms       | React Router           |
| Render login page         | < 300ms       | Component mount        |
| **Total logout time**     | **< 500ms**   | Full flow complete     |

---

## 🔒 Security Considerations

### What Gets Cleared

✅ **Cleared on logout:**
- `localStorage.accessToken`
- `localStorage.auth-storage` (Zustand persist)
- Zustand authStore state (in-memory)

❌ **NOT cleared on logout:**
- TanStack Query cache (intentionally kept for performance)
- Browser cookies (none used for auth)
- Session storage (not used)

### Protected Routes Behavior

**After logout:**
1. User state: `isAuthenticated = false`
2. ProtectedRoute checks auth → fails
3. Automatic redirect to `/login`
4. User cannot access `/portal` without login

---

## ⏳ PENDING DECISIONS (Cần HUMAN quyết định)

| #   | Vấn đề                               | Lựa chọn                 | HUMAN Decision |
| --- | ------------------------------------ | ------------------------ | -------------- |
| 1   | Clear TanStack Query cache không?    | Yes (clear) or No (keep) | ⬜ **No**      |
| 2   | Có loading animation khi logout không? | Yes or No              | ⬜ **No**      |
| 3   | Redirect URL sau logout             | /login or / (root)       | ⬜ **/login**  |

> ⚠️ **AI KHÔNG ĐƯỢC tiếp tục nếu có mục chưa được HUMAN điền**

---

## ⚠️ HUMAN CONFIRMATION

| Hạng mục                   | Status         |
| -------------------------- | -------------- |
| Đã review Main Flow        | ⬜ Chưa review |
| Đã review State Transitions | ⬜ Chưa review |
| Đã review Security         | ⬜ Chưa review |
| Đã điền Pending Decisions  | ⬜ Chưa điền   |
| **APPROVED để tiếp tục**   | ⬜ PENDING     |

**HUMAN Signature:** ______  
**Date:** ______

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC chuyển sang BƯỚC 3 nếu chưa APPROVED**

---

## 🔄 Related Documentation

- **Requirements:** [01_requirements.md](./01_requirements.md)
- **Wireframe:** [02a_wireframe.md](./02a_wireframe.md)
- **API Contract (next):** [03_api-contract.md](./03_api-contract.md)

---

## 📝 Notes

- Logout flow rất đơn giản, không có edge cases phức tạp
- Không cần handle network errors vì không gọi API
- Redirect đảm bảo user không còn access protected routes
- TanStack Query cache giữ lại để cải thiện performance khi login lại

---

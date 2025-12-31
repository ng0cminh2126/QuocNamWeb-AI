# 📡 Logout Feature - API Contract Reference

> **[BƯỚC 3]** API Contract & Integration  
> **Feature ID:** `AUTH-002`  
> **Module:** Auth  
> **Version:** v1.0  
> **Last Updated:** 2025-12-27  
> **Status:** ✅ READY (No API required)

---

## 📐 Overview

Logout feature **KHÔNG cần gọi API backend**. Tất cả logic được thực hiện ở client-side.

---

## 🚫 Why No API Logout?

### Current Backend Architecture

Backend hiện tại sử dụng **JWT stateless authentication**:
- Access tokens được validate bằng JWT signature
- Không có session storage trên server
- Tokens không thể bị revoke trước khi expire (theo design hiện tại)

### Client-Side Logout Strategy

**Logout chỉ cần:**
1. Xóa access token khỏi localStorage
2. Clear auth state khỏi Zustand store
3. Redirect về login page

**Kết quả:**
- User không còn token để authenticate
- Protected routes tự động redirect về login
- Token cũ sẽ tự expire theo thời gian (JWT expiration)

---

## 🔒 Security Implications

### ✅ Advantages (Current Approach)

- **Đơn giản:** Không cần network request
- **Nhanh:** Logout instant, không chờ API response
- **Offline-friendly:** Hoạt động ngay cả khi mất mạng
- **Less server load:** Không tốn resource backend

### ⚠️ Limitations

- **Token vẫn valid trên server** cho đến khi expire
  - Nếu attacker lấy được token cũ, họ vẫn dùng được đến khi token hết hạn
  - Mitigation: Tokens có expiration ngắn (thường 15-60 phút)

- **Không có logout từ all devices**
  - User chỉ logout khỏi device hiện tại
  - Các device khác vẫn authenticated nếu có token

### 🔮 Future Enhancements (Out of Scope v1.0)

Nếu backend cần revoke tokens ngay lập tức, có thể implement:

1. **Token Blacklist:**
   ```
   POST /auth/logout
   Body: { accessToken: "..." }
   → Backend adds token to blacklist
   → All subsequent requests with this token rejected
   ```

2. **Refresh Token Revocation:**
   ```
   POST /auth/revoke-refresh-token
   → Revoke refresh token to prevent new access tokens
   ```

3. **Session Management:**
   ```
   POST /auth/logout-all-devices
   → Invalidate all tokens của user
   ```

---

## 🔧 Client-Side Implementation

### 1. Auth Store Method

**File:** `src/stores/authStore.ts`

**Existing method:**

```typescript
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
}
```

**This method already exists!** Chỉ cần gọi nó.

### 2. Token Storage Functions

**File:** `src/lib/auth/tokenStorage.ts`

**Functions used:**

```typescript
// Remove access token from localStorage
export function removeAccessToken(): void {
  localStorage.removeItem("accessToken");
}

// Clear all auth-related storage
export function clearAuthStorage(): void {
  localStorage.removeItem("auth-storage"); // Zustand persist key
  localStorage.removeItem("accessToken");
}
```

---

## 📊 Data Flow Diagram

```
┌────────────────────────────────────────────────────────────┐
│  User clicks "Đăng xuất" button                           │
└────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│  Frontend Handler (PortalWireframes.tsx)                  │
│  ─────────────────────────────────────────────────────────│
│  const handleLogout = () => {                             │
│    authStore.logout();  // ← Call Zustand action          │
│    navigate("/login");  // ← React Router                 │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│  Zustand authStore.logout()                               │
│  ─────────────────────────────────────────────────────────│
│  1. clearAuthStorage()    → Remove from localStorage      │
│  2. removeAccessToken()   → Remove token key              │
│  3. set({ ... })          → Clear Zustand state           │
└────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│  localStorage (Browser API)                               │
│  ─────────────────────────────────────────────────────────│
│  - "auth-storage" removed ✅                              │
│  - "accessToken" removed ✅                               │
└────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│  React Router navigate("/login")                          │
│  ─────────────────────────────────────────────────────────│
│  - Route change triggered                                 │
│  - Login page component mounts                            │
└────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│  ProtectedRoute checks isAuthenticated                    │
│  ─────────────────────────────────────────────────────────│
│  - authStore.isAuthenticated = false                      │
│  - Blocks access to /portal routes                        │
│  - User must login again                                  │
└────────────────────────────────────────────────────────────┘
```

---

## 🔗 Integration Points

### 1. PortalWireframes Component

**File:** `src/features/portal/PortalWireframes.tsx`

**Add logout handler:**

```typescript
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function PortalWireframes({ portalMode = "desktop" }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // In MainSidebar onSelect callback:
  onSelect={(key) => {
    if (key === "logout") {
      handleLogout();
      return;
    }
    // ... existing logic
  }}
}
```

### 2. MainSidebar Component

**File:** `src/features/portal/components/MainSidebar.tsx`

**Already implemented!** Just pass logout to onSelect:

```typescript
// Lines 279-287 (already exists)
<button
  onClick={() => {
    setOpenProfile(false);
    onSelect("logout");  // ← This triggers logout
  }}
  className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-brand-50 text-gray-700"
  data-testid="logout-button"
>
  <LogOut className="h-4 w-4 text-gray-600" />
  <span>Đăng xuất</span>
</button>
```

---

## ⏳ PENDING DECISIONS (Cần HUMAN quyết định)

| #   | Vấn đề                                  | Lựa chọn    | HUMAN Decision |
| --- | --------------------------------------- | ----------- | -------------- |
| 1   | Cần implement API logout trong tương lai? | Yes or No | ⬜ **\_\_**    |

> ⚠️ **AI KHÔNG ĐƯỢC tiếp tục nếu có mục chưa được HUMAN điền**

---

## ⚠️ HUMAN CONFIRMATION

| Hạng mục                        | Status         |
| ------------------------------- | -------------- |
| Đã review Client-Side Strategy  | ⬜ Chưa review |
| Đã review Security Implications | ⬜ Chưa review |
| Đã review Data Flow             | ⬜ Chưa review |
| Đã điền Pending Decisions       | ⬜ Chưa điền   |
| **APPROVED để tiếp tục**        | ⬜ PENDING     |

**HUMAN Signature:** ______  
**Date:** ______

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC chuyển sang BƯỚC 4 nếu chưa APPROVED**

---

## 🔄 Related Documentation

- **Requirements:** [01_requirements.md](./01_requirements.md)
- **User Flow:** [02b_flow.md](./02b_flow.md)
- **Implementation Plan (next):** [04_implementation-plan.md](./04_implementation-plan.md)
- **Login API Contract:** [../login/03_api-contract.md](../login/03_api-contract.md)

---

## 📝 Notes

- Backend không yêu cầu logout API call
- JWT tokens tự expire sau thời gian configured
- Security trade-off: Simple vs Immediate revocation
- Có thể enhance sau với token blacklist nếu cần

---

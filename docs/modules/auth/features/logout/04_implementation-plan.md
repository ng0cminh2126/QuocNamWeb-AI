# 🛠️ Logout Feature - Implementation Plan

> **[BƯỚC 4]** Implementation Plan & Technical Checklist  
> **Feature ID:** `AUTH-002`  
> **Module:** Auth  
> **Version:** v1.0  
> **Last Updated:** 2025-12-27  
> **Status:** ⏳ PENDING APPROVAL

---

## 📊 IMPACT SUMMARY (Tóm tắt thay đổi)

### Files sẽ tạo mới:
- None (UI đã có sẵn)

### Files sẽ sửa đổi:
- `src/features/portal/PortalWireframes.tsx`
  - Thêm `handleLogout` function
  - Import `useNavigate` from react-router-dom
  - Import `useAuthStore` từ stores
  - Kết nối logout handler vào MainSidebar `onSelect` callback

### Files sẽ xoá:
- None

### Dependencies sẽ thêm:
- None (tất cả dependencies đã có)

### Test Files sẽ tạo:
- `src/features/portal/__tests__/PortalWireframes.logout.test.tsx` (unit test cho logout)

---

## 🎯 Implementation Steps

### Phase 1: Core Logic Implementation

#### Step 1.1: Add Logout Handler to PortalWireframes

**File:** `src/features/portal/PortalWireframes.tsx`

**Changes:**

1. Add imports (top of file):
```typescript
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
```

2. Add hook inside component (after existing hooks):
```typescript
const navigate = useNavigate();
const logout = useAuthStore((state) => state.logout);
```

3. Add handleLogout function (before return statement):
```typescript
const handleLogout = () => {
  logout();
  navigate("/login");
};
```

4. Update MainSidebar onSelect callback (around line 969):
```typescript
// BEFORE (lines 969-972):
onSelect={(key) => {
  if (key === "logout") {
    console.log("Logging out...");
    return;
  }
  // ... rest of logic
}}

// AFTER:
onSelect={(key) => {
  if (key === "logout") {
    handleLogout();
    return;
  }
  // ... rest of logic (unchanged)
}}
```

**Estimated lines changed:** 5 lines added, 1 line modified

---

### Phase 2: Testing

#### Step 2.1: Unit Test for Logout Handler

**Create:** `src/features/portal/__tests__/PortalWireframes.logout.test.tsx`

**Test cases:**

1. ✅ Should call logout() from authStore when handleLogout is triggered
2. ✅ Should navigate to /login after logout
3. ✅ Should clear auth state (user = null, isAuthenticated = false)
4. ✅ Should remove accessToken from localStorage

**Test structure:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PortalWireframes from '../PortalWireframes';
import { useAuthStore } from '@/stores/authStore';

// Mock dependencies
jest.mock('@/stores/authStore');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('PortalWireframes - Logout', () => {
  // Test 1: logout() called
  // Test 2: navigate() called with "/login"
  // Test 3: auth state cleared
  // Test 4: localStorage cleared
});
```

---

### Phase 3: Manual Testing

#### Test Scenario 1: Basic Logout Flow

**Steps:**
1. Login with valid credentials
2. Navigate to `/portal`
3. Click user avatar in MainSidebar (bottom)
4. Verify profile popover opens
5. Click "Đăng xuất" button
6. Verify redirect to `/login` page

**Expected Results:**
- ✅ Popover closes immediately
- ✅ User redirected to login page
- ✅ localStorage "accessToken" removed
- ✅ localStorage "auth-storage" cleared
- ✅ Cannot access `/portal` without re-login

#### Test Scenario 2: Protected Routes After Logout

**Steps:**
1. Perform logout (Test Scenario 1)
2. Try to access `/portal` directly via URL
3. Try to access `/portal/workspace` directly via URL

**Expected Results:**
- ✅ Auto-redirect to `/login` for both URLs
- ✅ Login form displayed
- ✅ No flash of protected content

#### Test Scenario 3: Re-login After Logout

**Steps:**
1. Perform logout
2. Login again with same credentials
3. Verify access to portal

**Expected Results:**
- ✅ Login successful
- ✅ Redirect to `/portal`
- ✅ User data loaded correctly
- ✅ No data from previous session

---

## 📋 Implementation Checklist

### Development Tasks

- [ ] Import `useNavigate` from react-router-dom
- [ ] Import `useAuthStore` from stores/authStore
- [ ] Add `navigate` hook
- [ ] Add `logout` hook from authStore
- [ ] Create `handleLogout` function
- [ ] Update `onSelect` callback for logout key
- [ ] Add data-testid to logout button (already exists)

### Testing Tasks

- [ ] Create unit test file
- [ ] Write test: logout() called
- [ ] Write test: navigate() called
- [ ] Write test: auth state cleared
- [ ] Write test: localStorage cleared
- [ ] Run unit tests (npm test)
- [ ] Manual test: Basic logout flow
- [ ] Manual test: Protected routes after logout
- [ ] Manual test: Re-login after logout

### Documentation Tasks

- [ ] Update 05_progress.md with implementation status
- [ ] Update 06_testing.md with test results
- [ ] Update _changelog.md with v1.0 release

---

## 🔧 Technical Details

### Code Changes Summary

| File                           | Lines Added | Lines Modified | Lines Deleted |
| ------------------------------ | ----------- | -------------- | ------------- |
| PortalWireframes.tsx           | 5           | 1              | 0             |
| **Total**                      | **5**       | **1**          | **0**         |

### Test Coverage

| File                           | Statements | Branches | Functions | Lines |
| ------------------------------ | ---------- | -------- | --------- | ----- |
| PortalWireframes.logout        | 100%       | 100%     | 100%      | 100%  |

### Performance Impact

- **Bundle size:** +0 KB (no new dependencies)
- **Runtime:** Logout < 100ms
- **Memory:** Minimal (clear auth state)

---

## ⚠️ Risk Assessment

### Low Risk ✅

- **Reason:** Minimal code changes (6 lines total)
- **Impact:** Isolated to logout flow only
- **Rollback:** Easy (revert 1 commit)

### Potential Issues

1. **Navigation during unmount warning**
   - **Risk:** Low
   - **Mitigation:** logout() called before navigate()

2. **Race condition with token refresh**
   - **Risk:** Very Low
   - **Mitigation:** logout() clears token immediately

3. **Persist state not clearing**
   - **Risk:** Low
   - **Mitigation:** clearAuthStorage() handles Zustand persist

---

## 🔗 Dependencies

### Internal Dependencies

- ✅ `useAuthStore` - Already exists
- ✅ `logout()` method - Already exists in authStore
- ✅ `clearAuthStorage()` - Already exists in tokenStorage
- ✅ `useNavigate` - Already used in project
- ✅ MainSidebar UI - Already implemented

### External Dependencies

- None (all packages already installed)

---

## ⏳ PENDING DECISIONS (Cần HUMAN quyết định)

| #   | Vấn đề                             | Lựa chọn                           | HUMAN Decision |
| --- | ---------------------------------- | ---------------------------------- | -------------- |
| 1   | Test framework preference          | Jest or Vitest?                    | ⬜ **\_\_**    |
| 2   | Run tests before implementation    | Yes (TDD) or No (test after)?      | ⬜ **\_\_**    |
| 3   | Update session log immediately     | Yes or after testing complete?     | ⬜ **\_\_**    |

> ⚠️ **AI KHÔNG ĐƯỢC thực thi code nếu có mục chưa được HUMAN điền**

---

## ⚠️ HUMAN CONFIRMATION

| Hạng mục                      | Status         |
| ----------------------------- | -------------- |
| Đã review Impact Summary      | ⬜ Chưa review |
| Đã review Implementation Steps | ⬜ Chưa review |
| Đã review Risk Assessment     | ⬜ Chưa review |
| Đã điền Pending Decisions     | ⬜ Chưa điền   |
| **APPROVED để thực thi**      | ⬜ PENDING     |

**HUMAN Signature:** ______  
**Date:** ______

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC viết code nếu chưa APPROVED**

---

## 🔄 Related Documentation

- **Requirements:** [01_requirements.md](./01_requirements.md)
- **Wireframe:** [02a_wireframe.md](./02a_wireframe.md)
- **User Flow:** [02b_flow.md](./02b_flow.md)
- **API Contract:** [03_api-contract.md](./03_api-contract.md)
- **Progress Tracker:** [05_progress.md](./05_progress.md)
- **Testing Plan:** [06_testing.md](./06_testing.md)

---

## 📝 Notes

- Implementation rất đơn giản, chỉ 6 lines code change
- Tất cả dependencies đã có sẵn trong project
- Risk thấp vì scope nhỏ và isolated
- UI đã sẵn sàng, chỉ cần wire logic

---

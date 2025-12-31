# 🧪 Logout Feature - Testing Document

> **[BƯỚC 6]** Testing Requirements & Coverage  
> **Feature ID:** `AUTH-002`  
> **Module:** Auth  
> **Version:** v1.0  
> **Last Updated:** 2025-12-27  
> **Status:** ⏳ PENDING (Awaiting implementation)

---

## 📋 Testing Strategy

### Testing Pyramid

```
        ┌───────────┐
        │    E2E    │  ← Optional for v1.0
        │   Tests   │
        └───────────┘
       ┌─────────────┐
       │ Integration │
       │    Tests    │
       └─────────────┘
     ┌─────────────────┐
     │   Unit Tests    │  ← Primary focus
     └─────────────────┘
```

**Focus:** Unit tests for logout logic  
**Coverage Target:** 100% for logout handler

---

## 🎯 Test Cases

### Unit Tests

#### Test File: `src/features/portal/__tests__/PortalWireframes.logout.test.tsx`

**Test 1: Should call logout() from authStore**

```typescript
test('should call logout() from authStore when logout is triggered', () => {
  const mockLogout = jest.fn();
  (useAuthStore as jest.Mock).mockReturnValue({
    logout: mockLogout,
  });

  const { getByTestId } = render(<PortalWireframes />);
  
  // Simulate MainSidebar calling onSelect("logout")
  // (implementation detail: may need to expose handler for testing)
  
  expect(mockLogout).toHaveBeenCalledTimes(1);
});
```

**Expected:** ✅ Pass

---

**Test 2: Should navigate to /login after logout**

```typescript
test('should navigate to /login after logout', () => {
  const mockNavigate = jest.fn();
  (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

  const mockLogout = jest.fn();
  (useAuthStore as jest.Mock).mockReturnValue({
    logout: mockLogout,
  });

  // Trigger logout
  // ...

  expect(mockNavigate).toHaveBeenCalledWith('/login');
});
```

**Expected:** ✅ Pass

---

**Test 3: Should clear auth state**

```typescript
test('should clear auth state after logout', () => {
  const mockLogout = jest.fn(() => {
    // Simulate authStore.logout() behavior
    localStorage.removeItem('accessToken');
    localStorage.removeItem('auth-storage');
  });

  (useAuthStore as jest.Mock).mockReturnValue({
    logout: mockLogout,
    isAuthenticated: false,
    user: null,
  });

  // Trigger logout
  // ...

  expect(localStorage.getItem('accessToken')).toBeNull();
  expect(localStorage.getItem('auth-storage')).toBeNull();
});
```

**Expected:** ✅ Pass

---

**Test 4: Should remove accessToken from localStorage**

```typescript
test('should remove accessToken from localStorage', () => {
  // Setup: Add token to localStorage
  localStorage.setItem('accessToken', 'test-token-123');
  
  const mockLogout = jest.fn(() => {
    localStorage.removeItem('accessToken');
  });

  (useAuthStore as jest.Mock).mockReturnValue({
    logout: mockLogout,
  });

  // Trigger logout
  // ...

  expect(localStorage.getItem('accessToken')).toBeNull();
});
```

**Expected:** ✅ Pass

---

### Integration Tests

**Test: Full logout flow with MainSidebar**

```typescript
test('should logout when clicking logout button in MainSidebar', () => {
  const { getByTestId } = render(<PortalWireframes />);
  
  // 1. Click user avatar
  const avatarButton = getByTestId('user-avatar-button');
  fireEvent.click(avatarButton);
  
  // 2. Verify popover opens
  const logoutButton = getByTestId('logout-button');
  expect(logoutButton).toBeInTheDocument();
  
  // 3. Click logout
  fireEvent.click(logoutButton);
  
  // 4. Verify navigation
  expect(mockNavigate).toHaveBeenCalledWith('/login');
});
```

**Expected:** ✅ Pass

---

### Manual Testing

#### Test Scenario 1: Basic Logout Flow ✅

**Pre-conditions:**
- User logged in
- Access token in localStorage
- Currently on /portal page

**Steps:**
1. Click user avatar button (bottom of MainSidebar)
2. Verify profile popover opens
3. Click "Đăng xuất" button
4. Verify redirect to /login

**Expected Results:**
- ✅ Popover closes immediately
- ✅ Redirect to /login page
- ✅ localStorage "accessToken" removed
- ✅ localStorage "auth-storage" cleared
- ✅ Login form displayed

**Actual Results:** ⏳ Pending

---

#### Test Scenario 2: Protected Routes After Logout ✅

**Pre-conditions:**
- User just logged out
- On /login page

**Steps:**
1. Try to navigate to /portal via URL bar
2. Try to navigate to /portal/workspace via URL bar

**Expected Results:**
- ✅ Auto-redirect to /login for /portal
- ✅ Auto-redirect to /login for /portal/workspace
- ✅ No flash of protected content
- ✅ Login form displayed both times

**Actual Results:** ⏳ Pending

---

#### Test Scenario 3: Re-login After Logout ✅

**Pre-conditions:**
- User logged out
- On /login page

**Steps:**
1. Enter valid credentials
2. Click "Đăng nhập"
3. Verify redirect to /portal
4. Verify user can access portal features

**Expected Results:**
- ✅ Login successful
- ✅ Redirect to /portal
- ✅ User data loaded
- ✅ No residual data from previous session

**Actual Results:** ⏳ Pending

---

#### Test Scenario 4: Logout on Mobile ✅

**Pre-conditions:**
- User logged in
- Mobile viewport (375px width)

**Steps:**
1. Click user avatar button
2. Verify popover opens (right aligned)
3. Click "Đăng xuất"
4. Verify redirect to /login

**Expected Results:**
- ✅ Same behavior as desktop
- ✅ Popover positioned correctly
- ✅ Logout successful

**Actual Results:** ⏳ Pending

---

### E2E Tests (Optional)

**Tool:** Playwright

**Test: E2E Logout Flow**

```typescript
test('should logout user and redirect to login', async ({ page }) => {
  // 1. Login
  await page.goto('/login');
  await page.fill('[data-testid="identifier-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  // 2. Wait for portal
  await page.waitForURL('/portal');
  
  // 3. Click logout
  await page.click('[data-testid="user-avatar-button"]');
  await page.click('[data-testid="logout-button"]');
  
  // 4. Verify redirect
  await page.waitForURL('/login');
  
  // 5. Verify cannot access portal
  await page.goto('/portal');
  await page.waitForURL('/login');
});
```

**Status:** ⏳ Optional for v1.0

---

## 📊 Test Coverage

### Target Coverage

| File                  | Statements | Branches | Functions | Lines |
| --------------------- | ---------- | -------- | --------- | ----- |
| PortalWireframes.tsx  | 90%+       | 80%+     | 90%+      | 90%+  |
| handleLogout function | 100%       | 100%     | 100%      | 100%  |

### Actual Coverage

| File                  | Statements | Branches | Functions | Lines |
| --------------------- | ---------- | -------- | --------- | ----- |
| PortalWireframes.tsx  | ⏳ TBD     | ⏳ TBD   | ⏳ TBD    | ⏳ TBD |
| handleLogout function | ⏳ TBD     | ⏳ TBD   | ⏳ TBD    | ⏳ TBD |

---

## 🐛 Known Issues

**None reported**

---

## ✅ Test Execution Checklist

### Unit Tests
- [ ] Create test file
- [ ] Write test: logout() called
- [ ] Write test: navigate() called
- [ ] Write test: auth state cleared
- [ ] Write test: localStorage cleared
- [ ] Run: `npm test`
- [ ] Verify: All tests pass
- [ ] Check coverage: `npm run test:coverage`

### Manual Tests
- [ ] Test Scenario 1: Basic logout
- [ ] Test Scenario 2: Protected routes
- [ ] Test Scenario 3: Re-login
- [ ] Test Scenario 4: Mobile logout
- [ ] Document results in this file

### E2E Tests (Optional)
- [ ] Setup Playwright (if not already)
- [ ] Write E2E logout test
- [ ] Run: `npm run test:e2e`
- [ ] Verify: E2E test passes

---

## 📝 Test Results

### Unit Tests

**Date:** ⏳ TBD  
**Status:** ⏳ Not Started  
**Passed:** 0/4  
**Failed:** 0  
**Coverage:** 0%

**Details:** Awaiting implementation

---

### Manual Tests

**Date:** ⏳ TBD  
**Status:** ⏳ Not Started  
**Scenarios Passed:** 0/4  
**Scenarios Failed:** 0

**Details:** Awaiting implementation

---

### E2E Tests

**Date:** ⏳ TBD  
**Status:** ⏳ Optional  
**Passed:** 0  
**Failed:** 0

**Details:** Optional for v1.0

---

## ⏳ PENDING DECISIONS (Cần HUMAN quyết định)

| #   | Vấn đề                     | Lựa chọn              | HUMAN Decision |
| --- | -------------------------- | --------------------- | -------------- |
| 1   | Run E2E tests?             | Yes or No (optional)  | ⬜ **\_\_**    |
| 2   | Test framework             | Jest or Vitest?       | ⬜ **\_\_**    |
| 3   | Coverage threshold         | 80%, 90%, or 100%?    | ⬜ **\_\_**    |

> ⚠️ **AI KHÔNG ĐƯỢC chạy tests nếu có mục chưa được HUMAN điền**

---

## ⚠️ HUMAN CONFIRMATION

| Hạng mục                  | Status         |
| ------------------------- | -------------- |
| Đã review Test Cases      | ⬜ Chưa review |
| Đã review Coverage Target | ⬜ Chưa review |
| Đã điền Pending Decisions | ⬜ Chưa điền   |
| **APPROVED để test**      | ⬜ PENDING     |

**HUMAN Signature:** ______  
**Date:** ______

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC chạy tests nếu chưa APPROVED**

---

## 🔄 Related Documentation

- **Requirements:** [01_requirements.md](./01_requirements.md)
- **Implementation Plan:** [04_implementation-plan.md](./04_implementation-plan.md)
- **Progress Tracker:** [05_progress.md](./05_progress.md)

---

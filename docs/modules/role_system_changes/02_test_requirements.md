# [BƯỚC 6] Test Requirements - Role System Migration

> **Created:** 2026-01-20  
> **Status:** ⏳ PENDING  
> **Coverage Target:** Full E2E  
> **Test Framework:** Vitest + Playwright

---

## 📋 OVERVIEW

This document specifies all test requirements for the role system migration, including unit tests, integration tests, and E2E tests.

---

## 🧪 TEST COVERAGE MATRIX

| Component | Unit Tests | Integration Tests | E2E Tests | Priority |
|-----------|-----------|------------------|-----------|----------|
| `roleUtils.ts` | ✅ Required | ✅ Required | ❌ N/A | 🔴 HIGH |
| `uiStore.ts` | ✅ Required | ✅ Required | ❌ N/A | 🔴 HIGH |
| `PortalWireframes.tsx` | ❌ Skip | ✅ Required | ✅ Required | 🔴 HIGH |
| Permission checks | ❌ Skip | ✅ Required | ✅ Required | 🔴 HIGH |
| UI components | ❌ Skip | ⚠️ Optional | ✅ Required | 🟡 MEDIUM |
| Auth flow | ❌ Skip | ✅ Required | ✅ Required | 🔴 HIGH |

---

## 📝 UNIT TESTS

### Test File: `src/utils/__tests__/roleUtils.test.ts`

**Status:** ✅ Specified in Implementation Plan  
**Test Cases:** 30+  
**Framework:** Vitest

#### Test Groups:

1. **hasRole()**
   - ✅ Returns true when user has the role
   - ✅ Case-insensitive matching
   - ✅ Returns false when user has no roles
   - ✅ Returns false when user is null
   - ✅ Returns false when roles array is undefined

2. **hasAnyRole()**
   - ✅ Returns true if user has any of the specified roles
   - ✅ Returns false if user has none of the roles
   - ✅ Works with single role
   - ✅ Works with multiple roles

3. **hasAllRoles()**
   - ✅ Returns true only if user has all specified roles
   - ✅ Returns false if missing one role
   - ✅ Returns true for single role match

4. **hasLeaderPermissions()**
   - ✅ Returns true for Admin role
   - ✅ Returns true for Leader role
   - ✅ Returns false for Staff only
   - ✅ Returns true for Admin+Staff combo
   - ✅ Returns true for Leader+Staff combo
   - ✅ Returns false when user has no roles

5. **hasStaffPermissions()**
   - ✅ Returns true for Staff only
   - ✅ Returns false when user has Leader
   - ✅ Returns false when user has Admin
   - ✅ Returns false for Admin+Staff combo

6. **getCurrentUserRoles()**
   - ✅ Returns normalized roles
   - ✅ Filters out unknown roles
   - ✅ Returns empty array when user has no roles
   - ✅ Returns empty array when user is null
   - ✅ Handles case variations (admin, ADMIN, Admin)

7. **getHighestRole()**
   - ✅ Returns Admin when user has multiple roles
   - ✅ Returns Leader when user has Leader and Staff
   - ✅ Returns Staff when user has Staff only
   - ✅ Returns null when user has no roles

8. **getViewModeFromRoles()**
   - ✅ Returns "lead" for Admin
   - ✅ Returns "lead" for Leader
   - ✅ Returns "staff" for Staff only
   - ✅ Returns "lead" for multi-role with Leader
   - ✅ Returns "lead" for multi-role with Admin

9. **hasPermissionLevel()**
   - ✅ Returns true when user role >= required role
   - ✅ Returns false when user role < required role
   - ✅ Works with Admin hierarchy
   - ✅ Works with Leader hierarchy
   - ✅ Works with Staff hierarchy

**Run Command:**
```bash
npm run test -- roleUtils.test.ts
```

---

## 🔗 INTEGRATION TESTS

### Test Group 1: Auth State Integration

**File:** `src/__tests__/integration/roleAuthFlow.test.ts` (NEW)

**Test Cases:**

1. **Login Flow with Role Loading**
   ```typescript
   it('should initialize viewMode from user roles on login', async () => {
     // Given: User not logged in
     // When: User logs in with Admin role
     // Then: viewMode should be 'lead'
   });
   ```

2. **Role Change During Session**
   ```typescript
   it('should update viewMode when user roles change', async () => {
     // Given: User logged in as Staff
     // When: Roles updated to include Leader
     // Then: viewMode should change to 'lead'
   });
   ```

3. **Logout Flow**
   ```typescript
   it('should reset to default viewMode on logout', async () => {
     // Given: User logged in as Leader
     // When: User logs out
     // Then: viewMode should reset to 'staff'
   });
   ```

### Test Group 2: UI Store Integration

**File:** `src/__tests__/integration/uiStoreRoles.test.ts` (NEW)

**Test Cases:**

1. **Store Initialization**
   ```typescript
   it('should initialize viewMode from authStore on mount', () => {
     // Given: User has Admin role in authStore
     // When: uiStore is created
     // Then: viewMode should be 'lead'
   });
   ```

2. **Reactive Updates**
   ```typescript
   it('should update viewMode when authStore user changes', () => {
     // Given: uiStore initialized
     // When: authStore user updated
     // Then: viewMode should update reactively
   });
   ```

### Test Group 3: Component Permission Checks

**File:** `src/__tests__/integration/componentPermissions.test.tsx` (NEW)

**Test Cases:**

1. **Leader-Only Features**
   ```typescript
   it('should show leader features for Admin role', () => {
     // Given: User with Admin role
     // When: Component renders
     // Then: Leader features should be visible
   });
   
   it('should hide leader features for Staff role', () => {
     // Given: User with Staff role
     // When: Component renders
     // Then: Leader features should be hidden
   });
   ```

2. **Staff-Only Features**
   ```typescript
   it('should show staff features for Staff role only', () => {
     // Given: User with Staff role (no Admin/Leader)
     // When: Component renders
     // Then: Staff features should be visible
   });
   ```

3. **Multi-Role Handling**
   ```typescript
   it('should prioritize Admin over Staff for UI display', () => {
     // Given: User with Admin+Staff roles
     // When: Component renders
     // Then: Should display Leader UI (Admin wins)
   });
   ```

---

## 🎭 E2E TESTS (FULL COVERAGE)

### Test File: `tests/role-system.spec.ts` (NEW)

**Framework:** Playwright  
**Target:** Full user scenarios

### Test Suite 1: Login with Different Roles

```typescript
import { test, expect } from '@playwright/test';

test.describe('Role System - Login Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('Admin user should see Leader UI', async ({ page }) => {
    // Login as Admin
    await page.fill('[data-testid="login-username-input"]', 'admin@example.com');
    await page.fill('[data-testid="login-password-input"]', 'password');
    await page.click('[data-testid="login-submit-button"]');

    // Wait for redirect to portal
    await expect(page).toHaveURL(/\/portal/);

    // Verify Leader UI elements visible
    await expect(page.locator('[data-testid="team-monitor-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="assign-task-button"]')).toBeVisible();
    await expect(page.locator('text=Trưởng nhóm')).toBeVisible();

    // Verify Staff-only features hidden
    await expect(page.locator('[data-testid="claim-task-button"]')).not.toBeVisible();
  });

  test('Leader user should see Leader UI', async ({ page }) => {
    // Login as Leader
    await page.fill('[data-testid="login-username-input"]', 'leader@example.com');
    await page.fill('[data-testid="login-password-input"]', 'password');
    await page.click('[data-testid="login-submit-button"]');

    // Verify Leader UI
    await expect(page.locator('[data-testid="team-monitor-button"]')).toBeVisible();
    await expect(page.locator('text=Trưởng nhóm')).toBeVisible();
  });

  test('Staff user should see Staff UI', async ({ page }) => {
    // Login as Staff
    await page.fill('[data-testid="login-username-input"]', 'staff@example.com');
    await page.fill('[data-testid="login-password-input"]', 'password');
    await page.click('[data-testid="login-submit-button"]');

    // Verify Staff UI
    await expect(page.locator('[data-testid="claim-task-button"]')).toBeVisible();
    await expect(page.locator('text=Nhân viên')).toBeVisible();

    // Verify Leader features hidden
    await expect(page.locator('[data-testid="team-monitor-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="assign-task-button"]')).not.toBeVisible();
  });

  test('Admin+Staff user should see Leader UI (Admin wins)', async ({ page }) => {
    // Setup: Create user with both Admin and Staff roles via API
    // (Assume API helper exists)
    
    // Login as multi-role user
    await page.fill('[data-testid="login-username-input"]', 'multi@example.com');
    await page.fill('[data-testid="login-password-input"]', 'password');
    await page.click('[data-testid="login-submit-button"]');

    // Verify Leader UI (Admin takes priority)
    await expect(page.locator('[data-testid="team-monitor-button"]')).toBeVisible();
    await expect(page.locator('text=Trưởng nhóm')).toBeVisible();
  });
});
```

### Test Suite 2: Feature Permissions

```typescript
test.describe('Role System - Feature Permissions', () => {
  test('Leader can assign tasks', async ({ page, context }) => {
    // Login as Leader
    await loginAsLeader(page);

    // Navigate to task list
    await page.click('[data-testid="task-list-button"]');

    // Click on a task
    await page.click('[data-testid="task-item-1"]');

    // Verify assign button visible
    await expect(page.locator('[data-testid="task-assign-button"]')).toBeVisible();

    // Assign task to team member
    await page.click('[data-testid="task-assign-button"]');
    await page.selectOption('[data-testid="assign-member-select"]', 'staff-1');
    await page.click('[data-testid="assign-confirm-button"]');

    // Verify success
    await expect(page.locator('text=Task assigned')).toBeVisible();
  });

  test('Staff cannot assign tasks', async ({ page }) => {
    // Login as Staff
    await loginAsStaff(page);

    // Navigate to task list
    await page.click('[data-testid="task-list-button"]');

    // Click on a task
    await page.click('[data-testid="task-item-1"]');

    // Verify assign button NOT visible
    await expect(page.locator('[data-testid="task-assign-button"]')).not.toBeVisible();
  });

  test('Leader can create folders in file manager', async ({ page }) => {
    // Login as Leader
    await loginAsLeader(page);

    // Navigate to file manager
    await page.click('[data-testid="file-manager-button"]');

    // Verify create folder button visible
    await expect(page.locator('[data-testid="create-folder-button"]')).toBeVisible();

    // Create folder
    await page.click('[data-testid="create-folder-button"]');
    await page.fill('[data-testid="folder-name-input"]', 'Test Folder');
    await page.click('[data-testid="folder-create-confirm"]');

    // Verify folder created
    await expect(page.locator('text=Test Folder')).toBeVisible();
  });

  test('Staff cannot create folders', async ({ page }) => {
    // Login as Staff
    await loginAsStaff(page);

    // Navigate to file manager
    await page.click('[data-testid="file-manager-button"]');

    // Verify create folder button NOT visible
    await expect(page.locator('[data-testid="create-folder-button"]')).not.toBeVisible();
  });

  test('Leader can see team monitor view', async ({ page }) => {
    // Login as Leader
    await loginAsLeader(page);

    // Click team monitor button
    await page.click('[data-testid="team-monitor-button"]');

    // Verify team monitor view visible
    await expect(page.locator('[data-testid="team-monitor-view"]')).toBeVisible();
    await expect(page.locator('text=Active threads')).toBeVisible();
  });

  test('Staff cannot access team monitor', async ({ page }) => {
    // Login as Staff
    await loginAsStaff(page);

    // Verify team monitor button NOT visible
    await expect(page.locator('[data-testid="team-monitor-button"]')).not.toBeVisible();
  });
});
```

### Test Suite 3: Role Changes & Edge Cases

```typescript
test.describe('Role System - Edge Cases', () => {
  test('ViewModeSwitcher should not be visible', async ({ page }) => {
    // Login as any user
    await loginAsLeader(page);

    // Verify ViewModeSwitcher component does not exist
    await expect(page.locator('[data-testid="view-mode-switcher"]')).not.toBeVisible();
    
    // Check via class name as well (in case data-testid missing)
    const switcherCount = await page.locator('button:has-text("Chuyển sang chế độ")').count();
    expect(switcherCount).toBe(0);
  });

  test('Should handle user with no roles gracefully', async ({ page }) => {
    // Setup: Create user with empty roles array
    // (Use API or localStorage manipulation)
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: 'test', identifier: 'test@example.com', roles: [] },
          isAuthenticated: true
        }
      }));
    });
    await page.goto('/portal');

    // Should default to Staff UI (safe default)
    await expect(page.locator('text=Nhân viên')).toBeVisible();
    await expect(page.locator('[data-testid="team-monitor-button"]')).not.toBeVisible();
  });

  test('Should handle localStorage role change', async ({ page }) => {
    // Login as Staff
    await loginAsStaff(page);
    await expect(page.locator('text=Nhân viên')).toBeVisible();

    // Simulate role change in localStorage (e.g., via admin panel)
    await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      storage.state.user.roles = ['Leader'];
      localStorage.setItem('auth-storage', JSON.stringify(storage));
    });

    // Refresh page
    await page.reload();

    // Should now show Leader UI
    await expect(page.locator('text=Trưởng nhóm')).toBeVisible();
    await expect(page.locator('[data-testid="team-monitor-button"]')).toBeVisible();
  });
});
```

---

## 🔧 HELPER FUNCTIONS (for E2E)

**File:** `tests/helpers/auth.ts` (NEW)

```typescript
import { Page } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="login-username-input"]', 'admin@example.com');
  await page.fill('[data-testid="login-password-input"]', 'password');
  await page.click('[data-testid="login-submit-button"]');
  await page.waitForURL(/\/portal/);
}

export async function loginAsLeader(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="login-username-input"]', 'leader@example.com');
  await page.fill('[data-testid="login-password-input"]', 'password');
  await page.click('[data-testid="login-submit-button"]');
  await page.waitForURL(/\/portal/);
}

export async function loginAsStaff(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="login-username-input"]', 'staff@example.com');
  await page.fill('[data-testid="login-password-input"]', 'password');
  await page.click('[data-testid="login-submit-button"]');
  await page.waitForURL(/\/portal/);
}

export async function setUserRoles(page: Page, roles: string[]) {
  await page.evaluate((roles) => {
    const storage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    if (storage.state?.user) {
      storage.state.user.roles = roles;
      localStorage.setItem('auth-storage', JSON.stringify(storage));
    }
  }, roles);
}
```

---

## 📊 TEST DATA REQUIREMENTS

### Test Users

**Required test accounts:**

| Username | Password | Roles | Purpose |
|----------|----------|-------|---------|
| `admin@example.com` | `password` | `["Admin"]` | Test Admin-only features |
| `leader@example.com` | `password` | `["Leader"]` | Test Leader-only features |
| `staff@example.com` | `password` | `["Staff"]` | Test Staff-only features |
| `multi@example.com` | `password` | `["Admin", "Staff"]` | Test multi-role priority |
| `leader-staff@example.com` | `password` | `["Leader", "Staff"]` | Test Leader+Staff combo |
| `no-roles@example.com` | `password` | `[]` | Test empty roles handling |

**Database seed script:**
```sql
-- Add to seed file or test setup
INSERT INTO users (username, email, roles) VALUES
  ('admin', 'admin@example.com', '["Admin"]'),
  ('leader', 'leader@example.com', '["Leader"]'),
  ('staff', 'staff@example.com', '["Staff"]'),
  ('multi', 'multi@example.com', '["Admin", "Staff"]'),
  ('leader-staff', 'leader-staff@example.com', '["Leader", "Staff"]'),
  ('no-roles', 'no-roles@example.com', '[]');
```

---

## ✅ MANUAL TESTING CHECKLIST

### Pre-Migration Baseline

- [ ] Login as existing "lead" viewMode user → Works
- [ ] Login as existing "staff" viewMode user → Works
- [ ] Toggle ViewModeSwitcher → Changes UI correctly
- [ ] All leader features accessible in "lead" mode
- [ ] All staff features accessible in "staff" mode

### Post-Migration Verification

#### Admin Role Tests
- [ ] Login as Admin → See Leader UI
- [ ] Can assign tasks
- [ ] Can create folders
- [ ] Can access team monitor
- [ ] Can transfer tasks
- [ ] No ViewModeSwitcher visible

#### Leader Role Tests
- [ ] Login as Leader → See Leader UI
- [ ] Can assign tasks
- [ ] Can create folders
- [ ] Can access team monitor
- [ ] All features same as Admin

#### Staff Role Tests
- [ ] Login as Staff → See Staff UI
- [ ] Can claim tasks
- [ ] Cannot assign tasks
- [ ] Cannot create folders
- [ ] Cannot access team monitor
- [ ] Can only see own tasks

#### Multi-Role Tests
- [ ] Admin+Staff → Shows Leader UI (Admin wins)
- [ ] Leader+Staff → Shows Leader UI (Leader wins)
- [ ] Admin+Leader+Staff → Shows Leader UI (Admin wins)

#### Edge Cases
- [ ] User with empty roles → Defaults to Staff UI (safe default)
- [ ] User with unknown roles → Filtered out, uses valid roles
- [ ] Logout → Clears roles, defaults to Staff
- [ ] Login again → Roles loaded correctly

#### Performance
- [ ] No performance degradation
- [ ] Role checks fast (< 1ms)
- [ ] No memory leaks
- [ ] No console errors

---

## 🚀 TEST EXECUTION PLAN

### Phase 1: Unit Tests
```bash
# Create and run roleUtils tests
npm run test -- roleUtils.test.ts

# Should have 100% coverage for roleUtils.ts
npm run test:coverage -- roleUtils
```

### Phase 2: Integration Tests
```bash
# Run integration test suite
npm run test -- integration/

# Verify auth flow integration
npm run test -- integration/roleAuthFlow.test.ts
```

### Phase 3: E2E Tests
```bash
# Run E2E test suite
npm run test:e2e

# Run specific role system tests
npx playwright test tests/role-system.spec.ts

# Run with UI for debugging
npx playwright test --ui tests/role-system.spec.ts
```

### Phase 4: Manual Testing
- Follow manual testing checklist
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices
- Document any issues found

---

## 📋 ACCEPTANCE CRITERIA

### Unit Tests
- ✅ All 30+ test cases pass
- ✅ 100% coverage for roleUtils.ts
- ✅ No TypeScript errors
- ✅ Tests run in < 1 second

### Integration Tests
- ✅ Auth flow tests pass
- ✅ UI store integration works
- ✅ Component permission checks correct

### E2E Tests
- ✅ All login scenarios pass
- ✅ All feature permissions correct
- ✅ Edge cases handled gracefully
- ✅ No ViewModeSwitcher visible
- ✅ Tests run in < 5 minutes

### Manual Testing
- ✅ All checklist items verified
- ✅ No regressions in existing features
- ✅ Performance acceptable
- ✅ No console errors or warnings

---

## 🔄 CONTINUOUS TESTING

### Pre-Commit
```bash
# Run quick tests
npm run test -- roleUtils.test.ts
```

### Pre-Push
```bash
# Run full test suite
npm run test
npm run test:e2e -- --grep "Role System"
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
- name: Run Unit Tests
  run: npm run test

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Coverage
  run: npm run test:coverage
```

---

## 📝 TEST DOCUMENTATION

### Test Report Template

```markdown
# Role System Migration - Test Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Prod]

## Unit Tests
- ✅/❌ roleUtils.test.ts: [Pass/Fail]
- Coverage: [X%]

## Integration Tests
- ✅/❌ Auth flow: [Pass/Fail]
- ✅/❌ UI store: [Pass/Fail]
- ✅/❌ Component permissions: [Pass/Fail]

## E2E Tests
- ✅/❌ Login scenarios: [Pass/Fail]
- ✅/❌ Feature permissions: [Pass/Fail]
- ✅/❌ Edge cases: [Pass/Fail]

## Manual Tests
- ✅/❌ Admin role: [Pass/Fail]
- ✅/❌ Leader role: [Pass/Fail]
- ✅/❌ Staff role: [Pass/Fail]
- ✅/❌ Multi-role: [Pass/Fail]

## Issues Found
1. [Issue description]
2. [Issue description]

## Sign-off
- ✅ All tests pass
- ✅ No critical issues
- ✅ Ready for deployment

Tester Signature: Khoa
Date: 20012026
```

---

## ✅ HUMAN APPROVAL

| Item | Status |
|------|--------|
| Đã review Test Requirements | ⬜  review |
| Đã hiểu test strategy | ⬜  hiểu |
| Test data prepared | ⬜  chuẩn bị |
| **APPROVED để bắt đầu testing** | ⬜  APPROVED |

**HUMAN Signature:** [PENDING]  
**Date:** [PENDING]

---

**End of Test Requirements Document**

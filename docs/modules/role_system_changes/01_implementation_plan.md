# [BƯỚC 4] Implementation Plan - Role System Migration

> **Created:** 2026-01-20  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Approach:** Big Bang Migration  
> **Test Coverage:** Full E2E

---

## 📋 OVERVIEW

This document provides step-by-step implementation instructions for migrating from binary role system to multi-role system.

**Key Decisions Applied:**
- ✅ ViewModeSwitcher: **Remove**
- ✅ Multi-role priority: **Admin wins** (hierarchy)
- ✅ Migration: **Big bang** (all at once)
- ✅ Runtime changes: **Do nothing for now**
- ✅ Deprecated props: **Keep temporarily**
- ✅ Tests: **Full E2E coverage**

---

## 🎯 IMPLEMENTATION PHASES

### Phase 1: Foundation - Create Role Utilities ⏱️ 1 hour

#### Task 1.1: Create `src/utils/roleUtils.ts`

**File:** `src/utils/roleUtils.ts` (NEW)

```typescript
import { useAuthStore } from '@/stores/authStore';

/**
 * Role hierarchy for permission checks
 * Higher number = higher priority
 */
export const ROLE_HIERARCHY = {
  Admin: 3,
  Leader: 2,
  Staff: 1,
} as const;

export type AppRole = keyof typeof ROLE_HIERARCHY;

/**
 * Check if user has a specific role
 * Case-insensitive comparison
 * 
 * @example
 * hasRole('Admin') // true if user.roles includes 'admin', 'Admin', or 'ADMIN'
 */
export function hasRole(role: AppRole): boolean {
  const user = useAuthStore.getState().user;
  if (!user?.roles) return false;
  
  return user.roles.some(r => 
    r.toLowerCase() === role.toLowerCase()
  );
}

/**
 * Check if user has any of the specified roles
 * 
 * @example
 * hasAnyRole('Admin', 'Leader') // true if user has either role
 */
export function hasAnyRole(...roles: AppRole[]): boolean {
  return roles.some(role => hasRole(role));
}

/**
 * Check if user has all specified roles
 * 
 * @example
 * hasAllRoles('Admin', 'Staff') // true only if user has both roles
 */
export function hasAllRoles(...roles: AppRole[]): boolean {
  return roles.every(role => hasRole(role));
}

/**
 * Check if user has leader-level permissions
 * Returns true for Admin or Leader roles
 * 
 * This is the primary function to replace `viewMode === "lead"` checks
 */
export function hasLeaderPermissions(): boolean {
  return hasAnyRole('Admin', 'Leader');
}

/**
 * Check if user has staff-only permissions
 * Returns true for Staff role WITHOUT Admin/Leader
 * 
 * This replaces `viewMode === "staff"` checks
 */
export function hasStaffPermissions(): boolean {
  return hasRole('Staff') && !hasLeaderPermissions();
}

/**
 * Get current user roles from auth storage
 * Returns normalized roles: ['Admin', 'Leader', 'Staff']
 */
export function getCurrentUserRoles(): AppRole[] {
  const user = useAuthStore.getState().user;
  if (!user?.roles) return [];
  
  return user.roles
    .map(r => {
      const normalized = r.toLowerCase();
      if (normalized === 'admin') return 'Admin';
      if (normalized === 'leader') return 'Leader';
      if (normalized === 'staff') return 'Staff';
      return null;
    })
    .filter((r): r is AppRole => r !== null);
}

/**
 * Get highest priority role for current user
 * Returns the role with highest hierarchy value
 */
export function getHighestRole(): AppRole | null {
  const roles = getCurrentUserRoles();
  if (roles.length === 0) return null;
  
  return roles.reduce((highest, current) => {
    return ROLE_HIERARCHY[current] > ROLE_HIERARCHY[highest] ? current : highest;
  });
}

/**
 * Determine view mode based on user roles
 * For backward compatibility with existing UI
 * 
 * @deprecated Will be removed after full migration
 */
export function getViewModeFromRoles(): 'lead' | 'staff' {
  return hasLeaderPermissions() ? 'lead' : 'staff';
}

/**
 * Check if user has permission for a specific action
 * Based on role hierarchy
 * 
 * @param requiredRole - Minimum role required
 * @returns true if user's highest role >= required role
 */
export function hasPermissionLevel(requiredRole: AppRole): boolean {
  const userHighestRole = getHighestRole();
  if (!userHighestRole) return false;
  
  return ROLE_HIERARCHY[userHighestRole] >= ROLE_HIERARCHY[requiredRole];
}
```

**Checklist:**
- [ ] Create file with all functions
- [ ] Add JSDoc comments
- [ ] Export all public functions
- [ ] No TypeScript errors

---

#### Task 1.2: Create `src/utils/__tests__/roleUtils.test.ts`

**File:** `src/utils/__tests__/roleUtils.test.ts` (NEW)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasLeaderPermissions,
  hasStaffPermissions,
  getCurrentUserRoles,
  getHighestRole,
  getViewModeFromRoles,
  hasPermissionLevel,
} from '../roleUtils';
import { useAuthStore } from '@/stores/authStore';

// Mock auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

describe('roleUtils', () => {
  const mockGetState = useAuthStore.getState as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetState.mockReset();
  });

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Admin', 'Leader'] },
      });

      expect(hasRole('Admin')).toBe(true);
      expect(hasRole('Leader')).toBe(true);
      expect(hasRole('Staff')).toBe(false);
    });

    it('should be case-insensitive', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['admin'] },
      });

      expect(hasRole('Admin')).toBe(true);
    });

    it('should return false when user has no roles', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: [] },
      });

      expect(hasRole('Admin')).toBe(false);
    });

    it('should return false when user is null', () => {
      mockGetState.mockReturnValue({ user: null });

      expect(hasRole('Admin')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true if user has any of the roles', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Leader'] },
      });

      expect(hasAnyRole('Admin', 'Leader')).toBe(true);
      expect(hasAnyRole('Admin', 'Staff')).toBe(false);
    });
  });

  describe('hasAllRoles', () => {
    it('should return true only if user has all roles', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Admin', 'Staff'] },
      });

      expect(hasAllRoles('Admin', 'Staff')).toBe(true);
      expect(hasAllRoles('Admin', 'Leader')).toBe(false);
    });
  });

  describe('hasLeaderPermissions', () => {
    it('should return true for Admin role', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Admin'] },
      });

      expect(hasLeaderPermissions()).toBe(true);
    });

    it('should return true for Leader role', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Leader'] },
      });

      expect(hasLeaderPermissions()).toBe(true);
    });

    it('should return false for Staff only', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Staff'] },
      });

      expect(hasLeaderPermissions()).toBe(false);
    });

    it('should return true for Admin+Staff combo', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Admin', 'Staff'] },
      });

      expect(hasLeaderPermissions()).toBe(true);
    });
  });

  describe('hasStaffPermissions', () => {
    it('should return true for Staff only', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Staff'] },
      });

      expect(hasStaffPermissions()).toBe(true);
    });

    it('should return false when user has Leader', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Staff', 'Leader'] },
      });

      expect(hasStaffPermissions()).toBe(false);
    });
  });

  describe('getCurrentUserRoles', () => {
    it('should return normalized roles', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['admin', 'LEADER', 'Staff'] },
      });

      const roles = getCurrentUserRoles();
      expect(roles).toEqual(['Admin', 'Leader', 'Staff']);
    });

    it('should filter out unknown roles', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Admin', 'Unknown'] },
      });

      const roles = getCurrentUserRoles();
      expect(roles).toEqual(['Admin']);
    });
  });

  describe('getHighestRole', () => {
    it('should return Admin when user has multiple roles', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Staff', 'Admin', 'Leader'] },
      });

      expect(getHighestRole()).toBe('Admin');
    });

    it('should return Leader when user has Leader and Staff', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Staff', 'Leader'] },
      });

      expect(getHighestRole()).toBe('Leader');
    });

    it('should return null when user has no roles', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: [] },
      });

      expect(getHighestRole()).toBeNull();
    });
  });

  describe('getViewModeFromRoles', () => {
    it('should return "lead" for Admin', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Admin'] },
      });

      expect(getViewModeFromRoles()).toBe('lead');
    });

    it('should return "lead" for Leader', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Leader'] },
      });

      expect(getViewModeFromRoles()).toBe('lead');
    });

    it('should return "staff" for Staff only', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Staff'] },
      });

      expect(getViewModeFromRoles()).toBe('staff');
    });

    it('should return "lead" for multi-role with Leader', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Leader', 'Staff'] },
      });

      expect(getViewModeFromRoles()).toBe('lead');
    });
  });

  describe('hasPermissionLevel', () => {
    it('should return true when user role >= required role', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Admin'] },
      });

      expect(hasPermissionLevel('Leader')).toBe(true);
      expect(hasPermissionLevel('Staff')).toBe(true);
    });

    it('should return false when user role < required role', () => {
      mockGetState.mockReturnValue({
        user: { id: '1', identifier: 'test', roles: ['Staff'] },
      });

      expect(hasPermissionLevel('Leader')).toBe(false);
      expect(hasPermissionLevel('Admin')).toBe(false);
    });
  });
});
```

**Checklist:**
- [ ] Create test file with 30+ test cases
- [ ] Mock authStore properly
- [ ] Test all edge cases (null user, empty roles, etc.)
- [ ] All tests pass: `npm run test -- roleUtils.test.ts`

---

### Phase 2: State Management ⏱️ 30 minutes

#### Task 2.1: Update `src/stores/uiStore.ts`

**File:** `src/stores/uiStore.ts`

**Changes:**
1. Import role utilities
2. Initialize viewMode from roles
3. Add comment about backward compatibility

```typescript
import { create } from 'zustand';
import { getViewModeFromRoles } from '@/utils/roleUtils';

// CHANGED: Import role utility

export type ViewMode = 'lead' | 'staff';
export type CurrentView = 'workspace' | 'lead';
export type RightPanelTab = 'info' | 'task' | 'file';

interface UIState {
  // View states
  viewMode: ViewMode;
  currentView: CurrentView;
  // ... rest of interface unchanged
}

const initialState = {
  // CHANGED: Initialize from user roles instead of hardcoded 'staff'
  viewMode: getViewModeFromRoles() as ViewMode,
  currentView: 'workspace' as CurrentView,
  // ... rest of initialState unchanged
};

export const useUIStore = create<UIState>()((set) => ({
  ...initialState,

  // View actions
  setViewMode: (mode) => set({ viewMode: mode }),
  // NOTE: setViewMode kept for backward compatibility
  // In production, viewMode should be derived from user roles only
  
  // ... rest of the store unchanged
}));
```

**Exact Changes:**

**CHANGE 1: Add import at top**
```typescript
import { create } from 'zustand';
import { getViewModeFromRoles } from '@/utils/roleUtils'; // ADD THIS LINE
```

**CHANGE 2: Update initialState**
```typescript
const initialState = {
  // OLD: viewMode: 'staff' as ViewMode,
  // NEW:
  viewMode: getViewModeFromRoles() as ViewMode,
  currentView: 'workspace' as CurrentView,
  // ... rest unchanged
};
```

**CHANGE 3: Add comment to setViewMode**
```typescript
setViewMode: (mode) => set({ viewMode: mode }),
// NOTE: setViewMode kept for backward compatibility during migration
// In production, viewMode should be derived from user roles only
```

**Checklist:**
- [ ] Import `getViewModeFromRoles`
- [ ] Update initialState
- [ ] Add backward compatibility comment
- [ ] No TypeScript errors
- [ ] Test: viewMode initializes correctly based on user roles

---

### Phase 3: Root Component ⏱️ 1 hour

#### Task 3.1: Update `src/features/portal/PortalWireframes.tsx`

**File:** `src/features/portal/PortalWireframes.tsx`

**Changes:**
1. Import role utilities
2. Initialize viewMode from roles
3. Subscribe to auth changes
4. Replace role checks (5 locations)

**Imports to add:**
```typescript
import { getViewModeFromRoles, hasLeaderPermissions } from '@/utils/roleUtils';
```

**CHANGE 1: Initialize viewMode (around line 65)**
```typescript
// OLD:
// const [viewMode, setViewMode] = React.useState<"lead" | "staff">("lead");

// NEW:
const [viewMode, setViewMode] = React.useState<"lead" | "staff">(
  getViewModeFromRoles()
);
```

**CHANGE 2: Add auth subscription effect (after viewMode state)**
```typescript
// NEW: Re-derive viewMode when auth state changes
React.useEffect(() => {
  const unsubscribe = useAuthStore.subscribe((state) => {
    if (state.user) {
      const newMode = getViewModeFromRoles();
      if (newMode !== viewMode) {
        setViewMode(newMode);
      }
    }
  });
  return unsubscribe;
}, [viewMode]);
```

**CHANGE 3: Update getCurrentUserName function (around line 189)**
```typescript
// OLD:
// const getCurrentUserName = (): string => {
//   const user = useAuthStore.getState().user;
//   if (user?.identifier) {
//     return user.identifier;
//   }
//   // Fallback based on viewMode for backward compatibility
//   return viewMode === 'lead' ? 'Thanh Trúc' : 'Diễm Chi';
// };

// NEW:
const getCurrentUserName = (): string => {
  const user = useAuthStore.getState().user;
  if (user?.identifier) {
    return user.identifier;
  }
  // Fallback for demo (will be removed in production)
  return hasLeaderPermissions() ? 'Thanh Trúc' : 'Diễm Chi';
};
```

**CHANGE 4: Update currentUserId (around line 201)**
```typescript
// OLD:
// const currentUserId = viewMode === 'lead' ? getCurrentUserIdSync() : 'u_diem_chi';

// NEW:
const currentUserId = hasLeaderPermissions() 
  ? getCurrentUserIdSync() 
  : 'u_diem_chi';
```

**CHANGE 5: Update currentUserDepartment (around line 202)**
```typescript
// OLD:
// const currentUserDepartment = viewMode === 'lead' ? 'Quản lý vận hành' : 'Nhân viên kho';

// NEW:
const currentUserDepartment = hasLeaderPermissions() 
  ? 'Quản lý vận hành' 
  : 'Nhân viên kho';
```

**Checklist:**
- [ ] Import role utilities
- [ ] Update viewMode initialization
- [ ] Add auth subscription effect
- [ ] Replace all 5 role checks
- [ ] No TypeScript errors
- [ ] Test: viewMode updates when user logs in/out

---

### Phase 4: High Priority Files ⏱️ 3 hours

#### Task 4.1: Update `src/features/portal/workspace/ConversationDetailPanel.tsx`

**Locations:** Lines 184, 358, 964, 967, 1142, 1182, 1210

**Import:**
```typescript
import { hasLeaderPermissions, hasStaffPermissions } from '@/utils/roleUtils';
```

**Pattern to replace:**
```typescript
// OLD: viewMode === "lead"
// NEW: hasLeaderPermissions()

// OLD: viewMode === "staff"
// NEW: hasStaffPermissions()
```

**Example changes:**

**Line 184:**
```typescript
// OLD:
// const canEditStructure = viewMode === "lead" && t.status.code === "todo";

// NEW:
const canEditStructure = hasLeaderPermissions() && t.status.code === "todo";
```

**Line 358:**
```typescript
// OLD:
// {viewMode === "lead" && (

// NEW:
{hasLeaderPermissions() && (
```

**Lines 964-967:**
```typescript
// OLD:
// if (viewMode === "lead") {
//   return { canEdit: true, canDelete: true, canAssign: true };
// }
// if (viewMode === "staff") {
//   return { canEdit: isOwner, canDelete: false, canAssign: false };
// }

// NEW:
if (hasLeaderPermissions()) {
  return { canEdit: true, canDelete: true, canAssign: true };
}
if (hasStaffPermissions()) {
  return { canEdit: isOwner, canDelete: false, canAssign: false };
}
```

**Checklist:**
- [ ] Import role utilities
- [ ] Replace all 8 viewMode checks
- [ ] No TypeScript errors
- [ ] Test: Task permissions work correctly

---

#### Task 4.2: Update `src/features/portal/workspace/ChatMain.tsx`

**Locations:** Lines 617, 622, 656, 689, 771

**Import:**
```typescript
import { hasLeaderPermissions } from '@/utils/roleUtils';
```

**Replace pattern:** `viewMode === 'lead'` → `hasLeaderPermissions()`

**Example:**

**Line 617:**
```typescript
// OLD:
// Công việc {viewMode === 'lead' ? '(Phòng ban)' : ''}

// NEW:
Công việc {hasLeaderPermissions() ? '(Phòng ban)' : ''}
```

**Line 771:**
```typescript
// OLD:
// if (viewMode === 'lead') {

// NEW:
if (hasLeaderPermissions()) {
```

**Checklist:**
- [ ] Import role utilities
- [ ] Replace all 5 viewMode checks
- [ ] No TypeScript errors
- [ ] Test: Message actions visible correctly

---

#### Task 4.3: Update `src/features/portal/components/TabTaskMobile.tsx`

**Locations:** 13 checks throughout the file

**Import:**
```typescript
import { hasLeaderPermissions, hasStaffPermissions } from '@/utils/roleUtils';
```

**Replace:**
- `viewMode === "lead"` → `hasLeaderPermissions()`
- `viewMode === "staff"` → `hasStaffPermissions()`

**Key locations:**

**Line 111:**
```typescript
// OLD:
// const canEditStructure = viewMode === "lead" && ...

// NEW:
const canEditStructure = hasLeaderPermissions() && ...
```

**Lines 437, 446:**
```typescript
// OLD:
// {viewMode === "staff" && t.status === "todo" && (

// NEW:
{hasStaffPermissions() && t.status === "todo" && (
```

**Line 455:**
```typescript
// OLD:
// {viewMode === "lead" && ["todo", "in_progress", "awaiting_review"].includes(t.status) && (

// NEW:
{hasLeaderPermissions() && ["todo", "in_progress", "awaiting_review"].includes(t.status) && (
```

**Checklist:**
- [ ] Import role utilities
- [ ] Replace all 13 viewMode checks
- [ ] No TypeScript errors
- [ ] Test: Mobile task UI works correctly

---

#### Task 4.4: Update `src/features/portal/components/FileManager.tsx`

**Locations:** 13 checks throughout the file

**Import:**
```typescript
import { hasLeaderPermissions } from '@/utils/roleUtils';
```

**Replace:** `viewMode === "lead"` → `hasLeaderPermissions()`

**Key locations:**

**Lines 321, 332, 369, 402:**
```typescript
// OLD:
// {viewMode === "lead" ? (

// NEW:
{hasLeaderPermissions() ? (
```

**Line 532:**
```typescript
// OLD:
// viewMode === "lead" && currentFolder && (currentFolder.level ?? 0) === 0;

// NEW:
hasLeaderPermissions() && currentFolder && (currentFolder.level ?? 0) === 0;
```

**Checklist:**
- [ ] Import role utilities
- [ ] Replace all 13 viewMode checks
- [ ] No TypeScript errors
- [ ] Test: File manager permissions work correctly

---

### Phase 5: Medium Priority Files ⏱️ 1.5 hours

#### Task 5.1: Remove `src/features/portal/components/ViewModeSwitcher.tsx`

**Decision:** Remove completely (per human decision #1)

**Actions:**
1. Delete the file
2. Remove all imports
3. Remove from parent components

**Files that import ViewModeSwitcher:**
- `src/features/portal/PortalWireframes.tsx`
- Check for other imports with grep

**In PortalWireframes.tsx, remove:**
```typescript
// DELETE THIS IMPORT:
// import { ViewModeSwitcher } from "@/features/portal/components/ViewModeSwitcher";

// DELETE THIS JSX (search for "ViewModeSwitcher"):
// <ViewModeSwitcher viewMode={viewMode} setViewMode={setViewMode} />
```

**Checklist:**
- [ ] Delete ViewModeSwitcher.tsx file
- [ ] Remove import from PortalWireframes.tsx
- [ ] Remove JSX usage
- [ ] Search codebase for other imports
- [ ] No TypeScript errors

---

#### Task 5.2: Update `src/features/portal/components/MainSidebar.tsx`

**Locations:** Lines 258, 299, 303

**Import:**
```typescript
import { hasLeaderPermissions } from '@/utils/roleUtils';
```

**Replace:** `viewMode === 'lead'` → `hasLeaderPermissions()`

**Line 258:**
```typescript
// OLD:
// {viewMode === 'lead' && (

// NEW:
{hasLeaderPermissions() && (
```

**Line 299:**
```typescript
// OLD:
// className={`... ${viewMode === 'lead' ? '...' : '...'}`}

// NEW:
className={`... ${hasLeaderPermissions() ? '...' : '...'}`}
```

**Line 303:**
```typescript
// OLD:
// {viewMode === 'lead' ? '🎖️ Trưởng nhóm' : '👤 Nhân viên'}

// NEW:
{hasLeaderPermissions() ? '🎖️ Trưởng nhóm' : '👤 Nhân viên'}
```

**Checklist:**
- [ ] Import role utilities
- [ ] Replace 4 viewMode checks
- [ ] No TypeScript errors
- [ ] Test: Sidebar displays correctly

---

#### Task 5.3: Update `src/features/portal/workspace/WorkspaceView.tsx`

**Change:** Add JSDoc deprecation notice to prop

**Line 121:**
```typescript
// OLD:
// viewMode: "lead" | "staff";

// NEW:
/**
 * @deprecated ViewMode will be removed in future versions.
 * Use role-based utilities from @/utils/roleUtils instead.
 */
viewMode: "lead" | "staff";
```

**Checklist:**
- [ ] Add deprecation comment
- [ ] No TypeScript errors

---

#### Task 5.4: Update `src/features/portal/workspace/ChatMessagePanel.tsx`

**Location:** Line 521

**Import:**
```typescript
import { hasLeaderPermissions } from '@/utils/roleUtils';
```

**Replace:**
```typescript
// OLD:
// {viewMode === "lead" && (

// NEW:
{hasLeaderPermissions() && (
```

**Checklist:**
- [ ] Import role utilities
- [ ] Replace viewMode check
- [ ] No TypeScript errors

---

#### Task 5.5: Update `src/features/portal/workspace/InformationPanel.tsx`

**Location:** Line 137

**Import:**
```typescript
import { hasLeaderPermissions } from '@/utils/roleUtils';
```

**Replace:**
```typescript
// OLD:
// {viewMode === "lead" && (

// NEW:
{hasLeaderPermissions() && (
```

**Checklist:**
- [ ] Import role utilities
- [ ] Replace viewMode check
- [ ] No TypeScript errors

---

### Phase 6: Low Priority Files ⏱️ 2 hours

#### Task 6.1: Batch Update Low Priority Files

**Files with 1-2 checks each:**

1. `src/features/portal/components/MessageBubble.tsx` (lines 408, 418)
2. `src/features/portal/components/TabInfoMobile.tsx` (line 129)
3. `src/features/portal/components/TabOwnTasksMobile.tsx` (lines 301, 337, 373, 423)
4. `src/features/portal/components/DefaultChecklistMobile.tsx` (prop only - add deprecation)

**Pattern for all:**

**Add import:**
```typescript
import { hasLeaderPermissions } from '@/utils/roleUtils';
```

**Replace:**
```typescript
// OLD: viewMode === "lead"
// NEW: hasLeaderPermissions()
```

**For props-only files (DefaultChecklistMobile.tsx):**
```typescript
/**
 * @deprecated Use role-based utilities instead
 */
viewMode?: "lead" | "staff";
```

**Checklist:**
- [ ] Update MessageBubble.tsx
- [ ] Update TabInfoMobile.tsx
- [ ] Update TabOwnTasksMobile.tsx
- [ ] Update DefaultChecklistMobile.tsx
- [ ] All files: No TypeScript errors

---

### Phase 7: Cleanup & Documentation ⏱️ 1 hour

#### Task 7.1: Update Type Definitions

**File:** `src/types/auth.ts`

**Add role types if not present:**
```typescript
/**
 * Application roles with hierarchy
 * Admin > Leader > Staff
 */
export type AppRole = 'Admin' | 'Leader' | 'Staff';
```

**Checklist:**
- [ ] Add AppRole type
- [ ] No duplicate type definitions

---

#### Task 7.2: Update Documentation

**Files to update:**

1. **Create:** `docs/modules/role_system_changes/03_progress.md`
   - Mark all tasks as complete
   - Add completion timestamp
   - List any issues encountered

2. **Update:** `docs/api/_phase2_summary.md`
   - Add note about role system migration
   - Link to migration docs

3. **Update:** `.github/copilot-instructions.md`
   - Update role system section
   - Remove references to binary viewMode
   - Add examples using roleUtils

**Checklist:**
- [ ] Create progress document
- [ ] Update phase2 summary
- [ ] Update copilot instructions
- [ ] All links work

---

#### Task 7.3: Final Testing

**Manual Testing:**
1. Clear localStorage
2. Login with different roles:
   - Admin → Should see Leader UI
   - Leader → Should see Leader UI
   - Staff → Should see Staff UI
   - Admin+Staff → Should see Leader UI
3. Check all features work correctly
4. Verify no ViewModeSwitcher appears

**Automated Testing:**
```bash
# Run all tests
npm run test

# Run specific tests
npm run test -- roleUtils.test.ts

# Run E2E tests (if available)
npm run test:e2e
```

**Checklist:**
- [ ] All unit tests pass
- [ ] Manual testing complete
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] E2E tests pass (if available)

---

## 📊 IMPACT SUMMARY (Detailed)

### Files Created: 2
1. `src/utils/roleUtils.ts` (200 lines)
2. `src/utils/__tests__/roleUtils.test.ts` (300 lines)

### Files Modified: 16
1. `src/stores/uiStore.ts` - 3 changes
2. `src/features/portal/PortalWireframes.tsx` - 7 changes (5 checks + 2 structural)
3. `src/features/portal/workspace/ConversationDetailPanel.tsx` - 8 changes
4. `src/features/portal/workspace/ChatMain.tsx` - 5 changes
5. `src/features/portal/components/TabTaskMobile.tsx` - 13 changes
6. `src/features/portal/components/FileManager.tsx` - 13 changes
7. `src/features/portal/components/MainSidebar.tsx` - 4 changes
8. `src/features/portal/workspace/WorkspaceView.tsx` - 1 change (deprecation)
9. `src/features/portal/workspace/ChatMessagePanel.tsx` - 1 change
10. `src/features/portal/workspace/InformationPanel.tsx` - 1 change
11. `src/features/portal/components/MessageBubble.tsx` - 2 changes
12. `src/features/portal/components/TabInfoMobile.tsx` - 1 change
13. `src/features/portal/components/TabOwnTasksMobile.tsx` - 4 changes
14. `src/features/portal/components/DefaultChecklistMobile.tsx` - 1 change
15. `src/types/auth.ts` - Add AppRole type
16. `.github/copilot-instructions.md` - Update role section

### Files Deleted: 1
1. `src/features/portal/components/ViewModeSwitcher.tsx`

### Total Changes: **~70 replacements** across 16 files

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Breaking Changes During Migration
**Mitigation:** 
- Keep viewMode prop temporarily
- Test each phase before moving to next
- Can rollback with git revert

### Risk 2: Missed Role Checks
**Mitigation:**
- Use grep to find all `viewMode` usages
- Code review before commit
- Run full test suite

### Risk 3: Auth State Not Initialized
**Mitigation:**
- Check user is loaded before calling roleUtils
- Add null checks in utilities
- Default to safe fallback (staff permissions)

---

## 🧪 TESTING STRATEGY

### Unit Tests
- `roleUtils.test.ts` - 30+ test cases
- Mock authStore properly
- Test all edge cases

### Integration Tests
- Test auth flow with role loading
- Test viewMode derivation
- Test permission checks in components

### E2E Tests (Full Coverage)
- Login as Admin → Verify Leader UI
- Login as Leader → Verify Leader UI
- Login as Staff → Verify Staff UI
- Login as Admin+Staff → Verify Leader UI (Admin wins)
- Check all critical features work

### Manual Testing
- [ ] Admin can see all leader features
- [ ] Leader can see all leader features
- [ ] Staff sees limited features
- [ ] Multi-role users see correct UI
- [ ] No ViewModeSwitcher visible
- [ ] No console errors

---

## 📋 PENDING DECISIONS

| Item | Status |
|------|--------|
| Đã review Implementation Plan | ⬜  review |
| Đã hiểu migration approach | ⬜  hiểu |
| Sẵn sàng bắt đầu Phase 1 | ⬜  sẵn sàng |
| **APPROVED để bắt đầu implementation** | ⬜  APPROVED |

**HUMAN Signature:** Khoa
**Date:** 20012026

> ⚠️ **AI CANNOT begin implementation until this section has ✅ APPROVED**

---

## 📚 NEXT STEPS

1. **Human reviews this plan**
2. **Human approves to start**
3. **AI begins Phase 1:** Create roleUtils.ts + tests
4. **After Phase 1 complete:** Human reviews & approves Phase 2
5. **Continue through all phases**
6. **Final review & testing**

---

**End of Implementation Plan**

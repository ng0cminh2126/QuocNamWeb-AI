# Role System Analysis & Migration Plan

> **Created:** 2026-01-20  
> **Status:** ⏳ PENDING HUMAN APPROVAL  
> **Scope:** Migrate from binary role system (leader/staff) to multi-role system (Admin, Leader, Staff)

---

## 📋 EXECUTIVE SUMMARY

### Current State
- **Binary viewMode system:** `"lead"` or `"staff"` 
- **Hard-coded role checks:** `viewMode === "lead"` scattered across 50+ files
- **Single role assumption:** Users can only be one role at a time
- **Mock data dependency:** Role determination tied to demo users

### Target State
- **Multi-role system:** Users can have multiple roles: `["Admin", "Leader", "Staff"]`
- **Role source:** `localStorage["auth-storage"].state.user.roles` (array)
- **Permission model:** 
  - `"Admin"` + `"Leader"` → Show Leader UI (old "lead" viewMode)
  - `"Staff"` → Show Staff UI (old "staff" viewMode)
- **Dynamic role checks:** Replace hard-coded `viewMode` with role-based utilities

---

## 🔍 CURRENT SYSTEM ARCHITECTURE

### 1. ViewMode State Management

**Primary State Location:**
```typescript
// src/stores/uiStore.ts
export type ViewMode = 'lead' | 'staff';

interface UIState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const initialState = {
  viewMode: 'staff' as ViewMode, // Default
}
```

**Props Propagation:**
```
PortalWireframes (root)
  ↓ viewMode prop
  ├─→ WorkspaceView
  ├─→ TeamMonitorView
  ├─→ MainSidebar
  └─→ ViewModeSwitcher (toggle component)
```

### 2. Role Data Sources

**Auth Storage Structure:**
```typescript
// src/stores/authStore.ts
interface AuthUser {
  id: string;
  identifier: string;
  roles: string[]; // ✅ Already supports array!
}

// localStorage["auth-storage"] structure:
{
  state: {
    user: {
      id: "u_thanh_truc",
      identifier: "thanh.truc@example.com",
      roles: ["leader"] // Current: single role in array
    },
    accessToken: "...",
    // ...
  }
}
```

**Current User Utilities:**
```typescript
// src/utils/getCurrentUser.ts
export async function getCurrentUser(): Promise<{
  id: string;
  identifier: string;
  roles: string[]; // ✅ Already returns array
}>
```

### 3. Role Check Patterns

**Pattern 1: ViewMode Equality (Most Common)**
```typescript
// Found in 50+ locations
{viewMode === "lead" && <LeaderOnlyFeature />}
{viewMode === "staff" && <StaffOnlyFeature />}

// Ternary operators
{viewMode === "lead" ? <LeaderUI /> : <StaffUI />}
```

**Pattern 2: Computed Values**
```typescript
// src/features/portal/PortalWireframes.tsx
const currentUser = viewMode === 'lead' ? 'Thanh Trúc' : 'Diễm Chi';
const currentUserId = viewMode === 'lead' ? getCurrentUserIdSync() : 'u_diem_chi';
```

**Pattern 3: Permission Flags**
```typescript
// src/features/portal/workspace/ConversationDetailPanel.tsx
const canEditStructure = viewMode === "lead" && t.status.code === "todo";
```

**Pattern 4: Member Role Transformation**
```typescript
// src/utils/memberTransform.ts
if (normalizedRole === 'leader' || normalizedRole === 'admin' || normalizedRole === 'owner') {
  role = 'Leader';
} else {
  role = 'Member';
}
```

---

## 📊 FILE DEPENDENCY TREE

### Tree Starting from WorkspaceView

```
src/features/portal/workspace/WorkspaceView.tsx [uses viewMode prop]
├── Receives: viewMode: "lead" | "staff" (line 121)
├── Passes to child components:
│   ├─→ ChatMessagePanel.tsx [line 521: viewMode === "lead"]
│   ├─→ ChatMain.tsx 
│   │   ├── [line 617: viewMode === 'lead']
│   │   ├── [line 622: viewMode === 'lead']
│   │   ├── [line 656: viewMode === 'lead']
│   │   ├── [line 689: viewMode === 'lead']
│   │   └── [line 771: if (viewMode === 'lead')]
│   ├─→ ConversationDetailPanel.tsx
│   │   ├── [line 184: viewMode === "lead"]
│   │   ├── [line 358: viewMode === "lead"]
│   │   ├── [line 964-967: viewMode branches]
│   │   ├── [line 1142: viewMode === "lead"]
│   │   ├── [line 1182: viewMode === "lead"]
│   │   └── [line 1210: viewMode === "staff"]
│   ├─→ InformationPanel.tsx [line 137: viewMode === "lead"]
│   └─→ TabInfoMobile.tsx [line 129: viewMode === "lead"]

src/features/portal/PortalWireframes.tsx [manages viewMode state]
├── State: const [viewMode, setViewMode] = React.useState<"lead" | "staff">("lead")
├── Derives values:
│   ├── currentUser (line 196)
│   ├── currentUserId (line 201)
│   └── currentUserDepartment (line 202)
├── Passes to:
│   ├─→ WorkspaceView (via props)
│   ├─→ TeamMonitorView
│   ├─→ MainSidebar [line 258, 299, 303]
│   └─→ ViewModeSwitcher [toggle button]

src/features/portal/components/ [viewMode consumers]
├── MessageBubble.tsx
│   ├── [line 408: viewMode === "lead"]
│   └── [line 418: viewMode === "lead"]
├── TabTaskMobile.tsx
│   ├── [line 111: canEditStructure = viewMode === "lead"]
│   ├── [line 284, 437, 446, 455: viewMode checks]
│   ├── [line 542-545: viewMode branches]
│   ├── [line 573, 611, 627: viewMode checks]
│   └── [line 964, 1057: viewMode === "lead"]
├── FileManager.tsx
│   ├── [line 321, 332, 369: viewMode === "lead"]
│   ├── [line 402, 532, 552: viewMode checks]
│   ├── [line 693, 822, 842: viewMode === "lead"]
│   ├── [line 961, 1292, 1361: viewMode checks]
├── ViewModeSwitcher.tsx
│   ├── Props: viewMode, setViewMode
│   └── [line 11: toggle logic]
├── MainSidebar.tsx
│   ├── Props: viewMode?: "lead" | "staff"
│   ├── [line 258: viewMode === 'lead']
│   └── [line 299, 303: viewMode display]
├── TabInfoMobile.tsx [line 129]
├── TabOwnTasksMobile.tsx [line 301, 337, 373, 423]
├── TabTaskMobile.tsx [multiple locations]
└── DefaultChecklistMobile.tsx [prop only]

src/stores/uiStore.ts [global state]
├── Type: ViewMode = 'lead' | 'staff'
├── State: viewMode: ViewMode
├── Action: setViewMode: (mode: ViewMode) => void
└── Default: 'staff'

src/utils/memberTransform.ts [member role mapping]
└── Maps API roles → UI roles ('Leader' | 'Member')
```

### Critical Files Summary

| File | Role Checks | Impact | Priority |
|------|------------|--------|----------|
| `PortalWireframes.tsx` | 5 | Root state management | 🔴 HIGH |
| `uiStore.ts` | 1 | Global state type | 🔴 HIGH |
| `WorkspaceView.tsx` | 0 (prop only) | Props interface | 🟡 MEDIUM |
| `ConversationDetailPanel.tsx` | 8 | Task permissions | 🔴 HIGH |
| `ChatMain.tsx` | 5 | Message actions | 🔴 HIGH |
| `TabTaskMobile.tsx` | 13 | Mobile task UI | 🔴 HIGH |
| `FileManager.tsx` | 13 | File permissions | 🔴 HIGH |
| `ViewModeSwitcher.tsx` | 3 | Toggle UI | 🟡 MEDIUM |
| `MainSidebar.tsx` | 4 | Navigation UI | 🟡 MEDIUM |
| `MessageBubble.tsx` | 2 | Message actions | 🟡 MEDIUM |
| `memberTransform.ts` | 3 | API transformation | 🟢 LOW |
| Others (20+ files) | 1-2 each | Conditional UI | 🟢 LOW |

---

## 🎯 MIGRATION STRATEGY

### Phase 1: Create Role Utilities (Foundation)

**New File: `src/utils/roleUtils.ts`**
```typescript
import { useAuthStore } from '@/stores/authStore';

/**
 * Role hierarchy for permission checks
 */
export const ROLE_HIERARCHY = {
  Admin: 3,
  Leader: 2,
  Staff: 1,
} as const;

export type AppRole = keyof typeof ROLE_HIERARCHY;

/**
 * Check if user has a specific role
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
 */
export function hasAnyRole(...roles: AppRole[]): boolean {
  return roles.some(role => hasRole(role));
}

/**
 * Check if user has leader-level permissions
 * (Admin or Leader roles)
 */
export function hasLeaderPermissions(): boolean {
  return hasAnyRole('Admin', 'Leader');
}

/**
 * Check if user has staff-only permissions
 * (Staff role without Admin/Leader)
 */
export function hasStaffPermissions(): boolean {
  return hasRole('Staff') && !hasLeaderPermissions();
}

/**
 * Get current user roles from auth storage
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
 * Determine view mode based on user roles
 * For backward compatibility with existing UI
 */
export function getViewModeFromRoles(): 'lead' | 'staff' {
  return hasLeaderPermissions() ? 'lead' : 'staff';
}
```

### Phase 2: Update State Management

**Update `src/stores/uiStore.ts`:**
```typescript
import { create } from 'zustand';
import { getViewModeFromRoles } from '@/utils/roleUtils';

export type ViewMode = 'lead' | 'staff';
// ... existing code ...

export const useUIStore = create<UIState>()((set) => ({
  // CHANGED: Initialize from user roles instead of hardcoded
  viewMode: getViewModeFromRoles(),
  
  // CHANGED: Validate role before setting (optional safety check)
  setViewMode: (mode) => {
    // Optional: Prevent setting 'lead' if user doesn't have permissions
    // const actualMode = mode === 'lead' && !hasLeaderPermissions() ? 'staff' : mode;
    set({ viewMode: mode });
  },
  
  // ... rest of the code unchanged
}));
```

### Phase 3: Replace Direct Role Checks

**Migration Pattern:**

**BEFORE:**
```typescript
{viewMode === "lead" && <LeaderFeature />}
{viewMode === "staff" && <StaffFeature />}
```

**AFTER:**
```typescript
import { hasLeaderPermissions, hasStaffPermissions } from '@/utils/roleUtils';

{hasLeaderPermissions() && <LeaderFeature />}
{hasStaffPermissions() && <StaffFeature />}
```

**For components that still receive viewMode prop (for gradual migration):**
```typescript
// Keep prop for now, but add role check
interface Props {
  viewMode?: "lead" | "staff"; // Keep for backward compat
}

function Component({ viewMode }: Props) {
  // Prioritize role-based check over prop
  const isLeader = hasLeaderPermissions();
  
  return (
    <>
      {isLeader && <LeaderFeature />}
    </>
  );
}
```

### Phase 4: Update Root Component

**Update `src/features/portal/PortalWireframes.tsx`:**
```typescript
import { getViewModeFromRoles, hasLeaderPermissions } from '@/utils/roleUtils';

export default function PortalWireframes({ portalMode = "desktop" }: PortalWireframesProps) {
  // CHANGED: Initialize from roles
  const [viewMode, setViewMode] = React.useState<"lead" | "staff">(
    getViewModeFromRoles()
  );
  
  // CHANGED: Re-derive when auth state changes
  React.useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.user) {
        const newMode = getViewModeFromRoles();
        setViewMode(newMode);
      }
    });
    return unsubscribe;
  }, []);
  
  // CHANGED: Use role-based function instead of viewMode
  const getCurrentUserName = (): string => {
    const user = useAuthStore.getState().user;
    if (user?.identifier) {
      return user.identifier;
    }
    // Fallback for demo (will be removed in production)
    return hasLeaderPermissions() ? 'Thanh Trúc' : 'Diễm Chi';
  };
  
  // CHANGED: Use role-based check
  const currentUserId = hasLeaderPermissions() 
    ? getCurrentUserIdSync() 
    : 'u_diem_chi';
    
  // ... rest unchanged
}
```

### Phase 5: Remove ViewModeSwitcher (Optional)

**Option A: Keep for Testing**
- Allow manual override during development
- Add dev-only flag: `if (import.meta.env.DEV) { <ViewModeSwitcher /> }`

**Option B: Remove Completely**
- View mode is now determined by actual user roles
- No manual switching needed in production

---

## 📝 IMPACT SUMMARY

### Files to Create (1):
- `src/utils/roleUtils.ts` - Role checking utilities

### Files to Modify (Core - 15):

**HIGH PRIORITY (must change):**
1. `src/stores/uiStore.ts`
   - Initialize viewMode from roles
   - Update type documentation
   
2. `src/features/portal/PortalWireframes.tsx`
   - Replace `viewMode === 'lead'` checks (5 locations)
   - Update currentUser derivation
   - Add auth subscription for role changes
   
3. `src/features/portal/workspace/ConversationDetailPanel.tsx`
   - Replace 8 viewMode checks with role utilities
   - Update canEditStructure logic
   
4. `src/features/portal/workspace/ChatMain.tsx`
   - Replace 5 viewMode checks
   
5. `src/features/portal/components/TabTaskMobile.tsx`
   - Replace 13 viewMode checks
   
6. `src/features/portal/components/FileManager.tsx`
   - Replace 13 viewMode checks

**MEDIUM PRIORITY (UI dependent):**
7. `src/features/portal/components/ViewModeSwitcher.tsx`
   - Option 1: Keep for dev mode
   - Option 2: Remove entirely
   
8. `src/features/portal/components/MainSidebar.tsx`
   - Replace 4 viewMode checks
   - Update user role display badge
   
9. `src/features/portal/workspace/WorkspaceView.tsx`
   - Update prop type (keep for now)
   - Add JSDoc about deprecation
   
10. `src/features/portal/workspace/ChatMessagePanel.tsx`
    - Replace 1 viewMode check
    
11. `src/features/portal/workspace/InformationPanel.tsx`
    - Replace 1 viewMode check

**LOW PRIORITY (minor UI):**
12. `src/features/portal/components/MessageBubble.tsx` (2 checks)
13. `src/features/portal/components/TabInfoMobile.tsx` (1 check)
14. `src/features/portal/components/TabOwnTasksMobile.tsx` (4 checks)
15. `src/features/portal/components/DefaultChecklistMobile.tsx` (prop only)

### Files to Modify (Extended - 20+ files):
- All other files with `viewMode` checks (1-2 checks each)
- Follow same pattern: Import roleUtils → Replace checks

### Files NOT Changed:
- `src/stores/authStore.ts` - ✅ Already supports roles array
- `src/utils/getCurrentUser.ts` - ✅ Already returns roles array
- `src/types/auth.ts` - ✅ Types already correct

### Dependencies:
- **No new packages needed** - Pure TypeScript utilities

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests (`src/utils/__tests__/roleUtils.test.ts`):

```typescript
describe('roleUtils', () => {
  beforeEach(() => {
    // Reset auth store
  });
  
  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      // Set user with roles: ['Admin', 'Leader']
      expect(hasRole('Admin')).toBe(true);
      expect(hasRole('Leader')).toBe(true);
      expect(hasRole('Staff')).toBe(false);
    });
    
    it('should be case-insensitive', () => {
      // Set user with roles: ['admin']
      expect(hasRole('Admin')).toBe(true);
    });
    
    it('should return false when user has no roles', () => {
      // Set user with roles: []
      expect(hasRole('Admin')).toBe(false);
    });
  });
  
  describe('hasLeaderPermissions', () => {
    it('should return true for Admin role', () => {
      // Set roles: ['Admin']
      expect(hasLeaderPermissions()).toBe(true);
    });
    
    it('should return true for Leader role', () => {
      // Set roles: ['Leader']
      expect(hasLeaderPermissions()).toBe(true);
    });
    
    it('should return false for Staff only', () => {
      // Set roles: ['Staff']
      expect(hasLeaderPermissions()).toBe(false);
    });
    
    it('should return true for Admin+Staff combo', () => {
      // Set roles: ['Admin', 'Staff']
      expect(hasLeaderPermissions()).toBe(true);
    });
  });
  
  describe('getViewModeFromRoles', () => {
    it('should return "lead" for Admin', () => {
      // Set roles: ['Admin']
      expect(getViewModeFromRoles()).toBe('lead');
    });
    
    it('should return "lead" for Leader', () => {
      // Set roles: ['Leader']
      expect(getViewModeFromRoles()).toBe('lead');
    });
    
    it('should return "staff" for Staff only', () => {
      // Set roles: ['Staff']
      expect(getViewModeFromRoles()).toBe('staff');
    });
    
    it('should return "lead" for multi-role with Leader', () => {
      // Set roles: ['Leader', 'Staff']
      expect(getViewModeFromRoles()).toBe('lead');
    });
  });
});
```

### Integration Tests:
- Test auth flow: Login → Roles loaded → UI updates
- Test role change: Update localStorage → UI re-renders
- Test permission checks in actual components

### Manual Testing Checklist:
```
[ ] Login as Admin → Should see Leader UI
[ ] Login as Leader → Should see Leader UI  
[ ] Login as Staff → Should see Staff UI
[ ] Login as Admin+Staff → Should see Leader UI (Admin takes priority)
[ ] Update roles in localStorage → UI should update reactively
[ ] ViewModeSwitcher (if kept) → Should still work for manual testing
```

---

## ⚠️ RISKS & CONSIDERATIONS

### 1. Breaking Changes
- **Risk:** Components expecting `viewMode` prop will break
- **Mitigation:** Keep prop type, add deprecation warning, migrate gradually

### 2. Role Synchronization
- **Risk:** localStorage roles out of sync with API
- **Mitigation:** Re-fetch roles on app mount, token refresh

### 3. Multi-Role Edge Cases
- **Risk:** User with `["Admin", "Staff"]` - which UI to show?
- **Decision:** Admin/Leader always takes priority (hierarchy model)

### 4. Backward Compatibility
- **Risk:** Old code expects binary viewMode
- **Mitigation:** `getViewModeFromRoles()` maintains compatibility layer

### 5. Performance
- **Risk:** Calling `useAuthStore.getState()` repeatedly
- **Mitigation:** Zustand is optimized for this, or add memoization if needed

---

## 📋 PENDING DECISIONS

| # | Question | Options | HUMAN Decision |
|---|----------|---------|----------------|
| 1 | Keep ViewModeSwitcher? | A) Remove, B) Dev-only, C) Keep | Remove|
| 2 | Role priority when user has ["Admin", "Staff"] | A) Admin wins, B) Let user choose, C) Show both UIs | ⬜ Admin wins |
| 3 | Migration approach | A) Big bang (all at once), B) Gradual (file by file), C) Feature flag | ⬜ Big bang |
| 4 | Handle role changes at runtime? | A) Require re-login, B) Auto-update UI, C) Show notification | ⬜ do nothing for now |
| 5 | Deprecated viewMode prop | A) Remove immediately, B) Keep with warning, C) Keep indefinitely | ⬜ do nothing for now |
| 6 | Test coverage target | A) Utils only, B) Utils + key components, C) Full E2E | ⬜ Full E2E |

> ⚠️ **AI CANNOT proceed with code changes until all decisions are filled**

---

## ✅ HUMAN CONFIRMATION

| Item | Status |
|------|--------|
| Đã review File Dependency Tree |   review |
| Đã review Migration Strategy |   review |
| Đã review Impact Summary |   review |
| Đã điền Pending Decisions (all 6 items) |  Chưa điền |
| **APPROVED để tạo Implementation Plan** | ⬜ CHƯA APPROVED |

**HUMAN Signature:** Khoa
**Date:** 20012026

> ⚠️ **CRITICAL:** AI CANNOT create implementation plan or write code until this section has ✅ APPROVED

---

## 📚 NEXT STEPS (After Approval)

1. **Create Implementation Plan**
   - File-by-file modification plan
   - Test plan with specific scenarios
   - Rollback strategy

2. **Create Test Requirements**
   - Unit test specifications
   - Integration test scenarios
   - E2E test flows

3. **Begin Implementation** (only after both plans approved)
   - Phase 1: Create roleUtils.ts + tests
   - Phase 2: Update state management
   - Phase 3: Migrate high-priority files
   - Phase 4: Migrate medium/low priority files
   - Phase 5: Remove deprecated code

---

**End of Analysis Document**

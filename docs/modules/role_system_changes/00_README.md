# Role System Migration - Documentation

> **Module:** role_system_changes  
> **Created:** 2026-01-20  
> **Status:** 📋 Planning Phase  
> **Version:** 1.0

---

## 📁 Module Structure

```
docs/modules/role_system_changes/
├── 00_README.md                    # This file - Overview
├── 01_implementation_plan.md       # Detailed step-by-step plan
├── 02_test_requirements.md         # Test specifications
└── 03_progress.md                  # Implementation progress tracker
```

---

## 🎯 Overview

**Goal:** Migrate from binary role system (`"lead"` | `"staff"`) to multi-role system supporting `["Admin", "Leader", "Staff"]`

**Current State:**
- Hard-coded `viewMode === "lead"` checks in 50+ files
- Single role assumption per user
- Mock data dependency for role determination

**Target State:**
- Multi-role support from `localStorage["auth-storage"].state.user.roles`
- Permission hierarchy: Admin > Leader > Staff
- Dynamic role-based utilities instead of viewMode checks

---

## 📋 Documents

### [01_implementation_plan.md](./01_implementation_plan.md)
**Status:** ✅ Ready  
**Content:** File-by-file implementation plan with code examples

**Sections:**
- Phase 1: Foundation (roleUtils.ts + tests)
- Phase 2: State Management (uiStore.ts)
- Phase 3: High Priority Files (6 files)
- Phase 4: Medium Priority Files (5 files)
- Phase 5: Low Priority Files (20+ files)
- Phase 6: Cleanup & Documentation

### [02_test_requirements.md](./02_test_requirements.md)
**Status:** 🔄 TODO  
**Content:** Comprehensive test specifications

**Will Include:**
- Unit test cases for roleUtils.ts
- Integration test scenarios
- E2E test flows with Playwright
- Manual testing checklist

### [03_progress.md](./03_progress.md)
**Status:** 🔄 TODO (Auto-generated during implementation)  
**Content:** Real-time progress tracking

**Will Track:**
- ✅ Completed tasks
- 🔄 In-progress tasks
- ⏳ Pending tasks
- ❌ Blocked tasks

---

## 🔑 Key Decisions (From Analysis)

| # | Decision | Choice |
|---|----------|--------|
| 1 | ViewModeSwitcher | **Remove** completely |
| 2 | Multi-role priority | **Admin wins** (hierarchy model) |
| 3 | Migration approach | **Big bang** (all at once) |
| 4 | Runtime role changes | **Do nothing for now** |
| 5 | Deprecated props | **Do nothing for now** (keep temporarily) |
| 6 | Test coverage | **Full E2E** |

---

## 📊 Impact Summary

### Files to Create: 1
- `src/utils/roleUtils.ts` (+ test file)

### Files to Modify: 35+

**HIGH Priority (6):**
- uiStore.ts
- PortalWireframes.tsx
- ConversationDetailPanel.tsx
- ChatMain.tsx
- TabTaskMobile.tsx
- FileManager.tsx

**MEDIUM Priority (5):**
- ViewModeSwitcher.tsx (will be removed)
- MainSidebar.tsx
- WorkspaceView.tsx
- ChatMessagePanel.tsx
- InformationPanel.tsx

**LOW Priority (20+):**
- All other files with 1-2 viewMode checks

---

## 🚦 Implementation Order

```
1. Create roleUtils.ts + tests          [Foundation]
   ↓
2. Update uiStore.ts                    [State]
   ↓
3. Update PortalWireframes.tsx          [Root]
   ↓
4. Migrate HIGH priority files          [Critical features]
   ↓
5. Migrate MEDIUM priority files        [UI components]
   ↓
6. Migrate LOW priority files           [Minor features]
   ↓
7. Remove ViewModeSwitcher              [Cleanup]
   ↓
8. Update documentation                 [Final]
```

---

## ⏱️ Estimated Timeline

| Phase | Estimated Time | Tasks |
|-------|---------------|-------|
| Phase 1-2 | 2 hours | Create utils + update state |
| Phase 3 | 4 hours | Root component + HIGH priority |
| Phase 4 | 2 hours | MEDIUM priority files |
| Phase 5 | 3 hours | LOW priority files |
| Phase 6 | 1 hour | Cleanup + docs |
| **Total** | **12 hours** | **35+ files** |

---

## 🔗 Related Documents

- Analysis: [docs/analysis/role_system_analysis.md](../../analysis/role_system_analysis.md)
- Copilot Instructions: [.github/copilot-instructions.md](../../../.github/copilot-instructions.md)
- Auth Store: [src/stores/authStore.ts](../../../src/stores/authStore.ts)

---

## 📝 Notes

- Auth store already supports roles array ✅
- No breaking changes to API contracts
- No new dependencies required
- Backward compatible during migration
- Can rollback by reverting commits

---

**Next Step:** Review [01_implementation_plan.md](./01_implementation_plan.md) for detailed instructions

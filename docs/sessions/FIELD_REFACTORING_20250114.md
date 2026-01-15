# Task Interface Refactoring - Field Renaming
**Date:** January 14, 2026  
**Changes:** Renamed `assigneeId` → `assignTo` and `assignedById` → `assignFrom`

---

## Overview

Updated the `Task` interface in `src/features/portal/types.ts` to use clearer field names that match the API contract:
- `assigneeId` → `assignTo` (person being assigned the task)
- `assignedById` → `assignFrom` (person assigning the task)

---

## Files Modified

### 1. **src/features/portal/types.ts** (Primary)
**Changes:**
```typescript
// BEFORE
assigneeId: ID;            // người được giao (staff)
assignedById: ID;          // leader giao

// AFTER
assignTo: ID;              // người được giao (staff)
assignFrom: ID;            // leader giao
```

---

### 2. **src/utils/taskTransform.ts** (Transformer)
**Changes:**
```typescript
// BEFORE
assigneeId: apiTask.assignTo,
assignedById: apiTask.assignFrom,

// AFTER
assignTo: apiTask.assignTo,
assignFrom: apiTask.assignFrom,
```

---

### 3. **src/data/mockTasks.ts** (Mock Data)
**Changes:**
- Updated all 20+ task objects
- Changed `assigneeId:` → `assignTo:`
- Changed `assignedById:` → `assignFrom:`

**Example:**
```typescript
// BEFORE
assigneeId: "u_thu_an",
assignedById: "u_thanh_truc",

// AFTER
assignTo: "u_thu_an",
assignFrom: "u_thanh_truc",
```

---

### 4. **src/features/portal/workspace/ConversationDetailPanel.tsx**
**Changes:**
- Updated parameter type: `assigneeId: string` → `assignTo: string`
- Updated all filter references: `t.assigneeId === currentUserId` → `t.assignTo === currentUserId`
- Updated member lookups: `m.id === t.assigneeId` → `m.id === t.assignTo`

**Count:** 8 updates

---

### 5. **src/features/portal/workspace/ChatMain.tsx**
**Changes:**
- Updated inline interface: `assigneeId: string` → `assignTo: string`
- Updated parameter: `onReassignTask?: (id: string, assigneeId: string)` → `onReassignTask?: (id: string, assignTo: string)`
- Updated filter: `t.assigneeId === currentUserId` → `t.assignTo === currentUserId`
- Updated transfer payload: `assigneeId: string` → `assignTo: string`

**Count:** 4 updates

---

### 6. **src/features/portal/components/TabOwnTasksMobile.tsx**
**Changes:**
- Updated filter in `ownTasks` memo: `t.assigneeId === currentUserId` → `t.assignTo === currentUserId`
- Updated filter in `allCompleted` memo: `t.assigneeId === currentUserId` → `t.assignTo === currentUserId`

**Count:** 2 updates

---

### 7. **src/types/tasks_api.ts** (Already Correct)
**No changes needed** - API types already use:
```typescript
assignTo: string;
assignFrom: string;
```

---

## Files Not Modified (Correct)

These files already use the new field names or don't need updates:

- `src/features/portal/workspace/ChatMessagePanel.tsx` - Uses correct names
- `src/features/portal/workspace/MobileTaskLogScreen.tsx` - Uses correct names
- `src/features/portal/workspace/TaskLogThreadSheet.tsx` - Uses correct names
- `src/features/portal/PortalWireframes.tsx` - Still uses mock data (can be updated if needed)
- `src/features/portal/workspace/MobileTaskLogScreenDemo.tsx` - Still uses mock data

---

## API Integration

The API already returns the correct field names:

```typescript
// TaskDetailResponse from API
{
  assignTo: string;        // User ID assigned to (staff)
  assignFrom: string;      // User ID assigned from (leader)
  // ... other fields
}
```

The `taskTransform.ts` correctly maps:
```
apiTask.assignTo → task.assignTo
apiTask.assignFrom → task.assignFrom
```

---

## Impact Summary

| Aspect | Details |
|--------|---------|
| **Breaking Change?** | Yes - field names changed |
| **API Impact** | No - API already uses new names |
| **Runtime Impact** | All Task filtering/lookups updated |
| **Files Affected** | 7 main files |
| **Total Updates** | ~30+ references updated |

---

## Testing Checklist

- [ ] Task creation - verify assignTo is set correctly
- [ ] Task filtering by assignee - uses new field name
- [ ] Task reassignment - updates assignTo field
- [ ] Mock data loads - no errors with new field names
- [ ] API transformation - maps assignTo/assignFrom correctly
- [ ] Mobile views - filter by assignTo works
- [ ] Desktop views - filter by assignTo works
- [ ] Leader own tasks - filter by assignTo === currentUserId

---

## Migration Notes

All references to task assignment have been renamed for consistency with the API:

1. **assigneeId** (recipient) → **assignTo**
2. **assignedById** (sender) → **assignFrom**

This makes the intention clearer:
- "Assign task **to** this person"
- "Task assigned **from** this leader"

The naming now matches common English usage and the API contract.

---


# [BƯỚC 4.5] Conversation Category Management System - Test Requirements

**Feature:** Conversation Category Management System  
**Module:** Chat - Management API Integration  
**Status:** ⏳ PENDING HUMAN APPROVAL  
**Version:** 1.0  
**Created:** 2026-01-16

---

## 📋 Overview

This document defines comprehensive test requirements for the Conversation Category Management System. It includes test coverage matrix, detailed test cases for each file, test data requirements, and mocking strategies.

**Testing Philosophy:** Test-driven implementation - write tests alongside code, not after.

---

## 📊 Test Coverage Summary

### Coverage Targets:
- **Unit Tests (API clients, Hooks):** 90%+ coverage
- **Component Tests:** 85%+ coverage  
- **Integration Tests:** Key user flows
- **E2E Tests (Optional):** Critical paths

### Total Test Files: 14
- 3 API client tests
- 3 Query hook tests
- 3 Mutation hook tests
- 2 New component tests
- 3 Modified component tests

### Test Execution Time Target: < 30 seconds (all unit/component tests)

---

## 🗺️ Test Coverage Matrix

| Implementation File | Test File | Test Type | Min Test Cases | Priority |
|---------------------|-----------|-----------|----------------|----------|
| `src/api/categories.api.ts` | `categories.api.test.ts` | Unit | 6 | HIGH |
| `src/api/groups.api.ts` | `groups.api.test.ts` | Unit | 8 | HIGH |
| `src/api/checklist-templates.api.ts` | `checklist-templates.api.test.ts` | Unit | 8 | HIGH |
| `src/hooks/queries/useCategories.ts` | `useCategories.test.ts` | Integration | 8 | HIGH |
| `src/hooks/queries/useGroupMembers.ts` | `useGroupMembers.test.ts` | Integration | 6 | HIGH |
| `src/hooks/queries/useChecklistTemplates.ts` | `useChecklistTemplates.test.ts` | Integration | 6 | HIGH |
| `src/hooks/mutations/useAddGroupMember.ts` | `useAddGroupMember.test.ts` | Integration | 7 | HIGH |
| `src/hooks/mutations/useRemoveGroupMember.ts` | `useRemoveGroupMember.test.ts` | Integration | 7 | HIGH |
| `src/hooks/mutations/usePromoteGroupMember.ts` | `usePromoteGroupMember.test.ts` | Integration | 7 | HIGH |
| `GroupUserManagement.tsx` | `GroupUserManagement.test.tsx` | Component | 12 | HIGH |
| `AddMemberDialog.tsx` | `AddMemberDialog.test.tsx` | Component | 8 | MEDIUM |
| `GroupSelector.tsx` (modified) | `GroupSelector.test.tsx` | Component | 8 | HIGH |
| `WorkTypeEditor.tsx` (modified) | `WorkTypeEditor.test.tsx` | Component | 10 | HIGH |
| `ManageVariantsDialog.tsx` (modified) | `ManageVariantsDialog.test.tsx` | Component | 7 | MEDIUM |

**Total Minimum Test Cases: 108**

---

## 🧪 Detailed Test Cases by File

### 1. API Client Tests

#### File: `src/api/categories.api.test.ts`
**Testing:** `categories.api.ts`  
**Framework:** Vitest + MSW (Mock Service Worker)  
**Minimum Cases:** 6

```typescript
describe('categoriesApi', () => {
  describe('getCategories', () => {
    test('TC-API-CAT-001: should fetch categories successfully', async () => {
      // Arrange: Mock successful response
      // Act: Call getCategories()
      // Assert: Returns CategoryDto[] matching snapshot
    });

    test('TC-API-CAT-002: should handle 401 unauthorized error', async () => {
      // Arrange: Mock 401 response
      // Act: Call getCategories()
      // Assert: Throws error with correct status
    });

    test('TC-API-CAT-003: should handle network error', async () => {
      // Arrange: Mock network failure
      // Act: Call getCategories()
      // Assert: Throws network error
    });
  });

  describe('getCategoryConversations', () => {
    test('TC-API-CAT-004: should fetch conversations with valid categoryId', async () => {
      // Arrange: Mock successful response with conversations
      // Act: Call getCategoryConversations(categoryId)
      // Assert: Returns ConversationDto[] with correct structure
    });

    test('TC-API-CAT-005: should handle 404 when category not found', async () => {
      // Arrange: Mock 404 response
      // Act: Call getCategoryConversations(invalidId)
      // Assert: Throws 404 error
    });

    test('TC-API-CAT-006: should pass categoryId correctly in URL', async () => {
      // Arrange: Mock response, spy on apiClient.get
      // Act: Call getCategoryConversations('test-uuid')
      // Assert: Verify URL contains correct categoryId
    });
  });
});
```

**Mock Data Required:**
- `mockCategories`: Array of 3 CategoryDto
- `mockConversations`: Array of 3 ConversationDto
- `mockError401`: Unauthorized error response
- `mockError404`: Not found error response

---

#### File: `src/api/groups.api.test.ts`
**Testing:** `groups.api.ts`  
**Framework:** Vitest + MSW  
**Minimum Cases:** 8

```typescript
describe('groupsApi', () => {
  describe('getGroupMembers', () => {
    test('TC-API-GRP-001: should fetch group members successfully', async () => {
      // Assert: Returns MemberDto[] with correct roles
    });

    test('TC-API-GRP-002: should handle 403 forbidden error', async () => {
      // Assert: Throws 403 error when user lacks permission
    });
  });

  describe('addGroupMember', () => {
    test('TC-API-GRP-003: should add member successfully with 200 response', async () => {
      // Assert: Returns new MemberDto
    });

    test('TC-API-GRP-004: should handle 400 when user already exists', async () => {
      // Assert: Throws 400 validation error
    });
  });

  describe('removeGroupMember', () => {
    test('TC-API-GRP-005: should remove member successfully with 204 response', async () => {
      // Assert: Returns void, no error
    });

    test('TC-API-GRP-006: should handle 400 when trying to remove owner', async () => {
      // Assert: Throws 400 error
    });
  });

  describe('promoteGroupMember', () => {
    test('TC-API-GRP-007: should promote member to admin successfully', async () => {
      // Assert: Returns PromoteMemberResponse with newRole='ADM'
    });

    test('TC-API-GRP-008: should handle 403 when non-owner tries to promote', async () => {
      // Assert: Throws 403 forbidden
    });
  });
});
```

**Mock Data Required:**
- `mockMembers`: Array of 7 MemberDto (1 OWN, 2 ADM, 4 MBR)
- `mockAddMemberRequest`: AddMemberRequest
- `mockAddMemberResponse`: MemberDto
- `mockPromoteResponse`: PromoteMemberResponse

---

#### File: `src/api/checklist-templates.api.test.ts`
**Testing:** `checklist-templates.api.ts`  
**Framework:** Vitest + MSW  
**Minimum Cases:** 8

```typescript
describe('checklistTemplatesApi', () => {
  describe('getTemplates', () => {
    test('TC-API-TPL-001: should fetch templates filtered by conversationId', async () => {
      // Assert: Returns CheckListTemplateResponse[] for that conversation
    });

    test('TC-API-TPL-002: should pass conversationId as query param', async () => {
      // Assert: Verify params.conversationId in request
    });
  });

  describe('createTemplate', () => {
    test('TC-API-TPL-003: should create template successfully', async () => {
      // Assert: Returns new template with generated ID
    });

    test('TC-API-TPL-004: should handle 400 validation error', async () => {
      // Assert: Throws 400 when name is missing
    });
  });

  describe('updateTemplate', () => {
    test('TC-API-TPL-005: should update template successfully', async () => {
      // Assert: Returns updated template
    });

    test('TC-API-TPL-006: should handle 404 when template not found', async () => {
      // Assert: Throws 404 error
    });
  });

  describe('deleteTemplate', () => {
    test('TC-API-TPL-007: should delete template successfully', async () => {
      // Assert: Returns void, no error
    });

    test('TC-API-TPL-008: should handle 404 when template not found', async () => {
      // Assert: Throws 404 error
    });
  });
});
```

**Mock Data Required:**
- `mockTemplates`: Array of 3 CheckListTemplateResponse
- `mockCreateRequest`: CreateCheckListTemplateRequest
- `mockUpdateRequest`: UpdateCheckListTemplateRequest

---

### 2. Query Hook Tests

#### File: `src/hooks/queries/useCategories.test.ts`
**Testing:** `useCategories.ts`  
**Framework:** Vitest + @testing-library/react-hooks + React Query  
**Minimum Cases:** 8

```typescript
describe('useCategories', () => {
  test('TC-HOOK-CAT-001: should return loading state initially', async () => {
    // Arrange: Setup QueryClient wrapper
    // Act: Call useCategories()
    // Assert: isLoading=true, data=undefined
  });

  test('TC-HOOK-CAT-002: should fetch and return categories successfully', async () => {
    // Arrange: Mock successful API response
    // Act: Wait for query to resolve
    // Assert: data contains CategoryDto[], isSuccess=true
  });

  test('TC-HOOK-CAT-003: should handle error state', async () => {
    // Arrange: Mock API error
    // Act: Wait for query to reject
    // Assert: isError=true, error contains message
  });

  test('TC-HOOK-CAT-004: should use correct query key', () => {
    // Assert: Query key matches categoriesKeys.list()
  });

  test('TC-HOOK-CAT-005: should respect staleTime configuration', async () => {
    // Arrange: Fetch data twice within staleTime
    // Assert: API called only once (cached)
  });

  test('TC-HOOK-CAT-006: should refetch after staleTime expires', async () => {
    // Arrange: Fetch, wait past staleTime, fetch again
    // Assert: API called twice
  });
});

describe('useCategoryConversations', () => {
  test('TC-HOOK-CAT-007: should be disabled when categoryId is empty', () => {
    // Arrange: Pass empty string as categoryId
    // Assert: Query not executed (enabled=false)
  });

  test('TC-HOOK-CAT-008: should fetch conversations when categoryId provided', async () => {
    // Arrange: Pass valid categoryId
    // Assert: Returns ConversationDto[] for that category
  });
});
```

**Mock Setup:**
- Mock `categoriesApi.getCategories` with `vi.fn()`
- Mock `categoriesApi.getCategoryConversations` with `vi.fn()`
- Provide `QueryClientProvider` wrapper
- Use `waitFor` for async assertions

---

#### File: `src/hooks/queries/useGroupMembers.test.ts`
**Testing:** `useGroupMembers.ts`  
**Framework:** Vitest + @testing-library/react-hooks  
**Minimum Cases:** 6

```typescript
describe('useGroupMembers', () => {
  test('TC-HOOK-MBR-001: should return loading state initially', async () => {
    // Assert: isLoading=true
  });

  test('TC-HOOK-MBR-002: should fetch members successfully', async () => {
    // Assert: data contains MemberDto[] with roles
  });

  test('TC-HOOK-MBR-003: should handle 403 forbidden error', async () => {
    // Assert: isError=true, error.status=403
  });

  test('TC-HOOK-MBR-004: should be disabled when groupId is empty', () => {
    // Assert: Query not executed
  });

  test('TC-HOOK-MBR-005: should use correct query key with groupId', () => {
    // Assert: Key includes groupId
  });

  test('TC-HOOK-MBR-006: should respect staleTime of 2 minutes', async () => {
    // Assert: Cached data used within 2 minutes
  });
});
```

---

#### File: `src/hooks/queries/useChecklistTemplates.test.ts`
**Testing:** `useChecklistTemplates.ts`  
**Framework:** Vitest + @testing-library/react-hooks  
**Minimum Cases:** 6

```typescript
describe('useChecklistTemplates', () => {
  test('TC-HOOK-TPL-001: should fetch templates filtered by conversationId', async () => {
    // Assert: API called with correct conversationId
  });

  test('TC-HOOK-TPL-002: should be disabled when conversationId is empty', () => {
    // Assert: Query not executed
  });

  test('TC-HOOK-TPL-003: should return templates with items', async () => {
    // Assert: Each template has items array
  });

  test('TC-HOOK-TPL-004: should handle empty templates array', async () => {
    // Assert: data=[] when no templates exist
  });

  test('TC-HOOK-TPL-005: should handle API error', async () => {
    // Assert: isError=true
  });

  test('TC-HOOK-TPL-006: should use correct query key', () => {
    // Assert: Key includes conversationId
  });
});
```

---

### 3. Mutation Hook Tests

#### File: `src/hooks/mutations/useAddGroupMember.test.ts`
**Testing:** `useAddGroupMember.ts`  
**Framework:** Vitest + @testing-library/react-hooks  
**Minimum Cases:** 7

```typescript
describe('useAddGroupMember', () => {
  test('TC-MUT-ADD-001: should add member successfully', async () => {
    // Arrange: Mock successful API response
    // Act: Call mutate({ userId })
    // Assert: onSuccess called, returns MemberDto
  });

  test('TC-MUT-ADD-002: should perform optimistic update', async () => {
    // Arrange: Setup query cache with existing members
    // Act: Call mutate (before API resolves)
    // Assert: Member immediately appears in cache with placeholder data
  });

  test('TC-MUT-ADD-003: should rollback optimistic update on error', async () => {
    // Arrange: Mock API error
    // Act: Call mutate
    // Assert: Cache restored to previous state
  });

  test('TC-MUT-ADD-004: should invalidate members query on success', async () => {
    // Arrange: Setup query cache
    // Act: Call mutate, wait for success
    // Assert: Query invalidated and refetched
  });

  test('TC-MUT-ADD-005: should handle 400 duplicate member error', async () => {
    // Assert: onError called with 400 status
  });

  test('TC-MUT-ADD-006: should handle 403 forbidden error', async () => {
    // Assert: onError called, member not added
  });

  test('TC-MUT-ADD-007: should cancel ongoing queries during optimistic update', async () => {
    // Assert: cancelQueries called before setQueryData
  });
});
```

**Testing Strategy:**
- Mock `groupsApi.addGroupMember` with `vi.fn()`
- Mock `useQueryClient` to spy on cache operations
- Test optimistic update flow: onMutate → API → onSuccess/onError

---

#### File: `src/hooks/mutations/useRemoveGroupMember.test.ts`
**Testing:** `useRemoveGroupMember.ts`  
**Framework:** Vitest + @testing-library/react-hooks  
**Minimum Cases:** 7

```typescript
describe('useRemoveGroupMember', () => {
  test('TC-MUT-REM-001: should remove member successfully', async () => {
    // Assert: onSuccess called, API returns void
  });

  test('TC-MUT-REM-002: should optimistically remove member from cache', async () => {
    // Arrange: Cache has 5 members
    // Act: Remove userId='abc'
    // Assert: Cache immediately shows 4 members (without 'abc')
  });

  test('TC-MUT-REM-003: should rollback on error', async () => {
    // Assert: Member reappears in cache after error
  });

  test('TC-MUT-REM-004: should invalidate query on success', async () => {
    // Assert: Query refetched after successful removal
  });

  test('TC-MUT-REM-005: should handle 400 when removing owner', async () => {
    // Assert: Error thrown, optimistic update rolled back
  });

  test('TC-MUT-REM-006: should handle 404 member not found', async () => {
    // Assert: Error handled gracefully
  });

  test('TC-MUT-REM-007: should cancel ongoing queries before optimistic update', async () => {
    // Assert: cancelQueries called
  });
});
```

---

#### File: `src/hooks/mutations/usePromoteGroupMember.test.ts`
**Testing:** `usePromoteGroupMember.ts`  
**Framework:** Vitest + @testing-library/react-hooks  
**Minimum Cases:** 7

```typescript
describe('usePromoteGroupMember', () => {
  test('TC-MUT-PRO-001: should promote member to admin successfully', async () => {
    // Assert: onSuccess called, returns PromoteMemberResponse
  });

  test('TC-MUT-PRO-002: should optimistically update member role to ADM', async () => {
    // Arrange: Cache has member with role='MBR'
    // Act: Promote userId='abc'
    // Assert: Cache immediately shows role='ADM'
  });

  test('TC-MUT-PRO-003: should rollback role change on error', async () => {
    // Assert: Role reverted to 'MBR' after error
  });

  test('TC-MUT-PRO-004: should invalidate query on success', async () => {
    // Assert: Query refetched
  });

  test('TC-MUT-PRO-005: should handle 403 when non-owner tries to promote', async () => {
    // Assert: Error thrown, no role change
  });

  test('TC-MUT-PRO-006: should handle 400 when member is already admin', async () => {
    // Assert: Error handled, cache restored
  });

  test('TC-MUT-PRO-007: should update correct member in multi-member cache', async () => {
    // Arrange: Cache has 10 members
    // Act: Promote one specific member
    // Assert: Only that member's role changed, others unchanged
  });
});
```

---

### 4. Component Tests

#### File: `src/features/portal/components/worktype-manager/GroupUserManagement.test.tsx`
**Testing:** `GroupUserManagement.tsx`  
**Framework:** Vitest + @testing-library/react  
**Minimum Cases:** 12

```typescript
describe('GroupUserManagement', () => {
  test('TC-COMP-GUM-001: should render with group name and member count', () => {
    // Arrange: Mock 7 members
    // Assert: Header shows "Nhóm ABC (7 members)"
  });

  test('TC-COMP-GUM-002: should group members by role (Owners, Admins, Members)', () => {
    // Assert: Three sections rendered with correct counts
  });

  test('TC-COMP-GUM-003: should display loading skeleton while fetching', () => {
    // Arrange: Mock isLoading=true
    // Assert: Skeleton UI visible
  });

  test('TC-COMP-GUM-004: should display error state on fetch failure', () => {
    // Arrange: Mock error
    // Assert: Error message and retry button visible
  });

  test('TC-COMP-GUM-005: should display empty state when no members', () => {
    // Arrange: Mock empty array
    // Assert: Empty state message visible
  });

  test('TC-COMP-GUM-006: should filter members by search query', async () => {
    // Arrange: Render with 7 members
    // Act: Type "Nguyễn" in search input
    // Assert: Only matching members visible
  });

  test('TC-COMP-GUM-007: should open AddMemberDialog when clicking add button', async () => {
    // Act: Click "Add Member" button
    // Assert: AddMemberDialog rendered with open=true
  });

  test('TC-COMP-GUM-008: should call remove mutation when clicking remove', async () => {
    // Arrange: Mock removeMember.mutate
    // Act: Click remove button for a member
    // Assert: Confirmation dialog shown, mutate called with userId
  });

  test('TC-COMP-GUM-009: should call promote mutation when clicking promote', async () => {
    // Arrange: Mock promoteMember.mutate
    // Act: Click promote button for a member
    // Assert: mutate called with userId
  });

  test('TC-COMP-GUM-010: should disable remove button for owner', () => {
    // Assert: Owner member card has no remove button
  });

  test('TC-COMP-GUM-011: should disable promote button for admins', () => {
    // Assert: Admin member cards have no promote button
  });

  test('TC-COMP-GUM-012: should show optimistic update feedback', async () => {
    // Act: Remove member
    // Assert: Member immediately disappears (optimistic UI)
    // Wait: Member reappears if error occurs
  });
});
```

**Test Data Required:**
- `mockGroupMembers`: 7 members (1 OWN, 2 ADM, 4 MBR)
- `mockGroupInfo`: { id, name, currentUserRole }
- Mock hooks: `useGroupMembers`, `useRemoveGroupMember`, `usePromoteGroupMember`

---

#### File: `src/features/portal/components/worktype-manager/AddMemberDialog.test.tsx`
**Testing:** `AddMemberDialog.tsx`  
**Framework:** Vitest + @testing-library/react  
**Minimum Cases:** 8

```typescript
describe('AddMemberDialog', () => {
  test('TC-COMP-AMD-001: should render when open=true', () => {
    // Assert: Dialog visible with title
  });

  test('TC-COMP-AMD-002: should not render when open=false', () => {
    // Assert: Dialog not in DOM
  });

  test('TC-COMP-AMD-003: should display searchable user list', () => {
    // Arrange: Mock 10 available users
    // Assert: All users displayed with checkboxes
  });

  test('TC-COMP-AMD-004: should filter users by search query', async () => {
    // Act: Type in search input
    // Assert: Filtered list updates
  });

  test('TC-COMP-AMD-005: should allow selecting multiple users', async () => {
    // Act: Check 3 user checkboxes
    // Assert: selectedUsers state = [id1, id2, id3]
  });

  test('TC-COMP-AMD-006: should show selected count badge', async () => {
    // Act: Select 2 users
    // Assert: Badge shows "2 selected"
  });

  test('TC-COMP-AMD-007: should call add mutation for all selected users', async () => {
    // Arrange: Select 3 users
    // Act: Click "Add" button
    // Assert: mutateAsync called 3 times
  });

  test('TC-COMP-AMD-008: should close dialog after successful add', async () => {
    // Act: Add users
    // Assert: onClose called after all mutations complete
  });
});
```

**Test Data Required:**
- `mockAvailableUsers`: 10 users not in group
- Mock `useAddGroupMember` hook

---

#### File: `src/features/portal/components/worktype-manager/GroupSelector.test.tsx` (MODIFIED)
**Testing:** `GroupSelector.tsx`  
**Framework:** Vitest + @testing-library/react  
**Minimum Cases:** 8

```typescript
describe('GroupSelector (with API integration)', () => {
  test('TC-COMP-GS-001: should fetch and display categories', async () => {
    // Arrange: Mock useCategories returns 3 categories
    // Assert: 3 category cards rendered
  });

  test('TC-COMP-GS-002: should display loading state', () => {
    // Arrange: Mock isLoading=true
    // Assert: Skeleton cards visible
  });

  test('TC-COMP-GS-003: should display error state with retry', () => {
    // Arrange: Mock error
    // Assert: Error message and retry button
  });

  test('TC-COMP-GS-004: should display empty state when no categories', () => {
    // Arrange: Mock empty array
    // Assert: Empty state message
  });

  test('TC-COMP-GS-005: should display conversation count per category', () => {
    // Assert: Each card shows conversationCount
  });

  test('TC-COMP-GS-006: should call onSelectCategory when clicking card', async () => {
    // Act: Click category card
    // Assert: onSelectCategory(categoryId) called
  });

  test('TC-COMP-GS-007: should handle API error gracefully', async () => {
    // Arrange: Mock 401 error
    // Assert: Error UI shown, no crash
  });

  test('TC-COMP-GS-008: should refetch on retry button click', async () => {
    // Arrange: Initial error state
    // Act: Click retry
    // Assert: useCategories refetch called
  });
});
```

**Mock Strategy:**
- Mock `useCategories` hook with various states
- Use `mockCategories` data from snapshots

---

#### File: `src/features/portal/components/worktype-manager/WorkTypeEditor.test.tsx` (MODIFIED)
**Testing:** `WorkTypeEditor.tsx`  
**Framework:** Vitest + @testing-library/react  
**Minimum Cases:** 10

```typescript
describe('WorkTypeEditor (with API integration)', () => {
  test('TC-COMP-WTE-001: should fetch and display conversations', async () => {
    // Arrange: Mock useCategoryConversations returns 3 groups
    // Assert: 3 group cards rendered
  });

  test('TC-COMP-WTE-002: should display loading state', () => {
    // Assert: Skeleton UI visible
  });

  test('TC-COMP-WTE-003: should display group member count', () => {
    // Assert: Each card shows memberCount from API
  });

  test('TC-COMP-WTE-004: should display unread badge when unreadCount > 0', () => {
    // Assert: Badge visible for groups with unread messages
  });

  test('TC-COMP-WTE-005: should show "Quản lý thành viên" button for Admin role', () => {
    // Arrange: currentUserRole='ADM'
    // Assert: Button visible
  });

  test('TC-COMP-WTE-006: should hide "Quản lý thành viên" button for Member role', () => {
    // Arrange: currentUserRole='MBR'
    // Assert: Button not visible
  });

  test('TC-COMP-WTE-007: should open GroupUserManagement when clicking button', async () => {
    // Act: Click "Quản lý thành viên"
    // Assert: GroupUserManagement modal opens
  });

  test('TC-COMP-WTE-008: should pass correct groupId to GroupUserManagement', async () => {
    // Act: Click button for specific group
    // Assert: Modal receives correct groupId prop
  });

  test('TC-COMP-WTE-009: should display last message info', () => {
    // Assert: Shows lastMessage.content and sentAt
  });

  test('TC-COMP-WTE-010: should handle empty conversations array', () => {
    // Assert: Empty state message
  });
});
```

**Mock Strategy:**
- Mock `useCategoryConversations` hook
- Mock `currentUserRole` from auth context
- Use `mockConversations` from snapshots

---

#### File: `src/features/portal/components/worktype-manager/ManageVariantsDialog.test.tsx` (MODIFIED)
**Testing:** `ManageVariantsDialog.tsx`  
**Framework:** Vitest + @testing-library/react  
**Minimum Cases:** 7

```typescript
describe('ManageVariantsDialog (with API integration)', () => {
  test('TC-COMP-MVD-001: should fetch and display templates', async () => {
    // Arrange: Mock useChecklistTemplates returns 3 templates
    // Assert: 3 template cards rendered
  });

  test('TC-COMP-MVD-002: should display loading state', () => {
    // Assert: Skeleton UI visible
  });

  test('TC-COMP-MVD-003: should filter templates by conversationId', () => {
    // Assert: Only templates for specific conversation shown
  });

  test('TC-COMP-MVD-004: should display template item count', () => {
    // Assert: Each card shows items.length
  });

  test('TC-COMP-MVD-005: should display template description', () => {
    // Assert: Description visible when present
  });

  test('TC-COMP-MVD-006: should handle empty templates array', () => {
    // Assert: Empty state message
  });

  test('TC-COMP-MVD-007: should handle API error', () => {
    // Assert: Error message and retry button
  });
});
```

**Mock Strategy:**
- Mock `useChecklistTemplates` hook
- Use `mockTemplates` from snapshots

---

## 🎯 Test Data & Mocks

### Mock Data Files Location:
```
src/test/mocks/
├── categories.mock.ts       # Mock CategoryDto[], ConversationDto[]
├── groups.mock.ts           # Mock MemberDto[], responses
├── templates.mock.ts        # Mock CheckListTemplateResponse[]
└── api-handlers.ts          # MSW handlers for all endpoints
```

### Mock Data Structure:

**categories.mock.ts:**
```typescript
export const mockCategories: CategoryDto[] = [
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    userId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    name: 'Dự án A',
    order: 1,
    conversationCount: 12,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
  },
  // ... 2 more
];

export const mockConversations: ConversationDto[] = [
  // ... based on snapshots
];
```

**groups.mock.ts:**
```typescript
export const mockMembers: MemberDto[] = [
  {
    userId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    userName: 'Nguyễn Văn A',
    role: 'OWN',
    joinedAt: '2026-01-01T08:00:00Z',
    isMuted: false,
    userInfo: { /* ... */ },
  },
  // ... 6 more (2 ADM, 4 MBR)
];

export const mockAddMemberRequest: AddMemberRequest = {
  userId: 'new-user-id',
};

export const mockAddMemberResponse: MemberDto = {
  // ... new member data
};
```

**templates.mock.ts:**
```typescript
export const mockTemplates: CheckListTemplateResponse[] = [
  {
    id: 'tpl-1234-5678-90ab-cdef',
    name: 'Nhận hàng - Tiêu chuẩn',
    description: 'Checklist cho quy trình nhận hàng tiêu chuẩn',
    conversationId: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
    items: [
      {
        id: 'item-001',
        content: 'Kiểm tra số lượng',
        order: 1,
      },
      // ... more items
    ],
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-10T09:30:00Z',
  },
  // ... 2 more
];
```

**api-handlers.ts (MSW):**
```typescript
import { http, HttpResponse } from 'msw';
import { mockCategories, mockConversations } from './categories.mock';
import { mockMembers } from './groups.mock';
import { mockTemplates } from './templates.mock';

export const handlers = [
  // GET /api/categories
  http.get('/api/categories', () => {
    return HttpResponse.json(mockCategories);
  }),

  // GET /api/categories/:id/conversations
  http.get('/api/categories/:id/conversations', ({ params }) => {
    const { id } = params;
    // Filter by category ID
    return HttpResponse.json(mockConversations);
  }),

  // GET /api/groups/:id/members
  http.get('/api/groups/:id/members', () => {
    return HttpResponse.json(mockMembers);
  }),

  // POST /api/groups/:id/members
  http.post('/api/groups/:id/members', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(mockAddMemberResponse);
  }),

  // DELETE /api/groups/:id/members/:userId
  http.delete('/api/groups/:id/members/:userId', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /api/groups/:id/members/:userId/promote
  http.post('/api/groups/:id/members/:userId/promote', () => {
    return HttpResponse.json({
      message: 'Member promoted successfully',
      userId: 'user-id',
      newRole: 'ADM',
    });
  }),

  // GET /api/checklist-templates
  http.get('/api/checklist-templates', ({ request }) => {
    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId');
    // Filter by conversationId
    return HttpResponse.json(mockTemplates);
  }),

  // Error handlers (401, 403, 404)
  // ... error scenarios
];
```

---

## 🧩 Testing Utilities

### Setup File: `src/test/setup.ts`
```typescript
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/api-handlers';
import '@testing-library/jest-dom';

// Start MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Stop server after all tests
afterAll(() => server.close());
```

### Test Wrapper: `src/test/utils/test-wrapper.tsx`
```typescript
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retry in tests
        cacheTime: 0, // Disable caching
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Custom Render Function: `src/test/utils/test-render.tsx`
```typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { TestWrapper } from './test-wrapper';

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestWrapper, ...options });
}

export * from '@testing-library/react';
```

---

## 🎬 Test Execution Plan

### Phase 1: Unit Tests (API Clients)
**Order:** Execute first (no dependencies)
```bash
# Run API client tests only
npm test -- --grep "TC-API-"

# Expected: 22 tests pass (6 + 8 + 8)
# Duration: ~2-3 seconds
```

### Phase 2: Hook Tests (Queries + Mutations)
**Order:** After API clients pass
```bash
# Run hook tests only
npm test -- --grep "TC-HOOK-|TC-MUT-"

# Expected: 41 tests pass (8 + 6 + 6 + 7 + 7 + 7)
# Duration: ~5-8 seconds
```

### Phase 3: Component Tests
**Order:** After hooks pass
```bash
# Run component tests only
npm test -- --grep "TC-COMP-"

# Expected: 45 tests pass (12 + 8 + 8 + 10 + 7)
# Duration: ~10-15 seconds
```

### Full Test Suite:
```bash
# Run all tests
npm test

# Expected: 108+ tests pass
# Duration: ~20-30 seconds
```

---

## 📈 Test Coverage Goals

### By File Type:
| Type | Coverage Target | Notes |
|------|----------------|-------|
| API Clients | 95%+ | Critical path, all branches |
| Query Hooks | 90%+ | Cover enabled/disabled states |
| Mutation Hooks | 95%+ | Optimistic updates + rollbacks |
| Components | 85%+ | All user interactions |
| Overall | 90%+ | Combined coverage |

### Coverage Report:
```bash
# Generate coverage report
npm test -- --coverage

# View HTML report
open coverage/index.html
```

---

## ⏳ PENDING DECISIONS

| # | Decision | Options | HUMAN Decision |
|---|----------|---------|----------------|
| 1 | E2E test tool | Playwright (existing) / Cypress / None for now | Playwright  |
| 2 | Mock vs Real API in E2E | Mock with MSW / Real staging API | Real staging API |
| 3 | Visual regression tests | Add Percy/Chromatic / Skip for now | skip for now |
| 4 | Performance tests | Add performance metrics / Skip | Skip |
| 5 | Accessibility tests | Add @axe-core/react / Manual only | Manual |

---

## 📋 IMPACT SUMMARY

### Test Files to Create: 14
1. `src/api/categories.api.test.ts` (6 cases)
2. `src/api/groups.api.test.ts` (8 cases)
3. `src/api/checklist-templates.api.test.ts` (8 cases)
4. `src/hooks/queries/useCategories.test.ts` (8 cases)
5. `src/hooks/queries/useGroupMembers.test.ts` (6 cases)
6. `src/hooks/queries/useChecklistTemplates.test.ts` (6 cases)
7. `src/hooks/mutations/useAddGroupMember.test.ts` (7 cases)
8. `src/hooks/mutations/useRemoveGroupMember.test.ts` (7 cases)
9. `src/hooks/mutations/usePromoteGroupMember.test.ts` (7 cases)
10. `GroupUserManagement.test.tsx` (12 cases)
11. `AddMemberDialog.test.tsx` (8 cases)
12. `GroupSelector.test.tsx` (8 cases)
13. `WorkTypeEditor.test.tsx` (10 cases)
14. `ManageVariantsDialog.test.tsx` (7 cases)

### Test Infrastructure Files: 4
1. `src/test/setup.ts` - MSW server setup
2. `src/test/mocks/categories.mock.ts` - Mock data
3. `src/test/mocks/groups.mock.ts` - Mock data
4. `src/test/mocks/templates.mock.ts` - Mock data
5. `src/test/mocks/api-handlers.ts` - MSW handlers
6. `src/test/utils/test-wrapper.tsx` - Query client wrapper
7. `src/test/utils/test-render.tsx` - Custom render function

### Dependencies (check package.json):
- ✅ `vitest` - Already installed
- ✅ `@testing-library/react` - Already installed
- ✅ `@testing-library/user-event` - Already installed
- ⚠️ `msw` - May need to install (Mock Service Worker)
- ⚠️ `@testing-library/jest-dom` - May need to install

---

## ✅ HUMAN CONFIRMATION

| Item | Status |
|------|--------|
| Đã review test coverage matrix | ⬜  REVIEW |
| Đã điền Pending Decisions | ⬜  ĐIỀN |
| Đồng ý với test case count (108 minimum) | ⬜  ĐỒNG Ý |
| Đồng ý với mock data strategy | ⬜  ĐỒNG Ý |
| Đồng ý với coverage targets (90%+) | ⬜  ĐỒNG Ý |
| **APPROVED để thực thi** | ⬜  APPROVED |

**HUMAN Signature:**  Khoa
**Date:** 16012026

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC bắt đầu code (BƯỚC 5) nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

**End of Test Requirements**

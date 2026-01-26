# [BƯỚC 1] Conversation Category Management System - Requirements

**Feature:** Conversation Category Management System  
**Module:** Chat - Management API Integration  
**Status:** ⏳ PENDING HUMAN APPROVAL  
**Version:** 1.0  
**Created:** 2026-01-16

---

## 📋 Overview

This document defines the functional, UI, and technical requirements for the Conversation Category Management System feature. This feature integrates existing UI components with real Chat Swagger and Task Swagger APIs.

---

## 🎯 Functional Requirements

### FR-1: Conversation Category UI

**Feature ID:** `CCM-001`  
**Priority:** HIGH  
**Status:** Existing UI - Needs API Integration

**Description:**  
Display a list of conversation categories that the user can manage. This is the entry point accessed via "Quản lý Loại Việc" from the sidebar.

**Acceptance Criteria:**
- [ ] UI displays list of categories from `GET /api/categories`
- [ ] Each category shows:
  - Category name
  - Number of conversations in category (`conversationCount`)
- [ ] Search/filter functionality for categories
- [ ] Click on a category navigates to group list for that category
- [ ] Loading state shown while fetching categories
- [ ] Error state displayed if API call fails
- [ ] Empty state when user has no categories

**API Endpoint:**
```
GET /api/categories
Response: CategoryDto[]
```

**Existing Component:**
- `src/features/portal/components/worktype-manager/GroupSelector.tsx`

**Changes Required:**
- Replace mock data with API call to `/api/categories`
- Update data structure to match `CategoryDto` from Chat Swagger
- Add error handling and loading states

---

### FR-2: Group List per Category

**Feature ID:** `CCM-002`  
**Priority:** HIGH  
**Status:** Existing UI - Needs API Integration

**Description:**  
When a user clicks on a category, display all group conversations that are linked to that category.

**Acceptance Criteria:**
- [ ] UI displays list of groups from `GET /api/categories/{id}/conversations`
- [ ] Each group shows:
  - Group name
  - Number of members (`memberCount`)
  - Unread count (if available)
  - Last message preview (optional)
- [ ] Search/filter functionality for groups
- [ ] Click on a group navigates to Group User Management UI (if Admin/Leader) OR Work Type Editor
- [ ] Loading state shown while fetching groups
- [ ] Error state displayed if API call fails
- [ ] Empty state when category has no groups
- [ ] Back button to return to category list

**API Endpoint:**
```
GET /api/categories/{id}/conversations
Response: ConversationDto[]
```

**Existing Component:**
- `src/features/portal/components/worktype-manager/GroupSelector.tsx` (displays groups)
- `src/features/portal/components/worktype-manager/WorkTypeEditor.tsx` (group detail view)

**Changes Required:**
- Add API call to fetch conversations by category ID
- Update UI to show group details from API
- Add conditional navigation based on user role

---

### FR-3: Group User Management UI (NEW)

**Feature ID:** `CCM-003`  
**Priority:** HIGH  
**Status:** NEW COMPONENT REQUIRED

**Description:**  
Admin or Leader users can manage members of a group conversation, including viewing, adding, removing, and promoting members.

**Acceptance Criteria:**

#### FR-3.1: View Members
- [ ] UI displays list of members from `GET /api/groups/{id}/members`
- [ ] Each member shows:
  - User name
  - Role badge (Owner/Admin/Member)
  - Join date
  - Avatar (if available)
- [ ] Members are sorted: Owners first, then Admins, then Members
- [ ] Search/filter functionality for members
- [ ] Loading state while fetching members
- [ ] Error state if API call fails

#### FR-3.2: Add Member
- [ ] "Add Member" button visible only to Admin/Leader (hardcoded in UI)
- [ ] Click opens user selection dialog
- [ ] Can search for users to add
- [ ] Calls `POST /api/groups/{id}/members` with `userId`
- [ ] Success: Member appears in list immediately
- [ ] Error: Shows error message
- [ ] Optimistic UI update with rollback on error

#### FR-3.3: Remove Member
- [ ] "Remove" button visible only to Admin/Leader (hardcoded in UI)
- [ ] Cannot remove self
- [ ] Cannot remove group owner
- [ ] Confirmation dialog before removal
- [ ] Calls `DELETE /api/groups/{id}/members/{userId}`
- [ ] Success: Member removed from list immediately
- [ ] Error: Shows error message and reverts

#### FR-3.4: Promote Member
- [ ] "Promote to Leader" button visible only to Admin/Owner (hardcoded in UI)
- [ ] Only shown for regular Members
- [ ] Confirmation dialog before promotion
- [ ] Calls `POST /api/groups/{id}/members/{userId}/promote`
- [ ] Success: Member role updated to Admin in UI
- [ ] Error: Shows error message and reverts

#### FR-3.5: Access Control (UI-Level Hardcoded)
- [ ] Group User Management button only visible if:
  - User role is hardcoded as `Admin` or `Leader` in UI state
  - This is temporary until proper permission system exists
- [ ] If not Admin/Leader, clicking group goes directly to Work Type Editor

**API Endpoints:**
```
GET /api/groups/{id}/members or GET /api/conversations/{id}/members
POST /api/groups/{id}/members (body: { userId: string })
DELETE /api/groups/{id}/members/{userId}
POST /api/groups/{id}/members/{userId}/promote
```

**New Component:**
- `src/features/portal/components/worktype-manager/GroupUserManagement.tsx` (NEW)
- `src/features/portal/components/worktype-manager/AddMemberDialog.tsx` (NEW)

**Integration Point:**
- Called from GroupSelector when clicking on a group (if Admin/Leader)
- Has a button to navigate to "Quản lý dạng checklist" (FR-4)

---

### FR-4: Checklist Template Management

**Feature ID:** `CCM-004`  
**Priority:** HIGH  
**Status:** Existing UI - Needs API Integration

**Description:**  
From the Group User Management UI, Admin/Leader can click "Quản lý dạng checklist" to manage checklist templates filtered by the conversation ID.

**Acceptance Criteria:**
- [ ] "Quản lý dạng checklist" button visible in Group User Management UI
- [ ] Click opens checklist template management dialog
- [ ] UI displays templates from `GET /api/checklist-templates?conversationId={id}`
- [ ] Each template shows:
  - Template name
  - Number of checklist items
  - Created date
- [ ] Can add new template (calls `POST /api/checklist-templates`)
- [ ] Can edit template (calls `PUT /api/checklist-templates/{id}`)
- [ ] Can delete template (calls `DELETE /api/checklist-templates/{id}`)
- [ ] Loading state while fetching templates
- [ ] Error state if API call fails
- [ ] Empty state when no templates exist

**API Endpoints:**
```
GET /api/checklist-templates?conversationId={conversationId}
POST /api/checklist-templates (body: CreateCheckListTemplateRequest)
PUT /api/checklist-templates/{id}
DELETE /api/checklist-templates/{id}
```

**Existing Component:**
- `src/features/portal/components/worktype-manager/ManageVariantsDialog.tsx`

**Changes Required:**
- Replace mock `ChecklistVariant` with API calls to Task Swagger
- Add conversationId filter parameter
- Update data structure to match `CheckListTemplateResponse`

---

## 🎨 UI Requirements

### UI-1: Conversation Category List (GroupSelector)

**Current State:**
- Shows mock categories titled "Quản lý Loại Việc"
- Search bar for filtering
- List of categories with member count

**Required Changes:**
- Update header to show category count from API
- Display `conversationCount` instead of member count
- Add loading skeleton
- Add error state component
- Add empty state ("Chưa có loại việc nào")

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ← Quản lý Loại Việc            [X]         │
├─────────────────────────────────────────────┤
│ Chọn loại việc để xem nhóm chat            │
├─────────────────────────────────────────────┤
│ [🔍 Tìm loại việc...                    ]  │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐│
│ │ Loại việc A                             ││
│ │ 12 nhóm chat                            ││
│ └─────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────┐│
│ │ Loại việc B                             ││
│ │ 8 nhóm chat                             ││
│ └─────────────────────────────────────────┘│
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

### UI-2: Group List View

**Current State:**
- Shows groups with work type count

**Required Changes:**
- Show groups filtered by category
- Display member count from API
- Show unread count badge (if > 0)
- Show last message preview
- Add "Quản lý thành viên" button if Admin/Leader
- Add back button to category list

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ← Loại việc: {Category Name}    [X]        │
├─────────────────────────────────────────────┤
│ Các nhóm chat trong loại việc này          │
├─────────────────────────────────────────────┤
│ [🔍 Tìm nhóm...                         ]  │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐│
│ │ Nhóm ABC                           [5]  ││ ← unread badge
│ │ 24 thành viên                           ││
│ │ [Quản lý thành viên] [Loại việc]       ││ ← buttons
│ └─────────────────────────────────────────┘│
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

### UI-3: Group User Management (NEW)

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ← Quản lý Thành Viên: {Group Name} [X]     │
├─────────────────────────────────────────────┤
│ [🔍 Tìm thành viên...       ] [+ Thêm]     │
├─────────────────────────────────────────────┤
│ Owners (1)                                  │
│ ┌─────────────────────────────────────────┐│
│ │ 👤 John Doe              [OWNER]        ││
│ │    Tham gia: 2025-01-01                 ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Admins (2)                                  │
│ ┌─────────────────────────────────────────┐│
│ │ 👤 Jane Smith            [ADMIN]  [🗑️] ││
│ │    Tham gia: 2025-01-05                 ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Members (15)                                │
│ ┌─────────────────────────────────────────┐│
│ │ 👤 Bob Wilson            [MEMBER]       ││
│ │    Tham gia: 2025-01-10                 ││
│ │    [Promote to Admin] [Remove]          ││
│ └─────────────────────────────────────────┘│
│                                             │
│ [Quản lý dạng checklist]                    │ ← Button to FR-4
└─────────────────────────────────────────────┘
```

**States:**
- Loading: Show skeleton loaders
- Error: Show error message with retry button
- Empty: "Nhóm chưa có thành viên"

**Interactions:**
- Scroll area for long member lists
- Grouped by role (Owners → Admins → Members)
- Search filters all members
- Action buttons only visible to Admin/Leader
- Cannot remove self or owner

---

### UI-4: Checklist Template Management

**Current State:**
- ManageVariantsDialog shows checklist variants

**Required Changes:**
- Filter templates by conversationId
- Update to use Task Swagger API
- Show template details from API

**Layout:** (Keep existing, just update data source)

---

## 🔧 Technical Requirements

### Tech-1: API Client Layer

**File:** `src/api/categories.api.ts` (NEW)

```typescript
// Category Management APIs
export const getCategories = async (): Promise<CategoryDto[]>
export const getCategoryConversations = async (categoryId: string): Promise<ConversationDto[]>
```

**File:** `src/api/groups.api.ts` (NEW or UPDATE)

```typescript
// Group Member Management APIs
export const getGroupMembers = async (groupId: string): Promise<MemberDto[]>
export const addGroupMember = async (groupId: string, userId: string): Promise<void>
export const removeGroupMember = async (groupId: string, userId: string): Promise<void>
export const promoteGroupMember = async (groupId: string, userId: string): Promise<void>
```

**File:** `src/api/checklist-templates.api.ts` (NEW)

```typescript
// Checklist Template APIs
export const getChecklistTemplates = async (conversationId: string): Promise<CheckListTemplateResponse[]>
export const createChecklistTemplate = async (request: CreateCheckListTemplateRequest): Promise<string>
export const updateChecklistTemplate = async (id: string, request: UpdateCheckListTemplateRequest): Promise<void>
export const deleteChecklistTemplate = async (id: string): Promise<void>
```

---

### Tech-2: React Query Hooks

**File:** `src/hooks/queries/useCategories.ts` (NEW)

```typescript
export function useCategories()
export function useCategoryConversations(categoryId: string)
```

**File:** `src/hooks/queries/useGroupMembers.ts` (NEW)

```typescript
export function useGroupMembers(groupId: string)
```

**File:** `src/hooks/mutations/useGroupMemberMutations.ts` (NEW)

```typescript
export function useAddGroupMember()
export function useRemoveGroupMember()
export function usePromoteGroupMember()
```

**File:** `src/hooks/queries/useChecklistTemplates.ts` (NEW)

```typescript
export function useChecklistTemplates(conversationId: string)
```

---

### Tech-3: TypeScript Types

**File:** `src/types/categories.ts` (NEW)

```typescript
export interface CategoryDto {
  id: string;
  userId: string;
  name: string;
  order: number;
  conversationCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ConversationCategoryDto {
  id: string;
  name: string;
}
```

**File:** `src/types/members.ts` (NEW)

```typescript
export type MemberRole = 'MBR' | 'ADM' | 'OWN';

export interface MemberDto {
  userId: string;
  userName: string;
  role: MemberRole;
  joinedAt: string;
  isMuted: boolean;
  userInfo: UserInfoDto;
}

export interface UserInfoDto {
  email?: string;
  avatarUrl?: string;
  // ... other fields from swagger
}
```

**File:** `src/types/checklist-templates.ts` (NEW)

```typescript
export interface CheckListTemplateResponse {
  id: string;
  name: string;
  conversationId: string | null;
  items: CheckListItemDto[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CheckListItemDto {
  id: string;
  name: string;
  order: number;
  // ... other fields from swagger
}

export interface CreateCheckListTemplateRequest {
  name: string;
  conversationId: string;
  items: CreateCheckListItemRequest[];
}
```

---

### Tech-4: Role Hardcoding (Temporary)

**Location:** UI components where role checks are needed

**Implementation:**
```typescript
// Temporary hardcoded role check
// TODO: Replace with proper permission system
const currentUserRole: 'Admin' | 'Leader' | 'Member' = 'Admin'; // Hardcoded

const canManageMembers = currentUserRole === 'Admin' || currentUserRole === 'Leader';

{canManageMembers && (
  <Button onClick={handleManageMembers}>Quản lý thành viên</Button>
)}
```

**Note:** Add TODO comments to replace with real permission checks later.

---

## 🔐 Security Requirements

### SEC-1: Authentication
- [ ] All API calls MUST include Bearer token from auth store
- [ ] Handle 401 Unauthorized responses → redirect to login
- [ ] Handle 403 Forbidden responses → show error message

### SEC-2: Authorization (UI-Level)
- [ ] Group User Management features only visible to Admin/Leader (hardcoded)
- [ ] Server-side validation still required (API handles actual authorization)

### SEC-3: Input Validation
- [ ] Validate user inputs before API calls
- [ ] Sanitize search queries
- [ ] Validate UUIDs before passing to API

---

## ⚡ Performance Requirements

### PERF-1: Caching
- [ ] Categories list: cache for 5 minutes (`staleTime: 1000 * 60 * 5`)
- [ ] Group members: cache for 3 minutes (`staleTime: 1000 * 60 * 3`)
- [ ] Checklist templates: cache for 5 minutes

### PERF-2: Pagination
- [ ] If conversation list is large (> 50), implement pagination
- [ ] Use infinite scroll or pagination controls

### PERF-3: Optimistic Updates
- [ ] Add member: show immediately, rollback on error
- [ ] Remove member: remove immediately, rollback on error
- [ ] Promote member: update role immediately, rollback on error

---

## 🧪 Testing Requirements

### TEST-1: Unit Tests
- [ ] API client functions
- [ ] React Query hooks
- [ ] Type transformations

### TEST-2: Component Tests
- [ ] GroupSelector with API integration
- [ ] GroupUserManagement component
- [ ] ManageVariantsDialog with API integration

### TEST-3: E2E Tests (Optional)
- [ ] Full flow: Category → Groups → User Management → Checklist Templates
- [ ] Add/remove/promote member flows

---

## 📊 Success Metrics

- [ ] All API endpoints have proper error handling
- [ ] Loading states shown during API calls
- [ ] No console errors or warnings
- [ ] All TypeScript types properly defined
- [ ] Unit tests pass with >80% coverage
- [ ] E2E tests pass (if implemented)

---

## 🚧 Out of Scope

The following are explicitly OUT OF SCOPE for this feature:

- [ ] Real-time updates via SignalR (will be added in future phase)
- [ ] Category creation/editing/deletion (Admin feature, separate scope)
- [ ] Bulk member operations (future enhancement)
- [ ] Advanced permission system (using hardcoded roles for now)
- [ ] Member role management beyond promote to Admin

---

## 📅 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-16 | AI | Initial requirements document |

---

## ⏳ PENDING DECISIONS (HUMAN ACTION REQUIRED)

| # | Decision | Options | HUMAN Decision |
|---|----------|---------|----------------|
| 1 | Should we show unread count badges on groups? | Yes / No | No |
| 2 | Pagination size for conversation list? | 20, 50, 100 | 10 |
| 3 | Cache stale time for categories? | 3min, 5min, 10min | no cache, getting new every time open UI|
| 4 | Should "Promote" action create Admin or Leader role? | Admin / Leader | currently no, no promote to anyone in the group chat |
| 5 | Where to hardcode current user role? | Global state / Component prop / Auth store | component prop, and it should be Admin, Leader, Staff, which in the UserInfo|

---

## 📋 IMPACT SUMMARY

### Files to Create:

- `src/api/categories.api.ts` - Category management APIs
- `src/api/groups.api.ts` - Group member management APIs  
- `src/api/checklist-templates.api.ts` - Checklist template APIs
- `src/hooks/queries/useCategories.ts` - Category query hooks
- `src/hooks/queries/useCategoryConversations.ts` - Category conversations hook
- `src/hooks/queries/useGroupMembers.ts` - Group members query hook
- `src/hooks/mutations/useGroupMemberMutations.ts` - Member mutation hooks
- `src/hooks/queries/useChecklistTemplates.ts` - Checklist templates hook
- `src/types/categories.ts` - Category TypeScript types
- `src/types/members.ts` - Member TypeScript types
- `src/types/checklist-templates.ts` - Checklist template types
- `src/features/portal/components/worktype-manager/GroupUserManagement.tsx` - NEW UI component
- `src/features/portal/components/worktype-manager/AddMemberDialog.tsx` - NEW dialog component

### Files to Modify:

- `src/features/portal/components/worktype-manager/GroupSelector.tsx`
  - Replace mock data with `useCategories()` hook
  - Add API loading/error states
  - Add navigation to GroupUserManagement if Admin/Leader
  
- `src/features/portal/components/worktype-manager/WorkTypeEditor.tsx`
  - Update to receive group data from API
  - Add integration point for checklist templates
  
- `src/features/portal/components/worktype-manager/ManageVariantsDialog.tsx`
  - Replace mock variants with `useChecklistTemplates()` hook
  - Add conversationId filter
  - Integrate with Task Swagger API

### Dependencies to Add:

- None (all dependencies already exist: @tanstack/react-query, axios, etc.)

---

## ✅ HUMAN CONFIRMATION

| Item | Status |
|------|--------|
| Đã review Impact Summary | ⬜ rồi |
| Đã điền Pending Decisions | ⬜ rồi|
| **APPROVED để thực thi** | ⬜ rồi |

**HUMAN Signature:** Khoa
**Date:** 16012026

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tạo wireframe (BƯỚC 2A) nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

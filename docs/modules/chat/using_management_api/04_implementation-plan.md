# [BƯỚC 4] Conversation Category Management System - Implementation Plan

**Feature:** Conversation Category Management System  
**Module:** Chat - Management API Integration  
**Status:** ⏳ PENDING HUMAN APPROVAL  
**Version:** 1.0  
**Created:** 2026-01-16

---

## 📋 Overview

This document provides a detailed, step-by-step implementation plan for the Conversation Category Management System. It includes file-by-file breakdown, execution order, dependencies, and specific implementation tasks.

**Implementation Strategy:** Bottom-up approach (API layer → Hooks layer → Component layer → Integration)

---

## 📊 Implementation Summary

### Files to Create: 13
- 3 API client files
- 6 hook files (3 queries + 3 mutations)
- 2 new components
- 2 dialog components

### Files to Modify: 3
- GroupSelector.tsx (add API integration)
- WorkTypeEditor.tsx (add member management button)
- ManageVariantsDialog.tsx (add Task API integration)

### Total Implementation Time Estimate: 12-16 hours
- Phase 1 (API + Types): 2-3 hours
- Phase 2 (Hooks): 3-4 hours
- Phase 3 (Components): 5-6 hours
- Phase 4 (Integration): 2-3 hours

---

## 🗂️ File Structure

```
src/
├── api/
│   ├── categories.api.ts          # [NEW] Category API client
│   ├── groups.api.ts               # [NEW] Group members API client
│   └── checklist-templates.api.ts  # [NEW] Task checklist template API client
│
├── types/
│   ├── categories.ts               # [NEW] Category-related types
│   ├── groups.ts                   # [NEW] Group & member types
│   └── checklist-templates.ts      # [NEW] Template types
│
├── hooks/
│   ├── queries/
│   │   ├── useCategories.ts        # [NEW] Query hook for categories
│   │   ├── useGroupMembers.ts      # [NEW] Query hook for members
│   │   └── useChecklistTemplates.ts # [NEW] Query hook for templates
│   │
│   └── mutations/
│       ├── useAddGroupMember.ts    # [NEW] Mutation: add member
│       ├── useRemoveGroupMember.ts # [NEW] Mutation: remove member
│       └── usePromoteGroupMember.ts # [NEW] Mutation: promote member
│
├── features/portal/components/worktype-manager/
│   ├── GroupSelector.tsx           # [MODIFY] Add API integration
│   ├── WorkTypeEditor.tsx          # [MODIFY] Add member mgmt button
│   ├── ManageVariantsDialog.tsx    # [MODIFY] Add Task API integration
│   ├── GroupUserManagement.tsx     # [NEW] Main member management UI
│   └── AddMemberDialog.tsx         # [NEW] Add member dialog
│
└── test files (co-located with implementation files)
    ├── categories.api.test.ts
    ├── groups.api.test.ts
    ├── checklist-templates.api.test.ts
    ├── useCategories.test.ts
    ├── useGroupMembers.test.ts
    ├── useChecklistTemplates.test.ts
    ├── useAddGroupMember.test.ts
    ├── useRemoveGroupMember.test.ts
    ├── usePromoteGroupMember.test.ts
    ├── GroupSelector.test.tsx
    ├── WorkTypeEditor.test.tsx
    ├── ManageVariantsDialog.test.tsx
    ├── GroupUserManagement.test.tsx
    └── AddMemberDialog.test.tsx
```

---

## 🔢 Implementation Phases

### Phase 1: Foundation (API Layer + Types)
**Duration:** 2-3 hours  
**Dependencies:** None  
**Can Run in Parallel:** Yes

#### Step 1.1: Create Type Definitions
**Order:** Execute first (other files depend on these)

**File 1.1.1:** `src/types/categories.ts`
```typescript
// Purpose: Type definitions for category-related data
// Dependencies: None
// Used by: categories.api.ts, useCategories.ts, GroupSelector.tsx

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

export interface ConversationDto {
  id: string;
  type: 'DM' | 'GRP';
  name: string;
  description: string | null;
  avatarFileId: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string | null;
  memberCount: number;
  unreadCount: number;
  lastMessage: LastMessageDto | null;
  categories: ConversationCategoryDto[] | null;
}

export interface LastMessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  contentType: 'TXT' | 'IMG' | 'FILE' | 'VID' | 'SYS';
  sentAt: string;
  // ... other fields from MessageDto
}

// API Request/Response types
export type GetCategoriesResponse = CategoryDto[];
export type GetCategoryConversationsResponse = ConversationDto[];
```

**Implementation Tasks:**
- [ ] Copy interfaces from 03_api-contract.md
- [ ] Add JSDoc comments for each interface
- [ ] Export all types
- [ ] Verify type consistency with snapshots

**Test File:** `src/types/categories.test.ts` (Type validation tests)

---

**File 1.1.2:** `src/types/groups.ts`
```typescript
// Purpose: Type definitions for group & member data
// Dependencies: None
// Used by: groups.api.ts, useGroupMembers.ts, mutations, GroupUserManagement.tsx

export type MemberRole = 'MBR' | 'ADM' | 'OWN';

export interface UserInfoDto {
  id: string;
  userName: string;
  fullName: string;
  identifier: string;
  roles: string;
}

export interface MemberDto {
  userId: string;
  userName: string;
  role: MemberRole;
  joinedAt: string;
  isMuted: boolean;
  userInfo: UserInfoDto;
}

// API Request/Response types
export type GetGroupMembersResponse = MemberDto[];

export interface AddMemberRequest {
  userId: string;
}

export interface AddMemberResponse extends MemberDto {}

export interface RemoveMemberResponse {
  message: string;
  userId: string;
}

export interface PromoteMemberResponse {
  message: string;
  userId: string;
  newRole: MemberRole;
}
```

**Implementation Tasks:**
- [ ] Copy interfaces from 03_api-contract.md
- [ ] Add role helper functions (isOwner, isAdmin, canManageMembers)
- [ ] Add JSDoc comments
- [ ] Export all types

**Test File:** `src/types/groups.test.ts` (Type validation + helper function tests)

---

**File 1.1.3:** `src/types/checklist-templates.ts`
```typescript
// Purpose: Type definitions for checklist templates
// Dependencies: None
// Used by: checklist-templates.api.ts, useChecklistTemplates.ts, ManageVariantsDialog.tsx

export interface TemplateItemDto {
  id: string;
  content: string;
  order: number;
}

export interface CheckListTemplateResponse {
  id: string;
  name: string;
  description: string | null;
  conversationId: string | null;
  items: TemplateItemDto[];
  createdAt: string;
  updatedAt: string | null;
}

// API Request/Response types
export type GetChecklistTemplatesResponse = CheckListTemplateResponse[];

export interface CreateCheckListTemplateRequest {
  name: string;
  description?: string | null;
  conversationId: string;
  items: string[]; // Array of item content strings
}

export interface UpdateCheckListTemplateRequest extends CreateCheckListTemplateRequest {
  id: string;
}
```

**Implementation Tasks:**
- [ ] Copy interfaces from 03_api-contract.md
- [ ] Add request/response types
- [ ] Add JSDoc comments
- [ ] Export all types

**Test File:** `src/types/checklist-templates.test.ts`

---

#### Step 1.2: Create API Client Files
**Order:** Execute after Step 1.1 (depends on types)

**File 1.2.1:** `src/api/categories.api.ts`
```typescript
// Purpose: API client for category endpoints
// Dependencies: types/categories.ts, api/client.ts
// Used by: hooks/queries/useCategories.ts

import { apiClient } from './client';
import type { 
  GetCategoriesResponse, 
  GetCategoryConversationsResponse 
} from '@/types/categories';

export const categoriesApi = {
  /**
   * Get all categories for the authenticated user
   * @returns Array of categories
   */
  getCategories: async (): Promise<GetCategoriesResponse> => {
    const { data } = await apiClient.get<GetCategoriesResponse>('/api/categories');
    return data;
  },

  /**
   * Get all conversations in a specific category
   * @param categoryId - The category UUID
   * @returns Array of conversations
   */
  getCategoryConversations: async (
    categoryId: string
  ): Promise<GetCategoryConversationsResponse> => {
    const { data } = await apiClient.get<GetCategoryConversationsResponse>(
      `/api/categories/${categoryId}/conversations`
    );
    return data;
  },
};
```

**Implementation Tasks:**
- [ ] Import apiClient from './client'
- [ ] Import types from '@/types/categories'
- [ ] Implement getCategories()
- [ ] Implement getCategoryConversations()
- [ ] Add JSDoc comments
- [ ] Add error handling (will throw, caught by React Query)

**Test File:** `src/api/categories.api.test.ts`
- Mock apiClient.get
- Test successful responses
- Test error cases
- Test parameter passing

---

**File 1.2.2:** `src/api/groups.api.ts`
```typescript
// Purpose: API client for group member management
// Dependencies: types/groups.ts, api/client.ts
// Used by: hooks (queries + mutations)

import { apiClient } from './client';
import type {
  GetGroupMembersResponse,
  AddMemberRequest,
  AddMemberResponse,
  RemoveMemberResponse,
  PromoteMemberResponse,
} from '@/types/groups';

export const groupsApi = {
  /**
   * Get all members of a group
   */
  getGroupMembers: async (groupId: string): Promise<GetGroupMembersResponse> => {
    const { data } = await apiClient.get<GetGroupMembersResponse>(
      `/api/groups/${groupId}/members`
    );
    return data;
  },

  /**
   * Add a new member to a group
   */
  addGroupMember: async (
    groupId: string,
    payload: AddMemberRequest
  ): Promise<AddMemberResponse> => {
    const { data } = await apiClient.post<AddMemberResponse>(
      `/api/groups/${groupId}/members`,
      payload
    );
    return data;
  },

  /**
   * Remove a member from a group
   */
  removeGroupMember: async (
    groupId: string,
    userId: string
  ): Promise<void> => {
    await apiClient.delete(`/api/groups/${groupId}/members/${userId}`);
  },

  /**
   * Promote a member to Admin role
   */
  promoteGroupMember: async (
    groupId: string,
    userId: string
  ): Promise<PromoteMemberResponse> => {
    const { data } = await apiClient.post<PromoteMemberResponse>(
      `/api/groups/${groupId}/members/${userId}/promote`
    );
    return data;
  },
};
```

**Implementation Tasks:**
- [ ] Import apiClient
- [ ] Import types from '@/types/groups'
- [ ] Implement getGroupMembers()
- [ ] Implement addGroupMember()
- [ ] Implement removeGroupMember() (204 response)
- [ ] Implement promoteGroupMember()
- [ ] Add JSDoc comments

**Test File:** `src/api/groups.api.test.ts`
- Test all 4 methods
- Test error cases
- Test parameter passing
- Mock apiClient methods

---

**File 1.2.3:** `src/api/checklist-templates.api.ts`
```typescript
// Purpose: API client for checklist templates (Task API)
// Dependencies: types/checklist-templates.ts, api/client.ts
// Used by: hooks/queries/useChecklistTemplates.ts

import { apiClient } from './client';
import type {
  GetChecklistTemplatesResponse,
  CreateCheckListTemplateRequest,
  UpdateCheckListTemplateRequest,
  CheckListTemplateResponse,
} from '@/types/checklist-templates';

export const checklistTemplatesApi = {
  /**
   * Get checklist templates filtered by conversation ID
   */
  getTemplates: async (
    conversationId: string
  ): Promise<GetChecklistTemplatesResponse> => {
    const { data } = await apiClient.get<GetChecklistTemplatesResponse>(
      '/api/checklist-templates',
      { params: { conversationId } }
    );
    return data;
  },

  /**
   * Create a new checklist template
   */
  createTemplate: async (
    payload: CreateCheckListTemplateRequest
  ): Promise<CheckListTemplateResponse> => {
    const { data } = await apiClient.post<CheckListTemplateResponse>(
      '/api/checklist-templates',
      payload
    );
    return data;
  },

  /**
   * Update an existing checklist template
   */
  updateTemplate: async (
    templateId: string,
    payload: UpdateCheckListTemplateRequest
  ): Promise<CheckListTemplateResponse> => {
    const { data } = await apiClient.put<CheckListTemplateResponse>(
      `/api/checklist-templates/${templateId}`,
      payload
    );
    return data;
  },

  /**
   * Delete a checklist template
   */
  deleteTemplate: async (templateId: string): Promise<void> => {
    await apiClient.delete(`/api/checklist-templates/${templateId}`);
  },
};
```

**Implementation Tasks:**
- [ ] Import apiClient
- [ ] Import types from '@/types/checklist-templates'
- [ ] Implement getTemplates() with query params
- [ ] Implement createTemplate()
- [ ] Implement updateTemplate()
- [ ] Implement deleteTemplate()
- [ ] Add JSDoc comments

**Test File:** `src/api/checklist-templates.api.test.ts`
- Test all 4 CRUD methods
- Test conversationId query param
- Test error cases
- Mock apiClient

---

### Phase 2: Data Hooks (React Query)
**Duration:** 3-4 hours  
**Dependencies:** Phase 1 complete  
**Can Run in Parallel:** Queries can be parallel, Mutations can be parallel

#### Step 2.1: Query Hooks

**File 2.1.1:** `src/hooks/queries/useCategories.ts`
```typescript
// Purpose: Query hook for fetching categories
// Dependencies: api/categories.api.ts, @tanstack/react-query
// Used by: GroupSelector.tsx

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/api/categories.api';

export const categoriesKeys = {
  all: ['categories'] as const,
  lists: () => [...categoriesKeys.all, 'list'] as const,
  list: () => [...categoriesKeys.lists()] as const,
  conversations: () => [...categoriesKeys.all, 'conversations'] as const,
  conversation: (categoryId: string) =>
    [...categoriesKeys.conversations(), categoryId] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoriesKeys.list(),
    queryFn: () => categoriesApi.getCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCategoryConversations(categoryId: string) {
  return useQuery({
    queryKey: categoriesKeys.conversation(categoryId),
    queryFn: () => categoriesApi.getCategoryConversations(categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
```

**Implementation Tasks:**
- [ ] Create query key factory (categoriesKeys)
- [ ] Implement useCategories() hook
- [ ] Implement useCategoryConversations() hook
- [ ] Add staleTime configuration
- [ ] Add enabled condition for conversations hook
- [ ] Add JSDoc comments

**Test File:** `src/hooks/queries/useCategories.test.ts`
- Test hook returns correct data structure
- Test loading states
- Test error states
- Test query key generation
- Test enabled condition

---

**File 2.1.2:** `src/hooks/queries/useGroupMembers.ts`
```typescript
// Purpose: Query hook for fetching group members
// Dependencies: api/groups.api.ts, @tanstack/react-query
// Used by: GroupUserManagement.tsx, WorkTypeEditor.tsx

import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '@/api/groups.api';

export const groupMembersKeys = {
  all: ['groupMembers'] as const,
  lists: () => [...groupMembersKeys.all, 'list'] as const,
  list: (groupId: string) => [...groupMembersKeys.lists(), groupId] as const,
};

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: groupMembersKeys.list(groupId),
    queryFn: () => groupsApi.getGroupMembers(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
```

**Implementation Tasks:**
- [ ] Create query key factory
- [ ] Implement useGroupMembers() hook
- [ ] Add enabled condition
- [ ] Add staleTime configuration
- [ ] Add JSDoc comments

**Test File:** `src/hooks/queries/useGroupMembers.test.ts`
- Test hook returns member data
- Test loading/error states
- Test enabled condition
- Test query key generation

---

**File 2.1.3:** `src/hooks/queries/useChecklistTemplates.ts`
```typescript
// Purpose: Query hook for fetching checklist templates
// Dependencies: api/checklist-templates.api.ts, @tanstack/react-query
// Used by: ManageVariantsDialog.tsx

import { useQuery } from '@tanstack/react-query';
import { checklistTemplatesApi } from '@/api/checklist-templates.api';

export const checklistTemplatesKeys = {
  all: ['checklistTemplates'] as const,
  lists: () => [...checklistTemplatesKeys.all, 'list'] as const,
  list: (conversationId: string) =>
    [...checklistTemplatesKeys.lists(), conversationId] as const,
};

export function useChecklistTemplates(conversationId: string) {
  return useQuery({
    queryKey: checklistTemplatesKeys.list(conversationId),
    queryFn: () => checklistTemplatesApi.getTemplates(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

**Implementation Tasks:**
- [ ] Create query key factory
- [ ] Implement useChecklistTemplates() hook
- [ ] Add enabled condition
- [ ] Add staleTime configuration
- [ ] Add JSDoc comments

**Test File:** `src/hooks/queries/useChecklistTemplates.test.ts`
- Test hook returns template data
- Test loading/error states
- Test enabled condition
- Test conversationId filtering

---

#### Step 2.2: Mutation Hooks

**File 2.2.1:** `src/hooks/mutations/useAddGroupMember.ts`
```typescript
// Purpose: Mutation hook for adding group members
// Dependencies: api/groups.api.ts, queries/useGroupMembers.ts
// Used by: AddMemberDialog.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/api/groups.api';
import { groupMembersKeys } from '../queries/useGroupMembers';
import type { AddMemberRequest, MemberDto } from '@/types/groups';

export function useAddGroupMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddMemberRequest) =>
      groupsApi.addGroupMember(groupId, payload),

    // Optimistic update
    onMutate: async (payload) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: groupMembersKeys.list(groupId),
      });

      // Snapshot previous value
      const previousMembers = queryClient.getQueryData<MemberDto[]>(
        groupMembersKeys.list(groupId)
      );

      // Optimistically update (add placeholder member)
      if (previousMembers) {
        const optimisticMember: MemberDto = {
          userId: payload.userId,
          userName: 'Loading...',
          role: 'MBR',
          joinedAt: new Date().toISOString(),
          isMuted: false,
          userInfo: {
            id: payload.userId,
            userName: 'Loading...',
            fullName: '',
            identifier: '',
            roles: '',
          },
        };

        queryClient.setQueryData<MemberDto[]>(
          groupMembersKeys.list(groupId),
          [...previousMembers, optimisticMember]
        );
      }

      return { previousMembers };
    },

    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          groupMembersKeys.list(groupId),
          context.previousMembers
        );
      }
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupMembersKeys.list(groupId),
      });
    },
  });
}
```

**Implementation Tasks:**
- [ ] Implement mutation with optimistic update
- [ ] Add onMutate for optimistic UI
- [ ] Add onError for rollback
- [ ] Add onSuccess for invalidation
- [ ] Add JSDoc comments

**Test File:** `src/hooks/mutations/useAddGroupMember.test.ts`
- Test successful mutation
- Test optimistic update
- Test rollback on error
- Test query invalidation
- Mock queryClient and API

---

**File 2.2.2:** `src/hooks/mutations/useRemoveGroupMember.ts`
```typescript
// Purpose: Mutation hook for removing group members
// Dependencies: api/groups.api.ts, queries/useGroupMembers.ts
// Used by: GroupUserManagement.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/api/groups.api';
import { groupMembersKeys } from '../queries/useGroupMembers';
import type { MemberDto } from '@/types/groups';

export function useRemoveGroupMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      groupsApi.removeGroupMember(groupId, userId),

    // Optimistic update
    onMutate: async (userId) => {
      await queryClient.cancelQueries({
        queryKey: groupMembersKeys.list(groupId),
      });

      const previousMembers = queryClient.getQueryData<MemberDto[]>(
        groupMembersKeys.list(groupId)
      );

      // Optimistically remove member
      if (previousMembers) {
        queryClient.setQueryData<MemberDto[]>(
          groupMembersKeys.list(groupId),
          previousMembers.filter((m) => m.userId !== userId)
        );
      }

      return { previousMembers };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          groupMembersKeys.list(groupId),
          context.previousMembers
        );
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupMembersKeys.list(groupId),
      });
    },
  });
}
```

**Implementation Tasks:**
- [ ] Implement mutation with optimistic update
- [ ] Add onMutate to remove member from list
- [ ] Add onError for rollback
- [ ] Add onSuccess for invalidation
- [ ] Add JSDoc comments

**Test File:** `src/hooks/mutations/useRemoveGroupMember.test.ts`
- Test successful removal
- Test optimistic update
- Test rollback on error
- Test query invalidation

---

**File 2.2.3:** `src/hooks/mutations/usePromoteGroupMember.ts`
```typescript
// Purpose: Mutation hook for promoting members to Admin
// Dependencies: api/groups.api.ts, queries/useGroupMembers.ts
// Used by: GroupUserManagement.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/api/groups.api';
import { groupMembersKeys } from '../queries/useGroupMembers';
import type { MemberDto } from '@/types/groups';

export function usePromoteGroupMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      groupsApi.promoteGroupMember(groupId, userId),

    // Optimistic update
    onMutate: async (userId) => {
      await queryClient.cancelQueries({
        queryKey: groupMembersKeys.list(groupId),
      });

      const previousMembers = queryClient.getQueryData<MemberDto[]>(
        groupMembersKeys.list(groupId)
      );

      // Optimistically update role
      if (previousMembers) {
        queryClient.setQueryData<MemberDto[]>(
          groupMembersKeys.list(groupId),
          previousMembers.map((m) =>
            m.userId === userId ? { ...m, role: 'ADM' as const } : m
          )
        );
      }

      return { previousMembers };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          groupMembersKeys.list(groupId),
          context.previousMembers
        );
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupMembersKeys.list(groupId),
      });
    },
  });
}
```

**Implementation Tasks:**
- [ ] Implement mutation with optimistic update
- [ ] Add onMutate to update role
- [ ] Add onError for rollback
- [ ] Add onSuccess for invalidation
- [ ] Add JSDoc comments

**Test File:** `src/hooks/mutations/usePromoteGroupMember.test.ts`
- Test successful promotion
- Test optimistic update
- Test rollback on error
- Test query invalidation

---

### Phase 3: Components
**Duration:** 5-6 hours  
**Dependencies:** Phase 2 complete  
**Order:** New components first, then modify existing

#### Step 3.1: New Components

**File 3.1.1:** `src/features/portal/components/worktype-manager/GroupUserManagement.tsx`
```typescript
// Purpose: Main UI for managing group members (Admin/Leader only)
// Dependencies: hooks (useGroupMembers, mutations), UI components
// Used by: WorkTypeEditor.tsx (opened via button)

import { useState } from 'react';
import { useGroupMembers } from '@/hooks/queries/useGroupMembers';
import { useRemoveGroupMember } from '@/hooks/mutations/useRemoveGroupMember';
import { usePromoteGroupMember } from '@/hooks/mutations/usePromoteGroupMember';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddMemberDialog } from './AddMemberDialog';
// ... other imports

interface GroupUserManagementProps {
  groupId: string;
  groupName: string;
  currentUserRole: 'ADM' | 'OWN'; // Only admins/owners can access
}

export function GroupUserManagement({
  groupId,
  groupName,
  currentUserRole,
}: GroupUserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: members, isLoading, error } = useGroupMembers(groupId);
  const removeMember = useRemoveGroupMember(groupId);
  const promoteMember = usePromoteGroupMember(groupId);

  // Group members by role
  const ownerMembers = members?.filter((m) => m.role === 'OWN') ?? [];
  const adminMembers = members?.filter((m) => m.role === 'ADM') ?? [];
  const regularMembers = members?.filter((m) => m.role === 'MBR') ?? [];

  // Filter by search
  const filteredOwners = filterMembers(ownerMembers, searchQuery);
  const filteredAdmins = filterMembers(adminMembers, searchQuery);
  const filteredMembers = filterMembers(regularMembers, searchQuery);

  // Handlers
  const handleRemove = (userId: string) => {
    // Show confirmation dialog, then:
    removeMember.mutate(userId);
  };

  const handlePromote = (userId: string) => {
    promoteMember.mutate(userId);
  };

  // Render UI with:
  // - Header with group name and total count
  // - Search input
  // - Add Member button
  // - Three sections: Owners, Admins, Members
  // - Each member card with actions (remove/promote)
  // - Loading/Error/Empty states
  // - AddMemberDialog component

  return (
    <div data-testid="group-user-management">
      {/* Implementation based on wireframe */}
    </div>
  );
}
```

**Implementation Tasks:**
- [ ] Import all hooks and UI components
- [ ] Implement component props interface
- [ ] Add state management (search, dialog)
- [ ] Implement useGroupMembers hook call
- [ ] Implement mutation hooks
- [ ] Group members by role (OWN, ADM, MBR)
- [ ] Implement search filter logic
- [ ] Implement handleRemove with confirmation
- [ ] Implement handlePromote
- [ ] Render header with group name + count
- [ ] Render search input
- [ ] Render "Add Member" button
- [ ] Render three role sections (Owners, Admins, Members)
- [ ] Render member cards with actions
- [ ] Add loading skeleton
- [ ] Add error state
- [ ] Add empty state
- [ ] Integrate AddMemberDialog
- [ ] Add data-testid attributes
- [ ] Add responsive design (desktop/tablet/mobile)

**Test File:** `src/features/portal/components/worktype-manager/GroupUserManagement.test.tsx`
- Test rendering with members
- Test role grouping (OWN, ADM, MBR)
- Test search filtering
- Test remove member action
- Test promote member action
- Test add member dialog opening
- Test loading state
- Test error state
- Test empty state
- Test responsive behavior

---

**File 3.1.2:** `src/features/portal/components/worktype-manager/AddMemberDialog.tsx`
```typescript
// Purpose: Dialog for adding new members to a group
// Dependencies: useAddGroupMember mutation, UI components
// Used by: GroupUserManagement.tsx

import { useState } from 'react';
import { useAddGroupMember } from '@/hooks/mutations/useAddGroupMember';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// ... other imports

interface AddMemberDialogProps {
  groupId: string;
  open: boolean;
  onClose: () => void;
}

export function AddMemberDialog({
  groupId,
  open,
  onClose,
}: AddMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const addMember = useAddGroupMember(groupId);

  // TODO: Need user search API (not in current swagger)
  // For now, mock user list or search existing workspace users

  const handleAdd = async () => {
    // Add all selected users
    for (const userId of selectedUsers) {
      await addMember.mutateAsync({ userId });
    }
    onClose();
  };

  // Render UI with:
  // - Search input for users
  // - Checkbox list of available users
  // - Selected count indicator
  // - Add button (disabled if none selected)
  // - Cancel button

  return (
    <Dialog open={open} onOpenChange={onClose} data-testid="add-member-dialog">
      {/* Implementation based on wireframe */}
    </Dialog>
  );
}
```

**Implementation Tasks:**
- [ ] Import mutation hook and UI components
- [ ] Implement props interface
- [ ] Add state for search and selection
- [ ] Implement useAddGroupMember hook
- [ ] Implement user search logic (mock for now)
- [ ] Implement checkbox selection
- [ ] Implement handleAdd (batch add)
- [ ] Render dialog header
- [ ] Render search input
- [ ] Render user list with checkboxes
- [ ] Render selected count
- [ ] Render Add/Cancel buttons
- [ ] Add loading states during mutation
- [ ] Add error handling
- [ ] Add data-testid attributes

**Test File:** `src/features/portal/components/worktype-manager/AddMemberDialog.test.tsx`
- Test dialog open/close
- Test user search
- Test checkbox selection
- Test add member action
- Test batch add multiple users
- Test loading state
- Test error handling
- Test empty search results

---

#### Step 3.2: Modify Existing Components

**File 3.2.1:** `src/features/portal/components/worktype-manager/GroupSelector.tsx` (MODIFY)
```typescript
// Changes:
// 1. Replace mock data with useCategories() hook
// 2. Add loading skeleton
// 3. Add error state
// 4. Add empty state
// 5. Update data structure to CategoryDto

// Before: const categories = mockCategories;
// After: const { data: categories, isLoading, error } = useCategories();

// Add loading state:
if (isLoading) return <LoadingSkeleton />;

// Add error state:
if (error) return <ErrorState error={error} />;

// Add empty state:
if (!categories || categories.length === 0) return <EmptyState />;

// Update mapping:
categories.map((category) => (
  <CategoryCard
    key={category.id}
    name={category.name}
    count={category.conversationCount} // was category.count
    onClick={() => onSelectCategory(category.id)}
  />
))
```

**Implementation Tasks:**
- [ ] Import useCategories hook
- [ ] Replace mock data with hook call
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Handle empty state
- [ ] Update CategoryDto property mappings
- [ ] Verify existing onClick logic
- [ ] Add data-testid attributes
- [ ] Test integration

**Test File:** `src/features/portal/components/worktype-manager/GroupSelector.test.tsx`
- Test with real API data structure
- Test loading state
- Test error state
- Test empty state
- Test category selection
- Mock useCategories hook

---

**File 3.2.2:** `src/features/portal/components/worktype-manager/WorkTypeEditor.tsx` (MODIFY)
```typescript
// Changes:
// 1. Replace mock group data with useCategoryConversations() hook
// 2. Add "Quản lý thành viên" button (conditional on user role)
// 3. Add GroupUserManagement modal/sheet
// 4. Add unread badge from API data

// Add hook:
const { data: conversations, isLoading } = useCategoryConversations(categoryId);

// Add state for member management:
const [showMemberManagement, setShowMemberManagement] = useState(false);
const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

// Add button in group card:
{currentUserRole === 'ADM' || currentUserRole === 'OWN' ? (
  <Button
    size="sm"
    variant="outline"
    onClick={() => {
      setSelectedGroupId(group.id);
      setShowMemberManagement(true);
    }}
  >
    Quản lý thành viên
  </Button>
) : null}

// Add modal:
{showMemberManagement && selectedGroupId && (
  <GroupUserManagement
    groupId={selectedGroupId}
    groupName={/* find group name */}
    currentUserRole={currentUserRole}
    onClose={() => setShowMemberManagement(false)}
  />
)}
```

**Implementation Tasks:**
- [ ] Import useCategoryConversations hook
- [ ] Import GroupUserManagement component
- [ ] Replace mock data with hook call
- [ ] Add state for member management modal
- [ ] Add conditional "Quản lý thành viên" button
- [ ] Add button click handler
- [ ] Add GroupUserManagement modal
- [ ] Update unread badge from API data
- [ ] Handle loading/error states
- [ ] Add data-testid attributes
- [ ] Test integration

**Test File:** `src/features/portal/components/worktype-manager/WorkTypeEditor.test.tsx`
- Test with real API data
- Test "Quản lý thành viên" button visibility (role-based)
- Test button click opens modal
- Test unread badge display
- Mock useCategoryConversations hook

---

**File 3.2.3:** `src/features/portal/components/worktype-manager/ManageVariantsDialog.tsx` (MODIFY)
```typescript
// Changes:
// 1. Replace mock checklist data with useChecklistTemplates() hook
// 2. Update data structure to CheckListTemplateResponse
// 3. Add create/update/delete mutations
// 4. Filter templates by conversationId

// Add hooks:
const { data: templates, isLoading } = useChecklistTemplates(conversationId);

// Add mutations (implement later if needed):
// const createTemplate = useCreateTemplate();
// const updateTemplate = useUpdateTemplate();
// const deleteTemplate = useDeleteTemplate();

// Update mapping:
templates?.map((template) => (
  <TemplateCard
    key={template.id}
    name={template.name}
    description={template.description}
    itemCount={template.items?.length ?? 0}
    // ... other props
  />
))
```

**Implementation Tasks:**
- [ ] Import useChecklistTemplates hook
- [ ] Replace mock data with hook call
- [ ] Update CheckListTemplateResponse property mappings
- [ ] Handle loading/error states
- [ ] Add conversationId filtering
- [ ] (Optional) Add create/update/delete mutations
- [ ] Test integration

**Test File:** `src/features/portal/components/worktype-manager/ManageVariantsDialog.test.tsx`
- Test with real API data
- Test conversationId filtering
- Test loading/error states
- Test template display
- Mock useChecklistTemplates hook

---

### Phase 4: Integration & Testing
**Duration:** 2-3 hours  
**Dependencies:** Phase 3 complete

#### Step 4.1: Integration Testing
- [ ] Test GroupSelector → WorkTypeEditor flow
- [ ] Test WorkTypeEditor → GroupUserManagement flow
- [ ] Test GroupUserManagement → AddMemberDialog flow
- [ ] Test ManageVariantsDialog integration
- [ ] Verify all API calls work end-to-end
- [ ] Test error scenarios (401, 403, 404)
- [ ] Test optimistic UI updates and rollbacks
- [ ] Test role-based access control (Admin/Leader/Member)

#### Step 4.2: E2E Testing (Optional - BƯỚC 7)
- [ ] Create Playwright test for full user journey
- [ ] Test Admin adding member to group
- [ ] Test Admin promoting member to Admin
- [ ] Test Admin removing member from group
- [ ] Test role-based button visibility
- [ ] Test error handling and retry logic

---

## ⏳ PENDING DECISIONS

| # | Decision | Options | HUMAN Decision |
|---|----------|---------|----------------|
| 1 | User search API | Use existing user API / Create new endpoint / Mock for now | use existing user API |
| 2 | Current user role detection | Hardcoded in UI / Fetch from auth API / Use context | get from localStorage auth-storage.state.user.roles |
| 3 | Confirmation dialogs | Use native confirm() / Custom Dialog component | Custom Dialog |
| 4 | Template mutations | Implement now / Defer to later sprint | Implement now |
| 5 | Error toast notifications | Use existing toast system / Console only |  Console and existing toast system |

---

## 📋 IMPACT SUMMARY

### New Files (13 + 13 tests = 26 total):
1. `src/types/categories.ts` + test
2. `src/types/groups.ts` + test
3. `src/types/checklist-templates.ts` + test
4. `src/api/categories.api.ts` + test
5. `src/api/groups.api.ts` + test
6. `src/api/checklist-templates.api.ts` + test
7. `src/hooks/queries/useCategories.ts` + test
8. `src/hooks/queries/useGroupMembers.ts` + test
9. `src/hooks/queries/useChecklistTemplates.ts` + test
10. `src/hooks/mutations/useAddGroupMember.ts` + test
11. `src/hooks/mutations/useRemoveGroupMember.ts` + test
12. `src/hooks/mutations/usePromoteGroupMember.ts` + test
13. `src/features/portal/components/worktype-manager/GroupUserManagement.tsx` + test
14. `src/features/portal/components/worktype-manager/AddMemberDialog.tsx` + test

### Modified Files (3 + 3 tests = 6 total):
1. `src/features/portal/components/worktype-manager/GroupSelector.tsx` + test
2. `src/features/portal/components/worktype-manager/WorkTypeEditor.tsx` + test
3. `src/features/portal/components/worktype-manager/ManageVariantsDialog.tsx` + test

### Dependencies (none to add):
All required dependencies already in package.json:
- `@tanstack/react-query` - Already installed
- `axios` - Already installed
- UI components - Already in `@/components/ui/`

---

## ✅ HUMAN CONFIRMATION

| Item | Status |
|------|--------|
| Đã review implementation strategy | ⬜  REVIEW |
| Đã điền Pending Decisions | ⬜  ĐIỀN |
| Đồng ý với execution order | ⬜  ĐỒNG Ý |
| Đồng ý với file structure | ⬜  ĐỒNG Ý |
| **APPROVED để thực thi** | ⬜  APPROVED |

**HUMAN Signature:** Khoa 
**Date:** 16012026

> ⚠️ **CRITICAL: AI KHÔNG ĐƯỢC tạo test requirements (BƯỚC 4.5) nếu mục "APPROVED để thực thi" = ⬜ CHƯA APPROVED**

---

## 📝 Notes

### Implementation Tips:
1. **Bottom-up approach:** Build API → Hooks → Components
2. **Test as you go:** Write tests immediately after implementation
3. **Optimistic UI:** All mutations should have optimistic updates
4. **Error handling:** Use React Query's built-in error handling
5. **Type safety:** Leverage TypeScript for all interfaces

### Common Pitfalls to Avoid:
- ❌ Don't forget `enabled` flag in conditional queries
- ❌ Don't forget optimistic updates in mutations
- ❌ Don't forget error rollback in mutations
- ❌ Don't forget query invalidation after mutations
- ❌ Don't forget data-testid attributes for E2E tests

### Performance Considerations:
- Use `staleTime` to reduce unnecessary refetches
- Use query key factories for easy invalidation
- Implement pagination if member/template lists grow large
- Consider using `keepPreviousData` for better UX

---

**End of Implementation Plan**

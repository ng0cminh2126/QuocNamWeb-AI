// API related types - Request/Response wrappers

import type { ApiError, ApiResponse, PaginatedResponse, InfiniteScrollResponse } from './common';

// Re-export common API types
export type { ApiError, ApiResponse, PaginatedResponse, InfiniteScrollResponse };

// API Query Keys factory
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  
  // Groups/Chats
  groups: {
    all: ['groups'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.groups.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.groups.all, 'detail', id] as const,
    members: (id: string) => [...queryKeys.groups.all, 'members', id] as const,
  },
  
  // Messages
  messages: {
    all: ['messages'] as const,
    list: (groupId: string) => [...queryKeys.messages.all, 'list', groupId] as const,
    infinite: (groupId: string) => [...queryKeys.messages.all, 'infinite', groupId] as const,
    detail: (id: string) => [...queryKeys.messages.all, 'detail', id] as const,
    pinned: (groupId: string) => [...queryKeys.messages.all, 'pinned', groupId] as const,
  },
  
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.tasks.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.tasks.all, 'detail', id] as const,
    logs: (taskId: string) => [...queryKeys.tasks.all, 'logs', taskId] as const,
    checklist: (taskId: string) => [...queryKeys.tasks.all, 'checklist', taskId] as const,
  },
  
  // Files
  files: {
    all: ['files'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.files.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.files.all, 'detail', id] as const,
    folders: (groupId: string) => [...queryKeys.files.all, 'folders', groupId] as const,
  },
  
  // Organization
  departments: {
    all: ['departments'] as const,
    list: () => [...queryKeys.departments.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.departments.all, 'detail', id] as const,
  },
  
  users: {
    all: ['users'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.users.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
  
  workTypes: {
    all: ['workTypes'] as const,
    list: () => [...queryKeys.workTypes.all, 'list'] as const,
  },
  
  // Checklist templates
  checklistTemplates: {
    all: ['checklistTemplates'] as const,
    list: () => [...queryKeys.checklistTemplates.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.checklistTemplates.all, 'detail', id] as const,
  },
} as const;

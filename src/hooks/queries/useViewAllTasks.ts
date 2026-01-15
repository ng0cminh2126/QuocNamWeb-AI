// useViewAllTasks - Custom hook for filtering, sorting, and processing task list

import { useMemo, useState, useEffect } from 'react';
import type { LinkedTaskDto } from '@/types/tasks_api';

// ==========================================
// Types
// ==========================================

export interface StatusFilters {
  todo: boolean;
  in_progress: boolean;
  awaiting_review: boolean;
  done: boolean;
}

export interface PriorityFilters {
  low: boolean;
  medium: boolean;
  high: boolean;
  urgent: boolean;
}

export type SortOption =
  | 'createdDate'
  | 'updatedDate'
  | 'priority'
  | 'assignee'
  | 'status';

interface UseViewAllTasksOptions {
  tasks: LinkedTaskDto[];
  searchTerm: string;
  statusFilters: StatusFilters;
  priorityFilters: PriorityFilters;
  sortBy: SortOption;
  sortOrder?: 'asc' | 'desc';
}

interface UseViewAllTasksResult {
  filteredTasks: LinkedTaskDto[];
  filteredCount: number;
  totalCount: number;
}

// ==========================================
// Priority weight map for sorting
// ==========================================

const priorityWeightMap: Record<string, number> = {
  urgent: 4,
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// ==========================================
// Status weight map for sorting
// ==========================================

const statusWeightMap: Record<string, number> = {
  todo: 1,
  in_progress: 2,
  doing: 2,
  awaiting_review: 3,
  needtoverified: 3,
  done: 4,
  finished: 4,
};

// ==========================================
// Hook
// ==========================================

/**
 * Custom hook to filter, sort, and process task list
 * 
 * Features:
 * - Search filtering (case-insensitive, debounced)
 * - Status filtering (OR logic)
 * - Priority filtering (OR logic)
 * - Combined filtering (AND logic between status and priority)
 * - Multiple sort options
 * 
 * @param tasks - Array of LinkedTaskDto from API
 * @param searchTerm - Search term for filtering by title
 * @param statusFilters - Status filter checkboxes
 * @param priorityFilters - Priority filter checkboxes
 * @param sortBy - Sort field
 * @param sortOrder - Sort direction (default: desc for dates, asc for others)
 */
export function useViewAllTasks({
  tasks,
  searchTerm,
  statusFilters,
  priorityFilters,
  sortBy,
  sortOrder = 'desc',
}: UseViewAllTasksOptions): UseViewAllTasksResult {
  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoized filtered tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Apply search filter
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter((linkedTask) => {
        const title = linkedTask.task.title?.toLowerCase() || '';
        // Note: TaskSummaryDto doesn't have description, so we only search title
        return title.includes(searchLower);
      });
    }

    // 2. Apply status filter (OR logic)
    const activeStatuses = Object.entries(statusFilters)
      .filter(([_, enabled]) => enabled)
      .map(([status]) => status);

    // If no statuses are selected, filter out all tasks
    if (activeStatuses.length === 0) {
      result = [];
    } else if (activeStatuses.length < 4) {
      result = result.filter((linkedTask) => {
        const taskStatus = linkedTask.task.status?.toLowerCase() || '';
        // Normalize status names
        const normalizedStatus = taskStatus
          .replace(/\s+/g, '_')
          .replace(/-/g, '_');
        
        return activeStatuses.some((status) => {
          if (status === 'in_progress') {
            return normalizedStatus === 'in_progress' || normalizedStatus === 'doing';
          }
          if (status === 'awaiting_review') {
            return normalizedStatus === 'awaiting_review' || normalizedStatus === 'needtoverified';
          }
          return normalizedStatus === status;
        });
      });
    }

    // 3. Apply priority filter (OR logic)
    const activePriorities = Object.entries(priorityFilters)
      .filter(([_, enabled]) => enabled)
      .map(([priority]) => priority);

    // If no priorities are selected, filter out all tasks
    if (activePriorities.length === 0) {
      result = [];
    } else if (activePriorities.length < 4) {
      result = result.filter((linkedTask) => {
        const taskPriority = linkedTask.task.priority?.toLowerCase() || '';
        return activePriorities.includes(taskPriority);
      });
    }

    // 4. Apply sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'createdDate':
        case 'updatedDate':
          // TaskSummaryDto doesn't have createdAt/updatedAt
          // Keep original order (from API) which should be newest first
          return 0;

        case 'priority': {
          const priorityA = priorityWeightMap[a.task.priority?.toLowerCase() || 'low'] || 1;
          const priorityB = priorityWeightMap[b.task.priority?.toLowerCase() || 'low'] || 1;
          // Always high to low for priority
          return priorityB - priorityA;
        }

        case 'assignee': {
          const nameA = a.task.assignedTo?.name || a.task.assignedTo?.email || '';
          const nameB = b.task.assignedTo?.name || b.task.assignedTo?.email || '';
          return sortOrder === 'asc'
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        }

        case 'status': {
          const statusA = statusWeightMap[a.task.status?.toLowerCase() || 'todo'] || 1;
          const statusB = statusWeightMap[b.task.status?.toLowerCase() || 'todo'] || 1;
          return sortOrder === 'asc' ? statusA - statusB : statusB - statusA;
        }

        default:
          return 0;
      }
    });

    return result;
  }, [tasks, debouncedSearch, statusFilters, priorityFilters, sortBy, sortOrder]);

  return {
    filteredTasks,
    filteredCount: filteredTasks.length,
    totalCount: tasks.length,
  };
}

// ==========================================
// Helper functions
// ==========================================

/**
 * Create default status filters (all enabled)
 */
export function createDefaultStatusFilters(): StatusFilters {
  return {
    todo: true,
    in_progress: true,
    awaiting_review: true,
    done: true,
  };
}

/**
 * Create default priority filters (all enabled)
 */
export function createDefaultPriorityFilters(): PriorityFilters {
  return {
    low: true,
    medium: true,
    high: true,
    urgent: true,
  };
}

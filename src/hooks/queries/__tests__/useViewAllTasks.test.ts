// Test suite for useViewAllTasks hook

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useViewAllTasks,
  createDefaultStatusFilters,
  createDefaultPriorityFilters,
  type StatusFilters,
  type PriorityFilters,
} from '../useViewAllTasks';
import type { LinkedTaskDto } from '@/types/tasks_api';

// Mock task data
const mockTasks: LinkedTaskDto[] = [
  {
    taskId: 'task-001',
    messageId: 'msg-001',
    task: {
      id: 'task-001',
      title: 'Implement API integration',
      status: 'in_progress',
      priority: 'high',
      assignedTo: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
  },
  {
    taskId: 'task-002',
    messageId: 'msg-002',
    task: {
      id: 'task-002',
      title: 'Write documentation',
      status: 'todo',
      priority: 'medium',
      assignedTo: {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
    },
  },
  {
    taskId: 'task-003',
    messageId: null,
    task: {
      id: 'task-003',
      title: 'Code review API integration',
      status: 'done',
      priority: 'low',
      assignedTo: {
        id: 'user-3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
      },
    },
  },
  {
    taskId: 'task-004',
    messageId: 'msg-004',
    task: {
      id: 'task-004',
      title: 'Fix urgent bug',
      status: 'awaiting_review',
      priority: 'urgent',
      assignedTo: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
  },
];

describe('useViewAllTasks', () => {
  describe('Search Filtering', () => {
    it('should filter tasks by search term (case-insensitive)', async () => {
      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: 'api',
          statusFilters: createDefaultStatusFilters(),
          priorityFilters: createDefaultPriorityFilters(),
          sortBy: 'priority',
        })
      );

      // Wait for debounce
      await waitFor(
        () => {
          expect(result.current.filteredCount).toBe(2);
        },
        { timeout: 500 }
      );

      expect(result.current.filteredTasks).toHaveLength(2);
      expect(result.current.filteredTasks[0].task.title).toMatch(/API/i);
      expect(result.current.filteredTasks[1].task.title).toMatch(/API/i);
    });

    it('should return all tasks when search term is empty', () => {
      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: '',
          statusFilters: createDefaultStatusFilters(),
          priorityFilters: createDefaultPriorityFilters(),
          sortBy: 'priority',
        })
      );

      expect(result.current.filteredTasks).toHaveLength(4);
      expect(result.current.totalCount).toBe(4);
    });

    it('should return empty array when no tasks match search', async () => {
      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: 'nonexistent',
          statusFilters: createDefaultStatusFilters(),
          priorityFilters: createDefaultPriorityFilters(),
          sortBy: 'priority',
        })
      );

      // Wait for debounce
      await waitFor(
        () => {
          expect(result.current.filteredCount).toBe(0);
        },
        { timeout: 500 }
      );

      expect(result.current.filteredTasks).toHaveLength(0);
    });
  });

  describe('Status Filter (OR Logic)', () => {
    it('should filter tasks by single status', () => {
      const statusFilters: StatusFilters = {
        todo: true,
        in_progress: false,
        awaiting_review: false,
        done: false,
      };

      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: '',
          statusFilters,
          priorityFilters: createDefaultPriorityFilters(),
          sortBy: 'priority',
        })
      );

      expect(result.current.filteredTasks).toHaveLength(1);
      expect(result.current.filteredTasks[0].task.status).toBe('todo');
    });

    it('should filter tasks by multiple statuses (OR logic)', () => {
      const statusFilters: StatusFilters = {
        todo: true,
        in_progress: true,
        awaiting_review: false,
        done: false,
      };

      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: '',
          statusFilters,
          priorityFilters: createDefaultPriorityFilters(),
          sortBy: 'priority',
        })
      );

      expect(result.current.filteredTasks).toHaveLength(2);
      expect(result.current.filteredCount).toBe(2);
    });

    it('should show all tasks when all status filters are enabled', () => {
      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: '',
          statusFilters: createDefaultStatusFilters(), // All enabled
          priorityFilters: createDefaultPriorityFilters(),
          sortBy: 'priority',
        })
      );

      expect(result.current.filteredTasks).toHaveLength(4);
    });
  });

  describe('Priority Filter (OR Logic)', () => {
    it('should filter tasks by single priority', () => {
      const priorityFilters: PriorityFilters = {
        high: true,
        medium: false,
        low: false,
        urgent: false,
      };

      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: '',
          statusFilters: createDefaultStatusFilters(),
          priorityFilters,
          sortBy: 'priority',
        })
      );

      expect(result.current.filteredTasks).toHaveLength(1);
      expect(result.current.filteredTasks[0].task.priority).toBe('high');
    });

    it('should filter tasks by multiple priorities (OR logic)', () => {
      const priorityFilters: PriorityFilters = {
        high: true,
        medium: true,
        low: false,
        urgent: false,
      };

      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: '',
          statusFilters: createDefaultStatusFilters(),
          priorityFilters,
          sortBy: 'priority',
        })
      );

      expect(result.current.filteredTasks).toHaveLength(2);
    });
  });

  describe('Combined Filters (AND Logic)', () => {
    it('should apply combined status and priority filters with AND logic', () => {
      const statusFilters: StatusFilters = {
        todo: true,
        in_progress: true,
        awaiting_review: false,
        done: false,
      };

      const priorityFilters: PriorityFilters = {
        high: true,
        medium: false,
        low: false,
        urgent: false,
      };

      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: '',
          statusFilters,
          priorityFilters,
          sortBy: 'priority',
        })
      );

      // Should only get tasks that are (todo OR in_progress) AND (high)
      // = "Implement API integration" (in_progress + high)
      expect(result.current.filteredTasks).toHaveLength(1);
      expect(result.current.filteredTasks[0].task.title).toBe('Implement API integration');
    });
  });

  describe('Sorting', () => {
    it('should sort by priority (high to low)', () => {
      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: '',
          statusFilters: createDefaultStatusFilters(),
          priorityFilters: createDefaultPriorityFilters(),
          sortBy: 'priority',
        })
      );

      const priorities = result.current.filteredTasks.map((t) => t.task.priority);
      expect(priorities).toEqual(['urgent', 'high', 'medium', 'low']);
    });

    it('should sort by assignee name (A-Z)', () => {
      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: '',
          statusFilters: createDefaultStatusFilters(),
          priorityFilters: createDefaultPriorityFilters(),
          sortBy: 'assignee',
          sortOrder: 'asc',
        })
      );

      const names = result.current.filteredTasks.map((t) => t.task.assignedTo.name);
      // Jane Smith, John Doe, John Doe, Mike Johnson
      expect(names[0]).toBe('Jane Smith');
      expect(names[names.length - 1]).toBe('Mike Johnson');
    });

    it('should sort by status', () => {
      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: mockTasks,
          searchTerm: '',
          statusFilters: createDefaultStatusFilters(),
          priorityFilters: createDefaultPriorityFilters(),
          sortBy: 'status',
          sortOrder: 'asc',
        })
      );

      const statuses = result.current.filteredTasks.map((t) => t.task.status);
      // Should be in order: todo, in_progress, awaiting_review, done
      expect(statuses[0]).toBe('todo');
      expect(statuses[statuses.length - 1]).toBe('done');
    });
  });

  describe('Helper Functions', () => {
    it('should create default status filters with all enabled', () => {
      const filters = createDefaultStatusFilters();

      expect(filters.todo).toBe(true);
      expect(filters.in_progress).toBe(true);
      expect(filters.awaiting_review).toBe(true);
      expect(filters.done).toBe(true);
    });

    it('should create default priority filters with all enabled', () => {
      const filters = createDefaultPriorityFilters();

      expect(filters.low).toBe(true);
      expect(filters.medium).toBe(true);
      expect(filters.high).toBe(true);
      expect(filters.urgent).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty task array', () => {
      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: [],
          searchTerm: '',
          statusFilters: createDefaultStatusFilters(),
          priorityFilters: createDefaultPriorityFilters(),
          sortBy: 'priority',
        })
      );

      expect(result.current.filteredTasks).toHaveLength(0);
      expect(result.current.totalCount).toBe(0);
      expect(result.current.filteredCount).toBe(0);
    });

    it('should handle tasks without assignee', () => {
      const tasksWithoutAssignee: LinkedTaskDto[] = [
        {
          taskId: 'task-005',
          messageId: null,
          task: {
            id: 'task-005',
            title: 'Unassigned task',
            status: 'todo',
            priority: 'medium',
            assignedTo: {
              id: '',
              name: null,
              email: null,
            },
          },
        },
      ];

      const { result } = renderHook(() =>
        useViewAllTasks({
          tasks: tasksWithoutAssignee,
          searchTerm: '',
          statusFilters: createDefaultStatusFilters(),
          priorityFilters: createDefaultPriorityFilters(),
          sortBy: 'assignee',
        })
      );

      expect(result.current.filteredTasks).toHaveLength(1);
    });
  });
});

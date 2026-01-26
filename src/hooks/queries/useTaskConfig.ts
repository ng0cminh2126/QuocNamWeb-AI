// useTaskConfig hook - Fetch task configuration (priorities, statuses, templates)

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  getTaskPriorities,
  getTaskStatuses,
  getChecklistTemplates,
} from '@/api/tasks.api';
import { taskKeys } from './keys/taskKeys';

/**
 * Hook to fetch task priorities
 * Returns list of available task priorities with their labels, levels, and colors
 */
export function useTaskPriorities(enabled = true) {
  return useQuery({
    queryKey: taskKeys.priorities(),
    queryFn: getTaskPriorities,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}

/**
 * Hook to fetch task statuses
 * Returns list of available task statuses with their labels, levels, and colors
 */
export function useTaskStatuses(enabled = true) {
  return useQuery({
    queryKey: taskKeys.statuses(),
    queryFn: getTaskStatuses,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}

/**
 * Hook to fetch checklist templates
 * Returns list of available checklist templates with their items
 */
export function useChecklistTemplates(enabled = true) {
  return useQuery({
    queryKey: taskKeys.templates(),
    queryFn: getChecklistTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}

/**
 * Combined hook to fetch all task configuration data at once
 * Useful for forms that need priorities, statuses, and templates
 */
export function useTaskConfig(enabled = true) {
  const priorities = useTaskPriorities(enabled);
  const statuses = useTaskStatuses(enabled);
  const templates = useChecklistTemplates(enabled);

  // Memoize arrays to prevent infinite loops in components that depend on these values
  const prioritiesData = useMemo(() => priorities.data ?? [], [priorities.data]);
  const statusesData = useMemo(() => statuses.data ?? [], [statuses.data]);
  const templatesData = useMemo(() => templates.data ?? [], [templates.data]);

  return {
    priorities: prioritiesData,
    statuses: statusesData,
    templates: templatesData,
    isLoading: priorities.isLoading || statuses.isLoading || templates.isLoading,
    isError: priorities.isError || statuses.isError || templates.isError,
    error: priorities.error || statuses.error || templates.error,
  };
}

/**
 * Helper function to find a status by code
 * e.g., findStatusByCode(statuses, "Todo")
 */
export function findStatusByCode(
  statuses: ReturnType<typeof useTaskStatuses>['data'],
  code: string
) {
  return statuses?.find(
    (status) => status.code?.toLowerCase() === code.toLowerCase()
  );
}

/**
 * Helper function to find a priority by code
 * e.g., findPriorityByCode(priorities, "Medium")
 */
export function findPriorityByCode(
  priorities: ReturnType<typeof useTaskPriorities>['data'],
  code: string
) {
  return priorities?.find(
    (priority) => priority.code?.toLowerCase() === code.toLowerCase()
  );
}

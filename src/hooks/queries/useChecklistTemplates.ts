// useChecklistTemplates - Hook to fetch checklist templates from Task API

import { useQuery } from '@tanstack/react-query';
import { getChecklistTemplates } from '@/api/tasks.api';
import type { CheckListTemplateResponse } from '@/types/tasks_api';

/**
 * Query key factory for checklist templates
 */
export const checklistTemplateKeys = {
  all: ['checklist-templates'] as const,
  lists: () => [...checklistTemplateKeys.all, 'list'] as const,
  list: () => [...checklistTemplateKeys.lists()] as const,
};

/**
 * Hook to fetch all checklist templates
 * Used for displaying available templates in task creation/editing
 * 
 * @returns Query result with checklist templates
 */
export function useChecklistTemplates() {
  return useQuery({
    queryKey: checklistTemplateKeys.list(),
    queryFn: getChecklistTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes - templates don't change often
  });
}

/**
 * Helper function to get template count
 */
export function getTemplateCount(
  data: CheckListTemplateResponse[] | undefined
): number {
  return data?.length ?? 0;
}

/**
 * Helper function to check if there are any templates
 */
export function hasTemplates(
  data: CheckListTemplateResponse[] | undefined
): boolean {
  return getTemplateCount(data) > 0;
}

/**
 * Helper function to find a template by ID
 */
export function findTemplateById(
  data: CheckListTemplateResponse[] | undefined,
  templateId: string
): CheckListTemplateResponse | undefined {
  return data?.find((template) => template.id === templateId);
}

/**
 * Helper function to get template items sorted by order
 */
export function getTemplateItems(template: CheckListTemplateResponse | undefined) {
  if (!template || !template.items) return [];
  
  return [...template.items].sort((a, b) => a.order - b.order);
}

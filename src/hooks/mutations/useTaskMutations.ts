// Task mutation hooks for creating, updating, and deleting tasks and checklist items
// Uses TanStack Query mutations with optimistic updates and cache invalidation

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCheckItem, toggleCheckItem, updateTaskStatus, updateChecklistTemplate } from '@/api/tasks.api';

/**
 * Hook to add a checklist item to a task
 * Invalidates tasks query cache on success
 */
export function useAddCheckItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, content, order }: { 
      taskId: string; 
      content: string; 
      order?: number 
    }) => addCheckItem(taskId, content, order),
    onSuccess: () => {
      // Invalidate and refetch tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['linkedTasks'] });
    },
  });
}

/**
 * Hook to toggle a checklist item's completion status
 * Invalidates tasks query cache on success
 */
export function useToggleCheckItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, itemId }: { 
      taskId: string; 
      itemId: string 
    }) => toggleCheckItem(taskId, itemId),
    onSuccess: () => {
      // Invalidate and refetch tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['linkedTasks'] });
    },
  });
}

/**
 * Hook to update task status
 * Invalidates tasks query cache on success
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { 
      taskId: string; 
      status: 'todo' | 'doing' | 'need_to_verified' | 'finished' 
    }) => updateTaskStatus(taskId, status),
    onSuccess: () => {
      // Invalidate and refetch tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['linkedTasks'] });
    },
  });
}

/**
 * Hook to update a checklist template
 * Invalidates checklist templates query cache on success
 */
export function useUpdateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      templateId, 
      name, 
      description, 
      items 
    }: { 
      templateId: string; 
      name: string; 
      description?: string | null; 
      items?: string[] | null; 
    }) => updateChecklistTemplate(templateId, { name, description, items }),
    onSuccess: () => {
      // Invalidate and refetch checklist templates
      queryClient.invalidateQueries({ queryKey: ['checklistTemplates'] });
    },
  });
}

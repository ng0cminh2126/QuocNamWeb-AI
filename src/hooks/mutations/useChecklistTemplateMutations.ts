// useChecklistTemplateMutations - Mutations for creating, updating, deleting checklist templates

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistTemplatesApi } from '@/api/checklist-templates.api';
import { checklistTemplateKeys } from '../queries/useChecklistTemplates';
import type { CreateCheckListTemplateRequest, UpdateCheckListTemplateRequest } from '@/types/checklist-templates';

/**
 * Hook to create a new checklist template
 * Invalidates checklist templates query after successful creation
 * 
 * @example
 * ```tsx
 * const createMutation = useCreateChecklistTemplate();
 * 
 * await createMutation.mutateAsync({
 *   name: "Kiểm hàng",
 *   description: "Checklist kiểm tra hàng hoá",
 *   conversationId: "conv-uuid",
 *   items: [
 *     { content: "Kiểm đếm số lượng", order: 0, isRequired: true },
 *     { content: "Kiểm tra chất lượng", order: 1, isRequired: false }
 *   ]
 * });
 * ```
 */
export function useCreateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCheckListTemplateRequest) =>
      checklistTemplatesApi.createTemplate(payload),
    onSuccess: (_, variables) => {
      // Invalidate templates list for this conversation
      if (variables.conversationId) {
        queryClient.invalidateQueries({
          queryKey: checklistTemplateKeys.list(variables.conversationId),
        });
      }
      // Also invalidate the all templates query
      queryClient.invalidateQueries({
        queryKey: checklistTemplateKeys.lists(),
      });
    },
  });
}

/**
 * Hook to update an existing checklist template (full update with PUT)
 * Invalidates checklist templates query after successful update
 * 
 * @example
 * ```tsx
 * const updateMutation = useUpdateChecklistTemplate();
 * 
 * await updateMutation.mutateAsync({
 *   templateId: "template-uuid",
 *   payload: {
 *     id: "template-uuid",
 *     name: "Kiểm hàng (updated)",
 *     description: "Updated description",
 *     conversationId: "conv-uuid",
 *     items: [...]
 *   }
 * });
 * ```
 */
export function useUpdateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, payload }: { templateId: string; payload: UpdateCheckListTemplateRequest }) =>
      checklistTemplatesApi.updateTemplate(templateId, payload),
    onSuccess: (_, variables) => {
      // Invalidate templates list for this conversation
      if (variables.payload.conversationId) {
        queryClient.invalidateQueries({
          queryKey: checklistTemplateKeys.list(variables.payload.conversationId),
        });
      }
      // Also invalidate the all templates query
      queryClient.invalidateQueries({
        queryKey: checklistTemplateKeys.lists(),
      });
    },
  });
}

/**
 * Hook to partially update an existing checklist template (PATCH)
 * Only updates name, description, conversationId - does NOT modify items
 * Invalidates checklist templates query after successful update
 * 
 * @example
 * ```tsx
 * const patchMutation = usePatchChecklistTemplate();
 * 
 * await patchMutation.mutateAsync({
 *   templateId: "template-uuid",
 *   payload: {
 *     name: "New name",
 *     description: "New description"
 *   },
 *   conversationId: "conv-uuid" // For cache invalidation
 * });
 * ```
 */
export function usePatchChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      templateId, 
      payload 
    }: { 
      templateId: string; 
      payload: Partial<Pick<UpdateCheckListTemplateRequest, 'name' | 'description' | 'conversationId'>>;
      conversationId?: string; // For cache invalidation
    }) => checklistTemplatesApi.patchTemplate(templateId, payload),
    onSuccess: (_, variables) => {
      // Invalidate templates list for this conversation
      const convId = variables.conversationId || variables.payload.conversationId;
      if (convId) {
        queryClient.invalidateQueries({
          queryKey: checklistTemplateKeys.list(convId),
        });
      }
      // Also invalidate the all templates query
      queryClient.invalidateQueries({
        queryKey: checklistTemplateKeys.lists(),
      });
    },
  });
}

/**
 * Hook to delete a checklist template
 * Invalidates checklist templates query after successful deletion
 * 
 * @example
 * ```tsx
 * const deleteMutation = useDeleteChecklistTemplate();
 * 
 * await deleteMutation.mutateAsync({
 *   templateId: "template-uuid",
 *   conversationId: "conv-uuid"
 * });
 * ```
 */
export function useDeleteChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId }: { templateId: string; conversationId?: string }) =>
      checklistTemplatesApi.deleteTemplate(templateId),
    onSuccess: (_, variables) => {
      // Invalidate templates queries
      if (variables.conversationId) {
        queryClient.invalidateQueries({
          queryKey: checklistTemplateKeys.list(variables.conversationId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: checklistTemplateKeys.lists(),
      });
    },
  });
}

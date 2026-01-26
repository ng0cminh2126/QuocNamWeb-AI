/**
 * React Query mutation hook for promoting group members to Admin
 * Includes optimistic update and rollback on error
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/api/groups.api';
import { groupMembersKeys } from '../queries/useGroupMembers';
import type { MemberDto } from '@/types/groups';

/**
 * Promote a member to Admin role with optimistic UI update
 * 
 * @param groupId - The group/conversation UUID
 * @returns Mutation object with mutate, mutateAsync, etc.
 * 
 * @example
 * ```tsx
 * const promoteMember = usePromoteGroupMember(groupId);
 * 
 * const handlePromote = async (userId: string) => {
 *   if (!confirm('Promote this member to Admin?')) return;
 *   
 *   try {
 *     await promoteMember.mutateAsync(userId);
 *     toast.success('Member promoted to Admin');
 *   } catch (error) {
 *     toast.error('Failed to promote member');
 *   }
 * };
 * ```
 */
export function usePromoteGroupMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      groupsApi.promoteGroupMember(groupId, userId),

    // Optimistic update - change role immediately
    onMutate: async (userId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: groupMembersKeys.list(groupId),
      });

      // Snapshot the previous value
      const previousMembers = queryClient.getQueryData<MemberDto[]>(
        groupMembersKeys.list(groupId)
      );

      // Optimistically update member role to ADM
      if (previousMembers) {
        queryClient.setQueryData<MemberDto[]>(
          groupMembersKeys.list(groupId),
          previousMembers.map((m) =>
            m.userId === userId ? { ...m, role: 'ADM' as const } : m
          )
        );
      }

      // Return context with snapshot for rollback
      return { previousMembers };
    },

    // Rollback on error - restore original role
    onError: (_err, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          groupMembersKeys.list(groupId),
          context.previousMembers
        );
      }
    },

    // Refetch on success to ensure consistency
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupMembersKeys.list(groupId),
      });
    },
  });
}

/**
 * React Query mutation hook for removing group members
 * Includes optimistic update and rollback on error
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/api/groups.api';
import { groupMembersKeys } from '../queries/useGroupMembers';
import type { MemberDto } from '@/types/groups';

/**
 * Remove a member from a group with optimistic UI update
 * 
 * @param groupId - The group/conversation UUID
 * @returns Mutation object with mutate, mutateAsync, etc.
 * 
 * @example
 * ```tsx
 * const removeMember = useRemoveGroupMember(groupId);
 * 
 * const handleRemove = async (userId: string) => {
 *   if (!confirm('Are you sure you want to remove this member?')) return;
 *   
 *   try {
 *     await removeMember.mutateAsync(userId);
 *     toast.success('Member removed successfully');
 *   } catch (error) {
 *     toast.error('Failed to remove member');
 *   }
 * };
 * ```
 */
export function useRemoveGroupMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      groupsApi.removeGroupMember(groupId, userId),

    // Optimistic update - remove member immediately
    onMutate: async (userId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: groupMembersKeys.list(groupId),
      });

      // Snapshot the previous value
      const previousMembers = queryClient.getQueryData<MemberDto[]>(
        groupMembersKeys.list(groupId)
      );

      // Optimistically remove member from cache
      if (previousMembers) {
        queryClient.setQueryData<MemberDto[]>(
          groupMembersKeys.list(groupId),
          previousMembers.filter((m) => m.userId !== userId)
        );
      }

      // Return context with snapshot for rollback
      return { previousMembers };
    },

    // Rollback on error - restore removed member
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

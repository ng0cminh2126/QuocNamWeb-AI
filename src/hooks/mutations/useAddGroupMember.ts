/**
 * React Query mutation hook for adding group members
 * Includes optimistic update and rollback on error
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/api/groups.api';
import { groupMembersKeys } from '../queries/useGroupMembers';
import type { AddMemberRequest, MemberDto } from '@/types/groups';

/**
 * Add a member to a group with optimistic UI update
 * 
 * @param groupId - The group/conversation UUID
 * @returns Mutation object with mutate, mutateAsync, etc.
 * 
 * @example
 * ```tsx
 * const addMember = useAddGroupMember(groupId);
 * 
 * const handleAdd = async (userId: string) => {
 *   try {
 *     await addMember.mutateAsync({ userId });
 *     toast.success('Member added successfully');
 *   } catch (error) {
 *     toast.error('Failed to add member');
 *   }
 * };
 * ```
 */
export function useAddGroupMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddMemberRequest) =>
      groupsApi.addGroupMember(groupId, payload),

    // Optimistic update - show member immediately
    onMutate: async (payload) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: groupMembersKeys.list(groupId),
      });

      // Snapshot the previous value
      const previousMembers = queryClient.getQueryData<MemberDto[]>(
        groupMembersKeys.list(groupId)
      );

      // Optimistically add placeholder member to cache
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

      // Return context with snapshot for rollback
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

    // Refetch on success to get real data
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupMembersKeys.list(groupId),
      });
    },
  });
}

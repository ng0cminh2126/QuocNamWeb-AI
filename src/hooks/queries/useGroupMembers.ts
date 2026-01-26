/**
 * React Query hook for group members
 * Handles fetching group member list
 */

import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '@/api/groups.api';

/**
 * Query key factory for group members
 * Ensures consistent cache keys across the app
 */
export const groupMembersKeys = {
  all: ['groupMembers'] as const,
  lists: () => [...groupMembersKeys.all, 'list'] as const,
  list: (groupId: string) => [...groupMembersKeys.lists(), groupId] as const,
};

/**
 * Fetch all members of a group conversation
 * 
 * @param groupId - The group/conversation UUID
 * @returns Query result with members array
 * 
 * @example
 * ```tsx
 * const { data: members, isLoading, error } = useGroupMembers(groupId);
 * 
 * if (isLoading) return <LoadingSkeleton />;
 * if (error) return <ErrorMessage error={error} />;
 * 
 * // Group members by role
 * const owners = members?.filter(m => m.role === 'OWN') ?? [];
 * const admins = members?.filter(m => m.role === 'ADM') ?? [];
 * const regularMembers = members?.filter(m => m.role === 'MBR') ?? [];
 * 
 * return (
 *   <>
 *     <MemberSection title="Owners" members={owners} />
 *     <MemberSection title="Admins" members={admins} />
 *     <MemberSection title="Members" members={regularMembers} />
 *   </>
 * );
 * ```
 */
export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: groupMembersKeys.list(groupId),
    queryFn: () => groupsApi.getGroupMembers(groupId),
    enabled: !!groupId, // Only fetch when groupId is provided
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });
}

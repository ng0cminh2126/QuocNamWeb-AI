/**
 * React Query hook for fetching users
 * Reference: Identity API - /api/v1/users
 */

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/api/users.api";
import type { GetUsersParams } from "@/types/users";

export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params: GetUsersParams) => [...usersKeys.lists(), params] as const,
};

export function useUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => getUsers(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

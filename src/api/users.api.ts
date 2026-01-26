/**
 * Users API Client
 * Reference: Identity swagger.json - /api/v1/users endpoints
 */

import { identityApiClient } from "./identityClient";
import type { PagedUserProfileResponse, GetUsersParams } from "@/types/users";

/**
 * Get paginated list of users
 * GET /api/v1/users
 */
export async function getUsers(params: GetUsersParams = {}): Promise<PagedUserProfileResponse> {
  const { page = 1, pageSize = 50 } = params;
  
  const response = await identityApiClient.get<PagedUserProfileResponse>("/api/v1/users", {
    params: { page, pageSize },
  });
  
  return response.data;
}

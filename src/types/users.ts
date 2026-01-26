/**
 * User types from Identity API
 * Reference: Identity swagger.json - /api/v1/users endpoints
 */

export interface UserProfileResponse {
  id: string; // uuid format
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string; // date-time
  updatedAt: string | null; // date-time
}

export interface PagedUserProfileResponse {
  items: UserProfileResponse[] | null;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
}

/**
 * Type definitions for group members and member management
 * Used for group user management features
 */

/**
 * Member role types
 * MBR = Member, ADM = Admin, OWN = Owner
 */
export type MemberRole = 'MBR' | 'ADM' | 'OWN';

/**
 * User information data transfer object
 * Extended user details for member display
 */
export interface UserInfoDto {
  /** User ID (UUID) */
  id: string;
  /** Username */
  userName: string;
  /** Full display name */
  fullName: string;
  /** User identifier (email or username) */
  identifier: string;
  /** User roles (comma-separated string) */
  roles: string;
  /** Email address (optional) */
  email?: string;
  /** Avatar URL (optional) */
  avatarUrl?: string | null;
}

/**
 * Group member data transfer object
 * Represents a member in a group conversation
 */
export interface MemberDto {
  /** User ID (UUID) */
  userId: string;
  /** Display name */
  userName: string;
  /** Member role in group */
  role: MemberRole;
  /** Join timestamp (ISO 8601) */
  joinedAt: string;
  /** Is user muted in this group */
  isMuted: boolean;
  /** Extended user information */
  userInfo: UserInfoDto;
}

/**
 * Request to add a member to a group
 */
export interface AddMemberRequest {
  /** User ID to add (UUID) */
  userId: string;
}

/**
 * Response after adding a member
 */
export interface AddMemberResponse extends MemberDto {}

/**
 * Response after removing a member
 */
export interface RemoveMemberResponse {
  /** Success message */
  message: string;
  /** Removed user ID (UUID) */
  userId: string;
}

/**
 * Response after promoting a member
 */
export interface PromoteMemberResponse {
  /** Success message */
  message: string;
  /** Promoted user ID (UUID) */
  userId: string;
  /** New role assigned */
  newRole: MemberRole;
}

/**
 * API Response Types
 */

/** Response type for GET /api/groups/{id}/members */
export type GetGroupMembersResponse = MemberDto[];

/**
 * Helper functions for role checks
 */

/**
 * Check if role is owner
 */
export function isOwner(role: MemberRole): boolean {
  return role === 'OWN';
}

/**
 * Check if role is admin
 */
export function isAdmin(role: MemberRole): boolean {
  return role === 'ADM';
}

/**
 * Check if role is regular member
 */
export function isMember(role: MemberRole): boolean {
  return role === 'MBR';
}

/**
 * Check if role can manage members (Admin or Owner)
 */
export function canManageMembers(role: MemberRole): boolean {
  return role === 'ADM' || role === 'OWN';
}

/**
 * Check if role can promote members (Owner only)
 */
export function canPromoteMembers(role: MemberRole): boolean {
  return role === 'OWN';
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: MemberRole): string {
  switch (role) {
    case 'OWN':
      return 'Owner';
    case 'ADM':
      return 'Admin';
    case 'MBR':
      return 'Member';
    default:
      return 'Unknown';
  }
}

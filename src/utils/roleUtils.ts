import { useAuthStore } from '@/stores/authStore';

/**
 * Role hierarchy for permission checks
 * Higher number = higher priority
 */
export const ROLE_HIERARCHY = {
  Admin: 3,
  Leader: 2,
  Staff: 1,
} as const;

export type AppRole = keyof typeof ROLE_HIERARCHY;

/**
 * Check if user has a specific role
 * Case-insensitive comparison
 * 
 * @param role - The role to check for
 * @returns true if user has the role, false otherwise
 * 
 * @example
 * hasRole('Admin') // true if user.roles includes 'admin', 'Admin', or 'ADMIN'
 */
export function hasRole(role: AppRole): boolean {
  const user = useAuthStore.getState().user;
  if (!user?.roles) return false;
  
  return user.roles.some(r => 
    r.toLowerCase() === role.toLowerCase()
  );
}

/**
 * Check if user has any of the specified roles
 * 
 * @param roles - One or more roles to check
 * @returns true if user has at least one of the roles
 * 
 * @example
 * hasAnyRole('Admin', 'Leader') // true if user has either role
 */
export function hasAnyRole(...roles: AppRole[]): boolean {
  return roles.some(role => hasRole(role));
}

/**
 * Check if user has all specified roles
 * 
 * @param roles - One or more roles to check
 * @returns true if user has all of the roles
 * 
 * @example
 * hasAllRoles('Admin', 'Staff') // true only if user has both roles
 */
export function hasAllRoles(...roles: AppRole[]): boolean {
  return roles.every(role => hasRole(role));
}

/**
 * Check if user has leader-level permissions
 * Returns true for Admin or Leader roles
 * 
 * This is the primary function to replace `viewMode === "lead"` checks
 * 
 * @returns true if user is Admin or Leader
 * 
 * @example
 * // Replace: viewMode === "lead" && <LeaderFeature />
 * // With: hasLeaderPermissions() && <LeaderFeature />
 */
export function hasLeaderPermissions(): boolean {
  return hasAnyRole('Admin', 'Leader');
}

/**
 * Check if user has staff-only permissions
 * Returns true for Staff role WITHOUT Admin/Leader
 * 
 * This replaces `viewMode === "staff"` checks
 * 
 * @returns true if user is Staff without Admin/Leader roles
 * 
 * @example
 * // Replace: viewMode === "staff" && <StaffFeature />
 * // With: hasStaffPermissions() && <StaffFeature />
 */
export function hasStaffPermissions(): boolean {
  return !hasLeaderPermissions();
}

/**
 * Get current user roles from auth storage
 * Returns normalized roles: ['Admin', 'Leader', 'Staff']
 * 
 * @returns Array of normalized role names
 */
export function getCurrentUserRoles(): AppRole[] {
  const user = useAuthStore.getState().user;
  if (!user?.roles) return [];
  
  return user.roles
    .map(r => {
      const normalized = r.toLowerCase();
      if (normalized === 'admin') return 'Admin';
      if (normalized === 'leader') return 'Leader';
      if (normalized === 'staff') return 'Staff';
      return null;
    })
    .filter((r): r is AppRole => r !== null);
}

/**
 * Get highest priority role for current user
 * Returns the role with highest hierarchy value
 * 
 * @returns The highest priority role, or null if user has no roles
 */
export function getHighestRole(): AppRole | null {
  const roles = getCurrentUserRoles();
  if (roles.length === 0) return null;
  
  return roles.reduce((highest, current) => {
    return ROLE_HIERARCHY[current] > ROLE_HIERARCHY[highest] ? current : highest;
  });
}

/**
 * Determine view mode based on user roles
 * For backward compatibility with existing UI
 * 
 * @deprecated Will be removed after full migration
 * @returns 'lead' for Admin/Leader, 'staff' for Staff only
 */
export function getViewModeFromRoles(): 'lead' | 'staff' {
  return hasLeaderPermissions() ? 'lead' : 'staff';
}

/**
 * Check if user has permission for a specific action
 * Based on role hierarchy
 * 
 * @param requiredRole - Minimum role required
 * @returns true if user's highest role >= required role
 * 
 * @example
 * hasPermissionLevel('Leader') // true for Admin or Leader
 * hasPermissionLevel('Admin') // true only for Admin
 */
export function hasPermissionLevel(requiredRole: AppRole): boolean {
  const userHighestRole = getHighestRole();
  if (!userHighestRole) return false;
  
  return ROLE_HIERARCHY[userHighestRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Client-safe permissions and role utilities
 * These can be imported in both client and server components
 */

import { UserRole } from '@prisma/client';

// Role hierarchy for access control - higher number = higher access
export const roleHierarchy: Record<UserRole, number> = {
    CITIZEN_DEV: 1,
    EXPERT: 2,
    MANAGER: 3,
    PILOT: 4,
    SPONSOR: 5,
};

// Check if user has at least the minimum required role
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
    return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}

// Permission matrix for different actions
export const rolePermissions: Record<UserRole, {
    canCreateSOP: boolean;
    canApproveSOP: boolean;
    canDeleteSOP: boolean;
    canManageAgents: boolean;
    canVoteCouncil: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canExportData: boolean;
    // Meta Admin permissions
    canAccessMetaAdmin: boolean;
    canManageApiKeys: boolean;
    canEditStyles: boolean;
    canViewChatHistory: boolean;
    canEditPrompts: boolean;
    canManageFeatureFlags: boolean;
}> = {
    SPONSOR: {
        canCreateSOP: true,
        canApproveSOP: true,
        canDeleteSOP: true,
        canManageAgents: true,
        canVoteCouncil: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canExportData: true,
        // Meta Admin - full access
        canAccessMetaAdmin: true,
        canManageApiKeys: true,
        canEditStyles: true,
        canViewChatHistory: true,
        canEditPrompts: true,
        canManageFeatureFlags: true,
    },
    PILOT: {
        canCreateSOP: true,
        canApproveSOP: true,
        canDeleteSOP: true,
        canManageAgents: true,
        canVoteCouncil: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canExportData: true,
        // Meta Admin - view access, limited editing
        canAccessMetaAdmin: true,
        canManageApiKeys: false,
        canEditStyles: true,
        canViewChatHistory: true,
        canEditPrompts: false,
        canManageFeatureFlags: true,
    },
    MANAGER: {
        canCreateSOP: true,
        canApproveSOP: true,
        canDeleteSOP: false,
        canManageAgents: true,
        canVoteCouncil: true,
        canManageUsers: false,
        canViewAnalytics: true,
        canExportData: true,
        // Meta Admin - analytics only
        canAccessMetaAdmin: true,
        canManageApiKeys: false,
        canEditStyles: false,
        canViewChatHistory: false,
        canEditPrompts: false,
        canManageFeatureFlags: false,
    },
    EXPERT: {
        canCreateSOP: true,
        canApproveSOP: false,
        canDeleteSOP: false,
        canManageAgents: false,
        canVoteCouncil: true,
        canManageUsers: false,
        canViewAnalytics: false,
        canExportData: false,
        // Meta Admin - no access
        canAccessMetaAdmin: false,
        canManageApiKeys: false,
        canEditStyles: false,
        canViewChatHistory: false,
        canEditPrompts: false,
        canManageFeatureFlags: false,
    },
    CITIZEN_DEV: {
        canCreateSOP: false,
        canApproveSOP: false,
        canDeleteSOP: false,
        canManageAgents: false,
        canVoteCouncil: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canExportData: false,
        // Meta Admin - no access
        canAccessMetaAdmin: false,
        canManageApiKeys: false,
        canEditStyles: false,
        canViewChatHistory: false,
        canEditPrompts: false,
        canManageFeatureFlags: false,
    },
};

// Helper to check specific permission
export function hasPermission(
    userRole: UserRole,
    permission: keyof typeof rolePermissions[UserRole]
): boolean {
    return rolePermissions[userRole]?.[permission] ?? false;
}

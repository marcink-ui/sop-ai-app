/**
 * Client-safe permissions and role utilities
 * These can be imported in both client and server components
 * 
 * ROLE MODEL (3 axes):
 * ┌─────────────────────────────────────────────────────┐
 * │ INTERNAL (company-scoped, hierarchical)             │
 * │   CITIZEN_DEV → EXPERT → MANAGER → PILOT → SPONSOR │
 * ├─────────────────────────────────────────────────────┤
 * │ EXTERNAL (multi-company, flat)                      │
 * │   PARTNER (CONSULTANT / FACILITATOR / AUDITOR)      │
 * ├─────────────────────────────────────────────────────┤
 * │ PLATFORM (global, cross-company)                    │
 * │   META_ADMIN                                        │
 * └─────────────────────────────────────────────────────┘
 */

import { UserRole } from '@prisma/client';

// Internal company hierarchy levels
// PARTNER is NOT in this hierarchy — it's a separate access axis
const INTERNAL_HIERARCHY: Record<UserRole, number> = {
    CITIZEN_DEV: 1,
    EXPERT: 2,
    MANAGER: 3,
    PILOT: 4,
    SPONSOR: 5,
    PARTNER: -1,    // Not in internal hierarchy
    META_ADMIN: 99, // Platform admin sees everything
};

/**
 * Check if user has at least the minimum required INTERNAL role.
 * PARTNER is treated specially:
 * - PARTNER does NOT inherit internal hierarchy (level -1)
 * - META_ADMIN always passes (level 99)
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
    const user: string = userRole;
    const min: string = minimumRole;

    // META_ADMIN always has access
    if (user === 'META_ADMIN') return true;

    // If checking for PARTNER specifically, only PARTNER and META_ADMIN match
    if (min === 'PARTNER') return user === 'PARTNER';

    // If checking for META_ADMIN specifically, only META_ADMIN matches
    if (min === 'META_ADMIN') return false; // already handled above

    // PARTNER cannot access internal hierarchy pages
    if (user === 'PARTNER') return false;

    // Standard internal hierarchy check
    return INTERNAL_HIERARCHY[userRole] >= INTERNAL_HIERARCHY[minimumRole];
}

// Role hierarchy export for backward compatibility
export const roleHierarchy = INTERNAL_HIERARCHY;

// Permission matrix for different actions
export const rolePermissions: Record<UserRole, {
    // SOP operations
    canCreateSOP: boolean;
    canApproveSOP: boolean;
    canDeleteSOP: boolean;
    // AI & Agents
    canManageAgents: boolean;
    // Governance
    canVoteCouncil: boolean;
    canManageUsers: boolean;
    // Analytics & Data
    canViewAnalytics: boolean;
    canExportData: boolean;
    // Meta Admin / Backoffice
    canAccessMetaAdmin: boolean;
    canAccessBackoffice: boolean;
    canManageApiKeys: boolean;
    canEditStyles: boolean;
    canViewChatHistory: boolean;
    canEditPrompts: boolean;
    canManageFeatureFlags: boolean;
    // Partner Portal
    canAccessPartnerPortal: boolean;
    canManageCompanies: boolean;
    // Canvas
    canAccessCanvas: boolean;
}> = {
    META_ADMIN: {
        canCreateSOP: true,
        canApproveSOP: true,
        canDeleteSOP: true,
        canManageAgents: true,
        canVoteCouncil: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canExportData: true,
        canAccessMetaAdmin: true,
        canAccessBackoffice: true,
        canManageApiKeys: true,
        canEditStyles: true,
        canViewChatHistory: true,
        canEditPrompts: true,
        canManageFeatureFlags: true,
        canAccessPartnerPortal: true,
        canManageCompanies: true,
        canAccessCanvas: true,
    },
    PARTNER: {
        // PARTNER: External consultant — sees only Partner Portal + assigned companies
        canCreateSOP: false,      // Can't create SOPs in internal system
        canApproveSOP: false,
        canDeleteSOP: false,
        canManageAgents: false,
        canVoteCouncil: false,     // Not a company member
        canManageUsers: false,
        canViewAnalytics: true,    // Cross-company analytics in Partner Portal
        canExportData: true,       // Can export reports for clients
        canAccessMetaAdmin: false,
        canAccessBackoffice: false,
        canManageApiKeys: false,
        canEditStyles: false,
        canViewChatHistory: false,
        canEditPrompts: false,
        canManageFeatureFlags: false,
        canAccessPartnerPortal: true,  // ← primary access
        canManageCompanies: true,      // ← manages client companies
        canAccessCanvas: false,
    },
    SPONSOR: {
        // SPONSOR: Board / Zarząd — full company-scoped access
        canCreateSOP: true,
        canApproveSOP: true,
        canDeleteSOP: true,
        canManageAgents: true,
        canVoteCouncil: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canExportData: true,
        canAccessMetaAdmin: false, // Only META_ADMIN has platform-level
        canAccessBackoffice: true, // Can manage company backoffice
        canManageApiKeys: true,
        canEditStyles: true,
        canViewChatHistory: true,
        canEditPrompts: true,
        canManageFeatureFlags: true,
        canAccessPartnerPortal: false,
        canManageCompanies: false,
        canAccessCanvas: true,
    },
    PILOT: {
        // PILOT: COO / Transformation Lead — operations + KPIs
        canCreateSOP: true,
        canApproveSOP: true,
        canDeleteSOP: true,
        canManageAgents: true,
        canVoteCouncil: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canExportData: true,
        canAccessMetaAdmin: false,
        canAccessBackoffice: true,
        canManageApiKeys: false,
        canEditStyles: true,
        canViewChatHistory: true,
        canEditPrompts: false,
        canManageFeatureFlags: true,
        canAccessPartnerPortal: false,
        canManageCompanies: false,
        canAccessCanvas: true,
    },
    MANAGER: {
        // MANAGER: Department Manager — department-scoped, canvas, council voting
        canCreateSOP: true,
        canApproveSOP: true,
        canDeleteSOP: false,
        canManageAgents: true,
        canVoteCouncil: true,
        canManageUsers: false,
        canViewAnalytics: true,
        canExportData: true,
        canAccessMetaAdmin: false,
        canAccessBackoffice: false,  // No backoffice
        canManageApiKeys: false,
        canEditStyles: false,
        canViewChatHistory: false,
        canEditPrompts: false,
        canManageFeatureFlags: false,
        canAccessPartnerPortal: false,
        canManageCompanies: false,
        canAccessCanvas: true,       // ← primary tool
    },
    EXPERT: {
        // EXPERT: Knowledge Owner — SOP creation + council voting
        canCreateSOP: true,
        canApproveSOP: false,
        canDeleteSOP: false,
        canManageAgents: false,
        canVoteCouncil: true,
        canManageUsers: false,
        canViewAnalytics: false,
        canExportData: false,
        canAccessMetaAdmin: false,
        canAccessBackoffice: false,
        canManageApiKeys: false,
        canEditStyles: false,
        canViewChatHistory: false,
        canEditPrompts: false,
        canManageFeatureFlags: false,
        canAccessPartnerPortal: false,
        canManageCompanies: false,
        canAccessCanvas: true,       // ← can view Canvas results
    },
    CITIZEN_DEV: {
        // CITIZEN_DEV: Base role — read access, innovation mode
        canCreateSOP: false,
        canApproveSOP: false,
        canDeleteSOP: false,
        canManageAgents: false,
        canVoteCouncil: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canExportData: false,
        canAccessMetaAdmin: false,
        canAccessBackoffice: false,
        canManageApiKeys: false,
        canEditStyles: false,
        canViewChatHistory: false,
        canEditPrompts: false,
        canManageFeatureFlags: false,
        canAccessPartnerPortal: false,
        canManageCompanies: false,
        canAccessCanvas: true,       // ← can view Canvas results
    },
};

// Helper to check specific permission
export function hasPermission(
    userRole: UserRole,
    permission: keyof typeof rolePermissions[UserRole]
): boolean {
    return rolePermissions[userRole]?.[permission] ?? false;
}

/**
 * System-level configuration
 * Meta Admin access is separate from company roles
 */

// System administrators who can access Meta Admin
// These are platform owners, not company-level admins
export const SYSTEM_ADMIN_EMAILS = [
    'marcin@synthetichumans.io',
    'marcin.kapusta@synthetichumans.io',
    // Add more system admin emails as needed
];

// Check if user email has system admin access
export function isSystemAdmin(email: string | null | undefined): boolean {
    if (!email) return false;
    return SYSTEM_ADMIN_EMAILS.includes(email.toLowerCase());
}

// Environment-based override for development
export function isDevMode(): boolean {
    return process.env.NODE_ENV === 'development';
}

// Combined check - system admin OR dev mode
export function hasMetaAdminAccess(email: string | null | undefined): boolean {
    return isSystemAdmin(email);
}

/**
 * Auth re-exports — backward compatibility module
 * 
 * Most code now imports directly from:
 *   - '@/lib/auth-server' (server-side: getSession)
 *   - '@/lib/auth-client' (client-side: useSession, signIn, signOut)
 * 
 * This file re-exports role-based helper functions that are used
 * throughout the codebase and don't depend on NextAuth.
 */

export { hasPermission, hasMinimumRole, rolePermissions } from '@/lib/auth/permissions';

// Re-export session getter for convenience
export { getSession } from '@/lib/auth-server';

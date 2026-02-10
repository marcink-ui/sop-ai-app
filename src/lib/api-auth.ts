/**
 * API route auth helpers – DRY session + role/permission guards.
 * 
 * Usage:
 *   const guard = await requireAuth();             // just checks auth
 *   const guard = await requireRole('MANAGER');     // checks role hierarchy
 *   const guard = await requirePermission('canManageAgents'); // checks permission matrix
 * 
 *   if (guard.error) return guard.error;
 *   const { session } = guard;
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { hasMinimumRole, hasPermission, rolePermissions } from '@/lib/auth/permissions';
import { UserRole } from '@prisma/client';

interface AuthSuccess {
    session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
    error?: never;
}

interface AuthFailure {
    session?: never;
    error: NextResponse;
}

type AuthResult = AuthSuccess | AuthFailure;

/**
 * Require authenticated session. Returns 401 if not logged in.
 */
export async function requireAuth(): Promise<AuthResult> {
    const session = await getSession();
    if (!session) {
        return {
            error: NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            ),
        };
    }
    return { session };
}

/**
 * Require minimum role in internal hierarchy. Returns 403 if insufficient.
 */
export async function requireRole(minimumRole: UserRole): Promise<AuthResult> {
    const result = await requireAuth();
    if (result.error) return result;

    const userRole = result.session.user.role as UserRole;
    if (!hasMinimumRole(userRole, minimumRole)) {
        return {
            error: NextResponse.json(
                { error: 'Forbidden: insufficient role' },
                { status: 403 }
            ),
        };
    }
    return result;
}

/**
 * Require specific permission from the permission matrix. Returns 403 if denied.
 */
export async function requirePermission(
    permission: keyof (typeof rolePermissions)[UserRole]
): Promise<AuthResult> {
    const result = await requireAuth();
    if (result.error) return result;

    const userRole = result.session.user.role as UserRole;
    if (!hasPermission(userRole, permission)) {
        return {
            error: NextResponse.json(
                { error: `Forbidden: missing permission '${permission}'` },
                { status: 403 }
            ),
        };
    }
    return result;
}

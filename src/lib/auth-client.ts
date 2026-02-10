/**
 * better-auth client instance
 * 
 * Replaces next-auth/react's useSession, signIn, signOut.
 * 
 * Import:
 *   import { useSession, signIn, signOut } from '@/lib/auth-client';
 *   const { data: session, isPending } = useSession();
 *   session?.user?.role // ✅ typed
 */

'use client';

import { createAuthClient } from 'better-auth/react';
import type { AppUser } from '@/lib/auth-server';

const client = createAuthClient({});

/**
 * Extended session data with custom user fields.
 * Matches the shape returned by better-auth's useSession hook.
 */
export interface ClientSession {
    user: AppUser;
    session: {
        id: string;
        userId: string;
        token: string;
        expiresAt: Date;
    };
}

/**
 * Typed useSession hook — wraps better-auth's useSession
 * and adds proper types for our custom user fields.
 * 
 * NextAuth compat: returns { data, isPending, error }
 * - data?.user.role ✅
 * - data?.user.organizationId ✅
 */
export function useSession() {
    const result = client.useSession();
    return result as {
        data: ClientSession | null;
        isPending: boolean;
        isRefetching: boolean;
        error: Error | null;
    };
}

export const { signIn, signUp, signOut } = client;

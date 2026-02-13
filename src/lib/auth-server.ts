/**
 * better-auth server instance
 * 
 * Replaces NextAuth's authOptions. Uses Prisma adapter with custom user fields.
 * Environment: falls back to NEXTAUTH_SECRET / NEXTAUTH_URL for backward compat.
 */

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Extended user type with custom fields from our Prisma schema.
 * better-auth returns these fields at runtime (via additionalFields),
 * but TypeScript doesn't infer them, so we define them here.
 */
export type UserRole = 'META_ADMIN' | 'PARTNER' | 'SPONSOR' | 'PILOT' | 'MANAGER' | 'EXPERT' | 'CITIZEN_DEV';

export interface AppUser {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    role: UserRole;
    organizationId: string;
    departmentId?: string | null;
    [key: string]: unknown; // Index signature for generic access
}

export interface AppSession {
    user: AppUser;
    session: {
        id: string;
        userId: string;
        token: string;
        expiresAt: Date;
        ipAddress?: string | null;
        userAgent?: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),

    secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL,

    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
        password: {
            hash: async (password: string) => bcrypt.hash(password, 12),
            verify: async (data: { hash: string; password: string }) => bcrypt.compare(data.password, data.hash),
        },
    },

    // OAuth social login providers — conditionally enabled via env vars
    socialProviders: {
        ...(process.env.GOOGLE_CLIENT_ID && {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            },
        }),
        ...(process.env.MICROSOFT_CLIENT_ID && {
            microsoft: {
                clientId: process.env.MICROSOFT_CLIENT_ID,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
                tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
            },
        }),
    },

    session: {
        expiresIn: 30 * 24 * 60 * 60, // 30 days
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        },
    },

    user: {
        additionalFields: {
            role: {
                type: 'string',
                defaultValue: 'CITIZEN_DEV',
                input: false,
            },
            organizationId: {
                type: 'string',
                required: true,
                input: false,
            },
            hashedPassword: {
                type: 'string',
                required: false,
                input: false,
            },
            departmentId: {
                type: 'string',
                required: false,
                input: false,
            },
        },
    },

    // Prisma handles ID generation via @default(cuid())
});

/**
 * Server-side session getter — replaces getServerSession(authOptions)
 * 
 * Returns typed session with our custom user fields (role, organizationId, etc.)
 * 
 * Usage in API routes and server components:
 *   import { getSession } from '@/lib/auth-server';
 *   const session = await getSession();
 *   if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   session.user.role // ✅ typed
 */
export async function getSession(): Promise<AppSession | null> {
    const { headers } = await import('next/headers');
    const h = await headers();
    const result = await auth.api.getSession({ headers: h });
    return result as AppSession | null;
}

/**
 * Get the effective organization ID, accounting for Partner/Meta Admin context switching.
 * 
 * For PARTNER/META_ADMIN roles: checks for a `vos-active-org` cookie override.
 * For all other roles: returns the user's own organizationId.
 * 
 * Use this in ALL API routes instead of `session.user.organizationId` directly.
 */
export async function getEffectiveOrganizationId(session: AppSession): Promise<string> {
    const role = session.user.role;

    // Only PARTNER and META_ADMIN can switch context
    if (role === 'PARTNER' || role === 'META_ADMIN') {
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const override = cookieStore.get('vos-active-org')?.value;
            if (override) {
                return override;
            }
        } catch {
            // Cookie read failed (e.g. in some edge runtime contexts), fall through
        }
    }

    return session.user.organizationId;
}


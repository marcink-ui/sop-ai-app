import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            image?: string | null;
            role: UserRole;
            organizationId: string;
            organizationName: string;
        };
    }

    interface User {
        role: UserRole;
        organizationId: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: UserRole;
        organizationId: string;
        organizationName: string;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],

    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { organization: true },
                });

                if (!user || !user.hashedPassword) {
                    throw new Error('User not found');
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword
                );

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    organizationId: user.organizationId,
                };
            },
        }),
    ],

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    pages: {
        signIn: '/auth/login',
        signOut: '/auth/logout',
        error: '/auth/error',
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.organizationId = user.organizationId;

                // Get organization name
                const org = await prisma.organization.findUnique({
                    where: { id: user.organizationId },
                    select: { name: true },
                });
                token.organizationName = org?.name || '';
            }
            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.organizationId = token.organizationId;
                session.user.organizationName = token.organizationName;
            }
            return session;
        },
    },

    debug: process.env.NODE_ENV === 'development',
};

// Import and re-export client-safe role utilities from permissions module
import { hasMinimumRole as _hasMinimumRole } from './auth/permissions';
export { roleHierarchy, rolePermissions, hasPermission } from './auth/permissions';
export const hasMinimumRole = _hasMinimumRole;

export function canAccessDepartment(
    userRole: UserRole,
    userDepartmentId: string | null,
    targetDepartmentId: string | null
): boolean {
    // Sponsors and Pilots can access all departments
    if (hasMinimumRole(userRole, 'PILOT')) {
        return true;
    }

    // Managers can only access their department
    if (userRole === 'MANAGER') {
        return userDepartmentId === targetDepartmentId;
    }

    // Experts and Citizen Devs - read access to all, but scoped writes
    return true;
}

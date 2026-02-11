import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

/**
 * GET /api/user/organization
 * Returns the current user's organization name.
 * Used by Sidebar to show dynamic org name instead of "Business OS".
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ name: null }, { status: 401 });
        }

        const orgId = (session.user as Record<string, unknown>).organizationId as string | undefined;
        if (!orgId) {
            return NextResponse.json({ name: null });
        }

        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { name: true },
        });

        return NextResponse.json({ name: org?.name || null });
    } catch (error) {
        console.error('[API] Failed to fetch organization:', error);
        return NextResponse.json({ name: null }, { status: 500 });
    }
}

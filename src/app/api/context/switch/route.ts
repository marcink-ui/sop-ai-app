import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'vos-active-org';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// POST /api/context/switch — switch active organization (Partner / Meta Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = session.user.role;
        if (role !== 'PARTNER' && role !== 'META_ADMIN') {
            return NextResponse.json({ error: 'Only PARTNER and META_ADMIN can switch context' }, { status: 403 });
        }

        const { organizationId } = await request.json();

        if (!organizationId) {
            return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
        }

        // Verify org exists
        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { id: true, name: true, slug: true },
        });

        if (!org) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // For PARTNER, verify they have access to this org
        if (role === 'PARTNER') {
            const access = await prisma.partnerOrganization.findFirst({
                where: {
                    userId: session.user.id,
                    organizationId: organizationId,
                },
            });
            if (!access) {
                return NextResponse.json({ error: 'No access to this organization' }, { status: 403 });
            }
        }

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, organizationId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE,
            path: '/',
        });

        return NextResponse.json({ success: true, organization: org });
    } catch (error) {
        console.error('[Context Switch] POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET /api/context/switch — get current active organization
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = session.user.role;
        if (role !== 'PARTNER' && role !== 'META_ADMIN') {
            // Regular users always use their own org
            return NextResponse.json({
                organizationId: session.user.organizationId,
                canSwitch: false,
            });
        }

        const cookieStore = await cookies();
        const activeOrgId = cookieStore.get(COOKIE_NAME)?.value || session.user.organizationId;

        const org = await prisma.organization.findUnique({
            where: { id: activeOrgId },
            select: { id: true, name: true, slug: true },
        });

        return NextResponse.json({
            organizationId: activeOrgId,
            organization: org,
            canSwitch: true,
        });
    } catch (error) {
        console.error('[Context Switch] GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/context/switch — clear override (go back to own org)
export async function DELETE() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cookieStore = await cookies();
        cookieStore.delete(COOKIE_NAME);

        return NextResponse.json({
            success: true,
            organizationId: session.user.organizationId,
        });
    } catch (error) {
        console.error('[Context Switch] DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

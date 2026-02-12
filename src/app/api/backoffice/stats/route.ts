import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgId = session.user.organizationId;
        if (!orgId) {
            return NextResponse.json({ sops: 0, activeSessions: 0, tokensToday: 0, councilPending: 0 });
        }

        const [sopCount, sessionCount, councilPending, userCount] = await Promise.all([
            prisma.sOP.count({ where: { organizationId: orgId } }),
            prisma.chatSession.count({
                where: {
                    user: { organizationId: orgId },
                    updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
            }),
            prisma.councilRequest.count({
                where: { organizationId: orgId, status: 'PENDING' },
            }),
            prisma.user.count({ where: { organizationId: orgId } }),
        ]);

        return NextResponse.json({
            sops: sopCount,
            activeSessions: sessionCount,
            councilPending,
            users: userCount,
        });
    } catch (error) {
        console.error('Failed to fetch backoffice stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}

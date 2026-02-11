import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user || session.user.role !== 'META_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [orgCount, userCount, sopCount, agentCount, phaseCount] = await Promise.all([
            prisma.organization.count(),
            prisma.user.count(),
            prisma.sOP.count(),
            prisma.agent.count(),
            prisma.transformationPhase.count(),
        ]);

        return NextResponse.json({
            organizations: orgCount,
            users: userCount,
            sops: sopCount,
            agents: agentCount,
            transformationPhases: phaseCount,
        });
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}

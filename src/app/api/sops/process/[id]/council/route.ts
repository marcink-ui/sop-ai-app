import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { pipelineNotifications } from '@/lib/notifications';

// ============================================================================
// POST /api/sops/process/[id]/council — Submit SOP to Council for approval
// ============================================================================
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Get SOP
        const sop = await prisma.sOP.findFirst({
            where: { id, organizationId: session.user.organizationId },
            include: { processLogs: { where: { status: 'completed' } } },
        });

        if (!sop) {
            return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
        }

        if (sop.status !== 'IN_PROGRESS' && sop.status !== 'RETURNED') {
            return NextResponse.json(
                { error: `Cannot submit SOP in status ${sop.status}` },
                { status: 400 },
            );
        }

        // Create Council Request
        const councilRequest = await prisma.councilRequest.create({
            data: {
                title: `Nowy SOP: ${sop.title}`,
                type: 'NEW_SOP',
                status: 'PENDING',
                description: `SOP ${sop.code} przeszedł przez pipeline (${sop.processLogs.length}/5 kroków ukończonych). Proszę o przegląd i zatwierdzenie.`,
                rationale: sop.purpose || undefined,
                module: 'SOPs',
                labels: ['pipeline', 'auto-generated'],
                organizationId: session.user.organizationId,
                createdById: session.user.id,
            },
        });

        // Update SOP status to IN_REVIEW
        await prisma.sOP.update({
            where: { id },
            data: {
                status: 'IN_REVIEW',
                reviewer: session.user.name || session.user.id,
            },
        });

        // Notify organization users
        await pipelineNotifications.sentToCouncil(
            id,
            sop.title,
            session.user.id,
            session.user.organizationId,
        ).catch(err => console.error('[SOP Council] Notification error:', err));

        return NextResponse.json({
            success: true,
            councilRequest,
            message: 'SOP submitted to Council for review',
        });
    } catch (error) {
        console.error('[SOP Council] Error:', error);
        return NextResponse.json({ error: 'Failed to submit to council' }, { status: 500 });
    }
}

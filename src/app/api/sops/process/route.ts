import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET /api/sops/process — List SOPs in pipeline (IN_PROGRESS, RETURNED)
// ============================================================================
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sops = await prisma.sOP.findMany({
            where: {
                organizationId: session.user.organizationId,
                status: { in: ['IN_PROGRESS', 'RETURNED', 'DRAFT'] },
            },
            include: {
                department: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true, email: true } },
                processLogs: {
                    orderBy: { step: 'asc' },
                    select: { id: true, step: true, stepName: true, status: true, updatedAt: true },
                },
                _count: { select: { mudaReports: true, comments: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json({ success: true, sops, count: sops.length });
    } catch (error) {
        console.error('[SOP Process] Error listing pipeline SOPs:', error);
        return NextResponse.json({ error: 'Failed to fetch pipeline SOPs' }, { status: 500 });
    }
}

// ============================================================================
// POST /api/sops/process — Create new SOP in pipeline (status: IN_PROGRESS)
// ============================================================================
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, departmentId, sourceTranscriptId, valueChainNodeId, transcriptText } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Auto-generate code
        const existingCount = await prisma.sOP.count({
            where: { organizationId: session.user.organizationId },
        });
        const code = `SOP-${String(existingCount + 1).padStart(3, '0')}`;

        // Initialize processData with pipeline state
        const processData = {
            currentStep: 1,
            completedSteps: [] as number[],
            stepOutputs: {},
            sourceInput: {
                transcriptText: transcriptText || null,
                valueChainNodeId: valueChainNodeId || null,
            },
            comments: [],
            startedAt: new Date().toISOString(),
        };

        const sop = await prisma.sOP.create({
            data: {
                title,
                code,
                status: 'IN_PROGRESS',
                processData,
                sourceTranscriptId: sourceTranscriptId || null,
                organizationId: session.user.organizationId,
                createdById: session.user.id,
                ...(departmentId ? { departmentId } : {}),
            },
            include: {
                department: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true } },
            },
        });

        // Create initial process log entries for all 5 steps
        const stepNames = [
            'sop_generator',
            'muda_auditor',
            'ai_architect',
            'ai_generator',
            'prompt_judge',
        ];

        await prisma.sOPProcessLog.createMany({
            data: stepNames.map((name, i) => ({
                sopId: sop.id,
                step: i + 1,
                stepName: name,
                status: i === 0 ? 'active' : 'pending',
            })),
        });

        return NextResponse.json({ success: true, sop }, { status: 201 });
    } catch (error) {
        console.error('[SOP Process] Error creating pipeline SOP:', error);
        return NextResponse.json({ error: 'Failed to create pipeline SOP' }, { status: 500 });
    }
}

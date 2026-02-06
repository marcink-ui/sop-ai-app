import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VoteDecision } from '@prisma/client';

interface Params {
    params: Promise<{ id: string }>;
}

// PUT /api/council/requests/[id]/vote - Cast or update vote
export async function PUT(request: Request, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { decision } = body; // 'APPROVE' | 'REJECT' | 'ABSTAIN'

        if (!decision || !['APPROVE', 'REJECT', 'ABSTAIN'].includes(decision)) {
            return NextResponse.json({ error: 'Valid decision is required (APPROVE, REJECT, ABSTAIN)' }, { status: 400 });
        }

        // Check if request exists and belongs to organization
        const councilRequest = await prisma.councilRequest.findFirst({
            where: { id, organizationId: session.user.organizationId },
        });

        if (!councilRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        // Upsert vote using 'decision' field (not 'vote')
        const existingVote = await prisma.councilVote.findFirst({
            where: { requestId: id, userId: session.user.id },
        });

        if (existingVote) {
            await prisma.councilVote.update({
                where: { id: existingVote.id },
                data: { decision: decision as VoteDecision },
            });
        } else {
            await prisma.councilVote.create({
                data: {
                    requestId: id,
                    userId: session.user.id,
                    decision: decision as VoteDecision,
                },
            });
        }

        // Get updated vote counts
        const votes = await prisma.councilVote.findMany({
            where: { requestId: id },
        });

        const voteCounts = {
            up: votes.filter(v => v.decision === 'APPROVE').length,
            down: votes.filter(v => v.decision === 'REJECT').length,
            abstain: votes.filter(v => v.decision === 'ABSTAIN').length,
        };

        return NextResponse.json({
            success: true,
            userVote: decision,
            voteCounts,
        });
    } catch (error) {
        console.error('Error voting on council request:', error);
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }
}

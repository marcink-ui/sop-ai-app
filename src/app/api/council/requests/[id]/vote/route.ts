import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { VoteDecision, UserRole } from '@prisma/client';
import { hasPermission } from '@/lib/auth/permissions';
import { validateBody, voteSchema } from '@/lib/validations';

interface Params {
    params: Promise<{ id: string }>;
}

// PUT /api/council/requests/[id]/vote - Cast or update vote
export async function PUT(request: Request, { params }: Params) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check voting permission
        if (!hasPermission(session.user.role as UserRole, 'canVoteCouncil')) {
            return NextResponse.json({ error: 'Forbidden: you cannot vote' }, { status: 403 });
        }

        const { id } = await params;
        const { data, error } = await validateBody(request, voteSchema);
        if (error) return error;

        const { decision } = data;

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

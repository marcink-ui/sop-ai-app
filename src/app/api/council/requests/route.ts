import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CouncilRequestStatus, VoteDecision, Prisma } from '@prisma/client';

// GET /api/council/requests - List council requests
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Build where clause - using Prisma.CouncilRequestWhereInput
        const whereClause: Prisma.CouncilRequestWhereInput = {
            organizationId: session.user.organizationId,
        };

        if (status && status !== 'all') {
            whereClause.status = status.toUpperCase() as CouncilRequestStatus;
        }

        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const requests = await prisma.councilRequest.findMany({
            where: whereClause,
            include: {
                createdBy: { select: { id: true, name: true, email: true, role: true } },
                votes: {
                    include: {
                        user: { select: { id: true, name: true } }
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Process votes to count up/down using 'decision' field
        const requestsWithVoteCounts = requests.map(req => ({
            ...req,
            voteCounts: {
                up: req.votes.filter((v: { decision: VoteDecision }) => v.decision === 'APPROVE').length,
                down: req.votes.filter((v: { decision: VoteDecision }) => v.decision === 'REJECT').length,
            },
            userVote: req.votes.find((v: { userId: string }) => v.userId === session.user?.id)?.decision,
        }));

        // Calculate stats
        const stats = {
            total: requests.length,
            pending: requests.filter(r => r.status === 'PENDING').length,
            approved: requests.filter(r => r.status === 'APPROVED').length,
            rejected: requests.filter(r => r.status === 'REJECTED').length,
            voting: requests.filter(r => r.status === 'VOTING').length,
        };

        return NextResponse.json({
            success: true,
            requests: requestsWithVoteCounts,
            stats,
        });
    } catch (error) {
        console.error('Error fetching council requests:', error);
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}

// POST /api/council/requests - Create new council request
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, type, priority, rationale, impact, labels, dueDate } = body;

        if (!title || !type) {
            return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
        }

        const councilRequest = await prisma.councilRequest.create({
            data: {
                title,
                description,
                type,
                priority: priority || 'MEDIUM',
                rationale,
                impact,
                labels: labels || [],
                votingDeadline: dueDate ? new Date(dueDate) : null,
                organizationId: session.user.organizationId,
                createdById: session.user.id,
            },
            include: {
                createdBy: { select: { name: true, email: true, role: true } },
            },
        });

        return NextResponse.json({ success: true, request: councilRequest }, { status: 201 });
    } catch (error) {
        console.error('Error creating council request:', error);
        return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }
}

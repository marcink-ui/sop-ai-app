import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Note: SuggestionStatus type will be available after prisma db push

// GET /api/kaizen/[id] - get single suggestion
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const suggestion = await prisma.kaizenSuggestion.findFirst({
            where: {
                id,
                organizationId: session.user.organizationId,
            },
            include: {
                submitter: { select: { id: true, name: true, email: true, image: true } },
                reviewer: { select: { id: true, name: true, email: true, image: true } },
            },
        });

        if (!suggestion) {
            return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
        }

        return NextResponse.json(suggestion);
    } catch (error) {
        console.error('Error fetching kaizen suggestion:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/kaizen/[id] - update suggestion status (reviewer only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, reviewNote, priority } = body;

        // Check if suggestion exists
        const existing = await prisma.kaizenSuggestion.findFirst({
            where: {
                id,
                organizationId: session.user.organizationId,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
        }

        // Check role for status changes (SPONSOR, PILOT, MANAGER can review)
        const userRole = session.user.role;
        const canReview = ['SPONSOR', 'PILOT', 'MANAGER'].includes(userRole || '');

        if (status && !canReview) {
            return NextResponse.json({ error: 'Not authorized to change status' }, { status: 403 });
        }

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (status) {
            if (!['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'].includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }
            updateData.status = status; // Type will be validated after prisma db push
            updateData.reviewerId = session.user.id;
            updateData.reviewedAt = new Date();
        }

        if (reviewNote !== undefined) {
            updateData.reviewNote = reviewNote;
        }

        if (priority !== undefined) {
            if (priority < 1 || priority > 5) {
                return NextResponse.json({ error: 'Priority must be 1-5' }, { status: 400 });
            }
            updateData.priority = priority;
        }

        const updated = await prisma.kaizenSuggestion.update({
            where: { id },
            data: updateData,
            include: {
                submitter: { select: { id: true, name: true, email: true, image: true } },
                reviewer: { select: { id: true, name: true, email: true, image: true } },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating kaizen suggestion:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/kaizen/[id] - delete suggestion (author only, before review)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.kaizenSuggestion.findFirst({
            where: {
                id,
                organizationId: session.user.organizationId,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
        }

        // Only author can delete, and only if still pending
        if (existing.submitterId !== session.user.id) {
            return NextResponse.json({ error: 'Only author can delete' }, { status: 403 });
        }

        if (existing.status !== 'PENDING') {
            return NextResponse.json({ error: 'Cannot delete after review started' }, { status: 400 });
        }

        await prisma.kaizenSuggestion.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting kaizen suggestion:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

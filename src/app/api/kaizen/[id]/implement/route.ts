import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// POST /api/kaizen/[id]/implement - mark suggestion as implemented and award bonus
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check role (only SPONSOR, PILOT can mark as implemented)
        const userRole = session.user.role;
        if (!['SPONSOR', 'PILOT'].includes(userRole || '')) {
            return NextResponse.json({ error: 'Not authorized to implement suggestions' }, { status: 403 });
        }

        // Get suggestion
        const suggestion = await prisma.kaizenSuggestion.findFirst({
            where: {
                id,
                organizationId: session.user.organizationId,
            },
            include: {
                submitter: { select: { id: true, name: true, email: true } },
            },
        });

        if (!suggestion) {
            return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
        }

        // Must be approved first
        if (suggestion.status !== 'APPROVED') {
            return NextResponse.json({ error: 'Suggestion must be approved before implementation' }, { status: 400 });
        }

        // Update to implemented
        const IMPLEMENT_BONUS = 50; // Bonus Pandas for implemented suggestions

        const updated = await prisma.kaizenSuggestion.update({
            where: { id },
            data: {
                status: 'IMPLEMENTED',
                implementedAt: new Date(),
                implementReward: IMPLEMENT_BONUS,
                reviewerId: session.user.id,
            },
            include: {
                submitter: { select: { id: true, name: true, email: true, image: true } },
                reviewer: { select: { id: true, name: true, email: true, image: true } },
            },
        });

        // Award bonus Pandas to submitter
        try {
            await prisma.pandaTransaction.create({
                data: {
                    fromUserId: session.user.id, // Reviewer awards the bonus
                    toUserId: suggestion.submitterId,
                    amount: IMPLEMENT_BONUS,
                    category: 'INNOVATION',
                    message: `🐼✨ Kaizen wdrożone: ${suggestion.title.substring(0, 50)}`,
                    organizationId: session.user.organizationId,
                },
            });
        } catch (pandaError) {
            console.error('Error creating implement bonus:', pandaError);
            // Don't fail the request if panda creation fails
        }

        return NextResponse.json({
            ...updated,
            bonusAwarded: IMPLEMENT_BONUS,
        });
    } catch (error) {
        console.error('Error implementing kaizen suggestion:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

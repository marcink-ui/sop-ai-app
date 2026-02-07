import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Note: SuggestionCategory type will be available after prisma db push

// GET /api/kaizen - list kaizen suggestions
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const myOnly = searchParams.get('myOnly') === 'true';
        const limit = parseInt(searchParams.get('limit') || '50');

        const where: Record<string, unknown> = {
            organizationId: session.user.organizationId,
        };

        // Filter by user's own suggestions
        if (myOnly) {
            where.submitterId = session.user.id;
        }

        // Filter by status
        if (status) {
            where.status = status;
        }

        // Filter by category
        if (category) {
            where.category = category;
        }

        const suggestions = await prisma.kaizenSuggestion.findMany({
            where,
            include: {
                submitter: { select: { id: true, name: true, email: true, image: true } },
                reviewer: { select: { id: true, name: true, email: true, image: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Error fetching kaizen suggestions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/kaizen - create new kaizen suggestion
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, category } = body;

        // Validation
        if (!title || !description || !category) {
            return NextResponse.json({ error: 'Missing required fields: title, description, category' }, { status: 400 });
        }

        if (title.length > 255) {
            return NextResponse.json({ error: 'Title too long (max 255 characters)' }, { status: 400 });
        }

        if (!['APPLICATION', 'COMPANY_PROCESS'].includes(category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        // Create suggestion
        const suggestion = await prisma.kaizenSuggestion.create({
            data: {
                title,
                description,
                category, // Type will be validated after prisma db push
                submitterId: session.user.id,
                organizationId: session.user.organizationId,
                submissionReward: 10, // Default reward for submission
            },
            include: {
                submitter: { select: { id: true, name: true, email: true, image: true } },
            },
        });

        // Create Panda transaction for submission reward
        try {
            await prisma.pandaTransaction.create({
                data: {
                    fromUserId: session.user.id, // System represented by submitter for now
                    toUserId: session.user.id,
                    amount: 10,
                    category: 'INNOVATION',
                    message: `🐼 Kaizen: ${title.substring(0, 50)}`,
                    organizationId: session.user.organizationId,
                },
            });
        } catch (pandaError) {
            console.error('Error creating panda reward:', pandaError);
            // Don't fail the request if panda creation fails
        }

        return NextResponse.json(suggestion, { status: 201 });
    } catch (error) {
        console.error('Error creating kaizen suggestion:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

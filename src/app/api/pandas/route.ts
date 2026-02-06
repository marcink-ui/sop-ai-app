import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/pandas - list panda transactions
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '50');

        const where: Record<string, unknown> = {
            organizationId: session.user.organizationId,
        };

        if (userId) {
            where.OR = [{ fromUserId: userId }, { toUserId: userId }];
        }

        if (category) {
            where.category = category;
        }

        const transactions = await prisma.pandaTransaction.findMany({
            where,
            include: {
                fromUser: { select: { id: true, name: true, email: true, image: true } },
                toUser: { select: { id: true, name: true, email: true, image: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching pandas:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/pandas - create new panda transaction
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { toUserId, category, message, amount = 1 } = body;

        if (!toUserId || !category || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Cannot give panda to yourself
        if (toUserId === session.user.id) {
            return NextResponse.json({ error: 'Cannot give panda to yourself' }, { status: 400 });
        }

        // Verify recipient exists in same org
        const recipient = await prisma.user.findFirst({
            where: {
                id: toUserId,
                organizationId: session.user.organizationId,
            },
        });

        if (!recipient) {
            return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
        }

        const transaction = await prisma.pandaTransaction.create({
            data: {
                fromUserId: session.user.id,
                toUserId,
                category,
                message,
                amount,
                organizationId: session.user.organizationId,
            },
            include: {
                fromUser: { select: { id: true, name: true, email: true, image: true } },
                toUser: { select: { id: true, name: true, email: true, image: true } },
            },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error('Error creating panda:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only SPONSOR can access all chat history
        if (session.user.role !== 'SPONSOR') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const organizationId = session.user.organizationId;
        if (!organizationId) {
            return NextResponse.json({ error: 'No organization' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const userId = searchParams.get('userId');
        const search = searchParams.get('search');

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            user: {
                organizationId
            }
        };

        if (userId) {
            where.userId = userId;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { messages: { some: { content: { contains: search, mode: 'insensitive' } } } }
            ];
        }

        // Fetch chat sessions with messages
        const [sessions, total] = await Promise.all([
            prisma.chatSession.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true
                        }
                    },
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        take: 50 // Limit messages per session
                    },
                    _count: {
                        select: { messages: true }
                    }
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.chatSession.count({ where })
        ]);

        return NextResponse.json({
            sessions: sessions.map(s => ({
                id: s.id,
                title: s.title,
                context: s.context,
                user: s.user,
                messageCount: s._count.messages,
                messages: s.messages,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[CHAT_HISTORY_ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to fetch chat history' },
            { status: 500 }
        );
    }
}

// Delete a chat session
export async function DELETE(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user || session.user.role !== 'SPONSOR') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        await prisma.chatSession.delete({
            where: { id: sessionId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CHAT_HISTORY_DELETE_ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to delete chat session' },
            { status: 500 }
        );
    }
}

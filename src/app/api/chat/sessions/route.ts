import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// GET /api/chat/sessions - List all chat sessions for user
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const sopId = searchParams.get('sopId');
        const agentId = searchParams.get('agentId');

        // Build filter
        const where: any = {
            userId: session.user.id,
        };

        // Context-based filtering
        if (sopId || agentId) {
            where.context = {
                path: sopId ? ['sopId'] : ['agentId'],
                equals: sopId || agentId,
            };
        }

        const [sessions, total] = await Promise.all([
            prisma.chatSession.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    _count: { select: { messages: true } },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: { content: true, role: true, createdAt: true },
                    },
                },
            }),
            prisma.chatSession.count({ where }),
        ]);

        return NextResponse.json({
            sessions: sessions.map(s => ({
                id: s.id,
                title: s.title,
                context: s.context,
                messageCount: s._count.messages,
                lastMessage: s.messages[0] || null,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
            })),
            total,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Chat Sessions API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/chat/sessions - Create new chat session
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, context } = body;

        const chatSession = await prisma.chatSession.create({
            data: {
                title: title || 'Nowa rozmowa',
                context: context || {},
                userId: session.user.id,
            },
        });

        return NextResponse.json(chatSession, { status: 201 });
    } catch (error) {
        console.error('Chat Session Create Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

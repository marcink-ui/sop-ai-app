import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, getEffectiveOrganizationId } from '@/lib/auth-server';

// GET /api/chat/history — list chat sessions with filters
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organizationId = await getEffectiveOrganizationId(session);
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const search = searchParams.get('search') || '';
        const userId = searchParams.get('userId') || '';
        const sessionId = searchParams.get('sessionId') || '';

        // Access control: all authenticated users can see their org's chat history
        // Only restrict if needed in future (e.g., per-user only mode)
        const isRestricted = false; // Could be role-based: userRole === 'CITIZEN_DEV'
        const userFilter = isRestricted ? session.user.id : (userId || undefined);

        // If requesting a specific session's messages
        if (sessionId) {
            const chatSession = await prisma.chatSession.findUnique({
                where: { id: sessionId },
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        select: {
                            id: true,
                            role: true,
                            content: true,
                            createdAt: true,
                        },
                    },
                },
            });

            if (!chatSession) {
                return NextResponse.json({ error: 'Session not found' }, { status: 404 });
            }

            // Verify access
            if (isRestricted && chatSession.userId !== session.user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            return NextResponse.json({ session: chatSession });
        }

        // List sessions with pagination
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        // Scope to organization's users
        where.user = { organizationId };

        if (userFilter) {
            where.userId = userFilter;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { messages: { some: { content: { contains: search, mode: 'insensitive' } } } },
            ];
        }

        const [sessions, total] = await Promise.all([
            prisma.chatSession.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                    _count: { select: { messages: true } },
                },
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.chatSession.count({ where }),
        ]);

        // Stats (only for non-restricted users)
        let stats = null;
        if (!isRestricted) {
            const [totalSessions, totalMessages, uniqueUsers] = await Promise.all([
                prisma.chatSession.count({ where: { user: { organizationId } } }),
                prisma.chatMessage.count({
                    where: { session: { user: { organizationId } } },
                }),
                prisma.chatSession.groupBy({
                    by: ['userId'],
                    where: { user: { organizationId } },
                }).then(r => r.length),
            ]);

            stats = { totalSessions, totalMessages, uniqueUsers };
        }

        return NextResponse.json({
            sessions,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            stats,
        });
    } catch (error) {
        console.error('[Chat History] GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

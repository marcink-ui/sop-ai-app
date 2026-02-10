import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// GET /api/chat/sessions/[id] - Get session with messages
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const chatSession = await prisma.chatSession.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
                user: {
                    select: { name: true, email: true, role: true },
                },
            },
        });

        if (!chatSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json(chatSession);
    } catch (error) {
        console.error('Get Chat Session Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/chat/sessions/[id] - Update session title
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title } = body;

        const chatSession = await prisma.chatSession.updateMany({
            where: {
                id,
                userId: session.user.id,
            },
            data: { title },
        });

        if (chatSession.count === 0) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update Chat Session Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/chat/sessions/[id] - Delete session
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Only owner can delete
        const deleted = await prisma.chatSession.deleteMany({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (deleted.count === 0) {
            return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete Chat Session Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

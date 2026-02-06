import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/newsletters - list newsletters
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const newsletters = await prisma.newsletter.findMany({
            where: {
                organizationId: session.user.organizationId,
                publishedAt: { not: null },
            },
            include: {
                author: { select: { id: true, name: true, image: true } },
            },
            orderBy: [
                { isPinned: 'desc' },
                { publishedAt: 'desc' },
            ],
        });

        return NextResponse.json(newsletters);
    } catch (error) {
        console.error('Error fetching newsletters:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/newsletters - create newsletter (MANAGER+)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check role
        const allowedRoles = ['MANAGER', 'ADMIN'];
        if (!allowedRoles.includes(session.user.role || '')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { title, content, isPinned = false, publish = false } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newsletter = await prisma.newsletter.create({
            data: {
                title,
                content,
                isPinned,
                publishedAt: publish ? new Date() : null,
                authorId: session.user.id,
                organizationId: session.user.organizationId,
            },
            include: {
                author: { select: { id: true, name: true, image: true } },
            },
        });

        return NextResponse.json(newsletter, { status: 201 });
    } catch (error) {
        console.error('Error creating newsletter:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

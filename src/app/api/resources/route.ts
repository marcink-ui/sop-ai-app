import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/resources - list resources
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const featured = searchParams.get('featured') === 'true';

        const where: Record<string, unknown> = {
            organizationId: session.user.organizationId,
        };

        // Non-admins only see published
        const roleStr = String(session.user.role || '');
        if (!roleStr || roleStr === 'EMPLOYEE') {
            where.status = 'PUBLISHED';
        } else if (status) {
            where.status = status;
        }

        if (category) {
            where.category = category;
        }

        if (featured) {
            where.featured = true;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }

        const resources = await prisma.resource.findMany({
            where,
            include: {
                author: { select: { id: true, name: true, image: true } },
            },
            orderBy: [
                { featured: 'desc' },
                { updatedAt: 'desc' },
            ],
        });

        return NextResponse.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/resources - create resource (CITIZEN_DEV+)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check role
        const allowedRoles = ['CITIZEN_DEV', 'MANAGER', 'ADMIN'];
        if (!allowedRoles.includes(session.user.role || '')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { title, content, excerpt, category, status = 'DRAFT', featured = false } = body;

        if (!title || !content || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate slug
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const resource = await prisma.resource.create({
            data: {
                title,
                slug,
                content,
                excerpt,
                category,
                status,
                featured,
                authorId: session.user.id,
                organizationId: session.user.organizationId,
            },
            include: {
                author: { select: { id: true, name: true, image: true } },
            },
        });

        return NextResponse.json(resource, { status: 201 });
    } catch (error) {
        console.error('Error creating resource:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

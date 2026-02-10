import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// GET /api/event-types - List all event types for organization
export async function GET(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const eventTypes = await prisma.eventType.findMany({
            where: {
                organizationId: session.user.organizationId,
            },
            include: {
                category: { select: { id: true, name: true, color: true } },
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({
            success: true,
            eventTypes,
            count: eventTypes.length,
        });
    } catch (error) {
        console.error('Error fetching event types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event types' },
            { status: 500 }
        );
    }
}

// POST /api/event-types - Create new event type
export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, description, isAsync, icon, color, categoryId } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        // Check if slug already exists in organization
        const existing = await prisma.eventType.findFirst({
            where: {
                organizationId: session.user.organizationId,
                slug,
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'Event type with this slug already exists' }, { status: 409 });
        }

        // Verify category if provided
        if (categoryId) {
            const category = await prisma.category.findFirst({
                where: {
                    id: categoryId,
                    organizationId: session.user.organizationId,
                },
            });

            if (!category) {
                return NextResponse.json({ error: 'Category not found' }, { status: 404 });
            }
        }

        const eventType = await prisma.eventType.create({
            data: {
                name,
                slug,
                description,
                isAsync: isAsync || false,
                icon,
                color,
                organizationId: session.user.organizationId,
                ...(categoryId ? { categoryId } : {}),
            },
            include: {
                category: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({
            success: true,
            eventType,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating event type:', error);
        return NextResponse.json(
            { error: 'Failed to create event type' },
            { status: 500 }
        );
    }
}

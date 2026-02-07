import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/categories - List all categories for organization
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId');
        const flat = searchParams.get('flat') === 'true';

        if (flat) {
            // Return flat list of all categories
            const categories = await prisma.category.findMany({
                where: {
                    organizationId: session.user.organizationId,
                },
                include: {
                    parent: { select: { id: true, name: true } },
                    _count: {
                        select: {
                            agents: true,
                            workshopTypes: true,
                            eventTypes: true,
                            transformationPhases: true,
                            children: true
                        }
                    }
                },
                orderBy: { order: 'asc' },
            });

            return NextResponse.json({
                success: true,
                categories,
                count: categories.length,
            });
        }

        // Return hierarchical structure
        const categories = await prisma.category.findMany({
            where: {
                organizationId: session.user.organizationId,
                parentId: parentId || null, // Top-level categories if no parentId
            },
            include: {
                children: {
                    include: {
                        _count: { select: { children: true } }
                    },
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: {
                        agents: true,
                        workshopTypes: true,
                        eventTypes: true,
                        transformationPhases: true
                    }
                }
            },
            orderBy: { order: 'asc' },
        });

        return NextResponse.json({
            success: true,
            categories,
            count: categories.length,
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// POST /api/categories - Create new category
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, description, color, icon, order, parentId } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        // Check if slug already exists in organization
        const existing = await prisma.category.findFirst({
            where: {
                organizationId: session.user.organizationId,
                slug,
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 409 });
        }

        // Verify parent belongs to same organization if provided
        if (parentId) {
            const parent = await prisma.category.findFirst({
                where: {
                    id: parentId,
                    organizationId: session.user.organizationId,
                },
            });

            if (!parent) {
                return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
            }
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description,
                color,
                icon,
                order: order || 0,
                organizationId: session.user.organizationId,
                ...(parentId ? { parentId } : {}),
            },
            include: {
                parent: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({
            success: true,
            category,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/workshop-types - List all workshop types for organization
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const workshopTypes = await prisma.workshopType.findMany({
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
            workshopTypes,
            count: workshopTypes.length,
        });
    } catch (error) {
        console.error('Error fetching workshop types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch workshop types' },
            { status: 500 }
        );
    }
}

// POST /api/workshop-types - Create new workshop type
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, description, duration, icon, color, categoryId } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        // Check if slug already exists in organization
        const existing = await prisma.workshopType.findFirst({
            where: {
                organizationId: session.user.organizationId,
                slug,
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'Workshop type with this slug already exists' }, { status: 409 });
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

        const workshopType = await prisma.workshopType.create({
            data: {
                name,
                slug,
                description,
                duration,
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
            workshopType,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating workshop type:', error);
        return NextResponse.json(
            { error: 'Failed to create workshop type' },
            { status: 500 }
        );
    }
}

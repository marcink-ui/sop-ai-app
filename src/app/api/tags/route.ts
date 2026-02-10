import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// GET /api/tags - List all tags (scoped to organization)
export async function GET() {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tags = await prisma.tag.findMany({
            where: {
                organizationId: session.user.organizationId,
            },
            include: {
                _count: {
                    select: {
                        agents: true,
                        sops: true,
                        phases: true,
                        workshops: true
                    }
                }
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({
            success: true,
            tags,
            count: tags.length,
        });
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}

// POST /api/tags - Create new tag (scoped to organization)
export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, color, description, icon } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check if name already exists within this organization
        const existing = await prisma.tag.findFirst({
            where: { name, organizationId: session.user.organizationId },
        });

        if (existing) {
            return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 409 });
        }

        const tag = await prisma.tag.create({
            data: {
                name,
                color,
                description,
                icon,
                organizationId: session.user.organizationId,
            },
        });

        return NextResponse.json({
            success: true,
            tag,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json(
            { error: 'Failed to create tag' },
            { status: 500 }
        );
    }
}

// PATCH /api/tags - Update a tag
export async function PATCH(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, color, description, icon } = body;

        if (!id) {
            return NextResponse.json({ error: 'Tag id is required' }, { status: 400 });
        }

        const existing = await prisma.tag.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        // Check if new name conflicts with another tag in this organization
        if (name && name !== existing.name) {
            const conflict = await prisma.tag.findFirst({
                where: { name, organizationId: session.user.organizationId },
            });

            if (conflict) {
                return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 409 });
            }
        }

        const tag = await prisma.tag.update({
            where: { id },
            data: {
                ...(name ? { name } : {}),
                ...(color !== undefined ? { color } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(icon !== undefined ? { icon } : {}),
            },
        });

        return NextResponse.json({
            success: true,
            tag,
        });
    } catch (error) {
        console.error('Error updating tag:', error);
        return NextResponse.json(
            { error: 'Failed to update tag' },
            { status: 500 }
        );
    }
}

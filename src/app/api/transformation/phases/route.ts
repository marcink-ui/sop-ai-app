import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/transformation/phases - List all transformation phases
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const phases = await prisma.transformationPhase.findMany({
            where: {
                organizationId: session.user.organizationId,
            },
            include: {
                category: { select: { id: true, name: true, color: true } },
                tags: {
                    include: {
                        tag: { select: { id: true, name: true, color: true } }
                    }
                },
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { order: 'asc' },
        });

        return NextResponse.json({
            success: true,
            phases,
            count: phases.length,
        });
    } catch (error) {
        console.error('Error fetching transformation phases:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transformation phases' },
            { status: 500 }
        );
    }
}

// POST /api/transformation/phases - Create new transformation phase
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, order, description, isPrework, icon, color, categoryId } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        // Check if slug already exists in organization
        const existing = await prisma.transformationPhase.findFirst({
            where: {
                organizationId: session.user.organizationId,
                slug,
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'Phase with this slug already exists' }, { status: 409 });
        }

        const phase = await prisma.transformationPhase.create({
            data: {
                name,
                slug,
                order: order || 0,
                description,
                isPrework: isPrework || false,
                icon,
                color,
                organizationId: session.user.organizationId,
                ...(categoryId ? { categoryId } : {}),
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json({
            success: true,
            phase,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating transformation phase:', error);
        return NextResponse.json(
            { error: 'Failed to create transformation phase' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/sops/[id] - Get single SOP with full details
export async function GET(request: Request, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const sop = await prisma.sOP.findFirst({
            where: {
                id,
                organizationId: session.user.organizationId,
            },
            include: {
                department: true,
                createdBy: { select: { id: true, name: true, email: true } },
                updatedBy: { select: { id: true, name: true } },
                versions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                agents: {
                    include: {
                        agent: { select: { id: true, name: true, code: true, status: true } }
                    }
                },
                comments: {
                    include: {
                        user: { select: { id: true, name: true } }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                attachments: true,
                tags: true,
            },
        });

        if (!sop) {
            return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, sop });
    } catch (error) {
        console.error('Error fetching SOP:', error);
        return NextResponse.json({ error: 'Failed to fetch SOP' }, { status: 500 });
    }
}

// PUT /api/sops/[id] - Update SOP
export async function PUT(request: Request, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, purpose, scope, steps, kpis, definitions, status, owner, reviewer, departmentId } = body;

        // Check if SOP exists and belongs to organization
        const existing = await prisma.sOP.findFirst({
            where: { id, organizationId: session.user.organizationId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
        }

        // Create version snapshot before update
        await prisma.sOPVersion.create({
            data: {
                sopId: id,
                version: existing.version,
                content: {
                    title: existing.title,
                    purpose: existing.purpose,
                    scope: existing.scope,
                    steps: existing.steps,
                    kpis: existing.kpis,
                    definitions: existing.definitions,
                },
                changelog: `Updated by ${session.user.name || session.user.email}`,
            },
        });

        // Update SOP
        const sop = await prisma.sOP.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(purpose !== undefined && { purpose }),
                ...(scope !== undefined && { scope }),
                ...(steps !== undefined && { steps }),
                ...(kpis !== undefined && { kpis }),
                ...(definitions !== undefined && { definitions }),
                ...(status && { status }),
                ...(owner !== undefined && { owner }),
                ...(reviewer !== undefined && { reviewer }),
                ...(departmentId !== undefined && { departmentId }),
                updatedById: session.user.id,
            },
            include: {
                department: true,
                createdBy: { select: { name: true } },
                updatedBy: { select: { name: true } },
            },
        });

        return NextResponse.json({ success: true, sop });
    } catch (error) {
        console.error('Error updating SOP:', error);
        return NextResponse.json({ error: 'Failed to update SOP' }, { status: 500 });
    }
}

// DELETE /api/sops/[id] - Delete SOP
export async function DELETE(request: Request, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Only SPONSOR, PILOT, MANAGER can delete
        const role = session.user.role as string;
        if (!['SPONSOR', 'PILOT', 'MANAGER', 'ADMIN'].includes(role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Check if SOP exists and belongs to organization
        const existing = await prisma.sOP.findFirst({
            where: { id, organizationId: session.user.organizationId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
        }

        await prisma.sOP.delete({ where: { id } });

        return NextResponse.json({ success: true, message: 'SOP deleted' });
    } catch (error) {
        console.error('Error deleting SOP:', error);
        return NextResponse.json({ error: 'Failed to delete SOP' }, { status: 500 });
    }
}

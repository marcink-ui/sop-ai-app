import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { SOPStatus, Prisma } from '@prisma/client';
import { validateBody, createSopSchema } from '@/lib/validations';

// GET /api/sops - List all SOPs for organization
export async function GET(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const departmentId = searchParams.get('departmentId');
        const search = searchParams.get('search');

        // Build where clause with Prisma.SOPWhereInput
        const whereClause: Prisma.SOPWhereInput = {
            organizationId: session.user.organizationId,
        };

        if (status && status !== 'all') {
            whereClause.status = status.toUpperCase() as SOPStatus;
        }

        // Auto-filter by department for lower roles
        const highRoles = ['META_ADMIN', 'PARTNER', 'SPONSOR', 'PILOT'];
        const userRole = session.user.role || 'CITIZEN_DEV';

        if (departmentId) {
            // Explicit filter always respected
            whereClause.departmentId = departmentId;
        } else if (!highRoles.includes(userRole) && session.user.departmentId) {
            // MANAGER, EXPERT, CITIZEN_DEV → auto-filter to own department
            whereClause.departmentId = session.user.departmentId;
        }

        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { purpose: { contains: search, mode: 'insensitive' } },
            ];
        }

        const sops = await prisma.sOP.findMany({
            where: whereClause,
            include: {
                department: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true, email: true } },
                updatedBy: { select: { id: true, name: true } },
                agents: {
                    include: {
                        agent: { select: { id: true, name: true, code: true } }
                    }
                },
                _count: {
                    select: { versions: true, comments: true, attachments: true }
                }
            },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            sops,
            count: sops.length,
        });
    } catch (error) {
        console.error('Error fetching SOPs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch SOPs' },
            { status: 500 }
        );
    }
}

// POST /api/sops - Create new SOP
export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await validateBody(request, createSopSchema);
        if (error) return error;

        const { title, code, purpose, scope, departmentId, steps, kpis, definitions, owner, reviewer } = data;

        // Check if code already exists in organization
        const existing = await prisma.sOP.findFirst({
            where: {
                organizationId: session.user.organizationId,
                code,
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'SOP with this code already exists' }, { status: 409 });
        }

        const sop = await prisma.sOP.create({
            data: {
                title,
                code,
                purpose,
                scope,
                steps,
                kpis,
                definitions,
                owner,
                reviewer,
                organizationId: session.user.organizationId,
                createdById: session.user.id,
                ...(departmentId ? { departmentId } : {}),
            },
            include: {
                department: true,
                createdBy: { select: { name: true, email: true } },
            },
        });

        return NextResponse.json({
            success: true,
            sop,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating SOP:', error);
        return NextResponse.json(
            { error: 'Failed to create SOP' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// GET /api/roles - List organizational roles and departments
export async function GET(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        // Get departments with their users
        const departments = await prisma.department.findMany({
            where: {
                organizationId: session.user.organizationId,
                ...(search ? {
                    name: { contains: search, mode: 'insensitive' as const },
                } : {}),
            },
            include: {
                users: {
                    select: { id: true, name: true, email: true, role: true }
                },
                _count: {
                    select: { users: true, sops: true }
                }
            },
            orderBy: { name: 'asc' },
        });

        // Get organizational roles (no department relation in schema)
        const roles = await prisma.organizationalRole.findMany({
            where: {
                organizationId: session.user.organizationId,
                ...(search ? {
                    name: { contains: search, mode: 'insensitive' as const },
                } : {}),
            },
            orderBy: { name: 'asc' },
        });

        // Calculate stats
        const totalPeople = await prisma.user.count({
            where: { organizationId: session.user.organizationId }
        });

        // Count roles with RACI assignments
        const rolesWithAssignments = roles.filter(r => {
            const raci = r.raciMatrix as Record<string, unknown> | null;
            return raci && Object.keys(raci).length > 0;
        }).length;

        return NextResponse.json({
            success: true,
            departments,
            roles,
            stats: {
                totalDepartments: departments.length,
                totalRoles: roles.length,
                totalPeople,
                rolesWithAssignments,
            }
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }
}

// POST /api/roles - Create organizational role
export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only SPONSOR, PILOT, MANAGER can create roles
        const userRole = session.user.role as string;
        if (!['SPONSOR', 'PILOT', 'MANAGER', 'ADMIN'].includes(userRole)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, raciMatrix } = body;

        if (!name) {
            return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
        }

        const role = await prisma.organizationalRole.create({
            data: {
                name,
                description,
                raciMatrix: raciMatrix || {},
                organizationId: session.user.organizationId,
            },
        });

        return NextResponse.json({ success: true, role }, { status: 201 });
    } catch (error) {
        console.error('Error creating role:', error);
        return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }
}

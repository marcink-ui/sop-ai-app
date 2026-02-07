import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Nieautoryzowany dostęp' },
                { status: 401 }
            );
        }

        const organizationId = session.user.organizationId;

        if (!organizationId) {
            return NextResponse.json(
                { error: 'Brak organizacji' },
                { status: 400 }
            );
        }

        const departments = await prisma.department.findMany({
            where: { organizationId },
            select: {
                id: true,
                name: true,
                description: true,
                _count: {
                    select: {
                        users: true,
                        sops: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ departments });
    } catch (error) {
        console.error('Error fetching departments:', error);
        return NextResponse.json(
            { error: 'Błąd pobierania działów' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Nieautoryzowany dostęp' },
                { status: 401 }
            );
        }

        const organizationId = session.user.organizationId;

        if (!organizationId) {
            return NextResponse.json(
                { error: 'Brak organizacji' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { name, description } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Nazwa działu jest wymagana' },
                { status: 400 }
            );
        }

        // Check if department with this name already exists
        const existing = await prisma.department.findFirst({
            where: {
                organizationId,
                name: { equals: name.trim(), mode: 'insensitive' },
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Dział o tej nazwie już istnieje' },
                { status: 409 }
            );
        }

        const department = await prisma.department.create({
            data: {
                name: name.trim(),
                description: description || null,
                organizationId,
            },
        });

        return NextResponse.json({ department }, { status: 201 });
    } catch (error) {
        console.error('Error creating department:', error);
        return NextResponse.json(
            { error: 'Błąd tworzenia działu' },
            { status: 500 }
        );
    }
}

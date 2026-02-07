import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TransformationTaskStatus, Prisma } from '@prisma/client';

// GET /api/transformation/tasks - List all transformation tasks
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const phaseId = searchParams.get('phaseId');
        const status = searchParams.get('status');

        const whereClause: Prisma.TransformationTaskWhereInput = {};

        // Filter by phase (via the phase's organizationId)
        if (phaseId) {
            whereClause.phaseId = phaseId;
        }

        if (status && status !== 'all') {
            whereClause.status = status.toUpperCase() as TransformationTaskStatus;
        }

        const tasks = await prisma.transformationTask.findMany({
            where: whereClause,
            include: {
                phase: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        organizationId: true
                    }
                },
                workshopType: { select: { id: true, name: true, slug: true, color: true } },
                eventType: { select: { id: true, name: true, slug: true, color: true } },
            },
            orderBy: [
                { phase: { order: 'asc' } },
                { order: 'asc' }
            ],
        });

        // Filter by organization (via phase relation)
        const filteredTasks = tasks.filter(
            task => task.phase.organizationId === session.user.organizationId
        );

        return NextResponse.json({
            success: true,
            tasks: filteredTasks,
            count: filteredTasks.length,
        });
    } catch (error) {
        console.error('Error fetching transformation tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transformation tasks' },
            { status: 500 }
        );
    }
}

// POST /api/transformation/tasks - Create new transformation task
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            description,
            order,
            phaseId,
            workshopTypeId,
            eventTypeId,
            assignedRoles,
            estimatedHours
        } = body;

        if (!name || !phaseId) {
            return NextResponse.json({ error: 'Name and phaseId are required' }, { status: 400 });
        }

        // Verify phase belongs to user's organization
        const phase = await prisma.transformationPhase.findFirst({
            where: {
                id: phaseId,
                organizationId: session.user.organizationId,
            },
        });

        if (!phase) {
            return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
        }

        const task = await prisma.transformationTask.create({
            data: {
                name,
                description,
                order: order || 0,
                phaseId,
                workshopTypeId,
                eventTypeId,
                assignedRoles: assignedRoles || [],
                estimatedHours,
            },
            include: {
                phase: { select: { name: true, slug: true } },
                workshopType: { select: { name: true } },
                eventType: { select: { name: true } },
            },
        });

        return NextResponse.json({
            success: true,
            task,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating transformation task:', error);
        return NextResponse.json(
            { error: 'Failed to create transformation task' },
            { status: 500 }
        );
    }
}

// PATCH /api/transformation/tasks - Update task status
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { taskId, status, notes } = body;

        if (!taskId || !status) {
            return NextResponse.json({ error: 'taskId and status are required' }, { status: 400 });
        }

        // Verify task belongs to user's organization (via phase)
        const existingTask = await prisma.transformationTask.findFirst({
            where: { id: taskId },
            include: { phase: { select: { organizationId: true } } },
        });

        if (!existingTask || existingTask.phase.organizationId !== session.user.organizationId) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const updateData: Prisma.TransformationTaskUpdateInput = {
            status: status as TransformationTaskStatus,
        };

        if (notes !== undefined) {
            updateData.notes = notes;
        }

        if (status === 'IN_PROGRESS' && !existingTask.startedAt) {
            updateData.startedAt = new Date();
        }

        if (status === 'DONE' && !existingTask.completedAt) {
            updateData.completedAt = new Date();
        }

        const task = await prisma.transformationTask.update({
            where: { id: taskId },
            data: updateData,
            include: {
                phase: { select: { name: true } },
            },
        });

        return NextResponse.json({
            success: true,
            task,
        });
    } catch (error) {
        console.error('Error updating transformation task:', error);
        return NextResponse.json(
            { error: 'Failed to update transformation task' },
            { status: 500 }
        );
    }
}

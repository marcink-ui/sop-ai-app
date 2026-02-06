import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/tasks - Get all council requests as tasks
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const module = searchParams.get('module');
        const assigneeId = searchParams.get('assigneeId');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Build where clause
        const where: any = {};

        if (status) {
            where.status = status;
        }
        if (type) {
            where.type = type;
        }
        if (module) {
            where.module = module;
        }
        if (assigneeId) {
            where.assigneeId = assigneeId;
        }

        const tasks = await prisma.councilRequest.findMany({
            where,
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
            take: limit,
            include: {
                assignee: {
                    select: { id: true, name: true, email: true, role: true, image: true },
                },
                createdBy: {
                    select: { id: true, name: true, email: true, role: true, image: true },
                },
                votes: {
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                },
            },
        });

        return NextResponse.json({
            tasks,
            total: tasks.length,
        });
    } catch (error) {
        console.error('Tasks API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/tasks - Create new task (council request)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            type,
            description,
            priority,
            module,
            labels,
            assigneeId,
            dueDate,
        } = body;

        // Get user's organization
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true },
        });

        if (!user?.organizationId) {
            return NextResponse.json({ error: 'User has no organization' }, { status: 400 });
        }

        const task = await prisma.councilRequest.create({
            data: {
                title,
                type: type || 'OTHER',
                description,
                priority: priority || 'MEDIUM',
                module,
                labels: labels || [],
                assigneeId,
                dueDate: dueDate ? new Date(dueDate) : null,
                organizationId: user.organizationId,
                createdById: session.user.id,
            },
            include: {
                assignee: {
                    select: { id: true, name: true, email: true, role: true, image: true },
                },
                createdBy: {
                    select: { id: true, name: true, email: true, role: true, image: true },
                },
            },
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('Create Task Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/tasks - Update task (for drag-drop status change)
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, assigneeId, priority, dueDate, module, labels } = body;

        if (!id) {
            return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
        if (priority) updateData.priority = priority;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
        if (module !== undefined) updateData.module = module;
        if (labels) updateData.labels = labels;

        const task = await prisma.councilRequest.update({
            where: { id },
            data: updateData,
            include: {
                assignee: {
                    select: { id: true, name: true, email: true, role: true, image: true },
                },
                createdBy: {
                    select: { id: true, name: true, email: true, role: true, image: true },
                },
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Update Task Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

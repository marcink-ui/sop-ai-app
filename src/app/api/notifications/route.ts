import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';

/**
 * GET /api/notifications
 * 
 * Fetches notifications for the current user.
 * Query params:
 *   ?limit=20        — max results (default 20)
 *   ?type=PIPELINE_STEP — filter by notification type
 *   ?unread=true     — only unread
 */
export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId } = session.user;
        const userId = session.user.id;

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const type = searchParams.get('type');
        const unreadOnly = searchParams.get('unread') === 'true';

        // 1. DB-backed notifications (new model)
        const dbNotifications = await prisma.notification.findMany({
            where: {
                userId,
                organizationId,
                ...(type ? { type: type as never } : {}),
                ...(unreadOnly ? { read: false } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        // 2. Virtual notifications (legacy — Council + recent SOP + recent Agent activity)
        const [pendingTasks, recentSOPs, recentAgents] = await Promise.all([
            prisma.councilRequest.findMany({
                where: { status: 'PENDING', organizationId },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, createdAt: true },
            }),
            prisma.sOP.findMany({
                where: { organizationId },
                take: 3,
                orderBy: { updatedAt: 'desc' },
                select: { id: true, title: true, updatedAt: true },
            }),
            prisma.agent.findMany({
                where: { organizationId },
                take: 2,
                orderBy: { updatedAt: 'desc' },
                select: { id: true, name: true, updatedAt: true },
            }),
        ]);

        const virtualNotifications = [
            ...pendingTasks.map(task => ({
                id: `virtual-task-${task.id}`,
                type: 'COUNCIL_REQUEST' as const,
                title: 'Nowe zadanie do realizacji',
                description: task.title,
                read: false,
                link: '/council',
                createdAt: task.createdAt.toISOString(),
                virtual: true,
            })),
            ...recentSOPs.map(sop => ({
                id: `virtual-sop-${sop.id}`,
                type: 'SOP_UPDATE' as const,
                title: 'Aktualizacja SOP',
                description: sop.title,
                read: true,
                link: `/sops/${sop.id}`,
                createdAt: sop.updatedAt.toISOString(),
                virtual: true,
            })),
            ...recentAgents.map(agent => ({
                id: `virtual-agent-${agent.id}`,
                type: 'KNOWLEDGE_UPDATE' as const,
                title: 'Nowy AI Agent',
                description: agent.name,
                read: true,
                link: `/agents/${agent.id}`,
                createdAt: agent.updatedAt.toISOString(),
                virtual: true,
            })),
        ];

        // Merge, deduplicate, sort by date
        const existingDbIds = new Set(dbNotifications.map(n => n.sopId || n.agentId).filter(Boolean));
        const filteredVirtual = virtualNotifications.filter(v => {
            // Don't show virtual if a DB notification already covers this entity
            const entityId = v.id.replace(/^virtual-(task|sop|agent)-/, '');
            return !existingDbIds.has(entityId);
        });

        const allNotifications = [
            ...dbNotifications.map(n => ({
                id: n.id,
                type: n.type,
                title: n.title,
                description: n.description,
                read: n.read,
                link: n.link,
                createdAt: n.createdAt.toISOString(),
                metadata: n.metadata,
                virtual: false,
            })),
            ...filteredVirtual,
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);

        // Unread count (DB only for accuracy)
        const unreadCount = await prisma.notification.count({
            where: { userId, organizationId, read: false },
        });

        // Add virtual unread count
        const totalUnread = unreadCount + pendingTasks.length;

        return NextResponse.json({
            notifications: allNotifications,
            unreadCount: totalUnread,
            dbCount: dbNotifications.length,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({
            notifications: [],
            unreadCount: 0,
        }, { status: 500 });
    }
}

/**
 * PATCH /api/notifications
 * 
 * Mark notifications as read.
 * Body: { ids: string[] } — specific IDs, or { all: true } — mark all as read
 */
export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const organizationId = session.user.organizationId;
        const body = await request.json();

        if (body.all) {
            // Mark all as read
            const result = await prisma.notification.updateMany({
                where: { userId, organizationId, read: false },
                data: { read: true, readAt: new Date() },
            });
            return NextResponse.json({ updated: result.count });
        }

        if (body.ids && Array.isArray(body.ids)) {
            // Mark specific IDs as read
            const result = await prisma.notification.updateMany({
                where: {
                    id: { in: body.ids },
                    userId,
                    organizationId,
                },
                data: { read: true, readAt: new Date() },
            });
            return NextResponse.json({ updated: result.count });
        }

        return NextResponse.json({ error: 'Provide ids[] or all:true' }, { status: 400 });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

/**
 * DELETE /api/notifications
 * 
 * Clear old read notifications (older than 30 days by default).
 * Query: ?days=30
 */
export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const result = await prisma.notification.deleteMany({
            where: {
                userId,
                read: true,
                createdAt: { lt: cutoff },
            },
        });

        return NextResponse.json({ deleted: result.count });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        return NextResponse.json({ error: 'Failed to clear' }, { status: 500 });
    }
}

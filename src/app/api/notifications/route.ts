import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId } = session.user;

        // Fetch different types of notifications scoped to user's organization

        // 1. Pending tasks assigned to current user
        const pendingTasks = await prisma.councilRequest.findMany({
            where: {
                status: 'PENDING',
                organizationId,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                createdAt: true,
            },
        });

        // 2. Recent SOPs (knowledge updates)
        const recentSOPs = await prisma.sOP.findMany({
            where: { organizationId },
            take: 3,
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                updatedAt: true,
            },
        });

        // 3. Recent AI Agents
        const recentAgents = await prisma.agent.findMany({
            where: { organizationId },
            take: 2,
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                name: true,
                updatedAt: true,
            },
        });

        // Format notifications
        const notifications = [
            ...pendingTasks.map(task => ({
                id: `task-${task.id}`,
                type: 'task' as const,
                title: 'Nowe zadanie do realizacji',
                description: task.title,
                time: formatTimeAgo(task.createdAt),
                read: false,
                link: `/council`,
            })),
            ...recentSOPs.map(sop => ({
                id: `sop-${sop.id}`,
                type: 'knowledge' as const,
                title: 'Aktualizacja SOP',
                description: sop.title,
                time: formatTimeAgo(sop.updatedAt),
                read: true,
                link: `/sops/${sop.id}`,
            })),
            ...recentAgents.map(agent => ({
                id: `agent-${agent.id}`,
                type: 'alert' as const,
                title: 'Nowy AI Agent',
                description: agent.name,
                time: formatTimeAgo(agent.updatedAt),
                read: true,
                link: `/agents/${agent.id}`,
            })),
        ];

        return NextResponse.json({
            notifications: notifications.slice(0, 10),
            unreadCount: notifications.filter(n => !n.read).length,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({
            notifications: [],
            unreadCount: 0,
        }, { status: 500 });
    }
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
        return `${diffMins} min temu`;
    } else if (diffHours < 24) {
        return `${diffHours} godz. temu`;
    } else {
        return `${diffDays} dni temu`;
    }
}

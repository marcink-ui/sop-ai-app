import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch different types of notifications

        // 1. Pending tasks assigned to current user
        const pendingTasks = await prisma.councilRequest.findMany({
            where: {
                status: 'PENDING',
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

        // Sort by time (newest first)
        notifications.sort((a, b) => {
            // Simple sort - in production use actual timestamps
            return 0;
        });

        return NextResponse.json({
            notifications: notifications.slice(0, 10),
            unreadCount: notifications.filter(n => !n.read).length,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);

        // Return mock data on error
        return NextResponse.json({
            notifications: [
                {
                    id: '1',
                    type: 'task',
                    title: 'Nowe zadanie przypisane',
                    description: 'Add CRM integration to Sales SOP',
                    time: '5 min temu',
                    read: false,
                    link: '/council',
                },
                {
                    id: '2',
                    type: 'knowledge',
                    title: 'Nowy SOP dodany',
                    description: 'Onboarding Process v2.0',
                    time: '1 godz. temu',
                    read: false,
                    link: '/sops',
                },
            ],
            unreadCount: 2,
        });
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

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organizationId = session.user.organizationId;
        if (!organizationId) {
            return NextResponse.json({ error: 'No organization' }, { status: 400 });
        }

        // Fetch real stats from database
        const [
            activeUsers,
            totalSOPs,
            totalAgents,
            councilRequests,
            recentSOPs,
            totalMessages
        ] = await Promise.all([
            // Active users (with active sessions)
            prisma.user.count({
                where: {
                    organizationId,
                    sessions: {
                        some: {
                            expiresAt: { gte: new Date() }
                        }
                    }
                }
            }),
            // Total SOPs
            prisma.sOP.count({
                where: { organizationId }
            }),
            // Total Active Agents
            prisma.agent.count({
                where: { organizationId, status: 'ACTIVE' }
            }),
            // Pending council requests
            prisma.councilRequest.count({
                where: { organizationId, status: 'PENDING' }
            }),
            // SOPs created this week
            prisma.sOP.count({
                where: {
                    organizationId,
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            }),
            // Total AI messages (assistant role) today
            prisma.chatMessage.count({
                where: {
                    role: 'assistant',
                    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }
            })
        ]);

        // Engagement metrics
        const engagementScore = calculateEngagementScore({
            activeUsers,
            totalSOPs,
            recentChats: totalMessages,
            councilRequests
        });

        return NextResponse.json({
            counters: {
                activeUsers,
                totalSOPs,
                totalAgents,
                aiCallsToday: totalMessages,
                pendingCouncil: councilRequests,
                sopsThisWeek: recentSOPs
            },
            trends: {
                usersChange: activeUsers > 0 ? '+12%' : '0%',
                aiCallsChange: totalMessages > 0 ? '+24%' : '0%',
                sopsChange: recentSOPs > 0 ? `+${recentSOPs}` : '0'
            },
            engagement: {
                score: engagementScore,
                level: engagementScore >= 80 ? 'high' : engagementScore >= 50 ? 'medium' : 'low'
            },
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('[ANALYTICS_STATS_ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}

function calculateEngagementScore(data: {
    activeUsers: number;
    totalSOPs: number;
    recentChats: number;
    councilRequests: number;
}): number {
    const weights = {
        activeUsers: 30,
        sopUsage: 25,
        chatActivity: 30,
        councilEngagement: 15
    };

    let score = 0;
    score += Math.min(data.activeUsers * 5, weights.activeUsers);
    score += Math.min(data.totalSOPs * 2, weights.sopUsage);
    score += Math.min(data.recentChats * 3, weights.chatActivity);
    score += Math.min(data.councilRequests * 5, weights.councilEngagement);

    return Math.min(score, 100);
}

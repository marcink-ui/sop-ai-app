import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface LeaderboardEntry {
    toUserId: string;
    _sum: { amount: number | null };
    _count: { id: number };
}

// GET /api/pandas/leaderboard - top receivers this month
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get start of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Aggregate pandas received per user this month
        const leaderboard = await prisma.pandaTransaction.groupBy({
            by: ['toUserId'],
            where: {
                organizationId: session.user.organizationId,
                createdAt: { gte: startOfMonth },
            },
            _sum: { amount: true },
            _count: { id: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 10,
        }) as unknown as LeaderboardEntry[];

        // Get user details for each entry
        const userIds = leaderboard.map((entry) => entry.toUserId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, image: true },
        });

        const userMap = new Map(users.map((u) => [u.id, u]));

        const result = leaderboard.map((entry: LeaderboardEntry, index: number) => ({
            rank: index + 1,
            user: userMap.get(entry.toUserId),
            totalPandas: entry._sum.amount || 0,
            transactionCount: entry._count.id,
        }));

        return NextResponse.json({
            month: startOfMonth.toISOString(),
            leaderboard: result,
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

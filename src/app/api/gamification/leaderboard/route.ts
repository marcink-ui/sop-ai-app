import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// XP Values (same as stats route)
const XP_VALUES = {
    SOP_CREATED: 50,
    PANDA_SENT: 10,
    PANDA_RECEIVED: 20,
};

const LEVELS = [
    { level: 1, minXP: 0, title: 'Nowicjusz' },
    { level: 2, minXP: 100, title: 'Początkujący' },
    { level: 3, minXP: 300, title: 'Adept' },
    { level: 4, minXP: 600, title: 'Praktyk' },
    { level: 5, minXP: 1000, title: 'Ekspert' },
    { level: 6, minXP: 1500, title: 'Mistrz' },
    { level: 7, minXP: 2200, title: 'Guru' },
    { level: 8, minXP: 3000, title: 'Legenda' },
];

function getLevel(xp: number) {
    let currentLevel = LEVELS[0];
    for (const level of LEVELS) {
        if (xp >= level.minXP) currentLevel = level;
        else break;
    }
    return currentLevel;
}

interface UserXP {
    userId: string;
    name: string | null;
    email: string;
    image: string | null;
    xp: number;
    level: { level: number; title: string };
}

// GET /api/gamification/leaderboard - top users by XP
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgId = session.user.organizationId;

        // Get all users in org
        const users = await prisma.user.findMany({
            where: { organizationId: orgId },
            select: { id: true, name: true, email: true, image: true },
        });

        // Calculate XP for each user
        const userXPs: UserXP[] = await Promise.all(users.map(async (user) => {
            const sopsCreated = await prisma.sOP.count({
                where: { createdById: user.id, organizationId: orgId },
            });

            const pandasSent = await prisma.pandaTransaction.count({
                where: { fromUserId: user.id, organizationId: orgId },
            });

            const pandasReceived = await prisma.pandaTransaction.count({
                where: { toUserId: user.id, organizationId: orgId },
            });

            const xp =
                sopsCreated * XP_VALUES.SOP_CREATED +
                pandasSent * XP_VALUES.PANDA_SENT +
                pandasReceived * XP_VALUES.PANDA_RECEIVED;

            return {
                userId: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                xp,
                level: getLevel(xp),
            };
        }));

        // Sort by XP and take top 10
        const leaderboard = userXPs
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10)
            .map((user, index) => ({
                rank: index + 1,
                ...user,
            }));

        // Find current user's rank
        const currentUserId = session.user.id;
        const currentUserRank = userXPs
            .sort((a, b) => b.xp - a.xp)
            .findIndex(u => u.userId === currentUserId) + 1;

        return NextResponse.json({
            leaderboard,
            currentUser: {
                rank: currentUserRank,
                totalUsers: users.length,
            },
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

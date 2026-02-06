import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// XP Values
const XP_VALUES = {
    SOP_CREATED: 50,
    PANDA_SENT: 10,
    PANDA_RECEIVED: 20,
    TASK_COMPLETED: 15,
};

// Level thresholds
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

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'first_sop', name: '🎯 First SOP', description: 'Stwórz pierwszy SOP', xpBonus: 100, check: (stats: Stats) => stats.sopsCreated >= 1 },
    { id: 'panda_starter', name: '🐼 Panda Starter', description: 'Wyślij pierwszą pandę', xpBonus: 50, check: (stats: Stats) => stats.pandasSent >= 1 },
    { id: 'sop_master', name: '📚 SOP Master', description: 'Stwórz 10 SOPów', xpBonus: 500, check: (stats: Stats) => stats.sopsCreated >= 10 },
    { id: 'panda_champion', name: '💯 Panda Champion', description: 'Wyślij 50 pand', xpBonus: 300, check: (stats: Stats) => stats.pandasSent >= 50 },
    { id: 'popular', name: '⭐ Popular', description: 'Otrzymaj 20 pand', xpBonus: 200, check: (stats: Stats) => stats.pandasReceived >= 20 },
    { id: 'active_contributor', name: '🔥 Active Contributor', description: 'Zdobądź 500 XP', xpBonus: 100, check: (stats: Stats) => stats.baseXP >= 500 },
];

interface Stats {
    sopsCreated: number;
    pandasSent: number;
    pandasReceived: number;
    tasksCompleted: number;
    baseXP: number;
}

function calculateLevel(xp: number) {
    let currentLevel = LEVELS[0];
    for (const level of LEVELS) {
        if (xp >= level.minXP) {
            currentLevel = level;
        } else {
            break;
        }
    }
    const nextLevel = LEVELS.find(l => l.minXP > xp) || null;
    const progress = nextLevel
        ? ((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
        : 100;

    return { ...currentLevel, progress, nextLevel };
}

// GET /api/gamification/stats - user gamification stats
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const orgId = session.user.organizationId;

        // Count SOPs created
        const sopsCreated = await prisma.sOP.count({
            where: { createdById: userId, organizationId: orgId },
        });

        // Count pandas sent/received
        const pandasSent = await prisma.pandaTransaction.count({
            where: { fromUserId: userId, organizationId: orgId },
        });

        const pandasReceived = await prisma.pandaTransaction.count({
            where: { toUserId: userId, organizationId: orgId },
        });

        // Calculate base XP (without achievement bonuses)
        const baseXP =
            sopsCreated * XP_VALUES.SOP_CREATED +
            pandasSent * XP_VALUES.PANDA_SENT +
            pandasReceived * XP_VALUES.PANDA_RECEIVED;

        const stats: Stats = { sopsCreated, pandasSent, pandasReceived, tasksCompleted: 0, baseXP };

        // Calculate achievements
        const unlockedAchievements = ACHIEVEMENTS
            .filter(a => a.check(stats))
            .map(a => ({ id: a.id, name: a.name, description: a.description, xpBonus: a.xpBonus }));

        const achievementBonusXP = unlockedAchievements.reduce((sum, a) => sum + a.xpBonus, 0);
        const totalXP = baseXP + achievementBonusXP;

        // Calculate level
        const levelInfo = calculateLevel(totalXP);

        return NextResponse.json({
            xp: {
                total: totalXP,
                base: baseXP,
                achievements: achievementBonusXP,
            },
            level: levelInfo,
            stats: {
                sopsCreated,
                pandasSent,
                pandasReceived,
            },
            achievements: {
                unlocked: unlockedAchievements,
                total: ACHIEVEMENTS.length,
                all: ACHIEVEMENTS.map(a => ({
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    xpBonus: a.xpBonus,
                    unlocked: a.check(stats),
                })),
            },
        });
    } catch (error) {
        console.error('Error fetching gamification stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

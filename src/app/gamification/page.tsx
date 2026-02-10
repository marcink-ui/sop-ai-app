'use client';

import { useEffect, useState } from 'react';
import { XPCard } from '@/components/gamification/XPCard';
import { AchievementsGrid } from '@/components/gamification/AchievementsGrid';
import { GamificationLeaderboard } from '@/components/gamification/GamificationLeaderboard';
import { StatsCard } from '@/components/gamification/StatsCard';
import { Gamepad2, Loader2 } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

interface LevelInfo {
    level: number;
    title: string;
    minXP: number;
    progress: number;
    nextLevel: { level: number; title: string; minXP: number } | null;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    xpBonus: number;
    unlocked: boolean;
}

interface GamificationStats {
    xp: {
        total: number;
        base: number;
        achievements: number;
    };
    level: LevelInfo;
    stats: {
        sopsCreated: number;
        pandasSent: number;
        pandasReceived: number;
    };
    achievements: {
        unlocked: Achievement[];
        total: number;
        all: Achievement[];
    };
}

interface LeaderboardUser {
    rank: number;
    userId: string;
    name: string | null;
    email: string;
    image: string | null;
    xp: number;
    level: { level: number; title: string };
}

interface LeaderboardData {
    leaderboard: LeaderboardUser[];
    currentUser: {
        rank: number;
        totalUsers: number;
    };
}

export default function GamificationPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, leaderboardRes] = await Promise.all([
                    fetch('/api/gamification/stats'),
                    fetch('/api/gamification/leaderboard'),
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (leaderboardRes.ok) setLeaderboardData(await leaderboardRes.json());
            } catch (error) {
                console.error('Error fetching gamification data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-3">
                    <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gamification</h1>
                    <p className="text-sm text-muted-foreground">
                        Twoje XP, poziomy i osiągnięcia
                    </p>
                </div>
            </div>

            {stats && (
                <>
                    {/* Top Row: XP + Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <XPCard
                            totalXP={stats.xp.total}
                            baseXP={stats.xp.base}
                            achievementXP={stats.xp.achievements}
                            level={stats.level}
                        />
                        <StatsCard
                            sopsCreated={stats.stats.sopsCreated}
                            pandasSent={stats.stats.pandasSent}
                            pandasReceived={stats.stats.pandasReceived}
                        />
                    </div>

                    {/* Achievements */}
                    <AchievementsGrid
                        achievements={stats.achievements.all}
                        unlockedCount={stats.achievements.unlocked.length}
                    />

                    {/* Leaderboard */}
                    {leaderboardData && (
                        <GamificationLeaderboard
                            leaderboard={leaderboardData.leaderboard}
                            currentUserRank={leaderboardData.currentUser.rank}
                            totalUsers={leaderboardData.currentUser.totalUsers}
                            currentUserId={session?.user?.id || ''}
                        />
                    )}
                </>
            )}
        </div>
    );
}
